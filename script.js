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
    const detailsNavButton = document.getElementById('details-nav-button'); // This button is for navigating to player details
    const subNavButtons = document.querySelectorAll('.sub-nav-button');
    const subPageSections = document.querySelectorAll('.sub-page-section');

    // Character Details Section Elements
    const currentPlayerNameElem = document.getElementById('current-player-name');
    const detailNome = document.getElementById('detail-nome');
    const detailEscola = document = document.getElementById('escola');
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

    // Character Creation Form Inputs (Attributes & Skills)
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
        'Acidente': { pericia: 'percepcaoSkill', beneficio: 'Afinidade com Estilo e +1 PE na criação.' }
    };

    // allAbilities is loaded from habilidades.js (global scope)

    // --- Global State Variables ---
    let players = JSON.parse(localStorage.getItem('haikyuuPlayers')) || [];
    let selectedPlayerId = null;

    // --- Navigation and UI Display Functions ---
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
            detailsNavButton.classList.add('active');
        }

        if (sectionId !== 'character-details-section') {
            detailsNavButton.style.display = 'none';
            selectedPlayerId = null;
        } else {
            detailsNavButton.style.display = 'block';
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
            total += parseInt(attrInputs[key].value) || 0;
        }
        pontosRestantesSpan.textContent = 10 - total;
        return 10 - total;
    }

    // Corrigido para receber selectedClass e selectedOrigem
    function calculateSkillPoints(selectedClass, selectedOrigem) {
        let customCost = 0;
        let specialistsUsed = 0;

        const freeTrainedSkills = new Set();
        if (selectedClass && classePericiasIniciais[selectedClass]) {
            classePericiasIniciais[selectedClass].forEach(skillId => freeTrainedSkills.add(skillId));
        }
        if (selectedOrigem && origemPericiaBeneficio[selectedOrigem]) {
            freeTrainedSkills.add(origemPericiaBeneficio[selectedOrigem].pericia);
        }

        for (const key in skillInputs) {
            const value = parseInt(skillInputs[key].value) || 0;

            if (freeTrainedSkills.has(key)) {
                if (value === 10) {
                    customCost += 1;
                    specialistsUsed += 1;
                }
            } else {
                if (value === 5) {
                    customCost += 1;
                } else if (value === 10) {
                    customCost += 2;
                    specialistsUsed += 1;
                }
            }
        }

        pontosPericiaRestantesSpan.textContent = 3 - customCost;
        especialistasUtilizadosSpan.textContent = `${specialistsUsed}/1`;
        return { remaining: 3 - customCost, specialists: specialistsUsed };
    }

    // Corrigido para receber selectedClass e selectedOrigem
    function updateInitialSkills(selectedClass, selectedOrigem) {
        for (const key in skillInputs) {
            skillInputs[key].value = "0";
        }

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
            if (skillElement && parseInt(skillElement.value) < 5) {
                skillElement.value = "5";
            }
        }
        calculateSkillPoints(selectedClass, selectedOrigem); // Chama com os valores passados
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
                    if (selectedPlayerId === playerId) {
                        showSection('character-list-section');
                    }
                });
            });
        }
    }

    // --- Display Detailed Player Information ---
    function displayPlayerDetails(playerId) {
        const player = getPlayerById(playerId);
        if (!player) {
            console.error('Jogador não encontrado para o ID:', playerId);
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
                    abilitiesHtml += `<div class="ability-display-item"><strong>${abilityId}</strong>: Estilo/Talento não encontrado (ID: ${abilityId})</div>`;
                }
            });
        } else {
            abilitiesHtml = '<p>Nenhum estilo de jogo ou talento aprimorado ainda.</p>';
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
        const learnedAbilityIds = new Set(player.habilidades);

        const abilitiesToSelect = allAbilities.filter(ab =>
            !ab.type.startsWith('Estilo: ') &&
            !learnedAbilityIds.has(ab.id)
        );

        abilitiesToSelect.forEach(ability => {
            const option = document.createElement('option');
            option.value = ability.id;
            option.textContent = `${ability.name} (${ability.cost} PE) - ${ability.type}`;
            selectNewAbility.appendChild(option);
        });
    }

    // --- NA Increase Logic (with simple prompt for choice) ---
    btnIncreaseNA.addEventListener('click', () => {
        const player = getPlayerById(selectedPlayerId);
        if (!player) return;

        player.na += 1;
        player.currentPv = player.pv;
        player.currentPe = player.pe;
        player.pe += 1;

        let bonusMessage = `Jogador ${player.nome} alcançou NA ${player.na}! Ganha +1 PE.`;

        if (player.na % 2 === 0) {
            const choice = prompt(`${bonusMessage}\nAlém disso, escolha: 'atributo' para +1 Atributo ou 'pericia' para +1 Ponto de Perícia.`);

            if (choice && choice.toLowerCase() === 'atributo') {
                const attrKeys = Object.keys(attrInputs);
                const attrNames = attrKeys.map(key => key.toUpperCase()).join(', ');
                const attrToIncreaseInput = prompt(`Qual atributo deseja aumentar? (${attrNames})`).toLowerCase();

                if (attrInputs.hasOwnProperty(attrToIncreaseInput)) {
                    if (player.atributos[attrToIncreaseInput] < 5) {
                        player.atributos[attrToIncreaseInput] += 1;
                        player.pv = 10 + player.atributos.vigor;
                        bonusMessage += `\n${attrToIncreaseInput.toUpperCase()} aumentado para ${player.atributos[attrToIncreaseInput]}.`;
                    } else {
                        alert('Atributo já no máximo (5). Ponto não aplicado.');
                    }
                } else {
                    alert('Atributo inválido. Ponto não aplicado.');
                }
            } else if (choice && choice.toLowerCase() === 'pericia') {
                const skillToIncreaseInput = prompt('Qual perícia deseja Treinar (+5) ou se tornar Especialista (+10)? (Digite o nome completo da perícia, ex: "Atletismo" ou "percepção")').toLowerCase();
                const skillId = Object.keys(skillInputs).find(key => key.toLowerCase() === skillToIncreaseInput || (key === 'percepcaoSkill' && skillToIncreaseInput === 'percepção'));

                if (skillId) {
                    if (player.pericias[skillId] === 0) {
                        player.pericias[skillId] = 5;
                        bonusMessage += `\n${skillId === 'percepcaoSkill' ? 'Percepção' : skillId.charAt(0).toUpperCase() + skillId.slice(1)} agora Treinado (+5).`;
                    } else if (player.pericias[skillId] === 5) {
                        let currentCustomSpecialists = 0;
                        const classSkills = new Set(classePericiasIniciais[player.classe] || []);
                        const originSkill = origemPericiaBeneficio[player.origem]?.pericia;
                        if (originSkill) classSkills.add(originSkill);

                        for(const sKey in player.pericias) {
                            if (player.pericias[sKey] === 10) {
                                if (!classSkills.has(sKey)) {
                                    currentCustomSpecialists++;
                                }
                            }
                        }

                        if (currentCustomSpecialists < 1) {
                            player.pericias[skillId] = 10;
                            bonusMessage += `\n${skillId === 'percepcaoSkill' ? 'Percepção' : skillId.charAt(0).toUpperCase() + skillId.slice(1)} agora Especialista (+10).`;
                        } else {
                            alert('Você já tem uma perícia como Especialista (além das iniciais). Não é possível ter outra desta forma. Ponto não aplicado.');
                        }
                    } else if (player.pericias[skillId] === 10) {
                        alert('Perícia já é Especialista (máximo). Ponto não aplicado.');
                    }
                } else {
                    alert('Perícia inválida. Ponto não aplicado.');
                }
            } else if (choice !== null) {
                alert('Escolha inválida. Ponto adicional de atributo/perícia não aplicado.');
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


    // --- Initial Event Listeners (Form and Nav) ---
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.tagName === 'A') {
                return;
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

    // Event listeners for skill input changes (call calculateSkillPoints with current select values)
    for (const key in skillInputs) {
        skillInputs[key].addEventListener('change', () => {
            const currentSelectedClass = document.getElementById('classe').value;
            const currentSelectedOrigem = document.getElementById('origem').value;
            calculateSkillPoints(currentSelectedClass, currentSelectedOrigem);
        });
    }

    // Event listeners for class and origin changes (call updateInitialSkills with current select values)
    document.getElementById('classe').addEventListener('change', () => {
        const currentSelectedClass = document.getElementById('classe').value;
        const currentSelectedOrigem = document.getElementById('origem').value;
        updateInitialSkills(currentSelectedClass, currentSelectedOrigem);
    });

    document.getElementById('origem').addEventListener('change', () => {
        const currentSelectedClass = document.getElementById('classe').value;
        const currentSelectedOrigem = document.getElementById('origem').value;
        updateInitialSkills(currentSelectedClass, currentSelectedOrigem);
    });


    // --- Character Creation Form Submission Logic ---
    characterForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nome = document.getElementById('nome').value.trim();
        const escola = document.getElementById('escola').value.trim();
        const origem = document.getElementById('origem').value; // Get the selected value directly here
        const classe = document.getElementById('classe').value; // Get the selected value directly here

        if (!nome || !escola || !origem || !classe) {
            alert('Por favor, preencha todos os campos obrigatórios (Nome, Escola, Origem, Classe).');
            return;
        }

        const remainingAttrPoints = calculateAttributePoints();
        if (remainingAttrPoints !== 0) {
            alert(`Você precisa distribuir exatamente 10 pontos de atributo. Pontos restantes: ${remainingAttrPoints}`);
            return;
        }

        // CHAMA calculateSkillPoints COM OS VALORES DE CLASSE/ORIGEM
        const { remaining: remainingSkillPoints, specialists: usedSpecialists } = calculateSkillPoints(classe, origem);
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

        const pericias = {};
        for (const key in skillInputs) {
            pericias[key] = 0;
        }

        const selectedClassInitialSkills = classePericiasIniciais[classe];
        if (selectedClassInitialSkills) {
            selectedClassInitialSkills.forEach(skillId => {
                pericias[skillId] = 5;
            });
        }

        const selectedOrigemData = origemPericiaBeneficio[origem];
        if (selectedOrigemData) {
            const originSkillId = origemPericiaBeneficio[selectedOrigem].pericia; // Use a variável 'origem'
            if (pericias[originSkillId] < 5) {
                pericias[originSkillId] = 5;
            }
        }

        for (const key in skillInputs) {
            const selectedValue = parseInt(skillInputs[key].value);
            if (selectedValue > pericias[key]) {
                pericias[key] = selectedValue;
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

        // Após resetar o formulário, chame updateInitialSkills e calculateAttributePoints
        // passando os valores default (vazios) para redefinir a exibição.
        const defaultClass = document.getElementById('classe').value; // Estará vazia após reset
        const defaultOrigin = document.getElementById('origem').value; // Estará vazia após reset
        updateInitialSkills(defaultClass, defaultOrigin); // Isso também chama calculateSkillPoints
        calculateAttributePoints();

        alert(`Jogador ${nome} registrado com sucesso!`);
        showSection('character-list-section');
    });

    // --- Initialization on Page Load ---
    renderPlayers();

    // PEGAR OS VALORES INICIAIS DOS DROPDOWNS PARA A CHAMADA INICIAL
    const initialClass = document.getElementById('classe').value;
    const initialOrigin = document.getElementById('origem').value;
    updateInitialSkills(initialClass, initialOrigin); // Isso também chama calculateSkillPoints

    calculateAttributePoints();

    showSection('character-creation-section');
});
