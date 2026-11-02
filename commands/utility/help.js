const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'List available commands',
  async execute(message) {
    const commands = message.client.commands;
    const unique = new Map();

    for (const [name, cmd] of commands) {
      if (cmd.name === name) unique.set(name, cmd);
    }

    const list = [...unique.values()]
      .map(cmd => `\`${cmd.name}\` — ${cmd.description || 'No description'}`)
      .join('\n');

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setTitle('Vanta Commands')
        .setDescription(list || 'No commands loaded.')]
    });
  }
};
