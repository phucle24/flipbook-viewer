import type React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { Page, FlipDirection, TouchPosition, AnimationStyle } from '../types';

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

  const audioContextRef = useRef<AudioContext | null>(null);

  const isSinglePageView = (pageNumber: number) => {
    return pageNumber === 1 || pageNumber === pages.length || (pages.length % 2 === 0 && pageNumber === pages.length);
  };

  const useSinglePageLayout = isSinglePageView(currentPage);

  const getDisplayedPages = () => {
    if (currentPage === 1) {
      return { leftPageIndex: -1, rightPageIndex: 0, displayText: `1/${pages.length}` };
    } else if (currentPage % 2 === 0) {
      const leftPageIndex = currentPage - 1;
      const rightPageIndex = currentPage < pages.length ? currentPage : -1;

      if (currentPage === pages.length && pages.length % 2 === 1) {
        return { leftPageIndex: -1, rightPageIndex: leftPageIndex, displayText: `${currentPage}/${pages.length}` };
      }

      return {
        leftPageIndex,
        rightPageIndex,
        displayText: rightPageIndex >= 0 ?
          `${leftPageIndex + 1}-${rightPageIndex + 1}/${pages.length}` :
          `${leftPageIndex + 1}/${pages.length}`
      };
    } else {
      const leftPageIndex = currentPage - 2;
      const rightPageIndex = currentPage - 1;

      return {
        leftPageIndex,
        rightPageIndex,
        displayText: `${leftPageIndex + 1}-${rightPageIndex + 1}/${pages.length}`
      };
    }
  };

  const { leftPageIndex, rightPageIndex, displayText } = getDisplayedPages();

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
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error('Web Audio API not supported:', e);
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

  const playFlipSound = useCallback(() => {
    if (!soundOn) return;
    const soundToPlay = flipHTML5SoundRef.current;
    if (soundToPlay) {
      soundToPlay.currentTime = 0;
      soundToPlay.volume = 0.8;
      soundToPlay.playbackRate = 1.0;
      soundToPlay.play().catch(err => console.error('Error playing sound:', err));
    }
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

  const animatePageFlip = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
      playFlipSound();
    }

    const elapsed = timestamp - startTimeRef.current;
    const duration = 550;
    const progress = Math.min(elapsed / duration, 1);

    let easedProgress;
    const t = progress;
    easedProgress = 3 * (1 - t) * Math.pow(t, 2) * 0.68 + Math.pow(t, 3) * 0.94;

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
            className={`group relative cursor-pointer overflow-hidden rounded-md border-2 shadow-lg transition-all hover:scale-105 ${
              page.id === currentPage ? 'border-blue-accent' : 'border-transparent'
            }`}
            onClick={() => onPageChange(page.id)}
          >
            <img
              src={page.imageUrl || 'https://ext.same-assets.com/3585540836/3463851396.webp'}
              alt={`Page ${page.id}`}
              className="aspect-[4/3] w-full object-cover"
            />
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

    const clientX = 'touches' in e
      ? e.touches[0].clientX
      : (e as React.MouseEvent).clientX;

    setIsDragging(true);
    setDragStartX(clientX);
    setDragX(0);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || isFlipping) return;

    const clientX = 'touches' in e
      ? e.touches[0].clientX
      : (e as React.MouseEvent).clientX;

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
      const newZoom = Math.max(0.5, Math.min(2, zoomLevel * ratio));

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

    if (isHorizontalSwipe && Math.abs(deltaX) > MIN_SWIPE_DISTANCE && elapsedTime < MAX_SWIPE_TIME) {
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

  const getFlipStyles = () => {
    if (!flipDirection) return {};

    const perspective = 2000;

    const rotateY = flipDirection === 'forward'
      ? -180 * (flipProgress / 100)
      : 180 * (1 - flipProgress / 100);

    const transformOrigin = flipDirection === 'forward' ? 'left center' : 'right center';
    const zIndex = 10;

    const shadowIntensity = Math.sin(Math.PI * flipProgress / 100) * 0.5;

    return {
      transform: `perspective(${perspective}px) rotateY(${rotateY}deg)`,
      transformOrigin,
      zIndex,
      boxShadow: `0 0 20px rgba(0,0,0,${shadowIntensity})`,
      transition: 'none',
    };
  };

  const getGradientStyle = () => {
    if (!flipDirection) return { opacity: 0 };

    const direction = flipDirection === 'forward' ? 'to left' : 'to right';
    const progress = flipProgress / 100;

    const intensity = Math.sin(Math.PI * progress) * 0.25;

    return {
      background: `linear-gradient(${direction},
        rgba(0,0,0,0) 0%,
        rgba(0,0,0,${intensity * 0.15}) 30%,
        rgba(0,0,0,${intensity}) 100%)`,
      opacity: intensity,
      pointerEvents: 'none',
    };
  };

  const getPageShadowStyle = () => {
    if (!flipDirection) return { opacity: 0 };

    const progress = flipProgress / 100;

    const opacity = Math.sin(Math.PI * progress) * 0.2;

    return {
      opacity,
      boxShadow: 'inset 0 0 5px rgba(0,0,0,0.15)',
      pointerEvents: 'none',
    };
  };

  return (
    <div
      id="flipbook-viewer"
      className="relative flex items-center justify-center overflow-hidden"
      style={{
        transform: `scale(${zoomLevel})`,
        transition: 'transform 0.3s ease'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={`relative h-[600px] w-[900px] perspective-element ${isFlipping || isDragging ? 'pointer-events-none' : ''} ${showSwipeIndicator ? 'swipe-active' : ''}`}
        style={{
          transform: zoomLevel > 1 ? `translate(${position.x}px, ${position.y}px)` : 'none',
          cursor: zoomLevel > 1 ? (dragStart ? 'grabbing' : 'grab') : (canDrag ? 'default' : 'wait'),
          perspective: '2000px',
        }}
      >
        <div className="relative flex h-full w-full rounded-sm shadow-2xl bg-white">
          <div
            className="absolute inset-0 pointer-events-none bg-gradient-to-b from-gray-50 to-gray-100"
            style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)' }}
          />

          {!useSinglePageLayout && (
            <div className="flex-1 overflow-hidden bg-page p-0">
              <div className="relative h-full w-full">
                <img
                  src={leftPageIndex >= 0 ? (pages[leftPageIndex]?.imageUrl || 'https://ext.same-assets.com/3585540836/3463851396.webp') : 'https://ext.same-assets.com/3585540836/3463851396.webp'}
                  alt={`Page ${leftPageIndex + 1}`}
                  className="h-full w-full object-cover"
                  draggable="false"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              </div>
            </div>
          )}

          {!useSinglePageLayout && (
            <div className="w-[1px] bg-gradient-to-t from-gray-300 via-gray-200 to-gray-300" >
              <div className="h-full w-full opacity-20"
                   style={{
                      boxShadow: 'inset 0 0 3px rgba(0,0,0,0.3)'
                   }}
              />
            </div>
          )}

          <div className={useSinglePageLayout ? "flex-1 overflow-hidden bg-page p-0 max-w-[450px] mx-auto" : "flex-1 overflow-hidden bg-page p-0"}>
            <div className="relative h-full w-full">
              <img
                src={rightPageIndex >= 0 ? (pages[rightPageIndex]?.imageUrl || 'https://ext.same-assets.com/3585540836/3463851396.webp') : 'https://ext.same-assets.com/3585540836/3463851396.webp'}
                alt={`Page ${rightPageIndex + 1}`}
                className="h-full w-full object-cover"
                draggable="false"
              />
            </div>
          </div>

          {(isFlipping || isDragging) && flipDirection && (
            <>
              <div
                className="absolute h-full w-1/2 overflow-hidden bg-page p-0 backface-hidden"
                style={{
                  ...getFlipStyles(),
                  left: flipDirection === 'forward' ? (useSinglePageLayout ? '0' : '50%') : '0',
                  right: flipDirection === 'forward' ? '0' : (useSinglePageLayout ? '0' : '50%'),
                  width: useSinglePageLayout ? '100%' : '50%',
                }}
              >
                <div className="page-content h-full w-full">
                  <img
                    src={
                      flipDirection === 'forward'
                        ? (leftPageIndex >= 0 ? (pages[leftPageIndex]?.imageUrl || 'https://ext.same-assets.com/3585540836/3463851396.webp') : 'https://ext.same-assets.com/3585540836/3463851396.webp')
                        : (rightPageIndex >= 0 ? (pages[rightPageIndex]?.imageUrl || 'https://ext.same-assets.com/3585540836/3463851396.webp') : 'https://ext.same-assets.com/3585540836/3463851396.webp')
                    }
                    alt="Flipping page"
                    className="h-full w-full object-cover"
                    draggable="false"
                  />
                </div>
                <div
                  className="absolute inset-0 shadow-inner"
                  style={getGradientStyle()}
                />
              </div>

              <div
                className="absolute h-full w-1/2 overflow-hidden bg-page p-0 backface-hidden"
                style={{
                  ...getFlipStyles(),
                  transform: `${getFlipStyles().transform?.toString().replace('perspective', '').trim() || ''} rotateY(180deg)`,
                  left: flipDirection === 'forward' ? (useSinglePageLayout ? '0' : '50%') : '0',
                  right: flipDirection === 'forward' ? '0' : (useSinglePageLayout ? '0' : '50%'),
                  width: useSinglePageLayout ? '100%' : '50%',
                  background: '#fafafa',
                }}
              >
                <div className="h-full w-full bg-white">
                  <img
                    src={
                      flipDirection === 'forward'
                        ? (rightPageIndex >= 0 ? (pages[rightPageIndex]?.imageUrl || 'https://ext.same-assets.com/3585540836/3463851396.webp') : 'https://ext.same-assets.com/3585540836/3463851396.webp')
                        : (leftPageIndex >= 0 ? (pages[leftPageIndex]?.imageUrl || 'https://ext.same-assets.com/3585540836/3463851396.webp') : 'https://ext.same-assets.com/3585540836/3463851396.webp')
                    }
                    alt="Back of flipping page"
                    className="h-full w-full object-cover opacity-100"
                    draggable="false"
                  />
                </div>
                <div
                  className="absolute inset-0"
                  style={getPageShadowStyle()}
                />
              </div>
            </>
          )}

          {(isFlipping || isDragging) && flipDirection && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)',
                opacity: flipProgress / 100,
              }}
            />
          )}

          <div className="swipe-indicator swipe-indicator-left">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="white">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <div className="swipe-indicator swipe-indicator-right">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="white">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-navy/80 px-4 py-1 text-xs font-medium text-white shadow-sm">
          Flip Effect
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-navy/80 px-4 py-1 text-sm font-medium text-white shadow-sm z-50">
          {displayText}
        </div>
      </div>
    </div>
  );
};

export default FlipbookViewer;
