import { CommandInteraction, Client, MessageEmbed } from "discord.js";
import { getRankings } from "../db/db";

import { Command } from "../command";

import { errorMessage, confirmGuild } from "../utils/displayErrorMessage.util";

const Leaderboard: Command = {
  name: "leaderboard",
  description: "Display rankings for the server",
  type: "CHAT_INPUT",
  execute: async (_client: Client, interaction: CommandInteraction) => {
    const confirmRet = await confirmGuild(interaction, "add E-Clips directly");
    if (!confirmRet.success) {
      await interaction.reply({ embeds: [confirmRet.reply] });
      return;
    }

    const results  = await getRankings(confirmRet.guild.id);

    let list = results
      .slice(0, 10)
      .map(
        (result: any, index) =>
          `${index + 1}) <@${result[0]}> — **${result[1].points}** E-Clips`
      )
      .join("\n");

    if(results.length > 10) {
        list += `\n\n**Truncated - ${results.length - 10} more**`;
    }

    const guildSummary = new MessageEmbed()
      .setColor("#0B0056")
      .setTitle(`Leaderboard`)
      .setDescription(list)
      .setTimestamp(new Date())
      .setFooter({
        text: "Atlas E-Clips",
        iconURL:
          "https://storage.googleapis.com/image-bucket-atlas-points-bot/logo.png"
      });

    await interaction.reply({ embeds: [guildSummary] });
  }
};

export default Leaderboard;
