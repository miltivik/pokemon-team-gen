# Especificación Técnica V2: Generador de Equipos Pokémon Multigeneracional

## 1. Visión General
El objetivo es transformar el actual generador de equipos basado en plantillas estáticas (Gen 9) en un sistema dinámico capaz de soportar cualquier generación (RBY-SV) utilizando datos en tiempo real de Smogon (Usage Stats, Chaos) y Pikalytics.

## 2. Arquitectura de Datos

### 2.1 Fuentes de Datos
El sistema consumirá datos de tres fuentes principales:
1.  **Smogon Chaos JSONs**: Proporcionan estadísticas detalladas de uso, compañeros de equipo (teammates), movimientos, objetos y spreads de EVs.
    *   *URL Base*: `https://stats.smogon.com/chaos/{format}-{rating}.json`
2.  **Smogon Usage Stats**: Listas de uso general para ponderación rápida.
3.  **Pokémon Showdown Data**: Base de conocimientos estática (Dex) para Stats Base, Tipos y Habilidades por generación.

### 2.2 Pipeline ETL (Extract, Transform, Load)
Dado que Smogon no tiene una API REST convencional, implementaremos un pipeline de ingestión bajo demanda con caché.

*   **Extractor**: Servicio que descarga los JSONs de "Chaos" para el formato solicitado (ej. `gen9ou`, `gen3ou`).
*   **Normalizador**:
    *   Mapeo de nombres a IDs (ej. "Tapu Lele" -> `tapulele`).
    *   Estandarización de claves estadísticas.
*   **Caché (LRU/Redis)**: Almacenamiento temporal (24h) de los datos procesados para evitar descargas repetitivas.

### 2.3 Estructura de Datos Unificada
Para manejar múltiples generaciones, abstraemos la entidad `Pokemon` y `Format`.

```typescript
interface GenerationConfig {
  genId: number;           // 1-9
  mechanics: {
    hasAbilities: boolean; // Gen 3+
    hasItems: boolean;     // Gen 2+
    physSpecSplit: boolean;// Gen 4+
    fairyType: boolean;    // Gen 6+
  };
  dex: Record<string, PokemonSpecies>; // Datos estáticos de la generación
}

interface CompetitiveContext {
  format: string;          // "gen9ou"
  usage: Record<string, number>; // Uso raw
  teammates: Record<string, Record<string, number>>; // Matriz de correlación
  counters: Record<string, Record<string, number>>; // Checks y Counters
  sets: Record<string, MostCommonSet>; // Datos optimizados
}
```

## 3. Lógica Multigeneracional

El sistema consultará un `DexProvider` que devuelve la información correcta según la generación activa.

*   **Tipos**: `getTypes(speciesId, gen)` devuelve `['Normal']` para Clefable en Gen 1-5 y `['Fairy']` en Gen 6+.
*   **Stats**: `getBaseStats(speciesId, gen)` maneja cambios (ej. aumento de stats en Gen 7).
*   **Items/Habilidades**: Se filtran automáticamente si la configuración de la generación (`mechanics`) no los soporta.

## 4. Algoritmo de Construcción (Weighted Synergy Scoring)

El núcleo del generador utiliza un algoritmo de puntuación ponderada para seleccionar el siguiente miembro del equipo.

### Fórmulas

Para un candidato $P$ (Pokémon) dado un equipo existente $T$:

$$Score(P) = w_1 \cdot U(P) + w_2 \cdot Syn(P, T) + w_3 \cdot Cov(P, T) - w_4 \cdot Vul(P, T)$$

Donde:
*   **$U(P)$ (Usage)**: Porcentaje de uso en el tier (Viabilidad base).
*   **$Syn(P, T)$ (Sinergia)**: Promedio de la correlación de $P$ con cada miembro de $T$ en los datos "Teammates" de Smogon.
    $$Syn(P, T) = \frac{\sum_{m \in T} Correlation(P, m)}{|T|}$$
*   **$Cov(P, T)$ (Cobertura)**: Cuántas debilidades no cubiertas del equipo $T$ resiste o inmuniza $P$.
*   **$Vul(P, T)$ (Vulnerabilidad Compartida)**: Penalización si $P$ comparte debilidades críticas (ej. x4 a Hielo) con miembros de $T$.

### Pesos Sugeridos
*   $w_1$ (Uso): 0.3
*   $w_2$ (Sinergia): 0.4 (Prioridad alta a datos reales de compañeros)
*   $w_3$ (Cobertura): 0.2
*   $w_4$ (Vulnerabilidad): 0.1

## 5. Optimización de Sets Automática

Una vez seleccionado un Pokémon, se genera su set competitivo:

1.  **Look-up de Contexto**: Buscar la entrada del Pokémon en el JSON de Chaos.
2.  **Selección de Habilidad/Item**: Escoger el de mayor porcentaje de uso total.
3.  **Selección de Movimientos**:
    *   Seleccionar los 4 movimientos con mayor % de uso.
    *   *Regla de Exclusión*: Si un movimiento es exclusivo de un compañero no presente (ej. un movimiento de setup de clima sin el setter), buscar el siguiente.
4.  **Distribución de EVs**:
    *   Identificar el "Spread" más común.
    *   Si no hay datos claros, usar heurística simple (252/252 en las dos stats más altas base).

## 6. Diagrama de Flujo (Pseudocódigo)

```python
function SuggestNextMember(currentTeam, formatData):
    candidates = List of all Pokemon in formatData.usage
    scoredCandidates = []

    # Calcular debilidades actuales del equipo
    teamWeaknesses = AnalyzeWeaknesses(currentTeam)

    for pokemon in candidates:
        if pokemon in currentTeam: continue # Skip duplicates (unless Species Clause allows)

        score = 0

        # 1. Base Viability
        score += pokemon.usageRate * 0.3

        # 2. Synergy (Teammates)
        synergySum = 0
        for member in currentTeam:
            synergySum += formatData.teammates[member.id][pokemon.id]
        score += (synergySum / len(currentTeam)) * 0.4

        # 3. Defensive Coverage
        for type in teamWeaknesses:
            if pokemon.resists(type):
                score += 0.2

        # 4. Role Fulfillment (Optional)
        if teamNeeds("Stealth Rock") and pokemon.learns("Stealth Rock"):
             score += 0.5

        scoredCandidates.add({pokemon, score})

    # Ordenar y devolver Top 5
    return SortDescending(scoredCandidates).take(5)
```
