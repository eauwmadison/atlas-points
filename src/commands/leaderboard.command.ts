import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { getRankings } from "../db/db";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Display the top 10 members"),
  async execute(interaction: CommandInteraction) {
    const { guild } = interaction;

    const results = await getRankings(guild!.id);

    const list = results
      .map(
        (result: any, index) =>
          `${index + 1}) <@${result[0]}> — **${result[1].points}** points`
      )
      .join("\n");

    const guildSummary = new MessageEmbed()
      .setColor("#0B0056")
      .setTitle(`Leaderboard for ${guild!.name}` || "current server")
      .setAuthor({
        name: "Atlas Points",
        iconURL:
          "https://storage.googleapis.com/image-bucket-atlas-points-bot/logo.png",
        url: "https://atlasfellowship.org"
      })
      .setThumbnail(
        guild!.iconURL() ||
          "https://storage.googleapis.com/image-bucket-atlas-points-bot/logo.png"
      )
      .setDescription(list)
      .setTimestamp(new Date());

    interaction.reply({ embeds: [guildSummary] });
  }
};
