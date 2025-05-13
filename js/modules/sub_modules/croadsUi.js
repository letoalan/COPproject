import { countryData } from './dataService.js';
import { emissionsChart, updateCharts, updateTemperatureProjection } from './chartService.js';
import { updateFundsDisplay } from './fundService.js';

let currentTooltip = null;
let currentRowIndex = 0;
let currentMode = 'dashboard';

export function initializeUI() {
    console.log('[croadsUi] initializeUI called, countryData:', countryData);
    createTableRows();
    setupLegendToggle();
    setupTableEventListeners();
    // Vider le conteneur de présentation pour éviter tout affichage prématuré
    const presentationContainer = document.getElementById('presentationTableContainer');
    if (presentationContainer) {
        presentationContainer.innerHTML = '';
        console.log('[croadsUi] Cleared presentationTableContainer on init');
    }
}

export function createTableRows() {
    const tbody = document.getElementById('countryTableBody');
    if (!tbody) {
        console.warn('[croadsUi] Table body not found');
        return;
    }

    tbody.innerHTML = '';

    if (!countryData || countryData.length === 0) {
        console.warn('[croadsUi] countryData is empty or undefined');
        return;
    }

    countryData.forEach((country, index) => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = country.name || 'Unknown';
        nameCell.setAttribute('data-tooltip', country.tooltip || 'No details available');
        row.appendChild(nameCell);

        for (let i = 0; i < 6; i++) {
            const cell = document.createElement('td');
            const input = createInputForCell(i, index, country);
            cell.appendChild(input);
            row.appendChild(cell);
        }

        tbody.appendChild(row);
    });
}

function createInputForCell(inputIndex, countryIndex, country) {
    const input = document.createElement('input');
    input.type = 'number';
    input.dataset.countryIndex = countryIndex;
    input.dataset.inputIndex = inputIndex;

    switch (inputIndex) {
        case 0: // Année pic
            input.min = 2025;
            input.max = 2100;
            input.value = country.peakYear || (country.name === 'Chine' ? 2060 : 2100);
            break;
        case 1: // Année réduction
            input.min = 2025;
            input.max = 2100;
            input.value = country.reductionYear || (country.name === 'Chine' ? 2060 : 2100);
            break;
        case 2: // Taux réduction (%)
            input.min = 0;
            input.max = 100;
            input.value = country.reduction || (country.name === 'Chine' ? 5 : 0);
            break;
        case 3: // Déforestation (%)
            input.min = 0;
            input.max = 100;
            input.value = country.deforestation || 0;
            break;
        case 4: // Reforestation (%)
            input.min = 0;
            input.max = 100;
            input.value = country.reforestation || 0;
            break;
        case 5: // Fonds alloués (Mrd €)
            input.min = 0;
            input.value = country.allocatedFunds || 0;
            break;
    }

    return input;
}

function setupTableEventListeners() {
    const tbody = document.getElementById('countryTableBody');
    if (!tbody) return;

    tbody.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT') {
            const input = e.target;
            const countryIndex = parseInt(input.dataset.countryIndex);
            const inputIndex = parseInt(input.dataset.inputIndex);
            const value = input.value;

            if (inputIndex === 5) {
                handleFundsInput(countryIndex, value);
            } else {
                handleChartInput(countryIndex, inputIndex, value);
            }

            // Synchroniser avec le mode présentation si actif
            if (currentMode === 'presentation' && countryIndex === currentRowIndex) {
                updatePresentationTable();
            }
        }
    });
}

function handleFundsInput(countryIndex, value) {
    if (countryData[countryIndex]) {
        countryData[countryIndex].allocatedFunds = Math.max(0, Number(value));
        updateFundsDisplay();
    }
}

function handleChartInput(countryIndex, inputIndex, value) {
    const country = countryData[countryIndex];
    if (!country) return;

    switch (inputIndex) {
        case 0: country.peakYear = Number(value); break;
        case 1: country.reductionYear = Number(value); break;
        case 2: country.reduction = Number(value); break;
        case 3: country.deforestation = Number(value); break;
        case 4: country.reforestation = Number(value); break;
    }

    updateCharts();
    updateTemperatureProjection();
}

function setupLegendToggle() {
    const toggleBtn = document.querySelector('.legend-toggle');
    const legend = document.getElementById('customLegend');
    if (!toggleBtn || !legend) return;

    toggleBtn.addEventListener('click', () => {
        legend.classList.toggle('hidden');
        toggleBtn.classList.toggle('collapsed');
        setTimeout(() => {
            if (emissionsChart) emissionsChart.resize();
        }, 300);
    });
}

