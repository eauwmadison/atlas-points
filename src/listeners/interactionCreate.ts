import { CommandInteraction, Client, Interaction } from "discord.js";
import { Command } from "../command";

import { errorMessage } from "../utils/displayErrorMessage.util";

const handleCommand = async (
  client: Client,
  commands: Command[],
  interaction: CommandInteraction
): Promise<void> => {

  const command = commands.find((c) => c.name === interaction.commandName);
  if (!command) {
    const reply = errorMessage("Could not find specified command");
    await interaction.reply({ embeds: [reply] });
    return;
  }

  try {
    await command.execute(client, interaction);
  } catch (e) {
    console.log(e);
    const reply = errorMessage("An internal error occurred while executing this command.");
    if (interaction.channel) {
      interaction.channel.send({ embeds: [reply] });
    }
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
