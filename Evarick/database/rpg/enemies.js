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
    
    // ========== KAWASAN RAWA DAN PESISIR ==========
    {
        nama: "Lintah Rawa",
        lokasi: ["Rawa Kabut"],
        hp: 60,
        damage: 10,
        loot: [{ nama: "Darah Lintah", chance: 0.8 }]
    },
    {
        nama: "Buaya Raksasa",
        lokasi: ["Jantung Rawa"],
        hp: 150,
        damage: 18,
        loot: [{ nama: "Daging", chance: 1.0 }, { nama: "Kulit Buaya", chance: 0.7 }]
    },
    {
        nama: "Kepiting Pasir",
        lokasi: ["Pesisir Pantai"],
        hp: 75,
        damage: 12,
        loot: [{ nama: "Capit Kepiting", chance: 0.8 }]
    },
    {
        nama: "Ular Laut",
        lokasi: ["Pulau Karang"],
        hp: 90,
        damage: 16,
        loot: [{ nama: "Bisa Ular Laut", chance: 0.5 }]
    },
    {
        nama: "Monyet Ganas",
        lokasi: ["Hutan Tropis"],
        hp: 85,
        damage: 15,
        loot: [{ nama: "Pisang Emas", chance: 0.3 }]
    },

    // ========== KAWASAN GURUN ==========
    {
        nama: "Kalajengking Pasir",
        lokasi: ["Gurun Pasir Tandus"],
        hp: 100,
        damage: 20,
        loot: [{ nama: "Sengat Beracun", chance: 0.7 }]
    },
    {
        nama: "Mumi Penjaga",
        lokasi: ["Reruntuhan Kuno", "Makam Firaun"],
        hp: 120,
        damage: 18,
        loot: [{ nama: "Perban Kuno", chance: 0.9 }]
    },
    {
        nama: "Roh Firaun",
        lokasi: ["Koridor Labirin"],
        hp: 200,
        damage: 25,
        loot: [{ nama: "Pecahan Artefak", chance: 0.5 }]
    },

    // ========== KAWASAN PUNCAK SALJU ==========
    {
        nama: "Serigala Arktik",
        lokasi: ["Lereng Bersalju"],
        hp: 110,
        damage: 22,
        loot: [{ nama: "Daging", chance: 0.6 }, { nama: "Bulu Arktik", chance: 0.8 }]
    },
    {
        nama: "Golem Es",
        lokasi: ["Kuil Beku", "Altar Es"],
        hp: 180,
        damage: 20,
        loot: [{ nama: "Pecahan Es Murni", chance: 0.9 }]
    },
    {
        nama: "Elemental Es",
        lokasi: ["Puncak Es Abadi"],
        hp: 150,
        damage: 28,
        loot: [{ nama: "Inti Es", chance: 0.7 }]
    },

    // ========== KAWASAN BAWAH TANAH ==========
    {
        nama: "Golem Api",
        lokasi: ["Terowongan Magma"], // Pindah dari Gunung Berapi
        hp: 160,
        damage: 25,
        loot: [{ nama: "Batu", chance: 1.0 }, { nama: "Inti Golem", chance: 0.8 }, { nama: "Kristal Api", chance: 0.2 }]
    },
    {
        nama: "Kurcaci Gelap",
        lokasi: ["Kota Bawah Tanah"],
        hp: 130,
        damage: 24,
        loot: [{ nama: "Batang Besi Hitam", chance: 0.7 }]
    },
    {
        nama: "Gargoyle Batu",
        lokasi: ["Kota Bawah Tanah"],
        hp: 220,
        damage: 18,
        loot: [{ nama: "Sayap Batu", chance: 0.5 }]
    },

    // ========== LOKASI MISTIS ==========
    {
        nama: "Spectre Aether",
        lokasi: ["Ambang Aether"],
        hp: 250,
        damage: 35,
        loot: [{ nama: "Debu Aether", chance: 0.9 }]
    },
    {
        nama: "Penjaga Taman",
        lokasi: ["Taman Gantung Abadi"],
        hp: 300,
        damage: 30,
        loot: [{ nama: "Benih Cahaya", chance: 0.6 }]
    },
    {
        nama: "Binatang Paradox",
        lokasi: ["Benteng Paradox"],
        hp: 400,
        damage: 45,
        loot: [{ nama: "Fragmen Waktu", chance: 0.4 }]
    }
];

module.exports = enemies;