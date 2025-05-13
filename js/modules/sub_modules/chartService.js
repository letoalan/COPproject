//chartService.js
import {
    labels,
    BAU_TEMP_INCREASE,
    MIN_TEMP_INCREASE,
    BAU_CUMULATIVE,
    BAU_EMISSIONS_2100,
    CARBON_SENSITIVITY,
    CARBON_BUDGET_1_5C,
    CARBON_BUDGET_2C,
    totalWorldPopulation,
    displayOrder
} from './config.js';
import { countryData } from './dataService.js';


export let emissionsChart, temperatureChart;

// Initialisation des graphiques
export function initializeCharts() {
    if (!document.getElementById('emissionsChart') || !document.getElementById('temperatureChart')) {
        throw new Error("Canvas elements not found");
    }
    emissionsChart = createEmissionsChart();
    temperatureChart = createTemperatureChart();
    setupChartPlugins();
    createCustomLegend();
}

// Mise à jour des graphiques
export function updateCharts() {
    updateEmissionsData();
    emissionsChart.update();
    updateTemperatureProjection();
}

// Création du graphique des émissions
function createEmissionsChart() {
    return new Chart(document.getElementById("emissionsChart"), {
        type: "line",
        data: getEmissionsChartData(),
        options: getEmissionsChartOptions()
    });
}

// Création du graphique de température
function createTemperatureChart() {
    return new Chart(document.getElementById("temperatureChart"), {
        type: "line",
        data: getTemperatureChartData(),
        options: getTemperatureChartOptions()
    });
}

// Données pour le graphique des émissions
function getEmissionsChartData() {
    return {
        labels,
        datasets: countryData.map((country, index) => ({
            label: country.name,
            borderColor: country.color,
            backgroundColor: `${country.color}44`,
            fill: false,
            tension: 0.4,
            data: generateTrajectory(
                country.baseEmissions,
                (country.name === "Chine") ? 2080 : 2100,
                (country.name === "Chine") ? 2080 : 2100,
                (country.name === "Chine") ? 5 : 0,
                0,
                0
            )
        }))
    };
}

function getTemperatureChartData() {
    return {
        labels,
        datasets: [{
            label: "Température moyenne (°C)",
            data: labels.map(() => MIN_TEMP_INCREASE), // Commence à 1.2°C
            borderColor: "#d62728",
            backgroundColor: "rgba(255, 204, 204, 0.2)",
            fill: true,
            tension: 0.4
        }]
    };
}

// Options du graphique des émissions
function getEmissionsChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const country = countryData[context.datasetIndex];
                        return `${country.name}: ${context.raw.toFixed(1)} GtCO₂e (${country.population}M hab)`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 10,
                title: { display: true, text: "Émissions GES (GtCO₂e)" }
            },
            x: { title: { display: true, text: "Année" } }
        }
    };
}

// Options du graphique de température
function getTemperatureChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: context => `Température: +${context.raw.toFixed(2)}°C`
                }
            }
        },
        scales: {
            y: {
                min: 1.0,
                max: 4.0,
                title: {
                    display: true,
                    text: "Température °C au-dessus des niveaux préindustriels"
                }
            },
            x: { title: { display: true, text: "Année" } }
        }
    };
}

// Génération des trajectoires d'émissions
export function generateTrajectory(baseEmission, peakYear, reductionYear, reductionRate, deforestation, reforestation) {
    const effectiveReductionYear = Math.max(peakYear, reductionYear);

    return labels.map(year => {
        if (year < peakYear) {
            const growthYears = year - 2025;
            return baseEmission * Math.pow(1.01, growthYears);
        } else if (year < effectiveReductionYear) {
            const peakEmission = baseEmission * Math.pow(1.01, peakYear - 2025);
            return peakEmission;
        } else {
            const peakEmission = baseEmission * Math.pow(1.01, peakYear - 2025);
            const yearsReducing = year - effectiveReductionYear;
            const effectiveReductionRate = Math.min(reductionRate, 95) / 100;
            const remainingEmissionsFactor = Math.pow(1 - effectiveReductionRate, yearsReducing / 5);
            const deforestationFactor = 1 + (deforestation / 200);
            const reforestationFactor = Math.max(0.5, 1 - (reforestation / 150));
            return Math.max(peakEmission * 0.05, peakEmission * remainingEmissionsFactor * deforestationFactor * reforestationFactor);
        }
    });
}

// Mise à jour des données d'émissions
function updateEmissionsData() {
    const rows = document.querySelectorAll("#countryTableBody tr");

    rows.forEach((row, index) => {
        const inputs = row.querySelectorAll("input");
        const peakYear = +inputs[0].value;
        const reductionYear = +inputs[1].value;
        const reductionRate = +inputs[2].value;
        const deforestation = +inputs[3].value;
        const reforestation = +inputs[4].value;

        emissionsChart.data.datasets[index].data = generateTrajectory(
            countryData[index].baseEmissions,
            peakYear,
            reductionYear,
            reductionRate,
            deforestation,
            reforestation
        );
    });
}
export function updateTemperatureProjection() {
    // 1. Calcul des émissions par année avec leur profil réel
    const yearlyEmissions = calculateRealEmissionsProfile();

    // 2. Calcul de la température avec réponse dynamique
    const tempProjection = calculateDynamicTemperature(yearlyEmissions);

    // 3. Mise à jour du graphique
    temperatureChart.data.datasets[0].data = tempProjection;
    temperatureChart.update();
    updateTemperatureDisplay(tempProjection[tempProjection.length - 1],
        tempProjection.reduce((sum, t) => sum + t, 0));
}

