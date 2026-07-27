/**
 * Import a single state's MLAs by code (see config/states.json).
 *
 * Usage:
 *   npm run import:state up
 *   npm run import:state -- up --dry-run --download-images
 *   tsx scripts/import-state.ts up
 */
import * as path from 'path';
import { ImportLogger } from './lib/logger';
import { ImportRunOptions, executeImport, resolveSingleStateJob } from './lib/importCore';

interface CliOptions extends ImportRunOptions {
  code?: string;
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
    } else if (!arg.startsWith('-') && !options.code) {
      options.code = arg;
    }
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const log = new ImportLogger();

  if (!options.code) {
    console.error('Usage: npm run import:state <code>   (e.g. npm run import:state up)');
    console.error('State codes are defined in config/states.json.');
    process.exit(1);
  }

  const dotenv = await import('dotenv');
  const envPath = process.env.DOTENV_PATH || path.resolve(process.cwd(), '.env');
  const dotenvResult = dotenv.config({ path: envPath });
  if (dotenvResult.error && !options.dryRun) {
    log.error(`Unable to load env file at ${envPath}: ${dotenvResult.error}`);
    await log.flush();
    process.exit(1);
  }

  const job = await resolveSingleStateJob(options.code, options.configPath, log);
  await executeImport([job], options, log);
}

main().catch(async (error) => {
  console.error('Importer failed:', error);
  process.exit(1);
});
