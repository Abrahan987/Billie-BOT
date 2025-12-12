import { cpus as _cpus, totalmem, freemem, platform, hostname } from 'os';
import { sizeFormatter } from 'human-readable';
import { performance } from 'perf_hooks';

const format = sizeFormatter({ std: 'JEDEC', decimalPlaces: 2, keepTrailingZeroes: false });

let handler = async (m, { conn }) => {
// --- Estadísticas del Bot ---
const totalUsers = Object.keys(global.db.data.users).length;
const totalCommands = Object.values(global.plugins).filter(p => p.help).length;
const uptime = formatUptime(process.uptime());
const ping = `${(performance.now() - m.messageTimestamp.low * 1000).toFixed(2)} ms`;

// --- Información del Servidor ---
const cpus = _cpus().map(cpu => {
cpu.total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
return cpu;
});
const cpu = cpus[0];
const ramUsed = totalmem() - freemem();
const ramPercentage = (ramUsed / totalmem()) * 100;
const ramBar = '█'.repeat(Math.floor(ramPercentage / 10)) + '░'.repeat(10 - Math.floor(ramPercentage / 10));

// --- Uso de Memoria de Node.js ---
const memoryUsage = process.memoryUsage();

// --- Construcción del Mensaje ---
const statusMessage = `*🝮︎︎︎︎︎︎︎ ESTADO DEL BOT 🝮︎︎︎︎︎︎︎*\n\n` +
`*--- Estadísticas del Bot ---*\n` +
`*   👥 Usuarios Registrados:* ${totalUsers.toLocaleString()}\n` +
`*   🧩 Comandos Disponibles:* ${totalCommands}\n` +
`*   🕒 Uptime:* ${uptime}\n` +
`*   🏓 Ping:* ${ping}\n\n` +
`*--- Información del Servidor ---*\n` +
`*   💻 OS:* ${platform()}\n` +
`*   🤖 CPU:* ${cpu.model}\n` +
`*   💾 RAM:* [${ramBar}] ${format(ramUsed)} / ${format(totalmem())}\n\n` +
`*--- Uso de Memoria (Node.js) ---*\n` +
`*   Total Heap:* ${format(memoryUsage.heapTotal)}\n` +
`*   Heap Usado:* ${format(memoryUsage.heapUsed)}`;

await conn.reply(m.chat, statusMessage, m);
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

handler.help = ['status'];
handler.tags = ['main'];
handler.command = ['status', 'estado', 'stats'];
handler.premium = true;

export default handler;