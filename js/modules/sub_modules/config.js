//config.js
// Constantes climatiques
export const BAU_TEMP_INCREASE = 3.3; // Température maximale en 2100 (scénario BAU)
export const MIN_TEMP_INCREASE = 1.2;  // Température minimale atteignable
export const CARBON_SENSITIVITY = 0.0008; // Ajusté pour atteindre 3.3°C
export const CARBON_BUDGET_1_5C = 400;  // Budget carbone pour 1.5°C (GtCO2)
export const CARBON_BUDGET_2C = 1000;   // Budget carbone pour 2°C (GtCO2)

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