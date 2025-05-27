import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, useStoryStore } from '../lib/store';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { LuLogOut, LuShield, LuArrowRight, LuBookOpen, LuBookType, LuLayoutDashboard } from 'react-icons/lu';
import type { Story } from '../types';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { stories, fetchStories, isLoading } = useStoryStore();
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  useEffect(() => {
    setFilteredStories(stories);
  }, [stories]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigateToAdmin = () => {
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <LuBookType className="h-8 w-8 text-violet-600" />
            <h1 className="text-xl font-bold text-gray-900">Flipbook Viewer</h1>
          </div>
          <div className="flex items-center space-x-6">
            {user?.isAdmin && (
              <Button
                variant="outline"
                onClick={navigateToAdmin}
                className="flex items-center space-x-2"
              >
                <LuShield className="h-4 w-4" />
                <span>Admin Panel</span>
              </Button>
            )}

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src={user?.avatarUrl || ''} alt={user?.username || 'User'} />
                  <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user?.username}</span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Logout"
                className="text-gray-500 hover:text-gray-700"
              >
                <LuLogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-violet-600 text-white rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome to Your Stories!</h2>
          <p className="text-violet-100 mb-4">Explore your favorite stories and discover new adventures</p>
          <Link to="/">
            <Button variant="outline" className="bg-white text-violet-600 hover:bg-violet-50">
              Browse All Stories
            </Button>
          </Link>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Stories Collection</h2>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="h-12 w-12 border-t-4 border-violet-600 border-solid rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading stories...</p>
          </div>
        ) : filteredStories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story) => (
              <Card key={story.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${story.coverImage})` }}
                />
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{story.title}</CardTitle>
                  <p className="text-sm text-gray-500">by {story.author}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 line-clamp-2">{story.description}</p>
                  <div className="flex mt-2 flex-wrap gap-1">
                    {story.tags.slice(0, 3).map((tag) => (
                      <span
                        key={`${story.id}-tag-${tag}`}
                        className="px-2 py-1 text-xs rounded-full bg-violet-100 text-violet-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to={`/story/${story.id}`} className="w-full">
                    <Button variant="ghost" className="w-full flex justify-between items-center text-violet-600">
                      <div className="flex items-center">
                        <LuBookOpen className="mr-2 h-5 w-5" />
                        <span>Read Story</span>
                      </div>
                      <LuArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <LuLayoutDashboard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No stories found</h3>
            <p className="mt-1 text-gray-500">Your collection is empty. Browse and add some stories!</p>
            <div className="mt-6">
              <Link to="/">
                <Button variant="default" className="bg-violet-600 hover:bg-violet-700">
                  Browse Stories
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
