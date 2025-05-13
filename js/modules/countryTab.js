let currentCountry = "Brésil";
let currentScenario = "SSP1 + RCP1.9";
let radarChart = null;
let co2Chart = null;
let countryMap = null;
let countryLayer = null;
let lastUpdatePromise = Promise.resolve();

export function initCountryTab() {
    console.log("Initialisation du module CountryTab");

    // 1. Initialisation de la carte
    initCountryMap();

    // 2. Configuration des écouteurs d'événements
    setupEventListeners();

    // 3. Chargement initial des données
    return loadCountryData();
}

/* Gestion de la carte */
function initCountryMap() {
    const mapElement = document.getElementById("country-map");
    if (!mapElement) {
        console.error("Element #country-map introuvable");
        return;
    }

    countryMap = L.map(mapElement, {
        zoomControl: false,
        attributionControl: false
    }).setView([-22.952046738925542, -42.50361690962444], 5);

    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Tiles © Esri",
    }).addTo(countryMap);

    L.control.zoom({ position: 'topright' }).addTo(countryMap);
}

async function updateCountryMap() {
    lastUpdatePromise = lastUpdatePromise
        .then(() => {
            // Nettoyage de la couche précédente
            if (countryLayer) {
                countryMap.removeLayer(countryLayer);
                countryLayer = null;
            }

            return fetch("data/pays.json");
        })
        .then(response => {
            if (!response.ok) throw new Error("Erreur de chargement du GeoJSON");
            return response.json();
        })
        .then(geojsonData => {
            const countryFeature = geojsonData.features.find(
                f => f.properties.nom === currentCountry
            );

            if (!countryFeature) {
                throw new Error(`${currentCountry} non trouvé dans le GeoJSON`);
            }

            // Configuration du style selon le scénario
            const scenarioStyles = {
                "SSP1 + RCP1.9": { color: "#2E86AB", fill: "#4169E1" },
                "SSP2 + RCP4.5": { color: "#3A7D44", fill: "#57CC99" },
                "SSP3 + RCP6.0": { color: "#BB0A21", fill: "#D8315B" },
                "SSP5 + RCP8.5": { color: "#2D2D2A", fill: "#4A4A48" }
            };

            const style = scenarioStyles[currentScenario] || {
                color: "#6D6A75",
                fill: "#9B9B9B"
            };

            // Création de la couche pays
            countryLayer = L.geoJSON(countryFeature, {
                style: {
                    fillColor: style.fill,
                    fillOpacity: 0.7,
                    color: style.color,
                    weight: 2,
                    dashArray: '3',
                    opacity: 0.8
                },
                onEachFeature: (feature, layer) => {
                    layer.bindPopup(generatePopupContent());
                }
            }).addTo(countryMap);

            // Centrage optimisé
            const bounds = countryLayer.getBounds();
            const padding = window.innerWidth < 768 ? 0.05 : 0.1;
            const paddedBounds = bounds.pad(padding);

            countryMap.fitBounds(paddedBounds, {
                padding: [30, 30],
                maxZoom: 2,
                animate: true,
                duration: 0.8
            });

            return countryLayer;
        })
        .catch(error => {
            console.error("Erreur dans updateCountryMap:", error);
            throw error;
        });

    return lastUpdatePromise;
}

function generatePopupContent() {
    return `
        <div class="map-popup">
            <h4>${currentCountry}</h4>
            <p><strong>Scénario:</strong> ${currentScenario}</p>
            <div class="map-legend" style="background-color: ${getScenarioColor()};"></div>
        </div>
    `;
}

function getScenarioColor() {
    const colors = {
        "SSP1 + RCP1.9": "#4169E1",
        "SSP2 + RCP4.5": "#57CC99",
        "SSP3 + RCP6.0": "#D8315B",
        "SSP5 + RCP8.5": "#4A4A48"
    };
    return colors[currentScenario] || "#9B9B9B";
}

