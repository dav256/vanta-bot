const { EmbedBuilder } = require('discord.js');
const starboard = require('../utils/starboard');

module.exports = (client) => {
  client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    if (reaction.partial) {
      try { await reaction.fetch(); } catch { return; }
    }
    if (reaction.message.partial) {
      try { await reaction.message.fetch(); } catch { return; }
    }

    const message = reaction.message;
    if (!message.guild || message.author.bot) return;

    const config = starboard.get(message.guild.id);
    if (!config.channel) return;

    const emoji = config.emoji || '⭐';
    if (reaction.emoji.name !== emoji && reaction.emoji.toString() !== emoji) return;

    const count = reaction.count;
    const threshold = config.threshold || 3;

    if (count < threshold) return;

    const channel = message.guild.channels.cache.get(config.channel);
    if (!channel) return;

    const existing = config.messages?.[message.id];
    if (existing) {
      try {
        const starMsg = await channel.messages.fetch(existing).catch(() => null);
        if (starMsg) {
          const embed = starMsg.embeds[0];
          if (embed) {
            const newEmbed = EmbedBuilder.from(embed).setFooter({ text: `${count} ${emoji}` });
            await starMsg.edit({ embeds: [newEmbed] });
          }
        }
      } catch {}
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0xFFFFFF)
      .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
      .setDescription(message.content || '*No text content*')
      .addFields({ name: 'Source', value: `[Jump](${message.url})`, inline: true })
      .setFooter({ text: `${count} ${emoji}` })
      .setTimestamp(message.createdAt);

    if (message.attachments.size) {
      const img = message.attachments.find(a => a.contentType?.startsWith('image/'));
      if (img) embed.setImage(img.url);
    }

    try {
      const starMsg = await channel.send({ embeds: [embed] });
      if (!config.messages) config.messages = {};
      config.messages[message.id] = starMsg.id;
      starboard.set(message.guild.id, config);
    } catch (e) {
      console.error('Starboard send failed:', e);
    }
  });
};
