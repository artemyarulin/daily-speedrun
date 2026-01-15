// Animation: Dog chases Cat (new cinematic pass)
registerAnimation(function dogChase() {
  return new Promise((resolve) => {
    let resolved = false;
    let overlay = null;
    const animations = [];

    const finish = () => {
      if (resolved) return;
      resolved = true;
      animations.forEach((anim) => anim.cancel());
      if (overlay) {
        overlay.remove();
      }
      resolve();
    };

    overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '100000';
    overlay.style.overflow = 'hidden';

    const viewW = window.innerWidth;
    const viewH = window.innerHeight;
    const marginY = 90;

    const randomBetween = (min, max) => min + Math.random() * (max - min);
    const randomPathPoints = () => {
      const points = [];
      points.push({
        x: -260,
        y: randomBetween(viewH * 0.6, viewH * 0.85)
      });

      const hops = 5;
      for (let i = 0; i < hops; i++) {
        points.push({
          x: randomBetween(viewW * 0.1, viewW * 0.9),
          y: randomBetween(marginY, viewH - marginY)
        });
      }

      points.push({
        x: viewW + 260,
        y: randomBetween(viewH * 0.2, viewH * 0.6)
      });

      return points;
    };

    const toSafePoint = (point) => ({
      x: Math.min(Math.max(point.x, -260), viewW + 260),
      y: Math.min(Math.max(point.y, marginY), viewH - marginY)
    });

    const buildKeyframes = (points, trailOffset) => {
      return points.map((point, index) => {
        const prev = points[Math.max(index - 1, 0)];
        const next = points[Math.min(index + 1, points.length - 1)];
        const dx = next.x - prev.x;
        const dy = next.y - prev.y;
        const length = Math.max(1, Math.hypot(dx, dy));
        const offsetX = point.x - (dx / length) * trailOffset;
        const offsetY = point.y - (dy / length) * trailOffset;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return {
          transform: `translate(${offsetX}px, ${offsetY}px) rotate(${angle}deg)`
        };
      });
    };

    const spawnChasePair = () => {
      const pathPoints = randomPathPoints();
      const safePath = pathPoints.map(toSafePoint);
      const catChasesDog = Math.random() < 0.4;
      const leaderDelay = 0;
      const chaserDelay = 1000;
      const leaderFrames = buildKeyframes(safePath, 0);
      const chaserFrames = buildKeyframes(safePath, 80);

      const catWrap = document.createElement('div');
      catWrap.style.position = 'absolute';
      catWrap.style.left = '0';
      catWrap.style.top = '0';
      catWrap.style.opacity = catChasesDog ? '0' : '1';
      catWrap.style.willChange = 'transform';

      const cat = document.createElement('img');
      cat.src = getUrl('assets/cat.png');
      cat.style.width = '170px';
      cat.style.height = 'auto';
      cat.style.display = 'block';
      cat.style.filter = 'drop-shadow(0 10px 10px rgba(0, 0, 0, 0.35))';
      cat.style.willChange = 'transform';
      catWrap.appendChild(cat);

      const dogWrap = document.createElement('div');
      dogWrap.style.position = 'absolute';
      dogWrap.style.left = '0';
      dogWrap.style.top = '0';
      dogWrap.style.opacity = catChasesDog ? '1' : '0';
      dogWrap.style.willChange = 'transform';

      const dog = document.createElement('div');
      dog.style.position = 'relative';
      dog.style.width = '180px';
      dog.style.height = '120px';
      dog.style.transformOrigin = 'center';
      dog.style.filter = 'drop-shadow(0 10px 10px rgba(0, 0, 0, 0.35))';
      dog.style.willChange = 'transform';

      const dogBody = document.createElement('div');
      dogBody.style.position = 'absolute';
      dogBody.style.left = '20px';
      dogBody.style.bottom = '10px';
      dogBody.style.width = '120px';
      dogBody.style.height = '60px';
      dogBody.style.background = '#b8794f';
      dogBody.style.borderRadius = '40px';

      const dogHead = document.createElement('div');
      dogHead.style.position = 'absolute';
      dogHead.style.right = '0';
      dogHead.style.top = '10px';
      dogHead.style.width = '60px';
      dogHead.style.height = '50px';
      dogHead.style.background = '#c88b65';
      dogHead.style.borderRadius = '50%';

      const dogEar = document.createElement('div');
      dogEar.style.position = 'absolute';
      dogEar.style.left = '8px';
      dogEar.style.top = '-8px';
      dogEar.style.width = '22px';
      dogEar.style.height = '26px';
      dogEar.style.background = '#a86b42';
      dogEar.style.borderRadius = '14px';
      dogEar.style.transform = 'rotate(-20deg)';

      const dogTail = document.createElement('div');
      dogTail.style.position = 'absolute';
      dogTail.style.left = '-8px';
      dogTail.style.bottom = '30px';
      dogTail.style.width = '40px';
      dogTail.style.height = '12px';
      dogTail.style.background = '#a86b42';
      dogTail.style.borderRadius = '10px';
      dogTail.style.transformOrigin = '100% 50%';

      dogHead.appendChild(dogEar);
      dog.appendChild(dogBody);
      dog.appendChild(dogHead);
      dog.appendChild(dogTail);
      dogWrap.appendChild(dog);

      overlay.appendChild(catWrap);
      overlay.appendChild(dogWrap);

      const catRun = catWrap.animate(catChasesDog ? chaserFrames : leaderFrames, {
        duration: 5000,
        easing: 'linear',
        fill: 'forwards',
        delay: catChasesDog ? chaserDelay : leaderDelay
      });

      const dogRun = dogWrap.animate(catChasesDog ? leaderFrames : chaserFrames, {
        duration: 5000,
        easing: 'linear',
        fill: 'forwards',
        delay: catChasesDog ? leaderDelay : chaserDelay
      });

      const catBob = cat.animate(
        [{ transform: 'translateY(0)' }, { transform: 'translateY(-10px)' }],
        {
          duration: 220,
          easing: 'ease-in-out',
          iterations: Infinity,
          direction: 'alternate',
          delay: catChasesDog ? chaserDelay : leaderDelay
        }
      );

      const dogBob = dog.animate(
        [{ transform: 'translateY(0)' }, { transform: 'translateY(-8px)' }],
        {
          duration: 200,
          easing: 'ease-in-out',
          iterations: Infinity,
          direction: 'alternate',
          delay: catChasesDog ? leaderDelay : chaserDelay
        }
      );

      const tailWag = dogTail.animate(
        [{ transform: 'rotate(20deg)' }, { transform: 'rotate(-20deg)' }],
        {
          duration: 120,
          easing: 'ease-in-out',
          iterations: Infinity,
          direction: 'alternate',
          delay: catChasesDog ? leaderDelay : chaserDelay
        }
      );

      animations.push(catRun, dogRun, catBob, dogBob, tailWag);

      setTimeout(() => {
        if (catChasesDog) {
          catWrap.style.opacity = '1';
        } else {
          dogWrap.style.opacity = '1';
        }
      }, chaserDelay);
    };

    document.body.appendChild(overlay);

    spawnChasePair();

    setTimeout(() => {
      overlay.style.transition = 'opacity 0.3s ease';
      overlay.style.opacity = '0';
    }, 4700);

    setTimeout(finish, 5000);
    setTimeout(finish, 6200);
  });
});
