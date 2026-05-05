// ─── Referências ao DOM ───────────────────────────────────────────────────────
// Todas as referências são cacheadas aqui em cima para evitar
// queries repetidas ao DOM durante a execução (custo de performance).
const inputBusca     = document.getElementById('busca-input');
const btnBuscar      = document.getElementById('busca-pokemon');
const btnFavoritos   = document.getElementById('btn-favoritos');
const listaPokemon   = document.getElementById('lista-pokemon');
const mensagemStatus = document.getElementById('mensagem-status');
const modal          = document.getElementById('modal');
const modalImagem    = document.getElementById('modal-imagem');
const modalNome      = document.getElementById('modal-nome');
const modalId        = document.getElementById('modal-id');
const modalTipos     = document.getElementById('modal-tipos');
const modalAltura    = document.getElementById('modal-altura');
const modalPeso      = document.getElementById('modal-peso');
const btnFecharModal = document.getElementById('btn-fechar-modal');
const btnAnterior    = document.getElementById('btn-anterior');
const btnInicio      = document.getElementById('btn-inicio');
const btnProximo     = document.getElementById('btn-proximo');


// ─── Estado da aplicação ──────────────────────────────────────────────────────
let offset        = 0;           // Índice de paginação: avança de 20 em 20
let telaAtual     = 'principal'; // Controla qual "view" está ativa: 'principal' | 'favoritos'
let totalPokemons = 0;           // Preenchido pela API; usado para desabilitar o botão "Próximo"
let favoritos     = JSON.parse(localStorage.getItem('favoritos')) || []; // Persiste entre sessões


// ─── Carregamento paginado ────────────────────────────────────────────────────
function carregarPokemons() {
    mostrarMensagem('⏳ Carregando...', 'carregando');

    // Busca a lista de pokémons da página atual (limit=20 por página)
    fetch(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`)
        .then(response => response.json())
        .then(data => {
            totalPokemons = data.count;
            atualizarBotoes();

            // A PokéAPI retorna apenas nome e URL na listagem.
            // É necessário fazer uma segunda requisição por pokémon para obter
            // imagem, tipos, altura e peso — por isso o map + Promise.all.
            const promessas = data.results.map(pokemon =>
                fetch(pokemon.url).then(res => res.json())
            );

            Promise.all(promessas).then(listaDetalhes => {
                listaDetalhes.forEach(detalhes => renderizarCard(detalhes));
                esconderMensagem();
            });
        })
        .catch(error => console.error('Erro ao carregar os pokémons:', error));
}

carregarPokemons();


// ─── Renderização de card ─────────────────────────────────────────────────────
function renderizarCard(pokemon) {
    const card = document.createElement('div');
    card.classList.add('card-pokemon');

    // "official-artwork" é a versão de maior qualidade disponível na PokéAPI.
    // A notação de colchete é necessária porque a chave contém hifens.
    card.innerHTML = `
        <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
        <h2>${pokemon.name}</h2>
        <p>#${pokemon.id}</p>
        <div>${pokemon.types.map(t => `<span class="tipo">${t.type.name}</span>`).join('')}</div>
        <button class="btn-favoritar" data-id="${pokemon.id}">☆ Favoritar</button>
    `;

    // O clique no card abre o modal, mas o clique no botão de favoritar
    // NÃO deve propagar para o card — por isso o stopPropagation abaixo.
    card.addEventListener('click', () => abrirModal(pokemon));

    const btnFavoritar = card.querySelector('.btn-favoritar');
    btnFavoritar.textContent = favoritos.includes(pokemon.id) ? '⭐ Favoritado' : '☆ Favoritar';

    btnFavoritar.addEventListener('click', (event) => {
        event.stopPropagation(); // Impede que o clique no botão abra o modal
        toggleFavorito(pokemon.id);
        btnFavoritar.textContent = favoritos.includes(pokemon.id) ? '⭐ Favoritado' : '☆ Favoritar';
    });

    listaPokemon.appendChild(card);
}


// ─── Controle de botões de navegação ─────────────────────────────────────────
function atualizarBotoes() {
    if (telaAtual === 'favoritos') {
        // Na tela de favoritos não há paginação
        btnAnterior.disabled = true;
        btnProximo.disabled  = true;
    } else {
        btnAnterior.disabled = offset === 0;
        btnProximo.disabled  = offset + 20 >= totalPokemons;
    }
}


// ─── Navegação por páginas ────────────────────────────────────────────────────
btnProximo.addEventListener('click', () => {
    offset += 20;
    listaPokemon.innerHTML = '';
    carregarPokemons();
    atualizarBotoes();
});

btnAnterior.addEventListener('click', () => {
    offset -= 20;
    listaPokemon.innerHTML = '';
    carregarPokemons();
    atualizarBotoes();
});

btnInicio.addEventListener('click', () => {
    telaAtual = 'principal';
    offset    = 0;
    listaPokemon.innerHTML = '';
    carregarPokemons();
    atualizarBotoes();
});


// ─── Busca por nome ───────────────────────────────────────────────────────────
function buscarPokemon() {
    const nome = inputBusca.value.trim().toLowerCase();
    if (nome === '') return;

    fetch(`https://pokeapi.co/api/v2/pokemon/${nome}`)
        .then(response => {
            // A PokéAPI retorna 404 para nomes inválidos, mas fetch() não lança
            // erro automaticamente em respostas 4xx — por isso a verificação manual.
            if (!response.ok) throw new Error('Pokémon não encontrado');
            return response.json();
        })
        .then(pokemon => {
            listaPokemon.innerHTML = '';
            // Desabilita paginação durante busca individual
            btnAnterior.disabled = true;
            btnProximo.disabled  = true;
            btnInicio.disabled   = false;
            renderizarCard(pokemon);
            inputBusca.value = '';
        })
        .catch(() => {
            listaPokemon.innerHTML = '';
            mostrarMensagem('❌ Pokémon não encontrado!', 'erro');
        });
}

btnBuscar.addEventListener('click', buscarPokemon);

// Atalho de teclado: permite buscar sem precisar clicar no botão
inputBusca.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') buscarPokemon();
});


