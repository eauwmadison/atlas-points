import {
  CommandInteraction,
  GuildMember,
  MessageEmbed,
  Role,
  User
} from "discord.js";

import { incrementUserPoints, getUserPoints } from "./db/db";

export async function displayErrorMessage(
  interaction: CommandInteraction,
  description: string
) {
  const erorSummary = new MessageEmbed()
    .setColor("#0B0056")
    .setTitle("Error!")
    .setDescription(description)
    .setTimestamp(new Date())
    .setFooter({
      text: "Atlas Points",
      iconURL:
        "https://storage.googleapis.com/image-bucket-atlas-points-bot/logo.png"
    });

  await interaction.reply({ embeds: [erorSummary] });
}

// increment user points by a specified amount (can be negative!)
export async function incrementSingleUserPoints(
  interaction: CommandInteraction,
  user: User,
  amount: number
) {
  // first change the user's points
  await incrementUserPoints(interaction.guildId!, user.id, amount);

  const amountMagnitude = Math.abs(amount);
  const changePhrase = amount > 0 ? "added to" : "removed from";

  const transactionSummary = new MessageEmbed()
    .setColor("#0B0056")
    .setTitle("Transaction Complete")
    .setAuthor({
      name: `${user.tag}`,
      iconURL: user.avatarURL()!
    })
    .setDescription(
      `${amountMagnitude} point${
        amountMagnitude === 1 ? "" : "s"
      } {changePhrase} <@${user.id}>'s total!`
    )
    .addFields({
      name: `New Balance for @${user.id}`,
      value: `${await getUserPoints(interaction.guildId!, user.id)}`,
      inline: true
    })
    .setTimestamp(new Date())
    .setFooter({
      text: "Atlas Points",
      iconURL:
        "https://storage.googleapis.com/image-bucket-atlas-points-bot/logo.png"
    });
}

// increment all users in role's points (can be negative!)
export async function incrementRolePoints(role: Role) {}
