// Configuration - IntaSend API configuration
const INTASEND_CONFIG = {
    publicKey: 'YOUR_INTASEND_PUBLIC_KEY', // Replace with your IntaSend public key
    testMode: true, // Set to false for production
    currency: 'SDG'
};

// Global state
let currentUser = JSON.parse(localStorage.getItem('smartrecipes_user')) || null;
let isAnnualBilling = false;
let selectedPlan = null;

// Pricing data
const pricingPlans = {
    premium: {
        monthly: { amount: 49, period: 'month' },
        annual: { amount: 39, period: 'month', yearlyTotal: 468 }
    },
    pro: {
        monthly: { amount: 99, period: 'month' },
        annual: { amount: 79, period: 'month', yearlyTotal: 948 }
    }
};

// DOM Elements
const billingToggle = document.getElementById('billingToggle');
const premiumBtn = document.getElementById('premiumBtn');
const proBtn = document.getElementById('proBtn');
const paymentModal = document.getElementById('paymentModal');
const paymentCloseBtn = document.getElementById('paymentCloseBtn');
const paymentForm = document.getElementById('paymentForm');
const successModal = document.getElementById('successModal');
const continueBtn = document.getElementById('continueBtn');
const overlay = document.getElementById('overlay');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeUser();
    setupEventListeners();
    setupFAQs();
    updatePricingDisplay();
    setupAnimations();
});

// User management
function initializeUser() {
    // Load user from localStorage
    const user = JSON.parse(localStorage.getItem('smartrecipes_user'));
    if (user) {
        currentUser = user;
        updateProfileDisplay();
        
        // If user is already premium, show different messaging
        if (user.accountType === 'Premium' || user.accountType === 'Pro') {
            showCurrentPremiumStatus();
        }
    } else {
        updateProfileDisplay();
    }
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

    if (currentUser) {
        const initials = currentUser.fullName ? currentUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
        if (avatarCircle) avatarCircle.textContent = initials;
        if (avatarCircleMenu) avatarCircleMenu.textContent = initials;
        if (pmName) pmName.textContent = currentUser.fullName || 'User';
        if (pmUsername) pmUsername.textContent = `@${currentUser.username || 'user'}`;
        if (pmEmail) pmEmail.textContent = currentUser.email || 'user@example.com';
        if (pmDob) pmDob.textContent = currentUser.dob || '—';
        if (pmAccountType) {
            pmAccountType.textContent = currentUser.accountType || 'Free';
            pmAccountType.className = `badge ${(currentUser.accountType || 'Free').toLowerCase()}`;
        }
        if (pmPrompts) {
            const aiPromptCount = parseInt(localStorage.getItem('ai_prompt_count')) || 0;
            pmPrompts.textContent = currentUser.accountType === 'Premium' || currentUser.accountType === 'Pro' ? '∞' : `${aiPromptCount} / 20`;
        }
    } else {
        if (avatarCircle) avatarCircle.textContent = 'G';
        if (avatarCircleMenu) avatarCircleMenu.textContent = 'G';
        if (pmName) pmName.textContent = 'Guest User';
        if (pmUsername) pmUsername.textContent = '@guest';
        if (pmEmail) pmEmail.textContent = 'guest@example.com';
        if (pmDob) pmDob.textContent = '—';
        if (pmAccountType) {
            pmAccountType.textContent = 'Guest';
            pmAccountType.className = 'badge guest';
        }
        if (pmPrompts) pmPrompts.textContent = '0 / 20';
    }
}

function showCurrentPremiumStatus() {
    const currentPlanBtn = document.querySelector('.plan-btn.current');
    if (currentPlanBtn && currentUser) {
        if (currentUser.accountType === 'Premium') {
            // Update premium button to show current status
            premiumBtn.textContent = 'Current Plan';
            premiumBtn.classList.add('current');
            premiumBtn.disabled = true;
        } else if (currentUser.accountType === 'Pro') {
            // Update both buttons
            premiumBtn.textContent = 'Downgrade to Premium';
            premiumBtn.classList.remove('premium');
            premiumBtn.classList.add('ghost');
            
            proBtn.textContent = 'Current Plan';
            proBtn.classList.add('current');
            proBtn.disabled = true;
        }
    }
}

