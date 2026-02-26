const { getAllUsers, updateUserLevel } = require('../../database');

function calculateLevelFromExp(exp) {
  let level = 0;
  while (true) {
    const requiredExp = 5 * (level ** 2) + 5 * level + 50;; 
    if (exp < requiredExp) break;
    exp -= requiredExp;
    level++;
  }
  return level;
}

async function recalculateLevels() {
  try {
    const users = await getAllUsers();

    for (const user of users) {
      const newLevel = calculateLevelFromExp(user.totalExp);  
      if (user.level !== newLevel) {
        await updateUserLevel(user.id, newLevel);
        console.log(`Updated ${user.id}: Level ${user.level} ➡️ ${newLevel}`);
      }
    }

    console.log('✅ All user levels recalculated.');
  } catch (err) {
    console.error('❌ Error recalculating levels:', err);
  }
}

module.exports = recalculateLevels();
