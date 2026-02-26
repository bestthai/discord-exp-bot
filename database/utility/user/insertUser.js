const sqlite3 = require('sqlite3').verbose();
const { Client } = require('discord.js');
const { getLevelFromTotalExp, getTotalExpToLevel } = require('../../../systems/expSystem');
const expSystem = require('../../../systems/expSystem');
require('dotenv').config();

// Initialize clients
const client = new Client({ intents: [] });
client.login(process.env.BOT_TOKEN);
const db = new sqlite3.Database('./data/expbot.db');

// Your user data
const guildId = '868478837766377472';
const userId = '1221951025833836564'; 
const totalExp = 139; 

// Get level data from your existing system
const level = getLevelFromTotalExp(totalExp);
const expInCurrentLevel = totalExp - getTotalExpToLevel(level);
const expNeededForNextLevel = expSystem.getExpForLevel(level + 1);

async function getDiscordNames() {
    try {
        const guild = await client.guilds.fetch(guildId);
        const user = await guild.members.fetch(userId);
        return {
            username: user.user.tag,
            guildName: guild.name
        };
    } catch (error) {
        console.warn('Could not fetch names:', error.message);
        return {
            username: `User(${userId})`,
            guildName: `Guild(${guildId})`
        };
    }
}

async function updateUser() {
    const { username, guildName } = await getDiscordNames();
    
    db.run(
        `INSERT INTO User (userID, guildID, level, exp, totalExp)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(userID, guildID) DO UPDATE 
         SET level = excluded.level, exp = excluded.exp, totalExp = excluded.totalExp`,
        [userId, guildId, level, expInCurrentLevel, totalExp],
        function(err) {
            if (err) {
                console.error('Database error:', err);
            } else {
                console.log(`
                🎮 EXP System - Using expSystem.js
                ┌─────────────────────────────
                │ 👤 User: ${username}
                │ 🏰 Guild: ${guildName}
                │ 🏆 Level: ${level}
                │ ✨ Current EXP: ${expInCurrentLevel.toLocaleString()}
                │ 🔼 Needed for Lvl ${level + 1}: ${expNeededForNextLevel.toLocaleString()}
                │ 📊 Total EXP: ${totalExp.toLocaleString()}
                └─────────────────────────────
                `);
            }
            db.close();
            client.destroy();
        }
    );
}

client.on('ready', updateUser);