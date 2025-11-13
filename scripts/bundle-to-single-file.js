import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');
const outputFile = path.join(distDir, 'index.html');

// Read the built HTML file
const htmlFile = path.join(distDir, 'index.html');
if (!fs.existsSync(htmlFile)) {
  console.error('❌ Build files not found. Run "npm run build" first.');
  process.exit(1);
}

let html = fs.readFileSync(htmlFile, 'utf-8');

// Helper to resolve file paths
function resolveAssetPath(assetPath, distDir) {
  if (assetPath.startsWith('/')) {
    return path.join(distDir, assetPath.slice(1));
  }
  // Handle relative paths from HTML location
  const htmlDir = path.dirname(htmlFile);
  return path.resolve(htmlDir, assetPath);
}

// Find and inline all CSS files
const cssRegex = /<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi;
let cssMatch;
const cssReplacements = [];

while ((cssMatch = cssRegex.exec(html)) !== null) {
  const cssPath = cssMatch[1];
  const fullCssPath = resolveAssetPath(cssPath, distDir);
  
  if (fs.existsSync(fullCssPath)) {
    const cssContent = fs.readFileSync(fullCssPath, 'utf-8');
    cssReplacements.push({
      original: cssMatch[0],
      replacement: `<style>${cssContent}</style>`
    });
    console.log(`  ✓ Inlined CSS: ${cssPath}`);
  } else {
    console.warn(`  ⚠ CSS file not found: ${fullCssPath}`);
  }
}

// Apply CSS replacements
cssReplacements.forEach(({ original, replacement }) => {
  html = html.replace(original, replacement);
});

// Find and inline all JS files
const jsRegex = /<script[^>]+src=["']([^"']+\.js)["'][^>]*><\/script>/gi;
let jsMatch;
const jsFiles = [];

while ((jsMatch = jsRegex.exec(html)) !== null) {
  const jsPath = jsMatch[1];
  const fullJsPath = resolveAssetPath(jsPath, distDir);
  
  if (fs.existsSync(fullJsPath)) {
    const jsContent = fs.readFileSync(fullJsPath, 'utf-8');
    jsFiles.push({
      original: jsMatch[0],
      content: jsContent
    });
    console.log(`  ✓ Inlined JS: ${jsPath}`);
  } else {
    console.warn(`  ⚠ JS file not found: ${fullJsPath}`);
  }
}

// Remove original script tags from head
jsFiles.forEach(({ original }) => {
  html = html.replace(original, '');
});

// Add all JS files as a single script at the end of body
if (jsFiles.length > 0) {
  const allJsContent = jsFiles.map(f => f.content).join('\n');
  // Insert before closing </body> tag
  html = html.replace('</body>', `  <script>${allJsContent}</script>\n</body>`);
}

// Remove any remaining empty script tags or module script tags
html = html.replace(/<script[^>]*type=["']module["'][^>]*><\/script>/gi, '');
html = html.replace(/<script[^>]*><\/script>/g, '');

// Clean up any remaining asset references
html = html.replace(/<link[^>]*>/g, '');

// Write the standalone file to dist directory
fs.writeFileSync(outputFile, html, 'utf-8');
console.log(`\n✅ Created standalone file: ${outputFile}`);

// Remove assets directory
const assetsDir = path.join(distDir, 'assets');
if (fs.existsSync(assetsDir)) {
  fs.rmSync(assetsDir, { recursive: true, force: true });
  console.log(`   ✓ Removed assets directory`);
}

console.log(`   File size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`);
console.log(`   You can now share this single HTML file!`);

