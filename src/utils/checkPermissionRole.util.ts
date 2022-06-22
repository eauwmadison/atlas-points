import { CommandInteraction } from "discord.js";
import { getPermissionRoleName } from "../db/db";

export default async function checkPermissionRole(
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
