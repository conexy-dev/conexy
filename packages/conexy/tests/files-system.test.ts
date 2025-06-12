import fs from "fs";
import { FilesSystem } from "../src/utils/files-system";

jest.mock("fs");
const mockReaddirSync = fs.readdirSync as jest.Mock;

describe("Files System class testing", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env.NODE_ENV = "development";
  });

  it("should read directory names only", () => {
    const arrayMockFileSystem = [
      {
        name: "ready",
        isFile: () => false,
        isDirectory: () => true,
      },
      {
        name: "interactionCreate",
        isFile: () => false,
        isDirectory: () => true,
      },
    ]

    mockReaddirSync.mockReturnValue(arrayMockFileSystem);

    const fsInstance = new FilesSystem("events");
    const result = fsInstance.read("directory");

    expect(result).toEqual([
      { name: "ready", fullPath: expect.stringContaining("events/ready"), type: "directory" },
      { name: "interactionCreate", fullPath: expect.stringContaining("events/interactionCreate"), type: "directory" },
    ]);

    expect(mockReaddirSync).toHaveBeenCalled();
  });

  it("should read file names only", () => {
    const arrayMockFileSystem = [
      {
        name: "init.ts",
        isFile: () => true,
        isDirectory: () => false,
      },
      {
        name: "log.ts",
        isFile: () => true,
        isDirectory: () => false,
      },
    ]

    mockReaddirSync.mockReturnValue(arrayMockFileSystem);

    const fsInstance = new FilesSystem("events");
    const result = fsInstance.read("file");

    expect(result).toEqual([
      { name: "init.ts", fullPath: expect.stringContaining("events/init.ts"), type: "file", ext: ".ts" },
      { name: "log.ts", fullPath: expect.stringContaining("events/log.ts"), type: "file", ext: ".ts" },
    ]);
  });

  it("should read both files and folders when filter is 'all'", () => {
    const arrayMockFileSystem = [
      {
        name: "commands",
        isFile: () => false,
        isDirectory: () => true,
      },
      {
        name: "ping.ts",
        isFile: () => true,
        isDirectory: () => false,
      },
    ]

    mockReaddirSync.mockReturnValue(arrayMockFileSystem);

    const fsInstance = new FilesSystem("commands");
    const result = fsInstance.read("all");

    expect(result).toEqual([
      { name: "commands", fullPath: expect.stringContaining("commands/commands"), type: "directory" },
      { name: "ping.ts", fullPath: expect.stringContaining("commands/ping.ts"), type: "file", ext: ".ts" },
    ]);
  });

  it("should handle recursive reading", () => {
    const nested = [
      {
        name: "ready",
        isFile: () => false,
        isDirectory: () => true,
      },
    ];

    const nestedFiles = [
      {
        name: "init.ts",
        isFile: () => true,
        isDirectory: () => false,
      },
    ];

    mockReaddirSync.mockReturnValueOnce(nested).mockReturnValueOnce(nestedFiles);

    const fsInstance = new FilesSystem("events", true);
    const result = fsInstance.read("file");

    expect(result).toEqual([
      { name: "init.ts", fullPath: expect.stringContaining("ready/init.ts"), type: "file", ext: ".ts" },
    ]);
    expect(mockReaddirSync).toHaveBeenCalledTimes(2);
  });
});
