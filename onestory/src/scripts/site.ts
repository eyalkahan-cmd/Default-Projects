import { SITE } from '../config';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Videos marked data-src load only when they come near the viewport.
function loadVideo(video: HTMLVideoElement) {
  if (video.dataset.loaded) return;
  video.querySelectorAll<HTMLSourceElement>('source[data-src]').forEach((s) => {
    s.src = s.dataset.src!;
  });
  video.dataset.loaded = '1';
  video.load();
}

function tryPlay(video: HTMLVideoElement) {
  if (reduceMotion.matches) return;
  video.play().catch(() => {
    /* autoplay blocked: the poster or first frame stays visible */
  });
}

function setupLazyVideos() {
  const videos = document.querySelectorAll<HTMLVideoElement>('video');
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting) {
          loadVideo(v);
          if (v.hasAttribute('data-autoplay') && !v.closest('[hidden]') && !v.dataset.userPaused) tryPlay(v);
        } else if (!v.paused && v.hasAttribute('data-autoplay')) {
          v.pause();
        }
      }
    },
    { rootMargin: '200px 0px' },
  );
  videos.forEach((v) => io.observe(v));

  // With reduced motion, muted loops get native controls so they can still be watched on demand.
  if (reduceMotion.matches) {
    document.querySelectorAll<HTMLVideoElement>('video[data-autoplay]').forEach((v) => {
      v.controls = true;
    });
  }
}

function setupHeroPause() {
  const btn = document.querySelector<HTMLButtonElement>('[data-hero-pause]');
  const video = document.querySelector<HTMLVideoElement>('.hero-video');
  if (!btn || !video) return;
  const label = btn.querySelector('[data-label]')!;
  const sync = () => {
    const paused = video.paused;
    btn.setAttribute('aria-pressed', String(paused));
    label.textContent = paused ? 'הפעלת וידאו הרקע' : 'עצירת וידאו הרקע';
  };
  btn.addEventListener('click', () => {
    if (video.paused) {
      delete video.dataset.userPaused;
      video.play().catch(() => {});
    } else {
      video.dataset.userPaused = '1';
      video.pause();
    }
  });
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  sync();
}

function setupHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const cta = document.querySelector<HTMLElement>('[data-mobile-cta]');
  const hero = document.querySelector<HTMLElement>('.hero');
  const contact = document.getElementById('contact');

  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle('is-solid', y > 40);
    if (cta && hero) {
      const pastHero = y > hero.offsetHeight * 0.6;
      const atContact = contact ? contact.getBoundingClientRect().top < window.innerHeight * 0.6 : false;
      cta.classList.toggle('is-visible', pastHero && !atContact);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (!nav || !toggle) return;
  const close = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  toggle.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (open) header?.classList.add('is-solid');
  });
  nav.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      close();
      toggle.focus();
    }
  });
}

function setupDemos() {
  const root = document.querySelector<HTMLElement>('[data-demos]');
  if (!root) return;
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const select = (i: number, focus = false) => {
    tabs.forEach((t, j) => {
      const on = i === j;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls')!)!;
      panel.hidden = !on;
      const v = panel.querySelector('video');
      if (!v) return;
      if (on) {
        loadVideo(v);
        v.currentTime = 0;
        tryPlay(v);
      } else {
        v.pause();
      }
    });
    if (focus) tabs[i].focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', (e) => {
      // RTL: ArrowLeft moves forward, ArrowRight moves back.
      const map: Record<string, number> = { ArrowLeft: 1, ArrowRight: -1 };
      if (e.key in map) {
        e.preventDefault();
        select((i + map[e.key] + tabs.length) % tabs.length, true);
      } else if (e.key === 'Home') {
        e.preventDefault();
        select(0, true);
      } else if (e.key === 'End') {
        e.preventDefault();
        select(tabs.length - 1, true);
      }
    });
  });
}

function setupCompare() {
  const root = document.querySelector<HTMLElement>('[data-compare]');
  const btn = document.querySelector<HTMLButtonElement>('[data-compare-play]');
  if (!root || !btn) return;
  const videos = [...root.querySelectorAll<HTMLVideoElement>('video')];
  const label = btn.querySelector('[data-label]')!;
  let playing = false;
  btn.addEventListener('click', () => {
    videos.forEach(loadVideo);
    playing = !playing;
    if (playing) {
      videos.forEach((v) => {
        v.currentTime = 0;
        v.play().catch(() => {});
      });
      label.textContent = 'עצירת ההשוואה';
    } else {
      videos.forEach((v) => v.pause());
      label.textContent = 'הפעלת ההשוואה';
    }
  });
}

function setupReveal() {
  const els = document.querySelectorAll<HTMLElement>('.reveal');
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  els.forEach((el) => io.observe(el));
}

function setupForm() {
  const form = document.querySelector<HTMLFormElement>('[data-contact]');
  if (!form) return;
  const status = form.querySelector<HTMLElement>('[data-status]')!;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstInvalid: HTMLInputElement | null = null;
    form.querySelectorAll<HTMLInputElement>('[required]').forEach((el) => {
      const ok = el.value.trim().length > 0;
      el.setAttribute('aria-invalid', String(!ok));
      if (!ok && !firstInvalid) firstInvalid = el;
    });
    if (firstInvalid) {
      status.textContent = 'נא למלא שם וטלפון.';
      (firstInvalid as HTMLInputElement).focus();
      return;
    }
    const d = new FormData(form);
    const text = [
      'היי, אשמח לשמוע על סרטון גדילה.',
      `שם: ${d.get('name')}`,
      `טלפון: ${d.get('phone')}`,
      `אירוע: ${d.get('type')}`,
      d.get('date') ? `מועד: ${d.get('date')}` : '',
      d.get('notes') ? `על הסרטון: ${d.get('notes')}` : '',
    ]
      .filter(Boolean)
      .join('\n');
    if (SITE.whatsapp) {
      window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
      status.textContent = 'נפתחה הודעת WhatsApp עם הפרטים. נשאר רק ללחוץ שליחה.';
    } else if (SITE.email) {
      window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent('סרטון גדילה')}&body=${encodeURIComponent(text)}`;
      status.textContent = 'נפתחה הודעת מייל עם הפרטים.';
    } else {
      status.textContent = 'הטופס עדיין לא מחובר: בגרסת התצוגה הזו הפרטים לא נשלחים לשום מקום.';
    }
  });
}

export function init() {
  setupLazyVideos();
  setupHeroPause();
  setupHeader();
  setupDemos();
  setupCompare();
  setupReveal();
  setupForm();
}
