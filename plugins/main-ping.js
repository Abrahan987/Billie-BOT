import speed from 'performance-now'

let handler = async (m, { conn }) => {
  let timestamp = speed()
  let sentMsg = await conn.reply(m.chat, '❀ Calculando ping...', m)
  let latency = speed() - timestamp
  let result = `✰ *¡Pong!*\n> Tiempo ⴵ ${latency.toFixed(4).split('.')[0]}ms`
  conn.sendMessage(m.chat, { text: result, edit: sentMsg.key }, { quoted: m })
}
handler.help = ['ping']
handler.tags = ['info']
handler.command = ['ping', 'p']

export default handler
