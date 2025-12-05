import fetch from "node-fetch"
import yts from "yt-search"
import axios from "axios"
import crypto from "crypto"

const CONFIG = {
    CACHE_DURATION: 300000,
    MAX_DURATION: 1800,
    MAX_RETRIES: 2,
    REQUEST_TIMEOUT: 8000,
    MAX_FILENAME_LENGTH: 50,
    FAST_TIMEOUT: 3000
}

const cache = new Map()

setInterval(() => {
    const now = Date.now()
    for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CONFIG.CACHE_DURATION) {
            cache.delete(key)
        }
    }
}, 3600000)

const savetube = {
    api: {
        base: 'https://media.savetube.me/api',
        info: '/v2/info',
        download: '/download',
        cdn: '/random-cdn',
    },
    headers: {
        accept: '*/*',
        'content-type': 'application/json',
        origin: 'https://yt.savetube.me',
        referer: 'https://yt.savetube.me/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    crypto: {
        hexToBuffer: (hexString) => Buffer.from(hexString.match(/.{1,2}/g).join(''), 'hex'),
        decrypt: async (enc) => {
            const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12'
            const data = Buffer.from(enc, 'base64')
            const iv = data.slice(0, 16)
            const content = data.slice(16)
            const key = savetube.crypto.hexToBuffer(secretKey)
            const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv)
            const decrypted = Buffer.concat([decipher.update(content), decipher.final()])
            try {
                return JSON.parse(decrypted.toString())
            } catch {
                return { title: 'Desconocido', duration: '??', key: null }
            }
        },
    },
    isUrl: (str) => {
        try {
            new URL(str)
            return /youtube.com|youtu.be/.test(str)
        } catch {
            return false
        }
    },
    youtube: (url) => {
        const patterns = [
            /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
            /youtu\.be\/([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
        ]
        for (let p of patterns) {
            if (p.test(url)) return url.match(p)[1]
        }
        return null
    },
    request: async (endpoint, data = {}, method = 'post', timeout = CONFIG.REQUEST_TIMEOUT) => {
        try {
            const source = axios.CancelToken.source()
            const timeoutId = setTimeout(() => {
                source.cancel('Timeout')
            }, timeout)

            const { data: res } = await axios({
                method,
                url: `${endpoint.startsWith('http') ? '' : savetube.api.base}${endpoint}`,
                data: method === 'post' ? data : undefined,
                params: method === 'get' ? data : undefined,
                headers: savetube.headers,
                timeout: timeout,
                cancelToken: source.token,
                validateStatus: function (status) {
                    return status >= 200 && status < 300
                }
            })

            clearTimeout(timeoutId)
            return { status: true, data: res }
        } catch (err) {
            return { status: false, error: err.message }
        }
    },
    getCDN: async () => {
        const cacheKey = 'savetube_cdn';
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < 300000) {
            return { status: true, data: cached.data };
        }

        const knownServers = ['s1.savetube.me', 's2.savetube.me', 'media.savetube.me'];

        const checkServer = async (server) => {
            try {
                const response = await fetch(`https://${server}/health`, { method: 'HEAD', timeout: 2000 });
                if (response.ok) return server;
            } catch (e) {
                // Ignorar errores y dejar que Promise.race continúe
            }
            return Promise.reject(); // Rechazar si el servidor no está disponible
        };

        try {
            const promises = knownServers.map(checkServer);
            const apiPromise = savetube.request(savetube.api.cdn, {}, 'get', CONFIG.FAST_TIMEOUT)
                .then(r => r.status ? r.data.cdn : Promise.reject());
            promises.push(apiPromise);

            const fastestServer = await Promise.race(promises);

            console.log('\x1b[32m%s\x1b[0m', '[CDN]', `Usando servidor: ${fastestServer}`);
            cache.set(cacheKey, { data: fastestServer, timestamp: Date.now() });
            return { status: true, data: fastestServer };

        } catch (error) {
            const fallback = 's1.savetube.me';
            console.log('\x1b[33m%s\x1b[0m', '[CDN-FALLBACK]', `Usando servidor de respaldo: ${fallback}`);
            cache.set(cacheKey, { data: fallback, timestamp: Date.now() });
            return { status: true, data: fallback };
        }
    },
    download: async (link, type = 'audio') => {
        if (!savetube.isUrl(link)) return { status: false, error: 'URL inválida' }

        const id = savetube.youtube(link)
        if (!id) return { status: false, error: 'No se pudo obtener ID del video' }

        try {
            const cdnx = await savetube.getCDN()
            if (!cdnx.status) {
                throw new Error('No se pudo obtener CDN')
            }

            const cdn = cdnx.data

            const infoEndpoints = [
                `${savetube.api.info}`,
                `/info`,
                `/v1/info`
            ];

            const infoPromises = infoEndpoints.map(endpoint =>
                savetube.request(`https://${cdn}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`, {
                    url: `https://www.youtube.com/watch?v=${id}`,
                }, 'post', 5000).then(result => {
                    if (result.status && result.data?.data) {
                        return result;
                    }
                    return Promise.reject('Invalid data');
                })
            );

            let info;
            try {
                info = await Promise.any(infoPromises);
            } catch (error) {
                throw new Error('No se pudo obtener info del video desde ningún endpoint');
            }

            const decrypted = await savetube.crypto.decrypt(info.data.data)

            if (!decrypted.key) {
                throw new Error('No se pudo desencriptar la clave del video')
            }

            const downloadData = await savetube.request(`https://${cdn}${savetube.api.download}`, {
                id,
                downloadType: type === 'audio' ? 'audio' : 'video',
                quality: type === 'audio' ? '128' : '720',
                key: decrypted.key,
            })

            const url = downloadData.data?.data?.downloadUrl
            if (!url) throw new Error('No se pudo generar enlace de descarga')

            return {
                status: true,
                result: {
                    title: decrypted.title || 'Desconocido',
                    download: url,
                    duration: decrypted.duration || '??',
                },
            }
        } catch (err) {
            console.log('\x1b[31m%s\x1b[0m', '[ERROR]', err.message)
            return { status: false, error: err.message }
        }
    },
}

