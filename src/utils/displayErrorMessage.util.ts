import { CommandInteraction, MessageEmbed } from "discord.js";

export default async function displayErrorMessage(
  interaction: CommandInteraction,
  description: string
) {
  const errorSummary = new MessageEmbed()
    .setColor("#EF5D60")
    .setTitle("Error!")
    .setDescription(description)
    .setTimestamp(new Date())
    .setFooter({
      text: "Atlas E-Clips",
      iconURL:
        "https://storage.googleapis.com/image-bucket-atlas-points-bot/logo.png"
    });

  await interaction.reply({ embeds: [errorSummary] });
}
