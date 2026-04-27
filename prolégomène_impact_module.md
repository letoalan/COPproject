# PROLÉGOMÈNE-CONTRAT — Module "Simulateur d'Impact"
## COP Project — Onglet Impact Économique & Géopolitique
> Auteur : Alan Duval — Version 1.0 — 27 avril 2026
> Destinataire : Antigravity
> Statut : Spécification complète pour implémentation

---

## I. CONTEXTE ET OBJECTIF

### 1.1 Positionnement dans le projet
Le simulateur COP v2.0 permet de simuler des trajectoires d'émissions et d'obtenir
une température projetée à 2100. Ce module complémentaire ajoute un **cinquième
onglet** permettant à l'utilisateur, après sélection d'un pays, de visualiser
l'impact économique, assurantiel et géopolitique de ses paramètres.

### 1.2 Objectif pédagogique
Permettre aux élèves de comprendre que chaque engagement climatique a un coût
mesurable, des effets sur la croissance, un risque assurantiel et une dimension
de stabilité politique — pour chacun des 14 États de la simulation.

### 1.3 Résultat attendu
Un onglet "Impact" qui :
- reprend la sélection pays de l'interface existante,
- lit les paramètres saisis dans les autres onglets,
- calcule et affiche dynamiquement une infographie 16:9 (HTML/CSS/JS).

---

## II. ARCHITECTURE GÉNÉRALE

### 2.1 Fichiers à créer ou modifier

| Fichier | Action | Rôle |
|---|---|---|
| `index.html` | Modifier | Ajouter onglet "Impact" |
| `impactModule.js` | Créer | Logique de calcul impact |
| `impactDisplay.js` | Créer | Rendu infographie HTML |
| `impactData.js` | Créer | Données statiques 14 États |
| `config.js` | Modifier | Ajouter constantes scénarios |
| `style.css` | Modifier | Styles onglet Impact |

> Contrainte : chaque fichier JS ≤ 150 lignes. Découper si dépassement.

### 2.2 Structure de l'onglet

```
[Tab: Impact]
  ├── SélecteurPays (composant réutilisé depuis les autres onglets)
  ├── SélecteurScénario (4 boutons radio)
  ├── InfographieImpact (div rendu dynamique 16:9)
  └── BoutonExport (PNG via html2canvas)
```

---

## III. DONNÉES STATIQUES — impactData.js

### 3.1 Structure par pays (14 États)

