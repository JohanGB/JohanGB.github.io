// Genera el sitio estático a partir de datos/sitio.json y datos/proyectos.json.
// Uso: node herramientas/construir.mjs   (sin dependencias; Node 18+)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const leer = f => JSON.parse(fs.readFileSync(path.join(RAIZ, f), 'utf8'));
const S = leer('datos/sitio.json');
const P = leer('datos/proyectos.json').proyectos;
const IDIOMAS = ['es', 'en'];
const HOY = new Date().toISOString().slice(0, 10);

// ---------- utilidades ----------
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const t = (x, l) => (x && typeof x === 'object' && !Array.isArray(x) ? x[l] : x);
// "pruebas" admite un número o un texto por idioma ({"es": "más de 400", "en": "400+"}).
// "ci": false en un proyecto cambia la etiqueta de pruebas (sin CI no se puede decir "en CI").
const etqPruebas = (p, l) => (p.ci === false ? L[l].pruebasLocal : L[l].pruebas);
const escribir = (rel, html) => {
  const f = path.join(RAIZ, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, html);
};
const ruta = (l, slug) => (l === 'es' ? (slug ? `/proyectos/${slug}.html` : '/') : (slug ? `/en/projects/${slug}.html` : '/en/'));
const archivo = (l, slug) => (l === 'es' ? (slug ? `proyectos/${slug}.html` : 'index.html') : (slug ? `en/projects/${slug}.html` : 'en/index.html'));

const L = {
  es: {
    saltar: 'Saltar al contenido', nav: 'Navegación principal', proyectos: 'Proyectos', metodo: 'Cómo trabajo', investigacion: 'Investigación',
    experiencia: 'Experiencia', contacto: 'Contacto', idioma: 'Idioma', temaOscuro: 'Cambiar a tema oscuro', temaClaro: 'Cambiar a tema claro',
    cv: 'Descargar CV', cvOtro: 'CV en inglés', escribir: 'Escribirme', pista: 'Las cifras subrayadas con puntos muestran su fuente y su método al pasar el cursor, al enfocarlas o al tocarlas.',
    fuente: 'Fuente', metodoK: 'Método', verRepo: 'Ver en el repositorio →', pruebas: 'pruebas en CI', pruebasLocal: 'pruebas locales', codigo: 'Código', demo: 'Página publicada',
    comoSeHizo: 'Cómo se hizo →', proyectosNota: 'Cada tarjeta muestra la pregunta que resuelve, su cifra principal y cómo se comprobó.',
    metodoNota: 'Los mismos cuatro pasos en cada proyecto, para que cualquiera pueda repetir el resultado.', ejemplo: 'Dónde se ve',
    investigacionNota: 'Antes de los datos de negocio, la física: simulación, estadística y contraste con datos experimentales.',
    verCodigo: 'Ver el código de la tesis →', experienciaNota: 'Trayectoria breve; el detalle completo está en el CV.',
    certificaciones: 'Certificaciones', herramientas: 'Herramientas', personal: 'Fuera del trabajo',
    contactoTitulo: 'Hablemos de datos que se puedan auditar.', contactoNota: 'Abierto a roles actuariales y de datos en seguros y banca, en Bogotá o remoto.',
    inicio: 'Inicio', problema: 'Problema', datos: 'Datos', metodoC: 'Método', validacion: 'Validación', limitaciones: 'Limitaciones',
    usoIA: 'Uso de IA documentado en este proyecto →', otros: 'Otros proyectos', volver: '← Todos los proyectos', resultado: 'Resultado principal',
    comprobado: 'Cómo se comprobó', demoNota: '', locale: 'es_CO', noEncontrada: 'Página no encontrada', noEncontradaTexto: 'La dirección no existe o cambió.',
    linkedin: 'LinkedIn', github: 'GitHub', correo: 'Correo'
  },
  en: {
    saltar: 'Skip to content', nav: 'Main navigation', proyectos: 'Projects', metodo: 'How I work', investigacion: 'Research',
    experiencia: 'Experience', contacto: 'Contact', idioma: 'Language', temaOscuro: 'Switch to dark theme', temaClaro: 'Switch to light theme',
    cv: 'Download CV', cvOtro: 'CV in Spanish', escribir: 'Email me', pista: 'Numbers with a dotted underline show their source and method on hover, focus or tap.',
    fuente: 'Source', metodoK: 'Method', verRepo: 'See it in the repository →', pruebas: 'tests passing in CI', pruebasLocal: 'tests passing locally', codigo: 'Code', demo: 'Published page (Spanish)',
    comoSeHizo: 'How it was built →', proyectosNota: 'Each card shows the question it answers, its main number and how it was checked.',
    metodoNota: 'The same four steps in every project, so anyone can reproduce the result.', ejemplo: 'Where to see it',
    investigacionNota: 'Before business data, physics: simulation, statistics and comparison against experimental data.',
    verCodigo: 'See the thesis code →', experienciaNota: 'A short track record; the full detail is in the CV.',
    certificaciones: 'Certifications', herramientas: 'Tools', personal: 'Outside work',
    contactoTitulo: "Let's talk about data that can be audited.", contactoNota: 'Open to actuarial and data roles in insurance and banking, in Bogotá or remote.',
    inicio: 'Home', problema: 'Problem', datos: 'Data', metodoC: 'Method', validacion: 'Validation', limitaciones: 'Limitations',
    usoIA: 'AI usage documented in this project →', otros: 'Other projects', volver: '← All projects', resultado: 'Main result',
    comprobado: 'How it was checked', locale: 'en_US', noEncontrada: 'Page not found', noEncontradaTexto: 'This address does not exist or has moved.',
    linkedin: 'LinkedIn', github: 'GitHub', correo: 'Email'
  }
};

