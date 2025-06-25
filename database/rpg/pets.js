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

const pets = [
    // === TIER 1 PETS (Common) ===
    {
        id: "wolf_pup",
        nama: "Wolf Pup",
        tier: 1,
        rarity: "Common",
        emoji: "🐺",
        baseStats: {
            hp: 50,
            attack: 8,
            defense: 3,
            speed: 12
        },
        skills: [
            {
                nama: "Bite",
                damage: 15,
                cooldown: 3,
                description: "Basic attack skill"
            }
        ],
        evolution: {
            next: "wolf_alpha",
            requirement: { level: 20, item: "Pet Evolution Stone" }
        },
        description: "A young wolf with potential to become a fierce companion"
    },
    {
        id: "cat_kitten",
        nama: "Cat Kitten",
        tier: 1,
        rarity: "Common",
        emoji: "🐱",
        baseStats: {
            hp: 40,
            attack: 6,
            defense: 2,
            speed: 15
        },
        skills: [
            {
                nama: "Scratch",
                damage: 12,
                cooldown: 2,
                description: "Quick scratch attack"
            }
        ],
        evolution: {
            next: "cat_shadow",
            requirement: { level: 20, item: "Pet Evolution Stone" }
        },
        description: "A playful kitten that can become a stealthy hunter"
    },
    {
        id: "bird_chick",
        nama: "Bird Chick",
        tier: 1,
        rarity: "Common",
        emoji: "🐤",
        baseStats: {
            hp: 35,
            attack: 5,
            defense: 1,
            speed: 18
        },
        skills: [
            {
                nama: "Peck",
                damage: 10,
                cooldown: 1,
                description: "Fast peck attack"
            }
        ],
        evolution: {
            next: "bird_eagle",
            requirement: { level: 20, item: "Pet Evolution Stone" }
        },
        description: "A small bird that will grow into a majestic eagle"
    },

    // === TIER 2 PETS (Uncommon) ===
    {
        id: "wolf_alpha",
        nama: "Alpha Wolf",
        tier: 2,
        rarity: "Uncommon",
        emoji: "🐺",
        baseStats: {
            hp: 80,
            attack: 15,
            defense: 8,
            speed: 18
        },
        skills: [
            {
                nama: "Alpha Bite",
                damage: 25,
                cooldown: 4,
                description: "Powerful bite attack"
            },
            {
                nama: "Pack Leader",
                damage: 0,
                cooldown: 8,
                description: "Buffs owner's attack by 10%"
            }
        ],
        evolution: {
            next: "wolf_legendary",
            requirement: { level: 40, item: "Pet Evolution Stone", gold: 10000 }
        },
        description: "A fierce alpha wolf with leadership abilities"
    },
    {
        id: "cat_shadow",
        nama: "Shadow Cat",
        tier: 2,
        rarity: "Uncommon",
        emoji: "🐈‍⬛",
        baseStats: {
            hp: 65,
            attack: 12,
            defense: 5,
            speed: 22
        },
        skills: [
            {
                nama: "Shadow Strike",
                damage: 20,
                cooldown: 3,
                description: "Stealth attack with bonus damage"
            },
            {
                nama: "Stealth",
                damage: 0,
                cooldown: 6,
                description: "Increases critical chance by 15%"
            }
        ],
        evolution: {
            next: "cat_phantom",
            requirement: { level: 40, item: "Pet Evolution Stone", gold: 10000 }
        },
        description: "A stealthy cat that moves like a shadow"
    },
    {
        id: "bird_eagle",
        nama: "Golden Eagle",
        tier: 2,
        rarity: "Uncommon",
        emoji: "🦅",
        baseStats: {
            hp: 70,
            attack: 14,
            defense: 4,
            speed: 25
        },
        skills: [
            {
                nama: "Dive Attack",
                damage: 30,
                cooldown: 5,
                description: "High-speed dive attack"
            },
            {
                nama: "Eagle Eye",
                damage: 0,
                cooldown: 7,
                description: "Increases accuracy and critical chance"
            }
        ],
        evolution: {
            next: "bird_thunder",
            requirement: { level: 40, item: "Pet Evolution Stone", gold: 10000 }
        },
        description: "A majestic eagle with keen eyesight"
    },

    // === TIER 3 PETS (Rare) ===
    {
        id: "wolf_legendary",
        nama: "Legendary Wolf",
        tier: 3,
        rarity: "Rare",
        emoji: "🐺",
        baseStats: {
            hp: 120,
            attack: 25,
            defense: 15,
            speed: 20
        },
        skills: [
            {
                nama: "Legendary Bite",
                damage: 40,
                cooldown: 4,
                description: "Devastating bite attack"
            },
            {
                nama: "Pack Master",
                damage: 0,
                cooldown: 10,
                description: "Buffs owner's attack by 20% and defense by 10%"
            },
            {
                nama: "Howl of Courage",
                damage: 0,
                cooldown: 12,
                description: "Removes debuffs and heals owner"
            }
        ],
        evolution: {
            next: null,
            requirement: null
        },
        description: "A legendary wolf with unmatched power and leadership"
    },
    {
        id: "cat_phantom",
        nama: "Phantom Cat",
        tier: 3,
        rarity: "Rare",
        emoji: "👻🐱",
        baseStats: {
            hp: 100,
            attack: 20,
            defense: 8,
            speed: 28
        },
        skills: [
            {
                nama: "Phantom Strike",
                damage: 35,
                cooldown: 3,
                description: "Ghostly attack that bypasses defense"
            },
            {
                nama: "Shadow Walk",
                damage: 0,
                cooldown: 8,
                description: "Become invisible and gain 50% dodge chance"
            },
            {
                nama: "Soul Drain",
                damage: 25,
                cooldown: 10,
                description: "Attack that heals the cat"
            }
        ],
        evolution: {
            next: null,
            requirement: null
        },
        description: "A phantom cat that exists between worlds"
    },
    {
        id: "bird_thunder",
        nama: "Thunder Eagle",
        tier: 3,
        rarity: "Rare",
        emoji: "⚡🦅",
        baseStats: {
            hp: 110,
            attack: 22,
            defense: 10,
            speed: 30
        },
        skills: [
            {
                nama: "Thunder Dive",
                damage: 45,
                cooldown: 5,
                description: "Lightning-fast dive with thunder damage"
            },
            {
                nama: "Storm Call",
                damage: 0,
                cooldown: 12,
                description: "Summons lightning to strike enemies"
            },
            {
                nama: "Wind Rider",
                damage: 0,
                cooldown: 8,
                description: "Increases speed and dodge chance"
            }
        ],
        evolution: {
            next: null,
            requirement: null
        },
        description: "A thunder eagle that commands the skies"
    },

    // === SPECIAL PETS (Epic/Legendary) ===
    {
        id: "dragon_wyrmling",
        nama: "Dragon Wyrmling",
        tier: 4,
        rarity: "Epic",
        emoji: "🐉",
        baseStats: {
            hp: 150,
            attack: 30,
            defense: 20,
            speed: 15
        },
        skills: [
            {
                nama: "Dragon Breath",
                damage: 50,
                cooldown: 6,
                description: "Fiery breath attack"
            },
            {
                nama: "Dragon Scales",
                damage: 0,
                cooldown: 10,
                description: "Temporary invincibility"
            },
            {
                nama: "Wing Buffet",
                damage: 35,
                cooldown: 4,
                description: "Knocks back enemies"
            }
        ],
        evolution: {
            next: "dragon_adult",
            requirement: { level: 60, item: "Pet Evolution Stone", gold: 50000 }
        },
        description: "A young dragon with immense potential"
    },
    {
        id: "phoenix_chick",
        nama: "Phoenix Chick",
        tier: 4,
        rarity: "Epic",
        emoji: "🔥🐤",
        baseStats: {
            hp: 120,
            attack: 25,
            defense: 12,
            speed: 20
        },
        skills: [
            {
                nama: "Phoenix Fire",
                damage: 40,
                cooldown: 5,
                description: "Sacred fire attack"
            },
            {
                nama: "Rebirth",
                damage: 0,
                cooldown: 15,
                description: "Revives with full HP when defeated"
            },
            {
                nama: "Healing Flame",
                damage: 0,
                cooldown: 8,
                description: "Heals owner and removes debuffs"
            }
        ],
        evolution: {
            next: "phoenix_immortal",
            requirement: { level: 60, item: "Pet Evolution Stone", gold: 50000 }
        },
        description: "A sacred phoenix chick with healing powers"
    }
];

module.exports = pets; 