
// Espera o HTML carregar completamente
document.addEventListener('DOMContentLoaded', () => {

    const gallery = document.getElementById('pokemonGallery');
    const loading = document.getElementById('loading');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2/pokemon';

    // Função para mostrar/ocultar o indicador "Carregando..."
    function toggleLoading(show) {
        loading.style.display = show ? 'block' : 'none';
    }

    // Função para criar o card de um Pokémon
    function createPokemonCard(pokemon) {
        // Criando o card
        const card = document.createElement('div');
        card.classList.add('pokemon-card');

        // Criando o link para a página de detalhes
        // Esta é a parte crucial: passamos o nome pela URL
        const link = document.createElement('a');
        link.href = `detalhes.html?name=${pokemon.name}`;

        // Adicionando a imagem
        const img = document.createElement('img');
        // Usando o 'front_default' sprite
        img.src = pokemon.sprites.front_default;
        img.alt = `Imagem do ${pokemon.name}`;

        // Adicionando o nome
        const name = document.createElement('p');
        name.textContent = pokemon.name;

        // Montantando o card: link -> (img, name)
        link.appendChild(img);
        link.appendChild(name);
        // Card -> link
        card.appendChild(link);

        return card;
    }

    // Função para buscar os primeiros 20 Pokémon (Galeria)
    async function fetchInitialPokemon() {
        toggleLoading(true);
        gallery.innerHTML = ''; // Limpa a galeria

        try {
            // 1. Busca a lista inicial (vem só com nome e URL)
            const response = await fetch(`${POKEAPI_BASE_URL}?limit=20&offset=0`);
            const data = await response.json();

            // 2. Precisa buscar os detalhes de CADA um para pegar a imagem
            // Usamos Promise.all para fazer várias buscas em paralelo
            const pokemonPromises = data.results.map(pokemon => 
                fetch(pokemon.url).then(res => res.json())
            );

            // 3. Espera todas as buscas terminarem
            const allPokemonData = await Promise.all(pokemonPromises);

            // 4. Cria e exibe os cards
            allPokemonData.forEach(pokemonData => {
                const card = createPokemonCard(pokemonData);
                gallery.appendChild(card);
            });

        } catch (error) {
            console.error('Erro ao buscar Pokémon:', error);
            gallery.innerHTML = '<p>Não foi possível carregar os Pokémon.</p>';
        } finally {
            toggleLoading(false); // Esconde o "Carregando..."
        }
    }

    // Função para buscar um Pokémon específico (pela barra de busca)
    async function searchPokemon() {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) {
            // Se a busca for vazia, recarrega a lista inicial
            fetchInitialPokemon();
            return;
        }

        toggleLoading(true);
        gallery.innerHTML = ''; // Limpa a galeria

        try {
            const response = await fetch(`${POKEAPI_BASE_URL}/${query}`);
            if (!response.ok) {
                throw new Error('Pokémon não encontrado!');
            }
            const pokemonData = await response.json();

            // Exibe o único Pokémon encontrado
            const card = createPokemonCard(pokemonData);
            gallery.appendChild(card);

        } catch (error) {
            console.error('Erro na busca:', error);
            gallery.innerHTML = '<p>Pokémon não encontrado. Tente novamente.</p>';
        } finally {
            toggleLoading(false);
        }
    }

    // Adiciona os "escutadores" de eventos
    searchButton.addEventListener('click', searchPokemon);
    // Permite buscar apertando "Enter"
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            searchPokemon();
        }
    });

    // --- Início ---
    // Carrega a lista inicial assim que a página abre
    fetchInitialPokemon();
});