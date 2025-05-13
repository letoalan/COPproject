export function initActorsInfoTab() {
    const actorSelect = document.getElementById("actor-select");
    actorSelect.addEventListener("change", () => updateActorsInfo(actorSelect.value));
    actorSelect.value = "BlackRock";
    return updateActorsInfo();
}

async function updateActorsInfo(actor = document.getElementById('actor-select').value) {
    const tableBody = document.querySelector("#actors-info-table tbody");
    const actorsImage = document.getElementById("actors-image");

    try {
        tableBody.innerHTML = `<tr><td colspan="2"><div class="loader">Chargement en cours...</div></td></tr>`;

        // Charger l'image
        actorsImage.style.display = 'none';
        actorsImage.src = getActorImagePath(actor);
        await new Promise((resolve) => {
            actorsImage.onload = () => { actorsImage.style.display = 'block'; resolve(); };
            actorsImage.onerror = () => {
                actorsImage.src = 'medias/images/actors/default.jpg';
                actorsImage.style.display = 'block';
                resolve();
            };
        });

        // Charger les données
        const response = await fetch('data/actors-info.json');
        const data = await response.json();
        const actorData = data.find(a => a.Acteur === actor);

        if (!actorData) {
            tableBody.innerHTML = `<tr><td colspan="2">Données non disponibles pour cet acteur</td></tr>`;
            return;
        }

        displayActorData(actorData, tableBody);
    } catch (error) {
        console.error('Erreur:', error);
        tableBody.innerHTML = `<tr><td colspan="2">Erreur lors du chargement des données</td></tr>`;
    }
}

function getActorImagePath(actor) {
    const imageMap = {
        'BlackRock': 'medias/images/actors/BRK.jpg',
        'TotalEnergies': 'medias/images/actors/TES.jpg',
        'GIEC': 'medias/images/actors/IPCC.jpg',
        'Green Peace': 'medias/images/actors/GP.jpg'
    };
    return imageMap[actor] || 'medias/images/actors/default.jpg';
}

function displayActorData(actorData, tableBody) {
    let rows = '';
    Object.entries(actorData).forEach(([key, value]) => {
        if (key !== 'Acteur') {
            if (typeof value === 'object') {
                rows += Object.entries(value).map(([subKey, subValue]) =>
                    `<tr><td><strong>${key} - ${subKey}</strong></td><td>${subValue}</td></tr>`
                ).join('');
            } else {
                rows += `<tr><td><strong>${key}</strong></td><td>${value}</td></tr>`;
            }
        }
    });
    tableBody.innerHTML = rows;
}