const { Events, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    const logChannels = {
      userLogs: "1312519757819285554",
      voiceLogs: "1301248874832465972",
      serverLogs: "1323675884607111309",
      messageLogs: "1312519486427103253",
      channelLogs: "1317489416759148605",
      join_leaveLogs: "1301248839981862985",
    };

    const fetchLogChannel = async (type) => {
      try {
        const channelId = logChannels[type];
        if (!channelId) {
          console.warn(`Geen kanaal-ID ingesteld voor ${type}.`);
          return null;
        }
        const channel = await client.channels.fetch(channelId);
        return channel;
      } catch (error) {
        console.error(
          `Fout bij ophalen van logkanaal voor ${type}: ${error.message}`
        );
        return null;
      }
    };

    client.on(Events.MessageDelete, async (message) => {
      const logChannel = await fetchLogChannel("messageLogs");

      const embed = new EmbedBuilder()
        .setTitle("🗑️ Message Deletion")
        .setDescription(
          `<@${message.author.id}> Has deleted a message in <#${message.channel.id}>`
        )
        .addFields({
          name: "Message:",
          value: message.content,
        })
        .setColor("#FF0000")
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    });

    client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
      const logChannel = await fetchLogChannel("messageLogs");

      const embed = new EmbedBuilder()
        .setTitle("✏️ Message Edit")
        .setDescription(
          `<@${oldMessage.author.id}> Has edited a message in <#${oldMessage.channel.id}>`
        )
        .addFields(
          {
            name: "Old message",
            value: oldMessage.content,
            inline: false,
          },
          {
            name: "New message",
            value: newMessage.content || "No content",
            inline: false,
          }
        )
        .setColor("#FFFF00")
        .setThumbnail(oldMessage.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    });

    // client.on(Events.ChannelCreate, async (channel) => {
    //   const logChannel = await fetchLogChannel("channelLogs");

    //   const embed = new EmbedBuilder()
    //     .setTitle("➕ Channel created")
    //     .setDescription(`The channel <#${channel.id}> has been created.`)
    //     .addFields(
    //       { name: "name", value: `${channel.name}`, inline: false },
    //       { name: "Type", value: `${channel.type}`, inline: false },
    //       { name: "ChannelID", value: `${channel.id}`, inline: false }
    //     )
    //     .setColor("#00FF00")
    //     .setTimestamp();

    //   logChannel.send({ embeds: [embed] });
    // });

    client.on(Events.ChannelUpdate, async (oldChannel, newChannel) => {
      const logChannel = await fetchLogChannel("channelLogs");

      const embed = new EmbedBuilder()
        .setTitle("🔧 Channel updated")
        .setDescription(`The channel <#${newChannel.id}> has been updated.`)
        .addFields(
          { name: "Old name", value: `${oldChannel.name}`, inline: true },
          { name: "New name", value: `${newChannel.name}`, inline: true }
          // Maybe add something with permissions
        )
        .setColor("#FFFF00")
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    });

    client.on(Events.ChannelDelete, async (channel) => {
      const logChannel = await fetchLogChannel("channelLogs");

      const embed = new EmbedBuilder()
        .setTitle("❌ Channel deleted")
        .setDescription(`The channel **${channel.name}** has been deleted.`)
        .addFields(
          { name: "Name", value: `${channel.name}`, inline: false },
          { name: "Type", value: `${channel.type}`, inline: false },
          { name: "ChannelID", value: `${channel.id}`, inline: false }
        )
        .setColor("#FF0000")
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    });

    client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
      const logChannel = await fetchLogChannel("voiceLogs");
      if (!logChannel) return;

      if (oldState.channelId !== newState.channelId) {
        const embed = new EmbedBuilder()
          .setTitle(
            newState.channelId
              ? "🎙️ Voice channel joined"
              : "🎙️ Voice channel leaved"
          )
          .setDescription(
            newState.channelId
              ? `<@${newState.member.user.id}> has <#${newState.channel.id}> joined.`
              : `<@${oldState.member.user.id}> has <#${oldState.channel.id}> leaved.`
          )
          .setColor(newState.channelId ? "#00FF00" : "#FF0000")
          .setThumbnail(
            newState.member?.user.displayAvatarURL({ dynamic: true }) ||
              oldState.member?.user.displayAvatarURL({ dynamic: true })
          )
          .setTimestamp();

        logChannel.send({ embeds: [embed] });
      }
    });

    // client.on(Events.InviteCreate, async (invite) => {
    //   const logChannel = await fetchLogChannel("serverLogs");
    //   if (!logChannel) return;

    //   const embed = new EmbedBuilder()
    //     .setTitle("🔗 Invite created")
    //     .setDescription(`Invite created by <@${invite.inviter.id}>.`)
    //     .addFields(
    //       { name: "Code", value: invite.code, inline: true },
    //       { name: "Channel", value: `<#${invite.channel.id}>`, inline: true }
    //     )
    //     .setColor("#00FF00")
    //     .setTimestamp();

    //   logChannel.send({ embeds: [embed] });
    // });

    client.on(Events.GuildRoleUpdate, async (oldRole, newRole) => {
      if (
        oldRole.name === newRole.name &&
        oldRole.permissions.bitfield === newRole.permissions.bitfield
      ) {
        return;
      }

      const logChannel = await fetchLogChannel("serverLogs");

      const embed = new EmbedBuilder()
        .setTitle("🔧 Rol edited")
        .setDescription(`Role **${newRole.name}** has been edited.`)
        .setColor("#FFFF00")
        .setTimestamp();

      if (oldRole.name !== newRole.name) {
        embed.addFields(
          { name: "Old name", value: oldRole.name, inline: true },
          { name: "New name", value: newRole.name, inline: true }
        );
      }

      if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
        embed.addFields({
          name: "Permissions had been modified",
          value: "Permissions had been modified",
          inline: false,
        });
      }

      logChannel.send({ embeds: [embed] });
    });

    client.on(Events.GuildRoleDelete, async (role) => {
      const logChannel = await fetchLogChannel("serverLogs");
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setTitle("❌ Rol deleted")
        .setDescription(`Role **${role.name}** has been deleted.`)
        .setColor("#FF0000")
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    });

    client.on(Events.GuildRoleCreate, async (role) => {
      const logChannel = await fetchLogChannel("serverLogs");
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setTitle("➕ Rol created")
        .setDescription(`Role **${role.name}** has been created.`)
        .setColor("#00FF00")
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    });

    client.on(Events.GuildMemberAdd, async (member) => {
      const logChannel = await fetchLogChannel("join_leaveLogs");
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setTitle("✅ New member")
        .setDescription(`<@${member.id}> has joined the server`)
        .setColor("#00FF00")
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    });

    client.on(Events.GuildMemberRemove, async (member) => {
      const logChannel = await fetchLogChannel("join_leaveLogs");
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setTitle("❌ Member left")
        .setDescription(`<@${member.id}> has left the server.`)
        .setColor("#FF0000")
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    });
  },
};
