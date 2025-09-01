// Community Page JavaScript

// Sample post data
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
                'Remove chicken and sauté onions until golden',
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
    },
    {
        id: 2,
        type: 'question',
        author: {
            name: 'Food Explorer',
            username: 'foodie_wanderer',
            avatar: 'FE'
        },
        timestamp: '4 hours ago',
        title: 'Help! My ugali keeps turning out lumpy',
        content: 'I\'ve tried making ugali several times but it always comes out with lumps. I\'m stirring constantly but something\'s not right. Any tips from the experts here?',
        images: [],
        tags: ['ugali', 'help', 'cooking-tips', 'east-african'],
        likes: 34,
        comments: 12,
        shares: 2,
        liked: true,
        bookmarked: false
    },
    {
        id: 3,
        type: 'photo',
        author: {
            name: 'Spice Master',
            username: 'spice_guru',
            avatar: 'SM'
        },
        timestamp: '6 hours ago',
        title: 'Homemade berbere spice blend',
        content: 'Spent the afternoon grinding fresh berbere spice! The aroma is incredible. This batch will last me months. Nothing beats homemade spices!',
        images: ['🌶️', '🥄', '🔥'],
        tags: ['spices', 'berbere', 'homemade', 'ethiopian'],
        likes: 87,
        comments: 9,
        shares: 15,
        liked: false,
        bookmarked: true
    },
    {
        id: 4,
        type: 'discussion',
        author: {
            name: 'Mama Khadija',
            username: 'mama_k',
            avatar: 'MK'
        },
        timestamp: '8 hours ago',
        title: 'The evolution of African street food',
        content: 'I\'ve been thinking about how African street food has evolved over the decades. From simple roasted corn to elaborate suya preparations. What changes have you noticed in your local street food scene?',
        images: [],
        tags: ['street-food', 'culture', 'discussion', 'food-history'],
        likes: 56,
        comments: 23,
        shares: 8,
        liked: false,
        bookmarked: false
    },
    {
        id: 5,
        type: 'recipe',
        author: {
            name: 'Healthy Chef',
            username: 'healthy_eats',
            avatar: 'HC'
        },
        timestamp: '10 hours ago',
        title: 'Vegan Thieboudienne (Senegalese Rice)',
        content: 'Made this plant-based version of the classic Senegalese dish using jackfruit instead of fish. Surprisingly authentic taste!',
        recipe: {
            prepTime: '30 minutes',
            cookTime: '1 hour',
            servings: 4,
            difficulty: 'medium',
            ingredients: [
                '2 cups broken rice',
                '400g young green jackfruit',
                '2 large tomatoes',
                '1 onion, sliced',
                '2 carrots, chunked',
                '1 small cabbage, quartered',
                '100g tomato paste',
                '2 tsp thyme',
                '1 bay leaf',
                'Vegetable oil for frying'
            ],
            instructions: [
                'Prepare jackfruit by removing seeds and cutting into chunks',
                'Season jackfruit with salt and spices',
                'Fry vegetables until lightly browned',
                'Make tomato sauce base',
                'Add rice and vegetable stock',
                'Arrange vegetables on top and steam'
            ]
        },
        images: ['🍚', '🥕'],
        tags: ['vegan', 'senegalese', 'thieboudienne', 'plant-based'],
        likes: 78,
        comments: 14,
        shares: 11,
        liked: true,
        bookmarked: false
    },
    {
        id: 6,
        type: 'photo',
        author: {
            name: 'Kitchen Artist',
            username: 'kitchen_art',
            avatar: 'KA'
        },
        timestamp: '12 hours ago',
        title: 'Fresh injera straight from the mitad',
        content: 'Nothing beats the smell of fresh injera in the morning. This batch came out perfectly spongy!',
        images: ['🫓', '🔥'],
        tags: ['injera', 'ethiopian', 'bread', 'traditional'],
        likes: 92,
        comments: 8,
        shares: 5,
        liked: false,
        bookmarked: false
    }
];

