import { CommandInteraction, Client, MessageEmbed } from "discord.js";
import { getUserRank, getUserPoints } from "../db/db";

import { Command } from "../command";

const Points: Command = {
  name: "points",
  description: "View points for a user",
  type: "CHAT_INPUT",
  options: [
    {
      name: "user",
      description: "the user to target",
      type: "USER"
    }
  ],
  execute: async (_client: Client, interaction: CommandInteraction) => {
    const user = interaction.options.getUser("user") || interaction.user;

    if (!interaction.guildId) {
      await interaction.reply("This command can only be used in a server");
      return;
    }

    const userSummary = new MessageEmbed()
      .setColor("#0B0056")
      .setTitle(`E-Clip summary for ${user.username}`)
      .setThumbnail(user.avatarURL() || user.defaultAvatarURL)
      .addFields(
        {
          name: "Ranking",
          value: `#${await getUserRank(interaction.guildId, user.id)}`,
          inline: true
        },
        {
          name: "Total E-Clips",
          value: `${await getUserPoints(interaction.guildId, user.id)}`,
          inline: true
        }
      )
      .setTimestamp(new Date());

    await interaction.reply({ embeds: [userSummary] });
  }
};

export default Points;