const ICONO = {
  bajar: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M8 2v8m0 0L4.5 6.5M8 10l3.5-3.5M3 13.5h10" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  correo: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="2" y="3.5" width="12" height="9" rx="1.5"/><path d="M2.5 4.5 8 9l5.5-4.5" stroke-linejoin="round"/></svg>',
  luna: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M16.5 12.2A7 7 0 0 1 7.8 3.5a7 7 0 1 0 8.7 8.7Z" stroke-linejoin="round"/></svg>'
};

// Trazas tipo cámara de burbujas: espirales y rectas que salen de un vértice. Decorativo.
function trazas() {
  const cx = 470, cy = 250, partes = [];
  const espiral = (a0, r0, giro, vueltas, k) => {
    let d = '', a = a0, r = r0, x = cx, y = cy;
    const pasos = Math.round(vueltas * 90);
    for (let i = 0; i <= pasos; i++) {
      const px = x + Math.cos(a) * 3, py = y + Math.sin(a) * 3;
      d += (i ? 'L' : 'M') + px.toFixed(1) + ' ' + py.toFixed(1);
      x = px; y = py; a += giro / (r * k); r *= 0.996;
    }
    return d;
  };
  const curvas = [
    [0.3, 60, 1, 3.2, 0.9], [2.4, 80, -1, 2.6, 0.75], [4.1, 45, 1, 3.8, 1.1], [5.3, 120, -1, 1.6, 0.6],
    [1.2, 160, 1, 1.1, 0.5], [3.3, 200, -1, 0.9, 0.45]
  ];
  curvas.forEach((c, i) => partes.push(`<path d="${espiral(...c)}" fill="none" stroke="currentColor" stroke-width="${i === 0 ? 1.6 : 1}"${i === 0 ? ' class="acento"' : ''}/>`));
  [[-2.6, 520], [2.75, 430], [-0.4, 560], [1.9, 380]].forEach(([a, l]) => partes.push(`<path d="M${cx} ${cy}L${(cx + Math.cos(a) * l).toFixed(1)} ${(cy + Math.sin(a) * l).toFixed(1)}" stroke="currentColor" stroke-width="1" stroke-dasharray="2 5"/>`));
  partes.push(`<circle cx="${cx}" cy="${cy}" r="4" fill="currentColor" class="acento"/>`);
  return `<svg class="portada__trazas" viewBox="0 0 620 520" preserveAspectRatio="xMaxYMin slice" aria-hidden="true" focusable="false">${partes.join('')}</svg>`;
}

