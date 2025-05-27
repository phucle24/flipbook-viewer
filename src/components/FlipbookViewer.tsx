import type React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { Page, FlipDirection, TouchPosition, AnimationStyle } from '../types';
import { useContrastMode } from '../lib/contrastMode';

interface FlipbookViewerProps {
  pages: Page[];
  currentPage: number;
  isThumbnailView: boolean;
  zoomLevel: number;
  onPageChange: (page: number) => void;
  onUpdateZoom?: (zoomLevel: number) => void;
  soundOn: boolean;
  animationStyle: AnimationStyle;
}

// Helper component for lazy loaded image
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  draggable?: boolean;
  style?: React.CSSProperties;
  hideInContrastMode?: boolean;
}

const LazyImage = ({ src, alt, className = '', onLoad, draggable = false, style = {}, hideInContrastMode = true }: LazyImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const placeholderSrc = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'%3E%3C/svg%3E";
  const { contrastMode } = useContrastMode();

  useEffect(() => {
    const currentImgRef = imgRef.current;

    // Check if the image is already in viewport (or close to it)
    if (currentImgRef && 'IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Start loading the real image
              setImageSrc(src);
              // Stop observing once loaded
              if (observerRef.current && currentImgRef) {
                observerRef.current.unobserve(currentImgRef);
              }
            }
          });
        },
        { rootMargin: '200px 0px' } // Start loading when within 200px
      );

      observerRef.current.observe(currentImgRef);
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      setImageSrc(src);
    }

    return () => {
      if (observerRef.current && currentImgRef) {
        observerRef.current.unobserve(currentImgRef);
      }
    };
  }, [src]);

  const handleLoad = () => {
    setLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setError(true);
    console.error(`Failed to load image: ${src}`);
  };

  if (contrastMode && hideInContrastMode) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white text-center text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="p-4">
          <p className="text-lg font-medium mb-2">Image hidden in contrast mode</p>
          <p className="text-sm">{alt}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <div className="h-12 w-12 rounded-full border-3 border-blue-accent/30 border-t-blue-accent animate-spin"></div>
        </div>
      )}
      <img
        ref={imgRef}
        src={imageSrc || placeholderSrc}
        alt={alt}
        className={className}
        draggable={draggable}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
          ...style
        }}
      />
    </>
  );
};

