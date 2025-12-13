import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix }) => {
try {
if (!text) return conn.reply(m.chat, `☁︎ Ingresa el nombre de un Pokémon para buscar. ☁︎`, m)
const url = `https://some-random-api.com/pokemon/pokedex?pokemon=${encodeURIComponent(text)}`
await conn.reply(m.chat, `*Buscando...*`, m)
await m.react('🕒')
const response = await fetch(url)
const json = await response.json()
if (!response.ok) return conn.reply(m.chat, '☂︎ Ocurrió un error. ☂︎', m)
const aipokedex = `*♫︎ Pokédex ♫︎*\n\n` +
`*➪ Nombre:* ${json.name}\n` +
`*➪ ID:* ${json.id}\n` +
`*➪ Tipo:* ${json.type}\n` +
`*➪ Habilidades:* ${json.abilities}\n` +
`*➪ Altura:* ${json.height}\n` +
`*➪ Peso:* ${json.weight}\n` +
`*➪ Descripción:* ${json.description}`
conn.reply(m.chat, aipokedex, m)
await m.react('✔️')
} catch (error) {
await m.react('✖️')
await conn.reply(m.chat, `☂︎ Ocurrió un error o no se encontró el Pokémon. ☂︎`, m)
}}

handler.help = ['pokedex']
handler.tags = ['fun']
handler.command = ['pokedex']
handler.group = true

export default handler