import fetch from 'node-fetch';
import cheerio from 'cheerio';

const XV_BASE_URL = 'https://www.xvideos.com';
let xvSearchCache = {};

// --- Funciones del Scraper ---
async function searchXvideos(query) {
const url = `${XV_BASE_URL}/?k=${encodeURIComponent(query)}`;
const res = await fetch(url);
const html = await res.text();
const $ = cheerio.load(html);
const results = [];
$('div.mozaique div.thumb-under').each((i, el) => {
const title = $(el).find('p.title a').attr('title');
const link = $(el).find('a').attr('href');
if (title && link) {
results.push({ title, link: XV_BASE_URL + link });
}});
return results;
}

async function downloadXvideos(url) {
const res = await fetch(url);
const html = await res.text();
const $ = cheerio.load(html);
const title = $('h2.page-title').text().trim();
const script = $('#video-player-bg script').html();
const videoUrl = script.match(/html5player\.setVideoUrlHigh\('(.+?)'\);/)?.[1];
return { title, url: videoUrl };
}


// --- Manejador de Comandos ---
let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!global.db.data.chats[m.chat].nsfw && m.isGroup) {
return m.reply(`☂︎ El contenido NSFW está desactivado en este grupo.\n\nUn administrador puede activarlo con: *${usedPrefix}nsfw on*`);
}

switch (command) {
case 'xvideossearch':
await handleSearch(m, conn, text, usedPrefix);
break;
case 'xvideosdl':
await handleDownload(m, conn, text, usedPrefix);
break;
}};

// --- Lógica de Búsqueda ---
async function handleSearch(m, conn, text, usedPrefix) {
if (!text) return m.reply(`*${global.decor} ¿Qué video quieres que busque?\n\n*Formato:* \`${usedPrefix}xvideossearch [búsqueda]\``);
try {
await m.react('🔥');
await m.reply(`*⚠️ ADVERTENCIA NSFW ⚠️*\n\nBuscando videos... Por favor, sé discreto.`);
const results = await searchXvideos(text);
if (results.length === 0) return m.reply("☂︎ No encontré ningún video para tu búsqueda.");

xvSearchCache[m.sender] = results;
const searchList = results.slice(0, 10).map((v, i) => `*${i + 1}.* ${v.title}`).join('\n');
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
if (!text || !text.includes('xvideos.com')) {
return m.reply(`*${global.decor} Por favor, proporciona un enlace de XVideos válido.*\n\n*Formato:* \`${usedPrefix}xvideosdl [URL]\``);
}
try {
await m.react('🔥');
await m.reply(`*⚠️ ADVERTENCIA NSFW ⚠️*\n\nDescargando video... Esto puede tardar un momento.`);
const { title, url } = await downloadXvideos(text);
if (!url) return m.reply("☂︎ No se pudo obtener el enlace de descarga para este video.");

const caption = `*🎬 Título:* ${title}`;
await conn.sendFile(m.chat, url, 'xvideos_video.mp4', caption, m);
} catch (e) {
await m.react('✖️');
console.error(e);
m.reply("☂︎ Ocurrió un error al descargar el video.");
}}

// --- Manejador 'before' para la selección de búsqueda ---
handler.before = async (m, { conn }) => {
const userSelection = xvSearchCache[m.sender];
if (!userSelection || !/^\d+$/.test(m.text)) return;

const index = parseInt(m.text) - 1;
if (index < 0 || index >= userSelection.length) {
return m.reply("☂︎ Número inválido. Por favor, responde con un número de la lista.");
}

const selectedVideo = userSelection[index];
delete xvSearchCache[m.sender];
await handleDownload(m, conn, selectedVideo.link, '');
};

handler.help = ['xvideossearch <búsqueda>', 'xvideosdl <url>'];
handler.tags = ['nsfw'];
handler.command = ['xvideossearch', 'xvideosdl'];
handler.group = true;
handler.premium = true;

export default handler;