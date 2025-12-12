// Handler unificado que delega a funciones específicas según el comando
let handler = async (m, { conn, text, args, usedPrefix, command }) => {
switch (command) {
case 'addmoney':
await addCurrency(m, conn, text, 'coin', 'Monedas', usedPrefix, command);
break;
case 'addexp':
await addCurrency(m, conn, text, 'exp', 'Experiencia', usedPrefix, command);
break;
case 'listprem':
await listPremiumUsers(m, conn);
break;
}};

// Función genérica para añadir monedas o experiencia
async function addCurrency(m, conn, text, currencyType, currencyName, usedPrefix, command) {
const target = m.mentionedJid?.[0] || m.quoted?.sender;
const amountStr = text.split(' ').find(arg => !arg.startsWith('@'));
const amount = parseInt(amountStr);

if (!target || !amount || isNaN(amount)) {
return m.reply(`${global.decor} ¿A quién y cuánto quieres añadir?\n\n*Formato:* ${usedPrefix + command} @usuario <cantidad>`);
}

const user = global.db.data.users[target];
if (!user) return m.reply("☂︎ Usuario no encontrado en la base de datos.");

user[currencyType] = (user[currencyType] || 0) + amount;

const receipt = `*🝮︎︎︎︎︎︎︎ TRANSACCIÓN DE MODERADOR 🝮︎︎︎︎︎︎︎*\n\n` +
`*Tipo:* Añadir ${currencyName}\n` +
`*Usuario:* @${target.split('@')[0]}\n` +
`*Monto:* ${amount.toLocaleString()}\n\n` +
`*Nuevo Total de ${currencyName}:* ${user[currencyType].toLocaleString()}`;

await conn.reply(m.chat, receipt, m, { mentions: [target] });
}

// Función para listar usuarios premium
async function listPremiumUsers(m, conn) {
const now = Date.now();
const premiumUsers = Object.entries(global.db.data.users)
.filter(([, user]) => user.premium)
.sort(([, a], [, b]) => (a.premiumTime || 0) - (b.premiumTime || 0));

if (premiumUsers.length === 0) {
return m.reply("☂︎ Actualmente no hay usuarios Premium.");
}

const userList = premiumUsers.map(([jid, user]) => {
const expiration = user.premiumTime ? formatTime(user.premiumTime - now) : "Permanente";
return `*•* @${jid.split('@')[0]} (*Expira en:* ${expiration})`;
}).join('\n');

const listMessage = `*🝮︎︎︎︎︎︎︎ LISTA DE USUARIOS PREMIUM 🝮︎︎︎︎︎︎︎*\n\n${userList}`;

await conn.reply(m.chat, listMessage, m, { mentions: premiumUsers.map(([jid]) => jid) });
}

// Función para formatear el tiempo
function formatTime(ms) {
if (ms <= 0) return "Expirado";
const d = Math.floor(ms / (24 * 60 * 60 * 1000));
const h = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
let parts = [];
if (d > 0) parts.push(`${d}d`);
if (h > 0) parts.push(`${h}h`);
return parts.join(' ') || '<1h';
}

handler.help = ['addmoney @usuario <cantidad>', 'addexp @usuario <cantidad>', 'listprem'];
handler.tags = ['owner'];
handler.command = ['addmoney', 'addexp', 'listprem'];
handler.owner = true;

export default handler;