const handler = async (m, { conn, args, command }) => {
    try {
        const text = args.join(" ").trim()

        if (!text) {
            return conn.reply(
                m.chat,
                "ꕤ Por favor, ingresa el nombre de la música a descargar.",
                m
            )
        }

        // Console.log con color para búsqueda
        console.log('\x1b[36m%s\x1b[0m', '[BUSCANDO]', text)
        await conn.reply(m.chat, "ꕤ Buscando...", m)

        const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
        const query = videoMatch ? `https://youtu.be/${videoMatch[1]}` : text

        const cacheKey = `search_${Buffer.from(query).toString("base64")}`
        let result

        if (cache.has(cacheKey)) {
            const c = cache.get(cacheKey)
            if (Date.now() - c.timestamp < CONFIG.CACHE_DURATION) {
                result = c.data
                console.log('\x1b[32m%s\x1b[0m', '[CACHE]', 'Resultado encontrado en caché')
            } else {
                cache.delete(cacheKey)
            }
        }

        if (!result) {
            // Usar método más confiable para búsqueda
            try {
                const search = await yts(query)
                result = videoMatch
                    ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0]
                    : search.all[0]

                if (!result) {
                    return conn.reply(m.chat, "ꕤ *Elemento no encontrado:* No hubo resultados.", m)
                }

                cache.set(cacheKey, { data: result, timestamp: Date.now() })
                console.log('\x1b[32m%s\x1b[0m', '[ENCONTRADO]', result.title)
            } catch (searchError) {
                console.error('\x1b[31m%s\x1b[0m', '[BUSQUEDA-ERROR]', searchError.message)
                return conn.reply(m.chat, "ꕤ *Error en búsqueda:* Intenta nuevamente.", m)
            }
        }

        const { title, thumbnail, timestamp, views, ago, url, author, seconds } = result

        if (seconds > CONFIG.MAX_DURATION) {
            return conn.reply(
                m.chat,
                "ꕤ *Elemento no encontrado:* El contenido supera 30 minutos.",
                m
            )
        }

        const isAudio = ["play", "yta", "ytmp3", "playaudio", "ytaudio"].includes(command)

        const info = `
\`– DETALLES DE CONTENIDO –\`

*✐ Título »* ${title}
*❖ Canal »* ${author.name}
*✰ Vistas »* ${formatViews(views)}
*ⴵ Duración »* ${timestamp}
*ꕤ Publicado »* ${ago}
*❒ Link »* ${url}

> ꕤ Preparando tu descarga...
`.trim()

        await conn.sendMessage(m.chat, {
            image: { url: thumbnail },
            caption: info
        }, { quoted: m })

        console.log('\x1b[36m%s\x1b[0m', '[DESCARGANDO]', `${isAudio ? 'AUDIO' : 'VIDEO'}`)

        // Usar método original pero optimizado
        const mediaResult = await processDownloadWithRetry(isAudio, url)

        if (!mediaResult?.status || !mediaResult?.result?.download) {
            return conn.reply(
                m.chat,
                "ꕤ *Elemento no encontrado:* No se pudo obtener el archivo.",
                m
            )
        }

        const { download } = mediaResult.result
        const fileName = cleanFileName(title)

        if (isAudio) {
            await conn.sendMessage(
                m.chat,
                {
                    audio: { url: download },
                    fileName: `${fileName}.mp3`,
                    mimetype: "audio/mpeg"
                },
                { quoted: m }
            )
        } else {
            await conn.sendMessage(
                m.chat,
                {
                    video: { url: download },
                    caption: `> ꕤ ${title}`,
                    fileName: `${fileName}.mp4`,
                    mimetype: "video/mp4"
                },
                { quoted: m }
            )
        }

        console.log('\x1b[32m%s\x1b[0m', '[COMPLETADO]', 'Archivo enviado exitosamente')

    } catch (e) {
        console.error('\x1b[31m%s\x1b[0m', '[ERROR-FINAL]', e.message)
        conn.reply(m.chat, "ꕤ *Elemento no encontrado:* Error inesperado.", m)
    }
}

