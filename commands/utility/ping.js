const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Check bot latency',
  async execute(message) {
    const sent = await message.reply('Pinging...');
    const latency = sent.createdTimestamp - message.createdTimestamp;
    const apiLatency = Math.round(message.client.ws.ping);

    return sent.edit({
      content: null,
      embeds: [new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setTitle('Pong!')
        .setDescription(`**Latency:** ${latency}ms\n**API:** ${apiLatency}ms`)]
    });
  }
};
