
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { toast } from "@/components/ui/sonner";

type Profile = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isAdmin: false,
  isLoading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileRequestAttempted, setProfileRequestAttempted] = useState(false);
  const navigate = useNavigate();
  const { toast: hookToast } = useToast();

  useEffect(() => {
    // Setup auth state listener first to catch any auth events during initial load
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.id);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Fetch profile in a separate function to avoid auth deadlocks
          setTimeout(() => fetchProfile(currentSession.user.id), 0);
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setIsLoading(false);
      }
    };
    
    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    if (profileRequestAttempted) {
      console.log("Profile request already attempted, avoiding recursion");
      setIsLoading(false);
      return;
    }

    setProfileRequestAttempted(true);
    
    try {
      console.log("Fetching profile for user:", userId);
      
      // Using a simpler query approach to avoid RLS recursion
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, role, created_at, updated_at')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("Error fetching profile:", error);
        
        // Handle the specific recursion error
        if (error.code === '42P17' && error.message.includes('infinite recursion')) {
          console.log("Infinite recursion detected, manually fetching role");
          
          // Use hardcoded Supabase URL and API key instead of accessing protected properties
          const supabaseUrl = "https://gvrayvnoriflhjyauqrg.supabase.co";
          const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2cmF5dm5vcmlmbGhqeWF1cXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MTg2MjQsImV4cCI6MjA2MDQ5NDYyNH0.ovMMDxFMz-qU326eSW-drj_4sm_foRp97CFIsXe-a94";
          
          const authResponse = await fetch(
            `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=role`, 
            {
              headers: {
                "apikey": apiKey,
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
              }
            }
          );
          
          if (authResponse.ok) {
            const userData = await authResponse.json();
            if (userData && userData.length > 0) {
              console.log("Retrieved profile from REST API:", userData[0]);
              setProfile({
                id: userId,
                email: user?.email || "",
                first_name: user?.user_metadata?.first_name || null,
                last_name: user?.user_metadata?.last_name || null,
                role: userData[0].role || "user",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            } else {
              // Create a temporary profile with default user role
              // Use the user ID instead of email for authorization
              setProfile({
                id: userId,
                email: user?.email || "",
                first_name: user?.user_metadata?.first_name || null,
                last_name: user?.user_metadata?.last_name || null,
                role: "user", // Default to user role as fallback
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            }
          } else {
            // If REST API fails, create a fallback profile with default user role
            setProfile({
              id: userId,
              email: user?.email || "",
              first_name: user?.user_metadata?.first_name || null,
              last_name: user?.user_metadata?.last_name || null,
              role: "user", // Default to user role instead of email-based fallback
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        } else if (error.code !== '42501' && error.code !== '42P17') {
          // Only show an error toast for errors that aren't permissions related
          hookToast({
            title: "Error fetching profile",
            description: error.message,
            variant: "destructive",
          });
        }
      } else if (data) {
        console.log("Profile fetched successfully:", data);
        setProfile(data);
      } else {
        console.log("No profile found for user:", userId);
        // User exists but no profile - could happen if trigger failed
        // Create a temporary profile with default role
        setProfile({
          id: userId,
          email: user?.email || "",
          first_name: user?.user_metadata?.first_name || null,
          last_name: user?.user_metadata?.last_name || null,
          role: "user", // Default to user role
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Exception in profile fetch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setProfileRequestAttempted(false);
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Check if user email matches a specific admin account
  const isAdminEmail = user?.email === "meloreri@logsmarter.net" || user?.email === "vuweha@logsmarter.net";

  const value = {
    user,
    session,
    profile,
    isAdmin: profile?.role === "admin" || isAdminEmail, // Include both database role and specific admin emails
    isLoading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