// Calcule le profil réel des émissions année par année
function calculateRealEmissionsProfile() {
    return labels.map((year, yearIdx) => {
        return emissionsChart.data.datasets.reduce((sum, dataset) => {
            return sum + dataset.data[yearIdx];
        }, 0);
    });
}

// Modèle climatique dynamique avec inflexions
function calculateDynamicTemperature(yearlyEmissions) {
    // Utilisation directe de BAU_CUMULATIVE importé depuis config.js
    const CALIBRATION_FACTOR = (BAU_TEMP_INCREASE - MIN_TEMP_INCREASE) / BAU_CUMULATIVE;

    let cumulativeEmissions = 0;
    const tempProjection = [];
    let climateInertia = MIN_TEMP_INCREASE;

    for (let i = 0; i < labels.length; i++) {
        if (i > 0) {
            const deltaYears = labels[i] - labels[i-1];
            cumulativeEmissions += (yearlyEmissions[i-1] + yearlyEmissions[i]) * deltaYears / 2;
        }

        // Vérification du scénario BAU
        const isBAUScenario = countryData.every(country =>
            document.querySelector(`input[data-country-index="${countryData.indexOf(country)}"][data-input-index="1"]`).value === "2100" &&
            document.querySelector(`input[data-country-index="${countryData.indexOf(country)}"][data-input-index="2"]`).value === "0"
        );

        // Forçage à 3.3°C si scénario BAU détecté
        const immediateTemp = isBAUScenario && i === labels.length - 1
            ? BAU_TEMP_INCREASE
            : MIN_TEMP_INCREASE + (cumulativeEmissions * CALIBRATION_FACTOR);

        const currentTemp = (immediateTemp + climateInertia * 2) / 3;
        climateInertia = currentTemp;
        tempProjection.push(currentTemp);
    }

    return tempProjection;
}

// Affichage de la température
function updateTemperatureDisplay(finalTemp, totalEmissions) {
    // 1. Vérification renforcée des éléments
    const tempSummary = document.getElementById('temperatureSummary');

    if (!tempSummary) {
        console.error('Erreur critique: L\'élément #temperatureSummary est introuvable');
        return;
    }

    // 2. Création des éléments s'ils n'existent pas
    if (!tempSummary.querySelector('.temp-value')) {
        tempSummary.innerHTML = `
            <div class="temp-value">+${finalTemp.toFixed(1)}°C</div>
            <div class="budget-info">
                <div>Budget 1.5°C: <span>0%</span></div>
                <div>Budget 2°C: <span>0%</span></div>
            </div>
            <div class="coverage-info">Couverture: 0%</div>
        `;
    }

    // 3. Calculs sécurisés
    const safePopulation = countryData?.reduce((sum, c) => sum + (c?.population || 0), 0) || 1;
    const coverage = ((safePopulation / totalWorldPopulation) * 100).toFixed(1);

    const budgetUsed1_5C = CARBON_BUDGET_1_5C > 0
        ? Math.min((totalEmissions / CARBON_BUDGET_1_5C) * 100, 999)
        : 0;

    const budgetUsed2C = CARBON_BUDGET_2C > 0
        ? Math.min((totalEmissions / CARBON_BUDGET_2C) * 100, 999)
        : 0;

    // 4. Mise à jour garantie
    const tempElement = tempSummary.querySelector('.temp-value');
    const budgetInfo = tempSummary.querySelector('.budget-info');
    const coverageElement = tempSummary.querySelector('.coverage-info');

    if (tempElement) {
        tempElement.textContent = `+${finalTemp.toFixed(1)}°C`;
        tempElement.style.color =
            finalTemp <= 1.5 ? '#1e8a46' :
                finalTemp <= 2.0 ? '#e67e22' : '#c0392b';
    }

    if (budgetInfo) {
        budgetInfo.innerHTML = `
            <div>Budget 1.5°C: <span style="color:${budgetUsed1_5C > 100 ? '#c0392b' : '#1e8a46'}">
                ${Math.floor(budgetUsed1_5C)}%
            </span></div>
            <div>Budget 2°C: <span style="color:${budgetUsed2C > 100 ? '#c0392b' : '#1e8a46'}">
                ${Math.floor(budgetUsed2C)}%
            </span></div>
        `;
    }

    if (coverageElement) {
        coverageElement.textContent = `Couverture: ${coverage}% pop. mondiale`;
    }
}
// Légende personnalisée
function createCustomLegend() {
    const legendContainer = document.getElementById("customLegend");
    legendContainer.innerHTML = '';

    countryData.forEach((country, index) => {
        const div = document.createElement("div");
        const colorBox = document.createElement("span");
        colorBox.style.backgroundColor = country.color;
        div.appendChild(colorBox);
        div.appendChild(document.createTextNode(`${country.name} (${country.population}M)`));
        div.onclick = () => toggleDatasetVisibility(index);
        legendContainer.appendChild(div);
    });
}

// Basculer la visibilité d'un dataset
function toggleDatasetVisibility(index) {
    const meta = emissionsChart.getDatasetMeta(index);
    meta.hidden = meta.hidden === null ? !emissionsChart.data.datasets[index].hidden : null;
    emissionsChart.update();
}

// Dessiner les lignes de seuil
function drawThresholdLine(chart, value, color) {
    const ctx = chart.ctx;
    const yAxis = chart.scales.y;
    const yPos = yAxis.getPixelForValue(value);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, yPos);
    ctx.lineTo(chart.width, yPos);
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.restore();
}

// Configuration des plugins
function setupChartPlugins() {
    Chart.register({
        id: 'thresholdLines',
        beforeDraw: function(chart) {
            if (chart.canvas.id === 'temperatureChart') {
                drawThresholdLine(chart, 1.5, '#1e8a46');
                drawThresholdLine(chart, 2.0, '#e67e22');
            }
        }
    });
}