import fetch from 'node-fetch';
import { promises as fs } from 'fs';

const CHARACTERS_FILE_PATH = './lib/characters.json';

async function loadCharacters() {
    try {
        await fs.access(CHARACTERS_FILE_PATH);
    } catch {
        await fs.writeFile(CHARACTERS_FILE_PATH, '{}');
    }
    const data = await fs.readFile(CHARACTERS_FILE_PATH, 'utf-8');
    return JSON.parse(data);
}

function flattenCharacters(charactersData) {
    return Object.values(charactersData).flatMap(series => Array.isArray(series.characters) ? series.characters : []);
}

function getSeriesNameByCharacter(charactersData, characterId) {
    return Object.entries(charactersData).find(([, series]) =>
        Array.isArray(series.characters) && series.characters.some(char => String(char.id) === String(characterId))
    )?.[1]?.name || 'Desconocido';
}

function formatTag(tag) {
    return String(tag).toLowerCase().trim().replace(/\s+/g, '_');
}

async function searchImage(characterName) {
    const tagName = formatTag(characterName.split(' ')[0] || '');
    const endpoints = [
        `https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&tags=${tagName}`,
        `https://danbooru.donmai.us/posts.json?tags=${tagName}`,
        `${global.APIs.delirius.url}/search/gelbooru?query=${tagName}`
    ];

    for (const url of endpoints) {
        try {
            const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } });
            if (!res.ok) continue;

            const json = await res.json();
            const images = (Array.isArray(json) ? json : json?.data || json?.post || [])
                .map(item => item?.file_url || item?.large_file_url || item?.media_asset?.variants?.find(v => v.type === 'original')?.url)
                .filter(imgUrl => typeof imgUrl === 'string' && /\.(jpe?g|png)$/.test(imgUrl));

            if (images.length) return images;
        } catch {}
    }
    return [];
}

let handler = async (m, { conn, usedPrefix, command }) => {
    const chat = global.db.data.chats?.[m.chat] || {};
    if (!chat.gacha && m.isGroup) {
        return m.reply(`☁︎ Los comandos de Gacha están desactivados. ☁︎\n\nUn administrador puede activarlos con:\n*${usedPrefix}gacha on*`);
    }

    const user = global.db.data.users[m.sender];
    const now = Date.now();
    const cooldown = 15 * 60 * 1000; // 15 minutes

    if (user.lastRoll && now < user.lastRoll) {
        const remaining = Math.ceil((user.lastRoll - now) / 1000);
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        let timeString = `${minutes} minuto${minutes !== 1 ? 's' : ''} y ${seconds} segundo${seconds !== 1 ? 's' : ''}`;
        return m.reply(`☂︎ Debes esperar *${timeString.trim()}* para volver a jugar. ☂︎`);
    }

    try {
        await conn.reply(m.chat, `*Buscando un personaje...*`, m);

        const allCharacters = await loadCharacters();
        const flatCharacters = flattenCharacters(allCharacters);
        const randomChar = flatCharacters[Math.floor(Math.random() * flatCharacters.length)];
        const charId = String(randomChar.id);
        const seriesName = getSeriesNameByCharacter(allCharacters, charId);

        const images = await searchImage(randomChar.tags?.[0] || '');
        const imageUrl = images[Math.floor(Math.random() * images.length)];

        if (!imageUrl) {
            return m.reply(`☂︎ No se encontraron imágenes para *${randomChar.name}*. ☂︎`);
        }

        if (!global.db.data.characters) global.db.data.characters = {};
        if (!global.db.data.characters[charId]) global.db.data.characters[charId] = {};

        const dbChar = global.db.data.characters[charId];
        dbChar.name = String(randomChar.name || 'Sin nombre');
        dbChar.value = typeof dbChar.value === 'number' ? dbChar.value : (Number(randomChar.value) || 100);
        dbChar.votes = Number(dbChar.votes || 0);
        dbChar.reservedBy = m.sender;
        dbChar.reservedUntil = now + 20000; // 20 seconds
        dbChar.expiresAt = now + 60000; // 1 minute

        let ownerName = dbChar.user ? await conn.getName(dbChar.user).catch(() => 'Desconocido') : 'Libre';

        const caption = `*♫︎ ¡Nuevo Personaje! ♫︎*\n\n` +
                        `*➪ Nombre:* ${dbChar.name}\n` +
                        `*➪ Género:* ${randomChar.gender || 'Desconocido'}\n` +
                        `*➪ Valor:* ${dbChar.value.toLocaleString()}\n` +
                        `*➪ Estado:* ${ownerName}\n` +
                        `*➪ Fuente:* ${seriesName}`;

        const sentMsg = await conn.sendFile(m.chat, imageUrl, `${dbChar.name}.jpg`, caption, m);

        chat.lastRolledId = charId;
        chat.lastRolledMsgId = sentMsg.key?.id || null;
        chat.lastRolledCharacter = { id: charId, name: dbChar.name, media: imageUrl };
        user.lastRoll = now + cooldown;

    } catch (error) {
        await conn.reply(m.chat, `☂︎ Ocurrió un error. ☂︎\n\n${error.message}`, m);
    }
};

handler.help = ['rollwaifu'];
handler.tags = ['gacha'];
handler.command = ['rollwaifu', 'rw', 'roll'];
handler.group = true;

export default handler;
