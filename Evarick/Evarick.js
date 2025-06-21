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
        "Pemula": { requirement: "1 Equipment", condition: (player) => Object.keys(player.equipment || {}).length >= 1 },
        "Terlengkapi": { requirement: "5 Equipment", condition: (player) => Object.keys(player.equipment || {}).length >= 5 },
        "Prajurit": { requirement: "10 Equipment", condition: (player) => Object.keys(player.equipment || {}).length >= 10 },
        "Ksatria Lengkap": { requirement: "15 Equipment", condition: (player) => Object.keys(player.equipment || {}).length >= 15 }
    },
    
    // Special Achievement Titles
    special: {
        "Pemain Setia": { requirement: "7 Hari Berturut-turut", condition: (player) => (player.consecutiveDays || 0) >= 7 },
        "Pemain Veteran": { requirement: "30 Hari Berturut-turut", condition: (player) => (player.consecutiveDays || 0) >= 30 },
        "Pemain Legendaris": { requirement: "100 Hari Berturut-turut", condition: (player) => (player.consecutiveDays || 0) >= 100 },
        "Penjelajah": { requirement: "Kunjungi 5 Lokasi", condition: (player) => (player.visitedLocations || []).length >= 5 },
        "Penjelajah Dunia": { requirement: "Kunjungi Semua Lokasi", condition: (player) => (player.visitedLocations || []).length >= 10 },
        "GOD KILLER": { requirement: "???", condition: (player) => false }, // Impossible requirement - only via secret command
        "Bot Administrator": { requirement: "Admin Bot", condition: (player) => false } // Will be set manually via admin command
    }
};

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
    try {
        // Jika file tidak ada, buat file kosong
        if (!fs.existsSync(playerDataFile)) {
            fs.writeFileSync(playerDataFile, JSON.stringify({}));
        }
        const data = fs.readFileSync(playerDataFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading player data:', error);
        return {}; // Kembalikan objek kosong jika ada error
    }
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
    if (!player.titles) player.titles = [];
    let newTitles = [];
    
    // Check all title categories
    Object.keys(titles).forEach(category => {
        Object.keys(titles[category]).forEach(titleName => {
            const title = titles[category][titleName];
            if (title.condition(player) && !player.titles.includes(titleName)) {
                newTitles.push(titleName);
                player.titles.push(titleName);
            }
        });
    });
    
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
    const allowedCommands = ['menu', 'daftar', 'leaderboard', 'top', 'rank', 'toplevel', 'levelboard'];
    if (!player && !allowedCommands.includes(command)) {
        await evarickreply("⚔️ *Anda belum terdaftar di dunia RPG!*\n\nSilakan daftar terlebih dahulu dengan mengetik:\n*!daftar [NamaPanggilanAnda]*");
        return;
    }

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

    // Travel
    case "travel": {
        if (!q) {
            await evarickreply("⚠️ *Tentukan Tujuanmu!*\nCara penggunaan: !travel [nama lokasi]\n\nContoh: !travel Hutan Rindang");
        }

        const currentLocation = locations.find(loc => loc.nama === player.lokasi);
        if (!currentLocation) {
            await evarickreply("❌ *Error: Lokasi saat ini tidak ditemukan!*");
        }

        // Cari tujuan yang cocok tanpa mempedulikan huruf besar/kecil
        const tujuanInput = q.toLowerCase();
        const tujuanValid = currentLocation.koneksi.find(tujuan => tujuan.toLowerCase() === tujuanInput);

        if (!tujuanValid) {
            await evarickreply(`Kamu tidak bisa bepergian ke *${q}* dari sini atau nama lokasi salah.`);
        }

        // Perbarui lokasi pemain dengan nama yang benar
        player.lokasi = tujuanValid;
        
        // Track visited locations for titles
        if (!player.visitedLocations) player.visitedLocations = [];
        if (!player.visitedLocations.includes(tujuanValid)) {
            player.visitedLocations.push(tujuanValid);
        }
        
        // Dapatkan deskripsi lokasi baru untuk balasan yang lebih imersif
        const newLocationData = locations.find(loc => loc.nama === tujuanValid);
        
        // Simpan perubahan lokasi ke data pemain
        players[participant] = player;
        savePlayerData(players);
        
        await evarickreply(`🚀 Kamu telah melakukan perjalanan dan tiba di *${tujuanValid}*.\n\n_${newLocationData.deskripsi}_`);
    }
    break

    // Lokasi
    case "lokasi": {
        const currentLocation = locations.find(loc => loc.nama === player.lokasi);
        if (!currentLocation) {
            await evarickreply("❌ *Error: Lokasi tidak ditemukan!*");
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
            let reply = `🔧 *ADMIN PANEL* 🔧\n\n`;
            reply += `*Commands:*\n`;
            reply += `!admin stats - Database statistics\n`;
            reply += `!admin backup - Create manual backup\n`;
            reply += `!admin ban [player] - Ban player\n`;
            reply += `!admin unban [player] - Unban player\n`;
            reply += `!admin reset [player] - Reset player data\n`;
            reply += `!admin give [player] [item] [amount] - Give item\n`;
            reply += `!admin gold [player] [amount] - Set gold\n`;
            reply += `!admin level [player] [level] - Set level\n`;
            reply += `!admin logs - View suspicious activity\n`;
            reply += `!admin cleanup - Clean old data\n`;
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
                
                await evarickreply(reply);
            }
            break;

            case 'backup': {
                const backupPath = createBackup();
                if (backupPath) {
                    await evarickreply(`✅ *Backup berhasil dibuat!*\n\nPath: ${backupPath}`);
                } else {
                    await evarickreply(`❌ *Backup gagal dibuat!*`);
                }
            }
            break;

            case 'ban': {
                const targetName = args.slice(1).join(' ');
                if (!targetName) {
                    await evarickreply(`⚠️ *Tentukan nama player!*\n\nContoh: !admin ban [nama]`);
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
                targetPlayer.banReason = args.slice(2).join(' ') || 'No reason provided';
                targetPlayer.banDate = new Date().toISOString();
                players[targetPlayer.id] = targetPlayer;
                savePlayerData(players);

                await evarickreply(`🚫 *${targetName} telah dibanned!*\n\nAlasan: ${targetPlayer.banReason}`);
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
                players[targetPlayer.id] = targetPlayer;
                savePlayerData(players);

                await evarickreply(`✅ *${targetName} telah diunban!*`);
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

                await evarickreply(`🔄 *Data ${targetName} telah direset!*`);
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

                await evarickreply(`🎁 *${amount} ${itemName} diberikan ke ${targetName}!*`);
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

                await evarickreply(`💰 *Gold ${targetName} diatur ke ${amount.toLocaleString()}!*`);
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

                await evarickreply(`📈 *Level ${targetName} diatur ke ${level}!*`);
            }
            break;

            case 'logs': {
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
            break;

            case 'cleanup': {
                // Clean old rate limits and suspicious activities
                const now = Date.now();
                const oneHourAgo = now - (60 * 60 * 1000);

                // Clean rate limits
                for (const [key, timestamps] of rateLimits.entries()) {
                    const validTimestamps = timestamps.filter(time => time > oneHourAgo);
                    if (validTimestamps.length === 0) {
                        rateLimits.delete(key);
                    } else {
                        rateLimits.set(key, validTimestamps);
                    }
                }

                // Clean suspicious activities
                for (const [key, activities] of suspiciousActivities.entries()) {
                    const validActivities = activities.filter(act => act.timestamp > oneHourAgo);
                    if (validActivities.length === 0) {
                        suspiciousActivities.delete(key);
                    } else {
                        suspiciousActivities.set(key, validActivities);
                    }
                }

                await evarickreply(`🧹 *Cleanup berhasil!*\n\nRate limits dan suspicious activities yang lama telah dibersihkan.`);
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
                await evarickreply(`❌ *Action tidak valid!*\n\nGunakan !admin untuk melihat menu.`);
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
            await evarickreply(battleLog.join('\n'));
            savePlayerData(players);
        } else {
            player.hp = 1;
            player.lokasi = 'Desa Awal';
            battleLog.push(`\n☠️ *KAMU KALAH!* ☠️`);
            battleLog.push(`Kamu pingsan dan kembali ke Desa Awal dengan sisa 1 HP.`);
            await evarickreply(battleLog.join('\n'));
            savePlayerData(players);
        }
    }
    break;

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
    break;

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
    break;

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
    break;

    // Mining
    case "nambang": {
        const currentLocation = locations.find(loc => loc.nama === player.lokasi);
        if (!currentLocation.aksi.includes('nambang')) await evarickreply("Kamu tidak bisa menambang di sini.");
        
        // Track mining activity for titles
        player.miningCount = (player.miningCount || 0) + 1;
        
        // Peluang mendapatkan item langka di lokasi khusus
        if (player.lokasi === 'Gunung Berapi' && Math.random() < 0.1) { // 10% chance
            player.tas['Kristal Api'] = (player.tas['Kristal Api'] || 0) + 1;
            await evarickreply("✨ Kamu menemukan Kristal Api yang langka saat menambang!");
        } else {
            player.tas['Batu'] = (player.tas['Batu'] || 0) + 1;
            await evarickreply("Kamu menambang dan mendapatkan 1 Batu!");
        }
        savePlayerData(players);
    }
    break;

    // Woodcutting
    case "nebang": {
        const currentLocation = locations.find(loc => loc.nama === player.lokasi);
        if (!currentLocation) {
            await evarickreply("❌ *Error: Lokasi saat ini tidak ditemukan!*");
        }
        if (!currentLocation.aksi.includes('nebang')) {
            await evarickreply("Kamu tidak bisa menebang pohon di sini.");
        }
        
        // Track woodcutting activity for titles
        player.woodcuttingCount = (player.woodcuttingCount || 0) + 1;
        
        if (!player.tas['Kayu']) {
            player.tas['Kayu'] = 1;
        } else {
            player.tas['Kayu']++;
        }
        await evarickreply("Kamu menebang pohon dan mendapatkan 1 Kayu!");
        savePlayerData(players);
    }
    break;

    // Fishing
    case "mancing": {
        const currentLocation = locations.find(loc => loc.nama === player.lokasi);
        if (!currentLocation.aksi.includes('mancing')) await evarickreply("Kamu tidak bisa memancing di sini.");

        // Track fishing activity for titles
        player.fishingCount = (player.fishingCount || 0) + 1;

        // Peluang mendapatkan item langka di lokasi khusus
        if (player.lokasi === 'Danau Tenang' && Math.random() < 0.05) { // 5% chance
            player.tas['Ikan Legendaris'] = (player.tas['Ikan Legendaris'] || 0) + 1;
            await evarickreply("🎣 LUAR BIASA! Kamu berhasil menangkap Ikan Legendaris!");
        } else {
            player.tas['Ikan'] = (player.tas['Ikan'] || 0) + 1;
            await evarickreply("Kamu memancing dan mendapatkan 1 Ikan!");
        }
        savePlayerData(players);
    }
    break;

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

        reply += `*=============== KAMI MEMBELI (JUAL) ===============*\n`;
        reply += `*--- Material Alam ---*\n`;
        materialDijual.forEach(item => {
            reply += `- ${item.nama} | Harga Jual: ${item.hargaJual} gold\n`;
        });

        reply += `\n*--- Loot Monster ---*\n`;
        lootDijual.forEach(item => {
            reply += `- ${item.nama} | Harga Jual: ${item.hargaJual} gold\n`;
        });

        reply += `\n--------------------------------------------------\n`;
        reply += `Gunakan: *!buy [nama item]* atau *!sell [nama item] [jumlah]*\n`;
        reply += `*💡 Item berubah setiap jam!*\n`;
        reply += `*📊 Gunakan !shopinfo untuk info detail*`;
        
        await evarickreply(reply);
    }
    break;

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
        if (player.lokasi !== "Desa Awal") await evarickreply("Kamu harus berada di Desa Awal untuk mengakses toko.");
        
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
        
        if (!itemName || amount < 1) await evarickreply("Format: !sell [nama item] [jumlah]\nContoh: !sell Kayu 5");

        // Cari item di tas pemain tanpa mempedulikan huruf besar/kecil
        const playerItemName = Object.keys(player.tas).find(i => i.toLowerCase() === itemName.toLowerCase());
        if (!playerItemName || player.tas[playerItemName] < amount) await evarickreply(`Kamu tidak punya ${amount} "${itemName}" di tasmu.`);

        const itemData = items.find(i => i.nama.toLowerCase() === itemName.toLowerCase());
        if (!itemData) await evarickreply("Item aneh, tidak terdaftar di sistem."); // Seharusnya tidak terjadi

        const totalGold = itemData.hargaJual * amount;
        player.tas[playerItemName] -= amount;
        if (player.tas[playerItemName] === 0) delete player.tas[playerItemName];
        
        player.gold += totalGold;
        await evarickreply(`Kamu menjual ${amount} ${playerItemName} dan mendapatkan ${totalGold} gold. Gold sekarang: ${player.gold}`);
        savePlayerData(players);
    }
    break;

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

    // Leaderboard System
    case "leaderboard":
    case "top":
    case "rank": {
        const allPlayers = loadPlayerData();
        const playerList = Object.entries(allPlayers)
            .filter(([id, playerData]) => playerData && playerData.hasChosenClass) // Only show registered players
            .map(([id, playerData]) => ({
                nama: playerData.nama,
                kelas: playerData.kelas,
                gold: playerData.gold || 0,
                level: calculateLevel(playerData),
                totalStats: calculateTotalStats(playerData)
            }))
            .sort((a, b) => b.gold - a.gold); // Sort by gold descending

        if (playerList.length === 0) {
            await evarickreply("📊 *Leaderboard Kosong*\n\nBelum ada pemain yang terdaftar di dunia RPG!");
            return;
        }

        // Get top 10 players
        const topPlayers = playerList.slice(0, 10);
        
        let reply = `🏆 *LEADERBOARD - TOP 10 PLAYERS* 🏆\n\n`;
        reply += `*Ranking berdasarkan Gold*\n\n`;

        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        
        topPlayers.forEach((playerData, index) => {
            const medal = medals[index] || `${index + 1}.`;
            const classEmoji = {
                'Fighter': '🗡️',
                'Assassin': '🔪', 
                'Mage': '🧙',
                'Tank': '🛡️',
                'Archer': '🏹',
                'Adventurer': '⚔️'
            }[playerData.kelas] || '⚔️';
            
            reply += `${medal} *${playerData.nama}*\n`;
            reply += `   ${classEmoji} ${playerData.kelas} | Level ${playerData.level}\n`;
            reply += `   💰 ${playerData.gold.toLocaleString()} Gold | ⚔️ ${playerData.totalStats} Total Stats\n\n`;
        });

        // Show player's own rank if registered and not in top 10
        if (player && player.hasChosenClass) {
            const playerRank = playerList.findIndex(p => p.nama === player.nama) + 1;
            if (playerRank > 10) {
                reply += `\n*🏅 Ranking Kamu:* #${playerRank}\n`;
                reply += `💰 ${player.gold.toLocaleString()} Gold | Level ${calculateLevel(player)}\n`;
            } else if (playerRank > 0) {
                reply += `\n*🎉 Kamu ada di Top 10!*`;
            }
        }

        reply += `\n*Gunakan !toplevel untuk ranking berdasarkan level*`;
        
        await evarickreply(reply);
    }
    break

    case "toplevel":
    case "levelboard": {
        const allPlayers = loadPlayerData();
        const playerList = Object.entries(allPlayers)
            .filter(([id, playerData]) => playerData && playerData.hasChosenClass)
            .map(([id, playerData]) => ({
                nama: playerData.nama,
                kelas: playerData.kelas,
                gold: playerData.gold || 0,
                level: calculateLevel(playerData),
                totalStats: calculateTotalStats(playerData)
            }))
            .sort((a, b) => b.level - a.level); // Sort by level descending

        if (playerList.length === 0) {
            await evarickreply("📊 *Level Leaderboard Kosong*\n\nBelum ada pemain yang terdaftar di dunia RPG!");
            return;
        }

        // Get top 10 players
        const topPlayers = playerList.slice(0, 10);
        
        let reply = `🏆 *LEVEL LEADERBOARD - TOP 10 PLAYERS* 🏆\n\n`;
        reply += `*Ranking berdasarkan Level*\n\n`;

        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        
        topPlayers.forEach((playerData, index) => {
            const medal = medals[index] || `${index + 1}.`;
            const classEmoji = {
                'Fighter': '🗡️',
                'Assassin': '🔪', 
                'Mage': '🧙',
                'Tank': '🛡️',
                'Archer': '🏹',
                'Adventurer': '⚔️'
            }[playerData.kelas] || '⚔️';
            
            reply += `${medal} *${playerData.nama}*\n`;
            reply += `   ${classEmoji} ${playerData.kelas} | Level ${playerData.level}\n`;
            reply += `   💰 ${playerData.gold.toLocaleString()} Gold | ⚔️ ${playerData.totalStats} Total Stats\n\n`;
        });

        // Show player's own rank if registered and not in top 10
        if (player && player.hasChosenClass) {
            const playerRank = playerList.findIndex(p => p.nama === player.nama) + 1;
            if (playerRank > 10) {
                reply += `\n*🏅 Ranking Kamu:* #${playerRank}\n`;
                reply += `💰 ${player.gold.toLocaleString()} Gold | Level ${calculateLevel(player)}\n`;
            } else if (playerRank > 0) {
                reply += `\n*🎉 Kamu ada di Top 10!*`;
            }
        }

        reply += `\n*Gunakan !leaderboard untuk ranking berdasarkan gold*`;
        
        await evarickreply(reply);
    }
    break

    // Title Commands
    case "titles": {
        if (!player) {
            await evarickreply(`❌ *Kamu belum terdaftar!*\n\nGunakan !daftar [nama] untuk mendaftar.`);
            return;
        }

        // Check for new titles first
        const newTitles = checkAndAwardTitles(player);
        players[participant] = player;
        savePlayerData(players);

        let reply = `🏆 *TITLE SYSTEM* 🏆\n\n`;
        
        if (newTitles.length > 0) {
            reply += `🎉 *TITLE BARU DIPEROLEH:*\n`;
            newTitles.forEach(title => {
                reply += `✨ ${title}\n`;
            });
            reply += `\n`;
        }

        if (player.titles && player.titles.length > 0) {
            reply += `*Title yang Dimiliki:*\n`;
            player.titles.forEach(title => {
                reply += `🏅 ${title}\n`;
            });
        } else {
            reply += `❌ *Belum ada title yang diperoleh*\n\n`;
        }

        reply += `\n*Gunakan !titleinfo untuk melihat semua title yang tersedia*`;
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
            `*Status Baru:*\n` +
            `Level: ${player.level}\n` +
            `Gold: ${player.gold.toLocaleString()}\n` +
            `HP: ${player.hp}/${player.maxHp}\n` +
            `Mana: ${player.mana}/${player.maxMana}\n` +
            `Attack: ${player.attack}\n` +
            `Defense: ${player.defense}\n\n` +
            `🌋 *KAMU SEKARANG ADALAH GOD KILLER!* 🌋\n` +
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

    // PvP Commands
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
            reply += `!pvp challenge [player] - Tantang player\n`;
            reply += `!pvp accept [player] - Terima tantangan\n`;
            reply += `!pvp decline [player] - Tolak tantangan\n`;
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

                const targetPlayer = Object.values(players).find(p => 
                    p.nama.toLowerCase() === targetName.toLowerCase()
                );

                if (!targetPlayer) {
                    await evarickreply(`❌ *Player "${targetName}" tidak ditemukan!*`);
                    return;
                }

                if (targetPlayer.nama === player.nama) {
                    await evarickreply(`🤔 *Kamu tidak bisa menantang dirimu sendiri!*`);
                    return;
                }

                // Check if already challenged
                const existingChallenge = Array.from(pvpChallenges.values()).find(
                    challenge => challenge.challenger === participant && challenge.challenged === targetPlayer.id
                );

                if (existingChallenge) {
                    await evarickreply(`⚠️ *Kamu sudah menantang ${targetName}!*\n\nTunggu mereka merespons.`);
                    return;
                }

                // Create challenge
                const challenge = {
                    challenger: participant,
                    challenged: targetPlayer.id,
                    challengerName: player.nama,
                    challengedName: targetPlayer.nama,
                    timestamp: Date.now(),
                    expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
                };

                pvpChallenges.set(`${participant}_${targetPlayer.id}`, challenge);

                await evarickreply(`⚔️ *Tantangan PvP dikirim ke ${targetName}!*\n\nMereka harus menggunakan !pvp accept ${player.nama} untuk menerima.`);
            }
            break;

            case 'accept': {
                const challengerName = args.slice(1).join(' ');
                if (!challengerName) {
                    await evarickreply(`⚠️ *Tentukan player yang menantang!*\n\nContoh: !pvp accept [nama]`);
                    return;
                }

                const challengerPlayer = Object.values(players).find(p => 
                    p.nama.toLowerCase() === challengerName.toLowerCase()
                );

                if (!challengerPlayer) {
                    await evarickreply(`❌ *Player "${challengerName}" tidak ditemukan!*`);
                    return;
                }

                const challengeKey = `${challengerPlayer.id}_${participant}`;
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
                initializePvPRanking(challengerPlayer.id);

                // Start battle
                const battle = simulatePvPBattle(challengerPlayer, player);
                const battleId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                pvpBattles.set(battleId, battle);

                // Update rankings
                const challengerRanking = pvpRankings.get(challengerPlayer.id);
                const playerRanking = pvpRankings.get(participant);

                let battleResult = '';
                let ratingChange1 = 0;
                let ratingChange2 = 0;

                if (battle.result === 'p1_win') {
                    battleResult = `🏆 *${challengerPlayer.nama} MENANG!* 🏆`;
                    ratingChange1 = calculateRatingChange(challengerRanking.rating, playerRanking.rating, 1);
                    ratingChange2 = calculateRatingChange(playerRanking.rating, challengerRanking.rating, 0);
                    
                    challengerRanking.wins++;
                    challengerRanking.streak++;
                    playerRanking.losses++;
                    playerRanking.streak = 0;
                } else if (battle.result === 'p2_win') {
                    battleResult = `🏆 *${player.nama} MENANG!* 🏆`;
                    ratingChange1 = calculateRatingChange(challengerRanking.rating, playerRanking.rating, 0);
                    ratingChange2 = calculateRatingChange(playerRanking.rating, challengerRanking.rating, 1);
                    
                    playerRanking.wins++;
                    playerRanking.streak++;
                    challengerRanking.losses++;
                    challengerRanking.streak = 0;
                } else {
                    battleResult = `🤝 *SERI!* 🤝`;
                    ratingChange1 = calculateRatingChange(challengerRanking.rating, playerRanking.rating, 0.5);
                    ratingChange2 = calculateRatingChange(playerRanking.rating, challengerRanking.rating, 0.5);
                    
                    challengerRanking.draws++;
                    playerRanking.draws++;
                    challengerRanking.streak = 0;
                    playerRanking.streak = 0;
                }

                // Update ratings
                challengerRanking.rating += ratingChange1;
                playerRanking.rating += ratingChange2;
                challengerRanking.totalBattles++;
                playerRanking.totalBattles++;
                challengerRanking.lastBattle = Date.now();
                playerRanking.lastBattle = Date.now();

                // Save battle result
                if (!player.pvpHistory) player.pvpHistory = [];
                if (!challengerPlayer.pvpHistory) challengerPlayer.pvpHistory = [];

                const battleRecord = {
                    id: battleId,
                    opponent: challengerPlayer.nama,
                    result: battle.result === 'p1_win' ? 'loss' : battle.result === 'p2_win' ? 'win' : 'draw',
                    ratingChange: ratingChange2,
                    timestamp: Date.now(),
                    rounds: battle.rounds
                };

                const challengerBattleRecord = {
                    id: battleId,
                    opponent: player.nama,
                    result: battle.result === 'p1_win' ? 'win' : battle.result === 'p2_win' ? 'loss' : 'draw',
                    ratingChange: ratingChange1,
                    timestamp: Date.now(),
                    rounds: battle.rounds
                };

                player.pvpHistory.push(battleRecord);
                challengerPlayer.pvpHistory.push(challengerBattleRecord);

                // Keep only last 50 battles
                if (player.pvpHistory.length > 50) player.pvpHistory = player.pvpHistory.slice(-50);
                if (challengerPlayer.pvpHistory.length > 50) challengerPlayer.pvpHistory = challengerPlayer.pvpHistory.slice(-50);

                // Save data
                players[participant] = player;
                players[challengerPlayer.id] = challengerPlayer;
                savePlayerData(players);

                // Send battle report
                let reply = `⚔️ *PvP BATTLE REPORT* ⚔️\n\n`;
                reply += `${battleResult}\n\n`;
                reply += `*📊 HASIL PERTARUNGAN:*\n`;
                reply += `Rounds: ${battle.rounds}\n`;
                reply += `${challengerPlayer.nama} HP: ${battle.p1FinalHp}\n`;
                reply += `${player.nama} HP: ${battle.p2FinalHp}\n\n`;
                
                reply += `*📈 RATING CHANGES:*\n`;
                reply += `${challengerPlayer.nama}: ${ratingChange1 > 0 ? '+' : ''}${ratingChange1} (${challengerRanking.rating})\n`;
                reply += `${player.nama}: ${ratingChange2 > 0 ? '+' : ''}${ratingChange2} (${playerRanking.rating})\n\n`;
                
                reply += `*💡 Battle ID: ${battleId}*`;

                await evarickreply(reply);
            }
            break;

            case 'decline': {
                const challengerName = args.slice(1).join(' ');
                if (!challengerName) {
                    await evarickreply(`⚠️ *Tentukan player yang menantang!*\n\nContoh: !pvp decline [nama]`);
                    return;
                }

                const challengerPlayer = Object.values(players).find(p => 
                    p.nama.toLowerCase() === challengerName.toLowerCase()
                );

                if (!challengerPlayer) {
                    await evarickreply(`❌ *Player "${challengerName}" tidak ditemukan!*`);
                    return;
                }

                const challengeKey = `${challengerPlayer.id}_${participant}`;
                const challenge = pvpChallenges.get(challengeKey);

                if (!challenge) {
                    await evarickreply(`❌ *Tidak ada tantangan dari ${challengerName}!*`);
                    return;
                }

                pvpChallenges.delete(challengeKey);
                await evarickreply(`❌ *Tantangan dari ${challengerName} ditolak.*`);
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
                
                allRankings.forEach((rank, index) => {
                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                    const winRate = rank.totalBattles > 0 ? ((rank.wins / rank.totalBattles) * 100).toFixed(1) : '0.0';
                    reply += `${medal} ${rank.nama}\n`;
                    reply += `   Rating: ${rank.rating} | W/L: ${rank.wins}/${rank.losses} (${winRate}%)\n\n`;
                });

                await evarickreply(reply);
            }
            break;

            case 'history': {
                if (!player.pvpHistory || player.pvpHistory.length === 0) {
                    await evarickreply(`📜 *Belum ada riwayat pertarungan PvP!*\n\nMulai bertarung dengan !pvp challenge [player]`);
                    return;
                }

                const recentBattles = player.pvpHistory.slice(-10); // Last 10 battles
                let reply = `📜 *RIWAYAT PvP (10 Terakhir)* 📜\n\n`;

                recentBattles.forEach((battle, index) => {
                    const resultEmoji = battle.result === 'win' ? '✅' : battle.result === 'loss' ? '❌' : '🤝';
                    const resultText = battle.result === 'win' ? 'MENANG' : battle.result === 'loss' ? 'KALAH' : 'SERI';
                    const ratingChange = battle.ratingChange > 0 ? `+${battle.ratingChange}` : battle.ratingChange;
                    const date = new Date(battle.timestamp).toLocaleDateString('id-ID');
                    
                    reply += `${index + 1}. ${resultEmoji} vs ${battle.opponent}\n`;
                    reply += `   ${resultText} | Rating: ${ratingChange} | Rounds: ${battle.rounds}\n`;
                    reply += `   ${date}\n\n`;
                });

                await evarickreply(reply);
            }
            break;

            case 'stats': {
                const ranking = pvpRankings.get(participant);
                const winRate = ranking.totalBattles > 0 ? ((ranking.wins / ranking.totalBattles) * 100).toFixed(1) : '0.0';
                
                let reply = `📊 *PvP STATISTIK* 📊\n\n`;
                reply += `👤 *Pemain:* ${player.nama}\n`;
                reply += `🏆 *Rating:* ${ranking.rating}\n`;
                reply += `✅ *Menang:* ${ranking.wins}\n`;
                reply += `❌ *Kalah:* ${ranking.losses}\n`;
                reply += `🤝 *Seri:* ${ranking.draws}\n`;
                reply += `📈 *Win Rate:* ${winRate}%\n`;
                reply += `🔥 *Streak:* ${ranking.streak}\n`;
                reply += `⚔️ *Total Battle:* ${ranking.totalBattles}\n`;
                
                if (ranking.lastBattle) {
                    const lastBattleDate = new Date(ranking.lastBattle).toLocaleDateString('id-ID');
                    reply += `📅 *Battle Terakhir:* ${lastBattleDate}`;
                }

                await evarickreply(reply);
            }
            break;

            default: {
                await evarickreply(`❌ *Action tidak valid!*\n\nGunakan !pvp untuk melihat menu.`);
            }
        }
    }
    break

        default: { await evarickreply(mess.default) }
    }
}