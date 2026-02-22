# Plan de Implementación: Arreglar Habilidades y Descripciones Truncadas

## Resumen del Problema

Se identificó que existen **39 habilidades** que no tienen descripción (`desc`) en el archivo de traducciones español ([`data/translations-es.json`](data/translations-es.json)). Cuando el idioma está configurado en español, estas habilidades muestran la descripción en inglés como fallback (usando `shortDesc` del archivo original).

## Análisis del Sistema de Traducciones

### Flujo actual ([`lib/showdown-data.ts`](lib/showdown-data.ts:310-317))

```
getTranslatedAbilityDesc(abilityName, lang='es')
  ├─ Busca en translations-es.json → abilities[abilityName].desc
  ├─ Si NO existe: usa fallback
  │   └─ abilities[id]?.shortDesc || abilities[id]?.desc
  └─ Retorna la descripción en inglés como fallback
```

### Archivos involucrados

| Archivo | Descripción |
|---------|-------------|
| [`data/abilities.json`](data/abilities.json) | Datos originales de habilidades en inglés (~1560 habilidades) |
| [`data/translations-es.json`](data/translations-es.json) | Traducciones español (306 habilidades, 267 con desc) |
| [`lib/showdown-data.ts`](lib/showdown-data.ts) | Funciones de traducción |

### Estadísticas actuales

| Tipo | Total en traducciones | Con `desc` | Sin `desc` |
|------|----------------------|------------|------------|
| Habilidades | 306 | 267 | **39** |
| Movimientos | 841 | ~824 | ~17 |
| Objetos | 147 | - | - |

## Habilidades sin Descripción en Español (39 total)

Las siguientes habilidades necesitan ser traducidas:

1. **Anger Shell** - "At 1/2 or less of this Pokemon's max HP: +1 Atk, Sp. Atk, Spe, and -1 Def, Sp. Def."
2. **Armor Tail** - "This Pokemon and its allies are protected from opposing priority moves."
3. **Beads of Ruin** - "Active Pokemon without this Ability have their Special Defense multiplied by 0.75."
4. **Commander** - "If ally is Dondozo: this Pokemon cannot act or be hit, +2 to all Dondozo's stats."
5. **Costar** - "On switch-in, this Pokemon copies all of its ally's stat stage changes."
6. **Cud Chew** - "If this Pokemon eats a Berry, it will eat that Berry again at the end of the next turn."
7. **Earth Eater** - "This Pokemon heals 1/4 of its max HP when hit by Ground moves; Ground immunity."
8. **Electromorphosis** - "This Pokemon gains the Charge effect when it takes a hit from an attack."
9. **Good as Gold** - "This Pokemon is immune to Status moves."
10. **Guard Dog** - "Immune to Intimidate. Intimidated: +1 Attack. Cannot be forced to switch out."
11. **Hadron Engine** - "On switch-in, summons Electric Terrain. During Electric Terrain, Sp. Atk is 1.3333x."
12. **Hospitality** - "On switch-in, this Pokemon restores 1/4 of its ally's maximum HP, rounded down."
13. **Lingering Aroma** - "Making contact with this Pokemon has the attacker's Ability become Lingering Aroma."
14. **Mind's Eye** - "Fighting, Normal moves hit Ghost. Accuracy can't be lowered, ignores evasiveness."
15. **Mycelium Might** - "This Pokemon's Status moves go last in their priority bracket and ignore Abilities."
16. **Opportunist** - "When an opposing Pokemon has a stat stage raised, this Pokemon copies the effect."
17. **Orichalcum Pulse** - "On switch-in, summons Sunny Day. During Sunny Day, Attack is 1.3333x."
18. **Poison Puppeteer** - "Pecharunt: If this Pokemon poisons a target, the target also becomes confused."
19. **Protosynthesis** - "Sunny Day active or Booster Energy used: highest stat is 1.3x, or 1.5x if Speed."
20. **Purifying Salt** - "Ghost damage to this Pokemon dealt with a halved offensive stat; can't be statused."
21. **Quark Drive** - "Electric Terrain active or Booster Energy used: highest stat is 1.3x, or 1.5x if Speed."
22. **Rocky Payload** - "This Pokemon's offensive stat is multiplied by 1.5 while using a Rock-type attack."
23. **Seed Sower** - "When this Pokemon is hit by an attack, the effect of Grassy Terrain begins."
24. **Sharpness** - "This Pokemon's slicing moves have their power multiplied by 1.5."
25. **Supersweet Syrup** - "On switch-in, this Pokemon lowers the evasiveness of opponents 1 stage. Once per battle."
26. **Supreme Overlord** - "This Pokemon's moves have 10% more power for each fainted ally, up to 5 allies."
27. **Sword of Ruin** - "Active Pokemon without this Ability have their Defense multiplied by 0.75."
28. **Tablets of Ruin** - "Active Pokemon without this Ability have their Attack multiplied by 0.75."
29. **Teraform Zero** - "Terapagos: Terastallizing ends the effects of weather and terrain. Once per battle."
30. **Tera Shell** - "Terapagos: If full HP, attacks taken have 0.5x effectiveness unless naturally immune."
31. **Tera Shift** - "If this Pokemon is a Terapagos, it transforms into its Terastal Form on entry."
32. **Thermal Exchange** - "This Pokemon's Attack is raised by 1 when damaged by Fire moves; can't be burned."
33. **Toxic Chain** - "This Pokemon's attacks have a 30% chance of badly poisoning."
34. **Toxic Debris** - "If this Pokemon is hit by a physical attack, Toxic Spikes are set on the opposing side."
35. **Vessel of Ruin** - "Active Pokemon without this Ability have their Special Attack multiplied by 0.75."
36. **Well-Baked Body** - (NO ENCONTRADO en abilities.json)
37. **Wind Power** - "This Pokemon gains the Charge effect when hit by a wind move or Tailwind begins."
38. **Wind Rider** - "Attack raised by 1 if hit by a wind move or Tailwind begins. Wind move immunity."
39. **Zero to Hero** - "If this Pokemon is a Palafin in Zero Form, switching out has it change to Hero Form."

