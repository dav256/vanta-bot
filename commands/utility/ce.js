const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const scripting = require('../../utils/scripting');

module.exports = {
  name: 'ce',
  description: 'Create embeds or components messages',
  aliases: ['createembed', 'embed'],
  permissions: [PermissionFlagsBits.ManageMessages],
  async execute(message, args) {
    const script = args.join(' ');
    if (!script) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('Create Embed')
          .setDescription('Create embeds with `$v` separators.')
          .addFields(
            {
              name: 'Example',
              value: '`ce {embed}$v{title: Hello}$v{description: World}$v{color: #1a365d}`',
              inline: false
            },
            {
              name: 'Fields',
              value: '`{field: Name | Value}`',
              inline: false
            }
          )]
      });
    }

    try {
      const result = scripting.parse(script, {
        user: message.author,
        guild: message.guild,
        channel: message.channel
      });

      if (!result) {
        return message.reply('Could not parse that script.');
      }

      if (result.flags) {
        await message.channel.send({
          components: result.components,
          flags: result.flags
        });
      } else if (result.embeds?.length) {
        await message.channel.send({ embeds: result.embeds });
      } else if (result.embed) {
        await message.channel.send({ embeds: [result.embed] });
      } else if (result.content) {
        await message.channel.send({ content: result.content });
      } else {
        await message.channel.send({ content: script.slice(0, 2000) });
      }
    } catch (err) {
      console.error('[ce]', err);
      return message.reply(`Script error: ${err.message}\nTry checking your \`$v\` separators and braces.`);
    }
  }
};
