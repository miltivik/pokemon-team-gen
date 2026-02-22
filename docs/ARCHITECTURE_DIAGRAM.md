# Diagrama de Arquitectura del Generador V2

```mermaid
graph TD
    User([Usuario]) -->|Selecciona Formato (Gen3 OU)| UI[Interfaz Web]
    UI -->|Petición API| API[API Route Next.js]

    subgraph "Backend (Server-Side)"
        API -->|1. Validar Cache| Cache[(Redis / LRU Cache)]
        Cache -->|Hit| Builder[Dynamic Team Builder]
        Cache -->|Miss| Extractor[Smogon Data Fetcher]

        Extractor -->|HTTP Request| Smogon[stats.smogon.com (Chaos JSON)]
        Extractor -->|Parse & Normalize| Normalizer[Data Normalizer]
        Normalizer -->|Store| Cache
        Normalizer --> Builder

        subgraph "Lógica Multigeneracional"
            Builder -->|Consulta| Dex[Dex Provider]
            Dex -->|Gen 1| G1[RBY Ruleset]
            Dex -->|Gen 2-8| GX[Legacy Rulesets]
            Dex -->|Gen 9| G9[SV Ruleset]
        end

        Builder -->|Algoritmo de Selección| Scoring[Weighted Scoring Engine]
        Scoring -->|2. Analizar Equipo| Synergy[Synergy Calculator]
        Scoring -->|3. Calcular Cobertura| TypeChart[Type Chart Matrix]

        Scoring -->|4. Seleccionar Top N| Candidates[Lista de Candidatos]
        Candidates -->|5. Optimizar Sets| SetBuilder[Set Optimizer (Moves/EVs)]
    end

    SetBuilder -->|Equipo Generado| API
    API -->|JSON Response| UI
```

## Flujo de Datos

1.  **Inicio**: El usuario solicita un equipo para un formato específico (ej. `gen4ou`).
2.  **Verificación de Datos**:
    *   El sistema verifica si tiene los datos de uso ("Chaos") cacheados para `gen4ou`.
    *   Si no, los descarga de `stats.smogon.com`, los procesa y los guarda.
3.  **Generación**:
    *   El `Dynamic Team Builder` inicializa el contexto con las reglas de Gen 4 (sin Hadas, stats antiguos, división físico/especial).
    *   Si hay Pokémon pre-seleccionados, calcula sus debilidades y resistencias.
4.  **Selección**:
    *   El `Weighted Scoring Engine` itera sobre todos los Pokémon viables del tier.
    *   Calcula un puntaje basado en: Popularidad + Sinergia con compañeros + Cobertura de tipos.
5.  **Optimización**:
    *   Para el Pokémon ganador, el `Set Optimizer` consulta los datos de Chaos para asignar:
        *   Habilidad más usada.
        *   Objeto más usado.
        *   Movimientos más comunes (filtrando incompatibles).
        *   Spread de EVs estándar.
6.  **Respuesta**: El equipo completo se devuelve al frontend.
