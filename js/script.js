
// Variable globale pour stocker le scénario actuel
let currentScenario = "SSP1 + RCP1.9"; // Scénario par défaut


// Fonction pour basculer entre les onglets
function showTab(tabId) {
    const tabs = document.querySelectorAll(".tab-content");
    tabs.forEach((tab) => (tab.style.display = "none"));
    document.getElementById(tabId).style.display = "block";

    // Mettre à jour le drapeau uniquement si l'onglet "Pays" est sélectionné
    if (tabId === "country-tab") {
        const country = document.getElementById("country-select").value;
        updateCountryFlag(country);
    }
}

// Fonction pour afficher les détails du scénario sélectionné
function showScenario(scenario) {
    console.log("Scénario sélectionné :", scenario);

    // Mettre à jour le scénario actuel
    currentScenario = scenario;

    // Mettre à jour le titre et la description
    const scenarioTitle = document.getElementById("scenario-title");
    const scenarioText = document.getElementById("scenario-text");
    const scenarioImage = document.getElementById("scenario-image");

    scenarioTitle.textContent = scenario;
    scenarioText.textContent = getScenarioDescription(scenario);

    // Afficher une image correspondante
    scenarioImage.src = `images/${scenario.replace(/ /g, "_")}.jpg`;
    scenarioImage.style.display = "block";

    // Mettre à jour les graphiques
    updateScenarioChart(getScenarioData(scenario));
    updateScenarioEvolutionChart(scenario);

    // Mettre à jour la carte avec le pays par défaut (Brésil) et le scénario sélectionné
    const country = "Brésil"; // Par défaut, on utilise le Brésil
    updateMap(country, scenario);

    // Synchroniser avec l'onglet Pays
    loadScenario(scenario); // Charge les données pour le scénario sélectionné
}

// Fonction pour mettre à jour la carte et les données lorsqu'un pays est sélectionné
function updateCountryScenario() {
    const country = document.getElementById("country-select").value; // Récupérer le pays sélectionné
    const scenario = currentScenario; // Utiliser le scénario actuellement sélectionné
    updateMap(country, scenario); // Mettre à jour la carte avec le pays et le scénario
    loadScenario(scenario); // Charger les données pour le pays et le scénario sélectionnés
}

// Fonction pour obtenir la description du scénario
function getScenarioDescription(scenario) {
    const descriptions = {
        "SSP1 + RCP1.9": "Ce scénario combine une transition énergétique rapide avec une réduction des inégalités. Il vise à limiter le réchauffement climatique à 1,5°C.",
        "SSP2 + RCP4.5": "Un scénario intermédiaire avec une croissance économique stable, mais une dépendance persistante aux énergies fossiles.",
        "SSP3 + RCP6.0": "Ce scénario est marqué par des conflits régionaux et une exploitation accrue des ressources naturelles.",
        "SSP5 + RCP8.5": "Un scénario de forte croissance économique basée sur les énergies fossiles, avec des conséquences climatiques désastreuses.",
    };
    return descriptions[scenario] || "Description non disponible.";
}

// Fonction pour obtenir des données fictives pour le graphique des performances
function getScenarioData(scenario) {
    const data = {
        "SSP1 + RCP1.9": [5, 7, 8, 6, 4, 7, 6, 5],
        "SSP2 + RCP4.5": [6, 6, 7, 5, 5, 6, 5, 6],
        "SSP3 + RCP6.0": [7, 5, 6, 4, 6, 5, 4, 7],
        "SSP5 + RCP8.5": [8, 4, 5, 3, 7, 4, 3, 8],
    };
    return data[scenario] || [0, 0, 0, 0, 0, 0, 0, 0];
}

