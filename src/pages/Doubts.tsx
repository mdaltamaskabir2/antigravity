import { useState, useEffect } from 'react';
import { getSyllabusUnits, addDoubt, getMyDoubts, getCommunityDoubts } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Doubts() {
  const { currentUser, userProfile } = useAuth();
  const [units, setUnits] = useState<any[]>([]);
  const [selectedUnitForDoubt, setSelectedUnitForDoubt] = useState('');
  const [doubtText, setDoubtText] = useState('');
  const [doubtTarget, setDoubtTarget] = useState<'admin' | 'community'>('community');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentDoubts, setRecentDoubts] = useState<any[]>([]);
  const [feedType, setFeedType] = useState<'recent' | 'my'>('recent');

  useEffect(() => {
    async function fetchUnits() {
      const dbUnits = await getSyllabusUnits();
      setUnits(dbUnits);
    }
    fetchUnits();
    getCommunityDoubts().then(setRecentDoubts);
  }, []);

  useEffect(() => {
    if (feedType === 'my' && currentUser) {
      getMyDoubts(currentUser.id).then(setRecentDoubts);
    } else {
      getCommunityDoubts().then(setRecentDoubts);
    }
  }, [feedType, currentUser]);

  const handleAskDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmitting(true);
    await addDoubt({
      studentId: currentUser.id,
      studentName: userProfile?.name || 'Anonymous Student',
      question: doubtText,
      linkedUnitId: selectedUnitForDoubt,
      target: doubtTarget,
      answers: []
    });
    setIsSubmitting(false);
    setDoubtText('');
    alert(doubtTarget === 'admin' ? "Doubt submitted! The Course Instructor will review and answer it soon." : "Doubt posted to community!");
    if (feedType === 'my') {
      getMyDoubts(currentUser.id).then(setRecentDoubts);
    } else {
      getCommunityDoubts().then(setRecentDoubts);
    }
  };

  const getUnitName = (uId: string) => units.find(u => u.id === uId)?.title || 'General / No Unit';

  return (
    <main className="max-w-[1200px] mx-auto px-8 py-16 min-h-[calc(100vh-200px)]">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary tracking-tight mb-2">Ask a Doubt</h1>
        <p className="text-on-surface-variant text-lg">Clear your confusions with the community or get answers directly from the Course Instructor.</p>
      </div>
      <section className="bg-white border border-outline-variant rounded-xl p-6 ambient-shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">live_help</span> Submit a Question
            </h2>
            {currentUser ? (
              <form onSubmit={handleAskDoubt} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Related Unit (Optional)</label>
                    <select value={selectedUnitForDoubt} onChange={e => setSelectedUnitForDoubt(e.target.value)} className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface text-sm">
                      <option value="">General / None</option>
                      {units.map(u => (<option key={u.id} value={u.id}>{u.title}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-2">Ask who?</label>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="radio" name="doubtTarget" value="community" checked={doubtTarget === 'community'} onChange={() => setDoubtTarget('community')} className="accent-secondary" /> Community
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="radio" name="doubtTarget" value="admin" checked={doubtTarget === 'admin'} onChange={() => setDoubtTarget('admin')} className="accent-secondary" /> Course Instructor (Private)
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Your Question</label>
                  <textarea value={doubtText} onChange={e => setDoubtText(e.target.value)} required rows={4} placeholder="Describe what you are confused about..." className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface text-sm"></textarea>
                </div>
                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-secondary text-white px-8 py-2.5 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-opacity-90 disabled:opacity-50 text-sm shadow-md">
                    {isSubmitting ? (<><span className="material-symbols-outlined animate-spin text-[18px]">refresh</span> Submitting...</>) : (<><span className="material-symbols-outlined text-[18px]">send</span> Submit Doubt</>)}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-12 bg-surface rounded-xl border border-outline-variant">
                <p className="text-sm text-on-surface-variant mb-4">You need to be logged in to ask doubts.</p>
                <Link to="/auth" className="inline-flex bg-white border border-outline-variant text-primary px-6 py-2 rounded-lg font-bold items-center gap-2 hover:bg-surface-variant transition-all text-sm">
                  <span className="material-symbols-outlined text-[18px]">login</span> Login
                </Link>
              </div>
            )}
          </div>
          <div className="border-l border-outline-variant pl-0 md:pl-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-primary flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">history</span> Doubts Feed</h3>
              <div className="flex gap-2">
                <button onClick={() => setFeedType('recent')} className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${feedType === 'recent' ? 'bg-secondary text-white' : 'bg-surface border border-outline-variant text-on-surface-variant'}`}>Recent</button>
                <button onClick={() => setFeedType('my')} className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${feedType === 'my' ? 'bg-secondary text-white' : 'bg-surface border border-outline-variant text-on-surface-variant'}`}>My Doubts</button>
              </div>
            </div>
            {feedType === 'my' && !currentUser ? (
              <p className="text-sm text-on-surface-variant">Log in to view your previously asked doubts.</p>
            ) : recentDoubts.length === 0 ? (
              <p className="text-sm text-on-surface-variant italic">No doubts found.</p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {recentDoubts.map(doubt => (
                  <div key={doubt.id} className="bg-surface border border-outline-variant rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] uppercase font-bold text-[#157165] bg-[#c8e6c9] px-2 py-1 rounded border border-[#157165]/20 max-w-[150px] truncate">{getUnitName(doubt.linkedUnitId)}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${doubt.status === 'pending' ? 'bg-[#ffecb3] text-[#795548]' : 'bg-[#c8e6c9] text-[#2e7d32]'}`}>{doubt.status === 'pending' ? 'Pending' : 'Answered'}</span>
                    </div>
                    <p className="text-sm font-medium text-primary mb-2 whitespace-pre-wrap">{doubt.question}</p>
                    <span className="text-[10px] font-medium text-outline block mb-3">Asked by: {doubt.studentName} {doubt.target === 'admin' ? '(Private to Instructor)' : ''}</span>
                    {doubt.status === 'answered' && doubt.answer && (
                      <div className="mt-3 pt-3 border-t border-outline-variant">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block mb-1">Instructor Reply:</span>
                        <p className="text-xs text-on-surface-variant whitespace-pre-wrap">{doubt.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
