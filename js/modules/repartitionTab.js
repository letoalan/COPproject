/**
 * repartitionTab.js - Module for delegation assignment
 * Harmonized for COPproject
 */

// --- Data Structures (from temp/js/delegations-data.js) ---
const delegationsData = {
    etats: {
        paysDeveloppes: [
            { name: 'États-Unis', icon: '🇺🇸' },
            { name: 'France', icon: '🇫🇷' }
        ],
        paysPetroliers: [
            { name: 'EAU', icon: '🇦🇪' },
            { name: 'Russie', icon: '🇷🇺' }
        ],
        brics: [
            { name: 'Chine', icon: '🇨🇳' },
            { name: 'Inde', icon: '🇮🇳' },
            { name: 'Mexique', icon: '🇲🇽' },
            { name: 'Brésil', icon: '🇧🇷' },
            { name: 'Chili', icon: '🇨🇱' }
        ],
        paysDeveloppement: [
            { name: 'Sénégal', icon: '🇸🇳' },
            { name: 'Haïti', icon: '🇭🇹' },
            { name: 'Égypte', icon: '🇪🇬' }
        ],
        paysDeveloppementMenacesClimat: [
            { name: 'Île Maurice', icon: '🇲🇺' },
            { name: 'Vanuatu', icon: '🇻🇺' }
        ]
    },
    nonEtats: {
        ftn: [
            { name: 'BlackRock', icon: '💼' },
            { name: 'TotalEnergies', icon: '🛢️' }
        ],
        ong: [
            { name: 'Greenpeace', icon: '🌿' }
        ],
        onu: [
            { name: 'GIEC', icon: '📊' }
        ],
        medias: [
            { name: 'Médias', icon: '🗞️' }
        ]
    }
};

const statesData = [];
Object.values(delegationsData.etats).forEach(group => {
    group.forEach(d => statesData.push({ ...d, category: getCategoryName(d.name) }));
});

const nonStatesData = [];
Object.values(delegationsData.nonEtats).forEach(group => {
    group.forEach(d => nonStatesData.push({ ...d, category: getCategoryName(d.name) }));
});

function getCategoryName(name) {
    for (const [cat, items] of Object.entries(delegationsData.etats)) {
        if (items.find(i => i.name === name)) return formatCategory(cat);
    }
    for (const [cat, items] of Object.entries(delegationsData.nonEtats)) {
        if (items.find(i => i.name === name)) return formatCategory(cat);
    }
    return '';
}

function formatCategory(cat) {
    const mappings = {
        paysDeveloppes: "Pays développés",
        paysPetroliers: "Pays pétroliers",
        brics: "BRICS",
        paysDeveloppement: "Pays en développement",
        paysDeveloppementMenacesClimat: "Pays en développement menacés par le changement climatique",
        ftn: "FTN",
        ong: "ONG",
        onu: "ONU",
        medias: "Médias"
    };
    return mappings[cat] || cat;
}

function getCategoryClass(cat) {
    const mappings = {
        "Pays développés": "cat-etats-dev",
        "Pays pétroliers": "cat-etats-petrol",
        "BRICS": "cat-etats-brics",
        "Pays en développement": "cat-etats-pvd",
        "Pays en développement menacés par le changement climatique": "cat-etats-menaces",
        "FTN": "cat-ftn",
        "ONG": "cat-ong",
        "ONU": "cat-onu",
        "Médias": "cat-medias"
    };
    return mappings[cat] || "";
}

const categories = [
    "Pays développés", "Pays pétroliers", "BRICS", "Pays en développement",
    "Pays en développement menacés par le changement climatique",
    "FTN", "ONG", "ONU", "Médias"
];

// Global state
let delegations = [];

export async function initRepartitionTab() {
    console.log("Initializing Repartition Tab...");
    setupEventListeners();
    displayHierarchy();
    checkTabsStatus();
}

