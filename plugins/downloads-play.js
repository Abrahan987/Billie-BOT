// By ABRAHAN-M 

import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text }) => {
    if (!text?.trim()) return conn.reply(m.chat, '❀ Ingresa el nombre de la música.', m)
    

    m.react('🕒')
    
    try {
        const searchPromise = yts(text)
        const result = (await searchPromise).all[0]
        if (!result) throw 'ꕥ Sin resultados.'
        
        const { title, thumbnail, url, timestamp, author } = result

     
        const info = `「✦」*${title}*\n> ⏳ Procesando audio...`
        const msgPromise = conn.sendMessage(m.chat, { 
            image: { url: thumbnail }, 
            caption: info 
        }, { quoted: m })
        
        const apiPromise = fetch(`https://api-adonix.ultraplus.click/download/ytaudio?apikey=abrahan&url=${encodeURIComponent(url)}`)
        
        
        const [ , response] = await Promise.all([msgPromise, apiPromise])
        
        if (!response.ok) throw new Error('Servidor inestable')
        const json = await response.json()
        const downloadLink = json.data?.url || json.url || json.result

        if (!downloadLink) throw new Error('Link no generado')

    
        await conn.sendMessage(m.chat, { 
            audio: { url: downloadLink }, 
            fileName: `${title}.mp3`, 
            mimetype: 'audio/mpeg' 
        }, { quoted: m })

        await m.react('✔️')

    } catch (e) {
        await m.react('✖️')
        return conn.reply(m.chat, `⚠︎ Fallo: ${e.message || e}`, m)
    }
}

handler.command = ['play', 'yta', 'ytmp3']
export default handler
