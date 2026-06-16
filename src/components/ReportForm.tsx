import React, { useState, useRef, useEffect } from 'react';
import { OPTReport, SeverityLevel } from '../types';
import { Upload, AlertCircle, Sparkles, Check, Image as ImageIcon } from 'lucide-react';

interface ReportFormProps {
  onSubmitReport: (report: Omit<OPTReport, 'id' | 'status' | 'createdAt'>) => void;
  onAnalyzeAI?: (cropType: string, description: string, imageBase64?: string) => Promise<any>;
}

// Hardcoded safe mock sample images of common pests so farmers can easily test AI capabilities without needing to take a photo first.
const SAMPLE_PEST_IMAGES = [
  {
    name: 'Wereng Cokelat',
    crop: 'Padi',
    description: 'Batang padi kebasahan dan menguning dipenuhi ribuan kutu cokelat kecil merayap.',
    url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=400&auto=format&fit=crop&q=60', // simulating paddy field infestation
  },
  {
    name: 'Ulat Grayak',
    crop: 'Jagung',
    description: 'Banyak daun jagung bolong bergerigi, terdapat gumpalan kotoran ulat di pucuk.',
    url: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=400&auto=format&fit=crop&q=60', // corn plant leaf detail
  },
  {
    name: 'Kutu Kebul',
    crop: 'Cabai Merah',
    description: 'Daun cabai melengkung kaku mangkok, menguning, dan ada kutu putih kecil terbang saat daun tersentuh.',
    url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=400&auto=format&fit=crop&q=60', // pepper plant leaf view
  }
];

