// Community Page JavaScript - Backend Integration with Image Upload

// API Configuration
//const API_BASE_URL = 'http://localhost:5000/api';

//const API_BASE_URL = 'https://replit.com/@muigaidavie6/flodaz/api';

const API_BASE_URL = 'https://api-node-web-nqq1.onrender.com/api';






// Sample post data (keep as fallback)
const postsData = [
    {
        id: 1,
        type: 'recipe',
        author: {
            name: 'Chef Amina',
            username: 'chef_amina',
            avatar: 'CA'
        },
        timestamp: '2 hours ago',
        title: 'Traditional Jollof Rice with a Twist',
        content: 'After years of perfecting this recipe, I\'m finally ready to share my secret technique for the perfect Jollof rice. The key is in the tomato base and timing!',
        recipe: {
            prepTime: '20 minutes',
            cookTime: '45 minutes',
            servings: 6,
            difficulty: 'medium',
            ingredients: [
                '3 cups long-grain rice',
                '500g chicken, cut into pieces',
                '4 large tomatoes, blended',
                '2 red bell peppers',
                '1 large onion, diced',
                '3 cloves garlic, minced',
                '2 tsp curry powder',
                '1 tsp thyme',
                'Salt and pepper to taste',
                '3 cups chicken stock'
            ],
            instructions: [
                'Season and brown the chicken pieces in a large pot',
                'Remove chicken and sautÃ© onions until golden',
                'Add garlic, tomato blend, and spices. Cook for 10 minutes',
                'Add rice and stock, bring to boil',
                'Reduce heat, cover and simmer for 25 minutes',
                'Add chicken back and let rest for 5 minutes'
            ]
        },
        images: ['🍛'],
        tags: ['jollof', 'african-cuisine', 'chicken', 'rice'],
        likes: 124,
        comments: 18,
        shares: 7,
        liked: false,
        bookmarked: false
    }
];

// Sample comments data (keep as fallback)
const commentsData = {
    1: [
        {
            id: 1,
            author: { name: 'Rice Lover', avatar: 'RL' },
            timestamp: '1 hour ago',
            content: 'This looks amazing! What type of rice do you recommend for beginners?'
        }
    ]
};

// Global state
let currentFilter = 'all';
let displayedPosts = 6;
let isLoading = false;
let currentUser = null;
let useBackend = true;
let uploadedImages = []; // Store uploaded image URLs

// DOM Elements
const postsFeed = document.getElementById('postsFeed');
const createPostModal = document.getElementById('createPostModal');
const createPostForm = document.getElementById('createPostForm');
const loadMoreBtn = document.getElementById('loadMorePosts');

// API Functions
async function fetchPostsFromAPI(page = 1, type = 'all', limit = 10) {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });
        
        if (type !== 'all') {
            params.append('type', type);
        }
        
        const response = await fetch(`${API_BASE_URL}/posts?${params}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching posts from API:', error);
        useBackend = false;
        return null;
    }
}

async function uploadImagesAPI(files) {
    try {
        const formData = new FormData();
        
        files.forEach((file, index) => {
            formData.append('images', file);
        });

        const response = await fetch(`${API_BASE_URL}/upload-images`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.imageUrls;
    } catch (error) {
        console.error('Error uploading images:', error);
        return null;
    }
}

async function createPostAPI(postData) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating post via API:', error);
        return null;
    }
}

async function likePostAPI(postId) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error liking post via API:', error);
        return null;
    }
}

async function fetchCommentsFromAPI(postId) {
    try {
        const response = await fetch(`${API_BASE_URL}/comments/${postId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.comments || [];
    } catch (error) {
        console.error('Error fetching comments from API:', error);
        return [];
    }
}

