const { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'giveaway',
  description: 'Start a giveaway',
  aliases: ['gstart'],
  permissions: [PermissionFlagsBits.ManageGuild],
  async execute(message, args) {
    if (args.length < 3) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0x2B2D31)
          .setTitle('How to use !giveaway')
          .setDescription(
            '**Step 1:** Duration (how long it runs)\n' +
            '**Step 2:** Number of winners\n' +
            '**Step 3:** Prize name\n\n' +
            '**Format:** `!giveaway <duration> <winners> <prize>`\n\n' +
            '**Examples:**\n' +
            '`!giveaway 1h 1 Robux`\n' +
            '`!giveaway 30m 2 Nitro`\n' +
            '`!giveaway 1d 1 Special Role`\n\n' +
            '**Duration options:** `m` (minutes), `h` (hours), `d` (days)'
          )]
      });
    }

    const duration = args[0];
    const winners = parseInt(args[1]) || 1;
    const prize = args.slice(2).join(' ');

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
    const endTimestamp = Math.floor(end / 1000);

    const embed = new EmbedBuilder()
      .setColor(0x2B2D31)
      .setTitle(prize)
      .setDescription(`**Ends:** <t:${endTimestamp}:R>\n\nReact with 🎉 to enter!`)
      .setFooter({ text: `Hosted by ${message.author.tag}` });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('giveaway_enter')
        .setLabel('0')
        .setEmoji('🎉')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('giveaway_participants')
        .setLabel('Participants')
        .setEmoji('👤')
        .setStyle(ButtonStyle.Secondary)
    );

    const msg = await message.channel.send({ embeds: [embed], components: [row] });
    await msg.react('🎉');

    setTimeout(async () => {
      const fetched = await msg.fetch();
      const reaction = fetched.reactions.cache.get('🎉');
      const users = await reaction.users.fetch();
      const entries = users.filter(u => !u.bot).map(u => u);

      const winner = entries.length ? entries[Math.floor(Math.random() * entries.length)] : null;
      const endedEmbed = new EmbedBuilder()
        .setColor(0x2B2D31)
        .setTitle(prize)
        .setDescription(
          winner
            ? `**Winner:** ${winner}\n**Hosted by:** ${message.author}\n\nEnded at | <t:${endTimestamp}:f>`
            : `**No winner**\n**Hosted by:** ${message.author}\n\nEnded at | <t:${endTimestamp}:f>`
        );

      const endedRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('giveaway_enter')
          .setLabel(entries.length.toString())
          .setEmoji('🎉')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('giveaway_participants')
          .setLabel('Participants')
          .setEmoji('👤')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );

      await fetched.edit({ embeds: [endedEmbed], components: [endedRow] });

      if (winner) {
        message.channel.send(`🎉 Congratulations ${winner}! You won **${prize}**!`);
      } else {
        message.channel.send('No one entered the giveaway.');
      }
    }, ms);
  }
};
