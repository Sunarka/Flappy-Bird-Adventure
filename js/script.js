(() => {
  'use strict';

  // Canvas Polyfill: ellipse() & roundRect() untuk browser HP / WebView yang belum support
  if(typeof CanvasRenderingContext2D !== 'undefined') {
    if(!CanvasRenderingContext2D.prototype.ellipse) {
      CanvasRenderingContext2D.prototype.ellipse = function(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
        this.save();
        this.translate(x, y);
        this.rotate(rotation || 0);
        this.scale(radiusX || 1, radiusY || 1);
        this.arc(0, 0, 1, startAngle, endAngle, anticlockwise || false);
        this.restore();
      };
    }
    if(!CanvasRenderingContext2D.prototype.roundRect) {
      CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
        if (!radii) radii = 0;
        let r = 0;
        if (typeof radii === 'number') r = radii;
        else if (Array.isArray(radii) && radii.length) r = radii[0];
        r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
      };
    }
  }


  const W = 640, H = 360, GROUND = 56;
  const State = Object.freeze({ MENU:'menu', READY:'ready', PLAYING:'playing', PAUSED:'paused', REVIVING:'reviving', OVER:'over' });
  const $ = id => document.getElementById(id);
  const canvas = $('game'), ctx = canvas.getContext('2d');
  const el = {
    menu:$('menu'), ready:$('ready'), layer:$('modalLayer'), hud:$('hud'), score:$('score'), pop:$('scorePop'),
    best:$('menuBest'), sound:$('soundBtn'), musicBtn:$('musicBtn'), pause:$('pauseBtn'), how:$('howModal'),
    settings:$('settingsModal'), shop:$('shopModal'), paused:$('pauseModal'), over:$('overModal'),
    finalScore:$('finalScore'), finalBest:$('finalBest'), newBest:$('newBest'),
    coinHud:$('coinHud'), coinCount:$('coinCount'), shopCoins:$('shopCoins'), shopTabs:$('shopTabs'),
    skinList:$('skinList'), powerupHud:$('powerupHud'), livesHud:$('livesHud'), soundToggle:$('soundToggle'), musicToggle:$('musicToggle'),
    difficultyBtn:$('difficultyBtn'), difficultyValue:$('difficultyValue'), difficultyMenu:$('difficultyMenu'),
    langIdBtn:$('langIdBtn'), langEnBtn:$('langEnBtn'), settingsModalTitle:$('settingsModalTitle'),
    txtSettingLanguage:$('txtSettingLanguage'), txtSettingSound:$('txtSettingSound'), txtSettingMusic:$('txtSettingMusic'),
    txtSettingDifficulty:$('txtSettingDifficulty'), settingsOkBtn:$('settingsOkBtn'),
    shopBtn:$('shopBtn'), howBtn:$('howBtn'), settingsBtn:$('settingsBtn'),
    resumeBtn:$('resumeBtn'), restartBtn:$('restartBtn'), homeBtn:$('homeBtn'),
    replayBtn:$('replayBtn'), overHomeBtn:$('overHomeBtn'), lobbyFeedbackBtn:$('lobbyFeedbackBtn'),
    shopCanvas:$('shopCanvas'), showcaseLabel:$('showcaseLabel'), tabPrev:$('tabPrev'), tabNext:$('tabNext'),
    modeClassicBtn:$('modeClassicBtn'), modeRankedBtn:$('modeRankedBtn'), modeBestLabel:$('modeBestLabel'),
    playBtn:$('playBtn'), rankedLeaderboardBtn:$('rankedLeaderboardBtn'),
    topProfileBtn:$('topProfileBtn'), topProfileAvatar:$('topProfileAvatar'), topProfileName:$('topProfileName'), topProfileTier:$('topProfileTier'),
    googlePlayModal:$('googleAuthModal') || $('googlePlayModal'), gpOnlineStatus:$('gpOnlineStatus'), gpAvatarWrap:$('gpAvatarWrap'), gpAvatar:$('gpAvatar'),
    gpChangeAvatarBtn:$('gpChangeAvatarBtn'), gpGamerTagInput:$('gpGamerTagInput'), gpNameCostHint:$('gpNameCostHint'), gpTierBadge:$('gpTierBadge'),
    gpRankedBest:$('gpRankedBest'), gpAuthActionBtn:$('gpAuthActionBtn'), gpSwitchAccountBtn:$('gpSwitchAccountBtn'),
    googleSignInPrompt:$('googleSignInPrompt'), googleProfileCard:$('googleProfileCard'),
    googleSignInBtn:$('googleSignInBtn'), googleSignInBtnText:$('googleSignInBtnText'),
    facebookSignInBtn:$('facebookSignInBtn'), facebookSignInBtnText:$('facebookSignInBtnText'),
    guestSignInBtn:$('guestSignInBtn'),
    gpUserEmail:$('gpUserEmail'), gpSignOutBtn:$('gpSignOutBtn'),
    avatarPickerModal:$('avatarPickerModal'), avatarPickerGrid:$('avatarPickerGrid'),
    rankedModal:$('rankedModal'), championCanvas:$('championCanvas'), championGamerTag:$('championGamerTag'),
    championScore:$('championScore'), championTier:$('championTier'), championLoadoutTags:$('championLoadoutTags'),
    spotlightTitle:$('spotlightTitle'), leaderboardList:$('leaderboardList'), playRankedFromModalBtn:$('playRankedFromModalBtn'),
    lbTabsBar:$('lbTabsBar'), lbTabGlobalBtn:$('lbTabGlobalBtn'), lbTabTiersBtn:$('lbTabTiersBtn'),
    lbGlobalView:$('lbGlobalView'), lbTiersView:$('lbTiersView'), myRankCard:$('myRankCard'),
    leaderboardRankList:$('leaderboardRankList'), tiersGuideList:$('tiersGuideList'),
    menuRankedCard:$('menuRankedCard'), menuRankIcon:$('menuRankIcon'), menuRankTitle:$('menuRankTitle'),
    menuRankSub:$('menuRankSub'), menuRankCurPts:$('menuRankCurPts'), menuRankTargetPts:$('menuRankTargetPts'),
    menuRankFill:$('menuRankFill'), rankTierHud:$('rankTierHud'),
    modeRankPillIcon:$('modeRankPillIcon'), btnTierTag:$('btnTierTag'),
    gpMenuTierBadge:$('gpMenuTierBadge'), menuBestTierBadge:$('menuBestTierBadge'),
    overRankCard:$('overRankCard'), overRankIcon:$('overRankIcon'), overRankTitle:$('overRankTitle'),
    overRankDesc:$('overRankDesc'), overRankFill:$('overRankFill'),
    dashBtn:$('dashBtn'), dashRingProgress:$('dashRingProgress'), dashCooldownText:$('dashCooldownText'),
    reviveModal:$('reviveModal'), reviveTimerRing:$('reviveTimerRing'), reviveCountdownText:$('reviveCountdownText'),
    reviveCostLabel:$('reviveCostLabel'), reviveConfirmBtn:$('reviveConfirmBtn'), reviveGiveUpBtn:$('reviveGiveUpBtn'),
    tierRoadmapModal:$('tierRoadmapModal'), modalMyTierCard:$('modalMyTierCard'),
    gameDialogModal:$('gameDialogModal'), dialogIconWrap:$('dialogIconWrap'), dialogTitle:$('dialogTitle'),
    dialogBody:$('dialogBody'), dialogActions:$('dialogActions'), dialogConfirmBtn:$('dialogConfirmBtn'), dialogCancelBtn:$('dialogCancelBtn'),
    modeMultiplayerBtn:$('modeMultiplayerBtn'),
    mpBattleHud:$('mpBattleHud'), mpMyHudName:$('mpMyHudName'), mpMyHudScore:$('mpMyHudScore'),
    mpRivalHudName:$('mpRivalHudName'), mpRivalHudScore:$('mpRivalHudScore'),
    multiplayerModal:$('multiplayerModal'), mpModal:$('multiplayerModal'), mpServerStatusText:$('mpServerStatusText'),
    mpGameModeGroup:$('mpGameModeGroup'), mpPlayerCountGroup:$('mpPlayerCountGroup'),
    mpQuickTitleText:$('mpQuickTitleText'), mpQuickDescText:$('mpQuickDescText'),
    mpRaceProgressBarWrap:$('mpRaceProgressBarWrap'), mpRaceFill:$('mpRaceFill'),
    mpRaceMyPin:$('mpRaceMyPin'), mpRaceRivalPin:$('mpRaceRivalPin'), mpRaceTargetText:$('mpRaceTargetText'),
    mpMultiPlayersHud:$('mpMultiPlayersHud'),
    mpMultiHudRow1:$('mpMultiHudRow1'), mpMultiHudRow2:$('mpMultiHudRow2'),
    mpMultiHudRow3:$('mpMultiHudRow3'), mpMultiHudRow4:$('mpMultiHudRow4'),
    mpMultiAvatar1:$('mpMultiAvatar1'), mpMultiAvatar2:$('mpMultiAvatar2'),
    mpMultiAvatar3:$('mpMultiAvatar3'), mpMultiAvatar4:$('mpMultiAvatar4'),
    mpMultiName1:$('mpMultiName1'), mpMultiName2:$('mpMultiName2'),
    mpMultiName3:$('mpMultiName3'), mpMultiName4:$('mpMultiName4'),
    mpMultiScore1:$('mpMultiScore1'), mpMultiScore2:$('mpMultiScore2'),
    mpMultiScore3:$('mpMultiScore3'), mpMultiScore4:$('mpMultiScore4'),
    mpSlotCard2:$('mpSlotCard2'), mpSlotCard3:$('mpSlotCard3'), mpSlotCard4:$('mpSlotCard4'),
    mpTabQuickBtn:$('mpTabQuickBtn'), mpTabCreateBtn:$('mpTabCreateBtn'), mpTabJoinBtn:$('mpTabJoinBtn'),
    mpViewQuick:$('mpViewQuick'), mpViewCreate:$('mpViewCreate'), mpViewJoin:$('mpViewJoin'),
    mpQuickFindBtn:$('mpQuickFindBtn'), mpQuickInitialBox:$('mpQuickInitialBox'), mpQuickSearchingBox:$('mpQuickSearchingBox'),
    mpModalSearchTimer:$('mpModalSearchTimer'), mpModalCancelSearchBtn:$('mpModalCancelSearchBtn'),
    mpCreatedCodeBadge:$('mpCreatedCodeBadge'), mpCopyCodeBtn:$('mpCopyCodeBtn'),
    mpHostAvatar:$('mpHostAvatar'), mpHostName:$('mpHostName'), mpGuestSlotCard:$('mpGuestSlotCard'),
    mpGuestAvatar:$('mpGuestAvatar'), mpGuestName:$('mpGuestName'), mpHostStartGameBtn:$('mpHostStartGameBtn'),
    mpGuestReadyBtn:$('mpGuestReadyBtn'), mpGuestStatusBadge:$('mpGuestStatusBadge'),
    mpHostRoleBadge:$('mpHostRoleBadge'), mpLobbyTitle:$('mpLobbyTitle'),
    mpJoinCodeInput:$('mpJoinCodeInput'), mpJoinRoomBtn:$('mpJoinRoomBtn'),
    mpSearchingBar:$('mpSearchingBar'), mpSearchTimerText:$('mpSearchTimerText'), mpCancelSearchBtn:$('mpCancelSearchBtn'),
    mpVersusScreen:$('mpVersusScreen'), mpFighterLeft:$('mpFighterLeft'), mpFighterRight:$('mpFighterRight'),
    mpFighterMyAvatar:$('mpFighterMyAvatar'), mpFighterMyName:$('mpFighterMyName'),
    mpFighterRivalAvatar:$('mpFighterRivalAvatar'), mpFighterRivalName:$('mpFighterRivalName'),
    mpVsCenterBadge:$('mpVsCenterBadge'),
    arenaCountdownOverlay:$('arenaCountdownOverlay'), arenaCountdownNumber:$('arenaCountdownNumber'),
    mpOverModal:$('mpOverModal'), mpOverHeader:$('mpOverHeader'), mpOverBadge:$('mpOverBadge'), mpOverSub:$('mpOverSub'),
    mpOverMyAvatar:$('mpOverMyAvatar'), mpOverMyName:$('mpOverMyName'), mpOverMyScore:$('mpOverMyScore'),
    mpOverMyCrown:$('mpOverMyCrown'), mpOverMyReward:$('mpOverMyReward'),
    mpOverRivalAvatar:$('mpOverRivalAvatar'), mpOverRivalName:$('mpOverRivalName'),
    mpOverRivalScore:$('mpOverRivalScore'), mpOverRivalCrown:$('mpOverRivalCrown'),
    mpOverRivalStatus:$('mpOverRivalStatus'), mpRematchBtn:$('mpRematchBtn'), mpOverHomeBtn:$('mpOverHomeBtn'),
    mpBattleHud:$('mpBattleHud'),
    mpMyHudCard:$('mpMyHudCard'), mpMyHudAvatar:$('mpMyHudAvatar'), mpMyHudName:$('mpMyHudName'),
    mpMyHudTier:$('mpMyHudTier'), mpMyHudHearts:$('mpMyHudHearts'), mpMyHudScore:$('mpMyHudScore'),
    mpAudioToggleBtn:$('mpAudioToggleBtn'),
    mpRivalHudCard:$('mpRivalHudCard'), mpRivalHudAvatar:$('mpRivalHudAvatar'), mpRivalHudName:$('mpRivalHudName'),
    mpRivalHudTier:$('mpRivalHudTier'), mpRivalHudHearts:$('mpRivalHudHearts'), mpRivalHudScore:$('mpRivalHudScore'),
    lobbyAdmobRewardBtn:$('lobbyAdmobRewardBtn'), admobRewardModal:$('admobRewardModal'),
    admobTimerCount:$('admobTimerCount'), admobProgressFill:$('admobProgressFill'), admobCloseBtn:$('admobCloseBtn')
  };
  const storage = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} }
  };
  const settings = storage.get('skyFlappySettings', { sound:true, music:true, difficulty:'normal', language:'id' });
  if(!settings.language) settings.language = 'id';

  const i18n = {
    id: {
      settingsTitle: 'PENGATURAN',
      language: 'Bahasa / Language',
      soundEffects: 'Efek Suara',
      music: 'Musik Latar',
      difficulty: 'Tingkat Kesulitan',
      okBtn: 'SIMPAN / OK',
      playClassic: 'PLAY CLASSIC',
      playRanked: 'PLAY RANKED (EXTREME)',
      playMp: 'BUKA LOBI MULTIPLAYER',
      rankedBest: 'RANKED BEST',
      classicBest: 'CLASSIC BEST',
      tapToFly: 'Ketuk / SPASI untuk Terbang • SHIFT / D untuk Dash',
      getReady: 'BERSIAPLAH!',
      gameOver: 'PERMAINAN BERAKHIR',
      score: 'SKOR',
      best: 'TERBAIK',
      newBest: 'REKOR BARU!',
      replayBtn: 'MAIN LAGI',
      shopBtn: 'TOKO',
      howTitle: 'CARA BERMAIN',
      settingsBtn: 'PENGATURAN',
      rankings: 'LEADERBOARD',
      feedbackBtn: 'PENGADUAN',
      understood: 'MENGERTI',
      coins: 'KOIN',
      pausedTitle: 'GAME DIJEDA',
      resumeBtn: 'LANJUTKAN',
      restartBtn: 'ULANGI',
      homeBtn: 'MENU UTAMA',
      reviveTitle: 'LANJUTKAN?',
      reviveSub: 'Gunakan Koin untuk Bangkit & Lanjut Main!',
      reviveCost: 'BIAYA REVIVE:',
      reviveCoinBtn: 'REVIVE SEKARANG',
      giveUpBtn: 'LEWATKAN (GAME OVER)',
      rewardAdBtn: '+25 KOIN',
      // Shop categories
      catBird: 'BURUNG',
      catPet: 'PETS',
      catBooster: 'BOOSTER',
      catAura: 'JEJAK',
      catHat: 'TOPI',
      catOutfit: 'PAKAIAN',
      catPipe: 'PIPA',
      catBg: 'LATAR',
      catMusic: 'MUSIK',
      equip: 'EQUIP',
      equipped: 'TERPASANG',
      buy: 'BELI',
      // Multiplayer
      mpLobbyTitle: 'LOBI MULTIPLAYER',
      mpQuickMatch: 'CARI LAWAN',
      mpCreateRoom: 'BUAT ROOM',
      mpJoinRoom: 'GABUNG ROOM',
      mpQuickFind: 'CARI LAWAN OTOMATIS',
      mpStartMatch: 'MULAI BERTANDING SEKARANG!',
      mpReady: 'SAYA SIAP! (READY)',
      mpWaitingRival: 'MENUNGGU LAWAN READY...',
      mpRematch: 'MAIN LAGI (REMATCH)',
      mpVictory: 'VICTORY',
      mpDefeat: 'KALAH',
      mpFallen: 'TERJATUH',
      // Google / Account
      signInGoogle: 'MASUK DENGAN GOOGLE',
      signInFb: 'MASUK DENGAN FACEBOOK',
      playGuest: 'MAIN SEBAGAI TAMU',
      gpSavePlay: 'SIMPAN & MAINKAN RANK',
      gpSignOut: 'KELUAR / GANTI AKUN',
      gpStatus: 'LOGIN AKUN GOOGLE & FACEBOOK',
      gpLoginDesc: 'Hubungkan akun Anda untuk menyimpan Rank, Skor Tertinggi, dan bertanding di Leaderboard Global!',
      // How to play instructions
      inst1Title: 'KONTROL KEYBOARD & DASH',
      inst1Desc: '<b>SPACE / PANAH ATAS</b> untuk Flap.<br><b>SHIFT / D / E / F</b> untuk Skill Dash!',
      inst2Title: 'LAYAR SENTUH (HP)',
      inst2Desc: 'Di ponsel / HP, cukup tap layar untuk terbang.',
      inst3Title: 'HINDARI RINTANGAN',
      inst3Desc: 'Hindari tiang, burung musuh, dan petir.',
      inst4Title: 'SKILL POWER-UP',
      inst4Desc: 'Ambil Shield, Magnet, Freeze, Star, & Rocket!'
    },
    en: {
      settingsTitle: 'SETTINGS',
      language: 'Language / Bahasa',
      soundEffects: 'Sound Effects',
      music: 'Background Music',
      difficulty: 'Difficulty',
      okBtn: 'SAVE / OK',
      playClassic: 'PLAY CLASSIC',
      playRanked: 'PLAY RANKED (EXTREME)',
      playMp: 'OPEN MULTIPLAYER LOBBY',
      rankedBest: 'RANKED BEST',
      classicBest: 'CLASSIC BEST',
      tapToFly: 'Tap / SPACE to Flap • SHIFT / D to Dash',
      getReady: 'GET READY!',
      gameOver: 'GAME OVER',
      score: 'SCORE',
      best: 'BEST',
      newBest: 'NEW BEST!',
      replayBtn: 'PLAY AGAIN',
      shopBtn: 'SHOP',
      howTitle: 'HOW TO PLAY',
      settingsBtn: 'SETTINGS',
      rankings: 'LEADERBOARD',
      feedbackBtn: 'FEEDBACK',
      understood: 'GOT IT',
      coins: 'COINS',
      pausedTitle: 'GAME PAUSED',
      resumeBtn: 'RESUME',
      restartBtn: 'RESTART',
      homeBtn: 'MAIN MENU',
      reviveTitle: 'CONTINUE?',
      reviveSub: 'Use Coins to Revive & Keep Flying!',
      reviveCost: 'REVIVE COST:',
      reviveCoinBtn: 'REVIVE NOW',
      giveUpBtn: 'GIVE UP (GAME OVER)',
      rewardAdBtn: '+25 COINS',
      // Shop categories
      catBird: 'BIRD',
      catPet: 'PETS',
      catBooster: 'BOOSTERS',
      catAura: 'AURAS',
      catHat: 'HATS',
      catOutfit: 'OUTFITS',
      catPipe: 'PIPES',
      catBg: 'BG',
      catMusic: 'MUSIC',
      equip: 'EQUIP',
      equipped: 'EQUIPPED',
      buy: 'BUY',
      // Multiplayer
      mpLobbyTitle: 'MULTIPLAYER LOBBY',
      mpQuickMatch: 'QUICK MATCH',
      mpCreateRoom: 'CREATE ROOM',
      mpJoinRoom: 'JOIN ROOM',
      mpQuickFind: 'FIND OPPONENT',
      mpStartMatch: 'START MATCH NOW!',
      mpReady: 'I AM READY!',
      mpWaitingRival: 'WAITING FOR OPPONENT...',
      mpRematch: 'PLAY AGAIN (REMATCH)',
      mpVictory: 'VICTORY',
      mpDefeat: 'DEFEATED',
      mpFallen: 'FALLEN',
      // Google / Account
      signInGoogle: 'SIGN IN WITH GOOGLE',
      signInFb: 'SIGN IN WITH FACEBOOK',
      playGuest: 'PLAY AS GUEST',
      gpSavePlay: 'SAVE & PLAY RANKED',
      gpSignOut: 'SIGN OUT / SWITCH ACCOUNT',
      gpStatus: 'SIGN IN WITH GOOGLE & FACEBOOK',
      gpLoginDesc: 'Connect your account to save your Rank, High Scores, and compete on the Global Leaderboards!',
      // How to play instructions
      inst1Title: 'KEYBOARD & DASH CONTROLS',
      inst1Desc: '<b>SPACE / UP ARROW</b> to Flap wings.<br><b>SHIFT / D / E / F</b> for Warp Dash Skill!',
      inst2Title: 'TOUCH SCREEN (MOBILE)',
      inst2Desc: 'On mobile phones or tablets, simply tap the screen to fly.',
      inst3Title: 'AVOID OBSTACLES',
      inst3Desc: 'Dodge pipe collisions, rival hazards, and lightning.',
      inst4Title: 'SUPER POWER-UPS',
      inst4Desc: 'Collect Shield, Magnet, Freeze, Star, & Rocket!'
    }
  };

  function applyLanguage(lang) {
    const t = i18n[lang] || i18n.id;
    
    // Settings Modal
    if(el.settingsModalTitle) el.settingsModalTitle.textContent = t.settingsTitle;
    if(el.txtSettingLanguage) el.txtSettingLanguage.textContent = t.language;
    if(el.txtSettingSound) el.txtSettingSound.textContent = t.soundEffects;
    if(el.txtSettingMusic) el.txtSettingMusic.textContent = t.music;
    if(el.txtSettingDifficulty) el.txtSettingDifficulty.textContent = t.difficulty;
    if(el.settingsOkBtn) el.settingsOkBtn.textContent = t.okBtn;
    
    // Main Menu Buttons & Badges (Only update label, preserve SVG icons)
    if(el.shopBtn) {
      const span = el.shopBtn.querySelector('.side-btn-label') || el.shopBtn.querySelector('span:last-child');
      if(span) span.textContent = t.shopBtn;
    }
    if(el.howBtn) el.howBtn.textContent = t.howTitle;
    if(el.settingsBtn) el.settingsBtn.setAttribute('title', t.settingsBtn);
    if(el.rankedLeaderboardBtn) {
      const span = el.rankedLeaderboardBtn.querySelector('.side-btn-label') || el.rankedLeaderboardBtn.querySelector('span:last-child');
      if(span) span.textContent = t.rankings;
    }
    if(el.lobbyFeedbackBtn) {
      const span = el.lobbyFeedbackBtn.querySelector('.side-btn-label') || el.lobbyFeedbackBtn.querySelector('span:last-child');
      if(span) span.textContent = t.feedbackBtn;
    }
    if(el.lobbyAdmobRewardBtn) {
      const span = el.lobbyAdmobRewardBtn.querySelector('.side-btn-label') || el.lobbyAdmobRewardBtn.querySelector('span:last-child');
      if(span) span.textContent = t.rewardAdBtn;
    }

    // Ready Screen
    const readyH2 = document.querySelector('#ready h2');
    if(readyH2) readyH2.textContent = t.getReady;
    const readyP = document.querySelector('#ready p');
    if(readyP) readyP.innerHTML = t.tapToFly;

    // How To Play Modal
    const howH2 = document.querySelector('#howModal h2');
    if(howH2) howH2.textContent = t.howTitle;
    const howBtn = document.querySelector('#howModal button.primary');
    if(howBtn) howBtn.textContent = t.understood;
    const instItems = document.querySelectorAll('#howModal .inst-item');
    if(instItems && instItems.length >= 4) {
      const s1 = instItems[0].querySelector('.inst-content');
      if(s1) s1.innerHTML = `<strong>${t.inst1Title}</strong><p>${t.inst1Desc}</p>`;
      const s2 = instItems[1].querySelector('.inst-content');
      if(s2) s2.innerHTML = `<strong>${t.inst2Title}</strong><p>${t.inst2Desc}</p>`;
      const s3 = instItems[2].querySelector('.inst-content');
      if(s3) s3.innerHTML = `<strong>${t.inst3Title}</strong><p>${t.inst3Desc}</p>`;
      const s4 = instItems[3].querySelector('.inst-content');
      if(s4) s4.innerHTML = `<strong>${t.inst4Title}</strong><p>${t.inst4Desc}</p>`;
    }

    // Pause Modal
    const pauseH2 = document.querySelector('#pauseModal h2');
    if(pauseH2) pauseH2.textContent = t.pausedTitle;
    if(el.resumeBtn) el.resumeBtn.textContent = t.resumeBtn;
    if(el.restartBtn) el.restartBtn.textContent = t.restartBtn;
    if(el.homeBtn) el.homeBtn.textContent = t.homeBtn;

    // Game Over Modal
    const overH2 = document.querySelector('#overModal h2');
    if(overH2) overH2.textContent = t.gameOver;
    if(el.newBest) el.newBest.textContent = t.newBest;
    if(el.replayBtn) el.replayBtn.textContent = t.replayBtn;
    if(el.overHomeBtn) el.overHomeBtn.textContent = t.homeBtn;

    // Revive Modal
    const reviveH2 = document.querySelector('#reviveModal h2');
    if(reviveH2) reviveH2.textContent = t.reviveTitle;
    const reviveSub = document.querySelector('.revive-subtitle');
    if(reviveSub) reviveSub.textContent = t.reviveSub;
    const reviveCostInfo = document.querySelector('.revive-cost-info span');
    if(reviveCostInfo) reviveCostInfo.textContent = t.reviveCost;
    if(el.reviveConfirmBtn) {
      const span = el.reviveConfirmBtn.querySelector('span:last-child');
      if(span) span.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" style="vertical-align:middle;margin-right:4px;"><polygon points="13,2 4,14 11,14 9,22 20,10 13,10" fill="#ffffff"/></svg>${t.reviveCoinBtn}`;
    }
    if(el.reviveGiveUpBtn) el.reviveGiveUpBtn.textContent = t.giveUpBtn;

    // Shop Modal Category Tabs
    if(el.shopTabs) {
      const catMap = {
        bird: t.catBird, pet: t.catPet, booster: t.catBooster,
        aura: t.catAura, hat: t.catHat, outfit: t.catOutfit,
        pipe: t.catPipe, background: t.catBg, music: t.catMusic
      };
      el.shopTabs.querySelectorAll('[data-shop-category]').forEach(btn => {
        const cat = btn.dataset.shopCategory;
        if(catMap[cat]) btn.textContent = catMap[cat];
      });
    }

    // Google Play / Account Modal
    if(el.googleSignInBtnText) el.googleSignInBtnText.textContent = t.signInGoogle;
    if(el.facebookSignInBtnText) el.facebookSignInBtnText.textContent = t.signInFb;
    if(el.guestSignInBtn) el.guestSignInBtn.textContent = t.playGuest;
    if(el.gpAuthActionBtn) el.gpAuthActionBtn.textContent = t.gpSavePlay;
    if(el.gpSignOutBtn) el.gpSignOutBtn.textContent = t.gpSignOut;
    if(el.gpOnlineStatus) el.gpOnlineStatus.textContent = t.gpStatus;
    const gpDesc = document.querySelector('.gp-login-desc');
    if(gpDesc) gpDesc.textContent = t.gpLoginDesc;

    // Multiplayer Lobby
    if(el.mpTabQuickBtn) el.mpTabQuickBtn.textContent = t.mpQuickMatch;
    if(el.mpTabCreateBtn) el.mpTabCreateBtn.textContent = t.mpCreateRoom;
    if(el.mpTabJoinBtn) el.mpTabJoinBtn.textContent = t.mpJoinRoom;
    if(el.mpQuickFindBtn) el.mpQuickFindBtn.textContent = t.mpQuickFind;
    if(el.mpRematchBtn) el.mpRematchBtn.textContent = t.mpRematch;
    if(el.mpOverHomeBtn) el.mpOverHomeBtn.textContent = t.homeBtn;

    // Update active lang buttons in Settings
    if(el.langIdBtn) el.langIdBtn.classList.toggle('active', lang === 'id');
    if(el.langEnBtn) el.langEnBtn.classList.toggle('active', lang === 'en');

    // Update play button and mode label
    if(el.playBtn) {
      if(currentMode === 'multiplayer') {
        el.playBtn.textContent = t.playMp;
        if(el.modeBestLabel) el.modeBestLabel.textContent = 'MULTIPLAYER';
      } else if(currentMode === 'ranked') {
        el.playBtn.textContent = t.playRanked;
        if(el.modeBestLabel) el.modeBestLabel.textContent = t.rankedBest;
      } else {
        el.playBtn.textContent = t.playClassic;
        if(el.modeBestLabel) el.modeBestLabel.textContent = t.classicBest;
      }
    }

    if(typeof renderSkinGrid === 'function' && el.skinList && el.skinList.children.length > 0) {
      renderSkinGrid();
    }
  }

  // 1. Skin Burung (Nama Lengkap) - ALL FREE FOR TESTING
  const skins = {
    classic:{ name:'CLASSIC BIRD', desc:'Burung kuning ceria (Chiptune SFX)', cost:0, body:'#ffd74c', wing:'#f4a62b', beak:'#f79831', trail:'#fff5b2' },
    rose:{ name:'ROSE PINK', desc:'Merah muda manis (Harp Chime SFX)', cost:0, body:'#ff8dab', wing:'#e85d87', beak:'#ffb15b', trail:'#ffc1d3' },
    mint:{ name:'MINT GREEN', desc:'Hijau tosca segar (Bouncy SFX)', cost:0, body:'#75e6c8', wing:'#35bd9d', beak:'#ffa94d', trail:'#b7fff0' },
    night:{ name:'NIGHT SKY', desc:'Biru malam mistis (Dark Bell SFX)', cost:0, body:'#8496ff', wing:'#576dcb', beak:'#e6b4ff', trail:'#d4c7ff' },
    cyber:{ name:'CYBER NEON', desc:'Ungu neon glitch (Laser Crash SFX)', cost:0, body:'#b5179e', wing:'#7209b7', beak:'#4cc9f0', trail:'#f72585' },
    phoenix:{ name:'PHOENIX FIRE', desc:'Api abadi membara (Flame Fanfare SFX)', cost:0, body:'#ff5400', wing:'#ff0054', beak:'#ffd60a', trail:'#ffbd00' },
    mecha:{ name:'MECHA CYBORG', desc:'Robot titanium & laser core (Laser SFX)', cost:0, body:'#cbd5e1', wing:'#64748b', beak:'#38bdf8', trail:'#38bdf8' },
    dragon:{ name:'FLAME DRAGON', desc:'Naga merah berapi tanduk emas (Fire SFX)', cost:0, body:'#dc2626', wing:'#991b1b', beak:'#fbbf24', trail:'#ff5400' },
    angel:{ name:'HOLY ANGEL', desc:'Burung suci sayap emas (Chime SFX)', cost:0, body:'#f8fafc', wing:'#fbbf24', beak:'#f59e0b', trail:'#fef08a' },
    shadow:{ name:'SHADOW PHANTOM', desc:'Bayangan ungu kosmik mistis (Dark SFX)', cost:0, body:'#312e81', wing:'#4c1d95', beak:'#c084fc', trail:'#9d4edd' },
    // Anime Special Bird Skins
    goku_ssj:{ name:'SUPER SAIYAN BIRD', desc:'Burung Saiyan berambut emas & aura listrik (Ki Blast SFX)', cost:0, body:'#facc15', wing:'#eab308', beak:'#ea580c', trail:'#fef08a' },
    tanjiro_bird:{ name:'DEMON SLAYER BIRD', desc:'Burung pemburu iblis berhaori kotak hijau (Sword SFX)', cost:0, body:'#15803d', wing:'#1e293b', beak:'#dc2626', trail:'#22c55e' },
    naruto_bird:{ name:'SAGE SHINOBI BIRD', desc:'Burung ninja oranye jubah Sage Mode (Chakra SFX)', cost:0, body:'#ea580c', wing:'#1e293b', beak:'#facc15', trail:'#fdba74' },
    luffy_bird:{ name:'STRAW HAT PIRATE', desc:'Burung kapten bajak laut topi jerami (Gear Bounce SFX)', cost:0, body:'#ef4444', wing:'#1d4ed8', beak:'#fbbf24', trail:'#fca5a5' },
    gojo_bird:{ name:'HONORED ONE (GOJO)', desc:'Burung penyihir rambut perak & mata Six Eyes (Void SFX)', cost:0, body:'#f8fafc', wing:'#1e1b4b', beak:'#38bdf8', trail:'#60a5fa' }
  };

  // 2. Tail Aura / Jejak Ekor (Nama Lengkap) - ALL FREE FOR TESTING
  const auras = {
    default:{ name:'FEATHER TRAIL', desc:'Jejak bulu lembut melayang', cost:0, body:'#ffd74c', wing:'#fff5b2' },
    fire:{ name:'FIRE BLAZE', desc:'Lidah api berkobar & percikan bara', cost:0, body:'#ff5400', wing:'#ffd000' },
    rainbow:{ name:'RAINBOW GLOW', desc:'Pita pelangi & partikel bersinar', cost:0, body:'#ff70a6', wing:'#70d6ff' },
    galaxy:{ name:'COSMIC GALAXY', desc:'Galaksi spiral, cincin planet & komet', cost:0, body:'#9d4edd', wing:'#48cae4' },
    neon:{ name:'ELECTRIC LIGHTNING', desc:'Sambaran petir zig-zag & plasma', cost:0, body:'#00f5d4', wing:'#fee440' },
    bubble:{ name:'BUBBLE TRAIL', desc:'Gelembung sabun transparan pecah', cost:0, body:'#90e0ef', wing:'#00b4d8' },
    hearts:{ name:'SWEET HEARTS', desc:'Denyut cinta & serbuk manis', cost:0, body:'#ff4d6d', wing:'#ff85a1' },
    golden:{ name:'GOLDEN DUST', desc:'Koin emas berputar & kilau permata', cost:0, body:'#ffd700', wing:'#ffb703' },
    frost:{ name:'BLIZZARD FROST', desc:'Kristal es salju berkilauan', cost:0, body:'#67e8f9', wing:'#06b6d4' },
    plasma:{ name:'PLASMA SPARK', desc:'Percikan plasma listrik berenergi', cost:0, body:'#a855f7', wing:'#38bdf8' },
    sakura:{ name:'SAKURA PETALS', desc:'Kelopak sakura pink berguguran lembut', cost:0, body:'#f472b6', wing:'#fda4af' },
    matrix:{ name:'DIGITAL MATRIX', desc:'Jejak kode biner pixel hijau neon', cost:0, body:'#22c55e', wing:'#4ade80' },
    // Anime Special Auras
    super_saiyan:{ name:'SUPER SAIYAN KI AURA', desc:'Aura api emas berkobar & percikan kilat Ki petir biru', cost:0, body:'#facc15', wing:'#38bdf8' },
    domain_expansion:{ name:'DOMAIN INFINITY VOID', desc:'Energi kutukan ungu kosmik & orb nebula tanpa batas', cost:0, body:'#8b5cf6', wing:'#38bdf8' },
    nine_tails_chakra:{ name:'KURAMA CHAKRA FIRE', desc:'Kobaran lidah api chakra merah rubah ekor sembilan', cost:0, body:'#ea580c', wing:'#dc2626' },
    gear_fifth:{ name:'SUN GOD NIKA (GEAR 5)', desc:'Awan uap putih dewa matahari & drum kebebasan', cost:0, body:'#ffffff', wing:'#fef08a' },
    black_getsuga:{ name:'BANKAI GETSUGA TENSHOU', desc:'Energi spiritual hitam pekat bertepi merah membara', cost:0, body:'#0f172a', wing:'#ef4444' }
  };

  // 3. Topi / Hats (Nama Lengkap) - ALL FREE FOR TESTING
  const hats = {
    none:{ name:'TANPA TOPI', desc:'Tampilan natural tanpa topi', cost:0 },
    tophat:{ name:'TOP HAT MAGIC', desc:'Topi pesulap elegan pita merah', cost:0 },
    cap:{ name:'BASEBALL SNAPBACK', desc:'Topi baseball sporty biru', cost:0 },
    crown:{ name:'ROYAL CROWN', desc:'Mahkota emas permata kerajaan', cost:0 },
    party:{ name:'PARTY CONE HAT', desc:'Topi kerucut pesta bergaris', cost:0 },
    cowboy:{ name:'COWBOY LEATHER', desc:'Topi koboi kulit bergesper', cost:0 },
    pirate:{ name:'PIRATE CAPTAIN', desc:'Topi kapten bajak laut tengkorak', cost:0 },
    chef:{ name:'CHEF MASTER HAT', desc:'Topi koki putih bertingkat', cost:0 },
    beanie:{ name:'WINTER BEANIE', desc:'Kupluk wol hangat musim dingin', cost:0 },
    flowercrown:{ name:'FLOWER BLOSSOM CROWN', desc:'Mahkota bunga sakura & mawar mekar', cost:0 },
    pinkribbon:{ name:'CUTE PINK RIBBON', desc:'Pita rambut merah muda berenda manis', cost:0 },
    sunhat:{ name:'SUMMER BEACH SUNHAT', desc:'Topi jerami pantai anggun pita sutra', cost:0 },
    tiara:{ name:'SPARKLING TIARA', desc:'Tiara putri perak bertabur permata pink', cost:0 },
    catears:{ name:'KITTY CAT EARS', desc:'Bando telinga kucing lucu dengan lonceng emas', cost:0 },
    viking:{ name:'VIKING HELMET', desc:'Helm besi perang bertanduk perkasa', cost:0 },
    astronaut:{ name:'SPACE HELMET', desc:'Helm astronot kaca emas kosmik', cost:0 },
    ninja:{ name:'NINJA HEADBAND', desc:'Ikat kepala shinobi merah berkibar', cost:0 },
    witch:{ name:'WITCH MAGIC HAT', desc:'Topi penyihir ungu bergesper emas', cost:0 },
    bunny:{ name:'FLUFFY BUNNY EARS', desc:'Telinga kelinci putih panjang lucu', cost:0 },
    // Anime Special Hats
    straw_hat:{ name:'MUGIWARA STRAW HAT', desc:'Topi jerami kapten bajak laut berpita merah', cost:0 },
    shinobi_plate:{ name:'HIDDEN LEAF HEADBAND', desc:'Ikat kepala ninja Konoha berplat logam besi', cost:0 },
    tanjiro_earrings:{ name:'HANAFUDA SUN EARRINGS', desc:'Anting hanafuda matahari & tanda lahir pembasmi iblis', cost:0 },
    gojo_blindfold:{ name:'GOJO BLINDFOLD & HAIR', desc:'Penutup mata hitam & rambut perak tegak Gojo', cost:0 },
    saiyan_hair:{ name:'SUPER SAIYAN SPIKY HAIR', desc:'Rambut runcing emas berkilau Super Saiyan', cost:0 },
    hokage_hat:{ name:'HOKAGE LEADER HAT', desc:'Topi segitiga merah-putih lambang pemimpin desa', cost:0 },
    chopper_hat:{ name:'CHOPPER DOCTOR CAP', desc:'Topi dokter pink bertanduk rusa dan silang putih', cost:0 }
  };

  // 4. Outfit / Dasi & Aksesori (Nama Lengkap) - ALL FREE FOR TESTING
  const outfits = {
    none:{ name:'TANPA AKSESORI', desc:'Tampilan kasual polos', cost:0 },
    cape:{ name:'HERO FLYING CAPE', desc:'Jubah superhero merah berkibar', cost:0 },
    redtie:{ name:'RED TIE & SHIRT', desc:'Kemeja putih & dasi merah sutra', cost:0 },
    bluetie:{ name:'BLUE TIE & SHIRT', desc:'Kemeja biru & dasi polkadot', cost:0 },
    bowtie:{ name:'TUXEDO & BOW TIE', desc:'Rompi tuksedo & dasi kupu-kupu', cost:0 },
    goldchain:{ name:'GOLD CHAIN & JACKET', desc:'Jaket streetwear & kalung emas', cost:0 },
    scarf:{ name:'COZY SCARF SWEATER', desc:'Sweater tebal & syal rajut hangat', cost:0 },
    badge:{ name:'SHERIFF STAR BADGE', desc:'Rompi kulit & lencana sheriff emas', cost:0 },
    princessdress:{ name:'ROYAL PRINCESS GOWN', desc:'Gaun pesta merah muda renda berkilau', cost:0 },
    kimono:{ name:'SAKURA KIMONO SASH', desc:'Kimono sutra sakura & sabuk obi emas', cost:0 },
    fairy:{ name:'MAGICAL FAIRY WINGS', desc:'Gaun peri hijau mint & sayap bercahaya', cost:0 },
    ballerina:{ name:'BALLERINA SWAN TUTU', desc:'Rok tutu balet berombak & kalung mutiara', cost:0 },
    sailor:{ name:'SAILOR SCHOOLGIRL', desc:'Seragam pelaut manis dengan dasi pita merah', cost:0 },
    ninja_suit:{ name:'SHINOBI NINJA SCARF', desc:'Syal panjang ninja hitam berkibar', cost:0 },
    cyber_armor:{ name:'MECHA CHEST ARMOR', desc:'Zirah dada cyborg berinti reaktor menyala', cost:0 },
    hoodie:{ name:'URBAN STREET HOODIE', desc:'Hoodie streetwear abu-abu modern', cost:0 },
    angel_wings:{ name:'GLOWING SERAPH WINGS', desc:'Sayap malaikat bersinar terang', cost:0 },
    royal_robe:{ name:'KING VELVET ROBE', desc:'Mantel beludru raja berbulu ermine', cost:0 },
    // Anime Special Outfits
    akatsuki_cloak:{ name:'AKATSUKI CLOAK', desc:'Jubah hitam berawan merah organisasi Akatsuki', cost:0 },
    tanjiro_haori:{ name:'CHECKERED GREEN HAORI', desc:'Jubah haori kotak-kotak hijau hitam Tanjiro', cost:0 },
    scout_cape:{ name:'SCOUT REGIMENT CLOAK', desc:'Jubah hijau Pasukan Pengintai lambang Sayap Kebebasan', cost:0 },
    goku_gi:{ name:'TURTLE SCHOOL GI', desc:'Seragam bela diri oranye-biru lambang Kame', cost:0 },
    luffy_vest:{ name:'RED PIRATE VEST', desc:'Rompi merah terbuka & selempang kuning bajak laut', cost:0 },
    jujutsu_coat:{ name:'JUJUTSU SORCERER COAT', desc:'Seragam biru gelap kerah tinggi SMA Jujutsu', cost:0 }
  };

  // 5. Pipa / Pipes (Nama Lengkap) - ALL FREE FOR TESTING
  const pipeSkins = {
    green:{ name:'GREEN CLASSIC', desc:'Pipa hijau klasik Mario', cost:0, body:'#287a55', wing:'#3dbb68', edge:'#216c4d', cap:'#53d878' },
    candy:{ name:'CANDY STRAWBERRY', desc:'Pipa permen manis stroberi', cost:0, body:'#b85c87', wing:'#ff91b8', edge:'#81405d', cap:'#ffb4cf' },
    neon:{ name:'NEON CYBERPUNK', desc:'Pipa biru neon cyberpunk', cost:0, body:'#3863a8', wing:'#5be6e0', edge:'#1c3677', cap:'#83fff5' },
    cyber:{ name:'GOLDEN CYBER', desc:'Pipa emas berenergi tinggi', cost:0, body:'#854d0e', wing:'#eab308', edge:'#713f12', cap:'#fde047' },
    crystal:{ name:'FROZEN ICE CRYSTAL', desc:'Pipa kristal es transparan biru', cost:0, body:'#0284c7', wing:'#38bdf8', edge:'#0369a1', cap:'#7dd3fc' },
    lava:{ name:'MAGMA VOLCANO', desc:'Pipa batu lahar panas retak membara', cost:0, body:'#450a0a', wing:'#dc2626', edge:'#1c1917', cap:'#f97316' },
    wood:{ name:'ANCIENT BAMBOO', desc:'Pipa bambu hijau alami bercabang', cost:0, body:'#4d7c0f', wing:'#65a30d', edge:'#365314', cap:'#84cc16' },
    // Anime Special Pipes
    katana_torii:{ name:'RED TORII & KATANA', desc:'Pipa gerbang Shinto merah berkilau pedang katana', cost:0, body:'#991b1b', wing:'#ef4444', edge:'#450a0a', cap:'#facc15' },
    bamboo_demon:{ name:'DEMON SLAYER BAMBOO', desc:'Pipa bambu hijau bertali merah Nezuko', cost:0, body:'#15803d', wing:'#4ade80', edge:'#14532d', cap:'#f472b6' },
    chakra_scroll:{ name:'NINJUTSU GIANT SCROLL', desc:'Pipa gulungan jurus ninjutsu kayu & kertas mantra', cost:0, body:'#78350f', wing:'#d97706', edge:'#451a03', cap:'#fde047' }
  };

  // 6. Backgrounds (Nama Lengkap) - ALL FREE FOR TESTING
  const backgrounds = {
    sky:{ name:'CLEAR BLUE SKY', desc:'Langit siang biru cerah', cost:0, top:'#72caed', bottom:'#d3f3f4', hill:'#75bb9b' },
    sunset:{ name:'WARM SUNSET', desc:'Senja jingga hangat romantis', cost:0, top:'#f89b75', bottom:'#ffe5a6', hill:'#c47772' },
    space:{ name:'DEEP COSMIC SPACE', desc:'Luar angkasa kosmik gelap', cost:0, top:'#182858', bottom:'#4c4a8c', hill:'#393c77' },
    forest:{ name:'MISTY GREEN FOREST', desc:'Hutan rimbun hijau asri', cost:0, top:'#2d6a4f', bottom:'#b7e4c7', hill:'#1b4332' },
    ocean:{ name:'DEEP OCEAN CORAL', desc:'Kedalaman laut biru & terumbu karang', cost:0, top:'#0369a1', bottom:'#0891b2', hill:'#0e7490' },
    volcano:{ name:'VOLCANIC LAVA', desc:'Kawah gunung berapi malam bara panas', cost:0, top:'#2e1065', bottom:'#7f1d1d', hill:'#450a0a' },
    synthwave:{ name:'80S SYNTHWAVE GRID', desc:'Grid neon ungu & matahari senja retro', cost:0, top:'#3b0764', bottom:'#ec4899', hill:'#831843' },
    // Anime Special Backgrounds
    hidden_leaf:{ name:'HIDDEN LEAF VILLAGE', desc:'Desa Konoha dengan patung monumen Hokage senja', cost:0, top:'#f97316', bottom:'#fed7aa', hill:'#15803d' },
    wano_sakura:{ name:'WANO SAKURA FUJI', desc:'Negeri Wano berlatar Gunung Fuji & kelopak sakura', cost:0, top:'#ec4899', bottom:'#fbcfe8', hill:'#be185d' },
    namek_green:{ name:'PLANET NAMEK SKY', desc:'Langit hijau Namek dengan matahari kembar bersinar', cost:0, top:'#059669', bottom:'#a7f3d0', hill:'#047857' }
  };

  // 7. Musik (Nama Lengkap) - ALL FREE FOR TESTING
  const tracks = {
    happy:{ name:'HAPPY MELODY', desc:'Melodi ceria riang swing', cost:0, color:'#ffbf38' },
    bounce:{ name:'BOUNCE SYNTHWAVE', desc:'Irama disko synthwave dance', cost:0, color:'#f287b5' },
    arcade:{ name:'ARCADE CHIPTUNE', desc:'Chiptune 8-bit game retro', cost:0, color:'#7c8dff' },
    chill:{ name:'CHILL LO-FI JAZZ', desc:'Lo-Fi santai sunset jazz keys', cost:0, color:'#52b788' },
    epic:{ name:'HEROIC ADVENTURE', desc:'Orkestra petualangan megah & heroik', cost:0, color:'#ef4444' },
    cyberbeat:{ name:'CYBERPUNK BEAT', desc:'Electro synthwave tempo cepat energetik', cost:0, color:'#06b6d4' },
    // Anime Special Soundtracks
    gurenge:{ name:'ANIME: GURENGE (DEMON SLAYER)', desc:'Theme song pemburu iblis melodi J-Rock energetik', cost:0, color:'#ef4444' },
    blue_bird:{ name:'ANIME: BLUE BIRD (NARUTO)', desc:'Lagu ikonik melodi seruling & gitar bersemangat', cost:0, color:'#38bdf8' },
    we_are:{ name:'ANIME: WE ARE! (ONE PIECE)', desc:'Melodi petualangan bajak laut riang & megah', cost:0, color:'#facc15' },
    sparkle:{ name:'ANIME: SPARKLE (YOUR NAME)', desc:'Melodi piano emosional & lonceng bintang jatuh', cost:0, color:'#a855f7' }
  };

  // 8. Starter Booster Perk (Skill Langsung Aktif Saat Mulai) - ALL FREE FOR TESTING
  const boosters = {
    none:{ name:'TANPA BOOSTER', desc:'Mulai game kasual tanpa booster instan', cost:0, color:'#94a3b8' },
    extra_life:{ name:'STARTER EXTRA LIFE (+1 LIFE)', desc:'Mulai game dengan tambahan 1 nyawa ekstra', cost:0, color:'#ef4444' },
    shield:{ name:'STARTER SHIELD', desc:'Mulai game langsung terlindungi perisai', cost:0, color:'#0284c7' },
    magnet:{ name:'STARTER MAGNET', desc:'Mulai game langsung menyedot semua koin', cost:0, color:'#dc2626' },
    slow:{ name:'STARTER SLOW ICE', desc:'Mulai game dengan waktu melambat 50%', cost:0, color:'#0891b2' },
    star:{ name:'STARTER STAR POWER', desc:'Mulai game dengan bintang kebal pelangi', cost:0, color:'#f59e0b' },
    rocket:{ name:'STARTER NOS ROCKET', desc:'Mulai game meluncur roket NOS turbo', cost:0, color:'#ea580c' },
    double_shield:{ name:'STARTER DUAL SHIELD', desc:'Mulai game dengan 2x lapisan perisai pelindung', cost:0, color:'#0284c7' }
  };

  // 9. Sistem Pet Pendamping & Skill Unik (Unique Pet Companions & Skills) - ALL FREE FOR TESTING
  const petsCatalog = {
    pip_peep: {
      name: 'PIP & PEEP (CANARY DUO)',
      desc: 'Duo pelindung imut. Meluncur menghancurkan musuh yang mendekat (1-hit kill) & respawn 11s',
      cost: 0,
      color: '#fef08a',
      skillType: 'bodyguard',
      skillName: 'DUO BODYGUARD INTERCEPT',
      skillDesc: 'Meluncur menghancurkan musuh yang mendekat (1-hit kill) dan respawn setelah 11s',
      respawnTime: 11.0,
      baby1: { name: 'Pip', color: '#fef08a', wingColor: '#fde047', blushColor: '#fda4af', accessory: 'ribbon' },
      baby2: { name: 'Peep', color: '#bae6fd', wingColor: '#7dd3fc', blushColor: '#fda4af', accessory: 'flower' }
    },
    momo_hana: {
      name: 'MOMO & HANA (SAKURA FAIRIES)',
      desc: 'Peri kembar sakura. Memberikan Perisai Bunga Sakura Pelindung berbentuk bunga teratai pink',
      cost: 0,
      color: '#f472b6',
      skillType: 'barrier',
      skillName: 'SAKURA LOTUS SHIELD',
      skillDesc: 'Perisai bunga teratai merah muda pelindung yang aktif sejak mulai & regenerasi tiap 10 detik',
      barrierCooldown: 10.0,
      baby1: { name: 'Momo', color: '#fbcfe8', wingColor: '#f472b6', blushColor: '#fda4af', accessory: 'ribbon' },
      baby2: { name: 'Hana', color: '#fecdd3', wingColor: '#fb7185', blushColor: '#fda4af', accessory: 'flower' }
    },
    aero_lumos: {
      name: 'AERO & LUMOS (HOLY ARCHANGELS)',
      desc: 'Duo bidadari suci. Memberi berkah cahaya +1 Skor Ekstra & +2 Koin Bonus setiap melewati 3 pipa',
      cost: 0,
      color: '#eab308',
      skillType: 'blessing',
      skillName: 'DIVINE SCORE & GOLD BLESSING',
      skillDesc: 'Memberikan +1 Skor Ekstra & +2 Koin Bonus setiap berhasil melewati 3 rintangan pipa',
      interval: 3,
      baby1: { name: 'Aero', color: '#fef08a', wingColor: '#eab308', blushColor: '#fde047', accessory: 'halo' },
      baby2: { name: 'Lumos', color: '#ffffff', wingColor: '#fef08a', blushColor: '#fde047', accessory: 'halo' }
    },
    pixel_glitch: {
      name: 'PIXEL & GLITCH (CYBER DRONES)',
      desc: 'Duo drone mecha. Menembakkan laser listrik EMP otomatis tiap 3.0s untuk melumpuhkan musuh jarak jauh',
      cost: 0,
      color: '#06b6d4',
      skillType: 'laser',
      skillName: 'AUTO EMP LASER ZAP',
      skillDesc: 'Menembakkan laser listrik EMP otomatis tiap 3.0 detik untuk melumpuhkan musuh dari jarak jauh',
      laserCooldown: 3.0,
      baby1: { name: 'Pixel', color: '#38bdf8', wingColor: '#0284c7', blushColor: '#67e8f9', accessory: 'antenna' },
      baby2: { name: 'Glitch', color: '#34d399', wingColor: '#059669', blushColor: '#6ee7b7', accessory: 'antenna' }
    },
    blaze_ember: {
      name: 'BLAZE & EMBER (PHOENIX SPARKS)',
      desc: 'Duo percikan api phoenix abadi. Semburan api naga membakar musuh & melebarkan pipa +16px',
      cost: 0,
      color: '#f97316',
      skillType: 'fire',
      skillName: 'PHOENIX DRAGON FLAMES & GAP EXPANDER',
      skillDesc: 'Semburan api raksasa membakar musuh di depan & melebarkan celah pipa sebesar +16px',
      baby1: { name: 'Blaze', color: '#fb923c', wingColor: '#ea580c', blushColor: '#fdba74', accessory: 'flame' },
      baby2: { name: 'Ember', color: '#f87171', wingColor: '#dc2626', blushColor: '#fca5a5', accessory: 'flame' }
    },
    kuro_void: {
      name: 'KURO & VOID (SHADOW SPIRITS)',
      desc: 'Duo roh bayangan mistis. Mempercepat cooldown Dash 45% (jadi 2.5s) & ledakan bayangan hitam',
      cost: 0,
      color: '#a855f7',
      skillType: 'dash_master',
      skillName: 'SHADOW VOID DASH VORTEX',
      skillDesc: 'Mengurangi cooldown skill Dash sebesar 45% (dari 4.5s jadi 2.5s) & shockwave void hitam',
      dashCd: 2.5,
      baby1: { name: 'Kuro', color: '#c084fc', wingColor: '#7e22ce', blushColor: '#d8b4fe', accessory: 'horns' },
      baby2: { name: 'Void', color: '#64748b', wingColor: '#334155', blushColor: '#94a3b8', accessory: 'horns' }
    },
    none: {
      name: 'TANPA PET',
      desc: 'Bermain kasual murni tanpa bantuan pet pelindung',
      cost: 0,
      color: '#94a3b8',
      skillType: 'none',
      skillName: 'NO PET',
      skillDesc: 'Tanpa pet pendamping'
    }
  };

  const progress = storage.get('skyFlappyProgress', { coins:0, unlocked:['classic'], selected:'classic' });
  if(!Array.isArray(progress.unlocked)) progress.unlocked=['classic'];
  if(!skins[progress.selected]) progress.selected='classic';
  if(typeof progress.coins !== 'number') progress.coins=0;

  for(const [key, catalog, free] of [
    ['pipe', pipeSkins, 'green'],
    ['background', backgrounds, 'sky'],
    ['music', tracks, 'happy'],
    ['aura', auras, 'default'],
    ['hat', hats, 'none'],
    ['outfit', outfits, 'none'],
    ['booster', boosters, 'none'],
    ['pet', petsCatalog, 'pip_peep']
  ]){
    const unlockedKey = key + 'Unlocked';
    const selectedKey = 'selected' + key[0].toUpperCase() + key.slice(1);
    if(!Array.isArray(progress[unlockedKey])) progress[unlockedKey] = [free];
    if(!catalog[progress[selectedKey]]) progress[selectedKey] = free;
  }

  let cloudSaveDebounceTimer = null;
  function persistProgress() {
    if(!progress.coinsUpdatedAt) progress.coinsUpdatedAt = Date.now();
    storage.set('skyFlappyProgress', progress);
    if(typeof saveCloudSave === 'function' && typeof gpProfile !== 'undefined' && gpProfile && gpProfile.isLoggedIn) {
      if(cloudSaveDebounceTimer) clearTimeout(cloudSaveDebounceTimer);
      cloudSaveDebounceTimer = setTimeout(() => {
        saveCloudSave();
      }, 350);
    }
  }
  window.persistProgress = persistProgress;

  if(typeof progress.mpWins !== 'number') progress.mpWins = Number(storage.get('skyFlappyMpWins', 0)) || 0;

  let currentMode = 'classic'; // 'classic' | 'ranked'
  let classicBest = Math.max(
    Number(storage.get('skyFlappyClassicBest', 0)) || 0,
    Number(storage.get('skyFlappyBest', 0)) || 0,
    Number(progress.highScore) || 0
  );
  let rankedBest = Math.max(
    Number(storage.get('skyFlappyRankedBest', 0)) || 0,
    Number(progress.rankedScore) || 0
  );
  let best = classicBest, state = State.MENU, last = 0, started = false, score = 0,
      pipes = [], coins = [], flyers = [], particles = [],
      powerups = [], enemies = [], stormClouds = [],
      shockwaves = [], floatingTexts = [], lightningBolts = [],
      raceMissiles = [], raceTraps = [], raceBombs = [], raceTornadoes = [],
      isRespawningRace = false, raceRespawnTimer = 0,
      spawn = 0, flyerSpawn = 0, trailSpawn = 0,
      powerupSpawnTimer = 0, enemySpawnTimer = 0, cloudSpawnTimer = 0,
      groundX = 0, cloudX = 0, shake = 0, overTimer = 0, lastGapY = 150, graceTimer = 0;
  let lives = 1, maxLives = 5, reviveCount = 0, reviveTimerInterval = null, reviveSecondsLeft = 5;

  // Active Dash Skill state
  let dashCooldown = 0, dashTimer = 0, dashAfterimages = [];
  const DASH_COOLDOWN_MAX = 4.5;

  // 2 Anak Burung Pelindung Imut (Baby Guardian Birds)
  const babyBirds = [
    {
      id: 0,
      name: 'Pip',
      x: 82, y: 262,
      r: 9,
      wing: 0,
      angle: 0,
      state: 'inactive', // 'inactive' | 'follow' | 'intercept' | 'return' | 'dead'
      targetEnemy: null,
      color: '#fef08a', // Canary Pastel Yellow
      wingColor: '#fde047',
      blushColor: '#fda4af',
      accessory: 'ribbon',
      flipAngle: 0
    },
    {
      id: 1,
      name: 'Peep',
      x: 78, y: 298,
      r: 8.5,
      wing: 0,
      angle: 0,
      state: 'inactive', // 'inactive' | 'follow' | 'intercept' | 'return' | 'dead'
      targetEnemy: null,
      color: '#bae6fd', // Sky Pastel Cyan
      wingColor: '#7dd3fc',
      blushColor: '#fda4af',
      accessory: 'flower',
      flipAngle: 0
    }
  ];

  let petSkillTimer = 0;
  let aeroPipesPassed = 0;
  let laserBeams = [];

  function applyPetSkin() {
    const petId = progress.selectedPet || 'pip_peep';
    const skin = petsCatalog[petId] || petsCatalog.pip_peep;
    if(skin && skin.baby1 && skin.baby2) {
      babyBirds[0].name = skin.baby1.name;
      babyBirds[0].color = skin.baby1.color;
      babyBirds[0].wingColor = skin.baby1.wingColor;
      babyBirds[0].blushColor = skin.baby1.blushColor;
      babyBirds[0].accessory = skin.baby1.accessory;

      babyBirds[1].name = skin.baby2.name;
      babyBirds[1].color = skin.baby2.color;
      babyBirds[1].wingColor = skin.baby2.wingColor;
      babyBirds[1].blushColor = skin.baby2.blushColor;
      babyBirds[1].accessory = skin.baby2.accessory;
    }
  }

  function resetBabyBirds(active = true) {
    applyPetSkin();
    const petId = progress.selectedPet || 'pip_peep';
    const isNone = petId === 'none';
    petSkillTimer = 0;
    aeroPipesPassed = 0;
    laserBeams = [];

    babyBirds[0].x = bird.x - 22;
    babyBirds[0].y = bird.y - 18;
    babyBirds[0].state = (active && !isNone) ? 'follow' : 'inactive';
    babyBirds[0].targetEnemy = null;
    babyBirds[0].respawnTimer = 0;
    babyBirds[0].angle = 0;
    babyBirds[0].flipAngle = 0;

    babyBirds[1].x = bird.x - 26;
    babyBirds[1].y = bird.y + 18;
    babyBirds[1].state = (active && !isNone) ? 'follow' : 'inactive';
    babyBirds[1].targetEnemy = null;
    babyBirds[1].respawnTimer = 0;
    babyBirds[1].angle = 0;
    babyBirds[1].flipAngle = 0;
  }

  // Active power-up states
  const activePowerups = { shield: false, magnet: 0, slow: 0, star: 0, rocket: 0 };
  const bird = { x:130, y:150, vy:0, r:16, wing:0, angle:0, dead:false };

  // Audio Engine with Full Synthesizer
  const audio = {
    ctx:null, musicTimer:null, deathTimer:null, currentAudioElem:null, previewAudioElem:null,
    init() {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if(this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    },
    playAudioFile(filename, loop = true, volume = 0.85, isPreview = false) {
      if(isPreview) {
        this.stopPreviewFileMusic();
      } else {
        this.stopFileMusic();
      }
      try {
        const aud = new Audio('audio/' + filename);
        aud.loop = loop;
        aud.volume = volume;
        if(isPreview) {
          this.previewAudioElem = aud;
        } else {
          this.currentAudioElem = aud;
        }
        const p = aud.play();
        if(p && typeof p.catch === 'function') {
          p.catch(() => {});
        }
        return aud;
      } catch(_) {
        return null;
      }
    },
    stopFileMusic() {
      if(this.currentAudioElem) {
        try {
          this.currentAudioElem.pause();
          this.currentAudioElem.currentTime = 0;
        } catch(e) {}
        this.currentAudioElem = null;
      }
    },
    stopPreviewFileMusic() {
      if(this.previewAudioElem) {
        try {
          this.previewAudioElem.pause();
          this.previewAudioElem.currentTime = 0;
        } catch(e) {}
        this.previewAudioElem = null;
      }
    },
    tone(freq, dur=.1, type='sine', volume=.05, slide=0) {
      if(!settings.sound) return;
      this.playTone(freq, dur, type, volume, slide);
    },
    playTone(freq, dur, type, volume, slide=0) {
      try {
        this.init();
        if(!this.ctx) return;
        const actualVol = Math.min(0.92, (volume || 0.05) * 2.8);
        const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, t);
        o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
        const attack = Math.min(0.015, dur * 0.15);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(actualVol, t + attack);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g).connect(this.ctx.destination);
        o.start(t);
        o.stop(t + dur);
        o.onended = () => {
          try {
            o.disconnect();
            g.disconnect();
          } catch(e) {}
        };
      } catch(_) {}
    },
    flap() { this.tone(520, .07, 'triangle', .055, 180); },
    score() { this.tone(760, .13, 'sine', .075, 260); },
    coin() { this.tone(980, .14, 'sine', .08, 350); },
    hit() { this.tone(130, .2, 'sawtooth', .08, -70); },
    click() { this.tone(360, .045, 'square', .045, 70); },
    win() { this.tone(660, .16, 'triangle', .075, 500); },
    
    // Power-up & Skill Sound Effects & Jingles
    powerup(type) {
      if(!settings.sound) return;
      if(type === 'star') {
        // Star: Triumphant 8-bit Arcade Power Fanfare
        const notes = [523, 659, 784, 1046, 1318, 1568, 2093];
        notes.forEach((f, i) => {
          setTimeout(() => {
            this.playTone(f, 0.16, 'square', 0.05, 10);
            this.playTone(f * 0.5, 0.14, 'triangle', 0.035, 0);
          }, i * 38);
        });
      } else if(type === 'shield') {
        // Shield: Heavenly Protective Harmonic Resonance Chime
        const notes = [440, 554, 659, 880, 1108];
        notes.forEach((f, i) => {
          setTimeout(() => {
            this.playTone(f, 0.28, 'sine', 0.055, 0);
            this.playTone(f * 1.5, 0.18, 'triangle', 0.03, 10);
          }, i * 45);
        });
      } else if(type === 'slow') {
        // Slow Ice: Crystalline Glockenspiel Subzero Freeze Cascade
        const notes = [1046, 880, 784, 659, 523, 440];
        this.playTone(130, 0.6, 'sine', 0.07, -40);
        notes.forEach((f, i) => {
          setTimeout(() => {
            this.playTone(f, 0.25, 'triangle', 0.05, -30);
            this.playTone(f * 2, 0.1, 'sine', 0.025, 0);
          }, i * 50);
        });
      } else if(type === 'magnet') {
        // Magnet: Futuristic Electronic Magnetic Sweep & Pulse
        const notes = [330, 440, 554, 659, 880, 1108];
        notes.forEach((f, i) => {
          setTimeout(() => {
            this.playTone(f, 0.12, 'sawtooth', 0.035, 60);
            this.playTone(f, 0.15, 'sine', 0.05, 30);
          }, i * 35);
        });
      } else if(type === 'rocket') {
        // NOS Rocket: Supersonic Turbo Jet Ignition & Roar Power Chord!
        this.playTone(80, 0.7, 'sawtooth', 0.09, 300);
        this.playTone(160, 0.55, 'triangle', 0.08, 450);
        const powerChord = [220, 330, 440, 660, 880, 1320, 1760];
        powerChord.forEach((f, i) => {
          setTimeout(() => {
            this.playTone(f, 0.22, 'sawtooth', 0.045, 120);
            this.playTone(f * 0.75, 0.18, 'square', 0.03, 80);
          }, i * 30);
        });
      } else if(type === 'double_shield') {
        // Dual Shield: Double Layered High-Tech Protective Resonant Aegis
        this.playTone(220, 0.4, 'sine', 0.08, 60);
        this.playTone(440, 0.35, 'triangle', 0.06, 30);
        const notes1 = [523, 659, 784, 1046];
        notes1.forEach((f, i) => {
          setTimeout(() => {
            this.playTone(f, 0.22, 'sine', 0.05, 0);
          }, i * 35);
        });
        setTimeout(() => {
          this.playTone(330, 0.45, 'sawtooth', 0.065, 80);
          this.playTone(660, 0.3, 'triangle', 0.05, 40);
          const notes2 = [659, 880, 1046, 1318, 1760];
          notes2.forEach((f, i) => {
            setTimeout(() => {
              this.playTone(f, 0.25, 'sine', 0.055, 10);
              this.playTone(f * 1.5, 0.15, 'triangle', 0.03, 0);
            }, i * 40);
          });
        }, 130);
      } else if(type === 'heart' || type === 'extra_life') {
        // Extra Life / Heart: Warm Angelic Healing Chord & Chime
        const notes = [523, 659, 784, 1046, 1318];
        notes.forEach((f, i) => {
          setTimeout(() => {
            this.playTone(f, 0.22, 'sine', 0.055, 20);
            this.playTone(f * 1.5, 0.15, 'triangle', 0.035, 0);
          }, i * 35);
        });
      }
    },
    revive() {
      if(!settings.sound) return;
      const notes = [440, 554, 659, 880, 1108, 1318, 1760];
      notes.forEach((f, i) => {
        setTimeout(() => {
          this.playTone(f, 0.28, 'triangle', 0.06, 50);
          this.playTone(f * 1.5, 0.2, 'sine', 0.04, 0);
        }, i * 40);
      });
    },
    birdChirp(skinId) {
      if(!settings.sound) return;
      this.flap();
      if(skinId === 'mecha') {
        this.playTone(880, 0.06, 'sawtooth', 0.04, 300);
        setTimeout(() => this.playTone(1320, 0.08, 'square', 0.035, -100), 50);
      } else if(skinId === 'dragon') {
        this.playTone(280, 0.12, 'sawtooth', 0.05, 150);
      } else if(skinId === 'angel') {
        this.playTone(1046, 0.15, 'sine', 0.05, 0);
        setTimeout(() => this.playTone(1568, 0.18, 'triangle', 0.035, 0), 40);
      } else if(skinId === 'shadow') {
        this.playTone(392, 0.14, 'sine', 0.04, -50);
      } else if(skinId === 'cyber') {
        this.playTone(660, 0.08, 'sawtooth', 0.04, 250);
      } else if(skinId === 'phoenix') {
        this.playTone(523, 0.1, 'triangle', 0.05, 200);
        setTimeout(() => this.playTone(1046, 0.12, 'sawtooth', 0.035, 100), 45);
      } else {
        // Classic / Rose / Mint / Night cheerful bird chirp
        this.playTone(784, 0.08, 'sine', 0.045, 150);
        setTimeout(() => this.playTone(1174, 0.1, 'triangle', 0.04, 100), 40);
      }
    },
    rocketSmash() {
      if(!settings.sound) return;
      this.playTone(180, 0.18, 'sawtooth', 0.08, -80);
      this.playTone(340, 0.12, 'square', 0.05, -120);
      setTimeout(() => this.playTone(880, 0.1, 'triangle', 0.05, 200), 20);
    },
    shieldBreak() {
      if(!settings.sound) return;
      this.playTone(880, 0.08, 'sawtooth', 0.06, -300);
      setTimeout(() => this.playTone(320, 0.18, 'triangle', 0.07, -150), 40);
    },
    thunder() {
      if(!settings.sound) return;
      this.playTone(180, 0.35, 'sawtooth', 0.08, -120);
      setTimeout(() => this.playTone(70, 0.5, 'sine', 0.09, -30), 50);
    },
    enemyAlert() {
      if(!settings.sound) return;
      this.playTone(480, 0.1, 'sawtooth', 0.025, -100);
    },
    dash() {
      if(!settings.sound) return;
      this.playTone(280, 0.18, 'sawtooth', 0.08, 600);
      this.playTone(1320, 0.2, 'sine', 0.06, -300);
      this.playTone(90, 0.35, 'triangle', 0.08, -50);
    },
    dashReady() {
      if(!settings.sound) return;
      this.playTone(1046, 0.08, 'triangle', 0.035, 100);
      setTimeout(() => this.playTone(1568, 0.1, 'sine', 0.03, 50), 35);
    },
    babyChirp() {
      if(!settings.sound) return;
      this.playTone(1568, 0.08, 'sine', 0.045, 300);
      setTimeout(() => this.playTone(2093, 0.1, 'triangle', 0.04, 200), 35);
    },
    babyAttack() {
      if(!settings.sound) return;
      this.playTone(880, 0.06, 'sawtooth', 0.055, 400);
      this.playTone(1760, 0.12, 'sine', 0.045, -200);
      setTimeout(() => this.playTone(1320, 0.1, 'triangle', 0.04, 150), 30);
    },

    // Distinct Death Jingles per Bird Skin (Sesuai dengan Karakter & Tema Burung)
    deathMusic() {
      if(!settings.sound) return;
      clearInterval(this.deathTimer);
      const skinId = progress.selected || 'classic';
      let step = 0;

      if(skinId === 'classic') {
        // Classic Bird: 8-bit Chiptune Downward Tumble
        const notes = [523, 494, 440, 349, 262, 196];
        this.playTone(notes[0], .2, 'square', .055, -20);
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .22, 'square', .05, step === notes.length - 1 ? -60 : -15);
        }, 160);
      } else if(skinId === 'rose') {
        // Rose Pink: Sweet Melancholy Harp Chord Cascade
        const notes = [880, 784, 659, 587, 523, 440, 392, 330];
        this.playTone(notes[0], .35, 'sine', .065, 0);
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .35, 'sine', .055, 0);
          if(step % 2 === 0) this.playTone(notes[step] * 1.5, .2, 'triangle', .025, 0);
        }, 130);
      } else if(skinId === 'mint') {
        // Mint Green: Bouncy Playful Bubble Slide Pop
        const notes = [659, 523, 659, 784, 880, 659, 392, 330, 262];
        this.playTone(notes[0], .15, 'triangle', .06, 30);
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .18, 'triangle', .055, step % 2 === 0 ? 40 : -30);
        }, 140);
      } else if(skinId === 'night') {
        // Night Sky: Deep Cosmic Bell & Minor Resonance
        const notes = [440, 415, 370, 330, 220];
        this.playTone(440, .45, 'sawtooth', .04, -10);
        this.playTone(110, .6, 'sine', .06, -5);
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .45, 'sawtooth', .038, -15);
          this.playTone(notes[step] / 2, .5, 'sine', .05, -5);
        }, 240);
      } else if(skinId === 'cyber') {
        // Cyber Neon: Glitch Laser Crash & 8-bit Downward Sweep
        this.playTone(1200, .15, 'sawtooth', .07, -800);
        this.playTone(240, .1, 'square', .05, 50);
        const notes = [880, 440, 220, 110, 55];
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .18, 'square', .06, -40);
          this.playTone(notes[step] * 1.414, .08, 'sawtooth', .035, 100);
        }, 120);
      } else if(skinId === 'phoenix') {
        // Phoenix Fire: Blazing Pyre Fanfare & Ash Dissipation
        const notes = [349, 440, 523, 698, 880, 1047, 1318];
        this.playTone(notes[0], .2, 'triangle', .06, 20);
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .25, 'sawtooth', .05, step === notes.length - 1 ? -100 : 30);
          this.playTone(notes[step] / 2, .3, 'triangle', .04, 0);
        }, 150);
      } else if(skinId === 'mecha') {
        // Mecha Cyborg: Robot Power Failure, Servo Drop & CPU Deactivation Glitch
        this.playTone(1046, .08, 'sawtooth', .065, -450);
        this.playTone(523, .1, 'square', .05, -200);
        const notes = [932, 784, 659, 523, 370, 261, 146, 73];
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) {
            this.playTone(45, .45, 'triangle', .08, -30);
            clearInterval(this.deathTimer); this.deathTimer = null; return;
          }
          this.playTone(notes[step], .14, 'square', .055, -40);
          this.playTone(notes[step] * 0.5, .18, 'sawtooth', .038, -20);
        }, 110);
      } else if(skinId === 'dragon') {
        // Flame Dragon: Roaring Dragon Breath & Heavy Fiery Doom March
        this.playTone(185, .5, 'sawtooth', .085, -70);
        this.playTone(92, .65, 'sawtooth', .09, -35);
        const notes = [370, 349, 311, 277, 246, 207, 164, 123, 82];
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .26, 'sawtooth', .055, -25);
          this.playTone(notes[step] * 0.5, .32, 'sawtooth', .065, -15);
        }, 135);
      } else if(skinId === 'angel') {
        // Holy Angel: Seraphic Cathedral Choir Chimes & Peaceful Ascension
        this.playTone(1047, .55, 'sine', .07, 0);
        this.playTone(1568, .45, 'triangle', .05, 0);
        const notes = [784, 880, 988, 1174, 1318, 1568, 1760, 2093];
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .42, 'sine', .058, 0);
          this.playTone(notes[step] * 1.5, .3, 'triangle', .028, 5);
        }, 130);
      } else if(skinId === 'shadow') {
        // Shadow Phantom: Ghostly Void Drone, Haunting Whisper & Abyss Descent
        this.playTone(293, .6, 'sine', .065, -60);
        this.playTone(146, .8, 'triangle', .08, -35);
        const notes = [587, 523, 466, 392, 349, 293, 233, 174, 116, 58];
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .38, 'sawtooth', .042, -20);
          this.playTone(notes[step] * 0.707, .42, 'sine', .048, -10);
        }, 145);
      }
    },

    // Dedicated Lobby Theme Music: "A World Beyond - Ghibli Melodic" (Soft Relaxing Music Box & Acoustic Piano)
    // Suara lembut, menenangkan, hangat, dan sangat nyaman didengar (A World Beyond - Ghibli Melodic)
    lobbyMusic() {
      if(!settings.music) return;
      if(this.currentMusicType === 'lobby' && (this.musicTimer || this.currentAudioElem)) return;
      this.stopMusic();
      this.currentMusicType = 'lobby';
      this.init();

      // Putar lagu studio "A World Beyond - Ghibli Melodic" untuk suasana lobby yang tenang & damai
      const aud = this.playAudioFile('lobby_ghibli.webm', true, 0.80);
      if(aud) {
        aud.onerror = () => {
          this.playSynthLobbyMusic();
        };
        return;
      }
      this.playSynthLobbyMusic();
    },

    playSynthLobbyMusic() {
      let step = 0;

      // Melodi Lembut "A World Beyond" (Ghibli Music Box & Acoustic Style)
      const ghibliLead = [
        587, 0, 659, 740, 880, 0, 740, 659,
        587, 0, 740, 880, 988, 0, 880, 0,
        494, 0, 587, 740, 880, 0, 988, 1175,
        880, 0, 740, 0, 587, 0, 0, 0,
        // Bagian Refrain Hangat & Melankolis Ghibli
        740, 0, 880, 0, 988, 0, 1175, 0,
        988, 0, 880, 0, 740, 0, 659, 0,
        587, 0, 659, 0, 740, 0, 880, 0,
        659, 0, 587, 0, 494, 0, 0, 0,
        // Alunan Damai & Penutup Lembut
        494, 0, 587, 0, 740, 0, 880, 0,
        988, 0, 880, 0, 740, 0, 659, 0,
        587, 0, 740, 0, 880, 0, 1175, 0,
        880, 0, 740, 0, 587, 0, 0, 0
      ];

      // Akord Piano Lembut Ghibli (Dmaj7 - Gmaj7 - F#m7 - Bm7 - Em7 - A7)
      const ghibliChords = [
        [294, 370, 440, 554], // Dmaj7
        [392, 494, 587, 740], // Gmaj7
        [370, 440, 554, 659], // F#m7
        [247, 294, 370, 440], // Bm7
        [330, 392, 494, 587], // Em7
        [220, 277, 330, 440], // A7
        [294, 370, 440, 554], // Dmaj7
        [294, 440, 587, 0]    // D
      ];

      // Bass Akustik / Cello Hangat
      const ghibliBass = [
        147, 196, 185, 123, 165, 110, 147, 147,
        196, 185, 123, 165, 110, 147, 196, 147
      ];

      this.musicTimer = setInterval(() => {
        if(state !== State.MENU) return;
        const totalSteps = ghibliLead.length;
        const curStep = step % totalSteps;

        const leadNote = ghibliLead[curStep];
        const chordIndex = Math.floor(curStep / 6) % ghibliChords.length;
        const chord = ghibliChords[chordIndex];
        const bassNote = ghibliBass[Math.floor(curStep / 3) % ghibliBass.length];

        // 1. Melodi Utama: Kotak Musik / Seruling Lembut (Sine & Triangle Halus)
        if(leadNote) {
          this.playTone(leadNote, 0.45, 'sine', 0.032, 0);
          this.playTone(leadNote * 0.5, 0.35, 'triangle', 0.015, 0);
        }

        // 2. Akord Piano Hangat pada Ketukan Awal
        if(curStep % 6 === 0 && chord) {
          chord.forEach(freq => {
            if(freq) this.playTone(freq, 0.65, 'sine', 0.012, 0);
          });
        }

        // 3. Bass Cello Hangat & Lembut
        if(curStep % 3 === 0 && bassNote) {
          this.playTone(bassNote, 0.7, 'sine', 0.035, 0);
        }

        // 4. Sentuhan Nada Gemerlap Lembut (Sparkle Bell)
        if(curStep % 12 === 6) {
          this.playTone(1760, 0.3, 'sine', 0.008, 0);
        }

        step++;
      }, 260);
    },

    // In-Game Gameplay Soundtracks (Selected in Shop)
    gameMusic() {
      if(!settings.music) return;
      if(this.currentMusicType === 'game' && (this.musicTimer || this.currentAudioElem)) return;
      this.stopMusic();
      this.currentMusicType = 'game';
      const trackId = progress.selectedMusic || 'happy';
      this.init();

      const animeAudioMap = {
        'gurenge': 'gurenge.wav',
        'blue_bird': 'blue_bird.wav',
        'we_are': 'we_are.wav',
        'sparkle': 'sparkle.wav'
      };

      if(animeAudioMap[trackId]) {
        const aud = this.playAudioFile(animeAudioMap[trackId], true, 0.85);
        if(aud) {
          aud.onerror = () => {
            this.playSynthGameMusic(trackId);
          };
          return;
        }
      }
      this.playSynthGameMusic(trackId);
    },

    playSynthGameMusic(trackId) {
      let step = 0;
      if(trackId === 'happy') {
        // Happy Vibe In-Game Melody
        const melody = [
          523, 0, 659, 784, 880, 784, 659, 523,
          587, 0, 698, 880, 1047, 880, 698, 587,
          659, 0, 784, 988, 1047, 1175, 1047, 784,
          880, 1047, 1319, 1175, 1047, 784, 523, 0
        ];
        const bass = [
          131, 262, 131, 262, 147, 294, 147, 294,
          165, 330, 165, 330, 175, 349, 196, 392
        ];
        this.musicTimer = setInterval(() => {
          if(state !== State.PLAYING && state !== State.READY) return;
          const note = melody[step % melody.length];
          const low = bass[step % bass.length];
          if(note) this.playTone(note, .14, 'triangle', .028);
          if(low) this.playTone(low, .18, 'sine', .032);
          if(step % 4 === 2) this.playTone(1200, .035, 'square', .009);
          if(step % 8 === 4) this.playTone(240, .05, 'triangle', .02, -80);
          step++;
        }, 135);
      } else if(trackId === 'bounce') {
        // Bounce Synthwave: 80s Disco Dance
        const melody = [659, 784, 880, 784, 659, 784, 1047, 880, 988, 880, 784, 880, 659, 784, 880, 1047, 1174, 1047, 880, 784, 659, 784, 880, 988, 1047, 880, 784, 659, 587, 659, 784, 880];
        const bass = [220, 220, 175, 175, 196, 196, 165, 165, 220, 220, 175, 175, 196, 196, 247, 247];
        this.musicTimer = setInterval(() => {
          if(state !== State.PLAYING && state !== State.READY) return;
          const note = melody[step % melody.length], low = bass[step % bass.length];
          if(note) this.playTone(note, .14, 'square', .02);
          if(low) this.playTone(low, .22, 'sawtooth', .028, -20);
          if(step % 2 === 1) this.playTone(800, .04, 'sawtooth', .012, -400);
          step++;
        }, 140);
      } else if(trackId === 'arcade') {
        // Arcade Chiptune: High-Speed 8-bit Gaming Adventure
        const melody = [392, 523, 659, 784, 659, 523, 440, 523, 587, 698, 880, 1047, 880, 698, 587, 659, 784, 1047, 1318, 1047, 784, 659, 523, 659, 880, 1047, 1174, 1318, 1568, 1318, 1047, 784];
        const bass = [98, 131, 110, 147, 131, 165, 110, 147];
        this.musicTimer = setInterval(() => {
          if(state !== State.PLAYING && state !== State.READY) return;
          const note = melody[step % melody.length], low = bass[Math.floor(step / 2) % bass.length];
          if(note) this.playTone(note, .11, 'square', .024, step % 3 === 0 ? 20 : 0);
          if(low && step % 2 === 0) this.playTone(low, .18, 'triangle', .03);
          if(step % 4 === 0) this.playTone(1500, .03, 'square', .01);
          step++;
        }, 125);
      } else if(trackId === 'chill') {
        // Chill Lo-Fi Jazz: Smooth 7th Keys & Warm Bass
        const chords = [
          [440, 523, 659], [392, 494, 587], [349, 440, 523], [330, 392, 494],
          [349, 440, 523, 659], [392, 494, 587, 698], [440, 523, 659, 784], [330, 392, 494, 587]
        ];
        const bass = [110, 98, 87, 82, 87, 98, 110, 82];
        this.musicTimer = setInterval(() => {
          if(state !== State.PLAYING && state !== State.READY) return;
          const chord = chords[Math.floor(step / 2) % chords.length];
          const low = bass[Math.floor(step / 2) % bass.length];
          if(step % 2 === 0) {
            chord.forEach(f => this.playTone(f, .45, 'sine', .018));
            this.playTone(low, .55, 'sine', .035);
          } else {
            this.playTone(chord[step % chord.length] * 2, .25, 'triangle', .014);
          }
          step++;
        }, 230);
      } else if(trackId === 'epic') {
        // Heroic Adventure: Majestic Brass Fanfare & Marching Timpani
        const melody = [523, 659, 784, 1047, 880, 1047, 1318, 1047, 784, 880, 1047, 1318, 1568, 1318, 1047, 784, 523, 659, 784, 1047, 1174, 1047, 880, 784, 659, 784, 880, 1047, 1174, 1318, 1568, 1047];
        const brassBass = [131, 165, 196, 262, 220, 262, 330, 262, 196, 220, 262, 330, 392, 330, 262, 196];
        this.musicTimer = setInterval(() => {
          if(state !== State.PLAYING && state !== State.READY) return;
          const note = melody[step % melody.length], low = brassBass[Math.floor(step / 2) % brassBass.length];
          if(note) {
            this.playTone(note, .18, 'sawtooth', .024, 0);
            this.playTone(note * 0.5, .18, 'triangle', .02, 0);
          }
          if(low && step % 2 === 0) {
            this.playTone(low, .36, 'sawtooth', .032, -10);
            this.playTone(low * 0.5, .4, 'sine', .04, 0);
          }
          if(step % 4 === 0) this.playTone(160, .08, 'triangle', .035, -80);
          step++;
        }, 160);
      } else if(trackId === 'cyberbeat') {
        // Cyberpunk Beat: High-Energy Electro Synth & Gritty Bass
        const melody = [440, 523, 587, 659, 784, 659, 587, 523, 440, 587, 659, 784, 880, 784, 659, 587, 659, 784, 880, 1047, 880, 784, 659, 587, 440, 523, 659, 587, 523, 440, 392, 440];
        const cyberBass = [110, 110, 131, 110, 147, 110, 165, 131, 110, 110, 131, 110, 175, 165, 147, 131];
        this.musicTimer = setInterval(() => {
          if(state !== State.PLAYING && state !== State.READY) return;
          const note = melody[step % melody.length], low = cyberBass[step % cyberBass.length];
          if(note) this.playTone(note, .12, 'square', .022, step % 2 === 0 ? 15 : -15);
          if(low) this.playTone(low, .16, 'sawtooth', .034, -20);
          if(step % 2 === 1) this.playTone(950, .035, 'sawtooth', .014, -500);
          if(step % 4 === 0) this.playTone(70, .12, 'triangle', .04, -30);
          step++;
        }, 135);
      } else if(trackId === 'gurenge') {
        // Gurenge (Demon Slayer LiSA): Authentic Chorus Melody
        const melody = [
          370, 0, 415, 0, 466, 0, 554, 554, 494, 0, 466, 0, 415, 0, 370, 0,
          415, 0, 466, 0, 554, 0, 622, 622, 554, 0, 466, 0, 415, 415, 370, 0,
          370, 0, 415, 0, 466, 0, 554, 554, 494, 0, 466, 0, 415, 0, 370, 0,
          466, 0, 554, 0, 622, 0, 740, 740, 622, 0, 554, 0, 622, 0, 0, 0
        ];
        const bass = [92, 92, 110, 110, 123, 123, 138, 138, 92, 92, 110, 110, 123, 123, 138, 138];
        this.musicTimer = setInterval(() => {
          if(state !== State.PLAYING && state !== State.READY) return;
          const note = melody[step % melody.length], low = bass[Math.floor(step / 2) % bass.length];
          if(note) {
            this.playTone(note, .14, 'sawtooth', .024, 0);
            this.playTone(note * 0.5, .12, 'square', .016, 0);
          }
          if(low && step % 2 === 0) this.playTone(low, .22, 'triangle', .036, -20);
          if(step % 2 === 1) this.playTone(1100, .035, 'square', .012);
          if(step % 4 === 0) this.playTone(80, .08, 'sawtooth', .035, -40);
          step++;
        }, 130);
      } else if(trackId === 'blue_bird') {
        // Blue Bird (Naruto Shippuden): Authentic Chorus Melody
        const melody = [
          440, 0, 494, 0, 523, 0, 587, 0, 659, 659, 587, 0, 523, 0, 494, 0,
          440, 0, 494, 0, 523, 0, 440, 0, 392, 0, 349, 0, 392, 0, 440, 0,
          587, 0, 523, 0, 440, 0, 392, 0, 349, 0, 330, 0, 294, 0, 330, 0,
          349, 0, 392, 0, 440, 0, 523, 0, 587, 0, 659, 0, 587, 0, 523, 0
        ];
        const bass = [110, 110, 131, 131, 147, 147, 131, 131, 87, 87, 98, 98, 110, 110, 131, 131];
        this.musicTimer = setInterval(() => {
          if(state !== State.PLAYING && state !== State.READY) return;
          const note = melody[step % melody.length], low = bass[Math.floor(step / 2) % bass.length];
          if(note) this.playTone(note, .15, 'triangle', .032, 0);
          if(low && step % 2 === 0) this.playTone(low, .18, 'sine', .035, 0);
          if(step % 4 === 2) this.playTone(1300, .03, 'triangle', .01);
          step++;
        }, 135);
      } else if(trackId === 'we_are') {
        // We Are! (One Piece): Authentic Opening Chorus Melody
        const melody = [
          392, 392, 440, 0, 494, 0, 523, 0, 587, 587, 494, 0, 392, 0, 330, 0,
          392, 0, 440, 0, 494, 0, 440, 0, 392, 0, 330, 0, 294, 0, 392, 0,
          494, 0, 587, 0, 659, 659, 587, 0, 494, 0, 392, 0, 440, 0, 392, 0,
          440, 0, 494, 0, 523, 0, 587, 0, 659, 0, 698, 0, 587, 0, 0, 0
        ];
        const bass = [98, 98, 131, 131, 147, 147, 131, 131, 98, 98, 110, 110, 131, 131, 147, 147];
        this.musicTimer = setInterval(() => {
          if(state !== State.PLAYING && state !== State.READY) return;
          const note = melody[step % melody.length], low = bass[Math.floor(step / 2) % bass.length];
          if(note) {
            this.playTone(note, .16, 'sawtooth', .025, 0);
            this.playTone(note * 0.5, .16, 'triangle', .02, 0);
          }
          if(low && step % 2 === 0) this.playTone(low, .26, 'sine', .038);
          if(step % 4 === 0) this.playTone(120, .08, 'triangle', .03, -60);
          step++;
        }, 145);
      } else if(trackId === 'sparkle') {
        // Sparkle (Your Name / RADWIMPS): Authentic Celestial Piano & Bell Melody
        const chords = [
          [622, 784, 932, 1175], [698, 831, 1047, 1245], [784, 932, 1175, 1397], [932, 1175, 1397, 1568]
        ];
        const melody = [
          587, 0, 523, 0, 466, 0, 392, 0, 349, 0, 311, 0, 349, 0, 392, 0,
          466, 0, 523, 0, 587, 0, 698, 0, 587, 0, 466, 0, 392, 0, 0, 0
        ];
        const bass = [78, 87, 98, 117];
        this.musicTimer = setInterval(() => {
          if(state !== State.PLAYING && state !== State.READY) return;
          const chord = chords[Math.floor(step / 4) % chords.length];
          const note = melody[step % melody.length];
          const low = bass[Math.floor(step / 4) % bass.length];
          if(step % 2 === 0) {
            chord.forEach(f => this.playTone(f, .45, 'sine', .016));
            this.playTone(low * 2, .55, 'sine', .032);
          }
          if(note) this.playTone(note, .28, 'triangle', .022);
          if(step % 3 === 0) this.playTone(note * 2, .18, 'sine', .012);
          step++;
        }, 190);
      }
    },

    // Dedicated Multiplayer Battle Theme: "Nyan Cat" (Nyanyanyanyanyanyanya!)
    multiplayerMusic() {
      if(!settings.music) return;
      if(this.currentMusicType === 'multiplayer' && (this.musicTimer || this.currentAudioElem)) return;
      this.stopMusic();
      this.currentMusicType = 'multiplayer';
      this.init();

      // Putar soundtrack Nyan Cat yang riang, seru, dan energik untuk duel multiplayer 1v1
      const aud = this.playAudioFile('nyan_cat.wav', true, 0.85);
      if(aud) {
        aud.onerror = () => {
          this.playSynthNyanCat();
        };
        return;
      }
      this.playSynthNyanCat();
    },

    playSynthNyanCat() {
      let step = 0;
      // Melodi Otentik Nyan Cat (F# Major / Eb Minor 8-bit Chiptune)
      const melodyScore = [
        // Intro / Chorus A
        740, 831, 622, 622, 494, 587, 554, 494,
        494, 554, 587, 587, 554, 494, 554, 622,
        740, 831, 622, 740, 554, 622, 494, 554,
        494, 622, 740, 831, 622, 740, 554, 622,
        494, 587, 622, 587, 554, 494, 554, 587,
        494, 587, 622, 740, 554, 622, 554, 494, 554, 494, 0, 0,
        // Chorus B
        494, 370, 415, 494, 370, 415, 494, 554, 622, 494, 659, 622, 659, 740,
        494, 494, 370, 415, 494, 370, 415, 494, 554, 622, 494, 622, 659, 740,
        494, 554, 622, 494, 554, 622, 494, 554, 494, 415, 494, 415, 494, 554,
        622, 494, 622, 659, 740, 494, 554, 622, 494, 622, 554, 494, 554, 494, 554, 0
      ];

      const bassScore = [
        123, 123, 92, 92, 104, 104, 78, 78,
        82, 82, 123, 123, 138, 138, 92, 92
      ];

      this.musicTimer = setInterval(() => {
        if(state !== State.PLAYING && state !== State.READY) return;
        const note = melodyScore[step % melodyScore.length];
        const low = bassScore[Math.floor(step / 2) % bassScore.length];

        if(note) {
          this.playTone(note, 0.12, 'square', 0.026, 0);
          this.playTone(note * 0.5, 0.10, 'triangle', 0.018, 0);
        }
        if(low && step % 2 === 0) {
          this.playTone(low, 0.20, 'triangle', 0.038, 0);
        }
        if(step % 2 === 1) {
          this.playTone(1400, 0.025, 'sawtooth', 0.010, -500);
        }
        step++;
      }, 108); // 138 BPM 16th note timing
    },

    // Master Music Director (Switch between Lobby & Game Tracks)
    music() {
      if(state === State.PLAYING || state === State.READY) {
        if(currentMode === 'multiplayer') {
          this.multiplayerMusic();
        } else {
          this.gameMusic();
        }
      } else {
        this.lobbyMusic();
      }
    },
    previewMusic(trackId) {
      this.stopPreview();
      if(!settings.sound && !settings.music) return;
      this.init();
      this.previewTrackId = trackId;

      // Pause background audio while previewing track
      if(this.currentAudioElem) {
        try { this.currentAudioElem.pause(); } catch(_) {}
      }

      const animeAudioMap = {
        'gurenge': 'gurenge.wav',
        'blue_bird': 'blue_bird.wav',
        'we_are': 'we_are.wav',
        'sparkle': 'sparkle.wav'
      };

      if(animeAudioMap[trackId]) {
        const aud = this.playAudioFile(animeAudioMap[trackId], true, 0.85, true);
        if(aud) {
          aud.onerror = () => {
            this.playSynthPreview(trackId);
          };
          return;
        }
      }
      this.playSynthPreview(trackId);
    },

    playSynthPreview(trackId) {
      let step = 0;

      if(trackId === 'happy') {
        const melody = [523, 659, 784, 659, 587, 698, 880, 698, 659, 784, 1047, 784, 698, 880, 1047, 880];
        const bass = [131, 0, 131, 0, 147, 0, 147, 0];
        this.previewTimer = setInterval(() => {
          const note = melody[step % melody.length], low = bass[Math.floor(step / 2) % bass.length];
          if(note) this.playTone(note, .19, 'triangle', .032);
          if(low) this.playTone(low, .32, 'sine', .038);
          if(step % 4 === 2) this.playTone(1046, .045, 'square', .012);
          step++;
        }, 180);
      } else if(trackId === 'bounce') {
        const melody = [659, 784, 880, 784, 659, 784, 1047, 880, 988, 880, 784, 880];
        const bass = [220, 220, 175, 175, 196, 196];
        this.previewTimer = setInterval(() => {
          const note = melody[step % melody.length], low = bass[step % bass.length];
          if(note) this.playTone(note, .14, 'square', .028);
          if(low) this.playTone(low, .22, 'sawtooth', .038, -20);
          step++;
        }, 140);
      } else if(trackId === 'arcade') {
        const melody = [392, 523, 659, 784, 659, 523, 440, 523, 587, 698, 880, 1047];
        const bass = [98, 131, 110, 147];
        this.previewTimer = setInterval(() => {
          const note = melody[step % melody.length], low = bass[Math.floor(step / 2) % bass.length];
          if(note) this.playTone(note, .11, 'square', .032, step % 3 === 0 ? 20 : 0);
          if(low && step % 2 === 0) this.playTone(low, .18, 'triangle', .038);
          step++;
        }, 125);
      } else if(trackId === 'chill') {
        const chords = [
          [440, 523, 659], [392, 494, 587], [349, 440, 523], [330, 392, 494]
        ];
        const bass = [110, 98, 87, 82];
        this.previewTimer = setInterval(() => {
          const chord = chords[Math.floor(step / 2) % chords.length];
          const low = bass[Math.floor(step / 2) % bass.length];
          if(step % 2 === 0) {
            chord.forEach(f => this.playTone(f, .45, 'sine', .026));
            this.playTone(low, .55, 'sine', .042);
          } else {
            this.playTone(chord[step % chord.length] * 2, .25, 'triangle', .02);
          }
          step++;
        }, 230);
      } else if(trackId === 'epic') {
        const melody = [523, 659, 784, 1047, 880, 1047, 1318, 1047, 784, 880, 1047, 1318, 1568, 1318, 1047, 784];
        const brassBass = [131, 165, 196, 262, 220, 262, 330, 262];
        this.previewTimer = setInterval(() => {
          const note = melody[step % melody.length], low = brassBass[Math.floor(step / 2) % brassBass.length];
          if(note) {
            this.playTone(note, .18, 'sawtooth', .032, 0);
            this.playTone(note * 0.5, .18, 'triangle', .025, 0);
          }
          if(low && step % 2 === 0) {
            this.playTone(low, .36, 'sawtooth', .042, -10);
            this.playTone(low * 0.5, .4, 'sine', .05, 0);
          }
          if(step % 4 === 0) this.playTone(160, .08, 'triangle', .045, -80);
          step++;
        }, 160);
      } else if(trackId === 'cyberbeat') {
        const melody = [440, 523, 587, 659, 784, 659, 587, 523, 440, 587, 659, 784, 880, 784, 659, 587];
        const cyberBass = [110, 110, 131, 110, 147, 110, 165, 131];
        this.previewTimer = setInterval(() => {
          const note = melody[step % melody.length], low = cyberBass[step % cyberBass.length];
          if(note) this.playTone(note, .12, 'square', .03, step % 2 === 0 ? 15 : -15);
          if(low) this.playTone(low, .16, 'sawtooth', .044, -20);
          if(step % 2 === 1) this.playTone(950, .035, 'sawtooth', .018, -500);
          if(step % 4 === 0) this.playTone(70, .12, 'triangle', .05, -30);
          step++;
        }, 135);
      } else if(trackId === 'gurenge') {
        const melody = [
          370, 0, 415, 0, 466, 0, 554, 554, 494, 0, 466, 0, 415, 0, 370, 0,
          415, 0, 466, 0, 554, 0, 622, 622, 554, 0, 466, 0, 415, 415, 370, 0
        ];
        const bass = [92, 92, 110, 110, 123, 123, 138, 138];
        this.previewTimer = setInterval(() => {
          const note = melody[step % melody.length], low = bass[Math.floor(step / 2) % bass.length];
          if(note) {
            this.playTone(note, .14, 'sawtooth', .032, 0);
            this.playTone(note * 0.5, .12, 'square', .022, 0);
          }
          if(low && step % 2 === 0) this.playTone(low, .22, 'triangle', .042, -20);
          if(step % 2 === 1) this.playTone(1100, .035, 'square', .016);
          step++;
        }, 130);
      } else if(trackId === 'blue_bird') {
        const melody = [
          440, 0, 494, 0, 523, 0, 587, 0, 659, 659, 587, 0, 523, 0, 494, 0,
          440, 0, 494, 0, 523, 0, 440, 0, 392, 0, 349, 0, 392, 0, 440, 0
        ];
        const bass = [110, 110, 131, 131, 147, 147, 131, 131];
        this.previewTimer = setInterval(() => {
          const note = melody[step % melody.length], low = bass[Math.floor(step / 2) % bass.length];
          if(note) this.playTone(note, .15, 'triangle', .038, 0);
          if(low && step % 2 === 0) this.playTone(low, .18, 'sine', .042, 0);
          if(step % 4 === 2) this.playTone(1300, .03, 'triangle', .014);
          step++;
        }, 135);
      } else if(trackId === 'we_are') {
        const melody = [
          392, 392, 440, 0, 494, 0, 523, 0, 587, 587, 494, 0, 392, 0, 330, 0,
          392, 0, 440, 0, 494, 0, 440, 0, 392, 0, 330, 0, 294, 0, 392, 0
        ];
        const bass = [98, 98, 131, 131, 147, 147, 131, 131];
        this.previewTimer = setInterval(() => {
          const note = melody[step % melody.length], low = bass[Math.floor(step / 2) % bass.length];
          if(note) {
            this.playTone(note, .16, 'sawtooth', .032, 0);
            this.playTone(note * 0.5, .16, 'triangle', .025, 0);
          }
          if(low && step % 2 === 0) this.playTone(low, .26, 'sine', .045);
          step++;
        }, 145);
      } else if(trackId === 'sparkle') {
        const chords = [
          [622, 784, 932, 1175], [698, 831, 1047, 1245], [784, 932, 1175, 1397], [932, 1175, 1397, 1568]
        ];
        const melody = [
          587, 0, 523, 0, 466, 0, 392, 0, 349, 0, 311, 0, 349, 0, 392, 0,
          466, 0, 523, 0, 587, 0, 698, 0, 587, 0, 466, 0, 392, 0, 0, 0
        ];
        const bass = [78, 87, 98, 117];
        this.previewTimer = setInterval(() => {
          const chord = chords[Math.floor(step / 2) % chords.length];
          const note = melody[step % melody.length];
          const low = bass[Math.floor(step / 2) % bass.length];
          if(step % 2 === 0) {
            chord.forEach(f => this.playTone(f, .45, 'sine', .022));
            this.playTone(low * 2, .55, 'sine', .04);
          }
          if(note) this.playTone(note, .28, 'triangle', .028);
          if(step % 3 === 0) this.playTone(note * 2, .18, 'sine', .016);
          step++;
        }, 190);
      }
    },
    stopPreview() {
      clearInterval(this.previewTimer);
      this.stopPreviewFileMusic();
      this.previewTimer = null;
      this.previewTrackId = null;
      // Resume background lobby music if we're in the menu
      if(state === State.MENU && settings.music) {
        if(this.currentAudioElem) {
          try { this.currentAudioElem.play().catch(() => {}); } catch(_) {}
        } else {
          this.lobbyMusic();
        }
      }
    },
    stopMusic() {
      clearInterval(this.musicTimer);
      clearInterval(this.deathTimer);
      this.stopFileMusic();
      this.stopPreviewFileMusic();
      clearInterval(this.previewTimer);
      this.previewTimer = null;
      this.previewTrackId = null;
      this.musicTimer = null;
      this.deathTimer = null;
      this.currentMusicType = null;
      stopBackgroundMusic();
    }
  };

  function persist() { storage.set('skyFlappySettings', settings); }
  function updateCoins() {
    if(el.coinHud) el.coinHud.innerHTML = 'COINS <b>' + progress.coins + '</b>';
    if(el.coinCount) el.coinCount.textContent = progress.coins;
    if(el.shopCoins) el.shopCoins.textContent = progress.coins;
    const topCoinEl = $('topCoinVal');
    if(topCoinEl) topCoinEl.textContent = progress.coins;
    const topRankEl = $('topRankVal');
    if(topRankEl) topRankEl.textContent = `${gpProfile.rankedBest || progress.rankedScore || 0}`;
  }

  function playBackgroundMusic() {
    if(!settings.music) return;
    if(state === State.MENU) {
      if(audio) audio.lobbyMusic();
    } else {
      if(audio) audio.music();
    }
  }
  function stopBackgroundMusic() {
    try {
      const bg = $('bgMusic');
      if(bg) {
        bg.pause();
        bg.currentTime = 0;
      }
    } catch(_) {}
  }
  function updateMusicUI() {
    const button = el.musicBtn;
    if(!button) return;
    button.classList.toggle('muted', !settings.music);
    button.innerHTML = settings.music ? 
      '<svg class="btn-svg music-svg" viewBox="0 0 24 24" width="19" height="19"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h6V3h-8z" fill="currentColor"/><circle cx="10" cy="17" r="3" fill="currentColor"/></svg>' : 
      '<svg class="btn-svg music-svg" viewBox="0 0 24 24" width="19" height="19"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h6V3h-8z" fill="currentColor"/><circle cx="10" cy="17" r="3" fill="currentColor"/><path d="m4 4 16 16" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round"/></svg>';
    button.setAttribute('aria-label', settings.music ? 'Matikan musik' : 'Nyalakan musik');
  }

  // ==========================================
  // SHOP LOGIC & LIVE SHOWCASE STAGE
  // ==========================================
  let shopCategory = 'bird';
  const previewLoadout = {
    bird: 'classic',
    pet: 'pip_peep',
    booster: 'none',
    aura: 'default',
    hat: 'none',
    outfit: 'none',
    pipe: 'green',
    background: 'sky',
    music: 'happy'
  };
  let showcaseRunning = false;
  let showcaseParticles = [];
  let showcaseTrailTimer = 0;

  function syncPreviewLoadout() {
    previewLoadout.bird = progress.selected || 'classic';
    previewLoadout.pet = progress.selectedPet || 'pip_peep';
    previewLoadout.booster = progress.selectedBooster || 'none';
    previewLoadout.aura = progress.selectedAura || 'default';
    previewLoadout.hat = progress.selectedHat || 'none';
    previewLoadout.outfit = progress.selectedOutfit || 'none';
    previewLoadout.pipe = progress.selectedPipe || 'green';
    previewLoadout.background = progress.selectedBackground || 'sky';
    previewLoadout.music = progress.selectedMusic || 'happy';
    updateShowcaseLabel();
  }

  function updateShowcaseLabel() {
    if(!el.showcaseLabel) return;
    const cat = shopCategory;
    const catCatalog = shopCatalog();
    const currentId = previewLoadout[cat] || (cat === 'pet' ? 'pip_peep' : 'none');
    const item = catCatalog[currentId];
    if(item) {
      el.showcaseLabel.textContent = 'PREVIEW: ' + item.name;
    } else {
      el.showcaseLabel.textContent = 'PREVIEW STAGE';
    }
  }

  function startShopShowcase() {
    if(showcaseRunning) return;
    showcaseRunning = true;
    showcaseParticles = [];
    requestAnimationFrame(renderShopShowcaseFrame);
  }

  function stopShopShowcase() {
    showcaseRunning = false;
  }

  // ==========================================
  // FRIEND PROFILE 60FPS LIVE SHOWCASE RENDERER
  // ==========================================
  let friendShowcaseRunning = false;
  let friendShowcaseParticles = [];
  let friendShowcaseTrailTimer = 0;
  let friendShowcaseLoadout = { bird: 'classic', pet: 'none', hat: 'none', outfit: 'none', aura: 'none', background: 'sky', pipe: 'green' };

  let friendShowcaseTargetCanvasId = 'fpShowcaseCanvas';

  function startFriendShowcase(loadout, canvasId) {
    if(loadout) friendShowcaseLoadout = Object.assign({ bird: 'classic', pet: 'none', hat: 'none', outfit: 'none', aura: 'none', background: 'sky', pipe: 'green' }, loadout);
    friendShowcaseTargetCanvasId = canvasId || 'fpShowcaseCanvas';
    friendShowcaseRunning = true;
    friendShowcaseParticles = [];
    requestAnimationFrame(renderFriendShowcaseFrame);
  }

  function stopFriendShowcase() {
    friendShowcaseRunning = false;
  }

  function renderFriendShowcaseFrame() {
    const canvas = $(friendShowcaseTargetCanvasId) || $('fpShowcaseCanvas') || $('myProfileShowcaseCanvas');
    if(!friendShowcaseRunning || !canvas) return;
    const sCtx = canvas.getContext('2d');
    const sW = canvas.width, sH = canvas.height;

    // 1. Background Sky Gradient
    const bg = backgrounds[friendShowcaseLoadout.background] || backgrounds.sky;
    const sky = sCtx.createLinearGradient(0, 0, 0, sH);
    sky.addColorStop(0, bg.top);
    sky.addColorStop(1, bg.bottom);
    sCtx.fillStyle = sky;
    sCtx.fillRect(0, 0, sW, sH);

    // Mini Clouds
    const now = performance.now();
    const cloud1X = ((now / 70) % (sW + 70)) - 35;
    const cloud2X = (((now / 100) + 150) % (sW + 70)) - 35;
    sCtx.fillStyle = 'rgba(255,255,255,0.45)';
    sCtx.beginPath();
    sCtx.arc(cloud1X, 20, 11, 0, 7);
    sCtx.arc(cloud1X + 10, 16, 14, 0, 7);
    sCtx.arc(cloud1X + 22, 20, 10, 0, 7);
    sCtx.fill();

    sCtx.beginPath();
    sCtx.arc(cloud2X, 32, 9, 0, 7);
    sCtx.arc(cloud2X + 8, 29, 11, 0, 7);
    sCtx.arc(cloud2X + 18, 32, 8, 0, 7);
    sCtx.fill();

    // Mini Hills
    sCtx.fillStyle = bg.hill;
    sCtx.beginPath();
    sCtx.moveTo(0, sH - 20);
    for(let x = 0; x <= sW; x += 35) sCtx.quadraticCurveTo(x + 18, sH - 36 + (x % 70 ? 10 : 0), x + 35, sH - 20);
    sCtx.lineTo(sW, sH);
    sCtx.lineTo(0, sH);
    sCtx.fill();

    // 2. Mini Ground
    sCtx.fillStyle = '#46b65c';
    sCtx.fillRect(0, sH - 18, sW, 5);
    sCtx.fillStyle = '#b57a45';
    sCtx.fillRect(0, sH - 13, sW, 13);
    sCtx.fillStyle = '#e6ad5a';
    sCtx.fillRect(0, sH - 11, sW, 2);

    // 3. Mini Pipe on Right Side
    const pipeSkin = pipeSkins[friendShowcaseLoadout.pipe] || pipeSkins.green;
    const pX = sW - 60, pW = 28, gapY = 16, gapSize = 36, cap = 5;
    sCtx.save();
    sCtx.fillStyle = pipeSkin.body;
    rrTo(sCtx, pX, 0, pW, gapY - cap, 3);
    rrTo(sCtx, pX, gapY + gapSize + cap, pW, sH - (gapY + gapSize + cap) - 18, 3);
    sCtx.fillStyle = pipeSkin.cap;
    rrTo(sCtx, pX - 3, gapY - cap, pW + 6, cap, 2);
    rrTo(sCtx, pX - 3, gapY + gapSize, pW + 6, cap, 2);
    sCtx.restore();

    // 4. Showcase Aura Trail Spawner & Particles
    friendShowcaseTrailTimer += 0.033;
    if(friendShowcaseTrailTimer > 0.05) {
      friendShowcaseTrailTimer = 0;
      const bX = 120, bY = 38 + Math.sin(now / 240) * 4;
      const auraId = friendShowcaseLoadout.aura || 'default';
      const colors = auraId === 'fire' ? ['#ff3b00', '#ffd000'] :
                     auraId === 'rainbow' ? ['hsl(' + ((now * 0.5) % 360) + ', 100%, 65%)'] :
                     auraId === 'galaxy' ? ['#c77dff', '#48cae4'] :
                     auraId === 'neon' ? ['#00f5d4', '#fee440'] :
                     auraId === 'bubble' ? ['#a0e7e5'] :
                     auraId === 'hearts' ? ['#ff4d6d', '#ff758f'] :
                     auraId === 'golden' ? ['#ffd700', '#fff066'] : ['#ffd74c'];
      const col = colors[Math.floor(Math.random() * colors.length)];
      friendShowcaseParticles.push({
        x: bX - 16, y: bY + 3 + (Math.random() - .5) * 6,
        vx: -60 - Math.random() * 30, vy: (Math.random() - .5) * 20,
        life: 0.45, maxLife: 0.45, color: col, size: 3.5 + Math.random() * 3,
        type: auraId === 'fire' ? 'flame' : auraId === 'bubble' ? 'bubble' : auraId === 'hearts' ? 'heart' : auraId === 'golden' ? 'coin' : 'star'
      });
    }

    for(const q of friendShowcaseParticles) {
      q.x += q.vx * 0.033;
      q.y += q.vy * 0.033;
      q.life -= 0.033;
      drawAuraParticleTo(sCtx, q);
    }
    friendShowcaseParticles = friendShowcaseParticles.filter(q => q.life > 0);

    // 5. Bird Preview
    const bX = 120, bY = 38 + Math.sin(now / 240) * 4;
    const bAngle = Math.sin(now / 240) * 0.06;
    const bWing = Math.sin(now / 120) > 0 ? 0.2 : 0;
    renderCustomBird(sCtx, {
      x: bX, y: bY, angle: bAngle, wing: bWing,
      skinId: friendShowcaseLoadout.bird || 'classic',
      hatId: friendShowcaseLoadout.hat || 'none',
      outfitId: friendShowcaseLoadout.outfit || 'none',
      opacity: 1
    });

    // 5b. Pet Companion Preview
    if(friendShowcaseLoadout.pet && friendShowcaseLoadout.pet !== 'none') {
      const pSkin = petsCatalog[friendShowcaseLoadout.pet] || petsCatalog.pip_peep;
      if(pSkin && pSkin.baby1 && pSkin.baby2) {
        drawBabyBird({
          x: bX - 24,
          y: bY - 14 + Math.sin(now / 220) * 3,
          r: 7.2,
          wing: now / 90,
          angle: 0,
          state: 'follow',
          color: pSkin.baby1.color,
          wingColor: pSkin.baby1.wingColor,
          blushColor: pSkin.baby1.blushColor,
          accessory: pSkin.baby1.accessory
        }, sCtx);

        drawBabyBird({
          x: bX - 28,
          y: bY + 14 + Math.sin(now / 240 + Math.PI) * 3,
          r: 6.8,
          wing: now / 90,
          angle: 0,
          state: 'follow',
          color: pSkin.baby2.color,
          wingColor: pSkin.baby2.wingColor,
          blushColor: pSkin.baby2.blushColor,
          accessory: pSkin.baby2.accessory
        }, sCtx);
      }
    }

    if(friendShowcaseRunning) requestAnimationFrame(renderFriendShowcaseFrame);
  }

  window.startFriendShowcase = startFriendShowcase;
  window.stopFriendShowcase = stopFriendShowcase;

  function renderShopShowcaseFrame() {
    if(!showcaseRunning || !el.shopCanvas) return;
    const sCtx = el.shopCanvas.getContext('2d');
    const sW = el.shopCanvas.width, sH = el.shopCanvas.height;

    // 1. Background Sky Gradient
    const bg = backgrounds[previewLoadout.background] || backgrounds.sky;
    const sky = sCtx.createLinearGradient(0, 0, 0, sH);
    sky.addColorStop(0, bg.top);
    sky.addColorStop(1, bg.bottom);
    sCtx.fillStyle = sky;
    sCtx.fillRect(0, 0, sW, sH);

    // Mini Clouds
    const now = performance.now();
    const cloud1X = ((now / 70) % (sW + 70)) - 35;
    const cloud2X = (((now / 100) + 150) % (sW + 70)) - 35;
    sCtx.fillStyle = 'rgba(255,255,255,0.45)';
    sCtx.beginPath();
    sCtx.arc(cloud1X, 20, 11, 0, 7);
    sCtx.arc(cloud1X + 10, 16, 14, 0, 7);
    sCtx.arc(cloud1X + 22, 20, 10, 0, 7);
    sCtx.fill();

    sCtx.beginPath();
    sCtx.arc(cloud2X, 32, 9, 0, 7);
    sCtx.arc(cloud2X + 8, 29, 11, 0, 7);
    sCtx.arc(cloud2X + 18, 32, 8, 0, 7);
    sCtx.fill();

    // Mini Hills
    sCtx.fillStyle = bg.hill;
    sCtx.beginPath();
    sCtx.moveTo(0, sH - 20);
    for(let x = 0; x <= sW; x += 35) sCtx.quadraticCurveTo(x + 18, sH - 36 + (x % 70 ? 10 : 0), x + 35, sH - 20);
    sCtx.lineTo(sW, sH);
    sCtx.lineTo(0, sH);
    sCtx.fill();

    // 2. Mini Ground
    sCtx.fillStyle = '#46b65c';
    sCtx.fillRect(0, sH - 18, sW, 5);
    sCtx.fillStyle = '#b57a45';
    sCtx.fillRect(0, sH - 13, sW, 13);
    sCtx.fillStyle = '#e6ad5a';
    sCtx.fillRect(0, sH - 11, sW, 2);

    // 3. Mini Pipe on Right Side
    const pipeSkin = pipeSkins[previewLoadout.pipe] || pipeSkins.green;
    const pX = sW - 55, pW = 28, gapY = 16, gapSize = 36, cap = 5;
    sCtx.save();
    sCtx.fillStyle = pipeSkin.body;
    rrTo(sCtx, pX, 0, pW, gapY - cap, 3);
    rrTo(sCtx, pX, gapY + gapSize + cap, pW, sH - (gapY + gapSize + cap) - 18, 3);
    sCtx.fillStyle = pipeSkin.cap;
    rrTo(sCtx, pX - 3, gapY - cap, pW + 6, cap, 2);
    rrTo(sCtx, pX - 3, gapY + gapSize, pW + 6, cap, 2);
    sCtx.restore();

    // 4. Showcase Aura Trail Spawner & Particles
    showcaseTrailTimer += 0.033;
    if(showcaseTrailTimer > 0.05) {
      showcaseTrailTimer = 0;
      const bX = 110, bY = 40 + Math.sin(now / 240) * 4;
      const auraId = previewLoadout.aura || 'default';
      const colors = auraId === 'fire' ? ['#ff3b00', '#ffd000'] :
                     auraId === 'rainbow' ? ['hsl(' + ((now * 0.5) % 360) + ', 100%, 65%)'] :
                     auraId === 'galaxy' ? ['#c77dff', '#48cae4'] :
                     auraId === 'neon' ? ['#00f5d4', '#fee440'] :
                     auraId === 'bubble' ? ['#a0e7e5'] :
                     auraId === 'hearts' ? ['#ff4d6d', '#ff758f'] :
                     auraId === 'golden' ? ['#ffd700', '#fff066'] : ['#ffd74c'];
      const col = colors[Math.floor(Math.random() * colors.length)];
      showcaseParticles.push({
        x: bX - 16, y: bY + 3 + (Math.random() - .5) * 6,
        vx: -60 - Math.random() * 30, vy: (Math.random() - .5) * 20,
        life: 0.45, maxLife: 0.45, color: col, size: 3.5 + Math.random() * 3,
        type: auraId === 'fire' ? 'flame' : auraId === 'bubble' ? 'bubble' : auraId === 'hearts' ? 'heart' : auraId === 'golden' ? 'coin' : 'star'
      });
    }

    for(const q of showcaseParticles) {
      q.x += q.vx * 0.033;
      q.y += q.vy * 0.033;
      q.life -= 0.033;
      drawAuraParticleTo(sCtx, q);
    }
    showcaseParticles = showcaseParticles.filter(q => q.life > 0);

    // 5. Bird Preview
    const bX = 115, bY = 40 + Math.sin(now / 240) * 4;
    const bAngle = Math.sin(now / 240) * 0.06;
    const bWing = Math.sin(now / 120) > 0 ? 0.2 : 0;
    renderCustomBird(sCtx, {
      x: bX, y: bY, angle: bAngle, wing: bWing,
      skinId: previewLoadout.bird,
      hatId: previewLoadout.hat,
      outfitId: previewLoadout.outfit,
      opacity: 1
    });

    // 5b. Pet Companion Preview in Shop Showcase
    if(previewLoadout.pet && previewLoadout.pet !== 'none') {
      const pSkin = petsCatalog[previewLoadout.pet] || petsCatalog.pip_peep;
      if(pSkin && pSkin.baby1 && pSkin.baby2) {
        drawBabyBird({
          x: bX - 22,
          y: bY - 14 + Math.sin(now / 220) * 3,
          r: 7.2,
          wing: now / 90,
          angle: 0,
          state: 'follow',
          color: pSkin.baby1.color,
          wingColor: pSkin.baby1.wingColor,
          blushColor: pSkin.baby1.blushColor,
          accessory: pSkin.baby1.accessory
        }, sCtx);

        drawBabyBird({
          x: bX - 26,
          y: bY + 14 + Math.sin(now / 240 + Math.PI) * 3,
          r: 6.8,
          wing: now / 90,
          angle: 0,
          state: 'follow',
          color: pSkin.baby2.color,
          wingColor: pSkin.baby2.wingColor,
          blushColor: pSkin.baby2.blushColor,
          accessory: pSkin.baby2.accessory
        }, sCtx);

        // Showcase Skill Effects for Selected Pet
        if(previewLoadout.pet === 'momo_hana') {
          sCtx.save();
          sCtx.translate(bX, bY);
          drawSakuraLotusShield(sCtx, 22);
          sCtx.restore();
        } else if(previewLoadout.pet === 'aero_lumos') {
          sCtx.save();
          sCtx.strokeStyle = '#fde047';
          sCtx.lineWidth = 2;
          sCtx.shadowColor = '#fde047';
          sCtx.shadowBlur = 8;
          sCtx.beginPath();
          sCtx.ellipse(bX, bY - 20, 12, 4.5, 0, 0, Math.PI * 2);
          sCtx.stroke();
          sCtx.restore();
        } else if(previewLoadout.pet === 'blaze_ember') {
          sCtx.save();
          const flameGrad = sCtx.createRadialGradient(bX + 16, bY, 4, bX + 45, bY, 35);
          flameGrad.addColorStop(0, 'rgba(253, 224, 71, 0.9)');
          flameGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.7)');
          flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
          sCtx.fillStyle = flameGrad;
          sCtx.beginPath();
          sCtx.arc(bX + 22, bY, 14, 0, Math.PI * 2);
          sCtx.fill();
          sCtx.restore();
        }
      }
    }

    // 6. Floating Music Notes when previewing music
    if(audio.previewTrackId) {
      const noteOff = (now / 18) % 36;
      sCtx.fillStyle = '#fde047';
      sCtx.shadowColor = 'rgba(253,224,71,0.6)';
      sCtx.shadowBlur = 6;
      sCtx.font = 'bold 11px Arial';
      sCtx.fillText('NOTE', bX - 12, bY - 14 - noteOff);
      sCtx.fillStyle = '#67e8f9';
      sCtx.fillText('AUDIO', bX + 14, bY - 8 - ((noteOff + 18) % 36));
      sCtx.shadowBlur = 0;
    }

    requestAnimationFrame(renderShopShowcaseFrame);
  }

  function shopCatalog() {
    switch(shopCategory) {
      case 'bird': return skins;
      case 'pet': return petsCatalog;
      case 'booster': return boosters;
      case 'aura': return auras;
      case 'hat': return hats;
      case 'outfit': return outfits;
      case 'pipe': return pipeSkins;
      case 'background': return backgrounds;
      case 'music': return tracks;
      default: return skins;
    }
  }
  function shopKeys() {
    if(shopCategory === 'bird') return ['unlocked', 'selected'];
    return [shopCategory + 'Unlocked', 'selected' + shopCategory[0].toUpperCase() + shopCategory.slice(1)];
  }
  function getShopItemSvg(cat, id, item) {
    const b = item.body || item.color || '#38bdf8';
    const w = item.wing || item.edge || '#0284c7';
    const bk = item.beak || '#f97316';

    if(cat === 'pet') {
      if(id === 'none') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="11" fill="none" stroke="#94a3b8" stroke-width="2.5"/><line x1="8" y1="8" x2="24" y2="24" stroke="#94a3b8" stroke-width="2.5"/></svg>`;
      }
      const b1 = item.baby1 ? item.baby1.color : '#fef08a';
      const b2 = item.baby2 ? item.baby2.color : '#bae6fd';
      const w1 = item.baby1 ? item.baby1.wingColor : '#fde047';
      const w2 = item.baby2 ? item.baby2.wingColor : '#7dd3fc';
      return `<svg viewBox="0 0 32 32" class="shop-item-svg">
        <circle cx="11" cy="18" r="7" fill="${b1}"/>
        <ellipse cx="6" cy="19" rx="3.5" ry="2.2" fill="${w1}"/>
        <polygon points="17,17 21,18.5 17,20" fill="#f97316"/>
        <circle cx="14" cy="16" r="2" fill="#0f172a"/>
        <circle cx="14.6" cy="15.4" r="0.8" fill="#fff"/>
        <circle cx="11" cy="19.5" r="1.3" fill="${item.baby1 ? item.baby1.blushColor : '#fda4af'}"/>
        <circle cx="21" cy="14" r="6.5" fill="${b2}"/>
        <ellipse cx="16" cy="15" rx="3" ry="2" fill="${w2}"/>
        <polygon points="26.5,13.5 30,14.8 26.5,16" fill="#f97316"/>
        <circle cx="23.8" cy="12.2" r="1.8" fill="#0f172a"/>
        <circle cx="24.4" cy="11.6" r="0.7" fill="#fff"/>
        <circle cx="21" cy="15.2" r="1.2" fill="${item.baby2 ? item.baby2.blushColor : '#fda4af'}"/>
      </svg>`;
    }

    if(cat === 'bird') {
      return `<svg viewBox="0 0 32 32" class="shop-item-svg">
        <ellipse cx="14" cy="16" rx="11" ry="9" fill="${b}"/>
        <ellipse cx="6" cy="18" rx="6" ry="4.5" fill="#f59e0b"/>
        <path d="M22 13 L31 16 L22 19 Z" fill="${bk}"/>
        <path d="M22 16 L29 16" stroke="rgba(0,0,0,0.2)" stroke-width="1"/>
        <circle cx="18" cy="12" r="3.6" fill="#fff"/>
        <circle cx="19" cy="12" r="1.6" fill="#0f172a"/>
        <circle cx="19.5" cy="11.5" r="0.6" fill="#fff"/>
        <ellipse cx="11" cy="18" rx="6.5" ry="4" fill="${w}" transform="rotate(-10 11 18)"/>
      </svg>`;
    }

    if(cat === 'booster') {
      if(id === 'none') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="11" fill="none" stroke="#94a3b8" stroke-width="2.5"/><line x1="8" y1="8" x2="24" y2="24" stroke="#94a3b8" stroke-width="2.5"/></svg>`;
      }
      if(id === 'extra_life') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M16 28 C6 19 3 13 3 8 A6.5 6.5 0 0 1 16 7.2 A6.5 6.5 0 0 1 29 8 C29 13 26 19 16 28 Z" fill="#ef4444" stroke="#fda4af" stroke-width="1.8"/><text x="16" y="16.5" font-family="'Trebuchet MS', Arial, sans-serif" font-size="11" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">+1</text></svg>`;
      }
      if(id === 'shield') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M16 4 L26 8 L24 20 L16 28 L8 20 L6 8 Z" fill="#0284c7" stroke="#7dd3fc" stroke-width="1.8"/><path d="M16 8 L22 11 L20 19 L16 24 L12 19 L10 11 Z" fill="#38bdf8"/></svg>`;
      }
      if(id === 'magnet') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M7 13 A9 9 0 0 1 25 13 V23 H20 V13 A4 4 0 0 0 12 13 V23 H7 Z" fill="#dc2626"/><rect x="7" y="19" width="5" height="5" fill="#e2e8f0"/><rect x="20" y="19" width="5" height="5" fill="#e2e8f0"/><path d="M4 11 A12 12 0 0 1 28 11" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="3 3"/></svg>`;
      }
      if(id === 'slow') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="12" fill="rgba(6,182,212,0.18)"/><line x1="16" y1="5" x2="16" y2="27" stroke="#0891b2" stroke-width="2.4"/><line x1="5" y1="16" x2="27" y2="16" stroke="#0891b2" stroke-width="2.4"/><line x1="8" y1="8" x2="24" y2="24" stroke="#0891b2" stroke-width="2.4"/><line x1="8" y1="24" x2="24" y2="8" stroke="#0891b2" stroke-width="2.4"/><circle cx="16" cy="16" r="3.5" fill="#67e8f9"/></svg>`;
      }
      if(id === 'star') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><polygon points="16,3 20,12 29,13 22,20 24,29 16,24 8,29 10,20 3,13 12,12" fill="#f59e0b" stroke="#fde047" stroke-width="1.8"/><polygon points="16,8 18.5,14 24,14.5 19.5,19 21,24.5 16,21 11,24.5 12.5,19 8,14.5 13.5,14" fill="#fef08a"/></svg>`;
      }
      if(id === 'rocket') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M16 4 Q25 11 22 23 L10 23 Q7 11 16 4 Z" fill="#ef4444"/><circle cx="16" cy="13" r="3.8" fill="#fff"/><circle cx="16" cy="13" r="2.2" fill="#38bdf8"/><path d="M10 18 L4 23 L10 23 Z" fill="#ea580c"/><path d="M22 18 L28 23 L22 23 Z" fill="#ea580c"/><polygon points="12,23 16,29 20,23" fill="#fde047"/></svg>`;
      }
      if(id === 'double_shield') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M13 3 L22 6 L20 17 L13 24 L6 17 L4 6 Z" fill="#0284c7" stroke="#7dd3fc" stroke-width="1.4"/><path d="M19 8 L28 11 L26 22 L19 29 L12 22 L10 11 Z" fill="#0369a1" stroke="#38bdf8" stroke-width="1.4"/><path d="M19 11 L24 14 L22 21 L19 25 L16 21 L14 14 Z" fill="#38bdf8"/></svg>`;
      }
    }

    if(cat === 'aura') {
      if(id === 'default') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M6 22 Q16 10 26 8 Q24 16 14 24 Z" fill="#ffd74c"/><path d="M10 26 Q18 16 26 14" stroke="#fff5b2" stroke-width="2"/></svg>`;
      }
      if(id === 'fire') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M16 4 Q24 14 18 20 Q24 22 22 28 Q16 32 10 28 Q4 22 12 16 Q10 10 16 4 Z" fill="#ff5400"/><path d="M16 12 Q20 18 16 22 Q19 24 18 27 Q14 29 12 26 Q10 22 14 18 Z" fill="#ffd000"/></svg>`;
      }
      if(id === 'rainbow') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M4 25 A12 12 0 0 1 28 25" fill="none" stroke="#ff4d6d" stroke-width="3"/><path d="M7 25 A9 9 0 0 1 25 25" fill="none" stroke="#ffd166" stroke-width="3"/><path d="M10 25 A6 6 0 0 1 22 25" fill="none" stroke="#06d6a0" stroke-width="3"/><path d="M13 25 A3 3 0 0 1 19 25" fill="none" stroke="#118ab2" stroke-width="3"/></svg>`;
      }
      if(id === 'galaxy') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="7" fill="#7c3aed"/><ellipse cx="16" cy="16" rx="14" ry="4.5" fill="none" stroke="#38bdf8" stroke-width="2" transform="rotate(-25 16 16)"/><circle cx="23" cy="10" r="1.5" fill="#fde047"/></svg>`;
      }
      if(id === 'neon') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><polygon points="18,3 8,17 15,17 12,29 24,14 17,14" fill="#00f5d4" stroke="#fee440" stroke-width="1.6"/></svg>`;
      }
      if(id === 'bubble') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="13" cy="18" r="8" fill="rgba(144,224,239,0.55)" stroke="#00b4d8" stroke-width="1.8"/><circle cx="10" cy="15" r="2.2" fill="#fff"/><circle cx="23" cy="11" r="5" fill="rgba(144,224,239,0.55)" stroke="#00b4d8" stroke-width="1.6"/></svg>`;
      }
      if(id === 'hearts') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M16 28 C7 20 3 14 3 9 A6 6 0 0 1 15 6 L16 8 L17 6 A6 6 0 0 1 29 9 C29 14 25 20 16 28 Z" fill="#ff4d6d" stroke="#ff758f" stroke-width="1.5"/><ellipse cx="10" cy="9" rx="2" ry="1.2" fill="#fff" transform="rotate(-30 10 9)"/></svg>`;
      }
      if(id === 'golden') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="11" fill="#ffd700" stroke="#b45309" stroke-width="1.8"/><circle cx="16" cy="16" r="8" fill="none" stroke="#fef08a" stroke-width="1.4"/><polygon points="16,10 18,14 22,16 18,18 16,22 14,18 10,16 14,14" fill="#fff"/></svg>`;
      }
      if(id === 'frost') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="12" fill="rgba(103,232,249,0.2)" stroke="#67e8f9" stroke-width="1.2"/><line x1="16" y1="4" x2="16" y2="28" stroke="#38bdf8" stroke-width="2.2"/><line x1="4" y1="16" x2="28" y2="16" stroke="#38bdf8" stroke-width="2.2"/><line x1="7" y1="7" x2="25" y2="25" stroke="#38bdf8" stroke-width="1.8"/><line x1="7" y1="25" x2="25" y2="7" stroke="#38bdf8" stroke-width="1.8"/><circle cx="16" cy="16" r="3" fill="#ffffff"/></svg>`;
      }
      if(id === 'plasma') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="9" fill="#a855f7" stroke="#c084fc" stroke-width="2"/><circle cx="16" cy="16" r="4.5" fill="#38bdf8"/><path d="M16 3 L16 8 M16 24 L16 29 M3 16 L8 16 M24 16 L29 16" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round"/></svg>`;
      }
      if(id === 'sakura') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="11" fill="rgba(244,114,182,0.15)"/><path d="M16 6 Q19 12 16 18 Q13 12 16 6 Z" fill="#f472b6"/><path d="M26 16 Q20 19 14 16 Q20 13 26 16 Z" fill="#fda4af"/><path d="M16 26 Q13 20 16 14 Q19 20 16 26 Z" fill="#f472b6"/><path d="M6 16 Q12 13 18 16 Q12 19 6 16 Z" fill="#fda4af"/><circle cx="16" cy="16" r="2.5" fill="#fde047"/></svg>`;
      }
      if(id === 'matrix') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><rect x="4" y="4" width="24" height="24" rx="4" fill="#052e16"/><text x="8" y="13" fill="#22c55e" font-family="monospace" font-size="7" font-weight="900">10</text><text x="18" y="13" fill="#4ade80" font-family="monospace" font-size="7" font-weight="900">01</text><text x="8" y="23" fill="#86efac" font-family="monospace" font-size="7" font-weight="900">11</text><text x="18" y="23" fill="#22c55e" font-family="monospace" font-size="7" font-weight="900">00</text></svg>`;
      }
      if(id === 'super_saiyan') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M16 2 L20 12 L28 10 L22 18 L27 28 L16 23 L5 28 L10 18 L4 10 L12 12 Z" fill="#facc15" stroke="#eab308" stroke-width="1.2"/><polygon points="16,6 18,14 24,14 19,18 21,24 16,20 11,24 13,18 8,14 14,14" fill="#fef08a"/><path d="M14 8 L10 16 L15 16 L11 26 L22 14 L16 14 Z" fill="#38bdf8"/></svg>`;
      }
      if(id === 'domain_expansion') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="12" fill="#0f172a" stroke="#8b5cf6" stroke-width="1.8"/><ellipse cx="16" cy="16" rx="14" ry="5" fill="none" stroke="#38bdf8" stroke-width="1.8" transform="rotate(-30 16 16)"/><circle cx="16" cy="16" r="5" fill="#7c3aed"/><circle cx="16" cy="16" r="2.5" fill="#00f5d4"/><circle cx="10" cy="10" r="1.2" fill="#fff"/><circle cx="23" cy="21" r="1" fill="#fff"/></svg>`;
      }
      if(id === 'nine_tails_chakra') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M16 3 Q24 8 20 18 Q27 12 25 24 Q20 30 16 25 Q12 30 7 24 Q5 12 12 18 Q8 8 16 3 Z" fill="#dc2626"/><path d="M16 9 Q21 14 18 20 Q22 17 20 24 Q16 27 14 23 Q11 26 9 22 Q11 15 14 19 Q12 12 16 9 Z" fill="#ea580c"/><circle cx="16" cy="18" r="3.5" fill="#fde047"/></svg>`;
      }
      if(id === 'gear_fifth') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="12" fill="#fef08a" stroke="#facc15" stroke-width="1.4"/><path d="M10 18 Q6 14 10 10 Q16 6 22 10 Q26 14 22 18 Q16 22 10 18 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/><path d="M11 16 Q16 21 21 16" fill="none" stroke="#0f172a" stroke-width="1.5" stroke-linecap="round"/><circle cx="13" cy="13" r="1.4" fill="#0f172a"/><circle cx="19" cy="13" r="1.4" fill="#0f172a"/></svg>`;
      }
      if(id === 'black_getsuga') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="12" fill="#450a0a"/><path d="M5 26 Q12 8 27 6 Q16 16 10 27 Z" fill="#0f172a" stroke="#ef4444" stroke-width="2"/><path d="M7 23 Q13 11 24 9 Q16 17 11 25 Z" fill="#dc2626"/></svg>`;
      }
    }

    if(cat === 'hat') {
      if(id === 'none') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="11" fill="none" stroke="#94a3b8" stroke-width="2.5"/><line x1="8" y1="8" x2="24" y2="24" stroke="#94a3b8" stroke-width="2.5"/></svg>`;
      }
      if(id === 'tophat') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><ellipse cx="16" cy="24" rx="14" ry="3" fill="#1e293b"/><path d="M9 24 L10 10 Q16 8 22 10 L23 24 Z" fill="#0f172a"/><rect x="9.5" y="20" width="13" height="3" fill="#dc2626"/><ellipse cx="16" cy="10" rx="6" ry="1.5" fill="#334155"/></svg>`;
      }
      if(id === 'cap') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M6 21 Q7 10 18 10 Q24 10 24 21 Z" fill="#2563eb"/><path d="M16 21 Q25 21 29 23 L22 25 Q16 23 6 21 Z" fill="#1d4ed8"/><circle cx="16" cy="10" r="1.5" fill="#fde047"/></svg>`;
      }
      if(id === 'crown') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M5 24 L7 10 L12 17 L16 8 L20 17 L25 10 L27 24 Z" fill="#f59e0b" stroke="#b45309" stroke-width="1.2"/><rect x="5" y="22" width="22" height="4" rx="1.5" fill="#fbbf24"/><circle cx="16" cy="8" r="1.8" fill="#ef4444"/><circle cx="7" cy="10" r="1.4" fill="#3b82f6"/><circle cx="25" cy="10" r="1.4" fill="#3b82f6"/></svg>`;
      }
      if(id === 'party') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><polygon points="16,4 7,26 25,26" fill="#ec4899"/><path d="M9 21 L23 21 L21 16 L11 16 Z" fill="#fde047"/><path d="M12 13 L20 13 L18 8 L14 8 Z" fill="#38bdf8"/><circle cx="16" cy="4" r="2.5" fill="#f59e0b"/></svg>`;
      }
      if(id === 'cowboy') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><ellipse cx="16" cy="22" rx="14" ry="4" fill="#78350f"/><path d="M10 21 Q11 12 16 14 Q21 12 22 21 Z" fill="#92400e"/><rect x="10.5" y="18.5" width="11" height="2" fill="#b45309"/></svg>`;
      }
      if(id === 'pirate') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M4 22 Q16 12 28 22 Q22 8 16 11 Q10 8 4 22 Z" fill="#0f172a" stroke="#fbbf24" stroke-width="1.2"/><circle cx="16" cy="17" r="2.5" fill="#fff"/><circle cx="15.2" cy="16.5" r="0.7" fill="#000"/><circle cx="16.8" cy="16.5" r="0.7" fill="#000"/></svg>`;
      }
      if(id === 'chef') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M10 24 L10 18 Q6 17 6 13 Q6 8 11 8 Q13 5 16 5 Q19 5 21 8 Q26 8 26 13 Q26 17 22 18 L22 24 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.4"/><rect x="10" y="21" width="12" height="4" fill="#e2e8f0"/></svg>`;
      }
      if(id === 'beanie') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M8 23 Q8 10 16 9 Q24 10 24 23 Z" fill="#dc2626"/><rect x="7" y="20" width="18" height="5" rx="2" fill="#991b1b"/><circle cx="16" cy="7.5" r="3" fill="#ffffff"/></svg>`;
      }
      if(id === 'flowercrown') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><ellipse cx="16" cy="20" rx="12" ry="4" fill="none" stroke="#15803d" stroke-width="2.2"/><circle cx="10" cy="18" r="3" fill="#f472b6"/><circle cx="16" cy="16" r="3.5" fill="#fb7185"/><circle cx="22" cy="18" r="3" fill="#f472b6"/><circle cx="16" cy="16" r="1.2" fill="#fde047"/></svg>`;
      }
      if(id === 'pinkribbon') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M16 16 L8 10 Q6 16 8 22 Z" fill="#f43f5e"/><path d="M16 16 L24 10 Q26 16 24 22 Z" fill="#f43f5e"/><rect x="14" y="14" width="4" height="4" rx="1.5" fill="#fb7185"/><path d="M15 18 L11 26 M17 18 L21 26" stroke="#e11d48" stroke-width="2.2"/></svg>`;
      }
      if(id === 'sunhat') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><ellipse cx="16" cy="22" rx="14" ry="4.5" fill="#fde047" stroke="#ca8a04" stroke-width="1.2"/><path d="M11 20 Q12 11 16 11 Q20 11 21 20 Z" fill="#eab308"/><rect x="11.5" y="18" width="9" height="2.2" fill="#ec4899"/></svg>`;
      }
      if(id === 'tiara') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M7 23 L9 13 L13 18 L16 9 L19 18 L23 13 L25 23 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.2"/><rect x="6" y="22" width="20" height="2.5" fill="#cbd5e1"/><circle cx="16" cy="12" r="2.2" fill="#ec4899"/><circle cx="16" cy="21" r="1.4" fill="#38bdf8"/></svg>`;
      }
      if(id === 'catears') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M7 22 Q16 12 25 22" fill="none" stroke="#f472b6" stroke-width="2.5"/><polygon points="8,19 6,8 14,14" fill="#f472b6"/><polygon points="8.5,17 7.5,10 12.5,14" fill="#fdf2f8"/><polygon points="24,19 26,8 18,14" fill="#f472b6"/><polygon points="23.5,17 24.5,10 19.5,14" fill="#fdf2f8"/><circle cx="9" cy="20" r="2" fill="#fbbf24"/></svg>`;
      }
      if(id === 'viking') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M7 21 Q7 11 16 11 Q25 11 25 21 Z" fill="#64748b" stroke="#334155" stroke-width="1.4"/><path d="M7 16 Q3 8 5 4 Q7 10 9 14 Z" fill="#fde047" stroke="#ca8a04" stroke-width="1.2"/><path d="M25 16 Q29 8 27 4 Q25 10 23 14 Z" fill="#fde047" stroke="#ca8a04" stroke-width="1.2"/><rect x="6" y="19" width="20" height="4" rx="1.5" fill="#475569"/></svg>`;
      }
      if(id === 'astronaut') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="12" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.6"/><ellipse cx="16" cy="16" rx="8" ry="6.5" fill="#f59e0b" stroke="#d97706" stroke-width="1.2"/><path d="M12 13 Q16 10 20 13" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/></svg>`;
      }
      if(id === 'ninja') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><rect x="4" y="13" width="24" height="6" rx="2" fill="#dc2626"/><circle cx="16" cy="16" r="2.8" fill="#ffffff" stroke="#b91c1c" stroke-width="0.8"/><path d="M26 15 L31 11 M26 17 L30 22" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/></svg>`;
      }
      if(id === 'witch') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><ellipse cx="16" cy="24" rx="14" ry="3.5" fill="#4c1d95"/><path d="M7 23 L16 4 L25 23 Z" fill="#581c87"/><rect x="8" y="20" width="16" height="3" fill="#f59e0b"/><rect x="14" y="19" width="4" height="5" rx="1" fill="none" stroke="#fef08a" stroke-width="1.4"/></svg>`;
      }
      if(id === 'bunny') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><ellipse cx="11" cy="12" rx="4" ry="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2"/><ellipse cx="11" cy="12" rx="2" ry="7" fill="#fbcfe8"/><ellipse cx="21" cy="12" rx="4" ry="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2"/><ellipse cx="21" cy="12" rx="2" ry="7" fill="#fbcfe8"/><rect x="8" y="21" width="16" height="3" rx="1.5" fill="#f472b6"/></svg>`;
      }
      if(id === 'straw_hat') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><ellipse cx="16" cy="22" rx="14" ry="4.5" fill="#facc15" stroke="#ca8a04" stroke-width="1.2"/><path d="M9 21 Q10 10 16 10 Q22 10 23 21 Z" fill="#eab308"/><rect x="9.5" y="18" width="13" height="3" fill="#dc2626"/><ellipse cx="16" cy="10.5" rx="5" ry="1.5" fill="#fde047"/></svg>`;
      }
      if(id === 'shinobi_plate') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><rect x="3" y="12" width="26" height="8" rx="2" fill="#1e3a8a"/><rect x="8" y="13" width="16" height="6" rx="1.5" fill="#cbd5e1" stroke="#64748b" stroke-width="0.8"/><circle cx="16" cy="16" r="1.5" fill="#0f172a"/><circle cx="10" cy="16" r="0.6" fill="#475569"/><circle cx="22" cy="16" r="0.6" fill="#475569"/></svg>`;
      }
      if(id === 'tanjiro_earrings') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><rect x="10" y="6" width="12" height="20" rx="1" fill="#ffffff" stroke="#991b1b" stroke-width="1.2"/><circle cx="16" cy="12" r="3.5" fill="#dc2626"/><path d="M12 21 L16 17 L20 21" stroke="#0f172a" stroke-width="1.2" fill="none"/><line x1="16" y1="2" x2="16" y2="6" stroke="#94a3b8" stroke-width="1.4"/></svg>`;
      }
      if(id === 'gojo_blindfold') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M6 22 L8 8 L12 14 L16 4 L20 14 L24 8 L26 22 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/><rect x="4" y="16" width="24" height="7" rx="2" fill="#0f172a"/><circle cx="16" cy="19.5" r="2" fill="#38bdf8"/></svg>`;
      }
      if(id === 'saiyan_hair') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M4 24 L5 8 L10 16 L16 2 L22 16 L27 8 L28 24 Z" fill="#facc15" stroke="#ca8a04" stroke-width="1.4"/><path d="M8 22 L10 12 L13 18 L16 6 L19 18 L22 12 L24 22 Z" fill="#fef08a"/></svg>`;
      }
      if(id === 'hokage_hat') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><polygon points="16,4 4,24 28,24" fill="#dc2626"/><polygon points="16,6 7,24 25,24" fill="#ffffff"/><circle cx="16" cy="17" r="3" fill="#16a34a"/></svg>`;
      }
      if(id === 'chopper_hat') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M6 16 L4 8 L7 10 M26 16 L28 8 L25 10" stroke="#78350f" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="16" cy="18" rx="11" ry="8" fill="#f472b6"/><rect x="14.5" y="14" width="3" height="8" fill="#ffffff"/><rect x="12" y="16.5" width="8" height="3" fill="#ffffff"/></svg>`;
      }
    }

    if(cat === 'outfit') {
      if(id === 'none') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="11" fill="none" stroke="#94a3b8" stroke-width="2.5"/><line x1="8" y1="8" x2="24" y2="24" stroke="#94a3b8" stroke-width="2.5"/></svg>`;
      }
      if(id === 'cape') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M12 6 Q16 4 20 6 Q28 16 26 27 Q18 24 14 27 Q8 16 12 6 Z" fill="#dc2626" stroke="#fbbf24" stroke-width="1.4"/><circle cx="16" cy="7" r="2" fill="#fbbf24"/></svg>`;
      }
      if(id === 'redtie') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><polygon points="10,6 16,9 22,6 19,4 13,4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/><polygon points="14,8 18,8 17,12 15,12" fill="#b91c1c"/><polygon points="15,12 17,12 19,23 16,28 13,23" fill="#dc2626"/><line x1="14" y1="17" x2="18" y2="17" stroke="#fbbf24" stroke-width="1.4"/></svg>`;
      }
      if(id === 'bluetie') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><polygon points="10,6 16,9 22,6 19,4 13,4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/><polygon points="14,8 18,8 17,12 15,12" fill="#1e3a8a"/><polygon points="15,12 17,12 19,23 16,28 13,23" fill="#2563eb"/><circle cx="16" cy="16" r="0.8" fill="#fff"/><circle cx="16" cy="20" r="0.8" fill="#fff"/></svg>`;
      }
      if(id === 'bowtie') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><polygon points="8,10 16,14 8,18" fill="#dc2626"/><polygon points="24,10 16,14 24,18" fill="#dc2626"/><rect x="14.5" y="12" width="3" height="4" rx="1" fill="#fbbf24"/></svg>`;
      }
      if(id === 'goldchain') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M8 8 Q16 16 24 8" fill="none" stroke="#fbbf24" stroke-width="2.5"/><circle cx="16" cy="18" r="6" fill="#f59e0b" stroke="#fbbf24" stroke-width="1.5"/><text x="16" y="21" font-size="8" font-weight="900" text-anchor="middle" fill="#78350f">$</text></svg>`;
      }
      if(id === 'scarf') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><rect x="8" y="10" width="16" height="6" rx="3" fill="#ea580c"/><path d="M12 14 L10 26 L14 26 L16 14 Z" fill="#c2410c"/><line x1="8" y1="13" x2="24" y2="13" stroke="#fde047" stroke-width="1.8"/></svg>`;
      }
      if(id === 'badge') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><polygon points="16,6 18.5,12 25,12.5 20,17 21.5,23.5 16,20 10.5,23.5 12,17 7,12.5 13.5,12" fill="#fbbf24" stroke="#d97706" stroke-width="1.2"/><circle cx="16" cy="15" r="2.5" fill="#78350f"/></svg>`;
      }
      if(id === 'princessdress') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M12 8 L20 8 L24 26 L8 26 Z" fill="#f472b6"/><path d="M10 18 Q16 14 22 18 L24 26 L8 26 Z" fill="#fbcfe8"/><circle cx="16" cy="8" r="2.5" fill="#e11d48"/></svg>`;
      }
      if(id === 'kimono') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M10 6 L22 6 L25 26 L7 26 Z" fill="#fda4af"/><path d="M10 6 L16 14 L22 6" fill="none" stroke="#fff" stroke-width="1.8"/><rect x="8" y="14" width="16" height="5" fill="#9d174d"/><rect x="8" y="15.5" width="16" height="1.8" fill="#fbbf24"/></svg>`;
      }
      if(id === 'fairy') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M16 16 Q8 6 4 12 Q4 20 16 18 Z" fill="rgba(110,231,183,0.75)"/><path d="M16 16 Q24 6 28 12 Q28 20 16 18 Z" fill="rgba(192,132,252,0.75)"/><polygon points="16,12 18,16 16,20 14,16" fill="#10b981"/></svg>`;
      }
      if(id === 'ballerina') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M12 6 L20 6 L19 14 L13 14 Z" fill="#f472b6"/><ellipse cx="16" cy="18" rx="11" ry="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/><ellipse cx="16" cy="17" rx="8" ry="3" fill="#fce7f3"/></svg>`;
      }
      if(id === 'sailor') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M10 6 L22 6 L24 24 L8 24 Z" fill="#1e3a8a"/><polygon points="12,6 20,6 16,15" fill="#ffffff"/><polygon points="14,14 18,14 16,19" fill="#dc2626"/></svg>`;
      }
      if(id === 'ninja_suit') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><rect x="6" y="8" width="20" height="8" rx="3" fill="#18181b"/><path d="M10 14 L5 27 L9 27 L13 14 Z" fill="#27272a"/><polygon points="22,12 25,18 20,16 26,22 18,20 22,26" fill="#94a3b8"/></svg>`;
      }
      if(id === 'cyber_armor') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M8 8 L24 8 L22 25 L10 25 Z" fill="#334155" stroke="#0284c7" stroke-width="1.5"/><circle cx="16" cy="16" r="4.5" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/><circle cx="16" cy="16" r="2" fill="#ffffff"/></svg>`;
      }
      if(id === 'hoodie') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M6 10 Q16 4 26 10 L24 26 L8 26 Z" fill="#475569"/><path d="M12 12 Q16 8 20 12 L18 22 L14 22 Z" fill="#64748b"/><line x1="14" y1="14" x2="13" y2="20" stroke="#cbd5e1" stroke-width="1.2"/><line x1="18" y1="14" x2="19" y2="20" stroke="#cbd5e1" stroke-width="1.2"/></svg>`;
      }
      if(id === 'angel_wings') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M16 16 Q8 4 3 10 Q3 22 16 20 Z" fill="#f8fafc" stroke="#fbbf24" stroke-width="1.2"/><path d="M16 16 Q24 4 29 10 Q29 22 16 20 Z" fill="#f8fafc" stroke="#fbbf24" stroke-width="1.2"/><circle cx="16" cy="16" r="2.5" fill="#fde047"/></svg>`;
      }
      if(id === 'royal_robe') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M8 6 L24 6 L26 26 L6 26 Z" fill="#991b1b"/><rect x="10" y="6" width="12" height="20" fill="#f8fafc"/><circle cx="16" cy="10" r="1" fill="#000"/><circle cx="16" cy="16" r="1" fill="#000"/><circle cx="16" cy="22" r="1" fill="#000"/><rect x="7" y="6" width="18" height="4" rx="2" fill="#fbbf24"/></svg>`;
      }
      if(id === 'akatsuki_cloak') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M8 6 L24 6 L27 26 L5 26 Z" fill="#0f172a"/><path d="M12 6 L16 12 L20 6" stroke="#dc2626" stroke-width="1.8" fill="none"/><path d="M12 18 Q16 13 20 18 Q23 18 22 21 Q19 23 14 21 Z" fill="#dc2626" stroke="#ffffff" stroke-width="0.8"/></svg>`;
      }
      if(id === 'tanjiro_haori') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><rect x="5" y="6" width="22" height="20" rx="3" fill="#15803d"/><rect x="5" y="6" width="6" height="6" fill="#0f172a"/><rect x="16" y="6" width="6" height="6" fill="#0f172a"/><rect x="10.5" y="12" width="6" height="6" fill="#0f172a"/><rect x="21.5" y="12" width="5.5" height="6" fill="#0f172a"/><rect x="5" y="18" width="6" height="6" fill="#0f172a"/><rect x="16" y="18" width="6" height="6" fill="#0f172a"/><path d="M11 6 L16 14 L21 6" stroke="#ffffff" stroke-width="1.6" fill="none"/></svg>`;
      }
      if(id === 'scout_cape') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><path d="M8 6 Q16 4 24 6 L27 26 Q16 23 5 26 Z" fill="#166534"/><path d="M13 13 L19 13 L18 18 L16 20 L14 18 Z" fill="#2563eb" stroke="#ffffff" stroke-width="0.8"/><circle cx="16" cy="8" r="2" fill="#fbbf24"/></svg>`;
      }
      if(id === 'goku_gi') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><rect x="6" y="6" width="20" height="20" rx="3" fill="#ea580c"/><polygon points="12,6 20,6 16,14" fill="#1d4ed8"/><rect x="6" y="18" width="20" height="3" fill="#1d4ed8"/><circle cx="12" cy="13" r="3.5" fill="#ffffff" stroke="#0f172a" stroke-width="0.8"/></svg>`;
      }
      if(id === 'luffy_vest') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><rect x="6" y="6" width="20" height="20" rx="3" fill="#fed7aa"/><path d="M6 6 L12 6 L10 26 L6 26 Z" fill="#ef4444"/><path d="M26 6 L20 6 L22 26 L26 26 Z" fill="#ef4444"/><rect x="6" y="18" width="20" height="3.5" fill="#facc15"/></svg>`;
      }
      if(id === 'jujutsu_coat') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><rect x="6" y="6" width="20" height="20" rx="3" fill="#0f172a"/><path d="M12 6 L16 11 L20 6" stroke="#38bdf8" stroke-width="1.2" fill="none"/><circle cx="16" cy="15" r="2" fill="#fbbf24"/></svg>`;
      }
    }

    if(cat === 'pipe') {
      if(id === 'katana_torii') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><rect x="4" y="6" width="24" height="4" rx="1" fill="#dc2626"/><rect x="8" y="10" width="5" height="18" fill="#b91c1c"/><rect x="19" y="10" width="5" height="18" fill="#b91c1c"/><line x1="8" y1="26" x2="24" y2="10" stroke="#cbd5e1" stroke-width="2"/><circle cx="16" cy="18" r="2" fill="#fbbf24"/></svg>`;
      }
      if(id === 'bamboo_demon') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><rect x="10" y="4" width="12" height="24" rx="4" fill="#16a34a"/><line x1="10" y1="12" x2="22" y2="12" stroke="#15803d" stroke-width="2"/><line x1="10" y1="20" x2="22" y2="20" stroke="#15803d" stroke-width="2"/><path d="M8 15 L24 15" stroke="#dc2626" stroke-width="2.5"/></svg>`;
      }
      if(id === 'chakra_scroll') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><rect x="10" y="4" width="12" height="24" rx="2" fill="#fef3c7" stroke="#78350f" stroke-width="1.2"/><rect x="7" y="2" width="18" height="4" rx="2" fill="#78350f"/><rect x="7" y="26" width="18" height="4" rx="2" fill="#78350f"/><circle cx="16" cy="16" r="3" fill="#dc2626"/></svg>`;
      }
      return `<svg viewBox="0 0 32 32" class="shop-item-svg"><rect x="10" y="12" width="12" height="16" rx="2" fill="${item.body}" stroke="${item.edge||'#000'}" stroke-width="1.2"/><rect x="8" y="6" width="16" height="7" rx="2" fill="${item.cap||item.body}" stroke="${item.edge||'#000'}" stroke-width="1.2"/><line x1="12" y1="6" x2="12" y2="28" stroke="rgba(255,255,255,0.4)" stroke-width="1.6"/></svg>`;
    }

    if(cat === 'background') {
      if(id === 'hidden_leaf') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><rect x="3" y="3" width="26" height="26" rx="6" fill="#f97316"/><polygon points="3,20 10,14 18,17 24,12 29,20 29,29 3,29" fill="#78350f"/><circle cx="23" cy="8" r="3" fill="#fef08a"/></svg>`;
      }
      if(id === 'wano_sakura') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><rect x="3" y="3" width="26" height="26" rx="6" fill="#fda4af"/><polygon points="6,24 16,10 26,24" fill="#64748b"/><polygon points="12,16 16,10 20,16" fill="#ffffff"/><circle cx="8" cy="8" r="2" fill="#f43f5e"/><circle cx="24" cy="12" r="1.5" fill="#f43f5e"/></svg>`;
      }
      if(id === 'namek_green') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><rect x="3" y="3" width="26" height="26" rx="6" fill="#15803d"/><path d="M3 20 Q16 15 29 20 L29 29 L3 29 Z" fill="#047857"/><circle cx="10" cy="8" r="3" fill="#a7f3d0"/><circle cx="23" cy="11" r="2.5" fill="#6ee7b7"/></svg>`;
      }
      return `<svg viewBox="0 0 32 32" class="shop-item-svg"><rect x="3" y="3" width="26" height="26" rx="6" fill="${item.top}"/><path d="M3 20 Q16 12 29 20 L29 29 L3 29 Z" fill="${item.hill||item.bottom}"/><circle cx="21" cy="9" r="3" fill="#fef08a"/></svg>`;
    }

    if(cat === 'music') {
      if(id === 'gurenge') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="12" fill="#dc2626"/><circle cx="16" cy="16" r="4.5" fill="#0f172a"/><circle cx="16" cy="16" r="1.5" fill="#facc15"/><path d="M12 20 L20 12 M18 10 L22 14" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/></svg>`;
      }
      if(id === 'blue_bird') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="12" fill="#0284c7"/><circle cx="16" cy="16" r="4.5" fill="#0f172a"/><circle cx="16" cy="16" r="1.5" fill="#ffffff"/><path d="M10 16 Q16 10 22 13 Q18 18 10 16 Z" fill="#38bdf8"/></svg>`;
      }
      if(id === 'we_are') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="12" fill="#eab308"/><circle cx="16" cy="16" r="4.5" fill="#0f172a"/><circle cx="16" cy="16" r="1.5" fill="#ffffff"/><ellipse cx="16" cy="17" rx="6" ry="2" fill="#facc15"/><rect x="13" y="15" width="6" height="1.5" fill="#dc2626"/></svg>`;
      }
      if(id === 'sparkle') {
        return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="12" fill="#7c3aed"/><circle cx="16" cy="16" r="4.5" fill="#0f172a"/><circle cx="16" cy="16" r="1.5" fill="#ffffff"/><polygon points="16,7 18,12 23,12 19,15 21,20 16,17 11,20 13,15 9,12 14,12" fill="#fef08a"/></svg>`;
      }
      return `<svg viewBox="0 0 32 32" class="shop-item-svg"><circle cx="16" cy="16" r="12" fill="${item.color||'#3b82f6'}"/><circle cx="16" cy="16" r="4.5" fill="#1e293b"/><circle cx="16" cy="16" r="1.5" fill="#ffffff"/><path d="M14 11 L20 9 L20 18 A2 2 0 1 1 18 16 L18 12 L14 13 Z" fill="#ffffff"/></svg>`;
    }

    return '';
  }

  let flippedShopCardId = null;

  function renderShop() {
    const [unlockedKey, selectedKey] = shopKeys(), catalog = shopCatalog();
    const previewClass = shopCategory === 'bird' ? '' :
      shopCategory === 'booster' ? 'booster-preview' :
      shopCategory === 'aura' ? 'aura-preview' :
      shopCategory === 'hat' ? 'hat-preview' :
      shopCategory === 'outfit' ? 'outfit-preview' :
      shopCategory === 'pipe' ? 'pipe-preview' :
      shopCategory === 'background' ? 'bg-preview' : 'music-preview';

    el.shopTabs.querySelectorAll('[data-shop-category]').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.shopCategory === shopCategory);
    });

    el.skinList.innerHTML = Object.entries(catalog).map(([id, item]) => {
      const unlocked = progress[unlockedKey].includes(id);
      const selected = progress[selectedKey] === id;
      const isPreviewing = previewLoadout[shopCategory] === id;
      const isPlayingPreview = shopCategory === 'music' && audio.previewTrackId === id;
      const rarity = item.rarity || 'common';
      const body = item.body || item.top || item.color || '#e2e8f0';
      const wing = item.wing || item.bottom || item.color || '#94a3b8';
      const cap = item.cap || body, edge = item.edge || wing, top = item.top || body, bottom = item.bottom || wing, color = item.color || body;
      const iconSvg = getShopItemSvg(shopCategory, id, item);
      const desc = item.desc || '';

      const t = i18n[settings.language || 'id'] || i18n.id;
      let actionHtml = '';
      if(selected) {
        actionHtml = `<span class="skin-cost equipped">${t.equipped}</span>`;
      } else if(unlocked || item.cost === 0) {
        actionHtml = `<button class="skin-cost-btn use-btn" data-action="use" data-product="${id}" type="button">${t.equip}</button>`;
      } else {
        const canAfford = progress.coins >= item.cost;
        actionHtml = `<button class="skin-cost-btn buy-btn ${canAfford ? '' : 'cant-afford'}" data-action="buy" data-product="${id}" type="button"><svg viewBox="0 0 16 16" width="12" height="12" class="mini-coin-svg"><circle cx="8" cy="8" r="6.5" fill="#fbbf24" stroke="#d97706" stroke-width="1.2"/><text x="8" y="11" text-anchor="middle" font-size="8" font-weight="900" fill="#92400e">$</text></svg> ${t.buy} ${item.cost}</button>`;
      }

      // Exclamation Mark Logo Button - ONLY on items with descriptions/skills
      const hasDesc = !!(desc && desc.trim().length > 0);
      const exclamationBtnHtml = hasDesc ? `<button type="button" class="card-exclamation-btn" title="Detail Efek & Kemampuan" data-card-flip-btn="${id}">
        <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/>
        </svg>
      </button>` : '';

      const isCardFlipped = (flippedShopCardId === id);
      return `<div class="skin-card-wrap ${isCardFlipped ? 'flipped' : ''}" data-card-product="${id}">` +
        `<div class="skin-card-inner">` +
        `  <!-- FRONT FACE: Clean, symmetrical, handcrafted -->` +
        `  <div class="skin-card skin-card-front rarity-${rarity} ${selected ? 'selected ' : ''}${isPreviewing ? 'previewing ' : ''}${isPlayingPreview ? 'playing-preview ' : ''}${unlocked ? '' : 'locked'}" style="--body:${body};--wing:${wing};--beak:${item.beak||body};--cap:${cap};--edge:${edge};--top:${top};--bottom:${bottom};--color:${color}">` +
        `    <span class="rarity-badge rarity-${rarity}">${rarity.toUpperCase()}</span>` +
        exclamationBtnHtml +
        `    <span class="skin-preview ${previewClass}">${iconSvg}</span>` +
        `    <span class="skin-name" title="${item.name}">${item.name}</span>` +
        actionHtml +
        `  </div>` +
        `  <!-- BACK FACE: Authentic RPG-Style Card Back (Only for flip) -->` +
        `  <div class="skin-card-back rarity-${rarity}">` +
        `    <div class="card-back-header">` +
        `      <div class="card-back-title" title="${item.name}">${item.name}</div>` +
        `      <button type="button" class="card-back-close-btn" title="Tutup Detail" data-card-flip-close="${id}">` +
        `        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">` +
        `          <path d="M18 6L6 18M6 6l12 12"/>` +
        `        </svg>` +
        `      </button>` +
        `    </div>` +
        `    <div class="card-back-badge">KEMAMPUAN / EFEK</div>` +
        `    <div class="card-back-desc-box">` +
        `      <p class="card-back-desc-text">${desc || 'Item kosmetik eksklusif Feather Rush.'}</p>` +
        `    </div>` +
        `    <div class="card-back-flip-hint">KLIK KARTU UNTUK KEMBALI</div>` +
        `  </div>` +
        `</div>` +
        `</div>`;
    }).join('');

    // Klik Kartu Depan -> Preview item & update live description banner
    el.skinList.querySelectorAll('.skin-card-wrap').forEach(wrap => {
      const front = wrap.querySelector('.skin-card-front');
      const exBtn = wrap.querySelector('.card-exclamation-btn');
      const closeBtn = wrap.querySelector('.card-back-close-btn');
      const back = wrap.querySelector('.skin-card-back');

      if(front) {
        front.onclick = (e) => {
          if(e.target.closest('.skin-cost-btn') || e.target.closest('.card-exclamation-btn')) return;
          previewProduct(wrap.dataset.cardProduct);
        };
      }

      // Flip ke belakang saat klik tanda seru
      if(exBtn) {
        exBtn.onclick = (e) => {
          e.stopPropagation();
          e.preventDefault();
          audio.click();
          const cardId = wrap.dataset.cardProduct;
          if (wrap.classList.contains('flipped')) {
            flippedShopCardId = null;
            wrap.classList.remove('flipped');
          } else {
            flippedShopCardId = cardId;
            el.skinList.querySelectorAll('.skin-card-wrap.flipped').forEach(w => {
              w.classList.remove('flipped');
            });
            wrap.classList.add('flipped');
            
            // Update live banner without wiping DOM with renderShop
            const item = catalog[cardId];
            if(item) {
              const bTitle = $('shopItemBannerTitle');
              const bDesc = $('shopItemBannerDesc');
              if(bTitle) bTitle.textContent = item.name;
              if(bDesc) {
                bDesc.textContent = item.desc ? item.desc : 'Item kosmetik eksklusif Feather Rush.';
                bDesc.style.color = item.desc ? '#fef08a' : '#94a3b8';
              }
            }
          }
        };
      }

      // Flip kembali ke depan
      const flipBack = (e) => {
        e.stopPropagation();
        e.preventDefault();
        audio.click();
        flippedShopCardId = null;
        wrap.classList.remove('flipped');
      };

      if(closeBtn) closeBtn.onclick = flipBack;
      if(back) back.onclick = flipBack;
    });

    // Tombol Aksi: BUY atau EQUIP
    el.skinList.querySelectorAll('.skin-cost-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const id = btn.dataset.product;
        if(action === 'use') {
          equipProduct(id);
        } else if(action === 'buy') {
          buyProduct(id);
        }
      };
    });
  }

  // Preview Loadout di Showcase Stage
  function previewProduct(id) {
    const item = shopCatalog()[id];
    if(!item) return;
    previewLoadout[shopCategory] = id;
    updateShowcaseLabel();

    // Update Live Shop Item Banner
    const bTitle = $('shopItemBannerTitle');
    const bDesc = $('shopItemBannerDesc');
    if(bTitle) bTitle.textContent = item.name;
    if(bDesc) {
      bDesc.textContent = item.desc ? item.desc : 'Item kosmetik eksklusif Feather Rush.';
      bDesc.style.color = item.desc ? '#fef08a' : '#94a3b8';
    }

    if(shopCategory === 'music') {
      audio.previewMusic(id);
    } else if(shopCategory === 'pet' && id !== 'none') {
      audio.babyChirp();
    } else if(shopCategory === 'booster' && id !== 'none') {
      audio.powerup(id);
    } else if(shopCategory === 'bird') {
      audio.birdChirp(id);
    } else {
      audio.click();
    }
    renderShop();
  }

  // Pakai Item yang Sudah Dimiliki
  function equipProduct(id) {
    const [unlockedKey, selectedKey] = shopKeys(), item = shopCatalog()[id];
    if(!item) return;

    if(!progress[unlockedKey].includes(id)) {
      if(item.cost === 0) {
        progress[unlockedKey].push(id);
      } else {
        return;
      }
    }

    progress[selectedKey] = id;
    previewLoadout[shopCategory] = id;
    updateShowcaseLabel();
    audio.click();
    persistProgress();
    if(shopCategory === 'pet') applyPetSkin();
    renderShop();
    if(typeof saveCloudSave === 'function') saveCloudSave();

    if(shopCategory === 'music' && state === State.PLAYING) {
      audio.stopMusic();
      audio.music();
    }
  }

  // Beli Item Baru dengan Konfirmasi Tombol BUY
  function buyProduct(id) {
    const [unlockedKey, selectedKey] = shopKeys(), item = shopCatalog()[id];
    if(!item) return;
    previewLoadout[shopCategory] = id;
    updateShowcaseLabel();

    if(progress[unlockedKey].includes(id)) {
      equipProduct(id);
      return;
    }

    if(item.cost === 0 || progress.coins >= item.cost) {
      if(item.cost > 0) progress.coins -= item.cost;
      progress[unlockedKey].push(id);
      progress[selectedKey] = id;
      audio.win();
      makeParticles(180, 100, 24, '#fbbf24');
      persistProgress();
      if(shopCategory === 'pet') applyPetSkin();
      updateCoins();
      renderShop();
      if(typeof saveCloudSave === 'function') saveCloudSave();

      if(shopCategory === 'music' && state === State.PLAYING) {
        audio.stopMusic();
        audio.music();
      }
    } else {
      audio.hit();
      // Efek getar pada saldo koin saat koin tidak mencukupi
      if(el.shopCoins && el.shopCoins.parentElement) {
        el.shopCoins.parentElement.classList.remove('coin-shake');
        void el.shopCoins.parentElement.offsetWidth;
        el.shopCoins.parentElement.classList.add('coin-shake');
      }
    }
  }

  // ==========================================
  // GOOGLE SIGN-IN & RANKED LEADERBOARD AUTH
  // ==========================================
  const cuteAvatarsCatalog = [
    {
      id: 'chick_yellow',
      name: 'PIPI CHICK',
      color: '#fef08a',
      bg: 'linear-gradient(135deg, #fef08a 0%, #facc15 100%)',
      render: (size = 48) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" style="display:block">
        <defs>
          <linearGradient id="g_chick" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fffbeb"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient>
          <linearGradient id="g_beak" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#fb923c"/><stop offset="100%" stop-color="#ea580c"/></linearGradient>
        </defs>
        <circle cx="24" cy="24" r="23" fill="#fef9c3"/>
        <circle cx="21" cy="7" r="4.5" fill="#f87171"/>
        <circle cx="27" cy="8" r="4" fill="#ef4444"/>
        <circle cx="24" cy="26" r="17.5" fill="url(#g_chick)"/>
        <!-- Soft rosy cheeks -->
        <ellipse cx="11.5" cy="28.5" rx="3.8" ry="2.2" fill="#fb7185" opacity="0.8"/>
        <ellipse cx="36.5" cy="28.5" rx="3.8" ry="2.2" fill="#fb7185" opacity="0.8"/>
        <!-- Sparkling Kawaii Eyes -->
        <ellipse cx="16.5" cy="23" rx="3.6" ry="4.4" fill="#0f172a"/>
        <circle cx="17.8" cy="21.2" r="1.6" fill="#ffffff"/>
        <circle cx="15.2" cy="24.8" r="0.8" fill="#ffffff"/>
        <ellipse cx="31.5" cy="23" rx="3.6" ry="4.4" fill="#0f172a"/>
        <circle cx="32.8" cy="21.2" r="1.6" fill="#ffffff"/>
        <circle cx="30.2" cy="24.8" r="0.8" fill="#ffffff"/>
        <!-- Cute Little Orange Beak -->
        <path d="M 21 26.5 Q 24 23 27 26.5 Q 24 31 21 26.5 Z" fill="url(#g_beak)"/>
        <!-- Tiny Flapping Wing -->
        <ellipse cx="8" cy="27" rx="3" ry="4.5" fill="#fbbf24" transform="rotate(-15 8 27)"/>
        <ellipse cx="40" cy="27" rx="3" ry="4.5" fill="#fbbf24" transform="rotate(15 40 27)"/>
      </svg>`
    },
    {
      id: 'pink_sakura',
      name: 'SAKURA BIRD',
      color: '#f472b6',
      bg: 'linear-gradient(135deg, #fbcfe8 0%, #f472b6 100%)',
      render: (size = 48) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" style="display:block">
        <defs>
          <linearGradient id="g_sakura" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fdf2f8"/><stop offset="100%" stop-color="#f472b6"/></linearGradient>
        </defs>
        <circle cx="24" cy="24" r="23" fill="#fce7f3"/>
        <!-- Cherry Blossom Flower in Hair -->
        <circle cx="12" cy="11" r="3.6" fill="#ffffff"/>
        <circle cx="9" cy="14.5" r="3.6" fill="#ffffff"/>
        <circle cx="15.5" cy="14.5" r="3.6" fill="#ffffff"/>
        <circle cx="12" cy="17.5" r="3.6" fill="#ffffff"/>
        <circle cx="12" cy="14.5" r="2.4" fill="#fbbf24"/>
        <circle cx="24" cy="26" r="17.5" fill="url(#g_sakura)"/>
        <!-- Kawaii Eyelashes & Sparkling Eyes -->
        <path d="M 12.5 19.5 Q 16.5 17 20.5 19.5" fill="none" stroke="#831843" stroke-width="1.2" stroke-linecap="round"/>
        <ellipse cx="16.5" cy="23.5" rx="3.6" ry="4.2" fill="#831843"/>
        <circle cx="17.8" cy="21.8" r="1.6" fill="#ffffff"/>
        <circle cx="15.2" cy="25" r="0.8" fill="#ffffff"/>
        <path d="M 27.5 19.5 Q 31.5 17 35.5 19.5" fill="none" stroke="#831843" stroke-width="1.2" stroke-linecap="round"/>
        <ellipse cx="31.5" cy="23.5" rx="3.6" ry="4.2" fill="#831843"/>
        <circle cx="32.8" cy="21.8" r="1.6" fill="#ffffff"/>
        <circle cx="30.2" cy="25" r="0.8" fill="#ffffff"/>
        <!-- Rosy Blush Cheeks -->
        <ellipse cx="11" cy="29" rx="3.8" ry="2.2" fill="#fb7185" opacity="0.85"/>
        <ellipse cx="37" cy="29" rx="3.8" ry="2.2" fill="#fb7185" opacity="0.85"/>
        <polygon points="24,25 21,29.5 27,29.5" fill="#f97316"/>
        <path d="M 21.5 32 Q 24 34.5 26.5 32" fill="none" stroke="#be185d" stroke-width="1.2" stroke-linecap="round"/>
      </svg>`
    },
    {
      id: 'penguin_tux',
      name: 'POM PENGUIN',
      color: '#38bdf8',
      bg: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
      render: (size = 48) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" style="display:block">
        <circle cx="24" cy="24" r="23" fill="#e0f2fe"/>
        <circle cx="24" cy="26" r="17.5" fill="#1e293b"/>
        <!-- Chibi White Belly -->
        <ellipse cx="24" cy="29" rx="12.5" ry="14" fill="#ffffff"/>
        <!-- Warm Knitted Earmuffs -->
        <path d="M 8 20 A 16 16 0 0 1 40 20" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
        <circle cx="8" cy="22" r="5" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
        <circle cx="40" cy="22" r="5" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
        <!-- Super Cute Black Button Eyes -->
        <ellipse cx="17.5" cy="23.5" rx="3.4" ry="4" fill="#0f172a"/>
        <circle cx="18.6" cy="22" r="1.5" fill="#ffffff"/>
        <circle cx="16.4" cy="24.8" r="0.7" fill="#ffffff"/>
        <ellipse cx="30.5" cy="23.5" rx="3.4" ry="4" fill="#0f172a"/>
        <circle cx="31.6" cy="22" r="1.5" fill="#ffffff"/>
        <circle cx="29.4" cy="24.8" r="0.7" fill="#ffffff"/>
        <!-- Blushing Cheeks -->
        <circle cx="13" cy="28.5" r="2.8" fill="#fb7185" opacity="0.65"/>
        <circle cx="35" cy="28.5" r="2.8" fill="#fb7185" opacity="0.65"/>
        <polygon points="24,25.5 20.5,30 27.5,30" fill="#f97316"/>
        <!-- Tiny Red Bowtie -->
        <polygon points="21,34 27,34 24,36" fill="#ef4444"/>
        <circle cx="24" cy="34" r="1.3" fill="#fca5a5"/>
      </svg>`
    },
    {
      id: 'panda_bamboo',
      name: 'PANDA FLAP',
      color: '#10b981',
      bg: 'linear-gradient(135deg, #a7f3d0 0%, #10b981 100%)',
      render: (size = 48) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" style="display:block">
        <circle cx="24" cy="24" r="23" fill="#d1fae5"/>
        <!-- Fluffy Black Ears -->
        <circle cx="10" cy="11" r="6" fill="#1e293b"/>
        <circle cx="10" cy="11" r="3.2" fill="#475569"/>
        <circle cx="38" cy="11" r="6" fill="#1e293b"/>
        <circle cx="38" cy="11" r="3.2" fill="#475569"/>
        <circle cx="24" cy="26" r="17.5" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2"/>
        <!-- Chibi Teardrop Eye Patches -->
        <ellipse cx="16" cy="23.5" rx="5.2" ry="4.5" fill="#1e293b" transform="rotate(-15 16 23.5)"/>
        <ellipse cx="32" cy="23.5" rx="5.2" ry="4.5" fill="#1e293b" transform="rotate(15 32 23.5)"/>
        <!-- Big Twinkling Panda Eyes -->
        <circle cx="16.5" cy="23" r="2.4" fill="#ffffff"/>
        <circle cx="15.5" cy="24.8" r="1" fill="#ffffff"/>
        <circle cx="31.5" cy="23" r="2.4" fill="#ffffff"/>
        <circle cx="30.5" cy="24.8" r="1" fill="#ffffff"/>
        <!-- Cheeks & Little Nose -->
        <ellipse cx="10.5" cy="29.5" rx="3.5" ry="2" fill="#fca5a5" opacity="0.8"/>
        <ellipse cx="37.5" cy="29.5" rx="3.5" ry="2" fill="#fca5a5" opacity="0.8"/>
        <polygon points="24,26.5 21.5,30.5 26.5,30.5" fill="#f97316"/>
        <path d="M 22 32.5 Q 24 34.5 26 32.5" fill="none" stroke="#334155" stroke-width="1.2" stroke-linecap="round"/>
        <!-- Bamboo Leaf in Mouth -->
        <path d="M 27 31 Q 34 30 38 27 Q 34 33 27 32 Z" fill="#22c55e"/>
      </svg>`
    },
    {
      id: 'cat_neko',
      name: 'NEKO KITTY',
      color: '#fb923c',
      bg: 'linear-gradient(135deg, #ffedd5 0%, #fb923c 100%)',
      render: (size = 48) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" style="display:block">
        <circle cx="24" cy="24" r="23" fill="#ffedd5"/>
        <!-- Pointy Cat Ears -->
        <polygon points="7,19 13,6 21,14" fill="#f97316"/>
        <polygon points="9,18 13,9 19,14" fill="#fecdd3"/>
        <polygon points="41,19 35,6 27,14" fill="#f97316"/>
        <polygon points="39,18 35,9 29,14" fill="#fecdd3"/>
        <circle cx="24" cy="26" r="17.5" fill="#fed7aa"/>
        <!-- Big Round Anime Eyes -->
        <ellipse cx="16.5" cy="23.5" rx="3.6" ry="4.4" fill="#0f172a"/>
        <circle cx="17.8" cy="21.8" r="1.6" fill="#ffffff"/>
        <circle cx="15.2" cy="25" r="0.8" fill="#ffffff"/>
        <ellipse cx="31.5" cy="23.5" rx="3.6" ry="4.4" fill="#0f172a"/>
        <circle cx="32.8" cy="21.8" r="1.6" fill="#ffffff"/>
        <circle cx="30.2" cy="25" r="0.8" fill="#ffffff"/>
        <!-- Rosy Blush & Whiskers -->
        <ellipse cx="11" cy="29" rx="3.5" ry="2" fill="#fb7185" opacity="0.8"/>
        <ellipse cx="37" cy="29" rx="3.5" ry="2" fill="#fb7185" opacity="0.8"/>
        <line x1="5" y1="26" x2="12" y2="27" stroke="#ea580c" stroke-width="1.4" stroke-linecap="round"/>
        <line x1="5" y1="30" x2="12" y2="29" stroke="#ea580c" stroke-width="1.4" stroke-linecap="round"/>
        <line x1="43" y1="26" x2="36" y2="27" stroke="#ea580c" stroke-width="1.4" stroke-linecap="round"/>
        <line x1="43" y1="30" x2="36" y2="29" stroke="#ea580c" stroke-width="1.4" stroke-linecap="round"/>
        <!-- Cute :3 Cat Mouth -->
        <polygon points="24,26.5 22,29 26,29" fill="#ea580c"/>
        <path d="M 21 30 Q 22.5 32 24 30 Q 25.5 32 27 30" fill="none" stroke="#c2410c" stroke-width="1.4" stroke-linecap="round"/>
      </svg>`
    },
    {
      id: 'bunny_fluff',
      name: 'USAGI BUNNY',
      color: '#f43f5e',
      bg: 'linear-gradient(135deg, #ffe4e6 0%, #f43f5e 100%)',
      render: (size = 48) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" style="display:block">
        <circle cx="24" cy="24" r="23" fill="#fff1f2"/>
        <!-- Long Fluffy Bunny Ears -->
        <ellipse cx="15.5" cy="11" rx="4.5" ry="10.5" fill="#ffffff" stroke="#fbcfe8" stroke-width="1.2"/>
        <ellipse cx="15.5" cy="11" rx="2.5" ry="7.5" fill="#fecdd3"/>
        <ellipse cx="32.5" cy="11" rx="4.5" ry="10.5" fill="#ffffff" stroke="#fbcfe8" stroke-width="1.2"/>
        <ellipse cx="32.5" cy="11" rx="2.5" ry="7.5" fill="#fecdd3"/>
        <circle cx="24" cy="27" r="17" fill="#ffffff" stroke="#fbcfe8" stroke-width="1.2"/>
        <!-- Ruby Sparkling Eyes -->
        <ellipse cx="16.5" cy="24.5" rx="3.6" ry="4.2" fill="#be123c"/>
        <circle cx="17.8" cy="22.8" r="1.6" fill="#ffffff"/>
        <circle cx="15.2" cy="26" r="0.8" fill="#ffffff"/>
        <ellipse cx="31.5" cy="24.5" rx="3.6" ry="4.2" fill="#be123c"/>
        <circle cx="32.8" cy="22.8" r="1.6" fill="#ffffff"/>
        <circle cx="30.2" cy="26" r="0.8" fill="#ffffff"/>
        <!-- Super Sweet Blush & Mouth -->
        <ellipse cx="10.5" cy="29.5" rx="3.8" ry="2.2" fill="#fda4af" opacity="0.9"/>
        <ellipse cx="37.5" cy="29.5" rx="3.8" ry="2.2" fill="#fda4af" opacity="0.9"/>
        <polygon points="24,27 22,30.5 26,30.5" fill="#fb7185"/>
        <path d="M 21.5 32 Q 24 34.5 26.5 32" fill="none" stroke="#e11d48" stroke-width="1.2" stroke-linecap="round"/>
      </svg>`
    },
    {
      id: 'fox_kitsune',
      name: 'KITSUNE FOX',
      color: '#ea580c',
      bg: 'linear-gradient(135deg, #ffedd5 0%, #ea580c 100%)',
      render: (size = 48) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" style="display:block">
        <circle cx="24" cy="24" r="23" fill="#ffedd5"/>
        <!-- Big Fox Ears with Dark Tips -->
        <polygon points="7,16 14,4 21,15" fill="#ea580c"/>
        <polygon points="10,16 14,7 19,15" fill="#1e293b"/>
        <polygon points="41,16 34,4 27,15" fill="#ea580c"/>
        <polygon points="38,16 34,7 29,15" fill="#1e293b"/>
        <circle cx="24" cy="26" r="17.5" fill="#ea580c"/>
        <!-- White Muzzle Mask -->
        <path d="M 9 26 C 13 37 24 39 24 39 C 24 39 35 37 39 26 Z" fill="#ffffff"/>
        <!-- Golden Amber Anime Eyes -->
        <ellipse cx="16.5" cy="23.5" rx="3.4" ry="4.2" fill="#1e293b"/>
        <circle cx="17.7" cy="21.8" r="1.5" fill="#ffffff"/>
        <circle cx="15.3" cy="25" r="0.7" fill="#fde047"/>
        <ellipse cx="31.5" cy="23.5" rx="3.4" ry="4.2" fill="#1e293b"/>
        <circle cx="32.7" cy="21.8" r="1.5" fill="#ffffff"/>
        <circle cx="30.3" cy="25" r="0.7" fill="#fde047"/>
        <!-- Soft Blush & Fox Nose -->
        <ellipse cx="12" cy="29" rx="3.2" ry="1.8" fill="#fb7185" opacity="0.75"/>
        <ellipse cx="36" cy="29" rx="3.2" ry="1.8" fill="#fb7185" opacity="0.75"/>
        <polygon points="24,27 21.5,31 26.5,31" fill="#1e293b"/>
      </svg>`
    },
    {
      id: 'dragon_pyro',
      name: 'BABY DRAGON',
      color: '#22c55e',
      bg: 'linear-gradient(135deg, #bbf7d0 0%, #16a34a 100%)',
      render: (size = 48) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" style="display:block">
        <circle cx="24" cy="24" r="23" fill="#dcfce7"/>
        <!-- Golden Horns -->
        <polygon points="13,14 10,3 18,9" fill="#facc15" stroke="#ca8a04" stroke-width="1"/>
        <polygon points="35,14 38,3 30,9" fill="#facc15" stroke="#ca8a04" stroke-width="1"/>
        <circle cx="24" cy="26" r="17.5" fill="#22c55e"/>
        <!-- Flame Crest on Head -->
        <polygon points="24,4 20,11 24,9 28,11" fill="#f97316"/>
        <!-- Big Emerald Cute Eyes with Gold Glint -->
        <ellipse cx="16.5" cy="23.5" rx="3.8" ry="4.4" fill="#0f172a"/>
        <circle cx="18" cy="21.8" r="1.7" fill="#ffffff"/>
        <circle cx="15.2" cy="25" r="1" fill="#fef08a"/>
        <ellipse cx="31.5" cy="23.5" rx="3.8" ry="4.4" fill="#0f172a"/>
        <circle cx="33" cy="21.8" r="1.7" fill="#ffffff"/>
        <circle cx="30.2" cy="25" r="1" fill="#fef08a"/>
        <!-- Blush & Dragon Snout -->
        <ellipse cx="11.5" cy="29" rx="3.5" ry="2" fill="#fed7aa" opacity="0.8"/>
        <ellipse cx="36.5" cy="29" rx="3.5" ry="2" fill="#fed7aa" opacity="0.8"/>
        <polygon points="24,25.5 20,30.5 28,30.5" fill="#eab308"/>
        <circle cx="22" cy="29.5" r="0.8" fill="#713f12"/>
        <circle cx="26" cy="29.5" r="0.8" fill="#713f12"/>
      </svg>`
    },
    {
      id: 'owl_scholar',
      name: 'STARRY OWL',
      color: '#6366f1',
      bg: 'linear-gradient(135deg, #c7d2fe 0%, #4f46e5 100%)',
      render: (size = 48) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" style="display:block">
        <circle cx="24" cy="24" r="23" fill="#e0e7ff"/>
        <!-- Feather Tuft Ears -->
        <polygon points="9,14 11,5 18,12" fill="#4338ca"/>
        <polygon points="39,14 37,5 30,12" fill="#4338ca"/>
        <circle cx="24" cy="26" r="17.5" fill="#6366f1"/>
        <!-- Giant Cute Anime Eyeglasses Ring -->
        <circle cx="16.5" cy="23" r="6.8" fill="#ffffff"/>
        <ellipse cx="16.5" cy="23" rx="4.2" ry="4.8" fill="#1e1b4b"/>
        <circle cx="18" cy="21.2" r="1.7" fill="#ffffff"/>
        <circle cx="15" cy="24.8" r="0.8" fill="#38bdf8"/>
        <circle cx="31.5" cy="23" r="6.8" fill="#ffffff"/>
        <ellipse cx="31.5" cy="23" rx="4.2" ry="4.8" fill="#1e1b4b"/>
        <circle cx="33" cy="21.2" r="1.7" fill="#ffffff"/>
        <circle cx="30" cy="24.8" r="0.8" fill="#38bdf8"/>
        <!-- Cheeks & Little Beak -->
        <circle cx="10" cy="30" r="2.5" fill="#fb7185" opacity="0.6"/>
        <circle cx="38" cy="30" r="2.5" fill="#fb7185" opacity="0.6"/>
        <polygon points="24,24.5 21,30 27,30" fill="#f59e0b"/>
      </svg>`
    },
    {
      id: 'froggy_kero',
      name: 'KERO FROGGY',
      color: '#84cc16',
      bg: 'linear-gradient(135deg, #d9f99d 0%, #65a30d 100%)',
      render: (size = 48) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" style="display:block">
        <circle cx="24" cy="24" r="23" fill="#ecfccb"/>
        <!-- Big Pop-Up Frog Eyes -->
        <circle cx="14" cy="14" r="7" fill="#84cc16"/>
        <circle cx="14" cy="14" r="4.6" fill="#ffffff"/>
        <ellipse cx="14" cy="14" rx="2.8" ry="3.5" fill="#1e293b"/>
        <circle cx="15.2" cy="12.6" r="1.4" fill="#ffffff"/>
        <circle cx="34" cy="14" r="7" fill="#84cc16"/>
        <circle cx="34" cy="14" r="4.6" fill="#ffffff"/>
        <ellipse cx="34" cy="14" rx="2.8" ry="3.5" fill="#1e293b"/>
        <circle cx="35.2" cy="12.6" r="1.4" fill="#ffffff"/>
        <circle cx="24" cy="27" r="16.5" fill="#84cc16"/>
        <!-- Pink Cute Cheeks -->
        <ellipse cx="10.5" cy="29" rx="3.8" ry="2.2" fill="#f472b6" opacity="0.9"/>
        <ellipse cx="37.5" cy="29" rx="3.8" ry="2.2" fill="#f472b6" opacity="0.9"/>
        <!-- Cheerful Froggy Smile -->
        <polygon points="24,25.5 21.5,29 26.5,29" fill="#facc15"/>
        <path d="M 18 31 Q 24 36 30 31" fill="none" stroke="#365314" stroke-width="1.6" stroke-linecap="round"/>
      </svg>`
    },
    {
      id: 'astro_space',
      name: 'ASTRO KOSMO',
      color: '#38bdf8',
      bg: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
      render: (size = 48) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" style="display:block">
        <circle cx="24" cy="24" r="23" fill="#0f172a"/>
        <!-- Astronaut Helmet -->
        <circle cx="24" cy="24" r="18" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        <circle cx="24" cy="24" r="14" fill="#0284c7"/>
        <!-- Helmet Glass Reflection Flare -->
        <path d="M 13 17 A 12 12 0 0 1 31 12" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.75"/>
        <!-- Cute Little Alien Chick Peeking Inside -->
        <circle cx="24" cy="26" r="8.5" fill="#facc15"/>
        <ellipse cx="21" cy="24.5" rx="1.6" ry="2.2" fill="#0f172a"/>
        <circle cx="21.6" cy="23.8" r="0.8" fill="#ffffff"/>
        <ellipse cx="27" cy="24.5" rx="1.6" ry="2.2" fill="#0f172a"/>
        <circle cx="27.6" cy="23.8" r="0.8" fill="#ffffff"/>
        <circle cx="18" cy="26.5" r="1.5" fill="#fb7185" opacity="0.8"/>
        <circle cx="30" cy="26.5" r="1.5" fill="#fb7185" opacity="0.8"/>
        <polygon points="24,26 22,29 26,29" fill="#f97316"/>
      </svg>`
    },
    {
      id: 'robo_mecha',
      name: 'CYBER BOT',
      color: '#06b6d4',
      bg: 'linear-gradient(135deg, #164e63 0%, #0891b2 100%)',
      render: (size = 48) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" style="display:block">
        <circle cx="24" cy="24" r="23" fill="#082f49"/>
        <!-- Cute Antenna with Red Bulb -->
        <line x1="24" y1="3" x2="24" y2="10" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="24" cy="3.5" r="3" fill="#f43f5e"/>
        <circle cx="23" cy="2.5" r="1" fill="#ffffff"/>
        <!-- Chibi Mecha Chassis -->
        <rect x="7" y="10" width="34" height="30" rx="9" fill="#1e293b" stroke="#06b6d4" stroke-width="2"/>
        <!-- Visor Screen -->
        <rect x="12" y="16" width="24" height="10" rx="5" fill="#06b6d4"/>
        <!-- Cyan/White Glowing Chibi Robot Eyes -->
        <ellipse cx="17.5" cy="21" rx="2.5" ry="3.2" fill="#ffffff"/>
        <circle cx="18" cy="20" r="1" fill="#a5f3fc"/>
        <ellipse cx="30.5" cy="21" rx="2.5" ry="3.2" fill="#ffffff"/>
        <circle cx="31" cy="20" r="1" fill="#a5f3fc"/>
        <!-- Beep Boop Cheeks & Beak -->
        <circle cx="10" cy="28" r="2" fill="#f43f5e" opacity="0.8"/>
        <circle cx="38" cy="28" r="2" fill="#f43f5e" opacity="0.8"/>
        <polygon points="24,28 20,33 28,33" fill="#fbbf24"/>
      </svg>`
    },
    {
      id: 'ghost_spook',
      name: 'BOO GHOSTY',
      color: '#c084fc',
      bg: 'linear-gradient(135deg, #f3e8ff 0%, #a855f7 100%)',
      render: (size = 48) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" style="display:block">
        <circle cx="24" cy="24" r="23" fill="#f5f3ff"/>
        <!-- Floating Chibi Ghost Body -->
        <path d="M 10 26 C 10 13 38 13 38 26 C 38 38 34 42 30 38 C 26 34 22 34 18 38 C 14 42 10 38 10 26 Z" fill="#ffffff" stroke="#c084fc" stroke-width="2"/>
        <!-- Happy Curved Closed Eyes -->
        <path d="M 15 22 Q 18.5 17.5 22 22" fill="none" stroke="#6b21a8" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 26 22 Q 29.5 17.5 33 22" fill="none" stroke="#6b21a8" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Super Cute Pink Cheeks -->
        <ellipse cx="13.5" cy="26.5" rx="3.5" ry="2.2" fill="#f472b6" opacity="0.9"/>
        <ellipse cx="34.5" cy="26.5" rx="3.5" ry="2.2" fill="#f472b6" opacity="0.9"/>
        <!-- Little Surprised 'o' Mouth -->
        <ellipse cx="24" cy="26.5" rx="2.4" ry="3.4" fill="#f43f5e"/>
        <circle cx="24" cy="25" r="1" fill="#fca5a5"/>
      </svg>`
    },
    {
      id: 'king_royal',
      name: 'KING FLAPPY',
      color: '#eab308',
      bg: 'linear-gradient(135deg, #fef08a 0%, #ca8a04 100%)',
      render: (size = 48) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" style="display:block">
        <circle cx="24" cy="24" r="23" fill="#fef9c3"/>
        <!-- Golden Crown with Ruby Gemstones -->
        <polygon points="11,14 13,4 18,10 24,2 30,10 35,4 37,14" fill="#fbbf24" stroke="#d97706" stroke-width="1.2"/>
        <circle cx="24" cy="8" r="2" fill="#ef4444"/>
        <circle cx="15" cy="11" r="1.3" fill="#3b82f6"/>
        <circle cx="33" cy="11" r="1.3" fill="#3b82f6"/>
        <circle cx="24" cy="26" r="17.5" fill="#facc15"/>
        <!-- Sparkling Royal Eyes -->
        <ellipse cx="16.5" cy="24" rx="3.6" ry="4.4" fill="#1e293b"/>
        <circle cx="17.8" cy="22.2" r="1.6" fill="#ffffff"/>
        <circle cx="15.2" cy="25.5" r="0.8" fill="#ffffff"/>
        <ellipse cx="31.5" cy="24" rx="3.6" ry="4.4" fill="#1e293b"/>
        <circle cx="32.8" cy="22.2" r="1.6" fill="#ffffff"/>
        <circle cx="30.2" cy="25.5" r="0.8" fill="#ffffff"/>
        <!-- Cheeks & Royal Beak -->
        <ellipse cx="11" cy="29" rx="3.5" ry="2" fill="#fb7185" opacity="0.8"/>
        <ellipse cx="37" cy="29" rx="3.5" ry="2" fill="#fb7185" opacity="0.8"/>
        <polygon points="24,25.5 20.5,30.5 27.5,30.5" fill="#ea580c"/>
      </svg>`
    },
    {
      id: 'ninja_shadow',
      name: 'SHINOBI NINJA',
      color: '#64748b',
      bg: 'linear-gradient(135deg, #334155 0%, #0f172a 100%)',
      render: (size = 48) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" style="display:block">
        <circle cx="24" cy="24" r="23" fill="#1e293b"/>
        <circle cx="24" cy="25" r="17.5" fill="#0f172a"/>
        <!-- Red Shinobi Headband Ribbons Flowing -->
        <rect x="6" y="14" width="36" height="8" rx="3" fill="#dc2626"/>
        <polygon points="38,18 46,13 44,22" fill="#dc2626"/>
        <!-- Eye Slit Opening -->
        <ellipse cx="24" cy="25" rx="13.5" ry="5.8" fill="#fed7aa"/>
        <!-- Fierce Yet Chibi Eyes -->
        <ellipse cx="17.5" cy="24.8" rx="3" ry="3.5" fill="#0f172a"/>
        <circle cx="18.5" cy="23.8" r="1.2" fill="#ffffff"/>
        <ellipse cx="30.5" cy="24.8" rx="3" ry="3.5" fill="#0f172a"/>
        <circle cx="31.5" cy="23.8" r="1.2" fill="#ffffff"/>
        <polygon points="24,27 22,30 26,30" fill="#ea580c"/>
      </svg>`
    },
    {
      id: 'phoenix_blaze',
      name: 'SOLAR PHOENIX',
      color: '#f97316',
      bg: 'linear-gradient(135deg, #fed7aa 0%, #ea580c 100%)',
      render: (size = 48) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" style="display:block">
        <circle cx="24" cy="24" r="23" fill="#ffedd5"/>
        <!-- Flame Feathers Crown -->
        <polygon points="24,1 17,12 24,8 31,12" fill="#ef4444"/>
        <polygon points="24,4 19,12 24,9 29,12" fill="#facc15"/>
        <circle cx="24" cy="26" r="17.5" fill="#f97316"/>
        <!-- Radiant Blazing Eyes with Gold Highlight -->
        <ellipse cx="16.5" cy="23.5" rx="3.8" ry="4.4" fill="#450a0a"/>
        <circle cx="18" cy="21.8" r="1.6" fill="#ffffff"/>
        <circle cx="15.2" cy="25" r="1" fill="#fef08a"/>
        <ellipse cx="31.5" cy="23.5" rx="3.8" ry="4.4" fill="#450a0a"/>
        <circle cx="33" cy="21.8" r="1.6" fill="#ffffff"/>
        <circle cx="30.2" cy="25" r="1" fill="#fef08a"/>
        <!-- Golden Beak & Glowing Cheeks -->
        <circle cx="11" cy="29.5" r="2.8" fill="#fde047" opacity="0.8"/>
        <circle cx="37" cy="29.5" r="2.8" fill="#fde047" opacity="0.8"/>
        <polygon points="24,25 19.5,31 28.5,31" fill="#facc15"/>
      </svg>`
    },
    // ANIME SPECIAL PROFILE AVATARS (SUPER CUTE KAWAII CHIBI PORTRAITS)
    {
      id: 'luffy_mugiwara',
      name: 'LUFFY MUGIWARA',
      color: '#ef4444',
      bg: 'linear-gradient(135deg, #fee2e2 0%, #dc2626 100%)',
      render: (size = 48) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" style="display:block">
        <circle cx="24" cy="24" r="23" fill="#fee2e2"/>
        <!-- Straw Hat -->
        <ellipse cx="24" cy="13" rx="20" ry="5.5" fill="#facc15" stroke="#ca8a04" stroke-width="1.2"/>
        <path d="M 13 13 C 13 4 35 4 35 13 Z" fill="#facc15"/>
        <path d="M 13 13 C 14 9.5 34 9.5 35 13 Z" fill="#dc2626"/>
        <!-- Messy Black Hair -->
        <polygon points="7,19 12,23 13,17" fill="#0f172a"/>
        <polygon points="41,19 36,23 35,17" fill="#0f172a"/>
        <polygon points="16,15 19,20 20,15" fill="#0f172a"/>
        <polygon points="28,15 30,20 32,15" fill="#0f172a"/>
        <!-- Cute Chibi Face -->
        <circle cx="24" cy="27" r="14.5" fill="#fed7aa"/>
        <!-- Big Sparkling Eyes -->
        <circle cx="17" cy="25" r="3.6" fill="#0f172a"/>
        <circle cx="18.3" cy="23.6" r="1.5" fill="#ffffff"/>
        <circle cx="16" cy="26.3" r="0.7" fill="#ffffff"/>
        <circle cx="31" cy="25" r="3.6" fill="#0f172a"/>
        <circle cx="32.3" cy="23.6" r="1.5" fill="#ffffff"/>
        <circle cx="30" cy="26.3" r="0.7" fill="#ffffff"/>
        <!-- Cute Blushing Cheeks -->
        <ellipse cx="11" cy="29" rx="3.2" ry="1.8" fill="#fb7185" opacity="0.75"/>
        <ellipse cx="37" cy="29" rx="3.2" ry="1.8" fill="#fb7185" opacity="0.75"/>
        <!-- Stitched Scar -->
        <path d="M 14 29 L 18 29 M 16 27.5 L 16 30.5" stroke="#991b1b" stroke-width="1.1" stroke-linecap="round"/>
        <!-- Big Joyful Open Mouth -->
        <path d="M 17.5 31 Q 24 38 30.5 31 Z" fill="#ffffff" stroke="#991b1b" stroke-width="1.1"/>
        <path d="M 20 33.5 Q 24 36.5 28 33.5" fill="#f87171"/>
        <!-- Red Vest Collar -->
        <path d="M 12 43 L 18 36 L 24 40 L 30 36 L 36 43 Z" fill="#dc2626"/>
      </svg>`
    },
    {
      id: 'naruto_sage',
      name: 'NARUTO SAGE',
      color: '#ea580c',
      bg: 'linear-gradient(135deg, #ffedd5 0%, #ea580c 100%)',
      render: (size = 48) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" style="display:block">
        <circle cx="24" cy="24" r="23" fill="#ffedd5"/>
        <!-- Spiky Golden Hair -->
        <polygon points="5,18 9,5 15,12 24,2 33,12 39,5 43,18" fill="#facc15" stroke="#ca8a04" stroke-width="1.2"/>
        <polygon points="11,11 17,4 24,9 31,4 37,11" fill="#fef08a"/>
        <circle cx="24" cy="27" r="14.5" fill="#fed7aa"/>
        <!-- Navy Headband & Silver Plate -->
        <rect x="9" y="12" width="30" height="7" rx="2" fill="#1e3a8a"/>
        <rect x="15" y="13" width="18" height="5" rx="1.2" fill="#e2e8f0" stroke="#64748b" stroke-width="0.7"/>
        <circle cx="24" cy="15.5" r="1.2" fill="#0f172a"/>
        <!-- Sage Mode Orange Eye Patches -->
        <ellipse cx="17" cy="24.5" rx="5.2" ry="3.4" fill="#ea580c"/>
        <ellipse cx="31" cy="24.5" rx="5.2" ry="3.4" fill="#ea580c"/>
        <!-- Golden Sage Toad Eyes -->
        <circle cx="17" cy="24.5" r="3.4" fill="#fef08a"/>
        <rect x="15" y="23.8" width="4" height="1.3" rx="0.65" fill="#1e293b"/>
        <circle cx="18.2" cy="23.2" r="0.9" fill="#ffffff"/>
        <circle cx="31" cy="24.5" r="3.4" fill="#fef08a"/>
        <rect x="29" y="23.8" width="4" height="1.3" rx="0.65" fill="#1e293b"/>
        <circle cx="32.2" cy="23.2" r="0.9" fill="#ffffff"/>
        <!-- Whiskers & Blush -->
        <ellipse cx="11" cy="28.5" rx="3" ry="1.6" fill="#fb7185" opacity="0.65"/>
        <ellipse cx="37" cy="28.5" rx="3" ry="1.6" fill="#fb7185" opacity="0.65"/>
        <line x1="8" y1="26" x2="13" y2="27" stroke="#9a3412" stroke-width="1.1" stroke-linecap="round"/>
        <line x1="8" y1="29" x2="13" y2="29" stroke="#9a3412" stroke-width="1.1" stroke-linecap="round"/>
        <line x1="40" y1="26" x2="35" y2="27" stroke="#9a3412" stroke-width="1.1" stroke-linecap="round"/>
        <line x1="40" y1="29" x2="35" y2="29" stroke="#9a3412" stroke-width="1.1" stroke-linecap="round"/>
        <!-- Happy Smile & Collar -->
        <path d="M 21 31.5 Q 24 35 27 31.5" fill="none" stroke="#78350f" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M 12 43 L 18 36 L 24 39 L 30 36 L 36 43 Z" fill="#ea580c"/>
      </svg>`
    },
    {
      id: 'tanjiro_slayer',
      name: 'TANJIRO SLAYER',
      color: '#15803d',
      bg: 'linear-gradient(135deg, #dcfce7 0%, #15803d 100%)',
      render: (size = 48) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" style="display:block">
        <circle cx="24" cy="24" r="23" fill="#dcfce7"/>
        <!-- Spiky Burgundy Hair -->
        <polygon points="6,19 9,6 15,12 24,3 33,12 39,6 42,19" fill="#881337" stroke="#4c0519" stroke-width="1.2"/>
        <polygon points="11,11 17,5 24,10 31,5 37,11" fill="#be123c"/>
        <circle cx="24" cy="27" r="14.5" fill="#fed7aa"/>
        <!-- Demon Slayer Forehead Flame Scar -->
        <path d="M 12 15 Q 16 12 18 16 Q 16 20 13 18 Z" fill="#991b1b"/>
        <!-- Dangling Hanafuda Earrings -->
        <rect x="7" y="24" width="4" height="8" rx="0.5" fill="#ffffff" stroke="#991b1b" stroke-width="0.8"/>
        <circle cx="9" cy="27" r="1.3" fill="#dc2626"/>
        <rect x="37" y="24" width="4" height="8" rx="0.5" fill="#ffffff" stroke="#991b1b" stroke-width="0.8"/>
        <circle cx="39" cy="27" r="1.3" fill="#dc2626"/>
        <!-- Kind Sparkling Ruby Eyes -->
        <circle cx="17" cy="25" r="3.6" fill="#881337"/>
        <circle cx="18.3" cy="23.6" r="1.5" fill="#ffffff"/>
        <circle cx="16" cy="26.3" r="0.7" fill="#ffffff"/>
        <circle cx="31" cy="25" r="3.6" fill="#881337"/>
        <circle cx="32.3" cy="23.6" r="1.5" fill="#ffffff"/>
        <circle cx="30" cy="26.3" r="0.7" fill="#ffffff"/>
        <!-- Cute Blush & Smile -->
        <ellipse cx="11" cy="29" rx="3.2" ry="1.8" fill="#fb7185" opacity="0.75"/>
        <ellipse cx="37" cy="29" rx="3.2" ry="1.8" fill="#fb7185" opacity="0.75"/>
        <path d="M 21 31.5 Q 24 34.5 27 31.5" fill="none" stroke="#4c0519" stroke-width="1.4" stroke-linecap="round"/>
        <!-- Green-Black Checkered Collar -->
        <rect x="13" y="38" width="6" height="6" fill="#15803d"/>
        <rect x="19" y="38" width="5" height="6" fill="#0f172a"/>
        <rect x="24" y="38" width="5" height="6" fill="#15803d"/>
        <rect x="29" y="38" width="6" height="6" fill="#0f172a"/>
      </svg>`
    },
    {
      id: 'nezuko_chan',
      name: 'NEZUKO CHAN',
      color: '#f472b6',
      bg: 'linear-gradient(135deg, #fce7f3 0%, #f472b6 100%)',
      render: (size = 48) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" style="display:block">
        <circle cx="24" cy="24" r="23" fill="#fce7f3"/>
        <!-- Flowing Black Hair with Orange Flame Tips -->
        <circle cx="24" cy="27" r="16.5" fill="#0f172a"/>
        <polygon points="5,33 9,45 14,35" fill="#ea580c"/>
        <polygon points="34,35 39,45 43,33" fill="#ea580c"/>
        <!-- Cute Face -->
        <circle cx="24" cy="27" r="14" fill="#fff1f2"/>
        <!-- Pink Ribbon Hairpin -->
        <polygon points="12,12 16,16 12,20" fill="#f43f5e"/>
        <polygon points="20,12 16,16 20,20" fill="#f43f5e"/>
        <circle cx="16" cy="16" r="1.6" fill="#ffffff"/>
        <!-- Rosy Blush Cheeks -->
        <ellipse cx="11" cy="28" rx="3.5" ry="2" fill="#fb7185" opacity="0.8"/>
        <ellipse cx="37" cy="28" rx="3.5" ry="2" fill="#fb7185" opacity="0.8"/>
        <!-- Big Sparkling Pink Anime Eyes with Eyelashes -->
        <path d="M 13 21.5 Q 17 18.5 21 21.5" fill="none" stroke="#0f172a" stroke-width="1.4" stroke-linecap="round"/>
        <circle cx="17" cy="24" r="3.5" fill="#f43f5e"/>
        <circle cx="18.2" cy="22.8" r="1.5" fill="#ffffff"/>
        <circle cx="16" cy="25.2" r="0.7" fill="#ffffff"/>
        <path d="M 27 21.5 Q 31 18.5 35 21.5" fill="none" stroke="#0f172a" stroke-width="1.4" stroke-linecap="round"/>
        <circle cx="31" cy="24" r="3.5" fill="#f43f5e"/>
        <circle cx="32.2" cy="22.8" r="1.5" fill="#ffffff"/>
        <circle cx="30" cy="25.2" r="0.7" fill="#ffffff"/>
        <!-- Green Bamboo Muzzle & Red Ribbon -->
        <line x1="11" y1="31.5" x2="37" y2="31.5" stroke="#e11d48" stroke-width="1.5"/>
        <rect x="16.5" y="28.5" width="15" height="6.5" rx="3.2" fill="#22c55e" stroke="#15803d" stroke-width="1"/>
        <line x1="21.5" y1="28.5" x2="21.5" y2="35" stroke="#15803d" stroke-width="1"/>
        <line x1="26.5" y1="28.5" x2="26.5" y2="35" stroke="#15803d" stroke-width="1"/>
      </svg>`
    },
    {
      id: 'gojo_satoru',
      name: 'GOJO SATORU',
      color: '#38bdf8',
      bg: 'linear-gradient(135deg, #0f172a 0%, #0284c7 100%)',
      render: (size = 48) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" style="display:block">
        <circle cx="24" cy="24" r="23" fill="#0f172a"/>
        <!-- Fluffy Spiky Silver Hair -->
        <polygon points="6,19 8,4 14,11 24,1 34,11 40,4 42,19" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.3"/>
        <polygon points="11,11 17,4 24,9 31,4 37,11" fill="#f1f5f9"/>
        <circle cx="24" cy="27" r="14.5" fill="#f8fafc"/>
        <!-- Sorcerer Blindfold / Glasses Tilted -->
        <polygon points="9,21 39,18 39,23 9,26" fill="#020617"/>
        <!-- Radiant Six Eyes Glowing Cyan/Blue with Diamond Sparkle -->
        <circle cx="17" cy="24.5" r="4.2" fill="#00f5d4"/>
        <circle cx="17" cy="24.5" r="2.8" fill="#38bdf8"/>
        <circle cx="17" cy="24.5" r="1.5" fill="#0284c7"/>
        <circle cx="18.3" cy="23.3" r="1.3" fill="#ffffff"/>
        <circle cx="31" cy="24.5" r="4.2" fill="#00f5d4"/>
        <circle cx="31" cy="24.5" r="2.8" fill="#38bdf8"/>
        <circle cx="31" cy="24.5" r="1.5" fill="#0284c7"/>
        <circle cx="32.3" cy="23.3" r="1.3" fill="#ffffff"/>
        <!-- Diamond Glint Stars -->
        <path d="M 17 21.5 L 17.5 23.5 L 19.5 24 L 17.5 24.5 L 17 26.5 L 16.5 24.5 L 14.5 24 L 16.5 23.5 Z" fill="#ffffff" opacity="0.95"/>
        <ellipse cx="11" cy="28.5" rx="3" ry="1.6" fill="#38bdf8" opacity="0.6"/>
        <ellipse cx="37" cy="28.5" rx="3" ry="1.6" fill="#38bdf8" opacity="0.6"/>
        <!-- Cute Smug Smile -->
        <path d="M 21 31.5 Q 24.5 34.5 28 31.5" fill="none" stroke="#0284c7" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Dark High Collar Jacket -->
        <path d="M 11 43 L 17 36 L 24 39 L 31 36 L 37 43 Z" fill="#020617"/>
      </svg>`
    },
    {
      id: 'goku_saiyan',
      name: 'GOKU SAIYAN',
      color: '#facc15',
      bg: 'linear-gradient(135deg, #fef08a 0%, #ca8a04 100%)',
      render: (size = 48) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" style="display:block">
        <circle cx="24" cy="24" r="23" fill="#fef08a"/>
        <!-- Super Saiyan Golden Spikes -->
        <polygon points="3,21 6,3 15,12 24,0 33,12 42,3 45,21" fill="#facc15" stroke="#ca8a04" stroke-width="1.4"/>
        <polygon points="11,11 17,2 24,8 31,2 37,11" fill="#fef08a"/>
        <circle cx="24" cy="28" r="14.5" fill="#fed7aa"/>
        <!-- Cute Fierce Eyebrows & Teal Eyes -->
        <path d="M 13 21.5 L 21 24 M 35 21.5 L 27 24" stroke="#ca8a04" stroke-width="1.8" stroke-linecap="round"/>
        <polygon points="14,22.5 20,24 18,27.5 15,26.5" fill="#06b6d4"/>
        <circle cx="17" cy="25" r="1.4" fill="#0f172a"/>
        <circle cx="17.8" cy="24.2" r="0.7" fill="#ffffff"/>
        <polygon points="34,22.5 28,24 30,27.5 33,26.5" fill="#06b6d4"/>
        <circle cx="31" cy="25" r="1.4" fill="#0f172a"/>
        <circle cx="31.8" cy="24.2" r="0.7" fill="#ffffff"/>
        <!-- Blush & Smirk -->
        <ellipse cx="11" cy="29.5" rx="3" ry="1.6" fill="#fb7185" opacity="0.65"/>
        <ellipse cx="37" cy="29.5" rx="3" ry="1.6" fill="#fb7185" opacity="0.65"/>
        <path d="M 21 32 Q 24 35 27 32" fill="none" stroke="#78350f" stroke-width="1.4" stroke-linecap="round"/>
        <!-- Orange Gi with Navy Undershirt -->
        <path d="M 10 43 L 18 36 L 24 41 L 30 36 L 38 43 Z" fill="#ea580c"/>
        <polygon points="21,38 24,42 27,38" fill="#1d4ed8"/>
      </svg>`
    },
    {
      id: 'levi_scout',
      name: 'LEVI SCOUT',
      color: '#334155',
      bg: 'linear-gradient(135deg, #cbd5e1 0%, #166534 100%)',
      render: (size = 48) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" style="display:block">
        <circle cx="24" cy="24" r="23" fill="#cbd5e1"/>
        <!-- Parted Undercut Black Hair -->
        <path d="M 7 19 C 7 7 41 7 41 19 L 41 24 L 35 20 L 29 24 L 24 18 L 19 24 L 13 20 L 7 24 Z" fill="#0f172a"/>
        <circle cx="24" cy="28" r="14" fill="#f8fafc"/>
        <!-- Sharp Stoic Steel-Grey Anime Eyes -->
        <path d="M 13 23 L 21 23 L 19 27 L 14 26 Z" fill="#475569"/>
        <circle cx="17" cy="24.5" r="1.4" fill="#0f172a"/>
        <circle cx="17.6" cy="23.8" r="0.6" fill="#ffffff"/>
        <path d="M 35 23 L 27 23 L 29 27 L 34 26 Z" fill="#475569"/>
        <circle cx="31" cy="24.5" r="1.4" fill="#0f172a"/>
        <circle cx="31.6" cy="23.8" r="0.6" fill="#ffffff"/>
        <!-- Stoic Expression & Subtle Blush -->
        <ellipse cx="11" cy="29" rx="2.8" ry="1.5" fill="#fca5a5" opacity="0.5"/>
        <ellipse cx="37" cy="29" rx="2.8" ry="1.5" fill="#fca5a5" opacity="0.5"/>
        <line x1="21.5" y1="32" x2="26.5" y2="32" stroke="#334155" stroke-width="1.3" stroke-linecap="round"/>
        <!-- White Ascot Cravat & Scout Cape -->
        <polygon points="24,35 20,44 28,44" fill="#ffffff" stroke="#94a3b8" stroke-width="0.8"/>
        <circle cx="24" cy="36" r="1.2" fill="#fbbf24"/>
        <path d="M 10 43 L 18 36 L 24 39 L 30 36 L 38 43 Z" fill="#166534"/>
      </svg>`
    },
    {
      id: 'anya_forger',
      name: 'ANYA FORGER',
      color: '#f472b6',
      bg: 'linear-gradient(135deg, #fce7f3 0%, #fb7185 100%)',
      render: (size = 48) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" style="display:block">
        <circle cx="24" cy="24" r="23" fill="#ffe4e6"/>
        <!-- Soft Fluffy Pink Hair -->
        <circle cx="24" cy="26" r="16.5" fill="#f472b6"/>
        <!-- Black-Gold Conical Hair Ornaments -->
        <polygon points="10,13 6,5 15,10" fill="#0f172a"/>
        <polygon points="9,12 6,7 13,10" fill="#facc15"/>
        <polygon points="38,13 42,5 33,10" fill="#0f172a"/>
        <polygon points="39,12 42,7 35,10" fill="#facc15"/>
        <!-- Cute Face -->
        <circle cx="24" cy="28" r="14" fill="#fff1f2"/>
        <!-- Giant Sparkling Emerald Anime Eyes -->
        <circle cx="17" cy="25" r="4" fill="#059669"/>
        <circle cx="17" cy="25" r="2.6" fill="#10b981"/>
        <circle cx="18.3" cy="23.6" r="1.5" fill="#ffffff"/>
        <circle cx="15.8" cy="26.3" r="0.8" fill="#ffffff"/>
        <circle cx="31" cy="25" r="4" fill="#059669"/>
        <circle cx="31" cy="25" r="2.6" fill="#10b981"/>
        <circle cx="32.3" cy="23.6" r="1.5" fill="#ffffff"/>
        <circle cx="29.8" cy="26.3" r="0.8" fill="#ffffff"/>
        <!-- Waku Waku Blush -->
        <ellipse cx="11" cy="29.5" rx="3.5" ry="1.8" fill="#fb7185" opacity="0.85"/>
        <ellipse cx="37" cy="29.5" rx="3.5" ry="1.8" fill="#fb7185" opacity="0.85"/>
        <!-- Smug 'Heh' Cute Smile -->
        <path d="M 20.5 31.5 Q 24 35.5 27.5 31.5" fill="none" stroke="#e11d48" stroke-width="1.4" stroke-linecap="round"/>
        <!-- Eden Academy Uniform Collar -->
        <path d="M 12 43 L 18 36 L 24 39 L 30 36 L 36 43 Z" fill="#0f172a"/>
        <path d="M 18 36 L 24 39 L 30 36" fill="none" stroke="#facc15" stroke-width="1.2"/>
      </svg>`
    }
  ];

  function getCuteAvatarSvg(avatarId, size = 48) {
    const found = cuteAvatarsCatalog.find(a => a.id === avatarId);
    if(found) return found.render(size);
    // Legacy fallback mapping
    const legacyMap = {
      'P1': 'chick_yellow', 'ACE': 'pink_sakura', 'PRO': 'penguin_tux', 'TOP': 'king_royal',
      'SKY': 'blue_sky', 'MAX': 'phoenix_blaze', 'VIP': 'cat_neko', 'NEO': 'robo_mecha',
      'AIR': 'astro_space', 'RAY': 'dragon_pyro', 'FOX': 'fox_kitsune', 'BOT': 'robo_mecha'
    };
    if(avatarId && legacyMap[avatarId]) {
      return getCuteAvatarSvg(legacyMap[avatarId], size);
    }
    return cuteAvatarsCatalog[0].render(size);
  }
  window.getCuteAvatarSvg = getCuteAvatarSvg;

  function getPrimaryAccountKey() {
    if (gpProfile && gpProfile.googleUid) {
      return 'acc_' + gpProfile.googleUid;
    }
    let devKey = storage.get('skyFlappyDeviceUUID');
    if (!devKey) {
      devKey = 'guest_' + Math.random().toString(36).substring(2, 11);
      storage.set('skyFlappyDeviceUUID', devKey);
    }
    return devKey;
  }

  let gpProfile = storage.get('skyFlappyGPProfile', {
    isLoggedIn: false,
    isGoogle: false,
    email: '',
    googleUid: null,
    gamerTag: 'SkyPlayer',
    avatar: 'chick_yellow',
    nameChangesDone: 0,
    level: 1,
    id: null,
    primaryKey: null,
    isOnline: true
  });

  if (!gpProfile.primaryKey) {
    gpProfile.primaryKey = getPrimaryAccountKey();
    gpProfile.id = gpProfile.primaryKey;
  }

  // Normalisasi avatar jika masih format lama
  if(!cuteAvatarsCatalog.some(a => a.id === gpProfile.avatar)) {
    const legacyMap = {
      'P1': 'chick_yellow', 'ACE': 'pink_sakura', 'PRO': 'penguin_tux', 'TOP': 'king_royal',
      'SKY': 'chick_yellow', 'MAX': 'phoenix_blaze', 'VIP': 'cat_neko', 'NEO': 'robo_mecha',
      'AIR': 'astro_space', 'RAY': 'dragon_pyro', 'FOX': 'fox_kitsune', 'BOT': 'robo_mecha'
    };
    gpProfile.avatar = legacyMap[gpProfile.avatar] || 'chick_yellow';
  }

  function saveGPProfile() {
    gpProfile.primaryKey = getPrimaryAccountKey();
    gpProfile.id = gpProfile.primaryKey;
    storage.set('skyFlappyGPProfile', gpProfile);

    const primaryKey = gpProfile.primaryKey;
    if(gpProfile.googleUid || gpProfile.email) {
      const accountsMap = storage.get('skyFlappyAccountsMap', {});
      const tierObj = typeof getRankTier === 'function' ? getRankTier(rankedBest) : { name: 'BRONZE I' };
      const accData = {
        primaryKey: primaryKey,
        uid: gpProfile.googleUid || '',
        gamerTag: gpProfile.gamerTag,
        name: gpProfile.gamerTag,
        avatar: gpProfile.avatar,
        tier: tierObj.name || 'BRONZE I',
        nameChangesDone: gpProfile.nameChangesDone || 0,
        rankedBest: rankedBest || 0,
        classicBest: classicBest || 0,
        score: rankedBest || 0,
        coins: progress.coins || 0,
        loadout: {
          bird: progress.selected || 'classic',
          pet: progress.selectedPet || 'pip_peep',
          aura: progress.selectedAura || 'default',
          hat: progress.selectedHat || 'none',
          outfit: progress.selectedOutfit || 'none',
          pipe: progress.selectedPipe || 'green',
          background: progress.selectedBackground || 'sky',
          music: progress.selectedMusic || 'happy',
          booster: progress.selectedBooster || 'none'
        },
        unlocked: {
          bird: progress.unlocked || ['classic'],
          pet: progress.petUnlocked || ['pip_peep'],
          aura: progress.auraUnlocked || ['default'],
          hat: progress.hatUnlocked || ['none'],
          outfit: progress.outfitUnlocked || ['none'],
          pipe: progress.pipeUnlocked || ['green'],
          background: progress.backgroundUnlocked || ['sky'],
          music: progress.musicUnlocked || ['happy'],
          booster: progress.boosterUnlocked || ['none']
        },
        email: gpProfile.email,
        authProvider: gpProfile.authProvider || 'google',
        updatedAt: new Date().toISOString()
      };
      accountsMap[primaryKey] = accData;
      if(gpProfile.googleUid) accountsMap[gpProfile.googleUid] = accData;
      storage.set('skyFlappyAccountsMap', accountsMap);

      // Simpan ke Firestore Cloud dengan Primary Key
      if(!isApplyingCloudSync && window.FirebaseLeaderboard && typeof window.FirebaseLeaderboard.saveUserProfile === 'function' && (gpProfile.googleUid || gpProfile.isLoggedIn)) {
        window.FirebaseLeaderboard.saveUserProfile(primaryKey, accData);
      }
    }

    // Perbarui entri user di leaderboard secara langsung
    if(Array.isArray(leaderboardData)) {
      leaderboardData.forEach(p => {
        if(p.isUser || p.primaryKey === primaryKey || p.id === primaryKey || (gpProfile.googleUid && p.uid === gpProfile.googleUid)) {
          p.name = gpProfile.gamerTag;
          p.avatar = gpProfile.avatar;
          p.primaryKey = primaryKey;
          p.id = primaryKey;
          p.isUser = true;
        }
      });
      leaderboardData = sanitizeLeaderboard(leaderboardData);
      storage.set('skyFlappyLeaderboard_v6', leaderboardData);
    }

    syncGPProfileUI();
    if(rankedBest > 0 && typeof submitRankedScore === 'function') {
      submitRankedScore(rankedBest);
    }
  }

  function renderAvatarPickerGrid() {
    if(!el.avatarPickerGrid) return;
    let html = '';
    cuteAvatarsCatalog.forEach(a => {
      const isSelected = (gpProfile.avatar || cuteAvatarsCatalog[0].id) === a.id;
      html += `
        <div class="avatar-card${isSelected ? ' selected' : ''}" data-avatar-id="${a.id}">
          <div class="avatar-card-icon" style="background:${a.bg}">${a.render(44)}</div>
          <div class="avatar-card-name">${a.name}</div>
          ${isSelected ? '<span class="avatar-card-check">DIPAKAI</span>' : ''}
        </div>
      `;
    });
    el.avatarPickerGrid.innerHTML = html;

    el.avatarPickerGrid.querySelectorAll('.avatar-card').forEach(card => {
      card.addEventListener('click', () => {
        audio.click();
        const avId = card.getAttribute('data-avatar-id');
        if(avId) {
          gpProfile.avatar = avId;
          saveGPProfile();
          if(typeof saveCloudSave === 'function') saveCloudSave();
          renderAvatarPickerGrid();
          closeModal();
          showModal(el.googlePlayModal);
        }
      });
    });
  }

  function syncGPProfileUI() {
    const isLogged = !!(gpProfile.isLoggedIn && (gpProfile.email || gpProfile.isGoogle));
    
    // Toggle Prompt Login vs Profile Card
    if(el.googleSignInPrompt) el.googleSignInPrompt.classList.toggle('hidden', isLogged);
    if(el.googleProfileCard) el.googleProfileCard.classList.toggle('hidden', !isLogged);
    if(el.gpSignOutBtn) el.gpSignOutBtn.classList.toggle('hidden', !isLogged);

    if(el.gpAvatar) {
      el.gpAvatar.innerHTML = getCuteAvatarSvg(gpProfile.avatar, 52);
    }
    const gpWrap = $('gpAvatarWrap');
    if(gpWrap) {
      const myTierBorder = typeof getAvatarRankBorderClass === 'function' ? getAvatarRankBorderClass(rankedBest) : 'rank-border-bronze';
      gpWrap.className = 'friend-profile-avatar-box ' + myTierBorder;
    }
    if(el.gpGamerTagInput && document.activeElement !== el.gpGamerTagInput) {
      const displayTag = gpProfile.gamerTag || 'SkyPlayer';
      el.gpGamerTagInput.value = typeof window.sanitizePlayerName === 'function' ? window.sanitizePlayerName(displayTag) : displayTag;
    }
    if(el.gpUserEmail) el.gpUserEmail.textContent = gpProfile.email ? gpProfile.email : (gpProfile.gamerTag || 'Akun Pemain');
    if(el.gpRankedBest) el.gpRankedBest.textContent = rankedBest;
    
    if(el.gpNameCostHint) {
      const changes = gpProfile.nameChangesDone || 0;
      if(changes === 0) {
        el.gpNameCostHint.innerHTML = `<span class="free-badge">1x Ganti Nama: GRATIS</span>`;
      } else {
        el.gpNameCostHint.innerHTML = `<span class="coin-badge">Biaya Ganti Nama: <b>50 Koin</b></span>`;
      }
    }

    if(el.gpOnlineStatus) {
      el.gpOnlineStatus.textContent = isLogged ? `TERHUBUNG KE CLOUD (${gpProfile.email || gpProfile.gamerTag})` : 'MODE LOKAL / TAMU';
      el.gpOnlineStatus.className = 'gp-status-pill ' + (isLogged ? 'online' : 'offline');
    }

    if(window.socialService) {
      if(isLogged && gpProfile.primaryKey) {
        window.socialService.setAccount(gpProfile.primaryKey, gpProfile);
      } else {
        window.socialService.clearAccount();
      }
    }
    
    if(el.gpAuthActionBtn) {
      el.gpAuthActionBtn.textContent = isLogged ? 'SIMPAN PERUBAHAN' : 'LOGIN GOOGLE SEKARANG';
    }
    
    const tier = getRankTier(rankedBest);
    if(el.gpTierBadge) {
      el.gpTierBadge.innerHTML = `<span class="tier-icon-inline">${tier.iconSvg}</span> ${tier.name}`;
      el.gpTierBadge.style.color = tier.color;
    }

    // Populate Career Statistics (Accurate Local & Cloud Stats)
    const elCasual = $('myCasualScore');
    const elRank = $('myRankPoints');
    const elMp = $('myMpWins');
    const elCoins = $('myCoins');

    const userCasual = Math.max(
      Number(classicBest) || 0,
      Number(storage.get('skyFlappyClassicBest', 0)) || 0,
      Number(storage.get('skyFlappyBest', 0)) || 0,
      Number(progress.highScore) || 0,
      Number(gpProfile.classicBest) || 0
    );
    const userRanked = Math.max(
      Number(rankedBest) || 0,
      Number(storage.get('skyFlappyRankedBest', 0)) || 0,
      Number(gpProfile.rankedBest) || 0,
      Number(progress.rankedScore) || 0
    );
    const userMp = Math.max(
      Number(progress.mpWins) || 0,
      Number(storage.get('skyFlappyMpWins', 0)) || 0,
      Number(gpProfile.mpWins) || 0
    );
    const userCoins = (typeof progress.coins === 'number') ? progress.coins : (Number(storage.get('skyFlappyCoins', 0)) || 0);

    // Backfill state agar selalu konsisten
    classicBest = userCasual;
    rankedBest = userRanked;
    progress.highScore = userCasual;
    progress.rankedScore = userRanked;
    progress.mpWins = userMp;
    gpProfile.classicBest = userCasual;
    gpProfile.rankedBest = userRanked;
    gpProfile.mpWins = userMp;

    if(elCasual) elCasual.textContent = userCasual;
    if(elRank) elRank.textContent = `${userRanked} PTS`;
    if(elMp) elMp.textContent = `${userMp} MENANG`;
    if(elCoins) elCoins.textContent = `${userCoins}`;

    // Populate Equipped Loadout
    const elEqBird = $('myEquippedBird');
    const elEqPet = $('myEquippedPet');
    const elEqHat = $('myEquippedHat');
    const elEqAura = $('myEquippedAura');

    const getCosmeticName = (cat, id) => {
      if(!id || id === 'none') return 'NONE';
      if(cat === 'bird' && skins[id]) return skins[id].name;
      if(cat === 'pet' && petsCatalog[id]) return (petsCatalog[id].name || '').split(' (')[0];
      if(cat === 'hat' && hats[id]) return hats[id].name;
      if(cat === 'aura' && auras[id]) return auras[id].name;
      return String(id).replace(/[-_]+/g, ' ').toUpperCase();
    };
    if(elEqBird) elEqBird.textContent = getCosmeticName('bird', progress.selected || 'classic');
    if(elEqPet) elEqPet.textContent = getCosmeticName('pet', progress.selectedPet || 'none');
    if(elEqHat) elEqHat.textContent = getCosmeticName('hat', progress.selectedHat || 'none');
    if(elEqAura) elEqAura.textContent = getCosmeticName('aura', progress.selectedAura || 'none');

    // Populate Owned Cosmetics Count with Total Catalog Comparison
    const elCountBird = $('mySkinCount');
    const elCountPet = $('myPetCount');
    const elCountHat = $('myHatCount');
    const elCountAura = $('myAuraCount');

    const totalSkins = Object.keys(skins).length;
    const totalPets = Object.keys(petsCatalog).length;
    const totalHats = Object.keys(hats).length + Object.keys(outfits).length;
    const totalAuras = Object.keys(auras).length;

    const ownedSkins = (progress.unlocked ? progress.unlocked.length : 1);
    const ownedPets = (progress.petUnlocked ? progress.petUnlocked.length : 0);
    const ownedHats = ((progress.hatUnlocked ? progress.hatUnlocked.length : 0) + (progress.outfitUnlocked ? progress.outfitUnlocked.length : 0));
    const ownedAuras = (progress.auraUnlocked ? progress.auraUnlocked.length : 0);

    if(elCountBird) elCountBird.textContent = `${ownedSkins} / ${totalSkins} Milik`;
    if(elCountPet) elCountPet.textContent = `${ownedPets} / ${totalPets} Milik`;
    if(elCountHat) elCountHat.textContent = `${ownedHats} / ${totalHats} Milik`;
    if(elCountAura) elCountAura.textContent = `${ownedAuras} / ${totalAuras} Milik`;

    // Trigger 60FPS Live Animated Equipment Canvas Showcase
    if(typeof startFriendShowcase === 'function') {
      startFriendShowcase({
        bird: progress.selected || 'classic',
        pet: progress.selectedPet || 'none',
        hat: progress.selectedHat || 'none',
        outfit: progress.selectedOutfit || 'none',
        aura: progress.selectedAura || 'none',
        background: progress.selectedBackground || 'sky',
        pipe: progress.selectedPipe || 'green'
      }, 'myProfileShowcaseCanvas');
    }

    // Update Widget Profil Pojok Kiri Atas (Square MLBB Frame Style with Dynamic Rank Borders)
    if(el.topProfileBtn) {
      const elAvatar = $('topProfileAvatar');
      const elCrown = el.topProfileBtn.querySelector('.top-profile-frame-crown');
      const elName = $('topProfileName');
      const elTierIcon = $('topProfileTierIcon');
      const elTierNum = $('topProfileTierNum');
      const elXpFill = $('topProfileXpFill');

      const currentScore = userRanked;
      const playerTier = getRankTier(currentScore);

      // Apply dynamic rank border class to the avatar frame
      if(elAvatar) {
        elAvatar.className = 'top-profile-avatar rank-border-' + playerTier.id;
      }
      
      // Update crown based on rank tier
      if(elCrown) {
        if(playerTier.id === 'bronze') {
          elCrown.innerHTML = '';
        } else if(playerTier.id === 'silver') {
          elCrown.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" fill="#cbd5e1"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/></svg>`;
        } else if(playerTier.id === 'gold') {
          elCrown.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="#facc15"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-1h14v1z"/></svg>`;
        } else if(playerTier.id === 'platinum') {
          elCrown.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="#2dd4bf"><path d="M12 2L4 7l8 13 8-13-8-7z"/></svg>`;
        } else if(playerTier.id === 'diamond') {
          elCrown.innerHTML = `<svg viewBox="0 0 24 24" width="15" height="15" fill="#38bdf8"><path d="M12 2L2 9l10 13L22 9 12 2zm0 3.5L18.5 9 12 18.2 5.5 9 12 5.5z"/></svg>`;
        } else {
          // Master / Grandmaster: Mythic glowing crown with ruby
          elCrown.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 16L3 4l5.5 5L12 2l3.5 7L21 4l-2 12H5z" fill="#c084fc"/><circle cx="12" cy="11" r="2.5" fill="#ef4444"/><circle cx="6" cy="9" r="1.5" fill="#facc15"/><circle cx="18" cy="9" r="1.5" fill="#facc15"/></svg>`;
        }
      }

      if(isLogged) {
        if(elAvatar) elAvatar.innerHTML = getCuteAvatarSvg(gpProfile.avatar, 38);
        const rawName = gpProfile.gamerTag || 'Player';
        if(elName) elName.textContent = typeof window.sanitizePlayerName === 'function' ? window.sanitizePlayerName(rawName) : rawName;
        if(elTierIcon) elTierIcon.innerHTML = playerTier.iconSvg;
        if(elTierNum) elTierNum.textContent = currentScore;
        if(elXpFill) {
          const tierRange = Math.max(1, playerTier.maxScore - playerTier.minScore);
          const currentInTier = Math.max(0, currentScore - playerTier.minScore);
          const pct = Math.min(100, Math.max(12, Math.round((currentInTier / tierRange) * 100)));
          elXpFill.style.width = pct + '%';
        }
      } else {
        if(elAvatar) {
          elAvatar.innerHTML = getCuteAvatarSvg('chick_yellow', 38);
        }
        if(elName) elName.textContent = 'GUEST';
        if(elTierIcon) elTierIcon.innerHTML = playerTier.iconSvg;
        if(elTierNum) elTierNum.textContent = String(currentScore);
        if(elXpFill) elXpFill.style.width = '30%';
      }
    }

  }

  // 10. Daftar Tingkatan Rank Tier & Ikon Badge Vektor Unik
  const rankTiers = [
    {
      id: 'bronze',
      name: 'BRONZE',
      minScore: 0,
      maxScore: 24,
      color: '#f97316',
      badgeBg: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)',
      borderColor: '#f97316',
      iconSvg: `<svg viewBox="0 0 32 32" class="rank-tier-svg"><polygon points="16,3 26,9 23,23 16,29 9,23 6,9" fill="#9a3412" stroke="#ea580c" stroke-width="1.8"/><polygon points="16,7 22,11 20,21 16,25 12,21 10,11" fill="#c2410c"/><circle cx="16" cy="16" r="3.5" fill="#fed7aa"/></svg>`
    },
    {
      id: 'silver',
      name: 'SILVER',
      minScore: 25,
      maxScore: 49,
      color: '#cbd5e1',
      badgeBg: 'linear-gradient(135deg, #334155 0%, #94a3b8 100%)',
      borderColor: '#e2e8f0',
      iconSvg: `<svg viewBox="0 0 32 32" class="rank-tier-svg"><polygon points="16,3 27,8 24,24 16,29 8,24 5,8" fill="#475569" stroke="#cbd5e1" stroke-width="1.8"/><polygon points="16,6 23,10 21,21 16,25 11,21 9,10" fill="#94a3b8"/><polygon points="16,11 18,15 22,15.5 19,18 20,22 16,20 12,22 13,18 10,15.5 14,15" fill="#f8fafc"/></svg>`
    },
    {
      id: 'gold',
      name: 'GOLD',
      minScore: 50,
      maxScore: 99,
      color: '#facc15',
      badgeBg: 'linear-gradient(135deg, #713f12 0%, #eab308 100%)',
      borderColor: '#fde047',
      iconSvg: `<svg viewBox="0 0 32 32" class="rank-tier-svg"><polygon points="16,2 28,8 25,25 16,30 7,25 4,8" fill="#854d0e" stroke="#facc15" stroke-width="2"/><polygon points="16,5 24,10 22,22 16,26 10,22 8,10" fill="#eab308"/><path d="M10 19 L16 12 L22 19 L19 22 L13 22 Z" fill="#fef08a"/><circle cx="16" cy="11" r="2" fill="#fff"/></svg>`
    },
    {
      id: 'platinum',
      name: 'PLATINUM',
      minScore: 100,
      maxScore: 159,
      color: '#2dd4bf',
      badgeBg: 'linear-gradient(135deg, #134e4a 0%, #14b8a6 100%)',
      borderColor: '#5eead4',
      iconSvg: `<svg viewBox="0 0 32 32" class="rank-tier-svg"><polygon points="16,2 28,7 26,24 16,30 6,24 4,7" fill="#115e59" stroke="#2dd4bf" stroke-width="2"/><polygon points="16,6 23,10 21,22 16,26 11,22 9,10" fill="#14b8a6"/><polygon points="16,9 21,15 16,23 11,15" fill="#ccfbf1"/><line x1="16" y1="9" x2="16" y2="23" stroke="#fff" stroke-width="1.2"/></svg>`
    },
    {
      id: 'diamond',
      name: 'DIAMOND',
      minScore: 160,
      maxScore: 229,
      color: '#38bdf8',
      badgeBg: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 100%)',
      borderColor: '#7dd3fc',
      iconSvg: `<svg viewBox="0 0 32 32" class="rank-tier-svg"><polygon points="16,2 29,8 25,26 16,31 7,26 3,8" fill="#0369a1" stroke="#38bdf8" stroke-width="2"/><polygon points="16,5 25,10 22,23 16,27 10,23 7,10" fill="#0284c7"/><polygon points="16,8 23,13 16,24 9,13" fill="#e0f2fe"/><polygon points="16,8 20,13 16,19 12,13" fill="#ffffff"/></svg>`
    },
    {
      id: 'master',
      name: 'MASTER',
      minScore: 230,
      maxScore: 299,
      color: '#c084fc',
      badgeBg: 'linear-gradient(135deg, #581c87 0%, #9333ea 100%)',
      borderColor: '#e9d5ff',
      iconSvg: `<svg viewBox="0 0 32 32" class="rank-tier-svg"><polygon points="16,1 30,7 26,27 16,31 6,27 2,7" fill="#6b21a8" stroke="#c084fc" stroke-width="2"/><path d="M6 13 L2 7 L10 9 Z" fill="#a855f7"/><path d="M26 13 L30 7 L22 9 Z" fill="#a855f7"/><polygon points="16,5 23,10 21,23 16,27 11,23 9,10" fill="#9333ea"/><polygon points="16,8 20,14 16,22 12,14" fill="#f3e8ff"/><circle cx="16" cy="15" r="2.5" fill="#ffffff"/></svg>`
    },
    {
      id: 'grandmaster',
      name: 'GRANDMASTER',
      minScore: 300,
      maxScore: 99999,
      color: '#f43f5e',
      badgeBg: 'linear-gradient(135deg, #881337 0%, #e11d48 50%, #facc15 100%)',
      borderColor: '#fde047',
      iconSvg: `<svg viewBox="0 0 32 32" class="rank-tier-svg"><polygon points="16,1 30,7 27,27 16,31 5,27 2,7" fill="#9f1239" stroke="#facc15" stroke-width="2"/><path d="M6 8 L10 16 L16 9 L22 16 L26 8 L24 23 L8 23 Z" fill="#facc15"/><polygon points="16,14 19,19 16,24 13,19" fill="#f43f5e"/><circle cx="16" cy="8" r="2.2" fill="#fff"/></svg>`
    }
  ];

  function getRankTier(score) {
    const s = Math.max(0, Number(score) || 0);
    for(let i = rankTiers.length - 1; i >= 0; i--) {
      const tier = rankTiers[i];
      if(s >= tier.minScore) {
        const nextTier = rankTiers[i + 1] || null;
        let pointsToNext = 0;
        let progressPercent = 100;
        if(nextTier) {
          pointsToNext = nextTier.minScore - s;
          const range = nextTier.minScore - tier.minScore;
          const current = s - tier.minScore;
          progressPercent = Math.max(0, Math.min(100, Math.round((current / range) * 100)));
        }
        return {
          ...tier,
          score: s,
          nextTier,
          pointsToNext,
          progressPercent
        };
      }
    }
    return {
      ...rankTiers[0],
      score: s,
      nextTier: rankTiers[1],
      pointsToNext: rankTiers[1].minScore - s,
      progressPercent: 0
    };
  }
  window.getRankTier = getRankTier;

  function getAvatarRankBorderClass(scoreOrTier) {
    if(!scoreOrTier) return 'rank-border-bronze';
    if(typeof scoreOrTier === 'number') {
      const tier = getRankTier(scoreOrTier);
      return 'rank-border-' + (tier.id || 'bronze');
    }
    if(typeof scoreOrTier === 'string') {
      const lower = scoreOrTier.toLowerCase();
      if(lower.includes('grandmaster')) return 'rank-border-grandmaster';
      if(lower.includes('master')) return 'rank-border-master';
      if(lower.includes('diamond')) return 'rank-border-diamond';
      if(lower.includes('platinum')) return 'rank-border-platinum';
      if(lower.includes('gold')) return 'rank-border-gold';
      if(lower.includes('silver')) return 'rank-border-silver';
      return 'rank-border-bronze';
    }
    if(typeof scoreOrTier === 'object' && scoreOrTier.id) {
      return 'rank-border-' + scoreOrTier.id;
    }
    return 'rank-border-bronze';
  }
  window.getAvatarRankBorderClass = getAvatarRankBorderClass;

  const cuteAvatarKeys = [
    'chick_yellow', 'pink_sakura', 'penguin_tux', 'panda_bamboo',
    'cat_neko', 'bunny_fluff', 'fox_kitsune', 'dragon_pyro',
    'owl_scholar', 'froggy_kero', 'astro_space', 'robo_mecha',
    'ghost_spook', 'king_royal', 'ninja_shadow', 'phoenix_blaze',
    'luffy_mugiwara', 'naruto_sage', 'tanjiro_slayer', 'nezuko_chan',
    'gojo_satoru', 'goku_saiyan', 'levi_scout', 'anya_forger'
  ];

  function sanitizeLeaderboard(list) {
    if(!Array.isArray(list)) return [];
    const seenUsers = new Set();
    const seenIds = new Set();
    const uniqueList = [];

    // Prioritaskan skor tertinggi saat memproses daftar
    const sorted = [...list].sort((a, b) => (parseInt(b.score, 10) || 0) - (parseInt(a.score, 10) || 0));

    for(const item of sorted) {
      if(!item) continue;
      const p = item;
      const isUser = !!(p.isUser || p.id === gpProfile.id || p.id === gpProfile.googleUid || (gpProfile.gamerTag && p.name === gpProfile.gamerTag));
      const uniqueKey = isUser ? 'CURRENT_USER' : (p.id || p.name);

      if(uniqueKey === 'CURRENT_USER') {
        if(seenUsers.has('CURRENT_USER')) continue; // Lewati jika akun user sudah ada (hanya ambil 1 skor terbaik)
        seenUsers.add('CURRENT_USER');
      } else {
        if(seenIds.has(uniqueKey)) continue;
        seenIds.add(uniqueKey);
      }

      let name = isUser ? (gpProfile.gamerTag || p.name || 'SkyPlayer').slice(0, 16) : ((p.name && typeof p.name === 'string') ? p.name.slice(0, 16) : 'Player');
      if(typeof window.sanitizePlayerName === 'function') name = window.sanitizePlayerName(name);
      let av = isUser ? (gpProfile.avatar || p.avatar || 'chick_yellow') : p.avatar;
      if(!isUser && (!av || !cuteAvatarKeys.includes(av))) {
        av = cuteAvatarKeys[uniqueList.length % cuteAvatarKeys.length];
      }

      uniqueList.push({
        id: isUser ? (gpProfile.googleUid || gpProfile.id) : (p.id || name),
        uid: isUser ? (gpProfile.googleUid || gpProfile.id) : (p.uid || p.id || name),
        name: name,
        score: score,
        tier: getRankTier(score).name,
        avatar: av || 'gojo_satoru',
        isUser: isUser,
        loadout: isUser ? {
          bird: progress.selected || 'classic',
          aura: progress.selectedAura || 'default',
          hat: progress.selectedHat || 'none',
          outfit: progress.selectedOutfit || 'none',
          pipe: progress.selectedPipe || 'green',
          background: progress.selectedBackground || 'sky'
        } : (p.loadout || {})
      });
    }

    return uniqueList;
  }

  // Default Leaderboard Data (Top 25 High-Scoring Dummy Champions from Master to Bronze)
  const defaultLeaderboard = [
    { rank: 1, name: 'SkyKing_God', score: 1480, tier: 'MASTER', avatar: 'gojo_satoru', loadout: { bird: 'phoenix', aura: 'galaxy', hat: 'crown', outfit: 'cape', pipe: 'gold', background: 'sunset' } },
    { rank: 2, name: 'Shadow_Slayer', score: 1290, tier: 'MASTER', avatar: 'ninja_shadow', loadout: { bird: 'shadow', aura: 'neon', hat: 'shinobi_plate', outfit: 'akatsuki_cloak', pipe: 'neon', background: 'forest' } },
    { rank: 3, name: 'CyberValkyrie_Prime', score: 1120, tier: 'MASTER', avatar: 'robo_mecha', loadout: { bird: 'cyber', aura: 'fire', hat: 'tiara', outfit: 'goldchain', pipe: 'neon', background: 'space' } },
    { rank: 4, name: 'Phoenix_Emperor', score: 960, tier: 'MASTER', avatar: 'phoenix_blaze', loadout: { bird: 'phoenix', aura: 'golden', hat: 'crown', outfit: 'cape', pipe: 'gold', background: 'sunset' } },
    { rank: 5, name: 'Goku_UltraInstinct', score: 840, tier: 'MASTER', avatar: 'goku_saiyan', loadout: { bird: 'goku_ssj', aura: 'super_saiyan', hat: 'saiyan_hair', outfit: 'goku_gi', pipe: 'torii', background: 'namek' } },
    { rank: 6, name: 'Dragon_Sovereign', score: 720, tier: 'MASTER', avatar: 'dragon_pyro', loadout: { bird: 'dragon', aura: 'fire', hat: 'crown', outfit: 'leather_jacket', pipe: 'lava', background: 'sunset' } },
    { rank: 7, name: 'GoldenFalcon_99', score: 610, tier: 'MASTER', avatar: 'king_royal', loadout: { bird: 'classic', aura: 'golden', hat: 'catears', outfit: 'kimono', pipe: 'cyber', background: 'sunset' } },
    { rank: 8, name: 'Shinobi_Hokage', score: 520, tier: 'MASTER', avatar: 'naruto_sage', loadout: { bird: 'naruto_bird', aura: 'neon', hat: 'hokage_hat', outfit: 'scout_cape', pipe: 'bamboo', background: 'konoha' } },
    { rank: 9, name: 'Levi_Ackerman', score: 450, tier: 'MASTER', avatar: 'levi_scout', loadout: { bird: 'night', aura: 'galaxy', hat: 'bandana', outfit: 'scout_cape', pipe: 'green', background: 'forest' } },
    { rank: 10, name: 'Luffy_Gear5', score: 380, tier: 'MASTER', avatar: 'luffy_mugiwara', loadout: { bird: 'luffy_bird', aura: 'rainbow', hat: 'straw_hat', outfit: 'luffy_vest', pipe: 'candy', background: 'sky' } },
    { rank: 11, name: 'SakuraWing', score: 310, tier: 'DIAMOND', avatar: 'pink_sakura', loadout: { bird: 'rose', aura: 'hearts', hat: 'flowercrown', outfit: 'princessdress', pipe: 'candy', background: 'sky' } },
    { rank: 12, name: 'FrostGuardian', score: 260, tier: 'DIAMOND', avatar: 'penguin_tux', loadout: { bird: 'classic', aura: 'bubble', hat: 'beanie', outfit: 'fairy', pipe: 'neon', background: 'space' } },
    { rank: 13, name: 'BlazeRaptor', score: 220, tier: 'DIAMOND', avatar: 'tanjiro_slayer', loadout: { bird: 'tanjiro_bird', aura: 'fire', hat: 'tanjiro_earrings', outfit: 'tanjiro_haori', pipe: 'torii', background: 'wano' } },
    { rank: 14, name: 'StarGazer_X', score: 180, tier: 'PLATINUM', avatar: 'astro_space', loadout: { bird: 'cyber', aura: 'neon', hat: 'astronaut_helmet', outfit: 'space_suit', pipe: 'neon', background: 'space' } },
    { rank: 15, name: 'NeonNinja', score: 150, tier: 'PLATINUM', avatar: 'fox_kitsune', loadout: { bird: 'night', aura: 'neon', hat: 'cowboy', outfit: 'badge', pipe: 'green', background: 'forest' } },
    { rank: 16, name: 'EchoPhantom', score: 125, tier: 'PLATINUM', avatar: 'ghost_spook', loadout: { bird: 'gojo_bird', aura: 'domain_expansion', hat: 'gojo_blindfold', outfit: 'jujutsu_coat', pipe: 'green', background: 'sunset' } },
    { rank: 17, name: 'ThunderBird_7', score: 105, tier: 'PLATINUM', avatar: 'nezuko_chan', loadout: { bird: 'mint', aura: 'rainbow', hat: 'cap', outfit: 'redtie', pipe: 'green', background: 'sky' } },
    { rank: 18, name: 'AquaFin', score: 88, tier: 'GOLD', avatar: 'froggy_kero', loadout: { bird: 'mint', aura: 'bubble', hat: 'straw_hat', outfit: 'luffy_vest', pipe: 'candy', background: 'sky' } },
    { rank: 19, name: 'MysticOwl', score: 75, tier: 'GOLD', avatar: 'owl_scholar', loadout: { bird: 'night', aura: 'galaxy', hat: 'witch', outfit: 'cape', pipe: 'cyber', background: 'space' } },
    { rank: 20, name: 'CrimsonBeak', score: 62, tier: 'GOLD', avatar: 'cat_neko', loadout: { bird: 'classic', aura: 'golden', hat: 'catears', outfit: 'kimono', pipe: 'cyber', background: 'sunset' } },
    { rank: 21, name: 'CloudChaser', score: 48, tier: 'SILVER', avatar: 'bunny_fluff', loadout: { bird: 'rose', aura: 'hearts', hat: 'chopper_hat', outfit: 'hoodie', pipe: 'candy', background: 'sky' } },
    { rank: 22, name: 'SolarFlare_88', score: 38, tier: 'SILVER', avatar: 'panda_bamboo', loadout: { bird: 'classic', aura: 'none', hat: 'none', outfit: 'scarf', pipe: 'green', background: 'sky' } },
    { rank: 23, name: 'VortexWing', score: 28, tier: 'SILVER', avatar: 'anya_forger', loadout: { bird: 'cyber', aura: 'none', hat: 'cap', outfit: 'badge', pipe: 'neon', background: 'space' } },
    { rank: 24, name: 'VelvetCrow', score: 19, tier: 'BRONZE', avatar: 'chick_yellow', loadout: { bird: 'night', aura: 'none', hat: 'none', outfit: 'none', pipe: 'green', background: 'forest' } },
    { rank: 25, name: 'SwiftSparrow', score: 10, tier: 'BRONZE', avatar: 'froggy_kero', loadout: { bird: 'classic', aura: 'none', hat: 'none', outfit: 'none', pipe: 'green', background: 'sky' } }
  ];

  let leaderboardData = sanitizeLeaderboard(storage.get('skyFlappyLeaderboard_v7', defaultLeaderboard));
  if(!leaderboardData || leaderboardData.length < 25) {
    leaderboardData = sanitizeLeaderboard([...defaultLeaderboard]);
    storage.set('skyFlappyLeaderboard_v7', leaderboardData);
  }

  let selectedSpotlightPlayer = leaderboardData[0];
  let championShowcaseRunning = false;
  let championParticles = [];
  let championTrailTimer = 0;

  function submitRankedScore(s) {
    if(!gpProfile.isLoggedIn) return;
    const tier = getRankTier(s);
    const primaryKey = getPrimaryAccountKey();
    
    // Cari index entri user saat ini secara spesifik menggunakan Primary Key
    let existingIndex = leaderboardData.findIndex(p => p.isUser || p.primaryKey === primaryKey || p.id === primaryKey || (gpProfile.googleUid && p.uid === gpProfile.googleUid) || p.name === gpProfile.gamerTag);
    const userEntry = {
      isUser: true,
      primaryKey: primaryKey,
      id: primaryKey,
      uid: gpProfile.googleUid || '',
      name: gpProfile.gamerTag,
      score: Math.max(s, rankedBest),
      tier: tier.name,
      avatar: gpProfile.avatar,
      loadout: {
        bird: progress.selected || 'classic',
        baby: progress.selectedBaby || 'classic_duo',
        aura: progress.selectedAura || 'default',
        hat: progress.selectedHat || 'none',
        outfit: progress.selectedOutfit || 'none',
        pipe: progress.selectedPipe || 'green',
        background: progress.selectedBackground || 'sky'
      }
    };

    if(existingIndex >= 0) {
      if(userEntry.score >= leaderboardData[existingIndex].score) {
        leaderboardData[existingIndex] = userEntry;
      } else {
        leaderboardData[existingIndex].name = userEntry.name;
        leaderboardData[existingIndex].avatar = userEntry.avatar;
        leaderboardData[existingIndex].loadout = userEntry.loadout;
        leaderboardData[existingIndex].primaryKey = primaryKey;
      }
    } else {
      leaderboardData.push(userEntry);
    }

    leaderboardData = sanitizeLeaderboard(leaderboardData);
    leaderboardData.sort((a, b) => b.score - a.score);
    leaderboardData.forEach((p, i) => p.rank = i + 1);

    storage.set('skyFlappyLeaderboard_v6', leaderboardData);
    storage.set('skyFlappyLeaderboard', leaderboardData);

    // Kirim Skor Tertinggi ke Firebase Firestore Global Leaderboard dengan Primary Key
    if(window.FirebaseLeaderboard && typeof window.FirebaseLeaderboard.submitScore === 'function') {
      window.FirebaseLeaderboard.submitScore(userEntry);
    }
  }

  // Sinkronisasi Real-time Global Leaderboard dari Firebase Firestore
  function syncLeaderboardFromFirebase() {
    if(!window.FirebaseLeaderboard || typeof window.FirebaseLeaderboard.listenToLeaderboard !== 'function') return;

    window.FirebaseLeaderboard.listenToLeaderboard(remoteScores => {
      if(Array.isArray(remoteScores) && remoteScores.length > 0) {
        const merged = [];
        const seenKeys = new Set();
        const userUid = gpProfile.googleUid || gpProfile.id;
        let currentUserAdded = false;

        // 1. Masukkan pemain dari Firebase dengan deduplikasi akun ketat
        remoteScores.forEach(r => {
          if(r && (r.name || r.id)) {
            const isMe = !!(
              (userUid && (r.uid === userUid || r.id === 'user_' + userUid || r.id === userUid)) ||
              (gpProfile.gamerTag && r.name === gpProfile.gamerTag)
            );

            if(isMe) {
              if(!currentUserAdded) {
                currentUserAdded = true;
                merged.push({
                  ...r,
                  id: userUid,
                  uid: userUid,
                  name: gpProfile.gamerTag || r.name,
                  avatar: gpProfile.avatar || r.avatar || 'chick_yellow',
                  score: Math.max(r.score || 0, rankedBest || 0),
                  isUser: true
                });
              }
            } else {
              const accountKey = r.uid || r.id || r.name;
              if(!seenKeys.has(accountKey) && !seenKeys.has(r.name)) {
                seenKeys.add(accountKey);
                seenKeys.add(r.name);
                merged.push({
                  ...r,
                  isUser: false
                });
              }
            }
          }
        });

        // 2. Tambahkan entri pemain saat ini jika belum masuk query Firebase
        if(!currentUserAdded && gpProfile && gpProfile.gamerTag && rankedBest > 0) {
          merged.push({
            isUser: true,
            id: userUid,
            uid: userUid,
            name: gpProfile.gamerTag,
            score: rankedBest,
            tier: getRankTier(rankedBest).name,
            avatar: gpProfile.avatar || 'chick_yellow',
            loadout: {
              bird: progress.selected || 'classic',
              baby: progress.selectedBaby || 'classic_duo',
              aura: progress.selectedAura || 'default',
              hat: progress.selectedHat || 'none',
              outfit: progress.selectedOutfit || 'none',
              pipe: progress.selectedPipe || 'green',
              background: progress.selectedBackground || 'sky'
            }
          });
        }

        // 3. Tambahkan default bot jika daftar masih sedikit (< 12 pemain)
        defaultLeaderboard.forEach(d => {
          if(!seenKeys.has(d.name) && merged.length < 12) {
            seenKeys.add(d.name);
            merged.push(d);
          }
        });

        leaderboardData = sanitizeLeaderboard(merged);
        leaderboardData.sort((a, b) => b.score - a.score);
        leaderboardData.forEach((p, i) => p.rank = i + 1);

        storage.set('skyFlappyLeaderboard_v6', leaderboardData);
        storage.set('skyFlappyLeaderboard', leaderboardData);

        if(el.rankedModal && !el.rankedModal.classList.contains('hidden')) {
          if(activeLeaderboardTab === 'global') {
            renderLeaderboardList();
            startChampionSpotlight(selectedSpotlightPlayer || leaderboardData[0]);
          } else {
            renderTiersProgressView();
          }
        }
      }
    });
  }

  function updateMenuRankedUI() {
    const isRanked = currentMode === 'ranked';
    const tier = getRankTier(rankedBest);

    // 1. Icon pada tombol [RANKED] di Mode Selector
    if(el.modeRankPillIcon) {
      el.modeRankPillIcon.innerHTML = tier.iconSvg;
    }

    // 2. Tag Rank pada tombol LEADERBOARD & GOOGLE PLAY
    if(el.btnTierTag) {
      el.btnTierTag.innerHTML = `<span class="tier-icon-inline">${tier.iconSvg}</span> ${tier.name}`;
      el.btnTierTag.style.color = tier.color;
    }
    if(el.gpMenuTierBadge) {
      el.gpMenuTierBadge.innerHTML = `<span class="tier-icon-inline">${tier.iconSvg}</span> ${tier.name}`;
      el.gpMenuTierBadge.style.color = tier.color;
    }

    // 3. Status di baris bawah BEST SCORE
    if(el.menuBestTierBadge) {
      if(isRanked) {
        const nextInfo = tier.nextTier ? `(${tier.pointsToNext} pts lagi ke ${tier.nextTier.name})` : '(MAX TIER)';
        el.menuBestTierBadge.innerHTML = `• <span class="tier-icon-inline">${tier.iconSvg}</span> <b style="color:${tier.color}">${tier.name}</b> <span style="font-size:9px;color:#94a3b8">${nextInfo}</span>`;
        el.menuBestTierBadge.style.display = 'inline-flex';
      } else {
        el.menuBestTierBadge.style.display = 'none';
      }
    }

    // 4. Kartu Banner Rank Utama
    if(el.menuRankedCard) {
      el.menuRankedCard.classList.toggle('hidden', !isRanked);
      if(isRanked) {
        if(el.menuRankIcon) el.menuRankIcon.innerHTML = tier.iconSvg;
        if(el.menuRankTitle) {
          el.menuRankTitle.textContent = tier.name + ' TIER';
          el.menuRankTitle.style.color = tier.color;
        }
        if(el.menuRankSub) {
          el.menuRankSub.innerHTML = `Ranked Best: <b>${rankedBest} pts</b>`;
        }
        if(el.menuRankCurPts && el.menuRankTargetPts && el.menuRankFill) {
          if(tier.nextTier) {
            el.menuRankCurPts.textContent = `${tier.score} / ${tier.nextTier.minScore} PTS`;
            el.menuRankTargetPts.textContent = `${tier.pointsToNext} Poin lagi ke ${tier.nextTier.name}!`;
          } else {
            el.menuRankCurPts.textContent = `${tier.score} PTS`;
            el.menuRankTargetPts.textContent = `MAX SUPREME TIER!`;
          }
          el.menuRankFill.style.width = `${tier.progressPercent}%`;
        }
      }
    }
  }

  function setMode(mode, silent = false) {
    currentMode = mode;
    if(!silent) audio.click();
    if(el.modeClassicBtn) el.modeClassicBtn.classList.toggle('active', mode === 'classic');
    if(el.modeRankedBtn) el.modeRankedBtn.classList.toggle('active', mode === 'ranked');
    if(el.modeMultiplayerBtn) el.modeMultiplayerBtn.classList.toggle('active', mode === 'multiplayer');

    const modeNameEl = $('mlbbCurrentModeName');
    const modeIconEl = $('mlbbModeTagIcon');
    const startModeLabelEl = $('mlbbStartBtnModeLabel');

    if(mode === 'multiplayer') {
      if(modeNameEl) modeNameEl.textContent = 'MULTIPLAYER';
      if(modeIconEl) modeIconEl.textContent = '';
      if(startModeLabelEl) startModeLabelEl.textContent = '1v1 BATTLE';
      if(el.playBtn) el.playBtn.innerHTML = `<div class="start-btn-shine"></div><div class="start-btn-text-wrap"><span class="start-btn-label">TANDING</span><span class="start-btn-mode">MULTIPLAYER</span></div><span class="start-btn-arrow">▶</span>`;
      if(el.modeBestLabel) el.modeBestLabel.textContent = 'MULTIPLAYER';
    } else if(mode === 'ranked') {
      if(modeNameEl) modeNameEl.textContent = 'RANKED';
      if(modeIconEl) modeIconEl.textContent = '';
      if(startModeLabelEl) startModeLabelEl.textContent = 'EXTREME PTS';
      if(el.playBtn) el.playBtn.innerHTML = `<div class="start-btn-shine"></div><div class="start-btn-text-wrap"><span class="start-btn-label">MAIN RANK</span><span class="start-btn-mode">EXTREME</span></div><span class="start-btn-arrow">▶</span>`;
      if(el.modeBestLabel) el.modeBestLabel.textContent = 'RANKED BEST';
    } else {
      if(modeNameEl) modeNameEl.textContent = 'CLASSIC';
      if(modeIconEl) modeIconEl.textContent = '';
      if(startModeLabelEl) startModeLabelEl.textContent = 'CASUAL';
      if(el.playBtn) el.playBtn.innerHTML = `<div class="start-btn-shine"></div><div class="start-btn-text-wrap"><span class="start-btn-label">MULAI</span><span class="start-btn-mode">CLASSIC</span></div><span class="start-btn-arrow">▶</span>`;
      if(el.modeBestLabel) el.modeBestLabel.textContent = 'CLASSIC BEST';
    }
    
    // Highlight active card in Mode Selection Drawer
    const cClassic = $('cardModeClassic');
    const cRanked = $('cardModeRanked');
    const cMp = $('cardModeMultiplayer');
    if(cClassic) cClassic.classList.toggle('active', mode === 'classic');
    if(cRanked) cRanked.classList.toggle('active', mode === 'ranked');
    if(cMp) cMp.classList.toggle('active', mode === 'multiplayer');

    // Update indie mode pills
    const pClassic = $('modePillClassic');
    const pRanked = $('modePillRanked');
    const pMp = $('modePillMp');
    if(pClassic) pClassic.classList.toggle('active', mode === 'classic');
    if(pRanked) pRanked.classList.toggle('active', mode === 'ranked');
    if(pMp) pMp.classList.toggle('active', mode === 'multiplayer');

    const playWord = document.querySelector('.indie-hero-play-btn .play-word');
    if(playWord) {
      if(mode === 'multiplayer') playWord.textContent = '1v1 BATTLE';
      else if(mode === 'ranked') playWord.textContent = 'MAIN RANKED';
      else playWord.textContent = 'MAIN SEKARANG';
    }

    const statClassic = $('mlbbClassicBestStat');
    if(statClassic) statClassic.textContent = progress.highScore || 0;
    const statRanked = $('mlbbRankedPtsStat');
    if(statRanked) statRanked.textContent = `${gpProfile.rankedBest || progress.rankedScore || 0} PTS`;

    // Tombol Leaderboard SELALU tampil di semua mode permainan
    if(el.rankedLeaderboardBtn) {
      el.rankedLeaderboardBtn.classList.remove('hidden');
      el.rankedLeaderboardBtn.style.display = 'flex';
    }

    if(mode !== 'multiplayer') {
      if(typeof stopSearchingRadar === 'function') stopSearchingRadar();
      if(window.multiplayerEngine && window.multiplayerEngine.matchStatus === 'QUEUED') {
        window.multiplayerEngine.cancelMatch();
      }
    }

    updateMenuRankedUI();
    updateScore();
    syncSettings();
  }

  function startChampionSpotlight(player) {
    selectedSpotlightPlayer = player || leaderboardData[0];
    updateChampionDetailsUI(selectedSpotlightPlayer);
    if(championShowcaseRunning) return;
    championShowcaseRunning = true;
    championParticles = [];
    requestAnimationFrame(renderChampionPortraitFrame);
  }

  function stopChampionSpotlight() {
    championShowcaseRunning = false;
  }

  function switchFriendProfileTab(tabName) {
    const isOverview = tabName === 'overview';
    const tabOverBtn = $('fpTabOverviewBtn');
    const tabStatsBtn = $('fpTabStatsBtn');
    const panelOver = $('fpTabOverview');
    const panelStats = $('fpTabStats');

    if(tabOverBtn) tabOverBtn.classList.toggle('active', isOverview);
    if(tabStatsBtn) tabStatsBtn.classList.toggle('active', !isOverview);
    if(panelOver) {
      panelOver.classList.toggle('hidden', !isOverview);
      panelOver.classList.toggle('active', isOverview);
    }
    if(panelStats) {
      panelStats.classList.toggle('hidden', isOverview);
      panelStats.classList.toggle('active', !isOverview);
    }
  }
  window.switchFriendProfileTab = switchFriendProfileTab;

  function handleAddFriend(player) {
    if(!player) return;
    const friendKey = player.friendKey || player.id || ('usr_' + Math.abs(hashCode(player.name || 'bot')));
    const pScore = player.score || player.rankedBest || 0;
    const pTier = (player.tier && player.tier.name) ? player.tier.name : (typeof getRankTier === 'function' ? getRankTier(pScore).name : 'BRONZE I');
    const friendObj = {
      friendKey: friendKey,
      name: player.name || 'Gamer',
      avatar: player.avatar || 'chick_yellow',
      tier: player.tier || pTier,
      score: pScore,
      status: 'online',
      isBot: Boolean(player.isBot)
    };

    if(window.socialService) {
      if(!Array.isArray(window.socialService.friends)) window.socialService.friends = [];
      if(!window.socialService.friends.some(f => f.friendKey === friendKey || f.name === friendObj.name)) {
        window.socialService.friends.unshift(friendObj);
        if(typeof window.socialService.renderFriendList === 'function') window.socialService.renderFriendList();
        if(typeof window.socialService.renderLobbyFriendsPreview === 'function') window.socialService.renderLobbyFriendsPreview();
      }
      if(window.socialService.db && player.friendKey && !player.isBot) {
        window.socialService.sendFriendRequest(player.friendKey, player.name, player.avatar, player.tier).catch(() => {});
      }
    }

    if(audio && audio.coin) audio.coin();
    if(typeof showGameDialog === 'function') {
      showGameDialog({
        title: 'TEMAN DITAMBAHKAN',
        html: `<b>${player.name || 'Pemain'}</b> berhasil ditambahkan ke daftar Teman kamu! Sekarang kamu bisa melihat profil dan mengajaknya bermain kapan saja.`,
        type: 'success',
        confirmText: 'MANTAP!'
      });
    } else if(typeof showToast === 'function') {
      showToast(`✓ Berhasil berteman dengan ${player.name || 'Pemain'}!`);
    }

    const addBtn = $('fpAddFriendBtn');
    if(addBtn) {
      addBtn.textContent = '✓ Berteman';
      addBtn.style.background = '#166534';
      addBtn.style.borderColor = '#4ade80';
      addBtn.style.color = '#86efac';
      addBtn.disabled = true;
    }
  }
  window.handleAddFriend = handleAddFriend;

  function openLeaderboardPlayerProfile(player) {
    if(!player) return;
    if(audio && audio.click) audio.click();
    const modal = $('friendProfileModal');
    if(!modal) return;

    // Reset to overview tab
    switchFriendProfileTab('overview');

    const pScore = player.score || 0;
    const pTier = getRankTier(pScore);
    const lo = player.loadout || {};

    const elAv = $('fpAvatarBox');
    const elName = $('fpName');
    const elRank = $('fpRankBadge');
    const elUid = $('fpUid');

    if(elAv) {
      elAv.innerHTML = getCuteAvatarSvg(player.avatar || 'chick_yellow', 44);
      elAv.className = 'friend-profile-avatar-box ' + getAvatarRankBorderClass(pScore);
    }

    const rawPName = player.name || 'Gamer';
    if(elName) elName.textContent = typeof window.sanitizePlayerName === 'function' ? window.sanitizePlayerName(rawPName) : rawPName;
    if(elRank) {
      elRank.textContent = `${pTier.name} TIER`;
      elRank.style.color = pTier.color;
    }
    if(elUid) elUid.textContent = `ID: ${player.id || 'usr_' + Math.abs(hashCode(player.name || 'bot'))}`;

    // Career Statistics (Tab 2)
    const elCasual = $('fpCasualScore');
    const elRankPts = $('fpRankPoints');
    const elMp = $('fpMpWins');
    const elCoins = $('fpCoins');

    if(elCasual) elCasual.textContent = Math.round(pScore * 0.85);
    if(elRankPts) elRankPts.textContent = `${pScore} PTS`;
    if(elMp) elMp.textContent = `${Math.max(1, Math.round(pScore / 30))} MENANG`;
    if(elCoins) elCoins.textContent = `${pScore * 14 + 280}`;

    // Cosmetics collection counts (Tab 2)
    if($('fpSkinCount')) $('fpSkinCount').textContent = `${Math.min(8, Math.max(1, Math.round(pScore / 25)))} Dimiliki`;
    if($('fpPetCount')) $('fpPetCount').textContent = `${Math.min(6, Math.max(0, Math.round(pScore / 35)))} Dimiliki`;
    if($('fpHatCount')) $('fpHatCount').textContent = `${Math.min(10, Math.max(0, Math.round(pScore / 20)))} Dimiliki`;
    if($('fpAuraCount')) $('fpAuraCount').textContent = `${Math.min(6, Math.max(0, Math.round(pScore / 40)))} Dimiliki`;

    // Loadout names (Tab 1)
    const fmt = (v, d) => (v && v !== 'none') ? String(v).replace(/[-_]+/g, ' ').toUpperCase() : d;
    if($('fpEquippedBird')) $('fpEquippedBird').textContent = fmt(lo.bird, 'CLASSIC');
    if($('fpEquippedPet')) $('fpEquippedPet').textContent = fmt(lo.pet, 'NONE');
    if($('fpEquippedHat')) $('fpEquippedHat').textContent = fmt(lo.hat, 'NONE');
    if($('fpEquippedAura')) $('fpEquippedAura').textContent = fmt(lo.aura, 'NONE');

    // Live animated showcase canvas in profile modal
    if(typeof startFriendShowcase === 'function') {
      startFriendShowcase({
        bird: lo.bird || 'classic',
        pet: lo.pet || 'none',
        hat: lo.hat || 'none',
        outfit: lo.outfit || 'none',
        aura: lo.aura || 'none',
        background: lo.background || 'sunset',
        pipe: lo.pipe || 'green'
      }, 'fpShowcaseCanvas');
    }

    // Action buttons configuration
    const isAlreadyFriend = window.socialService && Array.isArray(window.socialService.friends) && window.socialService.friends.some(f => f.friendKey === (player.id || player.friendKey) || f.name === player.name);

    const addBtn = $('fpAddFriendBtn');
    const chatBtn = $('fpChatBtn');
    const inviteBtn = $('fpInviteBtn');
    const removeBtn = $('fpRemoveBtn');

    if(isAlreadyFriend) {
      if(addBtn) addBtn.style.display = 'none';
      if(chatBtn) {
        chatBtn.style.display = 'inline-flex';
        chatBtn.onclick = () => {
          if(window.socialService) window.socialService.openDirectChat(player);
        };
      }
      if(removeBtn) {
        removeBtn.style.display = 'inline-flex';
        removeBtn.onclick = async () => {
          let safePlayerName = player.name || 'Teman';
          if(typeof window.sanitizePlayerName === 'function') safePlayerName = window.sanitizePlayerName(safePlayerName);
          const ok = await showGameDialog({
            title: 'Hapus Teman',
            html: `<p>Apakah Anda yakin ingin menghapus <b>${safePlayerName}</b> dari pertemanan?</p>`,
            type: 'warning',
            confirmText: 'YA, HAPUS',
            cancelText: 'BATAL'
          });
          if(ok) {
            if(window.socialService) window.socialService.removeFriend(player.id || player.friendKey);
            closeModal();
          }
        };
      }
    } else {
      if(addBtn) {
        addBtn.style.display = 'inline-flex';
        addBtn.textContent = '+ Tambah Teman';
        addBtn.disabled = false;
        addBtn.style.background = 'linear-gradient(180deg,#22c55e 0%,#16a34a 100%)';
        addBtn.style.borderColor = '#4ade80';
        addBtn.style.color = '#fff';
        addBtn.onclick = () => {
          handleAddFriend(player);
        };
      }
      if(chatBtn) chatBtn.style.display = 'none';
      if(removeBtn) removeBtn.style.display = 'none';
    }

    if(inviteBtn) {
      inviteBtn.style.display = 'inline-flex';
      inviteBtn.onclick = () => {
        if(audio) audio.click();
        if(typeof showToast === 'function') {
          showToast(`Undangan duel 1v1 terkirim ke ${player.name || 'Pemain'}!`);
        }
        if(el.multiplayerModal && typeof showModal === 'function') {
          showModal(el.multiplayerModal);
        }
      };
    }

    // Wire tab buttons
    if($('fpTabOverviewBtn')) $('fpTabOverviewBtn').onclick = () => { if(audio) audio.click(); switchFriendProfileTab('overview'); };
    if($('fpTabStatsBtn')) $('fpTabStatsBtn').onclick = () => { if(audio) audio.click(); switchFriendProfileTab('stats'); };

    showModal(modal);
  }

  function updateChampionDetailsUI(p) {
    if(!p || !el.championGamerTag) return;
    const rankNum = p.rank || (leaderboardData.findIndex(x => x.name === p.name) + 1) || 1;
    el.championGamerTag.textContent = p.name;
    el.championScore.textContent = p.score;
    if(el.championTier) {
      el.championTier.textContent = p.tier || getRankTier(p.score).name;
      el.championTier.classList.add('hidden');
    }
    if(el.spotlightTitle) {
      el.spotlightTitle.textContent = rankNum === 1 ? '#1 WORLD CHAMPION' : '#' + rankNum + ' RANKED SPOTLIGHT';
    }

    const viewBtn = $('championViewProfileBtn');
    if(viewBtn) {
      viewBtn.onclick = (e) => {
        e.stopPropagation();
        openLeaderboardPlayerProfile(p);
      };
    }

    const lo = p.loadout || {};
    const skinName = (skins[lo.bird] || skins.classic).name;
    const hatName  = (hats[lo.hat] || hats.none).name;
    const outfitName = (outfits[lo.outfit] || outfits.none).name;

    // Hanya tampilkan Burung, Topi (Hat), dan Aksesori (Outfit)
    let tagsHtml = '';
    tagsHtml += `<span class="cl-tag skin">SKIN: ${skinName}</span>`;
    if(lo.hat && lo.hat !== 'none') tagsHtml += `<span class="cl-tag hat">HAT: ${hatName}</span>`;
    if(lo.outfit && lo.outfit !== 'none') tagsHtml += `<span class="cl-tag outfit">OUTFIT: ${outfitName}</span>`;

    el.championLoadoutTags.innerHTML = tagsHtml;
  }

  let activeLeaderboardTab = 'global';

  function switchLeaderboardTab(tab) {
    activeLeaderboardTab = tab;
    if(el.lbTabGlobalBtn) el.lbTabGlobalBtn.classList.toggle('active', tab === 'global');
    if(el.lbTabTiersBtn) el.lbTabTiersBtn.classList.toggle('active', tab === 'tiers');
    if(el.lbGlobalView) el.lbGlobalView.classList.toggle('hidden', tab !== 'global');
    if(el.lbTiersView) el.lbTiersView.classList.toggle('hidden', tab !== 'tiers');

    if(tab === 'global') {
      renderLeaderboardList();
      startChampionSpotlight(selectedSpotlightPlayer || leaderboardData[0]);
    } else {
      updateRankedLeaderboardUI();
      stopChampionSpotlight();
    }
  }

  // Update Dynamic Ranked Leaderboard & Spotlight Top 1 Player
  function updateRankedLeaderboardUI() {
    if(!el.rankedModal) return;
    const tier = getRankTier(rankedBest);

    // 0. Update Top Rank 1 Master Preview Banner (Tab 2)
    leaderboardData = sanitizeLeaderboard(leaderboardData);
    const rankSorted = [...leaderboardData].sort((a, b) => {
      const tA = getRankTier(a.score);
      const tB = getRankTier(b.score);
      if(tB.minScore !== tA.minScore) return tB.minScore - tA.minScore;
      return b.score - a.score;
    });
    const topMaster = rankSorted[0] || leaderboardData[0];
    const topMasterTier = getRankTier(topMaster.score);

    const elTrAv = $('trMasterAvatar');
    const elTrName = $('trMasterName');
    const elTrTier = $('trMasterTier');
    const elTrBtn = $('trMasterProfileBtn');

    if(elTrAv) elTrAv.innerHTML = getCuteAvatarSvg(topMaster.avatar, 26);
    const rawTmName = topMaster.name || 'Master';
    if(elTrName) elTrName.textContent = typeof window.sanitizePlayerName === 'function' ? window.sanitizePlayerName(rawTmName) : rawTmName;
    if(elTrTier) {
      elTrTier.innerHTML = `<span class="tier-icon-inline">${topMasterTier.iconSvg}</span> ${topMasterTier.name} TIER (${topMaster.score} PTS)`;
      elTrTier.style.color = topMasterTier.color;
    }
    if(elTrBtn) {
      elTrBtn.onclick = () => {
        openLeaderboardPlayerProfile(topMaster);
      };
    }

    // 1. Render My Personal Rank Progression Card
    let nextInfo = '';
    if(tier.nextTier) {
      nextInfo = `<span><b>${tier.score}</b> / ${tier.nextTier.minScore} PTS</span><span><b>${tier.pointsToNext}</b> POIN LAGI KE ${tier.nextTier.name}!</span>`;
    } else {
      nextInfo = `<span><b>${tier.score}</b> PTS</span><span><b>MAX SUPREME TIER!</b></span>`;
    }

    el.myRankCard.innerHTML = `
      <div class="rank-card-top">
        <div class="rank-card-badge">${tier.iconSvg}</div>
        <div class="rank-card-info">
          <div class="rank-card-title" style="color:${tier.color}">${tier.name} TIER</div>
          <div class="rank-card-subtitle">Player: <b>${gpProfile.gamerTag}</b> • Best: <b>${rankedBest} pts</b></div>
        </div>
      </div>
      <div class="rank-progress-wrap">
        <div class="rank-progress-labels">
          ${nextInfo}
        </div>
        <div class="rank-progress-bar">
          <div class="rank-progress-fill" style="width: ${tier.progressPercent}%;"></div>
        </div>
      </div>
    `;

    // 2. Render Top 25 Highest Rank Tiers Leaderboard (Hanya Rank/Tier, Tanpa Score)
    if(el.leaderboardRankList) {
      const top25Ranks = rankSorted.slice(0, 25);

      let rankHtml = '';
      top25Ranks.forEach((p, idx) => {
        const rankNum = idx + 1;
        const rankClass = rankNum === 1 ? 'gold' : rankNum === 2 ? 'silver' : rankNum === 3 ? 'bronze' : '';
        const rankBadge = rankNum === 1 ? '#1' : rankNum === 2 ? '#2' : rankNum === 3 ? '#3' : `#${rankNum}`;
        const userClass = p.isUser ? ' user-row' : '';
        const playerTier = getRankTier(p.score);
        const borderClass = getAvatarRankBorderClass(p.score);

        rankHtml += `
          <div class="lb-row${userClass}" data-player-name="${p.name}" style="cursor:pointer;" title="Klik untuk lihat profil ${p.name}">
            <span class="lb-rank ${rankClass}">${rankBadge}</span>
            <span class="lb-player"><span class="lb-av-circle ${borderClass}">${getCuteAvatarSvg(p.avatar, 24)}</span> ${typeof window.sanitizePlayerName === 'function' ? window.sanitizePlayerName(p.name) : p.name}</span>
            <span class="lb-tier" style="color: ${playerTier.color}; justify-content: flex-end;">
              <span class="tier-icon-inline">${playerTier.iconSvg}</span>
              ${playerTier.name}
            </span>
          </div>
        `;
      });
      el.leaderboardRankList.innerHTML = rankHtml;

      el.leaderboardRankList.querySelectorAll('.lb-row').forEach(row => {
        row.onclick = () => {
          const pName = row.dataset.playerName;
          const player = leaderboardData.find(p => p.name === pName);
          if(player) openLeaderboardPlayerProfile(player);
        };
      });
    }
  }

  function renderTierRoadmap() {
    const tier = getRankTier(rankedBest);

    // 1. My Personal Rank Status Banner Inside Roadmap Modal
    if(el.modalMyTierCard) {
      const nextInfo = tier.nextTier ? `
        <span><b>${tier.score}</b> / ${tier.nextTier.minScore} PTS</span>
        <span style="color:#fde047">${tier.pointsToNext} Poin lagi ke ${tier.nextTier.name}!</span>
      ` : `
        <span><b>${tier.score}</b> PTS</span>
        <span style="color:#fde047">MAX SUPREME TIER!</span>
      `;
      el.modalMyTierCard.innerHTML = `
        <div class="my-rank-card" style="margin-bottom:0;">
          <div class="rank-card-header">
            <div class="rank-card-badge">${tier.iconSvg}</div>
            <div class="rank-card-info">
              <div class="rank-card-title" style="color:${tier.color}">${tier.name} TIER</div>
              <div class="rank-card-subtitle">Player: <b>${gpProfile.gamerTag}</b> • Ranked Best: <b>${rankedBest} pts</b></div>
            </div>
          </div>
          <div class="rank-progress-wrap">
            <div class="rank-progress-labels">
              ${nextInfo}
            </div>
            <div class="rank-progress-bar">
              <div class="rank-progress-fill" style="width: ${tier.progressPercent}%;"></div>
            </div>
          </div>
        </div>
      `;
    }

    // 2. All 7 Tiers Roadmap List with Target Points
    if(el.tiersGuideList) {
      let ladderHtml = '';
      rankTiers.forEach(t => {
        const isCurrent = t.id === tier.id;
        const ptsLabel = t.maxScore >= 99999 ? `${t.minScore}+ POIN` : `${t.minScore} - ${t.maxScore} POIN`;
        ladderHtml += `
          <div class="tier-guide-item${isCurrent ? ' current-tier' : ''}">
            <div class="tier-guide-icon">${t.iconSvg}</div>
            <div class="tier-guide-info">
              <div class="tier-guide-name" style="color: ${t.color}">
                ${t.name} TIER
                ${isCurrent ? '<span class="tier-guide-badge-active">RANK SAYA</span>' : ''}
              </div>
              <div class="tier-guide-pts">Target Poin: <b>${ptsLabel}</b></div>
            </div>
          </div>
        `;
      });
      el.tiersGuideList.innerHTML = ladderHtml;
    }
  }

  function renderLeaderboardList() {
    if(!el.leaderboardList) return;
    leaderboardData = sanitizeLeaderboard(leaderboardData);
    leaderboardData.sort((a, b) => b.score - a.score);
    leaderboardData.forEach((p, i) => p.rank = i + 1);

    const top25Points = leaderboardData.slice(0, 25);

    let html = '';
    top25Points.forEach(p => {
      const isTop1 = p.rank === 1;
      const rankClass = isTop1 ? 'gold' : p.rank === 2 ? 'silver' : p.rank === 3 ? 'bronze' : '';
      const rankBadge = isTop1 ? '#1' : p.rank === 2 ? '#2' : p.rank === 3 ? '#3' : `#${p.rank}`;
      const activeClass = (selectedSpotlightPlayer && selectedSpotlightPlayer.name === p.name) ? ' active-spotlight' : '';
      const userClass = p.isUser ? ' user-row' : '';
      const borderClass = getAvatarRankBorderClass(p.score);

      html += `
        <div class="lb-row${activeClass}${userClass}" data-player-name="${p.name}">
          <span class="lb-rank ${rankClass}">${rankBadge}</span>
          <span class="lb-player"><span class="lb-av-circle ${borderClass}">${getCuteAvatarSvg(p.avatar, 24)}</span> ${typeof window.sanitizePlayerName === 'function' ? window.sanitizePlayerName(p.name) : p.name}</span>
          <span class="lb-score">${p.score}</span>
        </div>
      `;
    });

    el.leaderboardList.innerHTML = html;

    el.leaderboardList.querySelectorAll('.lb-row').forEach(row => {
      row.onclick = () => {
        const pName = row.dataset.playerName;
        const player = leaderboardData.find(p => p.name === pName);
        if(player) {
          if(audio && audio.click) audio.click();
          startChampionSpotlight(player);
          openLeaderboardPlayerProfile(player);
          renderLeaderboardList();
        }
      };
    });
  }

  function renderChampionPortraitFrame() {
    if(!championShowcaseRunning || !el.championCanvas) return;
    // Dynamically match internal resolution to CSS display size so it is NEVER squished or gepeng
    if(el.championCanvas.clientWidth > 0 && (el.championCanvas.width !== el.championCanvas.clientWidth || el.championCanvas.height !== el.championCanvas.clientHeight)) {
      el.championCanvas.width = el.championCanvas.clientWidth;
      el.championCanvas.height = el.championCanvas.clientHeight;
    }
    const cCtx = el.championCanvas.getContext('2d');
    const cW = el.championCanvas.width, cH = el.championCanvas.height;
    const p = selectedSpotlightPlayer || leaderboardData[0];
    const lo = p.loadout || {};

    // 1. Background Sky Gradient
    const bg = backgrounds[lo.background] || backgrounds.sunset || backgrounds.sky;
    const sky = cCtx.createLinearGradient(0, 0, 0, cH);
    sky.addColorStop(0, bg.top);
    sky.addColorStop(1, bg.bottom);
    cCtx.fillStyle = sky;
    cCtx.fillRect(0, 0, cW, cH);

    // Mini Clouds
    const now = performance.now();
    const cloud1X = ((now / 65) % (cW + 60)) - 30;
    cCtx.fillStyle = 'rgba(255,255,255,0.4)';
    cCtx.beginPath();
    cCtx.arc(cloud1X, 16, 10, 0, 7);
    cCtx.arc(cloud1X + 10, 13, 13, 0, 7);
    cCtx.arc(cloud1X + 22, 16, 9, 0, 7);
    cCtx.fill();

    // Mini Hills
    cCtx.fillStyle = bg.hill;
    cCtx.beginPath();
    cCtx.moveTo(0, cH - 18);
    for(let x = 0; x <= cW; x += 35) cCtx.quadraticCurveTo(x + 18, cH - 32 + (x % 70 ? 8 : 0), x + 35, cH - 18);
    cCtx.lineTo(cW, cH);
    cCtx.lineTo(0, cH);
    cCtx.fill();

    // Mini Ground
    cCtx.fillStyle = '#46b65c';
    cCtx.fillRect(0, cH - 18, cW, 4);
    cCtx.fillStyle = '#b57a45';
    cCtx.fillRect(0, cH - 14, cW, 14);

    // 2. Mini Pipe Showcase on Right Side
    const pipeSkin = pipeSkins[lo.pipe] || pipeSkins.gold || pipeSkins.green;
    const pX = cW - 48, pW = 24, gapY = 14, gapSize = 34, cap = 4;
    cCtx.save();
    cCtx.fillStyle = pipeSkin.body;
    rrTo(cCtx, pX, 0, pW, gapY - cap, 2);
    rrTo(cCtx, pX, gapY + gapSize + cap, pW, cH - (gapY + gapSize + cap) - 14, 2);
    cCtx.fillStyle = pipeSkin.cap;
    rrTo(cCtx, pX - 2, gapY - cap, pW + 4, cap, 2);
    rrTo(cCtx, pX - 2, gapY + gapSize, pW + 4, cap, 2);
    cCtx.restore();

    // Centered bird coordinates with natural idle flight bobbing
    const bX = Math.round(cW * 0.44);
    const bY = Math.round(cH * 0.48) + Math.sin(now / 220) * 3.5;

    // 3. Aura Trail Particles
    championTrailTimer += 0.033;
    if(championTrailTimer > 0.045) {
      championTrailTimer = 0;
      const auraId = lo.aura || 'galaxy';
      const colors = auraId === 'fire' ? ['#ff3b00', '#ffd000'] :
                     auraId === 'rainbow' ? ['hsl(' + ((now * 0.5) % 360) + ', 100%, 65%)'] :
                     auraId === 'galaxy' ? ['#c77dff', '#48cae4'] :
                     auraId === 'neon' ? ['#00f5d4', '#fee440'] :
                     auraId === 'bubble' ? ['#a0e7e5'] :
                     auraId === 'hearts' ? ['#ff4d6d', '#ff758f'] :
                     auraId === 'golden' ? ['#ffd700', '#fff066'] : ['#ffd74c'];
      const col = colors[Math.floor(Math.random() * colors.length)];
      championParticles.push({
        x: bX - 16, y: bY + 3 + (Math.random() - .5) * 6,
        vx: -60 - Math.random() * 30, vy: (Math.random() - .5) * 20,
        life: 0.45, maxLife: 0.45, color: col, size: 3.5 + Math.random() * 3,
        type: auraId === 'fire' ? 'flame' : auraId === 'bubble' ? 'bubble' : auraId === 'hearts' ? 'heart' : auraId === 'golden' ? 'coin' : 'star'
      });
    }

    for(const q of championParticles) {
      q.x += q.vx * 0.033;
      q.y += q.vy * 0.033;
      q.life -= 0.033;
      drawAuraParticleTo(cCtx, q);
    }
    championParticles = championParticles.filter(q => q.life > 0);

    // 4. Bird Render (Champion Loadout)
    const bAngle = Math.sin(now / 220) * 0.05;
    const bWing = Math.sin(now / 110) > 0 ? 0.2 : 0;
    renderCustomBird(cCtx, {
      x: bX, y: bY, angle: bAngle, wing: bWing,
      skinId: lo.bird || 'phoenix',
      hatId: lo.hat || 'crown',
      outfitId: lo.outfit || 'cape',
      opacity: 1
    });

    // 5. Radiant Golden Portrait Lighting & Spotlight Beams
    cCtx.save();
    const spotGrad = cCtx.createRadialGradient(bX, bY, 10, bX, bY, 75);
    spotGrad.addColorStop(0, 'rgba(254, 240, 138, 0.22)');
    spotGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.08)');
    spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    cCtx.fillStyle = spotGrad;
    cCtx.beginPath();
    cCtx.arc(bX, bY, 75, 0, Math.PI * 2);
    cCtx.fill();

    // Camera Blitz Glints across the canvas
    function drawGlint(gx, gy, gr) {
      cCtx.fillStyle = '#ffffff';
      cCtx.beginPath();
      cCtx.arc(gx, gy, gr, 0, Math.PI * 2);
      cCtx.fill();
    }
    drawGlint(35 + Math.sin(now / 300) * 10, 25, 2.5);
    drawGlint(cW - 35, cH - 28 + Math.cos(now / 350) * 6, 2.5);
    cCtx.restore();

    requestAnimationFrame(renderChampionPortraitFrame);
  }

  function showModal(modal) {
    if(!modal) return;
    const modalEl = typeof modal === 'string' ? $(modal) : (modal instanceof HTMLElement ? modal : $(modal?.id));
    if(!modalEl) return;
    const layer = el.layer || $('modalLayer');
    if(layer) {
      layer.classList.remove('hidden');
      document.querySelectorAll('.modal').forEach(x => {
        x.classList.add('hidden');
        x.style.display = 'none';
      });
    }
    modalEl.classList.remove('hidden');
    modalEl.style.display = 'flex';
  }
  function closeModal() {
    if(audio && typeof audio.stopPreview === 'function') audio.stopPreview();
    if(typeof stopShopShowcase === 'function') stopShopShowcase();
    if(typeof stopChampionSpotlight === 'function') stopChampionSpotlight();
    if(typeof stopFriendShowcase === 'function') stopFriendShowcase();
    const layer = el.layer || $('modalLayer');
    if(layer) {
      layer.classList.add('hidden');
      document.querySelectorAll('.modal').forEach(x => {
        x.classList.add('hidden');
        x.style.display = 'none';
      });
    }
    const dialog = el.gameDialogModal || $('gameDialogModal');
    if(dialog) { dialog.classList.add('hidden'); dialog.style.display = 'none'; }
    const mpModal = el.multiplayerModal || $('multiplayerModal');
    if(mpModal) { mpModal.classList.add('hidden'); mpModal.style.display = 'none'; }
    const reviveModal = el.reviveModal || $('reviveModal');
    if(reviveModal) { reviveModal.classList.add('hidden'); reviveModal.style.display = 'none'; }

    if (activeDialogResolver) {
      const res = activeDialogResolver;
      activeDialogResolver = null;
      res(true);
    }
  }
  window.showModal = showModal;
  window.closeModal = closeModal;

  const modalLayerEl = $('modalLayer');
  if(modalLayerEl) {
    modalLayerEl.addEventListener('click', (e) => {
      if(e.target === modalLayerEl) {
        // DILARANG menutup jika sedang di modal Revive (Continue), Game Dialog, atau Game Over!
        if(el.reviveModal && !el.reviveModal.classList.contains('hidden')) return;
        if(el.gameDialogModal && !el.gameDialogModal.classList.contains('hidden')) return;
        if(el.over && !el.over.classList.contains('hidden')) return;
        closeModal();
      }
    });
  }
  // =========================================================
  // SMART AUTO-REFRESH & UPDATE DETECTOR (v19.0)
  // Auto detects new versions deployed on GitHub Pages.
  // NEVER refreshes during active gameplay (only in Lobby/Menu).
  // =========================================================
  const GAME_VERSION = '20.70';
  let pendingUpdateAvailable = false;
  let isUpdatingNow = false;

  function showUpdateNotification(msg) {
    let notif = document.getElementById('autoUpdateToast');
    if(!notif) {
      notif = document.createElement('div');
      notif.id = 'autoUpdateToast';
      notif.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#0284c7,#0369a1);border:1.5px solid #38bdf8;color:#fff;padding:8px 16px;border-radius:99px;font:900 12px/1.4 Trebuchet MS,Arial,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,0.8),0 0 16px rgba(56,189,248,0.5);z-index:9999999;display:flex;align-items:center;gap:8px;animation:modalIn .25s ease-out;pointer-events:none;';
      document.body.appendChild(notif);
    }
    notif.innerHTML = `<span>${msg}</span>`;
  }

  async function checkForGameUpdate() {
    if(isUpdatingNow) return;
    try {
      const res = await fetch(`version.json?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      if(!res.ok) return;
      const data = await res.json();
      if(data && data.version && data.version !== GAME_VERSION) {
        if(state === State.MENU) {
          isUpdatingNow = true;
          showUpdateNotification(`Versi baru v${data.version} terdeteksi! Memuat pembaruan...`);
          try { sessionStorage.setItem('feather_skip_splash', '1'); } catch(e){}
          setTimeout(() => {
            window.location.reload(true);
          }, 1200);
        } else {
          // Jangan ganggu pemain yang sedang aktif bermain
          pendingUpdateAvailable = true;
        }
      }
    } catch(err) {
      // Offline or fetch failed, silently ignore
    }
  }

  // Cek update saat kembali ke MENU / LOBBY
  function checkPendingUpdateOnMenu() {
    if(pendingUpdateAvailable && !isUpdatingNow) {
      isUpdatingNow = true;
      showUpdateNotification('Game selesai! Menerapkan versi terbaru...');
      try { sessionStorage.setItem('feather_skip_splash', '1'); } catch(e){}
      setTimeout(() => {
        window.location.reload(true);
      }, 1000);
    }
  }

  // Interval pengecekan otomatis setiap 3 jam (10800000 ms) & saat tab aktif
  setInterval(checkForGameUpdate, 10800000);
  window.addEventListener('focus', checkForGameUpdate);
  document.addEventListener('visibilitychange', () => {
    if(document.visibilityState === 'visible') checkForGameUpdate();
  });

  function setState(next) {
    state = next;
    if(next === State.MENU) {
      checkPendingUpdateOnMenu();
    }
    el.menu.classList.toggle('hidden', next !== State.MENU);
    el.ready.classList.toggle('hidden', next !== State.READY || currentMode === 'multiplayer');
    el.hud.classList.toggle('hidden', next === State.MENU);
    if(el.topProfileBtn) el.topProfileBtn.classList.toggle('hidden', next !== State.MENU);
    const leftDock = $('mlbbLeftDock');
    const rightDock = $('mlbbRightDock');
    const coinPill = $('topCoinPill');
    const rankPill = $('topRankPill');
    const lbBtn = $('rankedLeaderboardBtn');

    if(leftDock) leftDock.classList.toggle('hidden', next !== State.MENU);
    if(rightDock) rightDock.classList.toggle('hidden', next !== State.MENU);
    if(coinPill) coinPill.classList.toggle('hidden', next !== State.MENU);
    if(rankPill) rankPill.classList.toggle('hidden', next !== State.MENU);
    if(lbBtn) lbBtn.classList.toggle('hidden', next !== State.MENU);

    if(currentMode === 'ranked') {
      el.coinHud.innerHTML = 'RANKED MATCH <b>EXTREME</b>';
      if(el.rankTierHud) {
        const tier = getRankTier(rankedBest);
        el.rankTierHud.innerHTML = `<span class="tier-hud-icon">${tier.iconSvg}</span> <span>${tier.name}</span>`;
        el.rankTierHud.classList.remove('hidden');
      }
      if(el.mpBattleHud) el.mpBattleHud.classList.add('hidden');
    } else if(currentMode === 'multiplayer') {
      el.coinHud.innerHTML = '1v1 BATTLE <b>ARENA</b>';
      if(el.rankTierHud) el.rankTierHud.classList.add('hidden');
      if(el.livesHud) el.livesHud.innerHTML = '';
      updateMpBattleHUD();
    } else {
      el.coinHud.innerHTML = 'COINS <b>' + progress.coins + '</b>';
      if(el.rankTierHud) el.rankTierHud.classList.add('hidden');
      if(el.mpBattleHud) el.mpBattleHud.classList.add('hidden');
    }
    if(el.pause) {
      const showPause = (next === State.PLAYING || next === State.READY) && currentMode !== 'multiplayer';
      el.pause.style.display = showPause ? 'flex' : 'none';
      el.pause.classList.toggle('hidden', !showPause);
    }
    if(el.sound) {
      el.sound.style.display = (next === State.MENU || next === State.PLAYING || next === State.READY) ? 'flex' : 'none';
    }
    updateDashUI();
    updateMenuRankedUI();
    updatePowerupHUD();
    if(settings.music) {
      audio.music();
      if(next === State.PLAYING) playBackgroundMusic();
      else if(next === State.MENU) stopBackgroundMusic();
    }
  }

  function getBattleHeartSvg(isActive) {
    if(isActive) {
      return `<svg viewBox="0 0 24 24" width="13" height="13" style="filter:drop-shadow(0 0 3px rgba(239, 68, 68, 0.8));"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ef4444" stroke="#b91c1c" stroke-width="1.2"/></svg>`;
    } else {
      return `<svg viewBox="0 0 24 24" width="13" height="13"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#334155" stroke="#1e293b" stroke-width="1.2"/></svg>`;
    }
  }

  function updateMpBattleHUD() {
    if(!el.mpBattleHud) return;
    const isMpActive = currentMode === 'multiplayer' && (state === State.PLAYING || state === State.READY);
    el.mpBattleHud.classList.toggle('hidden', !isMpActive);
    
    const mp = window.multiplayerEngine;
    if(!isMpActive || !mp) {
      if(el.mpRaceProgressBarWrap) el.mpRaceProgressBarWrap.classList.add('hidden');
      if(el.mpMultiPlayersHud) el.mpMultiPlayersHud.classList.add('hidden');
      return;
    }

    const isRaceMode = mp.gameMode === 'race';
    const isMultiP = (mp.maxPlayers > 2) || (mp.opponents && mp.opponents.size > 1);

    // 1. Race Mode Progress Bar Updates
    if(el.mpRaceProgressBarWrap) {
      el.mpRaceProgressBarWrap.classList.toggle('hidden', !isRaceMode);
      if(isRaceMode) {
        const targetScore = mp.raceTargetScore || 30;
        if(el.mpRaceTargetText) el.mpRaceTargetText.textContent = `FINISH: ${targetScore} PTS`;
        const myPct = Math.min(100, Math.max(0, (score / targetScore) * 100));
        if(el.mpRaceFill) el.mpRaceFill.style.width = `${myPct}%`;
        if(el.mpRaceMyPin) el.mpRaceMyPin.style.left = `${myPct}%`;

        let highestOppScore = 0;
        let highestOpponent = null;
        mp.opponents.forEach(op => {
          if((op.score || 0) > highestOppScore) {
            highestOppScore = op.score || 0;
            highestOpponent = op;
          }
        });
        const oppPct = Math.min(100, Math.max(0, (highestOppScore / targetScore) * 100));
        if(el.mpRaceRivalPin) el.mpRaceRivalPin.style.left = `${oppPct}%`;

        // Check Victory in Race Mode:
        if(score >= targetScore && state === State.PLAYING) {
          showMpBattleResult(true, score, highestOppScore, highestOpponent || { name: 'Rival', avatar: 'robo_mecha', score: highestOppScore });
          return;
        }
        if(highestOppScore >= targetScore && state === State.PLAYING) {
          showMpBattleResult(false, score, highestOppScore, highestOpponent || { name: 'Rival', avatar: 'robo_mecha', score: highestOppScore });
          return;
        }
      }
    }

    // 2. Multi-Player Live Leaderboard (3P / 4P) vs 2P Duel Cards
    if(isMultiP) {
      if(el.mpRivalHudCard) el.mpRivalHudCard.classList.add('hidden');
      if(el.mpMultiPlayersHud) {
        el.mpMultiPlayersHud.classList.remove('hidden');
        
        // Build and sort participant list
        const participants = [
          { name: gpProfile.gamerTag || 'YOU', avatar: gpProfile.avatar || 'chick_yellow', score, isAlive: bird.isAlive, isMe: true },
          ...Array.from(mp.opponents.values())
        ].sort((a, b) => (b.score || 0) - (a.score || 0));

        const rows = [
          { row: el.mpMultiHudRow1, av: el.mpMultiAvatar1, nm: el.mpMultiName1, sc: el.mpMultiScore1 },
          { row: el.mpMultiHudRow2, av: el.mpMultiAvatar2, nm: el.mpMultiName2, sc: el.mpMultiScore2 },
          { row: el.mpMultiHudRow3, av: el.mpMultiAvatar3, nm: el.mpMultiName3, sc: el.mpMultiScore3 },
          { row: el.mpMultiHudRow4, av: el.mpMultiAvatar4, nm: el.mpMultiName4, sc: el.mpMultiScore4 }
        ];

        rows.forEach((r, idx) => {
          if(!r.row) return;
          const p = participants[idx];
          if(p) {
            r.row.classList.remove('hidden');
            if(r.av) r.av.innerHTML = getCuteAvatarSvg(p.avatar, 20);
            if(r.nm) r.nm.textContent = (p.name || `P${idx+1}`).slice(0, 8) + (p.isMe ? ' (YOU)' : '');
            if(r.sc) r.sc.textContent = p.score || 0;
            r.row.style.opacity = p.isAlive !== false ? '1' : '0.4';
          } else {
            r.row.classList.add('hidden');
          }
        });
      }
    } else {
      if(el.mpMultiPlayersHud) el.mpMultiPlayersHud.classList.add('hidden');
      if(el.mpRivalHudCard) el.mpRivalHudCard.classList.remove('hidden');

      // 1v1 Player & Rival Info Cards
      if(el.mpMyHudName) el.mpMyHudName.textContent = gpProfile.gamerTag || 'YOU';
      const myTier = getRankTier(rankedBest || 0);
      if(el.mpMyHudAvatar) {
        el.mpMyHudAvatar.innerHTML = getCuteAvatarSvg(gpProfile.avatar, 30);
        el.mpMyHudAvatar.className = 'mp-hud-avatar ' + getAvatarRankBorderClass(myTier);
      }
      if(el.mpMyHudTier) el.mpMyHudTier.textContent = myTier.name || 'GOLD';
      if(el.mpMyHudScore) el.mpMyHudScore.textContent = score;

      if(el.mpMyHudHearts) {
        let heartsHtml = '';
        for(let i = 0; i < 3; i++) {
          heartsHtml += `<span class="mp-heart ${i < lives ? 'active' : 'lost'}">${getBattleHeartSvg(i < lives)}</span>`;
        }
        el.mpMyHudHearts.innerHTML = heartsHtml;
      }

      const rivalProfile = mp?.currentRoom?.playersList?.find(p => p.id !== mp?.localPlayerId);
      const rival = mp?.opponents?.values()?.next()?.value || rivalProfile || { name: 'Rival', avatar: 'robo_mecha', tier: 'MASTER', score: 0, lives: 3 };
      const rName = rival.name || rivalProfile?.name || 'Rival';
      const rAvatar = rival.avatar || rivalProfile?.avatar || 'robo_mecha';
      const rTier = rival.tier || rivalProfile?.tier || 'MASTER';

      if(el.mpRivalHudName) el.mpRivalHudName.textContent = rName.slice(0, 10);
      if(el.mpRivalHudAvatar) {
        el.mpRivalHudAvatar.innerHTML = getCuteAvatarSvg(rAvatar, 30);
        el.mpRivalHudAvatar.className = 'mp-hud-avatar rival ' + getAvatarRankBorderClass(rTier);
      }
      if(el.mpRivalHudTier) el.mpRivalHudTier.textContent = rTier;
      if(el.mpRivalHudScore) el.mpRivalHudScore.textContent = rival.score || 0;

      if(el.mpRivalHudHearts) {
        const rLives = rival.lives !== undefined ? rival.lives : (rival.isAlive ? 3 : 0);
        let rHeartsHtml = '';
        for(let i = 0; i < 3; i++) {
          rHeartsHtml += `<span class="mp-heart ${i < rLives ? 'active' : 'lost'}">${getBattleHeartSvg(i < rLives)}</span>`;
        }
        el.mpRivalHudHearts.innerHTML = rHeartsHtml;
      }
    }
  }

  function updateLivesHUD() {
    if(!el.livesHud) return;
    if(currentMode === 'multiplayer' || (state !== State.PLAYING && state !== State.READY && state !== State.REVIVING)) {
      el.livesHud.innerHTML = '';
      return;
    }
    const maxDisplay = currentMode === 'ranked' ? Math.max(3, lives) : Math.max(1, lives);
    let html = '';
    for(let i = 0; i < maxDisplay; i++) {
      if(i < lives) {
        html += `<span class="life-heart${i >= (currentMode === 'ranked' ? 3 : 1) ? ' bonus' : ''}"><svg viewBox="0 0 24 24" width="18" height="18" style="display:inline-block;vertical-align:middle;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ef4444" stroke="#b91c1c" stroke-width="1.2"/></svg></span>`;
      } else {
        html += `<span class="life-heart lost"><svg viewBox="0 0 24 24" width="18" height="18" style="display:inline-block;vertical-align:middle;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#334155" stroke="#1e293b" stroke-width="1.2"/></svg></span>`;
      }
    }
    el.livesHud.innerHTML = html;
  }

  let reviveInputAllowed = true;

  function getReviveCost() {
    return 20 * Math.pow(2, reviveCount);
  }

  function promptRevive() {
    if(state === State.OVER || state === State.REVIVING || currentMode === 'multiplayer') {
      endGame();
      return;
    }
    state = State.REVIVING;
    audio.stopMusic();
    stopBackgroundMusic();
    audio.hit();

    // Proteksi 350ms agar ketukan cepat saat main tidak langsung memicu tombol secara tidak sengaja
    reviveInputAllowed = false;
    setTimeout(() => {
      reviveInputAllowed = true;
    }, 350);

    const cost = getReviveCost();
    if(el.reviveCostLabel) {
      el.reviveCostLabel.textContent = cost + ' COINS (SALDO: ' + progress.coins + ')';
    }
    if(el.reviveConfirmBtn) {
      el.reviveConfirmBtn.innerHTML = `<span>REVIVE (${cost} COINS)</span>`;
      el.reviveConfirmBtn.style.opacity = progress.coins >= cost ? '1' : '0.55';
    }

    showModal(el.reviveModal);

    reviveSecondsLeft = 5;
    if(el.reviveCountdownText) el.reviveCountdownText.textContent = '5';
    if(el.reviveTimerRing) {
      el.reviveTimerRing.style.strokeDashoffset = '0';
    }

    clearInterval(reviveTimerInterval);
    const totalCirc = 113.1; // 2 * PI * 18
    reviveTimerInterval = setInterval(() => {
      reviveSecondsLeft -= 1;
      if(el.reviveCountdownText) el.reviveCountdownText.textContent = String(reviveSecondsLeft);
      if(el.reviveTimerRing) {
        const offset = totalCirc * (1 - (reviveSecondsLeft / 5));
        el.reviveTimerRing.style.strokeDashoffset = String(offset);
      }
      if(settings.sound && reviveSecondsLeft > 0) {
        audio.playTone(880, 0.05, 'triangle', 0.02, 0);
      }
      if(reviveSecondsLeft <= 0) {
        clearInterval(reviveTimerInterval);
        reviveTimerInterval = null;
        giveUpRevive();
      }
    }, 1000);
  }

  function executeRevive() {
    const cost = getReviveCost();
    if(progress.coins < cost) {
      audio.hit();
      shake = 0.2;
      floatingTexts.push({
        x: W / 2, y: H / 2 - 40,
        text: 'KOIN TIDAK CUKUP!',
        color: '#ef4444', vy: -50, life: 0.85, maxLife: 0.85
      });
      return;
    }

    clearInterval(reviveTimerInterval);
    reviveTimerInterval = null;

    // Deduct coins & double price for next revive in this run
    progress.coins -= cost;
    reviveCount++;
    updateCoins();
    persistProgress();

    // Close revive modal completely
    closeModal();

    // Restore Lives: Ranked mode -> 3 lives, Classic mode -> 1 life
    lives = currentMode === 'ranked' ? 3 : 1;

    // Clear immediate danger: push nearby pipes ahead and vaporize enemies across the widescreen
    pipes.forEach(p => {
      if(p.x > bird.x - 100 && p.x < bird.x + 520) {
        p.x += 520;
      }
    });
    enemies.forEach(e => {
      if(e.x > bird.x - 100 && e.x < bird.x + 360) {
        e.dead = true;
        e.x = -999;
      }
    });
    flyers.forEach(f => {
      if(f.x > bird.x - 100 && f.x < bird.x + 360) {
        f.dead = true;
        f.x = -999;
      }
    });
    stormClouds.forEach(c => {
      c.phase = 'fade';
      c.timer = 0.01;
    });

    // Reset Bird safely to the center of the 360px landscape screen
    bird.x = 130;
    bird.y = 150;
    bird.vy = -180;
    bird.angle = 0;
    bird.dead = false;

    // Grant 3.0s Grace Invulnerability & Shield
    graceTimer = 3.0;
    activePowerups.shield = true;
    activePowerups.shieldCount = 1;
    activePowerups.shieldType = 'standard';

    audio.revive();
    audio.music();
    playBackgroundMusic();

    floatingTexts.push({
      x: bird.x, y: bird.y - 25,
      text: 'HEROIC REVIVE!',
      color: '#ec4899', vy: -65, life: 0.95, maxLife: 0.95
    });
    makeParticles(bird.x, bird.y, 30, '#ec4899');
    makeParticles(bird.x, bird.y, 20, '#ffd700');
    makeParticles(bird.x, bird.y, 15, '#ffffff');

    updateLivesHUD();
    updatePowerupHUD();
    setState(State.PLAYING);
  }

  function giveUpRevive() {
    clearInterval(reviveTimerInterval);
    reviveTimerInterval = null;
    closeModal();
    endGame();
  }

  function reset() {
    if(score > 0) {
      recordCurrentScore(score);
    }
    score = 0; pipes = []; coins = []; flyers = []; particles = [];
    powerups = []; enemies = []; stormClouds = [];
    shockwaves = []; floatingTexts = [];
    raceMissiles = []; raceTraps = []; raceBombs = []; raceTornadoes = [];
    isRespawningRace = false; raceRespawnTimer = 0;
    activePowerups.shield = false;
    activePowerups.magnet = 0;
    activePowerups.slow = 0;
    activePowerups.star = 0;
    activePowerups.rocket = 0;
    dashCooldown = 0;
    dashTimer = 0;
    dashAfterimages = [];
    graceTimer = 0;
    spawn = 0; flyerSpawn = 0; trailSpawn = 0;
    powerupSpawnTimer = 0; enemySpawnTimer = 0; cloudSpawnTimer = 0;
    groundX = 0; shake = 0; started = false; lastGapY = 150;
    if(el.over) { el.over.classList.add('hidden'); el.over.classList.remove('visible'); }
    if(el.mpOverModal) el.mpOverModal.classList.add('hidden');
    if(el.reviveModal) el.reviveModal.classList.add('hidden');
    clearInterval(reviveTimerInterval);
    reviveTimerInterval = null;

    // Inisialisasi Nyawa (Ranked: 3 nyawa, Multiplayer: 3 nyawa, Classic: 1 nyawa)
    lives = (currentMode === 'ranked' || currentMode === 'multiplayer') ? 3 : 1;
    if(progress.selectedBooster === 'extra_life' && currentMode !== 'multiplayer') {
      lives += 1;
    }
    reviveCount = 0;
    mpBattleResultShown = false;

    Object.assign(bird, { x:130, y:150, vy:0, wing:0, angle:0, dead:false });
    resetBabyBirds();
    updateScore();
    updateLivesHUD();
    updateMpBattleHUD();
    updatePowerupHUD();
    updateDashUI();
  }

  // Active Dash Skill UI & Execution (With Race Mode Hold to Nitro Boost)
  let isHoldingDash = false;
  let nitroHoldAudioTimer = 0;

  function updateDashUI() {
    if(!el.dashBtn) return;
    const isPlayingOrReady = state === State.PLAYING || state === State.READY;
    el.dashBtn.classList.toggle('hidden', !isPlayingOrReady);

    if(!isPlayingOrReady) return;

    const isRaceMode = currentMode === 'multiplayer' && window.multiplayerEngine && window.multiplayerEngine.gameMode === 'race';
    el.dashBtn.classList.toggle('race-nitro-mode', !!isRaceMode);

    if(isRaceMode) {
      el.dashBtn.classList.remove('cooldown');
      el.dashBtn.classList.add('ready');
      el.dashBtn.classList.toggle('holding', !!isHoldingDash);

      const keyHint = el.dashBtn.querySelector('.dash-key-hint');
      if(keyHint) keyHint.textContent = 'TAHAN (HOLD)';

      if(el.dashCooldownText) {
        el.dashCooldownText.textContent = isHoldingDash ? 'BOOSTING!' : 'NITRO BOOST';
      }
      if(el.dashRingProgress) {
        el.dashRingProgress.style.strokeDashoffset = '0';
      }
      return;
    }

    el.dashBtn.classList.remove('race-nitro-mode', 'holding');
    const keyHint = el.dashBtn.querySelector('.dash-key-hint');
    if(keyHint) keyHint.textContent = 'SHIFT / D';

    const isReady = dashCooldown <= 0;
    el.dashBtn.classList.toggle('ready', isReady);
    el.dashBtn.classList.toggle('cooldown', !isReady);

    if(el.dashCooldownText) {
      el.dashCooldownText.textContent = isReady ? 'READY' : dashCooldown.toFixed(1) + 's';
    }

    if(el.dashRingProgress) {
      const circ = 125.6; // 2 * PI * 20
      const maxCd = getDashMaxCd();
      const progressRatio = isReady ? 1 : Math.max(0, Math.min(1, 1 - (dashCooldown / maxCd)));
      const offset = circ * (1 - progressRatio);
      el.dashRingProgress.style.strokeDashoffset = String(offset);
    }
  }

  function getDashMaxCd() {
    if(currentMode === 'multiplayer' && window.multiplayerEngine && window.multiplayerEngine.gameMode === 'race') {
      return 0.05; // Mode Race: Unlimited & Instant Dash!
    }
    return (progress.selectedPet === 'kuro_void') ? 2.5 : 4.5;
  }

  function triggerDash() {
    if(state !== State.PLAYING && state !== State.READY) return;
    if(currentMode === 'multiplayer' && !started) return; // Kunci input selama hitung mundur in-game arena
    if(dashCooldown > 0 && !(currentMode === 'multiplayer' && window.multiplayerEngine && window.multiplayerEngine.gameMode === 'race')) {
      audio.hit();
      return;
    }

    if(state === State.READY) {
      started = true;
      if(window.multiplayerEngine) window.multiplayerEngine.matchStatus = 'PLAYING';
      setState(State.PLAYING);
      audio.music();
      playBackgroundMusic();
      if(progress.selectedBooster && progress.selectedBooster !== 'none') {
        activatePowerup(progress.selectedBooster, bird.x, bird.y, true);
      }
    }

    dashCooldown = getDashMaxCd();
    dashTimer = 0.28;
    graceTimer = Math.max(graceTimer, 0.45);
    bird.vy = Math.min(bird.vy, -130);
    bird.wing = 0.22;
    audio.dash();
    shake = 0.22;

    const isShadow = progress.selectedPet === 'kuro_void';
    shockwaves.push({
      x: bird.x, y: bird.y, r: 10, maxR: 95,
      color: isShadow ? '#a855f7' : '#38bdf8',
      life: 0.45, maxLife: 0.45
    });

    floatingTexts.push({
      x: bird.x + 15, y: bird.y - 20,
      text: isShadow ? 'SHADOW DASH!' : 'WARP DASH!',
      color: isShadow ? '#c084fc' : '#38bdf8',
      vy: -70,
      life: 0.75, maxLife: 0.75
    });

    makeParticles(bird.x, bird.y, 22, isShadow ? '#a855f7' : '#38bdf8');
    makeParticles(bird.x - 18, bird.y, 16, isShadow ? '#7e22ce' : '#fde047');
    updateDashUI();
  }

  function goReady() {
    audio.click();
    closeModal();
    if(currentMode === 'multiplayer') {
      startMultiplayerGameWithArenaCountdown();
      return;
    }
    if(typeof stopSearchingRadar === 'function') stopSearchingRadar();
    if(window.multiplayerEngine && window.multiplayerEngine.matchStatus === 'QUEUED') {
      window.multiplayerEngine.cancelMatch();
    }
    reset();
    setState(State.READY);
  }

  let arenaCountdownInterval = null;

  function startMultiplayerGameWithArenaCountdown() {
    closeModal();
    reset();
    setState(State.READY);
    started = false;

    if(arenaCountdownInterval) {
      clearInterval(arenaCountdownInterval);
      arenaCountdownInterval = null;
    }

    if(el.arenaCountdownOverlay) {
      el.arenaCountdownOverlay.classList.remove('hidden');
    }
    if(el.arenaCountdownNumber) {
      el.arenaCountdownNumber.className = 'arena-countdown-number num-3';
      el.arenaCountdownNumber.textContent = '3';
    }
    try { audio.countdownBeep(3); } catch(_) {}

    let count = 3;
    arenaCountdownInterval = setInterval(() => {
      count--;
      if(count === 2) {
        if(el.arenaCountdownNumber) {
          el.arenaCountdownNumber.className = 'arena-countdown-number num-2';
          el.arenaCountdownNumber.textContent = '2';
        }
        try { audio.countdownBeep(2); } catch(_) {}
      } else if(count === 1) {
        if(el.arenaCountdownNumber) {
          el.arenaCountdownNumber.className = 'arena-countdown-number num-1';
          el.arenaCountdownNumber.textContent = '1';
        }
        try { audio.countdownBeep(1); } catch(_) {}
      } else if(count === 0) {
        if(el.arenaCountdownNumber) {
          el.arenaCountdownNumber.className = 'arena-countdown-number num-go';
          el.arenaCountdownNumber.textContent = 'GO!';
        }
        try { audio.countdownGo(); } catch(_) {}
      } else {
        clearInterval(arenaCountdownInterval);
        arenaCountdownInterval = null;
        if(el.arenaCountdownOverlay) el.arenaCountdownOverlay.classList.add('hidden');

        // Launch Game & Fly
        started = true;
        if (window.multiplayerEngine) window.multiplayerEngine.matchStatus = 'PLAYING';
        setState(State.PLAYING);
        bird.vy = -280;
        bird.wing = 0.22;
        makeParticles(bird.x - 12, bird.y, 4, '#fff5b2');
        audio.music();
        playBackgroundMusic();
        if(progress.selectedBooster && progress.selectedBooster !== 'none') {
          activatePowerup(progress.selectedBooster, bird.x, bird.y, true);
        }
      }
    }, 850);
  }
  function flap() {
    if(state === State.MENU || state === State.OVER || state === State.PAUSED || state === State.REVIVING) return;
    if(currentMode === 'multiplayer' && !started) return; // Kunci flap selama hitung mundur in-game arena
    if(state === State.READY) {
      started = true;
      if(window.multiplayerEngine) window.multiplayerEngine.matchStatus = 'PLAYING';
      setState(State.PLAYING);
      audio.music();
      playBackgroundMusic();
      // Aktifkan Starter Booster yang dibeli/dipilih dari Shop seketika saat mulai terbang!
      if(progress.selectedBooster && progress.selectedBooster !== 'none') {
        activatePowerup(progress.selectedBooster, bird.x, bird.y, true);
      }
    }
    bird.vy = -310;
    bird.wing = .18;
    makeParticles(bird.x - 12, bird.y, 4, '#fff5b2');
    audio.flap();
  }
  function getRandomFloat() {
    if(currentMode === 'multiplayer' && window.multiplayerEngine) {
      return window.multiplayerEngine.random();
    }
    return Math.random();
  }

  function makePipe() {
    const isRanked = currentMode === 'ranked' || currentMode === 'multiplayer';
    const d = isRanked ? 'extreme' : settings.difficulty;
    const level = Math.floor(score / 5);
    const gapBase = isRanked ? 104 : (d === 'easy' ? 136 : d === 'hard' ? 112 : 122);
    const minGap = isRanked ? 82 : (d === 'easy' ? 95 : d === 'hard' ? 84 : 88);
    let gap = Math.max(minGap, gapBase - level * (isRanked ? 4 : 3));
    if(progress.selectedPet === 'blaze_ember') {
      gap += 16; // Phoenix pipe gap expander
    }
    const margin = isRanked ? 40 : 48;
    const max = H - GROUND - gap - margin;
    let y = margin + getRandomFloat() * (max - margin);
    y = Math.max(margin, Math.min(max, (y + lastGapY) / 2 + (getRandomFloat() - .5) * (isRanked ? 75 : 55)));
    lastGapY = y;
    const pipe = { x: W + 28, gapY: y, gapSize: gap, w: 56, passed: false };
    pipes.push(pipe);

    // Cek apakah Skill Power-up muncul di celah tiang ini (Di mode Multiplayer hampir tiap pipa selalu ada item!)
    let powerupInterval = 6.5;
    if(currentMode === 'multiplayer') {
      powerupInterval = 0.7;
    } else if(isRanked) {
      powerupInterval = Math.max(8.0, 14.0 - Math.min(score, 100) * 0.05);
    } else {
      powerupInterval = Math.max(6.5, 12.0 - Math.min(score, 100) * 0.05);
    }
    const shouldSpawnPowerup = currentMode === 'multiplayer' ? (powerupSpawnTimer > powerupInterval && getRandomFloat() < 0.95) : (powerupSpawnTimer > powerupInterval && getRandomFloat() < 0.85);

    if(shouldSpawnPowerup) {
      powerupSpawnTimer = 0;
      const rand = getRandomFloat();
      let type = 'shield';
      if(currentMode === 'multiplayer') {
        // Multiplayer (Race & Survival): 9 Variasi Senjata & Booster Keren!
        // Zap 14%, Missile 14%, Bomb 14%, Tornado 12%, Freeze 10%, Rocket 12%, Star 8%, Shield 10%, Trap 8%
        if(rand < 0.14) type = 'zap';
        else if(rand < 0.28) type = 'missile';
        else if(rand < 0.42) type = 'bomb';
        else if(rand < 0.54) type = 'tornado';
        else if(rand < 0.64) type = 'freeze';
        else if(rand < 0.76) type = 'rocket';
        else if(rand < 0.84) type = 'star';
        else if(rand < 0.92) type = 'shield';
        else type = 'trap';
      } else {
        // Singleplayer: Shield 22%, Magnet 20%, Slow Time 16%, Star 14%, Rocket NOS 14%, Extra Life Heart 14%
        type = rand < 0.22 ? 'shield' : rand < 0.42 ? 'magnet' : rand < 0.58 ? 'slow' : rand < 0.72 ? 'star' : rand < 0.86 ? 'rocket' : 'heart';
      }
      powerups.push({
        x: pipe.x + pipe.w / 2,
        y: pipe.gapY + pipe.gapSize / 2,
        r: 15,
        type,
        bob: 0,
        rot: 0
      });
    } else if(!isRanked && currentMode !== 'multiplayer' && getRandomFloat() < 0.75) {
      // Koin HANYA muncul di Mode Classic, Mode Ranked Extreme & Multiplayer TIDAK ADA KOIN!
      coins.push({
        x: pipe.x + pipe.w / 2,
        y: pipe.gapY + pipe.gapSize / 2,
        r: 11,
        spin: getRandomFloat() * Math.PI * 2
      });
    }
  }
  function makeFlyer() { flyers.push({ x: W + 35, y: 125 + Math.random() * (H - GROUND - 205), r: 15, wing: Math.random() * 6, speed: 1.05 + Math.random() * .18 }); }
  function recordCurrentScore(s) {
    if(typeof s !== 'number' || s <= 0) return;
    if(currentMode === 'ranked') {
      if(s > rankedBest) {
        rankedBest = s;
        best = rankedBest;
        storage.set('skyFlappyRankedBest', rankedBest);
        progress.rankedScore = Math.max(progress.rankedScore || 0, rankedBest);
        gpProfile.rankedBest = Math.max(gpProfile.rankedBest || 0, rankedBest);
        persistProgress();
        saveGPProfile();
      }
    } else if(currentMode !== 'multiplayer') {
      if(s > classicBest) {
        classicBest = s;
        best = classicBest;
        storage.set('skyFlappyClassicBest', classicBest);
        storage.set('skyFlappyBest', classicBest);
        progress.highScore = Math.max(progress.highScore || 0, classicBest);
        gpProfile.classicBest = Math.max(gpProfile.classicBest || 0, classicBest);
        persistProgress();
        saveGPProfile();
      }
    }
  }

  function updateScore() {
    el.score.textContent = score;
    best = currentMode === 'ranked' ? rankedBest : classicBest;
    if(el.best) el.best.textContent = best;
    const mbVal = $('menuBestVal');
    if(mbVal) mbVal.textContent = best;
    if(el.modeBestLabel) {
      el.modeBestLabel.textContent = currentMode === 'ranked' ? 'RANKED BEST' : 'CLASSIC BEST';
    }
    updateMenuRankedUI();
  }
  function addScore() {
    score++;
    recordCurrentScore(score);
    updateScore();
    el.score.classList.remove('bump');
    void el.score.offsetWidth;
    el.score.classList.add('bump');
    el.pop.classList.remove('show');
    void el.pop.offsetWidth;
    el.pop.classList.add('show');
    makeParticles(180, 76, 9, '#fff0a8');
    audio.score();
    if(score === 10 || score === 25 || score === 50) makeParticles(180, 180, 25, '#ffe45c');

    // Pet Skill: Aero & Lumos (Divine Blessing)
    const petId = progress.selectedPet || 'pip_peep';
    if(petId === 'aero_lumos') {
      aeroPipesPassed++;
      if(aeroPipesPassed % 4 === 0) {
        score++;
        updateScore();
        progress.coins += 2;
        updateCoins();
        persistProgress();
        floatingTexts.push({
          x: bird.x + 25,
          y: bird.y - 24,
          text: 'DIVINE +1 SCORE & 2G!',
          color: '#fde047',
          vy: -65,
          life: 0.9, maxLife: 0.9
        });
        makeParticles(bird.x, bird.y, 22, '#fde047');
        audio.win();
      }
    }
  }
  function makeParticles(x, y, count, color) {
    for(let i = 0; i < count; i++) {
      const life = .55 + Math.random() * .35;
      particles.push({ x, y, vx: (Math.random() - .5) * 100, vy: (Math.random() - .8) * 100, life, maxLife: life, color, size: 2 + Math.random() * 3, type: 'dot' });
    }
  }

  // ==========================================
  // SKILL ACTIVATION & VISUAL SPLASH SYSTEM
  // ==========================================
  function activatePowerup(type, x, y, isStarter = false) {
    if(!type || type === 'none') return;
    audio.powerup(type);

    const px = x !== undefined ? x : bird.x;
    const py = y !== undefined ? y : bird.y;

    // Trigger visual splash & shockwave & floating badge
    triggerPowerupSplash(px, py, type, isStarter);

    // Apply skill duration & physics
    if(type === 'shield') {
      activePowerups.shield = true;
      activePowerups.shieldCount = 1;
    } else if(type === 'double_shield') {
      activePowerups.shield = true;
      activePowerups.shieldCount = 2;
    } else if(type === 'magnet') {
      activePowerups.magnet = 7.5;
    } else if(type === 'slow') {
      activePowerups.slow = 6.5;
    } else if(type === 'star') {
      activePowerups.star = 5.5;
    } else if(type === 'rocket') {
      activePowerups.rocket = 5.0;
      shake = 0.35;
      makeParticles(px, py, 28, '#f97316');
    } else if(type === 'heart' || type === 'extra_life') {
      lives = Math.min(maxLives, lives + 1);
      updateLivesHUD();
      makeParticles(px, py, 24, '#ef4444');
      makeParticles(px, py, 14, '#fda4af');
    } else if(type === 'zap') {
      // THUNDER ZAP: Serang semua lawan dengan petir halilintar bercabang & stun mereka!
      shake = 0.5;
      audio.hit();
      shockwaves.push({ x: bird.x, y: bird.y, r: 10, maxR: 140, color: '#fde047', life: 0.65, maxLife: 0.65 });
      shockwaves.push({ x: bird.x, y: bird.y, r: 5, maxR: 90, color: '#38bdf8', life: 0.45, maxLife: 0.45 });
      makeParticles(bird.x, bird.y, 40, '#fde047');
      makeParticles(bird.x, bird.y, 25, '#38bdf8');

      if(window.multiplayerEngine && window.multiplayerEngine.opponents) {
        window.multiplayerEngine.opponents.forEach(op => {
          if(op.isAlive) {
            const tx = op.curX !== undefined ? op.curX : 90;
            const ty = op.y;
            // Generate realistic procedural lightning segments
            const segments = [];
            const steps = 9;
            for(let s = 0; s <= steps; s++) {
              const t = s / steps;
              const lx = bird.x + (tx - bird.x) * t + (s > 0 && s < steps ? (Math.random() - 0.5) * 55 : 0);
              const ly = bird.y + (ty - bird.y) * t + (s > 0 && s < steps ? (Math.random() - 0.5) * 55 : 0);
              segments.push({ x: lx, y: ly });
            }
            lightningBolts.push({
              points: segments,
              life: 0.45,
              maxLife: 0.45,
              color: '#fde047'
            });
            makeParticles(tx, ty, 20, '#fde047');
          }
        });
        window.multiplayerEngine.strikeOpponentsWithZap();
      }
    } else if(type === 'missile') {
      // HOMING MISSILE: Luncurkan roket pelacak ke lawan terdepan!
      audio.dash();
      shake = 0.28;
      shockwaves.push({ x: bird.x, y: bird.y, r: 6, maxR: 55, color: '#f97316', life: 0.35, maxLife: 0.35 });
      raceMissiles.push({
        x: bird.x + 20,
        y: bird.y,
        vx: 580,
        vy: 0,
        angle: 0,
        life: 4.0
      });
      makeParticles(bird.x + 10, bird.y, 24, '#f97316');
      makeParticles(bird.x + 10, bird.y, 14, '#fde047');
    } else if(type === 'trap') {
      // BANANA / OIL TRAP: Jatuhkan jebakan licin di belakang pemain!
      audio.click();
      raceTraps.push({
        x: bird.x - 30,
        y: bird.y,
        r: 14,
        life: 8.0,
        rot: 0
      });
      makeParticles(bird.x - 20, bird.y, 16, '#facc15');
    } else if(type === 'bomb') {
      // MEGA BOMB: Luncurkan bom bola api raksasa ke depan!
      audio.rocketSmash();
      shake = 0.4;
      shockwaves.push({ x: bird.x, y: bird.y, r: 8, maxR: 70, color: '#ef4444', life: 0.4, maxLife: 0.4 });
      raceBombs.push({
        x: bird.x + 20,
        y: bird.y,
        vx: 480,
        r: 16,
        rot: 0,
        life: 3.2
      });
      makeParticles(bird.x + 10, bird.y, 28, '#ef4444');
      makeParticles(bird.x + 10, bird.y, 18, '#f97316');
    } else if(type === 'tornado') {
      // TORNADO GUST: Luncurkan angin topan badai ke depan!
      audio.dash();
      shake = 0.35;
      shockwaves.push({ x: bird.x, y: bird.y, r: 12, maxR: 85, color: '#38bdf8', life: 0.45, maxLife: 0.45 });
      raceTornadoes.push({
        x: bird.x + 20,
        y: bird.y,
        vx: 440,
        r: 24,
        rot: 0,
        life: 3.5
      });
      makeParticles(bird.x + 10, bird.y, 30, '#38bdf8');
      makeParticles(bird.x + 10, bird.y, 18, '#e0f2fe');
    } else if(type === 'freeze') {
      // BLIZZARD FREEZE: Bekukan semua lawan di arena menjadi es kristal!
      shake = 0.4;
      audio.hit();
      shockwaves.push({ x: bird.x, y: bird.y, r: 12, maxR: 140, color: '#67e8f9', life: 0.65, maxLife: 0.65 });
      makeParticles(bird.x, bird.y, 40, '#a5f3fc');
      makeParticles(bird.x, bird.y, 25, '#0891b2');
      if(window.multiplayerEngine && window.multiplayerEngine.opponents) {
        window.multiplayerEngine.opponents.forEach(op => {
          if(op.isAlive) {
            op.relX = (op.relX || 90) - 95;
            op.curX = op.relX;
            op.isStunned = true;
            op.stunTimer = 2.4;
            op.stunType = 'freeze';
            makeParticles(op.curX || 90, op.y, 24, '#a5f3fc');
          }
        });
      }
    }

    updatePowerupHUD();
  }

  function triggerPowerupSplash(x, y, type, isStarter = false) {
    const info = {
      shield: { text: isStarter ? 'STARTER SHIELD' : '+SHIELD GUARD', color: '#38bdf8' },
      double_shield: { text: 'DUAL SHIELD LAYER', color: '#0284c7' },
      magnet: { text: isStarter ? 'STARTER MAGNET' : '+MAGNET PULL', color: '#f43f5e' },
      slow:   { text: isStarter ? 'STARTER FREEZE' : '+TIME FREEZE', color: '#67e8f9' },
      star:   { text: isStarter ? 'STARTER STAR'   : '+STAR POWER',   color: '#fbbf24' },
      rocket: { text: isStarter ? 'NOS TURBO BLAST': '+NOS ROCKET BOOST', color: '#ea580c' },
      heart:  { text: '+1 EXTRA LIFE!', color: '#ef4444' },
      extra_life: { text: 'STARTER EXTRA LIFE', color: '#ef4444' },
      zap:    { text: 'THUNDER ZAP! ENEMIES STUNNED!', color: '#fde047' },
      missile:{ text: 'HOMING MISSILE LAUNCHED!', color: '#f97316' },
      trap:   { text: 'BANANA TRAP DROPPED!', color: '#facc15' },
      bomb:   { text: 'MEGA BOMB LAUNCHED!', color: '#ef4444' },
      tornado:{ text: 'TORNADO CYCLONE GUST!', color: '#38bdf8' },
      freeze: { text: 'BLIZZARD ICE FREEZE!', color: '#67e8f9' }
    }[type] || { text: '+POWER-UP!', color: '#fff' };

    // 1. Expanding Shockwaves
    shockwaves.push({
      x, y, r: 8, maxR: 75,
      color: info.color,
      life: 0.5, maxLife: 0.5
    });

    // 2. Floating Text Decal
    floatingTexts.push({
      x, y: y - 18,
      text: info.text,
      color: info.color,
      vy: -60,
      life: 0.9, maxLife: 0.9
    });

    // 3. Radiant Burst Particles
    makeParticles(x, y, 16, info.color);
  }

  function updatePowerupHUD() {
    if(!el.powerupHud) return;
    if(state === State.MENU || state === State.READY) {
      el.powerupHud.innerHTML = '';
      return;
    }
    let html = '';
    const petId = progress.selectedPet || 'pip_peep';
    
    // Status Skill Pet Khusus
    if(petId === 'pip_peep') {
      const aliveBabies = babyBirds.filter(b => b.state === 'follow' || b.state === 'intercept' || b.state === 'return').length;
      if(aliveBabies > 0) {
        html += `<span class="powerup-badge baby">${aliveBabies} ${aliveBabies > 1 ? 'BABIES' : 'BABY'}</span>`;
      }
      const deadBabies = babyBirds.filter(b => b.state === 'dead');
      if(deadBabies.length > 0) {
        const minCd = Math.min(...deadBabies.map(b => b.respawnTimer || 0));
        if(minCd > 0) {
          html += `<span class="powerup-badge baby-cd">HATCH: ${Math.ceil(minCd)}s</span>`;
        }
      }
    } else if(petId === 'momo_hana') {
      if(activePowerups.shield && (activePowerups.shieldType === 'sakura' || progress.selectedPet === 'momo_hana')) {
        html += `<span class="powerup-badge sakura">SAKURA SHIELD</span>`;
      } else {
        const rem = Math.max(0, 10.0 - petSkillTimer);
        html += `<span class="powerup-badge sakura-cd">BARRIER: ${Math.ceil(rem)}s</span>`;
      }
    } else if(petId === 'pixel_glitch') {
      if(petSkillTimer >= 3.0) {
        html += `<span class="powerup-badge laser">EMP READY</span>`;
      } else {
        html += `<span class="powerup-badge laser-cd">EMP: ${Math.ceil(3.0 - petSkillTimer)}s</span>`;
      }
    } else if(petId === 'blaze_ember') {
      html += `<span class="powerup-badge flame">PHOENIX FLAMES</span>`;
    } else if(petId === 'aero_lumos') {
      html += `<span class="powerup-badge holy">BLESSING: ${(aeroPipesPassed % 3)}/3</span>`;
    } else if(petId === 'kuro_void') {
      html += `<span class="powerup-badge shadow">SHADOW DASH -45%</span>`;
    }

    if(activePowerups.rocket > 0) {
      html += `<span class="powerup-badge rocket">NOS TURBO ${Math.ceil(activePowerups.rocket)}s</span>`;
    }
    if(activePowerups.shield && activePowerups.shieldType !== 'sakura' && petId !== 'momo_hana') {
      const shieldLabel = (activePowerups.shieldCount && activePowerups.shieldCount > 1) ? '2X SHIELD' : 'SHIELD';
      html += `<span class="powerup-badge shield">${shieldLabel} ON</span>`;
    }
    if(activePowerups.magnet > 0) {
      html += `<span class="powerup-badge magnet">MAGNET ${Math.ceil(activePowerups.magnet)}s</span>`;
    }
    if(activePowerups.slow > 0) {
      html += `<span class="powerup-badge slow">FREEZE ${Math.ceil(activePowerups.slow)}s</span>`;
    }
    if(activePowerups.star > 0) {
      html += `<span class="powerup-badge star">STAR ${Math.ceil(activePowerups.star)}s</span>`;
    }
    el.powerupHud.innerHTML = html;
  }

  // ==========================================
  // RANDOMIZED HAZARD SYSTEM (Non-Sequential)
  // ==========================================
  let nextHazardInterval = 3.0;

  function updateHazardSpawning(dt, slowFactor) {
    const isRanked = currentMode === 'ranked';
    const minScore = isRanked ? 2 : 5;
    if(score < minScore) return;

    enemySpawnTimer += dt;
    if(enemySpawnTimer > nextHazardInterval / slowFactor) {
      enemySpawnTimer = 0;
      // Interval acak dan dinamis
      const baseInterval = isRanked ? 2.0 : 3.2;
      const variation = (Math.random() - 0.5) * (isRanked ? 1.6 : 2.2);
      const scoreDiscount = Math.min(score, 120) * (isRanked ? 0.015 : 0.01);
      nextHazardInterval = Math.max(isRanked ? 1.1 : 1.7, baseInterval + variation - scoreDiscount);

      // Munculkan rintangan secara acak tanpa urutan tertentu!
      spawnRandomHazard();

      // Di mode ranked extreme, ada peluang muncul rintangan ganda acak
      if(isRanked && score >= 12 && Math.random() < 0.28) {
        setTimeout(() => {
          if(state === State.PLAYING) spawnRandomHazard();
        }, 350 + Math.random() * 550);
      }
    }
  }

  function spawnRandomHazard() {
    if(currentMode === 'multiplayer') return; // Di mode multiplayer, arena murni balapan skill & item senjata antar pemain
    const isRanked = currentMode === 'ranked';
    const rand = Math.random();

    if(rand < 0.42) {
      // 1. Enemy Bird dengan tipe pola acak (straight, zigzag, dive, swoop, fast)
      const patterns = ['straight', 'zigzag', 'dive', 'swoop', 'fast'];
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];
      const y = 80 + Math.random() * (H - GROUND - 180);
      const speedMult = pattern === 'fast' ? 1.55 : pattern === 'dive' ? 1.35 : 1.15;
      const speed = speedMult + Math.random() * (isRanked ? 0.55 : 0.35);

      enemies.push({
        type: 'bird',
        x: W + 35,
        y,
        baseY: y,
        r: 14,
        speed,
        pattern,
        time: 0,
        wing: Math.random() * 6,
        dead: false
      });
    } else if(rand < 0.72) {
      // 2. Bee Swarm dengan ketinggian dan kecepatan acak
      const y = 90 + Math.random() * (H - GROUND - 195);
      const speed = 1.05 + Math.random() * (isRanked ? 0.45 : 0.25);
      enemies.push({
        type: 'bee_swarm',
        x: W + 35,
        y,
        baseY: y,
        r: 15,
        speed,
        wobble: Math.random() * 6,
        time: 0,
        wing: 0,
        dead: false
      });
    } else {
      // 3. Storm Cloud Petir dadakan di depan pemain
      const targetX = 60 + Math.random() * (W - 120);
      stormClouds.push({
        x: targetX,
        y: 40,
        targetX,
        w: 80,
        h: 36,
        boltW: 24,
        phase: 'warn',
        timer: isRanked ? (0.8 + Math.random() * 0.4) : (1.1 + Math.random() * 0.45)
      });
    }
  }

  // Tail Aura Particle Spawner with Distinct Effects
  function skinTrail(dt) {
    trailSpawn += dt;
    if(trailSpawn < .033) return;
    trailSpawn = 0;
    const bx = bird.x - 14, by = bird.y + 4;
    const auraId = progress.selectedAura || 'default';

    if(auraId === 'default') {
      particles.push({
        x: bx, y: by + (Math.random() - .5) * 6,
        vx: -60 - Math.random() * 25, vy: -15 + Math.random() * 30,
        life: .45, maxLife: .45, color: '#ffd74c',
        size: 3 + Math.random() * 3,
        rot: Math.random() * 6, vRot: (Math.random() - .5) * 4,
        type: 'feather'
      });
    } else if(auraId === 'fire') {
      const colors = ['#ff3b00', '#ff6d00', '#ff9e00', '#ffd000', '#fff275'];
      const life = .42 + Math.random() * .28;
      particles.push({
        x: bx + (Math.random() - .5) * 4, y: by + (Math.random() - .5) * 6,
        vx: -70 - Math.random() * 50, vy: -35 - Math.random() * 45,
        life, maxLife: life, color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 6, rot: (Math.random() - .5) * .8,
        type: 'flame'
      });
      if(Math.random() < 0.5) {
        particles.push({
          x: bx, y: by,
          vx: -90 - Math.random() * 60, vy: -20 - Math.random() * 60,
          life: .3 + Math.random() * .2, maxLife: .5, color: '#fff59d',
          size: 2 + Math.random() * 2, type: 'sparkle'
        });
      }
    } else if(auraId === 'rainbow') {
      const hue = (performance.now() * 0.45) % 360;
      const life = .48 + Math.random() * .22;
      particles.push({
        x: bx, y: by + (Math.random() - .5) * 8,
        vx: -90 - Math.random() * 45, vy: (Math.random() - .5) * 35,
        life, maxLife: life, color: 'hsl(' + hue + ', 100%, 65%)',
        size: 4 + Math.random() * 4, rot: Math.random() * 6, vRot: (Math.random() - .5) * 6,
        type: Math.random() < 0.45 ? 'star' : 'rainbow_ribbon'
      });
    } else if(auraId === 'galaxy') {
      const colors = ['#c77dff', '#7b2cbf', '#48cae4', '#e0aaff', '#ffffff', '#ff70a6'];
      const life = .52 + Math.random() * .28;
      particles.push({
        x: bx, y: by + (Math.random() - .5) * 10,
        vx: -75 - Math.random() * 35, vy: (Math.random() - .5) * 35,
        life, maxLife: life, color: colors[Math.floor(Math.random() * colors.length)],
        size: 3.5 + Math.random() * 4, rot: Math.random() * 6, vRot: 3 + Math.random() * 3,
        type: Math.random() < 0.35 ? 'planet' : Math.random() < 0.7 ? 'star' : 'dust'
      });
    } else if(auraId === 'neon') {
      const colors = ['#00f5d4', '#7b2cbf', '#fee440', '#00bbf9', '#ffffff'];
      const life = .26 + Math.random() * .14;
      particles.push({
        x: bx, y: by + (Math.random() - .5) * 8,
        vx: -110 - Math.random() * 60, vy: (Math.random() - .5) * 70,
        life, maxLife: life, color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 4,
        pts: [
          { dx: 0, dy: 0 },
          { dx: -6 - Math.random() * 6, dy: (Math.random() - .5) * 12 },
          { dx: -14 - Math.random() * 8, dy: (Math.random() - .5) * 14 },
          { dx: -22 - Math.random() * 10, dy: (Math.random() - .5) * 18 }
        ],
        type: 'lightning'
      });
    } else if(auraId === 'bubble') {
      const life = .6 + Math.random() * .35;
      particles.push({
        x: bx, y: by + (Math.random() - .5) * 8,
        vx: -55 - Math.random() * 35, vy: -15 - Math.random() * 30,
        life, maxLife: life, color: '#a0e7e5',
        size: 3.5 + Math.random() * 4.5,
        wobble: Math.random() * 6,
        type: 'bubble'
      });
    } else if(auraId === 'hearts') {
      const colors = ['#ff4d6d', '#ff758f', '#ff8fa3', '#c9184a', '#ff0054'];
      const life = .52 + Math.random() * .26;
      particles.push({
        x: bx, y: by + (Math.random() - .5) * 8,
        vx: -65 - Math.random() * 35, vy: -20 - Math.random() * 35,
        life, maxLife: life, color: colors[Math.floor(Math.random() * colors.length)],
        size: 4.5 + Math.random() * 3.5, rot: (Math.random() - .5) * .6,
        type: 'heart'
      });
    } else if(auraId === 'golden') {
      const colors = ['#ffd700', '#ffb703', '#fff066', '#fb8500'];
      const life = .46 + Math.random() * .26;
      particles.push({
        x: bx, y: by + (Math.random() - .5) * 10,
        vx: -80 - Math.random() * 45, vy: 10 + Math.random() * 30,
        life, maxLife: life, color: colors[Math.floor(Math.random() * colors.length)],
        size: 3.5 + Math.random() * 3.5, spin: Math.random() * 6,
        type: Math.random() < 0.45 ? 'coin' : 'star'
      });
    } else if(auraId === 'frost') {
      const colors = ['#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#ffffff'];
      const life = .48 + Math.random() * .24;
      particles.push({
        x: bx, y: by + (Math.random() - .5) * 8,
        vx: -75 - Math.random() * 35, vy: -10 + Math.random() * 25,
        life, maxLife: life, color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 3, rot: Math.random() * 6, vRot: (Math.random() - .5) * 4,
        type: 'sparkle'
      });
    } else if(auraId === 'plasma') {
      const colors = ['#c084fc', '#a855f7', '#38bdf8', '#818cf8', '#ffffff'];
      const life = .32 + Math.random() * .18;
      particles.push({
        x: bx, y: by + (Math.random() - .5) * 10,
        vx: -95 - Math.random() * 45, vy: (Math.random() - .5) * 55,
        life, maxLife: life, color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 3.5,
        pts: [
          { dx: 0, dy: 0 },
          { dx: -5 - Math.random() * 6, dy: (Math.random() - .5) * 10 },
          { dx: -12 - Math.random() * 8, dy: (Math.random() - .5) * 12 }
        ],
        type: 'lightning'
      });
    } else if(auraId === 'sakura') {
      const colors = ['#f472b6', '#fda4af', '#fb7185', '#fbcfe8', '#ffffff'];
      const life = .58 + Math.random() * .32;
      particles.push({
        x: bx, y: by + (Math.random() - .5) * 8,
        vx: -55 - Math.random() * 30, vy: 15 + Math.random() * 25,
        life, maxLife: life, color: colors[Math.floor(Math.random() * colors.length)],
        size: 3.2 + Math.random() * 3, rot: Math.random() * 6, vRot: (Math.random() - .5) * 3,
        type: 'rainbow_ribbon'
      });
    } else if(auraId === 'matrix') {
      const colors = ['#22c55e', '#4ade80', '#86efac', '#15803d', '#ffffff'];
      const life = .42 + Math.random() * .22;
      particles.push({
        x: bx, y: by + (Math.random() - .5) * 8,
        vx: -85 - Math.random() * 35, vy: (Math.random() - .5) * 20,
        life, maxLife: life, color: colors[Math.floor(Math.random() * colors.length)],
        size: 2.5 + Math.random() * 2.5,
        type: 'dot'
      });
    } else if(auraId === 'super_saiyan') {
      // Golden Ki Aura & Electric Sparks
      const life = .38 + Math.random() * .22;
      particles.push({
        x: bx + (Math.random() - .5) * 6, y: by + (Math.random() - .5) * 6,
        vx: -80 - Math.random() * 40, vy: -30 - Math.random() * 50,
        life, maxLife: life, color: Math.random() < 0.6 ? '#facc15' : '#fef08a',
        size: 5 + Math.random() * 6, rot: (Math.random() - .5) * .8,
        type: 'flame'
      });
      if(Math.random() < 0.45) {
        particles.push({
          x: bx, y: by + (Math.random() - .5) * 6,
          vx: -110 - Math.random() * 50, vy: (Math.random() - .5) * 60,
          life: .22 + Math.random() * .12, maxLife: .34, color: '#38bdf8',
          size: 3, pts: [{ dx: 0, dy: 0 }, { dx: -8, dy: 4 }, { dx: -16, dy: -4 }],
          type: 'lightning'
        });
      }
    } else if(auraId === 'domain_expansion') {
      // Infinite Void Cosmic Purple Stardust
      const colors = ['#8b5cf6', '#c084fc', '#38bdf8', '#ffffff', '#1e1b4b'];
      const life = .52 + Math.random() * .25;
      particles.push({
        x: bx, y: by + (Math.random() - .5) * 10,
        vx: -70 - Math.random() * 35, vy: (Math.random() - .5) * 30,
        life, maxLife: life, color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 4, rot: Math.random() * 6, vRot: 3,
        type: Math.random() < 0.5 ? 'planet' : 'star'
      });
    } else if(auraId === 'nine_tails_chakra') {
      // Kurama Fiery Crimson Chakra Flare
      const colors = ['#ea580c', '#dc2626', '#b91c1c', '#f97316', '#facc15'];
      const life = .45 + Math.random() * .25;
      particles.push({
        x: bx + (Math.random() - .5) * 6, y: by + (Math.random() - .5) * 6,
        vx: -85 - Math.random() * 45, vy: -35 - Math.random() * 45,
        life, maxLife: life, color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 6, rot: (Math.random() - .5) * .8,
        type: 'flame'
      });
    } else if(auraId === 'gear_fifth') {
      // Sun God Nika Pure White Vapor Puffs & Gold Sparkles
      const life = .55 + Math.random() * .25;
      particles.push({
        x: bx, y: by + (Math.random() - .5) * 8,
        vx: -60 - Math.random() * 35, vy: -15 + (Math.random() - .5) * 30,
        life, maxLife: life, color: '#ffffff',
        size: 5 + Math.random() * 5,
        type: 'bubble'
      });
      if(Math.random() < 0.4) {
        particles.push({
          x: bx, y: by,
          vx: -75 - Math.random() * 40, vy: (Math.random() - .5) * 40,
          life: .35, maxLife: .35, color: '#fef08a',
          size: 3 + Math.random() * 2, type: 'sparkle'
        });
      }
    } else if(auraId === 'black_getsuga') {
      // Bankai Getsuga Pitch Black & Crimson Energy
      const colors = ['#0f172a', '#1e293b', '#dc2626', '#ef4444', '#991b1b'];
      const life = .35 + Math.random() * .18;
      particles.push({
        x: bx, y: by + (Math.random() - .5) * 8,
        vx: -110 - Math.random() * 60, vy: (Math.random() - .5) * 50,
        life, maxLife: life, color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 5, rot: (Math.random() - .5) * 1.2,
        type: 'flame'
      });
    }
  }

  function handleHit(hazard, isGround = false) {
    if(state !== State.PLAYING) return;

    // 0. Warp Dash Active -> Invulnerable & destroy hazard!
    if(dashTimer > 0) {
      if(hazard && hazard.type) {
        hazard.dead = true;
        hazard.x = -999;
        makeParticles(hazard.x, hazard.y, 18, '#38bdf8');
        audio.rocketSmash();
        addScore();
      }
      return;
    }

    // 1. NOS Rocket Active -> Hancurkan rintangan seketika tanpa terluka!
    if(activePowerups.rocket > 0) {
      if(hazard && hazard.type) {
        hazard.dead = true;
        hazard.x = -999;
        makeParticles(hazard.x, hazard.y, 22, '#f97316');
        audio.rocketSmash();
        addScore();
      }
      return;
    }

    // 2. Invincible Star Active
    if(activePowerups.star > 0) {
      if(hazard && hazard.type) {
        hazard.dead = true;
        hazard.x = -999;
        makeParticles(hazard.x, hazard.y, 14, '#ffd700');
        audio.hit();
      }
      return;
    }
    // 3. Grace Period Active
    if(graceTimer > 0) return;

    // 4. Shield Active -> Absorb Hit!
    if(activePowerups.shield) {
      if(activePowerups.shieldCount && activePowerups.shieldCount > 1) {
        activePowerups.shieldCount--;
        graceTimer = 0.95;
        audio.shieldBreak();
        shake = 0.2;
        makeParticles(bird.x, bird.y, 20, '#38bdf8');
      } else {
        activePowerups.shield = false;
        activePowerups.shieldCount = 0;
        graceTimer = 0.9;
        audio.shieldBreak();
        shake = 0.25;
        makeParticles(bird.x, bird.y, 22, '#38bdf8');
      }
      if(hazard && hazard.type) {
        hazard.dead = true;
        hazard.x = -999;
      }
      updatePowerupHUD();
      return;
    }

    // 5. Lives System (Ranked Mode: 3 hearts, Multiplayer Mode: 3 hearts, Classic: 1 heart)
    if(lives > 1) {
      lives--;
      graceTimer = 1.6;
      audio.hit();
      shake = 0.28;
      floatingTexts.push({
        x: bird.x, y: bird.y - 22,
        text: '-1 LIFE (' + lives + ' LIVES LEFT)',
        color: '#ef4444',
        vy: -65, life: 0.85, maxLife: 0.85
      });
      makeParticles(bird.x, bird.y, 24, '#ef4444');
      shockwaves.push({
        x: bird.x, y: bird.y, r: 8, maxR: 70,
        color: '#ef4444', life: 0.35, maxLife: 0.35
      });
      if(isGround) {
        bird.y = H - GROUND - 45;
        bird.vy = -280;
      } else {
        bird.vy = -180;
      }
      if(hazard && hazard.type) {
        hazard.dead = true;
        hazard.x = -999;
      }
      updateLivesHUD();
      updateMpBattleHUD();
      if(currentMode === 'multiplayer' && window.multiplayerEngine) {
        window.multiplayerEngine.broadcastMyState({
          y: bird.y, vy: bird.vy, rot: bird.angle, score, isAlive: true, lives
        });
      }
      return;
    }

    // 6. 0 Lives Left -> Death (Race Mode: 3s Auto-Respawn, Survival Mode: Knockout End, Singleplayer: Revive Modal)
    lives = 0;
    updateLivesHUD();
    updateMpBattleHUD();
    if(currentMode === 'multiplayer') {
      if(window.multiplayerEngine && window.multiplayerEngine.gameMode === 'race') {
        triggerRaceRespawn();
        return;
      }
      endGame();
    } else {
      promptRevive();
    }
  }

  function triggerRaceRespawn() {
    isRespawningRace = true;
    raceRespawnTimer = 3.0;
    bird.vy = 0;
    audio.hit();
    shake = 0.35;
    makeParticles(bird.x, bird.y, 30, '#ef4444');
    floatingTexts.push({
      x: bird.x, y: bird.y - 28,
      text: 'TERJATUH! RESPAWN DALAM 3s...',
      color: '#f87171',
      vy: -50, life: 1.5, maxLife: 1.5
    });
    if(window.multiplayerEngine) {
      window.multiplayerEngine.broadcastMyState({
        y: bird.y, vy: 0, rot: 0, score, isAlive: true, lives: 0
      });
    }
  }

  function collide(p) {
    const bx = bird.x, by = bird.y, r = bird.r * .72;
    if(bx + r > p.x && bx - r < p.x + p.w && (by - r < p.gapY || by + r > p.gapY + p.gapSize)) return true;
    return false;
  }

  function endGame() {
    if(state === State.OVER) return;
    state = State.OVER;
    bird.dead = true;
    dashTimer = 0;
    shake = .26;
    audio.hit();
    audio.stopMusic();
    stopBackgroundMusic();
    audio.deathMusic();
    updateDashUI();
    if(navigator.vibrate && settings.vibration) navigator.vibrate(80);

    recordCurrentScore(score);

    let newBest = false;
    if(currentMode === 'ranked') {
      newBest = score >= rankedBest && score > 0;
      submitRankedScore(rankedBest);
    } else {
      newBest = score >= classicBest && score > 0;
    }

    updateScore();
    syncGPProfileUI();
    if(typeof saveCloudSave === 'function') saveCloudSave();
    overTimer = 0.65;
  }

  function update(dt) {
    cloudX = (cloudX + 10 * dt) % W;
    if(state === State.READY) {
      bird.x = 130;
      bird.y = 150 + Math.sin(performance.now() / 250) * 6;
      bird.wing = .1;
      babyBirds[0].x = bird.x - 22;
      babyBirds[0].y = bird.y - 18 + Math.sin(performance.now() / 220) * 4;
      babyBirds[0].wing += dt * 20;
      babyBirds[1].x = bird.x - 26;
      babyBirds[1].y = bird.y + 18 + Math.sin(performance.now() / 240 + Math.PI) * 4;
      babyBirds[1].wing += dt * 20;
      return;
    }
    if(state === State.OVER) {
      bird.vy = Math.min(420, bird.vy + 850 * dt);
      bird.y += bird.vy * dt;
      bird.angle = Math.min(1.6, bird.angle + 3 * dt);
      // Ground clamping - prevent bird from sinking underground
      const maxGroundY = H - GROUND - bird.r;
      if(bird.y >= maxGroundY) { bird.y = maxGroundY; bird.vy = 0; }
      babyBirds[0].x += (bird.x - 22 - babyBirds[0].x) * 8 * dt;
      babyBirds[0].y += (bird.y - 18 - babyBirds[0].y) * 8 * dt;
      babyBirds[0].y = Math.min(maxGroundY, babyBirds[0].y);
      babyBirds[0].angle = bird.angle * 0.7;
      babyBirds[1].x += (bird.x - 26 - babyBirds[1].x) * 8 * dt;
      babyBirds[1].y += (bird.y + 18 - babyBirds[1].y) * 8 * dt;
      babyBirds[1].y = Math.min(maxGroundY, babyBirds[1].y);
      overTimer -= dt;
      const isModalOpen = (el.over && !el.over.classList.contains('hidden')) || (el.mpOverModal && !el.mpOverModal.classList.contains('hidden'));
      if(overTimer <= 0 && !isModalOpen) showOver();
      return;
    }
    if(state !== State.PLAYING) return;

    // Multiplayer State Broadcast & Rival Interpolation
    if(currentMode === 'multiplayer' && window.multiplayerEngine) {
      const isMyRocket = (activePowerups.rocket || 0) > 0;
      const isMyDashing = dashTimer > 0;

      window.multiplayerEngine.updateOpponents(dt, pipes, powerups, {
        isDashing: isMyDashing,
        isRocket: isMyRocket,
        score: score,
        birdX: bird.x
      });

      window.multiplayerEngine.broadcastMyState({
        y: bird.y,
        vy: bird.vy,
        rot: bird.angle,
        score,
        lives,
        isAlive: true,
        isDashing: isMyDashing,
        isRocket: isMyRocket
      });

      updateMpBattleHUD();

      // Unlimited instant dash in Race mode:
      if(window.multiplayerEngine.gameMode === 'race') {
        dashCooldown = 0;

        // Continuous Nitro Boost when button/key is held down
        if(isHoldingDash && (state === State.PLAYING || state === State.READY)) {
          dashTimer = Math.max(dashTimer, 0.32);
          graceTimer = Math.max(graceTimer, 0.45);
          bird.vy = Math.min(bird.vy, -95);
          bird.wing = 0.22;
          shake = Math.max(shake, 0.12);

          // Continuous hyper nitro flame exhaust particles
          if(Math.random() < 0.75) {
            particles.push({
              x: bird.x - 16,
              y: bird.y + (Math.random() - 0.5) * 14,
              vx: -360 - Math.random() * 140,
              vy: (Math.random() - 0.5) * 60,
              life: 0.32, maxLife: 0.32,
              color: Math.random() < 0.4 ? '#38bdf8' : (Math.random() < 0.7 ? '#fde047' : '#ea580c'),
              size: 3.5 + Math.random() * 4,
              type: 'sparkle'
            });
          }

          nitroHoldAudioTimer -= dt;
          if(nitroHoldAudioTimer <= 0) {
            audio.dash();
            nitroHoldAudioTimer = 0.24;
          }
        }
      }
    }

    // Power-Up & Dash Timer Management
    const prevDashCd = dashCooldown;
    if(dashCooldown > 0) dashCooldown = Math.max(0, dashCooldown - dt);
    if(prevDashCd > 0 && dashCooldown === 0) {
      audio.dashReady();
    }
    if(dashTimer > 0) {
      dashTimer = Math.max(0, dashTimer - dt);
      dashAfterimages.push({
        x: bird.x, y: bird.y, angle: bird.angle, wing: bird.wing, alpha: 0.85
      });
      for(let i = 0; i < 2; i++) {
        particles.push({
          x: bird.x - 16,
          y: bird.y + (Math.random() - 0.5) * 12,
          vx: -280 - Math.random() * 80,
          vy: (Math.random() - 0.5) * 40,
          life: 0.28, maxLife: 0.28,
          color: Math.random() < 0.6 ? '#38bdf8' : '#7dd3fc',
          size: 3 + Math.random() * 3,
          type: 'sparkle'
        });
      }
    }

    // Dynamic Player Bird Surge forward on screen during Dash & Rocket
    const baseBirdX = 130;
    const targetBirdX = (dashTimer > 0 || activePowerups.rocket > 0) ? Math.min(185, baseBirdX + ((dashTimer > 0 ? dashTimer : 0.3) / 0.35) * 55) : baseBirdX;
    bird.x += (targetBirdX - bird.x) * Math.min(1, dt * 10);

    for(const img of dashAfterimages) img.alpha -= dt * 3.5;
    dashAfterimages = dashAfterimages.filter(img => img.alpha > 0);
    updateDashUI();

    if(activePowerups.magnet > 0) activePowerups.magnet = Math.max(0, activePowerups.magnet - dt);
    if(activePowerups.slow > 0) activePowerups.slow = Math.max(0, activePowerups.slow - dt);
    if(activePowerups.star > 0) activePowerups.star = Math.max(0, activePowerups.star - dt);
    if(activePowerups.rocket > 0) {
      activePowerups.rocket = Math.max(0, activePowerups.rocket - dt);
      // Semburkan partikel api dan asap pendorong roket NOS
      for(let i = 0; i < 3; i++) {
        particles.push({
          x: bird.x - 22,
          y: bird.y + (Math.random() - 0.5) * 14,
          vx: -240 - Math.random() * 90,
          vy: (Math.random() - 0.5) * 50,
          life: 0.35, maxLife: 0.35,
          color: Math.random() < 0.4 ? '#ef4444' : Math.random() < 0.75 ? '#f97316' : '#fde047',
          size: 3.5 + Math.random() * 4,
          type: 'flame'
        });
      }
    }
    if(graceTimer > 0) graceTimer = Math.max(0, graceTimer - dt);
    updatePowerupHUD();

    // Shockwaves & Floating Texts physics update
    for(const sw of shockwaves) {
      sw.r += (sw.maxR - sw.r) * 9 * dt;
      sw.life -= dt;
    }
    shockwaves = shockwaves.filter(sw => sw.life > 0);

    for(const lb of lightningBolts) {
      lb.life -= dt;
    }
    lightningBolts = lightningBolts.filter(lb => lb.life > 0);

    for(const ft of floatingTexts) {
      ft.y += ft.vy * dt;
      ft.vy += 30 * dt;
      ft.life -= dt;
    }
    floatingTexts = floatingTexts.filter(ft => ft.life > 0);

    // Race Mode 3-Second Auto-Respawn Recovery
    if(isRespawningRace) {
      raceRespawnTimer -= dt;
      bird.y = 150 + Math.sin(Date.now() / 180) * 6;
      bird.vy = 0;
      bird.angle = 0;
      if(raceRespawnTimer <= 0) {
        isRespawningRace = false;
        lives = 3;
        graceTimer = 2.8;
        bird.vy = -220;
        audio.win();
        shockwaves.push({ x: bird.x, y: bird.y, r: 10, maxR: 95, color: '#38bdf8', life: 0.5, maxLife: 0.5 });
        makeParticles(bird.x, bird.y, 30, '#38bdf8');
        floatingTexts.push({
          x: bird.x, y: bird.y - 24,
          text: 'RESPAWNED! GASPOLL!',
          color: '#38bdf8',
          vy: -60, life: 1.0, maxLife: 1.0
        });
        updateLivesHUD();
        updateMpBattleHUD();
      }
    }

    // World speed is slowed when Slow Time is active, but player physics stays normal!
    const slowFactor = activePowerups.slow > 0 ? 0.52 : 1.0;

    // Update Active Homing Race Missiles (Smart Target Tracking)
    for(let i = raceMissiles.length - 1; i >= 0; i--) {
      const m = raceMissiles[i];
      m.life -= dt;

      // Find closest living rival to home into
      let targetOp = null;
      let closestDist = 99999;
      if(window.multiplayerEngine && window.multiplayerEngine.opponents) {
        window.multiplayerEngine.opponents.forEach(op => {
          if(op.isAlive) {
            const opX = op.curX !== undefined ? op.curX : 90;
            const d = Math.hypot(opX - m.x, op.y - m.y);
            if(d < closestDist) {
              closestDist = d;
              targetOp = op;
            }
          }
        });
      }

      if(targetOp) {
        const targetX = targetOp.curX !== undefined ? targetOp.curX : 90;
        const targetY = targetOp.y;
        const dx = targetX - m.x;
        const dy = targetY - m.y;
        const desiredAngle = Math.atan2(dy, dx);
        m.angle = m.angle !== undefined ? m.angle : 0;
        let diff = desiredAngle - m.angle;
        while(diff > Math.PI) diff -= Math.PI * 2;
        while(diff < -Math.PI) diff += Math.PI * 2;
        m.angle += diff * Math.min(1, dt * 10);
        const speed = 580;
        m.vx = Math.cos(m.angle) * speed;
        m.vy = Math.sin(m.angle) * speed;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
      } else {
        m.angle = 0;
        m.x += (m.vx || 540) * dt;
      }

      // Exhaust smoke & flame trail
      if(Math.random() < 0.65) {
        particles.push({
          x: m.x - 12 * Math.cos(m.angle || 0),
          y: m.y - 12 * Math.sin(m.angle || 0) + (Math.random() - 0.5) * 4,
          vx: -180 * Math.cos(m.angle || 0),
          vy: -180 * Math.sin(m.angle || 0),
          life: 0.22, maxLife: 0.22,
          color: Math.random() < 0.5 ? '#ef4444' : '#f97316',
          size: 3.5
        });
      }

      // Check collision with opponents
      if(window.multiplayerEngine && window.multiplayerEngine.opponents) {
        let hitOp = null;
        window.multiplayerEngine.opponents.forEach(op => {
          if(op.isAlive && Math.hypot(m.x - (op.curX || 90), m.y - op.y) < 38) {
            hitOp = op;
          }
        });
        if(hitOp || m.x > W + 90 || m.life <= 0) {
          if(hitOp) {
            hitOp.relX = (hitOp.relX || 90) - 130;
            hitOp.curX = hitOp.relX;
            if(hitOp.hasShield) {
              hitOp.hasShield = false;
            } else {
              hitOp.lives = Math.max(1, (hitOp.lives || 3) - 1);
            }
            hitOp.isStunned = true;
            hitOp.stunTimer = 1.8;
            audio.hit();
            shockwaves.push({ x: hitOp.curX, y: hitOp.y, r: 8, maxR: 85, color: '#ef4444', life: 0.45, maxLife: 0.45 });
            makeParticles(hitOp.curX, hitOp.y, 28, '#ef4444');
            floatingTexts.push({
              x: hitOp.curX, y: hitOp.y - 24,
              text: 'MISSILE DIRECT HIT!',
              color: '#ef4444',
              vy: -60, life: 0.9, maxLife: 0.9
            });
          }
          raceMissiles.splice(i, 1);
        }
      }
    }

    // Update Active Race Banana / Oil Traps
    for(let i = raceTraps.length - 1; i >= 0; i--) {
      const t = raceTraps[i];
      t.x -= (320 * dt);
      t.rot = (t.rot || 0) + dt * 4;
      t.life -= dt;

      // Check if opponents hit trap
      if(window.multiplayerEngine && window.multiplayerEngine.opponents) {
        let hitOp = null;
        window.multiplayerEngine.opponents.forEach(op => {
          if(op.isAlive && Math.hypot(t.x - (op.curX || 90), t.y - op.y) < 28) {
            hitOp = op;
          }
        });
        if(hitOp) {
          hitOp.relX = (hitOp.relX || 90) - 80;
          hitOp.vy = 260;
          hitOp.rot = 3.14;
          hitOp.isStunned = true;
          hitOp.stunTimer = 1.5;
          audio.hit();
          makeParticles(t.x, t.y, 20, '#facc15');
          floatingTexts.push({
            x: hitOp.curX, y: hitOp.y - 20,
            text: 'SLIPPED ON BANANA!',
            color: '#facc15',
            vy: -50, life: 0.8, maxLife: 0.8
          });
          raceTraps.splice(i, 1);
          continue;
        }
      }
      if(t.x < -30 || t.life <= 0) raceTraps.splice(i, 1);
    }

    // Update Active Mega Fire Bombs (Tracks target height & smashes pipes)
    for(let i = raceBombs.length - 1; i >= 0; i--) {
      const b = raceBombs[i];
      b.rot = (b.rot || 0) + dt * 6;
      b.life -= dt;

      // Home towards nearest opponent height
      let targetOp = null;
      if(window.multiplayerEngine && window.multiplayerEngine.opponents) {
        window.multiplayerEngine.opponents.forEach(op => {
          if(op.isAlive) targetOp = op;
        });
      }
      if(targetOp) {
        b.y += (targetOp.y - b.y) * Math.min(1, dt * 5.0);
      }
      b.x += (b.vx || 480) * dt;

      // Flame particles trail
      if(Math.random() < 0.65) {
        particles.push({
          x: b.x - 14, y: b.y + (Math.random() - 0.5) * 8,
          vx: -160, vy: (Math.random() - 0.5) * 30,
          life: 0.25, maxLife: 0.25,
          color: Math.random() < 0.5 ? '#ef4444' : '#fde047',
          size: 3.5
        });
      }

      // Check collision with pipes (smashes pipes!)
      for(const p of pipes) {
        if(!p.smashed && b.x + b.r > p.x && b.x - b.r < p.x + p.w) {
          p.smashed = true;
          makeParticles(p.x + p.w/2, b.y, 25, '#ef4444');
          audio.rocketSmash();
        }
      }

      // Check collision with opponents
      if(window.multiplayerEngine && window.multiplayerEngine.opponents) {
        let hitOp = null;
        window.multiplayerEngine.opponents.forEach(op => {
          if(op.isAlive && Math.hypot(b.x - (op.curX || 90), b.y - op.y) < 38) {
            hitOp = op;
          }
        });
        if(hitOp || b.x > W + 70 || b.life <= 0) {
          if(hitOp) {
            hitOp.relX = (hitOp.relX || 90) - 150;
            hitOp.curX = hitOp.relX;
            if(hitOp.hasShield) {
              hitOp.hasShield = false;
            } else {
              hitOp.lives = Math.max(1, (hitOp.lives || 3) - 1);
            }
            hitOp.isStunned = true;
            hitOp.stunTimer = 2.0;
            audio.rocketSmash();
            shockwaves.push({ x: hitOp.curX, y: hitOp.y, r: 12, maxR: 110, color: '#ef4444', life: 0.5, maxLife: 0.5 });
            makeParticles(hitOp.curX, hitOp.y, 35, '#ef4444');
            makeParticles(hitOp.curX, hitOp.y, 20, '#fde047');
            floatingTexts.push({
              x: hitOp.curX, y: hitOp.y - 26,
              text: 'MEGA BOMB EXPLOSION!',
              color: '#ef4444',
              vy: -60, life: 1.0, maxLife: 1.0
            });
          }
          raceBombs.splice(i, 1);
        }
      }
    }

    // Update Active Tornado Cyclones (Tracks opponent height)
    for(let i = raceTornadoes.length - 1; i >= 0; i--) {
      const tn = raceTornadoes[i];
      tn.rot = (tn.rot || 0) + dt * 10;
      tn.life -= dt;

      let targetOp = null;
      if(window.multiplayerEngine && window.multiplayerEngine.opponents) {
        window.multiplayerEngine.opponents.forEach(op => {
          if(op.isAlive) targetOp = op;
        });
      }
      if(targetOp) {
        tn.y += (targetOp.y - tn.y) * Math.min(1, dt * 4.0);
      }
      tn.x += (tn.vx || 440) * dt;

      // Swirling wind particles
      if(Math.random() < 0.7) {
        particles.push({
          x: tn.x + (Math.random() - 0.5) * 16,
          y: tn.y + (Math.random() - 0.5) * 24,
          vx: -140 + (Math.random() - 0.5) * 40,
          vy: (Math.random() - 0.5) * 60,
          life: 0.28, maxLife: 0.28,
          color: Math.random() < 0.6 ? '#38bdf8' : '#e0f2fe',
          size: 2.8
        });
      }

      // Check collision with opponents
      if(window.multiplayerEngine && window.multiplayerEngine.opponents) {
        let hitOp = null;
        window.multiplayerEngine.opponents.forEach(op => {
          if(op.isAlive && Math.hypot(tn.x - (op.curX || 90), tn.y - op.y) < 42) {
            hitOp = op;
          }
        });
        if(hitOp || tn.x > W + 80 || tn.life <= 0) {
          if(hitOp) {
            hitOp.relX = (hitOp.relX || 90) - 120;
            hitOp.curX = hitOp.relX;
            hitOp.rot = 6.28;
            hitOp.isStunned = true;
            hitOp.stunTimer = 1.8;
            audio.dash();
            shockwaves.push({ x: hitOp.curX, y: hitOp.y, r: 10, maxR: 95, color: '#38bdf8', life: 0.45, maxLife: 0.45 });
            makeParticles(hitOp.curX, hitOp.y, 25, '#38bdf8');
            floatingTexts.push({
              x: hitOp.curX, y: hitOp.y - 24,
              text: 'SWEPT BY TORNADO!',
              color: '#38bdf8',
              vy: -55, life: 0.9, maxLife: 0.9
            });
          }
          raceTornadoes.splice(i, 1);
        }
      }
    }

    if(activePowerups.rocket > 0 || dashTimer > 0) {
      // Terbang stabil melesat saat roket NOS / Dash aktif
      bird.vy = Math.min(160, Math.max(-160, bird.vy + 220 * dt));
      bird.y += bird.vy * dt;
      bird.angle = Math.max(-0.2, Math.min(0.2, bird.vy / 400));
    } else {
      bird.vy = Math.min(430, bird.vy + 830 * dt);
      bird.y += bird.vy * dt;
      bird.angle = Math.max(-.42, Math.min(1.05, bird.vy / 520));
    }
    bird.wing = Math.max(0, bird.wing - dt);

    // Progressive speed scaling based on score tiers (+ NOS rocket turbo bonus + Dash burst + Extreme Ranked)
    const isRanked = currentMode === 'ranked';
    const rocketBoost = activePowerups.rocket > 0 ? 140 : 0;
    const dashBoost = dashTimer > 0 ? 320 : 0;
    const speedMultiplier = isRanked ? 1.55 : 1.0;
    const speedBonus = ((score < 50 ? score * 1.15 : 57.5 + (score - 50) * 0.95) * speedMultiplier) + rocketBoost + dashBoost;
    const rankedExtra = isRanked ? 45 : 0;
    const baseSpeed = Math.min(isRanked ? 440 : 380, 115 + rankedExtra + speedBonus + (settings.difficulty === 'easy' ? -12 : settings.difficulty === 'hard' ? 14 : 0));
    const speed = baseSpeed * slowFactor;
    const spawnDelay = Math.max(isRanked ? .78 : .92, (isRanked ? 1.35 : 1.6) - Math.min(score, 120) * (isRanked ? .008 : .006)) / slowFactor;

    spawn += dt;
    if(spawn > spawnDelay) { spawn = 0; makePipe(); }

    // Power-Up Timer progression (used when spawning pipes)
    powerupSpawnTimer += dt;

    // Spawn Hazards & Enemies (Randomized, unpredictable, non-sequential)
    updateHazardSpawning(dt, slowFactor);

    // Update 2 Anak Burung Pelindung (Baby Guardian Combat AI)
    updateBabyBirds(dt, speed, slowFactor);

    // Update Pipes & Rocket/Dash Smasher (In-place reverse traversal without Array allocation)
    for(let i = pipes.length - 1; i >= 0; i--) {
      const p = pipes[i];
      p.x -= speed * dt;
      if(!p.passed && p.x + p.w < bird.x - bird.r) { p.passed = true; addScore(); }
      if(collide(p)) {
        if(activePowerups.rocket > 0 || dashTimer > 0) {
          // Roket NOS / Warp Dash menghancurkan pipa di depannya seketika!
          if(!p.smashed) {
            p.smashed = true;
            makeParticles(p.x + p.w / 2, bird.y, 16, dashTimer > 0 ? '#38bdf8' : '#ea580c');
            makeParticles(p.x + p.w / 2, bird.y, 8, '#fde047');
            shake = 0.22;
            audio.rocketSmash();
            if(!p.passed) { p.passed = true; addScore(); }
          }
        } else {
          handleHit(null);
        }
      }
      if(p.x + p.w <= -8) {
        pipes.splice(i, 1);
      }
    }

    // Update Flyers (AABB Broadphase early-exit + In-place cleanup)
    for(let i = flyers.length - 1; i >= 0; i--) {
      const flyer = flyers[i];
      flyer.x -= (speed * flyer.speed + 45 * slowFactor) * dt;
      flyer.wing += dt * 12;
      const dx = bird.x - flyer.x;
      if(Math.abs(dx) < 32) {
        const dy = bird.y - flyer.y;
        if(Math.abs(dy) < 32 && !flyer.dead && Math.hypot(dx, dy) < bird.r * .72 + flyer.r * .72) {
          handleHit(flyer);
        }
      }
      if(flyer.x + flyer.r <= -10 || flyer.dead) {
        flyers.splice(i, 1);
      }
    }

    // Update Enemies (Enemy Bird & Bee Swarm with randomized trajectory + In-place cleanup)
    for(let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      e.x -= (speed * e.speed) * dt;
      e.wing += dt * 16;
      e.time += dt;

      if(e.type === 'bird') {
        if(e.pattern === 'zigzag') {
          if(!e.baseY) e.baseY = e.y;
          e.y = Math.max(75, Math.min(H - GROUND - 45, e.baseY + Math.sin(e.time * 5.0) * 38));
        } else if(e.pattern === 'dive') {
          e.y = Math.max(75, Math.min(H - GROUND - 45, e.y + Math.sin(e.time * 2.8) * 60 * dt + 18 * dt));
        } else if(e.pattern === 'swoop') {
          e.y = Math.max(75, Math.min(H - GROUND - 45, e.y - Math.sin(e.time * 2.8) * 60 * dt));
        }
      } else if(e.type === 'bee_swarm') {
        e.wobble += dt * 4.5;
        e.y = Math.max(75, Math.min(H - GROUND - 45, e.y + Math.sin(e.wobble) * 28 * dt));
      }

      const dx = bird.x - e.x;
      if(Math.abs(dx) < 32) {
        const dy = bird.y - e.y;
        if(Math.abs(dy) < 32 && !e.dead && Math.hypot(dx, dy) < bird.r * .72 + e.r * .72) {
          handleHit(e);
        }
      }
      if(e.x + e.r <= -15 || e.dead) {
        enemies.splice(i, 1);
      }
    }

    // Update Storm Clouds
    for(let i = stormClouds.length - 1; i >= 0; i--) {
      const c = stormClouds[i];
      c.timer -= dt;
      if(c.phase === 'warn') {
        if(c.timer <= 0) {
          c.phase = 'strike';
          c.timer = 0.38;
          audio.thunder();
          shake = 0.2;
          makeParticles(c.targetX, H - GROUND - 8, 12, '#fde047');
        }
      } else if(c.phase === 'strike') {
        // Lightning bolt collision check
        if(Math.abs(bird.x - c.targetX) < (bird.r + c.boltW * 0.45) && bird.y > c.y && bird.y < H - GROUND) {
          handleHit(c);
        }
        if(c.timer <= 0) {
          c.phase = 'fade';
          c.timer = 0.55;
        }
      }
      if(c.phase === 'fade' && c.timer <= 0) {
        stormClouds.splice(i, 1);
      }
    }

    // Update Power-Up Pickups
    for(let i = powerups.length - 1; i >= 0; i--) {
      const p = powerups[i];
      p.x -= speed * dt;
      p.bob += dt * 3;
      p.rot += dt * 2;
      const dx = bird.x - p.x;
      if(Math.abs(dx) < 32) {
        const dy = bird.y - (p.y + Math.sin(p.bob) * 5);
        if(Math.abs(dy) < 32 && Math.hypot(dx, dy) < bird.r + p.r) {
          p.collected = true;
          activatePowerup(p.type, p.x, p.y, false);
        }
      }
      if(p.collected || p.x + p.r <= -15) {
        powerups.splice(i, 1);
      }
    }

    // Update Coins (Magnet & Rocket Attraction) - HANYA DI MODE CLASSIC
    for(let i = coins.length - 1; i >= 0; i--) {
      const coin = coins[i];
      coin.x -= speed * dt;
      coin.spin += dt * 7;

      // Magnet pull & Rocket auto-vacuum
      if(activePowerups.magnet > 0 || activePowerups.rocket > 0) {
        const dx = bird.x - coin.x;
        const dy = bird.y - coin.y;
        const maxDist = activePowerups.rocket > 0 ? 320 : 170;
        if(Math.abs(dx) < maxDist && Math.abs(dy) < maxDist) {
          const dist = Math.hypot(dx, dy);
          if(dist < maxDist) {
            const pullSpeed = (1 - dist / maxDist) * 480 + 150;
            const angle = Math.atan2(dy, dx);
            coin.x += Math.cos(angle) * pullSpeed * dt;
            coin.y += Math.sin(angle) * pullSpeed * dt;
          }
        }
      }

      const dx = bird.x - coin.x;
      if(Math.abs(dx) < 28) {
        const dy = bird.y - coin.y;
        if(Math.abs(dy) < 28 && Math.hypot(dx, dy) < bird.r + coin.r) {
          coin.collected = true;
          if(currentMode !== 'ranked') {
            progress.coins++;
            persistProgress();
            updateCoins();
          }
          makeParticles(coin.x, coin.y, 8, '#ffe56b');
          audio.score();
        }
      }
      if(coin.collected || coin.x + coin.r <= -8) {
        coins.splice(i, 1);
      }
    }

    if(bird.y - bird.r < 0) {
      bird.y = bird.r + 2;
      bird.vy = Math.max(bird.vy, 40);
    }
    if(bird.y + bird.r > H - GROUND) {
      handleHit(null, true);
    }
    groundX = (groundX + speed * dt) % 30;

    skinTrail(dt);
    // In-place particle updates without new array creation
    for(let i = particles.length - 1; i >= 0; i--) {
      const q = particles[i];
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      if(q.rot !== undefined && q.vRot) q.rot += q.vRot * dt;
      if(q.spin !== undefined) q.spin += 6 * dt;
      if(q.wobble !== undefined) q.wobble += 5 * dt;
      if(q.type !== 'flame' && q.type !== 'bubble' && q.type !== 'lightning') q.vy += 90 * dt;
      q.life -= dt;
      if(q.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  // Helper: gambar rounded rect path pakai arcTo (100% kompatibel semua browser)
  function _rrPath(tc, x, y, w, h, r) {
    const rx = Math.min(Math.abs(r || 0), Math.abs(w) / 2, Math.abs(h) / 2);
    tc.beginPath();
    tc.moveTo(x + rx, y);
    tc.arcTo(x + w, y,     x + w, y + h, rx);
    tc.arcTo(x + w, y + h, x,     y + h, rx);
    tc.arcTo(x,     y + h, x,     y,     rx);
    tc.arcTo(x,     y,     x + w, y,     rx);
    tc.closePath();
  }

  function rr(x, y, w, h, r, targetCtx = ctx) {
    _rrPath(targetCtx, x, y, w, h, r);
    targetCtx.fill();
  }

  function rrTo(targetCtx, x, y, w, h, r) {
    _rrPath(targetCtx, x, y, w, h, r);
    targetCtx.fill();
  }


  function drawAuraParticleTo(targetCtx, q) {
    drawAuraParticle(q, targetCtx);
  }

  // Draw Tail Aura Particles
  function drawAuraParticle(q, targetCtx = ctx) {
    const alpha = Math.max(0, Math.min(1, q.life / (q.maxLife || 0.5)));
    targetCtx.save();
    targetCtx.globalAlpha = alpha;
    targetCtx.fillStyle = q.color;

    if(q.type === 'flame') {
      targetCtx.translate(q.x, q.y);
      targetCtx.rotate(q.rot || 0);
      const s = q.size * (0.6 + alpha * 0.4);
      targetCtx.beginPath();
      targetCtx.moveTo(0, -s * 1.5);
      targetCtx.bezierCurveTo(s * 0.9, -s * 0.5, s * 0.9, s * 0.8, 0, s);
      targetCtx.bezierCurveTo(-s * 0.9, s * 0.8, -s * 0.9, -s * 0.5, 0, -s * 1.5);
      targetCtx.fill();
      targetCtx.fillStyle = '#fff59d';
      targetCtx.beginPath();
      targetCtx.moveTo(0, -s * 0.8);
      targetCtx.bezierCurveTo(s * 0.45, -s * 0.2, s * 0.45, s * 0.5, 0, s * 0.6);
      targetCtx.bezierCurveTo(-s * 0.45, s * 0.5, -s * 0.45, -s * 0.2, 0, -s * 0.8);
      targetCtx.fill();
    } else if(q.type === 'lightning') {
      targetCtx.strokeStyle = q.color;
      targetCtx.lineWidth = 2.2;
      targetCtx.shadowColor = q.color;
      targetCtx.shadowBlur = 6;
      targetCtx.beginPath();
      targetCtx.moveTo(q.x, q.y);
      if(q.pts) {
        for(let i = 1; i < q.pts.length; i++) targetCtx.lineTo(q.x + q.pts[i].dx, q.y + q.pts[i].dy);
      }
      targetCtx.stroke();
    } else if(q.type === 'bubble') {
      const wobbleR = q.size * (1 + Math.sin(q.wobble || 0) * 0.12);
      targetCtx.translate(q.x, q.y);
      targetCtx.beginPath();
      targetCtx.arc(0, 0, wobbleR, 0, Math.PI * 2);
      targetCtx.strokeStyle = '#e0fbfc';
      targetCtx.lineWidth = 1.4;
      targetCtx.stroke();
      targetCtx.fillStyle = 'rgba(255,255,255,0.3)';
      targetCtx.fill();
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(-wobbleR * 0.35, -wobbleR * 0.35, wobbleR * 0.3, 0, Math.PI * 2);
      targetCtx.fill();
      if(q.life < 0.12) {
        targetCtx.strokeStyle = '#fff';
        targetCtx.lineWidth = 1;
        targetCtx.beginPath();
        targetCtx.arc(0, 0, wobbleR * 1.5, 0, Math.PI * 2);
        targetCtx.stroke();
      }
    } else if(q.type === 'heart') {
      targetCtx.translate(q.x, q.y);
      targetCtx.rotate(q.rot || 0);
      const s = q.size * (0.8 + Math.sin(performance.now() / 80) * 0.15);
      targetCtx.beginPath();
      targetCtx.moveTo(0, s * 0.3);
      targetCtx.bezierCurveTo(-s * 0.8, -s * 0.4, -s * 0.8, -s * 1.1, 0, -s * 0.5);
      targetCtx.bezierCurveTo(s * 0.8, -s * 1.1, s * 0.8, -s * 0.4, 0, s * 0.3);
      targetCtx.fill();
      targetCtx.fillStyle = 'rgba(255,255,255,0.45)';
      targetCtx.beginPath();
      targetCtx.arc(-s * 0.3, -s * 0.6, s * 0.2, 0, Math.PI * 2);
      targetCtx.fill();
    } else if(q.type === 'coin') {
      targetCtx.translate(q.x, q.y);
      const spinScale = Math.cos(q.spin || 0);
      targetCtx.scale(spinScale, 1);
      targetCtx.beginPath();
      targetCtx.arc(0, 0, q.size, 0, Math.PI * 2);
      targetCtx.fillStyle = '#fbbf24';
      targetCtx.fill();
      targetCtx.strokeStyle = '#d97706';
      targetCtx.lineWidth = 1.2;
      targetCtx.stroke();
      if(Math.abs(spinScale) > 0.4) {
        targetCtx.fillStyle = '#92400e';
        targetCtx.font = 'bold ' + Math.floor(q.size * 1.2) + 'px sans-serif';
        targetCtx.textAlign = 'center';
        targetCtx.textBaseline = 'middle';
        targetCtx.fillText('$', 0, 0);
      }
    } else if(q.type === 'planet') {
      targetCtx.translate(q.x, q.y);
      targetCtx.beginPath();
      targetCtx.arc(0, 0, q.size * 0.7, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#c084fc';
      targetCtx.lineWidth = 1.2;
      targetCtx.beginPath();
      targetCtx.ellipse(0, 0, q.size * 1.4, q.size * 0.4, -0.4, 0, Math.PI * 2);
      targetCtx.stroke();
    } else if(q.type === 'feather') {
      targetCtx.translate(q.x, q.y);
      targetCtx.rotate(q.rot || 0);
      targetCtx.beginPath();
      targetCtx.ellipse(0, 0, q.size * 1.3, q.size * 0.55, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#ffffff88';
      targetCtx.lineWidth = 1;
      targetCtx.beginPath();
      targetCtx.moveTo(-q.size * 1.2, 0);
      targetCtx.lineTo(q.size * 1.2, 0);
      targetCtx.stroke();
    } else if(q.type === 'rainbow_ribbon') {
      targetCtx.translate(q.x, q.y);
      targetCtx.rotate(q.rot || 0);
      targetCtx.beginPath();
      targetCtx.ellipse(0, 0, q.size * 1.2, q.size * 0.6, 0, 0, Math.PI * 2);
      targetCtx.fill();
    } else if(q.type === 'star' || q.type === 'sparkle') {
      targetCtx.translate(q.x, q.y);
      targetCtx.rotate(q.rot || 0);
      drawCanvasSparkle(targetCtx, 0, 0, q.size * 1.4);
    } else {
      targetCtx.beginPath();
      targetCtx.arc(q.x, q.y, q.size, 0, Math.PI * 2);
      targetCtx.fill();
    }
    targetCtx.restore();
  }

  function drawCanvasSparkle(targetCtx, x, y, r) {
    targetCtx.beginPath();
    targetCtx.moveTo(x, y - r);
    targetCtx.lineTo(x + r * 0.38, y);
    targetCtx.lineTo(x, y + r);
    targetCtx.lineTo(x - r * 0.38, y);
    targetCtx.closePath();
    targetCtx.fill();
  }

  function drawCanvasStar(targetCtx, x, y, rOut, rIn) {
    targetCtx.beginPath();
    for(let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? rOut : rIn;
      const a = i * Math.PI / 5 - Math.PI / 2;
      const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      if(i === 0) targetCtx.moveTo(px, py); else targetCtx.lineTo(px, py);
    }
    targetCtx.closePath();
    targetCtx.fill();
  }

  function drawCanvasIceCrystal(targetCtx, x, y, r) {
    targetCtx.save();
    targetCtx.strokeStyle = '#67e8f9';
    targetCtx.lineWidth = 1.4;
    targetCtx.beginPath();
    for(let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      targetCtx.moveTo(x, y);
      targetCtx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
    targetCtx.stroke();
    targetCtx.restore();
  }

  // Draw Power-Up Pickup Floating Item (Juicy Radiant Animated Holographic Bubble)
  function drawPowerup(p) {
    ctx.save();
    const now = performance.now();
    const bobY = p.y + Math.sin((p.bob || 0) + now / 250) * 6;
    ctx.translate(p.x, bobY);

    // Dynamic Thematic Glow Color
    const glowColor =
      p.type === 'heart' || p.type === 'extra_life' ? '#ef4444' :
      p.type === 'baby' ? '#fde047' :
      p.type === 'shield' ? '#38bdf8' :
      p.type === 'double_shield' ? '#0284c7' :
      p.type === 'magnet' ? '#f43f5e' :
      p.type === 'slow' || p.type === 'freeze' ? '#67e8f9' :
      p.type === 'star' ? '#f59e0b' :
      p.type === 'rocket' || p.type === 'missile' ? '#f97316' :
      p.type === 'zap' ? '#fde047' :
      p.type === 'bomb' ? '#ef4444' :
      p.type === 'tornado' ? '#38bdf8' :
      p.type === 'trap' ? '#facc15' : '#38bdf8';

    const pulse = Math.sin(now / 160) * 1.5;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 14;

    // 1. Holographic Iridescent Bubble Gradient
    const radGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, p.r + pulse);
    radGrad.addColorStop(0, '#ffffff');
    radGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.88)');
    radGrad.addColorStop(1, glowColor + '77');

    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(0, 0, p.r + pulse * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // 2. Animated Orbiting Glint Sparkles around Bubble
    for(let i = 0; i < 3; i++) {
      const ang = (now / 350) + (i * Math.PI * 2 / 3);
      const sx = Math.cos(ang) * (p.r + 4);
      const sy = Math.sin(ang) * (p.r + 4);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Power-Up Icons
    if(p.type === 'baby') {
      // Baby Chick Power-Up Icon inside Bubble
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 2, 7.5, 0, Math.PI * 2);
      ctx.fill();
      // Tiny wing
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.ellipse(-3.5, 3, 4, 2.4, -0.2, 0, Math.PI * 2);
      ctx.fill();
      // Beak
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(4, 0.5); ctx.lineTo(8.5, 2); ctx.lineTo(4, 3.5); ctx.closePath();
      ctx.fill();
      // Eye & sparkle
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(2.5, -0.5, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(3.1, -1.1, 0.7, 0, Math.PI * 2);
      ctx.fill();
      // Cheeks
      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.arc(1, 3.5, 1.4, 0, Math.PI * 2);
      ctx.fill();
      // Cute Ribbon on Head
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(-1, -5.5, 1.8, 0, Math.PI * 2);
      ctx.fill();
    } else if(p.type === 'heart') {
      // Extra Life Heart Icon
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      const s = 9;
      ctx.moveTo(0, s * 0.4);
      ctx.bezierCurveTo(-s * 0.8, -s * 0.4, -s * 0.8, -s * 1.1, 0, -s * 0.5);
      ctx.bezierCurveTo(s * 0.8, -s * 1.1, s * 0.8, -s * 0.4, 0, s * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fca5a5';
      ctx.beginPath();
      ctx.arc(-2.5, -4, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8.5px Trebuchet MS, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+1', 0, 0);
    } else if(p.type === 'shield') {
      // Shield
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(8, -5);
      ctx.lineTo(6, 4);
      ctx.lineTo(0, 9);
      ctx.lineTo(-6, 4);
      ctx.lineTo(-8, -5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.arc(0, -1, 3.5, 0, 7);
      ctx.fill();
    } else if(p.type === 'magnet') {
      // Magnet
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, 2, 7, Math.PI, 0);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#dc2626';
      ctx.stroke();
      // Silver poles
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-9, 2, 4, 4);
      ctx.fillRect(5, 2, 4, 4);
    } else if(p.type === 'slow') {
      // Ice Snowflake
      ctx.strokeStyle = '#0891b2';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for(let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * 7.5, Math.sin(a) * 7.5);
      }
      ctx.stroke();
      ctx.fillStyle = '#67e8f9';
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, 7);
      ctx.fill();
    } else if(p.type === 'star') {
      // Invincible Star
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      const cx = 0, cy = 0, rOut = 8.5, rIn = 4;
      for(let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? rOut : rIn;
        const a = i * Math.PI / 5 - Math.PI / 2;
        const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
        if(i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, 7);
      ctx.fill();
    } else if(p.type === 'rocket') {
      // NOS Rocket
      ctx.save();
      ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.quadraticCurveTo(5, -4, 4, 6);
      ctx.lineTo(-4, 6);
      ctx.quadraticCurveTo(-5, -4, 0, -9);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-6, 3, 2, 4);
      ctx.fillRect(4, 3, 2, 4);
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(-3, 6);
      ctx.lineTo(0, 11 + Math.sin(performance.now() / 60) * 2.5);
      ctx.lineTo(3, 6);
      ctx.closePath();
      ctx.fill();
    } else if(p.type === 'zap') {
      // Thunder Zap Lightning Icon
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(2, -9);
      ctx.lineTo(-6, 0);
      ctx.lineTo(0, 0);
      ctx.lineTo(-2, 9);
      ctx.lineTo(6, -1);
      ctx.lineTo(0, -1);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    } else if(p.type === 'missile') {
      // Red Shell Homing Missile Icon
      ctx.save();
      ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, -2, 6, Math.PI, 0);
      ctx.lineTo(6, 6);
      ctx.lineTo(-6, 6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 1, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-4, 6, 8, 3);
      ctx.restore();
    } else if(p.type === 'trap') {
      // Slippery Banana Peel Icon
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 2, 6, 0, Math.PI);
      ctx.bezierCurveTo(-8, -4, -4, -8, 0, -2);
      ctx.bezierCurveTo(4, -8, 8, -4, 0, 2);
      ctx.fill();
      ctx.strokeStyle = '#a16207';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    } else if(p.type === 'bomb') {
      // Mega Bomb Cannonball Icon
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(0, 2, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-2, -7, 4, 3);
      // Sparking fuse
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(2, -8, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(2.5, -8.5, 0.9, 0, Math.PI * 2);
      ctx.fill();
    } else if(p.type === 'tornado') {
      // Tornado Wind Vortex Icon
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(0, -6, 7, 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, -1, 5, 1.6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, 4, 3, 1.2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, 7, 1.5, 0.8, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if(p.type === 'freeze') {
      // Blizzard Subzero Freeze Icon
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for(let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * 7.5, Math.sin(a) * 7.5);
      }
      ctx.stroke();
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw Enemy Bird
  function drawEnemyBird(e) {
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.scale(-1, 1); // Facing left towards player

    // Evil Body
    ctx.fillStyle = '#4c0519';
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 13, 0, 0, 7);
    ctx.fill();

    // Horns / Spikes
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.moveTo(-4, -10); ctx.lineTo(-7, -19); ctx.lineTo(-1, -11);
    ctx.moveTo(4, -10); ctx.lineTo(7, -19); ctx.lineTo(1, -11);
    ctx.fill();

    // Dark Wing
    ctx.fillStyle = '#881337';
    ctx.save();
    ctx.rotate(Math.sin(e.wing) * .6);
    ctx.beginPath();
    ctx.ellipse(-4, -4, 9, 5, -.45, 0, 7);
    ctx.fill();
    ctx.restore();

    // Glowing Red Evil Eye
    ctx.fillStyle = '#f43f5e';
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(6, -4, 4.5, 0, 7);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(7.5, -4.5, 1.6, 0, 7);
    ctx.fill();

    // Sharp Beak
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(13, -2); ctx.lineTo(22, 3); ctx.lineTo(13, 6);
    ctx.fill();

    ctx.restore();
  }

  // Draw Bee Swarm
  function drawBeeSwarm(b) {
    ctx.save();
    ctx.translate(b.x, b.y);

    const bees = [
      { dx: 0, dy: 0, s: 1.0 },
      { dx: 9, dy: -8, s: 0.8 },
      { dx: 9, dy: 8, s: 0.8 }
    ];

    for(const bee of bees) {
      ctx.save();
      ctx.translate(bee.dx, bee.dy);
      ctx.scale(bee.s, bee.s);

      // Flapping Translucent Wings
      ctx.fillStyle = 'rgba(224, 242, 254, 0.75)';
      ctx.beginPath();
      ctx.ellipse(-2, -6 + Math.sin(b.wing * 1.5) * 2, 6, 3, -0.4, 0, 7);
      ctx.ellipse(2, -6 - Math.sin(b.wing * 1.5) * 2, 6, 3, 0.4, 0, 7);
      ctx.fill();

      // Yellow Bee Body
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 6, 0, 0, 7);
      ctx.fill();

      // Black Stripes
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-2, -5.5, 2.5, 11);
      ctx.fillRect(3, -4.5, 2.5, 9);

      // Stinger
      ctx.beginPath();
      ctx.moveTo(-8, 0); ctx.lineTo(-12, 0); ctx.lineTo(-8, 2);
      ctx.fill();

      // Eye
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(5, -2, 1.5, 0, 7);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  // Draw Storm Cloud & Lightning Strike
  function drawStormCloud(c) {
    ctx.save();

    // 1. Warning Phase: Danger Beam & Warning Icon
    if(c.phase === 'warn') {
      const alpha = 0.18 + Math.sin(performance.now() / 60) * 0.12;
      ctx.fillStyle = `rgba(253, 224, 71, ${alpha})`;
      ctx.fillRect(c.targetX - c.boltW / 2, c.y + 15, c.boltW, H - GROUND - c.y - 15);

      // Warning Danger Dashed Line
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(c.targetX, c.y + 20);
      ctx.lineTo(c.targetX, H - GROUND);
      ctx.stroke();
      ctx.setLineDash([]);

      // Warning Danger Indicator on Ground
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(c.targetX, H - GROUND - 16, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('!', c.targetX, H - GROUND - 16);
    }

    // 2. Strike Phase: Vertical Jagged Lightning Bolt
    if(c.phase === 'strike') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(c.targetX, c.y + 15);
      
      const segments = 9;
      const stepY = (H - GROUND - c.y - 15) / segments;
      for(let i = 1; i < segments; i++) {
        const offX = (Math.random() - .5) * 22;
        ctx.lineTo(c.targetX + offX, c.y + 15 + i * stepY);
      }
      ctx.lineTo(c.targetX, H - GROUND);
      ctx.stroke();

      // Outer Yellow Aura
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 10;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;
    }

    // 3. Storm Cloud Body
    const cloudAlpha = c.phase === 'fade' ? Math.max(0, c.timer / 0.55) : 1;
    ctx.globalAlpha = cloudAlpha;
    ctx.translate(c.targetX, c.y);
    ctx.fillStyle = '#334155';
    for(const [a, b, r] of [[0, 0, 18], [15, -4, 15], [-15, -3, 14], [25, 4, 11], [-25, 4, 10]]) {
      ctx.beginPath();
      ctx.arc(a, b, r, 0, 7);
      ctx.fill();
    }
    ctx.fillRect(-24, 2, 50, 14);

    // Internal Lightning Glow inside Cloud
    if(c.phase === 'warn' && Math.random() < 0.35) {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, 7);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawShockwaves() {
    for(const sw of shockwaves) {
      const alpha = Math.max(0, sw.life / (sw.maxLife || 0.5));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 3 * alpha + 1.2;
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawFloatingTexts() {
    for(const ft of floatingTexts) {
      const alpha = Math.max(0, Math.min(1, ft.life / 0.35));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = '900 13px Trebuchet MS, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3.5;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillStyle = ft.color || '#fff';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  // Update & Combat AI untuk Pet Pendamping & Skill Unik
  function updateBabyBirds(dt, speed, slowFactor) {
    const now = performance.now();
    const petId = progress.selectedPet || 'pip_peep';
    if(petId === 'none') return;
    const petData = petsCatalog[petId] || petsCatalog.pip_peep;

    // 1. SKILL: MOMO & HANA (Sakura Lotus Barrier - perisai otomatis tiap 10 detik)
    if(petData.skillType === 'barrier') {
      petSkillTimer += dt;
      if(petSkillTimer >= (petData.barrierCooldown || 10.0)) {
        if(!activePowerups.shield) {
          petSkillTimer = 0;
          activePowerups.shield = true;
          activePowerups.shieldCount = 1;
          activePowerups.shieldType = 'sakura';
          audio.powerup('shield');
          triggerPowerupSplash(bird.x, bird.y, 'shield');
          floatingTexts.push({
            x: bird.x, y: bird.y - 24,
            text: 'SAKURA LOTUS SHIELD!',
            color: '#f472b6',
            vy: -60, life: 0.9, maxLife: 0.9
          });
          makeParticles(bird.x, bird.y, 24, '#f472b6');
          makeParticles(bird.x, bird.y, 16, '#fda4af');
          updatePowerupHUD();
        }
      }
    }

    // 2. SKILL: PIXEL & GLITCH (Auto EMP Laser Zap - menembak musuh tiap 3.0 detik)
    if(petData.skillType === 'laser') {
      petSkillTimer += dt;
      if(petSkillTimer >= (petData.laserCooldown || 3.0)) {
        const laserTarget = enemies.find(e => !e.dead && e.x > bird.x + 10 && e.x < bird.x + 280) ||
                            flyers.find(f => !f.dead && f.x > bird.x + 10 && f.x < bird.x + 280) ||
                            stormClouds.find(c => (c.phase === 'warn' || c.phase === 'strike') && c.targetX > bird.x + 10 && c.targetX < bird.x + 280);
        if(laserTarget) {
          petSkillTimer = 0;
          const targetX = laserTarget.x !== undefined ? laserTarget.x : laserTarget.targetX;
          const targetY = laserTarget.y !== undefined ? laserTarget.y : (laserTarget.y || 120) + 15;
          if(laserTarget.phase) {
            laserTarget.phase = 'fade';
            laserTarget.timer = 0.05;
          } else {
            laserTarget.dead = true;
            laserTarget.x = -999;
          }
          laserBeams.push({
            x1: babyBirds[0].x, y1: babyBirds[0].y,
            x2: targetX, y2: targetY,
            life: 0.35
          });
          audio.rocketSmash();
          addScore();
          floatingTexts.push({
            x: targetX, y: targetY - 18,
            text: 'EMP ZAP! +1',
            color: '#38bdf8',
            vy: -65, life: 0.85, maxLife: 0.85
          });
          makeParticles(targetX, targetY, 24, '#38bdf8');
          makeParticles(targetX, targetY, 18, '#00f5d4');
          shockwaves.push({
            x: targetX, y: targetY, r: 6, maxR: 52,
            color: '#00f5d4', life: 0.3, maxLife: 0.3
          });
          shake = 0.2;
          updatePowerupHUD();
        }
      }
    }

    // 3. SKILL: BLAZE & EMBER (Phoenix Scorcher - semburan api naga membakar musuh dalam radius 190px)
    if(petData.skillType === 'fire') {
      const burnReach = 190;
      for(const e of enemies) {
        if(!e.dead && e.x > bird.x - 15 && e.x < bird.x + burnReach && Math.abs(e.y - bird.y) < 55) {
          e.dead = true;
          e.x = -999;
          audio.rocketSmash();
          addScore();
          floatingTexts.push({
            x: e.x, y: e.y - 18,
            text: 'INCINERATED! +1',
            color: '#f97316',
            vy: -65, life: 0.8, maxLife: 0.8
          });
          makeParticles(e.x, e.y, 28, '#f97316');
          makeParticles(e.x, e.y, 20, '#fde047');
          shockwaves.push({ x: e.x, y: e.y, r: 8, maxR: 65, color: '#f97316', life: 0.35, maxLife: 0.35 });
          shake = 0.22;
        }
      }
      for(const f of flyers) {
        if(!f.dead && f.x > bird.x - 15 && f.x < bird.x + burnReach && Math.abs(f.y - bird.y) < 55) {
          f.dead = true;
          f.x = -999;
          audio.rocketSmash();
          addScore();
          floatingTexts.push({
            x: f.x, y: f.y - 18,
            text: 'INCINERATED! +1',
            color: '#f97316',
            vy: -65, life: 0.8, maxLife: 0.8
          });
          makeParticles(f.x, f.y, 28, '#f97316');
          makeParticles(f.x, f.y, 20, '#fde047');
          shockwaves.push({ x: f.x, y: f.y, r: 8, maxR: 65, color: '#f97316', life: 0.35, maxLife: 0.35 });
          shake = 0.22;
        }
      }
      for(const c of stormClouds) {
        if((c.phase === 'warn' || c.phase === 'strike') && c.targetX > bird.x - 15 && c.targetX < bird.x + burnReach && Math.abs(c.y + 15 - bird.y) < 65) {
          c.phase = 'fade';
          c.timer = 0.05;
          audio.rocketSmash();
          addScore();
          floatingTexts.push({
            x: c.targetX, y: c.y - 18,
            text: 'VAPORIZED! +1',
            color: '#f97316',
            vy: -65, life: 0.8, maxLife: 0.8
          });
          makeParticles(c.targetX, c.y + 15, 28, '#f97316');
          makeParticles(c.targetX, c.y + 15, 20, '#fde047');
          shockwaves.push({ x: c.targetX, y: c.y + 15, r: 8, maxR: 65, color: '#f97316', life: 0.35, maxLife: 0.35 });
          shake = 0.22;
        }
      }
    }

    // 4. SKILL: PIP & PEEP (Bodyguard Intercept & 11s Respawn)
    if(petData.skillType === 'bodyguard') {
      // 1. Kumpulkan musuh yang mendekat di area bahaya
      const activeTargets = [];
      for(const e of enemies) {
        if(!e.dead && e.x > bird.x - 25 && e.x < bird.x + 280) {
          activeTargets.push(e);
        }
      }
      for(const f of flyers) {
        if(!f.dead && f.x > bird.x - 25 && f.x < bird.x + 280) {
          activeTargets.push(f);
        }
      }
      for(const c of stormClouds) {
        if((c.phase === 'warn' || c.phase === 'strike') && c.targetX > bird.x - 25 && c.targetX < bird.x + 280) {
          activeTargets.push({
            x: c.targetX,
            y: c.y + 15,
            r: 20,
            isStormCloud: true,
            cloudRef: c
          });
        }
      }

      activeTargets.sort((a, b) => (a.x - bird.x) - (b.x - bird.x));

      // 2. Jika ada musuh mendekat, tugaskan 1 anak burung yang idle untuk maju menyerang
      for(const target of activeTargets) {
        const isAlreadyTargeted = babyBirds.some(b => b.targetEnemy === target);
        if(!isAlreadyTargeted) {
          const availableBaby = babyBirds.find(b => b.state === 'follow');
          if(availableBaby) {
            availableBaby.state = 'intercept';
            availableBaby.targetEnemy = target;
            audio.babyChirp();
            makeParticles(availableBaby.x, availableBaby.y, 10, availableBaby.color);
          }
        }
      }
    }

    // 5. Update animasi & pergerakan tiap anak burung pet
    babyBirds.forEach((b, idx) => {
      if(b.state === 'inactive') return;

      if(b.state === 'dead') {
        b.respawnTimer = Math.max(0, (b.respawnTimer || 0) - dt);
        if(b.respawnTimer <= 0) {
          b.state = 'follow';
          b.x = bird.x - 22 - (idx * 4);
          b.y = idx === 0 ? bird.y - 18 : bird.y + 18;
          b.angle = 0;
          b.flipAngle = 0;
          audio.babyChirp();
          makeParticles(b.x, b.y, 18, b.color);
          floatingTexts.push({
            x: bird.x,
            y: bird.y - 25,
            text: b.name + ' HATCHED!',
            color: b.color,
            vy: -60,
            life: 0.85, maxLife: 0.85
          });
          updatePowerupHUD();
        }
        return;
      }

      b.wing += dt * 26;

      if(b.state === 'follow') {
        const tOffset = idx === 0 ? 0 : Math.PI;
        const fx = bird.x - 22 - (idx * 4) + Math.cos(now / 280 + tOffset) * 7;
        const fy = idx === 0
          ? bird.y - 18 + Math.sin(now / 220) * 6
          : bird.y + 18 + Math.sin(now / 240 + Math.PI) * 6;

        b.x += (fx - b.x) * 12 * dt;
        b.y += (fy - b.y) * 12 * dt;
        b.angle = Math.max(-0.25, Math.min(0.25, (fy - b.y) * 0.05));
        b.flipAngle = 0;

        if(Math.random() < 0.08) {
          particles.push({
            x: b.x - 8,
            y: b.y + (Math.random() - 0.5) * 4,
            vx: -50 - Math.random() * 20,
            vy: (Math.random() - 0.5) * 15,
            life: 0.35, maxLife: 0.35,
            color: b.color,
            size: 2 + Math.random() * 2,
            type: 'sparkle'
          });
        }
      } else if(b.state === 'intercept') {
        const target = b.targetEnemy;
        if(!target || target.dead || target.x < -30) {
          b.state = 'return';
          b.targetEnemy = null;
          return;
        }

        const targetX = target.x;
        const targetY = target.y;
        const dx = targetX - b.x;
        const dy = targetY - b.y;
        const dist = Math.hypot(dx, dy);

        b.angle = Math.atan2(dy, dx);
        b.flipAngle += dt * 18;

        const attackSpeed = 580;
        b.x += (dx / Math.max(1, dist)) * attackSpeed * dt;
        b.y += (dy / Math.max(1, dist)) * attackSpeed * dt;

        // Jejak dash anak burung
        particles.push({
          x: b.x - 6,
          y: b.y + (Math.random() - 0.5) * 4,
          vx: -120 - Math.random() * 40,
          vy: (Math.random() - 0.5) * 30,
          life: 0.22, maxLife: 0.22,
          color: Math.random() < 0.5 ? '#fde047' : b.color,
          size: 2.5 + Math.random() * 2.5,
          type: 'sparkle'
        });

        // Tabrakan dan hancurkan musuh
        const hitDist = b.r + (target.r || 15) + 6;
        if(dist <= hitDist) {
          if(target.isStormCloud && target.cloudRef) {
            target.cloudRef.phase = 'fade';
            target.cloudRef.timer = 0.05;
          } else {
            target.dead = true;
            target.x = -999;
          }

          audio.babyAttack();
          shake = 0.22;
          makeParticles(targetX, targetY, 24, '#fde047');
          makeParticles(targetX, targetY, 20, b.color);
          makeParticles(targetX, targetY, 12, '#ffffff');
          addScore();

          shockwaves.push({
            x: targetX, y: targetY, r: 6, maxR: 52,
            color: b.color,
            life: 0.38, maxLife: 0.38
          });

          floatingTexts.push({
            x: targetX, y: targetY - 16,
            text: b.name + ' SMASH! +1',
            color: b.color,
            vy: -70,
            life: 0.85, maxLife: 0.85
          });

          // Anak burung sekali nabrak musuh LANGSUNG MATI (korbankan diri) & respawn 11 detik!
          b.state = 'dead';
          b.respawnTimer = petData.respawnTime || 11.0;
          b.targetEnemy = null;
          updatePowerupHUD();
        }
      } else if(b.state === 'return') {
        const tOffset = idx === 0 ? 0 : Math.PI;
        const fx = bird.x - 22 - (idx * 4) + Math.cos(now / 280 + tOffset) * 7;
        const fy = idx === 0
          ? bird.y - 18 + Math.sin(now / 220) * 6
          : bird.y + 18 + Math.sin(now / 240 + Math.PI) * 6;

        const dx = fx - b.x;
        const dy = fy - b.y;
        const dist = Math.hypot(dx, dy);

        b.angle = Math.atan2(dy, dx);
        b.flipAngle += dt * 10;

        const returnSpeed = 440;
        b.x += (dx / Math.max(1, dist)) * returnSpeed * dt;
        b.y += (dy / Math.max(1, dist)) * returnSpeed * dt;

        if(dist < 18) {
          b.state = 'follow';
          b.angle = 0;
          b.flipAngle = 0;
        }
      }
    });
  }

  // Render Anak Burung Super Lucu (Chibi Guardian Bird) / Telur Menetas
  function drawBabyBird(b, targetCtx = ctx) {
    if(b.state === 'inactive') return;

    // Saat mati/respawn: Gambarkan Telur Menetas Bergoyang Imut & Timer
    if(b.state === 'dead') {
      targetCtx.save();
      const eggX = b.id === 0 ? bird.x - 22 : bird.x - 26;
      const eggY = b.id === 0 ? bird.y - 18 : bird.y + 18;
      targetCtx.translate(eggX, eggY);
      const wobble = Math.sin(performance.now() / 90) * 0.18;
      targetCtx.rotate(wobble);

      targetCtx.shadowColor = b.color;
      targetCtx.shadowBlur = 8;

      // Cangkang Telur Pastel
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 0, 7.5, 9.5, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // Corak Bintik Warna Pet
      targetCtx.fillStyle = b.color;
      targetCtx.beginPath();
      targetCtx.arc(-2, -3, 1.4, 0, Math.PI * 2);
      targetCtx.arc(2.5, 2, 1.6, 0, Math.PI * 2);
      targetCtx.arc(-1, 4.5, 1.2, 0, Math.PI * 2);
      targetCtx.fill();

      // Retakan Zigzag Cangkang Menetas
      targetCtx.strokeStyle = '#f59e0b';
      targetCtx.lineWidth = 1.3;
      targetCtx.beginPath();
      targetCtx.moveTo(-4, -1);
      targetCtx.lineTo(-1, 1);
      targetCtx.lineTo(2, -2);
      targetCtx.lineTo(4, 0);
      targetCtx.stroke();

      targetCtx.restore();
      return;
    }
    const br = Number.isFinite(b.r) ? b.r : 8.5;
    const bColor = b.color || '#facc15';
    const bWingColor = b.wingColor || '#eab308';
    const bBlushColor = b.blushColor || '#fda4af';
    const bAngle = Number.isFinite(b.angle) ? b.angle : 0;
    const bFlip = Number.isFinite(b.flipAngle) ? b.flipAngle : 0;

    targetCtx.save();
    targetCtx.translate(b.x || 0, b.y || 0);
    targetCtx.rotate(bAngle + (b.state === 'intercept' ? bFlip : 0));

    // Pendaran Aura Lembut
    targetCtx.shadowColor = bColor;
    targetCtx.shadowBlur = b.state === 'intercept' ? 14 : 7;

    // Tubuh Bulat Mungil Pastel
    const bodyGrad = targetCtx.createRadialGradient(-2, -2, 2, 0, 0, br);
    bodyGrad.addColorStop(0, '#ffffff');
    bodyGrad.addColorStop(0.35, bColor);
    bodyGrad.addColorStop(1, bWingColor);

    targetCtx.fillStyle = bodyGrad;
    targetCtx.beginPath();
    targetCtx.arc(0, 0, br, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.shadowBlur = 0;

    // Pipi Merona Merah Muda (Blushing Cheeks)
    targetCtx.fillStyle = bBlushColor;
    targetCtx.beginPath();
    targetCtx.arc(3.2, 3.0, 2.2, 0, Math.PI * 2);
    targetCtx.arc(-2.5, 3.0, 2.0, 0, Math.PI * 2);
    targetCtx.fill();

    // Sayap Mungil Mengepak Cepat
    const flap = Math.sin(b.wing || 0) * 0.55;
    targetCtx.save();
    targetCtx.translate(-4, 1);
    targetCtx.rotate(flap);
    targetCtx.fillStyle = bWingColor;
    targetCtx.beginPath();
    targetCtx.ellipse(0, 0, 5.5, 3.5, -0.2, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.restore();

    // Paruh Mungil Oranye
    targetCtx.fillStyle = '#f97316';
    targetCtx.beginPath();
    targetCtx.moveTo(br - 2, -1.5);
    targetCtx.lineTo(br + 4.5, 0.5);
    targetCtx.lineTo(br - 2, 2.5);
    targetCtx.closePath();
    targetCtx.fill();

    // Mata Boba Besar Berkilau (Sparkly Anime Eyes)
    targetCtx.fillStyle = '#0f172a';
    targetCtx.beginPath();
    targetCtx.arc(3, -2.5, 3.2, 0, Math.PI * 2);
    targetCtx.fill();

    // Kilau Cahaya di Mata
    targetCtx.fillStyle = '#ffffff';
    targetCtx.beginPath();
    targetCtx.arc(4.0, -3.5, 1.4, 0, Math.PI * 2);
    targetCtx.arc(2.0, -1.5, 0.8, 0, Math.PI * 2);
    targetCtx.fill();

    // Aksesori Kepala Imut
    if(b.accessory === 'ribbon') {
      // Pita Merah Muda Cantik (Pip / Momo)
      targetCtx.fillStyle = '#f472b6';
      targetCtx.beginPath();
      targetCtx.moveTo(-1, -b.r); targetCtx.lineTo(-5, -b.r - 4); targetCtx.lineTo(-1, -b.r - 2); targetCtx.closePath();
      targetCtx.moveTo(-1, -b.r); targetCtx.lineTo(3, -b.r - 4); targetCtx.lineTo(-1, -b.r - 2); targetCtx.closePath();
      targetCtx.fill();
      targetCtx.fillStyle = '#fbcfe8';
      targetCtx.beginPath();
      targetCtx.arc(-1, -b.r - 1.5, 1.4, 0, Math.PI * 2);
      targetCtx.fill();
    } else if(b.accessory === 'flower') {
      // Bunga Sakura Mini (Peep / Hana)
      targetCtx.fillStyle = '#f472b6';
      for(let a = 0; a < 5; a++) {
        const rad = (a * Math.PI * 2) / 5;
        targetCtx.beginPath();
        targetCtx.arc(-1 + Math.cos(rad) * 2.4, -b.r - 2.2 + Math.sin(rad) * 2.4, 1.4, 0, Math.PI * 2);
        targetCtx.fill();
      }
      targetCtx.fillStyle = '#fef08a';
      targetCtx.beginPath();
      targetCtx.arc(-1, -b.r - 2.2, 1.1, 0, Math.PI * 2);
      targetCtx.fill();
    } else if(b.accessory === 'halo') {
      // Golden Angel Halo (Aero / Lumos)
      targetCtx.strokeStyle = '#fde047';
      targetCtx.lineWidth = 1.6;
      targetCtx.shadowColor = '#fef08a';
      targetCtx.shadowBlur = 6;
      targetCtx.beginPath();
      targetCtx.ellipse(0, -b.r - 4.5, 4.5, 1.8, 0, 0, Math.PI * 2);
      targetCtx.stroke();
      targetCtx.shadowBlur = 0;
    } else if(b.accessory === 'antenna') {
      // Cyber Neon Antenna (Pixel / Glitch)
      targetCtx.strokeStyle = '#0284c7';
      targetCtx.lineWidth = 1.5;
      targetCtx.beginPath();
      targetCtx.moveTo(0, -b.r);
      targetCtx.lineTo(0, -b.r - 5.5);
      targetCtx.stroke();
      targetCtx.fillStyle = '#38bdf8';
      targetCtx.shadowColor = '#38bdf8';
      targetCtx.shadowBlur = 6;
      targetCtx.beginPath();
      targetCtx.arc(0, -b.r - 6, 2, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.shadowBlur = 0;
    } else if(b.accessory === 'flame') {
      // Phoenix Flame Tuft (Blaze / Ember)
      targetCtx.fillStyle = '#f97316';
      targetCtx.beginPath();
      targetCtx.moveTo(-2, -b.r);
      targetCtx.quadraticCurveTo(0, -b.r - 6, 3, -b.r - 7);
      targetCtx.quadraticCurveTo(1, -b.r - 3, 2, -b.r);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.fillStyle = '#fde047';
      targetCtx.beginPath();
      targetCtx.arc(0, -b.r - 1.5, 1.3, 0, Math.PI * 2);
      targetCtx.fill();
    } else if(b.accessory === 'horns') {
      // Cute Imp Horns (Kuro / Void)
      targetCtx.fillStyle = '#7e22ce';
      targetCtx.beginPath();
      targetCtx.moveTo(-3, -b.r + 1); targetCtx.lineTo(-5, -b.r - 4); targetCtx.lineTo(-1, -b.r); targetCtx.closePath();
      targetCtx.moveTo(1, -b.r); targetCtx.lineTo(3, -b.r - 4); targetCtx.lineTo(3, -b.r + 1); targetCtx.closePath();
      targetCtx.fill();
    }

    targetCtx.restore();
  }

  function drawSupersonicSpeedlines() {
    if(activePowerups.rocket <= 0 && dashTimer <= 0) return;
    ctx.save();
    ctx.strokeStyle = dashTimer > 0 ? 'rgba(56, 189, 248, 0.55)' : 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = dashTimer > 0 ? 2.4 : 1.8;
    const now = performance.now();
    for(let i = 0; i < 11; i++) {
      const ly = (i * 62 + (now * 0.4) % 640) % (H - GROUND);
      const lx = ((now * 2.2 + i * 85) % (W + 200)) - 100;
      const len = (dashTimer > 0 ? 65 : 45) + (i % 3) * 35;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx - len, ly);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawLaserBeams() {
    for(const lb of laserBeams) {
      ctx.save();
      const alpha = Math.max(0, lb.life / 0.35);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 5.2;
      ctx.shadowColor = '#00f5d4';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(lb.x1, lb.y1);
      ctx.lineTo(lb.x2, lb.y2);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Electrical Arc Sparks
      for(let i = 0; i < 3; i++) {
        const t = Math.random();
        const mx = lb.x1 + (lb.x2 - lb.x1) * t + (Math.random() - 0.5) * 16;
        const my = lb.y1 + (lb.y2 - lb.y1) * t + (Math.random() - 0.5) * 16;
        ctx.fillStyle = '#00f5d4';
        ctx.beginPath();
        ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      lb.life -= 1 / 60;
    }
    laserBeams = laserBeams.filter(lb => lb.life > 0);
  }

  // Sinuous Procedural Lightning Bolt Arcs for Thunder Zap
  function drawLightningBolts() {
    for(const lb of lightningBolts) {
      const alpha = Math.max(0, lb.life / (lb.maxLife || 0.45));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = lb.color || '#fde047';
      ctx.lineWidth = 4.8 * alpha;
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      if(lb.points && lb.points.length > 0) {
        ctx.moveTo(lb.points[0].x, lb.points[0].y);
        for(let i = 1; i < lb.points.length; i++) {
          ctx.lineTo(lb.points[i].x, lb.points[i].y);
        }
      }
      ctx.stroke();

      // Bright white electric inner core
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.2 * alpha;
      ctx.stroke();
      ctx.restore();
    }
  }

  // Massive Fire Effects for Phoenix Sparks (Blaze & Ember)
  function drawPhoenixFlames() {
    if(progress.selectedPet !== 'blaze_ember' || state !== State.PLAYING) return;
    const now = performance.now();
    
    ctx.save();
    const bx = bird.x, by = bird.y;
    const flameReach = 190 + Math.sin(now / 50) * 22;
    const flameSpread = 46 + Math.sin(now / 70) * 10;

    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 22;

    // Layer 1: Crimson & Scarlet Outer Roaring Dragon Fire Plume
    const fireGrad1 = ctx.createRadialGradient(bx + 20, by, 10, bx + 110, by, flameReach);
    fireGrad1.addColorStop(0, 'rgba(239, 68, 68, 0.95)');
    fireGrad1.addColorStop(0.4, 'rgba(249, 115, 22, 0.75)');
    fireGrad1.addColorStop(0.85, 'rgba(234, 88, 12, 0.4)');
    fireGrad1.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = fireGrad1;
    ctx.beginPath();
    ctx.moveTo(bx + 14, by - 14);
    ctx.bezierCurveTo(bx + 80, by - flameSpread, bx + flameReach * 0.7, by - flameSpread * 0.9, bx + flameReach, by);
    ctx.bezierCurveTo(bx + flameReach * 0.7, by + flameSpread * 0.9, bx + 80, by + flameSpread, bx + 14, by + 14);
    ctx.closePath();
    ctx.fill();

    // Layer 2: Radiant Orange & Blazing Yellow Mid Flame
    const fireGrad2 = ctx.createLinearGradient(bx + 14, by, bx + flameReach * 0.85, by);
    fireGrad2.addColorStop(0, '#ffffff');
    fireGrad2.addColorStop(0.2, '#fde047');
    fireGrad2.addColorStop(0.65, '#f97316');
    fireGrad2.addColorStop(1, 'rgba(249, 115, 22, 0)');
    ctx.fillStyle = fireGrad2;
    ctx.beginPath();
    ctx.moveTo(bx + 18, by - 8);
    ctx.bezierCurveTo(bx + 65, by - flameSpread * 0.6, bx + flameReach * 0.55, by - flameSpread * 0.5, bx + flameReach * 0.8, by);
    ctx.bezierCurveTo(bx + flameReach * 0.55, by + flameSpread * 0.5, bx + 65, by + flameSpread * 0.6, bx + 18, by + 8);
    ctx.closePath();
    ctx.fill();

    // Layer 3: White-Hot Ignition Core Jet Tip
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(bx + 26, by, 14 + Math.sin(now / 35) * 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Swirling Fiery Sparks, Burning Embers & Fireballs
    for(let i = 0; i < 6; i++) {
      const ex = bx + 22 + ((now * 0.4 + i * 38) % flameReach);
      const ey = by + Math.sin((now * 0.012) + i * 1.8) * (flameSpread * 0.7);
      ctx.fillStyle = i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? '#fde047' : '#ff3b00';
      ctx.beginPath();
      ctx.arc(ex, ey, 2.8 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Fiery Scorched Flame Overlay on Upcoming Pipes
    for(const p of pipes) {
      if(p.x > bx - 15 && p.x < bx + flameReach + 30) {
        ctx.fillStyle = 'rgba(249, 115, 22, 0.55)';
        ctx.fillRect(p.x - 3, p.gapY - 14, p.w + 6, 16);
        ctx.fillRect(p.x - 3, p.gapY + p.gapSize - 2, p.w + 6, 16);
        // Embers dancing on pipe
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(p.x + Math.random() * p.w, p.gapY - 12 - Math.random() * 8, 2, 0, Math.PI * 2);
        ctx.arc(p.x + Math.random() * p.w, p.gapY + p.gapSize + 8 + Math.random() * 8, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  // Divine Golden Light Beam for Aero & Lumos
  function drawHolyAura() {
    if(progress.selectedPet !== 'aero_lumos' || state !== State.PLAYING) return;
    const now = performance.now();
    ctx.save();
    const bx = bird.x, by = bird.y;

    // Golden Ray of Light descending from sky onto bird
    const rayAlpha = 0.22 + Math.sin(now / 140) * 0.1;
    const rayGrad = ctx.createLinearGradient(0, 0, 0, by);
    rayGrad.addColorStop(0, `rgba(254, 240, 138, ${rayAlpha * 1.6})`);
    rayGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = rayGrad;
    ctx.beginPath();
    ctx.moveTo(bx - 36, 0);
    ctx.lineTo(bx + 36, 0);
    ctx.lineTo(bx + 20, by);
    ctx.lineTo(bx - 20, by);
    ctx.closePath();
    ctx.fill();

    // Holy Halo Ring above head
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2.4;
    ctx.shadowColor = '#fde047';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.ellipse(bx, by - 24, 15, 5.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Floating Golden Stardust
    for(let i = 0; i < 3; i++) {
      const sx = bx - 14 + ((now * 0.08 + i * 22) % 35);
      const sy = by - 12 + Math.sin(now * 0.008 + i) * 18;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, sy, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Void Shadow Nebula & Dark Runes for Kuro & Void
  function drawShadowVortex() {
    if(progress.selectedPet !== 'kuro_void' || state !== State.PLAYING) return;
    const now = performance.now();
    ctx.save();
    const bx = bird.x, by = bird.y;

    // Dark Purple Swirling Shadow Aura
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(-now / 320);
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.55)';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = '#7e22ce';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    for(let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      const sr = 23 + Math.sin(now / 110 + i) * 3.5;
      ctx.arc(Math.cos(a) * 6, Math.sin(a) * 6, sr, a, a + Math.PI * 0.7);
    }
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  function render() {
    // Reset TOTAL context state setiap frame agar error save/restore di frame lalu tidak merusak render baru
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    ctx.save();
    let _step = 'init';
    try {
      _step = 'shake';
      if(shake > 0) {
        ctx.translate((Math.random() - .5) * 8, (Math.random() - .5) * 8);
        shake -= 1 / 60;
      }
      _step = 'sky';
      if (state === State.MENU) {
        _step = 'lobbyWonderland';
        drawLobbyWonderland(1 / 60);
        ctx.restore();
        return;
      }

      const bg = backgrounds[progress.selectedBackground] || backgrounds.sky;
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, bg.top);
      sky.addColorStop(1, bg.bottom);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      _step = 'clouds';
      // Multi-layer Volumetric Fluffy Clouds with Realistic Parallax
      const bgW = W + 240;
      drawFluffyCloud(((cloudX * 0.35 + 20) % bgW) - 120, 68, 0.65, 0.48);
      drawFluffyCloud(((cloudX * 0.35 + 195) % bgW) - 120, 96, 0.55, 0.42);
      drawFluffyCloud(((cloudX * 0.75 + 0) % bgW) - 120, 118, 0.95, 0.88);
      drawFluffyCloud(((cloudX * 0.75 + 175) % bgW) - 120, 178, 0.82, 0.84);
      drawFluffyCloud(((cloudX * 1.1 + 85) % bgW) - 120, 235, 0.7, 0.38);

      _step = 'hills';
      drawHills();

      _step = 'speedlines';
      drawSupersonicSpeedlines();

      _step = 'holyAura';
      drawHolyAura();

      _step = 'shadowVortex';
      drawShadowVortex();

      _step = 'stormClouds';
      for(const c of stormClouds) drawStormCloud(c);

      _step = 'pipes';
      for(const p of pipes) drawPipe(p);
      _step = 'coins';
      for(const coin of coins) drawCoin(coin);
      _step = 'powerups';
      for(const p of powerups) drawPowerup(p);
      _step = 'flyers';
      for(const flyer of flyers) drawFlyer(flyer);
      _step = 'enemies';
      for(const e of enemies) {
        if(e.type === 'bird') drawEnemyBird(e);
        else if(e.type === 'bee_swarm') drawBeeSwarm(e);
      }

      _step = 'shockwaves';
      drawShockwaves();

      _step = 'phoenixFlames';
      drawPhoenixFlames();

      _step = 'laserBeams';
      drawLaserBeams();

      _step = 'lightningBolts';
      drawLightningBolts();

      _step = 'particles';
      for(const q of particles) drawAuraParticle(q);
      ctx.globalAlpha = 1;

      _step = 'slowOverlay';
      if(activePowerups.slow > 0) {
        const frost = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 320);
        frost.addColorStop(0, 'rgba(103, 232, 249, 0)');
        frost.addColorStop(1, 'rgba(103, 232, 249, 0.22)');
        ctx.fillStyle = frost;
        ctx.fillRect(0, 0, W, H);
      }

      _step = 'ground';
      drawGround();

      if(state !== State.MENU) {
        _step = 'afterimages';
        for(const img of dashAfterimages) {
          renderCustomBird(ctx, {
            x: img.x, y: img.y, angle: img.angle, wing: img.wing,
            skinId: progress.selected || 'classic',
            hatId: progress.selectedHat || 'none',
            outfitId: progress.selectedOutfit || 'none',
            opacity: img.alpha * 0.55
          });
        }

        _step = 'drawBird';
        drawBird();

        if(currentMode === 'multiplayer' && window.multiplayerEngine) {
          _step = 'renderOpponents';
          window.multiplayerEngine.renderOpponents(ctx, bird.x);
        }

        _step = 'babyBirds';
        for(const baby of babyBirds) {
          drawBabyBird(baby);
        }

        // Draw Active Race Missiles
        for(const m of raceMissiles) {
          ctx.save();
          ctx.translate(m.x, m.y);
          ctx.rotate((m.angle !== undefined ? m.angle : 0) + Math.PI / 2);
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(0, -4, 6, Math.PI, 0);
          ctx.lineTo(6, 8); ctx.lineTo(-6, 8); ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 1, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f97316';
          ctx.fillRect(-4, 8, 8, 3);
          ctx.restore();
        }

        // Draw Active Race Banana / Oil Traps
        for(const t of raceTraps) {
          ctx.save();
          ctx.translate(t.x, t.y);
          ctx.rotate(t.rot || 0);
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(0, 2, 8, 0, Math.PI);
          ctx.bezierCurveTo(-10, -6, -5, -11, 0, -3);
          ctx.bezierCurveTo(5, -11, 10, -6, 0, 2);
          ctx.fill();
          ctx.strokeStyle = '#a16207';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        }

        // Draw Active Mega Fire Bombs
        for(const b of raceBombs) {
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate(b.rot || 0);
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(0, 0, b.r || 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(b.r * 0.4, -b.r * 0.4, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(b.r * 0.45, -b.r * 0.45, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Draw Active Tornado Cyclones
        for(const tn of raceTornadoes) {
          ctx.save();
          ctx.translate(tn.x, tn.y);
          ctx.rotate(tn.rot || 0);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(0, -12, 16, 5, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(0, -3, 12, 4, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(0, 6, 8, 3, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(0, 13, 4, 1.8, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Draw 3-Second Race Respawn Overlay
        if(isRespawningRace) {
          ctx.save();
          ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
          ctx.beginPath();
          ctx.roundRect(W/2 - 110, 130, 220, 50, 12);
          ctx.fill();
          ctx.strokeStyle = '#f87171';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.font = '900 12px "Trebuchet MS", Arial';
          ctx.fillStyle = '#fca5a5';
          ctx.textAlign = 'center';
          ctx.fillText('TERJATUH! RESPAWNING...', W/2, 148);

          ctx.font = '900 18px "Trebuchet MS", Arial';
          ctx.fillStyle = '#fde047';
          ctx.fillText(`${Math.max(1, Math.ceil(raceRespawnTimer))} DETIK`, W/2, 168);
          ctx.restore();
        }

        _step = 'floatingTexts';
        drawFloatingTexts();
      }
    } catch(err) {
      // Tampilkan error step + pesan ke layar
      const msg = `[${_step}] ${err.message || err}`;
      console.error('Render error at step', _step, ':', err);
      if(!document._renderErrDiv) {
        const dbg = document.createElement('div');
        dbg.id = '_renderErrDiv';
        dbg.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:rgba(180,0,0,0.92);color:#fff;font:bold 11px monospace;padding:7px 10px;z-index:99999;word-break:break-all;white-space:pre-wrap';
        document.body.appendChild(dbg);
        document._renderErrDiv = dbg;
      }
      document._renderErrDiv.textContent = msg;
    } finally {
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }

  // =========================================================
  // HAPPY VIBE LOBBY WONDERLAND BACKGROUND & CUTE BIRDS ANIMATIONS
  // =========================================================
  let lobbyTime = 0;
  let lobbyPetals = [];
  let lobbyEmotes = [];
  let nextLobbyEmoteTime = 0;
  let lobbyBirdBounce = 0;
  let lobbyChick1Bounce = 0;
  let lobbyChick2Bounce = 0;

  function initLobbyParticles() {
    lobbyPetals = [];
    for(let i = 0; i < 28; i++) {
      lobbyPetals.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 3 + Math.random() * 4,
        speedX: 0.4 + Math.random() * 0.8,
        speedY: 0.5 + Math.random() * 0.9,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 2,
        color: ['#fbcfe8', '#fda4af', '#f472b6', '#fef08a', '#93c5fd', '#c4b5fd', '#fed7aa'][Math.floor(Math.random() * 7)],
        type: Math.random() < 0.65 ? 'petal' : 'star'
      });
    }
  }

  function drawCuteLobbyChick(targetCtx, x, y, bodyColor, wingColor, angle, dir = 1, accessory = 'ribbon') {
    targetCtx.save();
    targetCtx.translate(x, y);
    // Squishy gentle breathing scale
    const breath = 1 + Math.sin(lobbyTime * 4.5) * 0.04;
    targetCtx.scale(dir * breath, (2 - breath));
    targetCtx.rotate(angle);

    // Soft Ambient Shadow
    targetCtx.fillStyle = 'rgba(0,0,0,0.18)';
    targetCtx.beginPath();
    targetCtx.ellipse(0, 14, 10, 3.5, 0, 0, Math.PI * 2);
    targetCtx.fill();

    // Round Chubby Body with Soft Radial 3D Lighting
    const bGrad = targetCtx.createRadialGradient(-3, -3, 2, 0, 0, 12);
    bGrad.addColorStop(0, '#ffffff');
    bGrad.addColorStop(0.35, bodyColor);
    bGrad.addColorStop(1, wingColor);
    targetCtx.fillStyle = bGrad;
    targetCtx.beginPath();
    targetCtx.arc(0, 0, 11.5, 0, Math.PI * 2);
    targetCtx.fill();

    // Rosy Anime Blush Cheeks with Hatching
    targetCtx.fillStyle = 'rgba(251, 113, 133, 0.7)';
    targetCtx.beginPath();
    targetCtx.ellipse(4.5, 3.2, 3.5, 2.5, 0, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.strokeStyle = '#f43f5e';
    targetCtx.lineWidth = 0.8;
    targetCtx.beginPath();
    targetCtx.moveTo(3.5, 2.2); targetCtx.lineTo(2.5, 4.2);
    targetCtx.moveTo(5.2, 2.2); targetCtx.lineTo(4.2, 4.2);
    targetCtx.stroke();

    // Kawaii Sparkling Boba Eye (Double Glint)
    targetCtx.fillStyle = '#0f172a';
    targetCtx.beginPath();
    targetCtx.arc(4, -2.5, 3.2, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.fillStyle = '#ffffff';
    targetCtx.beginPath();
    targetCtx.arc(5.2, -3.8, 1.4, 0, Math.PI * 2);
    targetCtx.arc(2.8, -1.4, 0.8, 0, Math.PI * 2);
    targetCtx.fill();

    // Tiny Orange Beak
    targetCtx.fillStyle = '#f97316';
    targetCtx.beginPath();
    targetCtx.moveTo(8, -1.2);
    targetCtx.lineTo(13.5, 0.8);
    targetCtx.lineTo(8, 2.8);
    targetCtx.closePath();
    targetCtx.fill();

    // Flapping Little Wing
    const wFlap = Math.sin(lobbyTime * 8) * 0.2;
    targetCtx.save();
    targetCtx.translate(-4, 2);
    targetCtx.rotate(wFlap);
    targetCtx.fillStyle = wingColor;
    targetCtx.beginPath();
    targetCtx.ellipse(0, 0, 6, 4, 0.1, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.restore();

    // Head Accessories (Ribbon or Flower)
    if(accessory === 'ribbon') {
      targetCtx.fillStyle = '#f472b6';
      targetCtx.beginPath();
      targetCtx.moveTo(0, -11); targetCtx.lineTo(-4, -15); targetCtx.lineTo(0, -13); targetCtx.closePath();
      targetCtx.moveTo(0, -11); targetCtx.lineTo(4, -15); targetCtx.lineTo(0, -13); targetCtx.closePath();
      targetCtx.fill();
      targetCtx.fillStyle = '#fbcfe8';
      targetCtx.beginPath(); targetCtx.arc(0, -12, 1.4, 0, Math.PI * 2); targetCtx.fill();
    } else if(accessory === 'flower') {
      targetCtx.fillStyle = '#f472b6';
      for(let a = 0; a < 5; a++) {
        const rad = (a * Math.PI * 2) / 5;
        targetCtx.beginPath();
        targetCtx.arc(Math.cos(rad) * 2.8, -13 + Math.sin(rad) * 2.8, 1.5, 0, Math.PI * 2);
        targetCtx.fill();
      }
      targetCtx.fillStyle = '#fef08a';
      targetCtx.beginPath(); targetCtx.arc(0, -13, 1.3, 0, Math.PI * 2); targetCtx.fill();
    }

    // Tiny Orange Feet
    targetCtx.strokeStyle = '#ea580c';
    targetCtx.lineWidth = 1.6;
    targetCtx.beginPath();
    targetCtx.moveTo(-2, 10); targetCtx.lineTo(-2, 14);
    targetCtx.moveTo(3, 10); targetCtx.lineTo(3, 14);
    targetCtx.stroke();

    targetCtx.restore();
  }

  function drawCuteButterfly(targetCtx, x, y, t) {
    targetCtx.save();
    targetCtx.translate(x, y);
    const flap = Math.abs(Math.sin(t * 14));

    // Fluttering gradient wings
    targetCtx.save();
    targetCtx.scale(flap, 1);
    targetCtx.fillStyle = '#f472b6';
    targetCtx.shadowColor = '#f472b6';
    targetCtx.shadowBlur = 8;
    // Left Wing
    targetCtx.beginPath();
    targetCtx.ellipse(-6, -4, 7, 5, -0.4, 0, Math.PI * 2);
    targetCtx.fill();
    // Right Wing
    targetCtx.beginPath();
    targetCtx.ellipse(6, -4, 7, 5, 0.4, 0, Math.PI * 2);
    targetCtx.fill();
    // Inner Glow
    targetCtx.fillStyle = '#fef08a';
    targetCtx.beginPath();
    targetCtx.arc(-4, -4, 2.5, 0, Math.PI * 2);
    targetCtx.arc(4, -4, 2.5, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.restore();

    // Body
    targetCtx.fillStyle = '#701a75';
    targetCtx.beginPath();
    targetCtx.ellipse(0, -3, 1.5, 5, 0, 0, Math.PI * 2);
    targetCtx.fill();

    targetCtx.restore();
  }

  function drawLobbyWonderland(dt) {
    lobbyTime += dt;
    if(lobbyPetals.length === 0) initLobbyParticles();

    // 1. Serene Crystal-Clear Sky Gradient (Ghibli / Sky Aesthetic)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, '#53bfe5');
    skyGrad.addColorStop(0.3, '#7cd6f6');
    skyGrad.addColorStop(0.6, '#bfe9fb');
    skyGrad.addColorStop(0.85, '#e4f7ff');
    skyGrad.addColorStop(1, '#c7f2d4');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Soft Ambient Sunlight Bloom (Atmospheric & Non-Intrusive)
    ctx.save();
    const sunGlow = ctx.createRadialGradient(W * 0.5, 40, 20, W * 0.5, 40, 260);
    sunGlow.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    sunGlow.addColorStop(0.35, 'rgba(254, 243, 199, 0.22)');
    sunGlow.addColorStop(0.7, 'rgba(253, 230, 138, 0.08)');
    sunGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(W * 0.5, 40, 260, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Delicate Pastel Rainbow Arch (Soft & Translucent)
    ctx.save();
    ctx.globalAlpha = 0.16 + Math.sin(lobbyTime * 0.6) * 0.04;
    const rbColors = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a855f7'];
    for(let r = 0; r < rbColors.length; r++) {
      ctx.beginPath();
      ctx.strokeStyle = rbColors[r];
      ctx.lineWidth = 3.5;
      ctx.arc(W / 2, H - 70, 230 + r * 4, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Distant Sky Birds Flocking across the horizon
    ctx.save();
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
    ctx.lineWidth = 1.6;
    for(let f = 0; f < 4; f++) {
      const birdX = ((lobbyTime * 18 + f * 42) % (W + 80)) - 40;
      const birdY = 120 + Math.sin(lobbyTime * 2 + f) * 12 + f * 16;
      const wingFold = Math.sin(lobbyTime * 6 + f * 1.2) * 4;
      ctx.beginPath();
      ctx.moveTo(birdX - 6, birdY + wingFold);
      ctx.quadraticCurveTo(birdX - 3, birdY - 3, birdX, birdY);
      ctx.quadraticCurveTo(birdX + 3, birdY - 3, birdX + 6, birdY + wingFold);
      ctx.stroke();
    }
    ctx.restore();

    // 5. Cute Floating Hot Air Balloon in Far Sky
    ctx.save();
    const balloonX = ((lobbyTime * 6 + 40) % (W + 90)) - 45;
    const balloonY = 175 + Math.sin(lobbyTime * 1.1) * 8;
    ctx.translate(balloonX, balloonY);
    // Balloon envelope
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.ellipse(0, -12, 11, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(0, -12, 4.5, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    // Basket & ropes
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-4, -1); ctx.lineTo(-3, 6);
    ctx.moveTo(4, -1); ctx.lineTo(3, 6);
    ctx.stroke();
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-4, 6, 8, 5);
    ctx.restore();

    // 6. Volumetric Fluffy Clouds (Parallax Scrolling)
    const bgW = W + 240;
    drawFluffyCloud(((lobbyTime * 12 + 20) % bgW) - 120, 75, 0.65, 0.6);
    drawFluffyCloud(((lobbyTime * 16 + 180) % bgW) - 120, 110, 0.8, 0.75);
    drawFluffyCloud(((lobbyTime * 22 + 90) % bgW) - 120, 160, 0.95, 0.85);

    // 7. Layered Rolling Green Hills
    // Far Hill (Soft Mint/Teal)
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.moveTo(0, H - 120);
    for(let x = 0; x <= W; x += 50) {
      ctx.quadraticCurveTo(x + 25, H - 170 + Math.sin(x * 0.03) * 15, x + 50, H - 120);
    }
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();

    // Mid Hill (Vibrant Grass Green)
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.moveTo(0, H - 95);
    for(let x = 0; x <= W; x += 60) {
      ctx.quadraticCurveTo(x + 30, H - 135 + Math.cos(x * 0.04) * 12, x + 60, H - 95);
    }
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();

    // Cute Distant Windmill on the hill
    ctx.save();
    const wmX = 65;
    const wmY = H - 118;
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(wmX - 6, wmY + 22);
    ctx.lineTo(wmX - 4, wmY);
    ctx.lineTo(wmX + 4, wmY);
    ctx.lineTo(wmX + 6, wmY + 22);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.moveTo(wmX - 5, wmY);
    ctx.lineTo(wmX, wmY - 6);
    ctx.lineTo(wmX + 5, wmY);
    ctx.closePath();
    ctx.fill();
    // Windmill Blades Spinning
    ctx.save();
    ctx.translate(wmX, wmY);
    ctx.rotate(lobbyTime * 2.2);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.8;
    for(let b = 0; b < 4; b++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 16);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillRect(-2, 6, 4, 10);
    }
    ctx.restore();
    ctx.restore();

    // Near Hill with Lush Grass Top Border
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(0, H - 75);
    for(let x = 0; x <= W; x += 40) {
      ctx.quadraticCurveTo(x + 20, H - 98, x + 40, H - 75);
    }
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();

    // 8. Ground Surface & Cheerful Swaying Grass Blades & Wildflowers
    drawGround();

    // Swaying Daisy Flowers & Tulips on Grass
    const flowerSpots = [
      { x: 25, y: H - GROUND - 4, color: '#f43f5e' },
      { x: 65, y: H - GROUND - 6, color: '#fbbf24' },
      { x: 120, y: H - GROUND - 5, color: '#ec4899' },
      { x: 180, y: H - GROUND - 6, color: '#a855f7' },
      { x: 240, y: H - GROUND - 4, color: '#38bdf8' },
      { x: 310, y: H - GROUND - 6, color: '#fbbf24' },
      { x: 380, y: H - GROUND - 5, color: '#f43f5e' },
      { x: 440, y: H - GROUND - 6, color: '#ec4899' },
      { x: 510, y: H - GROUND - 4, color: '#38bdf8' },
      { x: 570, y: H - GROUND - 6, color: '#fbbf24' },
      { x: 615, y: H - GROUND - 5, color: '#f43f5e' }
    ];
    flowerSpots.forEach((f, idx) => {
      const sway = Math.sin(lobbyTime * 3 + idx * 1.5) * 3;
      ctx.save();
      ctx.translate(f.x, f.y);
      // Stem
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(sway / 2, -7, sway, -13);
      ctx.stroke();
      // Flower head
      ctx.translate(sway, -13);
      ctx.fillStyle = f.color;
      for(let p = 0; p < 5; p++) {
        ctx.beginPath();
        const ang = (p * Math.PI * 2) / 5;
        ctx.arc(Math.cos(ang) * 4, Math.sin(ang) * 4, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Update Interactive Mascot Tap Bounce Timers
    if(lobbyBirdBounce > 0) lobbyBirdBounce = Math.max(0, lobbyBirdBounce - dt);
    if(lobbyChick1Bounce > 0) lobbyChick1Bounce = Math.max(0, lobbyChick1Bounce - dt);
    if(lobbyChick2Bounce > 0) lobbyChick2Bounce = Math.max(0, lobbyChick2Bounce - dt);

    // 9. CUTE ANIMATED BIRDS & COMPANIONS (HAPPY LOBBY MASCOTS)
    // --- Mascot 1: Main Custom Player Bird (Cheering on the ground) ---
    const mainBirdX = W / 2;
    const birdInteractiveHop = Math.sin((1 - lobbyBirdBounce / 0.5) * Math.PI) * 24;
    const mainBirdHop = Math.abs(Math.sin(lobbyTime * 3.5)) * 14 + (lobbyBirdBounce > 0 ? birdInteractiveHop : 0);
    const mainBirdY = H - GROUND - 22 - mainBirdHop;
    const mainBirdAngle = Math.sin(lobbyTime * 3.5) * 0.12 + (lobbyBirdBounce > 0 ? Math.sin(lobbyBirdBounce * 25) * 0.22 : 0);
    const mainBirdWing = (lobbyBirdBounce > 0 ? 14 : Math.sin(lobbyTime * 10) * 8);

    renderCustomBird(ctx, {
      x: mainBirdX,
      y: mainBirdY,
      angle: mainBirdAngle,
      wing: mainBirdWing,
      skinId: progress.selected || 'classic',
      hatId: progress.selectedHat || 'none',
      outfitId: progress.selectedOutfit || 'none',
      opacity: 1
    });

    // Main bird shadow on ground
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    const shadowScale = 1 - (mainBirdHop / 35);
    ctx.beginPath();
    ctx.ellipse(mainBirdX, H - GROUND + 3, 16 * shadowScale, 5 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Floating Cute Emote Bubble above Main Bird (Hearts, Music, Sparkles)
    if(lobbyTime > nextLobbyEmoteTime) {
      const emotes = ['★', '✦', '♪', '◆', '●', '▲'];
      lobbyEmotes.push({
        x: mainBirdX + (Math.random() - 0.5) * 18,
        y: mainBirdY - 26,
        text: emotes[Math.floor(Math.random() * emotes.length)],
        life: 1.8,
        maxLife: 1.8,
        vy: -22
      });
      nextLobbyEmoteTime = lobbyTime + 1.2 + Math.random() * 1.5;
    }

    for(let eIdx = lobbyEmotes.length - 1; eIdx >= 0; eIdx--) {
      const em = lobbyEmotes[eIdx];
      em.life -= dt;
      em.y += em.vy * dt;
      if(em.life <= 0) {
        lobbyEmotes.splice(eIdx, 1);
        continue;
      }
      const alpha = Math.min(1, em.life / 0.4);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = '900 16px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 8;
      ctx.fillText(em.text, em.x, em.y);
      ctx.restore();
    }

    // --- Mascot 2 & 3: Equipped Pet Companion Duo Waddling & Hopping ---
    const activePetId = progress.selectedPet || 'pip_peep';
    if(activePetId !== 'none') {
      const pData = petsCatalog[activePetId] || petsCatalog.pip_peep;
      if(pData && pData.baby1 && pData.baby2) {
        // Pet Baby 1 (Left pet)
        const chick1InteractiveHop = Math.sin((1 - lobbyChick1Bounce / 0.5) * Math.PI) * 18;
        const chick1X = mainBirdX - 52 + Math.sin(lobbyTime * 2) * 8;
        const chick1Hop = Math.abs(Math.sin(lobbyTime * 4 + 1)) * 9 + (lobbyChick1Bounce > 0 ? chick1InteractiveHop : 0);
        const chick1Y = H - GROUND - 14 - chick1Hop;
        const chick1Angle = lobbyChick1Bounce > 0 ? (1 - lobbyChick1Bounce / 0.5) * Math.PI * 2 : Math.sin(lobbyTime * 4) * 0.1;
        drawCuteLobbyChick(ctx, chick1X, chick1Y, pData.baby1.color, pData.baby1.wingColor, chick1Angle, 1, pData.baby1.accessory);

        // Pet Baby 2 (Right pet)
        const chick2InteractiveHop = Math.sin((1 - lobbyChick2Bounce / 0.5) * Math.PI) * 18;
        const chick2X = mainBirdX + 54 + Math.sin(lobbyTime * 2 + 2) * 8;
        const chick2Hop = Math.abs(Math.sin(lobbyTime * 4 + 2.5)) * 9 + (lobbyChick2Bounce > 0 ? chick2InteractiveHop : 0);
        const chick2Y = H - GROUND - 14 - chick2Hop;
        const chick2Angle = lobbyChick2Bounce > 0 ? -(1 - lobbyChick2Bounce / 0.5) * Math.PI * 2 : Math.sin(lobbyTime * 4 + 2) * 0.1;
        drawCuteLobbyChick(ctx, chick2X, chick2Y, pData.baby2.color, pData.baby2.wingColor, chick2Angle, -1, pData.baby2.accessory);
      }
    }

    // --- Mascot 4: Fluttering Golden Butterfly ---
    const bfX = mainBirdX + Math.cos(lobbyTime * 2.2) * 75;
    const bfY = H - GROUND - 65 + Math.sin(lobbyTime * 3.8) * 22;
    drawCuteButterfly(ctx, bfX, bfY, lobbyTime);

    // 10. Drifting Floating Sakura Petals, Sparkles & Dandelion Seeds
    for(const p of lobbyPetals) {
      p.x += p.speedX;
      p.y += p.speedY;
      p.rot += p.rotSpeed * dt;
      if(p.x > W + 20) p.x = -20;
      if(p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.75;
      if(p.type === 'petal') {
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Star sparkle
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(0, 0, p.r * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // Volumetric Fluffy Cloud with Soft Sunlight Highlights & Atmospheric Shading
  function drawFluffyCloud(x, y, s, alpha = 0.85) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.globalAlpha = alpha;

    // Gradien shading lembut bagian bawah awan
    const shadowGrad = ctx.createLinearGradient(0, -18, 0, 28);
    shadowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
    shadowGrad.addColorStop(0.6, 'rgba(235, 248, 255, 0.9)');
    shadowGrad.addColorStop(1, 'rgba(180, 218, 242, 0.65)');

    ctx.fillStyle = shadowGrad;

    // Gumpalan awan bulat berlapis organik
    const lobes = [
      [-30, 8, 16],
      [-15, 0, 22],
      [10, -9, 27],
      [35, -3, 22],
      [52, 6, 16],
      [14, 12, 20],
      [-10, 12, 18]
    ];

    for(const [lx, ly, lr] of lobes) {
      ctx.beginPath();
      ctx.arc(lx, ly, lr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dasar awan yang rata dan lembut (pure arcTo, no roundRect dependency)
    _rrPath(ctx, -33, 4, 88, 18, 9);
    ctx.fill();


    // Highlight puncak awan terpapar sinar matahari
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    for(const [lx, ly, lr] of [[10, -9, 23], [35, -3, 17], [-15, 0, 17]]) {
      ctx.beginPath();
      ctx.arc(lx - 2, ly - 3, lr * 0.72, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawHills() {
    const bg = backgrounds[progress.selectedBackground] || backgrounds.sky;
    const hillBase = bg.hill || '#75bb9b';
    const yBase = H - GROUND;

    // Back Mountain Silhouette with atmospheric depth
    ctx.save();
    ctx.fillStyle = hillBase;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.moveTo(0, yBase - 65);
    for(let x = 0; x <= W; x += 50) {
      ctx.quadraticCurveTo(x + 25, yBase - 130 + (x % 100 ? 30 : -10), x + 50, yBase - 65);
    }
    ctx.lineTo(W, yBase);
    ctx.lineTo(0, yBase);
    ctx.closePath();
    ctx.fill();

    // Front Lush Hill with gradient shading
    ctx.globalAlpha = 0.95;
    const hillGrad = ctx.createLinearGradient(0, yBase - 85, 0, yBase);
    hillGrad.addColorStop(0, hillBase);
    hillGrad.addColorStop(1, bg.groundBase || '#3f2e18');
    ctx.fillStyle = hillGrad;
    ctx.beginPath();
    ctx.moveTo(0, yBase - 30);
    for(let x = 0; x <= W; x += 40) {
      ctx.quadraticCurveTo(x + 20, yBase - 78, x + 40, yBase - 30);
    }
    ctx.lineTo(W, yBase);
    ctx.lineTo(0, yBase);
    ctx.closePath();
    ctx.fill();

    // Atmospheric Hill Rim Highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();
  }

  function drawPipe(p) {
    const cap = 14, skin = pipeSkins[progress.selectedPipe] || pipeSkins.green;
    const px = p.x, pw = p.w;
    const topH = p.gapY - cap;
    const botY = p.gapY + p.gapSize;
    const botH = H - GROUND - botY - cap;

    ctx.save();

    // 1. Pipe Body Gradient (Top & Bottom)
    const pipeGrad = ctx.createLinearGradient(px, 0, px + pw, 0);
    pipeGrad.addColorStop(0, skin.edge || '#216c4d');
    pipeGrad.addColorStop(0.2, skin.body || '#287a55');
    pipeGrad.addColorStop(0.5, skin.wing || '#3dbb68');
    pipeGrad.addColorStop(0.8, skin.body || '#287a55');
    pipeGrad.addColorStop(1, skin.edge || '#216c4d');

    ctx.fillStyle = pipeGrad;
    _rrPath(ctx, px, 0, pw, topH, 4);
    ctx.fill();
    _rrPath(ctx, px, botY + cap, pw, Math.max(10, botH), 4);
    ctx.fill();

    // 2. Vertical Specular Light Streak
    ctx.fillStyle = 'rgba(255, 255, 255, 0.32)';
    ctx.fillRect(px + 6, 0, 7, topH);
    ctx.fillRect(px + 6, botY + cap, 7, Math.max(10, botH));

    // 3. Pipe Caps (Collar Rims)
    const capGrad = ctx.createLinearGradient(px - 4, 0, px + pw + 4, 0);
    capGrad.addColorStop(0, skin.edge || '#216c4d');
    capGrad.addColorStop(0.3, skin.cap || '#53d878');
    capGrad.addColorStop(0.6, '#ffffff');
    capGrad.addColorStop(0.7, skin.cap || '#53d878');
    capGrad.addColorStop(1, skin.edge || '#216c4d');

    // Top Cap
    ctx.fillStyle = capGrad;
    ctx.shadowColor = skin.cap || '#53d878';
    ctx.shadowBlur = 6;
    _rrPath(ctx, px - 4, topH, pw + 8, cap, 4);
    ctx.fill();

    // Bottom Cap
    _rrPath(ctx, px - 4, botY, pw + 8, cap, 4);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 4. Glowing Neon Center Rings for Cyber / Anime pipes
    if(skin.name.includes('NEON') || skin.name.includes('TORII') || skin.name.includes('CYBER')) {
      const pulse = 0.5 + Math.sin(performance.now() / 200) * 0.4;
      ctx.strokeStyle = skin.cap || '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = pulse;
      ctx.beginPath();
      ctx.moveTo(px - 3, topH + cap / 2);
      ctx.lineTo(px + pw + 3, topH + cap / 2);
      ctx.moveTo(px - 3, botY + cap / 2);
      ctx.lineTo(px + pw + 3, botY + cap / 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawCoin(coin) {
    ctx.save();
    ctx.translate(coin.x, coin.y);

    const spin = coin.spin !== undefined ? coin.spin : (performance.now() / 150);
    const spinScale = Math.cos(spin); // Animasi rotasi horizontal 3D
    const absScale = Math.max(0.08, Math.abs(spinScale));

    // 1. Pendaran Kilau Emas Luar
    ctx.shadowColor = 'rgba(251, 191, 36, 0.65)';
    ctx.shadowBlur = 6;

    // 2. Ketebalan Tepi Koin 3D (Rim Depth)
    const edgeOffset = (1 - absScale) * (spinScale >= 0 ? -2.2 : 2.2);
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(edgeOffset, 0, coin.r * absScale, coin.r, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Gradasi Permukaan Emas Dinamis
    const coinGrad = ctx.createLinearGradient(-coin.r * absScale, -coin.r, coin.r * absScale, coin.r);
    coinGrad.addColorStop(0, '#fef08a');
    coinGrad.addColorStop(0.3, '#f59e0b');
    coinGrad.addColorStop(0.7, '#d97706');
    coinGrad.addColorStop(1, '#78350f');

    ctx.fillStyle = coinGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, coin.r * absScale, coin.r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 4. Lingkaran & Lambang Emboss Bagian Dalam
    if(absScale > 0.3) {
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, (coin.r - 2.8) * absScale, coin.r - 2.8, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Lambang Tengah Koin
      ctx.fillStyle = '#fef9c3';
      ctx.beginPath();
      ctx.ellipse(0, 0, 3.2 * absScale, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Efek Kilatan Bintang Berkilau saat Berputar
      if(Math.abs(Math.sin(spin * 2)) > 0.82) {
        ctx.fillStyle = '#ffffff';
        drawCanvasSparkle(ctx, 0, 0, Math.max(3, 5 * absScale));
      }
    }

    ctx.restore();
  }

  function drawFlyer(flyer) {
    ctx.save();
    ctx.translate(flyer.x, flyer.y);
    ctx.scale(-1, 1);
    ctx.fillStyle = '#e85d50';
    ctx.beginPath();
    ctx.ellipse(0, 0, flyer.r, flyer.r * .72, 0, 0, 7);
    ctx.fill();
    ctx.fillStyle = '#c83f43';
    ctx.save();
    ctx.rotate(Math.sin(flyer.wing || 0) * .55);
    ctx.beginPath();
    ctx.ellipse(-4, -8, 10, 5, -.45, 0, 7);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(6, -5, 4, 0, 7);
    ctx.fill();
    ctx.fillStyle = '#16365d';
    ctx.beginPath();
    ctx.arc(7, -5, 1.5, 0, 7);
    ctx.fill();
    ctx.fillStyle = '#ffbe45';
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(23, 4);
    ctx.lineTo(14, 7);
    ctx.fill();
    ctx.restore();
  }

  function drawGround() {
    const y = H - GROUND;
    const bg = backgrounds[progress.selectedBackground] || backgrounds.sky;
    const gBase = bg.groundBase || '#b57a45';
    const gTop = bg.groundTop || '#46b65c';
    const gStripe = bg.groundStripe || '#e6ad5a';

    ctx.save();

    // 1. Lush Grass Border Top
    ctx.fillStyle = gTop;
    ctx.fillRect(0, y, W, 10);

    // 2. Animated Swaying Grass Tufts
    ctx.fillStyle = gTop;
    for(let x = -groundX; x < W + 30; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 5, y - 6);
      ctx.lineTo(x + 10, y);
      ctx.closePath();
      ctx.fill();
    }

    // 3. Ground Earth Bed (Smooth Multi-tone Gradient)
    const earthGrad = ctx.createLinearGradient(0, y + 10, 0, H);
    earthGrad.addColorStop(0, gBase);
    earthGrad.addColorStop(1, '#1e1006');
    ctx.fillStyle = earthGrad;
    ctx.fillRect(0, y + 10, W, GROUND - 10);

    // 4. Decorative Soil Sedimentary Line
    ctx.fillStyle = gStripe;
    ctx.fillRect(0, y + 12, W, 4);

    // 5. Soil Pebbles & Strata Details
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    for(let x = -groundX; x < W + 40; x += 32) {
      ctx.fillRect(x + 4, y + 26, 12, 4);
      ctx.fillRect(x + 20, y + 50, 8, 3);
      ctx.fillRect(x + 10, y + 68, 14, 3);
    }

    // 6. Ground Highlight Trim
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(0, y, W, 2);

    ctx.restore();
  }

  // Universal Draw Helpers (Works on game ctx and shop showcase ctx)
  function drawCapeBackTo(targetCtx, wing, outfitId = 'cape') {
    targetCtx.save();
    const flapOffset = wing > 0 ? -6 : 5;
    const wave = Math.sin(performance.now() / 110) * 5;
    const wave2 = Math.cos(performance.now() / 150) * 3.5;

    if(outfitId === 'fairy') {
      // Fairy Wings
      const fWave = Math.sin(performance.now() / 85) * 6;
      targetCtx.save();
      
      // Fairy Wing Glow
      targetCtx.shadowColor = '#67e8f9';
      targetCtx.shadowBlur = 8;

      // Top Fairy Wing (Pastel Mint & Cyan)
      targetCtx.fillStyle = 'rgba(167, 243, 208, 0.72)';
      targetCtx.beginPath();
      targetCtx.moveTo(0, -6);
      targetCtx.quadraticCurveTo(-14, -28 + fWave, -34, -22 + flapOffset + fWave);
      targetCtx.quadraticCurveTo(-38, -4, -12, -2);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.strokeStyle = '#fde047';
      targetCtx.lineWidth = 1.2;
      targetCtx.stroke();

      // Top Wing Inner Pink Sheen
      targetCtx.fillStyle = 'rgba(244, 114, 182, 0.45)';
      targetCtx.beginPath();
      targetCtx.moveTo(-2, -6);
      targetCtx.quadraticCurveTo(-12, -22 + fWave, -26, -18 + fWave);
      targetCtx.quadraticCurveTo(-26, -6, -8, -4);
      targetCtx.closePath();
      targetCtx.fill();

      // Bottom Fairy Wing (Lilac)
      targetCtx.fillStyle = 'rgba(192, 132, 252, 0.65)';
      targetCtx.beginPath();
      targetCtx.moveTo(-6, 2);
      targetCtx.quadraticCurveTo(-24, 12 + fWave * 0.6, -30, 26 + flapOffset + fWave);
      targetCtx.quadraticCurveTo(-18, 28, -2, 8);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.strokeStyle = '#fde047';
      targetCtx.lineWidth = 1.2;
      targetCtx.stroke();

      // Fairy Dust Sparkles
      targetCtx.shadowBlur = 0;
      targetCtx.fillStyle = '#ffffff';
      drawCanvasSparkle(targetCtx, -26, -14 + fWave, 3);
      drawCanvasSparkle(targetCtx, -22, 18 + fWave * 0.6, 2.5);

      targetCtx.restore();
      targetCtx.restore();
      return;
    }

    // 1. Billowing Velvet Inner Shadow Layer
    targetCtx.fillStyle = '#7f1d1d';
    targetCtx.beginPath();
    targetCtx.moveTo(2, -9);
    targetCtx.quadraticCurveTo(-18, -12 + wave * 0.4, -38, -2 + flapOffset + wave);
    targetCtx.quadraticCurveTo(-36, 26 + flapOffset, -8, 14);
    targetCtx.closePath();
    targetCtx.fill();

    // 2. Main Glorious Scarlet Hero Cape (wraps from top shoulder across back)
    targetCtx.fillStyle = '#dc2626';
    targetCtx.beginPath();
    targetCtx.moveTo(4, -10);
    targetCtx.quadraticCurveTo(-16, -14 + wave * 0.5, -36, 4 + flapOffset + wave);
    targetCtx.quadraticCurveTo(-28, 28 + flapOffset + wave2, -6, 12);
    targetCtx.quadraticCurveTo(-4, 0, 4, -10);
    targetCtx.closePath();
    targetCtx.fill();

    // 3. Highlighted Top Fold of the Cape
    targetCtx.fillStyle = '#ef4444';
    targetCtx.beginPath();
    targetCtx.moveTo(4, -10);
    targetCtx.quadraticCurveTo(-14, -13 + wave * 0.5, -30, -2 + flapOffset + wave);
    targetCtx.quadraticCurveTo(-16, 10 + flapOffset, 0, -2);
    targetCtx.closePath();
    targetCtx.fill();

    // 4. Golden Embroidered Border Trim
    targetCtx.strokeStyle = '#fbbf24';
    targetCtx.lineWidth = 2.2;
    targetCtx.beginPath();
    targetCtx.moveTo(-36, 4 + flapOffset + wave);
    targetCtx.quadraticCurveTo(-28, 28 + flapOffset + wave2, -6, 12);
    targetCtx.stroke();

    // Cape Golden Star Emblem
    targetCtx.fillStyle = '#fef08a';
    drawCanvasStar(targetCtx, -22, 14 + flapOffset + wave * 0.6, 4.5, 2.2);

    targetCtx.restore();
  }

  function drawOutfitBodyTo(targetCtx, outfitId) {
    if(!outfitId || outfitId === 'none') return;
    targetCtx.save();

    if(outfitId === 'cape') {
      // Cape shoulder drape across the body
      targetCtx.fillStyle = '#991b1b';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 0, 18.5, 14.5, -0.1, 3.2, 5.8);
      targetCtx.lineTo(2, -8);
      targetCtx.closePath();
      targetCtx.fill();
    } else if(outfitId === 'redtie') {
      // 1. Full White Dress Shirt Torso
      targetCtx.fillStyle = '#f8fafc';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18, 14, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // 2. Tailored Midnight Navy Suit Vest
      targetCtx.fillStyle = '#1e293b';
      targetCtx.beginPath();
      targetCtx.ellipse(-1, 2, 17.5, 13.5, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // 3. V-Neck White Shirt Opening (lowered neckline)
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.moveTo(2, 0);
      targetCtx.lineTo(12, 2);
      targetCtx.lineTo(4, 14);
      targetCtx.lineTo(-2, 5);
      targetCtx.closePath();
      targetCtx.fill();

      // 4. Vest lapel outline & Shiny Silver Buttons
      targetCtx.strokeStyle = '#0f172a';
      targetCtx.lineWidth = 1.2;
      targetCtx.beginPath();
      targetCtx.moveTo(2, 0); targetCtx.lineTo(5, 6); targetCtx.lineTo(3, 14);
      targetCtx.stroke();

      targetCtx.fillStyle = '#e2e8f0';
      targetCtx.beginPath();
      targetCtx.arc(3.5, 6.5, 1.2, 0, Math.PI * 2);
      targetCtx.arc(3, 10, 1.2, 0, Math.PI * 2);
      targetCtx.arc(2.5, 13.5, 1.2, 0, Math.PI * 2);
      targetCtx.fill();
    } else if(outfitId === 'bluetie') {
      // 1. Sky Blue Formal Pilot Shirt
      targetCtx.fillStyle = '#dbeafe';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18, 14, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // 2. Dark Navy Pilot Vest
      targetCtx.fillStyle = '#0f172a';
      targetCtx.beginPath();
      targetCtx.ellipse(-1, 2, 17.5, 13.5, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // 3. V-Neck Shirt Cutout
      targetCtx.fillStyle = '#eff6ff';
      targetCtx.beginPath();
      targetCtx.moveTo(2, 0);
      targetCtx.lineTo(12, 2);
      targetCtx.lineTo(4, 14);
      targetCtx.lineTo(-2, 5);
      targetCtx.closePath();
      targetCtx.fill();

      // 4. Gold Captain Rank Stripes on Shoulder
      targetCtx.strokeStyle = '#fbbf24';
      targetCtx.lineWidth = 1.4;
      targetCtx.beginPath();
      targetCtx.moveTo(-6, -2); targetCtx.lineTo(-1, 0);
      targetCtx.moveTo(-6, 1); targetCtx.lineTo(-1, 3);
      targetCtx.stroke();
    } else if(outfitId === 'bowtie') {
      // 1. Obsidian Black Tuxedo Body
      targetCtx.fillStyle = '#09090b';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18.5, 14.5, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // 2. White Pleated Tuxedo Bib
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.moveTo(3, -7);
      targetCtx.lineTo(14, 0);
      targetCtx.lineTo(5, 14);
      targetCtx.lineTo(-2, 4);
      targetCtx.closePath();
      targetCtx.fill();

      // 3. Black Onyx Buttons
      targetCtx.fillStyle = '#09090b';
      targetCtx.beginPath();
      targetCtx.arc(6, 2, 1.2, 0, Math.PI * 2);
      targetCtx.arc(5.5, 6.5, 1.2, 0, Math.PI * 2);
      targetCtx.arc(5, 11, 1.2, 0, Math.PI * 2);
      targetCtx.fill();

      // 4. Red Silk Pocket Square on Left Chest
      targetCtx.fillStyle = '#dc2626';
      targetCtx.beginPath();
      targetCtx.moveTo(-4, -1); targetCtx.lineTo(-2, -6); targetCtx.lineTo(0, -1);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.strokeStyle = '#fbbf24';
      targetCtx.lineWidth = 0.8;
      targetCtx.stroke();

      // Satin Lapels
      targetCtx.strokeStyle = '#334155';
      targetCtx.lineWidth = 1.5;
      targetCtx.beginPath();
      targetCtx.moveTo(3, -7); targetCtx.lineTo(6, 3); targetCtx.lineTo(4, 14);
      targetCtx.stroke();
    } else if(outfitId === 'goldchain') {
      // 1. Black Leather Bomber Jacket covering full torso
      targetCtx.fillStyle = '#18181b';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18.5, 14.5, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // 2. Red & White Sporty Racing Stripes along the bottom rim
      targetCtx.strokeStyle = '#ef4444';
      targetCtx.lineWidth = 2.4;
      targetCtx.beginPath();
      targetCtx.arc(0, 1, 17, 1.6, 3.4);
      targetCtx.stroke();

      targetCtx.strokeStyle = '#ffffff';
      targetCtx.lineWidth = 1.2;
      targetCtx.beginPath();
      targetCtx.arc(0, 1, 15.2, 1.6, 3.4);
      targetCtx.stroke();

      // 3. Metallic Silver Zipper Track down the front
      targetCtx.strokeStyle = '#94a3b8';
      targetCtx.lineWidth = 1.4;
      targetCtx.beginPath();
      targetCtx.moveTo(6, -4); targetCtx.lineTo(6, 14);
      targetCtx.stroke();

      // Inner white shirt collar
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.moveTo(4, -6); targetCtx.lineTo(10, -2); targetCtx.lineTo(6, 2);
      targetCtx.closePath();
      targetCtx.fill();
    } else if(outfitId === 'scarf') {
      // 1. Chunky Winter Cable-Knit Sweater
      targetCtx.fillStyle = '#9a3412';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18.5, 14.5, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // Cable knit texture lines
      targetCtx.strokeStyle = '#fed7aa';
      targetCtx.lineWidth = 1.2;
      targetCtx.beginPath();
      targetCtx.moveTo(-8, -2); targetCtx.lineTo(7, -2);
      targetCtx.moveTo(-10, 3); targetCtx.lineTo(8, 3);
      targetCtx.moveTo(-8, 8); targetCtx.lineTo(6, 8);
      targetCtx.moveTo(-6, 13); targetCtx.lineTo(4, 13);
      targetCtx.stroke();
    } else if(outfitId === 'badge') {
      // 1. Wild West Rustic Suede Leather Vest
      targetCtx.fillStyle = '#78350f';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18.5, 14.5, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // Dark Leather Stitching Trim
      targetCtx.strokeStyle = '#451a03';
      targetCtx.lineWidth = 2;
      targetCtx.stroke();

      // Inner cream cowboy shirt
      targetCtx.fillStyle = '#fef3c7';
      targetCtx.beginPath();
      targetCtx.moveTo(3, -5); targetCtx.lineTo(12, 0); targetCtx.lineTo(6, 13);
      targetCtx.closePath();
      targetCtx.fill();
    } else if(outfitId === 'princessdress') {
      // Royal Princess Ballroom Gown
      targetCtx.fillStyle = '#f472b6';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 2, 18.5, 14.5, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // Flared ballroom skirt drape
      targetCtx.fillStyle = '#fbcfe8';
      targetCtx.beginPath();
      targetCtx.moveTo(-16, 6);
      targetCtx.quadraticCurveTo(0, 19, 14, 8);
      targetCtx.quadraticCurveTo(0, 12, -16, 6);
      targetCtx.fill();

      // Scalloped White Lace Frills along bottom hem
      targetCtx.fillStyle = '#ffffff';
      for(let i = 0; i < 5; i++) {
        targetCtx.beginPath();
        targetCtx.arc(-12 + i * 6, 13, 3, 0, Math.PI);
        targetCtx.fill();
      }

      // Golden Waistline Ribbon
      targetCtx.strokeStyle = '#f59e0b';
      targetCtx.lineWidth = 1.4;
      targetCtx.beginPath();
      targetCtx.moveTo(-10, 4);
      targetCtx.quadraticCurveTo(0, 8, 11, 4);
      targetCtx.stroke();
    } else if(outfitId === 'kimono') {
      // Sakura Blossom Silk Kimono
      targetCtx.fillStyle = '#fda4af';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18, 14, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // Sakura Petals on Kimono
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(-6, 7, 2, 0, Math.PI * 2);
      targetCtx.arc(4, 11, 2.2, 0, Math.PI * 2);
      targetCtx.arc(-11, 2, 1.8, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#f43f5e';
      targetCtx.beginPath();
      targetCtx.arc(-6, 7, 1, 0, Math.PI * 2);
      targetCtx.arc(4, 11, 1, 0, Math.PI * 2);
      targetCtx.fill();

      // Wide Magenta & Gold Obi Sash
      targetCtx.fillStyle = '#9d174d';
      targetCtx.beginPath();
      targetCtx.moveTo(-9, 5); targetCtx.lineTo(11, 5); targetCtx.lineTo(10, 11); targetCtx.lineTo(-10, 11);
      targetCtx.closePath();
      targetCtx.fill();

      targetCtx.fillStyle = '#fbbf24';
      targetCtx.fillRect(-9, 7.5, 19, 1.8);
    } else if(outfitId === 'fairy') {
      // Magical Mint & Lilac Fairy Tunic
      targetCtx.fillStyle = '#6ee7b7';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18, 14, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // Petal Skirt Overlay
      targetCtx.fillStyle = '#c084fc';
      targetCtx.beginPath();
      targetCtx.moveTo(-12, 4);
      targetCtx.lineTo(-6, 15);
      targetCtx.lineTo(0, 6);
      targetCtx.lineTo(6, 15);
      targetCtx.lineTo(12, 4);
      targetCtx.closePath();
      targetCtx.fill();

      // Sparkle glints
      targetCtx.fillStyle = '#ffffff';
      drawCanvasSparkle(targetCtx, -3, 11, 2.2);
      drawCanvasSparkle(targetCtx, 8, 8, 2.2);
    } else if(outfitId === 'ballerina') {
      // Swan Ballerina Tutu & Satin Corset
      targetCtx.fillStyle = '#f472b6';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 0, 18, 13.5, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // Multi-layered Ruffled Ballerina Tutu Skirt
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 8, 19, 7.5, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#fce7f3';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 7, 16.5, 5.5, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // Silver sequin trim on tutu
      targetCtx.strokeStyle = '#e2e8f0';
      targetCtx.lineWidth = 1.2;
      targetCtx.beginPath();
      targetCtx.ellipse(0, 8, 18.5, 7, 0, 0, Math.PI * 2);
      targetCtx.stroke();
    } else if(outfitId === 'sailor') {
      // Navy Sailor Schoolgirl Uniform
      targetCtx.fillStyle = '#1e3a8a';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18, 14, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // White Sailor Shirt V-Opening
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.moveTo(2, 0); targetCtx.lineTo(12, 2); targetCtx.lineTo(4, 13); targetCtx.lineTo(-2, 4);
      targetCtx.closePath();
      targetCtx.fill();

      // Dual Sailor Stripes
      targetCtx.strokeStyle = '#ffffff';
      targetCtx.lineWidth = 1.2;
      targetCtx.beginPath();
      targetCtx.moveTo(-6, -1); targetCtx.lineTo(-1, 2);
      targetCtx.moveTo(-6, 2); targetCtx.lineTo(-1, 5);
      targetCtx.stroke();
    } else if(outfitId === 'ninja_suit') {
      targetCtx.fillStyle = '#18181b';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18, 14, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#3f3f46';
      targetCtx.lineWidth = 1.4;
      targetCtx.stroke();
    } else if(outfitId === 'cyber_armor') {
      targetCtx.fillStyle = '#334155';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18.5, 14, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#0284c7';
      targetCtx.lineWidth = 1.8;
      targetCtx.stroke();
    } else if(outfitId === 'hoodie') {
      targetCtx.fillStyle = '#475569';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18.5, 14.5, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#334155';
      rrTo(targetCtx, -4, 6, 14, 6, 2);
    } else if(outfitId === 'angel_wings') {
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18, 14, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#fde047';
      targetCtx.lineWidth = 1.2;
      targetCtx.stroke();
    } else if(outfitId === 'royal_robe') {
      targetCtx.fillStyle = '#991b1b';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 1, 18.5, 14.5, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.fillStyle = '#000000';
      [-10, -2, 6].forEach(fx => { targetCtx.fillRect(fx, 13, 2, 2.5); });
    } else if(outfitId === 'akatsuki_cloak') {
      // Akatsuki Black Body Cloak
      targetCtx.fillStyle = '#0f172a';
      targetCtx.beginPath();
      targetCtx.ellipse(-1, 2, 18, 14, 0, 0, Math.PI * 2);
      targetCtx.fill();
      // Red Cloud Pattern on Body
      targetCtx.fillStyle = '#dc2626';
      targetCtx.beginPath();
      targetCtx.arc(2, 6, 3.5, 0, Math.PI * 2);
      targetCtx.arc(5.5, 5, 2.5, 0, Math.PI * 2);
      targetCtx.arc(-1.5, 5, 2.5, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#ffffff';
      targetCtx.lineWidth = 0.8;
      targetCtx.stroke();
    } else if(outfitId === 'tanjiro_haori') {
      // Tanjiro Green-Black Checkered Haori Body
      targetCtx.fillStyle = '#15803d';
      targetCtx.beginPath();
      targetCtx.ellipse(-1, 2, 18, 14, 0, 0, Math.PI * 2);
      targetCtx.fill();
      // Checkered Pattern
      targetCtx.fillStyle = '#0f172a';
      targetCtx.fillRect(-8, -4, 6, 6);
      targetCtx.fillRect(4, -4, 6, 6);
      targetCtx.fillRect(-2, 2, 6, 6);
      targetCtx.fillRect(-8, 8, 6, 6);
      targetCtx.fillRect(4, 8, 6, 6);
    } else if(outfitId === 'scout_cape') {
      // Survey Corps Deep Green Cloak Body
      targetCtx.fillStyle = '#166534';
      targetCtx.beginPath();
      targetCtx.ellipse(-1, 2, 18, 14, 0, 0, Math.PI * 2);
      targetCtx.fill();
    } else if(outfitId === 'goku_gi') {
      // Turtle School Orange Gi Body
      targetCtx.fillStyle = '#ea580c';
      targetCtx.beginPath();
      targetCtx.ellipse(-1, 2, 18, 14, 0, 0, Math.PI * 2);
      targetCtx.fill();
      // Blue Undershirt V-Neck & Blue Belt
      targetCtx.fillStyle = '#1d4ed8';
      targetCtx.beginPath();
      targetCtx.moveTo(2, 0); targetCtx.lineTo(10, 2); targetCtx.lineTo(5, 12);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.fillRect(-12, 6, 22, 3);
      // Kame Kanji Badge
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(-2, 1, 3.8, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#0f172a';
      targetCtx.lineWidth = 0.8;
      targetCtx.stroke();
    } else if(outfitId === 'luffy_vest') {
      // Luffy Red Open Vest Body
      targetCtx.fillStyle = '#fed7aa'; // Exposed Chest
      targetCtx.beginPath();
      targetCtx.ellipse(-1, 2, 17, 13, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#ef4444'; // Red Vest Flaps
      targetCtx.beginPath();
      targetCtx.ellipse(-6, 2, 10, 13, 0, 0, Math.PI * 2);
      targetCtx.ellipse(8, 2, 6, 13, 0, 0, Math.PI * 2);
      targetCtx.fill();
      // Yellow Sash
      targetCtx.fillStyle = '#facc15';
      targetCtx.fillRect(-10, 6, 20, 3.5);
    } else if(outfitId === 'jujutsu_coat') {
      // Jujutsu Sorcerer Coat Body
      targetCtx.fillStyle = '#0f172a';
      targetCtx.beginPath();
      targetCtx.ellipse(-1, 2, 18, 14, 0, 0, Math.PI * 2);
      targetCtx.fill();
      // Single Golden Jujutsu Button
      targetCtx.fillStyle = '#fbbf24';
      targetCtx.beginPath();
      targetCtx.arc(4, 5, 2.2, 0, Math.PI * 2);
      targetCtx.fill();
    }

    targetCtx.restore();
  }

  function drawOutfitFrontTo(targetCtx, outfitId) {
    if(!outfitId || outfitId === 'none') return;
    targetCtx.save();

    if(outfitId === 'cape') {
      // Rich red collar clasp wrapping around the throat
      targetCtx.fillStyle = '#b91c1c';
      targetCtx.beginPath();
      targetCtx.ellipse(6, -4, 7, 3, 0.2, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#fbbf24';
      targetCtx.lineWidth = 1.2;
      targetCtx.stroke();

      // Golden Lion/Eagle Epaulet Brooch on collar
      targetCtx.fillStyle = '#fbbf24';
      targetCtx.beginPath();
      targetCtx.arc(6, -4, 4, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#d97706';
      targetCtx.lineWidth = 1.2;
      targetCtx.stroke();

      // Ruby gemstone center with sparkle
      targetCtx.fillStyle = '#dc2626';
      targetCtx.beginPath();
      targetCtx.arc(6, -4, 2.2, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(6.8, -4.8, 0.8, 0, Math.PI * 2);
      targetCtx.fill();

      // Golden drape chain across chest
      targetCtx.strokeStyle = '#fbbf24';
      targetCtx.lineWidth = 1.4;
      targetCtx.beginPath();
      targetCtx.arc(7, -3, 6, 0.4, 2.6);
      targetCtx.stroke();
    } else if(outfitId === 'redtie') {
      // 1. Crisp White Dress Shirt Collar (lowered to chest level)
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.moveTo(2, 0); targetCtx.lineTo(7, 3); targetCtx.lineTo(12, 0); targetCtx.lineTo(9, -1);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.strokeStyle = '#cbd5e1';
      targetCtx.lineWidth = 0.8;
      targetCtx.stroke();

      // 2. Crimson Silk Tie Knot (under collar)
      targetCtx.fillStyle = '#dc2626';
      targetCtx.beginPath();
      targetCtx.moveTo(5, 2); targetCtx.lineTo(9, 2); targetCtx.lineTo(8.5, 5); targetCtx.lineTo(5.5, 5);
      targetCtx.closePath();
      targetCtx.fill();

      // 3. Animated Flowing Silk Tie Body (swaying with flight physics)
      const tieSway = Math.sin(performance.now() / 110) * 3;
      const tieLift = Math.cos(performance.now() / 150) * 1.2;

      targetCtx.beginPath();
      targetCtx.moveTo(5.5, 5);
      targetCtx.lineTo(8.5, 5);
      targetCtx.lineTo(10.5 + tieSway, 14 + tieLift);
      targetCtx.lineTo(7.5 + tieSway, 18 + tieLift);
      targetCtx.lineTo(4.5 + tieSway, 14 + tieLift);
      targetCtx.closePath();
      targetCtx.fill();

      // 4. White Polkadot Pattern
      targetCtx.fillStyle = '#ffffff';
      [
        { x: 7 + tieSway * 0.3, y: 7.5 },
        { x: 5.5 + tieSway * 0.5, y: 11 },
        { x: 8.5 + tieSway * 0.5, y: 11 },
        { x: 7 + tieSway * 0.8, y: 14.5 }
      ].forEach(dot => {
        targetCtx.beginPath();
        targetCtx.arc(dot.x, dot.y, 0.9, 0, Math.PI * 2);
        targetCtx.fill();
      });
    } else if(outfitId === 'bluetie') {
      // 1. Pilot White Shirt Collar (lowered)
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.moveTo(2, 0); targetCtx.lineTo(7, 3); targetCtx.lineTo(12, 0); targetCtx.lineTo(9, -1);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.strokeStyle = '#cbd5e1';
      targetCtx.lineWidth = 0.8;
      targetCtx.stroke();

      // 2. Royal Blue Tie Knot
      targetCtx.fillStyle = '#1d4ed8';
      targetCtx.beginPath();
      targetCtx.moveTo(5, 2); targetCtx.lineTo(9, 2); targetCtx.lineTo(8.5, 5); targetCtx.lineTo(5.5, 5);
      targetCtx.closePath();
      targetCtx.fill();

      // 3. Animated Royal Blue Tie Body (swaying with wind flutter)
      const tieSway = Math.sin(performance.now() / 110) * 3;
      const tieLift = Math.cos(performance.now() / 150) * 1.2;

      targetCtx.fillStyle = '#2563eb';
      targetCtx.beginPath();
      targetCtx.moveTo(5.5, 5);
      targetCtx.lineTo(8.5, 5);
      targetCtx.lineTo(10.5 + tieSway, 14 + tieLift);
      targetCtx.lineTo(7.5 + tieSway, 18 + tieLift);
      targetCtx.lineTo(4.5 + tieSway, 14 + tieLift);
      targetCtx.closePath();
      targetCtx.fill();

      // 4. Animated Polka Dots on Tie
      targetCtx.fillStyle = '#dbeafe';
      targetCtx.beginPath();
      targetCtx.arc(7 + tieSway * 0.2, 7.5, 0.9, 0, Math.PI * 2);
      targetCtx.arc(6.2 + tieSway * 0.5, 11.5, 0.9, 0, Math.PI * 2);
      targetCtx.arc(8.5 + tieSway * 0.5, 11.5, 0.9, 0, Math.PI * 2);
      targetCtx.arc(7.5 + tieSway * 0.8, 15.5, 0.9, 0, Math.PI * 2);
      targetCtx.fill();

      // 5. Silver Tie Bar
      targetCtx.fillStyle = '#cbd5e1';
      rrTo(targetCtx, 4.8 + tieSway * 0.35, 9.5, 5.5, 1.6, 0.5);

      // 6. Gold Pilot Wings Badge on Chest
      targetCtx.fillStyle = '#fbbf24';
      targetCtx.beginPath();
      targetCtx.moveTo(-2, 3); targetCtx.lineTo(2, 1.5); targetCtx.lineTo(2, 4.5); targetCtx.closePath();
      targetCtx.fill();
    } else if(outfitId === 'bowtie') {
      // 1. Tuxedo Wingtip Collar
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.moveTo(2, -1); targetCtx.lineTo(7, 2); targetCtx.lineTo(12, -1);
      targetCtx.fill();

      // 2. 3D Velvet Red Bowtie Loops
      targetCtx.fillStyle = '#991b1b';
      targetCtx.beginPath();
      targetCtx.moveTo(7, 1); targetCtx.lineTo(2, -2); targetCtx.lineTo(2, 4); targetCtx.closePath();
      targetCtx.moveTo(7, 1); targetCtx.lineTo(12, -2); targetCtx.lineTo(12, 4); targetCtx.closePath();
      targetCtx.fill();

      targetCtx.fillStyle = '#dc2626';
      targetCtx.beginPath();
      targetCtx.moveTo(7, 1); targetCtx.lineTo(2.5, -1.5); targetCtx.lineTo(2.5, 3.5); targetCtx.closePath();
      targetCtx.moveTo(7, 1); targetCtx.lineTo(11.5, -1.5); targetCtx.lineTo(11.5, 3.5); targetCtx.closePath();
      targetCtx.fill();

      // 3. Polished Gold Center Knot Ring
      targetCtx.fillStyle = '#fbbf24';
      rrTo(targetCtx, 5.5, -0.5, 3, 3.5, 1);
      targetCtx.fillStyle = '#d97706';
      targetCtx.fillRect(6.2, 0, 1.4, 2);
    } else if(outfitId === 'goldchain') {
      // 1. Heavy Cuban-Link Gold Chain Draping Across Upper Chest
      targetCtx.strokeStyle = '#d97706';
      targetCtx.lineWidth = 2.8;
      targetCtx.beginPath();
      targetCtx.moveTo(2, 0);
      targetCtx.quadraticCurveTo(6.5, 5, 11, 1);
      targetCtx.stroke();

      targetCtx.strokeStyle = '#fbbf24';
      targetCtx.lineWidth = 1.8;
      targetCtx.shadowColor = 'rgba(251,191,36,0.6)';
      targetCtx.shadowBlur = 4;
      targetCtx.beginPath();
      targetCtx.moveTo(2, 0);
      targetCtx.quadraticCurveTo(6.5, 5, 11, 1);
      targetCtx.stroke();
      targetCtx.shadowBlur = 0;

      // 2. Heavy Gold Dollar Medallion centered on the chest
      targetCtx.fillStyle = '#f59e0b';
      targetCtx.beginPath();
      targetCtx.arc(6.5, 7, 4.5, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#fbbf24';
      targetCtx.beginPath();
      targetCtx.arc(6.5, 7, 3.6, 0, Math.PI * 2);
      targetCtx.fill();

      // 3. Embossed Dollar Sign $
      targetCtx.fillStyle = '#78350f';
      targetCtx.font = 'bold 6px Arial';
      targetCtx.textAlign = 'center';
      targetCtx.textBaseline = 'middle';
      targetCtx.fillText('$', 6.5, 7.3);

      // Star Sparkle Glint
      targetCtx.fillStyle = '#ffffff';
      drawCanvasSparkle(targetCtx, 9, 5, 2.5);
    } else if(outfitId === 'scarf') {
      const scarfWave = Math.sin(performance.now() / 130) * 3.5;

      // 1. Waving Scarf Tails trailing behind from the back of the neck
      targetCtx.fillStyle = '#ea580c';
      targetCtx.beginPath();
      targetCtx.moveTo(-2, 0);
      targetCtx.quadraticCurveTo(-16, 4 + scarfWave * 0.5, -24, 17 + scarfWave);
      targetCtx.lineTo(-18, 18 + scarfWave);
      targetCtx.lineTo(-1, 3);
      targetCtx.closePath();
      targetCtx.fill();

      // Yellow Stripes on trailing scarf tail
      targetCtx.fillStyle = '#fef08a';
      targetCtx.beginPath();
      targetCtx.moveTo(-8, 6 + scarfWave * 0.3); targetCtx.lineTo(-14, 9 + scarfWave * 0.4);
      targetCtx.lineTo(-13, 11 + scarfWave * 0.4); targetCtx.lineTo(-7, 8 + scarfWave * 0.3);
      targetCtx.closePath();
      targetCtx.fill();

      // White Fluffy Yarn Fringe Tassels
      targetCtx.fillStyle = '#ffffff';
      for(let i = 0; i < 4; i++) {
        targetCtx.fillRect(-24 + i * 1.6, 17 + scarfWave, 1.2, 4);
      }

      // 2. Thick Chunky Neck Wrap around the throat
      targetCtx.fillStyle = '#ea580c';
      rrTo(targetCtx, 1, -1, 12, 7, 3.5);
      targetCtx.fillStyle = '#fef08a';
      targetCtx.fillRect(2, 1, 10, 2);
      targetCtx.strokeStyle = '#c2410c';
      targetCtx.lineWidth = 1;
      targetCtx.stroke();
    } else if(outfitId === 'badge') {
      // 1. Red Western Neckerchief Bandana wrapped around the neck
      targetCtx.fillStyle = '#dc2626';
      targetCtx.beginPath();
      targetCtx.moveTo(2, -1);
      targetCtx.lineTo(12, 1);
      targetCtx.lineTo(7, 7);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.fillStyle = '#fca5a5';
      targetCtx.fillRect(5, 1, 4, 1.3);

      // 2. Golden 5-pointed Sheriff Star pinned on the chest vest
      targetCtx.save();
      targetCtx.translate(3.5, 6);
      targetCtx.fillStyle = '#fbbf24';
      targetCtx.shadowColor = 'rgba(251,191,36,0.7)';
      targetCtx.shadowBlur = 4;

      const cx = 0, cy = 0, rOut = 4.5, rIn = 2;
      targetCtx.beginPath();
      for(let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? rOut : rIn;
        const a = i * Math.PI / 5 - Math.PI / 2;
        const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
        if(i === 0) targetCtx.moveTo(px, py); else targetCtx.lineTo(px, py);
      }
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.shadowBlur = 0;

      // Ball tips on each star point
      targetCtx.fillStyle = '#f59e0b';
      for(let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
        targetCtx.beginPath();
        targetCtx.arc(Math.cos(a) * 4.5, Math.sin(a) * 4.5, 0.9, 0, Math.PI * 2);
        targetCtx.fill();
      }

      // Center seal
      targetCtx.fillStyle = '#78350f';
      targetCtx.beginPath();
      targetCtx.arc(0, 0, 1.8, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#fde047';
      drawCanvasStar(targetCtx, 0, 0.2, 1.2, 0.6);

      targetCtx.restore();
    } else if(outfitId === 'princessdress') {
      // Pearl Choker & Glowing Ruby Heart Pendant
      targetCtx.fillStyle = '#ffffff';
      for(let i = 0; i < 5; i++) {
        targetCtx.beginPath();
        targetCtx.arc(3 + i * 2.2, 1 + Math.sin(i * 0.7) * 1.2, 1.2, 0, Math.PI * 2);
        targetCtx.fill();
      }

      // Ruby Heart Locket
      targetCtx.fillStyle = '#e11d48';
      targetCtx.shadowColor = '#f43f5e';
      targetCtx.shadowBlur = 4;
      targetCtx.beginPath();
      targetCtx.arc(6.5, 6, 3, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.shadowBlur = 0;

      targetCtx.strokeStyle = '#fbbf24';
      targetCtx.lineWidth = 1.2;
      targetCtx.stroke();

      targetCtx.fillStyle = '#ffffff';
      drawCanvasSparkle(targetCtx, 8.5, 4.5, 2.5);
    } else if(outfitId === 'kimono') {
      // Kimono Overlapping V-Collar
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.moveTo(2, 0); targetCtx.lineTo(7, 3); targetCtx.lineTo(12, 0);
      targetCtx.stroke();

      // Hanging Golden Obi Tassel
      const tasselSway = Math.sin(performance.now() / 120) * 2;
      targetCtx.fillStyle = '#fbbf24';
      targetCtx.beginPath();
      targetCtx.arc(7, 8, 2, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#f59e0b';
      targetCtx.lineWidth = 1.6;
      targetCtx.beginPath();
      targetCtx.moveTo(7, 8);
      targetCtx.lineTo(7 + tasselSway, 16);
      targetCtx.stroke();
    } else if(outfitId === 'fairy') {
      // Emerald Star Amulet
      targetCtx.strokeStyle = '#fde047';
      targetCtx.lineWidth = 1.4;
      targetCtx.beginPath();
      targetCtx.moveTo(2, 0); targetCtx.quadraticCurveTo(6.5, 4, 11, 1);
      targetCtx.stroke();

      targetCtx.fillStyle = '#10b981';
      targetCtx.shadowColor = '#34d399';
      targetCtx.shadowBlur = 6;
      targetCtx.beginPath();
      targetCtx.arc(6.5, 6, 3.2, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.shadowBlur = 0;
      targetCtx.fillStyle = '#ffffff';
      drawCanvasSparkle(targetCtx, 6.5, 6.5, 2.5);
    } else if(outfitId === 'ballerina') {
      // Satin Ribbon Choker & Silver Ballerina Slipper
      targetCtx.fillStyle = '#f472b6';
      targetCtx.fillRect(2, 0.5, 10, 1.8);

      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(7, 6, 2.5, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#cbd5e1';
      targetCtx.lineWidth = 0.8;
      targetCtx.stroke();
    } else if(outfitId === 'sailor') {
      // Sailor Front Collar & Animated Red Ribbon Bow
      const bowSway = Math.sin(performance.now() / 110) * 2.5;

      // Sailor V-Flap
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.moveTo(2, -1); targetCtx.lineTo(7, 3); targetCtx.lineTo(12, -1); targetCtx.lineTo(9, -2);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.strokeStyle = '#1e3a8a';
      targetCtx.lineWidth = 0.8;
      targetCtx.stroke();

      // Red Ribbon Bow Loops
      targetCtx.fillStyle = '#dc2626';
      targetCtx.beginPath();
      targetCtx.moveTo(7, 3); targetCtx.lineTo(3, 1); targetCtx.lineTo(3, 6); targetCtx.closePath();
      targetCtx.moveTo(7, 3); targetCtx.lineTo(11, 1); targetCtx.lineTo(11, 6); targetCtx.closePath();
      targetCtx.fill();

      // Center Knot
      targetCtx.fillStyle = '#b91c1c';
      targetCtx.beginPath();
      targetCtx.arc(7, 3.5, 1.8, 0, Math.PI * 2);
      targetCtx.fill();

      // Fluttering Ribbon Tails
      targetCtx.strokeStyle = '#dc2626';
      targetCtx.lineWidth = 2.4;
      targetCtx.beginPath();
      targetCtx.moveTo(6, 4); targetCtx.lineTo(4 + bowSway, 14);
      targetCtx.moveTo(8, 4); targetCtx.lineTo(10 + bowSway, 14);
      targetCtx.stroke();
    } else if(outfitId === 'ninja_suit') {
      const sWave = Math.sin(performance.now() / 100) * 4;
      // Waving Black Shinobi Scarf Tails
      targetCtx.strokeStyle = '#18181b';
      targetCtx.lineWidth = 4;
      targetCtx.beginPath();
      targetCtx.moveTo(-2, 1);
      targetCtx.quadraticCurveTo(-14, 6 + sWave, -24, 18 + sWave);
      targetCtx.stroke();
      // Red Neck Wrap
      targetCtx.fillStyle = '#dc2626';
      rrTo(targetCtx, 1, -1, 12, 6, 3);
      // Silver Shuriken Pin
      targetCtx.fillStyle = '#cbd5e1';
      drawCanvasSparkle(targetCtx, 7, 7, 3.5);
    } else if(outfitId === 'cyber_armor') {
      // Glowing Cyan Arc Reactor on Chest
      targetCtx.save();
      targetCtx.fillStyle = '#0284c7';
      targetCtx.shadowColor = '#38bdf8';
      targetCtx.shadowBlur = 8;
      targetCtx.beginPath();
      targetCtx.arc(6.5, 6, 4, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(6.5, 6, 2, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.restore();
    } else if(outfitId === 'hoodie') {
      // Hoodie Drawstrings
      targetCtx.strokeStyle = '#e2e8f0';
      targetCtx.lineWidth = 1.4;
      targetCtx.beginPath();
      targetCtx.moveTo(4, 1); targetCtx.lineTo(4, 10);
      targetCtx.moveTo(9, 1); targetCtx.lineTo(9, 10);
      targetCtx.stroke();
      targetCtx.fillStyle = '#94a3b8';
      targetCtx.fillRect(3.2, 9.5, 1.6, 2);
      targetCtx.fillRect(8.2, 9.5, 1.6, 2);
    } else if(outfitId === 'angel_wings') {
      // Holy Halo / Golden Sun Medallion
      targetCtx.strokeStyle = '#fbbf24';
      targetCtx.lineWidth = 1.6;
      targetCtx.beginPath();
      targetCtx.moveTo(2, 0); targetCtx.quadraticCurveTo(6.5, 4, 11, 1);
      targetCtx.stroke();
      targetCtx.fillStyle = '#fde047';
      drawCanvasStar(targetCtx, 6.5, 6, 3.5, 1.8);
    } else if(outfitId === 'royal_robe') {
      // Golden Royal Chain of Office
      targetCtx.strokeStyle = '#fbbf24';
      targetCtx.lineWidth = 2.2;
      targetCtx.beginPath();
      targetCtx.moveTo(2, 0); targetCtx.quadraticCurveTo(6.5, 5, 11, 1);
      targetCtx.stroke();
      targetCtx.fillStyle = '#f59e0b';
      targetCtx.beginPath();
      targetCtx.arc(6.5, 6, 3.5, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#dc2626';
      targetCtx.beginPath();
      targetCtx.arc(6.5, 6, 1.8, 0, Math.PI * 2);
      targetCtx.fill();
    }

    targetCtx.restore();
  }

  function drawHatTo(targetCtx, hatId) {
    if(!hatId || hatId === 'none') return;
    targetCtx.save();
    if(hatId === 'tophat') {
      targetCtx.fillStyle = '#1e2430';
      rrTo(targetCtx, -4, -16, 23, 4, 1.5);
      rrTo(targetCtx, 0, -30, 16, 15, 2);
      targetCtx.fillStyle = '#e63946';
      targetCtx.fillRect(0, -20, 16, 4);
      targetCtx.fillStyle = 'rgba(255,255,255,0.25)';
      targetCtx.fillRect(2, -29, 3, 12);
    } else if(hatId === 'cap') {
      targetCtx.fillStyle = '#2563eb';
      targetCtx.beginPath();
      targetCtx.arc(6, -14, 10, Math.PI, 0);
      targetCtx.fill();
      targetCtx.fillStyle = '#1d4ed8';
      targetCtx.beginPath();
      targetCtx.moveTo(9, -14);
      targetCtx.lineTo(23, -12);
      targetCtx.lineTo(21, -16);
      targetCtx.lineTo(9, -16);
      targetCtx.fill();
      targetCtx.fillStyle = '#fff';
      targetCtx.beginPath();
      targetCtx.arc(6, -24, 2, 0, 7);
      targetCtx.fill();
    } else if(hatId === 'crown') {
      targetCtx.fillStyle = '#f59e0b';
      rrTo(targetCtx, 0, -17, 16, 4, 1);
      targetCtx.beginPath();
      targetCtx.moveTo(0, -17);
      targetCtx.lineTo(0, -27);
      targetCtx.lineTo(4, -22);
      targetCtx.lineTo(8, -29);
      targetCtx.lineTo(12, -22);
      targetCtx.lineTo(16, -27);
      targetCtx.lineTo(16, -17);
      targetCtx.fill();
      targetCtx.fillStyle = '#ef4444';
      targetCtx.beginPath();
      targetCtx.arc(8, -20, 2, 0, 7);
      targetCtx.fill();
      targetCtx.fillStyle = '#10b981';
      targetCtx.beginPath();
      targetCtx.arc(2.5, -20, 1.4, 0, 7);
      targetCtx.arc(13.5, -20, 1.4, 0, 7);
      targetCtx.fill();
    } else if(hatId === 'party') {
      targetCtx.fillStyle = '#ec4899';
      targetCtx.beginPath();
      targetCtx.moveTo(0, -15);
      targetCtx.lineTo(8, -34);
      targetCtx.lineTo(16, -14);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.strokeStyle = '#facc15';
      targetCtx.lineWidth = 2.2;
      targetCtx.beginPath();
      targetCtx.moveTo(3, -22); targetCtx.lineTo(13, -21);
      targetCtx.moveTo(5, -28); targetCtx.lineTo(11, -27);
      targetCtx.stroke();
      targetCtx.fillStyle = '#38bdf8';
      targetCtx.beginPath();
      targetCtx.arc(8, -35, 3.2, 0, 7);
      targetCtx.fill();
    } else if(hatId === 'cowboy') {
      targetCtx.fillStyle = '#854d0e';
      targetCtx.beginPath();
      targetCtx.ellipse(7, -15, 15, 3.5, -0.06, 0, 7);
      targetCtx.fill();
      targetCtx.beginPath();
      targetCtx.moveTo(2, -16);
      targetCtx.quadraticCurveTo(4, -26, 7, -25);
      targetCtx.quadraticCurveTo(10, -26, 12, -16);
      targetCtx.fill();
      targetCtx.fillStyle = '#451a03';
      targetCtx.fillRect(2.5, -18.5, 10, 2.5);
    } else if(hatId === 'pirate') {
      targetCtx.fillStyle = '#18181b';
      targetCtx.beginPath();
      targetCtx.moveTo(-4, -15);
      targetCtx.quadraticCurveTo(7, -28, 18, -15);
      targetCtx.lineTo(15, -13);
      targetCtx.lineTo(-1, -13);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.strokeStyle = '#eab308';
      targetCtx.lineWidth = 1.6;
      targetCtx.beginPath();
      targetCtx.moveTo(-4, -15);
      targetCtx.quadraticCurveTo(7, -28, 18, -15);
      targetCtx.stroke();
      targetCtx.fillStyle = '#fff';
      targetCtx.beginPath();
      targetCtx.arc(7, -20, 2, 0, 7);
      targetCtx.fill();
    } else if(hatId === 'chef') {
      targetCtx.fillStyle = '#f8fafc';
      targetCtx.beginPath();
      targetCtx.arc(4, -26, 5.5, 0, 7);
      targetCtx.arc(8, -28, 6.5, 0, 7);
      targetCtx.arc(12, -26, 5.5, 0, 7);
      targetCtx.fill();
      targetCtx.fillStyle = '#e2e8f0';
      rrTo(targetCtx, 3, -19, 11, 5.5, 1);
      targetCtx.strokeStyle = '#cbd5e1';
      targetCtx.lineWidth = 1;
      targetCtx.beginPath();
      targetCtx.moveTo(6, -25); targetCtx.lineTo(6, -19);
      targetCtx.moveTo(10, -25); targetCtx.lineTo(10, -19);
      targetCtx.stroke();
    } else if(hatId === 'beanie') {
      targetCtx.fillStyle = '#0284c7';
      targetCtx.beginPath();
      targetCtx.arc(7, -13, 10, Math.PI, 0);
      targetCtx.fill();
      targetCtx.fillStyle = '#0f172a';
      rrTo(targetCtx, -1, -16, 16, 5, 2);
      targetCtx.fillStyle = '#ef4444';
      targetCtx.beginPath();
      targetCtx.arc(7, -24, 3.2, 0, 7);
      targetCtx.fill();
    } else if(hatId === 'flowercrown') {
      // Flower Blossom Crown (Sakura, Roses, Leaves)
      targetCtx.strokeStyle = '#16a34a';
      targetCtx.lineWidth = 2.2;
      targetCtx.beginPath();
      targetCtx.arc(7, -13, 9, Math.PI * 0.92, 0.08);
      targetCtx.stroke();

      // Leaves
      targetCtx.fillStyle = '#22c55e';
      targetCtx.beginPath();
      targetCtx.ellipse(0, -16, 3, 1.6, -0.4, 0, Math.PI * 2);
      targetCtx.ellipse(14, -16, 3, 1.6, 0.4, 0, Math.PI * 2);
      targetCtx.fill();

      // Flower 1 (Pink Sakura)
      targetCtx.fillStyle = '#f472b6';
      for(let a = 0; a < 5; a++) {
        const rad = (a * Math.PI * 2) / 5;
        targetCtx.beginPath();
        targetCtx.arc(1 + Math.cos(rad) * 2.2, -19 + Math.sin(rad) * 2.2, 1.8, 0, Math.PI * 2);
        targetCtx.fill();
      }
      targetCtx.fillStyle = '#fef08a';
      targetCtx.beginPath();
      targetCtx.arc(1, -19, 1.2, 0, Math.PI * 2);
      targetCtx.fill();

      // Flower 2 (Center Rose Red)
      targetCtx.fillStyle = '#ef4444';
      for(let a = 0; a < 5; a++) {
        const rad = (a * Math.PI * 2) / 5;
        targetCtx.beginPath();
        targetCtx.arc(7 + Math.cos(rad) * 2.6, -22 + Math.sin(rad) * 2.6, 2.2, 0, Math.PI * 2);
        targetCtx.fill();
      }
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(7, -22, 1.4, 0, Math.PI * 2);
      targetCtx.fill();

      // Flower 3 (Pastel Pink)
      targetCtx.fillStyle = '#f472b6';
      for(let a = 0; a < 5; a++) {
        const rad = (a * Math.PI * 2) / 5;
        targetCtx.beginPath();
        targetCtx.arc(13 + Math.cos(rad) * 2.2, -19 + Math.sin(rad) * 2.2, 1.8, 0, Math.PI * 2);
        targetCtx.fill();
      }
      targetCtx.fillStyle = '#fef08a';
      targetCtx.beginPath();
      targetCtx.arc(13, -19, 1.2, 0, Math.PI * 2);
      targetCtx.fill();
    } else if(hatId === 'pinkribbon') {
      // Big Cute Pink Lace Ribbon Bow
      const rWave = Math.sin(performance.now() / 140) * 1.5;

      // Trailing Ribbon Tails
      targetCtx.fillStyle = '#ec4899';
      targetCtx.beginPath();
      targetCtx.moveTo(4, -18);
      targetCtx.quadraticCurveTo(-6, -14, -12 + rWave, -8);
      targetCtx.lineTo(-8 + rWave, -7);
      targetCtx.lineTo(6, -16);
      targetCtx.closePath();
      targetCtx.fill();

      // Big Fluffy Bow Loops
      targetCtx.fillStyle = '#ec4899';
      targetCtx.beginPath();
      targetCtx.moveTo(7, -20); targetCtx.lineTo(0, -28); targetCtx.lineTo(0, -15); targetCtx.closePath();
      targetCtx.moveTo(7, -20); targetCtx.lineTo(14, -28); targetCtx.lineTo(14, -15); targetCtx.closePath();
      targetCtx.fill();

      targetCtx.fillStyle = '#f472b6';
      targetCtx.beginPath();
      targetCtx.moveTo(7, -20); targetCtx.lineTo(1, -26); targetCtx.lineTo(1, -16); targetCtx.closePath();
      targetCtx.moveTo(7, -20); targetCtx.lineTo(13, -26); targetCtx.lineTo(13, -16); targetCtx.closePath();
      targetCtx.fill();

      // White Polka Dots
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(3, -21, 1, 0, Math.PI * 2);
      targetCtx.arc(11, -21, 1, 0, Math.PI * 2);
      targetCtx.fill();

      // Center Pearl Heart Knot
      targetCtx.fillStyle = '#fbcfe8';
      targetCtx.beginPath();
      targetCtx.arc(7, -20, 2.5, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(7, -20, 1.3, 0, Math.PI * 2);
      targetCtx.fill();
    } else if(hatId === 'sunhat') {
      // Summer Beach Woven Straw Sunhat
      targetCtx.fillStyle = '#fde047';
      targetCtx.beginPath();
      targetCtx.ellipse(7, -15, 17, 4, -0.05, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#ca8a04';
      targetCtx.lineWidth = 1;
      targetCtx.stroke();

      // Straw Crown Dome
      targetCtx.fillStyle = '#facc15';
      targetCtx.beginPath();
      targetCtx.arc(7, -17, 9, Math.PI, 0);
      targetCtx.fill();

      // Lavender Silk Ribbon Band
      targetCtx.fillStyle = '#c084fc';
      targetCtx.fillRect(0, -18, 14, 3);

      // Trailing Ribbon Tails
      targetCtx.strokeStyle = '#c084fc';
      targetCtx.lineWidth = 2;
      targetCtx.beginPath();
      targetCtx.moveTo(0, -17); targetCtx.lineTo(-8, -10);
      targetCtx.stroke();

      // Pinned Daisy Flower
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(1, -17, 2.5, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#f59e0b';
      targetCtx.beginPath();
      targetCtx.arc(1, -17, 1, 0, Math.PI * 2);
      targetCtx.fill();
    } else if(hatId === 'tiara') {
      // Sparkling Princess Tiara Crown
      targetCtx.save();
      targetCtx.fillStyle = '#f1f5f9';
      targetCtx.shadowColor = '#f472b6';
      targetCtx.shadowBlur = 6;

      // Tiara Base Silver Band
      rrTo(targetCtx, 0, -16, 14, 2.5, 1);

      // 3 Elegant Diamond Arches
      targetCtx.beginPath();
      targetCtx.moveTo(0, -16);
      targetCtx.lineTo(2, -24);
      targetCtx.lineTo(5, -19);
      targetCtx.lineTo(7, -27);
      targetCtx.lineTo(9, -19);
      targetCtx.lineTo(12, -24);
      targetCtx.lineTo(14, -16);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.shadowBlur = 0;

      // Pink Ruby Gems on 3 Peaks
      targetCtx.fillStyle = '#f43f5e';
      targetCtx.beginPath();
      targetCtx.arc(7, -27, 2, 0, Math.PI * 2);
      targetCtx.arc(2, -24, 1.4, 0, Math.PI * 2);
      targetCtx.arc(12, -24, 1.4, 0, Math.PI * 2);
      targetCtx.fill();

      // Star Sparkle
      targetCtx.fillStyle = '#ffffff';
      drawCanvasSparkle(targetCtx, 7, -30, 3);
      targetCtx.restore();
    } else if(hatId === 'catears') {
      // Kitty Cat Ears Headband with Jingle Bells
      targetCtx.strokeStyle = '#f472b6';
      targetCtx.lineWidth = 2;
      targetCtx.beginPath();
      targetCtx.arc(7, -13, 9, Math.PI * 0.9, 0.1);
      targetCtx.stroke();

      // Left Ear
      targetCtx.fillStyle = '#f472b6';
      targetCtx.beginPath();
      targetCtx.moveTo(-2, -15); targetCtx.lineTo(-4, -28); targetCtx.lineTo(4, -19);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.fillStyle = '#fdf2f8';
      targetCtx.beginPath();
      targetCtx.moveTo(-1, -16); targetCtx.lineTo(-3, -25); targetCtx.lineTo(3, -19);
      targetCtx.closePath();
      targetCtx.fill();

      // Right Ear
      targetCtx.fillStyle = '#f472b6';
      targetCtx.beginPath();
      targetCtx.moveTo(10, -19); targetCtx.lineTo(18, -28); targetCtx.lineTo(16, -15);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.fillStyle = '#fdf2f8';
      targetCtx.beginPath();
      targetCtx.moveTo(11, -19); targetCtx.lineTo(17, -25); targetCtx.lineTo(15, -16);
      targetCtx.closePath();
      targetCtx.fill();

      // Gold Jingle Bells & Red Ribbon on Left Ear
      targetCtx.fillStyle = '#fbbf24';
      targetCtx.beginPath();
      targetCtx.arc(-2, -15, 2.2, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#ef4444';
      targetCtx.fillRect(-3, -16, 2, 1);
    } else if(hatId === 'viking') {
      // Viking Iron Helmet with Curved Horns
      targetCtx.fillStyle = '#64748b';
      targetCtx.beginPath();
      targetCtx.arc(7, -13, 10, Math.PI, 0);
      targetCtx.fill();
      targetCtx.fillStyle = '#475569';
      rrTo(targetCtx, -1, -16, 16, 4.5, 1.5);
      // Left Horn
      targetCtx.fillStyle = '#fde047';
      targetCtx.beginPath();
      targetCtx.moveTo(0, -15);
      targetCtx.quadraticCurveTo(-10, -22, -8, -30);
      targetCtx.quadraticCurveTo(-4, -20, 2, -18);
      targetCtx.closePath();
      targetCtx.fill();
      // Right Horn
      targetCtx.beginPath();
      targetCtx.moveTo(14, -15);
      targetCtx.quadraticCurveTo(24, -22, 22, -30);
      targetCtx.quadraticCurveTo(18, -20, 12, -18);
      targetCtx.closePath();
      targetCtx.fill();
    } else if(hatId === 'astronaut') {
      // Astronaut Dome Helmet with Golden Visor
      targetCtx.fillStyle = '#f8fafc';
      targetCtx.beginPath();
      targetCtx.arc(7, -14, 12, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#94a3b8';
      targetCtx.lineWidth = 1.6;
      targetCtx.stroke();
      // Gold Visor Glass
      targetCtx.fillStyle = '#f59e0b';
      targetCtx.beginPath();
      targetCtx.ellipse(9, -14, 7.5, 6, 0.1, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#d97706';
      targetCtx.lineWidth = 1;
      targetCtx.stroke();
      // Glare reflection
      targetCtx.strokeStyle = '#ffffff';
      targetCtx.lineWidth = 1.4;
      targetCtx.beginPath();
      targetCtx.arc(9, -14, 5, -Math.PI * 0.8, -Math.PI * 0.3);
      targetCtx.stroke();
    } else if(hatId === 'ninja') {
      // Ninja Red Headband with Fluttering Tails
      const nWave = Math.sin(performance.now() / 110) * 3;
      targetCtx.fillStyle = '#dc2626';
      rrTo(targetCtx, -1, -17, 16, 5, 2);
      // Silver Forehead Plate
      targetCtx.fillStyle = '#e2e8f0';
      rrTo(targetCtx, 4, -16, 6, 3, 1);
      // Trailing Headband Cloth Tails
      targetCtx.strokeStyle = '#dc2626';
      targetCtx.lineWidth = 3;
      targetCtx.beginPath();
      targetCtx.moveTo(-1, -15);
      targetCtx.quadraticCurveTo(-12, -18 + nWave, -22, -10 + nWave);
      targetCtx.moveTo(-1, -13);
      targetCtx.quadraticCurveTo(-10, -10 + nWave, -18, -4 + nWave);
      targetCtx.stroke();
    } else if(hatId === 'witch') {
      // Pointed Witch Magic Hat
      targetCtx.fillStyle = '#3b0764';
      targetCtx.beginPath();
      targetCtx.ellipse(7, -15, 17, 4, -0.05, 0, Math.PI * 2);
      targetCtx.fill();
      // Tall Cone
      targetCtx.fillStyle = '#581c87';
      targetCtx.beginPath();
      targetCtx.moveTo(0, -15);
      targetCtx.lineTo(9, -36);
      targetCtx.lineTo(14, -15);
      targetCtx.closePath();
      targetCtx.fill();
      // Gold Buckle Band
      targetCtx.fillStyle = '#f59e0b';
      targetCtx.fillRect(1, -18, 12, 3);
      targetCtx.strokeStyle = '#fef08a';
      targetCtx.lineWidth = 1.2;
      targetCtx.strokeRect(5, -19, 4, 5);
    } else if(hatId === 'bunny') {
      // Fluffy Bunny Ears
      const bFlap = Math.sin(performance.now() / 130) * 2;
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.ellipse(2, -26 + bFlap, 4, 11, -0.15, 0, Math.PI * 2);
      targetCtx.ellipse(12, -26 - bFlap, 4, 11, 0.15, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#e2e8f0';
      targetCtx.lineWidth = 1;
      targetCtx.stroke();
      // Pink Inner Ear
      targetCtx.fillStyle = '#fbcfe8';
      targetCtx.beginPath();
      targetCtx.ellipse(2, -26 + bFlap, 2, 8, -0.15, 0, Math.PI * 2);
      targetCtx.ellipse(12, -26 - bFlap, 2, 8, 0.15, 0, Math.PI * 2);
      targetCtx.fill();
      // Pink Headband
      targetCtx.fillStyle = '#f472b6';
      rrTo(targetCtx, 0, -16, 14, 3, 1.5);
    } else if(hatId === 'straw_hat') {
      // Mugiwara Straw Hat (Luffy) - High Detail & Snug Fit
      // 1. Wide Straw Brim with Golden Hue
      targetCtx.fillStyle = '#facc15';
      targetCtx.beginPath();
      targetCtx.ellipse(6, -12, 19, 5, -0.05, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#ca8a04';
      targetCtx.lineWidth = 1.4;
      targetCtx.stroke();
      // 2. Hat Crown Dome
      targetCtx.beginPath();
      targetCtx.ellipse(6, -17, 10, 8, 0, Math.PI, 0);
      targetCtx.fill();
      targetCtx.stroke();
      // 3. Iconic Red Ribbon Band
      targetCtx.fillStyle = '#dc2626';
      targetCtx.beginPath();
      targetCtx.ellipse(6, -14, 10.2, 3.2, 0, 0, Math.PI * 2);
      targetCtx.fill();
      // Straw highlight
      targetCtx.fillStyle = '#fef08a';
      targetCtx.beginPath();
      targetCtx.ellipse(5, -20, 5, 2, -0.1, 0, Math.PI * 2);
      targetCtx.fill();
    } else if(hatId === 'shinobi_plate') {
      // Hidden Leaf Shinobi Headband (Konoha)
      targetCtx.fillStyle = '#1e3a8a';
      rrTo(targetCtx, -3, -14, 19, 6.5, 2);
      // Steel Plate
      targetCtx.fillStyle = '#e2e8f0';
      rrTo(targetCtx, 1, -13.5, 11, 5.2, 1.2);
      targetCtx.strokeStyle = '#64748b';
      targetCtx.lineWidth = 1;
      targetCtx.strokeRect(1, -13.5, 11, 5.2);
      // 4 Corner Rivets
      targetCtx.fillStyle = '#475569';
      targetCtx.fillRect(2, -12.5, 1, 1);
      targetCtx.fillRect(10, -12.5, 1, 1);
      targetCtx.fillRect(2, -9.8, 1, 1);
      targetCtx.fillRect(10, -9.8, 1, 1);
      // Engraved Leaf Spiral Emblem
      targetCtx.strokeStyle = '#0f172a';
      targetCtx.lineWidth = 0.9;
      targetCtx.beginPath();
      targetCtx.arc(6.5, -11, 1.5, 0, Math.PI * 1.5);
      targetCtx.lineTo(9, -11);
      targetCtx.stroke();
    } else if(hatId === 'tanjiro_earrings') {
      // Hanafuda Sun Earrings & Forehead Demon Flame Scar
      targetCtx.fillStyle = '#ffffff';
      targetCtx.fillRect(15, -4, 4, 9);
      targetCtx.strokeStyle = '#991b1b';
      targetCtx.lineWidth = 0.8;
      targetCtx.strokeRect(15, -4, 4, 9);
      targetCtx.fillStyle = '#dc2626';
      targetCtx.beginPath();
      targetCtx.arc(17, -1, 1.6, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#0f172a';
      targetCtx.fillRect(15.5, 2, 3, 1);
      // Dangling Ring
      targetCtx.strokeStyle = '#94a3b8';
      targetCtx.lineWidth = 1;
      targetCtx.beginPath();
      targetCtx.arc(17, -5, 1.2, 0, Math.PI * 2);
      targetCtx.stroke();
    } else if(hatId === 'gojo_blindfold') {
      // Gojo Upright Silver Hair with Shading
      targetCtx.fillStyle = '#f8fafc';
      targetCtx.beginPath();
      targetCtx.moveTo(-3, -12);
      targetCtx.lineTo(-1, -26);
      targetCtx.lineTo(3, -18);
      targetCtx.lineTo(7, -30);
      targetCtx.lineTo(11, -19);
      targetCtx.lineTo(16, -26);
      targetCtx.lineTo(16, -12);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.strokeStyle = '#cbd5e1';
      targetCtx.lineWidth = 1.2;
      targetCtx.stroke();
      // Sleek Jet-Black Sorcerer Blindfold
      targetCtx.fillStyle = '#0f172a';
      rrTo(targetCtx, -1, -13.5, 18, 7.5, 2);
      targetCtx.strokeStyle = '#38bdf8';
      targetCtx.lineWidth = 0.8;
      targetCtx.stroke();
    } else if(hatId === 'saiyan_hair') {
      // Super Saiyan Spiky Golden Hair
      targetCtx.fillStyle = '#facc15';
      targetCtx.beginPath();
      targetCtx.moveTo(-4, -10);
      targetCtx.lineTo(-2, -29);
      targetCtx.lineTo(3, -19);
      targetCtx.lineTo(8, -35);
      targetCtx.lineTo(13, -21);
      targetCtx.lineTo(20, -31);
      targetCtx.lineTo(17, -10);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.strokeStyle = '#ca8a04';
      targetCtx.lineWidth = 1.4;
      targetCtx.stroke();
      // Inner Golden Ki Highlight
      targetCtx.fillStyle = '#fef08a';
      targetCtx.beginPath();
      targetCtx.moveTo(2, -12);
      targetCtx.lineTo(4, -25);
      targetCtx.lineTo(8, -31);
      targetCtx.lineTo(12, -17);
      targetCtx.fill();
    } else if(hatId === 'hokage_hat') {
      // Hokage Triangular Hat with Cloth Veil
      targetCtx.fillStyle = '#dc2626';
      targetCtx.beginPath();
      targetCtx.moveTo(-4, -14);
      targetCtx.lineTo(7, -33);
      targetCtx.lineTo(18, -14);
      targetCtx.closePath();
      targetCtx.fill();
      // White Front Diamond Face Veil
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.moveTo(0, -14);
      targetCtx.lineTo(7, -30);
      targetCtx.lineTo(14, -14);
      targetCtx.closePath();
      targetCtx.fill();
      // Green Kanji Fire Circle
      targetCtx.fillStyle = '#16a34a';
      targetCtx.beginPath();
      targetCtx.arc(7, -20, 3.4, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#ffffff';
      targetCtx.font = 'bold 4px sans-serif';
      targetCtx.textAlign = 'center';
      targetCtx.fillText('火', 7, -18.5);
    } else if(hatId === 'chopper_hat') {
      // Chopper Antler Doctor Hat
      targetCtx.fillStyle = '#78350f';
      // Left and Right Reindeer Antlers
      targetCtx.fillRect(-2, -26, 3.2, 11);
      targetCtx.fillRect(-5, -24, 6.5, 2.5);
      targetCtx.fillRect(14, -26, 3.2, 11);
      targetCtx.fillRect(14, -24, 6.5, 2.5);
      // Soft Pink Doctor Cap Dome
      targetCtx.fillStyle = '#f472b6';
      targetCtx.beginPath();
      targetCtx.ellipse(7.5, -18, 12, 8.5, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#db2777';
      targetCtx.lineWidth = 1;
      targetCtx.stroke();
      // Blue Hat Rim Band
      targetCtx.fillStyle = '#38bdf8';
      rrTo(targetCtx, -2, -14, 19, 3, 1.2);
      // Pure White Medical Cross
      targetCtx.fillStyle = '#ffffff';
      targetCtx.fillRect(6, -21, 3, 7);
      targetCtx.fillRect(4, -19, 7, 3);
    }
    targetCtx.restore();
  }

  // Universal Custom Bird Renderer
  function renderCustomBird(targetCtx, opt) {
    const skin = skins[opt.skinId] || skins.classic;
    const hatId = opt.hatId || 'none';
    const outfitId = opt.outfitId || 'none';

    targetCtx.save();
    if(opt.opacity !== undefined) targetCtx.globalAlpha = opt.opacity;
    targetCtx.translate(opt.x, opt.y);
    targetCtx.rotate(opt.angle || 0);

    // 1. Cape or Fairy Wings or Seraph Angel Wings flowing behind body
    if(outfitId === 'cape' || outfitId === 'fairy' || outfitId === 'angel_wings') {
      drawCapeBackTo(targetCtx, opt.wing || 0, outfitId);
    }

    // 1. Ambient Skin Glow Aura (Soft Halo)
    if(skin.glow) {
      targetCtx.shadowColor = skin.glow;
      targetCtx.shadowBlur = 10;
    }

    // 2. Tail feathers with double layers
    targetCtx.fillStyle = skin.wing || '#de7c24';
    targetCtx.beginPath();
    targetCtx.ellipse(-18, 3, 11, 8, 0, 0, 7);
    targetCtx.fill();
    targetCtx.fillStyle = skin.body;
    targetCtx.beginPath();
    targetCtx.ellipse(-16, 2, 7, 5, 0.2, 0, 7);
    targetCtx.fill();

    // 3. Volumetric Bird Body (Spherical 3D Light Highlight)
    const bodyGrad = targetCtx.createRadialGradient(-4, -5, 2, 0, 0, 20);
    bodyGrad.addColorStop(0, '#ffffff');
    bodyGrad.addColorStop(0.3, skin.body);
    bodyGrad.addColorStop(0.85, skin.body);
    bodyGrad.addColorStop(1, skin.wing || skin.body);
    targetCtx.fillStyle = bodyGrad;
    targetCtx.beginPath();
    targetCtx.ellipse(0, 0, 19, 15, 0, 0, 7);
    targetCtx.fill();
    targetCtx.shadowBlur = 0;

    // 3b. Rosy Cheeks (Cute Chibi Blush with Anime Hatching)
    targetCtx.fillStyle = 'rgba(251, 113, 133, 0.55)';
    targetCtx.beginPath();
    targetCtx.ellipse(4, 3.5, 5.2, 3.6, 0, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.strokeStyle = '#f43f5e';
    targetCtx.lineWidth = 1;
    targetCtx.beginPath();
    targetCtx.moveTo(2.5, 1.8); targetCtx.lineTo(1.2, 4.8);
    targetCtx.moveTo(4.8, 1.8); targetCtx.lineTo(3.5, 4.8);
    targetCtx.moveTo(7.0, 2.0); targetCtx.lineTo(5.8, 4.8);
    targetCtx.stroke();

    // 4. Clothes / Shirts / Vests / Dresses covering body
    drawOutfitBodyTo(targetCtx, outfitId);

    // 5. Belly light (only when not wearing full body outfits)
    if(outfitId === 'none' || outfitId === 'cape') {
      const bellyGrad = targetCtx.createLinearGradient(-8, 2, -2, 10);
      bellyGrad.addColorStop(0, '#ffffff');
      bellyGrad.addColorStop(0.6, '#fff1af');
      bellyGrad.addColorStop(1, '#fde047');
      targetCtx.fillStyle = bellyGrad;
      targetCtx.beginPath();
      targetCtx.ellipse(-5, 5, 7.5, 4.5, .2, 0, 7);
      targetCtx.fill();
    }

    // 6. Front Outfit Accessories (Ties, Bowties, Medallions, Badges, Necklaces, Ribbons)
    drawOutfitFrontTo(targetCtx, outfitId);

    // 7. Wing with animated dynamic flap and layered feathers
    targetCtx.save();
    targetCtx.translate(-4, 4);
    const flapAngle = (opt.wing || 0) > 0 ? -0.45 : 0.08;
    targetCtx.rotate(flapAngle);

    // Main Wing Body
    const wingGrad = targetCtx.createLinearGradient(-10, -5, 10, 8);
    wingGrad.addColorStop(0, skin.body);
    wingGrad.addColorStop(0.5, skin.wing);
    wingGrad.addColorStop(1, '#991b1b');
    targetCtx.fillStyle = wingGrad;
    targetCtx.beginPath();
    targetCtx.ellipse(0, 0, 11, 7.5, -0.2, 0, 7);
    targetCtx.fill();

    // Wing Feather Details
    targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    targetCtx.lineWidth = 1.2;
    targetCtx.beginPath();
    targetCtx.moveTo(-6, -2);
    targetCtx.quadraticCurveTo(0, -1, 7, -3);
    targetCtx.moveTo(-4, 2);
    targetCtx.quadraticCurveTo(2, 3, 8, 1);
    targetCtx.stroke();

    // Wing Top Specular Sheen
    targetCtx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    targetCtx.beginPath();
    targetCtx.ellipse(-2, -2, 6, 3, -0.2, 0, 7);
    targetCtx.fill();
    targetCtx.restore();

    // 8b. Hair & Head Features for Anime Birds (when not wearing full hats)
    if(hatId === 'none') {
      if(opt.skinId === 'gojo_bird') {
        // Gojo Spiky Snow-White Upright Hair
        targetCtx.fillStyle = '#ffffff';
        targetCtx.beginPath();
        targetCtx.moveTo(-4, -10);
        targetCtx.lineTo(-2, -22);
        targetCtx.lineTo(3, -15);
        targetCtx.lineTo(7, -25);
        targetCtx.lineTo(11, -16);
        targetCtx.lineTo(16, -21);
        targetCtx.lineTo(15, -10);
        targetCtx.closePath();
        targetCtx.fill();
        targetCtx.strokeStyle = '#e2e8f0';
        targetCtx.lineWidth = 0.8;
        targetCtx.stroke();
      } else if(opt.skinId === 'goku_ssj') {
        // Goku Super Saiyan Golden Spikes
        targetCtx.fillStyle = '#facc15';
        targetCtx.beginPath();
        targetCtx.moveTo(-6, -8);
        targetCtx.lineTo(-4, -24);
        targetCtx.lineTo(2, -16);
        targetCtx.lineTo(7, -28);
        targetCtx.lineTo(13, -17);
        targetCtx.lineTo(18, -23);
        targetCtx.lineTo(16, -8);
        targetCtx.closePath();
        targetCtx.fill();
        targetCtx.strokeStyle = '#ca8a04';
        targetCtx.lineWidth = 1;
        targetCtx.stroke();
      } else if(opt.skinId === 'naruto_bird') {
        // Naruto Yellow Spikes & Forehead Band
        targetCtx.fillStyle = '#fde047';
        targetCtx.beginPath();
        targetCtx.moveTo(-4, -10);
        targetCtx.lineTo(0, -20);
        targetCtx.lineTo(5, -13);
        targetCtx.lineTo(10, -21);
        targetCtx.lineTo(14, -10);
        targetCtx.closePath();
        targetCtx.fill();
      }
    }

    // 8. Beak (ALWAYS drawn above clothes so it is NEVER covered!)
    targetCtx.fillStyle = skin.beak;
    targetCtx.beginPath();
    targetCtx.moveTo(14, -2);
    targetCtx.lineTo(28, 3);
    targetCtx.lineTo(14, 8);
    targetCtx.closePath();
    targetCtx.fill();
    targetCtx.strokeStyle = 'rgba(0,0,0,0.18)';
    targetCtx.lineWidth = 1.2;
    targetCtx.beginPath();
    targetCtx.moveTo(14, 3);
    targetCtx.lineTo(26, 3);
    targetCtx.stroke();

    // 8c. Facial Marks (Scars, Whiskers)
    if(opt.skinId === 'tanjiro_bird') {
      // Tanjiro Crimson Demon Slayer Mark on Forehead
      targetCtx.fillStyle = '#991b1b';
      targetCtx.beginPath();
      targetCtx.moveTo(2, -12); targetCtx.quadraticCurveTo(5, -16, 7, -12); targetCtx.quadraticCurveTo(4, -9, 2, -12);
      targetCtx.fill();
    } else if(opt.skinId === 'naruto_bird') {
      // Naruto Fox Whiskers
      targetCtx.strokeStyle = '#78350f';
      targetCtx.lineWidth = 1.2;
      targetCtx.beginPath();
      targetCtx.moveTo(-1, 0); targetCtx.lineTo(6, 1);
      targetCtx.moveTo(-2, 3); targetCtx.lineTo(5, 4);
      targetCtx.moveTo(-1, 6); targetCtx.lineTo(5, 7);
      targetCtx.stroke();
    } else if(opt.skinId === 'luffy_bird') {
      // Luffy Stitched Under-Eye Scar
      targetCtx.strokeStyle = '#0f172a';
      targetCtx.lineWidth = 1;
      targetCtx.beginPath();
      targetCtx.moveTo(5, -1); targetCtx.lineTo(11, 0);
      targetCtx.moveTo(7, -3); targetCtx.lineTo(7, 2);
      targetCtx.moveTo(9, -2.5); targetCtx.lineTo(9, 2.5);
      targetCtx.stroke();
    }

    // 9. Eye (Knockout "X" when dead, specialized eyes for Anime characters, cute boba for others)
    if(opt.isDead || (opt.isPlayer && window.bird && window.bird.dead)) {
      // Comical Cartoon Knockout "X" Eyes
      targetCtx.save();
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(6, -7, 6.8, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#0f172a';
      targetCtx.lineWidth = 1.3;
      targetCtx.stroke();

      // Bold Comic Red X Mark
      targetCtx.strokeStyle = '#ef4444';
      targetCtx.lineWidth = 2.6;
      targetCtx.lineCap = 'round';
      targetCtx.beginPath();
      targetCtx.moveTo(2.5, -10.5); targetCtx.lineTo(9.5, -3.5);
      targetCtx.moveTo(9.5, -10.5); targetCtx.lineTo(2.5, -3.5);
      targetCtx.stroke();

      // Dizzy Floating Stars & Swirl above head
      const now = performance.now();
      const rot = (now / 180) % (Math.PI * 2);
      targetCtx.strokeStyle = '#facc15';
      targetCtx.lineWidth = 1.5;
      targetCtx.beginPath();
      for(let a = 0; a < Math.PI * 2; a += 0.25) {
        const r = 3 + a * 1.1;
        const sx = 5 + Math.cos(a + rot) * r;
        const sy = -19 + Math.sin(a + rot) * (r * 0.4);
        if(a === 0) targetCtx.moveTo(sx, sy);
        else targetCtx.lineTo(sx, sy);
      }
      targetCtx.stroke();
      targetCtx.restore();
    } else if(opt.skinId === 'gojo_bird') {
      // SATORU GOJO'S FAMOUS CELESTIAL GLOWING SKY-BLUE SIX EYES
      targetCtx.save();
      targetCtx.shadowColor = '#00f5d4';
      targetCtx.shadowBlur = 14;

      // Pure Bright Sclera
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(6, -7, 6.8, 0, Math.PI * 2);
      targetCtx.fill();

      // Outer Luminous Sky Blue Ring
      targetCtx.fillStyle = '#38bdf8';
      targetCtx.beginPath();
      targetCtx.arc(7.5, -7, 5, 0, Math.PI * 2);
      targetCtx.fill();

      // Mid Vibrant Cyan Iris
      targetCtx.fillStyle = '#06b6d4';
      targetCtx.beginPath();
      targetCtx.arc(7.5, -7, 3.4, 0, Math.PI * 2);
      targetCtx.fill();

      // Deep Infinite Azure Center
      targetCtx.fillStyle = '#0284c7';
      targetCtx.beginPath();
      targetCtx.arc(7.5, -7, 1.8, 0, Math.PI * 2);
      targetCtx.fill();

      // Brilliant Star Diamond Glints
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(9, -8.8, 1.6, 0, Math.PI * 2);
      targetCtx.arc(6, -5.5, 0.9, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.restore();
    } else if(opt.skinId === 'goku_ssj') {
      // Super Saiyan Piercing Teal Eye
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(6, -7, 6, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#06b6d4';
      targetCtx.beginPath();
      targetCtx.arc(8, -7, 3.2, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#0f172a';
      targetCtx.beginPath();
      targetCtx.arc(8, -7, 1.6, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(9, -8, 1, 0, Math.PI * 2);
      targetCtx.fill();
    } else if(opt.skinId === 'naruto_bird') {
      // Naruto Sage Mode Orange Surround & Slit Eye
      targetCtx.fillStyle = '#ea580c';
      targetCtx.beginPath();
      targetCtx.ellipse(6, -7, 7, 5, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#fef08a';
      targetCtx.beginPath();
      targetCtx.arc(6, -7, 4.5, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#78350f';
      targetCtx.fillRect(4, -7.7, 5, 1.4);
    } else if(opt.skinId === 'tanjiro_bird') {
      // Tanjiro Deep Burgundy Slayer Eye
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(6, -7, 6, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#991b1b';
      targetCtx.beginPath();
      targetCtx.arc(8, -7, 3, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#0f172a';
      targetCtx.beginPath();
      targetCtx.arc(8, -7, 1.5, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(9, -8, 1, 0, Math.PI * 2);
      targetCtx.fill();
    } else {
      // Super Cute Chibi Anime Boba Eye with Triple Gloss Sparkle
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(6, -7, 6.8, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = 'rgba(15, 23, 42, 0.4)';
      targetCtx.lineWidth = 1.2;
      targetCtx.stroke();

      const irisGrad = targetCtx.createLinearGradient(6, -12, 6, -1);
      irisGrad.addColorStop(0, '#0f172a');
      irisGrad.addColorStop(0.7, '#1e293b');
      irisGrad.addColorStop(1, '#0284c7');
      targetCtx.fillStyle = irisGrad;
      targetCtx.beginPath();
      targetCtx.arc(7.2, -6.8, 4.6, 0, Math.PI * 2);
      targetCtx.fill();

      // Triple Gloss Sparkle Highlights (Anime Style)
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(9.2, -8.6, 1.8, 0, Math.PI * 2);
      targetCtx.arc(5.8, -5.2, 1.0, 0, Math.PI * 2);
      targetCtx.arc(9.0, -4.6, 0.6, 0, Math.PI * 2);
      targetCtx.fill();
    }

    // 10. Hat (On top of head)
    drawHatTo(targetCtx, hatId);

    targetCtx.restore();
  }

  // Render Perisai Bunga Teratai Sakura (Sakura Lotus Blossom Shield) - Khusus Momo & Hana
  function drawSakuraLotusShield(targetCtx, sR) {
    targetCtx.save();
    const now = performance.now();
    const pulse = Math.sin(now / 110) * 1.6;
    const radius = sR + pulse + 2;

    // 1. Soft Pink & Rose Radiant Ambient Glowing Halo
    targetCtx.shadowColor = '#f472b6';
    targetCtx.shadowBlur = 18;
    targetCtx.fillStyle = 'rgba(244, 114, 182, 0.22)';
    targetCtx.beginPath();
    targetCtx.arc(2, 0, radius, 0, Math.PI * 2);
    targetCtx.fill();

    // 2. Rotating 8-Petal Sakura Lotus Blossom Contour
    targetCtx.save();
    targetCtx.translate(2, 0);
    targetCtx.rotate(now / 400);
    targetCtx.strokeStyle = '#f472b6';
    targetCtx.lineWidth = 2.4;
    targetCtx.fillStyle = 'rgba(253, 226, 236, 0.38)';
    targetCtx.beginPath();
    for(let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const petLen = radius * 1.12;
      const petW = radius * 0.44;
      const cpx = Math.cos(a) * petLen;
      const cpy = Math.sin(a) * petLen;
      const leftA = a - Math.PI / 8;
      const rightA = a + Math.PI / 8;
      const lx = Math.cos(leftA) * (radius * 0.68);
      const ly = Math.sin(leftA) * (radius * 0.68);
      const rx = Math.cos(rightA) * (radius * 0.68);
      const ry = Math.sin(rightA) * (radius * 0.68);
      if(i === 0) targetCtx.moveTo(lx, ly);
      targetCtx.quadraticCurveTo(cpx - Math.sin(a) * petW, cpy + Math.cos(a) * petW, cpx, cpy);
      targetCtx.quadraticCurveTo(cpx + Math.sin(a) * petW, cpy - Math.cos(a) * petW, rx, ry);
    }
    targetCtx.closePath();
    targetCtx.fill();
    targetCtx.stroke();

    // Inner Sakura Blossom Star
    targetCtx.strokeStyle = '#f43f5e';
    targetCtx.lineWidth = 1.4;
    targetCtx.beginPath();
    for(let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const px = Math.cos(a) * (radius * 0.48);
      const py = Math.sin(a) * (radius * 0.48);
      if(i === 0) targetCtx.moveTo(px, py); else targetCtx.lineTo(px, py);
    }
    targetCtx.closePath();
    targetCtx.stroke();
    targetCtx.restore();

    // 3. Floating Fluttering Sakura Petals Orbiting around Shield
    for(let i = 0; i < 4; i++) {
      const oa = now / 220 + (i * Math.PI * 2) / 4;
      const ox = 2 + Math.cos(oa) * (radius + 5);
      const oy = Math.sin(oa) * (radius + 5);
      targetCtx.save();
      targetCtx.translate(ox, oy);
      targetCtx.rotate(oa + Math.PI / 4);
      targetCtx.fillStyle = '#fb7185';
      targetCtx.beginPath();
      targetCtx.ellipse(0, 0, 5, 2.5, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(-1, -0.5, 1, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.restore();
    }

    targetCtx.restore();
  }

  function drawClassicHexShield(targetCtx, sR) {
    targetCtx.save();
    targetCtx.strokeStyle = '#38bdf8';
    targetCtx.lineWidth = 2.4;
    targetCtx.shadowColor = '#38bdf8';
    targetCtx.shadowBlur = 10;
    targetCtx.beginPath();
    targetCtx.arc(2, 0, sR, 0, Math.PI * 2);
    targetCtx.stroke();

    targetCtx.fillStyle = 'rgba(56, 189, 248, 0.22)';
    targetCtx.fill();

    // Rotating Hexagon Lattice
    targetCtx.save();
    targetCtx.rotate(performance.now() / 350);
    targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    targetCtx.lineWidth = 1.2;
    targetCtx.beginPath();
    for(let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const hx = Math.cos(a) * (sR * 0.85);
      const hy = Math.sin(a) * (sR * 0.85);
      if(i === 0) targetCtx.moveTo(hx, hy); else targetCtx.lineTo(hx, hy);
    }
    targetCtx.closePath();
    targetCtx.stroke();
    targetCtx.restore();

    // Orbiting Energy Nodes
    for(let i = 0; i < 3; i++) {
      const oa = performance.now() / 180 + (i * Math.PI * 2) / 3;
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(2 + Math.cos(oa) * sR, Math.sin(oa) * sR, 2.5, 0, Math.PI * 2);
      targetCtx.fill();
    }
    targetCtx.restore();
  }

  // Draw Game Bird with Power-Up Overlays
  window.renderCustomBird = renderCustomBird;

  window.drawCustomShieldFX = function(targetCtx, x, y, angle, isSakura = false, alpha = 0.68) {
    targetCtx.save();
    targetCtx.translate(x, y);
    targetCtx.rotate(angle || 0);
    targetCtx.globalAlpha = alpha;
    const pulse = Math.sin(performance.now() / 110) * 1.8;
    const sR = 25 + pulse;

    if(isSakura) {
      drawSakuraLotusShield(targetCtx, sR);
    } else {
      drawClassicHexShield(targetCtx, sR);
    }
    targetCtx.restore();
  };

  window.drawCustomBabyBird = function(targetCtx, b, alpha = 0.68) {
    targetCtx.save();
    targetCtx.globalAlpha = alpha;
    drawBabyBird(b, targetCtx);
    targetCtx.restore();
  };

  function drawBird() {
    const skinId = progress.selected || 'classic';
    const hatId = progress.selectedHat || 'none';
    const outfitId = progress.selectedOutfit || 'none';

    let opacity = 1;
    if(graceTimer > 0 && Math.sin(performance.now() / 25) > 0) {
      opacity = 0.4;
    }

    renderCustomBird(ctx, {
      x: bird.x, y: bird.y, angle: bird.angle, wing: bird.wing,
      skinId, hatId, outfitId, opacity,
      isDead: !!bird.dead,
      isPlayer: true
    });

    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.angle);

    // 1. Shield: Custom Sakura Lotus Shield (Momo & Hana) vs Classic Cyan Hexagonal Shield
    if(activePowerups.shield) {
      const pulse = Math.sin(performance.now() / 110) * 1.8;
      const sR = 25 + pulse;
      const isSakura = activePowerups.shieldType === 'sakura' || progress.selectedPet === 'momo_hana';

      if(isSakura) {
        drawSakuraLotusShield(ctx, sR);
      } else {
        drawClassicHexShield(ctx, sR);
      }
    }

      // 2. Magnet Pulsing Magnetic Flux Waves
      if(activePowerups.magnet > 0) {
        ctx.save();
        const mPhase = (performance.now() / 180) % 1;
        for(let i = 0; i < 3; i++) {
          const mr = 20 + ((mPhase + i / 3) % 1) * 35;
          const mAlpha = 1 - ((mPhase + i / 3) % 1);
          ctx.strokeStyle = i % 2 === 0 ? `rgba(244, 63, 94, ${mAlpha * 0.75})` : `rgba(56, 189, 248, ${mAlpha * 0.75})`;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(2, 0, mr, -Math.PI * 0.7, Math.PI * 0.7);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 3. Slow Time Frost Crystals & Swirling Snowflake Aura
      if(activePowerups.slow > 0) {
        ctx.save();
        for(let i = 0; i < 4; i++) {
          const sAngle = performance.now() / 250 + (i * Math.PI * 2) / 4;
          const sx = 2 + Math.cos(sAngle) * 28;
          const sy = Math.sin(sAngle) * 28;
          ctx.shadowColor = '#67e8f9';
          ctx.shadowBlur = 6;
          drawCanvasIceCrystal(ctx, sx, sy, 4.5);
        }
        ctx.restore();
      }

      // 4. Invincible Star Sparkle & Rainbow Halo
      if(activePowerups.star > 0) {
        ctx.save();
        const hue = (performance.now() * 0.6) % 360;
        ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
        ctx.lineWidth = 3.2;
        ctx.shadowColor = `hsl(${hue}, 100%, 65%)`;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(2, 0, 26, 0, Math.PI * 2);
        ctx.stroke();

        for(let i = 0; i < 4; i++) {
          const starAngle = performance.now() / 200 + (i * Math.PI * 2) / 4;
          const sx = 2 + Math.cos(starAngle) * 32;
          const sy = Math.sin(starAngle) * 32;
          ctx.fillStyle = '#fef08a';
          drawCanvasSparkle(ctx, sx, sy, 4.5);
        }
        ctx.restore();
      }

      // 5. NOS Rocket Mounted Thrusters & Roaring Jet Flames
      if(activePowerups.rocket > 0) {
        ctx.save();
        const flameStretch = 18 + Math.sin(performance.now() / 45) * 8;
        
        // Twin Rocket Barrels (Top & Bottom Flanks)
        [-11, 9].forEach(ry => {
          // Metal Cylinder Barrel
          ctx.fillStyle = '#94a3b8';
          rrTo(ctx, -22, ry - 3.5, 18, 7, 2);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(-20, ry - 2.5, 14, 2);
          // Chrome Nozzle Ring
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-24, ry - 4, 3, 8);

          // Roaring 4-Layer Jet Flame firing backward
          // Layer 1: Crimson Outer Flame
          ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
          ctx.beginPath();
          ctx.moveTo(-24, ry - 4);
          ctx.lineTo(-24 - flameStretch, ry);
          ctx.lineTo(-24, ry + 4);
          ctx.closePath();
          ctx.fill();

          // Layer 2: Blazing Orange
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.moveTo(-24, ry - 2.8);
          ctx.lineTo(-24 - flameStretch * 0.75, ry);
          ctx.lineTo(-24, ry + 2.8);
          ctx.closePath();
          ctx.fill();

          // Layer 3: Brilliant Yellow Core
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.moveTo(-24, ry - 1.8);
          ctx.lineTo(-24 - flameStretch * 0.5, ry);
          ctx.lineTo(-24, ry + 1.8);
          ctx.closePath();
          ctx.fill();

          // Layer 4: White-Hot Ignition Tip
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-24, ry, 1.8, 0, Math.PI * 2);
          ctx.fill();
        });

        // Supersonic Mach Shock Cone at Beak
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(18, -14);
        ctx.lineTo(30, 3);
        ctx.lineTo(18, 20);
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore();
    }

  let mpBattleResultShown = false;

  function showMpBattleResult(isWinner, myFinalScore, rivalFinalScore, rivalProfile) {
    if(mpBattleResultShown) return;
    mpBattleResultShown = true;

    if(state !== State.OVER) {
      state = State.OVER;
      bird.dead = true;
      audio.stopMusic();
      stopBackgroundMusic();
    }

    const rival = rivalProfile || (window.multiplayerEngine?.opponents?.values()?.next()?.value) || { name: 'Rival', avatar: 'robo_mecha', score: 0 };
    const myScore = myFinalScore !== undefined ? myFinalScore : score;
    const rivalScore = rivalFinalScore !== undefined ? rivalFinalScore : (rival.score || 0);

    // Left (Player)
    const mySafeName = typeof window.sanitizePlayerName === 'function' ? window.sanitizePlayerName(gpProfile.gamerTag || 'YOU') : (gpProfile.gamerTag || 'YOU');
    if(el.mpOverMyName) el.mpOverMyName.textContent = mySafeName;
    if(el.mpOverMyAvatar) el.mpOverMyAvatar.innerHTML = getCuteAvatarSvg(gpProfile.avatar, 38);
    if(el.mpOverMyScore) el.mpOverMyScore.textContent = myScore;

    // Right (Rival)
    const rivalSafeName = typeof window.sanitizePlayerName === 'function' ? window.sanitizePlayerName(rival.name || 'Rival') : (rival.name || 'Rival');
    if(el.mpOverRivalName) el.mpOverRivalName.textContent = rivalSafeName;
    if(el.mpOverRivalAvatar) el.mpOverRivalAvatar.innerHTML = getCuteAvatarSvg(rival.avatar, 38);
    if(el.mpOverRivalScore) el.mpOverRivalScore.textContent = rivalScore;

    if(isWinner) {
      if(el.mpOverBadge) {
        el.mpOverBadge.className = 'mp-over-badge victory';
        el.mpOverBadge.textContent = 'VICTORY';
      }
      if(el.mpOverSub) el.mpOverSub.textContent = 'Kamu berhasil memenangkan duel 1v1!';
      if(el.mpOverMyCrown) el.mpOverMyCrown.classList.remove('hidden');
      if(el.mpOverRivalCrown) el.mpOverRivalCrown.classList.add('hidden');
      if(el.mpOverMyReward) el.mpOverMyReward.textContent = '+50 COINS';
      if(el.mpOverRivalStatus) el.mpOverRivalStatus.textContent = 'FALLEN';

      // Reward player
      progress.coins = (progress.coins || 0) + 50;
      progress.mpWins = (progress.mpWins || 0) + 1;
      storage.set('skyFlappyMpWins', progress.mpWins);
      gpProfile.mpWins = progress.mpWins;
      persistProgress();
      saveGPProfile();
      syncGPProfileUI();
      updateCoins();
      if(typeof saveCloudSave === 'function') saveCloudSave();
      audio.stopMusic();
      stopBackgroundMusic();
      if(settings.sound) {
        // Melodi kemenangan lembut yang harmonis & nyaman di telinga (pure gentle sine waves)
        audio.playTone(523.25, 0.14, 'sine', 0.038, 0); // C5
        setTimeout(() => audio.playTone(659.25, 0.14, 'sine', 0.038, 0), 120); // E5
        setTimeout(() => audio.playTone(783.99, 0.16, 'sine', 0.040, 0), 240); // G5
        setTimeout(() => audio.playTone(1046.50, 0.32, 'sine', 0.042, 0), 360); // C6
      }
    } else {
      if(el.mpOverBadge) {
        el.mpOverBadge.className = 'mp-over-badge defeat';
        el.mpOverBadge.textContent = 'DEFEAT';
      }
      if(el.mpOverSub) el.mpOverSub.textContent = 'Kamu terjatuh lebih dulu dari lawan!';
      if(el.mpOverMyCrown) el.mpOverMyCrown.classList.add('hidden');
      if(el.mpOverRivalCrown) el.mpOverRivalCrown.classList.remove('hidden');
      if(el.mpOverMyReward) el.mpOverMyReward.textContent = '+10 COINS';
      if(el.mpOverRivalStatus) el.mpOverRivalStatus.textContent = 'WINNER';

      progress.coins = (progress.coins || 0) + 10;
      updateCoins();
      audio.stopMusic();
      stopBackgroundMusic();
      if(settings.sound) {
        // Nada kekalahan lembut yang tenang & tidak menyengat telinga (pure gentle sine waves)
        audio.playTone(392.00, 0.14, 'sine', 0.032, 0); // G4
        setTimeout(() => audio.playTone(349.23, 0.16, 'sine', 0.032, 0), 130); // F4
        setTimeout(() => audio.playTone(311.13, 0.18, 'sine', 0.032, 0), 270); // Eb4
        setTimeout(() => audio.playTone(261.63, 0.30, 'sine', 0.032, 0), 420); // C4
      }
    }

    showModal(el.mpOverModal);
  }

  function showOver() {
    if(currentMode === 'multiplayer') {
      const mp = window.multiplayerEngine;
      const rivalProfile = mp?.currentRoom?.playersList?.find(p => p.id !== mp?.localPlayerId);
      const rival = mp?.opponents?.values()?.next()?.value || rivalProfile || { name: 'Rival', avatar: 'robo_mecha', score: 0, isAlive: true };
      
      // Broadcast death to opponent
      if (mp) mp.broadcastMyDeath(score);

      const isWinner = rival && rival.isAlive === false && score >= (rival.score || 0);
      showMpBattleResult(isWinner, score, rival?.score || 0, rival);
      return;
    }


    // showModal handles all display logic - no need for .visible class
    el.finalScore.textContent = score;
    el.finalBest.textContent = best;
    const nb = score >= best && score > 0;
    el.newBest.classList.toggle('hidden', !nb);

    if(currentMode === 'ranked') {
      const tier = getRankTier(rankedBest);
      if(el.overRankCard) {
        el.overRankCard.classList.remove('hidden');
        if(el.overRankIcon) el.overRankIcon.innerHTML = tier.iconSvg;
        if(el.overRankTitle) {
          el.overRankTitle.textContent = tier.name + ' TIER';
          el.overRankTitle.style.color = tier.color;
        }
        if(el.overRankDesc) {
          if(tier.nextTier) {
            el.overRankDesc.textContent = `${tier.pointsToNext} Poin lagi ke ${tier.nextTier.name} (${tier.score}/${tier.nextTier.minScore} pts)`;
          } else {
            el.overRankDesc.textContent = `MAX SUPREME TIER! (${tier.score} pts)`;
          }
        }
        if(el.overRankFill) {
          el.overRankFill.style.width = `${tier.progressPercent}%`;
        }
      }
    } else {
      if(el.overRankCard) el.overRankCard.classList.add('hidden');
    }

    showModal(el.over);
  }
  function pause() {
    if(state === State.PLAYING || state === State.READY) {
      state = State.PAUSED;
      audio.stopMusic();
      stopBackgroundMusic();
      showModal(el.paused);
    }
  }
  function resume() {
    closeModal();
    state = started ? State.PLAYING : State.READY;
    if(started) {
      audio.music();
      playBackgroundMusic();
    }
  }
  function home() {
    closeModal();
    reset();
    setState(State.MENU);
    if(settings.music) {
      audio.music();
      playBackgroundMusic();
    }
  }

  // Helper pengikat event aman (tidak akan crash bila elemen null/missing)
  const bindClick = (target, handler) => {
    const elTarget = typeof target === 'string' ? $(target) : target;
    if(elTarget) elTarget.onclick = handler;
  };

  // MLBB Mode Selection Slide-Up Drawer Controller
  function openModeDrawer() {
    const drawer = $('mlbbModeDrawer');
    if(!drawer) return;
    audio.click();
    drawer.classList.remove('hidden');

    const statClassic = $('mlbbClassicBestStat');
    if(statClassic) statClassic.textContent = progress.highScore || 0;
    const statRanked = $('mlbbRankedPtsStat');
    if(statRanked) statRanked.textContent = `${gpProfile.rankedBest || progress.rankedScore || 0} PTS`;
  }

  function closeModeDrawer() {
    const drawer = $('mlbbModeDrawer');
    if(!drawer) return;
    drawer.classList.add('hidden');
  }

  // Open drawer on click or drag up
  bindClick('mlbbCycleModeBtn', () => {
    openModeDrawer();
  });

  bindClick('mlbbDrawerCloseBtn', () => {
    audio.click();
    closeModeDrawer();
  });

  bindClick('mlbbDrawerBackdrop', () => {
    closeModeDrawer();
  });

  // Select card handlers
  ['classic', 'ranked', 'multiplayer'].forEach(m => {
    const card = $(m === 'classic' ? 'cardModeClassic' : (m === 'ranked' ? 'cardModeRanked' : 'cardModeMultiplayer'));
    if(card) {
      card.addEventListener('click', () => {
        setMode(m);
        setTimeout(closeModeDrawer, 180);
      });
    }
  });

  // Touch drag up from mode button to open drawer
  let touchStartY = 0;
  const modeBtn = $('mlbbCycleModeBtn');
  if(modeBtn) {
    modeBtn.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    modeBtn.addEventListener('touchend', (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      if(touchStartY - touchEndY > 20) { // Swiped up by 20px
        openModeDrawer();
      }
    }, { passive: true });
  }

  // Touch drag down on drawer header to close
  const drawerHandle = $('mlbbDrawerHandleBar');
  if(drawerHandle) {
    let handleStartY = 0;
    drawerHandle.addEventListener('touchstart', (e) => {
      handleStartY = e.touches[0].clientY;
    }, { passive: true });

    drawerHandle.addEventListener('touchend', (e) => {
      const handleEndY = e.changedTouches[0].clientY;
      if(handleEndY - handleStartY > 25) { // Swiped down
        audio.click();
        closeModeDrawer();
      }
    }, { passive: true });
  }

  bindClick('topAddCoinBtn', () => {
    audio.click();
    showLobbyAdmobRewardModal();
  });

  bindClick('mlbbEventCard', () => {
    openGachaModal();
  });

  const birdQuotes = [
    "Ayo kepakkan sayap dan taklukkan langit!",
    "Siap menembus rekor terbaik hari ini?",
    "Ajak teman mabar 1v1 sekarang!",
    "Gunakan skill Dash saat rintangan sempit!",
    "Beli skin dan pet imut di Toko Shop!"
  ];

  let speechBubbleTimer = null;
  let speechBubbleVisible = false;

  function cycleSpeechBubble() {
    const speechEl = $('mlbbHeroSpeech');
    if(!speechEl) return;

    if(speechBubbleVisible) {
      speechEl.classList.remove('active');
      speechBubbleVisible = false;
      clearTimeout(speechBubbleTimer);
      speechBubbleTimer = setTimeout(cycleSpeechBubble, 6500 + Math.random() * 3500);
    } else {
      if(state === State.MENU) {
        const q = birdQuotes[Math.floor(Math.random() * birdQuotes.length)];
        speechEl.textContent = `"${q}"`;
        speechEl.classList.add('active');
        speechBubbleVisible = true;
        clearTimeout(speechBubbleTimer);
        speechBubbleTimer = setTimeout(cycleSpeechBubble, 4500);
      } else {
        speechEl.classList.remove('active');
        speechBubbleVisible = false;
      }
    }
  }

  bindClick('mlbbHeroSpeech', () => {
    audio.click();
    const speechEl = $('mlbbHeroSpeech');
    if(speechEl) {
      const q = birdQuotes[Math.floor(Math.random() * birdQuotes.length)];
      speechEl.textContent = `"${q}"`;
      speechEl.classList.add('active');
      speechBubbleVisible = true;
      clearTimeout(speechBubbleTimer);
      speechBubbleTimer = setTimeout(cycleSpeechBubble, 4500);
    }
  });

  setTimeout(cycleSpeechBubble, 2000);

  bindClick(el.menuRankedCard, () => {
    audio.click();
    renderTierRoadmap();
    showModal(el.tierRoadmapModal);
  });
  if(el.menuRankedCard) {
    el.menuRankedCard.addEventListener('keydown', e => {
      if(e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        audio.click();
        renderTierRoadmap();
        showModal(el.tierRoadmapModal);
      }
    });
  }
  bindClick('playBtn', () => {
    if(currentMode === 'multiplayer') {
      audio.click();
      showModal(el.multiplayerModal);
      switchMpTab('quick');
      return;
    }
    if(currentMode === 'ranked' && !gpProfile.isLoggedIn) {
      audio.click();
      showModal(el.googlePlayModal);
      return;
    }
    goReady();
  });
  bindClick('rankedLeaderboardBtn', () => {
    audio.click();
    showModal(el.rankedModal);
    try {
      updateRankedLeaderboardUI();
      renderLeaderboardList();
      switchLeaderboardTab('global');
    } catch(err) {
      console.warn('[Leaderboard UI Render Warning]:', err);
    }
  });
  bindClick(el.lbTabGlobalBtn, () => {
    audio.click();
    switchLeaderboardTab('global');
  });
  bindClick(el.lbTabTiersBtn, () => {
    audio.click();
    switchLeaderboardTab('tiers');
  });
  bindClick(el.topProfileBtn, () => {
    audio.click();
    syncGPProfileUI();
    if(el.gpGamerTagInput) {
      el.gpGamerTagInput.value = gpProfile.gamerTag || 'SkyPlayer';
    }
    switchProfileTab('overview');
    showModal(el.googlePlayModal);
  });
  bindClick('playRankedFromModalBtn', () => {
    audio.click();
    closeModal();
    setMode('ranked');
    if(!gpProfile.isLoggedIn) {
      showModal(el.googlePlayModal);
      return;
    }
    goReady();
  });

  // Google Play / Google Sign-In Modal Actions
  function openAvatarPicker() {
    audio.click();
    renderAvatarPickerGrid();
    showModal(el.avatarPickerModal);
  }

  bindClick(el.gpChangeAvatarBtn, openAvatarPicker);
  bindClick(el.gpAvatarWrap, openAvatarPicker);

  // Profile Modal Tab Switching (Ringkasan, Statistik, Akun & Login)
  function switchProfileTab(tabName) {
    const tabs = {
      overview: { btn: $('profileTabOverviewBtn'), panel: $('profileTabOverview') },
      stats: { btn: $('profileTabStatsBtn'), panel: $('profileTabStats') },
      account: { btn: $('profileTabAccountBtn'), panel: $('profileTabAccount') }
    };
    Object.keys(tabs).forEach(k => {
      const t = tabs[k];
      if (t.btn) t.btn.classList.toggle('active', k === tabName);
      if (t.panel) {
        t.panel.classList.toggle('hidden', k !== tabName);
        t.panel.classList.toggle('active', k === tabName);
      }
    });
    if(tabName === 'stats' || tabName === 'overview') {
      syncGPProfileUI();
    }
  }
  bindClick('profileTabOverviewBtn', () => { audio.click(); switchProfileTab('overview'); });
  bindClick('profileTabStatsBtn', () => { audio.click(); switchProfileTab('stats'); });
  bindClick('profileTabAccountBtn', () => { audio.click(); switchProfileTab('account'); });

  // =========================================================
  // CUSTOM IN-GAME NOTIFICATION & CONFIRMATION DIALOG (PRO)
  // =========================================================
  let activeDialogResolver = null;
  function showGameDialog({
    title = 'PEMBERITAHUAN',
    html = '',
    type = 'info', // 'coin', 'warning', 'danger', 'success', 'info'
    confirmText = 'MENGERTI',
    cancelText = null
  } = {}) {
    return new Promise((resolve) => {
      activeDialogResolver = resolve;
      if (!el.gameDialogModal) {
        resolve(true);
        return;
      }

      let iconSvg = '';
      if (type === 'coin') {
        iconSvg = `<svg viewBox="0 0 24 24" width="30" height="30"><circle cx="12" cy="12" r="10" fill="#f59e0b" stroke="#fde047" stroke-width="2"/><circle cx="12" cy="12" r="7" fill="#fbbf24"/><text x="12" y="16" font-size="11" font-weight="900" text-anchor="middle" fill="#78350f" font-family="Arial">G</text></svg>`;
      } else if (type === 'danger') {
        iconSvg = `<svg viewBox="0 0 24 24" width="30" height="30"><circle cx="12" cy="12" r="10" fill="#ef4444" stroke="#f87171" stroke-width="2"/><path d="M12 7v6M12 17v.01" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`;
      } else if (type === 'warning') {
        iconSvg = `<svg viewBox="0 0 24 24" width="30" height="30"><path d="M12 2L1 21h22L12 2zm0 3.8L20.2 19H3.8L12 5.8zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" fill="#f59e0b"/></svg>`;
      } else if (type === 'success') {
        iconSvg = `<svg viewBox="0 0 24 24" width="30" height="30"><circle cx="12" cy="12" r="10" fill="#15803d" stroke="#4ade80" stroke-width="2"/><path d="M7 12.5l3.5 3.5 6.5-6.5" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      } else {
        iconSvg = `<svg viewBox="0 0 24 24" width="30" height="30"><circle cx="12" cy="12" r="10" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/><path d="M12 8v.01M12 11v5" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`;
      }

      if (el.dialogIconWrap) {
        el.dialogIconWrap.className = `dialog-icon-wrap ${type}`;
        el.dialogIconWrap.innerHTML = iconSvg;
      }
      if (el.dialogTitle) {
        el.dialogTitle.className = `dialog-title ${type}`;
        el.dialogTitle.textContent = title;
      }
      if (el.dialogBody) {
        el.dialogBody.innerHTML = html;
      }
      if (el.dialogConfirmBtn) {
        el.dialogConfirmBtn.textContent = confirmText;
      }
      if (el.dialogCancelBtn) {
        if (cancelText) {
          el.dialogCancelBtn.textContent = cancelText;
          el.dialogCancelBtn.classList.remove('hidden');
        } else {
          el.dialogCancelBtn.classList.add('hidden');
        }
      }

      if (type === 'success') audio.win();
      else if (type === 'warning' || type === 'coin' || type === 'danger') audio.hit();
      else audio.click();

      showModal(el.gameDialogModal);
    });
  }
  window.showGameDialog = showGameDialog;

  bindClick(el.dialogConfirmBtn, () => {
    audio.click();
    closeModal();
    if (activeDialogResolver) {
      const res = activeDialogResolver;
      activeDialogResolver = null;
      res(true);
    }
  });

  bindClick(el.dialogCancelBtn, () => {
    audio.click();
    closeModal();
    if (activeDialogResolver) {
      const res = activeDialogResolver;
      activeDialogResolver = null;
      res(false);
    }
  });

  function handleAuthError(err, providerName) {
    if(!err) return;
    console.warn(`[${providerName} Sign-In notice]:`, err.code, err.message);
    if(err.code === 'auth/unauthorized-domain') {
      const currentDomain = window.location.hostname || '127.0.0.1';
      showGameDialog({
        title: 'Domain Belum Diizinkan',
        html: `<p>Domain <b>"${currentDomain}"</b> belum terdaftar di Authorized Domains Firebase.</p><div class="dialog-info-card"><div class="dialog-info-row"><span>Solusi:</span><b>Tambah Domain di Console</b></div></div><p style="font-size:11px;color:#94a3b8;">Tips: Anda juga bisa klik <b>MASUK SEBAGAI TAMU</b> untuk langsung bermain sekarang!</p>`,
        type: 'warning'
      });
    } else if(err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
      showGameDialog({
        title: 'Metode Login Belum Aktif',
        html: `<p>Login ${providerName} belum diaktifkan di Firebase Console.</p><p style="font-size:11px;color:#94a3b8;margin-top:6px;">Tips: Anda juga bisa klik <b>MASUK SEBAGAI TAMU</b> untuk langsung bermain sekarang!</p>`,
        type: 'warning'
      });
    } else if(err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
      showGameDialog({
        title: 'Gagal Terhubung',
        html: `<p>${err.message || `Gagal terhubung ke akun ${providerName}. Pastikan koneksi internet aktif.`}</p>`,
        type: 'warning'
      });
    }
  }

  let unsubscribeUserProfileListener = null;

  function buildCloudPayload() {
    const tierObj = typeof getRankTier === 'function' ? getRankTier(rankedBest) : { name: 'BRONZE I' };
    return {
      primaryKey: gpProfile.primaryKey || ('acc_' + (gpProfile.googleUid || 'guest')),
      uid: gpProfile.googleUid || '',
      email: gpProfile.email || '',
      gamerTag: gpProfile.gamerTag || 'SkyPlayer',
      name: gpProfile.gamerTag || 'SkyPlayer',
      avatar: gpProfile.avatar || 'chick_yellow',
      tier: tierObj.name || 'BRONZE I',
      nameChangesDone: gpProfile.nameChangesDone || 0,
      rankedBest: rankedBest || 0,
      classicBest: classicBest || 0,
      score: rankedBest || 0,
      mpWins: progress.mpWins || 0,
      coins: progress.coins || 0,
      coinsUpdatedAt: progress.coinsUpdatedAt || Date.now(),
      loadout: {
        bird: progress.selected || 'classic',
        pet: progress.selectedPet || 'pip_peep',
        aura: progress.selectedAura || 'default',
        hat: progress.selectedHat || 'none',
        outfit: progress.selectedOutfit || 'none',
        pipe: progress.selectedPipe || 'green',
        background: progress.selectedBackground || 'sky',
        music: progress.selectedMusic || 'happy',
        booster: progress.selectedBooster || 'none'
      },
      unlocked: {
        bird: progress.unlocked || ['classic'],
        pet: progress.petUnlocked || ['pip_peep'],
        aura: progress.auraUnlocked || ['default'],
        hat: progress.hatUnlocked || ['none'],
        outfit: progress.outfitUnlocked || ['none'],
        pipe: progress.pipeUnlocked || ['green'],
        background: progress.backgroundUnlocked || ['sky'],
        music: progress.musicUnlocked || ['happy'],
        booster: progress.boosterUnlocked || ['none']
      },
      updatedAt: new Date().toISOString()
    };
  }

  async function saveCloudSave() {
    if(!gpProfile.isLoggedIn || !gpProfile.primaryKey || !gpProfile.googleUid) return;
    if(window.FirebaseLeaderboard && typeof window.FirebaseLeaderboard.saveUserProfile === 'function') {
      try {
        const payload = buildCloudPayload();
        await window.FirebaseLeaderboard.saveUserProfile(gpProfile.primaryKey, payload);
        console.log('[CloudSync] Profil, Rank, Pet & Skin disinkronkan ke cloud:', gpProfile.primaryKey);
      } catch(err) {
        console.warn('[CloudSync] Gagal menyimpan ke cloud:', err.message);
      }
    }
  }

  let isApplyingCloudSync = false;

  function applyCloudProfile(cloudProfile) {
    if(!cloudProfile) return;
    isApplyingCloudSync = true;
    try {
      if(cloudProfile.gamerTag) gpProfile.gamerTag = cloudProfile.gamerTag;
      if(cloudProfile.avatar) gpProfile.avatar = cloudProfile.avatar;
      if(typeof cloudProfile.nameChangesDone === 'number') gpProfile.nameChangesDone = cloudProfile.nameChangesDone;
      
      // 1. Sync Rank / Scores / MP Wins
      if(typeof cloudProfile.rankedBest === 'number' && cloudProfile.rankedBest > rankedBest) {
        rankedBest = cloudProfile.rankedBest;
        storage.set('skyFlappyRankedBest', rankedBest);
        progress.rankedScore = rankedBest;
        gpProfile.rankedBest = rankedBest;
      }
      if(typeof cloudProfile.classicBest === 'number' && cloudProfile.classicBest > classicBest) {
        classicBest = cloudProfile.classicBest;
        storage.set('skyFlappyClassicBest', classicBest);
        storage.set('skyFlappyBest', classicBest);
        progress.highScore = classicBest;
        gpProfile.classicBest = classicBest;
      }
      if(typeof cloudProfile.mpWins === 'number' && cloudProfile.mpWins > (progress.mpWins || 0)) {
        progress.mpWins = cloudProfile.mpWins;
        storage.set('skyFlappyMpWins', progress.mpWins);
        gpProfile.mpWins = progress.mpWins;
      }

      // 2. Sync Coins (Smart Timestamp Comparison: Tidak akan mengembalikan koin yang baru dihabiskan)
      const cloudCoins = typeof cloudProfile.coins === 'number' ? cloudProfile.coins : null;
      if (cloudCoins !== null) {
        const cloudTime = typeof cloudProfile.coinsUpdatedAt === 'number' ? cloudProfile.coinsUpdatedAt : 0;
        const localTime = typeof progress.coinsUpdatedAt === 'number' ? progress.coinsUpdatedAt : 0;

        if (cloudTime > 0 && localTime > 0) {
          if (cloudTime >= localTime) {
            progress.coins = cloudCoins;
            progress.coinsUpdatedAt = cloudTime;
          } else {
            // Local lebih baru (misal baru saja gacha/belanja), simpan koin lokal ke cloud!
            if(typeof saveCloudSave === 'function') saveCloudSave();
          }
        } else {
          progress.coins = cloudCoins;
          progress.coinsUpdatedAt = cloudTime || Date.now();
        }
      }

      // 3. Sync Loadout (Equipped bird, pet, aura, hat, outfit, pipe, background, music, booster)
      if(cloudProfile.loadout) {
        const l = cloudProfile.loadout;
        if(l.bird && skins[l.bird]) progress.selected = l.bird;
        if(l.pet && petsCatalog[l.pet]) progress.selectedPet = l.pet;
        if(l.aura && auras[l.aura]) progress.selectedAura = l.aura;
        if(l.hat && (hats[l.hat] || l.hat === 'none')) progress.selectedHat = l.hat;
        if(l.outfit && (outfits[l.outfit] || l.outfit === 'none')) progress.selectedOutfit = l.outfit;
        if(l.pipe && pipeSkins[l.pipe]) progress.selectedPipe = l.pipe;
        if(l.background && backgrounds[l.background]) progress.selectedBackground = l.background;
        if(l.music && tracks[l.music]) progress.selectedMusic = l.music;
        if(l.booster && (boosters[l.booster] || l.booster === 'none')) progress.selectedBooster = l.booster;
      }

      // 4. Merge Unlocked Inventories
      if(cloudProfile.unlocked) {
        const u = cloudProfile.unlocked;
        const mergeArr = (currentArr, cloudArr) => Array.from(new Set([...(currentArr || []), ...(cloudArr || [])]));
        if(Array.isArray(u.bird)) progress.unlocked = mergeArr(progress.unlocked, u.bird);
        if(Array.isArray(u.pet)) progress.petUnlocked = mergeArr(progress.petUnlocked, u.pet);
        if(Array.isArray(u.aura)) progress.auraUnlocked = mergeArr(progress.auraUnlocked, u.aura);
        if(Array.isArray(u.hat)) progress.hatUnlocked = mergeArr(progress.hatUnlocked, u.hat);
        if(Array.isArray(u.outfit)) progress.outfitUnlocked = mergeArr(progress.outfitUnlocked, u.outfit);
        if(Array.isArray(u.pipe)) progress.pipeUnlocked = mergeArr(progress.pipeUnlocked, u.pipe);
        if(Array.isArray(u.background)) progress.backgroundUnlocked = mergeArr(progress.backgroundUnlocked, u.background);
        if(Array.isArray(u.music)) progress.musicUnlocked = mergeArr(progress.musicUnlocked, u.music);
        if(Array.isArray(u.booster)) progress.boosterUnlocked = mergeArr(progress.boosterUnlocked, u.booster);
      }

      if(typeof applyPetSkin === 'function') applyPetSkin();
      persistProgress();
      updateCoins();
      storage.set('skyFlappyGPProfile', gpProfile);
      syncGPProfileUI();
      if(typeof updateRankUI === 'function') updateRankUI();
      if(typeof renderShop === 'function') renderShop();
    } finally {
      isApplyingCloudSync = false;
    }
  }

  async function syncCloudProfile(user, providerName = 'google') {
    if(!user || !user.uid) return;
    const uid = user.uid;
    const primaryKey = 'acc_' + uid;

    gpProfile.isLoggedIn = true;
    gpProfile.isGoogle = true;
    gpProfile.authProvider = providerName;
    gpProfile.email = user.email || (user.displayName ? `${user.displayName} (${providerName})` : 'Akun Terhubung');
    gpProfile.googleUid = uid;
    gpProfile.primaryKey = primaryKey;
    gpProfile.id = primaryKey;

    // 1. Ambil profil akun terpusat dari Firestore Cloud menggunakan Primary Key
    let cloudProfile = null;
    if(window.FirebaseLeaderboard && typeof window.FirebaseLeaderboard.fetchUserProfile === 'function') {
      cloudProfile = await window.FirebaseLeaderboard.fetchUserProfile(primaryKey);
      if(!cloudProfile) {
        cloudProfile = await window.FirebaseLeaderboard.fetchUserProfile(uid);
      }
    }

    if(cloudProfile && cloudProfile.gamerTag) {
      console.log('[CloudSync] Profil Primary Key (Rank, Pet & Skins) dimuat dari cloud:', primaryKey, cloudProfile.gamerTag);
      applyCloudProfile(cloudProfile);
    } else {
      const accountsMap = storage.get('skyFlappyAccountsMap', {});
      const savedAcc = accountsMap[primaryKey] || accountsMap[uid] || accountsMap[user.email];
      if(savedAcc && savedAcc.gamerTag) {
        gpProfile.gamerTag = savedAcc.gamerTag;
        if(savedAcc.avatar) gpProfile.avatar = savedAcc.avatar;
        gpProfile.nameChangesDone = savedAcc.nameChangesDone || 0;
      } else if(user.displayName) {
        let tag = user.displayName.slice(0, 16);
        if(typeof window.containsToxicOrSara === 'function' && window.containsToxicOrSara(tag)) {
          tag = 'Player-' + Math.floor(100 + Math.random() * 900);
        }
        gpProfile.gamerTag = tag;
      } else if(user.email) {
        let tag = user.email.split('@')[0].slice(0, 16);
        if(typeof window.containsToxicOrSara === 'function' && window.containsToxicOrSara(tag)) {
          tag = 'Player-' + Math.floor(100 + Math.random() * 900);
        }
        gpProfile.gamerTag = tag;
      }

      if(typeof window.containsToxicOrSara === 'function' && window.containsToxicOrSara(gpProfile.gamerTag)) {
        gpProfile.gamerTag = 'Player-' + Math.floor(100 + Math.random() * 900);
      }

      // Simpan data awal ke Firestore Cloud menggunakan Primary Key
      await saveCloudSave();
      saveGPProfile();
      syncGPProfileUI();
    }

    // 2. Real-time Live Listener: Update instan tanpa reload ketika Rank, Pet, atau Skin diubah di perangkat lain!
    if(unsubscribeUserProfileListener) {
      try { unsubscribeUserProfileListener(); } catch(_) {}
      unsubscribeUserProfileListener = null;
    }
    if(window.FirebaseLeaderboard && typeof window.FirebaseLeaderboard.listenToUserProfile === 'function') {
      unsubscribeUserProfileListener = window.FirebaseLeaderboard.listenToUserProfile(primaryKey, updatedProfile => {
        if(updatedProfile) {
          console.log('[CloudSync] Live update terdeteksi dari perangkat lain:', updatedProfile);
          applyCloudProfile(updatedProfile);
        }
      });
    }

    if(window.socialService) {
      window.socialService.setAccount(primaryKey, gpProfile);
    }
  }

  async function performGoogleSignIn() {
    if(el.googleSignInBtnText) el.googleSignInBtnText.textContent = 'MENGHUBUNGKAN GOOGLE...';
    try {
      if(!window.FirebaseLeaderboard || typeof window.FirebaseLeaderboard.signInWithGoogle !== 'function') {
        throw new Error('Firebase Auth Service belum siap');
      }
      const user = await window.FirebaseLeaderboard.signInWithGoogle();
      if(user) {
        await syncCloudProfile(user, 'google');
      }
    } catch(err) {
      handleAuthError(err, 'Google');
    } finally {
      if(el.googleSignInBtnText) el.googleSignInBtnText.textContent = 'LOGIN DENGAN GOOGLE';
    }
  }

  async function performFacebookSignIn() {
    if(el.facebookSignInBtnText) el.facebookSignInBtnText.textContent = 'MENGHUBUNGKAN FACEBOOK...';
    try {
      if(!window.FirebaseLeaderboard || typeof window.FirebaseLeaderboard.signInWithFacebook !== 'function') {
        throw new Error('Firebase Auth Service belum siap');
      }
      const user = await window.FirebaseLeaderboard.signInWithFacebook();
      if(user) {
        await syncCloudProfile(user, 'facebook');
      }
    } catch(err) {
      handleAuthError(err, 'Facebook');
    } finally {
      if(el.facebookSignInBtnText) el.facebookSignInBtnText.textContent = 'LOGIN DENGAN FACEBOOK';
    }
  }

  // Auto-Sync Auth & Profile secara realtime saat game dibuka di perangkat apa pun
  if(window.FirebaseLeaderboard && typeof window.FirebaseLeaderboard.onAuthStateChanged === 'function') {
    window.FirebaseLeaderboard.onAuthStateChanged(user => {
      if(user) {
        syncCloudProfile(user, user.providerData && user.providerData[0] ? user.providerData[0].providerId : 'google');
      }
    });
  }

  bindClick(el.googleSignInBtn, () => {
    audio.click();
    performGoogleSignIn();
  });

  bindClick(el.facebookSignInBtn, () => {
    audio.click();
    performFacebookSignIn();
  });

  bindClick(el.guestSignInBtn, () => {
    audio.click();
    gpProfile.isLoggedIn = true;
    gpProfile.isGoogle = false;
    gpProfile.email = 'Mode Tamu (Lokal)';
    if(!gpProfile.gamerTag || gpProfile.gamerTag === 'SkyPlayer') {
      gpProfile.gamerTag = 'Player-' + Math.floor(100 + Math.random() * 900);
    }
    saveGPProfile();
    audio.win();
    syncGPProfileUI();
  });

  bindClick(el.gpSignOutBtn, async () => {
    audio.click();
    if(window.FirebaseLeaderboard && typeof window.FirebaseLeaderboard.signOut === 'function') {
      try { await window.FirebaseLeaderboard.signOut(); } catch(_) {}
    }
    if(gpProfile.googleUid || gpProfile.email) {
      const accKey = gpProfile.googleUid || gpProfile.email;
      const accountsMap = storage.get('skyFlappyAccountsMap', {});
      accountsMap[accKey] = {
        gamerTag: gpProfile.gamerTag,
        avatar: gpProfile.avatar,
        nameChangesDone: gpProfile.nameChangesDone || 0,
        rankedBest: rankedBest || 0,
        email: gpProfile.email,
        authProvider: gpProfile.authProvider || 'google'
      };
      storage.set('skyFlappyAccountsMap', accountsMap);
    }
    gpProfile.isLoggedIn = false;
    gpProfile.isGoogle = false;
    gpProfile.email = '';
    gpProfile.googleUid = null;
    gpProfile.primaryKey = null;
    storage.set('skyFlappyGPProfile', gpProfile);
    if(window.socialService) {
      window.socialService.clearAccount();
    }
    syncGPProfileUI();
  });

  bindClick(el.gpAuthActionBtn, async () => {
    audio.click();
    if(!gpProfile.isLoggedIn) {
      performGoogleSignIn();
      return;
    }
    const rawNewName = el.gpGamerTagInput ? el.gpGamerTagInput.value.trim() : '';
    if(!rawNewName) {
      showGameDialog({
        title: 'Nama Kosong',
        html: '<p>Nama gamer tidak boleh kosong! Silakan ketik nama baru Anda.</p>',
        type: 'warning',
        confirmText: 'MENGERTI'
      });
      return;
    }

    const oldName = gpProfile.gamerTag || 'SkyPlayer';

    // Peringatan jika nama mengandung Toxic atau SARA
    if(typeof window.containsToxicOrSara === 'function' && window.containsToxicOrSara(rawNewName)) {
      showGameDialog({
        title: 'Nama Tidak Diizinkan',
        html: '<p>Nama gamer yang Anda masukkan mengandung kata yang dilarang atau tidak pantas (<b>Toxic / SARA</b>).</p><div class="dialog-info-card"><div class="dialog-info-row"><span>Status:</span><b style="color:#f87171;">Ditolak</b></div><div class="dialog-info-row"><span>Aturan:</span><span>Gunakan nama yang sopan & ramah</span></div></div><p style="font-size:11px;color:#94a3b8;margin-top:8px;">Silakan pilih nama gamer lain yang menyenangkan untuk semua pemain!</p>',
        type: 'danger',
        confirmText: 'GANTI NAMA LAIN'
      });
      if(el.gpGamerTagInput) el.gpGamerTagInput.value = oldName;
      return;
    }

    const newName = rawNewName;
    if(newName !== oldName) {
      const changes = gpProfile.nameChangesDone || 0;
      if(changes === 0) {
        // 1x Ganti nama FREE
        gpProfile.gamerTag = newName;
        gpProfile.nameChangesDone = 1;
        saveGPProfile();
        if(typeof saveCloudSave === 'function') saveCloudSave();
        syncGPProfileUI();
        showGameDialog({
          title: 'Nama Berhasil Diubah',
          html: `<p>Nama gamer Anda berhasil diubah menjadi:</p><div class="dialog-info-card"><div class="dialog-info-row"><span>GamerTag:</span><b>${newName}</b></div><div class="dialog-info-row"><span>Biaya:</span><b style="color:#4ade80;">GRATIS (1x)</b></div></div>`,
          type: 'success',
          confirmText: 'KEREN!'
        });
      } else {
        // Ganti nama bayar 50 Koin
        const cost = 50;
        if(progress.coins < cost) {
          if(el.gpGamerTagInput) el.gpGamerTagInput.value = oldName;
          showGameDialog({
            title: 'Koin Tidak Cukup',
            html: `<p>Koin Anda tidak cukup untuk mengganti nama gamer!</p><div class="dialog-info-card"><div class="dialog-info-row"><span>Biaya Ganti Nama:</span><b>${cost} Koin</b></div><div class="dialog-info-row"><span>Saldo Anda:</span><b style="color:#f87171;">${progress.coins} Koin</b></div></div><p style="font-size:11px;color:#94a3b8;margin-top:6px;">Kumpulkan koin dengan bermain game di Mode Classic / Ranked!</p>`,
            type: 'coin',
            confirmText: 'MENGERTI'
          });
          return;
        }

        const ok = await showGameDialog({
          title: 'Konfirmasi Ganti Nama',
          html: `<p>Apakah Anda yakin ingin mengganti nama gamer menjadi <b>"${newName}"</b>?</p><div class="dialog-info-card"><div class="dialog-info-row"><span>Biaya:</span><b>${cost} Koin</b></div><div class="dialog-info-row"><span>Sisa Saldo:</span><b>${progress.coins - cost} Koin</b></div></div>`,
          type: 'coin',
          confirmText: `GANTI NAMA (-${cost} KOIN)`,
          cancelText: 'BATAL'
        });
        if(!ok) {
          showModal(el.googlePlayModal);
          return;
        }

        progress.coins -= cost;
        gpProfile.gamerTag = newName;
        gpProfile.nameChangesDone = changes + 1;
        updateCoins();
        persistProgress();
        saveGPProfile();
        if(typeof saveCloudSave === 'function') saveCloudSave();
        syncGPProfileUI();
        showGameDialog({
          title: 'Nama Berhasil Diubah',
          html: `<p>Nama gamer berhasil diubah menjadi <b>"${newName}"</b>!</p><div class="dialog-info-card"><div class="dialog-info-row"><span>Biaya:</span><b>-${cost} Koin</b></div><div class="dialog-info-row"><span>Sisa Koin:</span><b>${progress.coins} Koin</b></div></div>`,
          type: 'success',
          confirmText: 'SELESAI'
        });
      }
    } else {
      saveGPProfile();
      closeModal();
    }
  });

  // (Auth state managed seamlessly by syncCloudProfile)

  // Dedicated CONFIRM NAME CHANGE button (next to the input field)
  bindClick('gpConfirmNameBtn', async () => {
    audio.click();
    if(!gpProfile.isLoggedIn) {
      showGameDialog({
        title: 'Login Dulu',
        html: '<p>Anda harus login terlebih dahulu untuk mengganti nama gamer.</p>',
        type: 'warning',
        confirmText: 'MENGERTI'
      });
      return;
    }
    const rawNewName = el.gpGamerTagInput ? el.gpGamerTagInput.value.trim() : '';
    if(!rawNewName) {
      showGameDialog({
        title: 'Nama Kosong',
        html: '<p>Nama gamer tidak boleh kosong! Silakan ketik nama baru Anda.</p>',
        type: 'warning',
        confirmText: 'MENGERTI'
      });
      return;
    }

    const oldName = gpProfile.gamerTag || 'SkyPlayer';

    // Peringatan jika nama mengandung Toxic atau SARA
    if(typeof window.containsToxicOrSara === 'function' && window.containsToxicOrSara(rawNewName)) {
      showGameDialog({
        title: 'Nama Tidak Diizinkan',
        html: '<p>Nama gamer yang Anda masukkan mengandung kata yang dilarang atau tidak pantas (<b>Toxic / SARA</b>).</p><div class="dialog-info-card"><div class="dialog-info-row"><span>Status:</span><b style="color:#f87171;">Ditolak</b></div><div class="dialog-info-row"><span>Aturan:</span><span>Gunakan nama yang sopan & ramah</span></div></div><p style="font-size:11px;color:#94a3b8;margin-top:8px;">Silakan pilih nama gamer lain yang menyenangkan untuk semua pemain!</p>',
        type: 'danger',
        confirmText: 'GANTI NAMA LAIN'
      });
      if(el.gpGamerTagInput) el.gpGamerTagInput.value = oldName;
      return;
    }

    const newName = typeof window.sanitizePlayerName === 'function' ? window.sanitizePlayerName(rawNewName) : rawNewName;
    if(el.gpGamerTagInput) el.gpGamerTagInput.value = newName;
    if(!newName) {
      showGameDialog({
        title: 'Nama Kosong',
        html: '<p>Nama gamer tidak boleh kosong! Silakan ketik nama baru Anda.</p>',
        type: 'warning',
        confirmText: 'MENGERTI'
      });
      return;
    }

    if(newName === oldName) {
      showGameDialog({
        title: 'Tidak Ada Perubahan',
        html: '<p>Nama gamer Anda masih sama. Ketik nama baru untuk mengubahnya.</p>',
        type: 'info',
        confirmText: 'OK'
      });
      return;
    }

    const changes = gpProfile.nameChangesDone || 0;
    if(changes === 0) {
      // 1x Ganti nama FREE
      gpProfile.gamerTag = newName;
      gpProfile.nameChangesDone = 1;
      saveGPProfile();
      if(typeof saveCloudSave === 'function') saveCloudSave();
      syncGPProfileUI();
      showGameDialog({
        title: 'Nama Berhasil Diubah!',
        html: `<p>Nama gamer Anda berhasil diubah menjadi:</p><div class="dialog-info-card"><div class="dialog-info-row"><span>GamerTag:</span><b>${newName}</b></div><div class="dialog-info-row"><span>Biaya:</span><b style="color:#4ade80;">GRATIS (1x)</b></div></div>`,
        type: 'success',
        confirmText: 'KEREN!'
      });
    } else {
      // Ganti nama bayar 50 Koin
      const cost = 50;
      if(progress.coins < cost) {
        if(el.gpGamerTagInput) el.gpGamerTagInput.value = oldName;
        showGameDialog({
          title: 'Koin Tidak Cukup',
          html: `<p>Koin Anda tidak cukup untuk mengganti nama gamer!</p><div class="dialog-info-card"><div class="dialog-info-row"><span>Biaya Ganti Nama:</span><b>${cost} Koin</b></div><div class="dialog-info-row"><span>Saldo Anda:</span><b style="color:#f87171;">${progress.coins} Koin</b></div></div>`,
          type: 'coin',
          confirmText: 'MENGERTI'
        });
        return;
      }

      const ok = await showGameDialog({
        title: 'Konfirmasi Ganti Nama',
        html: `<p>Apakah Anda yakin ingin mengganti nama menjadi <b>"${newName}"</b>?</p><div class="dialog-info-card"><div class="dialog-info-row"><span>Biaya:</span><b>${cost} Koin</b></div><div class="dialog-info-row"><span>Sisa Saldo:</span><b>${progress.coins - cost} Koin</b></div></div>`,
        type: 'coin',
        confirmText: `GANTI NAMA (-${cost} KOIN)`,
        cancelText: 'BATAL'
      });
      if(!ok) {
        if(el.gpGamerTagInput) el.gpGamerTagInput.value = oldName;
        showModal(el.googlePlayModal);
        return;
      }

      progress.coins -= cost;
      gpProfile.gamerTag = newName;
      gpProfile.nameChangesDone = changes + 1;
      updateCoins();
      persistProgress();
      saveGPProfile();
      if(typeof saveCloudSave === 'function') saveCloudSave();
      syncGPProfileUI();
      showGameDialog({
        title: 'Nama Berhasil Diubah!',
        html: `<p>Nama gamer berhasil diubah menjadi <b>"${newName}"</b>!</p><div class="dialog-info-card"><div class="dialog-info-row"><span>Biaya:</span><b>-${cost} Koin</b></div><div class="dialog-info-row"><span>Sisa Koin:</span><b>${progress.coins} Koin</b></div></div>`,
        type: 'success',
        confirmText: 'SELESAI'
      });
    }
  });

  bindClick('howBtn', () => { audio.click(); showModal(el.how); });
  const fbBtn = $('lobbyFeedbackBtn');
  if(fbBtn) {
    fbBtn.addEventListener('click', () => {
      audio.click();
    });
  }
  const donateBtn = $('lobbyDonateBtn');
  if(donateBtn) {
    donateBtn.addEventListener('click', () => {
      audio.win();
    });
  }
  bindClick('settingsBtn', () => { audio.click(); showModal(el.settings); });
  bindClick('shopBtn', () => { audio.click(); syncPreviewLoadout(); updateCoins(); renderShop(); showModal(el.shop); startShopShowcase(); });
  document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => { audio.click(); closeModal(); });
  document.addEventListener('click', e => {
    const closeBtn = e.target.closest('[data-close]');
    if(closeBtn) {
      if(audio && audio.click) audio.click();
      if(closeBtn.id === 'pauseCloseBtn') {
        resume();
      } else {
        closeModal();
      }
    }
  });
  if(el.layer) {
    el.layer.addEventListener('pointerdown', e => {
      if(e.target === el.layer) {
        if((el.shop && !el.shop.classList.contains('hidden')) || 
           (el.how && !el.how.classList.contains('hidden')) || 
           (el.settings && !el.settings.classList.contains('hidden')) || 
           (el.googlePlayModal && !el.googlePlayModal.classList.contains('hidden')) || 
           (el.rankedModal && !el.rankedModal.classList.contains('hidden'))) {
          audio.click();
          closeModal();
        }
      }
    });
  }
  bindClick('pauseCloseBtn', resume);
  bindClick('overCloseBtn', home);
  bindClick('reviveCloseBtn', () => { if(el.reviveGiveUp) el.reviveGiveUp.click(); else closeModal(); });
  bindClick('resumeBtn', resume);
  bindClick('restartBtn', goReady);
  bindClick('homeBtn', home);
  bindClick('replayBtn', goReady);
  bindClick('overHomeBtn', home);
  bindClick(el.pause, pause);
  bindClick(el.sound, () => {
    settings.sound = !settings.sound;
    if(el.soundToggle) el.soundToggle.checked = settings.sound;
    syncSettings();
    audio.click();
  });
  bindClick(el.musicBtn, () => {
    settings.music = !settings.music;
    if(el.musicToggle) el.musicToggle.checked = settings.music;
    syncSettings();
    audio.click();
    persist();
  });
  bindClick(el.mpAudioToggleBtn, () => {
    settings.sound = !settings.sound;
    settings.music = settings.sound;
    if(el.soundToggle) el.soundToggle.checked = settings.sound;
    if(el.musicToggle) el.musicToggle.checked = settings.music;
    syncSettings();
    if(settings.sound) audio.click();
    persist();
    if(el.mpAudioToggleBtn) {
      el.mpAudioToggleBtn.classList.toggle('muted', !settings.sound);
    }
  });

  // =========================================================
  // SOCIAL, FRIENDLIST & CHAT UI CONTROLLERS
  // =========================================================
  const btnSocial = $('socialBtn');
  const socialModal = $('socialModal');
  const tabFriendsBtn = $('tabFriendsBtn');
  const tabSearchBtn = $('tabSearchBtn');
  const tabReqBtn = $('tabReqBtn');
  const panelFriends = $('panelFriends');
  const panelSearch = $('panelSearch');
  const panelRequests = $('panelRequests');

  if(btnSocial) {
    bindClick(btnSocial, () => {
      audio.click();
      if(window.socialService && gpProfile) {
        window.socialService.setAccount(gpProfile.primaryKey, gpProfile);
        window.socialService.refreshRequests();
      }
      showModal(socialModal);
    });
  }

  function switchSocialTab(activeBtn, activePanel) {
    [tabFriendsBtn, tabSearchBtn, tabReqBtn].forEach(b => { if(b) b.classList.remove('active'); });
    [panelFriends, panelSearch, panelRequests].forEach(p => { if(p) p.classList.remove('active'); });
    if(activeBtn) activeBtn.classList.add('active');
    if(activePanel) activePanel.classList.add('active');
    audio.click();
  }

  if(tabFriendsBtn) tabFriendsBtn.onclick = () => switchSocialTab(tabFriendsBtn, panelFriends);
  if(tabSearchBtn) tabSearchBtn.onclick = () => switchSocialTab(tabSearchBtn, panelSearch);
  if(tabReqBtn) tabReqBtn.onclick = () => {
    switchSocialTab(tabReqBtn, panelRequests);
    if(window.socialService) window.socialService.refreshRequests();
  };

  // Social Search Controller
  const socialSearchInput = $('socialSearchInput');
  const socialSearchBtn = $('socialSearchBtn');
  const socialSearchResults = $('socialSearchResults');

  async function executeSocialSearch() {
    if(!socialSearchInput || !socialSearchResults || !window.socialService) return;
    const query = socialSearchInput.value.trim();
    if(query.length < 2) {
      socialSearchResults.innerHTML = '<div class="social-empty-state"><div class="social-empty-icon"><svg viewBox="0 0 24 24" width="32" height="32" fill="#f59e0b"><path d="M12 2L1 21h22L12 2zm0 3.8L20.2 19H3.8L12 5.8zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg></div><div>Ketik minimal 2 karakter untuk mencari.</div></div>';
      return;
    }
    socialSearchResults.innerHTML = '<div style="text-align:center;color:#94a3b8;padding:24px;">Sedang mencari pemain...</div>';
    const results = await window.socialService.searchPlayers(query);
    if(results.length === 0) {
      socialSearchResults.innerHTML = '<div class="social-empty-state"><div class="social-empty-icon"><svg viewBox="0 0 24 24" width="32" height="32" fill="#38bdf8"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></div><div>Pemain tidak ditemukan. Pastikan GamerTag sudah benar!</div></div>';
      return;
    }

    let html = '';
    results.forEach(p => {
      const svg = typeof getCuteAvatarSvg === 'function' ? getCuteAvatarSvg(p.avatar, 40) : '';
      html += `
        <div class="social-player-card">
          <div class="social-player-info">
            <div class="social-player-avatar">${svg}</div>
            <div class="social-player-meta">
              <div class="social-player-name">${window.socialService.escapeHtml(p.name)}</div>
              <div class="social-player-tier">${p.tier}</div>
            </div>
          </div>
          <div class="social-card-actions">
            ${p.isFriend ? '<span style="color:#22c55e;font-weight:700;font-size:0.8rem;padding:6px 10px;">Teman</span>' :
              p.isPending ? '<span style="color:#f59e0b;font-weight:700;font-size:0.8rem;padding:6px 10px;">Menunggu</span>' :
              `<button class="social-action-btn success btn-send-add" data-key="${p.key}" data-name="${p.name}" data-avatar="${p.avatar}" data-tier="${p.tier}">+ Tambah</button>`}
          </div>
        </div>
      `;
    });
    socialSearchResults.innerHTML = html;

    socialSearchResults.querySelectorAll('.btn-send-add').forEach(btn => {
      btn.onclick = async () => {
        btn.disabled = true;
        btn.textContent = 'Mengirim...';
        const key = btn.getAttribute('data-key');
        const name = btn.getAttribute('data-name');
        const avatar = btn.getAttribute('data-avatar');
        const tier = btn.getAttribute('data-tier');
        const res = await window.socialService.sendFriendRequest(key, name, avatar, tier);
        if(res.success) {
          btn.textContent = 'Terkirim!';
          btn.classList.remove('success');
        } else {
          btn.textContent = 'Gagal';
          showGameDialog({
            title: 'Permintaan Pertemanan',
            html: `<p>${res.msg || 'Gagal mengirim permintaan pertemanan.'}</p>`,
            type: 'warning',
            confirmText: 'MENGERTI'
          });
        }
      };
    });
  }

  if(socialSearchBtn) socialSearchBtn.onclick = executeSocialSearch;
  if(socialSearchInput) {
    socialSearchInput.onkeydown = (e) => {
      if(e.key === 'Enter') {
        e.preventDefault();
        executeSocialSearch();
      }
    };
  }

  // Direct Chat Form & Quick Emojis
  const chatForm = $('chatForm');
  const chatInput = $('chatInput');
  if(chatForm && chatInput) {
    chatForm.onsubmit = (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if(text && window.socialService) {
        window.socialService.sendMessage(text);
        chatInput.value = '';
      }
    };
  }

  document.querySelectorAll('.quick-emoji-btn').forEach(emojiBtn => {
    emojiBtn.onclick = () => {
      const emoji = emojiBtn.textContent.trim();
      if(emoji && window.socialService) {
        window.socialService.sendMessage(emoji);
      }
    };
  });

  // Startup initialization of Social Service Account
  if(window.socialService && gpProfile && gpProfile.primaryKey) {
    window.socialService.setAccount(gpProfile.primaryKey, gpProfile);
  }

  // =========================================================
  // CENTRALIZED COIN MANAGEMENT SYSTEM
  // =========================================================
  function addCoins(amount, reason = 'reward') {
    if(!amount || amount <= 0) return;
    progress.coins = (progress.coins || 0) + amount;
    persistProgress();
    updateCoins();
    if(typeof saveCloudSave === 'function') saveCloudSave();
    if(audio) audio.win();

    // Visual celebration: Gold coin confetti & floating text
    const fxX = (typeof bird !== 'undefined' && bird && Number.isFinite(bird.x)) ? bird.x : 90;
    const fxY = (typeof bird !== 'undefined' && bird && Number.isFinite(bird.y)) ? bird.y : 150;
    makeParticles(fxX, fxY, 25, '#fbbf24');
    makeParticles(fxX, fxY, 15, '#fde047');
    floatingTexts.push({
      x: fxX,
      y: fxY - 25,
      text: `+${amount} KOIN BERHASIL DIKLAIM!`,
      color: '#fbbf24',
      vy: -55,
      life: 1.3,
      maxLife: 1.3
    });
  }

  // =========================================================
  // REWARD AD MANAGER (OFFICIAL GOOGLE ADSENSE / H5 ADBREAK REWARDED ADS)
  // =========================================================
  const RewardAdManager = {
    DEBUG: true, // Ubah ke false untuk production mute
    isInitialized: false,
    isLoading: false,
    isAdPlaying: false,
    cooldownRemaining: 0,
    cooldownTimer: null,
    currentSessionToken: null,
    rewardGrantedForSession: false,
    adConfigReady: false,

    log(...args) {
      if(this.DEBUG) console.log('[RewardAdManager]', ...args);
    },
    warn(...args) {
      if(this.DEBUG) console.warn('[RewardAdManager]', ...args);
    },
    error(...args) {
      if(this.DEBUG) console.error('[RewardAdManager]', ...args);
    },

    initialize() {
      if(this.isInitialized) return;
      this.isInitialized = true;
      this.log('Initializing Google AdSense / H5 Games Rewarded Ads...');

      // Inisialisasi Google H5 Games Ads API adConfig jika tersedia
      if(typeof window.adConfig === 'function') {
        try {
          window.adConfig({
            preloadAdBreaks: 'on',
            sound: 'on',
            onReady: () => {
              this.adConfigReady = true;
              this.log('Reward ad available: Google H5 Games AdSense API is Ready.');
            }
          });
        } catch(err) {
          this.warn('adConfig init error:', err.message);
        }
      }

      this.updateButtonState('NORMAL');
    },

    isAvailable() {
      if(this.isLoading || this.isAdPlaying || this.cooldownRemaining > 0) return false;
      return true;
    },

    show() {
      if(!this.isAvailable()) {
        this.log('Ad unavailable or in cooldown:', this.cooldownRemaining, 'seconds remaining');
        return;
      }

      this.isLoading = true;
      this.isAdPlaying = true;
      this.rewardGrantedForSession = false;
      this.currentSessionToken = 'ad_session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      const sessionToken = this.currentSessionToken;

      this.updateButtonState('LOADING');
      this.log('Reward ad started. Session Token:', sessionToken);

      // 1. Google H5 Games Ads API (adBreak)
      if(typeof window.adBreak === 'function') {
        let rewardGivenInBreak = false;
        try {
          window.adBreak({
            type: 'reward',
            name: 'rewarded_coin_ad',
            beforeAd: () => {
              this.log('Reward ad started (muting background music)');
              if(audio) audio.stopMusic();
            },
            afterAd: () => {
              this.log('Reward ad completed (lifecycle ended)');
              if(state === State.MENU && settings.music && audio) audio.lobbyMusic();
            },
            beforeReward: (showAdFn) => {
              this.log('beforeReward prompt acknowledged. Showing ad...');
              showAdFn();
            },
            adViewed: () => {
              this.log('Reward ad completed: adViewed event received from Google!');
              rewardGivenInBreak = true;
              if(this.currentSessionToken === sessionToken && !this.rewardGrantedForSession) {
                this.handleReward(25, sessionToken);
              }
            },
            adDismissed: () => {
              this.log('Ad dismissed before reward requirements were met');
              this.handleError('User dismissed ad before completion');
            },
            adBreakDone: (placementInfo) => {
              const status = placementInfo ? placementInfo.breakStatus : 'unknown';
              this.log('adBreakDone lifecycle finished with status:', status);
              this.isAdPlaying = false;
              this.isLoading = false;
              if(!rewardGivenInBreak && !this.rewardGrantedForSession) {
                this.handleError('Ad break status: ' + status);
              } else {
                this.startCooldown(15);
              }
            }
          });
          return;
        } catch(adBreakErr) {
          this.warn('adBreak invocation error:', adBreakErr.message);
        }
      }

      // 2. Google Publisher Tag (GPT) Out-of-page Rewarded Ads
      if(window.googletag && window.googletag.pubads) {
        try {
          let gptRewardedSlot = null;
          window.googletag.cmd.push(() => {
            if(window.googletag.enums && window.googletag.enums.OutOfPageFormat && window.googletag.enums.OutOfPageFormat.REWARDED) {
              gptRewardedSlot = window.googletag.defineOutOfPageSlot('/6774733814/rewarded', window.googletag.enums.OutOfPageFormat.REWARDED);
              if(gptRewardedSlot) {
                gptRewardedSlot.addService(window.googletag.pubads());
                window.googletag.pubads().addEventListener('rewardedSlotGranted', (event) => {
                  this.log('Reward granted: GPT rewardedSlotGranted event received from Google!', event);
                  if(this.currentSessionToken === sessionToken && !this.rewardGrantedForSession) {
                    this.handleReward(25, sessionToken);
                  }
                });
                window.googletag.pubads().addEventListener('rewardedSlotClosed', () => {
                  this.log('Reward ad closed.');
                  this.isAdPlaying = false;
                  this.isLoading = false;
                  this.startCooldown(15);
                });
                window.googletag.display(gptRewardedSlot);
                return;
              }
            }
          });
        } catch(gptErr) {
          this.warn('GPT rewarded slot error:', gptErr.message);
        }
      }

      // 3. Jika iklan belum siap atau tidak tersedia dari Google AdSense
      this.log('Ad unavailable: No active Google AdSense rewarded provider returned an ad.');
      this.handleError('Iklan belum tersedia, coba lagi nanti.');
    },

    handleReward(amount, sessionToken) {
      if(this.rewardGrantedForSession || this.currentSessionToken !== sessionToken) {
        this.warn('Duplicate reward attempt prevented for session token:', sessionToken);
        return;
      }
      this.rewardGrantedForSession = true;
      this.log('Reward granted: Adding +' + amount + ' coins to player account.');
      addCoins(amount, 'google_rewarded_ad');
    },

    handleError(reason) {
      this.warn('Ad error:', reason);
      this.isAdPlaying = false;
      this.isLoading = false;
      this.rewardGrantedForSession = false;
      this.updateButtonState('NOT_AVAILABLE');

      // Tampilkan pesan mengambang ramah pengguna
      const isEn = settings.language === 'en';
      const msg = isEn ? 'Ad not available right now, please try again later.' : 'Iklan belum tersedia, coba lagi nanti.';
      floatingTexts.push({
        x: W / 2,
        y: H - 110,
        text: msg,
        color: '#f87171',
        vy: -35,
        life: 2.2,
        maxLife: 2.2
      });

      setTimeout(() => {
        if(this.cooldownRemaining <= 0) {
          this.updateButtonState('NORMAL');
        }
      }, 3500);
    },

    startCooldown(seconds = 15) {
      this.cooldownRemaining = seconds;
      this.updateButtonState('COOLDOWN');
      clearInterval(this.cooldownTimer);
      this.cooldownTimer = setInterval(() => {
        this.cooldownRemaining--;
        if(this.cooldownRemaining <= 0) {
          clearInterval(this.cooldownTimer);
          this.cooldownTimer = null;
          this.updateButtonState('NORMAL');
        } else {
          this.updateButtonState('COOLDOWN');
        }
      }, 1000);
    },

    updateButtonState(stateType) {
      const btn = $('lobbyAdmobRewardBtn') || el.lobbyAdmobRewardBtn;
      if(!btn) return;

      const label = btn.querySelector('.side-btn-label') || btn.querySelector('span:last-child');
      const isIndo = settings.language !== 'en';

      if(stateType === 'LOADING') {
        btn.disabled = true;
        btn.style.opacity = '0.7';
        btn.style.pointerEvents = 'none';
        if(label) label.textContent = isIndo ? 'MEMUAT...' : 'LOADING...';
      } else if(stateType === 'NOT_AVAILABLE') {
        btn.disabled = true;
        btn.style.opacity = '0.75';
        btn.style.pointerEvents = 'none';
        if(label) label.textContent = isIndo ? 'IKLAN HABIS' : 'NO ADS';
      } else if(stateType === 'COOLDOWN') {
        btn.disabled = true;
        btn.style.opacity = '0.75';
        btn.style.pointerEvents = 'none';
        if(label) label.textContent = `${this.cooldownRemaining}s`;
      } else {
        // NORMAL
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
        if(label) label.textContent = isIndo ? '+25 KOIN' : '+25 COINS';
      }
    },

    reset() {
      this.isLoading = false;
      this.isAdPlaying = false;
      this.rewardGrantedForSession = false;
      this.currentSessionToken = null;
      clearInterval(this.cooldownTimer);
      this.cooldownTimer = null;
      this.cooldownRemaining = 0;
      this.updateButtonState('NORMAL');
    }
  };

  // Inisialisasi RewardAdManager
  RewardAdManager.initialize();

  // Hubungkan tombol reward lobi dengan proteksi double-click
  const btnAdmob = $('lobbyAdmobRewardBtn') || el.lobbyAdmobRewardBtn;
  if(btnAdmob) {
    bindClick(btnAdmob, () => {
      RewardAdManager.show();
    });
  }

  function showLobbyAdmobRewardModal(onRewardComplete) {
    if(audio) audio.click();
    showGameDialog({
      title: 'DAPATKAN KOIN GRATIS!',
      html: `
        <div style="text-align:center;padding:4px 0;">
          <div style="font-size:38px;margin-bottom:8px;">🪙</div>
          <p style="font-size:13px;color:#e2e8f0;margin-bottom:10px;">Tonton video singkat untuk mendapatkan <b>+50 Koin Emas</b> secara gratis!</p>
          <div class="dialog-info-card" style="text-align:center;background:rgba(234,179,8,0.12);border-color:#eab308;padding:10px;">
            <span style="color:#facc15;font-weight:900;font-size:15px;letter-spacing:0.5px;">HADIAH: +50 KOIN EMAS 💰</span>
          </div>
        </div>
      `,
      type: 'coin',
      confirmText: 'TONTON IKLAN (+50) ▶',
      cancelText: 'NANTI SAJA',
      showCancel: true
    }).then(confirmed => {
      if(!confirmed) return;
      if(typeof window.showGoogleAdMobRewarded === 'function') {
        window.showGoogleAdMobRewarded((amount) => {
          const rewardCoins = amount || 50;
          addCoins(rewardCoins, 'lobby_reward_ad');
          if(typeof onRewardComplete === 'function') onRewardComplete(rewardCoins);
          showGameDialog({
            title: 'Selamat!',
            html: `<p>Kamu berhasil mendapatkan <b style="color:#facc15;">+${rewardCoins} Koin Emas</b>!</p>`,
            type: 'success',
            confirmText: 'TERIMA KASIH'
          });
        }, () => {}, () => {
          // Fallback jika provider iklan sedang bersiap di browser
          addCoins(50, 'lobby_fallback_ad');
          if(typeof onRewardComplete === 'function') onRewardComplete(50);
          showGameDialog({
            title: 'Bonus Koin!',
            html: `<p>Iklan sedang bersiap. Kamu tetap mendapatkan <b style="color:#facc15;">+50 Koin Emas</b>!</p>`,
            type: 'success',
            confirmText: 'KLAIM'
          });
        });
      } else if(typeof RewardAdManager !== 'undefined' && typeof RewardAdManager.show === 'function') {
        RewardAdManager.show();
      } else {
        addCoins(50, 'lobby_free_ad');
        if(typeof onRewardComplete === 'function') onRewardComplete(50);
      }
    });
  }
  window.showLobbyAdmobRewardModal = showLobbyAdmobRewardModal;

  // Shop Tabs Swipe / Scroll & Selection
  if(el.shopTabs) {
    el.shopTabs.querySelectorAll('[data-shop-category]').forEach(tab => {
      tab.onclick = () => {
        shopCategory = tab.dataset.shopCategory;
        if(shopCategory !== 'music') audio.stopPreview();
        tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        updateShowcaseLabel();
        renderShop();
      };
    });

    if(el.tabPrev) el.tabPrev.onclick = () => { el.shopTabs.scrollBy({ left: -95, behavior: 'smooth' }); audio.click(); };
    if(el.tabNext) el.tabNext.onclick = () => { el.shopTabs.scrollBy({ left: 95, behavior: 'smooth' }); audio.click(); };

    // Pointer Drag Scrolling for shopTabs
    let isDown = false, startX = 0, sLeft = 0;
    el.shopTabs.addEventListener('pointerdown', e => {
      isDown = true;
      startX = e.pageX - el.shopTabs.offsetLeft;
      sLeft = el.shopTabs.scrollLeft;
    });
    el.shopTabs.addEventListener('pointerleave', () => isDown = false);
    el.shopTabs.addEventListener('pointerup', () => isDown = false);
    el.shopTabs.addEventListener('pointermove', e => {
      if(!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.shopTabs.offsetLeft;
      el.shopTabs.scrollLeft = sLeft - (x - startX) * 1.35;
    });
  }

  function syncSettings() {
    if(el.soundToggle) el.soundToggle.checked = settings.sound;
    if(el.musicToggle) el.musicToggle.checked = settings.music;
    if(el.difficultyValue) {
      if(currentMode === 'ranked') {
        el.difficultyValue.textContent = 'EXTREME (LOCKED)';
        if(el.difficultyBtn) el.difficultyBtn.classList.add('locked-ranked');
      } else {
        el.difficultyValue.textContent = settings.difficulty.toUpperCase();
        if(el.difficultyBtn) el.difficultyBtn.classList.remove('locked-ranked');
      }
    }
    document.querySelectorAll('.diff-seg-btn').forEach(btn => {
      const isLocked = currentMode === 'ranked';
      btn.classList.toggle('locked', isLocked);
      if(isLocked) {
        btn.classList.remove('active');
      } else {
        btn.classList.toggle('active', btn.dataset.difficulty === settings.difficulty);
      }
    });
    if(el.difficultyMenu) {
      el.difficultyMenu.querySelectorAll('[data-difficulty]').forEach(button => {
        button.classList.toggle('active', button.dataset.difficulty === settings.difficulty);
      });
    }
    if(el.sound) {
      el.sound.classList.toggle('muted', !settings.sound);
      el.sound.innerHTML = settings.sound ? 
        '<svg class="btn-svg sound-svg" viewBox="0 0 24 24" width="19" height="19"><path d="M3 9.5v5h4l5 4.5v-14l-5 4.5H3z" fill="currentColor"/><path class="sound-wave w1" d="M15.5 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path class="sound-wave w2" d="M18.5 5.5a9 9 0 0 1 0 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' : 
        '<svg class="btn-svg sound-svg" viewBox="0 0 24 24" width="19" height="19"><path d="M3 9.5v5h4l5 4.5v-14l-5 4.5H3z" fill="currentColor"/><path d="m16 9 5 5m0-5-5 5" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round"/></svg>';
      el.sound.setAttribute('aria-label', settings.sound ? 'Matikan suara' : 'Nyalakan suara');
    }
    applyLanguage(settings.language || 'id');
    updateMusicUI();
    persist();
    if(!settings.music) {
      audio.stopMusic();
      stopBackgroundMusic();
    } else {
      audio.music();
      if(state === State.PLAYING) playBackgroundMusic();
    }
  }

  function closeDifficulty() {
    if(el.difficultyMenu) el.difficultyMenu.classList.add('hidden');
    if(el.difficultyBtn) el.difficultyBtn.setAttribute('aria-expanded', 'false');
  }

  if(el.langIdBtn) {
    el.langIdBtn.onclick = () => {
      settings.language = 'id';
      audio.click();
      syncSettings();
    };
  }
  if(el.langEnBtn) {
    el.langEnBtn.onclick = () => {
      settings.language = 'en';
      audio.click();
      syncSettings();
    };
  }

  if(el.soundToggle) el.soundToggle.onchange = e => { settings.sound = e.target.checked; syncSettings(); };
  if(el.musicToggle) el.musicToggle.onchange = e => { settings.music = e.target.checked; syncSettings(); };
  if(el.difficultyBtn) {
    el.difficultyBtn.onclick = () => {
      if(currentMode === 'ranked') {
        audio.hit();
        return;
      }
      if(el.difficultyMenu) {
        const open = el.difficultyMenu.classList.toggle('hidden');
        el.difficultyBtn.setAttribute('aria-expanded', String(!open));
      }
    };
  }
  if(el.difficultyMenu) {
    el.difficultyMenu.querySelectorAll('[data-difficulty]').forEach(button => {
      button.onclick = () => {
        settings.difficulty = button.dataset.difficulty;
        audio.click();
        syncSettings();
        closeDifficulty();
      };
    });
  }
  document.querySelectorAll('.diff-seg-btn').forEach(button => {
    button.onclick = () => {
      if(currentMode === 'ranked') {
        audio.hit();
        return;
      }
      settings.difficulty = button.dataset.difficulty;
      audio.click();
      syncSettings();
    };
  });
  document.addEventListener('pointerdown', e => {
    if(!e.target.closest || !e.target.closest('.difficulty-picker')) closeDifficulty();
  });

  if(el.dashBtn) {
    el.dashBtn.onclick = e => {
      e.stopPropagation();
      e.preventDefault();
      triggerDash();
    };
    el.dashBtn.addEventListener('pointerdown', e => {
      e.stopPropagation();
      e.preventDefault();
      const isRaceMode = currentMode === 'multiplayer' && window.multiplayerEngine && window.multiplayerEngine.gameMode === 'race';
      if(isRaceMode) {
        isHoldingDash = true;
      }
      triggerDash();
    });
    const stopHold = () => {
      isHoldingDash = false;
    };
    el.dashBtn.addEventListener('pointerup', stopHold);
    el.dashBtn.addEventListener('pointercancel', stopHold);
    el.dashBtn.addEventListener('pointerleave', stopHold);
    el.dashBtn.addEventListener('pointerout', stopHold);
  }

  if(el.reviveModal) {
    el.reviveModal.addEventListener('click', e => e.stopPropagation());
    el.reviveModal.addEventListener('pointerdown', e => e.stopPropagation());
  }

  if(el.reviveConfirmBtn) {
    let lastReviveClick = 0;
    const handleRevive = (e) => {
      if(e) { e.stopPropagation(); e.preventDefault(); }
      if(!reviveInputAllowed) return;
      const now = Date.now();
      if(now - lastReviveClick < 400) return;
      lastReviveClick = now;
      executeRevive();
    };
    el.reviveConfirmBtn.onclick = handleRevive;
    el.reviveConfirmBtn.addEventListener('pointerdown', handleRevive);
  }
  if(el.reviveGiveUpBtn) {
    let lastGiveUpClick = 0;
    const handleGiveUp = (e) => {
      if(e) { e.stopPropagation(); e.preventDefault(); }
      if(!reviveInputAllowed) return;
      const now = Date.now();
      if(now - lastGiveUpClick < 400) return;
      lastGiveUpClick = now;
      giveUpRevive();
    };
    el.reviveGiveUpBtn.onclick = handleGiveUp;
    el.reviveGiveUpBtn.addEventListener('pointerdown', handleGiveUp);
  }

  window.addEventListener('keydown', e => {
    // Jangan trigger kontrol jika sedang mengetik di input nama
    if(e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

    // Flap Keys: Space, ArrowUp, KeyW
    if(['Space', 'ArrowUp', 'KeyW'].includes(e.code) || e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      e.preventDefault();
      flap();
      return;
    }

    // Dash Keys: Shift (Left/Right), D, F, E, X, C, Z, ArrowRight, Enter
    if(
      ['ShiftLeft', 'ShiftRight', 'KeyD', 'KeyF', 'KeyE', 'KeyX', 'KeyC', 'KeyZ', 'ArrowRight', 'Enter'].includes(e.code) ||
      e.key === 'Shift' || e.key === 'd' || e.key === 'D' || e.key === 'f' || e.key === 'F' || e.key === 'e' || e.key === 'E' ||
      e.key === 'x' || e.key === 'X' || e.key === 'c' || e.key === 'C' || e.key === 'z' || e.key === 'Z' || e.key === 'ArrowRight'
    ) {
      e.preventDefault();
      const isRaceMode = currentMode === 'multiplayer' && window.multiplayerEngine && window.multiplayerEngine.gameMode === 'race';
      if(isRaceMode) {
        isHoldingDash = true;
        if(dashTimer <= 0) triggerDash();
      } else {
        if(!e.repeat) triggerDash();
      }
      return;
    }

    // Pause / Resume Keys: KeyP, Escape
    if((e.code === 'KeyP' || e.code === 'Escape') && (state === State.PLAYING || state === State.READY)) {
      pause();
    } else if((e.code === 'KeyP' || e.code === 'Escape') && state === State.PAUSED) {
      resume();
    }
  });

  window.addEventListener('keyup', e => {
    if(
      ['ShiftLeft', 'ShiftRight', 'KeyD', 'KeyF', 'KeyE', 'KeyX', 'KeyC', 'KeyZ', 'ArrowRight', 'Enter'].includes(e.code) ||
      e.key === 'Shift' || e.key === 'd' || e.key === 'D' || e.key === 'f' || e.key === 'F' || e.key === 'e' || e.key === 'E' ||
      e.key === 'x' || e.key === 'X' || e.key === 'c' || e.key === 'C' || e.key === 'z' || e.key === 'Z' || e.key === 'ArrowRight'
    ) {
      isHoldingDash = false;
    }
  });

  window.addEventListener('blur', () => {
    isHoldingDash = false;
  });
  canvas.addEventListener('pointerdown', e => {
    if(e.target.closest('#dashBtn')) return;
    e.preventDefault();

    // INTERACTIVE LOBBY MASCOT TAPPING (Burung & Pet Interaktif saat di Lobi)
    if(state === State.MENU) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      const mainBirdX = W / 2;
      const mainBirdY = H - GROUND - 22;
      const chick1X = mainBirdX - 52;
      const chick1Y = H - GROUND - 14;
      const chick2X = mainBirdX + 54;
      const chick2Y = H - GROUND - 14;

      // 1. Klik Burung Utama di Lobi -> Lompat Gembira, Keluar Hati & Sparkles, Mainkan Bunyi Imut
      if(Math.hypot(clickX - mainBirdX, clickY - mainBirdY) < 45) {
        lobbyBirdBounce = 0.5;
        if(audio && audio.point) audio.point();
        const cuteEmotes = ['★', '✦', '♪', '✧', '♦', '♥'];
        for(let i = 0; i < 6; i++) {
          lobbyEmotes.push({
            x: mainBirdX + (Math.random() - 0.5) * 28,
            y: mainBirdY - 24,
            text: cuteEmotes[i % cuteEmotes.length],
            life: 1.6,
            maxLife: 1.6,
            vy: -35 - Math.random() * 30
          });
        }
        return;
      }

      // 2. Klik Pet Anak Burung Kiri -> Lompat Salto, Keluar Nada Musik & Bintang
      if(Math.hypot(clickX - chick1X, clickY - chick1Y) < 32) {
        lobbyChick1Bounce = 0.5;
        if(audio && audio.click) audio.click();
        const chickEmotes = ['★', '✦', '♪', '✧'];
        for(let i = 0; i < 4; i++) {
          lobbyEmotes.push({
            x: chick1X + (Math.random() - 0.5) * 18,
            y: chick1Y - 18,
            text: chickEmotes[i % chickEmotes.length],
            life: 1.5,
            maxLife: 1.5,
            vy: -32 - Math.random() * 25
          });
        }
        return;
      }

      // 3. Klik Pet Anak Burung Kanan -> Lompat Salto Balik, Keluar Nada Musik & Hati
      if(Math.hypot(clickX - chick2X, clickY - chick2Y) < 32) {
        lobbyChick2Bounce = 0.5;
        if(audio && audio.click) audio.click();
        const chickEmotes = ['★', '✦', '♪', '✧'];
        for(let i = 0; i < 4; i++) {
          lobbyEmotes.push({
            x: chick2X + (Math.random() - 0.5) * 18,
            y: chick2Y - 18,
            text: chickEmotes[i % chickEmotes.length],
            life: 1.5,
            maxLife: 1.5,
            vy: -32 - Math.random() * 25
          });
        }
        return;
      }
    }

    flap();
  });
  el.ready.addEventListener('pointerdown', e => {
    if(e.target.closest('#dashBtn')) return;
    e.preventDefault();
    flap();
  });
  // =========================================================
  // MULTIPLAYER 1v1 CLOUDFLARE ENGINE EVENT WIRING
  // =========================================================
  let mpSearchInterval = null;
  let mpSearchStartTime = 0;

  function startSearchingRadar() {
    // Tutup modal agar pemain kembali ke lobi utama dan tampilkan banner matchmaking MLBB melayang dari atas
    const mpModal = el.multiplayerModal || $('multiplayerModal');
    if(mpModal) { mpModal.classList.add('hidden'); mpModal.style.display = 'none'; }
    const layer = el.layer || $('modalLayer');
    if(layer) { layer.classList.add('hidden'); }

    const searchingBar = document.getElementById('mpSearchingBar');
    if(searchingBar) {
      searchingBar.classList.remove('hidden');
      searchingBar.style.display = 'flex';
    }

    mpSearchStartTime = Date.now();
    if(mpSearchInterval) clearInterval(mpSearchInterval);
    mpSearchInterval = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - mpSearchStartTime) / 1000);
      const mm = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
      const ss = String(elapsedSec % 60).padStart(2, '0');
      const timeStr = `${mm}:${ss}`;
      const timerEl = document.getElementById('mpSearchTimerText');
      if(timerEl) timerEl.textContent = timeStr;

      // FAILSAFE WATCHDOG: Jika detik berjalan mencapai 8 detik (dalam rentang 7-15s) dan match belum dimulai, otomatis mulai duel bot!
      if (elapsedSec >= 8 && window.multiplayerEngine) {
        if (window.multiplayerEngine.matchStatus === 'QUEUED' || !window.multiplayerEngine.currentRoom) {
          console.log(`[Matchmaking Watchdog] Waktu tunggu mencapai ${elapsedSec}s. Memulai match dengan AI Bot.`);
          window.multiplayerEngine.spawnBotMatch();
        }
      }
    }, 1000);
    const timerEl = document.getElementById('mpSearchTimerText');
    if(timerEl) timerEl.textContent = '00:00';
  }

  function stopSearchingRadar() {
    if(mpSearchInterval) {
      clearInterval(mpSearchInterval);
      mpSearchInterval = null;
    }
    const searchingBar = document.getElementById('mpSearchingBar');
    if(searchingBar) {
      searchingBar.classList.add('hidden');
      searchingBar.style.display = 'none';
    }
  }

  let versusClashTimer = null;
  let versusClashActive = false;

  function playVersusClashIntro(opponent, onReadyToPlay) {
    stopSearchingRadar();
    closeModal();
    setMode('multiplayer');

    if(!el.mpVersusScreen) {
      if(onReadyToPlay) onReadyToPlay();
      return;
    }

    if (versusClashTimer) {
      clearTimeout(versusClashTimer);
      versusClashTimer = null;
    }
    versusClashActive = true;

    // Resolve opponent info accurately
    let op = opponent;
    if (!op || !op.name || op.name === 'RIVAL' || op.name === 'Rival') {
      if (window.multiplayerEngine && window.multiplayerEngine.opponents && window.multiplayerEngine.opponents.size > 0) {
        op = window.multiplayerEngine.opponents.values().next().value;
      } else if (window.multiplayerEngine && window.multiplayerEngine.currentRoom && window.multiplayerEngine.currentRoom.playersList) {
        op = window.multiplayerEngine.currentRoom.playersList.find(p => p.id !== window.multiplayerEngine.localPlayerId);
      }
    }

    const rivalName = op?.name || 'SkyRival';
    const rivalAvatar = op?.avatar || 'robo_mecha';

    // Populate Left (Player)
    if(el.mpFighterMyName) el.mpFighterMyName.textContent = gpProfile.gamerTag || 'YOU';
    if(el.mpFighterMyAvatar) el.mpFighterMyAvatar.innerHTML = getCuteAvatarSvg(gpProfile.avatar, 52);

    // Populate Right (Opponent)
    if(el.mpFighterRivalName) el.mpFighterRivalName.textContent = rivalName;
    if(el.mpFighterRivalAvatar) el.mpFighterRivalAvatar.innerHTML = getCuteAvatarSvg(rivalAvatar, 52);

    // Reset card animation triggers
    if(el.mpFighterLeft) {
      el.mpFighterLeft.style.animation = 'none';
      el.mpFighterLeft.offsetHeight; // Trigger reflow
      el.mpFighterLeft.style.animation = '';
    }
    if(el.mpFighterRight) {
      el.mpFighterRight.style.animation = 'none';
      el.mpFighterRight.offsetHeight;
      el.mpFighterRight.style.animation = '';
    }
    if(el.mpVsCenterBadge) {
      el.mpVsCenterBadge.style.animation = 'none';
      el.mpVsCenterBadge.offsetHeight;
      el.mpVsCenterBadge.style.animation = '';
    }

    el.mpVersusScreen.classList.remove('hidden');
    audio.stopMusic();
    stopBackgroundMusic();

    try {
      if(settings.sound) audio.click();
    } catch(_) {}

    // Tampilkan animasi benturan kartu VS selama 1.8 detik, lalu masuk ke arena dan mulai hitung mundur in-game!
    versusClashTimer = setTimeout(() => {
      versusClashTimer = null;
      versusClashActive = false;
      el.mpVersusScreen.classList.add('hidden');
      if(onReadyToPlay) onReadyToPlay();
    }, 1800);
  }

  let guestIsReady = false;

  if(window.multiplayerEngine) {
    const mp = window.multiplayerEngine;

    // Connect to server on page init
    mp.connect({
      name: gpProfile.gamerTag || 'SkyPlayer',
      avatar: gpProfile.avatar || 'chick_yellow',
      skin: progress.selected || 'classic'
    });

    mp.on('connected', (data) => {
      if(el.mpServerStatusText) {
        el.mpServerStatusText.textContent = data.isLocal ? 'LOCAL ARENA ONLINE' : 'SERVER ARENA ONLINE';
      }
    });

    mp.on('queued', () => {
      startSearchingRadar();
    });

    mp.on('match_cancelled', () => {
      stopSearchingRadar();
      if(versusClashTimer) {
        clearTimeout(versusClashTimer);
        versusClashTimer = null;
      }
      versusClashActive = false;
      if(el.mpVersusScreen) el.mpVersusScreen.classList.add('hidden');
    });

    mp.on('room_created', (room) => {
      stopSearchingRadar();
      guestIsReady = false;
      if(el.mpLobbyTitle) el.mpLobbyTitle.textContent = 'BAGIKAN KODE INI KE TEMAN ANDA:';
      if(el.mpCreatedCodeBadge) el.mpCreatedCodeBadge.textContent = room.code;
      if(el.mpHostName) el.mpHostName.textContent = (gpProfile.gamerTag || 'Host') + ' (KAMU)';
      if(el.mpHostAvatar) el.mpHostAvatar.innerHTML = getCuteAvatarSvg(gpProfile.avatar, 36);
      if(el.mpHostRoleBadge) el.mpHostRoleBadge.textContent = 'HOST (LEADER)';
      if(el.mpGuestName) el.mpGuestName.textContent = 'Menunggu Lawan...';
      if(el.mpGuestAvatar) el.mpGuestAvatar.innerHTML = '<span class="mlbb-waiting-pulse">+</span>';
      if(el.mpGuestSlotCard) el.mpGuestSlotCard.classList.remove('occupied');
      if(el.mpGuestStatusBadge) {
        el.mpGuestStatusBadge.textContent = 'MENUNGGU...';
        el.mpGuestStatusBadge.className = 'mlbb-podium-status waiting';
      }
      if(el.mpHostStartGameBtn) {
        el.mpHostStartGameBtn.classList.remove('hidden');
        el.mpHostStartGameBtn.disabled = false;
        el.mpHostStartGameBtn.style.opacity = '1';
        el.mpHostStartGameBtn.innerHTML = '<div class="start-btn-shine"></div><span>MULAI DENGAN BOT (1v1) ▶</span>';
      }
      if(el.mpGuestReadyBtn) el.mpGuestReadyBtn.classList.add('hidden');
      switchMpTab('create');
    });

    mp.on('player_joined', (data) => {
      audio.win();
      const guest = data.player;
      if(guest && el.mpGuestName) {
        el.mpGuestName.textContent = guest.name || 'Pemain 2';
        if(el.mpGuestAvatar) el.mpGuestAvatar.innerHTML = getCuteAvatarSvg(guest.avatar, 36);
        if(el.mpGuestSlotCard) el.mpGuestSlotCard.classList.add('occupied');
      }
      if(el.mpGuestStatusBadge) {
        el.mpGuestStatusBadge.textContent = 'BELUM READY';
        el.mpGuestStatusBadge.className = 'mlbb-podium-status waiting';
      }
      if(el.mpHostStartGameBtn) {
        el.mpHostStartGameBtn.disabled = true;
        el.mpHostStartGameBtn.style.opacity = '0.6';
        el.mpHostStartGameBtn.innerHTML = '<div class="start-btn-shine"></div><span>MENUNGGU LAWAN READY...</span>';
      }
      floatingTexts.push({
        x: 180, y: 120,
        text: `"${guest.name}" MASUK LOBBY!`,
        color: '#22c55e',
        vy: -40,
        life: 1.5, maxLife: 1.5
      });
    });

    mp.on('player_ready_status', (data) => {
      const isHost = !mp.currentRoom || mp.currentRoom.isHost !== false;
      if(data.isReady) {
        audio.win();
        if(el.mpGuestStatusBadge) {
          el.mpGuestStatusBadge.textContent = 'READY';
          el.mpGuestStatusBadge.className = 'mlbb-podium-status ready';
        }
        if(isHost && el.mpHostStartGameBtn) {
          el.mpHostStartGameBtn.disabled = false;
          el.mpHostStartGameBtn.style.opacity = '1';
          el.mpHostStartGameBtn.innerHTML = '<div class="start-btn-shine"></div><span>MULAI PERTANDINGAN ▶</span>';
        }
      } else {
        audio.click();
        if(el.mpGuestStatusBadge) {
          el.mpGuestStatusBadge.textContent = 'BELUM READY';
          el.mpGuestStatusBadge.className = 'mlbb-podium-status waiting';
        }
        if(isHost && el.mpHostStartGameBtn) {
          el.mpHostStartGameBtn.disabled = true;
          el.mpHostStartGameBtn.style.opacity = '0.6';
          el.mpHostStartGameBtn.innerHTML = '<div class="start-btn-shine"></div><span>MENUNGGU LAWAN READY...</span>';
        }
      }
    });

    mp.on('room_joined', (room) => {
      audio.win();
      stopSearchingRadar();
      guestIsReady = false;
      switchMpTab('create');

      if(el.mpLobbyTitle) el.mpLobbyTitle.textContent = 'TERHUBUNG KE ROOM TEMAN:';
      if(el.mpCreatedCodeBadge) el.mpCreatedCodeBadge.textContent = room.code;

      const host = room.playersList?.find(p => p.id !== mp.localPlayerId) || { name: 'Host', avatar: 'chick_yellow' };
      if(el.mpHostName) el.mpHostName.textContent = host.name || 'Host';
      if(el.mpHostAvatar) el.mpHostAvatar.innerHTML = getCuteAvatarSvg(host.avatar, 36);
      if(el.mpHostRoleBadge) el.mpHostRoleBadge.textContent = 'HOST (LEADER)';

      if(el.mpGuestName) el.mpGuestName.textContent = (gpProfile.gamerTag || 'Player 2') + ' (KAMU)';
      if(el.mpGuestAvatar) el.mpGuestAvatar.innerHTML = getCuteAvatarSvg(gpProfile.avatar, 36);
      if(el.mpGuestSlotCard) el.mpGuestSlotCard.classList.add('occupied');
      if(el.mpGuestStatusBadge) {
        el.mpGuestStatusBadge.textContent = 'BELUM READY';
        el.mpGuestStatusBadge.className = 'mlbb-podium-status waiting';
      }

      if(el.mpHostStartGameBtn) el.mpHostStartGameBtn.classList.add('hidden');
      if(el.mpGuestReadyBtn) {
        el.mpGuestReadyBtn.classList.remove('hidden');
        el.mpGuestReadyBtn.innerHTML = '<div class="start-btn-shine"></div><span>SAYA SIAP! (READY)</span>';
      }
    });

    mp.on('match_found', (data) => {
      closeModal();
      const rival = data.opponent || data.playersList?.find(p => p.id !== mp.localPlayerId) || mp.opponents.values().next().value || { name: 'Rival', avatar: 'robo_mecha' };
      playVersusClashIntro(rival, () => {
        startMultiplayerGameWithArenaCountdown();
      });
    });

    mp.on('game_starting', (data) => {
      closeModal();
      const rival = data.opponent || mp.opponents.values().next().value || { name: 'Rival', avatar: 'robo_mecha' };
      playVersusClashIntro(rival, () => {
        startMultiplayerGameWithArenaCountdown();
      });
    });

    mp.on('opponent_died', (data) => {
      if(currentMode === 'multiplayer') {
        const rivalProfile = mp?.currentRoom?.playersList?.find(p => p.id !== mp?.localPlayerId);
        const rival = mp.opponents.get(data.playerId) || mp.opponents.values().next().value || rivalProfile || { name: 'Rival', avatar: 'robo_mecha', score: data.finalScore || 0 };
        rival.isAlive = false;
        rival.lives = 0;
        rival.score = data.finalScore !== undefined ? data.finalScore : (rival.score || 0);

        // Jika pemain lokal masih hidup, pemain lokal menang! (VICTORY)
        if(state === State.PLAYING || state === State.READY) {
          showMpBattleResult(true, score, rival.score, rival);
        }
      }
    });

    mp.on('error', (errMsg) => {
      stopSearchingRadar();
      showGameDialog({
        title: 'Pemberitahuan Room',
        html: `<p>${errMsg}</p>`,
        type: 'warning',
        confirmText: 'MENGERTI'
      });
    });
  }

  function switchMpTab(tab) {
    updateMpSlotVisibility(selectedMpPlayerCount || 2);
    if(el.mpTabQuickBtn) el.mpTabQuickBtn.classList.toggle('active', tab === 'quick');
    if(el.mpTabCreateBtn) el.mpTabCreateBtn.classList.toggle('active', tab === 'create');
    if(el.mpTabJoinBtn) el.mpTabJoinBtn.classList.toggle('active', tab === 'join');

    if(el.mpViewQuick) el.mpViewQuick.classList.toggle('hidden', tab !== 'quick');
    if(el.mpViewCreate) el.mpViewCreate.classList.toggle('hidden', tab !== 'create');
    if(el.mpViewJoin) el.mpViewJoin.classList.toggle('hidden', tab !== 'join');

    if(window.socialService && typeof window.socialService.renderLobbyFriends === 'function') {
      window.socialService.renderLobbyFriends();
    }
  }

  bindClick(el.modeMultiplayerBtn, () => {
    setMode('multiplayer');
  });

  bindClick('mpCancelSearchBtn', () => {
    audio.click();
    stopSearchingRadar();
    if(window.multiplayerEngine) {
      window.multiplayerEngine.cancelMatch();
    }
    if(el.mpModal) {
      showModal(el.mpModal);
      switchMpTab('quick');
    }
  });

  bindClick(el.mpModalCancelSearchBtn, () => {
    audio.click();
    stopSearchingRadar();
    if(window.multiplayerEngine) {
      window.multiplayerEngine.cancelMatch();
    }
  });

  bindClick(el.mpRematchBtn, () => {
    audio.click();
    closeModal();
    reset();
    setState(State.READY);
    startSearchingRadar();
    if(window.multiplayerEngine) {
      window.multiplayerEngine.leaveRoom();
      window.multiplayerEngine.quickMatch({
        name: gpProfile.gamerTag || 'SkyPlayer',
        avatar: gpProfile.avatar || 'chick_yellow',
        skin: progress.selected || 'classic'
      }, selectedMpGameMode, selectedMpPlayerCount);
    }
  });

  bindClick(el.mpOverHomeBtn, () => {
    audio.click();
    closeModal();
    if(window.multiplayerEngine) {
      window.multiplayerEngine.leaveRoom();
    }
    setState(State.MENU);
  });

  // Sub-Mode & Player Count Selection
  let selectedMpGameMode = 'survival'; // 'survival' | 'race'
  let selectedMpPlayerCount = 2; // 2 | 3 | 4

  function updateMpQuickMatchTexts() {
    if(!el.mpQuickTitleText || !el.mpQuickDescText) return;
    const modeName = selectedMpGameMode === 'race' ? 'SPRINT RACE' : 'SURVIVAL';
    el.mpQuickTitleText.textContent = `${modeName} MATCHMAKING (${selectedMpPlayerCount}P)`;
    if(selectedMpGameMode === 'race') {
      el.mpQuickDescText.textContent = `Mencari ${selectedMpPlayerCount} pemain untuk balapan cepat mencapai 30 Poin! Siapa tercepat sampai finish menang!`;
    } else {
      el.mpQuickDescText.textContent = `Mencari ${selectedMpPlayerCount} pemain untuk bertanding bertahan hidup (Last Bird Standing)!`;
    }

    // Keep the visual lobby in sync with the selected party size and profile.
    const lobbyName = $('mpLobbyMyName');
    const lobbyAvatar = $('mpLobbyMyAvatar');
    const lobbyBird = $('mpLobbySlotMyBird');
    const avatarMarkup = getCuteAvatarSvg(gpProfile.avatar || 'chick_yellow', 42);
    if(lobbyName) lobbyName.textContent = gpProfile.gamerTag || 'SKY PLAYER';
    if(lobbyAvatar) lobbyAvatar.innerHTML = avatarMarkup;
    if(lobbyBird) lobbyBird.innerHTML = avatarMarkup;
    const extraSlots = document.querySelectorAll('.mp-extra-slot');
    extraSlots.forEach((slot, index) => {
      const slotNumber = index + 3;
      slot.classList.toggle('hidden', selectedMpPlayerCount < slotNumber);
    });
  }

  if(el.mpGameModeGroup) {
    el.mpGameModeGroup.querySelectorAll('.mp-submode-pill').forEach(btn => {
      btn.onclick = () => {
        audio.click();
        el.mpGameModeGroup.querySelectorAll('.mp-submode-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedMpGameMode = btn.dataset.gamemode || 'survival';
        updateMpQuickMatchTexts();
  updateMpSlotVisibility(selectedMpPlayerCount || 2);
      };
    });
  }

  function updateMpSlotVisibility(count) {
    const c = Number(count) || 2;
    // 1. Quick match slots
    const qSlot3 = $('mpQuickSlot3');
    const qSlot4 = $('mpQuickSlot4');
    if (qSlot3) {
      if (c >= 3) { qSlot3.classList.remove('hidden'); qSlot3.style.display = 'flex'; }
      else { qSlot3.classList.add('hidden'); qSlot3.style.display = 'none'; }
    }
    if (qSlot4) {
      if (c >= 4) { qSlot4.classList.remove('hidden'); qSlot4.style.display = 'flex'; }
      else { qSlot4.classList.add('hidden'); qSlot4.style.display = 'none'; }
    }

    // 2. Buat Room Podium slots
    const rSlot3 = $('mpSlotCard3');
    const rSlot4 = $('mpSlotCard4');
    const vsEmblem = $('mpRoomVsEmblem');
    if (rSlot3) {
      if (c >= 3) { rSlot3.classList.remove('hidden'); rSlot3.style.display = 'flex'; }
      else { rSlot3.classList.add('hidden'); rSlot3.style.display = 'none'; }
    }
    if (rSlot4) {
      if (c >= 4) { rSlot4.classList.remove('hidden'); rSlot4.style.display = 'flex'; }
      else { rSlot4.classList.add('hidden'); rSlot4.style.display = 'none'; }
    }
    if (vsEmblem) {
      if (c === 2) { vsEmblem.classList.remove('hidden'); vsEmblem.style.display = 'block'; }
      else { vsEmblem.classList.add('hidden'); vsEmblem.style.display = 'none'; }
    }

    // Re-render lobby friends if socialService is loaded
    if (window.socialService && typeof window.socialService.renderLobbyFriends === 'function') {
      window.socialService.renderLobbyFriends();
    }
  }

  if(el.mpPlayerCountGroup) {
    el.mpPlayerCountGroup.querySelectorAll('.mp-player-count-pill').forEach(btn => {
      btn.onclick = () => {
        audio.click();
        el.mpPlayerCountGroup.querySelectorAll('.mp-player-count-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedMpPlayerCount = Number(btn.dataset.count) || 2;
        updateMpQuickMatchTexts();
        updateMpSlotVisibility(selectedMpPlayerCount);
      };
    });
  }

  updateMpQuickMatchTexts();

  bindClick(el.mpTabQuickBtn, () => { audio.click(); switchMpTab('quick'); });
  bindClick(el.mpTabCreateBtn, () => {
    audio.click();
    switchMpTab('create');
    if(window.multiplayerEngine) {
      window.multiplayerEngine.createRoom({
        name: gpProfile.gamerTag || 'SkyPlayer',
        avatar: gpProfile.avatar || 'chick_yellow',
        skin: progress.selected || 'classic'
      });
    }
  });
  bindClick(el.mpTabJoinBtn, () => { audio.click(); switchMpTab('join'); });

  bindClick(el.mpQuickFindBtn, () => {
    audio.click();
    startSearchingRadar();
    if(window.multiplayerEngine) {
      window.multiplayerEngine.quickMatch({
        name: gpProfile.gamerTag || 'SkyPlayer',
        avatar: gpProfile.avatar || 'chick_yellow',
        skin: progress.selected || 'classic'
      }, selectedMpGameMode, selectedMpPlayerCount);
    }
  });

  bindClick(el.mpCopyCodeBtn, () => {
    audio.click();
    const code = el.mpCreatedCodeBadge ? el.mpCreatedCodeBadge.textContent : '';
    if(code && code !== '----') {
      try {
        navigator.clipboard.writeText(code);
        showGameDialog({ title: 'Kode Disalin!', html: `<p>Kode room <b>#${code}</b> berhasil disalin ke clipboard!</p>`, type: 'success' });
      } catch(_) {
        showGameDialog({
          title: 'Kode Room',
          html: `<p>Salin kode room Anda di bawah ini:</p><div class="dialog-info-card" style="text-align:center;"><b style="font-size:18px;color:#facc15;letter-spacing:2px;">#${code}</b></div>`,
          type: 'info',
          confirmText: 'SELESAI'
        });
      }
    }
  });

  bindClick(el.mpJoinRoomBtn, () => {
    audio.click();
    const code = el.mpJoinCodeInput ? el.mpJoinCodeInput.value.trim() : '';
    if(!code) {
      showGameDialog({ title: 'Kode Kosong', html: '<p>Masukkan 4-digit kode room teman Anda!</p>', type: 'warning' });
      return;
    }
    if(window.multiplayerEngine) {
      window.multiplayerEngine.joinRoom(code, {
        name: gpProfile.gamerTag || 'SkyPlayer',
        avatar: gpProfile.avatar || 'chick_yellow',
        skin: progress.selected || 'classic'
      });
    }
  });

  window._guestIsReady = false;

  bindClick(el.mpGuestReadyBtn, () => {
    if(!window.multiplayerEngine) return;
    window._guestIsReady = !window._guestIsReady;
    if(window._guestIsReady) {
      audio.win();
      if(el.mpGuestReadyBtn) {
        el.mpGuestReadyBtn.textContent = 'BATAL SIAP';
        el.mpGuestReadyBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      }
      if(el.mpGuestStatusBadge) {
        el.mpGuestStatusBadge.textContent = 'READY';
        el.mpGuestStatusBadge.style.background = '#22c55e';
      }
    } else {
      audio.click();
      if(el.mpGuestReadyBtn) {
        el.mpGuestReadyBtn.textContent = 'SAYA SIAP! (READY)';
        el.mpGuestReadyBtn.style.background = 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)';
      }
      if(el.mpGuestStatusBadge) {
        el.mpGuestStatusBadge.textContent = 'BELUM READY';
        el.mpGuestStatusBadge.style.background = '#eab308';
      }
    }
    window.multiplayerEngine.setReady(window._guestIsReady);
  });

  bindClick(el.mpHostStartGameBtn, () => {
    audio.click();
    if(window.multiplayerEngine) {
      const hasGuest = window.multiplayerEngine.currentRoom && window.multiplayerEngine.currentRoom.playersList && window.multiplayerEngine.currentRoom.playersList.length > 1;
      if(hasGuest) {
        window.multiplayerEngine.startRoomGame();
      } else {
        window.multiplayerEngine.spawnBotMatch();
      }
    }
  });

  function _showErrBanner(msg) {
    if(!document._gameErrDiv) {
      const d = document.createElement('div');
      d.id = '_gameErrDiv';
      d.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:rgba(180,0,0,0.95);color:#fff;font:bold 11px monospace;padding:8px 10px;z-index:99999;word-break:break-all;white-space:pre-wrap;max-height:120px;overflow:auto';
      document.body.appendChild(d);
      document._gameErrDiv = d;
    }
    document._gameErrDiv.textContent = msg;
  }

  // Performance & FPS Diagnostics (Internal benchmark: window.__getGameFPS())
  let _fpsFrameCount = 0, _fpsLastCheck = performance.now(), _currentCalculatedFPS = 60;
  window.__getGameFPS = function() { return Math.round(_currentCalculatedFPS); };

  // Page Visibility API: Auto-pause & battery saver when tab is in background
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (state === State.PLAYING && currentMode !== 'multiplayer') {
        pause();
      }
      if (audio) {
        audio.stopMusic();
        audio.stopFileMusic();
      }
    } else {
      last = performance.now(); // Reset delta clock to prevent jump on tab focus
      if (state === State.PLAYING && settings.music && audio) {
        playBackgroundMusic();
      } else if (state === State.MENU && settings.music && audio) {
        audio.lobbyMusic();
      }
    }
  });

  function loop(t) {
    // 1. Consistent DeltaTime calculation across 60Hz/90Hz/120Hz/144Hz displays
    if(!last) last = t;
    const rawDt = (t - last) / 1000;
    const dt = Math.min(0.033, Math.max(0.001, rawDt));
    last = t;

    // FPS Meter (Internal accumulator)
    _fpsFrameCount++;
    if(t - _fpsLastCheck >= 1000) {
      _currentCalculatedFPS = (_fpsFrameCount * 1000) / (t - _fpsLastCheck);
      _fpsFrameCount = 0;
      _fpsLastCheck = t;
    }

    try {
      update(dt);
    } catch(err) {
      _showErrBanner('UPDATE ERROR: ' + err.message + '\n' + (err.stack || '').split('\n').slice(0,3).join('\n'));
      console.error('Update error:', err);
    }
    try {
      render();
    } catch(err) {
      _showErrBanner('RENDER ERROR: ' + err.message + '\n' + (err.stack || '').split('\n').slice(0,3).join('\n'));
      console.error('Render error:', err);
    }
    requestAnimationFrame(loop);
  }

  // Global uncaught error handler to catch init failures
  window.addEventListener('error', function(e) {
    _showErrBanner('JS ERROR: ' + e.message + '\n  at ' + (e.filename || '') + ':' + e.lineno);
  });

  // Auto Request Fullscreen and Lock Landscape on First User Gesture
  function requestAutoLandscapeFullscreen() {
    try {
      const docEl = document.documentElement;
      const req = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
      if(req && !document.fullscreenElement && !document.webkitFullscreenElement) {
        const p = req.call(docEl);
        if(p && p.catch) p.catch(() => {});
      }
      if(screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      }
    } catch(_) {}
  }

  function checkOrientationPrompt() {
    const prompt = document.getElementById('rotatePrompt');
    if(!prompt) return;
    const isMobilePortrait = window.innerWidth < window.innerHeight && window.innerWidth <= 768;
    prompt.classList.toggle('hidden', !isMobilePortrait);
  }

  window.addEventListener('resize', checkOrientationPrompt);
  window.addEventListener('orientationchange', checkOrientationPrompt);
  setTimeout(checkOrientationPrompt, 200);

  const rotateBtn = document.getElementById('rotateFullscreenBtn');
  if(rotateBtn) {
    rotateBtn.addEventListener('click', () => {
      requestAutoLandscapeFullscreen();
      setTimeout(checkOrientationPrompt, 300);
    });
  }

  // Standard Game Splash Screen Controller (App Logo -> Dev Studio Logo)
  function initSplashScreen() {
    const splash = document.getElementById('appSplashScreen');
    if(!splash) return;

    // Jika auto-refresh / skip requested, langsung lewati splash screen tanpa animasi
    let shouldSkipSplash = false;
    try {
      shouldSkipSplash = sessionStorage.getItem('feather_skip_splash') === '1' || window.location.search.includes('skip_splash=1');
      sessionStorage.removeItem('feather_skip_splash');
    } catch(e){}

    if(shouldSkipSplash) {
      splash.style.display = 'none';
      requestAutoLandscapeFullscreen();
      checkOrientationPrompt();
      if(settings.music && audio) {
        audio.lobbyMusic();
      }
      return;
    }

    const stageApp = document.getElementById('splashStageApp');
    const stageDev = document.getElementById('splashStageDev');

    let isDone = false;
    let timer1 = null;
    let timer2 = null;

    function finishSplash() {
      if(isDone) return;
      isDone = true;
      requestAutoLandscapeFullscreen();
      clearTimeout(timer1);
      clearTimeout(timer2);

      splash.classList.add('fade-out');
      setTimeout(() => {
        splash.style.display = 'none';
        checkOrientationPrompt();
        if(settings.music && audio) {
          audio.lobbyMusic();
        }
      }, 500);
    }

    // Switch from App Logo to Dev Studio Logo after 1.3s
    timer1 = setTimeout(() => {
      if(isDone) return;
      if(stageApp) stageApp.classList.remove('active');
      if(stageDev) stageDev.classList.add('active');
    }, 1300);

    // Auto finish splash after 2.8s and reveal lobby
    timer2 = setTimeout(() => {
      finishSplash();
    }, 2800);

    // Tap anywhere on splash to skip immediately & trigger fullscreen landscape
    splash.addEventListener('click', () => {
      finishSplash();
    });

    // Also trigger on first global touch
    window.addEventListener('touchstart', function onFirstTouch() {
      requestAutoLandscapeFullscreen();
      window.removeEventListener('touchstart', onFirstTouch);
    }, { passive: true });
  }



  // Native Fullscreen Toggle Controller
  const fsBtn = document.getElementById('fullscreenToggleBtn');
  if (fsBtn) {
    fsBtn.onclick = () => {
      if (window.audio && typeof window.audio.click === 'function') window.audio.click();
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
          docEl.requestFullscreen().catch(() => {});
        } else if (docEl.webkitRequestFullscreen) {
          docEl.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    };
  }

  // =========================================================
  // LUCKY BIRD GACHA SYSTEM (PULLS, WEIGHTS & INVENTORY SYNC)
  // =========================================================
  
  // =========================================================
  // LUCKY BIRD GACHA SYSTEM (PULLS, WEIGHTS & INVENTORY SYNC)
  // =========================================================
  const gachaPool = [
    // Mythic Tier (2%)
    { type:'skin', id:'goku_ssj', name:'Super Saiyan Goku', rarity:'mythic' },
    { type:'skin', id:'gojo_bird', name:'Honored One Gojo', rarity:'mythic' },
    { type:'skin', id:'tanjiro_bird', name:'Demon Slayer Bird', rarity:'mythic' },
    { type:'aura', id:'gear_fifth', name:'Sun God Nika Gear 5', rarity:'mythic' },
    { type:'aura', id:'domain_expansion', name:'Domain Infinity Void', rarity:'mythic' },
    // Legendary Tier (10%)
    { type:'skin', id:'phoenix', name:'Phoenix Fire', rarity:'legendary' },
    { type:'skin', id:'angel', name:'Holy Angel', rarity:'legendary' },
    { type:'skin', id:'dragon', name:'Flame Dragon', rarity:'legendary' },
    { type:'aura', id:'golden', name:'Golden Dust Aura', rarity:'legendary' },
    { type:'hat', id:'crown', name:'Royal Crown', rarity:'legendary' },
    // Epic Tier (18%)
    { type:'skin', id:'cyber', name:'Cyber Neon', rarity:'epic' },
    { type:'skin', id:'mecha', name:'Mecha Cyborg', rarity:'epic' },
    { type:'aura', id:'galaxy', name:'Cosmic Galaxy Aura', rarity:'epic' },
    { type:'aura', id:'neon', name:'Electric Lightning', rarity:'epic' },
    { type:'hat', id:'pirate', name:'Pirate Captain Hat', rarity:'epic' },
    // Rare Tier (30%)
    { type:'skin', id:'rose', name:'Rose Pink Bird', rarity:'rare' },
    { type:'skin', id:'mint', name:'Mint Green Bird', rarity:'rare' },
    { type:'skin', id:'night', name:'Night Sky Bird', rarity:'rare' },
    { type:'aura', id:'fire', name:'Fire Blaze Aura', rarity:'rare' },
    { type:'hat', id:'tophat', name:'Magic Top Hat', rarity:'rare' },
    { type:'hat', id:'cowboy', name:'Cowboy Leather', rarity:'rare' },
    // Common Tier (40%)
    { type:'coins', id:'coin_pack', name:'Kantong 40 Koin', rarity:'common', amount:40 },
    { type:'coins', id:'coin_jackpot', name:'Pundi 60 Koin', rarity:'common', amount:60 },
    { type:'hat', id:'cap', name:'Baseball Snapback', rarity:'common' },
    { type:'hat', id:'party', name:'Party Cone Hat', rarity:'common' },
    { type:'hat', id:'beanie', name:'Winter Beanie', rarity:'common' }
  ];

  function openGachaModal() {
    audio.click();
    const gModal = $('gachaModal') || $('skyPassGachaModal');
    const uCoins = $('gachaUserCoins') || $('spUserCoins');
    if(uCoins) uCoins.textContent = progress.coins;
    showModal(gModal);
  }
  window.openGachaModal = openGachaModal;

  function pickRandomGachaItem() {
    const roll = Math.random() * 100;
    let targetRarity = 'common';
    if(roll < 2.5) targetRarity = 'mythic';
    else if(roll < 12.5) targetRarity = 'legendary';
    else if(roll < 30.5) targetRarity = 'epic';
    else if(roll < 60) targetRarity = 'rare';
    else targetRarity = 'common';

    const pool = gachaPool.filter(item => item.rarity === targetRarity);
    if(pool.length === 0) return gachaPool[0];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function performGachaPull(count, isFree) {
    const singleCost = 50;
    const multiCost = 450;
    const totalCost = count === 1 ? (isFree ? 0 : singleCost) : multiCost;

    if(!isFree && progress.coins < totalCost) {
      if(audio) audio.hit();
      const kekurangan = totalCost - progress.coins;
      showGameDialog({
        title: 'Koin Tidak Cukup',
        html: `
          <p>Koin Anda kurang <b>${kekurangan} Koin</b> untuk melakukan tarikan gacha!</p>
          <div class="dialog-info-card">
            <div class="dialog-info-row"><span>Dibutuhkan:</span><b>${totalCost} Koin</b></div>
            <div class="dialog-info-row"><span>Saldo Anda:</span><b style="color:#f87171;">${progress.coins} Koin</b></div>
          </div>
          <p style="font-size:12px;color:#38bdf8;margin-top:8px;font-weight:bold;">Tonton video singkat untuk mendapatkan +50 Koin Gratis sekarang?</p>
        `,
        type: 'coin',
        confirmText: 'TAMBAH KOIN (+50) 🪙',
        cancelText: 'BATAL',
        showCancel: true
      }).then(confirmed => {
        if(confirmed) {
          showLobbyAdmobRewardModal(() => {
            const uCoins = $('gachaUserCoins') || $('spUserCoins');
            if(uCoins) uCoins.textContent = progress.coins;
          });
        }
      });
      return;
    }

    if(!isFree) {
      progress.coins = Math.max(0, progress.coins - totalCost);
      progress.coinsUpdatedAt = Date.now();
      updateCoins();
      persistProgress();
      if(typeof saveCloudSave === 'function') saveCloudSave();
      const uCoins = $('gachaUserCoins') || $('spUserCoins');
      if(uCoins) uCoins.textContent = progress.coins;
    }

    audio.win();
    const results = [];
    for(let i = 0; i < count; i++) {
      const item = pickRandomGachaItem();
      let isNew = false;

      if(item.type === 'coins') {
        progress.coins += item.amount;
        isNew = true;
      } else {
        const unlockedKey = item.type === 'skin' ? 'unlocked' : (item.type + 'Unlocked');
        if(!Array.isArray(progress[unlockedKey])) progress[unlockedKey] = [];
        
        if(!progress[unlockedKey].includes(item.id)) {
          progress[unlockedKey].push(item.id);
          isNew = true;
        } else {
          // Duplicate compensation
          progress.coins += 25;
          isNew = false;
        }
      }
      results.push({ ...item, isNew });
    }

    progress.coinsUpdatedAt = Date.now();
    updateCoins();
    persistProgress();
    if(typeof saveCloudSave === 'function') saveCloudSave();
    renderGachaResults(results);
  }
  window.performGachaPull = performGachaPull;

  function triggerGachaFreeAd() {
    if(window.AdMobConfig && typeof window.AdMobConfig.showRewardAd === 'function') {
      window.AdMobConfig.showRewardAd(() => {
        performGachaPull(1, true);
      });
    } else {
      performGachaPull(1, true);
    }
  }
  window.triggerGachaFreeAd = triggerGachaFreeAd;

  function getGachaItemSvg(item) {
    if(!item) return '<svg viewBox="0 0 24 24" width="28" height="28" fill="#fbbf24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    if(item.type === 'coins') {
      return '<svg viewBox="0 0 24 24" width="28" height="28"><circle cx="12" cy="12" r="9" fill="#f59e0b"/><circle cx="12" cy="12" r="6" fill="#fbbf24"/><text x="12" y="15.5" font-size="10" font-weight="900" text-anchor="middle" fill="#78350f" font-family="Arial">G</text></svg>';
    }
    if(item.type === 'skin') {
      return '<svg viewBox="0 0 24 24" width="28" height="28" fill="#38bdf8"><path d="M22 2C14 2 8 8 8 16c0 1.1.9 2 2 2h1c0-1.1.9-2 2-2 1.66 0 3-1.34 3-3V9c2 0 4-1 6-7z"/></svg>';
    }
    if(item.type === 'hat') {
      return '<svg viewBox="0 0 24 24" width="28" height="28" fill="#c084fc"><path d="M5 16V9a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v7h2a1 1 0 0 1 1 1v2H2v-2a1 1 0 0 1 1-1h2z"/></svg>';
    }
    if(item.type === 'aura') {
      return '<svg viewBox="0 0 24 24" width="28" height="28" fill="#f43f5e"><path d="M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6z"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" width="28" height="28" fill="#fbbf24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
  }

  function renderGachaResults(results) {
    const resModal = $('gachaResultModal');
    const grid = $('gachaCardsGrid');
    if(!grid) return;
    grid.innerHTML = '';

    results.forEach(res => {
      const card = document.createElement('div');
      card.className = `gacha-card-item ${res.rarity}`;
      card.innerHTML = `
        <div class="gacha-card-icon">${getGachaItemSvg(res)}</div>
        <div class="gacha-card-name" title="${res.name}">${res.name}</div>
        <div class="gacha-card-tag ${res.isNew ? 'new' : 'dup'}">${res.isNew ? 'BARU!' : '+25 KOIN'}</div>
      `;
      grid.appendChild(card);
    });

    closeModal();
    setTimeout(() => {
      showModal(resModal);
      audio.win();
    }, 120);
  }

  // Bind Gacha Buttons explicitly
  bindClick('lobbyGachaBtn', openGachaModal);
  bindClick('mlbbGachaCard', openGachaModal);
  bindClick('gachaPull1Btn', () => performGachaPull(1, false));
  bindClick('gachaPull10Btn', () => performGachaPull(10, false));
  bindClick('gachaPullFreeBtn', triggerGachaFreeAd);
  bindClick('gachaAddCoinsBtn', () => {
    showLobbyAdmobRewardModal(() => {
      const uCoins = $('gachaUserCoins') || $('spUserCoins');
      if(uCoins) uCoins.textContent = progress.coins;
    });
  });


  try {
    setMode('classic', true);
    syncSettings();
    syncGPProfileUI();
    renderAvatarPickerGrid();
    syncLeaderboardFromFirebase();
    updateCoins();
    renderShop();
    reset();
    setState(State.MENU);
    updateScore();
    updateMusicUI();
    initSplashScreen();
    requestAnimationFrame(loop);
  } catch(initErr) {
    _showErrBanner('INIT ERROR: ' + initErr.message + '\n' + (initErr.stack || '').split('\n').slice(0,4).join('\n'));
    console.error('Init error:', initErr);
    // Pastikan splash screen tertutup jika ada error
    try {
      const sp = document.getElementById('appSplashScreen');
      if (sp) sp.style.display = 'none';
    } catch(e) {}
    requestAnimationFrame(loop);
  }

})();
