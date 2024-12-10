const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("punish")
    .setDescription("Punish a user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user you want to punish.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for the punishment.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("punishment")
        .setDescription("The type of punishment.")
        .setRequired(true)
        .addChoices(
          { name: "Muted", value: "Muted" },
          { name: "Kicked", value: "Kicked" },
          { name: "Banned", value: "Banned" },
          { name: "Warned", value: "Warned" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("The duration of the punishment.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("evidence")
        .setDescription("Provide a link to evidence")
        .setRequired(true)
    ),

  async execute(interaction) {
    const punishmentDetails = {
      user: interaction.options.getUser("user").tag,
      punishment: interaction.options.getString("punishment"),
      duration: interaction.options.getString("duration"),
      reason: interaction.options.getString("reason"),
      evidence: interaction.options.getString("evidence"),
    };

    const punishEmbed = new EmbedBuilder()
      .setTitle("Punishment")
      .setColor("#ff0000")
      .setDescription(
        `**User:** ${punishmentDetails.user}\n` +
          `**Punishment:** ${punishmentDetails.punishment}\n` +
          `**Duration:** ${punishmentDetails.duration}\n` +
          `**Reason:** ${punishmentDetails.reason}\n` +
          `**Evidence:** ${punishmentDetails.evidence}`
      )
      .setFooter({ text: "Punished by " + interaction.user.tag });

    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      return await interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    await interaction.reply({ embeds: [punishEmbed] });
  },
};
