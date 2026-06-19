import { OPTReport, PestControlGuide } from './types';

// Pre-populated realistic agricultural reports in the region of Banyumas/Central Java coordinate boundaries.
// Latitude: -7.4500 to -7.3500, Longitude: 109.1500 to 109.3000
export const INITIAL_REPORTS: OPTReport[] = [];

export const PEST_CATALOG: PestControlGuide[] = [
  {
    id: 'NABATI-01',
    name: 'Akar Tuba',
    localName: 'Tufe',
    scientificName: 'Derris elliptica',
    targetCrops: ['Padi', 'Jagung', 'Kol', 'Kacang-kacangan'],
    symptoms: [
      'Daun berlubang akibat serangan ulat grayak atau belalang.',
      'Batang padi rusak digerogoti ulat tanah.',
      'Serangga atau kumbang merusak bunga sayur-sayuran.'
    ],
    imageUrls: [
      'https://upload.wikimedia.org/wikipedia/commons/2/29/Derris_ellipt_081120-3908_trb.jpg',
      'https://filebroker-cdn.lazada.co.id/kf/Sd4845bff017142f48055044da37e78489.jpg',
      'https://www.socfindoconservation.co.id/asset/plant/694-3-derris-elliptica.jpg'
    ],
    biologicalControls: [
      {
        title: 'Manfaat Utama Akar Tuba',
        description: 'Mengandung rotenon yang merupakan racun kontak dan pernapasan sangat kuat untuk membasmi berbagai serangga penggigit, pengunyah, dan pengisap cairan tanaman secara cepat.'
      },
      {
        title: 'Sasaran Hama Utama',
        description: 'Efektif mengendalikan Ulat Grayak (Spodoptera), Belalang, Ulat Tanah, Walang Sangit, Thrips, Kutu Daun, dan Kumbang Daun.'
      }
    ],
    organicRecipes: [
      {
        name: 'Cara Pembuatan Pestisida Ekstrak Tuba (Tufe)',
        ingredients: [
          '250 - 500 gram akar tuba segar (Tufe)',
          '5 - 10 liter air bersih jernih',
          '1 - 2 sendok makan sabun cair organik (sebagai perekat)'
        ],
        steps: [
          'Bersihkan akar tuba (Tufe) segar dari sisa-sisa tanah yang melekat.',
          'Potong akar menjadi bagian kecil-kecil berukuran 2-3 cm.',
          'Tumbuk kasar akar menggunakan lesung batu hingga serat memar memutih dan mengeluarkan getah warna putih susu.',
          'Rendam remukan akar tuba tersebut ke dalam 10 liter air selama 24 jam penuh agar zat rotenon terekstrak menyeluruh.',
          'Peras dan saring rendaman tadi menggunakan kain halus/kasa agar partikel serat terpisah.',
          'Tambahkan sabun cair ke dalam filtrat jernih dan aduk rata sebagai pelekat alami.',
          'Semprotkan ke tanaman yang diserang hama pada pagi atau sore hari.'
        ]
      }
    ]
  },
  {
    id: 'NABATI-02',
    name: 'Daun Mimba',
    localName: 'Kamel',
    scientificName: 'Azadirachta indica',
    targetCrops: ['Padi', 'Cabai', 'Tomat', 'Jagung', 'Sorgum'],
    symptoms: [
      'Tanaman kerdil karena cairan daun dihisap wereng atau kutu kebul.',
      'Daun keriting/menggulung akibat Thrips.',
      'Terdapat kelompok telur kupu-kupu atau ulat yang menempel di bawah permukaan daun.'
    ],
    imageUrls: [
      'https://hijau.or.id/wp-content/uploads/2018/02/DAUN-MIMBA-azadirachta-indica.jpg',
      'https://images.alodokter.com/dk0z4ums3/image/upload/v1665479222/attached_image/inilah-4-manfaat-daun-mimba-untuk-kesehatan.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSy0L3Ce_Hsl3sPsUA7at-fDJe1LQt5N0z0mzxFg8uwltXlZjnh4o78QX0&s=10'
    ],
    biologicalControls: [
      {
        title: 'Manfaat Utama Daun Mimba',
        description: 'Mengandung senyawa Azadirachtin yang bekerja sebagai Antifeedant (penolak makan serangga), mengganggu hormon eklisis (pergantian kulit), dan menghambat peletakan telur.'
      },
      {
        title: 'Sasaran Hama Utama',
        description: 'Sangat ampuh membasmi Wereng Batang Cokelat, Kutu Kebul, Ulat Grayak, Kutu Daun (Aphids), Thrips, dan Walang Sangit.'
      }
    ],
    organicRecipes: [
      {
        name: 'Cara Pembuatan Pestisida Ekstrak Mimba (Kamel)',
        ingredients: [
          '1 kg daun mimba segar (Kamel)',
          '10 liter air bersih jernih',
          '3 - 5 sendok teh sabun cair organik'
        ],
        steps: [
          'Kumpulkan daun mimba segar (Kamel) hijau tua sebanyak 1 kg.',
          'Tumbuk daun mimba sampai menjadi pasta bertekstur halus dan lumat.',
          'Rendam pasta daun mimba di dalam wadah bertutup berisi 10 liter air selama 12-24 jam.',
          'Saring larutan rendaman memakai saringan kain kasa halus untuk memisahkan ampas daun.',
          'Tambahkan sabun cair sebagai pengemulsi minyak mimba agar menyatu homogen dengan air.',
          'Siramkan atau semprotkan air saringan ini langsung pada daun dan pangkal batang tanaman.'
        ]
      }
    ]
  },
  {
    id: 'NABATI-03',
    name: 'Daun Sirsak',
    localName: 'Atno',
    scientificName: 'Annona muricata',
    targetCrops: ['Cabai', 'Tomat', 'Terong', 'Kubis', 'Sawi'],
    symptoms: [
      'Daun sayuran bolong besar akibat dimakan ulat kubis atau belalang.',
      'Pertumbuhan pucuk terhambat dan layu.',
      'Kelompok serangga penghisap berkumpul di balik helai daun.'
    ],
    imageUrls: [
      'https://info.ft.uns.ac.id/images/info_tanaman/6137sirsak-madu.jpg',
      'https://naturindofresh.co.id/wp-content/uploads/2025/11/sedang_1524584981Khasiat-Daun-Sirsak-Asli-640x480-1.jpg',
      'https://images.alodokter.com/dk0z4ums3/image/upload/v1643360280/attached_image/waspadai-efek-samping-daun-sirsak-sebelum-konsumsi-ekstraknya.jpg'
    ],
    biologicalControls: [
      {
        title: 'Manfaat Utama Daun Sirsak',
        description: 'Mengandung senyawa aktif Acetogenin yang berkhasiat sebagai racun pencernaan/kontak kuat, merusak energi respirasi sel hama pengunyah.'
      },
      {
        title: 'Sasaran Hama Utama',
        description: 'Sangat efektif terhadap Belalang Sawah, Ulat Bulu, Thrips, Kutu Daun, Kepik Hijau, dan Ulat Krop Kubis.'
      }
    ],
    organicRecipes: [
      {
        name: 'Cara Pembuatan Pestisida Ekstrak Sirsak (Atno)',
        ingredients: [
          '100 lembar daun sirsak segar (Atno)',
          '5 liter air bersih',
          '1 sendok makan sabun cair (perekat)'
        ],
        steps: [
          'Ambil 100 lembar daun sirsak segar (Atno) yang masih muda atau setengah tua.',
          'Tumbuk atau blender daun hingga halus hancur menyatu.',
          'Rendam hasil tumbukan daun sirsak dalam 5 liter air selama 24 jam s/d getahnya larut sempurna.',
          'Saring air rendaman menggunakan kain tipis penapis teh.',
          'Tambahkan sabun pengemulsi lalu aduk merata.',
          'Semburkan pestisida nabati ini ke seluruh organ tanaman yang terinfeksi hama sasaran.'
        ]
      }
    ]
  },
  {
    id: 'NABATI-04',
    name: 'Daun Sirih',
    localName: 'Manus',
    scientificName: 'Piper betle',
    targetCrops: ['Cabai', 'Bawang Merah', 'Tomat', 'Kacang Panjang'],
    symptoms: [
      'Bercak busuk melingkar bertekstur basah di buah cabai (kekuningan/antraknosa/patek).',
      'Ulat merusak daging buah tomat dan cabai hingga berlubang membusuk.',
      'Spora putih/keabu-abuan menyelimuti permukaan sayuran.'
    ],
    imageUrls: [
      'https://asset.kompas.com/crops/xN9ufAdWx8JkkesL77FrEu-2t0Q=/435x115:1280x960/340x340/data/photo/2023/06/09/6482d1400aa7e.jpg',
      'https://bibitbunga.com/wp-content/uploads/2015/04/sirih-hijau.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReXIbaZ2wkM-MVGFoL6ppx2KbHBTwXcg7ozcCmqHsM9bhj48yKT3N5nXg&s=10'
    ],
    biologicalControls: [
      {
        title: 'Manfaat Utama Daun Sirih',
        description: 'Mengandung minyak atsiri (alkaloid kavikol, kavibetol) yang merupakan biosida pelindung alami berkemampuan sangat kuat sebagai Fungisida Botani (pencegah jamur/patek) sekaligus repellen serangga bertelur.'
      },
      {
        title: 'Sasaran Hama Utama',
        description: 'Mencegah Jamur Antraknosa (Patek), Ulat Buah, Kutu Kebul, Lalat Buah, dan Kutu Dompolan.'
      }
    ],
    organicRecipes: [
      {
        name: 'Cara Pembuatan Pestisida Rebusan Sirih (Manus)',
        ingredients: [
          '200 gram daun sirih segar (Manus)',
          '2 liter air bersih jernih',
          '½ sendok teh sabun perekat alami'
        ],
        steps: [
          'Cuci bersih daun sirih hijau (Manus) segar dari segala debu sawah.',
          'Rajang atau iris tipis-tipis daun sirih untuk memperlebar jalur ekstraksi minyak atsiri.',
          'Rebus rajangan daun sirih di dalam wadah berisi 2 liter air hingga mendidih selama 15 menit.',
          'Matikan api kompor lalu biarkan rebusan tersebut dingin di suhu ruangan secara perlahan.',
          'Saring cairan herba tadi menggunakan penyaring berserat kerapatan tinggi.',
          'Larutkan beberapa tetes sabun cair perekat, masukkan dalam botol semprot untuk disemprotkan ke tanaman hortikultura secara preventif.'
        ]
      }
    ]
  },
  {
    id: 'NABATI-05',
    name: 'Daun Sarei',
    localName: 'Humuke',
    scientificName: 'Cymbopogon citratus',
    targetCrops: ['Padi', 'Cabai', 'Tomat', 'Labu-labuan'],
    symptoms: [
      'Walang sangit beterbangan menghisap bulir padi muda yang menguning hampa.',
      'Lalat buah hinggap dan menyuntikkan telur ke buah cabai/melon hingga layu busuk berguguran.',
      'Koloni semut hitam bersarang mengotori ketiak daun.'
    ],
    imageUrls: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2vIbpt5ZqT2Ynhbt4cXVhl6uLol1X3k-krvLNeHE8-J7Ww7jXw910UGDcMo8oaDz8mYVRquWb7XhZ3q-gNzpfYyyAST2HkZGUYEvymw&s=10',
      'https://www.socfindoconservation.co.id/asset/plant/659-1-cymbopogon-citratus.jpg',
      'https://images.alodokter.com/dk0z4ums3/image/upload/v1635327052/attached_image/manfaat-sereh-tidak-hanya-terbatas-di-area-dapur-0-alodokter.jpg'
    ],
    biologicalControls: [
      {
        title: 'Manfaat Utama Daun Sarei',
        description: 'Minyak sereh kaya kandungan Citronellal dan Geraniol yang aromanya sangat menyengat bagi organ penciuman (olfaktori) serangga. Bertindak selaku Repellen (pengusir hama jarak jauh) alami.'
      },
      {
        title: 'Sasaran Hama Utama',
        description: 'Sangat ampuh melumpuhkan sistem navigasi Walang Sangit, Kutu Kebul, Lalat Melon/Buah, Kutu Daun, dan Semut Batang.'
      }
    ],
    organicRecipes: [
      {
        name: 'Cara Pembuatan Pestisida Sereh / Lemon Grass (Humuke)',
        ingredients: [
          '5 - 10 gagang sereh lengkap daun dan pangkal akar (Humuke)',
          '4 liter air bersih jernih',
          '1 sendok makan sabun cair (pengemulsi)'
        ],
        steps: [
          'Bersihkan batang dan daun sereh (Humuke) segar dari kotoran.',
          'Iris tipis atau tumbuk memar batang sereh menggunakan palu hingga serat pecah berkeringat minyak atsiri.',
          'Rendam cacahan sereh di dalam wadah berisi 4 liter air matang semalaman penuh (minimal 12 jam).',
          'Peras helaian batang sekuatnya lalu saring cairannya menggunakan saringan halus.',
          'Masukkan sabun cuci cair pengemulsi lalu aduk merata agar minyak sereh larut dalam air.',
          'Semprotkan merata ke tanaman padi sawah, terutama pada bagian bulir muda padi untuk mengusir serbuan walang sangit.'
        ]
      }
    ]
  },
  {
    id: 'NABATI-06',
    name: 'Daun Pepaya',
    localName: 'Kauno',
    scientificName: 'Carica papaya',
    targetCrops: ['Cabai', 'Tomat', 'Terong', 'Sawi', 'Tembakau'],
    symptoms: [
      'Daun sayuran habis dimakan ulat krop kubis atau ulat tentara.',
      'Terdapat ulat halus berlindung di sela lipatan bawah permukaan daun.',
      'Sarang sutera ulat merusak estetika dan helai daun sayuran.'
    ],
    imageUrls: [
      'https://asset.kompas.com/crops/KVQXICOuOiEbI2WBSMTr-GM1hXA=/219x124:1701x1112/1200x800/data/photo/2022/02/14/6209d29ed8302.jpg',
      'https://st.depositphotos.com/11634452/54024/i/450/depositphotos_540240990-stock-photo-papaya-tree-backyard-area-green.jpg',
      'https://images.pexels.com/photos/12999083/pexels-photo-12999083.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500'
    ],
    biologicalControls: [
      {
        title: 'Manfaat Utama Daun Pepaya',
        description: 'Mengandung enzim Papain dan enzim kimopapain tingkat tinggi. Eksudat getah pahit dan alkaloid daun pepaya bekerja sebagai racun perut kuat dan perusak lapisan kutikula (kulit pelindung luar) ulat daun secara perlahan.'
      },
      {
        title: 'Sasaran Hama Utama',
        description: 'Handal membasmi Ulat Grayak, Ulat Krop Kubis/Sawi, Belalang Hijau, Kutu Daun, dan Thrips.'
      }
    ],
    organicRecipes: [
      {
        name: 'Cara Pembuatan Pestisida Getah Daun Pepaya (Kauno)',
        ingredients: [
          '1 kg daun pepaya segar (Kauno)',
          '3 liter air bersih jernih',
          '2-3 sendok teh sabun cair / deterjen ringan (pelarut getah)'
        ],
        steps: [
          'Petik daun pepaya segar (Kauno) secukupnya (kurang lebih 1 kg).',
          'Rajang kasar daun pepaya lalu tumbuk lumat beralaskan lumpang batu sampai berbusa getah hijau pekat.',
          'Satukan lumatan daun pepaya ke dalam wadah tertutup berisi 3 liter air.',
          'Tambahkan sabun cair dan kocok/aduk kuat agar getah papain beremulsi.',
          'Rendam larutan tersebut selama 24 jam penuh di tempat yang teduh.',
          'Peras serat daunnya memakai kain kasa kain penyaring.',
          'Semprotkan air getah pepaya ini langsung pada ulat-ulat kecil dan kutu yang berkoloni di balik daun.'
        ]
      }
    ]
  },
  {
    id: 'NABATI-07',
    name: 'Kunyit',
    localName: 'Huki',
    scientificName: 'Curcuma longa',
    targetCrops: ['Padi', 'Cabai', 'Tomat', 'Jagung', 'Sawi'],
    symptoms: [
      'Terbentuk flek-flek kuning, karat oranye, atau jamur upas menyelimuti dedaunan.',
      'Bibit tanaman pangan mati layu sebelum ditanam karena rebah kecambah (damping-off).',
      'Ulat daun merayap memakan tunas baru tumbuh.'
    ],
    imageUrls: [
      'https://png.pngtree.com/png-vector/20251222/ourmid/pngtree-turmeric-plant-with-leaves-and-roots-png-image_18295764.webp',
      'https://m.media-amazon.com/images/I/71CEMoin1+L._AC_UF1000,1000_QL80_.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyBykULZ2HHCXTT4tgvRfRegG9adLGjg56LyJbetjWBx0Pqf0oFf-lOP0&s=10'
    ],
    biologicalControls: [
      {
        title: 'Manfaat Utama Kunyit',
        description: 'Mengandung curcuminoid (kurkumin) berkualitas tinggi dan minyak atsiri rimpang. Memiliki daya hambat Antijamur (Fungisida) dan Antibakteri sangat luas, melindungi sistem tanaman dari patogen busuk akar rimpang dan tular tanah.'
      },
      {
        title: 'Sasaran Hama Utama',
        description: 'Sangat efektif terhadap Jamur Karat Daun, Embun Tepung (Downy Mildew), Layu Fusarium, Kutu Kebul, dan Ulat Kecil.'
      }
    ],
    organicRecipes: [
      {
        name: 'Cara Pembuatan Pestisida Rimpang Kunyit (Huki)',
        ingredients: [
          '500 gram rimpang kunyit tua segar (Huki)',
          '2 liter air hangat suam suam kuku',
          '½ sendok teh sabun cair'
        ],
        steps: [
          'Kupas atau bersihkan rimpang kunyit (Huki) segar berwarna jingga tua dari kotoran.',
          'Tumbuk hingga sehalus mungkin atau parut rimpang parutan basah.',
          'Campurkan hasil parutan ke dalam 2 liter air hangat suam kuku agar zat aktif terekstrak cepat.',
          'Diamkan larutan selama 4-6 jam agar endapan pati terpisah ke dasar wadah.',
          'Saring larutan menggunakan kain saringan teh halus untuk mengambil fitrat kuning murni.',
          'Encerkan dengan menambahkan air dingin dengan perbandingan 1:3 sebelum aplikasi.',
          'Semprotkan pagi atau siramkan ke area perakaran semai bibit tanaman untuk proteksi layu akar.'
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