```javascript
// Format : données économiques et géopolitiques de référence 2024
const COUNTRY_IMPACT_DATA = {
  "France": {
    gdp_mrd: 2800,            // PIB en Mrd€
    debt_pct_gdp: 111,        // Dette publique % PIB
    fossil_dependency_pct: 46,// % énergie fossile dans le mix
    climate_vuln_index: 3.2,  // 0-10 (GCRI 2024)
    political_stability: 6.1, // 0-10 (World Bank 2024)
    base_emissions_mtco2: 400, // MtCO2e/an territoriales
    base_empreinte_t: 8.2,    // t CO2e/hab
    insurance_climate_cost_pct_gdp: 0.8, // % PIB coût assurantiel actuel
    sectors_weight: {
      transport: 29, building: 18, industry: 19,
      agriculture: 18, energy: 10, waste: 6
    }
  },
  // → répéter pour les 13 autres États
  "Chine": { gdp_mrd: 17500, debt_pct_gdp: 83, fossil_dependency_pct: 84,
    climate_vuln_index: 5.1, political_stability: 4.8,
    base_emissions_mtco2: 12000, base_empreinte_t: 8.5,
    insurance_climate_cost_pct_gdp: 1.1,
    sectors_weight: { transport:10, building:20, industry:39, agriculture:11, energy:14, waste:6 }
  },
  "États-Unis": { gdp_mrd: 25400, debt_pct_gdp: 123, fossil_dependency_pct: 79,
    climate_vuln_index: 4.3, political_stability: 5.2,
    base_emissions_mtco2: 5800, base_empreinte_t: 16.0,
    insurance_climate_cost_pct_gdp: 1.4,
    sectors_weight: { transport:29, building:13, industry:23, agriculture:10, energy:25, waste:0 }
  },
  "Inde": { gdp_mrd: 3700, debt_pct_gdp: 81, fossil_dependency_pct: 74,
    climate_vuln_index: 7.2, political_stability: 4.1,
    base_emissions_mtco2: 3700, base_empreinte_t: 2.4,
    insurance_climate_cost_pct_gdp: 1.8,
    sectors_weight: { transport:12, building:22, industry:34, agriculture:14, energy:14, waste:4 }
  },
  "Russie": { gdp_mrd: 2200, debt_pct_gdp: 17, fossil_dependency_pct: 86,
    climate_vuln_index: 4.8, political_stability: 3.5,
    base_emissions_mtco2: 1680, base_empreinte_t: 12.7,
    insurance_climate_cost_pct_gdp: 0.6,
    sectors_weight: { transport:14, building:26, industry:33, agriculture:6, energy:19, waste:2 }
  },
  "Brésil": { gdp_mrd: 1900, debt_pct_gdp: 88, fossil_dependency_pct: 44,
    climate_vuln_index: 6.4, political_stability: 4.5,
    base_emissions_mtco2: 520, base_empreinte_t: 2.4,
    insurance_climate_cost_pct_gdp: 2.1,
    sectors_weight: { transport:18, building:8, industry:19, agriculture:27, energy:16, waste:12 }
  },
  "Mexique": { gdp_mrd: 1300, debt_pct_gdp: 54, fossil_dependency_pct: 88,
    climate_vuln_index: 6.1, political_stability: 4.2,
    base_emissions_mtco2: 650, base_empreinte_t: 4.9,
    insurance_climate_cost_pct_gdp: 1.5,
    sectors_weight: { transport:25, building:16, industry:22, agriculture:12, energy:20, waste:5 }
  },
  "Chili": { gdp_mrd: 310, debt_pct_gdp: 37, fossil_dependency_pct: 68,
    climate_vuln_index: 5.8, political_stability: 5.6,
    base_emissions_mtco2: 95, base_empreinte_t: 4.7,
    insurance_climate_cost_pct_gdp: 1.2,
    sectors_weight: { transport:26, building:12, industry:28, agriculture:15, energy:14, waste:5 }
  },
  "EAU": { gdp_mrd: 500, debt_pct_gdp: 30, fossil_dependency_pct: 98,
    climate_vuln_index: 5.2, political_stability: 6.8,
    base_emissions_mtco2: 250, base_empreinte_t: 25.0,
    insurance_climate_cost_pct_gdp: 0.9,
    sectors_weight: { transport:17, building:29, industry:30, agriculture:2, energy:22, waste:0 }
  },
  "Égypte": { gdp_mrd: 400, debt_pct_gdp: 92, fossil_dependency_pct: 95,
    climate_vuln_index: 7.8, political_stability: 3.9,
    base_emissions_mtco2: 260, base_empreinte_t: 2.5,
    insurance_climate_cost_pct_gdp: 2.4,
    sectors_weight: { transport:21, building:24, industry:28, agriculture:11, energy:13, waste:3 }
  },
  "Haïti": { gdp_mrd: 20, debt_pct_gdp: 23, fossil_dependency_pct: 77,
    climate_vuln_index: 9.2, political_stability: 1.4,
    base_emissions_mtco2: 20, base_empreinte_t: 0.6,
    insurance_climate_cost_pct_gdp: 4.8,
    sectors_weight: { transport:22, building:19, industry:11, agriculture:38, energy:8, waste:2 }
  },
  "Sénégal": { gdp_mrd: 27, debt_pct_gdp: 68, fossil_dependency_pct: 72,
    climate_vuln_index: 8.1, political_stability: 5.2,
    base_emissions_mtco2: 70, base_empreinte_t: 0.4,
    insurance_climate_cost_pct_gdp: 3.1,
    sectors_weight: { transport:19, building:14, industry:14, agriculture:42, energy:9, waste:2 }
  },
  "Vanuatu": { gdp_mrd: 1, debt_pct_gdp: 45, fossil_dependency_pct: 81,
    climate_vuln_index: 9.8, political_stability: 5.1,
    base_emissions_mtco2: 1, base_empreinte_t: 0.8,
    insurance_climate_cost_pct_gdp: 6.2,
    sectors_weight: { transport:31, building:12, industry:6, agriculture:44, energy:5, waste:2 }
  },
  "Île Maurice": { gdp_mrd: 14, debt_pct_gdp: 88, fossil_dependency_pct: 77,
    climate_vuln_index: 7.4, political_stability: 6.5,
    base_emissions_mtco2: 10, base_empreinte_t: 3.2,
    insurance_climate_cost_pct_gdp: 3.8,
    sectors_weight: { transport:28, building:18, industry:20, agriculture:10, energy:18, waste:6 }
  }
};
```

