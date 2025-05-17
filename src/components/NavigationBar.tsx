import type React from 'react';
import { useState, useEffect } from 'react';
import type { FlipbookSettings } from '../types';

interface NavigationBarProps {
  currentPage: number;
  totalPages: number;
  settings: FlipbookSettings;
  onPageChange: (page: number) => void;
  onToggleThumbnails: () => void;
  onToggleFullscreen: () => void;
  onToggleSetting: (setting: keyof FlipbookSettings) => void;
  onUpdateZoom?: (zoomLevel: number) => void;
  onToggleBookmarks?: () => void;
  onToggleBookmark?: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  currentPage,
  totalPages,
  settings,
  onPageChange,
  onToggleThumbnails,
  onToggleFullscreen,
  onToggleSetting,
  onUpdateZoom,
  onToggleBookmarks,
  onToggleBookmark,
}) => {
  const [showZoomControls, setShowZoomControls] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPage = Number.parseInt(e.target.value, 10);
    onPageChange(newPage);
  };

  // Handle zoom level change
  const handleZoomChange = (newZoomLevel: number) => {
    const clampedZoom = Math.max(0.5, Math.min(2, newZoomLevel));
    if (onUpdateZoom) {
      onUpdateZoom(clampedZoom);
    }
  };

  // Handle sound toggle
  const handleSoundToggle = () => {
    onToggleSetting('soundOn');
  };

  // Check if current page is bookmarked
  const isCurrentPageBookmarked = settings.bookmarks.includes(currentPage);

  // Close zoom controls when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showZoomControls && !target.closest('.zoom-controls-container')) {
        setShowZoomControls(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showZoomControls]);

  // Define common button classes for reuse
  const buttonClass = (isActive?: boolean) => `
    flex h-10 w-10 items-center justify-center rounded-lg
    transition-all duration-200 ease-in-out
    ${isActive ? 'bg-blue-accent text-white' : 'text-white hover:bg-blue-accent/80 hover:text-white active:scale-95'}
    focus:outline-none focus:ring-2 focus:ring-blue-accent/50
    disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent
  `;

  return (
    <div className="fixed bottom-0 left-0 z-30 w-full bg-navy-dark/95 shadow-lg border-t border-navy-light backdrop-blur-sm">
      {/* Navigation Bar Container */}
      <div className="flex h-16 items-center justify-between px-3 sm:px-6">
        {/* Left section: Page navigation buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3 text-white">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className={buttonClass()}
            aria-label="First Page"
            title="First Page"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={buttonClass()}
            aria-label="Previous Page"
            title="Previous Page"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="px-2 text-sm font-medium bg-navy-light/70 py-1.5 rounded-lg min-w-[50px] text-center">
            <span>{currentPage}/{totalPages}</span>
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={buttonClass()}
            aria-label="Next Page"
            title="Next Page"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`${buttonClass()} hidden sm:flex`}
            aria-label="Last Page"
            title="Last Page"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Center section: Page slider */}
        <div className="hidden flex-1 items-center justify-center px-8 lg:flex">
          <div className="w-full max-w-xl relative">
            <input
              type="range"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={handleSliderChange}
              className="h-2 w-full appearance-none rounded-full bg-slate-light hover:bg-slate-light/80 cursor-pointer
                [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-accent
                [&::-webkit-slider-thumb]:hover:bg-blue-accent-light [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:transition-all"
              aria-label={`Page slider, currently on page ${currentPage} of ${totalPages}`}
            />

            {/* Visual markers for page positions */}
            <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 flex justify-between px-1.5 pointer-events-none">
              <div className="h-1 w-1 rounded-full bg-white/50"></div>
              <div className="h-1 w-1 rounded-full bg-white/50 hidden md:block"></div>
              <div className="h-1 w-1 rounded-full bg-white/50"></div>
              <div className="h-1 w-1 rounded-full bg-white/50 hidden md:block"></div>
              <div className="h-1 w-1 rounded-full bg-white/50"></div>
            </div>
          </div>
        </div>

        {/* Right section: Tools */}
        <div className="flex items-center space-x-1 sm:space-x-2 text-white">
          {/* Primary buttons visible on mobile */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Zoom button & controls */}
            <div className="relative zoom-controls-container">
              <button
                onClick={() => setShowZoomControls(!showZoomControls)}
                className={buttonClass(showZoomControls)}
                aria-label="Zoom controls"
                title="Zoom"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </button>

              {/* Zoom popup controls */}
              {showZoomControls && (
                <div className="absolute bottom-full right-0 mb-3 flex w-60 flex-col rounded-xl bg-white p-4 text-navy shadow-xl">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="text-sm font-medium">Zoom Level: {settings.zoomLevel.toFixed(1)}x</span>
                    </div>
                    <button
                      onClick={() => setShowZoomControls(false)}
                      className="text-gray-500 hover:text-navy rounded-full hover:bg-gray-100 p-1"
                      aria-label="Close zoom controls"
                      type="button"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleZoomChange(settings.zoomLevel - 0.1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-40"
                      disabled={settings.zoomLevel <= 0.5}
                      aria-label="Zoom out"
                      type="button"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="range"
                      min={0.5}
                      max={2}
                      step={0.1}
                      value={settings.zoomLevel}
                      onChange={(e) => handleZoomChange(Number.parseFloat(e.target.value))}
                      className="h-1.5 flex-1 appearance-none rounded-full bg-gray-200 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-accent"
                      aria-label="Zoom level"
                    />
                    <button
                      onClick={() => handleZoomChange(settings.zoomLevel + 0.1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-40"
                      disabled={settings.zoomLevel >= 2}
                      aria-label="Zoom in"
                      type="button"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-3 flex justify-between">
                    <button
                      onClick={() => handleZoomChange(1)}
                      className="w-full rounded-lg bg-blue-accent px-2 py-1.5 text-sm font-medium text-white hover:bg-blue-accent-light transition-colors"
                      aria-label="Reset zoom to 1x"
                      type="button"
                    >
                      Reset to 1.0x
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnails button */}
            <button
              onClick={onToggleThumbnails}
              className={buttonClass(settings.showThumbnails)}
              aria-label="Toggle thumbnails view"
              title="Thumbnails"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>

            {/* Common visible tools, max 2-3 on mobile */}
            {!isMobile && (
              <>
                {/* Bookmark button */}
                {onToggleBookmark && (
                  <button
                    onClick={onToggleBookmark}
                    className={buttonClass(isCurrentPageBookmarked)}
                    aria-label={isCurrentPageBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                    title={isCurrentPageBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                    type="button"
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
                )}

                {/* Bookmarks list button */}
                {onToggleBookmarks && (
                  <button
                    onClick={onToggleBookmarks}
                    className={buttonClass()}
                    aria-label="Show bookmarks"
                    title="Bookmarks List"
                    type="button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </button>
                )}

                {/* Auto flip button */}
                <button
                  onClick={() => onToggleSetting('autoFlip')}
                  className={buttonClass(settings.autoFlip)}
                  aria-label={settings.autoFlip ? 'Stop auto-flip' : 'Start auto-flip'}
                  title="Auto Flip"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>

                {/* Sound button */}
                <button
                  onClick={handleSoundToggle}
                  className={buttonClass(settings.soundOn)}
                  aria-label={settings.soundOn ? 'Turn sound off' : 'Turn sound on'}
                  title={settings.soundOn ? 'Sound On' : 'Sound Off'}
                  type="button"
                >
                  {settings.soundOn ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6l-8 4v4l8 4V6z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728M21 3l-3 3m-3 3l-3 3" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  )}
                </button>
              </>
            )}

            {/* Fullscreen button - always visible */}
            <button
              onClick={onToggleFullscreen}
              className={buttonClass()}
              aria-label="Toggle fullscreen"
              title="Fullscreen"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            </button>

            {/* Mobile menu toggle - only on small screens */}
            {isMobile && (
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className={buttonClass(showMobileMenu)}
                aria-label={showMobileMenu ? 'Close menu' : 'Open menu'}
                title="More Options"
                type="button"
              >
                {showMobileMenu ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu - Appears below navbar on small screens */}
      {isMobile && showMobileMenu && (
        <div className="bg-navy-darker p-3 space-y-2 sm:hidden border-t border-navy-light/20 animate-slideUp">
          <div className="text-gray-400 text-xs uppercase font-medium mb-1 pl-1">Tools</div>
          <div className="grid grid-cols-4 gap-2">
            {/* Bookmark button */}
            {onToggleBookmark && (
              <button
                onClick={() => {
                  onToggleBookmark();
                  setShowMobileMenu(false);
                }}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  isCurrentPageBookmarked ? 'bg-blue-accent/20 text-blue-accent' : 'text-white hover:bg-navy-light/20'
                }`}
                aria-label={isCurrentPageBookmarked ? 'Remove bookmark' : 'Add bookmark'}
              >
                {isCurrentPageBookmarked ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                )}
                <span className="text-xs">{isCurrentPageBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
            )}

            {/* Bookmarks list button */}
            {onToggleBookmarks && (
              <button
                onClick={() => {
                  onToggleBookmarks();
                  setShowMobileMenu(false);
                }}
                className="flex flex-col items-center p-2 rounded-lg text-white hover:bg-navy-light/20 transition-colors"
                aria-label="Show bookmarks"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="text-xs">Bookmarks</span>
              </button>
            )}

            {/* Auto flip button */}
            <button
              onClick={() => {
                onToggleSetting('autoFlip');
                setShowMobileMenu(false);
              }}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                settings.autoFlip ? 'bg-blue-accent/20 text-blue-accent' : 'text-white hover:bg-navy-light/20'
              }`}
              aria-label={settings.autoFlip ? 'Stop auto-flip' : 'Start auto-flip'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs">Auto-Flip</span>
            </button>

            {/* Sound button */}
            <button
              onClick={() => {
                handleSoundToggle();
                setShowMobileMenu(false);
              }}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                settings.soundOn ? 'bg-blue-accent/20 text-blue-accent' : 'text-white hover:bg-navy-light/20'
              }`}
              aria-label={settings.soundOn ? 'Turn sound off' : 'Turn sound on'}
            >
              {settings.soundOn ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6l-8 4v4l8 4V6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728M21 3l-3 3m-3 3l-3 3" />
                  </svg>
                  <span className="text-xs">Sound On</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                  <span className="text-xs">Sound Off</span>
                </>
              )}
            </button>
          </div>

          {/* Page slider for mobile */}
          <div className="mt-3 px-1">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
              <span>Page</span>
              <span>{currentPage} of {totalPages}</span>
            </div>
            <input
              type="range"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={handleSliderChange}
              className="h-2 w-full appearance-none rounded-full bg-slate-light hover:bg-slate-light/80 cursor-pointer
                [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-accent
                [&::-webkit-slider-thumb]:hover:bg-blue-accent-light [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:transition-all"
              aria-label={`Page slider, currently on page ${currentPage} of ${totalPages}`}
            />
          </div>
        </div>
      )}

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .animate-slideUp {
          animation: slideUp 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default NavigationBar;
