import fetch from "node-fetch";
import yts from 'yt-search';

const API_BASE = 'http://64.20.54.50:30104/api/download/youtube';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text?.trim()) {
            return await conn.reply(m.chat,
                `🌸 *ᴍᴇʟᴏᴅʏ ᴍᴜsɪᴄ* 🌸\n\n` +
                `✨ *Uso Correcto:*\n` +
                `${usedPrefix + command} <nombre de canción o URL de YouTube>\n\n` +
                `📝 *Ejemplo:*\n` +
                `• ${usedPrefix + command} Bad Bunny - Titi Me Pregunto`,
                m
            );
        }

        await handleSearch(m, conn, text, usedPrefix);

    } catch (error) {
        console.error('❌ Error en el handler principal:', error);
        await m.react('❌');
        return await conn.reply(m.chat,
            `🍓 *Error Inesperado*\n\n` +
            `Ocurrió un problema. Por favor, intenta de nuevo más tarde.`,
            m
        );
    }
};

async function handleSearch(m, conn, text, usedPrefix) {
    await m.react('🔍');

    const ytRegex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/;
    const match = text.match(ytRegex);
    const searchQuery = match ? `https://youtu.be/${match[1]}` : text.trim();

    const searchResults = await yts(searchQuery);
    const videoData = match ? searchResults.videos.find(v => v.videoId === match[1]) : searchResults.all[0];

    if (!videoData) {
        await m.react('❌');
        return await conn.reply(m.chat,
            `🍓 *No se encontraron resultados*\n\n` +
            `✨ Intenta con otro nombre o un enlace válido de YouTube.`,
            m
        );
    }

    if (videoData.seconds > 1800) { // Límite de 30 minutos
        await m.react('⏰');
        return await conn.reply(m.chat,
            `⚠️ *Video Muy Largo*\n\n` +
            `📹 *Título:* ${videoData.title}\n` +
            `⏱️ *Duración:* ${videoData.timestamp}\n` +
            `🚫 *Límite:* 30 minutos`,
            m
        );
    }

    const infoMessage =
        `🌸 *ᴍᴇʟᴏᴅʏ ᴍᴜsɪᴄ* 🌸\n\n` +
        `📌 *Título:* ${videoData.title}\n` +
        `👤 *Canal:* ${videoData.author.name}\n` +
        `⏱️ *Duración:* ${videoData.timestamp}\n` +
        `👁️ *Vistas:* ${formatNumber(videoData.views)}\n` +
        `📅 *Publicado:* ${videoData.ago}\n\n` +
        `✨ *Selecciona el formato que deseas descargar.*`;

    const buttons = [
        { buttonId: `${usedPrefix}yta ${videoData.url}`, buttonText: { displayText: '🎵 Audio (MP3)' }, type: 1 },
        { buttonId: `${usedPrefix}ytv ${videoData.url}`, buttonText: { displayText: '🎬 Video (MP4)' }, type: 1 }
    ];

    const buttonMessage = {
        image: { url: videoData.thumbnail },
        caption: infoMessage,
        footer: 'Presiona un botón para iniciar la descarga',
        buttons: buttons,
        headerType: 4
    };

    await conn.sendMessage(m.chat, buttonMessage, { quoted: m });
    await m.react('✅');
}

async function handleDownload(m, conn, url, command) {
    const isAudio = ['yta', 'ytmp3'].includes(command);
    const downloadType = isAudio ? 'audio' : 'video';

    await m.react('⏳');

    const processingMsg = await conn.reply(m.chat,
        `🌸 *Descargando ${downloadType}...*\n\n` +
        `✨ *Tu archivo se está preparando.*\n` +
        `⏳ *Esto puede tomar un momento...*`,
        m
    );

    const endpoint = isAudio ? 'mp3' : 'mp4';
    const downloadUrl = `${API_BASE}/${endpoint}?url=${encodeURIComponent(url)}`;

    try {
        const fileName = `Melody Music - ${isAudio ? 'audio' : 'video'}`;
        if (isAudio) {
            await conn.sendMessage(m.chat, {
                audio: { url: downloadUrl },
                fileName: `${fileName}.mp3`,
                mimetype: 'audio/mpeg'
            }, { quoted: m });
            await m.react('🎵');
        } else {
            await conn.sendMessage(m.chat, {
                video: { url: downloadUrl },
                caption: `🌸 *¡Video descargado con éxito!* 🌸`,
                fileName: `${fileName}.mp4`,
                mimetype: 'video/mp4'
            }, { quoted: m });
            await m.react('🎬');
        }

        await conn.sendMessage(m.chat, { delete: processingMsg.key });

    } catch (downloadError) {
        console.error('❌ Error en la descarga:', downloadError);
        await conn.sendMessage(m.chat, { delete: processingMsg.key });
        await m.react('❌');
        await conn.reply(m.chat,
            `🍓 *Error en la Descarga*\n\n` +
            `No se pudo obtener el archivo del servidor. Por favor, intenta con otro video.`,
            m
        );
    }
}

// Este handler se activa ANTES que los comandos normales
handler.before = async (m, { conn, usedPrefix }) => {
    // Extraer el ID del botón presionado
    const selectedButtonId = m.message?.buttonsResponseMessage?.selectedButtonId || m.message?.templateButtonReplyMessage?.selectedId;

    if (selectedButtonId) {
        // Verificar si es un comando de este plugin
        const isYtaCommand = selectedButtonId.startsWith(`${usedPrefix}yta`);
        const isYtvCommand = selectedButtonId.startsWith(`${usedPrefix}ytv`);

        if (isYtaCommand || isYtvCommand) {
            // Es un comando de descarga de este plugin, lo manejamos aquí
            const [rawCommand, ...args] = selectedButtonId.split(' ');
            const command = rawCommand.replace(usedPrefix, '').toLowerCase();
            const url = args.join(' ');

            if (url) {
                // Llamar a la función de descarga
                await handleDownload(m, conn, url, command);
            }

            // Retornar true para detener el procesamiento posterior
            return true;
        }
    }
    // Si no es una respuesta de botón para este plugin, no hacer nada
    return false;
};

function formatNumber(num) {
    if (!num) return '0';
    const n = parseInt(num);
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
}

handler.command = ['play', 'song', 'música', 'music', 'yta', 'ytmp3', 'ytv', 'ytmp4'];
handler.help = ['play <canción/url>'];
handler.tags = ['descargas'];
handler.group = true;

export default handler;
