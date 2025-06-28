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
║  �� RPG WhatsApp Bot - Created by Evarick                                    ║
║  📱 WhatsApp Group: https://chat.whatsapp.com/KhS1xo5FMVj5UQQLKTOl2G         ║
║  🎯 Discord Server: https://discord.gg/HbBGznaR                              ║
║  📺 YouTube Channel: https://youtube.com/channel/UCKL8nAmqlVJvvPK_LPZJt0g              ║
║  📸 Instagram: https://www.instagram.com/evarick1.1                         ║
║                                                                              ║
║  ⚠️  This bot is created by Evarick. Please respect the creator!              ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

const craftingRecipes = [
    // === BASIC TOOLS & WORKBENCHES ===
    {
        id: "crafting_table",
        nama: "Crafting Table",
        kategori: "Tool",
        tier: 1,
        materials: {
            "Kayu": 10,
            "Batu": 5
        },
        gold: 0,
        level: 1,
        description: "Basic crafting table for simple items"
    },
    {
        id: "enchanting_table",
        nama: "Enchanting Table",
        kategori: "Tool",
        tier: 2,
        materials: {
            "Kayu": 20,
            "Batu": 15,
            "Batu Permata": 2
        },
        gold: 1000,
        level: 10,
        description: "Advanced table for enchanting items"
    },

    // === BASIC WEAPONS (TIER 1) ===
    {
        id: "pedang_kayu",
        nama: "Pedang Kayu",
        kategori: "Weapon",
        tier: 1,
        materials: {
            "Kayu": 5,
            "Kulit Serigala": 2
        },
        gold: 0,
        level: 1,
        stats: { attack: 5 },
        description: "Basic wooden sword"
    },
    {
        id: "tongkat_kayu",
        nama: "Tongkat Kayu",
        kategori: "Weapon",
        tier: 1,
        materials: {
            "Kayu": 3,
            "Kulit Serigala": 1
        },
        gold: 0,
        level: 1,
        stats: { attack: 3, mana: 10 },
        description: "Simple wooden staff"
    },
    {
        id: "belati_kayu",
        nama: "Belati Kayu",
        kategori: "Weapon",
        tier: 1,
        materials: {
            "Kayu": 2,
            "Kulit Serigala": 1
        },
        gold: 0,
        level: 1,
        stats: { attack: 4 },
        description: "Sharp wooden dagger"
    },

    // === IRON WEAPONS (TIER 2) ===
    {
        id: "pedang_besi",
        nama: "Pedang Besi",
        kategori: "Weapon",
        tier: 2,
        materials: {
            "Batu": 8,
            "Kayu": 2,
            "Kulit Serigala": 1
        },
        gold: 100,
        level: 5,
        stats: { attack: 15 },
        description: "Reliable iron sword"
    },
    {
        id: "tongkat_besi",
        nama: "Tongkat Besi",
        kategori: "Weapon",
        tier: 2,
        materials: {
            "Batu": 5,
            "Kayu": 3,
            "Batu Permata": 1
        },
        gold: 150,
        level: 5,
        stats: { attack: 8, mana: 25 },
        description: "Iron staff with magical properties"
    },

    // === STEEL WEAPONS (TIER 3) ===
    {
        id: "pedang_baja",
        nama: "Pedang Baja",
        kategori: "Weapon",
        tier: 3,
        materials: {
            "Batu Granit": 4,
            "Batu": 2,
            "Kayu": 3,
            "Kulit Buaya": 2
        },
        gold: 500,
        level: 15,
        stats: { attack: 25 },
        description: "High-quality steel sword"
    },
    {
        id: "tongkat_sihir",
        nama: "Tongkat Sihir",
        kategori: "Weapon",
        tier: 3,
        materials: {
            "Batu Granit": 2,
            "Batu Safir": 3,
            "Kayu Ajaib": 1
        },
        gold: 600,
        level: 15,
        stats: { attack: 15, mana: 40 },
        description: "Magical staff with enhanced power"
    },

    // === CRYSTAL WEAPONS (TIER 4) ===
    {
        id: "pedang_kristal",
        nama: "Pedang Kristal",
        kategori: "Weapon",
        tier: 4,
        materials: {
            "Batu Berlian": 5,
            "Batu Granit": 3,
            "Kayu Legendaris": 2
        },
        gold: 2000,
        level: 25,
        stats: { attack: 35, mana: 20 },
        description: "Legendary crystal sword"
    },

    // === ARMOR CRAFTING ===
    {
        id: "zirah_kulit",
        nama: "Zirah Kulit",
        kategori: "Armor",
        tier: 1,
        materials: {
            "Kulit Serigala": 5,
            "Kayu": 3
        },
        gold: 50,
        level: 3,
        stats: { hp: 40, defense: 5 },
        description: "Basic leather armor"
    },
    {
        id: "zirah_besi",
        nama: "Zirah Besi",
        kategori: "Armor",
        tier: 2,
        materials: {
            "Batu": 8,
            "Kulit Serigala": 3,
            "Kayu": 2
        },
        gold: 300,
        level: 8,
        stats: { hp: 100, defense: 12 },
        description: "Reliable iron armor"
    },
    {
        id: "zirah_baja",
        nama: "Zirah Baja",
        kategori: "Armor",
        tier: 3,
        materials: {
            "Batu Granit": 10,
            "Batu": 5,
            "Kulit Buaya": 3
        },
        gold: 1000,
        level: 18,
        stats: { hp: 150, defense: 18 },
        description: "High-quality steel armor"
    },

    // === HELMET CRAFTING ===
    {
        id: "helem_kulit",
        nama: "Helem Kulit",
        kategori: "Helmet",
        tier: 1,
        materials: {
            "Kulit Serigala": 3,
            "Kayu": 1
        },
        gold: 30,
        level: 2,
        stats: { hp: 20, defense: 2 },
        description: "Basic leather helmet"
    },
    {
        id: "helem_besi",
        nama: "Helem Besi",
        kategori: "Helmet",
        tier: 2,
        materials: {
            "Batu": 4,
            "Kulit Serigala": 2
        },
        gold: 200,
        level: 7,
        stats: { hp: 50, defense: 5 },
        description: "Reliable iron helmet"
    },

    // === ACCESSORIES CRAFTING ===
    {
        id: "cincin_perak",
        nama: "Cincin Perak",
        kategori: "Accessory",
        tier: 1,
        materials: {
            "Batu": 2,
            "Batu Permata": 1
        },
        gold: 200,
        level: 5,
        stats: { attack: 2, defense: 2 },
        description: "Basic silver ring"
    },
    {
        id: "cincin_emas",
        nama: "Cincin Emas",
        kategori: "Accessory",
        tier: 2,
        materials: {
            "Batu Granit": 3,
            "Batu Safir": 2
        },
        gold: 500,
        level: 12,
        stats: { attack: 5, defense: 5 },
        description: "Enhanced gold ring"
    },

    // === CONSUMABLES CRAFTING ===
    {
        id: "health_potion",
        nama: "Health Potion",
        kategori: "Consumable",
        tier: 1,
        materials: {
            "Ikan Mas": 2,
            "Kayu": 1
        },
        gold: 10,
        level: 1,
        stats: { heal: 50 },
        description: "Restores 50 HP"
    },
    {
        id: "mana_potion",
        nama: "Mana Potion",
        kategori: "Consumable",
        tier: 1,
        materials: {
            "Ikan Mas": 1,
            "Batu Permata": 1
        },
        gold: 15,
        level: 1,
        stats: { mana: 30 },
        description: "Restores 30 Mana"
    },
    {
        id: "strength_potion",
        nama: "Strength Potion",
        kategori: "Consumable",
        tier: 2,
        materials: {
            "Ikan Kakap": 3,
            "Batu Safir": 2,
            "Batu": 1
        },
        gold: 200,
        level: 8,
        stats: { attack: 10, duration: 300 },
        description: "Increases attack for 5 minutes"
    },

    // === SPECIAL ITEMS ===
    {
        id: "lucky_charm",
        nama: "Lucky Charm",
        kategori: "Accessory",
        tier: 3,
        materials: {
            "Batu Berlian": 3,
            "Kayu Ajaib": 2,
            "Ikan Hiu Kecil": 1
        },
        gold: 3000,
        level: 20,
        stats: { luck: 15 },
        description: "Increases luck and rare item chance"
    },
    {
        id: "fishing_rod_enhanced",
        nama: "Enhanced Fishing Rod",
        kategori: "Tool",
        tier: 2,
        materials: {
            "Kayu Keras": 5,
            "Kulit Serigala": 2,
            "Ikan Mas": 3
        },
        gold: 500,
        level: 10,
        description: "Better fishing rod with increased rare fish chance"
    },
    {
        id: "mining_pick_enhanced",
        nama: "Enhanced Mining Pick",
        kategori: "Tool",
        tier: 2,
        materials: {
            "Batu Granit": 5,
            "Kayu Keras": 3,
            "Batu": 5
        },
        gold: 500,
        level: 10,
        description: "Better mining pick with increased rare mineral chance"
    },
    {
        id: "woodcutting_axe_enhanced",
        nama: "Enhanced Woodcutting Axe",
        kategori: "Tool",
        tier: 2,
        materials: {
            "Kayu Keras": 5,
            "Batu": 3,
            "Kulit Serigala": 2
        },
        gold: 500,
        level: 10,
        description: "Better woodcutting axe with increased rare wood chance"
    }
];

// Crafting categories for organization
const craftingCategories = {
    "Tool": "🛠️ Tools & Workbenches",
    "Weapon": "⚔️ Weapons",
    "Armor": "🛡️ Armor",
    "Helmet": "⛑️ Helmets",
    "Accessory": "💍 Accessories",
    "Consumable": "🧪 Potions & Consumables",
    "Special": "✨ Special Items"
};

// Crafting requirements by tier
const craftingRequirements = {
    1: { level: 1, gold: 0 },
    2: { level: 5, gold: 100 },
    3: { level: 15, gold: 500 },
    4: { level: 25, gold: 2000 }
};

module.exports = {
    craftingRecipes,
    craftingCategories,
    craftingRequirements
};