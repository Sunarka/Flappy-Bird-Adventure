/**
 * Cloudflare Worker: Flappy Bird Real-Time Multiplayer Room & Matchmaking Server
 * Handles WebSocket connections, Room Codes (4-digit), Quick Matchmaking, and State Relay.
 */

// In-Memory Room and Matchmaking Registry
const rooms = new Map(); // roomId -> { code, hostId, players: Map(playerId -> { ws, profile, isReady, lastSeen }), seed, status }
const waitingQueue = []; // array of { playerId, ws, profile }

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

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

    // Health check endpoint
    if (url.pathname === '/health' || url.pathname === '/') {
      return new Response(JSON.stringify({
        status: 'online',
        server: 'FlappyBird Cloudflare Multiplayer Relay',
        activeRooms: rooms.size,
        queueSize: waitingQueue.length,
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

      handleSession(server);

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
};

function handleSession(ws) {
  ws.accept();

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
    const qIdx = waitingQueue.findIndex(q => q.playerId === playerId);
    if (qIdx !== -1) waitingQueue.splice(qIdx, 1);

    if (room.players.size === 0) {
      rooms.delete(room.id);
    } else {
      // If host left, assign new host
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

      // Update profile info
      if (data.profile) {
        playerProfile = { ...playerProfile, ...data.profile, id: playerId };
      }

      switch (type) {
        case 'PING': {
          send({ type: 'PONG', serverTime: Date.now() });
          break;
        }

        case 'CREATE_ROOM': {
          leaveCurrentRoom();
          const code = Math.floor(1000 + Math.random() * 9000).toString();
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
          rooms.set(roomId, room);
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
          for (const r of rooms.values()) {
            if (r.code === code) {
              targetRoom = r;
              break;
            }
          }

          if (!targetRoom) {
            send({ type: 'ERROR', message: 'Room dengan kode ' + code + ' tidak ditemukan!' });
            break;
          }

          if (targetRoom.players.size >= 2) {
            send({ type: 'ERROR', message: 'Room penuh! Maksimal 2 pemain dalam 1v1 Battle.' });
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

          // Notify this player
          send({
            type: 'ROOM_JOINED',
            roomId: targetRoom.id,
            code: targetRoom.code,
            seed: targetRoom.seed,
            isHost: false,
            playersList
          });

          // Notify other player in room
          broadcastToRoom(targetRoom, {
            type: 'PLAYER_JOINED',
            player: {
              id: playerId,
              name: playerProfile.name,
              avatar: playerProfile.avatar,
              skin: playerProfile.skin,
              isReady: false,
              isHost: false
            },
            playersList
          }, true);
          break;
        }

        case 'QUICK_MATCH': {
          leaveCurrentRoom();

          // Check if someone in queue
          while (waitingQueue.length > 0) {
            const opponent = waitingQueue.shift();
            // Verify opponent ws still alive
            if (opponent.ws.readyState === WebSocket.OPEN && opponent.playerId !== playerId) {
              const code = Math.floor(1000 + Math.random() * 9000).toString();
              const roomId = 'qm_' + code;
              const seed = Math.floor(Math.random() * 1000000);

              const room = {
                id: roomId,
                code,
                hostId: opponent.playerId,
                seed,
                status: 'STARTING',
                players: new Map([
                  [opponent.playerId, opponent],
                  [playerId, { ws, profile: playerProfile, isReady: true, lastSeen: Date.now() }]
                ])
              };
              rooms.set(roomId, room);
              currentRoom = room;

              const playersList = [
                { id: opponent.profile.id, name: opponent.profile.name, avatar: opponent.profile.avatar, skin: opponent.profile.skin, isReady: true, isHost: true },
                { id: playerProfile.id, name: playerProfile.name, avatar: playerProfile.avatar, skin: playerProfile.skin, isReady: true, isHost: false }
              ];

              // Notify both players match is ready
              broadcastToRoom(room, {
                type: 'MATCH_FOUND',
                roomId,
                code,
                seed,
                playersList,
                countdown: 3
              });
              return;
            }
          }

          // No opponent yet, put in queue
          waitingQueue.push({ playerId, ws, profile: playerProfile, isReady: true, lastSeen: Date.now() });
          send({ type: 'QUEUED_FOR_MATCH', message: 'Mencari lawan 1v1 online...' });
          break;
        }

        case 'CANCEL_MATCH': {
          const qIdx = waitingQueue.findIndex(q => q.playerId === playerId);
          if (qIdx !== -1) waitingQueue.splice(qIdx, 1);
          send({ type: 'MATCH_CANCELLED' });
          break;
        }

        case 'SET_READY': {
          if (!currentRoom) return;
          const p = currentRoom.players.get(playerId);
          if (p) {
            p.isReady = !!data.isReady;
            broadcastToRoom(currentRoom, {
              type: 'PLAYER_READY_STATUS',
              playerId,
              isReady: p.isReady
            });
          }
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
          // Relay bird position, score, alive state to opponent
          broadcastToRoom(currentRoom, {
            type: 'OPPONENT_STATE',
            playerId,
            y: data.y,
            vy: data.vy,
            rot: data.rot,
            score: data.score,
            isAlive: data.isAlive,
            isDashing: data.isDashing,
            t: data.t
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

        case 'REMATCH_REQUEST': {
          if (!currentRoom) return;
          broadcastToRoom(currentRoom, {
            type: 'REMATCH_OFFER',
            fromPlayerId: playerId
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
