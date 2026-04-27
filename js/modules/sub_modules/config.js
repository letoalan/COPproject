// config.js
export const DEBUG_TRAJECTORY = true;

// Paramètres de calibration climatique
export const labels = [2025, 2030, 2035, 2040, 2045, 2050, 2055, 2060, 2065, 2070, 2075, 2080, 2085, 2090, 2095, 2100];
export const BAU_TEMP_INCREASE = 3.3;
export const MIN_TEMP_INCREASE = 1.2;
export const TCRE_MEDIAN = 0.00115;
export const COVERAGE_CORRECTION = 0.05;
export const CARBON_BUDGET_1_5C = 300;
export const CARBON_BUDGET_2C = 900;
export const totalWorldPopulation = 8000;

// Noms des pays à afficher dans l'ordre pour le module Impact
export const displayOrder = [
  "Brésil", "Chili", "Émirats Arabes Unis", "États-Unis", "France", "Haïti", "Île Maurice",
  "Inde", "Mexique", "Sénégal", "Russie", "Vanuatu", "Égypte", "Chine"
];

// Scénarios d'impact alignés sur les seuils du GIEC
export const SCENARIOS = {
  "S0": { 
    label: "Inaction (BAU)", 
    color: "#e74c3c", 
    temp_2100: 4.5, 
    gdp_impact_short: +1.0, 
    gdp_impact_mid: -3.0, 
    gdp_impact_long: -8.0,
    insurance_multiplier: 6.4,
    political_risk_delta: +3.0
  },
  "S1": { 
    label: "Modéré (-20%)", 
    color: "#e67e22", 
    temp_2100: 3.5, 
    gdp_impact_short: -0.5, 
    gdp_impact_mid: -1.5, 
    gdp_impact_long: -2.0,
    insurance_multiplier: 3.2,
    political_risk_delta: +1.5
  },
  "S2": { 
    label: "Soutenu (-50%)", 
    color: "#f1c40f", 
    temp_2100: 2.7, 
    gdp_impact_short: -1.0, 
    gdp_impact_mid: -0.5, 
    gdp_impact_long: +1.5,
    insurance_multiplier: 1.8,
    political_risk_delta: 0
  },
  "S3": { 
    label: "Maximal (-80%)", 
    color: "#2ecc71", 
    temp_2100: 1.5, 
    gdp_impact_short: -2.5, 
    gdp_impact_mid: -1.0, 
    gdp_impact_long: +4.0,
    insurance_multiplier: 1.1,
    political_risk_delta: -1.0
  }
};