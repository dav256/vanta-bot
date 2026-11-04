const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const sticky = require('../../utils/sticky');

module.exports = {
  name: 'sticky',
  description: 'Set a sticky message',
  permissions: [PermissionFlagsBits.ManageMessages],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (sub === 'off' || sub === 'remove') {
      sticky.remove(message.guild.id, message.channel.id);
      return message.reply('Sticky removed.');
    }

    const text = args.join(' ');
    if (!text) return message.reply('Provide the sticky message text.');

    const sent = await message.channel.send({
      embeds: [new EmbedBuilder().setColor(0xFFFFFF).setDescription(text)]
    });

    sticky.set(message.guild.id, message.channel.id, text, sent.id);
    return message.reply('Sticky set.');
  }
};
