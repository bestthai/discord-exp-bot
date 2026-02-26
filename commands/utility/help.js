const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('List all available slash commands')
    .addStringOption(option =>
      option
        .setName('command')
        .setDescription('The command to get help with')
        .setRequired(false)
    ),

  async execute(interaction) {
    const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
    const commands = interaction.client.commands;
    const commandName = interaction.options.getString('command');

    if (!commandName) {
      // Your existing code for listing all commands
      const embed = new EmbedBuilder()
        .setTitle('📖 Available Commands')
        .setColor(0x00AE86)
        .setDescription(isAdmin
          ? 'Here are all commands you can use (admin included) :'
          : 'Here are the commands available to you:')

      for (const command of [...commands.values()].sort((a, b) => a.data.name.localeCompare(b.data.name))) {
        if (command.adminOnly && !isAdmin) continue; // Skip if admin-only and user is not admin

        embed.addFields({
          name: `/${command.data.name}`,
          value: command.data.description ?? 'No description provided',
          inline: false,
        });
      }

      await interaction.reply({ embeds: [embed], flags: 1 << 6 });
    } 
    
    else 
    {

      // Find the command by name (case-insensitive)
      const command = commands.get(commandName.toLowerCase());

      if (!command) {
        return interaction.reply({
          content: `❌ Command "${commandName}" not found.`,
          flags: 1<<6
        });
      }

      // Check if the command is admin-only and if user lacks permission
      if (command.adminOnly && !isAdmin) {
        return interaction.reply({
          content: '🚫 You do not have permission to view this command.',
          flags: 1<<6
        });
      }

      // Use a detailed description if defined, otherwise fallback
      const detailedDesc = command.detailedDescription ?? 'No detailed description available for this command.';

      const embed = new EmbedBuilder()
        .setTitle(`/${command.data.name}`)
        .setDescription(detailedDesc)
        .setColor(0x00AE86)

      await interaction.reply({ embeds: [embed], flags: 1<<6 });
    }
  }

};
