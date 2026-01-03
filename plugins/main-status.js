import { exec } from 'child_process'

let handler = async (m, { conn }) => {
  await m.reply('❀ Obteniendo estado...')
  exec('neofetch --stdout', (error, stdout, stderr) => {
    let child = stdout.toString('utf-8')
    let ssd = child.replace(/Memory:/, 'Ram:')
    m.reply(ssd)
  })
}
handler.help = ['status']
handler.tags = ['info']
handler.command = ['status', 'estado']

export default handler
