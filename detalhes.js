
document.addEventListener('DOMContentLoaded', () => {

    const detailsContainer = document.getElementById('pokemonDetailsContainer');
    const loading = document.getElementById('loading');

    // Função para mostrar/ocultar o indicador "Carregando..."
    function toggleLoading(show) {
        loading.style.display = show ? 'block' : 'none';
        detailsContainer.style.display = show ? 'none' : 'block';
    }

    // Função para pegar o nome do Pokémon da URL
    function getPokemonNameFromUrl() {
        
        const params = new URLSearchParams(window.location.search);
        return params.get('name'); // Retorna "pikachu"
    }

    // Função para buscar os detalhes do Pokémon
    async function fetchPokemonDetails(name) {
        toggleLoading(true);

        if (!name) {
            detailsContainer.innerHTML = '<p>Nenhum Pokémon selecionado.</p>';
            toggleLoading(false);
            return;
        }

        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
            if (!response.ok) {
                throw new Error('Não foi possível encontrar os detalhes deste Pokémon.');
            }
            const pokemon = await response.json();

            // Se encontrou, exibe os detalhes
            displayPokemonDetails(pokemon);

        } catch (error) {
            console.error('Erro ao buscar detalhes:', error);
            detailsContainer.innerHTML = `<p>${error.message}</p>`;
        } finally {
            toggleLoading(false);
        }
    }

    // Função para "imprimir" os detalhes na tela
    function displayPokemonDetails(pokemon) {
        // Limpa o container
        detailsContainer.innerHTML = '';

        // HTML com os dados do Pokémon
        detailsContainer.innerHTML = `
            <h1>${pokemon.name}</h1>
            <img src="${pokemon.sprites.front_default}" alt="Imagem do ${pokemon.name}">
            
            <div class="details-info">
                <h2>Tipos</h2>
                <ul>
                    ${pokemon.types.map(typeInfo => `<li>${typeInfo.type.name}</li>`).join('')}
                </ul>

                <h2>Estatísticas</h2>
                <ul>
                    ${pokemon.stats.map(statInfo => `
                        <li>
                            <strong>${statInfo.stat.name}:</strong> ${statInfo.base_stat}
                        </li>
                    `).join('')}
                </ul>

                <h2>Informações Físicas</h2>
                <p><strong>Altura:</strong> ${pokemon.height / 10} m</p>
                <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
            </div>
        `;
    }

   
    // 1. Pega o nome da URL
    const pokemonName = getPokemonNameFromUrl();
    // 2. Busca os detalhes desse Pokémon
    fetchPokemonDetails(pokemonName);
});