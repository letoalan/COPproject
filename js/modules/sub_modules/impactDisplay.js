// impactDisplay.js

/**
 * Génère le rendu HTML de l'infographie
 * @param {Object} impact Données calculées par impactModule
 * @param {HTMLElement} container Élément cible
 */
export function renderInfographic(impact, container) {
  if (!impact || !container) return;

  const { country, scenario, invest_annual_mrd, gdp_impact, insurance_cost_mrd, political_risk, green_fund_need, carbon_posts } = impact;

  container.innerHTML = `
    <div class="infographic-16-9">
      <!-- Ligne 1 : En-tête pays + scénario -->
      <div class="inf-header">
        <img class="country-flag" src="${country.flag}" alt="Drapeau ${country.name}">
        <span class="country-name">${country.name}</span>
        <span class="scenario-badge" style="background:${scenario.color}">${scenario.label}</span>
        <span class="temp-badge">Température globale 2100 : +${scenario.temp_2100}°C</span>
      </div>

      <!-- Ligne 2 : 5 cartes KPI -->
      <div class="inf-kpi-row">
        <div class="kpi-card kpi-invest">
          <span class="kpi-value">${invest_annual_mrd.toFixed(1)} Mrd€/an</span>
          <span class="kpi-label">Investissement transition</span>
        </div>
        <div class="kpi-card kpi-gdp">
          <span class="kpi-value">${gdp_impact.short.toFixed(1)}% PIB</span>
          <span class="kpi-label">Impact court terme (PIB)</span>
        </div>
        <div class="kpi-card kpi-insurance">
          <span class="kpi-value">${insurance_cost_mrd.toFixed(1)} Mrd€/an</span>
          <span class="kpi-label">Coût assurantiel climatique</span>
        </div>
        <div class="kpi-card kpi-fund">
          <div class="kpi-split">
            <div class="split-item">
              <span class="kpi-value">${impact.green_fund_contribution.toFixed(1)} Mrd€</span>
              <span class="kpi-label">Contribution</span>
            </div>
            <div class="split-item">
              <span class="kpi-value">${impact.green_fund_need.toFixed(1)} Mrd€</span>
              <span class="kpi-label">Aide reçue</span>
            </div>
          </div>
          <div class="kpi-footer-note">Bilan : ${impact.green_fund_net >= 0 ? '+' : ''}${impact.green_fund_net.toFixed(1)} Mrd€</div>
        </div>
        <div class="kpi-card kpi-risk" style="border-top: 4px solid ${political_risk.color}">
          <span class="kpi-value" style="color:${political_risk.color}">${political_risk.score.toFixed(1)}/10</span>
          <span class="kpi-label">Risque politique (${political_risk.label})</span>
        </div>
      </div>

      <!-- Ligne 3 : Graphe barres postes carbone + Jauge risque -->
      <div class="inf-body">
        <div class="inf-carbon-chart">
          <h3>Réduction des émissions par secteur (MtCO₂e)</h3>
          <div class="carbon-bars-container"></div>
        </div>
        <div class="inf-risk-panel">
          <h3>Profil de risque & Effort forêt</h3>
          <div class="risk-details">
             <div class="risk-item"><span>Dépendance fossile :</span> ${country.fossil_dependency_pct}%</div>
             <div class="risk-item"><span>Dette publique :</span> ${country.debt_pct_gdp}% PIB</div>
             <div class="risk-item"><span>Vulnérabilité :</span> ${country.climate_vuln_index}/10</div>
             <div class="risk-item forest-effort"><span>Réduction défor. :</span> ${impact.forest_effort.deforestation.toFixed(0)}%</div>
             <div class="risk-item forest-effort"><span>Reboisement :</span> ${impact.forest_effort.reforestation.toFixed(0)}%</div>
          </div>
        </div>
      </div>

      <!-- Ligne 4 : Comparaison dette/capacité et conclusion -->
      <div class="inf-footer">
        <div class="inf-finance">
          PIB : ${country.gdp_mrd} Mrd€ · Empreinte actuelle : ${country.base_empreinte_t} t/hab
        </div>
        <div class="inf-conclusion">${generateConclusion(country, scenario, political_risk, invest_annual_mrd, impact.forest_effort, impact.green_fund_net)}</div>
      </div>
    </div>
  `;

  const barsContainer = container.querySelector('.carbon-bars-container');
  if (barsContainer) {
    renderCarbonBars(carbon_posts, barsContainer);
  }
}

