import translate from '@vitalets/google-translate-api'
import fetch from 'node-fetch'

const handler = async (m, { args, usedPrefix, command }) => {
const defaultLang = 'es'
const msg = `☁︎ Ingresa el idioma y el texto que quieres traducir. ☁︎\n> *Ejemplo:* ${usedPrefix + command} en Hello World`
if (!args || !args[0]) {
if (m.quoted && m.quoted.text) {
args = [defaultLang, m.quoted.text]
} else {
return m.reply(msg)
}}
let lang = args[0]
let text = args.slice(1).join(' ')
if ((args[0] || '').length !== 2) {
lang = defaultLang
text = args.join(' ')
}
try {
await conn.reply(m.chat, `*Traduciendo...*`, m)
await m.react('🕒')
const result = await translate(`${text}`, { to: lang, autoCorrect: true })
await conn.reply(m.chat, result.text, m)
await m.react('✔️')
} catch (error) {
await m.react('✖️')
m.reply(`☂︎ Ocurrió un error. ☂︎\n\n${error.message}`)
}}

handler.help = ['translate']
handler.tags = ['tools']
handler.command = ['translate', 'traducir', 'trad']
handler.group = true

export default handler