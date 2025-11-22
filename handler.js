const fs = require('fs');
const path = require('path');
const { readdirSync } = fs;

let database = {};
try {
  database = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
} catch (e) {
  console.error('Failed to load database, starting with a new one.', e);
  database = {};
}

function saveDatabase() {
  fs.writeFileSync('./database.json', JSON.stringify(database, null, 2));
}

const plugins = {};
const pluginsDir = path.join(__dirname, 'plugins');

const pluginFiles = readdirSync(pluginsDir).filter(file => file.endsWith('.js'));

for (const file of pluginFiles) {
  try {
    const plugin = require(path.join(pluginsDir, file));
    if (plugin.command) {
      plugins[plugin.command] = plugin;
    }
  } catch (e) {
    console.error(`Error loading plugin ${file}:`, e);
  }
}

module.exports = async function(sock, m) {
  if (!m.message) return;
  const messageType = Object.keys(m.message)[0];
  const messageContent = m.message[messageType];
  if (!messageContent.caption && !messageContent.text) return;

  const sender = m.key.remoteJid;
  const userId = m.key.participant || m.key.remoteJid;

  if (!database.users) database.users = {};
  if (!database.users[userId]) {
    database.users[userId] = {
      name: m.pushName || 'Unknown',
      level: 1,
      exp: 0,
      money: 0,
    };
    saveDatabase();
  }

  const text = messageContent.text || messageContent.caption || '';
  const prefix = /^[\\/!#.]/gi.test(text) ? text.match(/^[\\/!#.]/gi)[0] : '/';
  const isCmd = text.startsWith(prefix);

  if (!isCmd) return;

  const [command, ...args] = text.slice(prefix.length).trim().split(/ +/);
  const requestedPlugin = Object.values(plugins).find(p => p.command === command.toLowerCase());

  if (requestedPlugin) {
    try {
      await requestedPlugin.run(sock, m, { command, args, text, db: database });
      saveDatabase();
    } catch (e) {
      console.error(`Error executing plugin ${command}:`, e);
      await sock.sendMessage(m.key.remoteJid, { text: 'An error occurred while running the command.' }, { quoted: m });
    }
  }
};
