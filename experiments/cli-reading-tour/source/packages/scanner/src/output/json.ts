import { writeFile } from "node:fs/promises";
import type { CodeMap } from "../types.js";

/** Write a CodeMap to a JSON file */
export async function writeCodeMap(codemap: CodeMap, outputPath: string): Promise<void> {
  const json = JSON.stringify(codemap, null, 2);
  await writeFile(outputPath, json, "utf-8");
}
