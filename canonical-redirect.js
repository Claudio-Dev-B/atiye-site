/* ═══════════════════════════════════════════════════════
   ATIYE — Canonical URL redirect (client-side)
   GitHub Pages (ver. CNAME) não suporta .htaccess / _redirects /
   vercel.json para redirects reais no servidor.
   Consolida apenas /index.html → / (caso seguro e comprovado:
   ambas são requisições HTTP distintas, sem risco de loop).
   As demais variantes de URL (com/sem .html) são resolvidas
   via <link rel="canonical"> em cada página — não redirecionamos
   client-side rotas sem extensão porque alguns hosts servem esse
   conteúdo via rewrite interno (mesma URL na barra de endereço),
   o que causaria um loop de redirecionamento.
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var path = window.location.pathname;
  if (/\/index\.html$/.test(path)) {
    var target = path.replace(/index\.html$/, '');
    window.location.replace(target + window.location.search + window.location.hash);
  }
})();
