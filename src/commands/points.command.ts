import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { getUserRank, getUserPoints } from "../db/db";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("points")
    .setDescription("View points for a user, role, or the entire server")
    .addUserOption((option) =>
      option.setName("user").setDescription("the user to target")
    )
    .addRoleOption((option) =>
      option.setName("role").setDescription("the role to target")
    )
    .addStringOption((option) =>
      option.setName("server").setDescription("rankings for this server")
    ),
  async execute(interaction: CommandInteraction) {
    const user = interaction.options.getUser("user") || interaction.user;

    const userSummary = new MessageEmbed()
      .setColor("#0B0056")
      .setTitle(`Point Summary for ${user.username}`)
      .setThumbnail(user.avatarURL()!)
      .addFields(
        {
          name: "Ranking",
          value: `#${await getUserRank(interaction.guildId!, user.id)}`,
          inline: true
        },
        {
          name: "Total Points",
          value: `${await getUserPoints(interaction.guildId!, user.id)}`,
          inline: true
        }
      )
      .setTimestamp(new Date());

    interaction.reply({ embeds: [userSummary] });
  }
};
