const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("punish")
    .setDescription("Punish a user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to punish.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("punishment")
        .setDescription("The punishment type.")
        .setRequired(true)
        .addChoices(
          { name: "Muted", value: "Muted" },
          { name: "Kicked", value: "Kicked" },
          { name: "Banned", value: "Banned" },
          { name: "Warned", value: "Warned" }
        )
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("The reason.").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("Duration for mutes, warnings or bans")
    ),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    const user = interaction.options.getUser("user");
    const punishment = interaction.options.getString("punishment");
    const reason = interaction.options.getString("reason");
    const duration = interaction.options.getString("duration");
    const member = interaction.guild.members.cache.get(user.id);
    const logChannel = interaction.guild.channels.cache.find(
      (channel) => channel.name === "discord-punishments"
    );

    if (!logChannel) {
      return interaction.reply({
        content:
          "No log channel found. Please create a channel named 'discord-punishments'.",
        ephemeral: true,
      });
    }

    let logEmbed;

    if (punishment === "Muted") {
      const muteRole = interaction.guild.roles.cache.find(
        (role) => role.name === "Muted"
      );

      if (!muteRole) {
        return interaction.reply({
          content: "Muted role not found. Please create a role named 'Muted'.",
          ephemeral: true,
        });
      }

      if (member) {
        await member.roles.add(muteRole);
        logEmbed = new EmbedBuilder()
          .setTitle("User Muted")
          .setColor("#ff9900")
          .setDescription(
            `**Muted User**: ${`<@${user.id}>`}\n**Reason**: ${reason}\n**Duration**: ${
              duration ||
              "No duration given\n"`**Muted by** <@${interaction.user.id}>`
            }`
          )
          .setFooter({ text: `Muted by <@${interaction.user.id}>` });

        logChannel.send({ embeds: [logEmbed] });

        try {
          await user.send({ embeds: [logEmbed] });
        } catch {
          interaction.reply({
            content: `Could not DM ${user.tag} about their mute.`,
            ephemeral: true,
          });
        }

        setTimeout(
          () => {
            member.roles.remove(muteRole);
          },
          duration ? ms(duration) : 0
        );

        return interaction.reply({
          content: `${user.tag} has been muted successfully.`,
          ephemeral: true,
        });
      }
    }

    try {
      if (punishment === "Warned") {
        logEmbed = new EmbedBuilder()
          .setTitle("User Warned")
          .setColor("#ffcc00")
          .setDescription(
            `**Muted User**: ${`<@${user.id}>`}\n**Reason**: ${reason}\n**Duration**: ${
              duration ||
              "No duration given\n"`**Muted by** <@${interaction.user.id}>`
            }`
          )
          .setFooter({ text: `Warned by ${interaction.user.tag}` });

        logChannel.send({ embeds: [logEmbed] });

        await user.send({ embeds: [logEmbed] });

        return interaction.reply({
          content: `${user.tag} has been warned successfully.`,
          ephemeral: true,
        });
      }

      if (punishment === "Kicked") {
        if (member) {
          await member.kick(reason);

          logEmbed = new EmbedBuilder()
            .setTitle("User Kicked")
            .setColor("#ff3300")
            .setDescription(
              `**Kicked User**:<@${user.id}>\n**Reason**: ${reason}\n**Muted by** <@${interaction.user.id}>`
            )
            .setFooter({ text: `Kicked by ${interaction.user.tag}` });

          logChannel.send({ embeds: [logEmbed] });
          await user.send({ embeds: [logEmbed] });

          return interaction.reply({
            content: `${user.tag} has been kicked successfully.`,
            ephemeral: true,
          });
        }
      }

      if (punishment === "Banned") {
        if (member) {
          await member.ban({ reason });

          logEmbed = new EmbedBuilder()
            .setTitle("User Banned")
            .setColor("#ff0000")
            .setDescription(
              `**Banned User**:<@${user.id}>\n**Reason**: ${reason}\n**Banned by** <@${interaction.user.id}>`
            )
            .setFooter({ text: `Banned by ${interaction.user.tag}` });

          logChannel.send({ embeds: [logEmbed] });
          await user.send({ embeds: [logEmbed] });

          return interaction.reply({
            content: `${user.tag} has been banned successfully.`,
            ephermeral: true,
          });
        }
      }

      await user.send({ embeds: [logEmbed] });

      return interaction.reply({
        content:
          "Action could not be completed. Check if the user is in the server.",
      });
    } catch (error) {
      console.error(error);

      return interaction.reply({
        content: "An error occurred while executing the command.",
      });
    }
  },
};
