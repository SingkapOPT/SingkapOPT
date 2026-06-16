import React, { useState, useEffect, useMemo } from 'react';
import { OPTReport, UserRole } from './types';
import { INITIAL_REPORTS } from './data';
import DashboardStats from './components/DashboardStats';
import ReportForm from './components/ReportForm';
import InteractiveMap from './components/InteractiveMap';
import PestCatalog from './components/PestCatalog';
import RekapLaporanTable from './components/RekapLaporanTable';
import LoginModal from './components/LoginModal';

// Lucide Icons
import {
  Sprout,
  Users,
  CheckCircle,
  FileText,
  MapPin,
  Sparkles,
  BookOpen,
  User,
  ShieldCheck,
  Check,
  Phone,
  Calendar,
  Layers,
  Search,
  MessageSquare,
  AlertCircle,
  Database,
  RefreshCw,
  Send,
  ExternalLink,
  Settings,
  LogIn,
  UserCheck,
  Home,
  Eye,
  X
} from 'lucide-react';

export default function App() {
  // PERSISTENCE: Get initial data from localStorage if exists, otherwise load INITIAL_REPORTS
  const [reports, setReports] = useState<OPTReport[]>(() => {
    const saved = localStorage.getItem('singkap_opt_reports');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Clear any lingering legacy mock/demo items (REP-001 to REP-005)
          return parsed.filter((r) => r && !['REP-001', 'REP-002', 'REP-003', 'REP-004', 'REP-005'].includes(r.id));
        }
      } catch (e) {
        console.error('Failed to parse local reports:', e);
      }
    }
    return INITIAL_REPORTS;
  });

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem('singkap_opt_reports', JSON.stringify(reports));
  }, [reports]);

  // Google Sheets integration state
  const [externalReports, setExternalReports] = useState<OPTReport[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Belum Tersinkron');

  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(() => {
    return localStorage.getItem('singkap_opt_apps_script_url') || 'https://script.google.com/macros/s/AKfycbx-aKLTK6WuBkwo6dJjM6wMF8zHPyeQMeMCqzMR6XUSvMHILlxJMmI586WeqgI4SSEXyg/exec';
  });
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>(() => {
    return localStorage.getItem('singkap_opt_google_sheet_url') || 'https://docs.google.com/spreadsheets/d/1h_ULmL-gzwE6zHFk3ureyeRcl_NheM2f86-KH6eYHv8/edit?usp=sharing';
  });

  const extractSheetId = (url: string): string => {
    if (!url) return '';
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : url;
  };

  // Load and synchronize external records from Google Sheets Apps Script Web App
  const fetchExternalReports = async () => {
    setIsSyncing(true);
    try {
      const sheetId = extractSheetId(googleSheetUrl);
      const queryParams = new URLSearchParams({
        appsScriptUrl: appsScriptUrl.trim(),
        googleSheetId: sheetId.trim()
      });
      const res = await fetch(`/api/external-reports?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.reports)) {
          setExternalReports(data.reports);
          setSyncError(null);
          setLastSyncedTime(new Date().toLocaleTimeString('id-ID'));
        } else {
          setSyncError(data.error || 'Terjadi kesalahan penafsiran kolom data oleh script.');
        }
      } else {
        setSyncError('Koneksi server proxy Google Sheet bermasalah.');
      }
    } catch (err: any) {
      console.error('Failed to sync google sheet reports:', err);
      setSyncError(err.message || 'Gagal tersambung ke basis data lapangan.');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchExternalReports();

    // Setup periodic polling every 30 seconds to keep the dashboard and map automatically updated!
    const timer = setInterval(fetchExternalReports, 30000);
    return () => clearInterval(timer);
  }, [appsScriptUrl, googleSheetUrl]);

  // Compute unified reports: prioritize sheets reports and merge without duplicates
  const combinedReports = useMemo(() => {
    const merged = [...reports];
    externalReports.forEach((ext) => {
      const existIdx = merged.findIndex((r) => r.id === ext.id);
      if (existIdx !== -1) {
        // Enforce the sheet data values but preserve custom client-side modifications if any
        merged[existIdx] = { ...merged[existIdx], ...ext };
      } else {
        merged.push(ext);
      }
    });

    // Sort descending by creation date
    return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reports, externalReports]);

  // General App configuration
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('singkap_logged_in') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: 'PPL' | 'POPT' } | null>(() => {
    const saved = localStorage.getItem('singkap_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Derive or track currentRole: strictly lock to Petani if not logged in, otherwise use currentUser's role
  const [currentRoleState, setCurrentRoleState] = useState<UserRole>('Petani');
  
  // Keep role state synchronized with login status
  const currentRole = isLoggedIn && currentUser ? currentUser.role : 'Petani';

  const [activeTab, setActiveTab] = useState<'dashboard' | 'lapor' | 'ensiklopedia' | 'lapor-popt'>('dashboard');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showIntegrasiConfig, setShowIntegrasiConfig] = useState<boolean>(false);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [showVisitorPopup, setShowVisitorPopup] = useState<boolean>(true);

  useEffect(() => {
    const fetchVisitorCount = async () => {
      try {
        const res = await fetch('/api/visitor-count');
        if (res.ok) {
          const data = await res.json();
          if (typeof data.count === 'number') {
            setVisitorCount(data.count);
            localStorage.setItem('singkap_fallback_visitor_count', String(data.count));
            return;
          }
        }
      } catch (err) {
        console.error('Failed to fetch visitor count from server:', err);
      }

      // Local Fallback Counter in case of network issues/sandboxed previews
      const localCountStr = localStorage.getItem('singkap_fallback_visitor_count');
      let localCount = localCountStr ? parseInt(localCountStr, 10) : 1292;
      localCount += 1;
      localStorage.setItem('singkap_fallback_visitor_count', String(localCount));
      setVisitorCount(localCount);
    };
    fetchVisitorCount();
  }, []);

  const [googleFormUrl, setGoogleFormUrl] = useState<string>(() => {
    return localStorage.getItem('singkap_opt_google_form') || 'https://forms.gle/8vbKDXJdxTYBe4ou6';
  });
  const [selectedReportContext, setSelectedReportContext] = useState<OPTReport | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for manual validations inside list
  const [selectedReportIdForAction, setSelectedReportIdForAction] = useState<string | null>(null);
  const [validationText, setValidationText] = useState('');
  const [verifierName, setVerifierName] = useState(() => {
    const saved = localStorage.getItem('singkap_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.role === 'PPL') return parsed.name;
    }
    return '';
  });

  // POPT action fields
  const [actionText, setActionText] = useState('');
  const [officerName, setOfficerName] = useState(() => {
    const saved = localStorage.getItem('singkap_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.role === 'POPT') return parsed.name;
    }
    return '';
  });

  // State to track WhatsApp notification drawer
  const [whatsappNotification, setWhatsappNotification] = useState<{
    show: boolean;
    phone: string;
    message: string;
    reportId: string;
    reporterName: string;
  } | null>(null);

  // Helper utility to sanitize and clean phone numbers into international format
  const sanitizePhoneNumber = (phone: string): string => {
    let clean = phone.replace(/[^\d+]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }
    if (clean.startsWith('+')) {
      clean = clean.replace('+', '');
    }
    // Return standard dummy number if too short or missing
    return clean.length >= 9 ? clean : '6281234567890';
  };

  // Helper to submit response updates back to Sheets
  const handlePostReportUpdateToSheets = async (updated: OPTReport) => {
    try {
      await fetch('/api/external-reports/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_response',
          appsScriptUrl: appsScriptUrl.trim(),
          id: updated.id,
          status: updated.status,
          pplNotes: updated.pplNotes || '',
          pplVerifiedBy: updated.pplVerifiedBy || '',
          pplVerifiedAt: updated.pplVerifiedAt || '',
          poptActionTaken: updated.poptActionTaken || '',
          poptControlledBy: updated.poptControlledBy || '',
          poptControlledAt: updated.poptControlledAt || ''
        })
      });
    } catch (e) {
      console.warn('Apps Script update proxy bypassed or returned error (offline fallback mode active):', e);
    }
  };

  // General handler to update a report in both local and external lists and sync to Sheets
  const handleUpdateReport = (updated: OPTReport) => {
    setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setExternalReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    handlePostReportUpdateToSheets(updated);
  };

  // Submit a new report (submitted by Farmers or Officers)
  const handleAddNewReport = async (newReportData: Omit<OPTReport, 'id' | 'status' | 'createdAt'>) => {
    const newReport: OPTReport = {
      ...newReportData,
      id: `REP-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Menunggu Verifikasi',
      createdAt: new Date().toISOString(),
    };

    setReports((prev) => [newReport, ...prev]);

    // Fast-submit attempt to sheets if connected
    try {
      await fetch('/api/external-reports/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'create_report', 
          appsScriptUrl: appsScriptUrl.trim(),
          ...newReport 
        })
      });
      // reload sheets to load it instantly
      fetchExternalReports();
    } catch(err) {
      console.warn('Local creation successful. Sheets synchronization bypassed.');
    }

    setActiveTab('dashboard'); // Redirect to dashboard to see on map
  };

  // PPL Action Handler: Verify report and suggest bio-control directions
  const handleVerifyByPPL = async (reportId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!validationText.trim() || !verifierName.trim()) {
      alert('Tulis catatan advis teknis lapangan beserta nama lengkap penyuluh.');
      return;
    }

    let targetReport: OPTReport | undefined;

    const updatedReports = reports.map((r) => {
      if (r.id === reportId) {
        targetReport = {
          ...r,
          status: 'Terverifikasi',
          pplNotes: validationText,
          pplVerifiedBy: `${verifierName} (PPL Nunbena)`,
          pplVerifiedAt: new Date().toISOString(),
        };
        return targetReport;
      }
      return r;
    });

    // Check if the report is in external reports
    const updatedExtReports = externalReports.map((r) => {
      if (r.id === reportId) {
        targetReport = {
          ...r,
          status: 'Terverifikasi',
          pplNotes: validationText,
          pplVerifiedBy: `${verifierName} (PPL Nunbena)`,
          pplVerifiedAt: new Date().toISOString(),
        };
        return targetReport;
      }
      return r;
    });

    if (targetReport) {
      // Update local storage arrays
      setReports(updatedReports);
      setExternalReports(updatedExtReports);
      
      // Submit update to Google Sheets via proxy
      handlePostReportUpdateToSheets(targetReport);

      // AUTOMATED WHATSAPP NOTIFICATION GENERATION
      const waMsg = `🔴 *SINGKAP OPT KECAMATAN NUNBENA*
*NOTIFIKASI VERIFIKASI PPL*

Yth. Bapak/Ibu Pelapor,
*${targetReport.farmerName}* (Kelompok Tani: ${targetReport.farmerGroup})

Laporan serangan hama *${targetReport.pestName}* pada tanaman *${targetReport.cropType}* di Desa *${targetReport.locationVillage}* telah *DIVERIFIKASI* oleh Penyuluh Lapangan (PPL).

*ADVIS TEKNIS LAPANGAN & REKOMENDASI:*
_"${validationText}"_

*VERIFIKATOR LAPANGAN:*
${verifierName} (PPL Nunbena)

*STATUS SEKARANG:*
[Terverifikasi - POPT mengalokasikan bantuan]

_Sistem Informasi Penjagaan Lahan Terpadu Timor Tengah Selatan_`;

      setWhatsappNotification({
        show: true,
        phone: sanitizePhoneNumber(targetReport.contact),
        message: waMsg,
        reportId: targetReport.id,
        reporterName: targetReport.farmerName
      });
    }

    // Reset controls
    setSelectedReportIdForAction(null);
    setValidationText('');
    setVerifierName('');
  };

  // POPT Action Handler: Execute biological/organic solution and mark Controlled
  const handleControlByPOPT = async (reportId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!actionText.trim() || !officerName.trim()) {
      alert('Tulis detail penyemprotan hayati yang didistribusikan beserta nama lengkap petugas.');
      return;
    }

    let targetReport: OPTReport | undefined;

    const updatedReports = reports.map((r) => {
      if (r.id === reportId) {
        targetReport = {
          ...r,
          status: 'Terkendali',
          poptActionTaken: actionText,
          poptControlledBy: `${officerName} (POPT Purbalingga)`,
          poptControlledAt: new Date().toISOString(),
        };
        return targetReport;
      }
      return r;
    });

    const updatedExtReports = externalReports.map((r) => {
      if (r.id === reportId) {
        targetReport = {
          ...r,
          status: 'Terkendali',
          poptActionTaken: actionText,
          poptControlledBy: `${officerName} (POPT Purbalingga)`,
          poptControlledAt: new Date().toISOString(),
        };
        return targetReport;
      }
      return r;
    });

    if (targetReport) {
      setReports(updatedReports);
      setExternalReports(updatedExtReports);
      
      // Submit update to Google Sheets via proxy
      handlePostReportUpdateToSheets(targetReport);

      // AUTOMATED WHATSAPP NOTIFICATION GENERATION
      const waMsg = `🟢 *SINGKAP OPT KECAMATAN KARANGREJA*
*NOTIFIKASI PENGENDALIAN OPT SELESAI*

Yth. Bapak/Ibu Pelapor,
*${targetReport.farmerName}* (Kelompok Tani: ${targetReport.farmerGroup})

Dengan gembira kami kabarkan bahwa laporan serangan *${targetReport.pestName}* di Desa *${targetReport.locationVillage}* telah diambil *AKSI PENGENDALIAN NYATA* di lapangan oleh POPT.

*TINDAKAN REHABILITASI HAYATI:*
_"${actionText}"_

*PETUGAS LAPANGAN:*
${officerName} (POPT Purbalingga)

*STATUS SEKARANG:*
[Terkendali - Selesai]

_Sawah Lestari Sehat Bebas Racun Kimia Semasa Panen_`;

      setWhatsappNotification({
        show: true,
        phone: sanitizePhoneNumber(targetReport.contact),
        message: waMsg,
        reportId: targetReport.id,
        reporterName: targetReport.farmerName
      });
    }

    // Reset controls
    setSelectedReportIdForAction(null);
    setActionText('');
    setOfficerName('');
  };

  // API Wrapper: Trigger Gemini API on server side for detailed Symptom Analysis
  const handleAnalyzeSymptomWithAI = async (cropType: string, description: string, imageBase64?: string) => {
    const res = await fetch('/api/gemini/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cropType, description, imageBase64 }),
    });
    if (!res.ok) {
      throw new Error('Sistem AI asisten tidak merespons. Sinyal server terputus.');
    }
    return await res.json();
  };

  // API Wrapper: Trigger Gemini API on server side for interactive agricutural chat
  const handleSendChatMessage = async (messagesHistory: any[], reportContext?: OPTReport | null) => {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messagesHistory,
        currentReportContext: reportContext,
      }),
    });
    if (!res.ok) {
      throw new Error('Gagal berkoordinasi dengan server AI.');
    }
    const data = await res.json();
    return data.text;
  };

  // Filter reports displayed in list by search typing (crop, village, pest name)
  const searchedReports = combinedReports.filter((r) => {
    const searchString = `${r.cropType} ${r.pestName} ${r.locationVillage} ${r.farmerName} ${r.id} ${r.status}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans antialiased pb-12">
      
      {/* Dynamic Navigation Header */}
      <header className="bg-white border-b border-slate-100 shadow-2xs sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row justify-between items-center gap-3">
          
          {/* Logo & Headline */}
          <div className="flex items-center space-x-4">
            <img 
              src="https://drive.google.com/thumbnail?id=1iSICCUgZHZuGxe5I31n9gTqKqW0ILCq_&sz=w300"
              alt="Logo SINGKAP"
              className="w-28 h-28 rounded-3xl object-contain bg-white border border-slate-200 p-1.5 shadow-md ring-4 ring-emerald-500/10 hover:scale-105 transition-transform duration-300 flex-shrink-0"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = "https://docs.google.com/uc?export=view&id=1iSICCUgZHZuGxe5I31n9gTqKqW0ILCq_";
              }}
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xl md:text-2xl font-black tracking-tight text-slate-800">SINGKAP OPT</span>
                <span className="bg-emerald-100/80 text-emerald-800 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-200/50 shadow-3xs">Sistem Koordinasi Hayati</span>
              </div>
              <p className="text-[10px] md:text-[11px] text-emerald-800 font-extrabold tracking-wider mt-1 uppercase leading-snug">
                SISTEM INFORMASI DAN GERAKAN AMAN PENGENDALIAN OPT Kec NUNBENA
              </p>
            </div>
          </div>

          {/* User Coordination Role Selector with Auth Gate */}
          <div className="flex flex-wrap items-center gap-2">
            {!isLoggedIn ? (
              <div className="bg-slate-100 p-1.5 rounded-xl flex items-center space-x-2 border border-slate-200/50">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">PROFILE :</span>
                <div className="text-xs px-2.5 py-1.5 rounded-lg bg-white text-slate-700 font-extrabold shadow-2xs flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Petani (Laporan Publik)</span>
                </div>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-xs px-3 py-1.5 rounded-lg font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition hover:scale-[1.03] active:scale-95 flex items-center space-x-1 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-100" />
                  <span>Masuk Petugas PPL/POPT</span>
                </button>
              </div>
            ) : (
              <div className="bg-slate-100 p-1.5 rounded-xl flex items-center space-x-2 border border-slate-200/50">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">PETUGAS :</span>
                <div className={`text-xs px-3 py-1.5 rounded-lg font-black shadow-2xs flex items-center gap-1.5 ${
                  currentUser?.role === 'PPL' ? 'bg-emerald-50 text-emerald-900 border border-emerald-100' : 'bg-sky-50 text-sky-900 border border-sky-100'
                }`}>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-650" />
                  <span>{currentUser?.name}</span>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('singkap_logged_in');
                    localStorage.removeItem('singkap_user');
                    setIsLoggedIn(false);
                    setCurrentUser(null);
                    setVerifierName('');
                    setOfficerName('');
                  }}
                  className="text-xs px-2.5 py-1.5 rounded-lg font-black bg-white hover:bg-red-50 text-red-650 hover:text-red-750 transition flex items-center space-x-1 cursor-pointer border border-slate-200"
                >
                  <span>Keluar</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Hero Welcome banner reflecting the current coordination role */}
      <div className="bg-white border-b border-slate-100 py-6 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-extrabold text-slate-900">
              Selamat Bekerja, <span className="text-emerald-600 font-black">{currentRole}</span>
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
              {currentRole === 'Petani' && 'Kirim laporan serangan agar Petugas POPT melakukan verifikasi lapangan serta melakukan koordinasi penanganan.'}
              {currentRole === 'PPL' && 'Periksa pengajuan baru Kelompok Tani binaan Anda secara sistematis, beri advis verifikasi Petugas POPT lapangan, sertifikasi status laporan.'}
              {currentRole === 'POPT' && 'Rekomendasikan pestisida organik terpadu, rilis agens pengendali hayati (APH/parasitoid) untuk meredam peledakan hama, tandai titik terkendali.'}
            </p>
          </div>

          {/* Quick tab switcher bar */}
          <div className="flex border border-slate-200 rounded-xl overflow-hidden shadow-2xs font-bold text-xs bg-slate-50">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2.5 flex items-center space-x-1.5 transition ${
                activeTab === 'dashboard' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </button>

            <button
              onClick={() => setActiveTab('lapor')}
              className={`px-4 py-2.5 flex items-center space-x-1.5 transition ${
                activeTab === 'lapor' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span>Rekap Laporan</span>
            </button>

            <button
              onClick={() => setActiveTab('lapor-popt')}
              className={`px-4 py-2.5 flex items-center space-x-1.5 transition ${
                activeTab === 'lapor-popt' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sky-500 fill-sky-500/20" />
              <span>Formulir POPT</span>
            </button>

            <button
              onClick={() => setActiveTab('ensiklopedia')}
              className={`px-4 py-2.5 flex items-center space-x-1.5 transition ${
                activeTab === 'ensiklopedia' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ensiklopedia Hayati</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container Stage */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Dynamic Multi-Tab Layout */}
        <div className="space-y-8">
          
          {/* Tab 1: Dashboard, Vector GIS Map and coordination list */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              {/* Welcome Hero Card */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 shadow-lg border border-slate-850 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <Sprout className="w-40 h-40 text-emerald-400" />
                </div>
                <div className="relative z-10 space-y-3 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 fill-emerald-400" /> Pusat Kendali SINGKAP
                    </span>
                    <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1">
                      Sistem Informasi Geografis Penanggulangan OPT Nunbena
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
                      <span>Selamat Datang di Beranda Utama</span>
                    </h2>
                    <p className="text-xs text-slate-350 max-w-3xl leading-relaxed">
                      Sinergi taktis antara <strong className="text-emerald-400 font-extrabold">Petani</strong>, <strong className="text-emerald-400 font-extrabold">Petugas PPL</strong>, dan <strong className="text-sky-300 font-extrabold">Petugas Pengendali OPT (POPT)</strong> Nunbena untuk mengamati, memverifikasi, dan mengendalikan serangan hama secara presisi real-time.
                    </p>
                  </div>
                </div>
              </div>

              {/* Google Sheets Live Database Connection Status Bar */}
              <div className="space-y-3">
                <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-emerald-50/20 via-white to-sky-50/25">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-lg flex items-center justify-center ${syncError ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      <Database className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                        Koneksi Basis Data Google Sheets
                        <span className={`h-2 w-2 rounded-full inline-block ${syncError ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {syncError ? (
                          <span className="text-amber-700 font-medium">Bypass aktif: {syncError} (Menggunakan data lokal)</span>
                        ) : (
                          <span>Sinkronisasi otomatis aktif dengan spreadsheet <code className="bg-slate-100 p-0.5 rounded font-mono text-[9px] text-emerald-800">{extractSheetId(googleSheetUrl).substring(0, 10)}...</code></span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="text-slate-400 font-medium">Sinkronisasi terakhir: <strong className="text-slate-600">{lastSyncedTime}</strong></span>
                    
                    <button
                      onClick={() => setShowIntegrasiConfig((prev) => !prev)}
                      className={`flex items-center gap-1 px-3 py-1.5 border rounded-lg transition text-slate-700 font-bold ${
                        showIntegrasiConfig ? 'bg-slate-100 border-slate-300' : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                      title="Atur URL Spreadsheet & Script"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Atur Integrasi</span>
                    </button>

                    <button
                      onClick={fetchExternalReports}
                      disabled={isSyncing}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-lg shadow-2xs transition active:scale-95 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Menyinkronkan...' : 'Segarkan'}</span>
                    </button>
                  </div>
                </div>

                {/* Collapsible Integration Settings Panel */}
                {showIntegrasiConfig && (
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4 text-left animate-fade-in">
                    <div className="space-y-1 col-span-1 md:col-span-2 border-b border-slate-200 pb-2">
                      <h5 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                        <Settings className="w-4 h-4 text-slate-500" />
                        Pengaturan Integrasi Spreadsheet & Google Apps Script
                      </h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Sesuaikan tautan database utama (Spreadsheet) dan skrip sinkronisasi web app (Apps Script) untuk menyambungkan aplikasi dengan Google Form Anda sendiri.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black tracking-wider text-slate-600 uppercase">
                        Tautan/ID Spreadsheet Utama (Google Sheets URL):
                      </label>
                      <input
                        type="text"
                        value={googleSheetUrl}
                        onChange={(e) => {
                          setGoogleSheetUrl(e.target.value);
                          localStorage.setItem('singkap_opt_google_sheet_url', e.target.value);
                        }}
                        placeholder="Tempel link Google Sheet..."
                        className="w-full text-xs px-3 py-2 rounded-lg bg-white text-slate-800 border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <div className="text-[10px] text-slate-400">
                        ID yang terbaca: <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700 font-mono text-[9px]">{extractSheetId(googleSheetUrl) || 'Kosong'}</code>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black tracking-wider text-slate-600 uppercase">
                        Tautan Exec Apps Script Web App (URL):
                      </label>
                      <input
                        type="text"
                        value={appsScriptUrl}
                        onChange={(e) => {
                          setAppsScriptUrl(e.target.value);
                          localStorage.setItem('singkap_opt_apps_script_url', e.target.value);
                        }}
                        placeholder="https://script.google.com/macros/s/.../exec"
                        className="w-full text-xs px-3 py-2 rounded-lg bg-white text-slate-800 border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <span className="text-[10px] text-slate-400 block">
                        Web App URL yang menangani baca/tulis records POPT.
                      </span>
                    </div>

                    <div className="col-span-1 md:col-span-2 flex justify-between pt-2 border-t border-slate-200">
                      <button
                        onClick={() => {
                          const defaultSheetUrl = 'https://docs.google.com/spreadsheets/d/1h_ULmL-gzwE6zHFk3ureyeRcl_NheM2f86-KH6eYHv8/edit?usp=sharing';
                          const defaultScriptUrl = 'https://script.google.com/macros/s/AKfycbx-aKLTK6WuBkwo6dJjM6wMF8zHPyeQMeMCqzMR6XUSvMHILlxJMmI586WeqgI4SSEXyg/exec';
                          
                          setGoogleSheetUrl(defaultSheetUrl);
                          setAppsScriptUrl(defaultScriptUrl);
                          localStorage.setItem('singkap_opt_google_sheet_url', defaultSheetUrl);
                          localStorage.setItem('singkap_opt_apps_script_url', defaultScriptUrl);
                        }}
                        className="px-3 py-1.5 text-[10px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition"
                      >
                        Kembalikan ke Bawaan
                      </button>
                      
                      <button
                        onClick={() => {
                          fetchExternalReports();
                        }}
                        className="px-3.5 py-1.5 text-[10px] font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-2xs"
                      >
                        Tes & Sinkronkan Sekarang
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Aggregated indicators */}
              <DashboardStats reports={combinedReports} />

              {/* GIS Interactive Vector Map */}
              <InteractiveMap 
                reports={combinedReports} 
              />

              {/* Coordination logs list with role actions */}
              <div id="reports-coordination-panel" className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800">Daftar Titik Sebaran Peta & Arus Kerja Lapangan</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Menunjukkan detail perbaikan, status tinjauan PPL, dan rekap pengendalian POPT.</p>
                  </div>

                  {/* Search query field */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.8 h-3.8 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari desa, hama, pengusul..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-250 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                    />
                  </div>
                </div>

                {searchedReports.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
                    <AlertCircle className="w-8 h-8 text-slate-300" />
                    <p className="text-xs">Tidak ditemukan data laporan aktif untuk pencarian Anda.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {searchedReports.map((report) => (
                      <div key={report.id} id={`report-card-${report.id}`} className="p-5 hover:bg-slate-50/40 transition">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                          
                          {/* Left: Metadata */}
                          <div className="space-y-2 max-w-2xl">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Identification tag */}
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-mono">{report.id}</span>
                              
                              {/* Severity badge */}
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                report.severity === 'Puso' ? 'bg-red-100 text-red-800 border border-red-200' :
                                report.severity === 'Berat' ? 'bg-orange-100 text-orange-855 border border-orange-200' :
                                report.severity === 'Sedang' ? 'bg-amber-100 text-amber-855 border border-amber-200' :
                                'bg-green-100 text-green-800 border border-green-200'
                              }`}>
                                Intensitas: {report.severity}
                              </span>

                              {/* Target crops badge */}
                              <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                                🌾 {report.cropType}
                              </span>

                              {/* Status badge */}
                              <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full ${
                                report.status === 'Terkendali' ? 'bg-sky-100 text-sky-850' :
                                report.status === 'Terverifikasi' ? 'bg-emerald-100 text-emerald-855 font-bold' :
                                'bg-amber-100 text-amber-855 font-bold animate-pulse'
                              }`}>
                                Status: {report.status}
                              </span>
                            </div>

                            <h4 className="text-sm font-extrabold text-slate-900">
                              Serangan Hama "{report.pestName}" di Desa {report.locationVillage} ({report.locationDistrict})
                            </h4>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-[11px] text-slate-500 font-medium pt-1">
                              <span className="flex items-center gap-1">👤 Kelompok Tani: <strong className="text-slate-800">{report.farmerGroup}</strong></span>
                              <span className="flex items-center gap-1">📐 Luas Lahan: <strong className="text-slate-800">{report.affectedArea} Ha</strong></span>
                              <span className="flex items-center gap-1">📅 Pelaporan: <strong className="text-slate-800">{report.attackDate}</strong></span>
                              <span className="flex items-center gap-1">📞 Kontak: <span className="text-slate-600">{report.contact}</span></span>
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100 italic">
                              "{report.description}"
                            </p>

                            {/* PPL Notes Display (if verified) */}
                            {report.pplNotes && (
                              <div className="bg-emerald-50/30 border border-emerald-100/60 p-3.5 rounded-xl text-xs space-y-1">
                                <span className="text-[9px] font-extrabold text-emerald-700 uppercase tracking-wider block">🗣️ Advis Teknis Lapangan (Penyuluh PPL):</span>
                                <p className="text-slate-600 italic">"{report.pplNotes}"</p>
                                <span className="text-[9px] text-slate-400 block font-bold mt-1">Diverifikasi oleh: {report.pplVerifiedBy} • {new Date(report.pplVerifiedAt || '').toLocaleString('id-ID')}</span>
                              </div>
                            )}

                            {/* POPT Actions Display (if controlled) */}
                            {report.poptActionTaken && (
                              <div className="bg-sky-50/30 border border-sky-100/60 p-3.5 rounded-xl text-xs space-y-1">
                                <span className="text-[9px] font-extrabold text-sky-700 uppercase tracking-wider block">🚨 Tindakan Pengendalian Hayati Terpadu (Petugas POPT):</span>
                                <p className="text-slate-600 font-semibold italic">"{report.poptActionTaken}"</p>
                                <span className="text-[9px] text-slate-400 block font-bold mt-1">Dicatat oleh: {report.poptControlledBy} • {new Date(report.poptControlledAt || '').toLocaleString('id-ID')}</span>
                              </div>
                            )}

                          </div>

                          {/* Right: Responsive Actor Action Buttons based on User Role selection */}
                          <div className="flex-shrink-0 flex flex-col gap-2 w-full lg:w-auto items-stretch lg:items-end">

                            {/* Role PPL action options (for Menunggu Verifikasi status) */}
                            {currentRole === 'PPL' && report.status === 'Menunggu Verifikasi' && (
                              <button
                                onClick={() => setSelectedReportIdForAction(selectedReportIdForAction === report.id ? null : report.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-2 rounded-xl transition flex items-center justify-center space-x-1 shadow-xs"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Lakukan Verifikasi PPL</span>
                              </button>
                            )}

                            {/* Role POPT action options (for Terverifikasi status to controlled) */}
                            {currentRole === 'POPT' && report.status === 'Terverifikasi' && (
                              <button
                                onClick={() => setSelectedReportIdForAction(selectedReportIdForAction === report.id ? null : report.id)}
                                className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] px-3 py-2 rounded-xl transition flex items-center justify-center space-x-1 shadow-xs"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Alokasikan Kendali POPT</span>
                              </button>
                            )}

                            {/* Informative Farmers view if waiting for check */}
                            {currentRole === 'Petani' && report.status === 'Menunggu Verifikasi' && (
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100/60 flex items-center justify-center gap-1 animate-pulse">
                                ⏳ Dialirkan ke PPL Nunbena
                              </span>
                            )}
                          </div>

                        </div>

                        {/* Inline Form Expanders for Actions */}
                        {selectedReportIdForAction === report.id && (
                          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-150 animate-fade-in text-xs max-w-xl">
                            {currentRole === 'PPL' ? (
                              <form onSubmit={(e) => handleVerifyByPPL(report.id, e)} className="space-y-3">
                                <h5 className="font-extrabold text-slate-800">Verifikasi Amdal & Cetak Advis Rekomendasi (PPL)</h5>
                                
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[9px] text-slate-500 font-bold mb-1">Nama Penyuluh (PPL) *</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="Nama lengkap & gelar..."
                                      value={verifierName}
                                      onChange={(e) => setVerifierName(e.target.value)}
                                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] text-slate-500 font-bold mb-1">PPL wilayah</label>
                                    <input
                                      type="text"
                                      disabled
                                      value="Kecamatan Nunbena"
                                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-500"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[9px] text-slate-500 font-bold mb-1">Rekomendasi / Catatan Pengendalian Hayati Lapangan *</label>
                                  <textarea
                                    required
                                    rows={2.5}
                                    placeholder="Instruksikan jenis agens hayati (e.g. Beauveria bassiana, parasitoid, dsb) atau ramuan pestisida organik nabati..."
                                    value={validationText}
                                    onChange={(e) => setValidationText(e.target.value)}
                                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                                  />
                                </div>

                                <div className="flex justify-end space-x-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedReportIdForAction(null)}
                                    className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px]"
                                  >
                                    Batal
                                  </button>
                                  <button
                                    type="submit"
                                    className="px-3.5 py-1.5 bg-emerald-600 text-white font-bold rounded-lg text-[10px]"
                                  >
                                    Verifikasi & Beri Rekomendasi
                                  </button>
                                </div>
                              </form>
                            ) : currentRole === 'POPT' ? (
                              <form onSubmit={(e) => handleControlByPOPT(report.id, e)} className="space-y-3">
                                <h5 className="font-extrabold text-slate-800">Catat Tindakan Pengendalian Hayati & Selesaikan Serangan (POPT)</h5>
                                
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[9px] text-slate-500 font-bold mb-1">Nama Petugas Pengendali OPT (POPT) *</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="Nama lengkap..."
                                      value={officerName}
                                      onChange={(e) => setOfficerName(e.target.value)}
                                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] text-slate-500 font-bold mb-1">Unit POPT</label>
                                    <input
                                      type="text"
                                      disabled
                                      value="Kabupaten Purbalingga"
                                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-500"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[9px] text-slate-500 font-bold mb-1">Bantuan Pengendalian / Tanggapan yang Diberikan *</label>
                                  <textarea
                                    required
                                    rows={2.5}
                                    placeholder="Tuliskan bantuan biologi yang disuplai atau aksi fisik (e.g. gropyokan tikus, pembagian agens hayati 10 liter, pelepasan musuh alami)..."
                                    value={actionText}
                                    onChange={(e) => setActionText(e.target.value)}
                                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                                  />
                                </div>

                                <div className="flex justify-end space-x-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedReportIdForAction(null)}
                                    className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px]"
                                  >
                                    Batal
                                  </button>
                                  <button
                                    type="submit"
                                    className="px-3.5 py-1.5 bg-sky-600 text-white font-bold rounded-lg text-[10px]"
                                  >
                                    Tandai OPT Terkendali Selesai
                                  </button>
                                </div>
                              </form>
                            ) : null}
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Rekap Laporan with dual mode: Table View and Lapor Form */}
          {activeTab === 'lapor' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-550 font-medium text-left">
                  {showAddForm 
                    ? 'Silakan isi parameter di bawah ini untuk menambahkan laporan baru ke sistem.'
                    : 'Berikut diringkas rekap seluruh data koordinasi serangan OPT nasional maupun lokal dari Google Sheets.'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs active:scale-95 shrink-0 ${
                    showAddForm 
                      ? 'bg-slate-900 hover:bg-slate-800 text-white' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {showAddForm ? '← Lihat Rekap Laporan' : '📂 Buat Laporan OPT Baru'}
                </button>
              </div>

              {showAddForm ? (
                <div className="max-w-3xl mx-auto animate-fade-in">
                  <ReportForm 
                    onSubmitReport={(newRep) => {
                      handleAddNewReport(newRep);
                      setShowAddForm(false); // return to table view on success
                    }} 
                    onAnalyzeAI={handleAnalyzeSymptomWithAI} 
                  />
                </div>
              ) : (
                <div className="animate-fade-in">
                  <RekapLaporanTable 
                    reports={combinedReports}
                    isSyncing={isSyncing}
                    onRefresh={fetchExternalReports}
                    syncError={syncError}
                    onUpdateReport={handleUpdateReport}
                    isLoggedIn={isLoggedIn}
                    currentUser={currentUser}
                    onTriggerLogin={() => setIsLoginModalOpen(true)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Detailed Pest Catalog (Ensiklopedia OPT) */}
          {activeTab === 'ensiklopedia' && (
            <div className="animate-fade-in">
              <PestCatalog />
            </div>
          )}

          {/* Tab 5: Lapor Petugas POPT (Google Form Embedded with configuration fallback) */}
          {activeTab === 'lapor-popt' && (
            <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                
                {/* Visual Header */}
                <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-sky-800 to-sky-600 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1 block text-left">
                    <h3 className="font-extrabold text-sm flex items-center gap-2">
                       <ShieldCheck className="w-5 h-5 text-sky-200" />
                       Laporan Aksi Petugas Pengendali OPT (POPT)
                    </h3>
                    <p className="text-[11px] text-sky-100 max-w-xl text-left">
                       Media pelaporan aktivitas pemantauan, gropyokan, distribusi agens hayati, dan pelepasan musuh alami oleh Petugas POPT Lapangan.
                    </p>
                  </div>
                  
                  {/* Dynamic Customizer for Google Form URL */}
                  <div className="bg-sky-900/45 p-2.5 rounded-xl border border-sky-500/20 w-full md:w-auto">
                    <label className="block text-[9px] font-black tracking-wider text-sky-200 uppercase mb-1 text-left">
                      Kustomisasi URL Google Form:
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={googleFormUrl}
                        onChange={(e) => {
                          setGoogleFormUrl(e.target.value);
                          localStorage.setItem('singkap_opt_google_form', e.target.value);
                        }}
                        placeholder="Tempel link Google Form di sini..."
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-white text-slate-800 border-none outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-64"
                      />
                      <button
                        onClick={() => {
                          const fallback = 'https://forms.gle/8vbKDXJdxTYBe4ou6';
                          setGoogleFormUrl(fallback);
                          localStorage.setItem('singkap_opt_google_form', fallback);
                        }}
                        className="px-2.5 py-1.5 text-[10px] font-bold bg-white/20 hover:bg-white/30 text-white rounded-lg transition"
                        title="Kembalikan ke form bawaan"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>

                {/* Integration Notice Bar */}
                <div className="bg-sky-50 border-b border-sky-100/70 p-4 text-[11px] text-sky-950 flex items-start gap-2.5 leading-relaxed text-left">
                  <AlertCircle className="w-4.5 h-4.5 text-sky-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-sky-900 block mb-0.5">💡 Informasi Integrasi Google Form:</span>
                    Halaman ini menampilkan form pelunasan laporan POPT dari Kelompok Tani secara langsung. Secara default, link diatur ke <strong className="text-sky-900 font-bold">https://forms.gle/8vbKDXJdxTYBe4ou6</strong>.
                  </div>
                </div>

                {/* Main Embed Area */}
                <div className="relative w-full min-h-[550px] bg-slate-50 flex flex-col justify-center items-center">
                  {googleFormUrl.includes('forms.gle') ? (
                    <div className="p-8 text-center max-w-xl space-y-5 flex flex-col items-center">
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100">
                        <FileText className="w-8 h-8" />
                      </div>
                      
                      <div className="space-y-2 text-center">
                        <h4 className="text-sm font-extrabold text-slate-805">Formulir Laporan Petugas POPT Aktif</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Anda sedang menggunakan tautan resmi <code className="bg-slate-100 p-1 rounded font-mono text-emerald-700 text-[11px] break-all">{googleFormUrl}</code>. 
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Google membatasi pembukaan tautan pendek (<code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">forms.gle</code>) langsung di dalam bingkai aplikasi (iframe) demi privasi pengguna dan mencegah kesalahan <em>"Maaf, file yang Anda minta tidak ada"</em>.
                        </p>
                      </div>

                      <div className="py-2">
                        <a
                          href={googleFormUrl}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3.5 rounded-xl transition shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-xs text-center"
                        >
                          <span>Buka & Isi Formulir Sekarang ↗</span>
                        </a>
                      </div>

                      <div className="border-t border-slate-200/80 pt-4 w-full text-left space-y-2 text-[11px] text-slate-500 leading-relaxed">
                        <span className="font-bold text-slate-700 block text-xs">💡 Tips Menyematkan Google Form dalam Halaman Ini:</span>
                        <p>Jika Anda ingin form tersebut tampil utuh di halaman ini tanpa perlu membuka tab baru, gunakan link sematan panjang:</p>
                        <ol className="list-decimal pl-4.5 space-y-1 block">
                          <li>Buka form Anda di Google Forms editor.</li>
                          <li>Klik tombol <strong className="text-slate-700">Kirim</strong> di sudut kanan atas.</li>
                          <li>Pilih ikon sematan <strong className="text-slate-700 font-mono">&lt; &gt;</strong>.</li>
                          <li>Salin bagian URL di dalam tanda kutip atribut <code className="bg-slate-150 px-1 rounded text-red-700 font-mono">src="..."</code> (misalnya yang diawali dengan <code className="bg-slate-150 px-1 rounded text-slate-600 font-mono text-[10px]">https://docs.google.com/forms/d/e/...</code>).</li>
                          <li>Tempel link tersebut pada input <strong className="text-slate-700">Kustomisasi URL</strong> di atas.</li>
                        </ol>
                      </div>
                    </div>
                  ) : (
                    <iframe
                      src={googleFormUrl}
                      className="w-full h-[650px] border-0"
                      allow="geolocation"
                      title="Google Form Lapor Petugas POPT"
                    >
                      Memuat Google Form...
                    </iframe>
                  )}
                  
                  {/* Footer link to directly open if iframe is restricted or sandboxed */}
                  <div className="p-3.5 bg-slate-100 border-t border-slate-200/60 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500 w-full mt-auto">
                    <span>Butuh tautan luar langsung untuk dibagikan ke lapangan?</span>
                    <a
                      href={googleFormUrl}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold px-3.5 py-1.5 rounded-lg transition text-[11px]"
                    >
                      Buka Form di Tab Baru ↗
                    </a>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      {/* Global Real-Time WhatsApp Direct Broadcast Redirection Overlay Simulation Modal */}
      {whatsappNotification && whatsappNotification.show && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-55 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-emerald-100 text-left space-y-4">
            
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Respon Tercatat & Draft WhatsApp Siap</h4>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Integrasi Pintar WhatsApp Pelapor</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Tanggapan Anda berhasil disimpan ke database lokal dan diunggah ke Google Sheet. Kini, teruskan notifikasi WhatsApp formal ini langsung ke kontak pelapor (<strong>{whatsappNotification.reporterName}</strong>):
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-mono text-slate-700 max-h-[180px] overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
              {whatsappNotification.message}
            </div>

            <div className="bg-emerald-50 text-emerald-950 p-3 rounded-xl border border-emerald-100/50 text-[11px] leading-relaxed flex gap-2">
              <span className="shrink-0">📲</span>
              <span>
                Saat Anda menekan tombol di bawah, sistem akan membuka tautan web WhatsApp resmi yang secara otomatis mengisi nomor tujuan (<strong className="text-emerald-900 font-bold">+{whatsappNotification.phone}</strong>) beserta draft tanggapan di atas.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setWhatsappNotification(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Tutup Saja
              </button>
              <a
                href={`https://api.whatsapp.com/send?phone=${whatsappNotification.phone}&text=${encodeURIComponent(whatsappNotification.message)}`}
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noopener noreferrer"
                onClick={() => setWhatsappNotification(null)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-emerald-600/20 active:translate-y-0.5 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Kirim via WhatsApp Sekarang ↗</span>
              </a>
            </div>

          </div>
        </div>
      )}

      {/* Floating Visitor Counter Popup (Bottom Left) */}
      {visitorCount !== null && showVisitorPopup && (
        <div id="visitor-popup" className="fixed bottom-4 left-4 z-50 animate-shake transition-all duration-300">
          <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg p-3 rounded-2xl flex items-center gap-3 max-w-sm ring-4 ring-emerald-500/5 hover:scale-[1.02] transition-transform duration-300 relative group pr-7">
            <button
              onClick={() => setShowVisitorPopup(false)}
              className="absolute top-1.5 right-1.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
              title="Sembunyikan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-[9px] font-black tracking-wider uppercase text-emerald-800">Sistem Live</span>
              </div>
              <p className="text-xs font-black text-slate-800 leading-none">
                {visitorCount.toLocaleString('id-ID')} <span className="text-[9px] font-bold text-slate-500 font-sans uppercase">Kunjungan</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal Auth Handler */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(role, name, email) => {
          localStorage.setItem('singkap_logged_in', 'true');
          localStorage.setItem('singkap_user', JSON.stringify({ role, name, email }));
          setIsLoggedIn(true);
          setCurrentUser({ role, name, email });
          if (role === 'PPL') {
            setVerifierName(name);
          } else if (role === 'POPT') {
            setOfficerName(name);
          }
        }}
      />

    </div>
  );
}
