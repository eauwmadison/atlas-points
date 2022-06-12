import dotenv from "dotenv";
import { Client, Guild, Intents, MessageEmbed, User } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes /*, Snowflake */ } from "discord-api-types/v9";

import {
  registerGuildIfNotExists,
  registerUserIfNotExists,
  getUserPoints,
  addUserPoints
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
    .setDescription("Send points to another user"),
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check if the bot is responding")
].map((command) => command.toJSON());

// create a new Discord client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
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

    getUserPoints(interaction.guildId!, "some-user-id").then((points) => {
      const userSummary = new MessageEmbed()
        .setColor("#0B0056")
        .setTitle("Point Summary for " + user.username)
        .setAuthor({
          name: "Atlas Points",
          iconURL:
            "https://storage.googleapis.com/image-bucket-atlas-points-bot/logo.png",
          url: "https://atlasfellowship.org"
        })
        .setThumbnail(user.avatarURL()!)
        .addFields(
          { name: "Ranking", value: "#1", inline: true },
          {
            name: "Points",
            value: points.toString(),
            inline: true
          }
        )
        .setTimestamp(new Date());

      interaction.reply({ embeds: [userSummary] });
    });
  } else if (interaction.commandName === "add") {
    const amount = interaction.options.getInteger("amount");
    const user = interaction.options.getUser("user") || interaction.user;

    addUserPoints(interaction.guildId!, "some-user-id", amount!).then(() =>
      interaction.reply(`Added ${amount} points to ${user.username}`)
    );
  } else if (interaction.commandName === "leaderboard") {
    const guild = interaction.guild;

    // const users = await

    const guildSummary = new MessageEmbed()
      .setColor("#0B0056")
      .setTitle("Leaderboard for " + guild!.name || "current server")
      .setAuthor({
        name: "Atlas Points",
        iconURL:
          "https://storage.googleapis.com/image-bucket-atlas-points-bot/logo.png",
        url: "https://atlasfellowship.org"
      })
      .setThumbnail(guild!.iconURL() || "")
      .addFields(
        {
          name: "Member",
          value: "1",
          inline: true
        },
        { name: "Points", value: "1", inline: true }
      )
      .setTimestamp(new Date());

    await interaction.reply({ embeds: [guildSummary] });
  }
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