## Plan de Implementación

### Opción 1: Completar las traducciones manualmente (Recomendado para precisión)

**Pasos:**
1. Crear un script que genere un archivo CSV/JSON con las 39 habilidades y sus descripciones en inglés
2. Traducir cada descripción manualmente al español
3. Actualizar el archivo `data/translations-es.json` con las nuevas descripciones

**Ventajas:**
- Traducciones precisas y consistentes con el vocabulario oficial de Pokémon en español
- Control total sobre la calidad

**Desventajas:**
- Requiere trabajo manual

### Opción 2: Usar un servicio de traducción automática (más rápido)

**Pasos:**
1. Usar una API de traducción (Google Translate, DeepL, etc.)
2. Traducir automáticamente las 39 descripciones
3. Revisar y corregir las traducciones generadas
4. Actualizar el archivo

**Ventajas:**
- Más rápido

**Desventajas:**
- Puede haber errores de traducción que requieren revisión

### Opción 3: Mejorar el fallback (solución temporal)

**Pasos:**
1. Modificar [`lib/showdown-data.ts`](lib/showdown-data.ts) para mostrar un indicador cuando la descripción está en inglés
2. O mostrar un mensaje como "Descripción no disponible en español"

**Ventajas:**
- Solución rápida

**Desventajas:**
- No resuelve el problema de fondo

## Recomendación

Se recomienda implementar la **Opción 1** con un enfoque híbrido:
1. Usar el script generado ([`scripts/analyze-missing-abilities.ps1`](scripts/analyze-missing-abilities.ps1)) para identificar las habilidades
2. Crear un archivo de trabajo para las traducciones
3. Agregar las traducciones faltantes al archivo [`data/translations-es.json`](data/translations-es.json)

## Scripts de Análisis Generados

Se creó el script [`scripts/analyze-missing-abilities.ps1`](scripts/analyze-missing-abilities.ps1) que puede ejecutarse para obtener un análisis actualizado de las habilidades faltantes.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/analyze-missing-abilities.ps1
```
