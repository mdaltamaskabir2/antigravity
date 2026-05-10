import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getQas, submitTransaction, getMyVerifiedTransactions, getSyllabusUnits } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import ReactMarkdown from 'react-markdown';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const SecurePdfViewer = ({ fileUrl, textContent, unitId, downloadEnabled = true }: { fileUrl: string, textContent?: string, unitId?: string, downloadEnabled?: boolean }) => {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [unitDoubts, setUnitDoubts] = useState<any[]>([]);

  useEffect(() => {
    if (unitId) {
      import('../lib/db').then(m => m.getAnsweredDoubtsByUnit(unitId)).then(setUnitDoubts);
    }
  }, [unitId]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void { setNumPages(numPages); }
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    try { const response = await fetch(fileUrl); const blob = await response.blob(); const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'Secure_Document.pdf'; document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); document.body.removeChild(a); } catch (err) { console.error("Download failed", err); window.open(fileUrl, '_blank'); }
  };
  const minSwipeDistance = 50;
  const onTouchStartEvent = (e: React.TouchEvent) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMoveEvent = (e: React.TouchEvent) => { setTouchEnd(e.targetTouches[0].clientX); };
  const onTouchEndEvent = () => { if (!touchStart || !touchEnd) return; const distance = touchStart - touchEnd; if (distance > minSwipeDistance && pageNumber < (numPages || 1)) setPageNumber(p => p + 1); if (distance < -minSwipeDistance && pageNumber > 1) setPageNumber(p => p - 1); };
  return (
    <div className="relative select-none w-full flex flex-col items-center custom-scrollbar" onContextMenu={(e) => e.preventDefault()} onTouchStart={onTouchStartEvent} onTouchMove={onTouchMoveEvent} onTouchEnd={onTouchEndEvent}>
      <div className="absolute inset-0 z-10 bg-transparent" />
      
      {textContent && (
        <div className="w-full max-w-4xl bg-white p-8 md:p-12 rounded-xl border border-outline-variant shadow-sm mb-12 z-20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 bg-secondary h-full opacity-50" />
          <div className="flex items-center gap-3 mb-8 border-b border-outline-variant pb-4">
            <span className="material-symbols-outlined text-secondary text-[32px]">article</span>
            <h2 className="text-3xl font-black text-primary tracking-tight">Q&A Detailed Context</h2>
          </div>
          <div className="prose prose-slate max-w-none prose-headings:text-primary prose-headings:font-bold prose-p:text-on-surface-variant prose-p:leading-relaxed prose-strong:text-primary">
            <ReactMarkdown>{textContent}</ReactMarkdown>
          </div>
        </div>
      )}

      {downloadEnabled && (<div className="z-30 mb-8"><button onClick={handleDownload} className="bg-[#157165] text-white px-8 py-4 rounded-xl font-bold shadow-xl flex items-center gap-3 hover:scale-105 transition-transform pointer-events-auto"><span className="material-symbols-outlined text-[24px]">download</span> <div className="text-left"><p className="text-[10px] uppercase tracking-widest opacity-80">Offline Access</p><p className="text-lg">Download PDF Q&A</p></div></button></div>)}
      
      <div className="bg-white p-4 rounded-xl shadow-2xl border border-outline-variant z-20 relative mb-16">
        <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess} loading={<span className="material-symbols-outlined animate-spin text-[32px] text-secondary">progress_activity</span>}>
          <Page pageNumber={pageNumber} renderTextLayer={false} renderAnnotationLayer={false} />
        </Document>
      </div>

      {unitDoubts.length > 0 && (
        <div className="w-full max-w-4xl px-4 pb-20 z-20">
          <div className="flex items-center gap-2 mb-6 border-b border-outline-variant pb-2">
            <span className="material-symbols-outlined text-secondary">forum</span>
            <h3 className="text-xl font-bold text-primary">Related Student Doubts</h3>
          </div>
          <div className="grid gap-4">
            {unitDoubts.map(doubt => (
              <div key={doubt.id} className="bg-surface p-4 rounded-lg border border-outline-variant/30 hover:border-secondary transition-colors">
                <p className="font-bold text-primary mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">question_mark</span>
                  {doubt.question}
                </p>
                {doubt.answers && doubt.answers.length > 0 && (
                  <div className="pl-6 border-l-2 border-secondary/20">
                    <p className="text-sm text-on-surface-variant italic">{doubt.answers[0].answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {numPages && numPages > 1 && (
        <div className="flex gap-4 mt-4 z-20 fixed bottom-8 bg-[#157165] text-white px-6 py-3 rounded-full shadow-2xl border border-white/20 flex items-center pointer-events-auto">
          <button disabled={pageNumber <= 1} onClick={() => setPageNumber(p => p - 1)} className="hover:scale-110 disabled:opacity-50 transition-transform"><span className="material-symbols-outlined">arrow_back_ios</span></button>
          <span className="font-mono font-bold tracking-widest">{pageNumber} <span className="opacity-50 mx-1">/</span> {numPages}</span>
          <button disabled={pageNumber >= numPages} onClick={() => setPageNumber(p => p + 1)} className="hover:scale-110 disabled:opacity-50 transition-transform"><span className="material-symbols-outlined">arrow_forward_ios</span></button>
        </div>
      )}
      <style>{`@media print { body { display: none !important; } }`}</style>
    </div>
  );
};

interface Qa { id: string; unitId: string; title: string; description: string; imageUrl?: string; price?: string; pdfLink?: string; freeContent?: string; isPremium?: boolean; }

export default function QA() {
  const [qas, setQas] = useState<Qa[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const unitParam = searchParams.get('unitId');
  const [selectedUnit, setSelectedUnit] = useState(unitParam || 'All');
  const { currentUser } = useAuth();
  const [verifiedQas, setVerifiedQas] = useState<Set<string>>(new Set());
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [isReadModalOpen, setIsReadModalOpen] = useState(false);
  const [selectedQaToRead, setSelectedQaToRead] = useState<Qa | null>(null);
  const [isSecurePdfModalOpen, setIsSecurePdfModalOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchedUnits = await getSyllabusUnits(); setUnits(fetchedUnits);
        const fetchedQas = await getQas(); setQas(fetchedQas as Qa[]);
        if (currentUser) { const vTx = await getMyVerifiedTransactions(currentUser.id); setVerifiedQas(new Set(vTx.map((t: any) => t.noteId))); }
      } catch (error) { console.error("Error fetching data:", error); } finally { setLoading(false); }
    }
    fetchData();
  }, [currentUser]);

  useEffect(() => { if (unitParam) setSelectedUnit(unitParam); }, [unitParam]);

  const availableUnitIds = Array.from(new Set(qas.map(n => n.unitId).filter(Boolean)));
  const filterUnits = units.filter(u => availableUnitIds.includes(u.id));
  const filteredQas = qas.filter(qa => {
    const matchesSearch = qa.title.toLowerCase().includes(searchTerm.toLowerCase()) || (qa.description && qa.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch && (selectedUnit === 'All' || qa.unitId === selectedUnit);
  });
  const getUnitName = (uId: string) => units.find(u => u.id === uId)?.title || 'Uncategorized';

  const handlePayment = async (qa: Qa) => {
    const options = { 
      key: "rzp_test_YOUR_KEY_HERE", 
      amount: (parseInt(qa.price || '49') * 100).toString(), 
      currency: "INR", name: "PsychWithKabir", 
      description: `Unlock ${qa.title}`,
      handler: async function (response: any) { 
        await submitTransaction({ 
          studentId: currentUser!.id, 
          studentName: userProfile?.name || 'Student', 
          studentEmail: currentUser!.email || '', 
          noteId: qa.id, 
          noteTitle: qa.title, 
          unitId: qa.unitId, 
          transactionId: response.razorpay_payment_id, 
          amount: qa.price || '49', 
          status: 'approved', // Instant access
          submittedAt: new Date().toISOString() 
        }); 
        alert(`Payment successful! ${qa.title} is now unlocked.`); 
        const vTx = await getMyVerifiedTransactions(currentUser!.id); 
        setVerifiedQas(new Set(vTx.map((t: any) => t.noteId))); 
      },
      prefill: { name: userProfile?.name || '', email: currentUser?.email || '' }, 
      theme: { color: "#157165" } 
    };
    const rzp1 = new (window as any).Razorpay(options); rzp1.open();
  };

  return (
    <main className="max-w-[1200px] mx-auto px-8 py-lg grid grid-cols-12 gap-gutter">
      <aside className="hidden lg:block col-span-3 h-fit sticky top-24 bg-slate-50 border border-outline-variant rounded-lg p-md">
        <h3 className="text-[24px] font-semibold text-primary mb-md">Syllabus Topics</h3>
        <ul className="space-y-sm">
          <li><button onClick={() => setSelectedUnit('All')} className={`w-full text-left flex items-center space-x-2 p-2 rounded-lg transition-colors text-sm font-medium ${selectedUnit === 'All' ? 'bg-secondary-container text-[#157165]' : 'hover:bg-surface-variant text-on-surface-variant'}`}><span className="material-symbols-outlined text-[20px]">dashboard</span><span>All Units</span></button></li>
          {filterUnits.map(unit => (<li key={unit.id}><button onClick={() => setSelectedUnit(unit.id)} className={`w-full text-left flex items-center space-x-2 p-2 rounded-lg transition-colors text-sm font-medium ${selectedUnit === unit.id ? 'bg-secondary-container text-[#157165]' : 'hover:bg-surface-variant text-on-surface-variant'}`}><span className="material-symbols-outlined text-[20px]">folder</span><span>{unit.title}</span></button></li>))}
        </ul>
      </aside>
      <section className="col-span-12 lg:col-span-9">
        <header className="mb-lg"><h1 className="text-[40px] font-bold text-primary mb-md">Unit Q&A</h1><div className="flex flex-col md:flex-row md:items-center gap-sm"><div className="relative flex-grow"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span><input className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-medium" placeholder="Search topics, theories, or keywords..." type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div></div></header>
        {loading ? (<div className="text-center py-xl"><span className="material-symbols-outlined animate-spin text-4xl text-secondary">progress_activity</span></div>
        ) : filteredQas.length === 0 ? (<div className="text-center py-xl text-on-surface-variant bg-surface rounded-xl border border-outline-variant"><p>No Q&A found for this unit or search term.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {filteredQas.map(qa => (
              <article key={qa.id} className="bg-white border border-outline-variant rounded-lg overflow-hidden flex flex-col ambient-shadow transition-all group">
                {(qa.imageUrl && !imageErrors[qa.id]) ? (<div className="h-40 overflow-hidden bg-surface-variant flex-shrink-0"><img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={qa.imageUrl} alt={qa.title} onError={() => setImageErrors(prev => ({ ...prev, [qa.id]: true }))} /></div>) : (<div className="h-32 bg-gradient-to-br from-primary-container to-[#d3e3fd] flex items-center justify-center p-4 flex-shrink-0"><span className="material-symbols-outlined text-[48px] text-primary opacity-20">library_books</span></div>)}
                <div className="p-md flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-xs"><span className="text-[12px] font-bold text-secondary tracking-widest uppercase truncate ml-1">{getUnitName(qa.unitId)}</span><span className="material-symbols-outlined text-outline">bookmark</span></div>
                  <h2 className="text-[24px] font-semibold text-primary mb-sm">{qa.title}</h2>
                  <p className="text-[16px] text-on-surface-variant mb-md line-clamp-3 flex-grow">{qa.description}</p>
                  {qa.freeContent && (<div className="mb-4 bg-surface p-3 rounded border border-outline-variant/30 text-sm font-mono text-on-surface-variant line-clamp-3">{qa.freeContent}</div>)}
                  <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-outline-variant">
                    {qa.isPremium ? (<>
                      <div className="flex justify-between items-center mb-1"><span className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary-container px-2 py-0.5 rounded flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">stars</span> Premium Resource</span></div>
                      {currentUser ? (verifiedQas.has(qa.id) ? (<div className="flex flex-col gap-2 w-full">
                        {qa.freeContent && (<button onClick={() => { setSelectedQaToRead(qa); setIsReadModalOpen(true); }} className="w-full py-2 bg-surface text-secondary text-sm font-bold rounded border border-secondary hover:bg-secondary hover:text-white transition-colors flex items-center justify-center space-x-2"><span className="material-symbols-outlined text-[18px]">visibility</span><span>View Text Q&A</span></button>)}
                        {qa.pdfLink && (<button onClick={() => { setSelectedPdfUrl(qa.pdfLink!); setIsSecurePdfModalOpen(true); }} className="w-full py-2 bg-[#157165] text-white text-sm font-medium rounded hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"><span className="material-symbols-outlined text-[18px]">visibility</span><span>View PDF Q&A</span></button>)}
                      </div>) : (<div className="flex flex-col gap-2 w-full">
                        {qa.freeContent && (<button onClick={() => { setSelectedQaToRead(qa); setIsReadModalOpen(true); }} className="w-full py-2 bg-surface text-secondary text-sm font-bold rounded border border-secondary hover:bg-secondary hover:text-white transition-colors flex items-center justify-center space-x-2"><span className="material-symbols-outlined text-[18px]">visibility</span><span>View Text Q&A</span></button>)}
                        <button onClick={() => handlePayment(qa)} className="w-full py-2 bg-secondary text-white text-sm font-bold rounded hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"><span className="material-symbols-outlined text-[18px]">currency_rupee</span><span>Unlock Now (₹{qa.price || '49'})</span></button>
                      </div>)) : (<Link to="/auth" className="w-full py-2 bg-surface-dim text-on-surface-variant text-sm font-medium rounded hover:bg-outline-variant transition-colors flex items-center justify-center space-x-2 border border-outline-variant"><span className="material-symbols-outlined text-[18px]">lock</span><span>Login to Access</span></Link>)}
                    </>) : (<>
                      <div className="flex justify-between items-center mb-1"><span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Free Resource</span></div>
                      <div className="flex flex-col gap-2 w-full">
                        {qa.freeContent && (<button onClick={() => { setSelectedQaToRead(qa); setIsReadModalOpen(true); }} className="w-full py-2 bg-surface text-secondary text-sm font-bold rounded border border-secondary hover:bg-secondary hover:text-white transition-colors flex items-center justify-center space-x-2"><span className="material-symbols-outlined text-[18px]">visibility</span><span>View Text Q&A</span></button>)}
                        {qa.pdfLink && (<button onClick={() => { setSelectedPdfUrl(qa.pdfLink!); setIsSecurePdfModalOpen(true); }} className="w-full py-2 bg-[#157165] text-white text-sm font-medium rounded hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"><span className="material-symbols-outlined text-[18px]">visibility</span><span>View PDF Q&A</span></button>)}
                      </div>
                    </>)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      {isReadModalOpen && selectedQaToRead && createPortal(<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"><div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto ambient-shadow border border-outline-variant flex flex-col"><div className="flex justify-between items-center mb-4 pb-4 border-b border-outline-variant"><h2 className="text-2xl font-bold text-primary">{selectedQaToRead.title}</h2><button onClick={() => setIsReadModalOpen(false)} className="text-on-surface-variant hover:text-error"><span className="material-symbols-outlined">close</span></button></div><div className="prose prose-sm md:prose-base max-w-none text-on-surface whitespace-pre-wrap flex-grow">{selectedQaToRead.freeContent ? (<ReactMarkdown>{selectedQaToRead.freeContent}</ReactMarkdown>) : "No content available."}</div></div></div>, document.body)}
      {isSecurePdfModalOpen && selectedPdfUrl && createPortal(<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"><div className="bg-surface rounded-2xl w-full max-w-5xl h-[95vh] flex flex-col overflow-hidden relative border border-outline-variant/30 shadow-2xl"><div className="flex justify-between items-center px-6 py-4 bg-primary border-b border-outline-variant"><div className="flex items-center gap-2"><span className="material-symbols-outlined text-white text-[24px]">shield_lock</span><h2 className="text-xl font-bold text-white tracking-widest uppercase">Secure Viewer</h2></div><button onClick={() => setIsSecurePdfModalOpen(false)} className="text-white hover:text-error transition-colors bg-white/10 p-2 rounded-full"><span className="material-symbols-outlined">close</span></button></div><div className="flex-1 overflow-auto bg-[#1a1c1e] flex justify-center items-start pt-8 pb-16"><SecurePdfViewer fileUrl={selectedPdfUrl} textContent={qas.find(q => q.pdfLink === selectedPdfUrl)?.freeContent} unitId={qas.find(q => q.pdfLink === selectedPdfUrl)?.unitId} /></div></div></div>, document.body)}
    </main>
  );
}
