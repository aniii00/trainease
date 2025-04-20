
import { Outlet, useLocation, Link } from "react-router-dom";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { HomeIcon, GridIcon, CalendarIcon, UserIcon, ShieldIcon } from "@/utils/iconMapping";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

export function Layout() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { isAdmin } = useAuth();
  
  // Check which tab is active based on the current path
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {!isMobile && <Navbar />}
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-4">
          <Outlet />
        </div>
      </main>
      
      {!isMobile && <Footer />}
      
      {/* Mobile Bottom Navigation - Reduced Height */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="flex justify-around items-center h-14"> {/* Reduced from h-16 to h-14 */}
            <Link 
              to="/" 
              className={`flex flex-col items-center justify-center flex-1 py-1 ${
                isActive('/') ? 'text-sports-blue' : 'text-gray-500'
              }`}
            >
              <HomeIcon className="h-5 w-5" /> {/* Reduced from h-6 w-6 */}
              <span className="text-xs">Home</span>
            </Link>
            
            <Link 
              to="/venue" 
              className={`flex flex-col items-center justify-center flex-1 py-1 ${
                isActive('/venue') ? 'text-sports-blue' : 'text-gray-500'
              }`}
            >
              <GridIcon className="h-5 w-5" /> {/* Reduced from h-6 w-6 */}
              <span className="text-xs">Venues</span>
            </Link>
            
            {isAdmin && (
              <Link 
                to="/admin" 
                className={`flex flex-col items-center justify-center flex-1 py-1 ${
                  isActive('/admin') ? 'text-sports-blue' : 'text-gray-500'
                }`}
              >
                <ShieldIcon className="h-5 w-5" />
                <span className="text-xs">Admin</span>
              </Link>
            )}
            
            <Link 
              to="/profile" 
              className={`flex flex-col items-center justify-center flex-1 py-1 ${
                isActive('/profile') ? 'text-sports-blue' : 'text-gray-500'
              }`}
            >
              <UserIcon className="h-5 w-5" /> {/* Reduced from h-6 w-6 */}
              <span className="text-xs">Profile</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
