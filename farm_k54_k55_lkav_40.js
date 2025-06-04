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

    function getContinent(coord) {
        const [x, y] = coord.split('|').map(Number);
        return Math.floor(x / 100).toString() + Math.floor(y / 100).toString();
    }

    function getDistance(coord) {
        const [x, y] = coord.split('|').map(Number);
        return Math.hypot(ownX - x, ownY - y);
    }

    document.querySelectorAll('a[class*="farm_icon_a"]').forEach(btn => {
        const row = btn.closest('tr');
        const coordMatch = row?.innerText.match(/\d{1,3}\|\d{1,3}/);
        if (!coordMatch) return;

        const coord = coordMatch[0];
        const dist = getDistance(coord);
        const cont = getContinent(coord);

        const isTarget = continents.includes(cont) && dist <= maxDistance;

        if (isTarget) {
            btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
            attackCount++;
        }
    });

    UI.InfoMessage(`✅ ${attackCount} Angriffe mit Vorlage A auf K${continents.join(', K')} (≤ ${maxDistance} Felder) ausgeführt.`, 4000);
})();
