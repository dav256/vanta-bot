# Vanta Bot

Discord.js v14 multipurpose bot inspired by Greed and Bleed.

## Commands

### Moderation
- `!ban @user [reason]`
- `!kick @user [reason]`
- `!warn @user [reason]`
- `!timeout @user <duration> [reason]` (e.g. 10m, 1h)

### Utility
- `!embed {title: Hello} {description: World}` — Create custom embeds with variables
- `!emojis` — List server emojis

### Economy
- `!balance`
- `!daily`
- `!pay @user amount`

### Fun
- `!hug @user`

### Embed Script Variables
- `{user.mention}`, `{user.tag}`, `{user.avatar}`
- `{guild.name}`, `{guild.count}`, `{guild.icon}`

More features (welcome, giveaways, tickets, reaction roles, starboard, etc.) coming soon.

## Setup
1. npm install
2. Create .env with TOKEN and PREFIX
3. node index.js
