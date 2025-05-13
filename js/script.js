// Hypothèse sur le contenu de script2.js pour gérer l'injection des onglets
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const main = document.querySelector('main');
        if (!main) {
            throw new Error('Élément main introuvable');
        }

        // Liste des modules et leurs contenus HTML associés
        const modules = [
            { name: 'copTab', path: './modules/copTab.js', html: './html/cop-tab.html' },
            { name: 'simulationTab', path: './modules/simulationTab.js', html: './html/simulation-tab.html' },
            { name: 'scenarioTab', path: './modules/scenarioTab.js', html: './html/scenario-tab.html' },
            { name: 'stateInfoTab', path: './modules/stateInfoTab.js', html: './html/state-info-tab.html' },
            { name: 'actorsInfoTab', path: './modules/actorsInfoTab.js', html: './html/actors-info-tab.html' },
            { name: 'countryTab', path: './modules/countryTab.js', html: './html/country-tab.html' },
            { name: 'negociationTab', path: './modules/negociationTab.js', html: './html/negociation-tab.html' },
            { name: 'actorsTab', path: './modules/actorsTab.js', html: './html/actors-tab.html' },
            { name: 'croadsTab', path: './modules/croadsTab.js', html: './html/croads-tab.html' }
        ];

        // Charger le contenu HTML de chaque onglet
        const loadedContent = await Promise.all(
            modules.map(async (module) => {
                try {
                    const response = await fetch(module.html);
                    if (!response.ok) {
                        throw new Error(`Erreur lors du chargement de ${module.html}`);
                    }
                    const html = await response.text();
                    return { name: module.name, html };
                } catch (error) {
                    console.error(`Erreur lors du chargement de ${module.html}:`, error);
                    return null;
                }
            })
        );

        // Injecter le contenu HTML dans main
        loadedContent
            .filter((content) => content !== null)
            .forEach((content) => {
                main.insertAdjacentHTML('beforeend', content.html);
            });

        // Charger et initialiser les modules JavaScript
        const loadedModules = await Promise.all(
            modules.map(async (module) => {
                try {
                    const m = await import(module.path);
                    return { name: module.name, module: m };
                } catch (error) {
                    console.error(`Erreur lors du chargement de ${module.path}:`, error);
                    return null;
                }
            })
        );

        // Initialiser les modules
        const successfulModules = loadedModules.filter((m) => m !== null);
        for (const { name, module } of successfulModules) {
            const initFunctionName = `init${name.charAt(0).toUpperCase() + name.slice(1)}`;
            if (module[initFunctionName]) {
                try {
                    await module[initFunctionName]();
                } catch (error) {
                    console.error(`Erreur lors de l'initialisation de ${name}:`, error);
                }
            } else {
                console.error(`Fonction ${initFunctionName} non trouvée pour ${name}`);
            }
        }

        // Configurer la navigation entre les onglets
        const navButtons = document.querySelectorAll('nav button[data-tab]');
        navButtons.forEach((button) => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.tab-content').forEach((tab) => {
                    tab.style.display = 'none';
                });
                const tabId = button.getAttribute('data-tab');
                const targetTab = document.getElementById(tabId);
                if (targetTab) {
                    targetTab.style.display = 'block';
                } else {
                    console.error(`L'onglet ${tabId} n'existe pas`);
                }
            });
        });

        // Afficher l'onglet par défaut (par exemple, cop-tab)
        const defaultTab = document.getElementById('cop-tab');
        if (defaultTab) {
            defaultTab.style.display = 'block';
        }
    } catch (error) {
        console.error('Erreur globale:', error);
        const main = document.querySelector('main');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Erreur lors du chargement de l\'application';
        main.prepend(errorDiv);
    }
});