// ---------- componentes ----------
let idCifra = 0;
function cifra(m, l, enlace, extraClase = '') {
  const id = `traza-${++idCifra}`;
  const unidad = t(m.unidad, l);
  const valorTxt = `${t(m.valor, l)} ${unidad}`;
  return `<span class="cifra${extraClase}"><button class="cifra__btn" type="button" aria-expanded="false" aria-controls="${id}" aria-label="${esc(valorTxt)}: ${esc(L[l].fuente).toLowerCase()} ${l === 'es' ? 'y' : 'and'} ${esc(L[l].metodoK).toLowerCase()}">${esc(t(m.valor, l))}<small>${esc(unidad)}</small></button>`
    + `<span class="ficha-traza" id="${id}" role="group" aria-label="${esc(valorTxt)}"><dl><dt>${L[l].fuente}</dt><dd>${esc(t(m.fuente, l))}</dd><dt>${L[l].metodoK}</dt><dd>${esc(t(m.metodo, l))}</dd></dl>`
    + (enlace ? `<a href="${esc(enlace)}">${L[l].verRepo}</a>` : '') + `</span></span>`;
}

function cabeza(l, { titulo, descripcion, slug, tipo = 'website', imagen }) {
  const url = S.url + ruta(l, slug);
  const og = imagen || `${S.url}/assets/img/og-${l}.png`;
  const alt = IDIOMAS.map(x => `<link rel="alternate" hreflang="${x}" href="${S.url + ruta(x, slug)}">`).join('\n') + `\n<link rel="alternate" hreflang="x-default" href="${S.url + ruta('es', slug)}">`;
  const persona = !slug ? `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Person', name: S.nombre, url: S.url + ruta(l), email: `mailto:${S.contacto.correo}`,
    jobTitle: l === 'es' ? 'Físico y analista de datos' : 'Physicist and data analyst',
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'Universidad de los Andes' },
    address: { '@type': 'PostalAddress', addressLocality: 'Bogotá', addressCountry: 'CO' },
    sameAs: [S.contacto.github, S.contacto.linkedin]
  })}</script>` : '';
  return `<!DOCTYPE html>
<html lang="${l}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descripcion)}">
<meta name="author" content="${esc(S.nombre)}">
<link rel="canonical" href="${url}">
${alt}
<meta property="og:type" content="${tipo}">
<meta property="og:site_name" content="${esc(S.nombreCorto)}">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descripcion)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(titulo)}">
<meta property="og:locale" content="${L[l].locale}">
<meta property="og:locale:alternate" content="${L[l === 'es' ? 'en' : 'es'].locale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(titulo)}">
<meta name="twitter:description" content="${esc(descripcion)}">
<meta name="twitter:image" content="${og}">
<meta name="theme-color" content="#F6F7F5" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0E1218" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/ibmplexsans.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/newsreader-500.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/fuentes.css">
<link rel="stylesheet" href="/assets/css/sitio.css">
<script>try{var t=localStorage.getItem('tema');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>
${persona}
</head>
<body>
<a class="saltar" href="#contenido">${L[l].saltar}</a>`;
}

function barra(l, slug, anclasAbsolutas = false) {
  const base = ruta(l);
  const ancla = a => (slug || anclasAbsolutas ? `${base}#${a}` : `#${a}`);
  return `<header class="barra">
  <div class="contenedor barra__in">
    <a class="barra__marca" href="${base}">${esc(S.nombreCorto)}</a>
    <nav class="barra__nav" aria-label="${L[l].nav}">
      <a href="${ancla('proyectos')}">${L[l].proyectos}</a><a href="${ancla('metodo')}">${L[l].metodo}</a><a href="${ancla('investigacion')}">${L[l].investigacion}</a><a href="${ancla('experiencia')}">${L[l].experiencia}</a><a href="${ancla('contacto')}">${L[l].contacto}</a>
    </nav>
    <div class="controles">
      <div class="seg" role="group" aria-label="${L[l].idioma}">${IDIOMAS.map(x => `<a href="${ruta(x, slug)}" hreflang="${x}" lang="${x}" data-idioma="${x}"${x === l ? ' aria-current="true"' : ''}>${x.toUpperCase()}</a>`).join('')}</div>
      <button class="icono-btn" type="button" data-tema data-etiqueta-oscuro="${L[l].temaOscuro}" data-etiqueta-claro="${L[l].temaClaro}" aria-label="${L[l].temaOscuro}" aria-pressed="false">${ICONO.luna}</button>
    </div>
  </div>
</header>`;
}

