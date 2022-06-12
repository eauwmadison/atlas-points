import { BaseCommandInteraction, Client, Interaction } from "discord.js";
import { Command } from "../command";

const handleCommand = async (
  client: Client,
  commands: Command[],
  interaction: BaseCommandInteraction
): Promise<void> => {
  const command = commands.find((c) => c.name === interaction.commandName);
  if (!command) {
    interaction.followUp({ content: "An error has occurred" });
    return;
  }

  command.execute(client, interaction);
};

export default (client: Client, commands: Command[]): void => {
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (interaction.isCommand() || interaction.isContextMenu()) {
      await handleCommand(client, commands, interaction);
    }
  });
};
