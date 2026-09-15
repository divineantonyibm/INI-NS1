import fs from 'node:fs';
import path from 'node:path';

function scanHtmlFiles(dir, baseDir = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const htmlFiles = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      htmlFiles.push(...scanHtmlFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith('.html') && entry.name !== 'index.html') {
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      const content = fs.readFileSync(fullPath, 'utf8');
      const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
      const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) ||
                        content.match(/<p class="hero-lead"[^>]*>([^<]+)<\/p>/i) ||
                        content.match(/<p class="hero__desc"[^>]*>([^<]+)<\/p>/i) ||
                        content.match(/<p class="section-body"[^>]*>([^<]+)<\/p>/i) ||
                        content.match(/<p[^>]*>([^<]+)<\/p>/i);

      let title = titleMatch ? titleMatch[1].trim() : entry.name.replace(/\.html$/, '');
      let description = descMatch ? descMatch[1].trim().replace(/\s+/g, ' ') : 'Documentation and reference materials.';
      if (description.length > 180) {
        description = description.slice(0, 177) + '...';
      }

      htmlFiles.push({
        path: relPath,
        filename: entry.name,
        title: title,
        description: description
      });
    }
  }

  return htmlFiles;
}

export function generateIndexHtml(rootDir = process.cwd()) {
  const files = scanHtmlFiles(rootDir, rootDir);

  // Sort files alphabetically by title
  files.sort((a, b) => a.title.localeCompare(b.title));

  const cardsHtml = files.map((file, i) => `
        <li class="doc-card">
          <a href="./${file.path}" class="doc-card-link">
            <span class="doc-card-number">${String(i + 1).padStart(2, '0')}</span>
            <div class="doc-card-body">
              <h2 class="doc-card-title">${escapeHtml(file.title)}</h2>
              <p class="doc-card-desc">${escapeHtml(file.description)}</p>
            </div>
          </a>
        </li>`).join('\n');

  const emptyStateHtml = `
        <li class="doc-empty">
          <p>No documents found.</p>
        </li>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>INI-NS1 — Documentation Index</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --ibm-background:        #ffffff;
      --ibm-layer-01:          #f4f4f4;
      --ibm-layer-02:          #e0e0e0;
      --ibm-border-subtle:     #e0e0e0;
      --ibm-border-strong:     #8d8d8d;
      --ibm-text-primary:      #161616;
      --ibm-text-secondary:    #525252;
      --ibm-text-placeholder:  #a8a8a8;
      --ibm-interactive:       #0f62fe;
      --ibm-interactive-hover: #0043ce;
      --ibm-support-info:      #0043ce;
      --ibm-tag-blue-bg:       #d0e2ff;
      --ibm-tag-blue-text:     #0043ce;
      --ibm-spacing-03: 8px;
      --ibm-spacing-04: 12px;
      --ibm-spacing-05: 16px;
      --ibm-spacing-06: 24px;
      --ibm-spacing-07: 32px;
      --ibm-spacing-08: 40px;
      --ibm-spacing-09: 48px;
    }

    body {
      font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: var(--ibm-text-primary);
      background: var(--ibm-background);
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    /* Top bar */
    .top-bar {
      background: #161616;
      color: #ffffff;
      padding: 0 var(--ibm-spacing-06);
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
      border-bottom: 1px solid #393939;
    }

    .top-bar-brand {
      font-size: 14px;
      font-weight: 400;
      letter-spacing: 0.1px;
      display: flex;
      align-items: center;
      gap: var(--ibm-spacing-03);
    }

    .top-bar-brand strong {
      font-weight: 600;
    }

    .top-bar-badge {
      background: #393939;
      color: #c6c6c6;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 2px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    /* Main container */
    .main-content {
      flex: 1;
      max-width: 1080px;
      width: 100%;
      margin: 0 auto;
      padding: var(--ibm-spacing-08) var(--ibm-spacing-06);
    }

    .index-title {
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--ibm-text-secondary);
      margin-bottom: var(--ibm-spacing-07);
    }

    /* Document numbered list */
    .doc-grid {
      list-style: none;
      display: flex;
      flex-direction: column;
    }

    .doc-card {
      border-left: 3px solid #3ddbd9;
      transition: border-color 0.15s ease, background 0.15s ease;
    }

    .doc-card:hover {
      border-left-color: #08bdba;
      background: var(--ibm-layer-01);
    }

    .doc-card-link {
      display: flex;
      align-items: flex-start;
      gap: var(--ibm-spacing-06);
      padding: var(--ibm-spacing-07) var(--ibm-spacing-06);
      text-decoration: none;
      color: inherit;
      border-bottom: 1px solid var(--ibm-border-subtle);
    }

    .doc-card-number {
      font-size: clamp(48px, 6vw, 72px);
      font-weight: 700;
      color: var(--ibm-text-primary);
      line-height: 1;
      min-width: 100px;
      flex-shrink: 0;
    }

    .doc-card-body {
      padding-top: 4px;
      flex: 1;
    }

    .doc-card-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--ibm-text-primary);
      margin-bottom: var(--ibm-spacing-03);
      line-height: 1.35;
      transition: color 0.15s;
    }

    .doc-card-link:hover .doc-card-title {
      color: var(--ibm-interactive);
    }

    .doc-card-desc {
      font-size: 15px;
      color: var(--ibm-text-secondary);
      line-height: 1.6;
      margin-bottom: var(--ibm-spacing-03);
    }

    .doc-path code {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 12px;
      color: var(--ibm-text-placeholder);
    }

    .doc-empty {
      padding: var(--ibm-spacing-08);
      background: var(--ibm-layer-01);
      text-align: center;
      color: var(--ibm-text-secondary);
    }

    /* Footer */
    footer {
      background: #161616;
      color: #a8a8a8;
      font-size: 13px;
      padding: var(--ibm-spacing-06);
      text-align: center;
      border-top: 1px solid #393939;
      margin-top: auto;
    }
  </style>
</head>
<body>

  <!-- Top Bar -->
  <header class="top-bar">
    <div class="top-bar-brand">
      <strong>IBM</strong> <span>INI-NS1</span>
    </div>
    <span class="top-bar-badge">Knowledge Hub</span>
  </header>

  <!-- Main Content -->
  <main class="main-content">
    <p class="index-title">Index</p>

    <ul class="doc-grid">
      ${files.length > 0 ? cardsHtml : emptyStateHtml}
    </ul>
  </main>

  <!-- Footer -->
  <footer>
    <p>IBM INI-NS1 &bull; Documentation Hub</p>
  </footer>

</body>
</html>
`;

  const indexPath = path.join(rootDir, 'index.html');
  fs.writeFileSync(indexPath, html, 'utf8');
  return indexPath;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

if (process.argv[1] && process.argv[1].endsWith('generate-index.mjs')) {
  generateIndexHtml();
  console.log('Successfully generated index.html');
}
