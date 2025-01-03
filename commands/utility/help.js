const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get information about the Minecraft server."),
  async execute(interaction) {
    const serverName = "FadeBlocksMC";
    const serverIP = "play.Fadeblocks.com";
    const serverVersion = "1.20.1";
    const serverDescription = "A fun survival and creative Minecraft server!";
    // const websiteLink = "https://www.myserver.com";

    const embed = {
      title: `${serverName} Information`,
      description: `Here is the information about our Minecraft server:`,
      fields: [
        {
          name: "🌐 Server IP",
          value: `\`${serverIP}\``,
          inline: false,
        },
        {
          name: "🛠️ Version",
          value: `${serverVersion}`,
          inline: false,
        },
        {
          name: "📜 Description",
          value: `${serverDescription}`,
          inline: false,
        },
        // {
        //   name: "🔗 Website",
        //   value: `[Visit here](${websiteLink})`,
        //   inline: false,
        // },
      ],
      color: 0x00ff00,
      footer: {
        text: "Happy Crafting!",
      },
      timestamp: new Date(),
    };

    await interaction.reply({ embeds: [embed] });
  },
};
