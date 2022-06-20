import { CommandInteraction, Client, Role } from "discord.js";
import {
  displayErrorMessage,
  incrementRolePoints,
  incrementSingleUserPoints
} from "../utils";

import { Command } from "../command";

const Add: Command = {
  name: "add",
  description:
    "Moderators can add points to a user, role, or the entire server",
  type: "CHAT_INPUT",
  options: [
    {
      name: "amount",
      description: "the number of points to add",
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

    if (interaction.guild === null) {
      await displayErrorMessage(interaction, "Cannot give points in a DM");
      return;
    }

    const roles = await interaction.guild.roles.fetch();
    const members = await interaction.guild.members.fetch();

    let permitted = false;
    for (const [, guildMember] of members) {
      if (guildMember.user.id === interaction.user.id) {
        for (const [, role] of guildMember.roles.cache) {
          if (role.name === "Instructor") {
            permitted = true;
          }
        }
      }
    }

    if (!permitted) {
      await displayErrorMessage(
        interaction,
        "Only an Instructor can add or subtract points directly"
      );
      return;
    }

    if (amount === null || amount < 0 || amount > 1024 ** 3) {
      await displayErrorMessage(
        interaction,
        "amount must be greater than 0 and less than 2^30"
      );
    } else {
      const incAmount = amount;
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

export default Add;
