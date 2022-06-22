import { CommandInteraction, MessageEmbed, Role, User } from "discord.js";

import {
  incrementUserPoints,
  getUserPoints,
  getPermissionRoleName
} from "./db/db";

export async function checkPermissionRole(
  interaction: CommandInteraction
): Promise<boolean> {
  // interaction must be from guild for checking roles
  if (!interaction.guild) {
    return false;
  }

  const permissionRoleName = await getPermissionRoleName(interaction.guild.id);

  return (
    await interaction.guild.members.fetch(interaction.user.id)
  ).roles.cache.some((role) => role.name === permissionRoleName);
}

export async function displayErrorMessage(
  interaction: CommandInteraction,
  description: string
) {
  const errorSummary = new MessageEmbed()
    .setColor("#0B0056")
    .setTitle("Error!")
    .setDescription(description)
    .setTimestamp(new Date())
    .setFooter({
      text: "Atlas Points",
      iconURL:
        "https://storage.googleapis.com/image-bucket-atlas-points-bot/logo.png"
    });

  await interaction.reply({ embeds: [errorSummary] });
}

export async function incrementSingleUserPoints(
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

// increment all users in role's points (can be negative!)
export async function incrementRolePoints(
  interaction: CommandInteraction,
  role: Role,
  amount: number
) {
  if (!interaction.guildId) {
    await displayErrorMessage(interaction, "You can't give points in a DM!");
    return;
  }

  // fetch all
  await role.guild.members.fetch();

  for (const [, guildMember] of role.members) {
    // first change the user's points
    await incrementUserPoints(interaction.guildId, guildMember.user.id, amount);
  }

  const amountMagnitude = Math.abs(amount);
  const changePhrase = amount > 0 ? "added to" : "removed from";

  const usernameList = [];
  for (const [, guildMember] of role.members) {
    const { id } = guildMember.user;
    const bal = await getUserPoints(interaction.guildId, guildMember.user.id);
    usernameList.push([id, bal]);
  }

  const userListStr = usernameList
    .map(([id, bal], i) => `${i + 1}) <@${id}> (New Balance: ${bal})`)
    .join("\n");

  const transactionSummary = new MessageEmbed()
    .setColor("#0B0056")
    .setTitle("E-Clip Transaction Complete")
    .setDescription(
      `${amountMagnitude} E-Clip${
        amountMagnitude === 1 ? "" : "s"
      } ${changePhrase}:\n${userListStr}`
    )
    .setTimestamp(new Date())
    .setFooter({
      text: "Atlas Points",
      iconURL:
        "https://storage.googleapis.com/image-bucket-atlas-points-bot/logo.png"
    });

  await interaction.reply({ embeds: [transactionSummary] });
}
