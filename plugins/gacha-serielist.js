import { promises as fs } from 'fs';

const charactersFilePath = './lib/characters.json';

async function loadCharacters() {
    const data = await fs.readFile(charactersFilePath, 'utf-8');
    return JSON.parse(data);
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const chat = global.db.data.chats?.[m.chat] || {};
    if (!chat.gacha && m.isGroup) {
        return m.reply(`☁︎ Los comandos de Gacha están desactivados. ☁︎\n\nUn administrador puede activarlos con:\n*${usedPrefix}gacha on*`);
    }

    try {
        const allCharacters = await loadCharacters();

        switch (command) {
            case 'serielist':
            case 'slist':
            case 'animelist': {
                const seriesNames = Object.keys(allCharacters);
                const totalSeries = seriesNames.length;
                const page = parseInt(args[0]) || 1;
                const pageSize = 20;
                const totalPages = Math.ceil(totalSeries / pageSize);

                if (page < 1 || page > totalPages) {
                    return m.reply(`☂︎ Página no válida. Hay un total de *${totalPages}* páginas. ☂︎`);
                }

                const startIndex = (page - 1) * pageSize;
                const endIndex = Math.min(startIndex + pageSize, totalSeries);
                const paginatedSeries = seriesNames.slice(startIndex, endIndex);

                let seriesListText = `*♫︎ Lista de Series (${totalSeries}) ♫︎*\n\n`;
                for (const seriesKey of paginatedSeries) {
                    const series = allCharacters[seriesKey];
                    const seriesName = series.name || seriesKey;
                    const charCount = Array.isArray(series.characters) ? series.characters.length : 0;
                    seriesListText += `*➪ ${seriesName}* (${charCount} personajes)\n`;
                }
                seriesListText += `\n*Página ${page}/${totalPages}*`;

                await m.reply(seriesListText.trim());
                break;
            }

            case 'serieinfo':
            case 'ainfo':
            case 'animeinfo': {
                if (!args.length) {
                    return m.reply(`☁︎ Debes especificar el nombre de una serie. ☁︎\n> *Ejemplo:* ${usedPrefix + command} Naruto`);
                }

                const query = args.join(' ').toLowerCase().trim();
                const seriesEntry = Object.entries(allCharacters).find(([, series]) =>
                    (series.name && series.name.toLowerCase().includes(query)) ||
                    (series.tags && Array.isArray(series.tags) && series.tags.some(tag => tag.toLowerCase().includes(query)))
                );

                if (!seriesEntry) {
                    return m.reply(`☂︎ No se encontró la serie *${query}*. ☂︎`);
                }

                const [seriesKey, series] = seriesEntry;
                const characters = Array.isArray(series.characters) ? series.characters : [];
                const totalChars = characters.length;

                const claimedChars = characters.filter(char =>
                    Object.values(global.db.data.users).some(user =>
                        Array.isArray(user.characters) && user.characters.includes(char.id)
                    )
                );

                characters.sort((a, b) => (b.value || 0) - (a.value || 0));

                let infoText = `*♫︎ Información de la Serie: ${series.name || seriesKey} ♫︎*\n\n`;
                infoText += `*♪ Personajes:* \`${totalChars}\`\n`;
                infoText += `*♪ Reclamados:* \`${claimedChars.length}/${totalChars} (${(claimedChars.length / totalChars * 100).toFixed(0)}%)\`\n\n`;

                for (const char of characters) {
                    const dbChar = global.db.data.characters?.[char.id] || {};
                    const ownerEntry = Object.entries(global.db.data.users).find(([, user]) =>
                        Array.isArray(user.characters) && user.characters.includes(char.id)
                    );
                    let ownerName = ownerEntry ? (await conn.getName(ownerEntry[0]).catch(() => 'Desconocido')) : 'Libre';

                    infoText += `*➪ ${char.name}* (Valor: ${(char.value || 0).toLocaleString()}) - ${ownerName}\n`;
                }

                await m.reply(infoText.trim());
                break;
            }
        }
    } catch (error) {
        await m.reply(`☂︎ Ocurrió un error. ☂︎\n\n${error.message}`);
    }
};

handler.help = ['serielist', 'serieinfo'];
handler.tags = ['gacha'];
handler.command = ['serielist', 'slist', 'animelist', 'serieinfo', 'ainfo', 'animeinfo'];
handler.group = true;

export default handler;
