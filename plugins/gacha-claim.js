import { promises as fs } from 'fs';

const charactersFilePath = './lib/characters.json';

async function loadCharacters() {
    const data = await fs.readFile(charactersFilePath, 'utf-8');
    return JSON.parse(data);
}

function getCharacterById(id, charactersData) {
    return Object.values(charactersData)
        .flatMap(series => series.characters)
        .find(char => char.id === id);
}

let handler = async (m, { conn, usedPrefix, command }) => {
    const chat = global.db.data.chats?.[m.chat] || {};
    if (!chat.gacha && m.isGroup) {
        return m.reply(`☁︎ Los comandos de Gacha están desactivados en este grupo. ☁︎\n\nUn administrador puede activarlos con:\n*${usedPrefix}gacha on*`);
    }

    try {
        const user = global.db.data.users[m.sender];
        const now = Date.now();
        const cooldown = 30 * 60 * 1000; // 30 minutes

        if (user.lastClaim && now < user.lastClaim) {
            const remaining = Math.ceil((user.lastClaim - now) / 1000);
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            let timeString = '';
            if (minutes > 0) timeString += `${minutes} minuto${minutes !== 1 ? 's' : ''} `;
            if (seconds > 0 || timeString === '') timeString += `${seconds} segundo${seconds !== 1 ? 's' : ''}`;

            return m.reply(`☂︎ Debes esperar *${timeString.trim()}* para volver a reclamar. ☂︎`);
        }

        const lastRolledMsgId = chat.lastRolledMsgId || '';
        const isValidClaim = m.quoted?.id === chat.lastRolledMsgId || (m.quoted?.mentionedJid?.includes(lastRolledMsgId) && lastRolledMsgId);

        if (!isValidClaim) {
            return m.reply('☁︎ Responde al personaje que quieres reclamar. ☁︎');
        }

        const characterId = chat.lastRolledId;
        const allCharacters = await loadCharacters();
        const character = getCharacterById(characterId, allCharacters);

        if (!character) {
            return m.reply('☂︎ Personaje no encontrado. ☂︎');
        }

        if (!global.db.data.characters) global.db.data.characters = {};
        if (!global.db.data.characters[characterId]) global.db.data.characters[characterId] = {};

        const dbChar = global.db.data.characters[characterId];
        dbChar.name = dbChar.name || character.name;
        dbChar.value = typeof dbChar.value === 'number' ? dbChar.value : (character.value || 0);
        dbChar.votes = dbChar.votes || 0;

        if (dbChar.user && dbChar.user !== m.sender && now < dbChar.reservedUntil) {
            let ownerName = await conn.getName(dbChar.user).catch(() => dbChar.user.split('@')[0]);
            const protectionTime = ((dbChar.reservedUntil - now) / 1000).toFixed(1);
            return m.reply(`☂︎ Este personaje está protegido por *${ownerName}* durante *${protectionTime}s*. ☂︎`);
        }

        if (dbChar.user) {
            let ownerName = await conn.getName(dbChar.user).catch(() => dbChar.user.split('@')[0]);
            return m.reply(`☂︎ El personaje *${dbChar.name}* ya ha sido reclamado por *${ownerName}*. ☂︎`);
        }

        dbChar.user = m.sender;
        dbChar.claimedAt = now;
        delete dbChar.reservedBy;
        delete dbChar.reservedUntil;
        user.lastClaim = now + cooldown;

        if (!Array.isArray(user.characters)) user.characters = [];
        if (!user.characters.includes(characterId)) user.characters.push(characterId);

        let claimantName = user.name || (await conn.getName(m.sender).catch(() => m.sender.split('@')[0]));
        const characterName = dbChar.name;

        const claimMsg = chat.claimMessage ?
            chat.claimMessage.replace(/€user/g, `*${claimantName}*`).replace(/€character/g, `*${characterName}*`) :
            `*${characterName}* ha sido reclamado por *${claimantName}*`;

        await conn.reply(m.chat, `♫︎ ${claimMsg} ♫︎`, m);

    } catch (error) {
        await conn.reply(m.chat, `☂︎ Ocurrió un error. ☂︎\n\n${error.message}`, m);
    }
};

handler.help = ['claim'];
handler.tags = ['gacha'];
handler.command = ['claim', 'c', 'reclamar'];
handler.group = true;

export default handler;
