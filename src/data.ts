import { OPTReport, PestControlGuide } from './types';

// Pre-populated realistic agricultural reports in the region of Banyumas/Central Java coordinate boundaries.
// Latitude: -7.4500 to -7.3500, Longitude: 109.1500 to 109.3000
export const INITIAL_REPORTS: OPTReport[] = [];

export const PEST_CATALOG: PestControlGuide[] = [
  {
    id: 'PEST-01',
    name: 'Wereng Batang Cokelat',
    scientificName: 'Nilaparvata lugens',
    targetCrops: ['Padi'],
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
    symptoms: [
      'Pangkal batang padi dipenuhi kelompok serangga kecil penghisap cairan.',
      'Daun padi cepat menguning, mengering, lalu hangus mirip tersiram air panas atau terbakar (hopperburn).',
      'Terjadi penularan virus kerdil hampa dan kerdil rumput.'
    ],
    biologicalControls: [
      {
        title: 'Aman Cendawan Patogen Beauveria bassiana',
        description: 'Semprotkan suspensi spora Beauveria bassiana pada pagi/sore hari ke pangkal batang padi. Cendawan ini akan masuk, melumpuhkan organ, dan membunuh tubuh wereng dalam waktu 3-5 hari tanpa merusak biota sawah.'
      },
      {
        title: 'Pelestarian Laba-laba Penjelajah (Lycosa pseudoannulata)',
        description: 'Musuh alami nomor satu wereng. Di lapangan, satu ekor laba-laba penjelajah dewasa mampu memangsa hingga 10-20 ekor wereng per hari. Lestarikan mereka dengan membatasi atau menghentikan racun kimia.'
      },
      {
        title: 'Penanaman Tanaman Refugia',
        description: 'Tanam bunga matahari, rumput gajah, atau kenikir di pematang sawah sebagai habitat tinggal bagi pemangsa wereng agar keseimbangan ekologi terjaga.'
      }
    ],
    organicRecipes: [
      {
        name: 'Ekstrak Pestisida Nabati Daun Suren & Daun Mimba',
        ingredients: [
          '1 kg daun mimba segar',
          '1 kg dahan/daun suren',
          '2 siung bawang putih (perekat bau)',
          '10 liter air bersih',
          '1 sendok teh sabun cair organik cair'
        ],
        steps: [
          'Tumbuk atau blender daun mimba dan daun suren secara halus.',
          'Rendam bahan hasil tumbukan di dalam 10 liter air bersih selama 24 jam.',
          'Saring air rendaman menggunakan kain penyaring halus agar tidak menyumbat nozel sprayer.',
          'Tambahkan sabun cair sebagai bahan penembus lilin wereng dan perekat organik.',
          'Semprotkan merata pada bagian pangkal rimbun batang padi.'
        ]
      }
    ]
  },
  {
    id: 'PEST-02',
    name: 'Ulat Grayak Jagung (FAW)',
    scientificName: 'Spodoptera frugiperda',
    targetCrops: ['Jagung', 'Sorgum', 'Padi'],
    imageUrl: 'https://images.unsplash.com/photo-1473081556163-2a17de81fc97?auto=format&fit=crop&w=800&q=80',
    symptoms: [
      'Lubang besar bergerigi tidak beraturan pada daun muda di dalam kuncup pucuk tanaman.',
      'Sisa tumpukan serbuk basah berwarna cokelat keemasan di ketiak daun.',
      'Gumpalan telur berwarna abu-abu berselimut bulu halus di bagian bawah daun.'
    ],
    biologicalControls: [
      {
        title: 'Pelepasan Parasitoid Telur Trichogramma',
        description: 'Trichogramma adalah tawon parasitoid mikro yang bertelur dalam telur kutu/ulat grayak. Telur ulat grayak akan gagal menetas menjadi hama merusak dan justru menjadi inkubator tawon penyelamat tanaman.'
      },
      {
        title: 'Serbuk Daun Mimba Alami',
        description: 'Ulat grayak sangat sensitif terhadap zat Azadirachtin. Melalui efek penolakan makan (antifeedant), ulat akan berhenti mengonsumsi jagung dan akhirnya kelaparan secara mandiri.'
      }
    ],
    organicRecipes: [
      {
        name: 'Ramuan Pestisida Nabati Minyak Biji Mimba & Daun Sirsak',
        ingredients: [
          '50 ml minyak biji mimba murni',
          '500 gram daun sirsak segar',
          '5 liter air hangar',
          '10 ml sabun cuci piring (pelarut)'
        ],
        steps: [
          'Tumbuk daun sirsak hingga mengeluarkan ekstrak getah hijau.',
          'Campurkan minyak biji mimba ke dalam air hangat dan sabun cuci piring, aduk cepat hingga tersuspensi putih susu.',
          'Satukan rendaman daun sirsak dengan suspensi mimba tersebut.',
          'Bilas merata ke bagian pucuk daun jagung sebelum matahari terbit atau setelah pkl 15.30 sore.'
        ]
      }
    ]
  },
  {
    id: 'PEST-03',
    name: 'Kutu Kebul',
    scientificName: 'Bemisia tabaci',
    targetCrops: ['Cabai Merah', 'Tomat', 'Terong', 'Mentimun'],
    imageUrl: 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&w=800&q=80',
    symptoms: [
      'Daun tanaman keriting, melengkung ke atas, dan kaku.',
      'Tanaman memucat menguning total hingga tidak dapat menghasilkan bunga/buah sama sekali (bule/virus kuning).',
      'Terdapat jelaga hitam berjamur di permukaan daun bagian atas akibat sekresi embun madu kutu.'
    ],
    biologicalControls: [
      {
        title: 'Perangkap Kuning Lekat (Yellow Sticky Trap)',
        description: 'Pasang lembaran plastik kuning dilapisi minyak goreng bersih atau lem tikus non-toksik setinggi puncak tajuk cabai. Warna kuning meniru daun muda yang merangsang pandangan kutu kebul, membuatnya berpindah dari cabai dan terjebak di lem.'
      },
      {
        title: 'Predator Kepik Delphastus pusillus',
        description: 'Musuh alami pemangsa telur dan nimfa kutu kebul. Menjaga keseimbangan ekosistem tanpa merusak struktur hara sayuran.'
      }
    ],
    organicRecipes: [
      {
        name: 'Pestisida Nabati Bawang Putih & Ekstrak Sereh Wangi',
        ingredients: [
          '4 bonggol bawang putih kupas',
          '4 batang sereh wangi besar',
          '1 sendok sabun colek organik sebagai pengemulsi',
          '3 liter air hangat'
        ],
        steps: [
          'Hancurkan bawang putih dan batang sereh wangi dengan blender sampai lumat.',
          'Tuang air hangat dan sabun colek, lalu aduk kuat agar minyak sereh dan allicin bawang melepaskan diri.',
          'Diamkan dalam wadah tertutup rapat selama 24 jam untuk proses ekstraksi.',
          'Saring ampasnya secara kering.',
          'Larutkan kembali 1 gelas konsentrat tadi ke dalam 1 tanki sprayer air jernih untuk disemprotkan di balik helaian daun cabai.'
        ]
      }
    ]
  },
  {
    id: 'PEST-04',
    name: 'Keong Mas (Golden Apple Snail)',
    scientificName: 'Pomacea canaliculata',
    targetCrops: ['Padi'],
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    symptoms: [
      'Batang padi muda yang baru ditanam (0-15 HST) terpotong tepat di perbatasan air sawah.',
      'Terdapat populasi keong bercangkang cokelat bulat di sela-sela pematang.',
      'Kelompok telur berwarna merah dadu/merah jambu melekat di batang bambu, kayu, atau dinding saluran irigasi.'
    ],
    biologicalControls: [
      {
        title: 'Pengaliran Sistemik Lahan Sawah',
        description: 'Buat got cacing di sekeliling piringan sawah. Saat air dikeringkan perlahan, keong mas secara alami akan masuk berkumpul ke dalam saluran got cacing, sehingga memudahkan petani melakukan pemungutan mekanis secara cepat.'
      },
      {
        title: 'Pelepasan Bebek/Itik Sawah',
        description: 'Giring kelompok bebek ke dalam areal sawah berumur 15 HST ke atas atau sesaat sebelum tanam. Bebek secara aktif mencari dan menyantap anak-anak keong mas muda yang gemar merusak akar padi.'
      }
    ],
    organicRecipes: [
      {
        name: 'Aplikasi Atraktan Daun Pepaya & Daun Talas',
        ingredients: [
          '5 kg daun talas atau pelepah pepaya segar',
          'Batang bambu pembatas'
        ],
        steps: [
          'Ikat daun talas atau pelepah pepaya menjadi beberapa kelompok terpisah.',
          'Letakkan kelompok daun ini di beberapa titik air sawah yang landai pada sore hari jam 17:00.',
          'Daun talas sangat disukai keong mas karena aromanya. Keong mas akan mengerumuni dan menempel padat di daun tersebut untuk makan.',
          'Keesokan paginya jam 06:00, ambil kumpulan daun talas yang sudah dipenuhi keong mas, lalu kumpulkan keong dalam karung untuk dimanfaatkan menjadi pakan ternak tinggi protein.'
        ]
      }
    ]
  }
];

export const GEOGRAPHICAL_CENTERS = {
  latitude: -7.3820,
  longitude: 109.2250,
  zoom: 13,
  district: 'Timor Tengah Selatan (Kecamatan Nunbena)',
};
