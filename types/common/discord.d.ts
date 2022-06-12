import { Message } from "discord.js";

declare module "discord.js" {
  export interface Command {
    name: string;
    description: string;
    execute: (message: Message, args: string[]) => Promise<SomeType>;
  }
  export interface Client {
    commands: Collection<unknown, Command>;
  }
}
