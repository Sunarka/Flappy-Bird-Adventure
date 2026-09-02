/**
 * =========================================================
 * FEATHER RUSH: SOCIAL, FRIENDLIST, CHAT, PROFILE & MULTIPLAYER INVITES
 * =========================================================
 */

(function(window) {
  'use strict';

  // ==========================================
  // CUTE FEATHER RUSH BIRD EMOTES SVG CATALOG
  // ==========================================
  const CUTE_BIRD_EMOTES = [
    {
      id: 'bird_wave',
      title: 'Salam / Halo',
      render: (s = 36) => `
        <svg viewBox="0 0 36 36" width="${s}" height="${s}">
          <circle cx="18" cy="18" r="16" fill="#fef08a" stroke="#facc15" stroke-width="1.5"/>
          <ellipse cx="11" cy="17" rx="3" ry="4.5" fill="#facc15"/>
          <ellipse cx="27" cy="12" rx="4.5" ry="2.5" transform="rotate(-35 27 12)" fill="#eab308"/>
          <circle cx="14" cy="14" r="2.2" fill="#0f172a"/>
          <circle cx="14.8" cy="13.2" r="0.8" fill="#fff"/>
          <circle cx="21" cy="14" r="2.2" fill="#0f172a"/>
          <circle cx="21.8" cy="13.2" r="0.8" fill="#fff"/>
          <circle cx="11" cy="19" r="2" fill="#f43f5e" opacity="0.6"/>
          <circle cx="24" cy="19" r="2" fill="#f43f5e" opacity="0.6"/>
          <polygon points="17,17 21,17 19,21" fill="#f97316"/>
        </svg>
      `
    },
    {
      id: 'bird_cool',
      title: 'Keren / Sunglasses',
      render: (s = 36) => `
        <svg viewBox="0 0 36 36" width="${s}" height="${s}">
          <circle cx="18" cy="18" r="16" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5"/>
          <ellipse cx="8" cy="19" rx="3.5" ry="4" fill="#0284c7"/>
          <ellipse cx="28" cy="19" rx="3.5" ry="4" fill="#0284c7"/>
          <rect x="9" y="11" width="8" height="7" rx="2" fill="#0f172a"/>
          <rect x="19" y="11" width="8" height="7" rx="2" fill="#0f172a"/>
          <line x1="16" y1="13" x2="20" y2="13" stroke="#0f172a" stroke-width="2"/>
          <polygon points="16,20 21,20 18.5,23.5" fill="#f97316"/>
        </svg>
      `
    },
    {
      id: 'bird_rage',
      title: 'Ajak Perang / Duel',
      render: (s = 36) => `
        <svg viewBox="0 0 36 36" width="${s}" height="${s}">
          <circle cx="18" cy="18" r="16" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5"/>
          <path d="M4 14 Q18 9 32 14" stroke="#991b1b" stroke-width="4" fill="none"/>
          <polygon points="30,12 35,8 33,14" fill="#991b1b"/>
          <polygon points="12,13 17,16 12,16" fill="#0f172a"/>
          <polygon points="24,13 19,16 24,16" fill="#0f172a"/>
          <polygon points="16,18 20,18 18,22" fill="#ea580c"/>
        </svg>
      `
    },
    {
      id: 'bird_fire',
      title: 'Membara / Phoenix',
      render: (s = 36) => `
        <svg viewBox="0 0 36 36" width="${s}" height="${s}">
          <path d="M12 6 Q15 0 18 5 Q21 0 24 6" fill="#f59e0b"/>
          <circle cx="18" cy="19" r="15" fill="#f97316" stroke="#ea580c" stroke-width="1.5"/>
          <circle cx="13" cy="16" r="2.5" fill="#fef08a"/>
          <circle cx="23" cy="16" r="2.5" fill="#fef08a"/>
          <polygon points="16,19 20,19 18,23" fill="#facc15"/>
        </svg>
      `
    },
    {
      id: 'bird_love',
      title: 'Cinta / Heart Eyes',
      render: (s = 36) => `
        <svg viewBox="0 0 36 36" width="${s}" height="${s}">
          <circle cx="18" cy="18" r="16" fill="#f472b6" stroke="#db2777" stroke-width="1.5"/>
          <path d="M11 13 A 2 2 0 0 0 13 15 L 13 17 L 11 15 A 2 2 0 0 0 11 13" fill="#e11d48"/>
          <path d="M13 13 A 2 2 0 0 1 15 15 L 13 17 L 11 15 A 2 2 0 0 1 13 13" fill="#e11d48"/>
          <path d="M21 13 A 2 2 0 0 0 23 15 L 23 17 L 21 15 A 2 2 0 0 0 21 13" fill="#e11d48"/>
          <path d="M23 13 A 2 2 0 0 1 25 15 L 23 17 L 21 15 A 2 2 0 0 1 23 13" fill="#e11d48"/>
          <circle cx="9" cy="20" r="2.5" fill="#fda4af"/>
          <circle cx="27" cy="20" r="2.5" fill="#fda4af"/>
          <polygon points="16,19 20,19 18,22" fill="#fb923c"/>
        </svg>
      `
    },
    {
      id: 'bird_king',
      title: 'Juara / Crown King',
      render: (s = 36) => `
        <svg viewBox="0 0 36 36" width="${s}" height="${s}">
          <polygon points="12,10 14,4 18,7 22,4 24,10" fill="#facc15" stroke="#b45309" stroke-width="1"/>
          <circle cx="18" cy="20" r="15" fill="#fef08a" stroke="#eab308" stroke-width="1.5"/>
          <path d="M11 16 Q14 13 17 16" stroke="#0f172a" stroke-width="2" fill="none"/>
          <path d="M19 16 Q22 13 25 16" stroke="#0f172a" stroke-width="2" fill="none"/>
          <polygon points="16,19 20,19 18,23" fill="#f97316"/>
        </svg>
      `
    },
    {
      id: 'bird_cry',
      title: 'Nangis / Kalah',
      render: (s = 36) => `
        <svg viewBox="0 0 36 36" width="${s}" height="${s}">
          <circle cx="18" cy="18" r="16" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
          <path d="M11 16 Q14 13 16 16" stroke="#475569" stroke-width="2" fill="none"/>
          <path d="M20 16 Q22 13 25 16" stroke="#475569" stroke-width="2" fill="none"/>
          <ellipse cx="13" cy="22" rx="2" ry="4" fill="#38bdf8"/>
          <ellipse cx="23" cy="22" rx="2" ry="4" fill="#38bdf8"/>
          <polygon points="16,22 20,22 18,19" fill="#f97316"/>
        </svg>
      `
    },
    {
      id: 'bird_rich',
      title: 'Kaya / Golden Coin',
      render: (s = 36) => `
        <svg viewBox="0 0 36 36" width="${s}" height="${s}">
          <circle cx="18" cy="18" r="16" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
          <polygon points="13,12 14,14 16,14 14.5,15.5 15,17.5 13,16 11,17.5 11.5,15.5 10,14 12,14" fill="#eab308"/>
          <polygon points="23,12 24,14 26,14 24.5,15.5 25,17.5 23,16 21,17.5 21.5,15.5 20,14 22,14" fill="#eab308"/>
          <polygon points="16,18 20,18 18,21" fill="#f97316"/>
          <circle cx="18" cy="26" r="5" fill="#facc15" stroke="#b45309" stroke-width="1"/>
        </svg>
      `
    },
    {
      id: 'bird_rocket',
      title: 'Roket / Meluncur',
      render: (s = 36) => `
        <svg viewBox="0 0 36 36" width="${s}" height="${s}">
          <polygon points="8,26 3,32 12,29" fill="#ef4444"/>
          <circle cx="20" cy="16" r="15" fill="#a855f7" stroke="#7e22ce" stroke-width="1.5"/>
          <ellipse cx="23" cy="14" rx="7" ry="5" fill="#38bdf8" stroke="#0284c7" stroke-width="1"/>
          <polygon points="26,17 31,18 27,20" fill="#f97316"/>
        </svg>
      `
    },
    {
      id: 'bird_gg',
      title: 'GG / Jempol Mantap',
      render: (s = 36) => `
        <svg viewBox="0 0 36 36" width="${s}" height="${s}">
          <circle cx="18" cy="18" r="16" fill="#4ade80" stroke="#16a34a" stroke-width="1.5"/>
          <circle cx="13" cy="14" r="2.2" fill="#0f172a"/>
          <path d="M20 14 Q23 11 26 14" stroke="#0f172a" stroke-width="2.2" fill="none"/>
          <polygon points="16,18 20,18 18,22" fill="#f97316"/>
          <circle cx="27" cy="22" r="5" fill="#22c55e" stroke="#15803d" stroke-width="1"/>
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
