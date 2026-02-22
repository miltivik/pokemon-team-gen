# Script para agregar movimientos faltantes con fallback en inglés
# Este script agrega todos los movimientos que existen en inglés pero no en español
# Usa el nombre y descripción en inglés como fallback

$movesEn = Get-Content 'data\moves.json' -Raw | ConvertFrom-Json
$translationsJson = Get-Content 'data\translations-es.json' -Raw

# Obtener nombres de movimientos en español
$spanishNames = @()
$translations = $translationsJson | ConvertFrom-Json
$translations.moves.PSObject.Properties | ForEach-Object { $spanishNames += $_.Value.name }

# Encontrar movimientos faltantes
$missingMoves = $movesEn.PSObject.Properties | Where-Object { $spanishNames -notcontains $_.Value.name }

Write-Host "=== AGREGANDO MOVIMIENTOS FALTANTES ===" -ForegroundColor Cyan
Write-Host "Total de movimientos a agregar: $($missingMoves.Count)" -ForegroundColor Yellow
Write-Host ""

# Agregar cada movimiento faltante
$added = 0
$skipped = 0

$missingMoves | ForEach-Object {
    $moveName = $_.Value.name
    $moveDesc = $_.Value.desc
    $moveShortDesc = $_.Value.shortDesc
    
    # Usar shortDesc como fallback si desc está vacío
    if (-not $moveDesc -or $moveDesc -eq "") {
        $moveDesc = $moveShortDesc
    }
    
    # Si aún no hay descripción, usar el nombre
    if (-not $moveDesc -or $moveDesc -eq "") {
        $moveDesc = "(Descripción no disponible)"
    }
    
    # Crear la entrada en el JSON
    $newEntry = @"
    "$moveName": {
      "name": "$moveName",
      "desc": "$moveDesc"
    },
"@
    
    Write-Host "Agregando: $moveName" -ForegroundColor Green
    
    $added++
}

Write-Host ""
Write-Host "=== RESUMEN ===" -ForegroundColor Cyan
Write-Host "Movimientos a agregar: $added" -ForegroundColor Yellow
Write-Host "Nota: Este script muestra qué movimientos se agregarían." -ForegroundColor Gray
Write-Host "Para ejecutar la adición real, se necesita modificar el JSON." -ForegroundColor Gray
