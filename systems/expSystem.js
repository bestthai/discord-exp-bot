const { db } = require('../database/database');
const getCombinedExpMultiplier = require('../database/utility/exp/getCombinedExpMultiplier');


/**
 * EXP required *for a specific level only*
 * @param {number} level
 * @returns {number}
 */
function getExpForLevel(level) {
    return 5 * (level ** 2) + 5 * level + 50;
}

/**
 * Total EXP required to *reach* a given level (sum of all prior level EXP)
 * @param {number} level
 * @returns {number}
 */
function getTotalExpToLevel(level) {
    let total = 0;
    for (let i = 1; i <= level; i++) {
        total += getExpForLevel(i);
    }
    return total;
}

/**
 * EXP required to reach the *next level* from current
 * @param {number} currentLevel
 * @returns {number}
 */
function getExpToNextLevel(currentLevel) {
    return getExpForLevel(currentLevel + 1);
}

/**
 * Determine current level from total accumulated EXP
 * @param {number} totalExp
 * @returns {number}
 */
function getLevelFromTotalExp(totalExp) {
    let level = 0;
    while (totalExp >= getTotalExpToLevel(level + 1)) {
        level++;
    }
    return level;
}

/**
 * Get user data or insert new record if not found
 * @param {string} userID
 * @param {string} guildID
 * @param {function} callback
 */
function getUserData(userID, guildID, callback) {
    db.get(
        `SELECT * FROM User WHERE userID = ? AND guildID = ?`,
        [userID, guildID],
        (err, row) => {
            if (err) return callback(err);

            if (!row) {
                db.run(
                    `INSERT INTO User (userID, guildID, exp, level, totalExp) 
                     VALUES (?, ?, 0, 0, 0)`,
                    [userID, guildID],
                    (err) => callback(err, { userID, guildID, exp: 0, level: 0, totalExp: 0 })
                );
            } else {
                const correctLevel = getLevelFromTotalExp(row.totalExp);
                const expInCurrentLevel = row.totalExp - getTotalExpToLevel(correctLevel);

                if (row.level !== correctLevel || row.exp !== expInCurrentLevel) {
                    db.run(
                        `UPDATE User SET level = ?, exp = ? 
                         WHERE userID = ? AND guildID = ?`,
                        [correctLevel, expInCurrentLevel, userID, guildID],
                        (err) => {
                            if (err) console.error("Error fixing user data:", err);
                            row.level = correctLevel;
                            row.exp = expInCurrentLevel;
                            callback(null, row);
                        }
                    );
                } else {
                    callback(null, row);
                }
            }
        }
    );
}

/**
 * Add EXP to a user and recalculate their level, applying relevant EXP multipliers
 * @param {string} userID
 * @param {string} guildID
 * @param {number} baseAmount - base EXP before buffs
 * @param {'chatMult' | 'voiceMult' | 'globalMult'} type - type of EXP source
 * @param {function} callback
 */
function addExp(userID, guildID, baseAmount, type = 'chatMult', callback) {
    getCombinedExpMultiplier(userID, guildID, type, (err, multiplier) => {
        if (err) return callback(err);

        const boostedAmount = Math.floor(baseAmount * multiplier);

        getUserData(userID, guildID, (err, user) => {
            if (err) return callback(err);

            const newTotalExp = user.totalExp + boostedAmount;
            const newLevel = getLevelFromTotalExp(newTotalExp);
            const expInCurrentLevel = newTotalExp - getTotalExpToLevel(newLevel);
            const leveledUp = newLevel > user.level;

            const now = new Date();
            const timestamp = now.toISOString().slice(0, 10) + ' ' +
            now.toTimeString().slice(0, 8);

            console.log(`[${timestamp}] User ${userID} — base: ${baseAmount}, multiplier: ${multiplier}, boosted: ${boostedAmount}, totalExp after: ${newTotalExp}`);

            db.run(
                `UPDATE User SET exp = ?, totalExp = ?, level = ? 
                 WHERE userID = ? AND guildID = ?`,
                [expInCurrentLevel, newTotalExp, newLevel, userID, guildID],
                (err) => callback(err, {
                    newExp: expInCurrentLevel,
                    newLevel,
                    totalExp: newTotalExp,
                    leveledUp,
                    baseExp: baseAmount,
                    boostedExp: boostedAmount,
                    multiplierUsed: multiplier,
                    buffType: type,
                })
            );
        });
    });
}



module.exports = {
    getUserData,
    addExp,
    getExpToNextLevel,
    getExpForLevel,
    getTotalExpToLevel,
    getLevelFromTotalExp,
};
