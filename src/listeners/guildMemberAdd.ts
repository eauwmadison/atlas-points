import { Client } from "discord.js";
import { registerUserIfNotExists } from "../db/db";

export default (client: Client): void => {
  client.on("guildMemberAdd", async (member) => {
    await registerUserIfNotExists(member.guild.id, member.id);
  });
};
