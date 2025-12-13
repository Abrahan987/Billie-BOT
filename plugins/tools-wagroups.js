import fetch from 'node-fetch'

const handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) return conn.reply(m.chat, `☁︎ Escribe el nombre del grupo que quieres buscar. ☁︎\n> *Ejemplo:* ${usedPrefix + command} Música`, m)
await conn.reply(m.chat, `*Buscando...*`, m)
await m.react('🕒') 
try {
const res = await fetch(`${global.APIs.adonix.url}/search/wpgroups?apikey=${global.APIs.adonix.key}&q=${encodeURIComponent(text)}`)
const json = await res.json()
if (!json.status || !json.data || json.data.length === 0) return conn.reply(m.chat, `☂︎ No se encontraron grupos con ese nombre. ☂︎`, m)
let message = `*♫︎ Grupos Encontrados para: ${text} ♫︎*\n\n`
json.data.slice(0, 10).forEach((g, i) => {
message += `*${i + 1}. ${g.name}*\n`
message += `*Enlace:* ${g.link}\n\n`
})
conn.sendMessage(m.chat, { text: message }, { quoted: m })
} catch (e) {
conn.reply(m.chat, '☂︎ Ocurrió un error al buscar los grupos. ☂︎', m)
}}

handler.command = ['wagroups']
handler.tags = ['search']
handler.help = ['wpgroups', 'wagroups', 'wgrupos']

export default handler
