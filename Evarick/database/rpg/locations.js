/*
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  ███████╗██╗   ██╗ █████╗ ██████╗ ██╗  ██████╗██╗  ██╗                         ║
║  ██╔════╝██║   ██║██╔══██╗██╔══██╗██║ ██╔════╝██║ ██╔╝                         ║
║  █████╗  ██║   ██║███████║██████╔╝██║ ██║     █████╔╝                          ║
║  ██╔══╝  ╚██╗ ██╔╝██╔══██║██╔══██╗██║ ██║     ██╔═██╗                          ║
║  ███████╗ ╚████╔╝ ██║  ██║██║  ██║██║ ╚██████╗██║  ██╗                         ║
║  ╚══════╝  ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═════╝╚═╝  ╚═╝                         ║
║                                                                              ║
║  🎮 RPG WhatsApp Bot - Created by Evarick                                    ║
║  📱 WhatsApp Group: https://chat.whatsapp.com/KhS1xo5FMVj5UQQLKTOl2G         ║
║  🎯 Discord Server: https://discord.gg/HbBGznaR                              ║
║  📺 YouTube Channel: https://youtube.com/channel/UCKL8nAmqlVJvvPK_LPZJt0g              ║
║  📸 Instagram: https://www.instagram.com/evarick1.1                         ║
║                                                                              ║
║  ⚠️  This bot is created by Evarick. Please respect the creator!              ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

const locations = [
    // ========== KAWASAN AWAL (THE BEGINNING REALMS) [5 Lokasi] ==========
    {
        nama: "Desa Awal",
        deskripsi: "Sebuah desa kecil yang damai, tempat para petualang memulai perjalanan dan memulihkan diri. Menjadi satu-satunya pusat peradaban saat ini.",
        koneksi: ["Hutan Rindang"],
        aksi: ["shop", "heal"]
    },
    {
        nama: "Hutan Rindang",
        deskripsi: "Hutan lebat yang penuh dengan pepohonan tinggi. Tampak jalur setapak yang mengarah ke berbagai tempat.",
        koneksi: ["Desa Awal", "Goa Misterius", "Danau Tenang", "Rawa Kabut"],
        aksi: ["hunt", "nebang"]
    },
    {
        nama: "Goa Misterius",
        deskripsi: "Sebuah goa gelap yang lembab. Terdengar gemericik air dan gema langkah kaki dari kedalaman.",
        koneksi: ["Hutan Rindang", "Gunung Berapi", "Lereng Bersalju"],
        aksi: ["hunt", "nambang"]
    },
    {
        nama: "Danau Tenang",
        deskripsi: "Danau jernih yang dikelilingi pepohonan. Permukaan airnya yang tenang memantulkan langit dengan sempurna.",
        koneksi: ["Hutan Rindang"],
        aksi: ["mancing"]
    },
    {
        nama: "Gunung Berapi",
        deskripsi: "Area berbahaya yang panas dengan aliran lahar. Sebuah retakan di tanah sepertinya menuju lebih dalam ke perut bumi.",
        koneksi: ["Goa Misterius", "Gurun Pasir Tandus", "Terowongan Magma"],
        aksi: ["hunt", "nambang"]
    },

    // ========== KAWASAN RAWA DAN PESISIR (THE SWAMPS & COASTLINE) [6 Lokasi] ==========
    {
        nama: "Rawa Kabut",
        deskripsi: "Tanah berlumpur yang tertutup kabut tebal. Pohon-pohon mati menjulang seperti cakar ke langit.",
        koneksi: ["Hutan Rindang", "Jantung Rawa", "Pesisir Pantai"],
        aksi: ["hunt", "mancing"]
    },
    {
        nama: "Jantung Rawa",
        deskripsi: "Bagian terdalam dari rawa. Airnya hitam dan pekat, dan suara-suara aneh terdengar dari bawah permukaan.",
        koneksi: ["Rawa Kabut"],
        aksi: ["hunt"]
    },
    {
        nama: "Pesisir Pantai",
        deskripsi: "Pasir putih terhampar bertemu dengan ombak laut yang tenang. Beberapa kapal karam terlihat di kejauhan.",
        koneksi: ["Rawa Kabut", "Dermaga Tua"],
        aksi: ["hunt", "mancing"]
    },
    {
        nama: "Dermaga Tua",
        deskripsi: "Sebuah dermaga kayu yang sudah lapuk, menjorok ke laut. Di ujungnya, ada sebuah perahu kecil yang tampaknya masih bisa digunakan.",
        koneksi: ["Pesisir Pantai", "Pulau Karang"],
        aksi: ["mancing"]
    },
    // --- Sub-Area: Kepulauan Terpencil ---
    {
        nama: "Pulau Karang",
        deskripsi: "Sebuah pulau kecil yang terbentuk dari gugusan karang tajam. Hanya ada sedikit vegetasi di sini.",
        koneksi: ["Dermaga Tua", "Hutan Tropis"],
        aksi: ["hunt", "mancing"]
    },
    {
        nama: "Hutan Tropis",
        deskripsi: "Di balik Pulau Karang, terdapat hutan lebat dengan flora dan fauna yang eksotis dan belum pernah terlihat sebelumnya.",
        koneksi: ["Pulau Karang"],
        aksi: ["hunt", "nebang"]
    },

    // ========== KAWASAN GURUN (THE ARID WASTES) [5 Lokasi] ==========
    {
        nama: "Gurun Pasir Tandus",
        deskripsi: "Hamparan pasir tak berujung di bawah terik matahari. Angin panas meniup butiran pasir ke segala arah.",
        koneksi: ["Gunung Berapi", "Oasis Tersembunyi", "Reruntuhan Kuno"],
        aksi: ["hunt"]
    },
    {
        nama: "Oasis Tersembunyi",
        deskripsi: "Sebuah surga kecil di tengah gurun, dengan kolam air jernih dan pohon-pohon palem yang rindang. Tempat yang aman untuk beristirahat.",
        koneksi: ["Gurun Pasir Tandus"],
        aksi: ["heal", "mancing"]
    },
    {
        nama: "Reruntuhan Kuno",
        deskripsi: "Sisa-sisa peradaban yang terkubur pasir. Pilar-pilar batu raksasa dan bangunan yang hancur menandakan kejayaan masa lalu.",
        koneksi: ["Gurun Pasir Tandus", "Makam Firaun"],
        aksi: ["hunt", "nambang"]
    },
    {
        nama: "Makam Firaun",
        deskripsi: "Pintu masuk ke sebuah makam besar yang gelap. Udara di dalamnya terasa dingin dan penuh dengan energi kuno.",
        koneksi: ["Reruntuhan Kuno", "Koridor Labirin"],
        aksi: ["hunt"]
    },
    // --- Sub-Area: Kedalaman Makam ---
    {
        nama: "Koridor Labirin",
        deskripsi: "Jalan bercabang yang membingungkan dengan berbagai jebakan kuno. Salah langkah bisa berakibat fatal.",
        koneksi: ["Makam Firaun"],
        aksi: ["hunt"]
    },

    // ========== KAWASAN PUNCAK SALJU (THE FROZEN PEAKS) [5 Lokasi] ==========
    {
        nama: "Lereng Bersalju",
        deskripsi: "Jalur pendakian yang curam dan tertutup salju tebal. Angin dingin bertiup kencang.",
        koneksi: ["Goa Misterius", "Puncak Es Abadi", "Kuil Beku"],
        aksi: ["hunt", "nebang"]
    },
    {
        nama: "Puncak Es Abadi",
        deskripsi: "Puncak tertinggi dunia yang diselimuti es abadi. Dari sini, awan-awan terlihat berada di bawahmu.",
        koneksi: ["Lereng Bersalju", "Portal Retak"],
        aksi: ["hunt"]
    },
    {
        nama: "Kuil Beku",
        deskripsi: "Sebuah kuil kuno yang terbuat dari es murni. Tampak sebuah altar di tengah ruangan.",
        koneksi: ["Lereng Bersalju", "Altar Es"],
        aksi: ["hunt"]
    },
    // --- Sub-Area: Dalam Kuil Beku ---
    {
        nama: "Altar Es",
        deskripsi: "Sebuah altar megah yang memancarkan cahaya biru dingin. Di belakangnya ada sebuah pintu menuju perpustakaan tersembunyi.",
        koneksi: ["Kuil Beku", "Perpustakaan Beku"],
        aksi: ["hunt"]
    },
    {
        nama: "Perpustakaan Beku",
        deskripsi: "Ruangan berisi gulungan dan buku-buku kuno yang terawat sempurna dalam lapisan es tipis.",
        koneksi: ["Altar Es"],
        aksi: []
    },

    // ========== KAWASAN BAWAH TANAH (THE UNDERWORLD) [3 Lokasi] ==========
    {
        nama: "Terowongan Magma",
        deskripsi: "Jalan sempit yang panas, di samping sungai magma yang mengalir deras. Batuan di sini terasa rapuh.",
        koneksi: ["Gunung Berapi", "Kota Bawah Tanah"],
        aksi: ["hunt", "nambang"]
    },
    {
        nama: "Kota Bawah Tanah",
        deskripsi: "Sisa-sisa kota yang dibangun oleh peradaban kuno di dalam gua raksasa. diterangi oleh kristal yang berpendar.",
        koneksi: ["Terowongan Magma"],
        aksi: ["hunt", "nambang"]
    },
    
    // ========== LOKASI MISTIS (MYTHICAL LOCATIONS) [4 Lokasi] ==========
    {
        nama: "Portal Retak",
        deskripsi: "Sebuah anomali di udara, portal yang berdenyut dengan energi ungu. Tampak tidak stabil, namun memancarkan daya pikat yang kuat.",
        koneksi: ["Puncak Es Abadi", "Ambang Aether"],
        aksi: []
    },
    {
        nama: "Ambang Aether",
        deskripsi: "Tempat tanpa gravitasi di mana pulau-pulau kristal melayang di lautan kosmik. Pemandangannya menakjubkan sekaligus menakutkan.",
        koneksi: ["Portal Retak", "Taman Gantung Abadi"],
        aksi: ["hunt"]
    },
    {
        nama: "Taman Gantung Abadi",
        deskripsi: "Sebuah taman surgawi di atas pulau melayang. Tumbuhannya mengeluarkan cahaya lembut dan air terjun mengalir ke kehampaan.",
        koneksi: ["Ambang Aether", "Benteng Paradox"],
        aksi: ["mancing"]
    },
    {
        nama: "Benteng Paradox",
        deskripsi: "Sebuah benteng yang arsitekturnya mustahil, di mana tangga menuju ke bawah dan menara berputar tanpa henti.",
        koneksi: ["Taman Gantung Abadi"],
        aksi: ["hunt"]
    }
];

module.exports = locations;