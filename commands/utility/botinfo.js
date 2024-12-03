const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Get information about the bot"),
  async execute(interaction) {
    const botInfoEmbed = new EmbedBuilder()
      .setTitle("Bot Information")
      .setThumbnail("https://cdn.discordapp.com/avatars/1292825240430313494/e6d2120c3523728b7b0711b791181679.webp")
      .addFields(
        { name: "Name", value: interaction.client.user.tag, inline: true },
        { name: "Guilds", value: interaction.client.guilds.cache.size.toString(), inline: true },
        { name: "Users", value: interaction.client.users.cache.size.toString(), inline: true },
        { name: "Channels", value: interaction.client.channels.cache.size.toString(), inline: true }
      )
      .setColor("#ff0000");
    await interaction.reply({ embeds: [botInfoEmbed] });
  },
};
