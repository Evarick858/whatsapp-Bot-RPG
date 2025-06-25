// Import Module 
const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("baileys")
const pino = require("pino")
const chalk = require("chalk")
const readline = require("readline")
const { resolve } = require("path")
const { version } = require("os")

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

// Metode Pairing
const usePairingCode = true

// Promt Input Terminal
async function question(promt) {
    process.stdout.write(promt)
    const r1 = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    return new Promise((resolve) => r1.question("", (ans) => {
        r1.close()
        resolve(ans)
    }))
    
}

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('./EvarickSesi')
  
  // Versi Terbaru
  const { version, isLatest } = await fetchLatestBaileysVersion()
  console.log(`Evarick Using WA v${version.join('.')}, isLatest: ${isLatest}`)

  const evarick = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: !usePairingCode,
    auth: state,
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    version: version,
    syncFullHistory: true,
    generateHighQualityLinkPreview: true,
    getMessage: async (key) => {
      if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id)
        return msg?.message || undefined
      }
      return proto.Message.fromObject({})
    }
  })

  global.evarickInstance = evarick;

  // Handle Pairing Code
  if (usePairingCode && !evarick.authState.creds.registered) {
    try {
      const phoneNumber = await question('☘️ Masukan Nomor Yang Diawali Dengan 62 :\n')
      const code = await evarick.requestPairingCode(phoneNumber.trim())
      console.log(`🎁 Pairing Code : ${code}`)
    } catch (err) {
      console.error('Failed to get pairing code:', err)
    }
  }
    // Menyimpan Sesi Login
    evarick.ev.on("creds.update", saveCreds)

    // Informasi Koneksi
    let hasNotifiedAdmin = false;
    evarick.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update
        if ( connection === "close") {
            console.log(chalk.red("❌  Koneksi Terputus, Mencoba Menyambung Ulang"))
            hasNotifiedAdmin = false;
            connectToWhatsApp()
        } else if ( connection === "open") {
            console.log(chalk.green("✔  Bot Berhasil Terhubung Ke WhatsApp"))
            if (!hasNotifiedAdmin) {
                try {
                    const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
                    await evarick.sendMessage(
                        '6282239902921@s.whatsapp.net',
                        { text: `✅ *EVARICK BOT AKTIF!*

Halo Admin 👋
Bot *EVARICK* sudah berhasil terhubung ke WhatsApp!

*Status:* ONLINE
*Waktu:* ${now}

Bot siap melayani para player! 🚀

Jika ada kendala, Anda akan mendapat notifikasi otomatis dari bot ini.` }
                    );
                    hasNotifiedAdmin = true;
                } catch (err) {
                    console.error('Gagal mengirim pesan ke admin:', err);
                }
            }
        }
    })

    // Respon Pesan Masuk
    evarick.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0]

        if (!msg.message) return

        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
        const sender = msg.key.remoteJid
        const pushname = msg.pushName || "Evarick"

        // Log Pesan Masuk Terminal
        const listColor = ["red", "green", "yellow", "magenta", "cyan", "white", "blue"]
        const randomColor = listColor[Math.floor(Math.random() * listColor.length)]

        console.log(
            chalk.yellow.bold("Credit : Evarick"),
            chalk.green.bold("[ WhatsApp ]"),
            chalk[randomColor](pushname),
            chalk[randomColor](" : "),
            chalk.white(body)
            
        )

        require("./Evarick")(evarick, m)
    })
    
}

// Jalankan Koneksi WhatsApp
connectToWhatsApp()

// Kirim pesan ke admin jika terjadi error global
process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    try {
        const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        if (global.evarickInstance && typeof global.evarickInstance.sendMessage === 'function') {
            await global.evarickInstance.sendMessage(
                '6282239902921@s.whatsapp.net',
                { text: `❌ *EVARICK BOT ERROR!*

Terjadi *Unhandled Rejection* pada bot EVARICK.

*Waktu:* ${now}
*Detail Error:*
${reason}

Segera cek dan perbaiki agar bot tetap berjalan lancar!` }
            );
        }
    } catch (err) {
        console.error('Gagal mengirim error ke admin:', err);
    }
});

process.on('uncaughtException', async (err) => {
    console.error('Uncaught Exception:', err);
    try {
        const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        if (global.evarickInstance && typeof global.evarickInstance.sendMessage === 'function') {
            await global.evarickInstance.sendMessage(
                '6282239902921@s.whatsapp.net',
                { text: `❌ *EVARICK BOT ERROR!*

Terjadi *Uncaught Exception* pada bot EVARICK.

*Waktu:* ${now}
*Detail Error:*
${err}

Segera cek dan perbaiki agar bot tetap berjalan optimal!` }
            );
        }
    } catch (e) {
        console.error('Gagal mengirim error ke admin:', e);
    }
});