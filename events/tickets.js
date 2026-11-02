const { buttonEmoji } = require('../utils/emojis');
const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/tickets.json');

function getData() {
  if (!fs.existsSync(dataPath)) return {};
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function saveData(data) {
  const dir = path.dirname(dataPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports = (client) => {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId !== 'ticket_open') return;

    const data = getData();
    const cfg = data[interaction.guild.id];
    if (!cfg) return interaction.reply({ content: 'Tickets not set up.', ephemeral: true });

    const existing = Object.values(cfg.open || {}).find(id => id === interaction.user.id);
    if (existing) return interaction.reply({ content: 'You already have a ticket open.', ephemeral: true });

    const channel = await interaction.guild.channels.create({
      name: 'ticket-' + interaction.user.username,
      type: ChannelType.GuildText,
      parent: cfg.category,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
      ]
    });

    if (!cfg.open) cfg.open = {};
    cfg.open[channel.id] = interaction.user.id;
    saveData(data);

    await channel.send({
      embeds: [new EmbedBuilder()
        .setColor(0x2B2D31)
        .setTitle('Ticket Opened')
        .setDescription(interaction.user.toString() + ' opened a ticket.')],
      components: [new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_close').setLabel('Close').setEmoji(buttonEmoji('lock')).setStyle(ButtonStyle.Danger)
      )]
    });

    interaction.reply({ content: 'Ticket created: ' + channel.toString(), ephemeral: true });
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId !== 'ticket_close') return;
    if (!interaction.channel.name.startsWith('ticket-')) return;
    await interaction.channel.delete().catch(() => {});
  });

  console.log('[Events] Tickets loaded');
};
