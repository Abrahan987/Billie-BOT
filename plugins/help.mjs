
const handler = async (sock, m, { args, plugins }) => {
  const allCommands = {};
  let helpText = 'Available Commands:\\n\\n';

  // Categorize commands by tags
  for (const pluginFile in plugins) {
    const plugin = plugins[pluginFile];
    if (plugin.command && plugin.help && plugin.tags) {
      if (!allCommands[plugin.tags]) {
        allCommands[plugin.tags] = [];
      }
      allCommands[plugin.tags].push({
        command: plugin.command[0],
        help: plugin.help
      });
    }
  }

  // Format the help text
  for (const tag in allCommands) {
    helpText += `*${tag.toUpperCase()}*\\n`;
    allCommands[tag].forEach(cmd => {
      helpText += `  - ${cmd.command}: ${cmd.help}\\n`;
    });
    helpText += '\\n';
  }

  await sock.sendMessage(m.key.remoteJid, { text: helpText.trim() }, { quoted: m });
};

handler.command = ['help', 'menu'];
handler.help = 'Displays the list of available commands.';
handler.tags = ['utility'];
handler.register = true;

export default handler;
