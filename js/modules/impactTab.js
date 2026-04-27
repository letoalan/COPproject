// impactTab.js
import { countryData, loadData } from './sub_modules/dataService.js';
import { displayOrder } from './sub_modules/config.js';
import { computeImpact } from './sub_modules/impactModule.js';
import { renderInfographic, exportInfographic } from './sub_modules/impactDisplay.js';

let selectedCountry = "";
let selectedScenario = "S0";

export async function initImpactTab() {
    console.log('Initialisation de l\'onglet Impact');
    try {
        await loadData();
        console.log('Données chargées, pays disponibles:', countryData.length);
        setupSelectors();
        setupEventListeners();
        updateImpact();
    } catch (e) {
        console.error('Erreur initImpactTab:', e);
    }
}

function setupSelectors() {
    const select = document.getElementById('impact-country-select');
    if (!select) {
        console.error('Sélecteur #impact-country-select non trouvé');
        return;
    }

    select.innerHTML = '<option value="" disabled selected>Choisir un pays...</option>';
    
    // On utilise displayOrder pour garantir l'ordre et la présence des pays
    displayOrder.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });

    if (displayOrder.length > 0) {
        selectedCountry = displayOrder[0];
        select.value = selectedCountry;
    }
}

function setupEventListeners() {
    const select = document.getElementById('impact-country-select');
    if (select) {
        select.addEventListener('change', (e) => {
            selectedCountry = e.target.value;
            updateImpact();
        });
    }

    // Rafraîchir l'impact quand on clique sur l'onglet pour synchroniser avec C-Roads
    const tabBtn = document.querySelector('nav button[data-tab="impact-tab"]');
    if (tabBtn) {
        tabBtn.addEventListener('click', () => {
            updateImpact();
        });
    }

    const scenarioButtons = document.querySelectorAll('.scenario-selector .scen-btn');
    scenarioButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            scenarioButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedScenario = btn.dataset.scenario;
            updateImpact();
        });
    });

    const exportBtn = document.getElementById('btn-export-infographic');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            exportInfographic(selectedCountry, selectedScenario);
        });
    }
}

export function updateImpact() {
    const container = document.getElementById('impact-infographic');
    if (!container || !selectedCountry) return;

    // Récupérer les données de base pour ce pays
    const countryBase = countryData.find(c => c.name === selectedCountry);
    if (!countryBase) return;

    const index = countryData.indexOf(countryBase);

    // Récupération dynamique des paramètres depuis l'interface C-Roads
    const getVal = (inputIdx) => {
        const input = document.querySelector(`input[data-country-index="${index}"][data-input-index="${inputIdx}"]`);
        return input ? Number(input.value) : 0;
    };

    const countryParams = {
        ...countryBase,
        reduction: getVal(2),
        deforestation: getVal(3),
        reforestation: getVal(4)
    };

    // Calculer les impacts (Utilise le scénario LOCAL S0-S3)
    const impactResult = computeImpact(selectedCountry, selectedScenario, countryParams);
    
    // Rendre l'infographie
    renderInfographic(impactResult, container);
}
