const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'sticker',
  description: 'Copy stickers into this server',
  aliases: ['stickers', 'stealsticker'],
  permissions: [PermissionFlagsBits.ManageGuildExpressions],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    const me = message.guild.members.me;
    if (!me.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
      return message.reply('I need **Manage Expressions** (Manage Emojis and Stickers).');
    }

    if (message.reference || sub === 'copy' || sub === 'steal' || sub === 'add' || !sub) {
      let target = null;

      if (message.reference) {
        target = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
      }

      if (!target && args[1]) {
        const id = args[1].replace(/\D/g, '').slice(-19);
        if (id.length >= 17) {
          target = await message.channel.messages.fetch(id).catch(() => null);
        }
      }

      if (!target) {
        return message.reply({
          embeds: [new EmbedBuilder()
            .setColor(0xFFFFFF)
            .setTitle('Copy Sticker')
            .setDescription('Reply to a message that has a sticker, then run:\n`sticker copy`')
            .addFields(
              { name: 'Usage', value: '1. Reply to the sticker message\n2. Type `sticker copy`', inline: false }
            )]
        });
      }

      const stickers = target.stickers;
      if (!stickers?.size) {
        return message.reply('That message has no stickers.');
      }

      const created = [];
      const failed = [];

      for (const sticker of stickers.values()) {
        try {
          const url = sticker.url;
          if (!url) {
            failed.push(`${sticker.name}: no URL`);
            continue;
          }

          let name = (sticker.name || 'sticker').replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 30);
          let finalName = name;
          let i = 1;
          while (message.guild.stickers.cache.some(s => s.name === finalName)) {
            finalName = `${name}_${i++}`.slice(0, 30);
          }

          const newSticker = await message.guild.stickers.create({
            file: url,
            name: finalName,
            tags: sticker.tags || '\ud83d\ude00',
            description: sticker.description || ''
          });
          created.push(newSticker.name);
        } catch (err) {
          failed.push(`${sticker.name}: ${err.message}`);
        }
      }

      const embed = new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setTitle('Sticker Copy');

      if (created.length) {
        embed.addFields({ name: 'Added', value: created.map(n => `\`${n}\``).join(', ') });
      }
      if (failed.length) {
        embed.addFields({ name: 'Failed', value: failed.join('\n').slice(0, 1000) });
      }

      return message.reply({ embeds: [embed] });
    }

    if (sub === 'list') {
      const stickers = message.guild.stickers.cache;
      if (!stickers.size) return message.reply('No stickers in this server.');
      const list = stickers.map(s => `\`${s.name}\``).slice(0, 30).join(', ');
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle(`Stickers (${stickers.size})`)
          .setDescription(list)]
      });
    }

    return message.reply('Usage: reply to a sticker \u2192 `sticker copy` \u00b7 `sticker list`');
  }
};
