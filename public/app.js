function calculateTime(now = new Date()) {
  const currentYear = now.getFullYear();
  const isNewYear = now.getMonth() === 0 && now.getDate() === 1;
  const targetYear = currentYear + 1;
  const target = new Date(targetYear, 0, 1, 0, 0, 0);
  const difference = target - now;

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
    currentYear,
    targetYear,
    isNewYear
  };
}

let renderedState = '';

function renderState(time) {
  const root = document.getElementById('root');
  const state = time.isNewYear ? `celebration-${time.currentYear}` : `countdown-${time.targetYear}`;

  if (renderedState !== state) {
    if (time.isNewYear) {
      document.title = `Bonne année ${time.currentYear} !`;
      root.innerHTML = `
        <main class="container celebration">
          <p class="eyebrow">Une nouvelle page s'ouvre</p>
          <h1 class="new-year-message">Bonne année <span>${time.currentYear}</span> !</h1>
          <p class="subtitle">Que cette année vous apporte de beaux moments !</p>
          <div class="celebration-mark" aria-hidden="true">✦</div>
        </main>
      `;
    } else {
      document.title = `Décompte vers ${time.targetYear}`;
      root.innerHTML = `
        <main class="container">
          <h1 class="label">Cap sur <span id="target-year">${time.targetYear}</span></h1>
          <section class="countdown" aria-label="Compte à rebours avant le nouvel an">
            <div class="countdown-clock" id="countdown-display" aria-hidden="true"></div>
            <div class="countdown-items">
              <div class="countdown-item">
                <span class="countdown-number" id="days-display">00</span>
                <span class="countdown-label">Jours</span>
              </div>
              <div class="countdown-item">
                <span class="countdown-number" id="hours-display">00</span>
                <span class="countdown-label">Heures</span>
              </div>
              <div class="countdown-item">
                <span class="countdown-number" id="minutes-display">00</span>
                <span class="countdown-label">Minutes</span>
              </div>
              <div class="countdown-item">
                <span class="countdown-number" id="seconds-display">00</span>
                <span class="countdown-label">Secondes</span>
              </div>
            </div>
          </section>
        </main>
      `;
    }

    renderedState = state;
  }

  if (time.isNewYear) {
    return;
  }

  const values = [
    String(time.days).padStart(2, '0'),
    String(time.hours).padStart(2, '0'),
    String(time.minutes).padStart(2, '0'),
    String(time.seconds).padStart(2, '0')
  ];
  const display = values.join(':');
  const clock = document.getElementById('countdown-display');

  if (clock.textContent !== display) {
    clock.textContent = display;
  }

  document.getElementById('days-display').textContent = values[0];
  document.getElementById('hours-display').textContent = values[1];
  document.getElementById('minutes-display').textContent = values[2];
  document.getElementById('seconds-display').textContent = values[3];
}

function startFireworks() {
  const canvas = document.getElementById('fireworks');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  let animationRunning = false;

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 9;
      this.vy = (Math.random() - 0.5) * 9;
      this.gravity = 0.12;
      this.alpha = 1;
      this.decay = Math.random() * 0.015 + 0.008;
      this.size = Math.random() * 2 + 1;
      this.color = `hsl(${Math.random() * 45 + 35}, 90%, 70%)`;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += this.gravity;
      this.alpha -= this.decay;
    }

    draw() {
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fillRect(this.x, this.y, this.size, this.size);
    }
  }

  const createBurst = (x, y) => {
    for (let i = 0; i < 45; i++) {
      particles.push(new Particle(x, y));
    }
    if (!animationRunning) {
      animationRunning = true;
      requestAnimationFrame(animate);
    }
  };

  for (let i = 0; i < 6; i++) {
    setTimeout(() => {
      createBurst(
        Math.random() * canvas.width,
        Math.random() * canvas.height * 0.55
      );
    }, i * 240);
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].alpha <= 0) {
        particles.splice(i, 1);
      }
    }

    ctx.globalAlpha = 1;
    if (particles.length > 0) {
      requestAnimationFrame(animate);
    } else {
      animationRunning = false;
    }
  };

}

let previousCelebrationYear = null;

function updateCountdown() {
  const time = calculateTime();
  renderState(time);

  if (time.isNewYear && previousCelebrationYear !== time.currentYear) {
    startFireworks();
  }
  previousCelebrationYear = time.isNewYear ? time.currentYear : null;
}

updateCountdown();
setInterval(updateCountdown, 1000);

fetch('/api/visitors')
  .then(response => {
    if (!response.ok) {
      throw new Error(`Visitor count request failed: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    const visitorCount = document.getElementById('visitor-count');
    if (visitorCount) {
      visitorCount.textContent = data.count;
    }
  })
  .catch(error => console.error('Error fetching visitor count:', error));
