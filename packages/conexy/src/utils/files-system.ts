import fs from "fs";
import path from "path";

export type FileType = 'file' | 'directory'

export interface FileEntry {
  name: string;
  fullPath: string;
  type: FileType;
  ext?: string;
}

export class FilesSystem {
  private basePath: string;

  constructor(private dir: string, private recursive = false) {
    const appFolder = process.env.NODE_ENV === "production" ? ".conexy" : "src";
    this.basePath = path.resolve(process.cwd(), appFolder, this.dir);
  }

  public read(filterType: "file" | "directory" | "all" = "all"): FileEntry[] {
    return this.readDir(this.basePath, filterType)
  }

  private readDir(currentPath: string, filterType: "file" | "directory" | "all"): FileEntry[] {
    const entries: FileEntry[] = [];
    const dirents = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of dirents) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        if (filterType === "directory" || filterType === "all") {
          const newData: FileEntry = {
            name: entry.name,
            fullPath,
            type: "directory",
          }

          entries.push(newData);
        }

        if (this.recursive) {
          entries.push(...this.readDir(fullPath, filterType));
        }
      }

      if (entry.isFile() && (filterType === "file" || filterType === "all")) {
        const newData: FileEntry = {
          name: entry.name,
          fullPath,
          type: "file",
          ext: path.extname(entry.name),
        }
        entries.push(newData);
      }
    }

    return entries;
  }
}