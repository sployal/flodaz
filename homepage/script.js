/* ==============================
   SmartRecipes — Step 1 (Homepage)
   - Auth (localStorage)
   - AI prompt box with 3-prompt limit for Free
   - Randomized recipe gallery from categories
   - Rating stars (saved locally)
================================*/

// ------- Storage keys
const LS_USER      = "sr_user";
const LS_PROMPTS   = "sr_prompt_count";
const LS_RATINGS   = "sr_ratings";

// ------- Elements (navbar & auth)
const profileBtn       = document.getElementById("profileBtn");
const profileMenu      = document.getElementById("profileMenu");
const avatarCircle     = document.getElementById("avatarCircle");
const avatarCircleMenu = document.getElementById("avatarCircleMenu");
const overlay          = document.getElementById("overlay");

const authModal   = document.getElementById("authModal");
const authCloseBtn= document.getElementById("authCloseBtn");
const authForm    = document.getElementById("authForm");

const pmName      = document.getElementById("pmName");
const pmUsername  = document.getElementById("pmUsername");
const pmEmail     = document.getElementById("pmEmail");
const pmDob       = document.getElementById("pmDob");
const pmAccountType = document.getElementById("pmAccountType");
const pmPrompts   = document.getElementById("pmPrompts");
const pmContact   = document.getElementById("pmContact");
const pmAddress   = document.getElementById("pmAddress");
const pmGender    = document.getElementById("pmGender");

const upgradeBtn  = document.getElementById("upgradeBtn");
const logoutBtn   = document.getElementById("logoutBtn");
const hamburgerBtn= document.getElementById("hamburgerBtn");
const mainNav     = document.getElementById("mainNav");

// ------- Elements (AI box)
const aiInput   = document.getElementById("aiInput");
const aiBtn     = document.getElementById("aiBtn");
const aiOutput  = document.getElementById("aiOutput");

// ------- Elements (gallery)
const homeGallery = document.getElementById("homeGallery");
const loadMoreBtn = document.getElementById("loadMoreBtn");

// ------- Helpers
const getUser = () => { try { return JSON.parse(localStorage.getItem(LS_USER)) || null; } catch { return null; } };
const setUser = (u) => localStorage.setItem(LS_USER, JSON.stringify(u));
const getPromptCount = () => Number(localStorage.getItem(LS_PROMPTS) || 0);
const setPromptCount = (n) => localStorage.setItem(LS_PROMPTS, String(n));
const getRatings = () => { try { return JSON.parse(localStorage.getItem(LS_RATINGS)) || {}; } catch { return {}; } };
const setRatings = (obj) => localStorage.setItem(LS_RATINGS, JSON.stringify(obj));

function initialsFromName(name){
  if(!name) return "?";
  return name.trim().split(/\s+/).slice(0,2).map(p=>p[0]?.toUpperCase()||"").join("") || "?";
}
function closeAllOverlays(){
  profileMenu?.classList.remove("show");
  authModal?.classList.remove("show");
  overlay?.classList.remove("show");
  profileBtn?.setAttribute("aria-expanded","false");
}
function hydrateUI(){
  const u = getUser();
  if(!u){ avatarCircle.textContent = "?"; return; }
  avatarCircle.textContent = initialsFromName(u.fullName);
}

// ------- Navbar interactions
profileBtn?.addEventListener("click", ()=>{
  const u = getUser();
  if(!u){ authModal.classList.add("show"); overlay.classList.add("show"); return; }
  if(profileMenu.classList.contains("show")) closeAllOverlays();
  else {
    fillProfileMenu(u);
    profileMenu.classList.add("show");
    overlay.classList.add("show");
    profileBtn.setAttribute("aria-expanded","true");
  }
});
authCloseBtn?.addEventListener("click", closeAllOverlays);
overlay?.addEventListener("click", closeAllOverlays);
hamburgerBtn?.addEventListener("click", ()=> mainNav.classList.toggle("show"));

