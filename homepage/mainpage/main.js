// Configuration - Add your Gemini API key here
const GEMINI_API_KEY = 'AIzaSyCGrZ7zOlM2WVu2CNIIZyy62InCEM_RXHU'; // Replace with your actual API key
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

// Global state
let currentUser = JSON.parse(localStorage.getItem('smartrecipes_user')) || null;
let aiPromptCount = parseInt(localStorage.getItem('ai_prompt_count')) || 0;
let currentFilter = 'all';

// Sample recipe data - Featured recipes from your community
const featuredRecipes = [
    {
        id: 1,
        title: "Mediterranean Pasta",
        description: "A delicious blend of fresh herbs, olives, and sun-dried tomatoes. Perfect for family dinners.",
        category: "Maincourse",
        emoji: "🍝",
        time: "35 min",
        difficulty: "Easy",
        link: "recipies/patsa.html"
    },
    {
        id: 2,
        title: "Spicy Curry Bowl",
        description: "Aromatic spices and tender vegetables create this warming comfort food favorite.",
        category: "Maincourse",
        emoji: "🥘",
        time: "45 min",
        difficulty: "Medium",
        comingSoon: true
    },
    {
        id: 3,
        title: "Chocolate Delight Cake",
        description: "Rich, moist chocolate cake that's perfect for celebrations and special occasions.",
        category: "Desserts",
        emoji: "🍰",
        time: "90 min",
        difficulty: "Hard",
        comingSoon: true
    },
    {
        id: 4,
        title: "Fresh Garden Salad",
        description: "Crisp vegetables and homemade dressing make this a healthy and refreshing choice.",
        category: "Salads",
        emoji: "🥗",
        time: "15 min",
        difficulty: "Easy",
        comingSoon: true
    },
    {
        id: 5,
        title: "Artisan Pizza",
        description: "Handcrafted pizza with premium toppings and perfectly crispy crust.",
        category: "Maincourse",
        emoji: "🍕",
        time: "120 min",
        difficulty: "Medium",
        comingSoon: true
    },
    {
        id: 6,
        title: "Hearty Soup",
        description: "Comforting and nutritious soup packed with seasonal vegetables and herbs.",
        category: "Maincourse",
        emoji: "🍲",
        time: "60 min",
        difficulty: "Easy",
        comingSoon: true
    },
    {
        id: 7,
        title: "Avocado Toast",
        description: "Creamy avocado on sourdough with a poached egg on top.",
        category: "Breakfast",
        emoji: "🥑",
        time: "10 min",
        difficulty: "Easy",
        comingSoon: true
    },
    {
        id: 8,
        title: "Energy Balls",
        description: "No-bake energy balls with dates, nuts, and cocoa powder.",
        category: "Snacks",
        emoji: "⚡",
        time: "15 min",
        difficulty: "Easy",
        comingSoon: true
    }
];

// DOM Elements
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mainNav = document.getElementById('mainNav');
const profileBtn = document.getElementById('profileBtn');
const profileMenu = document.getElementById('profileMenu');
const authModal = document.getElementById('authModal');
const authCloseBtn = document.getElementById('authCloseBtn');
const authForm = document.getElementById('authForm');
const aiBtn = document.getElementById('aiBtn');
const aiInput = document.getElementById('aiInput');
const aiOutput = document.getElementById('aiOutput');
const homeGallery = document.getElementById('homeGallery');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const overlay = document.getElementById('overlay');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeUser();
    renderRecipeGallery();
    setupEventListeners();
    setupAnimations();
});

// User management
function initializeUser() {
    updateProfileDisplay();
}

