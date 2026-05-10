import { useState, useEffect } from 'react';
import { getSyllabusUnits } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Syllabus() {
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUnits() {
      const fetchedUnits = await getSyllabusUnits();
      setUnits(fetchedUnits);
      setLoading(false);
    }
    fetchUnits();
  }, []);

  const toggleUnit = async (unitId: string) => {
    if (expandedUnit === unitId) { setExpandedUnit(null); } else { setExpandedUnit(unitId); }
  };

  return (
    <main className="max-w-[1200px] mx-auto px-8 py-16 min-h-[calc(100vh-200px)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-[40px] font-bold text-primary">Syllabus & Curriculums</h1>
          <p className="text-[18px] text-on-surface-variant">Explore the modules and academic structure.</p>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-12 text-secondary"><span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span></div>
      ) : units.length === 0 ? (
        <div className="bg-surface p-8 rounded-xl border border-outline-variant text-center text-on-surface-variant">No syllabus units found.</div>
      ) : (
        <div className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
            {units.map(unit => (
              <div key={unit.id} className="bg-white border border-outline-variant rounded-xl overflow-hidden ambient-shadow">
                <button onClick={() => toggleUnit(unit.id)} className="w-full px-6 py-4 flex justify-between items-center bg-surface hover:bg-surface-variant transition-colors text-left">
                  <div><h3 className="font-bold text-xl text-primary">{unit.title}</h3></div>
                  <span className="material-symbols-outlined">{expandedUnit === unit.id ? 'expand_less' : 'expand_more'}</span>
                </button>
                {expandedUnit === unit.id && (
                  <div className="p-6 border-t border-outline-variant">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                      <p className="text-on-surface-variant flex-grow">{unit.description}</p>
                      <Link to={`/study-notes?unitId=${unit.id}`} className="bg-[#157165] text-white px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap hover:opacity-90 transition-opacity flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">library_books</span> See notes of this unit
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
