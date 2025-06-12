import { FilesSystem } from "../utils/files-system";
import { Logging } from "../utils/logging";

export interface EventFileModule { name: string, ext: string }
export interface EventRegistryProps {
  name: string;
  modules: EventFileModule[];
}

export class EventRegistry {
  public async register(): Promise<EventRegistryProps[]> {
    const events: EventRegistryProps[] = []
    const fs = new FilesSystem('events');
    const groups = fs.read('directory');

    new Logging('info', `Register events with modules`);

    for (const category of groups) {
      const groupPath = `events/${category.name}`;
      const moduleFiles = new FilesSystem(groupPath);
      const files = moduleFiles.read("file");

      const modules: EventFileModule[] = []

      for (const file of files) {
        try {
          const module = await import(file.fullPath);

          if (typeof module.default !== 'function') {
            new Logging('warn', `Skipping ${file.name}.${file.ext} — no default export`);
            continue;
          }

          modules.push({ name: file.name, ext: file.ext as string });
        } catch (error) {
          new Logging('error', `Failed to import ${file.fullPath}: ${error}`);
        }
      }

      events.push({ name: category.name, modules });
    }

    const countModules = events.reduce((acc, cur) => acc + cur.modules.length, 0)
    new Logging('success', `Registered ${events.length} events includes ${countModules} modules`);
    return events
  }
}