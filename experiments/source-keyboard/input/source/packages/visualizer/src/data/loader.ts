import type { CodeMap } from "../types.js";

export interface LoadResult {
  ok: true;
  data: CodeMap;
}

export interface LoadError {
  ok: false;
  error: string;
}

export type LoadOutcome = LoadResult | LoadError;

/**
 * Fetch and validate a codemap.json file.
 * Returns the parsed data or an error message.
 */
export async function loadCodeMap(url = "/codemap.json"): Promise<LoadOutcome> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return { ok: false, error: `Failed to fetch ${url}: ${res.status} ${res.statusText}` };
    }

    const data: unknown = await res.json();
    return validateCodeMap(data);
  } catch (err) {
    return { ok: false, error: `Network error: ${(err as Error).message}` };
  }
}

/** Validate the shape of a parsed JSON object */
function validateCodeMap(data: unknown): LoadOutcome {
  if (typeof data !== "object" || data === null) {
    return { ok: false, error: "Invalid codemap.json: not an object" };
  }

  const obj = data as Record<string, unknown>;

  // meta is required
  if (!obj.meta || typeof obj.meta !== "object") {
    return { ok: false, error: "Invalid codemap.json: missing meta" };
  }

  const meta = obj.meta as Record<string, unknown>;

  if (typeof meta.version !== "string") {
    return { ok: false, error: "Invalid codemap.json: meta.version is not a string" };
  }

  // fileTree is required
  if (!obj.fileTree || typeof obj.fileTree !== "object") {
    return { ok: false, error: "Invalid codemap.json: missing fileTree" };
  }

  // Warn on major version mismatch (but don't fail)
  const [major] = (meta.version as string).split(".").map(Number);
  if (major > 1) {
    console.warn(
      `CodeMap schema v${meta.version} may not be fully supported (expected v1.x.x)`,
    );
  }

  return { ok: true, data: data as unknown as CodeMap };
}
