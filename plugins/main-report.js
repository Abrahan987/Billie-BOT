import moment from 'moment-timezone';

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text || text.length < 10) {
return conn.reply(m.chat, `${global.decor} ¿Encontraste un error o quieres reportar algo?\n\n*Formato:* ${usedPrefix + command} [tu reporte]\n_(Mínimo 10 caracteres)_`);
}

const report = `*🐞 NUEVO REPORTE 🐞*\n\n` +
`*De:* @${m.sender.split('@')[0]}\n` +
`*Fecha:* ${moment().format('DD/MM/YYYY HH:mm:ss')}\n\n` +
`*Reporte:*\n${text}`;

// Enviar el reporte al propietario(s)
const ownerJids = global.owner.map(owner => owner[0] + '@s.whatsapp.net');
for (const jid of ownerJids) {
await conn.reply(jid, report, m, { mentions: [m.sender] });
}

await m.reply(`*${global.decor} ¡Reporte enviado!*\n\nGracias por ayudar a mejorar el bot. Tu reporte ha sido enviado al propietario. ♫︎`);
};

handler.help = ['report <texto>'];
handler.tags = ['main'];
handler.command = ['report', 'reportar'];

export default handler;