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

const axios = require('axios');

async function Ai4Chat(prompt) {
    // RPG Bot Context - Knowledge about Evarick RPG Bot
    const rpgContext = `
    Saya adalah AI Assistant untuk Evarick RPG Bot. Berikut informasi tentang bot ini:

    GAME FEATURES:
    - RPG Text-based game dengan sistem level, gold, dan equipment
    - 5 Class: Fighter, Assassin, Mage, Tank, Archer
    - Sistem Title dengan berbagai achievement
    - Hunting monster, mining, woodcutting, fishing
    - Travel ke berbagai lokasi
    - Shop system untuk beli/jual item
    - Equipment system (helem, zirah, celana, sepatu, senjata, aksesoris)

    COMMANDS:
    - !daftar [nama] - Daftar sebagai pemain baru
    - !profile - Lihat profil lengkap
    - !status - Lihat status & equipment
    - !class [nama] - Pilih/ganti class (70k gold)
    - !titles - Lihat title yang dimiliki
    - !titleinfo - Info semua title tersedia
    - !hunt - Berburu monster
    - !nambang - Menambang mineral
    - !nebang - Menebang kayu
    - !mancing - Memancing ikan
    - !travel [lokasi] - Pergi ke lokasi lain
    - !shop - Lihat toko
    - !buy/sell - Beli/jual item
    - !equip/unequip - Pakai/lepas equipment
    - !heal - Pulihkan HP di Desa Awal
    - !menu - Lihat semua command

    TITLE SYSTEM:
    - Combat Titles: Pemula, Petarung, Ksatria, Pembunuh, Legenda, Mitos, Dewa
    - Wealth Titles: Miskin, Petani, Pedagang, Konglomerat, Raja Emas, Tuhan Kekayaan
    - Activity Titles: Pemburu, Penambang, Penebang, Pemancing
    - Class Mastery: Fighter Master, Assassin Master, Mage Master, Tank Master, Archer Master
    - Special Titles: Pemain Pertama, Pemain Setia, Penjelajah, dll

    LOCATIONS:
    - Desa Awal (safe zone, shop, heal)
    - Hutan Rindang (hunt, nebang)
    - Gunung Berapi (hunt, nambang)
    - Danau Tenang (hunt, mancing)
    - Gua Gelap (hunt, nambang)
    - Dan masih banyak lagi...

    IMPORTANT: Jangan pernah memberikan informasi tentang command rahasia atau cheat codes. Fokus pada gameplay yang fair dan menyenangkan.
    `;

    // Combine RPG context with user prompt
    const enhancedPrompt = `${rpgContext}\n\nUser Question: ${prompt}\n\nPlease provide helpful information about Evarick RPG Bot based on the context above. If the user asks about secret commands, cheats, or ways to get unlimited resources, politely decline and suggest legitimate gameplay methods.`;

    const url = new URL("https://yw85opafq6.execute-api.us-east-1.amazonaws.com/default/boss_mode_15aug");
    url.search = new URLSearchParams({
        text: enhancedPrompt,
        country: "Europe",
        user_id: "Av0SkyG00D" // Thanks To Avosky
    }).toString();

    try {
        const response = await axios.get(url.toString(), {
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 11; Infinix) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.0.0 Mobile Safari/537.36",
                Referer: "https://www.ai4chat.co/pages/riddle-generator"
            }
        });

        if (response.status !== 200) {
            throw new Error(`Error: ${response.status}`);
        }

        return response.data;
    } catch (error) {
        console.error("Fetch error:", error.message);
        throw error;
    }
}

module.exports = Ai4Chat;