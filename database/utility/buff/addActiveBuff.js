const { db } = require('../../database');

function addActiveBuff(userID, guildID, itemID, startTimestamp, duration) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR REPLACE INTO ActiveBuffs (userID, guildID, itemID, startTimestamp, duration)
       VALUES (?, ?, ?, ?, ?)`,
      [userID, guildID, itemID, startTimestamp, duration],
      function (err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

module.exports = addActiveBuff;
