import moment from 'moment-timezone';

const linkRegex = /https:\/\/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/;

let handler = async (m, { conn, text, usedPrefix, command }) => {
const match = text.match(linkRegex);
if (!match) {
return conn.reply(m.chat, `${global.decor} ¿Quieres invitarme a tu grupo?\n\n*Formato:* ${usedPrefix + command} [enlace del grupo]`);
}

const inviteCode = match[1];
const groupMetadata = await conn.groupGetInviteInfo(inviteCode).catch(() => null);
if (!groupMetadata) {
return m.reply("☂︎ El enlace de invitación no es válido o ha expirado.");
}

const inviteMessage = `*💌 NUEVA INVITACIÓN DE GRUPO 💌*\n\n` +
`*De:* @${m.sender.split('@')[0]}\n` +
`*Grupo:* ${groupMetadata.subject}\n` +
`*Fecha:* ${moment().format('DD/MM/YYYY HH:mm:ss')}\n` +
`*Enlace:* ${text}`;

// Enviar la invitación al propietario(s)
const ownerJids = global.owner.map(owner => owner[0] + '@s.whatsapp.net');
for (const jid of ownerJids) {
await conn.reply(jid, inviteMessage, m, { mentions: [m.sender] });
}

await m.reply(`*${global.decor} ¡Invitación enviada!*\n\nTu solicitud para unirme al grupo ha sido enviada al propietario del bot. ♫︎`);
};

handler.help = ['invite <enlace>'];
handler.tags = ['main'];
handler.command = ['invite', 'invitar'];

export default handler;