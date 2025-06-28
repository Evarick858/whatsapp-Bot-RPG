/*
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  ███████╗██╗   ██╗ █████╗ ██████╗ ██╗  ██████╗██╗  ██╗                          ║
║  ██╔════╝██║   ██║██╔══██╗██╔══██╗██║ ██╔════╝██║ ██╔╝                          ║
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
    // =================================================================
    // ========== LOOT DARI ZONA BARU (TAMBAHAN) ==========
    // =================================================================

    // ========== LOOT KEPULAUAN LANGIT ==========
    { nama: "Bulu Gryphon", hargaJual: 450, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Daging Unggas", hargaJual: 150, hargaBeli: 0, kategori: 'Material' },
    { nama: "Esensi Angin", hargaJual: 550, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Sisik Kristal", hargaJual: 500, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Pecahan Batu Apung", hargaJual: 400, hargaBeli: 0, kategori: 'Material' },
    { nama: "Mata Gargoyle", hargaJual: 600, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Jantung Badai", hargaJual: 1800, hargaBeli: 0, kategori: 'Spesial' },
    { nama: "Bulu Roc Emas", hargaJual: 2500, hargaBeli: 0, kategori: 'Spesial' },

    // ========== LOOT TANAH TERKUTUK ==========
    { nama: "Taring Berkarat", hargaJual: 700, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Akar Hidup", hargaJual: 850, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Kayu Terkutuk", hargaJual: 650, hargaBeli: 0, kategori: 'Material' },
    { nama: "Kantong Asam", hargaJual: 900, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Daging Mutasi", hargaJual: 800, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Mata Majemuk", hargaJual: 1100, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Inti Kutukan", hargaJual: 3000, hargaBeli: 0, kategori: 'Spesial' },
    { nama: "Tanah Berdosa", hargaJual: 1500, hargaBeli: 0, kategori: 'Material' },

    // ========== LOOT KOTA MEKANIS ==========
    { nama: "Kaki Mekanis", hargaJual: 1200, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Lensa Optik", hargaJual: 1500, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Plat Besi Bertuah", hargaJual: 1300, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Inti Golem Baja", hargaJual: 2200, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Sumber Energi Rusak", hargaJual: 1800, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Roda Gigi Waktu", hargaJual: 5000, hargaBeli: 0, kategori: 'Spesial' },
    { nama: "Kristal Chronos", hargaJual: 8000, hargaBeli: 0, kategori: 'Spesial' },

    // ========== LOOT LAUT DALAM ==========
    { nama: "Gigi Hiu Purba", hargaJual: 1200, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Kantung Listrik", hargaJual: 1100, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Tombak Karang", hargaJual: 1400, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Sisik Siren", hargaJual: 1300, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Tinta Kraken", hargaJual: 2000, hargaBeli: 0, kategori: 'Loot' },
    { nama: "Mata Kraken", hargaJual: 3500, hargaBeli: 0, kategori: 'Spesial' },

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
    { nama: "Busur Panah", hargaJual: 450, hargaBeli: 2200, kategori: 'RARE', tipe: 'senjata', stats: { attack: 40, defense: 10 } },
    { nama: "Martil Perang", hargaJual: 500, hargaBeli: 2400, kategori: 'RARE', tipe: 'senjata', stats: { attack: 60, hp: 30 } },
    
    // --- Senjata Tier 4 (Rare) ---
    { nama: "Pedang Kristal", hargaJual: 800, hargaBeli: 4000, kategori: 'RARE', tipe: 'senjata', stats: { attack: 70, mana: 40 } },
    { nama: "Tongkat Aether", hargaJual: 750, hargaBeli: 3800, kategori: 'RARE', tipe: 'senjata', stats: { attack: 40, mana: 120 } },
    { nama: "Belati Bayangan", hargaJual: 700, hargaBeli: 3600, kategori: 'RARE', tipe: 'senjata', stats: { attack: 56 } },
    { nama: "Busur Legendaris", hargaJual: 900, hargaBeli: 8800, kategori: 'EPIC', tipe: 'senjata', stats: { attack: 84, defense: 24 } },
    { nama: "Kapak Guntur", hargaJual: 1000, hargaBeli: 9600, kategori: 'EPIC', tipe: 'senjata', stats: { attack: 120, hp: 75 } },
    
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
    { nama: "Helem Kristal", hargaJual: 800, hargaBeli: 4000, kategori: 'RARE', tipe: 'helem', stats: { hp: 240, defense: 24 } },
    { nama: "Mahkota Aether", hargaJual: 750, hargaBeli: 3800, kategori: 'RARE', tipe: 'helem', stats: { hp: 100, mana: 160, defense: 10 } },
    
    // --- Armor Tier 1 ---
    { nama: "Zirah Kulit", hargaJual: 60, hargaBeli: 160, kategori: 'Peralatan', tipe: 'zirah', stats: { hp: 40, defense: 5 } },
    { nama: "Jubah Kain", hargaJual: 35, hargaBeli: 100, kategori: 'Peralatan', tipe: 'zirah', stats: { hp: 20, defense: 2, mana: 15 } },
    { nama: "Baju Jerami", hargaJual: 20, hargaBeli: 60, kategori: 'Peralatan', tipe: 'zirah', stats: { hp: 10, defense: 1 } },
    
    // --- Armor Tier 2 ---
    { nama: "Zirah Besi", hargaJual: 250, hargaBeli: 600, kategori: 'Peralatan', tipe: 'zirah', stats: { hp: 100, defense: 12 } },
    { nama: "Jubah Besi", hargaJual: 200, hargaBeli: 500, kategori: 'Peralatan', tipe: 'zirah', stats: { hp: 60, defense: 8, mana: 30 } },
    
    // --- Armor Tier 3 ---
    { nama: "Zirah Baja", hargaJual: 600, hargaBeli: 3000, kategori: 'RARE', tipe: 'zirah', stats: { hp: 300, defense: 36 } },
    { nama: "Jubah Sihir", hargaJual: 500, hargaBeli: 2600, kategori: 'RARE', tipe: 'zirah', stats: { hp: 160, defense: 20, mana: 120 } },
    
    // --- Armor Tier 4 ---
    { nama: "Zirah Kristal", hargaJual: 1200, hargaBeli: 12000, kategori: 'EPIC', tipe: 'zirah', stats: { hp: 600, defense: 75 } },
    { nama: "Jubah Aether", hargaJual: 1000, hargaBeli: 10400, kategori: 'EPIC', tipe: 'zirah', stats: { hp: 300, defense: 45, mana: 300 } },
    
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
    { nama: "Celana Kristal", hargaJual: 800, hargaBeli: 4000, kategori: 'RARE', tipe: 'celana', stats: { hp: 240, defense: 30 } },
    { nama: "Celana Aether", hargaJual: 750, hargaBeli: 3800, kategori: 'RARE', tipe: 'celana', stats: { hp: 120, defense: 16, mana: 120 } },
    
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
    { nama: "Sepatu Kristal", hargaJual: 600, hargaBeli: 3000, kategori: 'RARE', tipe: 'sepatu', stats: { hp: 120, defense: 18 } },
    { nama: "Sepatu Aether", hargaJual: 550, hargaBeli: 2800, kategori: 'RARE', tipe: 'sepatu', stats: { hp: 60, defense: 10, mana: 90 } },
    
    // --- Accessories Tier 1 ---
    { nama: "Cincin Perak", hargaJual: 100, hargaBeli: 240, kategori: 'Peralatan', tipe: 'aksesoris', stats: { attack: 2, defense: 2 } },
    { nama: "Kalung Kayu", hargaJual: 50, hargaBeli: 140, kategori: 'Peralatan', tipe: 'aksesoris', stats: { hp: 15, defense: 1 } },
    { nama: "Gelang Kain", hargaJual: 30, hargaBeli: 90, kategori: 'Peralatan', tipe: 'aksesoris', stats: { hp: 10, mana: 5 } },
    
    // --- Accessories Tier 2 ---
    { nama: "Cincin Emas", hargaJual: 250, hargaBeli: 600, kategori: 'Peralatan', tipe: 'aksesoris', stats: { attack: 5, defense: 5 } },
    { nama: "Kalung Besi", hargaJual: 150, hargaBeli: 400, kategori: 'Peralatan', tipe: 'aksesoris', stats: { hp: 30, defense: 3 } },
    { nama: "Gelang Sihir", hargaJual: 200, hargaBeli: 500, kategori: 'Peralatan', tipe: 'aksesoris', stats: { hp: 20, mana: 25 } },
    
    // --- Accessories Tier 3 ---
    { nama: "Cincin Kristal", hargaJual: 500, hargaBeli: 2400, kategori: 'RARE', tipe: 'aksesoris', stats: { attack: 16, defense: 16 } },
    { nama: "Kalung Baja", hargaJual: 400, hargaBeli: 1000, kategori: 'Peralatan', tipe: 'aksesoris', stats: { hp: 50, defense: 6 } },
    { nama: "Gelang Aether", hargaJual: 450, hargaBeli: 2200, kategori: 'RARE', tipe: 'aksesoris', stats: { hp: 60, mana: 80 } },
    
    // --- Accessories Tier 4 ---
    { nama: "Cincin Legendaris", hargaJual: 1000, hargaBeli: 9600, kategori: 'EPIC', tipe: 'aksesoris', stats: { attack: 36, defense: 36 } },
    { nama: "Kalung Kristal", hargaJual: 800, hargaBeli: 4000, kategori: 'RARE', tipe: 'aksesoris', stats: { hp: 160, defense: 20 } },
    { nama: "Gelang Legendaris", hargaJual: 900, hargaBeli: 8800, kategori: 'EPIC', tipe: 'aksesoris', stats: { hp: 150, mana: 180 } },

    // --- Senjata Starter ---
    { nama: "Pedang Latihan", hargaJual: 1, hargaBeli: 0, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 7, hp: 10 } },
    { nama: "Belati Gesit", hargaJual: 1, hargaBeli: 0, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 9 } },
    { nama: "Tongkat Sihir", hargaJual: 1, hargaBeli: 0, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 5, mana: 20 } },
    { nama: "Busur Pemburu", hargaJual: 1, hargaBeli: 0, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 6, defense: 1 } },

    // === CONSUMABLES ===
    { nama: "Potion HP", hargaJual: 50, hargaBeli: 100, kategori: 'Consumable' },
    { nama: "Potion Mana", hargaJual: 50, hargaBeli: 100, kategori: 'Consumable' },
    { nama: "Potion Stamina", hargaJual: 75, hargaBeli: 150, kategori: 'Consumable' },
    { nama: "Elixir Kekuatan", hargaJual: 200, hargaBeli: 400, kategori: 'Consumable' },
    { nama: "Elixir Pertahanan", hargaJual: 200, hargaBeli: 400, kategori: 'Consumable' },

    // === LEGENDARY ITEMS ===
    { nama: "Pedang Legendaris", hargaJual: 5000, hargaBeli: 60000, kategori: 'LEGENDARY', tipe: 'senjata', stats: { attack: 200, mana: 120 } },
    { nama: "Mahkota Legendaris", hargaJual: 4000, hargaBeli: 48000, kategori: 'LEGENDARY', tipe: 'helem', stats: { hp: 800, mana: 400, defense: 60 } },
    { nama: "Zirah Legendaris", hargaJual: 6000, hargaBeli: 72000, kategori: 'LEGENDARY', tipe: 'zirah', stats: { hp: 1200, defense: 160 } },
    { nama: "Perisai Besar", hargaJual: 1, hargaBeli: 0, kategori: 'Peralatan', tipe: 'senjata', stats: { attack: 3, defense: 8, hp: 15 } },

// === IKAN MANCING (FISHING) ===
// --- Common Fish (70% total chance) ---
{ nama: "Ikan Mas", hargaJual: 8, hargaBeli: 0, kategori: 'Ikan', rarity: 'Common', chance: 25 },
{ nama: "Ikan Lele", hargaJual: 10, hargaBeli: 0, kategori: 'Ikan', rarity: 'Common', chance: 20 },
{ nama: "Ikan Nila", hargaJual: 12, hargaBeli: 0, kategori: 'Ikan', rarity: 'Common', chance: 15 },
{ nama: "Ikan Gurame", hargaJual: 15, hargaBeli: 0, kategori: 'Ikan', rarity: 'Common', chance: 10 },

// --- Uncommon Fish (20% total chance) ---
{ nama: "Ikan Bawal", hargaJual: 25, hargaBeli: 0, kategori: 'Ikan', rarity: 'Uncommon', chance: 8 },
{ nama: "Ikan Kakap", hargaJual: 35, hargaBeli: 0, kategori: 'Ikan', rarity: 'Uncommon', chance: 6 },
{ nama: "Ikan Tenggiri", hargaJual: 45, hargaBeli: 0, kategori: 'Ikan', rarity: 'Uncommon', chance: 4 },
{ nama: "Ikan Tuna", hargaJual: 60, hargaBeli: 0, kategori: 'Ikan', rarity: 'Uncommon', chance: 2 },

// --- Rare Fish (8% total chance) ---
{ nama: "Ikan Hiu Kecil", hargaJual: 150, hargaBeli: 0, kategori: 'Ikan', rarity: 'Rare', chance: 3 },
{ nama: "Ikan Pari", hargaJual: 200, hargaBeli: 0, kategori: 'Ikan', rarity: 'Rare', chance: 2.5 },
{ nama: "Ikan Paus Mini", hargaJual: 500, hargaBeli: 0, kategori: 'Ikan', rarity: 'Rare', chance: 1.5 },
{ nama: "Ikan Lumba-lumba", hargaJual: 800, hargaBeli: 0, kategori: 'Ikan', rarity: 'Rare', chance: 1 },

// --- Epic Fish (1.5% total chance) ---
{ nama: "Ikan Hiu Besar", hargaJual: 2000, hargaBeli: 0, kategori: 'Ikan', rarity: 'Epic', chance: 0.8 },
{ nama: "Ikan Paus Biru", hargaJual: 5000, hargaBeli: 0, kategori: 'Ikan', rarity: 'Epic', chance: 0.5 },
{ nama: "Ikan Kraken", hargaJual: 10000, hargaBeli: 0, kategori: 'Ikan', rarity: 'Epic', chance: 0.2 },

// --- Legendary Fish (0.5% total chance) ---
{ nama: "GOLD MEGALODON", hargaJual: 50000, hargaBeli: 0, kategori: 'Ikan', rarity: 'Legendary', chance: 0.1 },

// === ITEM WOODCUTTING (NEBANG) ===
// --- Common Items (70% total chance) ---
{ nama: "Kayu", hargaJual: 5, hargaBeli: 0, kategori: 'Material', rarity: 'Common', chance: 35 },
{ nama: "Ranting", hargaJual: 3, hargaBeli: 0, kategori: 'Material', rarity: 'Common', chance: 20 },
{ nama: "Daun Kering", hargaJual: 2, hargaBeli: 0, kategori: 'Material', rarity: 'Common', chance: 15 },

// --- Uncommon Items (25% total chance) ---
{ nama: "Kayu Keras", hargaJual: 12, hargaBeli: 0, kategori: 'Material', rarity: 'Uncommon', chance: 12 },
{ nama: "Ranting Berdaun", hargaJual: 8, hargaBeli: 0, kategori: 'Material', rarity: 'Uncommon', chance: 8 },
{ nama: "Kulit Kayu", hargaJual: 10, hargaBeli: 0, kategori: 'Material', rarity: 'Uncommon', chance: 5 },

// --- Rare Items (4% total chance) ---
{ nama: "Kayu Ajaib", hargaJual: 25, hargaBeli: 0, kategori: 'Material', rarity: 'Rare', chance: 2 },
{ nama: "Ranting Emas", hargaJual: 30, hargaBeli: 0, kategori: 'Material', rarity: 'Rare', chance: 1.5 },
{ nama: "Herbal Hutan", hargaJual: 20, hargaBeli: 0, kategori: 'Material', rarity: 'Rare', chance: 0.5 },

// --- Epic Items (0.9% total chance) ---
{ nama: "Kayu Legendaris", hargaJual: 100, hargaBeli: 0, kategori: 'Material', rarity: 'Epic', chance: 0.5 },
{ nama: "Ranting Kristal", hargaJual: 150, hargaBeli: 0, kategori: 'Material', rarity: 'Epic', chance: 0.3 },
{ nama: "Herbal Langka", hargaJual: 80, hargaBeli: 0, kategori: 'Material', rarity: 'Epic', chance: 0.1 },

// --- Legendary Items (0.1% total chance) ---
{ nama: "Kayu Dewa", hargaJual: 500, hargaBeli: 0, kategori: 'Material', rarity: 'Legendary', chance: 0.08 },
{ nama: "Ranting Aether", hargaJual: 1000, hargaBeli: 0, kategori: 'Material', rarity: 'Legendary', chance: 0.02 },

// === ITEM MINING (NAMBANG) ===
// --- Common Items (65% total chance) ---
{ nama: "Batu", hargaJual: 3, hargaBeli: 0, kategori: 'Mineral', rarity: 'Common', chance: 25 },
{ nama: "Pasir", hargaJual: 2, hargaBeli: 0, kategori: 'Mineral', rarity: 'Common', chance: 20 },
{ nama: "Tanah Liat", hargaJual: 1, hargaBeli: 0, kategori: 'Mineral', rarity: 'Common', chance: 15 },
{ nama: "Kerikil", hargaJual: 2, hargaBeli: 0, kategori: 'Mineral', rarity: 'Common', chance: 5 },

// --- Uncommon Items (25% total chance) ---
{ nama: "Batu Kapur", hargaJual: 8, hargaBeli: 0, kategori: 'Mineral', rarity: 'Uncommon', chance: 10 },
{ nama: "Batu Granit", hargaJual: 12, hargaBeli: 0, kategori: 'Mineral', rarity: 'Uncommon', chance: 8 },
{ nama: "Batu Marmer", hargaJual: 15, hargaBeli: 0, kategori: 'Mineral', rarity: 'Uncommon', chance: 5 },
{ nama: "Batu Obsidian", hargaJual: 18, hargaBeli: 0, kategori: 'Mineral', rarity: 'Uncommon', chance: 2 },

// --- Rare Items (8% total chance) ---
{ nama: "Batu Permata", hargaJual: 35, hargaBeli: 0, kategori: 'Mineral', rarity: 'Rare', chance: 3 },
{ nama: "Batu Safir", hargaJual: 45, hargaBeli: 0, kategori: 'Mineral', rarity: 'Rare', chance: 2 },
{ nama: "Batu Ruby", hargaJual: 50, hargaBeli: 0, kategori: 'Mineral', rarity: 'Rare', chance: 2 },
{ nama: "Batu Zamrud", hargaJual: 55, hargaBeli: 0, kategori: 'Mineral', rarity: 'Rare', chance: 1 },

// --- Epic Items (1.8% total chance) ---
{ nama: "Batu Berlian", hargaJual: 200, hargaBeli: 0, kategori: 'Mineral', rarity: 'Epic', chance: 0.8 },
{ nama: "Batu Amethyst", hargaJual: 150, hargaBeli: 0, kategori: 'Mineral', rarity: 'Epic', chance: 0.5 },
{ nama: "Batu Topaz", hargaJual: 180, hargaBeli: 0, kategori: 'Mineral', rarity: 'Epic', chance: 0.3 },
{ nama: "Batu Opal", hargaJual: 250, hargaBeli: 0, kategori: 'Mineral', rarity: 'Epic', chance: 0.2 },

// --- Legendary Items (0.2% total chance) ---
{ nama: "Batu Aether", hargaJual: 1000, hargaBeli: 0, kategori: 'Mineral', rarity: 'Legendary', chance: 0.1 },
{ nama: "Batu Dewa", hargaJual: 2000, hargaBeli: 0, kategori: 'Mineral', rarity: 'Legendary', chance: 0.08 },
{ nama: "Batu Kosmos", hargaJual: 5000, hargaBeli: 0, kategori: 'Mineral', rarity: 'Legendary', chance: 0.02 }

];

module.exports = items;
