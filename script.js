// Animated Particle Background
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

// ── 5. Form Submission (Formspree Fetch API) ──
document.getElementById('portfolioForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const origText = btn.textContent;

  btn.textContent = 'Sending...';
  btn.style.opacity = '0.7';

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      btn.textContent = '✓ Packet Received!';
      btn.style.background = '#10b981';
      form.reset();
    } else {
      btn.textContent = '✖ Transmission Error';
      btn.style.background = '#ef4444';
    }
  } catch (error) {
    btn.textContent = '✖ Connection Error';
    btn.style.background = '#ef4444';
  } finally {
    btn.style.opacity = '1';
    setTimeout(() => {
      btn.textContent = origText;
      btn.style.background = '';
    }, 3000);
  }
});

// ── 6. Scroll Typewriter Terminal (replays every time About re-enters view) ──
const terminalOutput = document.getElementById('terminal-output');
let typingStarted = false;
let runId = 0;          // bumps on every reset so old timers stop themselves
let activeTimers = [];  // every pending interval/timeout, so reset can cancel them

const lines = [
  { type: 'prompt',   text: 'cat biography.txt' },
  { type: 'response', text: 'Aspiring hardware and software specialist with a strong foundation in computer engineering, system development, network automation, and hardware optimization. Proven track record in technical writing and academic excellence, combined with multi-level certifications in programming, cybersecurity, and workplace regulatory safety compliance.' },
  { type: 'prompt',   text: 'cat current-focus.txt' },
  { type: 'response', text: '> Linux Environments, Network Infrastructure Security, CI/CD Pipeline Automation, and Edge AI.' },
  { type: 'prompt',   text: 'whoami' },
  { type: 'response', text: '> Christian A. Latunio | BS Computer Engineering | University of Batangas' },
];

function later(fn, ms, id) {
  const t = setTimeout(() => { if (id === runId) fn(); }, ms);
  activeTimers.push(t);
}

function typeText(el, text, speed, id, callback) {
  let i = 0;
  const span = document.createElement('span');
  el.appendChild(span);
  const interval = setInterval(() => {
    if (id !== runId) { clearInterval(interval); return; }
    span.textContent += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(interval);
      if (callback) callback();
    }
  }, speed);
  activeTimers.push(interval);
}

function runLines(index, id) {
  if (id !== runId) return;
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
    typeText(p, line.text, 30, id, () => later(() => runLines(index + 1, id), 120, id));
  } else {
    p.className = 'response';
    typeText(p, line.text, 8, id, () => later(() => runLines(index + 1, id), 160, id));
  }
}

function startTerminal() {
  typingStarted = true;
  const id = ++runId;
  later(() => runLines(0, id), 300, id);
}

function resetTerminal() {
  runId++;                                   // invalidate anything still running
  activeTimers.forEach(t => { clearTimeout(t); clearInterval(t); });
  activeTimers = [];
  terminalOutput.innerHTML = '';
  typingStarted = false;
}

const terminalObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) {
      // About fully scrolled out of view -> clear it so it replays next time
      if (typingStarted) resetTerminal();
    } else if (entry.intersectionRatio >= 0.15 && !typingStarted) {
      startTerminal();
    }
  });
}, { threshold: [0, 0.15] });

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

// ── 9. Hero Title: "Christian Latunio" -> "Computer Engineer Graduate" ──
(function () {
  const el = document.getElementById('rotating-title');
  if (!el) return;
  const phrases = ['Christian Latunio', 'Computer Engineer Graduate'];
  let index = 0;

  function erase(done) {
    const t = setInterval(() => {
      el.textContent = el.textContent.slice(0, -1);
      if (el.textContent.length === 0) { clearInterval(t); done(); }
    }, 40);
  }
  function type(text, done) {
    let i = 0;
    const t = setInterval(() => {
      el.textContent = text.slice(0, ++i);
      if (i >= text.length) { clearInterval(t); done(); }
    }, 70);
  }

  // Endless loop: hold -> erase -> type the other phrase -> repeat (back and forth)
  function cycle() {
    setTimeout(() => {
      erase(() => {
        index = (index + 1) % phrases.length;
        type(phrases[index], cycle);
      });
    }, 2500);
  }

  cycle();
})();


// ── 10. Resume Pop-up ──
(function () {
  const btn   = document.getElementById('resume-btn');
  const modal = document.getElementById('resume-modal');
  const frame = document.getElementById('resume-frame');
  const close = document.getElementById('resume-close');
  if (!btn || !modal) return;

  function openModal(e) {
    e.preventDefault();
    if (frame.getAttribute('src') === 'about:blank') frame.src = 'Latunio_resume.pdf#view=FitH';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    close.focus();
  }
  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    btn.focus();
  }

  btn.addEventListener('click', openModal);
  close.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
})();


