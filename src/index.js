import './css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import debounce from 'lodash.debounce';
import { fetchCountries } from './js/fetchCountries';

const DEBOUNCE_DELAY = 300;

const countriesList = document.querySelector('.country-list');
const countryInfo = document.querySelector('.country-info');
const searchBox = document.querySelector('#search-box');

countriesList.style.display = 'none';
countryInfo.style.display = 'none';

searchBox.addEventListener('input', debounce(onInputSearch, DEBOUNCE_DELAY));


function onInputSearch(e) {
  const value = searchBox.value.trim();
  console.log(value);

  if (!value) {
    addHidden();
    clearInterfaceUI();
    return;
  }

  fetchCountries(value)
    .then(data => {
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

function clearInterfaceUI() {
  countriesList.innerHTML = '';
  countryInfo.innerHTML = '';
}

function addHidden() {
  countriesList.style.display = 'none';
  countryInfo.style.display = 'none';
}


// бажано залишити лише виклик функції якій передати окреме значення

function countryButton() {
  const countryButtons = document.querySelectorAll('.country-button');
  countryButtons.forEach(countryButton => {
    countryButton.addEventListener('click', () => {
      const buttonText = countryButton.textContent.trim();
      searchBox.value = buttonText

      // Зайвий код??
      fetchCountries(buttonText)
        .then(data => {
          countryInfo.style.display = 'block';
          countriesList.style.display = 'none';
          countryInfo.innerHTML = generateMarkupCountryInfo(data);
        });
      // чи можна скоротити??
    });
  })
}