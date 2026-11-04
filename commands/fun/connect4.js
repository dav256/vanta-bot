const { EmbedBuilder } = require('discord.js');

const games = new Map();

function board(state) {
  const rows = [];
  for (let r = 0; r < 6; r++) {
    let line = '';
    for (let c = 0; c < 7; c++) {
      const cell = state[r * 7 + c];
      line += cell === 1 ? '🔴' : cell === 2 ? '🟡' : '⚪';
    }
    rows.push(line);
  }
  return rows.join('\n') + '\n1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣';
}

function drop(state, col, player) {
  for (let r = 5; r >= 0; r--) {
    const i = r * 7 + col;
    if (state[i] === 0) {
      state[i] = player;
      return r;
    }
  }
  return -1;
}

function win(state, player) {
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 7; c++) {
      for (const [dr, dc] of dirs) {
        let ok = true;
        for (let k = 0; k < 4; k++) {
          const nr = r + dr * k, nc = c + dc * k;
          if (nr < 0 || nr >= 6 || nc < 0 || nc >= 7 || state[nr * 7 + nc] !== player) {
            ok = false;
            break;
          }
        }
        if (ok) return true;
      }
    }
  }
  return false;
}

module.exports = {
  name: 'connect4',
  description: 'Play Connect 4',
  aliases: ['c4'],
  async execute(message, args) {
    const opponent = message.mentions.users.first();
    if (!opponent || opponent.bot || opponent.id === message.author.id) {
      return message.reply('Mention a user to play against.');
    }

    const state = Array(42).fill(0);
    const game = {
      players: [message.author.id, opponent.id],
      state,
      turn: 0,
      message: null
    };

    const embed = new EmbedBuilder()
      .setColor(0xFFFFFF)
      .setTitle('Connect 4')
      .setDescription(`${board(state)}\n\n${message.author}'s turn (🔴)`)
      .setFooter({ text: 'Type a number 1-7 to drop' });

    const sent = await message.channel.send({ embeds: [embed] });
    game.message = sent;
    games.set(message.channel.id, game);

    const collector = message.channel.createMessageCollector({
      filter: m => game.players.includes(m.author.id) && /^[1-7]$/.test(m.content.trim()),
      time: 5 * 60 * 1000
    });

    collector.on('collect', async (m) => {
      const current = game.players[game.turn];
      if (m.author.id !== current) return;

      const col = parseInt(m.content.trim()) - 1;
      const row = drop(game.state, col, game.turn + 1);
      if (row === -1) {
        m.reply('Column full.').catch(() => {});
        return;
      }

      if (win(game.state, game.turn + 1)) {
        const embed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setTitle('Connect 4')
          .setDescription(`${board(game.state)}\n\n${m.author} wins!`);
        await sent.edit({ embeds: [embed] }).catch(() => {});
        games.delete(message.channel.id);
        collector.stop();
        return;
      }

      if (game.state.every(c => c !== 0)) {
        const embed = new EmbedBuilder()
          .setColor(0xFFFF00)
          .setTitle('Connect 4')
          .setDescription(`${board(game.state)}\n\nDraw!`);
        await sent.edit({ embeds: [embed] }).catch(() => {});
        games.delete(message.channel.id);
        collector.stop();
        return;
      }

      game.turn = 1 - game.turn;
      const next = game.players[game.turn];
      const embed = new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setTitle('Connect 4')
        .setDescription(`${board(game.state)}\n\n<@${next}>'s turn (${game.turn === 0 ? '🔴' : '🟡'})`);
      await sent.edit({ embeds: [embed] }).catch(() => {});
    });

    collector.on('end', () => games.delete(message.channel.id));
  }
};
