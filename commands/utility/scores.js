const { EmbedBuilder } = require('discord.js');

const leagues = {
  nba: 'https://www.espn.com/nba/scoreboard',
  nfl: 'https://www.espn.com/nfl/scoreboard',
  mlb: 'https://www.espn.com/mlb/scoreboard',
  nhl: 'https://www.espn.com/nhl/scoreboard',
  soccer: 'https://www.espn.com/soccer/scoreboard',
  tennis: 'https://www.espn.com/tennis/scoreboard',
  golf: 'https://www.espn.com/golf/leaderboard',
  ufc: 'https://www.espn.com/mma/scoreboard',
  f1: 'https://www.espn.com/f1/schedule',
  nascar: 'https://www.espn.com/racing/scoreboard'
};

module.exports = {
  name: 'scores',
  description: 'Look up sports scores',
  aliases: ['score', 'sports'],
  async execute(message, args) {
    const league = args[0]?.toLowerCase();
    if (!league) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('Sports Scores')
          .setDescription('Look up scores.')
          .addFields(
            { name: 'Leagues', value: Object.keys(leagues).join(', '), inline: false },
            { name: 'Usage', value: '`scores nba`', inline: false }
          )]
      });
    }

    const url = leagues[league];
    if (!url) return message.reply(`Unknown league. Try: ${Object.keys(leagues).join(', ')}`);

    const embed = new EmbedBuilder()
      .setColor(0xFFFFFF)
      .setTitle(`${league.toUpperCase()} Scores`)
      .setDescription(`[View scoreboard](${url})`)
      .setFooter({ text: 'ESPN' });

    return message.reply({ embeds: [embed] });
  }
};
