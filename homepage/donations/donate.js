// Donations Page JavaScript

// Supabase Client Configuration
const SUPABASE_URL = 'https://hrfvkblkpihdzcuodwzz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZnZrYmxrcGloZHpjdW9kd3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzODg1MzUsImV4cCI6MjA3MTk2NDUzNX0.n8bIKKS1UkGYyQnP-Dbis5kl5AqvYVovSeefa_sVTZE';

// Initialize Supabase client (you'll need to replace with your actual credentials)
let supabaseClient = null;
try {
    // Check if Supabase is available
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
} catch (error) {
    console.log('Supabase not available, using localStorage fallback');
}

// Sample events data (expanded from your template)
const events = [
    {
        id: 1,
        title: "Emergency Food Relief - Turkana County",
        description: "Providing emergency food packages to drought-affected families in Turkana County. Each package feeds a family of 6 for one week.",
        goal: 5000,
        raised: 3250,
        location: "Turkana County, Kenya",
        urgency: "high",
        image: "🚨",
        daysLeft: 12,
        donorsCount: 127
    },
    {
        id: 2,
        title: "School Feeding Program - Kibera",
        description: "Daily nutritious meals for 200 children at Kibera Primary School. Supporting education through proper nutrition.",
        goal: 2500,
        raised: 1890,
        location: "Kibera, Nairobi",
        urgency: "moderate",
        image: "🏫",
        daysLeft: 25,
        donorsCount: 89
    },
    {
        id: 3,
        title: "Community Kitchen Setup - Mathare",
        description: "Establishing a fully equipped community kitchen where local mothers can prepare nutritious meals for their families and learn new cooking skills.",
        goal: 3500,
        raised: 1200,
        location: "Mathare, Nairobi",
        urgency: "low",
        image: "👩‍🍳",
        daysLeft: 45,
        donorsCount: 45
    },
    {
        id: 4,
        title: "Cooking Skills Workshop Series",
        description: "Monthly workshops teaching nutrition, food safety, and budget-friendly cooking to 50 community members each session.",
        goal: 1500,
        raised: 890,
        location: "Mombasa, Kenya",
        urgency: "moderate",
        image: "📚",
        daysLeft: 18,
        donorsCount: 34
    },
    {
        id: 5,
        title: "Sustainable Garden Project",
        description: "Supporting 25 families to establish home gardens with drought-resistant crops, providing long-term food security.",
        goal: 4000,
        raised: 2100,
        location: "Machakos County, Kenya",
        urgency: "low",
        image: "🌱",
        daysLeft: 30,
        donorsCount: 67
    }
];

// Store donation history and user data
let donationHistory = JSON.parse(localStorage.getItem('donation_history') || '[]');
let userDonationTotal = parseFloat(localStorage.getItem('user_donation_total') || '0');
let userCampaignsSupported = JSON.parse(localStorage.getItem('user_campaigns_supported') || '[]');

// Current donation state
let currentEventId = null;
let selectedAmount = 0;

// DOM Elements
const eventsGrid = document.getElementById('eventsGrid');
const donationHistoryList = document.getElementById('donationHistory');
const donationModal = document.getElementById('donationModal');
const overlay = document.getElementById('overlay');

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    displayEvents();
    displayHistory();
    setupEventListeners();
    setupAnimations();
    
    // Setup authentication listener
    setupAuthListener();
    
    // Load user profile with enhanced functionality
    await checkAuthStatus();
    
    animateHeroStats();
});

// Load user profile
function loadUserProfile() {
    const currentUser = JSON.parse(localStorage.getItem('smartrecipes_user'));
    
    if (currentUser) {
        updateProfileDisplay(currentUser);
    }
    
    // Update donation-specific profile info
    const pmTotalDonated = document.getElementById('pmTotalDonated');
    const pmCampaignsSupported = document.getElementById('pmCampaignsSupported');
    
    if (pmTotalDonated) {
        pmTotalDonated.textContent = `$${userDonationTotal.toFixed(2)}`;
    }
    
    if (pmCampaignsSupported) {
        pmCampaignsSupported.textContent = userCampaignsSupported.length;
    }
}

