import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Minimal shared logger for the import pipeline: every line goes to the
 * console (so a human watching the run sees it live) and is appended to
 * logs/import.log (so a scheduled/CI run leaves a durable record). Kept
 * deliberately dependency-free.
 */
export class ImportLogger {
  private logPath: string;
  private buffer: string[] = [];

  constructor(logPath: string = 'logs/import.log') {
    this.logPath = logPath;
  }

  private line(level: string, message: string) {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] [${level}] ${message}`;
    this.buffer.push(entry);
    if (level === 'ERROR') {
      console.error(message);
    } else {
      console.log(message);
    }
  }

  info(message: string) {
    this.line('INFO', message);
  }

  warn(message: string) {
    this.line('WARN', message);
  }

  error(message: string) {
    this.line('ERROR', message);
  }

  async flush() {
    const absolutePath = path.resolve(process.cwd(), this.logPath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.appendFile(absolutePath, this.buffer.join('\n') + '\n', 'utf-8');
    this.buffer = [];
  }
}
