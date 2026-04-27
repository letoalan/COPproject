import { countryData, getCountryByName } from './dataService.js';
import { displayOrder } from './config.js';
import { COUNTRY_IMPACT_DATA } from './impactData.js';

export let currentDistribution = {};

// Mise à jour de l'affichage des fonds (pour l'onglet C-Roads)
export function updateFundsDisplay() {
    const totalFunds = calculateTotalFunds();
    currentDistribution = distributeGreenFunds(totalFunds);
    renderFundsTable(totalFunds, currentDistribution);
}

function calculateTotalFunds() {
    return countryData.reduce((sum, c) => sum + (c.allocatedFunds || 0), 0);
}

/**
 * Algorithme de distribution v4 (Pure Logic)
 * Peut être appelé par n'importe quel module
 */
export function distributeGreenFunds(total, basePoolArg = null) {
  if (total <= 0) return {};

  // Déterminer le pool de base (scénario) pour les plafonds absolus
  // Si non fourni, on tente de le détecter (150, 450, 900)
  const basePool = basePoolArg || [900, 450, 150].find(p => total >= p * 0.5) || 900;

  const globalShare = Math.round(total * 0.15);
  const availableForSelected = total - globalShare;

  // ── SCORES ────────────────────────────────────────────────────────────────
  const scores = {};
  let totalScore = 0;

  displayOrder.forEach(name => {
    const countrySim   = getCountryByName(name);
    const countryImpact = COUNTRY_IMPACT_DATA[name];
    if (!countrySim || !countryImpact) { scores[name] = 0; return; }

    const vuln = countryImpact.climate_vuln_index || 3.0;
    const pop  = countrySim.population;

    // FIX Bug 2 — réduire l'exposant poverty à 0.4 pour limiter la saturation
    const pib_per_hab     = countryImpact.gdp_mrd / pop;
    const poverty_factor  = 1 / Math.max(0.1, pib_per_hab);
    const poverty_weighted = Math.pow(poverty_factor, 0.4); // 0.7 → 0.4

    const emissions           = countryImpact.base_emissions_mtco2 || 0;
    const responsibility_malus = 1 + (emissions / 2000);

    // FIX Bug 2 (suite) — introduire log(pop) pour pondérer démographiquement
    // sans laisser les géants dominer totalement
    const pop_factor = Math.log10(Math.max(1, pop)); // log₁₀ : 1→0, 17→1.23, 1420→3.15

    let score = (vuln * vuln * pop_factor * poverty_weighted) / responsibility_malus;

    if (countrySim.vulnerability === 'low') score = 0;
    if (['Haïti', 'Vanuatu', 'Île Maurice'].includes(name)) score *= 2.5;

    scores[name] = score;
    totalScore  += score;
  });

  // ── RÉPARTITION ───────────────────────────────────────────────────────────
  const distribution = { 'Reste du monde': globalShare };
  let remaining = availableForSelected;
  const locked  = new Set();
  displayOrder.forEach(name => distribution[name] = 0);

  // A. Planchers SIDS (inchangés — corrects)
  const floors = { 'Haïti': 30, 'Vanuatu': 25, 'Île Maurice': 12 };
  Object.entries(floors).forEach(([name, floor]) => {
    if (remaining > floor) {
      distribution[name] = floor;
      remaining -= floor;
      locked.add(name);
    }
  });

  // FIX Bug 3 — calculer otherTotalScore APRÈS lock des SIDS
  const CHINA_CAP = 15;
  const otherTotalScore = displayOrder.reduce(
    (s, n) => s + (locked.has(n) ? 0 : scores[n]), 0
  );
  if (scores['Chine'] > 0 && otherTotalScore > 0) {
    const chinaShare = (scores['Chine'] / otherTotalScore) * remaining;
    if (chinaShare > CHINA_CAP) {
      distribution['Chine'] = CHINA_CAP;
      remaining -= CHINA_CAP;
      locked.add('Chine');
    }
  }

  // FIX Bug 1 — GLOBAL_CAP absolu par scénario (pour éviter l'explosion en mode optimiste)
  // Cap min = 3 Mrd€, cap max indexé sur le scénario de base
  const SCENARIO_ABSOLUTE_CAPS = { 150: 30, 450: 85, 900: 160 };
  const BASE_CAP = SCENARIO_ABSOLUTE_CAPS[basePool] || Math.floor(availableForSelected * 0.17);
  
  const MAX_POP_LOG = Math.log10(1420); // Inde = référence max

  function getCountryCap(name) {
    const pop     = getCountryByName(name)?.population || 1;
    const popRatio = Math.log10(Math.max(1, pop)) / MAX_POP_LOG; // 0→1
    // Cap entre 3 Mrd€ (SIDS) et BASE_CAP (Inde-like)
    return Math.max(3, Math.floor(BASE_CAP * (0.2 + 0.8 * popRatio)));
  }

  // C. Boucle prorata avec cap individualisé
  let needsRedistribution = true;
  while (needsRedistribution && remaining > 0) {
    needsRedistribution = false;
    const currentTotalScore = displayOrder.reduce(
      (s, n) => s + (locked.has(n) ? 0 : scores[n]), 0
    );
    if (currentTotalScore <= 0) break;

    for (const name of displayOrder) {
      if (locked.has(name) || scores[name] <= 0) continue;
      const cap   = getCountryCap(name);
      const share = Math.floor(remaining * (scores[name] / currentTotalScore));
      if (distribution[name] + share >= cap) {
        const allowed = cap - distribution[name];
        distribution[name]  = cap;
        remaining          -= allowed;
        locked.add(name);
        needsRedistribution = true;
        break;
      }
    }

    if (!needsRedistribution) {
      const ct2 = displayOrder.reduce((s, n) => s + (locked.has(n) ? 0 : scores[n]), 0);
      if (ct2 > 0) {
        displayOrder.forEach(name => {
          if (locked.has(name) || scores[name] <= 0) return;
          const share = Math.floor(remaining * (scores[name] / ct2));
          distribution[name] += share;
          remaining          -= share;
        });
      }
      // Reliquat arrondi
      let safety = 0;
      while (remaining > 0 && safety++ < 100) {
        const candidates = displayOrder
          .filter(n => !locked.has(n) && scores[n] > 0 && distribution[n] < getCountryCap(n))
          .sort((a, b) => scores[b] - scores[a]);
        if (!candidates.length) break;
        distribution[candidates[0]] += 1;
        remaining -= 1;
      }
      if (remaining > 0) { distribution['Reste du monde'] += remaining; remaining = 0; }
    }
  }
  return distribution;
}

