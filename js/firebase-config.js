// =======================================================
// FIREBASE FIRESTORE GLOBAL LEADERBOARD CONFIGURATION
// =======================================================

/**
 * Petunjuk Konfigurasi Firebase:
 * 1. Buka https://console.firebase.google.com/
 * 2. Buat Project baru (atau gunakan yang sudah ada).
 * 3. Buka menu 'Firestore Database', klik 'Create Database' (mode Production atau Test).
 * 4. Buka Project Settings > General > Your apps > Web (</>) > Register App.
 * 5. Salin konfigurasi `firebaseConfig` Anda dan tempel di bawah ini.
 */

const firebaseConfig = {
  apiKey: "AIzaSyC7SH--W8EVVGMoEB0fs9p5bGLh3WE6XhU",
  authDomain: "tess-d.firebaseapp.com",
  projectId: "tess-d",
  storageBucket: "tess-d.firebasestorage.app",
  messagingSenderId: "20890561839",
  appId: "1:20890561839:web:121ee25cddfdc6d13745da",
  measurementId: "G-HN102WGTFD"
};

class FirebaseLeaderboardService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
    this.collectionName = 'flappy_leaderboard';
    this.cachedScores = [];
    this.listeners = [];
    this.unsubscribeSnapshot = null;

    this.init();
  }

  init() {
    if (typeof firebase !== 'undefined') {
      try {
        if (!firebase.apps || !firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        this.db = firebase.firestore();
        this.isInitialized = true;
        console.log('[Firebase] Firestore Leaderboard initialized successfully.');
      } catch (err) {
        console.warn('[Firebase] Init error (using local fallback mode):', err.message);
        this.isInitialized = false;
      }
    } else {
      console.warn('[Firebase] SDK not loaded.');
      this.isInitialized = false;
    }
  }

  /**
   * Submit or update player's high score to Firestore using Unique Primary Key
   * @param {Object} player - { primaryKey, id, uid, name, score, tier, avatar, loadout }
   */
  async submitScore(player) {
    if (!player || !player.name || typeof player.score !== 'number') return false;

    // PRIMARY KEY KETAT: 1 Akun = 1 Primary Key = 1 Dokumen Firestore
    const primaryKey = player.primaryKey || (player.uid ? ('acc_' + player.uid) : ('user_' + String(player.id || player.name).replace(/[^a-zA-Z0-9_-]/g, '_')));
    const docId = primaryKey;

    const payload = {
      primaryKey: primaryKey,
      id: primaryKey,
      uid: player.uid || '',
      name: String(player.name).slice(0, 20),
      score: Math.floor(player.score),
      tier: player.tier || 'BRONZE I',
      avatar: player.avatar || 'chick_yellow',
      loadout: {
        bird: player.loadout?.bird || 'classic',
        pet: player.loadout?.pet || 'pip_peep',
        aura: player.loadout?.aura || 'default',
        hat: player.loadout?.hat || 'none',
        outfit: player.loadout?.outfit || 'none',
        pipe: player.loadout?.pipe || 'green',
        background: player.loadout?.background || 'sky',
        music: player.loadout?.music || 'happy',
        booster: player.loadout?.booster || 'none'
      },
      unlocked: player.unlocked || {},
      updatedAt: (typeof firebase !== 'undefined' && firebase.firestore?.FieldValue)
        ? firebase.firestore.FieldValue.serverTimestamp()
        : new Date().toISOString()
    };

    if (this.isInitialized && this.db) {
      try {
        const docRef = this.db.collection(this.collectionName).doc(docId);
        
        // Ambil data lama jika ada
        const existingDoc = await docRef.get();
        if (existingDoc.exists) {
          const oldScore = existingDoc.data().score || 0;
          if (payload.score >= oldScore) {
            await docRef.set(payload, { merge: true });
            console.log('[Firebase] Score updated for Primary Key:', primaryKey, payload.score);
          } else {
            // Update nama, pet, & kosmetik tanpa menurunkan highscore
            await docRef.set({
              name: payload.name,
              avatar: payload.avatar,
              loadout: payload.loadout,
              unlocked: payload.unlocked,
              updatedAt: payload.updatedAt
            }, { merge: true });
          }
        } else {
          await docRef.set(payload);
          console.log('[Firebase] Primary Key registered:', primaryKey, payload.score);
        }
        return true;
      } catch (err) {
        console.warn('[Firebase] submitScore error:', err.message);
        return false;
      }
    }
    return false;
  }

  /**
   * Fetch Top N players from Firestore
   * @param {number} limitCount
   */
  async fetchTopScores(limitCount = 20) {
    if (this.isInitialized && this.db) {
      try {
        const querySnapshot = await this.db.collection(this.collectionName)
          .orderBy('score', 'desc')
          .limit(limitCount)
          .get();

        const results = [];
        querySnapshot.forEach(doc => {
          results.push(doc.data());
        });

        if (results.length > 0) {
          this.cachedScores = results;
          return results;
        }
      } catch (err) {
        console.warn('[Firebase] fetchTopScores error:', err.message);
      }
    }
    return this.cachedScores;
  }

  /**
   * Listen to real-time Leaderboard updates
   * @param {Function} callback
   */
  listenToLeaderboard(callback, limitCount = 20) {
    if (typeof callback !== 'function') return;

    if (this.isInitialized && this.db) {
      try {
        if (this.unsubscribeSnapshot) {
          this.unsubscribeSnapshot();
        }

        this.unsubscribeSnapshot = this.db.collection(this.collectionName)
          .orderBy('score', 'desc')
          .limit(limitCount)
          .onSnapshot(snapshot => {
            const results = [];
            snapshot.forEach(doc => {
              results.push(doc.data());
            });

            if (results.length > 0) {
              this.cachedScores = results;
              callback(results);
            }
          }, err => {
            console.warn('[Firebase] Realtime listener error:', err.message);
          });
      } catch (err) {
        console.warn('[Firebase] listenToLeaderboard error:', err.message);
      }
    }
  }

  /**
   * Google Play Games Sign-In via Google Auth Provider
   */
  async signInWithGooglePlay() {
    if (typeof firebase === 'undefined' || !firebase.auth) {
      throw new Error('Firebase Auth SDK belum dimuat');
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await firebase.auth().signInWithPopup(provider);
    if(result.user) result.user.providerType = 'play_games';
    return result.user;
  }

  /**
   * Google Sign-In via Firebase Auth Popup
   */
  async signInWithGoogle() {
    if (typeof firebase === 'undefined' || !firebase.auth) {
      throw new Error('Firebase Auth SDK belum dimuat');
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await firebase.auth().signInWithPopup(provider);
    if(result.user) result.user.providerType = 'google';
    return result.user;
  }

  /**
   * Facebook Sign-In via Firebase Auth Popup
   */
  async signInWithFacebook() {
    if (typeof firebase === 'undefined' || !firebase.auth) {
      throw new Error('Firebase Auth SDK belum dimuat');
    }
    const provider = new firebase.auth.FacebookAuthProvider();
    provider.addScope('public_profile');
    provider.addScope('email');
    const result = await firebase.auth().signInWithPopup(provider);
    if(result.user) result.user.providerType = 'facebook';
    return result.user;
  }

  /**
   * Sign Out from any provider
   */
  async signOut() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      await firebase.auth().signOut();
    }
  }

  /**
   * Fetch User Profile from Firestore by Primary Key (Cross-Device Cloud Sync)
   * @param {string} primaryKey
   */
  async fetchUserProfile(primaryKey) {
    if (!primaryKey || !this.isInitialized || !this.db) return null;
    const cleanKey = String(primaryKey).replace(/[^a-zA-Z0-9_-]/g, '_');
    try {
      // 1. Cek di flappy_leaderboard (dokumen utama yang menyimpan profil & skor)
      const doc = await this.db.collection(this.collectionName).doc(cleanKey).get();
      if (doc.exists) {
        const d = doc.data();
        return {
          gamerTag: d.name || d.gamerTag,
          avatar: d.avatar,
          tier: d.tier || 'BRONZE I',
          rankedBest: typeof d.score === 'number' ? d.score : (d.rankedBest || 0),
          classicBest: typeof d.classicBest === 'number' ? d.classicBest : 0,
          coins: d.coins || 0,
          nameChangesDone: d.nameChangesDone || 0,
          loadout: {
            bird: d.loadout?.bird || 'classic',
            pet: d.loadout?.pet || 'pip_peep',
            aura: d.loadout?.aura || 'default',
            hat: d.loadout?.hat || 'none',
            outfit: d.loadout?.outfit || 'none',
            pipe: d.loadout?.pipe || 'green',
            background: d.loadout?.background || 'sky',
            music: d.loadout?.music || 'happy',
            booster: d.loadout?.booster || 'none'
          },
          unlocked: d.unlocked || {}
        };
      }

      // 2. Cek variasi UID tanpa prefix 'acc_'
      const rawUid = cleanKey.replace(/^acc_/, '');
      if (rawUid !== cleanKey) {
        const doc2 = await this.db.collection(this.collectionName).doc(rawUid).get();
        if (doc2.exists) {
          const d2 = doc2.data();
          return {
            gamerTag: d2.name || d2.gamerTag,
            avatar: d2.avatar,
            tier: d2.tier || 'BRONZE I',
            rankedBest: typeof d2.score === 'number' ? d2.score : (d2.rankedBest || 0),
            classicBest: typeof d2.classicBest === 'number' ? d2.classicBest : 0,
            coins: d2.coins || 0,
            nameChangesDone: d2.nameChangesDone || 0,
            loadout: {
              bird: d2.loadout?.bird || 'classic',
              pet: d2.loadout?.pet || 'pip_peep',
              aura: d2.loadout?.aura || 'default',
              hat: d2.loadout?.hat || 'none',
              outfit: d2.loadout?.outfit || 'none',
              pipe: d2.loadout?.pipe || 'green',
              background: d2.loadout?.background || 'sky',
              music: d2.loadout?.music || 'happy',
              booster: d2.loadout?.booster || 'none'
            },
            unlocked: d2.unlocked || {}
          };
        }
      }
    } catch(err) {
      console.warn('[Firebase] fetchUserProfile error:', err.message);
    }
    return null;
  }

  /**
   * Save or Update User Profile in Firestore by Primary Key
   * @param {string} primaryKey
   * @param {Object} data
   */
  async saveUserProfile(primaryKey, data) {
    if (!primaryKey || !data || !this.isInitialized || !this.db) return false;
    const cleanKey = String(primaryKey).replace(/[^a-zA-Z0-9_-]/g, '_');
    try {
      const payload = {
        primaryKey: cleanKey,
        id: cleanKey,
        uid: data.uid || cleanKey.replace(/^acc_/, ''),
        name: String(data.gamerTag || data.name || 'SkyPlayer').slice(0, 20),
        avatar: data.avatar || 'chick_yellow',
        tier: data.tier || 'BRONZE I',
        nameChangesDone: data.nameChangesDone || 0,
        score: typeof data.rankedBest === 'number' ? data.rankedBest : (typeof data.score === 'number' ? data.score : 0),
        classicBest: typeof data.classicBest === 'number' ? data.classicBest : 0,
        coins: typeof data.coins === 'number' ? data.coins : 0,
        loadout: {
          bird: data.loadout?.bird || 'classic',
          pet: data.loadout?.pet || 'pip_peep',
          aura: data.loadout?.aura || 'default',
          hat: data.loadout?.hat || 'none',
          outfit: data.loadout?.outfit || 'none',
          pipe: data.loadout?.pipe || 'green',
          background: data.loadout?.background || 'sky',
          music: data.loadout?.music || 'happy',
          booster: data.loadout?.booster || 'none'
        },
        unlocked: data.unlocked || {},
        updatedAt: (typeof firebase !== 'undefined' && firebase.firestore?.FieldValue)
          ? firebase.firestore.FieldValue.serverTimestamp()
          : new Date().toISOString()
      };
      await this.db.collection(this.collectionName).doc(cleanKey).set(payload, { merge: true });
      return true;
    } catch(err) {
      console.warn('[Firebase] saveUserProfile error:', err.message);
      return false;
    }
  }

  /**
   * Listen to real-time User Profile changes (Live Cross-Device Sync)
   * @param {string} primaryKey
   * @param {Function} callback
   */
  listenToUserProfile(primaryKey, callback) {
    if (!primaryKey || !this.isInitialized || !this.db || typeof callback !== 'function') return () => {};
    const cleanKey = String(primaryKey).replace(/[^a-zA-Z0-9_-]/g, '_');
    try {
      return this.db.collection(this.collectionName).doc(cleanKey).onSnapshot(doc => {
        if (doc && doc.exists) {
          const d = doc.data();
          callback({
            gamerTag: d.name || d.gamerTag,
            avatar: d.avatar,
            tier: d.tier || 'BRONZE I',
            rankedBest: typeof d.score === 'number' ? d.score : (d.rankedBest || 0),
            classicBest: typeof d.classicBest === 'number' ? d.classicBest : 0,
            coins: d.coins || 0,
            nameChangesDone: d.nameChangesDone || 0,
            loadout: {
              bird: d.loadout?.bird || 'classic',
              pet: d.loadout?.pet || 'pip_peep',
              aura: d.loadout?.aura || 'default',
              hat: d.loadout?.hat || 'none',
              outfit: d.loadout?.outfit || 'none',
              pipe: d.loadout?.pipe || 'green',
              background: d.loadout?.background || 'sky',
              music: d.loadout?.music || 'happy',
              booster: d.loadout?.booster || 'none'
            },
            unlocked: d.unlocked || {}
          });
        }
      }, err => {
        console.warn('[Firebase] listenToUserProfile error:', err.message);
      });
    } catch(err) {
      console.warn('[Firebase] listenToUserProfile exception:', err.message);
      return () => {};
    }
  }

  /**
   * Listen to Auth State Changes
   */
  onAuthStateChanged(callback) {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      return firebase.auth().onAuthStateChanged(callback);
    }
    return () => {};
  }
}

// Global Export
window.FirebaseLeaderboard = new FirebaseLeaderboardService();

