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
          .setDescription('Create embeds or components messages.')
          .addFields(
            { name: 'Usage', value: '`ce {embed}$v{title: Hello}$v{description: World}`', inline: false },
            { name: 'Components', value: 'Supports `{container}`, `{button}`, `$v` separators', inline: false }
          )]
      });
    }

    try {
      const result = scripting.parse(script, {
        user: message.author,
        guild: message.guild,
        channel: message.channel
      });

      if (result.flags) {
        await message.channel.send({
          components: result.components,
          flags: result.flags
        });
      } else if (result.embed) {
        await message.channel.send({ embeds: [result.embed] });
      } else {
        await message.channel.send(result.content || script);
      }
    } catch (err) {
      return message.reply(`Script error: ${err.message}\nTry checking your $v separators and braces.`);
    }
  }
};