// Event listeners setup
function setupEventListeners() {
    // Billing toggle
    billingToggle?.addEventListener('click', toggleBilling);
    
    // Plan selection buttons
    premiumBtn?.addEventListener('click', () => selectPlan('premium'));
    proBtn?.addEventListener('click', () => selectPlan('pro'));
    
    // Modal controls
    paymentCloseBtn?.addEventListener('click', closePaymentModal);
    document.getElementById('cancelPayment')?.addEventListener('click', closePaymentModal);
    continueBtn?.addEventListener('click', () => {
        closeSuccessModal();
        window.location.href = 'main.html';
    });
    
    // Payment form
    paymentForm?.addEventListener('submit', handlePayment);
    
    // Payment method selection
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', updatePaymentDetails);
    });
    
    // Profile menu functionality
    const profileBtn = document.getElementById('profileBtn');
    const profileMenu = document.getElementById('profileMenu');
    
    profileBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleProfileMenu();
    });
    
    // Close profile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (profileMenu && !profileMenu.contains(e.target) && !profileBtn?.contains(e.target)) {
            closeProfileMenu();
        }
    });
    
    // Logout functionality
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    
    // Mobile navigation
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mainNav = document.getElementById('mainNav');
    
    hamburgerBtn?.addEventListener('click', () => {
        mainNav?.classList.toggle('active');
        hamburgerBtn?.classList.toggle('active');
    });
    
    // Close modals on overlay click
    overlay?.addEventListener('click', () => {
        closePaymentModal();
        closeSuccessModal();
    });
    
    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePaymentModal();
            closeSuccessModal();
            closeProfileMenu();
        }
    });
}

// Billing toggle functionality
function toggleBilling() {
    isAnnualBilling = !isAnnualBilling;
    billingToggle.classList.toggle('annual', isAnnualBilling);
    updatePricingDisplay();
}

function updatePricingDisplay() {
    // Update Premium plan pricing
    const premiumMonthlyPrice = document.querySelector('.premium-plan .monthly-price');
    const premiumAnnualPrice = document.querySelector('.premium-plan .annual-price');
    const premiumMonthlyPeriod = document.querySelector('.premium-plan .monthly-period');
    const premiumAnnualPeriod = document.querySelector('.premium-plan .annual-period');
    const premiumMonthlyNote = document.querySelector('.premium-plan .monthly-note');
    const premiumAnnualNote = document.querySelector('.premium-plan .annual-note');
    
    // Update Pro plan pricing
    const proMonthlyPrice = document.querySelector('.pro-plan .monthly-price');
    const proAnnualPrice = document.querySelector('.pro-plan .annual-price');
    const proMonthlyPeriod = document.querySelector('.pro-plan .monthly-period');
    const proAnnualPeriod = document.querySelector('.pro-plan .annual-period');
    const proMonthlyNote = document.querySelector('.pro-plan .monthly-note');
    const proAnnualNote = document.querySelector('.pro-plan .annual-note');
    
    if (isAnnualBilling) {
        // Show annual pricing
        if (premiumMonthlyPrice) premiumMonthlyPrice.style.display = 'none';
        if (premiumAnnualPrice) premiumAnnualPrice.style.display = 'inline';
        if (premiumMonthlyPeriod) premiumMonthlyPeriod.style.display = 'none';
        if (premiumAnnualPeriod) premiumAnnualPeriod.style.display = 'inline';
        if (premiumMonthlyNote) premiumMonthlyNote.style.display = 'none';
        if (premiumAnnualNote) premiumAnnualNote.style.display = 'inline';
        
        if (proMonthlyPrice) proMonthlyPrice.style.display = 'none';
        if (proAnnualPrice) proAnnualPrice.style.display = 'inline';
        if (proMonthlyPeriod) proMonthlyPeriod.style.display = 'none';
        if (proAnnualPeriod) proAnnualPeriod.style.display = 'inline';
        if (proMonthlyNote) proMonthlyNote.style.display = 'none';
        if (proAnnualNote) proAnnualNote.style.display = 'inline';
    } else {
        // Show monthly pricing
        if (premiumMonthlyPrice) premiumMonthlyPrice.style.display = 'inline';
        if (premiumAnnualPrice) premiumAnnualPrice.style.display = 'none';
        if (premiumMonthlyPeriod) premiumMonthlyPeriod.style.display = 'inline';
        if (premiumAnnualPeriod) premiumAnnualPeriod.style.display = 'none';
        if (premiumMonthlyNote) premiumMonthlyNote.style.display = 'inline';
        if (premiumAnnualNote) premiumAnnualNote.style.display = 'none';
        
        if (proMonthlyPrice) proMonthlyPrice.style.display = 'inline';
        if (proAnnualPrice) proAnnualPrice.style.display = 'none';
        if (proMonthlyPeriod) proMonthlyPeriod.style.display = 'inline';
        if (proAnnualPeriod) proAnnualPeriod.style.display = 'none';
        if (proMonthlyNote) proMonthlyNote.style.display = 'inline';
        if (proAnnualNote) proAnnualNote.style.display = 'none';
    }
}

