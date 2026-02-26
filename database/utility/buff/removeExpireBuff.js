const { db } = require('../../database');

async function removeExpireBuff(client) {
  const now = Math.floor(Date.now() / 1000);

  // Query all expired buffs that have a messageID (meaning announcement was sent)
  const expiredBuffs = await new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM ActiveBuffs WHERE (startTimestamp + duration) <= ? AND messageID IS NOT NULL AND itemID = ?`,
      [now, 'GlobalMult'], // only for globalMult buffs
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });

  for (const buff of expiredBuffs) {
    try {
      const channel = await client.channels.fetch(buff.channelID);
      if (!channel || !channel.isTextBased()) continue;

      const msg = await channel.messages.fetch(buff.messageID);
      if (msg) await msg.delete();
    } catch (e) {
      console.error(`Error deleting globalMult buff message for guild ${buff.guildID}:`, e.message);
    }
  }

  // Then delete the expired buffs themselves
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM ActiveBuffs WHERE (startTimestamp + duration) <= ?`,
      [now],
      function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      }
    );
  });
}


module.exports = removeExpireBuff;
