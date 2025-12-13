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

    if (!global.db.data.characters) global.db.data.characters = {};
    if (!global.db.data.users) global.db.data.users = {};

    try {
        const allCharacters = await loadCharacters();
        const flatCharacters = flattenCharacters(allCharacters);
        const user = global.db.data.users[m.sender];
        if (!Array.isArray(user.characters)) user.characters = [];

        switch (command) {
            case 'setfav':
            case 'wfav': {
                if (!args.length) {
                    return m.reply(`☁︎ Debes especificar el nombre de un personaje. ☁︎\n> *Ejemplo:* ${usedPrefix + command} Billie Eilish`);
                }
                const charName = args.join(' ').toLowerCase().trim();
                const character = flatCharacters.find(c => c.name.toLowerCase() === charName);

                if (!character) {
                    return m.reply(`☂︎ No se encontró el personaje *${charName}*. ☂︎`);
                }
                if (!user.characters.includes(character.id)) {
                    return m.reply(`☂︎ El personaje *${character.name}* no está en tu harén. ☂︎`);
                }

                const oldFavId = user.favorite;
                user.favorite = character.id;

                if (oldFavId && oldFavId !== character.id) {
                    const oldFav = global.db.data.characters?.[oldFavId];
                    const oldFavName = typeof oldFav?.name === 'string' ? oldFav.name : 'personaje anterior';
                    return m.reply(`♫︎ Se ha reemplazado tu favorito *${oldFavName}* por *${character.name}*! ♫︎`);
                }
                return m.reply(`*♫︎ ¡Ahora ${character.name} es tu personaje favorito! ♫︎*`);
            }

            case 'favtop':
            case 'favboard':
            case 'favoritetop': {
                const favorites = {};
                for (const [, userData] of Object.entries(global.db.data.users)) {
                    const favId = userData.favorite;
                    if (favId) {
                        favorites[favId] = (favorites[favId] || 0) + 1;
                    }
                }

                const topFavs = flatCharacters
                    .map(char => ({ name: char.name, favorites: favorites[char.id] || 0 }))
                    .filter(c => c.favorites > 0);

                const page = parseInt(args[0]) || 1;
                const pageSize = 10;
                const totalPages = Math.ceil(topFavs.length / pageSize);

                if (page < 1 || page > totalPages) {
                    return m.reply(`☂︎ Página no válida. Hay un total de *${totalPages}* páginas. ☂︎`);
                }

                const sortedFavs = topFavs.sort((a, b) => b.favorites - a.favorites);
                const paginatedFavs = sortedFavs.slice((page - 1) * pageSize, page * pageSize);

                let topText = '*♫︎ Top Personajes Favoritos ♫︎*\n\n';
                paginatedFavs.forEach((char, index) => {
                    topText += `*${(page - 1) * pageSize + index + 1}.* *${char.name}*\n`;
                    topText += `   ♡ ${char.favorites} veces favorito\n`;
                });
                topText += `\n*Página ${page} de ${totalPages}*`;

                await m.reply(topText.trim());
                break;
            }

            case 'delfav':
            case 'deletefav': {
                if (!user.favorite) {
                    return m.reply('☁︎ No tienes ningún personaje marcado como favorito. ☁︎');
                }

                const favId = user.favorite;
                const dbChar = global.db.data.characters?.[favId] || {};
                let favName = typeof dbChar.name === 'string' ? dbChar.name : null;

                if (!favName) {
                    const charInfo = flatCharacters.find(c => c.id === favId);
                    favName = charInfo?.name || 'personaje desconocido';
                }

                delete user.favorite;
                m.reply(`*♫︎ ${favName}* ya no es tu personaje favorito.`);
                break;
            }
        }
    } catch (error) {
        await m.reply(`☂︎ Ocurrió un error. ☂︎\n\n${error.message}`);
    }
};

handler.help = ['setfav', 'favtop', 'delfav'];
handler.tags = ['gacha'];
handler.command = ['setfav', 'wfav', 'favtop', 'favboard', 'favoritetop', 'delfav', 'deletefav'];
handler.group = true;

export default handler;
