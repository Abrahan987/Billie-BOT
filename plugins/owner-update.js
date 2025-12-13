import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let handler = async (m, { conn, usedPrefix, command }) => {
try {
await m.react('🔄');
await conn.reply(m.chat, "*Buscando actualizaciones...*", m);

// 1. Comprobar si hay cambios locales sin confirmar
const { stdout: status } = await execAsync('git status --porcelain');
if (status.trim()) {
await m.react('⚠️');
return conn.reply(m.chat, `*☁︎ ADVERTENCIA: CAMBIOS LOCALES ☁︎*\n\n` +
`No puedo actualizar automáticamente porque hay cambios locales sin guardar:\n\n` +
`\`\`\`\n${status}\`\`\`\n\n` +
`Por favor, guarda tus cambios o restáuralos.`, m);
}

// 2. Obtener el commit actual
const { stdout: currentCommit } = await execAsync('git rev-parse HEAD');

// 3. Obtener las últimas actualizaciones del repositorio remoto
await execAsync('git fetch');

// 4. Comprobar si hay diferencias
const { stdout: diff } = await execAsync('git diff HEAD...origin/main');
if (!diff.trim()) {
await m.react('✅');
return conn.reply(m.chat, "*♫︎ ¡Estás al día!* No hay nuevas actualizaciones.", m);
}

// 5. Aplicar las actualizaciones
const { stdout: pull } = await execAsync('git pull origin main');
await m.react('✔️');

// 6. Mostrar el resultado
const updateLog = `*♫︎ ¡Actualización Completada! ♫︎*\n\n` +
`Me he actualizado correctamente. Se recomienda reiniciar para aplicar todos los cambios.\n\n` +
`*Resumen:*\n` +
`\`\`\`\n${pull}\n\`\`\``;

await conn.reply(m.chat, updateLog, m);

} catch (error) {
await m.react('✖️');
console.error("Error al actualizar:", error);
await conn.reply(m.chat, `*☂︎ ¡Oh, no! Ocurrió un error al actualizar.*\n\n` +
`*Error:*\n\`\`\`\n${error.stderr || error.message}\n\`\`\``, m);
}};

handler.help = ['update'];
handler.tags = ['owner'];
handler.command = ['update', 'actualizar'];
handler.owner = true;

export default handler;