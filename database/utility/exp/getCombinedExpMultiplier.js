const { db } = require("../../database");
const itemData = require("../../../data/shopItem");

function getCombinedExpMultiplier(userID, guildID, type, callback) {
  const now = Date.now();

  db.all(
    `SELECT itemID, startTimestamp, duration FROM ActiveBuffs 
     WHERE (userID = ? OR itemID = 'GlobalMult') AND guildID = ?`,
    [userID, guildID],
    (err, rows) => {
      if (err) return callback(err);

      let specificMult = 1;
      let globalMult = 1;

      for (const { itemID, startTimestamp, duration } of rows) {
        const buff = itemData[itemID];

        if (!buff) continue;

        // Normalize timestamp (for older or newer formats)
        const startMs = startTimestamp < 2e10 ? startTimestamp * 1000 : startTimestamp;
        const isActive = (startMs + duration * 1000) > now;
        if (!isActive) continue;

        const buffType = buff.type || "";

        // Match personal multiplier (e.g., chatMult, voiceMult)
        if (buffType === type && buff.multiplier) {
          specificMult = Math.max(specificMult, buff.multiplier);
        }

        // Match global multiplier
        if (buffType === "globalMult" && buff.multiplier) {
          globalMult = Math.max(globalMult, buff.multiplier);
        }
      }

      const finalMultiplier = specificMult * globalMult;

      callback(null, finalMultiplier);
    }
  );
}

module.exports = getCombinedExpMultiplier;
