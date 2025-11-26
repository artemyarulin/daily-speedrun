// Speedrun Timer Content Script

(function () {
    // Prevent duplicate injection
    if (document.getElementById('speedrun-overlay')) return;

    // --- Configuration ---
    const SECTIONS_COUNT = 10;
    const TARGET_TIME_PER_SECTION = 60 * 1000; // 1 minute in milliseconds

    // --- State ---
    let startTime = 0;
    let elapsedTime = 0;
    let lastSplitTime = 0;
    let timerInterval = null;
    let currentSectionIndex = 0;
    let isRunning = false;
    let animationInProgress = false;

    // --- HTML Injection ---
    const overlay = document.createElement('div');
    overlay.id = 'speedrun-overlay';

    let sectionsHtml = '';
    for (let i = 1; i <= SECTIONS_COUNT; i++) {
        sectionsHtml += `
            <div class="speedrun-section" id="section-${i - 1}">
                <span class="section-name">Section ${i}</span>
                <span class="section-time" id="time-${i - 1}">-</span>
                <span class="section-delta" id="delta-${i - 1}"></span>
            </div>
        `;
    }

    overlay.innerHTML = `
        <div id="speedrun-header">Standup Any%</div>
        <div id="speedrun-sections">
            ${sectionsHtml}
        </div>
        <div id="speedrun-timer">00:00.00</div>
        <div id="speedrun-controls">
            <button id="btn-start" class="speedrun-btn">Start</button>
            <button id="btn-split" class="speedrun-btn">Split</button>
            <button id="btn-finish" class="speedrun-btn">Finish</button>
        </div>
    `;

    document.body.appendChild(overlay);

    // --- Elements ---
    const timerDisplay = document.getElementById('speedrun-timer');
    const btnStart = document.getElementById('btn-start');
    const btnSplit = document.getElementById('btn-split');
    const btnFinish = document.getElementById('btn-finish');

    // --- Helper Functions ---
    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const centiseconds = Math.floor((ms % 1000) / 10);

        const pad = (n) => n.toString().padStart(2, '0');
        return `${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`;
    }

    function formatDelta(ms) {
        const sign = ms >= 0 ? '+' : '-';
        const absMs = Math.abs(ms);
        const totalSeconds = Math.floor(absMs / 1000);
        const tenths = Math.floor((absMs % 1000) / 100);

        return `${sign}${totalSeconds}.${tenths}`;
    }

    function updateTimerDisplay() {
        const now = Date.now();
        const currentTotalTime = elapsedTime + (isRunning ? (now - startTime) : 0);

        // Main timer shows current segment time while running
        const currentSegmentTime = currentTotalTime - lastSplitTime;
        timerDisplay.textContent = formatTime(currentSegmentTime);
    }

    function setActiveSection(index) {
        for (let i = 0; i < SECTIONS_COUNT; i++) {
            document.getElementById(`section-${i}`).classList.remove('active');
        }
        if (index < SECTIONS_COUNT) {
            document.getElementById(`section-${index}`).classList.add('active');
        }
    }

    // Animations are registered by animations/*.js via registerAnimation
    async function playRandomAnimation() {
        if (!window.speedrunAnimations || window.speedrunAnimations.length === 0) return;
        if (animationInProgress) return;

        const randomIndex = Math.floor(Math.random() * window.speedrunAnimations.length);
        animationInProgress = true;

        const wasRunning = isRunning;
        if (wasRunning) {
            pauseTimer();
        }

        try {
            const animationResult = window.speedrunAnimations[randomIndex]();
            if (animationResult && typeof animationResult.then === 'function') {
                await animationResult;
            } else {
                // Fallback duration if animation does not return a promise
                await new Promise((resolve) => setTimeout(resolve, 3000));
            }
        } finally {
            animationInProgress = false;
            if (wasRunning && !isRunning && currentSectionIndex < SECTIONS_COUNT) {
                startTimer();
            }
        }
    }

    // --- Event Handlers ---
    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        startTime = Date.now();
        timerInterval = setInterval(updateTimerDisplay, 30);
        btnStart.textContent = 'Pause';
        setActiveSection(currentSectionIndex);
    }

    function pauseTimer() {
        if (!isRunning) return;
        isRunning = false;
        elapsedTime += Date.now() - startTime;
        clearInterval(timerInterval);
        btnStart.textContent = 'Resume';
    }

    function toggleTimer() {
        if (isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    }

    function split() {
        if (currentSectionIndex >= SECTIONS_COUNT) return;

        if (!isRunning && currentSectionIndex === 0 && elapsedTime === 0) {
            startTimer();
            return;
        }

        const now = Date.now();
        const currentTotalTime = elapsedTime + (isRunning ? (now - startTime) : 0);
        const segmentTime = currentTotalTime - lastSplitTime;
        const delta = segmentTime - TARGET_TIME_PER_SECTION;

        // Trigger animation when finishing a segment faster than target
        if (segmentTime < TARGET_TIME_PER_SECTION) {
            playRandomAnimation();
        }

        const sectionRow = document.getElementById(`section-${currentSectionIndex}`);
        const timeCell = document.getElementById(`time-${currentSectionIndex}`);
        const deltaCell = document.getElementById(`delta-${currentSectionIndex}`);

        timeCell.textContent = formatTime(segmentTime);
        deltaCell.textContent = formatDelta(delta);
        deltaCell.className = `section-delta ${delta < 0 ? 'delta-ahead' : 'delta-behind'}`;

        sectionRow.classList.remove('active');
        sectionRow.classList.add('completed');

        lastSplitTime = currentTotalTime;
        currentSectionIndex++;

        if (currentSectionIndex < SECTIONS_COUNT) {
            setActiveSection(currentSectionIndex);
            timerDisplay.textContent = '00:00.00';
        } else {
            finish();
        }
    }

    function finish() {
        pauseTimer();
        btnStart.textContent = 'Finished';
        btnStart.disabled = true;
        btnSplit.disabled = true;
        btnFinish.disabled = true;

        timerDisplay.textContent = formatTime(elapsedTime);
    }

    // --- Listeners ---
    btnStart.addEventListener('click', toggleTimer);
    btnSplit.addEventListener('click', split);
    btnFinish.addEventListener('click', finish);

    setActiveSection(currentSectionIndex);
})();
