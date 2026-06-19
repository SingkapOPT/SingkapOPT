import { useState, useEffect } from 'react';
import { PEST_CATALOG } from '../data';
import { PestControlGuide } from '../types';
import { CheckSquare, Square, ChevronRight, Leaf, Shield, BookOpen, Layers, Sparkles, X } from 'lucide-react';

function AutoImageSlider({ urls, name, onImageClick }: { urls: string[]; name: string; onImageClick?: (url: string) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!urls || urls.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % urls.length);
    }, 4000); // Cycle every 4 seconds
    return () => clearInterval(timer);
  }, [urls]);

  if (!urls || urls.length === 0) {
    return (
      <div id="no-image-placeholder" className="w-full h-48 md:h-64 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200">
        <span className="text-xs font-mono">Gambar tidak tersedia</span>
      </div>
    );
  }

  return (
    <div id="auto-image-slider" className="relative w-full h-48 md:h-64 bg-slate-955 rounded-2xl overflow-hidden shadow-md border border-slate-200/80 group">
      {urls.map((url, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
          }`}
          style={{ transitionProperty: 'opacity, transform' }}
        >
          <img
            src={url}
            alt={`${name} slide ${idx + 1}`}
            className="w-full h-full object-cover select-none cursor-zoom-in hover:scale-102 transition duration-500"
            referrerPolicy="no-referrer"
            onClick={() => onImageClick?.(url)}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              // Reliable botanical placeholder if a image link is blocklisted / fails
              target.src = "https://images.unsplash.com/photo-1473081556163-2a17de81fc97?auto=format&fit=crop&w=800&q=80";
              target.referrerPolicy = "no-referrer";
            }}
          />
          {/* Legend indicator overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent p-4 flex items-end justify-between pointer-events-none">
            <span className="text-white text-[10px] font-mono tracking-widest uppercase bg-emerald-600/80 px-2 py-0.5 rounded backdrop-blur-xs font-bold">
              Foto Lapangan #{idx + 1}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-white text-[8px] tracking-wider uppercase bg-slate-900/40 px-2 py-0.5 rounded backdrop-blur-xs font-bold">
                🔍 Klik Perbesar
              </span>
              <span className="text-slate-200 text-[10px] font-mono font-bold">
                {idx + 1} / {urls.length}
              </span>
            </div>
          </div>
        </div>
      ))}

      {/* Manual Switch Dots Indicators */}
      {urls.length > 1 && (
        <div className="absolute bottom-3 right-4 flex gap-1.5 z-10 bg-slate-900/60 px-2.5 py-1 rounded-full backdrop-blur-xs border border-white/10">
          {urls.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'bg-emerald-400 w-3' : 'bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PestCatalog() {
  const [selectedPest, setSelectedPest] = useState<PestControlGuide>(PEST_CATALOG[0]);
  const [checkedSteps, setCheckedSteps] = useState<{ [key: string]: boolean }>({});
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const [activeTargetPestIndex, setActiveTargetPestIndex] = useState<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setZoomImageUrl(null);
      }
    };
    if (zoomImageUrl) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [zoomImageUrl]);

  const toggleCheckStep = (recipeIndex: number, stepIndex: number) => {
    const key = `${selectedPest.id}-${recipeIndex}-${stepIndex}`;
    setCheckedSteps(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div id="pestisida-nabati-container" className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
      
      {/* Title panel */}
      <div className="bg-slate-900 text-white p-5 flex items-center space-x-3">
        <div className="p-2.5 bg-slate-800 rounded-xl text-emerald-400">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="text-left">
          <h3 className="font-bold text-sm">Informasi Tanaman & Racikan Pestisida Nabati</h3>
          <p className="text-[10px] text-slate-400 mt-0.5 font-indonesian">Koleksi Agens Pengendali Hayati (APH) & Pestisida Nabati Lokal Kecamatan Nunbena NTT.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 md:divide-x md:divide-slate-100 min-h-[480px]">
        {/* Left Side: Pestisida Selector List */}
        <div className="md:col-span-4 p-4 space-y-2 max-h-[620px] overflow-y-auto">
          <div className="flex items-center gap-1.5 px-2 mb-2 justify-between">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Daftar Bahan Nabati</span>
            <span className="bg-emerald-50 text-emerald-800 text-[8px] font-black uppercase px-2 py-0.5 rounded font-mono">7 Spesies</span>
          </div>
          
          {PEST_CATALOG.map((pest) => (
            <button
              key={pest.id}
              onClick={() => {
                setSelectedPest(pest);
                setCheckedSteps({});
                setActiveTargetPestIndex(0);
              }}
              className={`w-full text-left p-3.5 rounded-xl flex items-center justify-between transition-all duration-250 cursor-pointer border ${
                selectedPest.id === pest.id
                  ? 'bg-emerald-50/75 text-emerald-950 border-emerald-150 font-semibold shadow-3xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-transparent hover:border-slate-100'
              }`}
            >
              <div className="space-y-1">
                <h4 className="text-xs font-black leading-tight flex items-center gap-1 flex-wrap">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>{pest.name}</span>
                  {pest.localName && (
                    <span className="text-slate-500 font-normal italic font-sans text-[11px] ml-1">
                      ({pest.localName})
                    </span>
                  )}
                </h4>
                <p className="text-[9.5px] font-mono text-slate-400 italic">
                  {pest.scientificName}
                </p>
                <div id="target-crops-chips" className="flex flex-wrap gap-1 pt-1.5">
                  {pest.targetCrops.slice(0, 3).map(c => (
                    <span key={c} className="text-[8px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-550 border border-slate-200/40">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 text-slate-450 transition ${selectedPest.id === pest.id ? 'translate-x-0.5 text-emerald-700' : ''}`} />
            </button>
          ))}
        </div>

        {/* Right Side: Pestisida Solutions and Images Detail */}
        <div id="pestisida-detail-panel" className="md:col-span-8 p-6 space-y-6 max-h-[620px] overflow-y-auto">
          
          {/* Header Block containing Localized Name & Scientific Name */}
          <div className="flex flex-col gap-3 pb-4 border-b border-slate-100 text-left">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-mono tracking-widest text-emerald-700 font-black px-2 py-0.5 bg-emerald-100 rounded-md inline-block">
                Kearifan Lokal Nunbena
              </span>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mt-1">
                {selectedPest.name}
                {selectedPest.localName && (
                  <span className="italic text-slate-500 font-medium">
                    ({selectedPest.localName})
                  </span>
                )}
              </h2>
              <p className="text-xs font-mono text-slate-400 italic">
                Suku/Nama Latin: <strong className="text-slate-600 font-semibold">{selectedPest.scientificName}</strong>
              </p>
            </div>
          </div>

          {/* Automatic Switching Slideshow of Images */}
          {selectedPest.imageUrls && (
            <div id="image-gallery-box" className="space-y-1.5 text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Galeri Foto Pembelajaran Tanaman (Klik foto untuk memperbesar)
              </span>
              <AutoImageSlider urls={selectedPest.imageUrls} name={selectedPest.name} onImageClick={setZoomImageUrl} />
            </div>
          )}

          {/* Double Column Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-left">
            {/* Symptoms Detected */}
            <div className="bg-amber-50/20 rounded-xl p-4 border border-amber-150/40 space-y-2.5">
              <h4 className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 block"></span>
                Identifikasi Kerusakan di Lahan:
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-650 pl-1 list-none">
                {selectedPest.symptoms.map((symptom, i) => (
                  <li key={i} className="flex gap-2 items-start leading-relaxed">
                    <span className="text-amber-500 font-bold select-none">✓</span>
                    <span>{symptom}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Target Crops Variety */}
            <div className="bg-slate-55/40 rounded-xl p-4 border border-slate-100 space-y-2.5">
              <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-700" />
                Tanaman Sawah Utama yang Dilindungi:
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-indonesian">
                Direkomendasikan diaplikasikan secara berkala pada komoditas lumbung pangan berikut:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedPest.targetCrops.map(crop => (
                  <span key={crop} className="text-[11px] bg-white text-emerald-800 font-extrabold border border-emerald-100 px-2.5 py-1 rounded-lg shadow-3xs flex items-center gap-1">
                    🌾 {crop}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Botanical Benefits panel */}
          <div className="space-y-3 text-left">
            <h3 className="text-xs font-bold text-emerald-850 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-600 animate-pulse" />
              Kegunaan & Khasiat Kimiawi Tanaman
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {selectedPest.biologicalControls.map((bio, index) => (
                <div key={index} className="bg-emerald-50/10 p-4 rounded-xl border border-emerald-100/50 relative flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-xs text-emerald-900 flex items-center gap-1">
                      🌿 {bio.title}
                    </h4>
                    <p className="text-slate-600 text-[10.5px] leading-relaxed mt-1.5">{bio.description}</p>
                    
                    {bio.pestImageUrl && (
                      <div className="mt-3.5 space-y-1.5">
                        <span className="text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block">
                          Visual Hama Utama (Klik untuk Perbesar):
                        </span>
                        <div 
                          onClick={() => setZoomImageUrl(bio.pestImageUrl!)}
                          className="relative h-32 w-full rounded-lg overflow-hidden border border-emerald-150 shadow-3xs cursor-zoom-in group bg-slate-100"
                        >
                          <img 
                            src={bio.pestImageUrl} 
                            alt={bio.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80";
                            }}
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-2 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-[9px] font-mono">🔍 Klik Perbesar</span>
                            <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">HAMA</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Target Pests Grid section with custom photos */}
          {selectedPest.targetPests && selectedPest.targetPests.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-100 text-left">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Sasaran Organisme Pengganggu Tumbuhan (Hama/Penyakit Utama)
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-indonesian mt-1">
                  Nama hama/penyakit di bawah ini dapat diklik untuk mengubah gambar visual penayangan langsung secara otomatis:
                </p>
              </div>

              {/* Selector Names "di atas" */}
              <div className="flex flex-wrap gap-2 p-1.5 bg-slate-50 rounded-xl border border-slate-200/60">
                {selectedPest.targetPests.map((pest, pIdx) => {
                  const isActive = activeTargetPestIndex === pIdx;
                  return (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setActiveTargetPestIndex(pIdx)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 flex items-center gap-1.5 border cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs font-black'
                          : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="text-[12px]">{isActive ? '🐛' : '▫️'}</span>
                      <span>{pest.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Showcase Container "di bawah" */}
              <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-md relative p-4 flex flex-col sm:flex-row gap-5 items-center">
                {/* Image panel */}
                <div 
                  onClick={() => setZoomImageUrl(selectedPest.targetPests![activeTargetPestIndex].imageUrl)}
                  className="relative aspect-video w-full sm:w-1/2 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 cursor-zoom-in group shrink-0"
                >
                  <img 
                    src={selectedPest.targetPests![activeTargetPestIndex].imageUrl} 
                    alt={selectedPest.targetPests![activeTargetPestIndex].name} 
                    className="w-full h-full object-cover transition-transform duration-555 group-hover:scale-102"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80";
                    }}
                  />
                  {/* Overlay instructions */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent p-3 flex items-center justify-between pointer-events-none">
                    <span className="text-white text-[8px] font-mono tracking-widest uppercase bg-slate-900/60 px-2 py-0.5 rounded border border-white/5 font-bold">
                      🔍 KLIK UNTUK PERBESAR
                    </span>
                    <span className="text-slate-300 text-[9px] font-mono font-bold">
                      Index #{activeTargetPestIndex + 1}
                    </span>
                  </div>
                </div>

                {/* Details panel */}
                <div className="flex-1 text-left space-y-2.5 w-full">
                  <div className="space-y-0.5">
                    <span className="text-[8.5px] uppercase tracking-wider font-mono font-extrabold text-emerald-400 block bg-slate-800/60 px-2 py-0.5 rounded-md w-max border border-emerald-500/10">
                      Visualisasi Aktif
                    </span>
                    <h4 className="text-base font-black text-white leading-tight">
                      {selectedPest.targetPests![activeTargetPestIndex].name}
                    </h4>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed font-indonesian">
                    Kemampuan herba herbisida/pestisida organik dari <strong>{selectedPest.name} ({selectedPest.localName})</strong> terbukti tangguh dalam melemahkan sistem respirasi dan menekan penetasan telur organisme pengganggu tumbuhan berupa <strong>{selectedPest.targetPests![activeTargetPestIndex].name}</strong> ini secara alami tanpa residu kimia berbahaya.
                  </p>
                  
                  <div className="flex gap-2 pt-1 border-t border-slate-800/80">
                    <span className="text-[9px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                      ✓ Ramuan Higienis
                    </span>
                    <span className="text-[9px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                      ✓ 100% Organik Nunbena
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Recipes Preparation Guideline Checklist */}
          {selectedPest.organicRecipes && selectedPest.organicRecipes.length > 0 && (
            <div className="space-y-4 pt-3 border-t border-slate-100 text-left">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                🧪 Panduan Meramu & Cara Pembuatan Lapangan
              </h3>
              
              {selectedPest.organicRecipes.map((recipe, rIdx) => (
                <div key={rIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-200 text-slate-800 font-bold text-[9px] font-mono px-2 py-0.5 rounded-lg border border-slate-300">
                      Resep Utama
                    </span>
                    <h4 className="text-xs font-black text-slate-850">
                      {recipe.name}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Ingredients list */}
                    <div className="md:col-span-2 space-y-1.5 bg-white p-3 rounded-lg border border-slate-200/50">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1 border-b border-slate-105 pb-1">Bahan-Bahan Rujukan:</span>
                      <ul className="text-[10.5px] text-slate-650 space-y-1 my-1 list-disc pl-3 leading-relaxed">
                        {recipe.ingredients.map((ing, i) => (
                          <li key={i} className="font-medium text-slate-800">{ing}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Interactive preparation checklist */}
                    <div className="md:col-span-3 space-y-2 bg-white/50 p-3 rounded-lg border border-slate-150/60">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block pb-1 border-b border-slate-105">Langkah Pembuatan (Centang sesudah selesai):</span>
                      <div className="space-y-1.5">
                        {recipe.steps.map((step, sIdx) => {
                          const hasChecked = checkedSteps[`${selectedPest.id}-${rIdx}-${sIdx}`] || false;
                          return (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => toggleCheckStep(rIdx, sIdx)}
                              className="w-full text-left flex items-start space-x-2 text-[10.5px] font-medium p-1.5 hover:bg-white rounded transition-colors group cursor-pointer"
                            >
                              <span className="text-emerald-700 flex-shrink-0 mt-0.5">
                                {hasChecked ? (
                                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-500" />
                                )}
                              </span>
                              <span className={`leading-snug transition-colors ${hasChecked ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
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

      {/* Lightbox / Zoom Image Modal */}
      {zoomImageUrl && (
        <div 
          id="image-zoom-overlay"
          className="fixed inset-0 bg-slate-950/90 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-md transition-all duration-300 cursor-zoom-out"
          onClick={() => setZoomImageUrl(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {/* Close Button top-right */}
            <button
              onClick={() => setZoomImageUrl(null)}
              className="absolute -top-14 right-2 bg-white/10 hover:bg-white/20 hover:text-white text-slate-200 p-2.5 rounded-full transition-colors border border-white/10 cursor-pointer flex items-center gap-1.5"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
              <span className="text-xs font-bold font-mono tracking-wider">TUTUP [ESC]</span>
            </button>
            
            {/* Image container with nice frame */}
            <div className="bg-slate-900 p-2 rounded-2xl border border-white/10 shadow-2xl max-w-full overflow-hidden">
              <img
                src={zoomImageUrl}
                alt="Zoomed view"
                className="max-w-full max-h-[75vh] object-contain rounded-xl select-none"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1473081556163-2a17de81fc97?auto=format&fit=crop&w=800&q=80";
                  target.referrerPolicy = "no-referrer";
                }}
              />
            </div>
            
            {/* Description / metadata banner */}
            <p className="text-center text-slate-300 text-xs mt-4 tracking-wide max-w-lg bg-slate-900/80 px-4 py-2 rounded-full border border-white/5 backdrop-blur-xs">
              Suku Timor Nunbena NTT • Klik di mana saja untuk menutup kembali
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
