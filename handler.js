import { smsg } from "./lib/simple.js"
import { format } from "util"
import { fileURLToPath } from "url"
import path, { join } from "path"
import fs, { unwatchFile, watchFile } from "fs"
import chalk from "chalk"

const { proto } = (await import("@whiskeysockets/baileys")).default
const isNumber = x => typeof x === "number" && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
  clearTimeout(this)
  resolve()
}, ms))

export async function handler(chatUpdate) {
  this.msgqueque = this.msgqueque || []
  this.uptime = this.uptime || Date.now()
  if (!chatUpdate) return
  this.pushMessage(chatUpdate.messages).catch(console.error)
  let m = chatUpdate.messages[chatUpdate.messages.length - 1]
  if (!m) return
  if (global.db.data == null) await global.loadDatabase()
  try {
    m = smsg(this, m) || m
    if (!m) return
    m.exp = 0

    if (typeof m.text !== "string") m.text = ""

    let user = global.db.data.users[m.sender]
    let chat = global.db.data.chats[m.chat]
    let settings = global.db.data.settings[this.user.jid]

    const isROwner = [...global.owner.map((number) => number)].map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender)
    const isOwner = isROwner || m.fromMe
    const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender) || (user && user.premium)

    if (opts["queque"] && m.text && !(isPrems)) {
      const queque = this.msgqueque, time = 1000 * 5
      const previousID = queque[queque.length - 1]
      queque.push(m.id || m.key.id)
      setInterval(async function () {
        if (queque.indexOf(previousID) === -1) clearInterval(this)
        await delay(time)
      }, time)
    }

    if (m.isBaileys) return
    m.exp += Math.ceil(Math.random() * 10)

    const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), "./plugins")

    // Handle 'all' plugins
    for (const name in global.plugins) {
      const plugin = global.plugins[name]
      if (!plugin || plugin.disabled || typeof plugin.all !== "function") continue
      try {
        await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename: join(___dirname, name), user, chat, settings })
      } catch (e) {
        console.error(e)
      }
    }

    if (m.mtype === 'stickerMessage' && global.db.data.sticker) {
      let hash = m.fileSha256.toString('base64');
      let sticker = global.db.data.sticker[hash];
      if (sticker && sticker.text) {
        let text = sticker.text;
        const pref = /^[\\/!#.]/;
        m.text = pref.test(text) ? text : '.' + text;
        m.mentionedJid = sticker.mentionedJid;
        console.log(chalk.green('Executing sticker command:'), m.text);
      }
    }

    const strRegex = (str) => str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")
    const prefix = global.prefix
    const match = (prefix instanceof RegExp ? [[prefix.exec(m.text), prefix]] : Array.isArray(prefix) ? prefix.map(p => {
      const re = p instanceof RegExp ? p : new RegExp(strRegex(p))
      return [re.exec(m.text), re]
    }) : typeof prefix === "string" ? [[new RegExp(strRegex(prefix)).exec(m.text), new RegExp(strRegex(prefix))]] : [[[], new RegExp]]).find(p => p[1])

    if (!match) return

    const usedPrefix = (match[0] || "")[0]
    const noPrefix = m.text.replace(usedPrefix, "")
    let [command, ...args] = noPrefix.trim().split(" ").filter(v => v)
    args = args || []
    let _args = noPrefix.trim().split(" ").slice(1)
    let text = _args.join(" ")
    command = (command || "").toLowerCase()

    const plugin = global.commandMap.get(command)

    if (!plugin) return

    // Full DB initialization
    try {
      user = global.db.data.users[m.sender]
      if (typeof user !== "object") global.db.data.users[m.sender] = {}
      if (user) {
        if (!("name" in user)) user.name = m.name
        if (!isNumber(user.exp)) user.exp = 0
        if (!isNumber(user.coin)) user.coin = 0
        if (!isNumber(user.bank)) user.bank = 0
        if (!isNumber(user.level)) user.level = 0
        if (!isNumber(user.health)) user.health = 100
        if (!("genre" in user)) user.genre = ""
        if (!("birth" in user)) user.birth = ""
        if (!("marry" in user)) user.marry = ""
        if (!("description" in user)) user.description = ""
        if (!("packstickers" in user)) user.packstickers = null
        if (!("premium" in user)) user.premium = false
        if (!isNumber(user.premiumTime)) user.premiumTime = 0
        if (!("banned" in user)) user.banned = false
        if (!("bannedReason" in user)) user.bannedReason = ""
        if (!isNumber(user.commands)) user.commands = 0
        if (!isNumber(user.afk)) user.afk = -1
        if (!("afkReason" in user)) user.afkReason = ""
        if (!isNumber(user.warn)) user.warn = 0
      } else {
        user = global.db.data.users[m.sender] = {
          name: m.name, exp: 0, coin: 0, bank: 0, level: 0, health: 100, genre: "", birth: "", marry: "", description: "", packstickers: null, premium: false, premiumTime: 0, banned: false, bannedReason: "", commands: 0, afk: -1, afkReason: "", warn: 0
        }
      }

      chat = global.db.data.chats[m.chat]
      if (typeof chat !== "object") global.db.data.chats[m.chat] = {}
      if (chat) {
        if (!("isBanned" in chat)) chat.isBanned = false
        if (!("isMute" in chat)) chat.isMute = false;
        if (!("welcome" in chat)) chat.welcome = false
        if (!("sWelcome" in chat)) chat.sWelcome = ""
        if (!("sBye" in chat)) chat.sBye = ""
        if (!("detect" in chat)) chat.detect = true
        if (!("primaryBot" in chat)) chat.primaryBot = null
        if (!("modoadmin" in chat)) chat.modoadmin = false
        if (!("antiLink" in chat)) chat.antiLink = true
        if (!("nsfw" in chat)) chat.nsfw = false
        if (!("economy" in chat)) chat.economy = true;
        if (!("gacha" in chat)) chat.gacha = true
      } else {
        chat = global.db.data.chats[m.chat] = {
          isBanned: false, isMute: false, welcome: false, sWelcome: "", sBye: "", detect: true, primaryBot: null, modoadmin: false, antiLink: true, nsfw: false, economy: true, gacha: true
        }
      }

      settings = global.db.data.settings[this.user.jid]
      if (typeof settings !== "object") global.db.data.settings[this.user.jid] = {}
      if (settings) {
        if (!("self" in settings)) settings.self = false
        if (!("jadibotmd" in settings)) settings.jadibotmd = true
        if (!("menutype" in settings)) settings.menutype = "imagen"
      } else {
        settings = global.db.data.settings[this.user.jid] = {
          self: false, jadibotmd: true, menutype: "imagen"
        }
      }
    } catch (e) {
      console.error(e)
    }

    const groupMetadata = m.isGroup ? { ...(conn.chats[m.chat]?.metadata || await this.groupMetadata(m.chat).catch(_ => null) || {}) } : {}
    const participants = m.isGroup ? groupMetadata.participants || [] : []
    const userGroup = m.isGroup ? participants.find(u => conn.decodeJid(u.id) === m.sender) : {}
    const botGroup = m.isGroup ? participants.find(u => conn.decodeJid(u.id) === this.user.jid) : {}
    const isRAdmin = userGroup?.admin === "superadmin" || false
    const isAdmin = isRAdmin || userGroup?.admin === "admin" || false
    const isBotAdmin = botGroup?.admin === "admin" || false

    if (typeof plugin.before === "function") {
      if (await plugin.before.call(this, m, { match, conn: this, participants, groupMetadata, userGroup, botGroup, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename: join(___dirname, plugin.filename), user, chat, settings }))
        return
    }

    if (settings.self && !isOwner) return

    if (chat?.isBanned && !isROwner) return m.reply(`ꕥ El bot está desactivado en este grupo.`)
    if (user?.banned && !isROwner) return m.reply(`ꕥ Estás baneado/a.`)

    if (plugin.owner && !isOwner) {
      fail("owner", m, this)
      return
    }
    if (plugin.premium && !isPrems) {
      fail("premium", m, this)
      return
    }
    if (plugin.group && !m.isGroup) {
      fail("group", m, this)
      return
    }
    if (plugin.botAdmin && !isBotAdmin) {
      fail("botAdmin", m, this)
      return
    }
    if (plugin.admin && !isAdmin) {
      fail("admin", m, this)
      return
    }

    m.plugin = plugin.filename
    global.db.data.users[m.sender].commands++
    m.isCommand = true
    m.exp += plugin.exp ? parseInt(plugin.exp) : 10

    let extra = {
      match, usedPrefix, noPrefix, _args, args, command, text, conn: this, participants, groupMetadata, userGroup, botGroup, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename: join(___dirname, plugin.filename), user, chat, settings
    }

    try {
      await plugin.call(this, m, extra)
    } catch (e) {
      m.error = e
      console.error(e)
    } finally {
      if (typeof plugin.after === "function") {
        try {
          await plugin.after.call(this, m, extra)
        } catch (e) {
          console.error(e)
        }
      }
    }

  } catch (err) {
    console.error(err)
  } finally {
    if (opts["queque"] && m.text) {
      const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
      if (quequeIndex !== -1)
        this.msgqueque.splice(quequeIndex, 1)
    }
    let user = global.db.data.users[m.sender]
    if (m && user) {
      user.exp += m.exp
    }
    try {
      if (!opts["noprint"]) await (await import("./lib/print.js")).default(m, this)
    } catch (e) {
      console.warn(e)
    }
  }
}

global.dfail = (type, m, conn) => {
  const msg = {
    owner: `『✦』Este comando solo puede ser usado por el creador del bot.`,
    premium: `『✦』Este comando solo puede ser usado por usuarios premium.`,
    group: `『✦』Este comando solo puede ser usado en grupos.`,
    admin: `『✦』Este comando solo puede ser usado por administradores del grupo.`,
    botAdmin: `『✦』Para usar este comando, debo ser administrador del grupo.`
  }[type]
  if (msg) conn.reply(m.chat, msg, m)
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
  unwatchFile(file)
  console.log(chalk.magenta("Se actualizo 'handler.js'"))
  if (global.reloadHandler) console.log(await global.reloadHandler())
})
