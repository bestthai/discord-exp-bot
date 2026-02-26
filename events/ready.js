const { Events, ActivityType, PresenceUpdateStatus } = require('discord.js');
const statusUpdate = require('../systems/status/statusScheduler');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        if (typeof deployCommands === 'function') {
            await deployCommands();
        }

        const statusType = process.env.BOT_STATUS || 'online';
        const activityType = process.env.ACTIVITY_TYPE || 'Playing';
        const activityName = process.env.ACTIVITY_NAME || 'Discord';

        const activityTypeMap = {
            "Playing": ActivityType.Playing,
            "Watching": ActivityType.Watching,
            "Listening": ActivityType.Listening,
            "Streaming": ActivityType.Streaming,
            "Competing": ActivityType.Competing
        };

        const statusMap = {
            'online': PresenceUpdateStatus.Online,
            'idle': PresenceUpdateStatus.Idle,
            'dnd': PresenceUpdateStatus.DoNotDisturb,
            'invisible': PresenceUpdateStatus.Invisible,
            'offline': PresenceUpdateStatus.Offline
        };

        client.user.setPresence({
            status: statusMap[statusType.toLowerCase()] || PresenceUpdateStatus.Online,
            activities: [{
                name: activityName,
                type: activityTypeMap[activityType] || ActivityType.Playing
            }]
        });

        console.log(`Bot status set to: ${statusType}`);
        console.log(`Activity set to: ${activityType} ${activityName}\n`);

        const statusChannelId = '1374988907698978856';
        statusUpdate(client, statusChannelId);
    }
};
