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

const LOG_CHANNEL_ID = "1317957125229514832";
const claimedTickets = new Map();

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const [action, setupId, ticketType] = interaction.customId.split("-");

    try {
      if (action === "create") {
        await handleCreateTicket(interaction, ticketType);
      } else if (action === "claim") {
        await handleClaimTicket(interaction);
      } else if (action === "close") {
        await handleCloseTicket(interaction);
      } else {
        await interaction.reply({
          content: "Invalid action or ticket type.",
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error("Error handling interaction:", error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "An error occurred while processing your request.",
          ephemeral: true,
        });
      }
    }
  },
};

async function handleCreateTicket(interaction, ticketType) {
  const ticketNames = {
    general: "general-support",
    reporting: "player-reporting",
    punishment: "punishment-appeal",
    buycraft: "buycraft-issues",
  };

  const resolvedTicketType = ticketNames[ticketType];
  if (!resolvedTicketType) {
    return interaction.reply({
      content: `Invalid ticket type selected: \`${ticketType}\`.`,
      ephemeral: true,
    });
  }

  const ticketChannelName = `${resolvedTicketType}-${interaction.user.username}`;

  try {
    const ticketChannel = await interaction.guild.channels.create({
      name: ticketChannelName,
      type: ChannelType.GuildText,
      parent: interaction.channel.parentId,
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
        .setCustomId(`claim-${ticketChannel.id}`)
        .setLabel("👤 Claim Ticket")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`close-${ticketChannel.id}`)
        .setLabel("🔒 Close Ticket")
        .setStyle(ButtonStyle.Danger)
    );

    await ticketChannel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(`Welcome to your ${resolvedTicketType} ticket`)
          .setDescription(
            `Hello <@${interaction.user.id}>, please explain your issue in detail. A staff member will assist you shortly.`
          )
          .setColor("Green"),
      ],
      components: [actionRow],
    });

    await interaction.reply({
      content: `Your ${resolvedTicketType} ticket has been created: <#${ticketChannel.id}>.`,
      ephemeral: true,
    });
  } catch (error) {
    console.error("Error creating ticket channel:", error);
    await interaction.reply({
      content: "Failed to create the ticket. Please contact an administrator.",
      ephemeral: true,
    });
  }
}

async function handleClaimTicket(interaction) {
  const ticketChannelId = interaction.customId.split("-")[1];
  const ticketChannel = interaction.guild.channels.cache.get(ticketChannelId);

  if (!ticketChannel) {
    return interaction.reply({
      content: "Ticket channel not found.",
      ephemeral: true,
    });
  }

  if (claimedTickets.has(ticketChannelId)) {
    return interaction.reply({
      content: "This ticket has already been claimed by another staff member.",
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

async function handleCloseTicket(interaction) {
  const ticketChannelId = interaction.customId.split("-")[1];
  const ticketChannel = interaction.guild.channels.cache.get(ticketChannelId);

  if (!ticketChannel) {
    return interaction.reply({
      content: "Ticket channel not found.",
      ephemeral: true,
    });
  }

  try {
    const messages = await ticketChannel.messages.fetch({ limit: 100 });
    const transcript = messages
      .map((msg) => `${msg.author.tag}: ${msg.content}`)
      .reverse()
      .join("\n");

    const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

    if (!logChannel) {
      return interaction.reply({
        content: "Log channel not found. Please contact an administrator.",
        ephemeral: true,
      });
    }

    const transcriptFileName = `transcript-${ticketChannel.name}.txt`;
    fs.writeFileSync(transcriptFileName, transcript);

    await ticketChannel.send({
      embeds: [
        new EmbedBuilder()
          .setDescription("This ticket will now be closed.")
          .setColor("Red"),
      ],
    });

    await interaction.reply({
      content: "The ticket is being closed. Please wait...",
      ephemeral: true,
    });

    setTimeout(async () => {
      await logChannel.send({
        content: `Transcript for ticket ${ticketChannel.name}:`,
        files: [transcriptFileName],
      });
      fs.unlinkSync(transcriptFileName);
      await ticketChannel.delete();
    }, 2000);
  } catch (error) {
    console.error("Error closing ticket:", error);
    await interaction.reply({
      content:
        "An error occurred while closing the ticket. Please contact an administrator.",
      ephemeral: true,
    });
  }
}
