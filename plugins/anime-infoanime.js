import fetch from 'node-fetch'

var handler = async (m, { conn, usedPrefix, command, text }) => {
if (!text) return conn.reply(m.chat, `☁︎ Ingresa el nombre de un anime para buscarlo. ☁︎`, m)
try {
await conn.reply(m.chat, `*Buscando...*`, m)
await m.react('🕒')
let res = await fetch('https://api.jikan.moe/v4/manga?q=' + text)
if (!res.ok) {
await m.react('✖️')
return conn.reply(m.chat, `☂︎ Ocurrió un error. ☂︎`, m)
}
let json = await res.json()
let { chapters, title_japanese, url, type, score, members, background, status, volumes, synopsis, favorites } = json.data[0]
let author = json.data[0].authors[0].name
let animeingfo = `*➪ Título:* ${title_japanese}\n` +
`*➪ Capítulos:* ${chapters}\n` +
`*➪ Tipo:* ${type}\n` +
`*➪ Estado:* ${status}\n` +
`*➪ Volúmenes:* ${volumes}\n` +
`*➪ Puntaje:* ${score}\n` +
`*➪ Sinopsis:* ${synopsis}\n` +
`*➪ Enlace:* ${url}`
await conn.sendFile(m.chat, json.data[0].images.jpg.image_url, 'anime.jpg', `*♫︎ Información del Anime ♫︎*\n\n` + animeingfo, m)
await m.react('✔️')
} catch (error) {
await m.react('✖️')
await conn.reply(m.chat, `☂︎ Ocurrió un error o no se encontraron resultados. ☂︎`, m)
}}

handler.help = ['infoanime'] 
handler.tags = ['anime']
handler.command = ['infoanime']
handler.group = true

export default handler