// Fonction pour mettre à jour le graphique des performances (histogramme vertical)
function updateScenarioChart(data) {
    console.log("Données pour le graphique des performances :", data);
    const ctx = document.getElementById("scenarioChart").getContext("2d");

    // Détruire le graphique existant s'il y en a un
    if (window.scenarioChart && typeof window.scenarioChart.destroy === "function") {
        window.scenarioChart.destroy();
    }

    // Créer un nouveau graphique (histogramme vertical)
    window.scenarioChart = new Chart(ctx, {
        type: "bar", // Type de graphique : bar (vertical par défaut)
        data: {
            labels: ["Décisions clés", "Économie", "Social", "Climat/Santé", "Opinion publique", "Pression des lobbies", "Coût de la vie", "Attractivité pour les décideurs"],
            datasets: [
                {
                    label: "Performance",
                    data: data,
                    backgroundColor: "rgba(75, 192, 192, 0.2)", // Couleur de fond des barres
                    borderColor: "rgba(75, 192, 192, 1)", // Couleur de bordure des barres
                    borderWidth: 1, // Épaisseur de la bordure
                },
            ],
        },
        options: {
            indexAxis: "x", // Axe des labels en X (vertical)
            scales: {
                x: {
                    beginAtZero: true, // Commencer à zéro
                    title: {
                        display: true,
                        text: "Performance", // Titre de l'axe X
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: "Catégories", // Titre de l'axe Y
                    },
                },
            },
            responsive: true, // Adapter le graphique à la taille du conteneur
            maintainAspectRatio: false, // Ne pas maintenir le ratio d'aspect
            plugins: {
                legend: {
                    display: true, // Afficher la légende
                    position: "top", // Position de la légende
                },
            },
        },
    });
}

// Fonction pour mettre à jour le drapeau en arrière-plan
function updateCountryFlag(country) {
    const flagBackground = document.querySelector('.country-flag-background');
    if (flagBackground) {
        // Nettoyer le nom du pays pour correspondre au nom du fichier
        const normalizedCountry = country
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
            .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
            .toLowerCase();

        // Mettre à jour l'attribut data-country
        flagBackground.setAttribute('data-country', country);
        console.log(normalizedCountry)
        // Mettre à jour l'image de fond
        console.log(`Chemin du drapeau : images/flags/${normalizedCountry}.svg`);
        flagBackground.style.backgroundImage = `url('images/flags/${normalizedCountry}.svg')`;
    }
}

