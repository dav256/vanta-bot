const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const EMOJI_REGEX = /<(a?):([a-zA-Z0-9_]+):(\d+)>/g;
const MAX_BULK = 25;

function uniqueMatches(text) {
  const seen = new Set();
  const out = [];
  for (const match of text.matchAll(EMOJI_REGEX)) {
    const id = match[3];
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({
      animated: match[1] === 'a',
      name: match[2],
      id
    });
  }
  return out;
}

async function createEmoji(guild, { animated, name, id }) {
  const url = `https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}?size=128&quality=lossless`;
  let finalName = (name || 'emoji').replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 32) || 'emoji';
  let i = 1;
  while (guild.emojis.cache.some(e => e.name === finalName)) {
    finalName = `${name}_${i++}`.slice(0, 32);
  }
  return guild.emojis.create({ attachment: url, name: finalName });
}

module.exports = {
  name: 'emoji',
  description: 'Copy custom emojis into this server (supports bulk)',
  aliases: ['emote', 'steal', 'copyemoji', 'copyemojis', 'stealemoji'],
  permissions: [PermissionFlagsBits.ManageGuildExpressions],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (sub === 'list') {
      const emojis = message.guild.emojis.cache;
      if (!emojis.size) return message.reply('No custom emojis in this server.');
      const list = emojis.map(e => `${e} \`:${e.name}:\``).slice(0, 40).join('\n');
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle(`Emojis (${emojis.size})`)
          .setDescription(list)]
      });
    }

    if (sub === 'help') {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('Copy Emoji')
          .setDescription('Copy one or many custom emojis into this server.')
          .addFields(
            { name: 'Single / bulk paste', value: '`emoji copy <:a:> <:b:> <:c:>`\n`steal <:emoji:>`', inline: false },
            { name: 'From a message', value: 'Reply to a message that has emojis \u2192 `emoji copy`', inline: false },
            { name: 'List', value: '`emoji list`', inline: false }
          )]
      });
    }

    const me = message.guild.members.me;
    if (!me.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
      return message.reply('I need **Manage Expressions** (Manage Emojis & Stickers).');
    }

    const parts = [];
    const start = ['copy', 'steal', 'add'].includes(sub) ? 1 : 0;
    if (args.slice(start).length) parts.push(args.slice(start).join(' '));

    if (message.reference) {
      const replied = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
      if (replied) {
        if (replied.content) parts.push(replied.content);
        for (const reaction of replied.reactions?.cache?.values() || []) {
          if (reaction.emoji?.id) {
            parts.push(`<${reaction.emoji.animated ? 'a' : ''}:${reaction.emoji.name}:${reaction.emoji.id}>`);
          }
        }
      }
    }

    const found = uniqueMatches(parts.join(' '));
    if (!found.length) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('Copy Emoji')
          .setDescription('No custom emojis found.\n\n**Usage**\n`emoji copy <:emoji:>`\n`emoji copy <:a:> <:b:> <:c:>` (bulk)\nReply to a message \u2192 `emoji copy`')]
      });
    }

    const batch = found.slice(0, MAX_BULK);
    const status = await message.reply(`Copying **${batch.length}** emoji(s)\u2026`);

    const created = [];
    const failed = [];

    for (const item of batch) {
      try {
        const emoji = await createEmoji(message.guild, item);
        created.push(`${emoji}`);
      } catch (err) {
        failed.push(`:${item.name}: \u2014 ${err.message}`);
      }
    }

    const embed = new EmbedBuilder()
      .setColor(0xFFFFFF)
      .setTitle('Emoji Copy')
      .setFooter({
        text: found.length > MAX_BULK
          ? `Only first ${MAX_BULK} processed (${found.length} found)`
          : `${created.length} added`
      });

    if (created.length) {
      embed.addFields({ name: `Added (${created.length})`, value: created.join(' ').slice(0, 1024) });
    }
    if (failed.length) {
      embed.addFields({ name: `Failed (${failed.length})`, value: failed.join('\n').slice(0, 1000) });
    }

    return status.edit({ content: null, embeds: [embed] });
  }
};
