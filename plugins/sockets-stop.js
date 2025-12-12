import path from 'path';
import fs from 'fs';

let handler = async (m, { conn, usedPrefix, command }) => {
// Solo los sub-bots pueden usar este comando
const isSubBot = global.conns.some(c => c.user.jid === conn.user.jid && c.user.jid !== global.conn.user.jid);
if (!isSubBot) {
return m.reply("☂︎ Este comando solo está disponible para las sesiones de sub-bots (Jadibots).");
}

// Sistema de confirmación
const confirmId = m.sender;
conn.stopConfirm = conn.stopConfirm || {};
if (!conn.stopConfirm[confirmId]) {
conn.stopConfirm[confirmId] = { timestamp: Date.now() };
return m.reply(`*⚠️ CONFIRMACIÓN REQUERIDA ⚠️*\n\n` +
`¿Estás seguro de que quieres detener tu sesión de sub-bot? Serás desconectado.\n\n` +
`*Vuelve a ejecutar el comando \`${usedPrefix + command}\` para confirmar.*`);
}

const confirmation = conn.stopConfirm[confirmId];
if (Date.now() - confirmation.timestamp > 30000) { // 30 segundos
delete conn.stopConfirm[confirmId];
return m.reply("☂︎ La confirmación ha expirado. Inicia el proceso de nuevo.");
}

try {
await m.reply(`*${global.decor} Desconectando la sesión del sub-bot...*`);
const subBotIndex = global.conns.findIndex(c => c.user.jid === conn.user.jid);
if (subBotIndex !== -1) {
const subBotConn = global.conns[subBotIndex];
await subBotConn.logout();
global.conns.splice(subBotIndex, 1);
}

// Limpiar la carpeta de la sesión
const sessionDir = path.join('./sessions', m.sender.split('@')[0]);
if (fs.existsSync(sessionDir)) {
fs.rmSync(sessionDir, { recursive: true, force: true });
}

} catch (error) {
console.error("Error al detener el sub-bot:", error);
await m.reply("☂︎ ¡Oh, no! Ocurrió un error al intentar detener la sesión.");
} finally {
delete conn.stopConfirm[confirmId];
}
};

handler.help = ['stop'];
handler.tags = ['sockets'];
handler.command = ['stop', 'logout']; // Mantener alias por compatibilidad
handler.group = true;

export default handler;