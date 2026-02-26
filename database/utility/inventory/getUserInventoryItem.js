const { db } = require("../../database");

function getUserInventoryItem(userID, guildID, itemID) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM Inventory WHERE userID = ? AND guildID = ? AND itemID = ?`,
      [userID, guildID, itemID],
      (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      }
    );
  });
}


module.exports = getUserInventoryItem;