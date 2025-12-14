
let handler = async (m, { conn, command }) => {
  let settings = global.db.data.settings[conn.user.jid]
  if (!settings) settings = global.db.data.settings[conn.user.jid] = {}

  switch (command) {
    case 'setmenuvideo':
      settings.menutype = 'video'
      m.reply('Menu type set to video.')
      break
    case 'setmenuimagen':
      settings.menutype = 'imagen'
      m.reply('Menu type set to image.')
      break
  }
}
handler.help = ['setmenuvideo', 'setmenuimagen']
handler.tags = ['owner']
handler.command = /^(setmenu(video|imagen))$/i
handler.owner = true

export default handler
