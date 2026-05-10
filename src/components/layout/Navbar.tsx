import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const { currentUser, userProfile, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center px-8 h-16 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-all duration-200">
      <div className="max-w-[1200px] w-full mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          PsychWithKabir
        </Link>
        <nav className="hidden md:flex items-center space-x-8 font-inter text-sm tracking-tight">
          <Link className={`${isActive('/') ? 'text-teal-600 dark:text-teal-400 font-semibold border-b-2 border-teal-600' : 'text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors duration-200'} h-16 flex items-center`} to="/">Home</Link>
          <Link className={`${isActive('/syllabus') ? 'text-teal-600 dark:text-teal-400 font-semibold border-b-2 border-teal-600' : 'text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors duration-200'} h-16 flex items-center`} to="/syllabus">Syllabus</Link>
          <Link className={`${isActive('/study-notes') ? 'text-teal-600 dark:text-teal-400 font-semibold border-b-2 border-teal-600' : 'text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors duration-200'} h-16 flex items-center`} to="/study-notes">Study Notes</Link>
          <Link className={`${isActive('/qa') ? 'text-teal-600 dark:text-teal-400 font-semibold border-b-2 border-teal-600' : 'text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors duration-200'} h-16 flex items-center`} to="/qa">Q&A</Link>
          <Link className={`${isActive('/lectures') ? 'text-teal-600 dark:text-teal-400 font-semibold border-b-2 border-teal-600' : 'text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors duration-200'} h-16 flex items-center`} to="/lectures">Video Lectures</Link>
          <Link className={`${isActive('/doubts') ? 'text-teal-600 dark:text-teal-400 font-semibold border-b-2 border-teal-600' : 'text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors duration-200'} h-16 flex items-center`} to="/doubts">Doubts</Link>
          <Link className={`${isActive('/about') ? 'text-teal-600 dark:text-teal-400 font-semibold border-b-2 border-teal-600' : 'text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors duration-200'} h-16 flex items-center`} to="/about">About Author</Link>
        </nav>
        <div className="flex items-center relative gap-4">
          {currentUser ? (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)} 
                className="flex items-center gap-2 bg-surface hover:bg-surface-variant px-4 py-2 rounded-full border border-outline-variant transition-colors"
              >
                <div className="w-6 h-6 bg-secondary text-white rounded-full flex items-center justify-center text-xs font-bold uppercase">
                  {userProfile?.name?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:block max-w-[100px] truncate">
                  {userProfile?.name || currentUser.displayName || 'Student'}
                </span>
                <span className="material-symbols-outlined text-[18px] text-slate-500">expand_more</span>
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-outline-variant rounded-xl shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-outline-variant mb-2">
                    <p className="text-sm font-bold text-slate-800 truncate">{userProfile?.name || currentUser.displayName || 'Student'}</p>
                    <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                  </div>
                  {(userProfile?.role === 'admin' || currentUser.email === 'kookiekabir@gmail.com') && (
                    <Link onClick={() => setDropdownOpen(false)} to="/admin" className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span> Admin Panel
                    </Link>
                  )}
                  <button 
                    onClick={() => { logout(); setDropdownOpen(false); }} 
                    className="w-full text-left px-4 py-2 text-sm text-error hover:bg-red-50 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="bg-secondary text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Login
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden flex items-center justify-center p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-[28px]">{isMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-white dark:bg-slate-900 md:hidden flex flex-col p-6 space-y-2 border-t border-slate-200 dark:border-slate-800 overflow-y-auto">
          <Link onClick={() => setIsMenuOpen(false)} className={`px-4 py-3 rounded-xl text-lg font-bold ${isActive('/') ? 'bg-secondary-container text-on-secondary-container' : 'text-slate-600 dark:text-slate-400'}`} to="/">Home</Link>
          <Link onClick={() => setIsMenuOpen(false)} className={`px-4 py-3 rounded-xl text-lg font-bold ${isActive('/syllabus') ? 'bg-secondary-container text-on-secondary-container' : 'text-slate-600 dark:text-slate-400'}`} to="/syllabus">Syllabus</Link>
          <Link onClick={() => setIsMenuOpen(false)} className={`px-4 py-3 rounded-xl text-lg font-bold ${isActive('/study-notes') ? 'bg-secondary-container text-on-secondary-container' : 'text-slate-600 dark:text-slate-400'}`} to="/study-notes">Study Notes</Link>
          <Link onClick={() => setIsMenuOpen(false)} className={`px-4 py-3 rounded-xl text-lg font-bold ${isActive('/qa') ? 'bg-secondary-container text-on-secondary-container' : 'text-slate-600 dark:text-slate-400'}`} to="/qa">Q&A</Link>
          <Link onClick={() => setIsMenuOpen(false)} className={`px-4 py-3 rounded-xl text-lg font-bold ${isActive('/lectures') ? 'bg-secondary-container text-on-secondary-container' : 'text-slate-600 dark:text-slate-400'}`} to="/lectures">Video Lectures</Link>
          <Link onClick={() => setIsMenuOpen(false)} className={`px-4 py-3 rounded-xl text-lg font-bold ${isActive('/doubts') ? 'bg-secondary-container text-on-secondary-container' : 'text-slate-600 dark:text-slate-400'}`} to="/doubts">Doubts</Link>
          <Link onClick={() => setIsMenuOpen(false)} className={`px-4 py-3 rounded-xl text-lg font-bold ${isActive('/about') ? 'bg-secondary-container text-on-secondary-container' : 'text-slate-600 dark:text-slate-400'}`} to="/about">About Author</Link>
        </div>
      )}
    </header>
  );
}
