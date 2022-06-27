import { CommandInteraction, User, MessageEmbed, Client } from "discord.js";
import { incrementUserPoints, getUserPoints, getLogChannel } from "../db/db";

export default async function incrementSingleUserPoints(
  client: Client,
  guildId: string,
  user: User,
  amount: number
): Promise<MessageEmbed> {

  // first change the user's points
  const amountChange = await incrementUserPoints(guildId, user.id, amount);

  const amountMagnitude = Math.abs(amountChange);
  const changePhrase = amount > 0 ? "added to" : "removed from";

  const transactionSummary = new MessageEmbed()
    .setColor("#53DD6C")
    .setTitle("E-Clip Transaction Complete")
    .setAuthor({
      name: `${user.tag}`,
      iconURL: user.avatarURL() || user.defaultAvatarURL
    })
    .setDescription(
      `**${amountMagnitude}** E-Clip${amountMagnitude === 1 ? "" : "s"
      } ${changePhrase} <@${user.id}>'s balance!`
    )
    .addFields({
      name: "New Balance",
      value: `${await getUserPoints(guildId, user.id)}`,
      inline: true
    })
    .setTimestamp(new Date())
    .setFooter({
      text: "Atlas E-Clips",
      iconURL:
        "https://storage.googleapis.com/image-bucket-atlas-points-bot/logo.png"
    });

  // log to configured channel
  const logChannelId = await getLogChannel(guildId);

  if (logChannelId) {
    const logChannel = client.channels.cache.get(logChannelId);
    if (logChannel && logChannel.isText()) {
      logChannel.send({ embeds: [transactionSummary] });
    }
  }

  return transactionSummary;
}
