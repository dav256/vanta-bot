const { emoji } = require('../../utils/emojis');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/antiraid.json');

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
  name: 'antiraid',
  description: 'Configure antiraid protection',
  permissions: [PermissionFlagsBits.Administrator],
  async execute(message, args) {
    const data = getData();
    const guildId = message.guild.id;
    if (!data[guildId]) data[guildId] = { enabled: false, maxJoins: 5, timeWindow: 10, minAccountAge: 7, action: 'kick' };

    const sub = args[0]?.toLowerCase();

    if (!sub || sub === 'help') {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0x2B2D31)
          .setTitle(`${emoji('shield')} Antiraid`)
          .setDescription(
            '`!antiraid enable` — Turn on\n' +
            '`!antiraid disable` — Turn off\n' +
            '`!antiraid maxjoins 5` — Max joins in time window\n' +
            '`!antiraid window 10` — Time window in seconds\n' +
            '`!antiraid age 7` — Minimum account age in days\n' +
            '`!antiraid action kick` — kick or ban\n' +
            '`!antiraid status` — View settings'
          )]
      });
    }

    if (sub === 'enable') { data[guildId].enabled = true; saveData(data); return message.reply('Antiraid enabled.'); }
    if (sub === 'disable') { data[guildId].enabled = false; saveData(data); return message.reply('Antiraid disabled.'); }

    if (sub === 'maxjoins') {
      const n = parseInt(args[1]);
      if (!n) return message.reply('Provide a number.');
      data[guildId].maxJoins = n;
      saveData(data);
      return message.reply(`Max joins set to ${n}.`);
    }

    if (sub === 'window') {
      const n = parseInt(args[1]);
      if (!n) return message.reply('Provide seconds.');
      data[guildId].timeWindow = n;
      saveData(data);
      return message.reply(`Time window set to ${n} seconds.`);
    }

    if (sub === 'age') {
      const n = parseInt(args[1]);
      if (n === undefined) return message.reply('Provide days (0 to disable).');
      data[guildId].minAccountAge = n;
      saveData(data);
      return message.reply(`Minimum account age set to ${n} days.`);
    }

    if (sub === 'action') {
      const a = args[1]?.toLowerCase();
      if (!['kick', 'ban'].includes(a)) return message.reply('Action must be kick or ban.');
      data[guildId].action = a;
      saveData(data);
      return message.reply(`Action set to ${a}.`);
    }

    if (sub === 'status') {
      const c = data[guildId];
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0x2B2D31)
          .setTitle(`${emoji('shield')} Antiraid Status`)
          .addFields(
            { name: 'Enabled', value: c.enabled ? 'Yes' : 'No', inline: true },
            { name: 'Max Joins', value: String(c.maxJoins), inline: true },
            { name: 'Window', value: `${c.timeWindow}s`, inline: true },
            { name: 'Min Age', value: `${c.minAccountAge} days`, inline: true },
            { name: 'Action', value: c.action, inline: true }
          )]
      });
    }

    return message.reply('Unknown option. Use `!antiraid help`.');
  }
};
