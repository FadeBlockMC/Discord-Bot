const {
  Events,
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const fs = require("fs");

const TICKET_CATEGORY_ID = "1299380531468701706";
const LOG_CHANNEL_ID = "1317957125229514832";
const claimedTickets = new Map();

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;

    if (interaction.customId.startsWith("create-ticket")) {
      const [_, setupId, ticketType] = interaction.customId.split("-");

      const ticketNames = {
        general: "general-support",
        reporting: "player-reporting",
        punishment: "punishment-appeal",
        buycraft: "buycraft-issues",
      };

      const ticketDescriptions = {
        general: "Our team will assist you with general support inquiries.",
        reporting:
          "Please describe the issue and the player you are reporting.",
        punishment: "Explain why you are appealing your punishment.",
        buycraft: "Provide details about your Buycraft issue or purchase.",
      };

      const ticketChannelName = `${ticketNames[ticketType]}-${
        interaction.user.username
      }-${Date.now()}`;

      const ticketChannel = await interaction.guild.channels.create({
        name: ticketChannelName,
        type: ChannelType.GuildText,
        parent: TICKET_CATEGORY_ID,
        topic: `Ticket for ${interaction.user.id} (${ticketType})`,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
            ],
          },
          {
            id: interaction.client.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.ManageChannels,
            ],
          },
        ],
      });

      const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`claim-ticket-${ticketChannel.id}`)
          .setLabel("👤 Claim Ticket")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`close-ticket-${ticketChannel.id}`)
          .setLabel("🔒 Close Ticket")
          .setStyle(ButtonStyle.Danger)
      );

      await ticketChannel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Welcome to your ${ticketType} ticket`)
            .setDescription(ticketDescriptions[ticketType])
            .setColor("Green")
            .setTimestamp(),
        ],
        components: [actionRow],
      });

      await interaction.reply({
        content: `Your ${ticketType} ticket has been created: <#${ticketChannel.id}>`,
        ephemeral: true,
      });
    }

    if (interaction.customId.startsWith("claim-ticket")) {
      const ticketChannelId = interaction.customId.split("-")[2];
      const ticketChannel =
        interaction.guild.channels.cache.get(ticketChannelId);

      if (claimedTickets.has(ticketChannelId)) {
        return interaction.reply({
          content:
            "This ticket has already been claimed by another staff member.",
          ephemeral: true,
        });
      }

      claimedTickets.set(ticketChannelId, interaction.user.id);

      await ticketChannel.send({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `This ticket has been claimed by <@${interaction.user.id}>.`
            )
            .setColor("Yellow"),
        ],
      });

      await interaction.reply({
        content: "You have successfully claimed this ticket.",
        ephemeral: true,
      });
    }

    if (interaction.customId.startsWith("close-ticket")) {
      const ticketChannelId = interaction.customId.split("-")[2];
      const ticketChannel =
        interaction.guild.channels.cache.get(ticketChannelId);

      if (!ticketChannel) {
        return interaction.reply({
          content: "Ticket channel not found.",
          ephemeral: true,
        });
      }

      const messages = await ticketChannel.messages.fetch({ limit: 100 });
      const transcript = messages
        .map((msg) => `${msg.author.tag}: ${msg.content}`)
        .reverse()
        .join("\n");

      const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
      const transcriptFileName = `transcript-${ticketChannel.name}.txt`;

      fs.writeFileSync(transcriptFileName, transcript);
      await logChannel.send({
        content: `Transcript for ticket ${ticketChannel.name}:`,
        files: [transcriptFileName],
      });

      fs.unlinkSync(transcriptFileName);
      await ticketChannel.delete();

      await interaction.reply({
        content:
          "Ticket has been closed and the transcript has been sent to the log channel.",
        ephemeral: true,
      });
    }
  },
};
