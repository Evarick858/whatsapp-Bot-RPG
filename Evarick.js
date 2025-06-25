// Import Module
require('./len')
require('./database/Menu/EvarickMenu')
const fs = require('fs');
const axios = require('axios');

// Import Scrape
const Ai4Chat = require('./scrape/Ai4Chat');
const tiktok2 = require('./scrape/Tiktok');

// Import RPG Data
const locations = require('./database/rpg/locations.js');
const items = require('./database/rpg/items.js');
const enemies = require('./database/rpg/enemies.js');
const logFilePath = ('./database/rpg/logs.json');

// Helper function untuk normalisasi ID
function normalizeId(id) {
    if (!id) return '';
    return id.toString().toLowerCase().trim();
}

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

// Player Data Management
const playerDataFile = './database/rpg/players.json';

// Anti-Cheat System
const rateLimits = new Map();
const suspiciousActivities = new Map();
const adminCommands = new Set();

// Rate limiting configuration
const RATE_LIMITS = {
    hunt: { max: 10, window: 60000 }, // 10 hunts per minute
    nambang: { max: 15, window: 60000 }, // 15 mining per minute
    nebang: { max: 15, window: 60000 }, // 15 woodcutting per minute
    mancing: { max: 15, window: 60000 }, // 15 fishing per minute
    heal: { max: 5, window: 300000 }, // 5 heals per 5 minutes
    travel: { max: 20, window: 60000 }, // 20 travels per minute
    buy: { max: 10, window: 60000 }, // 10 buys per minute
    sell: { max: 10, window: 60000 }, // 10 sells per minute
    equip: { max: 20, window: 60000 }, // 20 equips per minute
    unequip: { max: 20, window: 60000 }, // 20 unequips per minute
    friend: { max: 10, window: 60000 }, // 10 friend actions per minute
    gift: { max: 5, window: 300000 }, // 5 gifts per 5 minutes
    stats: { max: 30, window: 60000 }, // 30 stats checks per minute
    profile: { max: 30, window: 60000 }, // 30 profile checks per minute
    status: { max: 30, window: 60000 }, // 30 status checks per minute
    general: { max: 50, window: 60000 } // 50 general messages per minute
};

function checkRateLimit(participant, command) {
    const limit = RATE_LIMITS[command];
    if (!limit) return true; // No limit for this command
    
    const now = Date.now();
    const key = `${participant}_${command}`;
    
    if (!rateLimits.has(key)) {
        rateLimits.set(key, []);
    }
    
    const userLimits = rateLimits.get(key);
    
    // Remove old entries
    const validEntries = userLimits.filter(time => now - time < limit.window);
    rateLimits.set(key, validEntries);
    
    if (validEntries.length >= limit.max) {
        return false; // Rate limit exceeded
    }
    
    validEntries.push(now);
    return true;
}

function detectSuspiciousActivity(participant, command, data) {
    const now = Date.now();
    const key = `${participant}_suspicious`;
    
    if (!suspiciousActivities.has(key)) {
        suspiciousActivities.set(key, []);
    }
    
    const activities = suspiciousActivities.get(key);
    
    // Check for suspicious patterns
    let suspicious = false;
    let reason = '';
    
    // Pattern 1: Too many actions in short time
    const recentActions = activities.filter(act => now - act.timestamp < 60000);
    if (recentActions.length > 50) {
        suspicious = true;
        reason = 'Too many actions in 1 minute';
    }
    
    // Pattern 2: Impossible gold gains
    if (command === 'sell' && data && data.goldGain > 1000000) {
        suspicious = true;
        reason = 'Suspicious gold gain from selling';
    }
    
    // Pattern 3: Impossible level gains
    if (command === 'hunt' && data && data.levelGain > 10) {
        suspicious = true;
        reason = 'Suspicious level gain from hunting';
    }
    
    // Pattern 4: Command spam
    const commandSpam = recentActions.filter(act => act.command === command).length;
    if (commandSpam > 20) {
        suspicious = true;
        reason = 'Command spam detected';
    }
    
    // Record activity
    activities.push({
        timestamp: now,
        command: command,
        data: data,
        suspicious: suspicious,
        reason: reason
    });
    
    // Keep only last 100 activities
    if (activities.length > 100) {
        activities.splice(0, activities.length - 100);
    }
    
    return { suspicious, reason };
}

function logSuspiciousActivity(participant, command, reason, data) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        participant: participant,
        command: command,
        reason: reason,
        data: data,
        playerData: players[participant] ? {
            nama: players[participant].nama,
            level: players[participant].level,
            gold: players[participant].gold
        } : null
    };
    
    console.log('🚨 SUSPICIOUS ACTIVITY DETECTED:', logEntry);
    
    // Save to log file
    try {
        const logPath = './database/suspicious_activity.json';
        let logs = [];
        if (fs.existsSync(logPath)) {
            logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
        }
        logs.push(logEntry);
        
        // Keep only last 1000 entries
        if (logs.length > 1000) {
            logs = logs.slice(-1000);
        }
        
        fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
    } catch (error) {
        console.error('Failed to log suspicious activity:', error);
    }
}

// Admin moderation commands
function isAdmin(participant) {
    // Bot admins only - NOT group admins
    const adminIds = [
        '6282239902921@s.whatsapp.net' // Admin bot utama
    ];
    return adminIds.includes(participant);
}

// Enhanced command processing with anti-cheat
function processCommandWithAntiCheat(participant, command, data) {
    // Check rate limit
    if (!checkRateLimit(participant, command)) {
        return {
            success: false,
            message: `⚠️ *Rate limit exceeded!*\n\nKamu terlalu sering menggunakan command ini. Tunggu sebentar.`,
            blocked: true
        };
    }
    
    // Detect suspicious activity
    const suspicious = detectSuspiciousActivity(participant, command, data);
    if (suspicious.suspicious) {
        logSuspiciousActivity(participant, command, suspicious.reason, data);
        
        // For severe cases, temporarily block the user
        if (suspicious.reason.includes('spam') || suspicious.reason.includes('impossible')) {
            return {
                success: false,
                message: `🚫 *Aktivitas mencurigakan terdeteksi!*\n\nAlasan: ${suspicious.reason}\n\nHubungi admin jika ini adalah kesalahan.`,
                blocked: true
            };
        }
    }
    
    return { success: true, blocked: false };
}

// Title System
const titles = {
    // Combat Titles (Level-based)
    combat: {
        "Pemula": { requirement: "Level 1", condition: (player) => player.level >= 1 },
        "Petarung": { requirement: "Level 10", condition: (player) => player.level >= 10 },
        "Ksatria": { requirement: "Level 25", condition: (player) => player.level >= 25 },
        "Pembunuh": { requirement: "Level 50", condition: (player) => player.level >= 50 },
        "Legenda": { requirement: "Level 100", condition: (player) => player.level >= 100 },
        "Mitos": { requirement: "Level 200", condition: (player) => player.level >= 200 },
        "Dewa": { requirement: "Level 500", condition: (player) => player.level >= 500 }
    },
    
    // Gold Titles (Wealth-based)
    wealth: {
        "Miskin": { requirement: "0 Gold", condition: (player) => player.gold >= 0 },
        "Petani": { requirement: "10.000 Gold", condition: (player) => player.gold >= 10000 },
        "Pedagang": { requirement: "100.000 Gold", condition: (player) => player.gold >= 100000 },
        "Konglomerat": { requirement: "1.000.000 Gold", condition: (player) => player.gold >= 1000000 },
        "Raja Emas": { requirement: "10.000.000 Gold", condition: (player) => player.gold >= 10000000 },
        "Tuhan Kekayaan": { requirement: "100.000.000 Gold", condition: (player) => player.gold >= 100000000 }
    },
    
    // Hunting Titles (Monster kills)
    hunting: {
        "Pemburu": { requirement: "100 Monster", condition: (player) => (player.monsterKills || 0) >= 100 },
        "Pemburu Elite": { requirement: "1.000 Monster", condition: (player) => (player.monsterKills || 0) >= 1000 },
        "Pemburu Legendaris": { requirement: "10.000 Monster", condition: (player) => (player.monsterKills || 0) >= 10000 },
        "Pembasmi Monster": { requirement: "100.000 Monster", condition: (player) => (player.monsterKills || 0) >= 100000 }
    },
    
    // Mining Titles
    mining: {
        "Penambang": { requirement: "1.000 Mining", condition: (player) => (player.miningCount || 0) >= 1000 },
        "Penambang Ahli": { requirement: "10.000 Mining", condition: (player) => (player.miningCount || 0) >= 10000 },
        "Raja Tambang": { requirement: "100.000 Mining", condition: (player) => (player.miningCount || 0) >= 100000 }
    },
    
    // Woodcutting Titles
    woodcutting: {
        "Penebang": { requirement: "1.000 Woodcutting", condition: (player) => (player.woodcuttingCount || 0) >= 1000 },
        "Penebang Ahli": { requirement: "10.000 Woodcutting", condition: (player) => (player.woodcuttingCount || 0) >= 10000 },
        "Raja Hutan": { requirement: "100.000 Woodcutting", condition: (player) => (player.woodcuttingCount || 0) >= 100000 }
    },
    
    // Fishing Titles
    fishing: {
        "Pemancing": { requirement: "1.000 Fishing", condition: (player) => (player.fishingCount || 0) >= 1000 },
        "Pemancing Ahli": { requirement: "10.000 Fishing", condition: (player) => (player.fishingCount || 0) >= 10000 },
        "Raja Laut": { requirement: "100.000 Fishing", condition: (player) => (player.fishingCount || 0) >= 100000 }
    },
    
    // Class Mastery Titles
    classMastery: {
        "Fighter Master": { requirement: "Level 50 Fighter", condition: (player) => player.kelas === 'Fighter' && player.level >= 50 },
        "Assassin Master": { requirement: "Level 50 Assassin", condition: (player) => player.kelas === 'Assassin' && player.level >= 50 },
        "Mage Master": { requirement: "Level 50 Mage", condition: (player) => player.kelas === 'Mage' && player.level >= 50 },
        "Tank Master": { requirement: "Level 50 Tank", condition: (player) => player.kelas === 'Tank' && player.level >= 50 },
        "Archer Master": { requirement: "Level 50 Archer", condition: (player) => player.kelas === 'Archer' && player.level >= 50 }
    },
    
    // Equipment Titles
    equipment: {
        "Pemula": { requirement: "1 Equipment", condition: (player) => {
            const equippedItems = Object.values(player.equipment || {}).filter(item => item !== null && item !== undefined);
            return equippedItems.length >= 1;
        }},
        "Terlengkapi": { requirement: "5 Equipment", condition: (player) => {
            const equippedItems = Object.values(player.equipment || {}).filter(item => item !== null && item !== undefined);
            return equippedItems.length >= 5;
        }},
        "Prajurit": { requirement: "10 Equipment", condition: (player) => {
            const equippedItems = Object.values(player.equipment || {}).filter(item => item !== null && item !== undefined);
            return equippedItems.length >= 10;
        }},
        "Ksatria Lengkap": { requirement: "15 Equipment", condition: (player) => {
            const equippedItems = Object.values(player.equipment || {}).filter(item => item !== null && item !== undefined);
            return equippedItems.length >= 15;
        }}
    },
    
    // Special Achievement Titles
    special: {
        "Pemain Setia": { requirement: "7 Hari Berturut-turut", condition: (player) => (player.consecutiveDays || 0) >= 7 },
        "Pemain Veteran": { requirement: "30 Hari Berturut-turut", condition: (player) => (player.consecutiveDays || 0) >= 30 },
        "Pemain Legendaris": { requirement: "100 Hari Berturut-turut", condition: (player) => (player.consecutiveDays || 0) >= 100 },
        "Penjelajah": { requirement: "Kunjungi 5 Lokasi", condition: (player) => {
            const visitedLocations = player.visitedLocations || [];
            return visitedLocations.length >= 5;
        }},
        "Penjelajah Dunia": { requirement: "Kunjungi Semua Lokasi", condition: (player) => {
            const visitedLocations = player.visitedLocations || [];
            return visitedLocations.length >= 10;
        }},
        "GOD KILLER": { requirement: "???", condition: (player) => false }, // Impossible requirement - only via secret command
        "Bot Administrator": { requirement: "Admin Bot", condition: (player) => false } // Will be set manually via admin command
    }
};

// Daily Login Rewards System
const dailyRewards = {
    day1: { gold: 100, exp: 20, items: ['Potion HP'], title: null },
    day2: { gold: 150, exp: 30, items: ['Potion Mana'], title: null },
    day3: { gold: 200, exp: 40, items: ['Pedang Kayu'], title: null },
    day4: { gold: 250, exp: 50, items: ['Helem Kulit'], title: null },
    day5: { gold: 300, exp: 60, items: ['Zirah Kulit'], title: null },
    day6: { gold: 350, exp: 70, items: ['Pedang Besi'], title: null },
    day7: { gold: 500, exp: 100, items: ['Pedang Baja', 'Title: Pemain Setia'], title: 'Pemain Setia' },
    day14: { gold: 1000, exp: 200, items: ['Helem Besi', 'Zirah Besi'], title: null },
    day21: { gold: 2000, exp: 300, items: ['Pedang Kristal'], title: null },
    day30: { gold: 5000, exp: 500, items: ['Pedang Legendaris', 'Title: Pemain Veteran'], title: 'Pemain Veteran' }
};

// Weekly Challenges System
const weeklyChallenges = [
    {
        id: 'monster_hunter',
        name: "Monster Hunter",
        description: "Kill 100 monsters this week",
        target: 100,
        type: 'monsterKills',
        reward: { gold: 500, exp: 80, items: ['Potion HP', 'Potion Mana'] },
        difficulty: 'easy'
    },
    {
        id: 'mining_master',
        name: "Mining Master",
        description: "Mine 500 times this week",
        target: 500,
        type: 'miningCount',
        reward: { gold: 400, exp: 60, items: ['Kapak Besi'] },
        difficulty: 'medium'
    },
    {
        id: 'fishing_expert',
        name: "Fishing Expert",
        description: "Fish 300 times this week",
        target: 300,
        type: 'fishingCount',
        reward: { gold: 450, exp: 70, items: ['Pancingan'] },
        difficulty: 'medium'
    },
    {
        id: 'woodcutter',
        name: "Woodcutter",
        description: "Cut wood 400 times this week",
        target: 400,
        type: 'woodcuttingCount',
        reward: { gold: 420, exp: 65, items: ['Kapak Kayu'] },
        difficulty: 'medium'
    },
    {
        id: 'wealth_collector',
        name: "Wealth Collector",
        description: "Earn 50,000 gold this week",
        target: 50000,
        type: 'goldEarned',
        reward: { gold: 1000, exp: 120, items: ['Cincin Emas'] },
        difficulty: 'hard'
    },
    {
        id: 'equipment_collector',
        name: "Equipment Collector",
        description: "Collect 10 different equipment pieces",
        target: 10,
        type: 'equipmentCount',
        reward: { gold: 800, exp: 100, items: ['Title: Kolektor'], title: 'Kolektor' },
        difficulty: 'hard'
    }
];

// Achievement System
const achievements = {
    // Combat Achievements
    combat: {
        "First Blood": {
            id: 'first_blood',
            description: "Kill your first monster",
            condition: (player) => (player.monsterKills || 0) >= 1,
            reward: { gold: 100, exp: 10, items: ['Potion HP'] },
            category: 'combat'
        },
        "Monster Slayer": {
            id: 'monster_slayer',
            description: "Kill 1000 monsters",
            condition: (player) => (player.monsterKills || 0) >= 1000,
            reward: { gold: 10000, exp: 500, items: ['Pedang Besi'] },
            category: 'combat'
        },
        "Monster Hunter": {
            id: 'monster_hunter',
            description: "Kill 10000 monsters",
            condition: (player) => (player.monsterKills || 0) >= 10000,
            reward: { gold: 50000, exp: 2000, items: ['Pedang Baja'] },
            category: 'combat'
        },
        "Monster Exterminator": {
            id: 'monster_exterminator',
            description: "Kill 100000 monsters",
            condition: (player) => (player.monsterKills || 0) >= 100000,
            reward: { gold: 200000, exp: 10000, items: ['Pedang Kristal', 'Title: Pembasmi Monster'], title: 'Pembasmi Monster' },
            category: 'combat'
        }
    },
    
    // Economy Achievements
    economy: {
        "First Gold": {
            id: 'first_gold',
            description: "Earn your first 1000 gold",
            condition: (player) => (player.gold || 0) >= 1000,
            reward: { gold: 500, exp: 25, items: [] },
            category: 'economy'
        },
        "Millionaire": {
            id: 'millionaire',
            description: "Reach 1,000,000 gold",
            condition: (player) => (player.gold || 0) >= 1000000,
            reward: { gold: 50000, exp: 1000, items: ['Title: Millionaire'], title: 'Millionaire' },
            category: 'economy'
        },
        "Billionaire": {
            id: 'billionaire',
            description: "Reach 1,000,000,000 gold",
            condition: (player) => (player.gold || 0) >= 1000000000,
            reward: { gold: 1000000, exp: 5000, items: ['Title: Billionaire'], title: 'Billionaire' },
            category: 'economy'
        }
    },
    
    // Activity Achievements
    activity: {
        "Mining Beginner": {
            id: 'mining_beginner',
            description: "Mine 100 times",
            condition: (player) => (player.miningCount || 0) >= 100,
            reward: { gold: 500, exp: 25, items: ['Kapak Kayu'] },
            category: 'activity'
        },
        "Mining Expert": {
            id: 'mining_expert',
            description: "Mine 10000 times",
            condition: (player) => (player.miningCount || 0) >= 10000,
            reward: { gold: 5000, exp: 250, items: ['Kapak Besi'] },
            category: 'activity'
        },
        "Fishing Beginner": {
            id: 'fishing_beginner',
            description: "Fish 100 times",
            condition: (player) => (player.fishingCount || 0) >= 100,
            reward: { gold: 500, exp: 25, items: ['Pancingan'] },
            category: 'activity'
        },
        "Fishing Expert": {
            id: 'fishing_expert',
            description: "Fish 10000 times",
            condition: (player) => (player.fishingCount || 0) >= 10000,
            reward: { gold: 5000, exp: 250, items: ['Pancingan'] },
            category: 'activity'
        },
        "Woodcutter": {
            id: 'woodcutter',
            description: "Cut wood 1000 times",
            condition: (player) => (player.woodcuttingCount || 0) >= 1000,
            reward: { gold: 1000, exp: 50, items: ['Kapak Kayu'] },
            category: 'activity'
        }
    },
    
    // Social Achievements
    social: {
        "Friend Maker": {
            id: 'friend_maker',
            description: "Make 5 friends",
            condition: (player) => (player.friends || []).length >= 5,
            reward: { gold: 1000, exp: 50, items: ['Title: Friend Maker'], title: 'Friend Maker' },
            category: 'social'
        },
        "Social Butterfly": {
            id: 'social_butterfly',
            description: "Make 20 friends",
            condition: (player) => (player.friends || []).length >= 20,
            reward: { gold: 5000, exp: 250, items: ['Title: Social Butterfly'], title: 'Social Butterfly' },
            category: 'social'
        }
    },
    
    // Exploration Achievements
    exploration: {
        "Explorer": {
            id: 'explorer',
            description: "Visit 5 different locations",
            condition: (player) => (player.visitedLocations || []).length >= 5,
            reward: { gold: 2000, exp: 100, items: ['Title: Penjelajah'], title: 'Penjelajah' },
            category: 'exploration'
        },
        "World Traveler": {
            id: 'world_traveler',
            description: "Visit all locations",
            condition: (player) => (player.visitedLocations || []).length >= 10,
            reward: { gold: 10000, exp: 500, items: ['Title: Penjelajah Dunia'], title: 'Penjelajah Dunia' },
            category: 'exploration'
        }
    }
};

// Quest System
const quests = {
    // Daily Quests
    daily: [
        {
            id: 'daily_hunt',
            name: "Daily Hunt",
            description: "Kill 10 monsters today",
            target: 10,
            type: 'monsterKills',
            reward: { gold: 500, exp: 25, items: ['Potion HP'] },
            category: 'daily'
        },
        {
            id: 'daily_mine',
            name: "Daily Mining",
            description: "Mine 50 times today",
            target: 50,
            type: 'miningCount',
            reward: { gold: 300, exp: 15, items: ['Batu'] },
            category: 'daily'
        },
        {
            id: 'daily_fish',
            name: "Daily Fishing",
            description: "Fish 30 times today",
            target: 30,
            type: 'fishingCount',
            reward: { gold: 400, exp: 20, items: ['Ikan'] },
            category: 'daily'
        },
        {
            id: 'daily_woodcut',
            name: "Daily Woodcutting",
            description: "Cut wood 40 times today",
            target: 40,
            type: 'woodcuttingCount',
            reward: { gold: 350, exp: 18, items: ['Kayu'] },
            category: 'daily'
        }
    ],
    
    // Weekly Quests
    weekly: [
        {
            id: 'weekly_hunt',
            name: "Weekly Hunt",
            description: "Kill 100 monsters this week",
            target: 100,
            type: 'monsterKills',
            reward: { gold: 2000, exp: 100, items: ['Pedang Besi'] },
            category: 'weekly'
        },
        {
            id: 'weekly_mine',
            name: "Weekly Mining",
            description: "Mine 500 times this week",
            target: 500,
            type: 'miningCount',
            reward: { gold: 1500, exp: 75, items: ['Kapak Besi'] },
            category: 'weekly'
        },
        {
            id: 'weekly_fish',
            name: "Weekly Fishing",
            description: "Fish 300 times this week",
            target: 300,
            type: 'fishingCount',
            reward: { gold: 1800, exp: 90, items: ['Pancingan'] },
            category: 'weekly'
        },
        {
            id: 'weekly_wealth',
            name: "Weekly Wealth",
            description: "Earn 50,000 gold this week",
            target: 50000,
            type: 'goldEarned',
            reward: { gold: 5000, exp: 250, items: ['Cincin Emas'] },
            category: 'weekly'
        }
    ],
    
    // Story Quests
    story: [
        {
            id: 'story_beginning',
            name: "The Beginning",
            description: "Complete your first hunt and reach level 5",
            requirements: [
                { type: 'monsterKills', target: 1 },
                { type: 'level', target: 5 }
            ],
            reward: { gold: 1000, exp: 100, items: ['Pedang Kayu', 'Title: Pemula'], title: 'Pemula' },
            category: 'story',
            nextQuest: 'story_challenge'
        },
        {
            id: 'story_challenge',
            name: "The Challenge",
            description: "Kill 50 monsters and reach level 20",
            requirements: [
                { type: 'monsterKills', target: 50 },
                { type: 'level', target: 20 }
            ],
            reward: { gold: 5000, exp: 500, items: ['Pedang Besi', 'Title: Petarung'], title: 'Petarung' },
            category: 'story',
            nextQuest: 'story_legend'
        },
        {
            id: 'story_legend',
            name: "The Legend",
            description: "Kill 500 monsters and reach level 100",
            requirements: [
                { type: 'monsterKills', target: 500 },
                { type: 'level', target: 100 }
            ],
            reward: { gold: 50000, exp: 2000, items: ['Pedang Baja', 'Title: Legenda'], title: 'Legenda' },
            category: 'story'
        }
    ]
};

