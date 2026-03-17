/* =============================================
   100 Pushups — App Logic
   ============================================= */

// ---- State ----
let state = {
  initialized: false,
  levelId: null,          // current level id (e.g. '11-20')
  currentDayIndex: 0,     // 0-based index into level.days
  cycleStartDate: null,   // ISO date string of when this cycle started
  history: [],            // array of completed sessions
  activeScreen: 'workout',
};

// Workout session (in-memory, not persisted until complete)
let session = {
  active: false,
  dayIndex: 0,
  currentSetIndex: 0,     // which set is next
  setResults: [],         // { reps: number } per set
};

// Timer
let timerState = {
  running: false,
  total: 0,
  remaining: 0,
  intervalId: null,
  onDone: null,
  wakeLock: null,
};

// Beep sound helper
function playBeep() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.frequency.value = 440; // A4 note
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch(e) {
    console.warn('Beep failed:', e);
  }
}

// ---- Persistence ----
const STORAGE_KEY = 'pushups100_v1';

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      Object.assign(state, saved);
    }
  } catch(e) {
    console.warn('Failed to load state:', e);
  }
}

// ---- Helpers ----
function getCurrentLevel() {
  return PROGRAM_DATA.levels.find(l => l.id === state.levelId) || null;
}

function getCurrentDay() {
  const level = getCurrentLevel();
  if (!level) return null;
  return level.days[state.currentDayIndex] || null;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
}

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

// ---- Navigation ----
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const navBtn = document.querySelector(`.nav-btn[data-screen="${name}"]`);
  if (navBtn) navBtn.classList.add('active');
  state.activeScreen = name;
  saveState(); // Always persist screen state

  if (name === 'workout') renderWorkoutScreen();
  if (name === 'progress') renderProgressScreen();
  if (name === 'info') renderInfoScreen();
}

// ---- Onboarding ----
function startProgram(testResult) {
  const level = getLevelForTestResult(testResult);
  state.levelId = level.id;
  state.currentDayIndex = 0;
  state.cycleStartDate = todayStr();
  state.initialized = true;
  // DO NOT wipe history - preserve it across levels
  saveState();
  showScreen('workout');
}

// ---- Workout Screen ----
function getWorkoutStatus() {
  const level = getCurrentLevel();
  if (!level) return { status: 'no-program' };

  const lastSession = state.history.filter(h => h.levelId === state.levelId).slice(-1)[0];
  const today = todayStr();

  // Check if cycle is complete
  if (state.currentDayIndex >= level.days.length) {
    return { status: 'cycle-complete' };
  }

  // Check if there's a rest day requirement before next session
  if (lastSession) {
    const daysSince = daysBetween(lastSession.date, today);
    const requiredBreak = lastSession.breakDays || 1;
    if (daysSince < requiredBreak) {
      const nextDate = new Date(lastSession.date);
      nextDate.setDate(nextDate.getDate() + requiredBreak);
      return {
        status: 'rest',
        nextDate: nextDate.toISOString().slice(0, 10),
        daysLeft: requiredBreak - daysSince,
      };
    }
  }

  return {
    status: 'workout',
    dayIndex: state.currentDayIndex,
    day: level.days[state.currentDayIndex],
    level,
  };
}

