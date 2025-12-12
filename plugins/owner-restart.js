let handler = async (m, { conn, usedPrefix, command }) => {
// Sistema de confirmación
const confirmId = m.sender;
conn.restartConfirm = conn.restartConfirm || {};
if (!conn.restartConfirm[confirmId]) {
conn.restartConfirm[confirmId] = {
timestamp: Date.now()
};
return m.reply(`*⚠️ CONFIRMACIÓN REQUERIDA ⚠️*\n\n` +
`¿Estás seguro de que quieres reiniciar el bot? Esto interrumpirá todos los procesos en ejecución.\n\n` +
`*Vuelve a ejecutar el comando \`${usedPrefix + command}\` para confirmar.*`);
}

const confirmation = conn.restartConfirm[confirmId];
if (Date.now() - confirmation.timestamp > 30000) { // 30 segundos
delete conn.restartConfirm[confirmId];
return m.reply("☂︎ La confirmación ha expirado. Inicia el proceso de nuevo.");
}

try {
await conn.reply(m.chat, `*${global.decor} Reiniciando el sistema...*\n\nPor favor, espera un momento. ♫︎`, m);
// Eliminar la confirmación antes de reiniciar
delete conn.restartConfirm[confirmId];
// Envía una señal de reinicio al proceso principal
if (process.send) {
process.send("restart");
} else {
// Si no se puede enviar una señal, salir del proceso (el gestor de procesos como PM2 debería reiniciarlo)
process.exit(0);
}
} catch (error) {
console.error("Error al reiniciar:", error);
await conn.reply(m.chat, "☂︎ ¡Oh, no! Ocurrió un error y no pude reiniciar. Revisa la consola para más detalles.", m);
}};

handler.help = ['restart'];
handler.tags = ['owner'];
handler.command = ['restart', 'reiniciar'];
handler.owner = true;

export default handler;