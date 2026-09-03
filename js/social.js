/**
 * =========================================================
 * FEATHER RUSH: SOCIAL, FRIENDLIST, CHAT, PROFILE & MULTIPLAYER INVITES
 * =========================================================
 */

(function(window) {
  'use strict';

  // ==========================================
  // CUTE FEATHER RUSH 3D GLOSSY BIRD EMOJIS (APPLE / TWEMOJI CHIBI HYBRID)
  // ==========================================
  const CUTE_BIRD_EMOTES = [
    {
      id: 'bird_plead',
      title: 'Muka Imut / Pleading',
      render: (s = 42) => `
        <svg viewBox="0 0 50 50" width="${s}" height="${s}" style="display:block">
          <defs>
            <radialGradient id="e_plead_body" cx="35%" cy="30%" r="68%">
              <stop offset="0%" stop-color="#fff9c4"/>
              <stop offset="35%" stop-color="#fbc02d"/>
              <stop offset="80%" stop-color="#f57f17"/>
              <stop offset="100%" stop-color="#e65100"/>
            </radialGradient>
            <radialGradient id="e_plead_eye_l" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stop-color="#475569"/>
              <stop offset="40%" stop-color="#1e293b"/>
              <stop offset="100%" stop-color="#020617"/>
            </radialGradient>
            <linearGradient id="e_plead_glint" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.7"/>
              <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
            </linearGradient>
            <linearGradient id="e_beak_grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ffb74d"/>
              <stop offset="50%" stop-color="#ff9800"/>
              <stop offset="100%" stop-color="#e65100"/>
            </linearGradient>
          </defs>
          <!-- Feather Crest -->
          <path d="M 23 7 Q 25 1 29 4 Q 26 9 24 11 Z" fill="#f57f17"/>
          <path d="M 20 9 Q 21 3 25 6 Q 24 11 22 13 Z" fill="#fbc02d"/>
          <!-- 3D Shaded Bird Body -->
          <circle cx="25" cy="27" r="20" fill="url(#e_plead_body)"/>
          <ellipse cx="25" cy="14" rx="14" ry="6.5" fill="url(#e_plead_glint)"/>
          <!-- Wings -->
          <ellipse cx="7" cy="29" rx="4.5" ry="6.5" transform="rotate(15 7 29)" fill="#f57f17" opacity="0.9"/>
          <ellipse cx="43" cy="29" rx="4.5" ry="6.5" transform="rotate(-15 43 29)" fill="#f57f17" opacity="0.9"/>
          <!-- Rosy Cheeks -->
          <circle cx="13" cy="31" r="4.5" fill="#ff4081" opacity="0.45"/>
          <circle cx="37" cy="31" r="4.5" fill="#ff4081" opacity="0.45"/>
          <!-- Big Glossy Puppy Eyes -->
          <g transform="translate(17, 24)">
            <ellipse cx="0" cy="0" rx="5.5" ry="6.8" fill="url(#e_plead_eye_l)"/>
            <circle cx="-1.8" cy="-2.2" r="2.6" fill="#ffffff"/>
            <circle cx="2" cy="2.5" r="1.3" fill="#ffffff"/>
            <circle cx="-2.2" cy="3.2" r="0.8" fill="#38bdf8" opacity="0.8"/>
          </g>
          <g transform="translate(33, 24)">
            <ellipse cx="0" cy="0" rx="5.5" ry="6.8" fill="url(#e_plead_eye_l)"/>
            <circle cx="-1.8" cy="-2.2" r="2.6" fill="#ffffff"/>
            <circle cx="2" cy="2.5" r="1.3" fill="#ffffff"/>
            <circle cx="-2.2" cy="3.2" r="0.8" fill="#38bdf8" opacity="0.8"/>
          </g>
          <!-- Worry Eyebrows -->
          <path d="M 12 15 Q 17 18 21 16" fill="none" stroke="#8d6e63" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M 38 15 Q 33 18 29 16" fill="none" stroke="#8d6e63" stroke-width="1.8" stroke-linecap="round"/>
          <!-- 3D Protruding Beak -->
          <path d="M 20 29 Q 25 25 30 29 Q 25 36 20 29 Z" fill="url(#e_beak_grad)" stroke="#bf360c" stroke-width="0.8"/>
          <line x1="21" y1="29" x2="29" y2="29" stroke="#bf360c" stroke-width="0.8"/>
        </svg>
      `
    },
    {
      id: 'bird_joy',
      title: 'Ketawa Ngakak / Tears of Joy',
      render: (s = 42) => `
        <svg viewBox="0 0 50 50" width="${s}" height="${s}" style="display:block">
          <defs>
            <radialGradient id="e_joy_body" cx="35%" cy="30%" r="68%">
              <stop offset="0%" stop-color="#fff9c4"/>
              <stop offset="35%" stop-color="#fbc02d"/>
              <stop offset="80%" stop-color="#f57f17"/>
              <stop offset="100%" stop-color="#e65100"/>
            </radialGradient>
            <linearGradient id="e_tear_grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#7dd3fc"/>
              <stop offset="50%" stop-color="#38bdf8"/>
              <stop offset="100%" stop-color="#0284c7"/>
            </linearGradient>
            <linearGradient id="e_mouth_in" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#b71c1c"/>
              <stop offset="100%" stop-color="#5f0909"/>
            </linearGradient>
          </defs>
          <circle cx="25" cy="27" r="20" fill="url(#e_joy_body)"/>
          <!-- Wings Slapping Thighs in Laughter -->
          <ellipse cx="6" cy="32" rx="4.5" ry="6" transform="rotate(35 6 32)" fill="#f57f17"/>
          <ellipse cx="44" cy="32" rx="4.5" ry="6" transform="rotate(-35 44 32)" fill="#f57f17"/>
          <!-- Squinting Laughing Eyes -->
          <path d="M 14 20 L 21 24 L 14 26" fill="none" stroke="#3e2723" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M 36 20 L 29 24 L 36 26" fill="none" stroke="#3e2723" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
          <!-- Flying Tears -->
          <path d="M 10 24 C 6 21, 2 24, 4 29 C 7 31, 11 28, 10 24 Z" fill="url(#e_tear_grad)"/>
          <circle cx="2" cy="18" r="1.8" fill="#38bdf8"/>
          <path d="M 40 24 C 44 21, 48 24, 46 29 C 43 31, 39 28, 40 24 Z" fill="url(#e_tear_grad)"/>
          <circle cx="48" cy="18" r="1.8" fill="#38bdf8"/>
          <!-- Big Open Laughing Beak & Tongue -->
          <path d="M 17 27 Q 25 24 33 27 Q 25 40 17 27 Z" fill="url(#e_mouth_in)" stroke="#bf360c" stroke-width="1"/>
          <path d="M 20 32 Q 25 30 30 32 Q 25 39 20 32 Z" fill="#ff5252"/>
          <path d="M 17 27 Q 25 22 33 27 Q 25 25 17 27 Z" fill="#ffa726" stroke="#e65100" stroke-width="0.8"/>
        </svg>
      `
    },
    {
      id: 'bird_love',
      title: 'Jatuh Cinta / In Love',
      render: (s = 42) => `
        <svg viewBox="0 0 50 50" width="${s}" height="${s}" style="display:block">
          <defs>
            <radialGradient id="e_love_body" cx="35%" cy="30%" r="68%">
              <stop offset="0%" stop-color="#fce4ec"/>
              <stop offset="30%" stop-color="#f48fb1"/>
              <stop offset="75%" stop-color="#ec407a"/>
              <stop offset="100%" stop-color="#c2185b"/>
            </radialGradient>
            <radialGradient id="e_heart_grad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#ff8a80"/>
              <stop offset="40%" stop-color="#ff1744"/>
              <stop offset="100%" stop-color="#b71c1c"/>
            </radialGradient>
          </defs>
          <circle cx="25" cy="27" r="20" fill="url(#e_love_body)"/>
          <!-- Orbiting 3D Hearts -->
          <g transform="translate(8, 12) scale(0.95)">
            <path d="M 0 3 A 3 3 0 0 0 4.5 7 L 7 10 L 9.5 7 A 3 3 0 0 0 14 3 A 3.5 3.5 0 0 0 7 1 A 3.5 3.5 0 0 0 0 3 Z" fill="url(#e_heart_grad)"/>
          </g>
          <g transform="translate(34, 8) scale(1.1)">
            <path d="M 0 3 A 3 3 0 0 0 4.5 7 L 7 10 L 9.5 7 A 3 3 0 0 0 14 3 A 3.5 3.5 0 0 0 7 1 A 3.5 3.5 0 0 0 0 3 Z" fill="url(#e_heart_grad)"/>
          </g>
          <g transform="translate(38, 32) scale(0.8)">
            <path d="M 0 3 A 3 3 0 0 0 4.5 7 L 7 10 L 9.5 7 A 3 3 0 0 0 14 3 A 3.5 3.5 0 0 0 7 1 A 3.5 3.5 0 0 0 0 3 Z" fill="url(#e_heart_grad)"/>
          </g>
          <!-- Blissful Curved Eyes -->
          <path d="M 14 23 Q 19 17 23 23" fill="none" stroke="#4a148c" stroke-width="2.6" stroke-linecap="round"/>
          <path d="M 27 23 Q 31 17 36 23" fill="none" stroke="#4a148c" stroke-width="2.6" stroke-linecap="round"/>
          <!-- Bright Blush -->
          <circle cx="12" cy="29" r="5" fill="#ff1744" opacity="0.5"/>
          <circle cx="38" cy="29" r="5" fill="#ff1744" opacity="0.5"/>
          <!-- Cute Smiling Beak -->
          <polygon points="21,27 29,27 25,32" fill="#ffa726" stroke="#e65100" stroke-width="1"/>
        </svg>
      `
    },
    {
      id: 'bird_cool',
      title: 'Keren / Sunglasses',
      render: (s = 42) => `
        <svg viewBox="0 0 50 50" width="${s}" height="${s}" style="display:block">
          <defs>
            <radialGradient id="e_cool_body" cx="35%" cy="30%" r="68%">
              <stop offset="0%" stop-color="#e0f7fa"/>
              <stop offset="30%" stop-color="#26c6da"/>
              <stop offset="75%" stop-color="#0097a7"/>
              <stop offset="100%" stop-color="#006064"/>
            </radialGradient>
            <linearGradient id="e_cool_lens" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#334155"/>
              <stop offset="40%" stop-color="#0f172a"/>
              <stop offset="100%" stop-color="#020617"/>
            </linearGradient>
          </defs>
          <circle cx="25" cy="27" r="20" fill="url(#e_cool_body)"/>
          <ellipse cx="25" cy="14" rx="14" ry="6" fill="url(#e_plead_glint)"/>
          <!-- Wings -->
          <ellipse cx="6" cy="30" rx="4" ry="6" fill="#00838f"/>
          <ellipse cx="44" cy="30" rx="4" ry="6" fill="#00838f"/>
          <!-- 3D Sleek Sunglasses -->
          <path d="M 9 20 C 9 17, 23 17, 23 21 C 23 27, 10 27, 9 20 Z" fill="url(#e_cool_lens)" stroke="#0f172a" stroke-width="1.4"/>
          <path d="M 27 21 C 27 17, 41 17, 41 20 C 40 27, 27 27, 27 21 Z" fill="url(#e_cool_lens)" stroke="#0f172a" stroke-width="1.4"/>
          <path d="M 22 20 Q 25 18 28 20" stroke="#0f172a" stroke-width="2.5" fill="none"/>
          <!-- White Specular Glare Bars -->
          <polygon points="12,18 15,18 11,26 8,26" fill="#38bdf8" opacity="0.85"/>
          <polygon points="30,18 33,18 29,26 26,26" fill="#38bdf8" opacity="0.85"/>
          <!-- Star Sparkle on Lens Frame -->
          <polygon points="41,18 42,20 44,21 42,22 41,24 40,22 38,21 40,20" fill="#fff59d"/>
          <!-- Smug Smirk Beak -->
          <polygon points="20,29 29,27 24,33" fill="#ffa726" stroke="#e65100" stroke-width="1"/>
        </svg>
      `
    },
    {
      id: 'bird_cry',
      title: 'Nangis Kejer / Loud Cry',
      render: (s = 42) => `
        <svg viewBox="0 0 50 50" width="${s}" height="${s}" style="display:block">
          <defs>
            <radialGradient id="e_cry_body" cx="35%" cy="30%" r="68%">
              <stop offset="0%" stop-color="#f0fdf4"/>
              <stop offset="35%" stop-color="#bae6fd"/>
              <stop offset="80%" stop-color="#38bdf8"/>
              <stop offset="100%" stop-color="#0284c7"/>
            </radialGradient>
            <linearGradient id="e_waterfall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#e0f2fe"/>
              <stop offset="30%" stop-color="#38bdf8"/>
              <stop offset="100%" stop-color="#0284c7"/>
            </linearGradient>
          </defs>
          <circle cx="25" cy="27" r="20" fill="url(#e_cry_body)"/>
          <!-- Closed Weeping Eyes -->
          <path d="M 12 21 Q 17 16 21 21" stroke="#0369a1" stroke-width="3.2" fill="none" stroke-linecap="round"/>
          <path d="M 29 21 Q 33 16 38 21" stroke="#0369a1" stroke-width="3.2" fill="none" stroke-linecap="round"/>
          <!-- Cascading Waterfalls of Tears with Splash -->
          <rect x="13.5" y="22" width="6" height="22" rx="3" fill="url(#e_waterfall)" opacity="0.95"/>
          <ellipse cx="16.5" cy="44" rx="4.5" ry="2" fill="#38bdf8"/>
          <rect x="30.5" y="22" width="6" height="22" rx="3" fill="url(#e_waterfall)" opacity="0.95"/>
          <ellipse cx="33.5" cy="44" rx="4.5" ry="2" fill="#38bdf8"/>
          <!-- Wide Open Wailing Beak -->
          <path d="M 19 28 Q 25 24 31 28 Q 25 39 19 28 Z" fill="#7f1d1d" stroke="#450a0a" stroke-width="1"/>
          <ellipse cx="25" cy="34" rx="3" ry="2" fill="#f43f5e"/>
        </svg>
      `
    },
    {
      id: 'bird_rage',
      title: 'Marah / Rage',
      render: (s = 42) => `
        <svg viewBox="0 0 50 50" width="${s}" height="${s}" style="display:block">
          <defs>
            <radialGradient id="e_rage_body" cx="35%" cy="30%" r="68%">
              <stop offset="0%" stop-color="#ffcdd2"/>
              <stop offset="30%" stop-color="#ef5350"/>
              <stop offset="75%" stop-color="#d32f2f"/>
              <stop offset="100%" stop-color="#b71c1c"/>
            </radialGradient>
          </defs>
          <circle cx="25" cy="27" r="20" fill="url(#e_rage_body)"/>
          <!-- Angry Vein -->
          <g transform="translate(34, 11) scale(0.9)">
            <path d="M 0 3 C 2 0, 6 0, 8 3 C 8 5, 8 7, 6 9 C 8 11, 8 13, 6 15 C 3 15, 1 13, 0 11" fill="none" stroke="#fff59d" stroke-width="2" stroke-linecap="round"/>
          </g>
          <!-- Furrowed Fierce Eyebrows -->
          <line x1="12" y1="18" x2="22" y2="22" stroke="#212121" stroke-width="3.5" stroke-linecap="round"/>
          <line x1="38" y1="18" x2="28" y2="22" stroke="#212121" stroke-width="3.5" stroke-linecap="round"/>
          <!-- Fierce Glaring Eyes -->
          <circle cx="18" cy="24" r="3.5" fill="#ffffff"/>
          <circle cx="18.5" cy="24" r="1.8" fill="#000000"/>
          <circle cx="32" cy="24" r="3.5" fill="#ffffff"/>
          <circle cx="31.5" cy="24" r="1.8" fill="#000000"/>
          <!-- Steaming Nose / Cheek Puffs -->
          <circle cx="11" cy="33" r="3" fill="#ffffff" opacity="0.6"/>
          <circle cx="39" cy="33" r="3" fill="#ffffff" opacity="0.6"/>
          <!-- Clenched Sharp Beak -->
          <polygon points="19,28 31,28 25,35" fill="#ffa726" stroke="#b71c1c" stroke-width="1.2"/>
        </svg>
      `
    },
    {
      id: 'bird_party',
      title: 'Pesta / Party Time',
      render: (s = 42) => `
        <svg viewBox="0 0 50 50" width="${s}" height="${s}" style="display:block">
          <defs>
            <radialGradient id="e_party_body" cx="35%" cy="30%" r="68%">
              <stop offset="0%" stop-color="#fff9c4"/>
              <stop offset="35%" stop-color="#fbc02d"/>
              <stop offset="80%" stop-color="#f57f17"/>
              <stop offset="100%" stop-color="#e65100"/>
            </radialGradient>
            <linearGradient id="e_hat_grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#ec4899"/>
              <stop offset="50%" stop-color="#8b5cf6"/>
              <stop offset="100%" stop-color="#3b82f6"/>
            </linearGradient>
          </defs>
          <!-- Cone Party Hat with Pom-pom -->
          <polygon points="17,16 25,1 33,16" fill="url(#e_hat_grad)" stroke="#4c1d95" stroke-width="1"/>
          <circle cx="25" cy="1" r="2.5" fill="#fef08a" stroke="#eab308" stroke-width="0.8"/>
          <circle cx="21" cy="10" r="1.2" fill="#facc15"/>
          <circle cx="28" cy="12" r="1.2" fill="#38bdf8"/>
          <!-- Body -->
          <circle cx="25" cy="28" r="19" fill="url(#e_party_body)"/>
          <!-- Confetti Burst Stars -->
          <polygon points="6,12 8,15 11,15 8.5,17.5 9.5,20.5 7,19 4.5,20.5 5.5,17.5 3,15 6,15" fill="#ec4899"/>
          <polygon points="43,12 44.5,14.5 47,14.5 45,16.5 45.8,19 43.8,17.8 41.8,19 42.5,16.5 40.5,14.5 43,14.5" fill="#38bdf8"/>
          <!-- Happy Winking Eyes -->
          <ellipse cx="17" cy="24" rx="2.8" ry="3.5" fill="#0f172a"/>
          <circle cx="18" cy="22.5" r="1.2" fill="#ffffff"/>
          <path d="M 29 24 Q 33 20 37 24" stroke="#0f172a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
          <!-- Party Horn Blower in Beak -->
          <polygon points="21,28 29,28 25,33" fill="#ffa726" stroke="#e65100" stroke-width="0.8"/>
          <path d="M 25 31 Q 31 35 37 32 Q 41 30 43 33" fill="none" stroke="#ec4899" stroke-width="3.5" stroke-linecap="round"/>
          <circle cx="43" cy="33" r="1.8" fill="#facc15"/>
        </svg>
      `
    },
    {
      id: 'bird_money',
      title: 'Sultan / Dollar Eyes',
      render: (s = 42) => `
        <svg viewBox="0 0 50 50" width="${s}" height="${s}" style="display:block">
          <defs>
            <radialGradient id="e_money_body" cx="35%" cy="30%" r="68%">
              <stop offset="0%" stop-color="#f0fdf4"/>
              <stop offset="35%" stop-color="#86efac"/>
              <stop offset="80%" stop-color="#22c55e"/>
              <stop offset="100%" stop-color="#15803d"/>
            </radialGradient>
            <linearGradient id="e_gold_coin" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#fef08a"/>
              <stop offset="50%" stop-color="#facc15"/>
              <stop offset="100%" stop-color="#ca8a04"/>
            </linearGradient>
          </defs>
          <circle cx="25" cy="27" r="20" fill="url(#e_money_body)"/>
          <ellipse cx="25" cy="14" rx="14" ry="6" fill="url(#e_plead_glint)"/>
          <!-- Dollar Signs $ in Eyes -->
          <g transform="translate(18, 23)">
            <text x="0" y="3" font-family="Arial, sans-serif" font-size="11" font-weight="900" fill="#14532d" text-anchor="middle">$</text>
          </g>
          <g transform="translate(32, 23)">
            <text x="0" y="3" font-family="Arial, sans-serif" font-size="11" font-weight="900" fill="#14532d" text-anchor="middle">$</text>
          </g>
          <!-- Open Laughing Beak with Green Dollar Tongue -->
          <polygon points="19,28 31,28 25,35" fill="#ffa726" stroke="#e65100" stroke-width="1"/>
          <path d="M 22 30 Q 25 39 28 30 Z" fill="#4ade80" stroke="#16a34a" stroke-width="1"/>
          <line x1="25" y1="30" x2="25" y2="36" stroke="#15803d" stroke-width="0.8"/>
          <!-- Floating Gold Coins -->
          <circle cx="9" cy="14" r="4" fill="url(#e_gold_coin)" stroke="#a16207" stroke-width="0.8"/>
          <circle cx="41" cy="14" r="4" fill="url(#e_gold_coin)" stroke="#a16207" stroke-width="0.8"/>
        </svg>
      `
    },
    {
      id: 'bird_king',
      title: 'Raja / Crown King',
      render: (s = 42) => `
        <svg viewBox="0 0 50 50" width="${s}" height="${s}" style="display:block">
          <defs>
            <radialGradient id="e_king_body" cx="35%" cy="30%" r="68%">
              <stop offset="0%" stop-color="#fffde7"/>
              <stop offset="35%" stop-color="#fff176"/>
              <stop offset="80%" stop-color="#fbc02d"/>
              <stop offset="100%" stop-color="#f57f17"/>
            </radialGradient>
            <linearGradient id="e_gold_crown" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#fff59d"/>
              <stop offset="50%" stop-color="#fbc02d"/>
              <stop offset="100%" stop-color="#d97706"/>
            </linearGradient>
          </defs>
          <!-- 3D Ornate Golden Crown with Rubies -->
          <polygon points="14,14 16,3 25,9 34,3 36,14" fill="url(#e_gold_crown)" stroke="#78350f" stroke-width="1.4"/>
          <circle cx="16" cy="3" r="2" fill="#ef4444"/>
          <circle cx="25" cy="9" r="2.2" fill="#3b82f6"/>
          <circle cx="34" cy="3" r="2" fill="#10b981"/>
          <!-- Body -->
          <circle cx="25" cy="28" r="19" fill="url(#e_king_body)"/>
          <ellipse cx="25" cy="15" rx="14" ry="6" fill="url(#e_plead_glint)"/>
          <!-- Proud Winking Eyes -->
          <ellipse cx="18" cy="24" rx="3.2" ry="4" fill="#0f172a"/>
          <circle cx="19.2" cy="22.2" r="1.3" fill="#ffffff"/>
          <path d="M 28 24 Q 32 19 36 24" stroke="#0f172a" stroke-width="2.8" fill="none" stroke-linecap="round"/>
          <!-- Champion Smile Beak -->
          <polygon points="20,28 30,28 25,34" fill="#ffa726" stroke="#e65100" stroke-width="1"/>
          <!-- Sparkle Stars -->
          <polygon points="8,28 9,30 11,31 9,32 8,34 7,32 5,31 7,30" fill="#fef08a"/>
          <polygon points="42,28 43,30 45,31 43,32 42,34 41,32 39,31 41,30" fill="#fef08a"/>
        </svg>
      `
    },
    {
      id: 'bird_sleep',
      title: 'Mengantuk / Zzz',
      render: (s = 42) => `
        <svg viewBox="0 0 50 50" width="${s}" height="${s}" style="display:block">
          <defs>
            <radialGradient id="e_sleep_body" cx="35%" cy="30%" r="68%">
              <stop offset="0%" stop-color="#f3e8ff"/>
              <stop offset="35%" stop-color="#d8b4fe"/>
              <stop offset="80%" stop-color="#a855f7"/>
              <stop offset="100%" stop-color="#6b21a8"/>
            </radialGradient>
            <radialGradient id="e_bubble_grad" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
              <stop offset="40%" stop-color="#67e8f9" stop-opacity="0.6"/>
              <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.8"/>
            </radialGradient>
          </defs>
          <circle cx="25" cy="27" r="20" fill="url(#e_sleep_body)"/>
          <!-- Floating Zzz text -->
          <text x="34" y="11" font-family="Arial, sans-serif" font-size="8" font-weight="900" fill="#c084fc">z</text>
          <text x="39" y="8" font-family="Arial, sans-serif" font-size="10" font-weight="900" fill="#e9d5ff">Z</text>
          <!-- Peaceful Sleeping Arched Eyes -->
          <path d="M 14 24 Q 18 20 22 24" stroke="#3b0764" stroke-width="2.6" fill="none" stroke-linecap="round"/>
          <path d="M 28 24 Q 32 20 36 24" stroke="#3b0764" stroke-width="2.6" fill="none" stroke-linecap="round"/>
          <!-- Sleeping Beak -->
          <polygon points="21,27 29,27 25,32" fill="#ffa726" stroke="#e65100" stroke-width="1"/>
          <!-- Shiny Snoring Snot Bubble -->
          <circle cx="29" cy="31" r="5.5" fill="url(#e_bubble_grad)" stroke="#22d3ee" stroke-width="0.8"/>
          <circle cx="27.5" cy="29" r="1.5" fill="#ffffff"/>
        </svg>
      `
    }
  ];

  class SocialService {
    constructor() {
      this.db = null;
      this.isInitialized = false;
      this.myKey = null;
      this.myProfile = null;
      this.friends = [];
      this.friendRequests = [];
      this.activeChatFriend = null;
      this.activeChatUnsub = null;
      this.friendReqUnsub = null;
      this.friendsUnsub = null;
      this.invitesUnsub = null;
      this.activeInvites = {};

      this.init();
      this.initBirdEmotesBar();
    }

    initBirdEmotesBar() {
      const bar = document.getElementById('chatBirdEmotesBar');
      if (!bar) return;
      bar.innerHTML = '';
      CUTE_BIRD_EMOTES.forEach(emote => {
        const btn = document.createElement('button');
        btn.className = 'bird-emote-btn';
        btn.type = 'button';
        btn.title = emote.title;
        btn.innerHTML = emote.render(30);
        btn.onclick = () => {
          this.sendMessage(`[BIRD_EMOTE:${emote.id}]`);
        };
        bar.appendChild(btn);
      });
    }

    init() {
      if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
        this.db = firebase.firestore();
        this.isInitialized = true;
        console.log('[SocialService] Firestore Social Module initialized.');
        setTimeout(() => this.initLobbyChat(), 500);
      }
    }

    getMyKeys() {
      const keys = [];
      if (this.myKey) keys.push(this.myKey);
      if (this.myProfile && this.myProfile.googleUid) {
        keys.push(this.myProfile.googleUid);
        keys.push('acc_' + this.myProfile.googleUid);
      }
      if (this.myKey && this.myKey.startsWith('acc_')) {
        keys.push(this.myKey.replace(/^acc_/, ''));
      }
      return Array.from(new Set(keys.filter(Boolean)));
    }


    // ==========================================
    // MLBB UNIFIED LOBBY CHAT (GLOBAL & FRIENDS)
    // ==========================================
    initLobbyChat() {
      this.currentChatTab = 'global';
      this.activeFriendChat = null;
      this.listenGlobalChat();
      this.renderChatPresets();
      this.renderChatBirdEmotes();
      this.bindChatEvents();
    }

    bindChatEvents() {
      const chatBtn = document.getElementById('lobbyChatBtn');
      const modal = document.getElementById('mlbbChatModal');
      const tabGlobal = document.getElementById('mlbbChatTabGlobalBtn');
      const tabFriends = document.getElementById('mlbbChatTabFriendsBtn');
      const form = document.getElementById('mlbbChatForm');
      const input = document.getElementById('mlbbChatInput');

      if (chatBtn) {
        chatBtn.onclick = () => {
          if (window.audio && typeof window.audio.click === 'function') window.audio.click();
          if (typeof window.showModal === 'function') {
            window.showModal(modal);
          } else if (modal) {
            modal.classList.remove('hidden');
          }
          this.switchLobbyChatTab(this.currentChatTab || 'global');
        };
      }

      if (tabGlobal) {
        tabGlobal.onclick = () => {
          if (window.audio && typeof window.audio.click === 'function') window.audio.click();
          this.switchLobbyChatTab('global');
        };
      }

      if (tabFriends) {
        tabFriends.onclick = () => {
          if (window.audio && typeof window.audio.click === 'function') window.audio.click();
          this.switchLobbyChatTab('friends');
        };
      }

      if (form) {
        form.onsubmit = (e) => {
          e.preventDefault();
          const text = input ? input.value.trim() : '';
          if (!text) return;
          if (input) input.value = '';
          this.sendCurrentChatMessage(text);
        };
      }

      // Preset chips click
      const presetsBar = document.getElementById('mlbbChatPresetsBar');
      if (presetsBar) {
        presetsBar.querySelectorAll('.mlbb-preset-chip').forEach(chip => {
          chip.onclick = () => {
            const preset = chip.getAttribute('data-preset');
            if (preset) {
              if (window.audio && typeof window.audio.click === 'function') window.audio.click();
              this.sendCurrentChatMessage(preset);
            }
          };
        });
      }
    }

    switchLobbyChatTab(tab) {
      this.currentChatTab = tab;
      const tabGlobal = document.getElementById('mlbbChatTabGlobalBtn');
      const tabFriends = document.getElementById('mlbbChatTabFriendsBtn');
      const bodyGlobal = document.getElementById('mlbbGlobalChatBody');
      const bodyFriends = document.getElementById('mlbbFriendsChatBody');
      const title = document.getElementById('mlbbChatHeaderTitle');
      const subtitle = document.getElementById('mlbbChatHeaderSubtitle');
      const input = document.getElementById('mlbbChatInput');

      if (tabGlobal) tabGlobal.classList.toggle('active', tab === 'global');
      if (tabFriends) tabFriends.classList.toggle('active', tab === 'friends');
      if (bodyGlobal) bodyGlobal.classList.toggle('hidden', tab !== 'global');
      if (bodyFriends) bodyFriends.classList.toggle('hidden', tab !== 'friends');

      if (tab === 'global') {
        if (title) title.textContent = 'OBROLAN GLOBAL';
        if (subtitle) subtitle.textContent = 'Semua pemain online di server';
        if (input) input.placeholder = 'Ketik pesan ke Obrolan Global...';
        const c = document.getElementById('mlbbGlobalMessagesContainer');
        if (c) c.scrollTop = c.scrollHeight;
      } else {
        if (title) title.textContent = 'CHAT TEMAN (PRIVAT)';
        if (subtitle) subtitle.textContent = 'Obrolan langsung 1-on-1 dengan teman';
        if (input) input.placeholder = 'Ketik pesan privat ke teman...';
        this.renderChatFriendsList();
      }
    }

    renderChatPresets() {
      // already statically in html, but chips bound in bindChatEvents
    }

    renderChatBirdEmotes() {
      const bar = document.getElementById('mlbbChatBirdEmotesBar');
      if (!bar) return;
      bar.innerHTML = '';
      CUTE_BIRD_EMOTES.slice(0, 8).forEach(emote => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chat-bird-emote-btn';
        btn.title = emote.title;
        btn.innerHTML = emote.render(22);
        btn.onclick = () => {
          if (window.audio && typeof window.audio.click === 'function') window.audio.click();
          this.sendCurrentChatMessage(`[BIRD_EMOTE:${emote.id}]`);
        };
        bar.appendChild(btn);
      });
    }

    listenGlobalChat() {
      if (!this.db) return;
      if (this.globalChatUnsub) this.globalChatUnsub();

      const container = document.getElementById('mlbbGlobalMessagesContainer');
      const snippet = document.getElementById('mlbbLobbyChatSnippet');

      try {
        this.globalChatUnsub = this.db.collection('flappy_global_chat')
          .orderBy('timestamp', 'desc')
          .limit(35)
          .onSnapshot(snap => {
            const messages = [];
            snap.forEach(doc => {
              messages.push({ id: doc.id, ...doc.data() });
            });
            // Reverse so oldest first
            messages.reverse();

            // Update snippet on bottom nav
            if (messages.length > 0 && snippet) {
              const lastMsg = messages[messages.length - 1];
              const cleanText = (lastMsg.text || '').startsWith('[BIRD_EMOTE:') ? 'Stiker Burung 🐣' : lastMsg.text;
              snippet.innerHTML = `<span class="mlbb-chat-ch">[Global]</span> <b>${this.escapeHtml(lastMsg.senderName || 'Player')}:</b> ${this.escapeHtml(cleanText)}`;
            }

            // Render messages in modal
            if (container) {
              container.innerHTML = '';
              if (messages.length === 0) {
                container.innerHTML = '<div style="text-align:center;color:#94a3b8;padding:25px;font-size:0.8rem;">Belum ada pesan global. Jadilah yang pertama menyapa!</div>';
                return;
              }

              messages.forEach(msg => {
                const isMe = msg.senderKey === this.myKey;
                const timeStr = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                
                let contentHtml = '';
                if (typeof msg.text === 'string' && msg.text.startsWith('[BIRD_EMOTE:')) {
                  const emoteId = msg.text.replace('[BIRD_EMOTE:', '').replace(']', '').trim();
                  const foundEmote = CUTE_BIRD_EMOTES.find(e => e.id === emoteId);
                  contentHtml = foundEmote ? `<div class="bird-sticker-img" title="${foundEmote.title}">${foundEmote.render(40)}</div>` : this.escapeHtml(msg.text);
                } else {
                  contentHtml = this.escapeHtml(msg.text);
                }

                const row = document.createElement('div');
                row.className = `mlbb-gm-row ${isMe ? 'is-me' : ''}`;
                
                const avSvg = typeof window.getCuteAvatarSvg === 'function'
                  ? window.getCuteAvatarSvg(msg.senderAvatar || 'chick_yellow', 24)
                  : '🐥';

                row.innerHTML = `
                  <div class="mlbb-gm-avatar" title="Lihat Profil ${this.escapeHtml(msg.senderName || 'Pemain')}">
                    ${avSvg}
                  </div>
                  <div class="mlbb-gm-content">
                    <div class="mlbb-gm-meta">
                      <span class="mlbb-gm-name">${this.escapeHtml(msg.senderName || 'Pemain')}</span>
                      <span class="mlbb-gm-tier">${this.escapeHtml(msg.senderTier || 'BRONZE')}</span>
                      <span class="mlbb-gm-time">${timeStr}</span>
                    </div>
                    <div class="mlbb-gm-bubble">${contentHtml}</div>
                  </div>
                `;

                // Clicking avatar opens user action (view profile or add friend)
                const avEl = row.querySelector('.mlbb-gm-avatar');
                if (avEl && !isMe) {
                  avEl.onclick = () => {
                    this.openFriendProfile({
                      friendKey: msg.senderKey,
                      name: msg.senderName,
                      avatar: msg.senderAvatar,
                      tier: msg.senderTier
                    });
                  };
                }

                container.appendChild(row);
              });
              container.scrollTop = container.scrollHeight;
            }
          }, err => {
            console.warn('[SocialService] Global chat error:', err.message);
          });
      } catch(e) {
        console.warn('[SocialService] Init global chat error:', e.message);
      }
    }

    renderChatFriendsList() {
      const list = document.getElementById('mlbbChatFriendsList');
      if (!list) return;
      list.innerHTML = '';
      if (!this.friends || this.friends.length === 0) {
        list.innerHTML = '<div style="padding:15px 6px;font-size:0.75rem;color:#94a3b8;text-align:center;">Belum ada teman</div>';
        return;
      }

      this.friends.forEach(f => {
        const item = document.createElement('div');
        item.className = `mlbb-cm-friend-item ${this.activeFriendChat && this.activeFriendChat.friendKey === f.friendKey ? 'active' : ''}`;
        const avSvg = typeof window.getCuteAvatarSvg === 'function' ? window.getCuteAvatarSvg(f.avatar || 'chick_yellow', 18) : '🐥';
        item.innerHTML = `
          <div style="width:18px;height:18px;border-radius:50%;overflow:hidden;flex-shrink:0;">${avSvg}</div>
          <span class="mlbb-cm-friend-item-name">${this.escapeHtml(f.name || 'Teman')}</span>
          <span class="friend-online-dot ${f.isOnline ? 'online' : ''}" style="margin-left:auto;"></span>
        `;
        item.onclick = () => {
          if (window.audio && typeof window.audio.click === 'function') window.audio.click();
          this.selectFriendForLobbyChat(f);
        };
        list.appendChild(item);
      });

      if (!this.activeFriendChat && this.friends.length > 0) {
        this.selectFriendForLobbyChat(this.friends[0]);
      }
    }

    selectFriendForLobbyChat(friend) {
      this.activeFriendChat = friend;
      const targetBar = document.getElementById('mlbbChatActiveFriendName');
      if (targetBar) {
        targetBar.textContent = `Obrolan Privat: ${friend.name || 'Teman'}`;
      }
      this.renderChatFriendsList();
      this.listenFriendLobbyMessages(friend);
    }

    listenFriendLobbyMessages(friend) {
      if (!this.db || !this.myKey || !friend) return;
      if (this.friendLobbyChatUnsub) this.friendLobbyChatUnsub();

      const container = document.getElementById('mlbbFriendMessagesContainer');
      if (container) container.innerHTML = '<div style="text-align:center;color:#94a3b8;padding:15px;font-size:0.8rem;">Memuat obrolan...</div>';

      const channelId = [this.myKey, friend.friendKey].sort().join('_');
      try {
        this.friendLobbyChatUnsub = this.db.collection('flappy_direct_chats')
          .doc(channelId)
          .collection('messages')
          .orderBy('timestamp', 'asc')
          .limitToLast(40)
          .onSnapshot(snap => {
            if (!container) return;
            container.innerHTML = '';
            if (snap.empty) {
              container.innerHTML = '<div style="text-align:center;color:#94a3b8;padding:25px 10px;font-size:0.8rem;">Belum ada pesan privat. Sapa temanmu!</div>';
              return;
            }
            snap.forEach(doc => {
              const msg = doc.data();
              const isMe = msg.senderKey === this.myKey;
              const timeStr = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
              
              let contentHtml = '';
              if (typeof msg.text === 'string' && msg.text.startsWith('[BIRD_EMOTE:')) {
                const emoteId = msg.text.replace('[BIRD_EMOTE:', '').replace(']', '').trim();
                const foundEmote = CUTE_BIRD_EMOTES.find(e => e.id === emoteId);
                contentHtml = foundEmote ? `<div class="bird-sticker-img" title="${foundEmote.title}">${foundEmote.render(40)}</div>` : this.escapeHtml(msg.text);
              } else {
                contentHtml = this.escapeHtml(msg.text);
              }

              const row = document.createElement('div');
              row.className = `mlbb-gm-row ${isMe ? 'is-me' : ''}`;
              const avSvg = typeof window.getCuteAvatarSvg === 'function' ? window.getCuteAvatarSvg(isMe ? (this.myProfile.avatar || 'chick_yellow') : (friend.avatar || 'chick_yellow'), 22) : '🐥';
              row.innerHTML = `
                <div class="mlbb-gm-avatar">${avSvg}</div>
                <div class="mlbb-gm-content">
                  <div class="mlbb-gm-meta">
                    <span class="mlbb-gm-name">${this.escapeHtml(isMe ? 'Kamu' : (friend.name || 'Teman'))}</span>
                    <span class="mlbb-gm-time">${timeStr}</span>
                  </div>
                  <div class="mlbb-gm-bubble">${contentHtml}</div>
                </div>
              `;
              container.appendChild(row);
            });
            container.scrollTop = container.scrollHeight;
          });
      } catch(e) {}
    }

    async sendCurrentChatMessage(text) {
      if (!text || !text.trim()) return;
      if (!this.myProfile || !this.myProfile.isLoggedIn) {
        if (typeof window.showGameDialog === 'function') {
          window.showGameDialog({
            title: 'Login Dulu',
            html: '<p>Anda harus login akun Google terlebih dahulu untuk mengirim pesan obrolan.</p>',
            type: 'warning',
            confirmText: 'MENGERTI'
          });
        }
        return;
      }

      if (this.currentChatTab === 'friends') {
        if (!this.activeFriendChat) {
          if (typeof window.showToast === 'function') window.showToast('Pilih teman terlebih dahulu');
          return;
        }
        const channelId = [this.myKey, this.activeFriendChat.friendKey].sort().join('_');
        try {
          await this.db.collection('flappy_direct_chats')
            .doc(channelId)
            .collection('messages')
            .add({
              senderKey: this.myKey,
              senderName: this.myProfile.gamerTag || 'Player',
              text: text.trim(),
              timestamp: Date.now()
            });
          if (window.audio && typeof window.audio.click === 'function') window.audio.click();
        } catch(e) {
          console.warn('[SocialService] Send friend chat error:', e.message);
        }
      } else {
        // Send to GLOBAL chat
        try {
          await this.db.collection('flappy_global_chat').add({
            senderKey: this.myKey,
            senderName: this.myProfile.gamerTag || 'Player',
            senderAvatar: this.myProfile.avatar || 'chick_yellow',
            senderTier: this.myProfile.tier || 'BRONZE I',
            text: text.trim(),
            timestamp: Date.now()
          });
          if (window.audio && typeof window.audio.click === 'function') window.audio.click();
        } catch(e) {
          console.warn('[SocialService] Send global chat error:', e.message);
        }
      }
    }

    setAccount(primaryKey, profile) {
      if (!this.db && typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
        this.db = firebase.firestore();
        this.isInitialized = true;
      }
      if (!primaryKey || !profile || !profile.isLoggedIn) {
        this.clearAccount();
        return;
      }
      if (this.myKey && this.myKey !== primaryKey) {
        this.stopListeners();
        this.friends = [];
        this.friendRequests = [];
      }
      this.myKey = primaryKey;
      this.myProfile = profile || {};
      this.startListeners();
      this.refreshRequests();
      this.initLobbyChat();
    }

    clearAccount() {
      this.stopListeners();
      this.myKey = null;
      this.myProfile = null;
      this.friends = [];
      this.friendRequests = [];
      this.activeInvites = {};
      this.renderFriendsList();
      this.renderLobbyFriends();
      this.renderQuickFriends();
      this.updateBadgeUI();
    }

    startListeners() {
      if (!this.db || !this.myKey) return;
      this.stopListeners();
      const myKeys = this.getMyKeys();

      // 1. Listen for incoming Friend Requests (Multi-Key Support)
      try {
        this.friendReqUnsub = this.db.collection('flappy_friend_requests')
          .where('toKey', 'in', myKeys.slice(0, 10))
          .where('status', '==', 'pending')
          .onSnapshot(snap => {
            const requests = [];
            snap.forEach(doc => {
              requests.push({ id: doc.id, ...doc.data() });
            });
            this.friendRequests = requests;
            this.updateBadgeUI();
            this.renderRequestsList();
          }, err => {
            console.warn('[SocialService] Error listening to requests:', err.message);
          });
      } catch(e) {
        console.warn('[SocialService] Init request listener failed:', e.message);
      }

      // 2. Listen for Friends List
      try {
        this.friendsUnsub = this.db.collection('flappy_friends')
          .where('users', 'array-contains-any', myKeys.slice(0, 10))
          .onSnapshot(snap => {
            const friendsList = [];
            snap.forEach(doc => {
              const data = doc.id ? doc.data() : null;
              if (data && data.profiles) {
                // Temukan profile teman (selain myKey)
                const otherKey = data.users.find(k => !myKeys.includes(k));
                if (otherKey && data.profiles[otherKey]) {
                  friendsList.push({
                    friendKey: otherKey,
                    friendDocId: doc.id,
                    ...data.profiles[otherKey]
                  });
                }
              }
            });
            this.friends = friendsList;
            this.renderFriendsList();
            this.renderLobbyFriends();
            this.renderQuickFriends();
          }, err => {
            console.warn('[SocialService] Error listening to friends:', err.message);
          });
      } catch(e) {
        console.warn('[SocialService] Init friends listener failed:', e.message);
      }

      // 3. Listen for Multiplayer Invites
      try {
        this.invitesUnsub = this.db.collection('flappy_invites')
          .where('toKey', 'in', myKeys.slice(0, 10))
          .where('status', '==', 'pending')
          .onSnapshot(snap => {
            snap.forEach(doc => {
              const invite = { id: doc.id, ...doc.data() };
              // Hanya tampilkan jika belum lewat dari 35 detik
              if (Date.now() - (invite.timestamp || 0) < 35000) {
                if (!this.activeInvites[doc.id]) {
                  this.activeInvites[doc.id] = true;
                  this.showInviteToast(invite);
                }
              }
            });
          }, err => {
            console.warn('[SocialService] Error listening to invites:', err.message);
          });
      } catch(e) {
        console.warn('[SocialService] Init invites listener failed:', e.message);
      }
    }

    async refreshRequests() {
      if (!this.db || !this.myKey) return;
      const myKeys = this.getMyKeys();
      try {
        const snap = await this.db.collection('flappy_friend_requests')
          .where('toKey', 'in', myKeys.slice(0, 10))
          .where('status', '==', 'pending')
          .get();
        const requests = [];
        snap.forEach(doc => {
          requests.push({ id: doc.id, ...doc.data() });
        });
        this.friendRequests = requests;
        this.updateBadgeUI();
        this.renderRequestsList();
      } catch(e) {
        console.warn('[SocialService] Refresh requests error:', e.message);
      }
    }


    async sendLobbyInvite(friend, roomCode) {
      if (!this.db || !friend || !friend.friendKey) {
        if (typeof window.showGameDialog === 'function') {
          window.showGameDialog({
            title: 'Undangan Disalin!',
            html: `<p>Bagikan kode room <b style="color:#facc15;">#${roomCode}</b> ke <b>${friend ? friend.name : 'teman'}</b>!</p>`,
            type: 'info'
          });
        }
        return;
      }
      try {
        await this.db.collection('flappy_game_invites').add({
          fromKey: this.myKey,
          fromName: this.myProfile?.gamerTag || 'Teman',
          fromAvatar: this.myProfile?.avatar || 'chick_yellow',
          toKey: friend.friendKey,
          roomCode: String(roomCode),
          mode: window.selectedMpGameMode || 'survival',
          status: 'pending',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('[SocialService] Game invite sent to:', friend.name);
      } catch (err) {
        console.warn('[SocialService] Error sending game invite:', err.message);
      }
    }

    handleIncomingGameInvite(invite) {
      if (!invite || !invite.roomCode || invite.fromKey === this.myKey) return;
      const toast = document.getElementById('mlbbIncomingInviteToast');
      const senderName = document.getElementById('mlbbInviteSenderName');
      const senderAvatar = document.getElementById('mlbbInviteSenderAvatar');
      const roomCodeEl = document.getElementById('mlbbInviteRoomCode');
      const rejectBtn = document.getElementById('mlbbInviteRejectBtn');
      const acceptBtn = document.getElementById('mlbbInviteAcceptBtn');

      if (!toast) return;

      if (window.audio && window.audio.win) window.audio.win();

      if (senderName) senderName.textContent = invite.fromName || 'Teman';
      if (roomCodeEl) roomCodeEl.textContent = '#' + invite.roomCode;
      if (senderAvatar) {
        senderAvatar.innerHTML = typeof window.getCuteAvatarSvg === 'function'
          ? window.getCuteAvatarSvg(invite.fromAvatar || 'chick_yellow', 24)
          : '🎮';
      }

      toast.classList.remove('hidden');

      // Auto dismiss after 18 seconds
      const autoDismiss = setTimeout(() => {
        toast.classList.add('hidden');
      }, 18000);

      if (rejectBtn) {
        rejectBtn.onclick = async () => {
          clearTimeout(autoDismiss);
          toast.classList.add('hidden');
          if (this.db && invite.id) {
            try { await this.db.collection('flappy_game_invites').doc(invite.id).update({ status: 'rejected' }); } catch(_) {}
          }
        };
      }

      if (acceptBtn) {
        acceptBtn.onclick = async () => {
          clearTimeout(autoDismiss);
          toast.classList.add('hidden');
          if (this.db && invite.id) {
            try { await this.db.collection('flappy_game_invites').doc(invite.id).update({ status: 'accepted' }); } catch(_) {}
          }
          // Join room immediately!
          if (window.multiplayerEngine) {
            if (typeof window.showModal === 'function') {
              const mpModal = document.getElementById('multiplayerModal');
              if (mpModal) window.showModal(mpModal);
            }
            window.multiplayerEngine.joinRoom(invite.roomCode, {
              name: this.myProfile?.gamerTag || 'SkyPlayer',
              avatar: this.myProfile?.avatar || 'chick_yellow',
              skin: window.progress?.selected || 'classic'
            });
          }
        };
      }
    }

    stopListeners() {
      if (this.friendReqUnsub) { this.friendReqUnsub(); this.friendReqUnsub = null; }
      if (this.friendsUnsub) { this.friendsUnsub(); this.friendsUnsub = null; }
      if (this.invitesUnsub) { this.invitesUnsub(); this.invitesUnsub = null; }
      if (this.activeChatUnsub) { this.activeChatUnsub(); this.activeChatUnsub = null; }
    }

    // ==========================================
    // 1. CARI PEMAIN / SEARCH PLAYERS
    // ==========================================
    async searchPlayers(query) {
      if (!this.db || !query || query.trim().length < 2) return [];
      const cleanQuery = query.trim().toLowerCase();
      try {
        const snap = await this.db.collection('flappy_leaderboard').limit(50).get();
        const results = [];
        const myKeys = this.getMyKeys();
        snap.forEach(doc => {
          const p = doc.data();
          const pName = (p.name || p.gamerTag || '').toLowerCase();
          const pKey = p.primaryKey || ('acc_' + p.uid);
          if (!myKeys.includes(pKey) && (pName.includes(cleanQuery) || pKey.toLowerCase().includes(cleanQuery))) {
            const isAlreadyFriend = this.friends.some(f => f.friendKey === pKey);
            const isReqPending = this.friendRequests.some(r => r.fromKey === pKey);
            results.push({
              key: pKey,
              name: p.name || p.gamerTag || 'Player',
              avatar: p.avatar || 'chick_yellow',
              tier: p.tier || 'BRONZE I',
              score: p.score || p.rankedBest || 0,
              isFriend: isAlreadyFriend,
              isPending: isReqPending
            });
          }
        });
        return results;
      } catch(e) {
        console.warn('[SocialService] Search error:', e.message);
        return [];
      }
    }

    // ==========================================
    // 2. KIRIM & TERIMA PERMINTAAN PERTEMANAN
    // ==========================================
    async sendFriendRequest(targetKey, targetName, targetAvatar, targetTier) {
      if (!this.db || !this.myKey || this.myKey === targetKey) return { success: false, msg: 'Target tidak valid' };

      try {
        const existing = await this.db.collection('flappy_friend_requests')
          .where('fromKey', '==', this.myKey)
          .where('toKey', '==', targetKey)
          .where('status', '==', 'pending')
          .get();

        if (!existing.empty) {
          return { success: false, msg: 'Permintaan pertemanan sudah dikirim sebelumnya!' };
        }

        await this.db.collection('flappy_friend_requests').add({
          fromKey: this.myKey,
          fromName: this.myProfile.gamerTag || 'Player',
          fromAvatar: this.myProfile.avatar || 'chick_yellow',
          fromTier: this.myProfile.tier || 'BRONZE I',
          toKey: targetKey,
          toName: targetName,
          status: 'pending',
          timestamp: Date.now()
        });

        return { success: true, msg: 'Permintaan pertemanan terkirim!' };
      } catch(e) {
        return { success: false, msg: e.message };
      }
    }

    async respondFriendRequest(requestId, accept, reqData) {
      if (!this.db || !this.myKey) return;
      try {
        await this.db.collection('flappy_friend_requests').doc(requestId).update({
          status: accept ? 'accepted' : 'rejected',
          respondedAt: Date.now()
        });

        if (accept && reqData) {
          const docId = [this.myKey, reqData.fromKey].sort().join('_');
          await this.db.collection('flappy_friends').doc(docId).set({
            users: [this.myKey, reqData.fromKey],
            profiles: {
              [this.myKey]: {
                name: this.myProfile.gamerTag || 'Player',
                avatar: this.myProfile.avatar || 'chick_yellow',
                tier: this.myProfile.tier || 'BRONZE I'
              },
              [reqData.fromKey]: {
                name: reqData.fromName || 'Player',
                avatar: reqData.fromAvatar || 'chick_yellow',
                tier: reqData.fromTier || 'BRONZE I'
              }
            },
            createdAt: Date.now()
          }, { merge: true });
        }
      } catch(e) {
        console.warn('[SocialService] Respond error:', e.message);
      }
    }

    async removeFriend(friendKey, friendDocId) {
      if (!this.db || !this.myKey) return;
      try {
        const docId = friendDocId || [this.myKey, friendKey].sort().join('_');
        await this.db.collection('flappy_friends').doc(docId).delete();
      } catch(e) {
        console.warn('[SocialService] Delete friend error:', e.message);
      }
    }

    // ==========================================
    // 3. LIHAT PROFIL DETAIL TEMAN / VIEW FRIEND PROFILE
    // ==========================================
    async openFriendProfile(friend) {
      const modal = document.getElementById('friendProfileModal');
      if (!modal) return;

      const getAv = (id, s) => {
        if (typeof window.getCuteAvatarSvg === 'function') return window.getCuteAvatarSvg(id, s);
        return (typeof window.getCuteAvatarSvg === 'function') ? window.getCuteAvatarSvg('chick_yellow', s || 38) : '';
      };

      // Set initial data
      document.getElementById('fpAvatarBox').innerHTML = getAv(friend.avatar || 'chick_yellow', 52);
      document.getElementById('fpName').textContent = friend.name || 'Gamer';
      document.getElementById('fpRankBadge').textContent = `${friend.tier || 'BRONZE I'}`;
      document.getElementById('fpUid').textContent = `ID: ${friend.friendKey || 'acc_...'}`;

      // Open modal
      if (typeof window.showModal === 'function') {
        window.showModal(modal);
      } else {
        modal.classList.remove('hidden');
      }

      // Bind action buttons in profile
      const chatBtn = document.getElementById('fpChatBtn');
      const inviteBtn = document.getElementById('fpInviteBtn');
      const removeBtn = document.getElementById('fpRemoveBtn');

      if (chatBtn) {
        chatBtn.onclick = () => {
          this.openDirectChat(friend);
        };
      }

      if (inviteBtn) {
        inviteBtn.onclick = async () => {
          if (window.multiplayerEngine) {
            inviteBtn.textContent = 'Mengirim...';
            const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
            const hostData = {
              name: this.myProfile.gamerTag || 'SkyPlayer',
              avatar: this.myProfile.avatar || 'chick_yellow',
              skin: (window.progress && window.progress.selected) || 'classic'
            };
            window.multiplayerEngine.createRoom(hostData);
            const actualRoomCode = window.multiplayerEngine.currentRoom.code;
            await this.sendRoomInvite(friend.friendKey, actualRoomCode);
            inviteBtn.textContent = 'Terkirim!';
            setTimeout(() => { inviteBtn.textContent = 'Ajak Main'; }, 2000);
            
            const mpModal = document.getElementById('multiplayerModal');
            if (mpModal && typeof window.showModal === 'function') {
              window.showModal(mpModal);
            }
          }
        };
      }

      if (removeBtn) {
        removeBtn.onclick = () => {
          if (confirm(`Yakin ingin menghapus ${friend.name} dari pertemanan?`)) {
            this.removeFriend(friend.friendKey);
            if (typeof window.closeModal === 'function') window.closeModal();
          }
        };
      }

      // Fetch fresh stats from Firestore Leaderboard
      if (this.db && friend.friendKey) {
        try {
          const docSnap = await this.db.collection('flappy_leaderboard').doc(friend.friendKey).get();
          if (docSnap.exists) {
            const data = docSnap.data();
            document.getElementById('fpCasualScore').textContent = data.casualBest || data.score || '0';
            document.getElementById('fpRankPoints').textContent = `${data.rankedBest || data.score || 0} PTS`;
            document.getElementById('fpMpWins').textContent = `${data.mpWins || 0} MENANG`;
            document.getElementById('fpCoins').textContent = `${data.coins || 0}`;

            // Loadout
            const l = data.loadout || {};
            const fmt = (v, d) => (v && v !== 'none') ? String(v).replace(/[-_]+/g, ' ').toUpperCase() : d;
            document.getElementById('fpEquippedBird').textContent = fmt(l.bird, 'CLASSIC');
            document.getElementById('fpEquippedPet').textContent = fmt(l.pet, 'NONE');
            document.getElementById('fpEquippedHat').textContent = fmt(l.hat, 'NONE');
            document.getElementById('fpEquippedAura').textContent = fmt(l.aura, 'NONE');
            
            
            

            // Unlocked counts
            const u = data.unlocked || {};
            document.getElementById('fpSkinCount').textContent = `${(Array.isArray(u.bird) ? u.bird.length : 1)} Milik`;
            document.getElementById('fpPetCount').textContent = `${(Array.isArray(u.pet) ? u.pet.length : 0)} Milik`;
            document.getElementById('fpHatCount').textContent = `${(Array.isArray(u.hat) ? u.hat.length : 0)} Milik`;
            // Update live showcase with friend's exact equipped skins & pets!
            if (typeof window.startFriendShowcase === 'function') {
              window.startFriendShowcase({
                bird: l.bird || friend.avatar || 'classic',
                pet: l.pet || 'none',
                hat: l.hat || 'none',
                outfit: l.outfit || 'none',
                aura: l.aura || 'none',
                background: l.background || 'sky',
                pipe: l.pipe || 'green'
              });
            }
          }
        } catch(e) {
          console.warn('[SocialService] Error fetching friend profile stats:', e.message);
        }
      }
    }

    // ==========================================
    // 4. 1-ON-1 DIRECT CHAT & CUTE BIRD STICKERS
    // ==========================================
    openDirectChat(friend) {
      this.activeChatFriend = friend;
      const modal = document.getElementById('directChatModal');
      if (!modal) return;

      const nameEl = document.getElementById('chatPartnerName');
      const avatarEl = document.getElementById('chatPartnerAvatar');
      if (nameEl) nameEl.textContent = friend.name || 'Teman';
      if (avatarEl && typeof window.getCuteAvatarSvg === 'function') {
        avatarEl.innerHTML = window.getCuteAvatarSvg(friend.avatar || 'chick_yellow', 36);
      }

      this.initBirdEmotesBar();

      if (typeof window.showModal === 'function') {
        window.showModal(modal);
      } else {
        modal.classList.remove('hidden');
      }

      const channelId = [this.myKey, friend.friendKey].sort().join('_');
      this.listenMessages(channelId);
    }

    listenMessages(channelId) {
      if (this.activeChatUnsub) this.activeChatUnsub();
      const container = document.getElementById('chatMessagesContainer');
      if (container) container.innerHTML = '<div style="text-align:center;color:#94a3b8;padding:20px;">Memuat obrolan...</div>';

      try {
        this.activeChatUnsub = this.db.collection('flappy_direct_chats')
          .doc(channelId)
          .collection('messages')
          .orderBy('timestamp', 'asc')
          .limitToLast(50)
          .onSnapshot(snap => {
            if (!container) return;
            container.innerHTML = '';
            if (snap.empty) {
              container.innerHTML = '<div style="text-align:center;color:#94a3b8;padding:40px 10px;">Belum ada pesan. Kirim stiker burung imut ke temanmu!</div>';
              return;
            }
            snap.forEach(doc => {
              const msg = doc.data();
              const isMe = msg.senderKey === this.myKey;
              const timeStr = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
              
              let contentHtml = '';
              if (typeof msg.text === 'string' && msg.text.startsWith('[BIRD_EMOTE:')) {
                const emoteId = msg.text.replace('[BIRD_EMOTE:', '').replace(']', '').trim();
                const foundEmote = CUTE_BIRD_EMOTES.find(e => e.id === emoteId);
                if (foundEmote) {
                  contentHtml = `<div class="bird-sticker-img" title="${foundEmote.title}">${foundEmote.render(44)}</div>`;
                } else {
                  contentHtml = `<div>${this.escapeHtml(msg.text)}</div>`;
                }
              } else {
                contentHtml = `<div>${this.escapeHtml(msg.text)}</div>`;
              }

              const bubble = document.createElement('div');
              bubble.className = `chat-msg-bubble ${isMe ? 'outgoing' : 'incoming'}`;
              bubble.innerHTML = `
                ${contentHtml}
                <div class="chat-msg-time">${timeStr}</div>
              `;
              container.appendChild(bubble);
            });
            container.scrollTop = container.scrollHeight;
          }, err => {
            console.warn('[SocialService] Chat error:', err.message);
          });
      } catch(e) {}
    }

    async sendMessage(text) {
      if (!this.db || !this.myKey || !this.activeChatFriend || !text || !text.trim()) return;
      const channelId = [this.myKey, this.activeChatFriend.friendKey].sort().join('_');
      try {
        await this.db.collection('flappy_direct_chats')
          .doc(channelId)
          .collection('messages')
          .add({
            senderKey: this.myKey,
            senderName: this.myProfile.gamerTag || 'Player',
            text: text.trim(),
            timestamp: Date.now()
          });
      } catch(e) {
        console.warn('[SocialService] Send msg error:', e.message);
      }
    }

    // ==========================================
    // 5. UNDANGAN MULTIPLAYER / ROOM INVITES
    // ==========================================
    async sendRoomInvite(friendKey, roomCode) {
      if (!this.db || !this.myKey || !friendKey || !roomCode) return false;
      try {
        await this.db.collection('flappy_invites').add({
          fromKey: this.myKey,
          fromName: this.myProfile.gamerTag || 'Player',
          fromAvatar: this.myProfile.avatar || 'chick_yellow',
          toKey: friendKey,
          roomCode: roomCode,
          status: 'pending',
          timestamp: Date.now()
        });
        return true;
      } catch(e) {
        console.warn('[SocialService] Send invite error:', e.message);
        return false;
      }
    }

    showInviteToast(invite) {
      const container = document.getElementById('socialInviteToastContainer');
      if (!container) return;

      // Play audio notification chime
      if (window.audio && typeof window.audio.win === 'function') {
        try { window.audio.win(); } catch(_) {}
      }

      const getAv = (id, s) => {
        if (typeof window.getCuteAvatarSvg === 'function') return window.getCuteAvatarSvg(id, s);
        return (typeof window.getCuteAvatarSvg === 'function') ? window.getCuteAvatarSvg('chick_yellow', s || 38) : '';
      };

      const toast = document.createElement('div');
      toast.className = 'social-invite-toast';
      toast.innerHTML = `
        <div class="invite-toast-header">
          <div class="invite-toast-left">
            <div class="invite-toast-avatar">${getAv(invite.fromAvatar || 'chick_yellow', 32)}</div>
            <div>
              <div class="invite-toast-title">${this.escapeHtml(invite.fromName)}</div>
              <div style="font-size:0.75rem;color:#94a3b8;">Ajak Mabar Multiplayer</div>
            </div>
          </div>
          <span class="invite-toast-room-pill">#${invite.roomCode}</span>
        </div>
        <div class="invite-toast-msg">
          Temanmu mengajak bertanding di Room: <b>#${invite.roomCode}</b>! Siap terbang?
        </div>
        <div class="invite-toast-actions">
          <button class="invite-btn-accept" data-code="${invite.roomCode}">GABUNG SEKARANG</button>
          <button class="invite-btn-decline">NANTI</button>
        </div>
      `;

      // Accept Handler
      toast.querySelector('.invite-btn-accept').onclick = () => {
        toast.remove();
        if (this.db) {
          this.db.collection('flappy_invites').doc(invite.id).update({ status: 'accepted' });
        }
        if (window.multiplayerEngine) {
          const mpModal = document.getElementById('multiplayerModal');
          if (mpModal && typeof window.showModal === 'function') {
            window.showModal(mpModal);
          }
          window.multiplayerEngine.joinRoom(invite.roomCode, {
            name: this.myProfile.gamerTag || 'SkyPlayer',
            avatar: this.myProfile.avatar || 'chick_yellow',
            skin: (window.progress && window.progress.selected) || 'classic'
          });
        }
      };

      // Decline Handler
      toast.querySelector('.invite-btn-decline').onclick = () => {
        toast.remove();
        if (this.db) {
          this.db.collection('flappy_invites').doc(invite.id).update({ status: 'declined' });
        }
      };

      container.appendChild(toast);

      // Auto dismiss after 25s
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 25000);
    }

    // ==========================================
    // 6. UI RENDERING & TAB CONTROLS
    // ==========================================
    updateBadgeUI() {
      const badge = document.getElementById('socialBadgeCount');
      const tabBadge = document.getElementById('socialReqTabBadge');
      const count = this.friendRequests.length;
      if (badge) {
        if (count > 0) {
          badge.textContent = count;
          badge.style.display = 'block';
        } else {
          badge.style.display = 'none';
        }
      }
      if (tabBadge) {
        if (count > 0) {
          tabBadge.textContent = count;
          tabBadge.style.display = 'inline-block';
        } else {
          tabBadge.style.display = 'none';
        }
      }
    }

    renderLobbyFriends() {
      const container = document.getElementById('mpLobbyFriendsList');
      const count = document.getElementById('mpLobbyFriendCount');
      if (!container) return;
      if (count) count.textContent = String(this.friends.length);
      if (!this.friends.length) {
        container.innerHTML = '<div class="mp-friends-empty">Belum ada teman.<br>Tambah teman di menu Sosial!</div>';
        return;
      }
      const avatar = (id) => typeof window.getCuteAvatarSvg === 'function'
        ? window.getCuteAvatarSvg(id || 'chick_yellow', 20)
        : 'chick_yellow';
      container.innerHTML = this.friends.map(friend => `
        <div class="mp-friend-row" data-friend-key="${friend.friendKey}">
          <span class="mp-friend-avatar">${avatar(friend.avatar)}</span>
          <div class="mp-friend-info">
            <b>${this.escapeHtml(friend.name || 'Teman')}</b>
            <small>● ONLINE</small>
          </div>
          <button type="button" class="mp-lobby-invite-btn" title="Undang mabar">+ UNDANG</button>
        </div>`).join('');

      container.querySelectorAll('.mp-lobby-invite-btn').forEach(btn => {
        btn.onclick = () => {
          if (window.audio && window.audio.click) window.audio.click();
          const key = btn.closest('.mp-friend-row')?.dataset.friendKey;
          const friend = this.friends.find(item => item.friendKey === key);
          const roomCode = document.getElementById('mpCreatedCodeBadge')?.textContent || '';
          
          if (typeof this.sendLobbyInvite === 'function') {
            this.sendLobbyInvite(friend, roomCode);
          }
          btn.textContent = 'TERKIRIM ✓';
          btn.style.background = '#0284c7';
          btn.style.borderColor = '#38bdf8';
          setTimeout(() => {
            btn.textContent = '+ UNDANG';
            btn.style.background = '';
            btn.style.borderColor = '';
          }, 2500);

          if (typeof window.showGameDialog === 'function') {
            window.showGameDialog({
              title: 'Undangan Terkirim!',
              html: `<p>Undangan mabar telah dikirim ke <b>${friend ? friend.name : 'Teman'}</b>!` +
                    (roomCode && roomCode !== '----' ? `<br>Kode Room: <b style="color:#facc15;">#${roomCode}</b></p>` : `</p>`),
              type: 'success'
            });
          }
        };
      });
    }

    renderQuickFriends() {
      const container = document.getElementById('mlbbFriendsQuickList');
      if (!container) return;
      if (!this.friends.length) {
        container.innerHTML = '<div class="mlbb-quick-friends-empty">Belum ada teman</div>';
        return;
      }
      const avatar = (id) => typeof window.getCuteAvatarSvg === 'function'
        ? window.getCuteAvatarSvg(id || 'chick_yellow', 28)
        : 'chick_yellow';
      container.innerHTML = this.friends.slice(0, 2).map(friend => `
        <button class="mlbb-quick-friend-item" type="button" data-friend-key="${friend.friendKey}" title="Lihat profil ${this.escapeHtml(friend.name || 'teman')}">
          <span class="mlbb-qf-avatar">${avatar(friend.avatar)}</span>
          <span class="mlbb-qf-name">${this.escapeHtml(friend.name || 'Teman')}</span>
          <span class="mlbb-qf-status" aria-label="Terhubung"></span>
        </button>`).join('');
      container.querySelectorAll('.mlbb-quick-friend-item').forEach(button => {
        button.onclick = () => {
          const friend = this.friends.find(item => item.friendKey === button.dataset.friendKey);
          if (friend) this.openFriendProfile(friend);
        };
      });
    }

    renderFriendsList() {
      const container = document.getElementById('socialFriendsList');
      if (!container) return;

      if (this.friends.length === 0) {
        container.innerHTML = `
          <div class="social-empty-state">
            <div class="social-empty-icon"><svg viewBox="0 0 24 24" width="32" height="32" fill="#38bdf8"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div>
            <div>Belum ada teman. Cari teman baru di tab <b>Cari Teman</b>!</div>
          </div>
        `;
        return;
      }

      const getAv = (id, s) => {
        if (typeof window.getCuteAvatarSvg === 'function') return window.getCuteAvatarSvg(id, s);
        return (typeof window.getCuteAvatarSvg === 'function') ? window.getCuteAvatarSvg('chick_yellow', s || 38) : '';
      };

      let html = '';
      this.friends.forEach(f => {
        const svg = getAv(f.avatar, 38);
        html += `
          <div class="social-player-card" data-key="${f.friendKey}">
            <div class="social-player-info btn-view-profile" data-key="${f.friendKey}" title="Klik untuk lihat profil lengkap">
              <div class="social-player-avatar">
                ${svg}
                <div class="social-status-dot"></div>
              </div>
              <div class="social-player-meta">
                <div class="social-player-name">${this.escapeHtml(f.name)}</div>
                <div class="social-player-tier">${f.tier || "BRONZE I"}</div>
              </div>
            </div>
            <div class="social-card-actions">
              <button class="social-action-btn btn-dm-chat" title="Kirim Chat" data-key="${f.friendKey}">Chat</button>
              <button class="social-action-btn success btn-invite-room" title="Ajak Main Multiplayer" data-key="${f.friendKey}">Ajak</button>
              <button class="social-action-btn danger btn-remove-friend" title="Hapus Teman" data-key="${f.friendKey}">&times;</button>
            </div>
          </div>
        `;
      });
      container.innerHTML = html;

      // Bind Click on Player info to View Full Profile
      container.querySelectorAll('.btn-view-profile').forEach(card => {
        card.onclick = () => {
          const key = card.getAttribute('data-key');
          const friend = this.friends.find(f => f.friendKey === key);
          if (friend) this.openFriendProfile(friend);
        };
      });

      // Bind actions
      container.querySelectorAll('.btn-dm-chat').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const key = btn.getAttribute('data-key');
          const friend = this.friends.find(f => f.friendKey === key);
          if (friend) this.openDirectChat(friend);
        };
      });

      container.querySelectorAll('.btn-invite-room').forEach(btn => {
        btn.onclick = async (e) => {
          e.stopPropagation();
          const key = btn.getAttribute('data-key');
          if (window.multiplayerEngine) {
            btn.textContent = 'Mengirim...';
            const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
            const hostData = {
              name: this.myProfile.gamerTag || 'SkyPlayer',
              avatar: this.myProfile.avatar || 'chick_yellow',
              skin: (window.progress && window.progress.selected) || 'classic'
            };
            window.multiplayerEngine.createRoom(hostData);
            const actualRoomCode = window.multiplayerEngine.currentRoom.code;
            await this.sendRoomInvite(key, actualRoomCode);
            btn.textContent = 'Terkirim!';
            setTimeout(() => { btn.textContent = 'Ajak'; }, 2000);
            
            const mpModal = document.getElementById('multiplayerModal');
            if (mpModal && typeof window.showModal === 'function') {
              window.showModal(mpModal);
            }
          }
        };
      });

      container.querySelectorAll('.btn-remove-friend').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const key = btn.getAttribute('data-key');
          const friend = this.friends.find(f => f.friendKey === key);
          if (confirm(`Yakin ingin menghapus ${friend ? friend.name : 'teman ini'} dari daftar?`)) {
            this.removeFriend(key);
          }
        };
      });
    }

    renderRequestsList() {
      const container = document.getElementById('socialRequestsList');
      if (!container) return;

      if (this.friendRequests.length === 0) {
        container.innerHTML = `
          <div class="social-empty-state">
            <div class="social-empty-icon"><svg viewBox="0 0 24 24" width="32" height="32" fill="#38bdf8"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg></div>
            <div>Tidak ada permintaan pertemanan masuk.</div>
          </div>
        `;
        return;
      }

      const getAv = (id, s) => {
        if (typeof window.getCuteAvatarSvg === 'function') return window.getCuteAvatarSvg(id, s);
        return (typeof window.getCuteAvatarSvg === 'function') ? window.getCuteAvatarSvg('chick_yellow', s || 38) : '';
      };

      let html = '';
      this.friendRequests.forEach(req => {
        const svg = getAv(req.fromAvatar, 38);
        html += `
          <div class="social-player-card">
            <div class="social-player-info">
              <div class="social-player-avatar">${svg}</div>
              <div class="social-player-meta">
                <div class="social-player-name">${this.escapeHtml(req.fromName)}</div>
                <div class="social-player-tier">${req.fromTier || "BRONZE I"}</div>
              </div>
            </div>
            <div class="social-card-actions">
              <button class="social-action-btn success btn-req-accept" data-req-id="${req.id}">Terima</button>
              <button class="social-action-btn danger btn-req-reject" data-req-id="${req.id}">Tolak</button>
            </div>
          </div>
        `;
      });
      container.innerHTML = html;

      // Bind Accept / Reject
      container.querySelectorAll('.btn-req-accept').forEach(btn => {
        btn.onclick = () => {
          const id = btn.getAttribute('data-req-id');
          const req = this.friendRequests.find(r => r.id === id);
          if (req) this.respondFriendRequest(id, true, req);
        };
      });
      container.querySelectorAll('.btn-req-reject').forEach(btn => {
        btn.onclick = () => {
          const id = btn.getAttribute('data-req-id');
          const req = this.friendRequests.find(r => r.id === id);
          if (req) this.respondFriendRequest(id, false, req);
        };
      });
    }

    escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }
  }

  window.socialService = new SocialService();

})(window);
