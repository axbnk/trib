(async function () {
    const CONTINENTS = ['54', '55'];
    const MAX_DISTANCE = 40;
    const WAIT_MS = 1000; // Wartezeit pro Dorf, anpassbar

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function getCoordFromText(text) {
        const match = text.match(/\d{1,3}\|\d{1,3}/);
        return match ? match[0] : null;
    }

    function getDistance(a, b) {
        const [x1, y1] = a.split('|').map(Number);
        const [x2, y2] = b.split('|').map(Number);
        return Math.hypot(x1 - x2, y1 - y2);
    }

    function getContinent(coord) {
        const [x, y] = coord.split('|').map(Number);
        return Math.floor(x / 100) + '' + Math.floor(y / 100);
    }

    function getCurrentGroupIdFromStrong() {
        const strong = document.querySelector('strong.group-menu-item[data-group-id]');
        if (!strong) {
            UI.ErrorMessage("❌ Aktive Gruppe nicht erkannt – bitte 'Kombinierte Übersicht' & Gruppe auswählen.");
            throw new Error("Keine aktive Gruppe gefunden");
        }
        return strong.getAttribute('data-group-id');
    }

    async function loadGroupVillages(groupId) {
        const url = `/game.php?screen=overview_villages&mode=combined&group=${groupId}`;
        const html = await (await fetch(url)).text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        const rows = [...doc.querySelectorAll('#combined_table tr')];
        return rows.map(row => {
            const link = row.querySelector('a[href*="village="]');
            const coord = getCoordFromText(row.innerText);
            if (link && coord) {
                const villageId = new URLSearchParams(link.href).get('village');
                return { id: villageId, coord };
            }
            return null;
        }).filter(Boolean);
    }

    async function farmFromVillage(village) {
        const url = `/game.php?village=${village.id}&screen=am_farm`;
        const html = await (await fetch(url)).text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        const rows = [...doc.querySelectorAll('tr')];
        let attackCount = 0;

        for (const row of rows) {
            const coord = getCoordFromText(row.innerText);
            if (!coord) continue;

            const dist = getDistance(village.coord, coord);
            const cont = getContinent(coord);
            const isTarget = CONTINENTS.includes(cont) && dist <= MAX_DISTANCE;

            const btn = row.querySelector('a.farm_icon_a');
            if (btn && isTarget) {
                btn.click(); // Echtes Klicken des Buttons
                attackCount++;
            }
        }

        console.log(`🏹 ${attackCount} Angriffe aus ${village.coord}`);
        return attackCount;
    }

    // Ablauf starten
    UI.InfoMessage(`⚙ Starte automatisches Farmen aus aktiver Gruppe...`, 4000);

    const groupId = getCurrentGroupIdFromStrong();
    const villages = await loadGroupVillages(groupId);
    let total = 0;

    for (const [i, village] of villages.entries()) {
        console.log(`➡ (${i + 1}/${villages.length}) Bearbeite Dorf ${village.coord}`);
        total += await farmFromVillage(village);
        await sleep(WAIT_MS);
    }

    UI.InfoMessage(`✅ ${total} Angriffe aus ${villages.length} Dörfern abgeschlossen.`, 6000);
})();