// Sample comments data
const commentsData = {
    1: [
        {
            id: 1,
            author: { name: 'Rice Lover', avatar: 'RL' },
            timestamp: '1 hour ago',
            content: 'This looks amazing! What type of rice do you recommend for beginners?'
        },
        {
            id: 2,
            author: { name: 'Chef Marcus', avatar: 'CM' },
            timestamp: '45 minutes ago',
            content: 'The tomato base technique is spot on! I use a similar method in my restaurant.'
        }
    ],
    2: [
        {
            id: 3,
            author: { name: 'Ugali Expert', avatar: 'UE' },
            timestamp: '3 hours ago',
            content: 'Try adding the flour gradually while stirring. Also, make sure your water is at a rolling boil!'
        },
        {
            id: 4,
            author: { name: 'Kitchen Newbie', avatar: 'KN' },
            timestamp: '2 hours ago',
            content: 'I had the same problem! Using a wooden spoon and constant stirring helped me.'
        }
    ]
};

// Global state
let currentFilter = 'all';
let displayedPosts = 6;
let isLoading = false;
let currentUser = null;

// DOM Elements
const postsFeed = document.getElementById('postsFeed');
const createPostModal = document.getElementById('createPostModal');
const createPostForm = document.getElementById('createPostForm');
const loadMoreBtn = document.getElementById('loadMorePosts');

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    initializeFeed();
    setupEventListeners();
    setupModalEvents();
});

