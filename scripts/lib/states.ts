import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * A single state/UT the MLA import pipeline can process. `pdf` is the
 * source list PDF a state coordinator drops in locally; `dataFile` and
 * `imageDir` are derived by convention so config/states.json only has to
 * name the state, its code, and where its PDF lives - nothing else.
 */
export interface StateConfig {
  name: string;
  code: string;
  pdf: string;
  dataFile: string;
  imageDir: string;
}

interface RawStateConfig {
  name: string;
  code: string;
  pdf: string;
}

const DEFAULT_CONFIG_PATH = 'config/states.json';

function withDerivedPaths(raw: RawStateConfig): StateConfig {
  return {
    ...raw,
    dataFile: `data/import/${raw.code}_mlas.json`,
    imageDir: `storage/leaders/${raw.code}`
  };
}

export async function loadStates(configPath: string = DEFAULT_CONFIG_PATH): Promise<StateConfig[]> {
  const absolutePath = path.resolve(process.cwd(), configPath);
  const contents = await fs.readFile(absolutePath, 'utf-8');
  const raw = JSON.parse(contents) as RawStateConfig[];

  if (!Array.isArray(raw)) {
    throw new Error(`${configPath} must contain a JSON array of state entries.`);
  }

  const seenCodes = new Set<string>();
  for (const entry of raw) {
    if (!entry.name || !entry.code || !entry.pdf) {
      throw new Error(`Invalid entry in ${configPath}: each state needs a name, code, and pdf path.`);
    }
    if (seenCodes.has(entry.code)) {
      throw new Error(`Duplicate state code '${entry.code}' in ${configPath}.`);
    }
    seenCodes.add(entry.code);
  }

  return raw.map(withDerivedPaths);
}

export async function getState(code: string, configPath?: string): Promise<StateConfig> {
  const states = await loadStates(configPath);
  const match = states.find((s) => s.code === code);
  if (!match) {
    const known = states.map((s) => s.code).join(', ');
    throw new Error(`Unknown state code '${code}'. Configured codes: ${known}`);
  }
  return match;
}
