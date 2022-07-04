import { CommandInteraction, Guild, GuildMemberRoleManager, MessageEmbed } from "discord.js";
import { getModRoleId } from "../db/db";

export function errorMessage(description: string): MessageEmbed {
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

  return errorSummary;
}

type ConfirmResult = {
  success: true,
  guild: Guild
} | {
  success: false,
  reply: MessageEmbed
}


export async function confirmGuild(
  interaction: CommandInteraction,
  action: string
): Promise<ConfirmResult> {
  if (!interaction.guild) {
    return {
      success: false,
      reply: errorMessage(`You can only ${action} in a server.`)
    };
  }

  return {
    success: true,
    guild: interaction.guild
  };
}

export async function confirmPerms(
  interaction: CommandInteraction,
  action: string
): Promise<ConfirmResult> {
  if (!interaction.member || !interaction.guild) {
    return {
      success: false,
      reply: errorMessage(`You can only ${action} in a server.`)
    };
  }

  const modRoleId = await getModRoleId(interaction.guild.id);

  const member = await interaction.guild.members.fetch(interaction.user.id);

  const permitted = member.permissions.has("ADMINISTRATOR") || member.roles.cache.some((role) => role.id === modRoleId);

  if (!permitted) {
    let message;
    if (modRoleId !== undefined) {
      message = `Only admins or members with role <@&${modRoleId}> can ${action}.`;
    } else {
      message = `Only admins can ${action}. (use \`/configure role\` to change)`;
    }
    return { success: false, reply: errorMessage(message) }
  }

  return {
    success: true,
    guild: interaction.guild
  };
}
