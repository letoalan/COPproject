export function initCopTab() {
    console.log("Initialisation du module COP Tab");

    // 1. Gestion de l'onglet principal COP
    const copTabButton = document.querySelector('header nav button[data-tab="COP-tab"]');
    if (copTabButton) {
        copTabButton.addEventListener('click', () => {
            // Masquer tous les onglets principaux
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.style.display = 'none';
            });
            // Afficher l'onglet COP
            document.getElementById('COP-tab').style.display = 'block';
            // Afficher la première section par défaut
            showCopSection('histoire-cop');
        });
    }

    // 2. Gestion des boutons d'info COP
    const infoButtons = document.querySelectorAll('.info-btn');
    if (infoButtons.length === 0) {
        console.warn("Aucun bouton info-btn trouvé");
    } else {
        infoButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = button.getAttribute('data-target');
                console.log(`Clic sur bouton COP: ${targetId}`);
                showCopSection(targetId);
            });
        });
    }

    // 3. Afficher la première section par défaut
    showCopSection('histoire-cop');

    return Promise.resolve();
}

function showCopSection(sectionId) {
    try {
        console.log(`Affichage section COP: ${sectionId}`);

        // Masquer toutes les sections COP
        document.querySelectorAll('.cop-info').forEach(info => {
            info.style.display = 'none';
        });

        // Afficher la section demandée
        const targetSection = document.getElementById(sectionId);
        if (!targetSection) {
            throw new Error(`Section ${sectionId} non trouvée`);
        }

        targetSection.style.display = 'block';
        updateActiveCopButton(sectionId);

    } catch (error) {
        console.error(`Erreur dans showCopSection:`, error);
    }
}

function updateActiveCopButton(sectionId) {
    document.querySelectorAll('.info-btn').forEach(button => {
        const isActive = button.getAttribute('data-target') === sectionId;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
}