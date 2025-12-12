import fs from 'fs/promises';
import path from 'path';

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) {
return m.reply(`${global.decor} ¿Qué plugin quieres eliminar?\n\n*Formato:* ${usedPrefix + command} [nombre-del-plugin]`);
}

const pluginName = text.endsWith('.js') ? text : `${text}.js`;
const pluginPath = path.join('plugins', pluginName);

// Sistema de confirmación
const confirmId = `${m.sender}-${pluginPath}`;
conn.deletepluginConfirm = conn.deletepluginConfirm || {};

if (!conn.deletepluginConfirm[confirmId]) {
conn.deletepluginConfirm[confirmId] = { timestamp: Date.now() };
return m.reply(`*⚠️ ADVERTENCIA ⚠️*\n\n` +
`¿Estás seguro de que quieres eliminar el plugin \`${pluginName}\`?\n\n` +
`*Esta acción es irreversible.*\n\n` +
`Vuelve a ejecutar el comando para confirmar.`);
}

const confirmation = conn.deletepluginConfirm[confirmId];
if (Date.now() - confirmation.timestamp > 30000) { // 30 segundos
delete conn.deletepluginConfirm[confirmId];
return m.reply("☂︎ La confirmación ha expirado.");
}

try {
await fs.unlink(pluginPath);
await m.reply(`*${global.decor} ¡Plugin eliminado con éxito!*\n\nEl archivo \`${pluginPath}\` ha sido eliminado.`);
} catch (error) {
console.error("Error al eliminar el plugin:", error);
await m.reply(`☂︎ ¡Oh, no! Ocurrió un error al intentar eliminar el plugin. Es posible que el archivo no exista.`);
} finally {
delete conn.deletepluginConfirm[confirmId];
}
};

handler.help = ['deleteplugin <nombre>'];
handler.tags = ['owner'];
handler.command = ['deleteplugin', 'delplugin'];
handler.owner = true;

export default handler;