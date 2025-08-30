// Restaurant Partners Page JavaScript

// Sample restaurant data
const restaurantData = [
    {
        id: 1,
        name: "Mama Fatima's Kitchen",
        location: "Nairobi, Kenya",
        cuisine: "Somali Fusion",
        description: "Authentic Somali dishes with a modern twist, passed down through three generations. Famous for their aromatic rice dishes and tender goat meat preparations.",
        emoji: "🍛",
        recipeCount: 47,
        badge: "Featured",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        partnerSince: "2022"
    },
    {
        id: 2,
        name: "Ubuntu Bistro",
        location: "Cape Town, South Africa",
        cuisine: "Modern African",
        description: "Contemporary South African cuisine celebrating local ingredients. Our chefs reimagine traditional flavors for the modern palate.",
        emoji: "🌿",
        recipeCount: 32,
        badge: "Premium",
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        partnerSince: "2023"
    },
    {
        id: 3,
        name: "Nile Valley Delights",
        location: "Cairo, Egypt",
        cuisine: "Egyptian Traditional",
        description: "Experience the rich culinary heritage of Egypt with our traditional recipes from the Nile Delta region. Specializing in vegetarian and aromatic dishes.",
        emoji: "🏺",
        recipeCount: 28,
        badge: "Heritage",
        gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        partnerSince: "2021"
    },
    {
        id: 4,
        name: "Sahel Spice House",
        location: "Dakar, Senegal",
        cuisine: "West African",
        description: "Bold flavors and vibrant spices define our West African cuisine. From thieboudienne to perfectly spiced grilled meats.",
        emoji: "🌶️",
        recipeCount: 39,
        badge: "Spice Master",
        gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        partnerSince: "2022"
    },
    {
        id: 5,
        name: "Atlas Mountain Kitchen",
        location: "Marrakech, Morocco",
        cuisine: "Moroccan",
        description: "Traditional Berber and Arabic cuisines meet in our kitchen. Known for our tagines, couscous, and handcrafted pastries.",
        emoji: "🏔️",
        recipeCount: 41,
        badge: "Traditional",
        gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
        partnerSince: "2021"
    },
    {
        id: 6,
        name: "Lagos Street Kitchen",
        location: "Lagos, Nigeria",
        cuisine: "Nigerian Street Food",
        description: "Bringing authentic Nigerian street food to your home kitchen. From jollof rice to suya, we preserve the true taste of Nigeria.",
        emoji: "🛵",
        recipeCount: 35,
        badge: "Street Food",
        gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
        partnerSince: "2023"
    },
    {
        id: 7,
        name: "Ethiopian Highlands",
        location: "Addis Ababa, Ethiopia",
        cuisine: "Ethiopian",
        description: "Experience the communal dining culture of Ethiopia with our injera-based dishes and aromatic coffee ceremonies.",
        emoji: "☕",
        recipeCount: 26,
        badge: "Coffee Culture",
        gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
        partnerSince: "2022"
    },
    {
        id: 8,
        name: "Zanzibar Spice Route",
        location: "Stone Town, Tanzania",
        cuisine: "Swahili Fusion",
        description: "Where Arabic, Indian, and African flavors converge. Our spice-infused dishes tell the story of the ancient spice trade.",
        emoji: "🏝️",
        recipeCount: 31,
        badge: "Fusion",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        partnerSince: "2021"
    },
    {
        id: 9,
        name: "Kigali Garden Restaurant",
        location: "Kigali, Rwanda",
        cuisine: "Rwandan Modern",
        description: "Farm-to-table dining with a focus on sustainable local ingredients. Traditional Rwandan dishes with contemporary presentation.",
        emoji: "🌱",
        recipeCount: 24,
        badge: "Sustainable",
        gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
        partnerSince: "2023"
    }
];

