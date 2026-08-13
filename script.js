/* ═══════════════════════════════════════════════════════
   ATIYE — Main Script
   ═══════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── Helpers ─────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ── Gallery drag-move tracker (shared with lightbox) ── */
  var cgDragMoved  = false;

  /* ── Preloader ───────────────────────────────────────── */
  const preloader = $("#preloader");

  function hidePreloader() {
    if (!preloader) return;
    preloader.classList.add("done");
    document.body.classList.add("loaded");
    initHeroVideo();
    initHeroAnimation();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(hidePreloader, 400);
  });

  /* ── Hero Video — best-practice load ────────────────── */
  function initHeroVideo() {
    const video = $("#heroVideo");
    if (!video) return;
    video.preload = "auto";
    video.load();
    video.play().catch(function () {});
  }

  /* ── Page-Light Beam ─────────────────────────────────── */
  const pageLight = document.createElement("div");
  pageLight.className = "page-light";
  document.body.appendChild(pageLight);

  /* ── RAF-Throttled Scroll ────────────────────────────── */
  const header             = $("#header");
  const heroVideoContainer = $(".hero-video-container");
  let   lastScrollY        = 0;
  let   scrollTicking      = false;

  function onScrollFrame() {
    const sy = lastScrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docH > 0 ? sy / docH : 0;

    /* Header */
    if (header) {
      if (sy > 60) {
        header.classList.add("scrolled");
        header.classList.remove("header--transparent");
      } else {
        header.classList.remove("scrolled");
        if (document.body.classList.contains("has-hero-video")) {
          header.classList.add("header--transparent");
        }
      }
    }

    /* Hero parallax */
    if (heroVideoContainer && sy < window.innerHeight) {
      heroVideoContainer.style.transform =
        "translateY(" + Math.round(sy * 0.25) + "px)";
    }

    /* Page light drifts across page */
    pageLight.style.transform =
      "rotate(-12deg) translateX(" + (-42 + progress * 115) + "vw)";

    scrollTicking = false;
  }

  window.addEventListener("scroll", function () {
    lastScrollY = window.scrollY;
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(onScrollFrame);
    }
  }, { passive: true });


  /* ── Hero Entry Animation ────────────────────────────── */
  function initHeroAnimation() {
    const ease = "cubic-bezier(0.16,1,0.3,1)";
    const items = [
      { sel: ".hero-eyebrow",  delay: 0   },
      { sel: ".hero-title",    delay: 120 },
      { sel: ".hero-subtitle", delay: 260 },
      { sel: ".hero-tags",     delay: 400 },
      { sel: ".hero-cta",      delay: 530 },
      { sel: ".hero-scroll",   delay: 700 },
    ];

    items.forEach(function (item) {
      const el = $(item.sel);
      if (!el) return;
      el.style.cssText =
        "opacity:0;transform:translateY(22px);" +
        "transition:opacity .7s " + ease + ",transform .7s " + ease;
      setTimeout(function () {
        el.style.opacity   = "1";
        el.style.transform = "translateY(0)";
      }, item.delay + 50);
    });
  }

  /* ── Section Entry Light (IO) ────────────────────────── */
  if ("IntersectionObserver" in window) {
    const sectionIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) e.target.classList.add("in-view");
      });
    }, { threshold: 0.07 });

    $$(".section").forEach(function (s) { sectionIO.observe(s); });
  }

  /* ── Scroll Reveals (IO — no layout thrashing) ───────── */
  if ("IntersectionObserver" in window) {
    const revealIO = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("active");
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -80px 0px" });

    $$(
      ".reveal, .section-header, .problem-content, .factors-grid, " +
      ".proof-content, .differential-grid, .cta-content, " +
      ".footer-content, .stats-grid, .process-grid, .faq-list"
    ).forEach(function (el) { revealIO.observe(el); });
  }

  /* ── Animated Counters ───────────────────────────────── */
  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function animateCounter(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = "1";
    const target   = parseInt(el.dataset.target, 10);
    const duration = 2200;
    const startTime = performance.now();

    function tick(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.floor(easeOutExpo(progress) * target).toLocaleString("pt-BR");
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if ("IntersectionObserver" in window) {
    const counterIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          $$(".stat-number", e.target).forEach(animateCounter);
        }
      });
    }, { threshold: 0.3 });

    $$(".stats-section").forEach(function (s) { counterIO.observe(s); });
  }

  /* ── Word-Split Text Reveals ─────────────────────────── */
  function splitWords(el) {
    if (!el || el.dataset.split) return;
    el.dataset.split = "1";
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(function (w, i) {
      return '<span class="word"><span class="word-inner" style="--i:' + i + '">' + w + "</span></span>";
    }).join(" ");
    el.classList.add("word-split");
  }

  if ("IntersectionObserver" in window) {
    const textIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("active");
          textIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });

    $$(".hero-title, .section-title").forEach(function (el) {
      splitWords(el);
      textIO.observe(el);
    });
  }

  /* ── Mobile Menu ─────────────────────────────────────── */
  const nav        = $("#nav");
  const menuToggle = $("#menu-toggle");
  const mobileNav  = $("#mobileNav");

  if (menuToggle) {
    if (mobileNav) {
      menuToggle.addEventListener("click", function () {
        const open = mobileNav.classList.toggle("open");
        menuToggle.classList.toggle("active", open);
        menuToggle.setAttribute("aria-expanded", String(open));
      });
      mobileNav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          mobileNav.classList.remove("open");
          menuToggle.classList.remove("active");
          menuToggle.setAttribute("aria-expanded", "false");
        });
      });
    } else if (nav) {
      menuToggle.addEventListener("click", function () {
        const open = nav.classList.toggle("active");
        menuToggle.classList.toggle("active", open);
        menuToggle.setAttribute("aria-expanded", String(open));
        document.body.style.overflow = open ? "hidden" : "";
      });
      $$(".nav-list a", nav).forEach(function (link) {
        link.addEventListener("click", function () {
          nav.classList.remove("active");
          menuToggle.classList.remove("active");
          menuToggle.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        });
      });
    }
  }

  /* ── Gallery Tabs ────────────────────────────────────── */
  const galleryTabs  = $$(".gallery-tab");
  const galleryGrids = $$(".gallery-grid");

  galleryTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      const target = this.dataset.tab;
      galleryTabs.forEach(function (t) { t.classList.remove("active"); });
      this.classList.add("active");
      galleryGrids.forEach(function (g) {
        g.classList.toggle("active", g.id === "gallery-" + target);
      });
    });
  });

  /* ── Cinematic Gallery (transform-based) ──────────────── */
  (function initCinematicGallery() {
    if (!document.querySelector(".cinematic-gallery")) return;

    var cgActiveReel = null;
    var cgReelData   = {};

    /* ── Build reel registry ─────────────────────────────── */
    $$(".cg-reel").forEach(function (reel) {
      var id     = reel.id.replace("cg-reel-", "");
      var track  = reel.querySelector(".cg-track");
      var slides = $$(".cg-slide", reel);
      cgReelData[id] = { reel: reel, track: track, slides: slides, current: 0, translate: 0 };
      slides.forEach(function (s, i) { s.classList.toggle("active", i === 0); });
      if (reel.classList.contains("active") && !cgActiveReel) cgActiveReel = id;
    });
    if (!cgActiveReel) {
      var k = Object.keys(cgReelData);
      if (k.length) cgActiveReel = k[0];
    }

    function fmt(n) { return String(n + 1).padStart(2, "0"); }

    /* slideW: pixel width of one slide + its gap */
    function slideW(state) {
      var s = state.slides[0];
      return s ? s.getBoundingClientRect().width + 6 : 0;
    }

    function cgUpdateUI(id) {
      var state = cgReelData[id];
      if (!state) return;
      state.slides.forEach(function (s, i) {
        s.classList.toggle("active", i === state.current);
      });
      $$(".cg-cur").forEach(function (el) { el.textContent = fmt(state.current); });
      $$(".cg-tot").forEach(function (el) { el.textContent = fmt(state.slides.length - 1); });
      var fill = $("#cg-progress-fill");
      if (fill) fill.style.width = ((state.current + 1) / state.slides.length * 100) + "%";
    }

    /* ── Core navigation ─────────────────────────────────── */
    function cgMoveTo(idx, animate) {
      var state = cgReelData[cgActiveReel];
      if (!state) return;
      idx = Math.max(0, Math.min(idx, state.slides.length - 1));
      state.current  = idx;
      var sw         = slideW(state);
      state.translate = -(idx * sw);
      state.track.style.transition = (animate === false)
        ? "none"
        : "transform 0.72s cubic-bezier(0.16,1,0.3,1)";
      state.track.style.transform = "translateX(" + state.translate + "px)";
      cgUpdateUI(cgActiveReel);
    }

    /* ── Arrow buttons ───────────────────────────────────── */
    $$(".cg-prev").forEach(function (btn) {
      btn.addEventListener("click", function () {
        cgMoveTo(cgReelData[cgActiveReel].current - 1, true);
      });
    });
    $$(".cg-next").forEach(function (btn) {
      btn.addEventListener("click", function () {
        cgMoveTo(cgReelData[cgActiveReel].current + 1, true);
      });
    });

    /* ── Category tabs (index.html) ──────────────────────── */
    $$(".cg-cat").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cat = this.dataset.cat;
        if (cat === cgActiveReel) return;
        $$(".cg-cat").forEach(function (b) { b.classList.remove("active"); });
        this.classList.add("active");
        var old = cgReelData[cgActiveReel];
        if (old) old.reel.classList.remove("active");
        cgActiveReel = cat;
        var next = cgReelData[cat];
        if (next) {
          next.reel.classList.add("active");
          next.current   = 0;
          next.translate = 0;
          next.track.style.transition = "none";
          next.track.style.transform  = "translateX(0)";
          cgUpdateUI(cat);
        }
      });
    });

    /* ── Drag / swipe ────────────────────────────────────── */
    var cgIsDragging  = false;
    var cgDragStartX  = 0;
    var cgDragStartT  = 0;
    var cgDragLastX   = 0;
    var cgDragLastMs  = 0;
    var cgVelocity    = 0;

    function onStart(x) {
      var st = cgReelData[cgActiveReel];
      if (!st) return;
      cgIsDragging = true;
      cgDragMoved  = false;
      cgDragStartX = x;
      cgDragStartT = st.translate;
      cgDragLastX  = x;
      cgDragLastMs = Date.now();
      cgVelocity   = 0;
      st.track.style.transition = "none";
    }

    function onMove(x) {
      if (!cgIsDragging) return;
      var now  = Date.now();
      var dt   = now - cgDragLastMs;
      if (dt > 0) cgVelocity = (x - cgDragLastX) / dt;
      cgDragLastX  = x;
      cgDragLastMs = now;
      var diff = x - cgDragStartX;
      if (Math.abs(diff) > 5) cgDragMoved = true;
      var st = cgReelData[cgActiveReel];
      if (!st) return;
      st.translate = cgDragStartT + diff;
      st.track.style.transform = "translateX(" + st.translate + "px)";
    }

    function onEnd() {
      if (!cgIsDragging) return;
      cgIsDragging = false;
      var st = cgReelData[cgActiveReel];
      if (!st) return;
      var sw = slideW(st);
      if (sw <= 0) return;
      /* Apply a small momentum kick before snapping to nearest slide */
      var projected = st.translate + cgVelocity * 120;
      cgMoveTo(Math.round(-projected / sw), true);
    }

    /* Attach per-track so only the visible track reacts */
    Object.keys(cgReelData).forEach(function (id) {
      var track = cgReelData[id].track;
      track.addEventListener("mousedown",  function (e) {
        if (e.button !== 0) return;
        onStart(e.clientX);
      });
      track.addEventListener("touchstart", function (e) {
        onStart(e.touches[0].clientX);
      }, { passive: true });
    });

    window.addEventListener("mousemove", function (e) { onMove(e.clientX); });
    window.addEventListener("touchmove", function (e) {
      if (cgIsDragging) onMove(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener("mouseup",  onEnd);
    window.addEventListener("touchend", onEnd);

    /* ── Keyboard ────────────────────────────────────────── */
    document.addEventListener("keydown", function (e) {
      var gal = document.querySelector(".cinematic-gallery");
      if (!gal) return;
      var r = gal.getBoundingClientRect();
      if (r.top > window.innerHeight || r.bottom < 0) return;
      if (e.key === "ArrowLeft")  cgMoveTo(cgReelData[cgActiveReel].current - 1, true);
      if (e.key === "ArrowRight") cgMoveTo(cgReelData[cgActiveReel].current + 1, true);
    });

    /* ── Init ────────────────────────────────────────────── */
    Object.keys(cgReelData).forEach(function (id) { cgUpdateUI(id); });
  })();

  /* ── FAQ Accordion ───────────────────────────────────── */
  $$(".faq-question").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const item = this.closest(".faq-item");
      const isOpen = item.classList.contains("open");
      $$(".faq-item.open").forEach(function (i) {
        i.classList.remove("open");
        i.querySelector(".faq-question").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        this.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ── Smooth Anchor Scroll ────────────────────────────── */
  $$('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#") return;
      e.preventDefault();
      const target = $(href);
      if (target) {
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.pageYOffset -
               (header ? header.offsetHeight : 0),
          behavior: "smooth",
        });
      }
    });
  });

  /* ── Magnetic Buttons ────────────────────────────────── */
  if (window.matchMedia("(hover: hover)").matches) {
    $$(".cta-button").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        const r  = this.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width  / 2);
        const dy = e.clientY - (r.top  + r.height / 2);
        this.style.transform = "translate(" + (dx * 0.18) + "px, " + (dy * 0.18) + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        this.style.transform = "";
      });
    });
  }

  /* ── Lazy Images (IO) ────────────────────────────────── */
  if ("IntersectionObserver" in window) {
    const imgIO = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          const img = e.target;
          if (img.dataset.src) img.src = img.dataset.src;
          img.classList.add("loaded");
          obs.unobserve(img);
        }
      });
    }, { rootMargin: "200px" });

    $$('img[loading="lazy"]').forEach(function (img) { imgIO.observe(img); });
  }

  /* ── Lightbox ────────────────────────────────────────── */
  function initLightbox() {
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML =
      '<div class="lightbox-backdrop"></div>' +
      '<img class="lightbox-img" src="" alt="" />' +
      '<button class="lightbox-close" aria-label="Fechar">&times;</button>';
    document.body.appendChild(lb);

    const lbImg      = lb.querySelector(".lightbox-img");
    const lbClose    = lb.querySelector(".lightbox-close");
    const lbBackdrop = lb.querySelector(".lightbox-backdrop");

    function openLB(src, alt) {
      lbImg.src = src;
      lbImg.alt = alt || "";
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    function closeLB() {
      lb.classList.remove("open");
      document.body.style.overflow = "";
      setTimeout(function () { lbImg.src = ""; }, 350);
    }

    $$(".window-item").forEach(function (item) {
      const img = item.querySelector("img");
      if (!img) return;
      item.addEventListener("click", function () {
        openLB(img.src, img.alt);
      });
    });

    $$(".cg-slide").forEach(function (slide) {
      const img = slide.querySelector("img");
      if (!img) return;
      slide.addEventListener("click", function () {
        if (cgDragMoved) return;
        openLB(img.src, img.alt);
      });
    });

    lbClose.addEventListener("click", closeLB);
    lbBackdrop.addEventListener("click", closeLB);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLB();
    });
  }

  /* ── Init ────────────────────────────────────────────── */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initLightbox();
    });
  } else {
    initLightbox();
  }

})();
