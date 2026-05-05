/* =========================================
   GANI DEVELOPERS — Main JavaScript
========================================= */

// =========================================
// 1. LOADING SCREEN
// =========================================
const loader = document.getElementById('loader');
const progressFill = document.getElementById('loader-progress-fill');
const progressPercent = document.getElementById('loader-percent');
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

// Particle system
canvas.width = 400;
canvas.height = 400;

const particles = [];
const PARTICLE_COUNT = 60;
const GANI_TEXT = 'GANI';

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 1.5;
    this.alpha = Math.random() * 0.6 + 0.2;
    this.radius = Math.random() * 3 + 1;
    this.color = Math.random() > 0.5 ? '#3182CE' : '#1B2A41';
    this.targetX = null;
    this.targetY = null;
    this.forming = false;
  }
  update(progress) {
    if (progress > 0.4 && this.targetX !== null) {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const speed = 0.12 * ((progress - 0.4) / 0.6);
      this.x += dx * speed;
      this.y += dy * speed;
      this.alpha = Math.min(0.9, this.alpha + 0.02);
      this.radius = Math.max(2, this.radius);
    } else {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.restore();
  }
}

for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push(new Particle());
}

// Connect nearby particles with lines
function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        ctx.save();
        ctx.globalAlpha = (1 - dist / 80) * 0.15;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = '#3182CE';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

let loaderProgress = 0;
let animId;

function animateLoader(progress) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawConnections();
  particles.forEach(p => {
    p.update(progress);
    p.draw();
  });
}

// Progress animation
let startTime = null;
const LOADER_DURATION = 3000; // 3 seconds

function runLoader(timestamp) {
  if (!startTime) startTime = timestamp;
  const elapsed = timestamp - startTime;
  loaderProgress = Math.min(elapsed / LOADER_DURATION, 1);
  
  const displayPercent = Math.floor(loaderProgress * 100);
  progressFill.style.width = displayPercent + '%';
  progressPercent.textContent = displayPercent + '%';

  animateLoader(loaderProgress);

  if (loaderProgress < 1) {
    animId = requestAnimationFrame(runLoader);
  } else {
    // Done — hide loader
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.classList.remove('no-scroll');
      triggerHeroAnimations();
      cancelAnimationFrame(animId);
    }, 300);
  }
}

document.body.classList.add('no-scroll');
requestAnimationFrame(runLoader);


// =========================================
// 2. NAVBAR
// =========================================
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
const mobileOverlay = document.getElementById('mobile-menu-overlay');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Back to top visibility
  const backToTop = document.getElementById('back-to-top');
  if (window.scrollY > 400) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }

  // Active nav link
  updateActiveNav();
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
  mobileOverlay.classList.toggle('active');
  document.body.classList.toggle('no-scroll');
});

mobileOverlay.addEventListener('click', closeMobileMenu);

function closeMobileMenu() {
  hamburger.classList.remove('open');
  navLinks.classList.remove('open');
  mobileOverlay.classList.remove('active');
  document.body.classList.remove('no-scroll');
}

// Close menu on nav link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

function updateActiveNav() {
  const sections = ['home', 'services', 'projects', 'contact'];
  const scrollY = window.scrollY + 100;

  for (let i = sections.length - 1; i >= 0; i--) {
    const section = document.getElementById(sections[i]);
    if (section && section.offsetTop <= scrollY) {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      const activeLink = document.getElementById('nav-' + sections[i]);
      if (activeLink) activeLink.classList.add('active');
      break;
    }
  }
}


// =========================================
// 3. SCROLL ANIMATIONS
// =========================================
function triggerHeroAnimations() {
  // Trigger all visible elements on home
  document.querySelectorAll('.hero-section .reveal-up, .hero-section .reveal-fade').forEach((el, i) => {
    setTimeout(() => el.classList.add('revealed'), i * 80);
  });
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -60px 0px'
});

document.querySelectorAll('.reveal-up, .reveal-fade').forEach(el => {
  revealObserver.observe(el);
});


// =========================================
// 4. COUNTER ANIMATION
// =========================================
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'));
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out
    el.textContent = Math.round(ease * target);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-number').forEach(animateCounter);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);


// =========================================
// 5. PROJECT FILTER
// =========================================
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

function filterProjects(filter) {
  projectCards.forEach(card => {
    const category = card.getAttribute('data-category');
    if (filter === 'all' || category === filter) {
      card.classList.remove('hidden');
      card.style.opacity = '0';
      card.style.transform = 'scale(0.95) translateY(10px)';
      setTimeout(() => {
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        card.style.opacity = '1';
        card.style.transform = 'scale(1) translateY(0)';
      }, 50);
    } else {
      card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      card.style.opacity = '0';
      card.style.transform = 'scale(0.9)';
      setTimeout(() => card.classList.add('hidden'), 300);
    }
  });
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterProjects(btn.getAttribute('data-filter'));
  });
});

