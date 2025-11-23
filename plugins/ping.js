import { readFileSync } from 'fs'

const handler = async (m, { conn }) => {
  const fotito = readFileSync('./lib/catalogo.jpg')
  const old = m.messageTimestamp * 1000
  const neww = new Date().getTime()
  const speed = `${neww - old} ms`

  await conn.sendMessage(
    m.chat,
    {
      image: fotito,
      caption: `*LATENCIA DEL BOT: ${speed}*`
    },
    { quoted: m }
  );
};

handler.help = ['ping'];
handler.tags = ['main'];
handler.command = ['ping', 'speed'];

export default handler;
