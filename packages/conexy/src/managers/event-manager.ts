import { Client } from "discord.js";
import { EventFileModule } from "../registry/event-registry";
import { FilesSystem } from "../utils/files-system";

export class EventManager {
  private category: string;
  private module: EventFileModule;

  constructor(category: string, module: EventFileModule) {
    this.category = category
    this.module = module
  }

  async load(client: Client) {
    const { name, ext } = this.module
    const fs = new FilesSystem(`events/${this.category}`);
    const files = fs.read('file');

    for (const file of files) {
      if (file.name !== name || file.ext !== ext) {
        continue;
      }

      const mod = await import(file.fullPath)
      const listener = mod.default

      client.on(this.category, listener)
    }
  }
}