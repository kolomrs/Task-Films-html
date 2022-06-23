import { filmsMock } from "./filmsMock.js";

const ALL_FILMS = 'all_films';
const FAVOURITE_FILMS = 'favourite_films';

// Инициализация localStorage;

if (!fromStorage(ALL_FILMS) && !fromStorage(FAVOURITE_FILMS)) {
  toStorage(ALL_FILMS, filmsMock);
  toStorage(FAVOURITE_FILMS, []);
}

// Рисуем список фильмов
const storagedFilms = fromStorage(ALL_FILMS);
renderFilmsList(storagedFilms, ALL_FILMS);

// Логика переключения разделов  Все фильмы/избранные фильмы
const favouriteFilmsBtn = document.querySelector('.film-cards-container__favourite-films')

favouriteFilmsBtn.addEventListener('click', () => handleFilmsListSwitch(favouriteFilmsBtn))

// =======================

function toStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function fromStorage(key) {
  return JSON.parse(localStorage.getItem(key))
}

// Функция рендера списка фильмов

function renderFilmsList(filmsList, listType) {
  const favouriteFilmsBtnHTML = document.querySelector('.film-cards-container__favourite-films');
  //за одну функцию описать всю верстку
  favouriteFilmsBtnHTML.insertAdjacentHTML('afterend', `
  <div id="${listType}" class="film-cards-container"></div>
  `);

  const filmsContainer = document.querySelector('.film-cards-container');

  // Рисуем список фильмов
  if (filmsList.length) {
  filmsList.forEach((film) => renderFilmCard(film, filmsContainer));
  } else {
    filmsContainer.innerHTML = `<div> Список пуст </div>`
  }
  // Слушатели кликов по кнопке добавления в избранное

  const likeBtns = document.querySelectorAll('.film-card__button')

  likeBtns.forEach((btn, i) => btn.addEventListener('click', () => 
    handleLikeBtnClick(filmsList, listType, i)
  )); 

  // Слушатели открытия и закрытия модального окна
  const filmsTitles = document.querySelectorAll('.film-card__title')
  filmsTitles.forEach((title, i) => title.addEventListener('click', () => {
    const clickedFilm = filmsList[i]
    renderFilmModal(clickedFilm, filmsContainer)

    const closeModalBtn = document.querySelector('.close-modal');
    closeModalBtn.addEventListener('click', () => {
      const modal = document.querySelector('.modal');
      modal.remove();
    },
    {once: true} // Лисенер чтобы с модалкой ушел, один раз кликаем и он исчезает.
    )
  })
  )

}




// Функция отрисовки карточки фильма

function renderFilmCard(film, targetContainer) {
  const { imgUrl, movieName, releaseYear, isFavourite } = film;
  const btnImg = isFavourite ? 'favourite.png' : 'notFavourite.png' // Если isFavourite try тогда ... если нет : тогда ...
  
  targetContainer.insertAdjacentHTML('beforeend', `
  <div class="film-card">
    <img class="film-card__poster" src="${imgUrl}">
    <div class="film-card__title">${movieName}</div>
    <div class="film-card__year">${releaseYear}</div>
    <button class="film-card__button">
      <img class="film-card__button-img" src="./assets/img/${btnImg}">
    </button>
  </div>
  `)
}

function renderFilmModal(clickedFilm, targetContainer) {
  const { imgUrl, movieName, releaseYear, isFavourite, description } = clickedFilm;
  const btnImg = isFavourite ? 'favourite.png' : 'notFavourite.png' // Если isFavourite try тогда ... если нет : тогда ...

  targetContainer.insertAdjacentHTML('afterend', `
  <div class="modal">
    <div class="modal-content">
      <div class="close-modal">
        <img class="close-modal-icon" src="./assets/img/cross.png">
      </div>
      <img class="film-card__poster" src="${imgUrl}">
      <div class="film-card__title">${movieName}</div>
      <div class="film-card__year">${releaseYear}</div>
      <div class="film-description">${description}</div>
      <button class="film-card__button">
        <img class="film-card__button-img" src="./assets/img/${btnImg}">
      </button>
      
    </div>
  </div>
  ` )
}

// Функция-обработчик для кнопки добавления в избранное
function handleLikeBtnClick(filmsList, listType, i) {
  filmsList[i].isFavourite = !filmsList[i].isFavourite;

  const sortedFilmsList = sortByIsFavourite(filmsList)
  const sortedFavouriteFilmsList = sortFavouriteFilms(sortedFilmsList)

  const filmsListContainer = document.getElementById(listType);

  switch (listType) {
    case ALL_FILMS:
      toStorage(ALL_FILMS, sortedFilmsList) // Добавляем в localStorage чтобы запоминал isFavourite при обновлении страницы
      toStorage(FAVOURITE_FILMS, sortedFavouriteFilmsList);
      filmsListContainer.remove();
      renderFilmsList(sortedFilmsList, listType);
      return;

    case FAVOURITE_FILMS:
      const newAllFilmsList = fromStorage(ALL_FILMS);
      newAllFilmsList[i].isFavourite = !newAllFilmsList[i].isFavourite;

      toStorage(ALL_FILMS, sortByIsFavourite(newAllFilmsList));
      toStorage(FAVOURITE_FILMS, sortedFavouriteFilmsList);
      filmsListContainer.remove();
      renderFilmsList(sortedFavouriteFilmsList, listType);
      return;
    default:
      return;
  }
  
}

// Функция сортировки
function sortByIsFavourite(films) {
  return films.sort((a, b) => a.id-b.id).sort((a) => (a.isFavourite ? -1 : 1))
}

function sortFavouriteFilms(films) {
  return films.filter((film) => film.isFavourite).sort((a, b) => b.id-a.id)
}

// Свичер списков 

function handleFilmsListSwitch(switcherBtn) {
  const filmsContainer = document.querySelector('.film-cards-container')
  
  const filmsCardContainerTitle = document.querySelector('.film-cards-container__title')

  switch (filmsContainer.id) {
    case ALL_FILMS:
      filmsContainer.remove();
      filmsCardContainerTitle.innerHTML = 'Favourite Films';
      switcherBtn.innerHTML = 'See All Films';
      renderFilmsList(fromStorage(FAVOURITE_FILMS), FAVOURITE_FILMS)
      return;
    case FAVOURITE_FILMS:
      filmsContainer.remove();
      filmsCardContainerTitle.innerHTML = 'All Films';
      switcherBtn.innerHTML = 'See Favourite Films';
      renderFilmsList(fromStorage(ALL_FILMS), ALL_FILMS)
      return;
    default:
      return;
  }
}