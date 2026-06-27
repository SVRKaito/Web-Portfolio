// ── 1. Animated Particle Background ──
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles, animId;
  const ACCENT = '59,130,246';
  const GREEN  = '16,185,129';

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.2 + 0.8,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      color: Math.random() > 0.65 ? GREEN : ACCENT,
      alpha: Math.random() * 0.55 + 0.25,
    };
  }

  function init() {
    resize();
    const count = Math.min(Math.floor((W * H) / 8000), 120);
    particles = Array.from({ length: count }, randomParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // draw connection lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160) {
          const opacity = (1 - dist / 160) * 0.22;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${ACCENT},${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // draw particles
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
    });

    animId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    init();
    draw();
  });

  init();
  draw();
})();

// ── 2. Mobile Menu Toggle ──
const mobileMenu = document.getElementById('mobile-menu');
const navLinks   = document.querySelector('.nav-links');
mobileMenu.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  mobileMenu.classList.toggle('open');
});

// Close menu when a nav link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    mobileMenu.classList.remove('open');
  });
});

// ── 3. Navbar scroll effect ──
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.style.background = window.scrollY > 40
    ? 'rgba(10,10,16,0.97)'
    : 'rgba(10,10,16,0.85)';
}, { passive: true });

// ── 4. Project Filtering ──
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards  = document.querySelectorAll('.project-card');
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    const val = button.getAttribute('data-filter');
    projectCards.forEach(card => {
      const show = val === 'all' || card.getAttribute('data-category') === val;
      if (show) {
        card.style.display = 'block';
        setTimeout(() => (card.style.opacity = '1'), 30);
      } else {
        card.style.opacity = '0';
        setTimeout(() => (card.style.display = 'none'), 300);
      }
    });
  });
});

// ── 5. Form Submission ──
document.getElementById('portfolioForm').addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const orig = btn.textContent;
  btn.textContent = '✓ Packet Received!';
  btn.style.background = '#10b981';
  setTimeout(() => {
    btn.textContent = orig;
    btn.style.background = '';
    e.target.reset();
  }, 2800);
});

// ── 6. Scroll Typewriter Terminal ──
const terminalOutput = document.getElementById('terminal-output');
let typingStarted = false;

const lines = [
  { type: 'prompt',   text: 'cat biography.txt' },
  { type: 'response', text: 'Aspiring hardware and software specialist with a strong foundation in computer engineering, system development, network automation, and hardware optimization. Proven track record in technical writing and academic excellence, combined with multi-level certifications in programming, cybersecurity, and workplace regulatory safety compliance.' },
  { type: 'prompt',   text: 'cat current-focus.txt' },
  { type: 'response', text: '> Linux Environments, Network Infrastructure Security, CI/CD Pipeline Automation, and Edge AI.' },
  { type: 'prompt',   text: 'whoami' },
  { type: 'response', text: '> Christian A. Latunio | BS Computer Engineering | University of Batangas' },
];

function typeText(el, text, speed, callback) {
  let i = 0;
  const span = document.createElement('span');
  el.appendChild(span);
  const interval = setInterval(() => {
    span.textContent += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(interval);
      if (callback) callback();
    }
  }, speed);
}

function runLines(index) {
  if (index >= lines.length) {
    const cursorP = document.createElement('p');
    cursorP.innerHTML = '<span class="prompt">user@tech:~$</span> <span class="cursor">|</span>';
    terminalOutput.appendChild(cursorP);
    return;
  }
  const line = lines[index];
  const p = document.createElement('p');
  terminalOutput.appendChild(p);

  if (line.type === 'prompt') {
    p.innerHTML = '<span class="prompt">user@tech:~$</span> ';
    typeText(p, line.text, 30, () => setTimeout(() => runLines(index + 1), 120));
  } else {
    p.className = 'response';
    typeText(p, line.text, 8, () => setTimeout(() => runLines(index + 1), 160));
  }
}

const terminalObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !typingStarted) {
      typingStarted = true;
      setTimeout(() => runLines(0), 300);
    }
  });
}, { threshold: 0.15 });

terminalObserver.observe(document.getElementById('about'));

// ── 7. Scroll Reveal ──
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// ── 8. Active nav link on scroll ──
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navAnchors.forEach(a => {
    a.style.color = a.getAttribute('href') === `#${current}`
      ? 'var(--primary-accent)'
      : '';
  });
}, { passive: true });