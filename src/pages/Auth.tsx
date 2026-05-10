import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      
      // If email confirmation is required (session is null)
      if (!data.session) {
        setSuccessMessage("Your account has been created. Please check your email and verify your address before logging in.");
        setIsLogin(true); // Redirect to Login mode
        setPassword(''); // Clear password for security
      } else {
        // If auto-confirm is on, go home
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating account.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full max-w-[1200px] mx-auto px-gutter min-h-[calc(100vh-200px)] flex flex-col items-center justify-center">
      <div className="mb-lg text-center mt-12">
        <div className="flex items-center justify-center mb-base"><span className="material-symbols-outlined text-secondary text-4xl">psychology</span></div>
        <h1 className="font-bold text-[40px] text-primary">PsychWithKabir</h1>
        <p className="text-sm font-medium text-on-surface-variant mt-xs">Advanced Psychology Learning Management</p>
      </div>
      <div className="w-full max-w-[440px] bg-white border border-outline-variant rounded-lg p-lg ambient-shadow">
        <header className="mb-md">
          <div className="flex border-b border-outline-variant mb-4">
            <button className={`pb-2 px-4 font-semibold text-lg flex-1 ${isLogin ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'}`} onClick={() => setIsLogin(true)}>Login</button>
            <button className={`pb-2 px-4 font-semibold text-lg flex-1 ${!isLogin ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'}`} onClick={() => setIsLogin(false)}>Sign Up</button>
          </div>
          <p className="text-[12px] text-on-surface-variant">{isLogin ? 'Please enter your credentials to access the portal.' : 'Create a student account to access free notes and track progress.'}</p>
          {error && <p className="text-[12px] text-error mt-2">{error}</p>}
          {successMessage && <p className="text-[12px] text-secondary font-bold mt-2">{successMessage}</p>}
        </header>
        <form className="space-y-md" onSubmit={isLogin ? handleLogin : handleSignup}>
          <div className="flex flex-col space-y-xs">
            <label className="text-sm font-medium text-primary" htmlFor="email">Email Address</label>
            <div className="relative">
              <input className="w-full px-sm py-base bg-surface border border-outline-variant rounded-lg text-[16px] text-on-surface placeholder:text-surface-dim transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" id="email" placeholder="student@uni.edu" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
            </div>
          </div>
          <div className="flex flex-col space-y-xs">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-primary" htmlFor="password">Secure Password</label>
              {isLogin && <a className="text-[12px] text-secondary hover:underline transition-all" href="#">Forgot Password?</a>}
            </div>
            <div className="relative">
              <input className="w-full pl-sm pr-12 py-base bg-surface border border-outline-variant rounded-lg text-[16px] text-on-surface placeholder:text-surface-dim transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" id="password" placeholder="••••••••" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>
          <div className="pt-sm">
            <button className="w-full bg-secondary text-white text-sm font-medium py-3 rounded-lg hover:bg-[#157165] transition-colors duration-200 flex items-center justify-center gap-sm disabled:opacity-50" type="submit" disabled={loading}>
              <span>{loading ? (isLogin ? 'Logging in...' : 'Signing up...') : (isLogin ? 'Login to Dashboard' : 'Create Account')}</span>
              {!loading && <span className="material-symbols-outlined text-lg">{isLogin ? 'login' : 'person_add'}</span>}
            </button>
          </div>
        </form>
        <div className="mt-md pt-md border-t border-outline-variant">
          <div className="academic-callout p-sm bg-[#eff4ff] rounded-lg">
            <p className="text-[12px] text-on-surface-variant italic leading-relaxed">"The good life is a process, not a state of being. It is a direction, not a destination." — Carl Rogers</p>
          </div>
        </div>
      </div>
    </main>
  );
}
