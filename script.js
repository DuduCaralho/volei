// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- UI Element References ---
    const navButtons = document.querySelectorAll('.nav-button');
    const pageSections = document.querySelectorAll('.page-section');
    const characterForm = document.getElementById('character-form');
    const playersContainer = document.getElementById('players-container');
    const pontosRestantesSpan = document.getElementById('pontos-restantes');
    const pontosPericiaRestantesSpan = document.getElementById('pontos-pericia-restantes');
    const especialistasUtilizadosSpan = document.getElementById('especialistas-utilizados');
    const noPlayersMessage = document.querySelector('.no-players-message');
    const detailsNavButton = document.getElementById('details-nav-button');
    const subNavButtons = document.querySelectorAll('.sub-nav-button');
    const subPageSections = document.querySelectorAll('.sub-page-section');

    // Character Details Section Elements
    const currentPlayerNameElem = document.getElementById('current-player-name');
    const detailNome = document.getElementById('detail-nome');
    const detailEscola = document.getElementById('detail-escola');
    const detailOrigem = document.getElementById('detail-origem');
    const detailClasse = document.getElementById('detail-classe');
    const detailNA = document.getElementById('detail-na');
    const detailPV = document.getElementById('detail-pv');
    const detailMaxPV = document.getElementById('detail-max-pv');
    const detailPE = document.getElementById('detail-pe');
    const detailMaxPE = document.getElementById('detail-max-pe');
    const detailAtributos = document.getElementById('detail-atributos');
    const btnIncreaseNA = document.getElementById('btn-increase-na');

    // Combat Sub-section
    const detailPericias = document.getElementById('detail-pericias');

    // Abilities Sub-section
    const detailHabilidades = document.getElementById('detail-habilidades');
    const selectNewAbility = document.getElementById('select-new-ability');
    const addAbilityBtn = document.getElementById('add-ability-btn');

    // Description Sub-section
    const detailLore = document.getElementById('detail-lore');
    const detailDescricaoFisica = document.getElementById('detail-descricao-fisica');
    const detailMotivacoes = document.getElementById('detail-motivacoes');
    const detailAnotacoes = document.getElementById('detail-anotacoes');
    const saveDescriptionBtn = document.getElementById('save-description-btn');

    // Character Creation Form Inputs
    const attrInputs = {
        forca: document.getElementById('forca'),
        agilidade: document.getElementById('agilidade'),
        vigor: document.getElementById('vigor'),
        presenca: document.getElementById('presenca'),
        intelecto: document.getElementById('intelecto'),
        percepcao: document.getElementById('percepcao')
    };

    const skillInputs = {
        acrobacia: document.getElementById('acrobacia'),
        atletismo: document.getElementById('atletismo'),
        bloqueio: document.getElementById('bloqueio'),
        defesa: document.getElementById('defesa'),
        determinacao: document.getElementById('determinacao'),
        foco: document.getElementById('foco'),
        fortitude: document.getElementById('fortitude'),
        intimidacao: document.getElementById('intimidacao'),
        lideranca: document.getElementById('lideranca'),
        manobra: document.getElementById('manobra'),
        percepcaoSkill: document.getElementById('percepcao-skill'),
        pontaria: document.getElementById('pontaria'),
        reflexos: document.getElementById('reflexos'),
        tatica: document.getElementById('tatica')
    };

    // --- Game Data Definitions ---
    const classePericiasIniciais = {
        'Atacante': ['atletismo', 'intimidacao', 'pontaria'],
        'Central': ['bloqueio', 'tatica', 'percepcaoSkill'],
        'Levantador': ['tatica', 'lideranca', 'foco'],
        'Libero': ['acrobacia', 'reflexos', 'fortitude'],
        'Oposto': ['atletismo', 'determinacao', 'intimidacao']
    };

    const origemPericiaBeneficio = {
        'Prodigio': { pericia: 'manobra', beneficio: 'Uma vez/partida, rola teste de PER ou AGI com Vantagem.' },
        'Trabalho Duro': { pericia: 'determinacao', beneficio: 'Uma vez/partida, +5 em teste de VIG.' },
        'Rivalidade': { pericia: 'intimidacao', beneficio: 'Uma vez/partida, +2 em ataques contra rival específico.' },
        'Legado Familiar': { pericia: 'tatica', beneficio: 'Uma vez/partida, gasta 1 PE para dar +2 em perícia de aliado adjacente.' },
        'Azarao': { pericia: 'fortitude', beneficio: 'Uma vez/partida, se PV < 50%, +1 em todos os atributos até o final do set.' },
        'Acidente': { pericia: 'percepcaoSkill', beneficio: 'Afinidade com Estilo e +1 PE na criação.' } // Atualizado "Paranormal" para "Estilo"
    };

    // allAbilities is loaded from habilidades.js
    // Ensure habilidades.js is linked before script.js in index.html

    // --- Global State Variables ---
    let players = JSON.parse(localStorage.getItem('haikyuuPlayers')) || [];
    let selectedPlayerId = null;

    // --- Navigation Functions ---
    function showSection(sectionId) {
        pageSections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        navButtons.forEach(button => {
            button.classList.remove('active');
        });
        const targetButton = document.querySelector(`.nav-button[data-section="${sectionId}"]`);
        if (targetButton) {
            targetButton.classList.add('active');
        } else if (sectionId === 'character-details-section') {
            detailsNavButton.classList.add('active'); // Activate details button when showing details
        }

        if (sectionId !== 'character-details-section') {
            detailsNavButton.style.display = 'none';
            selectedPlayerId = null;
        } else {
            detailsNavButton.style.display = 'block'; // Ensure it's visible when on details page
        }
    }

    function showSubSection(subSectionId) {
        subPageSections.forEach(subSection => {
            subSection.classList.remove('active');
        });
        document.getElementById(subSectionId).classList.add('active');

        subNavButtons.forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`.sub-nav-button[data-sub-section="${subSectionId}"]`).classList.add('active');
    }

    // --- Character Creation Calculations and Validations ---
    function calculateAttributePoints() {
        let total = 0;
        for (const key in attrInputs) {
            total += parseInt(attrInputs[key].value);
        }
        pontosRestantesSpan.textContent = 10 - total;
        return 10 - total;
    }

    function calculateSkillPoints() {
        let customCost = 0;
        let specialistsUsed = 0;

        const selectedClass = document.getElementById('classe').value;
        const selectedOrigem = document.getElementById('origem').value;

        for (const key in skillInputs) {
            const value = parseInt(skillInputs[key].value);
            const isClassInitial = selectedClass && classePericiasIniciais[selectedClass] && classePericiasIniciais[selectedClass].includes(key);
            const isOriginInitial = selectedOrigem && origemPericiaBeneficio[selectedOrigem] && origemPericiaBeneficio[selectedOrigem].pericia === key;

            if (value === 10) { // Especialista
                specialistsUsed += 1;
                if (!isClassInitial && !isOriginInitial) { // If not initial, costs full 2 points
                    customCost += 2;
                } else if (pericias[key] < 10) { // If was initial (5) and now upgraded to specialist (10)
                    customCost += 1; // Costs 1 additional point to go from 5 to 10
                }
            } else if (value === 5) { // Treinado
                if (!isClassInitial && !isOriginInitial) { // If not initial, costs 1 point
                    customCost += 1;
                }
            }
        }
        pontosPericiaRestantesSpan.textContent = 3 - customCost;
        especialistasUtilizadosSpan.textContent = `${specialistsUsed}/1`;
        return { remaining: 3 - customCost, specialists: specialistsUsed };
    }

    // Resets skill dropdowns and applies initial class/origin skills
    function updateInitialSkills() {
        for (const key in skillInputs) {
            skillInputs[key].value = "0";
        }

        const selectedClass = document.getElementById('classe').value;
        const selectedOrigem = document.getElementById('origem').value;

        if (selectedClass && classePericiasIniciais[selectedClass]) {
            classePericiasIniciais[selectedClass].forEach(skillId => {
                const skillElement = skillInputs[skillId];
                if (skillElement) {
                    skillElement.value = "5";
                }
            });
        }

        if (selectedOrigem && origemPericiaBeneficio[selectedOrigem]) {
            const originSkillId = origemPericiaBeneficio[selectedOrigem].pericia;
            const skillElement = skillInputs[originSkillId];
            if (skillElement && parseInt(skillElement.value) < 5) { // Only set if not already higher (e.g., from class)
                skillElement.value = "5";
            }
        }
        calculateSkillPoints();
    }

    // --- Player Data Management (LocalStorage) ---
    function savePlayers() {
        localStorage.setItem('haikyuuPlayers', JSON.stringify(players));
    }

    function getPlayerById(id) {
        return players.find(p => p.id === id);
    }

    function renderPlayers() {
        playersContainer.innerHTML = '';
        if (players.length === 0) {
            noPlayersMessage.style.display = 'block';
        } else {
            noPlayersMessage.style.display = 'none';
            players.forEach(player => {
                const playerCard = document.createElement('div');
                playerCard.classList.add('player-card');
                playerCard.dataset.id = player.id;

                playerCard.innerHTML = `
                    <h4>${player.nome}</h4>
                    <button class="delete-btn" data-id="${player.id}"><i class="fas fa-times"></i></button>
                    <p><strong>Escola/Time:</strong> ${player.escola}</p>
                    <p><strong>Classe:</strong> ${player.classe}</p>
                    <p><strong>NA:</strong> ${player.na}</p>
                    <p><strong>PV:</strong> ${player.currentPv || player.pv} / ${player.pv}</p>
                    <p><strong>PE:</strong> ${player.currentPe || player.pe} / ${player.pe}</p>
                `;
                playersContainer.appendChild(playerCard);
            });

            document.querySelectorAll('.player-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    if (e.target.closest('.delete-btn')) {
                        return;
                    }
                    selectedPlayerId = card.dataset.id;
                    displayPlayerDetails(selectedPlayerId);
                    showSection('character-details-section');
                    showSubSection('sub-personagem');
                });
            });

            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const playerId = e.target.closest('.delete-btn').dataset.id;
                    players = players.filter(p => p.id !== playerId);
                    savePlayers();
                    renderPlayers();
                    if (selectedPlayerId === playerId) { // If the deleted player was currently displayed
                        showSection('character-list-section');
                    }
                });
            });
        }
    }

    // --- Display Player Details ---
    function displayPlayerDetails(playerId) {
        const player = getPlayerById(playerId);
        if (!player) {
            console.error('Player not found for ID:', playerId);
            showSection('character-list-section');
            return;
        }

        currentPlayerNameElem.innerHTML = `<i class="fas fa-user-check"></i> Detalhes do Jogador: ${player.nome}`;

        // Sub-section Personagem
        detailNome.textContent = player.nome;
        detailEscola.textContent = player.escola;
        detailOrigem.textContent = `${player.origem} (${origemPericiaBeneficio[player.origem] ? origemPericiaBeneficio[player.origem].beneficio : 'Nenhum benefício.'})`;
        detailClasse.textContent = player.classe;
        detailNA.textContent = player.na;
        detailPV.textContent = player.currentPv || player.pv;
        detailMaxPV.textContent = player.pv;
        detailPE.textContent = player.currentPe || player.pe;
        detailMaxPE.textContent = player.pe;

        let attributesHtml = '';
        const attrIcons = {
            forca: '<i class="fas fa-dumbbell"></i>', agilidade: '<i class="fas fa-running"></i>', vigor: '<i class="fas fa-heartbeat"></i>',
            presenca: '<i class="fas fa-star"></i>', intelecto: '<i class="fas fa-brain"></i>', percepcao: '<i class="fas fa-eye"></i>'
        };
        for (const attr in player.atributos) {
            attributesHtml += `<div class="attr-display-item">${attrIcons[attr]} <strong>${attr.toUpperCase()}:</strong> ${player.atributos[attr]}</div>`;
        }
        detailAtributos.innerHTML = attributesHtml;

        // Sub-section Combate (Perícias)
        let skillsHtml = '';
        const skillIcons = {
            acrobacia: '<i class="fas fa-gym"></i>', atletismo: '<i class="fas fa-running"></i>', bloqueio: '<i class="fas fa-shield-alt"></i>',
            defesa: '<i class="fas fa-hand-paper"></i>', determinacao: '<i class="fas fa-gavel"></i>', foco: '<i class="fas fa-crosshairs"></i>',
            fortitude: '<i class="fas fa-fist-raised"></i>', intimidacao: '<i class="fas fa-mask"></i>', lideranca: '<i class="fas fa-crown"></i>',
            manobra: '<i class="fas fa-grip-lines"></i>', percepcaoSkill: '<i class="fas fa-search"></i>', pontaria: '<i class="fas fa-bullseye"></i>',
            reflexos: '<i class="fas fa-bolt"></i>', tatica: '<i class="fas fa-chess-knight"></i>'
        };

        for (const skillId in player.pericias) {
            const skillValue = player.pericias[skillId];
            if (skillValue !== 0) {
                const level = skillValue === 5 ? 'Treinado' : 'Especialista';
                const displayName = skillId === 'percepcaoSkill' ? 'Percepção' : skillId.charAt(0).toUpperCase() + skillId.slice(1);
                skillsHtml += `<div class="skill-display-item">${skillIcons[skillId] || '<i class="fas fa-asterisk"></i>'} <strong>${displayName}:</strong> ${level} (+${skillValue})</div>`;
            }
        }
        detailPericias.innerHTML = skillsHtml || '<p>Nenhuma perícia treinada.</p>';

        // Sub-section Habilidades
        let abilitiesHtml = '';
        if (player.habilidades && player.habilidades.length > 0) {
            player.habilidades.forEach(abilityId => {
                const ability = allAbilities.find(ab => ab.id === abilityId);
                if (ability) {
                    const typeIcon = getTypeIcon(ability.type);
                    abilitiesHtml += `<div class="ability-display-item">${typeIcon} <strong>${ability.name}</strong> (${ability.cost} PE) - <em>${ability.type}</em>: ${ability.description}</div>`;
                } else {
                    abilitiesHtml += `<div class="ability-display-item"><strong>${abilityId}</strong>: Estilo/Talento não encontrado (ID: ${abilityId})</div>`;
                }
            });
        } else {
            abilitiesHtml = '<p>Nenhum estilo de jogo ou talento aprimorado ainda.</p>';
        }
        detailHabilidades.innerHTML = abilitiesHtml;
        populateAbilitySelection(player);

        // Sub-section Descrição
        detailLore.value = player.lore || '';
        detailDescricaoFisica.value = player.descricaoFisica || '';
        detailMotivacoes.value = player.motivacoes || '';
        detailAnotacoes.value = player.anotacoes || '';
    }

    // Helper to get icon for ability type
    function getTypeIcon(type) {
        if (type.includes('Classe')) return '<i class="fas fa-graduation-cap"></i>';
        if (type.includes('Vento')) return '<i class="fas fa-wind"></i>';
        if (type.includes('Muralha')) return '<i class="fas fa-hammer"></i>';
        if (type.includes('Fluxo')) return '<i class="fas fa-water"></i>';
        if (type.includes('Faísca')) return '<i class="fas fa-fire-alt"></i>';
        if (type.includes('Visão')) return '<i class="fas fa-eye"></i>';
        if (type.includes('Sombra')) return '<i class="fas fa-moon"></i>';
        if (type.includes('Ataque Implacável')) return '<i class="fas fa-fist-raised"></i>';
        if (type.includes('Guardião da Rede')) return '<i class="fas fa-shield-alt"></i>';
        if (type.includes('Orquestrador')) return '<i class="fas fa-chess-king"></i>';
        if (type.includes('Defensor Imbatível')) return '<i class="fas fa-running"></i>';
        return '<i class="fas fa-question-circle"></i>';
    }

    function populateAbilitySelection(player) {
        selectNewAbility.innerHTML = '<option value="">Selecione um Estilo/Talento</option>';
        const learnedAbilityIds = player.habilidades.map(id => id);

        const abilitiesToSelect = allAbilities.filter(ab =>
            !ab.type.startsWith('Estilo: ') &&
            !learnedAbilityIds.includes(ab.id)
        );

        abilitiesToSelect.forEach(ability => {
            const option = document.createElement('option');
            option.value = ability.id;
            option.textContent = `${ability.name} (${ability.cost} PE) - ${ability.type}`;
            selectNewAbility.appendChild(option);
        });
    }

    // --- NA Increase Logic (with simple modal for choice) ---
    btnIncreaseNA.addEventListener('click', () => {
        const player = getPlayerById(selectedPlayerId);
        if (!player) return;

        player.na += 1;
        player.currentPv = player.pv;
        player.currentPe = player.pe;
        player.pe += 1; // Always gain 1 PE

        let bonusMessage = `Jogador ${player.nome} alcançou NA ${player.na}! Ganha +1 PE.`;
        let attributeChoice = false;
        let skillChoice = false;

        if (player.na % 2 === 0) { // Every even NA, get 1 Attr or 1 Skill point
            bonusMessage += "\nAlém disso, escolha: +1 Ponto em Atributo OU +1 Ponto em Perícia.";
            // For a simple demo, we'll auto-apply or ask via prompt/confirm
            const choice = prompt(`${bonusMessage}\nDigite 'atributo' para +1 Atributo ou 'pericia' para +1 Perícia:`);
            if (choice && choice.toLowerCase() === 'atributo') {
                const attrToIncrease = prompt('Qual atributo deseja aumentar? (FOR, AGI, VIG, PRE, INT, PER)').toUpperCase();
                if (player.atributos.hasOwnProperty(attrToIncrease.toLowerCase()) && player.atributos[attrToIncrease.toLowerCase()] < 5) {
                    player.atributos[attrToIncrease.toLowerCase()] += 1;
                    player.pv = 10 + player.atributos.vigor; // Recalculate max PV if VIG increases
                    bonusMessage += `\n${attrToIncrease} aumentado para ${player.atributos[attrToIncrease.toLowerCase()]}.`;
                } else {
                    alert('Atributo inválido ou já no máximo. Ponto não aplicado.');
                }
            } else if (choice && choice.toLowerCase() === 'pericia') {
                const skillToIncrease = prompt('Qual perícia deseja Treinar (+5) ou se tornar Especialista (+10)? (Digite o nome completo da perícia, ex: Atletismo)').toLowerCase();
                const skillId = Object.keys(skillInputs).find(key => key.toLowerCase() === skillToIncrease || (key === 'percepcaoSkill' && skillToIncrease === 'percepção'));

                if (skillId && player.pericias[skillId] < 10) { // Max Specialist +10
                    if (player.pericias[skillId] === 0) {
                        player.pericias[skillId] = 5; // Go from Not Trained to Trained
                        bonusMessage += `\n${skillToIncrease} agora Treinado (+5).`;
                    } else if (player.pericias[skillId] === 5) {
                        // Check if player already has an 'Especialista' from custom points
                        const { specialists: currentSpecialists } = calculateSkillPoints(); // Need to re-calculate from actual data
                        if (currentSpecialists < 1) { // Allow only one specialist from custom points
                            player.pericias[skillId] = 10; // Go from Trained to Specialist
                            bonusMessage += `\n${skillToIncrease} agora Especialista (+10).`;
                        } else {
                            alert('Você já tem uma perícia como Especialista. Não é possível ter outra através de pontos de perícia adicionais.');
                        }
                    } else if (player.pericias[skillId] === 10) {
                        alert('Perícia já é Especialista (máximo). Ponto não aplicado.');
                    }
                } else {
                    alert('Perícia inválida ou já no máximo. Ponto não aplicado.');
                }
            } else {
                alert('Escolha inválida. Ponto não aplicado.');
            }
        }

        savePlayers();
        displayPlayerDetails(selectedPlayerId);
        alert(bonusMessage);
    });

    // --- Ability Addition Logic ---
    addAbilityBtn.addEventListener('click', () => {
        const player = getPlayerById(selectedPlayerId);
        if (!player) return;

        const abilityIdToAdd = selectNewAbility.value;
        if (!abilityIdToAdd) {
            alert('Por favor, selecione um Estilo/Talento para adicionar.');
            return;
        }

        const ability = allAbilities.find(ab => ab.id === abilityIdToAdd);
        if (player.habilidades.includes(ability.id)) {
            alert('Este jogador já possui este Estilo/Talento!');
            return;
        }

        player.habilidades.push(ability.id);
        savePlayers();
        displayPlayerDetails(selectedPlayerId);
        alert(`Estilo/Talento "${ability.name}" adicionado a ${player.nome}.`);
    });

    // --- Description Save Logic ---
    saveDescriptionBtn.addEventListener('click', () => {
        const player = getPlayerById(selectedPlayerId);
        if (!player) return;

        player.lore = detailLore.value;
        player.descricaoFisica = detailDescricaoFisica.value;
        player.motivacoes = detailMotivacoes.value;
        player.anotacoes = detailAnotacoes.value;

        savePlayers();
        alert('Descrição e anotações salvas com sucesso!');
    });


    // --- Initial Event Listeners ---
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Check if it's the 'Como Jogar' link (which is an <a>, not a <button>)
            if (button.tagName === 'A') {
                return; // Let the link handle navigation
            }
            showSection(button.dataset.section);
            if (button.dataset.section === 'character-list-section') {
                renderPlayers();
            }
        });
    });

    subNavButtons.forEach(button => {
        button.addEventListener('click', () => {
            showSubSection(button.dataset.subSection);
        });
    });

    for (const key in attrInputs) {
        attrInputs[key].addEventListener('input', calculateAttributePoints);
    }

    for (const key in skillInputs) {
        skillInputs[key].addEventListener('change', calculateSkillPoints);
    }

    document.getElementById('classe').addEventListener('change', updateInitialSkills);
    document.getElementById('origem').addEventListener('change', updateInitialSkills);

    // --- Character Creation Form Submission Logic ---
    characterForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nome = document.getElementById('nome').value.trim();
        const escola = document.getElementById('escola').value.trim();
        const origem = document.getElementById('origem').value;
        const classe = document.getElementById('classe').value;

        if (!nome || !escola || !origem || !classe) {
            alert('Por favor, preencha todos os campos obrigatórios (Nome, Escola, Origem, Classe).');
            return;
        }

        const remainingAttrPoints = calculateAttributePoints();
        if (remainingAttrPoints !== 0) {
            alert(`Você precisa distribuir exatamente 10 pontos de atributo. Pontos restantes: ${remainingAttrPoints}`);
            return;
        }

        const { remaining: remainingSkillPoints, specialists: usedSpecialists } = calculateSkillPoints();
        if (remainingSkillPoints < 0) {
            alert(`Você gastou muitos pontos de perícia adicionais. Pontos restantes: ${remainingSkillPoints}`);
            return;
        }
        if (usedSpecialists > 1) {
            alert('Você pode ter no máximo uma perícia como Especialista (além das iniciais).');
            return;
        }

        const atributos = {};
        for (const key in attrInputs) {
            atributos[key] = parseInt(attrInputs[key].value);
        }

        // Initialize all skills to 0
        const pericias = {};
        for (const key in skillInputs) {
            pericias[key] = 0;
        }

        // Apply initial class skills (free)
        const selectedClassInitialSkills = classePericiasIniciais[classe];
        if (selectedClassInitialSkills) {
            selectedClassInitialSkills.forEach(skillId => {
                pericias[skillId] = 5; // Set to Trained
            });
        }

        // Apply initial origin skill (free)
        const selectedOrigemData = origemPericiaBeneficio[origem];
        if (selectedOrigemData) {
            const originSkillId = origemPericiaBeneficio[selectedOrigem].pericia;
            if (pericias[originSkillId] < 5) { // Only if not already trained by class
                pericias[originSkillId] = 5;
            }
        }

        // Apply player's custom skill choices
        for (const key in skillInputs) {
            const value = parseInt(skillInputs[key].value);
            // If player chose a level higher than what was automatically set
            if (value > pericias[key]) {
                pericias[key] = value;
            }
        }

        const pv = 10 + atributos.vigor;
        let pe = 5 + atributos.presenca + atributos.intelecto;
        if (origem === 'Acidente') {
            pe += 1;
        }

        // Get initial class ability ID
        let initialAbilityId = '';
        switch(classe) {
            case 'Atacante': initialAbilityId = 'ataqueExplosivo'; break;
            case 'Central': initialAbilityId = 'bloqueioDeFerro'; break;
            case 'Levantador': initialAbilityId = 'visaoDeAguia'; break;
            case 'Libero': initialAbilityId = 'defesaImpecavel'; break;
            case 'Oposto': initialAbilityId = 'contrarioFurioso'; break;
        }

        const newPlayer = {
            id: Date.now().toString(),
            nome,
            escola,
            origem,
            classe,
            atributos,
            pericias,
            pv: pv,
            currentPv: pv,
            pe: pe,
            currentPe: pe,
            na: 1,
            habilidades: initialAbilityId ? [initialAbilityId] : [],
            lore: '',
            descricaoFisica: '',
            motivacoes: '',
            anotacoes: ''
        };

        players.push(newPlayer);
        savePlayers();
        renderPlayers();
        characterForm.reset();
        updateInitialSkills(); // Reset skill dropdowns to initial state
        calculateAttributePoints();

        alert(`Jogador ${nome} registrado com sucesso!`);
        showSection('character-list-section');
    });

    // --- Initialization ---
    renderPlayers();
    updateInitialSkills();
    showSection('character-creation-section'); // Default to creation page on load
});
