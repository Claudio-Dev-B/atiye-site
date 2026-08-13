/* ═══════════════════════════════════════════════════════
   ATIYE — Scroll-depth tracking (25/50/75/90%) — all pages
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var fired = {};
  window.dataLayer = window.dataLayer || [];

  function checkDepth() {
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    if (docH <= 0) return;
    var pct = Math.round((window.scrollY / docH) * 100);
    [25, 50, 75, 90].forEach(function (threshold) {
      if (pct >= threshold && !fired[threshold]) {
        fired[threshold] = true;
        window.dataLayer.push({ event: 'scroll_depth', scroll_percent: threshold });
      }
    });
  }

  var depthTicking = false;
  window.addEventListener('scroll', function () {
    if (!depthTicking) {
      depthTicking = true;
      requestAnimationFrame(function () {
        checkDepth();
        depthTicking = false;
      });
    }
  }, { passive: true });
})();

/* ═══════════════════════════════════════════════════════
   ATIYE — Contact form (Web3Forms) — shared across pages
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var form = document.getElementById('contatoForm');
  if (!form) return;

  var status = document.getElementById('formStatus');
  var submitBtn = form.querySelector('.contato-submit');

  function tr(key, fallback) {
    return (window.atiyeT && window.atiyeT.t && window.atiyeT.t(key) !== key)
      ? window.atiyeT.t(key) : fallback;
  }

  function pushDL(payload) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  }

  /* ── Phone mask (BR) — pure JS ───────────────────────── */
  var phoneInput = form.querySelector('#cf-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      var digits = phoneInput.value.replace(/\D/g, '').slice(0, 11);
      var out = digits;
      if (digits.length > 10) {
        out = digits.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
      } else if (digits.length > 6) {
        out = digits.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
      } else if (digits.length > 2) {
        out = digits.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
      } else if (digits.length > 0) {
        out = digits.replace(/^(\d{0,2}).*/, '($1');
      }
      phoneInput.value = out;
    });
  }

  /* ── Field-level error UI ────────────────────────────── */
  function fieldWrap(el) {
    return el ? el.closest('.form-field') : null;
  }

  function showError(el, message) {
    var wrap = fieldWrap(el);
    if (!wrap) return;
    wrap.classList.add('has-error');
    var errEl = wrap.querySelector('.form-field-error');
    if (errEl && message) errEl.textContent = message;
    var fieldName = el && el.name ? el.name : (el && el.id) || 'unknown';
    pushDL({ event: 'form_error', field_name: fieldName });
  }

  function clearError(el) {
    var wrap = fieldWrap(el);
    if (wrap) wrap.classList.remove('has-error');
  }

  /* ── form_start (first interaction) + form_field_focus ─ */
  var startFired = false;
  form.querySelectorAll('input, textarea, select').forEach(function (el) {
    if (el.type === 'hidden' || el.type === 'checkbox') return;
    el.addEventListener('focus', function () {
      if (!startFired) {
        startFired = true;
        pushDL({ event: 'form_start' });
      }
      pushDL({ event: 'form_field_focus', field_name: el.name || el.id });
    });
    el.addEventListener('blur', function () {
      validateField(el, false);
    });
  });

  /* Validate a single field; returns true if valid */
  function validateField(el, focusOnError) {
    if (!el) return true;

    if (el.id === 'cf-name') {
      var ok = el.value.trim() !== '';
      if (ok) clearError(el);
      else {
        showError(el, tr('form-name-required', 'Informe seu nome.'));
        if (focusOnError) el.focus();
      }
      return ok;
    }

    if (el.id === 'cf-phone') {
      var digits = el.value.replace(/\D/g, '');
      if (digits.length === 0) {
        showError(el, tr('form-phone-required', 'Informe seu telefone.'));
        if (focusOnError) el.focus();
        return false;
      }
      if (digits.length < 10) {
        showError(el, tr('form-phone-invalid', 'Telefone incompleto. Confira o DDD e o número.'));
        if (focusOnError) el.focus();
        return false;
      }
      clearError(el);
      return true;
    }

    if (el.id === 'cf-email') {
      if (el.value.trim() === '') { clearError(el); return true; }
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
      if (!valid) {
        showError(el, tr('form-email-invalid', 'E-mail inválido. Confira e tente novamente.'));
        if (focusOnError) el.focus();
        return false;
      }
      clearError(el);
      return true;
    }

    return true;
  }

  function validate() {
    var nameInput = form.querySelector('#cf-name');
    var phoneEl = form.querySelector('#cf-phone');
    var emailEl = form.querySelector('#cf-email');

    var nameOk = validateField(nameInput, false);
    var phoneOk = phoneEl ? validateField(phoneEl, false) : true;
    var emailOk = emailEl ? validateField(emailEl, false) : true;

    if (!nameOk) { if (nameInput) nameInput.focus(); return { ok: false }; }
    if (!phoneOk) { if (phoneEl) phoneEl.focus(); return { ok: false }; }
    if (!emailOk) { if (emailEl) emailEl.focus(); return { ok: false }; }
    return { ok: true };
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var result = validate();
    if (!result.ok) {
      status.className = 'form-status error';
      status.textContent = tr('form-error-check', 'Confira os campos destacados.');
      return;
    }

    status.className = 'form-status is-loading';
    status.textContent = tr('form-sending', 'Enviando...');
    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        if (json.success) {
          status.className = 'form-status success';
          status.textContent = tr('form-success', 'Mensagem enviada! Retornaremos em breve.');
          form.reset();
          startFired = false;

          var isCorporate = /corporativo\.html/.test(window.location.pathname);
          pushDL({
            event: 'generate_lead',
            form_location: isCorporate ? 'corporativo' : 'outra',
            lead_type: isCorporate ? 'corporate' : 'residential'
          });
          pushDL({
            event: 'form_submit_success',
            form_location: isCorporate ? 'corporativo' : 'outra'
          });
        } else {
          status.className = 'form-status error';
          status.textContent = tr('form-error', 'Algo deu errado. Tente novamente ou fale pelo WhatsApp.');
          pushDL({ event: 'form_error', field_name: 'submit' });
        }
      })
      .catch(function () {
        status.className = 'form-status error';
        status.textContent = tr('form-error', 'Algo deu errado. Tente novamente ou fale pelo WhatsApp.');
        pushDL({ event: 'form_error', field_name: 'submit' });
      })
      .then(function () {
        submitBtn.disabled = false;
        submitBtn.classList.remove('is-loading');
      });
  });
})();
