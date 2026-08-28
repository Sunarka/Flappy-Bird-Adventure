/**
 * Flappy Bird Sky Challenge - Cloudflare Real-Time Multiplayer Client Engine
 * Supports Cloudflare Workers WebSocket Rooms, Quick Matchmaking, BroadcastChannel local fallback,
 * and high-frequency ghost rival state interpolation.
 */

(function(window) {
  'use strict';

  // Default Cloudflare Worker WebSocket Relay URL (Can be customized by user or configured via settings)
  // When running locally or before worker deploy, it seamlessly utilizes BroadcastChannel for multi-tab testing!
  const DEFAULT_CF_WORKER_WS = 'wss://flappy-multiplayer.sunarka.workers.dev';

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
      if (this.isConnected) {
        this.send({ type: 'QUICK_MATCH', profile: this.myProfile });
      } else {
        // Instant simulated bot or local match
        this.emit('queued', { message: 'Mencari lawan 1v1 online...' });
        setTimeout(() => {
          const fakeOpponent = {
            id: 'RIVAL-' + Math.floor(100 + Math.random() * 900),
            name: 'Cyber_Flapper',
            avatar: 'robo_mecha',
            skin: 'cyber',
            isReady: true,
            isHost: false
          };
          const code = Math.floor(1000 + Math.random() * 9000).toString();
          const seed = Math.floor(Math.random() * 1000000);
          this.currentRoom = {
            roomId: 'qm_' + code,
            code,
            seed,
            isHost: true,
            playersList: [this.myProfile, fakeOpponent]
          };
          this.matchStatus = 'COUNTDOWN';
          this.setSeed(seed);
          this.opponents.set(fakeOpponent.id, {
            id: fakeOpponent.id,
            name: fakeOpponent.name,
            avatar: fakeOpponent.avatar,
            skin: fakeOpponent.skin,
            y: 250,
            vy: 0,
            rot: 0,
            score: 0,
            isAlive: true,
            isDashing: false,
            targetY: 250,
            lastUpdate: Date.now(),
            isSimulatedBot: true
          });
          this.emit('match_found', {
            roomId: this.currentRoom.roomId,
            code,
            seed,
            playersList: this.currentRoom.playersList,
            countdown: 3
          });
        }, 1200);
      }
    }

    cancelMatch() {
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
    updateOpponents(dt) {
      this.opponents.forEach(op => {
        if (!op.isAlive) return;

        // If simulated bot, simulate graceful flapping
        if (op.isSimulatedBot && this.matchStatus === 'PLAYING') {
          op.simTimer = (op.simTimer || 0) + dt;
          if (op.simTimer > 0.38) {
            op.simTimer = 0;
            op.vy = -260;
          }
          op.vy = (op.vy || 0) + 750 * dt;
          op.targetY = (op.targetY || 250) + op.vy * dt;
          if (op.targetY < 50) op.targetY = 50;
          if (op.targetY > 520) {
            op.targetY = 520;
            op.isAlive = false;
            this.emit('opponent_died', { playerId: op.id, finalScore: op.score });
          }
        }

        // Smooth Lerp target position
        const lerpFactor = Math.min(1, dt * 14);
        op.y = op.y + (op.targetY - op.y) * lerpFactor;
      });
    }

    // Render opponent birds onto canvas with ghostly aesthetics & player nametag
    renderOpponents(ctx, birdX = 90) {
      if (this.opponents.size === 0) return;

      this.opponents.forEach(op => {
        if (!op.isAlive && op.y >= 530) return;

        ctx.save();
        ctx.translate(birdX, op.y);
        ctx.rotate(op.rot || 0);

        // Ghostly Semi-transparent Rival Glow
        ctx.globalAlpha = op.isAlive ? 0.78 : 0.35;

        // Rival Bird Body
        ctx.fillStyle = op.isAlive ? '#f43f5e' : '#64748b';
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffe4e6';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Eye
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(7, -4, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(8.5, -4, 2, 0, Math.PI * 2);
        ctx.fill();

        // Beak
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(14, -2);
        ctx.lineTo(22, 1);
        ctx.lineTo(14, 5);
        ctx.closePath();
        ctx.fill();

        // Wing
        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.ellipse(-5, 1, 8, 5, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Dash trail if active
        if (op.isDashing) {
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(-22, 0, 8, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // Opponent Name Tag & Live Score above head
        ctx.save();
        ctx.font = 'bold 9px "Trebuchet MS", Arial, sans-serif';
        ctx.textAlign = 'center';
        
        // Name pill
        const tagText = `${op.name} (${op.score || 0} pts)`;
        const textWidth = ctx.measureText(tagText).width;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.beginPath();
        ctx.roundRect(birdX - textWidth/2 - 6, op.y - 30, textWidth + 12, 14, 4);
        ctx.fill();
        ctx.strokeStyle = op.isAlive ? '#f43f5e' : '#94a3b8';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = op.isAlive ? '#fecdd3' : '#94a3b8';
        ctx.fillText(tagText, birdX, op.y - 19);
        ctx.restore();
      });
    }
  }

  // Expose to window
  window.FlappyMultiplayer = FlappyMultiplayer;
  window.multiplayerEngine = new FlappyMultiplayer();

})(window);
