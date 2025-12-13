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

function formatTime(ms) {
    if (ms <= 0) return 'Ahora';
    const totalSec = Math.ceil(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const parts = [];
    if (h > 0) parts.push(`${h} hora${h !== 1 ? 's' : ''}`);
    if (m > 0 || h > 0) parts.push(`${m} minuto${m !== 1 ? 's' : ''}`);
    parts.push(`${s} segundo${s !== 1 ? 's' : ''}`);
    return parts.join(' ');
}

let handler = async (m, { conn, usedPrefix }) => {
    const chat = global.db.data.chats?.[m.chat] || {};
    if (!chat.gacha && m.isGroup) {
        return m.reply(`☁︎ Los comandos de Gacha están desactivados. ☁︎\n\nUn administrador puede activarlos con:\n*${usedPrefix}gacha on*`);
    }

    try {
        const user = global.db.data.users[m.sender];
        if (!Array.isArray(user.characters)) user.characters = [];

        const now = Date.now();
        const rollCooldown = user.lastRoll && now < user.lastRoll ? user.lastRoll - now : 0;
        const claimCooldown = user.lastClaim && now < user.lastClaim ? user.lastClaim - now : 0;
        const voteCooldown = user.lastVote && now < user.lastVote ? user.lastVote - now : 0;

        const allCharactersData = await loadCharacters();
        const flatCharacters = flattenCharacters(allCharactersData);
        const totalCharacters = flatCharacters.length;
        const totalSeries = Object.keys(allCharactersData).length;

        const ownedChars = Object.entries(global.db.data.characters || {})
            .filter(([, char]) => char.user === m.sender)
            .map(([id]) => id);

        const totalValue = ownedChars.reduce((sum, id) => {
            const dbCharValue = global.db.data.characters?.[id]?.value;
            const charValue = flatCharacters.find(c => c.id === id)?.value || 0;
            const value = typeof dbCharValue === 'number' ? dbCharValue : charValue;
            return sum + value;
        }, 0);

        let userName = user.name || (await conn.getName(m.sender).catch(() => m.sender.split('@')[0]));

        const infoText = `*♫︎ Información Gacha de ${userName} ♫︎*\n\n` +
                         `*➪ Roll:* ${formatTime(rollCooldown)}\n` +
                         `*➪ Claim:* ${formatTime(claimCooldown)}\n` +
                         `*➪ Voto:* ${formatTime(voteCooldown)}\n\n` +
                         `*♪ Personajes Reclamados:* ${ownedChars.length}\n` +
                         `*♪ Valor Total:* ${totalValue.toLocaleString()}\n` +
                         `*♪ Personajes Totales:* ${totalCharacters}\n` +
                         `*♪ Series Totales:* ${totalSeries}`;

        await m.reply(infoText.trim());

    } catch (error) {
        await conn.reply(m.chat, `☂︎ Ocurrió un error. ☂︎\n\n${error.message}`, m);
    }
};

handler.help = ['gachainfo'];
handler.tags = ['gacha'];
handler.command = ['ginfo', 'gachainfo', 'infogacha'];
handler.group = true;

export default handler;
