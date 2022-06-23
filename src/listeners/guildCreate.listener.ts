import { Client } from "discord.js";
import { registerGuildIfNotExists } from "../db/db";

export default (client: Client): void => {
  client.on("guildCreate", async (guild) => {
    await registerGuildIfNotExists(guild.id);
  });
};
