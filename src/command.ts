import {
  BaseCommandInteraction,
  ChatInputApplicationCommandData,
  Client
} from "discord.js";

export interface Command extends ChatInputApplicationCommandData {
  execute: (client: Client, interaction: BaseCommandInteraction) => void;
}
