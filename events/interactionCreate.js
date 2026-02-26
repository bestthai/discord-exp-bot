const { Events, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const roleMap = require('../data/roleMap');

const { db } = require('../database/database');

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction) {
    // --- slash commands ---
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return console.error(`No command matching ${interaction.commandName} was found.`);
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        const content = 'There was an error while executing this command!';
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content, flags: 1 << 6 });
        } else {
          await interaction.reply({ content, flags: 1 << 6 });
        }
      }
    }

    // --- button interaction (roles) ---
    if (interaction.isButton()) {
      const roleId = roleMap[interaction.customId];
      if (!roleId) return;

      const role = interaction.guild.roles.cache.get(roleId);
      const member = interaction.member;

      if (!role) {
        return interaction.reply({
          embeds: [{ description: '⚠️ Role not found.', color: 0xff9d00 }],
          flags: 1 << 6,
        });
      }

      try {
        if (member.roles.cache.has(roleId)) {
          await member.roles.remove(roleId);
          await interaction.reply({
            embeds: [{ description: `❌ Removed **${role.name}** role.`, color: 0xd1001f }],
            flags: 1 << 6,
          });
        } else {
          await member.roles.add(roleId);
          await interaction.reply({
            embeds: [{ description: `✅ Added **${role.name}** role.`, color: 0x86dc3d }],
            flags: 1 << 6,
          });
        }
      } catch (error) {
        console.error(error);
        await interaction.reply({
          embeds: [{ description: '🚫 Failed to update your roles.', color: 0xd1001f }],
          flags: 1 << 6,
        });
      }
    }     
  }
};

