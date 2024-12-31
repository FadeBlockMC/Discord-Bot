const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

const TICKET_CATEGORY_ID = "1299380531468701706";
const LOG_CHANNEL_ID = "1317957125229514832";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticketsetup")
    .setDescription("Setup the ticket system with multiple categories.")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription(
          "The channel where the ticket creation message will be sent."
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("id")
        .setDescription(
          "The custom ID to assign to this ticket setup (e.g., support-tickets)."
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    const setupId = interaction.options.getString("id");

    const ticketButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`create-ticket-${setupId}-general`)
        .setLabel("🎫 General Support")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`create-ticket-${setupId}-reporting`)
        .setLabel("🚨 Player Reporting")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`create-ticket-${setupId}-punishment`)
        .setLabel("⚖️ Punishment Appeals")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`create-ticket-${setupId}-buycraft`)
        .setLabel("🛒 Buycraft Issues")
        .setStyle(ButtonStyle.Success)
    );

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("Need Help? Select a Ticket Category")
          .setDescription(
            "Choose the category that best fits your issue by clicking one of the buttons below."
          )
          .setColor("Blue"),
      ],
      components: [ticketButtons],
    });

    await interaction.reply({
      content: `Ticket system with ID \`${setupId}\` has been set up in ${channel}.`,
      ephemeral: true,
    });
  },
};
