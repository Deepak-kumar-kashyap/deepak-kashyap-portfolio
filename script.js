/* ============================================================
   DEEPAK KUMAR KASHYAP — PORTFOLIO SCRIPT
   Three.js · Anime.js · Intersection Observer · API Layer
   ============================================================ */

/* ── CONFIG (⚠️ UPDATE THESE WITH YOUR REAL USERNAMES) ── */
const CONFIG = {
  githubUsername: 'Deepak-kumar-kashyap',    // ← Change this
  leetcodeUsername: 'deepakkumarkashyap78557',  // ← Change this
  cacheLife: 24 * 60 * 60 * 1000,       // 24h in ms
};

/* ── THEME INITIALIZATION (Prevent Flash) ── */
(function() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
  }
})();

/* ============================================================
   PRELOADER
   ============================================================ */
const preloader = document.getElementById('preloader');
const preloaderText = document.getElementById('preloader-text');

const loadTexts = [
  'Initializing system...',
  'Loading assets...',
  'Compiling awesome...',
  'Almost there...'
];

let textIdx = 0;
const textInterval = setInterval(() => {
  textIdx = Math.min(textIdx + 1, loadTexts.length - 1);
  preloaderText.textContent = loadTexts[textIdx];
}, 550);

window.addEventListener('load', () => {
  clearInterval(textInterval);
  setTimeout(() => {
    preloader.classList.add('out');
    document.body.style.overflow = '';
    // Kick off all init functions after preloader fades
    initAll();
    
    // Celebration confetti!
    if (typeof confetti === 'function') {
      setTimeout(fireConfetti, 400);
    }
  }, 2400);
});

// Prevent scroll during preloader
document.body.style.overflow = 'hidden';




/* ============================================================
   NAVBAR SCROLL STATE
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}


/* ============================================================
   MOBILE MENU
   ============================================================ */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const spans = hamburger.querySelectorAll('span');
  let open = false;

  function toggle() {
    open = !open;
    mobileMenu.classList.toggle('open', open);
    spans[0].style.transform = open ? 'translateY(6.5px) rotate(45deg)' : '';
    spans[1].style.opacity = open ? '0' : '1';
    spans[2].style.transform = open ? 'translateY(-6.5px) rotate(-45deg)' : '';
    document.body.style.overflow = open ? 'hidden' : '';
  }

  hamburger.addEventListener('click', toggle);
  document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => { if (open) toggle(); }));
  mobileMenu.addEventListener('click', e => { if (e.target === mobileMenu) toggle(); });
}


/* ============================================================
   THREE.JS HERO BACKGROUND
   ============================================================ */
function initThreeJS() {
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('hero-canvas');
  const W = window.innerWidth;
  const H = window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 500);
  camera.position.z = 6;

  /* ── Particle Field ── */
  const COUNT = window.innerWidth < 768 ? 900 : 1800;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);

  for (let i = 0; i < COUNT; i++) {
    const r = 12 + Math.random() * 10;
    const phi = Math.random() * Math.PI * 2;
    const th = Math.random() * Math.PI;
    pos[i * 3] = r * Math.sin(th) * Math.cos(phi);
    pos[i * 3 + 1] = r * Math.sin(th) * Math.sin(phi);
    pos[i * 3 + 2] = (Math.random() - 0.5) * 14;

    // Mostly dim, some bright cyan dots
    const bright = Math.random() > 0.92;
    col[i * 3] = bright ? 0 : 0;
    col[i * 3 + 1] = bright ? 0.75 : 0.3 + Math.random() * 0.2;
    col[i * 3 + 2] = bright ? 1 : 0.6 + Math.random() * 0.3;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.018,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  /* ── Subtle Grid Plane ── */
  const gridMat = new THREE.MeshBasicMaterial({ color: 0x001820, transparent: true, opacity: 0.15, wireframe: true });
  const gridGeo = new THREE.PlaneGeometry(30, 30, 24, 24);
  const gridMesh = new THREE.Mesh(gridGeo, gridMat);
  gridMesh.rotation.x = -Math.PI / 2.5;
  gridMesh.position.y = -4;
  gridMesh.position.z = -3;
  scene.add(gridMesh);

  /* ── Mouse interaction ── */
  let targetRotX = 0, targetRotY = 0;
  let currRotX = 0, currRotY = 0;

  document.addEventListener('mousemove', e => {
    targetRotY = (e.clientX / window.innerWidth - 0.5) * 0.35;
    targetRotX = (e.clientY / window.innerHeight - 0.5) * 0.18;
  });

  /* ── Animate ── */
  let t = 0;
  const posAttr = geo.attributes.position;

  function render() {
    requestAnimationFrame(render);
    t += 0.00045;

    // Smooth lerp rotation
    currRotX += (targetRotX - currRotX) * 0.04;
    currRotY += (targetRotY - currRotY) * 0.04;
    particles.rotation.x = currRotX;
    particles.rotation.y = t * 0.04 + currRotY;

    // Subtle Y drift on particles
    for (let i = 0; i < COUNT; i += 6) {
      posAttr.array[i * 3 + 1] += Math.sin(t * 3 + i) * 0.00015;
    }
    posAttr.needsUpdate = true;

    gridMesh.rotation.z = t * 0.015;

    renderer.render(scene, camera);
  }
  render();

  /* ── Resize ── */
  window.addEventListener('resize', () => {
    const W = window.innerWidth, H = window.innerHeight;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H);
  });
}