async function createCommentAPI(postId, content) {
    try {
        const response = await fetch(`${API_BASE_URL}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                postId: postId,
                content: content
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating comment via API:', error);
        return null;
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    initializeFeed();
    setupEventListeners();
    setupModalEvents();
});

// Load user profile
function loadUserProfile() {
    const savedUser = JSON.parse(localStorage.getItem('smartrecipes_user') || 'null');
    const aiPromptCount = parseInt(localStorage.getItem('ai_prompt_count') || '0');
    
    currentUser = savedUser || {
        fullName: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        accountType: 'Free'
    };
    
    updateProfileDisplay(currentUser, aiPromptCount);
    updateCreatePostPrompt();
}

function updateProfileDisplay(user, promptCount) {
    const elements = {
        avatarCircle: document.getElementById('avatarCircle'),
        avatarCircleMenu: document.getElementById('avatarCircleMenu'),
        pmName: document.getElementById('pmName'),
        pmUsername: document.getElementById('pmUsername'),
        pmEmail: document.getElementById('pmEmail'),
        pmDob: document.getElementById('pmDob'),
        pmAccountType: document.getElementById('pmAccountType'),
        pmPrompts: document.getElementById('pmPrompts')
    };

    if (elements.avatarCircle) {
        const initials = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
        elements.avatarCircle.textContent = initials;
        elements.avatarCircleMenu.textContent = initials;
        elements.pmName.textContent = user.fullName;
        elements.pmUsername.textContent = `@${user.username}`;
        elements.pmEmail.textContent = user.email;
        elements.pmDob.textContent = user.dob || '—';
        elements.pmAccountType.textContent = user.accountType || 'Free';
        elements.pmAccountType.className = `badge ${user.accountType === 'Premium' ? 'premium' : 'free'}`;
        elements.pmPrompts.textContent = user.accountType === 'Premium' ? '∞' : `${promptCount} / 3`;
    }
}

function updateCreatePostPrompt() {
    const initials = currentUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
    const promptAvatar = document.querySelector('.create-post-prompt .avatar');
    if (promptAvatar) {
        promptAvatar.textContent = initials;
    }
}

// Initialize feed
async function initializeFeed() {
    if (useBackend) {
        const data = await fetchPostsFromAPI(1, currentFilter);
        if (data && data.posts) {
            renderPosts(data.posts);
            return;
        }
    }
    
    renderPosts(postsData.slice(0, displayedPosts));
    updateLoadMoreButton();
}

// Render posts to feed
function renderPosts(posts) {
    if (!postsFeed) return;
    
    const filteredPosts = currentFilter === 'all' ? posts : posts.filter(post => post.type === currentFilter);
    const postsHTML = filteredPosts.map(post => createPostCard(post)).join('');
    
    if (displayedPosts <= 6) {
        postsFeed.innerHTML = postsHTML;
    } else {
        postsFeed.innerHTML += postsHTML;
    }
    
    if (filteredPosts.length === 0) {
        postsFeed.innerHTML = createEmptyState();
    }
}

// Create individual post card
function createPostCard(post) {
    return `
        <article class="post-card" data-id="${post.id}">
            <div class="post-header">
                <div class="post-avatar">${post.author.avatar || post.author.name.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
                <div class="post-user-info">
                    <div class="post-user-name">${post.author.name}</div>
                    <div class="post-meta">
                        <span class="post-type-badge ${post.type}">${post.type}</span>
                        <span>@${post.author.username}</span>
                        <span>•</span>
                        <span>${post.timestamp}</span>
                    </div>
                </div>
                <button class="post-menu-btn" onclick="showPostMenu(${post.id})">⋯</button>
            </div>
            
            <div class="post-content">
                <h3 class="post-title">${post.title}</h3>
                <p class="post-text">${post.content}</p>
                
                ${post.type === 'recipe' ? createRecipeDetails(post.recipe) : ''}
                
                ${post.images && post.images.length > 0 ? createPostImages(post.images) : ''}
                
                ${post.tags && post.tags.length > 0 ? createPostTags(post.tags) : ''}
            </div>
            
            <div class="post-actions">
                <div class="post-actions-left">
                    <button class="action-item ${post.liked ? 'liked' : ''}" onclick="toggleLike(${post.id})">
                        <span>${post.liked ? '❤️' : '🤍'}</span>
                        <span>${post.likes}</span>
                    </button>
                    <button class="action-item" onclick="toggleComments(${post.id})">
                        <span>💬</span>
                        <span>${post.comments}</span>
                    </button>
                    <button class="action-item" onclick="sharePost(${post.id})">
                        <span>📤</span>
                        <span>${post.shares}</span>
                    </button>
                </div>
                <div class="post-actions-right">
                    <button class="action-item ${post.bookmarked ? 'bookmarked' : ''}" onclick="toggleBookmark(${post.id})">
                        <span>${post.bookmarked ? '🔖' : '🔗'}</span>
                    </button>
                </div>
            </div>
            
            <div class="comments-section" id="comments-${post.id}" style="display: none;">
                <div class="comments-toggle" onclick="loadComments(${post.id})">
                    View all ${post.comments} comments
                </div>
                <div class="comments-list" id="comments-list-${post.id}">
                    <!-- Comments will be loaded here -->
                </div>
                <div class="add-comment">
                    <div class="comment-avatar">${currentUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
                    <textarea class="comment-input" placeholder="Add a comment..." onkeypress="handleCommentSubmit(event, ${post.id})"></textarea>
                    <button class="comment-submit" onclick="submitComment(${post.id})" disabled>
                        <span>➤</span>
                    </button>
                </div>
            </div>
        </article>
    `;
}

// Create recipe details section
function createRecipeDetails(recipe) {
    if (!recipe) return '';
    
    return `
        <div class="recipe-details">
            <div class="recipe-meta">
                <div class="recipe-meta-item">
                    <div class="recipe-meta-label">Prep Time</div>
                    <div class="recipe-meta-value">${recipe.prepTime}</div>
                </div>
                <div class="recipe-meta-item">
                    <div class="recipe-meta-label">Cook Time</div>
                    <div class="recipe-meta-value">${recipe.cookTime}</div>
                </div>
                <div class="recipe-meta-item">
                    <div class="recipe-meta-label">Servings</div>
                    <div class="recipe-meta-value">${recipe.servings}</div>
                </div>
                <div class="recipe-meta-item">
                    <div class="recipe-meta-label">Difficulty</div>
                    <div class="recipe-meta-value">${recipe.difficulty}</div>
                </div>
            </div>
            
            <div class="ingredients-list">
                <h4>Ingredients</h4>
                <ul>
                    ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                </ul>
            </div>
            
            <div class="instructions">
                <h4>Instructions</h4>
                <ol>
                    ${recipe.instructions.map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>
        </div>
    `;
}

// Create post images - Updated to handle real image URLs
function createPostImages(images) {
    if (images.length === 0) return '';
    
    let imageClass = 'single';
    if (images.length === 2) imageClass = 'double';
    if (images.length > 2) imageClass = 'multiple';
    
    return `
        <div class="post-images ${imageClass}">
            ${images.map(image => {
                // Check if it's a URL (starts with http) or emoji
                if (image.startsWith('http')) {
                    return `<div class="post-image"><img src="${image}" alt="Post image" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;"></div>`;
                } else {
                    return `<div class="post-image">${image}</div>`;
                }
            }).join('')}
        </div>
    `;
}

// Create post tags
function createPostTags(tags) {
    return `
        <div class="post-tags">
            ${tags.map(tag => `<span class="post-tag" onclick="filterByTag('${tag}')">#${tag}</span>`).join('')}
        </div>
    `;
}

// Create empty state
function createEmptyState() {
    return `
        <div class="empty-state">
            <div class="empty-state-icon">🍽️</div>
            <h3>No posts found</h3>
            <p>Be the first to share something delicious with the community!</p>
        </div>
    `;
}

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            setActiveFilter(filter);
        });
    });

    // Load more posts
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMorePosts);
    }

    // Modern Navbar: Hamburger and Links
    const navbarHamburger = document.getElementById('navbarHamburger');
    const navbarLinks = document.getElementById('navbarLinks');
    const navbarLinkEls = navbarLinks ? navbarLinks.querySelectorAll('a') : [];

    if (navbarHamburger && navbarLinks) {
        navbarHamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            navbarLinks.classList.toggle('active');
            navbarHamburger.classList.toggle('active');
        });

        // Close mobile nav when clicking outside
        document.addEventListener('click', function(e) {
            if (!navbarLinks.contains(e.target) && !navbarHamburger.contains(e.target)) {
                navbarLinks.classList.remove('active');
                navbarHamburger.classList.remove('active');
            }
        });

        // Close mobile nav when clicking a nav link
        navbarLinkEls.forEach(link => {
            link.addEventListener('click', function() {
                navbarLinks.classList.remove('active');
                navbarHamburger.classList.remove('active');
                this.classList.add('active');
                if (this.getAttribute('href').startsWith('#')) {
                    const section = this.getAttribute('href').substring(1);
                    handleNavigation(section);
                }
            });
        });

        // Close mobile nav with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                navbarLinks.classList.remove('active');
                navbarHamburger.classList.remove('active');
            }
        });
    }

    // Topic tags interaction
    const topicTags = document.querySelectorAll('.topic-tag');
    topicTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const tagText = this.textContent.substring(1);
            filterByTag(tagText);
        });
    });
}

// Setup modal events
function setupModalEvents() {
    // Modal close on overlay click
    createPostModal.addEventListener('click', function(e) {
        if (e.target === this) {
            hideCreateModal();
        }
    });

    // Post type selector
    const postTypeBtns = document.querySelectorAll('.post-type-btn');
    postTypeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.dataset.type;
            setPostType(type);
        });
    });

    // Form submission
    if (createPostForm) {
        createPostForm.addEventListener('submit', handlePostSubmission);
    }

    // File upload
    const photoInput = document.getElementById('photoInput');
    const uploadArea = document.getElementById('uploadArea');
    
    if (photoInput && uploadArea) {
        uploadArea.addEventListener('click', () => photoInput.click());
        photoInput.addEventListener('change', handleFileUpload);
        
        // Drag and drop
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('drop', handleFileDrop);
        uploadArea.addEventListener('dragleave', handleDragLeave);
    }

    // Comment input interactions
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('comment-input')) {
            const submitBtn = e.target.parentNode.querySelector('.comment-submit');
            submitBtn.disabled = e.target.value.trim().length === 0;
        }
    });
}

// Filter functions
function setActiveFilter(filter) {
    currentFilter = filter;
    displayedPosts = 6;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    
    if (useBackend) {
        initializeFeed();
    } else {
        renderPosts(postsData.slice(0, displayedPosts));
        updateLoadMoreButton();
    }
}

function filterByTag(tag) {
    const filteredPosts = postsData.filter(post => 
        post.tags.some(postTag => postTag.toLowerCase().includes(tag.toLowerCase()))
    );
    
    postsFeed.innerHTML = filteredPosts.map(post => createPostCard(post)).join('');
    loadMoreBtn.style.display = 'none';
    
    showNotification(`Showing posts tagged with #${tag}`, 'info');
}

// Load more posts
function loadMorePosts() {
    if (isLoading) return;
    
    isLoading = true;
    loadMoreBtn.textContent = 'Loading More Posts...';
    loadMoreBtn.disabled = true;
    
    setTimeout(() => {
        const nextBatch = postsData.slice(displayedPosts, displayedPosts + 3);
        if (nextBatch.length > 0) {
            const newPostsHTML = nextBatch.map(post => createPostCard(post)).join('');
            postsFeed.innerHTML += newPostsHTML;
            displayedPosts += nextBatch.length;
        }
        
        updateLoadMoreButton();
        isLoading = false;
    }, 1500);
}

function updateLoadMoreButton() {
    const filteredPosts = currentFilter === 'all' ? postsData : postsData.filter(post => post.type === currentFilter);
    
    if (displayedPosts >= filteredPosts.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.textContent = 'Load More Posts';
        loadMoreBtn.disabled = false;
        loadMoreBtn.style.display = 'block';
    }
}

// Modal functions
function showCreateModal() {
    createPostModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hideCreateModal() {
    createPostModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    resetForm();
}

function showCreatePost(type) {
    setPostType(type);
    showCreateModal();
}

function setPostType(type) {
    document.querySelectorAll('.post-type-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        }
    });
    
    const modalTitle = document.getElementById('modalTitle');
    const titles = {
        discussion: 'Start a Discussion',
        recipe: 'Share Your Recipe',
        question: 'Ask a Question',
        photo: 'Share Your Food Photo'
    };
    modalTitle.textContent = titles[type] || 'Create New Post';
    
    const recipeFields = document.getElementById('recipeFields');
    if (recipeFields) {
        recipeFields.style.display = type === 'recipe' ? 'block' : 'none';
    }
    
    const postTitle = document.getElementById('postTitle');
    const postContent = document.getElementById('postContent');
    
    const placeholders = {
        discussion: { title: 'What would you like to discuss?', content: 'Share your thoughts or start a conversation...' },
        recipe: { title: 'What\'s your recipe called?', content: 'Tell us about your recipe...' },
        question: { title: 'What\'s your question?', content: 'Describe what you need help with...' },
        photo: { title: 'What did you cook?', content: 'Tell us about this delicious creation...' }
    };
    
    postTitle.placeholder = placeholders[type].title;
    postContent.placeholder = placeholders[type].content;
}

// Post interactions
async function toggleLike(postId) {
    const post = postsData.find(p => p.id === postId);
    
    if (useBackend && post && post.id <= 1000) {
        const result = await likePostAPI(postId);
        if (result) {
            const likeBtn = document.querySelector(`[data-id="${postId}"] .action-item`);
            likeBtn.classList.add('liked');
            likeBtn.querySelector('span:first-child').textContent = '❤️';
            likeBtn.querySelector('span:last-child').textContent = result.likes;
            
            if (result.liked) {
                likeBtn.style.animation = 'pulse 0.6s ease';
                setTimeout(() => likeBtn.style.animation = '', 600);
            }
            return;
        }
    }
    
    if (post) {
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
        
        const likeBtn = document.querySelector(`[data-id="${postId}"] .action-item`);
        likeBtn.classList.toggle('liked', post.liked);
        likeBtn.querySelector('span:first-child').textContent = post.liked ? '❤️' : '🤍';
        likeBtn.querySelector('span:last-child').textContent = post.likes;
        
        if (post.liked) {
            likeBtn.style.animation = 'pulse 0.6s ease';
            setTimeout(() => likeBtn.style.animation = '', 600);
        }
    }
}

function toggleBookmark(postId) {
    const post = postsData.find(p => p.id === postId);
    if (post) {
        post.bookmarked = !post.bookmarked;
        
        const bookmarkBtn = document.querySelector(`[data-id="${postId}"] .post-actions-right .action-item`);
        bookmarkBtn.classList.toggle('bookmarked', post.bookmarked);
        bookmarkBtn.querySelector('span').textContent = post.bookmarked ? '🔖' : '🔗';
        
        showNotification(post.bookmarked ? 'Post saved to bookmarks' : 'Post removed from bookmarks', 'info');
    }
}

function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    const isVisible = commentsSection.style.display !== 'none';
    
    commentsSection.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
        loadComments(postId);
    }
}

// Load comments
async function loadComments(postId) {
    const commentsList = document.getElementById(`comments-list-${postId}`);
    let comments = [];
    
    if (useBackend) {
        comments = await fetchCommentsFromAPI(postId);
    } else {
        comments = commentsData[postId] || [];
    }
    
    if (comments.length > 0) {
        commentsList.innerHTML = comments.map(comment => createCommentHTML(comment)).join('');
    } else {
        commentsList.innerHTML = '<p style="text-align: center; color: #718096; font-size: 0.9rem; padding: 1rem;">No comments yet. Be the first to comment!</p>';
    }
}

function createCommentHTML(comment) {
    return `
        <div class="comment">
            <div class="comment-avatar">${comment.author.avatar || comment.author.name.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-author">${comment.author.name}</span>
                    <span class="comment-time">${comment.timestamp}</span>
                </div>
                <p class="comment-text">${comment.content}</p>
                <div class="comment-actions">
                    <button class="comment-action">Like</button>
                    <button class="comment-action">Reply</button>
                </div>
            </div>
        </div>
    `;
}

function handleCommentSubmit(event, postId) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        submitComment(postId);
    }
}

// Submit comment
async function submitComment(postId) {
    const commentInput = document.querySelector(`#comments-${postId} .comment-input`);
    const commentText = commentInput.value.trim();
    
    if (commentText) {
        let result = null;
        
        if (useBackend) {
            result = await createCommentAPI(postId, commentText);
        }
        
        if (result || !useBackend) {
            const newComment = {
                id: Date.now(),
                author: { 
                    name: currentUser.fullName, 
                    avatar: currentUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase() 
                },
                timestamp: 'Just now',
                content: commentText
            };
            
            if (!useBackend) {
                if (!commentsData[postId]) {
                    commentsData[postId] = [];
                }
                commentsData[postId].unshift(newComment);
            }
            
            const post = postsData.find(p => p.id === postId);
            if (post) {
                post.comments++;
                
                const commentBtn = document.querySelector(`[data-id="${postId}"] .action-item:nth-child(2) span:last-child`);
                commentBtn.textContent = post.comments;
            }
            
            loadComments(postId);
            
            commentInput.value = '';
            const submitBtn = commentInput.parentNode.querySelector('.comment-submit');
            submitBtn.disabled = true;
            
            showNotification('Comment added successfully!', 'success');
        }
    }
}

function sharePost(postId) {
    const post = postsData.find(p => p.id === postId);
    if (post) {
        post.shares++;
        
        const shareBtn = document.querySelector(`[data-id="${postId}"] .action-item:nth-child(3) span:last-child`);
        shareBtn.textContent = post.shares;
        
        if (navigator.share) {
            navigator.share({
                title: post.title,
                text: post.content,
                url: window.location.href
            });
        } else {
            const shareText = `Check out this ${post.type}: "${post.title}" by ${post.author.name} on Flodaz Recipes Community!`;
            navigator.clipboard.writeText(shareText).then(() => {
                showNotification('Post link copied to clipboard!', 'success');
            });
        }
    }
}

function showPostMenu(postId) {
    showNotification('Post menu coming soon! Report, save, and more options.', 'info');
}

// Form handling with image upload
async function handlePostSubmission(e) {
    e.preventDefault();
    
    const titleInput = document.getElementById('postTitle');
    const contentInput = document.getElementById('postContent');
    const tagsInput = document.getElementById('tags');
    const activeType = document.querySelector('.post-type-btn.active').dataset.type;
    
    const title = titleInput ? titleInput.value.trim() : '';
    const content = contentInput ? contentInput.value.trim() : '';
    const tags = tagsInput ? tagsInput.value.trim() : '';
    
    if (!title || !content) {
        showNotification('Please fill in both title and content fields.', 'error');
        return;
    }
    
    const postData = {
        type: activeType,
        title: title,
        content: content,
        tags: tags,
        images: uploadedImages // Include uploaded image URLs
    };
    
    // Add recipe details if it's a recipe post
    if (activeType === 'recipe') {
        const prepTimeInput = document.getElementById('prepTime');
        const cookTimeInput = document.getElementById('cookTime');
        const servingsInput = document.getElementById('servings');
        const difficultyInput = document.getElementById('difficulty');
        const ingredientsInput = document.getElementById('ingredients');
        const instructionsInput = document.getElementById('instructions');
        
        if (prepTimeInput && cookTimeInput && servingsInput) {
            postData.recipe = {
                prepTime: prepTimeInput.value.trim(),
                cookTime: cookTimeInput.value.trim(),
                servings: servingsInput.value.trim(),
                difficulty: difficultyInput ? difficultyInput.value : 'medium',
                ingredients: ingredientsInput ? ingredientsInput.value.split('\n').map(ing => ing.trim()).filter(ing => ing) : [],
                instructions: instructionsInput ? instructionsInput.value.split('\n').map(inst => inst.trim()).filter(inst => inst) : []
            };
        }
    }
    
    const submitBtn = createPostForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Publishing...';
    submitBtn.disabled = true;
    
    let result = null;
    
    if (useBackend) {
        result = await createPostAPI(postData);
    }
    
    const newPost = {
        id: result ? result.post.id : Date.now(),
        type: activeType,
        author: {
            name: currentUser.fullName,
            username: currentUser.username,
            avatar: currentUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
        },
        timestamp: 'Just now',
        title: postData.title,
        content: postData.content,
        images: uploadedImages,
        tags: postData.tags ? postData.tags.split(',').map(tag => tag.trim()) : [],
        likes: 0,
        comments: 0,
        shares: 0,
        liked: false,
        bookmarked: false
    };
    
    if (activeType === 'recipe' && postData.recipe) {
        newPost.recipe = postData.recipe;
    }
    
    setTimeout(() => {
        postsData.unshift(newPost);
        
        displayedPosts = Math.min(displayedPosts + 1, postsData.length);
        renderPosts(postsData.slice(0, displayedPosts));
        
        hideCreateModal();
        
        showNotification(`Your ${activeType} has been published successfully!`, 'success');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// File upload handling - Updated for real image uploads
async function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Show loading state
    const uploadArea = document.getElementById('uploadArea');
    const originalContent = uploadArea.innerHTML;
    uploadArea.innerHTML = '<div class="upload-content"><span class="upload-icon">⏳</span><p>Uploading images...</p></div>';
    
    try {
        if (useBackend) {
            const imageUrls = await uploadImagesAPI(files);
            if (imageUrls) {
                uploadedImages.push(...imageUrls);
                displayUploadedFiles(imageUrls);
            } else {
                throw new Error('Upload failed');
            }
        } else {
            // Fallback - create placeholder URLs for demo
            const placeholderUrls = files.map((file, index) => {
                const foodEmojis = ['🍖', '🥗', '🍲', '🥘', '🍛', '🍦', '🍟', '🥙'];
                return foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
            });
            uploadedImages.push(...placeholderUrls);
            displayUploadedFiles(placeholderUrls);
        }
        
        // Restore upload area
        uploadArea.innerHTML = originalContent;
        
    } catch (error) {
        console.error('File upload error:', error);
        uploadArea.innerHTML = originalContent;
        showNotification('Failed to upload images. Please try again.', 'error');
    }
}

function handleFileDrop(e) {
    e.preventDefault();
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
        // Simulate file input change
        const photoInput = document.getElementById('photoInput');
        const dt = new DataTransfer();
        files.forEach(file => dt.items.add(file));
        photoInput.files = dt.files;
        
        handleFileUpload({ target: { files: files } });
    }
}

function handleDragOver(e) {
    e.preventDefault();
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.classList.remove('dragover');
}

function displayUploadedFiles(imageUrls) {
    const uploadedImagesContainer = document.getElementById('uploadedImages');
    
    imageUrls.forEach((imageUrl, index) => {
        const imageContainer = document.createElement('div');
        imageContainer.className = 'uploaded-image';
        
        if (typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
            // Real image URL
            imageContainer.innerHTML = `
                <img src="${imageUrl}" alt="Uploaded image" style="width: 100%; height: 100%; object-fit: cover;">
                <button class="remove-image" onclick="removeUploadedImage(this, '${imageUrl}')">×</button>
            `;
        } else {
            // Emoji placeholder
            imageContainer.innerHTML = `
                <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 2rem; color: white;">
                    ${imageUrl}
                </div>
                <button class="remove-image" onclick="removeUploadedImage(this, '${imageUrl}')">×</button>
            `;
        }
        
        uploadedImagesContainer.appendChild(imageContainer);
    });
}

function removeUploadedImage(btn, imageUrl) {
    // Remove from uploaded images array
    const index = uploadedImages.indexOf(imageUrl);
    if (index > -1) {
        uploadedImages.splice(index, 1);
    }
    
    // Remove from DOM
    btn.parentElement.remove();
}

// Reset form
function resetForm() {
    if (createPostForm) {
        createPostForm.reset();
    }
    
    const uploadedImagesContainer = document.getElementById('uploadedImages');
    if (uploadedImagesContainer) {
        uploadedImagesContainer.innerHTML = '';
    }
    
    // Clear uploaded images array
    uploadedImages = [];
    
    const recipeFields = document.getElementById('recipeFields');
    if (recipeFields) {
        recipeFields.style.display = 'none';
    }
    
    // Reset post type to discussion
    document.querySelectorAll('.post-type-btn').forEach(btn => btn.classList.remove('active'));
    const discussionBtn = document.querySelector('.post-type-btn[data-type="discussion"]');
    if (discussionBtn) {
        discussionBtn.classList.add('active');
    }
    
    setPostType('discussion');
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 3000);
}

// Navigation handling
function handleNavigation(section) {
    switch (section) {
        case 'feed':
            setActiveFilter('all');
            break;
        case 'trending':
            showTrendingPosts();
            break;
        case 'questions':
            setActiveFilter('question');
            break;
        case 'challenges':
            showChallenges();
            break;
        case 'groups':
            showGroups();
            break;
    }
}

function showTrendingPosts() {
    const trendingPosts = [...postsData].sort((a, b) => {
        const engagementA = a.likes + a.comments + a.shares;
        const engagementB = b.likes + b.comments + b.shares;
        return engagementB - engagementA;
    });
    
    postsFeed.innerHTML = trendingPosts.slice(0, 6).map(post => createPostCard(post)).join('');
    loadMoreBtn.style.display = 'none';
    
    showNotification('Showing trending posts based on engagement', 'info');
}

function showChallenges() {
    postsFeed.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">🏆</div>
            <h3>Weekly Challenges</h3>
            <p>Join our cooking challenges and compete with fellow food enthusiasts! New challenges every Monday.</p>
            <button class="btn primary" onclick="showNotification('Challenge feature coming soon!', 'info')">View Current Challenge</button>
        </div>
    `;
    loadMoreBtn.style.display = 'none';
}

function showGroups() {
    postsFeed.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">👥</div>
            <h3>Community Groups</h3>
            <p>Connect with like-minded food enthusiasts in specialized groups based on cuisine, dietary preferences, and cooking styles.</p>
            <button class="btn primary" onclick="showNotification('Groups feature coming soon!', 'info')">Explore Groups</button>
        </div>
    `;
    loadMoreBtn.style.display = 'none';
}