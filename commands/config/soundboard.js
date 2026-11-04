const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', '..', 'data', 'soundboard.json');

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
  return data[guildId] || [];
}

function set(guildId, list) {
  const data = load();
  data[guildId] = list;
  save(data);
}

module.exports = {
  name: 'soundboard',
  description: 'Manage server soundboard',
  aliases: ['sb'],
  permissions: [PermissionFlagsBits.ManageGuild],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (!sub || sub === 'help') {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('Soundboard')
          .setDescription('Add and play custom sounds.')
          .addFields(
            { name: 'Add', value: '`soundboard add <name> <url>`', inline: false },
            { name: 'List', value: '`soundboard list`', inline: false },
            { name: 'Play', value: '`soundboard play <name>`', inline: false },
            { name: 'Remove', value: '`soundboard remove <name>`', inline: false }
          )]
      });
    }

    if (sub === 'add') {
      const name = args[1];
      const url = args[2];
      if (!name || !url) return message.reply('Usage: `soundboard add <name> <url>`');
      const list = get(message.guild.id);
      const existing = list.findIndex(s => s.name.toLowerCase() === name.toLowerCase());
      const entry = { name, url };
      if (existing !== -1) list[existing] = entry;
      else list.push(entry);
      set(message.guild.id, list);
      return message.reply(`Sound **${name}** added.`);
    }

    if (sub === 'list') {
      const list = get(message.guild.id);
      if (!list.length) return message.reply('No sounds.');
      const desc = list.map(s => `**${s.name}**`).join('\n');
      return message.reply({
        embeds: [new EmbedBuilder().setColor(0xFFFFFF).setTitle('Soundboard').setDescription(desc)]
      });
    }

    if (sub === 'play') {
      const name = args[1];
      if (!name) return message.reply('Provide a sound name.');
      const list = get(message.guild.id);
      const sound = list.find(s => s.name.toLowerCase() === name.toLowerCase());
      if (!sound) return message.reply('Sound not found.');
      return message.reply({ content: sound.url, files: [sound.url] }).catch(() => message.reply(sound.url));
    }

    if (sub === 'remove') {
      const name = args[1]?.toLowerCase();
      if (!name) return message.reply('Provide a sound name.');
      const list = get(message.guild.id).filter(s => s.name.toLowerCase() !== name);
      set(message.guild.id, list);
      return message.reply(`Sound **${name}** removed.`);
    }

    return message.reply('Use `soundboard help`.');
  }
};