function scrollToProjects(category) {
  const projectsSection = document.getElementById('projects');
  if (projectsSection) {
    projectsSection.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      const btn = document.querySelector(`[data-filter="${category}"]`);
      if (btn) {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterProjects(category);
      }
    }, 600);
  }
}


// =========================================
// 6. LIGHTBOX
// =========================================
const lightboxData = [
  {
    src: 'assets/images/project-residential.png',
    caption: 'Modern Villa Construction · Bangalore, Karnataka'
  },
  {
    src: 'assets/images/project-commercial.png',
    caption: 'Commercial Office Complex · Mangalore, Karnataka'
  },
  {
    src: 'assets/images/project-interior.png',
    caption: 'Luxury Interior Makeover · Udupi, Karnataka'
  },
  {
    src: 'assets/images/project-renovation.png',
    caption: 'Complete Home Renovation · Manipal, Karnataka'
  },
  {
    src: 'assets/images/project-plot.png',
    caption: 'Premium Plot Development · Kundapura, Karnataka'
  }
];

let currentLightboxIndex = 0;
const lightboxOverlay = document.getElementById('lightbox-overlay');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');

function openLightbox(index) {
  currentLightboxIndex = index;
  const data = lightboxData[index];
  lightboxImg.src = data.src;
  lightboxImg.alt = data.caption;
  lightboxCaption.textContent = data.caption;
  lightboxOverlay.classList.add('active');
  document.body.classList.add('no-scroll');
}

function closeLightbox() {
  lightboxOverlay.classList.remove('active');
  document.body.classList.remove('no-scroll');
}

function prevLightbox(e) {
  e.stopPropagation();
  currentLightboxIndex = (currentLightboxIndex - 1 + lightboxData.length) % lightboxData.length;
  updateLightboxImage();
}

function nextLightbox(e) {
  e.stopPropagation();
  currentLightboxIndex = (currentLightboxIndex + 1) % lightboxData.length;
  updateLightboxImage();
}

function updateLightboxImage() {
  lightboxImg.style.opacity = '0';
  lightboxImg.style.transform = 'scale(0.95)';
  setTimeout(() => {
    const data = lightboxData[currentLightboxIndex];
    lightboxImg.src = data.src;
    lightboxImg.alt = data.caption;
    lightboxCaption.textContent = data.caption;
    lightboxImg.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    lightboxImg.style.opacity = '1';
    lightboxImg.style.transform = 'scale(1)';
  }, 200);
}

// Keyboard navigation for lightbox
document.addEventListener('keydown', (e) => {
  if (!lightboxOverlay.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') prevLightbox(e);
  if (e.key === 'ArrowRight') nextLightbox(e);
});


// =========================================
// 7. CONTACT FORM
// =========================================
function handleFormSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('contact-form');
  const btn = document.getElementById('form-submit-btn');
  const success = document.getElementById('form-success');

  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  btn.disabled = true;

  // Simulate form submission
  setTimeout(() => {
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
    btn.disabled = false;
    success.style.display = 'flex';
    form.reset();
    setTimeout(() => {
      success.style.display = 'none';
    }, 5000);
  }, 1800);
}


// =========================================
// 8. BACK TO TOP
// =========================================
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


// =========================================
// 9. SMOOTH ANCHOR SCROLLING
// =========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offset = target.offsetTop - 70;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  });
});


// =========================================
// 10. SERVICE CARD CURSOR EFFECT
// =========================================
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', function(e) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    card.style.transform = `translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });
  card.addEventListener('mouseleave', function() {
    card.style.transform = '';
  });
});


// =========================================
// 11. SCROLL INDICATOR CLICK
// =========================================
const scrollIndicator = document.getElementById('scroll-indicator');
if (scrollIndicator) {
  scrollIndicator.addEventListener('click', () => {
    const founder = document.getElementById('founder');
    if (founder) founder.scrollIntoView({ behavior: 'smooth' });
  });
}

// Hide scroll indicator on scroll
window.addEventListener('scroll', () => {
  if (scrollIndicator && window.scrollY > 100) {
    scrollIndicator.style.opacity = '0';
    scrollIndicator.style.pointerEvents = 'none';
  } else if (scrollIndicator) {
    scrollIndicator.style.opacity = '1';
    scrollIndicator.style.pointerEvents = 'auto';
  }
}, { passive: true });
