const { EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'ticket',
  description: 'Set up a ticket panel',
  permissions: [PermissionFlagsBits.ManageChannels],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (sub === 'setup') {
      const channel = message.mentions.channels.first() || message.channel;
      const category = args[1] || 'Tickets';

      const embed = new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setTitle('Support Tickets')
        .setDescription('Click the button below to open a ticket.');

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('open_ticket')
          .setLabel('Open Ticket')
          .setStyle(ButtonStyle.Primary)
      );

      await channel.send({ embeds: [embed], components: [row] });
      return message.reply(`Ticket panel sent in ${channel}.`);
    }

    return message.reply('Usage: `!ticket setup [#channel]`');
  }
};
