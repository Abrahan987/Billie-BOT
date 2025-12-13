import fetch from 'node-fetch'

let handler = async (m, { conn, command, usedPrefix }) => {
let mentionedJid = await m.mentionedJid
let userId = mentionedJid.length > 0 ? mentionedJid[0] : (m.quoted ? await m.quoted.sender : m.sender)
let from = await (async () => global.db.data.users[m.sender].name || (async () => { try { const n = await conn.getName(m.sender); return typeof n === 'string' && n.trim() ? n : m.sender.split('@')[0] } catch { return m.sender.split('@')[0] } })())()
let who = await (async () => global.db.data.users[userId].name || (async () => { try { const n = await conn.getName(userId); return typeof n === 'string' && n.trim() ? n : userId.split('@')[0] } catch { return userId.split('@')[0] } })())()
let str, query
switch (command) {
case 'angry': case 'enojado':
str = from === who ? `♪ ${from} está enojado/a ♪` : `♪ ${from} está enojado/a con ${who} ♪`
query = 'anime angry'
break
case 'bath': case 'bañarse':
str = from === who ? `♪ ${from} se está bañando ♪` : `♪ ${from} está bañando a ${who} ♪`
query = 'anime bath'
break
case 'bite': case 'morder':
str = from === who ? `♪ ${from} se está mordiendo ♪` : `♪ ${from} mordió a ${who} ♪`
query = 'anime bite'
break
case 'bleh': case 'lengua':
str = from === who ? `♪ ${from} saca la lengua ♪` : `♪ ${from} le saca la lengua a ${who} ♪`
query = 'anime bleh'
break
case 'blush': case 'sonrojarse':
str = from === who ? `♪ ${from} se sonrojó ♪` : `♪ ${from} se sonrojó por ${who} ♪`
query = 'anime blush'
break
case 'bored': case 'aburrido':
str = from === who ? `♪ ${from} está aburrido/a ♪` : `♪ ${from} está aburrido/a de ${who} ♪`
query = 'anime bored'
break
case 'clap': case 'aplaudir':
str = from === who ? `♪ ${from} está aplaudiendo ♪` : `♪ ${from} le aplaude a ${who} ♪`
query = 'anime clap'
break
case 'coffee': case 'cafe': case 'café':
str = from === who ? `♪ ${from} está tomando café ♪` : `♪ ${from} está tomando café con ${who} ♪`
query = 'anime coffee'
break
case 'cry': case 'llorar':
str = from === who ? `♪ ${from} está llorando ♪` : `♪ ${from} está llorando por ${who} ♪`
query = 'anime cry'
break
case 'cuddle': case 'acurrucarse':
str = from === who ? `♪ ${from} se acurruca ♪` : `♪ ${from} se acurruca con ${who} ♪`
query = 'anime cuddle'
break
case 'dance': case 'bailar':
str = from === who ? `♪ ${from} está bailando ♪` : `♪ ${from} baila con ${who} ♪`
query = 'anime dance'
break
case 'drunk': case 'borracho':
str = from === who ? `♪ ${from} está borracho/a ♪` : `♪ ${from} se emborrachó con ${who} ♪`
query = 'anime drunk'
break
case 'eat': case 'comer':
str = from === who ? `♪ ${from} está comiendo ♪` : `♪ ${from} come con ${who} ♪`
query = 'anime eat'
break
case 'facepalm':
str = from === who ? `♪ ${from} se da una palmada en la cara ♪` : `♪ ${from} se da una palmada en la cara por ${who} ♪`
query = 'anime facepalm'
break
case 'happy': case 'feliz':
str = from === who ? `♪ ${from} está feliz ♪` : `♪ ${from} está feliz por ${who} ♪`;
query = 'anime happy';
break
case 'hug': case 'abrazar':
str = from === who ? `♪ ${from} se abraza ♪` : `♪ ${from} abraza a ${who} ♪`;
query = 'anime hug'
break
case 'kill': case 'matar':
str = from === who ? `♪ ${from} se suicidó ♪` : `♪ ${from} mató a ${who} ♪`
query = 'anime kill'
break
case 'kiss': case 'beso':
str = from === who ? `♪ ${from} se está besando ♪` : `♪ ${from} besó a ${who} ♪`
query = 'anime kiss'
break
case 'laugh': case 'reirse':
str = from === who ? `♪ ${from} se ríe ♪` : `♪ ${from} se ríe de ${who} ♪`
query = 'anime laugh'
break
case 'lick': case 'lamer':
str = from === who ? `♪ ${from} se lame ♪` : `♪ ${from} lamió a ${who} ♪`
query = 'anime lick'
break
case 'slap': case 'bofetada':
str = from === who ? `♪ ${from} se abofetea ♪` : `♪ ${from} abofeteó a ${who} ♪`
query = 'anime slap'
break
case 'sleep': case 'dormir':
str = from === who ? `♪ ${from} está durmiendo ♪` : `♪ ${from} duerme con ${who} ♪`
query = 'anime sleep'
break
case 'smoke': case 'fumar':
str = from === who ? `♪ ${from} está fumando ♪` : `♪ ${from} fuma con ${who} ♪`
query = 'anime smoke'
break
case 'spit': case 'escupir':
str = from === who ? `♪ ${from} escupe ♪` : `♪ ${from} escupió a ${who} ♪`
query = 'anime spit'
break
case 'step': case 'pisar':
str = from === who ? `♪ ${from} se pisó ♪` : `♪ ${from} pisó a ${who} ♪`
query = 'anime step'
break
case 'think': case 'pensar':
str = from === who ? `♪ ${from} está pensando ♪` : `♪ ${from} piensa en ${who} ♪`
query = 'anime think'
break
case 'love': case 'enamorado': case 'enamorada':
str = from === who ? `♪ ${from} está enamorado/a ♪` : `♪ ${from} se enamoró de ${who} ♪`
query = 'anime love'
break
case 'pat': case 'palmadita':
str = from === who ? `♪ ${from} se da una palmadita ♪` : `♪ ${from} le da una palmadita a ${who} ♪`
query = 'anime pat'
break
case 'poke': case 'picar':
str = from === who ? `♪ ${from} se pica ♪` : `♪ ${from} pica a ${who} ♪`
query = 'anime poke'
break
case 'pout': case 'pucheros':
str = from === who ? `♪ ${from} hace pucheros ♪` : `♪ ${from} le hace pucheros a ${who} ♪`
query = 'anime pout'
break
case 'punch': case 'pegar': case 'golpear':
str = from === who ? `♪ ${from} se golpea ♪` : `♪ ${from} golpea a ${who} ♪`
query = 'anime punch'
break
case 'preg': case 'preñar': case 'embarazar':
str = from === who ? `♪ ${from} se embarazó ♪` : `♪ ${from} embarazó a ${who} ♪`
query = 'anime preg'
break
case 'run': case 'correr':
str = from === who ? `♪ ${from} está corriendo ♪` : `♪ ${from} corre de ${who} ♪`
query = 'anime run'
break
case 'sad': case 'triste':
str = from === who ? `♪ ${from} está triste ♪` : `♪ ${from} está triste por ${who} ♪`
query = 'anime sad'
break
case 'scared': case 'asustado':
str = from === who ? `♪ ${from} está asustado/a ♪` : `♪ ${from} se asustó de ${who} ♪`
query = 'anime scared'
break
case 'seduce': case 'seducir':
str = from === who ? `♪ ${from} se seduce ♪` : `♪ ${from} seduce a ${who} ♪`
query = 'anime seduce'
break
case 'shy': case 'timido':
str = from === who ? `♪ ${from} es tímido/a ♪` : `♪ ${from} es tímido/a con ${who} ♪`
query = 'anime shy'
break
case 'walk': case 'caminar':
str = from === who ? `♪ ${from} está caminando ♪` : `♪ ${from} camina con ${who} ♪`;
query = 'anime walk' 
break
case 'dramatic': case 'drama':
str = from === who ? `♪ ${from} hace un drama ♪` : `♪ ${from} le hace un drama a ${who} ♪`
query = 'anime dramatic'
break
case 'kisscheek': case 'beso':
str = from === who ? `♪ ${from} se da un beso ♪` : `♪ ${from} le da un beso en la mejilla a ${who} ♪`
query = 'anime kisscheek'
break
case 'wink': case 'guiñar':
str = from === who ? `♪ ${from} guiña un ojo ♪` : `♪ ${from} le guiña un ojo a ${who} ♪`
query = 'anime wink'
break
case 'cringe': case 'avergonzarse':
str = from === who ? `♪ ${from} siente cringe ♪` : `♪ ${from} siente cringe por ${who} ♪`
query = 'anime cringe'
break
case 'smug': case 'presumir':
str = from === who ? `♪ ${from} presume ♪` : `♪ ${from} le presume a ${who} ♪`
query = 'anime smug'
break
case 'smile': case 'sonreir':
str = from === who ? `♪ ${from} sonríe ♪` : `♪ ${from} le sonríe a ${who} ♪`
query = 'anime smile'
break
case 'highfive':
str = from === who ? `♪ ${from} choca los cinco ♪` : `♪ ${from} choca los cinco con ${who} ♪`
query = 'anime highfive'
break
case 'handhold': case 'mano':
str = from === who ? `♪ ${from} se da la mano ♪` : `♪ ${from} le da la mano a ${who} ♪`
query = 'anime handhold'
break
case 'bullying': case 'bully':
str = from === who ? `♪ ${from} se hace bullying ♪` : `♪ ${from} le hace bullying a ${who} ♪`
query = 'anime bullying'
break
case 'wave': case 'hola': case 'ola':
str = from === who ? `♪ ${from} saluda ♪` : `♪ ${from} saluda a ${who} ♪`
query = 'anime wave'
break
}
if (m.isGroup) {
try {
const res = await fetch(`${global.APIs.delirius.url}/search/tenor?q=${query}`)
const json = await res.json()
const gifs = json.data
if (!gifs || gifs.length === 0) return m.reply('☂︎ No se encontraron resultados. ☂︎')
const randomGif = gifs[Math.floor(Math.random() * gifs.length)].mp4
conn.sendMessage(m.chat, { video: { url: randomGif }, gifPlayback: true, caption: str, mentions: [who] }, { quoted: m })
} catch (e) {
return m.reply(`☂︎ Ocurrió un error. ☂︎\n\n${e.message}`)
}}}