function updateProfileDisplay() {
    const avatarCircle = document.getElementById('avatarCircle');
    const avatarCircleMenu = document.getElementById('avatarCircleMenu');
    const pmName = document.getElementById('pmName');
    const pmUsername = document.getElementById('pmUsername');
    const pmEmail = document.getElementById('pmEmail');
    const pmDob = document.getElementById('pmDob');
    const pmAccountType = document.getElementById('pmAccountType');
    const pmPrompts = document.getElementById('pmPrompts');
    const pmContact = document.getElementById('pmContact');
    const pmAddress = document.getElementById('pmAddress');
    const pmGender = document.getElementById('pmGender');

    if (currentUser) {
        const initials = currentUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
        avatarCircle.textContent = initials;
        avatarCircleMenu.textContent = initials;
        pmName.textContent = currentUser.fullName;
        pmUsername.textContent = `@${currentUser.username}`;
        pmEmail.textContent = currentUser.email;
        pmDob.textContent = currentUser.dob || '—';
        pmAccountType.textContent = currentUser.accountType || 'Free';
        pmAccountType.className = `badge ${currentUser.accountType === 'Premium' ? 'premium' : 'free'}`;
        pmPrompts.textContent = currentUser.accountType === 'Premium' ? '∞' : `${aiPromptCount} / 20`;
        pmContact.textContent = currentUser.contact || '—';
        pmAddress.textContent = currentUser.address || '—';
        pmGender.textContent = currentUser.gender || '—';
    } else {
        avatarCircle.textContent = '?';
        avatarCircleMenu.textContent = '?';
        pmName.textContent = 'Guest';
        pmUsername.textContent = '@guest';
        pmEmail.textContent = '—';
        pmDob.textContent = '—';
        pmAccountType.textContent = 'Free';
        pmAccountType.className = 'badge free';
        pmPrompts.textContent = `${aiPromptCount} / 20`;
        pmContact.textContent = '—';
        pmAddress.textContent = '—';
        pmGender.textContent = '—';
    }
}

// Event listeners
function setupEventListeners() {
    // Mobile navigation
    hamburgerBtn?.addEventListener('click', toggleMobileNav);

    // Profile menu
    profileBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleProfileMenu();
    });

    // Close profile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!profileMenu?.contains(e.target) && !profileBtn?.contains(e.target)) {
            closeProfileMenu();
        }
    });

    // Auth modal
    authCloseBtn?.addEventListener('click', closeAuthModal);
    authForm?.addEventListener('submit', handleAuth);

    // AI functionality
    aiBtn?.addEventListener('click', handleAIRequest);
    aiInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAIRequest();
        }
    });

    // Recipe filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const category = e.target.dataset.category;
            setActiveFilter(category);
            filterRecipes(category);
        });
    });

    // Load more recipes
    loadMoreBtn?.addEventListener('click', loadMoreRecipes);

    // Profile actions
    document.getElementById('upgradeBtn')?.addEventListener('click', handleUpgrade);
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

    // Close modal on overlay click
    overlay?.addEventListener('click', closeAuthModal);
    authModal?.addEventListener('click', (e) => {
        if (e.target === authModal) {
            closeAuthModal();
        }
    });

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAuthModal();
            closeProfileMenu();
        }
    });
}

// Navigation functions
function toggleMobileNav() {
    mainNav?.classList.toggle('active');
    hamburgerBtn?.classList.toggle('active');
}

function toggleProfileMenu() {
    const isVisible = profileMenu?.style.display === 'block';
    profileMenu.style.display = isVisible ? 'none' : 'block';
}

function closeProfileMenu() {
    if (profileMenu) {
        profileMenu.style.display = 'none';
    }
}