function updateProfileDisplay(user) {
    const elements = {
        avatarCircle: document.getElementById('avatarCircle'),
        avatarCircleMenu: document.getElementById('avatarCircleMenu'),
        pmName: document.getElementById('pmName'),
        pmUsername: document.getElementById('pmUsername'),
        pmEmail: document.getElementById('pmEmail'),
        pmAccountType: document.getElementById('pmAccountType')
    };

    if (elements.avatarCircle) {
        const initials = user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
        elements.avatarCircle.textContent = initials;
        elements.avatarCircleMenu.textContent = initials;
        elements.pmName.textContent = user.fullName || 'User';
        elements.pmUsername.textContent = `@${user.username || 'user'}`;
        elements.pmEmail.textContent = user.email || 'user@example.com';
        
        // Add account type display if element exists
        if (elements.pmAccountType) {
            elements.pmAccountType.textContent = user.accountType || 'Free';
            elements.pmAccountType.className = `badge ${user.accountType === 'Premium' ? 'premium' : 'free'}`;
        }
    }
}

// Show guest profile when no user is logged in
function showGuestProfile() {
    const elements = {
        avatarCircle: document.getElementById('avatarCircle'),
        avatarCircleMenu: document.getElementById('avatarCircleMenu'),
        pmName: document.getElementById('pmName'),
        pmUsername: document.getElementById('pmUsername'),
        pmEmail: document.getElementById('pmEmail'),
        pmAccountType: document.getElementById('pmAccountType')
    };

    if (elements.avatarCircle) {
        elements.avatarCircle.textContent = 'G';
        elements.avatarCircleMenu.textContent = 'G';
        elements.avatarCircle.style.background = 'linear-gradient(135deg, #718096, #a0aec0)';
        elements.avatarCircleMenu.style.background = 'linear-gradient(135deg, #718096, #a0aec0)';
        elements.pmName.textContent = 'Guest User';
        elements.pmUsername.textContent = '@guest';
        elements.pmEmail.textContent = 'guest@example.com';
        
        // Add account type if element exists
        if (elements.pmAccountType) {
            elements.pmAccountType.textContent = 'Guest';
            elements.pmAccountType.className = 'badge guest';
        }
    }
}

// Update donation-specific profile information
function updateDonationProfileInfo() {
    const pmTotalDonated = document.getElementById('pmTotalDonated');
    const pmCampaignsSupported = document.getElementById('pmCampaignsSupported');
    
    if (pmTotalDonated) {
        pmTotalDonated.textContent = `$${userDonationTotal.toFixed(2)}`;
    }
    
    if (pmCampaignsSupported) {
        pmCampaignsSupported.textContent = userCampaignsSupported.length;
    }
}

