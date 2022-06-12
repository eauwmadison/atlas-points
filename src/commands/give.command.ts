import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { getUserPoints, givePoints } from "../db/db";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("give")
    .setDescription("Send points to another user")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("the number of points to add")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("recipient")
        .setDescription("the user to give points to")
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    const amount = interaction.options.getInteger("amount")!;
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
            amount === 1 ? `` : `s`
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
