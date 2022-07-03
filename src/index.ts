import dotenv from "dotenv";
import { Client, Intents } from "discord.js";

import { Command } from "./command";
import Balance from "./commands/balance";
import Add from "./commands/add";
import Subtract from "./commands/subtract";
import Pay from "./commands/pay";
import Leaderboard from "./commands/leaderboard";
import Configure from "./commands/configure";
import Ping from "./commands/ping";

import ready from "./listeners/ready";
import interactionCreate from "./listeners/interactionCreate";
import guildCreate from "./listeners/guildCreate";
import guildMemberAdd from "./listeners/guildMemberAdd";

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
  Balance,
  Add,
  Subtract,
  Pay,
  Leaderboard,
  Configure,
  Ping
];

ready(client, commands);
interactionCreate(client, commands);
guildCreate(client, commands);
guildMemberAdd(client);

// login to Discord
client.login(process.env.DISCORD_TOKEN);
