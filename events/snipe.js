const snipes = new Map();

module.exports = (client) => {
  client.on('messageDelete', (message) => {
    if (!message.guild || message.author?.bot) return;
    snipes.set(message.channel.id, {
      content: message.content,
      author: message.author,
      timestamp: Date.now()
    });
  });
};

module.exports.get = (channelId) => snipes.get(channelId);
