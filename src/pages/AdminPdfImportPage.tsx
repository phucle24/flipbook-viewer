import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { IoArrowBack, IoBookmark, IoDocumentText } from 'react-icons/io5';
import PdfImporter from '../components/PdfImporter';
import type { Page } from '../types';
import { jsPDF } from 'jspdf';

const AdminPdfImportPage = () => {
  const navigate = useNavigate();
  const [extractedPages, setExtractedPages] = useState<string[]>([]);
  const [storyTitle, setStoryTitle] = useState('');
  const [showPdfImporter, setShowPdfImporter] = useState(true);

  const [extractedImages, setExtractedImages] = useState<string[]>([]);

  const handlePagesExtracted = (pages: string[], title?: string, images?: string[]) => {
    setExtractedPages(pages);
    if (title) {
      setStoryTitle(title);
    }
    if (images && images.length > 0) {
      setExtractedImages(images);
    }
    setShowPdfImporter(false);
  };

  const handleCreateStory = () => {
    // Convert extracted text pages to story pages format
    const storyPages: Omit<Page, 'id'>[] = extractedPages.map((textContent, index) => ({
      // Use extracted images if available, otherwise use default
      imageUrl: extractedImages[index] || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1000',
      textContent
    }));

    // Store the pages in session storage to access them in the AddStoryPage
    sessionStorage.setItem('pdfImportedPages', JSON.stringify(storyPages));
    sessionStorage.setItem('pdfImportedTitle', storyTitle);

    // Navigate to the add story page
    navigate('/admin/add-story');
  };

  const handleStartOver = () => {
    setExtractedPages([]);
    setExtractedImages([]);
    setStoryTitle('');
    setShowPdfImporter(true);
  };

  // Function to create a sample PDF for testing
  const createSamplePdf = () => {
    // Create a new PDF document
    const doc = new jsPDF();

    // Add content to the PDF
    doc.setFontSize(16);
    doc.text('Sample PDF for Testing', 20, 20);

    doc.setFontSize(12);
    doc.text('This is page 1 of the sample PDF.', 20, 30);
    doc.text('This PDF was generated for testing the PDF importer.', 20, 40);
    doc.text('It contains multiple pages with different content.', 20, 50);

    // Add a second page
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Page 2', 20, 20);
    doc.setFontSize(12);
    doc.text('This is the second page of our sample PDF.', 20, 30);
    doc.text('Here we can test multi-page functionality.', 20, 40);

    // Add a third page
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Page 3', 20, 20);
    doc.setFontSize(12);
    doc.text('This is the third and final page of our sample.', 20, 30);
    doc.text('Let\'s see if all pages are correctly imported!', 20, 40);

    // Save the PDF
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);

    // Create a download link for the PDF
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-test.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

        {/* Add test PDF button for convenience */}
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={createSamplePdf}
            className="flex items-center"
          >
            <IoDocumentText className="mr-2" /> Create Sample PDF for Testing
          </Button>
          <p className="text-xs text-gray-500 mt-1">
            Creates a 3-page sample PDF for testing the import feature
          </p>
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
                    {extractedPages.length} pages were extracted from the PDF.
                  </p>

                  <div className="bg-gray-100 rounded-md p-4 max-h-[400px] overflow-y-auto">
                    <h3 className="font-medium mb-2">Extracted Content Preview:</h3>
                    {extractedPages.slice(0, 3).map((page, index) => (
                      <div key={index} className="mb-4 p-3 bg-white rounded border">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-sm">Page {index + 1}</h4>
                          <span className="text-xs text-gray-500">
                            {page.length} characters
                          </span>
                        </div>

                        {extractedImages[index] && (
                          <div className="mb-2 rounded overflow-hidden h-40 bg-gray-200">
                            <img
                              src={extractedImages[index]}
                              alt={`Preview page ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <p className="text-gray-700 text-sm line-clamp-3">{page}</p>
                      </div>
                    ))}
                    {extractedPages.length > 3 && (
                      <p className="text-sm text-gray-500 italic p-2 text-center">
                        ...and {extractedPages.length - 3} more pages
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={handleStartOver}
                  >
                    Start Over
                  </Button>
                  <Button
                    onClick={handleCreateStory}
                    className="bg-violet-600 hover:bg-violet-700 flex items-center"
                  >
                    <IoBookmark className="mr-2" /> Continue to Story Editor
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
