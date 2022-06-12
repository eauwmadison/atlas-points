import { CommandInteraction, Client } from "discord.js";
import { displayErrorMessage, incrementSingleUserPoints } from "../utils";

import { Command } from "../command";

const Subtract: Command = {
  name: "subtract",
  description:
    "Moderators can subtract points from a user, role, or the entire server",
  type: "CHAT_INPUT",
  options: [
    {
      name: "amount",
      description: "the number of points to subtract",
      type: "INTEGER",
      minValue: 0,
      required: true
    },
    {
      name: "user",
      description: "the user to target",
      type: "USER"
    },
    {
      name: "role",
      description: "the role to target",
      type: "ROLE"
    }
  ],
  execute: async (_client: Client, interaction: CommandInteraction) => {
    const amount = interaction.options.getInteger("amount"); // TODO: fix types
    const user = interaction.options.getUser("user") || interaction.user;

    if (amount === null || amount < 0 || amount > 1024 ** 3) {
      await displayErrorMessage(
        interaction,
        "amount must be greater than 0 and less than 2^30"
      );
    } else {
      await incrementSingleUserPoints(interaction, user, -amount);
    }
  }
};

export default Subtract;
