$movesEn = Get-Content 'data\moves.json' -Raw | ConvertFrom-Json
$translations = Get-Content 'data\translations-es.json' -Raw | ConvertFrom-Json

Write-Host "=== Movimientos que existen en inglés pero NO en español ===" -ForegroundColor Yellow
Write-Host ""

$spanishNames = @()
$translations.moves.PSObject.Properties | ForEach-Object { $spanishNames += $_.Value.name }

$missing = $movesEn.PSObject.Properties | Where-Object { $spanishNames -notcontains $_.Value.name }

Write-Host "Total: $($missing.Count)" -ForegroundColor Cyan
Write-Host ""

$missing | ForEach-Object {
    Write-Host "$($_.Value.name)"
}
