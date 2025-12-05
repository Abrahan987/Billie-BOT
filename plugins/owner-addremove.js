const handler = async (m, { conn, text, command, args, usedPrefix, isOwner }) => {
  if (!isOwner) {
    return;
  }

  let who;
  if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  else who = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';

  if (!who) {
    return m.reply(`*Etiqueta al usuario*\n\n*Ejemplo:* ${usedPrefix + command} @522411234567`);
  }

  const user = global.db.data.users[who];
  if (!user) {
    return m.reply(`El usuario ${who} no está en la base de datos.`);
  }

  const ownerBot = global.owner[0][0] + '@s.whatsapp.net';
  if (who === ownerBot) {
    return m.reply('No puedes cambiar el estado del propietario del bot.');
  }

  switch (command) {
    case 'addxp':
      const xp = parseInt(args[1]);
      if (isNaN(xp)) {
        return m.reply('Por favor, introduce una cantidad válida de XP.');
      }
      user.exp += xp;
      m.reply(`Se han añadido ${xp} de XP a *${conn.getName(who)}*.`);
      break;
    case 'addcoin':
      const coin = parseInt(args[1]);
      if (isNaN(coin)) {
        return m.reply('Por favor, introduce una cantidad válida de monedas.');
      }
      user.coin += coin;
      m.reply(`Se han añadido ${coin} monedas a *${conn.getName(who)}*.`);
      break;
    case 'addowner':
      if (global.owner.some(([number]) => number === who.split('@')[0])) {
        return m.reply('Este usuario ya es propietario.');
      }
      global.owner.push([who.split('@')[0], conn.getName(who), true]);
      m.reply(`*${conn.getName(who)}* ahora es propietario.`);
      break;
    case 'delowner':
      const ownerIndex = global.owner.findIndex(([number]) => number === who.split('@')[0]);
      if (ownerIndex === -1) {
        return m.reply('Este usuario no es propietario.');
      }
      global.owner.splice(ownerIndex, 1);
      m.reply(`*${conn.getName(who)}* ya no es propietario.`);
      break;
    case 'addprem':
      let duration = args[1] ? parseInt(args[1]) : 30;
      if (isNaN(duration)) {
        duration = 30;
      }
      user.premium = true;
      user.premiumTime = Date.now() + 86400000 * duration;
      m.reply(`*${conn.getName(who)}* ahora es usuario premium durante ${duration} días.`);
      break;
    case 'delprem':
      if (!user.premium) {
        return m.reply('Este usuario no es premium.');
      }
      user.premium = false;
      user.premiumTime = 0;
      m.reply(`*${conn.getName(who)}* ya no es usuario premium.`);
      break;
  }
};

  case 'listprem':
    const premiumUsers = Object.entries(global.db.data.users).filter(([_, user]) => user.premium);
    if (premiumUsers.length === 0) {
      return m.reply('No hay usuarios premium.');
    }
    const list = premiumUsers.map(([jid, user]) => {
      const remainingTime = user.premiumTime - Date.now();
      const days = Math.ceil(remainingTime / 86400000);
      return `*${conn.getName(jid)}*: ${days} días restantes`;
    }).join('\n');
    m.reply(list);
    break;
  }
};

handler.help = ['addxp', 'addcoin', 'addowner', 'delowner', 'addprem', 'delprem', 'listprem'];
handler.tags = ['owner'];
handler.command = /^(addxp|addcoin|addowner|delowner|addprem|delprem|listprem)$/i;
handler.owner = true;

export default handler;