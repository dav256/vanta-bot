const fs = require('fs');
const path = require('path');

function loadCommands(client, commandsPath) {
  client.commands = new Map();

  // Resolve to absolute path so it works no matter the working directory
  const absolutePath = path.resolve(commandsPath);
  console.log(`[Commands] Loading from: ${absolutePath}`);

  function loadDir(dir) {
    let files;
    try {
      files = fs.readdirSync(dir, { withFileTypes: true });
    } catch (err) {
      console.error(`[Commands] Cannot read directory ${dir}:`, err.message);
      return;
    }

    for (const file of files) {
      const fullPath = path.join(dir, file.name);

      if (file.isDirectory()) {
        loadDir(fullPath);
        continue;
      }

      if (!file.name.endsWith('.js')) continue;

      try {
        // Clear require cache so restarts pick up changes
        delete require.cache[require.resolve(fullPath)];
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
        console.error(`[Commands] Failed to load ${file.name}:`);
        console.error(err.message || err);
        if (err.code === 'MODULE_NOT_FOUND') {
          console.error(`[Commands] Missing module for ${file.name}. Full path: ${fullPath}`);
        }
      }
    }
  }

  loadDir(absolutePath);
  console.log(`[Commands] Total loaded: ${client.commands.size}`);
}

module.exports = { loadCommands };
