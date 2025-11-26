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
    let lastSplitTime = 0; // Track time of last split for segment calculation
    let timerInterval = null;
    let currentSectionIndex = 0;
    let isRunning = false;

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
        <div id="speedrun-header">Speedrun Timer</div>
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
    function getUrl(path) {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
            return chrome.runtime.getURL(path);
        }
        return path;
    }

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
        const seconds = totalSeconds % 60;
        const minutes = Math.floor(totalSeconds / 60);
        const tenths = Math.floor((absMs % 1000) / 100);

        let text = `${sign}${totalSeconds}.${tenths}`;
        return text;
    }

    function updateTimerDisplay() {
        const now = Date.now();
        const currentTotalTime = elapsedTime + (isRunning ? (now - startTime) : 0);

        // Main timer shows CURRENT SEGMENT time while running
        // Segment time = Total Time - Last Split Time
        const currentSegmentTime = currentTotalTime - lastSplitTime;
        timerDisplay.textContent = formatTime(currentSegmentTime);
    }

    function setActiveSection(index) {
        // Remove active class from all
        for (let i = 0; i < SECTIONS_COUNT; i++) {
            document.getElementById(`section-${i}`).classList.remove('active');
        }
        // Add to current if valid
        if (index < SECTIONS_COUNT) {
            document.getElementById(`section-${index}`).classList.add('active');
        }
    }

    // ... (Animations code remains the same, assuming it's above or below this block. 
    // I need to be careful not to overwrite it if I'm replacing a large chunk.
    // The user instruction says "EndLine: 294", which is the end of the file.
    // I should probably include the animation code in the replacement or target specific blocks.
    // Since I'm changing HTML injection (lines 34-45) AND event listeners (lines 287-289) AND split logic (lines 206-262),
    // it's safer to replace the whole bottom half or do multiple edits.
    // Let's do multiple edits to be safe and precise.)


    // --- Helper Functions ---
    function getUrl(path) {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
            return chrome.runtime.getURL(path);
        }
        return path;
    }

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
        const seconds = totalSeconds % 60; // Usually deltas are small, but could be large.
        const minutes = Math.floor(totalSeconds / 60);
        const tenths = Math.floor((absMs % 1000) / 100); // Show 1 decimal for delta usually, or 2? User image shows 1 decimal (-4.7).

        let text = `${sign}${totalSeconds}.${tenths}`;
        if (minutes > 0) {
            // If needed, but usually deltas are small.
            // Let's keep it simple.
        }
        return text;
    }

    function updateTimerDisplay() {
        const now = Date.now();
        const currentTotalTime = elapsedTime + (isRunning ? (now - startTime) : 0);

        // Main timer shows CURRENT SEGMENT time while running
        const currentSegmentTime = currentTotalTime - lastSplitTime;
        timerDisplay.textContent = formatTime(currentSegmentTime);
    }

    function setActiveSection(index) {
        // Remove active class from all
        for (let i = 0; i < SECTIONS_COUNT; i++) {
            document.getElementById(`section-${i}`).classList.remove('active');
        }
        // Add to current if valid
        if (index < SECTIONS_COUNT) {
            document.getElementById(`section-${index}`).classList.add('active');
        }
    }

    // --- Animations ---
    const animations = [];

    function registerAnimation(fn) {
        animations.push(fn);
    }

    function playRandomAnimation() {
        if (animations.length === 0) return;
        const randomIndex = Math.floor(Math.random() * animations.length);
        animations[randomIndex]();
    }

    // Animation: Cat Wizard (Updated)
    registerAnimation(function catWizardAnimation() {
        // Container for positioning and entrance/exit
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.right = '-300px'; // Start off-screen
        container.style.top = '50%';
        container.style.transform = 'translateY(-50%)'; // Centered vertically
        container.style.zIndex = '100000';
        container.style.transition = 'right 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.5s ease';

        const cat = document.createElement('img');
        cat.src = getUrl('assets/cat.png');
        cat.style.height = '300px'; // Larger size
        cat.style.display = 'block';

        container.appendChild(cat);
        document.body.appendChild(container);

        // Slide in
        setTimeout(() => {
            container.style.right = '0px';
        }, 50);

        // Start shaking and shooting after entrance
        setTimeout(() => {
            cat.classList.add('speedrun-shake');

            // Shooting logic
            let shots = 0;
            const maxShots = 30; // More intense burst
            const shootInterval = setInterval(() => {
                if (shots >= maxShots) {
                    clearInterval(shootInterval);

                    // Stop shaking
                    cat.classList.remove('speedrun-shake');

                    // Fade out and exit
                    container.style.opacity = '0';
                    container.style.right = '-100px';

                    setTimeout(() => container.remove(), 500);
                    return;
                }

                const star = document.createElement('img');
                star.src = getUrl('assets/banana.png');
                star.style.position = 'fixed';
                star.style.right = '200px'; // Start from cat
                // Random vertical start slightly
                const startY = (window.innerHeight / 2) + (Math.random() * 60 - 30);
                star.style.top = startY + 'px';
                star.style.zIndex = '99999';
                star.style.width = '120px';

                // No bubble/shadow requested
                // star.style.boxShadow = ... 

                document.body.appendChild(star);

                // Calculate angle for "lines of stars"
                // Spread across -50 to 50 degrees (Wider)
                const angle = (Math.random() * 100 - 50) * (Math.PI / 180);
                const distance = window.innerWidth + 300;
                const endX = distance * Math.cos(angle);
                const endY = distance * Math.sin(angle);

                // Random rotation direction and speed
                const rotation = Math.random() * 720 - 360;

                // Animate spell - Slower (30% slower: 800 -> ~1040, let's go 1200 base)
                const duration = 1200 + Math.random() * 600;
                const animation = star.animate([
                    { transform: 'translate(0, 0) rotate(0deg)' },
                    { transform: `translate(-${distance}px, ${endY}px) rotate(${rotation}deg)` }
                ], {
                    duration: duration,
                    easing: 'linear'
                });

                animation.onfinish = () => star.remove();

                shots++;
            }, 80); // Fast fire rate

        }, 600); // Wait for entrance
    });


    // --- Event Handlers ---
    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        startTime = Date.now();
        timerInterval = setInterval(updateTimerDisplay, 30); // 30ms update rate
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

        // Calculate split time
        const now = Date.now();
        const currentTotalTime = elapsedTime + (isRunning ? (now - startTime) : 0);

        // Calculate segment time
        const segmentTime = currentTotalTime - lastSplitTime;

        // Target time for THIS section is 1 minute (60000ms)
        // Delta is Segment Time - Target Time
        const delta = segmentTime - TARGET_TIME_PER_SECTION;

        // Check for animation trigger (Segment < 60s)
        if (segmentTime < 60000) {
            playRandomAnimation();
        }

        // Update UI for completed section
        const sectionRow = document.getElementById(`section-${currentSectionIndex}`);
        const timeCell = document.getElementById(`time-${currentSectionIndex}`);
        const deltaCell = document.getElementById(`delta-${currentSectionIndex}`);

        // Show SEGMENT time in row
        timeCell.textContent = formatTime(segmentTime);
        deltaCell.textContent = formatDelta(delta);

        if (delta < 0) {
            deltaCell.className = 'section-delta delta-ahead';
        } else {
            deltaCell.className = 'section-delta delta-behind';
        }

        sectionRow.classList.remove('active');
        sectionRow.classList.add('completed');

        // Update state
        lastSplitTime = currentTotalTime;
        currentSectionIndex++;

        if (currentSectionIndex < SECTIONS_COUNT) {
            setActiveSection(currentSectionIndex);
            // Reset main timer display visually (it will update in next tick, but good to be instant)
            timerDisplay.textContent = "00:00.00";
        } else {
            // Finished all sections
            finish();
        }
    }

    function finish() {
        pauseTimer();
        btnStart.textContent = 'Finished';
        btnStart.disabled = true;
        btnSplit.disabled = true;
        btnFinish.disabled = true;

        // Show TOTAL time in main timer when finished
        // elapsedTime contains the total time since we paused it
        timerDisplay.textContent = formatTime(elapsedTime);
    }

    // --- Listeners ---
    btnStart.addEventListener('click', toggleTimer);
    btnSplit.addEventListener('click', split);
    btnFinish.addEventListener('click', finish);

    // Optional: Keyboard shortcuts? Space for split is common.
    // But might interfere with page. Let's stick to buttons for now as requested.

})();
