let scenarioChart = null;
let scenarioEvolutionChart = null;

export function initScenarioTab() {
    console.log("Initialisation du module ScenarioTab");

    // 1. Gestion de l'onglet principal dans le header
    const scenarioTabButton = document.querySelector('header nav button[data-tab="scenario-tab"]');
    if (scenarioTabButton) {
        scenarioTabButton.addEventListener('click', () => {
            // Masquer tous les onglets
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.style.display = 'none';
            });
            // Afficher l'onglet scenario
            document.getElementById('scenario-tab').style.display = 'block';
            // Charger le scénario par défaut
            showScenario("SSP1 + RCP1.9").catch(err => {
                console.error("Erreur lors du chargement initial:", err);
            });
        });
    }

    // 2. Gestion des boutons de scénario
    const scenarioButtons = document.querySelectorAll("#scenario-tab-buttons button[data-scenario]");
    if (scenarioButtons.length === 0) {
        console.warn("Aucun bouton de scénario trouvé");
    } else {
        scenarioButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const scenario = button.getAttribute('data-scenario');
                console.log(`Clic sur scénario: ${scenario}`);
                showScenario(scenario).catch(err => {
                    console.error("Erreur lors du changement de scénario:", err);
                });
            });
        });
    }

    // 3. Initialisation par défaut
    return showScenario("SSP1 + RCP1.9");
}

async function showScenario(scenario) {
    try {
        console.log(`Chargement du scénario: ${scenario}`);

        // 1. Mettre à jour l'interface utilisateur
        updateScenarioUI(scenario);

        // 2. Mettre à jour les graphiques en parallèle
        await Promise.all([
            updateScenarioChart(getScenarioData(scenario)),
            updateScenarioEvolutionChart(scenario)
        ]);

        // 3. Mettre à jour l'état actif des boutons
        updateActiveScenarioButton(scenario);

    } catch (error) {
        console.error("Erreur lors du chargement du scénario:", error);
        throw error;
    }
}

function updateActiveScenarioButton(scenario) {
    document.querySelectorAll("#scenario-tab-buttons button").forEach(button => {
        const isActive = button.getAttribute("data-scenario") === scenario;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-current", isActive ? "true" : "false");
    });
}

function updateScenarioUI(scenario) {
    const scenarioTitle = document.getElementById("scenario-title");
    const scenarioText = document.getElementById("scenario-text");
    const scenarioImage = document.getElementById("scenario-image");

    if (!scenarioTitle || !scenarioText) {
        throw new Error("Éléments textuels du scénario non trouvés");
    }

    scenarioTitle.textContent = scenario;
    scenarioText.textContent = getScenarioDescription(scenario);

    // Gestion de l'image si elle existe
    if (scenarioImage) {
        scenarioImage.style.display = "none";
        const imagePath = `medias/images/scenarios/${scenario.replace(/ /g, "_")}.jpg`;
        scenarioImage.src = imagePath;

        scenarioImage.onload = () => {
            scenarioImage.style.display = "block";
        };

        scenarioImage.onerror = () => {
            console.warn(`Image non trouvée: ${imagePath}`);
            scenarioImage.src = "medias/images/scenarios/default.jpg";
            scenarioImage.style.display = "block";
        };
    }
}

function getScenarioDescription(scenario) {
    const descriptions = {
        "SSP1 + RCP1.9": "Scénario de développement durable avec forte réduction des émissions. Limite le réchauffement à 1,5°C avec des mesures ambitieuses.",
        "SSP2 + RCP4.5": "Scénario intermédiaire avec des politiques climatiques modérées. Réchauffement estimé à 2-3°C d'ici 2100.",
        "SSP3 + RCP6.0": "Scénario de fragmentation régionale avec des défis climatiques importants. Réchauffement estimé à 3-4°C.",
        "SSP5 + RCP8.5": "Scénario de forte dépendance aux énergies fossiles. Réchauffement pouvant atteindre 4-5°C avec impacts sévères."
    };
    return descriptions[scenario] || "Description non disponible pour ce scénario.";
}

function getScenarioData(scenario) {
    const data = {
        "SSP1 + RCP1.9": [9, 8, 7, 9, 8, 7, 8, 9],
        "SSP2 + RCP4.5": [7, 6, 6, 7, 6, 6, 7, 6],
        "SSP3 + RCP6.0": [5, 5, 4, 5, 4, 5, 4, 5],
        "SSP5 + RCP8.5": [4, 3, 4, 3, 4, 3, 4, 3]
    };
    return data[scenario] || [5, 5, 5, 5, 5, 5, 5, 5];
}

