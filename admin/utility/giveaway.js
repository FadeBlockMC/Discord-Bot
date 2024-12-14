const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Start a giveaway!")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("The duration of the giveaway (e.g., 10s, 5m, 1h, 2d)")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("winners")
        .setDescription("The number of winners for the giveaway")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("prize")
        .setDescription("The prize for the giveaway")
        .setRequired(true)
    ),

  async execute(interaction) {
    const duration = interaction.options.getString("duration");
    const winnersCount = interaction.options.getInteger("winners");
    const prize = interaction.options.getString("prize");
    const giveawayChannelId = "1317466265056710686";
    const giveawayChannel =
      interaction.client.channels.cache.get(giveawayChannelId);

    if (!giveawayChannel) {
      return interaction.reply({
        content: `The giveaway channel with ID ${giveawayChannelId} could not be found.`,
        ephemeral: true,
      });
    }

    if (!ms(duration)) {
      return interaction.reply({
        content: "Invalid duration format!",
        ephemeral: true,
      });
    }

    const joinButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("join_giveaway")
        .setLabel("🎉 Join Giveaway")
        .setStyle(ButtonStyle.Primary)
    );

    const giveawayEmbed = new EmbedBuilder()
      .setTitle("🎉 **GIVEAWAY** 🎉")
      .setDescription(
        `Prize: **${prize}**\n\nReact with 🎉 to participate!\nWinners: **${winnersCount}**\nParticipants: **0**\nTime Remaining: **${duration}**\nHosted by: ${interaction.user}`
      )
      .setColor("#00FF00")
      .setTimestamp(Date.now() + ms(duration))
      .setFooter({ text: "Giveaway ends" });

    const giveawayMessage = await giveawayChannel.send({
      embeds: [giveawayEmbed],
      components: [joinButton],
    });

    interaction.reply({
      content: `Giveaway started in <#${giveawayChannelId}>!`,
      ephemeral: true,
    });

    const collector = giveawayMessage.createMessageComponentCollector({
      time: ms(duration),
    });
    const participants = new Set();

    collector.on("collect", async (i) => {
      if (i.customId === "join_giveaway") {
        participants.add(i.user.id);
        await i.reply({
          content: `You've successfully joined the giveaway!`,
          ephemeral: true,
        });

        const updatedEmbed = EmbedBuilder.from(giveawayEmbed).setDescription(
          `Prize: **${prize}**\n\nReact with 🎉 to participate!\nWinners: **${winnersCount}**\nParticipants: **${participants.size}**\nTime Remaining: **${duration}**\nHosted by: ${interaction.user}`
        );

        await giveawayMessage.edit({ embeds: [updatedEmbed] });
      }
    });

    collector.on("end", async () => {
      if (participants.size === 0) {
        return giveawayChannel.send("No participants joined the giveaway!");
      }

      const winners = Array.from(participants)
        .sort(() => Math.random() - Math.random())
        .slice(0, winnersCount);

      if (winners.length === 0) {
        return giveawayChannel.send(
          "Not enough participants for a valid draw!"
        );
      }

      const winnersList = winners.map((userId) => `<@${userId}>`).join(", ");

      const endedEmbed = EmbedBuilder.from(giveawayEmbed)
        .setTitle("🎉 **GIVEAWAY ENDED** 🎉")
        .setDescription(
          `Prize: **${prize}**\n\nWinner(s): ${winnersList}\nWinners: **${winnersCount}**\nParticipants: **${participants.size}**\nHosted by: ${interaction.user}`
        )
        .setColor("#FF0000");

      await giveawayMessage.edit({ embeds: [endedEmbed], components: [] });
      giveawayChannel.send(
        `🎉 Congratulations ${winnersList}! You won **${prize}**! 🎉`
      );
    });
  },
};
