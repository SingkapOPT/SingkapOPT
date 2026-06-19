export type SeverityLevel = 'Ringan' | 'Sedang' | 'Berat' | 'Puso';

export type ReportStatus = 'Menunggu Verifikasi' | 'Terverifikasi' | 'Terkendali';

export type UserRole = 'Petani' | 'PPL' | 'POPT';

export interface OPTReport {
  id: string;
  farmerName: string;
  farmerGroup: string; // Kelompok Tani
  contact: string;
  cropType: string; // Padi, Jagung, Cabai, Kedelai, dll.
  pestName: string; // Wereng, Ulat Grayak, Kutu Kebul, Tikus, dll.
  severity: SeverityLevel;
  affectedArea: number; // in hectares (Ha)
  locationVillage: string; // Desa/Kelurahan
  locationDistrict: string; // Kecamatan
  latitude: number;
  longitude: number;
  attackDate: string;
  description: string;
  imageUrl?: string;
  status: ReportStatus;
  pplNotes?: string; // Catatan PPL (Penyuluh Pertanian Lapangan)
  pplVerifiedBy?: string;
  pplVerifiedAt?: string;
  poptActionTaken?: string; // Tindakan POPT (Pengendali OPT)
  poptControlledBy?: string;
  poptControlledAt?: string;
  createdAt: string;
}

export interface PestControlGuide {
  id: string;
  name: string;
  localName?: string;
  scientificName: string;
  targetCrops: string[];
  symptoms: string[];
  imageUrl?: string;
  imageUrls?: string[];
  biologicalControls: {
    title: string;
    description: string;
    pestImageUrl?: string;
  }[];
  targetPests?: {
    name: string;
    imageUrl: string;
  }[];
  organicRecipes: {
    name: string;
    ingredients: string[];
    steps: string[];
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export function getGoogleDriveThumbnail(url: string | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();
  
  // Regex to capture drive file ID
  const regD = /\/file\/d\/([a-zA-Z0-9-_]+)/i;
  const regId = /[?&]id=([a-zA-Z0-9-_]+)/i;
  
  let id: string | null = null;
  const dMatch = trimmed.match(regD);
  if (dMatch) {
    id = dMatch[1];
  } else {
    const idMatch = trimmed.match(regId);
    if (idMatch) {
      id = idMatch[1];
    }
  }
  
  if (id) {
    return `https://drive.google.com/thumbnail?id=${id}&sz=w600`;
  }
  return trimmed;
}

