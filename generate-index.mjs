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

  const cardsHtml = files.map(file => `
        <li class="doc-card">
          <a href="./${file.path}" class="doc-card-link">
            <div class="doc-card-header">
              <span class="doc-tag">Document</span>
              <span class="doc-arrow" aria-hidden="true">→</span>
            </div>
            <h2 class="doc-card-title">${escapeHtml(file.title)}</h2>
            <p class="doc-card-desc">${escapeHtml(file.description)}</p>
            <div class="doc-card-footer">
              <span class="doc-path"><code>${escapeHtml(file.path)}</code></span>
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

    /* Hero section */
    .hero {
      background: #161616;
      color: #ffffff;
      padding: var(--ibm-spacing-09) var(--ibm-spacing-06) var(--ibm-spacing-08);
      border-bottom: 1px solid #393939;
    }

    .hero-container {
      max-width: 1080px;
      margin: 0 auto;
    }

    .hero-eyebrow {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #78a9ff;
      margin-bottom: var(--ibm-spacing-03);
      font-weight: 600;
    }

    .hero-title {
      font-size: clamp(28px, 4vw, 42px);
      font-weight: 300;
      line-height: 1.2;
      color: #ffffff;
      margin-bottom: var(--ibm-spacing-04);
    }

    .hero-title strong {
      font-weight: 600;
    }

    .hero-lead {
      font-size: 16px;
      color: #c6c6c6;
      max-width: 680px;
      line-height: 1.5;
    }

    /* Main container */
    .main-content {
      flex: 1;
      max-width: 1080px;
      width: 100%;
      margin: 0 auto;
      padding: var(--ibm-spacing-08) var(--ibm-spacing-06);
    }

    .section-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: var(--ibm-spacing-06);
      border-bottom: 2px solid var(--ibm-interactive);
      padding-bottom: var(--ibm-spacing-03);
    }

    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--ibm-text-primary);
    }

    .doc-count {
      font-size: 14px;
      color: var(--ibm-text-secondary);
    }

    /* Document cards grid */
    .doc-grid {
      list-style: none;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--ibm-spacing-06);
    }

    .doc-card {
      background: var(--ibm-layer-01);
      border: 1px solid var(--ibm-border-subtle);
      border-top: 3px solid var(--ibm-interactive);
      transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
    }

    .doc-card:hover {
      border-color: var(--ibm-interactive);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .doc-card-link {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: var(--ibm-spacing-06);
      text-decoration: none;
      color: inherit;
    }

    .doc-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--ibm-spacing-04);
    }

    .doc-tag {
      background: var(--ibm-tag-blue-bg);
      color: var(--ibm-tag-blue-text);
      font-size: 12px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 2px;
    }

    .doc-arrow {
      font-size: 18px;
      color: var(--ibm-interactive);
      transition: transform 0.15s ease;
    }

    .doc-card-link:hover .doc-arrow {
      transform: translateX(4px);
    }

    .doc-card-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--ibm-text-primary);
      margin-bottom: var(--ibm-spacing-03);
      line-height: 1.35;
    }

    .doc-card-desc {
      font-size: 14px;
      color: var(--ibm-text-secondary);
      line-height: 1.5;
      flex: 1;
      margin-bottom: var(--ibm-spacing-05);
    }

    .doc-card-footer {
      border-top: 1px solid var(--ibm-border-subtle);
      padding-top: var(--ibm-spacing-03);
    }

    .doc-path code {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 12px;
      color: var(--ibm-text-secondary);
      background: #ffffff;
      padding: 2px 6px;
      border: 1px solid var(--ibm-border-subtle);
    }

    .doc-empty {
      grid-column: 1 / -1;
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

  <!-- Hero Header -->
  <section class="hero">
    <div class="hero-container">
      <div class="hero-eyebrow">Project Documentation</div>
      <h1 class="hero-title"><strong>INI-NS1</strong> Documentation Portal</h1>
      <p class="hero-lead">Central index and knowledge hub for all documents, architectural overviews, and guides in this repository.</p>
    </div>
  </section>

  <!-- Main Content -->
  <main class="main-content">
    <div class="section-header">
      <h2 class="section-title">Available Documents</h2>
      <span class="doc-count">${files.length} document${files.length === 1 ? '' : 's'}</span>
    </div>

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
