# Plan de Reestructuración de la Landing Page (CRO & UX/UI)

Este documento detalla el plan de acción paso a paso para implementar el rediseño de la landing page (`app/page.tsx`), estructurado para mejorar la jerarquía visual, la retención de usuarios y maximizar la conversión hacia la herramienta de generación de equipos.

## Fase 1: Optimización del Hero Section (Above the Fold)
**Objetivo:** Captar la atención en los primeros 3 segundos y comunicar claramente la propuesta de valor sin fricción.

1.  **Refactorizar el Encabezado (Header):**
    *   Cambiar el título (H1) para que sea orientado al beneficio (ej. "Tu Siguiente Equipo Ganador, Generado por IA").
    *   Actualizar el subtítulo para explicar brevemente cómo funciona (mención a Smogon/VGC y formato de exportación).
2.  **Mejorar el Call to Action (CTA) Principal:**
    *   Reemplazar el botón "Start Generating" sobredimensionado por un botón de tamaño adecuado (ej. `size="lg"` estandarizado).
    *   Cambiar el texto a una acción específica: "Generar mi Primer Equipo".
    *   Añadir texto de apoyo debajo del CTA (ej. "Es gratis. No requiere registro.").
3.  **Añadir Elemento Visual Clave (Mockup):**
    *   Incorporar una previsualización atractiva (ej. una tarjeta con sprites de Pokémon) a la derecha del texto o justo debajo, mostrando el "resultado final" que el usuario obtendrá.
4.  **Reubicar Anuncios:**
    *   Mover el componente `<AdResponsive />` que actualmente está debajo del header. Debe bajarse para no interrumpir el flujo visual de la propuesta de valor inicial.

## Fase 2: Construcción de Confianza y Reducción de Fricción
**Objetivo:** Demostrar autoridad y explicar el proceso para que el usuario se sienta seguro de continuar.

1.  **Nueva Sección: "Formatos Soportados" (Social Proof visual):**
    *   Reubicar la sección de formatos (Gen 9 OU, VGC, etc.) para que aparezca justo después del Hero.
    *   Mejorar el diseño visual usando insignias (badges) o logotipos sutiles en escala de grises.
2.  **Nueva Sección: "Cómo Funciona" (Proceso de 3 pasos):**
    *   Crear un componente con 3 columnas/tarjetas.
    *   Paso 1: Elige tu Formato.
    *   Paso 2: Define tu Estrategia.
    *   Paso 3: Exporta y Juega.
    *   Incluir iconos representativos y descripciones cortas para cada paso.

## Fase 3: Persuasión y Demostración de Valor
**Objetivo:** Resaltar los beneficios (no solo características) y mostrar ejemplos reales.

1.  **Optimizar la Sección "Características" (Features):**
    *   Cambiar el enfoque del *copy* hacia los beneficios del usuario.
    *   Actualizar títulos: "Análisis del Meta en Tiempo Real", "Sinergia Perfecta Garantizada", etc.
    *   Mejorar el diseño de las tarjetas para una lectura más fluida.
2.  **Transformar "Trending Teams" en una Demostración Visual:**
    *   Sustituir los botones de texto simples ("Bulky Offense", "Rain") por "Team Cards" en miniatura.
    *   Cada tarjeta debe mostrar visualmente los iconos/sprites de los 6 Pokémon del equipo.
    *   Hacer que el clic en la tarjeta lleve directamente a la previsualización del equipo, actuando como un atajo a la recompensa.

## Fase 4: Retención y Recursos Secundarios
**Objetivo:** Proveer valor a los usuarios que aún no están listos para generar un equipo.

1.  **Reubicar la Sección "Explora" (Explore):**
    *   Mover las tarjetas de "Strategy Guides", "Tier List" y "About" hacia la parte inferior de la página (antes del footer).
    *   Reducir ligeramente su peso visual (colores más neutros) para que no compitan con el CTA principal.
2.  **Optimizar CTA Final (Bottom CTA):**
    *   Añadir un último llamado a la acción persuasivo justo antes del footer para capturar a los usuarios que hicieron scroll hasta el final.

## Fase 5: Refinamiento de UI e Implementación Técnica
**Objetivo:** Asegurar una experiencia de usuario pulida y consistente.

1.  **Revisión de Accesibilidad y Contraste:**
    *   Verificar el contraste de textos sobre fondos oscuros/claros, especialmente en las tarjetas.
2.  **Estandarización de Componentes:**
    *   Unificar los estilos de botones (Primario para generación, Secundario/Outline para navegación).
3.  **Ajuste de Espaciados (Whitespace):**
    *   Aumentar el `padding-y` entre las nuevas secciones para mejorar la "respiración" del diseño y reducir la carga cognitiva.
4.  **Despliegue y Pruebas A/B (Sugerido):**
    *   Lanzar los cambios y monitorizar métricas clave (Click-through rate del CTA principal, Bounce rate, Tiempo en la página) para validar la efectividad del rediseño.
