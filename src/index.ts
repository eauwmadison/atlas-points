import dotenv from "dotenv";
import { cert, initializeApp, ServiceAccount } from "firebase-admin/app";
import { /* FieldValue, */ getFirestore } from "firebase-admin/firestore";
import { Client, Guild, Intents, MessageEmbed, User } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes /*, Snowflake */ } from "discord-api-types/v9";

import serviceAccountKey from "../serviceAccountKey.json";

dotenv.config();

// initialize Firebase
initializeApp({
  credential: cert(serviceAccountKey as ServiceAccount)
});
const db = getFirestore();

const GuildExists = async (guild: Guild) => {
  const guildDoc = await db.collection("guilds").doc(guild.id).get();
  return guildDoc.exists;
};

// Register Guild in Firebase if not already registered
const RegisterGuild = async (guild: Guild) => {
  // if (!(await GuildExists(guild))) {
    console.log("Registering Guild#" + guild.id + " in database.");
    await db
      .collection("guilds")
      .doc(guild.id)
      .set({
        users: {
          "some-user-id": {
            points: 0
          },
          "some-other-user-id": {
            points: 0
          }
        }
      });
  // }
};

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

    RegisterGuild(guild);
  });
  client.user!.setActivity("your points!", { type: "WATCHING" });
});

client.on("guildMemberAdd", (member) => {
  // RegisterUser(member, member.guild.id);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "points") {
    const user = interaction.options.getUser("user") || interaction.user;

    console.log(user.username);

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
        {
          name: "Points",
          value: "1",
          inline: true
        },
        { name: "Ranking", value: "#1", inline: true }
      )
      .setTimestamp(new Date());

    await interaction.reply({ embeds: [userSummary] });
  }
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
