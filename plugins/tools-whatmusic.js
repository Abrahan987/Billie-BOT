import acrcloud from "acrcloud"

const acr = new acrcloud({ host: "identify-ap-southeast-1.acrcloud.com", access_key: "ee1b81b47cf98cd73a0072a761558ab1", access_secret: "ya9OPe8onFAnNkyf9xMTK8qRyMGmsghfuHrIMmUI" })
let handler = async (m, { conn, text, usedPrefix, command }) => {
let q = m.quoted ? m.quoted : m
if (!q.mimetype || (!q.mimetype.includes("audio") && !q.mimetype.includes("video"))) {
return m.reply("☁︎ Responde al audio o video del que quieres saber el nombre. ☁︎")
}
let buffer = await q.download()
try {
await conn.reply(m.chat, `*Buscando...*`, m)
await m.react('🕒')
let data = await whatmusic(buffer)
if (!data.length) {
await m.react('✖️')
return m.reply("☂︎ No se encontró la canción. ☂︎")
}
let cap = "*♫︎ ¡Canción Encontrada! ♫︎*\n\n"
for (let result of data) {
const enlaces = Array.isArray(result.url) ? result.url.filter(x => x) : []
cap += `*➪ Título:* ${result.title}\n`
cap += `*➪ Artista:* ${result.artist}\n`
cap += `*➪ Duración:* ${result.duration}\n`
if (enlaces.length) cap += `*➪ Enlaces:*\n${enlaces.join("\n")}\n\n`
}
await conn.relayMessage(m.chat, {
extendedTextMessage: {
text: cap.trim(),
contextInfo: {
externalAdReply: {
title: '♪ WhatMusic ♪',
body: global.dev,
mediaType: 1,
previewType: 0,
renderLargerThumbnail: true,
thumbnail: await (await fetch('https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742781294508.jpeg')).buffer(),
sourceUrl: global.redes
}}}}, { quoted: m })
await m.react('✔️')
} catch (error) {
await m.react('✖️')
m.reply(`☂︎ Ocurrió un error. ☂︎\n\n` + error.message)
}}

handler.help = ["whatmusic"]
handler.tags = ["tools"]
handler.command = ["whatmusic", "shazam"]
handler.group = true

export default handler

async function whatmusic(buffer) {
let res = await acr.identify(buffer)
let data = res?.metadata
if (!data || !Array.isArray(data.music)) return []
return data.music.map(a => ({ title: a.title, artist: a.artists?.[0]?.name || "Desconocido", duration: toTime(a.duration_ms), url: Object.keys(a.external_metadata || {}).map(i => i === "youtube" ? "https://youtu.be/" + a.external_metadata[i].vid : i === "deezer" ? "https://www.deezer.com/us/track/" + a.external_metadata[i].track.id : i === "spotify" ? "https://open.spotify.com/track/" + a.external_metadata[i].track.id : "").filter(Boolean) }))
}
function toTime(ms) {
if (!ms || typeof ms !== "number") return "00:00"
let m = Math.floor(ms / 60000)
let s = Math.floor((ms % 60000) / 1000)
return [m, s].map(v => v.toString().padStart(2, "0")).join(":")
}