// Enhanced user profile loading with Supabase integration
async function loadUserProfileEnhanced() {
    try {
        // First try to get user from Supabase if available
        if (supabaseClient) {
            const { data: { user }, error } = await supabaseClient.auth.getUser();
            
            if (user && !error) {
                // Fetch detailed user profile from user_profiles table
                const { data: profileData, error: profileError } = await supabaseClient
                    .from('user_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                
                if (profileData && !profileError) {
                    // Create comprehensive user object
                    const userProfile = {
                        id: user.id,
                        email: user.email,
                        fullName: profileData.full_name || 'User',
                        username: profileData.username || user.email.split('@')[0],
                        accountType: profileData.account_type || 'Free',
                        createdAt: profileData.created_at,
                        updatedAt: profileData.updated_at,
                        // Additional profile fields
                        contact: profileData.contact || null,
                        address: profileData.address || null,
                        gender: profileData.gender || null,
                        dob: profileData.dob || null
                    };
                    
                    // Store in localStorage for consistency
                    localStorage.setItem('smartrecipes_user', JSON.stringify(userProfile));
                    updateProfileDisplay(userProfile);
                } else {
                    // Fallback to basic user data
                    const basicUser = {
                        id: user.id,
                        email: user.email,
                        fullName: user.user_metadata?.full_name || 'User',
                        username: user.email.split('@')[0],
                        accountType: user.user_metadata?.account_type || 'Free',
                        createdAt: user.created_at
                    };
                    
                    localStorage.setItem('smartrecipes_user', JSON.stringify(basicUser));
                    updateProfileDisplay(basicUser);
                }
            } else {
                // No authenticated user, check localStorage
                const localUser = JSON.parse(localStorage.getItem('smartrecipes_user'));
                if (localUser) {
                    updateProfileDisplay(localUser);
                } else {
                    // Show guest profile
                    showGuestProfile();
                }
            }
        } else {
            // Supabase not available, use localStorage
            const localUser = JSON.parse(localStorage.getItem('smartrecipes_user'));
            if (localUser) {
                updateProfileDisplay(localUser);
            } else {
                showGuestProfile();
            }
        }
        
        // Update donation-specific profile info
        updateDonationProfileInfo();
        
    } catch (error) {
        console.error('Error loading user profile:', error);
        // Fallback to localStorage
        const localUser = JSON.parse(localStorage.getItem('smartrecipes_user'));
        if (localUser) {
            updateProfileDisplay(localUser);
        } else {
            showGuestProfile();
        }
        updateDonationProfileInfo();
    }
}

// Check user authentication status
async function checkAuthStatus() {
    try {
        if (supabaseClient) {
            const { data: { session }, error } = await supabaseClient.auth.getSession();
            
            if (session && !error) {
                // User is authenticated, load enhanced profile
                await loadUserProfileEnhanced();
                return true;
            } else {
                // No active session
                const localUser = JSON.parse(localStorage.getItem('smartrecipes_user'));
                if (localUser) {
                    updateProfileDisplay(localUser);
                } else {
                    showGuestProfile();
                }
                return false;
            }
        } else {
            // Supabase not available, check localStorage
            const localUser = JSON.parse(localStorage.getItem('smartrecipes_user'));
            if (localUser) {
                updateProfileDisplay(localUser);
                return true;
            } else {
                showGuestProfile();
                return false;
            }
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        return false;
    }
}

// Function to refresh user profile data
async function refreshUserProfile() {
    try {
        await checkAuthStatus();
        updateDonationProfileInfo();
        showNotification('Profile refreshed successfully!', 'success');
    } catch (error) {
        console.error('Error refreshing profile:', error);
        showNotification('Failed to refresh profile. Please try again.', 'error');
    }
}

// Setup authentication state listener
function setupAuthListener() {
    if (supabaseClient) {
        supabaseClient.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session);
            
            if (event === 'SIGNED_IN' && session) {
                // User signed in, refresh profile
                await loadUserProfileEnhanced();
            } else if (event === 'SIGNED_OUT') {
                // User signed out, show guest profile
                showGuestProfile();
                updateDonationProfileInfo();
            } else if (event === 'TOKEN_REFRESHED' && session) {
                // Token refreshed, update profile if needed
                await checkAuthStatus();
            }
        });
    }
}

// Display events
function displayEvents() {
    if (!eventsGrid) return;
    
    const eventsHTML = events.map(event => createEventCard(event)).join('');
    eventsGrid.innerHTML = eventsHTML;
}

// Create individual event card
function createEventCard(event) {
    const progress = Math.round((event.raised / event.goal) * 100);
    const urgencyClass = event.urgency;
    const urgencyText = {
        high: 'URGENT',
        moderate: 'ACTIVE',
        low: 'ONGOING'
    };
    
    return `
        <div class="event-card" data-id="${event.id}">
            <div class="event-header">
                <div class="event-urgency ${urgencyClass}">${urgencyText[event.urgency]}</div>
                <h3>${event.title}</h3>
                <div class="event-location">📍 ${event.location}</div>
            </div>
            <div class="event-body">
                <div class="event-image">${event.image}</div>
                <p class="event-description">${event.description}</p>
                
                <div class="progress-container">
                    <div class="progress-header">
                        <span class="progress-amounts">${event.raised.toLocaleString()} / ${event.goal.toLocaleString()}</span>
                        <span class="progress-percentage">${progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                
                <div class="event-meta">
                    <div class="meta-item">
                        <strong>${event.donorsCount}</strong> donors
                    </div>
                    <div class="meta-item">
                        <strong>${event.daysLeft}</strong> days left
                    </div>
                </div>
                
                <div class="donation-form">
                    <div class="donation-input">
                        <label for="donation-${event.id}">Donation Amount (USD)</label>
                        <input type="number" id="donation-${event.id}" placeholder="Enter amount" min="1">
                    </div>
                    <button class="btn primary" onclick="openDonationModal(${event.id})">Donate</button>
                </div>
            </div>
        </div>
    `;
}

