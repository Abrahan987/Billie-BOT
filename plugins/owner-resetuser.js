let handler = async (m, { conn, text, usedPrefix, command }) => {
const target = m.mentionedJid?.[0] || m.quoted?.sender;
if (!target) {
return m.reply(`${global.decor} ¿Los datos de qué usuario quieres restablecer?\n\n*Formato:* ${usedPrefix + command} @usuario`);
}

const user = global.db.data.users[target];
if (!user) {
return m.reply("☂︎ El usuario no se encuentra en mi base de datos.");
}

// Sistema de confirmación
const confirmId = `${m.sender}-${target}`;
conn.resetUserConfirm = conn.resetUserConfirm || {};
if (!conn.resetUserConfirm[confirmId]) {
conn.resetUserConfirm[confirmId] = {
timestamp: Date.now()
};
return m.reply(`*⚠️ CONFIRMACIÓN REQUERIDA ⚠️*\n\n` +
`Estás a punto de eliminar *TODOS* los datos del usuario @${target.split('@')[0]}, incluyendo su progreso en RPG, harén, etc.\n\n` +
`*Esta acción es irreversible.*\n\n` +
`Vuelve a ejecutar el comando para confirmar.`, null, { mentions: [target] });
}

const confirmation = conn.resetUserConfirm[confirmId];
if (Date.now() - confirmation.timestamp > 30000) { // 30 segundos
delete conn.resetUserConfirm[confirmId];
return m.reply("☂︎ La confirmación ha expirado. Inicia el proceso de nuevo.");
}

// Restablecer los datos del usuario a un objeto vacío
global.db.data.users[target] = {};

delete conn.resetUserConfirm[confirmId];

await conn.reply(m.chat, `*${global.decor} ¡Datos de usuario restablecidos!*\n\n` +
`Todos los datos de @${target.split('@')[0]} han sido eliminados de la base de datos.`, m, { mentions: [target] });
};

handler.help = ['resetuser @usuario'];
handler.tags = ['owner'];
handler.command = ['resetuser', 'restablecer'];
handler.owner = true;

export default handler;