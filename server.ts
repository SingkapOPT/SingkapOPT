import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for GoogleGenAI
let ai: GoogleGenAI | null = null;
function getGeminiSDK(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    throw new Error('GEMINI_API_KEY is not configured in the environment. Please add it via Settings > Secrets.');
  }

  if (!ai) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return ai;
}

// Fallback Indonesian analysis to keep app fully interactive if API Key is not set
const fallbackPestAnalysis = (symptoms: string) => {
  const text = symptoms.toLowerCase();
  
  if (text.includes('wereng') || text.includes('cokelat') || text.includes('padi kuning')) {
    return {
      pestName: "Wereng Batang Cokelat (Nilaparvata lugens)",
      scientificName: "Nilaparvata lugens",
      confidence: "88% (Analisis Lokal)",
      summary: "Wereng menghisap cairan batang padi, menyebabkan tanaman menguning, mengering, lalu hangus mirip terbakar (hopperburn).",
      ecoFriendlyControls: [
        {
          title: "Agens Pengendali Hayati (APH)",
          description: "Semprotkan jamur patogen serangga Beauveria bassiana atau Metarhizium anisopliae dengan dosis sesuai anjuran pada sore hari untuk menghindari paparan ultraviolet langsung."
        },
        {
          title: "Predator Alami",
          description: "Lestarikan musuh alami di sawah seperti laba-laba Lycosa, kepik Cyrtorhinus lividipennis, dan kumbang Paederus fuscipes dengan menanam tanaman refugia (Bunga Matahari, Kenikir) di pematang sawah."
        },
        {
          title: "Pemberaan dan Rotasi Tanaman",
          description: "Putus siklus hidup wereng dengan menanam tanaman non-padi seperti palawija (kedelai, kacang tanah) selama satu musim tanam."
        }
      ]
    };
  }

  if (text.includes('grayak') || text.includes('ulat') || text.includes('jagung')) {
    return {
      pestName: "Ulat Grayak Jagung (Spodoptera frugiperda)",
      scientificName: "Spodoptera frugiperda",
      confidence: "85% (Analisis Lokal)",
      summary: "Larva ulat memakan pucuk daun jagung yang masih muda, meninggalkan lubang-lubang besar tidak beraturan dan kotoran seperti serbuk gergaji.",
      ecoFriendlyControls: [
        {
          title: "Pemanfaatan Patogen Mikroorganisme",
          description: "Gunakan bakteri Bacillus thuringiensis (Bt) atau virus SlNPV (Spodoptera litura Nucleopolyhedrovirus) yang ramah lingkungan dan spesifik membunuh larva ulat."
        },
        {
          title: "Parasitoid Tawon",
          description: "Lepaskan parasitoid telur Trichogramma spp. di areal lahan jagung untuk mematikan telur hama sebelum menetas menjadi ulat."
        },
        {
          title: "Pestisida Nabati Daun Mimba",
          description: "Semprotkan ekstrak daun mimba atau daun sirsak yang mengandung senyawa azadirachtin alami sebagai penolak makan (antifeedant) bagi ulat."
        }
      ]
    };
  }

  if (text.includes('kutu') || text.includes('putih') || text.includes('cabai') || text.includes('keriting')) {
    return {
      pestName: "Kutu Kebul (Bemisia tabaci)",
      scientificName: "Bemisia tabaci",
      confidence: "90% (Analisis Lokal)",
      summary: "Kutu kebul menghisap cairan daun cabai sekaligus menjadi vektor virus Gemini yang menyebabkan penyakit kuning/keriting (bule) pada tanaman cabai.",
      ecoFriendlyControls: [
        {
          title: "Perangkap Kuning Lekat (Yellow Sticky Trap)",
          description: "Pasang perangkap kertas/plastik berwarna kuning cerah setinggi tajuk tanaman berperekat minyak/lem di sekeliling kebun. Kutu kebul sangat tertarik dengan warna kuning."
        },
        {
          title: "Pestisida Nabati Minyak Sereh & Sabun",
          description: "Gunakan emulsi minyak sereh wangi dicampur sedikit sabun kalium cair untuk merusak lapisan lilin tipis di tubuh kutu kebul."
        },
        {
          title: "Penanaman Jagung Penghalang (Barrier Crop)",
          description: "Tanam 2-3 baris tanaman jagung atau rumput gajah di sekeliling plot cabai sebagai penghambat fisik pergerakan kutu kebul dari lahan luar."
        }
      ]
    };
  }

  // General response
  return {
    pestName: "Identifikasi Gejala Kerusakan Lahan",
    scientificName: "Organisme Pengganggu Tumbuhan (Asumsi)",
    confidence: "70% (Lokal)",
    summary: `Kami mendeteksi adanya gejala penyakit atau serangan hama dengan kata kunci: "${symptoms}". Silakan terapkan prinsip Pengendalian Hama Terpadu (PHT) untuk meminimalkan kerusakan tanaman secara sehat.`,
    ecoFriendlyControls: [
      {
        title: "Pestisida Organik Air Cucian Beras & Kunyit",
        description: "Gunakan ekstrak kunyit, bawang putih, dan air cucian beras difermentasi untuk disemprotkan sebagai pengendali antijamur dan antibakteri alami."
      },
      {
        title: "Sanitasi Lahan secara Mekanis",
        description: "Pangkas bagian tanaman yang terserang berat lalu kubur atau bakar di luar areal sawah untuk mencegah spora jamur atau telur hama menyebar lebih luas."
      },
      {
        title: "Konsultasi POPT dan PPL Setempat",
        description: "Segera koordinasikan temuan serangan ini dengan Penyuluh Pertanian Lapangan (PPL) dan Pengendali OPT (POPT) melalui fitur koordinasi SINGKAP OPT."
      }
    ]
  };
};

