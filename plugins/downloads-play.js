import yts from "yt-search"
import axios from "axios"
import crypto from "crypto"

const CONFIG = {
    CACHE_DURATION: 300000,
    MAX_DURATION: 1800,
    MAX_RETRIES: 2,
    REQUEST_TIMEOUT: 6000,
    MAX_FILENAME_LENGTH: 50,
    FAST_TIMEOUT: 2000
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
    request: async (endpoint, data = {}, method = 'post') => {
        try {
            const { data: res } = await axios({
                method,
                url: `${endpoint.startsWith('http') ? '' : savetube.api.base}${endpoint}`,
                data: method === 'post' ? data : undefined,
                params: method === 'get' ? data : undefined,
                headers: savetube.headers,
                timeout: CONFIG.REQUEST_TIMEOUT,
            })
            return { status: true, data: res }
        } catch (err) {
            return { status: false, error: err.message }
        }
    },
    getCDN: async () => {
        const cacheKey = 'savetube_cdn'
        const cached = cache.get(cacheKey)

        if (cached && Date.now() - cached.timestamp < 300000) {
            return { status: true, data: cached.data }
        }

        const r = await savetube.request(savetube.api.cdn, {}, 'get')
        if (!r.status) return r

        cache.set(cacheKey, { data: r.data.cdn, timestamp: Date.now() })

        return { status: true, data: r.data.cdn }
    },
    download: async (link, type = 'audio') => {
        if (!savetube.isUrl(link)) return { status: false, error: 'URL inválida' }

        const id = savetube.youtube(link)
        if (!id) return { status: false, error: 'No se pudo obtener ID del video' }

        try {
            const cdnx = await savetube.getCDN()
            if (!cdnx.status) throw new Error('No se pudo obtener CDN')

            const cdn = cdnx.data

            const info = await savetube.request(`https://${cdn}${savetube.api.info}`, {
                url: `https://www.youtube.com/watch?v=${id}`,
            })

            if (!info.status || !info.data?.data) {
                throw new Error('No se pudo obtener info del video')
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

        const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
        const query = videoMatch ? `https://youtu.be/${videoMatch[1]}` : text

        const cacheKey = `search_${Buffer.from(query).toString("base64")}`
        let result

        if (cache.has(cacheKey)) {
            const c = cache.get(cacheKey)
            if (Date.now() - c.timestamp < CONFIG.CACHE_DURATION) result = c.data
            else cache.delete(cacheKey)
        }

        if (!result) {
            const search = await yts(query)
            result = videoMatch
                ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0]
                : search.all[0]

            if (!result) {
                return conn.reply(m.chat, "ꕤ *Elemento no encontrado:* No hubo resultados.", m)
            }

            cache.set(cacheKey, { data: result, timestamp: Date.now() })
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

    } catch (e) {
        console.error(e)
        conn.reply(m.chat, `ꕤ *Elemento no encontrado:* ${e.message}`, m)
    }
}

async function processDownloadWithRetry(isAudio, url, retryCount = 0) {
    const type = isAudio ? 'audio' : 'video'
    const result = await savetube.download(url, type)

    if (!result.status && retryCount < CONFIG.MAX_RETRIES) {
        await sleep(1500)
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
