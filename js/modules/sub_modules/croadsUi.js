//croadsUi.js
import { countryData } from './dataService.js';
import { emissionsChart, updateCharts, updateTemperatureProjection } from './chartService.js';
import { updateFundsDisplay } from './fundService.js';

let currentTooltip = null;

export function initializeUI() {
    console.log('initializeUI called, countryData:', countryData); // Debug
    createTableRows();
    setupLegendToggle();
    setupTableEventListeners();
}

export function createTableRows() {
    const tbody = document.getElementById('countryTableBody');
    if (!tbody) {
        console.warn('Table body not found');
        return;
    }

    tbody.innerHTML = '';

    if (!countryData || countryData.length === 0) {
        console.warn('countryData is empty or undefined');
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

    // Default values inspired by initial code
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
    console.error('UI Error:', error);
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
    console.log('Setting up presentation mode'); // Debug

    // 1. Récupérer les boutons de bascule de mode
    const presentationBtn = document.getElementById('presentationModeBtn');
    const dashboardBtn = document.getElementById('dashboardModeBtn');
    if (!presentationBtn || !dashboardBtn) {
        console.warn('Mode buttons not found:', { presentationBtn, dashboardBtn });
        return;
    }

    // 2. Récupérer ou créer le conteneur du mode présentation
    let presentationModeDiv = document.getElementById('presentationMode');
    if (!presentationModeDiv) {
        console.log('Creating presentation mode div');
        presentationModeDiv = createPresentationMode();
        document.body.appendChild(presentationModeDiv); // Assurez-vous de l'ajouter au DOM
    }
    presentationModeDiv.classList.remove('active'); // S'assurer qu'il est initialement caché
    presentationModeDiv.style.display = 'none';

    // 3. Récupérer le conteneur du mode dashboard
    const normalModeDiv = document.querySelector('.normal-mode');
    if (!normalModeDiv) {
        console.warn('Normal mode container not found');
        return;
    }
    normalModeDiv.style.display = 'block'; // S'assurer qu'il est visible initialement

    // 4. Récupérer les lignes du tableau du dashboard (pour la navigation initiale ?)
    const rows = Array.from(document.querySelectorAll("#countryTableBody tr"));
    if (rows.length === 0) {
        console.warn('No country rows found in table');
        return;
    }

    // 5. Récupérer ou créer l'indicateur de ligne
    let rowCounter = document.getElementById('rowCounter');
    if (!rowCounter) {
        console.log('Creating row counter');
        rowCounter = createRowCounter();
        // Où l'ajouter au DOM ? Assurez-vous qu'il est dans un endroit visible.
    }

    // 6. Récupérer ou créer les boutons de navigation (Précédent/Suivant)
    let prevBtn = document.getElementById('prevRow');
    let nextBtn = document.getElementById('nextRow');
    if (!prevBtn || !nextBtn) {
        console.log('Creating navigation buttons');
        prevBtn = createNavButton('prev'); // Assurez-vous que cette fonction les ajoute au DOM, probablement dans presentationModeDiv
        nextBtn = createNavButton('next'); // Idem
    }
    // S'assurer qu'ils sont initialement visibles en mode présentation (lorsqu'il sera actif)

    // 7. Initialiser l'index de la ligne actuelle et le mode actuel
    let currentRowIndex = 0;
    let currentMode = 'dashboard'; // État initial correct

    // 8. Initialiser la map pour stocker les positions originales (pour le déplacement des éléments)
    const originalPositions = new Map();

    // 9. Mettre à jour l'affichage du compteur de ligne
    function updateRowCounter() {
        const counterElement = document.getElementById('rowCounter');
        if (counterElement) {
            counterElement.textContent = `${currentRowIndex + 1} / ${rows.length}`;
        }
    }
    updateRowCounter(); // Appeler une première fois pour afficher l'état initial

    // 10. (Important) Ajouter les écouteurs d'événements pour les boutons de bascule
    if (presentationBtn) {
        presentationBtn.addEventListener('click', () => {
            togglePresentationMode(true);
        });
    }
    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', () => {
            togglePresentationMode(false);
        });
    }

    // 11. (Important) Ajouter les écouteurs d'événements pour la navigation dans la présentation
    if (prevBtn) {
        prevBtn.addEventListener('click', showPreviousRow);
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', showNextRow);
    }

    // 12. Ajouter l'écouteur d'événements pour la navigation au clavier
    document.addEventListener('keydown', handleKeyNavigation);

    console.log('Presentation mode setup complete.'); // Debug
    // 13. Mettre à jour le tableau de présentation initial

    function createPresentationMode() {
        const modeDiv = document.createElement('div');
        modeDiv.id = 'presentationMode';
        modeDiv.className = 'presentation-mode';
        modeDiv.innerHTML = `
        <div class="presentation-header">
            <button id="prevRow" class="nav-btn">◀</button>
            <h2>Configuration Pays</h2>
            <button id="nextRow" class="nav-btn">▶</button>
        </div>
        <div class="presentation-main"></div>
        <div class="presentation-footer">
            <div id="presentationTableContainer"></div>
        </div>
    `;
        document.body.appendChild(modeDiv);
        console.log('Presentation mode div created');
        return modeDiv;
    }

    function createRowCounter() {
        const counter = document.createElement('span');
        counter.id = 'rowCounter';
        counter.className = 'row-counter';
        document.body.appendChild(counter);
        console.log('Row counter created');
        return counter;
    }

    function createNavButton(type) {
        const btn = document.createElement('button');
        btn.id = `${type}Row`;
        btn.className = `nav-btn ${type}-btn`;
        btn.innerHTML = type === 'prev' ? '◀' : '▶';
        document.body.appendChild(btn);
        console.log(`Navigation button created: ${type}`);
        return btn;
    }

    function updateRowCounter() {
        if (rowCounter) {
            // Vérifier que countryData existe et contient des données
            if (typeof countryData !== 'undefined' && countryData && countryData.length > 0) {
                const countryName = countryData[currentRowIndex]?.name || 'Inconnu';
                rowCounter.textContent = `${currentRowIndex + 1}/${rows.length} (${countryName})`;
            } else {
                rowCounter.textContent = `${currentRowIndex + 1}/${rows.length}`;
            }
            console.log('Row counter updated:', rowCounter.textContent);
        }
    }