---

## IV. LES 4 SCÉNARIOS — config.js (extension)

```javascript
export const SCENARIOS = {
  S0: {
    id: 'S0', label: 'Inaction (BAU)',
    color: '#e74c3c', temp_2100: 3.3,
    gdp_impact_short: -0.0, gdp_impact_mid: -2.0, gdp_impact_long: -12.0,
    insurance_multiplier: 3.5,   // x coût assurantiel actuel
    political_risk_delta: +2.5,  // aggravation index instabilité
    description: "Aucune mesure supplémentaire. Tendance actuelle maintenue."
  },
  S1: {
    id: 'S1', label: 'Effort modéré (-20%)',
    color: '#f39c12', temp_2100: 2.7,
    gdp_impact_short: -0.2, gdp_impact_mid: -0.5, gdp_impact_long: -3.0,
    insurance_multiplier: 2.0,
    political_risk_delta: +1.0,
    description: "Politiques progressives. Réductions sectorielles limitées."
  },
  S2: {
    id: 'S2', label: 'Effort soutenu (-50%)',
    color: '#3498db', temp_2100: 2.1,
    gdp_impact_short: -0.5, gdp_impact_mid: -0.3, gdp_impact_long: +0.5,
    insurance_multiplier: 1.4,
    political_risk_delta: +0.3,
    description: "Transition structurelle engagée. Investissements massifs."
  },
  S3: {
    id: 'S3', label: 'Effort maximal COP (-80%)',
    color: '#2ecc71', temp_2100: 1.6,
    gdp_impact_short: -0.9, gdp_impact_mid: +0.2, gdp_impact_long: +2.0,
    insurance_multiplier: 1.0,
    political_risk_delta: -0.5,
    description: "Transformation profonde. Neutralité carbone avant 2050."
  }
};
```

---

## V. ALGORITHME — impactModule.js

### 5.1 Fonction principale

```javascript
// Entrée : countryId (string), scenarioId (string), params (depuis chartService)
// Sortie : objet ImpactResult

function computeImpact(countryId, scenarioId, simulatorParams) {
  const country = COUNTRY_IMPACT_DATA[countryId];
  const scenario = SCENARIOS[scenarioId];
  const reductionRate = simulatorParams.reduction / 100;

  // A. Coût d'investissement transition
  const invest_annual_mrd = computeInvestmentCost(country, reductionRate);

  // B. Impact sur le PIB
  const gdp_impact = {
    short: scenario.gdp_impact_short - (country.fossil_dependency_pct / 100 * 0.5),
    mid:   scenario.gdp_impact_mid,
    long:  scenario.gdp_impact_long + (country.climate_vuln_index / 10 * 3)
  };

  // C. Coût assurantiel
  const insurance_cost_mrd = country.gdp_mrd
    * (country.insurance_climate_cost_pct_gdp / 100)
    * scenario.insurance_multiplier;

  // D. Risque de déstabilisation politique
  const political_risk = computePoliticalRisk(country, scenario, reductionRate);

  // E. Postes carbone prioritaires
  const carbon_posts = computeCarbonPosts(country, reductionRate);

  return { country, scenario, invest_annual_mrd, gdp_impact,
           insurance_cost_mrd, political_risk, carbon_posts };
}
```

### 5.2 Calcul investissement

```javascript
function computeInvestmentCost(country, reductionRate) {
  // Base calibrée France = 108 Mrd€ pour 80%
  // Scalé par PIB relatif et dépendance fossile
  const BASE_FRANCE_80PCT = 108;
  const gdp_ratio = country.gdp_mrd / 2800;
  const fossil_factor = country.fossil_dependency_pct / 46;
  return BASE_FRANCE_80PCT * gdp_ratio * fossil_factor * (reductionRate / 0.8);
}
```

### 5.3 Calcul risque politique (4 critères)

