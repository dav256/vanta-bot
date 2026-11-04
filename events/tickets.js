const { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const tickets = require('../utils/tickets');

module.exports = (client) => {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId !== 'ticket_open') return;

    const config = tickets.get(interaction.guild.id);
    if (!config.category) return interaction.reply({ content: 'Tickets are not set up.', ephemeral: true });

    const existing = Object.values(config.open || {}).find(t => t.userId === interaction.user.id);
    if (existing) return interaction.reply({ content: 'You already have an open ticket.', ephemeral: true });

    try {
      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: config.category,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
          ...(config.supportRole ? [{ id: config.supportRole, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }] : [])
        ]
      });

      if (!config.open) config.open = {};
      config.open[channel.id] = { userId: interaction.user.id, createdAt: Date.now() };
      tickets.set(interaction.guild.id, config);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_close').setLabel('Close').setStyle(ButtonStyle.Danger)
      );

      await channel.send({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('Ticket Opened')
          .setDescription(`${interaction.user}, support will be with you shortly.`)],
        components: [row]
      });

      await interaction.reply({ content: `Ticket created: ${channel}`, ephemeral: true });
    } catch {
      await interaction.reply({ content: 'Failed to create ticket.', ephemeral: true });
    }
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId !== 'ticket_close') return;

    const config = tickets.get(interaction.guild.id);
    if (config.open?.[interaction.channel.id]) {
      delete config.open[interaction.channel.id];
      tickets.set(interaction.guild.id, config);
    }

    await interaction.reply({ content: 'Closing ticket...' });
    setTimeout(() => interaction.channel.delete().catch(() => {}), 2000);
  });
};
