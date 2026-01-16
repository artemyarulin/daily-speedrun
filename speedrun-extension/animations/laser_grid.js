// Animation: Laser Grid Sweep
registerAnimation(function laserGridSweep() {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '100000';
        overlay.style.background = 'radial-gradient(ellipse at center, rgba(0, 255, 180, 0.12), rgba(0, 0, 0, 0))';

        const grid = document.createElement('div');
        grid.style.position = 'absolute';
        grid.style.inset = '0';
        grid.style.backgroundImage = 'linear-gradient(rgba(0,255,180,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,180,0.25) 1px, transparent 1px)';
        grid.style.backgroundSize = '80px 80px';
        grid.style.filter = 'drop-shadow(0 0 6px rgba(0,255,180,0.4))';
        overlay.appendChild(grid);

        const sweep = document.createElement('div');
        sweep.style.position = 'absolute';
        sweep.style.top = '0';
        sweep.style.left = '-20%';
        sweep.style.width = '20%';
        sweep.style.height = '100%';
        sweep.style.background = 'linear-gradient(90deg, rgba(0,255,180,0) 0%, rgba(0,255,180,0.25) 50%, rgba(0,255,180,0) 100%)';
        sweep.style.filter = 'blur(12px)';
        overlay.appendChild(sweep);

        document.body.appendChild(overlay);

        const sweepAnim = sweep.animate(
            [{ transform: 'translateX(0)' }, { transform: 'translateX(600%)' }],
            { duration: 1600, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
        );

        const pulseAnim = grid.animate(
            [
                { opacity: 0.9, transform: 'scale(1)' },
                { opacity: 0.6, transform: 'scale(1.02)' },
                { opacity: 0.9, transform: 'scale(1)' }
            ],
            { duration: 800, iterations: 2, easing: 'ease-in-out' }
        );

        sweepAnim.onfinish = () => {
            overlay.style.transition = 'opacity 0.3s ease';
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
                resolve();
            }, 300);
        };

        // Fallback
        setTimeout(() => {
            overlay.remove();
            resolve();
        }, 2200);
    });
});
