const { db } = require("../../database");

function getActiveBuff(userID, guildID) {
  return new Promise((resolve, reject) => {
    const now = Math.floor(Date.now() / 1000);

    db.all(
      `SELECT * FROM ActiveBuffs WHERE userID = ? AND guildID = ?`,
      [userID, guildID],
      (err, rows) => {
        if (err) return reject(err);

        const activeBuffs = rows.filter(row => (row.startTimestamp + row.duration) > now);

        resolve(activeBuffs);
      }
    );
  });
}

module.exports = getActiveBuff;