// Fonction pour mettre à jour le graphique d'évolution des scénarios
function updateScenarioEvolutionChart(scenario) {
    console.log("Mise à jour du graphique d'évolution pour le scénario :", scenario);

    const scenarioData = {
        "SSP1 + RCP1.9": {
            emissions: [100, 80, 60, 40, 20, 10, 5, 0, -10, -20],
            temperature: [1.0, 1.2, 1.3, 1.4, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5],
            economy: [100, 110, 120, 130, 140, 150, 160, 170, 180, 190],
            deforestation: [100, 80, 60, 40, 20, 10, 5, 0, -10, -20],
        },
        "SSP2 + RCP4.5": {
            emissions: [100, 95, 90, 85, 80, 75, 70, 65, 60, 55],
            temperature: [1.0, 1.3, 1.6, 1.9, 2.2, 2.5, 2.8, 3.1, 3.4, 3.7],
            economy: [100, 105, 110, 115, 120, 125, 130, 135, 140, 145],
            deforestation: [100, 95, 90, 85, 80, 75, 70, 65, 60, 55],
        },
        "SSP3 + RCP6.0": {
            emissions: [100, 98, 96, 94, 92, 90, 88, 86, 84, 82],
            temperature: [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5],
            economy: [100, 102, 104, 106, 108, 110, 112, 114, 116, 118],
            deforestation: [100, 98, 96, 94, 92, 90, 88, 86, 84, 82],
        },
        "SSP5 + RCP8.5": {
            emissions: [100, 105, 110, 115, 120, 125, 130, 135, 140, 145],
            temperature: [1.0, 1.8, 2.6, 3.4, 4.2, 5.0, 5.8, 6.6, 7.4, 8.2],
            economy: [100, 110, 120, 130, 140, 150, 160, 170, 180, 190],
            deforestation: [100, 105, 110, 115, 120, 125, 130, 135, 140, 145],
        },
    };

    const data = scenarioData[scenario] || {
        emissions: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        temperature: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        economy: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        deforestation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    };

    console.log("Données récupérées pour le scénario :", data);
    console.log("Données de déforestation :", data.deforestation);

    const ctx = document.getElementById("scenarioEvolutionChart").getContext("2d");

    // Détruire le graphique existant s'il y en a un
    if (window.scenarioEvolutionChart && typeof window.scenarioEvolutionChart.destroy === "function") {
        window.scenarioEvolutionChart.destroy();
    }

    // Créer un nouveau graphique avec trois axes Y
    window.scenarioEvolutionChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: ["2025", "2035", "2045", "2055", "2065", "2075", "2085", "2095", "2100"],
            datasets: [
                {
                    label: "Réduction des émissions de GES (%)",
                    data: data.emissions,
                    borderColor: "rgba(255, 99, 132, 1)", // Rouge
                    borderWidth: 2,
                    fill: false,
                    yAxisID: "y",
                },
                {
                    label: "Élévation des températures (°C)",
                    data: data.temperature,
                    borderColor: "rgba(54, 162, 235, 1)", // Bleu
                    borderWidth: 2,
                    fill: false,
                    yAxisID: "y2",
                },
                {
                    label: "Croissance économique mondiale (%)",
                    data: data.economy,
                    borderColor: "rgba(75, 192, 192, 1)", // Vert
                    borderWidth: 2,
                    fill: false,
                    yAxisID: "y",
                },
                {
                    label: "Déforestation (%)",
                    data: data.deforestation,
                    borderColor: "rgba(255, 159, 64, 1)", // Orange
                    borderWidth: 2,
                    fill: false,
                    yAxisID: "y3",
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: "Valeur (%)",
                    },
                    position: "left",
                },
                y2: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: "Température (°C)",
                        color: "rgba(54, 162, 235, 1)", // Bleu
                    },
                    position: "right",
                    grid: {
                        drawOnChartArea: false,
                    },
                    min: 1,
                    max: 10,
                },
                y3: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: "Déforestation (%)",
                        color: "rgba(255, 159, 64, 1)", // Orange
                    },
                    position: "right",
                    grid: {
                        drawOnChartArea: false,
                    },
                    offset: true, // Décalage pour éviter les chevauchements
                },
                x: {
                    title: {
                        display: true,
                        text: "Année",
                    },
                },
            },
        },
    });

    console.log("Graphique d'évolution des scénarios mis à jour.");
}

// Fonction pour initialiser la carte Leaflet
let map;

function initMap() {
    map = L.map("country-map").setView([-22.952046738925542, -42.50361690962444], 5); // Vue initiale centrée sur le monde

    // Ajouter la couche de tuile satellite ArcGIS
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Tiles © Esri",
    }).addTo(map);

    console.log("Carte Leaflet initialisée.");
}

// Variable globale pour stocker la promesse de la dernière mise à jour
let lastUpdatePromise = Promise.resolve();
let countryLayer = null;

