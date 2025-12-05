import { WAMessageStubType } from '@whiskeysockets/baileys'

const cache = new Map()
const CACHE_TTL = 10 * 60 * 1000

async function obtenerAvatar(conn, userId) {
    const cacheKey = `avatar_${userId}`
    const cached = cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data
    }

    try {
        const avatar = await Promise.race([
            conn.profilePictureUrl(userId, 'image'),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 5000)
            )
        ])
        cache.set(cacheKey, { data: avatar, timestamp: Date.now() })
        return avatar
    } catch {
        cache.set(cacheKey, {
            data: global.welcomeConfig.defaultAvatar,
            timestamp: Date.now()
        })
        return global.welcomeConfig.defaultAvatar
    }
}

async function obtenerNombreUsuario(conn, userId) {
    const cacheKey = `name_${userId}`
    const cached = cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data
    }

    try {
        const name = await Promise.race([
            conn.getName(userId),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 5000)
            )
        ])
        const displayName = name || userId.split('@')[0]
        cache.set(cacheKey, { data: displayName, timestamp: Date.now() })
        return displayName
    } catch {
        const displayName = userId.split('@')[0]
        cache.set(cacheKey, { data: displayName, timestamp: Date.now() })
        return displayName
    }
}

const plantillas = {
    bienvenida: {
        mensaje: (chatWelcome, username, displayName, groupSubject, desc) =>
            (chatWelcome || '૮꒰ ˶• ᴗ •˶꒱ა Disfruta tu estadía en el grupo!\n\n> 🎀 Personaliza este mensaje usando: */setwelcome*')
            .replace(/{usuario}/g, `${displayName}`)
            .replace(/{grupo}/g, `*${groupSubject}*`)
            .replace(/{desc}/g, `${desc}`),

        caption: (displayName, groupSubject, mensaje) => `
╭───·˚ 🐝 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 🐝 ·˚───╮

  𐔌՞. .՞𐦯 ¡Hola, ${displayName}
  Te damos la bienvenida a: *${groupSubject}*

${mensaje}

╰──·˚ 🌷 ¡Disfruta tu estadía! ˚·──╯`
    },

    despedida: {
        mensaje: (chatBye, username, displayName, groupSubject, desc) =>
            (chatBye || '-1 homosexual 🥺\n\n> 🎀 Personaliza este mensaje usando: */setbye*')
            .replace(/{usuario}/g, `${displayName}`)
            .replace(/{grupo}/g, `${groupSubject}`)
            .replace(/{desc}/g, `*${desc}*`),

        caption: (displayName, groupSubject, mensaje) => `
╭───·˚ 🐝 𝐆𝐎𝐎𝐃 𝐁𝐘𝐄 🐝 ·˚───╮

  𐔌՞. .՞𐦯 – ${displayName}
  Se fue de: *${groupSubject}*

${mensaje}

╰───·˚  🌷 ¡Hasta pronto!  ˚·───╯`
    }
}

async function generarBienvenida({ conn, userId, groupMetadata, chat }) {
    const username = `@${userId.split('@')[0]}`
    const displayName = await obtenerNombreUsuario(conn, userId)

    const [avatar] = await Promise.all([
        obtenerAvatar(conn, userId)
    ])

    const apiUrl = `${global.welcomeConfig.apiBase}/welcomev4?avatar=${encodeURIComponent(avatar)}&background=${encodeURIComponent(global.welcomeConfig.background)}&description=${encodeURIComponent(`${displayName}`)}`

    const desc = groupMetadata.desc?.toString() || 'Sin descripción'
    const mensaje = plantillas.bienvenida.mensaje(chat.sWelcome, username, displayName, groupMetadata.subject, desc)
    const caption = plantillas.bienvenida.caption(displayName, groupMetadata.subject, mensaje)

    return {
        pp: apiUrl,
        caption,
        mentions: [userId],
        sendOptions: { quoted: null }
    }
}

async function generarDespedida({ conn, userId, groupMetadata, chat }) {
    const username = `@${userId.split('@')[0]}`
    const displayName = await obtenerNombreUsuario(conn, userId)

    const avatar = await obtenerAvatar(conn, userId)

    const apiUrl = `${global.welcomeConfig.apiBase}/goodbyev4?avatar=${encodeURIComponent(avatar)}&background=${encodeURIComponent(global.welcomeConfig.background)}&description=${encodeURIComponent(`${displayName}`)}`

    const desc = groupMetadata.desc?.toString() || 'Sin descripción'
    const mensaje = plantillas.despedida.mensaje(chat.sBye, username, displayName, groupMetadata.subject, desc)
    const caption = plantillas.despedida.caption(displayName, groupMetadata.subject, mensaje)

    return {
        pp: apiUrl,
        caption,
        mentions: [userId],
        sendOptions: { quoted: null }
    }
}

let handler = m => m
handler.before = async function (m, { conn }) {
    if (!m.messageStubType || !m.isGroup) return true

    const primaryBot = global.db?.data?.chats?.[m.chat]?.primaryBot
    if (primaryBot && conn.user.jid !== primaryBot) return true

    const chat = global.db?.data?.chats?.[m.chat]
    if (!chat) return true

    const userId = m.messageStubParameters?.[0]
    if (!userId) return true

    const groupMetadata = await conn.groupMetadata(m.chat).catch(_ => null)
    if (!groupMetadata) return

    try {
        if (chat.welcome && m.messageStubType == WAMessageStubType.GROUP_PARTIPANT_ADD) {
            const welcomeData = await Promise.race([
                generarBienvenida({ conn, userId, groupMetadata, chat }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout welcome')), global.welcomeConfig.timeout)
                )
            ])

            await conn.sendMessage(m.chat, {
                image: { url: welcomeData.pp },
                caption: welcomeData.caption,
                mentions: welcomeData.mentions
            }, welcomeData.sendOptions)
        }

        if (chat.bye && (m.messageStubType == WAMessageStubType.GROUP_PARTIPANT_REMOVE || m.messageStubType == WAMessageStubType.GROUP_PARTIPANT_LEAVE)) {
            const goodbyeData = await Promise.race([
                generarDespedida({ conn, userId, groupMetadata, chat }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout goodbye')), global.welcomeConfig.timeout)
                )
            ])

            await conn.sendMessage(m.chat, {
                image: { url: goodbyeData.pp },
                caption: goodbyeData.caption,
                mentions: goodbyeData.mentions
            }, goodbyeData.sendOptions)
        }
    } catch (error) {
        console.log('Error en bienvenida/despedida:', error.message)
    }
}

export { generarBienvenida, generarDespedida }
export default handler