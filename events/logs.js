const { Events, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    const logChannels = {
      userLogs: "1312519757819285554",
      voiceLogs: "1301248874832465972",
      serverLogs: "1312519350653026414",
      messageLogs: "1312519486427103253",
      channelLogs: "1317489416759148605",
      roleLogs: "1312519350653026414",
      banLogs: "1312519757819285554", 
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

    // Member Join & Leave Logs
    client.on(Events.GuildMemberAdd, async (member) => {
      const logChannel = await fetchLogChannel("userLogs");
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setTitle("✅ Nieuw Lid")
        .setDescription(`<@${member.id}> is de server gejoined.`)
        .setColor("#00FF00")
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    });

    client.on(Events.GuildMemberRemove, async (member) => {
      const logChannel = await fetchLogChannel("userLogs");
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setTitle("❌ Lid Vertrokken")
        .setDescription(`<@${member.id}> heeft de server verlaten.`)
        .setColor("#FF0000")
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    });

    // Role & Permission Logs
    client.on(Events.GuildRoleCreate, async (role) => {
      const logChannel = await fetchLogChannel("roleLogs");
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setTitle("➕ Rol Aangemaakt")
        .setDescription(`Rol **${role.name}** is aangemaakt.`)
        .setColor("#00FF00")
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    });

    client.on(Events.GuildRoleDelete, async (role) => {
      const logChannel = await fetchLogChannel("roleLogs");
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setTitle("❌ Rol Verwijderd")
        .setDescription(`Rol **${role.name}** is verwijderd.`)
        .setColor("#FF0000")
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    });

    client.on(Events.GuildRoleUpdate, async (oldRole, newRole) => {
      const logChannel = await fetchLogChannel("roleLogs");
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setTitle("🔧 Rol Bijgewerkt")
        .setDescription(`Rol **${newRole.name}** is aangepast.`)
        .setColor("#FFFF00")
        .setTimestamp();

      if (oldRole.name !== newRole.name) {
        embed.addFields(
          { name: "Oude Naam", value: oldRole.name, inline: true },
          { name: "Nieuwe Naam", value: newRole.name, inline: true }
        );
      }

      if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
        embed.addFields({
          name: "Permissies Gewijzigd",
          value: "Permissies zijn aangepast.",
          inline: false,
        });
      }

      logChannel.send({ embeds: [embed] });
    });

    // Ban & Unban Logs
    client.on(Events.GuildBanAdd, async (ban) => {
      const logChannel = await fetchLogChannel("banLogs");
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setTitle("🔨 Gebruiker Gebanned")
        .setDescription(`Gebruiker **${ban.user.tag}** is verbannen.`)
        .setColor("#FF0000")
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    });

    client.on(Events.GuildBanRemove, async (ban) => {
      const logChannel = await fetchLogChannel("banLogs");
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setTitle("🛡️ Ban Opgeheven")
        .setDescription(`Ban van gebruiker **${ban.user.tag}** is opgeheven.`)
        .setColor("#00FF00")
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    });

    // Boost Logs
    client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
      const logChannel = await fetchLogChannel("serverLogs");
      if (!logChannel) return;

      if (!oldMember.premiumSince && newMember.premiumSince) {
        const embed = new EmbedBuilder()
          .setTitle("💎 Server Geboost")
          .setDescription(`<@${newMember.id}> heeft de server geboost!`)
          .setColor("#00FFFF")
          .setTimestamp();

        logChannel.send({ embeds: [embed] });
      }
    });

    // Invite Logs
    client.on(Events.InviteCreate, async (invite) => {
      const logChannel = await fetchLogChannel("channelLogs");
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setTitle("🔗 Invite Aangemaakt")
        .setDescription(`Invite aangemaakt door <@${invite.inviter.id}>.`)
        .addFields(
          { name: "Code", value: invite.code, inline: true },
          { name: "Kanaal", value: `<#${invite.channel.id}>`, inline: true }
        )
        .setColor("#00FF00")
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    });

    client.on(Events.InviteDelete, async (invite) => {
      const logChannel = await fetchLogChannel("channelLogs");
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setTitle("❌ Invite Verwijderd")
        .setDescription(`Invite **${invite.code}** is verwijderd.`)
        .setColor("#FF0000")
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    });
  },
};
