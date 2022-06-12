import { CommandInteraction, Client, Role } from "discord.js";
import {
  displayErrorMessage,
  incrementRolePoints,
  incrementSingleUserPoints
} from "../utils";

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
    const amount = interaction.options.getInteger("amount");
    const user = interaction.options.getUser("user");
    const role = interaction.options.getRole("role") as Role | null;

    if (amount === null || amount < 0 || amount > 1024 ** 3) {
      await displayErrorMessage(
        interaction,
        "amount must be greater than 0 and less than 2^30"
      );
    } else {
      const incAmount = -amount;
      if (role === null) {
        const target = user ?? interaction.user;
        await incrementSingleUserPoints(interaction, target, incAmount);
      } else if (user === null) {
        await incrementRolePoints(interaction, role, incAmount);
      } else {
        await displayErrorMessage(
          interaction,
          "can't target a user and role at the same time time"
        );
      }
    }
  }
};

export default Subtract;
