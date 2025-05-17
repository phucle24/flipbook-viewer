import * as pdfjsLib from 'pdfjs-dist';

// Use Mozilla's official CDN for the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.js';

interface PdfImportResult {
  text: string;
  info?: any;
  metadata?: any;
  pageCount?: number;
  images?: string[];
  error?: string;
}

/**
 * Extracts text content from a PDF file array buffer
 * @param arrayBuffer The PDF file array buffer
 * @returns Object containing the extracted text and metadata
 */
export const extractPdfContent = async (arrayBuffer: ArrayBuffer): Promise<PdfImportResult> => {
  try {
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    // Document metadata
    const metadata = await pdf.getMetadata().catch(() => null);

    // Get the total number of pages
    const pageCount = pdf.numPages;

    // Extract text from all pages
    let fullText = '';

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // Join all the text items into a single string
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');

      fullText += pageText + '\n\n';
    }

    // Generate placeholder images for each page
    const images = getDefaultPageImages(pageCount);

    return {
      text: fullText,
      info: metadata?.info,
      metadata: metadata?.metadata,
      pageCount,
      images
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Unknown error parsing PDF'
    };
  }
};

/**
 * Converts a PDF text content into pages for a flipbook
 * @param text PDF text content
 * @param pagesPerFlipbookPage How many PDF pages to combine into one flipbook page
 * @returns Array of pages for a flipbook
 */
export const convertPdfTextToPages = (text: string, pagesPerFlipbookPage: number = 1): string[] => {
  if (!text) return [];

  // Split text by form feeds or large gaps of whitespace as page indicators
  const pdfPages = text.split(/\f|\n{4,}/g)
    .map(page => page.trim())
    .filter(page => page.length > 0);

  const flipbookPages: string[] = [];

  // Combine PDF pages as needed based on pagesPerFlipbookPage
  for (let i = 0; i < pdfPages.length; i += pagesPerFlipbookPage) {
    const pageContent = pdfPages
      .slice(i, i + pagesPerFlipbookPage)
      .join('\n\n')
      .trim();

    if (pageContent) {
      flipbookPages.push(pageContent);
    }
  }

  return flipbookPages;
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
