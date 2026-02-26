const { EmbedBuilder } = require('discord.js');

function createStatusEmbed(lastUpdatedTime) {
    return new EmbedBuilder()
        .setColor(0x57F287) // Green
        .setTitle('Bot Status')
        .setDescription(`🟢 | Bot is **Online**\n`)
        .addFields([
        {
            name: '🕒 Last Updated',
            value: `${new Date(lastUpdatedTime).toLocaleTimeString()}\n\nFor PC auto update timestamp :\n<t:${Math.floor(lastUpdatedTime / 1000)}:R>`,
            inline: false,
        }
        ])
        .setFooter({ text: 'If this is older than 30 seconds, the bot may be offline.' })
}

module.exports = createStatusEmbed;