// ── 11. Work Experience: small box -> big pop-up ──
(function () {
  const modal   = document.getElementById('exp-modal');
  const content = document.getElementById('exp-modal-content');
  const closeBt = document.getElementById('exp-modal-close');
  if (!modal) return;
  let lastTrigger = null;

  function open(trigger) {
    const tpl = document.getElementById(trigger.dataset.target);
    if (!tpl) return;
    lastTrigger = trigger;
    content.innerHTML = '';
    content.appendChild(tpl.content.cloneNode(true));
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBt.focus();
  }
  function close() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
  }

  document.querySelectorAll('.exp-open').forEach(b => b.addEventListener('click', () => open(b)));
  closeBt.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });
})();


// ── 12. Certificates: cards live in index.html (edit them there) + detail pop-up ──
(function () {
  const slider   = document.getElementById('cert-slider');
  const viewport = document.getElementById('cert-viewport');
  const track    = document.getElementById('cert-track');
  const modal    = document.getElementById('cert-modal');
  if (!slider || !viewport || !track || !modal) return;

  const titleEl  = document.getElementById('cert-modal-title');
  const typeEl   = document.getElementById('cert-modal-type');
  const aboutEl  = document.getElementById('cert-modal-about');
  const imgEl    = document.getElementById('cert-modal-img');
  const missEl   = document.getElementById('cert-missing');
  const closeBt  = document.getElementById('cert-close');
  const zbar     = document.getElementById('cert-zoombar');
  const frame    = document.getElementById('cert-picture');
  const pagerEl  = document.querySelector('.cert-pager');
  const prevBt   = document.getElementById('cert-prev');
  const nextBt   = document.getElementById('cert-next');
  const fDate    = document.getElementById('cert-f-date');
  const fType    = document.getElementById('cert-f-type');
  const fIssuer  = document.getElementById('cert-f-issuer');


  const originals = Array.from(track.querySelectorAll('.cert-item'));
  const CERTS = originals.map((it, i) => {
    it.dataset.index = i;
    const d = it.dataset, im = it.querySelector('img');
    return { title: d.title, type: d.type, issuer: d.issuer, date: d.date, location: d.location, about: d.about, src: im ? im.getAttribute('src') : '' };
  });

  // two extra copies so the line can slide forever in both directions
  const LOOP = originals.length >= 5;   // endless loop: the last card sits right before the first
  for (let c = 0; c < (LOOP ? 2 : 0); c++) {
    originals.forEach((it, i) => {
      const cl = it.cloneNode(true);
      cl.dataset.index = i;
      cl.setAttribute('aria-hidden', 'true');
      cl.tabIndex = -1;
      track.appendChild(cl);
    });
  }

  // ---- drag to slide ----
  let setW = 0;

  function measure() {
    if (!LOOP) { setW = 0; return; }
    const first = originals[0];
    const copy  = track.children[originals.length];
    setW = copy.offsetLeft - first.offsetLeft;
  }
  function start() {
    measure();
    if (!LOOP) return;
    viewport.scrollLeft = setW - 60;   // start at the oldest certificate (first card)
  }
  viewport.addEventListener('scroll', () => {
    if (!setW) return;
    if (viewport.scrollLeft < setW * 0.5) viewport.scrollLeft += setW;
    else if (viewport.scrollLeft > setW * 1.5) viewport.scrollLeft -= setW;
  }, { passive: true });

  let down = false, moved = false, justDragged = false;
  let prevX = 0, lastT = 0, vel = 0, glideId = 0;

  viewport.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch' || e.button !== 0) return;
    down = true; moved = false;
    prevX = e.clientX; lastT = performance.now(); vel = 0;
    cancelAnimationFrame(glideId);
  });
  viewport.addEventListener('pointermove', e => {
    if (!down) return;
    if (!moved) {
      if (Math.abs(e.clientX - prevX) < 5) return;
      moved = true;
      viewport.setPointerCapture(e.pointerId);
      viewport.classList.add('dragging');
    }
    const now = performance.now();
    const dx = e.clientX - prevX;
    viewport.scrollLeft -= dx;
    vel = 0.8 * vel + 0.2 * (-dx / Math.max(now - lastT, 1));
    prevX = e.clientX; lastT = now;
  });
  function endDrag() {
    if (!down) return;
    down = false;
    viewport.classList.remove('dragging');
    if (moved) {
      justDragged = true;
      setTimeout(() => { justDragged = false; }, 60);
      let v = vel * 16;
      (function glide() {
        if (Math.abs(v) < 0.4) return;
        viewport.scrollLeft += v;
        v *= 0.94;
        glideId = requestAnimationFrame(glide);
      })();
    }
  }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('click', e => {
    if (justDragged) { e.stopPropagation(); e.preventDefault(); }
  }, true);

  function updateArrows() {
    const fits = viewport.scrollWidth <= viewport.clientWidth + 2;
    slider.querySelectorAll('.cert-slide-btn').forEach(b => { b.hidden = fits; });
  }
  window.addEventListener('load', updateArrows);
  window.addEventListener('resize', updateArrows);
  updateArrows();

  function nudge(dir) {
    cancelAnimationFrame(glideId);
    // wrap around: back from the first goes to the last, forward from the last goes to the first
    const max = viewport.scrollWidth - viewport.clientWidth;
    if (!LOOP && dir < 0 && viewport.scrollLeft <= 2) { viewport.scrollTo({ left: max, behavior: 'smooth' }); return; }
    if (!LOOP && dir > 0 && viewport.scrollLeft >= max - 2) { viewport.scrollTo({ left: 0, behavior: 'smooth' }); return; }
    const step = (originals[0].offsetWidth + 16) * 3;
    viewport.scrollBy({ left: dir * step, behavior: 'smooth' });
  }
  document.getElementById('cert-slide-prev').addEventListener('click', () => nudge(-1));
  document.getElementById('cert-slide-next').addEventListener('click', () => nudge(1));

  const allBtn = document.getElementById('cert-all-btn');

  window.addEventListener('load', start);
  window.addEventListener('resize', () => {
    if (!LOOP) return;
    const f = viewport.scrollLeft / (setW || 1);
    measure();
    viewport.scrollLeft = f * setW;
  });
  start();

  // ---- pop-up: picture + facts on the left, about on the right ----
  let idx = 0, lastTrigger = null;

  function setFact(row, value) {
    row.hidden = !value;
    row.querySelector('dd').textContent = value || '';
  }

  function show() {
    const c = CERTS[idx];
    titleEl.textContent = c.title;
    typeEl.textContent = c.type;
    aboutEl.textContent = c.about || '';
    setFact(fDate.parentElement, c.date);
    setFact(fType.parentElement, c.type);
    setFact(fIssuer.parentElement, c.issuer);
    resetZoom();
    missEl.hidden = true;
    imgEl.hidden = false;
    zbar.hidden = false;
    imgEl.onerror = () => {
      imgEl.hidden = true;
      zbar.hidden = true;
      missEl.textContent = 'Certificate image not added yet: ' + c.src;
      missEl.hidden = false;
    };
    imgEl.src = c.src;
  }
  if (CERTS.length < 2 && pagerEl) pagerEl.hidden = true;   // no 1 / 1 and no arrows for a single certificate

  function open(item) {
    lastTrigger = item;
    idx = Number(item.dataset.index);
    show();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBt.focus();
  }
  function close() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  }
  // ---- zoom in the pop-up: + / - buttons, drag to move ----
  const zIn    = document.getElementById('cert-zoom-in');
  const zOut   = document.getElementById('cert-zoom-out');
  const zLevel = document.getElementById('cert-zoom-level');
  const Z_MIN = 1, Z_MAX = 4, Z_STEP = 0.25;
  let zoom = 1, tx = 0, ty = 0;

  function clampPan() {
    const maxX = Math.max(0, (imgEl.offsetWidth  * zoom - frame.clientWidth)  / 2);
    const maxY = Math.max(0, (imgEl.offsetHeight * zoom - frame.clientHeight) / 2);
    tx = Math.min(maxX, Math.max(-maxX, tx));
    ty = Math.min(maxY, Math.max(-maxY, ty));
  }
  function applyZoom() {
    clampPan();
    imgEl.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + zoom + ')';
    zLevel.textContent = Math.round(zoom * 100) + '%';
    zOut.disabled = zoom <= Z_MIN + 0.001;
    zIn.disabled  = zoom >= Z_MAX - 0.001;
    frame.classList.toggle('zoomed', zoom > 1.001);
  }
  function setZoom(z) {
    zoom = Math.min(Z_MAX, Math.max(Z_MIN, Math.round(z * 100) / 100));
    if (zoom === 1) { tx = 0; ty = 0; }
    applyZoom();
  }
  function resetZoom() { zoom = 1; tx = 0; ty = 0; applyZoom(); }

  zIn.addEventListener('click', () => setZoom(zoom + Z_STEP));
  zOut.addEventListener('click', () => setZoom(zoom - Z_STEP));
  zLevel.addEventListener('click', resetZoom);
  frame.addEventListener('wheel', e => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    setZoom(zoom + (e.deltaY < 0 ? Z_STEP : -Z_STEP));
  }, { passive: false });

  // drag the picture around while zoomed in
  let panning = false, px = 0, py = 0;
  frame.addEventListener('pointerdown', e => {
    if (e.button !== 0 || zoom <= 1.001 || e.target.closest('.cert-zoombar')) return;
    panning = true; px = e.clientX; py = e.clientY;
    frame.setPointerCapture(e.pointerId);
    frame.classList.add('panning');
  });
  frame.addEventListener('pointermove', e => {
    if (!panning) return;
    tx += e.clientX - px; ty += e.clientY - py;
    px = e.clientX; py = e.clientY;
    applyZoom();
  });
  function endPan() { panning = false; frame.classList.remove('panning'); }
  frame.addEventListener('pointerup', endPan);
  frame.addEventListener('pointercancel', endPan);
  window.addEventListener('resize', () => { if (modal.classList.contains('open')) applyZoom(); });

  function step(d) { idx = (idx + d + CERTS.length) % CERTS.length; show(); }

  track.addEventListener('click', e => {
    const it = e.target.closest('.cert-item');
    if (it) open(it);
  });
  closeBt.addEventListener('click', close);
  prevBt.addEventListener('click', () => step(-1));
  nextBt.addEventListener('click', () => step(1));
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === '+' || e.key === '=') setZoom(zoom + Z_STEP);
    else if (e.key === '-') setZoom(zoom - Z_STEP);
    else if (e.key === '0') resetZoom();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  });

  // ---- "All Certificates" pop-up: grouped by category, click one to open it ----
  const allModal = document.getElementById('certs-all-modal');
  const allBody  = document.getElementById('certs-all-body');
  const allClose = document.getElementById('certs-all-close');
  if (allBtn && allModal && allBody) {
    const ORDER = ['Certifications and Training', 'Webinars and Seminars', 'Internship', 'Achievements and Extracurricular'];
    const groups = {};
    CERTS.forEach((c, i) => { (groups[c.type] = groups[c.type] || []).push(i); });
    const types = ORDER.filter(t => groups[t]).concat(Object.keys(groups).filter(t => ORDER.indexOf(t) < 0));

    function mk(tag, cls, text) {
      const el = document.createElement(tag);
      if (cls) el.className = cls;
      if (text != null) el.textContent = text;
      return el;
    }
    const tabs = mk('div', 'certs-tabs');
    tabs.setAttribute('role', 'tablist');
    const panel = mk('div', 'certs-panel');
    panel.setAttribute('role', 'tabpanel');
    const tabBtns = [];

    function showType(t) {
      tabBtns.forEach(b => {
        const on = b.dataset.type === t;
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      panel.textContent = '';
      panel.scrollTop = 0;
      groups[t].forEach(i => {
        const c = CERTS[i];
        const card = mk('button', 'certs-card');
        card.type = 'button';
        const th = mk('span', 'certs-card-thumb');
        const img = document.createElement('img');
        img.alt = ''; img.loading = 'lazy'; img.src = c.src;
        img.onerror = () => { img.style.display = 'none'; };
        th.appendChild(img);
        card.appendChild(th);
        card.appendChild(mk('span', 'certs-card-title', c.title));
        if (c.date) card.appendChild(mk('span', 'certs-card-date', c.date));
        card.addEventListener('click', () => { closeAll(true); open(originals[i]); });
        panel.appendChild(card);
      });
    }
    types.forEach(t => {
      const b = mk('button', 'certs-tab');
      b.type = 'button'; b.dataset.type = t;
      b.setAttribute('role', 'tab');
      b.appendChild(mk('span', 'certs-tab-name', t));
      b.appendChild(mk('span', 'certs-tab-count', String(groups[t].length)));
      b.addEventListener('click', () => showType(t));
      tabs.appendChild(b); tabBtns.push(b);
    });
    allBody.appendChild(tabs);
    allBody.appendChild(panel);
    showType(types[0]);

    function openAll() {
      allModal.classList.add('open');
      allModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      allClose.focus();
    }
    function closeAll(keepLock) {
      allModal.classList.remove('open');
      allModal.setAttribute('aria-hidden', 'true');
      if (!keepLock) { document.body.style.overflow = ''; allBtn.focus({ preventScroll: true }); }
    }
    allBtn.addEventListener('click', openAll);
    allClose.addEventListener('click', () => closeAll());
    allModal.addEventListener('click', e => { if (e.target === allModal) closeAll(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && allModal.classList.contains('open')) closeAll();
    });
  }
})();