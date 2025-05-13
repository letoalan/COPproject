let currentScenario = "SSP1 + RCP1.9";

export function initActorsTab() {
    const actorsSelect = document.getElementById("actors-select");
    actorsSelect.value = "Greenpeace";

    initializeActorsTab();
    return loadActorsScenario(currentScenario);
}

function initializeActorsTab() {
    document.querySelectorAll('#actors-scenario-buttons button').forEach(button => {
        button.addEventListener('click', (event) => {
            currentScenario = event.target.getAttribute('data-scenario');
            loadActorsScenario(currentScenario);
        });
    });

    document.getElementById('actors-select').addEventListener('change', () => {
        loadActorsScenario(currentScenario);
    });
}

function loadActorsScenario(scenario) {
    const actor = document.getElementById("actors-select").value;
    const tableBody = document.querySelector("#actors-strategies-table tbody");

    // Mettre à jour le bouton actif
    document.querySelectorAll('#actors-scenario-buttons button').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-scenario') === scenario);
    });

    fetch("data/actors.json")
        .then(response => response.json())
        .then(data => {
            const actorData = data["acteurs non-étatiques"].find(a => a.nom === actor);
            tableBody.innerHTML = "";

            if (actorData) {
                const scenarioData = actorData.strategies.find(s => s.scenario === scenario);

                if (scenarioData) {
                    scenarioData.strategies_action.forEach(strategy => {
                        const row = document.createElement("tr");
                        row.innerHTML = `
                            <td>${strategy.nom}</td>
                            <td>${strategy.objectifs}</td>
                            <td>${strategy.etats_concernes.join(", ")}</td>
                            <td>
                                <ul>
                                    ${Object.entries(strategy.actions).map(([state, action]) =>
                            `<li><strong>${state} :</strong> ${action}</li>`
                        ).join("")}
                                </ul>
                            </td>
                        `;
                        tableBody.appendChild(row);
                    });
                } else {
                    tableBody.innerHTML = "<tr><td colspan='4'>Aucune donnée disponible pour ce scénario.</td></tr>";
                }
            } else {
                tableBody.innerHTML = "<tr><td colspan='4'>Aucune donnée disponible pour cet acteur.</td></tr>";
            }
        })
        .catch(error => {
            console.error("Erreur lors du chargement des données des acteurs :", error);
            tableBody.innerHTML = "<tr><td colspan='4'>Erreur lors du chargement des données.</td></tr>";
        });
}