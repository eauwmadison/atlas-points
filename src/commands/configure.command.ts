import { CommandInteraction, Client, Role, MessageEmbed } from "discord.js";

import { Command } from "../command";
import {
  clearLogChannel,
  setLogChannel,
  setModRoleId
} from "../db/db";

import { errorMessage, confirmPerms } from "../utils/displayErrorMessage.util";

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
          type: "CHANNEL",
          channelTypes: ["GUILD_TEXT"],
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
    const confirmRet = await confirmPerms(interaction, "configure settings");
    if (!confirmRet.success) {
      await interaction.reply({ embeds: [confirmRet.reply] });
      return;
    }

    const guildId = confirmRet.guild.id;

    if (interaction.options.getSubcommand() === "log") {
      const channel = interaction.options.getChannel("channel");

      if (!channel) {
        await clearLogChannel(guildId);

        const summary = new MessageEmbed()
          .setColor("#0B0056")
          .setTitle("Configuration Updated")
          .setDescription(
            "*No channel supplied.*\n\nLogging has been disabled."
          )
          .setFooter({
            text: "Atlas E-Clips",
            iconURL:
              "https://storage.googleapis.com/image-bucket-atlas-points-bot/logo.png"
          })
          .setTimestamp(new Date());

        await interaction.reply({ embeds: [summary] });
        return;
      }

      await setLogChannel(guildId, channel.id);

      const summary = new MessageEmbed()
        .setColor("#0B0056")
        .setTitle("Configuration Updated")
        .setDescription(`Logs will now be sent to <#${channel.id}>.`)
        .setFooter({
          text: "Atlas E-Clips",
          iconURL:
            "https://storage.googleapis.com/image-bucket-atlas-points-bot/logo.png"
        })
        .setTimestamp(new Date());

      await interaction.reply({ embeds: [summary] });
    }

    if (interaction.options.getSubcommand() === "role") {
      const role = interaction.options.getRole("role") as Role;

      await setModRoleId(guildId, role.id);

      const summary = new MessageEmbed()
        .setColor(role.color)
        .setTitle("Configuration Updated")
        .setDescription(`Role updated to <@&${role.id}>.`)
        .setFooter({
          text: "Atlas E-Clips",
          iconURL:
            "https://storage.googleapis.com/image-bucket-atlas-points-bot/logo.png"
        })
        .setTimestamp(new Date());

      await interaction.reply({ embeds: [summary] });
    }
  }
};

export default Configure;
