import { readFile, writeFile } from "node:fs/promises";

export type Tool = {
  schema: object;
  needsApproval?: boolean;
  execute: (args: any) => Promise<string>;
};

export const toolRegistry: Record<string, Tool> = {
  read_file: {
    schema: {
      type: "function",
      function: {
        name: "read_file",
        description: "This tool use to read file ",
        parameters: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Path of file",
            },
          },
          required: ["path"],
        },
      },
    },
    execute: async (args: any) => {
      const contentFile = await readFile(args.path, "utf-8");
      return contentFile;
    },
  },
  write_file: {
    needsApproval: true,
    schema: {
      type: "function",
      function: {
        name: "write_file",
        description: "This tool use to write file ",
        parameters: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Path of file",
            },
            content: {
              type: "string",
              description: "Content of file",
            },
          },
          required: ["path", "content"],
        },
      },
    },
    execute: async (args: any) => {
      await writeFile(args.path, args.content, "utf-8");
      return `Wrote ${args.content.length} bytes to ${args.path}`;
    },
  },
};
