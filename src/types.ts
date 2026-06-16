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
  scientificName: string;
  targetCrops: string[];
  symptoms: string[];
  imageUrl?: string;
  biologicalControls: {
    title: string;
    description: string;
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
