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

// The hero loop is the product demo, so it always plays (muted, with its own pause button).
// Other loops respect reduced motion and get controls instead.
function tryPlay(video: HTMLVideoElement) {
  if (reduceMotion.matches && !video.hasAttribute('data-always-play')) return;
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
    document.querySelectorAll<HTMLVideoElement>('video[data-autoplay]:not([data-always-play])').forEach((v) => {
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

// The row of source photos under the sample film: follows playback, and the line between
// photos fills only while the film is moving from one photo to the next.
function setupStoryPath() {
  const root = document.querySelector<HTMLElement>('[data-story-path]');
  const video = document.querySelector<HTMLVideoElement>('#film video');
  if (!root || !video) return;
  const scenes: [number, number][] = JSON.parse(root.dataset.scenes!);
  const items = [...root.querySelectorAll<HTMLElement>('.story-item')];
  const dots = [...root.querySelectorAll<HTMLElement>('.story-dot')];
  const fill = root.querySelector<HTMLElement>('[data-story-fill]')!;
  const kind = root.querySelector<HTMLElement>('[data-now-kind]')!;
  const label = root.querySelector<HTMLElement>('[data-now-label]')!;
  const scroller = root.querySelector<HTMLElement>('.story-scroller')!;
  const names = items.map((li) => li.querySelector('.story-name')!.lastChild!.textContent!.trim());
  let last = '';
  let raf = 0;

  // Position along the path: an integer while a photo is on screen, fractional during a transition.
  const position = (t: number) => {
    for (let i = 0; i < scenes.length; i++) {
      const [start, end] = scenes[i];
      if (t < start) return i === 0 ? 0 : i - 1 + (t - scenes[i - 1][1]) / (start - scenes[i - 1][1]);
      if (t <= end) return i;
    }
    return scenes.length - 1;
  };

  const render = () => {
    const pos = position(video.currentTime);
    const cur = Math.floor(pos);
    const moving = pos !== cur;
    fill.style.width = `${(pos / (scenes.length - 1)) * 100}%`;
    items.forEach((li, i) => {
      li.classList.toggle('is-done', i < cur);
      li.classList.toggle('is-current', i === cur);
      li.classList.toggle('is-next', moving && i === cur + 1);
    });
    dots.forEach((d, i) => {
      d.classList.toggle('is-done', i < cur);
      d.classList.toggle('is-current', i === cur);
      d.classList.toggle('is-next', moving && i === cur + 1);
    });
    const key = moving ? `m${cur}` : `s${cur}`;
    if (key !== last) {
      last = key;
      kind.textContent = moving ? 'מעבר' : `תמונה ${cur + 1} מתוך ${scenes.length}`;
      label.textContent = moving ? `${names[cur]} ← ${names[cur + 1]}` : names[cur];
      const target = items[moving ? cur + 1 : cur];
      const r = scroller.getBoundingClientRect();
      if (scroller.scrollWidth > scroller.clientWidth && r.top < window.innerHeight && r.bottom > 0) {
        const tr = target.getBoundingClientRect();
        scroller.scrollBy({ left: tr.left + tr.width / 2 - (r.left + r.width / 2), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      }
    }
  };

  const loop = () => {
    render();
    raf = video.paused ? 0 : requestAnimationFrame(loop);
  };
  video.addEventListener('play', () => {
    if (!raf) raf = requestAnimationFrame(loop);
  });
  video.addEventListener('seeked', render);
  video.addEventListener('timeupdate', () => {
    if (!raf) render();
  });

  root.querySelectorAll<HTMLButtonElement>('[data-seek]').forEach((btn) => {
    btn.addEventListener('click', () => {
      video.currentTime = Number(btn.dataset.seek);
      video.play().catch(() => {});
      render();
    });
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
  setupStoryPath();
  setupReveal();
  setupForm();
}