```javascript
function computePoliticalRisk(country, scenario, reductionRate) {
  // Critère 1 : stabilité initiale (inverse)
  const instability_base = 10 - country.political_stability;
  // Critère 2 : vulnérabilité climatique (si inaction, risque monte)
  const climate_pressure = country.climate_vuln_index * (3.3 / scenario.temp_2100);
  // Critère 3 : dépendance fossile (si transition rapide, risque économique)
  const fossil_shock = country.fossil_dependency_pct / 100 * reductionRate * 5;
  // Critère 4 : dette publique (capacité à absorber les coûts)
  const debt_constraint = country.debt_pct_gdp / 100 * 2;

  const raw = (instability_base * 0.3 + climate_pressure * 0.3
             + fossil_shock * 0.2 + debt_constraint * 0.2)
             + scenario.political_risk_delta;

  return {
    score: Math.min(Math.max(raw, 0), 10),
    label: raw < 3 ? 'Faible' : raw < 5 ? 'Modéré' : raw < 7 ? 'Élevé' : 'Critique',
    color: raw < 3 ? '#2ecc71' : raw < 5 ? '#f39c12' : raw < 7 ? '#e67e22' : '#e74c3c'
  };
}
```

### 5.4 Décomposition postes carbone

```javascript
function computeCarbonPosts(country, reductionRate) {
  // Pour chaque secteur : émissions actuelles × (1 - part_réduction_secteur)
  const sectorReductionShare = {
    transport: 0.30, building: 0.22, industry: 0.20,
    agriculture: 0.12, energy: 0.12, waste: 0.04
  };
  return Object.entries(country.sectors_weight).map(([sector, weight]) => ({
    sector,
    current_mt: country.base_emissions_mtco2 * weight / 100,
    reduced_mt: country.base_emissions_mtco2 * weight / 100
             * (1 - reductionRate * sectorReductionShare[sector] * 2.5),
    reduction_pct: reductionRate * sectorReductionShare[sector] * 250
  }));
}
```

---

## VI. RENDU INFOGRAPHIE — impactDisplay.js

### 6.1 Structure HTML générée dynamiquement

```html
<!-- Zone 16:9 générée dans #impact-infographic -->
<div class="infographic-16-9">

  <!-- Ligne 1 : En-tête pays + scénario -->
  <div class="inf-header">
    <span class="country-name">{pays}</span>
    <span class="scenario-badge" style="background:{couleur}">{scénario}</span>
    <span class="temp-badge">Température 2100 : {T}°C</span>
  </div>

  <!-- Ligne 2 : 4 cartes KPI -->
  <div class="inf-kpi-row">
    <div class="kpi-card kpi-invest">
      <span class="kpi-value">{invest} Mrd€/an</span>
      <span class="kpi-label">Investissement transition</span>
    </div>
    <div class="kpi-card kpi-gdp">
      <span class="kpi-value">{gdp_short}% PIB</span>
      <span class="kpi-label">Impact court terme</span>
    </div>
    <div class="kpi-card kpi-insurance">
      <span class="kpi-value">{insurance} Mrd€/an</span>
      <span class="kpi-label">Coût assurantiel</span>
    </div>
    <div class="kpi-card" style="border-color:{risk.color}">
      <span class="kpi-value">{risk.score}/10</span>
      <span class="kpi-label">Risque politique ({risk.label})</span>
    </div>
  </div>

  <!-- Ligne 3 : Graphe barres postes carbone + Jauge risque -->
  <div class="inf-body">
    <div class="inf-carbon-chart"> <!-- barres horizontales SVG --> </div>
    <div class="inf-risk-panel">  <!-- détail 4 critères risque --> </div>
  </div>

  <!-- Ligne 4 : Comparaison dette/capacité et conclusion -->
  <div class="inf-footer">
    <div class="inf-finance">
      PIB {gdp} Mrd€ · Dette {debt}% · Dépendance fossile {fossil}%
    </div>
    <div class="inf-conclusion">{conclusion_textuelle}</div>
  </div>

</div>
```

### 6.2 Génération des barres SVG carbone

```javascript
function renderCarbonBars(posts, container) {
  const maxMt = Math.max(...posts.map(p => p.current_mt));
  posts.forEach(p => {
    const pct_current = p.current_mt / maxMt * 100;
    const pct_reduced = p.reduced_mt / maxMt * 100;
    // Barre fond = actuel, barre avant = réduit
    container.innerHTML += `
      <div class="bar-row">
        <span class="bar-label">${p.sector}</span>
        <div class="bar-track">
          <div class="bar-bg" style="width:${pct_current}%"></div>
          <div class="bar-fg" style="width:${pct_reduced}%"></div>
        </div>
        <span class="bar-val">${p.current_mt.toFixed(0)}→${p.reduced_mt.toFixed(0)} Mt</span>
      </div>`;
  });
}
```

