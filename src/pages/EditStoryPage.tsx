import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStoryStore } from '../lib/store';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import {
  LuArrowLeft,
  LuPlus,
  LuTrash,
  LuX,
  LuImage,
  LuInfo,
  LuSave,
  LuCopy,
  LuEye,
  LuLoader
} from 'react-icons/lu';
import type { Page, Story } from '../types';

const EditStoryPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getStoryById, updateStory, isLoading } = useStoryStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [isFormLoading, setIsFormLoading] = useState(true);

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
  const [storyModified, setStoryModified] = useState(false);

  // Fetch story data
  useEffect(() => {
    if (id) {
      const storyId = Number(id);
      const story = getStoryById(storyId);

      if (story) {
        // Populate form with story data
        setTitle(story.title);
        setAuthor(story.author);
        setCoverImage(story.coverImage);
        setDescription(story.description);
        setCategory(story.category);
        setTags(story.tags);
        setPages(story.pages);
      } else {
        // Story not found, redirect back to admin dashboard
        navigate('/admin');
      }

      setIsFormLoading(false);
    }
  }, [id, getStoryById, navigate]);

  // Reset page errors when pages are modified
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

    // Validate pages
    pages.forEach((page, index) => {
      if (!page.imageUrl || !validateImageUrl(page.imageUrl)) {
        errors.pages[index] = 'Valid image URL is required';
        isValid = false;
      } else if (!page.textContent) {
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
      setStoryModified(true);

      // Clear tag error if it exists
      if (formErrors.tags) {
        setFormErrors(prev => ({ ...prev, tags: '' }));
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    setStoryModified(true);
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleAddPage = () => {
    // Add a new page with the next sequential ID
    const maxId = pages.length > 0 ? Math.max(...pages.map(page => page.id)) : 0;
    setPages([...pages, { id: maxId + 1, imageUrl: '', textContent: '' }]);
    // Set the newly added page as active
    setActivePageIndex(pages.length);
    setStoryModified(true);
  };

  const handleRemovePage = (pageId: number) => {
    if (pages.length > 1) {
      const pageIndex = pages.findIndex(page => page.id === pageId);
      setPages(pages.filter(page => page.id !== pageId));

      // Adjust active page index if necessary
      if (activePageIndex >= pageIndex) {
        setActivePageIndex(Math.max(0, activePageIndex - 1));
      }

      setStoryModified(true);
    }
  };

  const handlePageChange = (pageId: number, field: keyof Omit<Page, 'id'>, value: string) => {
    setPages(pages.map(page =>
      page.id === pageId ? { ...page, [field]: value } : page
    ));

    setStoryModified(true);

    // Clear error for this field if it exists
    const pageIndex = pages.findIndex(page => page.id === pageId);
    if (pageIndex >= 0 && formErrors.pages[pageIndex]) {
      const newPageErrors = [...formErrors.pages];
      newPageErrors[pageIndex] = '';
      setFormErrors(prev => ({ ...prev, pages: newPageErrors }));
    }
  };

  const handleDuplicatePage = (pageId: number) => {
    const pageIndex = pages.findIndex(page => page.id === pageId);
    if (pageIndex === -1) return;

    const pageToDuplicate = pages[pageIndex];
    const maxId = Math.max(...pages.map(page => page.id)) + 1;

    const newPage = { ...pageToDuplicate, id: maxId };
    const newPages = [...pages];
    newPages.splice(pageIndex + 1, 0, newPage);

    setPages(newPages);
    setActivePageIndex(pageIndex + 1);
    setStoryModified(true);
  };

  const handleImageUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, pageIndex?: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (typeof pageIndex === 'number') {
          const page = pages[pageIndex];
          if (page) {
            handlePageChange(page.id, 'imageUrl', base64String);
          }
        } else {
          setCoverImage(base64String);
          setStoryModified(true);
          // Clear cover image error if it exists
          if (formErrors.coverImage) {
            setFormErrors(prev => ({ ...prev, coverImage: '' }));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    if (!validateForm()) {
      // Scroll to the first error
      const errorElement = document.querySelector('.error-message');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      // Create updated story object
      const updatedStory: Partial<Story> = {
        title,
        author,
        coverImage,
        description,
        category,
        tags,
        pages
      };

      await updateStory(Number(id), updatedStory);
      navigate('/admin');
    } catch (error) {
      console.error('Failed to update story:', error);
      alert('Failed to update story. Please try again.');
    }
  };

  if (isFormLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <LuLoader className="h-12 w-12 text-violet-600 animate-spin" />
          <p className="mt-4 text-lg text-violet-600">Loading story...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="mr-4"
          >
            <LuArrowLeft className="mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Story</h1>
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
                      setStoryModified(true);
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
                      setStoryModified(true);
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
                      setStoryModified(true);
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
                    onChange={(e) => handleImageFileChange(e)}
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
                    setStoryModified(true);
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
                      setStoryModified(true);
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

            {/* Page navigation tabs */}
            {pages.length > 0 && (
              <div className="px-6 mb-4 overflow-x-auto">
                <div className="flex space-x-2">
                  {pages.map((page, index) => (
                    <button
                      key={`page-tab-${page.id}`}
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
            )}

            <CardContent>
              {pages.map((page, index) => (
                <div
                  key={`page-${page.id}`}
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
                        onClick={() => handleDuplicatePage(page.id)}
                        className="h-8 text-violet-600 hover:bg-violet-50"
                        title="Duplicate page"
                      >
                        <LuCopy size={16} />
                      </Button>
                      {pages.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleRemovePage(page.id)}
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
                      <Label htmlFor={`page-image-${page.id}`} className="flex items-center">
                        Image URL <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <div className="flex">
                        <Input
                          id={`page-image-${page.id}`}
                          value={page.imageUrl || ''}
                          onChange={(e) => handlePageChange(page.id, 'imageUrl', e.target.value)}
                          placeholder="https://example.com/page.jpg"
                          className={`flex-1 ${
                            formErrors.pages[index] ? 'border-red-500' : ''
                          }`}
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
                      <Label htmlFor={`page-text-${page.id}`} className="flex items-center">
                        Text Content <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <textarea
                        id={`page-text-${page.id}`}
                        value={page.textContent || ''}
                        onChange={(e) => handlePageChange(page.id, 'textContent', e.target.value)}
                        placeholder="Text content for this page"
                        className={`w-full min-h-[200px] px-3 py-2 border rounded-md resize-y ${
                          formErrors.pages[index] ? 'border-red-500' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Preview section */}
              {showPreview && pages.length > 0 && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="font-medium mb-4">Page Preview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-100 p-4 rounded-md">
                    {activePageIndex < pages.length && (
                      <>
                        <div className="aspect-[3/4] bg-white rounded-md shadow-md overflow-hidden">
                          {pages[activePageIndex]?.imageUrl ? (
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
                            {pages[activePageIndex]?.textContent || 'No text content yet.'}
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
              disabled={isLoading || !storyModified}
            >
              {isLoading ? (
                <>
                  <LuLoader className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <LuSave className="mr-2" /> Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </div>
    </div>
  );
};

export default EditStoryPage;
