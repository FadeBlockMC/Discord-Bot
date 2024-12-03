const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("suggest")
    .setDescription("Submit a suggestion")
    .addStringOption(option => 
      option.setName("message")
        .setDescription("The suggestion message")
        .setRequired(true)),
  async execute(interaction) {
    const message = interaction.options.getString("message");
    const suggestionEmbed = new EmbedBuilder()
      .setTitle("Suggestion")
      .setDescription(message)
      .setFooter({ text: `Suggested by @${interaction.user.tag}`})
      .setColor("#ff0000");

    await interaction.reply({ embeds: [suggestionEmbed] });

    const sentMessage = await interaction.fetchReply();
    await sentMessage.react("👍");
    await sentMessage.react("👎");
  },
};
