---
target: app/(landing)/page.tsx
total_score: 20
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 3
target_identity: "file:D:\\projects\\cuarzo\\app\\(landing)\\page.tsx"
target_fingerprint: "sha256:6fcbadf9051fc39e53a763fe67b8fc2b17c700825b519285ab45fdb4220cfbd2"
target_path: "D:\\projects\\cuarzo\\app\\(landing)\\page.tsx"
timestamp: 2026-11-01T05-27-48Z
slug: app-landing-page-tsx
closed: true
---
Method: dual-agent (A: revisión de diseño · B: detector y navegador)

# Crítica de la landing de Cuarzo

## Puntaje de diseño

| # | Heurística | Puntos | Problema clave |
|---|---|---|---|
| 1 | Estado del sistema | 2 | El menú no marca la sección activa |
| 2 | Lenguaje del usuario | 2 | El voseo funciona, pero "deploy", "Backend", "ATS" y "Code review" son jerga |
| 3 | Control y libertad | 3 | Navegación sin trampas, aunque Esc no cierra el selector de idioma |
| 4 | Consistencia | 3 | Sistema coherente, pero ↗ lleva a un ancla interna y hay cuatro textos para escribir |
| 5 | Prevención de errores | 2 | El ejemplo "Juan García" puede parecer un dato ya cargado |
| 6 | Reconocer antes que recordar | 3 | Secciones claras, pero WhatsApp es un número sin ícono ni verbo |
| 7 | Flexibilidad | n/a | Recorrido único de persuasión, sin usuarios recurrentes |
| 8 | Estética y minimalismo | 3 | Muy sólida; "Del relevamiento al deploy" se repite tres veces |
| 9 | Recuperación de errores | 2 | Solo burbujas nativas; en móvil la barra tapa el campo con error |
| 10 | Ayuda | n/a | La ayuda es el propio contacto |
| | **Total** | **20/32** | **Aceptable (63%)** |

## Veredicto de especificidad

Revisión de diseño: mitad propia, mitad intercambiable. Propios: cristal, historia del cuarzo y demos de servicios. Intercambiables: el título "Software a medida para tu negocio" y la estructura. El sistema visual está bien ejecutado; `git push production` y `cron 06:00` le hablan a otro desarrollador, no a quien tiene una PYME.

Detector en el código: 25 avisos en app/(landing), 0 en app/components (15 color, 5 tamaño de letra, 5 radio). Falsos positivos: #818cf8, #00f0ff, #cbd5e1 y blancos de botones, documentados en el texto de DESIGN.md. Diferencias reales: rgba(19,24,34,.7) contra .65 documentado, blancos .07 y .06. #64748b no parece documentado (búsqueda no exhaustiva). Tamaños y radios de cv.css fuera de escala.

Detector en la página: 4 avisos en /: punto pulsante (componente documentado; vale si no indica nada real), marquesina (se detiene con movimiento reducido), dos líneas con palabra suelta.

Superposición: solo con CSP desactivada, navegador sin ventana; nada visible para el usuario. 1 aviso sin identificar, no conciliado con los 4 del escaneo.

Medido sin problemas: sin desborde a 390 ni 1440; sin errores de consola o HTTP; contraste aprobado, sin contemplar gradientes ni texto sobre el cristal.

## Impresión general

Transmite precisión, pero está mejor resuelta para impresionar a un colega que para que el dueño de una PYME piense "me entienden". Mayor oportunidad: poner WhatsApp a la vista.

## Qué funciona

- Hero a 1440: jerarquía inmediata, un solo botón blanco dominante, composición asimétrica resuelta.
- Demos de servicios: muestran en vez de prometer, sin inventar pruebas.
- Honestidad: dos personas con nombre, un trabajo real (projaska.com), sin cifras fabricadas, voseo natural.

## Problemas prioritarios

Ningún P0.

