const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const expSystem = require('../../../systems/expSystem');
const { db } = require('../../../database/database'); 
const { expRoleMap, roleTitles } = require('../../../data/roleMap');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('exp-level')
    .setDescription('Check your current level and EXP')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('User to check')
        .setRequired(false)
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const targetUser = interaction.options.getUser('target') || interaction.user;
    const userId = targetUser.id;

    expSystem.getUserData(userId, guildId, (err, user) => {
      if (err) {
        console.error(err);
        return interaction.reply({
          content: '❌ Error fetching your level data.',
          flags: 1 << 6 
        });
      }

      const expToNextLevel = expSystem.getExpToNextLevel(user.level);
      const progressPercent = Math.min(Math.floor((user.exp / expToNextLevel) * 100), 99);
      const progressBar = createProgressBar(progressPercent);

      // Combine progress bar and percent on the same line
      const progressFieldValue = `${progressBar}  ${progressPercent}%`;

      // Query to get the user's rank in the guild leaderboard
      db.get(
        `SELECT COUNT(*) + 1 AS rank FROM User
         WHERE guildID = ? AND (level > ? OR (level = ? AND totalExp > ?))`,
        [guildId, user.level, user.level, user.totalExp],
        (rankErr, rankRow) => {
          if (rankErr) {
            console.error(rankErr);
            return interaction.reply({
              content: '❌ Error fetching your rank.',
              flags: 1 << 6
            });
          }

          const ranking = rankRow ? `Rank #${rankRow.rank}` : 'Rank Unavailable';
          const totalExpFormatted = user.totalExp.toLocaleString();
          const footerText = `${ranking} — ${totalExpFormatted} EXP`;

          const title = getYapperTitle(user.level);
          const roleId = expRoleMap[title];
          const roleMention = roleId ? `<@&${roleId}>` : title;

          const embed = new EmbedBuilder()
            .setTitle('📇 Profile Card')
            .setDescription(`${roleMention} — ${targetUser} `)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .setColor(0x80ef80)
            .addFields(
              { name: '🏆 Level', value: `${user.level}`, inline: true },
              { name: '✨ EXP', value: `${user.exp.toLocaleString()} / ${expToNextLevel.toLocaleString()}`, inline: true },
              { name: 'Progress', value: progressFieldValue, inline: false }
            )
            .setFooter({ text: footerText });

          interaction.reply({ embeds: [embed] });
        }
      );
    });
  }
};

function createProgressBar(percent) {
  const filled = '█';
  const empty = '░';
  const totalSlots = 10;
  const filledSlots = Math.min(Math.round(percent / 10), totalSlots - 1);
  
  return `[${filled.repeat(filledSlots)}${empty.repeat(totalSlots - filledSlots)}]`;
}

function getYapperTitle(level) {
  let title = 'Yapper';
  for (const lvl of Object.keys(roleTitles).map(Number).sort((a, b) => a - b)) {
    if (level >= lvl) title = roleTitles[lvl];
    else break;
  }
  return title;
}
