import { CommandInteraction, Role, MessageEmbed } from "discord.js";
import { incrementUserPoints, getUserPoints } from "../db/db";

import displayErrorMessage from "./displayErrorMessage.util";

// increment all users in role's points (can be negative!)
export default async function incrementRolePoints(
  interaction: CommandInteraction,
  role: Role,
  amount: number
) {
  if (!interaction.guild) {
    await displayErrorMessage(interaction, "You can't give points in a DM!");
    return;
  }

  // fetch all members for role
  await role.guild.members.fetch();

  // first increment points for each member in role
  role.members.forEach(async (member) =>
    incrementUserPoints(interaction.guild.id, member.user.id, amount)
  );

  const amountMagnitude = Math.abs(amount);
  const changePhrase = amount > 0 ? "added to" : "removed from";

  // then output the results
  const affectedUsers: (string | number | undefined)[][] = [];

  role.members.forEach(async (member) => {
    const { id } = member.user;
    const balance = await getUserPoints(interaction.guild.id, id);
    affectedUsers.push([id, balance]);
  });

  const formattedList = affectedUsers
    .map(([id, balance], i) => `${i + 1}) <@${id}> (New Balance: ${balance})`)
    .join("\n");

  const transactionSummary = new MessageEmbed()
    .setColor("#0B0056")
    .setTitle("E-Clip Transaction Complete")
    .setDescription(
      `${amountMagnitude} E-Clip${
        amountMagnitude === 1 ? "" : "s"
      } ${changePhrase}:\n${formattedList}`
    )
    .setTimestamp(new Date())
    .setFooter({
      text: "Atlas Points",
      iconURL:
        "https://storage.googleapis.com/image-bucket-atlas-points-bot/logo.png"
    });

  await interaction.reply({ embeds: [transactionSummary] });
}
