const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const shopItems = require('../../../data/shopItem');
const getUserInventory = require('../../../database/utility/inventory/getUserInventory'); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('View your stored items'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    // Fetch inventory from DB, should return array of objects like { itemID, quantity }
    const inventory = await getUserInventory(userId, guildId);

    if (!inventory || inventory.length === 0) {
      return interaction.reply({
        content: '🪰 Your inventory is empty.',
        flags: 1<<6,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`${interaction.user.username}'s Inventory`)
      .setColor(0xfed766);

    // Loop through each inventory item
    for (const entry of inventory) {
      if (!entry.quantity || entry.quantity <= 0) continue;  // Skip empty or invalid quantities
      const item = shopItems[entry.itemID];
      if (!item) continue; 
      embed.addFields({
        name: item.name,
        value: `Quantity: ${entry.quantity}\n${item.description}`,
        inline: false,
      });
    }


    await interaction.reply({ embeds: [embed] });
  }
};
