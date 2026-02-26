const { 
  SlashCommandBuilder, 
  ActionRowBuilder, 
  StringSelectMenuBuilder, 
  EmbedBuilder, 
  ComponentType, 
} = require('discord.js');

const shopItems = require('../../../data/shopItem');
const getUserExp = require('../../../database/utility/exp/getUserExp');
const removeUserExp = require('../../../database/utility/exp/removeUserExp');
const addUserInventoryItem = require('../../../database/utility/inventory/addUserInventoryItem');

const { db } = require('../../../database/database');

const categories = {
  chatMult: "📝 Chat EXP Multiplier",
  voiceMult: "🎙️ Voice EXP Multiplier",
  globalMult: "🌌 Global EXP Multiplier",
  misc: "✨ Miscellaneous Items",
};

const userStages = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Purchase an item from the shop via dropdown menus'),

  async execute(interaction) {
    const categorySelect = new StringSelectMenuBuilder()
      .setCustomId('buy-category')
      .setPlaceholder('Select item category')
      .addOptions(
        Object.entries(categories).map(([value, label]) => ({
          label,
          value,
        }))
      );

    const categoryRow = new ActionRowBuilder().addComponents(categorySelect);

    const reply = await interaction.reply({
      content: 'Select the category of the item you want to buy:',
      components: [categoryRow],
      flags: 1 << 6,
      fetchReply: true,
    });

    userStages.set(interaction.user.id, 1);

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60_000,
      filter: i => i.user.id === interaction.user.id,
    });

    collector.on('collect', async i => {
      try {
        const stage = userStages.get(i.user.id) || 1;

        if (i.customId === 'buy-category' && stage === 1) {
          const selectedCategory = i.values[0];
          const filteredItems = Object.entries(shopItems).filter(([key, item]) => item.type === selectedCategory);

          if (filteredItems.length === 0) {
            await i.update({ content: 'No items available in this category.', components: [] });
            userStages.delete(i.user.id);
            collector.stop();
            return;
          }

          const itemSelect = new StringSelectMenuBuilder()
            .setCustomId('buy-item')
            .setPlaceholder('Select an item to buy')
            .addOptions(
              filteredItems.map(([key, item]) => ({
                label: `${item.name} - ${item.cost} EXP`,
                description: item.description.length > 50 ? item.description.slice(0, 47) + '...' : item.description,
                value: key,
              }))
            );

          const itemRow = new ActionRowBuilder().addComponents(itemSelect);

          await i.update({
            content: `Category: **${categories[selectedCategory]}**\nNow select the item you want to buy:`,
            components: [itemRow],
          });

          userStages.set(i.user.id, 2);
          return;
        }

        if (i.customId === 'buy-item' && stage === 2) {
          const itemId = i.values[0];
          const item = shopItems[itemId];

          if (!item) {
            await i.update({ content: '❌ That item does not exist.', components: [] });
            userStages.delete(i.user.id);
            collector.stop();
            return;
          }

          const userId = interaction.user.id;
          const guildId = interaction.guildId;
          const exp = await getUserExp(userId, guildId);

          if (exp < item.cost) {
            await i.update({ content: '❌ If you are reading then you are too broke!', components: [] });
            userStages.delete(i.user.id);
            collector.stop();
            return;
          }

          // DEFAULT LOGIC FOR ALL OTHER ITEMS
          await removeUserExp(userId, guildId, item.cost);
          await addUserInventoryItem(userId, guildId, itemId, 1);

          const embed = new EmbedBuilder()
            .setTitle(`Item Purchased: ${item.name}`)
            .setDescription(`This item has been added to your inventory.\n\n**${item.description}**`)
            .addFields({ name: 'EXP Spent', value: `${item.cost} EXP`, inline: true })
            .setColor(0x77dd77);

          await i.update({ content: null, embeds: [embed], components: [] });

          userStages.delete(i.user.id);
          collector.stop();
          return;
        }

      } catch (error) {
        console.error('Error purchasing item:', error);
        
        if (!i.replied && !i.deferred) {
          try {
            await i.reply({ content: '❌ An error occurred while processing your purchase.', flags: 1 << 6 });
          } catch (err) {
            console.error('Failed to send error reply:', err);
          }
        }

        userStages.delete(i.user.id);
        collector.stop();
      }
    });

    collector.on('end', async () => {
      try {
        await interaction.editReply({ components: [] });
      } catch {}
      userStages.delete(interaction.user.id);
    });
  },
};
