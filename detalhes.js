document.addEventListener('DOMContentLoaded', () => {

    const detailsPage = document.getElementById('pokemonDetailsPage');
    const mainInfoContainer = document.getElementById('pokemonMainInfo');
    const statsContainer = document.getElementById('pokemonStats');
    const evolutionContainer = document.getElementById('evolutionContainer');
    const loading = document.getElementById('loading');

    const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

    function toggleLoading(show) {
        loading.style.display = show ? 'block' : 'none';
        detailsPage.style.display = show ? 'none' : 'block';
    }

    function getPokemonNameFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('name');
    }

    async function fetchPokemonDetails(name) {
        toggleLoading(true);

        if (!name) {
            detailsPage.innerHTML = '<p>Nenhum Pokémon selecionado.</p>';
            toggleLoading(false);
            return;
        }

        try {
            const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${name}`);
            if (!response.ok) {
                throw new Error('Não foi possível encontrar os detalhes deste Pokémon.');
            }
            const pokemon = await response.json();

            const speciesResponse = await fetch(pokemon.species.url);
            const species = await speciesResponse.json();

            displayPokemonDetails(pokemon);

            if (species.evolution_chain) {
                await fetchAndDisplayEvolution(species.evolution_chain.url);
            }

        } catch (error) {
            console.error('Erro ao buscar detalhes:', error);
            detailsPage.innerHTML = `<p>${error.message}</p>`;
        } finally {
            toggleLoading(false);
        }
    }

    function displayPokemonDetails(pokemon) {
        mainInfoContainer.innerHTML = `
            <h1>${pokemon.name}</h1>
            <img src="${pokemon.sprites.front_default || 'https://via.placeholder.com/200x200.png?text=Sem+Imagem'}" 
                 alt="Imagem do ${pokemon.name}" 
                 class="pokemon-detail-image">
            
            <div class="details-info-flex">
                <div class="info-block">
                    <h2>Tipos</h2>
                    <ul class="type-list">
                        ${pokemon.types.map(typeInfo => 
                            `<li class="type-badge type-${typeInfo.type.name}">${typeInfo.type.name}</li>`
                        ).join('')}
                    </ul>
                </div>
                <div class="info-block">
                    <h2>Informações Físicas</h2>
                    <p><strong>Altura:</strong> ${pokemon.height / 10} m</p>
                    <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
                </div>
            </div>
        `;

        statsContainer.innerHTML = `
            <h2>Estatísticas</h2>
            <ul class="stats-list">
                ${pokemon.stats.map(statInfo => `
                    <li>
                        <strong>${statInfo.stat.name.replace('-', ' ')}:</strong>
                        <div class="stat-bar-container">
                            <div class="stat-bar" style="width: ${statInfo.base_stat}px; max-width: 100%;">
                                ${statInfo.base_stat}
                            </div>
                        </div>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    async function fetchAndDisplayEvolution(evolutionChainUrl) {
        try {
            const response = await fetch(evolutionChainUrl);
            const chainData = await response.json();

            const evolutionNames = parseEvolutionChain(chainData.chain);

            const pokemonPromises = evolutionNames.map(name => 
                fetch(`${POKEAPI_BASE_URL}/pokemon/${name}`)
                .then(res => res.json())
            );
            
            const evolutionPokemonData = await Promise.all(pokemonPromises);

            evolutionContainer.innerHTML = '';
            evolutionPokemonData.forEach(pokemon => {
                const card = createEvolutionCard(pokemon);
                evolutionContainer.appendChild(card);
            });

        } catch (error) {
            console.error("Erro ao processar cadeia de evolução:", error);
            evolutionContainer.innerHTML = "<p>Não foi possível carregar as evoluções.</p>";
        }
    }

    function parseEvolutionChain(chain) {
        let names = [];
        let currentStage = chain;

        while (currentStage) {
            names.push(currentStage.species.name);
            currentStage = currentStage.evolves_to[0]; 
        }
        return names;
    }

    function createEvolutionCard(pokemon) {
        const card = document.createElement('div');
        card.classList.add('pokemon-card', 'evolution-card');

       
        const link = document.createElement('a');
        link.href = `detalhes.html?name=${pokemon.name}`; 

     
        const img = document.createElement('img');
        img.src = pokemon.sprites.front_default || 'https://via.placeholder.com/100x100.png?text=Sem+Imagem';
        img.alt = `Imagem do ${pokemon.name}`;

        
        const name = document.createElement('p');
        name.textContent = pokemon.name;

       
        link.appendChild(img);
        link.appendChild(name);
        card.appendChild(link); 
        return card;
    }
 
    const pokemonName = getPokemonNameFromUrl();
    fetchPokemonDetails(pokemonName);
});