export default function ReportForm({ onSubmitReport, onAnalyzeAI }: ReportFormProps) {
  const [farmerName, setFarmerName] = useState('');
  const [farmerGroup, setFarmerGroup] = useState('');
  const [contact, setContact] = useState('');
  const [cropType, setCropType] = useState('Padi');
  const [pestName, setPestName] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel>('Ringan');
  const [affectedArea, setAffectedArea] = useState('');
  const [locationVillage, setLocationVillage] = useState('');
  const [locationDistrict, setLocationDistrict] = useState('Nunbena');

  // Auto adjust Kecamatan based on Desa / Village (Always Nunbena)
  useEffect(() => {
    setLocationDistrict('Nunbena');
  }, [locationVillage]);

  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string>(''); // base64 string
  
  // AI assist state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [aiError, setAiError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Drag and Drop
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const processFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Select simulated crop pest image
  const handleSelectSample = (sample: typeof SAMPLE_PEST_IMAGES[0]) => {
    setCropType(sample.crop);
    setDescription(sample.description);
    // Use the online Unsplash sample image
    setImage(sample.url);
    setAiResult(null);
  };

  // AI-powered automated analysis
  const handleTriggerAI = async () => {
    if (!description.trim() && !image) {
      setAiError('Silakan masukkan deskripsi gejala terlebih dahulu atau lampirkan gambar.');
      return;
    }
    setAiError('');
    setIsAnalyzing(true);
    setAiResult(null);

    try {
      if (onAnalyzeAI) {
        // Send base64 image or description
        // If image is our sample unsplash URL, just send description since we cannot base64 encode easily without CORS limits.
        const base64ForAPI = image && image.startsWith('data:image') ? image : undefined;
        
        const result = await onAnalyzeAI(cropType, description, base64ForAPI);
        setAiResult(result);
        
        // Auto-populate form from AI response
        if (result.pestName) {
          setPestName(result.pestName);
        }
      }
    } catch (err: any) {
      console.error(err);
      setAiError('Sistem AI asisten tidak merespons. Sinyal server terputus atau kunci API salah.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!farmerName || !farmerGroup || !locationVillage || !affectedArea) {
      alert('Mohon isi semua field penting (*) seperti Nama Petani, Kelompok Tani, Desa, dan Luas Lahan.');
      return;
    }

    // Generate random coordinates surrounding Nunbena region, Timor Tengah Selatan
    // Latitude: -9.7500 to -9.6500, Longitude: 124.1600 to 124.2900
    const lat = -9.7042 + (Math.random() - 0.5) * 0.10;
    const lng = 124.2250 + (Math.random() - 0.5) * 0.13;

    onSubmitReport({
      farmerName,
      farmerGroup,
      contact: contact || '0812-xxxx-xxxx',
      cropType,
      pestName: pestName || 'OPT Tidak Terdefinisi',
      severity,
      affectedArea: parseFloat(affectedArea) || 0.1,
      locationVillage,
      locationDistrict,
      latitude: lat,
      longitude: lng,
      attackDate: new Date().toISOString().split('T')[0],
      description: description + (aiResult ? `\n\n[Rekomendasi AI Singkap]: ${aiResult.summary}` : ''),
      imageUrl: image || undefined,
    });

    setSubmitSuccess(true);
    // Reset form after timer
    setTimeout(() => {
      setFarmerName('');
      setFarmerGroup('');
      setContact('');
      setPestName('');
      setAffectedArea('');
      setLocationVillage('');
      setDescription('');
      setImage('');
      setAiResult(null);
      setSubmitSuccess(false);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
      <div className="bg-emerald-600 px-6 py-5 text-white">
        <h3 className="font-bold text-lg">Buat Laporan Serangan OPT Baru</h3>
        <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
          Unggah bukti fisik kerusakan agar Petugas POPT dapat segera memverifikasi dan menyuplai penanganan hayati ramah lingkungan.
        </p>
      </div>

      {submitSuccess ? (
        <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-800">Laporan Berhasil Terkirim!</h4>
          <p className="text-xs text-slate-500 max-w-sm">
            Titik koordinat berhasil dipetakan secara sistematis. Sistem berkoordinasi otomatis mengirim notifikasi kepada PPL Nunbena.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Section 1: Profil Petani */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">I. Identitas Lokasi & Pelapor</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nama Lengkap Petani *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Pak Sukardi"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Kelompok Tani *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Tani Makmur II"
                  value={farmerGroup}
                  onChange={(e) => setFarmerGroup(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">No. Kontak WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="Misal: 0812-3456-78"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Desa / Kelurahan Lahan *</label>
                <select
                  required
                  value={locationVillage}
                  onChange={(e) => setLocationVillage(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50 text-slate-800 font-medium"
                >
                  <option value="" disabled>-- Pilih Desa Nunbena --</option>
                  <option value="Fetomone">Fetomone</option>
                  <option value="Lillana">Lillana</option>
                  <option value="Noebesi">Noebesi</option>
                  <option value="Nunbena">Nunbena</option>
                  <option value="Taneotob">Taneotob</option>
                  <option value="Tunbes">Tunbes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Kecamatan (Sesuai Wilayah Kerja) *</label>
                <select
                  value={locationDistrict}
                  onChange={(e) => setLocationDistrict(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50 font-semibold text-slate-700"
                >
                  <option value="Nunbena">Nunbena</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Detail Serangan OPT */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center justify-between">
              <span>II. Kerusakan Komoditas & Gejala Serangan</span>
              <span className="text-[10px] text-slate-400 normal-case font-normal">Pilih "Sampul Hama" di samping jika tidak ada foto</span>
            </h4>

            {/* Simulated preset sample images block */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Simulasi Pengujian Cepat (Klik Sampel OPT):</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SAMPLE_PEST_IMAGES.map((sample) => (
                  <button
                    key={sample.name}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="bg-white p-2 rounded-lg border border-slate-200 hover:border-emerald-500 flex items-center space-x-2.5 text-left transition group"
                  >
                    <img 
                      src={sample.url} 
                      alt={sample.name} 
                      className="w-10 h-10 object-cover rounded-md group-hover:scale-105 transition"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 leading-tight">{sample.name}</h5>
                      <span className="text-[9px] bg-slate-100 px-1 py-0.5 rounded text-slate-500">{sample.crop}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Jenis Tanaman Komoditas *</label>
                  <select
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
                  >
                    <option value="Padi">Padi (Sawah Irigasi/Tadah Hujan)</option>
                    <option value="Jagung">Jagung</option>
                    <option value="Cabai">Cabai Merah / Cabai Rawit</option>
                    <option value="Bawang Merah">Bawang Merah</option>
                    <option value="Kedelai">Kedelai / Kacang Tanah</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Luas Lahan Terdampak * (Hektar / Ha)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Misal: 0.5 atau 1.2"
                    value={affectedArea}
                    onChange={(e) => setAffectedArea(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Tingkat Kerusakan *</label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
                    >
                      <option value="Ringan">Ringan (Kerusakan &lt; 20%)</option>
                      <option value="Sedang">Sedang (Kerusakan 20% - 40%)</option>
                      <option value="Berat">Berat (Kerusakan 40% - 85%)</option>
                      <option value="Puso">Puso (Gagal Panen / &gt; 85%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Nama OPT Terduga</label>
                    <input
                      type="text"
                      placeholder="Wereng / Ulat (Isi otomatis jika gunakan AI)"
                      value={pestName}
                      onChange={(e) => setPestName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* Graphical File Upload or Sample Drag-Drop */}
              <div className="flex flex-col">
                <label className="block text-xs font-medium text-slate-600 mb-1">Foto Bukti Fisik Kerusakan Tanaman / Hama</label>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 transition-all ${
                    dragOver ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {image ? (
                    <div className="relative w-full h-36 flex items-center justify-center overflow-hidden rounded-xl">
                      <img 
                        src={image} 
                        alt="Bukti Serangan Tanaman" 
                        className="max-h-full max-w-full object-contain rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => setImage('')}
                        className="absolute bottom-2 right-2 bg-slate-900/60 hover:bg-slate-900/80 text-white rounded-lg px-2.5 py-1 text-[10px] font-semibold transition"
                      >
                        Hapus Foto
                      </button>
                    </div>
                  ) : (
                    <div className="text-center space-y-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="text-slate-500 text-xs text-center">
                        <span className="font-bold text-emerald-600 hover:underline">Pilih file foto</span> atau seret kesini
                      </div>
                      <p className="text-[10px] text-slate-400">JPG, PNG atau WebP (Maks 5 MB)</p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Symptoms Description */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Deskripsi & Gejala Fisilik Lahan Secara Detail *</label>
              <textarea
                required
                rows={3}
                placeholder="Deskripsikan pola kerusakan, bercak daun, bagian yang patah, warna aneh pada batang padi, atau kelakuan ulat dan hama serangga yang tampak..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
              />
            </div>

            {/* AI Assistant Identification Trigger */}
            <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100/60 p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex space-x-2">
                  <div className="mt-0.5 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Dukungan AI SINGKAP OPT</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                      Kirim data gejala di atas untuk di-analisis secara instan menggunakan Gemini 3.5-Flash. Sistem akan otomatis menyarankan agens hayati ramah lingkungan & mengisi data OPT sasaran.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isAnalyzing || (!description.trim() && !image)}
                  onClick={handleTriggerAI}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center space-x-1 transition shadow-xs"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Menganalisis...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Analisis AI</span>
                    </>
                  )}
                </button>
              </div>

              {/* AI Analysis Result Display */}
              {aiResult && (
                <div className="bg-white rounded-xl border border-emerald-100/80 p-4 space-y-3 text-xs leading-relaxed animate-fade-in">
                  <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Pest terdeteksi (AI)</span>
                      <strong className="text-emerald-700 text-xs font-extrabold">{aiResult.pestName}</strong>
                      <span className="text-[9px] text-slate-400 italic font-mono block">{aiResult.scientificName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 block">Kecocokan Gejala</span>
                      <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold font-mono text-[10px]">{aiResult.confidence}</span>
                    </div>
                  </div>

                  <div>
                    <h6 className="font-bold text-slate-800">Ringkasan Analisis Alami:</h6>
                    <p className="text-slate-600 text-[11px] mt-0.5">{aiResult.summary}</p>
                  </div>

                  {aiResult.ecoFriendlyControls && aiResult.ecoFriendlyControls.length > 0 && (
                    <div className="space-y-2">
                      <h6 className="font-bold text-slate-800">Rekomendasi Organik / Hayati yang Disarankan:</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {aiResult.ecoFriendlyControls.slice(0, 2).map((control: any, index: number) => (
                          <div key={index} className="bg-emerald-50/20 rounded-lg p-2.5 border border-emerald-100/30">
                            <h7 className="font-bold text-[11px] text-emerald-800 flex items-center gap-1">🟢 {control.title}</h7>
                            <p className="text-slate-500 text-[10px] mt-0.5 leading-relaxed">{control.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiResult.isFallback && (
                    <p className="text-[9px] text-amber-600 font-medium">⚠️ {aiResult.notice}</p>
                  )}
                </div>
              )}

              {aiError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-start space-x-1.5 text-[11px]">
                  <AlertCircle className="w-4.2 h-4.2 mt-0.5 flex-shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition text-xs shadow-sm flex items-center justify-center space-x-2"
          >
            <span>Kirim & Daftarkan Serangan di Peta Kerawanan</span>
          </button>
        </form>
      )}
    </div>
  );
}
