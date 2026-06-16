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

  form.addEventListener('submit', function (e) {
    e.preventDefault();
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
