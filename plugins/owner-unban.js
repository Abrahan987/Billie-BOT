let handler = async (m, { conn, text, usedPrefix, command }) => {
const target = m.mentionedJid?.[0] || m.quoted?.sender;

if (!target) {
return m.reply(`${global.decor} ¿A quién quieres quitarle el ban?\n\n*Formato:* ${usedPrefix + command} @usuario`);
}

const user = global.db.data.users[target];
if (!user || !user.banned) {
return m.reply(`☂︎ El usuario @${target.split('@')[0]} no se encuentra baneado.`, null, { mentions: [target] });
}

user.banned = false;
user.bannedReason = '';

await conn.reply(m.chat, `*🝮︎︎︎︎︎︎︎ USUARIO DESBANEADO 🝮︎︎︎︎︎︎︎*\n\n` +
`*Usuario:* @${target.split('@')[0]}\n` +
`*Estado:* Desbaneado\n\n` +
`El usuario ahora puede volver a interactuar con el bot.`, m, { mentions: [target] });
};

handler.help = ['unban @usuario'];
handler.tags = ['owner'];
handler.command = ['unban'];
handler.owner = true;

export default handler;