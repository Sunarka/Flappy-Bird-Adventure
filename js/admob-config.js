/**
 * =========================================================
 * GOOGLE ADMOB & H5 GAMES ADS REWARDED SDK CONFIGURATION
 * =========================================================
 */

(function(window) {
  const AdMobConfig = {
    // PUBLISHER ID GOOGLE ADMOB / ADSENSE RESMI:
    PUBLISHER_ID: 'ca-pub-3613614202318317',

    // Channel ID / Ad Unit ID khusus:
    CHANNEL_ID: 'rewarded_coin_ad',

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

  // Helper pemanggil Iklan Berhadiah Google AdMob / H5 Ads
  window.showGoogleAdMobRewarded = function(onRewardSuccess, onAdDismissed) {
    // Cek apakah Google adBreak SDK aktif & siap menayangkan iklan
    try {
      if (typeof window.adBreak === 'function') {
        console.log('[AdMob SDK] Meminta penayangan iklan video berhadiah ke Google Ads...');
        window.adBreak({
          type: 'reward',
          name: 'feather_rush_coin_reward',
          beforeAd: () => {
            console.log('[AdMob SDK] Iklan Google mulai tayang');
            if (window.audio && typeof window.audio.stopMusic === 'function') {
              window.audio.stopMusic();
            }
          },
          afterAd: () => {
            console.log('[AdMob SDK] Iklan Google selesai');
            if (window.settings && window.settings.music && window.audio) {
              window.audio.lobbyMusic();
            }
            if (typeof onAdDismissed === 'function') onAdDismissed();
          },
          beforeReward: (showAdFn) => {
            showAdFn();
          },
          adViewed: () => {
            console.log('[AdMob SDK] Hadiah koin terverifikasi oleh Google Ads!');
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
