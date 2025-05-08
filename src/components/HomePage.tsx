import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import Header from './Header';
import Footer from './Footer';
import StoryCard from './StoryCard';
import FlipbookLayout from './FlipbookLayout';
import { useAuthStore, useStoryStore } from '../lib/store';
import { Button } from './ui/button';
import { LuArrowRight, LuBookOpen, LuLogIn, LuUser } from 'react-icons/lu';
import type { Story } from '../types';

// Configure Modal for react-modal
Modal.setAppElement('#root');

const HomePage = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { stories, fetchStories, isLoading } = useStoryStore();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const openStory = (story: Story) => {
    setSelectedStory(story);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const customModalStyles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      zIndex: 1000,
    },
    content: {
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      padding: '0',
      border: 'none',
      background: 'transparent',
    },
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-violet-600 to-indigo-600 py-20 text-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">Discover Amazing Stories</h1>
              <p className="mb-8 text-lg opacity-90">
                Explore a collection of captivating stories from talented writers around the world.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard">
                      <Button className="rounded-full bg-white px-6 py-3 font-medium text-violet-600 transition-colors hover:bg-gray-100 flex items-center">
                        <LuBookOpen className="mr-2" /> My Stories
                      </Button>
                    </Link>
                    {user?.isAdmin && (
                      <Link to="/admin">
                        <Button className="rounded-full border border-white bg-transparent px-6 py-3 font-medium text-white transition-colors hover:bg-white/10 flex items-center">
                          <LuUser className="mr-2" /> Admin Dashboard
                        </Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button className="rounded-full bg-white px-6 py-3 font-medium text-violet-600 transition-colors hover:bg-gray-100 flex items-center">
                        <LuLogIn className="mr-2" /> Sign In
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button className="rounded-full border border-white bg-transparent px-6 py-3 font-medium text-white transition-colors hover:bg-white/10">
                        Register
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Stories Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Featured Stories</h2>
              <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
                Immerse yourself in these handpicked stories that captivate and inspire.
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 border-t-4 border-violet-600 border-solid rounded-full animate-spin" />
                  <p className="mt-4 text-violet-600">Loading stories...</p>
                </div>
              </div>
            ) : stories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {stories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onClick={() => openStory(story)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <LuBookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No stories available</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">There are no stories to display right now.</p>
                {isAuthenticated && user?.isAdmin && (
                  <Link to="/admin/add-story">
                    <Button className="bg-violet-600 hover:bg-violet-700">
                      Add Your First Story <LuArrowRight className="ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Flipbook Modal */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          style={customModalStyles}
          contentLabel="Story Flipbook"
          className="modal-overlay"
        >
          {selectedStory && (
            <div className="h-screen w-full relative">
              <FlipbookLayout story={selectedStory} />
              <button
                onClick={closeModal}
                className="absolute right-4 top-4 z-50 rounded-full bg-navy-dark/80 p-2 text-white hover:bg-navy"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </Modal>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