// Setup event listeners
function setupEventListeners() {
    // Mobile navigation
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mainNav = document.getElementById('mainNav');
    
    if (hamburgerBtn && mainNav) {
        hamburgerBtn.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            hamburgerBtn.classList.toggle('active');
        });
    }

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // Close mobile menu if open
                if (mainNav && mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    hamburgerBtn.classList.remove('active');
                }
                
                // Smooth scroll to section
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Profile menu functionality
    const profileBtn = document.getElementById('profileBtn');
    const profileMenu = document.getElementById('profileMenu');
    
    if (profileBtn && profileMenu) {
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            profileMenu.classList.toggle('active');
        });

        document.addEventListener('click', function(e) {
            if (!profileMenu.contains(e.target) && !profileBtn.contains(e.target)) {
                profileMenu.classList.remove('active');
            }
        });
    }

    // Modal event listeners
    if (donationModal) {
        // Quick amount buttons
        const amountBtns = donationModal.querySelectorAll('.amount-btn');
        amountBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                amountBtns.forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                selectedAmount = parseFloat(this.dataset.amount);
                document.getElementById('customAmount').value = selectedAmount;
            });
        });

        // Custom amount input
        const customAmountInput = document.getElementById('customAmount');
        if (customAmountInput) {
            customAmountInput.addEventListener('input', function() {
                selectedAmount = parseFloat(this.value) || 0;
                amountBtns.forEach(btn => {
                    btn.classList.toggle('selected', parseFloat(btn.dataset.amount) === selectedAmount);
                });
            });
        }

        // Process donation button
        const processDonationBtn = document.getElementById('processDonation');
        if (processDonationBtn) {
            processDonationBtn.addEventListener('click', processDonation);
        }
    }

    // Close modal when clicking overlay
    if (overlay) {
        overlay.addEventListener('click', closeDonationModal);
    }
}

// Open donation modal
function openDonationModal(eventId) {
    currentEventId = eventId;
    const event = events.find(e => e.id === eventId);
    
    if (event) {
        document.getElementById('modalTitle').textContent = `Donate to: ${event.title}`;
        donationModal.style.display = 'block';
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Reset form
        selectedAmount = 0;
        document.getElementById('customAmount').value = '';
        document.querySelectorAll('.amount-btn').forEach(btn => btn.classList.remove('selected'));
        
        // Focus on first amount button
        setTimeout(() => {
            document.querySelector('.amount-btn').focus();
        }, 100);
    }
}

// Close donation modal
function closeDonationModal() {
    donationModal.style.display = 'none';
    overlay.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentEventId = null;
    selectedAmount = 0;
}

// Process donation
function processDonation() {
    const donorName = document.getElementById('donorName').value.trim();
    const donorEmail = document.getElementById('donorEmail').value.trim();
    const isAnonymous = document.getElementById('anonymous').checked;
    const amount = selectedAmount || parseFloat(document.getElementById('customAmount').value);
    
    // Validation
    if (!amount || amount <= 0) {
        showNotification('Please enter a valid donation amount.', 'error');
        return;
    }
    
    if (!isAnonymous && (!donorName || !donorEmail)) {
        showNotification('Please fill in your contact information or check anonymous donation.', 'error');
        return;
    }
    
    if (!isAnonymous && !isValidEmail(donorEmail)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }
    
    // Find the event and update it
    const event = events.find(e => e.id === currentEventId);
    if (!event) return;
    
    // Simulate processing
    const processDonationBtn = document.getElementById('processDonation');
    const originalText = processDonationBtn.textContent;
    
    processDonationBtn.textContent = 'Processing...';
    processDonationBtn.disabled = true;
    
    setTimeout(() => {
        // Update event data
        event.raised += amount;
        event.donorsCount += 1;
        
        // Update user totals
        userDonationTotal += amount;
        if (!userCampaignsSupported.includes(currentEventId)) {
            userCampaignsSupported.push(currentEventId);
        }
        
        // Add to donation history
        const donation = {
            eventId: currentEventId,
            eventTitle: event.title,
            amount: amount,
            donorName: isAnonymous ? 'Anonymous' : donorName,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };
        
        donationHistory.unshift(donation);
        
        // Save to localStorage
        localStorage.setItem('donation_history', JSON.stringify(donationHistory));
        localStorage.setItem('user_donation_total', userDonationTotal.toString());
        localStorage.setItem('user_campaigns_supported', JSON.stringify(userCampaignsSupported));
        
        // Show success and update displays
        showNotification(`🎉 Thank you for donating ${amount} to "${event.title}"! Your contribution will make a real difference.`, 'success');
        
        displayEvents();
        displayHistory();
        loadUserProfile();
        
        // Close modal
        closeDonationModal();
        
        // Celebrate the donation
        celebrateDonation(amount);
        
        processDonationBtn.textContent = originalText;
        processDonationBtn.disabled = false;
    }, 2000);
}

