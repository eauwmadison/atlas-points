import { CommandInteraction, Client, MessageEmbed } from "discord.js";
import { getUserPoints, givePoints } from "../db/db";

import { Command } from "../command";

const Give: Command = {
  name: "give",
  description: "Send points to another user",
  type: "CHAT_INPUT",
  options: [
    {
      name: "amount",
      description: "the number of points to add",
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
    const recipient = interaction.options.getUser("recipient")!;

    await givePoints(interaction.guildId!, donor.id, recipient.id, amount);

    Promise.all([
      getUserPoints(interaction.guildId!, donor.id),
      getUserPoints(interaction.guildId!, recipient.id)
    ]).then((points) => {
      const transactionSummary = new MessageEmbed()
        .setColor("#0B0056")
        .setTitle("Transaction Complete")
        .setAuthor({
          name: `${recipient.tag}`,
          iconURL: donor.avatarURL()!
        })
        .setDescription(
          `<@${donor.id}> donated ${amount} point${
            amount === 1 ? "" : "s"
          } to <@${recipient.id}>`
        )
        .addFields(
          {
            name: `${donor.username}'s Total`,
            value: `${points[0]}`,
            inline: true
          },
          {
            name: `${recipient.username}'s Total`,
            value: `${points[1]}`,
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
    });
  }
};

export default Give;
