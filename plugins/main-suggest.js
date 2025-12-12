import moment from 'moment-timezone';

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text || text.length < 10) {
return conn.reply(m.chat, `${global.decor} ¿Tienes alguna sugerencia para mejorar el bot?\n\n*Formato:* ${usedPrefix + command} [tu sugerencia]\n_(Mínimo 10 caracteres)_`);
}

const suggestion = `*📬 NUEVA SUGERENCIA 📬*\n\n` +
`*De:* @${m.sender.split('@')[0]}\n` +
`*Fecha:* ${moment().format('DD/MM/YYYY HH:mm:ss')}\n\n` +
`*Sugerencia:*\n${text}`;

// Enviar la sugerencia al propietario(s)
const ownerJids = global.owner.map(owner => owner[0] + '@s.whatsapp.net');
for (const jid of ownerJids) {
await conn.reply(jid, suggestion, m, { mentions: [m.sender] });
}

await m.reply(`*${global.decor} ¡Sugerencia enviada!*\n\nGracias por tu contribución. Tu sugerencia ha sido enviada al propietario del bot. ♫︎`);
};

handler.help = ['suggest <texto>'];
handler.tags = ['main'];
handler.command = ['suggest', 'sugerencia'];

export default handler;