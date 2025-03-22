// Configuration
const API_KEY = "bf9a6b96de96ad21528612141cfa3e69";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

// Sélection des éléments en fonction de votre HTML
const searchInput = document.getElementById("search");
const actorSearchInput = document.getElementById("actorSearch");
const searchButton = document.getElementById("searchButton");
const moviesContainer = document.getElementById("movies");
const loader = document.getElementById("loader");

// Gestion du loader
const toggleLoader = (show) => {
    loader.style.display = show ? "block" : "none";
};

// Recherche de films
async function searchMovies(query) {
    try {
        toggleLoader(true);
        const response = await fetch(
            `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&language=fr-FR`
        );
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error("Erreur lors de la recherche de films:", error);
        return [];
    } finally {
        toggleLoader(false);
    }
}

// Recherche d'acteurs
async function searchActors(query) {
    try {
        toggleLoader(true);
        const response = await fetch(
            `${BASE_URL}/search/person?api_key=${API_KEY}&query=${query}&language=fr-FR`
        );
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error("Erreur lors de la recherche d'acteurs:", error);
        return [];
    } finally {
        toggleLoader(false);
    }
}

// Nouvelle fonction pour obtenir les films d'un acteur
async function getMoviesByActor(actorId) {
    try {
        const response = await fetch(
            `${BASE_URL}/person/${actorId}/movie_credits?api_key=${API_KEY}&language=fr-FR`
        );
        const data = await response.json();
        return data.cast || [];
    } catch (error) {
        console.error("Erreur lors de la recherche des films de l'acteur:", error);
        return [];
    }
}

// Affichage des résultats
function displayResults(results, isActor = false) {
    moviesContainer.innerHTML = "";
    
    if (results.length === 0) {
        moviesContainer.innerHTML = "<p>Aucun résultat trouvé</p>";
        return;
    }

    const container = document.createElement("div");
    container.className = "1st container";
    
    results.forEach(result => {
        const resultDiv = document.createElement("div");
        resultDiv.className = "2nd container";

        if (isActor) {
            const image = result.profile_path 
                ? `${IMAGE_BASE_URL}${result.profile_path}`
                : "placeholder.jpg";
            
            resultDiv.innerHTML = `
                <img src="${image}" alt="${result.name}">
                <h3>${result.name}</h3>
                <p>Popularité: ${result.popularity}</p>
                <p>Connu pour: ${result.known_for_department || 'Non spécifié'}</p>
            `;
        } else {
            const image = result.poster_path 
                ? `${IMAGE_BASE_URL}${result.poster_path}`
                : "placeholder.jpg";
            
            resultDiv.innerHTML = `
                <img src="${image}" alt="${result.title}">
                <h3>${result.title}</h3>
                <p>${result.release_date ? new Date(result.release_date).getFullYear() : 'Date inconnue'}</p>
                <p>${result.overview || 'Pas de description disponible'}</p>
            `;
        }

        container.appendChild(resultDiv);
    });

    moviesContainer.appendChild(container);
}

// Gestion des événements
searchButton.addEventListener("click", async () => {
    const movieQuery = searchInput.value.trim();
    const actorQuery = actorSearchInput.value.trim();

    if (movieQuery) {
        const movies = await searchMovies(movieQuery);
        displayResults(movies, false);
    } else if (actorQuery) {
        const actors = await searchActors(actorQuery);
        if (actors.length > 0) {
            const movies = await getMoviesByActor(actors[0].id);
            displayResults(movies, false);
        } else {
            displayResults([], false);
        }
    } else {
        alert("Veuillez entrer un terme de recherche");
    }
});

// Recherche automatique pendant la frappe
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

const debouncedMovieSearch = debounce(async (query) => {
    if (query.length > 2) {
        const movies = await searchMovies(query);
        displayResults(movies, false);
    }
}, 500);

const debouncedActorSearch = debounce(async (query) => {
    if (query.length > 2) {
        const actors = await searchActors(query);
        if (actors.length > 0) {
            const movies = await getMoviesByActor(actors[0].id);
            displayResults(movies, false);
        } else {
            displayResults([], false);
        }
    }
}, 500);

searchInput.addEventListener("input", (e) => {
    actorSearchInput.value = "";
    debouncedMovieSearch(e.target.value.trim());
});

actorSearchInput.addEventListener("input", (e) => {
    searchInput.value = "";
    debouncedActorSearch(e.target.value.trim());
});