// Plan selection
function selectPlan(planType) {
    if (!currentUser) {
        showNotification('Please create an account first to upgrade to premium.', 'warning');
        return;
    }
    
    if (currentUser.accountType === planType.charAt(0).toUpperCase() + planType.slice(1)) {
        showNotification('You already have this plan!', 'info');
        return;
    }
    
    selectedPlan = planType;
    showPaymentModal(planType);
}

function showPaymentModal(planType) {
    const plan = pricingPlans[planType];
    const pricing = isAnnualBilling ? plan.annual : plan.monthly;
    
    // Update modal content
    const planName = document.getElementById('selectedPlanName');
    const planDesc = document.getElementById('selectedPlanDesc');
    const planPrice = document.getElementById('selectedPlanPrice');
    
    if (planName) planName.textContent = planType.charAt(0).toUpperCase() + planType.slice(1) + ' Plan';
    if (planDesc) {
        planDesc.textContent = isAnnualBilling 
            ? `Annual billing (Save 20%)` 
            : 'Monthly billing';
    }
    if (planPrice) {
        planPrice.textContent = isAnnualBilling 
            ? `SDG ${pricing.yearlyTotal}/year` 
            : `SDG ${pricing.amount}/${pricing.period}`;
    }
    
    // Show modal
    paymentModal.style.display = 'flex';
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Initialize payment details
    updatePaymentDetails();
}

function closePaymentModal() {
    paymentModal.style.display = 'none';
    overlay.style.display = 'none';
    document.body.style.overflow = 'auto';
    selectedPlan = null;
}

function closeSuccessModal() {
    successModal.style.display = 'none';
    overlay.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Payment method details
function updatePaymentDetails() {
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    const paymentDetails = document.getElementById('paymentDetails');
    
    if (!paymentDetails) return;
    
    let detailsHTML = '';
    
    switch (selectedMethod) {
        case 'mobile':
            detailsHTML = `
                <div class="payment-field">
                    <label>Mobile Number</label>
                    <input type="tel" id="mobileNumber" required placeholder="+249 XX XXX XXXX" />
                </div>
                <div class="payment-field">
                    <label>Mobile Money Provider</label>
                    <select id="provider" required>
                        <option value="">Select provider</option>
                        <option value="zain">Zain Cash</option>
                        <option value="mtn">MTN Mobile Money</option>
                        <option value="sudani">Sudani Mobile Money</option>
                    </select>
                </div>
            `;
            break;
            
        case 'bank':
            detailsHTML = `
                <div class="payment-field">
                    <label>Account Holder Name</label>
                    <input type="text" id="accountName" required placeholder="Full name as on account" />
                </div>
                <div class="payment-field">
                    <label>Bank Name</label>
                    <select id="bankName" required>
                        <option value="">Select bank</option>
                        <option value="bob">Bank of Khartoum</option>
                        <option value="bnb">Blue Nile Bank</option>
                        <option value="faisal">Faisal Islamic Bank</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="payment-field">
                    <label>Account Number</label>
                    <input type="text" id="accountNumber" required placeholder="Your account number" />
                </div>
            `;
            break;
            
        case 'card':
            detailsHTML = `
                <div class="payment-field">
                    <label>Card Number</label>
                    <input type="text" id="cardNumber" required placeholder="1234 5678 9012 3456" maxlength="19" />
                </div>
                <div class="field-row">
                    <div class="payment-field">
                        <label>Expiry Date</label>
                        <input type="text" id="expiryDate" required placeholder="MM/YY" maxlength="5" />
                    </div>
                    <div class="payment-field">
                        <label>CVV</label>
                        <input type="text" id="cvv" required placeholder="123" maxlength="4" />
                    </div>
                </div>
                <div class="payment-field">
                    <label>Cardholder Name</label>
                    <input type="text" id="cardholderName" required placeholder="Name on card" />
                </div>
            `;
            break;
    }
    
    paymentDetails.innerHTML = detailsHTML;
    
    // Add input formatting for card number and expiry
    if (selectedMethod === 'card') {
        setupCardFormatting();
    }
}

function setupCardFormatting() {
    const cardNumber = document.getElementById('cardNumber');
    const expiryDate = document.getElementById('expiryDate');
    
    // Format card number
    cardNumber?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        e.target.value = value;
    });
    
    // Format expiry date
    expiryDate?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });
}

