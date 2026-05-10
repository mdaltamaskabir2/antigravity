import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getNotes, getSyllabusUnits, getFaqs, askQuestion } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [questionText, setQuestionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    async function fetchData() {
      try {
        const dbUnits = await getSyllabusUnits();
        setUnits(dbUnits);
        const notes = await getNotes();
        setRecentNotes(notes.slice(0, 4));
        const fetchedFaqs = await getFaqs();
        setFaqs(fetchedFaqs.filter((f: any) => f.status === 'published' || f.answer));
      } catch (error) {
        console.error("Home fetchData error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    setIsSubmitting(true);
    await askQuestion(questionText, currentUser?.email || 'Anonymous');
    setQuestionText('');
    setIsSubmitting(false);
    setSubmitMessage('Your question has been sent to the Course Instructor. Once answered, it will appear in the FAQs.');
    setTimeout(() => setSubmitMessage(''), 5000);
  };

  const getUnitName = (uId: string) => units.find(u => u.id === uId)?.title || 'Uncategorized';

  return (
    <main>
      <section className="relative overflow-hidden pt-xl pb-xl bg-surface">
        <div className="max-w-[1200px] mx-auto px-gutter grid grid-cols-1 lg:grid-cols-2 gap-lg items-center">
          <div className="max-w-reading-width">
            <h1 className="font-bold text-[40px] leading-[1.2] tracking-[-0.02em] text-primary mb-md">Master Psychology with Academic Precision.</h1>
            <p className="text-[18px] leading-[1.6] text-on-surface-variant mb-lg">Deep-dive into the human mind with curated study materials, clinical case studies, and research-backed lectures designed for university excellence.</p>
            <div className="flex flex-wrap gap-base">
              <Link to="/study-notes" className="bg-secondary text-white px-lg py-sm rounded-lg text-sm font-medium hover:opacity-90 transition-all flex items-center gap-xs">Explore Notes</Link>
              <Link to="/lectures" className="border border-primary text-primary px-lg py-sm rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition-all flex items-center gap-xs">Watch Lectures</Link>
            </div>
          </div>
          <div className="hidden lg:block relative">
            <div className="aspect-square bg-surface-container rounded-xl overflow-hidden shadow-sm">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIIJ506EGdlZJowBG-6AJ7eIga17GjRSu3fGBC9JOWAdQfuVH4hbDHJ3Q2CbwFp_3ECdTGD-SsnxZiVFES3keyk8ZzBU5v3-lXy9N50sFnKC0Ht2u4BMJ48fqWHOP4qRJUtyLRmN_pqGYIVxt6IXXzh3Xga7vbSE8NDSyMiwTWrbfEuMXGybBM9J5V24BAZAesh22uHKETi4LzMTqcXCeDqJGtmzGYn5wvtZoU_95UczPBsFON1yIXIEC9_RoOix9VpsgdKz66bfyo" alt="A clean and modern overhead shot of a psychologist's desk" />
            </div>
          </div>
        </div>
      </section>
      <section className="py-xl bg-white">
        <div className="max-w-[1200px] mx-auto px-gutter text-center mb-lg">
          <h2 className="font-semibold text-[32px] leading-[1.3] tracking-[-0.01em] text-primary mb-xs">Recent Notes</h2>
          <p className="text-[16px] text-on-surface-variant">The latest curated resources for your psychological journey</p>
        </div>
        <div className="max-w-[1200px] mx-auto px-gutter grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
          {loading ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-4 text-center py-8">
              <span className="material-symbols-outlined animate-spin text-3xl text-secondary">progress_activity</span>
              <p className="mt-2 text-on-surface-variant">Loading recent notes...</p>
            </div>
          ) : recentNotes.length === 0 ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-4 text-center text-on-surface-variant py-8 bg-surface rounded-xl border border-outline-variant">
              No recent notes published yet.
            </div>
          ) : recentNotes.map(note => (
            <div key={note.id} className="bg-white border border-outline-variant p-md rounded-xl transition-all duration-300 ambient-shadow-hover flex flex-col h-full">
              <div className="mb-sm"><span className="bg-secondary-container text-[#005047] px-sm py-xs rounded-full text-xs font-medium truncate max-w-full inline-block">{getUnitName(note.unitId)}</span></div>
              <h3 className="font-semibold text-[20px] leading-[1.4] text-primary mb-sm line-clamp-2">{note.title}</h3>
              <p className="text-[14px] text-on-surface-variant mb-md flex-grow line-clamp-3">{note.description}</p>
              <div className="mt-auto"><Link to="/study-notes" className="block text-center border border-secondary text-secondary px-sm py-xs rounded-lg text-xs font-medium hover:bg-secondary-container transition-colors w-full">Access Note</Link></div>
            </div>
          ))}
        </div>
        <div className="max-w-[1200px] mx-auto px-gutter mt-8 text-center">
          <Link to="/study-notes" className="inline-block bg-primary text-white px-lg py-sm rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">View All Study Notes</Link>
        </div>
      </section>
      <section className="py-xl bg-surface">
        <div className="max-w-[1200px] mx-auto px-gutter grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="font-semibold text-[32px] leading-[1.3] text-primary mb-6">Frequently Asked Questions</h2>
            {faqs.length === 0 ? (
              <p className="text-on-surface-variant bg-white p-6 rounded-xl border border-outline-variant">No FAQs available yet.</p>
            ) : (
              <div className="space-y-4">
                {faqs.map(faq => (
                  <details key={faq.id} className="group bg-white border border-outline-variant rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex items-center justify-between p-4 font-bold text-primary cursor-pointer hover:bg-surface transition-colors">{faq.question}<span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span></summary>
                    <div className="p-4 pt-0 text-on-surface-variant border-t border-outline-variant mt-2 bg-surface"><p className="pt-2">{faq.answer}</p></div>
                  </details>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white p-8 rounded-2xl border border-outline-variant ambient-shadow">
            <h3 className="font-bold text-[24px] text-primary mb-2">Can't find your answer?</h3>
            <p className="text-on-surface-variant mb-6">Ask a general question here. Once answered by the Course Instructor, it will be added to the FAQs.</p>
            {submitMessage ? (
              <div className="bg-[#dcfce7] text-[#166534] p-4 rounded-lg font-medium flex items-center gap-2"><span className="material-symbols-outlined">check_circle</span>{submitMessage}</div>
            ) : (
              <form onSubmit={handleAskQuestion} className="space-y-4">
                <div><textarea placeholder="Type your question here..." className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all resize-none h-32" value={questionText} onChange={(e) => setQuestionText(e.target.value)} required></textarea></div>
                <button type="submit" disabled={isSubmitting} className="bg-secondary text-white px-6 py-3 rounded-lg font-bold w-full hover:bg-teal-700 transition-colors disabled:opacity-50">{isSubmitting ? 'Sending...' : 'Send Question'}</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
