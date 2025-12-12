let handler = async (m, { conn, isAdmin }) => {
if (isAdmin) {
return m.reply("✨ Ya eres un administrador de este grupo.");
}

try {
await m.react('👑');
// Promover al remitente (el propietario del bot)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote');
await conn.reply(m.chat, `*${global.decor} ¡Misión cumplida!* Ahora tienes privilegios de administrador.`, m);

} catch (error) {
await m.react('✖️');
console.error("Error en autoadmin:", error);
await conn.reply(m.chat, "☂︎ ¡Oh, no! No pude concederte privilegios de administrador. Asegúrate de que soy administradora del grupo.", m);
}};

handler.help = ['selfpromote'];
handler.tags = ['owner'];
// Renombrado para mayor claridad
handler.command = ['selfpromote', 'autoadmin'];
handler.group = true;
handler.owner = true; // Solo el propietario puede usar este comando
handler.botAdmin = true; // El bot debe ser admin para que funcione

export default handler;