const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const rr = require('../../utils/reactionroles');

module.exports = {
  name: 'reactionrole',
  description: 'Set up reaction roles',
  aliases: ['rr'],
  permissions: [PermissionFlagsBits.ManageRoles],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (!sub || sub === 'help') {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('Reaction Roles')
          .setDescription('`rr add <messageId> <emoji> @role`\n`rr remove <messageId> <emoji>`\n`rr list`')]
      });
    }

    if (sub === 'add') {
      const messageId = args[1];
      const emoji = args[2];
      const role = message.mentions.roles.first();

      if (!messageId || !emoji || !role) return message.reply('Usage: `rr add <messageId> <emoji> @role`');

      rr.add(message.guild.id, messageId, emoji, role.id);
      return message.reply(`Reaction role added: ${emoji} → ${role}`);
    }

    if (sub === 'remove') {
      const messageId = args[1];
      const emoji = args[2];
      if (!messageId || !emoji) return message.reply('Usage: `rr remove <messageId> <emoji>`');
      const removed = rr.remove(message.guild.id, messageId, emoji);
      return message.reply(removed ? 'Reaction role removed.' : 'Not found.');
    }

    if (sub === 'list') {
      const list = rr.get(message.guild.id);
      if (!list.length) return message.reply('No reaction roles set.');
      const desc = list.map(r => `\`${r.messageId}\` — ${r.emoji} → <@&${r.roleId}>`).join('\n');
      return message.reply({
        embeds: [new EmbedBuilder().setColor(0xFFFFFF).setTitle('Reaction Roles').setDescription(desc)]
      });
    }

    return message.reply('Use `rr help`.');
  }
};
