const { db } = require('../../database');

// Utility function to check if a global multiplier is active in this guild
async function hasActiveGlobalMult(guildId) {
  const now = Math.floor(Date.now() / 1000);
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT itemID, startTimestamp, duration FROM ActiveBuffs WHERE guildID = ? AND itemID = ?`,
      [guildId, 'globalMult'], // Make sure 'globalMult' is the correct itemID for your global multiplier buff
      (err, rows) => {
        if (err) return reject(err);
        const active = rows.some(row => (row.startTimestamp + row.duration) > now);
        resolve(active);
      }
    );
  });
}

module.exports = hasActiveGlobalMult;