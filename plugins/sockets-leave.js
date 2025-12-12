let handler = async (m, { conn }) => {
// Solo el propietario o los sub-bots pueden usar este comando
const isAllowed = m.isOwner || global.conns.some(c => c.user.jid === m.sender);
if (!isAllowed) {
return m.reply("☂︎ Este comando solo puede ser utilizado por el propietario del bot o por un sub-bot.");
}

try {
await m.reply("Adiós a todos, me voy del grupo. ♫︎");
await conn.groupLeave(m.chat);
} catch (error) {
console.error("Error al salir del grupo:", error);
await m.reply("☂︎ ¡Oh, no! No pude salir del grupo. Puede que ya no sea miembro.");
}
};

handler.help = ['leave'];
handler.tags = ['sockets'];
handler.command = ['leave', 'salir'];
handler.group = true;

export default handler;