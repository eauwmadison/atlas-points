import { Client } from "discord.js";
import { Command } from "../command";
import { registerGuildIfNotExists } from "../db/db";

export default (client: Client, commands: Command[]): void => {
  client.on("ready", async () => {
    if (!client.user || !client.application) {
      return;
    }

    console.log(`Logged in as ${client.user.tag} with ID ${client.user.id}!`);
    for (const [,guild] of client.guilds.cache) {
      await client.application?.commands.set(commands, guild.id);
      registerGuildIfNotExists(guild);
    };
    client.user.setActivity("your points!", { type: "WATCHING" });
  });
};
