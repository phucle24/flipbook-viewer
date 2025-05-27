import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStoryStore, useAuthStore } from '../lib/store';
import FlipbookLayout from '../components/FlipbookLayout';
import { Button } from '../components/ui/button';
import { LuArrowLeft, LuShield } from 'react-icons/lu';
import { FiHome } from 'react-icons/fi';
import type { Story } from '../types';

const ViewStoryPage = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { getStoryById } = useStoryStore();
  const { user } = useAuthStore();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (storyId) {
      const storyData = getStoryById(Number(storyId));
      if (storyData) {
        setStory(storyData);
      } else {
        // Story not found, redirect
        navigate('/dashboard');
      }
      setLoading(false);
    }
  }, [storyId, getStoryById, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-t-4 border-violet-600 border-solid rounded-full animate-spin" />
          <p className="text-violet-600 text-lg font-medium">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Story Not Found</h2>
          <p className="text-gray-600 mb-6">The story you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Go Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <div className="bg-white shadow-sm py-3 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-gray-600"
            >
              <LuArrowLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 flex items-center space-x-2"
            >
              <FiHome className="h-5 w-5 mr-1" />
              <span>Dashboard</span>
            </Button>
            {user?.isAdmin && (
              <Button
                variant="ghost"
                onClick={() => navigate(`/admin/edit-story/${story.id}`)}
                className="text-gray-600 flex items-center space-x-2"
              >
                <LuShield className="h-5 w-5 mr-1" />
                <span>Edit Story</span>
              </Button>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-violet-600">{story.title}</h2>
          </div>
        </div>
      </div>

      {/* Flipbook */}
      <div className="flex-1 bg-gray-100">
        <div className="h-full">
          <FlipbookLayout story={story} />
        </div>
      </div>
    </div>
  );
};

export default ViewStoryPage;
