import { CommandInteraction, Role, MessageEmbed, Client } from "discord.js";
import { incrementUserPoints, getUserPoints, getLogChannel } from "../db/db";

// increment all users in role's points (can be negative!)
export default async function incrementRolePoints(
  client: Client,
  guildId: string,
  role: Role,
  amount: number
): Promise<MessageEmbed> {

  // fetch all members for role
  await role.guild.members.fetch();

  // first increment points for each member in role
  for(const [,member] of role.members) {
    await incrementUserPoints(guildId, member.user.id, amount);
  }

  const amountMagnitude = Math.abs(amount);
  const changePhrase = amount > 0 ? "added to" : "removed from";

  // then output the results
  const affectedUsers: [string, number | undefined][] = [];

  for(const [,member] of role.members) {
    const { id } = member.user;
    // TODO: fix balance to use new value rather than old one
    const balance = await getUserPoints(guildId, id);
    affectedUsers.push([id, balance]);
  }

  const list = affectedUsers
    .map((user) => `⦁ <@${user[0]}> — New Balance: **${user[1]}** E-Clips`)
    .join("\n");

  const transactionSummary = new MessageEmbed()
    .setColor(role.color)
    .setTitle("E-Clip Transaction Complete")
    .setDescription(
      `**${amountMagnitude}** E-Clip${
        amountMagnitude === 1 ? "" : "s"
      } ${changePhrase} members with the role <@&${role.id}>.\n\n${list}`
    )
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
