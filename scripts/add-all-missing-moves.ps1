# Script para agregar TODOS los movimientos faltantes al archivo de traducciones
# Usa el nombre en inglés y la descripción en inglés como fallback

$movesEn = Get-Content 'data\moves.json' -Raw | ConvertFrom-Json
$translationsPath = 'data\translations-es.json'

# Leer el archivo actual
$translationsJson = Get-Content $translationsPath -Raw | ConvertFrom-Json

# Obtener nombres de movimientos que ya existen en español
$existingSpanishNames = @()
$translationsJson.moves.PSObject.Properties | ForEach-Object { 
    $existingSpanishNames += $_.Value.name 
}

# Encontrar movimientos que no existen en español
$missingMoves = $movesEn.PSObject.Properties | Where-Object { 
    $existingSpanishNames -notcontains $_.Value.name 
}

Write-Host "=== AGREGANDO MOVIMIENTOS FALTANTES ===" -ForegroundColor Cyan
Write-Host "Total de movimientos a agregar: $($missingMoves.Count)" -ForegroundColor Yellow
Write-Host ""

# Agregar cada movimiento faltante
$added = 0
foreach ($move in $missingMoves) {
    $moveName = $_.Value.name
    $moveDesc = $_.Value.desc
    $moveShortDesc = $_.Value.shortDesc
    
    # Usar shortDesc como fallback si desc está vacío
    if ([string]::IsNullOrEmpty($moveDesc)) {
        $moveDesc = $moveShortDesc
    }
    
    # Si aún no hay descripción, usar el nombre
    if ([string]::IsNullOrEmpty($moveDesc)) {
        $moveDesc = "(Descripción no disponible)"
    }
    
    # Escape de comillas en la descripción
    $moveDesc = $moveDesc -replace '"', '\"'
    
    # Agregar la nueva propiedad al objeto
    $translationsJson.moves | Add-Member -NotePropertyName $moveName -NotePropertyValue @{ 
        name = $moveName
        desc = $moveDesc
    } -Force
    
    $added++
    Write-Host "Agregado: $moveName" -ForegroundColor Green
}

# Guardar el archivo actualizado
$translationsJson | ConvertTo-Json -Depth 100 | Set-Content $translationsPath -Encoding UTF8

Write-Host ""
Write-Host "=== RESUMEN ===" -ForegroundColor Cyan
Write-Host "Total de movimientos agregados: $added" -ForegroundColor Green
Write-Host "El archivo ha sido actualizado." -ForegroundColor Yellow
