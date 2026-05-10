import { useState, useEffect } from 'react';
import { getFaqs } from '../lib/db';

export default function FAQ() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  useEffect(() => {
    async function loadFaqs() {
      try {
        const dbFaqs = await getFaqs();
        setFaqs(dbFaqs);
      } catch (error) {
        console.error("FAQ load error:", error);
      } finally {
        setLoading(false);
      }
    }
    loadFaqs();
  }, []);

  return (
    <main className="max-w-[1200px] mx-auto px-8 py-16 min-h-[calc(100vh-200px)]">
      <header className="mb-12 max-w-2xl text-center mx-auto">
        <h1 className="text-[40px] font-bold text-primary mb-4">Frequently Asked Questions</h1>
        <p className="text-[18px] text-on-surface-variant">Here you will find answers to the most common questions regarding site usage, premium resources, and academic progression.</p>
      </header>

      {loading ? (
        <div className="text-center py-12 text-secondary">
          <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
        </div>
      ) : faqs.length === 0 ? (
        <div className="bg-surface p-8 rounded-xl border border-outline-variant text-center text-on-surface-variant">
          No FAQs have been added yet.
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-white border border-outline-variant rounded-xl overflow-hidden ambient-shadow">
              <button 
                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                className="w-full px-6 py-4 flex justify-between items-center bg-surface hover:bg-surface-variant transition-colors text-left"
              >
                <span className="font-bold text-lg text-primary">{faq.question}</span>
                <span className="material-symbols-outlined ml-4 text-on-surface-variant flex-shrink-0">
                  {expandedFaq === faq.id ? 'remove' : 'add'}
                </span>
              </button>
              {expandedFaq === faq.id && (
                <div className="px-6 py-4 border-t border-outline-variant">
                  <p className="text-on-surface-variant leading-relaxed whitespace-pre-line">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
