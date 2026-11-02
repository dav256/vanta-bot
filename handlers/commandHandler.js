const fs = require('fs');
const path = require('path');

function loadCommands(client, commandsPath) {
  client.commands = new Map();

  function loadDir(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dir, file.name);

      if (file.isDirectory()) {
        loadDir(fullPath);
        continue;
      }

      if (!file.name.endsWith('.js')) continue;

      try {
        const command = require(fullPath);
        if (!command.name || !command.execute) {
          console.warn(`[Commands] Skipping ${file.name} — missing name or execute`);
          continue;
        }

        client.commands.set(command.name, command);
        if (command.aliases) {
          for (const alias of command.aliases) {
            client.commands.set(alias, command);
          }
        }
        console.log(`[Commands] Loaded: ${command.name}`);
      } catch (err) {
        console.error(`[Commands] Failed to load ${file.name}:`, err);
      }
    }
  }

  loadDir(commandsPath);
  console.log(`[Commands] Total loaded: ${client.commands.size}`);
}

module.exports = { loadCommands };
