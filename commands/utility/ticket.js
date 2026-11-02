const { emoji, buttonEmoji } = require('../../utils/emojis');
const { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/tickets.json');

function getData() {
  if (!fs.existsSync(dataPath)) return {};
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function saveData(data) {
  const dir = path.dirname(dataPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: 'ticket',
  description: 'Full ticket system',
  permissions: [PermissionFlagsBits.ManageChannels],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (sub === 'setup') {
      const category = await message.guild.channels.create({
        name: 'Tickets',
        type: ChannelType.GuildCategory
      });

      const panel = await message.channel.send({
        embeds: [new EmbedBuilder()
          .setColor(0x2B2D31)
          .setTitle(`${emoji('ticket')} Support Tickets`)
          .setDescription('Click the button below to open a ticket.')],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('ticket_open')
            .setLabel('Open Ticket')
            .setEmoji(buttonEmoji('ticket'))
            .setStyle(ButtonStyle.Primary)
        )]
      });

      const data = getData();
      data[message.guild.id] = { category: category.id, panel: panel.id, open: {} };
      saveData(data);

      return message.reply(`${emoji('success')} Ticket system set up.`);
    }

    if (sub === 'close') {
      if (!message.channel.name.startsWith('ticket-')) return message.reply('This is not a ticket channel.');
      await message.channel.delete().catch(() => {});
      return;
    }

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(0x2B2D31)
        .setTitle(`${emoji('ticket')} Tickets`)
        .setDescription(
          '`!ticket setup` — Create the ticket panel\n' +
          '`!ticket close` — Close the current ticket (run inside a ticket)'
        )]
    });
  }
};
