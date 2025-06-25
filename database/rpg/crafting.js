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

const craftingRecipes = [
    // === BASIC TOOLS ===
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
            "Kristal Murni": 2
        },
        gold: 1000,
        level: 10,
        description: "Advanced table for enchanting items"
    },

    // === BASIC WEAPONS ===
    {
        id: "pedang_kayu",
        nama: "Pedang Kayu",
        kategori: "Weapon",
        tier: 1,
        materials: {
            "Kayu": 5,
            "Tali Kulit": 2
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
            "Serat Kain": 1
        },
        gold: 0,
        level: 1,
        stats: { attack: 3, mana: 10 },
        description: "Simple wooden staff"
    },

    // === IRON WEAPONS ===
    {
        id: "pedang_besi",
        nama: "Pedang Besi",
        kategori: "Weapon",
        tier: 2,
        materials: {
            "Besi Murni": 3,
            "Kayu": 2,
            "Tali Kulit": 1
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
            "Besi Murni": 2,
            "Kayu": 3,
            "Kristal Murni": 1
        },
        gold: 150,
        level: 5,
        stats: { attack: 8, mana: 25 },
        description: "Iron staff with magical properties"
    },

    // === STEEL WEAPONS ===
    {
        id: "pedang_baja",
        nama: "Pedang Baja",
        kategori: "Weapon",
        tier: 3,
        materials: {
            "Baja Karbon": 4,
            "Besi Murni": 2,
            "Kayu": 3,
            "Tali Kulit": 2
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
            "Baja Karbon": 2,
            "Kristal Murni": 3,
            "Serat Aether": 1
        },
        gold: 600,
        level: 15,
        stats: { attack: 15, mana: 40 },
        description: "Magical staff with enhanced power"
    },

    // === CRYSTAL WEAPONS ===
    {
        id: "pedang_kristal",
        nama: "Pedang Kristal",
        kategori: "Weapon",
        tier: 4,
        materials: {
            "Kristal Murni": 5,
            "Baja Karbon": 3,
            "Serat Aether": 2
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
            "Tali Kulit": 3
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
            "Besi Murni": 8,
            "Kulit Serigala": 3,
            "Tali Kulit": 2
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
            "Baja Karbon": 10,
            "Besi Murni": 5,
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
            "Tali Kulit": 1
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
            "Besi Murni": 4,
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
            "Besi Murni": 2,
            "Kristal Murni": 1
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
            "Baja Karbon": 3,
            "Kristal Murni": 2
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
            "Ikan": 2,
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
            "Ikan": 1,
            "Kristal Murni": 1
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
            "Daging": 3,
            "Kristal Murni": 2,
            "Besi Murni": 1
        },
        gold: 200,
        level: 8,
        stats: { attack: 10, duration: 300 },
        description: "Increases attack for 5 minutes"
    },

    // === SPECIAL ITEMS ===
    {
        id: "pet_evolution_stone",
        nama: "Pet Evolution Stone",
        kategori: "Special",
        tier: 3,
        materials: {
            "Kristal Murni": 10,
            "Serat Aether": 5,
            "Fragmen Waktu": 1
        },
        gold: 5000,
        level: 30,
        description: "Allows pets to evolve to next tier"
    },
    {
        id: "lucky_charm",
        nama: "Lucky Charm",
        kategori: "Accessory",
        tier: 3,
        materials: {
            "Kristal Murni": 3,
            "Serat Aether": 2,
            "Benih Cahaya": 1
        },
        gold: 3000,
        level: 20,
        stats: { luck: 15 },
        description: "Increases luck and rare item chance"
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