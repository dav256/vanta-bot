const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const MAX_BULK = 15;

async function createSticker(guild, sticker) {
  const url = sticker.url;
  if (!url) throw new Error('No download URL');

  let name = (sticker.name || 'sticker').replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 30) || 'sticker';
  let finalName = name;
  let i = 1;
  while (guild.stickers.cache.some(s => s.name === finalName)) {
    finalName = `${name}_${i++}`.slice(0, 30);
  }

  return guild.stickers.create({
    file: url,
    name: finalName,
    tags: sticker.tags || '\ud83d\ude00',
    description: sticker.description || ''
  });
}

module.exports = {
  name: 'sticker',
  description: 'Copy stickers into this server (supports bulk)',
  aliases: ['stickers', 'stealsticker', 'copysticker', 'copystickers'],
  permissions: [PermissionFlagsBits.ManageGuildExpressions],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (sub === 'list') {
      const stickers = message.guild.stickers.cache;
      if (!stickers.size) return message.reply('No stickers in this server.');
      const list = stickers.map(s => `\`${s.name}\``).slice(0, 40).join(', ');
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle(`Stickers (${stickers.size})`)
          .setDescription(list)]
      });
    }

    if (sub === 'help') {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('Copy Sticker')
          .setDescription('Copy one or many stickers into this server.')
          .addFields(
            { name: 'From a message', value: 'Reply to a message with stickers \u2192 `sticker copy`', inline: false },
            { name: 'List', value: '`sticker list`', inline: false }
          )]
      });
    }

    const me = message.guild.members.me;
    if (!me.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
      return message.reply('I need **Manage Expressions** (Manage Emojis & Stickers).');
    }

    const stickerList = [];

    if (message.reference) {
      const replied = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
      if (replied?.stickers?.size) {
        for (const s of replied.stickers.values()) stickerList.push(s);
      }
    }

    const idArg = args.find(a => /^\d{17,20}$/.test(a)) || args[1]?.replace(/\D/g, '');
    if (idArg && idArg.length >= 17) {
      const msg = await message.channel.messages.fetch(idArg).catch(() => null);
      if (msg?.stickers?.size) {
        for (const s of msg.stickers.values()) stickerList.push(s);
      }
    }

    const seen = new Set();
    const unique = [];
    for (const s of stickerList) {
      if (seen.has(s.id)) continue;
      seen.add(s.id);
      unique.push(s);
    }

    if (!unique.length) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('Copy Sticker')
          .setDescription('No stickers found.\n\n**Usage**\n1. Reply to a message that has sticker(s)\n2. Run `sticker copy`\n\nWorks with **multiple stickers** on the same message.')]
      });
    }

    const batch = unique.slice(0, MAX_BULK);
    const status = await message.reply(`Copying **${batch.length}** sticker(s)\u2026`);

    const created = [];
    const failed = [];

    for (const sticker of batch) {
      try {
        const made = await createSticker(message.guild, sticker);
        created.push(made.name);
      } catch (err) {
        failed.push(`${sticker.name}: ${err.message}`);
      }
    }

    const embed = new EmbedBuilder()
      .setColor(0xFFFFFF)
      .setTitle('Sticker Copy')
      .setFooter({ text: `${created.length} added` });

    if (created.length) {
      embed.addFields({ name: `Added (${created.length})`, value: created.map(n => `\`${n}\``).join(', ').slice(0, 1024) });
    }
    if (failed.length) {
      embed.addFields({ name: `Failed (${failed.length})`, value: failed.join('\n').slice(0, 1000) });
    }

    return status.edit({ content: null, embeds: [embed] });
  }
};
