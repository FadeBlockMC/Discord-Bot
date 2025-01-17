const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Sharkstories = require("../../sharkstories.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shark")
    .setDescription("Replies with a story about a shark"),
  async execute(interaction) {

    const shark = Sharkstories[Math.floor(Math.random() * Sharkstories.length)];

    const sharkEmbed = new EmbedBuilder()
      
      .setColor("Random")
      .setTitle(shark.title)
      .setDescription(shark.story)
      .setTimestamp()
    
    await interaction.reply({ embeds: [sharkEmbed] });
  },
};
