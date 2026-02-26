const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { db } = require('../../../database/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('exp-daily')
    .setDescription('Claim your daily exp reward'),
  
  detailedDescription: 'Member gain 250-750 EXP per 24 hours when used this command with 1.1x the exp per everyday used in a row',

  async execute(interaction) {
    const userID = interaction.user.id;
    const guildID = interaction.guild.id;
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const dailyExp = Math.floor(Math.random() * (750 - 250 + 1)) + 250; // Random between 250-750

    db.get(
      `SELECT lastDailyClaim FROM UserStat WHERE userID = ? AND guildID = ?`,
      [userID, guildID],
      (err, statRow) => {
        if (err) {
          console.error('DB error:', err);
          return interaction.reply({ content: 'An error occurred.', flags: 1 << 6 });
        }

        if (!statRow) {
          db.run(
            `INSERT INTO UserStat (userID, guildID, firstMessageTS, lastDailyClaim) VALUES (?, ?, NULL, NULL)`,
            [userID, guildID],
            (insertErr) => {
              if (insertErr) {
                console.error('Insert UserStat error:', insertErr);
                return interaction.reply({ content: 'An error occurred.', flags: 1 << 6 });
              }
              giveDailyExp();
            }
          );
        } else {
          giveDailyExp(statRow.lastDailyClaim);
        }
      }
    );

function giveDailyExp(lastClaim) {
  const gracePeriod = 2 * day; // 48 hours to preserve streak
  let newStreak = 1;

  if (lastClaim && now - lastClaim < day) {
    const timeLeft = day - (now - lastClaim);
    const hours = Math.floor(timeLeft / (60 * 60 * 1000));
    const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);

    const failureEmbed = new EmbedBuilder()
      .setTitle('YOU ARE TOO GREEDY!')
      .setDescription('You have already claimed your daily EXP.')
      .addFields({ name: '⏳ Time Remaining', value: `${hours}h ${minutes}m ${seconds}s` })
      .setColor(0xFF0000);

    return interaction.reply({ embeds: [failureEmbed], flags: 1 << 6 });
  }

  // Get the previous streak value
      db.get(
        `SELECT dailyStreak FROM UserStat WHERE userID = ? AND guildID = ?`,
        [userID, guildID],
        (streakErr, streakRow) => {
          if (streakErr) {
            console.error('Failed to fetch streak:', streakErr);
            return interaction.reply({ content: 'An error occurred.', flags: 1 << 6 });
          }

          const previousStreak = streakRow ? streakRow.dailyStreak : 0; // check for the streak
          if (lastClaim && now - lastClaim < gracePeriod) {
            newStreak = previousStreak + 1;
          } else {
            newStreak = 1; // Reset streak if too late or first time
          }


          if (streakRow && lastClaim && now - lastClaim < gracePeriod) {
            newStreak = streakRow.dailyStreak + 1;
          }

          const multiplier = Math.min(1 + (newStreak - 1) * 0.1, 3.0); // Max 3x
          const totalExpEarned = Math.floor(dailyExp * multiplier);

          const successEmbed = new EmbedBuilder()
            .setTitle('Daily EXP Claimed!')
            .setDescription(`🎉 You claimed **${totalExpEarned} EXP!**`)
            .addFields(
              { name: 'Base EXP', value: `${dailyExp}`, inline: true },
              { name: 'Multiplier', value: `${multiplier.toFixed(1)}x`, inline: true },
            )
            .setFooter({ text: `🔥 Current Streak: ${newStreak} day(s)` })
            .setColor(0x00FF00)

          // Update streak and last claim
          db.run(
            `UPDATE UserStat SET lastDailyClaim = ?, dailyStreak = ? WHERE userID = ? AND guildID = ?`,
            [now, newStreak, userID, guildID],
            (updateErr) => {
              if (updateErr) {
                console.error('Failed to update daily streak:', updateErr);
                return interaction.reply({ content: 'An error occurred.', flags: 1 << 6 });
              }

              db.run(
                `UPDATE User SET exp = exp + ?, totalExp = totalExp + ? WHERE userID = ? AND guildID = ?`,
                [totalExpEarned, totalExpEarned, userID, guildID],
                function (err2) {
                  if (err2) {
                    console.error('Failed to update user EXP:', err2);
                    return interaction.reply({ content: 'An error occurred.', flags: 1 << 6 });
                  }

                  if (this.changes === 0) {
                    db.run(
                      `INSERT INTO User (userID, guildID, exp, totalExp, level) VALUES (?, ?, ?, ?, 0)`,
                      [userID, guildID, totalExpEarned, totalExpEarned],
                      (insertUserErr) => {
                        if (insertUserErr) {
                          console.error('Failed to insert new user in User table:', insertUserErr);
                          return interaction.reply({ content: 'An error occurred.', flags: 1 << 6 });
                        }
                        return interaction.reply({ embeds: [successEmbed] });
                      }
                    );
                  } else {
                    return interaction.reply({ embeds: [successEmbed] });
                  }
                }
              );
            }
          );
        }
      );
    }
  },
};
