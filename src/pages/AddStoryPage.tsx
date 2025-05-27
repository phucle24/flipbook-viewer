import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoryStore } from '../lib/store';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { LuArrowLeft, LuPlus, LuTrash, LuX, LuImage, LuInfo, LuSave, LuCopy, LuEye } from 'react-icons/lu';
import type { Page, Story } from '../types';

const AddStoryPage = () => {
  const navigate = useNavigate();
  const { addStory, isLoading } = useStoryStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Check if we have imported PDF data in localStorage
  const [isPdfImported, setIsPdfImported] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Initialize with a single empty page until we load data
  const [pages, setPages] = useState<Omit<Page, 'id'>[]>([
    { imageUrl: '', textContent: '' }
  ]);

  const [formErrors, setFormErrors] = useState({
    title: '',
    author: '',
    coverImage: '',
    description: '',
    category: '',
    tags: '',
    pages: [] as string[]
  });

  const [activePageIndex, setActivePageIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setIsLoadingData(true);

    try {
      // Check localStorage for imported PDF data
      const importedPagesJSON = localStorage.getItem('pdfImportedPages');
      const importedTitle = localStorage.getItem('pdfImportedTitle');

      if (importedPagesJSON) {
        // We have PDF data
        try {
          const importedPages = JSON.parse(importedPagesJSON);
          if (Array.isArray(importedPages) && importedPages.length > 0) {
            setPages(importedPages);
            setIsPdfImported(true);
          }
        } catch (parseError) {
          console.error("Error parsing imported pages:", parseError);
        }
      }

      if (importedTitle) {
        setTitle(importedTitle);
      }

      // Clear localStorage after using the data
      if (importedPagesJSON || importedTitle) {
        localStorage.removeItem('pdfImportedPages');
        localStorage.removeItem('pdfImportedTitle');
      }
    } catch (error) {
      console.error("Error loading imported PDF data:", error);
    } finally {
      // Short delay to ensure UI updates
      setTimeout(() => {
        setIsLoadingData(false);
      }, 500);
    }
  }, []);

  useEffect(() => {
    setFormErrors(prev => ({
      ...prev,
      pages: prev.pages.filter((_, i) => i < pages.length)
    }));
  }, [pages.length]);

  const validateImageUrl = (url: string): boolean => {
    if (!url) return false;
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/) !== null || url.startsWith('data:image/') || url.startsWith('https://images.unsplash.com/');
  };

  const validateForm = (): boolean => {
    const errors = {
      title: '',
      author: '',
      coverImage: '',
      description: '',
      category: '',
      tags: '',
      pages: [...Array(pages.length)].map(() => '')
    };

    let isValid = true;

    if (!title.trim()) {
      errors.title = 'Title is required';
      isValid = false;
    }

    if (!author.trim()) {
      errors.author = 'Author is required';
      isValid = false;
    }

    if (!coverImage.trim()) {
      errors.coverImage = 'Cover image URL is required';
      isValid = false;
    } else if (!validateImageUrl(coverImage)) {
      errors.coverImage = 'Please enter a valid image URL';
      isValid = false;
    }

    if (!description.trim()) {
      errors.description = 'Description is required';
      isValid = false;
    }

    if (!category.trim()) {
      errors.category = 'Category is required';
      isValid = false;
    }

    if (tags.length === 0) {
      errors.tags = 'At least one tag is required';
      isValid = false;
    }

    pages.forEach((page, index) => {
      if (!page.imageUrl || !validateImageUrl(page.imageUrl)) {
        errors.pages[index] = 'Valid image URL is required';
        isValid = false;
      } else if (!isPdfImported && !page.textContent) {
        errors.pages[index] = 'Text content is required';
        isValid = false;
      }
    });

    setFormErrors(errors);
    return isValid;
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
      if (formErrors.tags) {
        setFormErrors(prev => ({ ...prev, tags: '' }));
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleAddPage = () => {
    setPages([...pages, { imageUrl: '', textContent: '' }]);
    setActivePageIndex(pages.length);
  };

  const handleRemovePage = (index: number) => {
    if (pages.length > 1) {
      const newPages = [...pages];
      newPages.splice(index, 1);
      setPages(newPages);

      if (activePageIndex >= index) {
        setActivePageIndex(Math.max(0, activePageIndex - 1));
      }
    }
  };

  const handlePageChange = (index: number, field: keyof Omit<Page, 'id'>, value: string) => {
    const newPages = [...pages];
    newPages[index] = { ...newPages[index], [field]: value };
    setPages(newPages);

    if (formErrors.pages[index]) {
      const newPageErrors = [...formErrors.pages];
      newPageErrors[index] = '';
      setFormErrors(prev => ({ ...prev, pages: newPageErrors }));
    }
  };

  const handleDuplicatePage = (index: number) => {
    const pageToDuplicate = pages[index];
    const newPages = [...pages];
    newPages.splice(index + 1, 0, { ...pageToDuplicate });
    setPages(newPages);
    setActivePageIndex(index + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const errorElement = document.querySelector('.error-message');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      const newStory: Omit<Story, 'id'> = {
        title,
        author,
        coverImage,
        description,
        category,
        tags,
        likes: 0,
        views: 0,
        pages: pages.map((page, index) => ({
          ...page,
          id: index + 1
        }))
      };

      await addStory(newStory);
      navigate('/admin');
    } catch (error) {
      console.error('Failed to add story:', error);
      alert('Failed to add story. Please try again.');
    }
  };

  const handleImageUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('data-page-index');
      fileInputRef.current.click();
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, pageIndex?: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (pageIndex !== undefined) {
          handlePageChange(pageIndex, 'imageUrl', base64String);
        } else {
          setCoverImage(base64String);
          if (formErrors.coverImage) {
            setFormErrors(prev => ({ ...prev, coverImage: '' }));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pageIndexAttr = fileInputRef.current?.getAttribute('data-page-index');
    if (pageIndexAttr !== null && pageIndexAttr !== undefined) {
      const pageIndex = parseInt(pageIndexAttr, 10);
      handleImageFileChange(e, pageIndex);
      fileInputRef.current?.removeAttribute('data-page-index');
    } else {
      handleImageFileChange(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {isLoadingData ? (
        <div className="max-w-4xl mx-auto px-4 text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-violet-600 border-r-transparent"></div>
          <p className="mt-4 text-lg">Loading story data...</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6 flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin')}
              className="mr-4"
            >
              <LuArrowLeft className="mr-2" /> Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              {isPdfImported ? 'Edit PDF Imported Story' : 'Add New Story'}
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Story Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="flex items-center">
                      Title <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (formErrors.title) {
                          setFormErrors(prev => ({ ...prev, title: '' }));
                        }
                      }}
                      placeholder="Story title"
                      className={formErrors.title ? 'border-red-500' : ''}
                    />
                    {formErrors.title && (
                      <p className="text-red-500 text-xs mt-1 error-message flex items-center">
                        <LuInfo className="mr-1" size={12} />
                        {formErrors.title}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author" className="flex items-center">
                      Author <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="author"
                      value={author}
                      onChange={(e) => {
                        setAuthor(e.target.value);
                        if (formErrors.author) {
                          setFormErrors(prev => ({ ...prev, author: '' }));
                        }
                      }}
                      placeholder="Author name"
                      className={formErrors.author ? 'border-red-500' : ''}
                    />
                    {formErrors.author && (
                      <p className="text-red-500 text-xs mt-1 error-message flex items-center">
                        <LuInfo className="mr-1" size={12} />
                        {formErrors.author}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coverImage" className="flex items-center">
                    Cover Image <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="flex">
                    <Input
                      id="coverImage"
                      value={coverImage}
                      onChange={(e) => {
                        setCoverImage(e.target.value);
                        if (formErrors.coverImage) {
                          setFormErrors(prev => ({ ...prev, coverImage: '' }));
                        }
                      }}
                      placeholder="https://example.com/image.jpg"
                      className={`flex-1 ${formErrors.coverImage ? 'border-red-500' : ''}`}
                    />
                    <Button
                      type="button"
                      className="ml-2 bg-violet-600 hover:bg-violet-700"
                      onClick={handleImageUploadClick}
                    >
                      <LuImage className="mr-2" /> Upload
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileInputChange}
                    />
                  </div>
                  {formErrors.coverImage && (
                    <p className="text-red-500 text-xs mt-1 error-message flex items-center">
                      <LuInfo className="mr-1" size={12} />
                      {formErrors.coverImage}
                    </p>
                  )}
                  {coverImage && (
                    <div className="mt-2 relative w-40 h-40 border rounded-md overflow-hidden">
                      <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center">
                    Description <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (formErrors.description) {
                        setFormErrors(prev => ({ ...prev, description: '' }));
                      }
                    }}
                    placeholder="Short description of the story"
                    className={`w-full min-h-[100px] px-3 py-2 border rounded-md resize-y ${
                      formErrors.description ? 'border-red-500' : ''
                    }`}
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-xs mt-1 error-message flex items-center">
                      <LuInfo className="mr-1" size={12} />
                      {formErrors.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="flex items-center">
                      Category <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="category"
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        if (formErrors.category) {
                          setFormErrors(prev => ({ ...prev, category: '' }));
                        }
                      }}
                      placeholder="e.g. Fantasy, Adventure"
                      className={formErrors.category ? 'border-red-500' : ''}
                    />
                    {formErrors.category && (
                      <p className="text-red-500 text-xs mt-1 error-message flex items-center">
                        <LuInfo className="mr-1" size={12} />
                        {formErrors.category}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags" className="flex items-center">
                      Tags <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="flex">
                      <Input
                        id="tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleTagInputKeyPress}
                        placeholder="Add a tag and press Enter"
                        className={`flex-1 ${formErrors.tags ? 'border-red-500' : ''}`}
                      />
                      <Button
                        type="button"
                        onClick={handleAddTag}
                        className="ml-2 bg-violet-600 hover:bg-violet-700"
                      >
                        Add
                      </Button>
                    </div>
                    {formErrors.tags && (
                      <p className="text-red-500 text-xs mt-1 error-message flex items-center">
                        <LuInfo className="mr-1" size={12} />
                        {formErrors.tags}
                      </p>
                    )}

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag, idx) => (
                          <div key={`tag-${tag}-${idx}`} className="bg-violet-100 text-violet-800 px-3 py-1 rounded-full flex items-center">
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-2 text-violet-600 hover:text-violet-800"
                            >
                              <LuX size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center">
                  <CardTitle>Story Pages</CardTitle>
                  <span className="ml-2 bg-violet-100 text-violet-800 px-2 py-1 rounded-full text-xs">
                    {pages.length} {pages.length === 1 ? 'page' : 'pages'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center text-violet-600"
                  >
                    <LuEye className="mr-2" /> {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddPage}
                    className="flex items-center text-violet-600"
                  >
                    <LuPlus className="mr-2" /> Add Page
                  </Button>
                </div>
              </CardHeader>

              <div className="px-6 mb-4 overflow-x-auto">
                <div className="flex space-x-2">
                  {pages.map((_, index) => (
                    <button
                      key={`page-tab-${index}`}
                      type="button"
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                        activePageIndex === index
                          ? 'bg-violet-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setActivePageIndex(index)}
                    >
                      Page {index + 1}
                    </button>
                  ))}
                </div>
              </div>

              <CardContent>
                {pages.map((page, index) => (
                  <div
                    key={`page-${index}`}
                    className={`p-4 border rounded-md bg-white ${
                      activePageIndex === index ? 'block' : 'hidden'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Page {index + 1}</h3>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleDuplicatePage(index)}
                          className="h-8 text-violet-600 hover:bg-violet-50"
                          title="Duplicate page"
                        >
                          <LuCopy size={16} />
                        </Button>
                        {pages.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleRemovePage(index)}
                            className="h-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                            title="Delete page"
                          >
                            <LuTrash size={16} />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`page-image-${index}`} className="flex items-center">
                          Image URL <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <div className="flex">
                          <Input
                            id={`page-image-${index}`}
                            value={page.imageUrl}
                            onChange={(e) => handlePageChange(index, 'imageUrl', e.target.value)}
                            placeholder="https://example.com/page.jpg"
                            className={`flex-1 ${formErrors.pages[index] ? 'border-red-500' : ''}`}
                          />
                          <Button
                            type="button"
                            className="ml-2 bg-violet-600 hover:bg-violet-700"
                            onClick={() => {
                              if (fileInputRef.current) {
                                fileInputRef.current.setAttribute('data-page-index', index.toString());
                                fileInputRef.current.click();
                              }
                            }}
                          >
                            <LuImage className="mr-2" /> Upload
                          </Button>
                        </div>
                        {formErrors.pages[index] && (
                          <p className="text-red-500 text-xs mt-1 error-message flex items-center">
                            <LuInfo className="mr-1" size={12} />
                            {formErrors.pages[index]}
                          </p>
                        )}
                        {page.imageUrl && (
                          <div className="mt-2 relative w-full h-[200px] border rounded-md overflow-hidden">
                            <img
                              src={page.imageUrl}
                              alt={`Page ${index + 1} preview`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`page-text-${index}`} className="flex items-center">
                          Text Content <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <textarea
                          id={`page-text-${index}`}
                          value={page.textContent}
                          onChange={(e) => handlePageChange(index, 'textContent', e.target.value)}
                          placeholder="Text content for this page"
                          className={`w-full min-h-[200px] px-3 py-2 border rounded-md resize-y ${
                            formErrors.pages[index] ? 'border-red-500' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {showPreview && (
                  <div className="mt-6 border-t pt-4">
                    <h3 className="font-medium mb-4">Page Preview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-100 p-4 rounded-md">
                      {pages.length > 0 && activePageIndex < pages.length && (
                        <>
                          <div className="aspect-[3/4] bg-white rounded-md shadow-md overflow-hidden">
                            {pages[activePageIndex].imageUrl ? (
                              <img
                                src={pages[activePageIndex].imageUrl}
                                alt={`Page ${activePageIndex + 1}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                <LuImage size={48} />
                              </div>
                            )}
                          </div>
                          <div className="bg-white p-4 rounded-md shadow-md flex items-center">
                            <p className="text-gray-800">
                              {pages[activePageIndex].textContent || 'No text content yet.'}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <CardFooter className="flex justify-end space-x-4 px-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-violet-600 hover:bg-violet-700 flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 border-t-2 border-white border-solid rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <LuSave className="mr-2" /> Save Story
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddStoryPage;
