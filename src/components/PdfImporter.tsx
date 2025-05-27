import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { IoAlertCircle, IoDocumentText, IoEye, IoCheckmarkCircle, IoClose, IoImage } from 'react-icons/io5';
import { extractPdfAsImages, combinePageImages } from '../lib/pdfImporter';

interface PdfImporterProps {
  onPagesExtracted: (pages: string[], title?: string, images?: string[]) => void;
}

const MAX_FILE_SIZE_MB = 10; // Maximum file size in MB

const PdfImporter = ({ onPagesExtracted }: PdfImporterProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [error, setError] = useState('');
  const [pagesPerFlipbookPage, setPagesPerFlipbookPage] = useState(1);
  const [pdfTitle, setPdfTitle] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [previewExtracted, setPreviewExtracted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      // Check file size
      const fileSizeMB = file.size / (1024 * 1024);
      setFileSize(fileSizeMB);

      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Please choose a smaller file.`);
        setFileName('');
        setPdfTitle('');
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      setFileName(file.name);
      // Extract title from filename (remove extension and replace hyphens/underscores with spaces)
      const baseTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setPdfTitle(baseTitle);
      setError('');
      setShowPreview(false);
      setPreviewImages([]);
      setPreviewExtracted(false);
    } else {
      setFileName('');
      setPdfTitle('');
      setFileSize(0);
      setPreviewExtracted(false);
    }
  };

  const handlePreview = async () => {
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Read the file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Extract PDF pages as images
      console.log('Starting PDF preview extraction...');
      const result = await extractPdfAsImages(arrayBuffer);

      if (result.error) {
        console.error('extractPdfAsImages error:', result.error);
        throw new Error(result.error);
      }

      if (!result.images || result.images.length === 0) {
        console.error('No images extracted from PDF');
        throw new Error('No pages could be extracted from the PDF');
      }

      // We'll only show a preview of the first few pages
      const previewPagesCount = Math.min(result.images.length, 3);
      const imagesToPreview = result.images.slice(0, previewPagesCount);

      // Store preview images
      setPreviewImages(result.images);
      setTotalPages(result.images.length);
      setShowPreview(true);
      setPreviewExtracted(true);

      console.log(`Preview extraction successful: ${result.images.length} pages extracted`);
    } catch (err) {
      console.error('PDF preview error:', err);
      setError(err instanceof Error ? err.message : 'Error previewing PDF');
    }

    setIsLoading(false);
  };

  const handleImport = async () => {
    // If we already extracted images in preview, use that instead of processing again
    if (previewExtracted && previewImages.length > 0) {
      console.log(`Using ${previewImages.length} previously extracted images`);

      // Combine pages based on pagesPerFlipbookPage setting if needed
      const finalImages = combinePageImages(previewImages, pagesPerFlipbookPage);
      console.log(`Combined into ${finalImages.length} pages`);

      // Generate placeholder text content for each image (this will be empty/placeholder text)
      const placeholderTexts = Array(finalImages.length).fill('').map((_, i) => `Page ${i + 1}`);

      // Pass the extracted images to parent component along with empty placeholder text
      onPagesExtracted(placeholderTexts, pdfTitle, finalImages);
      return;
    }

    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Read the file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Extract PDF pages as images
      console.log('Starting PDF import extraction...');
      const result = await extractPdfAsImages(arrayBuffer);

      if (result.error) {
        console.error('extractPdfAsImages error:', result.error);
        throw new Error(result.error);
      }

      if (!result.images || result.images.length === 0) {
        console.error('No images extracted from PDF');
        throw new Error('No pages could be extracted from the PDF');
      }

      // Combine pages based on pagesPerFlipbookPage setting if needed
      const finalImages = combinePageImages(result.images, pagesPerFlipbookPage);
      console.log(`Combined into ${finalImages.length} pages`);

      // Generate placeholder text content for each image
      const placeholderTexts = Array(finalImages.length).fill('').map((_, i) => `Page ${i + 1}`);

      // Pass the extracted images to parent component along with empty placeholder text
      onPagesExtracted(placeholderTexts, pdfTitle, finalImages);

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFileName('');
      setPdfTitle('');
      setPreviewExtracted(false);

      console.log('PDF import completed successfully');
    } catch (err) {
      console.error('PDF import error:', err);
      setError(err instanceof Error ? err.message : 'Error importing PDF');
    }

    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-lilac-purple flex items-center">
          <IoDocumentText className="mr-2" /> Import from PDF
        </CardTitle>
        <CardDescription>Upload a PDF file to create a new story</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pdf-file">PDF File</Label>
          <Input
            id="pdf-file"
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="file:bg-baby-blue file:border-0 file:px-3 file:py-2 file:mr-3 file:rounded-md hover:file:bg-cotton-candy file:text-lilac-purple cursor-pointer"
          />
          {fileName && (
            <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
              <span>File: {fileName}</span>
              <span className={fileSize > MAX_FILE_SIZE_MB / 2 ? 'text-amber-500' : 'text-green-500'}>
                {fileSize.toFixed(2)} MB
              </span>
            </div>
          )}
          <p className="text-xs text-gray-400">
            Maximum file size: {MAX_FILE_SIZE_MB}MB
          </p>
          <p className="text-xs text-yellow-500 bg-yellow-50 p-2 rounded">
            Note: Each page of your PDF will be converted to an image in your flipbook.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pdf-title">Story Title</Label>
          <Input
            id="pdf-title"
            value={pdfTitle}
            onChange={(e) => setPdfTitle(e.target.value)}
            placeholder="Enter story title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pages-per-flipbook">PDF Pages per Story Page</Label>
          <div className="flex items-center gap-2">
            <Input
              id="pages-per-flipbook"
              type="number"
              min="1"
              max="5"
              value={pagesPerFlipbookPage}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                setPagesPerFlipbookPage(value);
                // Reset preview if pagination changes
                if (previewExtracted) {
                  setShowPreview(false);
                  setPreviewExtracted(false);
                }
              }}
              className="w-20"
            />
            <span className="text-sm text-gray-500">
              (Combine multiple PDF pages into one story page)
            </span>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded border border-red-200 flex items-start">
            <IoAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {showPreview && previewImages.length > 0 && (
          <div className="mt-4 border rounded-md p-4 bg-gray-50">
            <h3 className="font-medium mb-2 flex items-center">
              <IoCheckmarkCircle className="text-green-500 mr-2" />
              PDF Content Preview ({totalPages} pages extracted)
            </h3>

            <div className="max-h-[400px] overflow-y-auto bg-white border rounded-md p-3">
              {previewImages.slice(0, 3).map((imageUrl, index) => (
                <div
                  key={`preview-${index}`}
                  className="mb-4 p-3 bg-gray-50 rounded border"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-sm">Page {index + 1}</h4>
                  </div>

                  <div className="mb-2 rounded overflow-hidden h-40 bg-gray-200">
                    <img
                      src={imageUrl}
                      alt={`Preview page ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              ))}

              {previewImages.length > 3 && (
                <p className="text-sm text-gray-500 italic p-2 text-center border-t">
                  ...and {previewImages.length - 3} more pages
                </p>
              )}
            </div>

            <div className="mt-3 text-xs text-gray-500 flex items-center">
              <IoImage className="mr-1" /> Images are extracted directly from PDF pages
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-3">
        <Button
          variant="outline"
          onClick={handlePreview}
          disabled={isLoading || !fileName}
          className="flex-1"
        >
          <IoEye className="mr-2" />
          {isLoading ? 'Processing...' : 'Preview'}
        </Button>

        <Button
          onClick={handleImport}
          disabled={isLoading || !fileName}
          className="bg-cotton-candy hover:bg-sunshine-yellow hover:text-lilac-purple flex-1"
        >
          {isLoading ? 'Processing...' : 'Import PDF'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PdfImporter;
