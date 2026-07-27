/**
 * Import every configured state's MLAs. States with no data file yet
 * (config/states.json entries whose data/import/<code>_mlas.json doesn't
 * exist) are skipped and logged, not treated as an error - safe to re-run
 * as more states' source data arrives.
 *
 * Usage:
 *   npm run import:all
 *   npm run import:all -- --dry-run --download-images
 *   tsx scripts/import-all.ts
 */
import * as path from 'path';
import { ImportLogger } from './lib/logger';
import { ImportRunOptions, executeImport, resolveAllStateJobs } from './lib/importCore';

interface CliOptions extends ImportRunOptions {
  configPath: string;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    configPath: 'config/states.json',
    dryRun: false,
    downloadImages: false
  };

  for (const arg of argv) {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--download-images') {
      options.downloadImages = true;
    } else if (arg.startsWith('--config=')) {
      options.configPath = arg.slice('--config='.length);
    } else if (arg.startsWith('--chunk-size=')) {
      options.chunkSize = Number(arg.slice('--chunk-size='.length)) || undefined;
    }
  }

  return options;
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

  const jobs = await resolveAllStateJobs(options.configPath, log);
  await executeImport(jobs, options, log);
}

main().catch(async (error) => {
  console.error('Importer failed:', error);
  process.exit(1);
});
