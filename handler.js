import './config.js'
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = './database.json';
let database = {};

if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));
  console.log('Created database.json as it did not exist.');
}

try {
  const data = fs.readFileSync(dbPath, 'utf8');
  database = JSON.parse(data);
} catch (e) {
  console.error('Failed to load database, starting with an empty one.', e);
  database = {};
}

function saveDatabase() {
  fs.writeFileSync('./database.json', JSON.stringify(database, null, 2));
}

const plugins = {};
const commands = {};

const pluginsDir = path.join(__dirname, 'plugins');
const pluginFiles = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));

for (const file of pluginFiles) {
  try {
    const filePath = path.join(pluginsDir, file);
    const fileUrl = pathToFileURL(filePath).href;
    const module = await import(fileUrl);
    const plugin = module.default;

    if (plugin && Array.isArray(plugin.command)) {
      plugins[file] = plugin;
      plugin.command.forEach(cmd => {
        commands[cmd.toLowerCase()] = plugin;
      });
    }
  } catch (e) {
    console.error(`Error loading plugin ${file}:`, e);
  }
}

const handler = async function(sock, m) {
  if (!m.message) return;
  const messageType = Object.keys(m.message)[0];
  const messageContent = m.message[messageType];
  if (!messageContent.caption && !messageContent.text) return;

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
  const requestedPlugin = commands[command.toLowerCase()];

  if (requestedPlugin) {
    try {
      await requestedPlugin(sock, m, { command, args, text, db: database, plugins });
      saveDatabase();
    } catch (e) {
      console.error(`Error executing plugin ${command}:`, e);
      await sock.sendMessage(m.key.remoteJid, { text: 'An error occurred while running the command.' }, { quoted: m });
    }
  }
};

export default { handler };
