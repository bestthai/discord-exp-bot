const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { roleTitles, expRoleMap } = require('../../../data/roleMap');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('exp-role')
    .setDescription('Show all yapping roles and their level thresholds'),

  async execute(interaction) {
    // Get max length for consistent alignment
    const maxLevelLength = Math.max(...Object.keys(roleTitles).map(level => level.length));

    const roleList = Object.entries(roleTitles)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([level, title]) => {
        const roleId = expRoleMap[title];
        const roleMention = roleId ? `<@&${roleId}>` : title;
        const paddedLevel = level.padStart(maxLevelLength, ' ');
        return `\`${paddedLevel}:\` ${roleMention}`;
      })
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle('📜 Yapping Roles and Level Thresholds')
      .setDescription(roleList)
      .setColor(0x80ef80);

    await interaction.reply({ embeds: [embed] });
  }
};
