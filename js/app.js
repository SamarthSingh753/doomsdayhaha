/**
 * MARVEL MULTIVERSE: ROAD TO DOOMSDAY // APP CONTROLLER
 * Full state persistence, sound synthesis, particle confetti, filters, and HUD
 */

(function () {
  'use strict';

  // --- STATE CONSTANTS & DEFAULTS ---
  const STORAGE_KEY = 'marvel_doomsday_checklist_v1';
  const PARTY_PROFILE_KEY = 'marvel_party_profile_v1';

  let state = {
    watched: new Set(),
    watchedEpisodes: new Set(),
    expandedSeries: new Set(),
    optional: new Set(),
    ratings: {},
    notes: {},
    activeCategory: 'all',
    activeStatus: 'all',
    activeType: 'all',
    searchQuery: '',
    sortBy: 'custom',
    viewMode: 'list', // Default to list view as requested
    theme: 'doom',
    soundEnabled: true,
    partyProfile: {
      id: 'hero_' + Math.random().toString(36).substring(2, 9),
      name: 'Doctor Doom',
      avatar: '🦾',
    },
  };

  // DOM Elements cache
  const elements = {
    checklistGrid: document.getElementById('checklistContainer'),
    circleProgress: document.getElementById('circleProgress'),
    circlePercent: document.getElementById('circlePercent'),
    progressBarFill: document.getElementById('progressBarFill'),
    statsWatchedCount: document.getElementById('statsWatchedCount'),
    statsTotalCount: document.getElementById('statsTotalCount'),
    statsRemainingCount: document.getElementById('statsRemainingCount'),
    statsHoursWatched: document.getElementById('statsHoursWatched'),
    nextUpBanner: document.getElementById('nextUpBanner'),
    searchInput: document.getElementById('searchInput'),
    searchClearBtn: document.getElementById('searchClearBtn'),
    sortSelect: document.getElementById('sortSelect'),
    filterTabsScroll: document.getElementById('filterTabsScroll'),
    resultsIndicator: document.getElementById('resultsIndicator'),
    themePills: document.querySelectorAll('.theme-pill'),
    soundToggleBtn: document.getElementById('soundToggleBtn'),
    viewListBtn: document.getElementById('viewListBtn'),
    viewCompactBtn: document.getElementById('viewCompactBtn'),
    viewCardsBtn: document.getElementById('viewCardsBtn'),
    viewDetailedBtn: document.getElementById('viewDetailedBtn'),
    randomPickBtn: document.getElementById('randomPickBtn'),
    exportBtn: document.getElementById('exportBtn'),
    resetBtn: document.getElementById('resetBtn'),
    notesModal: document.getElementById('notesModal'),
    notesTitle: document.getElementById('notesModalTitle'),
    notesTextarea: document.getElementById('notesTextarea'),
    saveNotesBtn: document.getElementById('saveNotesBtn'),
    closeNotesBtn: document.getElementById('closeNotesBtn'),
    exportModal: document.getElementById('exportModal'),
    exportTextarea: document.getElementById('exportTextarea'),
    closeExportBtn: document.getElementById('closeExportBtn'),
    copyExportBtn: document.getElementById('copyExportBtn'),
    importBtn: document.getElementById('importBtn'),
    importFileInput: document.getElementById('importFileInput'),
    // Doomsday Countdown Elements
    countdownDays: document.getElementById('countdownDays'),
    countdownHours: document.getElementById('countdownHours'),
    countdownMinutes: document.getElementById('countdownMinutes'),
    countdownSeconds: document.getElementById('countdownSeconds'),
    pacingTargetNum: document.getElementById('pacingTargetNum'),
    // Watch Party Elements
    openPartyBtn: document.getElementById('openPartyBtn'),
    partyMemberCounter: document.getElementById('partyMemberCounter'),
    partyLiveBar: document.getElementById('partyLiveBar'),
    liveStatusText: document.getElementById('liveStatusText'),
    partyRoomChip: document.getElementById('partyRoomChip'),
    partyRoomCodeDisplay: document.getElementById('partyRoomCodeDisplay'),
    partyMembersStack: document.getElementById('partyMembersStack'),
    partyActivityTicker: document.getElementById('partyActivityTicker'),
    tickerText: document.getElementById('tickerText'),
    partyShareLinkBtn: document.getElementById('partyShareLinkBtn'),
    partyManageBtn: document.getElementById('partyManageBtn'),
    partyLeaveBtn: document.getElementById('partyLeaveBtn'),
    partyModal: document.getElementById('partyModal'),
    partyModalTitle: document.getElementById('partyModalTitle'),
    closePartyBtn: document.getElementById('closePartyBtn'),
    btnClosePartyModal: document.getElementById('btnClosePartyModal'),
    btnModalLeaveParty: document.getElementById('btnModalLeaveParty'),
    partyAvatarPicker: document.getElementById('partyAvatarPicker'),
    partyUserNameInput: document.getElementById('partyUserNameInput'),
    partyDisconnectedView: document.getElementById('partyDisconnectedView'),
    partyConnectedView: document.getElementById('partyConnectedView'),
    tabHostBtn: document.getElementById('tabHostBtn'),
    tabJoinBtn: document.getElementById('tabJoinBtn'),
    hostTabContent: document.getElementById('hostTabContent'),
    joinTabContent: document.getElementById('joinTabContent'),
    btnCreateParty: document.getElementById('btnCreateParty'),
    btnJoinParty: document.getElementById('btnJoinParty'),
    partyRoomCodeInput: document.getElementById('partyRoomCodeInput'),
    partyRoleText: document.getElementById('partyRoleText'),
    partyModalRoomCode: document.getElementById('partyModalRoomCode'),
    partyInviteUrlInput: document.getElementById('partyInviteUrlInput'),
    btnCopyInviteLink: document.getElementById('btnCopyInviteLink'),
    partyQrCanvas: document.getElementById('partyQrCanvas'),
    partyMembersCount: document.getElementById('partyMembersCount'),
    partyMembersList: document.getElementById('partyMembersList'),
    partyHistoryLog: document.getElementById('partyHistoryLog'),
  };

  let activeNoteItemId = null;

  // --- DOOMSDAY COUNTDOWN TIMER (DECEMBER 18, 2026) ---
  const DOOMSDAY_TARGET = new Date('2026-12-18T00:00:00').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const diff = DOOMSDAY_TARGET - now;

    if (diff <= 0) {
      if (elements.countdownDays) elements.countdownDays.textContent = '00';
      if (elements.countdownHours) elements.countdownHours.textContent = '00';
      if (elements.countdownMinutes) elements.countdownMinutes.textContent = '00';
      if (elements.countdownSeconds) elements.countdownSeconds.textContent = '00';
      if (elements.pacingTargetNum) elements.pacingTargetNum.textContent = 'DOOMSDAY HAS ARRIVED!';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (elements.countdownDays) elements.countdownDays.textContent = String(days).padStart(2, '0');
    if (elements.countdownHours) elements.countdownHours.textContent = String(hours).padStart(2, '0');
    if (elements.countdownMinutes) elements.countdownMinutes.textContent = String(minutes).padStart(2, '0');
    if (elements.countdownSeconds) elements.countdownSeconds.textContent = String(seconds).padStart(2, '0');

    // Update marathon pacing based on exact duration of unwatched & required content
    let requiredUnwatchedHours = 0;
    let optionalUnwatchedHours = 0;

    MARVEL_CHECKLIST.forEach((item) => {
      const isWatched = state.watched.has(item.id);
      const isOptional = state.optional.has(item.id);

      if (isWatched) {
        return; // Fully watched, 0 unwatched hours
      }

      let unwatchedHoursForItem = item.runtimeHours || 0;
      const hasEpisodes = window.MARVEL_EPISODES && window.MARVEL_EPISODES[item.id];
      if (hasEpisodes) {
        const eps = window.MARVEL_EPISODES[item.id];
        let watchedEpMinutes = 0;
        let totalEpMinutes = 0;
        eps.forEach((ep) => {
          const dur = ep.durationMinutes || 45;
          totalEpMinutes += dur;
          if (state.watchedEpisodes.has(`${item.id}_${ep.ep}`)) {
            watchedEpMinutes += dur;
          }
        });
        if (totalEpMinutes > 0) {
          unwatchedHoursForItem = Math.max(0, (totalEpMinutes - watchedEpMinutes) / 60);
        }
      }

      if (!isOptional) {
        requiredUnwatchedHours += unwatchedHoursForItem;
      } else {
        optionalUnwatchedHours += unwatchedHoursForItem;
      }
    });

    if (elements.pacingTargetNum) {
      if (requiredUnwatchedHours <= 0.05) {
        elements.pacingTargetNum.textContent = 'All Required Titles Completed! Ready for Doomsday!';
      } else {
        const exactDaysRemaining = Math.max(0.01, diff / (1000 * 60 * 60 * 24));
        const exactWeeksRemaining = Math.max(0.01, exactDaysRemaining / 7);
        const hoursPerDay = (requiredUnwatchedHours / exactDaysRemaining).toFixed(1);

        // Standard feature movie runtime: ~2.15 hours (~129 minutes)
        // Duration-based titles per week: total weekly hours needed / avg movie duration
        const avgMovieRuntime = 2.15;
        const durationBasedTitlesPerWeek = ((requiredUnwatchedHours / exactWeeksRemaining) / avgMovieRuntime).toFixed(1);

        const optionalNote = optionalUnwatchedHours > 0 ? ` • ${optionalUnwatchedHours.toFixed(1)}h optional excluded` : '';
        elements.pacingTargetNum.textContent = `~${hoursPerDay} hrs/day (~${durationBasedTitlesPerWeek} titles/wk • ${requiredUnwatchedHours.toFixed(1)}h required${optionalNote})`;
      }
    }
  }

  // --- AUDIO SYNTHESIZER (Web Audio API) ---
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx && typeof window.AudioContext !== 'undefined') {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playSound(type) {
    if (!state.soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'check') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.13);
      } else if (type === 'uncheck') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.11);
      } else if (type === 'fanfare') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const noteOsc = audioCtx.createOscillator();
          const noteGain = audioCtx.createGain();
          noteOsc.connect(noteGain);
          noteGain.connect(audioCtx.destination);
          const t = now + i * 0.08;
          noteOsc.frequency.setValueAtTime(freq, t);
          noteGain.gain.setValueAtTime(0.12, t);
          noteGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
          noteOsc.start(t);
          noteOsc.stop(t + 0.26);
        });
      }
    } catch (e) {
      // Audio fallback silent
    }
  }

  // --- LOCAL STORAGE PERSISTENCE ---
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.watched)) {
          state.watched = new Set(parsed.watched);
        }
        if (Array.isArray(parsed.watchedEpisodes)) {
          state.watchedEpisodes = new Set(parsed.watchedEpisodes);
        } else {
          state.watchedEpisodes = new Set();
        }
        if (Array.isArray(parsed.expandedSeries)) {
          state.expandedSeries = new Set(parsed.expandedSeries);
        }
        if (Array.isArray(parsed.optional)) {
          state.optional = new Set(parsed.optional);
        }
        if (parsed.ratings && typeof parsed.ratings === 'object') {
          state.ratings = parsed.ratings;
        }
        if (parsed.notes && typeof parsed.notes === 'object') {
          state.notes = parsed.notes;
        }
        if (parsed.theme) state.theme = parsed.theme;
        if (parsed.viewMode && ['list', 'compact', 'cards', 'detailed'].includes(parsed.viewMode)) {
          state.viewMode = parsed.viewMode === 'detailed' ? 'list' : parsed.viewMode;
        } else {
          state.viewMode = 'list';
        }
        if (typeof parsed.soundEnabled === 'boolean') {
          state.soundEnabled = parsed.soundEnabled;
        }
      } else {
        // Initialize default watched items matching user's checklist (50 titles / 181.7h watched)
        state.watched = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25, 27, 28, 29, 30, 32, 33, 34, 35, 36, 37, 38, 39, 42, 43, 47, 48, 50, 51, 52, 53, 54, 55, 57, 58, 59, 87]);
      }

      // Synchronize watched status and episode checkboxes on initial load:
      // If a series is marked watched, all its episodes should be in watchedEpisodes
      if (window.MARVEL_EPISODES) {
        MARVEL_CHECKLIST.forEach((item) => {
          if (state.watched.has(item.id) && window.MARVEL_EPISODES[item.id]) {
            window.MARVEL_EPISODES[item.id].forEach((ep) => {
              state.watchedEpisodes.add(`${item.id}_${ep.ep}`);
            });
          }
        });
      }

      // Load Watch Party Persona & Profile
      const savedProfile = localStorage.getItem(PARTY_PROFILE_KEY);
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          if (parsedProfile && typeof parsedProfile === 'object') {
            if (parsedProfile.id) state.partyProfile.id = parsedProfile.id;
            if (parsedProfile.name) state.partyProfile.name = parsedProfile.name;
            if (parsedProfile.avatar) state.partyProfile.avatar = parsedProfile.avatar;
          }
        } catch (err) {
          // Fallback to default persona
        }
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
    }
  }

  function savePartyProfile() {
    try {
      localStorage.setItem(PARTY_PROFILE_KEY, JSON.stringify(state.partyProfile));
    } catch (e) {
      console.warn('Failed to save party profile:', e);
    }
  }

  function saveState() {
    try {
      const dataToSave = {
        watched: Array.from(state.watched),
        watchedEpisodes: Array.from(state.watchedEpisodes),
        expandedSeries: Array.from(state.expandedSeries),
        optional: Array.from(state.optional),
        ratings: state.ratings,
        notes: state.notes,
        theme: state.theme,
        viewMode: state.viewMode,
        soundEnabled: state.soundEnabled,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  }

  // --- CONFETTI PARTICLE SYSTEM ---
  function triggerConfetti(originX, originY) {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#10b981', '#00d2d3', '#f5cd79', '#ff3838', '#a855f7', '#ffffff'];
    const count = 45;

    const startX = originX || window.innerWidth / 2;
    const startY = originY || window.innerHeight / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      particles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.025 + 0.015,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
      });
    }

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach((p) => {
        if (p.alpha > 0) {
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.22; // gravity
          p.alpha -= p.decay;
          p.rotation += p.rotSpeed;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (alive) {
        requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    render();
  }

  // --- BACKGROUND STARFIELD ---
  function initStarfield() {
    const canvas = document.getElementById('starfieldCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const stars = [];
    const starCount = Math.min(120, Math.floor((width * height) / 12000));

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.3 + 0.3,
        baseAlpha: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2,
      });
    }

    function animateStars() {
      ctx.clearRect(0, 0, width, height);
      stars.forEach((s) => {
        s.phase += s.twinkleSpeed;
        const currentAlpha = s.baseAlpha + Math.sin(s.phase) * 0.25;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, currentAlpha))})`;
        ctx.fill();
      });
      requestAnimationFrame(animateStars);
    }
    animateStars();
  }

  // --- FILTER & SORT LOGIC ---
  function getFilteredItems() {
    let items = [...MARVEL_CHECKLIST];

    // Category Filter
    if (state.activeCategory !== 'all') {
      items = items.filter((item) => {
        if (state.activeCategory === 'mcu-infinity') return item.universe === 'mcu-infinity';
        if (state.activeCategory === 'mcu-multiverse') return item.universe === 'mcu-multiverse';
        if (state.activeCategory === 'defenders') return item.universe === 'defenders';
        if (state.activeCategory === 'spider-verse') return item.universe === 'spider-verse';
        if (state.activeCategory === 'x-men') return item.universe === 'x-men';
        if (state.activeCategory === 'fantastic-four') return item.universe === 'fantastic-four';
        if (state.activeCategory === 'legacy') return item.universe === 'legacy';
        if (state.activeCategory === 'animation') return item.mediaType === 'animation';
        return true;
      });
    }

    // Status Filter
    if (state.activeStatus === 'watched') {
      items = items.filter((item) => state.watched.has(item.id) && !state.optional.has(item.id));
    } else if (state.activeStatus === 'unwatched') {
      items = items.filter((item) => !state.watched.has(item.id) && !state.optional.has(item.id));
    } else if (state.activeStatus === 'optional') {
      items = items.filter((item) => state.optional.has(item.id));
    }

    // Media Type Filter
    if (state.activeType !== 'all') {
      items = items.filter((item) => {
        if (state.activeType === 'movie') return item.mediaType === 'movie';
        if (state.activeType === 'series') return item.mediaType === 'series';
        if (state.activeType === 'special') return item.mediaType === 'special' || item.mediaType === 'animation';
        return true;
      });
    }

    // Search Query
    if (state.searchQuery.trim() !== '') {
      const q = state.searchQuery.toLowerCase().trim();
      items = items.filter((item) => {
        return (
          item.title.toLowerCase().includes(q) ||
          item.canonicalTitle.toLowerCase().includes(q) ||
          item.universeLabel.toLowerCase().includes(q) ||
          item.synopsis.toLowerCase().includes(q) ||
          String(item.year).includes(q)
        );
      });
    }

    // Sorting
    if (state.sortBy === 'year-asc') {
      items.sort((a, b) => a.year - b.year);
    } else if (state.sortBy === 'year-desc') {
      items.sort((a, b) => b.year - a.year);
    } else if (state.sortBy === 'alpha') {
      items.sort((a, b) => a.canonicalTitle.localeCompare(b.canonicalTitle));
    } else {
      // Custom default watchlist order
      items.sort((a, b) => a.id - b.id);
    }

    return items;
  }

  // --- SVG ICON GENERATOR ---
  function getUniverseIcon(iconName) {
    const icons = {
      shield: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      reactor: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`,
      hammer: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 12l-8.5 8.5c-.8.8-2 .8-2.8 0s-.8-2 0-2.8L12 9"/><path d="M17.6 3.6l2.8 2.8c.8.8.8 2 0 2.8l-4.2 4.2-5.7-5.7 4.2-4.2c.8-.8 2-.8 2.9.1z"/></svg>`,
      spider: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/><path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M4 6l4 4M20 6l-4 4M2 14l6-1M22 14l-6-1M4 22l4-5M20 22l-4-5"/></svg>`,
      xmen: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/></svg>`,
      avengers: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9 18l3-12 3 12"/><path d="M8 14h8"/></svg>`,
      four: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M14 6v12M8 12h8M10 6l-4 6h4"/></svg>`,
      cosmic: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M3 12a9 9 0 0 1 18 0M3 12a9 9 0 0 0 18 0"/></svg>`,
      daredevil: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/></svg>`,
      punisher: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 3h10v10a5 5 0 0 1-10 0V3z"/><path d="M8 17v4M11 17v4M13 17v4M16 17v4"/></svg>`,
      default: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    };
    return icons[iconName] || icons.default;
  }

  // --- RENDER HUD & STATS ---
  function updateHUD() {
    const total = MARVEL_CHECKLIST.length;
    const watchedCount = state.watched.size;
    const remainingCount = total - watchedCount;
    const percent = Math.round((watchedCount / total) * 100);

    // Calculate hours watched
    let hoursWatched = 0;
    MARVEL_CHECKLIST.forEach((item) => {
      const hasEpisodes = window.MARVEL_EPISODES && window.MARVEL_EPISODES[item.id];
      if (hasEpisodes) {
        if (state.watched.has(item.id)) {
          hoursWatched += (item.runtimeHours || 0);
        } else {
          const eps = window.MARVEL_EPISODES[item.id];
          let watchedEpMinutes = 0;
          eps.forEach((ep) => {
            if (state.watchedEpisodes.has(`${item.id}_${ep.ep}`)) {
              watchedEpMinutes += (ep.durationMinutes || 45);
            }
          });
          hoursWatched += (watchedEpMinutes / 60);
        }
      } else {
        if (state.watched.has(item.id)) {
          hoursWatched += (item.runtimeHours || 0);
        }
      }
    });

    // Update numbers
    if (elements.statsWatchedCount) elements.statsWatchedCount.textContent = watchedCount;
    if (elements.statsTotalCount) elements.statsTotalCount.textContent = total;
    if (elements.statsRemainingCount) elements.statsRemainingCount.textContent = remainingCount;
    if (elements.statsHoursWatched) elements.statsHoursWatched.textContent = hoursWatched.toFixed(1) + 'h';

    // Linear bar (if present)
    if (elements.progressBarFill) elements.progressBarFill.style.width = `${percent}%`;

    // Circular gauge (if present)
    if (elements.circleProgress) {
      const circumference = 251.2;
      const offset = circumference - (percent / 100) * circumference;
      elements.circleProgress.style.strokeDashoffset = offset;
    }
    if (elements.circlePercent) elements.circlePercent.textContent = `${percent}%`;

    // Next Up Spotlight
    updateNextUpBanner();

    // Category Tabs counts
    updateTabCounts();

    // Update Countdown Pacing
    updateCountdown();
  }

  function updateNextUpBanner() {
    let nextItem = MARVEL_CHECKLIST.find((item) => !state.watched.has(item.id) && !state.optional.has(item.id));
    if (!nextItem) {
      nextItem = MARVEL_CHECKLIST.find((item) => !state.watched.has(item.id));
    }

    if (!nextItem) {
      elements.nextUpBanner.innerHTML = `
        <div class="next-up-left">
          <div class="next-up-icon-wrap" style="color: #f5cd79; border-color: #f5cd79;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
          <div class="next-up-content">
            <span class="next-up-tag" style="color: #f5cd79;">★ MARATHON COMPLETE ★</span>
            <div class="next-up-title">All 115 Titles Conquered!</div>
            <div class="next-up-meta">You are fully prepared to witness Avengers: Doomsday. Long live Battleworld!</div>
          </div>
        </div>
      `;
      return;
    }

    const nextFallback = getFallbackPoster(nextItem);
    const nextPoster = nextItem.poster || nextFallback;
    elements.nextUpBanner.innerHTML = `
      <div class="next-up-left">
        <div class="next-up-icon-wrap" style="padding: 0; overflow: hidden; width: 58px; height: 84px; border-radius: 6px;">
          <img src="${nextPoster}" alt="${nextItem.canonicalTitle}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='${nextFallback}';" />
        </div>
        <div class="next-up-content">
          <span class="next-up-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Up Next In Your Marathon (#${nextItem.id})
          </span>
          <div class="next-up-title">${nextItem.canonicalTitle}</div>
          <div class="next-up-meta">${nextItem.universeLabel} • ${nextItem.year} • Est. ${nextItem.runtimeHours}h</div>
        </div>
      </div>
      <div class="next-up-right">
        <button class="btn-primary" id="btnNextUpWatched">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Mark Watched
        </button>
      </div>
    `;

    const btnWatched = document.getElementById('btnNextUpWatched');
    if (btnWatched) {
      btnWatched.addEventListener('click', (e) => {
        toggleItemWatch(nextItem.id, true, e.clientX, e.clientY);
      });
    }
  }

  function updateTabCounts() {
    const tabs = elements.filterTabsScroll.querySelectorAll('.filter-tab');
    tabs.forEach((tab) => {
      const cat = tab.dataset.category;
      let count = 0;
      if (cat === 'all') {
        count = MARVEL_CHECKLIST.length;
      } else if (cat === 'animation') {
        count = MARVEL_CHECKLIST.filter((i) => i.mediaType === 'animation').length;
      } else {
        count = MARVEL_CHECKLIST.filter((i) => i.universe === cat).length;
      }
      const countSpan = tab.querySelector('.tab-count');
      if (countSpan) countSpan.textContent = count;
    });
  }

  // --- ESCAPE HTML HELPER ---
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // --- PROCEDURAL SVG POSTER FALLBACK ---
  function getFallbackPoster(item) {
    const colors = {
      'mcu-infinity': '#38bdf8',
      'mcu-multiverse': '#10b981',
      'defenders': '#ef4444',
      'spider-verse': '#f43f5e',
      'x-men': '#eab308',
      'fantastic-four': '#3b82f6',
      'legacy': '#a855f7',
    };
    const accent = colors[item.universe] || '#10b981';
    const cleanTitle = (item.canonicalTitle || item.title || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const truncatedTitle = cleanTitle.length > 25 ? cleanTitle.slice(0, 22) + '...' : cleanTitle;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
      <defs>
        <linearGradient id="bg-${item.id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#141d2c"/>
          <stop offset="60%" stop-color="#0a0f18"/>
          <stop offset="100%" stop-color="#040609"/>
        </linearGradient>
      </defs>
      <rect width="300" height="450" fill="url(#bg-${item.id})" rx="10"/>
      <rect x="8" y="8" width="284" height="434" fill="none" stroke="${accent}" stroke-width="2" stroke-opacity="0.5" rx="8"/>
      <rect x="24" y="24" width="84" height="20" fill="#e50914" rx="2"/>
      <text x="66" y="38" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="10" font-weight="900" text-anchor="middle" letter-spacing="1">MARVEL</text>
      <circle cx="150" cy="190" r="54" fill="${accent}" fill-opacity="0.1" stroke="${accent}" stroke-width="2" stroke-opacity="0.7"/>
      <text x="150" y="200" fill="${accent}" font-family="-apple-system, sans-serif" font-size="32" font-weight="900" text-anchor="middle">#${item.id}</text>
      <text x="150" y="315" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="16" font-weight="bold" text-anchor="middle">${truncatedTitle}</text>
      <text x="150" y="345" fill="${accent}" font-family="-apple-system, sans-serif" font-size="12" font-weight="700" text-anchor="middle" letter-spacing="1">${item.universeLabel.toUpperCase()}</text>
      <text x="150" y="380" fill="#94a3b8" font-family="-apple-system, sans-serif" font-size="13" text-anchor="middle">${item.year} • ${item.mediaType.toUpperCase()}</text>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  // --- EPISODES ACCORDION & CHECKLIST BUILDER ---
  function renderEpisodesPanelHtml(item) {
    if (!window.MARVEL_EPISODES || !window.MARVEL_EPISODES[item.id]) {
      return '';
    }

    const eps = window.MARVEL_EPISODES[item.id];
    const totalCount = eps.length;
    const watchedCount = eps.filter((e) => state.watchedEpisodes.has(`${item.id}_${e.ep}`)).length;
    const isExpanded = state.expandedSeries.has(item.id);
    const allWatched = totalCount > 0 && watchedCount === totalCount;
    const epPercent = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;

    const epRowsHtml = eps
      .map((ep) => {
        const key = `${item.id}_${ep.ep}`;
        const isEpWatched = state.watchedEpisodes.has(key);
        const seasonPrefix = ep.season ? `S${ep.season} : ` : '';
        const epCode = `${seasonPrefix}E${String(ep.ep).padStart(2, '0')}`;

        return `
          <div class="episode-row ${isEpWatched ? 'watched' : ''}" data-series-id="${item.id}" data-ep="${ep.ep}" id="ep-row-${item.id}-${ep.ep}">
            <label class="custom-checkbox-wrap ep-checkbox-wrap" aria-label="Mark episode ${ep.ep}: ${escapeHtml(ep.title)} as watched">
              <input type="checkbox" ${isEpWatched ? 'checked' : ''} class="episode-checkbox" data-series-id="${item.id}" data-ep="${ep.ep}" />
              <span class="checkmark-box ep-checkmark-box">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
            </label>
            <div class="episode-meta-col">
              <div class="episode-top-row">
                <span class="episode-code">${epCode}</span>
                <span class="episode-title">${escapeHtml(ep.title)}</span>
                <span class="episode-duration">⏱ ${ep.duration}</span>
              </div>
              ${ep.description ? `<p class="episode-description">${escapeHtml(ep.description)}</p>` : ''}
            </div>
          </div>
        `;
      })
      .join('');

    return `
      <div class="series-episodes-control" id="episodes-control-${item.id}">
        <button class="btn-episodes-toggle ${isExpanded ? 'active' : ''}" data-id="${item.id}" type="button" aria-expanded="${isExpanded ? 'true' : 'false'}" title="Toggle episode guide and individual tracking">
          <svg class="ep-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/><circle cx="12" cy="14" r="1.5"/></svg>
          <span class="ep-toggle-label">${isExpanded ? 'Hide Episodes' : 'Show Episodes'}</span>
          <span class="ep-count-pill" id="ep-count-pill-${item.id}">${watchedCount}/${totalCount} watched</span>
          <svg class="ep-chevron ${isExpanded ? 'rotated' : ''}" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="episodes-progress-mini">
          <div class="episodes-progress-bar" id="ep-progress-bar-${item.id}" style="width: ${epPercent}%"></div>
        </div>
      </div>

      <div class="series-episodes-panel ${isExpanded ? 'is-expanded' : ''}" id="episodes-panel-${item.id}">
        <div class="series-episodes-inner">
          <div class="episodes-header-bar">
            <div class="episodes-header-title">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              <span>EPISODE BREAKDOWN • ${totalCount} EPISODES</span>
            </div>
            <button type="button" class="btn-text-action mark-all-eps-btn" data-id="${item.id}" id="mark-all-eps-${item.id}">
              ${allWatched ? 'Unmark All Episodes' : 'Mark All As Watched'}
            </button>
          </div>
          <div class="episodes-list">
            ${epRowsHtml}
          </div>
        </div>
      </div>
    `;
  }

  // --- RENDER CHECKLIST (4 VIEW MODES WITH POSTERS) ---
  function renderChecklist() {
    const items = getFilteredItems();

    elements.resultsIndicator.innerHTML = `Showing <strong>${items.length}</strong> of ${MARVEL_CHECKLIST.length} titles`;

    if (items.length === 0) {
      elements.checklistGrid.className = 'checklist-container';
      elements.checklistGrid.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <h3>No Marvel titles found</h3>
          <p>Try clearing your search query or switching filter tabs.</p>
          <button class="btn-secondary" id="btnResetFilters">Reset Filters</button>
        </div>
      `;
      const btnReset = document.getElementById('btnResetFilters');
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          state.activeCategory = 'all';
          state.activeStatus = 'all';
          state.activeType = 'all';
          state.searchQuery = '';
          elements.searchInput.value = '';
          elements.searchClearBtn.style.display = 'none';
          syncFilterTabUI();
          renderChecklist();
          updateHUD();
        });
      }
      return;
    }

    const mode = state.viewMode || 'list';
    elements.checklistGrid.className = `checklist-container view-${mode}`;

    const cardsHtml = items
      .map((item) => {
        const isWatched = state.watched.has(item.id);
        const isOptional = state.optional.has(item.id);
        const userRating = state.ratings[item.id] || 0;
        const hasNote = Boolean(state.notes[item.id]);
        const fallback = getFallbackPoster(item);
        const posterSrc = item.poster || fallback;

        const starsHtml = [1, 2, 3, 4, 5]
          .map(
            (star) => `
          <button type="button" class="star-btn ${star <= userRating ? 'active' : ''}" data-star="${star}" title="Rate ${star} star">★</button>
        `
          )
          .join('');

        // VIEW MODE: CARDS GRID (FULL-VIEW GLASS CARDS)
        if (mode === 'cards') {
          return `
          <div class="checklist-card universe-${item.universe} ${isWatched ? 'watched' : ''} ${isOptional ? 'is-optional' : ''}" data-id="${item.id}" id="card-item-${item.id}">
            <div class="card-glass-frame">
              <div class="item-poster-wrap">
                <img src="${posterSrc}" alt="${item.canonicalTitle}" class="item-poster-img" loading="lazy" onerror="this.onerror=null; this.src='${fallback}';" />
                <div class="card-glass-overlay-top">
                  <label class="custom-checkbox-wrap" aria-label="Mark ${item.canonicalTitle} as watched">
                    <input type="checkbox" ${isWatched ? 'checked' : ''} data-id="${item.id}" class="card-checkbox" />
                    <span class="checkmark-box">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                  </label>
                  <span class="card-glass-num-pill">#${item.id}</span>
                </div>
              </div>
              <div class="card-body-wrap">
                <div class="card-info">
                  <div class="card-order-badge">${item.phase || item.universeLabel}</div>
                  <h3 class="card-title" title="${item.canonicalTitle}">${item.canonicalTitle}</h3>
                  <div class="card-badges-row">
                    <span class="badge badge-universe">${item.universeLabel}</span>
                    <span class="badge badge-year">${item.year}</span>
                    <span class="badge badge-type">${item.mediaType}</span>
                    ${isOptional ? '<span class="badge badge-optional">Optional</span>' : ''}
                  </div>
                </div>
                ${renderEpisodesPanelHtml(item)}
                <div class="card-footer">
                  <div class="star-rating" data-id="${item.id}">${starsHtml}</div>
                  <div class="card-action-btns">
                    <button class="btn-icon-sm optional-trigger-btn ${isOptional ? 'is-optional' : ''}" data-id="${item.id}" title="${isOptional ? 'Marked as Optional (excluded from pace) — Click to make Required' : 'Mark as Optional (exclude from daily pace)'}">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" stroke-dasharray="3 3"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                    </button>
                    <button class="btn-icon-sm note-trigger-btn ${hasNote ? 'has-note' : ''}" data-id="${item.id}" title="${hasNote ? 'Edit your note' : 'Add personal note'}">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        }

        // VIEW MODE: COMPACT LIST
        if (mode === 'compact') {
          return `
          <div class="checklist-card universe-${item.universe} ${isWatched ? 'watched' : ''} ${isOptional ? 'is-optional' : ''}" data-id="${item.id}" id="card-item-${item.id}">
            <label class="custom-checkbox-wrap" aria-label="Mark ${item.canonicalTitle} as watched">
              <input type="checkbox" ${isWatched ? 'checked' : ''} data-id="${item.id}" class="card-checkbox" />
              <span class="checkmark-box">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
            </label>
            <div class="item-poster-wrap">
              <img src="${posterSrc}" alt="${item.canonicalTitle}" class="item-poster-img" loading="lazy" onerror="this.onerror=null; this.src='${fallback}';" />
            </div>
            <div class="card-info">
              <span class="card-order-badge">#${item.id}</span>
              <h3 class="card-title" title="${item.canonicalTitle}">${item.canonicalTitle}</h3>
              <span class="badge badge-universe">${item.universeLabel}</span>
              <span class="badge badge-year">${item.year}</span>
              ${isOptional ? '<span class="badge badge-optional">Optional</span>' : ''}
              ${renderEpisodesPanelHtml(item)}
            </div>
            <div class="card-footer">
              <div class="star-rating" data-id="${item.id}">${starsHtml}</div>
              <button class="btn-icon-sm optional-trigger-btn ${isOptional ? 'is-optional' : ''}" data-id="${item.id}" title="${isOptional ? 'Optional title — Click to make Required' : 'Mark as Optional'}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" stroke-dasharray="3 3"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              </button>
              <button class="btn-icon-sm note-trigger-btn ${hasNote ? 'has-note' : ''}" data-id="${item.id}" title="${hasNote ? 'Edit note' : 'Add note'}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </button>
            </div>
          </div>
        `;
        }

        // VIEW MODE: LIST (DEFAULT: COMBINED LIST + ENHANCED EXPANDABLE DETAILED VIEW ON HOVER)
        return `
        <div class="checklist-card universe-${item.universe} ${isWatched ? 'watched' : ''} ${isOptional ? 'is-optional' : ''}" data-id="${item.id}" id="card-item-${item.id}">
          <label class="custom-checkbox-wrap" aria-label="Mark ${escapeHtml(item.canonicalTitle)} as watched">
            <input type="checkbox" ${isWatched ? 'checked' : ''} data-id="${item.id}" class="card-checkbox" />
            <span class="checkmark-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            </span>
          </label>

          <div class="item-poster-wrap">
            <img src="${posterSrc}" alt="${escapeHtml(item.canonicalTitle)}" class="item-poster-img" loading="lazy" onerror="this.onerror=null; this.src='${fallback}';" />
            <span class="poster-id-badge">#${item.id}</span>
          </div>

          <div class="card-body-wrap">
            <div class="card-header-row">
              <div class="card-title-group">
                <div class="card-order-badge">#${item.id} • ${escapeHtml(item.phase || item.universeLabel)}</div>
                <h3 class="card-title" title="${escapeHtml(item.canonicalTitle)}">${escapeHtml(item.canonicalTitle)}</h3>
                <div class="card-badges-row">
                  <span class="badge badge-universe">${escapeHtml(item.universeLabel)}</span>
                  <span class="badge badge-type">${escapeHtml(item.mediaType)}</span>
                  <span class="badge badge-year">${item.year}</span>
                  <span class="badge badge-runtime">⏱ ${item.runtimeHours}h</span>
                  ${isOptional ? '<span class="badge badge-optional">Optional</span>' : ''}
                </div>
              </div>

              <div class="card-header-actions">
                <div class="star-rating" data-id="${item.id}">${starsHtml}</div>
                <button class="btn-icon-sm optional-trigger-btn ${isOptional ? 'is-optional' : ''}" data-id="${item.id}" title="${isOptional ? 'Marked as Optional (excluded from pace) — Click to make Required' : 'Mark as Optional (exclude from daily pace)'}">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" stroke-dasharray="3 3"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                </button>
                <button class="btn-icon-sm note-trigger-btn ${hasNote ? 'has-note' : ''}" data-id="${item.id}" title="${hasNote ? 'Edit note' : 'Add note'}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </button>
                <div class="expand-indicator" title="Hover to view story details">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
            </div>

            <!-- Series Episodes Dropdown Control & Panel -->
            ${renderEpisodesPanelHtml(item)}

            <!-- Expandable Detailed View Drawer (Subtle & Smooth CSS Grid Expansion on Hover) -->
            <div class="card-detail-drawer">
              <div class="card-detail-drawer-inner">
                <div class="expand-divider"></div>
                
                <div class="card-detail-content">
                  <div class="synopsis-wrap">
                    <div class="synopsis-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                      <span>OVERVIEW & MULTIVERSE LORE</span>
                    </div>
                    <p class="card-synopsis">${escapeHtml(item.synopsis)}</p>
                  </div>

                  <div class="expand-meta-tags">
                    <span class="meta-pill">
                      <span class="meta-pill-label">Saga:</span>
                      <strong>${escapeHtml(item.phase || item.universeLabel)}</strong>
                    </span>
                    <span class="meta-pill">
                      <span class="meta-pill-label">Runtime:</span>
                      <strong>${item.runtimeHours}h</strong>
                    </span>
                    <span class="meta-pill">
                      <span class="meta-pill-label">Format:</span>
                      <strong style="text-transform: capitalize;">${escapeHtml(item.mediaType)}</strong>
                    </span>
                    <span class="meta-pill status-pill ${isWatched ? 'watched' : (isOptional ? 'optional' : 'unwatched')}">
                      <span class="meta-pill-label">Status:</span>
                      <strong>${isWatched ? '✓ Conquered' : (isOptional ? '○ Optional (Extra)' : '○ In Queue (Required)')}</strong>
                    </span>
                  </div>

                  ${
                    hasNote
                      ? `
                    <div class="note-preview-box">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                      <span><strong>My Note:</strong> ${escapeHtml(state.notes[item.id])}</span>
                    </div>
                  `
                      : ''
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
        `;
      })
      .join('');

    elements.checklistGrid.innerHTML = cardsHtml;

    // Attach card event listeners
    attachCardListeners();
  }

  function attachCardListeners() {
    // Main Card Checkboxes
    const checkboxes = elements.checklistGrid.querySelectorAll('.card-checkbox');
    checkboxes.forEach((cb) => {
      cb.addEventListener('change', (e) => {
        const id = parseInt(e.target.dataset.id, 10);
        const rect = e.target.getBoundingClientRect();
        toggleItemWatch(id, e.target.checked, rect.left, rect.top);
      });
    });

    // Episode Toggle Dropdown Buttons
    const epToggleBtns = elements.checklistGrid.querySelectorAll('.btn-episodes-toggle');
    epToggleBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id, 10);
        toggleEpisodesDropdown(id);
      });
    });

    // Individual Episode Checkboxes
    const epCheckboxes = elements.checklistGrid.querySelectorAll('.episode-checkbox');
    epCheckboxes.forEach((cb) => {
      cb.addEventListener('change', (e) => {
        e.stopPropagation();
        const seriesId = parseInt(cb.dataset.seriesId, 10);
        const epNum = parseInt(cb.dataset.ep, 10);
        const rect = cb.getBoundingClientRect();
        toggleEpisodeWatch(seriesId, epNum, cb.checked, rect.left, rect.top);
      });
    });

    // Mark All Episodes In Series Button
    const markAllBtns = elements.checklistGrid.querySelectorAll('.mark-all-eps-btn');
    markAllBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id, 10);
        toggleAllEpisodesForSeries(id);
      });
    });

    // Star Ratings
    const starBtns = elements.checklistGrid.querySelectorAll('.star-btn');
    starBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const star = parseInt(btn.dataset.star, 10);
        const container = btn.closest('.star-rating');
        const id = parseInt(container.dataset.id, 10);

        // Toggle rating off if clicking same rating
        if (state.ratings[id] === star) {
          delete state.ratings[id];
        } else {
          state.ratings[id] = star;
          playSound('check');
        }
        saveState();
        renderChecklist();
      });
    });

    // Notes buttons
    const noteBtns = elements.checklistGrid.querySelectorAll('.note-trigger-btn');
    noteBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id, 10);
        openNotesModal(id);
      });
    });

    // Optional buttons
    const optBtns = elements.checklistGrid.querySelectorAll('.optional-trigger-btn');
    optBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id, 10);
        toggleItemOptional(id);
      });
    });
  }

  // --- ACTIONS & TOGGLES ---
  function toggleItemOptional(id, fromRemote = false) {
    const isNowOptional = !state.optional.has(id);
    if (isNowOptional) {
      state.optional.add(id);
      showToast('Marked as Optional (excluded from daily pace)');
    } else {
      state.optional.delete(id);
      showToast('Restored as Required title');
    }
    if (state.soundEnabled) playSound('uncheck');
    saveState();
    updateHUD();
    renderChecklist();

    if (!fromRemote && partyController.active) {
      broadcastPartyEvent({
        type: 'OPTIONAL_TOGGLE',
        id,
        optional: isNowOptional,
      });
      const itm = MARVEL_CHECKLIST.find((x) => x.id === id);
      addPartyLog(state.partyProfile.avatar, `You marked "${itm ? itm.canonicalTitle : 'Title'}" as ${isNowOptional ? 'optional' : 'required'}`);
    }
  }

  function toggleEpisodesDropdown(seriesId) {
    const panel = document.getElementById(`episodes-panel-${seriesId}`);
    const btn = document.querySelector(`.btn-episodes-toggle[data-id="${seriesId}"]`);
    const chevron = btn ? btn.querySelector('.ep-chevron') : null;
    const label = btn ? btn.querySelector('.ep-toggle-label') : null;

    const isCurrentlyExpanded = state.expandedSeries.has(seriesId);
    if (isCurrentlyExpanded) {
      state.expandedSeries.delete(seriesId);
      if (panel) panel.classList.remove('is-expanded');
      if (btn) {
        btn.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
      }
      if (chevron) chevron.classList.remove('rotated');
      if (label) label.textContent = 'Show Episodes';
    } else {
      state.expandedSeries.add(seriesId);
      if (panel) panel.classList.add('is-expanded');
      if (btn) {
        btn.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
      if (chevron) chevron.classList.add('rotated');
      if (label) label.textContent = 'Hide Episodes';
    }
    saveState();
  }

  function toggleEpisodeWatch(seriesId, epNum, isChecked, clickX, clickY, fromRemote = false) {
    const key = `${seriesId}_${epNum}`;
    if (isChecked) {
      state.watchedEpisodes.add(key);
      playSound('check');
      triggerConfetti(clickX, clickY);
    } else {
      state.watchedEpisodes.delete(key);
      playSound('uncheck');
    }

    const eps = (window.MARVEL_EPISODES && window.MARVEL_EPISODES[seriesId]) || [];
    const totalEps = eps.length;
    const watchedCount = eps.filter((e) => state.watchedEpisodes.has(`${seriesId}_${e.ep}`)).length;
    const allWatched = totalEps > 0 && watchedCount === totalEps;

    // Bi-directional rule 1: If all episodes of series are checked, automatically check series off
    // Bi-directional rule 2: If any episode is unchecked, automatically uncheck the series
    if (allWatched) {
      if (!state.watched.has(seriesId)) {
        state.watched.add(seriesId);
        const seriesItem = MARVEL_CHECKLIST.find((x) => x.id === seriesId);
        const title = seriesItem ? seriesItem.canonicalTitle : 'Series';
        showToast(`All ${totalEps} episodes watched! ${title} completed!`);
        playSound('fanfare');
        triggerConfetti(clickX || window.innerWidth / 2, clickY || window.innerHeight / 2);
      }
    } else {
      if (state.watched.has(seriesId)) {
        state.watched.delete(seriesId);
      }
    }

    saveState();
    updateHUD();
    syncSeriesDOM(seriesId);

    // If active status filter is filtered to 'watched' or 'unwatched', re-render to reflect filter accurately
    if (state.activeStatus !== 'all') {
      renderChecklist();
    }

    if (!fromRemote && partyController.active) {
      broadcastPartyEvent({
        type: 'EPISODE_TOGGLE',
        seriesId,
        epNum,
        checked: isChecked,
      });
      const sItem = MARVEL_CHECKLIST.find((x) => x.id === seriesId);
      const sTitle = sItem ? sItem.canonicalTitle : 'Series';
      addPartyLog(state.partyProfile.avatar, `You marked ${sTitle} Ep ${epNum} as ${isChecked ? 'watched' : 'unwatched'}`);
      updatePartyTicker(`⚡ You ${isChecked ? 'watched' : 'unwatched'} ${sTitle} Ep ${epNum}`);
    }
  }

  function toggleAllEpisodesForSeries(seriesId) {
    const eps = (window.MARVEL_EPISODES && window.MARVEL_EPISODES[seriesId]) || [];
    const totalEps = eps.length;
    const watchedCount = eps.filter((e) => state.watchedEpisodes.has(`${seriesId}_${e.ep}`)).length;
    const shouldMarkAll = watchedCount < totalEps;

    toggleItemWatch(seriesId, shouldMarkAll);
  }

  function toggleItemWatch(id, forceStatus, clickX, clickY, fromRemote = false) {
    const isNowWatched = typeof forceStatus === 'boolean' ? forceStatus : !state.watched.has(id);

    if (isNowWatched) {
      state.watched.add(id);
      playSound('check');
      triggerConfetti(clickX, clickY);
      if (!fromRemote) {
        showToast(`Marked as watched!`);
      }

      // Bi-directional rule 3: If the series is checked off, automatically check off all the episodes
      if (window.MARVEL_EPISODES && window.MARVEL_EPISODES[id]) {
        window.MARVEL_EPISODES[id].forEach((ep) => {
          state.watchedEpisodes.add(`${id}_${ep.ep}`);
        });
      }

      // Special fanfare if all 115 complete
      if (state.watched.size === MARVEL_CHECKLIST.length) {
        playSound('fanfare');
        triggerConfetti(window.innerWidth / 2, window.innerHeight / 3);
        showToast('🏆 CONGRATULATIONS! ALL 115 TITLES WATCHED!');
      }
    } else {
      state.watched.delete(id);
      playSound('uncheck');

      // Bi-directional rule 4: If the series is unchecked off, automatically uncheck all the episodes
      if (window.MARVEL_EPISODES && window.MARVEL_EPISODES[id]) {
        window.MARVEL_EPISODES[id].forEach((ep) => {
          state.watchedEpisodes.delete(`${id}_${ep.ep}`);
        });
      }
    }

    saveState();
    updateHUD();

    if (state.activeStatus !== 'all') {
      renderChecklist();
    } else {
      syncSeriesDOM(id);
    }

    if (!fromRemote && partyController.active) {
      broadcastPartyEvent({
        type: 'ITEM_TOGGLE',
        id,
        checked: isNowWatched,
      });
      const itm = MARVEL_CHECKLIST.find((x) => x.id === id);
      const title = itm ? itm.canonicalTitle : `Title #${id}`;
      addPartyLog(state.partyProfile.avatar, `You marked "${title}" as ${isNowWatched ? 'watched' : 'unwatched'}`);
      updatePartyTicker(`⚡ You ${isNowWatched ? 'watched' : 'unwatched'} "${title}"`);
    }
  }

  function syncSeriesDOM(seriesId) {
    const card = document.getElementById(`card-item-${seriesId}`);
    if (!card) return;

    const isWatched = state.watched.has(seriesId);
    card.classList.toggle('watched', isWatched);

    // Update main series checkbox
    const mainCheckbox = card.querySelector('.card-checkbox');
    if (mainCheckbox) {
      mainCheckbox.checked = isWatched;
    }

    // If episodic, update episode checkboxes, pills, and progress bar
    if (window.MARVEL_EPISODES && window.MARVEL_EPISODES[seriesId]) {
      const eps = window.MARVEL_EPISODES[seriesId];
      const total = eps.length;
      let watchedCount = 0;

      eps.forEach((ep) => {
        const isEpWatched = state.watchedEpisodes.has(`${seriesId}_${ep.ep}`);
        if (isEpWatched) watchedCount++;

        const epRow = document.getElementById(`ep-row-${seriesId}-${ep.ep}`);
        if (epRow) {
          epRow.classList.toggle('watched', isEpWatched);
          const epCb = epRow.querySelector('.episode-checkbox');
          if (epCb) epCb.checked = isEpWatched;
        }
      });

      const countPill = document.getElementById(`ep-count-pill-${seriesId}`);
      if (countPill) {
        countPill.textContent = `${watchedCount}/${total} watched`;
      }

      const progressBar = document.getElementById(`ep-progress-bar-${seriesId}`);
      if (progressBar) {
        const pct = total > 0 ? Math.round((watchedCount / total) * 100) : 0;
        progressBar.style.width = `${pct}%`;
      }

      const markAllBtn = document.getElementById(`mark-all-eps-${seriesId}`);
      if (markAllBtn) {
        markAllBtn.textContent = watchedCount === total ? 'Unmark All Episodes' : 'Mark All As Watched';
      }
    }
  }

  // --- TOAST NOTIFICATIONS ---
  function showToast(msg, customIcon) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    const iconHtml = customIcon
      ? `<span style="font-size: 1.15rem; line-height: 1;">${customIcon}</span>`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;

    toast.innerHTML = `
      ${iconHtml}
      <span>${msg}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // --- NOTES MODAL ---
  function openNotesModal(id) {
    const item = MARVEL_CHECKLIST.find((i) => i.id === id);
    if (!item) return;

    activeNoteItemId = id;
    elements.notesTitle.textContent = `Notes: ${item.canonicalTitle}`;
    elements.notesTextarea.value = state.notes[id] || '';
    elements.notesModal.classList.add('open');
    elements.notesTextarea.focus();
  }

  function closeNotesModal() {
    elements.notesModal.classList.remove('open');
    activeNoteItemId = null;
  }

  function saveNotes() {
    if (!activeNoteItemId) return;
    const text = elements.notesTextarea.value.trim();
    if (text) {
      state.notes[activeNoteItemId] = text;
      showToast('Note saved');
    } else {
      delete state.notes[activeNoteItemId];
    }
    saveState();
    closeNotesModal();
    renderChecklist();
  }

  // --- EXPORT & IMPORT ---
  function openExportModal() {
    let text = `# MARVEL MULTIVERSE BINGE PROGRESS (${state.watched.size}/${MARVEL_CHECKLIST.length} Completed)\n\n`;
    MARVEL_CHECKLIST.forEach((item) => {
      const isChecked = state.watched.has(item.id);
      text += `[${isChecked ? 'V' : ' '}] ${item.title}\n`;
    });

    elements.exportTextarea.value = text;
    elements.exportModal.classList.add('open');
  }

  function closeExportModal() {
    elements.exportModal.classList.remove('open');
  }

  function copyExportText() {
    navigator.clipboard
      .writeText(elements.exportTextarea.value)
      .then(() => {
        showToast('Checklist copied to clipboard!');
      })
      .catch(() => {
        elements.exportTextarea.select();
        document.execCommand('copy');
        showToast('Checklist copied!');
      });
  }

  function handleImportJSON(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data.watched)) {
          state.watched = new Set(data.watched);
          if (Array.isArray(data.watchedEpisodes)) {
            state.watchedEpisodes = new Set(data.watchedEpisodes);
          } else {
            state.watchedEpisodes = new Set();
            if (window.MARVEL_EPISODES) {
              MARVEL_CHECKLIST.forEach((item) => {
                if (state.watched.has(item.id) && window.MARVEL_EPISODES[item.id]) {
                  window.MARVEL_EPISODES[item.id].forEach((ep) => {
                    state.watchedEpisodes.add(`${item.id}_${ep.ep}`);
                  });
                }
              });
            }
          }
          if (Array.isArray(data.expandedSeries)) state.expandedSeries = new Set(data.expandedSeries);
          if (Array.isArray(data.optional)) state.optional = new Set(data.optional);
          if (data.ratings) state.ratings = data.ratings;
          if (data.notes) state.notes = data.notes;
          saveState();
          updateHUD();
          renderChecklist();
          closeExportModal();
          showToast('Progress backup restored successfully!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Could not parse backup file.');
      }
    };
    reader.readAsText(file);
  }

  // --- RANDOM UNWATCHED PICKER ---
  function pickRandomUnwatched() {
    let unwatched = MARVEL_CHECKLIST.filter((i) => !state.watched.has(i.id) && !state.optional.has(i.id));
    if (unwatched.length === 0) {
      unwatched = MARVEL_CHECKLIST.filter((i) => !state.watched.has(i.id));
    }
    if (unwatched.length === 0) {
      showToast('All titles are already watched!');
      return;
    }

    const randomItem = unwatched[Math.floor(Math.random() * unwatched.length)];
    playSound('fanfare');

    // Switch status filter if it was set to watched
    if (state.activeStatus === 'watched') {
      state.activeStatus = 'all';
      syncSubFilterUI();
    }

    renderChecklist();

    setTimeout(() => {
      const card = document.getElementById(`card-item-${randomItem.id}`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.transition = 'box-shadow 0.5s ease, transform 0.5s ease';
        card.style.boxShadow = '0 0 35px var(--accent-primary)';
        card.style.transform = 'scale(1.04)';
        setTimeout(() => {
          card.style.boxShadow = '';
          card.style.transform = '';
        }, 1800);
      }
    }, 150);

    showToast(`Picked: ${randomItem.canonicalTitle}!`);
  }

  // --- THEME & VIEW MODE ---
  function setTheme(themeName) {
    state.theme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);

    elements.themePills.forEach((pill) => {
      pill.classList.toggle('active', pill.dataset.theme === themeName);
    });

    saveState();
  }

  function setViewMode(mode) {
    if (mode === 'detailed') mode = 'list';
    state.viewMode = mode;
    if (elements.viewListBtn) elements.viewListBtn.classList.toggle('active', mode === 'list');
    if (elements.viewCompactBtn) elements.viewCompactBtn.classList.toggle('active', mode === 'compact');
    if (elements.viewCardsBtn) elements.viewCardsBtn.classList.toggle('active', mode === 'cards');
    if (elements.viewDetailedBtn) elements.viewDetailedBtn.classList.toggle('active', false);
    renderChecklist();
    saveState();
  }

  function syncFilterTabUI() {
    const tabs = elements.filterTabsScroll.querySelectorAll('.filter-tab');
    tabs.forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.category === state.activeCategory);
    });
  }

  function syncSubFilterUI() {
    const statusBtns = document.querySelectorAll('[data-status]');
    statusBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.status === state.activeStatus);
    });

    const typeBtns = document.querySelectorAll('[data-type]');
    typeBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.type === state.activeType);
    });
  }

  // ==========================================================================
  // WATCH PARTY & LIVE SHARED PLAYLIST SYSTEM
  // WebRTC PeerJS + BroadcastChannel + QRious QR generator
  // ==========================================================================

  const partyController = {
    active: false,
    isHost: false,
    roomId: null,
    peer: null,
    connections: [],
    channel: null,
    members: [],
  };

  function initPartyProfile() {
    if (elements.partyUserNameInput) {
      elements.partyUserNameInput.value = state.partyProfile.name || 'Doctor Doom';
      elements.partyUserNameInput.addEventListener('input', (e) => {
        state.partyProfile.name = e.target.value.trim() || 'Hero';
        savePartyProfile();
        if (partyController.active) {
          const selfMem = partyController.members.find((m) => m.id === state.partyProfile.id);
          if (selfMem) selfMem.name = state.partyProfile.name;
          renderPartyMembersUI();
          broadcastPartyEvent({
            type: 'MEMBER_UPDATE',
            members: partyController.members,
          });
        }
      });
    }

    if (elements.partyAvatarPicker) {
      const avatarBtns = elements.partyAvatarPicker.querySelectorAll('.party-avatar-btn');
      avatarBtns.forEach((btn) => {
        if (btn.dataset.avatar === state.partyProfile.avatar) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }

        btn.addEventListener('click', () => {
          avatarBtns.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          state.partyProfile.avatar = btn.dataset.avatar;
          savePartyProfile();
          if (partyController.active) {
            const selfMem = partyController.members.find((m) => m.id === state.partyProfile.id);
            if (selfMem) selfMem.avatar = state.partyProfile.avatar;
            renderPartyMembersUI();
            broadcastPartyEvent({
              type: 'MEMBER_UPDATE',
              members: partyController.members,
            });
          }
        });
      });
    }
  }

  function openPartyModal() {
    if (!elements.partyModal) return;
    updatePartyLiveUI();
    elements.partyModal.classList.add('open');
  }

  function closePartyModal() {
    if (!elements.partyModal) return;
    elements.partyModal.classList.remove('open');
  }

  function switchPartyTab(tab) {
    if (!elements.tabHostBtn || !elements.tabJoinBtn) return;
    if (tab === 'host') {
      elements.tabHostBtn.classList.add('active');
      elements.tabJoinBtn.classList.remove('active');
      if (elements.hostTabContent) elements.hostTabContent.classList.add('active');
      if (elements.joinTabContent) elements.joinTabContent.classList.remove('active');
    } else {
      elements.tabJoinBtn.classList.add('active');
      elements.tabHostBtn.classList.remove('active');
      if (elements.joinTabContent) elements.joinTabContent.classList.add('active');
      if (elements.hostTabContent) elements.hostTabContent.classList.remove('active');
    }
  }

  function cleanRoomCode(code) {
    return String(code || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  }

  function getInviteUrl(roomId) {
    const u = new URL(window.location.href);
    if (roomId) {
      u.searchParams.set('party', roomId);
    } else {
      u.searchParams.delete('party');
    }
    return u.toString();
  }

  function renderPartyQr(url) {
    if (typeof QRious !== 'undefined' && elements.partyQrCanvas && url) {
      try {
        new QRious({
          element: elements.partyQrCanvas,
          value: url,
          size: 120,
          background: '#ffffff',
          foreground: '#06080d',
          level: 'M',
        });
      } catch (e) {
        console.warn('QRious render error:', e);
      }
    }
  }

  function createPartyRoom() {
    const roomId = `DOOM-${Math.floor(1000 + Math.random() * 9000)}`;
    partyController.active = true;
    partyController.isHost = true;
    partyController.roomId = roomId;
    partyController.members = [{ ...state.partyProfile, isHost: true }];
    partyController.connections = [];

    // BroadcastChannel for instant local cross-tab sync
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        if (partyController.channel) partyController.channel.close();
        partyController.channel = new BroadcastChannel('marvel_doomsday_party');
        partyController.channel.onmessage = (e) => handlePartyMessage(e.data);
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }

    // PeerJS host initialization
    if (typeof Peer !== 'undefined') {
      try {
        if (partyController.peer) partyController.peer.destroy();
        const peerId = `mcu-party-${cleanRoomCode(roomId).toLowerCase()}`;
        partyController.peer = new Peer(peerId, { debug: 0 });
        partyController.peer.on('connection', (conn) => {
          setupPeerConnection(conn);
        });
        partyController.peer.on('error', (err) => {
          console.warn('PeerJS host error/notice:', err);
        });
      } catch (e) {
        console.warn('PeerJS init error:', e);
      }
    }

    // Update URL query param cleanly
    const newUrl = getInviteUrl(roomId);
    window.history.replaceState({ party: roomId }, '', newUrl);

    updatePartyLiveUI();
    addPartyLog(state.partyProfile.avatar, `Started Watch Party ${roomId} as Host`);
    showToast(`Watch Party ${roomId} live! Share your invite link.`, state.partyProfile.avatar);
    playSound('fanfare');
  }

  function joinPartyRoom(rawInput) {
    if (!rawInput) return;
    let roomId = rawInput.trim();
    if (roomId.includes('party=')) {
      try {
        const u = new URL(roomId, window.location.origin);
        roomId = u.searchParams.get('party') || roomId;
      } catch (e) {}
    }
    roomId = roomId.toUpperCase().trim();
    if (!roomId) return;

    partyController.active = true;
    partyController.isHost = false;
    partyController.roomId = roomId;
    partyController.members = [{ ...state.partyProfile, isHost: false }];
    partyController.connections = [];

    // BroadcastChannel for instant local cross-tab sync
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        if (partyController.channel) partyController.channel.close();
        partyController.channel = new BroadcastChannel('marvel_doomsday_party');
        partyController.channel.onmessage = (e) => handlePartyMessage(e.data);
        // Announce join over broadcast channel
        partyController.channel.postMessage({
          type: 'GUEST_JOIN',
          roomId: partyController.roomId,
          user: state.partyProfile,
        });
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }

    // PeerJS guest initialization
    if (typeof Peer !== 'undefined') {
      try {
        if (partyController.peer) partyController.peer.destroy();
        partyController.peer = new Peer({ debug: 0 });
        partyController.peer.on('open', () => {
          const hostPeerId = `mcu-party-${cleanRoomCode(roomId).toLowerCase()}`;
          const conn = partyController.peer.connect(hostPeerId, { reliable: true });
          setupPeerConnection(conn);
        });
        partyController.peer.on('error', (err) => {
          console.warn('PeerJS guest notice:', err);
        });
      } catch (e) {
        console.warn('PeerJS guest init error:', e);
      }
    }

    // Update URL query param cleanly
    const newUrl = getInviteUrl(roomId);
    window.history.replaceState({ party: roomId }, '', newUrl);

    updatePartyLiveUI();
    addPartyLog(state.partyProfile.avatar, `Connecting to Party ${roomId}... Requesting sync`);
    showToast(`Joining Watch Party ${roomId}...`, state.partyProfile.avatar);
  }

  function leavePartyRoom() {
    if (!partyController.active) return;

    broadcastPartyEvent({
      type: 'MEMBER_LEAVE',
      user: state.partyProfile,
    });

    if (partyController.channel) {
      try {
        partyController.channel.close();
      } catch (e) {}
      partyController.channel = null;
    }

    if (partyController.peer) {
      try {
        partyController.peer.destroy();
      } catch (e) {}
      partyController.peer = null;
    }

    partyController.connections = [];
    partyController.active = false;
    partyController.isHost = false;
    partyController.roomId = null;
    partyController.members = [];

    const cleanUrl = getInviteUrl(null);
    window.history.replaceState({}, '', cleanUrl);

    updatePartyLiveUI();
    showToast('Left Watch Party', '👋');
  }

  function setupPeerConnection(conn) {
    if (!conn) return;

    conn.on('open', () => {
      if (!partyController.connections.includes(conn)) {
        partyController.connections.push(conn);
      }

      if (partyController.isHost) {
        // Send full checklist state to newly connected guest
        conn.send({
          type: 'FULL_SYNC',
          roomId: partyController.roomId,
          watched: Array.from(state.watched),
          watchedEpisodes: Array.from(state.watchedEpisodes),
          optional: Array.from(state.optional),
          members: partyController.members,
          hostUser: state.partyProfile,
        });
      } else {
        // Guest sends its identity
        conn.send({
          type: 'GUEST_JOIN',
          roomId: partyController.roomId,
          user: state.partyProfile,
        });
      }
    });

    conn.on('data', (data) => {
      handlePartyMessage(data, conn);
    });

    conn.on('close', () => {
      partyController.connections = partyController.connections.filter((c) => c !== conn);
    });

    conn.on('error', (err) => {
      console.warn('Peer connection error:', err);
    });
  }

  function broadcastPartyEvent(payload) {
    if (!partyController.active || !partyController.roomId) return;
    const msg = {
      ...payload,
      roomId: partyController.roomId,
      user: state.partyProfile,
    };

    // BroadcastChannel (local tabs / instant)
    if (partyController.channel) {
      try {
        partyController.channel.postMessage(msg);
      } catch (e) {}
    }

    // PeerJS remote connections
    partyController.connections.forEach((conn) => {
      if (conn && conn.open) {
        try {
          conn.send(msg);
        } catch (e) {}
      }
    });
  }

  function handlePartyMessage(data, sourceConn) {
    if (!data || data.roomId !== partyController.roomId) return;
    if (data.user && data.user.id === state.partyProfile.id) return;

    switch (data.type) {
      case 'GUEST_JOIN': {
        if (partyController.isHost && data.user) {
          const exists = partyController.members.find((m) => m.id === data.user.id);
          if (!exists) {
            partyController.members.push(data.user);
          }
          renderPartyMembersUI();

          // Reply with FULL_SYNC
          const syncPayload = {
            type: 'FULL_SYNC',
            roomId: partyController.roomId,
            watched: Array.from(state.watched),
            watchedEpisodes: Array.from(state.watchedEpisodes),
            optional: Array.from(state.optional),
            members: partyController.members,
            hostUser: state.partyProfile,
          };
          if (sourceConn && sourceConn.open) {
            sourceConn.send(syncPayload);
          }
          if (partyController.channel) {
            partyController.channel.postMessage(syncPayload);
          }

          // Broadcast member update to other peers
          broadcastPartyEvent({
            type: 'MEMBER_UPDATE',
            members: partyController.members,
          });

          addPartyLog(data.user.avatar || '⚡', `${data.user.name} joined the watch party!`);
          updatePartyTicker(`⚡ ${data.user.name} joined the squad!`);
          showToast(`${data.user.name} joined the watch party!`, data.user.avatar || '⚡');
          playSound('fanfare');
        }
        break;
      }

      case 'FULL_SYNC': {
        if (!partyController.isHost) {
          if (Array.isArray(data.watched)) state.watched = new Set(data.watched);
          if (Array.isArray(data.watchedEpisodes)) state.watchedEpisodes = new Set(data.watchedEpisodes);
          if (Array.isArray(data.optional)) state.optional = new Set(data.optional);
          if (Array.isArray(data.members)) {
            // Keep self in members list
            const hasSelf = data.members.some((m) => m.id === state.partyProfile.id);
            partyController.members = hasSelf ? data.members : [...data.members, state.partyProfile];
            renderPartyMembersUI();
          }

          saveState();
          updateHUD();
          renderChecklist();

          addPartyLog('⚡', `Synced checklist with Host (${state.watched.size} titles watched)`);
          updatePartyTicker(`Playlist synchronized with Host`);
          showToast(`Checklist synced with ${data.hostUser?.name || 'Host'}!`, data.hostUser?.avatar || '⚡');
        }
        break;
      }

      case 'ITEM_TOGGLE': {
        toggleItemWatch(data.id, data.checked, null, null, true);
        const item = MARVEL_CHECKLIST.find((x) => x.id === data.id);
        const title = item ? item.canonicalTitle : `Title #${data.id}`;
        const verb = data.checked ? 'watched' : 'unwatched';
        const senderName = data.user?.name || 'A friend';
        const senderAvatar = data.user?.avatar || '⚡';

        showToast(`${senderName} marked "${title}" as ${verb}!`, senderAvatar);
        addPartyLog(senderAvatar, `${senderName} marked "${title}" as ${verb}`);
        updatePartyTicker(`⚡ ${senderName} ${verb} "${title}"`);

        // If host, forward to other peer connections
        if (partyController.isHost) {
          partyController.connections.forEach((conn) => {
            if (conn !== sourceConn && conn.open) {
              conn.send(data);
            }
          });
        }
        break;
      }

      case 'EPISODE_TOGGLE': {
        toggleEpisodeWatch(data.seriesId, data.epNum, data.checked, null, null, true);
        const sItem = MARVEL_CHECKLIST.find((x) => x.id === data.seriesId);
        const sTitle = sItem ? sItem.canonicalTitle : 'Series';
        const senderName = data.user?.name || 'A friend';
        const senderAvatar = data.user?.avatar || '⚡';
        const epVerb = data.checked ? 'watched' : 'unwatched';

        showToast(`${senderName} ${epVerb} ${sTitle} Ep ${data.epNum}`, senderAvatar);
        addPartyLog(senderAvatar, `${senderName} ${epVerb} ${sTitle} Ep ${data.epNum}`);
        updatePartyTicker(`⚡ ${senderName} ${epVerb} ${sTitle} Ep ${data.epNum}`);

        if (partyController.isHost) {
          partyController.connections.forEach((conn) => {
            if (conn !== sourceConn && conn.open) {
              conn.send(data);
            }
          });
        }
        break;
      }

      case 'OPTIONAL_TOGGLE': {
        toggleItemOptional(data.id, true);
        if (partyController.isHost) {
          partyController.connections.forEach((conn) => {
            if (conn !== sourceConn && conn.open) {
              conn.send(data);
            }
          });
        }
        break;
      }

      case 'MEMBER_UPDATE': {
        if (Array.isArray(data.members)) {
          partyController.members = data.members;
          renderPartyMembersUI();
        }
        break;
      }

      case 'MEMBER_LEAVE': {
        if (data.user) {
          partyController.members = partyController.members.filter((m) => m.id !== data.user.id);
          renderPartyMembersUI();
          showToast(`${data.user.name} left the party.`);
          addPartyLog('🚪', `${data.user.name} left the party`);
        }
        break;
      }
    }
  }

  function updatePartyLiveUI() {
    if (partyController.active && partyController.roomId) {
      if (elements.partyLiveBar) elements.partyLiveBar.style.display = 'flex';
      if (elements.openPartyBtn) elements.openPartyBtn.classList.add('in-party');
      if (elements.partyMemberCounter) {
        elements.partyMemberCounter.style.display = 'inline-block';
        elements.partyMemberCounter.textContent = partyController.members.length || '1';
      }
      if (elements.partyRoomCodeDisplay) elements.partyRoomCodeDisplay.textContent = partyController.roomId;
      if (elements.partyModalRoomCode) elements.partyModalRoomCode.textContent = partyController.roomId;
      if (elements.partyRoleText) {
        elements.partyRoleText.textContent = partyController.isHost ? 'Hosting Watch Party' : 'Connected to Watch Party';
      }

      const inviteUrl = getInviteUrl(partyController.roomId);
      if (elements.partyInviteUrlInput) elements.partyInviteUrlInput.value = inviteUrl;

      if (elements.partyConnectedView) elements.partyConnectedView.style.display = 'block';
      if (elements.partyDisconnectedView) elements.partyDisconnectedView.style.display = 'none';
      if (elements.btnModalLeaveParty) elements.btnModalLeaveParty.style.display = 'inline-block';

      renderPartyQr(inviteUrl);
      renderPartyMembersUI();
    } else {
      if (elements.partyLiveBar) elements.partyLiveBar.style.display = 'none';
      if (elements.openPartyBtn) elements.openPartyBtn.classList.remove('in-party');
      if (elements.partyMemberCounter) elements.partyMemberCounter.style.display = 'none';
      if (elements.partyConnectedView) elements.partyConnectedView.style.display = 'none';
      if (elements.partyDisconnectedView) elements.partyDisconnectedView.style.display = 'block';
      if (elements.btnModalLeaveParty) elements.btnModalLeaveParty.style.display = 'none';
    }
  }

  function renderPartyMembersUI() {
    const members = partyController.members;
    const count = members.length;

    if (elements.partyMembersCount) elements.partyMembersCount.textContent = count;
    if (elements.partyMemberCounter) elements.partyMemberCounter.textContent = count;

    // Live bar stack
    if (elements.partyMembersStack) {
      elements.partyMembersStack.innerHTML = members
        .map(
          (m) => `
        <span class="member-avatar-chip ${m.isHost ? 'is-host' : ''}" title="${escapeHtml(m.name)} (${m.isHost ? 'Host' : 'Member'})">
          ${m.avatar || '⚡'} ${escapeHtml(m.name)}
        </span>
      `
        )
        .join('');
    }

    // Modal members list
    if (elements.partyMembersList) {
      elements.partyMembersList.innerHTML = members
        .map(
          (m) => `
        <div class="party-member-card ${m.id === state.partyProfile.id ? 'self' : ''}">
          <span class="party-member-avatar">${m.avatar || '⚡'}</span>
          <div class="party-member-info">
            <div class="party-member-name">${escapeHtml(m.name)}${m.id === state.partyProfile.id ? ' (You)' : ''}</div>
            <div class="party-member-role">${m.isHost ? '👑 Party Host' : '⚡ Connected Friend'}</div>
          </div>
        </div>
      `
        )
        .join('');
    }
  }

  function updatePartyTicker(text) {
    if (elements.tickerText) {
      elements.tickerText.textContent = text;
    }
  }

  function addPartyLog(avatar, text) {
    if (!elements.partyHistoryLog) return;
    const emptyPlaceholder = elements.partyHistoryLog.querySelector('.empty');
    if (emptyPlaceholder) emptyPlaceholder.remove();

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const item = document.createElement('div');
    item.className = 'party-log-item';
    item.innerHTML = `
      <span>${avatar}</span>
      <span>${escapeHtml(text)}</span>
      <span class="party-log-time">${time}</span>
    `;
    elements.partyHistoryLog.insertBefore(item, elements.partyHistoryLog.firstChild);

    // Limit log length to 25 items
    while (elements.partyHistoryLog.children.length > 25) {
      elements.partyHistoryLog.lastChild.remove();
    }
  }

  function copyPartyInviteLink() {
    const url = getInviteUrl(partyController.roomId || '');
    navigator.clipboard
      .writeText(url)
      .then(() => {
        showToast('Invite link copied to clipboard!', '🔗');
      })
      .catch(() => {
        if (elements.partyInviteUrlInput) {
          elements.partyInviteUrlInput.select();
          document.execCommand('copy');
        }
        showToast('Invite link copied!', '🔗');
      });
  }

  function copyPartyRoomCode() {
    if (!partyController.roomId) return;
    navigator.clipboard
      .writeText(partyController.roomId)
      .then(() => {
        showToast(`Room code ${partyController.roomId} copied!`, '📋');
      })
      .catch(() => {
        showToast(`Room: ${partyController.roomId}`);
      });
  }

  // --- SETUP EVENT LISTENERS ---
  function setupEvents() {
    // Search
    elements.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      elements.searchClearBtn.style.display = state.searchQuery ? 'block' : 'none';
      renderChecklist();
    });

    elements.searchClearBtn.addEventListener('click', () => {
      elements.searchInput.value = '';
      state.searchQuery = '';
      elements.searchClearBtn.style.display = 'none';
      renderChecklist();
      elements.searchInput.focus();
    });

    // Sort select
    elements.sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderChecklist();
    });

    // View size mode toggles
    if (elements.viewListBtn) elements.viewListBtn.addEventListener('click', () => setViewMode('list'));
    if (elements.viewCompactBtn) elements.viewCompactBtn.addEventListener('click', () => setViewMode('compact'));
    if (elements.viewCardsBtn) elements.viewCardsBtn.addEventListener('click', () => setViewMode('cards'));
    if (elements.viewDetailedBtn) elements.viewDetailedBtn.addEventListener('click', () => setViewMode('detailed'));

    // Sound toggle
    elements.soundToggleBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      elements.soundToggleBtn.classList.toggle('active', state.soundEnabled);
      saveState();
      showToast(state.soundEnabled ? 'Sound Enabled' : 'Sound Muted');
      if (state.soundEnabled) playSound('check');
    });

    // Theme Selector
    elements.themePills.forEach((pill) => {
      pill.addEventListener('click', () => {
        setTheme(pill.dataset.theme);
      });
    });

    // Category Filter Tabs
    elements.filterTabsScroll.addEventListener('click', (e) => {
      const tab = e.target.closest('.filter-tab');
      if (!tab) return;
      state.activeCategory = tab.dataset.category;
      syncFilterTabUI();
      renderChecklist();
    });

    // Status Segmented Buttons
    document.querySelectorAll('[data-status]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.activeStatus = btn.dataset.status;
        syncSubFilterUI();
        renderChecklist();
      });
    });

    // Media Type Segmented Buttons
    document.querySelectorAll('[data-type]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.activeType = btn.dataset.type;
        syncSubFilterUI();
        renderChecklist();
      });
    });

    // Random Pick
    elements.randomPickBtn.addEventListener('click', pickRandomUnwatched);

    // Export Modal
    elements.exportBtn.addEventListener('click', openExportModal);
    elements.closeExportBtn.addEventListener('click', closeExportModal);
    elements.copyExportBtn.addEventListener('click', copyExportText);

    // Import Trigger
    elements.importBtn.addEventListener('click', () => {
      elements.importFileInput.click();
    });
    elements.importFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleImportJSON(e.target.files[0]);
      }
    });

    // Reset All with Confirmation
    elements.resetBtn.addEventListener('click', () => {
      const confirmed = window.confirm(
        'Are you sure you want to reset all checklist progress? This will uncheck all 115 titles and episodes.'
      );
      if (confirmed) {
        state.watched.clear();
        state.watchedEpisodes.clear();
        state.expandedSeries.clear();
        saveState();
        updateHUD();
        renderChecklist();
        showToast('All progress reset to uncheck');
      }
    });

    // Notes Modal buttons
    elements.saveNotesBtn.addEventListener('click', saveNotes);
    elements.closeNotesBtn.addEventListener('click', closeNotesModal);
    elements.notesModal.addEventListener('click', (e) => {
      if (e.target === elements.notesModal) closeNotesModal();
    });
    elements.exportModal.addEventListener('click', (e) => {
      if (e.target === elements.exportModal) closeExportModal();
    });

    // Watch Party Hub & Modal events
    if (elements.openPartyBtn) elements.openPartyBtn.addEventListener('click', openPartyModal);
    if (elements.closePartyBtn) elements.closePartyBtn.addEventListener('click', closePartyModal);
    if (elements.btnClosePartyModal) elements.btnClosePartyModal.addEventListener('click', closePartyModal);
    if (elements.partyManageBtn) elements.partyManageBtn.addEventListener('click', openPartyModal);
    if (elements.partyModal) {
      elements.partyModal.addEventListener('click', (e) => {
        if (e.target === elements.partyModal) closePartyModal();
      });
    }

    if (elements.tabHostBtn) elements.tabHostBtn.addEventListener('click', () => switchPartyTab('host'));
    if (elements.tabJoinBtn) elements.tabJoinBtn.addEventListener('click', () => switchPartyTab('join'));

    if (elements.btnCreateParty) elements.btnCreateParty.addEventListener('click', createPartyRoom);
    if (elements.btnJoinParty) {
      elements.btnJoinParty.addEventListener('click', () => {
        joinPartyRoom(elements.partyRoomCodeInput ? elements.partyRoomCodeInput.value : '');
      });
    }
    if (elements.partyRoomCodeInput) {
      elements.partyRoomCodeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          joinPartyRoom(elements.partyRoomCodeInput.value);
        }
      });
    }

    if (elements.partyShareLinkBtn) elements.partyShareLinkBtn.addEventListener('click', copyPartyInviteLink);
    if (elements.btnCopyInviteLink) elements.btnCopyInviteLink.addEventListener('click', copyPartyInviteLink);
    if (elements.partyRoomChip) elements.partyRoomChip.addEventListener('click', copyPartyRoomCode);
    if (elements.partyLeaveBtn) elements.partyLeaveBtn.addEventListener('click', leavePartyRoom);
    if (elements.btnModalLeaveParty) elements.btnModalLeaveParty.addEventListener('click', leavePartyRoom);

    // Keyboard ESC to close modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeNotesModal();
        closeExportModal();
        closePartyModal();
      }
    });
  }

  // --- INITIALIZATION ---
  function init() {
    loadState();
    initPartyProfile();
    setTheme(state.theme);
    elements.soundToggleBtn.classList.toggle('active', state.soundEnabled);
    setViewMode(state.viewMode || 'list');

    initStarfield();
    setupEvents();
    syncFilterTabUI();
    syncSubFilterUI();
    updateHUD();
    renderChecklist();

    // Start Real-Time Doomsday Countdown
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Check for incoming invite via URL param (?party=DOOM-XXXX)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const partyCode = urlParams.get('party');
      if (partyCode) {
        joinPartyRoom(partyCode);
      }
    } catch (e) {
      console.warn('Error reading party URL param:', e);
    }
  }

  // Expose for testing and external hooks
  window.doomsdayApp = {
    state,
    partyController,
    createPartyRoom,
    joinPartyRoom,
    leavePartyRoom,
    openPartyModal,
    closePartyModal,
    toggleEpisodeWatch,
    toggleItemWatch,
    toggleEpisodesDropdown,
    syncSeriesDOM,
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
