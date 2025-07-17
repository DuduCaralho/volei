// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos de UI ---
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

    // Detalhes do Jogador (seção principal)
    const currentPlayerNameElem = document.getElementById('current-player-name');

    // Sub-seção Personagem
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

    // Sub-seção Combate
    const detailPericias = document.getElementById('detail-pericias');

    // Sub-seção Habilidades
    const detailHabilidades = document.getElementById('detail-habilidades');
    const selectNewAbility = document.getElementById('select-new-ability');
    const addAbilityBtn = document.getElementById('add-ability-btn');

    // Sub-seção Descrição
    const detailLore = document.getElementById('detail-lore');
    const detailDescricaoFisica = document.getElementById('detail-descricao-fisica');
    const detailMotivacoes = document.getElementById('detail-motivacoes');
    const detailAnotacoes = document.getElementById('detail-anotacoes');
    const saveDescriptionBtn = document.getElementById('save-description-btn');


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
        percepcaoSkill: document.getElementById('percepcao-skill'), // Renamed to avoid conflict
        pontaria: document.getElementById('pontaria'),
        reflexos: document.getElementById('reflexos'),
        tatica: document.getElementById('tatica')
    };

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
        'Acidente': { pericia: 'percepcaoSkill', beneficio: 'Afinidade com Elemento Paranormal e +1 PE na criação.' }
    };

    // allAbilities agora vem de habilidades.js
    // Certifique-se de que habilidades.js é carregado ANTES deste script no HTML.

    // --- Variáveis de Estado Global ---
    let players = JSON.parse(localStorage.getItem('haikyuuPlayers')) || [];
    let selectedPlayerId = null;

    // --- Funções de Navegação ---
    function showSection(sectionId) {
        pageSections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        navButtons.forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`.nav-button[data-section="${sectionId}"]`).classList.add('active');

        if (sectionId !== 'character-details-section') {
            detailsNavButton.style.display = 'none';
            selectedPlayerId = null;
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

    // --- Funções de Validação e Cálculo ---
    function calculateAttributePoints() {
        let total = 0;
        for (const key in attrInputs) {
            total += parseInt(attrInputs[key].value);
        }
        pontosRestantesSpan.textContent = 10 - total;
        return 10 - total;
    }

    // Corrigindo a lógica de cálculo de pontos de perícia
    function calculateSkillPoints() {
        let customCost = 0; // Custo dos pontos gastos pelo jogador
        let specialistsUsed = 0; // Número de especialistas que o jogador escolheu

        for (const key in skillInputs) {
            const value = parseInt(skillInputs[key].value);
            // Verifica se a perícia não é uma das perícias iniciais automáticas
            // As perícias iniciais são "gratuitas" e já vêm como Treinado (valor 5)
            // Se o jogador mudar uma perícia inicial para Especialista, aí sim consome pontos.
            // Se o jogador escolher Treinado em uma perícia NÃO inicial, consome 1 ponto.

            const selectedClass = document.getElementById('classe').value;
            const selectedOrigem = document.getElementById('origem').value;

            const isClassInitial = selectedClass && classePericiasIniciais[selectedClass] && classePericiasIniciais[selectedClass].includes(key);
            const isOriginInitial = selectedOrigem && origemPericiaBeneficio[selectedOrigem] && origemPericiaBeneficio[selectedOrigem].pericia === key;

            if (value === 10) { // Se for Especialista
                specialistsUsed += 1;
                if (!isClassInitial && !isOriginInitial) { // Se não for uma perícia inicial (e o jogador a fez Especialista)
                    customCost += 2;
                } else if (value > 5) { // Se for uma perícia inicial mas o jogador a "upou" para Especialista
                    customCost += 1; // Custa 1 ponto ADICIONAL para ir de Treinado (gratuito) para Especialista
                }
            } else if (value === 5) { // Se for Treinado
                if (!isClassInitial && !isOriginInitial) { // Se não for uma perícia inicial (e o jogador a treinou)
                    customCost += 1;
                }
                // Se for uma perícia inicial e estiver Treinada, não custa pontos.
            }
        }
        pontosPericiaRestantesSpan.textContent = 3 - customCost;
        especialistasUtilizadosSpan.textContent = `${specialistsUsed}/1`;
        return { remaining: 3 - customCost, specialists: specialistsUsed };
    }

    // Atualiza os selects de perícia e recalcula os pontos.
    function updateInitialSkills() {
        // Primeiro, redefine todos os selects para 'Não Treinado (0)'
        for (const key in skillInputs) {
            skillInputs[key].value = "0";
        }

        const selectedClass = document.getElementById('classe').value;
        const selectedOrigem = document.getElementById('origem').value;

        // Aplica as perícias iniciais da classe como 'Treinado'
        if (selectedClass && classePericiasIniciais[selectedClass]) {
            classePericiasIniciais[selectedClass].forEach(skillId => {
                const skillElement = skillInputs[skillId];
                if (skillElement) {
                    skillElement.value = "5"; // Define como Treinado (bônus +5)
                }
            });
        }

        // Aplica a perícia inicial da origem como 'Treinado'
        if (selectedOrigem && origemPericiaBeneficio[selectedOrigem]) {
            const originSkillId = origemPericiaBeneficio[selectedOrigem].pericia;
            const skillElement = skillInputs[originSkillId];
            if (skillElement && skillElement.value === "0") { // Não sobrescreve se já foi definido pela classe
                skillElement.value = "5"; // Define como Treinado (bônus +5)
            }
        }

        // Recalcula os pontos depois de definir as perícias iniciais gratuitas
        calculateSkillPoints();
    }


    // --- Gerenciamento de Personagens (Armazenamento Local) ---
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
                    detailsNavButton.style.display = 'block';
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
                    if (selectedPlayerId === playerId) {
                        showSection('character-list-section');
                    }
                });
            });
        }
    }

    function displayPlayerDetails(playerId) {
        const player = getPlayerById(playerId);
        if (!player) {
            alert('Jogador não encontrado!');
            showSection('character-list-section');
            return;
        }

        currentPlayerNameElem.innerHTML = `<i class="fas fa-user-check"></i> Detalhes do Jogador: ${player.nome}`;

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

        let abilitiesHtml = '';
        if (player.habilidades && player.habilidades.length > 0) {
            player.habilidades.forEach(abilityId => {
                const ability = allAbilities.find(ab => ab.id === abilityId);
                if (ability) {
                    const typeIcon = getTypeIcon(ability.type);
                    abilitiesHtml += `<div class="ability-display-item">${typeIcon} <strong>${ability.name}</strong> (${ability.cost} PE) - <em>${ability.type}</em>: ${ability.description}</div>`;
                } else {
                    abilitiesHtml += `<div class="ability-display-item"><strong>${abilityId}</strong>: Habilidade não encontrada (ID: ${abilityId})</div>`;
                }
            });
        } else {
            abilitiesHtml = '<p>Nenhuma habilidade paranormal despertada ainda.</p>';
        }
        detailHabilidades.innerHTML = abilitiesHtml;
        populateAbilitySelection(player);

        detailLore.value = player.lore || '';
        detailDescricaoFisica.value = player.descricaoFisica || '';
        detailMotivacoes.value = player.motivacoes || '';
        detailAnotacoes.value = player.anotacoes || '';
    }

    function getTypeIcon(type) {
        if (type.includes('Classe')) return '<i class="fas fa-graduation-cap"></i>';
        if (type.includes('Vento')) return '<i class="fas fa-wind"></i>';
        if (type.includes('Terra')) return '<i class="fas fa-mountain"></i>';
        if (type.includes('Água')) return '<i class="fas fa-water"></i>';
        if (type.includes('Fogo')) return '<i class="fas fa-fire-alt"></i>';
        if (type.includes('Luz')) return '<i class="fas fa-sun"></i>';
        if (type.includes('Escuridão')) return '<i class="fas fa-moon"></i>';
        return '<i class="fas fa-question-circle"></i>';
    }


    function populateAbilitySelection(player) {
        selectNewAbility.innerHTML = '<option value="">Selecione uma Habilidade</option>';
        const learnedAbilityIds = player.habilidades.map(id => id);

        // Filtra as habilidades de classe para que não apareçam na seleção de adicionar
        const abilitiesToSelect = allAbilities.filter(ab => !ab.type.startsWith('Classe'));

        abilitiesToSelect.forEach(ability => {
            if (!learnedAbilityIds.includes(ability.id)) {
                const option = document.createElement('option');
                option.value = ability.id;
                option.textContent = `${ability.name} (${ability.cost} PE) - ${ability.type}`;
                selectNewAbility.appendChild(option);
            }
        });
    }

    btnIncreaseNA.addEventListener('click', () => {
        const player = getPlayerById(selectedPlayerId);
        if (!player) return;

        player.na += 1;
        player.currentPv = player.pv;
        player.currentPe = player.pe;

        alert(`Jogador ${player.nome} alcançou NA ${player.na}! Ganha +1 PE.`);
        player.pe += 1;

        savePlayers();
        displayPlayerDetails(selectedPlayerId);
        alert(`Nível de Ameaça de ${player.nome} aumentado para ${player.na}. PE atual: ${player.pe}.`);
    });


    addAbilityBtn.addEventListener('click', () => {
        const player = getPlayerById(selectedPlayerId);
        if (!player) return;

        const abilityIdToAdd = selectNewAbility.value;
        if (!abilityIdToAdd) {
            alert('Por favor, selecione uma habilidade para adicionar.');
            return;
        }

        const ability = allAbilities.find(ab => ab.id === abilityIdToAdd);
        if (player.habilidades.includes(ability.id)) {
            alert('Este jogador já possui esta habilidade!');
            return;
        }

        player.habilidades.push(ability.id);
        savePlayers();
        displayPlayerDetails(selectedPlayerId);
        alert(`Habilidade "${ability.name}" adicionada a ${player.nome}.`);
    });

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


    navButtons.forEach(button => {
        button.addEventListener('click', () => {
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

        // Crie um objeto de perícias começando com todas em 0
        const pericias = {};
        for (const key in skillInputs) {
            pericias[key] = 0; // Inicializa todas como "Não Treinado"
        }

        // Aplica as perícias iniciais da classe como 'Treinado' (5)
        const selectedClassInitialSkills = classePericiasIniciais[classe];
        if (selectedClassInitialSkills) {
            selectedClassInitialSkills.forEach(skillId => {
                pericias[skillId] = 5;
            });
        }

        // Aplica a perícia inicial da origem como 'Treinado' (5)
        const selectedOrigemData = origemPericiaBeneficio[origem];
        if (selectedOrigemData) {
            const originSkillId = origemPericiaBeneficio[origem].pericia;
            if (pericias[originSkillId] < 5) { // Só aplica se não for Treinado por Classe
                pericias[originSkillId] = 5;
            }
        }

        // Agora, aplica as escolhas do jogador (que consomem os 3 pontos)
        for (const key in skillInputs) {
            const value = parseInt(skillInputs[key].value);
            // Se o jogador selecionou Treinado (5) ou Especialista (10) para uma perícia:
            // Sobrescreve o valor inicial (0) ou Treinado (5) se ele for para Especialista
            if (value > pericias[key]) { // Garante que a escolha do jogador é aplicada
                pericias[key] = value;
            }
        }


        const pv = 10 + atributos.vigor;
        let pe = 5 + atributos.presenca + atributos.intelecto;
        if (origem === 'Acidente') {
            pe += 1;
        }

        let initialAbilityId = '';
        switch(classe) {
            case 'Atacante': initialAbilityId = 'ataqueExplosivo'; break;
            case 'Central': initialAbilityId = 'bloqueioDeFerro'; break;
            case 'Levantador': initialAbilityId = 'visaoDeAguia'; break;
            case 'Libero': initialAbilityId = 'defesaImpecavel'; break;
            case 'Oposto': initialAbilityId = 'contrarioFurioso'; break;
            default: initialAbilityId = ''; break;
        }


        const newPlayer = {
            id: Date.now().toString(),
            nome,
            escola,
            origem,
            classe,
            atributos,
            pericias, // Objeto de perícias final
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
        updateInitialSkills(); // Reseta os selects para o estado inicial
        calculateAttributePoints();
        // A função updateInitialSkills já chama calculateSkillPoints()

        alert(`Jogador ${nome} registrado com sucesso!`);
        showSection('character-list-section');
    });

    // --- Inicialização ---
    renderPlayers();
    updateInitialSkills();
    showSection('character-creation-section');
});