function pie(l) {
  return `<footer class="pie">
  <div class="contenedor">
    <p>${esc(S.ia[l])}</p>
    <p>© ${new Date().getFullYear()} ${esc(S.nombre)} · <a href="${S.contacto.github}/JohanGB.github.io">${l === 'es' ? 'Código de este sitio' : 'Source of this site'}</a></p>
  </div>
</footer>
<script src="/assets/js/sitio.js" defer></script>
</body>
</html>
`;
}

function tarjeta(p, l) {
  const det = ruta(l, p.slug);
  return `<article class="tarjeta" id="${p.slug}">
  <div>
    <p class="etiqueta">${esc(t(p.tipo, l))} · <span class="num">${esc(t(p.pruebas, l))}</span> ${etqPruebas(p, l)}</p>
    <h3><a href="${det}">${esc(t(p.nombre, l))}</a></h3>
    <p class="tarjeta__pregunta">${esc(t(p.pregunta, l))}</p>
    <ol class="flujo" aria-label="${l === 'es' ? 'Flujo de datos' : 'Data flow'}">${p.flujo[l].map(x => `<li><span>${esc(x)}</span></li>`).join('')}</ol>
    <ul class="pila" aria-label="${l === 'es' ? 'Tecnologías' : 'Stack'}">${p.pila.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    <div class="enlaces"><a href="${det}">${L[l].comoSeHizo}</a>${p.enlaces?.codigo ? `<a href="${p.enlaces.codigo}">${L[l].codigo}</a>` : ''}${p.enlaces?.demo ?`<a href="${p.enlaces.demo}">${L[l].demo}</a>` : ''}</div>
  </div>
  <div class="tarjeta__lado">
    <div>
      <div class="tarjeta__grande num">${cifra(p.metrica, l, p.enlaces?.codigo)}</div>
      <p class="tarjeta__grande-etiqueta">${esc(t(p.metrica.etiqueta, l))}</p>
    </div>
    <ul class="chequeos">${p.comprobaciones.map(c => `<li><span><strong>${esc(t(c.resultado, l))}</strong>${esc(t(c.como, l))}</span></li>`).join('')}</ul>
    <p class="tarjeta__pie"><span><b class="num">${esc(t(p.pruebas, l))}</b> ${etqPruebas(p, l)}</span><span>${esc(t(p.nota, l))}</span></p>
  </div>
</article>`;
}

