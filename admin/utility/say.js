const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Put your message in an embed.")
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("The title of your message")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The message you want to say")
        .setRequired(true)
    ),
  async execute(interaction) {
    const title = interaction.options.getString("title");
    const message = interaction.options.getString("message");
    const sayEmbed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(message)
      .setColor("#ff0000")
      .setFooter({ text: `Said by ${interaction.user.tag}` });
    
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      return await interaction.reply({
        content: "You do not have the required permissions to use this command.",
        ephemeral: true,
      });
    }
    await interaction.reply({ embeds: [sayEmbed] });
  },
};
