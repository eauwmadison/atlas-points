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
    const amount = interaction.options.getInteger("amount");
    const donor = interaction.user;
    const recipient = interaction.options.getUser("recipient");

    if (!interaction.guildId) {
      await displayErrorMessage(interaction, "You can't give points in a DM!");
      return;
    }

    if (!donor || !recipient) {
      await interaction.reply("You must specify a donor and a recipient!");
      return;
    }

    await givePoints(interaction.guildId, donor.id, recipient.id, amount || 0);

    Promise.all([
      getUserPoints(interaction.guildId, donor.id),
      getUserPoints(interaction.guildId, recipient.id)
    ]).then((points) => {
      const transactionSummary = new MessageEmbed()
        .setColor("#0B0056")
        .setTitle("Transaction Complete")
        .setAuthor({
          name: `${recipient.tag}`,
          iconURL:
            donor.avatarURL() ||
            "https://discordapp.com/assets/322c936a8c8be1b803cd94861bdfa868.png"
        })
        .setDescription(
          `<@${donor.id}> donated ${amount} point${
            amount === 1 ? "" : "s"
          } to <@${recipient.id}>`
        )
        .addFields(
          {
            name: `${donor.username}'s New Balance`,
            value: `${points[0]}`,
            inline: true
          },
          {
            name: `${recipient.username}'s New Balance`,
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