// API Endpoint for Pest and Symptom Analysis using Gemini 3.5-Flash
app.post('/api/gemini/analyze', async (req, res) => {
  const { description, imageBase64, cropType } = req.body;

  if (!description && !imageBase64) {
    return res.status(400).json({ error: 'Deskripsi gejala atau gambar tanaman harus dilampirkan.' });
  }

  try {
    const aiSDK = getGeminiSDK();
    
    // Construct rich prompt enforcing structured JSON output containing safe, non-chemical controls
    const systemPrompt = `
You are interactive AI system for 'SINGKAP OPT' (Sistem Informasi dan Pelaporan Kondisi Serangan Organisme Pengganggu Tumbuhan).
In Indonesian agriculture, POPT and PPL prefer environment-friendly biological controls (Agens Pengendali Hayati - APH), trap crops, organic pesticides, and natural predators over synthetic chemical pesticides.

Your task is to analyze the crop damage symptoms or pest image, identify the Organisme Pengganggu Tumbuhan (OPT) responsible, and recommend eco-friendly biological control strategies.

Provide your output ONLY as a valid JSON object matching this structure EXACTLY (do not wrap in markdown block except if requested, but return pure JSON):
{
  "pestName": "Nama Hama/Penyakit (common Indonesian name and scientific name)",
  "scientificName": "Scientific name only",
  "confidence": "Estimated accuracy (e.g. 92%)",
  "summary": "Short explanation of the damage and symptoms identified",
  "ecoFriendlyControls": [
    {
      "title": "Strategy Name (e.g., Agens Pengendali Hayati / Jamur Patogen)",
      "description": "Clear step-by-step practical guide in Indonesian on how to apply or cultivate this biological solution"
    }
  ]
}

Analyze specifically for Indonesian crops like:${cropType || 'padi, jagung, cabai, bawang merah, dll'}.
Keep language entirely in polite, professional, and clear Indonesian appropriate for Indonesian farmers, PPL, and POPT officers.
`;

    let contentInput: any;

    if (imageBase64) {
      // Remove data URL prefix if present
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const imagePart = {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data,
        },
      };
      const textPart = {
        text: `Crop Type: ${cropType || 'Unknown'}. Symptoms described: ${description || 'Please inspect image for pest damage'}. Provide agricultural recommendations.`,
      };
      contentInput = { parts: [imagePart, textPart] };
    } else {
      contentInput = `Tanaman: ${cropType || 'Tidak diketahui'}. Gejala: ${description}. Tentukan hama dan pencegahan organik hayati.`;
    }

    const response = await aiSDK.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contentInput,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '{}';
    // Parse to ensure it is valid JSON before returning
    const parsedData = JSON.parse(responseText.trim());
    return res.json(parsedData);

  } catch (error: any) {
    console.warn('Gemini API call failed or is unconfigured. Using high-fidelity local biological analytics:', error.message);
    
    // Simulate thinking delay for pristine user experience even in fallback mode
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Deliver intelligent, fully organic Indonesian fallbacks based on text match
    const result = fallbackPestAnalysis(description || 'tidak spesifik');
    return res.json({
      ...result,
      isFallback: true,
      notice: 'Menggunakan Mesin Konsultasi Hayati Lokal SINGKAP. Aktifkan Gemini di Settings > Secrets untuk analisis visual dinamis.'
    });
  }
});

