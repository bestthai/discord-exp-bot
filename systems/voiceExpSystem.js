const { VoiceChannel } = require('discord.js');
const { db } = require('../database/database');
const { getLevelFromTotalExp, getTotalExpToLevel, addExp } = require('./expSystem');

const activeVoiceUsers = new Map();

const EXP_INTERVAL_MINUTES = 1;
const EXP_GAIN = {
    default: 15,
    screenShare: 20,
};

const botRoleId = '1145363441524166758'; // Matchbox bot

function isActive(member) {
    const vs = member.voice;
    return (
        vs.channel && !vs.selfMute && !vs.selfDeaf && !vs.serverMute && !vs.serverDeaf
    );
}

function isScreenSharing(member) {
    const vs = member.voice;
    return (
        vs.streaming || vs.selfVideo
    );
}

function startTracking(member) {
    const userId = member.id;
    if (activeVoiceUsers.has(userId)) return;

    const intervalId = setInterval(() => {
        if (!isActive(member)) return;

        const guildId = member.guild.id;
        const VoiceChannel = member.voice.channel;

        // return if channel is not voice channel
        if (!VoiceChannel) return;

        const nonBotMember = [...VoiceChannel.members.values()].filter(m => !m.roles.cache.has(botRoleId));
        
        // return if the member in VC is less than 2
        if (nonBotMember.length < 2 ) return;
        
        const baseAmount = isScreenSharing(member) ? EXP_GAIN.screenShare : EXP_GAIN.default;

        addExp(userId, guildId, baseAmount, 'voiceMult', (err, result) => {
            if (err) {
                console.error('Voice EXP add error:', err);
                return;
            }

            // console.log(`Added ${result.boostedExp} voice EXP to ${userId} (base: ${baseAmount})`);
        });
    }, EXP_INTERVAL_MINUTES * 60 * 1000);

    activeVoiceUsers.set(userId, intervalId);
}

function stopTracking(member) {
    const intervalId = activeVoiceUsers.get(member.id);
    if (intervalId) {
        clearInterval(intervalId);
        activeVoiceUsers.delete(member.id);
    }
}

function updateTracking(member) {
    if (member.voice.channel && isActive(member)) {
        startTracking(member);
    } else {
        stopTracking(member);
    }
}

module.exports = {
    startTracking,
    stopTracking,
    updateTracking
};
