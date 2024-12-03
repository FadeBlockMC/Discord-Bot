const { SlashCommandBuilder, EmbedBuilder, Collection } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("List all of my commands or info about a specific command."),
  async execute(interaction) {
    const commands = interaction.client.commands;
    const helpCommands = new Collection();

    commands.forEach((command) => {
      helpCommands.set(command.data.name, command.data.description);
    });

    const helpFields = helpCommands.map((description, name) => ({
      name: name,
      value: description || 'No description available',
    }));

    const helpEmbed = new EmbedBuilder()
      .setColor("Random")
      .setTitle("Nexy Commands")
      .addFields(helpFields)
      .setTimestamp()
      .setFooter({ text: "https://github.com/Nexy-Development/Nexy" });

    await interaction.reply({ embeds: [helpEmbed] });
  },
};