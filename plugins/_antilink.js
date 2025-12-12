// Expresión regular para detectar enlaces de grupos y canales de WhatsApp
const linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})|whatsapp\.com\/channel\/([0-9A-Za-z]{20,24})/i;

// --- Manejador 'before' para la detección de enlaces ---
const before = async (m, { conn, isAdmin, isBotAdmin }) => {
if (!m.isGroup) return;
const chat = global.db.data.chats[m.chat] || {};
if (!chat.antiLink || !m.text || isAdmin) return;

const isGroupLink = linkRegex.test(m.text);
if (isGroupLink) {
if (!isBotAdmin) {
return m.reply("🛡️ *Anti-Link:* Necesito ser administrador para poder eliminar enlaces.");
}

const linkThisGroup = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`;
if (m.text.includes(linkThisGroup)) return; // Ignorar el enlace del grupo actual

try {
await conn.sendMessage(m.chat, { delete: m.key });
await conn.reply(m.chat, `*🛡️ ¡Enlace Detectado! 🛡️*\n\nSe ha eliminado a @${m.sender.split('@')[0]} por enviar un enlace no permitido.`, null, { mentions: [m.sender] });
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
} catch (e) {
console.error("Error en el anti-link:", e);
}}};

// --- Comando para configurar el Anti-Link ---
const handler = async (m, { conn, text, usedPrefix, command }) => {
const chat = global.db.data.chats[m.chat] || {};
const action = text.trim().toLowerCase();

if (action === 'on') {
if (chat.antiLink) return m.reply("✨ El sistema Anti-Link ya está activado.");
chat.antiLink = true;
await m.reply(`*${global.decor} ¡Anti-Link Activado!*\n\nA partir de ahora, eliminaré a los miembros que envíen enlaces de otros grupos o canales.`);
} else if (action === 'off') {
if (!chat.antiLink) return m.reply("✨ El sistema Anti-Link ya está desactivado.");
chat.antiLink = false;
await m.reply(`*${global.decor} ¡Anti-Link Desactivado!*\n\nLos miembros ahora pueden enviar enlaces.`);
} else {
const status = chat.antiLink ? '🟢 ACTIVADO' : '🔴 DESACTIVADO';
m.reply(`*🝮︎︎︎︎︎︎︎ CONFIGURACIÓN DE ANTI-LINK 🝮︎︎︎︎︎︎︎*\n\n*Estado actual:* ${status}\n\n` +
`*Uso:*\n\`${usedPrefix + command} on\` - Activa el sistema.\n\`${usedPrefix + command} off\` - Desactiva el sistema.`);
}
};

handler.before = before;
handler.help = ['antilink <on|off>'];
handler.tags = ['group'];
handler.command = ['antilink'];
handler.admin = true;
handler.group = true;

export default handler;