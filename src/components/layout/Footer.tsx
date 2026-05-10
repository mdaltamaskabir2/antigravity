import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getSiteSettings } from '../../lib/db';

export default function Footer() {
  const [settings, setSettings] = useState<any>(null);

  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | 'contact' | null>(null);

  useEffect(() => {
    async function loadSettings() {
      const dbSettings = await getSiteSettings();
      if (dbSettings) {
        setSettings(dbSettings);
      }
    }
    loadSettings();
  }, []);

  const renderModal = () => {
    if (!activeModal) return null;

    let title = '';
    let content = '';

    if (activeModal === 'terms') {
      title = 'Terms of Service';
      content = settings?.termsOfService || 'Terms of Service will be updated soon.';
    } else if (activeModal === 'privacy') {
      title = 'Privacy Policy';
      content = settings?.privacyPolicy || 'Privacy Policy will be updated soon.';
    } else if (activeModal === 'contact') {
      title = 'Contact Us';
      content = settings?.contactUs || 'Contact information will be updated soon.';
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
            <button 
              onClick={() => setActiveModal(null)}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors p-2"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="p-6 overflow-y-auto prose prose-slate dark:prose-invert max-w-none whitespace-pre-wrap">
            {content}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 mt-auto">
        <div className="w-full py-12 px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[1200px] mx-auto font-inter text-sm">
          <div className="space-y-6">
            <div className="text-lg font-bold text-slate-900 dark:text-white">PsychWithKabir</div>
            <p className="text-slate-500 max-w-[280px]">Your premier destination for high-quality psychology education resources.</p>
            <p className="text-slate-500">&copy; {new Date().getFullYear()} PsychWithKabir. All academic rights reserved.</p>
          </div>
          <div className="flex flex-col space-y-3">
            <span className="font-bold text-slate-900 dark:text-white mb-2">Connect & Legal</span>
            <button onClick={() => setActiveModal('contact')} className="text-left text-slate-500 hover:text-teal-600 transition-colors">Contact Us</button>
            {settings?.linkedin && <a href={settings.linkedin} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-teal-600 transition-colors">LinkedIn</a>}
            {settings?.youtube && <a href={settings.youtube} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-teal-600 transition-colors">YouTube</a>}
            <button onClick={() => setActiveModal('terms')} className="text-left text-slate-500 hover:text-teal-600 transition-colors mt-2">Terms of Service</button>
            <button onClick={() => setActiveModal('privacy')} className="text-left text-slate-500 hover:text-teal-600 transition-colors">Privacy Policy</button>
          </div>
          <div className="space-y-6">
            <span className="font-bold text-slate-900 dark:text-white block text-lg">Notes Update Notification</span>
            <p className="text-slate-500 mb-6 leading-relaxed">Link your email to subscribe specifically for alerts regarding new Study Notes and recently uploaded Video Lectures.</p>
            <div className="flex gap-2">
              <input className="flex-grow bg-white border border-[#c4c6ce] rounded-lg px-4 py-2.5 text-[#0b1c30] focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all" placeholder="Email Address" type="email"/>
              <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
      {renderModal()}
    </>
  );
}