function updateMap(country, scenario) {
    // Attendre que la mise à jour précédente soit terminée avant d'en commencer une nouvelle
    lastUpdatePromise = lastUpdatePromise
        .then(() => {
            // Supprimer la couche précédente si elle existe
            if (countryLayer) {
                console.log("Suppression de la couche précédente de la carte.");
                map.removeLayer(countryLayer);
                countryLayer = null;
            }

            // Retourner la promesse du fetch pour chaîner
            return fetch("data/pays.json");
        })
        .then((response) => response.json())
        .then((geojsonData) => {
            const countryFeature = geojsonData.features.find(
                (feature) => feature.properties.nom === country
            );

            if (countryFeature) {
                const scenarioColors = {
                    "SSP1 + RCP1.9": "blue",
                    "SSP2 + RCP4.5": "green",
                    "SSP3 + RCP6.0": "red",
                    "SSP5 + RCP8.5": "black",
                };
                const color = scenarioColors[scenario] || "gray";

                countryLayer = L.geoJSON(countryFeature, {
                    style: {
                        fillColor: color,
                        fillOpacity: 0.5,
                        color: color,
                        weight: 2,
                    },
                }).addTo(map);

                // Obtenir les limites du pays
                const bounds = countryLayer.getBounds();

                // Calculer le centre exact du pays
                const center = bounds.getCenter();

                // Calculer la taille du pays
                const countryWidth = bounds.getEast() - bounds.getWest();
                const countryHeight = bounds.getNorth() - bounds.getSouth();

                // Calculer le niveau de zoom optimal basé sur la taille du pays
                const paddingFactor = 0.1; // 10% de padding autour du pays
                const widthZoom = Math.log2(360 / (countryWidth * (1 + paddingFactor)));
                const heightZoom = Math.log2(180 / (countryHeight * (1 + paddingFactor)));
                const optimalZoom = Math.min(widthZoom, heightZoom);

                // Ajuster les limites avec un padding
                const paddedBounds = bounds.pad(paddingFactor);

                // Options de fitBounds pour un centrage plus doux
                const fitBoundsOptions = {
                    padding: [50, 50], // Padding en pixels
                    maxZoom: Math.min(optimalZoom, 8), // Limiter le zoom maximum
                    animate: true, // Animation de transition
                    duration: 1.0, // Durée de l'animation en secondes
                    easeLinearity: 0.5 // Fonction d'ease pour l'animation
                };

                // Appliquer le centrage avec animation
                map.fitBounds(paddedBounds, fitBoundsOptions);


                countryLayer
                    .bindPopup(
                        `<b>${country}</b><br>Scénario: ${scenario}<br>Détails supplémentaires à ajouter`
                    )
                    .openPopup();
            } else {
                console.error("Pays non trouvé dans le fichier GeoJSON.");
            }
        })
        .catch((error) => {
            console.error("Erreur lors du chargement du fichier GeoJSON :", error);
            // S'assurer que lastUpdatePromise est toujours résolue même en cas d'erreur
        });

    // Retourner la promesse pour permettre la synchronisation si nécessaire
    return lastUpdatePromise;
}

