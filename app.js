(() => {
  let timerInterval = null;
  let remainingSeconds = 25 * 60;
  let isPaused = false;
  let isRunning = false;

  const FOCUS_DURATION = 25 * 60;
  const SHORT_BREAK = 5 * 60;
  const LONG_BREAK = 15 * 60;

  let currentMode = 'focus';
  let sessionsCompleted = 0;

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function updateDisplay() {
    const timeDisplay = document.getElementById('time-display');
    const modeDisplay = document.getElementById('mode-display');
    const sessionsDisplay = document.getElementById('sessions-completed');

    if (timeDisplay) {
      timeDisplay.textContent = formatTime(remainingSeconds);
    }

    if (modeDisplay) {
      const modeText = currentMode === 'focus' ? 'Focus Time' : 
                       currentMode === 'short' ? 'Short Break' : 'Long Break';
      modeDisplay.textContent = modeText;
    }

    if (sessionsDisplay) {
      sessionsDisplay.textContent = `Sessions completed: ${sessionsCompleted}`;
    }
  }

  function tick() {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      updateDisplay();
    } else {
      handleTimerComplete();
    }
  }

  function handleTimerComplete() {
    stopTimer();
    playNotificationSound();
    
    if (currentMode === 'focus') {
      sessionsCompleted++;
      if (sessionsCompleted % 4 === 0) {
        switchMode('long');
      } else {
        switchMode('short');
      }
    } else {
      switchMode('focus');
    }
    
    updateDisplay();
  }

  function playNotificationSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }

  function startTimer() {
    if (!isRunning) {
      isRunning = true;
      isPaused = false;
      timerInterval = setInterval(tick, 1000);
      updateButtonStates();
    }
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    isRunning = false;
    isPaused = false;
    updateButtonStates();
  }

  function pauseTimer() {
    if (isRunning && !isPaused) {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      isPaused = true;
      isRunning = false;
      updateButtonStates();
    }
  }

  function resetTimer() {
    stopTimer();
    remainingSeconds = getDurationForMode(currentMode);
    updateDisplay();
  }

  function getDurationForMode(mode) {
    switch (mode) {
      case 'focus':
        return FOCUS_DURATION;
      case 'short':
        return SHORT_BREAK;
      case 'long':
        return LONG_BREAK;
      default:
        return FOCUS_DURATION;
    }
  }

  function switchMode(mode) {
    stopTimer();
    currentMode = mode;
    remainingSeconds = getDurationForMode(mode);
    updateDisplay();
  }

  function updateButtonStates() {
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');

    if (startBtn) {
      startBtn.disabled = isRunning;
    }

    if (pauseBtn) {
      pauseBtn.disabled = !isRunning;
    }

    if (resetBtn) {
      resetBtn.disabled = false;
    }
  }

  function setupEventListeners() {
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const focusBtn = document.getElementById('focus-btn');
    const shortBreakBtn = document.getElementById('short-break-btn');
    const longBreakBtn = document.getElementById('long-break-btn');

    if (startBtn) {
      startBtn.addEventListener('click', startTimer);
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', pauseTimer);
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', resetTimer);
    }

    if (focusBtn) {
      focusBtn.addEventListener('click', () => switchMode('focus'));
    }

    if (shortBreakBtn) {
      shortBreakBtn.addEventListener('click', () => switchMode('short'));
    }

    if (longBreakBtn) {
      longBreakBtn.addEventListener('click', () => switchMode('long'));
    }
  }

  function init() {
    updateDisplay();
    updateButtonStates();
    setupEventListeners();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();