function checkTabsStatus() {
    const hasData = delegations.some(d => d.members.length > 0);
    const viewTabs = document.querySelectorAll('.view-tabs .tab-btn');
    viewTabs.forEach(btn => {
        const view = btn.getAttribute('data-view');
        if (view === 'grouped' || view === 'flat') {
            btn.disabled = !hasData;
            btn.title = !hasData ? "Veuillez charger un fichier Excel pour accéder à cette vue" : "";
        }
    });
}

function initDelegations() {
    delegations = [];
    statesData.forEach(s => delegations.push({ ...s, type: 'state', members: [] }));
    nonStatesData.forEach(ns => delegations.push({ ...ns, type: 'non-state', members: [] }));
}

function setupEventListeners() {
    const fileInput1 = document.getElementById('fileInput1');
    const fileInput2 = document.getElementById('fileInput2');
    const downloadBtn1 = document.getElementById('download-template-1');
    const downloadBtn2 = document.getElementById('download-template-2');
    const exportExcelBtn = document.getElementById('export-excel-btn');
    const exportPdfBtn = document.getElementById('export-pdf-btn');

    if (fileInput1) fileInput1.onchange = (e) => handleUpload(e, 1);
    if (fileInput2) fileInput2.onchange = (e) => handleUpload(e, 2);
    if (downloadBtn1) downloadBtn1.onclick = () => downloadTemplate(1);
    if (downloadBtn2) downloadBtn2.onclick = () => downloadTemplate(2);
    if (exportExcelBtn) exportExcelBtn.onclick = () => exportExcel();
    if (exportPdfBtn) exportPdfBtn.onclick = () => exportPDF();

    // Internal tab switching
    document.querySelectorAll('.view-tabs .tab-btn').forEach(btn => {
        btn.onclick = () => {
            if (btn.disabled) return;
            document.querySelectorAll('.view-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.view-content').forEach(v => v.classList.remove('active'));
            btn.classList.add('active');
            const view = btn.getAttribute('data-view');
            const targetView = document.getElementById(view + 'View');
            if (targetView) targetView.classList.add('active');
        };
    });
}

function getRoleIcon(role) {
    if (role === 'Chef de délégation') return '⭐';
    if (role === 'Co-leader') return '🎖️';
    return '👤';
}

async function handleUpload(e, step) {
    if (e.target.files.length > 0) {
        await handleExcelUpload(e.target.files[0], step);
        renderResults();
        document.getElementById(`status${step}`).classList.remove('hidden');
        document.getElementById('resultSection').classList.remove('hidden');
    }
}

async function handleExcelUpload(file, step) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            if (step === 1) {
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(sheet);
                const students = extractStudents(jsonData);
                assignStep1(students);
            } else {
                const refSheet = workbook.Sheets['Chefs Étape 1'];
                if (refSheet) {
                    const step1Data = XLSX.utils.sheet_to_json(refSheet);
                    reconstructFromStep1(step1Data);
                }
                const compSheet = workbook.Sheets['Compléter'] || workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(compSheet);
                const newStudents = extractStudents(jsonData);
                assignStep2(newStudents);
            }
            resolve();
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

function extractStudents(jsonData) {
    return jsonData.map(row => {
        const firstName = row['Prénom'] || '';
        const lastName = row['Nom'] || '';
        const fullName = row['Nom Complet'] || `${firstName} ${lastName}`.trim();
        return { firstName, lastName, fullName };
    }).filter(s => s.fullName);
}

function reconstructFromStep1(step1Data) {
    initDelegations();
    step1Data.forEach(row => {
        const del = delegations.find(d => d.name === row['Délégation']);
        if (del) {
            del.members.push({ fullName: row['Nom Complet'], role: row['Rôle'] });
        }
    });
}

function assignStep1(students) {
    initDelegations();
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(shuffled.length, delegations.length); i++) {
        delegations[i].members.push({ ...shuffled[i], role: 'Chef de délégation' });
    }
    if (shuffled.length > delegations.length) {
        const remaining = shuffled.slice(delegations.length);
        remaining.forEach((student, index) => {
            const stateIndex = index % 14;
            delegations[stateIndex].members.push({ ...student, role: 'Co-leader' });
        });
    }
}

