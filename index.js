const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, GatewayIntentBits } = require("discord.js");

require("dotenv").config();
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const token = process.env.token;
client.login(token);

client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

const adminPath = path.join(__dirname, "admin");
if (fs.existsSync(adminPath)) {
  const adminFolders = fs.readdirSync(adminPath);

  for (const folder of adminFolders) {
    const commandsPath = path.join(adminPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
      } else {
        console.log(
          `[WARNING] The admin command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  }
} else {
  console.log(`[WARNING] The admin directory at ${adminPath} does not exist.`);
}

const ticketPath = path.join(__dirname, "Ticket");
if (fs.existsSync(ticketPath)) {
  const ticketFiles = fs
    .readdirSync(ticketPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of ticketFiles) {
    const filePath = path.join(ticketPath, file);
    const command = require(filePath);

    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The ticket command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
} else {
  console.log(
    `[WARNING] The ticket directory at ${ticketPath} does not exist.`
  );
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}
