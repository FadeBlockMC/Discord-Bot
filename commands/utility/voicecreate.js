const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("voicecreate")
    .setDescription("Create a voice channel for you and your friends.")
    .addStringOption((option) =>
      option
        .setName("channelname")
        .setDescription("The name of the voice channel")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("channellimit")
        .setDescription("The limit of the voice channel")
        .setMinValue(2)
        .setRequired(false)
    ),
  async execute(interaction) {
    const channelName = interaction.options.getString("channelname");
    const channelLimit = interaction.options.getInteger("channellimit");

    try {
      await interaction.guild.channels.create({
        name: channelName,
        type: "GUILD_VOICE",
        userLimit: channelLimit,
      });

      await interaction.reply({
        content: "Your voice channel was successfully created!",
      });
      return;
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error creating the voice channel.",
        ephemeral: true,
      });
    }
  },
};
