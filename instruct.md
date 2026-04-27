# INSTRUCT.md — Correctifs COP Simulator (croads-sim)
> Auteur : Alan Duval — Généré le 27 avril 2026
> Priorité : P1 (bloquant) → P2 → P3 → P4

---

## Contexte

Le simulateur climatique `croads-sim` présente quatre incohérences algorithmiques
identifiées par analyse comparative avec les données IPCC AR6 et la logique C-ROADS.
Les modifications portent sur deux fichiers : `config.js` et `chartService.js`.

---

## P1 — [BLOQUANT] Correction du `reductionRate` dans `generateTrajectory()`

### Fichier : `chartService.js` — Fonction : `generateTrajectory()`

### Problème
Le paramètre `reductionRate` est appliqué comme `(1 - rate/100) ** years`, ce qui
produit une décroissance de ~0.8%/an lorsque `rate` vaut déjà une fraction (0.80).
Résultat : les émissions cumulées sont ~7x trop élevées → température simulée +2.1°C
au lieu de +1.5°C pour les paramètres actuels.

### Correctif
Vérifier d'abord comment `rate` est transmis depuis l'interface (entier ex: 80, ou
fraction ex: 0.80), puis uniformiser :

```javascript
// AVANT (bug probable si rate est stocké en fraction)
e = peakEm * Math.pow(1 - rate / 100, yearsSinceRed);

// APRÈS — Option A : si rate est un entier (80 = 80%)
e = peakEm * Math.pow(1 - rate / 100, yearsSinceRed);
// → floor à 5% du pic
e = Math.max(e, peakEm * 0.05);

// APRÈS — Option B : si rate est une fraction (0.80 = 80%)
e = peakEm * Math.pow(1 - rate, yearsSinceRed);
// → floor à 5% du pic
e = Math.max(e, peakEm * 0.05);
```

### Vérification attendue
Avec les données du scénario validé (14 pays, paramètres fixes), la température
finale doit être comprise entre +1.25°C et +1.45°C avec l'Option B (taux annuel),
ou entre +1.65°C et +1.85°C avec l'Option A (réduction totale sur 75 ans).

> ⚠️ Ne pas modifier la logique de plateau ni de croissance — elles sont correctes.

---

## P2 — Mise à jour des budgets carbone (baseline 2020 → 2025)

### Fichier : `config.js`

### Problème
Les constantes `CARBON_BUDGET_1_5C = 400` et `CARBON_BUDGET_2C = 1000` sont calées
sur janvier 2020 (IPCC AR6). Entre 2020 et 2025, ~200 GtCO2 supplémentaires ont été
émis à l'échelle mondiale (~37 GtCO2/an × 5 ans). Les budgets affichés sont donc
systématiquement trop optimistes de ~50 à 100 GtCO2.

### Correctif

```javascript
// AVANT
const CARBON_BUDGET_1_5C = 400;  // GtCO2 — baseline 2020
const CARBON_BUDGET_2C   = 1000; // GtCO2 — baseline 2020

// APRÈS
const CARBON_BUDGET_1_5C = 300;  // GtCO2 — baseline 2025 (50% probabilité IPCC AR6)
const CARBON_BUDGET_2C   = 900;  // GtCO2 — baseline 2025 (67% probabilité IPCC AR6)
```

### Optionnel — Ajout d'une constante de référence documentée

```javascript
// Référence IPCC AR6 WG1 Ch.5 — budgets depuis Jan 2020
// 1.5°C : 500 GtCO2 (83% proba), 400 GtCO2 (67% proba), 300 GtCO2 (50% proba)
// 2.0°C : 1350 GtCO2 (83% proba), 1000 GtCO2 (67% proba), 900 GtCO2 (50% proba)
// Correction 2025 : soustraire ~200 GtCO2 (émissions 2020-2025)
const CARBON_BUDGET_BASELINE_YEAR = 2025;
const CARBON_BUDGET_1_5C = 300;
const CARBON_BUDGET_2C   = 900;
```

---

## P3 — Recalibration du facteur climatique (TCRE IPCC AR6)

### Fichier : `config.js` + `chartService.js` — Fonction : `calculateDynamicTemperature()`

### Problème
Le facteur de calibration actuel est dérivé du scénario BAU interne :
`(3.3 - 1.2) / 3150 ≈ 0.000667 °C/GtCO2`.
La TCRE médiane IPCC AR6 est de `0.00045 °C/GtCO2`.
Le modèle surestime la sensibilité climatique de +48%, ce qui accentue
artificiellement les résultats dans les scénarios peu ambitieux.