// Fonction pour mettre à jour le radar chart
function updateRadarChart(data) {
    console.log("Données pour le radar chart :", data);
    const ctx = document.getElementById("radarChart").getContext("2d");

    // Détruire le graphique existant s'il y en a un
    if (window.radarChart && typeof window.radarChart.destroy === "function") {
        window.radarChart.destroy();
    }

    // Créer un nouveau radar chart
    window.radarChart = new Chart(ctx, {
        type: "radar",
        data: {
            labels: ["Décisions clés", "Économie", "Social", "Climat/Santé", "Opinion publique", "Pression des lobbies", "Coût de la vie", "Attractivité pour les décideurs"],
            datasets: [
                {
                    label: "Performance",
                    data: data,
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            scale: {
                ticks: {
                    beginAtZero: true,
                    max: 10,
                },
            },
        },
    });
}

// Fonction pour mettre à jour la description du scénario
function updateDescription(description, tableId) {
    console.log("Description du scénario :", description);
    const tableBody = document.querySelector(`#${tableId} tbody`);
    if (!tableBody) {
        console.error(`Table body with ID ${tableId} not found.`);
        return;
    }
    tableBody.innerHTML = ""; // Vider le tableau avant de le remplir

    // Liste des clés originales à afficher dans le tableau
    const originalKeys = [
        "Décisions clés",
        "Économie",
        "Social",
        "Climat/Santé",
        "Opinion publique",
        "Pression des lobbies",
        "Coût de la vie",
        "Attractivité pour les décideurs",
    ];

    // Ajouter uniquement les données originales dans le tableau
    for (const key of originalKeys) {
        if (description[key]) {
            const row = document.createElement("tr");
            const paramCell = document.createElement("td");
            const valueCell = document.createElement("td");

            paramCell.textContent = key;
            valueCell.textContent = description[key];

            row.appendChild(paramCell);
            row.appendChild(valueCell);
            tableBody.appendChild(row);
        }
    }
}

// Fonction pour mettre à jour le graphique des émissions de CO2
function updateCO2Chart(peakYear, reductionYear, reductionPercentage, deforestationReduction, reforestationRate) {
    console.log("Mise à jour du graphique des émissions de CO2 :", peakYear, reductionYear, reductionPercentage, deforestationReduction, reforestationRate);
    const ctx = document.getElementById("co2Chart").getContext("2d");

    // Détruire le graphique existant s'il y en a un
    if (window.co2Chart && typeof window.co2Chart.destroy === "function") {
        window.co2Chart.destroy();
    }

    // Générer des données pour le graphique
    const years = [];
    const emissions = [];
    const deforestation = [];
    const reforestation = [];
    let currentEmission = 100; // Valeur de base pour les émissions (100%)
    let currentDeforestation = 100; // Valeur de base pour la déforestation (100%)
    let currentReforestation = 0; // Valeur de base pour le reboisement (0%)

    for (let year = 2025; year <= 2060; year++) {
        years.push(year);

        // Calcul des émissions de CO2
        if (year <= peakYear) {
            currentEmission += 2; // Augmentation de 2% par an
        } else if (year <= reductionYear) {
            currentEmission += 0; // Stabilisation
        } else {
            currentEmission -= reductionPercentage / (2060 - reductionYear); // Réduction linéaire
        }
        emissions.push(currentEmission);

        // Calcul du recul de la déforestation
        if (year <= peakYear) {
            currentDeforestation += 1; // Augmentation de 1% par an
        } else {
            currentDeforestation -= deforestationReduction / (2060 - peakYear); // Réduction linéaire
        }
        deforestation.push(currentDeforestation);

        // Calcul du reboisement
        if (year >= peakYear) {
            currentReforestation += reforestationRate / (2060 - peakYear); // Augmentation linéaire
        }
        reforestation.push(currentReforestation);
    }

    // Créer un nouveau graphique
    window.co2Chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: years,
            datasets: [
                {
                    label: "Émissions de CO2 (%)",
                    data: emissions,
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 2,
                    fill: false,
                },
                {
                    label: "Recul de la déforestation (%)",
                    data: deforestation,
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 2,
                    fill: false,
                },
                {
                    label: "Reboisement (%)",
                    data: reforestation,
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 2,
                    fill: false,
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: "Valeur (%)",
                    },
                },
                x: {
                    title: {
                        display: true,
                        text: "Année",
                    },
                },
            },
        },
    });
}

// Fonction pour charger un scénario
function loadScenario(scenario) {
    console.log("Scénario chargé :", scenario);
    fetch("data/countries.json")
        .then((response) => response.json())
        .then((data) => {
            console.log("Données chargées :", data);
            const country = document.getElementById("country-select").value;
            const countryData = data[country][scenario];
            if (countryData) {
                updateRadarChart(countryData.data);
                updateDescription(countryData.description, "country-description-table"); // Utiliser le bon ID

                // Mettre à jour le graphique des émissions de CO2
                const peakYear = countryData.description["Année de pic des émissions"];
                const reductionYear = countryData.description["Année de réduction"];
                const reductionPercentage = countryData.description["% de réduction"];
                const deforestationReduction = countryData.description["Réduction de la déforestation (% par an)"];
                const reforestationRate = countryData.description["Surfaces reboisées (% par an)"];
                updateCO2Chart(peakYear, reductionYear, reductionPercentage, deforestationReduction, reforestationRate);

                // Mettre à jour la carte
                updateMap(country, scenario);
                updateCountryFlag(country);
            } else {
                console.error("Données non trouvées pour le pays et le scénario sélectionnés.");
            }
        })
        .catch((error) => console.error("Erreur lors du chargement des données :", error));
}

