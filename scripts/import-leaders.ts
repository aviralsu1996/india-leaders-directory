/**
 * Generic leader importer - the original, most flexible entrypoint.
 * Prefer scripts/import-state.ts / scripts/import-all.ts for the day-to-day
 * MLA pipeline; this one stays around for the legacy data-store.json path
 * and for ad-hoc --file=<path> imports. All three share the same core
 * logic in scripts/lib/importCore.ts - nothing here is duplicated.
 *
 * Usage:
 *   tsx scripts/import-leaders.ts                        # legacy data-store.json
 *   tsx scripts/import-leaders.ts --file=<path>
 *   tsx scripts/import-leaders.ts --state=<code>
 *   tsx scripts/import-leaders.ts --all-states
 *   (+ --dry-run, --download-images, --image-dir=<code>, --config=<path>)
 */
import * as path from 'path';
import { ImportLogger } from './lib/logger';
import {
  ImportJob,
  ImportRunOptions,
  executeImport,
  legacyDefaultJob,
  legacyFileJob,
  resolveAllStateJobs,
  resolveSingleStateJob
} from './lib/importCore';

interface CliOptions extends ImportRunOptions {
  file?: string;
  state?: string;
  allStates: boolean;
  imageDirOverride?: string;
  configPath: string;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    allStates: false,
    configPath: 'config/states.json',
    dryRun: false,
    downloadImages: false
  };

  for (const arg of argv) {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--all-states') {
      options.allStates = true;
    } else if (arg === '--download-images') {
      options.downloadImages = true;
    } else if (arg.startsWith('--file=')) {
      options.file = arg.slice('--file='.length);
    } else if (arg.startsWith('--state=')) {
      options.state = arg.slice('--state='.length);
    } else if (arg.startsWith('--image-dir=')) {
      options.imageDirOverride = arg.slice('--image-dir='.length);
    } else if (arg.startsWith('--config=')) {
      options.configPath = arg.slice('--config='.length);
    } else if (arg.startsWith('--chunk-size=')) {
      options.chunkSize = Number(arg.slice('--chunk-size='.length)) || undefined;
    }
  }

  return options;
}

async function resolveJobs(options: CliOptions, log: ImportLogger): Promise<ImportJob[]> {
  if (options.file) return [legacyFileJob(options.file, options.imageDirOverride)];
  if (options.state) return [await resolveSingleStateJob(options.state, options.configPath, log)];
  if (options.allStates) return resolveAllStateJobs(options.configPath, log);
  return [legacyDefaultJob()];
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const log = new ImportLogger();

  const dotenv = await import('dotenv');
  const envPath = process.env.DOTENV_PATH || path.resolve(process.cwd(), '.env');
  const dotenvResult = dotenv.config({ path: envPath });
  if (dotenvResult.error && !options.dryRun) {
    log.error(`Unable to load env file at ${envPath}: ${dotenvResult.error}`);
    await log.flush();
    process.exit(1);
  }

  const jobs = await resolveJobs(options, log);
  await executeImport(jobs, options, log);
}

main().catch(async (error) => {
  console.error('Importer failed:', error);
  process.exit(1);
});
