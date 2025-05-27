import fs from 'fs';
import path from 'path';

// Path to node_modules
const nodeModulesPath = path.resolve('./node_modules');
// PDF.js dist path
const pdfjsPath = path.join(nodeModulesPath, 'pdfjs-dist');
// Source worker file (based on what we found in node_modules)
const workerSrcPaths = [
  path.join(pdfjsPath, 'build', 'pdf.worker.min.mjs'),
  path.join(pdfjsPath, 'build', 'pdf.worker.mjs'),
  path.join(pdfjsPath, 'legacy', 'build', 'pdf.worker.min.mjs'),
  path.join(pdfjsPath, 'legacy', 'build', 'pdf.worker.mjs'),
];

// Destination in public folder
const destPath = path.resolve('./public/pdf.worker.mjs');

// Find the first existing worker file
let workerSrcPath = null;
for (const srcPath of workerSrcPaths) {
  if (fs.existsSync(srcPath)) {
    workerSrcPath = srcPath;
    break;
  }
}

if (!workerSrcPath) {
  console.error('Could not find PDF.js worker file in node_modules');
  process.exit(1);
}

// Copy the worker file to public folder
try {
  fs.copyFileSync(workerSrcPath, destPath);
  console.log(`Successfully copied PDF.js worker from ${workerSrcPath} to ${destPath}`);
} catch (err) {
  console.error('Error copying PDF.js worker file:', err);
  process.exit(1);
}
