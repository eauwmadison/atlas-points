import dotenv from "dotenv";
import { Client, Intents } from "discord.js";

import { Command } from "./command";
import Points from "./commands/points.command";
import Add from "./commands/add.command";
import Subtract from "./commands/subtract.command";
import Give from "./commands/give.command";
import Leaderboard from "./commands/leaderboard.command";
import Configure from "./commands/configure.command";
import Ping from "./commands/ping.command";

import ready from "./listeners/ready.listener";
import interactionCreate from "./listeners/interactionCreate.listener";
import guildCreate from "./listeners/guildCreate.listener";
import guildMemberAdd from "./listeners/guildMemberAdd.listener";

dotenv.config();

// create a new Discord client instance
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_PRESENCES
  ]
});

// prettier-ignore
const commands: Command[] = [
  Points,
  Add,
  Subtract,
  Give,
  Leaderboard,
  Configure,
  Ping
];

ready(client, commands);
interactionCreate(client, commands);
guildCreate(client, commands);
guildMemberAdd(client);

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
