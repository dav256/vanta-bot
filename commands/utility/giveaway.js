const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'giveaway',
  description: 'Start a giveaway',
  aliases: ['gstart'],
  permissions: [PermissionFlagsBits.ManageGuild],
  async execute(message, args) {
    const duration = args[0];
    const winners = parseInt(args[1]) || 1;
    const prize = args.slice(2).join(' ');

    if (!duration || !prize) {
      return message.reply('Usage: `!giveaway 1h 1 Prize name`');
    }

    let ms = 3600000;
    const match = duration.match(/^(\d+)(m|h|d)?$/i);
    if (match) {
      const num = parseInt(match[1]);
      const unit = (match[2] || 'h').toLowerCase();
      if (unit === 'm') ms = num * 60 * 1000;
      if (unit === 'h') ms = num * 60 * 60 * 1000;
      if (unit === 'd') ms = num * 24 * 60 * 60 * 1000;
    }

    const end = Date.now() + ms;

    const embed = new EmbedBuilder()
      .setColor(0xFFFFFF)
      .setTitle('🎉 Giveaway!')
      .setDescription(`**Prize:** ${prize}\n**Winners:** ${winners}\n**Ends:** <t:${Math.floor(end / 1000)}:R>\n\nReact with 🎉 to enter!`)
      .setFooter({ text: `Hosted by ${message.author.tag}` });

    const msg = await message.channel.send({ embeds: [embed] });
    await msg.react('🎉');

    setTimeout(async () => {
      const fetched = await msg.fetch();
      const reaction = fetched.reactions.cache.get('🎉');
      const users = await reaction.users.fetch();
      const entries = users.filter(u => !u.bot).map(u => u);

      if (!entries.length) {
        return message.channel.send('No one entered the giveaway.');
      }

      const winner = entries[Math.floor(Math.random() * entries.length)];
      message.channel.send(`🎉 Congratulations ${winner}! You won **${prize}**!`);
    }, ms);
  }
};
