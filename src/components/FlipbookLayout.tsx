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
      <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
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
        <div className="flex items-center space-x-4 mt-2 sm:mt-0">
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
          <button className="bg-blue-accent hover:bg-blue-accent-light rounded px-4 py-1 text-sm font-medium"
            aria-label="Share this flipbook"
            title="Share this flipbook"
          >
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
    zoomLevel: 1.7,
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

  // High contrast mode for visually impaired
  const [hcMode, setHCMode] = useState(false);

  // Add this missing state variable
  const [isFlipping, setIsFlipping] = useState(false);

  // Voice-over state
  const [voiceOverEnabled, setVoiceOverEnabled] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voiceLang, setVoiceLang] = useState<string>('');
  const speakingRef = useRef(false);

  // Voice-over panel state
  const [showVoicePanel, setShowVoicePanel] = useState(false);

  // Effect: Load voices
  useEffect(() => {
    const updateVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      setAvailableVoices(allVoices);
      // Pick cartoon/fun, else female, else first male, else first
      const fav = allVoices.find(v => v.name.toLowerCase().includes('cartoon'))
        || allVoices.find(v => (v as any).gender === 'female')
        || allVoices.find(v => v.name.toLowerCase().includes('female'))
        || allVoices.find(v => (v as any).gender === 'male')
        || allVoices[0];
      setSelectedVoice(fav || null);
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  // Function: Speak
  const speakText = useCallback((text: string) => {
    if (!voiceOverEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new window.SpeechSynthesisUtterance(text);
    if (selectedVoice) utter.voice = selectedVoice;
    utter.rate = 1;
    utter.pitch = selectedVoice?.name.toLowerCase().includes('cartoon') ? 1.35 : 1;
    speakingRef.current = true;
    window.speechSynthesis.speak(utter);
    utter.onend = () => { speakingRef.current = false; };
  }, [voiceOverEnabled, selectedVoice]);

  // Function: Stop
  const stopSpeak = () => { window.speechSynthesis.cancel(); speakingRef.current = false; }

  // Speak on page change
  // Use the story's pages or fallback to sample pages
  const pages = story?.pages || samplePages;
  const totalPages = pages.length;

  useEffect(() => {
    if (!voiceOverEnabled) { stopSpeak(); return; }
    const page = pages[currentPage-1] || pages[0];
    if (page && page.textContent) {
      speakText(page.textContent);
    } else if (page && page.content) {
      speakText(page.content);
    }
    // Cleanup on unmount/page
    return stopSpeak;
    // eslint-disable-next-line
  }, [currentPage, voiceOverEnabled, selectedVoice]);

  // Auto-flip timer reference
  const autoFlipTimerRef = useRef<number | null>(null);

  // Helper: is current page bookmarked?
  const isCurrentPageBookmarked = settings.bookmarks.includes(currentPage);

  // Navigation handlers
  const handlePageChange = useCallback(
    (pageNumber: number, fromNavBar = false) => {
      // Clamp the page number to valid range
      const validPage = Math.max(1, Math.min(pageNumber, totalPages));
      setCurrentPage(validPage);
      if (fromNavBar) setIsThumbnailView(false);
      // Stop voice-over on page change
      stopSpeak();
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
    const clampedZoom = Math.max(0.5, Math.min(1.7, zoom));
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

  // Add prevPage state to track page changes
  const [prevPage, setPrevPage] = useState(currentPage);

  // Update prevPage when currentPage changes
  useEffect(() => {
    setPrevPage(currentPage);
  }, [currentPage]);

  // Page flip animation effect
  useEffect(() => {
    // Set isFlipping to true briefly when page changes to trigger animation
    if (prevPage !== currentPage) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setIsFlipping(false);
      }, 550); // Match this to the flip animation duration
      return () => clearTimeout(timer);
    }
  }, [currentPage, prevPage]);

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
          setShowVoicePanel(false);
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

  // Responsive state for voice-over controls
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
        {/* Contrast Mode Buttons */}
        <div className="fixed bottom-16 right-4 z-20 flex flex-col space-y-2">
          {/* High Contrast Button */}
          <button
            onClick={() => setHCMode(true)}
            className={`rounded-lg p-2 border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all ${
              hcMode ? 'bg-blue-500 text-white' : 'bg-white/90 text-black hover:bg-white'
            }`}
            aria-label="Enable high contrast color scheme (yellow on black)"
            title="Enable high contrast for visually impaired"
          >
            🦯
          </button>

          {/* Normal Mode Button */}
          <button
            onClick={() => setHCMode(false)}
            className={`rounded-lg p-2 border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all ${
              !hcMode ? 'bg-blue-500 text-white' : 'bg-white/90 text-black hover:bg-white'
            }`}
            aria-label="Turn off high contrast color scheme"
            title="Turn off high contrast color scheme"
          >
            🌑
          </button>
        </div>
      <div
        className={`relative flex h-screen flex-col overflow-hidden ${hcMode ? '' : 'bg-navy'}`}
        style={hcMode ? {
          background: 'linear-gradient(135deg, #A7EFFA 0%, #FFE7B9 100%)',
          animation: 'bgMove 12s linear infinite',
        } : {}}
      >
        {hcMode && (
          <>
            <img
              src="https://ugc.same-assets.com/lWHg3mhHu8lfSwH-Vlxq2h_oU4h-vl8y.png"
              alt="Turtle Sticker"
              style={{position:'absolute',left:10,top:18,width:72,animation:'floatAnim 6s ease-in-out infinite alternate'}}
              draggable={false}
            />
            <img
              src="https://ugc.same-assets.com/4dlVHjcsmXd_3NdAhIYOfkcJd-2I0Epl.png"
              alt="Blue Bird Sticker"
              style={{position:'absolute',right:40,top:30,width:78,animation:'flyAnim 11s ease-in-out infinite alternate'}}
              draggable={false}
            />
            <img
              src="https://ugc.same-assets.com/8OAdXDx45VueljG9khgyY7_nYoJG5Dz-.jpeg"
              alt="Cute Animals Row"
              style={{position:'absolute',left:0,bottom:0,width:'360px',maxWidth:'45vw',animation:'waveAnim 7s ease-in-out infinite alternate'}}
              draggable={false}
            />
            <img
              src="https://ugc.same-assets.com/aXg3_zLudncPHX-Sq5G6YMsdq6eizxMF.jpeg"
              alt="Koala Sticker"
              style={{position:'absolute',right:14,bottom:18,width:85,animation:'floatAnimSmall 6s ease-in-out infinite alternate'}}
              draggable={false}
            />
            <style>{`
              @keyframes bgMove {
                0% { background-position: 0% 50% }
                100% { background-position: 100% 50% }
              }
              @keyframes floatAnim {
                0% { transform: translateY(0) rotate(-3deg); }
                100% { transform: translateY(-30px) rotate(5deg); }
              }
              @keyframes flyAnim {
                0% { transform: translateY(0) scale(1); }
                100% { transform: translateY(19px) scale(1.03); }
              }
              @keyframes waveAnim {
                0% { transform: translateY(0); }
                100% { transform: translateY(-18px); }
              }
              @keyframes floatAnimSmall {
                0% { transform: translateY(0) rotate(0deg); }
                100% { transform: translateY(-12px) rotate(-6deg); }
              }
            `}</style>
          </>
        )}
        {showStoryDetails && <StoryDetails story={story} />}

        <div className="relative flex flex-1 flex-col items-center justify-center">
          <div className="relative flex w-full flex-1 items-center justify-center">
            {/* Left navigation arrow - UPDATED to be smaller and cuter */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`absolute left-1 sm:left-4 top-1/2 z-10 -translate-y-1/2 rounded-full p-1 sm:p-1.5 text-white opacity-80 transition-all hover:opacity-100 ${currentPage === 1 ? 'cursor-not-allowed opacity-40' : 'hover:scale-105'}`}
              style={{
                height: isMobile ? 36 : 42,
                width: isMobile ? 36 : 42,
                fontSize: isMobile ? 16 : 20,
                border: hcMode ? '2px solid #ffe600' : '2px solid #FFD1BA',
                outline: hcMode ? '1.5px solid #ffe600' : '1.5px solid #383b3a',
                backgroundColor: hcMode ? '#000' : 'rgba(97, 174, 253, 0.9)',
                color: hcMode ? '#ffe600' : undefined,
                boxShadow: '0 1px 8px rgba(205, 237, 246, 0.6)',
                transform: `translateY(-50%) ${isFlipping ? 'scale(0.9)' : ''}`,
                transition: 'transform 0.15s ease, opacity 0.15s ease',
              }}
              tabIndex={0}
              aria-label="Previous page"
              title="Previous page (←)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-${isMobile ? '5' : '6'} w-${isMobile ? '5' : '6'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
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

            {/* Right navigation arrow - UPDATED to be smaller and cuter */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className={`absolute right-1 sm:right-4 top-1/2 z-10 -translate-y-1/2 rounded-full p-1 sm:p-1.5 text-white opacity-80 transition-all hover:opacity-100 ${currentPage >= totalPages - 1 ? 'cursor-not-allowed opacity-40' : 'hover:scale-105'}`}
              style={{
                height: isMobile ? 36 : 42,
                width: isMobile ? 36 : 42,
                fontSize: isMobile ? 16 : 20,
                border: hcMode ? '2px solid #ffe600' : '2px solid #FFD1BA',
                outline: hcMode ? '1.5px solid #ffe600' : '1.5px solid #383b3a',
                backgroundColor: hcMode ? '#000' : 'rgba(97, 174, 253, 0.9)',
                color: hcMode ? '#ffe600' : undefined,
                boxShadow: '0 1px 8px rgba(205, 237, 246, 0.6)',
                transform: `translateY(-50%) ${isFlipping ? 'scale(0.9)' : ''}`,
                transition: 'transform 0.15s ease, opacity 0.15s ease',
              }}
              tabIndex={0}
              aria-label="Next page"
              title="Next page (→)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-${isMobile ? '5' : '6'} w-${isMobile ? '5' : '6'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Voice-over controls modal (like Animation Style) */}
        {showVoicePanel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowVoicePanel(false)}>
            <div
              className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-navy">Voice-Over</h3>
                <button
                  onClick={() => setShowVoicePanel(false)}
                  className="text-gray-500 hover:text-navy transition-colors rounded-full p-1 hover:bg-gray-100"
                  aria-label="Close voice-over panel"
                  title="Close voice-over panel"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => { setVoiceOverEnabled(true); setShowVoicePanel(false); }}
                  className={`flex flex-col items-center rounded-lg p-3 ${voiceOverEnabled ? 'bg-blue-accent text-white' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                  aria-pressed={voiceOverEnabled}
                  aria-label="Enable voice-over"
                  title="Enable voice-over"
                >
                  <span className="text-2xl mb-1">🎤</span>
                  <span className="mt-1 text-sm font-medium">On</span>
                </button>
                <button
                  onClick={() => { setVoiceOverEnabled(false); setShowVoicePanel(false); stopSpeak(); }}
                  className={`flex flex-col items-center rounded-lg p-3 ${!voiceOverEnabled ? 'bg-blue-accent text-white' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                  aria-pressed={!voiceOverEnabled}
                  aria-label="Disable voice-over"
                  title="Disable voice-over"
                >
                  <span className="text-2xl mb-1">🔇</span>
                  <span className="mt-1 text-sm font-medium">Off</span>
                </button>
              </div>
              <div className="mb-2">
                <label className="block mb-1 font-sm text-navy" htmlFor="voice-lang-select">Language</label>
                <select
                  id="voice-lang-select"
                  value={voiceLang}
                  onChange={e => setVoiceLang(e.target.value)}
                  className="w-full rounded-lg border border-blue-100 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-accent mb-2"
                  aria-label="Select voice language"
                  title="Select voice language"
                >
                  <option value="">All Languages</option>
                  <option value="en">English</option>
                  <option value="vi">Vietnamese</option>
                </select>
              </div>
              {availableVoices.filter(vo=>!voiceLang||vo.lang?.includes(voiceLang)).length > 0 && (
                <div className="mb-2">
                  <label className="block mb-1 font-sm text-navy" htmlFor="voice-select">Voice</label>
                  <select
                    id="voice-select"
                    value={selectedVoice?.voiceURI || ''}
                    onChange={e => {
                      const v = availableVoices.filter(vo=>!voiceLang||vo.lang?.includes(voiceLang)).find(vv => vv.voiceURI === e.target.value);
                      if (v) setSelectedVoice(v);
                    }}
                    disabled={!voiceOverEnabled}
                    className="w-full rounded-lg border border-blue-100 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-accent"
                    aria-label="Select voice"
                    title="Select voice"
                  >
                    {availableVoices.filter(vo=>!voiceLang||vo.lang?.includes(voiceLang)).map(vo => (
                      <option key={vo.voiceURI} value={vo.voiceURI}>{vo.name} {vo.lang ? `(${vo.lang})` : ''}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

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

        {/* Floating Action Buttons Container - for mobile optimized layout */}
        <div className="fixed bottom-20 right-4 z-30 flex flex-row space-x-2 sm:hidden">
          {/* Animation Style Button - for mobile */}
          <button
            onClick={() => setShowAnimationStyleControls(!showAnimationStyleControls)}
            className="rounded-lg bg-white/90 p-2 border border-gray-200 hover:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
            aria-label="Show animation style options"
            aria-pressed={showAnimationStyleControls}
            title="Choose page turn animation style"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
          </button>

          {/* Bookmark Button - for mobile */}
          <button
            onClick={() => setShowBookmarks(!showBookmarks)}
            className={`rounded-lg p-2 border border-gray-200 transition-all focus:ring-2 focus:ring-blue-500 ${
              showBookmarks ? 'bg-blue-500 text-white' : isCurrentPageBookmarked ? 'bg-white/90 text-blue-500 hover:bg-white' : 'bg-white/90 text-black hover:bg-white'
            }`}
            aria-label="Show bookmarks"
            title="Show bookmarks"
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
        </div>

        {/* Animation Style Controls */}
        {showAnimationStyleControls && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none sm:p-0 sm:block sm:inset-auto sm:bottom-28 sm:right-4">
            <div
              className="w-full max-w-sm sm:w-64 rounded-xl bg-white p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-navy">Animation Style</h3>
                <button
                  onClick={() => setShowAnimationStyleControls(false)}
                  className="text-gray-500 hover:text-navy transition-colors rounded-full p-1 hover:bg-gray-100"
                  aria-label="Close animation style panel"
                  title="Close animation style panel"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => changeAnimationStyle('flip')}
                  className={`flex flex-col items-center rounded-lg p-3 ${settings.animationStyle === 'flip' ? 'bg-blue-accent text-white' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                  aria-label="Flip animation"
                  title="Flip animation"
                >
                  <span className="text-2xl mb-1">🔄</span>
                </button>
                <button
                  onClick={() => changeAnimationStyle('slide')}
                  className={`flex flex-col items-center rounded-lg p-3 ${settings.animationStyle === 'slide' ? 'bg-blue-accent text-white' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                  aria-label="Slide animation"
                  title="Slide animation"
                >
                  <span className="text-2xl mb-1">➡️</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bookmarks Panel */}
        {showBookmarks && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:bg-transparent sm:backdrop-blur-none sm:p-0 sm:block sm:inset-auto sm:bottom-16 sm:right-4">
            <div
              className="w-full max-w-sm sm:w-64 rounded-xl bg-white p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-navy">Bookmarks</h3>
                <button
                  onClick={() => setShowBookmarks(false)}
                  className="text-gray-500 hover:text-navy transition-colors rounded-full p-1 hover:bg-gray-100"
                  tabIndex={0}
                  aria-label="Close bookmarks panel"
                  title="Close bookmarks panel"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {settings.bookmarks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <p className="text-gray-500 mb-1">No bookmarks yet</p>
                  <p className="text-sm text-gray-400">Press 'B' or tap the bookmark button to save your spot</p>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  {settings.bookmarks.map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => goToBookmark(pageNum)}
                      className={`mb-2 flex w-full items-center rounded-lg px-3 py-2 text-left hover:bg-slate-light/20 ${
                        pageNum === currentPage ? 'bg-blue-accent/10 font-medium text-blue-accent' : 'text-navy'
                      }`}
                      tabIndex={0}
                      aria-label={`Bookmark page ${pageNum}`}
                      title={`Bookmark page ${pageNum}`}
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

              <div className="mt-3 border-t border-gray-200 pt-3">
                <button
                  onClick={toggleBookmark}
                  className="flex w-full items-center justify-center rounded-lg bg-blue-accent px-3 py-2 text-sm font-medium text-white hover:bg-blue-accent-light transition-colors"
                  tabIndex={0}
                  aria-label="Add or remove bookmark"
                  title="Add or remove bookmark for this page"
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
          </div>
        )}

        {/* Auto-flip Settings Modal */}
        {showAutoFlipSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="mx-4 max-w-md w-full rounded-xl bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-navy">Auto-Flip Settings</h2>
                <button
                  onClick={() => setShowAutoFlipSettings(false)}
                  className="text-gray-500 hover:text-navy transition-colors rounded-full p-1 hover:bg-gray-100"
                  aria-label="Close auto-flip settings"
                  title="Close auto-flip settings"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
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
                    className="mr-3 h-2 flex-1 appearance-none rounded bg-gray-300 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-accent"
                    aria-label="Set auto-flip interval"
                    title="Set auto-flip interval"
                  />
                  <span className="min-w-[3rem] px-2 py-1 text-right font-medium bg-gray-100 rounded-md">{(settings.autoFlipInterval / 1000).toFixed(1)}s</span>
                </div>
              </div>

              <div className="mb-6 flex items-center">
                <input
                  type="checkbox"
                  id="autoFlipEnabled"
                  checked={settings.autoFlip}
                  onChange={() => toggleSetting('autoFlip')}
                  className="h-5 w-5 rounded border-gray-300 text-blue-accent focus:ring-blue-accent"
                  aria-label="Enable auto-flip"
                  title="Enable auto-flip"
                />
                <label htmlFor="autoFlipEnabled" className="ml-2 block text-sm font-medium text-navy">
                  Enable Auto-Flip
                </label>
              </div>

              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAutoFlipSettings(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-navy hover:bg-gray-50 transition-colors"
                  aria-label="Cancel auto-flip settings"
                  title="Cancel auto-flip settings"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowAutoFlipSettings(false);
                  }}
                  className="rounded-lg bg-blue-accent px-4 py-2 text-sm font-medium text-white hover:bg-blue-accent-light transition-colors"
                  aria-label="Apply auto-flip settings"
                  title="Apply auto-flip settings"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bookmark Button - for desktop */}
        <button
          onClick={() => setShowBookmarks(!showBookmarks)}
          className={`fixed bottom-16 right-16 z-20 hidden sm:flex rounded-full p-2 shadow-lg transition-all hover:scale-105 focus:ring-2 focus:ring-blue-200 ${
            showBookmarks ? 'bg-blue-accent text-white' : isCurrentPageBookmarked ? 'bg-white text-blue-accent' : 'bg-white'
          }`}
          tabIndex={0}
          aria-label="Show bookmarks"
          title="Show bookmarks"
          data-tooltip="Show bookmarks"
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

        {/* (No keyboard button visually here. Help modal still available via 'H' keyboard.) */}

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
                aria-label="Close keyboard shortcuts notification"
                title="Close keyboard shortcuts notification"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-navy">Keyboard Shortcuts</h2>
                <button
                  onClick={() => setShowKeyboardHelp(false)}
                  className="text-gray-500 hover:text-navy transition-colors rounded-full p-1 hover:bg-gray-100"
                  aria-label="Close keyboard shortcuts help"
                  title="Close keyboard shortcuts help"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                <p>Use these keyboard shortcuts to navigate through the flipbook more efficiently</p>
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="font-semibold">Navigation</div>
                <div className="text-gray-600">Controls</div>

                <div>Next Page</div>
                <div className="font-mono bg-gray-100 px-2 py-1 rounded text-center">→ (Right Arrow)</div>

                <div>Previous Page</div>
                <div className="font-mono bg-gray-100 px-2 py-1 rounded text-center">← (Left Arrow)</div>

                <div>First Page</div>
                <div className="font-mono bg-gray-100 px-2 py-1 rounded text-center">Home</div>

                <div>Last Page</div>
                <div className="font-mono bg-gray-100 px-2 py-1 rounded text-center">End</div>

                <div>Zoom In</div>
                <div className="font-mono bg-gray-100 px-2 py-1 rounded text-center">+ (Plus)</div>

                <div>Zoom Out</div>
                <div className="font-mono bg-gray-100 px-2 py-1 rounded text-center">- (Minus)</div>

                <div>Reset Zoom</div>
                <div className="font-mono bg-gray-100 px-2 py-1 rounded text-center">0 (Zero)</div>

                <div>Toggle Fullscreen</div>
                <div className="font-mono bg-gray-100 px-2 py-1 rounded text-center">F</div>

                <div>Toggle Thumbnails</div>
                <div className="font-mono bg-gray-100 px-2 py-1 rounded text-center">T</div>

                <div>Toggle Auto-Flip</div>
                <div className="font-mono bg-gray-100 px-2 py-1 rounded text-center">A</div>

                <div>Toggle Bookmark</div>
                <div className="font-mono bg-gray-100 px-2 py-1 rounded text-center">B</div>

                <div>Toggle Sound</div>
                <div className="font-mono bg-gray-100 px-2 py-1 rounded text-center">S</div>

                <div>Show/Hide Help</div>
                <div className="font-mono bg-gray-100 px-2 py-1 rounded text-center">H</div>

                <div>Close/Exit</div>
                <div className="font-mono bg-gray-100 px-2 py-1 rounded text-center">Esc</div>
              </div>
              <div className="mt-5 text-right">
                <button
                  onClick={() => setShowKeyboardHelp(false)}
                  className="rounded-lg bg-blue-accent px-4 py-2 text-white hover:bg-blue-accent-light transition-colors"
                  aria-label="Close keyboard shortcuts help"
                  title="Close keyboard shortcuts help"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mic icon triggers Voice-over panel instead of toggling */}
        <button
          onClick={() => setShowVoicePanel(true)}
          className="fixed left-4 bottom-16 z-50 rounded-full bg-blue-accent p-3 shadow-lg text-white transition-transform hover:scale-105 focus:ring-4 focus:ring-blue-400/40 group"
          tabIndex={0}
          aria-label={voiceOverEnabled ? 'Open Voice-over settings (On)' : 'Open Voice-over settings (Off)'}
          title={voiceOverEnabled ? 'Voice-over: Enabled. Tap to manage' : 'Voice-over: Disabled. Tap to manage'}
          data-tooltip={voiceOverEnabled ? 'Voice-over ON' : 'Voice-over OFF'}
        >
          {voiceOverEnabled ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.5a6.5 6.5 0 01-6.5-6.5V10a.5.5 0 01.5-.5h1V8.5A4.5 4.5 0 0116 8.5v1h1a.5.5 0 01.5.5v2a6.5 6.5 0 01-6.5 6.5zM9 19.5h6m-3 0v1.5" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6a3 3 0 016 0v9M5 16l14-14" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
};

export default FlipbookLayout;
