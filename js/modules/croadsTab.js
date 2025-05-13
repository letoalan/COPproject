import { loadData } from './sub_modules/dataService.js';
import {
    initializeCharts,
    updateCharts,
    updateTemperatureProjection
} from './sub_modules/chartService.js';
import { updateFundsDisplay } from './sub_modules/fundService.js';
import { initializeUI, setupPresentationMode } from './sub_modules/croadsUi.js';
import { countryData } from './sub_modules/dataService.js'; // Ajoutez cette importation

console.log('croadsTab.js chargé');
console.log('Importations:', {
    loadData: typeof loadData,
    initializeCharts: typeof initializeCharts,
    updateCharts: typeof updateCharts,
    updateTemperatureProjection: typeof updateTemperatureProjection,
    updateFundsDisplay: typeof updateFundsDisplay,
    initializeUI: typeof initializeUI,
    setupPresentationMode: typeof setupPresentationMode
});

export async function initCroadsTab() {
    console.log('lancement de initCroadsTab');
    try {
        console.log('Début de initCroadsTab');
        const result = await loadData();
        console.log('Résultat de loadData:', result);
        console.log('Contenu de countryData:', countryData); // Ajoutez ce log
        initializeUI();
        console.log('UI initialisée');
        setupPresentationMode();
        console.log('Mode présentation configuré');
        initializeCharts();
        console.log('Graphiques initialisés');
        updateCharts();
        console.log('Graphiques mis à jour');
        updateFundsDisplay();
        console.log('Affichage des fonds mis à jour');
        updateTemperatureProjection();
        console.log('Ok pour le lancement de Croads');
    } catch (error) {
        console.error('Erreur dans initCroadsTab:', error);
        throw error;
    }
}