// Fonction modifiée pour améliorer l'affichage des contrôles en mode présentation
    function updatePresentationTable() {
        const container = document.getElementById('presentationTableContainer');
        if (!container) {
            console.warn('Container for presentation table not found');
            return;
        }

        if (typeof countryData === 'undefined' || !countryData || !countryData[currentRowIndex]) {
            console.warn('Country data not available at index', currentRowIndex);
            container.innerHTML = '<p>Données pays non disponibles</p>';
            return;
        }

        const country = countryData[currentRowIndex];

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

        // Ajout des gestionnaires d'événements sur les inputs
        container.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', (e) => {
                const key = e.target.dataset.key;
                const countryIndex = parseInt(e.target.dataset.countryIndex);
                const inputIndex = parseInt(e.target.dataset.inputIndex);
                let value = parseFloat(e.target.value);

                if (isNaN(value)) value = 0;

                countryData[currentRowIndex][key] = value;
                syncPresentationToDashboard(countryIndex, inputIndex, value);
                if (typeof updateCharts === 'function') updateCharts();
                if (key === 'allocatedFunds' && typeof updateFundsDisplay === 'function') updateFundsDisplay();
            });
        });
    }

    function syncPresentationToDashboard(countryIndex, inputIndex, value) {
        // Trouver l'entrée correspondante dans le tableau du dashboard
        const dashboardInput = document.querySelector(
            `#countryTableBody tr:nth-child(${countryIndex + 1}) input[data-input-index="${inputIndex}"]`
        );

        if (dashboardInput) {
            dashboardInput.value = value;

            // Déclencher l'événement pour que toute logique associée au changement dans le dashboard soit exécutée
            const event = new Event('change', { bubbles: true });
            dashboardInput.dispatchEvent(event);

            console.log(`Synced to dashboard: country=${countryIndex}, input=${inputIndex}, value=${value}`);
        } else {
            console.warn(`Dashboard input not found for sync: country=${countryIndex}, input=${inputIndex}`);
        }
    }

    function syncDashboardToPresentation() {
        console.log('Syncing dashboard to presentation');
        if (!document.getElementById('presentationTableContainer')) {
            console.warn('Presentation table container not found for sync');
            return;
        }

        const presentationInputs = document.querySelectorAll('#presentationTableContainer input');
        if (presentationInputs.length === 0) {
            console.warn('No inputs found in presentation mode for sync');
            return;
        }

        presentationInputs.forEach(pInput => {
            const countryIndex = parseInt(pInput.dataset.countryIndex);
            const inputIndex = parseInt(pInput.dataset.inputIndex);

            // Si les données existent directement dans countryData, les utiliser
            if (countryData && countryData[countryIndex]) {
                const key = pInput.dataset.key;
                if (key && countryData[countryIndex][key] !== undefined) {
                    pInput.value = countryData[countryIndex][key];
                    console.log(`Synced from countryData: key=${key}, value=${pInput.value}`);
                }
                // Sinon, chercher dans le tableau du dashboard
                else {
                    const dashboardInput = document.querySelector(
                        `#countryTableBody tr:nth-child(${countryIndex + 1}) input[data-input-index="${inputIndex}"]`
                    );
                    if (dashboardInput) {
                        pInput.value = dashboardInput.value;
                        console.log(`Synced from dashboard: country=${countryIndex}, input=${inputIndex}, value=${pInput.value}`);
                    } else {
                        console.warn(`Dashboard input not found for sync: country=${countryIndex}, input=${inputIndex}`);
                    }
                }
            }

        });
    }

    function moveElementsToPresentation() {
        console.log('Moving elements to presentation mode'); // Debug
        const elementsToMove = [
            'emissionsChart-container',
            'temperatureChart-container',
            'fundsSummary',
            'temperatureSummary'
        ];

        const presentationMain = presentationMode.querySelector('.presentation-main');
        if (!presentationMain) {
            console.warn('Presentation main container not found');
            return;
        }

        // Enregistrer les positions originales avant de déplacer
        elementsToMove.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                // Enregistrer le parent original et la position dans les enfants
                originalPositions.set(id, {
                    parent: el.parentNode,
                    nextSibling: el.nextSibling
                });
            }
        });

        presentationMain.innerHTML = ''; // Clear existing content
        elementsToMove.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                presentationMain.appendChild(el);
                console.log(`Moved element: ${id}`);
            } else {
                console.warn(`Element not found: ${id}`);
            }
        });
    }

    function moveElementsToNormal() {
        console.log('Moving elements back to normal mode'); // Debug

        // Restaurer les éléments à leurs positions d'origine
        originalPositions.forEach((position, id) => {
            const el = document.getElementById(id);
            if (el && position.parent) {
                try {
                    // Utiliser insertBefore pour replacer l'élément à sa position originale
                    if (position.nextSibling) {
                        position.parent.insertBefore(el, position.nextSibling);
                    } else {
                        position.parent.appendChild(el);
                    }
                    console.log(`Moved back element: ${id} to original position`);
                } catch (error) {
                    console.error(`Error moving back element ${id}:`, error);
                }
            } else {
                console.warn(`Cannot move back ${id}: element or parent not found`);
            }
        });
    }

    function createPresentationRow(country, index) {
        console.log('Creating presentation row for:', country.name); // Debug
        const row = document.createElement('tr');
        row.classList.add('highlighted-row');

        const nameCell = document.createElement('td');
        nameCell.textContent = country.name || 'Unknown';
        nameCell.setAttribute('data-tooltip', country.tooltip || 'No details available');
        row.appendChild(nameCell);

        for (let i = 0; i < 6; i++) {
            const cell = document.createElement('td');
            // Vérifier que createInputForCell existe
            if (typeof createInputForCell === 'function') {
                const input = createInputForCell(i, index, country);
                input.dataset.presentationInput = 'true';
                cell.appendChild(input);
            } else {
                cell.textContent = 'N/A';
                console.warn('La fonction createInputForCell n\'est pas définie');
            }
            row.appendChild(cell);
        }

        return row;
    }

    function syncDashboardToPresentation() {
        console.log('Syncing dashboard to presentation'); // Debug
        if (!document.getElementById('presentationTableContainer')) {
            console.warn('Presentation table container not found for sync');
            return;
        }

        const presentationInputs = document.querySelectorAll('#presentationTableContainer input');
        if (presentationInputs.length === 0) {
            console.warn('No inputs found in presentation mode for sync');
            return;
        }

        // Pour chaque input en mode présentation, mettre à jour avec la valeur du tableau
        presentationInputs.forEach(pInput => {
            const countryIndex = parseInt(pInput.dataset.countryIndex);
            const inputIndex = parseInt(pInput.dataset.inputIndex);

            // Si les données existent directement dans countryData, les utiliser
            if (countryData && countryData[countryIndex]) {
                const key = pInput.dataset.key;
                if (key && countryData[countryIndex][key] !== undefined) {
                    pInput.value = countryData[countryIndex][key];
                    console.log(`Synced from countryData: key=${key}, value=${pInput.value}`);
                }
            }
            // Sinon, chercher dans le tableau du dashboard
            else {
                const dashboardInput = document.querySelector(
                    `#countryTableBody tr:nth-child(${countryIndex + 1}) input[data-input-index="${inputIndex}"]`
                );
                if (dashboardInput) {
                    pInput.value = dashboardInput.value;
                    console.log(`Synced from dashboard: country=${countryIndex}, input=${inputIndex}, value=${pInput.value}`);
                } else {
                    console.warn(`Dashboard input not found for sync: country=${countryIndex}, input=${inputIndex}`);
                }
            }
        });
    }

    function showPreviousRow() {
        if (currentRowIndex > 0) {
            currentRowIndex--;
            updatePresentationTable();
            updateRowCounter();
            console.log('Navigated to previous row:', currentRowIndex);
        }
    }

    function showNextRow() {
        if (currentRowIndex < rows.length - 1) {
            currentRowIndex++;
            updatePresentationTable();
            updateRowCounter();
            console.log('Navigated to next row:', currentRowIndex);
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
                updateRowCounter();
                break;
            case 'End':
                currentRowIndex = rows.length - 1;
                updatePresentationTable();
                updateRowCounter();
                break;
        }
    }

    function setupDashboardInputSync() {
        console.log('Setting up dashboard input sync'); // Debug
        const dashboardInputs = document.querySelectorAll('#countryTableBody input');
        dashboardInputs.forEach(input => {
            input.addEventListener('change', () => {
                if (currentMode === 'presentation') {
                    // Récupérer les valeurs de l'input
                    const countryIndex = parseInt(input.dataset.countryIndex);
                    const inputIndex = parseInt(input.dataset.inputIndex);

                    // Si c'est la ligne actuellement affichée en mode présentation, mettre à jour l'affichage
                    if (countryIndex === currentRowIndex) {
                        updatePresentationTable();
                    }
                }
            });
        });
    }

    console.log('Attaching event listeners for mode buttons'); // Debug
    setupDashboardInputSync();

    // Clear existing listeners to prevent duplicates
    presentationBtn.replaceWith(presentationBtn.cloneNode(true));
    dashboardBtn.replaceWith(dashboardBtn.cloneNode(true));
    const newPresentationBtn = document.getElementById('presentationModeBtn');
    const newDashboardBtn = document.getElementById('dashboardModeBtn');

    newPresentationBtn.addEventListener('click', () => togglePresentationMode(true));
    newDashboardBtn.addEventListener('click', () => togglePresentationMode(false));
    prevBtn.addEventListener('click', showPreviousRow);
    nextBtn.addEventListener('click', showNextRow);
    document.addEventListener('keydown', handleKeyNavigation);

    newPresentationBtn.style.display = 'block';
    newDashboardBtn.style.display = 'block';

    function togglePresentationMode(showPresentation) {
        const presentationMode = document.getElementById('presentationMode');
        const normalMode = document.querySelector('.normal-mode');
        const mainHeader = document.getElementById('main-header'); // Exemple d'ID
        const mainFooter = document.getElementById('main-footer'); // Exemple d'ID

        if (showPresentation && presentationMode && normalMode) {
            currentMode = 'presentation';
            normalMode.style.display = 'none';
            presentationMode.classList.add('active');
            presentationMode.style.display = 'flex'; // Assurez-vous que display est bien flex

            // Masquer l'en-tête et le pied de page globaux (si ils existent)
            if (mainHeader) mainHeader.style.display = 'none';
            if (mainFooter) mainFooter.style.display = 'none';

            moveElementsToPresentation();
            updatePresentationTable();
            document.getElementById('dashboardModeBtn').style.display = 'block';
            document.getElementById('presentationModeBtn').style.display = 'none';
            console.log('Switched to presentation mode (fullscreen)');
        } else if (normalMode && presentationMode) {
            currentMode = 'dashboard';
            normalMode.style.display = 'block';
            presentationMode.classList.remove('active');
            presentationMode.style.display = 'none';

            // Afficher de nouveau l'en-tête et le pied de page globaux (si ils existent)
            if (mainHeader) mainHeader.style.display = 'block';
            if (mainFooter) mainFooter.style.display = 'block';

            moveElementsToNormal();
            document.getElementById('dashboardModeBtn').style.display = 'none';
            document.getElementById('presentationModeBtn').style.display = 'block';
            console.log('Switched to dashboard mode');
        }
    }
    // Ajouter ce script à la fin de votre page pour déboguer les boutons de mode
    document.addEventListener('DOMContentLoaded', function() {
        // Références aux éléments
        const presentationBtn = document.getElementById('presentationModeBtn');
        const dashboardBtn = document.getElementById('dashboardModeBtn');
        const normalMode = document.querySelector('.normal-mode');
        const presentationMode = document.getElementById('presentationMode');

        // Afficher dans la console si les éléments sont trouvés
        console.log('Bouton présentation trouvé:', !!presentationBtn);
        console.log('Bouton dashboard trouvé:', !!dashboardBtn);
        console.log('Mode normal trouvé:', !!normalMode);
        console.log('Mode présentation trouvé:', !!presentationMode);

        // Ajouter des gestionnaires d'événements manuels
        if (presentationBtn) {
            presentationBtn.addEventListener('click', function() {
                console.log('Bouton présentation cliqué');
                if (presentationMode) {
                    console.log('Activation du mode présentation');
                    presentationMode.classList.add('active');
                    if (normalMode) normalMode.style.display = 'none';
                }
            });
        }

        if (dashboardBtn) {
            dashboardBtn.addEventListener('click', function() {
                console.log('Bouton dashboard cliqué');
                if (presentationMode) {
                    console.log('Désactivation du mode présentation');
                    presentationMode.classList.remove('active');
                    if (normalMode) normalMode.style.display = 'block';
                }
            });
        }
    });
}