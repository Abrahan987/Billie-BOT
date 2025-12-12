import fs from 'fs/promises';
import path from 'path';

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) {
return m.reply(`${global.decor} ¿Qué nombre le quieres dar al plugin?\n\n*Formato:* ${usedPrefix + command} [nombre-del-plugin]`);
}
if (!m.quoted || !m.quoted.text) {
return m.reply("☂︎ Debes responder al código que quieres guardar como un plugin.");
}

const pluginName = text.endsWith('.js') ? text : `${text}.js`;
const pluginPath = path.join('plugins', pluginName);

// Sistema de confirmación si el archivo ya existe
try {
await fs.access(pluginPath); // Comprueba si el archivo existe
const confirmId = `${m.sender}-${pluginPath}`;
conn.savepluginConfirm = conn.savepluginConfirm || {};

if (!conn.savepluginConfirm[confirmId]) {
conn.savepluginConfirm[confirmId] = { timestamp: Date.now() };
return m.reply(`*⚠️ ADVERTENCIA ⚠️*\n\n` +
`El plugin \`${pluginName}\` ya existe. ¿Estás seguro de que quieres sobrescribirlo?\n\n` +
`*Vuelve a ejecutar el comando para confirmar.*`);
}

const confirmation = conn.savepluginConfirm[confirmId];
if (Date.now() - confirmation.timestamp > 30000) { // 30 segundos
delete conn.savepluginConfirm[confirmId];
return m.reply("☂︎ La confirmación ha expirado.");
}
delete conn.savepluginConfirm[confirmId];
} catch (e) {
// El archivo no existe, no se necesita confirmación
}

try {
await fs.writeFile(pluginPath, m.quoted.text);
await m.reply(`*${global.decor} ¡Plugin guardado con éxito!*\n\n*Ruta:* \`${pluginPath}\``);
} catch (error) {
console.error("Error al guardar el plugin:", error);
await m.reply("☂︎ ¡Oh, no! Ocurrió un error al intentar guardar el plugin.");
}
};

handler.help = ['saveplugin <nombre>'];
handler.tags = ['owner'];
handler.command = ['saveplugin'];
handler.owner = true;

export default handler;