// Celebrate donation with confetti effect
function celebrateDonation(amount) {
    // Create celebration message
    const celebration = document.createElement('div');
    celebration.className = 'celebration-message';
    celebration.innerHTML = `
        <div class="celebration-content">
            <div class="celebration-icon">🎉</div>
            <h3>Thank You!</h3>
            <p>Your ${amount} donation is making a difference right now!</p>
        </div>
    `;
    
    // Add celebration styles
    if (!document.querySelector('.celebration-styles')) {
        const style = document.createElement('style');
        style.className = 'celebration-styles';
        style.textContent = `
            .celebration-message {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0);
                background: white;
                border-radius: 20px;
                padding: 3rem;
                text-align: center;
                z-index: 10000;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: celebrationPop 3s ease forwards;
            }
            .celebration-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
                animation: bounce 1s ease infinite;
            }
            .celebration-content h3 {
                color: #38a169;
                font-size: 2rem;
                margin-bottom: 1rem;
            }
            .celebration-content p {
                color: #4a5568;
                font-size: 1.2rem;
            }
            @keyframes celebrationPop {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                20% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
                25% { transform: translate(-50%, -50%) scale(1); }
                80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            }
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(celebration);
    
    setTimeout(() => {
        if (document.body.contains(celebration)) {
            celebration.remove();
        }
    }, 3000);
}

// Display donation history
function displayHistory() {
    if (!donationHistoryList) return;
    
    donationHistoryList.innerHTML = '';
    
    if (donationHistory.length === 0) {
        donationHistoryList.innerHTML = '<li class="no-donations">No donations yet. Start making a difference today!</li>';
        return;
    }
    
    // Show last 10 donations
    const recentDonations = donationHistory.slice(0, 10);
    
    recentDonations.forEach(donation => {
        const li = document.createElement('li');
        const date = new Date(donation.date).toLocaleDateString();
        const time = new Date(donation.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        li.innerHTML = `
            <div class="donation-item">
                <div class="donation-main">
                    <strong>${donation.amount}</strong> → ${donation.eventTitle}
                </div>
                <div class="donation-meta">
                    ${date} at ${time} • by ${donation.donorName}
                </div>
            </div>
        `;
        donationHistoryList.appendChild(li);
    });
}

// Animate hero statistics
function animateHeroStats() {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    });
    
    statNumbers.forEach(stat => observer.observe(stat));
}

// Animate counter function
function animateCounter(element) {
    const target = parseInt(element.dataset.target);
    const duration = 2000;
    const start = Date.now();
    
    function updateCounter() {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(target * easeOut);
        
        element.textContent = current.toLocaleString();
        element.style.animation = 'countUp 0.1s ease';
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString();
        }
    }
    
    updateCounter();
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
                
                // Special animation for progress bars
                if (entry.target.classList.contains('event-card')) {
                    const progressFill = entry.target.querySelector('.progress-fill');
                    if (progressFill) {
                        setTimeout(() => {
                            progressFill.style.width = progressFill.style.width;
                        }, 300);
                    }
                }
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.event-card, .impact-card, .story-card, .way-card, .contact-card');
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });
}

// Helper function to validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Utility function to scroll to sections
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Placeholder functions for future features
function setupMonthlyDonation() {
    showNotification('Monthly donation partnerships coming soon! For now, please consider making regular one-time donations.', 'info');
}

function contributeRecipe() {
    showNotification('Recipe contribution program launching next month! Follow us for updates.', 'info');
}

function volunteerSignup() {
    showNotification('Volunteer program registration will be available soon. Contact volunteers@smartrecipes.com for early access.', 'info');
}

function corporatePartnership() {
    window.open('mailto:corporate@smartrecipes.com?subject=Corporate Partnership Inquiry&body=Hi, I\'m interested in learning more about corporate partnership opportunities with SmartRecipes.', '_blank');
}

function shareAwareness() {
    if (navigator.share) {
        navigator.share({
            title: 'SmartRecipes - Fighting Hunger Through Food',
            text: 'Join us in fighting hunger and food insecurity across Africa. Every donation helps provide nutritious meals and cooking education.',
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        const shareText = `Join SmartRecipes in fighting hunger across Africa! 🌍 Every donation provides nutritious meals and cooking education to those who need it most. ${window.location.href}`;
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('Share text copied to clipboard!', 'success');
        });
    }
}

// Logout function
async function logout() {
    try {
        // If Supabase is available, sign out the user
        if (supabaseClient) {
            const { error } = await supabaseClient.auth.signOut();
            if (error) {
                console.error('Error signing out:', error);
            }
        }
        
        // Clear local storage
        localStorage.removeItem('smartrecipes_user');
        localStorage.removeItem('ai_prompt_count');
        localStorage.removeItem('donation_history');
        localStorage.removeItem('user_donation_total');
        localStorage.removeItem('user_campaigns_supported');
        
        // Reset donation data
        userDonationTotal = 0;
        userCampaignsSupported = [];
        donationHistory = [];
        
        // Show guest profile
        showGuestProfile();
        
        // Redirect to main page
        window.location.href = '../mainpage/main.html';
        
    } catch (error) {
        console.error('Logout error:', error);
        // Fallback logout
        localStorage.removeItem('smartrecipes_user');
        localStorage.removeItem('ai_prompt_count');
        window.location.href = '../mainpage/main.html';
    }
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
            <button onclick="this.parentElement.parentElement.remove()">×</button>
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
            .notification.info { border-left-color: #4285f4; }
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
    
    // Auto remove after 6 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 6000);
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

// Add additional interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to impact cards
    const impactCards = document.querySelectorAll('.impact-card');
    impactCards.forEach(card => {
        card.addEventListener('click', function() {
            const amount = this.querySelector('.impact-amount').textContent.replace(/,/g, '');
            // Auto-fill the first event's donation form
            const firstEventInput = document.querySelector('[id^="donation-"]');
            if (firstEventInput) {
                firstEventInput.value = amount;
                firstEventInput.focus();
                firstEventInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Highlight the input briefly
                firstEventInput.style.borderColor = '#38a169';
                firstEventInput.style.boxShadow = '0 0 0 3px rgba(56, 161, 105, 0.2)';
                
                setTimeout(() => {
                    firstEventInput.style.borderColor = '#e2e8f0';
                    firstEventInput.style.boxShadow = 'none';
                }, 2000);
            }
        });
    });
    
    // Add real-time progress bar animations when visible
    const progressBars = document.querySelectorAll('.progress-fill');
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = width;
                }, 500);
            }
        });
    });
    
    progressBars.forEach(bar => progressObserver.observe(bar));
    
    // Add keyboard navigation for modal
    document.addEventListener('keydown', function(e) {
        if (donationModal.style.display === 'block') {
            if (e.key === 'Escape') {
                closeDonationModal();
            }
        }
    });
    
    // Add dynamic urgency updates (simulated)
    setInterval(() => {
        events.forEach(event => {
            if (event.daysLeft > 0) {
                // Simulate time passing (for demo purposes)
                // In real app, this would come from server
                if (Math.random() < 0.1) { // 10% chance every interval
                    const randomDonation = Math.floor(Math.random() * 50) + 10;
                    if (event.raised < event.goal) {
                        event.raised = Math.min(event.raised + randomDonation, event.goal);
                        event.donorsCount += 1;
                        displayEvents();
                    }
                }
            }
        });
    }, 30000); // Every 30 seconds
});