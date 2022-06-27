import { CommandInteraction, Client, Role } from "discord.js";

import { Command } from "../command";

import { errorMessage, confirmPerms } from "../utils/displayErrorMessage.util";
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

    // will never be reached because `required` is true in options[]
    // only for type safety
    if (!amount) {
      await interaction.reply({ embeds: [errorMessage("Must specify an amount")] });
      return;
    }

    const confirmRet = await confirmPerms(interaction, "add E-Clips directly");
    if (!confirmRet.success) {
      await interaction.reply({ embeds: [confirmRet.reply] });
      return;
    }

    let reply;

    if (role === null) {
      const target = user ?? interaction.user;
      reply = await incrementSingleUserPoints(_client, confirmRet.guild.id, target, amount);
    } else if (user === null) {
      reply = await incrementRolePoints(_client, confirmRet.guild.id, role, amount);
    } else {
      reply = errorMessage("Can't target a user and role at the same time");
    }

    await interaction.reply({ embeds: [reply] });
  }
};

export default Add;