// Helper functions for Daily/Weekly Rewards and Achievements
function checkDailyReward(player) {
    if (!player.dailyRewards) {
        player.dailyRewards = {
            lastClaim: null,
            currentStreak: 0,
            totalDays: 0
        };
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const lastClaim = player.dailyRewards.lastClaim ? new Date(player.dailyRewards.lastClaim).getTime() : 0;
    
    // Check if already claimed today
    if (lastClaim === today) {
        return { canClaim: false, message: "Kamu sudah mengklaim daily reward hari ini!" };
    }
    
    // Check if consecutive day
    const yesterday = today - (24 * 60 * 60 * 1000);
    let newStreak = 1;
    
    if (lastClaim === yesterday) {
        newStreak = player.dailyRewards.currentStreak + 1;
    }
    
    // Get reward for current streak
    const rewardKey = `day${newStreak}`;
    const reward = dailyRewards[rewardKey] || dailyRewards.day7; // Default to day7 reward
    
    return {
        canClaim: true,
        streak: newStreak,
        reward: reward,
        message: `Daily reward tersedia! Streak: ${newStreak} hari`
    };
}

function claimDailyReward(player) {
    const check = checkDailyReward(player);
    if (!check.canClaim) {
        return { success: false, message: check.message };
    }
    
    // Initialize if not exists
    if (!player.dailyRewards) {
        player.dailyRewards = {
            lastClaim: null,
            currentStreak: 0,
            totalDays: 0
        };
    }
    
    // Update player data
    const now = new Date();
    player.dailyRewards.lastClaim = now.toISOString();
    player.dailyRewards.currentStreak = check.streak;
    player.dailyRewards.totalDays += 1;
    
    // Give rewards
    const reward = check.reward;
    player.gold += reward.gold;
    
    // Add items to inventory
    reward.items.forEach(item => {
        if (item.startsWith('Title: ')) {
            const titleName = item.replace('Title: ', '');
            if (!player.titles) player.titles = [];
            if (!player.titles.includes(titleName)) {
                player.titles.push(titleName);
            }
        } else {
            player.tas[item] = (player.tas[item] || 0) + 1;
        }
    });
    
    return {
        success: true,
        streak: check.streak,
        reward: reward,
        message: `🎉 Daily reward diklaim! Streak: ${check.streak} hari`
    };
}

function checkWeeklyChallenges(player) {
    if (!player.weeklyChallenges) {
        player.weeklyChallenges = {
            currentWeek: getCurrentWeek(),
            progress: {},
            completed: {},
            claimed: {}
        };
    }
    
    const currentWeek = getCurrentWeek();
    if (player.weeklyChallenges.currentWeek !== currentWeek) {
        // Reset for new week
        player.weeklyChallenges = {
            currentWeek: currentWeek,
            progress: {},
            completed: {},
            claimed: {}
        };
    }
    
    const availableChallenges = [];
    const completedChallenges = [];
    
    weeklyChallenges.forEach(challenge => {
        const progress = player.weeklyChallenges.progress[challenge.id] || 0;
        const isCompleted = progress >= challenge.target;
        const isClaimed = player.weeklyChallenges.claimed[challenge.id] || false;
        
        if (isCompleted && !isClaimed) {
            completedChallenges.push({ ...challenge, progress });
        } else if (!isCompleted) {
            availableChallenges.push({ ...challenge, progress });
        }
    });
    
    return { availableChallenges, completedChallenges };
}

function getCurrentWeek() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

function checkAchievements(player) {
    if (!player.achievements) {
        player.achievements = {
            unlocked: [],
            progress: {}
        };
    }
    
    const newAchievements = [];
    
    // Check all achievement categories
    Object.keys(achievements).forEach(category => {
        Object.keys(achievements[category]).forEach(achievementId => {
            const achievement = achievements[category][achievementId];
            
            if (!player.achievements.unlocked.includes(achievementId)) {
                if (achievement.condition(player)) {
                    newAchievements.push(achievement);
                    player.achievements.unlocked.push(achievementId);
                }
            }
        });
    });
    
    return newAchievements;
}

function checkQuests(player) {
    if (!player.quests) {
        player.quests = {
            daily: { progress: {}, completed: {}, lastReset: null },
            weekly: { progress: {}, completed: {}, lastReset: null },
            story: { progress: {}, completed: {}, current: 'story_beginning' }
        };
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const currentWeek = getCurrentWeek();
    
    // Reset daily quests if needed
    if (player.quests.daily.lastReset !== today) {
        player.quests.daily = { progress: {}, completed: {}, lastReset: today };
    }
    
    // Reset weekly quests if needed
    if (player.quests.weekly.lastReset !== currentWeek) {
        player.quests.weekly = { progress: {}, completed: {}, lastReset: currentWeek };
    }
    
    const availableQuests = {
        daily: quests.daily.filter(quest => !player.quests.daily.completed[quest.id]),
        weekly: quests.weekly.filter(quest => !player.quests.weekly.completed[quest.id]),
        story: quests.story.filter(quest => !player.quests.story.completed[quest.id])
    };
    
    return availableQuests;
}

// Function to update quest progress
function updateQuestProgress(player, activityType, amount = 1) {
    if (!player.quests) {
        player.quests = {
            daily: { progress: {}, completed: {}, lastReset: null },
            weekly: { progress: {}, completed: {}, lastReset: null },
            story: { progress: {}, completed: {}, current: 'story_beginning' }
        };
    }
    
    // Update daily quests
    quests.daily.forEach(quest => {
        if (quest.type === activityType && !player.quests.daily.completed[quest.id]) {
            player.quests.daily.progress[quest.id] = (player.quests.daily.progress[quest.id] || 0) + amount;
            
            if (player.quests.daily.progress[quest.id] >= quest.target) {
                player.quests.daily.completed[quest.id] = true;
            }
        }
    });
    
    // Update weekly quests
    quests.weekly.forEach(quest => {
        if (quest.type === activityType && !player.quests.weekly.completed[quest.id]) {
            player.quests.weekly.progress[quest.id] = (player.quests.weekly.progress[quest.id] || 0) + amount;
            
            if (player.quests.weekly.progress[quest.id] >= quest.target) {
                player.quests.weekly.completed[quest.id] = true;
            }
        }
    });
    
    // Update story quests
    quests.story.forEach(quest => {
        if (!player.quests.story.completed[quest.id]) {
            let allRequirementsMet = true;
            
            quest.requirements.forEach(req => {
                if (req.type === activityType) {
                    player.quests.story.progress[quest.id] = player.quests.story.progress[quest.id] || {};
                    player.quests.story.progress[quest.id][req.type] = (player.quests.story.progress[quest.id][req.type] || 0) + amount;
                    
                    if (player.quests.story.progress[quest.id][req.type] < req.target) {
                        allRequirementsMet = false;
                    }
                } else if (req.type === 'level') {
                    if (player.level < req.target) {
                        allRequirementsMet = false;
                    }
                }
            });
            
            if (allRequirementsMet) {
                player.quests.story.completed[quest.id] = true;
            }
        }
    });
}

// Function to update weekly challenge progress
function updateWeeklyChallengeProgress(player, activityType, amount = 1) {
    if (!player.weeklyChallenges) {
        player.weeklyChallenges = {
            currentWeek: getCurrentWeek(),
            progress: {},
            completed: {},
            claimed: {}
        };
    }
    
    // Reset if new week
    const currentWeek = getCurrentWeek();
    if (player.weeklyChallenges.currentWeek !== currentWeek) {
        player.weeklyChallenges = {
            currentWeek: currentWeek,
            progress: {},
            completed: {},
            claimed: {}
        };
    }
    
    // Update progress for matching challenges
    weeklyChallenges.forEach(challenge => {
        if (challenge.type === activityType && !player.weeklyChallenges.completed[challenge.id]) {
            player.weeklyChallenges.progress[challenge.id] = (player.weeklyChallenges.progress[challenge.id] || 0) + amount;
            
            if (player.weeklyChallenges.progress[challenge.id] >= challenge.target) {
                player.weeklyChallenges.completed[challenge.id] = true;
            }
        }
    });
}

// Function to update all progress (quests, challenges, achievements)
function updateAllProgress(player, activityType, amount = 1) {
    // Update quest progress
    updateQuestProgress(player, activityType, amount);
    
    // Update weekly challenge progress
    updateWeeklyChallengeProgress(player, activityType, amount);
    
    // Check for new achievements (only relevant to current activity)
    const newAchievements = checkActivityAchievements(player, activityType);
    
    return newAchievements;
}

// New function to check achievements specific to an activity
function checkActivityAchievements(player, activityType) {
    if (!player.achievements) {
        player.achievements = {
            unlocked: [],
            progress: {}
        };
    }
    
    const newAchievements = [];
    
    // Map activity types to achievement categories
    const activityToCategories = {
        'monsterKills': ['combat'],
        'miningCount': ['activity'],
        'woodcuttingCount': ['activity'],
        'fishingCount': ['activity'],
        'gold': ['economy'],
        'level': ['combat', 'economy'],
        'friends': ['social'],
        'visitedLocations': ['exploration']
    };
    
    // Get relevant categories for this activity
    const relevantCategories = activityToCategories[activityType] || [];
    
    // Check only relevant achievement categories
    relevantCategories.forEach(category => {
        if (achievements[category]) {
            Object.keys(achievements[category]).forEach(achievementId => {
                const achievement = achievements[category][achievementId];
                
                if (!player.achievements.unlocked.includes(achievementId)) {
                    if (achievement.condition(player)) {
                        newAchievements.push(achievement);
                        player.achievements.unlocked.push(achievementId);
                    }
                }
            });
        }
    });
    
    return newAchievements;
}

// Helper function to get current progress for an achievement
function getAchievementProgress(player, achievementId) {
    // Find the achievement
    let targetAchievement = null;
    
    Object.keys(achievements).forEach(category => {
        Object.keys(achievements[category]).forEach(id => {
            if (id === achievementId) {
                targetAchievement = achievements[category][id];
            }
        });
    });
    
    if (!targetAchievement) return null;
    
    // Get current value based on achievement type
    switch (achievementId) {
        case 'first_blood':
        case 'monster_slayer':
        case 'monster_hunter':
        case 'monster_exterminator':
            return `${player.monsterKills || 0} monsters killed`;
            
        case 'first_gold':
        case 'millionaire':
        case 'billionaire':
            return `${(player.gold || 0).toLocaleString()} gold`;
            
        case 'mining_beginner':
        case 'mining_expert':
            return `${player.miningCount || 0} times mined`;
            
        case 'fishing_beginner':
        case 'fishing_expert':
            return `${player.fishingCount || 0} times fished`;
            
        case 'woodcutter':
            return `${player.woodcuttingCount || 0} times woodcut`;
            
        case 'friend_maker':
        case 'social_butterfly':
            return `${(player.friends || []).length} friends`;
            
        case 'explorer':
        case 'world_traveler':
            return `${(player.visitedLocations || []).length} locations visited`;
            
        default:
            return null;
    }
}

function isRateLimited(participant) {
    const now = Date.now();
    const generalLimit = RATE_LIMITS.general;
    const userLimit = rateLimits.get(participant) || { count: 0, resetTime: now + generalLimit.window };
    
    if (now > userLimit.resetTime) {
        userLimit.count = 1;
        userLimit.resetTime = now + generalLimit.window;
        rateLimits.set(participant, userLimit);
        return false;
    }
    
    if (userLimit.count >= generalLimit.max) {
        return true;
    }
    
    userLimit.count++;
    rateLimits.set(participant, userLimit);
    return false;
}

function loadPlayerData() {
    let players = {};
    try {
        if (fs.existsSync(playerDataFile)) {
            players = JSON.parse(fs.readFileSync(playerDataFile, 'utf8'));
        }
    } catch (err) {
        console.error('Failed to load player data:', err);
    }
    // Auto-repair: jika lokasi tidak valid/hilang, kembalikan ke Desa Awal dan log
    const validLocations = locations.map(loc => loc.nama);
    let repaired = false;
    Object.keys(players).forEach(pid => {
        if (!players[pid].lokasi || !validLocations.includes(players[pid].lokasi)) {
            players[pid].lokasi = 'Desa Awal';
            repaired = true;
            logCommandActivity(pid, 'auto-repair', 'Desa Awal');
        }
    });
    if (repaired) {
        fs.writeFileSync(playerDataFile, JSON.stringify(players, null, 2));
    }
    return players;
}

// Database Optimization Functions
function compressPlayerData(player) {
    // Remove unnecessary fields and compress data
    const compressed = {
        nama: player.nama,
        kelas: player.kelas,
        level: player.level,
        hp: player.hp,
        maxHp: player.maxHp,
        mana: player.mana,
        maxMana: player.maxMana,
        attack: player.attack,
        defense: player.defense,
        gold: player.gold,
        lokasi: player.lokasi,
        status: player.status,
        hasChosenClass: player.hasChosenClass,
        equipment: player.equipment,
        tas: player.tas,
        titles: player.titles || [],
        // Activity tracking
        monsterKills: player.monsterKills || 0,
        miningCount: player.miningCount || 0,
        woodcuttingCount: player.woodcuttingCount || 0,
        fishingCount: player.fishingCount || 0,
        visitedLocations: player.visitedLocations || [],
        consecutiveDays: player.consecutiveDays || 0,
        // Social features
        friends: player.friends || [],
        friendRequests: player.friendRequests || [],
        blockedPlayers: player.blockedPlayers || [],
        // Stats tracking
        statsHistory: player.statsHistory || [],
        totalPlayTime: player.totalPlayTime || 0,
        lastLogin: player.lastLogin || Date.now(),
        // Achievement and quest tracking
        achievements: player.achievements || { unlocked: [], progress: {} },
        quests: player.quests || {
            daily: { progress: {}, completed: {}, lastReset: null },
            weekly: { progress: {}, completed: {}, lastReset: null },
            story: { progress: {}, completed: {}, current: 'story_beginning' }
        },
        weeklyChallenges: player.weeklyChallenges || {
            currentWeek: getCurrentWeek(),
            progress: {},
            completed: {},
            claimed: {}
        },
        // Timestamps
        joinDate: player.joinDate || Date.now(),
        lastUpdated: Date.now()
    };
    
    return compressed;
}

function createBackup() {
    try {
        const backupData = {
            timestamp: Date.now(),
            date: new Date().toISOString(),
            players: players,
            totalPlayers: Object.keys(players).length,
            version: "1.0.0"
        };
        
        const backupPath = `./database/backup_${Date.now()}.json`;
        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
        
        // Keep only last 5 backups
        const backupFiles = fs.readdirSync('./database').filter(file => file.startsWith('backup_'));
        if (backupFiles.length > 5) {
            backupFiles.sort().slice(0, -5).forEach(file => {
                fs.unlinkSync(`./database/${file}`);
            });
        }
        
        return backupPath;
    } catch (error) {
        console.error('Backup failed:', error);
        return null;
    }
}

function getDatabaseStats() {
    const totalPlayers = Object.keys(players).length;
    const activePlayers = Object.values(players).filter(p => 
        p.lastLogin && (Date.now() - p.lastLogin) < (7 * 24 * 60 * 60 * 1000)
    ).length;
    
    const totalGold = Object.values(players).reduce((sum, p) => sum + (p.gold || 0), 0);
    const totalLevels = Object.values(players).reduce((sum, p) => sum + (p.level || 0), 0);
    
    const classDistribution = {};
    Object.values(players).forEach(p => {
        const classType = p.kelas || 'Adventurer';
        classDistribution[classType] = (classDistribution[classType] || 0) + 1;
    });
    
    return {
        totalPlayers,
        activePlayers,
        totalGold,
        totalLevels,
        classDistribution,
        averageLevel: totalPlayers > 0 ? Math.round(totalLevels / totalPlayers) : 0,
        averageGold: totalPlayers > 0 ? Math.round(totalGold / totalPlayers) : 0
    };
}

// Enhanced save function with compression
function savePlayerData(data) {
    try {
        console.log(`Saving player data... Total players: ${Object.keys(data).length}`);
        
        // Compress data before saving
        const compressedData = {};
        Object.keys(data).forEach(key => {
            compressedData[key] = compressPlayerData(data[key]);
        });
        
        fs.writeFileSync(playerDataFile, JSON.stringify(compressedData, null, 2));
        console.log(`Player data saved successfully to ${playerDataFile}`);
        
        // Create backup every 100 saves
        if (!global.saveCount) global.saveCount = 0;
        global.saveCount++;
        
        if (global.saveCount % 100 === 0) {
            createBackup();
            console.log(`Database backup created at ${new Date().toISOString()}`);
        }
        
        return true;
    } catch (error) {
        console.error('Save failed:', error);
        return false;
    }
}

function getPlayerData(participant) {
    const players = loadPlayerData();
    return players[participant] || null;
}

// Helper functions for leaderboard
function calculateLevel(playerData) {
    // Simple level calculation based on total stats
    const baseStats = (playerData.attack || 0) + (playerData.defense || 0) + (playerData.maxHp || 0) + (playerData.maxMana || 0);
    const equipmentStats = calculateEquipmentStats(playerData);
    const totalStats = baseStats + equipmentStats;
    
    // Level formula: every 50 total stats = 1 level, starting from level 1
    return Math.max(1, Math.floor(totalStats / 50) + 1);
}

function calculateTotalStats(playerData) {
    const baseStats = (playerData.attack || 0) + (playerData.defense || 0) + (playerData.maxHp || 0) + (playerData.maxMana || 0);
    const equipmentStats = calculateEquipmentStats(playerData);
    return baseStats + equipmentStats;
}

function calculateEquipmentStats(playerData) {
    let totalStats = 0;
    for (const slot in playerData.equipment) {
        const itemName = playerData.equipment[slot];
        if (itemName) {
            const itemData = items.find(item => item.nama === itemName);
            if (itemData && itemData.stats) {
                totalStats += (itemData.stats.attack || 0) + (itemData.stats.defense || 0) + (itemData.stats.hp || 0);
            }
        }
    }
    return totalStats;
}

// Function to check and award titles
function checkAndAwardTitles(player) {
    console.log('🔍 Checking titles for player:', player.nama);
    console.log('📊 Player data:', {
        level: player.level,
        gold: player.gold,
        monsterKills: player.monsterKills || 0,
        miningCount: player.miningCount || 0,
        woodcuttingCount: player.woodcuttingCount || 0,
        fishingCount: player.fishingCount || 0,
        kelas: player.kelas,
        equipment: player.equipment,
        consecutiveDays: player.consecutiveDays || 0,
        visitedLocations: player.visitedLocations || []
    });
    
    if (!player.titles) player.titles = [];
    let newTitles = [];
    
    console.log('🏆 Current titles:', player.titles);
    
    // Check all title categories
    Object.keys(titles).forEach(category => {
        console.log(`📋 Checking category: ${category}`);
        Object.keys(titles[category]).forEach(titleName => {
            const title = titles[category][titleName];
            console.log(`  🎯 Checking title: ${titleName} - Requirement: ${title.requirement}`);
            
            try {
                const conditionMet = title.condition(player);
                const alreadyHas = player.titles.includes(titleName);
                console.log(`    ✅ Condition met: ${conditionMet}, Already has: ${alreadyHas}`);
                
                if (conditionMet && !alreadyHas) {
                    console.log(`    🎉 AWARDING NEW TITLE: ${titleName}`);
                    newTitles.push(titleName);
                    player.titles.push(titleName);
                }
            } catch (error) {
                console.error(`    ❌ Error checking title ${titleName}:`, error);
            }
        });
    });
    
    console.log('🎁 New titles awarded:', newTitles);
    return newTitles;
}

// Function to get title display
function getTitleDisplay(player) {
    if (!player.titles || player.titles.length === 0) return "Tidak Ada";
    
    return player.titles.join(" | ");
}

// Dynamic World System
const worldState = {
    weather: 'sunny', // sunny, rainy, stormy, snowy, foggy
    time: 'day', // day, night, dawn, dusk
    season: 'spring', // spring, summer, autumn, winter
    temperature: 25, // Celsius
    humidity: 60, // Percentage
    windSpeed: 5, // km/h
    worldEvents: [],
    lastUpdate: Date.now()
};

// Weather effects on gameplay
const weatherEffects = {
    sunny: {
        hunting: { bonus: 1.2, description: '☀️ Hunting lebih mudah di cuaca cerah' },
        mining: { bonus: 1.0, description: '⛏️ Mining normal' },
        woodcutting: { bonus: 1.1, description: '🪓 Woodcutting sedikit lebih cepat' },
        fishing: { bonus: 0.9, description: '🎣 Ikan lebih sulit ditangkap' }
    },
    rainy: {
        hunting: { bonus: 0.8, description: '🌧️ Hunting lebih sulit karena hujan' },
        mining: { bonus: 0.9, description: '⛏️ Mining sedikit lebih lambat' },
        woodcutting: { bonus: 0.7, description: '🪓 Woodcutting sangat sulit' },
        fishing: { bonus: 1.3, description: '🎣 Ikan lebih mudah ditangkap' }
    },
    stormy: {
        hunting: { bonus: 0.6, description: '⛈️ Hunting sangat berbahaya' },
        mining: { bonus: 0.5, description: '⛏️ Mining berbahaya karena petir' },
        woodcutting: { bonus: 0.4, description: '🪓 Woodcutting mustahil' },
        fishing: { bonus: 1.5, description: '🎣 Ikan melimpah karena badai' }
    },
    snowy: {
        hunting: { bonus: 0.9, description: '❄️ Hunting sedikit lebih sulit' },
        mining: { bonus: 1.2, description: '⛏️ Mining lebih mudah di salju' },
        woodcutting: { bonus: 0.8, description: '🪓 Woodcutting sulit karena salju' },
        fishing: { bonus: 0.7, description: '🎣 Ikan sulit ditangkap' }
    },
    foggy: {
        hunting: { bonus: 0.7, description: '🌫️ Hunting sangat sulit karena kabut' },
        mining: { bonus: 0.8, description: '⛏️ Mining sulit karena visibilitas rendah' },
        woodcutting: { bonus: 0.6, description: '🪓 Woodcutting berbahaya' },
        fishing: { bonus: 1.1, description: '🎣 Ikan sedikit lebih mudah' }
    }
};

// Time effects
const timeEffects = {
    day: { bonus: 1.0, description: '☀️ Aktivitas normal' },
    night: { 
        bonus: 0.8, 
        description: '🌙 Aktivitas lebih sulit di malam hari',
        special: 'Beberapa monster lebih kuat di malam hari'
    },
    dawn: { 
        bonus: 1.1, 
        description: '🌅 Aktivitas sedikit lebih mudah saat fajar',
        special: 'Waktu terbaik untuk hunting'
    },
    dusk: { 
        bonus: 0.9, 
        description: '🌆 Aktivitas mulai menurun saat senja',
        special: 'Monster mulai muncul'
    }
};

// Season effects
const seasonEffects = {
    spring: {
        description: '🌸 Musim semi - Semua aktivitas normal',
        specialEvents: ['Flower Festival', 'Spring Hunting']
    },
    summer: {
        description: '☀️ Musim panas - Hunting lebih mudah, mining lebih sulit',
        specialEvents: ['Summer Festival', 'Beach Party']
    },
    autumn: {
        description: '🍂 Musim gugur - Woodcutting lebih mudah, fishing lebih sulit',
        specialEvents: ['Harvest Festival', 'Autumn Gathering']
    },
    winter: {
        description: '❄️ Musim dingin - Mining lebih mudah, hunting lebih sulit',
        specialEvents: ['Winter Festival', 'Ice Fishing']
    }
};

// World events
const worldEvents = [
    {
        name: 'Meteor Shower',
        description: 'Hujan meteor memberikan bonus exp 2x',
        effect: { expBonus: 2.0, duration: 3600000 }, // 1 hour
        rarity: 'rare'
    },
    {
        name: 'Golden Hour',
        description: 'Jam emas memberikan bonus gold 1.5x',
        effect: { goldBonus: 1.5, duration: 1800000 }, // 30 minutes
        rarity: 'uncommon'
    },
    {
        name: 'Monster Invasion',
        description: 'Invasi monster - hunting memberikan exp 3x',
        effect: { huntingExpBonus: 3.0, duration: 2700000 }, // 45 minutes
        rarity: 'rare'
    },
    {
        name: 'Resource Boom',
        description: 'Boom sumber daya - semua gathering 2x',
        effect: { gatheringBonus: 2.0, duration: 2400000 }, // 40 minutes
        rarity: 'uncommon'
    },
    {
        name: 'Lucky Day',
        description: 'Hari keberuntungan - semua aktivitas 1.3x',
        effect: { allBonus: 1.3, duration: 3600000 }, // 1 hour
        rarity: 'common'
    }
];

// Update world state
function updateWorldState() {
    const now = Date.now();
    const timeDiff = now - worldState.lastUpdate;
    
    // Update every 5 minutes
    if (timeDiff > 300000) {
        // Update weather (random change)
        if (Math.random() < 0.3) {
            const weathers = Object.keys(weatherEffects);
            worldState.weather = weathers[Math.floor(Math.random() * weathers.length)];
        }
        
        // Update time based on real time
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) worldState.time = 'day';
        else if (hour >= 12 && hour < 18) worldState.time = 'day';
        else if (hour >= 18 && hour < 20) worldState.time = 'dusk';
        else if (hour >= 20 || hour < 6) worldState.time = 'night';
        else if (hour >= 5 && hour < 7) worldState.time = 'dawn';
        
        // Update season (changes every 3 months)
        const month = new Date().getMonth();
        if (month >= 2 && month < 5) worldState.season = 'spring';
        else if (month >= 5 && month < 8) worldState.season = 'summer';
        else if (month >= 8 && month < 11) worldState.season = 'autumn';
        else worldState.season = 'winter';
        
        // Random world events
        if (Math.random() < 0.1) { // 10% chance every 5 minutes
            const event = worldEvents[Math.floor(Math.random() * worldEvents.length)];
            worldState.worldEvents.push({
                ...event,
                startTime: now,
                endTime: now + event.effect.duration
            });
        }
        
        // Remove expired events
        worldState.worldEvents = worldState.worldEvents.filter(event => event.endTime > now);
        
        worldState.lastUpdate = now;
    }
}

// Get current world effects
function getWorldEffects() {
    updateWorldState();
    
    const weatherEffect = weatherEffects[worldState.weather];
    const timeEffect = timeEffects[worldState.time];
    const seasonEffect = seasonEffects[worldState.season];
    
    let totalBonus = 1.0;
    let effects = [];
    
    // Weather effects
    effects.push(weatherEffect.description);
    
    // Time effects
    effects.push(timeEffect.description);
    
    // Season effects
    effects.push(seasonEffect.description);
    
    // Active world events
    worldState.worldEvents.forEach(event => {
        effects.push(`🎉 ${event.name}: ${event.description}`);
        if (event.effect.allBonus) totalBonus *= event.effect.allBonus;
    });
    
    return {
        weather: worldState.weather,
        time: worldState.time,
        season: worldState.season,
        effects: effects,
        totalBonus: totalBonus,
        activeEvents: worldState.worldEvents
    };
}

// PvP System
const pvpChallenges = new Map(); // Store active challenges
const pvpBattles = new Map(); // Store active battles
const pvpRankings = new Map(); // Store player rankings

// Helper for PvP turn-based battle state
function createTurnBasedPvPState(p1Id, p1Data, p2Id, p2Data) {
    // Calculate stats with equipment
    function getStats(playerId, playerData) {
        let stats = {
            hp: playerData.hp,
            maxHp: playerData.maxHp,
            attack: playerData.attack,
            defense: playerData.defense,
            mana: playerData.mana,
            maxMana: playerData.maxMana,
            nama: playerData.nama,
            id: playerId // Gunakan ID yang diberikan secara eksplisit
        };
        // ... (sisa dari fungsi getStats Anda tetap sama)
        Object.keys(playerData.equipment).forEach(slot => {
            const itemName = playerData.equipment[slot];
            if (itemName) {
                const itemData = items.find(item => item.nama === itemName);
                if (itemData && itemData.stats) {
                    stats.attack += (itemData.stats.attack || 0);
                    stats.defense += (itemData.stats.defense || 0);
                    stats.maxHp += (itemData.stats.hp || 0);
                    stats.hp += (itemData.stats.hp || 0);
                }
            }
        });
        return stats;
    }
    return {
        player1: getStats(p1Id, p1Data),
        player2: getStats(p2Id, p2Data),
        turn: Math.random() < 0.5 ? 'player1' : 'player2',
        log: [],
        finished: false,
        winner: null,
        loser: null,
        round: 1,
        maxRounds: 30,
        actions: [],
        player1Effects: [],
        player2Effects: []
    };
}

// Clean up expired challenges
function cleanupExpiredChallenges() {
    const now = Date.now();
    const expiredChallenges = [];
    
    for (const [key, challenge] of pvpChallenges.entries()) {
        if (now > challenge.expiresAt) {
            expiredChallenges.push(key);
        }
    }
    
    expiredChallenges.forEach(key => {
        pvpChallenges.delete(key);
    });
    
    if (expiredChallenges.length > 0) {
        console.log(`Cleaned up ${expiredChallenges.length} expired PvP challenges`);
    }
}

// Clean up challenges every 5 minutes
setInterval(cleanupExpiredChallenges, 5 * 60 * 1000);

// PvP rankings structure
function initializePvPRanking(participant) {
    if (!pvpRankings.has(participant)) {
        pvpRankings.set(participant, {
            wins: 0,
            losses: 0,
            draws: 0,
            rating: 1000, // Starting rating
            streak: 0,
            lastBattle: null,
            totalBattles: 0
        });
    }
}

// Calculate PvP rating change
function calculateRatingChange(playerRating, opponentRating, result) {
    const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    const actualScore = result; // 1 for win, 0.5 for draw, 0 for loss
    const kFactor = 32; // Rating change factor
    
    return Math.round(kFactor * (actualScore - expectedScore));
}

// PvP battle simulation
function simulatePvPBattle(player1, player2) {
    // Calculate total stats for both players
    const p1Stats = {
        hp: player1.hp,
        maxHp: player1.maxHp,
        attack: player1.attack,
        defense: player1.defense,
        mana: player1.mana,
        maxMana: player1.maxMana
    };
    
    const p2Stats = {
        hp: player2.hp,
        maxHp: player2.maxHp,
        attack: player2.attack,
        defense: player2.defense,
        mana: player2.mana,
        maxMana: player2.maxMana
    };
    
    // Add equipment stats
    Object.keys(player1.equipment).forEach(slot => {
        const itemName = player1.equipment[slot];
        if (itemName) {
            const itemData = items.find(item => item.nama === itemName);
            if (itemData && itemData.stats) {
                p1Stats.attack += (itemData.stats.attack || 0);
                p1Stats.defense += (itemData.stats.defense || 0);
                p1Stats.maxHp += (itemData.stats.hp || 0);
                p1Stats.hp += (itemData.stats.hp || 0);
            }
        }
    });
    
    Object.keys(player2.equipment).forEach(slot => {
        const itemName = player2.equipment[slot];
        if (itemName) {
            const itemData = items.find(item => item.nama === itemName);
            if (itemData && itemData.stats) {
                p2Stats.attack += (itemData.stats.attack || 0);
                p2Stats.defense += (itemData.stats.defense || 0);
                p2Stats.maxHp += (itemData.stats.hp || 0);
                p2Stats.hp += (itemData.stats.hp || 0);
            }
        }
    });
    
    // Battle simulation
    let p1Hp = p1Stats.hp;
    let p2Hp = p2Stats.hp;
    let round = 1;
    const maxRounds = 20;
    const battleLog = [];
    
    while (p1Hp > 0 && p2Hp > 0 && round <= maxRounds) {
        // Player 1 attacks
        const p1Damage = Math.max(1, p1Stats.attack - p2Stats.defense);
        p2Hp -= p1Damage;
        battleLog.push(`Round ${round}: ${player1.nama} menyerang ${player2.nama} (${p1Damage} damage)`);
        
        if (p2Hp <= 0) break;
        
        // Player 2 attacks
        const p2Damage = Math.max(1, p2Stats.attack - p1Stats.defense);
        p1Hp -= p2Damage;
        battleLog.push(`Round ${round}: ${player2.nama} menyerang ${player1.nama} (${p2Damage} damage)`);
        
        round++;
    }
    
    // Determine winner
    let winner, loser, result;
    if (p1Hp > 0 && p2Hp <= 0) {
        winner = player1;
        loser = player2;
        result = 'p1_win';
    } else if (p2Hp > 0 && p1Hp <= 0) {
        winner = player2;
        loser = player1;
        result = 'p2_win';
    } else {
        winner = null;
        loser = null;
        result = 'draw';
    }
    
    return {
        winner,
        loser,
        result,
        battleLog,
        rounds: round - 1,
        p1FinalHp: Math.max(0, p1Hp),
        p2FinalHp: Math.max(0, p2Hp)
    };
}

// Dynamic Shop System
let shopInventory = [];
let lastShopUpdate = 0;
const SHOP_UPDATE_INTERVAL = 3600000; // 1 hour in milliseconds

// Item rarity tiers
const ITEM_TIERS = {
    COMMON: { weight: 50, maxItems: 8, color: '⚪' },
    UNCOMMON: { weight: 30, maxItems: 6, color: '🟢' },
    RARE: { weight: 15, maxItems: 4, color: '🔵' },
    EPIC: { weight: 4, maxItems: 2, color: '🟣' },
    LEGENDARY: { weight: 1, maxItems: 1, color: '🟡' }
};

// Categorize items by tier based on price
function categorizeItemByTier(item) {
    if (item.hargaBeli <= 100) return 'COMMON';
    if (item.hargaBeli <= 400) return 'UNCOMMON';
    if (item.hargaBeli <= 1000) return 'RARE';
    if (item.hargaBeli <= 2000) return 'EPIC';
    return 'LEGENDARY';
}

// Generate shop inventory
function generateShopInventory() {
    const now = Date.now();
    if (now - lastShopUpdate < SHOP_UPDATE_INTERVAL && shopInventory.length > 0) {
        return shopInventory; // Return existing inventory if not time to update
    }

    const availableItems = items.filter(item => item.hargaBeli > 0 && item.kategori === 'Peralatan');
    const newInventory = [];

    // Group items by tier
    const itemsByTier = {
        COMMON: [],
        UNCOMMON: [],
        RARE: [],
        EPIC: [],
        LEGENDARY: []
    };

    availableItems.forEach(item => {
        const tier = categorizeItemByTier(item);
        itemsByTier[tier].push(item);
    });

    // Generate inventory for each tier
    Object.keys(ITEM_TIERS).forEach(tier => {
        const tierConfig = ITEM_TIERS[tier];
        const tierItems = itemsByTier[tier];
        if (tierItems.length === 0) return;

        // LEGENDARY: 1% chance, EPIC: 10% chance, others always
        if (tier === 'LEGENDARY' && Math.random() > 0.01) return;
        if (tier === 'EPIC' && Math.random() > 0.10) return;

        // Calculate how many items to show for this tier
        const maxItems = Math.min(tierConfig.maxItems, tierItems.length);
        const itemCount = Math.floor(Math.random() * maxItems) + 1;

        // Randomly select items from this tier
        const selectedItems = [];
        const shuffled = [...tierItems].sort(() => 0.5 - Math.random());
        for (let i = 0; i < itemCount && i < shuffled.length; i++) {
            selectedItems.push(shuffled[i]);
        }
        newInventory.push(...selectedItems);
    });

    // Shuffle final inventory
    shopInventory = newInventory.sort(() => 0.5 - Math.random());
    lastShopUpdate = now;
    return shopInventory;
}

// Get time until next shop update
function getTimeUntilNextUpdate() {
    const now = Date.now();
    const timeSinceUpdate = now - lastShopUpdate;
    const timeUntilUpdate = SHOP_UPDATE_INTERVAL - timeSinceUpdate;
    
    if (timeUntilUpdate <= 0) return { hours: 0, minutes: 0 };
    
    const hours = Math.floor(timeUntilUpdate / 3600000);
    const minutes = Math.floor((timeUntilUpdate % 3600000) / 60000);
    
    return { hours, minutes };
}


function logCommandActivity(participant, command, lokasi) {
    try {
        let logs = { logs: [] };
        if (fs.existsSync(logFilePath)) {
            logs = JSON.parse(fs.readFileSync(logFilePath, 'utf8'));
        }
        logs.logs.push({
            timestamp: new Date().toISOString(),
            participant,
            command,
            lokasi
        });
        // Keep only last 2000 logs
        if (logs.logs.length > 2000) logs.logs = logs.logs.slice(-2000);
        fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2));
    } catch (err) {
        console.error('Failed to write command log:', err);
    }
}

