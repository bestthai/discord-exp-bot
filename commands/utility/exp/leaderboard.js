const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { db } = require('../../../database/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('exp-leaderboard')
    .setDescription('Show the top levels in this server'),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const guildName = interaction.guild.name;
    const guildIconURL = interaction.guild.iconURL();

    db.all(
      `SELECT userID, level, totalExp FROM User WHERE guildID = ? ORDER BY level DESC, totalExp DESC LIMIT 10`,
      [guildId],
      (err, rows) => {
        if (err) {
          console.error(err);
          return interaction.reply({ content: 'Error fetching leaderboard.', flags: 1 << 6 });
        }

        if (!rows.length) {
          return interaction.reply({ content: 'No data found for this server.', flags: 1 << 6 });
        }

        let leaderboardDesc = '';
        rows.forEach((row, index) => {
          const rank = String(index + 1).padEnd(2, ' ');
          leaderboardDesc += `**${rank}.** <@${row.userID}>\n`;
          leaderboardDesc += `Level     : \`${row.level}\`\n`;
          leaderboardDesc += `Total EXP : \`${row.totalExp || 0}\`\n\n`;
        });

        const embed = new EmbedBuilder()
          .setAuthor({ name: 'LEADERBOARD' })
          .setTitle(guildName)
          .setDescription(leaderboardDesc)
          .setThumbnail(guildIconURL);

        return interaction.reply({ embeds: [embed] });
      }
    );
  }
};
