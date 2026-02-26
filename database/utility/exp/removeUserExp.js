const { db } = require("../../database");

function removeUserExp(userID, guildID, amount) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE User 
       SET exp = exp - ?, totalExp = totalExp - ? 
       WHERE userID = ? AND guildID = ? AND exp >= ?`,
      [amount, amount, userID, guildID, amount],
      function (err) {
        if (err) return reject(err);
        if (this.changes === 0) return reject(new Error('Not enough EXP'));
        resolve();
      }
    );
  });
}

module.exports = removeUserExp;