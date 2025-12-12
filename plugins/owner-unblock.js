let handler = async (m, { conn, text, usedPrefix, command }) => {
const target = m.mentionedJid?.[0] || m.quoted?.sender;

if (!target) {
return m.reply(`${global.decor} ¿A quién quieres desbloquear?\n\n*Formato:* ${usedPrefix + command} @usuario`);
}

try {
await conn.updateBlockStatus(target, 'unblock');
await conn.reply(m.chat, `*🝮︎︎︎︎︎︎︎ USUARIO DESBLOQUEADO 🝮︎︎︎︎︎︎︎*\n\n` +
`*Usuario:* @${target.split('@')[0]}\n` +
`*Estado:* Desbloqueado\n\n` +
`El usuario ahora puede volver a contactar al bot.`, m, { mentions: [target] });
} catch (error) {
console.error("Error al desbloquear:", error);
await m.reply("☂︎ Ocurrió un error al intentar desbloquear al usuario.");
}
};

handler.help = ['unblock @usuario'];
handler.tags = ['owner'];
handler.command = ['unblock'];
handler.owner = true;

export default handler;