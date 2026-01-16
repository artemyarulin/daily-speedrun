// Speedrun Timer Content Script

(function () {
    // Prevent duplicate injection
    if (document.getElementById('speedrun-overlay')) return;

    // --- Configuration ---
    // Pull attendees from the page (Range check-ins cards) so splits match the roster
    const extractUsersFromPage = () => {
        const cards = Array.from(document.querySelectorAll('.feedUpdateItem .card__title'));
        const names = cards
            .map((card) => card.textContent.trim())
            .filter((name) => name.length > 0);

        // De-duplicate while preserving first-seen order (users can have multiple cards across days)
        const seen = new Set();
        return names.filter((name) => {
            if (seen.has(name)) return false;
            seen.add(name);
            return true;
        });
    };

    let sectionNames = extractUsersFromPage();
    let SECTIONS_COUNT = sectionNames.length > 0 ? sectionNames.length : 10;
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

    const buildSectionsHtml = () => {
        let html = '';
        for (let i = 1; i <= SECTIONS_COUNT; i++) {
            const name = sectionNames[i - 1] || `Section ${i}`;
            html += `
                <div class="speedrun-section" id="section-${i - 1}">
                    <span class="section-name">${name}</span>
                    <span class="section-time" id="time-${i - 1}">-</span>
                    <span class="section-delta" id="delta-${i - 1}"></span>
                </div>
            `;
        }
        return html;
    };

    overlay.innerHTML = `
        <div id="speedrun-header">Standup Any%</div>
        <div id="speedrun-sections">${buildSectionsHtml()}</div>
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

    function applySectionNames(names) {
        if (names.length === 0) return;
        if (isRunning || elapsedTime > 0 || currentSectionIndex > 0) return;

        sectionNames = names;
        SECTIONS_COUNT = sectionNames.length;

        const sectionsContainer = document.getElementById('speedrun-sections');
        sectionsContainer.innerHTML = buildSectionsHtml();

        timerDisplay.textContent = '00:00.00';
        currentSectionIndex = 0;
        lastSplitTime = 0;
        elapsedTime = 0;
        setActiveSection(currentSectionIndex);
    }

    if (sectionNames.length === 0) {
        const observer = new MutationObserver(() => {
            const found = extractUsersFromPage();
            if (found.length > 0) {
                applySectionNames(found);
                observer.disconnect();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
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

    // --- Debug Controls ---
    const debugToggle = document.createElement('button');
    debugToggle.id = 'speedrun-debug-toggle';
    debugToggle.textContent = '.';
    debugToggle.style.position = 'fixed';
    debugToggle.style.bottom = '6px';
    debugToggle.style.left = '6px';
    debugToggle.style.width = '18px';
    debugToggle.style.height = '18px';
    debugToggle.style.opacity = '0.15';
    debugToggle.style.background = 'rgba(255, 255, 255, 0.05)';
    debugToggle.style.border = '1px solid rgba(255, 255, 255, 0.08)';
    debugToggle.style.borderRadius = '3px';
    debugToggle.style.cursor = 'pointer';
    debugToggle.style.padding = '0';
    debugToggle.style.color = 'rgba(255, 255, 255, 0.2)';
    debugToggle.style.fontSize = '12px';
    debugToggle.style.zIndex = '100001';
    debugToggle.title = 'Debug';

    const debugPanel = document.createElement('div');
    debugPanel.id = 'speedrun-debug-panel';
    debugPanel.style.position = 'fixed';
    debugPanel.style.bottom = '32px';
    debugPanel.style.left = '10px';
    debugPanel.style.background = 'rgba(20, 20, 20, 0.92)';
    debugPanel.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    debugPanel.style.borderRadius = '6px';
    debugPanel.style.padding = '8px';
    debugPanel.style.display = 'none';
    debugPanel.style.gap = '6px';
    debugPanel.style.zIndex = '100001';
    debugPanel.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
    debugPanel.style.backdropFilter = 'blur(4px)';

    const renderDebugButtons = () => {
        debugPanel.innerHTML = '<div style="color:#fff;font-size:12px;margin-bottom:6px;">Animations</div>';
        if (!window.speedrunAnimations || window.speedrunAnimations.length === 0) {
            const empty = document.createElement('div');
            empty.style.color = '#aaa';
            empty.style.fontSize = '12px';
            empty.textContent = 'No animations loaded';
            debugPanel.appendChild(empty);
            return;
        }

        window.speedrunAnimations.forEach((anim, idx) => {
            const btn = document.createElement('button');
            const label = anim.displayName || anim.name || `Animation ${idx + 1}`;
            btn.textContent = label;
            btn.style.margin = '2px';
            btn.style.padding = '4px 6px';
            btn.style.border = '1px solid rgba(255, 255, 255, 0.15)';
            btn.style.borderRadius = '4px';
            btn.style.background = 'rgba(255, 255, 255, 0.05)';
            btn.style.color = '#fff';
            btn.style.fontSize = '12px';
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', () => {
                try {
                    anim();
                } catch (err) {
                    console.error('Animation failed', err);
                }
            });
            debugPanel.appendChild(btn);
        });
    };

    let debugVisible = false;
    debugToggle.addEventListener('click', () => {
        debugVisible = !debugVisible;
        if (debugVisible) {
            renderDebugButtons();
            debugPanel.style.display = 'flex';
            debugPanel.style.flexWrap = 'wrap';
        } else {
            debugPanel.style.display = 'none';
        }
    });

    document.body.appendChild(debugToggle);
    document.body.appendChild(debugPanel);
})();
