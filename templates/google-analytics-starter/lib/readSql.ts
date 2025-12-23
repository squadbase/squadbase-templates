"use server";

import { readFile } from "fs/promises";

export const readSql = async (filePath: `sql/${string}`): Promise<string> => {
  try {
    return await readFile(filePath, "utf-8");
  } catch (error) {
    throw new Error(`Failed to read SQL file: ${filePath}`);
  }
};
