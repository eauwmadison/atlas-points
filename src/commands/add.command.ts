import { CommandInteraction, Client, Role } from "discord.js";

import { Command } from "../command";
import { getPermissionRoleName } from "../db/db";

import checkPermissionRole from "../utils/checkPermissionRole.util";
import displayErrorMessage from "../utils/displayErrorMessage.util";
import incrementRolePoints from "../utils/incrementRolePoints.util";
import incrementSingleUserPoints from "../utils/incrementSingleUserPoints.util";

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
      minValue: 1,
      maxValue: 1024 ** 3,
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

    if (!interaction.guild) {
      await displayErrorMessage(interaction, "Cannot add E-Clips in a DM");
      return;
    }

    // will never be reached because `required` is true in options[]
    // only for type safety
    if (!amount) {
      await displayErrorMessage(interaction, "Must specify an amount");
      return;
    }

    const permitted = await checkPermissionRole(interaction);

    if (!permitted) {
      await displayErrorMessage(
        interaction,
        `Only members with the role "${await getPermissionRoleName(
          interaction.guild.id
        )}" can add E-Clips directly.`
      );
      return;
    }

    if (role === null) {
      const target = user ?? interaction.user;
      await incrementSingleUserPoints(_client, interaction, target, amount);
    } else if (user === null) {
      await incrementRolePoints(_client, interaction, role, amount);
    } else {
      await displayErrorMessage(
        interaction,
        "Can't target a user and role at the same time time"
      );
    }
  }
};

export default Add;
