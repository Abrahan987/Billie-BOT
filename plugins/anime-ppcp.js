import fetch from "node-fetch"

let handler = async (m, { conn, usedPrefix }) => {
try {
await conn.reply(m.chat, `*Buscando...*`, m)
await m.react('🕒')
let data = await (await fetch('https://raw.githubusercontent.com/ShirokamiRyzen/WAbot-DB/main/fitur_db/ppcp.json')).json()
let cita = data[Math.floor(Math.random() * data.length)]
let cowi = await (await fetch(cita.cowo)).buffer()
await conn.sendFile(m.chat, cowi, '', '♪ Para el chico ♪', m)
let ciwi = await (await fetch(cita.cewe)).buffer()
await conn.sendFile(m.chat, ciwi, '', '♫︎ Para la chica ♫︎', m)
await m.react('✔️')
} catch (error) {
await m.react('✖️')
await conn.reply(m.chat, `☂︎ Ocurrió un error. ☂︎\n\n${error.message}`, m)
}}

handler.help = ['ppcouple']
handler.tags = ['anime']
handler.command = ['ppcp', 'ppcouple']
handler.group = true

export default handler
