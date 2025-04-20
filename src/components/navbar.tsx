
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { HomeIcon, GridIcon, CalendarIcon, UserIcon, ShieldIcon } from "@/utils/iconMapping";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export function Navbar() {
  const { user, session, isAdmin, isLoading, signOut } = useAuth();
  const { toast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  // Debug information for admin status
  useEffect(() => {
    console.log("Navbar - Auth state:", { 
      isLoggedIn: !!user,
      isAdmin,
      profileRole: isAdmin ? 'admin' : 'user'
    });
  }, [user, isAdmin]);
  
  const handleSignOut = async () => {
    if (isSigningOut) return;
    
    setIsSigningOut(true);
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b">
      <div className="container px-4 mx-auto">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-sports-blue">Trainease</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-4">
            <Link to="/" className="text-gray-600 hover:text-sports-blue">Home</Link>
            <Link to="/venue" className="text-gray-600 hover:text-sports-blue">Venues</Link>
            {isAdmin && (
              <Link to="/admin" className="text-gray-600 hover:text-sports-blue flex items-center gap-1">
                <ShieldIcon className="h-4 w-4" />
                Admin
              </Link>
            )}
          </nav>
          
          <div className="flex items-center gap-4">
            {isLoading ? (
              <Button variant="ghost" disabled className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full animate-pulse bg-muted"></div>
                Loading
              </Button>
            ) : user ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Profile
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" className="flex items-center gap-2">
                      <ShieldIcon className="h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="hidden md:inline-flex"
                >
                  {isSigningOut ? "Signing Out..." : "Sign Out"}
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" className="hidden md:inline-flex">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
