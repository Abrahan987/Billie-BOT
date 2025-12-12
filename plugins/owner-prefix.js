const defaultPrefix = '.'; // Define tu prefijo por defecto aquí

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (command === 'resetprefix') {
// Restablecer al prefijo por defecto
global.prefix = new RegExp('^[' + defaultPrefix.replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']');
return conn.reply(m.chat, `*${global.decor} ¡Prefijo restablecido!*\n\nEl prefijo ha sido restaurado al valor por defecto: \`${defaultPrefix}\``, m);
}

if (!text) {
return conn.reply(m.chat, `${global.decor} ¿Qué prefijo quieres usar?\n\n*Formato:* ${usedPrefix + command} [nuevo prefijo]\n*Para restablecer:* ${usedPrefix}resetprefix`);
}
if (text.length > 1) {
return conn.reply(m.chat, "☂︎ El prefijo solo puede ser un único carácter.", m);
}

// Actualizar el prefijo global
global.prefix = new RegExp('^[' + text.replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']');
await conn.reply(m.chat, `*${global.decor} ¡Prefijo actualizado!*\n\nEl nuevo prefijo del bot es: \`${text}\``, m);
};

handler.help = ['setprefix <prefijo>', 'resetprefix'];
handler.tags = ['owner'];
handler.command = ['setprefix', 'prefix', 'resetprefix'];
handler.owner = true;

export default handler;