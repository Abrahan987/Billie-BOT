import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let handler = async (m, { conn }) => {
try {
await m.react('🚀');
await conn.reply(m.chat, "*Ejecutando prueba de velocidad...*\n\nEsto puede tardar un momento. ♫︎", m);

const { stdout, stderr } = await execAsync('python3 ./lib/ookla-speedtest.py --secure --share');

if (stderr) {
throw new Error(stderr);
}

const urlMatch = stdout.match(/https?:\/\/[^\s]+\.png/);
if (!urlMatch) {
throw new Error("No se pudo extraer la imagen del resultado del speedtest.");
}

const imageUrl = urlMatch[0];
const resultText = stdout.replace(imageUrl, '').trim();

await conn.sendFile(m.chat, imageUrl, 'speedtest.png', `*🝮︎︎︎︎︎︎︎ PRUEBA DE VELOCIDAD 🝮︎︎︎︎︎︎︎*\n\n${resultText}`, m);
await m.react('✔️');

} catch (error) {
await m.react('✖️');
console.error("Error en speedtest:", error);
await conn.reply(m.chat, `☂︎ ¡Oh, no! Ocurrió un error al ejecutar la prueba de velocidad.\n\n*Error:*\n\`\`\`${error.message}\`\`\``, m);
}};

handler.help = ['speedtest'];
handler.tags = ['main'];
handler.command = ['speedtest', 'stest'];
handler.premium = true; // Comando que puede consumir recursos

export default handler;