function updateScenarioChart(data) {
    const ctx = document.getElementById("scenarioChart");
    if (!ctx) throw new Error("Canvas scenarioChart non trouvé");

    if (scenarioChart) scenarioChart.destroy();

    scenarioChart = new Chart(ctx.getContext('2d'), {
        type: "bar",
        data: {
            labels: [
                "Décisions politiques",
                "Transition énergétique",
                "Innovation technologique",
                "Acceptation sociale",
                "Résilience économique",
                "Coopération internationale",
                "Protection environnementale",
                "Qualité de vie"
            ],
            datasets: [{
                label: "Performance du scénario",
                data: data,
                backgroundColor: "rgba(75, 192, 192, 0.7)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    title: {
                        display: true,
                        text: "Score (sur 10)"
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${context.raw}/10`
                    }
                }
            }
        }
    });
}
function getScenarioEvolutionData(scenario) {
    const scenarioData = {
        "SSP1 + RCP1.9": {
            emissions: [100, 80, 60, 40, 20, 10, 5, 0, -10, -20],
            temperature: [1.0, 1.2, 1.3, 1.4, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5],
            economy: [100, 110, 120, 130, 140, 150, 160, 170, 180, 190],
            deforestation: [100, 80, 60, 40, 20, 10, 5, 0, -10, -20]
        },
        "SSP2 + RCP4.5": {
            emissions: [100, 95, 90, 85, 80, 75, 70, 65, 60, 55],
            temperature: [1.0, 1.3, 1.6, 1.9, 2.2, 2.5, 2.8, 3.1, 3.4, 3.7],
            economy: [100, 105, 110, 115, 120, 125, 130, 135, 140, 145],
            deforestation: [100, 95, 90, 85, 80, 75, 70, 65, 60, 55]
        },
        "SSP3 + RCP6.0": {
            emissions: [100, 98, 96, 94, 92, 90, 88, 86, 84, 82],
            temperature: [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5],
            economy: [100, 102, 104, 106, 108, 110, 112, 114, 116, 118],
            deforestation: [100, 98, 96, 94, 92, 90, 88, 86, 84, 82]
        },
        "SSP5 + RCP8.5": {
            emissions: [100, 105, 110, 115, 120, 125, 130, 135, 140, 145],
            temperature: [1.0, 1.8, 2.6, 3.4, 4.2, 5.0, 5.8, 6.6, 7.4, 8.2],
            economy: [100, 110, 120, 130, 140, 150, 160, 170, 180, 190],
            deforestation: [100, 105, 110, 115, 120, 125, 130, 135, 140, 145]
        }
    };

    return scenarioData[scenario] || {
        emissions: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        temperature: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        economy: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        deforestation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    };
}

function updateScenarioEvolutionChart(scenario) {
    const ctx = document.getElementById("scenarioEvolutionChart");
    if (!ctx) {
        console.error("Canvas scenarioEvolutionChart non trouvé");
        return;
    }

    if (scenarioEvolutionChart) {
        scenarioEvolutionChart.destroy();
    }

    const data = getScenarioEvolutionData(scenario);
    const labels = ["2025", "2035", "2045", "2055", "2065", "2075", "2085", "2095", "2100"];

    // Ajuster les données pour qu'elles correspondent aux labels (9 points au lieu de 10)
    const adjustedData = {
        emissions: data.emissions.slice(0, 9),
        temperature: data.temperature.slice(0, 9),
        economy: data.economy.slice(0, 9),
        deforestation: data.deforestation.slice(0, 9)
    };

    scenarioEvolutionChart = new Chart(ctx.getContext('2d'), {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Émissions de GES (%)",
                    data: adjustedData.emissions,
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 3,
                    tension: 0.4,
                    yAxisID: "y"
                },
                {
                    label: "Température (°C)",
                    data: adjustedData.temperature,
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 3,
                    tension: 0.4,
                    yAxisID: "y2"
                },
                {
                    label: "Croissance économique (%)",
                    data: adjustedData.economy,
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 2,
                    tension: 0.4,
                    yAxisID: "y",
                    borderDash: [5, 5]
                },
                {
                    label: "Déforestation (%)",
                    data: adjustedData.deforestation,
                    borderColor: "rgba(255, 159, 64, 1)",
                    borderWidth: 2,
                    tension: 0.4,
                    yAxisID: "y3"
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
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Émissions/Croissance (%)',
                        font: {
                            weight: 'bold'
                        }
                    },
                    min: -30,
                    max: 200,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y2: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Température (°C)',
                        color: 'rgba(54, 162, 235, 1)',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        drawOnChartArea: false
                    },
                    min: 0,
                    max: 10,
                    ticks: {
                        color: 'rgba(54, 162, 235, 1)'
                    }
                },
                y3: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Déforestation (%)',
                        color: 'rgba(255, 159, 64, 1)',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        drawOnChartArea: false
                    },
                    min: -30,
                    max: 150,
                    offset: true,
                    ticks: {
                        color: 'rgba(255, 159, 64, 1)'
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
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.datasetIndex === 1) { // Température
                                label += context.raw.toFixed(1) + '°C';
                            } else { // Autres indicateurs
                                label += context.raw + '%';
                            }
                            return label;
                        }
                    }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 20,
                        font: {
                            size: 12
                        },
                        usePointStyle: true
                    }
                }
            },
            elements: {
                point: {
                    radius: 4,
                    hoverRadius: 6
                }
            }
        }
    });
}