module.exports = async (evarick, m) => {
    const msg = m.messages[0];
    if (!msg.message) return;

    // Skip if message is from bot itself
    if (msg.key.fromMe) {
        return;
    }

    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    const sender = msg.key.remoteJid;
    const participant = msg.key.participant || sender; // Get participant number for groups
    const pushname = msg.pushName || "Evarick";
    
    // Check if message starts with prefix
    if (!body.startsWith(prefix)) {
        return; // Ignore messages that don't start with prefix
    }
    
    const args = body.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();
    const q = args.join(" ");

    // Check if command is empty
    if (!command) {
        return; // Ignore empty commands
    }

    // Rate limiting check
    if (isRateLimited(participant)) {
        return; // Silently ignore if rate limited
    }

    const evarickreply = async (teks) => {
        try {
            await evarick.sendMessage(sender, { text: teks }, { quoted: msg });
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const isGroup = sender.endsWith('@g.us');
    const isGroupAdmin = (admin.includes(sender))
    const menuImage = fs.readFileSync(image);

    // Player data load - use participant number for consistent data across groups
    let players = loadPlayerData(); // Langsung muat semua data
    let player = players[participant]; // Ambil data pemain berdasarkan nomor pribadi
    
    // Debug: Log player data loading
    console.log(`Loading data for participant: ${participant}`);
    console.log(`Player exists: ${!!player}`);
    console.log(`Total players loaded: ${Object.keys(players).length}`);
    
    // Check if player is registered before allowing other commands
    const allowedCommands = [
        'menu', 'daftar', 'leaderboard', 'top', 'rank', 'toplevel', 'levelboard',
        // tambahkan command lain yang boleh diakses tanpa daftar jika perlu
    ];
    if (!player && !allowedCommands.includes(command)) {
        await evarickreply("⚔️ *Anda belum terdaftar di dunia RPG!*\n\nSilakan daftar terlebih dahulu dengan mengetik:\n*!daftar [NamaPanggilanAnda]*");
        return;
    }

    logCommandActivity(participant, command, player ? player.lokasi : null);

    switch (command) {

    // Menu
    case "menu": {
        await evarick.sendMessage(sender,
            {
                image: menuImage,
                caption: evarickmenu,
                mentions: [sender]
            },
        { quoted: msg }
        )
    }
    break

    // Class Selection Command
    case "class": {
        // Check if player has already chosen a class
        if (player.hasChosenClass) {
            // Player wants to change class - check if they have enough gold
            if (player.gold < 70000) {
                await evarickreply(`❌ *Gold tidak cukup!*\n\nUntuk mengganti class, kamu memerlukan 70.000 gold.\nGold kamu saat ini: ${player.gold.toLocaleString()}`);
                return;
            }
            
            // Deduct gold for class change
            player.gold -= 70000;
        }
        
        // If no class specified, show class options
        if (!q) {
            const costMessage = player.hasChosenClass ? 
                `💰 *Biaya pergantian class: 70.000 gold*\nGold tersisa: ${player.gold.toLocaleString()}\n\n` : 
                `🎁 *Pemilihan class pertama kali GRATIS!*\n\n`;
                
            let reply = `⚔️ *PILIH KELASMU* ⚔️\n\n${costMessage}` +
                `*Gunakan salah satu command berikut:*\n\n` +
                `!class fighter - 🗡️ Fighter (HP +20, Defense +5)\n` +
                `!class assassin - 🔪 Assassin (Attack +5, HP +10)\n` +
                `!class mage - 🧙 Mage (Mana +30, Attack +3)\n` +
                `!class tank - 🛡️ Tank (HP +30, Defense +8, Attack -2)\n` +
                `!class archer - 🏹 Archer (Attack +4, HP +15)\n\n` +
                `*Contoh: !class fighter*`;
            
            await evarickreply(reply);
            return;
        }

        // Process class selection by name
        const classChoice = q.toLowerCase();
            let classInfo = '';
            let weapon = '';
        let statChanges = {};
        let selectedClass = '';

            switch (classChoice) {
            case 'fighter':
                statChanges = { maxHp: 20, defense: 5 };
                    weapon = 'Pedang Latihan';
                    classInfo = 'Fighter - Ahli bertarung jarak dekat dengan pertahanan tinggi';
                selectedClass = 'Fighter';
                    break;
            case 'assassin':
                statChanges = { attack: 5, maxHp: 10 };
                    weapon = 'Belati Gesit';
                    classInfo = 'Assassin - Ahli serangan cepat dan kritis';
                selectedClass = 'Assassin';
                    break;
            case 'mage':
                statChanges = { maxMana: 30, attack: 3 };
                    weapon = 'Tongkat Sihir';
                    classInfo = 'Mage - Ahli sihir dan serangan jarak jauh';
                selectedClass = 'Mage';
                    break;
            case 'tank':
                statChanges = { maxHp: 30, defense: 8, attack: -2 };
                weapon = 'Perisai Besar';
                classInfo = 'Tank - Pertahanan terkuat, pelindung tim';
                selectedClass = 'Tank';
                break;
            case 'archer':
                statChanges = { attack: 4, maxHp: 15 };
                    weapon = 'Busur Pemburu';
                    classInfo = 'Archer - Ahli menembak dari jarak jauh';
                selectedClass = 'Archer';
                    break;
            default:
                await evarickreply(`❌ *Class tidak valid!*\n\nClass yang tersedia:\n- fighter\n- assassin\n- mage\n- tank\n- archer\n\n*Contoh: !class fighter*`);
                return;
        }

        // Apply stat changes
        Object.keys(statChanges).forEach(stat => {
            if (stat === 'maxHp') {
                player.maxHp += statChanges[stat];
                player.hp = player.maxHp;
            } else if (stat === 'maxMana') {
                player.maxMana += statChanges[stat];
                player.mana = player.maxMana;
            } else {
                player[stat] += statChanges[stat];
            }
        });

        // Set class name
        player.kelas = selectedClass;
        
        // Add weapon to inventory
            player.tas[weapon] = 1;
            
            // Update status
        player.status = 'active';
        player.hasChosenClass = true;

        // Save changes
        players[participant] = player;
            savePlayerData(players);

        // Send confirmation message
            await evarickreply(`🎉 *Selamat! Kamu telah menjadi ${player.kelas}!* 🎉\n\n` +
                `*${classInfo}*\n\n` +
                `*Status Awal:*\n` +
                `❤️ HP: ${player.hp}/${player.maxHp}\n` +
                `🔮 Mana: ${player.mana}/${player.maxMana}\n` +
                `⚔️ Attack: ${player.attack}\n` +
                `🛡️ Defense: ${player.defense}\n\n` +
                `*Item Awal:*\n` +
                `- ${weapon}\n\n` +
                `*Gunakan !menu untuk melihat perintah yang tersedia*`);
    }
    break

    // Inventory
    case "tas": {
        const itemsInBag = Object.entries(player.tas);
        if (itemsInBag.length === 0) {
            await evarickreply("Tas kamu masih kosong.");
        }
        let reply = "🎒 Isi Tasmu:\n";
        for (const [item, jumlah] of itemsInBag) {
            reply += `- ${item}: ${jumlah}\n`;
        }
        reply += `\n💰 Gold: ${player.gold}`;
        await evarickreply(reply);
    }
    break

    // Registration
    case "daftar": {
        if (player) {
            await evarickreply("✅ *Anda sudah terdaftar!*\n\nNama: " + player.nama + "\nClass: " + player.kelas + "\n\nGunakan !class untuk mengganti class atau !menu untuk melihat perintah lainnya.");
            return;
        }
        
        if (!q) {
            await evarickreply("⚠️ *Format pendaftaran salah!*\n\nGunakan: !daftar [NamaPanggilanAnda]\n\nContoh: !daftar Evarick");
            return;
        }

        // Create new player data with custom name
        player = {
            nama: q,
            kelas: 'Adventurer',
            level: 1,
            hasChosenClass: false,
            status: 'active', // Set status to active, not memilih_kelas
            lokasi: 'Desa Awal',
            tas: {},
            gold: 100,
            hp: 100, maxHp: 100,
            mana: 50, maxMana: 50,
            attack: 10, defense: 5,
            equipment: { helem: null, zirah: null, celana: null, sepatu: null, senjata: null, aksesoris: null },
            // Add missing fields for titles and tracking
            pvpStats: {
                rating: 1000,
                wins: 0,
                losses: 0
            },
            titles: [],
            monsterKills: 0,
            miningCount: 0,
            woodcuttingCount: 0,
            fishingCount: 0,
            visitedLocations: ['Desa Awal'],
            consecutiveDays: 0,
            friends: [],
            friendRequests: [],
            blockedPlayers: [],
            statsHistory: [],
            totalPlayTime: 0,
            lastLogin: Date.now(),
            joinDate: Date.now(),
            lastUpdated: Date.now()
        };
        
        players[participant] = player;
        savePlayerData(players);
        
        // Debug: Log the save operation
        console.log(`Player registered: ${participant} - ${q}`);
        console.log(`Total players in database: ${Object.keys(players).length}`);

        // Send welcome message without class selection
        let reply = `🎉 *Selamat datang di dunia RPG, ${q}!* 🎉\n\n` +
            `✅ *Pendaftaran berhasil!*\n\n` +
            `*Status Awal:*\n` +
            `❤️ HP: ${player.hp}/${player.maxHp}\n` +
            `🔮 Mana: ${player.mana}/${player.maxMana}\n` +
            `⚔️ Attack: ${player.attack}\n` +
            `🛡️ Defense: ${player.defense}\n` +
            `💰 Gold: ${player.gold}\n\n` +
            `*Class saat ini:* Adventurer (Default)\n\n` +
            `*Gunakan !class untuk memilih class yang lebih spesifik*\n` +
            `*Gunakan !menu untuk melihat perintah lainnya*`;
        
        await evarickreply(reply);
    }
    break

    case "leaderboard":
        case "rank":
        case "toplevel":
        case "levelboard": {
             if (!q) {
                let reply = "🏆 *Pilih Kategori Leaderboard* 🏆\n\n";
                reply += "Gunakan perintah `!leaderboard [kategori]`\n\n";
                reply += "*Kategori yang tersedia:*\n";
                reply += "  - `level`\n";
                reply += "  - `gold`\n";
                reply += "  - `pvp` - Rating PvP tertinggi\n";
                reply += "  - `monsterKills`\n";
                reply += "  - `miningCount`\n";
                reply += "  - `woodcuttingCount`\n";
                reply += "  - `fishingCount`\n\n";
                reply += "Contoh: `!leaderboard pvp`";
                return await evarickreply(reply);
             }

             const category = q.toLowerCase();
             const validCategories = ['gold', 'level', 'pvp', 'monsterkills', 'miningcount', 'woodcuttingcount', 'fishingcount'];
             
             const propertyMap = {
                 monsterkills: 'monsterKills',
                 miningcount: 'miningCount',
                 woodcuttingcount: 'woodcuttingCount',
                 fishingcount: 'fishingCount',
                 level: 'level',
                 gold: 'gold',
                 pvp: 'pvpStats.rating'
             };

             if (!validCategories.includes(category)) {
                 await evarickreply(`⚠️ *Kategori tidak valid!*\n\nCoba salah satu dari: ${Object.keys(propertyMap).join(', ')}`);
                 return;
             }

             const propertyToSort = propertyMap[category];
             let sortedPlayers;
             
             if (category === 'pvp') {
                 // Special handling for PvP rating
                 sortedPlayers = Object.values(players)
                     .filter(p => p.pvpStats && p.pvpStats.rating)
                     .sort((a, b) => (b.pvpStats.rating || 0) - (a.pvpStats.rating || 0))
                     .slice(0, 10);
             } else {
                 sortedPlayers = Object.values(players)
                 .sort((a, b) => (b[propertyToSort] || 0) - (a[propertyToSort] || 0))
                 .slice(0, 10);
             }

             let reply = `🏆 *TOP 10 PEMAIN - ${category.toUpperCase()}* 🏆\n\n`;
             sortedPlayers.forEach((p, index) => {
                 let value, formattedValue;
                 
                 if (category === 'pvp') {
                     value = p.pvpStats ? p.pvpStats.rating : 0;
                     formattedValue = value.toLocaleString('id-ID');
                 } else {
                     value = p[propertyToSort] || 0;
                     formattedValue = typeof value === 'number' ? value.toLocaleString('id-ID') : value;
                 }
                 
                 reply += `${index + 1}. *${p.nama}* - ${formattedValue}\n`;
             });
             await evarickreply(reply);
        }
        break;


    // Travel
    case "travel": {
        if (!q) {
            await evarickreply("⚠️ *Tentukan Tujuanmu!*\nCara penggunaan: !travel [nama lokasi]\n\nContoh: !travel Hutan Rindang");
            return;
        }

        const currentLocation = locations.find(loc => loc.nama === player.lokasi);
        if (!currentLocation) {
            await evarickreply("❌ *Error: Lokasi saat ini tidak ditemukan!*");
            return;
        }

        // Cari tujuan yang cocok tanpa mempedulikan huruf besar/kecil
        const tujuanInput = q.toLowerCase();
        const tujuanValid = currentLocation.koneksi.find(tujuan => tujuan.toLowerCase() === tujuanInput);

        if (!tujuanValid) {
            await evarickreply(`Kamu tidak bisa bepergian ke *${q}* dari sini atau nama lokasi salah.`);
            return;
        }

        // Validasi tujuanValid benar-benar ada di daftar locations
        const newLocationData = locations.find(loc => loc.nama === tujuanValid);
        if (!newLocationData) {
            await evarickreply(`❌ *Error: Data lokasi tujuan tidak valid!*`);
            return;
        }

        // Perbarui lokasi pemain dengan nama yang benar
        player.lokasi = tujuanValid;
        // Track visited locations for titles
        if (!player.visitedLocations) player.visitedLocations = [];
        if (!player.visitedLocations.includes(tujuanValid) && locations.some(loc => loc.nama === tujuanValid)) {
            player.visitedLocations.push(tujuanValid);
        }
        // Simpan perubahan lokasi ke data pemain
        players[participant] = player;
        savePlayerData(players);
        await evarickreply(`🚀 Kamu telah melakukan perjalanan dan tiba di *${tujuanValid}*.\n\n_${newLocationData.deskripsi}_`);
        return;
    }
    break

    // Home - Instant return to Desa Awal
    case "home": {
        // Check if player is already in Desa Awal
        if (player.lokasi === "Desa Awal") {
            await evarickreply(`🏠 *Kamu sudah berada di Desa Awal!*\n\nTidak perlu menggunakan command home.`);
            return;
        }

        // Check if player has enough gold
        if (player.gold < 10) {
            await evarickreply(`❌ *Gold tidak cukup!*\n\nUntuk kembali ke Desa Awal, kamu memerlukan 10 gold.\nGold kamu saat ini: ${player.gold.toLocaleString()}`);
            return;
        }

        // Deduct gold and teleport to Desa Awal
        player.gold -= 10;
        player.lokasi = "Desa Awal";
        
        // Save player data
        players[participant] = player;
        savePlayerData(players);
        
        await evarickreply(`🏠 *Selamat datang kembali di Desa Awal!*\n\n💰 Biaya teleport: 10 gold\n💳 Sisa gold: ${player.gold.toLocaleString()}\n\nKamu telah kembali ke desa dengan aman.`);
    }
    break

    // Lokasi
    case "lokasi": {
        const currentLocation = locations.find(loc => loc.nama === player.lokasi);
        if (!currentLocation) {
            await evarickreply("❌ *Error: Lokasi tidak ditemukan!*");
            return;
        }

        // Membuat daftar tujuan yang lebih rapi
        const tujuanList = currentLocation.koneksi.map(tujuan => `- ${tujuan}`).join('\n');

        const reply = `📍 *Lokasi Saat Ini: ${currentLocation.nama}*
_${currentLocation.deskripsi}_

📜 *Aksi yang bisa dilakukan:*
- ${currentLocation.aksi.join('\n- ')}

🗺️ *Tujuan Selanjutnya:*
${tujuanList.length > 0 ? tujuanList : 'Tidak ada jalan dari sini.'}`;

        await evarickreply(reply);
    }
    break

    // Profile/Status
    case "profile": {
        // Check for new titles first
        const newTitles = checkAndAwardTitles(player);
        players[participant] = player;
        savePlayerData(players);

        const classEmoji = {
            'Fighter': '🗡️',
            'Assassin': '🔪', 
            'Mage': '🧙',
            'Tank': '🛡️',
            'Archer': '🏹',
            'Adventurer': '⚔️'
        };
        
        const emoji = classEmoji[player.kelas] || '⚔️';
        
        let reply = `👤 *PROFIL PEMAIN* 👤\n\n` +
            `*Nama:* ${player.nama}\n` +
            `*Class:* ${emoji} ${player.kelas}`;
            
        // Add class selection status
        if (!player.hasChosenClass) {
            reply += ` *(Default - Belum memilih class spesifik)*`;
        }
        
        reply += `\n*Lokasi:* ${player.lokasi}\n\n`;

        // Display titles
        const titleDisplay = getTitleDisplay(player);
        reply += `🏆 *Titles:* ${titleDisplay}\n\n`;
        
        // Show new titles notification
        if (newTitles.length > 0) {
            reply += `🎉 *TITLE BARU DIPEROLEH:*\n`;
            newTitles.forEach(title => {
                reply += `✨ ${title}\n`;
            });
            reply += `\n`;
        }
        
        reply += `*📊 STATISTIK:*\n` +
            `❤️ HP: ${player.hp}/${player.maxHp}\n` +
            `🔮 Mana: ${player.mana}/${player.maxMana}\n` +
            `⚔️ Attack: ${player.attack}\n` +
            `🛡️ Defense: ${player.defense}\n\n` +
            `💰 *Gold:* ${player.gold.toLocaleString()}\n\n` +
            `*🎒 Equipment:*\n`;
        
        // Show equipped items
        const equippedItems = Object.entries(player.equipment).filter(([slot, item]) => item !== null);
        if (equippedItems.length === 0) {
            reply += `Tidak ada equipment yang dipakai\n`;
        } else {
            equippedItems.forEach(([slot, item]) => {
                reply += `- ${slot}: ${item}\n`;
            });
        }
        
        if (!player.hasChosenClass) {
            reply += `\n*💡 Gunakan !class untuk memilih class yang lebih spesifik*`;
        } else {
            reply += `\n*Gunakan !class untuk mengganti class*`;
        }

        await evarickreply(reply);
    }
    break

    // Hanya Admin
    case "admin": {
        if (!isAdmin(participant)) {
            await evarickreply(`❌ *Akses ditolak!*\n\nKamu tidak memiliki izin admin.`);
            return;
        }

        // Auto-award admin title if not already has it
        if (!player.titles) player.titles = [];
        if (!player.titles.includes('Bot Administrator')) {
            player.titles.push('Bot Administrator');
            players[participant] = player;
            savePlayerData(players);
            console.log(`👑 Admin title awarded to ${player.nama} (${participant})`);
        }

        if (!q) {
            let reply = `🔧 *ADMIN PANEL v2.0* 🔧\n\n`;
            reply += `*📊 DATABASE MANAGEMENT:*\n`;
            reply += `!admin stats - Database statistics\n`;
            reply += `!admin backup - Create manual backup\n`;
            reply += `!admin restore [backup_id] - Restore from backup\n`;
            reply += `!admin cleanup - Clean old data\n`;
            reply += `!admin optimize - Optimize database\n\n`;
            
            reply += `*👥 PLAYER MANAGEMENT:*\n`;
            reply += `!admin ban [player] [reason] - Ban player\n`;
            reply += `!admin unban [player] - Unban player\n`;
            reply += `!admin reset [player] - Reset player data\n`;
            reply += `!admin mute [player] [duration] - Mute player\n`;
            reply += `!admin unmute [player] - Unmute player\n`;
            reply += `!admin search [keyword] - Search players\n`;
            reply += `!admin top [category] - Show top players\n\n`;
            
            reply += `*🎁 ITEM & ECONOMY:*\n`;
            reply += `!admin give [player] [item] [amount] - Give item\n`;
            reply += `!admin take [player] [item] [amount] - Take item\n`;
            reply += `!admin gold [player] [amount] - Set gold\n`;
            reply += `!admin level [player] [level] - Set level\n`;
            reply += `!admin exp [player] [amount] - Add experience\n`;
            reply += `!admin title [player] [title] - Add title\n\n`;
            
            reply += `*🔒 SECURITY & MONITORING:*\n`;
            reply += `!admin logs - View suspicious activity\n`;
            reply += `!admin logs [player] - View player logs\n`;
            reply += `!admin rate [command] [limit] - Set rate limit\n`;
            reply += `!admin whitelist [player] - Whitelist player\n`;
            reply += `!admin blacklist [player] - Blacklist player\n`;
            reply += `!admin activity [player] - View player activity\n\n`;
            
            reply += `*⚙️ SYSTEM CONTROL:*\n`;
            reply += `!admin maintenance [on/off] - Toggle maintenance\n`;
            reply += `!admin broadcast [message] - Broadcast message\n`;
            reply += `!admin announce [message] - Announce to all\n`;
            reply += `!admin restart - Restart bot (simulation)\n`;
            reply += `!admin claimadmin - Claim admin title\n`;
            
            await evarickreply(reply);
            return;
        }

        const args = q.split(' ');
        const action = args[0]?.toLowerCase();

        switch (action) {
            case 'stats': {
                const stats = getDatabaseStats();
                let reply = `📊 *DATABASE STATISTICS* 📊\n\n`;
                reply += `👥 Total Players: ${stats.totalPlayers}\n`;
                reply += `🟢 Active Players (7d): ${stats.activePlayers}\n`;
                reply += `💰 Total Gold: ${stats.totalGold.toLocaleString()}\n`;
                reply += `📈 Total Levels: ${stats.totalLevels.toLocaleString()}\n`;
                reply += `📊 Average Level: ${stats.averageLevel}\n`;
                reply += `💰 Average Gold: ${stats.averageGold.toLocaleString()}\n\n`;
                
                reply += `*Class Distribution:*\n`;
                Object.entries(stats.classDistribution).forEach(([className, count]) => {
                    reply += `${className}: ${count}\n`;
                });
                
                reply += `\n*System Status:*\n`;
                reply += `🔄 Rate Limits Active: ${rateLimits.size}\n`;
                reply += `🚨 Suspicious Activities: ${suspiciousActivities.size}\n`;
                reply += `💾 Last Backup: ${global.lastBackup || 'Never'}\n`;
                reply += `⚡ Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\n`;
                
                await evarickreply(reply);
            }
            break;

            case 'endseason': {
                await evarickreply("⏳ Mengakhiri musim PvP mingguan, menghitung peringkat...");
            
                const allPlayers = Object.entries(players);
            
                // Filter pemain yang memiliki pvpStats dan pernah bermain
                const rankedPlayers = allPlayers
                    .filter(([id, p]) => p.pvpStats && (p.pvpStats.wins > 0 || p.pvpStats.losses > 0))
                    .sort(([, a], [, b]) => b.pvpStats.rating - a.pvpStats.rating);
            
                if (rankedPlayers.length < 3) {
                    return await evarickreply("❌ Peringkat tidak dapat ditentukan. Minimal harus ada 3 pemain yang aktif bertarung.");
                }
            
                // Tentukan pemenang
                const winners = {
                    "1st": { id: rankedPlayers[0][0], nama: rankedPlayers[0][1].nama, rating: rankedPlayers[0][1].pvpStats.rating, claimed: false },
                    "2nd": { id: rankedPlayers[1][0], nama: rankedPlayers[1][1].nama, rating: rankedPlayers[1][1].pvpStats.rating, claimed: false },
                    "3rd": { id: rankedPlayers[2][0], nama: rankedPlayers[2][1].nama, rating: rankedPlayers[2][1].pvpStats.rating, claimed: false }
                };
            
                // Simpan data pemenang ke pvp_season.json
                const seasonDataPath = './database/rpg/pvp_season.json';
                const seasonData = {
                    lastSeasonEnded: new Date().toISOString(),
                    lastWeekWinners: winners
                };
                fs.writeFileSync(seasonDataPath, JSON.stringify(seasonData, null, 2));
            
                // Buat pengumuman
                let announcement = `🏆 *PENGUMUMAN JUARA PvP MINGGUAN* 🏆\n\nMusim telah berakhir! Berikut adalah para juara minggu ini:\n\n`;
                announcement += `🥇 *Juara 1:* ${winners['1st'].nama} (Rating: ${winners['1st'].rating})\n`;
                announcement += `🥈 *Juara 2:* ${winners['2nd'].nama} (Rating: ${winners['2nd'].rating})\n`;
                announcement += `🥉 *Juara 3:* ${winners['3rd'].nama} (Rating: ${winners['3rd'].rating})\n\n`;
                announcement += `Selamat kepada para pemenang! Gunakan *!pvp claim* untuk mengambil hadiahmu.\n\n`;
                announcement += `Peringkat PvP telah di-reset. Musim baru telah dimulai!`;
            
                // Broadcast pengumuman (opsional) atau kirim ke admin
                await evarickreply(announcement);
            
                // Reset rating semua pemain
                allPlayers.forEach(([id, p]) => {
                    if (p.pvpStats) {
                        p.pvpStats.rating = 1000;
                        p.pvpStats.wins = 0;
                        p.pvpStats.losses = 0;
                    }
                });
            
                // Simpan data pemain yang sudah direset
                savePlayerData(players);
            
                await evarickreply("✅ Peringkat semua pemain telah berhasil di-reset.");
            }
            break;

            case 'backup': {
                const backupPath = createBackup();
                if (backupPath) {
                    global.lastBackup = new Date().toLocaleString('id-ID');
                    await evarickreply(`✅ *Backup berhasil dibuat!*\n\nPath: ${backupPath}\nWaktu: ${global.lastBackup}`);
                } else {
                    await evarickreply(`❌ *Backup gagal dibuat!*`);
                }
            }
            break;

            case 'restore': {
                const backupId = args[1];
                if (!backupId) {
                    await evarickreply(`⚠️ *Tentukan ID backup!*\n\nContoh: !admin restore backup_1234567890`);
                    return;
                }
                
                try {
                    const backupPath = `./database/${backupId}.json`;
                    if (!fs.existsSync(backupPath)) {
                        await evarickreply(`❌ *Backup tidak ditemukan!*`);
                        return;
                    }
                    
                    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
                    // In a real implementation, you would restore the data here
                    await evarickreply(`✅ *Restore berhasil!*\n\nBackup dari: ${backupData.date}\nTotal players: ${backupData.totalPlayers}`);
                } catch (error) {
                    await evarickreply(`❌ *Error restore: ${error.message}*`);
                }
            }
            break;

            case 'optimize': {
                // Optimize database by cleaning up old data
                const beforeSize = Object.keys(players).length;
                
                // Remove players who haven't logged in for 30 days
                const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                const inactivePlayers = Object.entries(players).filter(([id, p]) => 
                    !p.lastLogin || p.lastLogin < thirtyDaysAgo
                );
                
                inactivePlayers.forEach(([id, p]) => {
                    delete players[id];
                });
                
                savePlayerData(players);
                
                const afterSize = Object.keys(players).length;
                const removed = beforeSize - afterSize;
                
                await evarickreply(`🔧 *Database optimization complete!*\n\nRemoved ${removed} inactive players\nTotal players: ${afterSize}`);
            }
            break;

            case 'ban': {
                const targetName = args.slice(1, -1).join(' ');
                const reason = args[args.length - 1] || 'No reason provided';
                
                if (!targetName) {
                    await evarickreply(`⚠️ *Tentukan nama player!*\n\nContoh: !admin ban [nama] [alasan]`);
                    return;
                }

                const targetPlayer = Object.values(players).find(p => 
                    p.nama.toLowerCase() === targetName.toLowerCase()
                );

                if (!targetPlayer) {
                    await evarickreply(`❌ *Player "${targetName}" tidak ditemukan!*`);
                    return;
                }

                targetPlayer.banned = true;
                targetPlayer.banReason = reason;
                targetPlayer.banDate = new Date().toISOString();
                targetPlayer.bannedBy = player.nama;
                players[targetPlayer.id] = targetPlayer;
                savePlayerData(players);

                await evarickreply(`🚫 *${targetName} telah dibanned!*\n\nAlasan: ${reason}\nBanned by: ${player.nama}`);
            }
            break;

            case 'unban': {
                const targetName = args.slice(1).join(' ');
                if (!targetName) {
                    await evarickreply(`⚠️ *Tentukan nama player!*\n\nContoh: !admin unban [nama]`);
                    return;
                }

                const targetPlayer = Object.values(players).find(p => 
                    p.nama.toLowerCase() === targetName.toLowerCase()
                );

                if (!targetPlayer) {
                    await evarickreply(`❌ *Player "${targetName}" tidak ditemukan!*`);
                    return;
                }

                if (!targetPlayer.banned) {
                    await evarickreply(`❌ *${targetName} tidak dibanned!*`);
                    return;
                }

                delete targetPlayer.banned;
                delete targetPlayer.banReason;
                delete targetPlayer.banDate;
                delete targetPlayer.bannedBy;
                players[targetPlayer.id] = targetPlayer;
                savePlayerData(players);

                await evarickreply(`✅ *${targetName} telah diunban!*\n\nUnbanned by: ${player.nama}`);
            }
            break;

            case 'mute': {
                const targetName = args[1];
                const duration = parseInt(args[2]) || 60; // Default 60 minutes
                
                if (!targetName) {
                    await evarickreply(`⚠️ *Tentukan nama player!*\n\nContoh: !admin mute [nama] [duration_minutes]`);
                    return;
                }

                const targetPlayer = Object.values(players).find(p => 
                    p.nama.toLowerCase() === targetName.toLowerCase()
                );

                if (!targetPlayer) {
                    await evarickreply(`❌ *Player "${targetName}" tidak ditemukan!*`);
                    return;
                }

                targetPlayer.muted = true;
                targetPlayer.muteExpires = Date.now() + (duration * 60 * 1000);
                targetPlayer.mutedBy = player.nama;
                players[targetPlayer.id] = targetPlayer;
                savePlayerData(players);

                await evarickreply(`🔇 *${targetName} telah dimute!*\n\nDuration: ${duration} minutes\nMuted by: ${player.nama}`);
            }
            break;

            case 'unmute': {
                const targetName = args.slice(1).join(' ');
                if (!targetName) {
                    await evarickreply(`⚠️ *Tentukan nama player!*\n\nContoh: !admin unmute [nama]`);
                    return;
                }

                const targetPlayer = Object.values(players).find(p => 
                    p.nama.toLowerCase() === targetName.toLowerCase()
                );

                if (!targetPlayer) {
                    await evarickreply(`❌ *Player "${targetName}" tidak ditemukan!*`);
                    return;
                }

                if (!targetPlayer.muted) {
                    await evarickreply(`❌ *${targetName} tidak dimute!*`);
                    return;
                }

                delete targetPlayer.muted;
                delete targetPlayer.muteExpires;
                delete targetPlayer.mutedBy;
                players[targetPlayer.id] = targetPlayer;
                savePlayerData(players);

                await evarickreply(`🔊 *${targetName} telah diunmute!*\n\nUnmuted by: ${player.nama}`);
            }
            break;

            case 'search': {
                const keyword = args.slice(1).join(' ');
                if (!keyword) {
                    await evarickreply(`⚠️ *Tentukan keyword pencarian!*\n\nContoh: !admin search [keyword]`);
                    return;
                }

                const results = Object.values(players).filter(p => 
                    p.nama.toLowerCase().includes(keyword.toLowerCase()) ||
                    p.kelas.toLowerCase().includes(keyword.toLowerCase())
                ).slice(0, 10); // Limit to 10 results

                if (results.length === 0) {
                    await evarickreply(`❌ *Tidak ada player yang cocok dengan "${keyword}"*`);
                    return;
                }

                let reply = `🔍 *SEARCH RESULTS: "${keyword}"* 🔍\n\n`;
                results.forEach((p, index) => {
                    reply += `${index + 1}. ${p.nama} (${p.kelas})\n`;
                    reply += `   Level: ${p.level} | Gold: ${p.gold.toLocaleString()}\n`;
                    reply += `   Status: ${p.banned ? '🚫 Banned' : p.muted ? '🔇 Muted' : '🟢 Active'}\n\n`;
                });

                await evarickreply(reply);
            }
            break;

            case 'top': {
                const category = args[1] || 'gold';
                const validCategories = ['gold', 'level', 'monsterKills', 'miningCount', 'woodcuttingCount', 'fishingCount'];
                
                if (!validCategories.includes(category)) {
                    await evarickreply(`⚠️ *Category tidak valid!*\n\nValid categories: ${validCategories.join(', ')}`);
                    return;
                }

                const sortedPlayers = Object.values(players)
                    .sort((a, b) => (b[category] || 0) - (a[category] || 0))
                    .slice(0, 10);

                let reply = `🏆 *TOP 10 PLAYERS - ${category.toUpperCase()}* 🏆\n\n`;
                sortedPlayers.forEach((p, index) => {
                    const value = p[category] || 0;
                    const formattedValue = category === 'gold' ? value.toLocaleString() : value;
                    reply += `${index + 1}. ${p.nama}\n`;
                    reply += `   ${category}: ${formattedValue}\n\n`;
                });

                await evarickreply(reply);
            }
            break;

            case 'take': {
                const targetName = args[1];
                const itemName = args[2];
                const amount = parseInt(args[3]) || 1;

                if (!targetName || !itemName) {
                    await evarickreply(`⚠️ *Tentukan player dan item!*\n\nContoh: !admin take [player] [item] [amount]`);
                    return;
                }

                const targetPlayer = Object.values(players).find(p => 
                    p.nama.toLowerCase() === targetName.toLowerCase()
                );

                if (!targetPlayer) {
                    await evarickreply(`❌ *Player "${targetName}" tidak ditemukan!*`);
                    return;
                }

                const currentAmount = targetPlayer.tas[itemName] || 0;
                if (currentAmount < amount) {
                    await evarickreply(`❌ *${targetName} hanya memiliki ${currentAmount} ${itemName}!*`);
                    return;
                }

                targetPlayer.tas[itemName] = currentAmount - amount;
                if (targetPlayer.tas[itemName] <= 0) {
                    delete targetPlayer.tas[itemName];
                }
                
                players[targetPlayer.id] = targetPlayer;
                savePlayerData(players);

                await evarickreply(`📤 *${amount} ${itemName} diambil dari ${targetName}!*`);
            }
            break;

            case 'exp': {
                const targetName = args[1];
                const amount = parseInt(args[2]);

                if (!targetName || isNaN(amount)) {
                    await evarickreply(`⚠️ *Tentukan player dan jumlah exp!*\n\nContoh: !admin exp [player] [amount]`);
                    return;
                }

                const targetPlayer = Object.values(players).find(p => 
                    p.nama.toLowerCase() === targetName.toLowerCase()
                );

                if (!targetPlayer) {
                    await evarickreply(`❌ *Player "${targetName}" tidak ditemukan!*`);
                    return;
                }

                // Add experience (simplified - in real implementation you'd have exp system)
                const oldLevel = targetPlayer.level;
                targetPlayer.level = Math.max(1, targetPlayer.level + Math.floor(amount / 100));
                
                players[targetPlayer.id] = targetPlayer;
                savePlayerData(players);

                await evarickreply(`📈 *${amount} exp diberikan ke ${targetName}!*\n\nLevel: ${oldLevel} → ${targetPlayer.level}`);
            }
            break;

            case 'title': {
                const targetName = args[1];
                const titleName = args.slice(2).join(' ');

                if (!targetName || !titleName) {
                    await evarickreply(`⚠️ *Tentukan player dan title!*\n\nContoh: !admin title [player] [title]`);
                    return;
                }

                const targetPlayer = Object.values(players).find(p => 
                    p.nama.toLowerCase() === targetName.toLowerCase()
                );

                if (!targetPlayer) {
                    await evarickreply(`❌ *Player "${targetName}" tidak ditemukan!*`);
                    return;
                }

                if (!targetPlayer.titles) targetPlayer.titles = [];
                if (targetPlayer.titles.includes(titleName)) {
                    await evarickreply(`❌ *${targetName} sudah memiliki title "${titleName}"!*`);
                    return;
                }

                targetPlayer.titles.push(titleName);
                players[targetPlayer.id] = targetPlayer;
                savePlayerData(players);

                await evarickreply(`👑 *Title "${titleName}" diberikan ke ${targetName}!*`);
            }
            break;

            case 'logs': {
                const targetPlayer = args[1];
                
                if (targetPlayer) {
                    // Show logs for specific player
                    const player = Object.values(players).find(p => 
                        p.nama.toLowerCase() === targetPlayer.toLowerCase()
                    );
                    
                    if (!player) {
                        await evarickreply(`❌ *Player "${targetPlayer}" tidak ditemukan!*`);
                        return;
                    }
                    
                    let reply = `📋 *ACTIVITY LOGS - ${player.nama}* 📋\n\n`;
                    reply += `👤 Level: ${player.level}\n`;
                    reply += `💰 Gold: ${player.gold.toLocaleString()}\n`;
                    reply += `👹 Monster Kills: ${player.monsterKills || 0}\n`;
                    reply += `⛏️ Mining: ${player.miningCount || 0}\n`;
                    reply += `🪓 Woodcutting: ${player.woodcuttingCount || 0}\n`;
                    reply += `🎣 Fishing: ${player.fishingCount || 0}\n`;
                    reply += `📅 Join Date: ${new Date(player.joinDate).toLocaleDateString('id-ID')}\n`;
                    reply += `🕐 Last Login: ${new Date(player.lastLogin).toLocaleString('id-ID')}\n`;
                    
                    if (player.banned) {
                        reply += `🚫 Banned: ${player.banReason}\n`;
                        reply += `📅 Ban Date: ${new Date(player.banDate).toLocaleString('id-ID')}\n`;
                    }
                    
                    await evarickreply(reply);
                } else {
                    // Show general suspicious activity logs
                    try {
                        const logPath = './database/suspicious_activity.json';
                        if (!fs.existsSync(logPath)) {
                            await evarickreply(`📋 *Tidak ada log aktivitas mencurigakan!*`);
                            return;
                        }

                        const logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
                        const recentLogs = logs.slice(-10); // Last 10 entries

                        if (recentLogs.length === 0) {
                            await evarickreply(`📋 *Tidak ada log aktivitas mencurigakan!*`);
                            return;
                        }

                        let reply = `🚨 *SUSPICIOUS ACTIVITY LOGS (10 Terakhir)* 🚨\n\n`;
                        recentLogs.forEach((log, index) => {
                            reply += `${index + 1}. ${log.playerData?.nama || 'Unknown'} (${log.command})\n`;
                            reply += `   Alasan: ${log.reason}\n`;
                            reply += `   Waktu: ${new Date(log.timestamp).toLocaleString('id-ID')}\n\n`;
                        });

                        await evarickreply(reply);
                    } catch (error) {
                        await evarickreply(`❌ *Error membaca log: ${error.message}*`);
                    }
                }
            }
            break;

            case 'rate': {
                const command = args[1];
                const limit = parseInt(args[2]);
                
                if (!command || isNaN(limit)) {
                    await evarickreply(`⚠️ *Tentukan command dan limit!*\n\nContoh: !admin rate [command] [limit]`);
                    return;
                }
                
                if (!RATE_LIMITS[command]) {
                    await evarickreply(`❌ *Command "${command}" tidak memiliki rate limit!*`);
                    return;
                }
                
                const oldLimit = RATE_LIMITS[command].max;
                RATE_LIMITS[command].max = limit;
                
                await evarickreply(`⚡ *Rate limit updated!*\n\nCommand: ${command}\nOld limit: ${oldLimit}\nNew limit: ${limit}`);
            }
            break;

            case 'whitelist': {
                const targetName = args.slice(1).join(' ');
                if (!targetName) {
                    await evarickreply(`⚠️ *Tentukan nama player!*\n\nContoh: !admin whitelist [nama]`);
                    return;
                }

                const targetPlayer = Object.values(players).find(p => 
                    p.nama.toLowerCase() === targetName.toLowerCase()
                );

                if (!targetPlayer) {
                    await evarickreply(`❌ *Player "${targetName}" tidak ditemukan!*`);
                    return;
                }

                targetPlayer.whitelisted = true;
                players[targetPlayer.id] = targetPlayer;
                savePlayerData(players);

                await evarickreply(`✅ *${targetName} telah diwhitelist!*\n\nPlayer ini tidak akan terkena rate limit.`);
            }
            break;

            case 'blacklist': {
                const targetName = args.slice(1).join(' ');
                if (!targetName) {
                    await evarickreply(`⚠️ *Tentukan nama player!*\n\nContoh: !admin blacklist [nama]`);
                    return;
                }

                const targetPlayer = Object.values(players).find(p => 
                    p.nama.toLowerCase() === targetName.toLowerCase()
                );

                if (!targetPlayer) {
                    await evarickreply(`❌ *Player "${targetName}" tidak ditemukan!*`);
                    return;
                }

                targetPlayer.blacklisted = true;
                players[targetPlayer.id] = targetPlayer;
                savePlayerData(players);

                await evarickreply(`🚫 *${targetName} telah diblacklist!*\n\nPlayer ini tidak bisa menggunakan bot.`);
            }
            break;

            case 'activity': {
                const targetName = args.slice(1).join(' ');
                if (!targetName) {
                    await evarickreply(`⚠️ *Tentukan nama player!*\n\nContoh: !admin activity [nama]`);
                    return;
                }

                const targetPlayer = Object.values(players).find(p => 
                    p.nama.toLowerCase() === targetName.toLowerCase()
                );

                if (!targetPlayer) {
                    await evarickreply(`❌ *Player "${targetName}" tidak ditemukan!*`);
                    return;
                }

                // Check rate limit activity for this player
                const playerRateLimits = [];
                for (const [key, timestamps] of rateLimits.entries()) {
                    if (key.startsWith(targetPlayer.id)) {
                        const command = key.split('_')[1];
                        playerRateLimits.push({ command, count: timestamps.length });
                    }
                }

                let reply = `📊 *ACTIVITY ANALYSIS - ${targetPlayer.nama}* 📊\n\n`;
                reply += `👤 Level: ${targetPlayer.level}\n`;
                reply += `💰 Gold: ${targetPlayer.gold.toLocaleString()}\n`;
                reply += `🕐 Last Login: ${new Date(targetPlayer.lastLogin).toLocaleString('id-ID')}\n\n`;
                
                if (playerRateLimits.length > 0) {
                    reply += `*Recent Activity (Rate Limits):*\n`;
                    playerRateLimits.forEach(({ command, count }) => {
                        reply += `${command}: ${count} times\n`;
                    });
                } else {
                    reply += `*No recent activity detected*`;
                }

                await evarickreply(reply);
            }
            break;

            case 'maintenance': {
                const mode = args[1];
                if (!mode || !['on', 'off'].includes(mode)) {
                    await evarickreply(`⚠️ *Tentukan mode!*\n\nContoh: !admin maintenance [on/off]`);
                    return;
                }
                
                global.maintenanceMode = mode === 'on';
                
                await evarickreply(`🔧 *Maintenance mode ${global.maintenanceMode ? 'enabled' : 'disabled'}!*\n\n${global.maintenanceMode ? 'Bot sedang dalam maintenance mode. Hanya admin yang bisa menggunakan commands.' : 'Bot kembali normal.'}`);
            }
            break;

            case 'broadcast': {
                const message = args.slice(1).join(' ');
                if (!message) {
                    await evarickreply(`⚠️ *Tentukan pesan!*\n\nContoh: !admin broadcast [pesan]`);
                    return;
                }
                
                // In a real implementation, you would send this to all active players
                await evarickreply(`📢 *BROADCAST MESSAGE* 📢\n\n${message}\n\n*Sent by: ${player.nama}*`);
            }
            break;

            case 'announce': {
                const message = args.slice(1).join(' ');
                if (!message) {
                    await evarickreply(`⚠️ *Tentukan pesan!*\n\nContoh: !admin announce [pesan]`);
                    return;
                }
                
                // In a real implementation, you would send this to all players
                const totalPlayers = Object.keys(players).length;
                await evarickreply(`📢 *ANNOUNCEMENT* 📢\n\n${message}\n\n*Sent to ${totalPlayers} players by: ${player.nama}*`);
            }
            break;

            case 'restart': {
                await evarickreply(`🔄 *Bot restart simulation complete!*\n\nIn a real implementation, this would restart the bot.`);
            }
            break;

            case 'reset': {
                const targetName = args.slice(1).join(' ');
                if (!targetName) {
                    await evarickreply(`⚠️ *Tentukan nama player!*\n\nContoh: !admin reset [nama]`);
                    return;
                }

                const targetPlayer = Object.values(players).find(p => 
                    p.nama.toLowerCase() === targetName.toLowerCase()
                );

                if (!targetPlayer) {
                    await evarickreply(`❌ *Player "${targetName}" tidak ditemukan!*`);
                    return;
                }

                // Reset player data
                const resetData = {
                    id: targetPlayer.id,
                    nama: targetPlayer.nama,
                    kelas: 'Adventurer',
                    level: 1,
                    hp: 100,
                    maxHp: 100,
                    mana: 50,
                    maxMana: 50,
                    attack: 10,
                    defense: 5,
                    gold: 1000,
                    lokasi: 'Desa Awal',
                    status: 'active',
                    hasChosenClass: false,
                    equipment: {},
                    tas: {},
                    titles: [],
                    joinDate: new Date().toISOString(),
                    lastUpdated: Date.now()
                };

                players[targetPlayer.id] = resetData;
                savePlayerData(players);

                await evarickreply(`🔄 *Data ${targetName} telah direset!*\n\nReset by: ${player.nama}`);
            }
            break;

            case 'give': {
                const targetName = args[1];
                const itemName = args[2];
                const amount = parseInt(args[3]) || 1;

                if (!targetName || !itemName) {
                    await evarickreply(`⚠️ *Tentukan player dan item!*\n\nContoh: !admin give [player] [item] [amount]`);
                    return;
                }

                const targetPlayer = Object.values(players).find(p => 
                    p.nama.toLowerCase() === targetName.toLowerCase()
                );

                if (!targetPlayer) {
                    await evarickreply(`❌ *Player "${targetName}" tidak ditemukan!*`);
                    return;
                }

                targetPlayer.tas[itemName] = (targetPlayer.tas[itemName] || 0) + amount;
                players[targetPlayer.id] = targetPlayer;
                savePlayerData(players);

                await evarickreply(`🎁 *${amount} ${itemName} diberikan ke ${targetName}!*\n\nGiven by: ${player.nama}`);
            }
            break;

            case 'leaderboard':
            case 'rank':
            case 'toplevel':
            case 'levelboard': {
                if (!q) {
                   let reply = "🏆 *Pilih Kategori Leaderboard* 🏆\n\n";
                   reply += "Gunakan perintah `!leaderboard [kategori]`\n\n";
                   reply += "*Kategori yang tersedia:*\n";
                   reply += "  - `level`\n";
                   reply += "  - `gold`\n";
                   reply += "  - `pvp` - Rating PvP tertinggi\n";
                   reply += "  - `monsterKills`\n";
                   reply += "  - `miningCount`\n";
                   reply += "  - `woodcuttingCount`\n";
                   reply += "  - `fishingCount`\n\n";
                   reply += "Contoh: `!leaderboard pvp`";
                   return await evarickreply(reply);
                }

                const category = q.toLowerCase();
                const validCategories = ['gold', 'level', 'pvp', 'monsterkills', 'miningcount', 'woodcuttingcount', 'fishingcount'];
                
                const propertyMap = {
                    monsterkills: 'monsterKills',
                    miningcount: 'miningCount',
                    woodcuttingcount: 'woodcuttingCount',
                    fishingcount: 'fishingCount',
                    level: 'level',
                    gold: 'gold',
                    pvp: 'pvpStats.rating'
                };

                if (!validCategories.includes(category)) {
                    await evarickreply(`⚠️ *Kategori tidak valid!*\n\nCoba salah satu dari: ${Object.keys(propertyMap).join(', ')}`);
                    return;
                }

                const propertyToSort = propertyMap[category];
                let sortedPlayers;
                
                if (category === 'pvp') {
                    // Special handling for PvP rating
                    sortedPlayers = Object.values(players)
                        .filter(p => p.pvpStats && p.pvpStats.rating)
                        .sort((a, b) => (b.pvpStats.rating || 0) - (a.pvpStats.rating || 0))
                    .slice(0, 10);
                } else {
                    sortedPlayers = Object.values(players)
                        .sort((a, b) => (b[propertyToSort] || 0) - (a[propertyToSort] || 0))
                        .slice(0, 10);
                }

                let reply = `🏆 *TOP 10 PEMAIN - ${category.toUpperCase()}* 🏆\n\n`;
                sortedPlayers.forEach((p, index) => {
                    let value, formattedValue;
                    
                    if (category === 'pvp') {
                        value = p.pvpStats ? p.pvpStats.rating : 0;
                        formattedValue = value.toLocaleString('id-ID');
                    } else {
                        value = p[propertyToSort] || 0;
                        formattedValue = typeof value === 'number' ? value.toLocaleString('id-ID') : value;
                    }
                    
                    reply += `${index + 1}. *${p.nama}* - ${formattedValue}\n`;
                });
                await evarickreply(reply);
            }
            break;

            case 'gold': {
                const targetName = args[1];
                const amount = parseInt(args[2]);

                if (!targetName || isNaN(amount)) {
                    await evarickreply(`⚠️ *Tentukan player dan jumlah gold!*\n\nContoh: !admin gold [player] [amount]`);
                    return;
                }

                const targetPlayer = Object.values(players).find(p => 
                    p.nama.toLowerCase() === targetName.toLowerCase()
                );

                if (!targetPlayer) {
                    await evarickreply(`❌ *Player "${targetName}" tidak ditemukan!*`);
                    return;
                }

                targetPlayer.gold = amount;
                players[targetPlayer.id] = targetPlayer;
                savePlayerData(players);

                await evarickreply(`💰 *Gold ${targetName} diatur ke ${amount.toLocaleString()}!*\n\nSet by: ${player.nama}`);
            }
            break;

            case 'level': {
                const targetName = args[1];
                const level = parseInt(args[2]);

                if (!targetName || isNaN(level)) {
                    await evarickreply(`⚠️ *Tentukan player dan level!*\n\nContoh: !admin level [player] [level]`);
                    return;
                }

                const targetPlayer = Object.values(players).find(p => 
                    p.nama.toLowerCase() === targetName.toLowerCase()
                );

                if (!targetPlayer) {
                    await evarickreply(`❌ *Player "${targetName}" tidak ditemukan!*`);
                    return;
                }

                targetPlayer.level = level;
                players[targetPlayer.id] = targetPlayer;
                savePlayerData(players);

                await evarickreply(`📈 *Level ${targetName} diatur ke ${level}!*\n\nSet by: ${player.nama}`);
            }
            break;

            case 'cleanup': {
                // Clean old rate limits and suspicious activities
                const now = Date.now();
                const oneHourAgo = now - (60 * 60 * 1000);

                // Clean rate limits
                let cleanedRateLimits = 0;
                for (const [key, timestamps] of rateLimits.entries()) {
                    const validTimestamps = timestamps.filter(time => time > oneHourAgo);
                    if (validTimestamps.length === 0) {
                        rateLimits.delete(key);
                        cleanedRateLimits++;
                    } else {
                        rateLimits.set(key, validTimestamps);
                    }
                }

                // Clean suspicious activities
                let cleanedSuspicious = 0;
                for (const [key, activities] of suspiciousActivities.entries()) {
                    const validActivities = activities.filter(act => act.timestamp > oneHourAgo);
                    if (validActivities.length === 0) {
                        suspiciousActivities.delete(key);
                        cleanedSuspicious++;
                    } else {
                        suspiciousActivities.set(key, validActivities);
                    }
                }

                await evarickreply(`🧹 *Cleanup berhasil!*\n\nRate limits cleaned: ${cleanedRateLimits}\nSuspicious activities cleaned: ${cleanedSuspicious}\nMemory optimized.`);
            }
            break;

            case 'claimadmin': {
                // Ensure admin gets the admin title
                if (!player.titles) player.titles = [];
                if (!player.titles.includes('Bot Administrator')) {
                    player.titles.push('Bot Administrator');
        players[participant] = player;
        savePlayerData(players);
                    await evarickreply(`👑 *Title "Bot Administrator" berhasil diklaim!*\n\nKamu sekarang memiliki title khusus admin.`);
                } else {
                    await evarickreply(`👑 *Kamu sudah memiliki title "Bot Administrator"!*`);
                }
            }
            break;

            default: {
                await evarickreply(`❌ *Action tidak valid!*\n\nGunakan !admin untuk melihat menu lengkap.`);
            }
        }
    }
    break

    // Hanya Group
    case "group": {
        if (!isGroup) await evarickreply(mess.group); // Contoh Penerapan Hanya Group
        await evarickreply("🎁 *Kamu Sedang Berada Di Dalam Grup*"); // Pesan Ini Hanya Akan Dikirim Jika Di Dalam Grup
    }
    break

    // AI Chat
    case "ai": {
        if (!q) await evarickreply("☘️ *Contoh:* !ai Apa itu JavaScript?");
        await evarickreply(mess.wait);
        try {
            const lenai = await Ai4Chat(q);
            await evarickreply(`*Evarick AI*\n\n${lenai}`);
        } catch (error) {
            console.error("Error:", error);
            await evarickreply(mess.error);
        }
    }
    break;

    case "ttdl": {
        if (!q) await evarickreply("⚠ *Mana Link Tiktoknya?*");
        await evarickreply(mess.wait);
        try {
            const result = await tiktok2(q); // Panggil Fungsi Scraper

            // Kirim Video
            await evarick.sendMessage(
                sender,
                {
                    video: { url: result.no_watermark },
                    caption: `*🎁 Evarick Tiktok Downloader*`
                },
                { quoted: msg }
            );

        } catch (error) {
            console.error("Error TikTok DL:", error);
            await evarickreply(mess.error);
        }
    }
    break;

    case "igdl": {
        if (!q) await evarickreply("⚠ *Mana Link Instagramnya?*");
        try {
            await evarickreply(mess.wait);

            // Panggil API Velyn
            const apiUrl = `https://www.velyn.biz.id/api/downloader/instagram?url=${encodeURIComponent(q)}`;
            const response = await axios.get(apiUrl);

            if (!response.data.status || !response.data.data.url[0]) {
                throw new Error("Link tidak valid atau API error");
            }

            const data = response.data.data;
            const mediaUrl = data.url[0];
            const metadata = data.metadata;

            // Kirim Media
            if (metadata.isVideo) {
                await evarick.sendMessage(
                    sender,
                    {
                        video: { url: mediaUrl },
                        caption: `*Instagram Reel*\n\n` +
                            `*Username :* ${metadata.username}\n` +
                            `*Likes :* ${metadata.like.toLocaleString()}\n` +
                            `*Comments :* ${metadata.comment.toLocaleString()}\n\n` +
                            `*Caption :* ${metadata.caption || '-'}\n\n` +
                            `*Source :* ${q}`
                    },
                    { quoted: msg }
                );
            } else {
                await evarick.sendMessage(
                    sender,
                    {
                        image: { url: mediaUrl },
                        caption: `*Instagram Post*\n\n` +
                            `*Username :* ${metadata.username}\n` +
                            `*Likes :* ${metadata.like.toLocaleString()}\n\n` +
                            `*Caption :* ${metadata.caption || '-'}`
                    },
                    { quoted: msg }
                );
            }

        } catch (error) {
            console.error("Error Instagram DL:", error);
            await evarickreply(mess.error);
        }
    }
    break;

    // Game Tebak Angka
    case "tebakangka": {
        const target = Math.floor(Math.random() * 100);
        evarick.tebakGame = { target, sender };
        await evarickreply("*Tebak Angka 1 - 100*\n*Ketik !tebak [Angka]*");
    }
    break;

    case "tebak": {
        if (!evarick.tebakGame || evarick.tebakGame.sender !== sender) return;
        const guess = parseInt(args[0]);
        if (isNaN(guess)) return await evarickreply("❌ *Masukkan Angka!*");

        if (guess === evarick.tebakGame.target) {
            await evarickreply(`🎉 *Tebakkan Kamu Benar!*`);
            delete evarick.tebakGame;
        } else {
            await evarickreply(guess > evarick.tebakGame.target ? "*Terlalu Tinggi!*" : "*Terlalu rendah!*");
        }
    }
    break;

    case "quote": {
        const quotes = [
            "Jangan menyerah, hari buruk akan berlalu.",
            "Kesempatan tidak datang dua kali.",
            "Kamu lebih kuat dari yang kamu kira.",
            "Hidup ini singkat, jangan sia-siakan."
        ];
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        await evarickreply(`*Quote Hari Ini :*\n_"${randomQuote}"_`);
    }
    break;

    // Hunt (Sistem Pertarungan)
    case "hunt": {
        // --- Kalkulasi Status Pertarungan ---
        let playerCombatStats = {
            attack: player.attack,
            defense: player.defense,
            maxHp: player.maxHp
        };

        for (const slot in player.equipment) {
            const itemName = player.equipment[slot];
            if (itemName) {
                const itemData = items.find(item => item.nama === itemName);
                if (itemData && itemData.stats) {
                    playerCombatStats.attack += (itemData.stats.attack || 0);
                    playerCombatStats.defense += (itemData.stats.defense || 0);
                    playerCombatStats.maxHp += (itemData.stats.hp || 0);
                }
            }
        }
        
        const currentLocation = locations.find(loc => loc.nama === player.lokasi);
        if (!currentLocation.aksi.includes('hunt')) return await evarickreply("Tempat ini terlalu aman untuk berburu.");
        
        const possibleEnemies = enemies.filter(e => e.lokasi.includes(player.lokasi));
        if (possibleEnemies.length === 0) return await evarickreply("Suasana terasa tenang, tidak ada musuh di sekitar.");

        const enemy = { ...possibleEnemies[Math.floor(Math.random() * possibleEnemies.length)] };
        let playerHp = player.hp;
        let enemyHp = enemy.hp;
        let battleLog = [`⚔️ Kamu bertemu dengan *${enemy.nama}*!\n`];

        // Simulasi pertarungan
        while (playerHp > 0 && enemyHp > 0) {
            // Player attacks
            const playerDamage = Math.max(1, playerCombatStats.attack - (enemy.defense || 0));
            enemyHp -= playerDamage;
            battleLog.push(`- Kamu menyerang ${enemy.nama}, damage ${playerDamage}. HP musuh: ${Math.max(0, enemyHp)}`);
            if (enemyHp <= 0) break;

            // Enemy attacks
            const enemyDamage = Math.max(1, enemy.damage - playerCombatStats.defense);
            playerHp -= enemyDamage;
            battleLog.push(`- ${enemy.nama} menyerangmu, damage ${enemyDamage}. HP kamu: ${Math.max(0, playerHp)}`);
        }

        // Hasil Pertarungan
        if (playerHp > 0) {
            player.hp = playerHp;
            
            // Track monster kills for titles
            player.monsterKills = (player.monsterKills || 0) + 1;
            
            // Update quest and challenge progress
            const newAchievements = updateAllProgress(player, 'monsterKills', 1);
            
            let lootResult = [];
            for (const lootItem of enemy.loot) {
                if (Math.random() < lootItem.chance) {
                    player.tas[lootItem.nama] = (player.tas[lootItem.nama] || 0) + 1;
                    lootResult.push(`- 1 ${lootItem.nama}`);
                }
            }
            
            battleLog.push(`\n🎉 *KAMU MENANG!* 🎉`);
            battleLog.push(`Sisa HP: ${player.hp}/${playerCombatStats.maxHp}`);
            if (lootResult.length > 0) {
                battleLog.push(`\n*Loot didapatkan:*\n${lootResult.join('\n')}`);
            }
            
            // Add achievement notification if any new achievements unlocked
            if (newAchievements.length > 0) {
                battleLog.push(`\n🏆 *ACHIEVEMENT UNLOCKED:*`);
                newAchievements.forEach(achievement => {
                    battleLog.push(`🎉 ${achievement.description}`);
                });
            }
            
            await evarickreply(battleLog.join('\n'));
            savePlayerData(players);
        } else {
            // Revive dengan 30% max HP, minimal 1
            const reviveHp = Math.max(1, Math.ceil(playerCombatStats.maxHp * 0.3));
            player.hp = reviveHp;
            player.lokasi = 'Desa Awal';
            battleLog.push(`\n☠️ *KAMU KALAH!* ☠️`);
            battleLog.push(`Kamu pingsan dan kembali ke Desa Awal dengan sisa HP ${reviveHp}/${playerCombatStats.maxHp} (30% dari total HP).`);
            await evarickreply(battleLog.join('\n'));
            savePlayerData(players);
        }
    }
    break

    case "equip": {
        if (!q) await evarickreply("Gunakan: !equip [nama item dari tas]");
        
        const itemName = q;
        if (!player.tas[itemName] || player.tas[itemName] <= 0) {
            await evarickreply(`Kamu tidak memiliki item "${itemName}" di tas.`);
        }

        const itemData = items.find(item => item.nama === itemName);
        if (!itemData || !itemData.tipe) {
            await evarickreply(`"${itemName}" bukanlah sebuah equipment yang bisa dipakai.`);
        }

        const slot = itemData.tipe; // 'senjata', 'helem', dll.
        
        // Lepas item lama jika ada, kembalikan ke tas
        if (player.equipment[slot]) {
            const oldItemName = player.equipment[slot];
            player.tas[oldItemName] = (player.tas[oldItemName] || 0) + 1;
            await evarickreply(`Kamu melepas "${oldItemName}".`);
        }

        // Pakai item baru
        player.tas[itemName]--; // Kurangi item dari tas
        if (player.tas[itemName] === 0) delete player.tas[itemName];
        player.equipment[slot] = itemName; // Masukkan item ke slot

        await evarickreply(`Kamu berhasil memakai "${itemName}" di slot ${slot}.`);
        savePlayerData(players);
    }
    break

    case "unequip": {
        if (!q) await evarickreply("Gunakan: !unequip [nama slot]\nContoh: !unequip senjata");

        const slot = q.toLowerCase();
        const validSlots = ['helem', 'zirah', 'celana', 'sepatu', 'senjata', 'aksesoris'];
        if (!validSlots.includes(slot)) {
            await evarickreply(`Slot tidak valid. Pilih dari: ${validSlots.join(', ')}`);
        }

        const itemName = player.equipment[slot];
        if (!itemName) {
            await evarickreply(`Slot ${slot} sudah kosong.`);
        }

        // Kembalikan item ke tas
        player.tas[itemName] = (player.tas[itemName] || 0) + 1;
        player.equipment[slot] = null; // Kosongkan slot

        await evarickreply(`Kamu berhasil melepas "${itemName}" dari slot ${slot} dan mengembalikannya ke tas.`);
        savePlayerData(players);
    }
    break;

    // Heal
    case "heal": {
        if (player.lokasi !== "Desa Awal") {
            await evarickreply("Kamu hanya bisa beristirahat dan memulihkan HP di Desa Awal.");
        }
        player.hp = player.maxHp;
        await evarickreply(`❤️ HP kamu telah pulih sepenuhnya (${player.hp}/${player.maxHp}).`);
        savePlayerData(players);
    }
    break

    case "status":
    case "me": {
        // Check for new titles first
        const newTitles = checkAndAwardTitles(player);
        players[participant] = player;
        savePlayerData(players);

        // Hitung total stats dari equipment
        let totalStats = { attack: 0, defense: 0, hp: 0 };
        for (const slot in player.equipment) {
            const itemName = player.equipment[slot];
            if (itemName) {
                const itemData = items.find(item => item.nama === itemName);
                if (itemData && itemData.stats) {
                    totalStats.attack += (itemData.stats.attack || 0);
                    totalStats.defense += (itemData.stats.defense || 0);
                    totalStats.hp += (itemData.stats.hp || 0);
                }
            }
        }

        const classEmoji = {
            'Fighter': '🗡️',
            'Assassin': '🔪', 
            'Mage': '🧙',
            'Tank': '🛡️',
            'Archer': '🏹',
            'Adventurer': '⚔️'
        };
        
        const emoji = classEmoji[player.kelas] || '⚔️';

        let reply = `👤 *Status Pemain: ${player.nama}*\n\n`;
        reply += `*Class:* ${emoji} ${player.kelas}`;
        
        // Add class selection status
        if (!player.hasChosenClass) {
            reply += ` *(Default - Belum memilih class spesifik)*`;
        }
        
        reply += `\n*Lokasi:* ${player.lokasi}\n\n`;

        // Display titles
        const titleDisplay = getTitleDisplay(player);
        reply += `🏆 *Titles:* ${titleDisplay}\n\n`;
        
        // Show new titles notification
        if (newTitles.length > 0) {
            reply += `🎉 *TITLE BARU DIPEROLEH:*\n`;
            newTitles.forEach(title => {
                reply += `✨ ${title}\n`;
            });
            reply += `\n`;
        }
        
        reply += `❤️ HP: ${player.hp} / ${player.maxHp + totalStats.hp}\n`;
        reply += `🔮 Mana: ${player.mana} / ${player.maxMana}\n`;
        reply += `⚔️ Attack: ${player.attack + totalStats.attack} (Dasar: ${player.attack} + Equip: ${totalStats.attack})\n`;
        reply += `🛡️ Defense: ${player.defense + totalStats.defense} (Dasar: ${player.defense} + Equip: ${totalStats.defense})\n`;
        reply += `💰 Gold: ${player.gold.toLocaleString()}\n\n`;
        reply += `*🎒 EQUIPMENT:*\n`;
        reply += `- Helem: ${player.equipment.helem || '[Kosong]'}\n`;
        reply += `- Zirah: ${player.equipment.zirah || '[Kosong]'}\n`;
        reply += `- Celana: ${player.equipment.celana || '[Kosong]'}\n`;
        reply += `- Sepatu: ${player.equipment.sepatu || '[Kosong]'}\n`;
        reply += `- Senjata: ${player.equipment.senjata || '[Kosong]'}\n`;
        reply += `- Aksesoris: ${player.equipment.aksesoris || '[Kosong]'}\n`;
        
        if (!player.hasChosenClass) {
            reply += `\n*💡 Gunakan !class untuk memilih class yang lebih spesifik*`;
        }
        
        await evarickreply(reply);
    }
    break

    // Mining
    case "nambang": {
        const currentLocation = locations.find(loc => loc.nama === player.lokasi);
        if (!currentLocation.aksi.includes('nambang')) {
            await evarickreply("Kamu tidak bisa menambang di sini.");
            return;
        }
        
        // Track mining activity for titles
        player.miningCount = (player.miningCount || 0) + 1;
        
        // Update quest and challenge progress
        const newAchievements = updateAllProgress(player, 'miningCount', 1);
        
        // Peluang mendapatkan item langka di lokasi khusus
        if (player.lokasi === 'Gunung Berapi' && Math.random() < 0.1) { // 10% chance
            player.tas['Kristal Api'] = (player.tas['Kristal Api'] || 0) + 1;
            let reply = "✨ Kamu menemukan Kristal Api yang langka saat menambang!";
            
            // Add achievement notification if any new achievements unlocked
            if (newAchievements.length > 0) {
                reply += `\n\n🏆 *ACHIEVEMENT UNLOCKED:*`;
                newAchievements.forEach(achievement => {
                    reply += `\n🎉 ${achievement.description}`;
                });
            }
            
            await evarickreply(reply);
          } else {
            player.tas['Batu'] = (player.tas['Batu'] || 0) + 1;
            let reply = "Kamu menambang dan mendapatkan 1 Batu!";
            
            // Add achievement notification if any new achievements unlocked
            if (newAchievements.length > 0) {
                reply += `\n\n🏆 *ACHIEVEMENT UNLOCKED:*`;
                newAchievements.forEach(achievement => {
                    reply += `\n🎉 ${achievement.description}`;
                });
            }
            
            await evarickreply(reply);
        }
        savePlayerData(players);
    }
    break

    // Woodcutting
    case "nebang": {
        const currentLocation = locations.find(loc => loc.nama === player.lokasi);
        if (!currentLocation) {
            await evarickreply("❌ *Error: Lokasi saat ini tidak ditemukan!*");
            return;
        }
        if (!currentLocation.aksi.includes('nebang')) {
            await evarickreply("Kamu tidak bisa menebang pohon di sini.");
            return;
        }
        
        // Track woodcutting activity for titles
        player.woodcuttingCount = (player.woodcuttingCount || 0) + 1;
        
        // Update quest and challenge progress
        const newAchievements = updateAllProgress(player, 'woodcuttingCount', 1);
        
        if (!player.tas['Kayu']) {
            player.tas['Kayu'] = 1;
        } else {
            player.tas['Kayu']++;
        }
        
        let reply = "Kamu menebang pohon dan mendapatkan 1 Kayu!";
        
        // Add achievement notification if any new achievements unlocked
        if (newAchievements.length > 0) {
            reply += `\n\n🏆 *ACHIEVEMENT UNLOCKED:*`;
            newAchievements.forEach(achievement => {
                reply += `\n🎉 ${achievement.description}`;
            });
        }

        await evarickreply(reply);
        savePlayerData(players);
    }
    break

    // Fishing
    case "mancing": {
        const currentLocation = locations.find(loc => loc.nama === player.lokasi);
        if (!currentLocation.aksi.includes('mancing')) {
            await evarickreply("Kamu tidak bisa memancing di sini.");
            return;
        }

        // Track fishing activity for titles
        player.fishingCount = (player.fishingCount || 0) + 1;

        // Update quest and challenge progress
        const newAchievements = updateAllProgress(player, 'fishingCount', 1);

        // Peluang mendapatkan item langka di lokasi khusus
        if (player.lokasi === 'Danau Tenang' && Math.random() < 0.05) { // 5% chance
            player.tas['Ikan Legendaris'] = (player.tas['Ikan Legendaris'] || 0) + 1;
            let reply = "🎣 LUAR BIASA! Kamu berhasil menangkap Ikan Legendaris!";
            
            // Add achievement notification if any new achievements unlocked
            if (newAchievements.length > 0) {
                reply += `\n\n🏆 *ACHIEVEMENT UNLOCKED:*`;
                newAchievements.forEach(achievement => {
                    reply += `\n🎉 ${achievement.description}`;
                });
            }
            
            await evarickreply(reply);
        } else {
            player.tas['Ikan'] = (player.tas['Ikan'] || 0) + 1;
            let reply = "Kamu memancing dan mendapatkan 1 Ikan!";
            
            // Add achievement notification if any new achievements unlocked
            if (newAchievements.length > 0) {
                reply += `\n\n🏆 *ACHIEVEMENT UNLOCKED:*`;
                newAchievements.forEach(achievement => {
                    reply += `\n🎉 ${achievement.description}`;
                });
            }
            
            await evarickreply(reply);
        }
        savePlayerData(players);
    }
    break

    // Shop
    case "shop": {
        if (player.lokasi !== "Desa Awal") {
            await evarickreply("Kamu harus berada di Desa Awal untuk mengakses toko.");
            return;
        }
        
        // Generate or get current shop inventory
        const currentInventory = generateShopInventory();
        const timeUntilUpdate = getTimeUntilNextUpdate();
        
        // Group items by tier for display
        const itemsByTier = {};
        currentInventory.forEach(item => {
            const tier = categorizeItemByTier(item);
            if (!itemsByTier[tier]) itemsByTier[tier] = [];
            itemsByTier[tier].push(item);
        });

        let reply = `🏪 *TOKO DINAMIS DESA AWAL* 🏪\n\n`;
        reply += `💰 Gold Kamu: *${player.gold.toLocaleString()}*\n`;
        reply += `⏰ Reset dalam: *${timeUntilUpdate.hours}j ${timeUntilUpdate.minutes}m*\n\n`;
        
        reply += `*=============== BARANG TERSEDIA HARI INI ===============*\n\n`;

        // Display items by tier
        Object.keys(ITEM_TIERS).forEach(tier => {
            const tierConfig = ITEM_TIERS[tier];
            const tierItems = itemsByTier[tier];
            
            if (tierItems && tierItems.length > 0) {
                reply += `${tierConfig.color} *${tier}* (${tierItems.length} item)\n`;
                tierItems.forEach(item => {
                    reply += `  • ${item.nama} | 💰 ${item.hargaBeli.toLocaleString()} gold\n`;
                });
                reply += `\n`;
            }
        });

        // Items that can be sold
        const materialDijual = items.filter(item => item.hargaJual > 0 && item.kategori === 'Material');
        const lootDijual = items.filter(item => item.hargaJual > 0 && item.kategori === 'Loot');
        const spesialDijual = items.filter(item => item.hargaJual > 0 && item.kategori === 'Spesial');

        reply += `*=============== KAMI MEMBELI (JUAL) ===============*\n`;
        reply += `*--- Material Alam ---*\n`;
        materialDijual.forEach(item => {
            reply += `- ${item.nama} | Harga Jual: ${item.hargaJual} gold\n`;
        });

        reply += `\n*--- Loot Monster ---*\n`;
        lootDijual.forEach(item => {
            reply += `- ${item.nama} | Harga Jual: ${item.hargaJual} gold\n`;
        });

        reply += `\n*--- Item Spesial ---*\n`;
        spesialDijual.forEach(item => {
            reply += `- ${item.nama} | Harga Jual: ${item.hargaJual} gold\n`;
        });

        reply += `\n--------------------------------------------------\n`;
        reply += `Gunakan: *!buy [nama item]* atau *!sell [nama item] [jumlah]*\n`;
        reply += `*Atau gunakan:*\n`;
        reply += `• *!sell all* - Jual semua item yang bisa dijual\n`;
        reply += `• *!sell all loot* - Jual semua loot monster saja\n`;
        reply += `*💡 Item berubah setiap jam!*\n`;
        reply += `*📊 Gunakan !shopinfo untuk info detail*`;
        
        await evarickreply(reply);
    }
    break

    case "shopinfo": {
        if (player.lokasi !== "Desa Awal") {
            await evarickreply("Kamu harus berada di Desa Awal untuk mengakses toko.");
            return;
        }

        const timeUntilUpdate = getTimeUntilNextUpdate();
        const currentInventory = generateShopInventory();
        
        // Count items by tier
        const tierCounts = {};
        currentInventory.forEach(item => {
            const tier = categorizeItemByTier(item);
            tierCounts[tier] = (tierCounts[tier] || 0) + 1;
        });

        let reply = `🏪 *INFO TOKO DINAMIS* 🏪\n\n`;
        reply += `⏰ *Reset dalam:* ${timeUntilUpdate.hours}j ${timeUntilUpdate.minutes}m\n`;
        reply += `📦 *Total item tersedia:* ${currentInventory.length}\n\n`;
        
        reply += `*📊 DISTRIBUSI TIER:*\n`;
        Object.keys(ITEM_TIERS).forEach(tier => {
            const tierConfig = ITEM_TIERS[tier];
            const count = tierCounts[tier] || 0;
            reply += `${tierConfig.color} ${tier}: ${count} item\n`;
        });

        reply += `\n*🎯 RARITY SYSTEM:*\n`;
        reply += `⚪ Common (≤100g): Mudah ditemukan\n`;
        reply += `🟢 Uncommon (≤400g): Agak langka\n`;
        reply += `🔵 Rare (≤1000g): Langka\n`;
        reply += `🟣 Epic (≤2000g): Sangat langka\n`;
        reply += `🟡 Legendary (>2000g): Ultra langka\n\n`;
        
        reply += `*💡 TIPS:*\n`;
        reply += `• Item berubah setiap jam\n`;
        reply += `• Tier tinggi sangat jarang muncul\n`;
        reply += `• Cek shop secara rutin untuk item langka\n`;
        reply += `• Simpan gold untuk item epic/legendary`;
        
        await evarickreply(reply);
    }
    break;

    case "buy": {
        if (player.lokasi !== "Desa Awal") {
            await evarickreply("Kamu harus berada di Desa Awal untuk mengakses toko.");
            return;
        }
        
        // Get current shop inventory
        const currentInventory = generateShopInventory();
        
        // Memisahkan jumlah dari nama item
        const args = q.split(" ");
        const amountStr = args[args.length - 1];
        let amount = parseInt(amountStr);
        let itemName = q;

        if (!isNaN(amount)) { // Jika ada angka di akhir, itu adalah jumlahnya
            itemName = args.slice(0, -1).join(" ");
        } else { // Jika tidak ada angka, asumsikan jumlahnya 1
            amount = 1;
        }

        if (!itemName || amount < 1) {
            await evarickreply("Format: !buy [nama item] [jumlah]\nContoh: !buy Pedang Besi 1");
            return;
        }
        
        // Cari item di shop inventory tanpa mempedulikan huruf besar/kecil
        const itemData = currentInventory.find(i => i.nama.toLowerCase() === itemName.toLowerCase());
        if (!itemData) {
            await evarickreply(`❌ Item "${itemName}" tidak tersedia di toko hari ini!\n\nGunakan !shop untuk melihat item yang tersedia.`);
            return;
        }

        const totalCost = itemData.hargaBeli * amount;
        if (player.gold < totalCost) {
            await evarickreply(`❌ Gold kamu tidak cukup!\nHarga: ${totalCost.toLocaleString()}\nGold kamu: ${player.gold.toLocaleString()}`);
            return;
        }
        
        player.gold -= totalCost;
        player.tas[itemData.nama] = (player.tas[itemData.nama] || 0) + amount;
        
        const tier = categorizeItemByTier(itemData);
        const tierColor = ITEM_TIERS[tier].color;
        
        await evarickreply(`✅ *Berhasil membeli ${amount} ${itemData.nama}!*\n\n` +
            `${tierColor} Tier: ${tier}\n` +
            `💰 Harga: ${totalCost.toLocaleString()} gold\n` +
            `💳 Sisa gold: ${player.gold.toLocaleString()}`);
        savePlayerData(players);
    }
    break;

    case "sell": {
        if (player.lokasi !== "Desa Awal") {
            await evarickreply("Kamu harus berada di Desa Awal untuk mengakses toko.");
            return;
        }
        
        // Handle special sell commands
        if (q.toLowerCase() === "all") {
            // Sell all items that can be sold
            const itemsToSell = Object.keys(player.tas).filter(itemName => {
                const itemData = items.find(i => i.nama === itemName);
                return itemData && itemData.hargaJual > 0;
            });
            
            if (itemsToSell.length === 0) {
                await evarickreply("Tidak ada item yang bisa dijual di tasmu.");
                return;
            }
            
            let totalGold = 0;
            let soldItems = [];
            
            itemsToSell.forEach(itemName => {
                const itemData = items.find(i => i.nama === itemName);
                const amount = player.tas[itemName];
                const itemGold = itemData.hargaJual * amount;
                totalGold += itemGold;
                soldItems.push(`${itemName} (${amount}x)`);
                delete player.tas[itemName];
            });
            
            player.gold += totalGold;
            
            let reply = `💰 *BERHASIL MENJUAL SEMUA ITEM!* 💰\n\n`;
            reply += `*Item yang dijual:*\n`;
            soldItems.forEach(item => {
                reply += `• ${item}\n`;
            });
            reply += `\n*Total Gold yang didapat:* ${totalGold.toLocaleString()}\n`;
            reply += `*Gold sekarang:* ${player.gold.toLocaleString()}`;
            
            await evarickreply(reply);
            savePlayerData(players);
            return;
        }
        
        if (q.toLowerCase() === "all loot") {
            // Sell all loot items only
            const lootItemsToSell = Object.keys(player.tas).filter(itemName => {
                const itemData = items.find(i => i.nama === itemName);
                return itemData && itemData.hargaJual > 0 && itemData.kategori === 'Loot';
            });
            
            if (lootItemsToSell.length === 0) {
                await evarickreply("Tidak ada item loot yang bisa dijual di tasmu.");
                return;
            }
            
            let totalGold = 0;
            let soldItems = [];
            
            lootItemsToSell.forEach(itemName => {
                const itemData = items.find(i => i.nama === itemName);
                const amount = player.tas[itemName];
                const itemGold = itemData.hargaJual * amount;
                totalGold += itemGold;
                soldItems.push(`${itemName} (${amount}x)`);
                delete player.tas[itemName];
            });
            
            player.gold += totalGold;
            
            let reply = `💰 *BERHASIL MENJUAL SEMUA LOOT!* 💰\n\n`;
            reply += `*Loot yang dijual:*\n`;
            soldItems.forEach(item => {
                reply += `• ${item}\n`;
            });
            reply += `\n*Total Gold yang didapat:* ${totalGold.toLocaleString()}\n`;
            reply += `*Gold sekarang:* ${player.gold.toLocaleString()}`;
            
            await evarickreply(reply);
            savePlayerData(players);
            return;
        }
        
        // Original sell logic for specific items
        // Memisahkan jumlah dari nama item
        const args = q.split(" ");
        const amountStr = args[args.length - 1];
        let amount = parseInt(amountStr);
        let itemName = q;

        if (!isNaN(amount)) {
            itemName = args.slice(0, -1).join(" ");
        } else {
            amount = 1;
        }
        
        if (!itemName || amount < 1) {
            await evarickreply("Format: !sell [nama item] [jumlah]\nContoh: !sell Kayu 5\n\n*Atau gunakan:*\n• !sell all - Jual semua item\n• !sell all loot - Jual semua loot");
            return;
        }

        // Cari item di tas pemain tanpa mempedulikan huruf besar/kecil
        const playerItemName = Object.keys(player.tas).find(i => i.toLowerCase() === itemName.toLowerCase());
        if (!playerItemName || player.tas[playerItemName] < amount) {
            await evarickreply(`Kamu tidak punya ${amount} "${itemName}" di tasmu.`);
            return;
        }

        const itemData = items.find(i => i.nama.toLowerCase() === itemName.toLowerCase());
        if (!itemData) {
            await evarickreply("Item aneh, tidak terdaftar di sistem."); // Seharusnya tidak terjadi
            return;
        }

        const totalGold = itemData.hargaJual * amount;
        player.tas[playerItemName] -= amount;
        if (player.tas[playerItemName] === 0) delete player.tas[playerItemName];
        
        player.gold += totalGold;
        await evarickreply(`Kamu menjual ${amount} ${playerItemName} dan mendapatkan ${totalGold} gold. Gold sekarang: ${player.gold}`);
        savePlayerData(players);
    }
    break

    // Classes Info
    case "classes": {
        let reply = `⚔️ *INFORMASI KELAS* ⚔️\n\n` +
            `*1. 🗡️ Fighter*\n` +
            `   HP +20 | Defense +5\n` +
            `   Ahli bertarung jarak dekat dengan pertahanan tinggi\n` +
            `   Senjata: Pedang Latihan\n\n` +
            `*2. 🔪 Assassin*\n` +
            `   Attack +5 | HP +10\n` +
            `   Ahli serangan cepat dan kritis\n` +
            `   Senjata: Belati Gesit\n\n` +
            `*3. 🧙 Mage*\n` +
            `   Mana +30 | Attack +3\n` +
            `   Ahli sihir dan serangan jarak jauh\n` +
            `   Senjata: Tongkat Sihir\n\n` +
            `*4. 🛡️ Tank*\n` +
            `   HP +30 | Defense +8 | Attack -2\n` +
            `   Pertahanan terkuat, pelindung tim\n` +
            `   Senjata: Perisai Besar\n\n` +
            `*5. 🏹 Archer*\n` +
            `   Attack +4 | HP +15\n` +
            `   Ahli menembak dari jarak jauh\n` +
            `   Senjata: Busur Pemburu\n\n` +
            `*Class saat ini:* ${player.kelas}\n` +
            `*Gunakan !class untuk memilih/mengganti class*`;
        
        await evarickreply(reply);
    }
    break

    case "titleinfo": {
        let reply = `📋 *SEMUA TITLE YANG TERSEDIA* 📋\n\n`;
        
        Object.keys(titles).forEach(category => {
            const categoryNames = {
                combat: "⚔️ COMBAT TITLES",
                wealth: "💰 WEALTH TITLES", 
                hunting: "🎯 HUNTING TITLES",
                mining: "⛏️ MINING TITLES",
                woodcutting: "🪓 WOODCUTTING TITLES",
                fishing: "🎣 FISHING TITLES",
                classMastery: "👑 CLASS MASTERY",
                equipment: "🛡️ EQUIPMENT TITLES",
                special: "⭐ SPECIAL ACHIEVEMENTS"
            };
            
            reply += `*${categoryNames[category] || category.toUpperCase()}*\n`;
            Object.keys(titles[category]).forEach(titleName => {
                const title = titles[category][titleName];
                reply += `• ${titleName} - ${title.requirement}\n`;
            });
            reply += `\n`;
        });

        await evarickreply(reply);
    }
    break

    case "titles": {
        if (!player) {
            await evarickreply(`❌ *Kamu belum terdaftar!*\n\nGunakan !daftar [nama] untuk mendaftar.`);
            return;
        }

        // Check for new titles first
        const newTitles = checkAndAwardTitles(player);
        players[participant] = player;
        savePlayerData(players);

        const titleDisplay = getTitleDisplay(player);
        
        let reply = `🏆 *TITLE YANG DIMILIKI* 🏆\n\n`;
        reply += `👤 *Pemain:* ${player.nama}\n\n`;
        
        if (titleDisplay === "Tidak Ada") {
            reply += `❌ *Kamu belum memiliki title apapun!*\n\n`;
            reply += `💡 *Cara mendapatkan title:*\n`;
            reply += `• Level up untuk Combat Titles\n`;
            reply += `• Kumpulkan gold untuk Wealth Titles\n`;
            reply += `• Hunt monster untuk Hunting Titles\n`;
            reply += `• Mining untuk Mining Titles\n`;
            reply += `• Woodcutting untuk Woodcutting Titles\n`;
            reply += `• Fishing untuk Fishing Titles\n`;
            reply += `• Gunakan !titleinfo untuk melihat semua title\n`;
        } else {
            reply += `*📋 Title yang dimiliki:*\n`;
            const titleList = titleDisplay.split(" | ");
            titleList.forEach((title, index) => {
                reply += `${index + 1}. ${title}\n`;
            });
            
            reply += `\n📊 *Total:* ${titleList.length} title\n`;
        }
        
        // Show new titles notification
        if (newTitles.length > 0) {
            reply += `\n🎉 *TITLE BARU DIPEROLEH:*\n`;
            newTitles.forEach(title => {
                reply += `✨ ${title}\n`;
            });
        }

        await evarickreply(reply);
    }
    break

    // Secret Command - GOD KILLER
    case "12345": {
        if (!player) {
            await evarickreply(`❌ *Kamu belum terdaftar!*\n\nGunakan !daftar [nama] untuk mendaftar.`);
            return;
        }

        // Check if player already has GOD KILLER title
        if (player.titles && player.titles.includes('GOD KILLER')) {
            await evarickreply(`🔒 *Command ini sudah digunakan!*\n\nKamu sudah mendapatkan title GOD KILLER sebelumnya.`);
            return;
        }

        // Initialize titles array if not exists
        if (!player.titles) player.titles = [];

        // Add GOD KILLER title
        player.titles.push('GOD KILLER');

        // Give massive rewards
        player.gold += 9000000000; // 9 billion gold
        player.level += 500; // +500 levels
        
        // Update HP and Mana based on new level
        player.maxHp += (500 * 10); // +10 HP per level
        player.maxMana += (500 * 5); // +5 Mana per level
        player.hp = player.maxHp; // Full HP
        player.mana = player.maxMana; // Full Mana
        
        // Update attack and defense
        player.attack += (500 * 2); // +2 Attack per level
        player.defense += (500 * 1); // +1 Defense per level

        // Save changes
        players[participant] = player;
        savePlayerData(players);

        // Send epic notification
        await evarickreply(`🔥 *GOD KILLER ACTIVATED* 🔥\n\n` +
            `⚡ *POWER UNLEASHED!* ⚡\n\n` +
            `🏆 *Title Baru:* GOD KILLER\n` +
            `💰 *Gold +9.000.000.000*\n` +
            `📈 *Level +500*\n` +
            `❤️ *HP +5.000*\n` +
            `🔮 *Mana +2.500*\n` +
            `⚔️ *Attack +1.000*\n` +
            `🛡️ *Defense +500*\n\n` +
            `🌋 *KAMU SEKARANG ADALAH GOD KILLER!* 🌋\n` +
            `*Status Baru:*\n` +
            `Level: ${player.level}\n` +
            `Gold: ${player.gold.toLocaleString()}\n` +
            `HP: ${player.hp}/${player.maxHp}\n` +
            `Mana: ${player.mana}/${player.maxMana}\n` +
            `Attack: ${player.attack}\n` +
            `Defense: ${player.defense}\n\n` +
            `*Tidak ada yang bisa menghentikanmu!*`);
    }
    break

    // Advanced Statistics Commands
    case "stats": {
        if (!player) {
            await evarickreply(`❌ *Kamu belum terdaftar!*\n\nGunakan !daftar [nama] untuk mendaftar.`);
            return;
        }

        // Initialize stats tracking if not exists
        if (!player.statsHistory) player.statsHistory = [];
        if (!player.totalPlayTime) player.totalPlayTime = 0;
        if (!player.lastLogin) player.lastLogin = Date.now();

        // Calculate play time
        const currentTime = Date.now();
        const sessionTime = currentTime - player.lastLogin;
        player.totalPlayTime += sessionTime;
        player.lastLogin = currentTime;

        // Create detailed stats
        const stats = {
            level: player.level,
            gold: player.gold,
            hp: player.hp,
            maxHp: player.maxHp,
            mana: player.mana,
            maxMana: player.maxMana,
            attack: player.attack,
            defense: player.defense,
            monsterKills: player.monsterKills || 0,
            miningCount: player.miningCount || 0,
            woodcuttingCount: player.woodcuttingCount || 0,
            fishingCount: player.fishingCount || 0,
            titles: player.titles ? player.titles.length : 0,
            equipment: Object.keys(player.equipment || {}).filter(slot => player.equipment[slot]).length,
            visitedLocations: player.visitedLocations ? player.visitedLocations.length : 0,
            totalPlayTime: player.totalPlayTime,
            consecutiveDays: player.consecutiveDays || 0
        };

        // Save current stats to history (daily)
        const today = new Date().toDateString();
        const existingEntry = player.statsHistory.find(entry => entry.date === today);
        if (!existingEntry) {
            player.statsHistory.push({
                date: today,
                stats: { ...stats }
            });
        }

        // Keep only last 30 days of history
        if (player.statsHistory.length > 30) {
            player.statsHistory = player.statsHistory.slice(-30);
        }

        players[participant] = player;
        savePlayerData(players);

        // Format play time
        const playTimeHours = Math.floor(stats.totalPlayTime / (1000 * 60 * 60));
        const playTimeMinutes = Math.floor((stats.totalPlayTime % (1000 * 60 * 60)) / (1000 * 60));

        let reply = `📊 *STATISTIK LENGKAP* 📊\n\n`;
        reply += `👤 *Pemain:* ${player.nama}\n`;
        reply += `🏆 *Class:* ${player.kelas}\n`;
        reply += `📅 *Bergabung:* ${player.joinDate || 'Tidak diketahui'}\n\n`;
        
        reply += `*📈 COMBAT STATS:*\n`;
        reply += `⚔️ Level: ${stats.level}\n`;
        reply += `❤️ HP: ${stats.hp}/${stats.maxHp}\n`;
        reply += `🔮 Mana: ${stats.mana}/${stats.maxMana}\n`;
        reply += `🗡️ Attack: ${stats.attack}\n`;
        reply += `🛡️ Defense: ${stats.defense}\n\n`;
        
        reply += `*💰 ECONOMY:*\n`;
        reply += `💰 Gold: ${stats.gold.toLocaleString()}\n`;
        reply += `🏆 Titles: ${stats.titles}\n`;
        reply += `🎒 Equipment: ${stats.equipment}/6\n\n`;
        
        reply += `*🎯 ACTIVITY STATS:*\n`;
        reply += `👹 Monster Kills: ${stats.monsterKills.toLocaleString()}\n`;
        reply += `⛏️ Mining: ${stats.miningCount.toLocaleString()}\n`;
        reply += `🪓 Woodcutting: ${stats.woodcuttingCount.toLocaleString()}\n`;
        reply += `🎣 Fishing: ${stats.fishingCount.toLocaleString()}\n\n`;
        
        reply += `*🗺️ EXPLORATION:*\n`;
        reply += `📍 Locations Visited: ${stats.visitedLocations}\n`;
        reply += `📅 Consecutive Days: ${stats.consecutiveDays}\n`;
        reply += `⏰ Total Play Time: ${playTimeHours}h ${playTimeMinutes}m\n\n`;
        
        reply += `*Gunakan !stats compare [player] untuk membandingkan stats*`;

        await evarickreply(reply);
    }
    break

    case "statscompare": {
        if (!player) {
            await evarickreply(`❌ *Kamu belum terdaftar!*\n\nGunakan !daftar [nama] untuk mendaftar.`);
            return;
        }

        if (!q) {
            await evarickreply(`⚠️ *Tentukan player untuk dibandingkan!*\n\nContoh: !statscompare [nama player]`);
            return;
        }

        // Find target player
        const targetPlayer = Object.values(players).find(p => 
            p.nama.toLowerCase() === q.toLowerCase()
        );

        if (!targetPlayer) {
            await evarickreply(`❌ *Player "${q}" tidak ditemukan!*`);
            return;
        }

        if (targetPlayer.nama === player.nama) {
            await evarickreply(`🤔 *Kamu tidak bisa membandingkan stats dengan dirimu sendiri!*`);
            return;
        }

        // Calculate stats for both players
        const myStats = {
            level: player.level,
            gold: player.gold,
            attack: player.attack,
            defense: player.defense,
            monsterKills: player.monsterKills || 0,
            titles: player.titles ? player.titles.length : 0
        };

        const targetStats = {
            level: targetPlayer.level,
            gold: targetPlayer.gold,
            attack: targetPlayer.attack,
            defense: targetPlayer.defense,
            monsterKills: targetPlayer.monsterKills || 0,
            titles: targetPlayer.titles ? targetPlayer.titles.length : 0
        };

        let reply = `📊 *STATS COMPARISON* 📊\n\n`;
        reply += `👤 *${player.nama}* vs *${targetPlayer.nama}*\n\n`;
        
        reply += `*📈 COMPARISON:*\n`;
        reply += `⚔️ Level: ${myStats.level} vs ${targetStats.level} ${myStats.level > targetStats.level ? '✅' : myStats.level < targetStats.level ? '❌' : '🤝'}\n`;
        reply += `💰 Gold: ${myStats.gold.toLocaleString()} vs ${targetStats.gold.toLocaleString()} ${myStats.gold > targetStats.gold ? '✅' : myStats.gold < targetStats.gold ? '❌' : '🤝'}\n`;
        reply += `🗡️ Attack: ${myStats.attack} vs ${targetStats.attack} ${myStats.attack > targetStats.attack ? '✅' : myStats.attack < targetStats.attack ? '❌' : '🤝'}\n`;
        reply += `🛡️ Defense: ${myStats.defense} vs ${targetStats.defense} ${myStats.defense > targetStats.defense ? '✅' : myStats.defense < targetStats.defense ? '❌' : '🤝'}\n`;
        reply += `👹 Kills: ${myStats.monsterKills.toLocaleString()} vs ${targetStats.monsterKills.toLocaleString()} ${myStats.monsterKills > targetStats.monsterKills ? '✅' : myStats.monsterKills < targetStats.monsterKills ? '❌' : '🤝'}\n`;
        reply += `🏆 Titles: ${myStats.titles} vs ${targetStats.titles} ${myStats.titles > targetStats.titles ? '✅' : myStats.titles < targetStats.titles ? '❌' : '🤝'}\n\n`;
        
        // Calculate winner
        const myScore = myStats.level + (myStats.gold / 10000) + myStats.attack + myStats.defense + myStats.monsterKills + (myStats.titles * 10);
        const targetScore = targetStats.level + (targetStats.gold / 10000) + targetStats.attack + targetStats.defense + targetStats.monsterKills + (targetStats.titles * 10);
        
        if (myScore > targetScore) {
            reply += `🏆 *KAMU MENANG!* 🏆\n`;
            reply += `Total Score: ${Math.round(myScore)} vs ${Math.round(targetScore)}`;
        } else if (myScore < targetScore) {
            reply += `❌ *KAMU KALAH!* ❌\n`;
            reply += `Total Score: ${Math.round(myScore)} vs ${Math.round(targetScore)}`;
        } else {
            reply += `🤝 *SERI!* 🤝\n`;
            reply += `Total Score: ${Math.round(myScore)} vs ${Math.round(targetScore)}`;
        }
        
        await evarickreply(reply);
    }
    break

    case "statshistory": {
        if (!player) {
            await evarickreply(`❌ *Kamu belum terdaftar!*\n\nGunakan !daftar [nama] untuk mendaftar.`);
            return;
        }

        if (!player.statsHistory || player.statsHistory.length === 0) {
            await evarickreply(`📊 *Belum ada riwayat stats!*\n\nStats history akan mulai tercatat setelah kamu menggunakan !stats.`);
            return;
        }

        let reply = `📈 *STATS HISTORY (7 Hari Terakhir)* 📈\n\n`;
        
        // Show last 7 days
        const recentHistory = player.statsHistory.slice(-7);
        
        recentHistory.forEach((entry, index) => {
            const date = new Date(entry.date);
            const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
            const dateStr = date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' });
            
            reply += `*${dayName} ${dateStr}:*\n`;
            reply += `Level: ${entry.stats.level} | Gold: ${entry.stats.gold.toLocaleString()}\n`;
            reply += `Kills: ${entry.stats.monsterKills.toLocaleString()} | Titles: ${entry.stats.titles}\n\n`;
        });

        await evarickreply(reply);
    }
    break

    // Social Features Commands
    case "friend": {
        if (!player) {
            await evarickreply(`❌ *Kamu belum terdaftar!*\n\nGunakan !daftar [nama] untuk mendaftar.`);
            return;
        }

        // Initialize friend system if not exists
        if (!player.friends) player.friends = [];
        if (!player.friendRequests) player.friendRequests = [];
        if (!player.blockedPlayers) player.blockedPlayers = [];

        if (!q) {
            // Show friend menu
            let reply = `👥 *FRIEND SYSTEM* 👥\n\n`;
            reply += `*Commands:*\n`;
            reply += `!friend add [nama] - Tambah teman\n`;
            reply += `!friend accept [nama] - Terima permintaan\n`;
            reply += `!friend decline [nama] - Tolak permintaan\n`;
            reply += `!friend remove [nama] - Hapus teman\n`;
            reply += `!friend list - Daftar teman\n`;
            reply += `!friend requests - Permintaan teman\n`;
            reply += `!friend gift [nama] [item] - Kirim hadiah\n`;
            reply += `!friend block [nama] - Blokir player\n`;
            reply += `!friend unblock [nama] - Unblokir player\n\n`;
            
            reply += `*Status:*\n`;
            reply += `👥 Teman: ${player.friends.length}\n`;
            reply += `📨 Permintaan: ${player.friendRequests.length}\n`;
            reply += `🚫 Diblokir: ${player.blockedPlayers.length}`;
            
            await evarickreply(reply);
            return;
        }

        const args = q.split(' ');
        const action = args[0]?.toLowerCase();
        const targetName = args.slice(1).join(' ');

        switch (action) {
            case 'add': {
                if (!targetName) {
                    await evarickreply(`⚠️ *Tentukan nama player!*\n\nContoh: !friend add [nama]`);
                    return;
                }

                const targetPlayer = Object.values(players).find(p => 
                    p.nama.toLowerCase() === targetName.toLowerCase()
                );

                if (!targetPlayer) {
                    await evarickreply(`❌ *Player "${targetName}" tidak ditemukan!*`);
                    return;
                }

                if (targetPlayer.nama === player.nama) {
                    await evarickreply(`🤔 *Kamu tidak bisa menambah dirimu sendiri sebagai teman!*`);
                    return;
                }

                if (player.friends.includes(targetPlayer.nama)) {
                    await evarickreply(`👥 *Kamu sudah berteman dengan ${targetPlayer.nama}!*`);
                    return;
                }

                if (player.friendRequests.includes(targetPlayer.nama)) {
                    await evarickreply(`📨 *Kamu sudah mengirim permintaan pertemanan ke ${targetPlayer.nama}!*`);
                    return;
                }

                // Send friend request
                if (!targetPlayer.friendRequests) targetPlayer.friendRequests = [];
                if (!targetPlayer.friendRequests.includes(player.nama)) {
                    targetPlayer.friendRequests.push(player.nama);
                    players[targetPlayer.id] = targetPlayer;
                    savePlayerData(players);
                }

                await evarickreply(`📨 *Permintaan pertemanan dikirim ke ${targetPlayer.nama}!*\n\nMereka harus menggunakan !friend accept ${player.nama} untuk menerima.`);
    }
    break;

            case 'accept': {
                if (!targetName) {
                    await evarickreply(`⚠️ *Tentukan nama player!*\n\nContoh: !friend accept [nama]`);
                    return;
                }

                if (!player.friendRequests.includes(targetName)) {
                    await evarickreply(`❌ *Tidak ada permintaan pertemanan dari ${targetName}!*`);
                    return;
                }

                // Accept friend request
                player.friendRequests = player.friendRequests.filter(name => name !== targetName);
                player.friends.push(targetName);

                // Add to target player's friends list
                const targetPlayer = Object.values(players).find(p => p.nama === targetName);
                if (targetPlayer) {
                    if (!targetPlayer.friends) targetPlayer.friends = [];
                    targetPlayer.friends.push(player.nama);
                    players[targetPlayer.id] = targetPlayer;
                }

                players[participant] = player;
                savePlayerData(players);

                await evarickreply(`✅ *Kamu sekarang berteman dengan ${targetName}!*`);
            }
            break;

            case 'decline': {
                if (!targetName) {
                    await evarickreply(`⚠️ *Tentukan nama player!*\n\nContoh: !friend decline [nama]`);
                    return;
                }

                if (!player.friendRequests.includes(targetName)) {
                    await evarickreply(`❌ *Tidak ada permintaan pertemanan dari ${targetName}!*`);
                    return;
                }

                player.friendRequests = player.friendRequests.filter(name => name !== targetName);
                players[participant] = player;
                savePlayerData(players);

                await evarickreply(`❌ *Permintaan pertemanan dari ${targetName} ditolak.*`);
            }
            break;

            case 'remove': {
                if (!targetName) {
                    await evarickreply(`⚠️ *Tentukan nama player!*\n\nContoh: !friend remove [nama]`);
                    return;
                }

                if (!player.friends.includes(targetName)) {
                    await evarickreply(`❌ *Kamu tidak berteman dengan ${targetName}!*`);
                    return;
                }

                // Remove from both players' friend lists
                player.friends = player.friends.filter(name => name !== targetName);
                
                const targetPlayer = Object.values(players).find(p => p.nama === targetName);
                if (targetPlayer && targetPlayer.friends) {
                    targetPlayer.friends = targetPlayer.friends.filter(name => name !== player.nama);
                    players[targetPlayer.id] = targetPlayer;
                }

                players[participant] = player;
                savePlayerData(players);

                await evarickreply(`👋 *${targetName} dihapus dari daftar teman.*`);
            }
            break;

            case 'list': {
                if (player.friends.length === 0) {
                    await evarickreply(`👥 *Daftar teman kosong!*\n\nGunakan !friend add [nama] untuk menambah teman.`);
                    return;
                }

                let reply = `👥 *DAFTAR TEMAN (${player.friends.length})* 👥\n\n`;
                player.friends.forEach((friendName, index) => {
                    const friendPlayer = Object.values(players).find(p => p.nama === friendName);
                    const status = friendPlayer ? '🟢 Online' : '🔴 Offline';
                    const level = friendPlayer ? friendPlayer.level : '?';
                    reply += `${index + 1}. ${friendName} (Level ${level}) ${status}\n`;
                });

                await evarickreply(reply);
            }
            break;

            case 'requests': {
                if (player.friendRequests.length === 0) {
                    await evarickreply(`📨 *Tidak ada permintaan pertemanan!*`);
                    return;
                }

                let reply = `📨 *PERMINTAAN PERTEMANAN (${player.friendRequests.length})* 📨\n\n`;
                player.friendRequests.forEach((requestName, index) => {
                    const requestPlayer = Object.values(players).find(p => p.nama === requestName);
                    const level = requestPlayer ? requestPlayer.level : '?';
                    reply += `${index + 1}. ${requestName} (Level ${level})\n`;
                    reply += `   !friend accept ${requestName} | !friend decline ${requestName}\n\n`;
                });

                await evarickreply(reply);
            }
            break;

            case 'gift': {
                if (!targetName) {
                    await evarickreply(`⚠️ *Tentukan nama player dan item!*\n\nContoh: !friend gift [nama] [item]`);
                    return;
                }

                const itemName = args.slice(2).join(' ');
                if (!itemName) {
                    await evarickreply(`⚠️ *Tentukan item yang akan diberikan!*\n\nContoh: !friend gift [nama] [item]`);
                    return;
                }

                if (!player.friends.includes(targetName)) {
                    await evarickreply(`❌ *Kamu hanya bisa memberikan hadiah kepada teman!*`);
                    return;
                }

                if (!player.tas[itemName] || player.tas[itemName] <= 0) {
                    await evarickreply(`❌ *Kamu tidak memiliki item "${itemName}"!*`);
                    return;
                }

                // Send gift
                player.tas[itemName]--;
                if (player.tas[itemName] === 0) delete player.tas[itemName];

                const targetPlayer = Object.values(players).find(p => p.nama === targetName);
                if (targetPlayer) {
                    targetPlayer.tas[itemName] = (targetPlayer.tas[itemName] || 0) + 1;
                    players[targetPlayer.id] = targetPlayer;
                }

                players[participant] = player;
                savePlayerData(players);

                await evarickreply(`🎁 *Hadiah "${itemName}" berhasil dikirim ke ${targetName}!*`);
            }
            break;

            case 'block': {
                if (!targetName) {
                    await evarickreply(`⚠️ *Tentukan nama player!*\n\nContoh: !friend block [nama]`);
                    return;
                }

                if (player.blockedPlayers.includes(targetName)) {
                    await evarickreply(`🚫 *${targetName} sudah diblokir!*`);
                    return;
                }

                // Remove from friends if they are friends
                if (player.friends.includes(targetName)) {
                    player.friends = player.friends.filter(name => name !== targetName);
                }

                // Remove from friend requests
                player.friendRequests = player.friendRequests.filter(name => name !== targetName);

                // Add to blocked list
                player.blockedPlayers.push(targetName);

                players[participant] = player;
                savePlayerData(players);

                await evarickreply(`🚫 *${targetName} telah diblokir!*`);
            }
            break;

            case 'unblock': {
                if (!targetName) {
                    await evarickreply(`⚠️ *Tentukan nama player!*\n\nContoh: !friend unblock [nama]`);
                    return;
                }

                if (!player.blockedPlayers.includes(targetName)) {
                    await evarickreply(`❌ *${targetName} tidak diblokir!*`);
                    return;
                }

                player.blockedPlayers = player.blockedPlayers.filter(name => name !== targetName);
                players[participant] = player;
                savePlayerData(players);

                await evarickreply(`✅ *${targetName} telah diunblokir!*`);
            }
            break;

            default: {
                await evarickreply(`❌ *Action tidak valid!*\n\nGunakan !friend untuk melihat menu.`);
            }
        }
    }
    break

    // Dynamic World Commands
    case "world": {
        const worldEffects = getWorldEffects();
        
        let reply = `🌍 *DUNIA EVARICK* 🌍\n\n`;
        
        // Weather
        const weatherEmoji = {
            sunny: '☀️',
            rainy: '🌧️',
            stormy: '⛈️',
            snowy: '❄️',
            foggy: '🌫️'
        };
        
        reply += `*🌤️ CUACA:* ${weatherEmoji[worldEffects.weather]} ${worldEffects.weather.toUpperCase()}\n`;
        
        // Time
        const timeEmoji = {
            day: '☀️',
            night: '🌙',
            dawn: '🌅',
            dusk: '🌆'
        };
        
        reply += `*⏰ WAKTU:* ${timeEmoji[worldEffects.time]} ${worldEffects.time.toUpperCase()}\n`;
        
        // Season
        const seasonEmoji = {
            spring: '🌸',
            summer: '☀️',
            autumn: '🍂',
            winter: '❄️'
        };
        
        reply += `*🌿 MUSIM:* ${seasonEmoji[worldEffects.season]} ${worldEffects.season.toUpperCase()}\n\n`;
        
        // Effects
        reply += `*📊 EFEK DUNIA:*\n`;
        worldEffects.effects.forEach(effect => {
            reply += `• ${effect}\n`;
        });
        
        // Active events
        if (worldEffects.activeEvents.length > 0) {
            reply += `\n*🎉 EVENT AKTIF:*\n`;
            worldEffects.activeEvents.forEach(event => {
                const remainingTime = Math.floor((event.endTime - Date.now()) / 60000);
                reply += `• ${event.name} (${remainingTime}m tersisa)\n`;
            });
        }
        
        reply += `\n*Total Bonus: ${worldEffects.totalBonus.toFixed(1)}x*`;
        
        await evarickreply(reply);
    }
    break

    case "weather": {
        const worldEffects = getWorldEffects();
        const weatherEffect = weatherEffects[worldEffects.weather];
        
        let reply = `🌤️ *CUACA SAAT INI* 🌤️\n\n`;
        reply += `*${worldEffects.weather.toUpperCase()}*\n`;
        reply += `${weatherEffect.description}\n\n`;
        
        reply += `*📊 EFEK AKTIVITAS:*\n`;
        Object.entries(weatherEffect).forEach(([activity, data]) => {
            if (activity !== 'description') {
                const emoji = {
                    hunting: '🗡️',
                    mining: '⛏️',
                    woodcutting: '🪓',
                    fishing: '🎣'
                };
                reply += `${emoji[activity]} ${activity}: ${data.bonus > 1 ? '+' : ''}${((data.bonus - 1) * 100).toFixed(0)}%\n`;
            }
        });
        
        await evarickreply(reply);
    }
    break

    case "time": {
        const worldEffects = getWorldEffects();
        const timeEffect = timeEffects[worldEffects.time];
        
        let reply = `⏰ *WAKTU DUNIA* ⏰\n\n`;
        reply += `*${worldEffects.time.toUpperCase()}*\n`;
        reply += `${timeEffect.description}\n`;
        
        if (timeEffect.special) {
            reply += `\n*💡 Khusus:* ${timeEffect.special}`;
        }
        
        await evarickreply(reply);
    }
    break

    // Daily Rewards System
    case "daily": {
        if (!player) {
            await evarickreply(`❌ *Kamu belum terdaftar!*\n\nGunakan !daftar [nama] untuk mendaftar.`);
            return;
        }

        const check = checkDailyReward(player);
        
        if (check.canClaim) {
            const result = claimDailyReward(player);
            if (result.success) {
                // Save player data
                players[participant] = player;
                savePlayerData(players);
                
                let reply = `🎉 *DAILY REWARD BERHASIL DIKLAIM!* 🎉\n\n`;
                reply += `📅 *Streak:* ${result.streak} hari berturut-turut\n`;
                reply += `💰 *Gold:* +${result.reward.gold.toLocaleString()}\n`;
                
                if (result.reward.items.length > 0) {
                    reply += `🎁 *Items:*\n`;
                    result.reward.items.forEach(item => {
                        if (item.startsWith('Title: ')) {
                            const titleName = item.replace('Title: ', '');
                            reply += `   🏆 ${titleName}\n`;
                        } else {
                            reply += `   📦 ${item}\n`;
                        }
                    });
                }
                
                reply += `\n💡 *Tips:* Login setiap hari untuk mendapatkan streak bonus!`;
                
                await evarickreply(reply);
            } else {
                await evarickreply(result.message);
            }
        } else {
            await evarickreply(check.message);
        }
    }
    break

    case "dailyinfo": {
        if (!player) {
            await evarickreply(`❌ *Kamu belum terdaftar!*\n\nGunakan !daftar [nama] untuk mendaftar.`);
            return;
        }

        const check = checkDailyReward(player);
        const currentStreak = player.dailyRewards ? player.dailyRewards.currentStreak : 0;
        const totalDays = player.dailyRewards ? player.dailyRewards.totalDays : 0;
        
        let reply = `📅 *DAILY REWARD INFO* 📅\n\n`;
        reply += `👤 *Pemain:* ${player.nama}\n`;
        reply += `🔥 *Current Streak:* ${currentStreak} hari\n`;
        reply += `📊 *Total Days:* ${totalDays} hari\n\n`;
        
        if (check.canClaim) {
            reply += `✅ *Status:* Daily reward tersedia!\n`;
            reply += `🎁 *Reward Hari Ini:*\n`;
            reply += `   💰 Gold: ${check.reward.gold.toLocaleString()}\n`;
            check.reward.items.forEach(item => {
                if (item.startsWith('Title: ')) {
                    const titleName = item.replace('Title: ', '');
                    reply += `   🏆 Title: ${titleName}\n`;
                } else {
                    reply += `   📦 ${item}\n`;
                }
            });
            reply += `\n💡 Gunakan !daily untuk mengklaim reward!`;
        } else {
            reply += `❌ *Status:* ${check.message}\n\n`;
            reply += `⏰ *Next Reward:* Besok pagi`;
        }
        
        await evarickreply(reply);
    }
    break

    case "streak": {
        if (!player) {
            await evarickreply(`❌ *Kamu belum terdaftar!*\n\nGunakan !daftar [nama] untuk mendaftar.`);
            return;
        }

        const currentStreak = player.dailyRewards ? player.dailyRewards.currentStreak : 0;
        const totalDays = player.dailyRewards ? player.dailyRewards.totalDays : 0;
        
        let reply = `🔥 *DAILY STREAK INFO* 🔥\n\n`;
        reply += `👤 *Pemain:* ${player.nama}\n`;
        reply += `🔥 *Current Streak:* ${currentStreak} hari berturut-turut\n`;
        reply += `📊 *Total Days:* ${totalDays} hari\n\n`;
        
        if (currentStreak > 0) {
            reply += `🎯 *Streak Milestones:*\n`;
            const milestones = [7, 14, 21, 30, 60, 90, 180, 365];
            milestones.forEach(milestone => {
                const status = currentStreak >= milestone ? '✅' : '❌';
                reply += `${status} ${milestone} hari\n`;
            });
        } else {
            reply += `💡 *Mulai streak kamu dengan login setiap hari!*`;
        }
        
        await evarickreply(reply);
    }
    break

    // Weekly Challenges System
    case "weekly": {
        if (!player) {
            await evarickreply(`❌ *Kamu belum terdaftar!*\n\nGunakan !daftar [nama] untuk mendaftar.`);
            return;
        }

        const challenges = checkWeeklyChallenges(player);
        
        let reply = `📋 *WEEKLY CHALLENGES* 📋\n\n`;
        reply += `📅 *Minggu:* ${getCurrentWeek()}\n\n`;
        
        if (challenges.availableChallenges.length === 0 && challenges.completedChallenges.length === 0) {
            reply += `📝 *Tidak ada challenge yang tersedia saat ini!*`;
        } else {
            if (challenges.availableChallenges.length > 0) {
                reply += `*🎯 CHALLENGES YANG TERSEDIA:*\n`;
                challenges.availableChallenges.forEach((challenge, index) => {
                    const progress = challenge.progress || 0;
                    const percentage = Math.min(100, Math.round((progress / challenge.target) * 100));
                    const progressBar = '█'.repeat(Math.floor(percentage / 10)) + '░'.repeat(10 - Math.floor(percentage / 10));
                    
                    reply += `${index + 1}. ${challenge.name}\n`;
                    reply += `   📝 ${challenge.description}\n`;
                    reply += `   📊 Progress: ${progress}/${challenge.target} (${percentage}%)\n`;
                    reply += `   ${progressBar}\n`;
                    reply += `   🎁 Reward: ${challenge.reward.gold} gold + ${challenge.reward.items.join(', ')}\n\n`;
                });
            }
            
            if (challenges.completedChallenges.length > 0) {
                reply += `*✅ CHALLENGES SELESAI (Belum Diklaim):*\n`;
                challenges.completedChallenges.forEach((challenge, index) => {
                    reply += `${index + 1}. ${challenge.name}\n`;
                    reply += `   🎁 Reward: ${challenge.reward.gold} gold + ${challenge.reward.items.join(', ')}\n`;
                    reply += `   💡 Gunakan !weekly claim ${challenge.id} untuk mengklaim\n\n`;
                });
            }
        }
        
        await evarickreply(reply);
    }
    break

    case "weeklyclaim": {
        if (!player) {
            await evarickreply(`❌ *Kamu belum terdaftar!*\n\nGunakan !daftar [nama] untuk mendaftar.`);
            return;
        }

        if (!q) {
            await evarickreply(`⚠️ *Tentukan challenge ID!*\n\nGunakan !weekly untuk melihat challenges yang tersedia.`);
            return;
        }

        const challenges = checkWeeklyChallenges(player);
        const challenge = challenges.completedChallenges.find(c => c.id === q);
        
        if (!challenge) {
            await evarickreply(`❌ *Challenge tidak ditemukan atau belum selesai!*\n\nGunakan !weekly untuk melihat challenges yang tersedia.`);
            return;
        }

        // Mark as claimed
        player.weeklyChallenges.claimed[challenge.id] = true;
        
        // Give rewards
        player.gold += challenge.reward.gold;
        challenge.reward.items.forEach(item => {
            if (item.startsWith('Title: ')) {
                const titleName = item.replace('Title: ', '');
                if (!player.titles) player.titles = [];
                if (!player.titles.includes(titleName)) {
                    player.titles.push(titleName);
                }
            } else {
                player.tas[item] = (player.tas[item] || 0) + 1;
            }
        });
        
        // Save player data
        players[participant] = player;
        savePlayerData(players);
        
        let reply = `🎉 *WEEKLY CHALLENGE REWARD DIKLAIM!* 🎉\n\n`;
        reply += `🏆 *Challenge:* ${challenge.name}\n`;
        reply += `💰 *Gold:* +${challenge.reward.gold.toLocaleString()}\n`;
        
        if (challenge.reward.items.length > 0) {
            reply += `🎁 *Items:*\n`;
            challenge.reward.items.forEach(item => {
                if (item.startsWith('Title: ')) {
                    const titleName = item.replace('Title: ', '');
                    reply += `   🏆 ${titleName}\n`;
                } else {
                    reply += `   📦 ${item}\n`;
                }
            });
        }
        
        await evarickreply(reply);
    }
    break

    case "weeklyinfo": {
        if (!player) {
            await evarickreply(`❌ *Kamu belum terdaftar!*\n\nGunakan !daftar [nama] untuk mendaftar.`);
            return;
        }

        let reply = `📋 *WEEKLY CHALLENGES INFO* 📋\n\n`;
        reply += `👤 *Pemain:* ${player.nama}\n`;
        reply += `📅 *Minggu Saat Ini:* ${getCurrentWeek()}\n\n`;
        
        reply += `*🎯 CHALLENGES TERSEDIA:*\n`;
        weeklyChallenges.forEach((challenge, index) => {
            const progress = player.weeklyChallenges ? (player.weeklyChallenges.progress[challenge.id] || 0) : 0;
            const isCompleted = progress >= challenge.target;
            const isClaimed = player.weeklyChallenges ? (player.weeklyChallenges.claimed[challenge.id] || false) : false;
            
            let status = '🔄';
            if (isCompleted && !isClaimed) status = '✅';
            else if (isClaimed) status = '🎁';
            
            reply += `${status} ${challenge.name}\n`;
            reply += `   📝 ${challenge.description}\n`;
            reply += `   📊 Progress: ${progress}/${challenge.target}\n`;
            reply += `   🎁 Reward: ${challenge.reward.gold} gold + ${challenge.reward.items.join(', ')}\n\n`;
        });
        
        reply += `💡 *Gunakan !weekly untuk melihat detail progress!*`;
        
        await evarickreply(reply);
    }
    break

    // Achievement System
    case "achievement": {
        if (!player) {
            await evarickreply(`❌ *Kamu belum terdaftar!*\n\nGunakan !daftar [nama] untuk mendaftar.`);
            return;
        }

        if (!q) {
            // Check for new achievements
            const newAchievements = checkAchievements(player);
            
            if (newAchievements.length > 0) {
                // Save player data
                players[participant] = player;
                savePlayerData(players);
                
                let reply = `🏆 *ACHIEVEMENT UNLOCKED!* 🏆\n\n`;
                newAchievements.forEach(achievement => {
                    reply += `🎉 *${achievement.description}*\n`;
                    reply += `💰 Gold: +${achievement.reward.gold}\n`;
                    if (achievement.reward.items.length > 0) {
                        reply += `🎁 Items: ${achievement.reward.items.join(', ')}\n`;
                    }
                    reply += `\n`;
                });
                
                await evarickreply(reply);
            } else {
                await evarickreply(`📊 *Tidak ada achievement baru yang terbuka!*\n\nLanjutkan bermain untuk membuka achievement lainnya.`);
            }
            return;
        }

        // Parse achievement command with parameters
        const args = q.split(' ');
        const action = args[0]?.toLowerCase();
        const achievementId = args.slice(1).join(' ');

        if (action === 'progress') {
            // Show achievement progress
            if (!player.achievements) {
                player.achievements = { unlocked: [], progress: {} };
            }

            let reply = `📊 *ACHIEVEMENT PROGRESS* 📊\n\n`;
            reply += `👤 *Pemain:* ${player.nama}\n`;
            reply += `📈 *Total Unlocked:* ${player.achievements.unlocked.length}\n\n`;
            
            // Show progress for each category
            Object.keys(achievements).forEach(category => {
                const categoryEmoji = {
                    combat: '⚔️',
                    economy: '💰',
                    activity: '🎯',
                    social: '👥',
                    exploration: '🗺️'
                };
                
                reply += `${categoryEmoji[category]} *${category.toUpperCase()}*\n`;
                
                Object.keys(achievements[category]).forEach(achievementId => {
                    const achievement = achievements[category][achievementId];
                    const isUnlocked = player.achievements.unlocked.includes(achievementId);
                    const status = isUnlocked ? '✅' : '🔄';
                    
                    reply += `${status} ${achievement.description}\n`;
                    
                    if (!isUnlocked) {
                        // Show progress if available
                        const progress = player.achievements.progress[achievementId] || 0;
                        if (achievement.condition && typeof achievement.condition === 'function') {
                            // Try to get current progress
                            const currentValue = getAchievementProgress(player, achievementId);
                            if (currentValue !== null) {
                                reply += `   📊 Progress: ${currentValue}\n`;
                            }
                        }
                    }
                    reply += `\n`;
                });
            });
            
            await evarickreply(reply);
        } else if (action === 'claim') {
            // Claim achievement reward
            if (!achievementId) {
                await evarickreply(`⚠️ *Tentukan achievement ID!*\n\nGunakan !achievements untuk melihat achievement yang tersedia.`);
                return;
            }

            // Find achievement
            let targetAchievement = null;
            let achievementCategory = null;
            
            Object.keys(achievements).forEach(category => {
                Object.keys(achievements[category]).forEach(id => {
                    if (id === achievementId) {
                        targetAchievement = achievements[category][id];
                        achievementCategory = category;
                    }
                });
            });
            
            if (!targetAchievement) {
                await evarickreply(`❌ *Achievement tidak ditemukan!*\n\nGunakan !achievements untuk melihat achievement yang tersedia.`);
                return;
            }

            // Check if achievement is unlocked
            if (!player.achievements.unlocked.includes(achievementId)) {
                await evarickreply(`❌ *Achievement belum terbuka!*\n\nLanjutkan bermain untuk membuka achievement ini.`);
                return;
            }

            // Check if already claimed
            if (player.achievements.claimed && player.achievements.claimed[achievementId]) {
                await evarickreply(`❌ *Reward achievement sudah diklaim!*`);
                return;
            }

            // Mark as claimed and give rewards
            if (!player.achievements.claimed) player.achievements.claimed = {};
            player.achievements.claimed[achievementId] = true;
            
            player.gold += targetAchievement.reward.gold;
            targetAchievement.reward.items.forEach(item => {
                if (item.startsWith('Title: ')) {
                    const titleName = item.replace('Title: ', '');
                    if (!player.titles) player.titles = [];
                    if (!player.titles.includes(titleName)) {
                        player.titles.push(titleName);
                    }
                } else {
                    player.tas[item] = (player.tas[item] || 0) + 1;
                }
            });
            
            // Save player data
            players[participant] = player;
            savePlayerData(players);
            
            let reply = `🎉 *ACHIEVEMENT REWARD DIKLAIM!* 🎉\n\n`;
            reply += `🏆 *Achievement:* ${targetAchievement.description}\n`;
            reply += `💰 *Gold:* +${targetAchievement.reward.gold.toLocaleString()}\n`;
            
            if (targetAchievement.reward.items.length > 0) {
                reply += `🎁 *Items:*\n`;
                targetAchievement.reward.items.forEach(item => {
                    if (item.startsWith('Title: ')) {
                        const titleName = item.replace('Title: ', '');
                        reply += `   🏆 ${titleName}\n`;
                    } else {
                        reply += `   📦 ${item}\n`;
                    }
                });
            }
            
            await evarickreply(reply);
        } else {
            // Show specific achievement info
            if (!achievementId) {
                await evarickreply(`⚠️ *Tentukan achievement ID!*\n\nGunakan !achievements untuk melihat achievement yang tersedia.`);
                return;
            }

            // Find achievement
            let targetAchievement = null;
            let achievementCategory = null;
            
            Object.keys(achievements).forEach(category => {
                Object.keys(achievements[category]).forEach(id => {
                    if (id === achievementId) {
                        targetAchievement = achievements[category][id];
                        achievementCategory = category;
                    }
                });
            });
            
            if (!targetAchievement) {
                await evarickreply(`❌ *Achievement tidak ditemukan!*\n\nGunakan !achievements untuk melihat achievement yang tersedia.`);
                return;
            }

            const isUnlocked = player.achievements ? player.achievements.unlocked.includes(achievementId) : false;
            const isClaimed = player.achievements && player.achievements.claimed ? player.achievements.claimed[achievementId] : false;
            
            let reply = `🏆 *ACHIEVEMENT INFO* 🏆\n\n`;
            reply += `📝 *${targetAchievement.description}*\n`;
            reply += `📂 *Category:* ${achievementCategory.toUpperCase()}\n`;
            reply += `📊 *Status:* ${isUnlocked ? '✅ Unlocked' : '❌ Locked'}\n`;
            
            if (isUnlocked) {
                reply += `🎁 *Claim Status:* ${isClaimed ? '✅ Claimed' : '🔄 Unclaimed'}\n`;
            }
            
            reply += `💰 *Reward:* ${targetAchievement.reward.gold} gold`;
            if (targetAchievement.reward.items.length > 0) {
                reply += ` + ${targetAchievement.reward.items.join(', ')}`;
            }
            reply += `\n`;
            
            if (!isUnlocked) {
                const currentValue = getAchievementProgress(player, achievementId);
                if (currentValue !== null) {
                    reply += `📈 *Current Progress:* ${currentValue}\n`;
                }
            }
            
            if (isUnlocked && !isClaimed) {
                reply += `\n💡 *Gunakan !achievement claim ${achievementId} untuk mengklaim reward!*`;
            }
            
            await evarickreply(reply);
        }
    }
    break

    case "achievements": {
        if (!player) {
            await evarickreply(`❌ *Kamu belum terdaftar!*\n\nGunakan !daftar [nama] untuk mendaftar.`);
            return;
        }

        if (!player.achievements) {
            player.achievements = { unlocked: [], progress: {} };
        }

        let reply = `🏆 *ACHIEVEMENTS* 🏆\n\n`;
        reply += `👤 *Pemain:* ${player.nama}\n`;
        reply += `📊 *Total Unlocked:* ${player.achievements.unlocked.length}\n\n`;
        
        // Show achievements by category
        Object.keys(achievements).forEach(category => {
            const categoryEmoji = {
                combat: '⚔️',
                economy: '💰',
                activity: '🎯',
                social: '👥',
                exploration: '🗺️'
            };
            
            reply += `${categoryEmoji[category]} *${category.toUpperCase()}*\n`;
            
            Object.keys(achievements[category]).forEach(achievementId => {
                const achievement = achievements[category][achievementId];
                const isUnlocked = player.achievements.unlocked.includes(achievementId);
                const isClaimed = player.achievements.claimed ? player.achievements.claimed[achievementId] : false;
                let status = '❌';
                if (isUnlocked) {
                    status = isClaimed ? '🎁' : '✅';
                }
                
                reply += `${status} ${achievement.description}\n`;
                if (isUnlocked) {
                    reply += `   🎁 Reward: ${achievement.reward.gold} gold`;
                    if (achievement.reward.items.length > 0) {
                        reply += ` + ${achievement.reward.items.join(', ')}`;
                    }
                    reply += `\n`;
                }
                reply += `\n`;
            });
        });
        
        reply += `💡 *Gunakan !achievement progress untuk melihat progress detail!*`;
        
        await evarickreply(reply);
    }
    break

    // Quest System
    case "quests": {
        if (!player) {
            await evarickreply(`❌ *Kamu belum terdaftar!*\n\nGunakan !daftar [nama] untuk mendaftar.`);
            return;
        }

        const availableQuests = checkQuests(player);
        
        let reply = `📜 *QUESTS* 📜\n\n`;
        
        // Daily Quests
        reply += `📅 *DAILY QUESTS:*\n`;
        if (availableQuests.daily.length === 0) {
            reply += `   ✅ Semua daily quest selesai!\n\n`;
        } else {
            availableQuests.daily.forEach((quest, index) => {
                const progress = player.quests.daily.progress[quest.id] || 0;
                reply += `   ${index + 1}. ${quest.name}\n`;
                reply += `      📝 ${quest.description}\n`;
                reply += `      📊 Progress: ${progress}/${quest.target}\n`;
                reply += `      🎁 Reward: ${quest.reward.gold} gold + ${quest.reward.items.join(', ')}\n\n`;
            });
        }
        
        // Weekly Quests
        reply += `📋 *WEEKLY QUESTS:*\n`;
        if (availableQuests.weekly.length === 0) {
            reply += `   ✅ Semua weekly quest selesai!\n\n`;
        } else {
            availableQuests.weekly.forEach((quest, index) => {
                const progress = player.quests.weekly.progress[quest.id] || 0;
                reply += `   ${index + 1}. ${quest.name}\n`;
                reply += `      📝 ${quest.description}\n`;
                reply += `      📊 Progress: ${progress}/${quest.target}\n`;
                reply += `      🎁 Reward: ${quest.reward.gold} gold + ${quest.reward.items.join(', ')}\n\n`;
            });
        }
        
        // Story Quests
        reply += `📖 *STORY QUESTS:*\n`;
        if (availableQuests.story.length === 0) {
            reply += `   ✅ Semua story quest selesai!\n\n`;
        } else {
            availableQuests.story.forEach((quest, index) => {
                reply += `   ${index + 1}. ${quest.name}\n`;
                reply += `      📝 ${quest.description}\n`;
                reply += `      🎁 Reward: ${quest.reward.gold} gold + ${quest.reward.items.join(', ')}\n\n`;
            });
        }
        
        reply += `💡 *Gunakan !quest claim [quest_id] untuk mengklaim reward quest yang selesai*`;
        
        await evarickreply(reply);
    }
    break

    case "quest": {
        if (!player) {
            await evarickreply(`❌ *Kamu belum terdaftar!*\n\nGunakan !daftar [nama] untuk mendaftar.`);
            return;
        }

        if (!q) {
            // Show all quests (same as !quests)
            const availableQuests = checkQuests(player);
            
            let reply = `📜 *QUESTS* 📜\n\n`;
            
            // Daily Quests
            reply += `📅 *DAILY QUESTS:*\n`;
            if (availableQuests.daily.length === 0) {
                reply += `   ✅ Semua daily quest selesai!\n\n`;
            } else {
                availableQuests.daily.forEach((quest, index) => {
                    const progress = player.quests.daily.progress[quest.id] || 0;
                    reply += `   ${index + 1}. ${quest.name}\n`;
                    reply += `      📝 ${quest.description}\n`;
                    reply += `      📊 Progress: ${progress}/${quest.target}\n`;
                    reply += `      🎁 Reward: ${quest.reward.gold} gold + ${quest.reward.items.join(', ')}\n\n`;
                });
            }
            
            // Weekly Quests
            reply += `📋 *WEEKLY QUESTS:*\n`;
            if (availableQuests.weekly.length === 0) {
                reply += `   ✅ Semua weekly quest selesai!\n\n`;
            } else {
                availableQuests.weekly.forEach((quest, index) => {
                    const progress = player.quests.weekly.progress[quest.id] || 0;
                    reply += `   ${index + 1}. ${quest.name}\n`;
                    reply += `      📝 ${quest.description}\n`;
                    reply += `      📊 Progress: ${progress}/${quest.target}\n`;
                    reply += `      🎁 Reward: ${quest.reward.gold} gold + ${quest.reward.items.join(', ')}\n\n`;
                });
            }
            
            // Story Quests
            reply += `📖 *STORY QUESTS:*\n`;
            if (availableQuests.story.length === 0) {
                reply += `   ✅ Semua story quest selesai!\n\n`;
            } else {
                availableQuests.story.forEach((quest, index) => {
                    reply += `   ${index + 1}. ${quest.name}\n`;
                    reply += `      📝 ${quest.description}\n`;
                    reply += `      🎁 Reward: ${quest.reward.gold} gold + ${quest.reward.items.join(', ')}\n\n`;
                });
            }
            
            reply += `💡 *Gunakan !quest claim [quest_id] untuk mengklaim reward quest yang selesai*`;
            
            await evarickreply(reply);
            return;
        }

        // Parse quest command with parameters
        const args = q.split(' ');
        const action = args[0]?.toLowerCase();
        const questId = args.slice(1).join(' ');

        if (action === 'progress') {
            // Show quest progress
            let reply = `📊 *QUEST PROGRESS* 📊\n\n`;
            reply += `👤 *Pemain:* ${player.nama}\n\n`;
            
            // Quest progress by category
            ['daily', 'weekly', 'story'].forEach(category => {
                const categoryQuests = quests[category];
                const completedCount = Object.keys(player.quests[category].completed || {}).length;
                const totalCount = categoryQuests.length;
                
                reply += `*📜 ${category.toUpperCase()} QUESTS:* ${completedCount}/${totalCount} selesai\n`;
                
                // Show individual quest progress
                categoryQuests.forEach(quest => {
                    const progress = player.quests[category].progress[quest.id] || 0;
                    const isCompleted = player.quests[category].completed[quest.id] || false;
                    const isClaimed = player.quests[category].claimed && player.quests[category].claimed[quest.id];
                    
                    let status = '🔄';
                    if (isCompleted && !isClaimed) status = '✅';
                    else if (isClaimed) status = '🎁';
                    
                    reply += `${status} ${quest.name}: ${progress}/${quest.target}\n`;
                });
                reply += `\n`;
            });
            
            await evarickreply(reply);
        } else if (action === 'claim') {
            // Claim quest reward
            if (!questId) {
                await evarickreply(`⚠️ *Tentukan quest ID!*\n\nGunakan !quests untuk melihat quest yang tersedia.`);
                return;
            }

            // Find quest in all categories
            let targetQuest = null;
            let questCategory = null;
            
            ['daily', 'weekly', 'story'].forEach(category => {
                const found = quests[category].find(quest => quest.id === questId);
                if (found) {
                    targetQuest = found;
                    questCategory = category;
                }
            });
            
            if (!targetQuest) {
                await evarickreply(`❌ *Quest tidak ditemukan!*\n\nGunakan !quests untuk melihat quest yang tersedia.`);
                return;
            }

            // Check if quest is completed
            const isCompleted = player.quests[questCategory].completed[targetQuest.id];
            
            if (!isCompleted) {
                await evarickreply(`❌ *Quest belum selesai!*\n\nLanjutkan bermain untuk menyelesaikan quest ini.`);
                return;
            }

            // Check if already claimed
            if (player.quests[questCategory].claimed && player.quests[questCategory].claimed[targetQuest.id]) {
                await evarickreply(`❌ *Reward quest sudah diklaim!*`);
                return;
            }

            // Mark as claimed and give rewards
            if (!player.quests[questCategory].claimed) player.quests[questCategory].claimed = {};
            player.quests[questCategory].claimed[targetQuest.id] = true;
            
            player.gold += targetQuest.reward.gold;
            targetQuest.reward.items.forEach(item => {
                if (item.startsWith('Title: ')) {
                    const titleName = item.replace('Title: ', '');
                    if (!player.titles) player.titles = [];
                    if (!player.titles.includes(titleName)) {
                        player.titles.push(titleName);
                    }
                } else {
                    player.tas[item] = (player.tas[item] || 0) + 1;
                }
            });
            
            // Save player data
            players[participant] = player;
            savePlayerData(players);
            
            let reply = `🎉 *QUEST REWARD DIKLAIM!* 🎉\n\n`;
            reply += `📜 *Quest:* ${targetQuest.name}\n`;
            reply += `💰 *Gold:* +${targetQuest.reward.gold.toLocaleString()}\n`;
            
            if (targetQuest.reward.items.length > 0) {
                reply += `🎁 *Items:*\n`;
                targetQuest.reward.items.forEach(item => {
                    if (item.startsWith('Title: ')) {
                        const titleName = item.replace('Title: ', '');
                        reply += `   🏆 ${titleName}\n`;
                    } else {
                        reply += `   📦 ${item}\n`;
                    }
                });
            }
            
            await evarickreply(reply);
        } else if (action === 'accept') {
            // Accept quest (for story quests that need to be accepted)
            if (!questId) {
                await evarickreply(`⚠️ *Tentukan quest ID!*\n\nGunakan !quests untuk melihat quest yang tersedia.`);
                return;
            }

            // Find quest in story category
            const targetQuest = quests.story.find(quest => quest.id === questId);
            
            if (!targetQuest) {
                await evarickreply(`❌ *Quest tidak ditemukan atau bukan story quest!*\n\nHanya story quest yang perlu diterima.`);
                return;
            }

            // Check if quest is already accepted or completed
            if (player.quests.story.accepted && player.quests.story.accepted[questId]) {
                await evarickreply(`❌ *Quest sudah diterima!*`);
                return;
            }

            if (player.quests.story.completed[questId]) {
                await evarickreply(`❌ *Quest sudah selesai!*`);
                return;
            }

            // Accept the quest
            if (!player.quests.story.accepted) player.quests.story.accepted = {};
            player.quests.story.accepted[questId] = true;
            
            // Save player data
            players[participant] = player;
            savePlayerData(players);
            
            let reply = `📜 *QUEST DITERIMA!* 📜\n\n`;
            reply += `🎯 *Quest:* ${targetQuest.name}\n`;
            reply += `📝 *Deskripsi:* ${targetQuest.description}\n`;
            reply += `🎁 *Reward:* ${targetQuest.reward.gold} gold + ${targetQuest.reward.items.join(', ')}\n\n`;
            reply += `💡 *Lanjutkan bermain untuk menyelesaikan quest ini!*`;
            
            await evarickreply(reply);
        } else if (action === 'abandon') {
            // Abandon quest (for story quests)
            if (!questId) {
                await evarickreply(`⚠️ *Tentukan quest ID!*\n\nGunakan !quests untuk melihat quest yang tersedia.`);
                return;
            }

            // Find quest in story category
            const targetQuest = quests.story.find(quest => quest.id === questId);
            
            if (!targetQuest) {
                await evarickreply(`❌ *Quest tidak ditemukan atau bukan story quest!*\n\nHanya story quest yang bisa dibatalkan.`);
                return;
            }

            // Check if quest is accepted
            if (!player.quests.story.accepted || !player.quests.story.accepted[questId]) {
                await evarickreply(`❌ *Quest belum diterima!*`);
                return;
            }

            // Check if quest is completed
            if (player.quests.story.completed[questId]) {
                await evarickreply(`❌ *Quest sudah selesai, tidak bisa dibatalkan!*`);
                return;
            }

            // Abandon the quest
            delete player.quests.story.accepted[questId];
            delete player.quests.story.progress[questId];
            
            // Save player data
            players[participant] = player;
            savePlayerData(players);
            
            let reply = `❌ *QUEST DIBATALKAN!* ❌\n\n`;
            reply += `📜 *Quest:* ${targetQuest.name}\n\n`;
            reply += `💡 *Kamu bisa menerima quest ini lagi dengan !quest accept ${questId}*`;
            
            await evarickreply(reply);
        } else {
            // Show specific quest info
            if (!questId) {
                await evarickreply(`⚠️ *Tentukan quest ID!*\n\nGunakan !quests untuk melihat quest yang tersedia.`);
                return;
            }

            // Find quest in all categories
            let targetQuest = null;
            let questCategory = null;
            
            ['daily', 'weekly', 'story'].forEach(category => {
                const found = quests[category].find(quest => quest.id === questId);
                if (found) {
                    targetQuest = found;
                    questCategory = category;
                }
            });
            
            if (!targetQuest) {
                await evarickreply(`❌ *Quest tidak ditemukan!*\n\nGunakan !quests untuk melihat quest yang tersedia.`);
                return;
            }

            const progress = player.quests[questCategory].progress[questId] || 0;
            const isCompleted = player.quests[questCategory].completed[questId] || false;
            const isClaimed = player.quests[questCategory].claimed && player.quests[questCategory].claimed[questId];
            const isAccepted = questCategory === 'story' && player.quests.story.accepted && player.quests.story.accepted[questId];
            
            let reply = `📜 *QUEST INFO* 📜\n\n`;
            reply += `📝 *${targetQuest.name}*\n`;
            reply += `📂 *Category:* ${questCategory.toUpperCase()}\n`;
            reply += `📄 *Description:* ${targetQuest.description}\n`;
            reply += `📊 *Progress:* ${progress}/${targetQuest.target}\n`;
            
            if (questCategory === 'story') {
                reply += `📋 *Status:* ${isAccepted ? '✅ Accepted' : '❌ Not Accepted'}\n`;
            }
            
            if (isCompleted) {
                reply += `✅ *Status:* Completed\n`;
                if (!isClaimed) {
                    reply += `🎁 *Claim Status:* Unclaimed\n`;
                } else {
                    reply += `🎁 *Claim Status:* Claimed\n`;
                }
            } else {
                reply += `🔄 *Status:* In Progress\n`;
            }
            
            reply += `💰 *Reward:* ${targetQuest.reward.gold} gold`;
            if (targetQuest.reward.items.length > 0) {
                reply += ` + ${targetQuest.reward.items.join(', ')}`;
            }
            reply += `\n`;
            
            if (questCategory === 'story' && !isAccepted && !isCompleted) {
                reply += `\n💡 *Gunakan !quest accept ${questId} untuk menerima quest ini!*`;
            } else if (isCompleted && !isClaimed) {
                reply += `\n💡 *Gunakan !quest claim ${questId} untuk mengklaim reward!*`;
            } else if (questCategory === 'story' && isAccepted && !isCompleted) {
                reply += `\n💡 *Gunakan !quest abandon ${questId} untuk membatalkan quest ini!*`;
            }
            
            await evarickreply(reply);
        }
    }
    break

    // Trade System
    case "trade": {
        if (!player) {
            await evarickreply(`❌ *Kamu belum terdaftar!*\n\nGunakan !daftar [nama] untuk mendaftar.`);
            return;
        }

        if (!q) {
            await evarickreply(`⚠️ *Format trade salah!*\n\n*Cara penggunaan:*\n\n` +
                `🔄 *Item dengan Item:*\n` +
                `!trade offer [nama_player] [item_kamu] [jumlah] [item_target] [jumlah]\n\n` +
                `💰 *Item dengan Gold:*\n` +
                `!trade offer [nama_player] [item_kamu] [jumlah] gold [jumlah_gold]\n\n` +
                `🎁 *Item Gratis:*\n` +
                `!trade gift [nama_player] [item_kamu] [jumlah]\n\n` +
                `📋 *Contoh:*\n` +
                `!trade offer Evarick Pedang Besi 1 Potion HP 5\n` +
                `!trade offer Evarick Pedang Baja 1 gold 1000\n` +
                `!trade gift Evarick Potion HP 3`);
            return;
        }

        const args = q.split(' ');
        const action = args[0].toLowerCase();
        
        if (action === 'offer') {
            // Item with Item or Item with Gold
            if (args.length < 5) {
                await evarickreply(`⚠️ *Format offer salah!*\n\n` +
                    `*Item dengan Item:*\n` +
                    `!trade offer [nama_player] [item_kamu] [jumlah] [item_target] [jumlah]\n\n` +
                    `*Item dengan Gold:*\n` +
                    `!trade offer [nama_player] [item_kamu] [jumlah] gold [jumlah_gold]`);
                return;
            }

            const targetPlayerName = args[1];
            const yourItem = args[2];
            const yourAmount = parseInt(args[3]);
            const targetItem = args[4];
            const targetAmount = parseInt(args[5]);

            // Validate your item
            if (!player.tas[yourItem] || player.tas[yourItem] < yourAmount) {
                await evarickreply(`❌ *Item tidak cukup!*\n\nKamu hanya memiliki ${player.tas[yourItem] || 0} ${yourItem}`);
                return;
            }

            // Find target player
            const targetPlayerEntry = Object.entries(players).find(([id, p]) => 
                p.nama.toLowerCase() === targetPlayerName.toLowerCase()
            );

            if (!targetPlayerEntry) {
                await evarickreply(`❌ *Player "${targetPlayerName}" tidak ditemukan!*`);
                return;
            }

            const [targetPlayerId, targetPlayer] = targetPlayerEntry;

            // Check if trading with yourself
            if (targetPlayerId === participant) {
                await evarickreply(`❌ *Tidak bisa trade dengan diri sendiri!*`);
                return;
            }

            // Create trade offer
            const tradeId = `${participant}_${targetPlayerId}_${Date.now()}`;
            const tradeOffer = {
                id: tradeId,
                from: participant,
                fromName: player.nama,
                to: targetPlayerId,
                toName: targetPlayer.nama,
                fromItem: yourItem,
                fromAmount: yourAmount,
                toItem: targetItem,
                toAmount: targetAmount,
                type: targetItem.toLowerCase() === 'gold' ? 'item_gold' : 'item_item',
                status: 'pending',
                createdAt: Date.now(),
                expiresAt: Date.now() + (30 * 60 * 1000) // 30 minutes
            };

            // Store trade offer
            if (!global.tradeOffers) global.tradeOffers = new Map();
            global.tradeOffers.set(tradeId, tradeOffer);

            await evarickreply(`📦 *TRADE OFFER DIKIRIM!* 📦\n\n` +
                `👤 *Ke:* ${targetPlayer.nama}\n` +
                `📦 *Menawarkan:* ${yourAmount}x ${yourItem}\n` +
                `📦 *Meminta:* ${targetAmount}x ${targetItem}\n\n` +
                `⏰ *Trade ID:* ${tradeId}\n` +
                `⏰ *Expires:* 30 menit`);

        } else if (action === 'gift') {
            // Gift item (free)
            if (args.length < 4) {
                await evarickreply(`⚠️ *Format gift salah!*\n\n` +
                    `!trade gift [nama_player] [item_kamu] [jumlah]`);
                return;
            }

            const targetPlayerName = args[1];
            const yourItem = args[2];
            const yourAmount = parseInt(args[3]);

            // Validate your item
            if (!player.tas[yourItem] || player.tas[yourItem] < yourAmount) {
                await evarickreply(`❌ *Item tidak cukup!*\n\nKamu hanya memiliki ${player.tas[yourItem] || 0} ${yourItem}`);
                return;
            }

            // Find target player
            const targetPlayerEntry = Object.entries(players).find(([id, p]) => 
                p.nama.toLowerCase() === targetPlayerName.toLowerCase()
            );

            if (!targetPlayerEntry) {
                await evarickreply(`❌ *Player "${targetPlayerName}" tidak ditemukan!*`);
                return;
            }

            const [targetPlayerId, targetPlayer] = targetPlayerEntry;

            // Check if gifting to yourself
            if (targetPlayerId === participant) {
                await evarickreply(`❌ *Tidak bisa gift ke diri sendiri!*`);
                return;
            }

            // Execute gift immediately
            player.tas[yourItem] -= yourAmount;
            if (player.tas[yourItem] === 0) delete player.tas[yourItem];

            targetPlayer.tas[yourItem] = (targetPlayer.tas[yourItem] || 0) + yourAmount;

            // Save both players
            players[participant] = player;
            players[targetPlayerId] = targetPlayer;
            savePlayerData(players);

            await evarickreply(`🎁 *GIFT BERHASIL DIKIRIM!* 🎁\n\n` +
                `👤 *Ke:* ${targetPlayer.nama}\n` +
                `📦 *Item:* ${yourAmount}x ${yourItem}\n\n` +
                `💝 *Gift gratis berhasil dikirim!*`);

        } else {
            await evarickreply(`❌ *Action tidak valid!*\n\n` +
                `*Actions yang tersedia:*\n` +
                `• offer - Kirim trade offer\n` +
                `• gift - Kirim item gratis`);
        }
    }
    break

    // Trade Accept/Decline/View Commands
    case "tradeaccept": {
        if (!player) {
            await evarickreply(`❌ *Kamu belum terdaftar!*\n\nGunakan !daftar [nama] untuk mendaftar.`);
            return;
        }

        if (!q) {
            await evarickreply(`⚠️ *Tentukan Trade ID!*\n\nGunakan !tradeoffers untuk melihat trade yang tersedia.`);
            return;
        }

        const tradeId = q;
        if (!global.tradeOffers || !global.tradeOffers.has(tradeId)) {
            await evarickreply(`❌ *Trade offer tidak ditemukan!*`);
            return;
        }

        const tradeOffer = global.tradeOffers.get(tradeId);
        
        if (tradeOffer.to !== participant) {
            await evarickreply(`❌ *Trade offer ini bukan untuk kamu!*`);
            return;
        }

        if (tradeOffer.status !== 'pending') {
            await evarickreply(`❌ *Trade offer sudah tidak valid!*`);
            return;
        }

        if (Date.now() > tradeOffer.expiresAt) {
            await evarickreply(`❌ *Trade offer sudah expired!*`);
            global.tradeOffers.delete(tradeId);
            return;
        }

        // Validate items and gold
        const fromPlayer = players[tradeOffer.from];
        const toPlayer = players[tradeOffer.to];

        // Check if from player still has the item
        if (!fromPlayer.tas[tradeOffer.fromItem] || fromPlayer.tas[tradeOffer.fromItem] < tradeOffer.fromAmount) {
            await evarickreply(`❌ *Player tidak memiliki item yang cukup!*`);
            return;
        }

        // Check if to player has the required item/gold
        if (tradeOffer.type === 'item_gold') {
            if (toPlayer.gold < tradeOffer.toAmount) {
                await evarickreply(`❌ *Gold tidak cukup!*\n\nKamu hanya memiliki ${toPlayer.gold.toLocaleString()} gold`);
                return;
            }
        } else {
            if (!toPlayer.tas[tradeOffer.toItem] || toPlayer.tas[tradeOffer.toItem] < tradeOffer.toAmount) {
                await evarickreply(`❌ *Item tidak cukup!*\n\nKamu hanya memiliki ${toPlayer.tas[tradeOffer.toItem] || 0} ${tradeOffer.toItem}`);
                return;
            }
        }

        // Execute trade
        // From player gives item
        fromPlayer.tas[tradeOffer.fromItem] -= tradeOffer.fromAmount;
        if (fromPlayer.tas[tradeOffer.fromItem] === 0) delete fromPlayer.tas[tradeOffer.fromItem];

        // To player gives item/gold
        if (tradeOffer.type === 'item_gold') {
            toPlayer.gold -= tradeOffer.toAmount;
            fromPlayer.gold += tradeOffer.toAmount;
        } else {
            toPlayer.tas[tradeOffer.toItem] -= tradeOffer.toAmount;
            if (toPlayer.tas[tradeOffer.toItem] === 0) delete toPlayer.tas[tradeOffer.toItem];
            fromPlayer.tas[tradeOffer.toItem] = (fromPlayer.tas[tradeOffer.toItem] || 0) + tradeOffer.toAmount;
        }

        // To player receives item
        toPlayer.tas[tradeOffer.fromItem] = (toPlayer.tas[tradeOffer.fromItem] || 0) + tradeOffer.fromAmount;

        // Save both players
        players[tradeOffer.from] = fromPlayer;
        players[tradeOffer.to] = toPlayer;
        savePlayerData(players);

        // Mark trade as completed
        tradeOffer.status = 'completed';
        global.tradeOffers.set(tradeId, tradeOffer);

        await evarickreply(`✅ *TRADE BERHASIL!* ✅\n\n` +
            `📦 *Menerima:* ${tradeOffer.fromAmount}x ${tradeOffer.fromItem}\n` +
            `📦 *Memberikan:* ${tradeOffer.toAmount}x ${tradeOffer.toItem}\n\n` +
            `🤝 *Trade dengan ${fromPlayer.nama} berhasil!*`);
    }
    break

    case "tradedecline": {
        if (!player) {
            await evarickreply(`❌ *Kamu belum terdaftar!*\n\nGunakan !daftar [nama] untuk mendaftar.`);
            return;
        }

        if (!q) {
            await evarickreply(`⚠️ *Tentukan Trade ID!*`);
            return;
        }

        const tradeId = q;
        if (!global.tradeOffers || !global.tradeOffers.has(tradeId)) {
            await evarickreply(`❌ *Trade offer tidak ditemukan!*`);
            return;
        }

        const tradeOffer = global.tradeOffers.get(tradeId);
        
        if (tradeOffer.to !== participant) {
            await evarickreply(`❌ *Trade offer ini bukan untuk kamu!*`);
            return;
        }

        // Mark trade as declined
        tradeOffer.status = 'declined';
        global.tradeOffers.set(tradeId, tradeOffer);

        await evarickreply(`❌ *TRADE DITOLAK!*\n\nTrade offer dari ${tradeOffer.fromName} telah ditolak.`);
    }
    break

    case "tradeoffers": {
        if (!player) {
            await evarickreply(`❌ *Kamu belum terdaftar!*\n\nGunakan !daftar [nama] untuk mendaftar.`);
            return;
        }

        if (!global.tradeOffers) {
            await evarickreply(`📋 *Tidak ada trade offer yang tersedia!*`);
            return;
        }

        const pendingOffers = Array.from(global.tradeOffers.values()).filter(
            offer => offer.to === participant && offer.status === 'pending' && Date.now() <= offer.expiresAt
        );

        if (pendingOffers.length === 0) {
            await evarickreply(`📋 *Tidak ada trade offer yang menunggu!*`);
            return;
        }

        let reply = `📋 *TRADE OFFERS YANG MENUNGGU* 📋\n\n`;
        
        pendingOffers.forEach((offer, index) => {
            const timeLeft = Math.max(0, Math.floor((offer.expiresAt - Date.now()) / 1000 / 60));
            reply += `${index + 1}. *${offer.fromName}*\n`;
            reply += `   📦 Menawarkan: ${offer.fromAmount}x ${offer.fromItem}\n`;
            if (offer.type === 'item_gold') {
                reply += `   💰 Meminta: ${offer.toAmount.toLocaleString()} Gold\n`;
            } else {
                reply += `   📦 Meminta: ${offer.toAmount}x ${offer.toItem}\n`;
            }
            reply += `   ⏰ ${timeLeft} menit tersisa\n`;
            reply += `   🆔 ID: ${offer.id}\n\n`;
        });

        reply += `💡 *Gunakan !tradeaccept [trade_id] untuk menerima*`;
        await evarickreply(reply);
    }
    break

    case "tradeview": {
        if (!player) {
            await evarickreply(`❌ *Kamu belum terdaftar!*\n\nGunakan !daftar [nama] untuk mendaftar.`);
            return;
        }

        if (!q) {
            await evarickreply(`⚠️ *Tentukan Trade ID!*`);
            return;
        }

        const tradeId = q;
        if (!global.tradeOffers || !global.tradeOffers.has(tradeId)) {
            await evarickreply(`❌ *Trade offer tidak ditemukan!*`);
            return;
        }

        const tradeOffer = global.tradeOffers.get(tradeId);
        const timeLeft = Math.max(0, Math.floor((tradeOffer.expiresAt - Date.now()) / 1000 / 60));
        
        let reply = `📋 *DETAIL TRADE OFFER* 📋\n\n`;
        reply += `🆔 *Trade ID:* ${tradeOffer.id}\n`;
        reply += `👤 *Dari:* ${tradeOffer.fromName}\n`;
        reply += `👤 *Ke:* ${tradeOffer.toName}\n`;
        reply += `📦 *Menawarkan:* ${tradeOffer.fromAmount}x ${tradeOffer.fromItem}\n`;
        
        if (tradeOffer.type === 'item_gold') {
            reply += `💰 *Meminta:* ${tradeOffer.toAmount.toLocaleString()} Gold\n`;
        } else {
            reply += `📦 *Meminta:* ${tradeOffer.toAmount}x ${tradeOffer.toItem}\n`;
        }
        
        reply += `📅 *Status:* ${tradeOffer.status}\n`;
        reply += `⏰ *Expires:* ${timeLeft} menit tersisa\n\n`;
        
        if (tradeOffer.status === 'pending' && tradeOffer.to === participant) {
            reply += `✅ *Terima:* !tradeaccept ${tradeId}\n`;
            reply += `❌ *Tolak:* !tradedecline ${tradeId}`;
        }

        await evarickreply(reply);
    }
    break

    case "tradehistory": {
        if (!player) {
            await evarickreply(`❌ *Kamu belum terdaftar!*\n\nGunakan !daftar [nama] untuk mendaftar.`);
            return;
        }

        if (!global.tradeOffers) {
            await evarickreply(`📜 *Belum ada riwayat trade!*`);
            return;
        }

        const myTrades = Array.from(global.tradeOffers.values()).filter(
            offer => (offer.from === participant || offer.to === participant) && offer.status === 'completed'
        ).slice(-10); // Last 10 trades

        if (myTrades.length === 0) {
            await evarickreply(`📜 *Belum ada riwayat trade!*`);
            return;
        }

        let reply = `📜 *RIWAYAT TRADE (10 Terakhir)* 📜\n\n`;
        
        myTrades.forEach((trade, index) => {
            const date = new Date(trade.createdAt).toLocaleDateString('id-ID');
            const isFromMe = trade.from === participant;
            
            reply += `${index + 1}. ${date}\n`;
            if (isFromMe) {
                reply += `   📤 Ke: ${trade.toName}\n`;
                reply += `   📦 Berikan: ${trade.fromAmount}x ${trade.fromItem}\n`;
                if (trade.type === 'item_gold') {
                    reply += `   💰 Terima: ${trade.toAmount.toLocaleString()} Gold\n`;
                } else {
                    reply += `   📦 Terima: ${trade.toAmount}x ${trade.toItem}\n`;
                }
            } else {
                reply += `   📥 Dari: ${trade.fromName}\n`;
                reply += `   📦 Terima: ${trade.fromAmount}x ${trade.fromItem}\n`;
                if (trade.type === 'item_gold') {
                    reply += `   💰 Berikan: ${trade.toAmount.toLocaleString()} Gold\n`;
                } else {
                    reply += `   📦 Berikan: ${trade.toAmount}x ${trade.toItem}\n`;
                }
            }
            reply += `\n`;
        });

        await evarickreply(reply);
    }
    break

    case "season": {
        const worldEffects = getWorldEffects();
        const seasonEffect = seasonEffects[worldEffects.season];
        
        let reply = `🌿 *MUSIM SAAT INI* 🌿\n\n`;
        reply += `*${worldEffects.season.toUpperCase()}*\n`;
        reply += `${seasonEffect.description}\n\n`;
        
        reply += `*🎉 Event Musiman:*\n`;
        seasonEffect.specialEvents.forEach(event => {
            reply += `• ${event}\n`;
        });
        
        await evarickreply(reply);
    }
    break

    case "events": {
        const worldEffects = getWorldEffects();
        
        if (worldEffects.activeEvents.length === 0) {
            await evarickreply(`📅 *Tidak ada event yang sedang berlangsung saat ini.*\n\nEvent akan muncul secara acak setiap beberapa menit.`);
            return;
        }
        
        let reply = `🎉 *EVENT AKTIF* 🎉\n\n`;
        
        worldEffects.activeEvents.forEach((event, index) => {
            const remainingTime = Math.floor((event.endTime - Date.now()) / 60000);
            const rarityEmoji = {
                common: '🟢',
                uncommon: '🟡',
                rare: '🔴'
            };
            
            reply += `*${index + 1}. ${event.name}* ${rarityEmoji[event.rarity]}\n`;
            reply += `📝 ${event.description}\n`;
            reply += `⏰ ${remainingTime} menit tersisa\n\n`;
        });
        
        await evarickreply(reply);
    }
    break

    // PvP System - Step 1: Basic PvP Command
    case "pvp": {
        if (!player) {
            await evarickreply(`❌ *Kamu belum terdaftar!*\n\nGunakan !daftar [nama] untuk mendaftar.`);
            return;
        }

        // Initialize PvP ranking
        initializePvPRanking(participant);

        if (!q) {
            const ranking = pvpRankings.get(participant);
            let reply = `⚔️ *PvP ARENA* ⚔️\n\n`;
            reply += `*Commands:*\n`;
            reply += `!pvp list - Lihat daftar player yang bisa ditantang\n`;
            reply += `!pvp challenge [player] - Tantang player\n`;
            reply += `!pvp accept [player] - Terima tantangan\n`;
            reply += `!pvp decline [player] - Tolak tantangan\n`;
            reply += `!pvp pending - Lihat tantangan yang menunggu\n`;
            reply += `!pvp ranking - Lihat ranking PvP\n`;
            reply += `!pvp history - Riwayat pertarungan\n`;
            reply += `!pvp stats - Statistik PvP kamu\n\n`;
            
            reply += `*📊 Statistik Kamu:*\n`;
            reply += `🏆 Rating: ${ranking.rating}\n`;
            reply += `✅ Menang: ${ranking.wins}\n`;
            reply += `❌ Kalah: ${ranking.losses}\n`;
            reply += `🤝 Seri: ${ranking.draws}\n`;
            reply += `🔥 Streak: ${ranking.streak}\n`;
            reply += `⚔️ Total Battle: ${ranking.totalBattles}`;
            
            await evarickreply(reply);
            return;
        }

        const args = q.split(' ');
        const action = args[0]?.toLowerCase();

        switch (action) {
            case 'challenge': {
                const targetName = args.slice(1).join(' ');
                if (!targetName) {
                    await evarickreply(`⚠️ *Tentukan player yang ingin ditantang!*\n\nContoh: !pvp challenge [nama]`);
                    return;
                }

                // Find target player by name
                const targetPlayerEntry = Object.entries(players).find(([id, p]) => 
                    p.nama.toLowerCase() === targetName.toLowerCase()
                );

                if (!targetPlayerEntry) {
                    await evarickreply(`❌ *Player "${targetName}" tidak ditemukan!*\n\nPastikan nama player sudah benar dan sudah terdaftar.`);
                    return;
                }

                const [targetPlayerId, targetPlayer] = targetPlayerEntry;

                if (targetPlayer.nama === player.nama) {
                    await evarickreply(`🤔 *Kamu tidak bisa menantang dirimu sendiri!*`);
                    return;
                }

                // Check if already challenged
                const existingChallenge = Array.from(pvpChallenges.values()).find(
                    challenge => challenge.challenger === participant && challenge.challenged === targetPlayerId
                );

                if (existingChallenge) {
                    await evarickreply(`⚠️ *Kamu sudah menantang ${targetName}!*\n\nTunggu mereka merespons.`);
                    return;
                }

                // Create challenge
                const challenge = {
                    challenger: participant,
                    challenged: targetPlayerId,
                    challengerName: player.nama,
                    challengedName: targetPlayer.nama,
                    timestamp: Date.now(),
                    expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
                };

                pvpChallenges.set(`${participant}_${targetPlayerId}`, challenge);

                await evarickreply(`⚔️ *Tantangan PvP dikirim ke ${targetName}!*\n\nMereka harus menggunakan !pvp accept ${player.nama} untuk menerima.`);
            }
            break;

            case 'accept': {
                const challengerName = args.slice(1).join(' ');
                if (!challengerName) {
                    await evarickreply(`⚠️ *Tentukan player yang menantang!*\n\nContoh: !pvp accept [nama]`);
                    return;
                }

                // Find challenger player by name
                const challengerPlayerEntry = Object.entries(players).find(([id, p]) => 
                    p.nama.toLowerCase() === challengerName.toLowerCase()
                );

                if (!challengerPlayerEntry) {
                    await evarickreply(`❌ *Player "${challengerName}" tidak ditemukan!*\n\nPastikan nama player sudah benar dan sudah terdaftar.`);
                    return;
                }

                const [challengerPlayerId, challengerPlayer] = challengerPlayerEntry;

                const challengeKey = `${challengerPlayerId}_${participant}`;
                const challenge = pvpChallenges.get(challengeKey);

                if (!challenge) {
                    await evarickreply(`❌ *Tidak ada tantangan dari ${challengerName}!*`);
                    return;
                }

                if (Date.now() > challenge.expiresAt) {
                    pvpChallenges.delete(challengeKey);
                    await evarickreply(`⏰ *Tantangan dari ${challengerName} sudah expired!*`);
                    return;
                }

                // Remove challenge
                pvpChallenges.delete(challengeKey);

                // Initialize rankings
                initializePvPRanking(participant);
                initializePvPRanking(challengerPlayerId);

                // Create turn-based battle state
                const battleState = createTurnBasedPvPState(challengerPlayerId, challengerPlayer, participant, player);

                const battleId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                pvpBattles.set(battleId, battleState);

                // Determine who goes first (random)
                const firstPlayer = Math.random() < 0.5 ? 'player1' : 'player2';
                battleState.turn = firstPlayer;
                battleState.battleId = battleId;

                let reply = `⚔️ *PERTARUNGAN PvP DIMULAI!* ⚔️\n\n`;
                reply += `👤 *${challengerPlayer.nama}* vs *${player.nama}*\n\n`;
                reply += `*📊 STATISTIK:*\n`;
                reply += `${challengerPlayer.nama}: HP ${battleState.player1.hp}/${battleState.player1.maxHp} | ATK ${battleState.player1.attack} | DEF ${battleState.player1.defense}\n`;
                reply += `${player.nama}: HP ${battleState.player2.hp}/${battleState.player2.maxHp} | ATK ${battleState.player2.attack} | DEF ${battleState.player2.defense}\n\n`;
                reply += `🎯 *Giliran pertama: ${firstPlayer === 'player1' ? challengerPlayer.nama : player.nama}*\n\n`;
                reply += `*⚔️ COMMANDS YANG TERSEDIA:*\n`;
                reply += `• !serang - Serang lawan\n`;
                reply += `• !skill - Gunakan skill\n`;
                reply += `• !item [nama_item] - Gunakan item\n`;
                reply += `• !menyerah - Menyerah\n\n`;
                reply += `*💡 Battle ID: ${battleId}*`;

                await evarickreply(reply);
            }
            break;
        
            case 'pending': {
                // Tampilkan tantangan yang dikirim dan diterima
                const sentChallenges = Array.from(pvpChallenges.values()).filter(
                    challenge => challenge.challenger === participant && Date.now() <= challenge.expiresAt
                );
                const receivedChallenges = Array.from(pvpChallenges.values()).filter(
                    challenge => challenge.challenged === participant && Date.now() <= challenge.expiresAt
                );
                let reply = `⏳ *TANTANGAN PvP YANG MENUNGGU* ⏳\n\n`;
                if (sentChallenges.length === 0 && receivedChallenges.length === 0) {
                    reply += `📝 *Tidak ada tantangan yang menunggu!*\n\nKirim tantangan dengan !pvp challenge [player]`;
                } else {
                    if (sentChallenges.length > 0) {
                        reply += `*📤 Tantangan yang kamu kirim:*\n`;
                        sentChallenges.forEach((challenge, index) => {
                            const timeLeft = Math.max(0, Math.floor((challenge.expiresAt - Date.now()) / 1000 / 60));
                            reply += `${index + 1}. ${challenge.challengedName} (${timeLeft} menit tersisa)\n`;
                        });
                        reply += `\n`;
                    }
                    if (receivedChallenges.length > 0) {
                        reply += `*📥 Tantangan yang kamu terima:*\n`;
                        receivedChallenges.forEach((challenge, index) => {
                            const timeLeft = Math.max(0, Math.floor((challenge.expiresAt - Date.now()) / 1000 / 60));
                            reply += `${index + 1}. Dari ${challenge.challengerName} (${timeLeft} menit tersisa)\n`;
                            reply += `   Terima: !pvp accept ${challenge.challengerName}\n`;
                            reply += `   Tolak: !pvp decline ${challenge.challengerName}\n\n`;
                        });
                    }
                }
                await evarickreply(reply);
            }
            break;

            

            case 'ranking': {
                // Get top 20 players by rating
                const allRankings = Array.from(pvpRankings.entries()).map(([id, ranking]) => {
                    const playerData = players[id];
                    return {
                        id,
                        nama: playerData ? playerData.nama : 'Unknown',
                        rating: ranking.rating,
                        wins: ranking.wins,
                        losses: ranking.losses,
                        totalBattles: ranking.totalBattles
                    };
                }).sort((a, b) => b.rating - a.rating).slice(0, 20);

                let reply = `🏆 *PvP RANKING (Top 20)* 🏆\n\n`;
                
                if (allRankings.length === 0) {
                    reply += `📝 *Belum ada player yang bertarung PvP!*\n\nMulai bertarung dengan !pvp challenge [player]`;
                } else {
                    allRankings.forEach((rank, index) => {
                        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                        const winRate = rank.totalBattles > 0 ? ((rank.wins / rank.totalBattles) * 100).toFixed(1) : '0.0';
                        reply += `${medal} ${rank.nama}\n`;
                        reply += `   Rating: ${rank.rating} | W/L: ${rank.wins}/${rank.losses} (${winRate}%)\n\n`;
                    });
                }

                await evarickreply(reply);
            }
            break;

            case 'history': {
                if (!player.pvpHistory || player.pvpHistory.length === 0) {
                    await evarickreply(`📝 *Belum ada riwayat pertarungan PvP!*\n\nMulai bertarung dengan !pvp challenge [player]`);
                    return;
                }

                const recentBattles = player.pvpHistory.slice(-10); // Last 10 battles
                let reply = `📜 *RIWAYAT PERTARUNGAN PvP (10 Terakhir)* 📜\n\n`;

                recentBattles.forEach((battle, index) => {
                    const date = new Date(battle.timestamp).toLocaleDateString('id-ID');
                    const resultEmoji = battle.result === 'win' ? '✅' : battle.result === 'loss' ? '❌' : '🤝';
                    const resultText = battle.result === 'win' ? 'MENANG' : battle.result === 'loss' ? 'KALAH' : 'SERI';
                    
                    reply += `${index + 1}. ${date} ${resultEmoji}\n`;
                    reply += `   👤 Lawan: ${battle.opponent}\n`;
                    reply += `   📊 Hasil: ${resultText}\n`;
                    reply += `   📈 Rating: ${battle.ratingChange > 0 ? '+' : ''}${battle.ratingChange}\n`;
                    reply += `   ⚔️ Rounds: ${battle.rounds}\n\n`;
                });

                await evarickreply(reply);
            }
            break;



            case 'decline': {
                const challengerName = args.slice(1).join(' ');
                if (!challengerName) {
                    await evarickreply(`⚠️ *Tentukan player yang menantang!*\n\nContoh: !pvp decline [nama]`);
                    return;
                }

                // Find challenger player by name
                const challengerPlayerEntry = Object.entries(players).find(([id, p]) => 
                    p.nama.toLowerCase() === challengerName.toLowerCase()
                );

                if (!challengerPlayerEntry) {
                    await evarickreply(`❌ *Player "${challengerName}" tidak ditemukan!*\n\nPastikan nama player sudah benar dan sudah terdaftar.`);
                    return;
                }

                const [challengerPlayerId, challengerPlayer] = challengerPlayerEntry;

                const challengeKey = `${challengerPlayerId}_${participant}`;
                const challenge = pvpChallenges.get(challengeKey);

                if (!challenge) {
                    await evarickreply(`❌ *Tidak ada tantangan dari ${challengerName}!*`);
                    return;
                }

                pvpChallenges.delete(challengeKey);
                await evarickreply(`❌ *Tantangan dari ${challengerName} ditolak.*`);
            }
            break;

            case "serang":
                case "skill":
                case "item":
                case "menyerah": {
                    // Langkah pertama: Cari pertarungan PvP yang aktif untuk pemain ini
                    const normalizedParticipant = normalizeId(participant);
                    const activeBattleEntry = Array.from(pvpBattles.entries()).find(([id, battle]) => {
                        return (normalizeId(battle.player1.id) === normalizedParticipant || normalizeId(battle.player2.id) === normalizedParticipant) && !battle.finished;
                    });
        
                    // Jika tidak ada pertarungan, kirim pesan error
                    if (!activeBattleEntry) {
                        await evarickreply(`❌ Perintah ini hanya bisa digunakan saat pertarungan PvP aktif!\n\nMulai pertarungan dengan !pvp challenge [nama]`);
                        return;
                    }
        
                    const [battleId, battle] = activeBattleEntry;
                    const isP1 = battle.player1.id === normalizedParticipant;
        
                    // Pastikan ini adalah giliran pemain
                    if ((isP1 && battle.turn !== 'player1') || (!isP1 && battle.turn !== 'player2')) {
                        await evarickreply("⏳ Bukan giliranmu! Tunggu lawan menyelesaikan aksinya.");
                        return;
                    
                    } 

                    

                    // === PROSES EFEK DI AWAL GILIRAN ===
let turnSkipped = false;
let dotDamage = 0; // Damage Over Time
let effectMessages = [];

const attacker = isP1 ? battle.player1 : battle.player2;
const opponent = isP1 ? battle.player2 : battle.player1;
const attackerEffects = isP1 ? battle.player1Effects : battle.player2Effects;

// Cek efek STUN
const stunned = attackerEffects.find(e => e.type === 'stun');
if (stunned) {
    turnSkipped = true;
    effectMessages.push(`😵 *${attacker.nama}* terkena stun dan tidak bisa bergerak!`);
}

// Cek efek BURN atau POISON (Damage Over Time)
const burnEffect = attackerEffects.find(e => e.type === 'burn');
if (burnEffect) {
    const burnDamage = Math.floor(attacker.maxHp * (burnEffect.value || 0.05)); // Misal, 5% Max HP
    attacker.hp -= burnDamage;
    dotDamage += burnDamage;
    effectMessages.push(`🔥 *${attacker.nama}* terbakar dan menerima *${burnDamage}* damage!`);
}
        
                    // === Di sini Anda bisa menyalin kembali logika dari masing-masing perintah ===
                    // Karena logikanya sangat panjang, kita akan fokus pada contoh 'menyerah' dan 'serang'
                    
                    if (command === 'menyerah') {
                        const currentPlayer = isP1 ? battle.player1 : battle.player2;
                        const opponent = isP1 ? battle.player2 : battle.player1;
        
                        battle.finished = true;
                        battle.winner = opponent.nama;
                        battle.loser = currentPlayer.nama;
                        battle.surrendered = true;

                        // === PROSES AKHIR PERTARUNGAN: RATING & HADIAH ===
const winnerData = players[attacker.id];
const loserData = players[opponent.id];

// Inisialisasi pvpStats jika belum ada
if (!winnerData.pvpStats) winnerData.pvpStats = { rating: 1000, wins: 0, losses: 0 };
if (!loserData.pvpStats) loserData.pvpStats = { rating: 1000, wins: 0, losses: 0 };

// Kalkulasi ELO Rating
const kFactor = 32;
const winnerExpected = 1 / (1 + Math.pow(10, (loserData.pvpStats.rating - winnerData.pvpStats.rating) / 400));
const loserExpected = 1 / (1 + Math.pow(10, (winnerData.pvpStats.rating - loserData.pvpStats.rating) / 400));

const ratingChangeWinner = Math.round(kFactor * (1 - winnerExpected));
const ratingChangeLoser = Math.round(kFactor * (0 - loserExpected));

winnerData.pvpStats.rating += ratingChangeWinner;
loserData.pvpStats.rating += ratingChangeLoser;
winnerData.pvpStats.wins++;
loserData.pvpStats.losses++;

// Hadiah Kemenangan
const goldReward = 150;
const xpReward = 50; // Asumsi ada sistem XP
winnerData.gold += goldReward;
// winnerData.xp += xpReward; // Aktifkan jika ada sistem XP

reply += `\n\n*✨ HADIAH & PERINGKAT ✨*\n`;
reply += `[WIN] *${attacker.nama}*: +${goldReward} Gold, Rating +${ratingChangeWinner} (${winnerData.pvpStats.rating})\n`;
reply += `[LOSE] *${opponent.nama}*: Rating ${ratingChangeLoser} (${loserData.pvpStats.rating})`;

// Simpan data kedua pemain
players[attacker.id] = winnerData;
players[opponent.id] = loserData;
                        
                        pvpBattles.delete(battleId); // Hapus battle setelah selesai
        
                        let reply = `⚔️ *PERTARUNGAN SELESAI!* ⚔️\n\n`;
                        reply += `🏳️ *${currentPlayer.nama} MENYERAH!* 🏳️\n\n`;
                        reply += `🏆 *${opponent.nama} MENANG!* 🏆`;
                        
                        await evarickreply(reply);
                        return;
                    }
        
                    if (command === 'serang') {
                        // Cek giliran dilewati karena STUN
    if (turnSkipped) {
        let reply = `*🌀 Hasil Ronde ${battle.round}:*\n`;
        reply += effectMessages.join('\n');

        // Kode Pembersih Efek (untuk giliran yang dilewati)
    const effectsToClean = isP1 ? battle.player1Effects : battle.player2Effects;
        effectsToClean.forEach(e => { if (e.duration) e.duration -= 1; });
        if (isP1) { battle.player1Effects = effectsToClean.filter(e => e.duration > 0 || !e.duration); } 
        else { battle.player2Effects = effectsToClean.filter(e => e.duration > 0 || !e.duration); }

        battle.turn = isP1 ? 'player2' : 'player1';
        battle.round++;
        reply += `\n\n*⏰ Giliran ${opponent.nama} untuk menyerang!*`;

        pvpBattles.set(battleId, battle);
        return await evarickreply(reply);
    }

    // Jika tidak stun, lanjutkan serangan
    let baseAtk = attacker.attack;
    let baseDef = opponent.defense;
    let critMultiplier = 1.0;
    let ignoreDefense = 0;

    // Cek BUFF pada penyerang
    const attackBuff = attackerEffects.find(e => e.type === 'buff_attack');
    if (attackBuff) baseAtk *= (1 + attackBuff.value);

    const damageMultiplierBuff = attackerEffects.find(e => e.type === 'buff_damage_multiplier');
    if (damageMultiplierBuff) baseAtk *= damageMultiplierBuff.value;

    const guaranteedCrit = attackerEffects.find(e => e.type === 'guaranteed_crit');
    if (guaranteedCrit) critMultiplier = 1.5;

    const ignoreDefenseEffect = attackerEffects.find(e => e.type === 'ignore_defense');
    if (ignoreDefenseEffect) ignoreDefense = ignoreDefenseEffect.value;

    // Cek DEBUFF pada lawan
    const opponentEffects = isP1 ? battle.player2Effects : battle.player1Effects;
    const defenseDebuff = opponentEffects.find(e => e.type === 'debuff_defense');
    if (defenseDebuff) baseDef *= (1 - defenseDebuff.value);

    // Hitung kerusakan final
    let damage = Math.max(1, Math.floor((baseAtk * critMultiplier) * (0.8 + Math.random() * 0.4)));
    let finalDamage = Math.max(1, damage - Math.floor(baseDef * (1 - ignoreDefense)));

    // Cek efek Ignore Flat Damage pada lawan
    const ignoreFlatEffect = opponentEffects.find(e => e.type === 'ignore_damage_flat');
    if (ignoreFlatEffect) {
        finalDamage = Math.max(1, finalDamage - ignoreFlatEffect.value);
    }

    opponent.hp = Math.max(0, opponent.hp - finalDamage);

    // Buat pesan balasan
    let reply = `*🌀 Hasil Ronde ${battle.round}:*\n`;
    if(effectMessages.length > 0) reply += effectMessages.join('\n') + '\n';
    if(guaranteedCrit) reply += `💥 *CRITICAL HIT!* `
    reply += `⚔️ *${attacker.nama}* menyerang *${opponent.nama}* dan memberikan *${finalDamage}* kerusakan!\n\n`;

    // Cek efek REFLECT DAMAGE pada lawan
    const reflectEffect = opponentEffects.find(e => e.type === 'reflect_damage');
    if (reflectEffect) {
        const reflectDamage = Math.floor(finalDamage * reflectEffect.value);
        attacker.hp = Math.max(0, attacker.hp - reflectDamage);
        reply += `🛡️ *${opponent.nama}* memantulkan *${reflectDamage}* kerusakan kembali!\n`;
    }

    // Cek efek LIFESTEAL ON HIT pada penyerang
    const lifestealEffect = attackerEffects.find(e => e.type === 'lifesteal_on_hit');
    if (lifestealEffect) {
        const healAmount = lifestealEffect.value;
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmount);
        reply += `🩸 *${attacker.nama}* memulihkan *${healAmount}* HP dari serangannya!\n`;
    }

    reply += `❤️ *${opponent.nama}* HP: ${opponent.hp}/${opponent.maxHp}\n`;
    reply += `❤️ *${attacker.nama}* HP: ${attacker.hp}/${attacker.maxHp}\n`;

    // Cek jika lawan kalah
    if (opponent.hp <= 0) {
        battle.finished = true;
        battle.winner = attacker.nama;
        battle.loser = opponent.nama;
        pvpBattles.delete(battleId);
        reply += `\n🏆 *${attacker.nama} MENANG!* 🏆`;
    } else {
        // Kode Pembersih Efek
        const effectsToClean = isP1 ? battle.player1Effects : battle.player2Effects;
        effectsToClean.forEach(e => { if (e.duration) e.duration -= 1; });
        if (isP1) { battle.player1Effects = effectsToClean.filter(e => e.duration > 0 || !e.duration); }
        else { battle.player2Effects = effectsToClean.filter(e => e.duration > 0 || !e.duration); }

        battle.turn = isP1 ? 'player2' : 'player1';
        reply += `\n*⏰ Giliran ${opponent.nama} untuk menyerang!*`;
    }

    pvpBattles.set(battleId, battle);
    await evarickreply(reply);
    return;
                    }
        
                    if (command === 'skill') {


                        // Salin logika lengkap dari !pvp skill lama Anda ke sini
                      // 1. Validasi Input
const skillName = q.trim();
if (!skillName) {
    return await evarickreply("⚡ Gunakan: !skill [nama skill]");
}

// 2. Impor daftar skill dan data pemain
const allSkills = require('./database/rpg/skills.js');
const playerSkills = player.skills || [];
const skillData = allSkills.find(s => s.nama.toLowerCase() === skillName.toLowerCase());

// 3. Validasi Skill
if (!skillData) {
    return await evarickreply(`❌ Skill bernama "${skillName}" tidak ada.`);
}
if (!playerSkills.includes(skillData.id)) {
    return await evarickreply(`❌ Kamu tidak memiliki skill '${skillName}'.\n\nGunakan !beliskill untuk membeli.`);
}

// 4. Validasi Cooldown
const cooldowns = isP1 ? (battle.player1Cooldowns = battle.player1Cooldowns || {}) : (battle.player2Cooldowns = battle.player2Cooldowns || {});
if (cooldowns[skillData.id] && cooldowns[skillData.id] > battle.round) {
    const sisaRonde = cooldowns[skillData.id] - battle.round;
    return await evarickreply(`⏳ Skill '${skillData.nama}' masih cooldown selama ${sisaRonde} ronde lagi.`);
}

// 5. Validasi Mana (jika Anda ingin menambahkannya nanti)
const manaCost = skillData.manaCost || 0; // Asumsikan ada manaCost di skills.js
if (attacker.mana < manaCost) {
    return await evarickreply(`🔮 Mana tidak cukup untuk menggunakan skill ini!`);
}
attacker.mana -= manaCost; // Kurangi mana

// Siapkan pesan dan variabel untuk efek
let resultMsg = `*🌀 Hasil Ronde ${battle.round}:*\n`;
if (effectMessages.length > 0) {
    resultMsg += effectMessages.join('\n') + '\n';
}
resultMsg += `✨ *${attacker.nama}* menggunakan skill *${skillData.nama}*!\n\n`;
let logMsg = `${attacker.nama} menggunakan skill ${skillData.nama}`;

// 6. Terapkan Efek Skill menggunakan Switch Case
switch (skillData.efek) {
    // --- TANK SKILLS ---
    case 'ignore_50_attack': {
        attackerEffects.push({ type: 'ignore_damage_flat', value: 50, duration: 1 });
        resultMsg += `🛡️ Kamu bersiap menahan serangan! Kerusakan berikutnya akan berkurang sebesar 50.`;
        break;
    }
    case 'buff_defense_75_2_turns': {
        attackerEffects.push({ type: 'buff_defense', value: 0.75, duration: 2 });
        resultMsg += `🛡️ Defense meningkat sebesar 75% selama 2 ronde!`;
        break;
    }
    case 'reflect_damage_30_3_turns': {
        attackerEffects.push({ type: 'reflect_damage', value: 0.3, duration: 3 });
        resultMsg += `🛡️ Kamu mengaktifkan perisai duri! 30% kerusakan akan dipantulkan selama 3 ronde.`;
        break;
    }
    case 'lifesteal_from_attacker_30_3_turns': {
         attackerEffects.push({ type: 'lifesteal_from_attacker', value: 0.3, duration: 3 });
         resultMsg += `🛡️ Perisai Balas Dendam aktif! 30% dari attack musuh akan menjadi heal selama 3 ronde!`;
         break;
    }

    // --- FIGHTER SKILLS ---
    case 'double_attack_70': {
        attackerEffects.push({ type: 'buff_damage_multiplier', value: 1.4, duration: 1 }); // Simplifikasi sebagai bonus damage 40%
        resultMsg += `⚔️ Kamu bersiap untuk serangan ganda! Serangan berikutnya lebih kuat.`;
        break;
    }
    case 'heal_self_15_percent': {
        const healAmount = Math.floor(attacker.maxHp * 0.15);
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmount);
        resultMsg += `❤️ Semangat juang memulihkan ${healAmount} HP!`;
        break;
    }
    case 'guaranteed_critical': {
        attackerEffects.push({ type: 'guaranteed_crit', duration: 1 });
        resultMsg += `🎯 Kamu mencari titik lemah! Serangan berikutnya dijamin kritikal.`;
        break;
    }
    case 'bloodlust_sacrificing_for_power': {
        const hpCost = Math.floor(attacker.maxHp * 0.05);
        attacker.hp -= hpCost;
        attackerEffects.push({ type: 'buff_attack', value: 0.30, duration: 2 });
        attackerEffects.push({ type: 'lifesteal_on_hit', value: 20, duration: 2 });
        resultMsg += `🩸 Kamu mengorbankan ${hpCost} HP untuk kekuatan! Attack meningkat dan setiap serangan akan memulihkan HP.`;
        break;
    }

    // --- ASSASSIN SKILLS ---
    case 'bonus_50_percent_damage': {
        attackerEffects.push({ type: 'buff_attack', value: 0.50, duration: 1 });
        resultMsg += `🔪 Serangan berikutnya mendapatkan bonus damage 50%!`;
        break;
    }
    case 'buff_evasion_50_2_turns': {
        attackerEffects.push({ type: 'buff_evasion', value: 0.50, duration: 2 });
        resultMsg += `💨 Kamu bergerak lincah! Evasion meningkat 50% selama 2 ronde.`;
        break;
    }
    case 'damage_80_plus_poison_3_turns': {
        attackerEffects.push({ type: 'buff_damage_multiplier', value: 0.8, duration: 1 });
        const opponentEffects = isP1 ? battle.player2Effects : battle.player1Effects;
        opponentEffects.push({ type: 'poison', value: 0.05, duration: 3 }); // Racun 5% HP per ronde
        resultMsg += `☠️ Serangan berikutnya memberikan 80% kerusakan dan meracuni lawan!`;
        break;
    }
    case 'stealth_debuff_stacking_buff_4_turns': {
        attackerEffects.push({ type: 'buff_evasion', value: 0.60, duration: 4 });
        attackerEffects.push({ type: 'stacking_attack_buff', value: 0.05, stacks: 0, maxStacks: 4, duration: 4 });
        const opponentEffects = isP1 ? battle.player2Effects : battle.player1Effects;
        opponentEffects.push({ type: 'debuff_attack', value: 0.5, duration: 4 });
        resultMsg += `💨 Kamu menghilang! Evasion meningkat, serangan lawan melemah, dan seranganmu akan semakin kuat!`;
        break;
    }

    // --- MAGE SKILLS ---
    case 'reduce_damage_by_mana_div_2': {
        const shieldAmount = Math.floor(attacker.mana / 2);
        attackerEffects.push({ type: 'mana_shield', value: shieldAmount, duration: 1 });
        resultMsg += `🔮 Perisai Mana terbentuk! Kerusakan berikutnya akan diserap oleh Mana.`;
        break;
    }
    case 'damage_180_burn_4_stun_chance': {
        attackerEffects.push({ type: 'buff_damage_multiplier', value: 1.8, duration: 1 });
        const opponentEffects = isP1 ? battle.player2Effects : battle.player1Effects;
        opponentEffects.push({ type: 'burn', value: 0.08, duration: 4 });
        if (Math.random() < 0.3) {
            opponentEffects.push({ type: 'stun', duration: 1 });
            resultMsg += `🌋 Lawan terkena semburan magma, menerima efek burn, dan terkena STUN!`;
        } else {
            resultMsg += `🌋 Lawan terkena semburan magma dan menerima efek burn!`;
        }
        break;
    }

    // --- ARCHER SKILLS ---
    case 'true_hit_30_bonus': {
        attackerEffects.push({ type: 'buff_damage_multiplier', value: 1.3, duration: 1 });
        attackerEffects.push({ type: 'true_hit', duration: 1 }); // Efek ini akan diabaikan oleh evasion lawan
        resultMsg += `🏹 Tembakanmu selanjutnya tidak akan meleset dan lebih kuat!`;
        break;
    }
    case 'silence_2_debuff_attack_20_4_turns': {
        const opponentEffects = isP1 ? battle.player2Effects : battle.player1Effects;
        opponentEffects.push({ type: 'silence', duration: 2 });
        opponentEffects.push({ type: 'debuff_attack', value: 0.2, duration: 4 });
        resultMsg += `🎯 Panah Pembungkam mengenai target! Lawan tidak bisa menggunakan skill dan serangannya melemah.`;
        break;
    }

    // Default case jika efek belum ada
    default: {
        resultMsg += `(Efek untuk skill ini sedang dalam pengembangan.)`;
        logMsg += ` (efek belum diimplementasikan)`;
        break;
    }
}

// 7. Atur Cooldown untuk skill yang baru digunakan
cooldowns[skillData.id] = battle.round + skillData.cooldown;

// 8. Tambahkan Kode Pembersih Efek (PENTING!)
// === PEMBERSIHAN EFEK DI AKHIR GILIRAN ===
const effectsToClean = isP1 ? battle.player1Effects : battle.player2Effects;
effectsToClean.forEach(e => {
    if (e.duration) e.duration -= 1;
});
if (isP1) {
    battle.player1Effects = effectsToClean.filter(e => e.duration > 0 || !e.duration);
} else {
    battle.player2Effects = effectsToClean.filter(e => e.duration > 0 || !e.duration);
}
// === AKHIR DARI KODE PEMBERSIH ===

// 9. Pindahkan Giliran
        battle.turn = isP1 ? 'player2' : 'player1';
battle.round++;
resultMsg += `\n\n*⏰ Giliran ${opponent.nama} untuk menyerang!*`;

// 10. Simpan dan Kirim Pesan
    pvpBattles.set(battleId, battle);
await evarickreply(resultMsg);
    return;
        
                    }
        
                    if (command === 'item') {
                    // 1. Validasi Input
const itemName = q.trim();
if (!itemName) {
    return await evarickreply("Gunakan: !item [nama item]");
}

// 2. Cek apakah pemain memiliki item tersebut
if (!player.tas[itemName] || player.tas[itemName] <= 0) {
    return await evarickreply(`❌ Kamu tidak memiliki item "${itemName}" di dalam tas.`);
}

// 3. Impor data item dan cari item yang dimaksud
const allItems = require('./database/rpg/items.js');
const itemData = allItems.find(i => i.nama.toLowerCase() === itemName.toLowerCase());

// 4. Validasi Item
if (!itemData || itemData.kategori !== 'Consumable') {
    return await evarickreply(`❌ Item "${itemName}" tidak bisa digunakan dalam pertarungan.`);
}

// Kurangi item dari tas pemain
player.tas[itemName]--;
if (player.tas[itemName] <= 0) {
    delete player.tas[itemName];
}

// Siapkan pesan balasan
let resultMsg = `*🌀 Hasil Ronde ${battle.round}:*\n`;
if (effectMessages.length > 0) {
    resultMsg += effectMessages.join('\n') + '\n';
}
resultMsg += `🩹 *${attacker.nama}* menggunakan item *${itemData.nama}*!\n\n`;

// 5. Terapkan Efek Item
let effectApplied = false;
switch (itemData.nama) {
    case 'Potion HP': {
        const healAmount = Math.floor(attacker.maxHp * 0.25); // Menyembuhkan 25% dari Max HP
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmount);
        resultMsg += `❤️ HP pulih sebanyak *${healAmount}*! (HP sekarang: ${attacker.hp}/${attacker.maxHp})`;
        effectApplied = true;
        break;
    }
    case 'Potion Mana': {
        const manaAmount = Math.floor(attacker.maxMana * 0.30); // Memulihkan 30% dari Max Mana
        attacker.mana = Math.min(attacker.maxMana, attacker.mana + manaAmount);
        resultMsg += `🔮 Mana pulih sebanyak *${manaAmount}*! (Mana sekarang: ${attacker.mana}/${attacker.maxMana})`;
        effectApplied = true;
        break;
    }
    // Anda bisa menambahkan 'case' untuk item lain seperti Elixir di sini
    default: {
        resultMsg += `(Efek untuk item ini belum diimplementasikan.)`;
        break;
    }
}

// Jika tidak ada efek yang diterapkan, batalkan penggunaan item
if (!effectApplied) {
    player.tas[itemName] = (player.tas[itemName] || 0) + 1; // Kembalikan item
    return await evarickreply("Item ini belum memiliki efek di dalam pertarungan.");
}

// 6. Tambahkan Kode Pembersih Efek
const effectsToClean = isP1 ? battle.player1Effects : battle.player2Effects;
effectsToClean.forEach(e => {
    if (e.duration) e.duration -= 1;
});
if (isP1) {
    battle.player1Effects = effectsToClean.filter(e => e.duration > 0 || !e.duration);
} else {
    battle.player2Effects = effectsToClean.filter(e => e.duration > 0 || !e.duration);
}

// 7. Pindahkan Giliran
battle.turn = isP1 ? 'player2' : 'player1';
battle.round++;
resultMsg += `\n\n*⏰ Giliran ${opponent.nama} untuk menyerang!*`;

// 8. Simpan dan Kirim Pesan
pvpBattles.set(battleId, battle);
players[participant] = player; // Simpan perubahan pada tas pemain
savePlayerData(players);
await evarickreply(resultMsg);
                        return;
                    }
                }
                break;
        
                case 'claim': {
                    const seasonDataPath = './database/rpg/pvp_season.json';
                    if (!fs.existsSync(seasonDataPath)) {
                        return await evarickreply("Belum ada data musim PvP.");
                    }
                
                    const seasonData = JSON.parse(fs.readFileSync(seasonDataPath, 'utf8'));
                    const winners = seasonData.lastWeekWinners;
                    let playerRank = null;
                    let winnerData = null;
                
                    if (winners['1st'] && winners['1st'].id === participant) {
                        playerRank = '1st';
                        winnerData = winners['1st'];
                    } else if (winners['2nd'] && winners['2nd'].id === participant) {
                        playerRank = '2nd';
                        winnerData = winners['2nd'];
                    } else if (winners['3rd'] && winners['3rd'].id === participant) {
                        playerRank = '3rd';
                        winnerData = winners['3rd'];
                    }
                
                    if (!playerRank) {
                        return await evarickreply("Maaf, kamu tidak terdaftar sebagai pemenang PvP minggu lalu.");
                    }
                
                    if (winnerData.claimed) {
                        return await evarickreply("Kamu sudah mengklaim hadiahmu untuk musim lalu.");
                    }
                
                    let reply = `🎉 *SELAMAT, JUARA!* 🎉\n\nKamu berhasil mengklaim hadiah sebagai *Juara ${playerRank}*:\n\n`;
                    let goldReward = 0;
                    let equipmentReward = null;
                
                    // Tentukan hadiah berdasarkan peringkat
                    if (playerRank === '1st') {
                        goldReward = 5000;
                        const roll = Math.random();
                        if (roll < 0.04) { // 4% chance for Legendary
                            const legendaryItems = items.filter(i => i.kategori === 'LEGENDARY');
                            equipmentReward = legendaryItems[Math.floor(Math.random() * legendaryItems.length)];
                        } else if (roll < 0.34) { // 30% chance for Epic (4% + 30%)
                            const epicItems = items.filter(i => i.kategori === 'EPIC');
                            equipmentReward = epicItems[Math.floor(Math.random() * epicItems.length)];
                        } else { // Sisanya Rare
                            const rareItems = items.filter(i => i.kategori === 'RARE');
                            equipmentReward = rareItems[Math.floor(Math.random() * rareItems.length)];
                        }
                    } else if (playerRank === '2nd') {
                        goldReward = 2500;
                        const uncommonItems = items.filter(i => i.kategori === 'UNCOMMON'); // Asumsi ada kategori UNCOMMON
                        equipmentReward = uncommonItems[Math.floor(Math.random() * uncommonItems.length)];
                    } else { // 3rd
                        goldReward = 1000;
                        const commonItems = items.filter(i => i.kategori === 'Peralatan'); // Asumsi item common
                        equipmentReward = commonItems[Math.floor(Math.random() * commonItems.length)];
                    }
                
                    // Berikan hadiah ke pemain
                    player.gold += goldReward;
                    reply += `💰 +${goldReward.toLocaleString()} Gold\n`;
                
                    if (equipmentReward) {
                        player.tas[equipmentReward.nama] = (player.tas[equipmentReward.nama] || 0) + 1;
                        reply += `🎁 +1x ${equipmentReward.nama} (${equipmentReward.kategori})\n`;
                    }
                
                    // Tandai sudah diklaim
                    winnerData.claimed = true;
                    seasonData.lastWeekWinners[playerRank] = winnerData;
                
                    // Simpan semua perubahan
                    fs.writeFileSync(seasonDataPath, JSON.stringify(seasonData, null, 2));
                    players[participant] = player;
                    savePlayerData(players);
                
                    await evarickreply(reply);
                }
                break;
        

        


     default: { 
         await evarickreply(mess.default) 
     }
 }
}
    }
}
