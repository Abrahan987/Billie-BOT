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

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const chat = global.db.data.chats?.[m.chat] || {};
    if (!chat.gacha && m.isGroup) {
        return m.reply(`☁︎ Los comandos de Gacha están desactivados. ☁︎\n\nUn administrador puede activarlos con:\n*${usedPrefix}gacha on*`);
    }

    try {
        const user = global.db.data.users[m.sender];
        if (!Array.isArray(user.characters)) user.characters = [];

        if (!args.length) {
            return m.reply(`☁︎ Debes especificar el nombre del personaje que quieres eliminar. ☁︎\n> *Ejemplo:* ${usedPrefix + command} Billie Eilish`);
        }

        const characterName = args.join(' ').toLowerCase().trim();
        const allCharacters = await loadCharacters();
        const flatCharacters = flattenCharacters(allCharacters);
        const character = flatCharacters.find(char => char.name.toLowerCase() === characterName);

        if (!character) {
            return m.reply(`☂︎ No se encontró ningún personaje con el nombre *${characterName}*. ☂︎`);
        }

        const dbChar = global.db.data.characters?.[character.id];

        if (!dbChar || dbChar.user !== m.sender) {
            return m.reply(`☂︎ El personaje *${character.name}* no está reclamado por ti. ☂︎`);
        }

        // Remove character from database and user's list
        delete global.db.data.characters[character.id];
        user.characters = user.characters.filter(id => id !== character.id);

        // Check and remove from favorite if it exists
        if (user.favorite === character.id) {
            delete user.favorite;
        }

        await m.reply(`♫︎ ¡El personaje *${character.name}* ha sido eliminado de tu harén! ♫︎`);

    } catch (error) {
        await conn.reply(m.chat, `☂︎ Ocurrió un error. ☂︎\n\n${error.message}`, m);
    }
};

handler.help = ['delchar <nombre>'];
handler.tags = ['gacha'];
handler.command = ['delchar', 'deletewaifu', 'delwaifu'];
handler.group = true;

export default handler;
