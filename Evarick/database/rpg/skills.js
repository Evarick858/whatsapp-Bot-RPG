module.exports = [
  // ========== TANK ==========
  // Fokus pada pertahanan, menyerap kerusakan, dan melindungi tim.
    {
      id: 'tank_perisai_baja',
      nama: 'Perisai Baja',
      deskripsi: 'Mengabaikan 50 attack lawan pada serangan berikutnya.',
      class: 'Tank',
      efek: 'ignore_50_attack',
      cooldown: 3,
      hargaBeli: 2000
    },
    {
      id: 'tank_benteng_kokoh',
      nama: 'Benteng Kokoh',
      deskripsi: 'Meningkatkan Defense diri sendiri sebesar 75% selama 2 giliran.',
      class: 'Tank',
      efek: 'buff_defense_75_2_turns',
      cooldown: 5,
      hargaBeli: 4500
    },
    {
      id: 'tank_provokasi',
      nama: 'Provokasi',
      deskripsi: 'Memaksa 1 musuh untuk hanya menyerang Anda selama 2 giliran.',
      class: 'Tank',
      efek: 'taunt_1_enemy_2_turns',
      cooldown: 4,
      hargaBeli: 6000
    },
    {
      id: 'tank_pantulan_duri',
      nama: 'Pantulan Duri',
      deskripsi: 'Memantulkan 30% dari kerusakan yang diterima kembali ke penyerang selama 3 giliran.',
      class: 'Tank',
      efek: 'reflect_damage_30_3_turns',
      cooldown: 6,
      hargaBeli: 8000
    },
    {
      id: 'tank_kekuatan_titan',
      nama: 'Kekuatan Titan',
      deskripsi: 'Menyerap seluruh kerusakan pada giliran ini dan mengubah 25% nya menjadi HP.',
      class: 'Tank',
      efek: 'absorb_damage_heal_25',
      cooldown: 8,
      hargaBeli: 15000
    },
    {
      id: 'tank_getaran_bumi',
      nama: 'Getaran Bumi',
      deskripsi: 'Menghentak tanah, mengurangi Attack semua musuh sebesar 20% selama 2 giliran.',
      class: 'Tank',
      efek: 'debuff_aoe_attack_20_2_turns',
      cooldown: 7,
      hargaBeli: 12000
    },
  
  // ========== FIGHTER ==========
  // Fokus pada kerusakan fisik yang konsisten dan pertempuran berkelanjutan.
    {
      id: 'fighter_serangan_ganda',
      nama: 'Serangan Ganda',
      deskripsi: 'Serang 2x dalam 1 giliran dengan 70% kekuatan per serangan.',
      class: 'Fighter',
      efek: 'double_attack_70',
      cooldown: 3,
      hargaBeli: 2000
    },
    {
      id: 'fighter_semangat_juang',
      nama: 'Semangat Juang',
      deskripsi: 'Memulihkan 15% HP setelah menggunakan skill ini.',
      class: 'Fighter',
      efek: 'heal_self_15_percent',
      cooldown: 4,
      hargaBeli: 4000
    },
    {
      id: 'fighter_pukulan_mematikan',
      nama: 'Pukulan Mematikan',
      deskripsi: 'Satu serangan dengan jaminan kritikal (damage x1.5).',
      class: 'Fighter',
      efek: 'guaranteed_critical',
      cooldown: 5,
      hargaBeli: 7500
    },
    {
      id: 'fighter_pemecah_tengkorak',
      nama: 'Pemecah Tengkorak',
      deskripsi: 'Memberikan 150% kerusakan dan mengabaikan 30% defense musuh.',
      class: 'Fighter',
      efek: 'damage_150_ignore_30_def',
      cooldown: 6,
      hargaBeli: 9000
    },
    {
      id: 'fighter_badai_pedang',
      nama: 'Badai Pedang',
      deskripsi: 'Menyerang semua musuh di arena dengan 120% kerusakan fisik.',
      class: 'Fighter',
      efek: 'damage_aoe_120',
      cooldown: 8,
      hargaBeli: 16000
    },
    {
      id: 'fighter_tak_terkalahkan',
      nama: 'Tak Terkalahkan',
      deskripsi: 'Menjadi kebal terhadap semua damage selama 1 giliran.',
      class: 'Fighter',
      efek: 'invulnerable_1_turn',
      cooldown: 10,
      hargaBeli: 20000
    },
    
  // ========== ASSASSIN ==========
  // Fokus pada kecepatan, kerusakan besar dalam waktu singkat, dan serangan kritikal.
    {
      id: 'assassin_serangan_mendadak',
      nama: 'Serangan Mendadak',
      deskripsi: 'Damage +50% untuk 1 serangan pada giliran ini.',
      class: 'Assassin',
      efek: 'bonus_50_percent_damage',
      cooldown: 3,
      hargaBeli: 2000
    },
    {
      id: 'assassin_langkah_bayangan',
      nama: 'Langkah Bayangan',
      deskripsi: 'Meningkatkan Evasion (kesempatan menghindar) sebesar 50% selama 2 giliran.',
      class: 'Assassin',
      efek: 'buff_evasion_50_2_turns',
      cooldown: 5,
      hargaBeli: 5000
    },
    {
      id: 'assassin_tusukan_beracun',
      nama: 'Tusukan Beracun',
      deskripsi: 'Memberikan 80% kerusakan dan menyebabkan lawan terkena damage racun selama 3 giliran.',
      class: 'Assassin',
      efek: 'damage_80_plus_poison_3_turns',
      cooldown: 4,
      hargaBeli: 7000
    },
    {
      id: 'assassin_mencari_kelemahan',
      nama: 'Mencari Kelemahan',
      deskripsi: 'Meningkatkan 100% kemungkinan serangan kritikal untuk serangan berikutnya.',
      class: 'Assassin',
      efek: 'guaranteed_crit_next_hit',
      cooldown: 6,
      hargaBeli: 9500
    },
    {
      id: 'assassin_bom_asap',
      nama: 'Bom Asap',
      deskripsi: 'Menurunkan akurasi semua musuh sebesar 40% selama 2 giliran.',
      class: 'Assassin',
      efek: 'debuff_aoe_accuracy_40_2_turns',
      cooldown: 7,
      hargaBeli: 11000
    },
    {
      id: 'assassin_tarian_pisau',
      nama: 'Tarian Pisau',
      deskripsi: 'Menyerang 4x secara acak ke musuh dengan 60% kekuatan per serangan.',
      class: 'Assassin',
      efek: 'random_4_hits_60',
      cooldown: 8,
      hargaBeli: 18000
    },
  
  // ========== MAGE ==========
  // Fokus pada sihir kuat, kerusakan area, dan manipulasi mana.
    {
      id: 'mage_perisai_mana',
      nama: 'Perisai Mana',
      deskripsi: 'Serangan lawan berikutnya dikurangi sebesar mana/2.',
      class: 'Mage',
      efek: 'reduce_damage_by_mana_div_2',
      cooldown: 3,
      hargaBeli: 2000
    },
    {
      id: 'mage_bola_api',
      nama: 'Bola Api',
      deskripsi: 'Memberikan 140% kerusakan sihir dan menyebabkan luka bakar (damage over time) selama 2 giliran.',
      class: 'Mage',
      efek: 'damage_140_plus_burn_2_turns',
      cooldown: 4,
      hargaBeli: 5500
    },
    {
      id: 'mage_rantai_petir',
      nama: 'Rantai Petir',
      deskripsi: 'Menyambar 1 musuh utama dengan 120% kerusakan, lalu menyambar musuh lain dengan 60% kerusakan.',
      class: 'Mage',
      efek: 'chain_lightning_120_60',
      cooldown: 5,
      hargaBeli: 8500
    },
    {
      id: 'mage_meditasi',
      nama: 'Meditasi',
      deskripsi: 'Memulihkan 40% dari Max Mana.',
      class: 'Mage',
      efek: 'recover_mana_40_percent',
      cooldown: 6,
      hargaBeli: 10000
    },
    {
      id: 'mage_badai_es',
      nama: 'Badai Es',
      deskripsi: 'Menyerang semua musuh dengan 100% kerusakan dan berpeluang membekukan mereka selama 1 giliran.',
      class: 'Mage',
      efek: 'damage_aoe_100_plus_freeze_chance',
      cooldown: 8,
      hargaBeli: 17000
    },
    {
      id: 'mage_singularitas',
      nama: 'Singularitas',
      deskripsi: 'Menciptakan lubang hitam kecil yang memberikan 350% kerusakan sihir pada satu target.',
      class: 'Mage',
      efek: 'damage_350_single_target',
      cooldown: 10,
      hargaBeli: 22000
    },
    
  // ========== ARCHER ==========
  // Fokus pada serangan jarak jauh yang akurat dan efek tambahan pada tembakan.
    {
      id: 'archer_tembakan_jitu',
      nama: 'Tembakan Jitu',
      deskripsi: 'Serangan tidak bisa dihindari, damage +30%.',
      class: 'Archer',
      efek: 'true_hit_30_bonus',
      cooldown: 3,
      hargaBeli: 2000
    },
    {
      id: 'archer_panah_bercabang',
      nama: 'Panah Bercabang',
      deskripsi: 'Menembak 1 musuh utama dan 1 musuh acak lainnya dengan 80% kerusakan.',
      class: 'Archer',
      efek: 'split_shot_80',
      cooldown: 4,
      hargaBeli: 6500
    },
    {
      id: 'archer_panah_penjerat',
      nama: 'Panah Penjerat',
      deskripsi: 'Serangan yang mengurangi kecepatan lawan sebesar 50% selama 2 giliran.',
      class: 'Archer',
      efek: 'debuff_speed_50_2_turns',
      cooldown: 5,
      hargaBeli: 8000
    },
    {
      id: 'archer_fokus_penuh',
      nama: 'Fokus Penuh',
      deskripsi: 'Meningkatkan Attack sebesar 40% selama 3 giliran.',
      class: 'Archer',
      efek: 'buff_attack_40_3_turns',
      cooldown: 6,
      hargaBeli: 10000
    },
    {
      id: 'archer_hujan_panah',
      nama: 'Hujan Panah',
      deskripsi: 'Menyerang semua musuh dengan 130% kerusakan.',
      class: 'Archer',
      efek: 'damage_aoe_130',
      cooldown: 8,
      hargaBeli: 16500
    },
    {
      id: 'archer_elang_pembidik',
      nama: 'Elang Pembidik',
      deskripsi: 'Serangan berikutnya akan mengabaikan 100% defense lawan.',
      class: 'Archer',
      efek: 'ignore_100_def_next_hit',
      cooldown: 9,
      hargaBeli: 19000
    },
    {
      id: 'tank_perisai_balas_dendam',
      nama: 'Perisai Balas Dendam',
      deskripsi: 'Selama 3 ronde, 30% dari total attack musuh yang menyerang diubah menjadi heal untuk diri sendiri.',
      class: 'Tank',
      efek: 'lifesteal_from_attacker_30_3_turns',
      cooldown: 8,
      hargaBeli: 60000
    },
    {
      id: 'mage_semburan_magma',
      nama: 'Semburan Magma',
      deskripsi: 'Menyemburkan magma panas yang memberikan 180% kerusakan, 30% kemungkinan stun 1 ronde, dan efek burn selama 4 ronde.',
      class: 'Mage',
      efek: 'damage_180_burn_4_stun_chance',
      cooldown: 9,
      hargaBeli: 65000
    },
    {
      id: 'archer_panah_pembungkam',
      nama: 'Panah Pembungkam',
      deskripsi: 'Tembakan presisi yang melumpuhkan musuh, mencegah mereka menggunakan skill selama 2 ronde dan melemahkan Attack mereka sebesar 20% selama 4 ronde.',
      class: 'Archer',
      efek: 'silence_2_debuff_attack_20_4_turns',
      cooldown: 8,
      hargaBeli: 68000
    },
    {
      id: 'assassin_jubah_malam_abadi',
      nama: 'Jubah Malam Abadi',
      deskripsi: 'Menjadi tidak kasat mata selama 4 ronde, meningkatkan Evasion sebesar 60% dan melemahkan Attack lawan sebesar 50%. Setiap seranganmu selama durasi ini akan meningkatkan Attack-mu sebesar 5% (maks 4 tumpuk).',
      class: 'Assassin',
      efek: 'stealth_debuff_stacking_buff_4_turns',
      cooldown: 9,
      hargaBeli: 75000
    },
    {
      id: 'fighter_haus_darah',
      nama: 'Haus Darah',
      deskripsi: 'Mengorbankan 5% Max HP untuk meningkatkan Attack sebesar 30% selama 2 ronde. Setiap serangan selama durasi ini akan memulihkan 20 HP.',
      class: 'Fighter',
      efek: 'bloodlust_ sacrificing_for_power',
      cooldown: 7,
      hargaBeli: 62000
    },

  ];