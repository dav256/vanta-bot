const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

function readJson(file) {
  const p = path.join(__dirname, '../data', file);
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

module.exports = (client, defaultPrefix = '!') => {
  client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const prefixes = readJson('prefix.json');
    const prefix = prefixes[message.guild.id] || defaultPrefix;

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Custom commands
    const custom = readJson('customcommands.json');
    if (custom[message.guild.id]?.[commandName]) {
      return message.reply(custom[message.guild.id][commandName]);
    }

    const command = client.commands.get(commandName);
    if (!command) return;

    // Command restrictions
    const restrictions = readJson('restrictions.json');
    const restrictedRole = restrictions[message.guild.id]?.commands?.[commandName];
    if (restrictedRole && !message.member.roles.cache.has(restrictedRole) && !message.member.permissions.has('Administrator')) {
      return message.reply('You cannot use this command.');
    }

    // Permission check (with fake perms)
    if (command.permissions) {
      const fake = readJson('fakeperms.json');
      const hasFake = fake[message.guild.id]?.roles?.some(id => message.member.roles.cache.has(id));
      const missing = message.member.permissions.missing(command.permissions);
      if (missing.length && !hasFake && !message.member.permissions.has('Administrator')) {
        return message.reply({
          embeds: [new EmbedBuilder()
            .setColor(0xFF6B6B)
            .setDescription('You need the following permission(s): ' + missing.join(', '))]
        });
      }
    }

    try {
      await command.execute(message, args, client);
    } catch (error) {
      console.error('[Command Error] ' + command.name + ':', error);
      message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFF6B6B)
          .setDescription('An error occurred while running this command.')]
      }).catch(() => {});
    }
  });
};
