let handler = async (m, { conn, args, usedPrefix }) => {
    const chat = global.db.data.chats?.[m.chat] || {};
    if (!chat.gacha && m.isGroup) {
        return m.reply(`☁︎ Los comandos de Gacha están desactivados. ☁︎\n\nUn administrador puede activarlos con:\n*${usedPrefix}gacha on*`);
    }

    try {
        const senderUser = global.db.data.users[m.sender];
        if (!Array.isArray(senderUser.characters)) senderUser.characters = [];

        if (!args.length) {
            return m.reply(`☁︎ Debes escribir el nombre del personaje y mencionar al usuario al que se lo quieres regalar. ☁︎`);
        }

        const targetJid = m.mentionedJid[0] || m.quoted?.sender;
        if (!targetJid) {
            return m.reply('☁︎ Debes mencionar o responder al mensaje del destinatario. ☁︎');
        }

        const characterName = (m.quoted ? args.join(' ') : args.slice(0, -1).join(' ')).toLowerCase().trim();

        const characterId = Object.keys(global.db.data.characters).find(id => {
            const char = global.db.data.characters[id];
            return typeof char.name === 'string' && char.name.toLowerCase() === characterName && char.user === m.sender;
        });

        if (!characterId) {
            return m.reply(`☂︎ No se encontró el personaje *${characterName}* o no te pertenece. ☂︎`);
        }

        const character = global.db.data.characters[characterId];

        const targetUser = global.db.data.users[targetJid];
        if (!targetUser) {
            return m.reply('☂︎ El usuario mencionado no está registrado. ☂︎');
        }
        if (!Array.isArray(targetUser.characters)) targetUser.characters = [];

        // Transfer character
        if (!targetUser.characters.includes(characterId)) {
            targetUser.characters.push(characterId);
        }
        senderUser.characters = senderUser.characters.filter(id => id !== characterId);
        character.user = targetJid;

        if (senderUser.favorite === characterId) {
            delete senderUser.favorite;
        }

        let senderName = await conn.getName(m.sender).catch(() => m.sender.split('@')[0]);
        let targetName = await conn.getName(targetJid).catch(() => targetJid.split('@')[0]);

        await conn.reply(m.chat, `*♫︎ ¡Regalo Exitoso! ♫︎*\n\n*${character.name}* ha sido regalado a *${targetName}* por *${senderName}*.`, m, { mentions: [targetJid] });

    } catch (error) {
        await conn.reply(m.chat, `☂︎ Ocurrió un error. ☂︎\n\n${error.message}`, m);
    }
};

handler.help = ['givechar'];
handler.tags = ['gacha'];
handler.command = ['regalar', 'givechar', 'givewaifu'];
handler.group = true;

export default handler;
