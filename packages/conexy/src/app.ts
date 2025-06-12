import { Client } from "discord.js";
import { EventFileModule, EventRegistry } from "./registry/event-registry";
import { EventManager } from "./managers/event-manager";
import { Logging } from "./utils/logging";

export interface ConexyAppConfig {
  /**
   * The token for the Discord bot.
   * This is used to authenticate the bot with the Discord API.
   */
  token: string;

  /**
   * The directory where event files are located.
   * This is used to load event handlers dynamically.
   */
  eventsDirectory?: string;
}

/**
 * Main class to initialize and start a Discord bot using Conexy framework.
 */
export class App {
  private client: Client;
  private config: ConexyAppConfig;

  /**
   * @param client Discord.js Client instance
   * @param config Configuration object including bot token and optional event directory
   */
  constructor(client: Client, config: ConexyAppConfig) {
    this.client = client;
    this.config = config;
  }

  private async events() {
    const registry = await new EventRegistry().register()

    for (const category of registry) {
      for (const module of category.modules as EventFileModule[]) {
        const manager = new EventManager(category.name, module)
        await manager.load(this.client)
      }
    }
  }

  /**
   * Start the application:
   * - Registers events
   * - Sets up the ready listener
   * - Logs in the bot
   */
  public async start() {
    this.client.on('ready', (client) => {
      new Logging('info', `Online client as ${client.user.tag}`)
    })

    await this.events();

    try {
      await this.client.login(this.config.token);
    } catch (err) {
      new Logging('error', `Failed to login: ${err}`);
      process.exit(1);
    }
  }
}