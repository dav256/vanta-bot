const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const cases = require('../../utils/cases');

module.exports = {
  name: 'case',
  description: 'View moderation cases',
  aliases: ['cases'],
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (!sub || sub === 'help') {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('Case System')
          .setDescription('View moderation cases.')
          .addFields(
            { name: 'View a case', value: '`case view <id>`', inline: false },
            { name: 'User history', value: '`case history @user`', inline: false }
          )]
      });
    }

    if (sub === 'view') {
      const id = parseInt(args[1]);
      if (!id) return message.reply('Provide a case ID.');
      const c = cases.get(message.guild.id, id);
      if (!c) return message.reply('Case not found.');

      const user = await message.client.users.fetch(c.userId).catch(() => null);
      const mod = await message.client.users.fetch(c.moderatorId).catch(() => null);

      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle(`Case #${c.id}`)
          .addFields(
            { name: 'Type', value: c.type, inline: true },
            { name: 'User', value: user ? `${user.tag} (${user.id})` : c.userId, inline: true },
            { name: 'Moderator', value: mod ? mod.tag : c.moderatorId, inline: true },
            { name: 'Reason', value: c.reason, inline: false },
            { name: 'Date', value: `<t:${Math.floor(c.timestamp / 1000)}:F>`, inline: false }
          )]
      });
    }

    if (sub === 'history' || sub === 'user') {
      const user = message.mentions.users.first() || message.client.users.cache.get(args[1]);
      if (!user) return message.reply('Mention a user or provide their ID.');

      const userCases = cases.getByUser(message.guild.id, user.id);
      if (!userCases.length) return message.reply(`${user.tag} has no cases.`);

      const recent = userCases.slice(-10).reverse();
      const desc = recent.map(c => `**#${c.id}** — ${c.type} — ${c.reason.slice(0, 40)}`).join('\n');

      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle(`Cases for ${user.tag}`)
          .setDescription(desc)
          .setFooter({ text: `${userCases.length} total case(s)` })]
      });
    }

    return message.reply('Use `case help`.');
  }
};