/* ============================================================
   TYPING EFFECT
   ============================================================ */
function initTyping() {
  const el = document.getElementById('dynamic-text');
  const roles = ['scalable web apps', 'MERN stack apps', 'fast, clean UIs', 'real-world solutions', 'full-stack projects'];
  let ri = 0, ci = 0, del = false;

  function type() {
    const word = roles[ri];
    if (del) {
      el.textContent = word.slice(0, ci--);
      if (ci < 0) { del = false; ri = (ri + 1) % roles.length; }
      setTimeout(type, 55);
    } else {
      el.textContent = word.slice(0, ci++);
      if (ci > word.length) { del = true; setTimeout(type, 1900); return; }
      setTimeout(type, 80);
    }
  }
  type();
}


/* ============================================================
   SCROLL REVEAL (Intersection Observer)
   ============================================================ */
function initScrollReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => io.observe(el));
}


/* ============================================================
   ANIMATED COUNTERS
   ============================================================ */
function initCounters() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count);
      const dur = 1400;
      let started = null;

      function step(ts) {
        if (!started) started = ts;
        const p = Math.min((ts - started) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);    // ease-out-cubic
        el.textContent = Math.floor(ease * target);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('.stat-number[data-count]').forEach(c => io.observe(c));
}


/* ============================================================
   PROJECT CARD RADIAL GLOW (mouse follow)
   ============================================================ */
function initProjectGlow() {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const gx = ((e.clientX - r.left) / r.width) * 100;
      const gy = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty('--gx', gx + '%');
      card.style.setProperty('--gy', gy + '%');
    });
  });
}


/* ============================================================
   PROFILE PHOTO FALLBACK
   ============================================================ */
function initPhotoFallback() {
  const img = document.getElementById('profile-photo');
  const fallback = document.getElementById('photo-fallback');
  img.addEventListener('error', () => {
    img.style.display = 'none';
    fallback.style.display = 'flex';
  });
  // If src is empty / placeholder, show initials
  if (!img.src || img.src.endsWith('photo.jpg') || img.src.includes('placeholder')) {
    // Let the error event fire naturally; also check after short delay
    setTimeout(() => {
      if (img.naturalWidth === 0) {
        img.style.display = 'none';
        fallback.style.display = 'flex';
      }
    }, 800);
  }
}


/* ============================================================
   ACTIVE NAV LINK (highlight on scroll)
   ============================================================ */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-links a');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        links.forEach(l => {
          l.classList.toggle('active-link', l.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => io.observe(s));
}


/* ============================================================
   THEME TOGGLE
   ============================================================ */
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  const toggleBtnMobile = document.getElementById('theme-toggle-mobile');
  
  function toggleTheme() {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    
    // Optional: add a little pop animation to the icon
    const icons = document.querySelectorAll('.theme-toggle i');
    anime({
      targets: icons,
      scale: [1, 1.2, 1],
      duration: 400,
      easing: 'easeOutBack'
    });
  }

  if (toggleBtn) toggleBtn.addEventListener('click', toggleTheme);
  if (toggleBtnMobile) toggleBtnMobile.addEventListener('click', toggleTheme);
}


