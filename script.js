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
        percepcaoSkill: document.getElementById('percepcao-skill'), // Renamed to avoid conflict with 'percepcao' attribute
        pontaria: document.getElementById('pontaria'),
        reflexos: document.getElementById('reflexos'),
        tatica: document.getElementById('tatica')
    };

    // --- Game Data Definitions ---
    // Mapping class to their initial free skills
    const classePericiasIniciais = {
        'Atacante': ['atletismo', 'intimidacao', 'pontaria'],
        'Central': ['bloqueio', 'tatica', 'percepcaoSkill'],
        'Levantador': ['tatica', 'lideranca', 'foco'],
        'Libero': ['acrobacia', 'reflexos', 'fortitude'],
        'Oposto': ['atletismo', 'determinacao', 'intimidacao']
    };

    // Mapping origin to their initial free skill and benefit description
    const origemPericiaBeneficio = {
        'Prodigio': { pericia: 'manobra', beneficio: 'Uma vez/partida, rola teste de PER ou AGI com Vantagem.' },
        'Trabalho Duro': { pericia: 'determinacao', beneficio: 'Uma vez/partida, +5 em teste de VIG.' },
        'Rivalidade': { pericia: 'intimidacao', beneficio: 'Uma vez/partida, +2 em ataques contra rival específico.' },
        'Legado Familiar': { pericia: 'tatica', beneficio: 'Uma vez/partida, gasta 1 PE para dar +2 em perícia de aliado adjacente.' },
        'Azarao': { pericia: 'fortitude', beneficio: 'Uma vez/partida, se PV < 50%, +1 em todos os atributos até o final do set.' },
        'Acidente': { pericia: 'percepcaoSkill', beneficio: 'Afinidade com Estilo e +1 PE na criação.' } // Atualizado "Paranormal" para "Estilo"
    };

    // allAbilities is loaded from habilidades.js (global scope)

    // --- Global State Variables ---
    let players = JSON.parse(localStorage.getItem('haikyuuPlayers')) || [];
    let selectedPlayerId = null;

    // --- Navigation and UI Display Functions ---
    function showSection(sectionId) {
        // Hide all main sections
        pageSections.forEach(section => {
            section.classList.remove('active');
        });
        // Show the target section
        document.getElementById(sectionId).classList.add('active');

        // Update active state of main nav buttons
        navButtons.forEach(button => {
            button.classList.remove('active');
        });
        const targetButton = document.querySelector(`.nav-button[data-section="${sectionId}"]`);
        if (targetButton) {
            targetButton.classList.add('active');
        } else if (sectionId === 'character-details-section') {
            // Special case for details button, as it might not always be in the DOM initially
            detailsNavButton.classList.add('active');
        }

        // Manage visibility of "Detalhes do Jogador" button
        if (sectionId !== 'character-details-section') {
            detailsNavButton.style.display = 'none';
            selectedPlayerId = null; // Clear selected player when leaving details
        } else {
            detailsNavButton.style.display = 'block'; // Ensure it's visible when on details page
        }
    }

    function showSubSection(subSectionId) {
        // Hide all sub-sections within character details
        subPageSections.forEach(subSection => {
            subSection.classList.remove('active');
        });
        // Show the target sub-section
        document.getElementById(subSectionId).classList.add('active');

        // Update active state of sub-nav buttons
        subNavButtons.forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`.sub-nav-button[data-sub-section="${subSectionId}"]`).classList.add('active');
    }

    // --- Character Creation Calculations and Validations ---

    // Calculates remaining attribute points based on user input
    function calculateAttributePoints() {
        let total = 0;
        for (const key in attrInputs) {
            total += parseInt(attrInputs[key].value) || 0; // Use || 0 to handle NaN from empty inputs
        }
        pontosRestantesSpan.textContent = 10 - total;
        return 10 - total;
    }

    // Calculates cost of user-selected skills, considering free initial skills
    // AGORA RECEBE classe e origem como argumentos
    function calculateSkillPoints(selectedClass, selectedOrigem) {
        let customCost = 0;
        let specialistsUsed = 0;

        // Determine which skills are 'Trained' for free by Class/Origin
        const freeTrainedSkills = new Set();
        if (selectedClass && classePericiasIniciais[selectedClass]) {
            classePericiasIniciais[selectedClass].forEach(skillId => freeTrainedSkills.add(skillId));
        }
        if (selectedOrigem && origemPericiaBeneficio[selectedOrigem]) {
            freeTrainedSkills.add(origemPericiaBeneficio[selectedOrigem].pericia);
        }

        // Calculate cost based on user selections
        for (const key in skillInputs) {
            const value = parseInt(skillInputs[key].value) || 0;

            if (freeTrainedSkills.has(key)) {
                // If this skill is initially free (Trained)
                if (value === 10) { // User upgraded to Specialist
                    customCost += 1; // Costs 1 point to go from 5 to 10
                    specialistsUsed += 1;
                }
                // If value is 5 (Trained) or 0 (Not Trained), it costs 0 as it's free.
            } else {
                // If this skill is NOT initially free
                if (value === 5) { // User made it Trained
                    customCost += 1;
                } else if (value === 10) { // User made it Specialist
                    customCost += 2;
                    specialistsUsed += 1;
                }
            }
        }

        pontosPericiaRestantesSpan.textContent = 3 - customCost;
        especialistasUtilizadosSpan.textContent = `${specialistsUsed}/1`;
        return { remaining: 3 - customCost, specialists: specialistsUsed };
    }

    // Resets skill dropdowns and applies initial class/origin skills
    // AGORA RECEBE classe e origem como argumentos
    function updateInitialSkills(selectedClass, selectedOrigem) {
        // Reset all skill dropdowns to "Não Treinado"
        for (const key in skillInputs) {
            skillInputs[key].value = "0";
        }

        // Apply initial skills from Class
        if (selectedClass && classePericiasIniciais[selectedClass]) {
            classePericiasIniciais[selectedClass].forEach(skillId => {
                const skillElement = skillInputs[skillId];
                if (skillElement) {
                    skillElement.value = "5"; // Set to Trained
                }
            });
        }

        // Apply initial skill from Origin
        if (selectedOrigem && origemPericiaBeneficio[selectedOrigem]) {
            const originSkillId = origemPericiaBeneficio[selectedOrigem].pericia;
            const skillElement = skillInputs[originSkillId];
            if (skillElement && parseInt(skillElement.value) < 5) { // Only if not already Trained by Class
                skillElement.value = "5"; // Set to Trained
            }
        }
        // Ao chamar calculateSkillPoints aqui, precisamos dos valores atuais dos selects de classe/origem.
        // Como esta função é chamada por eles, podemos pegá-los diretamente.
        const currentSelectedClass = document.getElementById('classe').value;
        const currentSelectedOrigem = document.getElementById('origem').value;
        calculateSkillPoints(currentSelectedClass, currentSelectedOrigem);
    }

    // --- Player Data Management (LocalStorage) ---

    // Saves the current players array to LocalStorage
    function savePlayers() {
        localStorage.setItem('haikyuuPlayers', JSON.stringify(players));
    }

    // Retrieves a player object by their ID
    function getPlayerById(id) {
        return players.find(p => p.id === id);
    }

    // Renders the list of players in the "Lista de Jogadores" section
    function renderPlayers() {
        playersContainer.innerHTML = ''; // Clear existing cards
        if (players.length === 0) {
            noPlayersMessage.style.display = 'block'; // Show "no players" message
        } else {
            noPlayersMessage.style.display = 'none'; // Hide message
            players.forEach(player => {
                const playerCard = document.createElement('div');
                playerCard.classList.add('player-card');
                playerCard.dataset.id = player.id; // Store ID for click events

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

            // Attach event listeners to newly created player cards and delete buttons
            document.querySelectorAll('.player-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    // Prevent card click if delete button or its icon was clicked
                    if (e.target.closest('.delete-btn')) {
                        return;
                    }
                    selectedPlayerId = card.dataset.id;
                    displayPlayerDetails(selectedPlayerId);
                    showSection('character-details-section'); // Navigate to details page
                    showSubSection('sub-personagem'); // Default to "Personagem" sub-page
                });
            });

            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent the parent card's click event from firing
                    const playerId = e.target.closest('.delete-btn').dataset.id;
                    players = players.filter(p => p.id !== playerId); // Remove player from array
                    savePlayers(); // Update LocalStorage
                    renderPlayers(); // Re-render the list
                    if (selectedPlayerId === playerId) { // If the deleted player was currently displayed
                        showSection('character-list-section'); // Go back to player list
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

        // Populate "Personagem" sub-section
        detailNome.textContent = player.nome;
        detailEscola.textContent = player.escola;
        detailOrigem.textContent = `${player.origem} (${origemPericiaBeneficio[player.origem] ? origemPericiaBeneficio[player.origem].beneficio : 'Nenhum benefício.'})`;
        detailClasse.textContent = player.classe;
        detailNA.textContent = player.na;
        detailPV.textContent = player.currentPv || player.pv;
        detailMaxPV.textContent = player.pv;
        detailPE.textContent = player.currentPe || player.pe;
        detailMaxPE.textContent = player.pe;

        // Display attributes with icons
        let attributesHtml = '';
        const attrIcons = {
            forca: '<i class="fas fa-dumbbell"></i>', agilidade: '<i class="fas fa-running"></i>', vigor: '<i class="fas fa-heartbeat"></i>',
            presenca: '<i class="fas fa-star"></i>', intelecto: '<i class="fas fa-brain"></i>', percepcao: '<i class="fas fa-eye"></i>'
        };
        for (const attr in player.atributos) {
            attributesHtml += `<div class="attr-display-item">${attrIcons[attr]} <strong>${attr.toUpperCase()}:</strong> ${player.atributos[attr]}</div>`;
        }
        detailAtributos.innerHTML = attributesHtml;

        // Display skills with icons
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
            if (skillValue !== 0) { // Only display if trained or specialized
                const level = skillValue === 5 ? 'Treinado' : 'Especialista';
                const displayName = skillId === 'percepcaoSkill' ? 'Percepção' : skillId.charAt(0).toUpperCase() + skillId.slice(1);
                skillsHtml += `<div class="skill-display-item">${skillIcons[skillId] || '<i class="fas fa-asterisk"></i>'} <strong>${displayName}:</strong> ${level} (+${skillValue})</div>`;
            }
        }
        detailPericias.innerHTML = skillsHtml || '<p>Nenhuma perícia treinada.</p>';

        // Display abilities with icons and descriptions
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
        populateAbilitySelection(player); // Populate dropdown for adding new abilities

        // Populate "Descrição" sub-section
        detailLore.value = player.lore || '';
        detailDescricaoFisica.value = player.descricaoFisica || '';
        detailMotivacoes.value = player.motivacoes || '';
        detailAnotacoes.value = player.anotacoes || '';
    }

    // Helper function to get the appropriate icon for an ability type
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
        return '<i class="fas fa-question-circle"></i>'; // Default
    }

    // Populates the dropdown for adding new abilities to a player
    function populateAbilitySelection(player) {
        selectNewAbility.innerHTML = '<option value="">Selecione um Estilo/Talento</option>';
        const learnedAbilityIds = new Set(player.habilidades); // Use Set for efficient lookup

        // Filter out class abilities and already learned abilities
        const abilitiesToSelect = allAbilities.filter(ab =>
            !ab.type.startsWith('Estilo: ') && // Exclude Class-specific abilities
            !learnedAbilityIds.has(ab.id) // Exclude already learned abilities
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
        player.currentPv = player.pv; // Reset current PV/PE to max on NA up
        player.currentPe = player.pe;
        player.pe += 1; // Always gain 1 PE

        let bonusMessage = `Jogador ${player.nome} alcançou NA ${player.na}! Ganha +1 PE.`;

        // Every even NA, get 1 Attr or 1 Skill point
        if (player.na % 2 === 0) {
            const choice = prompt(`${bonusMessage}\nAlém disso, escolha: 'atributo' para +1 Atributo ou 'pericia' para +1 Ponto de Perícia.`);

            if (choice && choice.toLowerCase() === 'atributo') {
                const attrKeys = Object.keys(attrInputs);
                const attrNames = attrKeys.map(key => key.toUpperCase()).join(', ');
                const attrToIncreaseInput = prompt(`Qual atributo deseja aumentar? (${attrNames})`).toLowerCase();

                if (attrInputs.hasOwnProperty(attrToIncreaseInput)) {
                    if (player.atributos[attrToIncreaseInput] < 5) { // Max 5 per attribute
                        player.atributos[attrToIncreaseInput] += 1;
                        player.pv = 10 + player.atributos.vigor; // Recalculate max PV if Vigor increased
                        bonusMessage += `\n${attrToIncreaseInput.toUpperCase()} aumentado para ${player.atributos[attrToIncreaseInput]}.`;
                    } else {
                        alert('Atributo já no máximo (5). Ponto não aplicado.');
                    }
                } else {
                    alert('Atributo inválido. Ponto não aplicado.');
                }
            } else if (choice && choice.toLowerCase() === 'pericia') {
                const skillToIncreaseInput = prompt('Qual perícia deseja Treinar (+5) ou se tornar Especialista (+10)? (Digite o nome completo da perícia, ex: "Atletismo" ou "percepção")').toLowerCase();
                const skillId = Object.keys(skillInputs).find(key => key.toLowerCase() === skillToIncreaseInput || (key === 'percepcaoSkill' && skillToIncreaseInput === 'percepção')); // Handle 'percepcaoSkill'

                if (skillId) {
                    if (player.pericias[skillId] === 0) { // Not trained, make it trained
                        player.pericias[skillId] = 5;
                        bonusMessage += `\n${skillId === 'percepcaoSkill' ? 'Percepção' : skillId.charAt(0).toUpperCase() + skillId.slice(1)} agora Treinado (+5).`;
                    } else if (player.pericias[skillId] === 5) { // Trained, make it specialist
                        // Check if player already has a custom specialist (excluding initial free ones)
                        // This calculation needs to be based on the player's actual stored skills, not current form values
                        let currentCustomSpecialists = 0;
                        const classSkills = new Set(classePericiasIniciais[player.classe] || []);
                        const originSkill = origemPericiaBeneficio[player.origem]?.pericia;
                        if (originSkill) classSkills.add(originSkill);

                        for(const sKey in player.pericias) { // Loop through the player's skills
                            if (player.pericias[sKey] === 10) {
                                if (!classSkills.has(sKey)) { // Count if it's a specialist NOT from initial free skills
                                    currentCustomSpecialists++;
                                }
                            }
                        }
                        // This logic needs to be careful: the free specialist from "NA" should not count towards the 1-specialist limit for custom points.
                        // For simplicity, this currentCustomSpecialists check is probably sufficient, assuming a new NA point doesn't create a *second* "custom" specialist.

                        if (currentCustomSpecialists < 1) { // Allows 1 specialist from custom points
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
            } else if (choice !== null) { // User typed something but not 'atributo' or 'pericia'
                alert('Escolha inválida. Ponto adicional de atributo/perícia não aplicado.');
            }
            // If choice is null (user cancelled prompt), do nothing.
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
            // If it's the 'Como Jogar' link (which is an <a> tag), let it handle navigation directly
            if (button.tagName === 'A') {
                return;
            }
            showSection(button.dataset.section);
            if (button.dataset.section === 'character-list-section') {
                renderPlayers(); // Re-render list when navigating to it
            }
        });
    });

    subNavButtons.forEach(button => {
        button.addEventListener('click', () => {
            showSubSection(button.dataset.subSection);
        });
    });

    // Event listeners for attribute and skill input changes
    for (const key in attrInputs) {
        attrInputs[key].addEventListener('input', calculateAttributePoints);
    }

    // When a skill dropdown changes, recalculate points using its current class/origin
    for (const key in skillInputs) {
        skillInputs[key].addEventListener('change', () => {
            const currentSelectedClass = document.getElementById('classe').value;
            const currentSelectedOrigem = document.getElementById('origem').value;
            calculateSkillPoints(currentSelectedClass, currentSelectedOrigem);
        });
    }

    // When class or origin changes, update initial skills and recalculate points
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
        e.preventDefault(); // Prevent default form submission (page reload)

        // Gather form data
        const nome = document.getElementById('nome').value.trim();
        const escola = document.getElementById('escola').value.trim();
        const origem = document.getElementById('origem').value; // Get the selected value directly
        const classe = document.getElementById('classe').value; // Get the selected value directly

        // --- Basic Validations ---
        if (!nome || !escola || !origem || !classe) {
            alert('Por favor, preencha todos os campos obrigatórios (Nome, Escola, Origem, Classe).');
            return;
        }

        const remainingAttrPoints = calculateAttributePoints();
        if (remainingAttrPoints !== 0) {
            alert(`Você precisa distribuir exatamente 10 pontos de atributo. Pontos restantes: ${remainingAttrPoints}`);
            return;
        }

        // Call calculateSkillPoints with the explicitly gathered class/origin values
        const { remaining: remainingSkillPoints, specialists: usedSpecialists } = calculateSkillPoints(classe, origem);
        if (remainingSkillPoints < 0) {
            alert(`Você gastou muitos pontos de perícia adicionais. Pontos restantes: ${remainingSkillPoints}`);
            return;
        }
        if (usedSpecialists > 1) {
            alert('Você pode ter no máximo uma perícia como Especialista (além das iniciais).');
            return;
        }

        // --- Collect Attribute Values ---
        const atributos = {};
        for (const key in attrInputs) {
            atributos[key] = parseInt(attrInputs[key].value);
        }

        // --- Collect Skill Values (Apply Free Initials + User Customizations) ---
        const pericias = {}; // This will hold the final skill values for the new player

        // 1. Initialize all skills to 0 (Not Trained)
        for (const key in skillInputs) {
            pericias[key] = 0;
        }

        // 2. Apply initial skills from Class (free, value 5)
        const selectedClassInitialSkills = classePericiasIniciais[classe];
        if (selectedClassInitialSkills) {
            selectedClassInitialSkills.forEach(skillId => {
                pericias[skillId] = 5;
            });
        }

        // 3. Apply initial skill from Origin (free, value 5)
        const selectedOrigemData = origemPericiaBeneficio[origem];
        if (selectedOrigemData) {
            const originSkillId = origemPericiaBeneficio[selectedOrigem].pericia;
            if (pericias[originSkillId] < 5) { // Only apply if not already Trained by Class
                pericias[originSkillId] = 5;
            }
        }

        // 4. Override with player's custom selections (which cost points)
        for (const key in skillInputs) {
            const selectedValue = parseInt(skillInputs[key].value);
            // Only update if the user explicitly selected a higher level than the free initial one
            // or if it's a skill not covered by free initials.
            if (selectedValue > pericias[key]) {
                pericias[key] = selectedValue;
            }
        }

        // --- Calculate PV and PE ---
        const pv = 10 + atributos.vigor;
        let pe = 5 + atributos.presenca + atributos.intelecto;
        if (origem === 'Acidente') {
            pe += 1;
        }

        // --- Determine Initial Class Ability ---
        let initialAbilityId = '';
        switch(classe) {
            case 'Atacante': initialAbilityId = 'ataqueExplosivo'; break;
            case 'Central': initialAbilityId = 'bloqueioDeFerro'; break;
            case 'Levantador': initialAbilityId = 'visaoDeAguia'; break;
            case 'Libero': initialAbilityId = 'defesaImpecavel'; break;
            case 'Oposto': initialAbilityId = 'contrarioFurioso'; break;
        }

        // --- Create New Player Object ---
        const newPlayer = {
            id: Date.now().toString(), // Unique ID for the player
            nome,
            escola,
            origem,
            classe,
            atributos,
            pericias, // Final computed skills
            pv: pv,
            currentPv: pv, // Track current PV
            pe: pe,
            currentPe: pe, // Track current PE
            na: 1, // Starting NA
            habilidades: initialAbilityId ? [initialAbilityId] : [], // Start with class ability
            lore: '',
            descricaoFisica: '',
            motivacoes: '',
            anotacoes: ''
        };

        // Add player to array, save, render, and reset form
        players.push(newPlayer);
        savePlayers();
        renderPlayers();
        characterForm.reset(); // Clear all form fields
        // After reset, re-run initial setup for the next character creation
        const defaultClass = document.getElementById('classe').value; // Will be empty string after reset
        const defaultOrigin = document.getElementById('origem').value; // Will be empty string after reset
        updateInitialSkills(defaultClass, defaultOrigin); // Re-sets dropdowns and recalculates based on default empty selections
        calculateAttributePoints(); // Recalculate attribute points display

        alert(`Jogador ${nome} registrado com sucesso!`);
        showSection('character-list-section'); // Navigate to player list after successful creation
    });

    // --- Initialization on Page Load ---
    renderPlayers(); // Load and display existing players

    // Initial call to set up skills display based on default form values (or empty)
    const initialClass = document.getElementById('classe').value;
    const initialOrigin = document.getElementById('origem').value;
    updateInitialSkills(initialClass, initialOrigin);

    calculateAttributePoints(); // Calculate initial attribute points display

    showSection('character-creation-section'); // Default to character creation page
});
