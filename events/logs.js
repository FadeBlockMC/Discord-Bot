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
      if (!logChannel || message.partial) return;

      const embed = new EmbedBuilder()
        .setTitle("🗑️ Bericht Verwijderd")
        .setDescription(
          `Een bericht werd verwijderd in <#${message.channel.id}>`
        )
        .addFields(
          {
            name: "Auteur",
            value: `${message.author?.tag || "Onbekend"}`,
            inline: true,
          },
          {
            name: "Inhoud",
            value: message.content || "*Geen inhoud*",
            inline: true,
          }
        )
        .setColor("#FF0000")
        .setThumbnail(
          message.author?.displayAvatarURL({ dynamic: true }) || null
        )
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    });

    client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
      const logChannel = await fetchLogChannel("messageLogs");
      if (!logChannel || oldMessage.partial || newMessage.partial) return;

      const embed = new EmbedBuilder()
        .setTitle("✏️ Bericht Bewerkt")
        .setDescription(
          `Een bericht werd bewerkt in <#${oldMessage.channel.id}>`
        )
        .addFields(
          {
            name: "Auteur",
            value: `${oldMessage.author?.tag || "Onbekend"}`,
            inline: true,
          },
          {
            name: "Oude Inhoud",
            value: oldMessage.content || "*Geen inhoud*",
            inline: false,
          },
          {
            name: "Nieuwe Inhoud",
            value: newMessage.content || "*Geen inhoud*",
            inline: false,
          }
        )
        .setColor("#FFFF00")
        .setThumbnail(
          oldMessage.author?.displayAvatarURL({ dynamic: true }) || null
        )
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    });

    client.on(Events.ChannelCreate, async (channel) => {
      const logChannel = await fetchLogChannel("channelLogs");
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setTitle("➕ Kanaal Aangemaakt")
        .setDescription(`Het kanaal <#${channel.id}> is aangemaakt.`)
        .addFields(
          { name: "Naam", value: `${channel.name}`, inline: true },
          { name: "Type", value: `${channel.type}`, inline: true },
          { name: "Kanaal-ID", value: `${channel.id}`, inline: true }
        )
        .setColor("#00FF00")
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    });

    client.on(Events.ChannelUpdate, async (oldChannel, newChannel) => {
      const logChannel = await fetchLogChannel("channelLogs");
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setTitle("🔧 Kanaal Geüpdatet")
        .setDescription(`Het kanaal <#${newChannel.id}> is bijgewerkt.`)
        .addFields(
          { name: "Oude Naam", value: `${oldChannel.name}`, inline: true },
          { name: "Nieuwe Naam", value: `${newChannel.name}`, inline: true }
        )
        .setColor("#FFFF00")
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    });

    client.on(Events.ChannelDelete, async (channel) => {
      const logChannel = await fetchLogChannel("channelLogs");
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setTitle("❌ Kanaal Verwijderd")
        .setDescription(`Het kanaal **${channel.name}** is verwijderd.`)
        .addFields(
          { name: "Naam", value: `${channel.name}`, inline: true },
          { name: "Type", value: `${channel.type}`, inline: true },
          { name: "Kanaal-ID", value: `${channel.id}`, inline: true }
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
              ? "🎙️ Voice Kanaal Gejoined"
              : "🎙️ Voice Kanaal Verlaten"
          )
          .setDescription(
            newState.channelId
              ? `${newState.member.user.tag} heeft <#${newState.channel.id}> gejoined.`
              : `${newState.member.user.tag} heeft **${newState.channel.id}** verlaten.`
          )
          .setColor(newState.channelId ? "#00FF00" : "#FF0000")
          .setThumbnail(
            newState.member?.user.displayAvatarURL({ dynamic: true })
          )
          .setTimestamp();

        logChannel.send({ embeds: [embed] });
      }
    });

    client.on(Events.GuildUpdate, async (oldGuild, newGuild) => {
      const logChannel = await fetchLogChannel("serverLogs");
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setTitle("⚙️ Server Instellingen Bijgewerkt")
        .setDescription(`De serverinstellingen zijn bijgewerkt.`)
        .addFields(
          { name: "Oude Naam", value: `${oldGuild.name}`, inline: true },
          { name: "Nieuwe Naam", value: `${newGuild.name}`, inline: true }
        )
        .setColor("#FFA500")
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    });
  },
};
