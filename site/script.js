/* ============================================================
   Cordeiro Creatives — site behaviour
   ============================================================ */

/* ------------------------------------------------------------
   FORM DELIVERY  — the one line you change when you pick a backend.

   Leave as null  -> the form opens the visitor's email client with
                     everything pre-filled and sends to CONTACT_EMAIL.
                     Works today with zero setup and no account.

   Set to a URL   -> the form POSTs there instead (Formspree, Netlify,
                     Basin, your own API). Example:
                     const FORM_ENDPOINT = 'https://formspree.io/f/xyzabcd';
   ------------------------------------------------------------ */
const FORM_ENDPOINT = null;
const CONTACT_EMAIL = 'chase@cordeirocreatives.com';

/* ---------------- Mobile navigation ---------------- */

const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav-links');

function setNav(open) {
  nav.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
}

menuBtn?.addEventListener('click', () => {
  setNav(!nav.classList.contains('open'));
});

nav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setNav(false));
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && nav?.classList.contains('open')) {
    setNav(false);
    menuBtn.focus();
  }
});

document.addEventListener('click', e => {
  if (!nav?.classList.contains('open')) return;
  if (nav.contains(e.target) || menuBtn.contains(e.target)) return;
  setNav(false);
});

/* ---------------- Reveal on scroll ---------------- */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduceMotion) {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
} else {
  document.querySelectorAll('.reveal').forEach(el => {
    const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal'));
    el.style.setProperty('--delay', `${siblings.indexOf(el) * 0.12}s`);
  });

  const observer = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ---------------- Active nav link ---------------- */

const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));

const sectionObserver = new IntersectionObserver(
  entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
  }),
  { rootMargin: '-45% 0px -50% 0px' }
);

navLinks.forEach(a => {
  const target = document.getElementById(a.getAttribute('href').slice(1));
  if (target) sectionObserver.observe(target);
});

/* ---------------- Depth on scroll ---------------- */

const root = document.documentElement;
const water = document.querySelector('.water');
const DIM = [143, 169, 210];
const BRIGHT = [255, 255, 255];

function updateDepth() {
  const scrollY = window.scrollY;
  const max = Math.max(root.scrollHeight - window.innerHeight, 1);
  const depth = Math.min(Math.max(scrollY / max, 0), 1);
  root.style.setProperty('--depth', depth.toFixed(4));
  const ink = DIM.map((c, i) => Math.round(c + (BRIGHT[i] - c) * depth));
  root.style.setProperty('--text', `rgb(${ink.join(', ')})`);
  water.style.transform = `translateY(${-scrollY * 0.25}px)`;
}

function sizeWater() {
  water.style.height = `${root.scrollHeight}px`;
  updateDepth();
}

window.addEventListener('scroll', updateDepth, { passive: true });
window.addEventListener('resize', sizeWater);
sizeWater();

const accentObserver = new IntersectionObserver(
  entries => entries.forEach(entry => {
    if (entry.isIntersecting) root.style.setProperty('--accent', entry.target.dataset.accent);
  }),
  { rootMargin: '-45% 0px -50% 0px' }
);

document.querySelectorAll('section[data-accent]').forEach(s => accentObserver.observe(s));

/* ---------------- Footer year ---------------- */

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------------- Contact form ---------------- */

const form = document.getElementById('lead-form');
const statusEl = document.getElementById('form-status');

function setStatus(message, state) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.remove('is-error', 'is-ok');
  if (state) statusEl.classList.add(state);
}

function validate(data) {
  if (!data.name.trim()) return 'Please add your name.';
  if (!data.email.trim()) return 'Please add your email so I can reply.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) return 'That email address does not look right.';
  return null;
}

function buildMailto(data) {
  const subject = `New inquiry — ${data.company.trim() || data.name.trim()}`;
  const body = [
    `Name:     ${data.name}`,
    `Company:  ${data.company || '—'}`,
    `Email:    ${data.email}`,
    `Phone:    ${data.phone || '—'}`,
    `Service:  ${data.service}`,
    '',
    'Project details:',
    data.message || '—'
  ].join('\n');

  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

form?.addEventListener('submit', async e => {
  e.preventDefault();

  const fd = new FormData(form);
  const data = {
    name:    (fd.get('name')    || '').toString(),
    company: (fd.get('company') || '').toString(),
    email:   (fd.get('email')   || '').toString(),
    phone:   (fd.get('phone')   || '').toString(),
    service: (fd.get('service') || '').toString(),
    message: (fd.get('message') || '').toString()
  };

  const error = validate(data);
  if (error) {
    setStatus(error, 'is-error');
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');

  // No backend configured yet — hand off to the visitor's mail client.
  if (!FORM_ENDPOINT) {
    setStatus('Opening your email app…');
    window.location.href = buildMailto(data);
    setTimeout(() => {
      setStatus(
        `If nothing opened, email ${CONTACT_EMAIL} directly.`,
        'is-ok'
      );
    }, 1200);
    return;
  }

  // Backend configured — POST it.
  submitBtn.disabled = true;
  setStatus('Sending…');

  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: fd
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    form.reset();
    setStatus("Thanks — that came through. I'll get back to you shortly.", 'is-ok');
  } catch (err) {
    setStatus(
      `Something went wrong sending that. Email ${CONTACT_EMAIL} directly and I'll pick it up.`,
      'is-error'
    );
  } finally {
    submitBtn.disabled = false;
  }
});
