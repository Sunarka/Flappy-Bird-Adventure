/**
 * Flappy Bird Sky Challenge - Cloudflare Real-Time Multiplayer Client Engine
 * Supports Cloudflare Workers WebSocket Rooms, Quick Matchmaking, BroadcastChannel local fallback,
 * and high-frequency ghost rival state interpolation.
 */

(function(window) {
  'use strict';

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
      
      this.matchStatus = 'IDLE'; // IDLE, QUEUED, IN_ROOM, COUNTDOWN, PLAYING, ENDED
      this.eventListeners = new Map();

      // Seeded Random Number Generator for identical obstacles
      this.currentSeed = 12345;
      this.prngState = 12345;

      // Local BroadcastChannel fallback for multi-tab instant testing
      this.bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('flappy_mp_local_bus') : null;
      this.initBroadcastChannel();
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
      if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
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
          if (profile) {
            this.send({ type: 'UPDATE_PROFILE', profile });
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
          // Fallback to BroadcastChannel mode silently for offline / multi-tab dev
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
          this.currentRoom = {
            roomId: data.roomId,
            code: data.code,
            seed: data.seed,
            isHost: data.playersList[0]?.id === this.localPlayerId,
            playersList: data.playersList
          };
          this.matchStatus = 'COUNTDOWN';
          this.setSeed(data.seed);
          this.opponents.clear();

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

          this.emit('match_found', data);
          break;
        }

        case 'QUEUED_FOR_MATCH': {
          this.matchStatus = 'QUEUED';
          this.emit('queued', data);
          break;
        }

        case 'MATCH_CANCELLED': {
          this.matchStatus = 'IDLE';
          this.emit('match_cancelled');
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
      let op = this.opponents.get(data.playerId);
      if (!op) {
        op = {
          id: data.playerId,
          name: 'Rival',
          avatar: 'chick_yellow',
          skin: 'classic',
          y: data.y,
          vy: data.vy,
          rot: data.rot,
          score: data.score || 0,
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
        op.isAlive = data.isAlive !== false;
        op.isDashing = !!data.isDashing;
        op.lastUpdate = Date.now();
      }
    }

    // Public Actions
    createRoom(profile) {
      this.myProfile = { ...profile, id: this.localPlayerId };
      if (this.isConnected) {
        this.send({ type: 'CREATE_ROOM', profile: this.myProfile });
      } else {
        // Local Broadcast Fallback
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        const seed = Math.floor(Math.random() * 1000000);
        this.currentRoom = {
          roomId: 'local_' + code,
          code,
          seed,
          isHost: true,
          playersList: [this.myProfile]
        };
        this.matchStatus = 'IN_ROOM';
        this.setSeed(seed);
        this.opponents.clear();

        // Broadcast to other tabs
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
    }

    joinRoom(code, profile) {
      this.myProfile = { ...profile, id: this.localPlayerId };
      const cleanCode = (code || '').toString().trim();
      if (!cleanCode) {
        this.emit('error', 'Masukkan 4-digit kode room!');
        return;
      }

      if (this.isConnected) {
        this.send({ type: 'JOIN_ROOM', code: cleanCode, profile: this.myProfile });
      } else {
        // Local Broadcast Fallback
        this.matchStatus = 'JOINING';
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
            this.emit('error', 'Room ' + cleanCode + ' tidak ditemukan (Pastikan tab host aktif)!');
          }
        }, 1500);
      }
    }

    quickMatch(profile) {
      this.myProfile = { ...profile, id: this.localPlayerId };
      this.cancelMatch(); // Clear previous queue/timers

      this.matchStatus = 'QUEUED';
      this.emit('queued', { message: 'Mencari lawan 1v1 online...' });

      if (this.isConnected) {
        this.send({ type: 'QUICK_MATCH', profile: this.myProfile });
      }

      // Auto-Bot Fallback Timer: Random 6 sampai 12 detik jika belum ada lawan pemain asli, masukkan AI Bot!
      const botWaitMs = Math.floor(6000 + Math.random() * 6000); // 6s - 12s
      if (this.botFallbackTimer) clearTimeout(this.botFallbackTimer);
      this.botFallbackTimer = setTimeout(() => {
        if (this.matchStatus === 'QUEUED') {
          this.spawnBotMatch();
        }
      }, botWaitMs);
    }

    spawnBotMatch() {
      if (this.matchStatus !== 'QUEUED') return;

      const BOT_PREFIXES = ['Sky', 'Cyber', 'Shadow', 'Aero', 'Dragon', 'Neko', 'Vortex', 'Phoenix', 'Star', 'Ghost', 'Quantum', 'Lunar', 'Pixel', 'Hyper', 'Nova', 'Falcon', 'Alpha', 'Mega', 'Blaze', 'Storm', 'Frost', 'Apex', 'Turbo', 'Kitsune', 'Mecha', 'Zen', 'Pyro', 'Cosmo', 'Mystic', 'Iron', 'Thunder'];
      const BOT_SUFFIXES = ['Flapper', 'Master', 'Hunter', 'Knight', 'Striker', 'Rider', 'Wing', 'Ace', 'Pro', 'Lord', 'King', 'Ninja', 'Pilot', 'Viper', 'Beast', 'Hawk', 'Slayer', 'Legend', 'Samurai', 'Hero'];
      const BOT_AVATARS = ['chick_yellow', 'pink_sakura', 'penguin_tux', 'king_royal', 'blue_sky', 'phoenix_blaze', 'cat_neko', 'robo_mecha', 'astro_space', 'dragon_pyro', 'fox_kitsune', 'bear_grizzly', 'frog_ninja', 'panda_zen', 'lion_brave', 'bunny_cotton', 'duck_bubble', 'tiger_savage', 'owl_wisdom', 'shark_apex'];
      const BOT_SKINS = ['classic', 'blue', 'pink', 'gold', 'stealth', 'rainbow', 'neon', 'fire', 'ice', 'cyber', 'matrix', 'galaxy', 'toxic', 'lava', 'phantom', 'sunset', 'inferno', 'void', 'aurora', 'obsidian'];
      const BOT_HATS = ['none', 'none', 'crown', 'viking', 'wizard', 'halo', 'pirate', 'ninja', 'cap', 'chef', 'cyber_helm', 'horns', 'tophat', 'beanie', 'samurai'];
      const BOT_OUTFITS = ['none', 'none', 'tuxedo', 'cape', 'armor', 'hoodie', 'cyber_suit', 'ninja_gi', 'hero_suit', 'jacket', 'kimono'];
      const BOT_TIERS = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'SUPREME'];

      const p = BOT_PREFIXES[Math.floor(Math.random() * BOT_PREFIXES.length)];
      const s = BOT_SUFFIXES[Math.floor(Math.random() * BOT_SUFFIXES.length)];
      const num = Math.random() < 0.4 ? '_' + Math.floor(10 + Math.random() * 90) : (Math.random() < 0.2 ? '_ID' : '');
      const botName = p + (Math.random() < 0.3 ? '_' : '') + s + num;
      const botAvatar = BOT_AVATARS[Math.floor(Math.random() * BOT_AVATARS.length)];
      const botSkin = BOT_SKINS[Math.floor(Math.random() * BOT_SKINS.length)];
      const botHat = BOT_HATS[Math.floor(Math.random() * BOT_HATS.length)];
      const botOutfit = BOT_OUTFITS[Math.floor(Math.random() * BOT_OUTFITS.length)];
      const botTier = BOT_TIERS[Math.floor(Math.random() * BOT_TIERS.length)];
      const botId = 'BOT-' + Math.floor(100 + Math.random() * 900);

      const fakeOpponent = {
        id: botId,
        name: botName,
        avatar: botAvatar,
        skin: botSkin,
        hat: botHat,
        outfit: botOutfit,
        tier: botTier,
        isReady: true,
        isHost: false
      };

      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const seed = Math.floor(Math.random() * 1000000);

      this.currentRoom = {
        roomId: 'bot_match_' + code,
        code,
        seed,
        isHost: true,
        playersList: [this.myProfile, fakeOpponent]
      };

      this.matchStatus = 'COUNTDOWN';
      this.setSeed(seed);
      this.opponents.clear();

      // Bot Skill Scaling based on Rank Tier (Variasi ada yang cupu, sedang, dan pro jago)
      let targetMaxScore = 15;
      let flapCooldownBase = 0.22;
      if (botTier === 'BRONZE') {
        targetMaxScore = Math.floor(6 + Math.random() * 10);
        flapCooldownBase = 0.25;
      } else if (botTier === 'SILVER') {
        targetMaxScore = Math.floor(12 + Math.random() * 12);
        flapCooldownBase = 0.22;
      } else if (botTier === 'GOLD') {
        targetMaxScore = Math.floor(18 + Math.random() * 18);
        flapCooldownBase = 0.19;
      } else if (botTier === 'PLATINUM') {
        targetMaxScore = Math.floor(28 + Math.random() * 22);
        flapCooldownBase = 0.17;
      } else if (botTier === 'DIAMOND') {
        targetMaxScore = Math.floor(38 + Math.random() * 26);
        flapCooldownBase = 0.15;
      } else { // MASTER, GRANDMASTER, SUPREME (Pro & Jago Banget)
        targetMaxScore = Math.floor(55 + Math.random() * 45);
        flapCooldownBase = 0.13;
      }

      // Bot Starter Booster & Baby Birds / Companions
      const BOT_BOOSTERS = ['shield', 'rocket', 'double_coins', 'magnet', 'extra_life', 'slow_mo', 'none'];
      const botBooster = BOT_BOOSTERS[Math.floor(Math.random() * BOT_BOOSTERS.length)];
      const hasBabies = Math.random() < 0.75;
      const botBabyBirds = hasBabies ? [
        { id: 0, x: 90 - 22, y: 280 - 18, r: 8.5, wing: 0, color: '#facc15', wingColor: '#eab308', blushColor: '#fda4af', state: 'following' },
        { id: 1, x: 90 - 26, y: 280 + 18, r: 8.5, wing: 0, color: '#38bdf8', wingColor: '#0284c7', blushColor: '#fda4af', state: 'following' }
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
        y: 280,
        vy: 0,
        rot: 0,
        score: 0,
        lives: botBooster === 'extra_life' ? 4 : 3,
        maxLives: botBooster === 'extra_life' ? 4 : 3,
        graceTimer: 0,
        isAlive: true,
        isDashing: false,
        targetY: 280,
        lastUpdate: Date.now(),
        isSimulatedBot: true,
        botTargetScore: targetMaxScore,
        botFlapCooldownBase: flapCooldownBase,
        botFlapCooldown: 0,
        shouldFail: false,
        wing: 0
      });

      this.emit('match_found', {
        roomId: this.currentRoom.roomId,
        code,
        seed,
        playersList: this.currentRoom.playersList,
        opponent: fakeOpponent,
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

    startRoomGame() {
      if (!this.currentRoom || !this.currentRoom.isHost) return;
      const seed = Math.floor(Math.random() * 1000000);
      this.setSeed(seed);
      this.matchStatus = 'COUNTDOWN';

      if (this.isConnected) {
        this.send({ type: 'START_GAME' });
      } else if (this.bc) {
        this.bc.postMessage({
          type: 'BC_GAME_START',
          roomId: this.currentRoom.roomId,
          seed,
          countdown: 3
        });
        this.emit('game_starting', { seed, countdown: 3 });
      }
    }

    leaveRoom() {
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
        t: Date.now()
      };

      this.send(payload);
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
    updateOpponents(dt, activePipes = []) {
      this.opponents.forEach(op => {
        if (!op.isAlive) {
          // Fall to ground if dead
          if (op.targetY < 540) {
            op.vy = (op.vy || 0) + 850 * dt;
            op.targetY += op.vy * dt;
            op.rot = Math.min(1.5, (op.rot || 0) + 4 * dt);
            op.y = op.targetY;
          }
          return;
        }

        // If simulated bot, simulate intelligent human-like flapping with mistake chance & 3 lives
        if (op.isSimulatedBot && this.matchStatus === 'PLAYING') {
          op.wing = (op.wing || 0) + dt * 14;
          op.graceTimer = Math.max(0, (op.graceTimer || 0) - dt);

          // Find next approaching pipe
          let nextPipe = null;
          if (activePipes && activePipes.length > 0) {
            nextPipe = activePipes.find(p => p.x + p.w >= 70);
          }

          let idealY = 250;
          if (nextPipe) {
            idealY = nextPipe.gapY + nextPipe.gapSize / 2;
          } else {
            idealY = 240 + Math.sin(Date.now() / 500) * 35;
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
                    op.vy = -260;
                    op.targetY = Math.max(80, op.targetY - 30);
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
          if (op.targetY > 520) {
            if ((op.lives || 3) > 1) {
              op.lives = (op.lives || 3) - 1;
              op.graceTimer = 1.6;
              op.vy = -340;
              op.targetY = 460;
              this.emit('opponent_state', {
                playerId: op.id,
                y: op.y, vy: op.vy, rot: op.rot,
                score: op.score || 0,
                isAlive: true,
                lives: op.lives
              });
            } else {
              op.lives = 0;
              op.targetY = 520;
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

          // 4. Bot Dash Ability Execution
          op.dashCooldown = (op.dashCooldown || 4.5) - dt;
          if (op.dashTimer > 0) {
            op.dashTimer -= dt;
            if (op.dashTimer <= 0) op.isDashing = false;
          }
          if (op.dashCooldown <= 0 && !op.isDashing && op.isAlive) {
            if (nextPipe && nextPipe.x < 185 && nextPipe.x > 80) {
              op.isDashing = true;
              op.dashTimer = 0.28;
              op.dashCooldown = 4.0 + Math.random() * 3.0;
              op.graceTimer = Math.max(op.graceTimer || 0, 0.45);
              op.vy = Math.min(op.vy, -130);
            }
          }

          // 5. Update Bot Baby Birds Position Following Behind
          if (op.babyBirds && op.babyBirds.length > 0) {
            op.babyBirds[0].x = 90 - 22;
            op.babyBirds[0].y = op.y - 18 + Math.sin(Date.now() / 220) * 4;
            op.babyBirds[0].wing += dt * 20;

            op.babyBirds[1].x = 90 - 26;
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
      if (this.opponents.size === 0) return;

      this.opponents.forEach(op => {
        if (!op.isAlive && op.y >= 540) return;

        // Turunkan opacity lawan agar mudah dibedakan dengan pemain sendiri (HD Ghost Rival)
        const rivalOpacity = op.isAlive ? 0.68 : 0.35;

        // 1. Render Opponent Baby Birds (100% HD identik dengan pemain tapi dengan opacity lawan)
        if (op.babyBirds && op.babyBirds.length > 0 && op.isAlive) {
          op.babyBirds.forEach((b, idx) => {
            if (typeof window.drawCustomBabyBird === 'function') {
              window.drawCustomBabyBird(ctx, {
                id: idx,
                x: Number.isFinite(b.x) ? b.x : birdX - 22,
                y: Number.isFinite(b.y) ? b.y : op.y - 18,
                r: 8.5,
                angle: (op.rot || 0) * 0.7,
                wing: b.wing || 0,
                color: b.color || (idx === 0 ? '#facc15' : '#38bdf8'),
                wingColor: b.wingColor || (idx === 0 ? '#eab308' : '#0284c7'),
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
            x: birdX,
            y: op.y,
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
          ctx.translate(birdX, op.y);
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
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(birdX - 8, op.y, 20, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // 4. Render Opponent Shield (100% HD Hexagonal Shield dengan opacity lawan)
        if (op.hasShield && op.isAlive) {
          if (typeof window.drawCustomShieldFX === 'function') {
            window.drawCustomShieldFX(ctx, birdX, op.y, op.rot || 0, false, rivalOpacity);
          }
        }

        // 4. Opponent Name Tag & Live Score above head
        ctx.save();
        ctx.globalAlpha = rivalOpacity;
        ctx.font = 'bold 9.5px "Trebuchet MS", Arial, sans-serif';
        ctx.textAlign = 'center';
        
        // Name pill
        const tagText = `${op.name} (${op.score || 0} pts)`;
        const textWidth = ctx.measureText(tagText).width;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.beginPath();
        ctx.roundRect(birdX - textWidth/2 - 6, op.y - 34, textWidth + 12, 15, 4);
        ctx.fill();
        ctx.strokeStyle = op.isAlive ? '#f43f5e' : '#94a3b8';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = op.isAlive ? '#fecdd3' : '#94a3b8';
        ctx.fillText(tagText, birdX, op.y - 23);
        ctx.restore();
      });
    }
  }

  // Expose to window
  window.FlappyMultiplayer = FlappyMultiplayer;
  window.multiplayerEngine = new FlappyMultiplayer();

})(window);

