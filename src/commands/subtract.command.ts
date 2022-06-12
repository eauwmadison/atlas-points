import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { displayErrorMessage, incrementSingleUserPoints } from "../utils";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("subtract")
    .setDescription(
      "Moderators can subtract points from a user, role, or the entire server"
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("the number of points to subtract")
        .setMinValue(0)
        .setRequired(true)
    )
    .addUserOption((option) =>
      option.setName("user").setDescription("the user to target")
    )
    .addRoleOption((option) =>
      option.setName("role").setDescription("the role to target")
    ),
  async execute(interaction: CommandInteraction) {
    const amount = interaction.options.getInteger("amount");
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
