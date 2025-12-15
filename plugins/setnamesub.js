let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `🎌 *Ingrese el nuevo nombre para el sub bot*`
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let owner = who.split`@`[0]
  let bot = global.conns.find(con => con.user.jid.split`@`[0] == owner)
  if (!bot) return m.reply(`*No se encontró ningún sub bot para el usuario @${owner}*`)
  await bot.updateProfileName(text)
  m.reply(`*El nombre del sub bot fue cambiado a ${text}*`)
}
handler.help = ["setnamesub"]
handler.tags = ["owner"]
handler.command = /^(setnamesub)$/i
export default handler
