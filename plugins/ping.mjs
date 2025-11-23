
const handler = async (sock, m, { command, args, text, db }) => {
  await sock.sendMessage(m.key.remoteJid, { text: 'Pong!' });
};

handler.command = ['ping'];
handler.help = 'Checks if the bot is responsive.';
handler.tags = ['utility'];
handler.register = true;

export default handler;
