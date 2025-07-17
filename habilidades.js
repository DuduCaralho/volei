// habilidades.js

// Lista completa de habilidades com detalhes, incluindo habilidades de classe.
const allAbilities = [
    // Habilidades de Classe (IDs para referência)
    { id: 'ataqueExplosivo', name: 'Ataque Explosivo', cost: 1, type: 'Classe: Atacante', description: 'Uma vez por rodada, ao realizar um ataque, você pode gastar 1 Ponto de Esforço (PE) para adicionar +2 ao seu teste de ataque.' },
    { id: 'bloqueioDeFerro', name: 'Bloqueio de Ferro', cost: 1, type: 'Classe: Central', description: 'Uma vez por rodada, ao realizar um bloqueio bem-sucedido, você pode gastar 1 PE para reduzir o dano do ataque adversário em 2.' },
    { id: 'visaoDeAguia', name: 'Visão de Águia', cost: 1, type: 'Classe: Levantador', description: 'Uma vez por rodada, antes de realizar um levantamento, você pode gastar 1 PE para obter uma informação detalhada sobre a defesa adversária (Ex: "O bloqueador central está fora de posição").' },
    { id: 'defesaImpecavel', name: 'Defesa Impecável', cost: 1, type: 'Classe: Líbero', description: 'Uma vez por rodada, quando um ataque adversário seria um ponto, você pode gastar 1 PE para rolar um teste de Defesa (AGI + Reflexos) CD 15. Em caso de sucesso, você consegue salvar a bola.' },
    { id: 'contrarioFurioso', name: 'Contrário Furioso', cost: 2, type: 'Classe: Oposto', description: 'Uma vez por partida, quando seu time estiver em desvantagem no placar por 3 ou mais pontos, você pode gastar 2 PE para adicionar +3 ao seu próximo teste de ataque ou bloqueio.' },

    // Aura de Vento (AGI)
    { id: 'corteRapido', name: 'Corte Rápido', cost: 1, type: 'Aura de Vento', description: 'Após levantamento, mova-se até 6m antes de atacar, ignorando terreno difícil.' },
    { id: 'defesaDeslizante', name: 'Defesa Deslizante', cost: 1, type: 'Aura de Vento', description: 'Ao fazer um teste de defesa, pode gastar 1 PE para rolar novamente um dado que resultou em 1.' },
    { id: 'saqueVentania', name: 'Saque Ventania', cost: 2, type: 'Aura de Vento', description: 'Seu saque cria uma leve perturbação no ar. O receptor adversário sofre -2 em seu teste de recepção.' },
    // Aura de Terra (FOR)
    { id: 'marteloTerrano', name: 'Martelo Terrano', cost: 2, type: 'Aura de Terra', description: 'Ao realizar um ataque, gaste 2 PE. Seu ataque causa +1 de "Dano" e ignora 1 ponto de bloqueio adversário.' },
    { id: 'muroInabalavel', name: 'Muro Inabalável', cost: 1, type: 'Aura de Terra', description: 'Ao bloquear, gaste 1 PE. Adicione +2 à sua CD de Bloqueio neste turno.' },
    { id: 'impactoNoChao', name: 'Impacto no Chão', cost: 1, type: 'Aura de Terra', description: 'Ao cair de um salto, você pode gastar 1 PE para criar uma pequena onda de choque. Oponentes adjacentes (até 3m) devem fazer um teste de AGI (CD 10) ou ficam desprevenidos por uma rodada.' },
    // Aura de Água (INT)
    { id: 'fluxoTatico', name: 'Fluxo Tático', cost: 1, type: 'Aura de Água', description: 'Após observar um movimento adversário, gaste 1 PE. Na próxima rodada, um aliado recebe +2 em um teste de Perícia de Tática ou Defesa.' },
    { id: 'toqueSubtil', name: 'Toque Sutil', cost: 1, type: 'Aura de Água', description: 'Ao realizar um levantamento, gaste 1 PE. O atacante que receber seu levantamento pode escolher qual dos bloqueadores adversários ele quer focar.' },
    { id: 'ondasDePressao', name: 'Ondas de Pressão', cost: 2, type: 'Aura de Água', description: 'Gaste 2 PE para forçar um oponente a fazer um teste de Vontade (PRE ou INT) CD 12. Em caso de falha, ele perde 1 Ponto de Esforço no próximo turno devido à pressão.' },
    // Aura de Fogo (PRE)
    { id: 'gritoIncendiario', name: 'Grito Incendiário', cost: 1, type: 'Aura de Fogo', description: 'Gaste 1 PE. Inspire um aliado adjacente. Ele ganha +1 em um teste de Atributo ou Perícia até o final da rodada.' },
    { id: 'auraDeCombate', name: 'Aura de Combate', cost: 2, type: 'Aura de Fogo', description: 'Pelo custo de 2 PE por rodada, enquanto ativa, você e aliados adjacentes (3m) ganham +1 em testes de Ataque.' },
    { id: 'espiritoInquebravel', name: 'Espírito Inquebrável', cost: 1, type: 'Aura de Fogo', description: 'Quando seus PV caem abaixo de 5, gaste 1 PE. Você recupera 3 PV e pode fazer uma ação extra de movimento neste turno.' },
    // Aura de Luz (PER)
    { id: 'olhosPrevisores', name: 'Olhos Previsores', cost: 2, type: 'Aura de Luz', description: 'Gaste 2 PE. No início da rodada, você pode perguntar ao Mestre uma informação sobre a próxima ação de um adversário (Ex: "Quem vai atacar?", "Para onde a bola vai?").' },
    { id: 'recepcaoIluminada', name: 'Recepção Iluminada', cost: 1, type: 'Aura de Luz', description: 'Gaste 1 PE. Quando você ou um aliado adjacente fizer um teste de Recepção/Defesa, você pode adicionar +3 ao resultado.' },
    { id: 'caminhoBrilhante', name: 'Caminho Brilhante', cost: 1, type: 'Aura de Luz', description: 'Gaste 1 PE. Ao levantar a bola, você pode dar uma sugestão de "melhor ataque" (Ex: "vá para a paralela") para o atacante. Se ele seguir, ganha +2 no teste de Ataque.' },
    // Aura de Escuridão (VIG)
    { id: 'resilienciaInabalavel', name: 'Resiliência Inabalável', cost: 1, type: 'Aura de Escuridão', description: 'Gaste 1 PE. Se você for atingido por um ataque que causa "Dano" ou condição (Atordoados, Cansado), você pode reduzir o efeito em 1 nível (ex: Atordoado se torna Cansado, Cansado se torna nada).' },
    { id: 'absorcaoDeImpacto', name: 'Absorção de Impacto', cost: 2, type: 'Aura de Escuridão', description: 'Gaste 2 PE para converter o "Dano" que você receberia em PE. Cada 2 pontos de Dano se tornam 1 PE (você ainda sofre o dano normal).' },
    { id: 'sombraPersistente', name: 'Sombra Persistente', cost: 1, type: 'Aura de Escuridão', description: 'Uma vez por rodada, quando um ataque adversário seria bem-sucedido, você pode gastar 1 PE para se reposicionar rapidamente (3m) e tentar uma defesa novamente com -2 na CD.' }
];
