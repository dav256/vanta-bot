const { emoji } = require('../../utils/emojis');
const { EmbedBuilder } = require('discord.js');
const economy = require('../../utils/economy');

module.exports = {
  name: 'balance',
  description: 'Check your balance',
  aliases: ['bal'],
  async execute(message) {
    const bal = economy.getBalance(message.guild.id, message.author.id);
    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setDescription(`${emoji('coins')} ${message.author}, you have **${bal}** coins.`)]
    });
  }
};
