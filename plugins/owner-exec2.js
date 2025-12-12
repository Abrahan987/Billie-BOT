import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) {
return m.reply(`${global.decor} ¿Qué comando de terminal quieres ejecutar?\n\n*Formato:* ${usedPrefix + command} [comando]`);
}

// Sistema de confirmación para comandos peligrosos
const dangerousCommands = ['rm', 'mv', 'dd', 'reboot', 'shutdown', 'pkill', 'killall'];
if (dangerousCommands.some(cmd => text.includes(cmd)) && (!conn.exec2Confirm || !conn.exec2Confirm[m.sender])) {
conn.exec2Confirm = conn.exec2Confirm || {};
conn.exec2Confirm[m.sender] = { timestamp: Date.now() };
return m.reply(`*⚠️ ADVERTENCIA DE SEGURIDAD ⚠️*\n\n` +
`El comando que intentas ejecutar es potencialmente destructivo.\n\n` +
`*Vuelve a ejecutar el comando para confirmar tu acción.*`);
}

if (conn.exec2Confirm && conn.exec2Confirm[m.sender]) {
if (Date.now() - conn.exec2Confirm[m.sender].timestamp > 30000) {
delete conn.exec2Confirm[m.sender];
return m.reply("☂︎ La confirmación ha expirado. Vuelve a intentarlo.");
}
delete conn.exec2Confirm[m.sender];
}

let stdout = '', stderr = '';
try {
await m.react('⚙️');
const { stdout: out, stderr: err } = await execAsync(text);
stdout = out;
stderr = err;
await m.react('✔️');
} catch (e) {
stderr = e.toString();
await m.react('✖️');
}

const output = `*🝮︎︎︎︎︎︎︎ EJECUCIÓN DE TERMINAL 🝮︎︎︎︎︎︎︎*\n\n` +
`*--- COMANDO ---*\n\`\`\`bash\n$ ${text}\n\`\`\`\n\n` +
`*--- STDOUT ---*\n\`\`\`\n${stdout.trim() || 'Vacío'}\n\`\`\`\n\n` +
`*--- STDERR ---*\n\`\`\`\n${stderr.trim() || 'Sin errores'}\n\`\`\``;

await conn.reply(m.chat, output, m);
};

handler.help = ['exec2 <code>'];
handler.tags = ['owner'];
handler.command = ['exec2', '$', 'shell'];
handler.owner = true;

export default handler;