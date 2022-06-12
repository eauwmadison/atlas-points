import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { Client, Collection, Intents } from "discord.js";

import {
  registerGuildIfNotExists,
  registerUserIfNotExists
} from "./db/db";
import deployCommands from "./deploy-commands";

dotenv.config();

// create a new Discord client instance
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".command.ts"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

// when the client is ready, run this code (only once)
client.once("ready", async () => {
  console.log(`Logged in as ${client.user!.tag} with ID ${client.user!.id}!`);
  client.guilds.cache.forEach((guild) => {
    deployCommands(client.user!.id, guild.id, process.env.DISCORD_TOKEN!);
    registerGuildIfNotExists(guild);
  });
  client.user!.setActivity("your points!", { type: "WATCHING" });
});

client.on("guildMemberAdd", async (member) => {
  await registerUserIfNotExists(member.guild.id, member.id);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true
    });
  }
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
