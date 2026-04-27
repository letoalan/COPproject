// impactTab.js
import { countryData, getCountryByName, loadData } from './sub_modules/dataService.js';
import { displayOrder } from './sub_modules/config.js';
import { computeImpact } from './sub_modules/impactModule.js';
import { renderInfographic, exportInfographic } from './sub_modules/impactDisplay.js';
import { distributeGreenFunds } from './sub_modules/fundService.js';
import { COUNTRY_IMPACT_DATA } from './sub_modules/impactData.js';

const FUND_POOLS = { "S0": 0, "S1": 80, "S2": 200, "S3": 350 };

const CONTRIBUTION_RATES = {
  "S0": { rich: 0,        emergent: 0        },
  "S1": { rich: 0.00189,  emergent: 0.000944 },
  "S2": { rich: 0.00472,  emergent: 0.00236  },
  "S3": { rich: 0.00826,  emergent: 0.00413  },
};

const POLITICAL_PROFILES = {
  'États-Unis': {
    type: 'capped',
    icon: '🔴',
    cap_abs: { S0: 0, S1: 15, S2: 50, S3: 100 },
    rationale: "Retrait conservateur des engagements multilatéraux",
  },
  'Chine': {
    type: 'leader',
    icon: '🟢',
    lead_factor: { S0: 1.0, S1: 1.4, S2: 1.5, S3: 1.6 },
    rationale: "Quête de leadership vert post-Trump",
  },
  'Russie': {
    type: 'capped',
    icon: '🔴',
    cap_abs: { S0: 0, S1: 2, S2: 5, S3: 10 },
    rationale: "Engagement symbolique d'une économie fossilo-dépendante",
  },
  'Émirats Arabes Unis': {
    type: 'leader',
    icon: '🟡',
    lead_factor: { S0: 1.0, S1: 1.2, S2: 1.3, S3: 1.4 },
    rationale: "Diplomatie COP28 : crédibilité post-pétrole",
  },
};

const GENEROSITY_PROB = { 0.5: 0.60, 1.0: 0.82, 1.5: 1.00 };

let selectedCountry = "";
let selectedScenario = "S0";
let selectedGenerosity = 1.0;

export async function initImpactTab() {
    console.log('Initialisation de l\'onglet Impact');
    try {
        await loadData();
        console.log('Données pays chargées');
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
        // FIX — setAttribute au lieu de .value pour NE PAS déclencher 'change'
        select.setAttribute('value', selectedCountry);
        const opt = select.querySelector(`option[value="${selectedCountry}"]`);
        if (opt) opt.selected = true;
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

    // Boutons de générosité
    document.querySelectorAll('.gen-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.gen-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedGenerosity = parseFloat(btn.dataset.gen);
            updateImpact();
        });
    });

    const exportBtn = document.getElementById('btn-export-infographic');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (selectedCountry) exportInfographic(selectedCountry, selectedScenario);
        });
    }
}

export function updateImpact() {
    const container = document.getElementById('impact-infographic');
    if (!selectedCountry || !container) return;

    const countryBase = getCountryByName(selectedCountry);
    if (!countryBase) return;

    // Récupérer les taux actuels (éventuellement modifiés par d'autres curseurs)
    // Pour l'instant on simule l'effort lié au scénario GIEC choisi
    const getVal = (id) => {
        const slider = document.querySelector(`.slider-container[data-id="${id}"] input`);
        return slider ? parseFloat(slider.value) : 0;
    };

    const countryParams = {
        ...countryBase,
        reduction: getVal(2),
        deforestation: getVal(3),
        reforestation: getVal(4),
        generosity: selectedGenerosity // Passer le facteur de générosité
    };

    // Extraction des données de négociation si disponibles
    const negValues = getNegociationValues(selectedCountry, selectedScenario);
    if (negValues) {
        countryParams.negotiated_aid          = negValues.aid;
        countryParams.negotiated_contribution = negValues.contribution;
        countryParams.negotiated_realPool     = negValues.realPool;   // NOUVEAU
        countryParams.negotiated_polNote      = negValues.polNote;    // NOUVEAU
    }

    // Calculer les impacts
    const impactResult = computeImpact(selectedCountry, selectedScenario, countryParams);
    
    // Rendre l'infographie
    renderInfographic(impactResult, container);
}

function getNegociationValues(countryName, scenarioId) {
  const genProb = GENEROSITY_PROB[selectedGenerosity] ?? 0.82;
  const basePool = FUND_POOLS[scenarioId] || 0;

  function getCountryContrib(name) {
    const ci = COUNTRY_IMPACT_DATA[name];
    const cs = getCountryByName(name);
    if (!cs || !ci || cs.poverty === 'poor') return 0;

    const rateSet  = CONTRIBUTION_RATES[scenarioId];
    const baseRate = cs.poverty === 'rich' ? rateSet.rich : rateSet.emergent;
    let contrib    = ci.gdp_mrd * baseRate;   // scaleFactor supprimé

    const profile = POLITICAL_PROFILES[name];
    if (profile?.type === 'capped') {
      contrib = Math.min(contrib, profile.cap_abs[scenarioId] || 0);
    } else if (profile?.type === 'leader') {
      contrib = contrib * (profile.lead_factor[scenarioId] || 1.0);
    }
    return contrib * genProb;
  }

  // Pool réel = somme des contributions politiquement réalistes,
  // plafonné au pool théorique du scénario
  const realPool = Math.min(
    basePool,
    displayOrder.reduce((sum, n) => sum + getCountryContrib(n), 0)
  );

  // Distribution basée sur le pool réel (pas le pool théorique)
  const distribution = distributeGreenFunds(realPool);
  const rawAid       = distribution[countryName] || 0;
  const aid          = Math.round(rawAid * genProb * 10) / 10;
  const contribution = Math.round(getCountryContrib(countryName));

  const profile = POLITICAL_PROFILES[countryName];
  const polNote = profile
    ? { icon: profile.icon, type: profile.type, rationale: profile.rationale }
    : { icon: '⚪', type: 'standard', rationale: null };

  return { aid, contribution, realPool: Math.round(realPool), polNote };
}
