import ws from "ws";

const handler = async (m, { conn, participants }) => {
try {
// Obtener todos los bots activos (principal + sub-bots)
const allBots = [
{ jid: global.conn.user.jid, isMain: true, uptime: global.conn.uptime },
...global.conns
.filter(c => c.user && c.ws.socket && c.ws.socket.readyState !== ws.CLOSED)
.map(c => ({ jid: c.user.jid, isMain: false, uptime: c.uptime }))
];

// Filtrar los bots que están en el grupo actual
const botsInGroup = allBots.filter(bot => participants.some(p => p.id === bot.jid));

const formatBotList = (bots) => {
if (bots.length === 0) return "No hay bots de esta red en el grupo.";
return bots.map(bot => {
const uptime = bot.uptime ? formatUptime(Date.now() - bot.uptime) : "Recién conectado";
const role = bot.isMain ? "👑 Principal" : "🔌 Sub-Bot";
return `*•* @${bot.jid.split('@')[0]} (${role})\n   *Uptime:* ${uptime}`;
}).join('\n\n');
};

const statusMessage = `*🝮︎︎︎︎︎︎︎ ESTADO DE LA RED DE BOTS 🝮︎︎︎︎︎︎︎*\n\n` +
`*Bots Activos en este Grupo:*\n${formatBotList(botsInGroup)}\n\n` +
`*Total de Sub-Bots Conectados:* ${allBots.length - 1}`;

await conn.reply(m.chat, statusMessage, m, { mentions: botsInGroup.map(b => b.jid) });

} catch (error) {
console.error("Error en botlist:", error);
await m.reply("☂︎ Ocurrió un error al obtener la lista de bots.");
}
};

function formatUptime(ms) {
const s = Math.floor(ms / 1000);
const m = Math.floor(s / 60);
const h = Math.floor(m / 60);
const d = Math.floor(h / 24);
let parts = [];
if (d > 0) parts.push(`${d}d`);
if (h % 24 > 0) parts.push(`${h % 24}h`);
if (m % 60 > 0) parts.push(`${m % 60}m`);
if (s % 60 > 0 && parts.length < 2) parts.push(`${s % 60}s`);
return parts.join(' ') || '0s';
}

handler.help = ["botlist"];
handler.tags = ["sockets"];
handler.command = ["botlist", "listbots"];
handler.group = true;

export default handler;