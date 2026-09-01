/**
 * =========================================================
 * FEATHER RUSH: COSMETIC & SHOP ITEMS CATALOG DATA
 * =========================================================
 */

(function(window) {
  'use strict';

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
    shadow:{ name:'SHADOW PHANTOM', desc:'Bayangan ungu kosmik mistis (Dark SFX)', cost:0, body:'#312e81', wing:'#4c1d95', beak:'#c084fc', trail:'#9d4edd' },
    // Anime Special Bird Skins
    goku_ssj:{ name:'SUPER SAIYAN BIRD', desc:'Burung Saiyan berambut emas & aura listrik (Ki Blast SFX)', cost:0, body:'#facc15', wing:'#eab308', beak:'#ea580c', trail:'#fef08a' },
    tanjiro_bird:{ name:'DEMON SLAYER BIRD', desc:'Burung pemburu iblis berhaori kotak hijau (Sword SFX)', cost:0, body:'#15803d', wing:'#1e293b', beak:'#dc2626', trail:'#22c55e' },
    naruto_bird:{ name:'SAGE SHINOBI BIRD', desc:'Burung ninja oranye jubah Sage Mode (Chakra SFX)', cost:0, body:'#ea580c', wing:'#1e293b', beak:'#facc15', trail:'#fdba74' },
    luffy_bird:{ name:'STRAW HAT PIRATE', desc:'Burung kapten bajak laut topi jerami (Gear Bounce SFX)', cost:0, body:'#ef4444', wing:'#1d4ed8', beak:'#fbbf24', trail:'#fca5a5' },
    gojo_bird:{ name:'HONORED ONE (GOJO)', desc:'Burung penyihir rambut perak & mata Six Eyes (Void SFX)', cost:0, body:'#f8fafc', wing:'#1e1b4b', beak:'#38bdf8', trail:'#60a5fa' }
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
    matrix:{ name:'DIGITAL MATRIX', desc:'Jejak kode biner pixel hijau neon', cost:0, body:'#22c55e', wing:'#4ade80' },
    // Anime Special Auras
    super_saiyan:{ name:'SUPER SAIYAN KI AURA', desc:'Aura api emas berkobar & percikan kilat Ki petir biru', cost:0, body:'#facc15', wing:'#38bdf8' },
    domain_expansion:{ name:'DOMAIN INFINITY VOID', desc:'Energi kutukan ungu kosmik & orb nebula tanpa batas', cost:0, body:'#8b5cf6', wing:'#38bdf8' },
    nine_tails_chakra:{ name:'KURAMA CHAKRA FIRE', desc:'Kobaran lidah api chakra merah rubah ekor sembilan', cost:0, body:'#ea580c', wing:'#dc2626' },
    gear_fifth:{ name:'SUN GOD NIKA (GEAR 5)', desc:'Awan uap putih dewa matahari & drum kebebasan', cost:0, body:'#ffffff', wing:'#fef08a' },
    black_getsuga:{ name:'BANKAI GETSUGA TENSHOU', desc:'Energi spiritual hitam pekat bertepi merah membara', cost:0, body:'#0f172a', wing:'#ef4444' }
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
    bunny:{ name:'FLUFFY BUNNY EARS', desc:'Telinga kelinci putih panjang lucu', cost:0 },
    // Anime Special Hats
    straw_hat:{ name:'MUGIWARA STRAW HAT', desc:'Topi jerami kapten bajak laut berpita merah', cost:0 },
    shinobi_plate:{ name:'HIDDEN LEAF HEADBAND', desc:'Ikat kepala ninja Konoha berplat logam besi', cost:0 },
    tanjiro_earrings:{ name:'HANAFUDA SUN EARRINGS', desc:'Anting hanafuda matahari & tanda lahir pembasmi iblis', cost:0 },
    gojo_blindfold:{ name:'GOJO BLINDFOLD & HAIR', desc:'Penutup mata hitam & rambut perak tegak Gojo', cost:0 },
    saiyan_hair:{ name:'SUPER SAIYAN SPIKY HAIR', desc:'Rambut runcing emas berkilau Super Saiyan', cost:0 },
    hokage_hat:{ name:'HOKAGE LEADER HAT', desc:'Topi segitiga merah-putih lambang pemimpin desa', cost:0 },
    chopper_hat:{ name:'CHOPPER DOCTOR CAP', desc:'Topi dokter pink bertanduk rusa dan silang putih', cost:0 }
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
    royal_robe:{ name:'KING VELVET ROBE', desc:'Mantel beludru raja berbulu ermine', cost:0 },
    // Anime Special Outfits
    akatsuki_cloak:{ name:'AKATSUKI CLOAK', desc:'Jubah hitam berawan merah organisasi Akatsuki', cost:0 },
    tanjiro_haori:{ name:'CHECKERED GREEN HAORI', desc:'Jubah haori kotak-kotak hijau hitam Tanjiro', cost:0 },
    scout_cape:{ name:'SCOUT REGIMENT CLOAK', desc:'Jubah hijau Pasukan Pengintai lambang Sayap Kebebasan', cost:0 },
    goku_gi:{ name:'TURTLE SCHOOL GI', desc:'Seragam bela diri oranye-biru lambang Kame', cost:0 },
    luffy_vest:{ name:'RED PIRATE VEST', desc:'Rompi merah terbuka & selempang kuning bajak laut', cost:0 },
    jujutsu_coat:{ name:'JUJUTSU SORCERER COAT', desc:'Seragam biru gelap kerah tinggi SMA Jujutsu', cost:0 }
  };

  // 5. Pipa / Pipes (Nama Lengkap) - ALL FREE FOR TESTING
  const pipeSkins = {
    green:{ name:'GREEN CLASSIC', desc:'Pipa hijau klasik Mario', cost:0, body:'#287a55', wing:'#3dbb68', edge:'#216c4d', cap:'#53d878' },
    candy:{ name:'CANDY STRAWBERRY', desc:'Pipa permen manis stroberi', cost:0, body:'#b85c87', wing:'#ff91b8', edge:'#81405d', cap:'#ffb4cf' },
    neon:{ name:'NEON CYBERPUNK', desc:'Pipa biru neon cyberpunk', cost:0, body:'#3863a8', wing:'#5be6e0', edge:'#1c3677', cap:'#83fff5' },
    cyber:{ name:'GOLDEN CYBER', desc:'Pipa emas berenergi tinggi', cost:0, body:'#854d0e', wing:'#eab308', edge:'#713f12', cap:'#fde047' },
    crystal:{ name:'FROZEN ICE CRYSTAL', desc:'Pipa kristal es transparan biru', cost:0, body:'#0284c7', wing:'#38bdf8', edge:'#0369a1', cap:'#7dd3fc' },
    lava:{ name:'MAGMA VOLCANO', desc:'Pipa batu lahar panas retak membara', cost:0, body:'#450a0a', wing:'#dc2626', edge:'#1c1917', cap:'#f97316' },
    wood:{ name:'ANCIENT BAMBOO', desc:'Pipa bambu hijau alami bercabang', cost:0, body:'#4d7c0f', wing:'#65a30d', edge:'#365314', cap:'#84cc16' },
    // Anime Special Pipes
    katana_torii:{ name:'RED TORII & KATANA', desc:'Pipa gerbang Shinto merah berkilau pedang katana', cost:0, body:'#991b1b', wing:'#ef4444', edge:'#450a0a', cap:'#facc15' },
    bamboo_demon:{ name:'DEMON SLAYER BAMBOO', desc:'Pipa bambu hijau bertali merah Nezuko', cost:0, body:'#15803d', wing:'#4ade80', edge:'#14532d', cap:'#f472b6' },
    chakra_scroll:{ name:'NINJUTSU GIANT SCROLL', desc:'Pipa gulungan jurus ninjutsu kayu & kertas mantra', cost:0, body:'#78350f', wing:'#d97706', edge:'#451a03', cap:'#fde047' }
  };

  // 6. Backgrounds (Nama Lengkap) - ALL FREE FOR TESTING
  const backgrounds = {
    sky:{ name:'CLEAR BLUE SKY', desc:'Langit siang biru cerah', cost:0, top:'#72caed', bottom:'#d3f3f4', hill:'#75bb9b' },
    sunset:{ name:'WARM SUNSET', desc:'Senja jingga hangat romantis', cost:0, top:'#f89b75', bottom:'#ffe5a6', hill:'#c47772' },
    space:{ name:'DEEP COSMIC SPACE', desc:'Luar angkasa kosmik gelap', cost:0, top:'#182858', bottom:'#4c4a8c', hill:'#393c77' },
    forest:{ name:'MISTY GREEN FOREST', desc:'Hutan rimbun hijau asri', cost:0, top:'#2d6a4f', bottom:'#b7e4c7', hill:'#1b4332' },
    ocean:{ name:'DEEP OCEAN CORAL', desc:'Kedalaman laut biru & terumbu karang', cost:0, top:'#0369a1', bottom:'#0891b2', hill:'#0e7490' },
    volcano:{ name:'VOLCANIC LAVA', desc:'Kawah gunung berapi malam bara panas', cost:0, top:'#2e1065', bottom:'#7f1d1d', hill:'#450a0a' },
    synthwave:{ name:'80S SYNTHWAVE GRID', desc:'Grid neon ungu & matahari senja retro', cost:0, top:'#3b0764', bottom:'#ec4899', hill:'#831843' },
    // Anime Special Backgrounds
    hidden_leaf:{ name:'HIDDEN LEAF VILLAGE', desc:'Desa Konoha dengan patung monumen Hokage senja', cost:0, top:'#f97316', bottom:'#fed7aa', hill:'#15803d' },
    wano_sakura:{ name:'WANO SAKURA FUJI', desc:'Negeri Wano berlatar Gunung Fuji & kelopak sakura', cost:0, top:'#ec4899', bottom:'#fbcfe8', hill:'#be185d' },
    namek_green:{ name:'PLANET NAMEK SKY', desc:'Langit hijau Namek dengan matahari kembar bersinar', cost:0, top:'#059669', bottom:'#a7f3d0', hill:'#047857' }
  };

  // 7. Musik (Nama Lengkap) - ALL FREE FOR TESTING
  const tracks = {
    happy:{ name:'HAPPY MELODY', desc:'Melodi ceria riang swing', cost:0, color:'#ffbf38' },
    bounce:{ name:'BOUNCE SYNTHWAVE', desc:'Irama disko synthwave dance', cost:0, color:'#f287b5' },
    arcade:{ name:'ARCADE CHIPTUNE', desc:'Chiptune 8-bit game retro', cost:0, color:'#7c8dff' },
    chill:{ name:'CHILL LO-FI JAZZ', desc:'Lo-Fi santai sunset jazz keys', cost:0, color:'#52b788' },
    epic:{ name:'HEROIC ADVENTURE', desc:'Orkestra petualangan megah & heroik', cost:0, color:'#ef4444' },
    cyberbeat:{ name:'CYBERPUNK BEAT', desc:'Electro synthwave tempo cepat energetik', cost:0, color:'#06b6d4' },
    // Anime Special Soundtracks
    gurenge:{ name:'ANIME: GURENGE (DEMON SLAYER)', desc:'Theme song pemburu iblis melodi J-Rock energetik', cost:0, color:'#ef4444' },
    blue_bird:{ name:'ANIME: BLUE BIRD (NARUTO)', desc:'Lagu ikonik melodi seruling & gitar bersemangat', cost:0, color:'#38bdf8' },
    we_are:{ name:'ANIME: WE ARE! (ONE PIECE)', desc:'Melodi petualangan bajak laut riang & megah', cost:0, color:'#facc15' },
    sparkle:{ name:'ANIME: SPARKLE (YOUR NAME)', desc:'Melodi piano emosional & lonceng bintang jatuh', cost:0, color:'#a855f7' }
  };

  // 8. Starter Booster Perk (Skill Langsung Aktif Saat Mulai) - ALL FREE FOR TESTING
  const boosters = {
    none:{ name:'TANPA BOOSTER', desc:'Mulai game kasual tanpa booster instan', cost:0, color:'#94a3b8' },
    extra_life:{ name:'STARTER EXTRA LIFE (+1 LIFE)', desc:'Mulai game dengan tambahan 1 nyawa ekstra', cost:0, color:'#ef4444' },
    shield:{ name:'STARTER SHIELD', desc:'Mulai game langsung terlindungi perisai', cost:0, color:'#0284c7' },
    magnet:{ name:'STARTER MAGNET', desc:'Mulai game langsung menyedot semua koin', cost:0, color:'#dc2626' },
    slow:{ name:'STARTER SLOW ICE', desc:'Mulai game dengan waktu melambat 50%', cost:0, color:'#0891b2' },
    star:{ name:'STARTER STAR POWER', desc:'Mulai game dengan bintang kebal pelangi', cost:0, color:'#f59e0b' },
    rocket:{ name:'STARTER NOS ROCKET', desc:'Mulai game meluncur roket NOS turbo', cost:0, color:'#ea580c' },
    double_shield:{ name:'STARTER DUAL SHIELD', desc:'Mulai game dengan 2x lapisan perisai pelindung', cost:0, color:'#0284c7' }
  };

  // 9. Sistem Pet Pendamping & Skill Unik (Unique Pet Companions & Skills) - ALL FREE FOR TESTING
  const petsCatalog = {
    pip_peep: {
      name: 'PIP & PEEP (CANARY DUO)',
      desc: 'Duo pelindung imut. Meluncur menghancurkan musuh yang mendekat (1-hit kill) & respawn 11s',
      cost: 0,
      color: '#fef08a',
      skillType: 'bodyguard',
      skillName: 'DUO BODYGUARD INTERCEPT',
      skillDesc: 'Meluncur menghancurkan musuh yang mendekat (1-hit kill) dan respawn setelah 11s',
      respawnTime: 11.0,
      baby1: { name: 'Pip', color: '#fef08a', wingColor: '#fde047', blushColor: '#fda4af', accessory: 'ribbon' },
      baby2: { name: 'Peep', color: '#bae6fd', wingColor: '#7dd3fc', blushColor: '#fda4af', accessory: 'flower' }
    },
    momo_hana: {
      name: 'MOMO & HANA (SAKURA FAIRIES)',
      desc: 'Peri kembar sakura. Memberikan Perisai Bunga Sakura Pelindung berbentuk bunga teratai pink',
      cost: 0,
      color: '#f472b6',
      skillType: 'barrier',
      skillName: 'SAKURA LOTUS SHIELD',
      skillDesc: 'Perisai bunga teratai merah muda pelindung yang aktif sejak mulai & regenerasi tiap 10 detik',
      barrierCooldown: 10.0,
      baby1: { name: 'Momo', color: '#fbcfe8', wingColor: '#f472b6', blushColor: '#fda4af', accessory: 'ribbon' },
      baby2: { name: 'Hana', color: '#fecdd3', wingColor: '#fb7185', blushColor: '#fda4af', accessory: 'flower' }
    },
    aero_lumos: {
      name: 'AERO & LUMOS (HOLY ARCHANGELS)',
      desc: 'Duo bidadari suci. Memberi berkah cahaya +1 Skor Ekstra & +2 Koin Bonus setiap melewati 3 pipa',
      cost: 0,
      color: '#eab308',
      skillType: 'blessing',
      skillName: 'DIVINE SCORE & GOLD BLESSING',
      skillDesc: 'Memberikan +1 Skor Ekstra & +2 Koin Bonus setiap berhasil melewati 3 rintangan pipa',
      interval: 3,
      baby1: { name: 'Aero', color: '#fef08a', wingColor: '#eab308', blushColor: '#fde047', accessory: 'halo' },
      baby2: { name: 'Lumos', color: '#ffffff', wingColor: '#fef08a', blushColor: '#fde047', accessory: 'halo' }
    },
    pixel_glitch: {
      name: 'PIXEL & GLITCH (CYBER DRONES)',
      desc: 'Duo drone mecha. Menembakkan laser listrik EMP otomatis tiap 3.0s untuk melumpuhkan musuh jarak jauh',
      cost: 0,
      color: '#06b6d4',
      skillType: 'laser',
      skillName: 'AUTO EMP LASER ZAP',
      skillDesc: 'Menembakkan laser listrik EMP otomatis tiap 3.0 detik untuk melumpuhkan musuh dari jarak jauh',
      laserCooldown: 3.0,
      baby1: { name: 'Pixel', color: '#38bdf8', wingColor: '#0284c7', blushColor: '#67e8f9', accessory: 'antenna' },
      baby2: { name: 'Glitch', color: '#34d399', wingColor: '#059669', blushColor: '#6ee7b7', accessory: 'antenna' }
    },
    blaze_ember: {
      name: 'BLAZE & EMBER (PHOENIX SPARKS)',
      desc: 'Duo percikan api phoenix abadi. Semburan api naga membakar musuh & melebarkan pipa +16px',
      cost: 0,
      color: '#f97316',
      skillType: 'fire',
      skillName: 'PHOENIX DRAGON FLAMES & GAP EXPANDER',
      skillDesc: 'Semburan api raksasa membakar musuh di depan & melebarkan celah pipa sebesar +16px',
      baby1: { name: 'Blaze', color: '#fb923c', wingColor: '#ea580c', blushColor: '#fdba74', accessory: 'flame' },
      baby2: { name: 'Ember', color: '#f87171', wingColor: '#dc2626', blushColor: '#fca5a5', accessory: 'flame' }
    },
    kuro_void: {
      name: 'KURO & VOID (SHADOW SPIRITS)',
      desc: 'Duo roh bayangan mistis. Mempercepat cooldown Dash 45% (jadi 2.5s) & ledakan bayangan hitam',
      cost: 0,
      color: '#a855f7',
      skillType: 'dash_master',
      skillName: 'SHADOW VOID DASH VORTEX',
      skillDesc: 'Mengurangi cooldown skill Dash sebesar 45% (dari 4.5s jadi 2.5s) & shockwave void hitam',
      dashCd: 2.5,
      baby1: { name: 'Kuro', color: '#c084fc', wingColor: '#7e22ce', blushColor: '#d8b4fe', accessory: 'horns' },
      baby2: { name: 'Void', color: '#64748b', wingColor: '#334155', blushColor: '#94a3b8', accessory: 'horns' }
    },
    none: {
      name: 'TANPA PET',
      desc: 'Bermain kasual murni tanpa bantuan pet pelindung',
      cost: 0,
      color: '#94a3b8',
      skillType: 'none',
      skillName: 'NO PET',
      skillDesc: 'Tanpa pet pendamping'
    }
  };

  // Export to Global Game Namespace
  window.GameCatalogs = {
    skins, auras, hats, outfits, pipeSkins, backgrounds, tracks, boosters, petsCatalog
  };

  // Direct Globals for Maximum Compatibility
  window.skins = skins;
  window.auras = auras;
  window.hats = hats;
  window.outfits = outfits;
  window.pipeSkins = pipeSkins;
  window.backgrounds = backgrounds;
  window.tracks = tracks;
  window.boosters = boosters;
  window.petsCatalog = petsCatalog;

})(window);

