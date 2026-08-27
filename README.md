# Flappy Bird — Sky Challenge

Game Canvas vanilla HTML5, CSS3, dan JavaScript dengan sistem Online Global Leaderboard (Firebase Cloud Firestore), Active Dash Skill, Power-Up, Enemy Progression, Audio Synthesizer, serta Shop Kosmetik.

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
- **🐣 2 Anak Burung Pelindung Imut (Baby Guardian Birds)**: 2 anak burung mungil menggemaskan (*Pip* si pita merah muda & *Peep* si bunga sakura) yang selalu terbang mengawal induknya (permanen selamanya). Ketika ada musuh mendekat (*Enemy Bird*, *Bee Swarm*, *Flyer*, atau *Storm Cloud*), anak burung akan meluncur 1 per 1 dengan kecepatan tinggi menghancurkan musuh, meledakkannya dengan partikel sparkle ceria + menambah poin skor, lalu salto dan kembali ke samping induk!
- **⚡ Active Forward Dash Skill**: Skill aktif bawaan dengan cooldown radial 4.5s di pojok kiri bawah (tombol jumbo touch & shortcut `Shift` / `D` / `F` / `X`). Memberikan dorongan kecepatan +320 burst, kebal rintangan, bayangan afterimages, dan shockwave.
- **🔥 Firebase Firestore Online Leaderboard**: Peringkat global real-time dengan profil pemain, badge tier (Grandmaster, Master, Diamond, dll), loadout custom, dan Top #1 Champion Golden Spotlight.
- **🛡️ Sistem Power-Up**: Shield 🛡️, Dual Shield, Coin Magnet 🧲, Slow Time ❄️, Invincible Star ⭐, NOS Rocket Turbo 🚀.
- **👿 Sistem Enemy Progresif**: Enemy Bird 👿, Bee Swarm 🐝, Storm Cloud ☁️⚡, Speed Scaling dinamis.
- **🛍️ Shop Kosmetik Lengkap**: 10 Bird Skins (dengan jingle kematian unik), **6 Pilihan Skin Anak Burung (Baby Guardian Duos)**, 10 Tail Auras, 18 Topi (Hats), 16 Pakaian/Sayap (Outfits), 6 Pipe Skins, 7 Backgrounds, 6 Music Tracks, Starter Boosters.
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