// Payment processing
async function handlePayment(e) {
    e.preventDefault();
    
    if (!selectedPlan || !currentUser) {
        showNotification('Please select a plan and ensure you are logged in.', 'error');
        return;
    }
    
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    if (!selectedMethod) {
        showNotification('Please select a payment method.', 'error');
        return;
    }
    
    // Validate payment details based on method
    const isValid = validatePaymentDetails(selectedMethod);
    if (!isValid) {
        return;
    }
    
    // Show loading state
    const paymentBtn = document.getElementById('completePayment');
    const paymentBtnText = document.getElementById('paymentBtnText');
    const paymentSpinner = document.querySelector('.payment-spinner');
    
    paymentBtn.disabled = true;
    paymentBtnText.style.display = 'none';
    paymentSpinner.style.display = 'inline-block';
    
    try {
        // Simulate payment processing
        await processPayment(selectedMethod);
        
        // Update user account
        const newAccountType = selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1);
        currentUser.accountType = newAccountType;
        currentUser.upgradeDate = new Date().toISOString();
        currentUser.billingCycle = isAnnualBilling ? 'annual' : 'monthly';
        
        // Save updated user data
        localStorage.setItem('smartrecipes_user', JSON.stringify(currentUser));
        
        // Close payment modal and show success
        closePaymentModal();
        showSuccessModal();
        
        // Update profile display
        updateProfileDisplay();
        
    } catch (error) {
        console.error('Payment error:', error);
        showNotification('Payment failed. Please try again or contact support.', 'error');
    } finally {
        // Reset button state
        paymentBtn.disabled = false;
        paymentBtnText.style.display = 'inline';
        paymentSpinner.style.display = 'none';
    }
}

function validatePaymentDetails(method) {
    switch (method) {
        case 'mobile':
            const mobileNumber = document.getElementById('mobileNumber')?.value;
            const provider = document.getElementById('provider')?.value;
            
            if (!mobileNumber || !provider) {
                showNotification('Please fill in all mobile payment details.', 'error');
                return false;
            }
            
            if (!mobileNumber.match(/^\+249\d{9}$/)) {
                showNotification('Please enter a valid Sudanese mobile number (+249XXXXXXXXX).', 'error');
                return false;
            }
            break;
            
        case 'bank':
            const accountName = document.getElementById('accountName')?.value;
            const bankName = document.getElementById('bankName')?.value;
            const accountNumber = document.getElementById('accountNumber')?.value;
            
            if (!accountName || !bankName || !accountNumber) {
                showNotification('Please fill in all bank details.', 'error');
                return false;
            }
            break;
            
        case 'card':
            const cardNumber = document.getElementById('cardNumber')?.value;
            const expiryDate = document.getElementById('expiryDate')?.value;
            const cvv = document.getElementById('cvv')?.value;
            const cardholderName = document.getElementById('cardholderName')?.value;
            
            if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
                showNotification('Please fill in all card details.', 'error');
                return false;
            }
            
            // Basic card validation
            const cleanCardNumber = cardNumber.replace(/\s/g, '');
            if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
                showNotification('Please enter a valid card number.', 'error');
                return false;
            }
            
            if (!expiryDate.match(/^\d{2}\/\d{2}$/)) {
                showNotification('Please enter expiry date in MM/YY format.', 'error');
                return false;
            }
            
            if (cvv.length < 3 || cvv.length > 4) {
                showNotification('Please enter a valid CVV.', 'error');
                return false;
            }
            break;
    }
    
    return true;
}

async function processPayment(method) {
    return new Promise((resolve, reject) => {
        // Simulate payment processing delay
        setTimeout(() => {
            // In real implementation, this would integrate with IntaSend API
            if (Math.random() > 0.1) { // 90% success rate
                resolve({
                    transactionId: generateTransactionId(),
                    method: method,
                    status: 'success'
                });
            } else {
                reject(new Error('Payment processing failed'));
            }
        }, 3000);
    });
}

function generateTransactionId() {
    return 'FR_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function showSuccessModal() {
    successModal.style.display = 'flex';
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// FAQ functionality
function setupFAQs() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other FAQs
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });
            
            // Toggle current FAQ
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// Profile menu functions
function toggleProfileMenu() {
    const profileMenu = document.getElementById('profileMenu');
    if (profileMenu) {
        const isVisible = profileMenu.style.display === 'block';
        profileMenu.style.display = isVisible ? 'none' : 'block';
    }
}

function closeProfileMenu() {
    const profileMenu = document.getElementById('profileMenu');
    if (profileMenu) {
        profileMenu.style.display = 'none';
    }
}