function renderWorkoutScreen() {
  const container = document.getElementById('workout-content');
  const ws = getWorkoutStatus();

  if (ws.status === 'no-program') {
    container.innerHTML = `
      <div class="card rest-day-card">
        <div class="big-emoji">🏋️</div>
        <h2>No program set</h2>
        <p>Go to settings to start or reset your program.</p>
      </div>`;
    return;
  }

  if (ws.status === 'rest') {
    const level = getCurrentLevel();
    container.innerHTML = `
      <div class="card rest-day-card slide-up">
        <div class="big-emoji">😴</div>
        <h2>Rest Day${ws.daysLeft > 1 ? 's' : ''}</h2>
        <p>Your muscles are recovering and getting stronger.</p>
        <p>Next session available <strong>${formatDate(ws.nextDate)}</strong>${ws.daysLeft > 1 ? ` (in ${ws.daysLeft} days)` : ' (tomorrow)'}.</p>
        <p style="margin-top:12px; font-size:0.8rem;">You're on <strong>${level ? level.label : ''}</strong>, Day ${state.currentDayIndex + 1} next.</p>
        <div style="margin-top:20px;">
          <button class="btn btn-secondary btn-full" onclick="showReTestModal()">🧪 Retake Test</button>
        </div>
      </div>`;
    return;
  }

  if (ws.status === 'cycle-complete') {
    const level = getCurrentLevel();
    const levelIndex = PROGRAM_DATA.levels.findIndex(l => l.id === state.levelId);
    const nextLevel = PROGRAM_DATA.levels[levelIndex + 1];
    container.innerHTML = `
      <div class="card cycle-complete-card slide-up">
        <div class="big-emoji">🎉</div>
        <h2>Cycle Complete!</h2>
        <p>You've finished the <strong>${level ? level.label : ''}</strong> training cycle.</p>
        <p>Rest for at least 2 days, then do a push-up test to start your next cycle.</p>
        ${nextLevel ? `<p style="margin-top:8px;">Expected next level: <strong>${nextLevel.label}</strong></p>` : '<p style="color:var(--primary);font-weight:700;">You\'ve reached the final level! Go for 100! 💪</p>'}
        <div style="margin-top:24px; display:flex; flex-direction:column; gap:10px;">
          <button class="btn btn-primary btn-full" onclick="showReTestModal()">🧪 Take New Test</button>
          <button class="btn btn-secondary btn-full" onclick="repeatCycle()">🔁 Repeat This Cycle</button>
        </div>
      </div>`;
    return;
  }

  // Normal workout day
  const { day, dayIndex, level } = ws;
  const totalDays = level.days.length;
  const setsDone = session.active && session.dayIndex === dayIndex ? session.currentSetIndex : 0;
  const progress = setsDone / day.sets.length;

  let setsHtml = '';
  for (let i = 0; i < day.sets.length; i++) {
    const set = day.sets[i];
    const isDone = session.active && i < session.currentSetIndex;
    const isActive = session.active && i === session.currentSetIndex;
    const result = session.setResults[i];

    let repText, repLabel, actionHtml;

    if (set.isMax) {
      repText = `${set.minReps}+`;
      repLabel = `as many as you can (min ${set.minReps})`;
    } else {
      repText = set.reps;
      repLabel = 'push-ups';
    }

    if (isDone) {
      actionHtml = `<span class="set-check">✅</span>`;
    } else if (isActive) {
      if (set.isMax) {
        actionHtml = `
          <div class="max-input-row">
            <input type="number" class="max-reps-input" id="max-input-${i}" 
              placeholder="${set.minReps}" min="0" max="200" inputmode="numeric">
            <button class="btn-done" onclick="completeSet(${i})">Done</button>
          </div>`;
      } else {
        actionHtml = `<button class="btn-done" onclick="completeSet(${i})">Done</button>`;
      }
    } else {
      actionHtml = '';
    }

    setsHtml += `
      <div class="set-item ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}" id="set-${i}">
        <div class="set-num">${i + 1}</div>
        <div class="set-info">
          <div class="set-reps">${repText} <span style="font-size:0.85rem;font-weight:400">reps</span></div>
          <div class="set-reps-label">${repLabel}</div>
          ${isDone && result ? `<div class="set-actual">✓ ${result.reps} done</div>` : ''}
        </div>
        <div class="set-action">${actionHtml}</div>
      </div>`;
  }

  const allDone = session.active && session.currentSetIndex >= day.sets.length;
  const dayLabel = `Day ${dayIndex + 1} of ${totalDays}`;

  container.innerHTML = `
    <div class="workout-header">
      <div class="workout-meta">
        <span class="workout-badge">${level.label}</span>
        <span style="font-size:0.8rem;color:var(--text-muted)">${dayLabel}</span>
        <button style="background:none;border:none;color:var(--text-muted);font-size:1.2rem;cursor:pointer;padding:2px 8px;margin-left:auto;" onclick="showReTestModal()" title="Retake test">🧪</button>
      </div>
      <div class="workout-title">Today's Workout</div>
      <div class="workout-subtitle">Rest ${day.rest}s between sets • ${day.sets.length} sets total</div>
      <div class="workout-progress-bar">
        <div class="workout-progress-fill" style="width:${progress * 100}%"></div>
      </div>
    </div>
    <div class="rest-ribbon">
      ⏱️ Rest <strong>${day.rest} seconds</strong> between sets
      &nbsp;•&nbsp; After this session: <strong>min ${day.breakDays} day${day.breakDays > 1 ? 's' : ''} rest</strong>
    </div>
    <div class="sets-list">${setsHtml}</div>
    ${!session.active ? `
      <div class="workout-complete-btn">
        <button class="btn btn-primary btn-full" onclick="startSession(${dayIndex})">
          💪 Start Workout
        </button>
      </div>` : ''}
    ${allDone ? `
      <div class="workout-complete-btn">
        <button class="btn btn-primary btn-full pulse" onclick="completeWorkout()">
          ✅ Complete Day ${dayIndex + 1}
        </button>
      </div>` : ''}
  `;
}

