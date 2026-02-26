const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/expbot.db');

db.serialize(() => {  
    // db.run(`DROP TABLE IF EXISTS ActiveBuffs`);
    // db.run(`DROP TABLE IF EXISTS Inventory`);
    // db.run(`DROP TABLE IF EXISTS UserStat`);
    // db.run(`DROP TABLE IF EXISTS User;`);    
    
    db.run(
            `CREATE TABLE IF NOT EXISTS User (
            userID TEXT NOT NULL,
            guildID TEXT NOT NULL,
            exp INTEGER DEFAULT 0,
            level INTEGER DEFAULT 0,
            totalExp INTEGER DEFAULT 0,
            PRIMARY KEY (userID, guildID)
            );`
    );

    db.run(
            `CREATE TABLE IF NOT EXISTS UserStat (
            userID TEXT NOT NULL,
            guildID TEXT NOT NULL,
            firstMessageTS INTEGER,
            lastDailyClaim INTEGER, 
            PRIMARY KEY (userID, guildID)
            );`
    );

    db.run(
           `CREATE TABLE IF NOT EXISTS Inventory (
            userID TEXT NOT NULL,
            guildID TEXT NOT NULL,
            itemID TEXT NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (userID, guildID, itemID)
          );`
    )

    db.run(
           `CREATE TABLE IF NOT EXISTS ActiveBuffs (
            userID TEXT NOT NULL,
            guildID TEXT NOT NULL,
            itemID TEXT NOT NULL,
            startTimestamp INTEGER NOT NULL,
            duration INTEGER NOT NULL,
            channelID TEXT,
            messageID TEXT,
            PRIMARY KEY (userID, guildID, itemID)
          );`
    )

});



function getAllUsers() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT userID AS id, totalExp, level FROM User`, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Update the level for a user
function updateUserLevel(userId, newLevel) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE User SET level = ? WHERE userID = ? `,
      [newLevel, userId],
      function (err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

module.exports = 
{
    db,
    getAllUsers,
    updateUserLevel,
};


