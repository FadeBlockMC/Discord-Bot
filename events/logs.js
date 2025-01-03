const { Events, EmbedBuilder, AuditLogEvent } = require("discord.js");

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
      joinLeaveLogs: "1301248839981862985",
    };

    async function fetchLogChannel(channelType) {
      const channelId = logChannels[channelType];
      if (!channelId) return null;
      const channel = await client.channels.fetch(channelId).catch(() => null);
      return channel;
    }

    client.on(Events.GuildMemberAdd, async (member) => {
      const logChannel = await fetchLogChannel("joinLeaveLogs");
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setTitle("✅ Member Joined")
        .setDescription(`<@${member.id}> joined the server.`)
        .addFields(
          { name: "Username", value: `${member.user.tag}`, inline: true },
          { name: "User ID", value: `${member.id}`, inline: true },
          {
            name: "Account Created",
            value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
            inline: true,
          }
        )
        .setColor("#00FF00")
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      const invites = await member.guild.invites.fetch().catch(() => null);
      if (invites) {
        for (const invite of invites.values()) {
          if (invite.uses > 0) {
            embed.addFields({
              name: "Invite Used",
              value: `Code: ${invite.code}\nCreated by: <@${invite.inviter.id}>`,
              inline: false,
            });
            break;
          }
        }
      }

      logChannel.send({ embeds: [embed] });
    });

    client.on(Events.GuildMemberRemove, async (member) => {
      const logChannel = await fetchLogChannel("joinLeaveLogs");
      if (!logChannel) return;

      const roles =
        member.roles.cache
          .filter((role) => role.name !== "@everyone")
          .map((role) => `<@&${role.id}>`)
          .join(", ") || "No roles";

      const embed = new EmbedBuilder()
        .setTitle("❌ Member Left")
        .setDescription(`<@${member.id}> left the server.`)
        .addFields(
          { name: "Username", value: `${member.user.tag}`, inline: true },
          { name: "User ID", value: `${member.id}`, inline: true },
          {
            name: "Joined At",
            value: member.joinedAt
              ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>`
              : "Unknown",
            inline: true,
          },
          { name: "Roles", value: roles, inline: false }
        )
        .setColor("#FF0000")
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    });

    client.on(Events.InviteCreate, async (invite) => {
      const logChannel = await fetchLogChannel("serverLogs");
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setTitle("🔗 Invite Created")
        .setDescription(`An invite link was created in <#${invite.channel.id}>`)
        .addFields(
          { name: "Code", value: invite.code, inline: true },
          { name: "Channel", value: `<#${invite.channel.id}>`, inline: true },
          {
            name: "Creator",
            value: `<@${invite.inviter?.id || "Unknown"}>`,
            inline: true,
          },
          {
            name: "Max Uses",
            value: invite.maxUses === 0 ? "Unlimited" : `${invite.maxUses}`,
            inline: true,
          },
          {
            name: "Expires At",
            value:
              invite.expiresAt === null
                ? "Never"
                : `<t:${Math.floor(invite.expiresAt / 1000)}:R>`,
            inline: true,
          }
        )
        .setColor("#00FF00")
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

    client.on(Events.ChannelUpdate, async (oldChannel, newChannel) => {
      const logChannel = await fetchLogChannel("channelLogs");
      if (!logChannel) return;

      const guild = newChannel.guild;
      const auditLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.ChannelUpdate,
      });

      const auditEntry = auditLogs.entries.first();
      const executor = auditEntry ? auditEntry.executor : null;

      const embed = new EmbedBuilder()
        .setTitle("🔧 Channel Updated")
        .setDescription(`Channel <#${newChannel.id}> was updated.`)
        .setColor("#FFFF00")
        .setTimestamp();

      if (oldChannel.name !== newChannel.name) {
        embed.addFields(
          { name: "Old Name", value: `${oldChannel.name}`, inline: true },
          { name: "New Name", value: `${newChannel.name}`, inline: true }
        );
      }

      // Compare Permission Overwrites
      const oldPerms = oldChannel.permissionOverwrites.cache;
      const newPerms = newChannel.permissionOverwrites.cache;
      const permissionChanges = [];

      newPerms.forEach((newPerm, id) => {
        const oldPerm = oldPerms.get(id);

        if (!oldPerm) {
          permissionChanges.push(
            `🔹 **New Permission Overwrite Added** for <@&${id}>\nAllowed: ${
              newPerm.allow.toArray().join(", ") || "None"
            }\nDenied: ${newPerm.deny.toArray().join(", ") || "None"}`
          );
        } else {
          // Compare old and new permissions
          const addedPerms = newPerm.allow
            .toArray()
            .filter((perm) => !oldPerm.allow.has(perm));
          const removedPerms = oldPerm.allow
            .toArray()
            .filter((perm) => !newPerm.allow.has(perm));
          const addedDenied = newPerm.deny
            .toArray()
            .filter((perm) => !oldPerm.deny.has(perm));
          const removedDenied = oldPerm.deny
            .toArray()
            .filter((perm) => !newPerm.deny.has(perm));

          if (addedPerms.length > 0) {
            permissionChanges.push(
              `✅ **Permissions Allowed Added** for <@&${id}>: ${addedPerms.join(
                ", "
              )}`
            );
          }
          if (removedPerms.length > 0) {
            permissionChanges.push(
              `❌ **Permissions Allowed Removed** for <@&${id}>: ${removedPerms.join(
                ", "
              )}`
            );
          }
          if (addedDenied.length > 0) {
            permissionChanges.push(
              `❌ **Permissions Denied Added** for <@&${id}>: ${addedDenied.join(
                ", "
              )}`
            );
          }
          if (removedDenied.length > 0) {
            permissionChanges.push(
              `✅ **Permissions Denied Removed** for <@&${id}>: ${removedDenied.join(
                ", "
              )}`
            );
          }
        }
      });

      if (permissionChanges.length > 0) {
        embed.addFields({
          name: "Permission Changes",
          value: permissionChanges.join("\n"),
        });
      }

      if (executor) {
        embed.setFooter({
          text: `Updated by ${executor.tag}`,
          iconURL: executor.displayAvatarURL(),
        });
      }

      logChannel.send({ embeds: [embed] });
    });

    client.on(Events.GuildRoleUpdate, async (oldRole, newRole) => {
      const logChannel = await fetchLogChannel("serverLogs");
      if (!logChannel) return;

      const fetchedLogs = await newRole.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.RoleUpdate,
      });

      const roleLog = fetchedLogs.entries.find(
        (entry) => entry.target.id === newRole.id
      );
      const executor = roleLog ? roleLog.executor : null;

      const embed = new EmbedBuilder()
        .setTitle("🔧 Role Updated")
        .setDescription(`Role **${newRole.name}** was updated.`)
        .setColor("#FFFF00")
        .setTimestamp();

      if (executor) {
        embed.setFooter({
          text: `Updated by: ${executor.tag}`,
          iconURL: executor.displayAvatarURL(),
        });
      }

      if (oldRole.name !== newRole.name) {
        embed.addFields(
          { name: "Old Name", value: oldRole.name, inline: true },
          { name: "New Name", value: newRole.name, inline: true }
        );
      }

      if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
        const addedPermissions = newRole.permissions
          .toArray()
          .filter((perm) => !oldRole.permissions.has(perm));
        const removedPermissions = oldRole.permissions
          .toArray()
          .filter((perm) => !newRole.permissions.has(perm));

        if (addedPermissions.length > 0) {
          embed.addFields({
            name: "Added Permissions",
            value: addedPermissions.join(", "),
          });
        }

        if (removedPermissions.length > 0) {
          embed.addFields({
            name: "Removed Permissions",
            value: removedPermissions.join(", "),
          });
        }
      }

      logChannel.send({ embeds: [embed] });
    });

    client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
      const logChannel = await fetchLogChannel("voiceLogs");
      if (!logChannel) return;

      if (oldState.channelId !== newState.channelId) {
        const embed = new EmbedBuilder()
          .setTitle(
            newState.channelId
              ? "🎙️ Voice Channel Joined"
              : "🎙️ Voice Channel Left"
          )
          .setDescription(
            newState.channelId
              ? `<@${newState.member.user.id}> joined <#${newState.channel.id}>`
              : `<@${oldState.member.user.id}> left <#${oldState.channel.id}>`
          )
          .setColor(newState.channelId ? "#00FF00" : "#FF0000")
          .setTimestamp();

        logChannel.send({ embeds: [embed] });
      }
    });
  },
};
