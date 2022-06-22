import { CommandInteraction, User, MessageEmbed } from "discord.js";
import { incrementUserPoints, getUserPoints } from "../db/db";

import displayErrorMessage from "./displayErrorMessage.util";

export default async function incrementSingleUserPoints(
  interaction: CommandInteraction,
  user: User,
  amount: number
) {
  if (!interaction.guildId) {
    await displayErrorMessage(interaction, "You can't give E-Clips in a DM!");
    return;
  }

  // first change the user's points
  const amountChange = await incrementUserPoints(
    interaction.guildId,
    user.id,
    amount
  );

  const amountMagnitude = Math.abs(amountChange);
  const changePhrase = amount > 0 ? "added to" : "removed from";

  const transactionSummary = new MessageEmbed()
    .setColor("#0B0056")
    .setTitle("E-Clip Transaction Complete")
    .setAuthor({
      name: `${user.tag}`,
      iconURL: user.avatarURL() || user.defaultAvatarURL
    })
    .setDescription(
      `${amountMagnitude} E-Clip${
        amountMagnitude === 1 ? "" : "s"
      } ${changePhrase} <@${user.id}>'s balance!`
    )
    .addFields({
      name: "New Balance",
      value: `${await getUserPoints(interaction.guildId, user.id)}`,
      inline: true
    })
    .setTimestamp(new Date())
    .setFooter({
      text: "Atlas Points",
      iconURL:
        "https://storage.googleapis.com/image-bucket-atlas-points-bot/logo.png"
    });
  await interaction.reply({ embeds: [transactionSummary] });
}
