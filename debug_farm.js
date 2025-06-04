(function () {
    const continents = ['54', '55'];
    const attackTemplate = 'A';
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

document.querySelectorAll('#am_widget_Farm table.vis tr').forEach(row => {

    const label = row.querySelector('.quickedit-label');
        const name = label ? label.textContent.trim() : '[kein Name]';
        const coordMatch = row.innerText.match(/\d+\|\d+/);
        const coord = coordMatch ? coordMatch[0] : '[?]';
        const cont = coord.includes('|') ? getContinent(coord) : '[?]';
        const dist = coord.includes('|') ? getDistance(coord) : '[?]';
        const isTarget = isBarbarianOrBonus(name) && continents.includes(cont) && dist <= maxDistance;

        const buttons = [...row.querySelectorAll('a')];
        const allButtons = buttons.map(b => b.textContent.trim());
        const attackBtn = buttons.find(b => b.textContent.trim() === attackTemplate);

        console.log('------');
        console.log('Dorfname:', name);
        console.log('Koordinaten:', coord);
        console.log('Kontinent:', cont);
        console.log('Entfernung:', dist);
        console.log('✔ Barbar/Bonus:', isBarbarianOrBonus(name));
        console.log('✔ In K54/55:', continents.includes(cont));
        console.log('✔ ≤ 40 Felder:', dist <= maxDistance);
        console.log('✔ Button A gefunden:', !!attackBtn);
        console.log('Alle Buttons:', allButtons);

        if (isTarget && attackBtn) {
            console.log('➡ Angriff ausgeführt!');
            attackBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
            attackCount++;
        } else {
            console.log('⛔ Kein Angriff – Kriterien nicht erfüllt');
        }
    });

    UI.InfoMessage(`DEBUG: ${attackCount} Angriffe ausgelöst.`, 4000);
})();
