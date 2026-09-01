/**
 * =========================================================
 * GOOGLE ADMOB & H5 GAMES ADS REWARDED SDK CONFIGURATION
 * =========================================================
 * 
 * CARA MENGHUBUNGKAN AKUN GOOGLE ADMOB / ADSENSE ANDA:
 * 1. Buka dashboard Google AdMob / Google AdSense Anda.
 * 2. Salin Publisher ID Anda (format: ca-pub-XXXXXXXXXXXXXXXX)
 *    lalu masukkan ke variabel `PUBLISHER_ID` di bawah.
 * 3. Jika menggunakan Ad Unit / Channel ID khusus, masukkan ke `CHANNEL_ID`.
 * 4. Untuk mode uji coba / testing, set `TEST_MODE: true` agar tidak melanggar
 *    kebijakan penayangan iklan Google.
 */

(function(window) {
  const AdMobConfig = {
    // GANTI DENGAN PUBLISHER ID GOOGLE ADMOB / ADSENSE ASLI ANDA:
    PUBLISHER_ID: 'ca-pub-0000000000000000', // Ganti dengan ca-pub-XXXXXXXXXXXXXXXX Anda

    // Channel ID / Ad Unit ID khusus (opsional):
    CHANNEL_ID: 'rewarded_coin_ad',

    // Mode Pengujian: true = menampilkan iklan test AdMob / Simulator, false = Iklan Real Live
    TEST_MODE: true,

    // Frekuensi hint untuk Google H5 Games Ads
    FREQUENCY_HINT: '30s',

    // Nilai Koin Hadiah
    REWARD_COIN_AMOUNT: 25
  };

  // Inisialisasi Google H5 Games Ads SDK (adsbygoogle / adBreak / adConfig)
  window.adsbygoogle = window.adsbygoogle || [];
  window.adBreak = window.adConfig = function(o) {
    if (window.adsbygoogle && typeof window.adsbygoogle.push === 'function') {
      window.adsbygoogle.push(o);
    }
  };

  // Muat script Google Ads secara dinamis jika Publisher ID valid dan bukan placeholder
  if (AdMobConfig.PUBLISHER_ID && AdMobConfig.PUBLISHER_ID !== 'ca-pub-0000000000000000') {
    const adScript = document.createElement('script');
    adScript.async = true;
    adScript.setAttribute('data-ad-client', AdMobConfig.PUBLISHER_ID);
    adScript.setAttribute('data-ad-frequency-hint', AdMobConfig.FREQUENCY_HINT);
    if (AdMobConfig.CHANNEL_ID) {
      adScript.setAttribute('data-ad-channel', AdMobConfig.CHANNEL_ID);
    }
    adScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    adScript.onerror = function() {
      console.warn('[AdMob SDK] Gagal memuat skrip iklan Google Ads (terblokir adblock atau offline). Menggunakan simulator.');
    };
    document.head.appendChild(adScript);
  }

  // Helper pemanggil Iklan Berhadiah Google AdMob
  window.showGoogleAdMobRewarded = function(onRewardSuccess, onAdDismissed) {
    // Cek apakah Google adBreak SDK aktif & siap menayangkan iklan real
    try {
      if (typeof window.adBreak === 'function' && window.adsbygoogle && window.adsbygoogle.loaded) {
        window.adBreak({
          type: 'reward',
          name: 'feather_rush_coin_reward',
          beforeAd: () => {
            if (window.audio && typeof window.audio.stopMusic === 'function') {
              window.audio.stopMusic();
            }
          },
          afterAd: () => {
            if (window.settings && window.settings.music && window.audio) {
              window.audio.lobbyMusic();
            }
            if (typeof onAdDismissed === 'function') onAdDismissed();
          },
          beforeReward: (showAdFn) => {
            showAdFn();
          },
          adViewed: () => {
            if (typeof onRewardSuccess === 'function') {
              onRewardSuccess(AdMobConfig.REWARD_COIN_AMOUNT);
            }
          },
          adDismissed: () => {
            if (typeof onAdDismissed === 'function') onAdDismissed();
          }
        });
        return true;
      }
    } catch (err) {
      console.warn('[AdMob SDK] adBreak fallback:', err);
    }
    return false;
  };

  window.AdMobConfig = AdMobConfig;
})(window);
