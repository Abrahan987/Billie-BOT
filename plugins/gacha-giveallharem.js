import { promises as fs } from 'fs';

const charactersFilePath = './lib/characters.json';
let pending = {};

async function loadCharacters() {
    const data = await fs.readFile(charactersFilePath, 'utf-8');
    return JSON.parse(data);
}

function flattenCharacters(charactersData) {
    return Object.values(charactersData)
        .flatMap(series => Array.isArray(series.characters) ? series.characters : []);
}

let handler = async (m, { conn, usedPrefix, command }) => {
    const chat = global.db.data.chats?.[m.chat] || {};
    if (!chat.gacha && m.isGroup) {
        return m.reply(`☁︎ Los comandos de Gacha están desactivados. ☁︎\n\nUn administrador puede activarlos con:\n*${usedPrefix}gacha on*`);
    }

    try {
        const sender = global.db.data.users[m.sender];
        if (!Array.isArray(sender.characters)) sender.characters = [];

        const targetJid = m.mentionedJid[0] || (m.quoted && m.quoted.sender);
        if (!targetJid || typeof targetJid !== 'string' || !targetJid.includes('@')) {
            return m.reply(`☁︎ Debes mencionar a quién quieres regalarle todo tu harén. ☁︎`);
        }

        const targetUser = global.db.data.users[targetJid];
        if (!targetUser) {
            return m.reply('☂︎ El usuario mencionado no está registrado. ☂︎');
        }
        if (!Array.isArray(targetUser.characters)) targetUser.characters = [];

        const allCharacters = await loadCharacters();
        const flatCharacters = flattenCharacters(allCharacters);

        const ownedChars = sender.characters.map(id => {
            const dbChar = global.db.data.characters?.[id] || {};
            const charInfo = flatCharacters.find(c => c.id === id);
            const value = typeof dbChar.value === 'number' ? dbChar.value : (charInfo?.value || 0);
            return {
                id,
                name: dbChar.name || charInfo?.name || `ID: ${id}`,
                value
            };
        });

        if (ownedChars.length === 0) {
            return m.reply('☂︎ No tienes personajes para regalar. ☂︎');
        }

        const totalValue = ownedChars.reduce((sum, char) => sum + char.value, 0);

        let targetName = await conn.getName(targetJid).catch(() => targetJid.split('@')[0]);
        let senderName = await conn.getName(m.sender).catch(() => m.sender.split('@')[0]);

        pending[m.sender] = {
            sender: m.sender,
            to: targetJid,
            value: totalValue,
            count: ownedChars.length,
            ids: ownedChars.map(c => c.id),
            chat: m.chat,
            timeout: setTimeout(() => delete pending[m.sender], 60000) // 1 minute timeout
        };

        await conn.reply(m.chat,
            `*☁︎ ${senderName}, ¿confirmas regalar todo tu harén a ${targetName}? ☁︎*\n\n` +
            `*➪ Personajes a transferir:* ${ownedChars.length}\n` +
            `*➪ Valor total:* ${totalValue.toLocaleString()}\n\n` +
            `Para confirmar, responde a este mensaje con "aceptar".`,
            m, { mentions: [targetJid] });

    } catch (error) {
        await conn.reply(m.chat, `☂︎ Ocurrió un error. ☂︎\n\n${error.message}`, m);
    }
};

handler.before = async (m, { conn }) => {
    try {
        const session = pending[m.sender];
        if (!session || m.quoted?.text.toLowerCase() !== 'aceptar') return;
        if (m.sender !== session.sender || session.chat !== m.chat) return;

        const senderUser = global.db.data.users[m.sender];
        const targetUser = global.db.data.users[session.to];

        for (const charId of session.ids) {
            const dbChar = global.db.data.characters?.[charId];
            if (!dbChar || dbChar.user !== m.sender) continue;

            dbChar.user = session.to;
            if (!targetUser.characters.includes(charId)) {
                targetUser.characters.push(charId);
            }
            senderUser.characters = senderUser.characters.filter(id => id !== charId);

            if (senderUser.favorite === charId) {
                delete senderUser.favorite;
            }
        }

        clearTimeout(session.timeout);
        delete pending[m.sender];

        let targetName = await conn.getName(session.to).catch(() => session.to.split('@')[0]);

        return await m.reply(`*♫︎ ¡Transferencia completada! ♫︎*\n\n` +
                             `Has regalado *${session.count}* personajes con un valor total de *${session.value.toLocaleString()}* a *${targetName}*.`);
    } catch (error) {
        await conn.reply(m.chat, `☂︎ Ocurrió un error en la confirmación. ☂︎\n\n${error.message}`, m);
    }
};

handler.help = ['giveallharem'];
handler.tags = ['gacha'];
handler.command = ['giveallharem'];
handler.group = true;

export default handler;