// FIX Bug 4 — renderFundsTable corrigée
function renderFundsTable(totalFunds, distribution) {
  const fundsSummary = document.getElementById('fundsSummary');
  if (!fundsSummary) return;

  let tableHtml = `
      <div class="funds-title">Fonds Verts pour le Climat</div>
      <div class="funds-total">Total des fonds: ${totalFunds.toLocaleString()} Mrd €</div>
      <div class="funds-table-container">
          <table class="funds-table">
              <thead>
                  <tr>
                      <th>Pays/Région</th>
                      <th>Contribution (Mrd €)</th>
                      <th>Allocation Projetée (Mrd €)</th>
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      <td><strong>Reste du monde</strong></td>
                      <td>-</td>
                      <td><strong>${distribution['Reste du monde']?.toLocaleString() || 0}</strong></td>
                  </tr>
  `;

  displayOrder.forEach(name => {
      const country = getCountryByName(name);
      const contrib = country?.allocatedFunds || 0;
      const alloc = distribution[name] || 0;
      tableHtml += `
          <tr>
              <td>${name}</td>
              <td>${contrib.toLocaleString()}</td>
              <td>${alloc.toLocaleString()}</td>
          </tr>
      `;
  });

  tableHtml += `
              </tbody>
          </table>
      </div>
  `;
  fundsSummary.innerHTML = tableHtml;
}
// Configuration des infobulles
function setupTooltips(tooltipContents) {
    document.querySelectorAll('.benefit-cell').forEach(cell => {
        const countryName = cell.getAttribute('data-country');
        const content = tooltipContents[countryName] || [];

        if (content.length > 0) {
            cell.addEventListener('mouseenter', (e) => showTooltip(e, content));
            cell.addEventListener('mouseleave', hideTooltip);
            cell.style.cursor = 'help';
        }
    });
}

// Affichage d'une infobulle
function showTooltip(event, content) {
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.innerHTML = `
        <div class="tooltip-header">Détails de répartition:</div>
        <ul>
            ${content.map(item => `<li>${item}</li>`).join('')}
        </ul>
    `;

    document.body.appendChild(tooltip);
    positionTooltip(tooltip, event);
}

// Masquage d'une infobulle
function hideTooltip() {
    const tooltip = document.querySelector('.custom-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Positionnement d'une infobulle
function positionTooltip(tooltip, event) {
    const rect = event.target.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    let top = rect.bottom + scrollY + 5;
    let left = rect.left + scrollX;

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
    tooltip.style.opacity = '1';
}