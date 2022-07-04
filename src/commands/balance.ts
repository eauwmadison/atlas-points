import { CommandInteraction, Client, MessageEmbed } from "discord.js";
import { getUserRank, getUserPoints } from "../db/db";

import { Command } from "../command";
import { confirmGuild, confirmPerms } from "../utils/confirmPerms";

const Balance: Command = {
  name: "balance",
  description: "View points for a user",
  type: "CHAT_INPUT",
  options: [
    {
      name: "user",
      description: "the user to target (admin only)",
      type: "USER"
    }
  ],
  execute: async (_client: Client, interaction: CommandInteraction) => {
    const specifiedUser = interaction.options.getUser("user");
    const interactionUser = interaction.user;

    let guildId;

    if (specifiedUser === null) {
      const confirmRet = await confirmGuild(interaction, "view your E-Clips");
      if (!confirmRet.success) {
        await interaction.reply({ embeds: [confirmRet.reply] });
        return;
      }
      guildId = confirmRet.guild.id;
    } else {
      // need to have perms to view someone else's eclips
      const confirmRet = await confirmPerms(interaction, "view another user's E-Clips");
      if (!confirmRet.success) {
        await interaction.reply({ embeds: [confirmRet.reply] });
        return;
      }
      guildId = confirmRet.guild.id;
    }

    const user = specifiedUser || interactionUser;

    const userSummary = new MessageEmbed()
      .setColor("#0B0056")
      .setTitle(`E-Clip summary for ${user.username}`)
      .setThumbnail(user.avatarURL() || user.defaultAvatarURL)
      .addFields(
        {
          name: "Ranking",
          value: `#${await getUserRank(guildId, user.id)}`,
          inline: true
        },
        {
          name: "Total E-Clips",
          value: `${await getUserPoints(guildId, user.id)}`,
          inline: true
        }
      )
      .setTimestamp(new Date());

    await interaction.reply({ embeds: [userSummary] });
  }
};

export default Balance;