handler.help = ['angry', 'enojado', 'bath', 'bañarse', 'bite', 'morder', 'bleh', 'lengua', 'blush', 'sonrojarse', 'bored', 'aburrido', 'clap', 'aplaudir', 'coffee', 'cafe', 'café', 'cry', 'llorar', 'cuddle', 'acurrucarse', 'dance', 'bailar', 'drunk', 'borracho', 'eat', 'comer', 'facepalm', 'palmada', 'happy', 'feliz', 'hug', 'abrazar', 'kill', 'matar', 'kiss', 'muak', 'laugh', 'reirse', 'lick', 'lamer', 'slap', 'bofetada', 'sleep', 'dormir', 'smoke', 'fumar', 'spit', 'escupir', 'step', 'pisar', 'think', 'pensar', 'love', 'enamorado', 'enamorada', 'pat', 'palmadita', 'palmada', 'poke', 'picar', 'pout', 'pucheros', 'punch', 'pegar', 'golpear', 'preg', 'preñar', 'embarazar', 'run', 'correr', 'sad', 'triste', 'scared', 'asustada', 'asustado', 'seduce', 'seducir', 'shy', 'timido', 'timida', 'walk', 'caminar', 'dramatic', 'drama', 'kisscheek', 'beso', 'wink', 'guiñar', 'cringe', 'avergonzarse', 'smug', 'presumir', 'smile', 'sonreir', 'clap', 'aplaudir', 'highfive', '5', 'bully', 'bullying', 'mano', 'handhold', 'ola', 'wave', 'hola']
handler.tags = ['anime']
handler.command = ['angry', 'enojado', 'bath', 'bañarse', 'bite', 'morder', 'bleh', 'lengua', 'blush', 'sonrojarse', 'bored', 'aburrido', 'clap', 'aplaudir', 'coffee', 'cafe', 'café', 'cry', 'llorar', 'cuddle', 'acurrucarse', 'dance', 'bailar', 'drunk', 'borracho', 'eat', 'comer', 'facepalm', 'palmada', 'happy', 'feliz', 'hug', 'abrazar', 'kill', 'matar', 'kiss', 'muak', 'laugh', 'reirse', 'lick', 'lamer', 'slap', 'bofetada', 'sleep', 'dormir', 'smoke', 'fumar', 'spit', 'escupir', 'step', 'pisar', 'think', 'pensar', 'love', 'enamorado', 'enamorada', 'pat', 'palmadita', 'palmada', 'poke', 'picar', 'pout', 'pucheros', 'punch', 'pegar', 'golpear', 'preg', 'preñar', 'embarazar', 'run', 'correr', 'sad', 'triste', 'scared', 'asustada', 'asustado', 'seduce', 'seducir', 'shy', 'timido', 'timida', 'walk', 'caminar', 'dramatic', 'drama', 'kisscheek', 'beso', 'wink', 'guiñar', 'cringe', 'avergonzarse', 'smug', 'presumir', 'smile', 'sonreir', 'clap', 'aplaudir', 'highfive', '5', 'bully', 'bullying', 'mano', 'handhold', 'ola', 'wave', 'hola']
handler.group = true

export default handler