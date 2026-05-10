import { useState, useEffect } from 'react';
import { getLectures, getSyllabusUnits } from '../lib/db';
import ReactPlayer from 'react-player';
const Player: any = ReactPlayer;

const cleanUrl = (url: string) => {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com')) {
      if (urlObj.pathname.startsWith('/embed/')) return url;
      if (urlObj.searchParams.has('v')) return `https://www.youtube.com/embed/${urlObj.searchParams.get('v')}`;
    }
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.substring(1);
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch (e) { /* ignore */ }
  return url;
};

export default function VideoLectures() {
  const [lectures, setLectures] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const dbUnits = await getSyllabusUnits();
      setUnits(dbUnits);
      const fetched = await getLectures();
      setLectures(fetched);
      setLoading(false);
    }
    fetchData();
  }, []);

  const lecturesByUnit = units.map(unit => ({ ...unit, lectures: lectures.filter(l => l.unitId === unit.id) })).filter(unit => unit.lectures.length > 0);
  const uncategorizedLectures = lectures.filter(l => !l.unitId || !units.find(u => u.id === l.unitId));

  return (
    <main className="max-w-[1200px] mx-auto px-8 py-16 min-h-[calc(100vh-200px)]">
      <header className="mb-12">
        <h1 className="text-[40px] font-bold text-primary mb-4">Video Lectures</h1>
        <p className="text-[18px] text-on-surface-variant max-w-2xl">Deepen your understanding with comprehensive video lectures covering core psychological concepts, case studies, and exam preparation strategies.</p>
      </header>
      {loading ? (
        <div className="text-center py-12 text-secondary"><span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span></div>
      ) : lectures.length === 0 ? (
        <div className="bg-surface p-8 rounded-xl border border-outline-variant text-center text-on-surface-variant">No video lectures published yet.</div>
      ) : (
        <div className="space-y-6">
          {lecturesByUnit.map((unit) => (
            <div key={unit.id} className="bg-white border border-outline-variant rounded-xl overflow-hidden ambient-shadow">
              <button onClick={() => setExpandedUnit(expandedUnit === unit.id ? null : unit.id)} className="w-full px-6 py-4 flex justify-between items-center bg-surface hover:bg-surface-variant transition-colors text-left">
                <div><h3 className="font-bold text-xl text-primary">{unit.title}</h3><span className="text-sm text-on-surface-variant">{unit.lectures.length} Lectures</span></div>
                <span className="material-symbols-outlined ml-4 text-on-surface-variant flex-shrink-0">{expandedUnit === unit.id ? 'expand_less' : 'expand_more'}</span>
              </button>
              {expandedUnit === unit.id && (
                <div className="p-6 border-t border-outline-variant bg-surface-container">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {unit.lectures.map((lecture: any) => (
                      <article key={lecture.id} className="bg-white rounded-2xl border border-outline-variant overflow-hidden ambient-shadow flex flex-col group">
                        <div className="aspect-video bg-black relative">
                          {lecture.videoUrl.includes('youtube.com') || lecture.videoUrl.includes('youtu.be') ? (
                            <iframe
                              src={cleanUrl(lecture.videoUrl)}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title={lecture.title}
                            ></iframe>
                          ) : (
                            <Player url={lecture.videoUrl} width="100%" height="100%" controls light={false} />
                          )}
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                          <h3 className="font-bold text-lg text-primary mb-2 line-clamp-2">{lecture.title}</h3>
                          <p className="text-on-surface-variant text-sm line-clamp-3 mb-4 flex-grow">{lecture.description}</p>
                          <a href={lecture.videoUrl} target="_blank" rel="noreferrer" className="text-secondary font-bold text-sm hover:underline mt-auto">Open Video URL →</a>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {uncategorizedLectures.length > 0 && (
            <div className="bg-white border border-outline-variant rounded-xl overflow-hidden ambient-shadow">
              <button onClick={() => setExpandedUnit(expandedUnit === 'uncategorized' ? null : 'uncategorized')} className="w-full px-6 py-4 flex justify-between items-center bg-surface hover:bg-surface-variant transition-colors text-left">
                <div><h3 className="font-bold text-xl text-primary">Uncategorized Lectures</h3><span className="text-sm text-on-surface-variant">{uncategorizedLectures.length} Lectures</span></div>
                <span className="material-symbols-outlined ml-4 text-on-surface-variant flex-shrink-0">{expandedUnit === 'uncategorized' ? 'expand_less' : 'expand_more'}</span>
              </button>
              {expandedUnit === 'uncategorized' && (
                <div className="p-6 border-t border-outline-variant bg-surface-container">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {uncategorizedLectures.map((lecture: any) => (
                      <article key={lecture.id} className="bg-white rounded-2xl border border-outline-variant overflow-hidden ambient-shadow flex flex-col group">
                        <div className="aspect-video bg-black relative">
                          {lecture.videoUrl.includes('youtube.com') || lecture.videoUrl.includes('youtu.be') ? (
                            <iframe
                              src={cleanUrl(lecture.videoUrl)}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title={lecture.title}
                            ></iframe>
                          ) : (
                            <Player url={lecture.videoUrl} width="100%" height="100%" controls light={false} />
                          )}
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                          <h3 className="font-bold text-lg text-primary mb-2 line-clamp-2">{lecture.title}</h3>
                          <p className="text-on-surface-variant text-sm line-clamp-3 mb-4 flex-grow">{lecture.description}</p>
                          <a href={lecture.videoUrl} target="_blank" rel="noreferrer" className="text-secondary font-bold text-sm hover:underline mt-auto">Open Video URL →</a>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
