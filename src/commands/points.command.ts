import { BaseCommandInteraction, Client, MessageEmbed } from "discord.js";
import { getUserRank, getUserPoints } from "../db/db";

import { Command } from "../command";

const Points: Command = {
  name: "points",
  description: "View points for a user, role, or the entire server",
  type: "CHAT_INPUT",
  options: [
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
  execute: async (_client: Client, interaction: BaseCommandInteraction) => {
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

    await interaction.reply({ embeds: [userSummary] });
  }
};

export default Points;
