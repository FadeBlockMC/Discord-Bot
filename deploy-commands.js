const { REST, Routes } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();

const token = process.env.TOKEN;
const clientId = process.env.clientId;

const commands = [];

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
      commands.push(command.data.toJSON());
      console.log(`Loaded command: ${command.data.name}`);
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
        commands.push(command.data.toJSON());
        console.log(`Loaded admin command: ${command.data.name}`);
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  }
} else {
  console.log(`[WARNING] The admin directory at ${adminPath} does not exist.`);
}

const ticketPath = path.join(__dirname, "ticket", "utility");

if (fs.existsSync(ticketPath)) {
  const ticketFiles = fs
    .readdirSync(ticketPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of ticketFiles) {
    const filePath = path.join(ticketPath, file);
    try {
      const command = require(filePath);

      if ("data" in command && "execute" in command) {
        commands.push(command.data.toJSON());
        console.log(`Loaded ticket command: ${command.data.name}`);
      } else {
        console.log(
          `[WARNING] The ticket command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    } catch (error) {
      console.error(
        `[ERROR] Failed to load ticket command at ${filePath}:`,
        error.message
      );
    }
  }
} else {
  console.log(
    `[WARNING] The ticket directory at ${ticketPath} does not exist.`
  );
}

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    console.log(
      `Successfully reloaded ${commands.length} application (/) commands.`
    );
  } catch (error) {
    console.error(error);
  }
})();
