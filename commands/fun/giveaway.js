const { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const giveaways = require('../../utils/giveaways');

function parseDuration(str) {
  if (!str) return null;
  const match = str.match(/^(\d+)([smhd])$/i);
  if (!match) return null;
  const num = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return num * (multipliers[unit] || 0);
}

module.exports = {
  name: 'giveaway',
  description: 'Start a giveaway',
  aliases: ['gstart'],
  permissions: [PermissionFlagsBits.ManageGuild],
  async execute(message, args) {
    const durationStr = args[0];
    const winners = parseInt(args[1]) || 1;
    const prize = args.slice(2).join(' ');

    if (!durationStr || !prize) return message.reply('Usage: `giveaway <duration> <winners> <prize>`');

    const duration = parseDuration(durationStr);
    if (!duration) return message.reply('Invalid duration (e.g. 1h, 30m, 1d).');

    const endsAt = Date.now() + duration;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('giveaway_enter').setLabel('Enter').setStyle(ButtonStyle.Success)
    );

    const embed = new EmbedBuilder()
      .setColor(0xFFFFFF)
      .setTitle(prize)
      .setDescription(`Click the button to enter!\n**Winners:** ${winners}\n**Ends:** <t:${Math.floor(endsAt / 1000)}:R>`)
      .setFooter({ text: 'Giveaway' });

    const msg = await message.channel.send({ embeds: [embed], components: [row] });

    giveaways.add(message.guild.id, {
      messageId: msg.id,
      channelId: message.channel.id,
      prize,
      winners,
      endsAt,
      entrants: []
    });

    return message.reply('Giveaway started.');
  }
};
