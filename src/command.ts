import {
  CommandInteraction,
  ChatInputApplicationCommandData,
  Client
} from "discord.js";

export interface Command extends ChatInputApplicationCommandData {
  execute: (client: Client, interaction: CommandInteraction) => void;
}
