// Comportamiento del sitio: fichas de trazabilidad, tema e idioma. Sin dependencias.
(function () {
  'use strict';
  var root = document.documentElement;

  // Tema: claro / oscuro / sistema. La preferencia es solo una comodidad local.
  var temaBtn = document.querySelector('[data-tema]');
  function leer(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function guardar(k, v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function oscuroEfectivo() {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function pintarTema() {
    if (!temaBtn) return;
    var oscuro = oscuroEfectivo();
    temaBtn.setAttribute('aria-pressed', String(oscuro));
    temaBtn.setAttribute('aria-label', temaBtn.dataset[oscuro ? 'etiquetaClaro' : 'etiquetaOscuro']);
  }
  if (temaBtn) {
    temaBtn.addEventListener('click', function () {
      var nuevo = oscuroEfectivo() ? 'light' : 'dark';
      root.setAttribute('data-theme', nuevo);
      guardar('tema', nuevo);
      pintarTema();
    });
    pintarTema();
  }

  // Idioma: recordar la elección explícita del visitante.
  document.querySelectorAll('[data-idioma]').forEach(function (a) {
    a.addEventListener('click', function () { guardar('idioma', a.dataset.idioma); });
  });

  // Cifras trazables: puntero fino abre al pasar; teclado y toque abren al pulsar; Escape cierra.
  var fino = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var cifras = Array.prototype.slice.call(document.querySelectorAll('.cifra'));
  function poner(c, abierta) {
    c.dataset.abierta = String(abierta);
    c.querySelector('.cifra__btn').setAttribute('aria-expanded', String(abierta));
    if (abierta) {
      // Si la ficha no cabe a la derecha, se ancla al borde derecho de la cifra.
      c.classList.remove('cifra--derecha');
      var f = c.querySelector('.ficha-traza').getBoundingClientRect();
      if (f.right > document.documentElement.clientWidth - 8) c.classList.add('cifra--derecha');
    }
  }
  function cerrarOtras(excepto) { cifras.forEach(function (c) { if (c !== excepto && c.dataset.abierta === 'true') poner(c, false); }); }
  cifras.forEach(function (c) {
    var btn = c.querySelector('.cifra__btn');
    var t;
    btn.addEventListener('click', function () {
      var abrir = c.dataset.abierta !== 'true';
      cerrarOtras(c);
      poner(c, abrir);
    });
    if (fino) {
      c.addEventListener('mouseenter', function () { t = setTimeout(function () { cerrarOtras(c); poner(c, true); }, 120); });
      c.addEventListener('mouseleave', function () { clearTimeout(t); poner(c, false); });
    }
    c.addEventListener('focusout', function (e) { if (!c.contains(e.relatedTarget)) poner(c, false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var abierta = document.querySelector('.cifra[data-abierta="true"]');
    if (abierta) { poner(abierta, false); abierta.querySelector('.cifra__btn').focus(); }
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.cifra')) cerrarOtras(null); });
})();