// ---------- páginas ----------
function inicio(l) {
  idCifra = 0;
  const destacadas = P.filter(p => p.metrica.destacada).slice(0, 3);
  const [p1, p2] = S.promesa[l];
  const otro = l === 'es' ? 'en' : 'es';
  let h = cabeza(l, { titulo: S.titulo[l], descripcion: S.descripcion[l] }) + barra(l);
  h += `
<main id="contenido">
  <section class="portada" aria-labelledby="nombre">
    ${trazas()}
    <div class="contenedor">
      <h1 class="portada__nombre" id="nombre">${esc(S.nombre)}</h1>
      <p class="portada__promesa">${esc(p1)} <em>${esc(p2)}</em></p>
      <p class="portada__rol">${esc(S.rol[l])}</p>
      <p class="portada__cuerpo">${esc(S.cuerpo[l])}</p>
      <div class="portada__cta">
        <a class="btn btn--primario" href="${S.contacto.cv[l]}" download>${ICONO.bajar}${L[l].cv}</a>
        <a class="btn" href="mailto:${S.contacto.correo}">${ICONO.correo}${L[l].escribir}</a>
        <a class="btn" href="${S.contacto.linkedin}">${L[l].linkedin}</a>
      </div>
      <div class="metricas">
${destacadas.map((p, i) => `        <div class="metrica">
          <div class="metrica__valor num">${cifra(p.metrica, l, p.enlaces?.codigo, i ===destacadas.length - 1 ? ' cifra--final' : '')}</div>
          <p class="metrica__etiqueta">${esc(t(p.metrica.etiqueta, l))}</p>
          <p class="metrica__proyecto"><a href="${ruta(l, p.slug)}">${esc(t(p.nombre, l))}</a></p>
        </div>`).join('\n')}
      </div>
      <p class="pista">${L[l].pista}</p>
    </div>
  </section>

  <section class="seccion" id="proyectos" aria-labelledby="t-proyectos">
    <div class="contenedor">
      <div class="seccion__cabeza"><h2 class="seccion__titulo" id="t-proyectos">${L[l].proyectos}</h2><p class="seccion__nota">${L[l].proyectosNota}</p></div>
      <div class="proyectos">
${P.map(p => tarjeta(p, l)).join('\n')}
      </div>
    </div>
  </section>

  <section class="seccion" id="metodo" aria-labelledby="t-metodo">
    <div class="contenedor">
      <div class="seccion__cabeza"><h2 class="seccion__titulo" id="t-metodo">${L[l].metodo}</h2><p class="seccion__nota">${L[l].metodoNota}</p></div>
      <ol class="pasos">
${S.metodo.map(m => `        <li class="paso"><h3>${esc(m.titulo[l])}</h3><p>${esc(m.texto[l])}</p><small>${L[l].ejemplo}: ${esc(m.ejemplo[l])}</small></li>`).join('\n')}
      </ol>
    </div>
  </section>

  <section class="seccion" id="investigacion" aria-labelledby="t-inv">
    <div class="contenedor">
      <div class="seccion__cabeza"><h2 class="seccion__titulo" id="t-inv">${L[l].investigacion}</h2><p class="seccion__nota">${L[l].investigacionNota}</p></div>
      <div class="investigacion">
${S.investigacion.map(r => `        <article class="estudio${r.imagen ? ' estudio--imagen' : ''}">
          <div>
            <h3>${esc(r.titulo[l])}</h3>
            <p class="estudio__lugar">${esc(r.lugar[l])}</p>
            <ul class="lista">${r.puntos[l].map(x => `<li>${esc(x)}</li>`).join('')}</ul>
            ${r.enlace ? `<p class="enlaces" style="margin-top:16px"><a href="${r.enlace}">${L[l].verCodigo}</a></p>` : ''}
          </div>
          ${r.imagen ? `<figure class="figura"><img src="${r.imagen.src}" width="${r.imagen.ancho}" height="${r.imagen.alto}" alt="${esc(r.imagen.alt[l])}" loading="lazy" decoding="async"><figcaption>${esc(r.imagen.pie[l])}</figcaption></figure>` : ''}
        </article>`).join('\n')}
      </div>
    </div>
  </section>

  <section class="seccion" id="experiencia" aria-labelledby="t-exp">
    <div class="contenedor">
      <div class="seccion__cabeza"><h2 class="seccion__titulo" id="t-exp">${L[l].experiencia}</h2><p class="seccion__nota">${L[l].experienciaNota}</p></div>
      <ol class="trayectoria">
${S.experiencia.map(e => `        <li class="cargo"><div class="cargo__fechas num">${esc(e.fechas[l])}</div><div><h3>${esc(e.cargo[l])}</h3><p class="cargo__lugar">${esc(e.lugar)}</p><ul class="lista">${e.puntos[l].map(x => `<li>${esc(x)}</li>`).join('')}</ul></div></li>`).join('\n')}
      </ol>
      <div class="extra">
        <p><strong>${L[l].herramientas}:</strong> ${esc(l === 'es' ? S.herramientas : S.herramientasEn)}</p>
        <p><strong>${L[l].certificaciones}:</strong> ${esc(S.certificaciones[l])}</p>
      </div>
    </div>
  </section>

  <section class="seccion" id="contacto" aria-labelledby="t-contacto">
    <div class="contenedor contacto">
      <div>
        <h2 class="seccion__titulo" id="t-contacto">${L[l].contactoTitulo}</h2>
        <p class="seccion__nota" style="margin-top:12px">${L[l].contactoNota}</p>
        <div class="portada__cta" style="margin:24px 0 0">
          <a class="btn btn--primario" href="${S.contacto.cv[l]}" download>${ICONO.bajar}${L[l].cv}</a>
          <a class="btn" href="${S.contacto.cv[otro]}" download hreflang="${otro}">${L[l].cvOtro}</a>
        </div>
      </div>
      <div>
        <ul class="contacto__lista">
          <li><a href="mailto:${S.contacto.correo}">${S.contacto.correo}</a></li>
          <li><a href="${S.contacto.linkedin}">linkedin.com/in/johanegb</a></li>
          <li><a href="${S.contacto.github}">github.com/JohanGB</a></li>
        </ul>
        <dl class="ficha-datos" style="margin-top:24px">
${S.ficha.map(f => `          <dt>${esc(f.k[l])}</dt><dd>${esc(f.v[l])}</dd>`).join('\n')}
          <dt>${L[l].personal}</dt><dd>${esc(S.personal[l])}</dd>
        </dl>
      </div>
    </div>
  </section>
</main>
`;
  return h + pie(l);
}