// Fonction pour mettre à jour les informations sur les États
function updateStateInfo() {
    const stateName = document.getElementById('state-select').value;
    const tableBody = document.querySelector('#state-info-table tbody');

    // Vider le tableau actuel
    tableBody.innerHTML = '';

    // Mettre à jour le drapeau en arrière-plan
    updateCountryFlag(stateName);

    // Récupérer les données de l'état sélectionné depuis etats.json
    fetch('data/etats.json')
        .then(response => response.json())
        .then(data => {
            const stateData = data.find(state => state.Pays === stateName);

            if (stateData) {
                // Créer les lignes du tableau pour chaque propriété
                Object.entries(stateData).forEach(([key, value]) => {
                    if (key !== 'Pays') { // Exclure la clé "Pays" car elle est déjà affichée dans le sélecteur
                        const row = document.createElement('tr');
                        const keyCell = document.createElement('td');
                        const valueCell = document.createElement('td');

                        keyCell.textContent = key;
                        valueCell.textContent = value;

                        row.appendChild(keyCell);
                        row.appendChild(valueCell);
                        tableBody.appendChild(row);
                    }
                });

                // Mettre à jour les graphiques
                updatePopulationEmissionsChart(stateData);
                updateRanksChart(stateData);
                updateGesSectorsChart(stateData);
            } else {
                // Afficher un message si l'état n'est pas trouvé
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.colSpan = 2;
                cell.textContent = 'Données non disponibles pour cet État';
                row.appendChild(cell);
                tableBody.appendChild(row);
            }
        })
        .catch(error => {
            console.error('Erreur lors du chargement des données:', error);
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 2;
            cell.textContent = 'Erreur lors du chargement des données';
            row.appendChild(cell);
            tableBody.appendChild(row);
        });
}

