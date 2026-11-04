const { EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const tickets = require('../../utils/tickets');

module.exports = {
  name: 'ticket',
  description: 'Ticket system',
  permissions: [PermissionFlagsBits.ManageChannels],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (!sub || sub === 'help' || sub === 'setup') {
      if (sub === 'setup') {
        const category = await message.guild.channels.create({
          name: 'Tickets',
          type: ChannelType.GuildCategory
        });
        const config = tickets.get(message.guild.id);
        config.category = category.id;
        tickets.set(message.guild.id, config);
        return message.reply(`Ticket category created: ${category}`);
      }

      const config = tickets.get(message.guild.id);
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('Tickets')
          .addFields(
            { name: 'Category', value: config.category ? `<#${config.category}>` : 'Not set', inline: true },
            { name: 'Support Role', value: config.supportRole ? `<@&${config.supportRole}>` : 'Not set', inline: true }
          )
          .setFooter({ text: 'ticket setup | ticket role @role | ticket panel' })]
      });
    }

    if (sub === 'role') {
      const role = message.mentions.roles.first();
      if (!role) return message.reply('Mention a role.');
      const config = tickets.get(message.guild.id);
      config.supportRole = role.id;
      tickets.set(message.guild.id, config);
      return message.reply(`Support role set to ${role}.`);
    }

    if (sub === 'panel') {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_open').setLabel('Open Ticket').setStyle(ButtonStyle.Primary)
      );
      return message.channel.send({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('Support Tickets')
          .setDescription('Click the button below to open a ticket.')],
        components: [row]
      });
    }

    return message.reply('Use `ticket help`.');
  }
};
