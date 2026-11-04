const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', '..', 'data', 'counting.json');

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
  return data[guildId] || { channel: null, count: 0, high: 0, lastUser: null };
}

function set(guildId, config) {
  const data = load();
  data[guildId] = config;
  save(data);
}

module.exports = {
  name: 'counting',
  description: 'Counting game',
  aliases: ['count'],
  permissions: [PermissionFlagsBits.ManageChannels],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (!sub || sub === 'help') {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('Counting')
          .setDescription('Count up in a channel. Wrong number resets.')
          .addFields(
            { name: 'Set channel', value: '`counting set #channel`', inline: false },
            { name: 'Stats', value: '`counting stats`', inline: false },
            { name: 'Reset', value: '`counting reset`', inline: false }
          )]
      });
    }

    if (sub === 'set') {
      const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
      if (!channel) return message.reply('Mention a channel.');
      const config = get(message.guild.id);
      config.channel = channel.id;
      set(message.guild.id, config);
      return message.reply(`Counting set in ${channel}. Start at 1.`);
    }

    if (sub === 'stats') {
      const config = get(message.guild.id);
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('Counting Stats')
          .addFields(
            { name: 'Current', value: String(config.count), inline: true },
            { name: 'High Score', value: String(config.high), inline: true },
            { name: 'Channel', value: config.channel ? `<#${config.channel}>` : 'Not set', inline: true }
          )]
      });
    }

    if (sub === 'reset') {
      const config = get(message.guild.id);
      config.count = 0;
      config.lastUser = null;
      set(message.guild.id, config);
      return message.reply('Count reset to 0.');
    }

    return message.reply('Use `counting help`.');
  }
};
