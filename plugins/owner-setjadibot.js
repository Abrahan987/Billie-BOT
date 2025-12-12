let handler = async (m, { conn, text, usedPrefix, command }) => {
const botSettings = global.db.data.settings[conn.user.jid];
if (!botSettings) {
return m.reply("☂︎ No se encontraron las configuraciones del bot.");
}

const action = text.trim().toLowerCase();

if (action === 'on' || action === 'enable') {
if (botSettings.jadibotmd) {
return m.reply("✨ El modo Jadibot ya está activado.");
}
botSettings.jadibotmd = true;
await m.reply(`*${global.decor} ¡Modo Jadibot activado!*\n\nAhora otros usuarios podrán conectarse como sub-bots.`);
} else if (action === 'off' || action === 'disable') {
if (!botSettings.jadibotmd) {
return m.reply("✨ El modo Jadibot ya está desactivado.");
}
botSettings.jadibotmd = false;
await m.reply(`*${global.decor} ¡Modo Jadibot desactivado!*\n\nLa conexión de nuevos sub-bots ha sido deshabilitada.`);
} else {
const status = botSettings.jadibotmd ? '🟢 ACTIVADO' : '🔴 DESACTIVADO';
const helpMessage = `*🝮︎︎︎︎︎︎︎ GESTIÓN DE JADIBOT 🝮︎︎︎︎︎︎︎*\n\n` +
`*Estado actual:* ${status}\n\n` +
`Controla si otros usuarios pueden conectarse como sub-bots.\n\n` +
`*Comandos disponibles:*\n` +
`*   \`${usedPrefix + command} on\` - Permite la conexión de sub-bots.\n` +
`*   \`${usedPrefix + command} off\` - Bloquea la conexión de nuevos sub-bots.`;
await m.reply(helpMessage);
}
};

handler.help = ['setjadibot <on|off>'];
handler.tags = ['owner'];
handler.command = ['setjadibot', 'jadibot'];
handler.owner = true;

export default handler;