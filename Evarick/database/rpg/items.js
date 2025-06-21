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

const items = [
    // === MATERIAL ALAM ===
    { nama: "Kayu", hargaJual: 5, hargaBeli: 0, kategori: 'Material' },
    { nama: "Batu", hargaJual: 3, hargaBeli: 0, kategori: 'Material' },
    { nama: "Ikan", hargaJual: 8, hargaBeli: 0, kategori: 'Material' },
    { nama: "Daging", hargaJual: 10, hargaBeli: 0, kategori: 'Material' },
    { nama: "Ikan Legendaris", hargaJual: 150, hargaBeli: 0, kategori: 'Spesial' },
    { nama: "Kristal Api", hargaJual: 200, hargaBeli: 0, kategori: 'Spesial' },

    // === LOOT MUSUH ===
    // --- Tier Awal ---
    { nama: "Kulit Serigala", hargaJual: 15, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Sayap Kelelawar", hargaJual: 12, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Cairan Slime", hargaJual: 10, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Kulit Salamander", hargaJual: 20, hargaBeli: 0, kategori: 'Loot' },
    // --- Tier Menengah ---
    { nama: "Darah Lintah", hargaJual: 18, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Kulit Buaya", hargaJual: 45, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Capit Kepiting", hargaJual: 25, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Bisa Ular Laut", hargaJual: 50, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Pisang Emas", hargaJual: 60, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Sengat Beracun", hargaJual: 55, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Perban Kuno", hargaJual: 40, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Pecahan Artefak", hargaJual: 120, hargaBeli: 0, kategori: 'Loot' },
    // --- Tier Tinggi ---
    { nama: "Bulu Arktik", hargaJual: 70, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Pecahan Es Murni", hargaJual: 90, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Inti Es", hargaJual: 150, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Inti Golem", hargaJual: 75, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Batang Besi Hitam", hargaJual: 100, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Sayap Batu", hargaJual: 130, hargaBeli: 0, kategori: 'Loot' },
    // --- Tier Akhir ---
    { nama: "Debu Aether", hargaJual: 250, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Benih Cahaya", hargaJual: 300, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Fragmen Waktu", hargaJual: 500, hargaBeli: 0, kategori: 'Loot' },

    // === PERALATAN (EQUIPMENT) ===
    // --- Tools ---
    { nama: "Pancingan", hargaJual: 20, hargaBeli: 60, kategori: 'Peralatan' },
    { nama: "Kapak Kayu", hargaJual: 25, hargaBeli: 70, kategori: 'Peralatan' },
    { nama: "Cangkul", hargaJual: 30, hargaBeli: 80, kategori: 'Peralatan' },
    { nama: "Kapak Besi", hargaJual: 80, hargaBeli: 200, kategori: 'Peralatan' },
    { nama: "Palu Besi", hargaJual: 60, hargaBeli: 150, kategori: 'Peralatan' },
    
    // --- Senjata Tier 1 (Basic) ---
    { nama: "Pedang Kayu", hargaJual: 15, hargaBeli: 50, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 5 } },
    { nama: "Tongkat Kayu", hargaJual: 12, hargaBeli: 40, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 3, mana: 10 } },
    { nama: "Belati Kayu", hargaJual: 10, hargaBeli: 36, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 4 } },
    { nama: "Busur Kayu", hargaJual: 18, hargaBeli: 56, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 4, defense: 1 } },
    { nama: "Tongkat Pukul", hargaJual: 20, hargaBeli: 60, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 6, hp: 5 } },
    
    // --- Senjata Tier 2 (Iron) ---
    { nama: "Pedang Besi", hargaJual: 150, hargaBeli: 400, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 15 } },
    { nama: "Tongkat Besi", hargaJual: 120, hargaBeli: 320, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 8, mana: 25 } },
    { nama: "Belati Besi", hargaJual: 100, hargaBeli: 280, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 12 } },
    { nama: "Busur Besi", hargaJual: 180, hargaBeli: 480, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 12, defense: 3 } },
    { nama: "Kapak Perang", hargaJual: 200, hargaBeli: 520, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 18, hp: 10 } },
    
    // --- Senjata Tier 3 (Steel) ---
    { nama: "Pedang Baja", hargaJual: 400, hargaBeli: 1000, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 25 } },
    { nama: "Tongkat Sihir", hargaJual: 350, hargaBeli: 900, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 15, mana: 40 } },
    { nama: "Belati Bayangan", hargaJual: 300, hargaBeli: 800, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 20 } },
    { nama: "Busur Panah", hargaJual: 450, hargaBeli: 1100, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 20, defense: 5 } },
    { nama: "Martil Perang", hargaJual: 500, hargaBeli: 1200, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 30, hp: 15 } },
    
    // --- Senjata Tier 4 (Rare) ---
    { nama: "Pedang Kristal", hargaJual: 800, hargaBeli: 2000, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 35, mana: 20 } },
    { nama: "Tongkat Aether", hargaJual: 750, hargaBeli: 1900, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 20, mana: 60 } },
    { nama: "Belati Bayangan", hargaJual: 700, hargaBeli: 1800, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 28 } },
    { nama: "Busur Legendaris", hargaJual: 900, hargaBeli: 2200, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 28, defense: 8 } },
    { nama: "Kapak Guntur", hargaJual: 1000, hargaBeli: 2400, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 40, hp: 25 } },
    
    // --- Helmet Tier 1 ---
    { nama: "Helem Kulit", hargaJual: 40, hargaBeli: 100, kategori: 'Peralatan', tipe: 'helem', stats: { hp: 20, defense: 2 } },
    { nama: "Topi Kain", hargaJual: 25, hargaBeli: 70, kategori: 'Peralatan', tipe: 'helem', stats: { hp: 10, defense: 1 } },
    { nama: "Topi Jerami", hargaJual: 15, hargaBeli: 50, kategori: 'Peralatan', tipe: 'helem', stats: { hp: 5, defense: 1 } },
    
    // --- Helmet Tier 2 ---
    { nama: "Helem Besi", hargaJual: 180, hargaBeli: 440, kategori: 'Peralatan', tipe: 'helem', stats: { hp: 50, defense: 5 } },
    { nama: "Topi Besi", hargaJual: 150, hargaBeli: 380, kategori: 'Peralatan', tipe: 'helem', stats: { hp: 40, defense: 4 } },
    
    // --- Helmet Tier 3 ---
    { nama: "Helem Baja", hargaJual: 400, hargaBeli: 1000, kategori: 'Peralatan', tipe: 'helem', stats: { hp: 80, defense: 8 } },
    { nama: "Mahkota Sihir", hargaJual: 350, hargaBeli: 900, kategori: 'Peralatan', tipe: 'helem', stats: { hp: 30, mana: 50, defense: 3 } },
    
    // --- Helmet Tier 4 ---
    { nama: "Helem Kristal", hargaJual: 800, hargaBeli: 2000, kategori: 'Peralatan', tipe: 'helem', stats: { hp: 120, defense: 12 } },
    { nama: "Mahkota Aether", hargaJual: 750, hargaBeli: 1900, kategori: 'Peralatan', tipe: 'helem', stats: { hp: 50, mana: 80, defense: 5 } },
    
    // --- Armor Tier 1 ---
    { nama: "Zirah Kulit", hargaJual: 60, hargaBeli: 160, kategori: 'Peralatan', tipe: 'zirah', stats: { hp: 40, defense: 5 } },
    { nama: "Jubah Kain", hargaJual: 35, hargaBeli: 100, kategori: 'Peralatan', tipe: 'zirah', stats: { hp: 20, defense: 2, mana: 15 } },
    { nama: "Baju Jerami", hargaJual: 20, hargaBeli: 60, kategori: 'Peralatan', tipe: 'zirah', stats: { hp: 10, defense: 1 } },
    
    // --- Armor Tier 2 ---
    { nama: "Zirah Besi", hargaJual: 250, hargaBeli: 600, kategori: 'Peralatan', tipe: 'zirah', stats: { hp: 100, defense: 12 } },
    { nama: "Jubah Besi", hargaJual: 200, hargaBeli: 500, kategori: 'Peralatan', tipe: 'zirah', stats: { hp: 60, defense: 8, mana: 30 } },
    
    // --- Armor Tier 3 ---
    { nama: "Zirah Baja", hargaJual: 600, hargaBeli: 1500, kategori: 'Peralatan', tipe: 'zirah', stats: { hp: 150, defense: 18 } },
    { nama: "Jubah Sihir", hargaJual: 500, hargaBeli: 1300, kategori: 'Peralatan', tipe: 'zirah', stats: { hp: 80, defense: 10, mana: 60 } },
    
    // --- Armor Tier 4 ---
    { nama: "Zirah Kristal", hargaJual: 1200, hargaBeli: 3000, kategori: 'Peralatan', tipe: 'zirah', stats: { hp: 200, defense: 25 } },
    { nama: "Jubah Aether", hargaJual: 1000, hargaBeli: 2600, kategori: 'Peralatan', tipe: 'zirah', stats: { hp: 100, defense: 15, mana: 100 } },
    
    // --- Pants Tier 1 ---
    { nama: "Celana Kain", hargaJual: 30, hargaBeli: 80, kategori: 'Peralatan', tipe: 'celana', stats: { hp: 15, defense: 1 } },
    { nama: "Celana Jerami", hargaJual: 15, hargaBeli: 50, kategori: 'Peralatan', tipe: 'celana', stats: { hp: 8, defense: 1 } },
    
    // --- Pants Tier 2 ---
    { nama: "Celana Kulit", hargaJual: 150, hargaBeli: 360, kategori: 'Peralatan', tipe: 'celana', stats: { hp: 35, defense: 4 } },
    { nama: "Celana Besi", hargaJual: 200, hargaBeli: 500, kategori: 'Peralatan', tipe: 'celana', stats: { hp: 50, defense: 6 } },
    
    // --- Pants Tier 3 ---
    { nama: "Celana Baja", hargaJual: 400, hargaBeli: 1000, kategori: 'Peralatan', tipe: 'celana', stats: { hp: 80, defense: 10 } },
    { nama: "Celana Sihir", hargaJual: 350, hargaBeli: 900, kategori: 'Peralatan', tipe: 'celana', stats: { hp: 40, defense: 5, mana: 40 } },
    
    // --- Pants Tier 4 ---
    { nama: "Celana Kristal", hargaJual: 800, hargaBeli: 2000, kategori: 'Peralatan', tipe: 'celana', stats: { hp: 120, defense: 15 } },
    { nama: "Celana Aether", hargaJual: 750, hargaBeli: 1900, kategori: 'Peralatan', tipe: 'celana', stats: { hp: 60, defense: 8, mana: 60 } },
    
    // --- Shoes Tier 1 ---
    { nama: "Sepatu Bot", hargaJual: 35, hargaBeli: 90, kategori: 'Peralatan', tipe: 'sepatu', stats: { hp: 10, defense: 2 } },
    { nama: "Sandal Kayu", hargaJual: 20, hargaBeli: 60, kategori: 'Peralatan', tipe: 'sepatu', stats: { hp: 5, defense: 1 } },
    
    // --- Shoes Tier 2 ---
    { nama: "Sepatu Besi", hargaJual: 120, hargaBeli: 300, kategori: 'Peralatan', tipe: 'sepatu', stats: { hp: 25, defense: 4 } },
    { nama: "Sepatu Kulit", hargaJual: 80, hargaBeli: 200, kategori: 'Peralatan', tipe: 'sepatu', stats: { hp: 20, defense: 3 } },
    
    // --- Shoes Tier 3 ---
    { nama: "Sepatu Baja", hargaJual: 300, hargaBeli: 760, kategori: 'Peralatan', tipe: 'sepatu', stats: { hp: 40, defense: 6 } },
    { nama: "Sepatu Sihir", hargaJual: 250, hargaBeli: 640, kategori: 'Peralatan', tipe: 'sepatu', stats: { hp: 20, defense: 3, mana: 30 } },
    
    // --- Shoes Tier 4 ---
    { nama: "Sepatu Kristal", hargaJual: 600, hargaBeli: 1500, kategori: 'Peralatan', tipe: 'sepatu', stats: { hp: 60, defense: 9 } },
    { nama: "Sepatu Aether", hargaJual: 550, hargaBeli: 1400, kategori: 'Peralatan', tipe: 'sepatu', stats: { hp: 30, defense: 5, mana: 45 } },
    
    // --- Accessories Tier 1 ---
    { nama: "Cincin Perak", hargaJual: 100, hargaBeli: 240, kategori: 'Peralatan', tipe: 'aksesoris', stats: { attack: 2, defense: 2 } },
    { nama: "Kalung Kayu", hargaJual: 50, hargaBeli: 140, kategori: 'Peralatan', tipe: 'aksesoris', stats: { hp: 15, defense: 1 } },
    { nama: "Gelang Kain", hargaJual: 30, hargaBeli: 90, kategori: 'Peralatan', tipe: 'aksesoris', stats: { hp: 10, mana: 5 } },
    
    // --- Accessories Tier 2 ---
    { nama: "Cincin Emas", hargaJual: 250, hargaBeli: 600, kategori: 'Peralatan', tipe: 'aksesoris', stats: { attack: 5, defense: 5 } },
    { nama: "Kalung Besi", hargaJual: 150, hargaBeli: 400, kategori: 'Peralatan', tipe: 'aksesoris', stats: { hp: 30, defense: 3 } },
    { nama: "Gelang Sihir", hargaJual: 200, hargaBeli: 500, kategori: 'Peralatan', tipe: 'aksesoris', stats: { hp: 20, mana: 25 } },
    
    // --- Accessories Tier 3 ---
    { nama: "Cincin Kristal", hargaJual: 500, hargaBeli: 1200, kategori: 'Peralatan', tipe: 'aksesoris', stats: { attack: 8, defense: 8 } },
    { nama: "Kalung Baja", hargaJual: 400, hargaBeli: 1000, kategori: 'Peralatan', tipe: 'aksesoris', stats: { hp: 50, defense: 6 } },
    { nama: "Gelang Aether", hargaJual: 450, hargaBeli: 1100, kategori: 'Peralatan', tipe: 'aksesoris', stats: { hp: 30, mana: 40 } },
    
    // --- Accessories Tier 4 ---
    { nama: "Cincin Legendaris", hargaJual: 1000, hargaBeli: 2400, kategori: 'Peralatan', tipe: 'aksesoris', stats: { attack: 12, defense: 12 } },
    { nama: "Kalung Kristal", hargaJual: 800, hargaBeli: 2000, kategori: 'Peralatan', tipe: 'aksesoris', stats: { hp: 80, defense: 10 } },
    { nama: "Gelang Legendaris", hargaJual: 900, hargaBeli: 2200, kategori: 'Peralatan', tipe: 'aksesoris', stats: { hp: 50, mana: 60 } },

    // --- Senjata Starter ---
    { nama: "Pedang Latihan", hargaJual: 1, hargaBeli: 0, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 7, hp: 10 } },
    { nama: "Belati Gesit", hargaJual: 1, hargaBeli: 0, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 9 } },
    { nama: "Tongkat Sihir", hargaJual: 1, hargaBeli: 0, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 5, mana: 20 } },
    { nama: "Busur Pemburu", hargaJual: 1, hargaBeli: 0, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 6, defense: 1 } },
];

module.exports = items;