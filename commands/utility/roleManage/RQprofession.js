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
    .setName('rq_profession')
    .setDescription("Sends an embed with each RQ's profession buttons")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  adminOnly: true,

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: '🚫 You must be an admin to use this command.',
        flags: 1<<6
      });
    }
    
    const embed = new EmbedBuilder()
      .setTitle('ʚ✿ Profession ✿ɞ')
      .setDescription('Please select your main **profession(s)** by reacting to the buttons below.')
      .setColor(0xFFB6C1);

    // Manually create buttons with custom IDs and labels
    const button1 = new ButtonBuilder()
      .setCustomId('RQ_Mining')
      .setLabel('Mining')
      .setEmoji('⛏️')
      .setStyle(ButtonStyle.Primary);

    const button2 = new ButtonBuilder()
      .setCustomId('RQ_Herbalism')
      .setLabel('Herbalism')
      .setEmoji('🌿')
      .setStyle(ButtonStyle.Primary);

      const button3 = new ButtonBuilder()
      .setCustomId('RQ_Woodcutting')
      .setLabel('Woodcutting')
      .setEmoji('🪵')
      .setStyle(ButtonStyle.Primary);

      const button4 = new ButtonBuilder()
      .setCustomId('RQ_Farming')
      .setLabel('Farming')
      .setEmoji('🧑‍🌾')
      .setStyle(ButtonStyle.Primary);

      const button5 = new ButtonBuilder()
      .setCustomId('RQ_Husbandry')
      .setLabel('Husbandry')
      .setEmoji('🐮')
      .setStyle(ButtonStyle.Primary);

      const button6 = new ButtonBuilder()
      .setCustomId('RQ_Fishing')
      .setLabel('Fishing')
      .setEmoji('🎣')
      .setStyle(ButtonStyle.Primary);

      const button7 = new ButtonBuilder()
      .setCustomId('RQ_Blacksmith')
      .setLabel('Blacksmith')
      .setEmoji('🛠️')
      .setStyle(ButtonStyle.Primary);

      const button8 = new ButtonBuilder()
      .setCustomId('RQ_Carpentry')
      .setLabel('Carpentry')
      .setEmoji('🪚')
      .setStyle(ButtonStyle.Primary);

      const button9 = new ButtonBuilder()
      .setCustomId('RQ_Weaving')
      .setLabel('Weaving')
      .setEmoji('🧵')
      .setStyle(ButtonStyle.Primary);

      const button10 = new ButtonBuilder()
      .setCustomId('RQ_Cooking')
      .setLabel('Cooking')
      .setEmoji('🍳')
      .setStyle(ButtonStyle.Primary);

      const button11 = new ButtonBuilder()
      .setCustomId('RQ_Breeding')
      .setLabel('Breeding')
      .setEmoji('🪺')
      .setStyle(ButtonStyle.Primary);

      const button12 = new ButtonBuilder()
      .setCustomId('RQ_Alchemy')
      .setLabel('Alchemy')
      .setEmoji('⚗️')
      .setStyle(ButtonStyle.Primary);

    // Split into rows (up to 5 per row)
    const row1 = new ActionRowBuilder().addComponents(button1, button2, button3, button4, button5);
    const row2 = new ActionRowBuilder().addComponents(button6,button7,button8,button9,button10);
    const row3 = new ActionRowBuilder().addComponents(button11,button12);

    await interaction.reply({
      embeds: [embed],
      components: [row1, row2, row3]
    });
  }
};
