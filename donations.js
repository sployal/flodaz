// Sample events (later these can come from backend/MySQL)
const events = [
  {
    id: 1,
    title: "Visit to Children's Home",
    description: "We are visiting a local children's home to donate food and clothes.",
    goal: 1000,
    raised: 650
  },
  {
    id: 2,
    title: "Feeding Program - Zero Hunger SDG",
    description: "A community event to provide meals for families in need.",
    goal: 2000,
    raised: 1200
  },
  {
    id: 3,
    title: "School Lunch Project",
    description: "Help us sponsor healthy meals for school kids.",
    goal: 1500,
    raised: 900
  }
];

// Store donation history (frontend only for now)
let donationHistory = [];

function displayEvents() {
  const eventsDiv = document.getElementById("events");
  eventsDiv.innerHTML = "";

  events.forEach(ev => {
    const progress = Math.round((ev.raised / ev.goal) * 100);

    const eventCard = document.createElement("div");
    eventCard.classList.add("event");
    eventCard.innerHTML = `
      <h3>${ev.title}</h3>
      <p>${ev.description}</p>
      <p><b>Raised:</b> $${ev.raised} / $${ev.goal} (${progress}%)</p>
      <input type="number" id="donation-${ev.id}" placeholder="Enter amount (USD)">
      <button class="btn" onclick="donate(${ev.id})">Donate</button>
    `;
    eventsDiv.appendChild(eventCard);
  });
}

function donate(eventId) {
  const input = document.getElementById(`donation-${eventId}`);
  const amount = parseFloat(input.value);

  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid donation amount.");
    return;
  }

  const ev = events.find(e => e.id === eventId);
  ev.raised += amount;

  // Add to history
  donationHistory.push({
    event: ev.title,
    amount: amount,
    date: new Date().toLocaleString()
  });

  alert(`🎉 Thank you for donating $${amount} to "${ev.title}"!`);
  displayEvents();
  displayHistory();
}

function displayHistory() {
  const historyDiv = document.getElementById("donationHistory");
  historyDiv.innerHTML = "";

  if (donationHistory.length === 0) {
    historyDiv.innerHTML = "<li>No donations yet.</li>";
    return;
  }

  donationHistory.forEach(d => {
    const li = document.createElement("li");
    li.textContent = `${d.date} — Donated $${d.amount} to "${d.event}"`;
    historyDiv.appendChild(li);
  });
}

// Initialize
displayEvents();
displayHistory();
