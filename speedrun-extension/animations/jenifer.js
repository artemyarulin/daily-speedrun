// Animation: Jenifer (Walking + Rope Pull)
registerAnimation(function jeniferAnimation() {
    return new Promise((resolve) => {
        let resolved = false;
        let char;
        let ropeContainer;
        const finish = () => {
            if (resolved) return;
            resolved = true;
            if (char) char.remove();
            if (ropeContainer) ropeContainer.remove();
            resolve();
        };

        char = document.createElement('img');
        const walk1 = getUrl('assets/jenifer/walk_1.png');
        const walk2 = getUrl('assets/jenifer/walk_2.png');
        const hand = getUrl('assets/jenifer/hand.png');
        const ropeSrc = getUrl('assets/jenifer/rope.png');

        // --- Character Setup ---
        char.src = walk1;
        char.style.position = 'fixed';
        char.style.bottom = '20px';
        char.style.left = '-150px'; // Start off-screen left
        char.style.zIndex = '100000';
        char.style.height = '300px'; // Adjust size if needed
        char.style.transition = 'left 2.5s linear'; // Walk to middle
        document.body.appendChild(char);

        // --- Rope Setup ---
        ropeContainer = document.createElement('div');
        ropeContainer.style.position = 'fixed';
        ropeContainer.style.top = '-1000px'; // Start way above
        ropeContainer.style.left = '50%'; // Middle
        ropeContainer.style.transform = 'translateX(-50%)';
        ropeContainer.style.zIndex = '99999';
        ropeContainer.style.width = '20px';
        ropeContainer.style.height = '1000px'; // Long rope
        ropeContainer.style.backgroundImage = `url(${ropeSrc})`;
        ropeContainer.style.backgroundRepeat = 'repeat-y';
        ropeContainer.style.backgroundSize = '100% auto'; // Fit width, auto height

        document.body.appendChild(ropeContainer);

        // --- Walking Phase ---
        let toggle = false;
        const walkInterval = setInterval(() => {
            char.src = toggle ? walk1 : walk2;
            toggle = !toggle;
        }, 200);

        // Start walking to middle
        setTimeout(() => {
            char.style.left = 'calc(50% - 265px)'; // Center character (width 150/2)
        }, 50);

        // --- Rope Descent Phase ---
        // Start rope descent as character walks
        setTimeout(() => {
            ropeContainer.style.transition = 'top 2s ease-out';
            ropeContainer.style.top = '-200px'; // Adjust based on rope length, assuming long enough
        }, 100);

        // --- Pulling Phase ---
        setTimeout(() => {
            clearInterval(walkInterval);
            char.src = hand; // Switch to pulling pose

            // Animate Pull (Shake/Move down slightly)
            char.style.transition = 'transform 0.1s';
            let pullCount = 0;
            const pullInterval = setInterval(() => {
                const offset = pullCount % 2 === 0 ? 5 : 0;
                char.style.transform = `translateY(${offset}px)`;
                ropeContainer.style.transform = `translateX(-50%) translateY(${offset}px)`;

                // --- Spark Shower ---
                if (pullCount % 2 === 0) {
                    createSparkShower();
                }

                pullCount++;
                if (pullCount > 20) { // Pull for 2 seconds
                    clearInterval(pullInterval);
                    cleanup();
                }
            }, 100);

        }, 2500); // After walking finishes (2.5s)

        function createSparkShower() {
            const colors = ['spark_1.svg', 'spark_2.svg', 'spark_3.svg', 'spark_4.svg', 'spark_5.svg'];
            for (let i = 0; i < 300; i++) {
                const spark = document.createElement('img');
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                spark.src = getUrl(`assets/jenifer/sparks/${randomColor}`);
                spark.style.position = 'fixed';
                spark.style.left = '50%';
                spark.style.top = '0px'; // Start from top
                spark.style.width = '20px';
                spark.style.zIndex = '100001';

                document.body.appendChild(spark);

                const destX = (Math.random() * 800 - 200);
                const destY = window.innerHeight + 100;
                const duration = 1000 + Math.random() * 500;

                const anim = spark.animate([
                    { transform: 'translate(0, 0) rotate(0deg)' },
                    { transform: `translate(${destX}px, ${destY}px) rotate(${Math.random() * 360}deg)` }
                ], {
                    duration: duration,
                    easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
                });

                anim.onfinish = () => spark.remove();
            }
        }

        function cleanup() {
            // Fade out everything
            char.style.transition = 'opacity 0.5s';
            ropeContainer.style.transition = 'opacity 0.5s';
            char.style.opacity = '0';
            ropeContainer.style.opacity = '0';

            setTimeout(finish, 500);
        }

        // Fallback resolve in case animation stalls
        setTimeout(finish, 9000);
    });
});
