let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (conn.user.jid !== global.mainBotJid) return
  let owner = m.sender.split`@`[0]
  let bot = global.conns.find(con => con.user.jid.split`@`[0] == owner)
  if (!bot) return m.reply(`*No se encontró ningún sub bot para el usuario @${owner}*`, false, { mentions: [m.sender] })
  if (!args[0]) throw `🎌 *Ingrese la URL de la imagen para el icono*`
  let settings = global.db.data.settings[bot.user.jid]
  if (!settings) return m.reply(`*No se encontró la configuración para el sub bot*`)
  if (!args[0].match(/https?:\/\//)) throw `*La URL debe comenzar con http o https*`
  settings.icono = args[0]
  m.reply(`*El icono del sub bot fue cambiado*`)
}
handler.help = ["seticonosub"]
handler.tags = ["subbot"]
handler.command = /^(seticonosub)$/i
export default handler
