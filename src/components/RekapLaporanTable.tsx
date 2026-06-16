import React, { useState, useMemo } from 'react';
import { OPTReport, SeverityLevel, ReportStatus } from '../types';
import { 
  Database, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  Info,
  Calendar,
  MapPin,
  X,
  FileCheck,
  Edit2,
  Save,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

function getDefaultRecommendationForPest(pestName: string): { pplNotes: string; actionTaken: string } {
  if (!pestName) return { pplNotes: '', actionTaken: '' };
  
  const name = pestName.toLowerCase();
  if (name.includes('wereng')) {
    return {
      pplNotes: 'Verifikasi lapangan mengonfirmasi adanya serangan Wereng Batang Cokelat (WBC).',
      actionTaken: 'Rekomendasi tindakan segera: Lakukan gerakan penyemprotan agens hayati menggunakan Beauveria bassiana atau Metarhizium anisopliae di bagian pangkal tanaman, pertahankan air macak-macak, dan hindari pemakaian pupuk nitrogen berlebih.'
    };
  }
  if (name.includes('ulat') || name.includes('grayak') || name.includes('faw')) {
    return {
      pplNotes: 'Verifikasi lapangan mengonfirmasi adanya gejala serangan Ulat Grayak Jagung (FAW).',
      actionTaken: 'Rekomendasi tindakan segera: Kumpulkan kelompok ulat/telur secara mekanis, semprotkan bahan pengendali hayati berbahan aktif Bacillus thuringiensis (Bt) atau Beauveria bassiana pada pucuk daun jagung di pagi/sore hari.'
    };
  }
  if (name.includes('kutu') || name.includes('kebul')) {
    return {
      pplNotes: 'Verifikasi lapangan mengonfirmasi adanya infestasi Kutu Kebul (Bemisia tabaci).',
      actionTaken: 'Rekomendasi tindakan segera: Pasang perangkap kuning lekat (Yellow Sticky Trap) setinggi tajuk tanaman sebanyak 40 lembar/hektar, aplikasikan pestisida nabati konsentrat ekstrak bawang putih & sereh wangi secara intensif.'
    };
  }
  if (name.includes('keong') || name.includes('mas')) {
    return {
      pplNotes: 'Verifikasi lapangan mengonfirmasi adanya hama Keong Mas pada sela-sela pematang.',
      actionTaken: 'Rekomendasi tindakan segera: Lakukan pengeringan parit sawah secara berkala (membuat got cacing) agar keong terkumpul untuk dikumpulkan manual, pasang umpan daun talas/pelepah pepaya di saluran air, serta lepaskan bebek ke sawah.'
    };
  }
  return {
    pplNotes: 'Verifikasi lapangan menunjukkan gejala serangan OPT.',
    actionTaken: 'Rekomendasi tindakan segera: Segera lakukan gerakan kebersihan sanitasi lahan, aplikasikan agens pengendali hayati (APH) ramah lingkungan di area serangan, serta pantau intensitas serangan seminggu sekali.'
  };
}

interface RekapLaporanTableProps {
  reports: OPTReport[];
  isSyncing: boolean;
  onRefresh: () => void;
  syncError: string | null;
  onUpdateReport?: (updated: OPTReport) => void;
  isLoggedIn: boolean;
  currentUser: { name: string; email: string; role: 'PPL' | 'POPT' } | null;
  onTriggerLogin: () => void;
}

export default function RekapLaporanTable({ 
  reports, 
  isSyncing, 
  onRefresh, 
  syncError, 
  onUpdateReport,
  isLoggedIn,
  currentUser,
  onTriggerLogin
}: RekapLaporanTableProps) {
  // Filter States
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('Semua');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [cropFilter, setCropFilter] = useState<string>('Semua');

  // Interactive inline details expander state
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [showAllDetails, setShowAllDetails] = useState(false);

  const toggleRowExpand = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected row for detail drawer
  const [selectedReport, setSelectedReport] = useState<OPTReport | null>(null);

  // Edit form states
  const [isEditing, setIsEditing] = useState(false);
  const [editStatus, setEditStatus] = useState<ReportStatus>('Menunggu Verifikasi');
  const [editPplNotes, setEditPplNotes] = useState('');
  const [editPplVerifiedBy, setEditPplVerifiedBy] = useState('');
  const [editPoptActionTaken, setEditPoptActionTaken] = useState('');
  const [editPoptControlledBy, setEditPoptControlledBy] = useState('');

  // Sync edits state back
  React.useEffect(() => {
    if (selectedReport) {
      setEditStatus(selectedReport.status === 'Menunggu Verifikasi' ? 'Terkendali' : selectedReport.status);
      
      const defaults = getDefaultRecommendationForPest(selectedReport.pestName);
      
      setEditPplNotes(selectedReport.pplNotes || defaults.pplNotes);
      setEditPplVerifiedBy(selectedReport.pplVerifiedBy || 'Petugas Lapangan POPT Purbalingga');
      setEditPoptActionTaken(selectedReport.poptActionTaken || defaults.actionTaken);
      setEditPoptControlledBy(selectedReport.poptControlledBy || 'Petugas POPT Purbalingga');
    } else {
      setIsEditing(false);
    }
  }, [selectedReport]);

  const handleSaveEdit = () => {
    if (!selectedReport) return;
    
    const updated: OPTReport = {
      ...selectedReport,
      status: editStatus,
      pplNotes: editPplNotes,
      pplVerifiedBy: editPplVerifiedBy,
      pplVerifiedAt: editPplVerifiedBy && !selectedReport.pplVerifiedBy ? new Date().toISOString() : selectedReport.pplVerifiedAt,
      poptActionTaken: editPoptActionTaken,
      poptControlledBy: editPoptControlledBy,
      poptControlledAt: editPoptActionTaken && !selectedReport.poptActionTaken ? new Date().toISOString() : selectedReport.poptControlledAt,
    };
    
    if (onUpdateReport) {
      onUpdateReport(updated);
    }

    // Auto WhatsApp Integration for Respon Cepat
    const rawContact = selectedReport.contact || '';
    const cleanPhone = rawContact.replace(/[^0-9]/g, '');
    let formattedPhone = cleanPhone;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.substring(1);
    }

    const poptName = editPoptControlledBy.trim() || editPplVerifiedBy.trim() || 'Staf Lapangan POPT';
    const rekomendasi = editPoptActionTaken.trim() || editPplNotes.trim() || 'Lakukan penyemprotan agens hayati sesuai anjuran dan rekomendasi petugas.';

    const textMessage = `Halo Bapak/Ibu Pelapor *${selectedReport.farmerName}* dari Kelompok Tani *${selectedReport.farmerGroup || '-'}*,\n\n*RESPON CEPAT PETUGAS POPT - SINGKAP OPT* 🌾\n\nBerikut rekapitulasi rekomendasi tindakan respon cepat atas laporan serangan OPT Anda:\n\n📍 *Desa/Kelurahan*: ${selectedReport.locationVillage}\n📍 *Kecamatan*: ${selectedReport.locationDistrict}\n🌿 *Komoditas*: ${selectedReport.cropType}\n🐛 *Hama OPT*: ${selectedReport.pestName}\n⚠️ *Intensitas Serangan*: ${selectedReport.severity}\n\n🧑‍🌾 *Petugas POPT*: ${poptName}\n📋 *Rekomendasi Pengendalian*:\n"${rekomendasi}"\n\n_Pesan ini dikirim otomatis sebagai tindakan respon cepat terintegrasi POPT Purbalingga._`;

    if (formattedPhone) {
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(textMessage)}`;
      window.open(whatsappUrl, '_blank');
    }
    
    setSelectedReport(updated);
    setIsEditing(false);
  };

  // Helper lists for dynamic select filters
  const cropOptions = useMemo(() => {
    const crops = new Set<string>();
    reports.forEach(r => { if (r.cropType) crops.add(r.cropType); });
    return ['Semua', ...Array.from(crops)];
  }, [reports]);

  // Apply filters
  const filteredReports = useMemo(() => {
    let result = reports;

    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(r => 
        r.id.toLowerCase().includes(q) ||
        (r.farmerName && r.farmerName.toLowerCase().includes(q)) ||
        (r.farmerGroup && r.farmerGroup.toLowerCase().includes(q)) ||
        (r.locationVillage && r.locationVillage.toLowerCase().includes(q)) ||
        (r.locationDistrict && r.locationDistrict.toLowerCase().includes(q)) ||
        (r.pestName && r.pestName.toLowerCase().includes(q))
      );
    }

    if (severityFilter !== 'Semua') {
      result = result.filter(r => r.severity === severityFilter);
    }

    if (statusFilter !== 'Semua') {
      result = result.filter(r => r.status === statusFilter);
    }

    if (cropFilter !== 'Semua') {
      result = result.filter(r => r.cropType === cropFilter);
    }

    return result;
  }, [reports, search, severityFilter, statusFilter, cropFilter]);

  // Paginated Data
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredReports, currentPage]);

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage) || 1;

  // Reset pagination if filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, severityFilter, statusFilter, cropFilter]);

  // Export to CSV Function
  const exportToCSV = () => {
    const headers = [
      'ID Laporan', 'Tanggal Serangan', 'Pelapor', 'Kelompok Tani', 'Kontak', 
      'Komoditas', 'Nama OPT', 'Keparahan', 'Luas Serangan (Ha)', 
      'Desa', 'Kecamatan', 'Status', 'Catatan PPL'
    ];

    const rows = filteredReports.map(r => [
      r.id,
      r.attackDate,
      `"${r.farmerName.replace(/"/g, '""')}"`,
      `"${r.farmerGroup.replace(/"/g, '""')}"`,
      r.contact,
      r.cropType,
      `"${r.pestName.replace(/"/g, '""')}"`,
      r.severity,
      r.affectedArea,
      `"${r.locationVillage.replace(/"/g, '""')}"`,
      `"${r.locationDistrict.replace(/"/g, '""')}"`,
      r.status,
      `"${(r.pplNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Laporan_OPT_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Informative Header with Source Details */}
      <div className="bg-white p-5 rounded-2xl border border-slate-205/85 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider border border-emerald-200">
              Sinkronisasi Google Sheets
            </span>
            <span className={`h-2.5 w-2.5 rounded-full inline-block ${syncError ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
          </div>
          <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            Rekap Laporan OPT Desa Binaan
          </h3>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Data rekapitulasi di bawah ini disinkronkan secara aman dari Google Sheets utama: <a href="https://docs.google.com/spreadsheets/d/1h_ULmL-gzwE6zHFk3ureyeRcl_NheM2f86-KH6eYHv8/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline font-semibold inline-flex items-center gap-0.5">1h_ULmL-gzw... <ExternalLink className="w-3 h-3" /></a>.
          </p>
        </div>

        {/* Action button panel */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={onRefresh}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Memperbarui...' : 'Segarkan Data'}</span>
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition active:scale-95"
            title="Ekspor ke berkas Excel CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh CSV</span>
          </button>

          <a
            href="https://docs.google.com/spreadsheets/d/1h_ULmL-gzwE6zHFk3ureyeRcl_NheM2f86-KH6eYHv8/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition active:scale-95"
          >
            <span>Buka Spreadsheet</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Grid Control: Filter & Search Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        
        {/* Search and Section labels */}
        <div className="flex items-center space-x-2 text-slate-600">
          <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-black uppercase text-slate-550 tracking-wider">Metode Pencarian & Penyaringan</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5">
          {/* Search Query Input */}
          <div className="relative lg:col-span-4 max-w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari ID, pelapor, desa, nama OPT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9.5 pr-3 py-3 rounded-xl border border-slate-250 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
            />
          </div>

          {/* Severity Select Filter */}
          <div className="lg:col-span-2 text-left">
            <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Tingkat Serangan</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-250 bg-white"
            >
              <option value="Semua">Semua Tingkat</option>
              <option value="Ringan">Ringan</option>
              <option value="Sedang">Sedang</option>
              <option value="Berat">Berat</option>
              <option value="Puso">Puso</option>
            </select>
          </div>

          {/* Status Select Filter */}
          <div className="lg:col-span-3 text-left">
            <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Status Verifikasi</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-250 bg-white"
            >
              <option value="Semua">Semua Status</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Terverifikasi">Terverifikasi</option>
              <option value="Terkendali">Terkendali</option>
            </select>
          </div>

          {/* Crop Option Select Filter */}
          <div className="lg:col-span-3 text-left">
            <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Komoditas Tanaman</label>
            <select
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-250 bg-white"
            >
              {cropOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Datatable Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Interactive View Toolbar */}
        <div className="bg-slate-50/75 p-4 border-b border-slate-150 flex flex-col sm:flex-row justify-between items-center gap-3.5">
          <div className="flex items-center gap-2">
            <Database className="w-4.5 h-4.5 text-emerald-600" />
            <span className="font-extrabold text-[11px] text-slate-700 uppercase tracking-wider">
              Daftar Laporan Masuk ({filteredReports.length} Laporan)
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                <th className="py-4 px-4 text-center font-black">No.</th>
                <th className="py-4 px-4 font-black">ID Laporan</th>
                <th className="py-4 px-4 font-black">Tanggal</th>
                <th className="py-4 px-4 font-black">Nama Pelapor</th>
                <th className="py-4 px-4 font-black">Komoditas</th>
                <th className="py-4 px-4 font-black">Nama OPT / Hama</th>
                <th className="py-4 px-4 text-center font-black">Intensitas</th>
                <th className="py-4 px-3 text-right font-black">Luas (Ha)</th>
                <th className="py-4 px-4 font-black">Lokasi</th>
                <th className="py-4 px-4 font-black">Rekomendasi POPT</th>
                <th className="py-4 px-4 text-center font-black">Status</th>
                <th className="py-4 px-4 text-center font-black">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-450 italic">
                    <div className="flex flex-col items-center justify-center space-y-2">
                       <Info className="w-8 h-8 text-slate-300" />
                      <span>Tidak ada laporan yang sesuai dengan data penelusuran Anda.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedReports.map((report, idx) => {
                  return (
                    <tr 
                      key={report.id}
                      className="hover:bg-slate-50/60 transition"
                    >
                      {/* No. */}
                      <td className="py-4 px-4 text-center font-bold text-slate-400 whitespace-nowrap">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>

                      {/* ID Laporan */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-600 whitespace-nowrap">
                        {report.id}
                      </td>

                      {/* Attack Date */}
                      <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                        {report.attackDate}
                      </td>

                      {/* Reporter Name & group */}
                      <td className="py-4 px-4">
                        <div className="font-extrabold text-slate-800">{report.farmerName}</div>
                        <div className="text-[10px] text-slate-400">{report.farmerGroup || 'Umum'}</div>
                      </td>

                      {/* Crop Type */}
                      <td className="py-4 px-4 text-slate-700 font-medium whitespace-nowrap">
                        🌿 {report.cropType}
                      </td>

                      {/* Pest Name */}
                      <td className="py-4 px-4 font-extrabold text-slate-900">
                        {report.pestName}
                      </td>

                      {/* Severity level */}
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          report.severity === 'Puso' ? 'bg-red-100 text-red-800 border border-red-200' :
                          report.severity === 'Berat' ? 'bg-orange-100 text-orange-800 border border-orange-250' :
                          report.severity === 'Sedang' ? 'bg-amber-100 text-amber-805 border border-amber-200' :
                          'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          {report.severity}
                        </span>
                      </td>

                      {/* Affected Area */}
                      <td className="py-4 px-3 text-right font-mono font-bold text-slate-800">
                        {report.affectedArea.toFixed(1)}
                      </td>

                      {/* Location village & district */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-700">{report.locationVillage}</div>
                        <div className="text-[10px] text-slate-400">Kec. {report.locationDistrict}</div>
                      </td>

                      {/* Rekomendasi POPT */}
                      <td className="py-4 px-4">
                        {report.poptActionTaken ? (
                          <div className="space-y-1 max-w-[190px]">
                            <span className="inline-flex items-center text-[9px] bg-sky-50 text-sky-850 border border-sky-100 px-1.5 py-0.2 rounded font-extrabold uppercase">
                              {report.poptControlledBy?.split(' (')[0] || 'STAF POPT'}
                            </span>
                            <div className="text-[11px] text-slate-600 font-medium leading-normal break-words line-clamp-2" title={report.poptActionTaken}>
                              {report.poptActionTaken}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Belum Ada</span>
                        )}
                      </td>

                      {/* Verification Status */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          report.status === 'Terkendali' ? 'bg-sky-100 text-sky-850' :
                          report.status === 'Terverifikasi' ? 'bg-emerald-100 text-emerald-855' :
                          'bg-amber-100 text-amber-855 animate-pulse'
                        }`}>
                          {report.status}
                        </span>
                      </td>

                      {/* Row Detail Button */}
                      <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                          <button 
                            onClick={() => {
                              if (!isLoggedIn) {
                                onTriggerLogin();
                              } else {
                                setSelectedReport(report);
                                setIsEditing(true);
                              }
                            }}
                            className={`${
                              isLoggedIn 
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs' 
                                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                            } font-extrabold px-3 py-1.5 rounded-xl text-[11px] cursor-pointer transition hover:scale-[1.03] active:scale-95 flex items-center gap-1`}
                          >
                            {!isLoggedIn && <span className="text-[10px]">🔒</span>}
                            <span>Respon Cepat</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Controls */}
        <div className="bg-slate-50 px-4 py-4.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-xs">
          <div>
            Menampilkan <span className="font-bold text-slate-700">{filteredReports.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> hingga <span className="font-bold text-slate-700">{Math.min(currentPage * itemsPerPage, filteredReports.length)}</span> dari <span className="font-bold text-slate-700">{filteredReports.length}</span> laporan masuk.
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  currentPage === pageNum 
                    ? 'bg-slate-900 text-white border border-slate-900' 
                    : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Record Detil Inspection Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-left">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-150 transform transition-all">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div>
                <span className="text-[10px] bg-white/20 text-white border border-white/10 font-bold px-2.5 py-0.5 rounded-md font-mono">
                  REF DATABASE: {selectedReport.id}
                </span>
                <h4 className="font-extrabold text-sm mt-1.5">Rincian Informasi Serangan OPT</h4>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="p-2 rounded-full hover:bg-white/15 text-slate-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Container */}
            <div className="p-6 space-y-5 max-h-[440px] overflow-y-auto">
              
              {/* Primary info details */}
              <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4.5 bg-slate-50 p-3.5 rounded-2xl">
                <div>
                  <span className="block text-[9px] text-slate-400 font-extrabold uppercase">Jenis Tanaman</span>
                  <span className="font-bold text-xs text-slate-800">🌿 {selectedReport.cropType}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400 font-extrabold uppercase">Nama Hama / Penyakit</span>
                  <span className="font-bold text-xs text-slate-900">{selectedReport.pestName}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400 font-extrabold uppercase">Tingkat Intensitas</span>
                  <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedReport.severity === 'Puso' ? 'bg-red-100 text-red-805 border border-red-200' :
                    selectedReport.severity === 'Berat' ? 'bg-orange-100 text-orange-855 border border-orange-200' :
                    selectedReport.severity === 'Sedang' ? 'bg-amber-100 text-amber-805 border border-amber-200' :
                    'bg-green-100 text-green-800 border border-green-200'
                  }`}>{selectedReport.severity}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400 font-extrabold uppercase">Estimasi Luas Lahan</span>
                  <span className="font-bold text-xs text-slate-900">{selectedReport.affectedArea} Hektar (Ha)</span>
                </div>
              </div>

              {/* Farmer and geography data */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <h5 className="text-[10px] text-slate-400 font-extrabold uppercase">Identitas Pelapor</h5>
                  <p className="text-xs font-extrabold text-slate-800">{selectedReport.farmerName}</p>
                  <p className="text-[11px] text-slate-500">Kelompok: {selectedReport.farmerGroup || '-'}</p>
                  <p className="text-[11px] text-emerald-800 font-medium">No WA: {selectedReport.contact || '-'}</p>
                </div>

                <div className="space-y-1">
                  <h5 className="text-[10px] text-slate-400 font-extrabold uppercase">Data Lokasi GIS</h5>
                  <p className="text-xs font-bold text-slate-700">{selectedReport.locationVillage}, Kec. {selectedReport.locationDistrict}</p>
                  <p className="text-[10px] text-slate-500 font-mono">Lat: {selectedReport.latitude.toFixed(5)}, Lng: {selectedReport.longitude.toFixed(5)}</p>
                </div>
              </div>

              {/* Symptom description */}
              <div className="space-y-1.5 text-left">
                <h5 className="text-[10px] text-slate-400 font-extrabold uppercase">Deskripsi Gejala Lapangan</h5>
                <p className="text-xs bg-slate-50/50 p-3 rounded-xl border border-slate-150 leading-relaxed text-slate-700 italic">
                  "{selectedReport.description}"
                </p>
              </div>

              {/* Date Metadata */}
              <div className="flex items-center space-x-4 pl-1 text-[11px] text-slate-400">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Tanggal Serang: <strong>{selectedReport.attackDate}</strong></span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Ditambah Pada: <strong>{selectedReport.createdAt.split('T')[0]}</strong></span>
              </div>

              {/* Officer Validation / Actions Block */}
              <div className="border-t border-slate-100 pt-4 space-y-3.5">
                {!isLoggedIn && (
                  <div className="bg-amber-50/75 border border-amber-200 rounded-xl p-3 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-start gap-2">
                      <span className="text-base">🔒</span>
                      <div>
                        <span className="font-bold text-slate-900 block leading-snug">Modifikasi Dikunci (Read-Only)</span>
                        <span className="text-[10.5px] text-slate-500 leading-tight block mt-0.5">Hanya petugas PPL/POPT terverifikasi yang memiliki otorisasi edit laporan.</span>
                      </div>
                    </div>
                    <button
                      onClick={onTriggerLogin}
                      className="text-[11px] font-black bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg shrink-0 text-center cursor-pointer transition"
                    >
                      Masuk Petugas
                    </button>
                  </div>
                )}

                <div className="flex justify-between items-center pb-1">
                  <h5 className="text-[10px] text-slate-500 font-black uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    Alur Rekomendasi & Tindakan Pengendali Hayati
                  </h5>
                  {!isEditing && (
                    <button
                      onClick={() => {
                        if (!isLoggedIn) {
                          onTriggerLogin();
                        } else {
                          setIsEditing(true);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 text-[10px] uppercase font-extrabold px-2.5 py-1.5 text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md hover:bg-emerald-100 transition shadow-xs"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Rekomendasi (Petugas)</span>
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4 p-4 bg-slate-50 border border-slate-150 rounded-2xl animate-fade-in">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black tracking-wider text-slate-650 uppercase">
                        Status Validasi Laporan:
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as ReportStatus)}
                        className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-slate-205 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                        <option value="Terverifikasi">Terverifikasi (Diverifikasi POPT)</option>
                        <option value="Terkendali">Terkendali (Selesai Penanganan)</option>
                      </select>
                    </div>

                    <div className="border-t border-slate-205 pt-3 space-y-3">
                      <span className="text-[10px] font-black text-emerald-800 uppercase block">1. Verifikasi Petugas POPT</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-slate-500">Nama Petugas Verifikator *</label>
                          <input
                            type="text"
                            value={editPplVerifiedBy}
                            onChange={(e) => setEditPplVerifiedBy(e.target.value)}
                            placeholder="Misal: Budi Hartono, S.P."
                            className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-slate-205 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-slate-500">Catatan Advis & Rekomendasi *</label>
                          <textarea
                            value={editPplNotes}
                            onChange={(e) => setEditPplNotes(e.target.value)}
                            placeholder="Tulis saran atau advis teknis lapangan..."
                            rows={2}
                            className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-slate-205 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-205 pt-3 space-y-3">
                      <span className="text-[10px] font-black text-sky-800 uppercase block">2. Tindakan Pengendalian POPT</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-slate-500">Petugas Pengendali / Penanggung Jawab</label>
                          <input
                            type="text"
                            value={editPoptControlledBy}
                            onChange={(e) => setEditPoptControlledBy(e.target.value)}
                            placeholder="Misal: Rizki Amanda, S.P. (POPT)"
                            className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-slate-205 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-slate-500">Tindakan Pengendalian Hayati Lapangan</label>
                          <textarea
                            value={editPoptActionTaken}
                            onChange={(e) => setEditPoptActionTaken(e.target.value)}
                            placeholder="Detail bantuan atau penyemprotan hayati..."
                            rows={2}
                            className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-slate-205 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* status verifikasi ppl */}
                    <div className="bg-emerald-50/40 p-4.5 rounded-2xl border border-emerald-100/65 space-y-1.5 text-left animate-fade-in">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-emerald-800 uppercase">1. Verifikasi Petugas POPT</span>
                        <span className="text-[10px] font-extrabold text-slate-400">{selectedReport.pplVerifiedAt || '-'}</span>
                      </div>
                      {selectedReport.pplVerifiedBy ? (
                        <div>
                          <p className="text-xs font-black text-slate-755">Petugas Verifikator: <span className="text-emerald-700 font-extrabold">{selectedReport.pplVerifiedBy}</span></p>
                          <p className="text-[11px] text-slate-650 leading-relaxed mt-1 bg-white p-2 text-slate-700 border border-slate-100 rounded-lg italic">
                            "{selectedReport.pplNotes || 'Diverifikasi langsung oleh petugas POPT.'}"
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">Laporan ini masih mengantre untuk diverifikasi langsung di lapangan oleh Petugas POPT setempat.</p>
                      )}
                    </div>

                    {/* status popt action */}
                    <div className="bg-sky-50/40 p-4.5 rounded-2xl border border-sky-100/65 space-y-1.5 text-left animate-fade-in">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-sky-850 uppercase">2. Rekomendasi/Tindakan Pengendalian POPT</span>
                        <span className="text-[10px] font-extrabold text-slate-400">{selectedReport.poptControlledAt || '-'}</span>
                      </div>
                      {selectedReport.poptControlledBy ? (
                        <div>
                          <p className="text-xs font-black text-slate-755">Petugas Pengendali: <span className="text-sky-750 font-extrabold">{selectedReport.poptControlledBy}</span></p>
                          <p className="text-[11px] text-slate-650 leading-relaxed mt-1 bg-white p-2 text-slate-700 border border-slate-100 rounded-lg italic">
                            "{selectedReport.poptActionTaken || 'Penyemprotan agens hayati massal.'}"
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">Belum ada tindakan pengendalian formal yang diisikan oleh staf POPT.</p>
                      )}
                    </div>
                  </>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold rounded-xl text-xs transition"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition shadow-2xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Perubahan</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs transition"
                >
                  Tutup Rincian
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
