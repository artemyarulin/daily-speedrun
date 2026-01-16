// Animation: Confetti Burst (emoji-based, no extra assets)
registerAnimation(function confettiBurst() {
    return new Promise((resolve) => {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '0';
        container.style.overflow = 'visible';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '100000';
        document.body.appendChild(container);

        const symbols = ['✨', '⭐', '🔥', '💥', '🌟', '⚡'];
        const pieces = 120;
        const gravity = window.innerHeight + 200;

        for (let i = 0; i < pieces; i++) {
            const piece = document.createElement('span');
            piece.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            piece.style.position = 'absolute';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.top = '-10px';
            piece.style.fontSize = 16 + Math.random() * 10 + 'px';
            piece.style.willChange = 'transform';
            container.appendChild(piece);

            const spreadX = (Math.random() * 2 - 1) * (window.innerWidth / 2);
            const duration = 900 + Math.random() * 600;
            const rotate = (Math.random() * 720 - 360) + 'deg';

            const anim = piece.animate(
                [
                    { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
                    { transform: `translate(${spreadX}px, ${gravity}px) rotate(${rotate})`, opacity: 0 }
                ],
                { duration, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
            );

            anim.onfinish = () => piece.remove();
        }

        setTimeout(() => {
            container.remove();
            resolve();
        }, 1800);
    });
});
