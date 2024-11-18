const { Client, Events, Intents, Collection, GatewayIntentBits } = require('discord.js');

require("dotenv").config();
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const token = process.env.token;
client.login(token);

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

