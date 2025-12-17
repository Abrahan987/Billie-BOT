import yts from 'yt-search'
import ytdl from 'ytdl-core'
import fs from 'fs'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) throw `🎌 *Ingrese el nombre o enlace de un video de YouTube*\n\nEjemplo: ${usedPrefix + command} Good Day - The Offspring`

    await m.react('🕒')

    const search = await yts(text)
    const video = search.videos[0]
    if (!video) throw '🚩 *No se encontraron resultados*'

    const { title, thumbnail, timestamp, views, ago, url } = video

    const infoCaption = `
*${title}*
*Duración:* ${timestamp}
*Vistas:* ${views.toLocaleString()}
*Publicado:* ${ago}
*URL:* ${url}
    `
    await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption: infoCaption }, { quoted: m })

    const isAudio = ['play', 'yta', 'ytmp3', 'playaudio'].includes(command)

    const stream = ytdl(url, {
      filter: isAudio ? 'audioonly' : 'videoandaudio',
      quality: 'lowest',
    })

    if (isAudio) {
      await conn.sendMessage(m.chat, {
        audio: stream,
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        video: stream,
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`,
        caption: `*${title}*`
      }, { quoted: m })
    }

    await m.react('✔️')

  } catch (error) {
    await m.react('✖️')
    m.reply(`🔴 *Ocurrió un error inesperado.*\n` + error.toString())
  }
}

handler.help = ['play', 'yta', 'ytmp3', 'playaudio', 'play2', 'ytv', 'ytmp4', 'mp4']
handler.tags = ['descargas']
handler.command = /^(play|yta|ytmp3|playaudio|play2|ytv|ytmp4|mp4)$/i
handler.group = true

export default handler
