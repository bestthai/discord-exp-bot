const { Events } = require('discord.js');
const { updateTracking, stopTracking } = require('../systems/voiceExpSystem');

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        const member = newState.member;

        // Handle all changes in one go
        updateTracking(member);

        // Stop tracking if they left the last VC
        if (!newState.channel) {
            stopTracking(member);
        }
    }
};
