import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Story } from '../types';
import { SAMPLE_PAGE_CONTENT } from '../types';

// Initial sample story data
const initialStories: Story[] = [
  {
    id: 1,
    title: "The Fox's Journey",
    author: "Emma Thompson",
    coverImage: "https://images.unsplash.com/photo-1522050212171-61b01dd24579?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    description: "A curious fox discovers an ancient library with stories from around the world.",
    category: "Fantasy",
    tags: ["adventure", "animals", "magic", "wisdom"],
    likes: 253,
    views: 1254,
    pages: [
      { id: 1, imageUrl: "https://images.unsplash.com/photo-1522050212171-61b01dd24579?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80", textContent: SAMPLE_PAGE_CONTENT[0] },
      { id: 2, imageUrl: "https://images.unsplash.com/photo-1557166984-b00917c0f5f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80", textContent: SAMPLE_PAGE_CONTENT[1] },
      { id: 3, imageUrl: "https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80", textContent: SAMPLE_PAGE_CONTENT[2] },
      { id: 4, imageUrl: "https://images.unsplash.com/photo-1564679318027-c690d57f0ad9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80", textContent: SAMPLE_PAGE_CONTENT[3] },
    ]
  },
  {
    id: 2,
    title: "Ocean's Whispers",
    author: "Liam Johnson",
    coverImage: "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    description: "A deep-sea diver discovers the hidden voices of the ocean and its ancient secrets.",
    category: "Adventure",
    tags: ["ocean", "mystery", "discovery"],
    likes: 189,
    views: 846,
    pages: [
      { id: 1, imageUrl: "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80", textContent: "Cover page - Ocean's Whispers" },
      { id: 2, imageUrl: "https://images.unsplash.com/photo-1551405780-74811f961ba3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80", textContent: "The boat rocked gently on the waves as the sun rose over the horizon." },
      { id: 3, imageUrl: "https://images.unsplash.com/photo-1504716325983-cb91edab7e7d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80", textContent: "Diving deep into the blue, he found a world untouched by human hands." },
    ]
  },
  {
    id: 3,
    title: "The Last Tree",
    author: "Sophia Chen",
    coverImage: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    description: "In a world where trees have become extinct, a young girl discovers the last surviving tree and fights to protect it.",
    category: "Dystopian",
    tags: ["environment", "hope", "future", "nature"],
    likes: 315,
    views: 1874,
    pages: [
      { id: 1, imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80", textContent: "Cover page - The Last Tree" },
      { id: 2, imageUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80", textContent: "The city stretched as far as the eye could see, a landscape of concrete and metal." },
      { id: 3, imageUrl: "https://images.unsplash.com/photo-1455218873509-8097305ee378?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80", textContent: "In the forgotten corner of the old district, Lily found it—a single tree, small but alive." },
    ]
  }
];

// Get stories from the initial sample data or from storage
const getInitialStories = async (): Promise<Story[]> => {
  // In a real app, this would be an API call
  return new Promise<Story[]>((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      const stories = localStorage.getItem('story-store');
      const parsedStories = stories ? JSON.parse(stories).state.stories : [];
      // If there are no stories in storage, return sample data
      resolve(parsedStories.length > 0 ? parsedStories : initialStories);
    }, 500);
  });
};

// User types and interfaces
interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  loginError: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

// Auth store for user authentication
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isAuthLoading: false,
      loginError: null,
      login: async (username: string, password: string) => {
        set({ isAuthLoading: true, loginError: null });

        try {
          // Simulating API call with a cleaner implementation
          await new Promise((resolve) => setTimeout(resolve, 800));

          // Mock credentials check with proper error handling
          if (username.trim().toLowerCase() === 'user' && password === 'password') {
            set({
              user: {
                id: '1',
                username: 'user',
                isAdmin: false,
                avatarUrl: '/images/user-avatar.png'
              },
              isAuthenticated: true,
              isAuthLoading: false,
              loginError: null
            });
          } else if (username.trim().toLowerCase() === 'admin' && password === 'admin123') {
            set({
              user: {
                id: '2',
                username: 'admin',
                isAdmin: true,
                avatarUrl: '/images/admin-avatar.png'
              },
              isAuthenticated: true,
              isAuthLoading: false,
              loginError: null
            });
          } else {
            set({
              loginError: 'Invalid username or password',
              isAuthLoading: false,
              isAuthenticated: false,
              user: null
            });
          }
        } catch (error) {
          console.error('Login error:', error);
          set({
            loginError: 'An error occurred during login. Please try again.',
            isAuthLoading: false,
            isAuthenticated: false,
            user: null
          });
        }
      },
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          loginError: null
        });
      }
    }),
    {
      name: 'auth-store'
    }
  )
);

// Story state and interfaces
interface StoryState {
  stories: Story[];
  isLoading: boolean;
  error: string | null;
  fetchStories: () => Promise<void>;
  addStory: (story: Omit<Story, 'id'>) => Promise<void>;
  updateStory: (id: number, updatedStory: Partial<Story>) => Promise<void>;
  deleteStory: (id: number) => Promise<void>;
  getStoryById: (id: number) => Story | undefined;
}

// Story store for managing stories
export const useStoryStore = create<StoryState>()(
  persist(
    (set, get) => ({
      stories: [],
      isLoading: false,
      error: null,
      fetchStories: async () => {
        set({ isLoading: true });
        try {
          const stories = await getInitialStories();
          set({ stories, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to fetch stories', isLoading: false });
        }
      },
      addStory: async (storyData) => {
        set({ isLoading: true });
        try {
          // Generate new ID (in a real app, this would be handled by the backend)
          const newId = Math.max(0, ...get().stories.map(s => s.id)) + 1;
          const newStory = { ...storyData, id: newId } as Story;

          // In a real app, this would be an API call
          await new Promise(resolve => setTimeout(resolve, 500));

          set(state => ({
            stories: [...state.stories, newStory],
            isLoading: false
          }));
        } catch (error) {
          set({ error: 'Failed to add story', isLoading: false });
        }
      },
      updateStory: async (id, updatedStory) => {
        set({ isLoading: true });
        try {
          // In a real app, this would be an API call
          await new Promise(resolve => setTimeout(resolve, 500));

          set(state => ({
            stories: state.stories.map(story =>
              story.id === id ? { ...story, ...updatedStory } : story
            ),
            isLoading: false
          }));
        } catch (error) {
          set({ error: 'Failed to update story', isLoading: false });
        }
      },
      deleteStory: async (id) => {
        set({ isLoading: true });
        try {
          // In a real app, this would be an API call
          await new Promise(resolve => setTimeout(resolve, 500));

          set(state => ({
            stories: state.stories.filter(story => story.id !== id),
            isLoading: false
          }));
        } catch (error) {
          set({ error: 'Failed to delete story', isLoading: false });
        }
      },
      getStoryById: (id) => {
        return get().stories.find(story => story.id === id);
      }
    }),
    {
      name: 'story-store'
    }
  )
);
