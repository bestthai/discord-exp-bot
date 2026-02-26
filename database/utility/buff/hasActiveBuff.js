const { db } = require('../../database');

function hasActiveBuff(userID, guildID, itemID) {
  return new Promise((resolve, reject) => {
    const now = Math.floor(Date.now() / 1000);
    db.get(
      `SELECT 1 FROM ActiveBuffs WHERE userID = ? AND guildID = ? AND itemID = ? AND (startTimestamp + duration) > ?`,
      [userID, guildID, itemID, now],
      (err, row) => {
        if (err) return reject(err);
        resolve(!!row); // true if exists, false if not
      }
    );
  });
}


module.exports = hasActiveBuff;
