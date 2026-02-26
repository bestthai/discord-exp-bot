const createStatusEmbed = require('./statusUpdate');
let statusMessage;

async function updateStatusEmbed(client, channelId) {
    const channel = await client.channels.fetch(channelId);
    if (!channel) return;

    const embed = createStatusEmbed(Date.now());

    try {
        if (!statusMessage) {
            statusMessage = await channel.send({ embeds: [embed] });
        } else {
            await statusMessage.edit({ embeds: [embed] });
        }
    } catch (err) {
        console.error('Error updating bot status embed:', err);
    }
}

function startStatusUpdates(client, channelId) {
    updateStatusEmbed(client, channelId);
    setInterval(() => updateStatusEmbed(client, channelId), 30 * 1000); // update every 30 seconds
}

module.exports = startStatusUpdates;