function startSession(dayIndex) {
  session = {
    active: true,
    dayIndex,
    currentSetIndex: 0,
    setResults: [],
  };
  renderWorkoutScreen();
  // Scroll to active set
  setTimeout(() => {
    const el = document.getElementById(`set-0`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
}

function completeSet(setIndex) {
  const day = getCurrentDay();
  if (!day) return;
  const set = day.sets[setIndex];

  let repsActual;
  if (set.isMax) {
    const inp = document.getElementById(`max-input-${setIndex}`);
    repsActual = inp ? (parseInt(inp.value) || set.minReps) : set.minReps;
    if (repsActual < set.minReps) {
      showToast(`Minimum ${set.minReps} reps required for this set`);
      return;
    }
  } else {
    repsActual = set.reps;
  }

  session.setResults[setIndex] = { reps: repsActual };
  session.currentSetIndex = setIndex + 1;

  // Show rest timer if there's another set coming
  if (setIndex + 1 < day.sets.length) {
    const nextSet = day.sets[setIndex + 1];
    const nextLabel = nextSet.isMax
      ? `Set ${setIndex + 2}: ${nextSet.minReps}+ reps (max)`
      : `Set ${setIndex + 2}: ${nextSet.reps} reps`;

    showTimer(day.rest, nextLabel, () => {
      renderWorkoutScreen();
      setTimeout(() => {
        const el = document.getElementById(`set-${setIndex + 1}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    });
  } else {
    renderWorkoutScreen();
    setTimeout(() => {
      const el = document.querySelector('.workout-complete-btn .btn');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }
}

function completeWorkout() {
  const day = getCurrentDay();
  if (!day) return;

  const totalReps = session.setResults.reduce((s, r) => s + (r ? r.reps : 0), 0);

  const record = {
    date: todayStr(),
    levelId: state.levelId,
    dayIndex: state.currentDayIndex,
    reps: totalReps,
    setResults: [...session.setResults],
    breakDays: day.breakDays,
  };

  state.history.push(record);
  state.currentDayIndex++;
  session = { active: false, dayIndex: 0, currentSetIndex: 0, setResults: [] };
  saveState();

  showToast(`Day ${record.dayIndex + 1} complete! 💪 ${totalReps} total reps`);
  renderWorkoutScreen();
}

// ---- Re-test / Level Change ----
function showReTestModal() {
  const modal = document.getElementById('retest-modal');
  modal.classList.add('visible');
  document.getElementById('retest-input').value = '';
  document.getElementById('retest-input').focus();
}

function hideReTestModal() {
  document.getElementById('retest-modal').classList.remove('visible');
}

function submitReTest() {
  const val = parseInt(document.getElementById('retest-input').value);
  if (isNaN(val) || val < 0) {
    showToast('Please enter a valid number');
    return;
  }
  
  const clearHistory = document.getElementById('retest-clear-history').checked;
  
  hideReTestModal();
  const level = getLevelForTestResult(val);
  state.levelId = level.id;
  state.currentDayIndex = 0;
  state.cycleStartDate = todayStr();
  
  if (clearHistory) {
    state.history = [];
  }
  
  session = { active: false, dayIndex: 0, currentSetIndex: 0, setResults: [] };
  saveState();
  showToast(`Starting ${level.label} cycle!`);
  showScreen('workout');
}

function repeatCycle() {
  state.currentDayIndex = 0;
  state.cycleStartDate = todayStr();
  session = { active: false, dayIndex: 0, currentSetIndex: 0, setResults: [] };
  saveState();
  showToast('Cycle restarted!');
  renderWorkoutScreen();
}

// ---- Rest Timer ----
const CIRCUMFERENCE = 2 * Math.PI * 88; // radius 88

function showTimer(seconds, nextSetLabel, onDone) {
  const overlay = document.getElementById('timer-overlay');
  const digits = document.getElementById('timer-digits');
  const fill = document.getElementById('timer-ring-fill');
  const nextInfo = document.getElementById('timer-next-info');

  nextInfo.innerHTML = `Next up: <strong>${nextSetLabel}</strong>`;
  fill.style.strokeDasharray = CIRCUMFERENCE;

  overlay.classList.add('visible');
  timerState.running = true;
  timerState.total = seconds;
  timerState.remaining = seconds;
  timerState.onDone = onDone;

  // Request screen wake lock
  if ('wakeLock' in navigator) {
    navigator.wakeLock.request('screen').then(wl => {
      timerState.wakeLock = wl;
    }).catch(e => {
      console.warn('Wake lock failed:', e);
    });
  }

  function tick() {
    if (!timerState.running) return;
    const progress = timerState.remaining / timerState.total;
    const offset = CIRCUMFERENCE * (1 - progress);
    fill.style.strokeDashoffset = offset;
    digits.textContent = timerState.remaining;

    // Beep for last 5 seconds
    if (timerState.remaining > 0 && timerState.remaining <= 5) {
      playBeep();
    }

    if (timerState.remaining <= 0) {
      finishTimer();
      return;
    }
    timerState.remaining--;
    timerState.intervalId = setTimeout(tick, 1000);
  }

  tick();
}

function finishTimer() {
  timerState.running = false;
  clearTimeout(timerState.intervalId);
  const overlay = document.getElementById('timer-overlay');
  overlay.classList.remove('visible');
  
  // Release screen wake lock
  if (timerState.wakeLock) {
    timerState.wakeLock.release().catch(e => {
      console.warn('Wake lock release failed:', e);
    });
    timerState.wakeLock = null;
  }
  
  if (timerState.onDone) timerState.onDone();
}

function skipTimer() {
  timerState.remaining = 0;
  finishTimer();
}

// ---- Progress Screen ----
function renderProgressScreen() {
  const level = getCurrentLevel();
  const history = state.history;
  const totalSessions = history.length;
  const totalReps = history.reduce((s, h) => s + (h.reps || 0), 0);

  // Current cycle sessions
  const cycleHistory = level
    ? history.filter(h => h.levelId === state.levelId)
    : [];

  const daysDone = state.currentDayIndex;
  const totalDays = level ? level.days.length : 0;

  const container = document.getElementById('progress-content');
  container.innerHTML = `
    <div class="progress-stat-row">
      <div class="stat-card">
        <div class="stat-value">${totalSessions}</div>
        <div class="stat-label">Total Sessions</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${totalReps.toLocaleString()}</div>
        <div class="stat-label">Total Reps</div>
      </div>
    </div>
    <div class="progress-stat-row">
      <div class="stat-card">
        <div class="stat-value">${daysDone}/${totalDays}</div>
        <div class="stat-label">Current Cycle Days</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${level ? level.label.split('–')[0].trim() : '—'}</div>
        <div class="stat-label">Current Level</div>
      </div>
    </div>
    <div class="history-section">
      <h3>Session History</h3>
      <div class="history-list">
        ${history.length === 0 ? '<div class="history-empty">No sessions yet. Start your first workout! 💪</div>' :
          [...history].reverse().map(h => {
            const lv = PROGRAM_DATA.levels.find(l => l.id === h.levelId);
            return `
              <div class="history-item">
                <div class="history-icon">💪</div>
                <div class="history-info">
                  <div class="history-date">${formatDate(h.date)}</div>
                  <div class="history-detail">${lv ? lv.label : h.levelId} — Day ${(h.dayIndex || 0) + 1}</div>
                </div>
                <div class="history-reps">${h.reps} reps</div>
              </div>`;
          }).join('')}
      </div>
    </div>
  `;
}

// ---- Info Screen ----
function renderInfoScreen() {
  const level = getCurrentLevel();
  const container = document.getElementById('info-content');
  container.innerHTML = `
    <div class="settings-section">
      <h3>Your Program</h3>
      <div class="settings-list">
        <div class="settings-row">
          <div class="settings-icon">📊</div>
          <div class="settings-text">
            <p>Current Level</p>
            <small>Based on your last test</small>
          </div>
          <div class="settings-value">${level ? level.label : 'Not set'}</div>
        </div>
        <div class="settings-row">
          <div class="settings-icon">📅</div>
          <div class="settings-text">
            <p>Cycle Started</p>
          </div>
          <div class="settings-value">${state.cycleStartDate ? formatDate(state.cycleStartDate) : '—'}</div>
        </div>
        <div class="settings-row">
          <div class="settings-icon">🗓️</div>
          <div class="settings-text">
            <p>Current Day</p>
          </div>
          <div class="settings-value">Day ${state.currentDayIndex + 1} of ${level ? level.days.length : '?'}</div>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <h3>Actions</h3>
      <div class="settings-list">
        <div class="settings-row" style="cursor:pointer" onclick="showReTestModal()">
          <div class="settings-icon">🧪</div>
          <div class="settings-text">
            <p>Take Test / Change Level</p>
            <small>Enter new test result to switch level</small>
          </div>
          <div class="settings-value">›</div>
        </div>
        <div class="settings-row" style="cursor:pointer" onclick="if(confirm('Reset all progress?')) resetAll()">
          <div class="settings-icon">🗑️</div>
          <div class="settings-text">
            <p style="color:var(--danger)">Reset All Data</p>
            <small>Clears all history and progress</small>
          </div>
          <div class="settings-value">›</div>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <h3>Program Rules</h3>
      <div class="rule-item"><span class="rule-num">1</span> Do the test — however many consecutive push-ups you can do. This sets your starting level.</div>
      <div class="rule-item"><span class="rule-num">2</span> Follow the training plan for your level. Rest at least 1 day between sessions, and at least 2 days after every 3rd session.</div>
      <div class="rule-item"><span class="rule-num">3</span> If you can't complete a day, rest 2–3 days and try again. Your strength will improve.</div>
      <div class="rule-item"><span class="rule-num">4</span> After finishing a cycle, rest 2+ days, then do the test again to find your next level.</div>
      <div class="rule-item"><span class="rule-num">5</span> Repeat until you reach 100 consecutive push-ups. Remember: 30 is already great for health and fitness!</div>
    </div>

    <div class="settings-section">
      <h3>About</h3>
      <div class="settings-list">
        <div class="settings-row">
          <div class="settings-icon">🌐</div>
          <div class="settings-text">
            <p>Program designed by</p>
            <small>100pushups.net</small>
          </div>
        </div>
      </div>
    </div>
  `;
}

function resetAll() {
  localStorage.removeItem(STORAGE_KEY);
  state = {
    initialized: false,
    levelId: null,
    currentDayIndex: 0,
    cycleStartDate: null,
    history: [],
    activeScreen: 'workout',
  };
  session = { active: false, dayIndex: 0, currentSetIndex: 0, setResults: [] };
  location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
  // Welcome screen
  document.getElementById('welcome-start-btn').addEventListener('click', () => {
    const val = parseInt(document.getElementById('welcome-input').value);
    if (isNaN(val) || val < 0) {
      showToast('Please enter a valid number (0 or more)');
      return;
    }
    document.getElementById('bottom-nav').style.display = 'flex';
    startProgram(val);
  });

  document.getElementById('welcome-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('welcome-start-btn').click();
  });

  // Nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => showScreen(btn.dataset.screen));
  });

  // Timer skip
  document.getElementById('timer-skip').addEventListener('click', skipTimer);

  // Retest modal
  document.getElementById('retest-close').addEventListener('click', hideReTestModal);
  document.getElementById('retest-submit').addEventListener('click', submitReTest);
  document.getElementById('retest-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') submitReTest();
  });
  document.getElementById('retest-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('retest-modal')) hideReTestModal();
  });

  loadState();

  if (!state.initialized) {
    showScreen('welcome');
    document.getElementById('bottom-nav').style.display = 'none';
  } else {
    document.getElementById('bottom-nav').style.display = 'flex';
    showScreen(state.activeScreen || 'workout');
  }
});
