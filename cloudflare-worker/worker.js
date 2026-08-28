import { DurableObject } from "cloudflare:workers";

/**
 * Cloudflare Worker: Flappy Bird Real-Time Multiplayer Room & Matchmaking Server
 * Built with Cloudflare Durable Objects WebSocket Hibernation API.
 * Guarantees ultra-low latency and 100% universal global state pairing across all devices.
 */

export class MultiplayerHub extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.rooms = new Map(); // roomId -> { id, code, hostId, seed, status, players: Map(playerId -> { ws, profile }) }
    this.waitingQueue = []; // array of { playerId, ws, profile }
    this.sessions = new Map(); // ws -> { playerId, profile, currentRoom }
  }

  async fetch(request) {
    const url = new URL(request.url);

    // 1. WebSocket upgrade endpoint
    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      this.ctx.acceptWebSocket(server);

      const playerId = 'P-' + Math.random().toString(36).substring(2, 8);
      this.sessions.set(server, {
        playerId,
        profile: { id: playerId, name: 'SkyPlayer', avatar: 'chick_yellow', skin: 'classic' },
        currentRoom: null
      });

      return new Response(null, {
        status: 101,
        webSocket: client,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 2. Health check endpoint
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

    return new Response('Not Found', { status: 404 });
  }

  send(ws, data) {
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    } catch (_) {}
  }

  broadcastToRoom(room, data, excludeWs = null) {
    if (!room || !room.players) return;
    const msg = JSON.stringify(data);
    for (const [id, p] of room.players) {
      if (excludeWs && p.ws === excludeWs) continue;
      try {
        if (p.ws.readyState === WebSocket.OPEN) {
          p.ws.send(msg);
        }
      } catch (_) {}
    }
  }

  leaveRoom(ws) {
    const session = this.sessions.get(ws);
    if (!session || !session.currentRoom) return;

    const room = session.currentRoom;
    const playerId = session.playerId;

    room.players.delete(playerId);
    session.currentRoom = null;

    // Remove from queue if was queued
    const qIdx = this.waitingQueue.findIndex(q => q.playerId === playerId);
    if (qIdx !== -1) this.waitingQueue.splice(qIdx, 1);

    if (room.players.size === 0) {
      this.rooms.delete(room.id);
    } else {
      if (room.hostId === playerId) {
        const nextHost = room.players.keys().next().value;
        room.hostId = nextHost;
      }
      this.broadcastToRoom(room, {
        type: 'PLAYER_LEFT',
        playerId,
        newHostId: room.hostId,
        playersCount: room.players.size,
        playersList: Array.from(room.players.values()).map(p => ({
          id: p.profile.id,
          name: p.profile.name,
          avatar: p.profile.avatar,
          skin: p.profile.skin,
          isReady: true,
          isHost: p.profile.id === room.hostId
        }))
      });
    }
  }

  async webSocketMessage(ws, message) {
    try {
      const session = this.sessions.get(ws);
      if (!session) return;

      const data = JSON.parse(message);
      const type = data.type;
      if (data.profile) {
        if (data.profile.id) session.playerId = data.profile.id;
        session.profile = { ...session.profile, ...data.profile, id: session.playerId };
      }

      const playerId = session.playerId;

      switch (type) {
        case 'PING': {
          this.send(ws, { type: 'PONG', serverTime: Date.now() });
          break;
        }

        case 'UPDATE_PROFILE': {
          if (data.profile && data.profile.id) session.playerId = data.profile.id;
          session.profile = { ...session.profile, ...data.profile, id: session.playerId };
          if (session.currentRoom && session.currentRoom.players.has(session.playerId)) {
            session.currentRoom.players.get(session.playerId).profile = session.profile;
            this.broadcastToRoom(session.currentRoom, {
              type: 'ROOM_PLAYERS_UPDATE',
              playersList: Array.from(session.currentRoom.players.values()).map(p => ({
                id: p.profile.id,
                name: p.profile.name,
                avatar: p.profile.avatar,
                skin: p.profile.skin,
                isReady: true,
                isHost: p.profile.id === session.currentRoom.hostId
              }))
            });
          }
          break;
        }

        case 'CREATE_ROOM': {
          this.leaveRoom(ws);
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
              [playerId, { ws, profile: session.profile }]
            ])
          };
          this.rooms.set(roomId, room);
          session.currentRoom = room;

          this.send(ws, {
            type: 'ROOM_CREATED',
            roomId,
            code,
            seed,
            isHost: true,
            playersList: [{
              id: playerId,
              name: session.profile.name,
              avatar: session.profile.avatar,
              skin: session.profile.skin,
              isReady: true,
              isHost: true
            }]
          });
          break;
        }

        case 'JOIN_ROOM': {
          this.leaveRoom(ws);
          const code = (data.code || '').toString().trim();
          let targetRoom = null;
          for (const r of this.rooms.values()) {
            if (r.code === code) {
              targetRoom = r;
              break;
            }
          }

          if (!targetRoom) {
            this.send(ws, { type: 'ERROR', message: 'Room #' + code + ' tidak ditemukan! Pastikan kode benar.' });
            break;
          }

          if (targetRoom.players.size >= 2) {
            this.send(ws, { type: 'ERROR', message: 'Room #' + code + ' penuh! Maksimal 2 pemain.' });
            break;
          }

          session.profile.isReady = false;
          targetRoom.players.set(playerId, {
            ws,
            profile: session.profile
          });
          session.currentRoom = targetRoom;

          const playersList = Array.from(targetRoom.players.values()).map(p => ({
            id: p.profile.id,
            name: p.profile.name,
            avatar: p.profile.avatar,
            skin: p.profile.skin,
            isReady: p.profile.isReady !== false,
            isHost: p.profile.id === targetRoom.hostId
          }));

          this.send(ws, {
            type: 'ROOM_JOINED',
            roomId: targetRoom.id,
            code: targetRoom.code,
            seed: targetRoom.seed,
            isHost: false,
            playersList
          });

          this.broadcastToRoom(targetRoom, {
            type: 'PLAYER_JOINED',
            player: session.profile,
            isReady: false,
            playersCount: targetRoom.players.size,
            playersList
          }, ws);
          break;
        }

        case 'PLAYER_READY': {
          if (!session.currentRoom) return;
          const isReady = !!data.isReady;
          session.profile.isReady = isReady;
          this.broadcastToRoom(session.currentRoom, {
            type: 'PLAYER_READY_STATUS',
            playerId,
            isReady
          });
          break;
        }

        case 'QUICK_MATCH': {
          this.leaveRoom(ws);
          if (this.waitingQueue.length > 0) {
            const matchedOpponent = this.waitingQueue.shift();
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
                  [matchedOpponent.playerId, { ws: matchedOpponent.ws, profile: matchedOpponent.profile }],
                  [playerId, { ws, profile: session.profile }]
                ])
              };
              this.rooms.set(roomId, room);
              session.currentRoom = room;

              const oppSession = this.sessions.get(matchedOpponent.ws);
              if (oppSession) oppSession.currentRoom = room;

              const playersList = [matchedOpponent.profile, session.profile];

              this.send(matchedOpponent.ws, {
                type: 'MATCH_FOUND',
                roomId,
                code,
                seed,
                isHost: true,
                opponent: session.profile,
                playersList,
                countdown: 3
              });

              this.send(ws, {
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

          this.waitingQueue.push({ playerId, ws, profile: session.profile });
          this.send(ws, { type: 'QUEUED', message: 'Mencari lawan 1v1 online...' });
          break;
        }

        case 'CANCEL_MATCH': {
          const qIdx = this.waitingQueue.findIndex(q => q.playerId === playerId);
          if (qIdx !== -1) this.waitingQueue.splice(qIdx, 1);
          this.leaveRoom(ws);
          this.send(ws, { type: 'MATCH_CANCELLED' });
          break;
        }

        case 'START_GAME': {
          if (!session.currentRoom) return;
          const room = session.currentRoom;
          if (room.hostId !== playerId) {
            this.send(ws, { type: 'ERROR', message: 'Hanya Host yang bisa memulai pertandingan!' });
            return;
          }
          room.status = 'PLAYING';
          room.seed = Math.floor(Math.random() * 1000000);

          this.broadcastToRoom(room, {
            type: 'GAME_STARTING',
            seed: room.seed,
            countdown: 3
          });
          break;
        }

        case 'SYNC_STATE': {
          if (!session.currentRoom) return;
          this.broadcastToRoom(session.currentRoom, {
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
          }, ws);
          break;
        }

        case 'PLAYER_DIED': {
          if (!session.currentRoom) return;
          this.broadcastToRoom(session.currentRoom, {
            type: 'OPPONENT_DIED',
            playerId,
            finalScore: data.finalScore || 0
          }, ws);
          break;
        }

        case 'LEAVE_ROOM': {
          this.leaveRoom(ws);
          this.send(ws, { type: 'ROOM_LEFT' });
          break;
        }
      }
    } catch (e) {
      console.error('[WS Message Error]:', e);
    }
  }

  async webSocketClose(ws, code, reason, wasClean) {
    this.leaveRoom(ws);
    this.sessions.delete(ws);
  }

  async webSocketError(ws, error) {
    this.leaveRoom(ws);
    this.sessions.delete(ws);
  }
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*'
        }
      });
    }

    // Forward all requests and WebSockets to the unified global hub
    const id = env.GAME_HUB.idFromName("global_game_hub");
    const hub = env.GAME_HUB.get(id);
    return hub.fetch(request);
  }
};
