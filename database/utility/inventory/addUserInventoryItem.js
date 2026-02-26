const { db } = require("../../database");

async function addUserInventoryItem(userID, guildID, itemID, amount = 1) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO Inventory (userID, guildID, itemID, quantity) 
       VALUES (?, ?, ?, ?)
       ON CONFLICT(userID, guildID, itemID) 
       DO UPDATE SET quantity = quantity + excluded.quantity`,
      [userID, guildID, itemID, amount],
      function (err) {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

module.exports = addUserInventoryItem;
