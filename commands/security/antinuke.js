const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const security = require('../../utils/security');

module.exports = {
  name: 'antinuke',
  description: 'Configure antinuke protection',
  permissions: [PermissionFlagsBits.Administrator],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();
    const config = security.get(message.guild.id);

    if (!sub || sub === 'status' || sub === 'config') {
      const mods = Object.entries(config.antinuke.modules)
        .map(([k, v]) => `${v ? '✅' : '❌'} ${k}`)
        .join('\n');

      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('Antinuke Configuration')
          .addFields(
            { name: 'Enabled', value: config.antinuke.enabled ? 'Yes' : 'No', inline: true },
            { name: 'Threshold', value: String(config.antinuke.threshold), inline: true },
            { name: 'Punishment', value: config.antinuke.punishment, inline: true },
            { name: 'Whitelist', value: config.antinuke.whitelist.length ? config.antinuke.whitelist.map(id => `<@${id}>`).join(', ') : 'None', inline: false },
            { name: 'Modules', value: mods || 'None', inline: false }
          )
          .setFooter({ text: 'Use: antinuke <on|off|threshold|punishment|whitelist>' })]
      });
    }

    if (sub === 'on') {
      security.update(message.guild.id, 'antinuke.enabled', true);
      return message.reply('Antinuke enabled.');
    }
    if (sub === 'off') {
      security.update(message.guild.id, 'antinuke.enabled', false);
      return message.reply('Antinuke disabled.');
    }
    if (sub === 'threshold') {
      const num = parseInt(args[1]);
      if (!num || num < 1 || num > 20) return message.reply('Threshold must be 1-20.');
      security.update(message.guild.id, 'antinuke.threshold', num);
      return message.reply(`Threshold set to **${num}**.`);
    }
    if (sub === 'punishment') {
      const p = args[1]?.toLowerCase();
      if (!['ban', 'kick', 'strip'].includes(p)) return message.reply('Punishment must be: ban, kick, or strip.');
      security.update(message.guild.id, 'antinuke.punishment', p);
      return message.reply(`Punishment set to **${p}**.`);
    }
    if (sub === 'whitelist') {
      const action = args[1]?.toLowerCase();
      const user = message.mentions.users.first() || message.guild.members.cache.get(args[2]);
      if (!user) return message.reply('Mention a user or provide ID.');

      const list = [...config.antinuke.whitelist];
      if (action === 'add') {
        if (!list.includes(user.id)) list.push(user.id);
        security.update(message.guild.id, 'antinuke.whitelist', list);
        return message.reply(`${user} added to antinuke whitelist.`);
      }
      if (action === 'remove') {
        const filtered = list.filter(id => id !== user.id);
        security.update(message.guild.id, 'antinuke.whitelist', filtered);
        return message.reply(`${user} removed from antinuke whitelist.`);
      }
    }

    return message.reply('Usage: `antinuke [on|off|threshold <n>|punishment <ban|kick|strip>|whitelist <add|remove> @user]`');
  }
};
