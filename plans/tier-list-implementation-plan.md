# Plan de Implementación: Página de Tier List con Datos Reales de Smogon

## 1. Análisis del Estado Actual del Proyecto

### 1.1 Infraestructura Existente ✅

El proyecto ya cuenta con una sólida base para obtener datos de Smogon:

| Componente | Archivo | Estado |
|------------|--------|--------|
| **Librería de Stats** | [`lib/smogon-stats.ts`](lib/smogon-stats.ts) | ✅ Funcional |
| **API Route** | [`app/api/smogon-stats/route.ts`](app/api/smogon-stats/route.ts) | ✅ Funcional |
| **Datos Locales** | [`data/stats/gen9ou.json`](data/stats/gen9ou.json) | ✅ 400 Pokémon |
| **Guía Gen9 OU** | [`app/guides/gen9-ou/page.tsx`](app/guides/gen9-ou/page.tsx) | ✅ Usa datos reales |
| **Página Meta** | [`app/meta/[format]/page.tsx`](app/meta/[format]/page.tsx) | ✅ Parcial |

### 1.2 Página Tier List Actual ❌

La página actual [`app/tier-list/page.tsx`](app/tier-list/page.tsx) tiene las siguientes limitaciones:

- **Datos hardcoded**: Usa una lista estática de ~18 Pokémon
- **Sin clasificación dinámica**: No calcula tiers basados en uso
- **Formato único**: Solo soporta gen9ou
- **Sin detalles**: No muestra builds, habilidades, objetos
- **UI básica**: Tarjetas simples sin información de tipos

---

## 2. Estructura de Datos Necesaria

### 2.1 Tipos de Datos Existentes (reutilizar)

```typescript
// De lib/smogon-stats.ts
interface SmogonMonData {
    name: string;           // Nombre del Pokémon
    rawCount: number;       // Conteo bruto de batallas
    usage: number;         // Porcentaje de uso
    abilities: Record<string, number>;  // Habilidad -> %
    items: Record<string, number>;     // Objeto -> %
    moves: Record<string, number>;     // Move -> %
    teammates: Record<string, number>; // Compañeros -> %
    checks: Record<string, number>;    // Checks/Counters -> %
    spreads: Record<string, number>;   // EV spreads -> %
}
```

### 2.2 Nuevos Tipos Necesarios

```typescript
// Clasificación de tiers basada en uso
type TierRank = 'S' | 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C' | 'D';

interface TierClassification {
    pokemon: string;
    tier: TierRank;
    usage: number;
    rank: number;  // Posición en el ranking
}

// Configuración de thresholds por formato
interface TierThresholds {
    format: string;
    S: number;    // > 20% uso
    'A+': number; // > 13%
    A: number;    // > 8%
    'A-': number; // > 6%
    'B+': number; // > 4%
    B: number;    // > 3%
    'B-': number; // > 2%
    C: number;    // > 1%
    D: number;    // >= 0.5%
}
```

### 2.3 Datos Locales a Expandir

```
data/stats/
├── gen9ou.json        ✅ Existe (400 Pokémon)
├── gen9vgc.json       ❌ Crear
├── gen9uu.json        ❌ Crear  
├── gen9ubers.json     ❌ Crear
└── gen9monotype.json  ❌ Crear
```

---

## 3. Componentes UI Requeridos

### 3.1 Estructura de Componentes

```
components/tier-list/
├── TierListContainer.tsx    # Contenedor principal
├── FormatSelector.tsx       # Selector de formato
├── TierCard.tsx             # Card individual por tier
├── PokemonRow.tsx           # Fila de Pokémon en un tier
├── PokemonDetail.tsx        # Modal de detalles
├── UsageBar.tsx             # Barra visual de uso
├── SearchFilter.tsx         # Buscador/filtrador
├── TypeBadge.tsx            # Badge de tipo
└── AbilityItemTooltip.tsx   # Tooltip de habilidad/objeto
```

### 3.2 Componentes Existentes a Reutilizar

| Componente | Uso |
|------------|-----|
| [`components/ui/card.tsx`](components/ui/card.tsx) | Contenedores de tiers |
| [`components/ui/button.tsx`](components/ui/button.tsx) | Formato selector |
| [`components/PokemonCard.tsx`](components/PokemonCard.tsx) | Vista de Pokémon |
| [`components/ItemIcon.tsx`](components/ItemIcon.tsx) | Iconos de objetos |

### 3.3 Mockups de UI