function updatePopulationEmissionsChart(stateData) {
    const ctx = document.getElementById('populationEmissionsChart').getContext('2d');

    // Détruire le graphique existant s'il y en a un
    if (window.populationEmissionsChart && typeof window.populationEmissionsChart.destroy === 'function') {
        window.populationEmissionsChart.destroy();
    }

    // Extraire les valeurs numériques
    const populationMatch = stateData['Population'].match(/(\d+(\.\d+)?) millions?/);
    const population = populationMatch ? parseFloat(populationMatch[1]) : 0;

    const emissionsMatch = stateData['Émissions de GES'].match(/(\d+(\.\d+)?) tonnes?/);
    const emissions = emissionsMatch ? parseFloat(emissionsMatch[1]) : 0;

    // Créer un nouveau graphique avec des échelles proportionnelles
    window.populationEmissionsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Population (millions)', 'Émissions de GES (tonnes CO2eq)'],
            datasets: [{
                label: 'Population (millions)',
                data: [population, null], // Population
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                yAxisID: 'y-axis-population' // Premier axe pour la population
            }, {
                label: 'Émissions de GES (tonnes CO2eq)',
                data: [null, emissions], // Émissions de GES
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                yAxisID: 'y-axis-emissions' // Second axe pour les émissions de GES
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    id: 'y-axis-population',
                    type: 'linear',
                    position: 'left',
                    scaleLabel: {
                        display: true,
                        labelString: 'Population (millions)'
                    },
                    ticks: {
                        beginAtZero: true,
                        max: 1400 // Population maximale (Chine : 1400 millions)
                    }
                }, {
                    id: 'y-axis-emissions',
                    type: 'linear',
                    position: 'right',
                    scaleLabel: {
                        display: true,
                        labelString: 'Émissions de GES (tonnes CO2eq)'
                    },
                    ticks: {
                        beginAtZero: true,
                        max: 30 // Émissions maximales (Émirats Arabes Unis : 29,3 tonnes)
                    },
                    gridLines: {
                        drawOnChartArea: false // Ne pas dessiner les lignes de grille pour le second axe
                    }
                }]
            },
            plugins: {
                datalabels: {
                    anchor: 'center',
                    align: 'center',
                    formatter: function(value, context) {
                        return value !== null ? value.toFixed(2) : '';
                    },
                    color: 'black',
                    font: {
                        weight: 'bold',
                        size: 12
                    },
                    clip: false
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// Fonction pour mettre à jour le graphique de comparaison des rangs
function updateRanksChart(stateData) {
    const ctx = document.getElementById('ranksChart').getContext('2d');

    // Détruire le graphique existant s'il y en a un
    if (window.ranksChart && typeof window.ranksChart.destroy === 'function') {
        window.ranksChart.destroy();
    }

    // Extraire les valeurs numériques
    const pibRank = parseFloat(stateData['PIB par habitant'].match(/\d+/)[0]);
    const idhRank = parseFloat(stateData['IDH'].match(/\d+/)[0]);
    const vulnerabilityRank = parseFloat(stateData['Vulnérabilité'].match(/\d+/)[0]);

    // Créer un nouveau graphique
    window.ranksChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['PIB par habitant', 'IDH', 'Vulnérabilité'],
            datasets: [{
                label: 'Rangs',
                data: [pibRank, idhRank, vulnerabilityRank],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateGesSectorsChart(stateData) {
    const ctx = document.getElementById('gesSectorsChart').getContext('2d');

    // Nettoyage du graphique existant
    if (window.gesSectorsChart && typeof window.gesSectorsChart.destroy === 'function') {
        window.gesSectorsChart.destroy();
    }

    // Extraction et normalisation des données des secteurs
    const sectorsString = stateData['Secteurs Émetteurs de GES'];

    // Normalisation et parsing des secteurs
    let sectorsArray = sectorsString
        .split(',')
        .map(sector => {
            const cleanSector = sector.trim();
            const [name, percentageStr] = cleanSector.split(':').map(s => s.trim());
            const percentage = parseFloat(percentageStr.replace('%', ''));

            return {
                name: name,
                value: percentage
            };
        });

    // Trier par valeur décroissante et prendre les 3 premiers secteurs
    sectorsArray.sort((a, b) => b.value - a.value);
    const topSectors = sectorsArray.slice(0, 3);

    // Séparer les labels et les données pour Chart.js
    const labels = topSectors.map(sector => sector.name);
    const data = topSectors.map(sector => sector.value);

    // Création du nouveau graphique circulaire
    window.gesSectorsChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Top 3 des Secteurs Émetteurs de GES',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)'
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
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: `Top 3 des Secteurs Émetteurs de GES - ${stateData.Pays}`
                },
                datalabels: {
                    color: '#000',
                    font: {
                        weight: 'bold',
                        size: 16
                    },
                    formatter: (value, ctx) => {
                        return `${value}%`;
                    },
                    // Placement des étiquettes au centre de chaque portion
                    anchor: 'center',
                    align: 'center',
                    offset: 0,
                    // Ajustement de la rotation pour une meilleure lisibilité
                    rotation: (ctx) => {
                        const angle = (ctx.startAngle + ctx.endAngle) / 2;
                        // Ajuster la rotation pour que le texte soit toujours lisible
                        return angle > Math.PI ? angle + Math.PI : angle;
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}


document.addEventListener("DOMContentLoaded", () => {
    initMap();
    showTab("scenario-tab"); // Afficher l'onglet "Scénario" par défaut

    // Charger le Scénario 1 du Brésil par défaut
    const defaultScenario = "SSP1 + RCP1.9";
    const defaultCountry = "Brésil";

    // Mettre à jour les éléments visuels
    showScenario(defaultScenario); // Afficher le scénario par défaut
    document.getElementById("country-select").value = defaultCountry; // Sélectionner le Brésil
    loadScenario(defaultScenario); // Charger les données du Brésil pour le scénario par défaut
    updateCountryFlag("Brésil");
    updateStateInfo(); // Mettre à jour les informations de l'état par défaut
});