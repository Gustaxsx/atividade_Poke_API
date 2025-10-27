document.addEventListener('DOMContentLoaded', () => {

    const gallery = document.getElementById('pokemonGallery');
    const loading = document.getElementById('loading');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2/pokemon';

    function toggleLoading(show) {
        loading.style.display = show ? 'block' : 'none';
    }

    function createPokemonCard(pokemon) {
        const card = document.createElement('div');
        card.classList.add('pokemon-card');

        const link = document.createElement('a');
        link.href = `detalhes.html?name=${pokemon.name}`;

        const img = document.createElement('img');
        
        if (pokemon.sprites && pokemon.sprites.front_default) {
            img.src = pokemon.sprites.front_default;
        } else {
            img.src = 'https://via.placeholder.com/100x100.png?text=Sem+Imagem';
            console.warn(`Pokémon ${pokemon.name} não possui imagem 'front_default'.`);
        }
        
        img.alt = `Imagem do ${pokemon.name}`;

        const name = document.createElement('p');
        name.textContent = pokemon.name;

        link.appendChild(img);
        link.appendChild(name);
        card.appendChild(link);

        return card;
    }

    async function fetchInitialPokemon() {
        toggleLoading(true);
        gallery.innerHTML = '';

        // -----------------------------------------------------
        // EDITE ESTA LISTA COM OS NOMES!
        // -----------------------------------------------------
        const initialPokemonNames = [
            'pikachu',
            'charizard',
            'blastoise',
            'venusaur',
            'gengar',
            'arcanine',
            'eevee',
            'snorlax',
            'mewtwo',
            'dragonite',
            'articuno',
            'zapdos'
        ];
        // -----------------------------------------------------

        try {
            const pokemonPromises = initialPokemonNames.map(name =>
                fetch(`${POKEAPI_BASE_URL}/${name}`)
                    .then(res => {
                        if (!res.ok) {
                            console.warn(`Pokémon "${name}" não encontrado. Pulando.`);
                            return null;
                        }
                        return res.json();
                    })
            );

            const allPokemonData = await Promise.all(pokemonPromises);
            const validPokemonData = allPokemonData.filter(pokemon => pokemon !== null);

            validPokemonData.forEach(pokemonData => {
                const card = createPokemonCard(pokemonData);
                gallery.appendChild(card);
            });

        } catch (error) {
            console.error('Erro ao buscar Pokémon iniciais:', error);
            gallery.innerHTML = '<p>Não foi possível carregar os Pokémon.</p>';
        } finally {
            toggleLoading(false);
        }
    }

    async function searchPokemon() {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) {
            fetchInitialPokemon();
            return;
        }

        toggleLoading(true);
        gallery.innerHTML = '';

        try {
            const response = await fetch(`${POKEAPI_BASE_URL}/${query}`);
            if (!response.ok) {
                throw new Error('Pokémon não encontrado!');
            }
            const pokemonData = await response.json();

            const card = createPokemonCard(pokemonData);
            gallery.appendChild(card);

        } catch (error) {
            console.error('Erro na busca:', error);
            gallery.innerHTML = '<p>Pokémon não encontrado. Tente novamente.</p>';
        } finally {
            toggleLoading(false);
        }
    }

    searchButton.addEventListener('click', searchPokemon);
    
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            searchPokemon();
        }
    });

    fetchInitialPokemon();
});
