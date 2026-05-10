import { useState, useEffect } from 'react';
import { getAboutAuthor } from '../lib/db';
import ReactMarkdown from 'react-markdown';

export default function AboutAuthor() {
  const [author, setAuthor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAboutAuthor();
        if (data) {
          const { getSignedUrl } = await import('../lib/db');
          setAuthor({
            ...data,
            profilePic: await getSignedUrl(data.profilePic)
          });
        }
      } catch (error) {
        console.error("AboutAuthor load error:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <main className="max-w-[800px] mx-auto px-8 py-16 min-h-[calc(100vh-200px)] flex justify-center items-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-secondary">progress_activity</span>
      </main>
    );
  }

  const name = author?.name || 'Kabir';
  const title = author?.title || 'Educator & Content Creator';
  const bio = author?.bio || 'Welcome to **PsychWithKabir**! I am passionate about simplifying complex psychological concepts and making high-quality education accessible to everyone.';
  const profilePic = author?.profilePic || '';
  const email = author?.email || '';

  return (
    <main className="max-w-[800px] mx-auto px-8 py-16 min-h-[calc(100vh-200px)]">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 md:p-12 border border-outline-variant ambient-shadow text-center">
        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center mb-6 shadow-lg border-4 border-white">
          {profilePic ? (
            <img src={profilePic} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-[64px] text-white">person</span>
          )}
        </div>
        
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          About {name}
        </h1>
        
        <h2 className="text-xl font-medium text-teal-600 dark:text-teal-400 mb-8">
          {title}
        </h2>
        
        <div className="prose prose-slate dark:prose-invert mx-auto text-left text-slate-600 dark:text-slate-300">
          <ReactMarkdown>{bio}</ReactMarkdown>
        </div>
        
        {email && (
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-3">
            <a href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(email)}&su=${encodeURIComponent('Hello from PsychWithKabir')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-full font-medium hover:bg-teal-700 transition-colors shadow-md">
              <span className="material-symbols-outlined text-[20px]">mail</span>
              Contact via Gmail
            </a>
            <a href={`mailto:${email}?subject=${encodeURIComponent('Hello from PsychWithKabir')}`} className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              <span className="material-symbols-outlined text-[20px]">open_in_new</span>
              Open in Email App
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
