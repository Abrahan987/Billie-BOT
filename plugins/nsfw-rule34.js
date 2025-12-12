import fetch from 'node-fetch';

// Mapa de fuentes NSFW para organizar las APIs y facilitar su mantenimiento
const nsfwSources = {
rule34: {
get: async (tag) => {
const res = await fetch(`https://rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&tags=${tag}`);
if (!res.ok) return [];
const json = await res.json();
return (Array.isArray(json) ? json : []).map(p => p.file_url).filter(Boolean);
}},
danbooru: {
get: async (tag) => {
const res = await fetch(`https://danbooru.donmai.us/posts.json?tags=${tag}`);
if (!res.ok) return [];
const json = await res.json();
return json.map(p => p.file_url).filter(Boolean);
}},
gelbooru: {
get: async (tag) => {
const res = await fetch(`https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&tags=${tag}`);
if (!res.ok) return [];
const json = await res.json();
return (json.post || []).map(p => p.file_url).filter(Boolean);
}}
};

let handler = async (m, { conn, args, usedPrefix, command }) => {
const [source, ...queryParts] = args;
const query = queryParts.join(' ');
const sourceKey = source?.toLowerCase();

if (!sourceKey || !nsfwSources[sourceKey] || !query) {
return m.reply(getHelpMessage(usedPrefix));
}
if (!global.db.data.chats[m.chat].nsfw && m.isGroup) {
return m.reply(`☂︎ El contenido NSFW está desactivado en este grupo.\n\nUn administrador puede activarlo con: *${usedPrefix}nsfw on*`);
}

try {
await m.react('🔥');
await m.reply(`*⚠️ ADVERTENCIA DE CONTENIDO NSFW ⚠️*\n\nBuscando contenido para adultos. Por favor, sé discreto.`);

const getMedia = nsfwSources[sourceKey].get;
const mediaUrls = await getMedia(encodeURIComponent(query));
const validMedia = mediaUrls.filter(url => /\.(jpe?g|png|gif|mp4)$/.test(url));

if (validMedia.length === 0) {
return conn.reply(m.chat, `☂︎ No encontré resultados para *"${query}"* en *${sourceKey}*.`, m);
}

const mediaUrl = validMedia[Math.floor(Math.random() * validMedia.length)];
const caption = `*${global.decor} Resultado para:* ${query}\n*Fuente:* ${sourceKey}`;

if (mediaUrl.endsWith('.mp4')) {
await conn.sendMessage(m.chat, { video: { url: mediaUrl }, caption });
} else {
await conn.sendMessage(m.chat, { image: { url: mediaUrl }, caption });
}

} catch (error) {
await m.react('✖️');
console.error(`Error en el comando NSFW (${sourceKey}):`, error);
await conn.reply(m.chat, "☂︎ ¡Oh, no! Ocurrió un error al buscar el contenido. La API puede estar fallando.", m);
}};

function getHelpMessage(usedPrefix) {
return `*🝮︎︎︎︎︎︎︎ BÚSQUEDA DE CONTENIDO NSFW 🝮︎︎︎︎︎︎︎*\n\n` +
`Busca imágenes y videos para adultos de diferentes fuentes.\n\n` +
`*Formato:* \`${usedPrefix}nsfw [fuente] [búsqueda]\`\n\n` +
`*Fuentes disponibles:*\n` +
`${Object.keys(nsfwSources).map(s => `*•* ${s}`).join('\n')}\n\n` +
`*Ejemplo:* \`${usedPrefix}nsfw rule34 [tag]\``;
}

handler.help = ['nsfw <fuente> <búsqueda>'];
handler.tags = ['nsfw'];
handler.command = ['nsfw', 'r34', 'danbooru', 'gelbooru']; // Mantener alias por compatibilidad
handler.group = true;
handler.premium = true;

export default handler;