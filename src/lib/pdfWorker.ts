import * as pdfjsLib from 'pdfjs-dist';

/**
 * Initialize the PDF.js worker
 * This is required for PDF.js to function properly
 */
export function initPdfWorker() {
  if (typeof window !== 'undefined') {
    // We need this check for SSR environments

    // Get the base URL for the app
    const baseUrl = window.location.origin;

    // Use our local worker file that we copied from node_modules
    const localWorkerUrl = `${baseUrl}/pdf.worker.mjs`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = localWorkerUrl;
    console.log('Set PDF worker src to local file:', localWorkerUrl);

    // Setup fallback in case the local worker fails to load
    window.addEventListener('error', (event) => {
      // Check if the error is related to loading our worker
      if (event.filename && (
          event.filename.includes('pdf.worker.mjs') ||
          event.filename.includes('pdf-worker.js')
      )) {
        console.warn('Local PDF worker failed to load, using CDN fallback');

        // Use CDN versions that match our package
        const cdnFallbacks = [
          'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.2.133/build/pdf.worker.min.mjs',
          'https://unpkg.com/pdfjs-dist@5.2.133/build/pdf.worker.min.mjs',
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.2.133/pdf.worker.min.js'
        ];

        // Try the first CDN fallback
        pdfjsLib.GlobalWorkerOptions.workerSrc = cdnFallbacks[0];
      }
    }, { once: true });
  }
}
