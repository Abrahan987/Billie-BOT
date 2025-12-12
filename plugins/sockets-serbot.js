import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";
import qrcode from "qrcode";
import NodeCache from "node-cache";
import fs from "fs";
import path from "path";
import pino from 'pino';

import { makeWASocket } from '../lib/simple.js';

const pairingCodeStore = new NodeCache();

let handler = async (m, { conn, args, usedPrefix, command }) => {
if (!global.db.data.settings[conn.user.jid]?.jadibotmd) {
return m.reply("☂︎ El modo Jadibot (multi-bot) está actualmente desactivado por el propietario.");
}

const user = global.db.data.users[m.sender];
const cooldown = 2 * 60 * 1000; // 2 minutos
if (user.lastJadibot && Date.now() - user.lastJadibot < cooldown) {
const timeLeft = cooldown - (Date.now() - user.lastJadibot);
return conn.reply(m.chat, `シ︎ Debes esperar *${formatTime(timeLeft)}* antes de poder solicitar una nueva sesión de Jadibot.`, m);
}

const usePairingCode = args[0]?.toLowerCase() === 'code';
const dir = path.join('./sessions', m.sender.split('@')[0]);

if (global.conns.some(c => c.user?.jid === m.sender)) {
return m.reply("☂︎ Ya tienes una sesión de Jadibot activa. Usa el comando `stop` para detenerla antes de iniciar una nueva.");
}

if (fs.existsSync(dir)) {
fs.rmSync(dir, { recursive: true, force: true });
}
fs.mkdirSync(dir, { recursive: true });

user.lastJadibot = Date.now();
await m.reply(usePairingCode ? "Generando tu código de vinculación... ⏳" : "Generando tu código QR... ⏳");

try {
const { state, saveCreds } = await useMultiFileAuthState(dir);
const { version } = await fetchLatestBaileysVersion();

const sock = makeWASocket({
logger: pino({ level: "silent" }),
printQRInTerminal: false,
auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
browser: ['Billie-MD', 'Chrome', '1.0.0'],
version
});

sock.ev.on('connection.update', async (update) => {
const { connection, lastDisconnect, qr } = update;
if (qr && !usePairingCode) {
const qrImage = await qrcode.toBuffer(qr, { scale: 8 });
await conn.sendFile(m.chat, qrImage, 'qr.png', getQRHelp(), m);
}
if (connection === 'close') {
const reason = new DisconnectReason(lastDisconnect?.error)?.toString();
if (global.conns.includes(sock)) {
global.conns.splice(global.conns.indexOf(sock), 1);
}
m.reply(`🔌 Conexión de Jadibot cerrada. Motivo: ${reason}`);
}});

sock.ev.on('creds.update', saveCreds);

if (usePairingCode && !sock.authState.creds.registered) {
const phoneNumber = m.sender.split('@')[0];
await sock.requestPairingCode(phoneNumber);
sock.ev.on('creds.update', async (auth) => { // Escuchar el evento de credenciales para el código
if (auth.creds.pairingCode) {
await m.reply(`${getCodeHelp()}\n\n*Tu código:* \`${auth.creds.pairingCode.match(/.{1,4}/g).join('-')}\``);
}});
}

global.conns.push(sock);

} catch (e) {
console.error("Error en Jadibot:", e);
m.reply("☂︎ Ocurrió un error al iniciar la sesión de Jadibot.");
}};

function getQRHelp() {
return `*🝮︎︎︎︎︎︎︎ CONEXIÓN POR CÓDIGO QR 🝮︎︎︎︎︎︎︎*\n\n` +
`Escanea este código QR para convertirte en un Sub-Bot temporal.\n\n` +
`*Pasos:*\n` +
`1. Abre WhatsApp en otro dispositivo.\n` +
`2. Ve a *Ajustes* > *Dispositivos Vinculados*.\n` +
`3. Toca *Vincular un dispositivo* y escanea el QR.\n\n` +
`> ♫︎ El código QR expira en 45 segundos.`;
}

function getCodeHelp() {
return `*🝮︎︎︎︎︎︎︎ CONEXIÓN POR CÓDIGO 🝮︎︎︎︎︎︎︎*\n\n` +
`Usa el siguiente código para convertirte en un Sub-Bot temporal.\n\n` +
`*Pasos:*\n` +
`1. Abre WhatsApp en otro dispositivo.\n` +
`2. Ve a *Ajustes* > *Dispositivos Vinculados*.\n` +
`3. Toca *Vincular con número de teléfono* e ingresa el código.`;
}

function formatTime(ms) {
const s = Math.floor(ms / 1000);
const m = Math.floor(s / 60);
return `${m}m ${s % 60}s`;
}

handler.help = ['jadibot [code]'];
handler.tags = ['sockets'];
handler.command = ['jadibot', 'serbot', 'qr', 'code'];
handler.premium = true;

export default handler;