function assignStep2(students) {
    if (delegations.length === 0) initDelegations();
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    shuffled.forEach((student, index) => {
        const delIndex = index % delegations.length;
        delegations[delIndex].members.push({ ...student, role: 'Membre' });
    });
}

function downloadTemplate(step) {
    const wb = XLSX.utils.book_new();
    if (step === 1) {
        const data = [['Prénom', 'Nom'], ['Jean', 'Dupont'], ['Marie', 'Curie']];
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Élèves");
        XLSX.writeFile(wb, `template-etape1.xlsx`);
    } else {
        const header = [['Prénom', 'Nom']];
        const emptyRows = Array(25).fill(['', '']);
        const ws1 = XLSX.utils.aoa_to_sheet(header.concat(emptyRows));
        XLSX.utils.book_append_sheet(wb, ws1, "Compléter");
        const refData = [['Nom Complet', 'Délégation', 'Catégorie', 'Rôle']];
        delegations.forEach(del => {
            del.members.forEach(m => {
                refData.push([m.fullName, del.name, del.category, m.role]);
            });
        });
        const ws2 = XLSX.utils.aoa_to_sheet(refData);
        XLSX.utils.book_append_sheet(wb, ws2, "Chefs Étape 1");
        XLSX.writeFile(wb, `template-etape2-complet.xlsx`);
    }
}

function renderResults() {
    const flatTableBody = document.querySelector('#resultTable tbody');
    flatTableBody.innerHTML = '';
    const groupedContainer = document.getElementById('groupedView');
    groupedContainer.innerHTML = '';

    categories.forEach(cat => {
        const catDelegations = delegations.filter(d => d.category === cat);
        const catMembersCount = catDelegations.reduce((acc, del) => acc + del.members.length, 0);

        if (catMembersCount > 0) {
            const headerRow = document.createElement('tr');
            headerRow.className = `table-category-header ${getCategoryClass(cat)}`;
            headerRow.innerHTML = `<td colspan="3">${cat} (${catMembersCount} membres)</td>`;
            flatTableBody.appendChild(headerRow);

            catDelegations.forEach(del => {
                del.members.sort((a, b) => {
                    const roles = { 'Chef de délégation': 1, 'Co-leader': 2, 'Membre': 3 };
                    return roles[a.role] - roles[b.role];
                }).forEach(member => {
                    const row = document.createElement('tr');
                    const roleClass = member.role === 'Chef de délégation' ? 'role-chef' :
                        member.role === 'Co-leader' ? 'role-coleader' : 'role-membre';
                    row.innerHTML = `
                        <td><span class="role-icon">${getRoleIcon(member.role)}</span> <strong>${member.fullName}</strong></td>
                        <td>${del.icon} ${del.name}</td>
                        <td><span class="role-badge ${roleClass}">${member.role}</span></td>
                    `;
                    flatTableBody.appendChild(row);
                });
            });

            // Grouped View
            const catSection = document.createElement('div');
            catSection.className = `category-section ${getCategoryClass(cat)}`;
            catSection.innerHTML = `<h3>${cat}</h3>`;
            const grid = document.createElement('div');
            grid.className = 'delegation-grid';
            catDelegations.forEach(del => {
                const card = document.createElement('div');
                card.className = 'delegation-card';
                let membersHtml = del.members.map(m => `
                    <div class="member-item ${m.role === 'Chef de délégation' ? 'role-chef' : m.role === 'Co-leader' ? 'role-coleader' : ''}">
                        <span class="role-icon">${getRoleIcon(m.role)}</span> ${m.fullName}
                    </div>
                `).join('');
                card.innerHTML = `<div class="card-header">${del.icon} ${del.name}</div><div class="card-body">${membersHtml}</div>`;
                grid.appendChild(card);
            });
            catSection.appendChild(grid);
            groupedContainer.appendChild(catSection);
        }
    });

    displayHierarchy(); // Update hierarchy view with current members
    checkTabsStatus(); // Enable tabs if data is present
}

