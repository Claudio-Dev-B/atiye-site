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
