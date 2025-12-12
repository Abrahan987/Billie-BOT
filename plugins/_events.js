import { WAMessageStubType } from '@whiskeysockets/baileys';
import { bienvenida as generateWelcomeCard, despedida as generateByeCard } from '../lib/canvas.js'; // Asumiendo que estas funciones existen

const handler = m => m;

handler.before = async function (m, { conn, groupMetadata }) {
if (!m.isGroup || !m.messageStubType) return;

const chat = global.db.data.chats[m.chat] || {};
if (!chat.welcome) return;

const userId = m.messageStubParameters[0];
const isWelcome = [
WAMessageStubType.GROUP_PARTICIPANT_ADD,
WAMessageStubType.GROUP_PARTICIPANT_INVITE,
WAMessageStubType.GROUP_PARTICIPANT_DEMOTE
].includes(m.messageStubType);

const isBye = [
WAMessageStubType.GROUP_PARTICIPANT_REMOVE,
WAMessageStubType.GROUP_PARTICIPANT_LEAVE
].includes(m.messageStubType);

if (isWelcome) {
await handleWelcome(conn, m.chat, userId, groupMetadata, chat);
} else if (isBye) {
await handleBye(conn, m.chat, userId, groupMetadata, chat);
}
};

async function handleWelcome(conn, chatId, userId, groupMetadata, chat) {
const welcomeMessage = chat.sWelcome || "¡Bienvenido/a a {group}!";
const text = welcomeMessage
.replace('{user}', `@${userId.split('@')[0]}`)
.replace('{group}', groupMetadata.subject);

try {
const card = await generateWelcomeCard({
ppUrl: await conn.profilePictureUrl(userId, 'image').catch(() => null),
groupName: groupMetadata.subject,
memberCount: groupMetadata.participants.length
});
await conn.sendFile(chatId, card, 'welcome.png', text, null, false, { mentions: [userId] });
} catch (e) {
console.error("Error al generar la tarjeta de bienvenida:", e);
await conn.reply(chatId, text, null, { mentions: [userId] }); // Fallback a texto
}
}

async function handleBye(conn, chatId, userId, groupMetadata, chat) {
const byeMessage = chat.sBye || "¡Adiós, {user}!";
const text = byeMessage.replace('{user}', `@${userId.split('@')[0]}`);

try {
const card = await generateByeCard({
ppUrl: await conn.profilePictureUrl(userId, 'image').catch(() => null),
groupName: groupMetadata.subject,
userName: global.db.data.users[userId]?.name || userId.split('@')[0]
});
await conn.sendFile(chatId, card, 'bye.png', text, null, false, { mentions: [userId] });
} catch (e) {
console.error("Error al generar la tarjeta de despedida:", e);
await conn.reply(chatId, text, null, { mentions: [userId] }); // Fallback a texto
}
}

export default handler;