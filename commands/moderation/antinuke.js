const { emoji } = require('../../utils/emojis');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/antinuke.json');

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
  name: 'antinuke',
  description: 'Configure antinuke protection',
  permissions: [PermissionFlagsBits.Administrator],
  async execute(message, args) {
    const data = getData();
    const guildId = message.guild.id;
    if (!data[guildId]) data[guildId] = { enabled: false, threshold: 5, punishment: 'ban', whitelist: [] };

    const sub = args[0]?.toLowerCase();

    if (!sub || sub === 'help') {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0x2B2D31)
          .setTitle(`${emoji('shield')} Antinuke`)
          .setDescription(
            '`!antinuke enable` — Turn on antinuke\n' +
            '`!antinuke disable` — Turn off\n' +
            '`!antinuke threshold 5` — Actions before punish (default 5)\n' +
            '`!antinuke punishment ban` — ban / kick / timeout\n' +
            '`!antinuke whitelist @user` — Exempt a user\n' +
            '`!antinuke status` — View settings'
          )]
      });
    }

    if (sub === 'enable') {
      data[guildId].enabled = true;
      saveData(data);
      return message.reply('Antinuke enabled.');
    }

    if (sub === 'disable') {
      data[guildId].enabled = false;
      saveData(data);
      return message.reply('Antinuke disabled.');
    }

    if (sub === 'threshold') {
      const num = parseInt(args[1]);
      if (!num || num < 1) return message.reply('Provide a number (e.g. `!antinuke threshold 5`).');
      data[guildId].threshold = num;
      saveData(data);
      return message.reply(`Threshold set to ${num} actions.`);
    }

    if (sub === 'punishment') {
      const type = args[1]?.toLowerCase();
      if (!['ban', 'kick', 'timeout'].includes(type)) return message.reply('Punishment must be: ban, kick, or timeout');
      data[guildId].punishment = type;
      saveData(data);
      return message.reply(`Punishment set to ${type}.`);
    }

    if (sub === 'whitelist') {
      const user = message.mentions.users.first();
      if (!user) return message.reply('Mention a user to whitelist.');
      if (!data[guildId].whitelist.includes(user.id)) data[guildId].whitelist.push(user.id);
      saveData(data);
      return message.reply(`${user.tag} added to antinuke whitelist.`);
    }

    if (sub === 'status') {
      const cfg = data[guildId];
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0x2B2D31)
          .setTitle(`${emoji('shield')} Antinuke Status`)
          .addFields(
            { name: 'Enabled', value: cfg.enabled ? 'Yes' : 'No', inline: true },
            { name: 'Threshold', value: String(cfg.threshold), inline: true },
            { name: 'Punishment', value: cfg.punishment, inline: true },
            { name: 'Whitelisted', value: cfg.whitelist.length ? cfg.whitelist.map(id => `<@${id}>`).join(', ') : 'None' }
          )]
      });
    }

    return message.reply('Unknown option. Use `!antinuke help`.');
  }
};
