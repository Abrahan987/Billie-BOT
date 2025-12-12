const linkRegex = /https:\/\/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/;

let handler = async (m, { conn, text, usedPrefix, command }) => {
// Solo el propietario o los sub-bots pueden usar este comando
const isAllowed = m.isOwner || global.conns.some(c => c.user.jid === m.sender);
if (!isAllowed) {
return m.reply("☂︎ Este comando solo puede ser utilizado por el propietario del bot o por un sub-bot.");
}

const match = text.match(linkRegex);
if (!match) {
return conn.reply(m.chat, `${global.decor} ¿A qué grupo quieres que me una?\n\n*Formato:* ${usedPrefix + command} [enlace del grupo]`);
}

try {
await m.react('🕒');
const inviteCode = match[1];
const groupMetadata = await conn.groupAcceptInvite(inviteCode);
await m.react('✔️');
await m.reply(`*${global.decor} ¡Unido al grupo con éxito!*\n\n*Nombre:* ${groupMetadata.subject}`);
} catch (error) {
await m.react('✖️');
console.error("Error al unirse al grupo:", error);
await conn.reply(m.chat, "☂︎ ¡Oh, no! No pude unirme al grupo. El enlace puede ser inválido o ya no soy miembro.", m);
}};

handler.help = ['join <enlace>'];
handler.tags = ['sockets'];
handler.command = ['join'];

export default handler;