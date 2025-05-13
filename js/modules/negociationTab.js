let currentCountry = "Brésil";
let currentScenario = "SSP1 + RCP1.9";

export function initNegociationTab() {
    console.log('[negociationTab] Initialisation du module negociationTab');

    const countrySelect = document.getElementById("negociation-country-select");
    if (countrySelect) {
        countrySelect.addEventListener("change", (e) => {
            currentCountry = e.target.value;
            updateNegociationInfo();
        });
    } else {
        console.error('[negociationTab] Élément #negociation-country-select introuvable');
    }

    document.querySelectorAll("#negociation-scenario-buttons button").forEach(btn => {
        btn.addEventListener("click", () => {
            currentScenario = btn.getAttribute("data-scenario");
            updateNegociationInfo();
        });
    });

    return updateNegociationInfo();
}

async function updateNegociationInfo() {
    const container = document.getElementById("negociation-scenarios-content");
    if (!container) {
        console.error('[negociationTab] Conteneur #negociation-scenarios-content introuvable');
        return;
    }

    try {
        container.innerHTML = `<div class="loading-state"><p>Chargement en cours...</p></div>`;

        const data = await fetchNegociationData();
        const countryData = data.state.find(p => p.pays === currentCountry);

        if (!countryData) {
            container.innerHTML = `<div class="no-data-state">Aucune donnée disponible pour ce pays</div>`;
            return;
        }

        const scenarioData = countryData.scenarios.find(s => s.nom === currentScenario);

        if (!scenarioData) {
            container.innerHTML = `<div class="no-data-state">Aucune donnée disponible pour ce scénario</div>`;
            return;
        }

        updateBaseInfos(scenarioData);
        displayScenarioDetails(scenarioData, container);
        updateActiveScenarioButtonTwo();
        updateNegociationVisuals();
    } catch (error) {
        console.error('[negociationTab] Erreur de négociation:', error);
        container.innerHTML = `<div class="error-state">Erreur lors du chargement des données</div>`;
    }
}

async function fetchNegociationData() {
    try {
        const response = await fetch("data/negociation.json");
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('[negociationTab] Erreur de chargement des données:', error);
        throw error;
    }
}

function updateBaseInfos(scenarioData) {
    const contributionElement = document.getElementById("negociation-contribution");
    const aidesElement = document.getElementById("negociation-aides");

    if (contributionElement) {
        contributionElement.textContent = `${scenarioData.contribution_milliards.min}-${scenarioData.contribution_milliards.max}`;
    }
    if (aidesElement) {
        aidesElement.textContent = `${scenarioData.aides_milliards.min}-${scenarioData.aides_milliards.max}`;
    }
}

function displayScenarioDetails(scenarioData, container) {
    container.innerHTML = `
        <div class="negociation-scenario">
            <h4>${scenarioData.nom}</h4>
            <div class="scenario-grid">
                <div><strong>Année de pic :</strong> ${scenarioData.annee_pic.min}-${scenarioData.annee_pic.max}</div>
                <div><strong>Année de réduction :</strong> ${scenarioData.annee_reduction.min}-${scenarioData.annee_reduction.max}</div>
                <div><strong>Réduction des émissions :</strong> ${scenarioData.reduction_pourcentage.min}-${scenarioData.reduction_pourcentage.max}%</div>
                <div><strong>Déforestation :</strong> ${scenarioData.deforestation.min}-${scenarioData.deforestation.max}%</div>
                <div><strong>Reboisement :</strong> ${scenarioData.reboisement.min}-${scenarioData.reboisement.max}%</div>
            </div>
            <div class="negociation-demandes">
                <h5>Demandes principales :</h5>
                ${scenarioData.demandes_principales.map(demande => `
                    <p><strong>${demande.pays} :</strong> ${demande.demandes.join(", ")}</p>
                `).join("")}
            </div>
        </div>
    `;
}

function updateNegociationVisuals() {
    const tab = document.getElementById('negociation-tab');
    if (!tab || tab.style.display !== 'block') {
        console.warn('[negociationTab] Onglet negociation-tab non visible, report de la mise à jour visuelle');
        return;
    }

    const flagElement = document.querySelector('#negociation-tab .negociation-flag-background');
    if (!flagElement) {
        console.error('[negociationTab] Élément .negociation-flag-background introuvable dans #negociation-tab');
        return;
    }

    const normalizedName = currentCountry
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '-')
        .toLowerCase();

    const flagUrl = `medias/images/flags/${normalizedName}.svg`;
    console.log(`[negociationTab] Mise à jour du drapeau pour ${currentCountry}: ${flagUrl}`);

    // Vérifier si l'image existe
    const img = new Image();
    img.onload = () => {
        flagElement.style.backgroundImage = `url('${flagUrl}')`;
        console.log(`[negociationTab] Drapeau chargé avec succès: ${flagUrl}`);
    };
    img.onerror = () => {
        console.error(`[negociationTab] Échec du chargement du drapeau: ${flagUrl}`);
        flagElement.style.backgroundImage = `url('medias/images/flags/default.svg')`;
        showError(`Drapeau pour ${currentCountry} introuvable`);
    };
    img.src = flagUrl;
}

function updateActiveScenarioButtonTwo() {
    document.querySelectorAll("#negociation-scenario-buttons button").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-scenario") === currentScenario);
    });
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-state';
    errorDiv.innerHTML = `
        <span>⚠️ ${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    const container = document.getElementById('negociation-tab');
    if (container) {
        container.prepend(errorDiv);
    }
}