const FlipbookViewer: React.FC<FlipbookViewerProps> = ({
  pages,
  currentPage,
  isThumbnailView,
  zoomLevel,
  onPageChange,
  onUpdateZoom,
  soundOn,
  animationStyle,
}) => {
  const [flipDirection, setFlipDirection] = useState<FlipDirection | null>(null);
  // Track flipping animation state for visual feedback
  const [isFlipping, setIsFlipping] = useState(false);
  const [prevPage, setPrevPage] = useState(currentPage);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [flipProgress, setFlipProgress] = useState(0);
  const flipAnimationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioRef2 = useRef<HTMLAudioElement | null>(null);
  const audioRef3 = useRef<HTMLAudioElement | null>(null);
  const flipHTML5SoundRef = useRef<HTMLAudioElement | null>(null);
  const { contrastMode } = useContrastMode();

  const audioContextRef = useRef<AudioContext | null>(null);

  // For sound fallback/mute UX
  const [soundError, setSoundError] = useState(false);
  const [showMutedToast, setShowMutedToast] = useState(false);

  // New hooks for responsive design
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  // Effect for handling resize and setting mobile state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Call once on mount to set initial state
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isSinglePageView = (pageNumber: number) => {
    // Always use single page layout on mobile (screen width < 640px)
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    if (isMobile) {
      return true;
    }

    return (
      pageNumber === 1 ||
      pageNumber === pages.length
    );
  };

  const useSinglePageLayout = isSinglePageView(currentPage);

  const getDisplayedPages = () => {
    // Always use single page layout on mobile
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    if (isMobile) {
      return {
        leftPageIndex: -1,
        rightPageIndex: currentPage - 1,
        displayText: `${currentPage}/${pages.length}`
      };
    }

    // First page is single (right page only)
    if (currentPage === 1) {
      return { leftPageIndex: -1, rightPageIndex: 0, displayText: `1/${pages.length}` };
    }
    // Last page is single (right page only)
    else if (currentPage === pages.length) {
      return {
        leftPageIndex: -1,
        rightPageIndex: currentPage - 1,
        displayText: `${currentPage}/${pages.length}`
      };
    }
    // Even pages (odd-indexed) - left is even-1, right is even
    else if (currentPage % 2 === 0) {
      const leftPageIndex = currentPage - 1;
      const rightPageIndex = currentPage < pages.length ? currentPage : -1;

      return {
        leftPageIndex,
        rightPageIndex,
        displayText:
          rightPageIndex >= 0
            ? `${leftPageIndex + 1}-${rightPageIndex + 1}/${pages.length}`
            : `${leftPageIndex + 1}/${pages.length}`,
      };
    }
    // Odd pages except first and last - left is odd-2, right is odd-1
    else {
      const leftPageIndex = currentPage - 2;
      const rightPageIndex = currentPage - 1;

      return {
        leftPageIndex,
        rightPageIndex,
        displayText: `${leftPageIndex + 1}-${rightPageIndex + 1}/${pages.length}`,
      };
    }
  };

  const { leftPageIndex, rightPageIndex, displayText } = getDisplayedPages();

  // Add a loading state for images
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({});

  // Handle image load events
  const handleImageLoad = (pageId: number) => {
    setImagesLoaded(prev => ({
      ...prev,
      [pageId]: true
    }));
  };

  useEffect(() => {
    audioRef.current = new Audio('/sounds/page-flip.mp3');
    audioRef.current.preload = 'auto';

    audioRef2.current = new Audio('/sounds/page-flip-1.mp3');
    audioRef2.current.preload = 'auto';

    audioRef3.current = new Audio('/sounds/page-flip-3.mp3');
    audioRef3.current.preload = 'auto';

    flipHTML5SoundRef.current = new Audio('/sounds/page-flip-0.mp3');
    flipHTML5SoundRef.current.preload = 'auto';

    try {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    } catch (e) {
      // Web Audio API not supported
      audioContextRef.current = null;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioRef2.current) {
        audioRef2.current.pause();
        audioRef2.current = null;
      }
      if (audioRef3.current) {
        audioRef3.current.pause();
        audioRef3.current = null;
      }
      if (flipHTML5SoundRef.current) {
        flipHTML5SoundRef.current.pause();
        flipHTML5SoundRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Enhanced playFlipSound: try WebAudio, fallback to <audio>, show mute icon/toast if fails
  const playFlipSound = useCallback(() => {
    if (!soundOn) return;
    setSoundError(false);

    // Try Web Audio API first
    const playWithWebAudio = async (audioUrl: string) => {
      try {
        if (!audioContextRef.current) throw new Error('No AudioContext');
        const ctx = audioContextRef.current;
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = await ctx.decodeAudioData(arrayBuffer);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        // Resume context if needed (for Safari)
        if (ctx.state === 'suspended') await ctx.resume();
        return true;
      } catch (err) {
        return false;
      }
    };

    // Fallback to HTMLAudioElement
    const playWithAudioTag = (audioEl: HTMLAudioElement | null) => {
      if (!audioEl) return false;
      try {
        audioEl.currentTime = 0;
        audioEl.volume = 0.8;
        audioEl.playbackRate = 1.0;
        audioEl.play().catch(() => {
          setSoundError(true);
          setShowMutedToast(true);
          setTimeout(() => setShowMutedToast(false), 1800);
        });
        return true;
      } catch (e) {
        setSoundError(true);
        setShowMutedToast(true);
        setTimeout(() => setShowMutedToast(false), 1800);
        return false;
      }
    };

    // Try WebAudio, then fallback
    (async () => {
      let ok = false;
      if (flipHTML5SoundRef.current?.src) {
        ok = await playWithWebAudio(flipHTML5SoundRef.current.src);
      }
      if (!ok) {
        // fallback to <audio>
        if (!playWithAudioTag(flipHTML5SoundRef.current)) {
          setSoundError(true);
          setShowMutedToast(true);
          setTimeout(() => setShowMutedToast(false), 1800);
        }
      }
    })();
  }, [soundOn]);

  const [touchStart, setTouchStart] = useState<TouchPosition | null>(null);
  const [touchEnd, setTouchEnd] = useState<TouchPosition | null>(null);
  const [pinchStart, setPinchStart] = useState<number | null>(null);
  const [showSwipeIndicator, setShowSwipeIndicator] = useState<FlipDirection | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);
  const [canDrag, setCanDrag] = useState(true);

  const MIN_SWIPE_DISTANCE = 50;
  const MAX_SWIPE_TIME = 500;

  useEffect(() => {
    const flipbookElement = document.getElementById('flipbook-viewer');
    if (flipbookElement) {
      (flipbookElement as any).playFlipSound = playFlipSound;
    }
  }, [playFlipSound]);

  // Modify animatePageFlip for smoother transitions
  const animatePageFlip = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
      playFlipSound();
    }

    const elapsed = timestamp - startTimeRef.current;
    // Adjust duration for a smoother flip on mobile
    const duration = isMobile ? 450 : 550;
    const progress = Math.min(elapsed / duration, 1);

    let easedProgress;
    const t = progress;
    // Enhanced easing function for smoother animation
    easedProgress = t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;

    setFlipProgress(easedProgress * 100);

    if (progress < 1) {
      flipAnimationRef.current = requestAnimationFrame(animatePageFlip);
    } else {
      setIsFlipping(false);
      setFlipDirection(null);
      setFlipProgress(0);
      startTimeRef.current = null;
      setIsDragging(false);
      setDragX(0);
      setCanDrag(true);
    }
  };

  useEffect(() => {
    if (currentPage !== prevPage) {
      const direction = currentPage > prevPage ? 'forward' : 'backward';
      setFlipDirection(direction);
      setIsFlipping(true);
      startTimeRef.current = null;
      flipAnimationRef.current = requestAnimationFrame(animatePageFlip);
      setPrevPage(currentPage);
      setPosition({ x: 0, y: 0 });

      return () => {
        if (flipAnimationRef.current) {
          cancelAnimationFrame(flipAnimationRef.current);
        }
      };
    }
  }, [currentPage, prevPage]);

  useEffect(() => {
    setPosition({ x: 0, y: 0 });
  }, [zoomLevel]);

  if (isThumbnailView) {
    return (
      <div className="grid max-h-[calc(100vh-100px)] max-w-4xl grid-cols-2 gap-4 overflow-y-auto p-8 sm:grid-cols-3 md:grid-cols-4">
        {pages.map((page) => (
          <div
            key={page.id}
            className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 shadow-lg transition-all hover:scale-105 ${
              page.id === currentPage ? 'border-blue-accent ring-2 ring-blue-accent/30' : 'border-transparent'
            }`}
            onClick={() => onPageChange(page.id)}
            role="button"
            aria-label={`Go to page ${page.id}`}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onPageChange(page.id);
                e.preventDefault();
              }
            }}
          >
            <div className="relative aspect-[4/3] w-full">
              {contrastMode ? (
                <div className="flex h-full w-full items-center justify-center bg-white text-center text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="p-2">
                    <p className="text-sm font-medium">Page {page.id}</p>
                    {page.textContent && <p className="text-xs truncate">{page.textContent}</p>}
                  </div>
                </div>
              ) : (
                <LazyImage
                  src={page.imageUrl || 'https://ext.same-assets.com/3585540836/3463851396.webp'}
                  alt={`Page ${page.id}`}
                  className="h-full w-full object-cover"
                  onLoad={() => handleImageLoad(page.id)}
                />
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-navy/75 p-1 text-center text-xs text-white">
              Page {page.id}
            </div>
            <div className="absolute left-0 top-0 h-full w-full bg-black opacity-0 transition-opacity group-hover:opacity-20" />
          </div>
        ))}
      </div>
    );
  }

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isFlipping || !canDrag) return;

    const clientX =
      'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;

    setIsDragging(true);
    setDragStartX(clientX);
    setDragX(0);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || isFlipping) return;

    const clientX =
      'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;

    const newDragX = clientX - dragStartX;
    setDragX(newDragX);

    const dragDirection = newDragX > 0 ? 'backward' : 'forward';
    setFlipDirection(dragDirection);

    const dragProgress = Math.min(Math.abs(newDragX) / 300, 0.4) * 100;
    setFlipProgress(dragProgress);
  };

  const handleDragEnd = () => {
    if (!isDragging || isFlipping) return;

    if (Math.abs(dragX) > 100) {
      setCanDrag(false);

      if (dragX > 0 && currentPage > 1) {
        onPageChange(currentPage - 1);
      } else if (dragX < 0 && currentPage < pages.length) {
        onPageChange(currentPage + 1);
      } else {
        setIsDragging(false);
        setDragX(0);
        setFlipProgress(0);
        setFlipDirection(null);
      }
    } else {
      setIsDragging(false);
      setDragX(0);
      setFlipProgress(0);
      setFlipDirection(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      handleDragStart(e);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (zoomLevel > 1 && dragStart) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      setPosition({
        x: position.x + dx,
        y: position.y + dy,
      });

      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      handleDragMove(e);
    }
  };

  const handleMouseUp = () => {
    if (zoomLevel > 1) {
      setDragStart(null);
    } else {
      handleDragEnd();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    });

    handleDragStart(e);

    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setPinchStart(distance);
    } else {
      setPinchStart(null);
    }

    setTouchEnd(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e);

    if (e.touches.length === 2 && pinchStart !== null && onUpdateZoom) {
      e.preventDefault();

      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      const ratio = currentDistance / pinchStart;
      const newZoom = Math.max(0.5, Math.min(1.7, zoomLevel * ratio));

      onUpdateZoom(newZoom);

      setPinchStart(currentDistance);
      return;
    }

    if (e.touches.length === 1 && zoomLevel > 1 && touchStart) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStart.startX;
      const deltaY = touch.clientY - touchStart.startY;

      setPosition({
        x: position.x + deltaX,
        y: position.y + deltaY,
      });

      setTouchStart({
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: touchStart.startTime,
      });
    }

    if (e.touches.length === 1 && touchStart && zoomLevel <= 1) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStart.startX;

      if (Math.abs(deltaX) > 20) {
        setShowSwipeIndicator(deltaX > 0 ? 'backward' : 'forward');
      } else {
        setShowSwipeIndicator(null);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    handleDragEnd();

    if (!touchStart) return;

    setShowSwipeIndicator(null);

    if (pinchStart !== null) {
      setPinchStart(null);
      return;
    }

    if (zoomLevel > 1) {
      setTouchStart(null);
      return;
    }

    const touch = e.changedTouches[e.changedTouches.length - 1];

    setTouchEnd({
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    });

    const deltaX = touch.clientX - touchStart.startX;
    const deltaY = touch.clientY - touchStart.startY;
    const elapsedTime = Date.now() - touchStart.startTime;

    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);

    if (
      isHorizontalSwipe &&
      Math.abs(deltaX) > MIN_SWIPE_DISTANCE &&
      elapsedTime < MAX_SWIPE_TIME
    ) {
      if (deltaX > 0) {
        if (currentPage > 1) {
          onPageChange(currentPage - 1);
        }
      } else {
        if (currentPage < pages.length) {
          onPageChange(currentPage + 1);
        }
      }
    }

    setTouchStart(null);
  };

  const renderPageContent = (pageIndex: number) => {
    if (pageIndex < 0 || !pages[pageIndex]) return null;

    const page = pages[pageIndex];

    if (contrastMode) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-white p-8 text-gray-800">
          <h2 className="mb-4 text-xl font-bold">Page {pageIndex + 1}</h2>
          {page.textContent ? (
            <div className="max-h-full overflow-y-auto text-center">
              <p>{page.textContent}</p>
            </div>
          ) : (
            <p className="text-gray-500">No text content available for this page</p>
          )}
        </div>
      );
    }

    return (
      <LazyImage
        src={page.imageUrl || 'https://ext.same-assets.com/3585540836/3463851396.webp'}
        alt={`Page ${pageIndex + 1}`}
        className="w-full h-full object-cover"
        draggable={false}
        onLoad={() => handleImageLoad(pageIndex)}
      />
    );
  };

  return (
    <div
      id="flipbook-viewer"
      className="relative flex items-center justify-center overflow-hidden py-2"
      style={{
        transform: `scale(${zoomLevel})`,
        transition: 'transform 0.3s ease',
        transformOrigin: 'center center',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main flipbook element */}
      <div
        className={`h-[500px] sm:h-[450px] md:h-[500px] w-[350px] sm:w-[650px] md:w-[750px] perspective-element bg-white ${
          useSinglePageLayout ? 'rounded-xl' : 'rounded-2xl'
        } drop-shadow-2xl select-none ${
          isFlipping ? 'animate-flip-shadow' : ''
        } ${useSinglePageLayout ? 'single-page-layout' : 'double-page-layout'}`}
        style={{
          transform: zoomLevel > 1 ? `translate(${position.x}px, ${position.y}px)` : 'none',
          transformOrigin: 'center center',
          cursor:
            zoomLevel > 1
              ? dragStart
                ? 'grabbing'
                : 'grab'
              : canDrag
              ? 'default'
              : 'wait',
          perspective: '2000px',
          boxShadow:
            '0 8px 40px 0 rgba(162,213,242,0.24),0 2px 10px 0 rgba(243,184,255,0.18)',
          borderRadius: '32px',
          zIndex: 5,
          transition: isFlipping ? 'box-shadow 0.3s ease' : 'box-shadow 0.25s, transform 0.3s ease',
        }}
      >
        {/* LEFT PAGE (previous half) */}
        {leftPageIndex >= 0 && !useSinglePageLayout && (
          <div
            className="absolute top-0 left-0 w-1/2 h-full"
            style={{ zIndex: 4 }}
          >
            {/* PAGE FRONT (left) */}
            <div
              className="absolute w-full h-full page-content shadow-page rounded-l-2xl overflow-hidden"
              style={{
                backfaceVisibility: 'hidden',
                transformOrigin: '100% 50%',
                transform:
                  isFlipping || isDragging
                    ? `perspective(2000px) rotateY(${
                        flipDirection === 'backward'
                          ? -180 * (flipProgress / 100)
                          : '0'
                      }deg)`
                    : 'none',
                boxShadow:
                  isFlipping || isDragging
                    ? flipProgress > 40
                      ? '0 8px 48px 8px #0004'
                      : 'none'
                    : 'none',
                transition: isFlipping || isDragging ? 'none' : 'box-shadow 0.25s',
              }}
            >
              {renderPageContent(leftPageIndex)}
              {/* Shadow gradient appears near 90° */}
              {(isFlipping || isDragging) && (
                <div
                  style={{
                    pointerEvents: 'none',
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(to left, rgba(0,0,0,${
                      Math.abs(Math.sin((Math.PI * flipProgress) / 100)) * 0.26
                    }), rgba(0,0,0,0))`,
                    opacity: flipDirection === 'backward' ? 1 : 0.23,
                  }}
                />
              )}
            </div>

            {/* PAGE BACK (left) */}
            <div
              className="absolute w-full h-full page-content"
              style={{
                backfaceVisibility: 'hidden',
                transformOrigin: '100% 50%',
                transform:
                  isFlipping || isDragging
                    ? `perspective(2000px) rotateY(${
                        flipDirection === 'backward'
                          ? -180 * (flipProgress / 100) + 180
                          : 180
                      }deg)`
                    : 'perspective(2000px) rotateY(180deg)',
                zIndex: 2,
                transition: isFlipping || isDragging ? 'none' : 'box-shadow 0.18s',
              }}
            >
              {rightPageIndex >= 0 && renderPageContent(rightPageIndex)}
              {(isFlipping || isDragging) && (
                <div
                  style={{
                    pointerEvents: 'none',
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(to right, rgba(0,0,0,${
                      Math.abs(Math.sin((Math.PI * flipProgress) / 100)) * 0.28
                    }), rgba(0,0,0,0))`,
                    opacity: flipDirection === 'backward' ? 1 : 0.13,
                  }}
                />
              )}
            </div>
          </div>
        )}
        {/* RIGHT PAGE (current half) */}
        {rightPageIndex >= 0 && (
          <div
            className={`absolute top-0 ${useSinglePageLayout ? 'left-0 w-full' : 'right-0 w-1/2'} h-full`}
            style={{ zIndex: 4, width: useSinglePageLayout ? '100%' : '50%' }}
          >
            {/* PAGE FRONT (right) */}
            <div
              className={`absolute w-full h-full page-content shadow-page ${useSinglePageLayout ? 'rounded-none single-page' : 'rounded-r-2xl'} overflow-hidden`}
              style={{
                backfaceVisibility: 'hidden',
                transformOrigin: '0% 50%',
                transform:
                  isFlipping || isDragging
                    ? `perspective(2000px) rotateY(${
                        flipDirection === 'forward'
                          ? -180 * (flipProgress / 100)
                          : 0
                      }deg)`
                    : 'none',
                boxShadow:
                  isFlipping || isDragging
                    ? flipProgress > 40
                      ? '0 8px 48px 8px #0003'
                      : 'none'
                    : 'none',
                transition: isFlipping || isDragging ? 'none' : 'box-shadow 0.25s',
              }}
            >
              {renderPageContent(rightPageIndex)}
              {(isFlipping || isDragging) && (
                <div
                  style={{
                    pointerEvents: 'none',
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(to right, rgba(0,0,0,${
                      Math.abs(Math.sin((Math.PI * flipProgress) / 100)) * 0.28
                    }), rgba(0,0,0,0))`,
                    opacity: flipDirection === 'forward' ? 1 : 0.23,
                  }}
                />
              )}
            </div>
            {/* PAGE BACK (right) */}
            <div
              className="absolute w-full h-full page-content"
              style={{
                backfaceVisibility: 'hidden',
                transformOrigin: '0% 50%',
                transform:
                  isFlipping || isDragging
                    ? `perspective(2000px) rotateY(${
                        flipDirection === 'forward'
                          ? -180 * (flipProgress / 100) + 180
                          : 180
                      }deg)`
                    : 'perspective(2000px) rotateY(180deg)',
                zIndex: 2,
                transition: isFlipping || isDragging ? 'none' : 'box-shadow 0.18s',
              }}
            >
              {leftPageIndex >= 0 && renderPageContent(leftPageIndex)}
              {(isFlipping || isDragging) && (
                <div
                  style={{
                    pointerEvents: 'none',
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(to left, rgba(0,0,0,${
                      Math.abs(Math.sin((Math.PI * flipProgress) / 100)) * 0.28
                    }), rgba(0,0,0,0))`,
                    opacity: flipDirection === 'forward' ? 1 : 0.13,
                  }}
                />
              )}
            </div>
          </div>
        )}
        {/* PAGE NUMBER & INDICATOR */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-navy/80 px-4 py-1.5 text-sm font-medium text-white shadow-lg z-50 backdrop-blur-sm"
          style={{
            transform: `translateX(-50%) ${isFlipping ? 'scale(0.95)' : 'scale(1)'}`,
            transition: 'transform 0.2s ease',
          }}
        >
          {displayText}
        </div>

        {/* Contrast mode indicator */}
        {contrastMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-accent/85 px-4 py-1.5 text-sm font-medium text-white shadow-lg z-50 backdrop-blur-sm">
            Contrast Mode Active
          </div>
        )}

        {/* Swipe indicator - shows when user is swiping on mobile */}
        {showSwipeIndicator && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 ${showSwipeIndicator === 'forward' ? 'right-8' : 'left-8'} text-white z-50 transition-opacity`}
            style={{
              opacity: 0.8,
              animation: 'pulse 1.5s infinite'
            }}
          >
            <div className="bg-blue-accent/70 backdrop-blur-sm rounded-full p-3 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={showSwipeIndicator === 'forward' ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
                />
              </svg>
            </div>
          </div>
        )}

        {/* Show loading toast when audio fails to play */}
        {showMutedToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-navy/90 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm shadow-lg z-50 animate-fadeIn">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
              Sound disabled by browser
            </div>
          </div>
        )}
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: translateY(-50%) scale(1); }
          50% { transform: translateY(-50%) scale(1.1); }
          100% { transform: translateY(-50%) scale(1); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-flip-shadow {
          animation: flipShadow 0.5s ease-in-out;
        }

        @keyframes flipShadow {
          0% { box-shadow: 0 8px 30px 0 rgba(162,213,242,0.24); }
          50% { box-shadow: 0 12px 50px 0 rgba(162,213,242,0.35); }
          100% { box-shadow: 0 8px 30px 0 rgba(162,213,242,0.24); }
        }

        .single-page-layout {
          display: flex;
          align-items: center;
        }

        .single-page-layout .page-content.single-page {
          width: 100% !important;
          max-width: 100%;
          margin: 0;
          border-radius: 8px !important;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12) !important;
          left: 0 !important;
          transform: none !important;
          background-color: white;
        }

        .single-page img {
          border-radius: 8px !important;
        }
          max-width: 450px;
          margin: 0 auto;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default FlipbookViewer;