// ------- Auth form
authForm?.addEventListener("submit", (e)=>{
  e.preventDefault();
  const fullName = document.getElementById("fullName").value.trim();
  const username = document.getElementById("username").value.trim();
  const email    = document.getElementById("email").value.trim();
  const dob      = document.getElementById("dob").value;

  const contact  = document.getElementById("contact").value.trim();
  const address  = document.getElementById("address").value.trim();
  const gender   = document.getElementById("gender").value;

  if(!fullName || !username || !email || !dob){
    alert("Please fill in all required fields.");
    return;
  }
  const user = { fullName, username, email, dob, contact, address, gender, accountType:"Free", rankStars:0 };
  setUser(user);
  if(localStorage.getItem(LS_PROMPTS) === null) setPromptCount(0);

  closeAllOverlays(); hydrateUI();
  toast(`🎉 Welcome, ${fullName.split(" ")[0]}!`);
});
logoutBtn?.addEventListener("click", ()=>{
  localStorage.removeItem(LS_USER);
  closeAllOverlays(); hydrateUI();
});
upgradeBtn?.addEventListener("click", ()=>{
  const u = getUser();
  if(!u){ authModal.classList.add("show"); overlay.classList.add("show"); return; }
  if(u.accountType === "Premium"){ toast("You’re already Premium. Thank you!"); return; }
  if(confirm("Proceed to upgrade to Premium? (IntaSend checkout later)")){
    u.accountType = "Premium";
    setUser(u);
    fillProfileMenu(u);
    toast("✅ Upgraded to Premium!");
  }
});

function fillProfileMenu(u){
  avatarCircleMenu.textContent = initialsFromName(u.fullName);
  pmName.textContent = u.fullName || "—";
  pmUsername.textContent = u.username ? "@"+u.username : "—";
  pmEmail.textContent = u.email || "—";
  pmDob.textContent = u.dob || "—";
  pmContact.textContent = u.contact || "—";
  pmAddress.textContent = u.address || "—";
  pmGender.textContent = u.gender || "—";

  pmAccountType.textContent = u.accountType || "Free";
  pmAccountType.className = "badge " + ((u.accountType==="Premium") ? "premium" : "free");

  const used = getPromptCount();
  pmPrompts.textContent = (u.accountType==="Premium") ? `${used} / ∞` : `${used} / 3`;
}

// ------- AI box (frontend limit; backend will enforce too)
aiBtn?.addEventListener("click", ()=>{
  const u = getUser();
  if(!u){ authModal.classList.add("show"); overlay.classList.add("show"); return; }

  const text = (aiInput.value || "").trim();
  if(!text){ toast("Please type a few ingredients."); return; }

  const used = getPromptCount();
  if(u.accountType !== "Premium" && used >= 3){
    toast("⚠️ Free limit reached (3/3). Upgrade to continue.");
    return;
  }

  // Simulate a fast AI idea (backend call comes later)
  const ideas = [
    `• Quick ${text} stir-fry with garlic\n• ${text} salad with lemon dressing\n• One-pot ${text} pasta (15 min)`,
    `• ${text} tacos with cabbage slaw\n• Creamy ${text} soup\n• Baked ${text} with herbs`,
    `• ${text} fried rice\n• ${text} omelette wrap\n• ${text} grain bowl with beans`
  ];
  aiOutput.textContent = ideas[Math.floor(Math.random()*ideas.length)];
  aiOutput.classList.add("show");

  // increment local count for Free + Premium (for display)
  setPromptCount(used + 1);
  fillProfileMenu(getUser());
});

// ------- Toast helper
function toast(msg){
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  Object.assign(el.style, {
    position:"fixed", right:"16px", top:"16px", zIndex:70,
    background:"#fff", border:"1px solid #e5e7eb", borderRadius:"12px",
    boxShadow:"0 10px 30px rgba(0,0,0,.08)", padding:"10px 12px"
  });
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 2500);
}

// ===============================
// Recipe catalog (20 items per category, generated)
// ===============================
const authors = ["Amina","John","Lina","Kofi","Sara","Omar","Musa","Grace","Ali","Nadia","Fatima","Peter","Mary","Ahmed","Wanjiru","Bola","Thabo","Ruth","Mariam","Ivy"];

