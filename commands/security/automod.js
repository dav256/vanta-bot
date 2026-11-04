const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const filters = require('../../utils/filters');
const cases = require('../../utils/cases');

module.exports = {
  name: 'automod',
  description: 'Configure auto-moderation with warnings',
  aliases: ['am'],
  permissions: [PermissionFlagsBits.ManageGuild],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();
    const config = filters.get(message.guild.id);

    if (!sub || sub === 'status' || sub === 'config') {
      const lines = Object.entries(config)
        .map(([k, v]) => `${v.enabled ? '✅' : '❌'} **${k}** — ${v.punishment || 'delete'}${v.threshold ? ` (threshold: ${v.threshold})` : ''}`)
        .join('\n');

      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('AutoMod Configuration')
          .setDescription(lines || 'No filters configured.')
          .setFooter({ text: 'automod <type> on|off | automod warn <type>' })]
      });
    }

    const types = Object.keys(config);
    if (types.includes(sub)) {
      const action = args[1]?.toLowerCase();
      if (action === 'on') {
        filters.update(message.guild.id, sub, 'enabled', true);
        return message.reply(`${sub} filter enabled.`);
      }
      if (action === 'off') {
        filters.update(message.guild.id, sub, 'enabled', false);
        return message.reply(`${sub} filter disabled.`);
      }
      if (action === 'warn') {
        filters.update(message.guild.id, sub, 'punishment', 'warn');
        return message.reply(`${sub} now issues warnings.`);
      }
      if (action === 'delete') {
        filters.update(message.guild.id, sub, 'punishment', 'delete');
        return message.reply(`${sub} now deletes messages.`);
      }
    }

    return message.reply('Usage: `automod` | `automod <caps|links|invites|spam|massmention|emoji> on|off|warn|delete`');
  }
};
