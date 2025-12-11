// plugins/sockets-serbot.js
import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";
import qrcode from "qrcode";
import NodeCache from "node-cache";
import { promises as fs } from "fs";
import path from "path";
import pino from 'pino';
import chalk from 'chalk';
import { makeWASocket } from '../lib/simple.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rtx = "*❀ SER BOT • MODE QR*\n\n✰ Con otro celular o en la PC escanea este QR para convertirte en un *Sub-Bot* Temporal.\n\n`1` » Haga clic en los tres puntos en la esquina superior derecha\n\n`2` » Toque dispositivos vinculados\n\n`3` » Escanee este codigo QR para iniciar sesion con el bot\n\n✧ ¡Este código QR expira en 45 segundos!.";
const rtx2 = "*❀ SER BOT • MODE CODE*\n\n✰ Usa este Código para convertirte en un *Sub-Bot* Temporal.\n\n`1` » Haga clic en los tres puntos en la esquina superior derecha\n\n`2` » Toque dispositivos vinculados\n\n`3` » Selecciona Vincular con el número de teléfono\n\n`4` » Escriba el Código para iniciar sesion con el bot\n\n✧ No es recomendable usar tu cuenta principal.";

// Use a Map for efficient connection management
if (!global.conns) global.conns = new Map();

function isSubBotConnected(jid) {
    const userJid = jid.split('@')[0];
    for (const subBot of global.conns.values()) {
        if (subBot.user?.jid.split('@')[0] === userJid) {
            return true;
        }
    }
    return false;
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!global.db.data.settings[conn.user.jid].jadibotmd) {
        return m.reply(`ꕥ El Comando *${command}* está desactivado temporalmente.`);
    }

    const user = global.db.data.users[m.sender];
    const cooldown = 120000; // 2 minutes
    const lastSub = user.Subs || 0;
    if (new Date() - lastSub < cooldown) {
        const timeLeft = (lastSub + cooldown) - new Date();
        return conn.reply(m.chat, `ꕥ Debes esperar ${msToTime(timeLeft)} para volver a vincular un *Sub-Bot.*`, m);
    }

    if (global.conns.size >= 50) {
        return m.reply(`ꕥ No se han encontrado espacios para *Sub-Bots* disponibles.`);
    }

    const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
    const id = `${who.split('@')[0]}`;
    const pathBillieJadiBot = path.join('./jadibots/', id);
    const jid = `${id}@s.whatsapp.net`;

    if (global.conns.has(jid)) {
         const subBot = global.conns.get(jid);
         if (subBot.ws.readyState === subBot.ws.CONNECTING) {
             return m.reply('La sesión ya se está conectando, espera por favor.');
         } else if (subBot.ws.readyState === subBot.ws.OPEN) {
             return m.reply('Ya estás conectado. Si quieres volver a conectarte, usa el comando #deletesesion');
         }
    }

    try {
        await fs.mkdir(pathBillieJadiBot, { recursive: true });
    } catch (error) {
        console.error('Error creating sub-bot directory:', error);
        return m.reply('Ocurrió un error al crear el directorio del sub-bot.');
    }

    user.Subs = new Date() * 1;
    billieJadiBot({ m, conn, args, usedPrefix, command, pathBillieJadiBot, fromCommand: true });
};

handler.help = ['qr', 'code'];
handler.tags = ['serbot'];
handler.command = ['qr', 'code'];
export default handler;

