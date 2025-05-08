import type React from 'react';
import { useState } from 'react';
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

  return (
    <div className="absolute bottom-0 left-0 z-30 w-full bg-navy-dark shadow-lg border-t border-navy-light">
      {/* Navigation Bar Container */}
      <div className="flex h-14 items-center justify-between px-6">
        {/* Left section: Page navigation buttons */}
        <div className="flex items-center space-x-3 text-white">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className={`flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-blue-accent focus:outline-none focus:ring-2 focus:ring-blue-accent/50 ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:text-white'}`}
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
            className={`flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-blue-accent focus:outline-none focus:ring-2 focus:ring-blue-accent/50 ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:text-white'}`}
            title="Previous Page"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="px-2 text-sm font-medium bg-navy-light/50 py-1 rounded-md min-w-[45px] text-center">
            <span>{currentPage}/{totalPages}</span>
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-blue-accent focus:outline-none focus:ring-2 focus:ring-blue-accent/50 ${currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'hover:text-white'}`}
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
            className={`flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-blue-accent focus:outline-none focus:ring-2 focus:ring-blue-accent/50 ${currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'hover:text-white'}`}
            title="Last Page"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Center section: Page slider */}
        <div className="hidden flex-1 items-center justify-center px-8 md:flex">
          <input
            type="range"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={handleSliderChange}
            className="h-1 w-full appearance-none rounded bg-slate-light [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-accent"
          />
        </div>

        {/* Right section: Tools */}
        <div className="flex items-center space-x-3 text-white">
          {/* Zoom button & controls */}
          <div className="relative">
            <button
              onClick={() => setShowZoomControls(!showZoomControls)}
              className={`flex h-9 w-9 items-center justify-center rounded-md transition focus:outline-none focus:ring-2 focus:ring-blue-accent/50 ${showZoomControls ? 'bg-blue-accent' : 'hover:bg-blue-accent hover:text-white'}`}
              title="Zoom"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>

            {/* Zoom popup controls */}
            {showZoomControls && (
              <div className="absolute bottom-full right-0 mb-2 flex w-48 flex-col rounded bg-white p-3 text-navy shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Zoom Level: {settings.zoomLevel.toFixed(1)}x</span>
                  <button
                    onClick={() => setShowZoomControls(false)}
                    className="text-gray-500 hover:text-navy"
                    type="button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleZoomChange(settings.zoomLevel - 0.1)}
                    className="flex h-8 w-8 items-center justify-center rounded bg-gray-200 hover:bg-gray-300"
                    disabled={settings.zoomLevel <= 0.5}
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
                    className="h-1 flex-1 appearance-none rounded bg-gray-300 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-accent"
                  />
                  <button
                    onClick={() => handleZoomChange(settings.zoomLevel + 0.1)}
                    className="flex h-8 w-8 items-center justify-center rounded bg-gray-200 hover:bg-gray-300"
                    disabled={settings.zoomLevel >= 2}
                    type="button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <div className="mt-2 flex justify-between">
                  <button
                    onClick={() => handleZoomChange(1)}
                    className="w-full rounded bg-blue-accent px-2 py-1 text-xs text-white hover:bg-blue-accent-light"
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
            className={`flex h-9 w-9 items-center justify-center rounded-md transition focus:outline-none focus:ring-2 focus:ring-blue-accent/50 ${settings.showThumbnails ? 'bg-blue-accent' : 'hover:bg-blue-accent hover:text-white'}`}
            title="Thumbnails"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>

          {/* Bookmark button */}
          {onToggleBookmark && (
            <button
              onClick={onToggleBookmark}
              className={`flex h-9 w-9 items-center justify-center rounded-md transition focus:outline-none focus:ring-2 focus:ring-blue-accent/50 ${isCurrentPageBookmarked ? 'text-blue-accent' : 'hover:bg-blue-accent hover:text-white'}`}
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
              className="flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-blue-accent hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-accent/50"
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
            className={`flex h-9 w-9 items-center justify-center rounded-md transition focus:outline-none focus:ring-2 focus:ring-blue-accent/50 ${settings.autoFlip ? 'bg-blue-accent' : 'hover:bg-blue-accent hover:text-white'}`}
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
            className={`flex h-9 w-9 items-center justify-center rounded-md transition focus:outline-none focus:ring-2 focus:ring-blue-accent/50 ${settings.soundOn ? 'bg-blue-accent' : 'hover:bg-blue-accent hover:text-white'}`}
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

          {/* Fullscreen button */}
          <button
            onClick={onToggleFullscreen}
            className="flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-blue-accent hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-accent/50"
            title="Fullscreen"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          </button>

          {/* More options button */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-blue-accent hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-accent/50"
            title="More Options"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;
