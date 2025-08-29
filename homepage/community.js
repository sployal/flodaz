let posts = [
  { id: 1, author: "Alice", content: "Just made pancakes today! 🥞", img: "images/pancakes.jpg", likes: 2, comments: ["Looks tasty!", "Yummy!"] },
  { id: 2, author: "John", content: "Trying out a new salad recipe 🥗", img: "images/salad.jpg", likes: 1, comments: [] }
];

function displayPosts() {
  const feed = document.getElementById("postsFeed");
  feed.innerHTML = "";

  posts.forEach(post => {
    const div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `
      <p><strong>${post.author}</strong></p>
      <p>${post.content}</p>
      ${post.img ? `<img src="${post.img}" alt="Post image">` : ""}
      <div class="actions">
        <button onclick="likePost(${post.id})">👍 ${post.likes}</button>
      </div>
      <div class="comment-section">
        <div><strong>Comments:</strong></div>
        <ul>
          ${post.comments.map(c => `<li>${c}</li>`).join("")}
        </ul>
        <input type="text" id="comment-${post.id}" placeholder="Add a comment...">
        <button onclick="addComment(${post.id})">Reply</button>
      </div>
    `;
    feed.appendChild(div);
  });
}

function createPost() {
  const content = document.getElementById("postContent").value;
  const fileInput = document.getElementById("postImage");
  let imgPath = "";

  if (fileInput.files.length > 0) {
    imgPath = URL.createObjectURL(fileInput.files[0]);
  }

  if (content.trim() === "" && !imgPath) {
    alert("Please write something or upload an image.");
    return;
  }

  const newPost = {
    id: posts.length + 1,
    author: "Demo User", // later replace with logged-in user
    content: content,
    img: imgPath,
    likes: 0,
    comments: []
  };

  posts.unshift(newPost);
  document.getElementById("postContent").value = "";
  fileInput.value = "";
  displayPosts();
}

function likePost(id) {
  let post = posts.find(p => p.id === id);
  post.likes++;
  displayPosts();
}

function addComment(id) {
  let input = document.getElementById(`comment-${id}`);
  let comment = input.value.trim();
  if (comment !== "") {
    let post = posts.find(p => p.id === id);
    post.comments.push(comment);
    input.value = "";
    displayPosts();
  }
}

// initial load
displayPosts();

// Temporary flag: change this to true/false to simulate premium
let isPremium = false; // change to true for premium access
