// impactData.js
// Format : données économiques et géopolitiques de référence 2024
export const COUNTRY_IMPACT_DATA = {
  "France": {
    name: "France",
    flag: "medias/images/flags/france.svg",
    gdp_mrd: 2800,
    debt_pct_gdp: 111,
    fossil_dependency_pct: 46,
    climate_vuln_index: 3.2,
    political_stability: 6.1,
    base_emissions_mtco2: 400,
    base_empreinte_t: 8.2,
    insurance_climate_cost_pct_gdp: 0.8,
    sectors_weight: { transport: 29, building: 18, industry: 19, agriculture: 18, energy: 10, waste: 6 }
  },
  "Chine": {
    name: "Chine",
    flag: "medias/images/flags/republique-populaire-de-chine.svg",
    gdp_mrd: 17500, debt_pct_gdp: 83, fossil_dependency_pct: 84,
    climate_vuln_index: 5.1, political_stability: 4.8,
    base_emissions_mtco2: 12000, base_empreinte_t: 8.5,
    insurance_climate_cost_pct_gdp: 1.1,
    sectors_weight: { transport: 10, building: 20, industry: 39, agriculture: 11, energy: 14, waste: 6 }
  },
  "États-Unis": {
    name: "États-Unis",
    flag: "medias/images/flags/etats-unis.svg",
    gdp_mrd: 25400, debt_pct_gdp: 123, fossil_dependency_pct: 79,
    climate_vuln_index: 4.3, political_stability: 5.2,
    base_emissions_mtco2: 5800, base_empreinte_t: 16.0,
    insurance_climate_cost_pct_gdp: 1.4,
    sectors_weight: { transport: 29, building: 13, industry: 23, agriculture: 10, energy: 25, waste: 0 }
  },
  "Inde": {
    name: "Inde",
    flag: "medias/images/flags/inde.svg",
    gdp_mrd: 3700, debt_pct_gdp: 81, fossil_dependency_pct: 74,
    climate_vuln_index: 7.2, political_stability: 4.1,
    base_emissions_mtco2: 3700, base_empreinte_t: 2.4,
    insurance_climate_cost_pct_gdp: 1.8,
    sectors_weight: { transport: 12, building: 22, industry: 34, agriculture: 14, energy: 14, waste: 4 }
  },
  "Russie": {
    name: "Russie",
    flag: "medias/images/flags/russie.svg",
    gdp_mrd: 2200, debt_pct_gdp: 17, fossil_dependency_pct: 86,
    climate_vuln_index: 4.8, political_stability: 3.5,
    base_emissions_mtco2: 1680, base_empreinte_t: 12.7,
    insurance_climate_cost_pct_gdp: 0.6,
    sectors_weight: { transport: 14, building: 26, industry: 33, agriculture: 6, energy: 19, waste: 2 }
  },
  "Brésil": {
    name: "Brésil",
    flag: "medias/images/flags/bresil.svg",
    gdp_mrd: 1900, debt_pct_gdp: 88, fossil_dependency_pct: 44,
    climate_vuln_index: 6.4, political_stability: 4.5,
    base_emissions_mtco2: 520, base_empreinte_t: 2.4,
    insurance_climate_cost_pct_gdp: 2.1,
    sectors_weight: { transport: 18, building: 8, industry: 19, agriculture: 27, energy: 16, waste: 12 }
  },
  "Mexique": {
    name: "Mexique",
    flag: "medias/images/flags/mexique.svg",
    gdp_mrd: 1300, debt_pct_gdp: 54, fossil_dependency_pct: 88,
    climate_vuln_index: 6.1, political_stability: 4.2,
    base_emissions_mtco2: 650, base_empreinte_t: 4.9,
    insurance_climate_cost_pct_gdp: 1.5,
    sectors_weight: { transport: 25, building: 16, industry: 22, agriculture: 12, energy: 20, waste: 5 }
  },
  "Chili": {
    name: "Chili",
    flag: "medias/images/flags/chili.svg",
    gdp_mrd: 310, debt_pct_gdp: 37, fossil_dependency_pct: 68,
    climate_vuln_index: 5.8, political_stability: 5.6,
    base_emissions_mtco2: 95, base_empreinte_t: 4.7,
    insurance_climate_cost_pct_gdp: 1.2,
    sectors_weight: { transport: 26, building: 12, industry: 28, agriculture: 15, energy: 14, waste: 5 }
  },
  "Émirats Arabes Unis": {
    name: "Émirats Arabes Unis",
    flag: "medias/images/flags/emirats-arabes-unis.svg",
    gdp_mrd: 500, debt_pct_gdp: 30, fossil_dependency_pct: 98,
    climate_vuln_index: 5.2, political_stability: 6.8,
    base_emissions_mtco2: 250, base_empreinte_t: 25.0,
    insurance_climate_cost_pct_gdp: 0.9,
    sectors_weight: { transport: 17, building: 29, industry: 30, agriculture: 2, energy: 22, waste: 0 }
  },
  "Égypte": {
    name: "Égypte",
    flag: "medias/images/flags/egypte.svg",
    gdp_mrd: 400, debt_pct_gdp: 92, fossil_dependency_pct: 95,
    climate_vuln_index: 7.8, political_stability: 3.9,
    base_emissions_mtco2: 260, base_empreinte_t: 2.5,
    insurance_climate_cost_pct_gdp: 2.4,
    sectors_weight: { transport: 21, building: 24, industry: 28, agriculture: 11, energy: 13, waste: 3 }
  },
  "Haïti": {
    name: "Haïti",
    flag: "medias/images/flags/haiti.svg",
    gdp_mrd: 20, debt_pct_gdp: 23, fossil_dependency_pct: 77,
    climate_vuln_index: 9.2, political_stability: 1.4,
    base_emissions_mtco2: 20, base_empreinte_t: 0.6,
    insurance_climate_cost_pct_gdp: 4.8,
    sectors_weight: { transport: 22, building: 19, industry: 11, agriculture: 38, energy: 8, waste: 2 }
  },
  "Sénégal": {
    name: "Sénégal",
    flag: "medias/images/flags/senegal.svg",
    gdp_mrd: 27, debt_pct_gdp: 68, fossil_dependency_pct: 72,
    climate_vuln_index: 8.1, political_stability: 5.2,
    base_emissions_mtco2: 70, base_empreinte_t: 0.4,
    insurance_climate_cost_pct_gdp: 3.1,
    sectors_weight: { transport: 19, building: 14, industry: 14, agriculture: 42, energy: 9, waste: 2 }
  },
  "Vanuatu": {
    name: "Vanuatu",
    flag: "medias/images/flags/vanuatu.svg",
    gdp_mrd: 1, debt_pct_gdp: 45, fossil_dependency_pct: 81,
    climate_vuln_index: 9.8, political_stability: 5.1,
    base_emissions_mtco2: 1, base_empreinte_t: 0.8,
    insurance_climate_cost_pct_gdp: 6.2,
    sectors_weight: { transport: 31, building: 12, industry: 6, agriculture: 44, energy: 5, waste: 2 }
  },
  "Île Maurice": {
    name: "Île Maurice",
    flag: "medias/images/flags/ile-maurice.svg",
    gdp_mrd: 14, debt_pct_gdp: 88, fossil_dependency_pct: 77,
    climate_vuln_index: 7.4, political_stability: 6.5,
    base_emissions_mtco2: 10, base_empreinte_t: 3.2,
    insurance_climate_cost_pct_gdp: 3.8,
    sectors_weight: { transport: 28, building: 18, industry: 20, agriculture: 10, energy: 18, waste: 6 }
  }
};
