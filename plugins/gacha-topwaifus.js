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

    if (!global.db.data.characters) global.db.data.characters = {};

    try {
        const allCharacters = await loadCharacters();
        const flatCharacters = flattenCharacters(allCharacters);

        const charactersWithValue = flatCharacters.map(char => {
            const dbChar = global.db.data.characters[char.id] || {};
            const value = typeof dbChar.value === 'number' ? dbChar.value : (Number(char.value) || 0);
            return { name: char.name, value: value };
        });

        const page = parseInt(args[0]) || 1;
        const pageSize = 10;
        const totalPages = Math.ceil(charactersWithValue.length / pageSize);

        if (page < 1 || page > totalPages) {
            return m.reply(`☂︎ Página no válida. Hay un total de *${totalPages}* páginas. ☂︎`);
        }

        const sortedChars = charactersWithValue.sort((a, b) => b.value - a.value);
        const paginatedChars = sortedChars.slice((page - 1) * pageSize, page * pageSize);

        let topText = '*♫︎ Top Personajes por Valor ♫︎*\n\n';
        paginatedChars.forEach((char, index) => {
            topText += `*${(page - 1) * pageSize + index + 1}.* *${char.name}*\n`;
            topText += `   *Valor:* ${char.value.toLocaleString()}\n`;
        });
        topText += `\n*Página ${page} de ${totalPages}*`;

        await conn.reply(m.chat, topText.trim(), m);

    } catch (error) {
        await conn.reply(m.chat, `☂︎ Ocurrió un error. ☂︎\n\n${error.message}`, m);
    }
};

handler.help = ['topwaifus'];
handler.tags = ['gacha'];
handler.command = ['topwaifus', 'wtop', 'waifustop', 'waifusboard'];
handler.group = true;

export default handler;
