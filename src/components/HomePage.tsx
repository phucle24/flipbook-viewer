import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import Header from './Header';
import Footer from './Footer';
import StoryCard from './StoryCard';
import FlipbookLayout from './FlipbookLayout';
import { useAuthStore, useStoryStore } from '../lib/store';
import { Button } from './ui/button';
import { IoArrowForward, IoBookOutline, IoLogIn, IoPerson } from 'react-icons/io5';
import type { Story } from '../types';

// Custom animation CSS (can be moved to a CSS file)
const floatStyles = `
@keyframes float {
  0% { transform: translateY(0px) rotate(-2deg);}
  50% { transform: translateY(-18px) rotate(2deg);}
  100% { transform: translateY(0px) rotate(-2deg);}
}
@keyframes floatDelay {
  0% { transform: translateY(0px) rotate(2deg);}
  50% { transform: translateY(-14px) rotate(-2deg);}
  100% { transform: translateY(0px) rotate(2deg);}
}
@keyframes floatSeed {
  0% { transform: translateY(0px) rotate(-1deg);}
  50% { transform: translateY(-10px) rotate(1deg);}
  100% { transform: translateY(0px) rotate(-1deg);}
}
.animate-float { animation: float 3.5s ease-in-out infinite; }
.animate-float-delay { animation: floatDelay 4.2s ease-in-out infinite; }
.animate-float-seed { animation: floatSeed 3.2s ease-in-out infinite; }

.btn-animated {
  transition:
    transform 0.18s cubic-bezier(.4,2,.6,1),
    box-shadow 0.18s cubic-bezier(.4,2,.6,1),
    background 0.18s,
    color 0.18s;
  will-change: transform, box-shadow;
}
.btn-animated:hover, .btn-animated:focus-visible {
  transform: scale(1.07) rotate(-1deg);
  box-shadow: 0 6px 32px 0 rgba(180, 120, 255, 0.18), 0 2px 8px 0 rgba(0,0,0,0.10);
  filter: brightness(1.04) saturate(1.1);
}
.btn-animated:active {
  transform: scale(0.97) rotate(1deg);
  box-shadow: 0 2px 8px 0 rgba(180, 120, 255, 0.10);
  filter: brightness(0.98) saturate(0.95);
}
`;

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
      {/* Animation styles for floating illustrations and button */}
      <style>{floatStyles}</style>
      <Header />

      <main className="flex-1 bg-gradient-to-b from-baby-blue/30 via-mint-green/20 to-white dark:bg-gray-900">
        {/* Hero Section */}
        <section className="bg-gradient-purple-cotton py-20 text-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="relative mx-auto max-w-3xl text-center">
              <h1 className="mb-6 text-5xl md:text-6xl lg:text-7xl font-fredoka text-sunshine-yellow text-glow-yellow text-title-shadow drop-shadow font-bold">
                Welcome to Storyland
              </h1>
              <p className="mb-8 text-lg font-quicksand opacity-90">
                Thế giới cổ tích – nơi bé vui đọc và khám phá những câu chuyện kỳ diệu đầy màu sắc!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard">
                      <Button className="btn-animated rounded-full bg-white px-6 py-3 font-medium text-lilac-purple hover:bg-cotton-candy hover:text-white flex items-center font-baloo text-lg shadow-lg transition">
                        <IoBookOutline className="mr-2" /> My Stories
                      </Button>
                    </Link>
                    {user?.isAdmin && (
                      <Link to="/admin">
                        <Button className="btn-animated rounded-full border border-white bg-transparent px-6 py-3 font-medium text-white hover:bg-white/10 flex items-center font-baloo text-lg">
                          <IoPerson className="mr-2" /> Admin Dashboard
                        </Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button className="btn-animated rounded-full bg-cotton-candy px-6 py-3 font-medium text-white hover:bg-sunshine-yellow hover:text-lilac-purple flex items-center font-baloo text-lg shadow-md">
                        <IoLogIn className="mr-2" /> Đăng nhập
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button className="btn-animated rounded-full border border-white bg-transparent px-6 py-3 font-medium text-white hover:bg-baby-blue hover:text-lilac-purple font-baloo text-lg">
                        Đăng ký
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Stories Section */}
        <section className="py-16 bg-mint-green">
          <div className="relative container mx-auto px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="mb-2 text-4xl font-bold font-baloo text-baby-blue drop-shadow">
                Những câu chuyện nổi bật
              </h2>
              <p className="mx-auto max-w-2xl text-gray-700 font-quicksand">
                Cùng bé phiêu lưu qua các trang sách đầy màu sắc và sáng tạo!
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 border-t-4 border-lilac-purple border-solid rounded-full animate-spin" />
                  <p className="mt-4 text-lilac-purple font-baloo">Đang tải truyện...</p>
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
              <div className="text-center py-12 bg-baby-blue rounded-lg">
                <IoBookOutline className="mx-auto h-16 w-16 text-lilac-purple mb-4" />
                <h3 className="text-2xl font-medium font-baloo text-lilac-purple mb-2">Chưa có truyện nào</h3>
                <p className="text-baloo text-lilac-purple mb-6">Hãy là người kể chuyện đầu tiên nhé!</p>
                {isAuthenticated && user?.isAdmin && (
                  <Link to="/admin/add-story">
                    <Button className="btn-animated bg-cotton-candy hover:bg-sunshine-yellow hover:text-lilac-purple font-baloo text-lg">
                      Thêm truyện mới <IoArrowForward className="ml-2" />
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
