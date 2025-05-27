import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Label } from '../components/ui/label';
import { LuUser, LuShield, LuBookOpen, LuLock, LuInfo } from 'react-icons/lu';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthLoading, loginError, isAuthenticated, user } = useAuthStore();

  const [userCredentials, setUserCredentials] = useState({
    username: '',
    password: '',
  });

  const [adminCredentials, setAdminCredentials] = useState({
    username: '',
    password: '',
  });

  const [userErrors, setUserErrors] = useState({
    username: '',
    password: '',
  });

  const [adminErrors, setAdminErrors] = useState({
    username: '',
    password: '',
  });

  // Effect to redirect user after successful login
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const validateUserFields = () => {
    const errors = {
      username: '',
      password: '',
    };

    if (!userCredentials.username.trim()) {
      errors.username = 'Username is required';
    }

    if (!userCredentials.password.trim()) {
      errors.password = 'Password is required';
    } else if (userCredentials.password.length < 5) {
      errors.password = 'Password must be at least 5 characters';
    }

    setUserErrors(errors);
    return !errors.username && !errors.password;
  };

  const validateAdminFields = () => {
    const errors = {
      username: '',
      password: '',
    };

    if (!adminCredentials.username.trim()) {
      errors.username = 'Username is required';
    }

    if (!adminCredentials.password.trim()) {
      errors.password = 'Password is required';
    } else if (adminCredentials.password.length < 5) {
      errors.password = 'Password must be at least 5 characters';
    }

    setAdminErrors(errors);
    return !errors.username && !errors.password;
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserCredentials((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (userErrors[name as keyof typeof userErrors]) {
      setUserErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminCredentials((prev) => ({ ...prev, [name]: value }));

    // Clear error when admin starts typing
    if (adminErrors[name as keyof typeof adminErrors]) {
      setAdminErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateUserFields()) return;

    await login(userCredentials.username, userCredentials.password);
    // Navigation is handled in the useEffect
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAdminFields()) return;

    await login(adminCredentials.username, adminCredentials.password);
    // Navigation is handled in the useEffect
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/images/kids-background.jpg')" }}
    >
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]">
            Flipbook Viewer
          </h1>
          <p className="text-xl text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            Discover amazing stories!
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-white/90 rounded-xl shadow-xl border-0 overflow-hidden">
          <div className="p-6">
            <Tabs defaultValue="user" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger
                  value="user"
                  className="data-[state=active]:bg-violet-500 data-[state=active]:text-white"
                >
                  <LuUser className="mr-2" /> User Login
                </TabsTrigger>
                <TabsTrigger
                  value="admin"
                  className="data-[state=active]:bg-violet-500 data-[state=active]:text-white"
                >
                  <LuShield className="mr-2" /> Admin Login
                </TabsTrigger>
              </TabsList>

              {/* User Login Form */}
              <TabsContent value="user">
                <form onSubmit={handleUserLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-username" className="flex items-center">
                      <LuUser className="mr-2 text-violet-600" size={16} />
                      Username
                    </Label>
                    <Input
                      id="user-username"
                      name="username"
                      value={userCredentials.username}
                      onChange={handleUserChange}
                      placeholder="Enter your username"
                      className={`border-violet-300 focus:border-violet-500 ${
                        userErrors.username ? 'border-red-500' : ''
                      }`}
                    />
                    {userErrors.username && (
                      <p className="text-red-500 text-xs flex items-center mt-1">
                        <LuInfo className="mr-1" size={12} />
                        {userErrors.username}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-password" className="flex items-center">
                      <LuLock className="mr-2 text-violet-600" size={16} />
                      Password
                    </Label>
                    <Input
                      id="user-password"
                      name="password"
                      type="password"
                      value={userCredentials.password}
                      onChange={handleUserChange}
                      placeholder="Enter your password"
                      className={`border-violet-300 focus:border-violet-500 ${
                        userErrors.password ? 'border-red-500' : ''
                      }`}
                    />
                    {userErrors.password && (
                      <p className="text-red-500 text-xs flex items-center mt-1">
                        <LuInfo className="mr-1" size={12} />
                        {userErrors.password}
                      </p>
                    )}
                  </div>
                  {loginError && (
                    <div className="text-red-500 text-sm p-2 bg-red-50 border border-red-200 rounded flex items-center">
                      <LuInfo className="mr-2" size={16} />
                      {loginError}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-violet-500 hover:bg-violet-600 text-white transition-colors"
                    disabled={isAuthLoading}
                  >
                    {isAuthLoading ? (
                      <>
                        <span className="h-4 w-4 mr-2 border-t-2 border-white border-solid rounded-full animate-spin inline-block align-middle" />
                        Logging in...
                      </>
                    ) : (
                      'Login as User'
                    )}
                  </Button>
                  <div className="text-center text-sm text-gray-500 mt-4 p-2 bg-gray-100 rounded-md">
                    <p className="font-semibold">Demo credentials:</p>
                    <p>Username: user / Password: password</p>
                  </div>
                </form>
              </TabsContent>

              {/* Admin Login Form */}
              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-username" className="flex items-center">
                      <LuShield className="mr-2 text-violet-600" size={16} />
                      Admin Username
                    </Label>
                    <Input
                      id="admin-username"
                      name="username"
                      value={adminCredentials.username}
                      onChange={handleAdminChange}
                      placeholder="Enter admin username"
                      className={`border-violet-300 focus:border-violet-500 ${
                        adminErrors.username ? 'border-red-500' : ''
                      }`}
                    />
                    {adminErrors.username && (
                      <p className="text-red-500 text-xs flex items-center mt-1">
                        <LuInfo className="mr-1" size={12} />
                        {adminErrors.username}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password" className="flex items-center">
                      <LuLock className="mr-2 text-violet-600" size={16} />
                      Admin Password
                    </Label>
                    <Input
                      id="admin-password"
                      name="password"
                      type="password"
                      value={adminCredentials.password}
                      onChange={handleAdminChange}
                      placeholder="Enter admin password"
                      className={`border-violet-300 focus:border-violet-500 ${
                        adminErrors.password ? 'border-red-500' : ''
                      }`}
                    />
                    {adminErrors.password && (
                      <p className="text-red-500 text-xs flex items-center mt-1">
                        <LuInfo className="mr-1" size={12} />
                        {adminErrors.password}
                      </p>
                    )}
                  </div>
                  {loginError && (
                    <div className="text-red-500 text-sm p-2 bg-red-50 border border-red-200 rounded flex items-center">
                      <LuInfo className="mr-2" size={16} />
                      {loginError}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-violet-500 hover:bg-violet-600 text-white transition-colors"
                    disabled={isAuthLoading}
                  >
                    {isAuthLoading ? (
                      <>
                        <span className="h-4 w-4 mr-2 border-t-2 border-white border-solid rounded-full animate-spin inline-block align-middle" />
                        Logging in...
                      </>
                    ) : (
                      'Login as Admin'
                    )}
                  </Button>
                  <div className="text-center text-sm text-gray-500 mt-4 p-2 bg-gray-100 rounded-md">
                    <p className="font-semibold">Demo credentials:</p>
                    <p>Username: admin / Password: admin123</p>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </Card>

        <div className="mt-8 flex justify-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/20"
          >
            <LuBookOpen className="mr-2" /> Browse Stories
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
