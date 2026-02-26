const { db } = require('../../database'); // Adjust path as needed

function updateUserInventoryItem(userID, guildID, itemID, newQuantity) {
  return new Promise((resolve, reject) => {
    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      db.run(
        `DELETE FROM Inventory WHERE userID = ? AND guildID = ? AND itemID = ?`,
        [userID, guildID, itemID],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    } else {
      // Update the quantity
      db.run(
        `UPDATE Inventory SET quantity = ? WHERE userID = ? AND guildID = ? AND itemID = ?`,
        [newQuantity, userID, guildID, itemID],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    }
  });
}

module.exports = updateUserInventoryItem;