export async function billieJadiBot(options) {
    let { m, conn, args, usedPrefix, command, pathBillieJadiBot } = options;
    const id = path.basename(pathBillieJadiBot);
    const jid = `${id}@s.whatsapp.net`;

    const mcode = command === 'code' || args.includes('--code') || args.includes('code');
    let pairingCode = null;
    let qrTimeout = null;
    let sentMsg = null;

    if (global.conns.has(jid)) {
        try {
            global.conns.get(jid).close();
        } catch {}
        global.conns.delete(jid);
    }

    const { state, saveCreds } = await useMultiFileAuthState(pathBillieJadiBot);
    const { version } = await fetchLatestBaileysVersion();
    const msgRetryCache = new NodeCache();

    const connectionOptions = {
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
        msgRetryCounterCache: msgRetryCache,
        browser: ['BillieJadiBot', 'Firefox', '1.0.0'],
        version,
        generateHighQualityLinkPreview: true,
        shouldSyncHistoryMessage: () => false,
        getMessage: async () => undefined
    };

    let sock = makeWASocket(connectionOptions);
    global.conns.set(jid, sock);

    if (mcode && !sock.authState.creds.registered) {
        pairingCode = true;
        try {
            const code = await sock.requestPairingCode(id);
            sentMsg = await conn.sendMessage(m.chat, { text: `${rtx2}\n\n*CODE:* ${code}` }, { quoted: m });
        } catch (e) {
            console.error("Failed to request pairing code:", e);
            conn.reply(m.chat, "No se pudo solicitar el código de emparejamiento. Inténtalo de nuevo más tarde.", m);
            sock.end(new Error('Pairing code request failed', { cause: e }));
        }
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        const reason = lastDisconnect?.error?.output?.statusCode;

        if (qr && !pairingCode) {
            try {
                const qrBuffer = await qrcode.toBuffer(qr, { scale: 8 });
                sentMsg = await conn.sendMessage(m.chat, { image: qrBuffer, caption: rtx.trim() }, { quoted: m });
                qrTimeout = setTimeout(() => {
                    sock.end(new Error('QR Timeout'));
                }, 45000);
            } catch (e) {
                console.error("QR generation failed", e);
            }
        }

        if (connection === 'open') {
            console.log(chalk.bold.cyanBright(`\n❒⸺⸺⸺⸺【• SUB-BOT •】⸺⸺⸺⸺❒\n│\n│ ❍ ${sock.user.name} (+${id}) conectado exitosamente.\n│\n❒⸺⸺⸺【• CONECTADO •】⸺⸺⸺❒`));
            if (qrTimeout) clearTimeout(qrTimeout);
            if (sentMsg) conn.sendMessage(m.chat, { delete: sentMsg.key });

            await conn.sendMessage(m.chat, { text: `❀ *¡Conexión exitosa!* Has registrado un nuevo Sub-Bot.\n\n> *Usuario:* @${id}\n> *Nombre:* ${sock.user.name || 'Sin nombre'}\n\nPuedes ver la información del bot usando el comando *#infobot*`, mentions: [jid] }, { quoted: m });
            sock.isInit = true;

            try {
                let handlerModule = await import(`../handler.js?update=${Date.now()}`);
                sock.handler = handlerModule.handler.bind(sock);
                sock.ev.on("messages.upsert", sock.handler);
            } catch (e) {
                console.error("Failed to load handler:", e);
                conn.reply(m.chat, "No se pudo cargar el controlador de mensajes para el sub-bot.", m);
                sock.end();
                global.conns.delete(jid);
            }

        } else if (connection === 'close') {
            console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ Conexión cerrada para (+${id}). Razón: ${DisconnectReason[reason] || 'Desconocido'} (${reason})\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`));

            const shouldRetry = reason !== DisconnectReason.loggedOut && reason !== DisconnectReason.connectionReplaced;

            if (shouldRetry) {
                setTimeout(() => billieJadiBot(options), 5000);
            } else {
                 let message = 'La sesión ha sido cerrada.';
                 if (reason === DisconnectReason.connectionReplaced) {
                     message = 'Se ha abierto una nueva sesión, por lo que esta se ha cerrado.';
                 }
                 await conn.reply(m.chat, `La sesión de @${id} ha finalizado. Razón: ${message}`, m, { mentions: [jid] });
            }

            global.conns.delete(jid);
            if (reason === DisconnectReason.loggedOut || reason === DisconnectReason.connectionReplaced) {
                try {
                    await fs.rm(pathBillieJadiBot, { recursive: true, force: true });
                } catch (e) {
                    console.error('Failed to remove sub-bot directory:', e);
                }
            }
        }
    });
}

function msToTime(duration) {
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    let timeString = "";
    if (hours > 0) timeString += `${hours} h `;
    if (minutes > 0) timeString += `${minutes} m y `;
    timeString += `${seconds} s`;
    return timeString.trim();
}