### 6.3 Texte de conclusion automatique

```javascript
function generateConclusion(country, scenario, political_risk, invest) {
  const effort = invest > country.gdp_mrd * 0.04 ? 'très élevé' :
                 invest > country.gdp_mrd * 0.02 ? 'significatif' : 'modéré';
  const risk_txt = political_risk.label === 'Critique' ?
    "une instabilité politique majeure est à anticiper" :
    `le risque politique est ${political_risk.label.toLowerCase()}`;
  return `Pour ${country.name}, le scénario ${scenario.label} implique un effort ${effort}
    (${invest.toFixed(0)} Mrd€/an). Les coûts assurantiels évoluent d'un facteur
    ${scenario.insurance_multiplier}x. À long terme, ${risk_txt}.`;
}
```

---

## VII. EXPORT INFOGRAPHIE

```javascript
// Utiliser html2canvas (déjà probable dans le projet)
function exportInfographic() {
  html2canvas(document.querySelector('#impact-infographic')).then(canvas => {
    const link = document.createElement('a');
    link.download = `impact_${selectedCountry}_${selectedScenario}.png`;
    link.href = canvas.toDataURL();
    link.click();
  });
}
```

---

## VIII. INTÉGRATION HTML — index.html

```html
<!-- Ajouter dans la barre d'onglets -->
<button class="tab-btn" data-tab="impact">Impact</button>

<!-- Ajouter le panneau -->
<div id="tab-impact" class="tab-panel hidden">

  <div class="impact-controls">
    <label>Pays :</label>
    <select id="impact-country-select">
      <!-- Mêmes options que les autres onglets -->
    </select>

    <label>Scénario :</label>
    <div class="scenario-selector">
      <button class="scen-btn active" data-scenario="S0">Inaction</button>
      <button class="scen-btn" data-scenario="S1">Modéré -20%</button>
      <button class="scen-btn" data-scenario="S2">Soutenu -50%</button>
      <button class="scen-btn" data-scenario="S3">Maximal -80%</button>
    </div>

    <button id="btn-export-infographic">Exporter PNG</button>
  </div>

  <div id="impact-infographic" class="infographic-16-9"></div>

</div>
```

---

## IX. CONTRAINTES ET BONNES PRATIQUES

| Contrainte | Règle |
|---|---|
| Fichiers JS | ≤ 150 lignes chacun |
| Architecture | Statique HTML/CSS/JS, aucun framework |
| Langue | Français partout (labels, tooltips, textes) |
| Performances | Calculs synchrones, rendu < 200ms |
| Accessibilité | Couleurs avec contraste suffisant (WCAG AA) |
| Données | Toutes statiques, aucune requête externe |
| Compatibilité | Navigateurs modernes (Chrome, Firefox, Edge) |
| Responsive | Infographie fixe 16:9, scroll si écran réduit |

---

## X. TESTS ATTENDUS

1. Sélectionner Haïti + Inaction → risque politique "Critique", coût assurance élevé
2. Sélectionner France + Effort maximal → investissement ~108 Mrd€, risque "Faible"
3. Sélectionner EAU + Effort maximal → fossil_shock élevé malgré effort (dépendance 98%)
4. Sélectionner Vanuatu + Inaction → insurance_multiplier × 6,2% PIB = coût critique
5. Export PNG → fichier nommé correctement avec pays et scénario

---

## XI. LIVRABLES ATTENDUS D'ANTIGRAVITY

- [ ] `impactData.js` — 14 pays complets
- [ ] `impactModule.js` — fonctions computeImpact, computeInvestmentCost,
                          computePoliticalRisk, computeCarbonPosts
- [ ] `impactDisplay.js` — renderInfographic, renderCarbonBars, generateConclusion
- [ ] `index.html` — onglet Impact intégré
- [ ] `style.css` — styles infographie 16:9
- [ ] Rapport de validation avec captures des 5 tests ci-dessus

---

*Fin du prolégomène-contrat — Module Simulateur d'Impact v1.0*
