import axios from 'axios'
import fetch from 'node-fetch'

const handler = async (m, { conn, text, usedPrefix }) => {
if (!text) return m.reply("✳️ Por favor, proporciona el nombre de una canción o artista.")
try {
await m.react('🕒')
const res = await axios.get(`${global.APIs.adonix.url}/download/spotify?apikey=${global.APIs.adonix.key}&q=${encodeURIComponent(text)}`)
if (!res.data?.status || !res.data?.song || !res.data?.downloadUrl) throw new Error("No se encontró la canción en Adonix.")
const s = res.data.song
const data = { title: s.title || "Desconocido", artist: s.artist || "Desconocido", duration: s.duration || "Desconocido", image: s.thumbnail || null, download: res.data.downloadUrl, url: s.spotifyUrl || text }
const caption = `*Descargando:* <${data.title}>\n\n*Autor:* ${data.artist}\n*Duración:* ${data.duration}\n*Enlace:* ${data.url}`
const bannerBuffer = data.image ? await (await fetch(data.image)).buffer() : null
await conn.sendMessage(m.chat, {
text: caption,
contextInfo: {
externalAdReply: {
title: 'Spotify Music',
body: dev,
mediaType: 1,
mediaUrl: data.url,
sourceUrl: data.url,
thumbnail: bannerBuffer,
showAdAttribution: false,
containsAutoReply: true,
renderLargerThumbnail: true
}}}, { quoted: m })
await conn.sendMessage(m.chat, { audio: { url: data.download }, fileName: `${data.title}.mp3`, mimetype: 'audio/mpeg' }, { quoted: m })
await m.react('✔️')
} catch (err) {
await m.react('✖️')
m.reply(`Error: Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${err.message}`)
}}

handler.help = ["spotify"]
handler.tags = ["download"]
handler.command = ["spotify", "splay"]

export default handler
