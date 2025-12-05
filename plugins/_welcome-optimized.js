import fs from 'fs'
import { WAMessageStubType } from '@whiskeysockets/baileys'

const plantillas = {
    bienvenida: {
        mensaje: (chat, username, groupSubject, desc) => (chat.sWelcome || 'Edita con el comando "setwelcome"')
            .replace(/{usuario}/g, username)
            .replace(/{grupo}/g, `*${groupSubject}*`)
            .replace(/{desc}/g, desc),
        caption: (groupSubject, username, mensaje, groupSize, fecha) =>
            `❀ Bienvenido a *"_${groupSubject}_"*\n✰ _Usuario_ » ${username}\n● ${mensaje}\n◆ _Ahora somos ${groupSize} Miembros._\nꕥ Fecha » ${fecha}\n૮꒰ ˶• ᴗ •˶꒱ა Disfruta tu estadía en el grupo!\n> *➮ Puedes usar _#help_ para ver la lista de comandos.*`,
        sizeChange: 1
    },
    despedida: {
        mensaje: (chat, username, groupSubject, desc) => (chat.sBye || 'Edita con el comando "setbye"')
            .replace(/{usuario}/g, username)
            .replace(/{grupo}/g, groupSubject)
            .replace(/{desc}/g, `*${desc}*`),
        caption: (groupSubject, username, mensaje, groupSize, fecha) =>
            `❀ Adiós de *"_${groupSubject}_"*\n✰ _Usuario_ » ${username}\n● ${mensaje}\n◆ _Ahora somos ${groupSize} Miembros._\nꕥ Fecha » ${fecha}\n(˶˃⤙˂˶) Te esperamos pronto!\n> *➮ Puedes usar _#help_ para ver la lista de comandos.*`,
        sizeChange: -1
    }
};

async function generarMensajeEvento({ conn, userId, groupMetadata, chat, eventType }) {
    const username = `@${userId.split('@')[0]}`;
    const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg');
    const fecha = new Date().toLocaleDateString("es-ES", { timeZone: "America/Mexico_City", day: 'numeric', month: 'long', year: 'numeric' });
    const desc = groupMetadata.desc?.toString() || 'Sin descripción';

    const plantilla = plantillas[eventType];
    if (!plantilla) return null;

    const groupSize = groupMetadata.participants.length + plantilla.sizeChange;
    const mensaje = plantilla.mensaje(chat, username, groupMetadata.subject, desc);
    const caption = plantilla.caption(groupMetadata.subject, username, mensaje, groupSize, fecha);

    return { pp, caption, mentions: [userId] };
}
let handler = m => m;
handler.before = async function (m, { conn }) {
    if (!m.messageStubType || !m.isGroup) return;

    const chat = global.db?.data?.chats?.[m.chat];
    const userId = m.messageStubParameters?.[0];
    if (!chat || !userId) return;

    const primaryBot = chat.primaryBot;
    if (primaryBot && conn.user.jid !== primaryBot) return;

    let eventType;
    if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
        eventType = 'bienvenida';
    } else if (chat.bye && (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE)) {
        eventType = 'despedida';
    }

    if (eventType) {
        try {
            const groupMetadata = await conn.groupMetadata(m.chat);
            const eventData = await generarMensajeEvento({ conn, userId, groupMetadata, chat, eventType });

            if (eventData) {
                await conn.sendMessage(m.chat, {
                    image: { url: eventData.pp },
                    caption: eventData.caption,
                    mentions: eventData.mentions
                });
            }
        } catch (error) {
            console.error(`Error en el evento de ${eventType}:`, error);
        }
    }
};

export default handler;
