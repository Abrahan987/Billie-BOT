let pendingTrade = {};

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const chat = global.db.data.chats?.[m.chat] || {};
    if (!chat.gacha && m.isGroup) {
        return m.reply(`☁︎ Los comandos de Gacha están desactivados. ☁︎\n\nUn administrador puede activarlos con:\n*${usedPrefix}gacha on*`);
    }

    try {
        if (!args.length || !m.text.includes('/')) {
            return m.reply(`☁︎ Debes especificar dos personajes para intercambiar. ☁︎\n> *Ejemplo:* ${usedPrefix + command} Personaje1 / Personaje2`);
        }

        const tradeStr = m.text.substring(m.text.indexOf(' ') + 1);
        const [char1, char2] = tradeStr.split('/').map(name => name.toLowerCase().trim());

        const char1Id = Object.keys(global.db.data.characters).find(id =>
            (global.db.data.characters[id]?.name || '').toLowerCase() === char1 &&
            global.db.data.characters[id]?.user === m.sender
        );

        const char2Id = Object.keys(global.db.data.characters).find(id =>
            (global.db.data.characters[id]?.name || '').toLowerCase() === char2
        );

        if (!char1Id || !char2Id) {
            const notFound = !char1Id ? char1 : char2;
            return m.reply(`☂︎ No se encontró el personaje *${notFound}*. ☂︎`);
        }

        const char1Data = global.db.data.characters[char1Id];
        const char2Data = global.db.data.characters[char2Id];

        if (char2Data.user === m.sender) {
            return m.reply(`☂︎ El personaje *${char2Data.name}* ya te pertenece. ☂︎`);
        }
        if (!char2Data.user) {
            return m.reply(`☂︎ El personaje *${char2Data.name}* no le pertenece a nadie. ☂︎`);
        }

        const targetJid = char2Data.user;
        let senderName = await conn.getName(m.sender).catch(() => m.sender.split('@')[0]);
        let targetName = await conn.getName(targetJid).catch(() => targetJid.split('@')[0]);

        pendingTrade[targetJid] = {
            from: m.sender,
            to: targetJid,
            chat: m.chat,
            give: char1Id,
            get: char2Id,
            timeout: setTimeout(() => delete pendingTrade[targetJid], 60000) // 1 minute
        };

        await conn.reply(m.chat,
            `*♫︎ Solicitud de Intercambio ♫︎*\n\n` +
            `*${targetName}*, ${senderName} quiere intercambiar a *${char1Data.name}* (Valor: ${char1Data.value}) por tu *${char2Data.name}* (Valor: ${char2Data.value}).\n\n` +
            `Para aceptar, responde a este mensaje con "aceptar". La solicitud expira en 60 segundos.`,
            m, { mentions: [targetJid] });

    } catch (error) {
        await conn.reply(m.chat, `☂︎ Ocurrió un error. ☂︎\n\n${error.message}`, m);
    }
};

handler.before = async (m, { conn }) => {
    try {
        if (m.text?.trim().toLowerCase() !== 'aceptar') return;

        const session = Object.values(pendingTrade).find(p => p.chat === m.chat);
        if (!session) return;

        if (m.sender !== session.to) {
            let targetName = await conn.getName(session.to).catch(() => session.to.split('@')[0]);
            return m.reply(`☂︎ Solo *${targetName}* puede aceptar la solicitud. ☂︎`);
        }

        const char1 = global.db.data.characters[session.give];
        const char2 = global.db.data.characters[session.get];

        if (!char1 || !char2 || char1.user !== session.from || char2.user !== session.to) {
            delete pendingTrade[session.to];
            return m.reply('☂︎ Uno de los personajes ya no está disponible para el intercambio. ☂︎');
        }

        // Swap characters
        char1.user = session.to;
        char2.user = session.from;

        const senderUser = global.db.data.users[session.from];
        const targetUser = global.db.data.users[session.to];

        if (!targetUser.characters.includes(session.give)) targetUser.characters.push(session.give);
        if (!senderUser.characters.includes(session.get)) senderUser.characters.push(session.get);
        senderUser.characters = senderUser.characters.filter(id => id !== session.give);
        targetUser.characters = targetUser.characters.filter(id => id !== session.get);

        if (senderUser.favorite === session.give) delete senderUser.favorite;
        if (targetUser.favorite === session.get) delete targetUser.favorite;

        clearTimeout(session.timeout);
        delete pendingTrade[session.to];

        let fromName = await conn.getName(session.from).catch(() => session.from.split('@')[0]);
        let toName = await conn.getName(session.to).catch(() => session.to.split('@')[0]);

        return await m.reply(`*♫︎ ¡Intercambio Aceptado! ♫︎*\n\n`+
                             `*${toName}* recibe a *${char1.name}*.\n`+
                             `*${fromName}* recibe a *${char2.name}*.`);
    } catch (error) {
        await conn.reply(m.chat, `☂︎ Ocurrió un error en la confirmación. ☂︎\n\n${error.message}`, m);
    }
};

handler.help = ['trade <PersonajeA> / <PersonajeB>'];
handler.tags = ['gacha'];
handler.command = ['trade', 'intercambiar'];
handler.group = true;

export default handler;
