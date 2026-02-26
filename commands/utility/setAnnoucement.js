const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { db } = require('../../database/database.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setannouncement')
    .setDescription('Set the server announcement channel.')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('The channel to set as the announcement channel.')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const guildId = interaction.guild.id;

    if (channel.type !== ChannelType.GuildText) {
      return interaction.reply({
        content: '❌ Please select a valid **text** or **announcement** channel.',
        flags: 1<<6
      });
    }

    // ✅ Upsert into your ServerAnnoucement table
    db.run(
      `
      INSERT INTO ServerAnnoucement (guildID, channelID)
      VALUES (?, ?)
      ON CONFLICT(guildID) DO UPDATE SET channelID = excluded.channelID;
      `,
      [guildId, channel.id],
      function (err) {
        if (err) {
          console.error('DB Error:', err);
          return interaction.reply({
            content: '❌ An error occurred while saving the announcement channel.',
            flags: 1<<6
          });
        }

        return interaction.reply({
          content: `✅ Announcement channel set to ${channel}.`,
          flags: 1<<6
        });
      }
    );
  }
};