/* ============================================================
   ANIME.JS MICRO INTERACTIONS
   ============================================================ */
function initAnime() {
  if (typeof anime === 'undefined') return;

  /* Skill chip wave on category hover */
  document.querySelectorAll('.skill-category').forEach(cat => {
    cat.addEventListener('mouseenter', () => {
      anime({
        targets: cat.querySelectorAll('.skill-chip'),
        translateY: [0, -5, 0],
        delay: anime.stagger(35, { from: 'first' }),
        duration: 450,
        easing: 'easeOutElastic(1, .6)',
      });
    });
  });

  /* Timeline items stagger on viewport entry */
  const tlItems = document.querySelectorAll('.timeline-item');
  if (tlItems.length) {
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        anime({
          targets: tlItems,
          translateX: [-25, 0],
          opacity: [0, 1],
          delay: anime.stagger(120),
          duration: 650,
          easing: 'easeOutCubic',
        });
        io.disconnect();
      }
    }, { threshold: 0.15 });
    io.observe(document.querySelector('.timeline'));
  }

  /* Cert cards bounce in */
  const certCards = document.querySelectorAll('.cert-card');
  const certIO = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      anime({
        targets: certCards,
        scale: [0.85, 1],
        opacity: [0, 1],
        delay: anime.stagger(80),
        duration: 500,
        easing: 'easeOutBack',
      });
      certIO.disconnect();
    }
  }, { threshold: 0.15 });
  if (certCards.length) certIO.observe(document.querySelector('.certs-grid'));
}


/* ============================================================
   CONTACT FORM
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const sendBtn = document.getElementById('send-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    formData.append("access_key", "d4c645f0-f2da-438c-b385-c3d7ee1035e6");

    const originalHTML = sendBtn.innerHTML;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    sendBtn.disabled = true;

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Message sent successfully! I'll get back to you soon.", "success");
        sendBtn.innerHTML = '<i class="fas fa-check"></i> Sent';
        sendBtn.style.background = 'var(--green)';
        sendBtn.style.boxShadow = '0 0 24px rgba(34,197,94,.3)';
        form.reset();
      } else {
        showToast("Error: " + data.message, "error");
        sendBtn.innerHTML = originalHTML;
        sendBtn.disabled = false;
      }
    } catch (error) {
      showToast("Something went wrong. Please check your connection.", "error");
      sendBtn.innerHTML = originalHTML;
      sendBtn.disabled = false;
    } finally {
      setTimeout(() => {
        if (sendBtn.disabled) {
          sendBtn.innerHTML = originalHTML;
          sendBtn.style.background = '';
          sendBtn.style.boxShadow = '';
          sendBtn.disabled = false;
        }
      }, 4000);
    }
  });
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
  
  toast.innerHTML = `
    <i class="fas ${icon}"></i>
    <div class="toast-msg">${message}</div>
  `;
  
  container.appendChild(toast);
  
  // Animate in
  setTimeout(() => toast.classList.add('toast-show'), 100);
  
  // Animate out
  const hide = () => {
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 500);
  };
  
  setTimeout(hide, 4000);
  toast.onclick = hide;
}


/* ============================================================
   GITHUB STATS
   ============================================================ */
async function fetchGitHub() {
  const UN = CONFIG.githubUsername;
  const KEY = `gh_${UN}`;
  const TMK = `gh_t_${UN}`;
  const badge = document.getElementById('gh-badge');

  // Cache hit?
  const cached = localStorage.getItem(KEY);
  const cTime = localStorage.getItem(TMK);
  if (cached && cTime && Date.now() - parseInt(cTime) < CONFIG.cacheLife) {
    badge.textContent = 'Cached';
    renderGitHub(JSON.parse(cached));
    return;
  }

  try {
    const [uRes, rRes] = await Promise.all([
      fetch(`https://api.github.com/users/${UN}`),
      fetch(`https://api.github.com/users/${UN}/repos?per_page=100&sort=updated`),
    ]);
    if (!uRes.ok) throw new Error('GitHub API error');

    const user = await uRes.json();
    const repos = await rRes.json();

    const stars = Array.isArray(repos) ? repos.reduce((a, r) => a + (r.stargazers_count || 0), 0) : 0;
    const forks = Array.isArray(repos) ? repos.reduce((a, r) => a + (r.forks_count || 0), 0) : 0;

    const data = {
      public_repos: user.public_repos || 0,
      followers: user.followers || 0,
      following: user.following || 0,
      stars, forks,
      bio: user.bio || '',
      avatar: user.avatar_url || '',
    };

    localStorage.setItem(KEY, JSON.stringify(data));
    localStorage.setItem(TMK, Date.now().toString());
    badge.textContent = 'Live';
    renderGitHub(data);
  } catch {
    document.getElementById('github-stats-container').innerHTML = ghError();
    badge.textContent = 'Error';
  }
}

