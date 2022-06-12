import dotenv from "dotenv";
import { Client, Guild, Intents, MessageEmbed, User } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes /*, Snowflake */ } from "discord-api-types/v9";

import {
  registerGuildIfNotExists,
  registerUserIfNotExists,
  getUserPoints,
  addUserPoints,
  subtractUserPoints,
  givePoints,
  getRankings,
  getUserRank
} from "./db/db";

dotenv.config();

// define Discord bot commands
const commands = [
  new SlashCommandBuilder()
    .setName("points")
    .setDescription("View points for a user, role, or the entire server")
    .addUserOption((option) =>
      option.setName("user").setDescription("the user to target")
    )
    .addRoleOption((option) =>
      option.setName("role").setDescription("the role to target")
    )
    .addStringOption((option) =>
      option.setName("server").setDescription("rankings for this server")
    ),
  new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Display the top 10 members"),
  new SlashCommandBuilder()
    .setName("add")
    .setDescription(
      "Moderators can add points to a user, role, or the entire server"
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("the number of points to add")
        .setMinValue(0)
        .setRequired(true)
    )
    .addUserOption((option) =>
      option.setName("user").setDescription("the user to target")
    )
    .addRoleOption((option) =>
      option.setName("role").setDescription("the role to target")
    ),
  new SlashCommandBuilder()
    .setName("subtract")
    .setDescription(
      "Moderators can subtract points from a user, role, or the entire server"
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("the number of points to subtract")
        .setMinValue(0)
        .setRequired(true)
    )
    .addUserOption((option) =>
      option.setName("user").setDescription("the user to target")
    )
    .addRoleOption((option) =>
      option.setName("role").setDescription("the role to target")
    ),
  new SlashCommandBuilder()
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
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check if the bot is responding")
].map((command) => command.toJSON());

// create a new Discord client instance
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS]
});
const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN!);

// when the client is ready, run this code (only once)
client.once("ready", async () => {
  console.log(`Logged in as ${client.user!.tag} with ID ${client.user!.id}!`);
  client.guilds.cache.forEach((guild) => {
    rest
      .put(Routes.applicationGuildCommands(client.user!.id, guild.id), {
        body: commands
      })
      .then(() => console.log("Successfully registered application commands."))
      .catch(console.error);

    registerGuildIfNotExists(guild);
  });
  client.user!.setActivity("your points!", { type: "WATCHING" });
});

client.on("guildMemberAdd", async (member) => {
  await registerUserIfNotExists(member.guild.id, member.id);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "points") {
    const user = interaction.options.getUser("user") || interaction.user;

    const userSummary = new MessageEmbed()
      .setColor("#0B0056")
      .setTitle(`Point Summary for ${user.username}`)
      .setThumbnail(user.avatarURL()!)
      .addFields(
        {
          name: "Ranking",
          value: `#${await getUserRank(interaction.guildId!, user.id)}`,
          inline: true
        },
        {
          name: "Total Points",
          value: `${await getUserPoints(interaction.guildId!, user.id)}`,
          inline: true
        }
      )
      .setTimestamp(new Date());

    interaction.reply({ embeds: [userSummary] });
  } else if (interaction.commandName === "add") {
    const amount = interaction.options.getInteger("amount");
    const user = interaction.options.getUser("user") || interaction.user;

    await addUserPoints(interaction.guildId!, user.id, amount!);

    const transactionSummary = new MessageEmbed()
      .setColor("#0B0056")
      .setTitle("Transaction Complete")
      .setAuthor({
        name: `${user.tag}`,
        iconURL: user.avatarURL()!
      })
      .setDescription(
        `${amount} point${amount === 1 ? `` : `s`} added to <@${
          user.id
        }>'s total!`
      )
      .addFields({
        name: "Total Points",
        value: `${await getUserPoints(interaction.guildId!, user.id)}`,
        inline: true
      })
      .setTimestamp(new Date())
      .setFooter({
        text: "Atlas Points",
        iconURL:
          "https://storage.googleapis.com/image-bucket-atlas-points-bot/logo.png"
      });

    interaction.reply({ embeds: [transactionSummary] });
  } else if (interaction.commandName === "give") {
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
  } else if (interaction.commandName === "subtract") {
    const amount = interaction.options.getInteger("amount");
    const user = interaction.options.getUser("user") || interaction.user;

    await subtractUserPoints(interaction.guildId!, user.id, amount!);

    const transactionSummary = new MessageEmbed()
      .setColor("#0B0056")
      .setTitle("Transaction Complete")
      .setAuthor({
        name: `${user.tag}`,
        iconURL: user.avatarURL()!
      })
      .setDescription(
        `${amount} point${amount === 1 ? `` : `s`} removed from <@${
          user.id
        }>'s total!`
      )
      .addFields({
        name: "Total Points",
        value: `${await getUserPoints(interaction.guildId!, user.id)}`,
        inline: true
      })
      .setTimestamp(new Date())
      .setFooter({
        text: "Atlas Points",
        iconURL:
          "https://storage.googleapis.com/image-bucket-atlas-points-bot/logo.png"
      });

    interaction.reply({ embeds: [transactionSummary] });
  } else if (interaction.commandName === "leaderboard") {
    const guild = interaction.guild;

    const results = await getRankings(guild!.id);

    const list = results
      .map((result: any, index) => {
        return `${index + 1}) <@${result[0]}> — **${result[1].points}** points`;
      })
      .join("\n");

    const guildSummary = new MessageEmbed()
      .setColor("#0B0056")
      .setTitle("Leaderboard for " + guild!.name || "current server")
      .setAuthor({
        name: "Atlas Points",
        iconURL:
          "https://storage.googleapis.com/image-bucket-atlas-points-bot/logo.png",
        url: "https://atlasfellowship.org"
      })
      .setThumbnail(
        guild!.iconURL() ||
          "https://storage.googleapis.com/image-bucket-atlas-points-bot/logo.png"
      )
      .setDescription(list)
      .setTimestamp(new Date());

    await interaction.reply({ embeds: [guildSummary] });
  } else if (interaction.commandName === "ping") {
    await interaction.reply("pong");
  }
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
