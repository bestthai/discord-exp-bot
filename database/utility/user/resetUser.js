const sqlite3 = require('sqlite3').verbose();
const { Client } = require('discord.js');
const db = new sqlite3.Database('./data/expbot.db');
require('dotenv').config();

const client = new Client({ intents: [] }); // No intents needed for basic fetching
client.login(process.env.BOT_TOKEN);

const guildId = '868478837766377472';
const userId = '1221951025833836564';

async function fetchNames(userId, guildId) {
    try {
        const guild = await client.guilds.fetch(guildId);
        const member = await guild.members.fetch(userId);
        return {
            username: member.user.tag,
            guildName: guild.name
        };
    } catch (error) {
        console.warn('Could not fetch names, using IDs instead:', error.message);
        return {
            username: userId,
            guildName: guildId
        };
    }
}

async function resetUser(userID, guildID) {
    const { username, guildName } = await fetchNames(userID, guildID);
    
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE User SET exp = 0, level = 0, totalExp = 0 
             WHERE userID = ? AND guildID = ?`,
            [userID, guildID],
            function(err) {
                if (err) {
                    console.error(`❌ Failed to reset ${username} in ${guildName}:`, err.message);
                    return reject(err);
                }
                
                if (this.changes > 0) {
                    console.log(`✅ Successfully reset ${username} in server "${guildName}" to level 0`);
                } else {
                    console.log(`⚠️ User ${username} not found in server "${guildName}"`);
                }
                resolve(this.changes > 0);
            }
        );
    });
}

// Execute with async/await
(async () => {
    try {
        await resetUser(userId, guildId);
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);    
    } finally {
        db.close();
        client.destroy();
        process.exit(0);
    }
})();