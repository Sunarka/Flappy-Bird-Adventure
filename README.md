# Feather Rush — Sky Challenge

Game Canvas arcade HTML5, CSS3, dan JavaScript dengan sistem Online Global Leaderboard (Firebase Cloud Firestore), Multiplayer 1v1 / 3P / 4P Sprint Race & Battle Royale, Active Dash Skill, Power-Up Tempur, Enemy Progression, Audio Synthesizer, serta Shop Kosmetik.

## 📁 Struktur Direktori

```text
flappy bird/
├── assets/             # Folder aset SVG, gambar, dan audio
├── css/                # File stylesheet styling tampilan & UI modal
│   ├── style.css
│   ├── shop.css
│   ├── store.css
│   ├── shop-extra.css
│   ├── mode-picker.css
│   ├── ranked.css
│   └── modern-icons.css
├── js/                 # Logika permainan, audio engine & Firebase
│   ├── firebase-config.js
│   └── script.js
├── index.html          # Halaman utama game
└── README.md           # Dokumentasi proyek
```

## 🎮 Fitur Utama
- **🐾 Sistem Pet Pendamping & Skill Unik (Unique Pet Companions)**: Dilengkapi tab khusus **`PETS`** di Shop! Setiap pet memiliki skill dan kemampuan pasif/aktif yang unik dan berbeda:
  - 🐣 **Pip & Peep (Canary Duo)**: Duo bodyguard pelindung yang meluncur menghancurkan musuh yang mendekat (1-hit kill) & menetas kembali (respawn 11 detik).
  - 🌸 **Momo & Hana (Sakura Fairies)**: Memberikan perisai bunga sakura pelindung otomatis setiap 16 detik.
  - 👼 **Aero & Lumos (Holy Angels)**: Memberikan berkah +1 Skor Ekstra & Bonus Koin setiap melewati 4 rintangan pipa.
  - 🤖 **Pixel & Glitch (Cyber Drones)**: Menembakkan laser listrik EMP otomatis tiap 4.5 detik untuk melumpuhkan musuh dari jarak jauh.
  - 🔥 **Blaze & Ember (Phoenix Sparks)**: Membakar musuh di jalur depan & melebarkan celah pipa sebesar +16px saat mendekat.
  - 😈 **Kuro & Void (Shadow Spirits)**: Mengurangi cooldown skill Dash sebesar 35% (dari 4.5s menjadi 2.9s) & gelombang bayangan ungu mistis.
- **⚡ Active Forward Dash Skill**: Skill aktif bawaan dengan cooldown radial di pojok kiri bawah (tombol jumbo touch & shortcut `Shift` / `D` / `F` / `X`). Memberikan dorongan kecepatan +320 burst, kebal rintangan, bayangan afterimages, dan shockwave.
- **🔥 Firebase Firestore Online Leaderboard**: Peringkat global real-time dengan profil pemain, badge tier (Grandmaster, Master, Diamond, dll), loadout custom, dan Top #1 Champion Golden Spotlight.
- **🛡️ Sistem Power-Up Lengkap**: Shield 🛡️, Dual Shield, Coin Magnet 🧲, Slow Time ❄️, Invincible Star ⭐, NOS Rocket Turbo 🚀.
- **👿 Sistem Enemy Progresif**: Enemy Bird 👿, Bee Swarm 🐝, Storm Cloud ☁️⚡, Speed Scaling dinamis.
- **🛍️ Shop Kosmetik & Perk Lengkap**: 10 Bird Skins, **6 Pet Pendamping Unik**, 10 Tail Auras, 18 Topi (Hats), 16 Pakaian/Sayap (Outfits), 6 Pipe Skins, 7 Backgrounds, 6 Music Tracks, Starter Boosters.
- **🎵 Synthesizer Web Audio API**: Full polyphonic multi-track compositions & audio SFX retro.

## 🔥 Cara Konfigurasi Firebase Firestore (Opsional)
Game sudah siap dimainkan dengan offline fallback otomatis. Untuk menghubungkan dengan database Firebase Anda sendiri:
1. Buat project di [Firebase Console](https://console.firebase.google.com/).
2. Aktifkan **Firestore Database** (mode Production atau Test).
3. Buka **Project Settings > General > Your Apps > Web (</>)** dan salin `firebaseConfig`.
4. Buka file `js/firebase-config.js` dan tempelkan `firebaseConfig` Anda.
5. (Opsional) Di tab **Firestore > Rules**, atur aturan keamanan:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /flappy_leaderboard/{docId} {
      allow read: if true;
      allow write: if request.resource.data.score is number && request.resource.data.name is string;
    }
  }
}
```

## 🚀 Cara Menjalankan
Buka `index.html` langsung di browser atau akses live demo di GitHub Pages:
👉 **https://sunarka.github.io/Flappy-Bird-Adventure/**
