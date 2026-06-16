import { useState } from 'react';
import { PEST_CATALOG } from '../data';
import { PestControlGuide } from '../types';
import { CheckSquare, Square, ChevronRight, Leaf, Shield, BookOpen, Layers } from 'lucide-react';

export default function PestCatalog() {
  const [selectedPest, setSelectedPest] = useState<PestControlGuide>(PEST_CATALOG[0]);
  const [checkedSteps, setCheckedSteps] = useState<{ [key: string]: boolean }>({});

  const toggleCheckStep = (recipeIndex: number, stepIndex: number) => {
    const key = `${selectedPest.id}-${recipeIndex}-${stepIndex}`;
    setCheckedSteps(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
      
      {/* Title panel */}
      <div className="bg-slate-900 text-white p-5 flex items-center space-x-3">
        <div className="p-2.5 bg-slate-800 rounded-xl text-emerald-400">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-sm">Ensiklopedia Pengendalian OPT Alami</h3>
          <p className="text-[10px] text-slate-400 mt-0.5 font-indonesian">Panduan Praktis Agens Pengendali Hayati (APH) & Pestisida Nabati Ramah Lingkungan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 md:divide-x md:divide-slate-100 min-h-[480px]">
        {/* Left Side: Pest Selector List */}
        <div className="md:col-span-4 p-4 space-y-2 max-h-[550px] overflow-y-auto">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block px-2 mb-2">Daftar OPT Utama</span>
          {PEST_CATALOG.map((pest) => (
            <button
              key={pest.id}
              onClick={() => {
                setSelectedPest(pest);
                // Reset recipe checks when switching pest
                setCheckedSteps({});
              }}
              className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition group-all ${
                selectedPest.id === pest.id
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-100 font-semibold'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-transparent'
              }`}
            >
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  {pest.name}
                </h4>
                <p className="text-[10px] font-mono text-slate-400 italic font-medium">
                  {pest.scientificName}
                </p>
                <div className="flex gap-1 pt-1">
                  {pest.targetCrops.map(c => (
                    <span key={c} className="text-[8px] bg-white px-1.5 py-0.5 rounded border border-slate-100 font-bold text-slate-500">{c}</span>
                  ))}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
            </button>
          ))}
        </div>

        {/* Right Side: Pest Solutions and Symptoms Detail */}
        <div className="md:col-span-8 p-6 space-y-6 max-h-[550px] overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-5 items-start justify-between pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-600 font-black px-2 py-0.5 bg-emerald-50 rounded-full">Spesifikasi Biologis</span>
              <h2 className="text-xl font-black text-slate-900 mt-1">{selectedPest.name}</h2>
              <p className="text-xs font-mono text-slate-400 italic">Nama Ilmiah: {selectedPest.scientificName}</p>
            </div>
            {selectedPest.imageUrl && (
              <div className="w-full md:w-32 h-20 rounded-xl overflow-hidden shadow-xs border border-slate-200 flex-shrink-0 group relative">
                <img 
                  src={selectedPest.imageUrl} 
                  alt={selectedPest.name}
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition duration-200" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Symptoms / Gejala list */}
            <div className="bg-amber-50/30 rounded-xl p-4 border border-amber-100/40 space-y-2.5">
              <h4 className="text-xs font-extrabold text-amber-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 block"></span>
                Identifikasi Gejala di Sawah:
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 pl-1 list-none">
                {selectedPest.symptoms.map((symptom, i) => (
                  <li key={i} className="flex gap-1.5 items-start">
                    <span className="text-amber-500 font-bold">✓</span>
                    <span className="leading-relaxed">{symptom}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Target Crops */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
              <h4 className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-400" />
                Varietas Tanaman Rentan Terinfeksi:
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tindakan pencegahan berkala disarankan dipersiapkan jika kelompok tani menanam tanaman berikut secara massal tanpa tumpang sari:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedPest.targetCrops.map(crop => (
                  <span key={crop} className="text-xs bg-white text-emerald-800 font-semibold border border-slate-200/60 px-2.5 py-0.5 rounded-lg">
                    🌾 {crop}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Biological Controls */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-600" />
              Metode Pengendalian Biologis Organik (Agens Hayati)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedPest.biologicalControls.map((bio, index) => (
                <div key={index} className="bg-emerald-50/10 p-3.5 rounded-xl border border-emerald-100/30 relative flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-xs text-emerald-900 group-hover:text-emerald-700 flex items-center gap-1">
                      <span className="text-[10px]">🌿</span> {bio.title}
                    </h4>
                    <p className="text-slate-500 text-[10px] leading-relaxed mt-1">{bio.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Organic Recipes / Pestisida Nabati Checklist */}
          {selectedPest.organicRecipes && selectedPest.organicRecipes.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                🔬 Ramuan Pembuatan Pestisida Nabati Praktis
              </h3>
              {selectedPest.organicRecipes.map((recipe, rIdx) => (
                <div key={rIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      🧪 {recipe.name}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {/* Ingredients list */}
                    <div className="md:col-span-2 space-y-1 bg-white p-2.5 rounded-lg border border-slate-200/50">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Bahan-Bahan:</span>
                      <ul className="text-[10px] text-slate-600 space-y-1 list-disc pl-3 leading-relaxed">
                        {recipe.ingredients.map((ing, i) => (
                          <li key={i}>{ing}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Interactive preparation checklist */}
                    <div className="md:col-span-3 space-y-2">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">Langkah Pembuatan (Centang sesudah selesai):</span>
                      <div className="space-y-1.5">
                        {recipe.steps.map((step, sIdx) => {
                          const hasChecked = checkedSteps[`${selectedPest.id}-${rIdx}-${sIdx}`] || false;
                          return (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => toggleCheckStep(rIdx, sIdx)}
                              className="w-full text-left flex items-start space-x-2 text-[10px] font-medium p-1.5 hover:bg-white rounded transition"
                            >
                              <span className="text-emerald-700 flex-shrink-0 mt-0.5">
                                {hasChecked ? (
                                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-slate-300" />
                                )}
                              </span>
                              <span className={`leading-snug ${hasChecked ? 'line-through text-slate-400' : 'text-slate-600'}`}>
                                {sIdx + 1}. {step}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
