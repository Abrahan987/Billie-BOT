import { loadCacheFromDB, mergeCacheToDB, clearCache } from '../lib/cache.js'

let handler = async (m, { conn }) => {
  if (global.ultra) {
    await m.reply('Desactivando el Modo Ultra...')
    mergeCacheToDB()
    clearCache()
    global.ultra = false
    await m.reply('El Modo Ultra ha sido desactivado. Reiniciando para aplicar la configuración básica...\n\nSe recomienda un reinicio manual completo para salir del modo de alto rendimiento.')
    await global.reloadHandler(true)
  } else {
    await m.reply('Activando el Modo Ultra...')
    loadCacheFromDB()
    global.ultra = true
    await m.reply('El Modo Ultra ha sido activado. Reiniciando para aplicar la configuración de alto rendimiento...\n\nSe recomienda un reinicio manual completo para que todas las optimizaciones surtan efecto.')
    await global.reloadHandler(true)
  }
}
handler.help = ['modeultra']
handler.tags = ['owner']
handler.command = /^(modeultra)$/i
handler.owner = true

export default handler
