/**
 * Generates posts from a CSV of keywords.
 *
 * CSV columns:
 * keyword,status,delay_seconds,category
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const { csvPath, options } = parseArgs(process.argv.slice(2));
if (!csvPath) {
  console.log("Usage: npm run generate:batch -- keywords.csv [-- --no-images --dry-run --start-at 4]");
  process.exit(1);
}

const rows = parseCsv(readFileSync(csvPath, "utf8"));
const startAt = Number(options.startAt || 1);

for (let index = startAt - 1; index < rows.length; index++) {
  const row = rows[index];
  if (!row.keyword) continue;

  const args = ["scripts/generate-post.mjs", row.keyword];
  if (options.noImages) args.push("--no-images");
  if (options.dryRun) args.push("--dry-run");
  if (options.force) args.push("--force");
  if (options.stub) args.push("--stub");
  if (row.status) args.push("--status", row.status);
  if (row.category) args.push("--category", row.category);

  console.log(`\n[${index + 1}/${rows.length}] ${row.keyword}`);
  const result = spawnSync(process.execPath, args, { stdio: "inherit", env: process.env });
  if (result.status !== 0) process.exit(result.status ?? 1);

  const delaySeconds = Number(row.delay_seconds || options.delaySeconds || 0);
  if (delaySeconds > 0 && index < rows.length - 1) {
    await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));
  }
}

function parseArgs(args) {
  const options = {
    noImages: false,
    dryRun: false,
    force: false,
    stub: false,
  };
  const positional = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--") continue;
    else if (arg === "--no-images") options.noImages = true;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--force") options.force = true;
    else if (arg === "--stub") options.stub = true;
    else if (arg === "--start-at") options.startAt = args[++i];
    else if (arg === "--delay-seconds") options.delaySeconds = args[++i];
    else positional.push(arg);
  }

  return { csvPath: positional[0], options };
}

function parseCsv(raw) {
  const lines = raw.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];

  const headers = splitCsvLine(lines[0]).map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return Object.fromEntries(headers.map((header, i) => [header, values[i]?.trim() ?? ""]));
  });
}

function splitCsvLine(line) {
  const out = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      out.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  out.push(current);
  return out;
}
