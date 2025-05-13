export function initStateInfoTab() {
    // Initialiser les écouteurs d'événements
    document.getElementById("state-select").addEventListener("change", async (e) => {
        await updateStateInfo(e.target.value);
    });

    // Charger les données initiales
    return updateStateInfo();
}

// Variables pour stocker les graphiques
let populationEmissionsChart = null;
let ranksChart = null;
let gesSectorsChart = null;

async function updateStateInfo(stateName = document.getElementById('state-select').value) {
    const tableBody = document.querySelector('#state-info-table tbody');

    try {
        // Afficher l'état de chargement
        tableBody.innerHTML = createLoadingState();

        // Mettre à jour le drapeau
        await updateCountryFlag(stateName);

        // Charger les données JSON
        const stateData = await fetchStateData(stateName);

        if (!stateData) {
            tableBody.innerHTML = createNoDataState("Aucune donnée disponible pour cet État");
            return;
        }

        // Mettre à jour le tableau
        updateStateTable(tableBody, stateData);

        // Mettre à jour les visualisations
        await updateStateVisualizations(stateData);

    } catch (error) {
        console.error('Erreur:', error);
        tableBody.innerHTML = createErrorState();
    }
}

// Fonctions utilitaires pour les états d'interface
function createLoadingState() {
    return `
        <tr>
            <td colspan="2" class="loading-state">
                <div class="loader">Chargement en cours...</div>
            </td>
        </tr>
    `;
}

function createNoDataState(message = "Aucune donnée disponible") {
    return `
        <tr>
            <td colspan="2">${message}</td>
        </tr>
    `;
}

function createErrorState() {
    return `
        <tr>
            <td colspan="2" class="error-state">
                Erreur lors du chargement des données
            </td>
        </tr>
    `;
}

async function fetchStateData(stateName) {
    const response = await fetch('data/etats.json');
    const data = await response.json();
    return data.find(state => state.Pays === stateName);
}

function updateStateTable(tableBody, stateData) {
    tableBody.innerHTML = '';

    // Liste des propriétés à afficher dans le tableau
    const propertiesToShow = [
        'Population',
        'Émissions de GES',
        'PIB par habitant',
        'IDH',
        'Vulnérabilité',
        'Secteurs Émetteurs de GES'
    ];

    propertiesToShow.forEach(property => {
        if (stateData[property]) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${property}</strong></td>
                <td>${stateData[property]}</td>
            `;
            tableBody.appendChild(row);
        }
    });
}

async function updateCountryFlag(country) {
    const flagBackground = document.querySelector('.country-flag-background');
    if (flagBackground) {
        const normalizedCountry = country
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-')
            .toLowerCase();

        flagBackground.setAttribute('data-country', country);
        flagBackground.style.backgroundImage = `url('medias/images/flags/${normalizedCountry}.svg')`;
    }
}

async function updateStateVisualizations(stateData) {
    // Détruire les anciens graphiques s'ils existent
    if (populationEmissionsChart) populationEmissionsChart.destroy();
    if (ranksChart) ranksChart.destroy();
    if (gesSectorsChart) gesSectorsChart.destroy();

    // Créer les nouveaux graphiques
    populationEmissionsChart = createPopulationEmissionsChart(stateData);
    ranksChart = createRanksChart(stateData);
    gesSectorsChart = createGesSectorsChart(stateData);
}

function createPopulationEmissionsChart(stateData) {
    const ctx = document.getElementById('populationEmissionsChart').getContext('2d');

    // Extraire les données
    const population = parseFloat(stateData['Population'].match(/(\d+(\.\d+)?)/)[0]);
    const emissions = parseFloat(stateData['Émissions de GES'].match(/(\d+(\.\d+)?)/)[0]);

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Population (millions)', 'Émissions de GES (tonnes CO2eq)'],
            datasets: [
                {
                    label: 'Population (millions)',
                    data: [population, null],
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    yAxisID: 'y-axis-population'
                },
                {
                    label: 'Émissions de GES (tonnes CO2eq)',
                    data: [null, emissions],
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    yAxisID: 'y-axis-emissions'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                'y-axis-population': {
                    type: 'linear',
                    position: 'left',
                    title: { display: true, text: 'Population (millions)' },
                    beginAtZero: true,
                    max: Math.ceil(population * 1.2)
                },
                'y-axis-emissions': {
                    type: 'linear',
                    position: 'right',
                    title: { display: true, text: 'Émissions (tonnes CO2eq)' },
                    beginAtZero: true,
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}

function createRanksChart(stateData) {
    const ctx = document.getElementById('ranksChart').getContext('2d');

    // Extraire les rangs
    const pibRank = parseInt(stateData['PIB par habitant'].match(/\d+/)[0]);
    const idhRank = parseInt(stateData['IDH'].match(/\d+/)[0]);
    const vulnerabilityRank = parseInt(stateData['Vulnérabilité'].match(/\d+/)[0]);

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['PIB par habitant', 'IDH', 'Vulnérabilité'],
            datasets: [{
                label: 'Classement',
                data: [pibRank, idhRank, vulnerabilityRank],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 99, 132, 0.5)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    reverse: true,
                    title: {
                        display: true,
                        text: 'Classement (1 = meilleur)'
                    }
                }
            }
        }
    });
}

function createGesSectorsChart(stateData) {
    const ctx = document.getElementById('gesSectorsChart').getContext('2d');
    const sectorsString = stateData['Secteurs Émetteurs de GES'];

    // Parser les données des secteurs
    const sectors = sectorsString.split(',')
        .map(sector => {
            const [name, percentage] = sector.split(':').map(s => s.trim());
            return {
                name: name,
                value: parseFloat(percentage.replace('%', ''))
            };
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 3); // Prendre les 3 premiers secteurs

    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: sectors.map(s => s.name),
            datasets: [{
                data: sectors.map(s => s.value),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Top 3 des Secteurs Émetteurs de GES'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw}%`;
                        }
                    }
                }
            }
        }
    });
}