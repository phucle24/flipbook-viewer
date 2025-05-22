import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { IoArrowBack, IoBookmark } from 'react-icons/io5';
import PdfImporter from '../components/PdfImporter';
import type { Page } from '../types';

const AdminPdfImportPage = () => {
  const navigate = useNavigate();
  const [extractedPages, setExtractedPages] = useState<string[]>([]);
  const [storyTitle, setStoryTitle] = useState('');
  const [showPdfImporter, setShowPdfImporter] = useState(true);

  const [extractedImages, setExtractedImages] = useState<string[]>([]);
  const [processingStory, setProcessingStory] = useState(false);

  // Clear any existing PDF data on component mount
  useEffect(() => {
    localStorage.removeItem('pdfImportedPages');
    localStorage.removeItem('pdfImportedTitle');
  }, []);

  const handlePagesExtracted = (pages: string[], title?: string, images?: string[]) => {
    setExtractedPages(pages);
    if (title) {
      setStoryTitle(title);
    }
    if (images && images.length > 0) {
      setExtractedImages(images);
      console.log(`Received ${images.length} extracted images`);
    }
    setShowPdfImporter(false);
  };

  const handleCreateStory = () => {
    if (processingStory) return;
    setProcessingStory(true);

    console.log(`Creating story from PDF with ${extractedImages.length} images`);
    console.log(`Story title: "${storyTitle}"`);

    try {
      // Ensure we have a valid title
      if (!storyTitle.trim()) {
        alert("Please enter a title for your story.");
        setProcessingStory(false);
        return;
      }

      // Instead of storing all images at once, we'll store them one by one
      // This helps avoid storage limits in browsers

      // First, store the imported title (ensure it's properly trimmed)
      const finalTitle = storyTitle.trim();
      localStorage.setItem('pdfImportedTitle', finalTitle);
      console.log(`Stored title in localStorage: "${finalTitle}"`);

      // Create story pages with references to the images
      const storyPages: Omit<Page, 'id'>[] = extractedImages.map((imageUrl, index) => ({
        imageUrl: imageUrl,
        textContent: `Page ${index + 1}`
      }));

      // Store pages data in localStorage
      localStorage.setItem('pdfImportedPages', JSON.stringify(storyPages));
      console.log(`Stored ${storyPages.length} pages in localStorage`);

      // Navigate to the add story page
      navigate('/admin/add-story');
    } catch (error) {
      console.error("Error storing PDF data:", error);
      alert("There was an error processing your PDF. It might be too large. Try a smaller PDF or fewer pages.");
    } finally {
      setProcessingStory(false);
    }
  };

  const handleStartOver = () => {
    setExtractedPages([]);
    setExtractedImages([]);
    setStoryTitle('');
    setShowPdfImporter(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="mr-4"
          >
            <IoArrowBack className="mr-2" /> Back to Admin
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Import Story from PDF</h1>
        </div>

        {showPdfImporter ? (
          <PdfImporter onPagesExtracted={handlePagesExtracted} />
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>PDF Imported Successfully</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="story-title">Story Title</Label>
                  <Input
                    id="story-title"
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    placeholder="Enter a title for your story"
                  />
                </div>

                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">
                    {extractedImages.length} pages were extracted from the PDF as images.
                  </p>

                  <div className="bg-gray-100 rounded-md p-4 max-h-[400px] overflow-y-auto">
                    <h3 className="font-medium mb-2">Extracted Images Preview:</h3>
                    {extractedImages.slice(0, 3).map((imageUrl, index) => (
                      <div key={index} className="mb-4 p-3 bg-white rounded border">
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
                    {extractedImages.length > 3 && (
                      <p className="text-sm text-gray-500 italic p-2 text-center">
                        ...and {extractedImages.length - 3} more pages
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={handleStartOver}
                    disabled={processingStory}
                  >
                    Start Over
                  </Button>
                  <Button
                    onClick={handleCreateStory}
                    className="bg-violet-600 hover:bg-violet-700 flex items-center"
                    disabled={processingStory}
                  >
                    {processingStory ? (
                      <>
                        <span className="mr-2 block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <IoBookmark className="mr-2" /> Continue to Story Editor
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPdfImportPage;
