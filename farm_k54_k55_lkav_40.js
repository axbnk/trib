(function () {
    const continents = ['54', '55'];
    const attackTemplate = 'A';
    const maxDistance = 40;

    const currentCoordMatch = document.querySelector('#menu_row2 .village_anchor a')?.textContent.match(/\d+\|\d+/);
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

    document.querySelectorAll('table.vis tr').forEach(row => {
        const label = row.querySelector('.quickedit-label');
        if (!label) return;

        const name = label.textContent.trim();
        const coordMatch = row.innerText.match(/\d+\|\d+/);
        if (!coordMatch) return;
        const coord = coordMatch[0];
        const cont = getContinent(coord);
        const dist = getDistance(coord);

        if (isBarbarianOrBonus(name) && continents.includes(cont) && dist <= maxDistance) {
            const btn = [...row.querySelectorAll('a')].find(b => b.textContent.trim() === attackTemplate);
            if (btn) {
                btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                attackCount++;
            }
        }
    });

    UI.InfoMessage(`✅ ${attackCount} Angriffe mit Vorlage "${attackTemplate}" auf K${continents.join(', K')} (≤ ${maxDistance} Felder) ausgeführt.`, 4000);
})();
