import { BaseCommandInteraction, Client } from "discord.js";

import { Command } from "../command";

const Ping: Command = {
  name: "ping",
  description: 'Replies with "Pong!" to test the bot\'s connection',
  type: "CHAT_INPUT",
  execute: async (_client: Client, interaction: BaseCommandInteraction) => {
    await interaction.reply("Pong!");
  }
};

export default Ping;
