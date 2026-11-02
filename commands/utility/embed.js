const { parseEmbed } = require('../../utils/embedParser');

module.exports = {
  name: 'embed',
  aliases: ['em'],
  description: 'Create a custom embed using script syntax',
  async execute(message, args) {
    if (!args.length) {
      return message.reply({
        content: '**Embed Script Example:**\n```\n{embed}\n{title: Hello {user.tag}}\n{description: Welcome to {guild.name}! You are member #{guild.count}.}\n{color: #FFFFFF}\n{thumbnail: {user.avatar}}\n{footer: Kingdom of Christ}\n```\nUse `!embed` followed by your script.'
      });
    }

    const script = args.join(' ');
    const context = {
      user: message.author,
      guild: message.guild
    };

    const embed = parseEmbed(script, context);
    if (!embed) return message.reply('Failed to parse embed script.');

    try {
      await message.channel.send({ embeds: [embed] });
      await message.delete().catch(() => {});
    } catch (err) {
      return message.reply('Failed to send embed. Check your script.');
    }
  }
};
