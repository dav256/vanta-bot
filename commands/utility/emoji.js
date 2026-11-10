const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'emoji',
  description: 'Copy or manage custom emojis',
  aliases: ['emote', 'steal'],
  permissions: [PermissionFlagsBits.ManageGuildExpressions],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (!sub || sub === 'copy' || sub === 'steal' || sub === 'add') {
      const me = message.guild.members.me;
      if (!me.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
        return message.reply('I need **Manage Expressions** (Manage Emojis and Stickers).');
      }

      let sources = [];

      if (sub === 'copy' || sub === 'steal' || sub === 'add') {
        sources = args.slice(1);
      } else {
        sources = args;
      }

      if (message.reference) {
        const replied = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
        if (replied) {
          sources.push(replied.content);
          if (replied.reactions?.cache?.size) {
            for (const reaction of replied.reactions.cache.values()) {
              if (reaction.emoji?.id) {
                sources.push(`<${reaction.emoji.animated ? 'a' : ''}:${reaction.emoji.name}:${reaction.emoji.id}>`);
              }
            }
          }
        }
      }

      const text = sources.join(' ');
      const matches = [...text.matchAll(/<(a?):(\w+):(\d+)>/g)];

      if (!matches.length) {
        return message.reply({
          embeds: [new EmbedBuilder()
            .setColor(0xFFFFFF)
            .setTitle('Copy Emoji')
            .setDescription('Copy a custom emoji into this server.')
            .addFields(
              { name: 'Usage', value: '`emoji copy <:emoji:>`\n`steal <:emoji:>`\nOr **reply** to a message that has the emoji', inline: false }
            )]
        });
      }

      const created = [];
      const failed = [];

      for (const match of matches.slice(0, 10)) {
        const animated = match[1] === 'a';
        const name = match[2].replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 32) || 'emoji';
        const id = match[3];
        const url = `https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}?size=128&quality=lossless`;

        try {
          let finalName = name;
          let i = 1;
          while (message.guild.emojis.cache.some(e => e.name === finalName)) {
            finalName = `${name}_${i++}`.slice(0, 32);
          }

          const emoji = await message.guild.emojis.create({ attachment: url, name: finalName });
          created.push(`${emoji}`);
        } catch (err) {
          failed.push(`${name}: ${err.message}`);
        }
      }

      const embed = new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setTitle('Emoji Copy');

      if (created.length) {
        embed.addFields({ name: 'Added', value: created.join(' ') });
      }
      if (failed.length) {
        embed.addFields({ name: 'Failed', value: failed.join('\n').slice(0, 1000) });
      }
      if (!created.length && !failed.length) {
        embed.setDescription('Nothing was copied.');
      }

      return message.reply({ embeds: [embed] });
    }

    if (sub === 'list') {
      const emojis = message.guild.emojis.cache;
      if (!emojis.size) return message.reply('No custom emojis in this server.');
      const list = emojis.map(e => `${e} \`:${e.name}:\``).slice(0, 30).join('\n');
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle(`Emojis (${emojis.size})`)
          .setDescription(list)]
      });
    }

    return message.reply('Usage: `emoji copy <:emoji:>` \u00b7 `emoji list` \u00b7 or reply + `emoji copy`');
  }
};
