import * as pdfjsLib from 'pdfjs-dist';

// Handling worker initialization in the file where the PDF library is first used
// This can help ensure the worker is available when needed
try {
  // Try to import the worker directly (this is ES module syntax supported by Vite)
  // @ts-ignore - This is a dynamic import
  const pdfWorkerURL = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url);
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerURL.href;
} catch (error) {
  console.warn('Failed to set PDF worker directly:', error);
  // Fallback to the worker we've set up in main.tsx
  // No need to do anything here as it's already configured
}

interface PdfImportResult {
  images: string[];
  info?: any;
  metadata?: any;
  pageCount?: number;
  error?: string;
}

/**
 * Extracts pages from a PDF file as images
 * @param arrayBuffer The PDF file array buffer
 * @returns Object containing the extracted images and metadata
 */
export const extractPdfAsImages = async (arrayBuffer: ArrayBuffer): Promise<PdfImportResult> => {
  try {
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    // Document metadata
    const metadata = await pdf.getMetadata().catch(() => null);

    // Get the total number of pages
    const pageCount = pdf.numPages;

    // Array to store page images
    const pageImages: string[] = [];

    // Canvas for rendering
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false });

    if (!ctx) {
      throw new Error('Unable to create canvas context');
    }

    // Process each page
    for (let i = 1; i <= pageCount; i++) {
      try {
        // Get the page
        const page = await pdf.getPage(i);

        // Get the viewport at desired scale
        const viewport = page.getViewport({ scale: 1.5 });

        // Set canvas dimensions to match the viewport
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render the page to the canvas
        const renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };

        await page.render(renderContext).promise;

        // Convert the canvas to a data URL (image)
        const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
        pageImages.push(imageUrl);
      } catch (pageError) {
        console.error(`Error rendering page ${i}:`, pageError);
        // Use a placeholder image if page rendering fails
        pageImages.push(getPlaceholderImageDataUrl());
      }
    }

    return {
      images: pageImages,
      info: metadata?.info,
      metadata: metadata?.metadata,
      pageCount
    };
  } catch (error) {
    console.error('Error processing PDF:', error);
    return {
      images: [],
      error: error instanceof Error ? error.message : 'Unknown error processing PDF'
    };
  }
};

/**
 * Returns a placeholder image for failed PDF page rendering
 * @returns Base64 encoded SVG placeholder image
 */
export const getPlaceholderImageDataUrl = (): string => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OSI+UGFnZSBJbWFnZSBOb3QgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
};

/**
 * Combines multiple images into a single page
 * @param images Array of image URLs
 * @param pagesPerFlipbookPage How many PDF page images to combine into one flipbook page
 * @returns Array of combined image URLs
 */
export const combinePageImages = (images: string[], pagesPerFlipbookPage: number = 1): string[] => {
  if (!images.length) return [];

  if (pagesPerFlipbookPage === 1) {
    return images;
  }

  const combinedImages: string[] = [];

  // Combine images based on pagesPerFlipbookPage setting
  for (let i = 0; i < images.length; i += pagesPerFlipbookPage) {
    const batch = images.slice(i, i + pagesPerFlipbookPage);
    if (batch.length > 0) {
      // For now, we'll just use the first image from each batch
      // A more advanced implementation could stitch multiple images together
      combinedImages.push(batch[0]);
    }
  }

  return combinedImages;
};

/**
 * Gets default image placeholders for PDF pages
 * These could be used when actual images can't be extracted from the PDF
 * @param pageCount Number of pages to generate placeholders for
 * @returns Array of image placeholder URLs
 */
export const getDefaultPageImages = (pageCount: number): string[] => {
  // A collection of book/page related images from Unsplash
  const defaultImages = [
    'https://images.unsplash.com/photo-1532012197267-da84d127e765',
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66',
    'https://images.unsplash.com/photo-1533669955142-6a73332af4db',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
    'https://images.unsplash.com/photo-1519682337058-a94d519337bc',
    'https://images.unsplash.com/photo-1526243741027-444d633d7365'
  ];

  // Generate placeholders for each page
  return Array(pageCount)
    .fill('')
    .map((_, index) => {
      // Cycle through the default images
      const imageIndex = index % defaultImages.length;
      return `${defaultImages[imageIndex]}?w=600&fit=crop&auto=format&q=80`;
    });
};
