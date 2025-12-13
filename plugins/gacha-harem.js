import { promises as fs } from 'fs';

const charactersFilePath = './lib/characters.json';

async function loadCharacters() {
    const data = await fs.readFile(charactersFilePath, 'utf-8');
    return JSON.parse(data);
}

function flattenCharacters(charactersData) {
    return Object.values(charactersData)
        .flatMap(series => Array.isArray(series.characters) ? series.characters : []);
}

let handler = async (m, { conn, args, usedPrefix }) => {
    const chat = global.db.data.chats?.[m.chat] || {};
    if (!chat.gacha && m.isGroup) {
        return m.reply(`☁︎ Los comandos de Gacha están desactivados. ☁︎\n\nUn administrador puede activarlos con:\n*${usedPrefix}gacha on*`);
    }

    try {
        if (!global.db.data.users) global.db.data.users = {};
        if (!global.db.data.characters) global.db.data.characters = {};

        let targetUser = m.mentionedJid?.[0] || m.quoted?.sender || m.sender;
        let userName = await conn.getName(targetUser).catch(() => targetUser.split('@')[0]);

        const allCharactersData = await loadCharacters();
        const flatCharacters = flattenCharacters(allCharactersData);

        const ownedCharIds = Object.entries(global.db.data.characters)
            .filter(([, char]) => (char.user || '').replace(/[^0-9]/g, '') === targetUser.replace(/[^0-9]/g, ''))
            .map(([id]) => id);

        if (ownedCharIds.length === 0) {
            const replyText = targetUser === m.sender ?
                '☁︎ No tienes personajes reclamados. ☁︎' :
                `☁︎ *${userName}* no tiene personajes reclamados. ☁︎`;
            return conn.reply(m.chat, replyText, m, { mentions: [targetUser] });
        }

        ownedCharIds.sort((a, b) => {
            const charA = global.db.data.characters[a] || {};
            const charB = global.db.data.characters[b] || {};
            const infoA = flatCharacters.find(c => c.id === a);
            const infoB = flatCharacters.find(c => c.id === b);
            const valueA = typeof charA.value === 'number' ? charA.value : (infoA?.value || 0);
            const valueB = typeof charB.value === 'number' ? charB.value : (infoB?.value || 0);
            return valueB - valueA;
        });

        const page = parseInt(args[0]) || 1;
        const pageSize = 32;
        const totalPages = Math.ceil(ownedCharIds.length / pageSize);

        if (page < 1 || page > totalPages) {
            return conn.reply(m.chat, `☂︎ Página no válida. Hay un total de *${totalPages}* páginas. ☂︎`, m);
        }

        const startIndex = (page - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, ownedCharIds.length);

        let haremText = `*♫︎ Harén de ${userName} ♫︎*\n`;
        haremText += `*♪ Personajes:* ${ownedCharIds.length}\n\n`;

        for (let i = startIndex; i < endIndex; i++) {
            const charId = ownedCharIds[i];
            const dbChar = global.db.data.characters[charId] || {};
            const charInfo = flatCharacters.find(c => c.id === charId);
            const charName = charInfo?.name || dbChar.name || `ID: ${charId}`;
            const charValue = typeof dbChar.value === 'number' ? dbChar.value : (charInfo?.value || 0);
            haremText += `*➪ ${charName}* (Valor: ${charValue.toLocaleString()})\n`;
        }

        haremText += `\n*Página ${page} de ${totalPages}*`;

        await conn.reply(m.chat, haremText.trim(), m, { mentions: [targetUser] });

    } catch (error) {
        await conn.reply(m.chat, `☂︎ Ocurrió un error. ☂︎\n\n${error.message}`, m);
    }
};

handler.help = ['harem'];
handler.tags = ['anime'];
handler.command = ['harem', 'waifus', 'claims'];
handler.group = true;

export default handler;
