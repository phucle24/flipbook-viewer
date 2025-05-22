import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, useStoryStore } from '../lib/store';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import {
  LuLogOut,
  LuUser,
  LuPencil,
  LuTrash,
  LuBookOpen,
  LuBookPlus,
  LuBookType,
  LuFileText
} from 'react-icons/lu';
import type { Story } from '../types';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { stories, fetchStories, deleteStory, isLoading } = useStoryStore();
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

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      await deleteStory(id);
    }
  };

  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <LuBookType className="h-8 w-8 text-violet-600" />
            <h1 className="text-xl font-bold text-gray-900">Flipbook Viewer Admin</h1>
          </div>
          <div className="flex items-center space-x-6">
            <Button
              variant="outline"
              onClick={navigateToDashboard}
              className="flex items-center space-x-2"
            >
              <LuUser className="h-4 w-4" />
              <span>User View</span>
            </Button>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src={user?.avatarUrl || ''} alt={user?.username || 'Admin'} />
                  <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
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
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Story Management</h2>
          <div className="flex gap-4">
            <Link to="/admin/pdf-import">
              <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                <LuFileText className="h-5 w-5" />
                Import from PDF
              </Button>
            </Link>
            <Link to="/admin/add-story">
              <Button className="bg-violet-600 hover:bg-violet-700 flex items-center gap-2">
                <LuBookPlus className="h-5 w-5" />
                Add New Story
              </Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="h-12 w-12 border-t-4 border-violet-600 border-solid rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading stories...</p>
          </div>
        ) : filteredStories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story) => (
              <Card key={story.id} className="overflow-hidden">
                <div
                  className="h-40 bg-cover bg-center"
                  style={{ backgroundImage: `url(${story.coverImage})` }}
                />
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{story.title}</CardTitle>
                  <p className="text-sm text-gray-500">by {story.author}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 line-clamp-2">{story.description}</p>
                  <div className="mt-2 flex gap-1 flex-wrap">
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
                <CardFooter className="flex justify-between">
                  <Link to={`/admin/edit-story/${story.id}`}>
                    <Button variant="outline" className="flex items-center space-x-2 text-violet-600">
                      <LuPencil className="h-4 w-4" />
                      <span>Edit</span>
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleDelete(story.id)}
                  >
                    <LuTrash className="h-4 w-4" />
                    <span>Delete</span>
                  </Button>
                  <Link to={`/story/${story.id}`}>
                    <Button variant="ghost" className="flex items-center space-x-2 text-violet-600">
                      <LuBookOpen className="h-4 w-4" />
                      <span>View</span>
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <LuBookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No stories found</h3>
            <p className="mt-1 text-gray-500">Add your first story to get started!</p>
            <div className="mt-6">
              <Link to="/admin/add-story">
                <Button className="bg-violet-600 hover:bg-violet-700">
                  Add Your First Story
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