function genCategory(catKey, query, count=20){
  const arr = [];
  for(let i=1;i<=count;i++){
    const id = `${catKey}-${i}`;
    const author = authors[(i-1) % authors.length];
    arr.push({
      id,
      category: catKey,
      title: `${capitalize(catKey)} #${i}`,
      author,
      desc: `Tasty ${catKey} idea with simple pantry staples.`,
      // Unique-ish Unsplash image per card
      img: `https://source.unsplash.com/480x360/?${encodeURIComponent(query)}&sig=${i}`
    });
  }
  return arr;
}
function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

const catalog = {
  breakfast : genCategory("breakfast","breakfast,food"),
  maincourse: genCategory("maincourse","main course,meal,dinner"),
  salads    : genCategory("salads","salad,greens"),
  snacks    : genCategory("snacks","snack,street food")
};

// Flatten all recipes for home selection
const ALL_RECIPES = Object.values(catalog).flat();

// ===============================
// Gallery render (randomized picks)
// ===============================
let displayed = []; // ids already rendered on this page

function randomSample(arr, n){
  const copy = arr.filter(i => !displayed.includes(i.id));
  for(let i=copy.length - 1; i>0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

function renderCards(items){
  const ratings = getRatings();
  const frag = document.createDocumentFragment();

  items.forEach(r => {
    displayed.push(r.id);
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${r.img}" alt="${r.title}">
      <div class="content">
        <h3 class="title">${r.title}</h3>
        <div class="meta">
          <span>${capitalize(r.category)}</span>
          <span class="dot"></span>
          <span>By ${r.author}</span>
        </div>
        <p class="desc">${r.desc}</p>
        <div class="rating" id="rt-${r.id}">
          ${renderStars(ratings[r.id] || 0, r.id)}
        </div>
      </div>
      <div class="actions">
        <button class="btn" onclick="viewRecipe('${r.id}')">Recipe</button>
        <button class="btn" onclick="downloadRecipe('${r.id}')">Download PDF</button>
      </div>
    `;
    frag.appendChild(card);
  });

  homeGallery.appendChild(frag);
}

function renderStars(val, id){
  let html = "";
  for(let i=1;i<=5;i++){
    html += `<span onclick="rateRecipe('${id}', ${i})">${i<=val ? "⭐" : "☆"}</span>`;
  }
  return html;
}

// Public handlers
window.rateRecipe = function(id, stars){
  const ratings = getRatings();
  ratings[id] = stars;
  setRatings(ratings);
  const el = document.getElementById(`rt-${id}`);
  if(el) el.innerHTML = renderStars(stars, id);
  toast(`Rated ${stars}★`);
};

window.viewRecipe = function(id){
  // Later: navigate to details page. For now, keep it simple.
  alert(`Open recipe page for: ${id}`);
};

window.downloadRecipe = function(id){
  const u = getUser();
  if(!u || u.accountType!=="Premium"){
    toast("🔒 Premium required to download. Upgrade in profile.");
    return;
  }
  alert(`Downloading PDF for ${id}... (hook to backend later)`);
};

// Initial home render
function initialHome(){
  // Show 12 randomized cards from all categories
  const picks = randomSample(ALL_RECIPES, 12);
  renderCards(picks);
}
loadMoreBtn?.addEventListener("click", ()=>{
  const more = randomSample(ALL_RECIPES, 8);
  if(more.length === 0){ toast("No more to load."); return; }
  renderCards(more);
});

// ------- Start
hydrateUI();
initialHome();

window.onload = async () => {
  const userId = localStorage.getItem("user_id");
  if (!userId) return;

  const response = await fetch("http://127.0.0.1:5000/me", { credentials: "include" });
  const data = await response.json();

  if (data.user) {
    document.getElementById("userName").innerText = data.user.full_name;
    document.getElementById("userEmail").innerText = data.user.email;
    document.getElementById("accountType").innerText = "Account: " + data.user.account_type;
  }
};

document.getElementById("profileIcon").addEventListener("click", () => {
  const menu = document.getElementById("profileMenu");
  menu.style.display = menu.style.display === "none" ? "block" : "none";
});

