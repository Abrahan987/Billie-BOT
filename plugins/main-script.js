import fetch from 'node-fetch';
import moment from 'moment-timezone';

let handler = async (m, { conn }) => {
try {
await m.react('📜');
const res = await fetch('https://api.github.com/repos/The-King-Destroy/Yuki_Suou-Bot');
if (!res.ok) throw new Error(`Error al contactar con GitHub: ${res.statusText}`);
const json = await res.json();

const scriptCard = `*🝮︎︎︎︎︎︎︎ SCRIPT DEL BOT 🝮︎︎︎︎︎︎︎*\n\n` +
`¡Hola! Soy un bot de WhatsApp de código abierto. Puedes encontrar mi código fuente y contribuir a mi desarrollo en GitHub.\n\n` +
`*✧ Repositorio:* ${json.name}\n` +
`*✧ Autor(a):* ${json.owner.login}\n` +
`*✧ Estrellas:* ${json.stargazers_count} ⭐\n` +
`*✧ Forks:* ${json.forks_count} 🍴\n` +
`*✧ Última Actualización:* ${moment(json.updated_at).locale('es').fromNow()}\n\n` +
`*Enlace al Repositorio:*\n${json.html_url}\n\n` +
`> ♫︎ ¡Gracias por tu interés en mi desarrollo!`;

await conn.reply(m.chat, scriptCard, m);

} catch (error) {
await m.react('✖️');
console.error("Error al obtener la información del script:", error);
await conn.reply(m.chat, "☂︎ ¡Oh, no! Ocurrió un error al buscar la información de mi repositorio.", m);
}};

handler.help = ['script'];
handler.tags = ['main'];
handler.command = ['script', 'sc', 'sourcecode'];

export default handler;