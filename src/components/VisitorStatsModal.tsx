import React, { useMemo } from 'react';
import { X, Calendar, BarChart3, Users, Clock, Award, Landmark } from 'lucide-react';

interface VisitorStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyVisitors: Record<string, number>;
  totalCount: number;
}

export default function VisitorStatsModal({ isOpen, onClose, dailyVisitors, totalCount }: VisitorStatsModalProps) {
  if (!isOpen) return null;

  // Format dates and sort by latest first
  const sortedDates = useMemo(() => {
    return Object.entries(dailyVisitors)
      .map(([dateStr, count]) => {
        // Parse dateStr (YYYY-MM-DD)
        const dateObj = new Date(dateStr);
        let formattedDate = dateStr;
        try {
          if (!isNaN(dateObj.getTime())) {
            formattedDate = dateObj.toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
          }
        } catch {
          // Fallback to raw string
        }
        return {
          rawDate: dateStr,
          formattedDate,
          count,
        };
      })
      .sort((a, b) => b.rawDate.localeCompare(a.rawDate));
  }, [dailyVisitors]);

  // Calculations
  const maxVisits = useMemo(() => {
    const values = Object.values(dailyVisitors);
    return values.length > 0 ? Math.max(...values) : 1;
  }, [dailyVisitors]);

  const stats = useMemo(() => {
    const daysCount = Object.keys(dailyVisitors).length || 1;
    const avg = Math.round((totalCount / daysCount) * 10) / 10;
    return {
      daysCount,
      avg,
    };
  }, [dailyVisitors, totalCount]);

  return (
    <div id="visitor-stats-modal-overlay" className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        id="visitor-stats-modal-box" 
        className="relative w-full max-w-lg bg-white border border-slate-150 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Banner Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 p-5 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
            <BarChart3 className="w-24 h-24" />
          </div>
          
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-emerald-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
              <Landmark className="w-2.5 h-2.5" /> Pusat Data
            </span>
            <span className="text-[10px] text-slate-350 font-mono">Petugas Area</span>
          </div>
          
          <h3 className="text-base font-black tracking-tight flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Kanal Statistik Pengunjung Harian</span>
          </h3>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            Data ini merekam interaksi langsung dari Petani, PPL, dan POPT di seluruh wilayah Kecamatan Nunbena untuk pemantauan mitigasi hayati aktif.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="p-4 grid grid-cols-3 gap-3 bg-slate-50 border-b border-slate-100 shrink-0">
          <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-3xs flex flex-col justify-between text-left">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" /> Total Pengunjung
            </span>
            <p className="text-lg font-black text-slate-850 mt-1">{totalCount.toLocaleString('id-ID')}</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-3xs flex flex-col justify-between text-left">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> Hari Aktif
            </span>
            <p className="text-lg font-black text-slate-850 mt-1">{stats.daysCount} <span className="text-[9px] font-bold text-slate-400">Hari</span></p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-3xs flex flex-col justify-between text-left">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
              <Award className="w-3 h-3 text-emerald-500" /> Rata-Rata Harian
            </span>
            <p className="text-lg font-black text-slate-850 mt-1">{stats.avg.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Daily Visitors Log Table / Graph List */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-left min-h-0">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Siklus Kunjungan Tiap Hari</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-medium">Diperbarui secara real-time</span>
          </div>

          {sortedDates.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <BarChart3 className="w-10 h-10 mx-auto text-slate-200" />
              <p className="text-xs font-medium">Belum ada catatan kunjungan harian terekam.</p>
              <p className="text-[10px] text-slate-400">Interaksi Anda yang baru dihitung akan segera dicatatkan.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {sortedDates.map((item, idx) => {
                const percentage = Math.round((item.count / maxVisits) * 100);
                return (
                  <div 
                    key={item.rawDate} 
                    className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 rounded-xl transition duration-300 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{item.formattedDate}</span>
                        <span className="text-[9px] font-mono text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">{item.rawDate}</span>
                        {idx === 0 && (
                          <span className="bg-emerald-100 text-emerald-800 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded">Hari Ini (Aktif)</span>
                        )}
                      </div>
                      
                      {/* Visual Progress Bar proportional to highest day */}
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${Math.max(percentage, 3)}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 justify-between md:justify-end shrink-0">
                      <span className="text-xs font-black text-slate-800 bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg shadow-3xs">
                        {item.count.toLocaleString('id-ID')}
                        <span className="text-[9px] font-bold text-slate-500 font-sans ml-1 text-xs">Visits</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition cursor-pointer"
          >
            Tutup Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
