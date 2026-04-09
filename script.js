/* ═══════════════════════════════════════════════════════
   ATIYE — Main Script
   ═══════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── Helpers ─────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ── Preloader ───────────────────────────────────────── */
  const preloader = $("#preloader");

  function hidePreloader() {
    if (!preloader) return;
    preloader.classList.add("done");
    document.body.classList.add("loaded");
    initHeroVideo();
    initHeroAnimation();
  }

  window.addEventListener("load", function () {
    setTimeout(hidePreloader, 2000);
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
      }, item.delay + 200);
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

  if (menuToggle && nav) {
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
