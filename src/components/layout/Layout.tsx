import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';

const Layout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.isFirstLogin) {
    return <Navigate to="/change-password" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden w-full">
      {/* Sidebar for navigation */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto h-full relative">
        <header className="bg-white shadow border-b h-16 flex items-center px-4 md:px-6 justify-between shrink-0 sticky top-0 z-10 w-full">
          <div className="flex items-center gap-3">
            <div className="md:hidden block">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-md flex items-center justify-center">
                    <Menu className="w-6 h-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <Sidebar />
                </SheetContent>
              </Sheet>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 truncate">
              Xin chào, {user.name}
            </h2>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {user.role === 'ADMIN' ? 'Admin' : 'Đại lý'}
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 relative">
          {/* Main content goes here */}
          <div className="max-w-6xl mx-auto h-full w-full">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
