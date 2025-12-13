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
    const totalSec = Math.ceil(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    let parts = [];
    if (h > 0) parts.push(`${h} hora${h !== 1 ? 's' : ''}`);
    if (m > 0) parts.push(`${m} minuto${m !== 1 ? 's' : ''}`);
    if (s > 0 || parts.length === 0) parts.push(`${s} segundo${s !== 1 ? 's' : ''}`);
    return parts.join(' ');
}

let handler = async (m, { conn, usedPrefix, command }) => {
    const chat = global.db.data.chats?.[m.chat] || {};
    if (!chat.gacha && m.isGroup) {
        return m.reply(`☁︎ Los comandos de Gacha están desactivados. ☁︎\n\nUn administrador puede activarlos con:\n*${usedPrefix}gacha on*`);
    }

    const user = global.db.data.users[m.sender];
    if (user.robCooldown == null) user.robCooldown = 0;
    if (!user.robVictims) user.robVictims = {};

    const now = Date.now();
    const cooldown = 8 * 60 * 60 * 1000; // 8 hours
    const nextRobTime = user.robCooldown + cooldown;

    if (now < nextRobTime) {
        const remaining = nextRobTime - now;
        return m.reply(`☂︎ Debes esperar *${formatTime(remaining)}* para volver a robar. ☂︎`);
    }

    const targetJid = m.mentionedJid[0] || m.quoted?.sender;
    if (!targetJid || typeof targetJid !== 'string' || !targetJid.includes('@')) {
        return m.reply('☁︎ Menciona o responde al usuario al que quieres robarle un personaje. ☁︎');
    }

    if (targetJid === m.sender) {
        let selfName = await conn.getName(m.sender).catch(() => m.sender.split('@')[0]);
        return m.reply(`☂︎ No puedes robarte a ti mismo, *${selfName}*. ☂︎`);
    }

    const victimLastRob = user.robVictims[targetJid];
    if (victimLastRob && now - victimLastRob < 18 * 60 * 60 * 1000) { // 18 hours
        let victimName = await conn.getName(targetJid).catch(() => targetJid.split('@')[0]);
        return m.reply(`☂︎ Ya le robaste a *${victimName}* hoy. Solo puedes robarle a la misma persona una vez cada 18 horas. ☂︎`);
    }

    const targetUser = global.db.data.users[targetJid];
    if (!targetUser || !Array.isArray(targetUser.characters) || targetUser.characters.length === 0) {
        let targetName = await conn.getName(targetJid).catch(() => targetJid.split('@')[0]);
        return m.reply(`☂︎ *${targetName}* no tiene personajes que puedas robar. ☂︎`);
    }

    user.robCooldown = now;
    user.robVictims[targetJid] = now;

    const success = Math.random() < 0.1; // 10% chance of success
    if (!success) {
        let targetName = await conn.getName(targetJid).catch(() => targetJid.split('@')[0]);
        return m.reply(`*♫︎ ¡Robo Fallido! ♫︎*\n\n*${targetName}* defendió a su personaje. ¡Inténtalo de nuevo más tarde!`);
    }

    const stolenCharId = targetUser.characters[Math.floor(Math.random() * targetUser.characters.length)];
    const dbChar = global.db.data.characters?.[stolenCharId] || {};
    const charName = dbChar.name || `ID: ${stolenCharId}`;

    dbChar.user = m.sender;
    targetUser.characters = targetUser.characters.filter(id => id !== stolenCharId);
    if (!user.characters.includes(stolenCharId)) user.characters.push(stolenCharId);

    if (targetUser.favorite === stolenCharId) {
        delete targetUser.favorite;
    }

    let robberName = await conn.getName(m.sender).catch(() => m.sender.split('@')[0]);
    let victimName = await conn.getName(targetJid).catch(() => targetJid.split('@')[0]);

    await m.reply(`*♫︎ ¡Robo Exitoso! ♫︎*\n\n*${robberName}* ha robado a *${charName}* del harén de *${victimName}*.`);
};

handler.help = ['robwaifu'];
handler.tags = ['gacha'];
handler.command = ['robwaifu', 'robarwaifu'];
handler.group = true;

export default handler;
