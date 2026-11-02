const { parseEmbed } = require('../../utils/embedParser');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'embed',
  aliases: ['em'],
  description: 'Create a custom embed using script syntax',
  async execute(message, args) {
    if (!args.length) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0x2B2D31)
          .setTitle('How to use !embed')
          .setDescription(
            '**Step 1:** Type `!embed` followed by your script.\n\n' +
            '**Step 2:** Use these tags:\n' +
            '`{title: Your Title}`\n' +
            '`{description: Your text here}`\n' +
            '`{color: #FFFFFF}`\n' +
            '`{thumbnail: {user.avatar}}`\n' +
            '`{footer: Footer text}`\n\n' +
            '**Variables you can use:**\n' +
            '`{user.tag}` `{user.mention}` `{user.avatar}`\n' +
            '`{guild.name}` `{guild.count}` `{guild.icon}`\n\n' +
            '**Example:**\n' +
            '```\n!embed {title: Welcome {user.tag}} {description: You are member #{guild.count} in {guild.name}} {color: #FFFFFF} {thumbnail: {user.avatar}}\n```'
          )]
      });
    }

    const script = args.join(' ');
    const context = {
      user: message.author,
      guild: message.guild
    };

    const embed = parseEmbed(script, context);
    if (!embed) {
      return message.reply('Failed to parse your script. Make sure you use `{title: text}` style tags.');
    }

    try {
      await message.channel.send({ embeds: [embed] });
      await message.delete().catch(() => {});
    } catch (err) {
      return message.reply('Failed to send embed. Check your script for errors.');
    }
  }
};
