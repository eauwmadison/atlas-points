import { Client } from "discord.js";
import { Command } from "../command";
import { registerGuildIfNotExists } from "../db/db";

export default (client: Client, commands: Command[]): void => {
  client.on("ready", async () => {
    if (!client.user || !client.application) {
      return;
    }

    console.log(`Logged in as ${client.user.tag} with ID ${client.user.id}!`);
    client.guilds.cache.forEach((guild) => {
      // deployCommands(client.user!.id, guild.id, process.env.DISCORD_TOKEN!);
      client.application?.commands.set(commands, guild.id);
      registerGuildIfNotExists(guild);
    });
    client.user.setActivity("your points!", { type: "WATCHING" });
  });
};