// Load user profile
function loadUserProfile() {
    // Try to load from localStorage first, fallback to default
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
function initializeFeed() {
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
                <div class="post-avatar">${post.author.avatar}</div>
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
                
                ${post.images.length > 0 ? createPostImages(post.images) : ''}
                
                ${post.tags.length > 0 ? createPostTags(post.tags) : ''}
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
                        <span>${post.bookmarked ? '🔖' : '📑'}</span>
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

// Create post images
function createPostImages(images) {
    if (images.length === 0) return '';
    
    let imageClass = 'single';
    if (images.length === 2) imageClass = 'double';
    if (images.length > 2) imageClass = 'multiple';
    
    return `
        <div class="post-images ${imageClass}">
            ${images.map(image => `<div class="post-image">${image}</div>`).join('')}
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
                // Set active class
                navbarLinkEls.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                // Handle navigation
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
            const tagText = this.textContent.substring(1); // Remove #
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
    
    renderPosts(postsData.slice(0, displayedPosts));
    updateLoadMoreButton();
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
    // Update active button
    document.querySelectorAll('.post-type-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        }
    });
    
    // Update modal title
    const modalTitle = document.getElementById('modalTitle');
    const titles = {
        discussion: 'Start a Discussion',
        recipe: 'Share Your Recipe',
        question: 'Ask a Question',
        photo: 'Share Your Food Photo'
    };
    modalTitle.textContent = titles[type] || 'Create New Post';
    
    // Show/hide recipe fields
    const recipeFields = document.getElementById('recipeFields');
    recipeFields.style.display = type === 'recipe' ? 'block' : 'none';
    
    // Update placeholder text
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
function toggleLike(postId) {
    const post = postsData.find(p => p.id === postId);
    if (post) {
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
        
        // Update UI
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
        
        // Update UI
        const bookmarkBtn = document.querySelector(`[data-id="${postId}"] .post-actions-right .action-item`);
        bookmarkBtn.classList.toggle('bookmarked', post.bookmarked);
        bookmarkBtn.querySelector('span').textContent = post.bookmarked ? '🔖' : '📑';
        
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

function loadComments(postId) {
    const commentsList = document.getElementById(`comments-list-${postId}`);
    const comments = commentsData[postId] || [];
    
    if (comments.length > 0) {
        commentsList.innerHTML = comments.map(comment => createCommentHTML(comment)).join('');
    } else {
        commentsList.innerHTML = '<p style="text-align: center; color: #718096; font-size: 0.9rem; padding: 1rem;">No comments yet. Be the first to comment!</p>';
    }
}

function createCommentHTML(comment) {
    return `
        <div class="comment">
            <div class="comment-avatar">${comment.author.avatar}</div>
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

function submitComment(postId) {
    const commentInput = document.querySelector(`#comments-${postId} .comment-input`);
    const commentText = commentInput.value.trim();
    
    if (commentText) {
        const newComment = {
            id: Date.now(),
            author: { 
                name: currentUser.fullName, 
                avatar: currentUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase() 
            },
            timestamp: 'Just now',
            content: commentText
        };
        
        // Add to comments data
        if (!commentsData[postId]) {
            commentsData[postId] = [];
        }
        commentsData[postId].unshift(newComment);
        
        // Update post comment count
        const post = postsData.find(p => p.id === postId);
        if (post) {
            post.comments++;
            
            // Update comment count in UI
            const commentBtn = document.querySelector(`[data-id="${postId}"] .action-item:nth-child(2) span:last-child`);
            commentBtn.textContent = post.comments;
        }
        
        // Refresh comments display
        loadComments(postId);
        
        // Clear input
        commentInput.value = '';
        const submitBtn = commentInput.parentNode.querySelector('.comment-submit');
        submitBtn.disabled = true;
        
        showNotification('Comment added successfully!', 'success');
    }
}

function sharePost(postId) {
    const post = postsData.find(p => p.id === postId);
    if (post) {
        post.shares++;
        
        // Update UI
        const shareBtn = document.querySelector(`[data-id="${postId}"] .action-item:nth-child(3) span:last-child`);
        shareBtn.textContent = post.shares;
        
        // Simulate sharing
        if (navigator.share) {
            navigator.share({
                title: post.title,
                text: post.content,
                url: window.location.href
            });
        } else {
            // Fallback - copy to clipboard
            const shareText = `Check out this ${post.type}: "${post.title}" by ${post.author.name} on Frodaz Recipes Community!`;
            navigator.clipboard.writeText(shareText).then(() => {
                showNotification('Post link copied to clipboard!', 'success');
            });
        }
    }
}

function showPostMenu(postId) {
    showNotification('Post menu coming soon! Report, save, and more options.', 'info');
}

// Form handling
function handlePostSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(createPostForm);
    const activeType = document.querySelector('.post-type-btn.active').dataset.type;
    
    const newPost = {
        id: Date.now(),
        type: activeType,
        author: {
            name: currentUser.fullName,
            username: currentUser.username,
            avatar: currentUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
        },
        timestamp: 'Just now',
        title: formData.get('title'),
        content: formData.get('content'),
        images: [], // Would handle uploaded images here
        tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : [],
        likes: 0,
        comments: 0,
        shares: 0,
        liked: false,
        bookmarked: false
    };
    
            // Add recipe details if it's a recipe post
    if (activeType === 'recipe') {
        newPost.recipe = {
            prepTime: formData.get('prepTime'),
            cookTime: formData.get('cookTime'),
            servings: formData.get('servings'),
            difficulty: formData.get('difficulty'),
            ingredients: formData.get('ingredients') ? formData.get('ingredients').split('\n').map(ing => ing.trim()).filter(ing => ing) : [],
            instructions: formData.get('instructions') ? formData.get('instructions').split('\n').map(inst => inst.trim()).filter(inst => inst) : []
        };
    }
    
    // Simulate post submission
    const submitBtn = createPostForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Publishing...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        // Add to posts data
        postsData.unshift(newPost);
        
        // Refresh feed
        displayedPosts = Math.min(displayedPosts + 1, postsData.length);
        renderPosts(postsData.slice(0, displayedPosts));
        
        // Hide modal and reset form
        hideCreateModal();
        
        // Show success notification
        showNotification(`Your ${activeType} has been published successfully!`, 'success');
        
        // Scroll to top to see new post
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// File upload handling
function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    displayUploadedFiles(files);
}

function handleFileDrop(e) {
    e.preventDefault();
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    displayUploadedFiles(files);
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

function displayUploadedFiles(files) {
    const uploadedImages = document.getElementById('uploadedImages');
    
    files.forEach((file, index) => {
        if (file.type.startsWith('image/')) {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'uploaded-image';
            
            // In a real app, you'd upload the file and get a URL
            // For demo purposes, we'll use emojis
            const foodEmojis = ['🍖', '🥗', '🍲', '🥘', '🍛', '🍤', '🐟', '🥙'];
            const randomEmoji = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
            
            imageContainer.innerHTML = `
                <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 2rem; color: white;">
                    ${randomEmoji}
                </div>
                <button class="remove-image" onclick="removeUploadedImage(this)">×</button>
            `;
            
            uploadedImages.appendChild(imageContainer);
        }
    });
}

function removeUploadedImage(btn) {
    btn.parentElement.remove();
}

// Reset form
function resetForm() {
    createPostForm.reset();
    document.getElementById('uploadedImages').innerHTML = '';
    document.getElementById('recipeFields').style.display = 'none';
    
    // Reset post type to discussion
    document.querySelectorAll('.post-type-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.post-type-btn[data-type="discussion"]').classList.add('active');
    
    setPostType('discussion');
}

// Notification system
function showNotification(message, type = 'info') {
    // Notification popup removed as requested. No operation.
}

// Search functionality
function searchPosts(query) {
    const searchResults = postsData.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.content.toLowerCase().includes(query.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
        post.author.name.toLowerCase().includes(query.toLowerCase())
    );
    
    postsFeed.innerHTML = searchResults.map(post => createPostCard(post)).join('');
    
    if (searchResults.length === 0) {
        postsFeed.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h3>No posts found</h3>
                <p>Try searching with different keywords or browse all posts.</p>
            </div>
        `;
    }
    
    loadMoreBtn.style.display = 'none';
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Auto-expand textareas
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    });
    
    // Add real-time character count for post content
    const postContent = document.getElementById('postContent');
    if (postContent) {
        const charCounter = document.createElement('div');
        charCounter.className = 'char-counter';
        charCounter.style.cssText = 'text-align: right; font-size: 0.8rem; color: #718096; margin-top: 0.5rem;';
        
        postContent.parentNode.appendChild(charCounter);
        
        postContent.addEventListener('input', function() {
            const remaining = 500 - this.value.length;
            charCounter.textContent = `${remaining} characters remaining`;
            charCounter.style.color = remaining < 50 ? '#e53e3e' : '#718096';
        });
    }
    
    // Auto-save draft functionality
    let draftTimer;
    const formInputs = document.querySelectorAll('#createPostForm input, #createPostForm textarea, #createPostForm select');
    
    formInputs.forEach(input => {
        input.addEventListener('input', function() {
            clearTimeout(draftTimer);
            draftTimer = setTimeout(saveDraft, 2000);
        });
    });
    
    // Load draft on modal open
    document.getElementById('createPostBtn').addEventListener('click', function() {
        showCreateModal();
        loadDraft();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Escape to close modal
        if (e.key === 'Escape' && createPostModal.classList.contains('active')) {
            hideCreateModal();
        }
        
        // Ctrl/Cmd + Enter to submit form
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && createPostModal.classList.contains('active')) {
            e.preventDefault();
            createPostForm.dispatchEvent(new Event('submit'));
        }
    });
    
    // Infinite scroll
    let isNearBottom = false;
    window.addEventListener('scroll', function() {
        const scrollPosition = window.innerHeight + window.scrollY;
        const documentHeight = document.documentElement.offsetHeight;
        
        if (scrollPosition >= documentHeight - 1000 && !isNearBottom && !isLoading) {
            isNearBottom = true;
            setTimeout(() => {
                if (loadMoreBtn && loadMoreBtn.style.display !== 'none') {
                    loadMorePosts();
                }
                isNearBottom = false;
            }, 500);
        }
    });
    
    // Live search in navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Filter posts based on section
                const section = this.getAttribute('href').substring(1);
                handleNavigation(section);
            }
        });
    });
});

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
    // Sort posts by engagement (likes + comments + shares)
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

// Draft functionality
function saveDraft() {
    const formData = new FormData(createPostForm);
    const draft = {
        type: document.querySelector('.post-type-btn.active').dataset.type,
        title: formData.get('title'),
        content: formData.get('content'),
        tags: formData.get('tags'),
        prepTime: formData.get('prepTime'),
        cookTime: formData.get('cookTime'),
        servings: formData.get('servings'),
        difficulty: formData.get('difficulty'),
        ingredients: formData.get('ingredients'),
        instructions: formData.get('instructions'),
        timestamp: Date.now()
    };
    
    localStorage.setItem('community_draft', JSON.stringify(draft));
}

function loadDraft() {
    const draft = JSON.parse(localStorage.getItem('community_draft') || 'null');
    
    if (draft && Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) { // 24 hours
        // Ask user if they want to restore draft
        if (confirm('You have an unsaved draft. Would you like to restore it?')) {
            setPostType(draft.type);
            document.getElementById('postTitle').value = draft.title || '';
            document.getElementById('postContent').value = draft.content || '';
            document.getElementById('tags').value = draft.tags || '';
            
            if (draft.type === 'recipe') {
                document.getElementById('prepTime').value = draft.prepTime || '';
                document.getElementById('cookTime').value = draft.cookTime || '';
                document.getElementById('servings').value = draft.servings || '';
                document.getElementById('difficulty').value = draft.difficulty || '';
                document.getElementById('ingredients').value = draft.ingredients || '';
                document.getElementById('instructions').value = draft.instructions || '';
            }
        } else {
            localStorage.removeItem('community_draft');
        }
    }
}

// Advanced interactions
function handleDoubleClick(postId) {
    // Double click to like (Instagram-style)
    const post = postsData.find(p => p.id === postId);
    if (post && !post.liked) {
        toggleLike(postId);
        
        // Show heart animation
        const postCard = document.querySelector(`[data-id="${postId}"]`);
        const heart = document.createElement('div');
        heart.innerHTML = '❤️';
        heart.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            font-size: 4rem;
            pointer-events: none;
            z-index: 1000;
            animation: heartPop 1s ease;
        `;
        
        // Add heart pop animation
        if (!document.querySelector('.heart-animation-styles')) {
            const style = document.createElement('style');
            style.className = 'heart-animation-styles';
            style.textContent = `
                @keyframes heartPop {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                    15% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                    30% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        postCard.style.position = 'relative';
        postCard.appendChild(heart);
        
        setTimeout(() => heart.remove(), 1000);
    }
}

// Add double-click listeners to post cards
function addPostInteractions() {
    const postCards = document.querySelectorAll('.post-card');
    postCards.forEach(card => {
        const postId = parseInt(card.dataset.id);
        
        card.addEventListener('dblclick', function(e) {
            if (!e.target.closest('.post-actions') && !e.target.closest('button') && !e.target.closest('a')) {
                handleDoubleClick(postId);
            }
        });
    });
}

// Real-time features simulation
function simulateRealTimeUpdates() {
    setInterval(() => {
        // Randomly update like counts
        const randomPost = postsData[Math.floor(Math.random() * postsData.length)];
        if (Math.random() < 0.3) { // 30% chance
            randomPost.likes += Math.floor(Math.random() * 3);
            
            // Update UI if post is visible
            const likeBtn = document.querySelector(`[data-id="${randomPost.id}"] .action-item span:last-child`);
            if (likeBtn) {
                likeBtn.textContent = randomPost.likes;
            }
        }
    }, 30000); // Every 30 seconds
}

// Initialize real-time features
setTimeout(simulateRealTimeUpdates, 5000);

// Tag cloud functionality
function createTagCloud() {
    const allTags = postsData.flatMap(post => post.tags);
    const tagCounts = {};
    
    allTags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
    
    const sortedTags = Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
    
    return sortedTags;
}

// Utility functions
function formatTimeAgo(timestamp) {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffMinutes = Math.floor((now - postTime) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
}

function validateRecipeForm() {
    const requiredFields = ['postTitle', 'postContent'];
    const activeType = document.querySelector('.post-type-btn.active').dataset.type;
    
    if (activeType === 'recipe') {
        requiredFields.push('prepTime', 'cookTime', 'servings', 'difficulty', 'ingredients', 'instructions');
    }
    
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            field.focus();
            showNotification(`Please fill in the ${field.placeholder || fieldId} field`, 'error');
            return false;
        }
    }
    
    return true;
}

// Enhanced form submission with validation
function enhancedPostSubmission(e) {
    e.preventDefault();
    
    if (!validateRecipeForm()) {
        return;
    }
    
    handlePostSubmission(e);
}

// Add enhanced validation
if (createPostForm) {
    createPostForm.removeEventListener('submit', handlePostSubmission);
    createPostForm.addEventListener('submit', enhancedPostSubmission);
}

// Initialize post interactions after DOM load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addPostInteractions, 500);
});

// Re-add interactions after new posts are loaded
function reInitializeInteractions() {
    addPostInteractions();
}

// Close mobile navigation function
function closeMobileNav() {
    const mainNav = document.getElementById('mainNav');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    
    if (mainNav) {
        mainNav.classList.remove('active');
    }
    
    if (hamburgerBtn) {
        hamburgerBtn.classList.remove('active');
    }
}