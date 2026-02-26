const { Events, EmbedBuilder } = require('discord.js');
const expSystem = require('../systems/expSystem');
const { expRoleMap , roleTitles , mileStoneAnnoucement } = require('../data/roleMap');
const { db } = require('../database/database');
const { highlightQueue } = require('../commands/utility/shop/use'); 
const getUserInventoryItem = require('../database/utility/inventory/getUserInventoryItem');
const updateUserInventoryItem = require('../database/utility/inventory/updateUserInventoryItem');

const cooldowns = new Map();

// Replace this with your target channel ID
const levelUpChannelId = '1373513125768335370';

module.exports = {
  name: Events.MessageCreate,
  once: false,
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    const highlightData = highlightQueue.get(message.author.id);
    if (highlightData) {
      highlightQueue.delete(message.author.id);
      clearTimeout(highlightData.timeout);

      if (!message.content.trim()) {
        return message.channel.send(`${message.author}, your message is empty. Please send some text to highlight.`);
      }

      try {
        // Delete the original message
        await message.delete().catch(() => {});

        // Consume 1 Highlight Message item
        const userInv = await getUserInventoryItem(message.author.id, message.guild.id, 'HighlightMessage');
        if (userInv && userInv.quantity > 0) {
          await updateUserInventoryItem(
            message.author.id,
            message.guild.id,
            'HighlightMessage',
            userInv.quantity - 1
          );
        }

        // Send the glowing embed with user's message content
        const embed = new EmbedBuilder()
          .setTitle("🌟 ATTENTION ATTENTION 🌟")
          .setDescription(message.content)
          .setColor(0xFFD700) // Gold color
          .setFooter({
            text: `Sent by ${message.author.username}`,
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        return message.channel.send({ embeds: [embed] });
      } catch (err) {
        console.error("Failed to highlight message:", err);
      }
    }


    const userID = message.author.id;
    const guildID = message.guild.id;

    const time = Date.now();
    const cooldown = 2 * 1000; // 2 seconds cooldown
    
    // cooldown system
    if (cooldowns.has(userID)) {
      const expirationTime = cooldowns.get(userID) + cooldown;
      if (time < expirationTime) return; // still on cooldown
    }
    cooldowns.set(userID, time);
    

    // ====== Text message EXP ======
    const expToAdd = Math.floor(Math.random() * (15 - 5 + 1)) + 5; // random 5-15 exp

    expSystem.addExp(userID, guildID, expToAdd, 'chatMult', async (err, result) => {
      if (err) {
        console.error('EXP add error:', err);
        return;
      }
 

      if (result.leveledUp) 
      {
        try {
          const member = await message.guild.members.fetch(userID);
          const levelUpChannel = await message.guild.channels.fetch(levelUpChannelId);

          const level = result.newLevel;
          const userMention = `<@${userID}>`;

          // ====== EXP role check ======
          let roleName = null;
          let newRoleId = null;
          let newRole = null;

          if (roleTitles[level]) {
            roleName = roleTitles[level];
            newRoleId = expRoleMap[roleName];
            newRole = message.guild.roles.cache.get(newRoleId);
          }

          if (mileStoneAnnoucement[level] && levelUpChannel?.isTextBased()) {
            let embedColor = 0x2F3136; // default gray color

            if (newRole) {
              embedColor = newRole.color || embedColor;
            }

            // Milestone announcement embed
            const milestoneEmbed = new EmbedBuilder()
              .setTitle(`${member.displayName} ranked up!`)
              .addFields({ name: '\u200B', value: mileStoneAnnoucement[level].replace('{user}', userMention) })
              .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
              .setColor(embedColor)
              .setFooter({
                text: message.guild.name,
                iconURL: message.guild.iconURL({ dynamic: true }),
              });

            await levelUpChannel.send({ embeds: [milestoneEmbed] });
          } else if (levelUpChannel?.isTextBased()) {
            // Normal level up embed
            const normalLevelUpEmbed = new EmbedBuilder()
              .setTitle(`${member.displayName} level up!`)
              .setDescription('**CONGRATS**')
              .addFields({ name: 'You are now level', value: `${level}` })
              .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
              .setFooter({
                text: message.guild.name,
                iconURL: message.guild.iconURL({ dynamic: true }),
              });

            await levelUpChannel.send({ embeds: [normalLevelUpEmbed] });
          }

          // === Role Management (milestone-aware) ===
          const milestones = Object.keys(roleTitles)
            .map(n => parseInt(n))
            .sort((a, b) => a - b);

          // Find the highest milestone the user has reached
          let milestoneLevel = milestones[0];
          for (const m of milestones) {
            if (level >= m) milestoneLevel = m;
          }

          roleName = roleTitles[milestoneLevel];
          newRoleId = expRoleMap[roleName];
          newRole = message.guild.roles.cache.get(newRoleId);

          if (newRole) {
            // Remove all other EXP roles
            const roleIdsToRemove = Object.values(expRoleMap).filter(
              id => id !== newRoleId && member.roles.cache.has(id)
            );
            if (roleIdsToRemove.length > 0) await member.roles.remove(roleIdsToRemove);

            // Add the new role if user doesn't have it
            if (!member.roles.cache.has(newRoleId)) await member.roles.add(newRoleId);
          }
        } catch (error) {
          console.error('Level-up handling error:', error);
        }
      }
    });
  },
};