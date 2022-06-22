import { CommandInteraction, Client } from "discord.js";
import /* displayErrorMessage */
"../utils";

import { Command } from "../command";

const Configure: Command = {
  name: "configure",
  description:
    "Moderators can add points to a user, role, or the entire server",
  type: "CHAT_INPUT",
  options: [
    {
      name: "log",
      description: "Configure the channel to output transaction logs to",
      type: "SUB_COMMAND",
      options: [
        {
          name: "channel",
          description: "the channel to output transaction logs to",
          type: "CHANNEL"
        }
      ]
    }
  ],
  execute: async (_client: Client, interaction: CommandInteraction) => {
    await interaction.reply("Not yet configured.");
  }
};

export default Configure;
