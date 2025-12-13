import axios from 'axios'
import cheerio from 'cheerio'

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) {
await conn.reply(m.chat, `☁︎ Ingresa un término para buscar en Wikipedia. ☁︎`, m)
return
}
try {
await conn.reply(m.chat, `*Buscando...*`, m)
await m.react('🕒')
const link = await axios.get(`https://es.wikipedia.org/wiki/${text}`)
const $ = cheerio.load(link.data)
let wik = $('#firstHeading').text().trim()
let resulw = $('#mw-content-text > div.mw-parser-output').find('p').text().trim()
await m.reply(`*♫︎ Wikipedia ♫︎*\n\n*Búsqueda:* ${wik}\n\n${resulw}`)
await m.react('✔️')
} catch (e) {
await m.react('✖️')
await m.reply(`☂︎ Ocurrió un error o no se encontraron resultados. ☂︎`, m)
}}

handler.help = ['wikipedia']
handler.tags = ['tools']
handler.command = ['wiki', 'wikipedia'] 
handler.group = true

export default handler