export function showTooltip(element, content) {
    if (currentTooltip) hideTooltip();

    currentTooltip = document.createElement('div');
    currentTooltip.className = 'custom-tooltip';
    currentTooltip.innerHTML = Array.isArray(content)
        ? `<div class="tooltip-header">Détails :</div><ul>${content.map(item => `<li>${item}</li>`).join('')}</ul>`
        : content;

    document.body.appendChild(currentTooltip);
    positionTooltip(element, currentTooltip);
    currentTooltip.style.opacity = '1';
}

export function hideTooltip() {
    if (currentTooltip) {
        currentTooltip.remove();
        currentTooltip = null;
    }
}

export function positionTooltip(element, tooltip) {
    const rect = element.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    const tooltipRect = tooltip.getBoundingClientRect();

    let top = rect.bottom + scrollY + 5;
    let left = rect.left + scrollX + (rect.width / 2) - (tooltipRect.width / 2);

    if (top + tooltipRect.height > window.innerHeight + scrollY) {
        top = rect.top + scrollY - tooltipRect.height - 5;
    }
    if (left < scrollX) left = scrollX + 5;
    if (left + tooltipRect.width > window.innerWidth + scrollX) {
        left = window.innerWidth + scrollX - tooltipRect.width - 5;
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
}

export function showError(error) {
    console.error('[croadsUi] UI Error:', error);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-container';
    errorDiv.innerHTML = `
        <h2>Erreur de chargement</h2>
        <p>${error.message || 'Erreur inconnue'}</p>
        <button id="reloadButton" class="reload-btn">Recharger</button>
    `;
    document.body.appendChild(errorDiv);

    document.getElementById('reloadButton')?.addEventListener('click', () => {
        window.location.reload();
    });
}

export function toggleDatasetVisibility(index) {
    if (!emissionsChart) return;

    const meta = emissionsChart.getDatasetMeta(index);
    meta.hidden = meta.hidden === null ? !emissionsChart.data.datasets[index].hidden : null;
    emissionsChart.update();
}

export function setupPresentationMode() {
    console.log('[croadsUi] Setting up presentation mode');

    const presentationBtn = document.getElementById('presentationModeBtn');
    const dashboardBtn = document.getElementById('dashboardModeBtn');
    if (!presentationBtn || !dashboardBtn) {
        console.warn('[croadsUi] Mode buttons not found:', { presentationBtn, dashboardBtn });
        return;
    }

    let presentationModeDiv = document.getElementById('presentationMode');
    if (!presentationModeDiv) {
        console.warn('[croadsUi] Presentation mode container not found');
        return;
    }
    presentationModeDiv.style.display = 'none';

    const normalModeDiv = document.querySelector('.normal-mode');
    if (!normalModeDiv) {
        console.warn('[croadsUi] Normal mode container not found');
        return;
    }
    normalModeDiv.style.display = 'block';

    const rows = Array.from(document.querySelectorAll("#countryTableBody tr"));
    if (rows.length === 0) {
        console.warn('[croadsUi] No country rows found in table');
        return;
    }

    let prevBtn = document.getElementById('prevRow');
    let nextBtn = document.getElementById('nextRow');
    if (!prevBtn || !nextBtn) {
        console.warn('[croadsUi] Navigation buttons not found');
        return;
    }

    const originalPositions = new Map();

    function updateRowCounter() {
        const counterElement = document.getElementById('rowCounter');
        if (counterElement) {
            const countryName = countryData[currentRowIndex]?.name || 'Inconnu';
            counterElement.textContent = `${currentRowIndex + 1}/${rows.length} (${countryName})`;
            console.log('[croadsUi] Row counter updated:', counterElement.textContent);
        }
    }

    // Ajouter les écouteurs d'événements sans remplacer les boutons
    presentationBtn.addEventListener('click', () => {
        togglePresentationMode(true);
        console.log('[croadsUi] Presentation button clicked');
    });
    dashboardBtn.addEventListener('click', () => {
        togglePresentationMode(false);
        console.log('[croadsUi] Dashboard button clicked');
    });
    prevBtn.addEventListener('click', showPreviousRow);
    nextBtn.addEventListener('click', showNextRow);
    document.addEventListener('keydown', handleKeyNavigation);

    // Définir l'état initial des boutons
    presentationBtn.style.display = 'block';
    dashboardBtn.style.display = 'none';
    console.log('[croadsUi] Initial button state: presentation=block, dashboard=none');

    function togglePresentationMode(showPresentation) {
        const tab = document.getElementById('croads-tab');
        if (!tab || tab.style.display !== 'block') {
            console.warn('[croadsUi] Onglet croads-tab non visible, report du changement de mode');
            return;
        }

        const mainHeader = document.getElementById('main-header');
        const mainFooter = document.getElementById('main-footer');

        if (showPresentation) {
            currentMode = 'presentation';
            normalModeDiv.style.display = 'none';
            presentationModeDiv.classList.add('active');
            presentationModeDiv.style.display = 'flex';

            if (mainHeader) mainHeader.style.display = 'none';
            if (mainFooter) mainFooter.style.display = 'none';

            moveElementsToPresentation();
            updatePresentationTable();
            dashboardBtn.style.display = 'block';
            presentationBtn.style.display = 'none';
            console.log('[croadsUi] Switched to presentation mode: dashboard=block, presentation=none');
        } else {
            currentMode = 'dashboard';
            normalModeDiv.style.display = 'block';
            presentationModeDiv.classList.remove('active');
            presentationModeDiv.style.display = 'none';

            if (mainHeader) mainHeader.style.display = 'block';
            if (mainFooter) mainFooter.style.display = 'block';

            moveElementsToNormal();
            dashboardBtn.style.display = 'none';
            presentationBtn.style.display = 'block';
            console.log('[croadsUi] Switched to dashboard mode: dashboard=none, presentation=block');
        }
    }

    function updatePresentationTable() {
        const tab = document.getElementById('croads-tab');
        const presentationMode = document.getElementById('presentationMode');
        if (!tab || tab.style.display !== 'block' || !presentationMode || !presentationMode.classList.contains('active')) {
            console.log('[croadsUi] Skipping updatePresentationTable: tab or presentation mode not active');
            return;
        }

        const container = document.getElementById('presentationTableContainer');
        if (!container) {
            console.warn('[croadsUi] Container for presentation table not found');
            return;
        }

        if (!countryData || !countryData[currentRowIndex]) {
            console.warn('[croadsUi] Country data not available at index', currentRowIndex);
            container.innerHTML = '<p>Données pays non disponibles</p>';
            return;
        }

        const country = countryData[currentRowIndex];
        console.log('[croadsUi] Updating presentation table for country:', country.name);

        container.innerHTML = `
            <div class="country-info">
                <div class="country-name-presentation">${country.name}</div>
            </div>
            <div class="input-group">
                <label>Année pic</label>
                <input type="number" data-key="peakYear" data-country-index="${currentRowIndex}" data-input-index="0" value="${country.peakYear || 0}" min="2025" max="2100" style="text-align: center; color: black; font-weight: bold; width: auto; padding: 0.1rem 0.3rem; border: 1px solid #003366; border-radius: 4px; font-size: 0.7rem;">
            </div>
            <div class="input-group">
                <label>Année réduction</label>
                <input type="number" data-key="reductionYear" data-country-index="${currentRowIndex}" data-input-index="1" value="${country.reductionYear || 0}" min="2025" max="2100" style="text-align: center; color: black; font-weight: bold; width: auto; padding: 0.1rem 0.3rem; border: 1px solid #003366; border-radius: 4px; font-size: 0.7rem;">
            </div>
            <div class="input-group">
                <label>Réduction (%)</label>
                <input type="number" data-key="reduction" data-country-index="${currentRowIndex}" data-input-index="2" value="${country.reduction || 0}" min="0" max="100" style="text-align: center; color: black; font-weight: bold; width: auto; padding: 0.1rem 0.3rem; border: 1px solid #003366; border-radius: 4px; font-size: 0.7rem;">
            </div>
            <div class="input-group">
                <label>Déforestation (%)</label>
                <input type="number" data-key="deforestation" data-country-index="${currentRowIndex}" data-input-index="3" value="${country.deforestation || 0}" min="0" max="100" style="text-align: center; color: black; font-weight: bold; width: auto; padding: 0.1rem 0.3rem; border: 1px solid #003366; border-radius: 4px; font-size: 0.7rem;">
            </div>
            <div class="input-group">
                <label>Reforestation (%)</label>
                <input type="number" data-key="reforestation" data-country-index="${currentRowIndex}" data-input-index="4" value="${country.reforestation || 0}" min="0" max="100" style="text-align: center; color: black; font-weight: bold; width: auto; padding: 0.1rem 0.3rem; border: 1px solid #003366; border-radius: 4px; font-size: 0.7rem;">
            </div>
            <div class="input-group">
                <label>Fonds (Mrd €)</label>
                <input type="number" data-key="allocatedFunds" data-country-index="${currentRowIndex}" data-input-index="5" value="${country.allocatedFunds || 0}" min="0" style="text-align: center; color: black; font-weight: bold; width: auto; padding: 0.1rem 0.3rem; border: 1px solid #003366; border-radius: 4px; font-size: 0.7rem;">
            </div>
        `;

        container.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', (e) => {
                const key = e.target.dataset.key;
                const countryIndex = parseInt(e.target.dataset.countryIndex);
                const inputIndex = parseInt(e.target.dataset.inputIndex);
                let value = parseFloat(e.target.value);

                if (isNaN(value)) value = 0;

                countryData[countryIndex][key] = value;
                syncPresentationToDashboard(countryIndex, inputIndex, value);
                if (typeof updateCharts === 'function') updateCharts();
                if (key === 'allocatedFunds' && typeof updateFundsDisplay === 'function') updateFundsDisplay();
            });
        });

        updateRowCounter();
    }

    function syncPresentationToDashboard(countryIndex, inputIndex, value) {
        const dashboardInput = document.querySelector(
            `#countryTableBody tr:nth-child(${countryIndex + 1}) input[data-input-index="${inputIndex}"]`
        );

        if (dashboardInput) {
            dashboardInput.value = value;
            const event = new Event('change', { bubbles: true });
            dashboardInput.dispatchEvent(event);
            console.log('[croadsUi] Synced to dashboard: country=', countryIndex, 'input=', inputIndex, 'value=', value);
        } else {
            console.warn('[croadsUi] Dashboard input not found for sync: country=', countryIndex, 'input=', inputIndex);
        }
    }

    function moveElementsToPresentation() {
        console.log('[croadsUi] Moving elements to presentation mode');
        const elementsToMove = [
            'emissionsChart-container',
            'temperatureChart-container',
            'fundsSummary',
            'temperatureSummary'
        ];

        const presentationMain = presentationModeDiv.querySelector('.presentation-main');
        if (!presentationMain) {
            console.warn('[croadsUi] Presentation main container not found');
            return;
        }

        elementsToMove.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                originalPositions.set(id, {
                    parent: el.parentNode,
                    nextSibling: el.nextSibling
                });
            }
        });

        presentationMain.innerHTML = '';
        elementsToMove.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                presentationMain.appendChild(el);
                console.log('[croadsUi] Moved element:', id);
            } else {
                console.warn('[croadsUi] Element not found:', id);
            }
        });
    }

    function moveElementsToNormal() {
        console.log('[croadsUi] Moving elements back to normal mode');
        originalPositions.forEach((position, id) => {
            const el = document.getElementById(id);
            if (el && position.parent) {
                try {
                    if (position.nextSibling) {
                        position.parent.insertBefore(el, position.nextSibling);
                    } else {
                        position.parent.appendChild(el);
                    }
                    console.log('[croadsUi] Moved back element:', id);
                } catch (error) {
                    console.error('[croadsUi] Error moving back element', id, ':', error);
                }
            } else {
                console.warn('[croadsUi] Cannot move back', id, ': element or parent not found');
            }
        });
    }

    function showPreviousRow() {
        if (currentRowIndex > 0) {
            currentRowIndex--;
            updatePresentationTable();
            console.log('[croadsUi] Navigated to previous row:', currentRowIndex);
        }
    }

    function showNextRow() {
        if (currentRowIndex < rows.length - 1) {
            currentRowIndex++;
            updatePresentationTable();
            console.log('[croadsUi] Navigated to next row:', currentRowIndex);
        }
    }

    function handleKeyNavigation(e) {
        if (currentMode !== 'presentation') return;

        switch (e.key) {
            case 'ArrowLeft':
                showPreviousRow();
                break;
            case 'ArrowRight':
                showNextRow();
                break;
            case 'Escape':
                togglePresentationMode(false);
                break;
            case 'Home':
                currentRowIndex = 0;
                updatePresentationTable();
                break;
            case 'End':
                currentRowIndex = rows.length - 1;
                updatePresentationTable();
                break;
        }
    }

    function setupDashboardInputSync() {
        console.log('[croadsUi] Setting up dashboard input sync');
        const dashboardInputs = document.querySelectorAll('#countryTableBody input');
        dashboardInputs.forEach(input => {
            input.addEventListener('change', () => {
                if (currentMode === 'presentation' && parseInt(input.dataset.countryIndex) === currentRowIndex) {
                    updatePresentationTable();
                }
            });
        });
    }

    setupDashboardInputSync();
}