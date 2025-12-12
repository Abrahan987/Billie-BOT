import Jimp from 'jimp';

let handler = async (m, { conn, text, usedPrefix, command }) => {
// Solo el propietario o los sub-bots pueden usar estos comandos
const isAllowed = m.isOwner || global.conns.some(c => c.user.jid === m.sender);
if (!isAllowed) {
return m.reply("☂︎ Este comando solo puede ser utilizado por el propietario del bot o por un sub-bot.");
}

switch (command) {
case 'setbotpp':
await setProfilePicture(m, conn, usedPrefix, command);
break;
case 'setbotbio':
await setProfileBio(m, conn, text, usedPrefix, command);
break;
case 'setbotname':
await setProfileName(m, conn, text, usedPrefix, command);
break;
}};

// --- Funciones Específicas ---

async function setProfilePicture(m, conn, usedPrefix, command) {
const q = m.quoted || m;
const mime = (q.msg || q).mimetype || '';
if (!/image\/(png|jpe?g)/.test(mime)) {
return m.reply(`${global.decor} ¿Qué imagen quieres usar como foto de perfil?\n\n*Formato:* Responde a una imagen con \`${usedPrefix + command}\``);
}
try {
await m.react('🖼️');
const img = await q.download();
const image = await Jimp.read(img);
const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);
await conn.updateProfilePicture(conn.user.jid, buffer);
await m.reply(`*${global.decor} ¡Foto de perfil actualizada con éxito!*`);
} catch (error) {
console.error("Error al cambiar la foto de perfil:", error);
await m.reply("☂︎ ¡Oh, no! No pude cambiar la foto de perfil.");
}}

async function setProfileBio(m, conn, text, usedPrefix, command) {
if (!text) {
return m.reply(`${global.decor} ¿Qué biografía quieres que ponga?\n\n*Formato:* ${usedPrefix + command} [nueva biografía]`);
}
try {
await conn.updateProfileStatus(text);
await m.reply(`*${global.decor} ¡Biografía actualizada con éxito!*\n\n*Nueva biografía:* ${text}`);
} catch (error) {
console.error("Error al cambiar la biografía:", error);
await m.reply("☂︎ ¡Oh, no! No pude cambiar la biografía.");
}}

async function setProfileName(m, conn, text, usedPrefix, command) {
if (!text || text.length < 3 || text.length > 25) {
return m.reply(`${global.decor} ¿Qué nombre quieres que use?\n\n*Formato:* ${usedPrefix + command} [nuevo nombre]\n_(Entre 3 y 25 caracteres)_`);
}
try {
await conn.updateProfileName(text);
await m.reply(`*${global.decor} ¡Nombre actualizado con éxito!*\n\n*Nuevo nombre:* ${text}`);
} catch (error) {
console.error("Error al cambiar el nombre:", error);
await m.reply("☂︎ ¡Oh, no! No pude cambiar el nombre.");
}}

handler.help = ['setbotpp', 'setbotbio <texto>', 'setbotname <texto>'];
handler.tags = ['sockets'];
handler.command = ['setbotpp', 'setbotbio', 'setbotname'];

export default handler;