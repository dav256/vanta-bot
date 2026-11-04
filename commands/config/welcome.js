const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', '..', 'data', 'messages.json');

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

function getWelcomes(guildId) {
  const data = load();
  return data[guildId]?.welcome || [];
}

function setWelcomes(guildId, list) {
  const data = load();
  if (!data[guildId]) data[guildId] = {};
  data[guildId].welcome = list;
  save(data);
}

module.exports = {
  name: 'welcome',
  description: 'Manage welcome messages (Bleed-style)',
  aliases: ['setwelcome'],
  permissions: [PermissionFlagsBits.ManageGuild],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (!sub || sub === 'help') {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('Welcome Messages')
          .setDescription('Bleed-style system messages.')
          .addFields(
            { name: 'Add', value: '`welcome add #channel <script> [self_destruct:<seconds>]`', inline: false },
            { name: 'Remove', value: '`welcome remove #channel`', inline: false },
            { name: 'View', value: '`welcome view #channel`', inline: false },
            { name: 'List', value: '`welcome list`', inline: false },
            { name: 'Variables', value: '`{user.mention}` `{user}` `{guild.name}` `{guild.count}` `{guild.icon}` `{user.avatar}`', inline: false },
            { name: 'Embed Example', value: '```\n{embed}$v{title: Welcome!}$v{description: Hey {user.mention}, welcome to {guild.name}!}$v{color: #FFFFFF}$v{thumbnail: {user.avatar}}\n```', inline: false },
            { name: 'Self-destruct', value: 'Optional. Message deletes after 6–60 seconds.', inline: false }
          )]
      });
    }

    if (sub === 'add') {
      const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
      if (!channel) return message.reply('Mention a channel.');

      let scriptParts = args.slice(2);
      let selfDestruct = null;

      const last = scriptParts[scriptParts.length - 1];
      const sdMatch = last?.match(/^self_destruct:(\d+)$/i);
      if (sdMatch) {
        const secs = parseInt(sdMatch[1]);
        if (secs < 6 || secs > 60) return message.reply('self_destruct must be between 6 and 60 seconds.');
        selfDestruct = secs;
        scriptParts = scriptParts.slice(0, -1);
      }

      const script = scriptParts.join(' ');
      if (!script) return message.reply('Provide a script.');

      const list = getWelcomes(message.guild.id);
      const existing = list.findIndex(w => w.channel === channel.id);
      const entry = { channel: channel.id, script, selfDestruct };

      if (existing !== -1) list[existing] = entry;
      else list.push(entry);

      setWelcomes(message.guild.id, list);
      return message.reply(`Welcome set for ${channel}${selfDestruct ? ` (self-destruct: ${selfDestruct}s)` : ''}.`);
    }

    if (sub === 'remove') {
      const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
      if (!channel) return message.reply('Mention a channel.');

      const list = getWelcomes(message.guild.id).filter(w => w.channel !== channel.id);
      setWelcomes(message.guild.id, list);
      return message.reply(`Welcome removed for ${channel}.`);
    }

    if (sub === 'view') {
      const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
      if (!channel) return message.reply('Mention a channel.');

      const entry = getWelcomes(message.guild.id).find(w => w.channel === channel.id);
      if (!entry) return message.reply('No welcome set for that channel.');

      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle(`Welcome — ${channel.name}`)
          .setDescription(`\`\`\`\n${entry.script}\n\`\`\``)
          .setFooter({ text: entry.selfDestruct ? `Self-destruct: ${entry.selfDestruct}s` : 'No self-destruct' })]
      });
    }

    if (sub === 'list') {
      const list = getWelcomes(message.guild.id);
      if (!list.length) return message.reply('No welcome messages set.');

      const desc = list.map(w => `<#${w.channel}>${w.selfDestruct ? ` — ${w.selfDestruct}s` : ''}`).join('\n');
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('Welcome Messages')
          .setDescription(desc)]
      });
    }

    return message.reply('Use `welcome help`.');
  }
};
