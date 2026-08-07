/* ==========================================================================
   Za Vyskeř — chování stránky
   Vanilla JS, žádné závislosti. Vše je progresivní vylepšení:
   bez JS zůstane stránka čitelná a kompletní.
   ========================================================================== */
(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- Motiv */
  const themeToggle = $('#theme-toggle');
  const systemDark = matchMedia('(prefers-color-scheme: dark)');

  const currentTheme = () => {
    const set = document.documentElement.dataset.theme;
    if (set === 'light' || set === 'dark') return set;
    return systemDark.matches ? 'dark' : 'light';
  };

  themeToggle?.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('zv-theme', next); } catch { /* privátní režim */ }
  });

  /* ------------------------------------------------------ Mobilní navigace */
  const navToggle = $('#nav-toggle');
  const nav = $('#nav');

  const setNav = (open) => {
    nav?.classList.toggle('is-open', open);
    navToggle?.setAttribute('aria-expanded', String(open));
    navToggle?.setAttribute('aria-label', open ? 'Zavřít menu' : 'Otevřít menu');
  };

  navToggle?.addEventListener('click', () => setNav(!nav.classList.contains('is-open')));
  nav?.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });

  /* ---------------------------------------------------- Hlavička při scrollu */
  const header = $('.site-header');
  const onScroll = () => header?.classList.toggle('is-stuck', window.scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --------------------------------------------------- Odhalování při scrollu */
  const revealables = $$('.reveal');

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealables.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    // Prvky ve stejné skupině se odhalují po sobě (stagger)
    const groups = new Map();
    revealables.forEach((el) => {
      const key = el.parentElement;
      const idx = groups.get(key) ?? 0;
      groups.set(key, idx + 1);
      el.style.setProperty('--reveal-delay', `${Math.min(idx, 5) * 60}ms`);
      revealObserver.observe(el);
    });
  }

  /* ------------------------------------------------------- Karty kandidátů

     V index.html je u každého kandidáta jen to, co je i na hlasovacím lístku.
     Volitelné údaje (data-job, data-focus, data-quote, data-bio) jsou zpočátku
     prázdné — jakmile je vyplníte, dokreslí se sem odpovídající části karty.
     Karta se stane rozklikávací teprve tehdy, když má vyplněné data-bio.
  */
  const grid = $('#candidate-grid');
  const cards = $$('.candidate', grid ?? document);

  const sipka = () =>
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M5 12h13M12 5l7 7-7 7"/></svg>';

  const doplnKartu = (card) => {
    const d = card.dataset;
    const body = card.querySelector('.candidate__body');
    if (!body) return;

    // Povolání se přidá za část obce
    const meta = body.querySelector('.candidate__meta');
    if (meta && d.job) meta.textContent += ` · ${d.job}`;

    // Citát pod základní údaje
    if (d.quote) {
      const q = document.createElement('span');
      q.className = 'candidate__quote';
      q.textContent = `„${d.quote}“`;
      body.append(q);
    }

    // Oblasti oddělené znakem · se vysází jako štítky
    if (d.focus) {
      const wrap = document.createElement('span');
      wrap.className = 'candidate__tags';
      d.focus.split('·').map((t) => t.trim()).filter(Boolean).forEach((t) => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = t;
        wrap.append(tag);
      });
      body.append(wrap);
    }
  };

  /* --------------------------------------------------- Detail kandidáta (dialog) */
  const modal = $('#candidate-modal');

  // Vyplní hodnotu; prázdný údaj schová celý řádek, ať v detailu nezůstane pomlčka
  const fill = (id, value) => {
    const el = $(id);
    if (!el) return;
    el.textContent = value || '';
    const radek = el.closest('.modal__facts > div');
    if (radek) radek.hidden = !value;
  };

  const openCandidate = (card) => {
    if (!modal) return;
    const d = card.dataset;

    const avatar = $('#modal-avatar');
    const photo = card.querySelector('.candidate__avatar img');
    if (avatar) {
      avatar.textContent = '';
      if (photo) {
        const clone = photo.cloneNode();
        clone.alt = '';
        avatar.append(clone);
        avatar.style.overflow = 'hidden';
      } else {
        avatar.textContent = card.querySelector('.candidate__avatar')?.dataset.initials || '';
      }
    }

    fill('#modal-order', `${d.order}. na kandidátní listině`);
    fill('#modal-name', d.name);
    fill('#modal-quote', d.quote ? `„${d.quote}“` : '');
    fill('#modal-bio', d.bio);
    fill('#modal-job', d.job);
    fill('#modal-village', d.village);
    fill('#modal-focus', d.focus);

    const quoteEl = $('#modal-quote');
    if (quoteEl) quoteEl.hidden = !d.quote;

    if (typeof modal.showModal === 'function') {
      modal.showModal();
      document.body.classList.add('is-locked');
    } else {
      // Prohlížeč bez <dialog> — necháme uživatele na kartě, nic nerozbijeme
      modal.setAttribute('open', '');
    }
  };

  cards.forEach((card) => {
    doplnKartu(card);

    // Bez životopisu není co otevírat — karta zůstane statická
    if (!card.dataset.bio) return;

    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'candidate__more';
    more.innerHTML = `Více o kandidátovi ${sipka()}`;
    more.setAttribute('aria-label', `Více o kandidátovi ${card.dataset.name || ''}`.trim());
    more.addEventListener('click', () => openCandidate(card));
    card.querySelector('.candidate__card')?.append(more);
  });

  modal?.addEventListener('close', () => document.body.classList.remove('is-locked'));
  $('[data-close]', modal ?? document)?.addEventListener('click', () => modal.close());

  // Klik do pozadí zavře dialog
  modal?.addEventListener('click', (e) => {
    if (e.target !== modal) return;
    const box = modal.getBoundingClientRect();
    const outside =
      e.clientX < box.left || e.clientX > box.right ||
      e.clientY < box.top  || e.clientY > box.bottom;
    if (outside) modal.close();
  });

  /* ------------------------------------------------------------------ Rok */
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
