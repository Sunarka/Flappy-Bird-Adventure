/**
 * FEATHER RUSH - PROFANITY & SARA FILTER
 * Sensor beberapa huruf saja menggunakan "*" untuk chat dan nama player.
 */
(function(window) {
  'use strict';

  function maskWord(word) {
    if (!word || typeof word !== 'string') return word || '';
    const len = word.length;
    if (len <= 2) {
      return len === 2 ? word[0] + '*' : '*';
    }
    if (len === 3) {
      return word[0] + '*' + word[2];
    }
    if (len === 4) {
      return word[0] + '**' + word[3];
    }
    if (len === 5) {
      return word[0] + '***' + word[4];
    }
    // Panjang >= 6: sisakan huruf pertama dan terakhir, sensor sisanya dengan '*'
    return word[0] + '*'.repeat(len - 2) + word[len - 1];
  }

  // Root words untuk toxic & SARA (Indonesia & English)
  const BAD_WORDS_ROOTS = [
    // Toxic / Kasar Indonesia
    'anjing', 'anjir', 'anjay', 'anjrit', 'bajingan', 'bangsat', 'babi', 'kontol',
    'memek', 'pantek', 'pepek', 'peler', 'titit', 'itil', 'jembut', 'ngentot',
    'ngewe', 'bokep', 'sange', 'colmek', 'lonte', 'perek', 'jablay', 'goblok',
    'tolol', 'bego', 'idiot', 'kampret', 'sialan', 'modar', 'mampus', 'picek', 'budek',
    'puki', 'pukimak',
    // SARA & Rasisme
    'kafir', 'murtad', 'negro', 'niggers', 'nigger', 'niggas', 'nigga', 'chink', 'tiko',
    // English Profanities
    'motherfucker', 'bullshit', 'asshole', 'bastard', 'fucker', 'fucking',
    'fuck', 'bitch', 'cunt', 'dick', 'pussy', 'slut', 'whore', 'retard'
  ];

  // Kata yang harus dicocokkan sebagai boundary / bukan bagian dari kata aman seperti "masukan", "pantai", dll
  const EXACT_OR_BOUNDARY_ROOTS = ['asu', 'tai', 'tek', 'spic', 'kike', 'coon'];

  // Regex fleksibel dengan leet-speak (a->[a4@], i->[i1!], o->[o0], e->[e3], u->[u*], s->[s$])
  const BAD_WORDS_REGEX_CHAT = new RegExp([
    // Word boundary patterns
    '\\b[a4@]+nj[i1!]+ng[a-z]*\\b',
    '\\b[a4@]+nj[i1!]+r[a-z]*\\b',
    '\\b[a4@]+nj[a4@]+y[a-z]*\\b',
    '\\b[a4@]+njr[i1!]+t\\b',
    '\\b[a4@]+s[u*]+\\b',
    '\\bb[a4@]+b[i1!]+\\b',
    '\\bb[a4@]+ngs[a4@]+t\\b',
    '\\bb[a4@]+j[i1!]+ng[a4@]+n\\b',
    '\\bk[o0]+nt[o0]+l[a-z]*\\b',
    '\\bm[e3]+m[e3]+k[a-z]*\\b',
    '\\bp[a4@]+nt[e3]+k[a-z]*\\b',
    '\\bp[e3]+p[e3]+k[a-z]*\\b',
    '\\bp[e3]+l[e3]+r[a-z]*\\b',
    '\\bt[i1!]+t[i1!]+t[a-z]*\\b',
    '\\b[i1!]+t[i1!]+l[a-z]*\\b',
    '\\bj[e3]+mb[u*]+t[a-z]*\\b',
    '\\bng[e3]+nt[o0]+t[a-z]*\\b',
    '\\bng[e3]+w[e3]+[a-z]*\\b',
    '\\bb[o0]+k[e3]+p[a-z]*\\b',
    '\\bs[a4@]+ng[e3]+[a-z]*\\b',
    '\\bc[o0]+l[i1!]+\\b',
    '\\bc[o0]+lm[e3]+k[a-z]*\\b',
    '\\bl[o0]+nt[e3]+[a-z]*\\b',
    '\\bp[e3]+r[e3]+k[a-z]*\\b',
    '\\bj[a4@]+bl[a4@]+y[a-z]*\\b',
    '\\bb[e3]+g[o0]+[a-z]*\\b',
    '\\bg[o0]+bl[o0]+k[a-z]*\\b',
    '\\bt[o0]+l[o0]+l[a-z]*\\b',
    '\\b[i1!]+d[i1!]+[o0]+t[a-z]*\\b',
    '\\bk[a4@]+mpr[e3]+t[a-z]*\\b',
    '\\bs[i1!]+[a4@]+l[a4@]+n[a-z]*\\b',
    '\\bt[a4@]+[i1!]+\\b',
    '\\bt[a4@]+[e3]+k\\b',
    '\\bm[o0]+d[a4@]+r\\b',
    '\\bm[a4@]+mp[u*]+s\\b',
    '\\bp[i1!]+c[e3]+k\\b',
    '\\bb[u*]+d[e3]+k\\b',
    '\\bp[u*]+k[i1!]+[a-z]*\\b',
    // SARA & Rasisme
    '\\bk[a4@]+f[i1!]+r[a-z]*\\b',
    '\\bm[u*]+rt[a4@]+d[a-z]*\\b',
    '\\bn[e3]+gr[o0]+[a-z]*\\b',
    '\\bn[i1!]+gg[e3]+r[a-z]*\\b',
    '\\bn[i1!]+gg[a4@]+[a-z]*\\b',
    '\\bt[i1!]+k[o0]+\\b',
    '\\bch[i1!]+nk[a-z]*\\b',
    // English Profanities
    '\\bm[o0]+th[e3]+rf[u*]+ck[e3]+r[a-z]*\\b',
    '\\bb[u*]+llsh[i1!]+t\\b',
    '\\b[a4@]+ssh[o0]+l[e3]+[a-z]*\\b',
    '\\bb[a4@]+st[a4@]+rd[a-z]*\\b',
    '\\bf[u*]+ck[e3]+r[a-z]*\\b',
    '\\bf[u*]+ck[i1!]+ng\\b',
    '\\bf[u*]+ck[a-z]*\\b',
    '\\bb[i1!]+tch[a-z]*\\b',
    '\\bsh[i1!]+t[a-z]*\\b',
    '\\bc[u*]+nt[a-z]*\\b',
    '\\bd[i1!]+ck[a-z]*\\b',
    '\\bp[u*]+ssy[a-z]*\\b',
    '\\bsl[u*]+t[a-z]*\\b',
    '\\bwh[o0]+r[e3]+[a-z]*\\b',
    '\\br[e3]+t[a4@]+rd[a-z]*\\b'
  ].join('|'), 'gi');

  // Regex khusus nama pemain (bisa berada di dalam gabungan kata seperti "AnjingPro" atau "BabiTerbang")
  const NAME_BAD_WORDS_REGEX = new RegExp(BAD_WORDS_ROOTS.map(w => {
    let pat = '';
    for (let i = 0; i < w.length; i++) {
      const c = w[i];
      if (c === 'a') pat += '[a4@]';
      else if (c === 'i') pat += '[i1!]';
      else if (c === 'o') pat += '[o0]';
      else if (c === 'e') pat += '[e3]';
      else if (c === 'u') pat += '[u*]';
      else if (c === 's') pat += '[s$]';
      else pat += c;
    }
    return pat;
  }).join('|'), 'gi');

  /**
   * Normalisasi leet-speak & karakter khusus
   */
  function normalizeText(text) {
    if (!text || typeof text !== 'string') return '';
    let s = text.toLowerCase();
    s = s.replace(/[@4]/g, 'a')
         .replace(/[1!|]/g, 'i')
         .replace(/[0]/g, 'o')
         .replace(/[3]/g, 'e')
         .replace(/[$5]/g, 's')
         .replace(/[7+]/g, 't')
         .replace(/[8]/g, 'b');
    return s;
  }

  /**
   * Cek apakah nama atau teks mengandung kata toxic / SARA (True/False)
   */
  function containsToxicOrSara(text) {
    if (!text || typeof text !== 'string') return false;
    const raw = text.toLowerCase().trim();
    if (!raw) return false;
    const norm = normalizeText(raw);
    const stripped = norm.replace(/[^a-z0-9]/g, '');

    // 1. Cek substring roots (AnjingPro, NIGGERS, dll)
    for (let i = 0; i < BAD_WORDS_ROOTS.length; i++) {
      const root = BAD_WORDS_ROOTS[i];
      if (norm.includes(root) || stripped.includes(root)) {
        return true;
      }
    }

    // 2. Cek boundary roots (asu, tai, tek, dll)
    for (let j = 0; j < EXACT_OR_BOUNDARY_ROOTS.length; j++) {
      const bRoot = EXACT_OR_BOUNDARY_ROOTS[j];
      const rx = new RegExp('(^|[^a-z])' + bRoot + '([^a-z]|$)', 'i');
      if (rx.test(norm) || rx.test(raw)) {
        return true;
      }
    }

    // 3. Cek regex patterns
    if (NAME_BAD_WORDS_REGEX.test(raw) || BAD_WORDS_REGEX_CHAT.test(raw)) {
      return true;
    }

    return false;
  }

  /**
   * Sensor teks chat: menyensor beberapa huruf kata toxic/sara menggunakan '*'
   */
  function sanitizeToxicText(text) {
    if (!text || typeof text !== 'string') return text || '';
    if (text.startsWith('[BIRD_EMOTE:')) return text;
    return text.replace(BAD_WORDS_REGEX_CHAT, match => maskWord(match));
  }

  /**
   * Sensor nama pemain (GamerTag): menyensor bagian kata toxic/sara dengan '*'
   */
  function sanitizePlayerName(name) {
    if (!name || typeof name !== 'string') return name || '';
    let result = name.replace(NAME_BAD_WORDS_REGEX, match => maskWord(match));
    result = result.replace(BAD_WORDS_REGEX_CHAT, match => maskWord(match));
    return result;
  }

  // Ekspor ke window global
  window.maskWord = maskWord;
  window.containsToxicOrSara = containsToxicOrSara;
  window.sanitizeToxicText = sanitizeToxicText;
  window.sanitizePlayerName = sanitizePlayerName;

})(typeof window !== 'undefined' ? window : this);