function detalle(p, l) {
  idCifra = 0;
  const nombre = t(p.nombre, l);
  const d = p.detalle;
  const caps = [['problema', L[l].problema], ['datos', L[l].datos], ['metodo', L[l].metodoC], ['validacion', L[l].validacion], ['limitaciones', L[l].limitaciones]];
  const cuerpo = arr => (arr.length === 1 ? `<p>${esc(arr[0])}</p>` : `<ul>${arr.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`);
  let h = cabeza(l, { titulo: `${nombre} · ${S.nombreCorto}`, descripcion: t(p.pregunta, l), slug: p.slug, tipo: 'article' }) + barra(l, p.slug);
  h += `
<main id="contenido">
  <div class="contenedor">
    <nav class="migas" aria-label="${l === 'es' ? 'Ruta' : 'Breadcrumb'}"><a href="${ruta(l)}">${L[l].inicio}</a> / <a href="${ruta(l)}#proyectos">${L[l].proyectos}</a> / <span aria-current="page">${esc(nombre)}</span></nav>
    <header class="detalle__cabeza">
      <p class="etiqueta">${esc(t(p.tipo, l))} · <span class="num">${esc(t(p.pruebas, l))}</span> ${etqPruebas(p, l)}</p>
      <h1 class="detalle__titulo">${esc(nombre)}</h1>
      <p class="detalle__pregunta">${esc(t(p.pregunta, l))}</p>
      ${p.enlaces?.codigo ? `<div class="portada__cta" style="margin-bottom:48px">
        <a class="btn btn--primario" href="${p.enlaces.codigo}">${L[l].codigo}</a>
        ${p.enlaces.demo ? `<a class="btn" href="${p.enlaces.demo}">${L[l].demo}</a>` : ''}
      </div>` : `<p class="seccion__nota" style="margin-bottom:48px">${esc(t(p.nota, l))}</p>`}
      <div class="detalle__resumen">
        <div>
          <p class="etiqueta">${L[l].resultado}</p>
          <div class="tarjeta__grande num">${cifra(p.metrica, l, p.enlaces?.codigo)}</div>
          <p class="tarjeta__grande-etiqueta">${esc(t(p.metrica.etiqueta, l))}</p>
        </div>
        <div>
          <p class="etiqueta">${L[l].comprobado}</p>
          <ul class="chequeos">${p.comprobaciones.map(c => `<li><span><strong>${esc(t(c.resultado, l))}</strong>${esc(t(c.como, l))}</span></li>`).join('')}</ul>
        </div>
      </div>
      ${p.imagen ? `<figure class="figura detalle__figura${p.imagen.vertical ? ' detalle__figura--vertical' : ''}"><img src="${p.imagen.src}" width="${p.imagen.ancho}" height="${p.imagen.alto}" alt="${esc(p.imagen.alt[l])}" decoding="async"><figcaption>${esc(p.imagen.pie[l])}</figcaption></figure>` : ''}
    </header>
    <div class="capitulos">
${caps.map(([k, titulo], i) => `      <section class="capitulo${k === 'limitaciones' ? ' capitulo--limites' : ''}" aria-labelledby="c-${k}"><h2 id="c-${k}"><span>${String(i + 1).padStart(2, '0')}</span>${titulo}</h2><div class="capitulo__texto">${cuerpo(d[k][l])}</div></section>`).join('\n')}
    </div>
    ${p.uso_de_ia ? `<p class="enlaces" style="margin:32px 0 0"><a href="${p.uso_de_ia}">${L[l].usoIA}</a></p>` : ''}
    <section class="seccion" style="margin-top:72px" aria-labelledby="t-otros">
      <h2 class="etiqueta" id="t-otros">${L[l].otros}</h2>
      <ul class="otros">
${P.filter(x => x.slug !== p.slug).map(x => `        <li><a href="${ruta(l, x.slug)}"><b>${esc(t(x.nombre, l))}</b><span>${esc(t(x.pregunta, l))}</span></a></li>`).join('\n')}
      </ul>
      <p class="enlaces" style="margin-top:24px"><a href="${ruta(l)}#proyectos">${L[l].volver}</a></p>
    </section>
  </div>
</main>
`;
  return h + pie(l);
}

