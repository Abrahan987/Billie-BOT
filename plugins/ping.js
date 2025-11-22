module.exports = {
  command: 'ping',
  description: 'Responds with Pong.',
  run: async (sock, m, { text }) => {
    await sock.sendMessage(m.key.remoteJid, { text: 'Pong' }, { quoted: m });
  }
};
