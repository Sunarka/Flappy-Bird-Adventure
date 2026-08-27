(() => {
  'use strict';
  const W = 360, H = 640, GROUND = 92;
  const State = Object.freeze({ MENU:'menu', READY:'ready', PLAYING:'playing', PAUSED:'paused', OVER:'over' });
  const $ = id => document.getElementById(id);
  const canvas = $('game'), ctx = canvas.getContext('2d');
  const el = {
    menu:$('menu'), ready:$('ready'), layer:$('modalLayer'), hud:$('hud'), score:$('score'), pop:$('scorePop'),
    best:$('menuBest'), sound:$('soundBtn'), musicBtn:$('musicBtn'), pause:$('pauseBtn'), how:$('howModal'),
    settings:$('settingsModal'), shop:$('shopModal'), paused:$('pauseModal'), over:$('overModal'),
    finalScore:$('finalScore'), finalBest:$('finalBest'), newBest:$('newBest'), medal:$('medal'),
    coinHud:$('coinHud'), coinCount:$('coinCount'), shopCoins:$('shopCoins'), shopTabs:$('shopTabs'),
    skinList:$('skinList'), powerupHud:$('powerupHud'), soundToggle:$('soundToggle'), musicToggle:$('musicToggle'),
    difficultyBtn:$('difficultyBtn'), difficultyValue:$('difficultyValue'), difficultyMenu:$('difficultyMenu'),
    shopCanvas:$('shopCanvas'), showcaseLabel:$('showcaseLabel'), tabPrev:$('tabPrev'), tabNext:$('tabNext'),
    modeClassicBtn:$('modeClassicBtn'), modeRankedBtn:$('modeRankedBtn'), modeBestLabel:$('modeBestLabel'),
    playBtn:$('playBtn'), rankedLeaderboardBtn:$('rankedLeaderboardBtn'), googlePlayBtn:$('googlePlayBtn'),
    googlePlayModal:$('googlePlayModal'), gpOnlineStatus:$('gpOnlineStatus'), gpAvatar:$('gpAvatar'),
    gpChangeAvatarBtn:$('gpChangeAvatarBtn'), gpGamerTagInput:$('gpGamerTagInput'), gpTierBadge:$('gpTierBadge'),
    gpRankedBest:$('gpRankedBest'), gpAuthActionBtn:$('gpAuthActionBtn'), gpSwitchAccountBtn:$('gpSwitchAccountBtn'),
    rankedModal:$('rankedModal'), championCanvas:$('championCanvas'), championGamerTag:$('championGamerTag'),
    championScore:$('championScore'), championTier:$('championTier'), championLoadoutTags:$('championLoadoutTags'),
    spotlightTitle:$('spotlightTitle'), leaderboardList:$('leaderboardList'), playRankedFromModalBtn:$('playRankedFromModalBtn'),
    dashBtn:$('dashBtn'), dashRingProgress:$('dashRingProgress'), dashCooldownText:$('dashCooldownText')
  };
  const storage = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} }
  };
  const settings = storage.get('skyFlappySettings', { sound:true, music:true, difficulty:'normal' });

  // 1. Skin Burung (Nama Lengkap) - ALL FREE FOR TESTING
  const skins = {
    classic:{ name:'CLASSIC BIRD', desc:'Burung kuning ceria (Chiptune SFX)', cost:0, body:'#ffd74c', wing:'#f4a62b', beak:'#f79831', trail:'#fff5b2' },
    rose:{ name:'ROSE PINK', desc:'Merah muda manis (Harp Chime SFX)', cost:0, body:'#ff8dab', wing:'#e85d87', beak:'#ffb15b', trail:'#ffc1d3' },
    mint:{ name:'MINT GREEN', desc:'Hijau tosca segar (Bouncy SFX)', cost:0, body:'#75e6c8', wing:'#35bd9d', beak:'#ffa94d', trail:'#b7fff0' },
    night:{ name:'NIGHT SKY', desc:'Biru malam mistis (Dark Bell SFX)', cost:0, body:'#8496ff', wing:'#576dcb', beak:'#e6b4ff', trail:'#d4c7ff' },
    cyber:{ name:'CYBER NEON', desc:'Ungu neon glitch (Laser Crash SFX)', cost:0, body:'#b5179e', wing:'#7209b7', beak:'#4cc9f0', trail:'#f72585' },
    phoenix:{ name:'PHOENIX FIRE', desc:'Api abadi membara (Flame Fanfare SFX)', cost:0, body:'#ff5400', wing:'#ff0054', beak:'#ffd60a', trail:'#ffbd00' },
    mecha:{ name:'MECHA CYBORG', desc:'Robot titanium & laser core (Laser SFX)', cost:0, body:'#cbd5e1', wing:'#64748b', beak:'#38bdf8', trail:'#38bdf8' },
    dragon:{ name:'FLAME DRAGON', desc:'Naga merah berapi tanduk emas (Fire SFX)', cost:0, body:'#dc2626', wing:'#991b1b', beak:'#fbbf24', trail:'#ff5400' },
    angel:{ name:'HOLY ANGEL', desc:'Burung suci sayap emas (Chime SFX)', cost:0, body:'#f8fafc', wing:'#fbbf24', beak:'#f59e0b', trail:'#fef08a' },
    shadow:{ name:'SHADOW PHANTOM', desc:'Bayangan ungu kosmik mistis (Dark SFX)', cost:0, body:'#312e81', wing:'#4c1d95', beak:'#c084fc', trail:'#9d4edd' }
  };

  // 2. Tail Aura / Jejak Ekor (Nama Lengkap) - ALL FREE FOR TESTING
  const auras = {
    default:{ name:'FEATHER TRAIL', desc:'Jejak bulu lembut melayang', cost:0, body:'#ffd74c', wing:'#fff5b2' },
    fire:{ name:'FIRE BLAZE', desc:'Lidah api berkobar & percikan bara', cost:0, body:'#ff5400', wing:'#ffd000' },
    rainbow:{ name:'RAINBOW GLOW', desc:'Pita pelangi & partikel bersinar', cost:0, body:'#ff70a6', wing:'#70d6ff' },
    galaxy:{ name:'COSMIC GALAXY', desc:'Galaksi spiral, cincin planet & komet', cost:0, body:'#9d4edd', wing:'#48cae4' },
    neon:{ name:'ELECTRIC LIGHTNING', desc:'Sambaran petir zig-zag & plasma', cost:0, body:'#00f5d4', wing:'#fee440' },
    bubble:{ name:'BUBBLE TRAIL', desc:'Gelembung sabun transparan pecah', cost:0, body:'#90e0ef', wing:'#00b4d8' },
    hearts:{ name:'SWEET HEARTS', desc:'Denyut cinta & serbuk manis', cost:0, body:'#ff4d6d', wing:'#ff85a1' },
    golden:{ name:'GOLDEN DUST', desc:'Koin emas berputar & kilau permata', cost:0, body:'#ffd700', wing:'#ffb703' },
    frost:{ name:'BLIZZARD FROST', desc:'Kristal es salju berkilauan', cost:0, body:'#67e8f9', wing:'#06b6d4' },
    plasma:{ name:'PLASMA SPARK', desc:'Percikan plasma listrik berenergi', cost:0, body:'#a855f7', wing:'#38bdf8' },
    sakura:{ name:'SAKURA PETALS', desc:'Kelopak sakura pink berguguran lembut', cost:0, body:'#f472b6', wing:'#fda4af' },
    matrix:{ name:'DIGITAL MATRIX', desc:'Jejak kode biner pixel hijau neon', cost:0, body:'#22c55e', wing:'#4ade80' }
  };

  // 3. Topi / Hats (Nama Lengkap) - ALL FREE FOR TESTING
  const hats = {
    none:{ name:'TANPA TOPI', desc:'Tampilan natural tanpa topi', cost:0 },
    tophat:{ name:'TOP HAT MAGIC', desc:'Topi pesulap elegan pita merah', cost:0 },
    cap:{ name:'BASEBALL SNAPBACK', desc:'Topi baseball sporty biru', cost:0 },
    crown:{ name:'ROYAL CROWN', desc:'Mahkota emas permata kerajaan', cost:0 },
    party:{ name:'PARTY CONE HAT', desc:'Topi kerucut pesta bergaris', cost:0 },
    cowboy:{ name:'COWBOY LEATHER', desc:'Topi koboi kulit bergesper', cost:0 },
    pirate:{ name:'PIRATE CAPTAIN', desc:'Topi kapten bajak laut tengkorak', cost:0 },
    chef:{ name:'CHEF MASTER HAT', desc:'Topi koki putih bertingkat', cost:0 },
    beanie:{ name:'WINTER BEANIE', desc:'Kupluk wol hangat musim dingin', cost:0 },
    flowercrown:{ name:'FLOWER BLOSSOM CROWN', desc:'Mahkota bunga sakura & mawar mekar', cost:0 },
    pinkribbon:{ name:'CUTE PINK RIBBON', desc:'Pita rambut merah muda berenda manis', cost:0 },
    sunhat:{ name:'SUMMER BEACH SUNHAT', desc:'Topi jerami pantai anggun pita sutra', cost:0 },
    tiara:{ name:'SPARKLING TIARA', desc:'Tiara putri perak bertabur permata pink', cost:0 },
    catears:{ name:'KITTY CAT EARS', desc:'Bando telinga kucing lucu dengan lonceng emas', cost:0 },
    viking:{ name:'VIKING HELMET', desc:'Helm besi perang bertanduk perkasa', cost:0 },
    astronaut:{ name:'SPACE HELMET', desc:'Helm astronot kaca emas kosmik', cost:0 },
    ninja:{ name:'NINJA HEADBAND', desc:'Ikat kepala shinobi merah berkibar', cost:0 },
    witch:{ name:'WITCH MAGIC HAT', desc:'Topi penyihir ungu bergesper emas', cost:0 },
    bunny:{ name:'FLUFFY BUNNY EARS', desc:'Telinga kelinci putih panjang lucu', cost:0 }
  };

  // 4. Outfit / Dasi & Aksesori (Nama Lengkap) - ALL FREE FOR TESTING
  const outfits = {
    none:{ name:'TANPA AKSESORI', desc:'Tampilan kasual polos', cost:0 },
    cape:{ name:'HERO FLYING CAPE', desc:'Jubah superhero merah berkibar', cost:0 },
    redtie:{ name:'RED TIE & SHIRT', desc:'Kemeja putih & dasi merah sutra', cost:0 },
    bluetie:{ name:'BLUE TIE & SHIRT', desc:'Kemeja biru & dasi polkadot', cost:0 },
    bowtie:{ name:'TUXEDO & BOW TIE', desc:'Rompi tuksedo & dasi kupu-kupu', cost:0 },
    goldchain:{ name:'GOLD CHAIN & JACKET', desc:'Jaket streetwear & kalung emas', cost:0 },
    scarf:{ name:'COZY SCARF SWEATER', desc:'Sweater tebal & syal rajut hangat', cost:0 },
    badge:{ name:'SHERIFF STAR BADGE', desc:'Rompi kulit & lencana sheriff emas', cost:0 },
    princessdress:{ name:'ROYAL PRINCESS GOWN', desc:'Gaun pesta merah muda renda berkilau', cost:0 },
    kimono:{ name:'SAKURA KIMONO SASH', desc:'Kimono sutra sakura & sabuk obi emas', cost:0 },
    fairy:{ name:'MAGICAL FAIRY WINGS', desc:'Gaun peri hijau mint & sayap bercahaya', cost:0 },
    ballerina:{ name:'BALLERINA SWAN TUTU', desc:'Rok tutu balet berombak & kalung mutiara', cost:0 },
    sailor:{ name:'SAILOR SCHOOLGIRL', desc:'Seragam pelaut manis dengan dasi pita merah', cost:0 },
    ninja_suit:{ name:'SHINOBI NINJA SCARF', desc:'Syal panjang ninja hitam berkibar', cost:0 },
    cyber_armor:{ name:'MECHA CHEST ARMOR', desc:'Zirah dada cyborg berinti reaktor menyala', cost:0 },
    hoodie:{ name:'URBAN STREET HOODIE', desc:'Hoodie streetwear abu-abu modern', cost:0 },
    angel_wings:{ name:'GLOWING SERAPH WINGS', desc:'Sayap malaikat bersinar terang', cost:0 },
    royal_robe:{ name:'KING VELVET ROBE', desc:'Mantel beludru raja berbulu ermine', cost:0 }
  };

  // 5. Pipa / Pipes (Nama Lengkap) - ALL FREE FOR TESTING
  const pipeSkins = {
    green:{ name:'GREEN CLASSIC', desc:'Pipa hijau klasik Mario', cost:0, body:'#287a55', wing:'#3dbb68', edge:'#216c4d', cap:'#53d878' },
    candy:{ name:'CANDY STRAWBERRY', desc:'Pipa permen manis stroberi', cost:0, body:'#b85c87', wing:'#ff91b8', edge:'#81405d', cap:'#ffb4cf' },
    neon:{ name:'NEON CYBERPUNK', desc:'Pipa biru neon cyberpunk', cost:0, body:'#3863a8', wing:'#5be6e0', edge:'#1c3677', cap:'#83fff5' },
    cyber:{ name:'GOLDEN CYBER', desc:'Pipa emas berenergi tinggi', cost:0, body:'#854d0e', wing:'#eab308', edge:'#713f12', cap:'#fde047' },
    crystal:{ name:'FROZEN ICE CRYSTAL', desc:'Pipa kristal es transparan biru', cost:0, body:'#0284c7', wing:'#38bdf8', edge:'#0369a1', cap:'#7dd3fc' },
    lava:{ name:'MAGMA VOLCANO', desc:'Pipa batu lahar panas retak membara', cost:0, body:'#450a0a', wing:'#dc2626', edge:'#1c1917', cap:'#f97316' },
    wood:{ name:'ANCIENT BAMBOO', desc:'Pipa bambu hijau alami bercabang', cost:0, body:'#4d7c0f', wing:'#65a30d', edge:'#365314', cap:'#84cc16' }
  };

  // 6. Backgrounds (Nama Lengkap) - ALL FREE FOR TESTING
  const backgrounds = {
    sky:{ name:'CLEAR BLUE SKY', desc:'Langit siang biru cerah', cost:0, top:'#72caed', bottom:'#d3f3f4', hill:'#75bb9b' },
    sunset:{ name:'WARM SUNSET', desc:'Senja jingga hangat romantis', cost:0, top:'#f89b75', bottom:'#ffe5a6', hill:'#c47772' },
    space:{ name:'DEEP COSMIC SPACE', desc:'Luar angkasa kosmik gelap', cost:0, top:'#182858', bottom:'#4c4a8c', hill:'#393c77' },
    forest:{ name:'MISTY GREEN FOREST', desc:'Hutan rimbun hijau asri', cost:0, top:'#2d6a4f', bottom:'#b7e4c7', hill:'#1b4332' },
    ocean:{ name:'DEEP OCEAN CORAL', desc:'Kedalaman laut biru & terumbu karang', cost:0, top:'#0369a1', bottom:'#0891b2', hill:'#0e7490' },
    volcano:{ name:'VOLCANIC LAVA', desc:'Kawah gunung berapi malam bara panas', cost:0, top:'#2e1065', bottom:'#7f1d1d', hill:'#450a0a' },
    synthwave:{ name:'80S SYNTHWAVE GRID', desc:'Grid neon ungu & matahari senja retro', cost:0, top:'#3b0764', bottom:'#ec4899', hill:'#831843' }
  };

  // 7. Musik (Nama Lengkap) - ALL FREE FOR TESTING
  const tracks = {
    happy:{ name:'HAPPY MELODY', desc:'Melodi ceria riang swing', cost:0, color:'#ffbf38' },
    bounce:{ name:'BOUNCE SYNTHWAVE', desc:'Irama disko synthwave dance', cost:0, color:'#f287b5' },
    arcade:{ name:'ARCADE CHIPTUNE', desc:'Chiptune 8-bit game retro', cost:0, color:'#7c8dff' },
    chill:{ name:'CHILL LO-FI JAZZ', desc:'Lo-Fi santai sunset jazz keys', cost:0, color:'#52b788' },
    epic:{ name:'HEROIC ADVENTURE', desc:'Orkestra petualangan megah & heroik', cost:0, color:'#ef4444' },
    cyberbeat:{ name:'CYBERPUNK BEAT', desc:'Electro synthwave tempo cepat energetik', cost:0, color:'#06b6d4' }
  };

  // 8. Starter Booster Perk (Skill Langsung Aktif Saat Mulai) - ALL FREE FOR TESTING
  const boosters = {
    none:{ name:'TANPA BOOSTER', desc:'Mulai game kasual tanpa skill instan', cost:0, color:'#94a3b8' },
    shield:{ name:'STARTER SHIELD', desc:'Mulai game langsung terlindungi perisai', cost:0, color:'#0284c7' },
    magnet:{ name:'STARTER MAGNET', desc:'Mulai game langsung menyedot semua koin', cost:0, color:'#dc2626' },
    slow:{ name:'STARTER SLOW ICE', desc:'Mulai game dengan waktu melambat 50%', cost:0, color:'#0891b2' },
    star:{ name:'STARTER STAR POWER', desc:'Mulai game dengan bintang kebal pelangi', cost:0, color:'#f59e0b' },
    rocket:{ name:'STARTER NOS ROCKET', desc:'Mulai game meluncur roket NOS turbo', cost:0, color:'#ea580c' },
    double_shield:{ name:'STARTER DUAL SHIELD', desc:'Mulai game dengan 2x lapisan perisai pelindung', cost:0, color:'#0284c7' }
  };

  const progress = storage.get('skyFlappyProgress', { coins:0, unlocked:['classic'], selected:'classic' });
  if(!Array.isArray(progress.unlocked)) progress.unlocked=['classic'];
  if(!skins[progress.selected]) progress.selected='classic';
  if(typeof progress.coins !== 'number') progress.coins=0;

  for(const [key, catalog, free] of [
    ['pipe', pipeSkins, 'green'],
    ['background', backgrounds, 'sky'],
    ['music', tracks, 'happy'],
    ['aura', auras, 'default'],
    ['hat', hats, 'none'],
    ['outfit', outfits, 'none'],
    ['booster', boosters, 'none']
  ]){
    const unlockedKey = key + 'Unlocked';
    const selectedKey = 'selected' + key[0].toUpperCase() + key.slice(1);
    if(!Array.isArray(progress[unlockedKey])) progress[unlockedKey] = [free];
    if(!catalog[progress[selectedKey]]) progress[selectedKey] = free;
  }

  let currentMode = 'classic'; // 'classic' | 'ranked'
  let classicBest = storage.get('skyFlappyBest', 0);
  let rankedBest = storage.get('skyFlappyRankedBest', 0);
  let best = classicBest, state = State.MENU, last = 0, started = false, score = 0,
      pipes = [], coins = [], flyers = [], particles = [],
      powerups = [], enemies = [], stormClouds = [],
      shockwaves = [], floatingTexts = [],
      spawn = 0, flyerSpawn = 0, trailSpawn = 0,
      powerupSpawnTimer = 0, enemySpawnTimer = 0, cloudSpawnTimer = 0,
      groundX = 0, cloudX = 0, shake = 0, overTimer = 0, lastGapY = 300, graceTimer = 0;

  // Active Dash Skill state
  let dashCooldown = 0, dashTimer = 0, dashAfterimages = [];
  const DASH_COOLDOWN_MAX = 4.5;

  // 2 Anak Burung Pelindung Imut (Baby Guardian Birds)
  const babyBirds = [
    {
      id: 0,
      name: 'Pip',
      x: 82, y: 262,
      r: 9,
      wing: 0,
      angle: 0,
      state: 'follow', // 'follow' | 'intercept' | 'return'
      targetEnemy: null,
      color: '#fef08a', // Canary Pastel Yellow
      wingColor: '#fde047',
      blushColor: '#fda4af',
      accessory: 'ribbon',
      flipAngle: 0
    },
    {
      id: 1,
      name: 'Peep',
      x: 78, y: 298,
      r: 8.5,
      wing: 0,
      angle: 0,
      state: 'follow', // 'follow' | 'intercept' | 'return'
      targetEnemy: null,
      color: '#bae6fd', // Sky Pastel Cyan
      wingColor: '#7dd3fc',
      blushColor: '#fda4af',
      accessory: 'flower',
      flipAngle: 0
    }
  ];

  function resetBabyBirds() {
    babyBirds[0].x = bird.x - 22;
    babyBirds[0].y = bird.y - 18;
    babyBirds[0].state = 'follow';
    babyBirds[0].targetEnemy = null;
    babyBirds[0].angle = 0;
    babyBirds[0].flipAngle = 0;

    babyBirds[1].x = bird.x - 26;
    babyBirds[1].y = bird.y + 18;
    babyBirds[1].state = 'follow';
    babyBirds[1].targetEnemy = null;
    babyBirds[1].angle = 0;
    babyBirds[1].flipAngle = 0;
  }

  // Active power-up states
  const activePowerups = { shield: false, magnet: 0, slow: 0, star: 0, rocket: 0 };
  const bird = { x:104, y:280, vy:0, r:16, wing:0, angle:0, dead:false };

  // Audio Engine with Full Synthesizer
  const audio = {
    ctx:null, musicTimer:null, deathTimer:null,
    init() {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if(this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    },
    tone(freq, dur=.1, type='sine', volume=.05, slide=0) {
      if(!settings.sound) return;
      this.playTone(freq, dur, type, volume, slide);
    },
    playTone(freq, dur, type, volume, slide=0) {
      try {
        this.init();
        const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, t);
        o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
        g.gain.setValueAtTime(volume, t);
        g.gain.exponentialRampToValueAtTime(.001, t + dur);
        o.connect(g).connect(this.ctx.destination);
        o.start(t);
        o.stop(t + dur);
      } catch(_) {}
    },
    flap() { this.tone(520, .07, 'triangle', .035, 180); },
    score() { this.tone(760, .13, 'sine', .05, 260); },
    hit() { this.tone(130, .2, 'sawtooth', .06, -70); },
    click() { this.tone(360, .045, 'square', .025, 70); },
    win() { this.tone(660, .16, 'triangle', .05, 500); },
    
    // Power-up & Skill Sound Effects & Jingles
    powerup(type) {
      if(!settings.sound) return;
      if(type === 'star') {
        // Star: Triumphant 8-bit Arcade Power Fanfare
        const notes = [523, 659, 784, 1046, 1318, 1568, 2093];
        notes.forEach((f, i) => {
          setTimeout(() => {
            this.playTone(f, 0.16, 'square', 0.05, 10);
            this.playTone(f * 0.5, 0.14, 'triangle', 0.035, 0);
          }, i * 38);
        });
      } else if(type === 'shield') {
        // Shield: Heavenly Protective Harmonic Resonance Chime
        const notes = [440, 554, 659, 880, 1108];
        notes.forEach((f, i) => {
          setTimeout(() => {
            this.playTone(f, 0.28, 'sine', 0.055, 0);
            this.playTone(f * 1.5, 0.18, 'triangle', 0.03, 10);
          }, i * 45);
        });
      } else if(type === 'slow') {
        // Slow Ice: Crystalline Glockenspiel Subzero Freeze Cascade
        const notes = [1046, 880, 784, 659, 523, 440];
        this.playTone(130, 0.6, 'sine', 0.07, -40);
        notes.forEach((f, i) => {
          setTimeout(() => {
            this.playTone(f, 0.25, 'triangle', 0.05, -30);
            this.playTone(f * 2, 0.1, 'sine', 0.025, 0);
          }, i * 50);
        });
      } else if(type === 'magnet') {
        // Magnet: Futuristic Electronic Magnetic Sweep & Pulse
        const notes = [330, 440, 554, 659, 880, 1108];
        notes.forEach((f, i) => {
          setTimeout(() => {
            this.playTone(f, 0.12, 'sawtooth', 0.035, 60);
            this.playTone(f, 0.15, 'sine', 0.05, 30);
          }, i * 35);
        });
      } else if(type === 'rocket') {
        // NOS Rocket: Supersonic Turbo Jet Ignition & Roar Power Chord!
        this.playTone(80, 0.7, 'sawtooth', 0.09, 300);
        this.playTone(160, 0.55, 'triangle', 0.08, 450);
        const powerChord = [220, 330, 440, 660, 880, 1320, 1760];
        powerChord.forEach((f, i) => {
          setTimeout(() => {
            this.playTone(f, 0.22, 'sawtooth', 0.045, 120);
            this.playTone(f * 0.75, 0.18, 'square', 0.03, 80);
          }, i * 30);
        });
      } else if(type === 'double_shield') {
        // Dual Shield: Double Layered High-Tech Protective Resonant Aegis
        this.playTone(220, 0.4, 'sine', 0.08, 60);
        this.playTone(440, 0.35, 'triangle', 0.06, 30);
        const notes1 = [523, 659, 784, 1046];
        notes1.forEach((f, i) => {
          setTimeout(() => {
            this.playTone(f, 0.22, 'sine', 0.05, 0);
          }, i * 35);
        });
        setTimeout(() => {
          this.playTone(330, 0.45, 'sawtooth', 0.065, 80);
          this.playTone(660, 0.3, 'triangle', 0.05, 40);
          const notes2 = [659, 880, 1046, 1318, 1760];
          notes2.forEach((f, i) => {
            setTimeout(() => {
              this.playTone(f, 0.25, 'sine', 0.055, 10);
              this.playTone(f * 1.5, 0.15, 'triangle', 0.03, 0);
            }, i * 40);
          });
        }, 130);
      }
    },
    birdChirp(skinId) {
      if(!settings.sound) return;
      this.flap();
      if(skinId === 'mecha') {
        this.playTone(880, 0.06, 'sawtooth', 0.04, 300);
        setTimeout(() => this.playTone(1320, 0.08, 'square', 0.035, -100), 50);
      } else if(skinId === 'dragon') {
        this.playTone(280, 0.12, 'sawtooth', 0.05, 150);
      } else if(skinId === 'angel') {
        this.playTone(1046, 0.15, 'sine', 0.05, 0);
        setTimeout(() => this.playTone(1568, 0.18, 'triangle', 0.035, 0), 40);
      } else if(skinId === 'shadow') {
        this.playTone(392, 0.14, 'sine', 0.04, -50);
      } else if(skinId === 'cyber') {
        this.playTone(660, 0.08, 'sawtooth', 0.04, 250);
      } else if(skinId === 'phoenix') {
        this.playTone(523, 0.1, 'triangle', 0.05, 200);
        setTimeout(() => this.playTone(1046, 0.12, 'sawtooth', 0.035, 100), 45);
      } else {
        // Classic / Rose / Mint / Night cheerful bird chirp
        this.playTone(784, 0.08, 'sine', 0.045, 150);
        setTimeout(() => this.playTone(1174, 0.1, 'triangle', 0.04, 100), 40);
      }
    },
    rocketSmash() {
      if(!settings.sound) return;
      this.playTone(180, 0.18, 'sawtooth', 0.08, -80);
      this.playTone(340, 0.12, 'square', 0.05, -120);
      setTimeout(() => this.playTone(880, 0.1, 'triangle', 0.05, 200), 20);
    },
    shieldBreak() {
      if(!settings.sound) return;
      this.playTone(880, 0.08, 'sawtooth', 0.06, -300);
      setTimeout(() => this.playTone(320, 0.18, 'triangle', 0.07, -150), 40);
    },
    thunder() {
      if(!settings.sound) return;
      this.playTone(180, 0.35, 'sawtooth', 0.08, -120);
      setTimeout(() => this.playTone(70, 0.5, 'sine', 0.09, -30), 50);
    },
    enemyAlert() {
      if(!settings.sound) return;
      this.playTone(480, 0.1, 'sawtooth', 0.025, -100);
    },
    dash() {
      if(!settings.sound) return;
      this.playTone(280, 0.18, 'sawtooth', 0.08, 600);
      this.playTone(1320, 0.2, 'sine', 0.06, -300);
      this.playTone(90, 0.35, 'triangle', 0.08, -50);
    },
    dashReady() {
      if(!settings.sound) return;
      this.playTone(1046, 0.08, 'triangle', 0.035, 100);
      setTimeout(() => this.playTone(1568, 0.1, 'sine', 0.03, 50), 35);
    },
    babyChirp() {
      if(!settings.sound) return;
      this.playTone(1568, 0.08, 'sine', 0.045, 300);
      setTimeout(() => this.playTone(2093, 0.1, 'triangle', 0.04, 200), 35);
    },
    babyAttack() {
      if(!settings.sound) return;
      this.playTone(880, 0.06, 'sawtooth', 0.055, 400);
      this.playTone(1760, 0.12, 'sine', 0.045, -200);
      setTimeout(() => this.playTone(1320, 0.1, 'triangle', 0.04, 150), 30);
    },

    // Distinct Death Jingles per Bird Skin (Sesuai dengan Karakter & Tema Burung)
    deathMusic() {
      if(!settings.sound) return;
      clearInterval(this.deathTimer);
      const skinId = progress.selected || 'classic';
      let step = 0;

      if(skinId === 'classic') {
        // Classic Bird: 8-bit Chiptune Downward Tumble
        const notes = [523, 494, 440, 349, 262, 196];
        this.playTone(notes[0], .2, 'square', .055, -20);
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .22, 'square', .05, step === notes.length - 1 ? -60 : -15);
        }, 160);
      } else if(skinId === 'rose') {
        // Rose Pink: Sweet Melancholy Harp Chord Cascade
        const notes = [880, 784, 659, 587, 523, 440, 392, 330];
        this.playTone(notes[0], .35, 'sine', .065, 0);
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .35, 'sine', .055, 0);
          if(step % 2 === 0) this.playTone(notes[step] * 1.5, .2, 'triangle', .025, 0);
        }, 130);
      } else if(skinId === 'mint') {
        // Mint Green: Bouncy Playful Bubble Slide Pop
        const notes = [659, 523, 659, 784, 880, 659, 392, 330, 262];
        this.playTone(notes[0], .15, 'triangle', .06, 30);
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .18, 'triangle', .055, step % 2 === 0 ? 40 : -30);
        }, 140);
      } else if(skinId === 'night') {
        // Night Sky: Deep Cosmic Bell & Minor Resonance
        const notes = [440, 415, 370, 330, 220];
        this.playTone(440, .45, 'sawtooth', .04, -10);
        this.playTone(110, .6, 'sine', .06, -5);
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .45, 'sawtooth', .038, -15);
          this.playTone(notes[step] / 2, .5, 'sine', .05, -5);
        }, 240);
      } else if(skinId === 'cyber') {
        // Cyber Neon: Glitch Laser Crash & 8-bit Downward Sweep
        this.playTone(1200, .15, 'sawtooth', .07, -800);
        this.playTone(240, .1, 'square', .05, 50);
        const notes = [880, 440, 220, 110, 55];
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .18, 'square', .06, -40);
          this.playTone(notes[step] * 1.414, .08, 'sawtooth', .035, 100);
        }, 120);
      } else if(skinId === 'phoenix') {
        // Phoenix Fire: Blazing Pyre Fanfare & Ash Dissipation
        const notes = [349, 440, 523, 698, 880, 1047, 1318];
        this.playTone(notes[0], .2, 'triangle', .06, 20);
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .25, 'sawtooth', .05, step === notes.length - 1 ? -100 : 30);
          this.playTone(notes[step] / 2, .3, 'triangle', .04, 0);
        }, 150);
      } else if(skinId === 'mecha') {
        // Mecha Cyborg: Robot Power Failure, Servo Drop & CPU Deactivation Glitch
        this.playTone(1046, .08, 'sawtooth', .065, -450);
        this.playTone(523, .1, 'square', .05, -200);
        const notes = [932, 784, 659, 523, 370, 261, 146, 73];
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) {
            this.playTone(45, .45, 'triangle', .08, -30);
            clearInterval(this.deathTimer); this.deathTimer = null; return;
          }
          this.playTone(notes[step], .14, 'square', .055, -40);
          this.playTone(notes[step] * 0.5, .18, 'sawtooth', .038, -20);
        }, 110);
      } else if(skinId === 'dragon') {
        // Flame Dragon: Roaring Dragon Breath & Heavy Fiery Doom March
        this.playTone(185, .5, 'sawtooth', .085, -70);
        this.playTone(92, .65, 'sawtooth', .09, -35);
        const notes = [370, 349, 311, 277, 246, 207, 164, 123, 82];
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .26, 'sawtooth', .055, -25);
          this.playTone(notes[step] * 0.5, .32, 'sawtooth', .065, -15);
        }, 135);
      } else if(skinId === 'angel') {
        // Holy Angel: Seraphic Cathedral Choir Chimes & Peaceful Ascension
        this.playTone(1047, .55, 'sine', .07, 0);
        this.playTone(1568, .45, 'triangle', .05, 0);
        const notes = [784, 880, 988, 1174, 1318, 1568, 1760, 2093];
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .42, 'sine', .058, 0);
          this.playTone(notes[step] * 1.5, .3, 'triangle', .028, 5);
        }, 130);
      } else if(skinId === 'shadow') {
        // Shadow Phantom: Ghostly Void Drone, Haunting Whisper & Abyss Descent
        this.playTone(293, .6, 'sine', .065, -60);
        this.playTone(146, .8, 'triangle', .08, -35);
        const notes = [587, 523, 466, 392, 349, 293, 233, 174, 116, 58];
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .38, 'sawtooth', .042, -20);
          this.playTone(notes[step] * 0.707, .42, 'sine', .048, -10);
        }, 145);
      }
    },

    // Completely Distinct Synthesized Music Tracks
    music() {
      if(!settings.music || this.musicTimer) return;
      const trackId = progress.selectedMusic || 'happy';
      let step = 0;
      this.init();

      if(trackId === 'happy') {
        // Happy Melody: Cheerful Chiptune Swing
        const melody = [523, 659, 784, 659, 587, 698, 880, 698, 659, 784, 1047, 784, 698, 880, 1047, 880, 523, 659, 784, 1047, 988, 880, 784, 659, 587, 698, 784, 698, 659, 587, 523, 0];
        const bass = [131, 0, 131, 0, 147, 0, 147, 0, 165, 0, 165, 0, 147, 0, 147, 0];
        this.musicTimer = setInterval(() => {
          if(state !== State.PLAYING) return;
          const note = melody[step % melody.length], low = bass[Math.floor(step / 2) % bass.length];
          if(note) this.playTone(note, .19, 'triangle', .022);
          if(low) this.playTone(low, .32, 'sine', .028);
          if(step % 4 === 2) this.playTone(1046, .045, 'square', .008);
          step++;
        }, 180);
      } else if(trackId === 'bounce') {
        // Bounce Synthwave: 80s Disco Dance
        const melody = [659, 784, 880, 784, 659, 784, 1047, 880, 988, 880, 784, 880, 659, 784, 880, 1047, 1174, 1047, 880, 784, 659, 784, 880, 988, 1047, 880, 784, 659, 587, 659, 784, 880];
        const bass = [220, 220, 175, 175, 196, 196, 165, 165, 220, 220, 175, 175, 196, 196, 247, 247];
        this.musicTimer = setInterval(() => {
          if(state !== State.PLAYING) return;
          const note = melody[step % melody.length], low = bass[step % bass.length];
          if(note) this.playTone(note, .14, 'square', .02);
          if(low) this.playTone(low, .22, 'sawtooth', .028, -20);
          if(step % 2 === 1) this.playTone(800, .04, 'sawtooth', .012, -400);
          step++;
        }, 140);
      } else if(trackId === 'arcade') {
        // Arcade Chiptune: High-Speed 8-bit Gaming Adventure
        const melody = [392, 523, 659, 784, 659, 523, 440, 523, 587, 698, 880, 1047, 880, 698, 587, 659, 784, 1047, 1318, 1047, 784, 659, 523, 659, 880, 1047, 1174, 1318, 1568, 1318, 1047, 784];
        const bass = [98, 131, 110, 147, 131, 165, 110, 147];
        this.musicTimer = setInterval(() => {
          if(state !== State.PLAYING) return;
          const note = melody[step % melody.length], low = bass[Math.floor(step / 2) % bass.length];
          if(note) this.playTone(note, .11, 'square', .024, step % 3 === 0 ? 20 : 0);
          if(low && step % 2 === 0) this.playTone(low, .18, 'triangle', .03);
          if(step % 4 === 0) this.playTone(1500, .03, 'square', .01);
          step++;
        }, 125);
      } else if(trackId === 'chill') {
        // Chill Lo-Fi Jazz: Smooth 7th Keys & Warm Bass
        const chords = [
          [440, 523, 659], [392, 494, 587], [349, 440, 523], [330, 392, 494],
          [349, 440, 523, 659], [392, 494, 587, 698], [440, 523, 659, 784], [330, 392, 494, 587]
        ];
        const bass = [110, 98, 87, 82, 87, 98, 110, 82];
        this.musicTimer = setInterval(() => {
          if(state !== State.PLAYING) return;
          const chord = chords[Math.floor(step / 2) % chords.length];
          const low = bass[Math.floor(step / 2) % bass.length];
          if(step % 2 === 0) {
            chord.forEach(f => this.playTone(f, .45, 'sine', .018));
            this.playTone(low, .55, 'sine', .035);
          } else {
            this.playTone(chord[step % chord.length] * 2, .25, 'triangle', .014);
          }
          step++;
        }, 230);
      } else if(trackId === 'epic') {
        // Heroic Adventure: Majestic Brass Fanfare & Marching Timpani
        const melody = [523, 659, 784, 1047, 880, 1047, 1318, 1047, 784, 880, 1047, 1318, 1568, 1318, 1047, 784, 523, 659, 784, 1047, 1174, 1047, 880, 784, 659, 784, 880, 1047, 1174, 1318, 1568, 1047];
        const brassBass = [131, 165, 196, 262, 220, 262, 330, 262, 196, 220, 262, 330, 392, 330, 262, 196];
        this.musicTimer = setInterval(() => {
          if(state !== State.PLAYING) return;
          const note = melody[step % melody.length], low = brassBass[Math.floor(step / 2) % brassBass.length];
          if(note) {
            this.playTone(note, .18, 'sawtooth', .024, 0);
            this.playTone(note * 0.5, .18, 'triangle', .02, 0);
          }
          if(low && step % 2 === 0) {
            this.playTone(low, .36, 'sawtooth', .032, -10);
            this.playTone(low * 0.5, .4, 'sine', .04, 0);
          }
          if(step % 4 === 0) this.playTone(160, .08, 'triangle', .035, -80);
          step++;
        }, 160);
      } else if(trackId === 'cyberbeat') {
        // Cyberpunk Beat: High-Energy Electro Synth & Gritty Bass
        const melody = [440, 523, 587, 659, 784, 659, 587, 523, 440, 587, 659, 784, 880, 784, 659, 587, 659, 784, 880, 1047, 880, 784, 659, 587, 440, 523, 659, 587, 523, 440, 392, 440];
        const cyberBass = [110, 110, 131, 110, 147, 110, 165, 131, 110, 110, 131, 110, 175, 165, 147, 131];
        this.musicTimer = setInterval(() => {
          if(state !== State.PLAYING) return;
          const note = melody[step % melody.length], low = cyberBass[step % cyberBass.length];
          if(note) this.playTone(note, .12, 'square', .022, step % 2 === 0 ? 15 : -15);
          if(low) this.playTone(low, .16, 'sawtooth', .034, -20);
          if(step % 2 === 1) this.playTone(950, .035, 'sawtooth', .014, -500);
          if(step % 4 === 0) this.playTone(70, .12, 'triangle', .04, -30);
          step++;
        }, 135);
      }
    },
    previewMusic(trackId) {
      this.stopMusic();
      this.stopPreview();
      if(!settings.sound && !settings.music) return;
      this.init();
      this.previewTrackId = trackId;
      let step = 0;

      if(trackId === 'happy') {
        const melody = [523, 659, 784, 659, 587, 698, 880, 698, 659, 784, 1047, 784, 698, 880, 1047, 880];
        const bass = [131, 0, 131, 0, 147, 0, 147, 0];
        this.previewTimer = setInterval(() => {
          const note = melody[step % melody.length], low = bass[Math.floor(step / 2) % bass.length];
          if(note) this.playTone(note, .19, 'triangle', .032);
          if(low) this.playTone(low, .32, 'sine', .038);
          if(step % 4 === 2) this.playTone(1046, .045, 'square', .012);
          step++;
        }, 180);
      } else if(trackId === 'bounce') {
        const melody = [659, 784, 880, 784, 659, 784, 1047, 880, 988, 880, 784, 880];
        const bass = [220, 220, 175, 175, 196, 196];
        this.previewTimer = setInterval(() => {
          const note = melody[step % melody.length], low = bass[step % bass.length];
          if(note) this.playTone(note, .14, 'square', .028);
          if(low) this.playTone(low, .22, 'sawtooth', .038, -20);
          step++;
        }, 140);
      } else if(trackId === 'arcade') {
        const melody = [392, 523, 659, 784, 659, 523, 440, 523, 587, 698, 880, 1047];
        const bass = [98, 131, 110, 147];
        this.previewTimer = setInterval(() => {
          const note = melody[step % melody.length], low = bass[Math.floor(step / 2) % bass.length];
          if(note) this.playTone(note, .11, 'square', .032, step % 3 === 0 ? 20 : 0);
          if(low && step % 2 === 0) this.playTone(low, .18, 'triangle', .038);
          step++;
        }, 125);
      } else if(trackId === 'chill') {
        const chords = [
          [440, 523, 659], [392, 494, 587], [349, 440, 523], [330, 392, 494]
        ];
        const bass = [110, 98, 87, 82];
        this.previewTimer = setInterval(() => {
          const chord = chords[Math.floor(step / 2) % chords.length];
          const low = bass[Math.floor(step / 2) % bass.length];
          if(step % 2 === 0) {
            chord.forEach(f => this.playTone(f, .45, 'sine', .026));
            this.playTone(low, .55, 'sine', .042);
          } else {
            this.playTone(chord[step % chord.length] * 2, .25, 'triangle', .02);
          }
          step++;
        }, 230);
      } else if(trackId === 'epic') {
        const melody = [523, 659, 784, 1047, 880, 1047, 1318, 1047, 784, 880, 1047, 1318, 1568, 1318, 1047, 784];
        const brassBass = [131, 165, 196, 262, 220, 262, 330, 262];
        this.previewTimer = setInterval(() => {
          const note = melody[step % melody.length], low = brassBass[Math.floor(step / 2) % brassBass.length];
          if(note) {
            this.playTone(note, .18, 'sawtooth', .032, 0);
            this.playTone(note * 0.5, .18, 'triangle', .025, 0);
          }
          if(low && step % 2 === 0) {
            this.playTone(low, .36, 'sawtooth', .042, -10);
            this.playTone(low * 0.5, .4, 'sine', .05, 0);
          }
          if(step % 4 === 0) this.playTone(160, .08, 'triangle', .045, -80);
          step++;
        }, 160);
      } else if(trackId === 'cyberbeat') {
        const melody = [440, 523, 587, 659, 784, 659, 587, 523, 440, 587, 659, 784, 880, 784, 659, 587];
        const cyberBass = [110, 110, 131, 110, 147, 110, 165, 131];
        this.previewTimer = setInterval(() => {
          const note = melody[step % melody.length], low = cyberBass[step % cyberBass.length];
          if(note) this.playTone(note, .12, 'square', .03, step % 2 === 0 ? 15 : -15);
          if(low) this.playTone(low, .16, 'sawtooth', .044, -20);
          if(step % 2 === 1) this.playTone(950, .035, 'sawtooth', .018, -500);
          if(step % 4 === 0) this.playTone(70, .12, 'triangle', .05, -30);
          step++;
        }, 135);
      }
    },
    stopPreview() {
      clearInterval(this.previewTimer);
      this.previewTimer = null;
      this.previewTrackId = null;
    },
    stopMusic() {
      clearInterval(this.musicTimer);
      clearInterval(this.deathTimer);
      this.stopPreview();
      this.musicTimer = null;
      this.deathTimer = null;
    }
  };

  function persist() { storage.set('skyFlappySettings', settings); }
  function persistProgress() { storage.set('skyFlappyProgress', progress); }
  function updateCoins() {
    el.coinHud.innerHTML = 'COINS <b>' + progress.coins + '</b>';
    el.coinCount.textContent = progress.coins;
    el.shopCoins.textContent = progress.coins;
  }

  function playBackgroundMusic() {
    try {
      const bg = $('bgMusic');
      if(!bg || !settings.music) return;
      bg.volume = 0.45;
      const p = bg.play();
      if(p && typeof p.catch === 'function') p.catch(() => {});
    } catch(_) {}
  }
  function stopBackgroundMusic() {
    try {
      const bg = $('bgMusic');
      if(!bg) return;
      bg.pause();
      bg.currentTime = 0;
    } catch(_) {}
  }
  function updateMusicUI() {
    const button = el.musicBtn;
    if(!button) return;
    button.innerHTML = settings.music ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V6l9-2v12"/><path d="M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3ZM18 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3Z"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V6l9-2v12"/><path d="M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3ZM18 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3Z"/><path d="m4 4 16 16"/></svg>';
    button.setAttribute('aria-label', settings.music ? 'Matikan musik' : 'Nyalakan musik');
  }

  // ==========================================
  // SHOP LOGIC & LIVE SHOWCASE STAGE
  // ==========================================
  let shopCategory = 'bird';
  const previewLoadout = {
    bird: 'classic',
    aura: 'default',
    hat: 'none',
    outfit: 'none',
    pipe: 'green',
    background: 'sky',
    music: 'happy'
  };
  let showcaseRunning = false;
  let showcaseParticles = [];
  let showcaseTrailTimer = 0;

  function syncPreviewLoadout() {
    previewLoadout.bird = progress.selected || 'classic';
    previewLoadout.aura = progress.selectedAura || 'default';
    previewLoadout.hat = progress.selectedHat || 'none';
    previewLoadout.outfit = progress.selectedOutfit || 'none';
    previewLoadout.pipe = progress.selectedPipe || 'green';
    previewLoadout.background = progress.selectedBackground || 'sky';
    previewLoadout.music = progress.selectedMusic || 'happy';
    updateShowcaseLabel();
  }

  function updateShowcaseLabel() {
    if(!el.showcaseLabel) return;
    const cat = shopCategory;
    const catCatalog = shopCatalog();
    const currentId = previewLoadout[cat] || 'none';
    const item = catCatalog[currentId];
    if(item) {
      el.showcaseLabel.textContent = 'PREVIEW: ' + item.name;
    } else {
      el.showcaseLabel.textContent = 'PREVIEW STAGE';
    }
  }

  function startShopShowcase() {
    if(showcaseRunning) return;
    showcaseRunning = true;
    showcaseParticles = [];
    requestAnimationFrame(renderShopShowcaseFrame);
  }

  function stopShopShowcase() {
    showcaseRunning = false;
  }

  function renderShopShowcaseFrame() {
    if(!showcaseRunning || !el.shopCanvas) return;
    const sCtx = el.shopCanvas.getContext('2d');
    const sW = el.shopCanvas.width, sH = el.shopCanvas.height;

    // 1. Background Sky Gradient
    const bg = backgrounds[previewLoadout.background] || backgrounds.sky;
    const sky = sCtx.createLinearGradient(0, 0, 0, sH);
    sky.addColorStop(0, bg.top);
    sky.addColorStop(1, bg.bottom);
    sCtx.fillStyle = sky;
    sCtx.fillRect(0, 0, sW, sH);

    // Mini Clouds
    const now = performance.now();
    const cloud1X = ((now / 70) % (sW + 70)) - 35;
    const cloud2X = (((now / 100) + 150) % (sW + 70)) - 35;
    sCtx.fillStyle = 'rgba(255,255,255,0.45)';
    sCtx.beginPath();
    sCtx.arc(cloud1X, 20, 11, 0, 7);
    sCtx.arc(cloud1X + 10, 16, 14, 0, 7);
    sCtx.arc(cloud1X + 22, 20, 10, 0, 7);
    sCtx.fill();

    sCtx.beginPath();
    sCtx.arc(cloud2X, 32, 9, 0, 7);
    sCtx.arc(cloud2X + 8, 29, 11, 0, 7);
    sCtx.arc(cloud2X + 18, 32, 8, 0, 7);
    sCtx.fill();

    // Mini Hills
    sCtx.fillStyle = bg.hill;
    sCtx.beginPath();
    sCtx.moveTo(0, sH - 20);
    for(let x = 0; x <= sW; x += 35) sCtx.quadraticCurveTo(x + 18, sH - 36 + (x % 70 ? 10 : 0), x + 35, sH - 20);
    sCtx.lineTo(sW, sH);
    sCtx.lineTo(0, sH);
    sCtx.fill();

    // 2. Mini Ground
    sCtx.fillStyle = '#46b65c';
    sCtx.fillRect(0, sH - 18, sW, 5);
    sCtx.fillStyle = '#b57a45';
    sCtx.fillRect(0, sH - 13, sW, 13);
    sCtx.fillStyle = '#e6ad5a';
    sCtx.fillRect(0, sH - 11, sW, 2);

    // 3. Mini Pipe on Right Side
    const pipeSkin = pipeSkins[previewLoadout.pipe] || pipeSkins.green;
    const pX = sW - 55, pW = 28, gapY = 16, gapSize = 36, cap = 5;
    sCtx.save();
    sCtx.fillStyle = pipeSkin.body;
    rrTo(sCtx, pX, 0, pW, gapY - cap, 3);
    rrTo(sCtx, pX, gapY + gapSize + cap, pW, sH - (gapY + gapSize + cap) - 18, 3);
    sCtx.fillStyle = pipeSkin.cap;
    rrTo(sCtx, pX - 3, gapY - cap, pW + 6, cap, 2);
    rrTo(sCtx, pX - 3, gapY + gapSize, pW + 6, cap, 2);
    sCtx.restore();

    // 4. Showcase Aura Trail Spawner & Particles
    showcaseTrailTimer += 0.033;
    if(showcaseTrailTimer > 0.05) {
      showcaseTrailTimer = 0;
      const bX = 110, bY = 40 + Math.sin(now / 240) * 4;
      const auraId = previewLoadout.aura || 'default';
      const colors = auraId === 'fire' ? ['#ff3b00', '#ffd000'] :
                     auraId === 'rainbow' ? ['hsl(' + ((now * 0.5) % 360) + ', 100%, 65%)'] :
                     auraId === 'galaxy' ? ['#c77dff', '#48cae4'] :
                     auraId === 'neon' ? ['#00f5d4', '#fee440'] :
                     auraId === 'bubble' ? ['#a0e7e5'] :
                     auraId === 'hearts' ? ['#ff4d6d', '#ff758f'] :
                     auraId === 'golden' ? ['#ffd700', '#fff066'] : ['#ffd74c'];
      const col = colors[Math.floor(Math.random() * colors.length)];
      showcaseParticles.push({
        x: bX - 16, y: bY + 3 + (Math.random() - .5) * 6,
        vx: -60 - Math.random() * 30, vy: (Math.random() - .5) * 20,
        life: 0.45, maxLife: 0.45, color: col, size: 3.5 + Math.random() * 3,
        type: auraId === 'fire' ? 'flame' : auraId === 'bubble' ? 'bubble' : auraId === 'hearts' ? 'heart' : auraId === 'golden' ? 'coin' : 'star'
      });
    }

    for(const q of showcaseParticles) {
      q.x += q.vx * 0.033;
      q.y += q.vy * 0.033;
      q.life -= 0.033;
      drawAuraParticleTo(sCtx, q);
    }
    showcaseParticles = showcaseParticles.filter(q => q.life > 0);

    // 5. Bird Preview
    const bX = 115, bY = 40 + Math.sin(now / 240) * 4;
    const bAngle = Math.sin(now / 240) * 0.06;
    const bWing = Math.sin(now / 120) > 0 ? 0.2 : 0;
    renderCustomBird(sCtx, {
      x: bX, y: bY, angle: bAngle, wing: bWing,
      skinId: previewLoadout.bird,
      hatId: previewLoadout.hat,
      outfitId: previewLoadout.outfit,
      opacity: 1
    });

    // 6. Floating Music Notes when previewing music
    if(audio.previewTrackId) {
      const noteOff = (now / 18) % 36;
      sCtx.fillStyle = '#fde047';
      sCtx.shadowColor = 'rgba(253,224,71,0.6)';
      sCtx.shadowBlur = 6;
      sCtx.font = 'bold 11px Arial';
      sCtx.fillText('NOTE', bX - 12, bY - 14 - noteOff);
      sCtx.fillStyle = '#67e8f9';
      sCtx.fillText('AUDIO', bX + 14, bY - 8 - ((noteOff + 18) % 36));
      sCtx.shadowBlur = 0;
    }

    requestAnimationFrame(renderShopShowcaseFrame);
  }

  function shopCatalog() {
    switch(shopCategory) {
      case 'bird': return skins;
      case 'booster': return boosters;
      case 'aura': return auras;
      case 'hat': return hats;
      case 'outfit': return outfits;
      case 'pipe': return pipeSkins;
      case 'background': return backgrounds;
      case 'music': return tracks;
      default: return skins;
    }
  }
  function shopKeys() {
    if(shopCategory === 'bird') return ['unlocked', 'selected'];
    return [shopCategory + 'Unlocked', 'selected' + shopCategory[0].toUpperCase() + shopCategory.slice(1)];
  }
  function getShopItemSvg(cat, id, item) {
    const b = item.body || item.color || '#38bdf8';
    const w = item.wing || item.edge || '#0284c7';
    const bk = item.beak || '#f97316';

    if(cat === 'bird') {
      return `<svg viewBox="0 0 32 32" class="shop-item-svg">
        <ellipse cx="14" cy="16" rx="11" ry="9" fill="${b}"/>
        <ellipse cx="6" cy="18" rx="6" ry="4.5" fill="#f59e0b"/>
        <path d="M22 13 L31 16 L22 19 Z" fill="${bk}"/>
        <path d="M22 16 L29 16" stroke="rgba(0,0,0,0.2)" stroke-width="1"/>
        <circle cx="18" cy="12" r="3.6" fill="#fff"/>
        <circle cx="19" cy="12" r="1.6" fill="#0f172a"/>
        <circle cx="19.5" cy="11.5" r="0.6" fill="#fff"/>
        <ellipse cx="11" cy="18" rx="6.5" ry="4" fill="${w}" transform="rotate(-10 11 18)"/>
      </svg>`;
    }

    if(cat === 'booster') {
      if(id === 'none') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="11" fill="none" stroke="#94a3b8" stroke-width="2.5"/><line x1="8" y1="8" x2="24" y2="24" stroke="#94a3b8" stroke-width="2.5"/></svg>`;
      }
      if(id === 'shield') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M16 4 L26 8 L24 20 L16 28 L8 20 L6 8 Z" fill="#0284c7" stroke="#7dd3fc" stroke-width="1.8"/><path d="M16 8 L22 11 L20 19 L16 24 L12 19 L10 11 Z" fill="#38bdf8"/></svg>`;
      }
      if(id === 'magnet') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M7 13 A9 9 0 0 1 25 13 V23 H20 V13 A4 4 0 0 0 12 13 V23 H7 Z" fill="#dc2626"/><rect x="7" y="19" width="5" height="5" fill="#e2e8f0"/><rect x="20" y="19" width="5" height="5" fill="#e2e8f0"/><path d="M4 11 A12 12 0 0 1 28 11" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="3 3"/></svg>`;
      }
      if(id === 'slow') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="12" fill="rgba(6,182,212,0.18)"/><line x1="16" y1="5" x2="16" y2="27" stroke="#0891b2" stroke-width="2.4"/><line x1="5" y1="16" x2="27" y2="16" stroke="#0891b2" stroke-width="2.4"/><line x1="8" y1="8" x2="24" y2="24" stroke="#0891b2" stroke-width="2.4"/><line x1="8" y1="24" x2="24" y2="8" stroke="#0891b2" stroke-width="2.4"/><circle cx="16" cy="16" r="3.5" fill="#67e8f9"/></svg>`;
      }
      if(id === 'star') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><polygon points="16,3 20,12 29,13 22,20 24,29 16,24 8,29 10,20 3,13 12,12" fill="#f59e0b" stroke="#fde047" stroke-width="1.8"/><polygon points="16,8 18.5,14 24,14.5 19.5,19 21,24.5 16,21 11,24.5 12.5,19 8,14.5 13.5,14" fill="#fef08a"/></svg>`;
      }
      if(id === 'rocket') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M16 4 Q25 11 22 23 L10 23 Q7 11 16 4 Z" fill="#ef4444"/><circle cx="16" cy="13" r="3.8" fill="#fff"/><circle cx="16" cy="13" r="2.2" fill="#38bdf8"/><path d="M10 18 L4 23 L10 23 Z" fill="#ea580c"/><path d="M22 18 L28 23 L22 23 Z" fill="#ea580c"/><polygon points="12,23 16,29 20,23" fill="#fde047"/></svg>`;
      }
      if(id === 'double_shield') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M13 3 L22 6 L20 17 L13 24 L6 17 L4 6 Z" fill="#0284c7" stroke="#7dd3fc" stroke-width="1.4"/><path d="M19 8 L28 11 L26 22 L19 29 L12 22 L10 11 Z" fill="#0369a1" stroke="#38bdf8" stroke-width="1.4"/><path d="M19 11 L24 14 L22 21 L19 25 L16 21 L14 14 Z" fill="#38bdf8"/></svg>`;
      }
    }

    if(cat === 'aura') {
      if(id === 'default') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M6 22 Q16 10 26 8 Q24 16 14 24 Z" fill="#ffd74c"/><path d="M10 26 Q18 16 26 14" stroke="#fff5b2" stroke-width="2"/></svg>`;
      }
      if(id === 'fire') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M16 4 Q24 14 18 20 Q24 22 22 28 Q16 32 10 28 Q4 22 12 16 Q10 10 16 4 Z" fill="#ff5400"/><path d="M16 12 Q20 18 16 22 Q19 24 18 27 Q14 29 12 26 Q10 22 14 18 Z" fill="#ffd000"/></svg>`;
      }
      if(id === 'rainbow') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M4 25 A12 12 0 0 1 28 25" fill="none" stroke="#ff4d6d" stroke-width="3"/><path d="M7 25 A9 9 0 0 1 25 25" fill="none" stroke="#ffd166" stroke-width="3"/><path d="M10 25 A6 6 0 0 1 22 25" fill="none" stroke="#06d6a0" stroke-width="3"/><path d="M13 25 A3 3 0 0 1 19 25" fill="none" stroke="#118ab2" stroke-width="3"/></svg>`;
      }
      if(id === 'galaxy') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="7" fill="#7c3aed"/><ellipse cx="16" cy="16" rx="14" ry="4.5" fill="none" stroke="#38bdf8" stroke-width="2" transform="rotate(-25 16 16)"/><circle cx="23" cy="10" r="1.5" fill="#fde047"/></svg>`;
      }
      if(id === 'neon') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><polygon points="18,3 8,17 15,17 12,29 24,14 17,14" fill="#00f5d4" stroke="#fee440" stroke-width="1.6"/></svg>`;
      }
      if(id === 'bubble') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="13" cy="18" r="8" fill="rgba(144,224,239,0.55)" stroke="#00b4d8" stroke-width="1.8"/><circle cx="10" cy="15" r="2.2" fill="#fff"/><circle cx="23" cy="11" r="5" fill="rgba(144,224,239,0.55)" stroke="#00b4d8" stroke-width="1.6"/></svg>`;
      }
      if(id === 'hearts') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M16 28 C7 20 3 14 3 9 A6 6 0 0 1 15 6 L16 8 L17 6 A6 6 0 0 1 29 9 C29 14 25 20 16 28 Z" fill="#ff4d6d" stroke="#ff758f" stroke-width="1.5"/><ellipse cx="10" cy="9" rx="2" ry="1.2" fill="#fff" transform="rotate(-30 10 9)"/></svg>`;
      }
      if(id === 'golden') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="11" fill="#ffd700" stroke="#b45309" stroke-width="1.8"/><circle cx="16" cy="16" r="8" fill="none" stroke="#fef08a" stroke-width="1.4"/><polygon points="16,10 18,14 22,16 18,18 16,22 14,18 10,16 14,14" fill="#fff"/></svg>`;
      }
      if(id === 'frost') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="12" fill="rgba(103,232,249,0.2)" stroke="#67e8f9" stroke-width="1.2"/><line x1="16" y1="4" x2="16" y2="28" stroke="#38bdf8" stroke-width="2.2"/><line x1="4" y1="16" x2="28" y2="16" stroke="#38bdf8" stroke-width="2.2"/><line x1="7" y1="7" x2="25" y2="25" stroke="#38bdf8" stroke-width="1.8"/><line x1="7" y1="25" x2="25" y2="7" stroke="#38bdf8" stroke-width="1.8"/><circle cx="16" cy="16" r="3" fill="#ffffff"/></svg>`;
      }
      if(id === 'plasma') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="9" fill="#a855f7" stroke="#c084fc" stroke-width="2"/><circle cx="16" cy="16" r="4.5" fill="#38bdf8"/><path d="M16 3 L16 8 M16 24 L16 29 M3 16 L8 16 M24 16 L29 16" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round"/></svg>`;
      }
      if(id === 'sakura') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="11" fill="rgba(244,114,182,0.15)"/><path d="M16 6 Q19 12 16 18 Q13 12 16 6 Z" fill="#f472b6"/><path d="M26 16 Q20 19 14 16 Q20 13 26 16 Z" fill="#fda4af"/><path d="M16 26 Q13 20 16 14 Q19 20 16 26 Z" fill="#f472b6"/><path d="M6 16 Q12 13 18 16 Q12 19 6 16 Z" fill="#fda4af"/><circle cx="16" cy="16" r="2.5" fill="#fde047"/></svg>`;
      }
      if(id === 'matrix') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><rect x="4" y="4" width="24" height="24" rx="4" fill="#052e16"/><text x="8" y="13" fill="#22c55e" font-family="monospace" font-size="7" font-weight="900">10</text><text x="18" y="13" fill="#4ade80" font-family="monospace" font-size="7" font-weight="900">01</text><text x="8" y="23" fill="#86efac" font-family="monospace" font-size="7" font-weight="900">11</text><text x="18" y="23" fill="#22c55e" font-family="monospace" font-size="7" font-weight="900">00</text></svg>`;
      }
    }

    if(cat === 'hat') {
      if(id === 'none') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="11" fill="none" stroke="#94a3b8" stroke-width="2.5"/><line x1="8" y1="8" x2="24" y2="24" stroke="#94a3b8" stroke-width="2.5"/></svg>`;
      }
      if(id === 'tophat') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><ellipse cx="16" cy="24" rx="14" ry="3" fill="#1e293b"/><path d="M9 24 L10 10 Q16 8 22 10 L23 24 Z" fill="#0f172a"/><rect x="9.5" y="20" width="13" height="3" fill="#dc2626"/><ellipse cx="16" cy="10" rx="6" ry="1.5" fill="#334155"/></svg>`;
      }
      if(id === 'cap') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M6 21 Q7 10 18 10 Q24 10 24 21 Z" fill="#2563eb"/><path d="M16 21 Q25 21 29 23 L22 25 Q16 23 6 21 Z" fill="#1d4ed8"/><circle cx="16" cy="10" r="1.5" fill="#fde047"/></svg>`;
      }
      if(id === 'crown') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M5 24 L7 10 L12 17 L16 8 L20 17 L25 10 L27 24 Z" fill="#f59e0b" stroke="#b45309" stroke-width="1.2"/><rect x="5" y="22" width="22" height="4" rx="1.5" fill="#fbbf24"/><circle cx="16" cy="8" r="1.8" fill="#ef4444"/><circle cx="7" cy="10" r="1.4" fill="#3b82f6"/><circle cx="25" cy="10" r="1.4" fill="#3b82f6"/></svg>`;
      }
      if(id === 'party') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><polygon points="16,4 7,26 25,26" fill="#ec4899"/><path d="M9 21 L23 21 L21 16 L11 16 Z" fill="#fde047"/><path d="M12 13 L20 13 L18 8 L14 8 Z" fill="#38bdf8"/><circle cx="16" cy="4" r="2.5" fill="#f59e0b"/></svg>`;
      }
      if(id === 'cowboy') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><ellipse cx="16" cy="22" rx="14" ry="4" fill="#78350f"/><path d="M10 21 Q11 12 16 14 Q21 12 22 21 Z" fill="#92400e"/><rect x="10.5" y="18.5" width="11" height="2" fill="#b45309"/></svg>`;
      }
      if(id === 'pirate') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M4 22 Q16 12 28 22 Q22 8 16 11 Q10 8 4 22 Z" fill="#0f172a" stroke="#fbbf24" stroke-width="1.2"/><circle cx="16" cy="17" r="2.5" fill="#fff"/><circle cx="15.2" cy="16.5" r="0.7" fill="#000"/><circle cx="16.8" cy="16.5" r="0.7" fill="#000"/></svg>`;
      }
      if(id === 'chef') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M10 24 L10 18 Q6 17 6 13 Q6 8 11 8 Q13 5 16 5 Q19 5 21 8 Q26 8 26 13 Q26 17 22 18 L22 24 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.4"/><rect x="10" y="21" width="12" height="4" fill="#e2e8f0"/></svg>`;
      }
      if(id === 'beanie') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M8 23 Q8 10 16 9 Q24 10 24 23 Z" fill="#dc2626"/><rect x="7" y="20" width="18" height="5" rx="2" fill="#991b1b"/><circle cx="16" cy="7.5" r="3" fill="#ffffff"/></svg>`;
      }
      if(id === 'flowercrown') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><ellipse cx="16" cy="20" rx="12" ry="4" fill="none" stroke="#15803d" stroke-width="2.2"/><circle cx="10" cy="18" r="3" fill="#f472b6"/><circle cx="16" cy="16" r="3.5" fill="#fb7185"/><circle cx="22" cy="18" r="3" fill="#f472b6"/><circle cx="16" cy="16" r="1.2" fill="#fde047"/></svg>`;
      }
      if(id === 'pinkribbon') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M16 16 L8 10 Q6 16 8 22 Z" fill="#f43f5e"/><path d="M16 16 L24 10 Q26 16 24 22 Z" fill="#f43f5e"/><rect x="14" y="14" width="4" height="4" rx="1.5" fill="#fb7185"/><path d="M15 18 L11 26 M17 18 L21 26" stroke="#e11d48" stroke-width="2.2"/></svg>`;
      }
      if(id === 'sunhat') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><ellipse cx="16" cy="22" rx="14" ry="4.5" fill="#fde047" stroke="#ca8a04" stroke-width="1.2"/><path d="M11 20 Q12 11 16 11 Q20 11 21 20 Z" fill="#eab308"/><rect x="11.5" y="18" width="9" height="2.2" fill="#ec4899"/></svg>`;
      }
      if(id === 'tiara') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M7 23 L9 13 L13 18 L16 9 L19 18 L23 13 L25 23 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.2"/><rect x="6" y="22" width="20" height="2.5" fill="#cbd5e1"/><circle cx="16" cy="12" r="2.2" fill="#ec4899"/><circle cx="16" cy="21" r="1.4" fill="#38bdf8"/></svg>`;
      }
      if(id === 'catears') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M7 22 Q16 12 25 22" fill="none" stroke="#f472b6" stroke-width="2.5"/><polygon points="8,19 6,8 14,14" fill="#f472b6"/><polygon points="8.5,17 7.5,10 12.5,14" fill="#fdf2f8"/><polygon points="24,19 26,8 18,14" fill="#f472b6"/><polygon points="23.5,17 24.5,10 19.5,14" fill="#fdf2f8"/><circle cx="9" cy="20" r="2" fill="#fbbf24"/></svg>`;
      }
      if(id === 'viking') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M7 21 Q7 11 16 11 Q25 11 25 21 Z" fill="#64748b" stroke="#334155" stroke-width="1.4"/><path d="M7 16 Q3 8 5 4 Q7 10 9 14 Z" fill="#fde047" stroke="#ca8a04" stroke-width="1.2"/><path d="M25 16 Q29 8 27 4 Q25 10 23 14 Z" fill="#fde047" stroke="#ca8a04" stroke-width="1.2"/><rect x="6" y="19" width="20" height="4" rx="1.5" fill="#475569"/></svg>`;
      }
      if(id === 'astronaut') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="12" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.6"/><ellipse cx="16" cy="16" rx="8" ry="6.5" fill="#f59e0b" stroke="#d97706" stroke-width="1.2"/><path d="M12 13 Q16 10 20 13" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/></svg>`;
      }
      if(id === 'ninja') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><rect x="4" y="13" width="24" height="6" rx="2" fill="#dc2626"/><circle cx="16" cy="16" r="2.8" fill="#ffffff" stroke="#b91c1c" stroke-width="0.8"/><path d="M26 15 L31 11 M26 17 L30 22" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/></svg>`;
      }
      if(id === 'witch') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><ellipse cx="16" cy="24" rx="14" ry="3.5" fill="#4c1d95"/><path d="M7 23 L16 4 L25 23 Z" fill="#581c87"/><rect x="8" y="20" width="16" height="3" fill="#f59e0b"/><rect x="14" y="19" width="4" height="5" rx="1" fill="none" stroke="#fef08a" stroke-width="1.4"/></svg>`;
      }
      if(id === 'bunny') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><ellipse cx="11" cy="12" rx="4" ry="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2"/><ellipse cx="11" cy="12" rx="2" ry="7" fill="#fbcfe8"/><ellipse cx="21" cy="12" rx="4" ry="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2"/><ellipse cx="21" cy="12" rx="2" ry="7" fill="#fbcfe8"/><rect x="8" y="21" width="16" height="3" rx="1.5" fill="#f472b6"/></svg>`;
      }
    }

    if(cat === 'outfit') {
      if(id === 'none') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="11" fill="none" stroke="#94a3b8" stroke-width="2.5"/><line x1="8" y1="8" x2="24" y2="24" stroke="#94a3b8" stroke-width="2.5"/></svg>`;
      }
      if(id === 'cape') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M12 6 Q16 4 20 6 Q28 16 26 27 Q18 24 14 27 Q8 16 12 6 Z" fill="#dc2626" stroke="#fbbf24" stroke-width="1.4"/><circle cx="16" cy="7" r="2" fill="#fbbf24"/></svg>`;
      }
      if(id === 'redtie') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><polygon points="10,6 16,9 22,6 19,4 13,4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/><polygon points="14,8 18,8 17,12 15,12" fill="#b91c1c"/><polygon points="15,12 17,12 19,23 16,28 13,23" fill="#dc2626"/><line x1="14" y1="17" x2="18" y2="17" stroke="#fbbf24" stroke-width="1.4"/></svg>`;
      }
      if(id === 'bluetie') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><polygon points="10,6 16,9 22,6 19,4 13,4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/><polygon points="14,8 18,8 17,12 15,12" fill="#1e3a8a"/><polygon points="15,12 17,12 19,23 16,28 13,23" fill="#2563eb"/><circle cx="16" cy="16" r="0.8" fill="#fff"/><circle cx="16" cy="20" r="0.8" fill="#fff"/></svg>`;
      }
      if(id === 'bowtie') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><polygon points="8,10 16,14 8,18" fill="#dc2626"/><polygon points="24,10 16,14 24,18" fill="#dc2626"/><rect x="14.5" y="12" width="3" height="4" rx="1" fill="#fbbf24"/></svg>`;
      }
      if(id === 'goldchain') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M8 8 Q16 16 24 8" fill="none" stroke="#fbbf24" stroke-width="2.5"/><circle cx="16" cy="18" r="6" fill="#f59e0b" stroke="#fbbf24" stroke-width="1.5"/><text x="16" y="21" font-size="8" font-weight="900" text-anchor="middle" fill="#78350f">$</text></svg>`;
      }
      if(id === 'scarf') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><rect x="8" y="10" width="16" height="6" rx="3" fill="#ea580c"/><path d="M12 14 L10 26 L14 26 L16 14 Z" fill="#c2410c"/><line x1="8" y1="13" x2="24" y2="13" stroke="#fde047" stroke-width="1.8"/></svg>`;
      }
      if(id === 'badge') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><polygon points="16,6 18.5,12 25,12.5 20,17 21.5,23.5 16,20 10.5,23.5 12,17 7,12.5 13.5,12" fill="#fbbf24" stroke="#d97706" stroke-width="1.2"/><circle cx="16" cy="15" r="2.5" fill="#78350f"/></svg>`;
      }
      if(id === 'princessdress') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M12 8 L20 8 L24 26 L8 26 Z" fill="#f472b6"/><path d="M10 18 Q16 14 22 18 L24 26 L8 26 Z" fill="#fbcfe8"/><circle cx="16" cy="8" r="2.5" fill="#e11d48"/></svg>`;
      }
      if(id === 'kimono') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M10 6 L22 6 L25 26 L7 26 Z" fill="#fda4af"/><path d="M10 6 L16 14 L22 6" fill="none" stroke="#fff" stroke-width="1.8"/><rect x="8" y="14" width="16" height="5" fill="#9d174d"/><rect x="8" y="15.5" width="16" height="1.8" fill="#fbbf24"/></svg>`;
      }
      if(id === 'fairy') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M16 16 Q8 6 4 12 Q4 20 16 18 Z" fill="rgba(110,231,183,0.75)"/><path d="M16 16 Q24 6 28 12 Q28 20 16 18 Z" fill="rgba(192,132,252,0.75)"/><polygon points="16,12 18,16 16,20 14,16" fill="#10b981"/></svg>`;
      }
      if(id === 'ballerina') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M12 6 L20 6 L19 14 L13 14 Z" fill="#f472b6"/><ellipse cx="16" cy="18" rx="11" ry="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/><ellipse cx="16" cy="17" rx="8" ry="3" fill="#fce7f3"/></svg>`;
      }
      if(id === 'sailor') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M10 6 L22 6 L24 24 L8 24 Z" fill="#1e3a8a"/><polygon points="12,6 20,6 16,15" fill="#ffffff"/><polygon points="14,14 18,14 16,19" fill="#dc2626"/></svg>`;
      }
      if(id === 'ninja_suit') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><rect x="6" y="8" width="20" height="8" rx="3" fill="#18181b"/><path d="M10 14 L5 27 L9 27 L13 14 Z" fill="#27272a"/><polygon points="22,12 25,18 20,16 26,22 18,20 22,26" fill="#94a3b8"/></svg>`;
      }
      if(id === 'cyber_armor') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M8 8 L24 8 L22 25 L10 25 Z" fill="#334155" stroke="#0284c7" stroke-width="1.5"/><circle cx="16" cy="16" r="4.5" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/><circle cx="16" cy="16" r="2" fill="#ffffff"/></svg>`;
      }
      if(id === 'hoodie') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M6 10 Q16 4 26 10 L24 26 L8 26 Z" fill="#475569"/><path d="M12 12 Q16 8 20 12 L18 22 L14 22 Z" fill="#64748b"/><line x1="14" y1="14" x2="13" y2="20" stroke="#cbd5e1" stroke-width="1.2"/><line x1="18" y1="14" x2="19" y2="20" stroke="#cbd5e1" stroke-width="1.2"/></svg>`;
      }
      if(id === 'angel_wings') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M16 16 Q8 4 3 10 Q3 22 16 20 Z" fill="#f8fafc" stroke="#fbbf24" stroke-width="1.2"/><path d="M16 16 Q24 4 29 10 Q29 22 16 20 Z" fill="#f8fafc" stroke="#fbbf24" stroke-width="1.2"/><circle cx="16" cy="16" r="2.5" fill="#fde047"/></svg>`;
      }
      if(id === 'royal_robe') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M8 6 L24 6 L26 26 L6 26 Z" fill="#991b1b"/><rect x="10" y="6" width="12" height="20" fill="#f8fafc"/><circle cx="16" cy="10" r="1" fill="#000"/><circle cx="16" cy="16" r="1" fill="#000"/><circle cx="16" cy="22" r="1" fill="#000"/><rect x="7" y="6" width="18" height="4" rx="2" fill="#fbbf24"/></svg>`;
      }
    }

    if(cat === 'pipe') {
      return `<svg viewBox="0 0 32 32" class="shop-item-svg"><rect x="10" y="12" width="12" height="16" rx="2" fill="${item.body}" stroke="${item.edge||'#000'}" stroke-width="1.2"/><rect x="8" y="6" width="16" height="7" rx="2" fill="${item.cap||item.body}" stroke="${item.edge||'#000'}" stroke-width="1.2"/><line x1="12" y1="6" x2="12" y2="28" stroke="rgba(255,255,255,0.4)" stroke-width="1.6"/></svg>`;
    }

    if(cat === 'background') {
      return `<svg viewBox="0 0 32 32" class="shop-item-svg"><rect x="3" y="3" width="26" height="26" rx="6" fill="${item.top}"/><path d="M3 20 Q16 12 29 20 L29 29 L3 29 Z" fill="${item.hill||item.bottom}"/><circle cx="21" cy="9" r="3" fill="#fef08a"/></svg>`;
    }

    if(cat === 'music') {
      return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="12" fill="${item.color||'#3b82f6'}"/><circle cx="16" cy="16" r="4.5" fill="#1e293b"/><circle cx="16" cy="16" r="1.5" fill="#ffffff"/><path d="M14 11 L20 9 L20 18 A2 2 0 1 1 18 16 L18 12 L14 13 Z" fill="#ffffff"/></svg>`;
    }

    return '';
  }

  function renderShop() {
    const [unlockedKey, selectedKey] = shopKeys(), catalog = shopCatalog();
    const previewClass = shopCategory === 'bird' ? '' :
      shopCategory === 'booster' ? 'booster-preview' :
      shopCategory === 'aura' ? 'aura-preview' :
      shopCategory === 'hat' ? 'hat-preview' :
      shopCategory === 'outfit' ? 'outfit-preview' :
      shopCategory === 'pipe' ? 'pipe-preview' :
      shopCategory === 'background' ? 'bg-preview' : 'music-preview';

    el.shopTabs.querySelectorAll('[data-shop-category]').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.shopCategory === shopCategory);
    });

    el.skinList.innerHTML = Object.entries(catalog).map(([id, item]) => {
      const unlocked = progress[unlockedKey].includes(id);
      const selected = progress[selectedKey] === id;
      const isPreviewing = previewLoadout[shopCategory] === id;
      const isPlayingPreview = shopCategory === 'music' && audio.previewTrackId === id;
      const body = item.body || item.top || item.color || '#e2e8f0';
      const wing = item.wing || item.bottom || item.color || '#94a3b8';
      const cap = item.cap || body, edge = item.edge || wing, top = item.top || body, bottom = item.bottom || wing, color = item.color || body;
      const iconSvg = getShopItemSvg(shopCategory, id, item);
      const desc = item.desc || '';

      let actionHtml = '';
      if(selected) {
        actionHtml = `<span class="skin-cost equipped">EQUIPPED</span>`;
      } else if(unlocked || item.cost === 0) {
        actionHtml = `<button class="skin-cost-btn use-btn" data-action="use" data-product="${id}" type="button">EQUIP</button>`;
      } else {
        const canAfford = progress.coins >= item.cost;
        actionHtml = `<button class="skin-cost-btn buy-btn ${canAfford ? '' : 'cant-afford'}" data-action="buy" data-product="${id}" type="button"><svg viewBox="0 0 16 16" width="12" height="12" class="mini-coin-svg"><circle cx="8" cy="8" r="6.5" fill="#fbbf24" stroke="#d97706" stroke-width="1.2"/><text x="8" y="11" text-anchor="middle" font-size="8" font-weight="900" fill="#92400e">$</text></svg> BUY ${item.cost}</button>`;
      }

      return `<div class="skin-card ${selected ? 'selected ' : ''}${isPreviewing ? 'previewing ' : ''}${isPlayingPreview ? 'playing-preview ' : ''}${unlocked ? '' : 'locked'}" data-card-product="${id}" style="--body:${body};--wing:${wing};--beak:${item.beak||body};--cap:${cap};--edge:${edge};--top:${top};--bottom:${bottom};--color:${color}">` +
        `<span class="skin-preview ${previewClass}">${iconSvg}</span>` +
        `<span class="skin-name">${item.name}</span>` +
        `<span class="skin-desc">${desc}</span>` +
        actionHtml +
        `</div>`;
    }).join('');

    // Klik Kartu -> Preview tampilan & suara tanpa membeli
    el.skinList.querySelectorAll('.skin-card').forEach(card => {
      card.onclick = (e) => {
        if(e.target.closest('.skin-cost-btn')) return;
        previewProduct(card.dataset.cardProduct);
      };
    });

    // Tombol Aksi: BUY atau EQUIP
    el.skinList.querySelectorAll('.skin-cost-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const id = btn.dataset.product;
        if(action === 'use') {
          equipProduct(id);
        } else if(action === 'buy') {
          buyProduct(id);
        }
      };
    });
  }

  // Preview Loadout di Showcase Stage
  function previewProduct(id) {
    const item = shopCatalog()[id];
    if(!item) return;
    previewLoadout[shopCategory] = id;
    updateShowcaseLabel();

    if(shopCategory === 'music') {
      audio.previewMusic(id);
    } else if(shopCategory === 'booster' && id !== 'none') {
      audio.powerup(id);
    } else if(shopCategory === 'bird') {
      audio.birdChirp(id);
    } else {
      audio.click();
    }
    renderShop();
  }

  // Pakai Item yang Sudah Dimiliki
  function equipProduct(id) {
    const [unlockedKey, selectedKey] = shopKeys(), item = shopCatalog()[id];
    if(!item) return;

    if(!progress[unlockedKey].includes(id)) {
      if(item.cost === 0) {
        progress[unlockedKey].push(id);
      } else {
        return;
      }
    }

    progress[selectedKey] = id;
    previewLoadout[shopCategory] = id;
    updateShowcaseLabel();
    audio.click();
    persistProgress();
    renderShop();

    if(shopCategory === 'music' && state === State.PLAYING) {
      audio.stopMusic();
      audio.music();
    }
  }

  // Beli Item Baru dengan Konfirmasi Tombol BUY
  function buyProduct(id) {
    const [unlockedKey, selectedKey] = shopKeys(), item = shopCatalog()[id];
    if(!item) return;
    previewLoadout[shopCategory] = id;
    updateShowcaseLabel();

    if(progress[unlockedKey].includes(id)) {
      equipProduct(id);
      return;
    }

    if(item.cost === 0 || progress.coins >= item.cost) {
      if(item.cost > 0) progress.coins -= item.cost;
      progress[unlockedKey].push(id);
      progress[selectedKey] = id;
      audio.win();
      makeParticles(180, 100, 24, '#fbbf24');
      persistProgress();
      updateCoins();
      renderShop();

      if(shopCategory === 'music' && state === State.PLAYING) {
        audio.stopMusic();
        audio.music();
      }
    } else {
      audio.hit();
      // Efek getar pada saldo koin saat koin tidak mencukupi
      if(el.shopCoins && el.shopCoins.parentElement) {
        el.shopCoins.parentElement.classList.remove('coin-shake');
        void el.shopCoins.parentElement.offsetWidth;
        el.shopCoins.parentElement.classList.add('coin-shake');
      }
    }
  }

  // ==========================================
  // GOOGLE PLAY GAMES & ONLINE LEADERBOARD
  // ==========================================
  let gpProfile = storage.get('skyFlappyGPProfile', {
    isLoggedIn: true,
    gamerTag: 'SkyHero#' + Math.floor(1000 + Math.random() * 9000),
    avatar: 'P1',
    level: 15,
    id: 'GP-' + Math.floor(1000000 + Math.random() * 9000000),
    isOnline: true
  });

  const availableAvatars = ['P1', 'ACE', 'PRO', 'TOP', 'SKY', 'MAX', 'FLY', 'VIP', 'BOT', 'NEO', 'AIR', 'RAY'];
  const randomTags = ['SkyKing', 'AeroAce', 'NovaDrift', 'CloudSurfer', 'VortexPilot', 'ThunderBird', 'SolarFlare', 'PixelKnight'];

  function saveGPProfile() {
    storage.set('skyFlappyGPProfile', gpProfile);
    syncGPProfileUI();
    if(rankedBest > 0 && typeof submitRankedScore === 'function') {
      submitRankedScore(rankedBest);
    }
  }

  function syncGPProfileUI() {
    if(!el.gpAvatar) return;
    el.gpAvatar.textContent = gpProfile.avatar;
    el.gpGamerTagInput.value = gpProfile.gamerTag;
    el.gpRankedBest.textContent = rankedBest;
    el.gpOnlineStatus.textContent = gpProfile.isLoggedIn ? '[ONLINE CONNECTED (FIREBASE)]' : '[OFFLINE DISCONNECTED]';
    el.gpOnlineStatus.className = 'gp-status ' + (gpProfile.isLoggedIn ? 'online' : 'offline');
    el.gpAuthActionBtn.textContent = gpProfile.isLoggedIn ? 'SIMPAN & CONNECT' : 'CONNECT GOOGLE PLAY';
    
    const tier = getRankTier(rankedBest);
    el.gpTierBadge.textContent = tier.name;
  }

  function getRankTier(s) {
    if(s >= 250) return { name: 'GRANDMASTER', color: '#facc15' };
    if(s >= 200) return { name: 'MASTER I', color: '#38bdf8' };
    if(s >= 150) return { name: 'DIAMOND I', color: '#818cf8' };
    if(s >= 100) return { name: 'PLATINUM I', color: '#2dd4bf' };
    if(s >= 50)  return { name: 'GOLD I', color: '#fde047' };
    if(s >= 20)  return { name: 'SILVER I', color: '#cbd5e1' };
    return { name: 'BRONZE I', color: '#f97316' };
  }

  function sanitizeLeaderboard(list) {
    if(!Array.isArray(list)) return [];
    const cleanAvatars = ['TOP', 'ACE', 'PRO', 'SKY', 'RAY', 'NEO', 'MAX', 'P1', 'FLY', 'VIP'];
    return list.map((item, idx) => {
      let av = String(item.avatar || cleanAvatars[idx % cleanAvatars.length]);
      av = av.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2300}-\u{23FF}\u{2B50}\u{2728}\u{2705}\u{274C}\u{2714}\u{2716}\u{25AA}-\u{25FE}]/ug, '').trim();
      if(!av || av.length > 4) av = cleanAvatars[idx % cleanAvatars.length];

      let tier = String(item.tier || 'BRONZE I').replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2300}-\u{23FF}\u{2B50}\u{2728}\u{2705}\u{274C}\u{2714}\u{2716}\u{25AA}-\u{25FE}]/ug, '').trim();
      let name = String(item.name || 'Player').replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2300}-\u{23FF}\u{2B50}\u{2728}\u{2705}\u{274C}\u{2714}\u{2716}\u{25AA}-\u{25FE}]/ug, '').trim();

      return {
        ...item,
        name: name || 'Player',
        tier: tier || 'BRONZE I',
        avatar: av
      };
    });
  }

  // Default Leaderboard Data
  const defaultLeaderboard = [
    {
      rank: 1,
      name: 'SkyKing_Legend',
      score: 284,
      tier: 'GRANDMASTER',
      avatar: 'TOP',
      loadout: {
        bird: 'phoenix',
        aura: 'galaxy',
        hat: 'crown',
        outfit: 'cape',
        pipe: 'gold',
        background: 'sunset'
      }
    },
    {
      rank: 2,
      name: 'CyberValkyrie',
      score: 241,
      tier: 'MASTER I',
      avatar: 'ACE',
      loadout: {
        bird: 'cyber',
        aura: 'fire',
        hat: 'tiara',
        outfit: 'goldchain',
        pipe: 'neon',
        background: 'space'
      }
    },
    {
      rank: 3,
      name: 'GoldenFalcon_99',
      score: 198,
      tier: 'DIAMOND I',
      avatar: 'PRO',
      loadout: {
        bird: 'classic',
        aura: 'golden',
        hat: 'catears',
        outfit: 'kimono',
        pipe: 'cyber',
        background: 'sunset'
      }
    },
    {
      rank: 4,
      name: 'ShadowDrifter',
      score: 165,
      tier: 'DIAMOND III',
      avatar: 'SKY',
      loadout: {
        bird: 'night',
        aura: 'neon',
        hat: 'cowboy',
        outfit: 'badge',
        pipe: 'green',
        background: 'forest'
      }
    },
    {
      rank: 5,
      name: 'SakuraWing',
      score: 142,
      tier: 'PLATINUM I',
      avatar: 'RAY',
      loadout: {
        bird: 'rose',
        aura: 'hearts',
        hat: 'flowercrown',
        outfit: 'princessdress',
        pipe: 'candy',
        background: 'sky'
      }
    },
    {
      rank: 6,
      name: 'PixelAce',
      score: 128,
      tier: 'PLATINUM II',
      avatar: 'NEO',
      loadout: {
        bird: 'mint',
        aura: 'rainbow',
        hat: 'cap',
        outfit: 'redtie',
        pipe: 'green',
        background: 'sky'
      }
    },
    {
      rank: 7,
      name: 'FrostGuardian',
      score: 110,
      tier: 'GOLD I',
      avatar: 'MAX',
      loadout: {
        bird: 'classic',
        aura: 'bubble',
        hat: 'beanie',
        outfit: 'fairy',
        pipe: 'neon',
        background: 'space'
      }
    }
  ];

  let leaderboardData = sanitizeLeaderboard(storage.get('skyFlappyLeaderboard', defaultLeaderboard));

  let selectedSpotlightPlayer = leaderboardData[0];
  let championShowcaseRunning = false;
  let championParticles = [];
  let championTrailTimer = 0;

  function submitRankedScore(s) {
    if(!gpProfile.isLoggedIn) return;
    const tier = getRankTier(s);
    
    let existingIndex = leaderboardData.findIndex(p => p.isUser || p.name === gpProfile.gamerTag);
    const userEntry = {
      isUser: true,
      id: gpProfile.id || gpProfile.gamerTag,
      name: gpProfile.gamerTag,
      score: Math.max(s, rankedBest),
      tier: tier.name,
      avatar: gpProfile.avatar,
      loadout: {
        bird: progress.selected || 'classic',
        aura: progress.selectedAura || 'default',
        hat: progress.selectedHat || 'none',
        outfit: progress.selectedOutfit || 'none',
        pipe: progress.selectedPipe || 'green',
        background: progress.selectedBackground || 'sky'
      }
    };

    if(existingIndex >= 0) {
      if(userEntry.score >= leaderboardData[existingIndex].score) {
        leaderboardData[existingIndex] = userEntry;
      }
    } else {
      leaderboardData.push(userEntry);
    }

    leaderboardData = sanitizeLeaderboard(leaderboardData);
    leaderboardData.sort((a, b) => b.score - a.score);
    leaderboardData.forEach((p, i) => p.rank = i + 1);

    storage.set('skyFlappyLeaderboard', leaderboardData);

    // Kirim Skor Tertinggi ke Firebase Firestore Global Leaderboard
    if(window.FirebaseLeaderboard && typeof window.FirebaseLeaderboard.submitScore === 'function') {
      window.FirebaseLeaderboard.submitScore(userEntry);
    }
  }

  // Sinkronisasi Real-time Global Leaderboard dari Firebase Firestore
  function syncLeaderboardFromFirebase() {
    if(!window.FirebaseLeaderboard || typeof window.FirebaseLeaderboard.listenToLeaderboard !== 'function') return;

    window.FirebaseLeaderboard.listenToLeaderboard(remoteScores => {
      if(Array.isArray(remoteScores) && remoteScores.length > 0) {
        const merged = [];
        const seen = new Set();

        // 1. Masukkan pemain dari Firebase
        remoteScores.forEach(r => {
          if(r && r.name) {
            const isMe = gpProfile && (r.name === gpProfile.gamerTag || r.id === gpProfile.id);
            seen.add(r.name);
            merged.push({
              ...r,
              isUser: isMe
            });
          }
        });

        // 2. Tambahkan entri pemain jika sudah pernah skor tapi belum masuk query
        if(gpProfile && gpProfile.gamerTag && rankedBest > 0 && !seen.has(gpProfile.gamerTag)) {
          seen.add(gpProfile.gamerTag);
          merged.push({
            isUser: true,
            id: gpProfile.id || gpProfile.gamerTag,
            name: gpProfile.gamerTag,
            score: rankedBest,
            tier: getRankTier(rankedBest).name,
            avatar: gpProfile.avatar,
            loadout: {
              bird: progress.selected || 'classic',
              aura: progress.selectedAura || 'default',
              hat: progress.selectedHat || 'none',
              outfit: progress.selectedOutfit || 'none',
              pipe: progress.selectedPipe || 'green',
              background: progress.selectedBackground || 'sky'
            }
          });
        }

        // 3. Tambahkan default bot/hall of fame jika daftar masih sedikit (< 7 pemain)
        defaultLeaderboard.forEach(d => {
          if(!seen.has(d.name) && merged.length < 12) {
            seen.add(d.name);
            merged.push(d);
          }
        });

        leaderboardData = sanitizeLeaderboard(merged);
        leaderboardData.sort((a, b) => b.score - a.score);
        leaderboardData.forEach((p, i) => p.rank = i + 1);

        storage.set('skyFlappyLeaderboard', leaderboardData);

        if(el.rankedModal && !el.rankedModal.classList.contains('hidden')) {
          renderLeaderboardList();
          startChampionSpotlight(selectedSpotlightPlayer || leaderboardData[0]);
        }
      }
    });
  }

  function setMode(mode, silent = false) {
    currentMode = mode;
    if(!silent) audio.click();
    el.modeClassicBtn.classList.toggle('active', mode === 'classic');
    el.modeRankedBtn.classList.toggle('active', mode === 'ranked');
    el.playBtn.textContent = mode === 'ranked' ? 'PLAY RANKED (EXTREME)' : 'PLAY CLASSIC';
    el.modeBestLabel.textContent = mode === 'ranked' ? 'RANKED BEST' : 'CLASSIC BEST';
    
    // Tampilkan tombol Leaderboard & Google Play HANYA di mode Ranked, sembunyikan sepenuhnya di Mode Classic!
    if(el.rankedLeaderboardBtn) {
      el.rankedLeaderboardBtn.classList.toggle('hidden', mode !== 'ranked');
      el.rankedLeaderboardBtn.style.display = mode === 'ranked' ? 'flex' : 'none';
    }
    if(el.googlePlayBtn) {
      el.googlePlayBtn.classList.toggle('hidden', mode !== 'ranked');
      el.googlePlayBtn.style.display = mode === 'ranked' ? 'block' : 'none';
    }

    updateScore();
    syncSettings();
  }

  function startChampionSpotlight(player) {
    selectedSpotlightPlayer = player || leaderboardData[0];
    updateChampionDetailsUI(selectedSpotlightPlayer);
    if(championShowcaseRunning) return;
    championShowcaseRunning = true;
    championParticles = [];
    requestAnimationFrame(renderChampionPortraitFrame);
  }

  function stopChampionSpotlight() {
    championShowcaseRunning = false;
  }

  function updateChampionDetailsUI(p) {
    if(!p || !el.championGamerTag) return;
    el.championGamerTag.textContent = p.name;
    el.championScore.textContent = p.score;
    el.championTier.textContent = p.tier;
    el.spotlightTitle.textContent = p.rank === 1 ? '#1 WORLD CHAMPION' : '#' + p.rank + ' RANKED SPOTLIGHT';

    const lo = p.loadout || {};
    const skinName = (skins[lo.bird] || skins.classic).name;
    const hatName  = (hats[lo.hat] || hats.none).name;
    const outfitName = (outfits[lo.outfit] || outfits.none).name;

    // Hanya tampilkan Burung, Topi (Hat), dan Aksesori (Outfit)
    let tagsHtml = '';
    tagsHtml += `<span class="cl-tag skin">SKIN: ${skinName}</span>`;
    if(lo.hat && lo.hat !== 'none') tagsHtml += `<span class="cl-tag hat">HAT: ${hatName}</span>`;
    if(lo.outfit && lo.outfit !== 'none') tagsHtml += `<span class="cl-tag outfit">OUTFIT: ${outfitName}</span>`;

    el.championLoadoutTags.innerHTML = tagsHtml;
  }

  function renderLeaderboardList() {
    if(!el.leaderboardList) return;
    leaderboardData = sanitizeLeaderboard(leaderboardData);
    leaderboardData.sort((a, b) => b.score - a.score);
    leaderboardData.forEach((p, i) => p.rank = i + 1);

    let html = '';
    leaderboardData.forEach(p => {
      const isTop1 = p.rank === 1;
      const rankClass = isTop1 ? 'gold' : p.rank === 2 ? 'silver' : p.rank === 3 ? 'bronze' : '';
      const rankBadge = isTop1 ? '#1' : p.rank === 2 ? '#2' : p.rank === 3 ? '#3' : `#${p.rank}`;
      const activeClass = (selectedSpotlightPlayer && selectedSpotlightPlayer.name === p.name) ? ' active-spotlight' : '';
      const userClass = p.isUser ? ' user-row' : '';

      html += `
        <div class="lb-row${activeClass}${userClass}" data-player-name="${p.name}">
          <span class="lb-rank ${rankClass}">${rankBadge}</span>
          <span class="lb-player"><b class="lb-av-badge">${p.avatar || 'P1'}</b> ${p.name}</span>
          <span class="lb-tier">${p.tier}</span>
          <span class="lb-score">${p.score}</span>
        </div>
      `;
    });

    el.leaderboardList.innerHTML = html;

    el.leaderboardList.querySelectorAll('.lb-row').forEach(row => {
      row.onclick = () => {
        const pName = row.dataset.playerName;
        const player = leaderboardData.find(p => p.name === pName);
        if(player) {
          audio.click();
          startChampionSpotlight(player);
          renderLeaderboardList();
        }
      };
    });
  }

  function renderChampionPortraitFrame() {
    if(!championShowcaseRunning || !el.championCanvas) return;
    const cCtx = el.championCanvas.getContext('2d');
    const cW = el.championCanvas.width, cH = el.championCanvas.height;
    const p = selectedSpotlightPlayer || leaderboardData[0];
    const lo = p.loadout || {};

    // 1. Background Sky Gradient
    const bg = backgrounds[lo.background] || backgrounds.sunset || backgrounds.sky;
    const sky = cCtx.createLinearGradient(0, 0, 0, cH);
    sky.addColorStop(0, bg.top);
    sky.addColorStop(1, bg.bottom);
    cCtx.fillStyle = sky;
    cCtx.fillRect(0, 0, cW, cH);

    // Mini Clouds
    const now = performance.now();
    const cloud1X = ((now / 65) % (cW + 60)) - 30;
    cCtx.fillStyle = 'rgba(255,255,255,0.4)';
    cCtx.beginPath();
    cCtx.arc(cloud1X, 16, 10, 0, 7);
    cCtx.arc(cloud1X + 10, 13, 13, 0, 7);
    cCtx.arc(cloud1X + 22, 16, 9, 0, 7);
    cCtx.fill();

    // Mini Hills
    cCtx.fillStyle = bg.hill;
    cCtx.beginPath();
    cCtx.moveTo(0, cH - 18);
    for(let x = 0; x <= cW; x += 35) cCtx.quadraticCurveTo(x + 18, cH - 32 + (x % 70 ? 8 : 0), x + 35, cH - 18);
    cCtx.lineTo(cW, cH);
    cCtx.lineTo(0, cH);
    cCtx.fill();

    // Mini Ground
    cCtx.fillStyle = '#46b65c';
    cCtx.fillRect(0, cH - 18, cW, 4);
    cCtx.fillStyle = '#b57a45';
    cCtx.fillRect(0, cH - 14, cW, 14);

    // 2. Mini Pipe Showcase on Right Side
    const pipeSkin = pipeSkins[lo.pipe] || pipeSkins.gold || pipeSkins.green;
    const pX = cW - 48, pW = 24, gapY = 14, gapSize = 34, cap = 4;
    cCtx.save();
    cCtx.fillStyle = pipeSkin.body;
    rrTo(cCtx, pX, 0, pW, gapY - cap, 2);
    rrTo(cCtx, pX, gapY + gapSize + cap, pW, cH - (gapY + gapSize + cap) - 14, 2);
    cCtx.fillStyle = pipeSkin.cap;
    rrTo(cCtx, pX - 2, gapY - cap, pW + 4, cap, 2);
    rrTo(cCtx, pX - 2, gapY + gapSize, pW + 4, cap, 2);
    cCtx.restore();

    // 3. Aura Trail Particles
    championTrailTimer += 0.033;
    if(championTrailTimer > 0.045) {
      championTrailTimer = 0;
      const bX = 105, bY = 38 + Math.sin(now / 220) * 4;
      const auraId = lo.aura || 'galaxy';
      const colors = auraId === 'fire' ? ['#ff3b00', '#ffd000'] :
                     auraId === 'rainbow' ? ['hsl(' + ((now * 0.5) % 360) + ', 100%, 65%)'] :
                     auraId === 'galaxy' ? ['#c77dff', '#48cae4'] :
                     auraId === 'neon' ? ['#00f5d4', '#fee440'] :
                     auraId === 'bubble' ? ['#a0e7e5'] :
                     auraId === 'hearts' ? ['#ff4d6d', '#ff758f'] :
                     auraId === 'golden' ? ['#ffd700', '#fff066'] : ['#ffd74c'];
      const col = colors[Math.floor(Math.random() * colors.length)];
      championParticles.push({
        x: bX - 16, y: bY + 3 + (Math.random() - .5) * 6,
        vx: -60 - Math.random() * 30, vy: (Math.random() - .5) * 20,
        life: 0.45, maxLife: 0.45, color: col, size: 3.5 + Math.random() * 3,
        type: auraId === 'fire' ? 'flame' : auraId === 'bubble' ? 'bubble' : auraId === 'hearts' ? 'heart' : auraId === 'golden' ? 'coin' : 'star'
      });
    }

    for(const q of championParticles) {
      q.x += q.vx * 0.033;
      q.y += q.vy * 0.033;
      q.life -= 0.033;
      drawAuraParticleTo(cCtx, q);
    }
    championParticles = championParticles.filter(q => q.life > 0);

    // 4. Bird Render (Champion Loadout)
    const bX = 110, bY = 38 + Math.sin(now / 220) * 4;
    const bAngle = Math.sin(now / 220) * 0.06;
    const bWing = Math.sin(now / 110) > 0 ? 0.2 : 0;
    renderCustomBird(cCtx, {
      x: bX, y: bY, angle: bAngle, wing: bWing,
      skinId: lo.bird || 'phoenix',
      hatId: lo.hat || 'crown',
      outfitId: lo.outfit || 'cape',
      opacity: 1
    });

    // 5. Radiant Golden Portrait Lighting & Spotlight Beams
    cCtx.save();
    const spotGrad = cCtx.createRadialGradient(bX, bY, 10, bX, bY, 75);
    spotGrad.addColorStop(0, 'rgba(254, 240, 138, 0.22)');
    spotGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.08)');
    spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    cCtx.fillStyle = spotGrad;
    cCtx.beginPath();
    cCtx.arc(bX, bY, 75, 0, Math.PI * 2);
    cCtx.fill();

    // Camera Blitz Glints across the canvas
    function drawGlint(gx, gy, gr) {
      cCtx.fillStyle = '#ffffff';
      cCtx.beginPath();
      cCtx.arc(gx, gy, gr, 0, Math.PI * 2);
      cCtx.fill();
    }
    drawGlint(35 + Math.sin(now / 300) * 10, 25, 2.5);
    drawGlint(cW - 35, cH - 28 + Math.cos(now / 350) * 6, 2.5);
    cCtx.restore();

    requestAnimationFrame(renderChampionPortraitFrame);
  }

  function showModal(modal) {
    el.layer.classList.remove('hidden');
    [el.how, el.settings, el.shop, el.paused, el.over, el.googlePlayModal, el.rankedModal].forEach(x => {
      if(x) x.classList.add('hidden');
    });
    if(modal) modal.classList.remove('hidden');
  }
  function closeModal() {
    audio.stopPreview();
    stopShopShowcase();
    stopChampionSpotlight();
    el.layer.classList.add('hidden');
  }
  function setState(next) {
    state = next;
    el.menu.classList.toggle('hidden', next !== State.MENU);
    el.ready.classList.toggle('hidden', next !== State.READY);
    el.hud.classList.toggle('hidden', next === State.MENU);
    if(currentMode === 'ranked') {
      el.coinHud.innerHTML = 'RANKED MATCH <b>EXTREME</b>';
    } else {
      el.coinHud.innerHTML = 'COINS <b>' + progress.coins + '</b>';
    }
    el.pause.style.display = (next === State.PLAYING || next === State.READY) ? 'block' : 'none';
    el.sound.style.display = (next === State.MENU || next === State.PLAYING || next === State.READY) ? 'block' : 'none';
    updateDashUI();
  }
  function reset() {
    score = 0; pipes = []; coins = []; flyers = []; particles = [];
    powerups = []; enemies = []; stormClouds = [];
    shockwaves = []; floatingTexts = [];
    activePowerups.shield = false;
    activePowerups.magnet = 0;
    activePowerups.slow = 0;
    activePowerups.star = 0;
    activePowerups.rocket = 0;
    dashCooldown = 0;
    dashTimer = 0;
    dashAfterimages = [];
    graceTimer = 0;
    spawn = 0; flyerSpawn = 0; trailSpawn = 0;
    powerupSpawnTimer = 0; enemySpawnTimer = 0; cloudSpawnTimer = 0;
    groundX = 0; shake = 0; started = false; lastGapY = 300;
    el.over.classList.remove('visible');
    Object.assign(bird, { x:104, y:285, vy:0, wing:0, angle:0, dead:false });
    resetBabyBirds();
    updateScore();
    updatePowerupHUD();
    updateDashUI();
  }

  // Active Dash Skill UI & Execution
  function updateDashUI() {
    if(!el.dashBtn) return;
    const isPlayingOrReady = state === State.PLAYING || state === State.READY;
    el.dashBtn.classList.toggle('hidden', !isPlayingOrReady);

    if(!isPlayingOrReady) return;

    const isReady = dashCooldown <= 0;
    el.dashBtn.classList.toggle('ready', isReady);
    el.dashBtn.classList.toggle('cooldown', !isReady);

    if(el.dashCooldownText) {
      el.dashCooldownText.textContent = isReady ? 'READY' : dashCooldown.toFixed(1) + 's';
    }

    if(el.dashRingProgress) {
      const circ = 125.6; // 2 * PI * 20
      const progressRatio = isReady ? 1 : Math.max(0, Math.min(1, 1 - (dashCooldown / DASH_COOLDOWN_MAX)));
      const offset = circ * (1 - progressRatio);
      el.dashRingProgress.style.strokeDashoffset = String(offset);
    }
  }

  function triggerDash() {
    if(state !== State.PLAYING && state !== State.READY) return;
    if(dashCooldown > 0) {
      audio.hit();
      return;
    }

    if(state === State.READY) {
      started = true;
      setState(State.PLAYING);
      audio.music();
      playBackgroundMusic();
      if(progress.selectedBooster && progress.selectedBooster !== 'none') {
        activatePowerup(progress.selectedBooster, bird.x, bird.y, true);
      }
    }

    dashCooldown = DASH_COOLDOWN_MAX;
    dashTimer = 0.28;
    graceTimer = Math.max(graceTimer, 0.45);
    bird.vy = Math.min(bird.vy, -130);
    bird.wing = 0.22;
    audio.dash();
    shake = 0.22;

    shockwaves.push({
      x: bird.x, y: bird.y, r: 10, maxR: 95,
      color: '#38bdf8',
      life: 0.45, maxLife: 0.45
    });

    floatingTexts.push({
      x: bird.x + 15, y: bird.y - 20,
      text: 'WARP DASH!',
      color: '#38bdf8',
      vy: -70,
      life: 0.75, maxLife: 0.75
    });

    makeParticles(bird.x, bird.y, 22, '#38bdf8');
    makeParticles(bird.x - 18, bird.y, 16, '#fde047');
    updateDashUI();
  }

  function goReady() { audio.click(); closeModal(); reset(); setState(State.READY); }
  function flap() {
    if(state === State.MENU || state === State.OVER || state === State.PAUSED) return;
    if(state === State.READY) {
      started = true;
      setState(State.PLAYING);
      audio.music();
      playBackgroundMusic();
      // Aktifkan Starter Booster yang dibeli/dipilih dari Shop seketika saat mulai terbang!
      if(progress.selectedBooster && progress.selectedBooster !== 'none') {
        activatePowerup(progress.selectedBooster, bird.x, bird.y, true);
      }
    }
    bird.vy = -310;
    bird.wing = .18;
    makeParticles(bird.x - 12, bird.y, 4, '#fff5b2');
    audio.flap();
  }
  function makePipe() {
    const isRanked = currentMode === 'ranked';
    const d = isRanked ? 'extreme' : settings.difficulty;
    const level = Math.floor(score / 5);
    const gapBase = isRanked ? 116 : (d === 'easy' ? 164 : d === 'hard' ? 132 : 148);
    const minGap = isRanked ? 84 : (d === 'easy' ? 104 : d === 'hard' ? 90 : 96);
    const gap = Math.max(minGap, gapBase - level * (isRanked ? 5 : 4));
    const margin = isRanked ? 58 : 72;
    const max = H - GROUND - gap - margin;
    let y = margin + Math.random() * (max - margin);
    y = Math.max(margin, Math.min(max, (y + lastGapY) / 2 + (Math.random() - .5) * (isRanked ? 125 : 95)));
    lastGapY = y;
    const pipe = { x: W + 28, gapY: y, gapSize: gap, w: 60, passed: false };
    pipes.push(pipe);

    // Cek apakah Skill Power-up muncul di celah tiang ini
    const powerupInterval = isRanked ? Math.max(8.0, 14.0 - Math.min(score, 100) * 0.05) : Math.max(6.5, 12.0 - Math.min(score, 100) * 0.05);
    const shouldSpawnPowerup = powerupSpawnTimer > powerupInterval && Math.random() < 0.85;

    if(shouldSpawnPowerup) {
      powerupSpawnTimer = 0;
      const rand = Math.random();
      // Shield 26%, Magnet 24%, Slow Time 20%, Star 15%, Rocket NOS 15%
      const type = rand < 0.26 ? 'shield' : rand < 0.50 ? 'magnet' : rand < 0.70 ? 'slow' : rand < 0.85 ? 'star' : 'rocket';
      powerups.push({
        x: pipe.x + pipe.w / 2,
        y: pipe.gapY + pipe.gapSize / 2,
        r: 15,
        type,
        bob: 0,
        rot: 0
      });
      // TIDAK ADA koin di tiang ini saat skill muncul!
    } else if(!isRanked && Math.random() < 0.75) {
      // Koin HANYA muncul di Mode Classic, Mode Ranked Extreme TIDAK DAPAT GOLD!
      coins.push({
        x: pipe.x + pipe.w / 2,
        y: pipe.gapY + pipe.gapSize / 2,
        r: 11,
        spin: Math.random() * Math.PI * 2
      });
    }
  }
  function makeFlyer() { flyers.push({ x: W + 35, y: 125 + Math.random() * (H - GROUND - 205), r: 15, wing: Math.random() * 6, speed: 1.05 + Math.random() * .18 }); }
  function updateScore() {
    el.score.textContent = score;
    best = currentMode === 'ranked' ? rankedBest : classicBest;
    el.best.textContent = best;
    if(el.modeBestLabel) {
      el.modeBestLabel.textContent = currentMode === 'ranked' ? 'RANKED BEST' : 'CLASSIC BEST';
    }
  }
  function addScore() {
    score++;
    updateScore();
    el.score.classList.remove('bump');
    void el.score.offsetWidth;
    el.score.classList.add('bump');
    el.pop.classList.remove('show');
    void el.pop.offsetWidth;
    el.pop.classList.add('show');
    makeParticles(180, 76, 9, '#fff0a8');
    audio.score();
    if(score === 10 || score === 25 || score === 50) makeParticles(180, 180, 25, '#ffe45c');
  }
  function makeParticles(x, y, count, color) {
    for(let i = 0; i < count; i++) {
      const life = .55 + Math.random() * .35;
      particles.push({ x, y, vx: (Math.random() - .5) * 100, vy: (Math.random() - .8) * 100, life, maxLife: life, color, size: 2 + Math.random() * 3, type: 'dot' });
    }
  }

  // ==========================================
  // SKILL ACTIVATION & VISUAL SPLASH SYSTEM
  // ==========================================
  function activatePowerup(type, x, y, isStarter = false) {
    if(!type || type === 'none') return;
    
    // Play distinctive skill jingle & fanfare
    audio.powerup(type);

    const px = x !== undefined ? x : bird.x;
    const py = y !== undefined ? y : bird.y;

    // Trigger visual splash & shockwave & floating badge
    triggerPowerupSplash(px, py, type, isStarter);

    // Apply skill duration & physics
    if(type === 'shield') {
      activePowerups.shield = true;
      activePowerups.shieldCount = 1;
    } else if(type === 'double_shield') {
      activePowerups.shield = true;
      activePowerups.shieldCount = 2;
    } else if(type === 'magnet') {
      activePowerups.magnet = 7.5;
    } else if(type === 'slow') {
      activePowerups.slow = 6.5;
    } else if(type === 'star') {
      activePowerups.star = 5.5;
    } else if(type === 'rocket') {
      activePowerups.rocket = 5.0;
      shake = 0.35;
      makeParticles(px, py, 28, '#f97316');
    }

    updatePowerupHUD();
  }

  function triggerPowerupSplash(x, y, type, isStarter = false) {
    const info = {
      shield: { text: isStarter ? 'STARTER SHIELD' : '+SHIELD GUARD', color: '#38bdf8' },
      double_shield: { text: 'DUAL SHIELD LAYER', color: '#0284c7' },
      magnet: { text: isStarter ? 'STARTER MAGNET' : '+MAGNET PULL', color: '#f43f5e' },
      slow:   { text: isStarter ? 'STARTER FREEZE' : '+TIME FREEZE', color: '#67e8f9' },
      star:   { text: isStarter ? 'STARTER STAR'   : '+STAR POWER',   color: '#fbbf24' },
      rocket: { text: isStarter ? 'NOS TURBO BLAST': '+NOS ROCKET BOOST', color: '#ea580c' }
    }[type] || { text: '+POWER-UP!', color: '#fff' };

    // 1. Expanding Shockwaves
    shockwaves.push({
      x, y, r: 8, maxR: 75,
      color: info.color,
      life: 0.5, maxLife: 0.5
    });

    // 2. Floating Text Decal
    floatingTexts.push({
      x, y: y - 18,
      text: info.text,
      color: info.color,
      vy: -60,
      life: 0.9, maxLife: 0.9
    });

    // 3. Radiant Burst Particles
    makeParticles(x, y, 16, info.color);
  }

  function updatePowerupHUD() {
    let html = '';
    if(activePowerups.rocket > 0) {
      html += `<span class="powerup-badge rocket">NOS TURBO ${Math.ceil(activePowerups.rocket)}s</span>`;
    }
    if(activePowerups.shield) {
      const shieldLabel = (activePowerups.shieldCount && activePowerups.shieldCount > 1) ? '2X SHIELD' : 'SHIELD';
      html += `<span class="powerup-badge shield">${shieldLabel} ON</span>`;
    }
    if(activePowerups.magnet > 0) {
      html += `<span class="powerup-badge magnet">MAGNET ${Math.ceil(activePowerups.magnet)}s</span>`;
    }
    if(activePowerups.slow > 0) {
      html += `<span class="powerup-badge slow">FREEZE ${Math.ceil(activePowerups.slow)}s</span>`;
    }
    if(activePowerups.star > 0) {
      html += `<span class="powerup-badge star">STAR ${Math.ceil(activePowerups.star)}s</span>`;
    }
    el.powerupHud.innerHTML = html;
  }

  // ==========================================
  // RANDOMIZED HAZARD SYSTEM (Non-Sequential)
  // ==========================================
  let nextHazardInterval = 3.0;

  function updateHazardSpawning(dt, slowFactor) {
    const isRanked = currentMode === 'ranked';
    const minScore = isRanked ? 2 : 5;
    if(score < minScore) return;

    enemySpawnTimer += dt;
    if(enemySpawnTimer > nextHazardInterval / slowFactor) {
      enemySpawnTimer = 0;
      // Interval acak dan dinamis
      const baseInterval = isRanked ? 2.0 : 3.2;
      const variation = (Math.random() - 0.5) * (isRanked ? 1.6 : 2.2);
      const scoreDiscount = Math.min(score, 120) * (isRanked ? 0.015 : 0.01);
      nextHazardInterval = Math.max(isRanked ? 1.1 : 1.7, baseInterval + variation - scoreDiscount);

      // Munculkan rintangan secara acak tanpa urutan tertentu!
      spawnRandomHazard();

      // Di mode ranked extreme, ada peluang muncul rintangan ganda acak
      if(isRanked && score >= 12 && Math.random() < 0.28) {
        setTimeout(() => {
          if(state === State.PLAYING) spawnRandomHazard();
        }, 350 + Math.random() * 550);
      }
    }
  }

  function spawnRandomHazard() {
    const isRanked = currentMode === 'ranked';
    const rand = Math.random();

    if(rand < 0.42) {
      // 1. Enemy Bird dengan tipe pola acak (straight, zigzag, dive, swoop, fast)
      const patterns = ['straight', 'zigzag', 'dive', 'swoop', 'fast'];
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];
      const y = 80 + Math.random() * (H - GROUND - 180);
      const speedMult = pattern === 'fast' ? 1.55 : pattern === 'dive' ? 1.35 : 1.15;
      const speed = speedMult + Math.random() * (isRanked ? 0.55 : 0.35);

      enemies.push({
        type: 'bird',
        x: W + 35,
        y,
        baseY: y,
        r: 14,
        speed,
        pattern,
        time: 0,
        wing: Math.random() * 6,
        dead: false
      });
    } else if(rand < 0.72) {
      // 2. Bee Swarm dengan ketinggian dan kecepatan acak
      const y = 90 + Math.random() * (H - GROUND - 195);
      const speed = 1.05 + Math.random() * (isRanked ? 0.45 : 0.25);
      enemies.push({
        type: 'bee_swarm',
        x: W + 35,
        y,
        baseY: y,
        r: 15,
        speed,
        wobble: Math.random() * 6,
        time: 0,
        wing: 0,
        dead: false
      });
    } else {
      // 3. Storm Cloud Petir dadakan di depan pemain
      const targetX = 60 + Math.random() * (W - 120);
      stormClouds.push({
        x: targetX,
        y: 40,
        targetX,
        w: 80,
        h: 36,
        boltW: 24,
        phase: 'warn',
        timer: isRanked ? (0.8 + Math.random() * 0.4) : (1.1 + Math.random() * 0.45)
      });
    }
  }

  // Tail Aura Particle Spawner with Distinct Effects
  function skinTrail(dt) {
    trailSpawn += dt;
    if(trailSpawn < .033) return;
    trailSpawn = 0;
    const bx = bird.x - 14, by = bird.y + 4;
    const auraId = progress.selectedAura || 'default';

    if(auraId === 'default') {
      particles.push({
        x: bx, y: by + (Math.random() - .5) * 6,
        vx: -60 - Math.random() * 25, vy: -15 + Math.random() * 30,
        life: .45, maxLife: .45, color: '#ffd74c',
        size: 3 + Math.random() * 3,
        rot: Math.random() * 6, vRot: (Math.random() - .5) * 4,
        type: 'feather'
      });
    } else if(auraId === 'fire') {
      const colors = ['#ff3b00', '#ff6d00', '#ff9e00', '#ffd000', '#fff275'];
      const life = .42 + Math.random() * .28;
      particles.push({
        x: bx + (Math.random() - .5) * 4, y: by + (Math.random() - .5) * 6,
        vx: -70 - Math.random() * 50, vy: -35 - Math.random() * 45,
        life, maxLife: life, color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 6, rot: (Math.random() - .5) * .8,
        type: 'flame'
      });
      if(Math.random() < 0.5) {
        particles.push({
          x: bx, y: by,
          vx: -90 - Math.random() * 60, vy: -20 - Math.random() * 60,
          life: .3 + Math.random() * .2, maxLife: .5, color: '#fff59d',
          size: 2 + Math.random() * 2, type: 'sparkle'
        });
      }
    } else if(auraId === 'rainbow') {
      const hue = (performance.now() * 0.45) % 360;
      const life = .48 + Math.random() * .22;
      particles.push({
        x: bx, y: by + (Math.random() - .5) * 8,
        vx: -90 - Math.random() * 45, vy: (Math.random() - .5) * 35,
        life, maxLife: life, color: 'hsl(' + hue + ', 100%, 65%)',
        size: 4 + Math.random() * 4, rot: Math.random() * 6, vRot: (Math.random() - .5) * 6,
        type: Math.random() < 0.45 ? 'star' : 'rainbow_ribbon'
      });
    } else if(auraId === 'galaxy') {
      const colors = ['#c77dff', '#7b2cbf', '#48cae4', '#e0aaff', '#ffffff', '#ff70a6'];
      const life = .52 + Math.random() * .28;
      particles.push({
        x: bx, y: by + (Math.random() - .5) * 10,
        vx: -75 - Math.random() * 35, vy: (Math.random() - .5) * 35,
        life, maxLife: life, color: colors[Math.floor(Math.random() * colors.length)],
        size: 3.5 + Math.random() * 4, rot: Math.random() * 6, vRot: 3 + Math.random() * 3,
        type: Math.random() < 0.35 ? 'planet' : Math.random() < 0.7 ? 'star' : 'dust'
      });
    } else if(auraId === 'neon') {
      const colors = ['#00f5d4', '#7b2cbf', '#fee440', '#00bbf9', '#ffffff'];
      const life = .26 + Math.random() * .14;
      particles.push({
        x: bx, y: by + (Math.random() - .5) * 8,
        vx: -110 - Math.random() * 60, vy: (Math.random() - .5) * 70,
        life, maxLife: life, color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 4,
        pts: [
          { dx: 0, dy: 0 },
          { dx: -6 - Math.random() * 6, dy: (Math.random() - .5) * 12 },
          { dx: -14 - Math.random() * 8, dy: (Math.random() - .5) * 14 },
          { dx: -22 - Math.random() * 10, dy: (Math.random() - .5) * 18 }
        ],
        type: 'lightning'
      });
    } else if(auraId === 'bubble') {
      const life = .6 + Math.random() * .35;
      particles.push({
        x: bx, y: by + (Math.random() - .5) * 8,
        vx: -55 - Math.random() * 35, vy: -15 - Math.random() * 30,
        life, maxLife: life, color: '#a0e7e5',
        size: 3.5 + Math.random() * 4.5,
        wobble: Math.random() * 6,
        type: 'bubble'
      });
    } else if(auraId === 'hearts') {
      const colors = ['#ff4d6d', '#ff758f', '#ff8fa3', '#c9184a', '#ff0054'];
      const life = .52 + Math.random() * .26;
      particles.push({
        x: bx, y: by + (Math.random() - .5) * 8,
        vx: -65 - Math.random() * 35, vy: -20 - Math.random() * 35,
        life, maxLife: life, color: colors[Math.floor(Math.random() * colors.length)],
        size: 4.5 + Math.random() * 3.5, rot: (Math.random() - .5) * .6,
        type: 'heart'
      });
    } else if(auraId === 'golden') {
      const colors = ['#ffd700', '#ffb703', '#fff066', '#fb8500'];
      const life = .46 + Math.random() * .26;
      particles.push({
        x: bx, y: by + (Math.random() - .5) * 10,
        vx: -80 - Math.random() * 45, vy: 10 + Math.random() * 30,
        life, maxLife: life, color: colors[Math.floor(Math.random() * colors.length)],
        size: 3.5 + Math.random() * 3.5, spin: Math.random() * 6,
        type: Math.random() < 0.45 ? 'coin' : 'star'
      });
    } else if(auraId === 'frost') {
      const colors = ['#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#ffffff'];
      const life = .48 + Math.random() * .24;
      particles.push({
        x: bx, y: by + (Math.random() - .5) * 8,
        vx: -75 - Math.random() * 35, vy: -10 + Math.random() * 25,
        life, maxLife: life, color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 3, rot: Math.random() * 6, vRot: (Math.random() - .5) * 4,
        type: 'sparkle'
      });
    } else if(auraId === 'plasma') {
      const colors = ['#c084fc', '#a855f7', '#38bdf8', '#818cf8', '#ffffff'];
      const life = .32 + Math.random() * .18;
      particles.push({
        x: bx, y: by + (Math.random() - .5) * 10,
        vx: -95 - Math.random() * 45, vy: (Math.random() - .5) * 55,
        life, maxLife: life, color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 3.5,
        pts: [
          { dx: 0, dy: 0 },
          { dx: -5 - Math.random() * 6, dy: (Math.random() - .5) * 10 },
          { dx: -12 - Math.random() * 8, dy: (Math.random() - .5) * 12 }
        ],
        type: 'lightning'
      });
    } else if(auraId === 'sakura') {
      const colors = ['#f472b6', '#fda4af', '#fb7185', '#fbcfe8', '#ffffff'];
      const life = .58 + Math.random() * .32;
      particles.push({
        x: bx, y: by + (Math.random() - .5) * 8,
        vx: -55 - Math.random() * 30, vy: 15 + Math.random() * 25,
        life, maxLife: life, color: colors[Math.floor(Math.random() * colors.length)],
        size: 3.2 + Math.random() * 3, rot: Math.random() * 6, vRot: (Math.random() - .5) * 3,
        type: 'rainbow_ribbon'
      });
    } else if(auraId === 'matrix') {
      const colors = ['#22c55e', '#4ade80', '#86efac', '#15803d', '#ffffff'];
      const life = .42 + Math.random() * .22;
      particles.push({
        x: bx, y: by + (Math.random() - .5) * 8,
        vx: -85 - Math.random() * 35, vy: (Math.random() - .5) * 20,
        life, maxLife: life, color: colors[Math.floor(Math.random() * colors.length)],
        size: 2.5 + Math.random() * 2.5,
        type: 'dot'
      });
    }
  }

  function handleHit(hazard) {
    // 0. Warp Dash Active -> Invulnerable & destroy hazard!
    if(dashTimer > 0) {
      if(hazard && hazard.type) {
        hazard.dead = true;
        makeParticles(hazard.x, hazard.y, 18, '#38bdf8');
        audio.rocketSmash();
        addScore();
      }
      return;
    }

    // 1. NOS Rocket Active -> Hancurkan rintangan seketika tanpa terluka!
    if(activePowerups.rocket > 0) {
      if(hazard && hazard.type) {
        hazard.dead = true;
        makeParticles(hazard.x, hazard.y, 22, '#f97316');
        audio.rocketSmash();
        addScore();
      }
      return;
    }

    // 2. Invincible Star Active
    if(activePowerups.star > 0) {
      if(hazard && hazard.type) {
        hazard.dead = true;
        makeParticles(hazard.x, hazard.y, 14, '#ffd700');
        audio.hit();
      }
      return;
    }
    // 3. Grace Period Active
    if(graceTimer > 0) return;

    // 4. Shield Active -> Absorb Hit!
    if(activePowerups.shield) {
      if(activePowerups.shieldCount && activePowerups.shieldCount > 1) {
        activePowerups.shieldCount--;
        graceTimer = 0.9;
        audio.shieldBreak();
        shake = 0.2;
        makeParticles(bird.x, bird.y, 20, '#38bdf8');
      } else {
        activePowerups.shield = false;
        activePowerups.shieldCount = 0;
        graceTimer = 0.85; // 0.85s grace invulnerability
        audio.shieldBreak();
        shake = 0.25;
        makeParticles(bird.x, bird.y, 22, '#38bdf8');
      }
      if(hazard && hazard.type) hazard.dead = true;
      updatePowerupHUD();
      return;
    }

    // 5. No Protection -> End Game
    endGame();
  }

  function collide(p) {
    const bx = bird.x, by = bird.y, r = bird.r * .72;
    if(bx + r > p.x && bx - r < p.x + p.w && (by - r < p.gapY || by + r > p.gapY + p.gapSize)) return true;
    return false;
  }

  function endGame() {
    if(state === State.OVER) return;
    state = State.OVER;
    bird.dead = true;
    dashTimer = 0;
    shake = .26;
    audio.hit();
    audio.stopMusic();
    stopBackgroundMusic();
    audio.deathMusic();
    updateDashUI();
    if(navigator.vibrate && settings.vibration) navigator.vibrate(80);

    let newBest = false;
    if(currentMode === 'ranked') {
      newBest = score > rankedBest;
      if(newBest) {
        rankedBest = score;
        storage.set('skyFlappyRankedBest', rankedBest);
      }
      submitRankedScore(score);
    } else {
      newBest = score > classicBest;
      if(newBest) {
        classicBest = score;
        storage.set('skyFlappyClassicBest', classicBest);
      }
    }

    updateScore();
    overTimer = 0.65;
  }

  function update(dt) {
    cloudX = (cloudX + 10 * dt) % W;
    if(state === State.READY) {
      bird.y = 285 + Math.sin(performance.now() / 250) * 7;
      bird.wing = .1;
      babyBirds[0].x = bird.x - 22;
      babyBirds[0].y = bird.y - 18 + Math.sin(performance.now() / 220) * 4;
      babyBirds[0].wing += dt * 20;
      babyBirds[1].x = bird.x - 26;
      babyBirds[1].y = bird.y + 18 + Math.sin(performance.now() / 240 + Math.PI) * 4;
      babyBirds[1].wing += dt * 20;
      return;
    }
    if(state === State.OVER) {
      bird.vy = Math.min(420, bird.vy + 850 * dt);
      bird.y += bird.vy * dt;
      bird.angle = Math.min(1.6, bird.angle + 3 * dt);
      babyBirds[0].x += (bird.x - 22 - babyBirds[0].x) * 8 * dt;
      babyBirds[0].y += (bird.y - 18 - babyBirds[0].y) * 8 * dt;
      babyBirds[0].angle = bird.angle * 0.7;
      babyBirds[1].x += (bird.x - 26 - babyBirds[1].x) * 8 * dt;
      babyBirds[1].y += (bird.y + 18 - babyBirds[1].y) * 8 * dt;
      babyBirds[1].angle = bird.angle * 0.7;
      overTimer -= dt;
      if(overTimer <= 0 && !el.over.classList.contains('visible')) showOver();
      return;
    }
    if(state !== State.PLAYING) return;

    // Power-Up & Dash Timer Management
    const prevDashCd = dashCooldown;
    if(dashCooldown > 0) dashCooldown = Math.max(0, dashCooldown - dt);
    if(prevDashCd > 0 && dashCooldown === 0) {
      audio.dashReady();
    }
    if(dashTimer > 0) {
      dashTimer = Math.max(0, dashTimer - dt);
      dashAfterimages.push({
        x: bird.x, y: bird.y, angle: bird.angle, wing: bird.wing, alpha: 0.85
      });
      for(let i = 0; i < 2; i++) {
        particles.push({
          x: bird.x - 16,
          y: bird.y + (Math.random() - 0.5) * 12,
          vx: -280 - Math.random() * 80,
          vy: (Math.random() - 0.5) * 40,
          life: 0.28, maxLife: 0.28,
          color: Math.random() < 0.6 ? '#38bdf8' : '#7dd3fc',
          size: 3 + Math.random() * 3,
          type: 'sparkle'
        });
      }
    }
    for(const img of dashAfterimages) img.alpha -= dt * 3.5;
    dashAfterimages = dashAfterimages.filter(img => img.alpha > 0);
    updateDashUI();

    if(activePowerups.magnet > 0) activePowerups.magnet = Math.max(0, activePowerups.magnet - dt);
    if(activePowerups.slow > 0) activePowerups.slow = Math.max(0, activePowerups.slow - dt);
    if(activePowerups.star > 0) activePowerups.star = Math.max(0, activePowerups.star - dt);
    if(activePowerups.rocket > 0) {
      activePowerups.rocket = Math.max(0, activePowerups.rocket - dt);
      // Semburkan partikel api dan asap pendorong roket NOS
      for(let i = 0; i < 3; i++) {
        particles.push({
          x: bird.x - 22,
          y: bird.y + (Math.random() - 0.5) * 14,
          vx: -240 - Math.random() * 90,
          vy: (Math.random() - 0.5) * 50,
          life: 0.35, maxLife: 0.35,
          color: Math.random() < 0.4 ? '#ef4444' : Math.random() < 0.75 ? '#f97316' : '#fde047',
          size: 3.5 + Math.random() * 4,
          type: 'flame'
        });
      }
    }
    if(graceTimer > 0) graceTimer = Math.max(0, graceTimer - dt);
    updatePowerupHUD();

    // Shockwaves & Floating Texts physics update
    for(const sw of shockwaves) {
      sw.r += (sw.maxR - sw.r) * 9 * dt;
      sw.life -= dt;
    }
    shockwaves = shockwaves.filter(sw => sw.life > 0);

    for(const ft of floatingTexts) {
      ft.y += ft.vy * dt;
      ft.vy += 30 * dt;
      ft.life -= dt;
    }
    floatingTexts = floatingTexts.filter(ft => ft.life > 0);

    // World speed is slowed when Slow Time is active, but player physics stays normal!
    const slowFactor = activePowerups.slow > 0 ? 0.52 : 1.0;

    if(activePowerups.rocket > 0 || dashTimer > 0) {
      // Terbang stabil melesat saat roket NOS / Dash aktif
      bird.vy = Math.min(160, Math.max(-160, bird.vy + 220 * dt));
      bird.y += bird.vy * dt;
      bird.angle = Math.max(-0.2, Math.min(0.2, bird.vy / 400));
    } else {
      bird.vy = Math.min(430, bird.vy + 830 * dt);
      bird.y += bird.vy * dt;
      bird.angle = Math.max(-.42, Math.min(1.05, bird.vy / 520));
    }
    bird.wing = Math.max(0, bird.wing - dt);

    // Progressive speed scaling based on score tiers (+ NOS rocket turbo bonus + Dash burst + Extreme Ranked)
    const isRanked = currentMode === 'ranked';
    const rocketBoost = activePowerups.rocket > 0 ? 140 : 0;
    const dashBoost = dashTimer > 0 ? 320 : 0;
    const speedMultiplier = isRanked ? 1.55 : 1.0;
    const speedBonus = ((score < 50 ? score * 1.15 : 57.5 + (score - 50) * 0.95) * speedMultiplier) + rocketBoost + dashBoost;
    const rankedExtra = isRanked ? 45 : 0;
    const baseSpeed = Math.min(isRanked ? 440 : 380, 115 + rankedExtra + speedBonus + (settings.difficulty === 'easy' ? -12 : settings.difficulty === 'hard' ? 14 : 0));
    const speed = baseSpeed * slowFactor;
    const spawnDelay = Math.max(isRanked ? .78 : .92, (isRanked ? 1.35 : 1.6) - Math.min(score, 120) * (isRanked ? .008 : .006)) / slowFactor;

    spawn += dt;
    if(spawn > spawnDelay) { spawn = 0; makePipe(); }

    // Power-Up Timer progression (used when spawning pipes)
    powerupSpawnTimer += dt;

    // Spawn Hazards & Enemies (Randomized, unpredictable, non-sequential)
    updateHazardSpawning(dt, slowFactor);

    // Update 2 Anak Burung Pelindung (Baby Guardian Combat AI)
    updateBabyBirds(dt, speed, slowFactor);

    // Update Pipes & Rocket/Dash Smasher
    for(const p of pipes) {
      p.x -= speed * dt;
      if(!p.passed && p.x + p.w < bird.x - bird.r) { p.passed = true; addScore(); }
      if(collide(p)) {
        if(activePowerups.rocket > 0 || dashTimer > 0) {
          // Roket NOS / Warp Dash menghancurkan pipa di depannya seketika!
          if(!p.smashed) {
            p.smashed = true;
            makeParticles(p.x + p.w / 2, bird.y, 24, dashTimer > 0 ? '#38bdf8' : '#ea580c');
            makeParticles(p.x + p.w / 2, bird.y, 14, '#fde047');
            shake = 0.25;
            audio.rocketSmash();
            if(!p.passed) { p.passed = true; addScore(); }
          }
        } else {
          handleHit(null);
        }
      }
    }
    pipes = pipes.filter(p => p.x + p.w > -8);

    // Update Flyers
    for(const flyer of flyers) {
      flyer.x -= (speed * flyer.speed + 45 * slowFactor) * dt;
      flyer.wing += dt * 12;
      if(Math.hypot(bird.x - flyer.x, bird.y - flyer.y) < bird.r * .72 + flyer.r * .72) {
        handleHit(flyer);
      }
    }
    flyers = flyers.filter(flyer => flyer.x + flyer.r > -10 && !flyer.dead);

    // Update Enemies (Enemy Bird & Bee Swarm with randomized trajectory)
    for(const e of enemies) {
      e.x -= (speed * e.speed) * dt;
      e.wing += dt * 16;
      e.time += dt;

      if(e.type === 'bird') {
        if(e.pattern === 'zigzag') {
          if(!e.baseY) e.baseY = e.y;
          e.y = Math.max(75, Math.min(H - GROUND - 45, e.baseY + Math.sin(e.time * 5.0) * 38));
        } else if(e.pattern === 'dive') {
          e.y = Math.max(75, Math.min(H - GROUND - 45, e.y + Math.sin(e.time * 2.8) * 60 * dt + 18 * dt));
        } else if(e.pattern === 'swoop') {
          e.y = Math.max(75, Math.min(H - GROUND - 45, e.y - Math.sin(e.time * 2.8) * 60 * dt));
        }
      } else if(e.type === 'bee_swarm') {
        e.wobble += dt * 4.5;
        e.y = Math.max(75, Math.min(H - GROUND - 45, e.y + Math.sin(e.wobble) * 28 * dt));
      }

      if(Math.hypot(bird.x - e.x, bird.y - e.y) < bird.r * .72 + e.r * .72) {
        handleHit(e);
      }
    }
    enemies = enemies.filter(e => e.x + e.r > -15 && !e.dead);

    // Update Storm Clouds
    for(const c of stormClouds) {
      c.timer -= dt;
      if(c.phase === 'warn') {
        if(c.timer <= 0) {
          c.phase = 'strike';
          c.timer = 0.38;
          audio.thunder();
          shake = 0.22;
          makeParticles(c.targetX, H - GROUND - 8, 16, '#fde047');
        }
      } else if(c.phase === 'strike') {
        // Lightning bolt collision check
        if(Math.abs(bird.x - c.targetX) < (bird.r + c.boltW * 0.45) && bird.y > c.y && bird.y < H - GROUND) {
          handleHit(c);
        }
        if(c.timer <= 0) {
          c.phase = 'fade';
          c.timer = 0.55;
        }
      }
    }
    stormClouds = stormClouds.filter(c => c.phase !== 'fade' || c.timer > 0);

    // Update Power-Up Pickups
    for(const p of powerups) {
      p.x -= speed * dt;
      p.bob += dt * 3;
      p.rot += dt * 2;
      if(Math.hypot(bird.x - p.x, bird.y - (p.y + Math.sin(p.bob) * 5)) < bird.r + p.r) {
        p.collected = true;
        activatePowerup(p.type, p.x, p.y, false);
      }
    }
    powerups = powerups.filter(p => !p.collected && p.x + p.r > -15);

    // Update Coins (Magnet & Rocket Attraction) - HANYA DI MODE CLASSIC
    for(const coin of coins) {
      coin.x -= speed * dt;
      coin.spin += dt * 7;

      // Magnet pull & Rocket auto-vacuum
      if(activePowerups.magnet > 0 || activePowerups.rocket > 0) {
        const dist = Math.hypot(bird.x - coin.x, bird.y - coin.y);
        const maxDist = activePowerups.rocket > 0 ? 320 : 170;
        if(dist < maxDist) {
          const pullSpeed = (1 - dist / maxDist) * 480 + 150;
          const angle = Math.atan2(bird.y - coin.y, bird.x - coin.x);
          coin.x += Math.cos(angle) * pullSpeed * dt;
          coin.y += Math.sin(angle) * pullSpeed * dt;
        }
      }

      if(Math.hypot(bird.x - coin.x, bird.y - coin.y) < bird.r + coin.r) {
        coin.collected = true;
        if(currentMode !== 'ranked') {
          progress.coins++;
          persistProgress();
          updateCoins();
        }
        makeParticles(coin.x, coin.y, 12, '#ffe56b');
        audio.score();
      }
    }
    coins = coins.filter(coin => !coin.collected && coin.x + coin.r > -8);

    if(bird.y - bird.r < 0 || bird.y + bird.r > H - GROUND) handleHit(null);
    groundX = (groundX + speed * dt) % 30;

    skinTrail(dt);
    for(const q of particles) {
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      if(q.rot !== undefined && q.vRot) q.rot += q.vRot * dt;
      if(q.spin !== undefined) q.spin += 6 * dt;
      if(q.wobble !== undefined) q.wobble += 5 * dt;
      if(q.type !== 'flame' && q.type !== 'bubble' && q.type !== 'lightning') q.vy += 90 * dt;
      q.life -= dt;
    }
    particles = particles.filter(q => q.life > 0);
  }

  function rr(x, y, w, h, r, targetCtx = ctx) {
    targetCtx.beginPath();
    targetCtx.roundRect(x, y, w, h, r);
    targetCtx.fill();
  }

  function rrTo(targetCtx, x, y, w, h, r) {
    targetCtx.beginPath();
    targetCtx.roundRect(x, y, w, h, r);
    targetCtx.fill();
  }

  function drawAuraParticleTo(targetCtx, q) {
    drawAuraParticle(q, targetCtx);
  }

  // Draw Tail Aura Particles
  function drawAuraParticle(q, targetCtx = ctx) {
    const alpha = Math.max(0, Math.min(1, q.life / (q.maxLife || 0.5)));
    targetCtx.save();
    targetCtx.globalAlpha = alpha;
    targetCtx.fillStyle = q.color;

    if(q.type === 'flame') {
      targetCtx.translate(q.x, q.y);
      targetCtx.rotate(q.rot || 0);
      const s = q.size * (0.6 + alpha * 0.4);
      targetCtx.beginPath();
      targetCtx.moveTo(0, -s * 1.5);
      targetCtx.bezierCurveTo(s * 0.9, -s * 0.5, s * 0.9, s * 0.8, 0, s);
      targetCtx.bezierCurveTo(-s * 0.9, s * 0.8, -s * 0.9, -s * 0.5, 0, -s * 1.5);
      targetCtx.fill();
      targetCtx.fillStyle = '#fff59d';
      targetCtx.beginPath();
      targetCtx.moveTo(0, -s * 0.8);
      targetCtx.bezierCurveTo(s * 0.45, -s * 0.2, s * 0.45, s * 0.5, 0, s * 0.6);
      targetCtx.bezierCurveTo(-s * 0.45, s * 0.5, -s * 0.45, -s * 0.2, 0, -s * 0.8);
      targetCtx.fill();
    } else if(q.type === 'lightning') {
      targetCtx.strokeStyle = q.color;
      targetCtx.lineWidth = 2.2;
      targetCtx.shadowColor = q.color;
      targetCtx.shadowBlur = 6;
      targetCtx.beginPath();
      targetCtx.moveTo(q.x, q.y);
      if(q.pts) {
        for(let i = 1; i < q.pts.length; i++) targetCtx.lineTo(q.x + q.pts[i].dx, q.y + q.pts[i].dy);
      }
      targetCtx.stroke();
    } else if(q.type === 'bubble') {
      const wobbleR = q.size * (1 + Math.sin(q.wobble || 0) * 0.12);
      targetCtx.translate(q.x, q.y);
      targetCtx.beginPath();
      targetCtx.arc(0, 0, wobbleR, 0, Math.PI * 2);
      targetCtx.strokeStyle = '#e0fbfc';
      targetCtx.lineWidth = 1.4;
      targetCtx.stroke();
      targetCtx.fillStyle = 'rgba(255,255,255,0.3)';
      targetCtx.fill();
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(-wobbleR * 0.35, -wobbleR * 0.35, wobbleR * 0.3, 0, Math.PI * 2);
      targetCtx.fill();
      if(q.life < 0.12) {
        targetCtx.strokeStyle = '#fff';
        targetCtx.lineWidth = 1;
        targetCtx.beginPath();
        targetCtx.arc(0, 0, wobbleR * 1.5, 0, Math.PI * 2);
        targetCtx.stroke();
      }
    } else if(q.type === 'heart') {
      targetCtx.translate(q.x, q.y);
      targetCtx.rotate(q.rot || 0);
      const s = q.size * (0.8 + Math.sin(performance.now() / 80) * 0.15);
      targetCtx.beginPath();
      targetCtx.moveTo(0, s * 0.3);
      targetCtx.bezierCurveTo(-s * 0.8, -s * 0.4, -s * 0.8, -s * 1.1, 0, -s * 0.5);
      targetCtx.bezierCurveTo(s * 0.8, -s * 1.1, s * 0.8, -s * 0.4, 0, s * 0.3);
      targetCtx.fill();
      targetCtx.fillStyle = 'rgba(255,255,255,0.45)';
      targetCtx.beginPath();
      targetCtx.arc(-s * 0.3, -s * 0.6, s * 0.2, 0, Math.PI * 2);
      targetCtx.fill();
    } else if(q.type === 'coin') {
      targetCtx.translate(q.x, q.y);
      const spinScale = Math.cos(q.spin || 0);
      targetCtx.scale(spinScale, 1);
      targetCtx.beginPath();
      targetCtx.arc(0, 0, q.size, 0, Math.PI * 2);
      targetCtx.fillStyle = '#fbbf24';
      targetCtx.fill();
      targetCtx.strokeStyle = '#d97706';
      targetCtx.lineWidth = 1.2;
      targetCtx.stroke();
      if(Math.abs(spinScale) > 0.4) {
        targetCtx.fillStyle = '#92400e';
        targetCtx.font = 'bold ' + Math.floor(q.size * 1.2) + 'px sans-serif';
        targetCtx.textAlign = 'center';
        targetCtx.textBaseline = 'middle';
        targetCtx.fillText('$', 0, 0);
      }
    } else if(q.type === 'planet') {
      targetCtx.translate(q.x, q.y);
      targetCtx.beginPath();
      targetCtx.arc(0, 0, q.size * 0.7, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#c084fc';
      targetCtx.lineWidth = 1.2;
      targetCtx.beginPath();
      targetCtx.ellipse(0, 0, q.size * 1.4, q.size * 0.4, -0.4, 0, Math.PI * 2);
      targetCtx.stroke();
    } else if(q.type === 'feather') {
      targetCtx.translate(q.x, q.y);
      targetCtx.rotate(q.rot || 0);
      targetCtx.beginPath();
      targetCtx.ellipse(0, 0, q.size * 1.3, q.size * 0.55, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#ffffff88';
      targetCtx.lineWidth = 1;
      targetCtx.beginPath();
      targetCtx.moveTo(-q.size * 1.2, 0);
      targetCtx.lineTo(q.size * 1.2, 0);
      targetCtx.stroke();
    } else if(q.type === 'rainbow_ribbon') {
      targetCtx.translate(q.x, q.y);
      targetCtx.rotate(q.rot || 0);
      targetCtx.beginPath();
      targetCtx.ellipse(0, 0, q.size * 1.2, q.size * 0.6, 0, 0, Math.PI * 2);
      targetCtx.fill();
    } else if(q.type === 'star' || q.type === 'sparkle') {
      targetCtx.translate(q.x, q.y);
      targetCtx.rotate(q.rot || 0);
      drawCanvasSparkle(targetCtx, 0, 0, q.size * 1.4);
    } else {
      targetCtx.beginPath();
      targetCtx.arc(q.x, q.y, q.size, 0, Math.PI * 2);
      targetCtx.fill();
    }
    targetCtx.restore();
  }

  function drawCanvasSparkle(targetCtx, x, y, r) {
    targetCtx.beginPath();
    targetCtx.moveTo(x, y - r);
    targetCtx.lineTo(x + r * 0.38, y);
    targetCtx.lineTo(x, y + r);
    targetCtx.lineTo(x - r * 0.38, y);
    targetCtx.closePath();
    targetCtx.fill();
  }

  function drawCanvasStar(targetCtx, x, y, rOut, rIn) {
    targetCtx.beginPath();
    for(let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? rOut : rIn;
      const a = i * Math.PI / 5 - Math.PI / 2;
      const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      if(i === 0) targetCtx.moveTo(px, py); else targetCtx.lineTo(px, py);
    }
    targetCtx.closePath();
    targetCtx.fill();
  }

  function drawCanvasIceCrystal(targetCtx, x, y, r) {
    targetCtx.save();
    targetCtx.strokeStyle = '#67e8f9';
    targetCtx.lineWidth = 1.4;
    targetCtx.beginPath();
    for(let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      targetCtx.moveTo(x, y);
      targetCtx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
    targetCtx.stroke();
    targetCtx.restore();
  }

  // Draw Power-Up Pickup Floating Item
  function drawPowerup(p) {
    ctx.save();
    const bobY = p.y + Math.sin(p.bob) * 5;
    ctx.translate(p.x, bobY);

    // Glowing Aura Halo
    const glowColor = p.type === 'shield' ? '#38bdf8' : p.type === 'magnet' ? '#f43f5e' : p.type === 'slow' ? '#67e8f9' : '#fbbf24';
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 10;

    // Outer Bubble Ring
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(0, 0, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Power-Up Icons
    if(p.type === 'shield') {
      // Shield
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(8, -5);
      ctx.lineTo(6, 4);
      ctx.lineTo(0, 9);
      ctx.lineTo(-6, 4);
      ctx.lineTo(-8, -5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.arc(0, -1, 3.5, 0, 7);
      ctx.fill();
    } else if(p.type === 'magnet') {
      // Magnet
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, 2, 7, Math.PI, 0);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#dc2626';
      ctx.stroke();
      // Silver poles
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-9, 2, 4, 4);
      ctx.fillRect(5, 2, 4, 4);
    } else if(p.type === 'slow') {
      // Ice Snowflake
      ctx.strokeStyle = '#0891b2';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for(let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * 7.5, Math.sin(a) * 7.5);
      }
      ctx.stroke();
      ctx.fillStyle = '#67e8f9';
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, 7);
      ctx.fill();
    } else if(p.type === 'star') {
      // Invincible Star
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      const cx = 0, cy = 0, rOut = 8.5, rIn = 4;
      for(let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? rOut : rIn;
        const a = i * Math.PI / 5 - Math.PI / 2;
        const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
        if(i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, 7);
      ctx.fill();
    } else if(p.type === 'rocket') {
      // NOS Rocket
      ctx.save();
      ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.quadraticCurveTo(5, -4, 4, 6);
      ctx.lineTo(-4, 6);
      ctx.quadraticCurveTo(-5, -4, 0, -9);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-6, 3, 2, 4);
      ctx.fillRect(4, 3, 2, 4);
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(-3, 6);
      ctx.lineTo(0, 11 + Math.sin(performance.now() / 60) * 2.5);
      ctx.lineTo(3, 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  // Draw Enemy Bird
  function drawEnemyBird(e) {
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.scale(-1, 1); // Facing left towards player

    // Evil Body
    ctx.fillStyle = '#4c0519';
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 13, 0, 0, 7);
    ctx.fill();

    // Horns / Spikes
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.moveTo(-4, -10); ctx.lineTo(-7, -19); ctx.lineTo(-1, -11);
    ctx.moveTo(4, -10); ctx.lineTo(7, -19); ctx.lineTo(1, -11);
    ctx.fill();

    // Dark Wing
    ctx.fillStyle = '#881337';
    ctx.save();
    ctx.rotate(Math.sin(e.wing) * .6);
    ctx.beginPath();
    ctx.ellipse(-4, -4, 9, 5, -.45, 0, 7);
    ctx.fill();
    ctx.restore();

    // Glowing Red Evil Eye
    ctx.fillStyle = '#f43f5e';
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(6, -4, 4.5, 0, 7);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(7.5, -4.5, 1.6, 0, 7);
    ctx.fill();

    // Sharp Beak
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(13, -2); ctx.lineTo(22, 3); ctx.lineTo(13, 6);
    ctx.fill();

    ctx.restore();
  }

  // Draw Bee Swarm
  function drawBeeSwarm(b) {
    ctx.save();
    ctx.translate(b.x, b.y);

    const bees = [
      { dx: 0, dy: 0, s: 1.0 },
      { dx: 9, dy: -8, s: 0.8 },
      { dx: 9, dy: 8, s: 0.8 }
    ];

    for(const bee of bees) {
      ctx.save();
      ctx.translate(bee.dx, bee.dy);
      ctx.scale(bee.s, bee.s);

      // Flapping Translucent Wings
      ctx.fillStyle = 'rgba(224, 242, 254, 0.75)';
      ctx.beginPath();
      ctx.ellipse(-2, -6 + Math.sin(b.wing * 1.5) * 2, 6, 3, -0.4, 0, 7);
      ctx.ellipse(2, -6 - Math.sin(b.wing * 1.5) * 2, 6, 3, 0.4, 0, 7);
      ctx.fill();

      // Yellow Bee Body
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 6, 0, 0, 7);
      ctx.fill();

      // Black Stripes
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-2, -5.5, 2.5, 11);
      ctx.fillRect(3, -4.5, 2.5, 9);

      // Stinger
      ctx.beginPath();
      ctx.moveTo(-8, 0); ctx.lineTo(-12, 0); ctx.lineTo(-8, 2);
      ctx.fill();

      // Eye
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(5, -2, 1.5, 0, 7);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  // Draw Storm Cloud & Lightning Strike
  function drawStormCloud(c) {
    ctx.save();

    // 1. Warning Phase: Danger Beam & Warning Icon
    if(c.phase === 'warn') {
      const alpha = 0.18 + Math.sin(performance.now() / 60) * 0.12;
      ctx.fillStyle = `rgba(253, 224, 71, ${alpha})`;
      ctx.fillRect(c.targetX - c.boltW / 2, c.y + 15, c.boltW, H - GROUND - c.y - 15);

      // Warning Danger Dashed Line
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(c.targetX, c.y + 20);
      ctx.lineTo(c.targetX, H - GROUND);
      ctx.stroke();
      ctx.setLineDash([]);

      // Warning Danger Indicator on Ground
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(c.targetX, H - GROUND - 16, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('!', c.targetX, H - GROUND - 16);
    }

    // 2. Strike Phase: Vertical Jagged Lightning Bolt
    if(c.phase === 'strike') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(c.targetX, c.y + 15);
      
      const segments = 9;
      const stepY = (H - GROUND - c.y - 15) / segments;
      for(let i = 1; i < segments; i++) {
        const offX = (Math.random() - .5) * 22;
        ctx.lineTo(c.targetX + offX, c.y + 15 + i * stepY);
      }
      ctx.lineTo(c.targetX, H - GROUND);
      ctx.stroke();

      // Outer Yellow Aura
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 10;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;
    }

    // 3. Storm Cloud Body
    const cloudAlpha = c.phase === 'fade' ? Math.max(0, c.timer / 0.55) : 1;
    ctx.globalAlpha = cloudAlpha;
    ctx.translate(c.targetX, c.y);
    ctx.fillStyle = '#334155';
    for(const [a, b, r] of [[0, 0, 18], [15, -4, 15], [-15, -3, 14], [25, 4, 11], [-25, 4, 10]]) {
      ctx.beginPath();
      ctx.arc(a, b, r, 0, 7);
      ctx.fill();
    }
    ctx.fillRect(-24, 2, 50, 14);

    // Internal Lightning Glow inside Cloud
    if(c.phase === 'warn' && Math.random() < 0.35) {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, 7);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawShockwaves() {
    for(const sw of shockwaves) {
      const alpha = Math.max(0, sw.life / (sw.maxLife || 0.5));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 3 * alpha + 1.2;
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawFloatingTexts() {
    for(const ft of floatingTexts) {
      const alpha = Math.max(0, Math.min(1, ft.life / 0.35));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = '900 13px Trebuchet MS, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3.5;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillStyle = ft.color || '#fff';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  // Update & Combat AI untuk 2 Anak Burung Pelindung Imut (Baby Guardian Birds)
  function updateBabyBirds(dt, speed, slowFactor) {
    const now = performance.now();

    // 1. Kumpulkan musuh yang mendekat di area bahaya (Enemies, Flyers, Storm Clouds)
    const activeTargets = [];
    for(const e of enemies) {
      if(!e.dead && e.x > bird.x - 25 && e.x < bird.x + 230) {
        activeTargets.push(e);
      }
    }
    for(const f of flyers) {
      if(!f.dead && f.x > bird.x - 25 && f.x < bird.x + 230) {
        activeTargets.push(f);
      }
    }
    for(const c of stormClouds) {
      if((c.phase === 'warn' || c.phase === 'strike') && c.targetX > bird.x - 25 && c.targetX < bird.x + 220) {
        activeTargets.push({
          x: c.targetX,
          y: c.y + 15,
          r: 20,
          isStormCloud: true,
          cloudRef: c
        });
      }
    }

    // Urutkan musuh terdekat ke posisi burung induk
    activeTargets.sort((a, b) => (a.x - bird.x) - (b.x - bird.x));

    // 2. Jika ada musuh mendekat, tugaskan 1 anak burung yang idle untuk maju menyerang
    for(const target of activeTargets) {
      const isAlreadyTargeted = babyBirds.some(b => b.targetEnemy === target);
      if(!isAlreadyTargeted) {
        const availableBaby = babyBirds.find(b => b.state === 'follow');
        if(availableBaby) {
          availableBaby.state = 'intercept';
          availableBaby.targetEnemy = target;
          audio.babyChirp();
          makeParticles(availableBaby.x, availableBaby.y, 8, availableBaby.color);
        }
      }
    }

    // 3. Update animasi & pergerakan tiap anak burung
    babyBirds.forEach((b, idx) => {
      b.wing += dt * 26;

      if(b.state === 'follow') {
        const tOffset = idx === 0 ? 0 : Math.PI;
        const fx = bird.x - 22 - (idx * 4) + Math.cos(now / 280 + tOffset) * 7;
        const fy = idx === 0
          ? bird.y - 18 + Math.sin(now / 220) * 6
          : bird.y + 18 + Math.sin(now / 240 + Math.PI) * 6;

        b.x += (fx - b.x) * 12 * dt;
        b.y += (fy - b.y) * 12 * dt;
        b.angle = Math.max(-0.25, Math.min(0.25, (fy - b.y) * 0.05));
        b.flipAngle = 0;

        if(Math.random() < 0.08) {
          particles.push({
            x: b.x - 8,
            y: b.y + (Math.random() - 0.5) * 4,
            vx: -50 - Math.random() * 20,
            vy: (Math.random() - 0.5) * 15,
            life: 0.35, maxLife: 0.35,
            color: b.color,
            size: 2 + Math.random() * 2,
            type: 'sparkle'
          });
        }
      } else if(b.state === 'intercept') {
        const target = b.targetEnemy;
        if(!target || target.dead || target.x < -30) {
          b.state = 'return';
          b.targetEnemy = null;
          return;
        }

        const targetX = target.x;
        const targetY = target.y;
        const dx = targetX - b.x;
        const dy = targetY - b.y;
        const dist = Math.hypot(dx, dy);

        b.angle = Math.atan2(dy, dx);
        b.flipAngle += dt * 18;

        const attackSpeed = 580;
        b.x += (dx / Math.max(1, dist)) * attackSpeed * dt;
        b.y += (dy / Math.max(1, dist)) * attackSpeed * dt;

        // Jejak dash anak burung
        particles.push({
          x: b.x - 6,
          y: b.y + (Math.random() - 0.5) * 4,
          vx: -120 - Math.random() * 40,
          vy: (Math.random() - 0.5) * 30,
          life: 0.22, maxLife: 0.22,
          color: Math.random() < 0.5 ? '#fde047' : b.color,
          size: 2.5 + Math.random() * 2.5,
          type: 'sparkle'
        });

        // Tabrakan dan hancurkan musuh
        const hitDist = b.r + (target.r || 15) + 6;
        if(dist <= hitDist) {
          if(target.isStormCloud && target.cloudRef) {
            target.cloudRef.phase = 'fade';
            target.cloudRef.timer = 0.1;
          } else {
            target.dead = true;
          }

          audio.babyAttack();
          shake = 0.18;
          makeParticles(targetX, targetY, 20, '#fde047');
          makeParticles(targetX, targetY, 14, b.color);
          addScore();

          shockwaves.push({
            x: targetX, y: targetY, r: 6, maxR: 48,
            color: b.color,
            life: 0.35, maxLife: 0.35
          });

          floatingTexts.push({
            x: targetX, y: targetY - 16,
            text: 'POW! +1',
            color: '#fef08a',
            vy: -65,
            life: 0.75, maxLife: 0.75
          });

          b.state = 'return';
          b.targetEnemy = null;
        }
      } else if(b.state === 'return') {
        const tOffset = idx === 0 ? 0 : Math.PI;
        const fx = bird.x - 22 - (idx * 4) + Math.cos(now / 280 + tOffset) * 7;
        const fy = idx === 0
          ? bird.y - 18 + Math.sin(now / 220) * 6
          : bird.y + 18 + Math.sin(now / 240 + Math.PI) * 6;

        const dx = fx - b.x;
        const dy = fy - b.y;
        const dist = Math.hypot(dx, dy);

        b.angle = Math.atan2(dy, dx);
        b.flipAngle += dt * 10;

        const returnSpeed = 440;
        b.x += (dx / Math.max(1, dist)) * returnSpeed * dt;
        b.y += (dy / Math.max(1, dist)) * returnSpeed * dt;

        if(dist < 18) {
          b.state = 'follow';
          b.angle = 0;
          b.flipAngle = 0;
        }
      }
    });
  }

  // Render Anak Burung Super Lucu (Chibi Guardian Bird)
  function drawBabyBird(b) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle + (b.state === 'intercept' ? b.flipAngle : 0));

    // Pendaran Aura Lembut
    ctx.shadowColor = b.color;
    ctx.shadowBlur = b.state === 'intercept' ? 14 : 7;

    // Tubuh Bulat Mungil Pastel
    const bodyGrad = ctx.createRadialGradient(-2, -2, 2, 0, 0, b.r);
    bodyGrad.addColorStop(0, '#ffffff');
    bodyGrad.addColorStop(0.35, b.color);
    bodyGrad.addColorStop(1, b.wingColor);

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(0, 0, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Pipi Merona Merah Muda (Blushing Cheeks)
    ctx.fillStyle = b.blushColor || '#fda4af';
    ctx.beginPath();
    ctx.arc(3.2, 3.0, 2.2, 0, Math.PI * 2);
    ctx.arc(-2.5, 3.0, 2.0, 0, Math.PI * 2);
    ctx.fill();

    // Sayap Mungil Mengepak Cepat
    const flap = Math.sin(b.wing) * 0.55;
    ctx.save();
    ctx.translate(-4, 1);
    ctx.rotate(flap);
    ctx.fillStyle = b.wingColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 5.5, 3.5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Paruh Mungil Oranye
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(b.r - 2, -1.5);
    ctx.lineTo(b.r + 4.5, 0.5);
    ctx.lineTo(b.r - 2, 2.5);
    ctx.closePath();
    ctx.fill();

    // Mata Boba Besar Berkilau (Sparkly Anime Eyes)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(3, -2.5, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Kilau Cahaya di Mata
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(4.0, -3.5, 1.4, 0, Math.PI * 2);
    ctx.arc(2.0, -1.5, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Aksesori Kepala Imut
    if(b.accessory === 'ribbon') {
      // Pita Merah Muda Cantik (Pip)
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.moveTo(-1, -b.r); ctx.lineTo(-5, -b.r - 4); ctx.lineTo(-1, -b.r - 2); ctx.closePath();
      ctx.moveTo(-1, -b.r); ctx.lineTo(3, -b.r - 4); ctx.lineTo(-1, -b.r - 2); ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.arc(-1, -b.r - 1.5, 1.4, 0, Math.PI * 2);
      ctx.fill();
    } else if(b.accessory === 'flower') {
      // Bunga Sakura Mini (Peep)
      ctx.fillStyle = '#f472b6';
      for(let a = 0; a < 5; a++) {
        const rad = (a * Math.PI * 2) / 5;
        ctx.beginPath();
        ctx.arc(-1 + Math.cos(rad) * 2.4, -b.r - 2.2 + Math.sin(rad) * 2.4, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(-1, -b.r - 2.2, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawSupersonicSpeedlines() {
    if(activePowerups.rocket <= 0 && dashTimer <= 0) return;
    ctx.save();
    ctx.strokeStyle = dashTimer > 0 ? 'rgba(56, 189, 248, 0.55)' : 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = dashTimer > 0 ? 2.4 : 1.8;
    const now = performance.now();
    for(let i = 0; i < 11; i++) {
      const ly = (i * 62 + (now * 0.4) % 640) % (H - GROUND);
      const lx = ((now * 2.2 + i * 85) % (W + 200)) - 100;
      const len = (dashTimer > 0 ? 65 : 45) + (i % 3) * 35;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx - len, ly);
      ctx.stroke();
    }
    ctx.restore();
  }

  function render() {
    ctx.save();
    if(shake > 0) {
      ctx.translate((Math.random() - .5) * 8, (Math.random() - .5) * 8);
      shake -= 1 / 60;
    }
    const bg = backgrounds[progress.selectedBackground] || backgrounds.sky;
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, bg.top);
    sky.addColorStop(1, bg.bottom);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Multi-layer Volumetric Fluffy Clouds with Realistic Parallax
    const bgW = W + 240;
    // Layer 1: Awan Tinggi (Halus & Bergerak Lambat)
    drawFluffyCloud(((cloudX * 0.35 + 20) % bgW) - 120, 68, 0.65, 0.48);
    drawFluffyCloud(((cloudX * 0.35 + 195) % bgW) - 120, 96, 0.55, 0.42);

    // Layer 2: Awan Utama (Puffy Cumulus dengan Shading & Highlight Lembut)
    drawFluffyCloud(((cloudX * 0.75 + 0) % bgW) - 120, 118, 0.95, 0.88);
    drawFluffyCloud(((cloudX * 0.75 + 175) % bgW) - 120, 178, 0.82, 0.84);

    // Layer 3: Awan Rendah / Kabut Melayang (Parallax Cepat)
    drawFluffyCloud(((cloudX * 1.1 + 85) % bgW) - 120, 235, 0.7, 0.38);

    drawHills();

    // Draw Supersonic Speedlines when Rocket or Dash is Active
    drawSupersonicSpeedlines();

    // Draw Storm Clouds & Lightning
    for(const c of stormClouds) drawStormCloud(c);

    // Draw Obstacles
    for(const p of pipes) drawPipe(p);
    for(const coin of coins) drawCoin(coin);
    for(const p of powerups) drawPowerup(p);
    for(const flyer of flyers) drawFlyer(flyer);
    for(const e of enemies) {
      if(e.type === 'bird') drawEnemyBird(e);
      else if(e.type === 'bee_swarm') drawBeeSwarm(e);
    }

    // Draw Shockwaves
    drawShockwaves();

    // Draw Aura & Visual Particles
    for(const q of particles) drawAuraParticle(q);
    ctx.globalAlpha = 1;

    // Slow Time Screen Overlay (Frosty edges)
    if(activePowerups.slow > 0) {
      const frost = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 320);
      frost.addColorStop(0, 'rgba(103, 232, 249, 0)');
      frost.addColorStop(1, 'rgba(103, 232, 249, 0.22)');
      ctx.fillStyle = frost;
      ctx.fillRect(0, 0, W, H);
    }

    drawGround();

    // Draw Dash Afterimages
    for(const img of dashAfterimages) {
      renderCustomBird(ctx, {
        x: img.x, y: img.y, angle: img.angle, wing: img.wing,
        skinId: progress.selected || 'classic',
        hatId: progress.selectedHat || 'none',
        outfitId: progress.selectedOutfit || 'none',
        opacity: img.alpha * 0.55
      });
    }

    drawBird();

    // Draw 2 Baby Guardian Birds (Pip & Peep)
    for(const baby of babyBirds) {
      drawBabyBird(baby);
    }

    // Draw Floating Splash Text Badges above Bird and Ground
    drawFloatingTexts();

    ctx.restore();
  }

  // Volumetric Fluffy Cloud with Soft Sunlight Highlights & Atmospheric Shading
  function drawFluffyCloud(x, y, s, alpha = 0.85) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.globalAlpha = alpha;

    // Gradien shading lembut bagian bawah awan
    const shadowGrad = ctx.createLinearGradient(0, -18, 0, 28);
    shadowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
    shadowGrad.addColorStop(0.6, 'rgba(235, 248, 255, 0.9)');
    shadowGrad.addColorStop(1, 'rgba(180, 218, 242, 0.65)');

    ctx.fillStyle = shadowGrad;

    // Gumpalan awan bulat berlapis organik
    const lobes = [
      [-30, 8, 16],
      [-15, 0, 22],
      [10, -9, 27],
      [35, -3, 22],
      [52, 6, 16],
      [14, 12, 20],
      [-10, 12, 18]
    ];

    for(const [lx, ly, lr] of lobes) {
      ctx.beginPath();
      ctx.arc(lx, ly, lr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dasar awan yang rata dan lembut
    ctx.beginPath();
    ctx.roundRect(-33, 4, 88, 18, 9);
    ctx.fill();

    // Highlight puncak awan terpapar sinar matahari
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    for(const [lx, ly, lr] of [[10, -9, 23], [35, -3, 17], [-15, 0, 17]]) {
      ctx.beginPath();
      ctx.arc(lx - 2, ly - 3, lr * 0.72, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawHills() {
    const bg = backgrounds[progress.selectedBackground] || backgrounds.sky;
    ctx.fillStyle = bg.hill;
    ctx.beginPath();
    ctx.moveTo(0, H - GROUND - 45);
    for(let x = 0; x <= W; x += 45) ctx.quadraticCurveTo(x + 20, H - GROUND - 105 + (x % 90 ? 22 : 0), x + 45, H - GROUND - 45);
    ctx.lineTo(W, H - GROUND);
    ctx.lineTo(0, H - GROUND);
    ctx.fill();
    ctx.fillStyle = '#4aa474';
    ctx.beginPath();
    ctx.moveTo(0, H - GROUND - 20);
    for(let x = 0; x <= W; x += 55) ctx.quadraticCurveTo(x + 30, H - GROUND - 68, x + 55, H - GROUND - 20);
    ctx.lineTo(W, H - GROUND);
    ctx.lineTo(0, H - GROUND);
    ctx.fill();
  }

  function drawPipe(p) {
    const cap = 11, skin = pipeSkins[progress.selectedPipe] || pipeSkins.green;
    ctx.save();
    ctx.fillStyle = skin.body;
    rr(p.x, 0, p.w, p.gapY - cap, 5);
    rr(p.x, p.gapY + p.gapSize + cap, p.w, H - (p.gapY + p.gapSize + cap), 5);
    ctx.fillStyle = skin.wing;
    ctx.fillRect(p.x + 5, 0, 12, p.gapY - cap);
    ctx.fillRect(p.x + 5, p.gapY + p.gapSize + cap, 12, H);
    ctx.fillStyle = skin.edge;
    ctx.fillRect(p.x + p.w - 8, 0, 8, p.gapY - cap);
    ctx.fillRect(p.x + p.w - 8, p.gapY + p.gapSize + cap, 8, H);
    ctx.fillStyle = skin.cap;
    rr(p.x - 5, p.gapY - cap, p.w + 10, cap, 3);
    rr(p.x - 5, p.gapY + p.gapSize, p.w + 10, cap, 3);
    ctx.restore();
  }

  function drawCoin(coin) {
    ctx.save();
    ctx.translate(coin.x, coin.y);

    const spinScale = Math.cos(coin.spin); // Animasi rotasi horizontal 3D
    const absScale = Math.max(0.08, Math.abs(spinScale));

    // 1. Pendaran Kilau Emas Luar
    ctx.shadowColor = 'rgba(251, 191, 36, 0.65)';
    ctx.shadowBlur = 6;

    // 2. Ketebalan Tepi Koin 3D (Rim Depth)
    const edgeOffset = (1 - absScale) * (spinScale >= 0 ? -2.2 : 2.2);
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(edgeOffset, 0, coin.r * absScale, coin.r, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Gradasi Permukaan Emas Dinamis
    const coinGrad = ctx.createLinearGradient(-coin.r * absScale, -coin.r, coin.r * absScale, coin.r);
    coinGrad.addColorStop(0, '#fef08a');
    coinGrad.addColorStop(0.3, '#f59e0b');
    coinGrad.addColorStop(0.7, '#d97706');
    coinGrad.addColorStop(1, '#78350f');

    ctx.fillStyle = coinGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, coin.r * absScale, coin.r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 4. Lingkaran & Lambang Emboss Bagian Dalam
    if(absScale > 0.3) {
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, (coin.r - 2.8) * absScale, coin.r - 2.8, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Lambang Tengah Koin
      ctx.fillStyle = '#fef9c3';
      ctx.beginPath();
      ctx.ellipse(0, 0, 3.2 * absScale, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Efek Kilatan Bintang Berkilau saat Berputar
      if(Math.abs(Math.sin(coin.spin * 2)) > 0.82) {
        ctx.fillStyle = '#ffffff';
        drawCanvasSparkle(ctx, 0, 0, Math.max(3, 5 * absScale));
      }
    }

    ctx.restore();
  }

  function drawFlyer(flyer) {
    ctx.save();
    ctx.translate(flyer.x, flyer.y);
    ctx.scale(-1, 1);
    ctx.fillStyle = '#e85d50';
    ctx.beginPath();
    ctx.ellipse(0, 0, flyer.r, flyer.r * .72, 0, 0, 7);
    ctx.fill();
    ctx.fillStyle = '#c83f43';
    ctx.save();
    ctx.rotate(Math.sin(flyer.wing) * .55);
    ctx.beginPath();
    ctx.ellipse(-4, -8, 10, 5, -.45, 0, 7);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(6, -5, 4, 0, 7);
    ctx.fill();
    ctx.fillStyle = '#16365d';
    ctx.beginPath();
    ctx.arc(7, -5, 1.5, 0, 7);
    ctx.fill();
    ctx.fillStyle = '#ffbe45';
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(23, 4);
    ctx.lineTo(14, 7);
    ctx.fill();
    ctx.restore();
  }

  function drawGround() {
    const y = H - GROUND;
    ctx.fillStyle = '#46b65c';
    ctx.fillRect(0, y, W, 9);
    ctx.fillStyle = '#b57a45';
    ctx.fillRect(0, y + 9, W, GROUND);
    ctx.fillStyle = '#e6ad5a';
    ctx.fillRect(0, y + 11, W, 5);
    ctx.fillStyle = '#8b5939';
    for(let x = -groundX; x < W; x += 30) {
      ctx.fillRect(x, y + 28, 13, 3);
      ctx.fillRect(x + 16, y + 54, 9, 3);
    }
    ctx.fillStyle = '#72df6c';
    for(let x = -groundX; x < W; x += 15) ctx.fillRect(x, y - 4, 6, 5);
  }

  // Universal Draw Helpers (Works on game ctx and shop showcase ctx)
  function drawCapeBackTo(targetCtx, wing, outfitId = 'cape') {
    targetCtx.save();
    const flapOffset = wing > 0 ? -6 : 5;
    const wave = Math.sin(performance.now() / 110) * 5;
    const wave2 = Math.cos(performance.now() / 150) * 3.5;

    if(outfitId === 'fairy') {
      // Fairy Wings
      const fWave = Math.sin(performance.now() / 85) * 6;
      targetCtx.save();
      
      // Fairy Wing Glow
      targetCtx.shadowColor = '#67e8f9';
      targetCtx.shadowBlur = 8;

      // Top Fairy Wing (Pastel Mint & Cyan)
      targetCtx.fillStyle = 'rgba(167, 243, 208, 0.72)';
      targetCtx.beginPath();
      targetCtx.moveTo(0, -6);
      targetCtx.quadraticCurveTo(-14, -28 + fWave, -34, -22 + flapOffset + fWave);
      targetCtx.quadraticCurveTo(-38, -4, -12, -2);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.strokeStyle = '#fde047';
      targetCtx.lineWidth = 1.2;
      targetCtx.stroke();

      // Top Wing Inner Pink Sheen
      targetCtx.fillStyle = 'rgba(244, 114, 182, 0.45)';
      targetCtx.beginPath();
      targetCtx.moveTo(-2, -6);
      targetCtx.quadraticCurveTo(-12, -22 + fWave, -26, -18 + fWave);
      targetCtx.quadraticCurveTo(-26, -6, -8, -4);
      targetCtx.closePath();
      targetCtx.fill();

      // Bottom Fairy Wing (Lilac)
      targetCtx.fillStyle = 'rgba(192, 132, 252, 0.65)';
      targetCtx.beginPath();
      targetCtx.moveTo(-6, 2);
      targetCtx.quadraticCurveTo(-24, 12 + fWave * 0.6, -30, 26 + flapOffset + fWave);
      targetCtx.quadraticCurveTo(-18, 28, -2, 8);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.strokeStyle = '#fde047';
      targetCtx.lineWidth = 1.2;
      targetCtx.stroke();

      // Fairy Dust Sparkles
      targetCtx.shadowBlur = 0;
      targetCtx.fillStyle = '#ffffff';
      drawCanvasSparkle(targetCtx, -26, -14 + fWave, 3);
      drawCanvasSparkle(targetCtx, -22, 18 + fWave * 0.6, 2.5);

      targetCtx.restore();
      targetCtx.restore();
      return;
    }

    // 1. Billowing Velvet Inner Shadow Layer
    targetCtx.fillStyle = '#7f1d1d';
    targetCtx.beginPath();
    targetCtx.moveTo(2, -9);
    targetCtx.quadraticCurveTo(-18, -12 + wave * 0.4, -38, -2 + flapOffset + wave);
    targetCtx.quadraticCurveTo(-36, 26 + flapOffset, -8, 14);
    targetCtx.closePath();
    targetCtx.fill();

    // 2. Main Glorious Scarlet Hero Cape (wraps from top shoulder across back)
    targetCtx.fillStyle = '#dc2626';
    targetCtx.beginPath();
    targetCtx.moveTo(4, -10);
    targetCtx.quadraticCurveTo(-16, -14 + wave * 0.5, -36, 4 + flapOffset + wave);
    targetCtx.quadraticCurveTo(-28, 28 + flapOffset + wave2, -6, 12);
    targetCtx.quadraticCurveTo(-4, 0, 4, -10);
    targetCtx.closePath();
    targetCtx.fill();

    // 3. Highlighted Top Fold of the Cape
    targetCtx.fillStyle = '#ef4444';
    targetCtx.beginPath();
    targetCtx.moveTo(4, -10);
    targetCtx.quadraticCurveTo(-14, -13 + wave * 0.5, -30, -2 + flapOffset + wave);
    targetCtx.quadraticCurveTo(-16, 10 + flapOffset, 0, -2);
    targetCtx.closePath();
    targetCtx.fill();

    // 4. Golden Embroidered Border Trim
    targetCtx.strokeStyle = '#fbbf24';
    targetCtx.lineWidth = 2.2;
    targetCtx.beginPath();
    targetCtx.moveTo(-36, 4 + flapOffset + wave);
    targetCtx.quadraticCurveTo(-28, 28 + flapOffset + wave2, -6, 12);
    targetCtx.stroke();

    // Cape Golden Star Emblem
    targetCtx.fillStyle = '#fef08a';
    drawCanvasStar(targetCtx, -22, 14 + flapOffset + wave * 0.6, 4.5, 2.2);

    targetCtx.restore();
  }

  function drawOutfitBodyTo(targetCtx, outfitId) {
    if(!outfitId || outfitId === 'none') return;
    targetCtx.save();

    if(outfitId === 'cape') {
      // Cape shoulder drape across the body
      targetCtx.fillStyle = '#991b1b';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 0, 18.5, 14.5, -0.1, 3.2, 5.8);
      targetCtx.lineTo(2, -8);
      targetCtx.closePath();
      targetCtx.fill();
    } else if(outfitId === 'redtie') {
      // 1. Full White Dress Shirt Torso
      targetCtx.fillStyle = '#f8fafc';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18, 14, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // 2. Tailored Midnight Navy Suit Vest
      targetCtx.fillStyle = '#1e293b';
      targetCtx.beginPath();
      targetCtx.ellipse(-1, 2, 17.5, 13.5, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // 3. V-Neck White Shirt Opening (lowered neckline)
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.moveTo(2, 0);
      targetCtx.lineTo(12, 2);
      targetCtx.lineTo(4, 14);
      targetCtx.lineTo(-2, 5);
      targetCtx.closePath();
      targetCtx.fill();

      // 4. Vest lapel outline & Shiny Silver Buttons
      targetCtx.strokeStyle = '#0f172a';
      targetCtx.lineWidth = 1.2;
      targetCtx.beginPath();
      targetCtx.moveTo(2, 0); targetCtx.lineTo(5, 6); targetCtx.lineTo(3, 14);
      targetCtx.stroke();

      targetCtx.fillStyle = '#e2e8f0';
      targetCtx.beginPath();
      targetCtx.arc(3.5, 6.5, 1.2, 0, Math.PI * 2);
      targetCtx.arc(3, 10, 1.2, 0, Math.PI * 2);
      targetCtx.arc(2.5, 13.5, 1.2, 0, Math.PI * 2);
      targetCtx.fill();
    } else if(outfitId === 'bluetie') {
      // 1. Sky Blue Formal Pilot Shirt
      targetCtx.fillStyle = '#dbeafe';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18, 14, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // 2. Dark Navy Pilot Vest
      targetCtx.fillStyle = '#0f172a';
      targetCtx.beginPath();
      targetCtx.ellipse(-1, 2, 17.5, 13.5, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // 3. V-Neck Shirt Cutout
      targetCtx.fillStyle = '#eff6ff';
      targetCtx.beginPath();
      targetCtx.moveTo(2, 0);
      targetCtx.lineTo(12, 2);
      targetCtx.lineTo(4, 14);
      targetCtx.lineTo(-2, 5);
      targetCtx.closePath();
      targetCtx.fill();

      // 4. Gold Captain Rank Stripes on Shoulder
      targetCtx.strokeStyle = '#fbbf24';
      targetCtx.lineWidth = 1.4;
      targetCtx.beginPath();
      targetCtx.moveTo(-6, -2); targetCtx.lineTo(-1, 0);
      targetCtx.moveTo(-6, 1); targetCtx.lineTo(-1, 3);
      targetCtx.stroke();
    } else if(outfitId === 'bowtie') {
      // 1. Obsidian Black Tuxedo Body
      targetCtx.fillStyle = '#09090b';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18.5, 14.5, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // 2. White Pleated Tuxedo Bib
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.moveTo(3, -7);
      targetCtx.lineTo(14, 0);
      targetCtx.lineTo(5, 14);
      targetCtx.lineTo(-2, 4);
      targetCtx.closePath();
      targetCtx.fill();

      // 3. Black Onyx Buttons
      targetCtx.fillStyle = '#09090b';
      targetCtx.beginPath();
      targetCtx.arc(6, 2, 1.2, 0, Math.PI * 2);
      targetCtx.arc(5.5, 6.5, 1.2, 0, Math.PI * 2);
      targetCtx.arc(5, 11, 1.2, 0, Math.PI * 2);
      targetCtx.fill();

      // 4. Red Silk Pocket Square on Left Chest
      targetCtx.fillStyle = '#dc2626';
      targetCtx.beginPath();
      targetCtx.moveTo(-4, -1); targetCtx.lineTo(-2, -6); targetCtx.lineTo(0, -1);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.strokeStyle = '#fbbf24';
      targetCtx.lineWidth = 0.8;
      targetCtx.stroke();

      // Satin Lapels
      targetCtx.strokeStyle = '#334155';
      targetCtx.lineWidth = 1.5;
      targetCtx.beginPath();
      targetCtx.moveTo(3, -7); targetCtx.lineTo(6, 3); targetCtx.lineTo(4, 14);
      targetCtx.stroke();
    } else if(outfitId === 'goldchain') {
      // 1. Black Leather Bomber Jacket covering full torso
      targetCtx.fillStyle = '#18181b';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18.5, 14.5, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // 2. Red & White Sporty Racing Stripes along the bottom rim
      targetCtx.strokeStyle = '#ef4444';
      targetCtx.lineWidth = 2.4;
      targetCtx.beginPath();
      targetCtx.arc(0, 1, 17, 1.6, 3.4);
      targetCtx.stroke();

      targetCtx.strokeStyle = '#ffffff';
      targetCtx.lineWidth = 1.2;
      targetCtx.beginPath();
      targetCtx.arc(0, 1, 15.2, 1.6, 3.4);
      targetCtx.stroke();

      // 3. Metallic Silver Zipper Track down the front
      targetCtx.strokeStyle = '#94a3b8';
      targetCtx.lineWidth = 1.4;
      targetCtx.beginPath();
      targetCtx.moveTo(6, -4); targetCtx.lineTo(6, 14);
      targetCtx.stroke();

      // Inner white shirt collar
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.moveTo(4, -6); targetCtx.lineTo(10, -2); targetCtx.lineTo(6, 2);
      targetCtx.closePath();
      targetCtx.fill();
    } else if(outfitId === 'scarf') {
      // 1. Chunky Winter Cable-Knit Sweater
      targetCtx.fillStyle = '#9a3412';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18.5, 14.5, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // Cable knit texture lines
      targetCtx.strokeStyle = '#fed7aa';
      targetCtx.lineWidth = 1.2;
      targetCtx.beginPath();
      targetCtx.moveTo(-8, -2); targetCtx.lineTo(7, -2);
      targetCtx.moveTo(-10, 3); targetCtx.lineTo(8, 3);
      targetCtx.moveTo(-8, 8); targetCtx.lineTo(6, 8);
      targetCtx.moveTo(-6, 13); targetCtx.lineTo(4, 13);
      targetCtx.stroke();
    } else if(outfitId === 'badge') {
      // 1. Wild West Rustic Suede Leather Vest
      targetCtx.fillStyle = '#78350f';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18.5, 14.5, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // Dark Leather Stitching Trim
      targetCtx.strokeStyle = '#451a03';
      targetCtx.lineWidth = 2;
      targetCtx.stroke();

      // Inner cream cowboy shirt
      targetCtx.fillStyle = '#fef3c7';
      targetCtx.beginPath();
      targetCtx.moveTo(3, -5); targetCtx.lineTo(12, 0); targetCtx.lineTo(6, 13);
      targetCtx.closePath();
      targetCtx.fill();
    } else if(outfitId === 'princessdress') {
      // Royal Princess Ballroom Gown
      targetCtx.fillStyle = '#f472b6';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 2, 18.5, 14.5, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // Flared ballroom skirt drape
      targetCtx.fillStyle = '#fbcfe8';
      targetCtx.beginPath();
      targetCtx.moveTo(-16, 6);
      targetCtx.quadraticCurveTo(0, 19, 14, 8);
      targetCtx.quadraticCurveTo(0, 12, -16, 6);
      targetCtx.fill();

      // Scalloped White Lace Frills along bottom hem
      targetCtx.fillStyle = '#ffffff';
      for(let i = 0; i < 5; i++) {
        targetCtx.beginPath();
        targetCtx.arc(-12 + i * 6, 13, 3, 0, Math.PI);
        targetCtx.fill();
      }

      // Golden Waistline Ribbon
      targetCtx.strokeStyle = '#f59e0b';
      targetCtx.lineWidth = 1.4;
      targetCtx.beginPath();
      targetCtx.moveTo(-10, 4);
      targetCtx.quadraticCurveTo(0, 8, 11, 4);
      targetCtx.stroke();
    } else if(outfitId === 'kimono') {
      // Sakura Blossom Silk Kimono
      targetCtx.fillStyle = '#fda4af';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18, 14, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // Sakura Petals on Kimono
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(-6, 7, 2, 0, Math.PI * 2);
      targetCtx.arc(4, 11, 2.2, 0, Math.PI * 2);
      targetCtx.arc(-11, 2, 1.8, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#f43f5e';
      targetCtx.beginPath();
      targetCtx.arc(-6, 7, 1, 0, Math.PI * 2);
      targetCtx.arc(4, 11, 1, 0, Math.PI * 2);
      targetCtx.fill();

      // Wide Magenta & Gold Obi Sash
      targetCtx.fillStyle = '#9d174d';
      targetCtx.beginPath();
      targetCtx.moveTo(-9, 5); targetCtx.lineTo(11, 5); targetCtx.lineTo(10, 11); targetCtx.lineTo(-10, 11);
      targetCtx.closePath();
      targetCtx.fill();

      targetCtx.fillStyle = '#fbbf24';
      targetCtx.fillRect(-9, 7.5, 19, 1.8);
    } else if(outfitId === 'fairy') {
      // Magical Mint & Lilac Fairy Tunic
      targetCtx.fillStyle = '#6ee7b7';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18, 14, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // Petal Skirt Overlay
      targetCtx.fillStyle = '#c084fc';
      targetCtx.beginPath();
      targetCtx.moveTo(-12, 4);
      targetCtx.lineTo(-6, 15);
      targetCtx.lineTo(0, 6);
      targetCtx.lineTo(6, 15);
      targetCtx.lineTo(12, 4);
      targetCtx.closePath();
      targetCtx.fill();

      // Sparkle glints
      targetCtx.fillStyle = '#ffffff';
      drawCanvasSparkle(targetCtx, -3, 11, 2.2);
      drawCanvasSparkle(targetCtx, 8, 8, 2.2);
    } else if(outfitId === 'ballerina') {
      // Swan Ballerina Tutu & Satin Corset
      targetCtx.fillStyle = '#f472b6';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 0, 18, 13.5, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // Multi-layered Ruffled Ballerina Tutu Skirt
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 8, 19, 7.5, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#fce7f3';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 7, 16.5, 5.5, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // Silver sequin trim on tutu
      targetCtx.strokeStyle = '#e2e8f0';
      targetCtx.lineWidth = 1.2;
      targetCtx.beginPath();
      targetCtx.ellipse(0, 8, 18.5, 7, 0, 0, Math.PI * 2);
      targetCtx.stroke();
    } else if(outfitId === 'sailor') {
      // Navy Sailor Schoolgirl Uniform
      targetCtx.fillStyle = '#1e3a8a';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18, 14, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // White Sailor Shirt V-Opening
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.moveTo(2, 0); targetCtx.lineTo(12, 2); targetCtx.lineTo(4, 13); targetCtx.lineTo(-2, 4);
      targetCtx.closePath();
      targetCtx.fill();

      // Dual Sailor Stripes
      targetCtx.strokeStyle = '#ffffff';
      targetCtx.lineWidth = 1.2;
      targetCtx.beginPath();
      targetCtx.moveTo(-6, -1); targetCtx.lineTo(-1, 2);
      targetCtx.moveTo(-6, 2); targetCtx.lineTo(-1, 5);
      targetCtx.stroke();
    } else if(outfitId === 'ninja_suit') {
      targetCtx.fillStyle = '#18181b';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18, 14, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#3f3f46';
      targetCtx.lineWidth = 1.4;
      targetCtx.stroke();
    } else if(outfitId === 'cyber_armor') {
      targetCtx.fillStyle = '#334155';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18.5, 14, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#0284c7';
      targetCtx.lineWidth = 1.8;
      targetCtx.stroke();
    } else if(outfitId === 'hoodie') {
      targetCtx.fillStyle = '#475569';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18.5, 14.5, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#334155';
      rrTo(targetCtx, -4, 6, 14, 6, 2);
    } else if(outfitId === 'angel_wings') {
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18, 14, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#fde047';
      targetCtx.lineWidth = 1.2;
      targetCtx.stroke();
    } else if(outfitId === 'royal_robe') {
      targetCtx.fillStyle = '#991b1b';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18.5, 14.5, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.moveTo(-16, 5); targetCtx.quadraticCurveTo(0, 18, 14, 8); targetCtx.lineTo(12, 14); targetCtx.quadraticCurveTo(0, 21, -16, 10);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.fillStyle = '#000000';
      [-10, -2, 6].forEach(fx => { targetCtx.fillRect(fx, 13, 2, 2.5); });
    }

    targetCtx.restore();
  }

  function drawOutfitFrontTo(targetCtx, outfitId) {
    if(!outfitId || outfitId === 'none') return;
    targetCtx.save();

    if(outfitId === 'cape') {
      // Rich red collar clasp wrapping around the throat
      targetCtx.fillStyle = '#b91c1c';
      targetCtx.beginPath();
      targetCtx.ellipse(6, -4, 7, 3, 0.2, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#fbbf24';
      targetCtx.lineWidth = 1.2;
      targetCtx.stroke();

      // Golden Lion/Eagle Epaulet Brooch on collar
      targetCtx.fillStyle = '#fbbf24';
      targetCtx.beginPath();
      targetCtx.arc(6, -4, 4, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#d97706';
      targetCtx.lineWidth = 1.2;
      targetCtx.stroke();

      // Ruby gemstone center with sparkle
      targetCtx.fillStyle = '#dc2626';
      targetCtx.beginPath();
      targetCtx.arc(6, -4, 2.2, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(6.8, -4.8, 0.8, 0, Math.PI * 2);
      targetCtx.fill();

      // Golden drape chain across chest
      targetCtx.strokeStyle = '#fbbf24';
      targetCtx.lineWidth = 1.4;
      targetCtx.beginPath();
      targetCtx.arc(7, -3, 6, 0.4, 2.6);
      targetCtx.stroke();
    } else if(outfitId === 'redtie') {
      // 1. Crisp White Dress Shirt Collar (lowered to chest level)
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.moveTo(2, 0); targetCtx.lineTo(7, 3); targetCtx.lineTo(12, 0); targetCtx.lineTo(9, -1);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.strokeStyle = '#cbd5e1';
      targetCtx.lineWidth = 0.8;
      targetCtx.stroke();

      // 2. Crimson Silk Tie Knot (under collar)
      targetCtx.fillStyle = '#dc2626';
      targetCtx.beginPath();
      targetCtx.moveTo(5, 2); targetCtx.lineTo(9, 2); targetCtx.lineTo(8.5, 5); targetCtx.lineTo(5.5, 5);
      targetCtx.closePath();
      targetCtx.fill();

      // 3. Animated Flowing Silk Tie Body (swaying with flight physics)
      const tieSway = Math.sin(performance.now() / 110) * 3;
      const tieLift = Math.cos(performance.now() / 150) * 1.2;

      targetCtx.beginPath();
      targetCtx.moveTo(5.5, 5);
      targetCtx.lineTo(8.5, 5);
      targetCtx.lineTo(10.5 + tieSway, 14 + tieLift);
      targetCtx.lineTo(7.5 + tieSway, 18 + tieLift);
      targetCtx.lineTo(4.5 + tieSway, 14 + tieLift);
      targetCtx.closePath();
      targetCtx.fill();

      // 4. Animated Gold & Navy Diagonal Pinstripes
      targetCtx.strokeStyle = '#fde047';
      targetCtx.lineWidth = 1.2;
      targetCtx.beginPath();
      targetCtx.moveTo(5.5 + tieSway * 0.25, 7.5); targetCtx.lineTo(9 + tieSway * 0.25, 9.5);
      targetCtx.moveTo(5 + tieSway * 0.65, 12); targetCtx.lineTo(9.5 + tieSway * 0.65, 14);
      targetCtx.stroke();

      // 5. Polished Gold Tie Clip
      targetCtx.fillStyle = '#fbbf24';
      rrTo(targetCtx, 4.8 + tieSway * 0.35, 9.5, 5.8, 1.8, 0.6);
      targetCtx.fillStyle = '#d97706';
      targetCtx.fillRect(5.3 + tieSway * 0.35, 10, 1, 0.8);
    } else if(outfitId === 'bluetie') {
      // 1. Pilot White Shirt Collar (lowered)
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.moveTo(2, 0); targetCtx.lineTo(7, 3); targetCtx.lineTo(12, 0); targetCtx.lineTo(9, -1);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.strokeStyle = '#cbd5e1';
      targetCtx.lineWidth = 0.8;
      targetCtx.stroke();

      // 2. Royal Blue Tie Knot
      targetCtx.fillStyle = '#1d4ed8';
      targetCtx.beginPath();
      targetCtx.moveTo(5, 2); targetCtx.lineTo(9, 2); targetCtx.lineTo(8.5, 5); targetCtx.lineTo(5.5, 5);
      targetCtx.closePath();
      targetCtx.fill();

      // 3. Animated Royal Blue Tie Body (swaying with wind flutter)
      const tieSway = Math.sin(performance.now() / 110) * 3;
      const tieLift = Math.cos(performance.now() / 150) * 1.2;

      targetCtx.fillStyle = '#2563eb';
      targetCtx.beginPath();
      targetCtx.moveTo(5.5, 5);
      targetCtx.lineTo(8.5, 5);
      targetCtx.lineTo(10.5 + tieSway, 14 + tieLift);
      targetCtx.lineTo(7.5 + tieSway, 18 + tieLift);
      targetCtx.lineTo(4.5 + tieSway, 14 + tieLift);
      targetCtx.closePath();
      targetCtx.fill();

      // 4. Animated Polka Dots on Tie
      targetCtx.fillStyle = '#dbeafe';
      targetCtx.beginPath();
      targetCtx.arc(7 + tieSway * 0.2, 7.5, 0.9, 0, Math.PI * 2);
      targetCtx.arc(6.2 + tieSway * 0.5, 11.5, 0.9, 0, Math.PI * 2);
      targetCtx.arc(8.5 + tieSway * 0.5, 11.5, 0.9, 0, Math.PI * 2);
      targetCtx.arc(7.5 + tieSway * 0.8, 15.5, 0.9, 0, Math.PI * 2);
      targetCtx.fill();

      // 5. Silver Tie Bar
      targetCtx.fillStyle = '#cbd5e1';
      rrTo(targetCtx, 4.8 + tieSway * 0.35, 9.5, 5.5, 1.6, 0.5);

      // 6. Gold Pilot Wings Badge on Chest
      targetCtx.fillStyle = '#fbbf24';
      targetCtx.beginPath();
      targetCtx.moveTo(-2, 3); targetCtx.lineTo(2, 1.5); targetCtx.lineTo(2, 4.5); targetCtx.closePath();
      targetCtx.fill();
    } else if(outfitId === 'bowtie') {
      // 1. Tuxedo Wingtip Collar
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.moveTo(2, -1); targetCtx.lineTo(7, 2); targetCtx.lineTo(12, -1);
      targetCtx.fill();

      // 2. 3D Velvet Red Bowtie Loops
      targetCtx.fillStyle = '#991b1b';
      targetCtx.beginPath();
      targetCtx.moveTo(7, 1); targetCtx.lineTo(2, -2); targetCtx.lineTo(2, 4); targetCtx.closePath();
      targetCtx.moveTo(7, 1); targetCtx.lineTo(12, -2); targetCtx.lineTo(12, 4); targetCtx.closePath();
      targetCtx.fill();

      targetCtx.fillStyle = '#dc2626';
      targetCtx.beginPath();
      targetCtx.moveTo(7, 1); targetCtx.lineTo(2.5, -1.5); targetCtx.lineTo(2.5, 3.5); targetCtx.closePath();
      targetCtx.moveTo(7, 1); targetCtx.lineTo(11.5, -1.5); targetCtx.lineTo(11.5, 3.5); targetCtx.closePath();
      targetCtx.fill();

      // 3. Polished Gold Center Knot Ring
      targetCtx.fillStyle = '#fbbf24';
      rrTo(targetCtx, 5.5, -0.5, 3, 3.5, 1);
      targetCtx.fillStyle = '#d97706';
      targetCtx.fillRect(6.2, 0, 1.4, 2);
    } else if(outfitId === 'goldchain') {
      // 1. Heavy Cuban-Link Gold Chain Draping Across Upper Chest
      targetCtx.strokeStyle = '#d97706';
      targetCtx.lineWidth = 2.8;
      targetCtx.beginPath();
      targetCtx.moveTo(2, 0);
      targetCtx.quadraticCurveTo(6.5, 5, 11, 1);
      targetCtx.stroke();

      targetCtx.strokeStyle = '#fbbf24';
      targetCtx.lineWidth = 1.8;
      targetCtx.shadowColor = 'rgba(251,191,36,0.6)';
      targetCtx.shadowBlur = 4;
      targetCtx.beginPath();
      targetCtx.moveTo(2, 0);
      targetCtx.quadraticCurveTo(6.5, 5, 11, 1);
      targetCtx.stroke();
      targetCtx.shadowBlur = 0;

      // 2. Heavy Gold Dollar Medallion centered on the chest
      targetCtx.fillStyle = '#f59e0b';
      targetCtx.beginPath();
      targetCtx.arc(6.5, 7, 4.5, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#fbbf24';
      targetCtx.beginPath();
      targetCtx.arc(6.5, 7, 3.6, 0, Math.PI * 2);
      targetCtx.fill();

      // 3. Embossed Dollar Sign $
      targetCtx.fillStyle = '#78350f';
      targetCtx.font = 'bold 6px Arial';
      targetCtx.textAlign = 'center';
      targetCtx.textBaseline = 'middle';
      targetCtx.fillText('$', 6.5, 7.3);

      // Star Sparkle Glint
      targetCtx.fillStyle = '#ffffff';
      drawCanvasSparkle(targetCtx, 9, 5, 2.5);
    } else if(outfitId === 'scarf') {
      const scarfWave = Math.sin(performance.now() / 130) * 3.5;

      // 1. Waving Scarf Tails trailing behind from the back of the neck
      targetCtx.fillStyle = '#ea580c';
      targetCtx.beginPath();
      targetCtx.moveTo(-2, 0);
      targetCtx.quadraticCurveTo(-16, 4 + scarfWave * 0.5, -24, 17 + scarfWave);
      targetCtx.lineTo(-18, 18 + scarfWave);
      targetCtx.lineTo(-1, 3);
      targetCtx.closePath();
      targetCtx.fill();

      // Yellow Stripes on trailing scarf tail
      targetCtx.fillStyle = '#fef08a';
      targetCtx.beginPath();
      targetCtx.moveTo(-8, 6 + scarfWave * 0.3); targetCtx.lineTo(-14, 9 + scarfWave * 0.4);
      targetCtx.lineTo(-13, 11 + scarfWave * 0.4); targetCtx.lineTo(-7, 8 + scarfWave * 0.3);
      targetCtx.closePath();
      targetCtx.fill();

      // White Fluffy Yarn Fringe Tassels
      targetCtx.fillStyle = '#ffffff';
      for(let i = 0; i < 4; i++) {
        targetCtx.fillRect(-24 + i * 1.6, 17 + scarfWave, 1.2, 4);
      }

      // 2. Thick Chunky Neck Wrap around the throat
      targetCtx.fillStyle = '#ea580c';
      rrTo(targetCtx, 1, -1, 12, 7, 3.5);
      targetCtx.fillStyle = '#fef08a';
      targetCtx.fillRect(2, 1, 10, 2);
      targetCtx.strokeStyle = '#c2410c';
      targetCtx.lineWidth = 1;
      targetCtx.stroke();
    } else if(outfitId === 'badge') {
      // 1. Red Western Neckerchief Bandana wrapped around the neck
      targetCtx.fillStyle = '#dc2626';
      targetCtx.beginPath();
      targetCtx.moveTo(2, -1);
      targetCtx.lineTo(12, 1);
      targetCtx.lineTo(7, 7);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.fillStyle = '#fca5a5';
      targetCtx.fillRect(5, 1, 4, 1.3);

      // 2. Golden 5-pointed Sheriff Star pinned on the chest vest
      targetCtx.save();
      targetCtx.translate(3.5, 6);
      targetCtx.fillStyle = '#fbbf24';
      targetCtx.shadowColor = 'rgba(251,191,36,0.7)';
      targetCtx.shadowBlur = 4;

      const cx = 0, cy = 0, rOut = 4.5, rIn = 2;
      targetCtx.beginPath();
      for(let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? rOut : rIn;
        const a = i * Math.PI / 5 - Math.PI / 2;
        const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
        if(i === 0) targetCtx.moveTo(px, py); else targetCtx.lineTo(px, py);
      }
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.shadowBlur = 0;

      // Ball tips on each star point
      targetCtx.fillStyle = '#f59e0b';
      for(let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
        targetCtx.beginPath();
        targetCtx.arc(Math.cos(a) * 4.5, Math.sin(a) * 4.5, 0.9, 0, Math.PI * 2);
        targetCtx.fill();
      }

      // Center seal
      targetCtx.fillStyle = '#78350f';
      targetCtx.beginPath();
      targetCtx.arc(0, 0, 1.8, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#fde047';
      drawCanvasStar(targetCtx, 0, 0.2, 1.2, 0.6);

      targetCtx.restore();
    } else if(outfitId === 'princessdress') {
      // Pearl Choker & Glowing Ruby Heart Pendant
      targetCtx.fillStyle = '#ffffff';
      for(let i = 0; i < 5; i++) {
        targetCtx.beginPath();
        targetCtx.arc(3 + i * 2.2, 1 + Math.sin(i * 0.7) * 1.2, 1.2, 0, Math.PI * 2);
        targetCtx.fill();
      }

      // Ruby Heart Locket
      targetCtx.fillStyle = '#e11d48';
      targetCtx.shadowColor = '#f43f5e';
      targetCtx.shadowBlur = 4;
      targetCtx.beginPath();
      targetCtx.arc(6.5, 6, 3, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.shadowBlur = 0;

      targetCtx.strokeStyle = '#fbbf24';
      targetCtx.lineWidth = 1.2;
      targetCtx.stroke();

      targetCtx.fillStyle = '#ffffff';
      drawCanvasSparkle(targetCtx, 8.5, 4.5, 2.5);
    } else if(outfitId === 'kimono') {
      // Kimono Overlapping V-Collar
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.moveTo(2, 0); targetCtx.lineTo(7, 3); targetCtx.lineTo(12, 0);
      targetCtx.stroke();

      // Hanging Golden Obi Tassel
      const tasselSway = Math.sin(performance.now() / 120) * 2;
      targetCtx.fillStyle = '#fbbf24';
      targetCtx.beginPath();
      targetCtx.arc(7, 8, 2, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#f59e0b';
      targetCtx.lineWidth = 1.6;
      targetCtx.beginPath();
      targetCtx.moveTo(7, 8);
      targetCtx.lineTo(7 + tasselSway, 16);
      targetCtx.stroke();
    } else if(outfitId === 'fairy') {
      // Emerald Star Amulet
      targetCtx.strokeStyle = '#fde047';
      targetCtx.lineWidth = 1.4;
      targetCtx.beginPath();
      targetCtx.moveTo(2, 0); targetCtx.quadraticCurveTo(6.5, 4, 11, 1);
      targetCtx.stroke();

      targetCtx.fillStyle = '#10b981';
      targetCtx.shadowColor = '#34d399';
      targetCtx.shadowBlur = 6;
      targetCtx.beginPath();
      targetCtx.arc(6.5, 6, 3.2, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.shadowBlur = 0;
      targetCtx.fillStyle = '#ffffff';
      drawCanvasSparkle(targetCtx, 6.5, 6.5, 2.5);
    } else if(outfitId === 'ballerina') {
      // Satin Ribbon Choker & Silver Ballerina Slipper
      targetCtx.fillStyle = '#f472b6';
      targetCtx.fillRect(2, 0.5, 10, 1.8);

      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(7, 6, 2.5, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#cbd5e1';
      targetCtx.lineWidth = 0.8;
      targetCtx.stroke();
    } else if(outfitId === 'sailor') {
      // Sailor Front Collar & Animated Red Ribbon Bow
      const bowSway = Math.sin(performance.now() / 110) * 2.5;

      // Sailor V-Flap
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.moveTo(2, -1); targetCtx.lineTo(7, 3); targetCtx.lineTo(12, -1); targetCtx.lineTo(9, -2);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.strokeStyle = '#1e3a8a';
      targetCtx.lineWidth = 0.8;
      targetCtx.stroke();

      // Red Ribbon Bow Loops
      targetCtx.fillStyle = '#dc2626';
      targetCtx.beginPath();
      targetCtx.moveTo(7, 3); targetCtx.lineTo(3, 1); targetCtx.lineTo(3, 6); targetCtx.closePath();
      targetCtx.moveTo(7, 3); targetCtx.lineTo(11, 1); targetCtx.lineTo(11, 6); targetCtx.closePath();
      targetCtx.fill();

      // Center Knot
      targetCtx.fillStyle = '#b91c1c';
      targetCtx.beginPath();
      targetCtx.arc(7, 3.5, 1.8, 0, Math.PI * 2);
      targetCtx.fill();

      // Fluttering Ribbon Tails
      targetCtx.strokeStyle = '#dc2626';
      targetCtx.lineWidth = 2.4;
      targetCtx.beginPath();
      targetCtx.moveTo(6, 4); targetCtx.lineTo(4 + bowSway, 14);
      targetCtx.moveTo(8, 4); targetCtx.lineTo(10 + bowSway, 14);
      targetCtx.stroke();
    } else if(outfitId === 'ninja_suit') {
      const sWave = Math.sin(performance.now() / 100) * 4;
      // Waving Black Shinobi Scarf Tails
      targetCtx.strokeStyle = '#18181b';
      targetCtx.lineWidth = 4;
      targetCtx.beginPath();
      targetCtx.moveTo(-2, 1);
      targetCtx.quadraticCurveTo(-14, 6 + sWave, -24, 18 + sWave);
      targetCtx.stroke();
      // Red Neck Wrap
      targetCtx.fillStyle = '#dc2626';
      rrTo(targetCtx, 1, -1, 12, 6, 3);
      // Silver Shuriken Pin
      targetCtx.fillStyle = '#cbd5e1';
      drawCanvasSparkle(targetCtx, 7, 7, 3.5);
    } else if(outfitId === 'cyber_armor') {
      // Glowing Cyan Arc Reactor on Chest
      targetCtx.save();
      targetCtx.fillStyle = '#0284c7';
      targetCtx.shadowColor = '#38bdf8';
      targetCtx.shadowBlur = 8;
      targetCtx.beginPath();
      targetCtx.arc(6.5, 6, 4, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(6.5, 6, 2, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.restore();
    } else if(outfitId === 'hoodie') {
      // Hoodie Drawstrings
      targetCtx.strokeStyle = '#e2e8f0';
      targetCtx.lineWidth = 1.4;
      targetCtx.beginPath();
      targetCtx.moveTo(4, 1); targetCtx.lineTo(4, 10);
      targetCtx.moveTo(9, 1); targetCtx.lineTo(9, 10);
      targetCtx.stroke();
      targetCtx.fillStyle = '#94a3b8';
      targetCtx.fillRect(3.2, 9.5, 1.6, 2);
      targetCtx.fillRect(8.2, 9.5, 1.6, 2);
    } else if(outfitId === 'angel_wings') {
      // Holy Halo / Golden Sun Medallion
      targetCtx.strokeStyle = '#fbbf24';
      targetCtx.lineWidth = 1.6;
      targetCtx.beginPath();
      targetCtx.moveTo(2, 0); targetCtx.quadraticCurveTo(6.5, 4, 11, 1);
      targetCtx.stroke();
      targetCtx.fillStyle = '#fde047';
      drawCanvasStar(targetCtx, 6.5, 6, 3.5, 1.8);
    } else if(outfitId === 'royal_robe') {
      // Golden Royal Chain of Office
      targetCtx.strokeStyle = '#fbbf24';
      targetCtx.lineWidth = 2.2;
      targetCtx.beginPath();
      targetCtx.moveTo(2, 0); targetCtx.quadraticCurveTo(6.5, 5, 11, 1);
      targetCtx.stroke();
      targetCtx.fillStyle = '#f59e0b';
      targetCtx.beginPath();
      targetCtx.arc(6.5, 6, 3.5, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#dc2626';
      targetCtx.beginPath();
      targetCtx.arc(6.5, 6, 1.8, 0, Math.PI * 2);
      targetCtx.fill();
    }

    targetCtx.restore();
  }

  function drawHatTo(targetCtx, hatId) {
    if(!hatId || hatId === 'none') return;
    targetCtx.save();
    if(hatId === 'tophat') {
      targetCtx.fillStyle = '#1e2430';
      rrTo(targetCtx, -4, -16, 23, 4, 1.5);
      rrTo(targetCtx, 0, -30, 16, 15, 2);
      targetCtx.fillStyle = '#e63946';
      targetCtx.fillRect(0, -20, 16, 4);
      targetCtx.fillStyle = 'rgba(255,255,255,0.25)';
      targetCtx.fillRect(2, -29, 3, 12);
    } else if(hatId === 'cap') {
      targetCtx.fillStyle = '#2563eb';
      targetCtx.beginPath();
      targetCtx.arc(6, -14, 10, Math.PI, 0);
      targetCtx.fill();
      targetCtx.fillStyle = '#1d4ed8';
      targetCtx.beginPath();
      targetCtx.moveTo(9, -14);
      targetCtx.lineTo(23, -12);
      targetCtx.lineTo(21, -16);
      targetCtx.lineTo(9, -16);
      targetCtx.fill();
      targetCtx.fillStyle = '#fff';
      targetCtx.beginPath();
      targetCtx.arc(6, -24, 2, 0, 7);
      targetCtx.fill();
    } else if(hatId === 'crown') {
      targetCtx.fillStyle = '#f59e0b';
      rrTo(targetCtx, 0, -17, 16, 4, 1);
      targetCtx.beginPath();
      targetCtx.moveTo(0, -17);
      targetCtx.lineTo(0, -27);
      targetCtx.lineTo(4, -22);
      targetCtx.lineTo(8, -29);
      targetCtx.lineTo(12, -22);
      targetCtx.lineTo(16, -27);
      targetCtx.lineTo(16, -17);
      targetCtx.fill();
      targetCtx.fillStyle = '#ef4444';
      targetCtx.beginPath();
      targetCtx.arc(8, -20, 2, 0, 7);
      targetCtx.fill();
      targetCtx.fillStyle = '#10b981';
      targetCtx.beginPath();
      targetCtx.arc(2.5, -20, 1.4, 0, 7);
      targetCtx.arc(13.5, -20, 1.4, 0, 7);
      targetCtx.fill();
    } else if(hatId === 'party') {
      targetCtx.fillStyle = '#ec4899';
      targetCtx.beginPath();
      targetCtx.moveTo(0, -15);
      targetCtx.lineTo(8, -34);
      targetCtx.lineTo(16, -14);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.strokeStyle = '#facc15';
      targetCtx.lineWidth = 2.2;
      targetCtx.beginPath();
      targetCtx.moveTo(3, -22); targetCtx.lineTo(13, -21);
      targetCtx.moveTo(5, -28); targetCtx.lineTo(11, -27);
      targetCtx.stroke();
      targetCtx.fillStyle = '#38bdf8';
      targetCtx.beginPath();
      targetCtx.arc(8, -35, 3.2, 0, 7);
      targetCtx.fill();
    } else if(hatId === 'cowboy') {
      targetCtx.fillStyle = '#854d0e';
      targetCtx.beginPath();
      targetCtx.ellipse(7, -15, 15, 3.5, -0.06, 0, 7);
      targetCtx.fill();
      targetCtx.beginPath();
      targetCtx.moveTo(2, -16);
      targetCtx.quadraticCurveTo(4, -26, 7, -25);
      targetCtx.quadraticCurveTo(10, -26, 12, -16);
      targetCtx.fill();
      targetCtx.fillStyle = '#451a03';
      targetCtx.fillRect(2.5, -18.5, 10, 2.5);
    } else if(hatId === 'pirate') {
      targetCtx.fillStyle = '#18181b';
      targetCtx.beginPath();
      targetCtx.moveTo(-4, -15);
      targetCtx.quadraticCurveTo(7, -28, 18, -15);
      targetCtx.lineTo(15, -13);
      targetCtx.lineTo(-1, -13);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.strokeStyle = '#eab308';
      targetCtx.lineWidth = 1.6;
      targetCtx.beginPath();
      targetCtx.moveTo(-4, -15);
      targetCtx.quadraticCurveTo(7, -28, 18, -15);
      targetCtx.stroke();
      targetCtx.fillStyle = '#fff';
      targetCtx.beginPath();
      targetCtx.arc(7, -20, 2, 0, 7);
      targetCtx.fill();
    } else if(hatId === 'chef') {
      targetCtx.fillStyle = '#f8fafc';
      targetCtx.beginPath();
      targetCtx.arc(4, -26, 5.5, 0, 7);
      targetCtx.arc(8, -28, 6.5, 0, 7);
      targetCtx.arc(12, -26, 5.5, 0, 7);
      targetCtx.fill();
      targetCtx.fillStyle = '#e2e8f0';
      rrTo(targetCtx, 3, -19, 11, 5.5, 1);
      targetCtx.strokeStyle = '#cbd5e1';
      targetCtx.lineWidth = 1;
      targetCtx.beginPath();
      targetCtx.moveTo(6, -25); targetCtx.lineTo(6, -19);
      targetCtx.moveTo(10, -25); targetCtx.lineTo(10, -19);
      targetCtx.stroke();
    } else if(hatId === 'beanie') {
      targetCtx.fillStyle = '#0284c7';
      targetCtx.beginPath();
      targetCtx.arc(7, -13, 10, Math.PI, 0);
      targetCtx.fill();
      targetCtx.fillStyle = '#0f172a';
      rrTo(targetCtx, -1, -16, 16, 5, 2);
      targetCtx.fillStyle = '#ef4444';
      targetCtx.beginPath();
      targetCtx.arc(7, -24, 3.2, 0, 7);
      targetCtx.fill();
    } else if(hatId === 'flowercrown') {
      // Flower Blossom Crown (Sakura, Roses, Leaves)
      targetCtx.strokeStyle = '#16a34a';
      targetCtx.lineWidth = 2.2;
      targetCtx.beginPath();
      targetCtx.arc(7, -13, 9, Math.PI * 0.92, 0.08);
      targetCtx.stroke();

      // Leaves
      targetCtx.fillStyle = '#22c55e';
      targetCtx.beginPath();
      targetCtx.ellipse(0, -16, 3, 1.6, -0.4, 0, Math.PI * 2);
      targetCtx.ellipse(14, -16, 3, 1.6, 0.4, 0, Math.PI * 2);
      targetCtx.fill();

      // Flower 1 (Pink Sakura)
      targetCtx.fillStyle = '#f472b6';
      for(let a = 0; a < 5; a++) {
        const rad = (a * Math.PI * 2) / 5;
        targetCtx.beginPath();
        targetCtx.arc(1 + Math.cos(rad) * 2.2, -19 + Math.sin(rad) * 2.2, 1.8, 0, Math.PI * 2);
        targetCtx.fill();
      }
      targetCtx.fillStyle = '#fef08a';
      targetCtx.beginPath();
      targetCtx.arc(1, -19, 1.2, 0, Math.PI * 2);
      targetCtx.fill();

      // Flower 2 (Center Rose Red)
      targetCtx.fillStyle = '#ef4444';
      for(let a = 0; a < 5; a++) {
        const rad = (a * Math.PI * 2) / 5;
        targetCtx.beginPath();
        targetCtx.arc(7 + Math.cos(rad) * 2.6, -22 + Math.sin(rad) * 2.6, 2.2, 0, Math.PI * 2);
        targetCtx.fill();
      }
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(7, -22, 1.4, 0, Math.PI * 2);
      targetCtx.fill();

      // Flower 3 (Pastel Pink)
      targetCtx.fillStyle = '#f472b6';
      for(let a = 0; a < 5; a++) {
        const rad = (a * Math.PI * 2) / 5;
        targetCtx.beginPath();
        targetCtx.arc(13 + Math.cos(rad) * 2.2, -19 + Math.sin(rad) * 2.2, 1.8, 0, Math.PI * 2);
        targetCtx.fill();
      }
      targetCtx.fillStyle = '#fef08a';
      targetCtx.beginPath();
      targetCtx.arc(13, -19, 1.2, 0, Math.PI * 2);
      targetCtx.fill();
    } else if(hatId === 'pinkribbon') {
      // Big Cute Pink Lace Ribbon Bow
      const rWave = Math.sin(performance.now() / 140) * 1.5;

      // Trailing Ribbon Tails
      targetCtx.fillStyle = '#ec4899';
      targetCtx.beginPath();
      targetCtx.moveTo(4, -18);
      targetCtx.quadraticCurveTo(-6, -14, -12 + rWave, -8);
      targetCtx.lineTo(-8 + rWave, -7);
      targetCtx.lineTo(6, -16);
      targetCtx.closePath();
      targetCtx.fill();

      // Big Fluffy Bow Loops
      targetCtx.fillStyle = '#ec4899';
      targetCtx.beginPath();
      targetCtx.moveTo(7, -20); targetCtx.lineTo(0, -28); targetCtx.lineTo(0, -15); targetCtx.closePath();
      targetCtx.moveTo(7, -20); targetCtx.lineTo(14, -28); targetCtx.lineTo(14, -15); targetCtx.closePath();
      targetCtx.fill();

      targetCtx.fillStyle = '#f472b6';
      targetCtx.beginPath();
      targetCtx.moveTo(7, -20); targetCtx.lineTo(1, -26); targetCtx.lineTo(1, -16); targetCtx.closePath();
      targetCtx.moveTo(7, -20); targetCtx.lineTo(13, -26); targetCtx.lineTo(13, -16); targetCtx.closePath();
      targetCtx.fill();

      // White Polka Dots
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(3, -21, 1, 0, Math.PI * 2);
      targetCtx.arc(11, -21, 1, 0, Math.PI * 2);
      targetCtx.fill();

      // Center Pearl Heart Knot
      targetCtx.fillStyle = '#fbcfe8';
      targetCtx.beginPath();
      targetCtx.arc(7, -20, 2.5, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(7, -20, 1.3, 0, Math.PI * 2);
      targetCtx.fill();
    } else if(hatId === 'sunhat') {
      // Summer Beach Woven Straw Sunhat
      targetCtx.fillStyle = '#fde047';
      targetCtx.beginPath();
      targetCtx.ellipse(7, -15, 17, 4, -0.05, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#ca8a04';
      targetCtx.lineWidth = 1;
      targetCtx.stroke();

      // Straw Crown Dome
      targetCtx.fillStyle = '#facc15';
      targetCtx.beginPath();
      targetCtx.arc(7, -17, 9, Math.PI, 0);
      targetCtx.fill();

      // Lavender Silk Ribbon Band
      targetCtx.fillStyle = '#c084fc';
      targetCtx.fillRect(0, -18, 14, 3);

      // Trailing Ribbon Tails
      targetCtx.strokeStyle = '#c084fc';
      targetCtx.lineWidth = 2;
      targetCtx.beginPath();
      targetCtx.moveTo(0, -17); targetCtx.lineTo(-8, -10);
      targetCtx.stroke();

      // Pinned Daisy Flower
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(1, -17, 2.5, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#f59e0b';
      targetCtx.beginPath();
      targetCtx.arc(1, -17, 1, 0, Math.PI * 2);
      targetCtx.fill();
    } else if(hatId === 'tiara') {
      // Sparkling Princess Tiara Crown
      targetCtx.save();
      targetCtx.fillStyle = '#f1f5f9';
      targetCtx.shadowColor = '#f472b6';
      targetCtx.shadowBlur = 6;

      // Tiara Base Silver Band
      rrTo(targetCtx, 0, -16, 14, 2.5, 1);

      // 3 Elegant Diamond Arches
      targetCtx.beginPath();
      targetCtx.moveTo(0, -16);
      targetCtx.lineTo(2, -24);
      targetCtx.lineTo(5, -19);
      targetCtx.lineTo(7, -27);
      targetCtx.lineTo(9, -19);
      targetCtx.lineTo(12, -24);
      targetCtx.lineTo(14, -16);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.shadowBlur = 0;

      // Pink Ruby Gems on 3 Peaks
      targetCtx.fillStyle = '#f43f5e';
      targetCtx.beginPath();
      targetCtx.arc(7, -27, 2, 0, Math.PI * 2);
      targetCtx.arc(2, -24, 1.4, 0, Math.PI * 2);
      targetCtx.arc(12, -24, 1.4, 0, Math.PI * 2);
      targetCtx.fill();

      // Star Sparkle
      targetCtx.fillStyle = '#ffffff';
      drawCanvasSparkle(targetCtx, 7, -30, 3);
      targetCtx.restore();
    } else if(hatId === 'catears') {
      // Kitty Cat Ears Headband with Jingle Bells
      targetCtx.strokeStyle = '#f472b6';
      targetCtx.lineWidth = 2;
      targetCtx.beginPath();
      targetCtx.arc(7, -13, 9, Math.PI * 0.9, 0.1);
      targetCtx.stroke();

      // Left Ear
      targetCtx.fillStyle = '#f472b6';
      targetCtx.beginPath();
      targetCtx.moveTo(-2, -15); targetCtx.lineTo(-4, -28); targetCtx.lineTo(4, -19);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.fillStyle = '#fdf2f8';
      targetCtx.beginPath();
      targetCtx.moveTo(-1, -16); targetCtx.lineTo(-3, -25); targetCtx.lineTo(3, -19);
      targetCtx.closePath();
      targetCtx.fill();

      // Right Ear
      targetCtx.fillStyle = '#f472b6';
      targetCtx.beginPath();
      targetCtx.moveTo(10, -19); targetCtx.lineTo(18, -28); targetCtx.lineTo(16, -15);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.fillStyle = '#fdf2f8';
      targetCtx.beginPath();
      targetCtx.moveTo(11, -19); targetCtx.lineTo(17, -25); targetCtx.lineTo(15, -16);
      targetCtx.closePath();
      targetCtx.fill();

      // Gold Jingle Bells & Red Ribbon on Left Ear
      targetCtx.fillStyle = '#fbbf24';
      targetCtx.beginPath();
      targetCtx.arc(-2, -15, 2.2, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#ef4444';
      targetCtx.fillRect(-3, -16, 2, 1);
    } else if(hatId === 'viking') {
      // Viking Iron Helmet with Curved Horns
      targetCtx.fillStyle = '#64748b';
      targetCtx.beginPath();
      targetCtx.arc(7, -13, 10, Math.PI, 0);
      targetCtx.fill();
      targetCtx.fillStyle = '#475569';
      rrTo(targetCtx, -1, -16, 16, 4.5, 1.5);
      // Left Horn
      targetCtx.fillStyle = '#fde047';
      targetCtx.beginPath();
      targetCtx.moveTo(0, -15);
      targetCtx.quadraticCurveTo(-10, -22, -8, -30);
      targetCtx.quadraticCurveTo(-4, -20, 2, -18);
      targetCtx.closePath();
      targetCtx.fill();
      // Right Horn
      targetCtx.beginPath();
      targetCtx.moveTo(14, -15);
      targetCtx.quadraticCurveTo(24, -22, 22, -30);
      targetCtx.quadraticCurveTo(18, -20, 12, -18);
      targetCtx.closePath();
      targetCtx.fill();
    } else if(hatId === 'astronaut') {
      // Astronaut Dome Helmet with Golden Visor
      targetCtx.fillStyle = '#f8fafc';
      targetCtx.beginPath();
      targetCtx.arc(7, -14, 12, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#94a3b8';
      targetCtx.lineWidth = 1.6;
      targetCtx.stroke();
      // Gold Visor Glass
      targetCtx.fillStyle = '#f59e0b';
      targetCtx.beginPath();
      targetCtx.ellipse(9, -14, 7.5, 6, 0.1, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#d97706';
      targetCtx.lineWidth = 1;
      targetCtx.stroke();
      // Glare reflection
      targetCtx.strokeStyle = '#ffffff';
      targetCtx.lineWidth = 1.4;
      targetCtx.beginPath();
      targetCtx.arc(9, -14, 5, -Math.PI * 0.8, -Math.PI * 0.3);
      targetCtx.stroke();
    } else if(hatId === 'ninja') {
      // Ninja Red Headband with Fluttering Tails
      const nWave = Math.sin(performance.now() / 110) * 3;
      targetCtx.fillStyle = '#dc2626';
      rrTo(targetCtx, -1, -17, 16, 5, 2);
      // Silver Forehead Plate
      targetCtx.fillStyle = '#e2e8f0';
      rrTo(targetCtx, 4, -16, 6, 3, 1);
      // Trailing Headband Cloth Tails
      targetCtx.strokeStyle = '#dc2626';
      targetCtx.lineWidth = 3;
      targetCtx.beginPath();
      targetCtx.moveTo(-1, -15);
      targetCtx.quadraticCurveTo(-12, -18 + nWave, -22, -10 + nWave);
      targetCtx.moveTo(-1, -13);
      targetCtx.quadraticCurveTo(-10, -10 + nWave, -18, -4 + nWave);
      targetCtx.stroke();
    } else if(hatId === 'witch') {
      // Pointed Witch Magic Hat
      targetCtx.fillStyle = '#3b0764';
      targetCtx.beginPath();
      targetCtx.ellipse(7, -15, 17, 4, -0.05, 0, Math.PI * 2);
      targetCtx.fill();
      // Tall Cone
      targetCtx.fillStyle = '#581c87';
      targetCtx.beginPath();
      targetCtx.moveTo(0, -15);
      targetCtx.lineTo(9, -36);
      targetCtx.lineTo(14, -15);
      targetCtx.closePath();
      targetCtx.fill();
      // Gold Buckle Band
      targetCtx.fillStyle = '#f59e0b';
      targetCtx.fillRect(1, -18, 12, 3);
      targetCtx.strokeStyle = '#fef08a';
      targetCtx.lineWidth = 1.2;
      targetCtx.strokeRect(5, -19, 4, 5);
    } else if(hatId === 'bunny') {
      // Fluffy Bunny Ears
      const bFlap = Math.sin(performance.now() / 130) * 2;
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.ellipse(2, -26 + bFlap, 4, 11, -0.15, 0, Math.PI * 2);
      targetCtx.ellipse(12, -26 - bFlap, 4, 11, 0.15, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#e2e8f0';
      targetCtx.lineWidth = 1;
      targetCtx.stroke();
      // Pink Inner Ear
      targetCtx.fillStyle = '#fbcfe8';
      targetCtx.beginPath();
      targetCtx.ellipse(2, -26 + bFlap, 2, 8, -0.15, 0, Math.PI * 2);
      targetCtx.ellipse(12, -26 - bFlap, 2, 8, 0.15, 0, Math.PI * 2);
      targetCtx.fill();
      // Pink Headband
      targetCtx.fillStyle = '#f472b6';
      rrTo(targetCtx, 0, -16, 14, 3, 1.5);
    }
    targetCtx.restore();
  }

  // Universal Custom Bird Renderer
  function renderCustomBird(targetCtx, opt) {
    const skin = skins[opt.skinId] || skins.classic;
    const hatId = opt.hatId || 'none';
    const outfitId = opt.outfitId || 'none';

    targetCtx.save();
    if(opt.opacity !== undefined) targetCtx.globalAlpha = opt.opacity;
    targetCtx.translate(opt.x, opt.y);
    targetCtx.rotate(opt.angle || 0);

    // 1. Cape or Fairy Wings or Seraph Angel Wings flowing behind body
    if(outfitId === 'cape' || outfitId === 'fairy' || outfitId === 'angel_wings') {
      drawCapeBackTo(targetCtx, opt.wing || 0, outfitId);
    }

    // 2. Tail feathers
    targetCtx.fillStyle = '#de7c24';
    targetCtx.beginPath();
    targetCtx.ellipse(-18, 3, 11, 8, 0, 0, 7);
    targetCtx.fill();

    // 3. Bird Body
    targetCtx.fillStyle = skin.body;
    targetCtx.beginPath();
    targetCtx.ellipse(0, 0, 19, 15, 0, 0, 7);
    targetCtx.fill();

    // 4. Clothes / Shirts / Vests / Dresses covering body
    drawOutfitBodyTo(targetCtx, outfitId);

    // 5. Belly light (only when not wearing full body outfits)
    if(outfitId === 'none' || outfitId === 'cape') {
      targetCtx.fillStyle = '#fff1af';
      targetCtx.beginPath();
      targetCtx.ellipse(-5, 5, 7, 4, .2, 0, 7);
      targetCtx.fill();
    }

    // 6. Front Outfit Accessories (Ties, Bowties, Medallions, Badges, Necklaces, Ribbons)
    drawOutfitFrontTo(targetCtx, outfitId);

    // 7. Wing with animated flap
    targetCtx.fillStyle = skin.wing;
    targetCtx.save();
    targetCtx.translate(-4, 4);
    targetCtx.rotate((opt.wing || 0) > 0 ? -0.45 : 0.05);
    targetCtx.beginPath();
    targetCtx.ellipse(0, 0, 10, 7, -0.2, 0, 7);
    targetCtx.fill();
    targetCtx.fillStyle = 'rgba(255,255,255,0.3)';
    targetCtx.beginPath();
    targetCtx.ellipse(-1, -1, 7, 4, -0.2, 0, 7);
    targetCtx.fill();
    targetCtx.restore();

    // 8. Beak (ALWAYS drawn above clothes so it is NEVER covered!)
    targetCtx.fillStyle = skin.beak;
    targetCtx.beginPath();
    targetCtx.moveTo(14, -2);
    targetCtx.lineTo(28, 3);
    targetCtx.lineTo(14, 8);
    targetCtx.closePath();
    targetCtx.fill();
    targetCtx.strokeStyle = 'rgba(0,0,0,0.18)';
    targetCtx.lineWidth = 1.2;
    targetCtx.beginPath();
    targetCtx.moveTo(14, 3);
    targetCtx.lineTo(26, 3);
    targetCtx.stroke();

    // 9. Eye (ALWAYS drawn above clothes so eye & pupil are crystal-clear!)
    targetCtx.fillStyle = '#fff';
    targetCtx.beginPath();
    targetCtx.arc(6, -7, 6, 0, 7);
    targetCtx.fill();
    targetCtx.fillStyle = '#193550';
    targetCtx.beginPath();
    targetCtx.arc(8, -7, 2.4, 0, 7);
    targetCtx.fill();
    targetCtx.fillStyle = '#fff';
    targetCtx.beginPath();
    targetCtx.arc(9, -8, 1, 0, 7);
    targetCtx.fill();

    // 10. Hat (On top of head)
    drawHatTo(targetCtx, hatId);

    targetCtx.restore();
  }

  // Draw Game Bird with Power-Up Overlays
  function drawBird() {
    const skinId = progress.selected || 'classic';
    const hatId = progress.selectedHat || 'none';
    const outfitId = progress.selectedOutfit || 'none';

    let opacity = 1;
    if(graceTimer > 0 && Math.sin(performance.now() / 25) > 0) {
      opacity = 0.4;
    }

      renderCustomBird(ctx, {
        x: bird.x, y: bird.y, angle: bird.angle, wing: bird.wing,
        skinId, hatId, outfitId, opacity
      });

      ctx.save();
      ctx.translate(bird.x, bird.y);
      ctx.rotate(bird.angle);

      // 1. Shield Forcefield Bubble with Hexagonal Lattice & Orbital Nodes
      if(activePowerups.shield) {
        ctx.save();
        const pulse = Math.sin(performance.now() / 110) * 1.8;
        const sR = 25 + pulse;
        
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.4;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(2, 0, sR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.fill();

        // Rotating Hexagon Lattice
        ctx.save();
        ctx.rotate(performance.now() / 350);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for(let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          const hx = Math.cos(a) * (sR * 0.85);
          const hy = Math.sin(a) * (sR * 0.85);
          if(i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        // Orbiting Energy Nodes
        for(let i = 0; i < 3; i++) {
          const oa = performance.now() / 180 + (i * Math.PI * 2) / 3;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(2 + Math.cos(oa) * sR, Math.sin(oa) * sR, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 2. Magnet Pulsing Magnetic Flux Waves
      if(activePowerups.magnet > 0) {
        ctx.save();
        const mPhase = (performance.now() / 180) % 1;
        for(let i = 0; i < 3; i++) {
          const mr = 20 + ((mPhase + i / 3) % 1) * 35;
          const mAlpha = 1 - ((mPhase + i / 3) % 1);
          ctx.strokeStyle = i % 2 === 0 ? `rgba(244, 63, 94, ${mAlpha * 0.75})` : `rgba(56, 189, 248, ${mAlpha * 0.75})`;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(2, 0, mr, -Math.PI * 0.7, Math.PI * 0.7);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 3. Slow Time Frost Crystals & Swirling Snowflake Aura
      if(activePowerups.slow > 0) {
        ctx.save();
        for(let i = 0; i < 4; i++) {
          const sAngle = performance.now() / 250 + (i * Math.PI * 2) / 4;
          const sx = 2 + Math.cos(sAngle) * 28;
          const sy = Math.sin(sAngle) * 28;
          ctx.shadowColor = '#67e8f9';
          ctx.shadowBlur = 6;
          drawCanvasIceCrystal(ctx, sx, sy, 4.5);
        }
        ctx.restore();
      }

      // 4. Invincible Star Sparkle & Rainbow Halo
      if(activePowerups.star > 0) {
        ctx.save();
        const hue = (performance.now() * 0.6) % 360;
        ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
        ctx.lineWidth = 3.2;
        ctx.shadowColor = `hsl(${hue}, 100%, 65%)`;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(2, 0, 26, 0, Math.PI * 2);
        ctx.stroke();

        for(let i = 0; i < 4; i++) {
          const starAngle = performance.now() / 200 + (i * Math.PI * 2) / 4;
          const sx = 2 + Math.cos(starAngle) * 32;
          const sy = Math.sin(starAngle) * 32;
          ctx.fillStyle = '#fef08a';
          drawCanvasSparkle(ctx, sx, sy, 4.5);
        }
        ctx.restore();
      }

      // 5. NOS Rocket Mounted Thrusters & Roaring Jet Flames
      if(activePowerups.rocket > 0) {
        ctx.save();
        const flameStretch = 18 + Math.sin(performance.now() / 45) * 8;
        
        // Twin Rocket Barrels (Top & Bottom Flanks)
        [-11, 9].forEach(ry => {
          // Metal Cylinder Barrel
          ctx.fillStyle = '#94a3b8';
          rrTo(ctx, -22, ry - 3.5, 18, 7, 2);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(-20, ry - 2.5, 14, 2);
          // Chrome Nozzle Ring
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-24, ry - 4, 3, 8);

          // Roaring 4-Layer Jet Flame firing backward
          // Layer 1: Crimson Outer Flame
          ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
          ctx.beginPath();
          ctx.moveTo(-24, ry - 4);
          ctx.lineTo(-24 - flameStretch, ry);
          ctx.lineTo(-24, ry + 4);
          ctx.closePath();
          ctx.fill();

          // Layer 2: Blazing Orange
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.moveTo(-24, ry - 2.8);
          ctx.lineTo(-24 - flameStretch * 0.75, ry);
          ctx.lineTo(-24, ry + 2.8);
          ctx.closePath();
          ctx.fill();

          // Layer 3: Brilliant Yellow Core
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.moveTo(-24, ry - 1.8);
          ctx.lineTo(-24 - flameStretch * 0.5, ry);
          ctx.lineTo(-24, ry + 1.8);
          ctx.closePath();
          ctx.fill();

          // Layer 4: White-Hot Ignition Tip
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-24, ry, 1.8, 0, Math.PI * 2);
          ctx.fill();
        });

        // Supersonic Mach Shock Cone at Beak
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(18, -14);
        ctx.lineTo(30, 3);
        ctx.lineTo(18, 20);
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore();
    }

  function showOver() {
    el.over.classList.add('visible');
    el.finalScore.textContent = score;
    el.finalBest.textContent = best;
    const nb = score >= best && score > 0;
    el.newBest.classList.toggle('hidden', !nb);
    el.medal.className = 'medal ' + (score >= 100 ? 'diamond' : score >= 50 ? 'gold' : score >= 25 ? 'silver' : score >= 10 ? 'bronze' : '');
    showModal(el.over);
  }
  function pause() {
    if(state === State.PLAYING || state === State.READY) {
      state = State.PAUSED;
      audio.stopMusic();
      stopBackgroundMusic();
      showModal(el.paused);
    }
  }
  function resume() {
    closeModal();
    state = started ? State.PLAYING : State.READY;
    if(started) {
      audio.music();
      playBackgroundMusic();
    }
  }
  function home() {
    audio.stopMusic();
    stopBackgroundMusic();
    closeModal();
    reset();
    setState(State.MENU);
  }

  // Mode Selection & Play Handlers
  el.modeClassicBtn.onclick = () => setMode('classic');
  el.modeRankedBtn.onclick = () => setMode('ranked');
  $('playBtn').onclick = () => {
    if(currentMode === 'ranked' && !gpProfile.isLoggedIn) {
      audio.click();
      showModal(el.googlePlayModal);
      return;
    }
    goReady();
  };
  if($('rankedLeaderboardBtn')) {
    $('rankedLeaderboardBtn').onclick = () => {
      if(currentMode !== 'ranked') return;
      audio.click();
      renderLeaderboardList();
      startChampionSpotlight(leaderboardData[0]);
      showModal(el.rankedModal);
    };
  }
  $('googlePlayBtn').onclick = () => {
    if(currentMode !== 'ranked') return;
    audio.click();
    syncGPProfileUI();
    showModal(el.googlePlayModal);
  };
  $('playRankedFromModalBtn').onclick = () => {
    audio.click();
    closeModal();
    setMode('ranked');
    if(!gpProfile.isLoggedIn) {
      showModal(el.googlePlayModal);
      return;
    }
    goReady();
  };

  // Google Play Modal Actions
  el.gpChangeAvatarBtn.onclick = () => {
    audio.click();
    const curIdx = availableAvatars.indexOf(gpProfile.avatar);
    const nextIdx = (curIdx + 1) % availableAvatars.length;
    gpProfile.avatar = availableAvatars[nextIdx];
    saveGPProfile();
  };
  el.gpSwitchAccountBtn.onclick = () => {
    audio.click();
    const tag = randomTags[Math.floor(Math.random() * randomTags.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    gpProfile.gamerTag = `${tag}#${num}`;
    gpProfile.id = 'GP-' + Math.floor(1000000 + Math.random() * 9000000);
    saveGPProfile();
  };
  el.gpAuthActionBtn.onclick = () => {
    audio.click();
    const val = el.gpGamerTagInput.value.trim();
    if(val) gpProfile.gamerTag = val;
    gpProfile.isLoggedIn = true;
    saveGPProfile();
    audio.win();
    closeModal();
  };

  $('howBtn').onclick = () => { audio.click(); showModal(el.how); };
  $('settingsBtn').onclick = () => { audio.click(); showModal(el.settings); };
  $('shopBtn').onclick = () => { audio.click(); syncPreviewLoadout(); updateCoins(); renderShop(); showModal(el.shop); startShopShowcase(); };
  document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => { audio.click(); closeModal(); });
  if(el.layer) {
    el.layer.addEventListener('pointerdown', e => {
      if(e.target === el.layer) {
        if(!el.shop.classList.contains('hidden') || !el.how.classList.contains('hidden') || !el.settings.classList.contains('hidden') || !el.googlePlayModal.classList.contains('hidden') || !el.rankedModal.classList.contains('hidden')) {
          audio.click();
          closeModal();
        }
      }
    });
  }
  $('resumeBtn').onclick = resume;
  $('restartBtn').onclick = goReady;
  $('homeBtn').onclick = home;
  $('replayBtn').onclick = goReady;
  $('overHomeBtn').onclick = home;
  el.pause.onclick = pause;
  el.sound.onclick = () => {
    settings.sound = !settings.sound;
    el.soundToggle.checked = settings.sound;
    syncSettings();
    audio.click();
  };
  el.musicBtn.onclick = () => {
    settings.music = !settings.music;
    el.musicToggle.checked = settings.music;
    syncSettings();
    audio.click();
    if(settings.music && state === State.PLAYING) playBackgroundMusic();
    else stopBackgroundMusic();
    persist();
  };

  // Shop Tabs Swipe / Scroll & Selection
  if(el.shopTabs) {
    el.shopTabs.querySelectorAll('[data-shop-category]').forEach(tab => {
      tab.onclick = () => {
        shopCategory = tab.dataset.shopCategory;
        if(shopCategory !== 'music') audio.stopPreview();
        tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        updateShowcaseLabel();
        renderShop();
      };
    });

    if(el.tabPrev) el.tabPrev.onclick = () => { el.shopTabs.scrollBy({ left: -95, behavior: 'smooth' }); audio.click(); };
    if(el.tabNext) el.tabNext.onclick = () => { el.shopTabs.scrollBy({ left: 95, behavior: 'smooth' }); audio.click(); };

    // Pointer Drag Scrolling for shopTabs
    let isDown = false, startX = 0, sLeft = 0;
    el.shopTabs.addEventListener('pointerdown', e => {
      isDown = true;
      startX = e.pageX - el.shopTabs.offsetLeft;
      sLeft = el.shopTabs.scrollLeft;
    });
    el.shopTabs.addEventListener('pointerleave', () => isDown = false);
    el.shopTabs.addEventListener('pointerup', () => isDown = false);
    el.shopTabs.addEventListener('pointermove', e => {
      if(!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.shopTabs.offsetLeft;
      el.shopTabs.scrollLeft = sLeft - (x - startX) * 1.35;
    });
  }

  function syncSettings() {
    el.soundToggle.checked = settings.sound;
    el.musicToggle.checked = settings.music;
    if(currentMode === 'ranked') {
      el.difficultyValue.textContent = 'EXTREME (LOCKED)';
      el.difficultyBtn.classList.add('locked-ranked');
    } else {
      el.difficultyValue.textContent = settings.difficulty.toUpperCase();
      el.difficultyBtn.classList.remove('locked-ranked');
    }
    el.difficultyMenu.querySelectorAll('[data-difficulty]').forEach(button => {
      button.classList.toggle('active', button.dataset.difficulty === settings.difficulty);
    });
    el.sound.innerHTML = settings.sound ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 3V7l-4 3H4Z"/><path d="M15 9.25a4 4 0 0 1 0 5.5M17.5 6.75a7.5 7.5 0 0 1 0 10.5"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 3V7l-4 3H4Z"/><path d="m15 10 5 5m0-5-5 5"/></svg>';
    el.sound.setAttribute('aria-label', settings.sound ? 'Matikan suara' : 'Nyalakan suara');
    updateMusicUI();
    persist();
    if(!settings.music) audio.stopMusic();
    else if(state === State.PLAYING) audio.music();
  }

  function closeDifficulty() {
    el.difficultyMenu.classList.add('hidden');
    el.difficultyBtn.setAttribute('aria-expanded', 'false');
  }

  el.soundToggle.onchange = e => { settings.sound = e.target.checked; syncSettings(); };
  el.musicToggle.onchange = e => { settings.music = e.target.checked; syncSettings(); };
  el.difficultyBtn.onclick = () => {
    if(currentMode === 'ranked') {
      audio.hit();
      return;
    }
    const open = el.difficultyMenu.classList.toggle('hidden');
    el.difficultyBtn.setAttribute('aria-expanded', String(!open));
  };
  el.difficultyMenu.querySelectorAll('[data-difficulty]').forEach(button => {
    button.onclick = () => {
      settings.difficulty = button.dataset.difficulty;
      audio.click();
      syncSettings();
      closeDifficulty();
    };
  });
  document.addEventListener('pointerdown', e => {
    if(!e.target.closest('.difficulty-picker')) closeDifficulty();
  });

  if(el.dashBtn) {
    el.dashBtn.onclick = e => {
      e.stopPropagation();
      e.preventDefault();
      triggerDash();
    };
    el.dashBtn.addEventListener('pointerdown', e => {
      e.stopPropagation();
      e.preventDefault();
      triggerDash();
    });
  }

  window.addEventListener('keydown', e => {
    if(['Space', 'ArrowUp'].includes(e.code)) { e.preventDefault(); flap(); }
    if(['ShiftLeft', 'ShiftRight', 'KeyD', 'KeyF', 'KeyX'].includes(e.code)) { e.preventDefault(); triggerDash(); }
    if((e.code === 'KeyP' || e.code === 'Escape') && (state === State.PLAYING || state === State.READY)) pause();
    else if((e.code === 'KeyP' || e.code === 'Escape') && state === State.PAUSED) resume();
  });
  canvas.addEventListener('pointerdown', e => {
    if(e.target.closest('#dashBtn')) return;
    e.preventDefault();
    flap();
  });
  el.ready.addEventListener('pointerdown', e => {
    if(e.target.closest('#dashBtn')) return;
    e.preventDefault();
    flap();
  });
  document.addEventListener('visibilitychange', () => {
    if(document.hidden && (state === State.PLAYING || state === State.READY)) pause();
  });

  function loop(t) {
    const dt = Math.min(.033, (t - last) / 1000 || 0);
    last = t;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  setMode('classic', true);
  syncSettings();
  syncGPProfileUI();
  syncLeaderboardFromFirebase();
  updateCoins();
  renderShop();
  reset();
  setState(State.MENU);
  updateScore();
  updateMusicUI();
  requestAnimationFrame(loop);
})();
