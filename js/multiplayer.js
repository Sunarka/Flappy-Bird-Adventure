/**
 * Flappy Bird Sky Challenge - Cloudflare Real-Time Multiplayer Client Engine
 * Supports Cloudflare Workers WebSocket Rooms, Quick Matchmaking, BroadcastChannel local fallback,
 * and high-frequency ghost rival state interpolation.
 */

(function(window) {
  'use strict';

  // Polyfill roundRect untuk CanvasRenderingContext2D jika belum didukung
  if(typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
      if (!radii) radii = 0;
      let r = 0;
      if (typeof radii === 'number') r = radii;
      else if (Array.isArray(radii) && radii.length) r = radii[0];
      r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
      this.moveTo(x + r, y);
      this.arcTo(x + w, y, x + w, y + h, r);
      this.arcTo(x + w, y + h, x, y + h, r);
      this.arcTo(x, y + h, x, y, r);
      this.arcTo(x, y, x + w, y, r);
      this.closePath();
      return this;
    };
  }

  // Default Cloudflare Worker WebSocket Relay URL (lappy-sky workers subdomain)
  const DEFAULT_CF_WORKER_WS = 'wss://flappy-bird-multiplayer.lappy-sky.workers.dev';

  class FlappyMultiplayer {
    constructor() {
      this.wsUrl = localStorage.getItem('skyFlappyCFWorkerUrl') || DEFAULT_CF_WORKER_WS;
      this.ws = null;
      this.isConnected = false;
      this.isConnecting = false;
      this.ping = 0;
      this.lastPingTime = 0;
      
      this.localPlayerId = 'P-' + Math.random().toString(36).substring(2, 8);
      this.currentRoom = null; // { roomId, code, seed, isHost, playersList }
      this.opponents = new Map(); // id -> { id, name, avatar, skin, y, vy, rot, score, isAlive, isDashing, targetY, lastUpdate }
      
      this.gameMode = 'survival'; // 'survival' | 'race'
      this.maxPlayers = 2; // 2 | 3 | 4
      this.raceTargetScore = 30; // Target score for Race mode
      
      this.matchStatus = 'IDLE'; // IDLE, QUEUED, IN_ROOM, COUNTDOWN, PLAYING, ENDED
      this.eventListeners = new Map();

      // Seeded Random Number Generator for identical obstacles
      this.currentSeed = 12345;
      this.prngState = 12345;

      // Local BroadcastChannel fallback for multi-tab instant testing
      this.bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('flappy_mp_local_bus') : null;
      this.initBroadcastChannel();
      this.pendingQueue = [];
      this.connect();
    }

    on(event, callback) {
      if (!this.eventListeners.has(event)) {
        this.eventListeners.set(event, []);
      }
      this.eventListeners.get(event).push(callback);
    }

    emit(event, data) {
      if (this.eventListeners.has(event)) {
        this.eventListeners.get(event).forEach(cb => {
          try { cb(data); } catch(e) { console.error('[MP Event Error]:', e); }
        });
      }
    }

    // Seeded Random helper
    setSeed(seed) {
      this.currentSeed = seed || 12345;
      this.prngState = this.currentSeed;
    }

    random() {
      // Mulberry32 fast PRNG
      let t = this.prngState += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    randomRange(min, max) {
      return min + this.random() * (max - min);
    }

    connect(profile) {
      if (profile) {
        this.myProfile = { ...profile, id: this.localPlayerId };
      }
      
      if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
        if (this.ws.readyState === WebSocket.OPEN && profile) {
           this.send({ type: 'UPDATE_PROFILE', profile: this.myProfile });
        }
        return;
      }

      this.isConnecting = true;
      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          this.isConnected = true;
          this.isConnecting = false;
          this.startPingInterval();
          this.emit('connected', { isLocal: false });

          // Send initial profile
          if (profile || this.myProfile) {
            this.send({ type: 'UPDATE_PROFILE', profile: profile || this.myProfile });
          }

          // Flush any pending queue
          if (this.pendingQueue && this.pendingQueue.length > 0) {
            const queue = [...this.pendingQueue];
            this.pendingQueue = [];
            queue.forEach(pkt => this.send(pkt));
          }
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch(e) {
            console.warn('[MP Parse Error]:', e);
          }
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.isConnecting = false;
          this.emit('disconnected', { reason: 'closed' });
        };

        this.ws.onerror = () => {
          this.isConnected = false;
          this.isConnecting = false;
          this.emit('connected', { isLocal: true });
        };
      } catch (err) {
        this.isConnected = false;
        this.isConnecting = false;
        this.emit('connected', { isLocal: true });
      }
    }

    startPingInterval() {
      if (this.pingTimer) clearInterval(this.pingTimer);
      this.pingTimer = setInterval(() => {
        if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.lastPingTime = Date.now();
          this.send({ type: 'PING' });
        }
      }, 5000);
    }

    send(data) {
      if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(data));
      } else if (this.isConnecting) {
        if (!this.pendingQueue) this.pendingQueue = [];
        this.pendingQueue.push(data);
      } else if (this.bc) {
        // BroadcastChannel Local Relay Fallback
        this.handleLocalBroadcastSend(data);
      }
    }

    initBroadcastChannel() {
      if (!this.bc) return;
      this.bc.onmessage = (event) => {
        const data = event.data;
        if (!data || data.senderId === this.localPlayerId) return;
        this.handleLocalBroadcastReceive(data);
      };
    }

    handleLocalBroadcastSend(data) {
      if (!this.bc) return;
      const packet = { ...data, senderId: this.localPlayerId, time: Date.now() };
      this.bc.postMessage(packet);
    }

    handleLocalBroadcastReceive(data) {
      // Simulate room server over local BroadcastChannel
      const type = data.type;
      if (type === 'BC_ROOM_ANNOUNCE' && this.matchStatus === 'JOINING' && this.pendingJoinCode === data.code) {
        this.pendingJoinCode = null;
        this.currentRoom = {
          roomId: data.roomId,
          code: data.code,
          seed: data.seed,
          isHost: false,
          playersList: [data.hostProfile, this.myProfile]
        };
        this.matchStatus = 'IN_ROOM';
        this.setSeed(data.seed);
        this.opponents.set(data.hostProfile.id, {
          id: data.hostProfile.id,
          name: data.hostProfile.name,
          avatar: data.hostProfile.avatar,
          skin: data.hostProfile.skin,
          y: 250,
          vy: 0,
          rot: 0,
          score: 0,
          isAlive: true,
          isDashing: false,
          targetY: 250,
          lastUpdate: Date.now()
        });

        this.send({
          type: 'BC_PLAYER_JOINED',
          roomId: data.roomId,
          code: data.code,
          playerProfile: this.myProfile
        });

        this.emit('room_joined', this.currentRoom);
      } else if (type === 'BC_PLAYER_JOINED' && this.currentRoom && this.currentRoom.code === data.code && this.currentRoom.isHost) {
        this.currentRoom.playersList = [this.myProfile, data.playerProfile];
        this.opponents.set(data.playerProfile.id, {
          id: data.playerProfile.id,
          name: data.playerProfile.name,
          avatar: data.playerProfile.avatar,
          skin: data.playerProfile.skin,
          y: 250,
          vy: 0,
          rot: 0,
          score: 0,
          isAlive: true,
          isDashing: false,
          targetY: 250,
          lastUpdate: Date.now()
        });
        this.emit('player_joined', { player: data.playerProfile, playersList: this.currentRoom.playersList });
      } else if (type === 'BC_PLAYER_READY' && this.currentRoom && this.currentRoom.roomId === data.roomId) {
        this.emit('player_ready_status', { playerId: data.playerId, isReady: !!data.isReady });
      } else if (type === 'BC_GAME_START' && this.currentRoom && this.currentRoom.roomId === data.roomId) {
        this.setSeed(data.seed);
        this.matchStatus = 'COUNTDOWN';
        this.emit('game_starting', { seed: data.seed, countdown: data.countdown || 3 });
      } else if (type === 'BC_OPPONENT_STATE' && this.currentRoom && this.currentRoom.roomId === data.roomId) {
        this.updateOpponentState(data);
      } else if (type === 'BC_OPPONENT_DIED' && this.currentRoom && this.currentRoom.roomId === data.roomId) {
        this.emit('opponent_died', { playerId: data.playerId, finalScore: data.finalScore });
      }
    }

    handleMessage(data) {
      const type = data.type;
      switch (type) {
        case 'PONG': {
          this.ping = Date.now() - this.lastPingTime;
          this.emit('ping', this.ping);
          break;
        }

        case 'ROOM_CREATED': {
          this.currentRoom = {
            roomId: data.roomId,
            code: data.code,
            seed: data.seed,
            isHost: true,
            playersList: data.playersList
          };
          this.matchStatus = 'IN_ROOM';
          this.setSeed(data.seed);
          this.opponents.clear();
          this.emit('room_created', this.currentRoom);
          break;
        }

        case 'ROOM_JOINED': {
          this.currentRoom = {
            roomId: data.roomId,
            code: data.code,
            seed: data.seed,
            isHost: false,
            playersList: data.playersList
          };
          this.matchStatus = 'IN_ROOM';
          this.setSeed(data.seed);
          this.opponents.clear();

          // Add host as opponent
          data.playersList.forEach(p => {
            if (p.id !== this.localPlayerId) {
              this.opponents.set(p.id, {
                id: p.id,
                name: p.name,
                avatar: p.avatar,
                skin: p.skin,
                y: 250,
                vy: 0,
                rot: 0,
                score: 0,
                isAlive: true,
                isDashing: false,
                targetY: 250,
                lastUpdate: Date.now()
              });
            }
          });

          this.emit('room_joined', this.currentRoom);
          break;
        }

        case 'PLAYER_JOINED': {
          if (this.currentRoom) {
            this.currentRoom.playersList = data.playersList;
            const p = data.player;
            if (p && p.id !== this.localPlayerId) {
              this.opponents.set(p.id, {
                id: p.id,
                name: p.name,
                avatar: p.avatar,
                skin: p.skin,
                y: 250,
                vy: 0,
                rot: 0,
                score: 0,
                isAlive: true,
                isDashing: false,
                targetY: 250,
                lastUpdate: Date.now()
              });
            }
          }
          this.emit('player_joined', data);
          break;
        }

        case 'PLAYER_LEFT': {
          if (this.currentRoom) {
            this.currentRoom.playersList = data.playersList;
            if (data.playerId) this.opponents.delete(data.playerId);
            if (data.newHostId === this.localPlayerId) this.currentRoom.isHost = true;
          }
          this.emit('player_left', data);
          break;
        }

        case 'MATCH_FOUND': {
          this.gameMode = data.gameMode || 'survival';
          this.maxPlayers = data.maxPlayers || (data.playersList ? data.playersList.length : 2);
          this.currentRoom = {
            roomId: data.roomId,
            code: data.code,
            seed: data.seed,
            gameMode: this.gameMode,
            maxPlayers: this.maxPlayers,
            isHost: data.playersList[0]?.id === this.localPlayerId,
            playersList: data.playersList
          };
          this.matchStatus = 'COUNTDOWN';
          this.setSeed(data.seed);
          this.opponents.clear();

          const oppList = data.opponents || data.playersList.filter(p => p.id !== this.localPlayerId);
          oppList.forEach(p => {
            if (p.id !== this.localPlayerId) {
              this.opponents.set(p.id, {
                id: p.id,
                name: p.name,
                avatar: p.avatar,
                skin: p.skin,
                hat: p.hat || 'none',
                outfit: p.outfit || 'none',
                tier: p.tier || 'GOLD',
                y: 250,
                vy: 0,
                rot: 0,
                score: 0,
                lives: 3,
                maxLives: 3,
                isAlive: true,
                isDashing: false,
                targetY: 250,
                lastUpdate: Date.now()
              });
            }
          });

          this.emit('match_found', {
            ...data,
            gameMode: this.gameMode,
            maxPlayers: this.maxPlayers,
            opponents: Array.from(this.opponents.values())
          });
          break;
        }

        case 'QUEUED':
        case 'QUEUED_FOR_MATCH': {
          this.matchStatus = 'QUEUED';
          this.emit('queued', data);
          break;
        }

        case 'MATCH_CANCELLED': {
          this.matchStatus = 'IDLE';
          if (this.botFallbackTimer) {
            clearTimeout(this.botFallbackTimer);
            this.botFallbackTimer = null;
          }
          this.emit('match_cancelled');
          break;
        }

        case 'PLAYER_READY_STATUS': {
          if (this.currentRoom && this.currentRoom.playersList) {
            const p = this.currentRoom.playersList.find(pl => pl.id === data.playerId);
            if (p) p.isReady = data.isReady;
          }
          if (this.opponents.has(data.playerId)) {
            this.opponents.get(data.playerId).isReady = data.isReady;
          }
          this.emit('player_ready_status', data);
          break;
        }

        case 'GAME_STARTING': {
          this.matchStatus = 'COUNTDOWN';
          this.setSeed(data.seed);
          this.emit('game_starting', data);
          break;
        }

        case 'OPPONENT_STATE': {
          this.updateOpponentState(data);
          break;
        }

        case 'OPPONENT_DIED': {
          this.emit('opponent_died', data);
          break;
        }

        case 'ERROR': {
          this.emit('error', data.message || 'Terjadi kesalahan pada multiplayer');
          break;
        }
      }
    }

    updateOpponentState(data) {
      if (!data || data.playerId === this.localPlayerId) return;

      let op = this.opponents.get(data.playerId);
      if (!op) {
        const rivalProfile = this.currentRoom?.playersList?.find(p => p.id !== this.localPlayerId) || {};
        op = {
          id: data.playerId,
          name: rivalProfile.name || 'Rival',
          avatar: rivalProfile.avatar || 'chick_yellow',
          skin: rivalProfile.skin || 'classic',
          hat: rivalProfile.hat || 'none',
          outfit: rivalProfile.outfit || 'none',
          tier: rivalProfile.tier || 'GOLD',
          y: data.y,
          vy: data.vy,
          rot: data.rot,
          score: data.score || 0,
          lives: data.lives !== undefined ? data.lives : 3,
          isAlive: data.isAlive !== false,
          isDashing: !!data.isDashing,
          targetY: data.y,
          lastUpdate: Date.now()
        };
        this.opponents.set(data.playerId, op);
      } else {
        op.targetY = data.y;
        op.vy = data.vy;
        op.rot = data.rot;
        op.score = data.score || 0;
        if (data.lives !== undefined) op.lives = data.lives;
        op.isAlive = data.isAlive !== false;
        op.isDashing = !!data.isDashing;
        op.lastUpdate = Date.now();
      }
    }

    initFirestore() {
      if (typeof firebase !== 'undefined' && firebase.firestore) {
        try {
          this.fs = firebase.firestore();
        } catch(_) {}
      }
    }

    listenToRoomDoc(docRef) {
      if (this.roomUnsubscribe) {
        this.roomUnsubscribe();
        this.roomUnsubscribe = null;
      }
      this.roomUnsubscribe = docRef.onSnapshot(snap => {
        if (!snap.exists) return;
        const data = snap.data();
        const isHost = this.currentRoom && this.currentRoom.isHost;

        // 1. Guest Joined Event
        if (isHost && data.guest && (!this.currentRoom.playersList || this.currentRoom.playersList.length < 2)) {
          this.currentRoom.playersList = [this.myProfile, data.guest];
          this.opponents.set(data.guest.id, {
            id: data.guest.id,
            name: data.guest.name,
            avatar: data.guest.avatar,
            skin: data.guest.skin,
            hat: data.guest.hat,
            outfit: data.guest.outfit,
            tier: data.guest.tier || 'GOLD',
            y: 150, vy: 0, rot: 0, score: 0, lives: 3, isAlive: true, isDashing: false, targetY: 150, lastUpdate: Date.now()
          });
          this.emit('player_joined', { player: data.guest, playersList: this.currentRoom.playersList });
        }

        // 1.5 Guest Ready Status Sync
        if (data.guestReady !== undefined) {
          this.emit('player_ready_status', { isReady: !!data.guestReady });
        }

        // 2. Game Starting Event
        if (data.status === 'PLAYING' && this.matchStatus !== 'COUNTDOWN' && this.matchStatus !== 'PLAYING') {
          this.setSeed(data.seed);
          this.matchStatus = 'COUNTDOWN';
          const rival = isHost ? data.guest : data.host;
          this.emit('game_starting', {
            seed: data.seed,
            countdown: 3,
            opponent: rival,
            playersList: [data.host, data.guest]
          });
        }

        // 3. Opponent State Sync
        const opponentState = isHost ? data.guestState : data.hostState;
        if (opponentState && opponentState.time && (this.matchStatus === 'PLAYING' || this.matchStatus === 'COUNTDOWN')) {
          this.updateOpponentState(opponentState);
        }

        // 4. Opponent Died Event
        const opponentDeath = isHost ? data.guestDeath : data.hostDeath;
        if (opponentDeath && opponentDeath.time && this.matchStatus === 'PLAYING') {
          this.emit('opponent_died', { playerId: opponentDeath.playerId, finalScore: opponentDeath.finalScore });
        }
      }, err => {
        console.warn('[MP Firestore Listener Warning]:', err);
      });
    }

    // Public Actions
    createRoom(profile) {
      this.myProfile = { ...profile, id: this.localPlayerId };
      this.initFirestore();

      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const seed = Math.floor(Math.random() * 1000000);
      this.currentRoom = {
        roomId: 'room_' + code,
        code,
        seed,
        isHost: true,
        playersList: [this.myProfile]
      };
      this.matchStatus = 'IN_ROOM';
      this.setSeed(seed);
      this.opponents.clear();

      // 1. Sync via Firestore for Universal Instant Device Pairing
      if (this.fs) {
        const roomDoc = {
          code,
          roomId: 'room_' + code,
          seed,
          host: this.myProfile,
          guest: null,
          status: 'LOBBY',
          createdAt: Date.now(),
          lastActive: Date.now()
        };
        const docRef = this.fs.collection('flappy_mp_rooms').doc(code);
        docRef.set(roomDoc).catch(e => console.warn('[Firestore MP Create Error]:', e));
        this.listenToRoomDoc(docRef);
      }

      // 2. Sync via Cloudflare Worker
      if (this.isConnected) {
        this.send({ type: 'CREATE_ROOM', profile: this.myProfile, code });
      }

      // 3. Local Broadcast Fallback
      if (this.bc) {
        this.bc.postMessage({
          type: 'BC_ROOM_ANNOUNCE',
          roomId: this.currentRoom.roomId,
          code,
          seed,
          hostProfile: this.myProfile
        });
      }

      this.emit('room_created', this.currentRoom);
    }

    joinRoom(code, profile) {
      this.myProfile = { ...profile, id: this.localPlayerId };
      this.initFirestore();

      const cleanCode = (code || '').toString().trim();
      if (!cleanCode) {
        this.emit('error', 'Masukkan 4-digit kode room!');
        return;
      }

      this.matchStatus = 'JOINING';

      // 1. Check & Join via Firestore
      if (this.fs) {
        const docRef = this.fs.collection('flappy_mp_rooms').doc(cleanCode);
        docRef.get().then(doc => {
          if (doc.exists) {
            const data = doc.data();
            if (data.status === 'LOBBY') {
              this.currentRoom = {
                roomId: data.roomId,
                code: cleanCode,
                seed: data.seed,
                isHost: false,
                playersList: [data.host, this.myProfile]
              };
              this.matchStatus = 'IN_ROOM';
              this.setSeed(data.seed);
              this.opponents.set(data.host.id, {
                id: data.host.id,
                name: data.host.name,
                avatar: data.host.avatar,
                skin: data.host.skin,
                hat: data.host.hat,
                outfit: data.host.outfit,
                tier: data.host.tier || 'GOLD',
                y: 150, vy: 0, rot: 0, score: 0, lives: 3, isAlive: true, isDashing: false, targetY: 150, lastUpdate: Date.now()
              });
              docRef.update({
                guest: this.myProfile,
                lastActive: Date.now()
              });
              this.listenToRoomDoc(docRef);
              this.emit('room_joined', this.currentRoom);
              return;
            } else {
              this.emit('error', 'Room #' + cleanCode + ' sudah memulai pertandingan!');
              return;
            }
          }
          // If not found in Firestore, fallback to Cloudflare/Local
          this.fallbackJoin(cleanCode);
        }).catch(() => {
          this.fallbackJoin(cleanCode);
        });
      } else {
        this.fallbackJoin(cleanCode);
      }
    }

    fallbackJoin(cleanCode) {
      if (this.isConnected) {
        this.send({ type: 'JOIN_ROOM', code: cleanCode, profile: this.myProfile });
      } else {
        this.pendingJoinCode = cleanCode;
        if (this.bc) {
          this.bc.postMessage({
            type: 'BC_SEEK_ROOM',
            code: cleanCode,
            seekerProfile: this.myProfile
          });
        }
        setTimeout(() => {
          if (this.matchStatus === 'JOINING') {
            this.matchStatus = 'IDLE';
            this.emit('error', 'Room #' + cleanCode + ' tidak ditemukan! Pastikan kode benar.');
          }
        }, 1500);
      }
    }

    quickMatch(profile, gameMode = 'survival', maxPlayers = 2) {
      if (this.currentRoom) {
        this.leaveRoom();
      }
      if (this.botFallbackTimer) {
        clearTimeout(this.botFallbackTimer);
        this.botFallbackTimer = null;
      }
      this.gameMode = gameMode || 'survival';
      this.maxPlayers = Number(maxPlayers) || 2;
      this.myProfile = { ...profile, id: this.localPlayerId };
      this.matchStatus = 'QUEUED';
      this.emit('queued', { message: `Mencari ${this.maxPlayers} pemain mode ${this.gameMode.toUpperCase()} online...` });

      if (this.isConnected) {
        this.send({ type: 'QUICK_MATCH', profile: this.myProfile, gameMode: this.gameMode, maxPlayers: this.maxPlayers });
      }

      // Auto-Bot Fallback Timer: 7.0 sampai 10.0 detik jika belum ada pemain online asli, mulai dengan AI Bot!
      // (Sesuai rentang 7-15s ekspektasi pemain dan estimasi 00:10 di banner radar)
      const botWaitMs = Math.floor(7000 + Math.random() * 3000); // 7.0s - 10.0s
      this.botFallbackTimer = setTimeout(() => {
        if (this.matchStatus === 'QUEUED') {
          console.log(`[MultiplayerEngine] Waktu tunggu matchmaking habis (${(botWaitMs/1000).toFixed(1)} detik). Menghubungkan ke AI Bot...`);
          this.spawnBotMatch();
        }
      }, botWaitMs);
    }

    spawnBotMatch() {
      if (this.botFallbackTimer) {
        clearTimeout(this.botFallbackTimer);
        this.botFallbackTimer = null;
      }
      if (this.matchStatus !== 'QUEUED' && this.matchStatus !== 'IN_ROOM' && this.matchStatus !== 'IDLE') return;

      const BOT_PREFIXES = ['Sky', 'Cyber', 'Shadow', 'Aero', 'Dragon', 'Neko', 'Vortex', 'Phoenix', 'Star', 'Ghost', 'Quantum', 'Lunar', 'Pixel', 'Hyper', 'Nova', 'Falcon', 'Alpha', 'Mega', 'Blaze', 'Storm', 'Frost', 'Apex', 'Turbo', 'Kitsune', 'Mecha', 'Zen', 'Pyro', 'Cosmo', 'Mystic', 'Iron', 'Thunder'];
      const BOT_SUFFIXES = ['Flapper', 'Master', 'Hunter', 'Knight', 'Striker', 'Rider', 'Wing', 'Ace', 'Pro', 'Lord', 'King', 'Ninja', 'Pilot', 'Viper', 'Beast', 'Hawk', 'Slayer', 'Legend', 'Samurai', 'Hero'];
      const BOT_AVATARS = ['chick_yellow', 'pink_sakura', 'penguin_tux', 'king_royal', 'blue_sky', 'phoenix_blaze', 'cat_neko', 'robo_mecha', 'astro_space', 'dragon_pyro', 'fox_kitsune', 'bear_grizzly', 'frog_ninja', 'panda_zen', 'lion_brave', 'bunny_cotton', 'duck_bubble', 'tiger_savage', 'owl_wisdom', 'shark_apex'];
      const BOT_SKINS = ['classic', 'blue', 'pink', 'gold', 'stealth', 'rainbow', 'neon', 'fire', 'ice', 'cyber', 'matrix', 'galaxy', 'toxic', 'lava', 'phantom', 'sunset', 'inferno', 'void', 'aurora', 'obsidian'];
      const BOT_HATS = ['none', 'none', 'crown', 'viking', 'wizard', 'halo', 'pirate', 'ninja', 'cap', 'chef', 'cyber_helm', 'horns', 'tophat', 'beanie', 'samurai'];
      const BOT_OUTFITS = ['none', 'none', 'tuxedo', 'cape', 'armor', 'hoodie', 'cyber_suit', 'ninja_gi', 'hero_suit', 'jacket', 'kimono'];
      const BOT_TIERS = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'SUPREME'];

      const neededBotsCount = Math.max(1, this.maxPlayers - 1);
      const fakeBots = [];

      for (let i = 0; i < neededBotsCount; i++) {
        const p = BOT_PREFIXES[Math.floor(Math.random() * BOT_PREFIXES.length)];
        const s = BOT_SUFFIXES[Math.floor(Math.random() * BOT_SUFFIXES.length)];
        const num = Math.random() < 0.4 ? '_' + Math.floor(10 + Math.random() * 90) : (Math.random() < 0.2 ? '_ID' : '');
        const botName = p + (Math.random() < 0.3 ? '_' : '') + s + num;
        const botAvatar = BOT_AVATARS[Math.floor(Math.random() * BOT_AVATARS.length)];
        const botSkin = BOT_SKINS[Math.floor(Math.random() * BOT_SKINS.length)];
        const botHat = BOT_HATS[Math.floor(Math.random() * BOT_HATS.length)];
        const botOutfit = BOT_OUTFITS[Math.floor(Math.random() * BOT_OUTFITS.length)];
        const botTier = BOT_TIERS[Math.floor(Math.random() * BOT_TIERS.length)];
        const botId = 'BOT-' + Math.floor(100 + Math.random() * 900) + '-' + (i + 1);

        fakeBots.push({
          id: botId,
          name: botName,
          avatar: botAvatar,
          skin: botSkin,
          hat: botHat,
          outfit: botOutfit,
          tier: botTier,
          isReady: true,
          isHost: false
        });
      }

      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const seed = Math.floor(Math.random() * 1000000);

      this.currentRoom = {
        roomId: 'bot_match_' + code,
        code,
        seed,
        gameMode: this.gameMode,
        maxPlayers: this.maxPlayers,
        isHost: true,
        playersList: [this.myProfile, ...fakeBots]
      };

      this.matchStatus = 'COUNTDOWN';
      this.setSeed(seed);
      this.opponents.clear();

      fakeBots.forEach((fakeOpponent, idx) => {
        // Bot Skill Scaling based on Rank Tier
        let targetMaxScore = this.gameMode === 'race' ? this.raceTargetScore : 15;
        let flapCooldownBase = 0.22;
        if (fakeOpponent.tier === 'BRONZE') {
          targetMaxScore = this.gameMode === 'race' ? Math.floor(20 + Math.random() * 10) : Math.floor(6 + Math.random() * 10);
          flapCooldownBase = 0.25;
        } else if (fakeOpponent.tier === 'SILVER') {
          targetMaxScore = this.gameMode === 'race' ? Math.floor(24 + Math.random() * 8) : Math.floor(12 + Math.random() * 12);
          flapCooldownBase = 0.22;
        } else if (fakeOpponent.tier === 'GOLD') {
          targetMaxScore = this.gameMode === 'race' ? Math.floor(27 + Math.random() * 6) : Math.floor(18 + Math.random() * 18);
          flapCooldownBase = 0.19;
        } else if (fakeOpponent.tier === 'PLATINUM') {
          targetMaxScore = this.gameMode === 'race' ? 30 : Math.floor(28 + Math.random() * 22);
          flapCooldownBase = 0.17;
        } else if (fakeOpponent.tier === 'DIAMOND') {
          targetMaxScore = this.gameMode === 'race' ? 30 : Math.floor(38 + Math.random() * 26);
          flapCooldownBase = 0.15;
        } else {
          targetMaxScore = this.gameMode === 'race' ? 30 : Math.floor(55 + Math.random() * 45);
          flapCooldownBase = 0.13;
        }

        const BOT_BOOSTERS = ['shield', 'rocket', 'double_coins', 'magnet', 'extra_life', 'slow_mo', 'none'];
        const botBooster = BOT_BOOSTERS[Math.floor(Math.random() * BOT_BOOSTERS.length)];
        const hasBabies = Math.random() < 0.75;
        const botBabyBirds = hasBabies ? [
          { id: 0, x: 130 - 22, y: 150 - 18, r: 8.5, wing: 0, color: '#facc15', wingColor: '#eab308', blushColor: '#fda4af', state: 'following' },
          { id: 1, x: 130 - 26, y: 150 + 18, r: 8.5, wing: 0, color: '#38bdf8', wingColor: '#0284c7', blushColor: '#fda4af', state: 'following' }
        ] : [];

        this.opponents.set(fakeOpponent.id, {
          id: fakeOpponent.id,
          name: fakeOpponent.name,
          avatar: fakeOpponent.avatar,
          skin: fakeOpponent.skin,
          hat: fakeOpponent.hat,
          outfit: fakeOpponent.outfit,
          tier: fakeOpponent.tier,
          booster: botBooster,
          hasShield: botBooster === 'shield',
          babyBirds: botBabyBirds,
          y: 150 + (idx * 16),
          vy: 0,
          rot: 0,
          score: 0,
          lives: botBooster === 'extra_life' ? 4 : 3,
          maxLives: botBooster === 'extra_life' ? 4 : 3,
          graceTimer: 0,
          isAlive: true,
          isDashing: false,
          targetY: 150 + (idx * 16),
          lastUpdate: Date.now(),
          isSimulatedBot: true,
          botTargetScore: targetMaxScore,
          botFlapCooldownBase: flapCooldownBase,
          botFlapCooldown: 0,
          shouldFail: false,
          wing: 0
        });
      });

      this.emit('match_found', {
        roomId: this.currentRoom.roomId,
        code,
        seed,
        gameMode: this.gameMode,
        maxPlayers: this.maxPlayers,
        playersList: this.currentRoom.playersList,
        opponent: fakeBots[0],
        opponents: fakeBots,
        countdown: 3
      });
    }

    cancelMatch() {
      if (this.botFallbackTimer) {
        clearTimeout(this.botFallbackTimer);
        this.botFallbackTimer = null;
      }
      this.matchStatus = 'IDLE';
      this.send({ type: 'CANCEL_MATCH' });
    }

    setReady(isReady) {
      if (this.myProfile) this.myProfile.isReady = isReady;
      this.send({ type: 'PLAYER_READY', isReady: !!isReady });

      if (this.fs && this.currentRoom && this.currentRoom.code) {
        this.fs.collection('flappy_mp_rooms').doc(this.currentRoom.code).update({
          guestReady: !!isReady,
          lastActive: Date.now()
        }).catch(() => {});
      }

      if (this.bc && this.currentRoom) {
        this.bc.postMessage({
          type: 'BC_PLAYER_READY',
          roomId: this.currentRoom.roomId,
          playerId: this.localPlayerId,
          isReady: !!isReady
        });
      }
    }

    startRoomGame() {
      if (!this.currentRoom || !this.currentRoom.isHost) return;
      const seed = Math.floor(Math.random() * 1000000);
      this.setSeed(seed);
      this.matchStatus = 'COUNTDOWN';

      // 1. Sync via Firestore
      if (this.fs && this.currentRoom.code) {
        this.fs.collection('flappy_mp_rooms').doc(this.currentRoom.code).update({
          status: 'PLAYING',
          seed,
          startAt: Date.now(),
          lastActive: Date.now()
        }).catch(e => console.warn('[Firestore Start Game Error]:', e));
      }

      // 2. Sync via Cloudflare Worker
      if (this.isConnected) {
        this.send({ type: 'START_GAME' });
      }

      // 3. Local Broadcast
      if (this.bc) {
        this.bc.postMessage({
          type: 'BC_GAME_START',
          roomId: this.currentRoom.roomId,
          seed,
          countdown: 3
        });
      }

      const rival = this.opponents.values().next().value || { name: 'Rival', avatar: 'robo_mecha' };
      this.emit('game_starting', { seed, countdown: 3, opponent: rival });
    }

    leaveRoom() {
      if (this.roomUnsubscribe) {
        this.roomUnsubscribe();
        this.roomUnsubscribe = null;
      }
      if (this.fs && this.currentRoom && this.currentRoom.code && this.currentRoom.isHost) {
        this.fs.collection('flappy_mp_rooms').doc(this.currentRoom.code).delete().catch(() => {});
      }
      this.matchStatus = 'IDLE';
      this.currentRoom = null;
      this.opponents.clear();
      this.send({ type: 'LEAVE_ROOM' });
    }

    // High frequency state broadcaster
    broadcastMyState(birdState) {
      if (this.matchStatus !== 'PLAYING' && this.matchStatus !== 'COUNTDOWN') return;

      const payload = {
        type: this.isConnected ? 'SYNC_STATE' : 'BC_OPPONENT_STATE',
        roomId: this.currentRoom?.roomId,
        playerId: this.localPlayerId,
        y: Math.round(birdState.y * 10) / 10,
        vy: Math.round(birdState.vy),
        rot: Math.round(birdState.rot * 100) / 100,
        score: birdState.score || 0,
        lives: birdState.lives !== undefined ? birdState.lives : 3,
        isAlive: birdState.isAlive !== false,
        isDashing: !!birdState.isDashing,
        time: Date.now()
      };

      this.send(payload);

      // Debounced Firestore Relay Sync for cross-network perfection
      const now = Date.now();
      if (this.currentRoom && this.fs && this.currentRoom.code && (now - (this.lastStateBroadcastTime || 0) > 85)) {
        this.lastStateBroadcastTime = now;
        const stateKey = this.currentRoom.isHost ? 'hostState' : 'guestState';
        this.fs.collection('flappy_mp_rooms').doc(this.currentRoom.code).update({
          [stateKey]: payload,
          lastActive: now
        }).catch(() => {});
      }
    }

    strikeOpponentsWithZap() {
      this.opponents.forEach(op => {
        if (op.isAlive) {
          op.relX = (op.relX || 90) - 110;
          op.curX = op.relX;
          if (op.hasShield) {
            op.hasShield = false;
          } else {
            op.lives = Math.max(1, (op.lives || 3) - 1);
          }
          op.isStunned = true;
          op.stunTimer = 2.0;
        }
      });
      this.send({
        type: 'OPPONENT_ZAPPED',
        roomId: this.currentRoom?.roomId,
        senderId: this.localPlayerId
      });
    }

    broadcastMyDeath(finalScore) {
      this.send({
        type: this.isConnected ? 'PLAYER_DIED' : 'BC_OPPONENT_DIED',
        roomId: this.currentRoom?.roomId,
        playerId: this.localPlayerId,
        finalScore: finalScore || 0
      });
    }

    // Update & Lerp positions of rival birds every animation frame
    updateOpponents(dt, activePipes = [], activePowerups = [], myContext = {}) {
      const myIsDashing = !!myContext.isDashing;
      const myIsRocket = !!myContext.isRocket;
      const myScore = myContext.score || 0;
      const baseBirdX = myContext.birdX || 90;

      this.opponents.forEach((op, opId) => {
        if (opId === this.localPlayerId || (this.myProfile && op.name === this.myProfile.name)) return;
        if (!op.isAlive) {
          // If in Race Mode: 3-Second Auto-Respawn for Bot!
          if (this.gameMode === 'race') {
            op.respawnTimer = (op.respawnTimer || 3.0) - dt;
            op.targetY = 250 + Math.sin(Date.now() / 250) * 10;
            op.y = op.targetY;
            if (op.respawnTimer <= 0) {
              op.isAlive = true;
              op.lives = 3;
              op.graceTimer = 2.8;
              op.respawnTimer = 3.0;
              op.relX = baseBirdX - 60;
              op.curX = op.relX;
            }
            return;
          }

          // Fall to ground if dead in Survival Mode
          if (op.targetY < 300) {
            op.vy = (op.vy || 0) + 850 * dt;
            op.targetY += op.vy * dt;
            op.rot = Math.min(1.5, (op.rot || 0) + 4 * dt);
            op.y = op.targetY;
          }
          if (op.relX === undefined) op.relX = baseBirdX;
          // When dead and player keeps advancing, dead body falls behind quickly
          op.relX -= dt * 260;
          op.curX = op.relX;
          return;
        }

        // =========================================================
        // Cumulative Relative Horizontal Physics (X-Axis Speed Differential)
        // =========================================================
        const mySpeed = myIsRocket ? 540 : (myIsDashing ? 460 : 140);
        const opSpeed = op.isRocket ? 540 : (op.isDashing ? 280 : 135);
        const speedDelta = opSpeed - mySpeed; // When player dashes (460), speedDelta is -325 px/s!

        if (op.relX === undefined) op.relX = baseBirdX;
        
        // Continuously integrate relative velocity
        op.relX += speedDelta * dt;

        // When neither is boosting, gently pull towards pipe distance offset
        if (!myIsDashing && !myIsRocket && !op.isDashing && !op.isRocket) {
          const targetBaseX = baseBirdX + Math.max(-200, Math.min(200, ((op.score || 0) - myScore) * 120));
          op.relX += (targetBaseX - op.relX) * Math.min(1, dt * 3.5);
        }

        op.curX = op.relX;

        // If simulated bot, simulate intelligent human-like flapping with mistake chance & 3 lives
        if (op.isSimulatedBot && this.matchStatus === 'PLAYING') {
          op.wing = (op.wing || 0) + dt * 14;
          op.graceTimer = Math.max(0, (op.graceTimer || 0) - dt);

          // Find next approaching pipe
          let nextPipe = null;
          if (activePipes && activePipes.length > 0) {
            nextPipe = activePipes.find(p => p.x + p.w >= 70);
            
            // Bot Score tracking when passing pipe
            activePipes.forEach(p => {
              if (p.x + p.w < 90 && !p[`_botScored_${op.id}`]) {
                p[`_botScored_${op.id}`] = true;
                op.score = (op.score || 0) + 1;
              }
            });
          }

          let idealY = 140;
          if (nextPipe) {
            idealY = nextPipe.gapY + nextPipe.gapSize / 2;
          } else {
            idealY = 140 + Math.sin(Date.now() / 500) * 25;
          }

          op.botFlapCooldown = (op.botFlapCooldown || 0) - dt;

          // Cek apakah bot melakukan kesalahan / mencapai batas kemampuannya
          if ((op.score || 0) >= (op.botTargetScore || 20)) {
            op.shouldFail = true;
          }

          if (!op.shouldFail) {
            // Intelligent flap trigger
            const cdBase = op.botFlapCooldownBase || 0.20;
            if (op.targetY > idealY + 12 && op.botFlapCooldown <= 0) {
              op.vy = -305 + (Math.random() - 0.5) * 35;
              op.botFlapCooldown = cdBase + Math.random() * 0.08;
            }
          }

          // Apply Gravity
          op.vy = (op.vy || 0) + 820 * dt;
          op.targetY = (op.targetY || 250) + op.vy * dt;
          op.rot = Math.max(-0.4, Math.min(1.2, op.vy * 0.003));
          op.y = op.targetY;

          // 1. PIPE COLLISION DETECTION FOR BOT (Shield & 3 Lives System)
          const botX = 90;
          const botR = 12;
          if (activePipes && activePipes.length > 0 && op.graceTimer <= 0) {
            for (const p of activePipes) {
              // Check if bot is inside the pipe's horizontal span
              if (botX + botR > p.x && botX - botR < p.x + p.w) {
                // Check if bot hit the top pipe or bottom pipe
                if (op.y - botR < p.gapY || op.y + botR > p.gapY + p.gapSize) {
                  if (op.hasShield) {
                    // Shield absorbs hit
                    op.hasShield = false;
                    op.graceTimer = 1.4;
                    op.vy = -220;
                    op.targetY = Math.max(80, op.targetY - 20);
                    break;
                  } else if ((op.lives || 3) > 1) {
                    op.lives = (op.lives || 3) - 1;
                    op.graceTimer = 1.6;
                    op.vy = -320;
                    op.targetY = p.gapY + p.gapSize / 2;
                    this.emit('opponent_state', {
                      playerId: op.id,
                      y: op.y, vy: op.vy, rot: op.rot,
                      score: op.score || 0,
                      isAlive: true,
                      lives: op.lives
                    });
                    break;
                  } else {
                    op.lives = 0;
                    op.isAlive = false;
                    op.vy = 120;
                    this.emit('opponent_died', { playerId: op.id, finalScore: op.score || 0 });
                    return;
                  }
                }
              }
            }
          }

          // 2. Ceiling & Floor collision checks (3 Lives System)
          if (op.targetY < 25) {
            op.targetY = 25;
            op.vy = 80;
          }
          if (op.targetY > 290) {
            if ((op.lives || 3) > 1) {
              op.lives = (op.lives || 3) - 1;
              op.graceTimer = 1.6;
              op.vy = -340;
              op.targetY = 250;
              this.emit('opponent_state', {
                playerId: op.id,
                y: op.y, vy: op.vy, rot: op.rot,
                score: op.score || 0,
                isAlive: true,
                lives: op.lives
              });
            } else {
              op.lives = 0;
              op.targetY = 290;
              op.isAlive = false;
              this.emit('opponent_died', { playerId: op.id, finalScore: op.score || 0 });
              return;
            }
          }

          // 3. Bot Power-up Collection (Bot bisa mengambil power-up di celah tiang)
          if (activePowerups && activePowerups.length > 0 && op.isAlive) {
            for (let i = activePowerups.length - 1; i >= 0; i--) {
              const p = activePowerups[i];
              if (!p || p.dead) continue;
              const dx = botX - p.x;
              const dy = op.y - p.y;
              const dist = Math.hypot(dx, dy);
              if (dist < (p.r || 15) + 14) {
                if (p.type === 'shield' || p.type === 'double_shield') {
                  op.hasShield = true;
                } else if (p.type === 'heart') {
                  op.lives = Math.min(3, (op.lives || 3) + 1);
                } else if (p.type === 'star' || p.type === 'rocket') {
                  op.graceTimer = 2.5;
                }
                p.dead = true;
                p.x = -999;
                activePowerups.splice(i, 1);
                this.emit('opponent_state', {
                  playerId: op.id,
                  y: op.y, vy: op.vy, rot: op.rot,
                  score: op.score || 0,
                  isAlive: true,
                  lives: op.lives
                });
              }
            }
          }

          // 4. Bot Dash Ability Execution (Bursts in Race mode with fair cooldowns)
          const botDashCooldownBase = this.gameMode === 'race' ? 3.8 : 4.5;
          op.dashCooldown = (op.dashCooldown || botDashCooldownBase) - dt;
          if (op.dashTimer > 0) {
            op.dashTimer -= dt;
            if (op.dashTimer <= 0) op.isDashing = false;
          }
          if (op.dashCooldown <= 0 && !op.isDashing && op.isAlive) {
            if ((this.gameMode === 'race' && Math.random() < 0.6) || (nextPipe && nextPipe.x < 185 && nextPipe.x > 80)) {
              op.isDashing = true;
              op.dashTimer = 0.28;
              op.dashCooldown = this.gameMode === 'race' ? (3.5 + Math.random() * 2.5) : (3.5 + Math.random() * 3.0);
              op.graceTimer = Math.max(op.graceTimer || 0, 0.45);
              op.vy = Math.min(op.vy, -130);
            }
          }

          // 5. Update Bot Baby Birds Position Following Behind
          if (op.babyBirds && op.babyBirds.length > 0) {
            const bx = op.curX !== undefined ? op.curX : 90;
            op.babyBirds[0].x = bx - 22;
            op.babyBirds[0].y = op.y - 18 + Math.sin(Date.now() / 220) * 4;
            op.babyBirds[0].wing += dt * 20;

            op.babyBirds[1].x = bx - 26;
            op.babyBirds[1].y = op.y + 18 + Math.sin(Date.now() / 240 + Math.PI) * 4;
            op.babyBirds[1].wing += dt * 20;
          }
        }

        // Smooth Lerp target position for human opponents
        if (!op.isSimulatedBot) {
          const lerpFactor = Math.min(1, dt * 14);
          op.y = op.y + (op.targetY - op.y) * lerpFactor;
        }
      });
    }

    // Render opponent birds onto canvas with custom skins, hats, outfits, baby birds & nametag
    renderOpponents(ctx, birdX = 90) {
      if (!ctx || this.opponents.size === 0) return;

      this.opponents.forEach((op, opId) => {
        try {
          if (!op || opId === this.localPlayerId || (this.myProfile && op.name === this.myProfile.name)) return;
          if (!op.isAlive && (op.y === undefined || op.y >= 540)) return;

          const drawX = (typeof op.curX === 'number' && !isNaN(op.curX)) ? op.curX : birdX;
          const drawY = (typeof op.y === 'number' && !isNaN(op.y)) ? op.y : 250;

          // If opponent is offscreen left or right, draw a sleek indicator badge at screen edge
          if (drawX < -20 && op.isAlive) {
            ctx.save();
            ctx.font = 'bold 9.5px "Trebuchet MS", Arial, sans-serif';
            ctx.fillStyle = '#f43f5e';
            ctx.textAlign = 'left';
            const distBehind = Math.max(1, Math.round(Math.abs(drawX - birdX) / 8));
            ctx.fillText(`◀ ${op.name || 'Rival'} (${distBehind}m)`, 6, Math.max(70, Math.min(330, drawY)));
            ctx.restore();
            return;
          }
          if (drawX > 660 && op.isAlive) {
            ctx.save();
            ctx.font = 'bold 9.5px "Trebuchet MS", Arial, sans-serif';
            ctx.fillStyle = '#38bdf8';
            ctx.textAlign = 'right';
            const distAhead = Math.max(1, Math.round(Math.abs(drawX - birdX) / 8));
            ctx.fillText(`${op.name || 'Rival'} (+${distAhead}m) ▶`, 628, Math.max(70, Math.min(330, drawY)));
            ctx.restore();
            return;
          }

          // Turunkan opacity lawan agar mudah dibedakan dengan pemain sendiri (HD Ghost Rival)
          const rivalOpacity = op.isAlive ? 1.0 : 0.4;

          // 1. Render Opponent Baby Birds (100% HD identik dengan pemain tapi dengan opacity lawan)
          if (op.babyBirds && op.babyBirds.length > 0 && op.isAlive) {
            op.babyBirds.forEach((b, idx) => {
              if (typeof window.drawCustomBabyBird === 'function') {
                window.drawCustomBabyBird(ctx, {
                  id: idx,
                  x: (b && Number.isFinite(b.x)) ? b.x : drawX - 22,
                  y: (b && Number.isFinite(b.y)) ? b.y : drawY - 18,
                  r: 8.5,
                  angle: (op.rot || 0) * 0.7,
                  wing: (b && b.wing) || 0,
                  color: (b && b.color) || (idx === 0 ? '#facc15' : '#38bdf8'),
                  wingColor: (b && b.wingColor) || (idx === 0 ? '#eab308' : '#0284c7'),
                  blushColor: '#fda4af',
                  state: 'following'
                }, rivalOpacity);
              }
            });
          }

          // 2. Render Opponent Bird (100% HD Custom Bird dengan skins, hats, outfits & opacity lawan)
          if (typeof window.renderCustomBird === 'function') {
            ctx.save();
            window.renderCustomBird(ctx, {
              x: drawX,
              y: drawY,
              vy: op.vy || 0,
              angle: op.rot || 0,
              wing: op.wing || 0,
              skinId: op.skin || 'classic',
              hatId: op.hat || 'none',
              outfitId: op.outfit || 'none',
              opacity: rivalOpacity
            });
            ctx.restore();
          } else {
            // Fallback custom renderer
            ctx.save();
            ctx.translate(drawX, drawY);
            ctx.rotate(op.rot || 0);
            ctx.globalAlpha = rivalOpacity;
            ctx.fillStyle = op.isAlive ? '#f43f5e' : '#64748b';
            ctx.beginPath();
            ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          // 3. Render Opponent Dash Warp Trail & Shockwave
          if (op.isDashing && op.isAlive) {
            ctx.save();
            ctx.globalAlpha = rivalOpacity * 0.7;
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(drawX - 8, drawY, 20, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }

          // 4. Render Opponent Shield (100% HD Hexagonal Shield dengan opacity lawan)
          if (op.hasShield && op.isAlive) {
            if (typeof window.drawCustomShieldFX === 'function') {
              window.drawCustomShieldFX(ctx, drawX, drawY, op.rot || 0, false, rivalOpacity);
            }
          }

          // 5. Render Combat Stun / Freeze / Electrocuted VFX
          if (op.isStunned && op.stunTimer > 0 && op.isAlive) {
            ctx.save();
            if (op.stunType === 'freeze') {
              // Crystalline 3D Ice Cube Block Encasing Opponent
              ctx.fillStyle = 'rgba(165, 243, 252, 0.45)';
              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = 2.2;
              ctx.shadowColor = '#00f5d4';
              ctx.shadowBlur = 12;
              ctx.beginPath();
              ctx.roundRect(drawX - 20, drawY - 20, 40, 40, 6);
              ctx.fill();
              ctx.stroke();

              // Ice Facet Reflection Lines
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(drawX - 14, drawY - 14); ctx.lineTo(drawX - 2, drawY - 14);
              ctx.moveTo(drawX - 14, drawY - 14); ctx.lineTo(drawX - 14, drawY - 2);
              ctx.stroke();
            } else {
              // Crackling Electric Zap Aura
              ctx.strokeStyle = '#fde047';
              ctx.lineWidth = 2.2;
              ctx.shadowColor = '#eab308';
              ctx.shadowBlur = 10;
              ctx.beginPath();
              for (let i = 0; i < 4; i++) {
                const ang = Math.random() * Math.PI * 2;
                const r = 16 + Math.random() * 8;
                const ex = drawX + Math.cos(ang) * r;
                const ey = drawY + Math.sin(ang) * r;
                if (i === 0) ctx.moveTo(ex, ey); else ctx.lineTo(ex, ey);
              }
              ctx.stroke();

              // Dizzy Cartoon Orbiting Stars above head
              const now = performance.now();
              for (let s = 0; s < 3; s++) {
                const starAng = (now / 200) + (s * Math.PI * 2 / 3);
                const sx = drawX + Math.cos(starAng) * 16;
                const sy = (drawY - 20) + Math.sin(starAng) * 6;
                ctx.fillStyle = '#fde047';
                ctx.beginPath();
                ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
                ctx.fill();
              }
            }
            ctx.restore();
          }

          // 6. Opponent Name Tag & Live Score above head
          ctx.save();
          ctx.globalAlpha = rivalOpacity;
          ctx.font = 'bold 9.5px "Trebuchet MS", Arial, sans-serif';
          ctx.textAlign = 'center';
          
          // Name pill
          const opCleanName = typeof window.sanitizePlayerName === 'function' ? window.sanitizePlayerName(op.name || 'Rival') : (op.name || 'Rival');
          const tagText = `${opCleanName} (${op.score || 0} pts)`;
          const textWidth = ctx.measureText(tagText).width;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
          ctx.beginPath();
          ctx.roundRect(drawX - textWidth/2 - 6, drawY - 34, textWidth + 12, 15, 4);
          ctx.fill();
          ctx.strokeStyle = op.isAlive ? '#38bdf8' : '#94a3b8';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = op.isAlive ? '#bae6fd' : '#94a3b8';
          ctx.fillText(tagText, drawX, drawY - 23);
          ctx.restore();
        } catch (opErr) {
          console.warn('[MP Render Error for Opponent]:', opErr);
        }
      });
    }
  }

  // Expose to window
  window.FlappyMultiplayer = FlappyMultiplayer;
  window.multiplayerEngine = new FlappyMultiplayer();

})(window);