function renderGitHub(d) {
  const el = document.getElementById('github-stats-container');
  el.innerHTML = `
    <div class="gh-grid">
      <div class="gh-card"><span class="gh-num" data-count="${d.public_repos}">0</span><span class="gh-lbl">Repositories</span></div>
      <div class="gh-card"><span class="gh-num" data-count="${d.stars}">0</span><span class="gh-lbl">Total Stars</span></div>
      <div class="gh-card"><span class="gh-num" data-count="${d.followers}">0</span><span class="gh-lbl">Followers</span></div>
      <div class="gh-card"><span class="gh-num" data-count="${d.forks}">0</span><span class="gh-lbl">Total Forks</span></div>
    </div>`;

  // Animate counters in stats
  el.querySelectorAll('[data-count]').forEach(c => animateCounter(c, parseInt(c.dataset.count), 1300));

  // GitHub streak image
  const img = document.getElementById('github-streak-img');
  img.src = `https://streak-stats.demolab.com?user=${CONFIG.githubUsername}&theme=dark&hide_border=true&background=00000000&ring=00d4ff&fire=00d4ff&currStreakLabel=00d4ff&sideNums=eeeef0&currStreakNum=00d4ff&sideLabels=7a7a8e&dates=3e3e52`;
  img.style.display = 'block';
  img.onerror = () => { img.style.display = 'none'; };
}

function ghError() {
  return `<div class="fetch-error"><i class="fas fa-exclamation-circle"></i>
    <span>Update <code>CONFIG.githubUsername</code> in script.js to see live data.</span></div>`;
}


/* ============================================================
   LEETCODE STATS
   ============================================================ */
