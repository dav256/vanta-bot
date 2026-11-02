const { emoji } = require('../../utils/emojis');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/antibot.json');

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
  name: 'antibot',
  description: 'Prevent unauthorized bots from joining',
  permissions: [PermissionFlagsBits.Administrator],
  async execute(message, args) {
    const data = getData();
    const guildId = message.guild.id;
    if (!data[guildId]) data[guildId] = { enabled: false, whitelist: [] };

    const sub = args[0]?.toLowerCase();

    if (!sub || sub === 'help') {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0x2B2D31)
          .setTitle(`${emoji('bot')} Antibot`)
          .setDescription(
            '`!antibot enable` — Kick bots that join (unless whitelisted)\n' +
            '`!antibot disable` — Turn off\n' +
            '`!antibot whitelist @bot` — Allow a bot\n' +
            '`!antibot status` — View settings'
          )]
      });
    }

    if (sub === 'enable') { data[guildId].enabled = true; saveData(data); return message.reply('Antibot enabled. Unauthorized bots will be kicked.'); }
    if (sub === 'disable') { data[guildId].enabled = false; saveData(data); return message.reply('Antibot disabled.'); }

    if (sub === 'whitelist') {
      const user = message.mentions.users.first();
      if (!user || !user.bot) return message.reply('Mention a bot to whitelist.');
      if (!data[guildId].whitelist.includes(user.id)) data[guildId].whitelist.push(user.id);
      saveData(data);
      return message.reply(`${user.tag} is now allowed to join.`);
    }

    if (sub === 'status') {
      const c = data[guildId];
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0x2B2D31)
          .setTitle(`${emoji('bot')} Antibot Status`)
          .addFields(
            { name: 'Enabled', value: c.enabled ? 'Yes' : 'No', inline: true },
            { name: 'Whitelisted Bots', value: c.whitelist.length ? c.whitelist.map(id => `<@${id}>`).join(', ') : 'None' }
          )]
      });
    }

    return message.reply('Unknown option. Use `!antibot help`.');
  }
};
