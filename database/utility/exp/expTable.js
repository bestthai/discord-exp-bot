/**
 * EXP needed *for* a specific level
 * @param {number} level
 * @returns {number}
 */
function getExpForLevel(level) {
  return 5 * (level ** 2) + 5 * level + 50;
}

/**
 * Total cumulative EXP needed *to reach* a specific level
 * @param {number} level
 * @returns {number}
 */
function getTotalExpToReach(level) {
  let total = 0;
  for (let i = 0; i < level; i++) {
    total += getExpForLevel(i);
  }
  return total;
}

/**
 * Get EXP stats for a level
 * @param {number} level
 * @returns {{ level: number, expForLevel: number, totalExpToReach: number }}
 */
function getExpStats(level) {
  return {
    level,
    expForLevel: getExpForLevel(level),
    totalExpToReach: getTotalExpToReach(level)
  };
}

const exampleLevels = [1, 5, 10, 15, 20, 25, 30, 35, 50, 75, 100, 150];
for (const level of exampleLevels) {
  const stats = getExpStats(level);
  console.log(`Level ${stats.level}: EXP for level = ${stats.expForLevel}, Total EXP to reach = ${stats.totalExpToReach}`);
}

// for (let level = 0; level <= 150; level++) {
//   const stats = getExpStats(level);
//   console.log(`Level ${stats.level}: EXP for level = ${stats.expForLevel}, Total EXP to reach = ${stats.totalExpToReach}`);
// }

