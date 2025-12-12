import speed from 'performance-now';
import { exec } from 'child_process';

let handler = async (m, { conn }) => {
const start = speed();
let pongMsg = await conn.reply(m.chat, "*Calculando...*", m);
const latency = speed() - start;

// Ejecutar un speedtest en segundo plano para obtener información de la red
exec('speedtest-cli --simple', (error, stdout, stderr) => {
let networkInfo = '';
if (stdout) {
const ping = stdout.match(/Ping: ([\d.]+) ms/)?.[1];
const download = stdout.match(/Download: ([\d.]+) Mbit\/s/)?.[1];
const upload = stdout.match(/Upload: ([\d.]+) Mbit\/s/)?.[1];
networkInfo = `*Ping del Servidor:* ${ping} ms\n*Descarga:* ${download} Mbit/s\n*Subida:* ${upload} Mbit/s`;
} else if (error) {
networkInfo = "No se pudo obtener la información de la red.";
}

const pongMessage = `*🏓 PONG! 🏓*\n\n` +
`*Latencia del Bot:* ${latency.toFixed(2)} ms\n` +
`${networkInfo}`;

conn.sendMessage(m.chat, { text: pongMessage, edit: pongMsg.key });
});
};

handler.help = ['ping'];
handler.tags = ['main'];
handler.command = ['ping', 'speed'];
handler.premium = true; // El speedtest puede consumir recursos

export default handler;