# Plan de Optimización de PageViews (PV)

## Objetivo
**Incrementar de 1.5 PV a 4-6 PV por usuario** mediante la separación del flujo en múltiples vistas lógicas dentro de la aplicación SPA.

---

## Estado Actual

### Estructura Actual
- **SPA con 1 página principal**: `app/page.tsx`
- **Navbar con 2 tabs**: `home` y `analysis` (controlados por estado)
- **Flujo actual**: Todo en una sola pantalla
  - Landing (título + subtítulo)
  - Formulario de configuración
  - Resultado del equipo (6 cards)
  - Gameplan (estrategia early/mid/late)
  - Análisis (en tab separado pero mismo componente)

### PV Actual Estimado
- **Sin equipo generado**: ~1-2 PV (solo landing)
- **Con equipo generado**: ~2-3 PV (landing → resultado → análisis)
- **Promedio actual**: ~1.5 PV/usuario

---

## Plan de Implementación

### Fase 1: Separar el Flujo en Rutas (Vistas Lógicas)

#### 1.1 Nueva Estructura de Rutas

| Ruta | Componente | Descripción | PV Estimado |
|------|------------|-------------|-------------|
| `/` | `Landing` | Landing page con descripción y CTA | 1 |
| `/configurar` | `TeamConfig` | Formulario de configuración | 1 |
| `/equipo` | `TeamResult` | Mostrar equipo generado (6 cards) | 1 |
| `/analisis` | `TeamAnalysis` | Análisis detallado del equipo | 1 |
| `/exportar` | `ExportPage` | Opciones de exportación y compartir | 1 |

**Total potencial: 5 PV por sesión completa**

#### 1.2 Implementación Técnica

Crear nuevo layout con navegación programática:

```typescript
// app/page.tsx - Redirigir a /
// app/configurar/page.tsx - Formulario
// app/equipo/page.tsx - Resultado
// app/analisis/page.tsx - Análisis
// app/exportar/page.tsx - Exportación
```

### Fase 2: Añadir Secciones Extra en la Misma Página

#### 2.1 En la Página de Resultado (`/equipo`)

**Sección "Explicación del Equipo"**
- Descripción de la sinergia del equipo
- Roles de cada Pokémon (sweeper, wall, pivot, etc.)
- Estrategia general

**Sección "Meta Actual del Formato"**
- Información sobre el meta actual del formato seleccionado
- Pokémon más usados/viables
- Tier list relevante

**Sección "Equipos Similares"**
- Botón para generar otro equipo con la misma "core"
- Enlaces a equipos predefinidos relacionados

#### 2.2 Implementación

```typescript
// components/TeamExplanation.tsx
// components/MetaInfo.tsx
// components/SimilarTeams.tsx
```

### Fase 3: Añadir Acciones de Navegación

#### 3.1 En la Página de Resultado

| Botón | Acción | Destino |
|-------|--------|---------|
| "Ver análisis detallado" | Navegar a | `/analisis` |
| "Editar opciones" | Navegar a | `/configurar` |
| "Exportar equipo" | Navegar a | `/exportar` |

#### 3.2 En la Página de Análisis

| Botón | Acción | Destino |
|-------|--------|---------|
| "Volver al equipo" | Navegar a | `/equipo` |
| "Generar otro equipo" | Navegar a | `/configurar` |
| "Exportar equipo" | Navegar a | `/exportar` |

#### 3.3 En la Página de Configuración

| Botón | Acción | Destino |
|-------|--------|---------|
| "Ver último equipo" (si existe) | Navegar a | `/equipo` |

### Fase 4: Optimización de Anuncios por Vista

#### 4.1 Distribución de Anuncios por Ruta

| Ruta | Anuncios | Posiciones |
|------|----------|------------|
| `/` | 2 | Header, Before CTA |
| `/configurar` | 2 | Before form, After form |
| `/equipo` | 3 | Before team, After team, Before similar teams |
| `/analisis` | 2 | Header, After analysis |
| `/exportar` | 2 | Before export options, After copy button |

**Total: 11 anuncios por sesión completa (vs 6 actuales)**

### Fase 5: Tracking de Eventos

#### 5.1 PageView Events
- Rastrear cada cambio de ruta como pageview
- Usar Google Analytics o similar para medir

#### 5.2 Eventos Personalizados
- `view_landing`
- `start_config`
- `generate_team`
- `view_team`
- `view_analysis`
- `export_team`
- `click_similar_teams`
- `regenerate_team`

---

## Implementación por Prioridad

### Prioridad Alta (Mayores Impacto en PV)

1. **Crear rutas separadas**
   - [ ] Modificar `app/page.tsx` para redirigir a `/configurar`
   - [ ] Crear componentes para cada vista
   - [ ] Implementar navegación programática

2. **Añadir secciones extra en resultado**
   - [ ] Componente TeamExplanation
   - [ ] Componente MetaInfo
   - [ ] Componente SimilarTeams

3. **Botones de navegación**
   - [ ] Añadir CTAs en cada vista pointing a la siguiente

### Prioridad Media

4. **Optimizar análisis**
   - [ ] Mejorar el componente TeamAnalysis existente
   - [ ] Añadir más información de sinergias

5. **Página de exportación**
   - [ ] Crear página dedicada con más opciones

### Prioridad Baja

6. **Tracking y analytics**
   - [ ] Implementar tracking de eventos
   - [ ] Medir resultados

---

## Estimación de PV Post-Implementación

### Flujo Típico del Usuario

```
1. Landing (/) → 1 PV
2. Click "Empezar" → Configurar (/configurar) → 1 PV
3. Llenar formulario → click "Generar" → Equipo (/equipo) → 1 PV
4. Scroll hasta ver análisis → Sección "Explicación" → 1 PV (scroll)
5. Click "Ver análisis" → Análisis (/analisis) → 1 PV
6. Click "Exportar" → Exportar (/exportar) → 1 PV
7. Click "Generar otro" → Configurar (/configurar) → 1 PV
```

**Total: 6-7 PV por sesión activa**

### Comparativa

| Métrica | Antes | Después |
|---------|-------|---------|
| PV por usuario | 1.5 | 4-6 |
| Anuncios por sesión | 5-6 | 10-12 |
| Tiempo en sitio | Bajo | Alto |
| Engagement | Bajo | Alto |

---

## Archivos a Modificar

### Nuevos Archivos
- `app/configurar/page.tsx`
- `app/equipo/page.tsx`
- `app/analisis/page.tsx`
- `app/exportar/page.tsx`
- `components/TeamExplanation.tsx`
- `components/MetaInfo.tsx`
- `components/SimilarTeams.tsx`

### Archivos a Modificar
- `app/page.tsx` (redirección)
- `components/Navbar.tsx` (actualizar navegación)
- `components/TeamForm.tsx` (redireccionar tras generar)
- `components/TeamAnalysis.tsx` (añadir CTAs)

---

## Notas Adicionales

1. **Mantener SPA**: Usar Next.js App Router con client-side navigation para transiciones suaves
2. **Preservar estado**: Usar React Context o URL params para mantener el equipo entre rutas
3. **SEO friendly**: Las rutas separadas también mejoran el SEO
4. **Analytics**: Configurar correctamente el tracking de pageviews en GA4
