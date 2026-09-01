/**
 * =========================================================
 * GOOGLE ADMOB & AD MANAGER REWARDED ADS SDK CONTROLLER
 * =========================================================
 * 
 * Konfigurasi Resmi Google AdMob:
 * - ID Aplikasi AdMob: ca-app-pub-3613614202318317~3032753757
 * - ID Unit Iklan Reward: ca-app-pub-3613614202318317/6774733814
 * - Slot ID: 6774733814
 * - Publisher ID: ca-pub-3613614202318317
 */

(function(window) {
  const AdMobConfig = {
    // ID APLIKASI GOOGLE ADMOB RESMI:
    APP_ID: 'ca-app-pub-3613614202318317~3032753757',

    // ID UNIT IKLAN REWARD ADMOB:
    REWARD_AD_UNIT_ID: 'ca-app-pub-3613614202318317/6774733814',

    // AD SLOT ID:
    AD_SLOT_ID: '6774733814',

    // PUBLISHER ID:
    PUBLISHER_ID: 'ca-pub-3613614202318317',

    // GAM Ad Unit Path:
    AD_UNIT_PATH: '/21775744923/example/rewarded',

    // Nilai Koin Hadiah:
    REWARD_COIN_AMOUNT: 25,

    // State
    isRewardedReady: false,
    rewardedSlot: null
  };

  window.googletag = window.googletag || { cmd: [] };

  // Inisialisasi Google GPT Rewarded Slot
  window.googletag.cmd.push(() => {
    try {
      if (typeof googletag.defineOutOfPageSlot === 'function' && googletag.enums && googletag.enums.OutOfPageType) {
        const rewardedSlot = googletag.defineOutOfPageSlot(
          AdMobConfig.AD_UNIT_PATH,
          googletag.enums.OutOfPageType.REWARDED
        );

        if (rewardedSlot) {
          AdMobConfig.rewardedSlot = rewardedSlot;
          rewardedSlot.addService(googletag.pubads());

          googletag.pubads().addEventListener('rewardedSlotReady', (event) => {
            console.log('[Google AdMob/GAM] Iklan rewarded siap tayang!');
            AdMobConfig.isRewardedReady = true;
            AdMobConfig.makeVisibleCallback = () => event.makeRewardedVisible();
          });

          googletag.pubads().addEventListener('rewardedSlotGranted', (event) => {
            console.log('[Google AdMob/GAM] Hadiah reward berhasil diklaim!');
            if (typeof window.onAdManagerRewardGranted === 'function') {
              window.onAdManagerRewardGranted(AdMobConfig.REWARD_COIN_AMOUNT);
            }
          });

          googletag.pubads().addEventListener('rewardedSlotClosed', () => {
            console.log('[Google AdMob/GAM] Iklan rewarded ditutup.');
            AdMobConfig.isRewardedReady = false;
            googletag.pubads().refresh([rewardedSlot]);
          });
        }

        googletag.enableServices();
        if (rewardedSlot) googletag.display(rewardedSlot);
      }
    } catch (err) {
      console.warn('[Google AdMob/GAM] Inisialisasi error:', err);
    }
  });

  // Helper pemanggil Iklan Berhadiah Google AdMob & GAM
  window.showGoogleAdMobRewarded = function(onRewardSuccess, onAdDismissed, onFallbackNeeded) {
    window.onAdManagerRewardGranted = onRewardSuccess;

    // 1. Jika GPT memiliki iklan siap tayang
    if (AdMobConfig.isRewardedReady && typeof AdMobConfig.makeVisibleCallback === 'function') {
      try {
        AdMobConfig.makeVisibleCallback();
        return true;
      } catch (_) {}
    }

    // 2. Cek apakah Google H5 adBreak tersedia
    if (typeof window.adBreak === 'function' && window.adsbygoogle && window.adsbygoogle.loaded) {
      try {
        window.adBreak({
          type: 'reward',
          name: 'admob_reward_ad',
          beforeReward: (showAdFn) => { showAdFn(); },
          adViewed: () => {
            if (typeof onRewardSuccess === 'function') onRewardSuccess(AdMobConfig.REWARD_COIN_AMOUNT);
          }
        });
        return true;
      } catch (_) {}
    }

    // 3. Fallback jika iklan belum ready
    if (typeof onFallbackNeeded === 'function') onFallbackNeeded();
    return false;
  };

  window.showGoogleAdManagerRewarded = window.showGoogleAdMobRewarded;
  window.AdMobConfig = AdMobConfig;
  window.AdManagerConfig = AdMobConfig;
})(window);
