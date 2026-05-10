import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  email: string;
  name?: string;
  role: 'student' | 'admin';
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  loading: true,
  isAdmin: false,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          const user = session?.user ?? null;
          setCurrentUser(user);
          if (user) {
            await fetchProfile(user);
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Initial session error:", err);
        if (mounted) setLoading(false);
      }
    }

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        const user = session?.user ?? null;
        setCurrentUser(user);
        if (user) {
          await fetchProfile(user);
        } else {
          setUserProfile(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (user: User) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        const isAdminEmail = user.email === 'kookiekabir@gmail.com' || user.email === 'mdaltamaskabir2@gmail.com';
        const newProfile: any = {
          id: user.id,
          email: user.email!,
          role: isAdminEmail ? 'admin' : 'student',
          name: user.user_metadata?.full_name || 'Student',
        };
        
        const { data: insertedData, error: insertError } = await supabase
          .from('users')
          .insert([newProfile])
          .select()
          .single();
        
        if (!insertError) setUserProfile(insertedData as UserProfile);
        else setUserProfile(newProfile); // Fallback to local object if DB fails
      } else {
        setUserProfile(data as UserProfile);
      }
    } catch (e) {
      console.error("Profile fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = userProfile?.role === 'admin' || 
    currentUser?.email === 'kookiekabir@gmail.com' || 
    currentUser?.email === 'mdaltamaskabir2@gmail.com';

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, isAdmin: !!isAdmin, logout }}>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-on-surface-variant font-medium">Loading Course Portal...</p>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};
