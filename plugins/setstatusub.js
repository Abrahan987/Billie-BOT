let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `🎌 *Ingrese el nuevo estado para el sub bot*`
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let owner = who.split`@`[0]
  let bot = global.conns.find(con => con.user.jid.split`@`[0] == owner)
  if (!bot) return m.reply(`*No se encontró ningún sub bot para el usuario @${owner}*`)
  await bot.updateAbout(text)
  m.reply(`*El estado del sub bot fue cambiado a ${text}*`)
}
handler.help = ["setstatusub"]
handler.tags = ["owner"]
handler.command = /^(setstatusub)$/i
export default handler
