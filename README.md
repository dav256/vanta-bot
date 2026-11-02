# Vanta Bot

Discord.js v14 multipurpose bot (moderation, security, economy, voice, tickets, etc.)

## Setup

1. `npm install`
2. Create `.env` with:
   ```
   TOKEN=your_bot_token
   PREFIX=!
   ```
3. `node index.js`

## Structure

```
commands/     — All commands (auto-loaded)
events/       — Event handlers
handlers/     — Command + message handlers
utils/        — Helpers (scripting, economy, cases, etc.)
data/         — JSON storage (auto-created)
```

## Emoji command

```
!emojis
```

Lists every custom emoji in the server with the full `<:name:id>` string so you can copy them into `emojis.js`.

## Features

- Moderation (ban, kick, warn, timeout, jail, mutes)
- Antinuke + Antiraid
- Filters + Word filter
- Starboard
- Autoresponders
- Cases
- Welcome / Goodbye (embed + Components V2 scripting)
- Reaction roles
- Tickets
- Giveaways
- Snipe
- Sticky messages
- VoiceMaster
- Economy
- Fake permissions

## Notes

- All data stored in `data/` as JSON
- White/neutral embeds
- Requires discord.js v14.18+ for Components V2