/* Gestion des données */
async function loadCountryData() {
    try {
        showLoadingState(true);

        const [countryData] = await Promise.all([
            fetchCountryData(),
            updateCountryMap()
        ]);

        if (!countryData) throw new Error("Données introuvables");

        updateCountryInfoTable(countryData.description);
        updateCountryCharts(countryData);
        updateCountryVisuals();

    } catch (error) {
        console.error("Erreur loadCountryData:", error);
        showError(`Échec du chargement: ${error.message}`);
    } finally {
        showLoadingState(false);
    }
}

async function fetchCountryData() {
    try {
        const response = await fetch("data/countries2.json");
        if (!response.ok) throw new Error("Réponse serveur invalide");

        const data = await response.json();
        return data[currentCountry]?.[currentScenario] || null;
    } catch (error) {
        console.error("Erreur fetchCountryData:", error);
        throw error;
    }
}

/* Mises à jour de l'interface */
function updateCountryInfoTable(description) {
    const tableBody = document.querySelector("#country-description-table tbody");
    if (!tableBody) return;

    const indicators = {
        "Année de pic": description["Année de pic des émissions"],
        "Année réduction": description["Année de réduction"],
        "% réduction": `${description["% de réduction"]}%`,
        "Déforestation": `${description["Réduction de la déforestation (% par an)"]}%`,
        "Reboisement": `${description["Surfaces reboisées (% par an)"]}%`,
        "Contribution": `${description["Contribution (Milliards d'Euros)"]} Mrd €`,
        "Aides reçues": `${description["Aides (Milliards d'Euros)"]} Mrd €`
    };

    tableBody.innerHTML = Object.entries(indicators)
        .map(([key, value]) => `
            <tr>
                <td><strong>${key}</strong></td>
                <td>${value}</td>
            </tr>
        `).join("");
}

function updateCountryCharts(data) {
    updateRadarChart(data.data);
    updateCO2Chart(
        data.description["Année de pic des émissions"],
        data.description["Année de réduction"],
        data.description["% de réduction"],
        data.description["Réduction de la déforestation (% par an)"],
        data.description["Surfaces reboisées (% par an)"]
    );
}

function updateRadarChart(performanceData) {
    const ctx = document.getElementById("radarChart");
    if (!ctx) return;

    if (radarChart) radarChart.destroy();

    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: [
                "Décisions clés", "Économie", "Social",
                "Climat/Santé", "Opinion publique",
                "Pression lobbies", "Coût vie", "Attractivité"
            ],
            datasets: [{
                label: 'Performance',
                data: performanceData,
                backgroundColor: 'rgba(46, 134, 171, 0.2)',
                borderColor: 'rgba(46, 134, 171, 1)',
                pointBackgroundColor: 'rgba(46, 134, 171, 1)',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { display: true },
                    suggestedMin: 0,
                    suggestedMax: 10,
                    ticks: {
                        stepSize: 2,
                        backdropColor: 'rgba(0, 0, 0, 0)'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 20
                    }
                }
            }
        }
    });
}