async function fetchLeetCode() {
  const UN = CONFIG.leetcodeUsername;
  const KEY = `lc_${UN}`;
  const TMK = `lc_t_${UN}`;
  const badge = document.getElementById('lc-badge');

  // Cache hit?
  const cached = localStorage.getItem(KEY);
  const cTime = localStorage.getItem(TMK);
  if (cached && cTime && Date.now() - parseInt(cTime) < CONFIG.cacheLife) {
    badge.textContent = 'Cached';
    renderLeetCode(JSON.parse(cached));
    return;
  }

  // Try primary API (via allorigins CORS proxy)
  try {
    const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://leetcode-stats-api.herokuapp.com/${UN}`)}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (data.status === 'error') throw new Error();
    saveLCCache(KEY, TMK, data);
    badge.textContent = 'Live';
    renderLeetCode(data);
  } catch {
    // Fallback: alfa-leetcode-api supports CORS natively, no proxy needed
    try {
      const res = await fetch(`https://alfa-leetcode-api.onrender.com/userProfile/${UN}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      saveLCCache(KEY, TMK, data);
      badge.textContent = 'Live';
      renderLeetCode(data);
    } catch {
      document.getElementById('leetcode-stats-container').innerHTML = lcError();
      badge.textContent = 'Error';
    }
  }
}

function saveLCCache(key, tmk, data) {
  localStorage.setItem(key, JSON.stringify(data));
  localStorage.setItem(tmk, Date.now().toString());
}

function renderLeetCode(d) {
  // Normalise field names (different APIs return different shapes)
  const total = d.totalSolved ?? d.solvedProblem ?? 0;
  const easy = d.easySolved ?? d.Easy ?? 0;
  const medium = d.mediumSolved ?? d.Medium ?? 0;
  const hard = d.hardSolved ?? d.Hard ?? 0;
  const rank = d.ranking ?? d.userCalendar?.streak ?? null;
  const accept = d.acceptanceRate != null
    ? parseFloat(d.acceptanceRate).toFixed(1) + '%'
    : (d.matchedUserStats?.acSubmissionNum?.[0]?.submissions && d.matchedUserStats?.totalSubmissionNum?.[0]?.submissions)
      ? (d.matchedUserStats.acSubmissionNum[0].submissions / d.matchedUserStats.totalSubmissionNum[0].submissions * 100).toFixed(1) + '%'
      : 'N/A';

  const rankStr = rank ? `#${Number(rank).toLocaleString()}` : '—';

  const el = document.getElementById('leetcode-stats-container');
  el.innerHTML = `
    <div class="lc-total-wrap">
      <div class="lc-num" data-count="${total}">0</div>
      <div class="lc-lbl">Problems Solved</div>
    </div>
    <div class="lc-diff-row">
      <div class="lc-diff easy">
        <span class="lc-diff-n" data-count="${easy}">0</span>
        <span class="lc-diff-t">Easy</span>
      </div>
      <div class="lc-diff medium">
        <span class="lc-diff-n" data-count="${medium}">0</span>
        <span class="lc-diff-t">Medium</span>
      </div>
      <div class="lc-diff hard">
        <span class="lc-diff-n" data-count="${hard}">0</span>
        <span class="lc-diff-t">Hard</span>
      </div>
    </div>
    <div class="lc-extra">
      <div class="lc-extra-item">
        <div class="lc-extra-l">Global Rank</div>
        <div class="lc-extra-v">${rankStr}</div>
      </div>
      <div class="lc-extra-item">
        <div class="lc-extra-l">Acceptance</div>
        <div class="lc-extra-v">${accept}</div>
      </div>
    </div>`;

  // Animate all counters
  el.querySelectorAll('[data-count]').forEach(c => animateCounter(c, parseInt(c.dataset.count), 1400));
}

function lcError() {
  return `<div class="fetch-error"><i class="fas fa-exclamation-circle"></i>
    <span>Update <code>CONFIG.leetcodeUsername</code> in script.js to see live data.</span></div>`;
}


/* ============================================================
   HELPER — animate a number counter
   ============================================================ */
function animateCounter(el, target, duration = 1200) {
  let started = null;
  function step(ts) {
    if (!started) started = ts;
    const p = Math.min((ts - started) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(ease * target);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  setTimeout(() => requestAnimationFrame(step), 200);
}


/* ============================================================
   SMOOTH SECTION SCROLL (offset for fixed nav)
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}


/* ============================================================
   PARALLAX — subtle hero content shift on scroll
   ============================================================ */
function initParallax() {
  const heroContent = document.querySelector('.hero-content');
  const heroGlows = document.querySelectorAll('.hero-glow');
  if (!heroContent) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > window.innerHeight) return;
    heroContent.style.transform = `translateY(${y * 0.12}px)`;
    heroGlows.forEach((g, i) => {
      g.style.transform = `translateY(${y * (0.04 + i * 0.03)}px)`;
    });
  }, { passive: true });
}


/* ============================================================
   TILT EFFECT on project cards & freelance cards
   ============================================================ */
function initTilt() {
  const cards = document.querySelectorAll('.project-card, .freelance-card');
  const MAX_TILT = 6;

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / (r.width / 2);
      const dy = (e.clientY - cy) / (r.height / 2);
      card.style.transform = `perspective(800px) rotateX(${-dy * MAX_TILT}deg) rotateY(${dx * MAX_TILT}deg) scale(1.012)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}


/* ============================================================
   INIT ALL — called after preloader exits
   ============================================================ */
function initAll() {
  initNavbar();
  initMobileMenu();
  initTheme();
  initThreeJS();
  initTyping();
  initScrollReveal();
  initCounters();
  initProjectGlow();
  initPhotoFallback();
  initActiveNav();
  initAnime();
  initContactForm();
  initSmoothScroll();
  initParallax();
  initTilt();

  // Fetch external data
  fetchGitHub();
  fetchLeetCode();
}

/**
 * Celebration Confetti Burst
 */
function fireConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 10001
  };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}
