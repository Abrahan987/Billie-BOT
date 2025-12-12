import fetch from 'node-fetch';
import moment from 'moment-timezone';

let handler = async (m, { conn, text, usedPrefix }) => {
if (text) {
// Mostrar ayuda para un comando específico
const command = text.toLowerCase();
const plugin = Object.values(global.plugins).find(p => p.command?.includes(command) || p.help?.includes(command));
if (plugin) {
const helpText = Array.isArray(plugin.help) ? plugin.help[0] : plugin.help;
const usage = helpText ? `${usedPrefix}${helpText}` : `No se encontró un formato de uso para *${command}*.`;
const description = plugin.description || "No hay una descripción disponible para este comando.";
return m.reply(`*Comando:* ${command}\n*Uso:* ${usage}\n*Descripción:* ${description}`);
} else {
return m.reply(`No se encontró el comando *"${text}"*.`);
}}

// --- Generación del Menú Principal ---
const now = new Date();
const time = moment.tz('America/Bogota').format('HH:mm');
const date = moment.tz('America/Bogota').format('dddd, DD [de] MMMM [de] YYYY');
const totalUsers = Object.keys(global.db.data.users).length;
const uptime = formatUptime(process.uptime());
const name = m.name;

const commands = {};
Object.values(global.plugins).forEach(plugin => {
if (!plugin.help || !plugin.tags) return;
const tags = Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags];
tags.forEach(tag => {
if (!commands[tag]) commands[tag] = [];
const help = Array.isArray(plugin.help) ? plugin.help[0] : plugin.help;
if (help) commands[tag].push({ help: help.split(' ')[0], premium: plugin.premium });
});});

let menu = `*¡Hola, ${name}!* ♫︎\n\n` +
`*Fecha:* ${date}\n*Hora:* ${time}\n*Uptime:* ${uptime}\n*Usuarios:* ${totalUsers}\n\n`;

const categoryOrder = ['main', 'profile', 'group', 'fun', 'anime', 'rpg', 'gacha', 'downloads', 'tools', 'nsfw', 'owner'];
for (const tag of categoryOrder) {
if (commands[tag]) {
menu += `*╭─「 ${tag.charAt(0).toUpperCase() + tag.slice(1)} 」*\n`;
menu += commands[tag].map(c => `*│* ${usedPrefix}${c.help} ${c.premium ? '💎' : ''}`).join('\n');
menu += `\n*╰────────────*\n\n`;
}}

const menuFooter = `> ♫︎ Escribe \`${usedPrefix}help [comando]\` para más detalles.`;

await conn.reply(m.chat, menu + menuFooter, m);
};

function formatUptime(seconds) {
const d = Math.floor(seconds / (3600 * 24));
const h = Math.floor(seconds % (3600 * 24) / 3600);
const m = Math.floor(seconds % 3600 / 60);
let parts = [];
if (d > 0) parts.push(`${d}d`);
if (h > 0) parts.push(`${h}h`);
if (m > 0) parts.push(`${m}m`);
return parts.join(' ') || '0s';
}

handler.help = ['menu [comando]'];
handler.tags = ['main'];
handler.command = ['menu', 'help', 'ayuda'];

export default handler;