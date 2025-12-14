
import fetch from 'node-fetch'

let handler = async (m, { conn, args }) => {
let mentionedJid = await m.mentionedJid
let userId = mentionedJid && mentionedJid[0] ? mentionedJid[0] : m.sender
let totalreg = Object.keys(global.db.data.users).length
let totalCommands = Object.values(global.plugins).filter((v) => v.help && v.tags).length

let txt = `
✦━━━━━━༺♡༻━━━━━━✦
⋆｡ﾟ☁︎｡⋆｡ 𝗖𝗢𝗠𝗔𝗡𝗗𝗢𝗦  ⋆｡ﾟ☁︎｡⋆｡
✦━━━━━━༺♡༻━━━━━━✦

*✦ Hola @${userId.split('@')[0]}, soy ${botname}*

• Tipo: ${(conn.user.jid == global.conn.user.jid ? 'Principal' : 'Sub-Bot')}
• Usuarios: ${totalreg.toLocaleString()}
• Versión: ${vs}
• Plugins: ${totalCommands}
• Librería: ${libreria}
━━━━━━━━━━━━━━━━━━


✦━━━━━━༺♡༻━━━━━━✦
⋆｡ﾟ☁︎｡⋆｡  𝗘𝗖𝗢𝗡𝗢𝗠𝗬  ⋆｡ﾟ☁︎｡⋆｡
✦━━━━━━༺♡༻━━━━━━✦

✦ #w / #work / #trabajar
✦ #slut / #prostituirse
✦ #coinflip / #flip / #cf <cant> <cara/cruz>
✦ #crime
✦ #roulette / #rt <color> <cant>
✦ #casino / #apostar / #slot <cant>
✦ #balance / #bal / #bank
✦ #deposit / #dep <cant>
✦ #withdraw / #with <cant>
✦ #economyinfo / #einfo
✦ #givecoins / #pay <user> <cant>
✦ #miming / #minar
✦ #daily / #cofre / #weekly / #monthly
✦ #steal / #rob <@user>
✦ #economyboard / #eboard
✦ #aventura / #curar / #cazar / #fish / #mazmorra

✦━━━━━━༺♡༻━━━━━━✦
⋆｡ﾟ☁︎｡⋆｡  𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗  ⋆｡ﾟ☁︎｡⋆｡
✦━━━━━━༺♡༻━━━━━━✦

✦ #tiktok <link>
✦ #wagroups <text>
✦ #mediafire <link>
✦ #mega <link>
✦ #play / #ytmp3 / #ytmp4
✦ #facebook <link>
✦ #twitter / #x
✦ #ig / #instagram
✦ #pinterest
✦ #image
✦ #apk / #modapk
✦ #ytsearch
✦ #gitclone <link>

✦━━━━━━༺♡༻━━━━━━✦
⋆｡ﾟ☁︎｡⋆｡  𝗚𝗔𝗖𝗛𝗔  ⋆｡ﾟ☁︎｡⋆｡
✦━━━━━━༺♡༻━━━━━━✦

✦ #buycharacter <name>
✦ #charimage / #waifuimage
✦ #charinfo
✦ #claim
✦ #deletewaifu <name>
✦ #favoritetop
✦ #gachainfo
✦ #giveallharem <@user>
✦ #givechar <@user> <name>
✦ #robwaifu <@user>
✦ #harem / #waifus
✦ #haremshop
✦ #removesale <price> <name>
✦ #rollwaifu
✦ #sell <price> <name>
✦ #serieinfo
✦ #serielist
✦ #setclaimmsg
✦ #trade <char1> / <char2>
✦ #vote <name>
✦ #waifusboard

✦━━━━━━༺♡༻━━━━━━✦
⋆｡ﾟ☁︎｡⋆｡  𝐄𝐌𝐎𝐗  ⋆｡ﾟ☁︎｡⋆｡
✦━━━━━━༺♡༻━━━━━━✦

✦ #Follar @user

✦━━━━━━༺♡༻━━━━━━✦
⋆｡ﾟ☁︎｡⋆｡  𝗦𝗢𝗖𝗞𝗘𝗧𝗦  ⋆｡ﾟ☁︎｡⋆｡
✦━━━━━━༺♡༻━━━━━━✦

✦ #qr / #code
✦ #bots
✦ #status
✦ #ping
✦ #join <invite>
✦ #leave
✦ #logout
✦ #setpfp
✦ #setstatus
✦ #setusername

✦━━━━━━༺♡༻━━━━━━✦
⋆｡ﾟ☁︎｡⋆｡  𝗨𝗧𝗜𝗟𝗜𝗧𝗜𝗘𝗦  ⋆｡ﾟ☁︎｡⋆｡
✦━━━━━━༺♡༻━━━━━━✦

✦ #help / #menu
✦ #sc
✦ #sug
✦ #reporte
✦ #calcular
✦ #delmeta
✦ #getpic
✦ #say
✦ #setmeta
✦ #sticker
✦ #toimg
✦ #brat / #qc / #emojimix
✦ #enhance
✦ #letra
✦ #read
✦ #ssweb
✦ #translate
✦ #ia / #gemini
✦ #iavoz
✦ #tourl
✦ #wiki
✦ #dalle
✦ #npmdl
✦ #google

✦━━━━━━༺♡༻━━━━━━✦
⋆｡ﾟ☁︎｡⋆｡  𝗣𝗥𝗢𝗙𝗜𝗟𝗘𝗦  ⋆｡ﾟ☁︎｡⋆｡
✦━━━━━━༺♡༻━━━━━━✦

✦ #leaderboard
✦ #level
✦ #marry
✦ #profile
✦ #setbirth
✦ #setdescription
✦ #setgenre
✦ #delgenre
✦ #delbirth
✦ #divorce
✦ #setfavourite
✦ #deldescription
✦ #prem / #vip

✦━━━━━━༺♡༻━━━━━━✦
⋆｡ﾟ☁︎｡⋆｡  𝗚𝗥𝗢𝗨𝗣𝗦  ⋆｡ﾟ☁︎｡⋆｡
✦━━━━━━༺♡༻━━━━━━✦

✦ #tagall <text>
✦ #detect on/off
✦ #antilink on/off
✦ #bot on/off
✦ #close
✦ #demote
✦ #economy on/off
✦ #gacha on/off
✦ #welcome on/off
✦ #setbye
✦ #setprimary
✦ #setwelcome
✦ #kick
✦ #nsfw on/off
✦ #onlyadmin on/off
✦ #open
✦ #promote
✦ #add
✦ #admins
✦ #revoke
✦ #warn / #addwarn
✦ #unwarn
✦ #advlist
✦ #inactivos
✦ #kicknum
✦ #gpbanner
✦ #gpname
✦ #gpdesc
✦ #delete
✦ #listonline
✦ #infogrupo
✦ #link

✦━━━━━━༺♡༻━━━━━━✦
⋆｡ﾟ☁︎｡⋆｡  𝗔𝗡𝗜𝗠𝗘  ⋆｡ﾟ☁︎｡⋆｡
✦━━━━━━༺♡༻━━━━━━✦

✦ #angry
✦ #bath
✦ #bite
✦ #bleh
✦ #blush
✦ #bored
✦ #clap
✦ #coffee
✦ #cry
✦ #cuddle
✦ #dance
✦ #dramatic
✦ #drunk
✦ #eat
✦ #facepalm
✦ #happy
✦ #hug
✦ #kill
✦ #kiss
✦ #kisscheek
✦ #laugh
✦ #lick
✦ #love
✦ #pat
✦ #poke
✦ #pout
✦ #punch
✦ #run
✦ #sad
✦ #scared
✦ #seduce
✦ #shy
✦ #slap
✦ #sleep
✦ #smoke
✦ #spit
✦ #step
✦ #think
✦ #walk
✦ #wink
✦ #cringe
✦ #smug
✦ #smile
✦ #highfive
✦ #bully
✦ #handhold
✦ #wave
✦ #waifu
✦ #ppcouple

✦━━━━━━༺♡༻━━━━━━✦
⋆｡ﾟ☁︎｡⋆｡  𝗡𝗦𝗙𝗪  ⋆｡ﾟ☁︎｡⋆｡
✦━━━━━━༺♡༻━━━━━━✦

✦ #danbooru <tags>
✦ #gelbooru <tags>
✦ #rule34 <tags>
✦ #xvideos <link>
✦ #xnxx <link>

> BY ABRAHAN-M
`.trim()

let settings = global.db.data.settings[conn.user.jid]
if (settings.menutype === 'video') {
    await conn.sendMessage(m.chat, {
        video: { url: global.video },
        caption: txt,
        gifPlayback: true,
        contextInfo: {
            mentionedJid: [userId],
            externalAdReply: {
                title: botname,
                body: textbot,
                thumbnail: await(await fetch(global.icono)).buffer(),
                sourceUrl: global.github,
                mediaUrl: global.github,
                mediaType: 1,
                showAdAttribution: false,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m })
} else {
    await conn.sendMessage(m.chat, {
        text: txt,
        contextInfo: {
            mentionedJid: [userId],
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.channel,
                serverMessageId: '',
                newsletterName: global.botname
            },
            externalAdReply: {
                title: botname,
                body: textbot,
                mediaType: 1,
                mediaUrl: global.github,
                sourceUrl: global.github,
                thumbnail: await (await fetch(global.banner)).buffer(),
                showAdAttribution: false,
                containsAutoReply: true,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m })
}
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu', 'menú', 'help']

export default handler
