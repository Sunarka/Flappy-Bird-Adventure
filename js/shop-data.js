/**
 * =========================================================
 * FEATHER RUSH: COSMETIC & SHOP ITEMS CATALOG DATA
 * =========================================================
 */

(function(window) {
  'use strict';

  // 1. Skin Burung (HD Shading & Rarity Tiers)
  const skins = {
    classic:{ name:'CLASSIC BIRD', desc:'Burung kuning ceria (Chiptune SFX)', cost:0, currency:'coin', rarity:'common', body:'#ffd74c', wing:'#f4a62b', beak:'#f79831', trail:'#fff5b2', glow:'rgba(255, 215, 76, 0.4)' },
    rose:{ name:'ROSE PINK', desc:'Merah muda manis berbulu sutra (Harp Chime SFX)', cost:150, currency:'coin', rarity:'rare', body:'#ff8dab', wing:'#e85d87', beak:'#ffb15b', trail:'#ffc1d3', glow:'rgba(255, 141, 171, 0.45)' },
    mint:{ name:'MINT GREEN', desc:'Hijau tosca segar berembun (Bouncy SFX)', cost:200, currency:'coin', rarity:'rare', body:'#75e6c8', wing:'#35bd9d', beak:'#ffa94d', trail:'#b7fff0', glow:'rgba(117, 230, 200, 0.45)' },
    night:{ name:'NIGHT SKY', desc:'Biru malam mistis berkilau bintang (Dark Bell SFX)', cost:300, currency:'coin', rarity:'rare', body:'#8496ff', wing:'#576dcb', beak:'#e6b4ff', trail:'#d4c7ff', glow:'rgba(132, 150, 255, 0.45)' },
    cyber:{ name:'CYBER NEON', desc:'Ungu neon glitch holo-matrix (Laser Crash SFX)', cost:500, currency:'coin', rarity:'epic', body:'#b5179e', wing:'#7209b7', beak:'#4cc9f0', trail:'#f72585', glow:'rgba(181, 23, 158, 0.55)' },
    phoenix:{ name:'PHOENIX FIRE', desc:'Api abadi membara berkobar-kobar (Flame Fanfare SFX)', cost:800, currency:'coin', rarity:'legendary', body:'#ff5400', wing:'#ff0054', beak:'#ffd60a', trail:'#ffbd00', glow:'rgba(255, 84, 0, 0.6)' },
    mecha:{ name:'MECHA CYBORG', desc:'Robot titanium & laser plasma core (Laser SFX)', cost:650, currency:'coin', rarity:'epic', body:'#cbd5e1', wing:'#64748b', beak:'#38bdf8', trail:'#38bdf8', glow:'rgba(56, 189, 248, 0.5)' },
    dragon:{ name:'FLAME DRAGON', desc:'Naga merah purba berapi tanduk emas (Fire SFX)', cost:950, currency:'coin', rarity:'legendary', body:'#dc2626', wing:'#991b1b', beak:'#fbbf24', trail:'#ff5400', glow:'rgba(220, 38, 38, 0.6)' },
    angel:{ name:'HOLY ANGEL', desc:'Burung suci seraph sayap emas (Chime SFX)', cost:1200, currency:'coin', rarity:'legendary', body:'#f8fafc', wing:'#fbbf24', beak:'#f59e0b', trail:'#fef08a', glow:'rgba(254, 240, 138, 0.65)' },
    shadow:{ name:'SHADOW PHANTOM', desc:'Bayangan ungu nebula kosmik mistis (Dark SFX)', cost:1000, currency:'coin', rarity:'legendary', body:'#312e81', wing:'#4c1d95', beak:'#c084fc', trail:'#9d4edd', glow:'rgba(157, 78, 221, 0.6)' },
    // Anime Mythic Series - Beli Pakai Diamond
    goku_ssj:{ name:'SUPER SAIYAN BIRD', desc:'Burung Saiyan rambut emas & aura petir Ki (Ki Blast SFX)', cost:50, currency:'diamond', rarity:'mythic', body:'#facc15', wing:'#eab308', beak:'#ea580c', trail:'#fef08a', glow:'rgba(250, 204, 21, 0.75)' },
    tanjiro_bird:{ name:'DEMON SLAYER BIRD', desc:'Burung pemburu iblis berhaori kotak hijau (Sword SFX)', cost:45, currency:'diamond', rarity:'mythic', body:'#15803d', wing:'#1e293b', beak:'#dc2626', trail:'#22c55e', glow:'rgba(34, 197, 94, 0.7)' },
    naruto_bird:{ name:'SAGE SHINOBI BIRD', desc:'Burung ninja oranye jubah Sage Mode (Chakra SFX)', cost:45, currency:'diamond', rarity:'mythic', body:'#ea580c', wing:'#1e293b', beak:'#facc15', trail:'#fdba74', glow:'rgba(234, 88, 12, 0.7)' },
    luffy_bird:{ name:'STRAW HAT PIRATE', desc:'Burung kapten bajak laut topi jerami (Gear Bounce SFX)', cost:45, currency:'diamond', rarity:'mythic', body:'#ef4444', wing:'#1d4ed8', beak:'#fbbf24', trail:'#fca5a5', glow:'rgba(239, 68, 68, 0.7)' },
    gojo_bird:{ name:'HONORED ONE (GOJO)', desc:'Burung penyihir rambut perak & mata Six Eyes (Void SFX)', cost:50, currency:'diamond', rarity:'mythic', body:'#f8fafc', wing:'#1e1b4b', beak:'#38bdf8', trail:'#60a5fa', glow:'rgba(56, 189, 248, 0.8)' }
  };

  // 2. Tail Aura / Jejak Ekor (Particle & Glow VFX)
  const auras = {
    default:{ name:'FEATHER TRAIL', desc:'Jejak bulu lembut melayang gemulai', cost:0, currency:'coin', rarity:'common', body:'#ffd74c', wing:'#fff5b2', glow:'rgba(255, 215, 76, 0.4)' },
    fire:{ name:'FIRE BLAZE', desc:'Lidah api berkobar & percikan bara magma', cost:200, currency:'coin', rarity:'rare', body:'#ff5400', wing:'#ffd000', glow:'rgba(255, 84, 0, 0.6)' },
    rainbow:{ name:'RAINBOW GLOW', desc:'Pita pelangi kristal & partikel spektrum bersinar', cost:250, currency:'coin', rarity:'rare', body:'#ff70a6', wing:'#70d6ff', glow:'rgba(255, 112, 166, 0.5)' },
    galaxy:{ name:'COSMIC GALAXY', desc:'Galaksi spiral ungu, cincin planet & debu komet', cost:400, currency:'coin', rarity:'epic', body:'#9d4edd', wing:'#48cae4', glow:'rgba(157, 78, 221, 0.6)' },
    neon:{ name:'ELECTRIC LIGHTNING', desc:'Sambaran petir plasma zig-zag bertegangan tinggi', cost:350, currency:'coin', rarity:'epic', body:'#00f5d4', wing:'#fee440', glow:'rgba(0, 245, 212, 0.6)' },
    bubble:{ name:'BUBBLE TRAIL', desc:'Gelembung sabun transparan pecah berpelangi', cost:180, currency:'coin', rarity:'rare', body:'#90e0ef', wing:'#00b4d8', glow:'rgba(144, 224, 239, 0.5)' },
    hearts:{ name:'SWEET HEARTS', desc:'Denyut cinta merah muda & serbuk kilauan manis', cost:220, currency:'coin', rarity:'rare', body:'#ff4d6d', wing:'#ff85a1', glow:'rgba(255, 77, 109, 0.55)' },
    golden:{ name:'GOLDEN DUST', desc:'Koin emas berputar & kilau permata raja', cost:600, currency:'coin', rarity:'legendary', body:'#ffd700', wing:'#ffb703', glow:'rgba(255, 215, 0, 0.65)' },
    frost:{ name:'BLIZZARD FROST', desc:'Kristal es salju berkilauan berhamburan', cost:350, currency:'coin', rarity:'epic', body:'#67e8f9', wing:'#06b6d4', glow:'rgba(103, 232, 249, 0.6)' },
    plasma:{ name:'PLASMA SPARK', desc:'Percikan plasma listrik berenergi fusi', cost:450, currency:'coin', rarity:'epic', body:'#a855f7', wing:'#38bdf8', glow:'rgba(168, 85, 247, 0.6)' },
    sakura:{ name:'SAKURA PETALS', desc:'Kelopak bunga sakura pink berguguran lembut', cost:300, currency:'coin', rarity:'epic', body:'#f472b6', wing:'#fda4af', glow:'rgba(244, 114, 182, 0.6)' },
    matrix:{ name:'DIGITAL MATRIX', desc:'Jejak kode biner pixel hijau neon holografik', cost:550, currency:'coin', rarity:'legendary', body:'#22c55e', wing:'#4ade80', glow:'rgba(34, 197, 94, 0.65)' },
    // Anime Special Auras - Diamond
    super_saiyan:{ name:'SUPER SAIYAN KI AURA', desc:'Aura api emas berkobar & percikan kilat Ki petir biru', cost:35, currency:'diamond', rarity:'mythic', body:'#facc15', wing:'#38bdf8', glow:'rgba(250, 204, 21, 0.8)' },
    domain_expansion:{ name:'DOMAIN INFINITY VOID', desc:'Energi kutukan ungu kosmik & orb nebula tanpa batas', cost:35, currency:'diamond', rarity:'mythic', body:'#8b5cf6', wing:'#38bdf8', glow:'rgba(139, 92, 246, 0.8)' },
    nine_tails_chakra:{ name:'KURAMA CHAKRA FIRE', desc:'Kobaran lidah api chakra merah rubah ekor sembilan', cost:30, currency:'diamond', rarity:'mythic', body:'#ea580c', wing:'#dc2626', glow:'rgba(234, 88, 12, 0.8)' },
    gear_fifth:{ name:'SUN GOD NIKA (GEAR 5)', desc:'Awan uap putih dewa matahari & drum kebebasan', cost:35, currency:'diamond', rarity:'mythic', body:'#ffffff', wing:'#fef08a', glow:'rgba(255, 255, 255, 0.85)' },
    black_getsuga:{ name:'BANKAI GETSUGA TENSHOU', desc:'Energi spiritual hitam pekat bertepi merah membara', cost:30, currency:'diamond', rarity:'mythic', body:'#0f172a', wing:'#ef4444', glow:'rgba(239, 68, 68, 0.8)' }
  };

  // 3. Topi / Hats (Stylized Headwear)
  const hats = {
    none:{ name:'TANPA TOPI', desc:'Tampilan natural tanpa topi', cost:0, currency:'coin', rarity:'common' },
    cap:{ name:'BASEBALL SNAPBACK', desc:'Topi baseball sporty biru bordir modern', cost:100, currency:'coin', rarity:'common' },
    party:{ name:'PARTY CONE HAT', desc:'Topi kerucut pesta kembang gula bergaris', cost:120, currency:'coin', rarity:'common' },
    beanie:{ name:'WINTER BEANIE', desc:'Kupluk wol hangat rajut musim salju', cost:120, currency:'coin', rarity:'common' },
    tophat:{ name:'TOP HAT MAGIC', desc:'Topi pesulap satin hitam pita merah sutra', cost:220, currency:'coin', rarity:'rare' },
    cowboy:{ name:'COWBOY LEATHER', desc:'Topi koboi kulit bergesper perak barat', cost:250, currency:'coin', rarity:'rare' },
    chef:{ name:'CHEF MASTER HAT', desc:'Topi koki putih bertingkat bintang Michelin', cost:200, currency:'coin', rarity:'rare' },
    flowercrown:{ name:'FLOWER BLOSSOM CROWN', desc:'Mahkota bunga sakura & mawar mekar anggun', cost:240, currency:'coin', rarity:'rare' },
    pinkribbon:{ name:'CUTE PINK RIBBON', desc:'Pita rambut merah muda berenda manis sutra', cost:180, currency:'coin', rarity:'rare' },
    sunhat:{ name:'SUMMER BEACH SUNHAT', desc:'Topi jerami pantai anggun pita satin sutra', cost:200, currency:'coin', rarity:'rare' },
    catears:{ name:'KITTY CAT EARS', desc:'Bando telinga kucing lucu lonceng emas berdering', cost:280, currency:'coin', rarity:'rare' },
    bunny:{ name:'FLUFFY BUNNY EARS', desc:'Telinga kelinci putih panjang berbulu lembut', cost:260, currency:'coin', rarity:'rare' },
    ninja:{ name:'NINJA HEADBAND', desc:'Ikat kepala shinobi merah berkibar ditiup angin', cost:250, currency:'coin', rarity:'rare' },
    pirate:{ name:'PIRATE CAPTAIN', desc:'Topi kapten bajak laut bulu merak & tengkorak', cost:400, currency:'coin', rarity:'epic' },
    viking:{ name:'VIKING HELMET', desc:'Helm besi perang bertanduk banteng perkasa', cost:450, currency:'coin', rarity:'epic' },
    witch:{ name:'WITCH MAGIC HAT', desc:'Topi penyihir beludru ungu gesper emas bercahaya', cost:420, currency:'coin', rarity:'epic' },
    crown:{ name:'ROYAL CROWN', desc:'Mahkota emas bertahta rubi & zamrud kerajaan', cost:800, currency:'coin', rarity:'legendary' },
    tiara:{ name:'SPARKLING TIARA', desc:'Tiara putri perak bertabur kristal berlian pink', cost:750, currency:'coin', rarity:'legendary' },
    astronaut:{ name:'SPACE HELMET', desc:'Helm astronot kaca visor emas pelindung kosmik', cost:850, currency:'coin', rarity:'legendary' },
    // Anime Special Hats - Diamond
    straw_hat:{ name:'MUGIWARA STRAW HAT', desc:'Topi jerami kapten bajak laut berpita merah ikonik', cost:25, currency:'diamond', rarity:'mythic' },
    shinobi_plate:{ name:'HIDDEN LEAF HEADBAND', desc:'Ikat kepala ninja Konoha berplat logam besi pelindung', cost:25, currency:'diamond', rarity:'mythic' },
    tanjiro_earrings:{ name:'HANAFUDA SUN EARRINGS', desc:'Anting hanafuda matahari & tanda lahir pembasmi iblis', cost:25, currency:'diamond', rarity:'mythic' },
    gojo_blindfold:{ name:'GOJO BLINDFOLD & HAIR', desc:'Penutup mata hitam & rambut perak tegak Gojo Satoru', cost:30, currency:'diamond', rarity:'mythic' },
    saiyan_hair:{ name:'SUPER SAIYAN SPIKY HAIR', desc:'Rambut runcing emas berkilau Super Saiyan Son Goku', cost:30, currency:'diamond', rarity:'mythic' },
    hokage_hat:{ name:'HOKAGE LEADER HAT', desc:'Topi segitiga merah-putih lambang pemimpin desa Konoha', cost:30, currency:'diamond', rarity:'mythic' },
    chopper_hat:{ name:'CHOPPER DOCTOR CAP', desc:'Topi dokter pink bertanduk rusa dan silang medis', cost:25, currency:'diamond', rarity:'mythic' }
  };

  // 4. Outfit / Dasi & Aksesori (HD Apparel & Costumes)
  const outfits = {
    none:{ name:'TANPA AKSESORI', desc:'Tampilan kasual polos', cost:0, currency:'coin', rarity:'common' },
    redtie:{ name:'RED TIE & SHIRT', desc:'Kemeja putih & dasi merah sutra eksekutif', cost:100, currency:'coin', rarity:'common' },
    bluetie:{ name:'BLUE TIE & SHIRT', desc:'Kemeja biru langit & dasi polkadot elegan', cost:100, currency:'coin', rarity:'common' },
    bowtie:{ name:'TUXEDO & BOW TIE', desc:'Rompi tuksedo hitam & dasi kupu-kupu bangsawan', cost:180, currency:'coin', rarity:'rare' },
    scarf:{ name:'COZY SCARF SWEATER', desc:'Sweater tebal & syal rajut merah hangat', cost:160, currency:'coin', rarity:'rare' },
    badge:{ name:'SHERIFF STAR BADGE', desc:'Rompi kulit cokelat & lencana bintang emas sheriff', cost:200, currency:'coin', rarity:'rare' },
    sailor:{ name:'SAILOR SCHOOLGIRL', desc:'Seragam pelaut manis dengan dasi pita merah ceria', cost:250, currency:'coin', rarity:'rare' },
    hoodie:{ name:'URBAN STREET HOODIE', desc:'Hoodie streetwear abu-abu modern berkerah hangat', cost:280, currency:'coin', rarity:'rare' },
    cape:{ name:'HERO FLYING CAPE', desc:'Jubah superhero merah berkibar aerodinamis', cost:300, currency:'coin', rarity:'rare' },
    goldchain:{ name:'GOLD CHAIN & JACKET', desc:'Jaket streetwear & kalung rantai emas hip-hop', cost:450, currency:'coin', rarity:'epic' },
    kimono:{ name:'SAKURA KIMONO SASH', desc:'Kimono sutra sakura & sabuk obi emas festival', cost:400, currency:'coin', rarity:'epic' },
    ballerina:{ name:'BALLERINA SWAN TUTU', desc:'Rok tutu balet berombak & kalung mutiara danau angsa', cost:420, currency:'coin', rarity:'epic' },
    ninja_suit:{ name:'SHINOBI NINJA SCARF', desc:'Syal panjang ninja hitam berkibar di kegelapan', cost:460, currency:'coin', rarity:'epic' },
    princessdress:{ name:'ROYAL PRINCESS GOWN', desc:'Gaun pesta merah muda renda berkilau mutiara', cost:700, currency:'coin', rarity:'legendary' },
    fairy:{ name:'MAGICAL FAIRY WINGS', desc:'Gaun peri hijau mint & sayap bercahaya berkilau', cost:750, currency:'coin', rarity:'legendary' },
    cyber_armor:{ name:'MECHA CHEST ARMOR', desc:'Zirah dada cyborg berinti reaktor plasma menyala', cost:800, currency:'coin', rarity:'legendary' },
    angel_wings:{ name:'GLOWING SERAPH WINGS', desc:'Sayap malaikat bersinar terang berbulu suci', cost:850, currency:'coin', rarity:'legendary' },
    royal_robe:{ name:'KING VELVET ROBE', desc:'Mantel beludru merah raja berbulu ermine putih', cost:900, currency:'coin', rarity:'legendary' },
    // Anime Special Outfits - Diamond
    akatsuki_cloak:{ name:'AKATSUKI CLOAK', desc:'Jubah hitam berawan merah organisasi Akatsuki', cost:30, currency:'diamond', rarity:'mythic' },
    tanjiro_haori:{ name:'CHECKERED GREEN HAORI', desc:'Jubah haori kotak-kotak hijau hitam Tanjiro Kamado', cost:30, currency:'diamond', rarity:'mythic' },
    scout_cape:{ name:'SCOUT REGIMENT CLOAK', desc:'Jubah hijau Pasukan Pengintai lambang Sayap Kebebasan', cost:30, currency:'diamond', rarity:'mythic' },
    goku_gi:{ name:'TURTLE SCHOOL GI', desc:'Seragam bela diri oranye-biru lambang Kame Sennin', cost:30, currency:'diamond', rarity:'mythic' },
    luffy_vest:{ name:'RED PIRATE VEST', desc:'Rompi merah terbuka & selempang kuning bajak laut', cost:25, currency:'diamond', rarity:'mythic' },
    jujutsu_coat:{ name:'JUJUTSU SORCERER COAT', desc:'Seragam biru gelap kerah tinggi SMA Jujutsu Tokyo', cost:30, currency:'diamond', rarity:'mythic' }
  };

  // 5. Pipa / Pipes (Stylized Textures & Glow Rings)
  const pipeSkins = {
    green:{ name:'GREEN CLASSIC', desc:'Pipa hijau klasik Mario dengan cincin kilau', cost:0, currency:'coin', rarity:'common', body:'#287a55', wing:'#3dbb68', edge:'#216c4d', cap:'#53d878' },
    candy:{ name:'CANDY STRAWBERRY', desc:'Pipa permen manis stroberi bergaris gula', cost:200, currency:'coin', rarity:'rare', body:'#b85c87', wing:'#ff91b8', edge:'#81405d', cap:'#ffb4cf' },
    wood:{ name:'ANCIENT BAMBOO', desc:'Pipa bambu hijau alami bercabang daun asri', cost:250, currency:'coin', rarity:'rare', body:'#4d7c0f', wing:'#65a30d', edge:'#365314', cap:'#84cc16' },
    jungle_vines:{ name:'ANCIENT JUNGLE VINES', desc:'Pipa batu lumut purba terlilit akar rimba belantara tropis', cost:280, currency:'coin', rarity:'rare', body:'#14532d', wing:'#15803d', edge:'#052e16', cap:'#84cc16' },
    neon:{ name:'NEON CYBERPUNK', desc:'Pipa biru neon cyberpunk berlistrik plasma', cost:450, currency:'coin', rarity:'epic', body:'#3863a8', wing:'#5be6e0', edge:'#1c3677', cap:'#83fff5' },
    crystal:{ name:'FROZEN ICE CRYSTAL', desc:'Pipa kristal es transparan biru kutub utara', cost:480, currency:'coin', rarity:'epic', body:'#0284c7', wing:'#38bdf8', edge:'#0369a1', cap:'#7dd3fc' },
    cyber:{ name:'GOLDEN CYBER', desc:'Pipa emas berenergi tinggi bertahta permata', cost:700, currency:'coin', rarity:'legendary', body:'#854d0e', wing:'#eab308', edge:'#713f12', cap:'#fde047' },
    lava:{ name:'MAGMA VOLCANO', desc:'Pipa batu lahar panas retak membara magma cair', cost:750, currency:'coin', rarity:'legendary', body:'#450a0a', wing:'#dc2626', edge:'#1c1917', cap:'#f97316' },
    // Anime Special Pipes - Diamond
    katana_torii:{ name:'RED TORII & KATANA', desc:'Pipa gerbang Shinto merah berkilau pedang katana', cost:25, currency:'diamond', rarity:'mythic', body:'#991b1b', wing:'#ef4444', edge:'#450a0a', cap:'#facc15' },
    bamboo_demon:{ name:'DEMON SLAYER BAMBOO', desc:'Pipa bambu hijau bertali merah Nezuko Kamado', cost:25, currency:'diamond', rarity:'mythic', body:'#15803d', wing:'#4ade80', edge:'#14532d', cap:'#f472b6' },
    chakra_scroll:{ name:'NINJUTSU GIANT SCROLL', desc:'Pipa gulungan jurus ninjutsu kayu & kertas mantra', cost:25, currency:'diamond', rarity:'mythic', body:'#78350f', wing:'#d97706', edge:'#451a03', cap:'#fde047' }
  };

  // 6. Backgrounds (Volumetric Parallax Atmospheres)
  const backgrounds = {
    sky:{ name:'CLEAR BLUE SKY', desc:'Langit siang biru cerah berawan putih empuk', cost:0, currency:'coin', rarity:'common', top:'#72caed', bottom:'#d3f3f4', hill:'#75bb9b', groundBase:'#b57a45', groundTop:'#46b65c', groundStripe:'#e6ad5a' },
    sunset:{ name:'WARM SUNSET', desc:'Senja jingga hangat romantis bergradasi emas', cost:200, currency:'coin', rarity:'rare', top:'#f89b75', bottom:'#ffe5a6', hill:'#c47772', groundBase:'#9a3412', groundTop:'#f97316', groundStripe:'#fdba74' },
    forest:{ name:'MISTY GREEN FOREST', desc:'Hutan rimbun hijau asri berembun sejuk', cost:250, currency:'coin', rarity:'rare', top:'#2d6a4f', bottom:'#b7e4c7', hill:'#1b4332', groundBase:'#3f2e18', groundTop:'#22c55e', groundStripe:'#86efac' },
    jungle:{ name:'TROPICAL JUNGLE SAFARI', desc:'Rimba belantara tropis kanopi rimbun & sulur purba liar', cost:350, currency:'coin', rarity:'epic', top:'#064e3b', bottom:'#a7f3d0', hill:'#065f46', groundBase:'#271c0c', groundTop:'#10b981', groundStripe:'#6ee7b7' },
    ocean:{ name:'DEEP OCEAN CORAL', desc:'Kedalaman laut biru & terumbu karang tropis', cost:400, currency:'coin', rarity:'epic', top:'#0369a1', bottom:'#0891b2', hill:'#0e7490', groundBase:'#0c4a6e', groundTop:'#06b6d4', groundStripe:'#67e8f9' },
    space:{ name:'DEEP COSMIC SPACE', desc:'Luar angkasa kosmik gelap bertabur bintang & nebula', cost:450, currency:'coin', rarity:'epic', top:'#182858', bottom:'#4c4a8c', hill:'#393c77', groundBase:'#1e1b4b', groundTop:'#6366f1', groundStripe:'#a5b4fc' },
    volcano:{ name:'VOLCANIC LAVA', desc:'Kawah gunung berapi malam bara panas membara', cost:650, currency:'coin', rarity:'legendary', top:'#2e1065', bottom:'#7f1d1d', hill:'#450a0a', groundBase:'#450a0a', groundTop:'#ef4444', groundStripe:'#fca5a5' },
    synthwave:{ name:'80S SYNTHWAVE GRID', desc:'Grid neon ungu & matahari senja retro laser', cost:700, currency:'coin', rarity:'legendary', top:'#3b0764', bottom:'#ec4899', hill:'#831843', groundBase:'#4c0519', groundTop:'#f43f5e', groundStripe:'#fda4af' },
    // Anime Special Backgrounds - Diamond
    hidden_leaf:{ name:'HIDDEN LEAF VILLAGE', desc:'Desa Konoha dengan patung monumen Hokage senja', cost:30, currency:'diamond', rarity:'mythic', top:'#f97316', bottom:'#fed7aa', hill:'#15803d', groundBase:'#78350f', groundTop:'#22c55e', groundStripe:'#fde047' },
    wano_sakura:{ name:'WANO SAKURA FUJI', desc:'Negeri Wano berlatar Gunung Fuji & kelopak sakura', cost:30, currency:'diamond', rarity:'mythic', top:'#ec4899', bottom:'#fbcfe8', hill:'#be185d', groundBase:'#831843', groundTop:'#f472b6', groundStripe:'#fce7f3' },
    namek_green:{ name:'PLANET NAMEK SKY', desc:'Langit hijau Namek dengan matahari kembar bersinar', cost:30, currency:'diamond', rarity:'mythic', top:'#059669', bottom:'#a7f3d0', hill:'#047857', groundBase:'#064e3b', groundTop:'#10b981', groundStripe:'#6ee7b7' }
  };

  // 7. Musik (Synthesizer Melodies & Anime Themes)
  const tracks = {
    happy:{ name:'HAPPY MELODY', desc:'Melodi ceria riang swing chiptune klasik', cost:0, currency:'coin', rarity:'common', color:'#ffbf38' },
    bounce:{ name:'BOUNCE SYNTHWAVE', desc:'Irama disko synthwave dance bersemangat', cost:200, currency:'coin', rarity:'rare', color:'#f287b5' },
    arcade:{ name:'ARCADE CHIPTUNE', desc:'Chiptune 8-bit game retro nostalgia arcade', cost:200, currency:'coin', rarity:'rare', color:'#7c8dff' },
    chill:{ name:'CHILL LO-FI JAZZ', desc:'Lo-Fi santai sunset jazz piano & rhodes keys', cost:250, currency:'coin', rarity:'rare', color:'#52b788' },
    epic:{ name:'HEROIC ADVENTURE', desc:'Orkestra petualangan megah bertempo cepat', cost:400, currency:'coin', rarity:'epic', color:'#ef4444' },
    cyberbeat:{ name:'CYBERPUNK BEAT', desc:'Electro synthwave tempo cepat cyber futuristik', cost:450, currency:'coin', rarity:'epic', color:'#06b6d4' },
    // Anime Special Soundtracks - Diamond
    gurenge:{ name:'ANIME: GURENGE (DEMON SLAYER)', desc:'Theme song pemburu iblis melodi J-Rock energetik', cost:30, currency:'diamond', rarity:'mythic', color:'#ef4444' },
    blue_bird:{ name:'ANIME: BLUE BIRD (NARUTO)', desc:'Lagu ikonik melodi seruling & gitar bersemangat', cost:30, currency:'diamond', rarity:'mythic', color:'#38bdf8' },
    we_are:{ name:'ANIME: WE ARE! (ONE PIECE)', desc:'Melodi petualangan bajak laut riang & megah', cost:30, currency:'diamond', rarity:'mythic', color:'#facc15' },
    sparkle:{ name:'ANIME: SPARKLE (YOUR NAME)', desc:'Melodi piano emosional & lonceng bintang jatuh', cost:30, currency:'diamond', rarity:'mythic', color:'#a855f7' }
  };

  // 8. Starter Booster Perk
  const boosters = {
    none:{ name:'TANPA BOOSTER', desc:'Mulai game kasual tanpa booster instan', cost:0, currency:'coin', rarity:'common', color:'#94a3b8' },
    extra_life:{ name:'STARTER EXTRA LIFE (+1 LIFE)', desc:'Mulai game dengan tambahan 1 nyawa ekstra', cost:150, currency:'coin', rarity:'rare', color:'#ef4444' },
    shield:{ name:'STARTER SHIELD', desc:'Mulai game langsung terlindungi perisai heksagonal', cost:150, currency:'coin', rarity:'rare', color:'#0284c7' },
    magnet:{ name:'STARTER MAGNET', desc:'Mulai game langsung menyedot semua koin emas', cost:150, currency:'coin', rarity:'rare', color:'#dc2626' },
    slow:{ name:'STARTER SLOW ICE', desc:'Mulai game dengan waktu melambat 50% kristal es', cost:250, currency:'coin', rarity:'epic', color:'#0891b2' },
    star:{ name:'STARTER STAR POWER', desc:'Mulai game dengan bintang kebal pelangi super', cost:350, currency:'coin', rarity:'epic', color:'#f59e0b' },
    rocket:{ name:'STARTER NOS ROCKET', desc:'Mulai game meluncur roket NOS turbo supersonic', cost:500, currency:'coin', rarity:'legendary', color:'#ea580c' },
    double_shield:{ name:'STARTER DUAL SHIELD', desc:'Mulai game dengan 2x lapisan perisai pelindung tebal', cost:600, currency:'coin', rarity:'legendary', color:'#0284c7' }
  };

  // 9. Sistem Pet Pendamping & Skill Unik (GACHA ONLY)
  const petsCatalog = {
    pip_peep: {
      name: 'PIP & PEEP (CANARY DUO)',
      desc: 'Duo pelindung imut. Meluncur menghancurkan musuh yang mendekat (1-hit kill) & respawn 11s',
      cost: 0,
      gachaOnly: true,
      rarity: 'rare',
      color: '#fef08a',
      skillType: 'bodyguard',
      skillName: 'DUO BODYGUARD INTERCEPT',
      skillDesc: 'Meluncur menghancurkan musuh yang mendekat (1-hit kill) dan respawn setelah 11 detik.',
      respawnTime: 11.0,
      baby1: { name: 'Pip', color: '#fef08a', wingColor: '#fde047', blushColor: '#fda4af', accessory: 'ribbon' },
      baby2: { name: 'Peep', color: '#bae6fd', wingColor: '#7dd3fc', blushColor: '#fda4af', accessory: 'flower' }
    },
    momo_hana: {
      name: 'MOMO & HANA (SAKURA FAIRIES)',
      desc: 'Peri kembar sakura. Memberikan Perisai Bunga Sakura Pelindung berbentuk bunga teratai pink',
      cost: 0,
      gachaOnly: true,
      rarity: 'epic',
      color: '#f472b6',
      skillType: 'barrier',
      skillName: 'SAKURA LOTUS SHIELD',
      skillDesc: 'Perisai bunga teratai merah muda pelindung yang aktif sejak mulai & regenerasi tiap 10 detik.',
      barrierCooldown: 10.0,
      baby1: { name: 'Momo', color: '#fbcfe8', wingColor: '#f472b6', blushColor: '#fda4af', accessory: 'ribbon' },
      baby2: { name: 'Hana', color: '#fecdd3', wingColor: '#fb7185', blushColor: '#fda4af', accessory: 'flower' }
    },
    aero_lumos: {
      name: 'AERO & LUMOS (HOLY ARCHANGELS)',
      desc: 'Duo bidadari suci. Memberi berkah cahaya +1 Skor Ekstra & +2 Koin Bonus setiap melewati 3 pipa',
      cost: 0,
      gachaOnly: true,
      rarity: 'legendary',
      color: '#eab308',
      skillType: 'blessing',
      skillName: 'DIVINE SCORE & GOLD BLESSING',
      skillDesc: 'Memberikan +1 Skor Ekstra & +2 Koin Bonus setiap berhasil melewati 3 rintangan pipa.',
      interval: 3,
      baby1: { name: 'Aero', color: '#fef08a', wingColor: '#eab308', blushColor: '#fde047', accessory: 'halo' },
      baby2: { name: 'Lumos', color: '#ffffff', wingColor: '#fef08a', blushColor: '#fde047', accessory: 'halo' }
    },
    pixel_glitch: {
      name: 'PIXEL & GLITCH (CYBER DRONES)',
      desc: 'Duo drone mecha. Menembakkan laser listrik EMP otomatis tiap 3.0s untuk melumpuhkan musuh jarak jauh',
      cost: 0,
      gachaOnly: true,
      rarity: 'epic',
      color: '#06b6d4',
      skillType: 'laser',
      skillName: 'AUTO EMP LASER ZAP',
      skillDesc: 'Menembakkan laser listrik EMP otomatis tiap 3.0 detik untuk melumpuhkan musuh dari jarak jauh.',
      laserCooldown: 3.0,
      baby1: { name: 'Pixel', color: '#38bdf8', wingColor: '#0284c7', blushColor: '#67e8f9', accessory: 'antenna' },
      baby2: { name: 'Glitch', color: '#34d399', wingColor: '#059669', blushColor: '#6ee7b7', accessory: 'antenna' }
    },
    blaze_ember: {
      name: 'BLAZE & EMBER (PHOENIX SPARKS)',
      desc: 'Duo percikan api phoenix. Semburan api tiap 2.5s bakar musuh (max 2/burst, range 130px) & pipa +16px',
      cost: 0,
      gachaOnly: true,
      rarity: 'legendary',
      color: '#f97316',
      skillType: 'fire',
      skillName: 'PHOENIX FLAMES & GAP EXPANDER',
      skillDesc: 'Semburan api tiap 2.5 detik membakar hingga 2 musuh (range 130px) & melebarkan pipa +16px.',
      baby1: { name: 'Blaze', color: '#fb923c', wingColor: '#ea580c', blushColor: '#fdba74', accessory: 'flame' },
      baby2: { name: 'Ember', color: '#f87171', wingColor: '#dc2626', blushColor: '#fca5a5', accessory: 'flame' }
    },
    kuro_void: {
      name: 'KURO & VOID (SHADOW SPIRITS)',
      desc: 'Duo roh bayangan. Dash cooldown 2.5s + VOID SHRED: hancurkan musuh terdekat saat Dash!',
      cost: 0,
      gachaOnly: true,
      rarity: 'legendary',
      color: '#a855f7',
      skillType: 'dash_master',
      skillName: 'SHADOW VOID DASH + ENEMY SHRED',
      skillDesc: 'Cooldown Dash 2.5s + bonus Void Shred: hancurkan 1 musuh terdekat (radius 160px) setiap Dash!',
      dashCd: 2.5,
      baby1: { name: 'Kuro', color: '#c084fc', wingColor: '#7e22ce', blushColor: '#d8b4fe', accessory: 'horns' },
      baby2: { name: 'Void', color: '#64748b', wingColor: '#334155', blushColor: '#94a3b8', accessory: 'horns' }
    },
    none: {
      name: 'TANPA PET',
      desc: 'Bermain kasual murni tanpa bantuan pet pelindung',
      cost: 0,
      gachaOnly: false,
      rarity: 'common',
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