```mermaid
┌─────────────────────────────────────────────────────────────┐
│  📊 Tier List - Gen 9 OU                    [Generar Eq]   │
├─────────────────────────────────────────────────────────────┤
│  [Gen9 OU ▼] [VGC] [UU] [Ubers] [Monotype]                 │
│  🔍 Buscar Pokémon...                                       │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 🔴 S TIER (≥20%)                    Top 3 Pokemon     │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ 🦔 Great Tusk        26.2%  ████████████████░░░░     │  │
│  │ 👻 Gholdengo         18.0%  ████████████░░░░░░░     │  │
│  │ ⚔️ Kingambit         17.7%  ████████████░░░░░░░     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 🟠 A+ TIER (≥13%)                                     │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ 🐉 Dragapult       15.4%  [abilidad: Infiltrator]    │  │
│  │ ⚡ Iron Valiant    12.7%  [objeto: Booster Energy]   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  [ Ver Detalles ] [ Exportar ] [ Comparar ]                │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Integración con APIs Existentes

### 4.1 Diagrama de Flujo de Datos

```mermaid
flowchart TD
    A[Usuario entra a /tier-list] --> B[Selecciona formato]
    B --> C[Llama getSmogonStats(format)]
    C --> D{Cache válido?}
    D -->|Sí| E[Usa datos en cache]
    D -->|No| F[Fetch a /api/smogon-stats]
    F --> G[Smogon.com/stats]
    G --> H[Parsea datos]
    H --> I[Guarda en cache]
    E --> J[Clasifica en tiers]
    I --> J
    J --> K[Renderiza UI]
