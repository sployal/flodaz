// photos.js (or inside script.js)

// Demo photo list (replace with your real recipe images)
const recipePhotos = [
  { title: "Pancakes", img: "images/pancakes.jpg", desc: "Fluffy breakfast pancakes" },
  { title: "Salad", img: "images/salad.jpg", desc: "Fresh garden salad" },
  { title: "Spaghetti", img: "images/spaghetti.jpg", desc: "Classic Italian pasta" },
  { title: "Smoothie", img: "images/smoothie.jpg", desc: "Fruit blend smoothie" },
  { title: "Soup", img: "images/soup.jpg", desc: "Homemade vegetable soup" },
  { title: "Burger", img: "images/burger.jpg", desc: "Juicy beef burger" },
  { title: "Pizza", img: "images/pizza.jpg", desc: "Cheesy pepperoni pizza" },
  { title: "Rice Bowl", img: "images/rice.jpg", desc: "Healthy rice bowl" },
  { title: "Samosa", img: "images/samosa.jpg", desc: "Crispy samosas" },
  { title: "Cake", img: "images/cake.jpg", desc: "Chocolate cake" },
  { title: "Omelette", img: "images/omelette.jpg", desc: "Cheese omelette" },
  { title: "Grilled Fish", img: "images/fish.jpg", desc: "Grilled tilapia with lemon" },
  { title: "Curry", img: "images/curry.jpg", desc: "Spicy chicken curry" },
  { title: "Sandwich", img: "images/sandwich.jpg", desc: "Club sandwich" },
  { title: "Steak", img: "images/steak.jpg", desc: "Medium rare steak" },
  { title: "Fries", img: "images/fries.jpg", desc: "Crispy fries" },
  { title: "Ice Cream", img: "images/icecream.jpg", desc: "Vanilla ice cream" },
  { title: "Dumplings", img: "images/dumplings.jpg", desc: "Steamed dumplings" },
  { title: "Tacos", img: "images/tacos.jpg", desc: "Mexican tacos" },
  { title: "Kebabs", img: "images/kebabs.jpg", desc: "Grilled kebabs" }
];

// Shuffle function
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function loadGallery() {
  const gallery = document.getElementById("homeGallery");
  gallery.innerHTML = ""; // clear old content

  // Shuffle and take 8 random photos each load
  const picks = shuffle([...recipePhotos]).slice(0, 8);

  picks.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${item.img}" alt="${item.title}">
      <h3>${item.title}</h3>
      <p>${item.desc}</p>
    `;

    gallery.appendChild(card);
  });
}

// Load first time
document.addEventListener("DOMContentLoaded", loadGallery);

// Reload on "Load more"
document.getElementById("loadMoreBtn").addEventListener("click", loadGallery);
