let handler = async (m, { conn, participants, usedPrefix, command }) => {
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
    if (!who) throw `✳️ Tag or reply to the user you want to mute/unmute.\n\n*Example:*\n${usedPrefix + command} @user`

    let chat = global.db.data.chats[m.chat] || {}
    chat.muted = chat.muted || []

    const groupAdmins = participants.filter(p => p.admin).map(p => p.id)
    const isBotAdmin = groupAdmins.includes(conn.user.jid.split`@`[0] + '@s.whatsapp.net')

    if (groupAdmins.includes(who)) {
        return m.reply('❌ You cannot mute a group admin.')
    }

    if (who === conn.user.jid) {
        return m.reply('❌ I cannot mute myself.')
    }

    const groupMetadata = await conn.groupMetadata(m.chat)
    const groupOwner = groupMetadata.owner
    if (who === groupOwner) {
        return m.reply('❌ You cannot mute the group owner.')
    }

    let userIsInMutedList = chat.muted.includes(who)

    switch (command) {
        case 'mute':
            if (userIsInMutedList) throw '✳️ This user is already muted.'
            chat.muted.push(who)
            global.db.data.chats[m.chat] = chat
            m.reply(`✅ User muted successfully. They will no longer be able to send messages.`)
            break
        case 'unmute':
            if (!userIsInMutedList) throw '✳️ This user is not muted.'
            const index = chat.muted.indexOf(who)
            if (index > -1) {
                chat.muted.splice(index, 1)
            }
            global.db.data.chats[m.chat] = chat
            m.reply(`✅ User unmuted successfully. They can now send messages again.`)
            break
    }
}
handler.help = ['mute @user', 'unmute @user']
handler.tags = ['group']
handler.command = /^(mute|unmute)$/i
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