function noEncontrada() {
  return cabeza('es', { titulo: `${L.es.noEncontrada} · ${S.nombreCorto}`, descripcion: S.descripcion.es }).replace('<meta name="viewport"', '<meta name="robots" content="noindex">\n<meta name="viewport"') + barra('es', null, true) + `
<main id="contenido">
  <div class="contenedor" style="padding:112px 16px">
    <p class="etiqueta">404</p>
    <h1 class="detalle__titulo">${L.es.noEncontrada}</h1>
    <p class="detalle__pregunta">${L.es.noEncontradaTexto} <span lang="en">${L.en.noEncontradaTexto}</span></p>
    <div class="portada__cta"><a class="btn btn--primario" href="/">Ir al inicio</a><a class="btn" href="/en/" lang="en">Go to the English site</a></div>
  </div>
</main>
` + pie('es');
}

// ---------- validación de datos ----------
const errores = [];
const destacadas = P.filter(p => p.metrica.destacada);
if (destacadas.length > 3) errores.push(`Hay ${destacadas.length} cifras destacadas; el máximo es 3.`);
for (const p of P) {
  for (const l of IDIOMAS) {
    if (!t(p.metrica.fuente, l) || !t(p.metrica.metodo, l)) errores.push(`${p.slug}: la cifra principal necesita fuente y método (${l}).`);
    for (const k of ['problema', 'datos', 'metodo', 'validacion', 'limitaciones']) if (!p.detalle?.[k]?.[l]?.length) errores.push(`${p.slug}: falta detalle.${k}.${l}`);
  }
  if (p.imagen && !fs.existsSync(path.join(RAIZ, p.imagen.src))) errores.push(`${p.slug}: no existe ${p.imagen.src}`);
  if (!p.enlaces?.codigo && !IDIOMAS.every(l => t(p.nota, l))) errores.push(`${p.slug}: sin enlaces.codigo, la nota (es y en) es obligatoria: explica por qué no hay código.`);
}
if (new Set(P.map(p => p.slug)).size !== P.length) errores.push('Hay slugs repetidos.');
if (errores.length) { console.error('Errores en los datos:\n- ' + errores.join('\n- ')); process.exit(1); }

// ---------- escritura ----------
// Se generan todas las páginas en memoria y se revisan antes de escribir nada.
const paginas = [['404.html', noEncontrada()]];
for (const l of IDIOMAS) {
  paginas.push([archivo(l), inicio(l)]);
  for (const p of P) paginas.push([archivo(l, p.slug), detalle(p, l)]);
}
const rotas = paginas.filter(([, html]) => /undefined|="null"/.test(html)).map(([f]) => f);
if (rotas.length) { console.error('Valores sin definir en: ' + rotas.join(', ')); process.exit(1); }
for (const [f, html] of paginas) escribir(f, html);

const urls = [null, ...P.map(p => p.slug)].flatMap(slug => IDIOMAS.map(l => `  <url>
    <loc>${S.url + ruta(l, slug)}</loc>
    <lastmod>${HOY}</lastmod>
${IDIOMAS.map(x => `    <xhtml:link rel="alternate" hreflang="${x}" href="${S.url + ruta(x, slug)}"/>`).join('\n')}
  </url>`));
escribir('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`);
escribir('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${S.url}/sitemap.xml\n`);
console.log(`Listo: ${IDIOMAS.length * (1 + P.length) + 1} páginas, sitemap.xml y robots.txt.`);
