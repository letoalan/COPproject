// fundService.js
import { countryData, getCountryByName } from './dataService.js';
import { displayOrder } from './config.js';

// Mise à jour de l'affichage des fonds
export function updateFundsDisplay() {
    const totalFunds = calculateTotalFunds();
    const distribution = distributeGreenFunds(totalFunds);
    renderFundsTable(totalFunds, distribution);
}

function calculateTotalFunds() {
    return countryData.reduce((sum, c) => sum + c.allocatedFunds, 0);
}

function distributeGreenFunds(total) {
    // 1. Réserver 15% pour le Reste du monde (au lieu de 10% précédemment)
    const globalShare = Math.round(total * 0.15);
    const remaining = total - globalShare;

    const distribution = {
        'Reste du monde': globalShare
    };

    const countries = countryData.map(c => c.name);

    // Facteurs de base révisés
    const factors = {
        'Brésil': 0.14,
        'République Populaire de Chine': 0.12,
        'États-Unis': 0.05,
        'France': 0.07,
        'Mexique': 0.07,
        'Chili': 0.06,
        'Emirats arabes unis': 0.05,
        'Russie': 0.02,
        'Sénégal': 0.09,
        'Vanuatu': 0.04,
        'Ile Maurice': 0.03,
        'Haïti': 0.04
    };

    // Ratios idéaux ajustés
    const idealRatios = {
        'Brésil': 3,
        'République Populaire de Chine': 80,
        'États-Unis': 150,
        'France': 60,
        'Mexique': 6,
        'Chili': 4,
        'Emirats arabes unis': 40,
        'Russie': 50,
        'Sénégal': 0.1,
        'Vanuatu': 0.08,
        'Ile Maurice': 0.1,
        'Haïti': 0.05
    };

    let remainingTotal = remaining;

    // Distribution initiale
    countries.forEach(country => {
        const baseAllocation = Math.round(remaining * (factors[country] || 0));
        distribution[country] = baseAllocation;
        remainingTotal -= baseAllocation;
    });

    // Ajustement spécial pour le Sénégal
    if (distribution['Sénégal'] < (remaining * 0.05)) {
        distribution['Sénégal'] = Math.round(remaining * 0.05);
        remainingTotal += distribution['Sénégal'];
    }

    // Ajustement basé sur les ratios
    countries.forEach(country => {
        const countryObj = getCountryByName(country);
        const contribution = countryObj?.allocatedFunds || 0;
        const currentAllocation = distribution[country];

        const actualRatio = contribution > 0 ? currentAllocation / contribution : 0;
        const idealRatio = idealRatios[country] || 0;
        let ratioDeviation = Math.abs(actualRatio - idealRatio);

        if (country === 'États-Unis' || country === 'Russie') {
            ratioDeviation *= 1.5;
        } else if (['Sénégal', 'Vanuatu', 'Haïti'].includes(country)) {
            ratioDeviation *= 0.5;
        }

        const adjustmentFactor = 1 - (ratioDeviation / (idealRatio + 1));
        const adjustment = Math.round(remainingTotal * adjustmentFactor * (factors[country] || 0));

        distribution[country] += adjustment;
        remainingTotal -= adjustment;
    });

    // Allocation minimale pour les pays vulnérables
    const vulnerableCountries = ['Sénégal', 'Vanuatu', 'Haïti'];
    vulnerableCountries.forEach(country => {
        const minAllocation = Math.round(remaining * 0.04);
        if (distribution[country] < minAllocation) {
            remainingTotal += distribution[country];
            distribution[country] = minAllocation;
            remainingTotal -= minAllocation;
        }
    });

    // Répartition du reste (priorité aux pays en développement)
    const developingCountries = countries.filter(c =>
        !['États-Unis', 'Russie', 'France', 'Emirats arabes unis'].includes(c)
    );
    const devFactorSum = developingCountries.reduce((sum, c) => sum + (factors[c] || 0), 0);

    developingCountries.forEach(country => {
        const share = (factors[country] || 0) / devFactorSum;
        distribution[country] += Math.round(remainingTotal * share);
    });

    return distribution;
}

function renderFundsTable(totalFunds, distribution) {
    const fundsSummary = document.getElementById("fundsSummary");

    fundsSummary.innerHTML = `
        <div class="funds-title">Fonds Verts pour le Climat</div>
        <div class="funds-total">
            Total des fonds: ${totalFunds.toLocaleString()} Mrd €
        </div>
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
                    ${displayOrder.map(name => {
        const country = getCountryByName(name);
        return `
                            <tr>
                                <td>${name}</td>
                                <td>${country?.allocatedFunds?.toLocaleString() || 0}</td>
                                <td>${distribution[name]?.toLocaleString() || 0}</td>
                            </tr>
                        `;
    }).join('')}
                </tbody>
            </table>
        </div>
    `;
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