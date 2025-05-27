document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("favorites-container");
  const mealDetails = document.getElementById("meal-details");
  const mealDetailsContent = document.querySelector(".meal-details-content");
  const backBtn = document.getElementById("back-btn");

  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.length === 0) {
    container.innerHTML = `<p class="text-center p-4 text-gray-500">You have no saved recipes yet.</p>`;
    return;
  }

  container.innerHTML = "";

  favorites.forEach((meal) => {
    container.innerHTML += `
      <div class="meal cursor-pointer bg-white rounded-lg shadow hover:-translate-y-1 transition overflow-hidden" data-meal-id="${meal.idMeal}">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="w-full h-48 object-cover">
        <div class="p-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">${meal.strMeal}</h3>
          ${meal.strCategory ? `<div class="inline-block bg-orange-100 text-sm text-gray-700 px-3 py-1 rounded-full mb-2">${meal.strCategory}</div>` : ""}
          <button class="unsave-btn bg-yellow-400 hover:bg-yellow-300 text-black px-3 py-1 rounded text-sm font-medium mt-2">
            <i class="fas fa-star mr-1"></i> Unsave
          </button>
        </div>
      </div>
    `;
  });

  document.querySelectorAll(".unsave-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      const mealDiv = e.target.closest(".meal");
      const mealId = mealDiv.dataset.mealId;

      favorites = favorites.filter(meal => meal.idMeal !== mealId);
      localStorage.setItem("favorites", JSON.stringify(favorites));

      mealDiv.remove();

      if (favorites.length === 0) {
        container.innerHTML = `<p class="text-center p-4 text-gray-500">You have no saved recipes yet.</p>`;
      }
    });
  });

  document.querySelectorAll(".meal").forEach(mealDiv => {
    mealDiv.addEventListener("click", async (e) => {
      if (e.target.closest(".unsave-btn")) return;

      const mealId = mealDiv.dataset.mealId;

      try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
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
              <a href="${meal.strYoutube}" target="_blank"
                class="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm font-semibold mt-2">
                <i class="fab fa-youtube mr-2"></i> Watch Video
              </a>` : ""}
          `;

          mealDetails.classList.remove("hidden");
          container.classList.add("hidden");
          mealDetails.scrollIntoView({ behavior: "smooth" });
        }
      } catch (error) {
        alert("Could not load recipe details. Please try again later.");
      }
    });
  });

  backBtn.addEventListener("click", () => {
    mealDetails.classList.add("hidden");
    container.classList.remove("hidden");
  });
}); //end