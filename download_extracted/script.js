const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav-links');

menuBtn?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded', 'false');
  });
});

const observer = new IntersectionObserver(
  entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }),
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('lead-form');
const status = document.getElementById('form-status');

form?.addEventListener('submit', e => {
  e.preventDefault();
  status.textContent = 'Form design is ready. Connect this to Formspree, Netlify Forms, HubSpot, or your CRM before launch.';
});
