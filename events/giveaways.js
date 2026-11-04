const { EmbedBuilder } = require('discord.js');
const giveaways = require('../utils/giveaways');

module.exports = (client) => {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId !== 'giveaway_enter') return;

    const list = giveaways.get(interaction.guild.id);
    const g = list.find(x => x.messageId === interaction.message.id);
    if (!g) return interaction.reply({ content: 'Giveaway not found.', ephemeral: true });

    if (g.entrants.includes(interaction.user.id)) {
      return interaction.reply({ content: 'You already entered.', ephemeral: true });
    }

    g.entrants.push(interaction.user.id);
    const fs = require('fs');
    const path = require('path');
    const file = path.join(__dirname, '..', 'data', 'giveaways.json');
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const idx = data[interaction.guild.id].findIndex(x => x.messageId === g.messageId);
    if (idx !== -1) data[interaction.guild.id][idx] = g;
    fs.writeFileSync(file, JSON.stringify(data, null, 2));

    await interaction.reply({ content: 'You entered the giveaway!', ephemeral: true });
  });

  setInterval(async () => {
    const fs = require('fs');
    const path = require('path');
    const file = path.join(__dirname, '..', 'data', 'giveaways.json');
    if (!fs.existsSync(file)) return;
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));

    for (const guildId of Object.keys(data)) {
      for (const g of data[guildId]) {
        if (Date.now() >= g.endsAt && !g.ended) {
          g.ended = true;
          const channel = client.channels.cache.get(g.channelId);
          if (!channel) continue;

          const winners = g.entrants.sort(() => 0.5 - Math.random()).slice(0, g.winners);
          const winnerMentions = winners.map(id => `<@${id}>`).join(', ') || 'No one';

          await channel.send({
            embeds: [new EmbedBuilder()
              .setColor(0xFFFFFF)
              .setTitle('Giveaway Ended')
              .setDescription(`**Prize:** ${g.prize}\n**Winners:** ${winnerMentions}`)]
          });
        }
      }
    }
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  }, 15000);
};
