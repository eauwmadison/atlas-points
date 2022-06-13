import { CommandInteraction, Client, MessageEmbed } from "discord.js";

import { getUserPoints, givePoints } from "../db/db";
import { Command } from "../command";
import { displayErrorMessage } from "../utils";

const sessionTags = ["June 12-23", "July 3-14", "July 17-28", "August 14-25"];
type SessionTag = typeof sessionTags[number];

const Give: Command = {
  name: "give",
  description: "transfer points to another user",
  type: "CHAT_INPUT",
  options: [
    {
      name: "amount",
      description: "the number of E-Clips to give",
      type: "INTEGER",
      required: true,
      minValue: 1
    },
    {
      name: "recipient",
      description: "the user to give E-Clips to",
      type: "USER",
      required: true
    }
  ],
  execute: async (_client: Client, interaction: CommandInteraction) => {
    const amount = interaction.options.getInteger("amount");
    const donor = interaction.user;
    const recipient = interaction.options.getUser("recipient");

    if (!amount) {
      await displayErrorMessage(interaction, "Please specify the number of E-Clips you wish to give");
      return;
    }

    if (interaction.guild === null) {
      await displayErrorMessage(interaction, "Cannot give E-Clips in a DM");
      return;
    }

    if (recipient === null) {
      await displayErrorMessage(interaction, "Must specify recipient");
      return;
    }

    if (recipient.id === donor.id) {
      await displayErrorMessage(interaction, "Cannot give to yourself");
      return;
    }

    const roles = await interaction.guild.roles.fetch();
    const members = await interaction.guild.members.fetch();

    // check if both recipient has same time tag as

    // get tag of donor
    let donorSessionTag: null | SessionTag = null;
    for (const [, guildMember] of members) {
      if (guildMember.user.id === donor.id) {
        for (const [, role] of guildMember.roles.cache) {
          const idx = sessionTags.findIndex(x => role.name === x);
          if (idx >= 0) {
            donorSessionTag = sessionTags[idx];
            break;
          }
        }
      }
    }

    // check if recipient has same tag
    let permitted = false;
    if (donorSessionTag !== null) {
      for (const [, guildMember] of members) {
        if (guildMember.user.id === recipient.id) {
          for (const [, role] of guildMember.roles.cache) {
            if (role.name === donorSessionTag) {
              permitted = true;
              break;
            }
          }
        }
      }
    }

    if(!permitted) {
        await displayErrorMessage( interaction, "You can only give E-Clips to people in your cohort!");
        return;
    }

    const amountGiven = await givePoints(
      interaction.guild.id,
      donor.id,
      recipient.id,
      amount
    );

    const donorPoints = await getUserPoints(interaction.guild.id, donor.id);
    const recipientPoints = await getUserPoints(
      interaction.guild.id,
      recipient.id
    );

    const transactionSummary = new MessageEmbed()
      .setColor("#0B0056")
      .setTitle("Transaction Complete")
      .setAuthor({
        name: `${donor.tag}`,
        iconURL: donor.avatarURL() || donor.defaultAvatarURL
      })
      .setDescription(
        `<@${donor.id}> gave ${amountGiven} E-Clip${amountGiven === 1 ? "" : "s"
        } to <@${recipient.id}>`
      )
      .addFields(
        {
          name: `${donor.username}'s New Balance`,
          value: `${donorPoints}`,
          inline: true
        },
        {
          name: `${recipient.username}'s New Balance`,
          value: `${recipientPoints}`,
          inline: true
        }
      )
      .setTimestamp(new Date())
      .setFooter({
        text: "Atlas E-Clip Bot",
        iconURL:
          "https://storage.googleapis.com/image-bucket-atlas-points-bot/logo.png"
      });

    interaction.reply({ embeds: [transactionSummary] });
  }
};

export default Give;
