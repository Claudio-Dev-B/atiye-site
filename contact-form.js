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

  function setFieldError(fieldEl, errorEl, show) {
    var wrap = fieldEl ? fieldEl.closest('.form-field') : null;
    if (wrap) wrap.classList.toggle('has-error', !!show);
  }

  /* Nome obrigatório; telefone OU e-mail (pelo menos um dos dois) */
  function validate() {
    var nameInput = form.querySelector('#cf-name');
    var phoneInput = form.querySelector('#cf-phone');
    var emailInput = form.querySelector('#cf-email');

    var nameOk = !nameInput || nameInput.value.trim() !== '';
    setFieldError(nameInput, null, !nameOk);

    var contactOk = true;
    if (phoneInput || emailInput) {
      contactOk = (phoneInput && phoneInput.value.trim() !== '') ||
                  (emailInput && emailInput.value.trim() !== '');
      setFieldError(emailInput, null, !contactOk);
    }

    if (!nameOk) {
      if (nameInput) nameInput.focus();
      return { ok: false, reason: 'name' };
    }
    if (!contactOk) {
      if (phoneInput) phoneInput.focus();
      return { ok: false, reason: 'contact' };
    }
    return { ok: true };
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var result = validate();
    if (!result.ok) {
      status.className = 'form-status error';
      status.textContent = result.reason === 'name'
        ? tr('form-name-required', 'Informe seu nome.')
        : tr('form-contact-required', 'Informe pelo menos telefone ou e-mail.');
      return;
    }

    status.className = 'form-status';
    status.textContent = tr('form-sending', 'Enviando...');
    submitBtn.disabled = true;

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

          var isCorporate = /corporativo\.html/.test(window.location.pathname);
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: 'generate_lead',
            form_location: isCorporate ? 'corporativo' : 'outra',
            lead_type: isCorporate ? 'corporate' : 'residential'
          });
        } else {
          status.className = 'form-status error';
          status.textContent = tr('form-error', 'Algo deu errado. Tente novamente ou fale pelo WhatsApp.');
        }
      })
      .catch(function () {
        status.className = 'form-status error';
        status.textContent = tr('form-error', 'Algo deu errado. Tente novamente ou fale pelo WhatsApp.');
      })
      .then(function () { submitBtn.disabled = false; });
  });
})();