function displayHierarchy() {
    const etatsContainer = document.getElementById('etats-container');
    const nonEtatsContainer = document.getElementById('non-etats-container');
    if (!etatsContainer || !nonEtatsContainer) return;

    etatsContainer.innerHTML = '';
    nonEtatsContainer.innerHTML = '';

    const etatsGroups = [
        { title: 'Pays développés', data: delegationsData.etats.paysDeveloppes },
        { title: 'Pays pétroliers', data: delegationsData.etats.paysPetroliers },
        { title: 'BRICS', data: delegationsData.etats.brics },
        { title: 'Pays en développement', data: delegationsData.etats.paysDeveloppement },
        { title: 'Pays en développement menacés par le changement climatique', data: delegationsData.etats.paysDeveloppementMenacesClimat }
    ];

    etatsGroups.forEach(group => renderHierarchyGroup(etatsContainer, group));

    const nonEtatsGroups = [
        { title: 'FTN', data: delegationsData.nonEtats.ftn },
        { title: 'ONG', data: delegationsData.nonEtats.ong },
        { title: 'ONU', data: delegationsData.nonEtats.onu },
        { title: 'Médias', data: delegationsData.nonEtats.medias }
    ];

    nonEtatsGroups.forEach(group => renderHierarchyGroup(nonEtatsContainer, group));
}

function renderHierarchyGroup(container, group) {
    const catClass = getCategoryClass(group.title);
    const section = document.createElement('div');
    section.className = `hierarchy-group-section ${catClass}`;
    section.innerHTML = `<h3>${group.title}</h3>`;
    const grid = document.createElement('div');
    grid.className = 'delegation-grid';

    group.data.forEach(item => {
        const del = delegations.find(d => d.name === item.name) || { members: [] };
        const card = document.createElement('div');
        card.className = 'delegation-card';
        const membersHtml = del.members.map(m => `
            <div class="member-item ${m.role === 'Chef de délégation' ? 'role-chef' : m.role === 'Co-leader' ? 'role-coleader' : ''}">
                <span class="role-icon">${getRoleIcon(m.role)}</span> ${m.fullName}
            </div>
        `).join('');
        card.innerHTML = `
            <div class="card-header">${item.icon} ${item.name}</div>
            <div class="card-body">
                <div class="member-count">${del.members.length} membres</div>
                <div class="member-list">${membersHtml || 'Vide'}</div>
            </div>
        `;
        grid.appendChild(card);
    });
    section.appendChild(grid);
    container.appendChild(section);
}

function exportExcel() {
    const exportData = [];
    delegations.forEach(del => {
        del.members.forEach(m => {
            exportData.push({ 'Nom Complet': m.fullName, 'Délégation': del.name, 'Catégorie': del.category, 'Rôle': m.role });
        });
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attribution");
    XLSX.writeFile(wb, "Repartition_COP.xlsx");
}

function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Simulation COP - Attribution des Délégations", 14, 20);
    let yPos = 30;
    categories.forEach(cat => {
        const catDelegations = delegations.filter(d => d.category === cat);
        if (catDelegations.length === 0) return;
        if (yPos > 250) { doc.addPage(); yPos = 20; }
        doc.setFontSize(14);
        doc.text(cat, 14, yPos);
        yPos += 10;
        const tableData = [];
        catDelegations.forEach(del => {
            del.members.forEach(m => { tableData.push([m.fullName, del.name, m.role]); });
        });
        doc.autoTable({ startY: yPos, head: [['Élève', 'Délégation', 'Rôle']], body: tableData, theme: 'grid' });
        yPos = doc.lastAutoTable.finalY + 15;
    });
    doc.save("Repartition_COP.pdf");
}
