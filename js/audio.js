/**
 * =========================================================
 * FEATHER RUSH: WEB AUDIO API SYNTHESIZER & AUDIO MANAGER
 * =========================================================
 */

(function(window) {
  'use strict';

  const audio = {
    ctx: null,
    musicTimer: null,
    deathTimer: null,
    currentAudioElem: null,
    previewAudioElem: null,
    previewTimer: null,
    previewTrackId: null,
    currentMusicType: null,

    init() {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    },

    playAudioFile(filename, loop = true, volume = 0.45, isPreview = false) {
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
      const s = window.settings || { sound: true };
      if(!s.sound) return;
      this.playTone(freq, dur, type, volume, slide);
    },

    playTone(freq, dur, type, volume, slide=0) {
      try {
        this.init();
        if(!this.ctx) return;
        const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(Math.max(20, freq), t);
        if(slide !== 0) {
          o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
        }
        // Smooth click-free ADSR Envelope
        const attack = Math.min(0.015, dur * 0.15);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(volume, t + attack);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        o.connect(g).connect(this.ctx.destination);
        o.start(t);
        o.stop(t + dur);
        // Memory-leak prevention: disconnect audio nodes on completion
        o.onended = () => {
          try {
            o.disconnect();
            g.disconnect();
          } catch(e) {}
        };
      } catch(_) {}
    },

    flap() { this.tone(520, .07, 'triangle', .035, 180); },
    score() { this.tone(760, .13, 'sine', .05, 260); },
    coin() { this.tone(980, .14, 'sine', .05, 350); },
    hit() { this.tone(130, .2, 'sawtooth', .06, -70); },
    click() { this.tone(360, .045, 'square', .025, 70); },
    win() { this.tone(660, .16, 'triangle', .05, 500); },

    // 3.. 2.. 1.. GO! Countdown Chime & Fanfare
    countdownBeep(count) {
      const s = window.settings || { sound: true };
      if(!s.sound) return;
      const freq = count === 3 ? 440 : (count === 2 ? 493.88 : 554.37);
      this.playTone(freq, 0.24, 'triangle', 0.12, 0);
      this.playTone(freq * 2, 0.18, 'sine', 0.06, 0);
    },

    countdownGo() {
      const s = window.settings || { sound: true };
      if(!s.sound) return;
      const goNotes = [880, 1108.73, 1318.51, 1760];
      goNotes.forEach((f, i) => {
        setTimeout(() => {
          this.playTone(f, 0.5, 'triangle', 0.14, 20);
          this.playTone(f * 0.5, 0.45, 'sine', 0.09, 0);
          this.playTone(f * 1.5, 0.38, 'square', 0.04, 10);
        }, i * 18);
      });
    },
    
    // Power-up & Skill Sound Effects & Jingles
    powerup(type) {
      const s = window.settings || { sound: true };
      if(!s.sound) return;
      if(type === 'star') {
        const notes = [523, 659, 784, 1046, 1318, 1568, 2093];
        notes.forEach((f, i) => {
          setTimeout(() => {
            this.playTone(f, 0.16, 'square', 0.05, 10);
            this.playTone(f * 0.5, 0.14, 'triangle', 0.035, 0);
          }, i * 38);
        });
      } else if(type === 'shield') {
        const notes = [440, 554, 659, 880, 1108];
        notes.forEach((f, i) => {
          setTimeout(() => {
            this.playTone(f, 0.28, 'sine', 0.055, 0);
            this.playTone(f * 1.5, 0.18, 'triangle', 0.03, 10);
          }, i * 45);
        });
      } else if(type === 'slow') {
        const notes = [1046, 880, 784, 659, 523, 440];
        this.playTone(130, 0.6, 'sine', 0.07, -40);
        notes.forEach((f, i) => {
          setTimeout(() => {
            this.playTone(f, 0.25, 'triangle', 0.05, -30);
            this.playTone(f * 2, 0.1, 'sine', 0.025, 0);
          }, i * 50);
        });
      } else if(type === 'magnet') {
        const notes = [330, 440, 554, 659, 880, 1108];
        notes.forEach((f, i) => {
          setTimeout(() => {
            this.playTone(f, 0.12, 'sawtooth', 0.035, 60);
            this.playTone(f, 0.15, 'sine', 0.05, 30);
          }, i * 35);
        });
      } else if(type === 'rocket') {
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
      const s = window.settings || { sound: true };
      if(!s.sound) return;
      const notes = [440, 554, 659, 880, 1108, 1318, 1760];
      notes.forEach((f, i) => {
        setTimeout(() => {
          this.playTone(f, 0.28, 'triangle', 0.06, 50);
          this.playTone(f * 1.5, 0.2, 'sine', 0.04, 0);
        }, i * 40);
      });
    },

    birdChirp(skinId) {
      const s = window.settings || { sound: true };
      if(!s.sound) return;
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
        this.playTone(784, 0.08, 'sine', 0.045, 150);
        setTimeout(() => this.playTone(1174, 0.1, 'triangle', 0.04, 100), 40);
      }
    },

    rocketSmash() {
      const s = window.settings || { sound: true };
      if(!s.sound) return;
      this.playTone(180, 0.18, 'sawtooth', 0.08, -80);
      this.playTone(340, 0.12, 'square', 0.05, -120);
      setTimeout(() => this.playTone(880, 0.1, 'triangle', 0.05, 200), 20);
    },

    shieldBreak() {
      const s = window.settings || { sound: true };
      if(!s.sound) return;
      this.playTone(880, 0.08, 'sawtooth', 0.06, -300);
      setTimeout(() => this.playTone(320, 0.18, 'triangle', 0.07, -150), 40);
    },

    thunder() {
      const s = window.settings || { sound: true };
      if(!s.sound) return;
      this.playTone(180, 0.35, 'sawtooth', 0.08, -120);
      setTimeout(() => this.playTone(70, 0.5, 'sine', 0.09, -30), 50);
    },

    enemyAlert() {
      const s = window.settings || { sound: true };
      if(!s.sound) return;
      this.playTone(480, 0.1, 'sawtooth', 0.025, -100);
    },

    dash() {
      const s = window.settings || { sound: true };
      if(!s.sound) return;
      this.playTone(280, 0.18, 'sawtooth', 0.08, 600);
      this.playTone(1320, 0.2, 'sine', 0.06, -300);
      this.playTone(90, 0.35, 'triangle', 0.08, -50);
    },

    dashReady() {
      const s = window.settings || { sound: true };
      if(!s.sound) return;
      this.playTone(1046, 0.08, 'triangle', 0.035, 100);
      setTimeout(() => this.playTone(1568, 0.1, 'sine', 0.03, 50), 35);
    },

    babyChirp() {
      const s = window.settings || { sound: true };
      if(!s.sound) return;
      this.playTone(1568, 0.08, 'sine', 0.045, 300);
      setTimeout(() => this.playTone(2093, 0.1, 'triangle', 0.04, 200), 35);
    },

    babyAttack() {
      const s = window.settings || { sound: true };
      if(!s.sound) return;
      this.playTone(880, 0.06, 'sawtooth', 0.055, 400);
      this.playTone(1760, 0.12, 'sine', 0.045, -200);
      setTimeout(() => this.playTone(1320, 0.1, 'triangle', 0.04, 150), 30);
    },

    deathMusic() {
      const s = window.settings || { sound: true };
      if(!s.sound) return;
      clearInterval(this.deathTimer);
      const prog = window.progress || { selected: 'classic' };
      const skinId = prog.selected || 'classic';
      let step = 0;

      if(skinId === 'classic') {
        const notes = [523, 494, 440, 349, 262, 196];
        this.playTone(notes[0], .2, 'square', .055, -20);
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .22, 'square', .05, step === notes.length - 1 ? -60 : -15);
        }, 160);
      } else if(skinId === 'rose') {
        const notes = [880, 784, 659, 587, 523, 440, 392, 330];
        this.playTone(notes[0], .35, 'sine', .065, 0);
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .35, 'sine', .055, 0);
          if(step % 2 === 0) this.playTone(notes[step] * 1.5, .2, 'triangle', .025, 0);
        }, 130);
      } else if(skinId === 'mint') {
        const notes = [659, 523, 659, 784, 880, 659, 392, 330, 262];
        this.playTone(notes[0], .15, 'triangle', .06, 30);
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .18, 'triangle', .055, step % 2 === 0 ? 40 : -30);
        }, 140);
      } else if(skinId === 'night') {
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
        const notes = [349, 440, 523, 698, 880, 1047, 1318];
        this.playTone(notes[0], .2, 'triangle', .06, 20);
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .25, 'sawtooth', .05, step === notes.length - 1 ? -100 : 30);
          this.playTone(notes[step] / 2, .3, 'triangle', .04, 0);
        }, 150);
      } else if(skinId === 'mecha') {
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
        this.playTone(293, .6, 'sine', .065, -60);
        this.playTone(146, .8, 'triangle', .08, -35);
        const notes = [587, 523, 466, 392, 349, 293, 233, 174, 116, 58];
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .38, 'sawtooth', .042, -20);
          this.playTone(notes[step] * 0.707, .42, 'sine', .048, -10);
        }, 145);
      } else if(skinId === 'goku_ssj') {
        // Super Saiyan Ki Depletion & Epic Defeat Brass
        this.playTone(784, .3, 'sawtooth', .08, -100);
        this.playTone(196, .5, 'sawtooth', .09, -40);
        const notes = [784, 740, 659, 587, 523, 440, 392, 330, 220, 110];
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .28, 'sawtooth', .06, -30);
          this.playTone(notes[step] * 1.5, .15, 'square', .035, 10);
        }, 130);
      } else if(skinId === 'gojo_bird') {
        // Celestial Void / Limitless Hollow Resonance
        this.playTone(1760, .45, 'sine', .07, -400);
        this.playTone(440, .6, 'sine', .08, 0);
        const notes = [1396, 1244, 1046, 880, 698, 587, 440, 349, 220];
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .4, 'sine', .065, 0);
          this.playTone(notes[step] * 2, .25, 'triangle', .03, 10);
        }, 140);
      } else if(skinId === 'naruto_bird') {
        // Shinobi Sadness and Sorrow Bamboo Flute Cadence
        this.playTone(659, .35, 'triangle', .07, 0);
        const notes = [659, 587, 523, 440, 392, 330, 293, 220];
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .38, 'triangle', .065, step === notes.length - 1 ? -40 : 0);
          if(step % 2 === 1) this.playTone(notes[step] / 2, .4, 'sine', .04, 0);
        }, 160);
      } else if(skinId === 'tanjiro_bird') {
        // Hinokami Kagura Flame Extinguish & Koto Defeat Melody
        this.playTone(880, .25, 'sawtooth', .065, 20);
        const notes = [880, 784, 698, 659, 587, 523, 440, 349, 262];
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .3, 'triangle', .06, -15);
          this.playTone(notes[step] * 0.75, .2, 'sine', .035, 0);
        }, 145);
      } else if(skinId === 'luffy_bird') {
        // Cartoon Rubber Stretch & Snap Boing Defeat
        this.playTone(330, .15, 'sine', .08, 200);
        setTimeout(() => this.playTone(660, .2, 'triangle', .08, -350), 120);
        const notes = [587, 523, 440, 392, 330, 262, 196, 131];
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .2, 'square', .05, step % 2 === 0 ? 50 : -60);
        }, 130);
      } else {
        // Default Comic Retro Descending Jingle
        const notes = [523, 494, 440, 349, 262, 196];
        this.playTone(notes[0], .2, 'square', .055, -20);
        this.deathTimer = setInterval(() => {
          step++;
          if(step >= notes.length) { clearInterval(this.deathTimer); this.deathTimer = null; return; }
          this.playTone(notes[step], .22, 'square', .05, step === notes.length - 1 ? -60 : -15);
        }, 160);
      }
    },

    lobbyMusic() {
      const s = window.settings || { music: true };
      if(!s.music) return;
      if(this.currentMusicType === 'lobby' && (this.musicTimer || this.currentAudioElem)) return;
      this.stopMusic();
      this.currentMusicType = 'lobby';
      this.init();

      const aud = this.playAudioFile('lobby_ghibli.webm', true, 0.40);
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
      const ghibliLead = [
        587, 0, 659, 740, 880, 0, 740, 659,
        587, 0, 740, 880, 988, 0, 880, 0,
        494, 0, 587, 740, 880, 0, 988, 1175,
        880, 0, 740, 0, 587, 0, 0, 0,
        740, 0, 880, 0, 988, 0, 1175, 0,
        988, 0, 880, 0, 740, 0, 659, 0,
        587, 0, 659, 0, 740, 0, 880, 0,
        659, 0, 587, 0, 494, 0, 0, 0,
        494, 0, 587, 0, 740, 0, 880, 0,
        988, 0, 880, 0, 740, 0, 659, 0,
        587, 0, 740, 0, 880, 0, 1175, 0,
        880, 0, 740, 0, 587, 0, 0, 0
      ];

      const ghibliChords = [
        [294, 370, 440, 554],
        [392, 494, 587, 740],
        [370, 440, 554, 659],
        [247, 294, 370, 440],
        [330, 392, 494, 587],
        [220, 277, 330, 440],
        [294, 370, 440, 554],
        [294, 440, 587, 0]
      ];

      const ghibliBass = [
        147, 196, 185, 123, 165, 110, 147, 147,
        196, 185, 123, 165, 110, 147, 196, 147
      ];

      this.musicTimer = setInterval(() => {
        const state = window.gameState || 'menu';
        if(state !== 'menu') return;
        const totalSteps = ghibliLead.length;
        const curStep = step % totalSteps;

        const leadNote = ghibliLead[curStep];
        const chordIndex = Math.floor(curStep / 6) % ghibliChords.length;
        const chord = ghibliChords[chordIndex];
        const bassNote = ghibliBass[Math.floor(curStep / 3) % ghibliBass.length];

        if(leadNote) {
          this.playTone(leadNote, 0.45, 'sine', 0.032, 0);
          this.playTone(leadNote * 0.5, 0.35, 'triangle', 0.015, 0);
        }
        if(curStep % 6 === 0 && chord) {
          chord.forEach(freq => {
            if(freq) this.playTone(freq, 0.65, 'sine', 0.012, 0);
          });
        }
        if(curStep % 3 === 0 && bassNote) {
          this.playTone(bassNote, 0.7, 'sine', 0.035, 0);
        }
        if(curStep % 12 === 6) {
          this.playTone(1760, 0.3, 'sine', 0.008, 0);
        }
        step++;
      }, 260);
    },

    gameMusic() {
      const s = window.settings || { music: true };
      if(!s.music) return;
      if(this.currentMusicType === 'game' && (this.musicTimer || this.currentAudioElem)) return;
      this.stopMusic();
      this.currentMusicType = 'game';
      const prog = window.progress || {};
      const trackId = prog.selectedMusic || 'happy';
      this.init();

      const animeAudioMap = {
        'gurenge': 'gurenge.wav',
        'blue_bird': 'blue_bird.wav',
        'we_are': 'we_are.wav',
        'sparkle': 'sparkle.wav'
      };

      if(animeAudioMap[trackId]) {
        const aud = this.playAudioFile(animeAudioMap[trackId], true, 0.45);
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
          const state = window.gameState || 'playing';
          if(state !== 'playing' && state !== 'ready') return;
          const note = melody[step % melody.length];
          const low = bass[step % bass.length];
          if(note) this.playTone(note, .14, 'triangle', .028);
          if(low) this.playTone(low, .18, 'sine', .032);
          if(step % 4 === 2) this.playTone(1200, .035, 'square', .009);
          if(step % 8 === 4) this.playTone(240, .05, 'triangle', .02, -80);
          step++;
        }, 135);
      } else if(trackId === 'bounce') {
        const melody = [659, 784, 880, 784, 659, 784, 1047, 880, 988, 880, 784, 880, 659, 784, 880, 1047, 1174, 1047, 880, 784, 659, 784, 880, 988, 1047, 880, 784, 659, 587, 659, 784, 880];
        const bass = [220, 220, 175, 175, 196, 196, 165, 165, 220, 220, 175, 175, 196, 196, 247, 247];
        this.musicTimer = setInterval(() => {
          const state = window.gameState || 'playing';
          if(state !== 'playing' && state !== 'ready') return;
          const note = melody[step % melody.length], low = bass[step % bass.length];
          if(note) this.playTone(note, .14, 'square', .02);
          if(low) this.playTone(low, .22, 'sawtooth', .028, -20);
          if(step % 2 === 1) this.playTone(800, .04, 'sawtooth', .012, -400);
          step++;
        }, 140);
      } else if(trackId === 'arcade') {
        const melody = [392, 523, 659, 784, 659, 523, 440, 523, 587, 698, 880, 1047, 880, 698, 587, 659, 784, 1047, 1318, 1047, 784, 659, 523, 659, 880, 1047, 1174, 1318, 1568, 1318, 1047, 784];
        const bass = [98, 131, 110, 147, 131, 165, 110, 147];
        this.musicTimer = setInterval(() => {
          const state = window.gameState || 'playing';
          if(state !== 'playing' && state !== 'ready') return;
          const note = melody[step % melody.length], low = bass[Math.floor(step / 2) % bass.length];
          if(note) this.playTone(note, .11, 'square', .024, step % 3 === 0 ? 20 : 0);
          if(low && step % 2 === 0) this.playTone(low, .18, 'triangle', .03);
          if(step % 4 === 0) this.playTone(1500, .03, 'square', .01);
          step++;
        }, 125);
      } else if(trackId === 'chill') {
        const chords = [
          [440, 523, 659], [392, 494, 587], [349, 440, 523], [330, 392, 494],
          [349, 440, 523, 659], [392, 494, 587, 698], [440, 523, 659, 784], [330, 392, 494, 587]
        ];
        const bass = [110, 98, 87, 82, 87, 98, 110, 82];
        this.musicTimer = setInterval(() => {
          const state = window.gameState || 'playing';
          if(state !== 'playing' && state !== 'ready') return;
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
        const melody = [523, 659, 784, 1047, 880, 1047, 1318, 1047, 784, 880, 1047, 1318, 1568, 1318, 1047, 784, 523, 659, 784, 1047, 1174, 1047, 880, 784, 659, 784, 880, 1047, 1174, 1318, 1568, 1047];
        const brassBass = [131, 165, 196, 262, 220, 262, 330, 262, 196, 220, 262, 330, 392, 330, 262, 196];
        this.musicTimer = setInterval(() => {
          const state = window.gameState || 'playing';
          if(state !== 'playing' && state !== 'ready') return;
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
        const melody = [440, 523, 587, 659, 784, 659, 587, 523, 440, 587, 659, 784, 880, 784, 659, 587, 659, 784, 880, 1047, 880, 784, 659, 587, 440, 523, 659, 587, 523, 440, 392, 440];
        const cyberBass = [110, 110, 131, 110, 147, 110, 165, 131, 110, 110, 131, 110, 175, 165, 147, 131];
        this.musicTimer = setInterval(() => {
          const state = window.gameState || 'playing';
          if(state !== 'playing' && state !== 'ready') return;
          const note = melody[step % melody.length], low = cyberBass[step % cyberBass.length];
          if(note) this.playTone(note, .12, 'square', .022, step % 2 === 0 ? 15 : -15);
          if(low) this.playTone(low, .16, 'sawtooth', .034, -20);
          if(step % 2 === 1) this.playTone(950, .035, 'sawtooth', .014, -500);
          if(step % 4 === 0) this.playTone(70, .12, 'triangle', .04, -30);
          step++;
        }, 135);
      }
    },

    multiplayerMusic() {
      const s = window.settings || { music: true };
      if(!s.music) return;
      if(this.currentMusicType === 'multiplayer' && (this.musicTimer || this.currentAudioElem)) return;
      this.stopMusic();
      this.currentMusicType = 'multiplayer';
      this.init();

      const aud = this.playAudioFile('nyan_cat.wav', true, 0.45);
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
      const melodyScore = [
        740, 831, 622, 622, 494, 587, 554, 494,
        494, 554, 587, 587, 554, 494, 554, 622,
        740, 831, 622, 740, 554, 622, 494, 554,
        494, 622, 740, 831, 622, 740, 554, 622,
        494, 587, 622, 587, 554, 494, 554, 587,
        494, 587, 622, 740, 554, 622, 554, 494, 554, 494, 0, 0
      ];
      const bassScore = [
        123, 123, 92, 92, 104, 104, 78, 78,
        82, 82, 123, 123, 138, 138, 92, 92
      ];

      this.musicTimer = setInterval(() => {
        const state = window.gameState || 'playing';
        if(state !== 'playing' && state !== 'ready') return;
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
      }, 108);
    },

    music() {
      const mode = window.currentMode || 'classic';
      const state = window.gameState || 'menu';
      if(state === 'playing' || state === 'ready') {
        if(mode === 'multiplayer') {
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
      const s = window.settings || { sound: true, music: true };
      if(!s.sound && !s.music) return;
      this.init();
      this.previewTrackId = trackId;

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
        const aud = this.playAudioFile(animeAudioMap[trackId], true, 0.5, true);
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
      }
    },

    stopPreview() {
      clearInterval(this.previewTimer);
      this.stopPreviewFileMusic();
      this.previewTimer = null;
      this.previewTrackId = null;
      const s = window.settings || { music: true };
      const state = window.gameState || 'menu';
      if(state === 'menu' && s.music) {
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
      try {
        const bg = document.getElementById('bgMusic');
        if(bg) {
          bg.pause();
          bg.currentTime = 0;
        }
      } catch(_) {}
    }
  };

  // Export to Global
  window.GameAudio = audio;
  window.audio = audio;

})(window);

