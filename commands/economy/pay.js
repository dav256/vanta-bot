const { EmbedBuilder } = require('discord.js');
const economy = require('../../utils/economy');

module.exports = {
  name: 'pay',
  description: 'Pay another user',
  async execute(message, args) {
    const target = message.mentions.users.first();
    const amount = parseInt(args[1]);
    if (!target || !amount || amount <= 0) return message.reply('Usage: `pay @user <amount>`');
    if (target.id === message.author.id) return message.reply('You cannot pay yourself.');

    const result = economy.transfer(message.guild.id, message.author.id, target.id, amount);
    if (!result.success) return message.reply('Not enough coins.');

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setDescription(`Sent **${amount}** coins to ${target}.`)]
    });
  }
};
