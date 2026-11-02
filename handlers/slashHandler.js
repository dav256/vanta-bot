const { SlashCommandBuilder, REST, Routes, Collection } = require('discord.js');

module.exports = (client) => {
  client.on('ready', async () => {
    const commands = [];
    const seen = new Set();

    for (const [name, cmd] of client.commands) {
      if (seen.has(cmd.name)) continue;
      seen.add(cmd.name);

      const builder = new SlashCommandBuilder()
        .setName(cmd.name)
        .setDescription(cmd.description || 'No description');

      builder.addStringOption(opt =>
        opt.setName('input')
          .setDescription('Arguments for the command')
          .setRequired(false)
      );

      commands.push(builder.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
      console.log(`[Slash] Registering ${commands.length} slash commands...`);
      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands }
      );
      console.log('[Slash] Slash commands registered.');
    } catch (err) {
      console.error('[Slash] Failed to register commands:', err);
    }
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    const input = interaction.options.getString('input') || '';
    const args = input.trim().split(/ +/).filter(Boolean);

    const mentions = {
      members: new Collection(),
      users: new Collection(),
      roles: new Collection(),
      channels: new Collection()
    };

    for (const arg of args) {
      const id = arg.replace(/[<@!&#>]/g, '');
      if (!/^\d{17,20}$/.test(id)) continue;

      const member = interaction.guild?.members.cache.get(id);
      const user = client.users.cache.get(id) || member?.user;
      const role = interaction.guild?.roles.cache.get(id);
      const channel = interaction.guild?.channels.cache.get(id);

      if (member) mentions.members.set(id, member);
      if (user) mentions.users.set(id, user);
      if (role) mentions.roles.set(id, role);
      if (channel) mentions.channels.set(id, channel);
    }

    const fakeMessage = {
      author: interaction.user,
      member: interaction.member,
      guild: interaction.guild,
      channel: interaction.channel,
      client,
      content: `/${interaction.commandName} ${input}`.trim(),
      mentions,
      reply: async (content) => {
        if (interaction.replied || interaction.deferred) {
          return interaction.followUp(content);
        }
        return interaction.reply(content);
      },
    };

    const originalSend = interaction.channel.send.bind(interaction.channel);
    fakeMessage.channel = {
      ...interaction.channel,
      send: async (content) => {
        if (!interaction.replied && !interaction.deferred) {
          return interaction.reply(content);
        }
        return originalSend(content);
      },
      id: interaction.channel.id,
      name: interaction.channel.name,
      type: interaction.channel.type,
      parent: interaction.channel.parent,
      messages: interaction.channel.messages,
      delete: interaction.channel.delete?.bind(interaction.channel)
    };

    if (command.permissions && interaction.member) {
      const missing = interaction.member.permissions.missing(command.permissions);
      if (missing.length) {
        return interaction.reply({
          content: `You need the following permission(s): \`${missing.join(', ')}\``,
          ephemeral: true
        });
      }
    }

    try {
      await command.execute(fakeMessage, args, client);
    } catch (error) {
      console.error(`[Slash Error] ${command.name}:`, error);
      const reply = { content: 'An error occurred while running this command.', ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply).catch(() => {});
      } else {
        await interaction.reply(reply).catch(() => {});
      }
    }
  });
};
