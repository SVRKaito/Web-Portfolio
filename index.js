// 1. Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    mobileMenu.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      mobileMenu.classList.toggle('open');
    });

    // 2. Project Filtering Logic
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const filterValue = button.getAttribute('data-filter');
        projectCards.forEach(card => {
          if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
            card.style.display = 'block';
            setTimeout(() => card.style.opacity = '1', 50);
          } else {
            card.style.opacity = '0';
            setTimeout(() => card.style.display = 'none', 300);
          }
        });
      });
    });

    // 3. Form Submission
    document.getElementById('portfolioForm').addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Packet successfully transmitted! I will respond shortly.');
      e.target.reset();
    });

    // 4. Scroll-triggered Typewriter for Terminal
    const terminalOutput = document.getElementById('terminal-output');
    let typingStarted = false;

    const lines = [
      { type: 'prompt', text: 'cat biography.txt' },
      { type: 'response', text: 'Aspiring hardware and software specialist with a strong foundation in computer engineering, system development, network automation, and hardware optimization. Proven track record in technical writing and academic excellence, combined with multi-level certifications in programming, cybersecurity, and workplace regulatory safety compliance.' },
      { type: 'prompt', text: 'cat current-focus.txt' },
      { type: 'response', text: '> Linux Environments, Network Infrastructure Security, CI/CD Pipeline Automation, and Edge AI.' },
      { type: 'prompt', text: 'whoami' },
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
        // Final blinking cursor
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
        typeText(p, line.text, 35, () => {
          setTimeout(() => runLines(index + 1), 150);
        });
      } else {
        p.className = 'response';
        typeText(p, line.text, 12, () => {
          setTimeout(() => runLines(index + 1), 200);
        });
      }
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !typingStarted) {
          typingStarted = true;
          setTimeout(() => runLines(0), 300);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(document.getElementById('about'));
  
    // 5. Scroll Reveal Observer
    const revealEls = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => revealObserver.observe(el));