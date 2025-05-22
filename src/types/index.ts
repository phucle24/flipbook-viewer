export interface Page {
  id: number;
  imageUrl?: string;
  content?: string;
  textContent?: string; // For search functionality
}

export interface FlipbookSettings {
  autoFlip: boolean;
  autoFlipInterval: number; // Time in ms between auto-flips
  soundOn: boolean;
  showThumbnails: boolean;
  zoomLevel: number;
  bookmarks: number[]; // Array of page numbers that are bookmarked
  searchQuery: string;
  searchResults: number[]; // Array of page numbers containing search matches
  currentSearchIndex: number; // Index in searchResults array
  animationStyle: AnimationStyle; // Animation style
}

export interface Theme {
  id: number;
  name: string;
  backgroundColor: string;
  textColor: string;
}

export type FlipDirection = 'forward' | 'backward';

// Animation style type
export type AnimationStyle = 'flip' | 'curl' | 'fold' | 'slide';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface TouchPosition {
  startX: number;
  startY: number;
  startTime: number;
}

// Story interface for homepage
export interface Story {
  id: number;
  title: string;
  author: string;
  coverImage: string;
  description: string;
  category: string;
  tags: string[];
  likes: number;
  views: number;
  pages: Page[];
}

// Sample text content for pages to enable search functionality
export const SAMPLE_PAGE_CONTENT = [
  "Once upon a time in a magical forest, there lived a curious little fox with a heart full of adventure.",
  "Every morning, the fox would venture out to explore new corners of the forest, making friends with all the woodland creatures.",
  "One cloudy day, the fox discovered an ancient oak tree with a mysterious door hidden among its roots.",
  "Behind the door was a staircase that spiraled deep into the earth, leading to an underground library of forgotten stories.",
  "The library was tended by a wise old owl who had collected tales from all across the world for thousands of years.",
  "The owl offered to share these stories with the fox, on one condition - that the fox would one day share them with others.",
  "And so, the fox began the journey of learning all the stories, preparing to share them with the world beyond the forest."
];
