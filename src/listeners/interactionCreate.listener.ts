import { CommandInteraction, Client, Interaction } from "discord.js";
import { Command } from "../command";

import displayErrorMessage from "../utils/displayErrorMessage.util";

const handleCommand = async (
  client: Client,
  commands: Command[],
  interaction: CommandInteraction
): Promise<void> => {
  const command = commands.find((c) => c.name === interaction.commandName);
  if (!command) {
    await displayErrorMessage(interaction, "Could not find specified command");
    return;
  }

  try {
    command.execute(client, interaction);
  } catch (e) {
    console.log(e);
    await displayErrorMessage(
      interaction,
      "An internal error occurred while executing this command."
    );
  }
};

export default (client: Client, commands: Command[]): void => {
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (interaction.isCommand()) {
      await handleCommand(client, commands, interaction);
    } else if (interaction.isRepliable()) {
      interaction.reply("Interaction type is not yet supported.");
    } else {
      console.log("Encountered unhandled interaction: ", interaction.type);
    }
  });
};
