import path from 'node:path';
import { generateIndexHtml } from '../../generate-index.mjs';

let raw = "";
for await (const chunk of process.stdin) raw += chunk;

try {
  const input = JSON.parse(raw);
  const file = String(input.tool_input?.path ?? "");
  const baseDir = input.cwd || process.cwd();

  // If path was relative, handle it; if an HTML file (other than index.html) was written/modified
  if (file.endsWith('.html') && !file.endsWith('index.html')) {
    generateIndexHtml(baseDir);
  }
} catch (e) {
  // Graceful fallback
}
