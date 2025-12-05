import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";
import qrcode from "qrcode";
import NodeCache from "node-cache";
import { promises as fs } from "fs";
import path from "path";
import pino from 'pino';
import chalk from 'chalk';
import { makeWASocket } from '../lib/simple.js';
import { fileURLToPath } from 'url';

const rtx = "*❀ SER BOT • MODE QR*\n\n✰ Con otro celular o en la PC escanea este QR para convertirte en un *Sub-Bot* Temporal.\n\n`1` » Haga clic en los tres puntos en la esquina superior derecha\n\n`2` » Toque dispositivos vinculados\n\n`3` » Escanee este codigo QR para iniciar sesion con el bot\n\n✧ ¡Este código QR expira en 45 segundos!.";
const rtx2 = "*❀ SER BOT • MODE CODE*\n\n✰ Usa este Código para convertirte en un *Sub-Bot* Temporal.\n\n`1` » Haga clic en los tres puntos en la esquina superior derecha\n\n`2` » Toque dispositivos vinculados\n\n`3` » Selecciona Vincular con el número de teléfono\n\n`4` » Escriba el Código para iniciar sesion con el bot\n\n✧ No es recomendable usar tu cuenta principal.";

if (!global.conns) global.conns = [];

function isSubBotConnected(jid) {
  return global.conns.some(sock => sock?.user?.jid && sock.user.jid.split("@")[0] === jid.split("@")[0]);
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!global.db.data.settings[conn.user.jid].jadibotmd) return m.reply(`ꕥ El Comando *${command}* está desactivado temporalmente.`);

  let time = global.db.data.users[m.sender].Subs + 120000;
  if (new Date - global.db.data.users[m.sender].Subs < 120000) return conn.reply(m.chat, `ꕥ Debes esperar ${msToTime(time - new Date())} para volver a vincular un *Sub-Bot.*`, m);

  if (global.conns.length >= 50) {
    return m.reply(`ꕥ No se han encontrado espacios para *Sub-Bots* disponibles.`);
  }

  let who = m.mentionedJid?.[0] || m.sender;
  let id = `${who.split`@`[0]}`;
  const pathYukiJadiBot = path.join(`./${global.jadi}/`, id);

  try {
    await fs.mkdir(pathYukiJadiBot, { recursive: true });
  } catch (error) {
    console.error('Error creating sub-bot directory:', error);
    return m.reply('Error al crear el directorio para el sub-bot.');
  }

  const yukiJBOptions = {
    pathYukiJadiBot,
    m,
    conn,
    args,
    usedPrefix,
    command,
    fromCommand: true,
  };

  yukiJadiBot(yukiJBOptions);
  global.db.data.users[m.sender].Subs = Date.now();
};

handler.help = ['qr', 'code'];
handler.tags = ['serbot'];
handler.command = ['qr', 'code'];
export default handler;

export async function yukiJadiBot(options) {
  const { pathYukiJadiBot, m, conn, args, usedPrefix, command } = options;
  const mcode = args.includes('--code') || args.includes('code');
  const pathCreds = path.join(pathYukiJadiBot, "creds.json");

  try {
    const { version } = await fetchLatestBaileysVersion();
    const msgRetryCache = new NodeCache();
    const { state, saveCreds } = await useMultiFileAuthState(pathYukiJadiBot);

    const connectionOptions = {
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
      msgRetryCounterCache: msgRetryCache,
      browser: ['Windows', 'Firefox'],
      version,
      generateHighQualityLinkPreview: true
    };

    let sock = makeWASocket(connectionOptions);

    const cleanUp = async () => {
      try {
        await fs.rm(pathYukiJadiBot, { recursive: true, force: true });
      } catch (e) {
        console.error(`Failed to clean up session for ${path.basename(pathYukiJadiBot)}:`, e);
      }
      sock.ev.removeAllListeners();
      const i = global.conns.indexOf(sock);
      if (i >= 0) global.conns.splice(i, 1);
    };

    const timeout = setTimeout(async () => {
      if (!sock.user) {
        console.log(`[TIMEOUT] Cleaning up inactive session: ${path.basename(pathYukiJadiBot)}`);
        await cleanUp();
      }
    }, 60000);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        if (m?.chat) {
          if (mcode) {
            try {
              const secret = await sock.requestPairingCode(m.sender.split`@`[0]);
              const formattedCode = secret.match(/.{1,4}/g)?.join("-");
              const txtCode = await conn.sendMessage(m.chat, { text: rtx2 }, { quoted: m });
              const codeBot = await m.reply(formattedCode);
              setTimeout(() => conn.sendMessage(m.sender, { delete: txtCode.key }), 30000);
              setTimeout(() => conn.sendMessage(m.sender, { delete: codeBot.key }), 30000);
            } catch (e) {
              console.error('Error requesting pairing code:', e);
              m.reply('Error al generar el código de vinculación.');
            }
          } else {
            try {
              const qrImage = await qrcode.toBuffer(qr, { scale: 8 });
              const txtQR = await conn.sendMessage(m.chat, { image: qrImage, caption: rtx.trim() }, { quoted: m });
              setTimeout(() => conn.sendMessage(m.sender, { delete: txtQR.key }), 30000);
            } catch (e) {
              console.error('Error generating QR code:', e);
              m.reply('Error al generar el código QR.');
            }
          }
        }
      }

      if (connection === 'open') {
        clearTimeout(timeout);
        const userName = sock.user.name || 'Anónimo';
        console.log(chalk.bold.cyanBright(`\n❒⸺⸺⸺⸺【• SUB-BOT •】⸺⸺⸺⸺❒\n│\n│ ❍ ${userName} (+${path.basename(pathYukiJadiBot)}) conectado exitosamente.\n│\n❒⸺⸺⸺【• CONECTADO •】⸺⸺⸺❒`));
        sock.isInit = true;
        global.conns.push(sock);
        m?.chat?.sendMessage(conn, { text: `@${m.sender.split('@')[0]} se ha conectado como sub-bot.`, mentions: [m.sender] }, { quoted: m });
      }

      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        console.log(chalk.bold.magentaBright(`Sub-bot (+${path.basename(pathYukiJadiBot)}) disconnected. Reason: ${reason}`));
        await cleanUp();
      }
    });

    sock.ev.on('creds.update', saveCreds);

    let handlerPath = path.resolve(fileURLToPath(import.meta.url), '../', 'handler.js');
    const handlerModule = await import(`file://${handlerPath}?update=${Date.now()}`);
    sock.handler = handlerModule.handler.bind(sock);
    sock.ev.on("messages.upsert", sock.handler);

  } catch (error) {
    console.error('Error in yukiJadiBot:', error);
    if (m) m.reply("Ocurrió un error al iniciar el sub-bot.");
  }
}

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
}
