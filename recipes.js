const recipes = [
  { title: "Pancakes", category: "breakfast", author: "Alice", img: "images/pancakes.jpg", desc: "Fluffy morning pancakes with syrup." },
  { title: "Omelette", category: "breakfast", author: "John", img: "images/omelette.jpg", desc: "Cheesy veggie omelette." },
  { title: "Grilled Chicken", category: "maincourse", author: "Mary", img: "images/chicken.jpg", desc: "Juicy chicken with spices." },
  { title: "Beef Stew", category: "maincourse", author: "David", img: "images/beefstew.jpg", desc: "Slow-cooked beef with veggies." },
  { title: "Caesar Salad", category: "salads", author: "Emma", img: "images/caesar.jpg", desc: "Crispy lettuce with parmesan." },
  { title: "Fruit Salad", category: "salads", author: "Tom", img: "images/fruitsalad.jpg", desc: "Fresh seasonal fruits." },
  { title: "French Fries", category: "snacks", author: "Sam", img: "images/fries.jpg", desc: "Crispy golden fries." },
  { title: "Spring Rolls", category: "snacks", author: "Lina", img: "images/springrolls.jpg", desc: "Veggie stuffed rolls." },
  // ... add until you reach ~20 recipes
];

// shuffle recipes
function getRandomRecipes(count) {
  let shuffled = [...recipes].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function displayRecipes(recipeList) {
  const grid = document.getElementById("recipeGrid");
  grid.innerHTML = "";
  recipeList.forEach(r => {
    const card = document.createElement("div");
    card.className = "recipe-card";
    card.innerHTML = `
      <img src="${r.img}" alt="${r.title}">
      <div class="recipe-content">
        <h3>${r.title}</h3>
        <p><i>by ${r.author}</i></p>
        <p>${r.desc}</p>
        <div class="rating">⭐⭐⭐⭐☆</div>
        <a href="#" class="btn">View Recipe</a>
      </div>
    `;
    grid.appendChild(card);
  });
}

// filtering
function filterRecipes(category) {
  if (category === "all") {
    displayRecipes(getRandomRecipes(12));
  } else {
    let filtered = recipes.filter(r => r.category === category);
    displayRecipes(filtered);
  }
}

// initial load
displayRecipes(getRandomRecipes(12));
