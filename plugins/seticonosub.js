let handler = async (m, { conn, args, usedPrefix, command }) => {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let owner = who.split`@`[0]
  let bot = global.conns.find(con => con.user.jid.split`@`[0] == owner)
  if (!bot) return m.reply(`*No se encontró ningún sub bot para el usuario @${owner}*`)
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || q.mediaType || ''
  if (/image/.test(mime)) {
    let img = await q.download()
    if (!img) throw `*Responda a una imagen*`
    await bot.updateProfilePicture(who, img)
    m.reply(`*La imagen del sub bot fue cambiada*`)
  } else if (args[0] && args[0].match(/https?:\/\//)) {
    await bot.updateProfilePicture(who, { url: args[0] })
    m.reply(`*La imagen del sub bot fue cambiada*`)
  } else {
    throw `*Responda a una imagen o ingrese la URL de una imagen*`
  }
}
handler.help = ["seticonosub"]
handler.tags = ["owner"]
handler.command = /^(seticonosub)$/i
export default handler
