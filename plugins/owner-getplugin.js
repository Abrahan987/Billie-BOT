import fs from 'fs/promises';
import path from 'path';

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) {
const plugins = (await fs.readdir('plugins')).filter(f => f.endsWith('.js'));
const pluginList = plugins.map(p => `*•* ${p.replace('.js', '')}`).join('\n');
return m.reply(`*${global.decor} ¿Qué plugin quieres obtener?\n\n*Formato:* ${usedPrefix + command} [nombre-del-plugin]\n\n*Plugins disponibles:*\n${pluginList}`);
}

const pluginName = text.endsWith('.js') ? text : `${text}.js`;
const pluginPath = path.join('plugins', pluginName);

try {
await fs.access(pluginPath); // Comprueba si el archivo existe
const content = await fs.readFile(pluginPath, 'utf-8');
await conn.reply(m.chat, content, m);
} catch (error) {
console.error("Error al obtener el plugin:", error);
await m.reply(`☂︎ No se pudo encontrar el plugin \`${pluginName}\`.`);
}
};

handler.help = ['getplugin <nombre>'];
handler.tags = ['owner'];
handler.command = ['getplugin'];
handler.owner = true;

export default handler;