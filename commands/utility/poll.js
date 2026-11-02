const { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/polls.json');

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
  name: 'poll',
  description: 'Create a poll or election',
  permissions: [PermissionFlagsBits.ManageMessages],
  async execute(message, args) {
    const title = args.join(' ') || 'Poll';
    if (!title) return message.reply('Usage: `!poll Title of the poll`');

    // Simple options for demo — user can expand later
    const options = ['Option 1', 'Option 2', 'Option 3'];

    const embed = new EmbedBuilder()
      .setColor(0x2B2D31)
      .setTitle(title)
      .setDescription('Vote by clicking a button below!');

    const rows = [];
    let currentRow = new ActionRowBuilder();
    options.forEach((opt, i) => {
      if (currentRow.components.length >= 5) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder();
      }
      currentRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`poll_${message.id}_${i}`)
          .setLabel(opt)
          .setStyle(ButtonStyle.Secondary)
      );
    });
    if (currentRow.components.length) rows.push(currentRow);

    const msg = await message.channel.send({ embeds: [embed], components: rows });

    // Store poll data
    const data = getData();
    data[msg.id] = {
      title,
      options,
      votes: options.map(() => []),
      author: message.author.id
    };
    saveData(data);

    message.reply('Poll created!');
  }
};
