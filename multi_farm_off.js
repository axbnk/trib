(async function () {
    const GROUP_NAME = "Off";
    const CONTINENTS = ['54', '55'];
    const MAX_DISTANCE = 40;

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

    // Lade alle Dörfer in der Gruppe "Off"
    async function loadGroupVillages() {
        const url = `/game.php?screen=overview_villages&mode=groups`;
        const html = await (await fetch(url)).text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const groupLinks = [...doc.querySelectorAll('#group_table a')];
        const targetGroup = groupLinks.find(link => link.textContent.trim() === GROUP_NAME);

        if (!targetGroup) {
            UI.ErrorMessage(`❌ Gruppe "${GROUP_NAME}" nicht gefunden.`);
            throw new Error("Gruppe nicht gefunden");
        }

        const groupId = new URLSearchParams(targetGroup.href).get('group');
        const groupUrl = `/game.php?screen=overview_villages&mode=combined&group=${groupId}`;
        const groupHtml = await (await fetch(groupUrl)).text();
        const groupDoc = new DOMParser().parseFromString(groupHtml, 'text/html');

        const rows = [...groupDoc.querySelectorAll('#combined_table tr')];
        const villages = rows
            .map(row => {
                const link = row.querySelector('a[href*="village="]');
                const coord = getCoordFromText(row.innerText);
                if (link && coord) {
                    const villageId = new URLSearchParams(link.href).get('village');
                    return { id: villageId, coord };
                }
                return null;
            })
            .filter(Boolean);

        return villages;
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

            const btn = row.querySelector('a[class*="farm_icon_a"]');
            if (isTarget && btn) {
                await fetch(btn.href, { method: 'GET', credentials: 'same-origin' });
                attackCount++;
            }
        }

        console.log(`🏹 ${attackCount} Angriffe ausgeführt aus ${village.coord}`);
        return attackCount;
    }

    UI.InfoMessage(`⚙ Starte Farming aus Gruppe "${GROUP_NAME}"...`, 3000);

    const villages = await loadGroupVillages();
    let total = 0;

    for (const village of villages) {
        const count = await farmFromVillage(village);
        total += count;
    }

    UI.InfoMessage(`✅ ${total} Angriffe aus ${villages.length} Dörfern ausgeführt.`, 6000);
})();
