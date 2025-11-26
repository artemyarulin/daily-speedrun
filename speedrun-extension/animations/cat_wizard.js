// Animation: Cat Wizard (Updated)
registerAnimation(function catWizardAnimation() {
    return new Promise((resolve) => {
        let resolved = false;
        let container = null;

        const finish = () => {
            if (resolved) return;
            resolved = true;
            if (container) {
                container.remove();
            }
            resolve();
        };

        // Container for positioning and entrance/exit
        container = document.createElement('div');
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

                    setTimeout(finish, 500);
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

        // Fallback resolve in case something goes wrong
        setTimeout(finish, 8000);
    });
});
