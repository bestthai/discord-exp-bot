const { db } = require('../../database');

function getUserInventory(userID, guildID) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT itemID, quantity FROM Inventory WHERE userID = ? AND guildID = ?`,
      [userID, guildID],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows); // returns array of { itemID, quantity }
      }
    );
  });
}

module.exports = getUserInventory;

