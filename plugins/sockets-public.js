let handler = async (m, { conn, usedPrefix, command }) => {
// Solo el propietario o los sub-bots pueden usar este comando
const isAllowed = m.isOwner || global.conns.some(c => c.user.jid === m.sender);
if (!isAllowed) {
return m.reply("☂︎ Este comando solo puede ser utilizado por el propietario del bot o por un sub-bot.");
}

const settings = global.db.data.settings[conn.user.jid];
if (!settings.self) {
return m.reply("✨ El bot ya se encuentra en modo público.");
}

settings.self = false;
await m.reply(`*${global.decor} ¡Modo Público Activado!*\n\nAhora el bot responderá a los comandos de todos los usuarios.`);
};

handler.help = ['public'];
handler.tags = ['sockets'];
handler.command = ['public'];

export default handler;