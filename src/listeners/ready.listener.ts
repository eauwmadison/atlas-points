import { Client } from "discord.js";
import { Command } from "../command";
import { registerGuildIfNotExists, registerUserIfNotExists } from "../db/db";

export default (client: Client, commands: Command[]): void => {
  client.on("ready", async () => {
    if (!client.user || !client.application) {
      return;
    }

    console.log(`Logged in as ${client.user.tag} with ID ${client.user.id}!`);
    for (const [, guild] of client.guilds.cache) {
      await client.application?.commands.set(commands, guild.id);
      await registerGuildIfNotExists(guild.id);
      for (const [, member] of await guild.members.fetch()) {
        await registerUserIfNotExists(guild.id, member.user.id);
      }
    };

    client.user.setActivity("your E-Clips!", { type: "WATCHING" });
  });
};
