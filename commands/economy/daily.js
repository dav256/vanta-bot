const { EmbedBuilder } = require('discord.js');
const economy = require('../../utils/economy');

module.exports = {
  name: 'daily',
  description: 'Claim daily coins',
  async execute(message) {
    const result = economy.daily(message.guild.id, message.author.id);
    if (!result.success) {
      return message.reply(`You already claimed your daily. Try again in ${result.hoursLeft}h.`);
    }
    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setDescription(`You claimed **${result.amount}** coins! Balance: **${result.balance}**`)]
    });
  }
};
