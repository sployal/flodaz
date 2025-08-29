document.getElementById("aiForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const ingredients = document.getElementById("ingredients").value;
  const response = await fetch("http://127.0.0.1:5000/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingredients })
  });

  const data = await response.json();
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  data.recipes.forEach(recipe => {
    const card = document.createElement("div");
    card.className = "recipe-card";
    card.innerHTML = `
      <h3>${recipe.title}</h3>
      <p>${recipe.description}</p>
      <p><b>Steps:</b> ${recipe.steps}</p>
    `;
    resultsDiv.appendChild(card);
  });
});
document.getElementById("aiForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const ingredients = document.getElementById("ingredients").value;
  const userId = localStorage.getItem("user_id"); // assume login stored user_id

  const response = await fetch("http://127.0.0.1:5000/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingredients, user_id: userId })
  });

  const data = await response.json();
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (response.status === 403) {
    resultsDiv.innerHTML = `
      <p>${data.error}</p>
      <button onclick="window.location.href='upgrade.html'">Upgrade to Premium</button>
    `;
    return;
  }

  data.recipes.forEach(recipe => {
    const card = document.createElement("div");
    card.className = "recipe-card";
    card.innerHTML = `
      <h3>${recipe.title}</h3>
      <p>${recipe.description}</p>
      <p><b>Steps:</b> ${recipe.steps}</p>
    `;
    resultsDiv.appendChild(card);
  });
});
