import './css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import debounce from 'lodash.debounce';
import { fetchCountries } from './js/fetchCountries';

const DEBOUNCE_DELAY = 300;
let coumtryList
const countriesList = document.querySelector('.country-list');
const countryInfo = document.querySelector('.country-info');
const searchBox = document.querySelector('#search-box');


countriesList.style.display = 'none';
countryInfo.style.display = 'none';

// Записуємо дані введені корсистувачем у змінну value з затримкою в 0,3 сек, при очищені вікна пошуку
// скриваємо інформацію з попереднього запросу

searchBox.addEventListener('input', debounce(onInputSearch, DEBOUNCE_DELAY));
function onInputSearch(e) {
  const value = searchBox.value.trim();
  if (!value) {
    addHidden();
    clearInterfaceUI();
    return;
  }

  function clearInterfaceUI() {
  countriesList.innerHTML = '';
  countryInfo.innerHTML = '';
}

function addHidden() {
  countriesList.style.display = 'none';
  countryInfo.style.display = 'none';
}

  // використовуємо дані які вносить користувач для створення запросу на API сервер у разі якщо отриманий массив більше 10
  // обєктів виводимо повідомлення з проханням уточнити запрос, якщо отримуємо пустий масив виводимо повідомленні щодо хибного пошуку

  fetchCountries(value)
    .then(data => {
      coumtryList = data
      if (data.length > 10) {
        Notify.info(
          'Too many matches found. Please enter a more specific name.'
        );
      }
      renderCountries(data);
    })
    .catch(err => {
      clearInterfaceUI();
      Notify.failure('Oops, there is no country with that name');
    });
}

// Якщо в результаті запросу отриман лише 1 один обєкт виводимо інформацію щощдо країни, якщо декілько створюємо перелік
// зі скороченою інформацією(прапор, назва) у виді кнопок доступних для натискання для уточнення запросу

function renderCountries(result) {
  if (result.length === 1) {
    countriesList.innerHTML = '';
    countriesList.style.display = 'none';
    countryInfo.style.display = 'block';
    countryInfo.innerHTML = generateMarkupCountryInfo(result);
  }
  if (result.length >= 2 && result.length <= 10) {
    countryInfo.innerHTML = '';
    countryInfo.style.display = 'none';
    countriesList.style.display = 'block';
    countriesList.innerHTML = generateMarkupCountryList(result);
    countryButton()
  }
}

const generateMarkupCountryInfo = data => {
  let count = 0;
  return data.reduce(
    (same, { flags: { svg }, name, capital, population, languages }) => {
      count++;
      languages = Object.values(languages).join(', ');
      return (
        same +
        `<div class="country-card" style="display: ${
          count === 1 ? "block" : "none"
        };">
          <img src="${svg}" alt="${name}" width="320" height="auto">
          <p>${name.official}</p>
          <p>Capital: <span>${capital}</span></p>
          <p>Population: <span>${population}</span></p>
          <p>Languages: <span>${languages}</span></p>
        </div>`
      );
    },
    ""
  );
};

const generateMarkupCountryList = data =>
  data.reduce((same, { name: { official, common }, flags: { svg } }) => {
    console.log(same)
    return (
      same +
      `<li>
      <button class="country-button">
        <img class="countrys-flag" src="${svg}" alt="${common}" width="70">
        <span>${official}</span>
        </button>
      </li>`
    );
  }, '');


function countryButton() {
  const countryButtons = document.querySelectorAll('.country-button');
  countryButtons.forEach((countryButton, index) => {
    countryButton.addEventListener('click', () => {
      const buttonText = countryButton.textContent.trim();
      searchBox.value = buttonText;
      const countryData = coumtryList[index];
      const countryInfoMarkup = generateMarkupCountryInfo([countryData]);
      countryInfo.innerHTML = countryInfoMarkup;
      countriesList.style.display = 'none';
      countryInfo.style.display = 'block';
    });
  });
}