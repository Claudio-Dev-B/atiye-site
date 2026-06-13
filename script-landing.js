/* ═══════════════════════════════════════════════════════
   ATIYE — Landing Script
   Shared across all landing pages
   ═══════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── Helpers ─────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ── Page-Light Beam ─────────────────────────────────── */
  const pageLight = document.createElement("div");
  pageLight.className = "page-light";
  document.body.appendChild(pageLight);

  /* ── RAF-Throttled Scroll ────────────────────────────── */
  const header = $("#header");
  let lastScrollY = 0;
  let scrollTicking = false;

  function onScrollFrame() {
    const sy = lastScrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docH > 0 ? sy / docH : 0;

    /* Header */
    if (header) {
      header.classList.toggle("scrolled", sy > 60);
    }

    /* Page light drifts based on scroll progress */
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
      { sel: ".hero-label",       delay: 0   },
      { sel: ".hero-title",       delay: 120 },
      { sel: ".hero-subtitle",    delay: 260 },
      { sel: ".hero-problems",    delay: 360 },
      { sel: ".hero-description", delay: 420 },
      { sel: ".hero-cta",         delay: 530 },
    ];

    items.forEach(function ({ sel, delay }) {
      const el = $(sel);
      if (!el) return;
      el.style.cssText =
        "opacity:0;transform:translateY(22px);" +
        "transition:opacity .75s " + ease + ",transform .75s " + ease;
      setTimeout(function () {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, delay + 80);
    });

    /* Ken Burns zoom on hero image */
    const hero = $(".landing-hero");
    if (hero) setTimeout(function () { hero.classList.add("loaded"); }, 50);
  }

  /* ── Section Entry Light (IO) ────────────────────────── */
  if ("IntersectionObserver" in window) {
    const sectionIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in-view");
          sectionIO.unobserve(e.target);
        }
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
      ".reveal, .section-header, .problem-content, .split-content, " +
      ".cards-grid, .value-grid, .price-cards, .problems-grid, " +
      ".solution-steps, .cta-content, .economy-content, " +
      ".authority-content, .testimonial-grid, .gallery-landing, " +
      ".landing-stats-grid"
    ).forEach(function (el) { revealIO.observe(el); });
  }

  /* ── Mobile Menu ─────────────────────────────────────── */
  const nav = $("#nav");
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
  const galleryTabs = $$(".gallery-tab");
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

  /* ── FAQ Accordion ───────────────────────────────────── */
  $$(".faq-question").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const item = this.closest(".faq-item");
      const isOpen = item.classList.contains("open");
      $$(".faq-item.open").forEach(function (i) { i.classList.remove("open"); });
      if (!isOpen) item.classList.add("open");
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
          behavior: "smooth"
        });
      }
    });
  });

  /* ── Magnetic Buttons ────────────────────────────────── */
  if (window.matchMedia("(hover: hover)").matches) {
    $$(".cta-button").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        const r = this.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width  / 2);
        const dy = e.clientY - (r.top  + r.height / 2);
        this.style.transform = "translate(" + (dx * 0.16) + "px, " + (dy * 0.16) + "px)";
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

  /* ── Cinematic Gallery (Landing) ───────────────────── */
  var cgDragMoved = false;
  (function initCinematicGallery() {
    var cgStage = $("#cg-stage");
    if (!cgStage) return;

    var cgActiveReel = "main";
    var cgReelData   = {};
    var cgIsDragging = false;
    var cgDragStartX = 0;
    var cgDragStartT = 0;

    $$(".cg-reel", cgStage).forEach(function (reel) {
      var id     = reel.id.replace("cg-reel-", "");
      var track  = reel.querySelector(".cg-track");
      var slides = $$(".cg-slide", reel);
      cgReelData[id] = { reel: reel, track: track, slides: slides, current: 0, translate: 0 };
      slides.forEach(function (s, i) { s.classList.toggle("active", i === 0); });
    });

    function fmt(n) { return String(n + 1).padStart(2, "0"); }

    function slideW(state) {
      var s = state.slides[0];
      return s ? s.offsetWidth + 6 : 0;
    }

    function cgUpdateUI(state) {
      state.slides.forEach(function (s, i) {
        s.classList.toggle("active", i === state.current);
      });
      var cur  = $(".cg-cur");
      var tot  = $(".cg-tot");
      var fill = $("#cg-progress-fill");
      if (cur)  cur.textContent  = fmt(state.current);
      if (tot)  tot.textContent  = fmt(state.slides.length - 1);
      if (fill) fill.style.width = ((state.current + 1) / state.slides.length * 100) + "%";
    }

    function cgMoveTo(idx) {
      var state = cgReelData[cgActiveReel];
      if (!state) return;
      state.current   = Math.max(0, Math.min(idx, state.slides.length - 1));
      var sw          = slideW(state);
      state.translate = -state.current * sw;
      state.track.style.transition = "transform 0.75s cubic-bezier(0.16,1,0.3,1)";
      state.track.style.transform  = "translateX(" + state.translate + "px)";
      cgUpdateUI(state);
    }

    var cgPrev = $(".cg-prev");
    var cgNext = $(".cg-next");
    if (cgPrev) cgPrev.addEventListener("click", function () { cgMoveTo(cgReelData[cgActiveReel].current - 1); });
    if (cgNext) cgNext.addEventListener("click", function () { cgMoveTo(cgReelData[cgActiveReel].current + 1); });

    cgStage.addEventListener("mousedown", function (e) {
      if (e.target.closest(".cg-prev, .cg-next")) return;
      cgIsDragging = true;
      cgDragMoved  = false;
      cgDragStartX = e.clientX;
      cgDragStartT = (cgReelData[cgActiveReel] || {}).translate || 0;
      var st = cgReelData[cgActiveReel];
      if (st) st.track.style.transition = "none";
    });

    cgStage.addEventListener("touchstart", function (e) {
      if (e.target.closest(".cg-prev, .cg-next")) return;
      cgIsDragging = true;
      cgDragMoved  = false;
      cgDragStartX = e.touches[0].clientX;
      cgDragStartT = (cgReelData[cgActiveReel] || {}).translate || 0;
      var st = cgReelData[cgActiveReel];
      if (st) st.track.style.transition = "none";
    }, { passive: true });

    window.addEventListener("mousemove", function (e) {
      if (!cgIsDragging) return;
      var diff = e.clientX - cgDragStartX;
      if (Math.abs(diff) > 5) cgDragMoved = true;
      var st = cgReelData[cgActiveReel];
      if (!st) return;
      st.translate = cgDragStartT + diff;
      st.track.style.transform = "translateX(" + st.translate + "px)";
    });

    window.addEventListener("touchmove", function (e) {
      if (!cgIsDragging) return;
      var diff = e.touches[0].clientX - cgDragStartX;
      if (Math.abs(diff) > 5) cgDragMoved = true;
      var st = cgReelData[cgActiveReel];
      if (!st) return;
      st.translate = cgDragStartT + diff;
      st.track.style.transform = "translateX(" + st.translate + "px)";
    }, { passive: false });

    function onUp() {
      if (!cgIsDragging) return;
      cgIsDragging = false;
      var st = cgReelData[cgActiveReel];
      if (!st) return;
      var sw = slideW(st);
      if (sw > 0) cgMoveTo(Math.round(-st.translate / sw));
    }

    window.addEventListener("mouseup",  onUp);
    window.addEventListener("touchend", onUp);

    document.addEventListener("keydown", function (e) {
      var gal = $("#projetos");
      if (!gal) return;
      var r = gal.getBoundingClientRect();
      if (r.top > window.innerHeight || r.bottom < 0) return;
      if (e.key === "ArrowLeft")  cgMoveTo(cgReelData[cgActiveReel].current - 1);
      if (e.key === "ArrowRight") cgMoveTo(cgReelData[cgActiveReel].current + 1);
    });

    var cgWheelAccum = 0;
    var cgWheelTimer = null;
    cgStage.addEventListener("wheel", function (e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      cgWheelAccum += e.deltaX;
      if (cgWheelTimer) clearTimeout(cgWheelTimer);
      cgWheelTimer = setTimeout(function () { cgWheelAccum = 0; }, 300);
      if (Math.abs(cgWheelAccum) > 60) {
        var dir = cgWheelAccum > 0 ? 1 : -1;
        cgWheelAccum = 0;
        cgMoveTo(cgReelData[cgActiveReel].current + dir);
      }
    }, { passive: false });

    Object.keys(cgReelData).forEach(function (id) { cgUpdateUI(cgReelData[id]); });
  })();

  /* ── Init ────────────────────────────────────────────── */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initLightbox();
      initHeroAnimation();
    });
  } else {
    initLightbox();
    initHeroAnimation();
  }

  window.addEventListener("load", function () {
    document.body.classList.add("loaded");
  });

})();
