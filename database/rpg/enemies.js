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

const enemies = [
    // ========== KAWASAN AWAL ==========
    {
        nama: "Babi Hutan",
        lokasi: ["Hutan Rindang"],
        hp: 40,
        damage: 6,
        loot: [{ nama: "Daging", chance: 0.8 }]
    },
    {
        nama: "Serigala",
        lokasi: ["Hutan Rindang"],
        hp: 60,
        damage: 9,
        loot: [{ nama: "Daging", chance: 0.5 }, { nama: "Kulit Serigala", chance: 0.5 }]
    },
    {
        nama: "Kelelawar Raksasa",
        lokasi: ["Goa Misterius"],
        hp: 50,
        damage: 12,
        loot: [{ nama: "Sayap Kelelawar", chance: 0.7 }]
    },
    {
        nama: "Slime Gua",
        lokasi: ["Goa Misterius"],
        hp: 70,
        damage: 7,
        loot: [{ nama: "Cairan Slime", chance: 0.9 }]
    },
    {
        nama: "Salamander Api",
        lokasi: ["Gunung Berapi"],
        hp: 80,
        damage: 14,
        loot: [{ nama: "Kulit Salamander", chance: 0.6 }]
    },
    
    // ========== KAWASAN RAWA DAN PESISIR (x2) ==========
    {
        nama: "Lintah Rawa",
        lokasi: ["Rawa Kabut"],
        hp: 120,      // 60 * 2
        damage: 20,   // 10 * 2
        loot: [{ nama: "Darah Lintah", chance: 0.8 }]
    },
    {
        nama: "Buaya Raksasa",
        lokasi: ["Jantung Rawa"],
        hp: 300,      // 150 * 2
        damage: 36,   // 18 * 2
        loot: [{ nama: "Daging", chance: 1.0 }, { nama: "Kulit Buaya", chance: 0.7 }]
    },
    {
        nama: "Kepiting Pasir",
        lokasi: ["Pesisir Pantai"],
        hp: 150,      // 75 * 2
        damage: 24,   // 12 * 2
        loot: [{ nama: "Capit Kepiting", chance: 0.8 }]
    },
    {
        nama: "Ular Laut",
        lokasi: ["Pulau Karang"],
        hp: 180,      // 90 * 2
        damage: 32,   // 16 * 2
        loot: [{ nama: "Bisa Ular Laut", chance: 0.5 }]
    },
    {
        nama: "Monyet Ganas",
        lokasi: ["Hutan Tropis"],
        hp: 170,      // 85 * 2
        damage: 30,   // 15 * 2
        loot: [{ nama: "Pisang Emas", chance: 0.3 }]
    },

    // ========== KAWASAN GURUN (x2) ==========
    {
        nama: "Kalajengking Pasir",
        lokasi: ["Gurun Pasir Tandus"],
        hp: 200,      // 100 * 2
        damage: 40,   // 20 * 2
        loot: [{ nama: "Sengat Beracun", chance: 0.7 }]
    },
    {
        nama: "Mumi Penjaga",
        lokasi: ["Reruntuhan Kuno", "Makam Firaun"],
        hp: 240,      // 120 * 2
        damage: 36,   // 18 * 2
        loot: [{ nama: "Perban Kuno", chance: 0.9 }]
    },
    {
        nama: "Roh Firaun",
        lokasi: ["Koridor Labirin"],
        hp: 400,      // 200 * 2
        damage: 50,   // 25 * 2
        loot: [{ nama: "Pecahan Artefak", chance: 0.5 }]
    },

    // ========== KAWASAN PUNCAK SALJU (x3) ==========
    {
        nama: "Serigala Arktik",
        lokasi: ["Lereng Bersalju"],
        hp: 330,      // 110 * 3
        damage: 66,   // 22 * 3
        loot: [{ nama: "Daging", chance: 0.6 }, { nama: "Bulu Arktik", chance: 0.8 }]
    },
    {
        nama: "Golem Es",
        lokasi: ["Kuil Beku", "Altar Es"],
        hp: 540,      // 180 * 3
        damage: 60,   // 20 * 3
        loot: [{ nama: "Pecahan Es Murni", chance: 0.9 }]
    },
    {
        nama: "Elemental Es",
        lokasi: ["Puncak Es Abadi"],
        hp: 450,      // 150 * 3
        damage: 84,   // 28 * 3
        loot: [{ nama: "Inti Es", chance: 0.7 }]
    },

    // ========== KAWASAN BAWAH TANAH (x3) ==========
    {
        nama: "Golem Api",
        lokasi: ["Terowongan Magma"],
        hp: 480,       // 160 * 3
        damage: 75,    // 25 * 3
        loot: [{ nama: "Batu", chance: 1.0 }, { nama: "Inti Golem", chance: 0.8 }, { nama: "Kristal Api", chance: 0.2 }]
    },
    {
        nama: "Kurcaci Gelap",
        lokasi: ["Kota Bawah Tanah"],
        hp: 390,       // 130 * 3
        damage: 72,    // 24 * 3
        loot: [{ nama: "Batang Besi Hitam", chance: 0.7 }]
    },
    {
        nama: "Gargoyle Batu",
        lokasi: ["Kota Bawah Tanah"],
        hp: 660,       // 220 * 3
        damage: 54,    // 18 * 3
        loot: [{ nama: "Sayap Batu", chance: 0.5 }]
    },

    // ========== LOKASI MISTIS (x3) ==========
    {
        nama: "Spectre Aether",
        lokasi: ["Ambang Aether"],
        hp: 750,       // 250 * 3
        damage: 105,   // 35 * 3
        loot: [{ nama: "Debu Aether", chance: 0.9 }]
    },
    {
        nama: "Penjaga Taman",
        lokasi: ["Taman Gantung Abadi"],
        hp: 900,       // 300 * 3
        damage: 90,    // 30 * 3
        loot: [{ nama: "Benih Cahaya", chance: 0.6 }]
    },
    {
        nama: "Binatang Paradox",
        lokasi: ["Benteng Paradox"],
        hp: 1200,      // 400 * 3
        damage: 135,   // 45 * 3
        loot: [{ nama: "Fragmen Waktu", chance: 0.4 }]
    },
    // ========== KAWASAN LAUT DALAM (x3) ==========
    {
        nama: "Hiu Purba",
        lokasi: ["Jurang Laut Dalam"],
        hp: 840,       // 280 * 3
        damage: 114,   // 38 * 3
        loot: [{ nama: "Gigi Hiu Purba", chance: 0.7 }]
    },
    {
        nama: "Belut Listrik Raksasa",
        lokasi: ["Jurang Laut Dalam", "Reruntuhan Bawah Laut"],
        hp: 750,       // 250 * 3
        damage: 126,   // 42 * 3
        loot: [{ nama: "Kantung Listrik", chance: 0.6 }]
    },
    {
        nama: "Prajurit Siren",
        lokasi: ["Reruntuhan Bawah Laut"],
        hp: 960,       // 320 * 3
        damage: 105,   // 35 * 3
        loot: [{ nama: "Tombak Karang", chance: 0.5 }, { nama: "Sisik Siren", chance: 0.8 }]
    },
    {
        nama: "Kraken Muda",
        lokasi: ["Istana Abisal"],
        hp: 1500,      // 500 * 3
        damage: 150,   // 50 * 3
        loot: [{ nama: "Tinta Kraken", chance: 1.0 }, { nama: "Mata Kraken", chance: 0.3 }]
    },
    // ========== KEPULAUAN LANGIT (THE SKY ISLES) (x3) ==========
    {
        nama: "Gryphon",
        lokasi: ["Padang Rumput Angin"],
        hp: 1650,      // 550 * 3
        damage: 165,   // 55 * 3
        loot: [{ nama: "Bulu Gryphon", chance: 0.8 }, { nama: "Daging Unggas", chance: 0.6 }]
    },
    {
        nama: "Siluman Angin",
        lokasi: ["Padang Rumput Angin", "Reruntuhan Kuil Angin"],
        hp: 1500,      // 500 * 3
        damage: 195,   // 65 * 3
        loot: [{ nama: "Esensi Angin", chance: 0.7 }]
    },
    {
        nama: "Ikan Terbang Kristal",
        lokasi: ["Danau Langit"],
        hp: 1440,      // 480 * 3
        damage: 156,   // 52 * 3
        loot: [{ nama: "Sisik Kristal", chance: 0.9 }]
    },
    {
        nama: "Gargoyle Kuno",
        lokasi: ["Reruntuhan Kuil Angin"],
        hp: 1950,      // 650 * 3
        damage: 180,   // 60 * 3
        loot: [{ nama: "Pecahan Batu Apung", chance: 1.0 }, { nama: "Mata Gargoyle", chance: 0.4 }]
    },
    {
        nama: "Roc, Burung Badai Raksasa",
        lokasi: ["Altar Badai"],
        hp: 3600,      // 1200 * 3
        damage: 240,   // 80 * 3
        loot: [{ nama: "Jantung Badai", chance: 1.0 }, { nama: "Bulu Roc Emas", chance: 0.2 }]
    },

// ========== TANAH TERKUTUK (THE BLIGHTLANDS) (x3) ==========
    {
        nama: "Anjing Pesakitan",
        lokasi: ["Perbatasan Busuk", "Hutan Bengkok"],
        hp: 2100,      // 700 * 3
        damage: 225,   // 75 * 3
        loot: [{ nama: "Taring Berkarat", chance: 0.8 }]
    },
    {
        nama: "Pohon Gantung",
        lokasi: ["Hutan Bengkok"],
        hp: 2700,      // 900 * 3
        damage: 210,   // 70 * 3
        loot: [{ nama: "Akar Hidup", chance: 0.6 }, { nama: "Kayu Terkutuk", chance: 1.0 }]
    },
    {
        nama: "Lintah Nanah Raksasa",
        lokasi: ["Sungai Nanah"],
        hp: 2400,      // 800 * 3
        damage: 255,   // 85 * 3
        loot: [{ nama: "Kantong Asam", chance: 0.9 }]
    },
    {
        nama: "Abominasi",
        lokasi: ["Sarang Wabah"],
        hp: 3300,      // 1100 * 3
        damage: 270,   // 90 * 3
        loot: [{ nama: "Daging Mutasi", chance: 0.7 }, { nama: "Mata Majemuk", chance: 0.5 }]
    },
    {
        nama: "Avatar Pembusukan",
        lokasi: ["Kawah Dosa"],
        hp: 6000,      // 2000 * 3
        damage: 330,   // 110 * 3
        loot: [{ nama: "Inti Kutukan", chance: 1.0 }, { nama: "Tanah Berdosa", chance: 0.5 }]
    },

// ========== KOTA MEKANIS (THE CLOCKWORK CITY) (x3) ==========
    {
        nama: "Laba-laba Mekanis",
        lokasi: ["Jalan Roda Gigi"],
        hp: 3600,      // 1200 * 3
        damage: 300,   // 100 * 3
        loot: [{ nama: "Kaki Mekanis", chance: 0.8 }, { nama: "Lensa Optik", chance: 0.4 }]
    },
    {
        nama: "Golem Penjaga",
        lokasi: ["Pabrik Golem"],
        hp: 4500,      // 1500 * 3
        damage: 285,   // 95 * 3
        loot: [{ nama: "Plat Besi Bertuah", chance: 0.9 }, { nama: "Inti Golem Baja", chance: 0.5 }]
    },
    {
        nama: "Automaton Rusak",
        lokasi: ["Pabrik Golem", "Menara Jam Abadi"],
        hp: 3900,      // 1300 * 3
        damage: 360,   // 120 * 3
        loot: [{ nama: "Sumber Energi Rusak", chance: 0.7 }]
    },
    {
        nama: "Sang Penjaga Waktu",
        lokasi: ["Menara Jam Abadi"],
        hp: 9000,      // 3000 * 3
        damage: 450,   // 150 * 3
        loot: [{ nama: "Roda Gigi Waktu", chance: 1.0 }, { nama: "Kristal Chronos", chance: 0.3 }]
    }
];

module.exports = enemies;