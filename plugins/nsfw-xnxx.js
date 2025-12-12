import fetch from 'node-fetch';
import cheerio from 'cheerio';

const XNXX_BASE_URL = 'https://www.xnxx.com';
let xnxxSearchCache = {};

// --- Funciones del Scraper ---
async function searchXnxx(query) {
const url = `${XNXX_BASE_URL}/search/${encodeURIComponent(query)}/${Math.floor(Math.random() * 3) + 1}`;
const res = await fetch(url);
const html = await res.text();
const $ = cheerio.load(html);
const results = [];
$('div.mozaique div.thumb-under').each((i, el) => {
const title = $(el).find('p.title a').attr('title');
const link = $(el).find('a').attr('href');
const info = $(el).find('p.metadata').text().trim();
if (title && link) {
results.push({ title, link: XNXX_BASE_URL + link, info });
}});
return results;
}

async function downloadXnxx(url) {
const res = await fetch(url);
const html = await res.text();
const $ = cheerio.load(html);
const title = $('strong.mobile-hide').text().trim();
const script = $('#video-player-bg script').text();
const highQuality = script.match(/setVideoUrlHigh\('(.+?)'\)/)?.[1];
const lowQuality = script.match(/setVideoUrlLow\('(.+?)'\)/)?.[1];
return { title, url: highQuality || lowQuality };
}


// --- Manejador de Comandos ---
let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!global.db.data.chats[m.chat].nsfw && m.isGroup) {
return m.reply(`☂︎ El contenido NSFW está desactivado en este grupo.\n\nUn administrador puede activarlo con: *${usedPrefix}nsfw on*`);
}

switch (command) {
case 'xnxxsearch':
await handleSearch(m, conn, text, usedPrefix);
break;
case 'xnxxdl':
await handleDownload(m, conn, text, usedPrefix);
break;
}};

// --- Lógica de Búsqueda ---
async function handleSearch(m, conn, text, usedPrefix) {
if (!text) return m.reply(`*${global.decor} ¿Qué video quieres que busque?\n\n*Formato:* \`${usedPrefix}xnxxsearch [búsqueda]\``);
try {
await m.react('🔥');
await m.reply(`*⚠️ ADVERTENCIA NSFW ⚠️*\n\nBuscando videos... Por favor, sé discreto.`);
const results = await searchXnxx(text);
if (results.length === 0) return m.reply("☂︎ No encontré ningún video para tu búsqueda.");

xnxxSearchCache[m.sender] = results;
const searchList = results.slice(0, 10).map((v, i) => `*${i + 1}.* ${v.title}\n*Info:* ${v.info}`).join('\n\n');
const resultMessage = `*🝮︎︎︎︎︎︎︎ RESULTADOS DE BÚSQUEDA 🝮︎︎︎︎︎︎︎*\n\n${searchList}\n\n` +
`> ♫︎ Responde con el número del video que quieres descargar (ej. \`1\`).`;
await m.reply(resultMessage);
} catch (e) {
await m.react('✖️');
console.error(e);
m.reply("☂︎ Ocurrió un error al buscar los videos.");
}}

// --- Lógica de Descarga ---
async function handleDownload(m, conn, text, usedPrefix) {
if (!text || !text.includes('xnxx.com')) {
return m.reply(`*${global.decor} Por favor, proporciona un enlace de XNXX válido.*\n\n*Formato:* \`${usedPrefix}xnxxdl [URL]\``);
}
try {
await m.react('🔥');
await m.reply(`*⚠️ ADVERTENCIA NSFW ⚠️*\n\nDescargando video... Esto puede tardar un momento.`);
const { title, url } = await downloadXnxx(text);
if (!url) return m.reply("☂︎ No se pudo obtener el enlace de descarga para este video.");

const caption = `*🎬 Título:* ${title}`;
await conn.sendFile(m.chat, url, 'xnxx_video.mp4', caption, m);
} catch (e) {
await m.react('✖️');
console.error(e);
m.reply("☂︎ Ocurrió un error al descargar el video.");
}}

// --- Manejador 'before' para la selección de búsqueda ---
handler.before = async (m, { conn }) => {
const userSelection = xnxxSearchCache[m.sender];
if (!userSelection || !/^\d+$/.test(m.text)) return;

const index = parseInt(m.text) - 1;
if (index < 0 || index >= userSelection.length) {
return m.reply("☂︎ Número inválido. Por favor, responde con un número de la lista.");
}

const selectedVideo = userSelection[index];
delete xnxxSearchCache[m.sender];
await handleDownload(m, conn, selectedVideo.link, '');
};

handler.help = ['xnxxsearch <búsqueda>', 'xnxxdl <url>'];
handler.tags = ['nsfw'];
handler.command = ['xnxxsearch', 'xnxxdl'];
handler.group = true;
handler.premium = true;

export default handler;