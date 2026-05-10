import { useState, useEffect } from 'react';
import { getSiteSettings } from '../lib/db';

export default function ContactUs() {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      const dbSettings = await getSiteSettings();
      if (dbSettings && dbSettings.contactUs) {
        setContent(dbSettings.contactUs);
      } else {
        setContent('Contact information will be updated soon. You can reach us at contact@psychwithkabir.com');
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  return (
    <main className="max-w-[800px] mx-auto px-8 py-16 min-h-[calc(100vh-200px)]">
      <h1 className="text-4xl font-bold text-primary tracking-tight mb-8">Contact Us</h1>
      {loading ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined animate-spin text-4xl text-secondary">progress_activity</span>
        </div>
      ) : (
        <div className="prose prose-slate max-w-none whitespace-pre-wrap text-on-surface-variant leading-relaxed">
          {content}
        </div>
      )}
    </main>
  );
}