// Additional restaurants for "load more" functionality
const additionalRestaurants = [
    {
        id: 10,
        name: "Accra Golden Kitchen",
        location: "Accra, Ghana",
        cuisine: "Ghanaian Traditional",
        description: "Celebrating Ghana's rich culinary traditions with dishes like banku, kenkey, and perfectly seasoned grilled tilapia.",
        emoji: "🐟",
        recipeCount: 29,
        badge: "Traditional",
        gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
        partnerSince: "2022"
    },
    {
        id: 11,
        name: "Tunis Medina Flavors",
        location: "Tunis, Tunisia",
        cuisine: "Tunisian",
        description: "Mediterranean meets North African in our coastal cuisine. Fresh seafood, harissa, and olive oil-rich dishes.",
        emoji: "🫒",
        recipeCount: 22,
        badge: "Coastal",
        gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        partnerSince: "2023"
    },
    {
        id: 12,
        name: "Bamako Riverside",
        location: "Bamako, Mali",
        cuisine: "Malian",
        description: "Traditional Malian cuisine featuring millet-based dishes, river fish preparations, and hearty stews perfect for communal dining.",
        emoji: "🐠",
        recipeCount: 18,
        badge: "River Fresh",
        gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        partnerSince: "2023"
    }
];

// Global state
let displayedRestaurants = 6;
let isLoading = false;

// DOM Elements
const restaurantsGrid = document.getElementById('restaurantsGrid');
const loadMoreBtn = document.getElementById('loadMoreRestaurants');
const partnershipForm = document.getElementById('partnershipForm');

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeRestaurants();
    setupEventListeners();
    setupAnimations();
    loadUserProfile();
});

// Load user profile from main.js
function loadUserProfile() {
    const currentUser = JSON.parse(localStorage.getItem('smartrecipes_user'));
    const aiPromptCount = parseInt(localStorage.getItem('ai_prompt_count')) || 0;
    
    if (currentUser) {
        updateProfileDisplay(currentUser, aiPromptCount);
    }
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

// Initialize restaurants display
function initializeRestaurants() {
    if (!restaurantsGrid) return;
    
    renderRestaurants(restaurantData.slice(0, displayedRestaurants));
    updateLoadMoreButton();
}

// Render restaurants to grid
function renderRestaurants(restaurants) {
    const restaurantHTML = restaurants.map(restaurant => createRestaurantCard(restaurant)).join('');
    
    if (displayedRestaurants <= 6) {
        restaurantsGrid.innerHTML = restaurantHTML;
    } else {
        restaurantsGrid.innerHTML += restaurantHTML;
    }
}

// Create individual restaurant card
function createRestaurantCard(restaurant) {
    return `
        <div class="restaurant-card" data-id="${restaurant.id}" onclick="viewRestaurant(${restaurant.id})">
            <div class="restaurant-image" style="background: ${restaurant.gradient}">
                ${restaurant.emoji}
                <div class="restaurant-badge">${restaurant.badge}</div>
            </div>
            <div class="restaurant-info">
                <h3 class="restaurant-name">${restaurant.name}</h3>
                <div class="restaurant-location">📍 ${restaurant.location}</div>
                <p class="restaurant-description">${restaurant.description}</p>
                <div class="restaurant-meta">
                    <span class="recipe-count">${restaurant.recipeCount} Recipes</span>
                    <span class="cuisine-type">${restaurant.cuisine}</span>
                </div>
            </div>
        </div>
    `;
}

// Setup event listeners
function setupEventListeners() {
    // Load more restaurants
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreRestaurants);
    }

    // Partnership form submission
    if (partnershipForm) {
        partnershipForm.addEventListener('submit', handlePartnershipSubmission);
    }

    // Mobile navigation (reuse from main.js)
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mainNav = document.getElementById('mainNav');
    
    if (hamburgerBtn && mainNav) {
        hamburgerBtn.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            hamburgerBtn.classList.toggle('active');
        });
    }

    // Profile menu functionality (reuse from main.js)
    const profileBtn = document.getElementById('profileBtn');
    const profileMenu = document.getElementById('profileMenu');
    
    if (profileBtn && profileMenu) {
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const isVisible = profileMenu.style.display === 'block';
            profileMenu.style.display = isVisible ? 'none' : 'block';
        });

        // Close profile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!profileMenu.contains(e.target) && !profileBtn.contains(e.target)) {
                profileMenu.style.display = 'none';
            }
        });
    }

    // Origin cards interaction
    const originCards = document.querySelectorAll('.origin-card');
    originCards.forEach(card => {
        card.addEventListener('click', function() {
            const region = this.dataset.region;
            filterRestaurantsByRegion(region);
        });
    });
}

