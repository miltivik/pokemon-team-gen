$abilities = Get-Content 'data\abilities.json' -Raw | ConvertFrom-Json

$missing = @('Anger Shell', 'Armor Tail', 'Beads of Ruin', 'Commander', 'Costar', 'Cud Chew', 'Earth Eater', 'Electromorphosis', 'Good as Gold', 'Guard Dog', 'Hadron Engine', 'Hospitality', 'Lingering Aroma', "Mind's Eye", 'Mycelium Might', 'Opportunist', 'Orichalcum Pulse', 'Poison Puppeteer', 'Protosynthesis', 'Purifying Salt', 'Quark Drive', 'Rocky Payload', 'Seed Sower', 'Sharpness', 'Supersweet Syrup', 'Supreme Overlord', 'Sword of Ruin', 'Tablets of Ruin', 'Teraform Zero', 'Tera Shell', 'Tera Shift', 'Thermal Exchange', 'Toxic Chain', 'Toxic Debris', 'Vessel of Ruin', 'Well-Baked Body', 'Wind Power', 'Wind Rider', 'Zero to Hero')

Write-Host "=== Habilidades faltantes en español (39 total) ===" -ForegroundColor Yellow
Write-Host ""

foreach ($name in $missing) {
    $key = $name.ToLower().Replace(' ', '').Replace("'", '').Replace('.', '')
    $ability = $abilities.$key
    
    if ($ability) {
        $shortDesc = if ($ability.shortDesc) { $ability.shortDesc } else { "(vacío)" }
        Write-Host "$name :" -ForegroundColor Cyan
        Write-Host "  ShortDesc: $shortDesc"
        Write-Host ""
    } else {
        Write-Host "$name : NO ENCONTRADO" -ForegroundColor Red
    }
}