// Auth modal functions
function openAuthModal() {
    if (authModal && overlay) {
        authModal.style.display = 'flex';
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeAuthModal() {
    if (authModal && overlay) {
        authModal.style.display = 'none';
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function handleAuth(e) {
    e.preventDefault();
    
    const formData = new FormData(authForm);
    const userData = {
        fullName: formData.get('fullName') || document.getElementById('fullName').value,
        username: formData.get('username') || document.getElementById('username').value,
        email: formData.get('email') || document.getElementById('email').value,
        dob: formData.get('dob') || document.getElementById('dob').value,
        contact: formData.get('contact') || document.getElementById('contact').value,
        address: formData.get('address') || document.getElementById('address').value,
        gender: formData.get('gender') || document.getElementById('gender').value,
        accountType: 'Free',
        joinDate: new Date().toISOString()
    };

    // Validate required fields
    if (!userData.fullName || !userData.username || !userData.email || !userData.dob) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Save user data
    currentUser = userData;
    localStorage.setItem('smartrecipes_user', JSON.stringify(currentUser));
    
    // Update UI
    updateProfileDisplay();
    closeAuthModal();
    showNotification(`Welcome, ${userData.fullName}! Your account has been created.`, 'success');
    
    // Reset form
    authForm.reset();
}

// Gemini AI integration
async function handleAIRequest() {
    const input = aiInput?.value.trim();
    if (!input) {
        showNotification('Please enter some ingredients', 'error');
        return;
    }

    // Check AI prompt limits for free users
    if (!currentUser?.accountType || currentUser.accountType !== 'Premium') {
        if (aiPromptCount >= 20) {
            showNotification('You\'ve reached your free AI prompt limit. Upgrade to Premium for unlimited prompts!', 'warning');
            return;
        }
    }

    // Check if API key is set
    if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        showFallbackAIResponse(input);
        return;
    }

    // Show loading state
    aiBtn.textContent = 'Thinking...';
    aiBtn.disabled = true;
    aiOutput.style.display = 'block';
    aiOutput.innerHTML = '<div class="loading-spinner">🤔 AI is analyzing your ingredients...</div>';

    try {
        const response = await callGeminiAPI(input);
        displayAIResponse(input, response);

        // Increment prompt count for free users
        if (!currentUser?.accountType || currentUser.accountType !== 'Premium') {
            aiPromptCount++;
            localStorage.setItem('ai_prompt_count', aiPromptCount.toString());
            updateProfileDisplay();
        }

    } catch (error) {
        console.error('Gemini API Error:', error);
        
        // More detailed error handling
        let errorMessage = 'Sorry, there was an error processing your request.';
        
        if (error.message.includes('403') || error.message.includes('API key')) {
            errorMessage = 'API key issue: Please check your Gemini API key is valid and has the correct permissions.';
        } else if (error.message.includes('429')) {
            errorMessage = 'Rate limit exceeded: Please wait a moment before trying again.';
        } else if (error.message.includes('400')) {
            errorMessage = 'Invalid request: The input may be too long or contain unsupported content.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
            errorMessage = 'Connection issue: This might be due to CORS restrictions. Consider using a backend proxy.';
        }
        
        aiOutput.innerHTML = `<div style="color: rgba(255,255,255,0.8); padding: 1rem; background: rgba(255,0,0,0.1); border-radius: 8px;">
            <strong>Error:</strong> ${errorMessage}<br>
            <small>Check the browser console for more details.</small>
        </div>`;
        
        showNotification(errorMessage, 'error');
        
        // Fallback to mock response
        setTimeout(() => {
            showFallbackAIResponse(input);
        }, 2000);
    }

    // Reset button
    aiBtn.textContent = 'Get Recipe Ideas';
    aiBtn.disabled = false;
}

async function callGeminiAPI(ingredients) {
    const prompt = `You are a professional chef and recipe expert. A user has these ingredients: "${ingredients}". 

Please provide 3 specific, detailed recipe suggestions that they can make with these ingredients. For each recipe, include:

1. Recipe name with appropriate emoji
2. Brief description (1-2 sentences)
3. Estimated cooking time
4. Difficulty level (Easy/Medium/Hard)
5. Key cooking steps (3-4 main steps)

Format your response as HTML with proper structure. Use <div class="suggestion-card"> for each recipe with <h4>, <p>, and <div class="recipe-steps"> elements.

Focus on practical, achievable recipes that primarily use the ingredients mentioned. If additional common pantry items are needed, mention them briefly.`;

    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
            stopSequences: [],
        },
        safetySettings: [
            {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
        ]
    };

    console.log('Making request to Gemini API...', {
        url: GEMINI_API_URL,
        body: requestBody
    });

    const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
    } else if (data.error) {
        throw new Error(`API Error: ${data.error.message || JSON.stringify(data.error)}`);
    } else {
        throw new Error('Invalid response format from Gemini API: ' + JSON.stringify(data));
    }
}

function displayAIResponse(ingredients, response) {
    aiOutput.innerHTML = `
        <h3>🍳 Recipe Suggestions for: "${ingredients}"</h3>
        <div class="ai-suggestions">
            ${response}
        </div>
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.2); font-size: 0.9rem; color: rgba(255,255,255,0.7);">
            <p>💡 <strong>Tip:</strong> Click on any recipe card below to see similar community recipes!</p>
        </div>
    `;
}

function showFallbackAIResponse(ingredients) {
    // Fallback response when API key is not set or API fails
    aiBtn.textContent = 'Using Demo Mode...';
    aiBtn.disabled = true;
    aiOutput.style.display = 'block';
    aiOutput.innerHTML = '<div class="loading-spinner">🤔 Generating demo suggestions...</div>';

    setTimeout(() => {
        const mockResponse = generateMockAIResponse(ingredients);
        displayAIResponse(ingredients, mockResponse);
        
        // Show notice about demo mode
        showNotification('Demo mode: Using fallback suggestions. Check your API key for real AI responses!', 'info');
        
        // Increment prompt count for free users
        if (!currentUser?.accountType || currentUser.accountType !== 'Premium') {
            aiPromptCount++;
            localStorage.setItem('ai_prompt_count', aiPromptCount.toString());
            updateProfileDisplay();
        }
        
        aiBtn.textContent = 'Get Recipe Ideas';
        aiBtn.disabled = false;
    }, 2000);
}

function generateMockAIResponse(ingredients) {
    const responses = [
        `
        <div class="suggestion-card">
            <h4>🍝 Quick Pasta Sauté</h4>
            <p>A simple yet flavorful dish that brings together your ingredients with classic Italian techniques. Perfect for a weeknight dinner.</p>
            <div class="recipe-steps">
                <p><strong>Time:</strong> 20 minutes | <strong>Difficulty:</strong> Easy</p>
                <p><strong>Steps:</strong> Sauté ingredients with garlic and olive oil → Toss with cooked pasta → Add herbs and parmesan → Serve hot</p>
            </div>
        </div>
        <div class="suggestion-card">
            <h4>🥗 Fresh Garden Bowl</h4>
            <p>A nutritious and colorful salad that showcases your fresh ingredients with a homemade vinaigrette.</p>
            <div class="recipe-steps">
                <p><strong>Time:</strong> 15 minutes | <strong>Difficulty:</strong> Easy</p>
                <p><strong>Steps:</strong> Chop ingredients into bite-sized pieces → Make vinaigrette → Combine and toss → Let flavors meld for 5 minutes</p>
            </div>
        </div>
        <div class="suggestion-card">
            <h4>🍳 Hearty Stir-fry</h4>
            <p>An Asian-inspired stir-fry that makes the most of your ingredients with bold flavors and quick cooking.</p>
            <div class="recipe-steps">
                <p><strong>Time:</strong> 25 minutes | <strong>Difficulty:</strong> Medium</p>
                <p><strong>Steps:</strong> Prep all ingredients → Heat wok/pan → Stir-fry in order of cooking time → Add sauce and serve over rice</p>
            </div>
        </div>
        `,
        `
        <div class="suggestion-card">
            <h4>🍲 Warming Soup</h4>
            <p>A comforting soup that transforms your ingredients into a soul-warming meal perfect for any season.</p>
            <div class="recipe-steps">
                <p><strong>Time:</strong> 35 minutes | <strong>Difficulty:</strong> Easy</p>
                <p><strong>Steps:</strong> Sauté aromatics → Add ingredients and broth → Simmer until tender → Season and garnish</p>
            </div>
        </div>
        <div class="suggestion-card">
            <h4>🥙 Loaded Wrap</h4>
            <p>A portable and satisfying wrap that combines your ingredients with complementary flavors and textures.</p>
            <div class="recipe-steps">
                <p><strong>Time:</strong> 10 minutes | <strong>Difficulty:</strong> Easy</p>
                <p><strong>Steps:</strong> Prepare ingredients → Warm tortilla → Layer ingredients → Roll tightly and slice</p>
            </div>
        </div>
        <div class="suggestion-card">
            <h4>🍛 Rice Bowl Delight</h4>
            <p>A balanced and flavorful rice bowl that showcases your ingredients over perfectly cooked grains.</p>
            <div class="recipe-steps">
                <p><strong>Time:</strong> 30 minutes | <strong>Difficulty:</strong> Medium</p>
                <p><strong>Steps:</strong> Cook rice → Prepare ingredients separately → Combine over rice → Add sauce and toppings</p>
            </div>
        </div>
        `
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

// Recipe gallery functions
function renderRecipeGallery() {
    if (!homeGallery) return;

    const recipesToShow = getFilteredRecipes();
    homeGallery.innerHTML = recipesToShow.map(recipe => createRecipeCard(recipe)).join('');
    
    // Show/hide load more button
    const hasMoreRecipes = featuredRecipes.length > recipesToShow.length;
    if (loadMoreBtn) {
        loadMoreBtn.style.display = hasMoreRecipes ? 'block' : 'none';
    }
}

function getFilteredRecipes() {
    let filtered = currentFilter === 'all' 
        ? [...featuredRecipes] 
        : featuredRecipes.filter(recipe => recipe.category === currentFilter);
    
    // Initially show 6 recipes
    return filtered.slice(0, 6);
}

function createRecipeCard(recipe) {
    const gradient = getRecipeGradient(recipe.category);
    const comingSoonBadge = recipe.comingSoon ? '<div class="coming-soon-badge">Coming Soon</div>' : '';
    const clickHandler = recipe.comingSoon 
        ? `onclick="showComingSoon('${recipe.title}')"` 
        : recipe.link 
            ? `onclick="window.location.href='${recipe.link}'"` 
            : `onclick="viewRecipe(${recipe.id})"`;
    
    return `
        <div class="recipe-card ${recipe.comingSoon ? 'coming-soon' : ''}" ${clickHandler}>
            <div class="recipe-image ${gradient}">
                ${recipe.emoji}
            </div>
            <div class="recipe-info">
                <h3>${recipe.title}</h3>
                <p>${recipe.description}</p>
                <div class="recipe-meta">
                    <span class="time">⏱️ ${recipe.time}</span>
                    <span class="difficulty">📊 ${recipe.difficulty}</span>
                    <span class="category">#${recipe.category}</span>
                </div>
            </div>
            ${comingSoonBadge}
        </div>
    `;
}

function getRecipeGradient(category) {
    const gradients = {
        'Breakfast': 'recipe-breakfast',
        'Maincourse': 'recipe-maincourse', 
        'Salads': 'recipe-salads',
        'Snacks': 'recipe-snacks',
        'Desserts': 'recipe-desserts'
    };
    return gradients[category] || 'recipe-maincourse';
}

function setActiveFilter(category) {
    currentFilter = category;
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
}

function filterRecipes(category) {
    renderRecipeGallery();
}

function loadMoreRecipes() {
    loadMoreBtn.textContent = 'Loading...';
    loadMoreBtn.disabled = true;
    
    setTimeout(() => {
        // Get more recipes based on current filter
        const allFiltered = currentFilter === 'all' 
            ? [...featuredRecipes] 
            : featuredRecipes.filter(recipe => recipe.category === currentFilter);
        
        const currentCount = homeGallery.children.length;
        const moreRecipes = allFiltered.slice(currentCount, currentCount + 3);
        
        const newRecipesHTML = moreRecipes.map(recipe => createRecipeCard(recipe)).join('');
        homeGallery.innerHTML += newRecipesHTML;
        
        loadMoreBtn.textContent = 'Load More Recipes';
        loadMoreBtn.disabled = false;
        
        // Hide button if no more recipes
        if (homeGallery.children.length >= allFiltered.length) {
            loadMoreBtn.style.display = 'none';
        }
    }, 1000);
}

function viewRecipe(id) {
    const recipe = featuredRecipes.find(r => r.id === id);
    if (recipe) {
        if (recipe.link) {
            window.location.href = recipe.link;
        } else {
            showNotification(`${recipe.title} recipe page is being prepared. Check back soon!`, 'info');
        }
    }
}

function showComingSoon(recipeName) {
    showNotification(`${recipeName} recipe is coming soon! Follow us for updates when new recipes are added.`, 'info');
}

// User actions
function handleUpgrade() {
    showNotification('Premium upgrade feature coming soon! Integration with IntaSend payment gateway in progress.', 'info');
    closeProfileMenu();
}

function handleLogout() {
    currentUser = null;
    aiPromptCount = 0;
    localStorage.removeItem('smartrecipes_user');
    localStorage.removeItem('ai_prompt_count');
    updateProfileDisplay();
    closeProfileMenu();
    showNotification('You have been logged out successfully.', 'success');
}

// Utility functions
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
    `;
    
    // Add notification styles if they don't exist
    if (!document.querySelector('.notification-styles')) {
        const style = document.createElement('style');
        style.className = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                min-width: 300px;
                max-width: 500px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                border-left: 4px solid #4285f4;
                animation: slideIn 0.3s ease;
            }
            .notification.error { border-left-color: #e53e3e; }
            .notification.warning { border-left-color: #ed8936; }
            .notification.success { border-left-color: #38a169; }
            .notification-content {
                padding: 1rem;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 1rem;
            }
            .notification button {
                background: none;
                border: none;
                font-size: 1.2rem;
                cursor: pointer;
                color: #666;
                padding: 0;
                line-height: 1;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Setup animations and scroll effects
function setupAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements that should fade in
    const fadeElements = document.querySelectorAll('.recipe-card, .stat-card');
    fadeElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });
}

// Initialize smooth scrolling for anchor links
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