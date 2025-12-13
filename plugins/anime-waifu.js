import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command }) => {
try {
await conn.reply(m.chat, `*Buscando...*`, m)
await m.react('🕒')
let res = await fetch('https://api.waifu.pics/sfw/waifu')
if (!res.ok) return
let json = await res.json()
if (!json.url) return
await conn.sendFile(m.chat, json.url, 'thumbnail.jpg', '*♫︎ ¡Aquí tienes tu Waifu! ♫︎*', m)
await m.react('✔️')
} catch (error) {
await m.react('✖️')
await conn.reply(m.chat, `☂︎ Ocurrió un error. ☂︎\n\n${error.message}`, m)
}}

handler.help = ['waifu']
handler.tags = ['anime']
handler.command = ['waifu']
handler.group = true

export default handler