import { readdirSync, unlinkSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';

let handler = async (m, { conn, usedPrefix, command }) => {
// Sistema de confirmación
const confirmId = m.sender;
conn.cleartmpConfirm = conn.cleartmpConfirm || {};
if (!conn.cleartmpConfirm[confirmId]) {
conn.cleartmpConfirm[confirmId] = {
timestamp: Date.now()
};
return m.reply(`*☁︎ CONFIRMACIÓN REQUERIDA ☁︎*\n\n` +
`¿Estás seguro de que quieres limpiar la carpeta temporal? Se eliminarán todos los archivos generados (imágenes, videos, etc.).\n\n` +
`*Esta acción no se puede deshacer.*\n\n` +
`Vuelve a ejecutar el comando \`${usedPrefix + command}\` para confirmar.`);
}

const confirmation = conn.cleartmpConfirm[confirmId];
if (Date.now() - confirmation.timestamp > 30000) { // 30 segundos
delete conn.cleartmpConfirm[confirmId];
return m.reply("☂︎ La confirmación ha expirado. Vuelve a intentarlo. ☂︎");
}

try {
await m.react('🕒');
const tmpPath = tmpdir();
if (!existsSync(tmpPath)) {
return m.reply("☂︎ La carpeta temporal no existe. ☂︎");
}

const files = readdirSync(tmpPath);
if (files.length === 0) {
return m.reply("♪ La carpeta temporal ya está vacía. ♪");
}

let deletedCount = 0;
files.forEach(file => {
try {
unlinkSync(path.join(tmpPath, file));
deletedCount++;
} catch (e) {
console.error(`No se pudo eliminar el archivo ${file}:`, e);
}});

await m.react('✔️');
await m.reply(`*♫︎ ¡Limpieza completada! ♫︎*\n\nSe han eliminado *${deletedCount}* archivos de la carpeta temporal.`);

} catch (error) {
await m.react('✖️');
console.error("Error al limpiar la carpeta temporal:", error);
await m.reply("☂︎ ¡Oh, no! Ocurrió un error al limpiar la carpeta temporal. ☂︎");
} finally {
delete conn.cleartmpConfirm[confirmId];
}
};

handler.help = ['cleartmp'];
handler.tags = ['owner'];
handler.command = ['cleartmp', 'limpiartmp'];
handler.owner = true;

export default handler;