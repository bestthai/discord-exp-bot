const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ComponentType } = require('discord.js');
const shopItems = require('../../../data/shopItem');

const rarityEmojis = {
  Common: "🧪",
  Uncommon: "🍼",
  Rare: "🍷",
  Advance: "🍸",
  Legendary: "🧴",
};


module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription("Browse TheGoddess's shop by item category"),

  async execute(interaction) {
    const categories = {
      chatMult: "📝 Chat EXP Multiplier",
      voiceMult: "🎙️ Voice EXP Multiplier",
      globalMult: "🌌 Global EXP Multiplier",
      misc: "✨ Miscellaneous Items",
    };

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('shop-category')
      .setPlaceholder('Choose a category...')
      .addOptions(
        Object.entries(categories).map(([value, label]) => ({
          label,
          value,
        }))
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    // Send reply and fetch the message for collector
    const reply = await interaction.reply({
      content: 'Select a category to view items:',
      components: [row],
      flags: 1 << 6,
      fetchReply: true,
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60_000,
      filter: i => i.user.id === interaction.user.id,
    });

    let lastCategory = null;

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: "Only the command user can use this menu.", flags: 1 << 6 });
      }

      const selectedCategory = i.values[0];
      if (selectedCategory === lastCategory) return i.deferUpdate();
      lastCategory = selectedCategory;

      const embed = new EmbedBuilder()
        .setTitle(categories[selectedCategory])
        .setColor(0xa88add);

      const filteredItems = Object.values(shopItems).filter(item => item.type === selectedCategory);

      if (filteredItems.length === 0) {
        embed.setDescription("No items available in this category.");
      } else {
        filteredItems.slice(0, 25).forEach(item => {
          const id = Object.keys(shopItems).find(key => shopItems[key] === item) || '';
          const rarity = id.match(/^(Common|Uncommon|Rare|Advance|Legendary)/)?.[0] || "Common";
          const emoji = rarityEmojis[rarity] || "💰";

          embed.addFields(
            {
              name: `${emoji} ${item.name} - ${item.cost} EXP`,
              value: item.description,
              inline: false,
            }
          );
        });
      }

      const newSelectMenu = new StringSelectMenuBuilder()
        .setCustomId('shop-category')
        .setPlaceholder('Choose a category...')
        .addOptions(
          Object.entries(categories).map(([value, label]) => ({
            label,
            value,
          }))
        );

      const newRow = new ActionRowBuilder().addComponents(newSelectMenu);

      await i.update({ embeds: [embed], components: [newRow] });
    });

    collector.on('end', () => {
      const disabledSelectMenu = new StringSelectMenuBuilder()
        .setCustomId('shop-category')
        .setPlaceholder('Choose a category...')
        .setDisabled(true)
        .addOptions(
          Object.entries(categories).map(([value, label]) => ({
            label,
            value,
          }))
        );

      const disabledRow = new ActionRowBuilder().addComponents(disabledSelectMenu);
      interaction.editReply({ components: [disabledRow] });
    });
  },
};
