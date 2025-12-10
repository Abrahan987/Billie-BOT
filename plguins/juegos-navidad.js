let handler = async (m, { conn, command, text, args, usedPrefix }) => {
  let a = '\`'
  let emojis = ['❄️', '☃️', '🎅', '🎄', '🎁'];
  let alet = emojis[Math.floor(Math.random() * emojis.length)];

  const comando = {
    buscar: 'buscar',
    apostar: 'apostar'
  };

  try {
    const isDecember = new Date().getMonth() === 11;
    if (!isDecember) {
      return conn.reply(m.chat, `*ESTE COMANDO SOLO ESTA DISPONIBLE EN DICIEMBRE*`, m);
    }

    let user = global.db.data.users[m.sender];
    if (user.copitos === undefined) user.copitos = 0;

    switch (command) {
      case 'buscarcopitos': {
        const cooldown = 1800000;
        let a = user.lastCopitos;
        if (new Date - a < cooldown) {
            return conn.reply(m.chat, `*YA RECLAMASTE VUELVE EN ${msToTime(user.lastCopitos + cooldown - new Date())}*`, m);
        }
        const reward = Math.floor(Math.random() * 500) + 1;
        user.copitos += reward;
        user.lastCopitos = new Date() * 1;
        conn.reply(m.chat, `*FELICIDADES GANASTE ${reward} DE COPITOS ${alet}!!*`, m);
        break;
      }

      case 'apuestacopitos': {
        const apuesta = parseInt(args[0]);
        if (isNaN(apuesta) || apuesta <= 0) {
          return conn.reply(m.chat, `*DEBES INGRESAR UNA CANTIDAD VALIDA PARA APOSTAR*`, m);
        }

        if (user.copitos < apuesta) {
          return conn.reply(m.chat, `*NO TIENES SUFICIENTES COPITOS PARA APOSTAR ESA CANTIDAD*`, m);
        }

        const opponent = m.mentionedJid[0];
        if (!opponent) {
          return conn.reply(m.chat, `*DEBES MENCIONAR A ALGUIEN PARA APOSTAR*`, m);
        }

        let opponentUser = global.db.data.users[opponent];
        if (typeof opponentUser !== "object") global.db.data.users[opponent] = {}
        if (opponentUser) {
            if (!("name" in opponentUser)) opponentUser.name = conn.getName(opponent)
            if (!("exp" in opponentUser) || !isNumber(opponentUser.exp)) opponentUser.exp = 0
            if (!("coin" in opponentUser) || !isNumber(opponentUser.coin)) opponentUser.coin = 0
            if (!("bank" in opponentUser) || !isNumber(opponentUser.bank)) opponentUser.bank = 0
            if (!("level" in opponentUser) || !isNumber(opponentUser.level)) opponentUser.level = 0
            if (!("health" in opponentUser) || !isNumber(opponentUser.health)) opponentUser.health = 100
            if (!("genre" in opponentUser)) opponentUser.genre = ""
            if (!("birth" in opponentUser)) opponentUser.birth = ""
            if (!("marry" in opponentUser)) opponentUser.marry = ""
            if (!("description" in opponentUser)) opponentUser.description = ""
            if (!("packstickers" in opponentUser)) opponentUser.packstickers = null
            if (!("premium" in opponentUser)) opponentUser.premium = false
            if (!("premiumTime" in opponentUser)) opponentUser.premiumTime = 0
            if (!("banned" in opponentUser)) opponentUser.banned = false
            if (!("bannedReason" in opponentUser)) opponentUser.bannedReason = ""
            if (!("commands" in opponentUser) || !isNumber(opponentUser.commands)) opponentUser.commands = 0
            if (!("afk" in opponentUser) || !isNumber(opponentUser.afk)) opponentUser.afk = -1
            if (!("afkReason" in opponentUser)) opponentUser.afkReason = ""
            if (!("warn" in opponentUser) || !isNumber(opponentUser.warn)) opponentUser.warn = 0
            if (!("copitos" in opponentUser)) opponentUser.copitos = 0;
        } else global.db.data.users[opponent] = {
            name: conn.getName(opponent),
            exp: 0,
            coin: 0,
            bank: 0,
            level: 0,
            health: 100,
            genre: "",
            birth: "",
            marry: "",
            description: "",
            packstickers: null,
            premium: false,
            premiumTime: 0,
            banned: false,
            bannedReason: "",
            commands: 0,
            afk: -1,
            afkReason: "",
            warn: 0,
            copitos: 0
        }
        if (opponentUser.copitos < apuesta) {
          return conn.reply(m.chat, `*LA PERSONA MENCIONADA NO TIENE SUFICIENTES COPITOS PARA LA APUESTA*`, m);
        }

        user.copitos -= apuesta;
        opponentUser.copitos -= apuesta;

        if (Math.random() < 0.5) {
          user.copitos += apuesta * 2;
          conn.reply(m.chat, `*FELICIDADES @${m.sender.split`@`[0]} GANASTE ${apuesta} DE COPITOS ${alet}!!*`, m, { mentions: [m.sender, opponent] });
        } else {
          opponentUser.copitos += apuesta * 2;
          conn.reply(m.chat, `*@${opponent.split`@`[0]} GANO LA APUESTA Y TE LANZO UNA BOLA DE NIEVE*`, m, { mentions: [m.sender, opponent] });
        }
        break;
      }
    }
  } catch (e) {
    console.error(e);
    conn.reply(m.chat, `*OCURRIO UN ERROR*`, m);
  }
};

handler.help = ['buscarcopitos', 'apuestacopitos'];
handler.tags = ['juegos'];
handler.command = /^(buscarcopitos|apuestacopitos)$/i;

export default handler;

const isNumber = x => typeof x === 'number' && !isNaN(x);

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return minutes + " minutos y " + seconds + " segundos";
}
