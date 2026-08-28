/**
 * Cloudflare Worker: Flappy Bird Real-Time Multiplayer Room & Matchmaking Server
 * Uses Cloudflare Durable Objects to guarantee that ALL players globally
 * connect to the EXACT SAME real-time room registry & matchmaking queue!
 */

export class MultiplayerHub {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.rooms = new Map(); // roomId -> { code, hostId, players: Map(playerId -> { ws, profile, isReady, lastSeen }), seed, status }
    this.waitingQueue = []; // array of { playerId, ws, profile }
  }

  async fetch(request) {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health' || url.pathname === '/') {
      return new Response(JSON.stringify({
        status: 'online',
        server: 'FlappyBird Global Durable Multiplayer Hub',
        activeRooms: this.rooms.size,
        queueSize: this.waitingQueue.length,
        time: new Date().toISOString()
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // WebSocket upgrade endpoint
    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      this.handleSession(server);

      return new Response(null, {
        status: 101,
        webSocket: client,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    return new Response('Not Found', { status: 404 });
  }

  handleSession(ws) {
    ws.accept();

    const hub = this;
    let playerId = 'P-' + Math.random().toString(36).substring(2, 8);
    let playerProfile = { id: playerId, name: 'SkyPlayer', avatar: 'chick_yellow', skin: 'classic' };
    let currentRoom = null;

    function send(data) {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      } catch (_) {}
    }

    function broadcastToRoom(room, data, excludeSelf = false) {
      if (!room || !room.players) return;
      const msg = JSON.stringify(data);
      for (const [id, p] of room.players) {
        if (excludeSelf && id === playerId) continue;
        try {
          if (p.ws.readyState === WebSocket.OPEN) {
            p.ws.send(msg);
          }
        } catch (_) {}
      }
    }

    function leaveCurrentRoom() {
      if (!currentRoom) return;
      const room = currentRoom;
      room.players.delete(playerId);

      // Remove from queue if was queued
      const qIdx = hub.waitingQueue.findIndex(q => q.playerId === playerId);
      if (qIdx !== -1) hub.waitingQueue.splice(qIdx, 1);

      if (room.players.size === 0) {
        hub.rooms.delete(room.id);
      } else {
        if (room.hostId === playerId) {
          const nextHost = room.players.keys().next().value;
          room.hostId = nextHost;
        }
        broadcastToRoom(room, {
          type: 'PLAYER_LEFT',
          playerId,
          newHostId: room.hostId,
          playersCount: room.players.size,
          playersList: Array.from(room.players.values()).map(p => ({
            id: p.profile.id,
            name: p.profile.name,
            avatar: p.profile.avatar,
            skin: p.profile.skin,
            isReady: p.isReady,
            isHost: p.profile.id === room.hostId
          }))
        });
      }
      currentRoom = null;
    }

    ws.addEventListener('message', event => {
      try {
        const data = JSON.parse(event.data);
        const type = data.type;

        if (data.profile) {
          playerProfile = { ...playerProfile, ...data.profile, id: playerId };
        }

        switch (type) {
          case 'PING': {
            send({ type: 'PONG', serverTime: Date.now() });
            break;
          }

          case 'UPDATE_PROFILE': {
            playerProfile = { ...playerProfile, ...data.profile, id: playerId };
            if (currentRoom && currentRoom.players.has(playerId)) {
              currentRoom.players.get(playerId).profile = playerProfile;
              broadcastToRoom(currentRoom, {
                type: 'ROOM_PLAYERS_UPDATE',
                playersList: Array.from(currentRoom.players.values()).map(p => ({
                  id: p.profile.id,
                  name: p.profile.name,
                  avatar: p.profile.avatar,
                  skin: p.profile.skin,
                  isReady: p.isReady,
                  isHost: p.profile.id === currentRoom.hostId
                }))
              });
            }
            break;
          }

          case 'CREATE_ROOM': {
            leaveCurrentRoom();
            const code = data.code || Math.floor(1000 + Math.random() * 9000).toString();
            const roomId = 'room_' + code;
            const seed = Math.floor(Math.random() * 1000000);

            const room = {
              id: roomId,
              code,
              hostId: playerId,
              seed,
              status: 'LOBBY',
              players: new Map([
                [playerId, { ws, profile: playerProfile, isReady: true, lastSeen: Date.now() }]
              ])
            };
            hub.rooms.set(roomId, room);
            currentRoom = room;

            send({
              type: 'ROOM_CREATED',
              roomId,
              code,
              seed,
              isHost: true,
              playersList: [{
                id: playerId,
                name: playerProfile.name,
                avatar: playerProfile.avatar,
                skin: playerProfile.skin,
                isReady: true,
                isHost: true
              }]
            });
            break;
          }

          case 'JOIN_ROOM': {
            leaveCurrentRoom();
            const code = (data.code || '').toString().trim();
            let targetRoom = null;
            for (const r of hub.rooms.values()) {
              if (r.code === code) {
                targetRoom = r;
                break;
              }
            }

            if (!targetRoom) {
              send({ type: 'ERROR', message: 'Room dengan kode #' + code + ' tidak ditemukan!' });
              break;
            }

            if (targetRoom.players.size >= 2) {
              send({ type: 'ERROR', message: 'Room #' + code + ' penuh! Maksimal 2 pemain.' });
              break;
            }

            targetRoom.players.set(playerId, {
              ws,
              profile: playerProfile,
              isReady: false,
              lastSeen: Date.now()
            });
            currentRoom = targetRoom;

            const playersList = Array.from(targetRoom.players.values()).map(p => ({
              id: p.profile.id,
              name: p.profile.name,
              avatar: p.profile.avatar,
              skin: p.profile.skin,
              isReady: p.isReady,
              isHost: p.profile.id === targetRoom.hostId
            }));

            send({
              type: 'ROOM_JOINED',
              roomId: targetRoom.id,
              code: targetRoom.code,
              seed: targetRoom.seed,
              isHost: false,
              playersList
            });

            broadcastToRoom(targetRoom, {
              type: 'PLAYER_JOINED',
              player: playerProfile,
              playersCount: targetRoom.players.size,
              playersList
            }, true);
            break;
          }

          case 'QUICK_MATCH': {
            leaveCurrentRoom();
            if (hub.waitingQueue.length > 0) {
              const matchedOpponent = hub.waitingQueue.shift();
              if (matchedOpponent.ws.readyState === WebSocket.OPEN && matchedOpponent.playerId !== playerId) {
                const code = Math.floor(1000 + Math.random() * 9000).toString();
                const roomId = 'quick_' + code;
                const seed = Math.floor(Math.random() * 1000000);

                const room = {
                  id: roomId,
                  code,
                  hostId: matchedOpponent.playerId,
                  seed,
                  status: 'COUNTDOWN',
                  players: new Map([
                    [matchedOpponent.playerId, { ws: matchedOpponent.ws, profile: matchedOpponent.profile, isReady: true, lastSeen: Date.now() }],
                    [playerId, { ws, profile: playerProfile, isReady: true, lastSeen: Date.now() }]
                  ])
                };
                hub.rooms.set(roomId, room);
                currentRoom = room;

                const playersList = [matchedOpponent.profile, playerProfile];

                try {
                  matchedOpponent.ws.send(JSON.stringify({
                    type: 'MATCH_FOUND',
                    roomId,
                    code,
                    seed,
                    isHost: true,
                    opponent: playerProfile,
                    playersList,
                    countdown: 3
                  }));
                } catch (_) {}

                send({
                  type: 'MATCH_FOUND',
                  roomId,
                  code,
                  seed,
                  isHost: false,
                  opponent: matchedOpponent.profile,
                  playersList,
                  countdown: 3
                });
                return;
              }
            }

            hub.waitingQueue.push({ playerId, ws, profile: playerProfile });
            send({ type: 'QUEUED', message: 'Mencari lawan 1v1 online...' });
            break;
          }

          case 'CANCEL_MATCH': {
            const qIdx = hub.waitingQueue.findIndex(q => q.playerId === playerId);
            if (qIdx !== -1) hub.waitingQueue.splice(qIdx, 1);
            leaveCurrentRoom();
            send({ type: 'MATCH_CANCELLED' });
            break;
          }

          case 'START_GAME': {
            if (!currentRoom) return;
            if (currentRoom.hostId !== playerId) {
              send({ type: 'ERROR', message: 'Hanya Host yang bisa memulai pertandingan!' });
              return;
            }
            currentRoom.status = 'PLAYING';
            currentRoom.seed = Math.floor(Math.random() * 1000000);

            broadcastToRoom(currentRoom, {
              type: 'GAME_STARTING',
              seed: currentRoom.seed,
              countdown: 3
            });
            break;
          }

          case 'SYNC_STATE': {
            if (!currentRoom) return;
            broadcastToRoom(currentRoom, {
              type: 'OPPONENT_STATE',
              playerId,
              y: data.y,
              vy: data.vy,
              rot: data.rot,
              score: data.score,
              lives: data.lives,
              isAlive: data.isAlive,
              isDashing: data.isDashing,
              time: data.time || data.t
            }, true);
            break;
          }

          case 'PLAYER_DIED': {
            if (!currentRoom) return;
            broadcastToRoom(currentRoom, {
              type: 'OPPONENT_DIED',
              playerId,
              finalScore: data.finalScore || 0
            }, true);
            break;
          }

          case 'LEAVE_ROOM': {
            leaveCurrentRoom();
            send({ type: 'ROOM_LEFT' });
            break;
          }
        }
      } catch (e) {
        console.error('[WS Message Error]:', e);
      }
    });

    ws.addEventListener('close', () => {
      leaveCurrentRoom();
    });

    ws.addEventListener('error', () => {
      leaveCurrentRoom();
    });
  }
}

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*'
        }
      });
    }

    // If Durable Object is bound, forward everything to the unified global hub
    if (env.GAME_HUB) {
      const id = env.GAME_HUB.idFromName("global_game_hub");
      const hub = env.GAME_HUB.get(id);
      return hub.fetch(request);
    }

    // Direct fallback if running in basic standalone mode
    const hub = new MultiplayerHub(null, env);
    return hub.fetch(request);
  }
};
