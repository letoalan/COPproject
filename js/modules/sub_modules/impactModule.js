// impactModule.js
import { COUNTRY_IMPACT_DATA } from './impactData.js';
import { SCENARIOS } from './config.js';

/**
 * Calcule l'impact complet pour un pays et un scénario donnés
 * @param {string} countryId Nom du pays
 * @param {string} scenarioId ID du scénario (S0, S1, S2, S3)
 * @param {Object} simulatorParams Paramètres actuels du pays dans le simulateur
 * @returns {Object} Résultat de l'impact
 */
export function computeImpact(countryId, scenarioId, simulatorParams) {
  const country = COUNTRY_IMPACT_DATA[countryId];
  if (!country) return null;
  const scenario = SCENARIOS[scenarioId];
  if (!scenario) return null;

  // Détermination des taux selon le scénario choisi
  let reductionRate = 0;
  let deforestationEffort = 0; // % de réduction de la déforestation
  let reforestationEffort = 0;  // % de reboisement
  
  if (scenarioId === "S0") {
    // Fossile / Inaction : très peu d'effort, on utilise les valeurs simu ou 0
    reductionRate = (simulatorParams.reduction || 0) / 100;
    deforestationEffort = 0;
    reforestationEffort = 0;
  } else if (scenarioId === "S1") {
    reductionRate = 0.20; 
    deforestationEffort = 0.20;
    reforestationEffort = 0.10;
  } else if (scenarioId === "S2") {
    reductionRate = 0.50;
    deforestationEffort = 0.50;
    reforestationEffort = 0.30;
  } else if (scenarioId === "S3") {
    reductionRate = 0.80;
    deforestationEffort = 1.00;
    reforestationEffort = 0.60;
  }

  // Création d'un objet params local pour le calcul forestier
  const localParams = {
    ...simulatorParams,
    reduction: reductionRate * 100,
    deforestation: (1 - deforestationEffort) * 100, // On inverse car l'input UI 100 = full deforestation
    reforestation: reforestationEffort * 100
  };

  console.log(`[IMPACT][${countryId}] Calc:`, {
    scenario: scenarioId,
    applied_reduction: reductionRate,
    defor_effort: deforestationEffort,
    refor_effort: reforestationEffort
  });

  // A. Coût d'investissement transition
  const invest_annual_mrd = computeInvestmentCost(country, reductionRate);

  // B. Impact sur le PIB
  const forest_gdp_cost = (localParams.reforestation / 100 * 0.3) + (Math.max(0, 1 - localParams.deforestation / 100) * 0.1);
  const gdp_impact = {
    short: scenario.gdp_impact_short - (country.fossil_dependency_pct / 100 * 0.5) - forest_gdp_cost,
    mid:   scenario.gdp_impact_mid - forest_gdp_cost,
    long:  scenario.gdp_impact_long + (country.climate_vuln_index / 10 * 3)
  };

  // D. Besoins en Fonds Verts (Aide internationale)
  // Facteur d'ambition mondiale (0 pour BAU à 4 pour scénario 80%)
  const fund_factor_map = { "S0": 0, "S1": 1, "S2": 2.5, "S3": 4 };
  const green_fund_multiplier = fund_factor_map[scenarioId] || 0;
  
  let green_fund_need = 0;
  if (localParams.poverty === "poor") {
    const base_adaptation = (country.climate_vuln_index / 10) * (country.gdp_mrd * 0.05);
    const transition_support = invest_annual_mrd * 0.7;
    green_fund_need = (base_adaptation + transition_support) * green_fund_multiplier;
  }

  // E. Effets de la forêt (Déforestation / Reboisement) sur le coût assurantiel
  const forest_insurance_impact = (localParams.deforestation / 100 * 0.2) - (localParams.reforestation / 100 * 0.1);
  const insurance_cost_mrd = country.gdp_mrd
    * (country.insurance_climate_cost_pct_gdp / 100)
    * scenario.insurance_multiplier
    * (1 + forest_insurance_impact);

  // F. Risque de déstabilisation politique (avec mitigation par les fonds verts)
  // Les fonds verts reçus réduisent le risque politique (max -2 points)
  const green_fund_mitigation = Math.min(2, (green_fund_need / country.gdp_mrd) * 10);
  const pol_risk_obj = computePoliticalRisk(country, scenario, reductionRate);
  
  const political_risk = {
    ...pol_risk_obj,
    score: Math.max(0, pol_risk_obj.score - green_fund_mitigation)
  };
  // Recalculer le label après mitigation
  if (political_risk.score < 3) { political_risk.label = 'Faible'; political_risk.color = '#2ecc71'; }
  else if (political_risk.score < 5) { political_risk.label = 'Modéré'; political_risk.color = '#f39c12'; }
  else if (political_risk.score < 7) { political_risk.label = 'Élevé'; political_risk.color = '#e67e22'; }
  else { political_risk.label = 'Critique'; political_risk.color = '#e74c3c'; }

  // H. Postes carbone prioritaires
  const carbon_posts = computeCarbonPosts(country, reductionRate);

  return { 
    country, 
    scenario, 
    invest_annual_mrd, 
    gdp_impact,
    insurance_cost_mrd, 
    political_risk, 
    green_fund_need,
    carbon_posts,
    forest_effort: {
        deforestation: deforestationEffort * 100,
        reforestation: reforestationEffort * 100
    }
  };
}

/**
 * Calcule le coût annuel d'investissement pour la transition
 */
function computeInvestmentCost(country, reductionRate) {
  // Base calibrée France = 108 Mrd€ pour 80%
  // Scalé par PIB relatif et dépendance fossile
  const BASE_FRANCE_80PCT = 108;
  const gdp_ratio = country.gdp_mrd / 2800;
  const fossil_factor = country.fossil_dependency_pct / 46;
  const result = BASE_FRANCE_80PCT * gdp_ratio * fossil_factor * (reductionRate / 0.8);
  
  console.log(`[IMPACT][${country.name}] Invest Calculation:`, {
    gdp_ratio: gdp_ratio.toFixed(3),
    fossil_factor: fossil_factor.toFixed(3),
    reduction_factor: (reductionRate / 0.8).toFixed(3),
    result_mrd: result.toFixed(2)
  });
  
  return result;
}

/**
 * Calcule le risque politique (score de 0 à 10)
 */
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

  const score = Math.min(Math.max(raw, 0), 10);
  let label, color;

  if (score < 3) {
    label = 'Faible'; color = '#2ecc71';
  } else if (score < 5) {
    label = 'Modéré'; color = '#f39c12';
  } else if (score < 7) {
    label = 'Élevé'; color = '#e67e22';
  } else {
    label = 'Critique'; color = '#e74c3c';
  }

  return { score, label, color };
}

/**
 * Décompose les émissions par secteur après réduction
 */
function computeCarbonPosts(country, reductionRate) {
  const sectorReductionShare = {
    transport: 0.30, building: 0.22, industry: 0.20,
    agriculture: 0.12, energy: 0.12, waste: 0.04
  };
  
  return Object.entries(country.sectors_weight).map(([sector, weight]) => {
    const current_mt = country.base_emissions_mtco2 * weight / 100;
    // La réduction sectorielle est pondérée
    const reduced_mt = current_mt * (1 - reductionRate * sectorReductionShare[sector] * 2.5);
    const reduction_pct = reductionRate * sectorReductionShare[sector] * 250;
    
    return {
      sector,
      current_mt,
      reduced_mt: Math.max(0, reduced_mt),
      reduction_pct: Math.min(100, reduction_pct)
    };
  });
}
