let handler = async (m, { args, usedPrefix, command }) => {
    const chat = global.db.data.chats?.[m.chat] || {};
    if (!chat.gacha && m.isGroup) {
        return m.reply(`☁︎ Los comandos de Gacha están desactivados. ☁︎\n\nUn administrador puede activarlos con:\n*${usedPrefix}gacha on*`);
    }

    try {
        const user = global.db.data.users[m.sender];

        switch (command) {
            case 'setclaim':
            case 'setclaimmsg':
                if (!args[0]) {
                    return m.reply(`☁︎ Debes especificar un mensaje para reclamar un personaje. ☁︎\n> *Ejemplos:*\n> ${usedPrefix + command} ¡€user ha reclamado a €character!\n> ${usedPrefix + command} €character ahora le pertenece a €user.`);
                }
                const newMsg = args.join(' ');
                if (!newMsg.includes('€user') || !newMsg.includes('€character')) {
                    return m.reply('☂︎ Tu mensaje debe incluir €user y €character para que funcione. ☂︎');
                }
                user.claimMessage = newMsg;
                m.reply('♫︎ ¡Mensaje de reclamo actualizado! ♫︎');
                break;

            case 'delclaimmsg':
            case 'resetclaimmsg':
                delete user.claimMessage;
                m.reply('♫︎ Mensaje de reclamo restablecido a la configuración por defecto. ♫︎');
                break;
        }
    } catch (error) {
        await conn.reply(m.chat, `☂︎ Ocurrió un error. ☂︎\n\n${error.message}`, m);
    }
};

handler.help = ['setclaim <mensaje>', 'delclaimmsg'];
handler.tags = ['gacha'];
handler.command = ['setclaim', 'setclaimmsg', 'delclaimmsg', 'resetclaimmsg'];
handler.group = true;

export default handler;