/**
 * Génère les barres SVG pour les postes carbone
 */
function renderCarbonBars(posts, container) {
  const maxMt = Math.max(...posts.map(p => p.current_mt));
  
  posts.forEach(p => {
    const pct_current = (p.current_mt / maxMt) * 100;
    const pct_reduced = (p.reduced_mt / maxMt) * 100;
    
    container.innerHTML += `
      <div class="bar-row">
        <span class="bar-label">${translateSector(p.sector)}</span>
        <div class="bar-track">
          <div class="bar-bg" style="width:${pct_current}%"></div>
          <div class="bar-fg" style="width:${pct_reduced}%"></div>
        </div>
        <span class="bar-val">${p.current_mt.toFixed(0)} <span class="arrow">→</span> ${p.reduced_mt.toFixed(0)}</span>
      </div>`;
  });
}

/**
 * Traduit les noms de secteurs en français
 */
function translateSector(sector) {
    const translations = {
        transport: 'Transports',
        building: 'Bâtiment',
        industry: 'Industrie',
        agriculture: 'Agriculture',
        energy: 'Énergie',
        waste: 'Déchets'
    };
    return translations[sector] || sector;
}

/**
 * Génère le texte de conclusion automatique
 */
function generateConclusion(country, scenario, political_risk, invest, forest, green_fund_net) {
  const effort = invest > country.gdp_mrd * 0.04 ? 'très élevé' :
                 invest > country.gdp_mrd * 0.02 ? 'significatif' : 'modéré';
  
  const risk_txt = political_risk.label === 'Critique' ?
    "une instabilité politique majeure est à anticiper" :
    `le risque politique est ${political_risk.label.toLowerCase()}`;

  const forest_txt = forest.deforestation > 80 ? 
    "un arrêt quasi-total de la déforestation" : 
    `une réduction de ${forest.deforestation.toFixed(0)}% de la déforestation`;

  const fund_txt = green_fund_net > 0 ? 
    `Le pays bénéficie d'une aide nette de ${green_fund_net.toFixed(1)} Mrd€ des Fonds Verts.` :
    (green_fund_net < 0 ? `L'État contribue net à hauteur de ${Math.abs(green_fund_net).toFixed(1)} Mrd€ aux Fonds Verts mondiaux.` : 
    "Le bilan des Fonds Verts est neutre pour cet État.");
    
  return `Pour ${country.name}, le scénario ${scenario.label} implique un effort financier ${effort}
    (${invest.toFixed(1)} Mrd€/an). ${fund_txt} Parallèlement, l'effort forestier prévoit ${forest_txt} 
    et un reboisement de ${forest.reforestation.toFixed(0)}%. Les coûts assurantiels évoluent d'un facteur
    ${scenario.insurance_multiplier}x. À long terme, ${risk_txt}.`;
}

/**
 * Fonction d'export via html2canvas (si chargé)
 */
export function exportInfographic(countryId, scenarioId) {
  if (typeof html2canvas === 'undefined') {
    alert("html2canvas n'est pas chargé. Impossible d'exporter.");
    return;
  }
  
  const element = document.querySelector('#impact-infographic');
  html2canvas(element, { scale: 2 }).then(canvas => {
    const link = document.createElement('a');
    link.download = `impact_${countryId}_${scenarioId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}
