import { useState, useEffect, useCallback, useRef } from 'react';
import FlipbookViewer from './FlipbookViewer';
import NavigationBar from './NavigationBar';
import type { FlipbookSettings, Page, AnimationStyle, Story } from '../types';

import { SAMPLE_PAGE_CONTENT } from '../types';

// Sample data for the flipbook
const samplePages: Page[] = [
  {
    id: 1,
    imageUrl: 'https://ext.same-assets.com/3585540836/3463851396.webp',
    content: 'Cover page - FlipHTML5 Product Brochure',
    textContent: SAMPLE_PAGE_CONTENT[0]
  },
  {
    id: 2,
    imageUrl: 'https://ext.same-assets.com/3585540836/3463851396.webp',
    content: 'Introduction Page',
    textContent: SAMPLE_PAGE_CONTENT[1]
  },
  {
    id: 3,
    imageUrl: 'https://ext.same-assets.com/3585540836/3463851396.webp',
    content: 'Features Overview',
    textContent: SAMPLE_PAGE_CONTENT[2]
  },
  {
    id: 4,
    imageUrl: 'https://ext.same-assets.com/3585540836/3463851396.webp',
    content: 'Publishing Options',
    textContent: SAMPLE_PAGE_CONTENT[3]
  },
  {
    id: 5,
    imageUrl: 'https://ext.same-assets.com/879693443/3842590164.webp',
    content: 'Personalize - Layout Options',
    textContent: SAMPLE_PAGE_CONTENT[4]
  },
  {
    id: 6,
    imageUrl: 'https://ext.same-assets.com/3585540836/3463851396.webp',
    content: 'Analytics and Tracking',
    textContent: SAMPLE_PAGE_CONTENT[5]
  },
  {
    id: 7,
    imageUrl: 'https://ext.same-assets.com/3585540836/3463851396.webp',
    content: 'Pricing and Plans',
    textContent: SAMPLE_PAGE_CONTENT[6]
  },
];

// Sample story data
const sampleStory: Story = {
  id: 1,
  title: "FlipHTML5 Product Brochure",
  author: "FlipHTML5 Team",
  coverImage: "https://ext.same-assets.com/3585540836/3463851396.webp",
  description: "All-in-one Online Flipbook Maker",
  category: "Product",
  tags: ["flipbook", "digital publishing", "online tool"],
  likes: 253,
  views: 1254,
  pages: samplePages
};

