import { readdir, unlink } from 'fs/promises';
import path from 'path';

let handler = async (m, { conn, usedPrefix, command }) => {
// Solo el bot principal puede ejecutar este comando
if (global.conn.user.jid !== conn.user.jid) {
return conn.reply(m.chat, '☂︎ Este comando solo puede ser ejecutado en la sesión principal del bot.', m);
}

// Sistema de confirmación
const confirmId = m.sender;
conn.clearSessionsConfirm = conn.clearSessionsConfirm || {};
if (!conn.clearSessionsConfirm[confirmId]) {
conn.clearSessionsConfirm[confirmId] = {
timestamp: Date.now()
};
return m.reply(`*⚠️ CONFIRMACIÓN REQUERIDA ⚠️*\n\n` +
`¿Estás seguro de que quieres limpiar la carpeta de sesiones? Esto eliminará todas las sesiones de sub-bots (Jadibots).\n\n` +
`*Esta acción es irreversible y desconectará a todos los sub-bots.*\n\n` +
`Vuelve a ejecutar el comando \`${usedPrefix + command}\` para confirmar.`);
}

const confirmation = conn.clearSessionsConfirm[confirmId];
if (Date.now() - confirmation.timestamp > 30000) { // 30 segundos
delete conn.clearSessionsConfirm[confirmId];
return m.reply("☂︎ La confirmación ha expirado. Inicia el proceso de nuevo.");
}

try {
await m.react('🕒');
const sessionsDir = './sessions';
const files = await readdir(sessionsDir);
let deletedCount = 0;

for (const file of files) {
// No eliminar el archivo de credenciales principal
if (file !== 'creds.json') {
await unlink(path.join(sessionsDir, file));
deletedCount++;
}}

if (deletedCount === 0) {
await m.react('✨');
return m.reply("✨ No había sesiones de sub-bots para eliminar.");
}

await m.react('✔️');
await m.reply(`*${global.decor} ¡Limpieza de sesiones completada!*\n\nSe han eliminado *${deletedCount}* archivos de sesión.`);

} catch (error) {
await m.react('✖️');
console.error("Error al limpiar las sesiones:", error);
await m.reply("☂︎ ¡Oh, no! Ocurrió un error al intentar limpiar la carpeta de sesiones.");
} finally {
delete conn.clearSessionsConfirm[confirmId];
}
};

handler.help = ['clearsessions'];
handler.tags = ['owner'];
handler.command = ['clearsessions', 'limpiarsesiones'];
handler.owner = true;

export default handler;