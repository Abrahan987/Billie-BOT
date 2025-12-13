let handler = async (m, { conn, usedPrefix, command }) => {
if (!m.quoted) {
return conn.reply(m.chat, `☁︎ Responde a un sticker para convertirlo en imagen. ☁︎`, m)
}
await m.react('🕒')
let xx = m.quoted
let imgBuffer = await xx.download()   
if (!imgBuffer) {
await m.react('✖️')
return conn.reply(m.chat, `☂︎ No se pudo descargar el sticker. ☂︎`, m)
}
await conn.sendMessage(m.chat, { image: imgBuffer, caption: '*♫︎ ¡Aquí tienes tu imagen! ♫︎*' }, { quoted: m })
await m.react('✔️')
}

handler.help = ['toimg']
handler.tags = ['tools']
handler.command = ['toimg', 'jpg', 'img'] 

export default handler