// Story Details component
const StoryDetails = ({ story }: { story: Story }) => {
  return (
    <div className="bg-navy-dark p-4 text-white border-b border-navy-light">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={story.coverImage}
            alt={story.title}
            className="h-12 w-12 object-cover rounded mr-4"
          />
          <div>
            <h2 className="text-xl font-bold">{story.title}</h2>
            <p className="text-sm text-gray-300">By {story.author} • {story.category}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-blue-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{story.views}</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-blue-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{story.likes}</span>
          </div>
          <button className="bg-blue-accent hover:bg-blue-accent-light rounded px-4 py-1 text-sm font-medium">
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

interface FlipbookLayoutProps {
  story?: Story;
}

const FlipbookLayout: React.FC<FlipbookLayoutProps> = ({ story = sampleStory }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isThumbnailView, setIsThumbnailView] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showBookmarks, setShowBookmarks] = useState<boolean>(false);
  const [settings, setSettings] = useState<FlipbookSettings>({
    autoFlip: false,
    autoFlipInterval: 3000, // 3 seconds between page turns
    soundOn: true, // Default sound is ON
    showThumbnails: false,
    zoomLevel: 1,
    bookmarks: [],
    searchQuery: '',
    searchResults: [],
    currentSearchIndex: 0,
    animationStyle: 'flip', // Default animation style
  });

  const [showKeyboardHelp, setShowKeyboardHelp] = useState<boolean>(false);
  const [showShortcutToast, setShowShortcutToast] = useState<boolean>(true);
  const [showAutoFlipSettings, setShowAutoFlipSettings] = useState<boolean>(false);
  const [showAnimationStyleControls, setShowAnimationStyleControls] = useState<boolean>(false);
  const [showStoryDetails, setShowStoryDetails] = useState<boolean>(true);

  // Auto-flip timer reference
  const autoFlipTimerRef = useRef<number | null>(null);

  // Use the story's pages or fallback to sample pages
  const pages = story?.pages || samplePages;
  const totalPages = pages.length;

  // Helper: is current page bookmarked?
  const isCurrentPageBookmarked = settings.bookmarks.includes(currentPage);

  // Navigation handlers
  const handlePageChange = useCallback(
    (pageNumber: number, fromNavBar = false) => {
      // Clamp the page number to valid range
      const validPage = Math.max(1, Math.min(pageNumber, totalPages));
      setCurrentPage(validPage);
      if (fromNavBar) setIsThumbnailView(false);
    },
    [totalPages]
  );

  // Toggle the auto-flip setting
  const toggleAutoFlip = useCallback(() => {
    setSettings(prev => {
      const newAutoFlip = !prev.autoFlip;
      if (newAutoFlip) {
        setShowAutoFlipSettings(true);
      }
      return {
        ...prev,
        autoFlip: newAutoFlip
      };
    });
  }, []);

  // Toggle any boolean setting
  const toggleSetting = useCallback((key: keyof FlipbookSettings) => {
    if (key === 'zoomLevel') {
      // Special handling for zoom level
      return;
    }

    if (key === 'autoFlip') {
      toggleAutoFlip();
    } else {
      setSettings((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    }
  }, [toggleAutoFlip]);

  const toggleThumbnailView = useCallback(() => {
    setIsThumbnailView((prev) => !prev);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const updateZoomLevel = useCallback((zoom: number) => {
    const clampedZoom = Math.max(0.5, Math.min(2, zoom));
    setSettings((s) => ({ ...s, zoomLevel: clampedZoom }));
  }, []);

  const updateAutoFlipInterval = useCallback((interval: number) => {
    setSettings((s) => ({ ...s, autoFlipInterval: interval }));
  }, []);

  const changeAnimationStyle = useCallback((style: AnimationStyle) => {
    setSettings((s) => ({ ...s, animationStyle: style }));
    setShowAnimationStyleControls(false);
  }, []);

  // Bookmarks
  const toggleBookmark = useCallback(() => {
    setSettings((prev) => {
      const bookmarks = [...prev.bookmarks];
      const index = bookmarks.indexOf(currentPage);

      if (index !== -1) {
        // Remove bookmark
        bookmarks.splice(index, 1);
      } else {
        // Add bookmark
        bookmarks.push(currentPage);
        bookmarks.sort((a, b) => a - b); // Keep bookmarks sorted
      }

      return {
        ...prev,
        bookmarks,
      };
    });
  }, [currentPage]);

  const goToBookmark = useCallback((pageNum: number) => {
    handlePageChange(pageNum, true);
    setShowBookmarks(false);
  }, [handlePageChange]);

  // Keyboard help
  const toggleKeyboardHelp = useCallback(() => setShowKeyboardHelp((v) => !v), []);

  // Auto-flip effect
  useEffect(() => {
    if (settings.autoFlip) {
      if (autoFlipTimerRef.current) clearInterval(autoFlipTimerRef.current);
      autoFlipTimerRef.current = window.setInterval(() => {
        setCurrentPage((prev) => (prev < totalPages ? prev + 1 : 1));
      }, settings.autoFlipInterval);
    } else {
      if (autoFlipTimerRef.current) clearInterval(autoFlipTimerRef.current);
    }
    return () => {
      if (autoFlipTimerRef.current) clearInterval(autoFlipTimerRef.current);
    };
  }, [settings.autoFlip, settings.autoFlipInterval, totalPages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showKeyboardHelp) {
        if (e.key === 'Escape' || e.key.toLowerCase() === 'h') {
          setShowKeyboardHelp(false);
        }
        return;
      }
      switch (e.key) {
        case 'ArrowRight':
          handlePageChange(currentPage + 1);
          break;
        case 'ArrowLeft':
          handlePageChange(currentPage - 1);
          break;
        case 'Home':
          handlePageChange(1);
          break;
        case 'End':
          handlePageChange(totalPages);
          break;
        case '+':
        case '=':
          updateZoomLevel(settings.zoomLevel + 0.1);
          break;
        case '-':
          updateZoomLevel(settings.zoomLevel - 0.1);
          break;
        case '0':
          updateZoomLevel(1);
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 't':
        case 'T':
          toggleThumbnailView();
          break;
        case 'a':
        case 'A':
          toggleSetting('autoFlip');
          break;
        case 'b':
        case 'B':
          toggleBookmark();
          break;
        case 's':
        case 'S':
          toggleSetting('soundOn');
          break;
        case 'h':
        case 'H':
          setShowKeyboardHelp(true);
          setShowShortcutToast(false);
          break;
        case 'Escape':
          setShowBookmarks(false);
          setShowAnimationStyleControls(false);
          setShowAutoFlipSettings(false);
          setShowKeyboardHelp(false);
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentPage,
    totalPages,
    settings.zoomLevel,
    settings,
    showKeyboardHelp,
    handlePageChange,
    updateZoomLevel,
    toggleFullscreen,
    toggleThumbnailView,
    toggleSetting,
    toggleBookmark,
  ]);

  // Hide shortcut toast after a few seconds
  useEffect(() => {
    if (showShortcutToast) {
      const timer = setTimeout(() => setShowShortcutToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showShortcutToast]);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-navy">
      {/* Story Details Section */}
      {showStoryDetails && <StoryDetails story={story} />}

      <div className="relative flex flex-1 flex-col items-center justify-center">
        <div className="relative flex w-full flex-1 items-center justify-center">
          {/* Left navigation arrow */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 text-white opacity-80 transition-opacity hover:opacity-100 ${currentPage === 1 ? 'cursor-not-allowed opacity-40' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Flipbook viewer */}
          <FlipbookViewer
            pages={pages}
            currentPage={currentPage}
            isThumbnailView={isThumbnailView}
            zoomLevel={settings.zoomLevel}
            onPageChange={handlePageChange}
            onUpdateZoom={updateZoomLevel}
            soundOn={settings.soundOn}
            animationStyle={settings.animationStyle}
          />

          {/* Right navigation arrow */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className={`absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 text-white opacity-80 transition-opacity hover:opacity-100 ${currentPage >= totalPages - 1 ? 'cursor-not-allowed opacity-40' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation bar */}
      <NavigationBar
        currentPage={currentPage}
        totalPages={totalPages}
        settings={settings}
        onPageChange={(page) => handlePageChange(page, true)}
        onToggleThumbnails={toggleThumbnailView}
        onToggleFullscreen={toggleFullscreen}
        onToggleSetting={toggleSetting}
        onUpdateZoom={updateZoomLevel}
        onToggleBookmarks={() => setShowBookmarks(!showBookmarks)}
        onToggleBookmark={toggleBookmark}
      />

      {/* Animation Style Button */}
      <button
        onClick={() => setShowAnimationStyleControls(!showAnimationStyleControls)}
        className="absolute bottom-16 right-28 z-20 rounded-full bg-white p-2 shadow-lg transition-transform hover:scale-105"
        title="Animation Styles"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
        </svg>
      </button>

      {/* Animation Style Controls */}
      {showAnimationStyleControls && (
        <div className="absolute bottom-28 right-28 z-50 w-64 rounded-lg bg-white p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-navy">Animation Style</h3>
            <button
              onClick={() => setShowAnimationStyleControls(false)}
              className="text-gray-500 hover:text-navy"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => changeAnimationStyle('flip')}
              className={`flex flex-col items-center rounded p-2 ${settings.animationStyle === 'flip' ? 'bg-blue-accent text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <span className="text-lg">🔄</span>
              <span className="mt-1 text-sm">Flip</span>
            </button>
            <button
              onClick={() => changeAnimationStyle('curl')}
              className={`flex flex-col items-center rounded p-2 ${settings.animationStyle === 'curl' ? 'bg-blue-accent text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <span className="text-lg">↪️</span>
              <span className="mt-1 text-sm">Curl</span>
            </button>
            <button
              onClick={() => changeAnimationStyle('fold')}
              className={`flex flex-col items-center rounded p-2 ${settings.animationStyle === 'fold' ? 'bg-blue-accent text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <span className="text-lg">📑</span>
              <span className="mt-1 text-sm">Fold</span>
            </button>
            <button
              onClick={() => changeAnimationStyle('slide')}
              className={`flex flex-col items-center rounded p-2 ${settings.animationStyle === 'slide' ? 'bg-blue-accent text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <span className="text-lg">➡️</span>
              <span className="mt-1 text-sm">Slide</span>
            </button>
          </div>
        </div>
      )}

      {/* Bookmarks Panel */}
      {showBookmarks && (
        <div className="absolute bottom-16 right-4 z-50 w-64 rounded-lg bg-white p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-navy">Bookmarks</h3>
            <button
              onClick={() => setShowBookmarks(false)}
              className="text-gray-500 hover:text-navy"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {settings.bookmarks.length === 0 ? (
            <p className="py-2 text-center text-sm text-gray-500">No bookmarks yet. Press 'B' to bookmark a page.</p>
          ) : (
            <div className="max-h-60 overflow-y-auto">
              {settings.bookmarks.map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => goToBookmark(pageNum)}
                  className={`mb-2 flex w-full items-center rounded-md px-3 py-2 text-left hover:bg-slate-light/20 ${
                    pageNum === currentPage ? 'bg-blue-accent/10 font-medium text-blue-accent' : 'text-navy'
                  }`}
                >
                  <span className="mr-2 text-blue-accent">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </span>
                  Page {pageNum}
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 border-t border-gray-200 pt-2">
            <button
              onClick={toggleBookmark}
              className="flex w-full items-center justify-center rounded-md bg-blue-accent px-3 py-2 text-sm font-medium text-white hover:bg-blue-accent-light"
            >
              {isCurrentPageBookmarked ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                  Remove current bookmark
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Bookmark current page
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Auto-flip Settings Modal */}
      {showAutoFlipSettings && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-md rounded-lg bg-white p-6 shadow-xl sm:mx-0">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-navy">Auto-Flip Settings</h2>
              <button
                onClick={() => setShowAutoFlipSettings(false)}
                className="text-gray-500 hover:text-navy"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <label className="mb-2 block font-medium text-navy">
                Page Turn Interval (seconds)
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={0.5}
                  value={settings.autoFlipInterval / 1000}
                  onChange={(e) => updateAutoFlipInterval(Number(e.target.value) * 1000)}
                  className="mr-3 h-1 flex-1 appearance-none rounded bg-gray-300 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-accent"
                />
                <span className="w-12 text-right">{(settings.autoFlipInterval / 1000).toFixed(1)}s</span>
              </div>
            </div>

            <div className="mb-6 flex items-center">
              <input
                type="checkbox"
                id="autoFlipEnabled"
                checked={settings.autoFlip}
                onChange={() => toggleSetting('autoFlip')}
                className="h-4 w-4 rounded border-gray-300 text-blue-accent focus:ring-blue-accent"
              />
              <label htmlFor="autoFlipEnabled" className="ml-2 block text-sm font-medium text-navy">
                Enable Auto-Flip
              </label>
            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowAutoFlipSettings(false)}
                className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-navy hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAutoFlipSettings(false);
                }}
                className="rounded bg-blue-accent px-4 py-2 text-sm font-medium text-white hover:bg-blue-accent-light"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bookmark Button */}
      <button
        onClick={() => setShowBookmarks(!showBookmarks)}
        className={`absolute bottom-16 right-16 z-20 rounded-full bg-white p-2 shadow-lg transition-transform hover:scale-105 ${
          showBookmarks ? 'bg-blue-accent text-white' : isCurrentPageBookmarked ? 'text-blue-accent' : ''
        }`}
        title="Bookmarks"
      >
        {isCurrentPageBookmarked ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        )}
      </button>

      {/* Keyboard Help Button */}
      <button
        onClick={toggleKeyboardHelp}
        className="absolute bottom-16 left-4 z-20 rounded-full bg-white p-2 shadow-lg transition-transform hover:scale-105"
        title="Keyboard Shortcuts"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      </button>

      {/* Keyboard Shortcuts Toast Notification */}
      {showShortcutToast && (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 transform animate-fadeIn rounded-lg bg-blue-accent px-6 py-3 text-white shadow-lg">
          <div className="flex items-center">
            <div className="mr-3 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Press <span className="font-mono">H</span> to view keyboard shortcuts</p>
            </div>
            <button
              onClick={() => setShowShortcutToast(false)}
              className="ml-4 rounded-full p-1 hover:bg-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help Modal */}
      {showKeyboardHelp && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-md rounded-lg bg-white p-6 shadow-xl sm:mx-0">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-navy">Keyboard Shortcuts</h2>
              <button
                onClick={() => setShowKeyboardHelp(false)}
                className="text-gray-500 hover:text-navy"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-semibold">Navigation</div>
              <div className="text-gray-600">Controls</div>

              <div>Next Page</div>
              <div className="font-mono bg-gray-100 px-1.5 py-0.5 text-center">→ (Right Arrow)</div>

              <div>Previous Page</div>
              <div className="font-mono bg-gray-100 px-1.5 py-0.5 text-center">← (Left Arrow)</div>

              <div>First Page</div>
              <div className="font-mono bg-gray-100 px-1.5 py-0.5 text-center">Home</div>

              <div>Last Page</div>
              <div className="font-mono bg-gray-100 px-1.5 py-0.5 text-center">End</div>

              <div>Zoom In</div>
              <div className="font-mono bg-gray-100 px-1.5 py-0.5 text-center">+ (Plus)</div>

              <div>Zoom Out</div>
              <div className="font-mono bg-gray-100 px-1.5 py-0.5 text-center">- (Minus)</div>

              <div>Reset Zoom</div>
              <div className="font-mono bg-gray-100 px-1.5 py-0.5 text-center">0 (Zero)</div>

              <div>Toggle Fullscreen</div>
              <div className="font-mono bg-gray-100 px-1.5 py-0.5 text-center">F</div>

              <div>Toggle Thumbnails</div>
              <div className="font-mono bg-gray-100 px-1.5 py-0.5 text-center">T</div>

              <div>Toggle Auto-Flip</div>
              <div className="font-mono bg-gray-100 px-1.5 py-0.5 text-center">A</div>

              <div>Toggle Bookmark</div>
              <div className="font-mono bg-gray-100 px-1.5 py-0.5 text-center">B</div>

              <div>Toggle Sound</div>
              <div className="font-mono bg-gray-100 px-1.5 py-0.5 text-center">S</div>

              <div>Show/Hide Help</div>
              <div className="font-mono bg-gray-100 px-1.5 py-0.5 text-center">H</div>

              <div>Close/Exit</div>
              <div className="font-mono bg-gray-100 px-1.5 py-0.5 text-center">Esc</div>
            </div>
            <div className="mt-4 text-right">
              <button
                onClick={() => setShowKeyboardHelp(false)}
                className="rounded bg-blue-accent px-4 py-2 text-white hover:bg-blue-accent-light"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlipbookLayout;
