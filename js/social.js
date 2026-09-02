/**
 * =========================================================
 * FEATHER RUSH: SOCIAL, FRIENDLIST, CHAT, PROFILE & MULTIPLAYER INVITES
 * =========================================================
 */

(function(window) {
  'use strict';

  // ==========================================
  // CUTE FEATHER RUSH BIRD EMOTES SVG CATALOG (ULTRA HIGH POLISH)
  // ==========================================
  const CUTE_BIRD_EMOTES = [
    {
      id: 'bird_wave',
      title: 'Halo! / Waving',
      render: (s = 40) => `
        <svg viewBox="0 0 44 44" width="${s}" height="${s}" style="display:block">
          <defs>
            <linearGradient id="gWave" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient>
            <radialGradient id="gBlush"><stop offset="0%" stop-color="#fb7185" stop-opacity="0.85"/><stop offset="100%" stop-color="#fb7185" stop-opacity="0"/></radialGradient>
          </defs>
          <!-- Feather Tuft on Head -->
          <path d="M 21 4 Q 22 0 25 2 Q 23 6 22 8 Z" fill="#f59e0b"/>
          <path d="M 19 6 Q 19 1 22 4 Q 21 8 20 9 Z" fill="#eab308"/>
          <!-- Body -->
          <circle cx="22" cy="24" r="17" fill="url(#gWave)" stroke="#d97706" stroke-width="1.6"/>
          <!-- Left Wing -->
          <ellipse cx="7" cy="25" rx="4" ry="6" fill="#f59e0b"/>
          <!-- Waving Right Wing -->
          <g transform="translate(37, 16) rotate(-35)">
            <ellipse cx="0" cy="0" rx="6.5" ry="3.5" fill="#eab308" stroke="#d97706" stroke-width="1.2"/>
            <!-- Motion Lines -->
            <path d="M 4 -6 Q 7 -3 5 2" stroke="#38bdf8" stroke-width="1.4" fill="none" stroke-linecap="round"/>
            <path d="M 7 -4 Q 10 -1 8 4" stroke="#38bdf8" stroke-width="1.4" fill="none" stroke-linecap="round"/>
          </g>
          <!-- Kawaii Sparkling Eyes -->
          <ellipse cx="16" cy="20" rx="3.2" ry="4" fill="#0f172a"/>
          <circle cx="17.2" cy="18.2" r="1.3" fill="#ffffff"/>
          <circle cx="15.2" cy="21.5" r="0.7" fill="#ffffff"/>
          <ellipse cx="27" cy="20" rx="3.2" ry="4" fill="#0f172a"/>
          <circle cx="28.2" cy="18.2" r="1.3" fill="#ffffff"/>
          <circle cx="26.2" cy="21.5" r="0.7" fill="#ffffff"/>
          <!-- Soft Rosy Blush -->
          <circle cx="12" cy="25" r="4" fill="url(#gBlush)"/>
          <circle cx="31" cy="25" r="4" fill="url(#gBlush)"/>
          <!-- Happy Open Beak -->
          <path d="M 18 22 Q 21.5 19 25 22 Q 21.5 28 18 22 Z" fill="#ea580c"/>
          <polygon points="18.5,22 24.5,22 21.5,26" fill="#f97316"/>
          <path d="M 20 23.5 Q 21.5 25 23 23.5" fill="#fb7185"/>
        </svg>
      `
    },
    {
      id: 'bird_cool',
      title: 'Keren / Sunglasses',
      render: (s = 40) => `
        <svg viewBox="0 0 44 44" width="${s}" height="${s}" style="display:block">
          <defs>
            <linearGradient id="gCool" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/></linearGradient>
            <linearGradient id="gShades" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#020617"/></linearGradient>
          </defs>
          <path d="M 20 4 Q 22 0 24 3 Q 22 7 21 9 Z" fill="#0284c7"/>
          <circle cx="22" cy="24" r="17" fill="url(#gCool)" stroke="#0369a1" stroke-width="1.6"/>
          <ellipse cx="6" cy="26" rx="3.5" ry="5.5" fill="#0284c7"/>
          <ellipse cx="38" cy="26" rx="3.5" ry="5.5" fill="#0284c7"/>
          <!-- Dark Glossy Ray-Ban Sunglasses -->
          <rect x="9" y="15" width="11" height="9" rx="3" fill="url(#gShades)" stroke="#0f172a" stroke-width="1.2"/>
          <rect x="23" y="15" width="11" height="9" rx="3" fill="url(#gShades)" stroke="#0f172a" stroke-width="1.2"/>
          <line x1="19" y1="18" x2="24" y2="18" stroke="#0f172a" stroke-width="2.5"/>
          <!-- White Glare Lines on Shades -->
          <line x1="11" y1="17" x2="17" y2="22" stroke="#38bdf8" stroke-width="1.3" opacity="0.85" stroke-linecap="round"/>
          <line x1="25" y1="17" x2="31" y2="22" stroke="#38bdf8" stroke-width="1.3" opacity="0.85" stroke-linecap="round"/>
          <!-- Sparkle Star on Glass Rim -->
          <polygon points="34,14 35,16 37,17 35,18 34,20 33,18 31,17 33,16" fill="#fef08a"/>
          <!-- Smug Smirk Beak -->
          <polygon points="18.5,25 25.5,25 21,29" fill="#f97316" stroke="#c2410c" stroke-width="0.8"/>
        </svg>
      `
    },
    {
      id: 'bird_rage',
      title: 'Ajak Perang / Duel',
      render: (s = 40) => `
        <svg viewBox="0 0 44 44" width="${s}" height="${s}" style="display:block">
          <defs>
            <linearGradient id="gRage" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f87171"/><stop offset="100%" stop-color="#dc2626"/></linearGradient>
          </defs>
          <!-- Red Battle Bandana -->
          <path d="M 6 15 Q 22 7 38 15 L 37 19 Q 22 12 7 19 Z" fill="#991b1b"/>
          <polygon points="36,16 43,11 40,19" fill="#7f1d1d"/>
          <polygon points="37,18 42,22 39,20" fill="#991b1b"/>
          <!-- Body -->
          <circle cx="22" cy="24" r="17" fill="url(#gRage)" stroke="#991b1b" stroke-width="1.6"/>
          <!-- Angry Furrowed Eyebrows -->
          <line x1="12" y1="17" x2="20" y2="20" stroke="#450a0a" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="32" y1="17" x2="24" y2="20" stroke="#450a0a" stroke-width="2.5" stroke-linecap="round"/>
          <!-- Fierce Anime Eyes -->
          <polygon points="13,19 19,22 15,25" fill="#0f172a"/>
          <circle cx="16" cy="22" r="1" fill="#fef08a"/>
          <polygon points="31,19 25,22 29,25" fill="#0f172a"/>
          <circle cx="28" cy="22" r="1" fill="#fef08a"/>
          <!-- Steaming Angry Mark 💢 -->
          <path d="M 10 9 L 10 13 M 8 11 L 12 11" stroke="#facc15" stroke-width="2" stroke-linecap="round"/>
          <!-- Clenched Battle Beak -->
          <polygon points="18,24 26,24 22,29" fill="#ea580c" stroke="#7c2d12" stroke-width="1"/>
          <!-- Crossed Mini Swords -->
          <line x1="15" y1="34" x2="29" y2="34" stroke="#facc15" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `
    },
    {
      id: 'bird_love',
      title: 'Cinta / Heart Eyes',
      render: (s = 40) => `
        <svg viewBox="0 0 44 44" width="${s}" height="${s}" style="display:block">
          <defs>
            <linearGradient id="gLove" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f472b6"/><stop offset="100%" stop-color="#db2777"/></linearGradient>
          </defs>
          <!-- Floating Heart Bubbles -->
          <path d="M 33 6 A 2.2 2.2 0 0 0 35 9 L 35 11 L 33 9 A 2.2 2.2 0 0 0 33 6" fill="#f43f5e"/>
          <path d="M 35 6 A 2.2 2.2 0 0 1 37 9 L 35 11 L 33 9 A 2.2 2.2 0 0 1 35 6" fill="#f43f5e"/>
          <path d="M 8 9 A 1.8 1.8 0 0 0 10 11 L 10 13 L 8 11 A 1.8 1.8 0 0 0 8 9" fill="#fb7185"/>
          <path d="M 10 9 A 1.8 1.8 0 0 1 12 11 L 10 13 L 8 11 A 1.8 1.8 0 0 1 10 9" fill="#fb7185"/>
          <!-- Body -->
          <circle cx="22" cy="24" r="17" fill="url(#gLove)" stroke="#be185d" stroke-width="1.6"/>
          <!-- Heart Shaped Eyes -->
          <g transform="translate(16, 20)">
            <path d="M -3 -3 A 2.6 2.6 0 0 0 0 0 L 0 3 L -3 0 A 2.6 2.6 0 0 0 -3 -3" fill="#e11d48"/>
            <path d="M 0 -3 A 2.6 2.6 0 0 1 3 0 L 0 3 L -3 0 A 2.6 2.6 0 0 1 0 -3" fill="#e11d48"/>
            <circle cx="1.2" cy="-1.2" r="0.8" fill="#ffffff"/>
          </g>
          <g transform="translate(28, 20)">
            <path d="M -3 -3 A 2.6 2.6 0 0 0 0 0 L 0 3 L -3 0 A 2.6 2.6 0 0 0 -3 -3" fill="#e11d48"/>
            <path d="M 0 -3 A 2.6 2.6 0 0 1 3 0 L 0 3 L -3 0 A 2.6 2.6 0 0 1 0 -3" fill="#e11d48"/>
            <circle cx="1.2" cy="-1.2" r="0.8" fill="#ffffff"/>
          </g>
          <!-- Sweet Blush -->
          <circle cx="10" cy="26" r="3.5" fill="#fda4af" opacity="0.8"/>
          <circle cx="34" cy="26" r="3.5" fill="#fda4af" opacity="0.8"/>
          <!-- Beak -->
          <polygon points="19,23 25,23 22,27" fill="#fb923c" stroke="#c2410c" stroke-width="0.8"/>
        </svg>
      `
    },
    {
      id: 'bird_king',
      title: 'Juara / Crown King',
      render: (s = 40) => `
        <svg viewBox="0 0 44 44" width="${s}" height="${s}" style="display:block">
          <defs>
            <linearGradient id="gKing" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fde047"/><stop offset="100%" stop-color="#ca8a04"/></linearGradient>
            <linearGradient id="gCrown" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#d97706"/></linearGradient>
          </defs>
          <!-- Royal 3D Golden Crown with Gems -->
          <polygon points="13,13 15,4 22,9 29,4 31,13" fill="url(#gCrown)" stroke="#78350f" stroke-width="1.2"/>
          <circle cx="15" cy="4" r="1.5" fill="#ef4444"/>
          <circle cx="22" cy="9" r="1.8" fill="#3b82f6"/>
          <circle cx="29" cy="4" r="1.5" fill="#10b981"/>
          <!-- Body -->
          <circle cx="22" cy="25" r="16" fill="url(#gKing)" stroke="#a16207" stroke-width="1.6"/>
          <!-- Proud Left Eye -->
          <ellipse cx="16" cy="22" rx="3.2" ry="4" fill="#0f172a"/>
          <circle cx="17.2" cy="20.2" r="1.3" fill="#ffffff"/>
          <!-- Playful Wink Right Eye -->
          <path d="M 25 22 Q 28 18 31 22" stroke="#0f172a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
          <!-- Proud Champion Smile Beak -->
          <polygon points="18,24 26,24 22,29" fill="#f97316" stroke="#c2410c" stroke-width="0.8"/>
          <!-- Golden Medal Sparkles -->
          <polygon points="9,30 10,32 12,33 10,34 9,36 8,34 6,33 8,32" fill="#facc15"/>
        </svg>
      `
    },
    {
      id: 'bird_cry',
      title: 'Nangis / Kalah',
      render: (s = 40) => `
        <svg viewBox="0 0 44 44" width="${s}" height="${s}" style="display:block">
          <defs>
            <linearGradient id="gCry" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e0f2fe"/><stop offset="100%" stop-color="#7dd3fc"/></linearGradient>
          </defs>
          <!-- Body -->
          <circle cx="22" cy="24" r="17" fill="url(#gCry)" stroke="#0284c7" stroke-width="1.6"/>
          <!-- Weeping Closed Eyes -->
          <path d="M 12 20 Q 16 16 19 20" stroke="#0369a1" stroke-width="2.6" fill="none" stroke-linecap="round"/>
          <path d="M 25 20 Q 28 16 32 20" stroke="#0369a1" stroke-width="2.6" fill="none" stroke-linecap="round"/>
          <!-- Dual Gushing Waterfalls of Glowing Tears -->
          <path d="M 13 21 Q 11 28 12 36 Q 14 38 15 36 Q 16 28 14 21 Z" fill="#38bdf8" opacity="0.9"/>
          <path d="M 31 21 Q 33 28 32 36 Q 30 38 29 36 Q 28 28 30 21 Z" fill="#38bdf8" opacity="0.9"/>
          <!-- Trembling Sad Mouth / Open Beak -->
          <path d="M 18 24 Q 22 21 26 24 L 25 28 Q 22 30 19 28 Z" fill="#ea580c"/>
          <ellipse cx="22" cy="27" rx="2" ry="1.5" fill="#f43f5e"/>
        </svg>
      `
    },
    {
      id: 'bird_star',
      title: 'Kagum / Star Eyes',
      render: (s = 40) => `
        <svg viewBox="0 0 44 44" width="${s}" height="${s}" style="display:block">
          <defs>
            <linearGradient id="gStar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient>
          </defs>
          <circle cx="22" cy="24" r="17" fill="url(#gStar)" stroke="#d97706" stroke-width="1.6"/>
          <!-- Big Glowing Golden Star Eyes -->
          <g transform="translate(16, 20)">
            <polygon points="0,-4.5 1.4,-1.4 4.5,0 1.4,1.4 0,4.5 -1.4,1.4 -4.5,0 -1.4,-1.4" fill="#facc15" stroke="#b45309" stroke-width="0.8"/>
            <circle cx="0" cy="0" r="1" fill="#ffffff"/>
          </g>
          <g transform="translate(28, 20)">
            <polygon points="0,-4.5 1.4,-1.4 4.5,0 1.4,1.4 0,4.5 -1.4,1.4 -4.5,0 -1.4,-1.4" fill="#facc15" stroke="#b45309" stroke-width="0.8"/>
            <circle cx="0" cy="0" r="1" fill="#ffffff"/>
          </g>
          <!-- Wide Joyful Open Beak :D -->
          <path d="M 17 23 Q 22 20 27 23 Q 22 31 17 23 Z" fill="#ea580c"/>
          <path d="M 19 24 Q 22 29 25 24" fill="#fb7185"/>
          <!-- Sparkle Cheeks -->
          <circle cx="11" cy="26" r="3" fill="#fb7185" opacity="0.6"/>
          <circle cx="33" cy="26" r="3" fill="#fb7185" opacity="0.6"/>
        </svg>
      `
    },
    {
      id: 'bird_fire',
      title: 'Membara / Phoenix',
      render: (s = 40) => `
        <svg viewBox="0 0 44 44" width="${s}" height="${s}" style="display:block">
          <defs>
            <linearGradient id="gFire" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fdba74"/><stop offset="100%" stop-color="#ea580c"/></linearGradient>
            <linearGradient id="gFlames" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#dc2626"/></linearGradient>
          </defs>
          <!-- Spiky Blazing Fire Crest -->
          <polygon points="12,12 15,2 22,7 29,2 32,12" fill="url(#gFlames)"/>
          <polygon points="16,10 22,4 28,10" fill="#fef08a"/>
          <!-- Body -->
          <circle cx="22" cy="25" r="16" fill="url(#gFire)" stroke="#c2410c" stroke-width="1.6"/>
          <!-- Piercing Cyan Glow Energy Eyes -->
          <circle cx="16" cy="22" r="3.5" fill="#06b6d4"/>
          <circle cx="16" cy="22" r="1.8" fill="#0f172a"/>
          <circle cx="17" cy="21" r="0.8" fill="#ffffff"/>
          <circle cx="28" cy="22" r="3.5" fill="#06b6d4"/>
          <circle cx="28" cy="22" r="1.8" fill="#0f172a"/>
          <circle cx="29" cy="21" r="0.8" fill="#ffffff"/>
          <!-- Golden Sharp Beak -->
          <polygon points="18,24 26,24 22,29" fill="#facc15" stroke="#ca8a04" stroke-width="0.8"/>
        </svg>
      `
    },
    {
      id: 'bird_rich',
      title: 'Kaya / Koin Emas',
      render: (s = 40) => `
        <svg viewBox="0 0 44 44" width="${s}" height="${s}" style="display:block">
          <defs>
            <linearGradient id="gRich" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#eab308"/></linearGradient>
            <linearGradient id="gCoin" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#ca8a04"/></linearGradient>
          </defs>
          <circle cx="22" cy="23" r="16" fill="url(#gRich)" stroke="#a16207" stroke-width="1.6"/>
          <!-- Sparkle Dollar / Star Eyes -->
          <g transform="translate(16, 18)">
            <polygon points="0,-3.5 1,-1 3.5,0 1,1 0,3.5 -1,1 -3.5,0 -1,-1" fill="#ca8a04"/>
          </g>
          <g transform="translate(28, 18)">
            <polygon points="0,-3.5 1,-1 3.5,0 1,1 0,3.5 -1,1 -3.5,0 -1,-1" fill="#ca8a04"/>
          </g>
          <polygon points="19,21 25,21 22,25" fill="#f97316"/>
          <!-- Hugging Huge Gold Coin with Star -->
          <circle cx="22" cy="32" r="8" fill="url(#gCoin)" stroke="#78350f" stroke-width="1.3"/>
          <polygon points="22,27 23.5,30.5 27,31 24.5,33 25.5,36.5 22,34.5 18.5,36.5 19.5,33 17,31 20.5,30.5" fill="#fef08a"/>
        </svg>
      `
    },
    {
      id: 'bird_gg',
      title: 'GG / Mantap!',
      render: (s = 40) => `
        <svg viewBox="0 0 44 44" width="${s}" height="${s}" style="display:block">
          <defs>
            <linearGradient id="gGG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#86efac"/><stop offset="100%" stop-color="#22c55e"/></linearGradient>
          </defs>
          <circle cx="20" cy="24" r="16" fill="url(#gGG)" stroke="#15803d" stroke-width="1.6"/>
          <!-- Happy Anime Left Eye -->
          <ellipse cx="14" cy="20" rx="3.2" ry="4" fill="#0f172a"/>
          <circle cx="15.2" cy="18.2" r="1.3" fill="#ffffff"/>
          <!-- Wink Right Eye -->
          <path d="M 23 20 Q 26 16 29 20" stroke="#0f172a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
          <!-- Cheerful Beak -->
          <polygon points="17,23 23,23 20,27" fill="#f97316" stroke="#c2410c" stroke-width="0.8"/>
          <!-- Big Cartoon Thumbs Up Badge -->
          <g transform="translate(33, 26)">
            <circle cx="0" cy="0" r="7" fill="#fef08a" stroke="#d97706" stroke-width="1.4"/>
            <text x="0" y="3.5" font-size="9" font-weight="900" fill="#78350f" text-anchor="middle">👍</text>
          </g>
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

    setAccount(primaryKey, profile) {
      if (!this.db && typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
        this.db = firebase.firestore();
        this.isInitialized = true;
      }
      this.myKey = primaryKey;
      this.myProfile = profile || {};
      if (this.db && this.myKey) {
        this.startListeners();
        this.refreshRequests();
      }
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
        return '🦅';
      };

      // Set initial data
      document.getElementById('fpAvatarBox').innerHTML = getAv(friend.avatar || 'chick_yellow', 52);
      document.getElementById('fpName').textContent = friend.name || 'Gamer';
      document.getElementById('fpRankBadge').textContent = `🏆 ${friend.tier || 'BRONZE I'}`;
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
            window.multiplayerEngine.createRoom(roomCode, hostData);
            await this.sendRoomInvite(friend.friendKey, roomCode);
            inviteBtn.textContent = 'Terkirim! ✅';
            setTimeout(() => { inviteBtn.textContent = '⚔️ Ajak Main'; }, 2000);
            
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
            document.getElementById('fpCoins').textContent = `${data.coins || 0} 🪙`;

            // Loadout
            const l = data.loadout || {};
            document.getElementById('fpEquippedBird').textContent = l.bird ? l.bird.toUpperCase() : 'CLASSIC';
            document.getElementById('fpEquippedPet').textContent = l.pet ? l.pet.toUpperCase() : 'NONE';
            document.getElementById('fpEquippedHat').textContent = l.hat ? l.hat.toUpperCase() : 'NONE';
            document.getElementById('fpEquippedAura').textContent = l.aura ? l.aura.toUpperCase() : 'NONE';

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
              container.innerHTML = '<div style="text-align:center;color:#94a3b8;padding:40px 10px;">Belum ada pesan. Kirim stiker burung imut ke temanmu! 🐥✨</div>';
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
        return '🦅';
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
          <button class="invite-btn-accept" data-code="${invite.roomCode}">🎮 GABUNG SEKARANG</button>
          <button class="invite-btn-decline">✕ NANTI</button>
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

    renderFriendsList() {
      const container = document.getElementById('socialFriendsList');
      if (!container) return;

      if (this.friends.length === 0) {
        container.innerHTML = `
          <div class="social-empty-state">
            <div class="social-empty-icon">👥</div>
            <div>Belum ada teman. Cari teman baru di tab <b>Cari Teman</b>!</div>
          </div>
        `;
        return;
      }

      const getAv = (id, s) => {
        if (typeof window.getCuteAvatarSvg === 'function') return window.getCuteAvatarSvg(id, s);
        return '🦅';
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
                <div class="social-player-tier">🏆 ${f.tier || 'BRONZE I'}</div>
              </div>
            </div>
            <div class="social-card-actions">
              <button class="social-action-btn btn-dm-chat" title="Kirim Chat" data-key="${f.friendKey}">💬</button>
              <button class="social-action-btn success btn-invite-room" title="Ajak Main Multiplayer" data-key="${f.friendKey}">⚔️ Ajak</button>
              <button class="social-action-btn danger btn-remove-friend" title="Hapus Teman" data-key="${f.friendKey}">✕</button>
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
            window.multiplayerEngine.createRoom(roomCode, hostData);
            await this.sendRoomInvite(key, roomCode);
            btn.textContent = 'Terkirim! ✅';
            setTimeout(() => { btn.textContent = '⚔️ Ajak'; }, 2000);
            
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
            <div class="social-empty-icon">📬</div>
            <div>Tidak ada permintaan pertemanan masuk.</div>
          </div>
        `;
        return;
      }

      const getAv = (id, s) => {
        if (typeof window.getCuteAvatarSvg === 'function') return window.getCuteAvatarSvg(id, s);
        return '🦅';
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
                <div class="social-player-tier">🏆 ${req.fromTier || 'BRONZE I'}</div>
              </div>
            </div>
            <div class="social-card-actions">
              <button class="social-action-btn success btn-req-accept" data-req-id="${req.id}">✓ Terima</button>
              <button class="social-action-btn danger btn-req-reject" data-req-id="${req.id}">✕ Tolak</button>
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
