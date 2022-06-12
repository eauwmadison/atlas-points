import { CommandInteraction, Client, Interaction } from "discord.js";
import { Command } from "../command";

const handleCommand = async (
  client: Client,
  commands: Command[],
  interaction: CommandInteraction
): Promise<void> => {
  const command = commands.find((c) => c.name === interaction.commandName);
  if (!command) {
    interaction.followUp({ content: "Could not find specified command" });
    return;
  }

  command.execute(client, interaction);
};

export default (client: Client, commands: Command[]): void => {
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (interaction.isCommand()) {
      await handleCommand(client, commands, interaction);
    }
  });
};