// Load more restaurants
function loadMoreRestaurants() {
    if (isLoading) return;
    
    isLoading = true;
    loadMoreBtn.textContent = 'Loading More Partners...';
    loadMoreBtn.disabled = true;
    
    setTimeout(() => {
        const allRestaurants = [...restaurantData, ...additionalRestaurants];
        const nextBatch = allRestaurants.slice(displayedRestaurants, displayedRestaurants + 3);
        
        if (nextBatch.length > 0) {
            renderRestaurants(nextBatch);
            displayedRestaurants += nextBatch.length;
            
            // Add animation to new cards
            setTimeout(() => {
                const newCards = restaurantsGrid.querySelectorAll('.restaurant-card');
                const startIndex = Math.max(0, newCards.length - nextBatch.length);
                
                for (let i = startIndex; i < newCards.length; i++) {
                    newCards[i].style.opacity = '0';
                    newCards[i].style.transform = 'translateY(30px)';
                    
                    setTimeout(() => {
                        newCards[i].style.transition = 'all 0.6s ease';
                        newCards[i].style.opacity = '1';
                        newCards[i].style.transform = 'translateY(0)';
                    }, (i - startIndex) * 100);
                }
            }, 100);
        }
        
        updateLoadMoreButton();
        isLoading = false;
    }, 1500);
}

// Update load more button state
function updateLoadMoreButton() {
    const allRestaurants = [...restaurantData, ...additionalRestaurants];
    
    if (displayedRestaurants >= allRestaurants.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.textContent = 'Discover More Partners';
        loadMoreBtn.disabled = false;
        loadMoreBtn.style.display = 'block';
    }
}

// View individual restaurant (placeholder)
function viewRestaurant(id) {
    const restaurant = [...restaurantData, ...additionalRestaurants].find(r => r.id === id);
    if (restaurant) {
        showNotification(`${restaurant.name} detailed profile coming soon! We're building individual restaurant pages with full recipe collections.`, 'info');
    }
}

// Filter restaurants by region
function filterRestaurantsByRegion(region) {
    const regionMappings = {
        'east-africa': ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Ethiopia'],
        'west-africa': ['Nigeria', 'Ghana', 'Senegal', 'Mali'],
        'north-africa': ['Egypt', 'Morocco', 'Tunisia'],
        'mediterranean': ['Morocco', 'Tunisia'],
        'modern-african': ['South Africa', 'Kenya', 'Rwanda']
    };
    
    const targetCountries = regionMappings[region] || [];
    const filteredRestaurants = [...restaurantData, ...additionalRestaurants].filter(restaurant => 
        targetCountries.some(country => restaurant.location.includes(country))
    );
    
    if (filteredRestaurants.length > 0) {
        restaurantsGrid.innerHTML = '';
        renderRestaurants(filteredRestaurants);
        loadMoreBtn.style.display = 'none';
        
        // Show reset button
        if (!document.getElementById('resetFilter')) {
            const resetBtn = document.createElement('button');
            resetBtn.id = 'resetFilter';
            resetBtn.className = 'btn ghost';
            resetBtn.textContent = 'Show All Restaurants';
            resetBtn.onclick = resetRestaurantFilter;
            loadMoreBtn.parentNode.insertBefore(resetBtn, loadMoreBtn);
        }
        
        showNotification(`Showing ${filteredRestaurants.length} restaurants from ${region.replace('-', ' ')} region`, 'info');
    } else {
        showNotification('No restaurants found for this region yet. More partners joining soon!', 'info');
    }
}

