/**
 * =========================================================
 * FEATHER RUSH: SOCIAL, FRIENDLIST, CHAT, PROFILE & MULTIPLAYER INVITES
 * =========================================================
 */

(function(window) {
  'use strict';

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
            document.getElementById('fpAuraCount').textContent = `${(Array.isArray(u.aura) ? u.aura.length : 0)} Milik`;
          }
        } catch(e) {
          console.warn('[SocialService] Error fetching friend profile stats:', e.message);
        }
      }
    }

    // ==========================================
    // 4. 1-ON-1 DIRECT CHAT
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
              container.innerHTML = '<div style="text-align:center;color:#94a3b8;padding:40px 10px;">Belum ada pesan. Kirim salam atau emoji ke temanmu! 👋✨</div>';
              return;
            }
            snap.forEach(doc => {
              const msg = doc.data();
              const isMe = msg.senderKey === this.myKey;
              const timeStr = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
              
              const bubble = document.createElement('div');
              bubble.className = `chat-msg-bubble ${isMe ? 'outgoing' : 'incoming'}`;
              bubble.innerHTML = `
                <div>${this.escapeHtml(msg.text)}</div>
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