- [P1] WhatsApp está enterrado. Un solo enlace en la landing (Contact.tsx:23), 19 px de alto, a unas 8,5 pantallas en móvil, sin mensaje precargado. Arreglo: reemplazar "Ver servicios" en el hero por "Escribinos por WhatsApp"; en Contacto, botón con ícono y texto precargado. Comando: /impeccable layout
- [P1] Sin botón de contacto fijo por debajo de 1280 px. Navbar.tsx:48 oculta "Hablemos" hasta xl, y las secciones centrales no tienen otro. Arreglo: "Hablemos" compacto junto a la hamburguesa en todos los anchos. Comando: /impeccable adapt
- [P1] La jerga técnica contradice un principio del producto. Log del hero, "al deploy", "Spring Boot", "ATS-friendly". Arreglo: "De la primera charla a tu sistema funcionando"; estados "Pago recibido / Envío generado / Stock actualizado". Requiere aprobación del dueño: el brief dice "Texto real sin cambios". Comando: /impeccable clarify
- [P2] Formulario frágil. A 390 la barra tapa "Nombre" y la burbuja cae sobre el logo; campos de 40 px; texto de 15 px suele provocar zoom en iOS (no probado); por código la validación usa el idioma del navegador y el error no ofrece enlaces. Arreglo: scroll-padding-top, errores en línea traducidos con aria-invalid, campos de 44 px con texto de 16 px, enlaces en la falla. Comando: /impeccable harden
- [P2] Etiquetas que prometen otra cosa. "Otros trabajos" suena a portfolio, ↗ sugiere detalle y lleva a formulario vacío, "Hecho para Argentina" queda bajo "Deploy" sin relación. Arreglo: "Trabajos puntuales", → y servicio precargado, romper la alineación. Comando: /impeccable clarify

## Carga cognitiva y recorrido

Carga cognitiva: 4 de 8 ítems fallan, carga alta: 5 servicios sin agrupar; Contacto mezcla email, WhatsApp, ubicación y formulario; 6 opciones en encabezado, 7 en menú móvil, 8 en pie; el formulario no recuerda el servicio elegido.

Recorrido emocional: pico en el hero; valles en la marquesina y en el tramo central sin botón propio. "El nombre no es casualidad" habla de Cuarzo y su cierre pesa más que el título de Contacto. "24 horas hábiles, sin compromisos" aparece recién al final. Mensaje de éxito no probado; por código no ofrece siguiente paso.

## Señales de alerta por persona

- Jordan: no sabe qué es "deploy", si su proyecto alcanza para escribir, ni qué poner en "Mensaje".
- Riley: Esc no cierra el idioma, el título no se traduce, los errores aparecen de a uno.
- Casey: sin botón a mano durante 8 pantallas; WhatsApp mide 19 px.
- Dueño/a de distribuidora con stock en planillas: no ve qué le van a pedir; el formulario exige email sin pedir teléfono; "CV Profesional" le suena a otro público.

## Observaciones menores

- Cuatro textos para la misma acción: "Hablemos", "Contanos tu proyecto", "Consultá sin compromiso", "Enviar mensaje".
- Enlaces del pie de 19 px y botones de idioma de 34 px.
- aria-label en inglés ("Toggle menu", "Change language").
- Con la página en portugués, el title sigue en español.
- Las etiquetas de las demos entran en el nombre accesible de las tarjetas de servicio.
- Asteriscos sin leyenda de obligatorio.
- A 768, el log del hero queda cortado por el borde de la pantalla.

## Preguntas para pensar

- Si WhatsApp es el canal real de una PYME argentina, ¿por qué el botón grande lleva a un formulario?
- ¿La página busca que un dueño sienta "me entienden" o que un colega piense "qué buen nivel"?
- ¿"El nombre no es casualidad" gana consultas, o alcanza con su frase final como llamado a Contacto?

No verificado: envío real, éxito y falla del formulario; iOS y Android reales; lector de pantalla; el cristal con GPU real y su arrastre; el enlace de WhatsApp abierto.
