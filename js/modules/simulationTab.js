let generalClimateChart = null;

/**
 * Module de gestion des onglets de simulation
 * @module simulationTab
 */
export function initSimulationTab() {
    console.log('[simulationTab] Initialisation du module simulationTab');

    const container = document.getElementById('simulation-tab');
    if (!container) {
        console.error('[simulationTab] Conteneur simulation-tab introuvable');
        return;
    }

    const sectionButtons = container.querySelectorAll('#simulation-buttons button[data-section]');
    const sections = container.querySelectorAll('.simulation-section');

    // Configurer les gestionnaires de clics
    sectionButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            if (container.style.display !== 'block') return; // Ignorer si l'onglet n'est pas visible
            const sectionId = button.getAttribute('data-section');
            showSection(sectionId);
        });
    });

    // Observer la visibilité de l'onglet
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'style' && container.style.display === 'block') {
                showSection('general');
            }
        });
    });
    observer.observe(container, { attributes: true });

    // Initialisation par défaut si l'onglet est visible
    if (container.style.display === 'block') {
        showSection('general');
    }
}

async function showSection(sectionId) {
    console.log(`[simulationTab] Affichage section: ${sectionId}`);

    try {
        const sections = document.querySelectorAll('.simulation-section');
        const sectionButtons = document.querySelectorAll('#simulation-buttons button[data-section]');

        // Masquer toutes les sections
        sections.forEach((section) => {
            section.classList.remove('active');
            section.style.display = 'none';
        });

        // Afficher la section cible
        const targetSection = document.getElementById(sectionId);
        if (!targetSection) {
            throw new Error(`Section ${sectionId} introuvable`);
        }
        targetSection.classList.add('active');
        targetSection.style.display = 'block';

        // Mettre à jour les boutons
        sectionButtons.forEach((button) => {
            const isActive = button.getAttribute('data-section') === sectionId;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-selected', isActive);
        });

        // Chargements spécifiques
        if (sectionId === 'general') {
            // Attendre un court délai pour s'assurer que le DOM est stable
            setTimeout(() => initGeneralClimateChart(), 100);
        } else if (sectionId === 'etats') {
            await loadAdditionalData();
        }
    } catch (error) {
        console.error('[simulationTab] Erreur dans showSection:', error);
    }
}

async function initGeneralClimateChart() {
    try {
        const ctx = document.getElementById('generalClimateChart');
        if (!ctx) {
            throw new Error('Canvas generalClimateChart introuvable');
        }

        // Vérifier si le canvas est visible
        const section = document.getElementById('general');
        if (!section || section.style.display !== 'block') {
            console.warn('[simulationTab] Section générale non visible, report de l\'initialisation du graphique');
            return;
        }

        // Détruire le graphique existant
        if (generalClimateChart) {
            generalClimateChart.destroy();
            generalClimateChart = null;
        }

        generalClimateChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['2025', '2035', '2045', '2055', '2065', '2075', '2085', '2095', '2100'],
                datasets: [
                    {
                        label: 'SSP1 + RCP1.9 (1.5°C)',
                        data: [1.0, 1.2, 1.3, 1.4, 1.5, 1.5, 1.5, 1.5, 1.5],
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                        tension: 0.1
                    },
                    {
                        label: 'SSP2 + RCP4.5 (2°C)',
                        data: [1.0, 1.3, 1.6, 1.9, 2.2, 2.5, 2.8, 3.1, 3.4],
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 2,
                        tension: 0.1
                    },
                    {
                        label: 'SSP3 + RCP6.0 (2-3°C)',
                        data: [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0],
                        borderColor: 'rgba(255, 206, 86, 1)',
                        borderWidth: 2,
                        tension: 0.1
                    },
                    {
                        label: 'SSP5 + RCP8.5 (>3°C)',
                        data: [1.0, 1.8, 2.6, 3.4, 4.2, 5.0, 5.8, 6.6, 7.4],
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 2,
                        tension: 0.1
                    },
                    {
                        label: 'Objectif COP (1.5°C)',
                        data: [1.0, 1.2, 1.3, 1.4, 1.5, 1.5, 1.5, 1.5, 1.5],
                        borderColor: 'rgba(0, 0, 0, 1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Trajectoires Climatiques',
                        font: { size: 18, weight: 'bold' }
                    },
                    legend: {
                        position: 'top',
                        labels: { font: { size: 12 }, padding: 20, usePointStyle: true }
                    },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    y: {
                        title: { display: true, text: 'Température (°C)', font: { weight: 'bold' } },
                        min: 0,
                        max: 8,
                        ticks: { stepSize: 1 }
                    },
                    x: {
                        title: { display: true, text: 'Année', font: { weight: 'bold' } }
                    }
                },
                animation: { duration: 1000, easing: 'easeInOutQuad' }
            }
        });

        console.log('[simulationTab] Graphique climatique initialisé');
    } catch (error) {
        console.error('[simulationTab] Erreur d\'initialisation du graphique:', error);
    }
}

async function loadAdditionalData() {
    try {
        const response = await fetch('/data/exemples.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const tableBody = document.querySelector('#strategie-etats-table tbody');
        if (tableBody && data.strategie_negociation) {
            tableBody.innerHTML = data.strategie_negociation
                .map(
                    (etape) => `
                    <tr>
                        <td>${etape.etape}</td>
                        <td>${etape.objectifs}</td>
                        <td>${etape.actions_cles.join('<br>')}</td>
                        <td>${etape.exemples_pratiques.join('<br>')}</td>
                    </tr>
                `
                )
                .join('');
        }

        console.log('[simulationTab] Données supplémentaires chargées');
    } catch (error) {
        console.error('[simulationTab] Erreur de chargement des données:', error);
    }
}

export function cleanupSimulationTab() {
    if (generalClimateChart) {
        generalClimateChart.destroy();
        generalClimateChart = null;
    }
    console.log('[simulationTab] Nettoyage effectué');
}