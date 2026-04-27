//config.js
/**
 * DOCUMENTATION DES SOURCES (v2.0)
 * baseEmissions : GtCO2e/an (Source: EDGAR v8.0 / IEA 2023, ref 2022-2023)
 * Les valeurs sont normalisées pour inclure le CO2, CH4 et N2O.
 */
export const DEBUG_TRAJECTORY = false; // Mode audit console pour generateTrajectory()

// Constantes climatiques
export const BAU_TEMP_INCREASE = 3.3; // Température maximale en 2100 (scénario BAU)
export const MIN_TEMP_INCREASE = 1.2;  // Température minimale atteignable
export const TCRE_MEDIAN = 0.00045;    // °C/GtCO2 — IPCC AR6 WG1 Table 5.7
export const COVERAGE_CORRECTION = 0.15; // °C — forçage résiduel pays non couverts + non-CO2

// Budgets carbone (baseline Jan 2025 — correction -200 GtCO2 vs 2020)
export const CARBON_BUDGET_1_5C = 300;  // Budget pour 1.5°C (50% probabilité)
export const CARBON_BUDGET_2C = 900;    // Budget pour 2°C (50% probabilité)

// Paramètres temporels
export const labels = [2025, 2030, 2040, 2050, 2060, 2070, 2080, 2090, 2100];
export const totalWorldPopulation = 8000; // Population mondiale en millions

// Référence BAU
export const BAU_EMISSIONS_2100 = 420; // Émissions totales pour atteindre 3.3°C en 2100 (GtCO2)
export const BAU_CUMULATIVE = BAU_EMISSIONS_2100 * 7.5; // Facteur intégré sur 75 ans (2025-2100)

// Ordre d'affichage des pays
export const displayOrder = [
    'Brésil', 'Chili', 'Émirats Arabes Unis', 'États-Unis', 'Russie',
    'France', 'Haïti', 'Île Maurice', 'Sénégal', 'Vanuatu',
    'Mexique', 'Chine', 'Inde', 'Égypte'
];