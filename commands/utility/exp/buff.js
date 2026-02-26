const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const getActiveBuff = require('../../../database/utility/buff/getActiveBuff');
const shopItems = require('../../../data/shopItem');
const { db } = require('../../../database/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('exp-buff')
    .setDescription('Check your current active buffs'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const guildId = interaction.guildId;

    const buffs = await getActiveBuff(userId, guildId);

    if (!buffs || buffs.length === 0) {
      return interaction.reply({
        content: "You don't have any active buffs.",
        flags: 1<<6,
      });
    }

    let buffList = '';
    for (const buff of buffs) {
      const itemData = shopItems[buff.itemID];
      if (!itemData) continue;

      const expiryTimestamp = buff.startTimestamp + buff.duration;
      const expiresIn = `<t:${expiryTimestamp}:R>`;

      buffList += `• **${itemData.name}** – Expires ${expiresIn}\n${itemData.description}\n\n`;
    }

    if (buffList.trim().length === 0) {
      return interaction.reply({
        content: "You don't have any active buffs.",
        flags: 64,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('🧪 Your Active Buffs')
      .setColor(0x6a5acd)
      .setDescription(buffList);

    return interaction.reply({
      embeds: [embed] , flags: 64 ,
    });
  },
};
