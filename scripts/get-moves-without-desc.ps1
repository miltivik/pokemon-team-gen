$moves = Get-Content 'data\moves.json' -Raw | ConvertFrom-Json
$withoutDesc = @('Alluring Voice', 'Burning Bulwark', 'Dragon Cheer', 'Electro Shot', 'Fickle Beam', 'Hard Press', 'Hydro Steam', 'Malignant Chain', 'Mighty Cleave', 'Psyblade', 'Psychic Noise', 'Supercell Slam', 'Tachyon Cutter', 'Temper Flare', 'Tera Starstorm', 'Thunderclap', 'Upper Hand')

Write-Host "=== Movimientos sin desc en español (17 total) ===" -ForegroundColor Yellow
Write-Host ""

foreach ($name in $withoutDesc) {
    $key = $name.ToLower().Replace(' ', '')
    $move = $moves.$key
    
    if ($move) {
        Write-Host "$name :" -ForegroundColor Cyan
        Write-Host "  ShortDesc: $($move.shortDesc)"
        Write-Host "  Desc: $($move.desc)"
        Write-Host ""
    }
    else {
        Write-Host "$name : NO ENCONTRADO" -ForegroundColor Red
    }
}
