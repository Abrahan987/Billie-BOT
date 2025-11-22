
import './config.js'
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts'
import { createRequire } from 'module'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import * as ws from 'ws'
import fs, { readdirSync, statSync, unlinkSync, existsSync, mkdirSync, readFileSync, rmSync, watch } from 'fs'
import yargs from 'yargs'
import { spawn } from 'child_process'
import lodash from 'lodash'
import chalk from 'chalk'
import syntaxerror from 'syntax-error'
import { tmpdir } from 'os'
import { format } from 'util'
import P from 'pino'
import pino from 'pino'
import path, { join, dirname } from 'path'
import { Boom } from '@hapi/boom'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
import { Low, JSONFile } from 'lowdb'
import store from './lib/store.js'
const { proto } = (await import('@whiskeysockets/baileys')).default
import pkg from 'google-libphonenumber'
const { PhoneNumberUtil } = pkg
const phoneUtil = PhoneNumberUtil.getInstance()
const { DisconnectReason, useMultiFileAuthState, MessageRetryMap, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser } = await import('@whiskeysockets/baileys')
import readline from 'readline'
import NodeCache from 'node-cache'

const { CONNECTING } = ws
const { chain } = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000

let { say } = cfonts

const __dirname = dirname(fileURLToPath(import.meta.url))

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())

say('GOJO BOT', {
  font: 'block',
  align: 'center',
  colors: ['yellowBright']
})

say(`Made With By ABRAHAN-M Y STAFF GOJO`, {
  font: 'console',
  align: 'center',
  colors: ['cyan']
})

if (!existsSync("./Gojo-sessions")) {
  mkdirSync("./Gojo-sessions");
}

let handler = await import('./handler.js')
let M_IMPORT = import.meta.url

async function startGojo() {
  const { state, saveCreds } = await useMultiFileAuthState('./Gojo-sessions')
  const { version, isLatest } = await fetchLatestBaileysVersion()

  const connectionOptions = {
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    browser: ['Gojo-Bot', 'Safari', '1.0.0'],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
    },
    version
  }

  const conn = makeWASocket(connectionOptions)
  store.bind(conn)

  conn.ev.on('messages.upsert', async chatUpdate => {
    try {
      const mek = chatUpdate.messages[0]
      if (!mek.message) return
      mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
      if (mek.key && mek.key.remoteJid === 'status@broadcast') return
      if (!conn.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
      if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return
      const m = serialize(conn, mek, store)
      handler.handler(conn, m, chatUpdate)
    } catch (err) {
      console.error(err)
    }
  })

  conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      let reason = new Boom(lastDisconnect?.error)?.output.statusCode
      if (reason === DisconnectReason.badSession) {
        console.log(`Bad Session File, Please Delete Session and Scan Again`)
        startGojo()
      } else if (reason === DisconnectReason.connectionClosed) {
        console.log("Connection closed, reconnecting....")
        startGojo()
      } else if (reason === DisconnectReason.connectionLost) {
        console.log("Connection Lost from Server, reconnecting...")
        startGojo()
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First")
        startGojo()
      } else if (reason === DisconnectReason.loggedOut) {
        console.log(`Device Logged Out, Please Scan Again And Run.`)
        startGojo()
      } else if (reason === DisconnectReason.restartRequired) {
        console.log("Restart Required, Restarting...")
        startGojo()
      } else if (reason === DisconnectReason.timedOut) {
        console.log("Connection TimedOut, Reconnecting...")
        startGojo()
      } else {
        conn.end(`Unknown DisconnectReason: ${reason}|${connection}`)
      }
    } else if (connection === 'open') {
      console.log('Connected to WhatsApp')
    }
  })

  conn.ev.on('creds.update', saveCreds)
}

startGojo()

let file = fileURLToPath(M_IMPORT)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'index.js'"))
  import(`${file}?update=${Date.now()}`)
})
