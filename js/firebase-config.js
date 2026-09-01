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
        aura: player.loadout?.aura || 'default',
        hat: player.loadout?.hat || 'none',
        outfit: player.loadout?.outfit || 'none',
        pipe: player.loadout?.pipe || 'green',
        background: player.loadout?.background || 'sky'
      },
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
            // Update nama & kosmetik tanpa menurunkan highscore
            await docRef.set({
              name: payload.name,
              avatar: payload.avatar,
              loadout: payload.loadout,
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
   * Fetch User Profile from Firestore by UID (Cross-Device Cloud Sync)
   * @param {string} uid
   */
  async fetchUserProfile(uid) {
    if (!uid || !this.isInitialized || !this.db) return null;
    try {
      const doc = await this.db.collection('flappy_users').doc(String(uid)).get();
      if (doc.exists) {
        return doc.data();
      }
    } catch(err) {
      console.warn('[Firebase] fetchUserProfile error:', err.message);
    }
    return null;
  }

  /**
   * Save or Update User Profile in Firestore by UID
   * @param {string} uid
   * @param {Object} data
   */
  async saveUserProfile(uid, data) {
    if (!uid || !data || !this.isInitialized || !this.db) return false;
    try {
      await this.db.collection('flappy_users').doc(String(uid)).set(data, { merge: true });
      return true;
    } catch(err) {
      console.warn('[Firebase] saveUserProfile error:', err.message);
      return false;
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

