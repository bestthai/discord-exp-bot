const { db } = require("../../database");

function getUserExp(userID, guildID) {
  return new Promise((resolve, reject) => {  
    db.get(
      `SELECT exp FROM User WHERE userID = ? AND guildID = ?`,
      [userID, guildID],
      (err, row) => {
        if (err) return reject(err);
        resolve(row ? row.exp : 0);
      }
    );
  });
}

module.exports = getUserExp;
