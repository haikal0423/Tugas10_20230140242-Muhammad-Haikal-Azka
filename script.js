// DOM Elements
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const mealsContainer = document.getElementById("meals");
const resultHeading = document.getElementById("result-heading");
const errorContainer = document.getElementById("error-container");
const mealDetails = document.getElementById("meal-details");
const mealDetailsContent = document.querySelector(".meal-details-content");
const backBtn = document.getElementById("back-btn");

const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";
const SEARCH_URL = `${BASE_URL}search.php?s=`;
const LOOKUP_URL = `${BASE_URL}lookup.php?i=`;

// Events
searchBtn.addEventListener("click", searchMeals);
mealsContainer.addEventListener("click", handleMealClick);
backBtn.addEventListener("click", () => mealDetails.classList.add("hidden"));

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchMeals();
});

// Search
async function searchMeals() {
  const searchTerm = searchInput.value.trim();

  if (!searchTerm) {
    errorContainer.textContent = "Please enter a search term";
    errorContainer.classList.remove("hidden");
    return;
  }

  try {
    resultHeading.textContent = `Searching for "${searchTerm}"...`;
    mealsContainer.innerHTML = "";
    errorContainer.classList.add("hidden");

    const response = await fetch(`${SEARCH_URL}${searchTerm}`);
    const data = await response.json();

    if (data.meals === null) {
      resultHeading.textContent = "";
      mealsContainer.innerHTML = "";
      errorContainer.textContent = `No recipes found for "${searchTerm}". Try another search term!`;
      errorContainer.classList.remove("hidden");
    } else {
      resultHeading.textContent = `Search results for "${searchTerm}":`;
      displayMeals(data.meals);
      searchInput.value = "";
    }
  } catch (error) {
    errorContainer.textContent = "Something went wrong. Please try again later.";
    errorContainer.classList.remove("hidden");
  }
}

// Render meal cards
function displayMeals(meals) {
  mealsContainer.innerHTML = "";

  meals.forEach((meal) => {
    mealsContainer.innerHTML += `
      <div class="meal cursor-pointer bg-white rounded-lg shadow hover:-translate-y-1 transition overflow-hidden" data-meal-id="${meal.idMeal}">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="w-full h-48 object-cover">
        <div class="p-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">${meal.strMeal}</h3>
          ${meal.strCategory ? `<div class="inline-block bg-orange-100 text-sm text-gray-700 px-3 py-1 rounded-full mb-2">${meal.strCategory}</div>` : ""}
          <button class="bookmark-btn bg-yellow-400 hover:bg-yellow-300 text-black px-3 py-1 rounded text-sm font-medium mt-2" data-meal='${JSON.stringify(meal)}'>
            <i class="fas fa-star mr-1"></i> Save
          </button>
        </div>
      </div>
    `;
  });

  document.querySelectorAll(".bookmark-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const meal = JSON.parse(this.dataset.meal);
      saveToFavorites(meal);
    });
  });
}

// Show meal details
async function handleMealClick(e) {
  const mealEl = e.target.closest(".meal");
  if (!mealEl) return;

  const mealId = mealEl.getAttribute("data-meal-id");

  try {
    const response = await fetch(`${LOOKUP_URL}${mealId}`);
    const data = await response.json();

    if (data.meals && data.meals[0]) {
      const meal = data.meals[0];

      const ingredients = [];
      for (let i = 1; i <= 20; i++) {
        if (meal[`strIngredient${i}`] && meal[`strIngredient${i}`].trim() !== "") {
          ingredients.push({
            ingredient: meal[`strIngredient${i}`],
            measure: meal[`strMeasure${i}`],
          });
        }
      }

      mealDetailsContent.innerHTML = `
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="w-full max-w-md rounded mb-6">
        <h2 class="text-2xl font-bold text-orange-500 text-center mb-2">${meal.strMeal}</h2>
        <div class="text-center mb-4">
          <span class="inline-block bg-orange-100 text-sm px-4 py-1 rounded-full">${meal.strCategory || "Uncategorized"}</span>
        </div>
        <div class="mb-4 text-gray-700">
          <h3 class="text-lg font-semibold mb-2">Instructions</h3>
          <p>${meal.strInstructions}</p>
        </div>
        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-2 text-gray-700">Ingredients</h3>
          <ul class="grid grid-cols-2 gap-2 text-sm">
            ${ingredients.map(item => `
              <li class="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded">
                <i class="fas fa-check-circle text-green-500"></i> ${item.measure} ${item.ingredient}
              </li>
            `).join("")}
          </ul>
        </div>
        ${meal.strYoutube ? `
          <a href="${meal.strYoutube}" target="_blank" class="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm font-semibold mt-2">
            <i class="fab fa-youtube mr-2"></i> Watch Video
          </a>
        ` : ""}
      `;

      // Favorite toggle
      let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
      const isFavorite = favorites.some(fav => fav.idMeal === meal.idMeal);

      mealDetailsContent.innerHTML += `
        <button id="favorite-btn" class="mt-4 bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded font-semibold text-sm">
          <i class="fas ${isFavorite ? "fa-star" : "fa-star-half-alt"} mr-2"></i> ${isFavorite ? "Unsave" : "Save"}
        </button>
      `;

      const favoriteBtn = document.getElementById("favorite-btn");
      favoriteBtn.addEventListener("click", () => {
        let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        const alreadyFavorite = favorites.some(fav => fav.idMeal === meal.idMeal);

        if (alreadyFavorite) {
          favorites = favorites.filter(fav => fav.idMeal !== meal.idMeal);
          favoriteBtn.innerHTML = `<i class="fas fa-star-half-alt mr-2"></i> Save`;
        } else {
          favorites.push({
            idMeal: meal.idMeal,
            strMeal: meal.strMeal,
            strMealThumb: meal.strMealThumb,
            strCategory: meal.strCategory,
          });
          favoriteBtn.innerHTML = `<i class="fas fa-star mr-2"></i> Unsave`;
        }

        localStorage.setItem("favorites", JSON.stringify(favorites));
      });

      mealDetails.classList.remove("hidden");
      mealDetails.scrollIntoView({ behavior: "smooth" });
    }
  } catch (error) {
    errorContainer.textContent = "Could not load recipe details. Please try again later.";
    errorContainer.classList.remove("hidden");
  }
}

// Save to favorites
function saveToFavorites(meal) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const exists = favorites.some((fav) => fav.idMeal === meal.idMeal);

  if (!exists) {
    favorites.push(meal);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    alert(`"${meal.strMeal}" has been saved to favorites!`);
  } else {
    alert(`"${meal.strMeal}" is already in your favorites.`);
  }
}