async function processDownloadWithRetry(isAudio, url, retryCount = 0) {
    const type = isAudio ? 'audio' : 'video'
    console.log('\x1b[33m%s\x1b[0m', '[INTENTO]', `Intento ${retryCount + 1}`)

    const result = await savetube.download(url, type)

    if (!result.status && retryCount < CONFIG.MAX_RETRIES) {
        console.log('\x1b[33m%s\x1b[0m', '[REINTENTANDO]', `Esperando 1 segundo...`)
        await sleep(1000)
        return processDownloadWithRetry(isAudio, url, retryCount + 1)
    }

    return result
}

function cleanFileName(n) {
    return n.replace(/[<>:"/\\|?*]/g, "").substring(0, CONFIG.MAX_FILENAME_LENGTH)
}

function formatViews(v) {
    if (!v) return "No disponible"
    if (v >= 1e9) return (v / 1e9).toFixed(1) + "B"
    if (v >= 1e6) return (v / 1e6).toFixed(1) + "M"
    if (v >= 1e3) return (v / 1e3).toFixed(1) + "K"
    return v.toString()
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

handler.help = ["play", "yta", "ytmp3", "play2", "ytv", "ytmp4"]
handler.tags = ["descargas"]
handler.command = ["play","yta","ytmp3","play2","ytv","ytmp4","playaudio","mp4","ytaudio"]
handler.limit = true

export default handler