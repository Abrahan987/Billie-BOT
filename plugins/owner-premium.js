const timeMultipliers = {
s: 1000,        // segundos
m: 60 * 1000,     // minutos
h: 60 * 60 * 1000,  // horas
d: 24 * 60 * 60 * 1000, // días
w: 7 * 24 * 60 * 60 * 1000, // semanas
y: 365 * 24 * 60 * 60 * 1000 // años
};

let handler = async (m, { conn, text, usedPrefix, command }) => {
const target = m.mentionedJid?.[0] || m.quoted?.sender;
const [action, durationStr] = text.split(' ').filter(Boolean);

if (!target) {
return m.reply(`☁︎ ¿A quién quieres gestionar el estado Premium? ☁︎\n\n*Formato:* ${usedPrefix + command} @usuario [duración]`);
}

const user = global.db.data.users[target];
if (!user) {
return m.reply("☂︎ No encontré a ese usuario en mi base de datos. ☂︎");
}

switch (command) {
case 'addprem':
if (!durationStr) {
return m.reply(`☁︎ Debes especificar una duración. ☁︎\n\n*Ejemplo:* ${usedPrefix}addprem @usuario 1d\n\n*Unidades:* s, m, h, d, w, y`);
}
const duration = parseDuration(durationStr);
if (!duration) {
return m.reply("☂︎ Formato de duración no válido. Ejemplos: 10m, 2h, 7d. ☂︎");
}
const now = Date.now();
user.premium = true;
user.premiumTime = (user.premiumTime || now) > now ? user.premiumTime + duration : now + duration;
await m.reply(`*♫︎ Estado Premium Añadido ♫︎*\n\n` +
`*➪ Usuario:* @${target.split('@')[0]}\n` +
`*➪ Estado:* Premium Activado\n` +
`*➪ Expira en:* ${formatTime(user.premiumTime - now)}`, null, { mentions: [target] });
break;

case 'delprem':
if (!user.premium) {
return m.reply(`☂︎ El usuario @${target.split('@')[0]} no es Premium. ☂︎`, null, { mentions: [target] });
}
user.premium = false;
user.premiumTime = 0;
await m.reply(`*♫︎ Estado Premium Eliminado ♫︎*\n\n` +
`*➪ Usuario:* @${target.split('@')[0]}\n` +
`*➪ Estado:* Premium Desactivado`, null, { mentions: [target] });
break;
}};

function parseDuration(str) {
const match = str.match(/^(\d+)([smhdwy])$/);
if (!match) return null;
const [, value, unit] = match;
return parseInt(value) * timeMultipliers[unit];
}

function formatTime(ms) {
if (ms <= 0) return "Expirado";
const d = Math.floor(ms / (24 * 60 * 60 * 1000));
const h = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
let parts = [];
if (d > 0) parts.push(`${d}d`);
if (h > 0) parts.push(`${h}h`);
return parts.join(' ') || '<1h';
}

handler.help = ['addprem @usuario <duración>', 'delprem @usuario'];
handler.tags = ['owner'];
handler.command = ['addprem', 'delprem'];
handler.owner = true;

export default handler;