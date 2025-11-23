//- Creator: @Abrahan987
//- Creador: @Abrahan987
import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

global.owner = [
  ['51936936532', 'Abrahan', true],
]
global.mods = []
global.prems = []

global.APIs = {
  fgmods: 'https://api-fgmods.ddns.net'
}
global.APIKeys = {
  'https://api-fgmods.ddns.net': 'fg-dylux'
}

// Sticker WM
global.packname = 'Sticker'
global.author = 'Billie-BOT'

global.multiplier = 69
global.maxwarn = '3'

global.nameqr = 'GOJO-BOT'
global.sessions = 'sessions'

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
