const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function parseVariables(text, context = {}) {
  if (!text) return text;
  const { user, guild, member, channel } = context;

  return text
    .replace(/{user\.mention}/g, user ? `<@${user.id}>` : '{user.mention}')
    .replace(/{user\.name}/g, user?.username || '{user.name}')
    .replace(/{user\.tag}/g, user?.tag || '{user.tag}')
    .replace(/{user\.id}/g, user?.id || '{user.id}')
    .replace(/{user\.avatar}/g, user?.displayAvatarURL({ dynamic: true, size: 256 }) || '{user.avatar}')
    .replace(/{guild\.name}/g, guild?.name || '{guild.name}')
    .replace(/{guild\.id}/g, guild?.id || '{guild.id}')
    .replace(/{guild\.count}/g, guild?.memberCount || '{guild.count}')
    .replace(/{guild\.icon}/g, guild?.iconURL({ dynamic: true }) || '{guild.icon}')
    .replace(/{channel\.name}/g, channel?.name || '{channel.name}')
    .replace(/{channel\.mention}/g, channel ? `<#${channel.id}>` : '{channel.mention}');
}

function parseScript(script, context = {}) {
  if (!script) return null;

  const embed = new EmbedBuilder();
  const buttons = [];
  let content = null;

  // Split by $v or newlines for simple multi-line
  const lines = script.split(/\$v|\n/).map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    const match = line.match(/^{(\w+):\s*(.+)}$/);
    if (!match) continue;

    const key = match[1].toLowerCase();
    let value = match[2].trim();

    value = parseVariables(value, context);

    switch (key) {
      case 'content':
        content = value;
        break;
      case 'title':
        embed.setTitle(value.slice(0, 256));
        break;
      case 'description':
        embed.setDescription(value.slice(0, 4096));
        break;
      case 'color':
        embed.setColor(value);
        break;
      case 'url':
        embed.setURL(value);
        break;
      case 'thumbnail':
        embed.setThumbnail(value);
        break;
      case 'image':
        embed.setImage(value);
        break;
      case 'footer':
        const [footerText, footerIcon] = value.split('&&').map(s => s.trim());
        embed.setFooter({ text: footerText?.slice(0, 2048) || '', iconURL: footerIcon || undefined });
        break;
      case 'author':
        const parts = value.split('&&').map(s => s.trim());
        const author = {};
        for (const p of parts) {
          const [k, v] = p.split(':').map(s => s.trim());
          if (k === 'name') author.name = v;
          if (k === 'icon') author.iconURL = v;
          if (k === 'url') author.url = v;
        }
        if (author.name) embed.setAuthor(author);
        break;
      case 'field':
        const [name, val, inline] = value.split('&&').map(s => s.trim());
        if (name && val) {
          embed.addFields({ name: name.slice(0, 256), value: val.slice(0, 1024), inline: inline === 'inline' });
        }
        break;
      case 'button':
        // Simple button support: label && url && style
        const [label, url, style] = value.split('&&').map(s => s.trim());
        if (label && url) {
          const btn = new ButtonBuilder()
            .setLabel(label.slice(0, 80))
            .setURL(url)
            .setStyle(ButtonStyle.Link);
          buttons.push(btn);
        }
        break;
    }
  }

  const components = [];
  if (buttons.length) {
    const row = new ActionRowBuilder().addComponents(buttons.slice(0, 5));
    components.push(row);
  }

  return {
    content,
    embeds: embed.data.title || embed.data.description || embed.data.fields?.length ? [embed] : [],
    components
  };
}

module.exports = { parseScript, parseVariables };
