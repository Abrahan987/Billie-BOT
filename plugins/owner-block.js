let handler = async (m, { conn, text, usedPrefix, command }) => {
const target = m.mentionedJid?.[0] || m.quoted?.sender;

if (!target) {
return m.reply(`☁︎ ¿A quién quieres bloquear? ☁︎\n\n*Formato:* ${usedPrefix + command} @usuario`);
}
if (target === conn.user.jid) {
return m.reply("☂︎ No puedo bloquearme a mí misma. ☂︎");
}
// Verificar si el objetivo es un propietario
const isOwner = global.owner.some(owner => owner[0] + '@s.whatsapp.net' === target);
if (isOwner) {
return m.reply("☂︎ No puedes bloquear a mi propietario. ☂︎");
}

try {
await conn.updateBlockStatus(target, 'block');
await conn.reply(m.chat, `*♫︎ Usuario Bloqueado ♫︎*\n\n` +
`*➪ Usuario:* @${target.split('@')[0]}\n` +
`*➪ Estado:* Bloqueado\n\n` +
`El usuario ya no podrá contactarme.`, m, { mentions: [target] });
} catch (error) {
console.error("Error al bloquear:", error);
await m.reply("☂︎ Ocurrió un error al intentar bloquear al usuario. ☂︎");
}
};

handler.help = ['block @usuario'];
handler.tags = ['owner'];
handler.command = ['block'];
handler.owner = true;

export default handler;