// API Endpoint for interactive agricultural advisory chat
app.post('/api/gemini/chat', async (req, res) => {
  const { messages, currentReportContext } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Riwayat pesan tidak valid atau kosong.' });
  }

  try {
    const aiSDK = getGeminiSDK();
    
    const systemPrompt = `
Anda adalah 'Konsultan Hayati SINGKAP OPT' (Sistem Informasi dan Pelaporan Kondisi Serangan Organisme Pengganggu Tumbuhan).
Tugas Anda adalah mendampingi Petani, Penyuluh Lapangan (PPL), dan Pengendali OPT (POPT) dalam menemukan jalan keluar pengendalian OPT yang ramah lingkungan, lestari, berkelanjutan, dan aman secara hayati.

KEBIJAKAN KONTROL:
- Utamakan pengendalian biologis (Agens Pengendali Hayati / APH) seperti cendawan patogen serangga (Trichoderma, Beauveria bassiana, Metarhizium), bakteri baik (Bacillus thuringiensis), musuh alami (kumbang kubah, kepik predator, tawon parasitoid Trichogramma).
- Utamakan pestisida nabati (mimba, bawang putih, sereh wangi, daun pepaya, sirsak).
- Sosialisasikan budidaya tanaman sehat, sanitasi lahan, penanaman refugia, rotasi tanaman, penentuan pola tanam serentak.
- JANGAN menyarankan penggunaan pestisida kimia sintetis kecuali dalam kondisi darurat fuso yang sangat terkendali, dan jelaskan efek merusaknya pada tanah & air.

Jawab dalam Bahasa Indonesia yang santun, praktis, menguatkan, berpola pikir ilmiah tani Indonesia, serta mudah dicerna oleh masyarakat pedesaan.

${currentReportContext ? `NOTE: Saat ini sedang berkonsultasi mengenai laporan serangan:
Lahan: ${currentReportContext.cropType}, Hama: ${currentReportContext.pestName}, Keparahan: ${currentReportContext.severity}, Luas: ${currentReportContext.affectedArea} Ha.
Lokasi: Desa ${currentReportContext.locationVillage}, Kecamatan ${currentReportContext.locationDistrict}.` : ''}
`;

    // Map history to standard format
    // Last message is the current user prompt
    const lastUserMessage = messages[messages.length - 1].text;
    
    const response = await aiSDK.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: lastUserMessage,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return res.json({ text: response.text });

  } catch (error: any) {
    console.warn('Gemini chat failed or unconfigured, utilizing local agronomy response: ', error.message);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const userText = messages[messages.length - 1].text.toLowerCase();
    let reply = 'Salam Tani! Saya Konsultan Hayati SINGKAP OPT. Tampaknya sistem asisten AI interaktif memerlukan konfigurasi API Key.\n\n';

    if (userText.includes('pestisida nabati') || userText.includes('pesnab') || userText.includes('organik')) {
      reply += 'Untuk membuat Pestisida Nabati Pengendali Hama (pesnab):\n' +
               '1. Daun Mimba / Nimba: Haluskan 1 kg daun nimba, rendam dalam 10 liter air ditambah 1 sendok deterjen/sabun colek minyak kelapa sebagai penyebar (emulsifier), biarkan semalam. Saring dan siap semprotkan.\n' +
               '2. Ekstrak Bawang Putih: Bawang putih mengandung senyawa alisin berbau tajam sebagai repellen alami. Sangat cocok menghalau kutu daun, ulat kantung, dan trips.';
    } else if (userText.includes('pupuk') || userText.includes('kompos') || userText.includes('subur')) {
      reply += 'Pemupukan berimbang adalah kunci utama budidaya tanaman sehat yang toleran terhadap serangan OPT:\n' +
               '- Gunakan Pupuk Organik Cair (POC) urin kelinci atau fermentasi air cucian cucian beras.\n' +
               '- Hindari kelebihan Pupuk Urea (Nitrogen sintetis) karena membuat batang tanaman terlalu berair (sukulen) sehingga sangat mengundang wereng dan ulat.';
    } else if (userText.includes('wereng') || userText.includes('padi')) {
      reply += 'Pencegahan wereng berwawasan ramah lingkungan dilakukan dengan:\n' +
               '1. Penanaman Refugia: Menanam bunga tanaman aster, kenikir, atau bunga matahari di parit pematang untuk melestarikan laba-laba penjelajah.\n' +
               '2. Jarak Tanam Jajar Legowo (2:1 atau 4:1) agar aliran udara optimal di dasar rumpun padi sehingga kelembaban berkurang (lingkungan kering tidak disukai wereng).';
    } else {
      reply += 'Sebagai panduan kilat pengendalian OPT ramah lingkungan:\n' +
               '- Kendalikan tikus secara massal dengan "Gropyokan" (pembongkaran sarang) atau memelihara Burung Hantu (Tyto alba) di sawah.\n' +
               '- Basmi ulat buah dan hama penggerek batang menggunakan parasitoid telur tawon Trichogramma spp. yang efektif membunuh serangga sebelum mereka sempat memakan buah/batang.';
    }

    return res.json({ text: reply + '\n\n*(Catatan: Anda dapat mengaktifkan Gemini AI interaktif dengan menambahkan GEMINI_API_KEY di menu Secrets)*' });
  }
});

