
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import Cropper from 'react-easy-crop';
import {
  addSyllabusUnit, getSyllabusUnits, updateSyllabusUnit, deleteSyllabusUnit,
  addNote, addLecture, getLectures, updateLecture, deleteLecture,
  getSiteSettings, updateSiteSettings,
  getAboutAuthor, updateAboutAuthor,
  addFaq, updateFaq, deleteFaq, getFaqs,
  getAllAdminDoubts, answerDoubt, deleteDoubt, updateDoubt, getCommunityDoubts,
  getPendingTransactions, updateTransactionStatus, uploadFile, getNotes, updateNote, deleteNote,
  getQas, addQa, updateQa, deleteQa
} from '../lib/db';

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Data States
  const [units, setUnits] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [lectures, setLectures] = useState<any[]>([]);
  const [qas, setQas] = useState<any[]>([]);
  const [doubts, setDoubts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [communityDoubts, setCommunityDoubts] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>({ linkedin: '', youtube: '', privacyPolicy: '', termsOfService: '', contactUs: '' });
  const [aboutAuthorData, setAboutAuthorData] = useState<any>({ name: '', title: '', bio: '', profilePic: '', email: '' });
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);

  // Crop states
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Form States
  const [newUnit, setNewUnit] = useState({ id: '', title: '', description: '' });
  const [newNote, setNewNote] = useState({ id: '', title: '', unitId: '', description: '', freeContent: '', qaFreeContent: '', imageUrl: '', isPremium: false, price: 'Free', paymentLink: '', qaPdfLink: '' });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [newLecture, setNewLecture] = useState({ id: '', title: '', unitId: '', description: '', videoUrl: '' });
  const [videoSource, setVideoSource] = useState<'youtube' | 'upload'>('youtube');
  const [newQa, setNewQa] = useState({ id: '', title: '', unitId: '', description: '', freeContent: '', pdfLink: '', isPremium: false, price: 'Free' });
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const [doubtAnswers, setDoubtAnswers] = useState<Record<string, string>>({});
  const [faqAnswers, setFaqAnswers] = useState<Record<string, string>>({});

  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const fetchedUnits = await getSyllabusUnits();
      setUnits(fetchedUnits);

      const fetchedNotes = await getNotes();
      setNotes(fetchedNotes);

      const fetchedLectures = await getLectures();
      setLectures(fetchedLectures);

      const fetchedQas = await getQas();
      setQas(fetchedQas);

      const settings = await getSiteSettings();
      if (settings) setSiteSettings(settings);

      const authorData = await getAboutAuthor();
      if (authorData) setAboutAuthorData(authorData);

      const allAdminDoubts = await getAllAdminDoubts();
      setDoubts(allAdminDoubts);

      const dbFaqs = await getFaqs();
      setFaqs(dbFaqs);

      const pendingTx = await getPendingTransactions();
      setTransactions(pendingTx);

      const commDoubts = await getCommunityDoubts();
      setCommunityDoubts(commDoubts);
    } catch (error) {
      console.error("fetchData error:", error);
    }
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  // Handlers
  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUnit.id) {
      await updateSyllabusUnit(newUnit.id, { title: newUnit.title, description: newUnit.description });
      showMessage('Unit updated.');
    } else {
      await addSyllabusUnit({ title: newUnit.title, description: newUnit.description });
      showMessage('Unit added.');
    }
    setNewUnit({ id: '', title: '', description: '' });
    fetchData();
  };

  const handleEditUnit = (unit: any) => {
    setNewUnit({ id: unit.id, title: unit.title, description: unit.description });
  };

  const handleDeleteUnit = async (unitId: string) => {
    await deleteSyllabusUnit(unitId);
    showMessage('Unit deleted.');
    fetchData();
  };

  const handleCancelEditUnit = () => {
    setNewUnit({ id: '', title: '', description: '' });
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const noteData = {
      title: newNote.title, unitId: newNote.unitId, description: newNote.description,
      freeContent: newNote.freeContent, qaFreeContent: newNote.qaFreeContent,
      imageUrl: newNote.imageUrl, isPremium: newNote.isPremium, price: newNote.price,
      paymentLink: newNote.paymentLink, qaPdfLink: newNote.qaPdfLink
    };
    if (newNote.id) {
      await updateNote(newNote.id, noteData);
      showMessage('Note updated.');
    } else {
      await addNote(noteData);
      showMessage('Note published.');
    }
    setNewNote({ id: '', title: '', unitId: '', description: '', freeContent: '', qaFreeContent: '', imageUrl: '', isPremium: false, price: 'Free', paymentLink: '', qaPdfLink: '' });
    fetchData();
  };

  const handleEditNote = (note: any) => {
    setNewNote({
      id: note.id,
      title: note.title,
      unitId: note.unitId || '',
      description: note.description || '',
      freeContent: note.freeContent || '',
      qaFreeContent: note.qaFreeContent || '',
      imageUrl: note.imageUrl || '',
      isPremium: note.isPremium || false,
      price: note.price || 'Free',
      paymentLink: note.paymentLink || '',
      qaPdfLink: note.qaPdfLink || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditNote = () => {
    setNewNote({ id: '', title: '', unitId: '', description: '', freeContent: '', qaFreeContent: '', imageUrl: '', isPremium: false, price: 'Free', paymentLink: '', qaPdfLink: '' });
  };

  const handleDeleteNote = async (noteId: string) => {
    await deleteNote(noteId);
    showMessage('Note deleted.');
    fetchData();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isQaPdf: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1000000) {
      showMessage("File is too large (>1MB). Please compress it first or use a smaller file.");
      return;
    }

    setUploadingFile(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isQaPdf) {
          setNewNote(prev => ({ ...prev, qaPdfLink: base64String }));
        } else {
          setNewNote(prev => ({ ...prev, paymentLink: base64String }));
        }
        showMessage('File attached successfully.');
        setUploadingFile(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      showMessage(`Upload failed: ${error.message}`);
      setUploadingFile(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1000000) {
      showMessage("Image is too large (>1MB).");
      return;
    }

    setUploadingFile(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewNote(prev => ({ ...prev, imageUrl: reader.result as string }));
        showMessage('Image attached.');
        setUploadingFile(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      showMessage(`Image upload failed: ${error.message}`);
      setUploadingFile(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const url = await uploadFile(file, `lectures/${Date.now()}_${file.name}`);
      setNewLecture(prev => ({ ...prev, videoUrl: url }));
      showMessage('Video uploaded to storage.');
    } catch (error: any) {
      showMessage(`Video upload failed: ${error.message}`);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleAddLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newLecture.id) {
      await updateLecture(newLecture.id, newLecture);
      showMessage('Lecture updated.');
    } else {
      await addLecture(newLecture);
      showMessage('Lecture published.');
    }
    setNewLecture({ id: '', title: '', unitId: '', description: '', videoUrl: '' });
    fetchData();
  };

  const handleEditLecture = (lecture: any) => {
    setNewLecture({
      id: lecture.id,
      title: lecture.title,
      unitId: lecture.unitId || '',
      description: lecture.description || '',
      videoUrl: lecture.videoUrl || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteLecture = async (lectureId: string) => {
    await deleteLecture(lectureId);
    showMessage('Lecture deleted.');
    fetchData();
  };

  const handleSaveQa = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingFile(true);
    try {
      const qaData = {
        title: newQa.title, unitId: newQa.unitId, description: newQa.description,
        freeContent: newQa.freeContent, pdfLink: newQa.pdfLink,
        isPremium: newQa.isPremium, price: newQa.price
      };
      if (newQa.id) {
        await updateQa(newQa.id, qaData);
        showMessage('Q&A updated successfully.');
      } else {
        await addQa(qaData);
        showMessage('Q&A published successfully.');
      }
      setNewQa({ id: '', title: '', unitId: '', description: '', freeContent: '', pdfLink: '', isPremium: false, price: 'Free' });
      fetchData();
    } catch (error: any) {
      console.error("Q&A Save Error:", error);
      showMessage(`Failed to save Q&A: ${error.message || 'Unknown error'}`);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleEditQa = (qa: any) => {
    setNewQa({
      id: qa.id,
      title: qa.title,
      unitId: qa.unitId || '',
      description: qa.description || '',
      freeContent: qa.freeContent || '',
      pdfLink: qa.pdfLink || '',
      isPremium: qa.isPremium || false,
      price: qa.price || 'Free'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteQa = async (qaId: string) => {
    await deleteQa(qaId);
    showMessage('Q&A deleted.');
    fetchData();
  };

  const handleQaFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1000000) {
      showMessage("PDF is too large (>1MB).");
      return;
    }

    setUploadingFile(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewQa(prev => ({ ...prev, pdfLink: reader.result as string }));
        showMessage('Q&A PDF attached.');
        setUploadingFile(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      showMessage(`Upload failed: ${error.message}`);
      setUploadingFile(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSiteSettings(siteSettings);
    showMessage('Settings updated.');
  };

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((newFaq as any).id) {
      await updateFaq((newFaq as any).id, { question: newFaq.question, answer: newFaq.answer });
      showMessage('FAQ updated.');
    } else {
      await addFaq(newFaq);
      showMessage('FAQ added.');
    }
    setNewFaq({ question: '', answer: '' });
    fetchData();
  };

  const handleEditFaq = (faq: any) => {
    setNewFaq({ id: faq.id, question: faq.question, answer: faq.answer } as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteFaq = async (faqId: string) => {
    await deleteFaq(faqId);
    showMessage('FAQ deleted.');
    fetchData();
  };

  const handleEditDoubt = (doubt: any) => {
    // For doubts, we just set the answer in doubtAnswers
    setDoubtAnswers(prev => ({ ...prev, [doubt.id]: doubt.answer || '' }));
  };

  const handleUpdateDoubtContent = async (doubtId: string, newQuestion: string, newAnswer: string) => {
    await updateDoubt(doubtId, { question: newQuestion, answer: newAnswer });
    showMessage('Doubt updated.');
    fetchData();
  };

  const handleAnswerDoubt = async (doubtId: string) => {
    const answer = doubtAnswers[doubtId];
    if (!answer) return;
    await answerDoubt(doubtId, answer);
    showMessage('Doubt answered.');
    fetchData(); // refresh doubts
  };

  const handleDeleteDoubt = async (doubtId: string) => {
    await deleteDoubt(doubtId);
    showMessage('Doubt deleted.');
    fetchData();
  };

  const handleVerifyTransaction = async (txId: string, status: 'approved' | 'rejected') => {
    await updateTransactionStatus(txId, status);
    showMessage(`Payment ${status}.`);
    fetchData();
  };

  return (
    <>
      <div className="flex min-h-screen w-full">
      {/* SideNavBar */}
      <aside className="hidden lg:flex flex-col p-4 space-y-2 h-fullscreen w-64 border-r border-outline-variant bg-surface">
        <div className="mb-8 px-2">
          <h1 className="text-lg font-black text-secondary">Instructor Panel</h1>
          <p className="text-[12px] text-on-surface-variant">PsychWithKabir Management</p>
        </div>
        <nav className="space-y-1">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-secondary-container text-[#157165]' : 'text-on-surface-variant hover:bg-surface-dim'}`}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-[14px]">Dashboard</span>
          </button>
          <button onClick={() => setActiveTab('units')} className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-lg transition-all ${activeTab === 'units' ? 'bg-secondary-container text-[#157165]' : 'text-on-surface-variant hover:bg-surface-dim'}`}>
            <span className="material-symbols-outlined">chrome_reader_mode</span>
            <span className="text-[14px]">Syllabus Units</span>
          </button>
          <button onClick={() => setActiveTab('notes')} className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-lg transition-all ${activeTab === 'notes' ? 'bg-secondary-container text-[#157165]' : 'text-on-surface-variant hover:bg-surface-dim'}`}>
            <span className="material-symbols-outlined">description</span>
            <span className="text-[14px]">Study Notes</span>
          </button>
          <button onClick={() => setActiveTab('lectures')} className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-lg transition-all ${activeTab === 'lectures' ? 'bg-secondary-container text-[#157165]' : 'text-on-surface-variant hover:bg-surface-dim'}`}>
            <span className="material-symbols-outlined">video_library</span>
            <span className="text-[14px]">Video Lectures</span>
          </button>
          <button onClick={() => setActiveTab('qas')} className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-lg transition-all ${activeTab === 'qas' ? 'bg-secondary-container text-[#157165]' : 'text-on-surface-variant hover:bg-surface-dim'}`}>
            <span className="material-symbols-outlined">menu_book</span>
            <span className="text-[14px]">Unit Q&A</span>
          </button>
          <button onClick={() => setActiveTab('doubts')} className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-lg transition-all ${activeTab === 'doubts' ? 'bg-secondary-container text-[#157165]' : 'text-on-surface-variant hover:bg-surface-dim'}`}>
            <span className="material-symbols-outlined">quiz</span>
            <span className="text-[14px]">Doubts Inbox</span>
          </button>
          <button onClick={() => setActiveTab('faqs')} className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-lg transition-all ${activeTab === 'faqs' ? 'bg-secondary-container text-[#157165]' : 'text-on-surface-variant hover:bg-surface-dim'}`}>
            <span className="material-symbols-outlined">forum</span>
            <span className="text-[14px]">FAQ Manager</span>
          </button>
          <button onClick={() => setActiveTab('about_author')} className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-lg transition-all ${activeTab === 'about_author' ? 'bg-secondary-container text-[#157165]' : 'text-on-surface-variant hover:bg-surface-dim'}`}>
            <span className="material-symbols-outlined">person</span>
            <span className="text-[14px]">About Author</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-lg transition-all ${activeTab === 'settings' ? 'bg-secondary-container text-[#157165]' : 'text-on-surface-variant hover:bg-surface-dim'}`}>
            <span className="material-symbols-outlined">settings</span>
            <span className="text-[14px]">Site Settings</span>
          </button>
          <Link to="/" className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-lg transition-all text-on-surface-variant hover:bg-surface-dim`}>
            <span className="material-symbols-outlined">visibility</span>
            <span className="text-[14px]">Student View</span>
          </Link>
        </nav>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <header className="sticky top-0 z-40 flex justify-between items-center px-8 h-16 w-full bg-white border-b border-outline-variant">
          <div className="flex items-center gap-4">
            <span className="lg:hidden material-symbols-outlined">menu</span>
            <span className="text-xl font-bold text-primary">Course Instructor</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-3 py-1.5 bg-surface-container rounded-full border border-outline-variant cursor-pointer" onClick={() => supabase.auth.signOut()}>
              <div className="flex flex-col">
                <span className="text-[14px] font-medium text-primary">Instructor</span>
                <span className="text-[12px] text-on-surface-variant">Sign Out</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-[1200px] w-full mx-auto space-y-8">
          {message && (
            <div className="bg-[#a1f2e2] text-[#157165] p-3 rounded-lg font-medium border border-secondary-container">
              {message}
            </div>
          )}

          {activeTab === 'dashboard' && (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-full mb-2">
                <h2 className="text-2xl font-bold text-primary">Pending Tasks</h2>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-outline-variant ambient-shadow flex flex-col justify-between cursor-pointer hover:border-secondary transition-colors" onClick={() => setActiveTab('doubts')}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[14px] font-medium text-on-surface-variant">Pending Doubts</p>
                    <h2 className="text-[32px] font-semibold text-[#93000a]">{doubts.filter(d => d.status === 'pending').length}</h2>
                  </div>
                  <div className="bg-[#ffdad6] p-3 rounded-xl">
                    <span className="material-symbols-outlined text-[#93000a]">contact_support</span>
                  </div>
                </div>
                <div className="text-sm font-bold text-secondary flex items-center gap-1">
                  Manage Doubts <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-outline-variant ambient-shadow flex flex-col justify-between cursor-pointer hover:border-secondary transition-colors" onClick={() => setActiveTab('faqs')}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[14px] font-medium text-on-surface-variant">Published FAQs</p>
                    <h2 className="text-[32px] font-semibold text-[#157165]">{faqs.filter(f => f.status === 'published' || !f.status).length}</h2>
                  </div>
                  <div className="bg-secondary-container p-3 rounded-xl">
                    <span className="material-symbols-outlined text-[#157165]">forum</span>
                  </div>
                </div>
                <div className="text-sm font-bold text-secondary flex items-center gap-1">
                  Manage FAQs <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-outline-variant ambient-shadow flex flex-col justify-between cursor-pointer hover:border-secondary transition-colors" onClick={() => setActiveTab('faqs')}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[14px] font-medium text-on-surface-variant">Pending FAQs</p>
                    <h2 className="text-[32px] font-semibold text-[#93000a]">{faqs.filter(f => f.status === 'pending').length}</h2>
                  </div>
                  <div className="bg-[#ffdad6] p-3 rounded-xl">
                    <span className="material-symbols-outlined text-[#93000a]">question_answer</span>
                  </div>
                </div>
                <div className="text-sm font-bold text-secondary flex items-center gap-1">
                  Answer FAQs <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'units' && (
            <section className="bg-white rounded-lg border border-outline-variant ambient-shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[24px] font-semibold text-primary">{newUnit.id ? 'Edit Syllabus Unit' : 'Add Syllabus Unit'}</h3>
                {newUnit.id && (
                  <button type="button" onClick={handleCancelEditUnit} className="text-secondary font-bold text-sm hover:underline">
                    Cancel Editing
                  </button>
                )}
              </div>
              <form className="space-y-4" onSubmit={handleSaveUnit}>
                <div>
                  <label className="text-[14px] font-medium text-on-surface-variant">Unit Title</label>
                  <input value={newUnit.title} onChange={e => setNewUnit({ ...newUnit, title: e.target.value })} required className="w-full px-4 py-2 border border-outline-variant rounded bg-white mt-1" placeholder="e.g. Unit 1: Introduction" type="text" />
                </div>
                <div>
                  <label className="text-[14px] font-medium text-on-surface-variant">Description</label>
                  <textarea value={newUnit.description} onChange={e => setNewUnit({ ...newUnit, description: e.target.value })} required className="w-full px-4 py-2 border border-outline-variant rounded bg-white mt-1" rows={3}></textarea>
                </div>
                <button className="bg-secondary text-white px-6 py-2 rounded-lg font-bold text-[14px]" type="submit">{newUnit.id ? 'Save Changes' : 'Add Unit'}</button>
              </form>

              <div className="mt-8">
                <h4 className="font-semibold text-primary mb-2">Existing Units</h4>
                <ul className="space-y-2">
                  {units.map(u => (
                    <li key={u.id} className="p-3 bg-surface border border-outline-variant rounded flex justify-between items-center gap-4">
                      <div>
                        <span className="font-medium text-primary block">{u.title}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditUnit(u)} className="text-[#157165] font-bold hover:underline flex items-center gap-1 text-sm">
                          <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                        </button>
                        <button onClick={() => handleDeleteUnit(u.id)} className="text-error font-bold hover:underline flex items-center gap-1 text-sm">
                          <span className="material-symbols-outlined text-[16px]">delete</span> Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-8">
              <section className="bg-white rounded-lg border border-outline-variant ambient-shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[24px] font-semibold text-primary">{newNote.id ? 'Edit Study Note' : 'Publish Study Note'}</h3>
                  {newNote.id && (
                    <button type="button" onClick={handleCancelEditNote} className="text-secondary font-bold text-sm hover:underline">
                      Cancel Editing
                    </button>
                  )}
                </div>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSaveNote}>
                  <div>
                    <label className="text-[14px] font-medium text-on-surface-variant">Unit</label>
                    <select value={newNote.unitId} onChange={e => setNewNote({ ...newNote, unitId: e.target.value })} required className="w-full px-4 py-2 border border-outline-variant rounded bg-white mt-1">
                      <option value="">Select Unit</option>
                      {units.map(u => <option key={u.id} value={u.id}>{u.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[14px] font-medium text-on-surface-variant">Title</label>
                    <input value={newNote.title} onChange={e => setNewNote({ ...newNote, title: e.target.value })} required className="w-full px-4 py-2 border border-outline-variant rounded bg-white mt-1" type="text" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[14px] font-medium text-on-surface-variant mb-1 block">Cover Image (Upload)</label>
                    <div className="flex items-center gap-4">
                      <label className="relative cursor-pointer bg-[#157165] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#105a50] transition-colors flex items-center gap-2 shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">imagesmode</span>
                        <span>Choose Image</span>
                        <input
                          type="file"
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onClick={(e) => (e.target as any).value = null}
                        />
                      </label>
                      {newNote.imageUrl && <span className="text-xs text-secondary truncate max-w-[200px] bg-secondary-container px-2 py-1 rounded">Image attached</span>}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[14px] font-medium text-on-surface-variant">Short Description</label>
                    <textarea value={newNote.description} onChange={e => setNewNote({ ...newNote, description: e.target.value })} className="w-full px-4 py-2 border border-outline-variant rounded bg-white mt-1" rows={2}></textarea>
                  </div>
                  <div className="md:col-span-2 border p-6 rounded-xl bg-surface-container/30 border-outline-variant">
                    <label className="block text-sm font-bold text-primary mb-4 uppercase tracking-widest text-[11px]">Note Access Type</label>
                    <div className="flex bg-surface-dim p-1 rounded-lg w-fit mb-6 border border-outline-variant shadow-inner">
                      <button
                        type="button"
                        onClick={() => setNewNote({ ...newNote, isPremium: false, price: 'Free' })}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${!newNote.isPremium ? 'bg-white text-[#157165] shadow-sm' : 'text-on-surface-variant hover:bg-surface-variant/50'}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">lock_open</span>
                        Free Content
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewNote({ ...newNote, isPremium: true, price: newNote.price === 'Free' ? '₹499' : newNote.price })}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${newNote.isPremium ? 'bg-secondary text-white shadow-md' : 'text-on-surface-variant hover:bg-surface-variant/50'}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">stars</span>
                        Premium Content
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                      {newNote.isPremium && (
                        <div>
                          <label className="text-[12px] font-bold text-on-surface-variant block mb-1">Set Price for Reference</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
                            <input
                              value={newNote.price.replace('₹', '')}
                              onChange={e => setNewNote({ ...newNote, price: `₹${e.target.value}` })}
                              placeholder="e.g. 499"
                              className="w-full pl-7 pr-3 py-2 border border-outline-variant rounded bg-white font-bold text-primary focus:ring-2 focus:ring-secondary outline-none"
                            />
                          </div>
                        </div>
                      )}
                      <div className={newNote.isPremium ? "" : "md:col-span-2"}>
                        <label className="text-[12px] font-bold text-on-surface-variant block mb-1">PDF / File Attachment (Secure Link)</label>
                        <div className="flex items-center gap-3">
                          <label className="relative cursor-pointer bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-md">
                            <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                            <span>Upload Document</span>
                            <input
                              type="file"
                              onChange={handleFileUpload}
                              accept=".pdf,image/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onClick={(e) => (e.target as any).value = null}
                            />
                          </label>
                          {uploadingFile && <span className="text-xs text-secondary animate-pulse font-bold flex items-center gap-1"><span className="material-symbols-outlined animate-spin text-[14px]">refresh</span> Processing...</span>}
                          {newNote.paymentLink && !uploadingFile && (
                            <div className="flex items-center gap-2 bg-[#157165]/10 px-3 py-2 rounded-lg border border-[#157165]/20">
                              <span className="material-symbols-outlined text-[#157165] text-[18px]">task_alt</span>
                              <span className="text-xs text-[#157165] font-bold">File Ready</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[14px] font-medium text-on-surface-variant">Free Content (Markdown/Text)</label>
                    <textarea value={newNote.freeContent} onChange={e => setNewNote({ ...newNote, freeContent: e.target.value })} className="w-full px-4 py-2 border border-outline-variant rounded bg-white mt-1 font-mono text-sm" rows={5}></textarea>
                  </div>
                  <div className="md:col-span-2 border-t border-outline-variant pt-4 mt-4">
                    <h4 className="text-sm font-bold text-primary mb-3">Q&A PDF Bundling (Unlocked automatically with Note)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[14px] font-medium text-on-surface-variant mb-1 block">Q&A PDF Attachment</label>
                        <div className="flex items-center gap-3">
                          <label className="relative cursor-pointer bg-secondary text-white px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-md">
                            <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                            <span>Upload Q&A PDF</span>
                            <input 
                              type="file" 
                              onChange={(e) => handleFileUpload(e, true)} 
                              accept=".pdf,image/*" 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                              onClick={(e) => (e.target as any).value = null}
                            />
                          </label>
                          {newNote.qaPdfLink && !uploadingFile && (
                            <div className="flex items-center gap-2 bg-[#157165]/10 px-3 py-2 rounded-lg border border-[#157165]/20">
                              <span className="material-symbols-outlined text-[#157165] text-[18px]">task_alt</span>
                              <span className="text-xs text-[#157165] font-bold">Q&A PDF Ready</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-[14px] font-medium text-on-surface-variant">Q&A Free Content (Markdown/Text)</label>
                        <textarea value={newNote.qaFreeContent} onChange={e=>setNewNote({...newNote, qaFreeContent: e.target.value})} className="w-full px-4 py-2 border border-outline-variant rounded bg-white mt-1 font-mono text-sm" rows={3}></textarea>
                      </div>
                    </div>
                  </div>
                  <button className="md:col-span-2 bg-secondary text-white px-6 py-2 rounded-lg font-bold text-[14px]" type="submit">{newNote.id ? 'Save Changes' : 'Publish Note'}</button>
                </form>
              </section>

              <section className="bg-white rounded-lg border border-outline-variant ambient-shadow p-6">
                <h3 className="text-[20px] font-semibold text-primary mb-4">Existing Notes</h3>
                {notes.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">No notes published yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-outline-variant bg-surface text-on-surface-variant">
                          <th className="p-3 font-semibold">Title</th>
                          <th className="p-3 font-semibold">Unit</th>
                          <th className="p-3 font-semibold">Type</th>
                          <th className="p-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notes.map(note => (
                          <tr key={note.id} className="border-b border-outline-variant hover:bg-surface-dim">
                            <td className="p-3 font-medium text-primary">{note.title}</td>
                            <td className="p-3">{units.find(u => u.id === note.unitId)?.title || 'No Unit'}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${note.isPremium ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-[#c8e6c9] text-[#2e7d32]'}`}>
                                {note.isPremium ? 'Premium' : 'Free'}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex gap-3">
                                <button onClick={() => handleEditNote(note)} className="text-[#157165] font-bold hover:underline flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                                </button>
                                <button onClick={() => handleDeleteNote(note.id)} className="text-error font-bold hover:underline flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[16px]">delete</span> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === 'lectures' && (
            <div className="space-y-8">
              <section className="bg-white rounded-lg border border-outline-variant ambient-shadow p-6">
                <h3 className="text-[24px] font-semibold text-primary mb-4">Publish Video Lecture</h3>
                <form className="space-y-4" onSubmit={handleAddLecture}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[14px] font-medium text-on-surface-variant">Unit</label>
                      <select value={newLecture.unitId} onChange={e => setNewLecture({ ...newLecture, unitId: e.target.value })} required className="w-full px-4 py-2 border border-outline-variant rounded bg-white mt-1">
                        <option value="">Select Unit</option>
                        {units.map(u => <option key={u.id} value={u.id}>{u.title}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[14px] font-medium text-on-surface-variant">Title</label>
                      <input value={newLecture.title} onChange={e => setNewLecture({ ...newLecture, title: e.target.value })} required className="w-full px-4 py-2 border border-outline-variant rounded bg-white mt-1" type="text" />
                    </div>
                  </div>
                  <div className="flex gap-4 mb-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" value="youtube" checked={videoSource === 'youtube'} onChange={() => setVideoSource('youtube')} />
                      <span className="text-sm font-medium">YouTube URL</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" value="upload" checked={videoSource === 'upload'} onChange={() => setVideoSource('upload')} />
                      <span className="text-sm font-medium">Video File Upload</span>
                    </label>
                  </div>
                  {videoSource === 'youtube' ? (
                    <div>
                      <label className="text-[14px] font-medium text-on-surface-variant">YouTube Embedded Link (e.g., https://www.youtube.com/embed/VIDEO_ID)</label>
                      <input value={newLecture.videoUrl} onChange={e => setNewLecture({ ...newLecture, videoUrl: e.target.value })} required={videoSource === 'youtube'} className="w-full px-4 py-2 border border-outline-variant rounded bg-white mt-1" type="text" placeholder="https://www.youtube.com/embed/..." />
                    </div>
                  ) : (
                    <div>
                      <label className="text-[14px] font-medium text-on-surface-variant">Upload Video</label>
                      <input type="file" onChange={handleVideoUpload} accept="video/*" className="w-full text-sm mt-2" disabled={uploadingFile} required={videoSource === 'upload' && !newLecture.videoUrl} />
                      {newLecture.videoUrl && <p className="text-xs text-secondary mt-1 max-w-[200px] truncate">{newLecture.videoUrl}</p>}
                    </div>
                  )}
                  <div>
                    <label className="text-[14px] font-medium text-on-surface-variant">Description</label>
                    <textarea value={newLecture.description} onChange={e => setNewLecture({ ...newLecture, description: e.target.value })} className="w-full px-4 py-2 border border-outline-variant rounded bg-white mt-1" rows={2}></textarea>
                  </div>
                  <button className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-[14px]" type="submit">{newLecture.id ? 'Save Changes' : 'Publish Lecture'}</button>
                </form>
              </section>

              <section className="bg-white rounded-lg border border-outline-variant ambient-shadow p-6">
                <h3 className="text-[20px] font-semibold text-primary mb-4">Existing Lectures</h3>
                {lectures.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">No lectures published yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-outline-variant bg-surface text-on-surface-variant">
                          <th className="p-3 font-semibold">Title</th>
                          <th className="p-3 font-semibold">Unit</th>
                          <th className="p-3 font-semibold">Source</th>
                          <th className="p-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lectures.map(lecture => (
                          <tr key={lecture.id} className="border-b border-outline-variant hover:bg-surface-dim">
                            <td className="p-3 font-medium text-primary">{lecture.title}</td>
                            <td className="p-3">{units.find(u => u.id === lecture.unitId)?.title || 'No Unit'}</td>
                            <td className="p-3">
                              <span className="px-2 py-1 rounded text-xs font-bold bg-surface-container text-primary">
                                {lecture.videoUrl.includes('youtube') ? 'YouTube' : 'Upload'}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex gap-3">
                                <button onClick={() => handleEditLecture(lecture)} className="text-[#157165] font-bold hover:underline flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                                </button>
                                <button onClick={() => handleDeleteLecture(lecture.id)} className="text-error font-bold hover:underline flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[16px]">delete</span> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === 'qas' && (
            <div className="space-y-8">
              <section className="bg-white rounded-lg border border-outline-variant ambient-shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[24px] font-semibold text-primary">{newQa.id ? 'Edit Unit Q&A' : 'Publish Unit Q&A'}</h3>
                  {newQa.id && (
                    <button type="button" onClick={() => setNewQa({ id: '', title: '', unitId: '', description: '', freeContent: '', pdfLink: '', isPremium: false, price: 'Free' })} className="text-secondary font-bold text-sm hover:underline">
                      Cancel Editing
                    </button>
                  )}
                </div>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSaveQa}>
                  <div>
                    <label className="text-[14px] font-medium text-on-surface-variant">Unit</label>
                    <select value={newQa.unitId} onChange={e => setNewQa({ ...newQa, unitId: e.target.value })} required className="w-full px-4 py-2 border border-outline-variant rounded bg-white mt-1">
                      <option value="">Select Unit</option>
                      {units.map(u => <option key={u.id} value={u.id}>{u.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[14px] font-medium text-on-surface-variant">Title</label>
                    <input value={newQa.title} onChange={e => setNewQa({ ...newQa, title: e.target.value })} required className="w-full px-4 py-2 border border-outline-variant rounded bg-white mt-1" type="text" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[14px] font-medium text-on-surface-variant">Description</label>
                    <textarea value={newQa.description} onChange={e => setNewQa({ ...newQa, description: e.target.value })} className="w-full px-4 py-2 border border-outline-variant rounded bg-white mt-1" rows={2}></textarea>
                  </div>
                  <div className="md:col-span-2 border p-6 rounded-xl bg-surface-container/30 border-outline-variant">
                    <label className="block text-sm font-bold text-primary mb-4 uppercase tracking-widest text-[11px]">Q&A Access Type</label>
                    <div className="flex bg-surface-dim p-1 rounded-lg w-fit mb-6 border border-outline-variant shadow-inner">
                      <button
                        type="button"
                        onClick={() => setNewQa({ ...newQa, isPremium: false, price: 'Free' })}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${!newQa.isPremium ? 'bg-white text-[#157165] shadow-sm' : 'text-on-surface-variant hover:bg-surface-variant/50'}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">lock_open</span>
                        Free Content
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewQa({ ...newQa, isPremium: true, price: newQa.price === 'Free' ? '₹499' : newQa.price })}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${newQa.isPremium ? 'bg-secondary text-white shadow-md' : 'text-on-surface-variant hover:bg-surface-variant/50'}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">stars</span>
                        Premium Content
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[14px] font-medium text-on-surface-variant">View Text Q&A (Markdown/Text)</label>
                    <textarea value={newQa.freeContent} onChange={e => setNewQa({ ...newQa, freeContent: e.target.value })} className="w-full px-4 py-2 border border-outline-variant rounded bg-white mt-1 font-mono text-sm" rows={5} placeholder="Add your Wikipedia-style text Q&A here..."></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[14px] font-medium text-on-surface-variant mb-1 block">View PDF Q&A Attachment</label>
                    <div className="flex items-center gap-3">
                      <label className="relative cursor-pointer bg-secondary text-white px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-md">
                        <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                        <span>Upload PDF Q&A</span>
                        <input
                          type="file"
                          onChange={handleQaFileUpload}
                          accept=".pdf,image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onClick={(e) => (e.target as any).value = null}
                        />
                      </label>
                      {uploadingFile && <span className="text-xs text-secondary animate-pulse font-bold flex items-center gap-1"><span className="material-symbols-outlined animate-spin text-[14px]">refresh</span> Processing...</span>}
                      {newQa.pdfLink && !uploadingFile && (
                        <div className="flex items-center gap-2 bg-[#157165]/10 px-3 py-2 rounded-lg border border-[#157165]/20">
                          <span className="material-symbols-outlined text-[#157165] text-[18px]">task_alt</span>
                          <span className="text-xs text-[#157165] font-bold">PDF Q&A Ready</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="md:col-span-2 bg-secondary text-white px-6 py-2 rounded-lg font-bold text-[14px]" type="submit">{newQa.id ? 'Save Changes' : 'Publish Q&A'}</button>
                </form>
              </section>

              <section className="bg-white rounded-lg border border-outline-variant ambient-shadow p-6">
                <h3 className="text-[20px] font-semibold text-primary mb-4">Existing Q&As</h3>
                {qas.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">No Q&As published yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-outline-variant bg-surface text-on-surface-variant">
                          <th className="p-3 font-semibold">Title</th>
                          <th className="p-3 font-semibold">Unit</th>
                          <th className="p-3 font-semibold">Type</th>
                          <th className="p-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {qas.map(qa => (
                          <tr key={qa.id} className="border-b border-outline-variant hover:bg-surface-dim">
                            <td className="p-3 font-medium text-primary">{qa.title}</td>
                            <td className="p-3">{units.find(u => u.id === qa.unitId)?.title || 'No Unit'}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${qa.isPremium ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-[#c8e6c9] text-[#2e7d32]'}`}>
                                {qa.isPremium ? 'Premium' : 'Free'}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex gap-3">
                                <button onClick={() => handleEditQa(qa)} className="text-[#157165] font-bold hover:underline flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                                </button>
                                <button onClick={() => handleDeleteQa(qa.id)} className="text-error font-bold hover:underline flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[16px]">delete</span> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === 'doubts' && (
            <div className="space-y-8">
              <section className="bg-white rounded-lg border border-outline-variant ambient-shadow p-6">
                <h3 className="text-[24px] font-semibold text-primary mb-4">Doubts Inbox (Admin)</h3>

                <div className="mb-8 space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-bold text-lg text-[#93000a] flex items-center gap-2">
                      <span className="material-symbols-outlined">pending_actions</span>
                      Needs to be done
                    </h4>
                    <span className="bg-[#ffdad6] text-[#93000a] text-xs font-bold px-2 py-1 rounded-full">
                      {doubts.filter(d => d.status === 'pending').length}
                    </span>
                  </div>
                  {doubts.filter(d => d.status === 'pending').length === 0 ? (
                    <p className="text-on-surface-variant text-sm py-4 italic text-center">All clear! No pending doubts.</p>
                  ) : (
                    doubts.filter(d => d.status === 'pending').map(doubt => (
                      <div key={doubt.id} className="border border-outline-variant p-4 rounded bg-[#fff8f7] ambient-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-primary">{doubt.studentName} asks:</span>
                          <div className="flex items-center gap-2">
                            {doubt.target === 'admin' && <span className="text-[10px] uppercase font-bold text-white bg-secondary px-2 py-1 rounded">Private</span>}
                            <span className="text-[10px] uppercase font-bold text-on-surface-variant bg-white px-2 py-1 border rounded">{doubt.linkedUnitId ? 'Linked to unit' : 'General'}</span>
                            <button onClick={() => handleDeleteDoubt(doubt.id)} className="text-error hover:bg-error/10 p-1 rounded transition-colors" title="Delete">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </div>
                        <p className="text-on-surface-variant mb-4 font-medium text-sm">"{doubt.question}"</p>
                        <textarea
                          className="w-full px-3 py-2 border border-outline-variant rounded bg-white text-sm focus:border-primary outline-none transition-colors"
                          placeholder="Write your professional answer here..."
                          rows={3}
                          value={doubtAnswers[doubt.id] || ''}
                          onChange={(e) => setDoubtAnswers(prev => ({ ...prev, [doubt.id]: e.target.value }))}
                        ></textarea>
                        <div className="flex justify-end mt-2">
                          <button onClick={() => handleAnswerDoubt(doubt.id)} className="text-sm bg-[#157165] text-white px-6 py-2 rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">send</span>
                            Submit Answer
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-bold text-lg text-[#1a1c1e] flex items-center gap-2">
                      <span className="material-symbols-outlined">done_all</span>
                      Cleared Doubts
                    </h4>
                    <span className="bg-secondary-container text-secondary text-xs font-bold px-2 py-1 rounded-full">
                      {doubts.filter(d => d.status === 'answered').length}
                    </span>
                  </div>
                  {doubts.filter(d => d.status === 'answered').length === 0 ? (
                    <p className="text-on-surface-variant text-sm py-4 italic text-center">No answered doubts yet.</p>
                  ) : (
                    doubts.filter(d => d.status === 'answered').map(doubt => (
                      <div key={doubt.id} className="border border-outline-variant p-4 rounded bg-surface-dim hover:bg-white transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-on-surface-variant">{doubt.studentName} asked:</span>
                          <div className="flex items-center gap-2">
                                  {doubt.target === 'admin' && <span className="text-[10px] uppercase font-bold text-white bg-secondary px-2 py-1 rounded">Private</span>}
                                  <span className="text-[10px] uppercase font-bold text-[#157165] bg-[#c8e6c9] px-2 py-1 rounded">Answered</span>
                            <button onClick={() => handleDeleteDoubt(doubt.id)} className="text-error hover:bg-error/10 p-1 rounded transition-all">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </div>
                        <p className="text-outline mb-4 italic text-sm">"{doubt.question}"</p>
                        <div className="bg-white p-3 rounded border border-outline-variant">
                          <div className="flex justify-between items-center mb-1">
                            <strong className="text-xs text-primary uppercase tracking-wider">Your Answer:</strong>
                            <div className="flex gap-2">
                              <button onClick={() => handleEditDoubt(doubt)} className="text-[10px] font-bold text-secondary hover:underline">Edit Mode</button>
                            </div>
                          </div>
                          <textarea
                            className="w-full px-2 py-1 border border-outline-variant focus:border-secondary rounded bg-transparent text-sm mb-2"
                            placeholder="Update your answer..."
                            rows={2}
                            value={doubtAnswers[doubt.id] !== undefined ? doubtAnswers[doubt.id] : (doubt.answer || '')}
                            onChange={(e) => setDoubtAnswers(prev => ({ ...prev, [doubt.id]: e.target.value }))}
                          ></textarea>
                          <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                              <input 
                                className="text-xs px-2 py-1 border border-outline-variant rounded" 
                                value={doubt.question} 
                                onChange={(e) => handleUpdateDoubtContent(doubt.id, e.target.value, doubt.answer)} 
                                title="Edit Question"
                              />
                            </div>
                            {doubtAnswers[doubt.id] !== undefined && (
                              <button onClick={() => handleAnswerDoubt(doubt.id)} className="text-[10px] bg-secondary text-white px-3 py-1 rounded font-bold">Save Update</button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="bg-white rounded-lg border border-outline-variant ambient-shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[24px] font-semibold text-primary">Community Doubts Monitoring</h3>
                  <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">diversity_3</span>
                    Moderation Mode
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant mb-6 italic">Monitor public discussions. Delete any inappropriate or spam content.</p>
                
                {communityDoubts.length === 0 ? (
                  <p className="text-on-surface-variant text-sm py-8 text-center bg-surface rounded-xl border border-dashed border-outline-variant">No community doubts found.</p>
                ) : (
                  <div className="space-y-4">
                    {communityDoubts.map(doubt => (
                      <div key={doubt.id} className="border border-outline-variant p-4 rounded-xl hover:border-error/30 transition-all group relative bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-secondary">{doubt.studentName}</span>
                            <span className="text-[10px] text-on-surface-variant bg-surface px-2 py-0.5 rounded border">ID: {doubt.id.slice(0, 5)}...</span>
                          </div>
                          <button onClick={() => handleDeleteDoubt(doubt.id)} className="text-error hover:bg-error/10 p-2 rounded-full transition-all flex items-center gap-1 font-bold text-xs">
                            <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                            Remove Post
                          </button>
                        </div>
                        <p className="text-on-surface-variant text-sm mb-3">"{doubt.question}"</p>
                        <div className="flex items-center gap-4 text-[11px] text-outline">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">thumb_up</span> {(doubt.answers || []).reduce((acc: number, a: any) => acc + (a.upvotes || []).length, 0)} Total Votes</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">chat_bubble</span> {(doubt.answers || []).length} Answers</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === 'payments' && (
            <section className="bg-white rounded-lg border border-outline-variant ambient-shadow p-6">
              <h3 className="text-[24px] font-semibold text-primary mb-4">Verify Payments</h3>
              {transactions.length === 0 ? (
                <p className="text-on-surface-variant">No pending payments.</p>
              ) : (
                <div className="space-y-4">
                  {transactions.map(tx => (
                    <div key={tx.id} className="border border-outline-variant p-4 rounded bg-surface flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <p className="font-bold text-primary mb-1">Student ID: <span className="font-normal text-on-surface-variant">{tx.studentId}</span></p>
                        <p className="font-bold text-primary mb-1">Note ID: <span className="font-normal text-on-surface-variant">{tx.noteId}</span></p>
                        <p className="font-bold text-primary">Transaction Ref: <span className="font-normal text-secondary bg-[#eff4ff] px-2 py-0.5 rounded">{tx.transactionRef}</span></p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleVerifyTransaction(tx.id, 'approved')} className="bg-primary text-white px-4 py-2 rounded font-bold text-sm">Approve</button>
                        <button onClick={() => handleVerifyTransaction(tx.id, 'rejected')} className="bg-error text-white px-4 py-2 rounded font-bold text-sm">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8">
              <section className="bg-white rounded-lg border border-outline-variant ambient-shadow p-6">
                <h3 className="text-[24px] font-semibold text-primary mb-4">Site Settings</h3>
                <form className="space-y-4" onSubmit={handleUpdateSettings}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[14px] font-medium text-on-surface-variant">LinkedIn URL</label>
                      <input value={siteSettings.linkedin || ''} onChange={e => setSiteSettings({ ...siteSettings, linkedin: e.target.value })} className="w-full px-4 py-2 border border-outline-variant rounded bg-white mt-1" type="text" />
                    </div>
                    <div>
                      <label className="text-[14px] font-medium text-on-surface-variant">YouTube URL</label>
                      <input value={siteSettings.youtube || ''} onChange={e => setSiteSettings({ ...siteSettings, youtube: e.target.value })} className="w-full px-4 py-2 border border-outline-variant rounded bg-white mt-1" type="text" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[14px] font-medium text-on-surface-variant">Contact Us Text</label>
                    <textarea value={siteSettings.contactUs || ''} onChange={e => setSiteSettings({ ...siteSettings, contactUs: e.target.value })} className="w-full px-4 py-2 border border-outline-variant rounded bg-white mt-1"></textarea>
                  </div>
                  <div>
                    <label className="text-[14px] font-medium text-on-surface-variant">Terms of Service</label>
                    <textarea value={siteSettings.termsOfService || ''} onChange={e => setSiteSettings({ ...siteSettings, termsOfService: e.target.value })} className="w-full px-4 py-2 border border-outline-variant rounded bg-white mt-1" rows={3}></textarea>
                  </div>
                  <div>
                    <label className="text-[14px] font-medium text-on-surface-variant">Privacy Policy</label>
                    <textarea value={siteSettings.privacyPolicy || ''} onChange={e => setSiteSettings({ ...siteSettings, privacyPolicy: e.target.value })} className="w-full px-4 py-2 border border-outline-variant rounded bg-white mt-1" rows={3}></textarea>
                  </div>
                  <div>
                    <label className="text-[14px] font-medium text-on-surface-variant">Contact Us Page</label>
                    <textarea value={siteSettings.contactUs || ''} onChange={e => setSiteSettings({ ...siteSettings, contactUs: e.target.value })} className="w-full px-4 py-2 border border-outline-variant rounded bg-white mt-1" rows={3}></textarea>
                  </div>
                  <button className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-[14px]" type="submit">Save Settings</button>
                </form>
              </section>
            </div>
          )}

          {activeTab === 'about_author' && (
            <div className="space-y-8">
              <section className="bg-white rounded-lg border border-outline-variant ambient-shadow p-6">
                <h3 className="text-[24px] font-semibold text-primary mb-6">About Author</h3>
                <form className="space-y-6" onSubmit={async (e) => { e.preventDefault(); await updateAboutAuthor(aboutAuthorData); showMessage('About Author updated.'); }}>
                {/* Profile Picture */}
                  <div className="flex flex-col items-center gap-4 mb-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg border-4 border-white">
                      {aboutAuthorData.profilePic ? (
                        <img src={aboutAuthorData.profilePic} alt="Author" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-[64px] text-white">person</span>
                      )}
                    </div>
                    <div className="relative">
                      <button type="button" className="bg-secondary text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
                        <span className="material-symbols-outlined text-[18px]">upload</span>
                        {uploadingProfilePic ? 'Processing...' : 'Upload Profile Picture'}
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 5242880) { showMessage('Image too large. Max 5MB.'); return; }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setCropImageSrc(reader.result as string);
                            setCrop({ x: 0, y: 0 });
                            setZoom(1);
                          };
                          reader.readAsDataURL(file);
                          e.target.value = '';
                        }}
                      />
                    </div>
                    {aboutAuthorData.profilePic && (
                      <button type="button" onClick={() => setAboutAuthorData((prev: any) => ({ ...prev, profilePic: '' }))} className="text-error text-sm font-medium hover:underline">Remove Picture</button>
                    )}
                  </div>

                  {/* Crop modal moved outside form below */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[14px] font-medium text-on-surface-variant">Author Name</label>
                      <input value={aboutAuthorData.name || ''} onChange={e => setAboutAuthorData({ ...aboutAuthorData, name: e.target.value })} className="w-full px-4 py-2 border border-outline-variant rounded bg-white mt-1" type="text" placeholder="e.g. Kabir" />
                    </div>
                    <div>
                      <label className="text-[14px] font-medium text-on-surface-variant">Title / Role</label>
                      <input value={aboutAuthorData.title || ''} onChange={e => setAboutAuthorData({ ...aboutAuthorData, title: e.target.value })} className="w-full px-4 py-2 border border-outline-variant rounded bg-white mt-1" type="text" placeholder="e.g. Educator & Content Creator" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[14px] font-medium text-on-surface-variant">Contact Email</label>
                    <input value={aboutAuthorData.email || ''} onChange={e => setAboutAuthorData({ ...aboutAuthorData, email: e.target.value })} className="w-full px-4 py-2 border border-outline-variant rounded bg-white mt-1" type="email" placeholder="e.g. contact@kabirclassroom.com" />
                  </div>
                  <div>
                    <label className="text-[14px] font-medium text-on-surface-variant">Bio (Markdown supported)</label>
                    <textarea value={aboutAuthorData.bio || ''} onChange={e => setAboutAuthorData({ ...aboutAuthorData, bio: e.target.value })} className="w-full px-4 py-2 border border-outline-variant rounded bg-white mt-1" rows={8} placeholder="Write your bio here. You can use Markdown formatting."></textarea>
                  </div>
                  <button className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-[14px]" type="submit">Save About Author</button>
                </form>
              </section>
            </div>
          )}

          {activeTab === 'faqs' && (
            <section className="bg-white rounded-lg border border-outline-variant ambient-shadow p-6">
              <h3 className="text-[24px] font-semibold text-primary mb-4">FAQ Manager</h3>
              
              <div className="mb-8 p-6 bg-surface border border-outline-variant rounded-xl">
                <h4 className="font-semibold text-primary mb-4">Add New FAQ Directly</h4>
                <form className="space-y-4" onSubmit={handleAddFaq}>
                  <div>
                    <label className="text-[14px] font-medium text-on-surface-variant">Question</label>
                    <input value={newFaq.question} onChange={e => setNewFaq({ ...newFaq, question: e.target.value })} required className="w-full px-4 py-2 border border-outline-variant rounded bg-white mt-1" type="text" />
                  </div>
                  <div>
                    <label className="text-[14px] font-medium text-on-surface-variant">Answer</label>
                    <textarea value={newFaq.answer} onChange={e => setNewFaq({ ...newFaq, answer: e.target.value })} required className="w-full px-4 py-2 border border-outline-variant rounded bg-white mt-1" rows={3}></textarea>
                  </div>
                  <button className="bg-secondary text-white px-6 py-2 rounded-lg font-bold text-[14px]" type="submit">{(newFaq as any).id ? 'Update FAQ' : 'Publish FAQ'}</button>
                </form>
              </div>

              <div className="mb-8">
                <h4 className="font-semibold text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">help_center</span>
                  Pending Student Questions
                </h4>
                {faqs.filter(f => f.status === 'pending').length === 0 ? (
                  <p className="text-sm text-on-surface-variant text-center py-4 bg-surface rounded-xl">No pending questions.</p>
                ) : (
                  <ul className="space-y-4">
                    {faqs.filter(f => f.status === 'pending').map(faq => (
                      <li key={faq.id} className="p-4 bg-[#fffbeb] border border-[#fde68a] rounded-xl shadow-sm">
                        <div className="mb-3">
                          <span className="text-xs font-bold bg-[#fef3c7] text-[#92400e] px-2 py-1 rounded mb-2 inline-block border border-[#fde68a]">From: {faq.userEmail || 'Anonymous'}</span>
                          <strong className="block text-primary text-lg">Q: {faq.question}</strong>
                        </div>
                        <div className="flex gap-2 items-start">
                          <textarea 
                            value={faqAnswers[faq.id] || ''}
                            onChange={(e) => setFaqAnswers({ ...faqAnswers, [faq.id]: e.target.value })}
                            placeholder="Type the answer to publish as an FAQ..."
                            className="flex-grow px-4 py-2 border border-outline-variant rounded bg-white text-sm"
                            rows={2}
                          ></textarea>
                          <div className="flex flex-col gap-2">
                            <button 
                              onClick={async () => {
                                if (!faqAnswers[faq.id]?.trim()) return;
                                await answerFaq(faq.id, faqAnswers[faq.id]);
                                setFaqAnswers({ ...faqAnswers, [faq.id]: '' });
                                showMessage('Question answered and published to FAQs.');
                                fetchData();
                              }}
                              className="bg-secondary text-white px-4 py-2 rounded font-bold text-sm whitespace-nowrap hover:bg-teal-700 transition-colors shadow-sm"
                            >
                              Publish
                            </button>
                            <button 
                              onClick={() => handleDeleteFaq(faq.id)} 
                              className="text-error font-bold hover:bg-error/10 px-3 py-2 rounded transition-colors flex items-center gap-1 text-sm justify-center border border-error/20"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                              Discard
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">public</span>
                  Published FAQs
                </h4>
                {faqs.filter(f => f.status === 'published' || f.answer).length === 0 ? (
                  <p className="text-sm text-on-surface-variant text-center py-4 bg-surface rounded-xl">No published FAQs yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {faqs.filter(f => f.status === 'published' || f.answer).map(faq => (
                      <li key={faq.id} className="p-4 bg-white border border-outline-variant rounded-xl ambient-shadow hover:border-secondary transition-all group">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-grow">
                            <strong className="block text-primary mb-1">Q: {faq.question}</strong>
                            <p className="text-sm text-on-surface-variant leading-relaxed">{faq.answer}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => handleEditFaq(faq)} className="text-[#157165] font-bold hover:bg-[#157165]/10 p-2 rounded transition-colors flex items-center gap-1 text-sm">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                              Edit
                            </button>
                            <button onClick={() => handleDeleteFaq(faq.id)} className="text-error font-bold hover:bg-error/10 p-2 rounded transition-colors flex items-center gap-1 text-sm">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                              Delete
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>

      {/* Crop Modal - rendered via portal at body level for proper z-index and positioning */}
      {cropImageSrc && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', padding: '16px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e0e0e0' }}>
              <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1c1e', margin: 0 }}>Crop Profile Picture</h4>
              <button type="button" onClick={() => setCropImageSrc(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#666' }}>close</span>
              </button>
            </div>
            <div style={{ position: 'relative', width: '100%', height: '400px', backgroundColor: '#1a1c1e' }}>
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e0e0e0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#666' }}>zoom_out</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#157165', cursor: 'pointer' }}
                />
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#666' }}>zoom_in</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setCropImageSrc(null)} style={{ padding: '8px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '14px', border: '1px solid #ccc', background: '#fff', color: '#666', cursor: 'pointer' }}>Cancel</button>
                <button
                  type="button"
                  style={{ padding: '8px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '14px', border: 'none', background: '#157165', color: '#fff', cursor: 'pointer' }}
                  onClick={async () => {
                    if (!croppedAreaPixels || !cropImageSrc) return;
                    setUploadingProfilePic(true);
                    try {
                      const image = new Image();
                      image.src = cropImageSrc;
                      await new Promise((resolve) => { image.onload = resolve; });
                      const canvas = document.createElement('canvas');
                      canvas.width = croppedAreaPixels.width;
                      canvas.height = croppedAreaPixels.height;
                      const ctx = canvas.getContext('2d')!;
                      ctx.drawImage(
                        image,
                        croppedAreaPixels.x, croppedAreaPixels.y,
                        croppedAreaPixels.width, croppedAreaPixels.height,
                        0, 0,
                        croppedAreaPixels.width, croppedAreaPixels.height
                      );
                      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.9);
                      setAboutAuthorData((prev: any) => ({ ...prev, profilePic: croppedBase64 }));
                      setCropImageSrc(null);
                      showMessage('Profile picture cropped and attached.');
                    } catch (err: any) {
                      showMessage(`Crop failed: ${err.message}`);
                    } finally {
                      setUploadingProfilePic(false);
                    }
                  }}
                >
                  Apply Crop
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
