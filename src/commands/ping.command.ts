import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription('Replies with "Pong!" to test the bot\'s connection'),
  async execute(interaction: CommandInteraction) {
    await interaction.reply("Pong!");
  }
};
