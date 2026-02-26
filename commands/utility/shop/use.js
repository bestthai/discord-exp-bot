const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ComponentType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

const shopItems = require('../../../data/shopItem');
const getUserInventory = require('../../../database/utility/inventory/getUserInventory');
const getUserInventoryItem = require('../../../database/utility/inventory/getUserInventoryItem');
const updateUserInventoryItem = require('../../../database/utility/inventory/updateUserInventoryItem');
const addActiveBuff = require('../../../database/utility/buff/addActiveBuff');
const hasActiveBuff = require('../../../database/utility/buff/hasActiveBuff');
const hasActiveGlobalMult = require('../../../database/utility/buff/hasActiveGlobalMult');

const { db } = require('../../../database/database');

// In-memory highlight queue
const highlightQueue = new Map(); // userId => { channelId, timeout }

module.exports = {
  data: new SlashCommandBuilder()
    .setName('use')
    .setDescription('Use an item from your inventory'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const guildId = interaction.guildId;

    const inventory = await getUserInventory(userId, guildId);

    // Filter usable items with quantity > 0 and exist in shopItems
    const usableItems = inventory.filter(
      (invItem) => invItem.quantity > 0 && shopItems[invItem.itemID]
    );

    if (usableItems.length === 0) {
      return interaction.reply({
        content: "❌ You don't have any usable items in your inventory.",
        flags: 1<<6,
      });
    }

    // Build dropdown options for the select menu
    const options = usableItems.map((invItem) => {
      const itemData = shopItems[invItem.itemID];
      return {
        label: itemData.name.slice(0, 100),
        description: itemData.description.slice(0, 100),
        value: invItem.itemID, // this is itemID
      };
    });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('use-item-select')
      .setPlaceholder('Select an item to use')
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      content: 'Select an item from your inventory to use:',
      components: [row],
      flags: 1<<6,
    });

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60000,
      filter: (i) => i.user.id === userId,
    });

    collector.on('collect', async (i) => {
      try {
        const selectedItemKey = i.values[0]; // itemID
        const itemData = shopItems[selectedItemKey];

        if (!itemData) {
          return i.reply({ content: "❌ That item doesn't exist anymore.", flags: 1<<6 });
        }

        // Fetch the inventory row again to check quantity
        const userInv = await getUserInventoryItem(userId, guildId, selectedItemKey);
        const currentQty = userInv?.quantity || 0;
        if (currentQty <= 0) {
          return i.reply({
            content: "❌ You don't have that item anymore.",
            flags: 1<<6,
          });
        }

        // === Special case: Highlight Message ===
        if (itemData.name === "Highlight Message" || selectedItemKey === 'HighlightMessage') {
          if (highlightQueue.has(userId)) {
            return i.reply({
              content: "⚠️ You already have a Highlight Message waiting. Please send your highlighted message first or wait for it to expire.",
              flags: 1<<6,
            });
          }
          // Deduct 1 highlight item
          await updateUserInventoryItem(userId, guildId, selectedItemKey, currentQty - 1);

          // Set highlight queue
          highlightQueue.set(userId, {
            timeout: setTimeout(() => {
              highlightQueue.delete(userId);
              interaction.user.send(
                "⏳ Your Highlight Message time expired. You can use the item again."
              ).catch(() => {});
            }, 5 * 60 * 1000),
          });

          await i.update({
            content: '✨ Your next message will be posted as a glowing embed! Be sure to send it soon, this cannot be undone.',
            embeds: [],
            components: [],
          });
          collector.stop();
          return;
        }

        // === Buff items / global multiplier / other timed buffs ===
        if (itemData.duration && itemData.duration > 0) {
          // Check if already active
          const activeBuff = await hasActiveBuff(userId, guildId, selectedItemKey);
          if (activeBuff) {
            return i.reply({
              content: `⚠️ You already have the buff from **${itemData.name}** active! You can't use it again right now.`,
              flags: 1<<6,
            });
          }
        }
        if (itemData.type === 'globalMult') {
          const globalActive = await hasActiveGlobalMult(guildId);
          if (globalActive) {
            return i.reply({
              content: `⚠️ A Global EXP Multiplier is already active on this server! You can't use another one until it expires.`,
              flags: 1<<6,
            });
          }
        }

        // At this point: standard consumable or buff
        // Deduct 1
        await updateUserInventoryItem(userId, guildId, selectedItemKey, currentQty - 1);

        // If it is a buff with duration, addActiveBuff
        if (itemData.duration && itemData.duration > 0) {
          const now = Math.floor(Date.now() / 1000);
          await addActiveBuff(userId, guildId, selectedItemKey, now, itemData.duration);

          // If globalMult, send announcement and store messageID
          if (itemData.type === "globalMult") {
            const announcementChannelId = "1374431638708162652"; // your announcements channel
            const announcementChannel = interaction.client.channels.cache.get(announcementChannelId);

            if (announcementChannel && announcementChannel.isTextBased()) {
              const endTime = Math.floor(now + itemData.duration);
              const embed = new EmbedBuilder()
                .setTitle("🌟 Global EXP Boost Activated!")
                .setDescription(
                  `<@${interaction.user.id}> used **${itemData.name}**!\n\n` +
                  `> Everyone now gains **${Math.round((itemData.multiplier - 1) * 100)}%** more EXP for **${Math.floor(itemData.duration / 60)} minutes**.\n\n` +
                  `Enjoy the blessing while it lasts!`
                )
                .setColor(0xFFD700)
                .setFooter({ text: `Ends <t:${endTime}:t>` });

              const sentMessage = await announcementChannel.send({ embeds: [embed] });
              // Store messageID and channelID in DB for cleanup later
              db.run(
                `UPDATE ActiveBuffs SET messageID = ?, channelID = ? 
                 WHERE guildID = ? AND itemID = ?`,
                [sentMessage.id, announcementChannel.id, guildId, selectedItemKey],
                (err) => {
                  if (err) {
                    console.error("Failed to save messageID/channelID for global buff:", err);
                  }
                }
              );
            }
          }
        }

        // Finally: Confirmation embed for standard consumable or buff
        const confirmEmbed = new EmbedBuilder()
          .setTitle(`✅ Used: ${itemData.name}`)
          .setDescription(itemData.description)
          .setColor(0x77dd77);

        await i.update({ content: null, embeds: [confirmEmbed], components: [] });
        collector.stop();
      } catch (err) {
        console.error('Error in /use interaction:', err);
        if (!i.replied && !i.deferred) {
          await i.reply({ content: '❌ An error occurred.', flags: 1<<6 });
        }
        collector.stop();
      }
    });

    collector.on('end', async (_collected, reason) => {
      if (reason === 'time') {
        try {
          await interaction.editReply({
            content: '⏳ Item selection timed out.',
            components: [],
          });
        } catch {}
      }
    });
  },
};

module.exports.highlightQueue = highlightQueue;
