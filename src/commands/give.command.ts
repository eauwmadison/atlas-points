import { CommandInteraction, Client, MessageEmbed } from "discord.js";
import { getUserPoints, givePoints } from "../db/db";

import { Command } from "../command";
import { displayErrorMessage } from "../utils";

const Give: Command = {
  name: "give",
  description: "transfer points to another user",
  type: "CHAT_INPUT",
  options: [
    {
      name: "amount",
      description: "the number of points to give",
      type: "INTEGER",
      required: true,
      minValue: 1
    },
    {
      name: "recipient",
      description: "the user to give points to",
      type: "USER",
      required: true
    }
  ],
  execute: async (_client: Client, interaction: CommandInteraction) => {
    const amount = interaction.options.getInteger("amount")!; // TODO: fix types
    const donor = interaction.user;
    const recipient = interaction.options.getUser("recipient");

    if (recipient === null) {
      await displayErrorMessage(interaction, "Must specify recipient");
    } else if(recipient.id === donor.id) {
      await displayErrorMessage(interaction, "Cannot give to yourself");
    } else {
      const amountGiven = await givePoints(interaction.guildId!, donor.id, recipient.id, amount);

      const donorPoints = await getUserPoints(interaction.guildId!, donor.id);
      const recipientPoints = await getUserPoints(interaction.guildId!, recipient.id);

      const transactionSummary = new MessageEmbed()
        .setColor("#0B0056")
        .setTitle("Transaction Complete")
        .setAuthor({
          name: `${recipient.tag}`,
          iconURL: donor.avatarURL()!
        })
        .setDescription(
          `<@${donor.id}> donated ${amountGiven} point${amountGiven  === 1 ? "" : "s"
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
          text: "Atlas Points",
          iconURL:
            "https://storage.googleapis.com/image-bucket-atlas-points-bot/logo.png"
        });

      interaction.reply({ embeds: [transactionSummary] });
    }
  }
};

export default Give;
