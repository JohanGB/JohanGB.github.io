# JohanGB.github.io

Portafolio de Johan Esteban García Bautista, publicado con GitHub Pages en <https://johangb.github.io>.
Sitio estático bilingüe (español en `/`, inglés en `/en/`), sin frameworks ni dependencias.

*Portfolio of Johan Esteban García Bautista. Static, bilingual (Spanish at `/`, English at `/en/`), no framework.*

## Cómo está hecho

| Carpeta | Contenido |
|---|---|
| `datos/proyectos.json` | Un objeto por proyecto: pregunta, cifra principal con fuente y método, comprobaciones, pila y detalle (problema → datos → método → validación → limitaciones) |
| `datos/sitio.json` | Perfil, método de trabajo, investigación, experiencia y contacto |
| `herramientas/construir.mjs` | Genera las páginas HTML, `404.html`, `sitemap.xml` y `robots.txt` a partir de los JSON |
| `assets/` | CSS, JS (fichas de trazabilidad, tema e idioma), fuentes autoalojadas e imágenes |
| `cv/` | CV en español e inglés |
| `demo/` | Página publicada de NowMarket (generada por ese proyecto) |

Las páginas generadas (`index.html`, `en/`, `proyectos/`) se versionan para que GitHub Pages las sirva tal cual.

## Agregar un proyecto

1. Copia un objeto de `datos/proyectos.json` y cambia los textos en `es` y `en`.
2. La cifra principal necesita `fuente` y `metodo`; si no los tienes, no la publiques.
   Marca `"destacada": true` solo si debe aparecer en la portada (máximo 3).
3. Si tiene imagen, ponla en `assets/img/` en WebP e indica `ancho` y `alto`.
4. Ejecuta `node herramientas/construir.mjs`. El script se detiene si falta algún dato obligatorio.

## Probar en local

```powershell
node herramientas/construir.mjs
npx serve .        # o cualquier servidor estático; las rutas empiezan por /
```

## Créditos

Tipografías [Newsreader](https://github.com/productiontype/Newsreader) e [IBM Plex Sans](https://github.com/IBM/plex),
ambas con licencia SIL Open Font License 1.1 (textos en `assets/fonts/`). Newsreader está instanciada y
recortada a latín para este sitio; IBM Plex Sans se usa sin modificar porque "Plex" es un nombre reservado.
