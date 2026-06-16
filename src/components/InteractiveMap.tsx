import { useState } from 'react';
import { OPTReport } from '../types';
import { AlertCircle, ShieldAlert, CheckCircle2, Navigation, Layers, Filter } from 'lucide-react';

interface InteractiveMapProps {
  reports: OPTReport[];
}

export default function InteractiveMap({ reports }: InteractiveMapProps) {
  const [selectedVillage, setSelectedVillage] = useState<string | null>(null);
  const [clickedPin, setClickedPin] = useState<OPTReport | null>(null);
  const [cropFilter, setCropFilter] = useState<string>('Semua');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');

  // Hardcoded villages for Vector Map representation (Kecamatan Nunbena)
  // Each village has its center coordinates inside our mock grid, and boundaries
  const VILLAGES_METADATA = [
    { name: 'Leloboko', threatLevel: 'Merah', description: 'Kawasan perbukitan tengah Nunbena. Komoditas jagung & kacang-kacangan, risiko berat Ulat Grayak Jagung.', color: 'bg-rose-100 border-rose-300' },
    { name: 'Nunbena', threatLevel: 'Kuning', description: 'Pusat administrasi kecamatan. Sentra sayuran hortikultura, ubi jalar, dan padi ladang kering, waspada ulat daun.', color: 'bg-amber-100 border-amber-300' },
    { name: 'Tunas', threatLevel: 'Hijau', description: 'Kawasan lereng selatan berbatu subur. Mayoritas jagung hutan dan gandum kering, saat ini terpantau aman.', color: 'bg-emerald-100 border-emerald-300' },
    { name: 'Faturene', threatLevel: 'Kuning', description: 'Dataran tinggi timur bercurah hujan tinggi. Komoditas kopi, cokelat, dan alpukat, risiko ringan busuk buah.', color: 'bg-amber-100 border-amber-300' },
    { name: 'Noebesi', threatLevel: 'Merah', description: 'Lembah sungai perbatasan barat. Hamparan sawah irigasi sela dan padi gogo, siaga serangan Wereng Cokelat.', color: 'bg-rose-100 border-rose-300' },
    { name: 'Penmin', threatLevel: 'Hijau', description: 'Lahan kering utara berpasir subur. Pusat cabai merah, tomat, dan kacang tanah, kondisi aman terkendali.', color: 'bg-emerald-100 border-emerald-300' },
  ];

  // Map representation coordinates translated to a 2D grid scale
  // Left relative percentage inside our vector canvas
  const getCoordinatesPct = (lat: number, lng: number) => {
    // Adaptive support for any historical mock coordinates (from Banyumas bounds)
    let checkLat = lat;
    let checkLng = lng;
    
    // Check if within Banyumas/Central Java bounds and auto-project to Timor Tengah Selatan bounds
    if (lat > -8.0 && lat < -7.0) {
      checkLat = -9.65 + ((lat - (-7.3400)) / (-7.4300 - (-7.3400))) * (-9.7800 - (-9.6500));
    }
    if (lng > 109.0 && lng < 110.0) {
      checkLng = 124.15 + ((lng - 109.1600) / (109.2900 - 109.1600)) * (124.3500 - 124.1500);
    }

    // Latitude boundaries: roughly -9.6500 (top) to -9.7800 (bottom)
    // Longitude boundaries: roughly 124.1500 (left) to 124.3500 (right)
    const latDiff = -9.6500 - (-9.7800);
    const lngDiff = 124.3500 - 124.1500;

    const yPct = ((-9.6500 - checkLat) / latDiff) * 100;
    const xPct = ((checkLng - 124.1500) / lngDiff) * 100;

    return { 
      x: Math.max(10, Math.min(90, xPct)), 
      y: Math.max(10, Math.min(90, yPct)) 
    };
  };

  // Filter reports
  const filteredReports = reports.filter(r => {
    const matchesCrop = cropFilter === 'Semua' || r.cropType === cropFilter;
    const matchesStatus = statusFilter === 'Semua' || r.status === statusFilter;
    return matchesCrop && matchesStatus;
  });

  return (
    <div id="gis-map" className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
      
      {/* Map head toolbar */}
      <div className="bg-slate-900 text-white p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-600 rounded-lg text-white">
            <Navigation className="w-5 h-5 rotate-45" />
          </div>
          <div>
            <h3 className="font-bold text-xs">Peta Pemetaan Digital Kerawanan OPT</h3>
            <p className="text-[10px] text-slate-400">Peta Zona Kerawanan Kecamatan Nunbena - Koordinat Lahan Presisi</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center space-x-1.5 bg-slate-800 px-2 pl-1.5 py-1 rounded-lg border border-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={cropFilter}
              onChange={(e) => {
                setCropFilter(e.target.value);
                setClickedPin(null);
              }}
              className="bg-transparent border-none text-slate-200 focus:outline-none text-[10px] font-semibold"
            >
              <option value="Semua">Semua Komoditas</option>
              <option value="Padi">Padi</option>
              <option value="Jagung">Jagung</option>
              <option value="Cabai">Cabai</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-800 px-2 pl-1.5 py-1 rounded-lg border border-slate-700">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setClickedPin(null);
              }}
              className="bg-transparent border-none text-slate-200 focus:outline-none text-[10px] font-semibold"
            >
              <option value="Semua">Semua Status</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Terverifikasi">Terverifikasi</option>
              <option value="Terkendali">Terkendali</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Map Stage Vector Area */}
        <div className="lg:col-span-8 bg-slate-50 relative h-[420px] border-b lg:border-b-0 lg:border-r border-slate-100 overflow-hidden flex items-center justify-center p-3 select-none">
          
          {/* Vector representation grid lines background */}
          <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 gap-0 opacity-10 pointer-events-none">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border-[0.5px] border-slate-500"></div>
            ))}
          </div>

          {/* Sawah / Agri Zone Regions representing local terrain polygons */}
          <div className="absolute inset-0 py-8 px-12 flex flex-wrap gap-4 items-center justify-center">
            
            {/* Leloboko Polygon Section */}
            <div 
              onClick={() => setSelectedVillage('Leloboko')}
              className={`absolute top-[38%] left-[34%] w-[28%] h-[26%] rounded-[20px_40px_30px_25px] border-2 border-dashed flex flex-col justify-center items-center p-2.5 transition cursor-pointer hover:scale-[1.01] ${
                selectedVillage === 'Leloboko' ? 'bg-rose-100/50 border-rose-500 ring-2 ring-rose-200/50' : 'bg-rose-50/15 border-rose-200 hover:bg-rose-50/30'
              }`}
            >
              <span className="text-[9px] font-extrabold text-rose-800 tracking-wider">DS. LELOBOKO</span>
              <span className="text-[7px] font-bold text-rose-600 bg-white/70 px-1 py-0.2 rounded border mt-0.5">Siaga Ulat</span>
            </div>

            {/* Nunbena Polygon Section */}
            <div 
              onClick={() => setSelectedVillage('Nunbena')}
              className={`absolute top-[8%] left-[38%] w-[26%] h-[25%] rounded-[30px_25px_40px_20px] border-2 border-dashed flex flex-col justify-center items-center p-2.5 transition cursor-pointer hover:scale-[1.01] ${
                selectedVillage === 'Nunbena' ? 'bg-amber-100/50 border-amber-500 ring-2 ring-amber-200/50' : 'bg-amber-50/15 border-amber-200 hover:bg-amber-50/30'
              }`}
            >
              <span className="text-[9px] font-extrabold text-amber-800 tracking-wider">DS. NUNBENA</span>
              <span className="text-[7px] font-bold text-amber-600 bg-white/70 px-1 py-0.2 rounded border mt-0.5">Waspada OPT</span>
            </div>

            {/* Tunas Polygon Section */}
            <div 
              onClick={() => setSelectedVillage('Tunas')}
              className={`absolute top-[64%] left-[10%] w-[26%] h-[26%] rounded-[40px_20px_35px_30px] border-2 border-dashed flex flex-col justify-center items-center p-2.5 transition cursor-pointer hover:scale-[1.01] ${
                selectedVillage === 'Tunas' ? 'bg-emerald-100/50 border-emerald-500 ring-2 ring-emerald-200/50' : 'bg-emerald-50/15 border-emerald-200 hover:bg-emerald-50/30'
              }`}
            >
              <span className="text-[9px] font-extrabold text-emerald-800 tracking-wider">DS. TUNAS</span>
              <span className="text-[7px] font-bold text-emerald-600 bg-white/70 px-1 py-0.2 rounded border mt-0.5">Kondisi Aman</span>
            </div>

            {/* Faturene Polygon Section */}
            <div 
              onClick={() => setSelectedVillage('Faturene')}
              className={`absolute top-[38%] left-[65%] w-[26%] h-[26%] rounded-[20px_30px_20px_40px] border-2 border-dashed flex flex-col justify-center items-center p-2.5 transition cursor-pointer hover:scale-[1.01] ${
                selectedVillage === 'Faturene' ? 'bg-amber-100/50 border-amber-500 ring-2 ring-amber-200/50' : 'bg-amber-50/15 border-amber-200 hover:bg-amber-50/30'
              }`}
            >
              <span className="text-[9px] font-extrabold text-amber-800 tracking-wider">DS. FATURENE</span>
              <span className="text-[7px] font-bold text-amber-600 bg-white/70 px-1 py-0.2 rounded border mt-0.5">Waspada Ringan</span>
            </div>

            {/* Noebesi Polygon Section */}
            <div 
              onClick={() => setSelectedVillage('Noebesi')}
              className={`absolute top-[34%] left-[7%] w-[23%] h-[24%] rounded-[30px_30px_30px_30px] border-2 border-dashed flex flex-col justify-center items-center p-2.5 transition cursor-pointer hover:scale-[1.01] ${
                selectedVillage === 'Noebesi' ? 'bg-rose-100/50 border-rose-500 ring-2 ring-rose-200/50' : 'bg-rose-50/15 border-rose-200 hover:bg-rose-50/30'
              }`}
            >
              <span className="text-[9px] font-extrabold text-rose-800 tracking-wider">DS. NOEBESI</span>
              <span className="text-[7px] font-bold text-rose-600 bg-white/70 px-1 py-0.2 rounded border mt-0.5">Siaga Wereng</span>
            </div>

            {/* Penmin Polygon Section */}
            <div 
              onClick={() => setSelectedVillage('Penmin')}
              className={`absolute top-[8%] left-[9%] w-[24%] h-[24%] rounded-[15px_40px_25px_30px] border-2 border-dashed flex flex-col justify-center items-center p-2.5 transition cursor-pointer hover:scale-[1.01] ${
                selectedVillage === 'Penmin' ? 'bg-emerald-100/50 border-emerald-500 ring-2 ring-emerald-200/50' : 'bg-emerald-50/15 border-emerald-200 hover:bg-emerald-50/30'
              }`}
            >
              <span className="text-[9px] font-extrabold text-emerald-800 tracking-wider">DS. PENMIN</span>
              <span className="text-[7px] font-bold text-emerald-600 bg-white/70 px-1 py-0.2 rounded border mt-0.5">Kondisi Aman</span>
            </div>

          </div>

          {/* Render Active Outbreak Pins dynamically mapped to coordinate scales */}
          {filteredReports.map((report) => {
            const { x, y } = getCoordinatesPct(report.latitude, report.longitude);
            return (
              <button
                key={report.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setClickedPin(report);
                  setSelectedVillage(report.locationVillage);
                }}
                className="absolute w-7 h-7 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center p-0 hover:scale-125 transition-all group z-10"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                {/* Visual Pin Pulse effect depending on severity */}
                <div className={`absolute w-8 h-8 rounded-full animate-ping opacity-25 ${
                  report.status === 'Terkendali' ? 'bg-sky-400' :
                  report.severity === 'Puso' || report.severity === 'Berat' ? 'bg-rose-500' : 'bg-amber-400'
                }`}></div>

                {/* Pin Container */}
                <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 border-white shadow-md text-white ${
                  report.status === 'Terkendali' ? 'bg-sky-500' :
                  report.severity === 'Puso' || report.severity === 'Berat' ? 'bg-red-600' : 'bg-amber-500'
                }`}>
                  {report.status === 'Terkendali' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : report.severity === 'Puso' ? (
                    <ShieldAlert className="w-3.5 h-3.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Tooltip on Hover */}
                <div className="absolute bottom-8 scale-0 group-hover:scale-100 origin-bottom bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-[9px] whitespace-nowrap z-50 pointer-events-none transition shadow-lg">
                  <span className="font-bold block">{report.cropType} - {report.pestName}</span>
                  <span className="text-[8px] opacity-70">Petani: {report.farmerName} • Luas: {report.affectedArea} Ha</span>
                </div>
              </button>
            );
          })}

          <div className="absolute bottom-3 left-3 bg-white/95 border border-slate-100 rounded-lg p-2.5 shadow-sm text-[9px] space-y-1.5 font-medium z-10">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">LEGENDA SEBARAN</span>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 block"></span>
              <span className="text-slate-600 font-bold">Darurat OPT (Berat / Puso)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></span>
              <span className="text-slate-600 font-bold">Waspada Serangan (Ringan/Sedang)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 block"></span>
              <span className="text-slate-600 font-bold">OPT Terkendali (POPT Action)</span>
            </div>
          </div>
        </div>

        {/* Detailed Info Column */}
        <div className="lg:col-span-4 p-5 space-y-4 max-h-[420px] overflow-y-auto">
          {clickedPin ? (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded ${
                    clickedPin.status === 'Terkendali' ? 'bg-sky-100 text-sky-850' :
                    clickedPin.status === 'Terverifikasi' ? 'bg-emerald-100 text-emerald-850' : 'bg-amber-100 text-amber-850'
                  }`}>
                    {clickedPin.status}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1.5">Kode Laporan: {clickedPin.id}</span>
                </div>
                <button 
                  onClick={() => setClickedPin(null)} 
                  className="text-xs text-slate-400 hover:text-slate-600 underline font-semibold"
                >
                  Tutup Info
                </button>
              </div>

              <div>
                <dt className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Komoditas & Hama Pengganggu</dt>
                <dd className="text-sm font-bold text-slate-900 mt-0.5">🌾 {clickedPin.cropType} — {clickedPin.pestName}</dd>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border-y border-slate-100 py-3">
                <div>
                  <span className="text-slate-400 block font-semibold text-[9px]">LOKASI:</span>
                  <span className="font-bold text-slate-800">Desa {clickedPin.locationVillage}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[9px]">KEPARAHAN:</span>
                  <span className={`font-bold ${
                    clickedPin.severity === 'Puso' || clickedPin.severity === 'Berat' ? 'text-red-600' : 'text-amber-600'
                  }`}>{clickedPin.severity}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[9px]">PELAPOR:</span>
                  <span className="font-bold text-slate-800">{clickedPin.farmerName} ({clickedPin.farmerGroup})</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[9px]">LUAS TERDAMPAK:</span>
                  <span className="font-bold text-slate-800">{clickedPin.affectedArea} Hektar</span>
                </div>
              </div>

              {clickedPin.description && (
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Laporan Fisik Lapangan:</span>
                  <p className="text-slate-600 text-xs mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-medium">"{clickedPin.description}"</p>
                </div>
              )}
            </div>
          ) : selectedVillage ? (
            <div className="space-y-3.5 animate-fade-in">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fokus Geografis Desa</span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">Desa {selectedVillage}</h3>
              </div>

              {(() => {
                const villageMeta = VILLAGES_METADATA.find(v => v.name === selectedVillage);
                const villageReports = reports.filter(r => r.locationVillage === selectedVillage);
                return (
                  <>
                    <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{villageMeta?.description}</p>
                    
                    <div className="space-y-2">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Status Kejadian ({villageReports.length})</span>
                      {villageReports.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Belum ada laporan OPT masuk untuk wilayah ini.</p>
                      ) : (
                        <div className="space-y-2">
                          {villageReports.map(r => (
                            <button
                              key={r.id}
                              onClick={() => setClickedPin(r)}
                              className="w-full text-left p-2.5 rounded-xl border border-slate-150 hover:bg-slate-50 flex justify-between items-center transition"
                            >
                              <div className="text-[11px] leading-snug">
                                <span className="font-extrabold block text-slate-800">{r.cropType} - {r.pestName}</span>
                                <span className="text-slate-400 text-[10px]">Terdampak: {r.affectedArea} Ha • {r.farmerName}</span>
                              </div>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                                r.status === 'Terkendali' ? 'bg-sky-50 text-sky-700' :
                                r.status === 'Terverifikasi' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                              }`}>{r.status}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 flex flex-col items-center justify-center space-y-2">
              <svg className="w-12 h-12 text-slate-300 stroke-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <h4 className="font-bold text-xs text-slate-500">Klik Pin Laporan di Peta</h4>
              <p className="text-[10px] text-slate-400 max-w-[200px]">Atau klik nama wilayah peta digital di pematang untuk memantau eskalasi status ancaman dan rekam kendali POPT.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
