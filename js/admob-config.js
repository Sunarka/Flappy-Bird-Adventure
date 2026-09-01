/**
 * =========================================================
 * GOOGLE AD MANAGER (GAM) & GPT REWARDED ADS SDK CONTROLLER
 * =========================================================
 * 
 * Untuk game web, Google Ad Manager (GAM) menggunakan Google Publisher Tag (GPT)
 * dan Out-Of-Page Rewarded Ads (`googletag.enums.OutOfPageType.REWARDED`).
 */

(function(window) {
  const AdManagerConfig = {
    // GOOGLE AD MANAGER AD UNIT PATH / NETWORK CODE:
    // Format: '/<NETWORK_CODE>/<AD_UNIT_NAME>'
    // Contoh resmi Google Test Ad Unit: '/21775744923/example/rewarded'
    AD_UNIT_PATH: '/21775744923/example/rewarded',

    // PUBLISHER ID GOOGLE ADSENSE / AD MANAGER:
    PUBLISHER_ID: 'ca-pub-3613614202318317',

    // Nilai Koin Hadiah
    REWARD_COIN_AMOUNT: 25,

    // State
    isRewardedReady: false,
    rewardedSlot: null
  };

  window.googletag = window.googletag || { cmd: [] };

  // Inisialisasi Google Ad Manager GPT Rewarded Slot
  window.googletag.cmd.push(() => {
    try {
      if (typeof googletag.defineOutOfPageSlot === 'function' && googletag.enums && googletag.enums.OutOfPageType) {
        const rewardedSlot = googletag.defineOutOfPageSlot(
          AdManagerConfig.AD_UNIT_PATH,
          googletag.enums.OutOfPageType.REWARDED
        );

        if (rewardedSlot) {
          AdManagerConfig.rewardedSlot = rewardedSlot;
          rewardedSlot.addService(googletag.pubads());

          googletag.pubads().addEventListener('rewardedSlotReady', (event) => {
            console.log('[Google Ad Manager] Iklan rewarded siap ditayangkan!');
            AdManagerConfig.isRewardedReady = true;
            AdManagerConfig.makeVisibleCallback = () => event.makeRewardedVisible();
          });

          googletag.pubads().addEventListener('rewardedSlotGranted', (event) => {
            console.log('[Google Ad Manager] Hadiah reward berhasil diberikan!');
            if (typeof window.onAdManagerRewardGranted === 'function') {
              window.onAdManagerRewardGranted(AdManagerConfig.REWARD_COIN_AMOUNT);
            }
          });

          googletag.pubads().addEventListener('rewardedSlotClosed', () => {
            console.log('[Google Ad Manager] Iklan rewarded ditutup.');
            AdManagerConfig.isRewardedReady = false;
            // Muat slot baru untuk kesempatan berikutnya
            googletag.pubads().refresh([rewardedSlot]);
          });
        }

        googletag.enableServices();
        if (rewardedSlot) googletag.display(rewardedSlot);
      }
    } catch (err) {
      console.warn('[Google Ad Manager] Inisialisasi GPT error:', err);
    }
  });

  // Helper pemanggil Iklan Berhadiah Google Ad Manager
  window.showGoogleAdManagerRewarded = function(onRewardSuccess, onAdDismissed, onFallbackNeeded) {
    window.onAdManagerRewardGranted = onRewardSuccess;

    // 1. Jika Google Ad Manager GPT memiliki iklan siap tayang
    if (AdManagerConfig.isRewardedReady && typeof AdManagerConfig.makeVisibleCallback === 'function') {
      console.log('[Google Ad Manager] Menampilkan iklan resmi GAM...');
      try {
        AdManagerConfig.makeVisibleCallback();
        return true;
      } catch (e) {
        console.warn('[Google Ad Manager] Gagal menampilkan iklan GAM:', e);
      }
    }

    // 2. Cek apakah Google H5 adBreak tersedia
    if (typeof window.adBreak === 'function' && window.adsbygoogle && window.adsbygoogle.loaded) {
      try {
        window.adBreak({
          type: 'reward',
          name: 'gam_rewarded_ad',
          beforeReward: (showAdFn) => { showAdFn(); },
          adViewed: () => {
            if (typeof onRewardSuccess === 'function') onRewardSuccess(AdManagerConfig.REWARD_COIN_AMOUNT);
          }
        });
        return true;
      } catch (_) {}
    }

    // 3. Fallback jika GAM belum ada inventory
    if (typeof onFallbackNeeded === 'function') onFallbackNeeded();
    return false;
  };

  // Kompatibilitas mundur
  window.showGoogleAdMobRewarded = window.showGoogleAdManagerRewarded;
  window.AdManagerConfig = AdManagerConfig;
  window.AdMobConfig = AdManagerConfig;
})(window);
