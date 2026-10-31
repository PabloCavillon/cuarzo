---
name: Cuarzo Landing
description: Neofuturismo sobrio para la landing pública de Cuarzo; no aplica al panel de administración.
colors:
  blue: "#2450e6"
  field-line: "#8390ac"
  blue-deep: "#1a3bb3"
  blue-pale: "#dbe4ff"
  orbit: "#8fb2ff"
  night: "#071033"
  night-raised: "#121d4a"
  night-line: "#27335f"
  night-ink-2: "#c6d0ec"
  ground: "#f4f6fb"
  surface: "#ffffff"
  ink: "#0a1330"
  ink-2: "#434e6b"
  placeholder: "#5b6684"
  line: "#d5dbea"
typography:
  display:
    fontFamily: "Jost, Hanken Grotesk, sans-serif"
    fontSize: "clamp(2.5rem, 5.6vw, 5rem)"
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Jost, Hanken Grotesk, sans-serif"
    fontSize: "clamp(2.25rem, 4.2vw, 3.5rem)"
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Jost, Hanken Grotesk, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  lead:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.4
  body:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
  body-small:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
rounded:
  field: "0.875rem"
  menu: "1rem"
  panel: "2rem"
  block: "2.5rem"
  block-lg: "5rem"
  pill: "999px"
spacing:
  gutter: "1.5rem"
  gutter-lg: "2.5rem"
  row: "1.75rem"
  section: "5rem"
  section-lg: "8rem"
  container: "80rem"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1.75rem"
    height: "3.25rem"
  button-primary-hover:
    backgroundColor: "{colors.blue-deep}"
  button-on-night:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.night}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1.75rem"
    height: "3.25rem"
  button-on-night-hover:
    backgroundColor: "{colors.blue-pale}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1.75rem"
    height: "3.25rem"
  button-quiet-hover:
    backgroundColor: "{colors.surface}"
  button-quiet-on-night:
    backgroundColor: "transparent"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1.75rem"
    height: "3.25rem"
  button-quiet-on-night-hover:
    backgroundColor: "{colors.night-raised}"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-small}"
    rounded: "{rounded.field}"
    padding: "0.8rem 1rem"
  nav-floating:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-small}"
    rounded: "{rounded.panel}"
    height: "3.5rem"
  plan-cell:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    padding: "1.75rem"
  plan-cell-featured:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.surface}"
    padding: "1.75rem"
  form-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "2.5rem"
---

# Design System: Cuarzo Landing

## Overview

**Creative North Star: "Una sola pieza en órbita"**

**Alcance:** este sistema gobierna únicamente la landing pública (`apps/web/app/(landing)/`). El panel de administración conserva su aspecto propio, con Inter y la escala navy de `apps/web/app/globals.css`; nada de este archivo se aplica a esa app ni reemplaza sus decisiones. Los tokens viven en la clase `.landing`, no en `:root`, justamente para no filtrarse.

Un cristal de cuarzo en 3D gira sobre azul noche y todo lo demás se aparta: mucho aire, poco color y lectura cómoda antes que efecto. El neofuturismo acá es de geometría (curvas amplias, cápsulas, líneas de un píxel), no de luces. La página alterna bloques noche y claros, y esa alternancia es toda su profundidad.

El mundo nació de rechazar una pared de vidrio difícil de leer: la materia cristalina queda confinada a una sola pieza y las superficies de interfaz son opacas y planas. La densidad es baja, con una idea por sección y listas resueltas en filas separadas por líneas en lugar de tarjetas.

**Key Characteristics:**
- Azul como único color, sobre azul noche y blanco porcelana.
- Títulos en Jost liviana, en mayúsculas y minúsculas; texto en Hanken Grotesk de 18 px.
- Un cristal 3D en el hero y una órbita fina en SVG más adelante como únicos ornamentos.
- Curvas amplias en los bloques, cápsulas en las acciones, líneas de 1 px.
- Superficies opacas y planas, sin sombras.

## Colors

Una sola familia azul en tres alturas: noche para el suelo oscuro, eléctrico para la acción y pálido para los estados sobre fondos saturados.

