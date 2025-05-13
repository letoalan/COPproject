import { displayOrder } from './config.js';

export let countryData = [];
export let subCountryData = {};

export async function loadData() {
    try {
        console.log('Début de loadData');
        console.log('Tentative de fetch ../data/datasimu.json');
        const response = await fetch('data/datasimu.json');
        console.log('Réponse fetch:', response.status, response.statusText);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Données JSON:', data);

        countryData = data.countryData || [];
        subCountryData = data.subCountryData || {};
        console.log('countryData après assignation:', countryData);
        console.log('subCountryData après assignation:', subCountryData);

        countryData.forEach(country => {
            country.allocatedFunds = 0;
        });

        console.log('loadData terminé avec succès');
        return true;
    } catch (error) {
        console.error('Erreur dans loadData:', error);
        throw error;
    }
}

export function getCountryByName(name) {
    return countryData.find(c => c.name === name);
}