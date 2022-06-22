import { CommandInteraction, Client } from "discord.js";

import { checkPermissionRole, displayErrorMessage } from "../utils";

import { Command } from "../command";
import { getPermissionRoleName } from "../db/db";

const Configure: Command = {
  name: "configure",
  description:
    "Moderators can add points to a user, role, or the entire server",
  type: "CHAT_INPUT",
  options: [
    {
      name: "log",
      description:
        'Configure the channel to output transaction logs to. No "channel" option will disable log output.',
      type: "SUB_COMMAND",
      options: [
        {
          name: "channel",
          description: "the channel to output transaction logs to",
          type: "CHANNEL"
        }
      ]
    },
    {
      name: "role",
      description:
        'Configure the role which has permission to modify points and settings. Default is "Instructor".',
      type: "SUB_COMMAND",
      options: [
        {
          name: "role",
          description: "the role to give permission",
          type: "ROLE",
          required: true
        }
      ]
    }
  ],
  execute: async (_client: Client, interaction: CommandInteraction) => {
    if (!interaction.guild) {
      await displayErrorMessage(
        interaction,
        "Settings can only be configured in a server."
      );
      return;
    }

    const permitted = await checkPermissionRole(interaction);

    if (!permitted) {
      await displayErrorMessage(
        interaction,
        `Only members with the role "${await getPermissionRoleName(
          interaction.guild.id
        )}" can configure settings.`
      );
      return;
    }

    await interaction.reply("Not yet configured.");
  }
};

export default Configure;
