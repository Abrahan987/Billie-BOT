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
return conn.reply(m.chat, `*⚠️ ADVERTENCIA: CAMBIOS LOCALES DETECTADOS ⚠️*\n\n` +
`No se puede actualizar automáticamente porque hay cambios locales sin confirmar:\n\n` +
`\`\`\`\n${status}\`\`\`\n\n` +
`Por favor, confirma tus cambios o restáuralos antes de actualizar.`, m);
}

// 2. Obtener el commit actual
const { stdout: currentCommit } = await execAsync('git rev-parse HEAD');

// 3. Obtener las últimas actualizaciones del repositorio remoto
await execAsync('git fetch');

// 4. Comprobar si hay diferencias
const { stdout: diff } = await execAsync('git diff HEAD...origin/main');
if (!diff.trim()) {
await m.react('✅');
return conn.reply(m.chat, "*✨ ¡Estás al día!* No hay nuevas actualizaciones disponibles.", m);
}

// 5. Aplicar las actualizaciones
const { stdout: pull } = await execAsync('git pull origin main');
await m.react('✔️');

// 6. Mostrar el resultado
const updateLog = `*🝮︎︎︎︎︎︎︎ ACTUALIZACIÓN COMPLETADA 🝮︎︎︎︎︎︎︎*\n\n` +
`El bot ha sido actualizado correctamente. Se recomienda reiniciar para aplicar todos los cambios.\n\n` +
`*--- Resumen de la Actualización ---*\n` +
`\`\`\`\n${pull}\n\`\`\``;

await conn.reply(m.chat, updateLog, m);

} catch (error) {
await m.react('✖️');
console.error("Error al actualizar:", error);
await conn.reply(m.chat, `*☂︎ ¡Oh, no! Ocurrió un error al intentar actualizar.*\n\n` +
`*Error:*\n\`\`\`\n${error.stderr || error.message}\n\`\`\``, m);
}};

handler.help = ['update'];
handler.tags = ['owner'];
handler.command = ['update', 'actualizar'];
handler.owner = true;

export default handler;