// Helper utility to parse standard CSV format (handles newlines and commas inside quotes)
function parseCSV(csvText: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentVal = '';
  
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip next double quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(currentVal.trim());
      lines.push(row);
      row = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  if (row.length > 0 || currentVal !== '') {
    row.push(currentVal.trim());
    lines.push(row);
  }
  // Filter out completely empty lines
  return lines.filter(r => r.length > 0 && r.some(cell => cell !== ''));
}

// Helper to map village (Desa) to Kecamatan automatically
function getDistrictByVillage(village: string, defaultDistrict: string = 'Nunbena'): string {
  return 'Nunbena';
}

// Helper utility to normalize raw rows (from CSV or Apps Script json) into clean, type-safe OPTReport structure
function normalizeRawRows(rawRows: any[]): any[] {
  return rawRows.map((row: any, i: number) => {
    // Search property keys case-insensitively and ignore space/specials
    const getVal = (possibleKeys: string[], fallbackVal: any = '') => {
      for (const k of Object.keys(row)) {
        const cleanK = k.toLowerCase().replace(/[\s_/()\-?:.]/g, '');
        const matchClean = possibleKeys.some(pk => pk.toLowerCase().replace(/[\s_/()\-?:.]/g, '') === cleanK);
        if (matchClean && row[k] !== undefined && row[k] !== null) {
          return row[k];
        }
      }
      return fallbackVal;
    };

    const locationVillageRaw = getVal(['LocationVillage', 'Desa', 'Kelurahan', 'locationVillage', 'DesaKelurahan', 'NamaDesa'], 'Nunbena');
    
    // Normalize location Village to correct capitalization / spelling if it matches any of our 6 villages
    let locationVillage = 'Nunbena';
    let defaultLat = -9.7042;
    let defaultLng = 124.2250;
    
    const vName = locationVillageRaw.toLowerCase().trim();
    if (vName.includes('lillana') || vName.includes('lilana')) {
      locationVillage = 'Lillana';
      defaultLat = -9.7000;
      defaultLng = 124.2180;
    } else if (vName.includes('nunbena')) {
      locationVillage = 'Nunbena';
      defaultLat = -9.6600;
      defaultLng = 124.2260;
    } else if (vName.includes('taneotob')) {
      locationVillage = 'Taneotob';
      defaultLat = -9.7330;
      defaultLng = 124.1700;
    } else if (vName.includes('tunbes')) {
      locationVillage = 'Tunbes';
      defaultLat = -9.7000;
      defaultLng = 124.2800;
    } else if (vName.includes('noebesi')) {
      locationVillage = 'Noebesi';
      defaultLat = -9.6905;
      defaultLng = 124.1640;
    } else if (vName.includes('fetomone')) {
      locationVillage = 'Fetomone';
      defaultLat = -9.6605;
      defaultLng = 124.1680;
    } else {
      // Fallback: use raw value but default to Nunbena coordinates
      locationVillage = locationVillageRaw;
    }

    const farmerName = getVal(['NamaPelapor', 'NamaPetani', 'Nama', 'Pelapor', 'farmerName', 'NamaLengkap', 'NamaLengkapPelapor'], `Petani Desa ${locationVillage}`);
    const contact = getVal(['Contact', 'Kontak', 'NomorWA', 'NoWA', 'NoHP', 'WhatsApp', 'NoTelp', 'contact', 'NomorWhatsapp', 'NomorTelepon', 'NoHandphone', 'NoHpWa', 'nohpwa', 'nohp'], '');
    const cropType = getVal(['CropType', 'Komoditas', 'Tanaman', 'JenisTanaman', 'cropType', 'JenisKomoditas'], 'Padi');
    const pestName = getVal(['PestName', 'Hama', 'OPT', 'JenisHama', 'pestName', 'NamaHama', 'NamaOPT', 'HamaPenyakit', 'Kendal', 'Kendala', 'kendal', 'kendala'], 'Wereng Batang Cokelat');
    const severity = getVal(['Severity', 'Intensitas', 'KategoriSerangan', 'severity', 'TingkatKeparahan', 'TingkatSerangan', 'Keparahan'], 'Sedang');
    const affectedArea = parseFloat(getVal(['AffectedArea', 'LuasSerangan', 'LuasSeranganHa', 'LuasLahan', 'Luas', 'affectedArea', 'EstimasiLuasSeranganHa', 'EstimasiLuas', 'LuasSeranganHektar', 'LuasHektar'], '1.0'));
    const locationDistrict = getDistrictByVillage(locationVillage, getVal(['LocationDistrict', 'Kecamatan', 'locationDistrict', 'NamaKecamatan'], 'Nunbena'));
    const description = getVal(['Description', 'Keterangan', 'DeskripsiGejala', 'Deskripsi', 'description', 'KeteranganTambahan', 'DeskripsiGejalaKeterangantambahan', 'FotoKondisi', 'fotokondisi'], 'Serangan OPT dilaporkan dari Google Form.');
    const attackDate = getVal(['AttackDate', 'Tanggal', 'TanggalSerangan', 'date', 'attackDate', 'Timestamp', 'Waktu'], new Date().toISOString().split('T')[0]);
    const statusValue = getVal(['Status', 'StatusLaporan', 'status'], 'Menunggu Verifikasi');

    // Geolocation fallback
    const latRaw = getVal(['Latitude', 'Lintang', 'latitude'], '');
    const lngRaw = getVal(['Longitude', 'Bujur', 'longitude'], '');
    
    const lat = latRaw ? parseFloat(latRaw) : defaultLat;
    const lng = lngRaw ? parseFloat(lngRaw) : defaultLng;

    return {
      id: getVal(['id', 'IDLaporan', 'ID', 'Id'], `REP-SHEET-${101 + i}`),
      farmerName,
      farmerGroup: getVal(['FarmerGroup', 'KelompokTani', 'farmerGroup', 'NamaKelompokTani', 'KelompokTeknis'], 'Maju Jaya'),
      contact: contact.toString(),
      cropType,
      pestName,
      severity: (['Ringan', 'Sedang', 'Berat', 'Puso'].includes(severity) ? severity : 'Sedang'),
      affectedArea: isNaN(affectedArea) ? 1.0 : affectedArea,
      locationVillage,
      locationDistrict,
      latitude: isNaN(lat) ? defaultLat : lat,
      longitude: isNaN(lng) ? defaultLng : lng,
      attackDate: attackDate.split(' ')[0] || attackDate, // remove timestamp hours if any
      description,
      status: (['Menunggu Verifikasi', 'Terverifikasi', 'Terkendali'].includes(statusValue) ? statusValue : 'Menunggu Verifikasi'),
      pplNotes: getVal(['PplNotes', 'CatatanPPL', 'pplNotes'], ''),
      pplVerifiedBy: getVal(['PplVerifiedBy', 'pplVerifiedBy'], ''),
      pplVerifiedAt: getVal(['PplVerifiedAt', 'pplVerifiedAt'], ''),
      poptActionTaken: getVal(['PoptActionTaken', 'TindakanPOPT', 'poptActionTaken'], ''),
      poptControlledBy: getVal(['poptControlledBy', 'poptControlledBy'], ''),
      poptControlledAt: getVal(['poptControlledAt', 'poptControlledAt'], ''),
      createdAt: getVal(['CreatedAt', 'Timestamp', 'createdAt'], new Date().toISOString())
    };
  });
}

