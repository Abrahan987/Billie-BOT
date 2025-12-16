let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (conn.user.jid !== global.mainBotJid) return
  let owner = m.sender.split`@`[0]
  let bot = global.conns.find(con => con.user.jid.split`@`[0] == owner)
  if (!bot) return m.reply(`*No se encontró ningún sub bot para el usuario @${owner}*`, false, { mentions: [m.sender] })
  if (!text) throw `🎌 *Ingrese el nuevo nombre para el sub bot*`
  let settings = global.db.data.settings[bot.user.jid]
  if (!settings) return m.reply(`*No se encontró la configuración para el sub bot*`)
  settings.botname = text
  m.reply(`*El nombre del sub bot fue cambiado a ${text}*`)
}
handler.help = ["setnamesub"]
handler.tags = ["subbot"]
handler.command = /^(setnamesub)$/i
export default handler