function updateCO2Chart(peakYear, reductionYear, reductionPct, deforestationRate, reforestationRate) {
    const ctx = document.getElementById("co2Chart");
    if (!ctx) return;

    if (co2Chart) co2Chart.destroy();

    const years = Array.from({length: 76}, (_, i) => 2025 + i);

    const emissionsData = years.map(year => {
        if (year <= peakYear) return 100 + (year - 2025) * 2;
        if (year <= reductionYear) return 100 + (peakYear - 2025) * 2;
        return Math.max(0,
            100 + (peakYear - 2025) * 2 - (year - reductionYear) * (reductionPct / (2100 - reductionYear)) * 5
        );
    });

    const deforestationData = years.map(year => {
        const baseline = 100;
        if (year <= peakYear) return baseline + (year - 2025) * 1.5;
        return Math.max(0,
            baseline + (peakYear - 2025) * 1.5 - (year - peakYear) * deforestationRate * 0.7
        );
    });

    const reforestationData = years.map(year => {
        if (year <= peakYear) return 0;
        return Math.min(100,
            (year - peakYear) * reforestationRate * 0.5
        );
    });

    co2Chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Émissions CO₂ (%)',
                    data: emissionsData,
                    borderColor: '#2E86AB',
                    borderWidth: 3,
                    tension: 0.3,
                    pointRadius: 0,
                    yAxisID: 'y'
                },
                {
                    label: 'Déforestation (%)',
                    data: deforestationData,
                    borderColor: '#D8315B',
                    borderWidth: 2,
                    borderDash: [5, 3],
                    tension: 0.2,
                    pointRadius: 0,
                    yAxisID: 'y1'
                },
                {
                    label: 'Reboisement (%)',
                    data: reforestationData,
                    borderColor: '#3A7D44',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}% (${context.label})`;
                        }
                    }
                },
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 20,
                        usePointStyle: true
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Émissions CO₂ (%)',
                        font: {
                            weight: 'bold'
                        }
                    },
                    min: 0,
                    suggestedMax: 150,
                    grid: {
                        color: ctx => ctx.tick.value === 0 ? '#888' : '#eee'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Déforestation/Reboisement (%)',
                        font: {
                            weight: 'bold'
                        }
                    },
                    min: 0,
                    max: 150,
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Année',
                        font: {
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 10,
                        callback: function(value) {
                            return value % 5 === 0 ? value : '';
                        }
                    },
                    grid: {
                        color: ctx => ctx.tick.value % 10 === 0 ? '#ddd' : '#f5f5f5'
                    }
                }
            },
            elements: {
                line: {
                    cubicInterpolationMode: 'monotone'
                }
            }
        }
    });
}

function updateCountryVisuals() {
    const tab = document.getElementById('country-tab');
    if (!tab || tab.style.display !== 'block') {
        console.warn('[countryTab] Onglet country-tab non visible, report de la mise à jour visuelle');
        return;
    }

    const flagElement = document.querySelector('#country-tab .country-flag-background');
    if (!flagElement) {
        console.error('[countryTab] Élément .country-flag-background introuvable dans #country-tab');
        return;
    }

    const normalizedName = currentCountry
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '-')
        .toLowerCase();

    const flagUrl = `medias/images/flags/${normalizedName}.svg`;
    console.log(`[countryTab] Mise à jour du drapeau pour ${currentCountry}: ${flagUrl}`);

    // Vérifier si l'image existe
    const img = new Image();
    img.onload = () => {
        flagElement.style.backgroundImage = `url('${flagUrl}')`;
        console.log(`[countryTab] Drapeau chargé avec succès: ${flagUrl}`);
    };
    img.onerror = () => {
        console.error(`[countryTab] Échec du chargement du drapeau: ${flagUrl}`);
        flagElement.style.backgroundImage = `url('medias/images/flags/default.svg')`; // Image de secours
        showError(`Drapeau pour ${currentCountry} introuvable`);
    };
    img.src = flagUrl;

    updateActiveScenarioButton();
}

/* Utilitaires */
function setupEventListeners() {
    document.querySelector('button[data-tab="country-tab"]')?.addEventListener('click', showCountryTab);

    document.getElementById("country-select")?.addEventListener("change", (e) => {
        currentCountry = e.target.value;
        loadCountryData();
    });

    document.querySelectorAll("#country-tab-buttons button").forEach(btn => {
        btn.addEventListener("click", () => {
            currentScenario = btn.getAttribute("data-scenario");
            loadCountryData();
        });
    });
}

function showCountryTab() {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });

    const tab = document.getElementById("country-tab");
    if (tab) {
        tab.style.display = 'block';
        updateActiveScenarioButton();
        if (countryMap) setTimeout(() => countryMap.invalidateSize(), 100);
        // Forcer la mise à jour des visuels après l'affichage
        setTimeout(() => updateCountryVisuals(), 100);
    }
}

function updateActiveScenarioButton() {
    document.querySelectorAll("#country-tab-buttons button").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-scenario") === currentScenario);
    });
}

function showLoadingState(show) {
    const loader = document.getElementById("country-loading-state");
    if (loader) loader.style.display = show ? 'block' : 'none';
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <span>⚠️ ${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    document.getElementById('country-tab').prepend(errorDiv);
}