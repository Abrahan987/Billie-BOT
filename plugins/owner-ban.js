let handler = async (m, { conn, text, usedPrefix, command }) => {
const target = m.mentionedJid?.[0] || m.quoted?.sender;
const [reason] = text.split('|').map(s => s.trim());

if (!target) {
return m.reply(`☁︎ ¿A quién quieres banear? ☁︎\n\n*Formato:* ${usedPrefix + command} @usuario [motivo]`);
}
if (target === conn.user.jid) {
return m.reply("☂︎ No puedo banearme a mí misma. ☂︎");
}
// Verificar si el objetivo es un propietario
const isOwner = global.owner.some(owner => owner[0] + '@s.whatsapp.net' === target);
if (isOwner) {
return m.reply("☂︎ No puedes banear a mi propietario. ☂︎");
}

const user = global.db.data.users[target];
if (!user) {
global.db.data.users[target] = { banned: true, bannedReason: reason || 'Sin motivo' };
} else {
if (user.banned) {
return m.reply(`☂︎ El usuario @${target.split('@')[0]} ya está baneado. ☂︎`, null, { mentions: [target] });
}
user.banned = true;
user.bannedReason = reason || 'Sin motivo';
}

await conn.reply(m.chat, `*♫︎ Usuario Baneado ♫︎*\n\n` +
`*➪ Usuario:* @${target.split('@')[0]}\n` +
`*➪ Motivo:* ${reason || 'Sin motivo'}\n\n` +
`El usuario ya no podrá usar mis comandos.`, m, { mentions: [target] });
};

handler.help = ['ban @usuario [motivo]'];
handler.tags = ['owner'];
handler.command = ['ban'];
handler.owner = true;

export default handler;