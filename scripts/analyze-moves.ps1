# Script de análisis de movimientos

$movesEn = Get-Content 'data\moves.json' -Raw | ConvertFrom-Json
$translations = Get-Content 'data\translations-es.json' -Raw | ConvertFrom-Json

# Conteo de movimientos en inglés
$totalEnglish = $movesEn.PSObject.Properties.Count

# Conteo de movimientos en español (con nombre traducidos)
$totalSpanish = $translations.moves.PSObject.Properties.Count

# Conteo de movimientos en español CON descripción
$spanishWithDesc = ($translations.moves.PSObject.Properties | Where-Object { $_.Value.desc }).Count

# Conteo de movimientos en español SIN descripción
$spanishWithoutDesc = ($translations.moves.PSObject.Properties | Where-Object { -not $_.Value.desc }).Count

# Movimientos que existen en inglés pero NO existen en español
$spanishNames = @()
$translations.moves.PSObject.Properties | ForEach-Object { $spanishNames += $_.Value.name }

$missingInSpanish = @()
$missingInSpanish = $movesEn.PSObject.Properties | Where-Object { $spanishNames -notcontains $_.Value.name }

Write-Host "=== ANÁLISIS DE MOVIMIENTOS ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Movimientos en inglés (data/moves.json): $totalEnglish" -ForegroundColor Yellow
Write-Host "Movimientos en español (data/translations-es.json): $totalSpanish" -ForegroundColor Yellow
Write-Host ""
Write-Host "=== MOVIMIENTOS EN ESPAÑOL ===" -ForegroundColor Cyan
Write-Host "Con descripción: $spanishWithDesc"
Write-Host "Sin descripción: $spanishWithoutDesc"
Write-Host ""
Write-Host "=== MOVIMIENTOS FALTANTES EN ESPAÑOL ===" -ForegroundColor Cyan
Write-Host "Total que existen en inglés pero NO en español: $($missingInSpanish.Count)" -ForegroundColor Red
Write-Host ""

# Mostrar primeros 30 como ejemplo
Write-Host "Ejemplos de movimientos faltantes (primeros 30):" -ForegroundColor Yellow
$missingInSpanish | Select-Object -First 30 | ForEach-Object {
    Write-Host "  - $($_.Value.name)"
}
