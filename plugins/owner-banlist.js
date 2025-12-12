let handler = async (m, { conn }) => {
const bannedUsers = Object.entries(global.db.data.users)
.filter(([, user]) => user.banned)
.map(([jid, user]) => ({ jid, reason: user.bannedReason || 'Sin motivo' }));

if (bannedUsers.length === 0) {
return m.reply("✨ ¡Excelente! No hay ningún usuario baneado en la base de datos.");
}

const userList = bannedUsers.map(user => `*•* @${user.jid.split('@')[0]}\n   *Motivo:* ${user.reason}`).join('\n\n');

const listMessage = `*🝮︎︎︎︎︎︎︎ LISTA DE USUARIOS BANEADOS 🝮︎︎︎︎︎︎︎*\n\n` +
`*Total:* ${bannedUsers.length}\n\n` +
`${userList}`;

await conn.reply(m.chat, listMessage, m, { mentions: bannedUsers.map(u => u.jid) });
};

handler.help = ['banlist'];
handler.tags = ['owner'];
handler.command = ['banlist', 'listban'];
handler.owner = true;

export default handler;