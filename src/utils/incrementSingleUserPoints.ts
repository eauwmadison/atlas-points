import { CommandInteraction, User, MessageEmbed, Client } from "discord.js";
import { incrementUserPoints, getUserPoints } from "../db/db";

export default async function incrementSingleUserPoints(
  client: Client,
  guildId: string,
  user: User,
  amount: number,
  memo: string
): Promise<MessageEmbed> {

  // first change the user's points
  const amountChange = await incrementUserPoints(guildId, user.id, amount);

  const amountMagnitude = Math.abs(amountChange);
  const changePhrase = amount > 0 ? "added to" : "removed from";

  const memoString = memo === "" ? "" : `\n\nMemo: **${memo}**`;

  const transactionSummary = new MessageEmbed()
    .setColor("#53DD6C")
    .setTitle("E-Clip Transaction Complete")
    .setAuthor({
      name: `${user.tag}`,
      iconURL: user.avatarURL() || user.defaultAvatarURL
    })
    .setDescription(
      `**${amountMagnitude}** E-Clip${amountMagnitude === 1 ? "" : "s"
      } ${changePhrase} <@${user.id
      }>'s balance!${memoString}`
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


  return transactionSummary;
}