```

### 4.2 Funciones a Reutilizar

```typescript
// lib/smogon-stats.ts - Ya existen
import { 
    getSmogonStats,      // Obtiene stats completos
    getTopPokemonForMeta, // Top N por uso
    getPokemonUsage,    // Stats de un Pokémon específico
    SmogonMonData       // Tipo de datos
} from '@/lib/smogon-stats';
```

### 4.3 API Endpoints Existentes

| Endpoint | Función |
|----------|---------|
| `/api/smogon-stats?format=gen9ou` | Obtiene stats de un formato |
| `/api/smogon-stats?format=gen9vgc2026f` | Stats de VGC |

### 4.4 Manejo de Errores

```typescript
// Estrategia de fallback
1. Intentar API de Smogon (servidor)
2. Si falla → Usar datos locales JSON
3. Si no hay datos locales → Mostrar mensaje de error
4. Siempre mostrar última actualización del dato
```

---

## 5. Funcionalidades Principales

### 5.1 Funcionalidades Esenciales (MVP)

| # | Funcionalidad | Prioridad | Complejidad |
|---|---------------|-----------|-------------|
| 1 | Cargar datos reales de Smogon | 🔴 Alta | Media |
| 2 | Clasificar Pokémon en tiers dinámicamente | 🔴 Alta | Media |
| 3 | Selector de formato (OU, UU, VGC, etc.) | 🔴 Alta | Baja |
| 4 | Mostrar % de uso con barra visual | 🟡 Media | Baja |
| 5 | Mostrar tipos de Pokémon | 🟡 Media | Baja |
| 6 | Cache de datos (1 hora) | 🟡 Media | Baja |

### 5.2 Funcionalidades Avanzadas

| # | Funcionalidad | Prioridad | Complejidad |
|---|---------------|-----------|-------------|
| 7 | Buscador de Pokémon | 🟡 Media | Media |
| 8 | Ver detalle de build (abilidad, objeto, moves) | 🟢 Baja | Alta |
| 9 | Ver compañeros más comunes | 🟢 Baja | Media |
| 10 | Ver checks y counters | 🟢 Baja | Media |
| 11 | Filtrar por tipo | 🟢 Baja | Media |
| 12 | Comparar Pokémon | 🟢 Baja | Alta |

### 5.3 Clasificación de Tiers

```typescript
// Función de clasificación
function classifyByUsage(usage: number, totalBattles: number): TierRank {
    const percentage = (usage / totalBattles) * 100;
    
    if (percentage >= 20) return 'S';
    if (percentage >= 13) return 'A+';
    if (percentage >= 8)  return 'A';
    if (percentage >= 6)  return 'A-';
    if (percentage >= 4)  return 'B+';
    if (percentage >= 3)  return 'B';
    if (percentage >= 2)  return 'B-';
    if (percentage >= 1)  return 'C';
    return 'D';
}
```

---

## 6. Mejoras Opcionales

### 6.1 Mejoras de UX

- [ ] **Animaciones de carga** - Skeleton loaders mientras cargan datos
- [ ] **Infinite scroll** - Cargar más Pokémon al hacer scroll
- [ ] **Dark mode completo** - Todos los componentes compatibles
- [ ] **Keyboard navigation** - Navegar con flechas
- [ ] **Mobile responsive** - Optimizado para móvil

### 6.2 Mejoras de Datos

- [ ] **Actualización automática** - Fetch nuevo cada hora
- [ ] **Histórico de cambios** - Ver cómo cambió el meta mes a mes
- [ ] **Win rate** - Integrar con API de ladder para ver win rates
- [ ] **Metas variables** - Detectar Pokemon subidos/bajados

### 6.3 Integraciones

- [ ] **Exportar a imagen** - Generar imagen del tier list
- [ ] **Compartir** - URL con formato seleccionado
- [ ] **Team builder** - Click para añadir a equipo
- [ ] **Votación** - Comunidad puede votar posicionamientos

---

## 7. Plan de Implementación por Fases

### Fase 1: MVP (Semana 1) ✅ COMPLETADO

```
[x] 1.1 Modificar app/tier-list/page.tsx
[x] 1.2 Integrar getSmogonStats() -> getTieredPokemon()
[x] 1.3 Crear función de clasificación
[x] 1.4 Implementar selector de formato (5 formatos)
[x] 1.5 Agregar cache de datos
[x] 1.6 Testing con datos reales
```

### Integración de Fuentes de Datos ✅ COMPLETADO

```
[x] 2.1 Integrar Pikalytics para Win Rates
[x] 2.2 Integrar Victory Road para VGC
[x] 2.3 Mostrar Win Rate en UI (con color coding)
[x] 2.4 Fallbacks robustos cuando APIs no responden
```

### Fase 2: Detalles (Semana 2) - PENDIENTE

```
[ ] 2.1 Crear componente PokemonDetail modal
[ ] 2.2 Mostrar habilidad/objeto/moves más usados
[ ] 2.3 Agregar buscar y filtrar (YA IMPLEMENTADO en Fase 1)
[ ] 2.4 Mejorar UI con TypeBadges (BÁSICO IMPLEMENTADO)
[ ] 2.5 Agregar barras de uso visuales
```

### Fase 3: Expansión (Semana 3) - PENDIENTE

```
[ ] 3.1 Añadir más formatos (YA SOPORTADO en API)
[ ] 3.2 Crear datos locales para cada formato
[ ] 3.3 Agregar compañeros y counters
[ ] 3.4 Optimizar rendimiento
[ ] 3.5 Testing cross-browser
```

---

## 8. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Smogon API no responde | Media | Alto | Datos locales como fallback |
| Formato no existe | Baja | Medio | Fallback a formato cercano |
| Datos parse incorrectos | Baja | Alto | Validación y testing |
| Cache muy grande | Baja | Medio | Limpiar cache viejoms |

---

## 9. Métricas de Éxito

- ✅ Tier list carga en < 2 segundos
- ✅ Muestra ≥ 100 Pokémon por formato
- ✅ Datos actualizados (fecha visible)
- ✅ Funciona offline con datos locales
- ✅ Compatible con móvil

---

## 10. Archivos Modificados/Creados

| Archivo | Acción | Estado |
|---------|--------|--------|
| [`app/tier-list/page.tsx`](app/tier-list/page.tsx) | Reescribir completo con datos reales | ✅ Completado |
| [`lib/smogon-stats.ts`](lib/smogon-stats.ts) | Añadir función de clasificación | ✅ Completado |
| [`lib/pikalytics.ts`](lib/pikalytics.ts) | Nueva integración Win Rates | ✅ Completado |
| [`lib/victory-road.ts`](lib/victory-road.ts) | Nueva integración VGC | ✅ Completado |
| [`lib/i18n.tsx`](lib/i18n.tsx) | Añadir traducciones | ✅ Completado |
| [`data/stats/gen9ou.json`](data/stats/gen9ou.json) | Datos locales existentes | ✅ Ya existente |
| [`components/tier-list/TierCard.tsx`](components/tier-list/TierCard.tsx) | Crear nuevo componente | ⏳ Fase 2 |
| [`components/tier-list/PokemonDetail.tsx`](components/tier-list/PokemonDetail.tsx) | Crear modal | ⏳ Fase 2 |

---

*Plan creado: 2026-02-18*
*Proyecto: pokemon-team-gen*