### Correctif

```javascript
// AVANT dans config.js ou chartService.js
const BAU_TEMP = 3.3;
const BAU_CUM  = 3150;
const CALIB_FACTOR = (BAU_TEMP - T_MIN) / BAU_CUM; // ≈ 0.000667

// APRÈS — Utiliser la TCRE médiane IPCC AR6
const TCRE_MEDIAN = 0.00045;   // °C/GtCO2 — IPCC AR6 WG1 Table 5.7
const TCRE_HIGH   = 0.000670;  // °C/GtCO2 — borne haute (actuelle)
const TCRE_LOW    = 0.000270;  // °C/GtCO2 — borne basse

// Utiliser TCRE_MEDIAN par défaut dans calculateDynamicTemperature()
const CALIB_FACTOR = TCRE_MEDIAN;
```

### Note pédagogique
Pour un usage scolaire, il est possible de proposer un sélecteur
"Sensibilité climatique : Faible / Médiane / Élevée" mappé sur les trois constantes.
Cela illustre l'incertitude scientifique sans invalider le modèle.

---

## P4 — Facteur correctif émissions non couvertes + forçages non-CO2

### Fichier : `config.js`

### Problème
Les 14 pays couvrent ~84% de la population mondiale mais seulement ~63% des
émissions mondiales de CO2. Les émissions des pays non représentés (~13 GtCO2/an)
et les forçages non-CO2 (méthane CH4, N2O, aérosols) représentent collectivement
un forçage additionnel estimé à +0.15°C à +0.20°C sur la température finale 2100.

### Correctif

```javascript
// Dans config.js — ajouter :
const COVERAGE_CORRECTION = 0.15; // °C — forçage résiduel pays non couverts + non-CO2

// Dans calculateDynamicTemperature() — modifier le calcul final :
// AVANT
const Timmediate = T_MIN + (cumulativeEmissions * CALIB_FACTOR);

// APRÈS
const Timmediate = T_MIN + (cumulativeEmissions * CALIB_FACTOR) + COVERAGE_CORRECTION;
```

> ⚠️ Ce correctif est optionnel pour un usage pédagogique de base. Il est recommandé
> si le simulateur est utilisé pour des comparaisons quantitatives avec des rapports
> officiels (GIEC, UNEP Emissions Gap Report).

---

## Récapitulatif des fichiers à modifier

| Fichier | Section | Priorité | Nature |
|---|---|---|---|
| `config.js` | `CARBON_BUDGET_1_5C` | P2 | Valeur : 400 → 300 |
| `config.js` | `CARBON_BUDGET_2C` | P2 | Valeur : 1000 → 900 |
| `config.js` | `CALIB_FACTOR` | P3 | Valeur : 0.000667 → 0.00045 |
| `config.js` | `COVERAGE_CORRECTION` | P4 | Ajout : +0.15°C |
| `chartService.js` | `generateTrajectory()` | P1 | Bug double division rate |
| `chartService.js` | `calculateDynamicTemperature()` | P3/P4 | Intégrer TCRE + correction |

---

## Résultats attendus après correction complète (P1+P2+P3+P4)

Avec le scénario de référence validé (14 pays, 84.1% pop. mondiale) :

| Indicateur | Avant correctifs | Après P1+P2+P3+P4 |
|---|---|---|
| Température 2100 | ~1.5°C (artefact) | ~1.4°C à 1.6°C |
| Budget 1.5°C utilisé | ~3% (trop optimiste) | ~100-110% (réaliste) |
| Budget 2°C utilisé | ~1% (trop optimiste) | ~35-40% (réaliste) |
| Cohérence IPCC AR6 | Partielle | Bonne (modèle simplifié) |

---

## Contraintes techniques à respecter

- Maintenir la réactivité temps-réel de `updateTemperatureDisplay()` (pas de calcul bloquant)
- Ne pas modifier la logique de coloration dynamique (vert/orange/rouge) — elle reste valide
- Conserver le lissage d'inertie thermique : `Tt = (Timm + 2 * Tt-1) / 3`
- Tester le rendu sur les scénarios extrêmes : tous à 2100 (aucun effort) et tous à 2025 (effort maximal)
- Fichiers : garder sous 150 lignes maximum conformément à l'architecture du projet

---

*Fin du fichier instruct.md*
