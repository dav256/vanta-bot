const { EmbedBuilder } = require('discord.js');
const commandRoles = require('../utils/commandRoles');

module.exports = (client, prefix = '!') => {
  client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    const roleCheck = commandRoles.memberCanUse(message.member, command.name);
    if (roleCheck === false) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFF6B6B)
          .setDescription('You do not have a role that can use this command.')]
      });
    }

    if (roleCheck !== true && command.permissions) {
      const missing = message.member.permissions.missing(command.permissions);
      if (missing.length) {
        return message.reply({
          embeds: [new EmbedBuilder()
            .setColor(0xFF6B6B)
            .setDescription(`You need the following permission(s): \`${missing.join(', ')}\``)]
        });
      }
    }

    try {
      await command.execute(message, args, client);
    } catch (error) {
      console.error(`[Command Error] ${command.name}:`, error);
      message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFF6B6B)
          .setDescription('An error occurred while running this command.')]
      }).catch(() => {});
    }
  });
};