function handleLogout() {
    // Clear user data
    currentUser = null;
    localStorage.removeItem('smartrecipes_user');
    localStorage.removeItem('ai_prompt_count');
    
    // Update UI
    updateProfileDisplay();
    closeProfileMenu();
    showNotification('You have been logged out successfully.', 'success');
    
    // Redirect to login page after a brief delay
    setTimeout(() => {
        window.location.href = '../../loginpage/login.html';
    }, 1500);
}

// Animations
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
    const fadeElements = document.querySelectorAll('.pricing-card, .faq-item');
    fadeElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });
    
    // Add floating animation to pricing cards
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.animation = `float-card 6s ease-in-out infinite`;
            card.style.animationDelay = `${index * 0.5}s`;
        }, 1000);
    });
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
                animation: slideIn 0.3s ease;
            }
            .notification.error { border-left-color: #e53e3e; }
            .notification.warning { border-left-color: #ed8936; }
            .notification.success { border-left-color: #38a169; }
            .notification.info { border-left-color: #3182ce; }
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

// Add floating animation keyframes
if (!document.querySelector('.upgrade-animations')) {
    const style = document.createElement('style');
    style.className = 'upgrade-animations';
    style.textContent = `
        @keyframes float-card {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        
        .pricing-card.premium-plan {
            animation: premium-glow 3s ease-in-out infinite;
        }
        
        @keyframes premium-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(66, 133, 244, 0.2); }
            50% { box-shadow: 0 0 30px rgba(66, 133, 244, 0.4); }
        }
    `;
    document.head.appendChild(style);
}

// Real IntaSend integration (placeholder for future implementation)
async function initializeIntaSend() {
    try {
        // This would be the actual IntaSend initialization
        if (typeof IntaSend !== 'undefined') {
            const intasend = new IntaSend({
                publicKey: INTASEND_CONFIG.publicKey,
                test: INTASEND_CONFIG.testMode
            });
            return intasend;
        } else {
            console.log('IntaSend SDK not loaded, using demo mode');
            return null;
        }
    } catch (error) {
        console.error('IntaSend initialization error:', error);
        return null;
    }
}

// Analytics and tracking (placeholder)
function trackUpgrade(planType, billingCycle) {
    try {
        // Track upgrade event
        console.log('Upgrade tracked:', {
            plan: planType,
            billing: billingCycle,
            user: currentUser?.username,
            timestamp: new Date().toISOString()
        });
        
        // In real implementation, this would send data to analytics service
        // Example: analytics.track('upgrade_completed', {...})
    } catch (error) {
        console.error('Analytics tracking error:', error);
    }
}

// Helper function to format currency
function formatCurrency(amount, currency = 'SDG') {
    return new Intl.NumberFormat('en-SD', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0
    }).format(amount);
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

// Page visibility API to pause animations when tab is not active
document.addEventListener('visibilitychange', function() {
    const pricingCards = document.querySelectorAll('.pricing-card');
    if (document.hidden) {
        pricingCards.forEach(card => {
            card.style.animationPlayState = 'paused';
        });
    } else {
        pricingCards.forEach(card => {
            card.style.animationPlayState = 'running';
        });
    }
});

// Keyboard navigation for accessibility
document.addEventListener('keydown', function(e) {
    // Handle Enter key on pricing cards
    if (e.key === 'Enter' && e.target.classList.contains('plan-btn')) {
        e.target.click();
    }
    
    // Handle Arrow keys for FAQ navigation
    if (e.target.classList.contains('faq-question')) {
        const faqItems = Array.from(document.querySelectorAll('.faq-question'));
        const currentIndex = faqItems.indexOf(e.target);
        
        if (e.key === 'ArrowDown' && currentIndex < faqItems.length - 1) {
            faqItems[currentIndex + 1].focus();
        } else if (e.key === 'ArrowUp' && currentIndex > 0) {
            faqItems[currentIndex - 1].focus();
        }
    }
});

// Price calculation helpers
function calculateAnnualSavings(planType) {
    const plan = pricingPlans[planType];
    const monthlyTotal = plan.monthly.amount * 12;
    const annualTotal = plan.annual.yearlyTotal;
    return monthlyTotal - annualTotal;
}

function getPlanDetails(planType, isAnnual = false) {
    const plan = pricingPlans[planType];
    const pricing = isAnnual ? plan.annual : plan.monthly;
    
    return {
        name: planType.charAt(0).toUpperCase() + planType.slice(1),
        amount: pricing.amount,
        period: pricing.period,
        yearlyTotal: pricing.yearlyTotal,
        savings: isAnnual ? calculateAnnualSavings(planType) : 0
    };
}