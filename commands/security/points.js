const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', '..', 'data', 'points.json');

function load() {
  try {
    if (!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch { return {}; }
}

function save(data) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function get(guildId) {
  const data = load();
  return data[guildId] || { ladder: [], users: {} };
}

function set(guildId, config) {
  const data = load();
  data[guildId] = config;
  save(data);
}

module.exports = {
  name: 'points',
  description: 'Punishment points ladder',
  aliases: ['filterpoints'],
  permissions: [PermissionFlagsBits.ManageGuild],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (!sub || sub === 'help') {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('Points Ladder')
          .setDescription('Set punishments based on points.')
          .addFields(
            { name: 'Add', value: '`points add 5 warn` · `points add 10 mute` · `points add 20 ban`', inline: false },
            { name: 'List', value: '`points list`', inline: false },
            { name: 'User', value: '`points user @user`', inline: false },
            { name: 'Add points', value: '`points give @user 3`', inline: false }
          )]
      });
    }

    const config = get(message.guild.id);

    if (sub === 'add') {
      const amount = parseInt(args[1]);
      const action = args[2]?.toLowerCase();
      if (!amount || !action) return message.reply('Usage: `points add <amount> <warn|mute|kick|ban>`');
      config.ladder.push({ points: amount, action });
      config.ladder.sort((a, b) => a.points - b.points);
      set(message.guild.id, config);
      return message.reply(`Added: ${amount} points → ${action}`);
    }

    if (sub === 'list') {
      if (!config.ladder.length) return message.reply('No ladder set.');
      const desc = config.ladder.map(l => `${l.points} points → ${l.action}`).join('\n');
      return message.reply({
        embeds: [new EmbedBuilder().setColor(0xFFFFFF).setTitle('Points Ladder').setDescription(desc)]
      });
    }

    if (sub === 'user') {
      const user = message.mentions.users.first();
      if (!user) return message.reply('Mention a user.');
      const pts = config.users[user.id] || 0;
      return message.reply(`${user} has **${pts}** points.`);
    }

    if (sub === 'give') {
      const user = message.mentions.users.first();
      const amount = parseInt(args[2]);
      if (!user || !amount) return message.reply('Usage: `points give @user <amount>`');
      config.users[user.id] = (config.users[user.id] || 0) + amount;
      set(message.guild.id, config);
      return message.reply(`Gave ${user} ${amount} points. Total: ${config.users[user.id]}`);
    }

    return message.reply('Use `points help`.');
  }
};
