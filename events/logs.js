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

    client.on(Events.ChannelCreate, async (channel) => {
      const logChannel = await fetchLogChannel("channelLogs");

      const embed = new EmbedBuilder()
        .setTitle("➕ Channel created")
        .setDescription(`The channel <#${channel.id}> has been created.`)
        .addFields(
          { name: "name", value: `${channel.name}`, inline: false },
          { name: "Type", value: `${channel.type}`, inline: false },
          { name: "ChannelID", value: `${channel.id}`, inline: false }
        )
        .setColor("#00FF00")
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    });

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
