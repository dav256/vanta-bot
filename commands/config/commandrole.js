const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const commandRoles = require('../../utils/commandRoles');

module.exports = {
  name: 'commandrole',
  description: 'Allow specific roles to use commands',
  aliases: ['cmdrole', 'rolecmd'],
  permissions: [PermissionFlagsBits.Administrator],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (!sub || sub === 'help') {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('Command Roles')
          .setDescription('Let specific roles use commands without Discord permissions.')
          .addFields(
            { name: 'Add', value: '`commandrole add purge @Mod`', inline: false },
            { name: 'Remove', value: '`commandrole remove purge @Mod`', inline: false },
            { name: 'List', value: '`commandrole list` \u00b7 `commandrole list purge`', inline: false },
            { name: 'Clear', value: '`commandrole clear purge`', inline: false }
          )
          .setFooter({ text: 'If no roles are set, normal Discord permissions are used.' })]
      });
    }

    if (sub === 'add') {
      const cmdName = args[1]?.toLowerCase();
      const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);
      if (!cmdName || !role) {
        return message.reply('Usage: `commandrole add <command> @role`');
      }
      if (!message.client.commands.has(cmdName)) {
        return message.reply(`Unknown command: \`${cmdName}\``);
      }
      commandRoles.addRole(message.guild.id, cmdName, role.id);
      return message.reply(`**${role.name}** can now use \`${cmdName}\`.`);
    }

    if (sub === 'remove') {
      const cmdName = args[1]?.toLowerCase();
      const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);
      if (!cmdName || !role) {
        return message.reply('Usage: `commandrole remove <command> @role`');
      }
      commandRoles.removeRole(message.guild.id, cmdName, role.id);
      return message.reply(`**${role.name}** can no longer use \`${cmdName}\` via role override.`);
    }

    if (sub === 'list') {
      const cmdName = args[1]?.toLowerCase();
      const all = commandRoles.list(message.guild.id);

      if (cmdName) {
        const roles = commandRoles.getRoles(message.guild.id, cmdName);
        if (!roles.length) return message.reply(`No roles set for \`${cmdName}\`.`);
        const desc = roles.map(id => `<@&${id}>`).join(', ');
        return message.reply({
          embeds: [new EmbedBuilder()
            .setColor(0xFFFFFF)
            .setTitle(`Roles for \`${cmdName}\``)
            .setDescription(desc)]
        });
      }

      const entries = Object.entries(all).filter(([, roles]) => roles?.length);
      if (!entries.length) return message.reply('No command roles configured.');
      const desc = entries
        .map(([cmd, roles]) => `**${cmd}** \u2014 ${roles.map(id => `<@&${id}>`).join(', ')}`)
        .join('\n');
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('Command Roles')
          .setDescription(desc)]
      });
    }

    if (sub === 'clear') {
      const cmdName = args[1]?.toLowerCase();
      if (!cmdName) return message.reply('Usage: `commandrole clear <command>`');
      commandRoles.setRoles(message.guild.id, cmdName, []);
      return message.reply(`Cleared role overrides for \`${cmdName}\`.`);
    }

    return message.reply('Use `commandrole help`.');
  }
};
