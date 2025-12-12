import { format } from 'util';
import syntaxerror from 'syntax-error';

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) {
return m.reply(`${global.decor} ¿Qué código de JavaScript quieres ejecutar?\n\n*Formato:* ${usedPrefix + command} [código]`);
}

// Sistema de confirmación para código potencialmente destructivo
if (/fs|child_process|process|exit/i.test(text) && (!conn.execConfirm || !conn.execConfirm[m.sender])) {
conn.execConfirm = conn.execConfirm || {};
conn.execConfirm[m.sender] = { timestamp: Date.now() };
return m.reply(`*⚠️ ADVERTENCIA DE SEGURIDAD ⚠️*\n\n` +
`El código que intentas ejecutar contiene elementos que podrían ser peligrosos o destructivos.\n\n` +
`*Vuelve a ejecutar el comando para confirmar tu acción.*`);
}

if (conn.execConfirm && conn.execConfirm[m.sender]) {
if (Date.now() - conn.execConfirm[m.sender].timestamp > 30000) {
delete conn.execConfirm[m.sender];
return m.reply("☂︎ La confirmación ha expirado. Vuelve a intentarlo.");
}
delete conn.execConfirm[m.sender];
}

let result, error;
try {
await m.react('💻');
// Usar una función asíncrona anónima para permitir 'await'
const execAsync = new Function('m', 'conn', 'text', `return (async () => { ${text} })();`);
result = await execAsync(m, conn, text);
await m.react('✔️');
} catch (e) {
error = e;
await m.react('✖️');
}

const output = `*🝮︎︎︎︎︎︎︎ EJECUCIÓN DE CÓDIGO 🝮︎︎︎︎︎︎︎*\n\n` +
`*--- CÓDIGO ---*\n\`\`\`javascript\n${text}\n\`\`\`\n\n` +
`*--- ${error ? 'ERROR' : 'RESULTADO'} ---*\n\`\`\`\n${error ? format(error) : format(result)}\n\`\`\``;

await conn.reply(m.chat, output, m);
};

handler.help = ['exec <code>'];
handler.tags = ['owner'];
handler.command = ['exec', '=>', '>']; // Mantener alias comunes
handler.owner = true;

export default handler;