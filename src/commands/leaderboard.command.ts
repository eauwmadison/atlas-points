import { CommandInteraction, Client, MessageEmbed } from "discord.js";
import { getRankings } from "../db/db";

import { Command } from "../command";

import displayErrorMessage from "../utils/displayErrorMessage.util";

const Leaderboard: Command = {
  name: "leaderboard",
  description: "Display rankings for the server",
  type: "CHAT_INPUT",
  execute: async (_client: Client, interaction: CommandInteraction) => {
    const { guild } = interaction;

    if (!guild) {
      await displayErrorMessage(
        interaction,
        "This command can only be used in a server"
      );
      return;
    }

    const results = await getRankings(guild.id);

    const list = results
      .map(
        (result: any, index) =>
          `${index + 1}) <@${result[0]}> — **${result[1].points}** E-Clips`
      )
      .join("\n");

    const guildSummary = new MessageEmbed()
      .setColor("#0B0056")
      .setTitle(`Leaderboard for ${guild.name}`)
      .setAuthor({
        name: "Atlas Points",
        iconURL:
          "https://storage.googleapis.com/image-bucket-atlas-points-bot/logo.png",
        url: "https://atlasfellowship.org"
      })
      .setThumbnail(
        guild.iconURL() ||
          "https://storage.googleapis.com/image-bucket-atlas-points-bot/logo.png"
      )
      .setDescription(list)
      .setTimestamp(new Date())
      .setFooter({
        text: "Atlas Points",
        iconURL:
          "https://storage.googleapis.com/image-bucket-atlas-points-bot/logo.png"
      });

    await interaction.reply({ embeds: [guildSummary] });
  }
};

export default Leaderboard;
