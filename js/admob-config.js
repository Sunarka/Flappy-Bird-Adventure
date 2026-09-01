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
  window.showGoogleAdMobRewarded = function(onRewardSuccess, onAdDismissed, onFallbackNeeded) {
    let adStarted = false;
    let fallbackTimeout = null;

    try {
      // Jika Google Ads SDK terpasang
      if (typeof window.adBreak === 'function') {
        console.log('[AdMob SDK] Meminta penayangan iklan video berhadiah ke Google Ads...');

        // Jika dalam 800ms Google tidak merespons (misal no-fill atau belum di-approve), buka modal player
        fallbackTimeout = setTimeout(() => {
          if (!adStarted) {
            console.log('[AdMob SDK] Google Ads no-fill / belum menayangkan iklan, mengalihkan ke modal player...');
            if (typeof onFallbackNeeded === 'function') onFallbackNeeded();
          }
        }, 800);

        window.adBreak({
          type: 'reward',
          name: 'feather_rush_coin_reward',
          beforeAd: () => {
            adStarted = true;
            if (fallbackTimeout) clearTimeout(fallbackTimeout);
            console.log('[AdMob SDK] Iklan Google mulai tayang');
            if (window.audio && typeof window.audio.stopMusic === 'function') {
              window.audio.stopMusic();
            }
          },
          afterAd: () => {
            if (fallbackTimeout) clearTimeout(fallbackTimeout);
            console.log('[AdMob SDK] Iklan Google selesai');
            if (window.settings && window.settings.music && window.audio) {
              window.audio.lobbyMusic();
            }
            if (typeof onAdDismissed === 'function') onAdDismissed();
          },
          beforeReward: (showAdFn) => {
            adStarted = true;
            if (fallbackTimeout) clearTimeout(fallbackTimeout);
            showAdFn();
          },
          adViewed: () => {
            console.log('[AdMob SDK] Hadiah koin terverifikasi oleh Google Ads!');
            if (typeof onRewardSuccess === 'function') {
              onRewardSuccess(AdMobConfig.REWARD_COIN_AMOUNT);
            }
          },
          adDismissed: () => {
            if (fallbackTimeout) clearTimeout(fallbackTimeout);
            if (typeof onAdDismissed === 'function') onAdDismissed();
          },
          adBreakDone: (placementInfo) => {
            if (placementInfo && placementInfo.breakStatus !== 'viewed' && !adStarted) {
              if (fallbackTimeout) clearTimeout(fallbackTimeout);
              if (typeof onFallbackNeeded === 'function') onFallbackNeeded();
            }
          }
        });
        return;
      }
    } catch (err) {
      console.warn('[AdMob SDK] adBreak error:', err);
    }

    // Jika gagal atau SDK belum siap
    if (typeof onFallbackNeeded === 'function') onFallbackNeeded();
  };

  window.AdMobConfig = AdMobConfig;
})(window);