// ─── Modal de detalhes ────────────────────────────────────────────────────────
function abrirModal(pokemon) {
    modalImagem.src       = pokemon.sprites.other['official-artwork'].front_default;
    modalImagem.alt       = pokemon.name; // Acessibilidade: alt deve descrever o conteúdo
    modalNome.textContent = pokemon.name;
    modalId.textContent   = `ID: #${pokemon.id}`;
    modalTipos.textContent = `Tipo: ${pokemon.types.map(t => t.type.name).join(', ')}`;

    // A API retorna altura em decímetros e peso em hectogramas — convertemos para m e kg
    modalAltura.textContent = `Altura: ${pokemon.height / 10} m`;
    modalPeso.textContent   = `Peso: ${pokemon.weight / 10} kg`;

    modal.classList.remove('modal-fechado');
    modal.classList.add('modal-aberto');
}

btnFecharModal.addEventListener('click', () => {
    modal.classList.remove('modal-aberto');
    modal.classList.add('modal-fechado');
});


// ─── Favoritos ────────────────────────────────────────────────────────────────
function toggleFavorito(id) {
    if (favoritos.includes(id)) {
        favoritos = favoritos.filter(f => f !== id);
    } else {
        favoritos.push(id);
    }
    // Persiste imediatamente no localStorage para sobreviver ao reload
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
}

function mostrarFavoritos() {
    telaAtual = 'favoritos';
    listaPokemon.innerHTML = '';

    if (favoritos.length === 0) {
        mostrarMensagem('Nenhum pokémon favorito encontrado.', 'info');
        return;
    }

    const promessas = favoritos.map(id =>
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(res => res.json())
    );

    Promise.all(promessas).then(listaDetalhes => {
        listaDetalhes.forEach(detalhes => renderizarCard(detalhes));
        esconderMensagem();
        atualizarBotoes();
    });
}

btnFavoritos.addEventListener('click', mostrarFavoritos);


// ─── Utilitários de status ────────────────────────────────────────────────────
function mostrarMensagem(texto, classe) {
    mensagemStatus.textContent   = texto;
    mensagemStatus.className     = classe;
    mensagemStatus.style.display = 'block';
}

function esconderMensagem() {
    mensagemStatus.style.display = 'none';
    mensagemStatus.textContent   = '';
    mensagemStatus.className     = '';
}