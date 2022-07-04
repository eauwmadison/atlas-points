import { CommandInteraction, Role, MessageEmbed, Client } from "discord.js";
import { incrementUserPoints, getUserPoints, getLogChannel } from "../db/db";

// increment all users in role's points (can be negative!)
export default async function incrementRolePoints(
  client: Client,
  guildId: string,
  role: Role,
  amount: number,
  memo: string
): Promise<MessageEmbed> {

  // fetch all members for role
  await role.guild.members.fetch();

  // first increment points for each member in role
  const promises = [];
  for (const [, member] of role.members) {
    promises.push(incrementUserPoints(guildId, member.user.id, amount));
  }
  const incrementedAmounts = await Promise.all(promises);

  const amountMagnitude = Math.abs(amount);
  const changePhrase = amount > 0 ? "added to" : "removed from";

  // then output the results
  const affectedUsers: [string, number | undefined][] = [];

  for (const [, member] of role.members) {
    const { id } = member.user;
    // TODO: fix balance to use new value rather than old one
    const balance = await getUserPoints(guildId, id);
    affectedUsers.push([id, balance]);
  }

  let list = affectedUsers
    .map((user) => `⦁ <@${user[0]}> — New Balance: **${user[1]}** E-Clips`)
    .slice(0, 10)
    .join("\n");

  if (affectedUsers.length > 10) {
    list += `\n\n**Truncated - ${affectedUsers.length - 10} more**`;
  }

  const memoString = memo === "" ? "" : `\n\nMemo: **${memo}**`;

  const transactionSummary = new MessageEmbed()
    .setColor(role.color)
    .setTitle("E-Clip Transaction Complete")
    .setDescription(
      `**${amountMagnitude}** E-Clip${amountMagnitude === 1 ? "" : "s"
      } ${changePhrase} members with the role <@&${role.id}>.\n\n${list
      }${memoString}`
    )
    .setTimestamp(new Date())
    .setFooter({
      text: "Atlas E-Clips",
      iconURL:
        "https://storage.googleapis.com/image-bucket-atlas-points-bot/logo.png"
    });

  return transactionSummary;
}