### Primary
- **Azul Eléctrico** (#2450e6): acción principal sobre superficies claras, enlaces de fila, hover de navegación, selección de texto y fondo del plan destacado.
- **Azul Profundo** (#1a3bb3): solo hover del botón primario.
- **Azul Pálido** (#dbe4ff): hover del botón blanco y texto secundario dentro del plan destacado.
- **Azul Órbita** (#8fb2ff): trazo de la órbita en SVG. Nunca texto de interfaz.

### Neutral
- **Azul Noche** (#071033): fondo de bloques oscuros, del pie y del lienzo 3D, que debe coincidir exactamente con el bloque para que el vidrio refracte la página.
- **Noche Elevada** (#121d4a): hover del botón silencioso sobre noche.
- **Línea Noche** (#27335f): divisores sobre noche.
- **Bruma** (#c6d0ec): texto secundario sobre noche.
- **Blanco Porcelana** (#f4f6fb): fondo claro general.
- **Blanco** (#ffffff): navegación, celdas de planes, panel de formulario y texto principal sobre noche.
- **Tinta** (#0a1330): texto principal sobre claro.
- **Tinta Media** (#434e6b): texto secundario sobre claro.
- **Marcador** (#5b6684): solo placeholders de campos.
- **Línea** (#d5dbea): divisores y bordes sobre claro.

### Named Rules
**La Regla del Único Color.** No existe otro tono fuera de la familia azul, ni siquiera para estados: el error del formulario se comunica en Tinta y peso 600, sin rojo. La refracción propia del cristal queda exenta.

**La Regla de la Acción Invertida.** La acción principal es azul sobre claro y blanca sobre noche o sobre el plan destacado. Una isla clara dentro de noche vuelve a azul.

## Typography

**Display Font:** Jost (con Hanken Grotesk, sans-serif)
**Body Font:** Hanken Grotesk (con system-ui, sans-serif)

**Character:** Jost, geométrica y fina, da la silueta futurista a gran tamaño; Hanken Grotesk, abierta y cálida, sostiene la lectura.

### Hierarchy
- **Display** (300, clamp(2.5rem, 5.6vw, 5rem), 1.1): solo el título del hero. Equilibrado con `text-wrap: balance`.
- **Headline** (300, clamp(2.25rem, 4.2vw, 3.5rem), 1.1): títulos de sección, precios y confirmación del formulario.
- **Title** (400, 1.625rem, 1.2): nombres de módulos, servicios y planes; cierres de sección.
- **Lead** (400, 1.25rem, 1.4): descripción del hero, hasta 46ch.
- **Body** (400, 1.125rem, 1.6): texto corrido, entre 42ch y 56ch.
- **Body Small** (400, 1rem, 1.5): navegación, pie, listas de características y datos auxiliares.
- **Label** (600, 1rem): botones, etiquetas de campo y encabezados del pie.

### Named Rules
**La Regla del Peso Liviano.** A tamaño de título, Jost va a 300 y con escritura normal, nunca en mayúsculas sostenidas. La única palabra en mayúsculas es el logotipo CUARZO, con 0.12em de tracking.

**La Regla de los 18.** El texto de lectura no baja de 18 px; 16 px queda para datos auxiliares y controles.

## Layout

Columna central de hasta 80rem con márgenes de 1.5rem, que pasan a 2.5rem desde 1024 px. Las secciones respiran 5rem verticales, y 8rem desde 1024 px. Las secciones contiguas sobre el mismo fondo anulan su padding superior para no duplicar el aire.

El patrón editorial es asimétrico: título a la izquierda y contenido a la derecha en `2fr 3fr`, con separación de 5rem en escritorio. En una sola columna, el título apila sobre su contenido. El bloque "A medida" fija su título con sticky en escritorio mientras la lista avanza.

El hero ocupa la altura completa desde 1024 px, con texto hasta 56% del ancho y el cristal en el 52% derecho, de modo que cristal y título pueden acercarse. Por debajo, el cristal baja a un bloque de 24rem, o 32rem desde 640 px. Los planes pasan de una a dos columnas en 640 px y a cuatro en 1024 px. La navegación completa aparece recién en 1280 px; por debajo se colapsa en menú.

## Elevation & Depth

El sistema es plano y sin sombras. La profundidad sale de la alternancia tonal entre noche y claro, de las islas blancas sobre noche y del único objeto realmente tridimensional: el cristal. Incluso la navegación flotante se separa solo por color y una línea de 1 px, sin blur.

### Shadow Vocabulary
- **Línea interna** (`box-shadow: inset 0 0 0 1px var(--line)`): borde del botón silencioso. Es un trazo, no una elevación.

### Named Rules
**La Regla de la Interfaz Opaca.** Ninguna superficie de interfaz usa sombra difusa ni `backdrop-filter`. La transparencia y el brillo pertenecen solo al cristal.

## Shapes

Las curvas crecen con la escala del elemento: campos de 0.875rem, menús de 1rem, paneles de 2rem y bloques de página de 2.5rem, o 5rem desde 1024 px. Las acciones son cápsulas completas (999px). El hero curva solo su borde inferior; el contacto, solo el superior, y continúa en el pie noche; el bloque "Por qué Cuarzo" flota con las cuatro esquinas curvas y un margen lateral.

### Named Rules
**La Regla del Píxel.** Todo trazo mide 1 px: divisores, bordes y órbita. Las listas se separan con líneas, no con cajas.

## Components

Todos los estados interactivos cambian solo de color, en 250ms ease-out. Nada se eleva, escala ni desplaza.

### Buttons
- **Shape:** cápsula completa (999px), altura mínima de 3.25rem; 2.5rem dentro de la navegación.
- **Primary:** Azul Eléctrico con texto blanco. Sobre noche y en el plan destacado, blanco con texto Azul Noche.
- **Hover / Focus:** pasa a Azul Profundo, o a Azul Pálido en la variante blanca. El foco es un anillo de 2 px a 3 px de distancia, que debe contrastar con su superficie: azul sobre claro, blanco sobre noche.
- **Silencioso:** transparente con línea interna de 1 px; hover a Blanco, o a Noche Elevada sobre noche.
- **Disabled:** opacidad de 0.6.

### Cards / Containers
- **Panel de planes:** un solo panel de 2rem de radio con overflow oculto, dividido en celdas por 1 px de separación que deja ver Línea. No son tarjetas sueltas. Celdas con 1.75rem de padding.
- **Plan destacado:** celda Azul Eléctrico con texto blanco, botón blanco y etiqueta de texto, sin insignia.
- **Panel de formulario:** isla blanca de 2rem de radio sobre noche; restaura los colores claros. Padding de 1.5rem, o 2.5rem desde 640 px.

### Inputs / Fields
- **Style:** fondo blanco, línea de 1 px en `field-line` (3:1 sobre blanco) y radio de 0.875rem. Etiqueta visible arriba, nunca solo placeholder.
- **Focus:** anillo azul de 2 px sin distancia, que reemplaza al borde.
- **Error:** mensaje en Tinta y peso 600 sobre el botón, con `role="alert"`.
- **Éxito:** ícono, título y descripción ocupan el lugar del formulario.

### Navigation
- **Style:** píldora blanca flotante, fija a 0.75rem de los bordes, con radio de 2rem, altura de 3.5rem y línea de 1 px. Se mantiene blanca sobre todas las secciones.
- **States:** enlaces en Tinta, hover a Azul Eléctrico; el idioma activo se marca con peso 600.
- **Mobile:** por debajo de 1280 px el menú se despliega dentro de la misma píldora, con enlaces, idiomas y dos cápsulas apiladas.

### Filas
- **Style:** título, descripción y dato auxiliar, con 1.75rem de padding vertical y línea superior de 1 px; la última fila también cierra abajo. Reemplazan a las grillas de tarjetas.
- **Hover:** en filas enlazadas, el título pasa a Azul Eléctrico.

### Cristal
Pieza firma del mundo: cuarzo hexagonal biterminado con facetas duras, material de transmisión total (índice de refracción 1.52, rugosidad 0.04) tintado en azul e iluminado con un entorno sintético, sin recursos externos. Va solo, sin anillo alrededor. Gira solo, flota apenas y se arrastra en escritorio, sin zoom ni desplazamiento; en táctil no captura el gesto para no bloquear el scroll. Con `prefers-reduced-motion` queda quieto. Mientras carga muestra el isotipo, sin salto de layout.

### Named Rules
**La Regla de la Pieza Única.** Hay un solo cristal 3D por página, en el hero. Más adelante solo aparece la órbita, como trazo de 1 px, nunca el cristal.

## Do's and Don'ts

### Do:
- **Do** alternar bloques noche y claros para crear ritmo y profundidad.
- **Do** resolver listas con filas y líneas de 1 px, y reservar el panel dividido para comparar planes.
- **Do** mantener una acción principal clara por bloque, siguiendo La Regla de la Acción Invertida.
- **Do** limitar las transiciones al color, en 250ms ease-out.
- **Do** detener todo movimiento del cristal con `prefers-reduced-motion`.
- **Do** dar al lienzo 3D el mismo Azul Noche del bloque que lo contiene.
- **Do** usar íconos de línea en SVG, a 16 px junto al texto.

### Don't:
- **Don't** aplicar este sistema al panel de administración ni llevar sus tokens a `:root`.
- **Don't** usar neón, resplandores, gradientes decorativos ni texturas en la interfaz; los brillos del cristal son su materia y quedan exentos.
- **Don't** usar paneles de vidrio ni `backdrop-filter`: el vidrio de esta landing es solo el cristal.
- **Don't** repetir grillas de tarjetas sueltas.
- **Don't** introducir otro color, ni siquiera rojo o verde para estados.
- **Don't** agregar sombras difusas ni animaciones de elevación.
- **Don't** colocar el cristal 3D más de una vez por página.
- **Don't** escribir títulos en mayúsculas sostenidas ni bajar el texto de lectura de 18 px.
