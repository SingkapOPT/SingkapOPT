import { OPTReport } from '../types';
import { ShieldCheck, AlertTriangle, Sprout, Landmark, Calendar, Sparkles } from 'lucide-react';

interface DashboardStatsProps {
  reports: OPTReport[];
}

const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function DashboardStats({ reports }: DashboardStatsProps) {
  const totalReports = reports.length;
  const pendingReports = reports.filter(r => r.status === 'Menunggu Verifikasi').length;
  const verifiedReports = reports.filter(r => r.status === 'Terverifikasi').length;
  const controlledReports = reports.filter(r => r.status === 'Terkendali').length;

  const totalArea = reports.reduce((acc, r) => acc + r.affectedArea, 0);
  const controlledArea = reports
    .filter(r => r.status === 'Terkendali')
    .reduce((acc, r) => acc + r.affectedArea, 0);

  // Group by severity
  const severityCounts = {
    Ringan: reports.filter(r => r.severity === 'Ringan').length,
    Sedang: reports.filter(r => r.severity === 'Sedang').length,
    Berat: reports.filter(r => r.severity === 'Berat').length,
    Puso: reports.filter(r => r.severity === 'Puso').length,
  };

  // Group by crop type
  const cropGroups: { [key: string]: number } = {};
  reports.forEach(r => {
    cropGroups[r.cropType] = (cropGroups[r.cropType] || 0) + 1;
  });

  // Calculate percentage for status bar
  const controlledPercent = totalReports ? Math.round((controlledReports / totalReports) * 100) : 0;
  const verifiedPercent = totalReports ? Math.round((verifiedReports / totalReports) * 100) : 0;
  const pendingPercent = totalReports ? Math.round((pendingReports / totalReports) * 100) : 0;

  // Laporan bulan ini dynamic computation
  const now = new Date();
  const currentMonthIdx = now.getMonth();
  const currentYear = now.getFullYear();
  const currentMonthName = INDONESIAN_MONTHS[currentMonthIdx];

  const thisMonthReportsList = reports.filter(r => {
    const dateStr = r.attackDate || r.createdAt;
    if (!dateStr) return false;
    
    const cleanStr = dateStr.trim();
    
    // Check with splitting standard delimiter characters
    const parts = cleanStr.split(/[-/. ]+/);
    if (parts.length >= 3) {
      let year = -1;
      let month = -1;
      
      const p0 = parseInt(parts[0]);
      const p1 = parseInt(parts[1]);
      const p2 = parseInt(parts[2]);
      
      if (parts[0].length === 4) {
        year = p0;
        month = p1; // YYYY-MM-DD
      } else if (parts[2].length === 4) {
        year = p2;
        month = p1; // DD-MM-YYYY
      } else {
        if (p2 === currentYear % 100) {
          year = currentYear;
          month = p1;
        } else if (p0 === currentYear % 100) {
          year = currentYear;
          month = p1;
        }
      }
      
      if (year === currentYear && month === (currentMonthIdx + 1)) {
        return true;
      }
    }
    
    try {
      const d = new Date(cleanStr);
      return !isNaN(d.getTime()) && d.getFullYear() === currentYear && d.getMonth() === currentMonthIdx;
    } catch (e) {
      return false;
    }
  });

  const thisMonthCount = thisMonthReportsList.length;
  const thisMonthArea = thisMonthReportsList.reduce((acc, r) => acc + r.affectedArea, 0);

  return (
    <div className="space-y-6">
      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div id="stat-total" className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 flex-shrink-0">
            <Sprout className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Serangan OPT</p>
            <h4 className="text-lg font-black text-slate-900 mt-0.5">{totalReports} Laporan</h4>
          </div>
        </div>

        <div id="stat-month" className="bg-gradient-to-br from-indigo-50/40 via-white to-violet-50/20 rounded-2xl p-4 border border-indigo-100/60 shadow-xs flex items-center space-x-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-1 opacity-10">
            <Sparkles className="w-8 h-8 text-indigo-600 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 flex-shrink-0 group-hover:scale-105 transition-transform">
            <Calendar className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-[10px] text-indigo-700 font-extrabold uppercase tracking-wider">Laporan Bulan Ini</p>
              <span className="text-[7.5px] bg-indigo-100 text-indigo-800 font-extrabold px-1 py-0.2 rounded uppercase tracking-widest">{currentMonthName}</span>
            </div>
            <h4 className="text-lg font-black text-slate-900 mt-0.5">{thisMonthCount} Kasus <span className="text-[10.5px] text-slate-400 font-medium font-sans">({thisMonthArea.toFixed(1)} Ha)</span></h4>
          </div>
        </div>

        <div id="stat-pending" className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center space-x-3">
          <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 flex-shrink-0">
            <AlertTriangle className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Butuh Verifikasi PPL</p>
            <h4 className="text-lg font-black text-slate-900 mt-0.5">{pendingReports} Laporan</h4>
          </div>
        </div>

        <div id="stat-controlled" className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center space-x-3">
          <div className="p-2.5 bg-sky-50 rounded-xl text-sky-600 flex-shrink-0">
            <ShieldCheck className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Terkendali (POPT)</p>
            <h4 className="text-lg font-black text-slate-900 mt-0.5">{controlledReports} Laporan</h4>
          </div>
        </div>

        <div id="stat-area" className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center space-x-3">
          <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600 flex-shrink-0">
            <Landmark className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Area Serang</p>
            <h4 className="text-lg font-black text-slate-900 mt-0.5">{totalArea.toFixed(1)} Ha</h4>
          </div>
        </div>
      </div>

      {/* Visual Analytics and Statistics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Status Tracker Circular representation */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs lg:col-span-1">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Pencapaian Pengendalian OPT</h3>
          
          <div className="relative flex justify-center items-center py-6">
            {/* Custom SVG Donut Chart */}
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="#f1f5f9"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="#0ea5e9" // Controlled (Sky)
                strokeWidth="12"
                fill="transparent"
                strokeDasharray="377"
                strokeDashoffset={377 - (377 * controlledPercent) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-extrabold text-slate-800">{controlledPercent}%</span>
              <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Tuntas</span>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-sky-500 block"></span>
                <span className="text-slate-600 font-medium">Terkendali (POPT)</span>
              </div>
              <span className="text-slate-900 font-bold">{controlledReports} ({controlledPercent}%)</span>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 block"></span>
                <span className="text-slate-600 font-medium">Terverifikasi (PPL)</span>
              </div>
              <span className="text-slate-900 font-bold">{verifiedReports} ({verifiedPercent}%)</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 block"></span>
                <span className="text-slate-600 font-medium font-indonesian">Menunggu Tindakan</span>
              </div>
              <span className="text-slate-900 font-bold">{pendingReports} ({pendingPercent}%)</span>
            </div>
          </div>
        </div>

        {/* Severity Metrics & Crop Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs lg:col-span-1">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Intensitas Kerusakan Lahan</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-red-600 flex items-center gap-1">🔴 Puso (Fuso/Gagal Panen)</span>
                <span className="text-slate-700">{severityCounts.Puso} laporan</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-red-500 h-full rounded-full transition-all" 
                  style={{ width: `${totalReports ? (severityCounts.Puso / totalReports) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-orange-500 flex items-center gap-1">🟠 Serangan Berat</span>
                <span className="text-slate-700">{severityCounts.Berat} laporan</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-orange-500 h-full rounded-full transition-all" 
                  style={{ width: `${totalReports ? (severityCounts.Berat / totalReports) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-500 flex items-center gap-1">🟡 Serangan Sedang</span>
                <span className="text-slate-700">{severityCounts.Sedang} laporan</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all" 
                  style={{ width: `${totalReports ? (severityCounts.Sedang / totalReports) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-green-600 flex items-center gap-1">🟢 Serangan Ringan</span>
                <span className="text-slate-700">{severityCounts.Ringan} laporan</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-green-500 h-full rounded-full transition-all" 
                  style={{ width: `${totalReports ? (severityCounts.Ringan / totalReports) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <h4 className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-2">Sebaran Komoditas</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(cropGroups).map(([crop, count]) => (
                <span key={crop} className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-100 flex items-center gap-1.5 transition">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  {crop}: <strong className="text-slate-900">{count}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Coordination Workflow Timeline */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs lg:col-span-1">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Sirkulasi Koordinasi Lapangan</h3>
          
          <div className="relative border-l-2 border-emerald-100 pl-4 ml-2 space-y-4 py-2">
            
            <div className="relative">
              <span className="absolute -left-6.5 top-0 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-white ring-4 ring-amber-50"></span>
              <div className="text-xs">
                <div className="flex items-center space-x-1.5 mb-0.5">
                  <span className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded text-[10px] font-bold">Langkah 1</span>
                  <span className="font-semibold text-slate-800">Pelaporan Kelompok Tani</span>
                </div>
                <p className="text-slate-500 leading-relaxed">Petani merilis titik koordinat serangan OPT dari handphone beserta foto sampel.</p>
              </div>
            </div>

            <div className="relative">
              <span className="absolute -left-6.5 top-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white ring-4 ring-emerald-50"></span>
              <div className="text-xs">
                <div className="flex items-center space-x-1.5 mb-0.5">
                  <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-bold">Langkah 2</span>
                  <span className="font-semibold text-slate-800">Verifikasi Petugas POPT</span>
                </div>
                <p className="text-slate-500 leading-relaxed">Petugas POPT memverifikasi intensitas serangan fisik di lapangan & merekomendasikan agens hayati.</p>
              </div>
            </div>

            <div className="relative">
              <span className="absolute -left-6.5 top-0 w-3.5 h-3.5 bg-sky-500 rounded-full border-2 border-white ring-4 ring-sky-50"></span>
              <div className="text-xs">
                <div className="flex items-center space-x-1.5 mb-0.5">
                  <span className="bg-sky-50 text-sky-800 px-1.5 py-0.5 rounded text-[10px] font-bold">Langkah 3</span>
                  <span className="font-semibold text-slate-800">Tindakan Alokasi POPT</span>
                </div>
                <p className="text-slate-500 leading-relaxed">Pengendali Hama (POPT) mengirim bantuan pestisida hayati, pelepasan musuh alami, dan menandai 'Terkendali'.</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