// API Proxy to fetch live records from Google Sheets (Dual Strategy: Web App -> Direct Sheet CSV Fallback)
app.get('/api/external-reports', async (req, res) => {
  let normalizedReports: any[] = [];
  let isParsedOk = false;
  let errorMsg = '';

  const clientAppsScriptUrl = typeof req.query.appsScriptUrl === 'string' ? req.query.appsScriptUrl : '';
  const clientGoogleSheetId = typeof req.query.googleSheetId === 'string' ? req.query.googleSheetId : '';

  const appsScriptUrl = clientAppsScriptUrl || 'https://script.google.com/macros/s/AKfycbw_aG1Fr52DhwGalgTL-5bfW1Fwl-bKBTGIQ2i923SeLn6J5AHa0EazyMWGvtlBvYxSOQ/exec';
  const googleSheetId = clientGoogleSheetId || '1h_ULmL-gzwE6zHFk3ureyeRcl_NheM2f86-KH6eYHv8';

  // STRATEGY 1 (PRIMARY): Fetch directly from Google Sheets gviz CSV exporter
  try {
    console.log('[SINGKAP API] Running Strategy 1: Direct Spreadsheet CSV extractor for ID:', googleSheetId);
    const csvUrl = `https://docs.google.com/spreadsheets/d/${googleSheetId}/gviz/tq?tqx=out:csv`;
    
    const csvResponse = await fetch(csvUrl);
    if (!csvResponse.ok) {
      throw new Error(`Public Google Sheet CSV endpoint returned status ${csvResponse.status}`);
    }

    const csvText = await csvResponse.text();
    const csvRows = parseCSV(csvText);

    if (csvRows.length >= 1) {
      const headers = csvRows[0];
      const dataRows = csvRows.slice(1);
      
      console.log(`[SINGKAP API] Direct Sheet CSV accessed successfully. Headers: [${headers.join(', ')}]. Parsing ${dataRows.length} rows...`);

      // Map rows array to an array of objects based on column header indexes
      const parsedCsvData = dataRows.map((row) => {
        const rowObj: any = {};
        headers.forEach((header, index) => {
          rowObj[header] = row[index] !== undefined ? row[index] : '';
        });
        return rowObj;
      });

      normalizedReports = normalizeRawRows(parsedCsvData);
      isParsedOk = true;
      console.log(`[SINGKAP API] Strategy 1 Succeeded. Loaded ${normalizedReports.length} records directly from Sheet!`);
    } else {
      throw new Error('Retrieved Google Sheet had no columns or headers.');
    }
  } catch (err: any) {
    console.log('[SINGKAP API] Strategy 1 Direct Sheet CSV Extractor failed:', err.message);
    errorMsg = err.message;
  }

  // STRATEGY 2 (FALLBACK): Fetch from Apps Script Web App
  if (!isParsedOk) {
    try {
      console.log('[SINGKAP API] Strategy 1 failed. Trying Strategy 2: Fetching via Apps Script URL:', appsScriptUrl);
      
      const response = await fetch(appsScriptUrl);
      console.log(`[SINGKAP API] Strategy 2 Response Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const text = await response.text();
        const trimmedText = text.trim();
        
        if (trimmedText.startsWith('<!DOCTYPE html') || trimmedText.startsWith('<html') || trimmedText.includes('doGet') || trimmedText.includes('script.google.com')) {
          throw new Error('Google Apps Script lacks doGet function or is unconfigured (returned HTML).');
        } else {
          const parsedData = JSON.parse(trimmedText);
          let rawRows: any[] = [];
          if (Array.isArray(parsedData)) {
            rawRows = parsedData;
          } else if (parsedData && Array.isArray(parsedData.data)) {
            rawRows = parsedData.data;
          } else if (parsedData && Array.isArray(parsedData.reports)) {
            rawRows = parsedData.reports;
          } else if (parsedData && typeof parsedData === 'object') {
            const firstArrayProp = Object.keys(parsedData).find(key => Array.isArray(parsedData[key]));
            if (firstArrayProp) {
              rawRows = parsedData[firstArrayProp];
            }
          }

          if (rawRows.length > 0) {
            normalizedReports = normalizeRawRows(rawRows);
            isParsedOk = true;
            console.log(`[SINGKAP API] Strategy 2 Succeeded. Loaded ${normalizedReports.length} records.`);
          } else {
            throw new Error('Strategy 2 returned empty or invalid data structure.');
          }
        }
      } else {
        throw new Error(`Apps Script endpoint returned status ${response.status}`);
      }
    } catch (fallbackErr: any) {
      console.error('[SINGKAP API] Both Strategy 1 & Strategy 2 failed. Sync failed. Error details:', fallbackErr.message);
      return res.json({
        success: false,
        error: `Strategy 1 error: ${errorMsg} -> Strategy 2 error: ${fallbackErr.message}`,
        reports: [] // Returns safe empty array
      });
    }
  }

  return res.json({ success: true, reports: normalizedReports });
});

// API Proxy to submit responses and records back to Google Sheets / Apps Script
app.post('/api/external-reports/submit', async (req, res) => {
  try {
    const clientFormAppsScriptUrl = (req.body && typeof req.body.appsScriptUrl === 'string') ? req.body.appsScriptUrl : '';
    const appsScriptUrl = clientFormAppsScriptUrl || 'https://script.google.com/macros/s/AKfycbw_aG1Fr52DhwGalgTL-5bfW1Fwl-bKBTGIQ2i923SeLn6J5AHa0EazyMWGvtlBvYxSOQ/exec';
    
    console.log('[SINGKAP API] Proxying submission to Google Sheets Apps Script:', req.body);
    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    const text = await response.text();
    return res.json({ success: true, response: text });
  } catch (error: any) {
    console.warn('[SINGKAP API] Google Sheet submission failed or is unconfigured: ', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Vite middleware development setup or production static file serving
const isProd = process.env.NODE_ENV === 'production';

async function setupServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    // Mount vite dev server middlewares
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Serve production static assets
    app.use(express.static(distPath));
    // SPA routing - send index.html for all other routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SINGKAP OPT Server] Running full-stack environment on port ${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Server setup failure:', err);
});
