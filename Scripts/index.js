const $$ = (sel) => document.querySelector(sel);

const moviesContent = $$("#container-movies");
const searchedMovie = $$("#inpMovie");
const searchedMovieBtn = $$("#searchMovie");
const searchResult = $$("#searchResult");
const tableValues = $$("#tableValues");
const numberOfNominations = $$("#numberOfNominations");
const nominationsSavedMessage = $$("#nominationsSavedMessage");

let moviesArr = [];
let nominatedMovies = [];

class Movie {
    constructor(title, year, poster) {
        this._title = title;
        this._year = year;
        this._poster = poster;
    }

    getMovieWithYear = () => {
        return `${this._title} (${this._year})`;
    }

    getPosterImage = () => {
        return `<img src="${this._poster}" alt="Poster N/A" class="poster-image" />`;
    }
}


let populateSearchedMovies = async () => {
    await fetch(`http://www.omdbapi.com/?s=${searchedMovie.value}&plot=full&apikey=30140dfc`)
        .then(resp => {
            return resp.json();
        })
        .then(response => {
            if (response.Response === "False") {
                moviesContent.innerHTML = "<h1>No Movies Found</h1>";
            } else if (response.Response === "True") {
                moviesArr.length = 0;
                response.Search.map((movie) => {
                    moviesArr.push(new Movie(movie.Title, movie.Year, movie.Poster))
                })
                moviesContent.innerHTML = "";
                searchResult.innerHTML = `${moviesArr.length} Results For "${searchedMovie.value}"`;
                searchedMovie.value = "";
                let count = 0;
                for (let i in moviesArr) {
                    moviesContent.innerHTML += `<div class="listOfMovies">
                                            ${moviesArr[i].getPosterImage()}
                                            <p class="movieTitleWithYear">${moviesArr[i].getMovieWithYear()}</p>
                                            <button id="movie${count}" class="movieButtons">
                                                Nominate
                                                <p class="movie" hidden>${moviesArr[i]._title}</p>
                                                <p class="year" hidden>${moviesArr[i]._year}</p>
                                                <p class="poster" hidden>${moviesArr[i]._poster}</p>
                                            </button>
                                        </div>`;
                    count++;
                }
                activeNominateMovies();
            } else {
                moviesContent.innerHTML = "<h1>No Movies Found</h1>";
                searchResult.innerHTML = "";
            }
        })
        .catch(err => {
            console.log(`Error Found: ${err}`);
        })
}

searchedMovieBtn.addEventListener('click', populateSearchedMovies);

let activeNominateMovies = () => {
    let movieButtons = document.querySelectorAll('.movieButtons');
    for (let i = 0; i < movieButtons.length; i++) {
        if (nominatedMovies.length >= 5) {
            disableMovieButtons(movieButtons[i]);
        }
    }
    movieButtons.forEach(movie => movie.addEventListener('click', (e) => {
        let movieTitle = movie.querySelector('.movie');
        let year = movie.querySelector('.year');
        let poster = movie.querySelector('.poster');
        let movieId = e.target.id;
        if (nominatedMovies.length !== 5) {
            nominatedMovies.push({"Title": movieTitle.innerHTML, "Year": year.innerHTML, "ID": movieId});
            updateMoviesSelected();
            populateNominatedMovies();
            disableMovieButtons(movie);
            nominationsSavedMessage.style.display = "none";
        }
        if (nominatedMovies.length === 5) {
            nominationsSavedMessage.style.display = "revert";
            nominationsSavedMessage.style.width = "100%";
            nominationsSavedMessage.style.backgroundColor = "greenyellow";
            nominationsSavedMessage.innerHTML = `<h2 style="text-align: center">Nominations Saved!</h2>`;
            for (let i in nominatedMovies) {
                localStorage.setItem(`movie${i}`, `${nominatedMovies[i].Title} (${nominatedMovies[i].Year})`);
            }
        }
    }))
}

let disableMovieButtons = (movie) => {
    movie.disabled = true;
    movie.style.backgroundColor = "darkgreen";
}

let updateMoviesSelected = () => {
    numberOfNominations.innerHTML = nominatedMovies.length + "/5 Movies Selected";
}

let setNominatedList = (arr) => {
    tableValues.innerHTML = "";
    if (arr.length !== 0) {
        for (let i in arr) {
            tableValues.innerHTML += `<tr>
                                        <td class="titles">${arr[i].Title}</td>
                                        <td>${arr[i].Year}</td>
                                        <td>
                                            <a class="deleteButtons">
                                                <img src="./Images/deleteIcon.svg" alt="delete icon" id="deleteIconImg">
                                                <p id="movieId" hidden>${arr[i].ID}</p>
                                            </a>                                            
                                        </td>
                                      </tr>`;
        }

        // https://freeicons.io/filter/popular/all/trash?page=1
    }
    removeMovie();
}


let populateNominatedMovies = () => {
    setNominatedList(nominatedMovies);
}

let removeMovie = () => {
    let deleteButtons = document.querySelectorAll('.deleteButtons');

    deleteButtons.forEach(movie => movie.addEventListener('click', (e) => {
        let movieId = movie.querySelector('#movieId').innerHTML;
        if ($$(`#${movieId}`) !== null) {
            $$(`#${movieId}`).disabled = false;
            $$(`#${movieId}`).style.backgroundColor = "#0fb85c";
        }
        nominatedMovies = nominatedMovies.filter(m => m.ID !== movieId);
        setNominatedList(nominatedMovies);
        nominationsSavedMessage.style.display = "none";
    }))

    updateMoviesSelected();
}

window.addEventListener('load', () => {
    let arr = [];
    for (let [key, value] of Object.entries(localStorage)) {
        arr.push({
            "Title": value.substring(0, value.indexOf(' (')),
            "Year": value.substring(value.indexOf('(')),
            "ID": key
        });
    }
    nominatedMovies = arr;
    populateNominatedMovies();
})