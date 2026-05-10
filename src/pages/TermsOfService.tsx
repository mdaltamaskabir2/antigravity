import { useState, useEffect } from 'react';
import { getSiteSettings } from '../lib/db';

export default function TermsOfService() {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      const dbSettings = await getSiteSettings();
      if (dbSettings && dbSettings.termsOfService) {
        setContent(dbSettings.termsOfService);
      } else {
        setContent('Terms of Service will be updated soon.');
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  return (
    <main className="max-w-[800px] mx-auto px-8 py-16 min-h-[calc(100vh-200px)]">
      <h1 className="text-4xl font-bold text-primary tracking-tight mb-8">Terms of Service</h1>
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
