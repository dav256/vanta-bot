/**
 * Embed / Components scripting parser
 * Supports $v separators and {embed}{title:}{field:} style
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  EmbedBuilder,
  MessageFlags
} = require('discord.js');

function replaceVars(text, data = {}) {
  if (!text) return '';
  return text
    .replace(/{user}/g, data.user?.tag || data.user?.username || 'Unknown')
    .replace(/{user\.mention}/g, data.user ? `<@${data.user.id}>` : '{user.mention}')
    .replace(/{user\.id}/g, data.user?.id || '')
    .replace(/{user\.avatar}/g, data.user?.displayAvatarURL?.({ dynamic: true, size: 256 }) || '')
    .replace(/{guild}/g, data.guild?.name || '')
    .replace(/{guild\.name}/g, data.guild?.name || '')
    .replace(/{guild\.count}/g, String(data.guild?.memberCount || ''))
    .replace(/{guild\.icon}/g, data.guild?.iconURL?.({ dynamic: true }) || '')
    .replace(/{moderator}/g, data.moderator?.tag || data.moderator?.username || '')
    .replace(/{moderator\.mention}/g, data.moderator ? `<@${data.moderator.id}>` : '')
    .replace(/{reason}/g, data.reason || 'No reason provided')
    .replace(/{channel}/g, data.channel?.name || '')
    .replace(/{channel\.mention}/g, data.channel ? `<#${data.channel.id}>` : '');
}

function normalizeScript(script) {
  if (!script) return '';
  return script
    .split(/\$v/i)
    .map(s => s.trim())
    .filter(Boolean)
    .join('');
}

function parse(script, data = {}) {
  return parseEmbedScript(script, data);
}

function parseEmbedScript(script, data = {}) {
  if (!script) return { content: 'Empty script.' };

  let text = normalizeScript(script);
  text = replaceVars(text, data);

  if (text.includes('{container}')) {
    return parseComponentsV2(text);
  }

  if (!text.includes('{embed}') && !text.includes('{title:') && !text.includes('{description:')) {
    return { content: text };
  }

  const embed = new EmbedBuilder().setColor(0xFFFFFF);

  const titleMatch = text.match(/\{title:\s*([^}]+)\}/i);
  if (titleMatch) embed.setTitle(titleMatch[1].trim().slice(0, 256));

  const descMatch = text.match(/\{description:\s*([^}]+)\}/i);
  if (descMatch) embed.setDescription(descMatch[1].trim().slice(0, 4096));

  const colorMatch = text.match(/\{color:\s*(#[0-9a-fA-F]{6}|[0-9]+)\}/i);
  if (colorMatch) {
    const c = colorMatch[1].trim();
    embed.setColor(c.startsWith('#') ? parseInt(c.slice(1), 16) : parseInt(c, 10));
  }

  const footerMatch = text.match(/\{footer:\s*([^}]+)\}/i);
  if (footerMatch) embed.setFooter({ text: footerMatch[1].trim().slice(0, 2048) });

  const thumbnailMatch = text.match(/\{thumbnail:\s*([^}]+)\}/i);
  if (thumbnailMatch) {
    try { embed.setThumbnail(thumbnailMatch[1].trim()); } catch {}
  }

  const imageMatch = text.match(/\{image:\s*([^}]+)\}/i);
  if (imageMatch) {
    try { embed.setImage(imageMatch[1].trim()); } catch {}
  }

  const fieldRegex = /\{field:\s*([^}]+)\}/gi;
  let fieldMatch;
  while ((fieldMatch = fieldRegex.exec(text)) !== null) {
    const raw = fieldMatch[1];
    let name, value, inline = false;
    if (raw.includes('|')) {
      const parts = raw.split('|').map(s => s.trim());
      name = parts[0];
      value = parts.slice(1).join('|').trim();
    } else if (raw.includes('&&')) {
      const parts = raw.split('&&').map(s => s.trim());
      name = parts[0];
      value = parts[1] || '\u200b';
      inline = parts[2]?.toLowerCase() === 'inline' || parts[2]?.toLowerCase() === 'true';
    } else {
      name = raw.trim();
      value = '\u200b';
    }
    if (name) {
      embed.addFields({
        name: name.slice(0, 256),
        value: (value || '\u200b').slice(0, 1024),
        inline
      });
    }
  }

  return { embeds: [embed] };
}

function parseComponentsV2(text) {
  const container = new ContainerBuilder();

  const colorMatch = text.match(/\{color:\s*(#[0-9a-fA-F]{6})\}/i);
  if (colorMatch) {
    container.setAccentColor(parseInt(colorMatch[1].slice(1), 16));
  }

  const contentRegex = /\{content:\s*([^}]+)\}/gi;
  let contentMatch;
  let hasContent = false;
  while ((contentMatch = contentRegex.exec(text)) !== null) {
    const content = contentMatch[1].trim();
    if (content) {
      container.addTextDisplayComponents(new TextDisplayBuilder().setContent(content));
      hasContent = true;
    }
  }

  if (text.includes('{separator}')) {
    container.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );
  }

  const buttonRegex = /\{button:\s*([^}]+)\}/gi;
  const buttons = [];
  let buttonMatch;
  while ((buttonMatch = buttonRegex.exec(text)) !== null) {
    const parts = buttonMatch[1].split('&&').map(s => s.trim());
    const label = parts[0] || 'Button';
    const style = (parts[1] || 'primary').toLowerCase();
    const customId = parts[2] || `btn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const url = parts[3];

    const btn = new ButtonBuilder().setLabel(label);
    if (url && url.startsWith('http')) {
      btn.setStyle(ButtonStyle.Link).setURL(url);
    } else {
      const styleMap = {
        primary: ButtonStyle.Primary,
        secondary: ButtonStyle.Secondary,
        success: ButtonStyle.Success,
        danger: ButtonStyle.Danger
      };
      btn.setStyle(styleMap[style] || ButtonStyle.Primary).setCustomId(customId);
    }
    buttons.push(btn);
  }

  if (buttons.length) {
    container.addActionRowComponents(new ActionRowBuilder().addComponents(...buttons.slice(0, 5)));
  }

  if (!hasContent && !buttons.length) {
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent('Empty container'));
  }

  return {
    components: [container],
    flags: MessageFlags.IsComponentsV2
  };
}

module.exports = {
  parse,
  parseEmbedScript,
  replaceVars,
  MessageFlags
};
