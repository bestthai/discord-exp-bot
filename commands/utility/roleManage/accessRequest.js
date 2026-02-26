const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('access_request')
    .setDescription("Sends an embed with each TheGoddess supported game buttons")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  adminOnly: true,

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: '🚫 You must be an admin to use this command.',
        flags: 1<<6
      });
    }
    
    embed = new EmbedBuilder()
      .setTitle('ʚ✿ Channel Access ✿ɞ')
      .setDescription('Please react below to **gain access to the game channels** in the server.')
      .setColor(0xFFB6C1)
      .setThumbnail('https://www.supercutekawaii.com/wp-content/uploads/pusheen-2.jpg');

    // Manually create buttons with custom IDs and labels
    const button1 = new ButtonBuilder()
      .setCustomId('EHT_member')
      .setLabel('EHT member')
      .setEmoji('👹')
      .setStyle(ButtonStyle.Primary);

    const button2 = new ButtonBuilder()
      .setCustomId('RQ_member')
      .setLabel('RavenQuest member')
      .setEmoji('🧙')
      .setStyle(ButtonStyle.Primary);

    const row1 = new ActionRowBuilder().addComponents(button1, button2);

    await interaction.reply({
      embeds: [embed],
      components: [row1]
    });
  }
};