// Reset restaurant filter
function resetRestaurantFilter() {
    displayedRestaurants = 6;
    initializeRestaurants();
    
    const resetBtn = document.getElementById('resetFilter');
    if (resetBtn) {
        resetBtn.remove();
    }
}

// Handle partnership form submission
function handlePartnershipSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(partnershipForm);
    const partnershipData = {
        restaurantName: formData.get('restaurantName'),
        contactName: formData.get('contactName'),
        contactEmail: formData.get('contactEmail'),
        phone: formData.get('phone'),
        location: formData.get('location'),
        cuisine: formData.get('cuisine'),
        partnership: formData.get('partnership'),
        description: formData.get('description'),
        terms: formData.get('terms'),
        newsletter: formData.get('newsletter'),
        submissionDate: new Date().toISOString()
    };
    
    // Validate required fields
    const requiredFields = ['restaurantName', 'contactName', 'contactEmail', 'location', 'cuisine', 'partnership', 'description'];
    const missingFields = requiredFields.filter(field => !partnershipData[field]);
    
    if (missingFields.length > 0) {
        showNotification('Please fill in all required fields marked with *', 'error');
        return;
    }
    
    if (!partnershipData.terms) {
        showNotification('Please accept the Terms of Service to continue', 'error');
        return;
    }
    
    // Simulate form submission
    const submitBtn = partnershipForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Submitting Application...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        // Store application data locally (in real app, would send to server)
        const applications = JSON.parse(localStorage.getItem('partnership_applications') || '[]');
        applications.push(partnershipData);
        localStorage.setItem('partnership_applications', JSON.stringify(applications));
        
        // Show success message
        showNotification(`Thank you ${partnershipData.contactName}! Your partnership application for ${partnershipData.restaurantName} has been submitted successfully. We'll review it within 2-3 business days.`, 'success');
        
        // Reset form
        partnershipForm.reset();
        
        // Scroll to top of form
        partnershipForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// Setup scroll animations
function setupAnimations() {
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

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.restaurant-card, .origin-card, .success-card, .benefit-item, .tier-card, .contact-card');
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });

    // Parallax effect for hero section
    const hero = document.querySelector('.restaurant-hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        });
    }

    // Floating cards animation
    const floatingCards = document.querySelectorAll('.floating-card');
    floatingCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.5}s`;
    });
}

// Notification system
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
                animation: slideInRight 0.3s ease;
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
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 7 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 7000);
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

// Add some interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to statistics
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        stat.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        stat.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // Add typing effect to hero title (optional enhancement)
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && window.innerWidth > 768) {
        const originalText = heroTitle.textContent;
        heroTitle.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < originalText.length) {
                heroTitle.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        
        // Start typing effect after a short delay
        setTimeout(typeWriter, 500);
    }
    
    // Add progress indicators for partnership tiers
    const tierCards = document.querySelectorAll('.tier-card');
    tierCards.forEach(card => {
        card.addEventListener('click', function() {
            const tierName = this.querySelector('h3').textContent;
            const partnershipSelect = document.getElementById('partnership');
            
            if (partnershipSelect) {
                // Scroll to form
                document.getElementById('advertise').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Highlight the form
                setTimeout(() => {
                    const form = document.querySelector('.advertise-form');
                    form.style.boxShadow = '0 0 20px rgba(66, 133, 244, 0.3)';
                    form.style.border = '2px solid #4285f4';
                    
                    // Select appropriate partnership level
                    if (tierName.includes('Basic')) {
                        partnershipSelect.value = 'basic';
                    } else if (tierName.includes('Premium')) {
                        partnershipSelect.value = 'premium';
                    } else if (tierName.includes('Enterprise')) {
                        partnershipSelect.value = 'enterprise';
                    }
                    
                    // Remove highlight after 3 seconds
                    setTimeout(() => {
                        form.style.boxShadow = '0 20px 60px rgba(0,0,0,0.1)';
                        form.style.border = 'none';
                    }, 3000);
                }, 1000);
            }
        });
    });
});