(function () {
    const continents = ['54', '55'];
    const maxDistance = 40;

    const currentCoordMatch = document.body.innerText.match(/\d{1,3}\|\d{1,3}/);
    if (!currentCoordMatch) {
        UI.ErrorMessage("❌ Konnte aktuelle Dorfkoordinaten nicht finden.");
        return;
    }
    const [ownX, ownY] = currentCoordMatch[0].split('|').map(Number);

    let attackCount = 0;

    function isBarbarianOrBonus(name) {
        return name.includes('Bonus') || name.includes('Barbar');
    }

    function getContinent(coord) {
        const [x, y] = coord.split('|').map(Number);
        return Math.floor(x / 100).toString() + Math.floor(y / 100).toString();
    }

    function getDistance(coord) {
        const [x, y] = coord.split('|').map(Number);
        return Math.hypot(ownX - x, ownY - y);
    }

    // Neue Logik: Suche Zeilen mit "farm_icon_a"
    document.querySelectorAll('tr').forEach(row => {
        const coordMatch = row.innerText.match(/\d{1,3}\|\d{1,3}/);
        if (!coordMatch) return;

        const coord = coordMatch[0];
        const dist = getDistance(coord);
        const cont = getContinent(coord);
        const name = row.innerText;

        const isTarget = isBarbarianOrBonus(name) &&
                         continents.includes(cont) &&
                         dist <= maxDistance;

        const btn = row.querySelector('a.farm_icon_a');

        if (isTarget && btn) {
            btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
            attackCount++;
        }
    });

    UI.InfoMessage(`✅ ${attackCount} Angriffe mit Vorlage A auf K${continents.join(', K')} (≤ ${maxDistance} Felder) ausgeführt.`, 4000);
})();
