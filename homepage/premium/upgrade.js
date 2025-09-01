// Intasend Configuration
const INTASEND_CONFIG = {
    publicKey: 'ISPubKey_test_0c2a0c0d-b406-43e6-9a53-50967c70d608',
    currency: 'KES',
    testMode: true,
    baseUrl: 'https://sandbox.intasend.com',
};

// Global state
let currentUser = null;
let isAnnualBilling = false;
let selectedPlan = null;
let currentPlanPrice = 0;
let currentPlanName = '';

// Simple pricing lookup function
function getPlanPrice(planType, isAnnual) {
    const prices = {
        premium: {
            monthly: 300,
            annual: 2880
        },
        pro: {
            monthly: 1000,
            annual: 9600
        }
    };
    
    if (!prices[planType]) {
        console.error('Invalid plan type:', planType);
        return 0;
    }
    
    return isAnnual ? prices[planType].annual : prices[planType].monthly;
}

function getPlanDisplayText(planType, isAnnual) {
    const price = getPlanPrice(planType, isAnnual);
    const period = isAnnual ? 'year' : 'month';
    const savings = isAnnual ? ' (Save 20%)' : '';
    
    return `KSh ${price}/${period}${savings}`;
}

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
const loadingModal = document.getElementById('loadingModal');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, initializing...');
    loadUserData();
    setupEventListeners();
    setupFAQs();
    updatePricingDisplay();
    setupAnimations();
    checkForPaymentReturn();
});

// Load user data
function loadUserData() {
    try {
        const userData = localStorage.getItem('smartrecipes_user');
        if (userData) {
            currentUser = JSON.parse(userData);
            console.log('User loaded:', currentUser);
        } else {
            console.log('No user found, using guest mode');
        }
        updateProfileDisplay();
        showCurrentPremiumStatus();
    } catch (error) {
        console.error('Error loading user data:', error);
        currentUser = null;
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
    if (currentUser && premiumBtn && proBtn) {
        if (currentUser.accountType === 'Premium') {
            premiumBtn.textContent = 'Current Plan';
            premiumBtn.classList.add('current');
            premiumBtn.disabled = true;
        } else if (currentUser.accountType === 'Pro') {
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
    billingToggle?.addEventListener('click', toggleBilling);
    
    premiumBtn?.addEventListener('click', () => handlePlanSelection('premium'));
    proBtn?.addEventListener('click', () => handlePlanSelection('pro'));
    
    paymentCloseBtn?.addEventListener('click', closePaymentModal);
    document.getElementById('cancelPayment')?.addEventListener('click', closePaymentModal);
    continueBtn?.addEventListener('click', () => {
        closeSuccessModal();
        window.location.href = '../mainpage/main.html';
    });
    
    paymentForm?.addEventListener('submit', processPayment);
    
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', updatePaymentMethodDisplay);
    });
    
    setupProfileMenu();
    setupMobileMenu();
    setupModalControls();
}

// Simplified plan selection
function handlePlanSelection(planType) {
    console.log('Plan selection started:', planType);
    
    if (!currentUser) {
        showNotification('Please create an account first to upgrade to premium.', 'warning');
        return;
    }
    
    if (!planType || (planType !== 'premium' && planType !== 'pro')) {
        console.error('Invalid plan type:', planType);
        showNotification('Invalid plan selected. Please try again.', 'error');
        return;
    }
    
    const currentAccountType = currentUser.accountType;
    const targetAccountType = planType.charAt(0).toUpperCase() + planType.slice(1);
    
    if (currentAccountType === targetAccountType) {
        showNotification('You already have this plan!', 'info');
        return;
    }
    
    // Set global variables
    selectedPlan = planType;
    currentPlanPrice = getPlanPrice(planType, isAnnualBilling);
    currentPlanName = targetAccountType;
    
    console.log('Plan selected:', {
        plan: selectedPlan,
        price: currentPlanPrice,
        name: currentPlanName,
        annual: isAnnualBilling
    });
    
    if (currentPlanPrice <= 0) {
        showNotification('Error calculating plan price. Please try again.', 'error');
        return;
    }
    
    openPaymentModal();
}

function openPaymentModal() {
    try {
        const planName = document.getElementById('selectedPlanName');
        const planDesc = document.getElementById('selectedPlanDesc');
        const planPrice = document.getElementById('selectedPlanPrice');
        
        if (planName) planName.textContent = currentPlanName + ' Plan';
        if (planDesc) {
            planDesc.textContent = isAnnualBilling 
                ? 'Annual billing (Save 20%)' 
                : 'Monthly billing';
        }
        if (planPrice) {
            const period = isAnnualBilling ? 'year' : 'month';
            planPrice.textContent = `KSh ${currentPlanPrice}/${period}`;
        }
        
        paymentModal.style.display = 'flex';
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        updatePaymentMethodDisplay();
        
    } catch (error) {
        console.error('Error opening payment modal:', error);
        showNotification('Error loading payment form. Please try again.', 'error');
    }
}

function closePaymentModal() {
    paymentModal.style.display = 'none';
    overlay.style.display = 'none';
    document.body.style.overflow = 'auto';
    selectedPlan = null;
    currentPlanPrice = 0;
    currentPlanName = '';
}

function closeSuccessModal() {
    successModal.style.display = 'none';
    overlay.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function closeLoadingModal() {
    loadingModal.style.display = 'none';
    overlay.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function showSuccessModal() {
    successModal.style.display = 'flex';
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Billing toggle functionality
function toggleBilling() {
    isAnnualBilling = !isAnnualBilling;
    billingToggle.classList.toggle('annual', isAnnualBilling);
    updatePricingDisplay();
    
    // Update current plan price if a plan is selected
    if (selectedPlan) {
        currentPlanPrice = getPlanPrice(selectedPlan, isAnnualBilling);
        
        // Update modal if it's open
        const planPrice = document.getElementById('selectedPlanPrice');
        if (planPrice && paymentModal.style.display === 'flex') {
            const period = isAnnualBilling ? 'year' : 'month';
            planPrice.textContent = `KSh ${currentPlanPrice}/${period}`;
        }
    }
}

function updatePricingDisplay() {
    const premiumMonthlyPrice = document.querySelector('.premium-plan .monthly-price');
    const premiumAnnualPrice = document.querySelector('.premium-plan .annual-price');
    const premiumMonthlyPeriod = document.querySelector('.premium-plan .monthly-period');
    const premiumAnnualPeriod = document.querySelector('.premium-plan .annual-period');
    const premiumMonthlyNote = document.querySelector('.premium-plan .monthly-note');
    const premiumAnnualNote = document.querySelector('.premium-plan .annual-note');
    
    const proMonthlyPrice = document.querySelector('.pro-plan .monthly-price');
    const proAnnualPrice = document.querySelector('.pro-plan .annual-price');
    const proMonthlyPeriod = document.querySelector('.pro-plan .monthly-period');
    const proAnnualPeriod = document.querySelector('.pro-plan .annual-period');
    const proMonthlyNote = document.querySelector('.pro-plan .monthly-note');
    const proAnnualNote = document.querySelector('.pro-plan .annual-note');
    
    if (isAnnualBilling) {
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

// Payment method display
function updatePaymentMethodDisplay() {
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    const paymentDetails = document.getElementById('paymentDetails');
    
    if (!paymentDetails) return;
    
    let detailsHTML = '';
    
    switch (selectedMethod) {
        case 'mpesa':
            detailsHTML = `
                <div class="payment-field">
                    <label>M-Pesa Phone Number</label>
                    <input type="tel" id="mpesaPhone" required placeholder="254712345678" maxlength="12" />
                    <small style="color: #718096; font-size: 0.8rem;">Format: 254XXXXXXXXX</small>
                </div>
                <div style="text-align: center; color: #718096; font-size: 0.9rem; margin-top: 1rem;">
                    <p>You'll receive an M-Pesa prompt on your phone</p>
                </div>
            `;
            break;
            
        case 'airtel':
            detailsHTML = `
                <div class="payment-field">
                    <label>Airtel Money Phone Number</label>
                    <input type="tel" id="airtelPhone" required placeholder="254730123456" maxlength="12" />
                    <small style="color: #718096; font-size: 0.8rem;">Format: 254XXXXXXXXX</small>
                </div>
                <div style="text-align: center; color: #718096; font-size: 0.9rem; margin-top: 1rem;">
                    <p>You'll receive an Airtel Money prompt on your phone</p>
                </div>
            `;
            break;
            
        case 'card':
            detailsHTML = `
                <div class="payment-field">
                    <label>Email Address</label>
                    <input type="email" id="cardEmail" required placeholder="your@email.com" 
                           value="${currentUser?.email || ''}" />
                </div>
                <div class="payment-field">
                    <label>Full Name</label>
                    <input type="text" id="cardName" required placeholder="John Doe" 
                           value="${currentUser?.fullName || ''}" />
                </div>
                <div style="text-align: center; color: #718096; font-size: 0.9rem; margin-top: 1rem;">
                    <p>You'll be redirected to secure card payment</p>
                </div>
            `;
            break;
            
        case 'bank':
            detailsHTML = `
                <div class="payment-field">
                    <label>Email Address</label>
                    <input type="email" id="bankEmail" required placeholder="your@email.com" 
                           value="${currentUser?.email || ''}" />
                </div>
                <div class="payment-field">
                    <label>Full Name</label>
                    <input type="text" id="bankName" required placeholder="John Doe" 
                           value="${currentUser?.fullName || ''}" />
                </div>
                <div style="text-align: center; color: #718096; font-size: 0.9rem; margin-top: 1rem;">
                    <p>You'll receive bank transfer instructions</p>
                </div>
            `;
            break;
            
        default:
            detailsHTML = '<p style="text-align: center; color: #666;">Please select a payment method</p>';
    }
    
    paymentDetails.innerHTML = detailsHTML;
    
    // Setup phone formatting
    if (selectedMethod === 'mpesa' || selectedMethod === 'airtel') {
        setupPhoneInput(selectedMethod);
    }
}

function setupPhoneInput(method) {
    const phoneInput = document.getElementById(method + 'Phone');
    
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.startsWith('0')) {
                value = '254' + value.substring(1);
            } else if (value.startsWith('7') || value.startsWith('1')) {
                value = '254' + value;
            }
            
            if (value.length > 12) {
                value = value.substring(0, 12);
            }
            
            e.target.value = value;
        });
    }
}

// SIMPLIFIED: Main payment processor
async function processPayment(e) {
    e.preventDefault();
    
    console.log('Payment process started');
    console.log('Current state:', {
        selectedPlan,
        currentPlanPrice,
        currentPlanName,
        isAnnualBilling,
        currentUser: !!currentUser
    });
    
    // Basic validation
    if (!currentUser) {
        showNotification('Please log in to continue.', 'error');
        return;
    }
    
    if (!selectedPlan || currentPlanPrice <= 0) {
        showNotification('Please select a valid plan.', 'error');
        return;
    }
    
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    if (!selectedMethod) {
        showNotification('Please select a payment method.', 'error');
        return;
    }
    
    // Validate payment method specific fields
    if (!validatePaymentInputs(selectedMethod)) {
        return;
    }
    
    // Set loading state
    setButtonLoading(true);
    
    try {
        console.log('Creating payment request...');
        await createIntasendPayment(selectedMethod);
    } catch (error) {
        console.error('Payment processing error:', error);
        showNotification('Payment failed: ' + error.message, 'error');
        setButtonLoading(false);
    }
}

// Simplified payment creation
async function createIntasendPayment(method) {
    try {
        // Create payment reference
        const paymentRef = 'SR_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        
        // Prepare payment data
        const paymentData = {
            public_key: INTASEND_CONFIG.publicKey,
            amount: currentPlanPrice,
            currency: INTASEND_CONFIG.currency,
            api_ref: paymentRef,
            email: currentUser.email,
            first_name: currentUser.fullName ? currentUser.fullName.split(' ')[0] : 'User',
            last_name: currentUser.fullName ? currentUser.fullName.split(' ').slice(1).join(' ') : 'Name',
            redirect_url: window.location.href.split('?')[0] + '?payment=success&ref=' + paymentRef,
            narrative: `SmartRecipes ${currentPlanName} Plan`
        };
        
        // Add method-specific data
        if (method === 'mpesa') {
            const phone = document.getElementById('mpesaPhone').value;
            paymentData.phone_number = phone;
            paymentData.method = 'M-PESA';
        } else if (method === 'airtel') {
            const phone = document.getElementById('airtelPhone').value;
            paymentData.phone_number = phone;
            paymentData.method = 'AIRTEL-MONEY';
        } else if (method === 'card') {
            const email = document.getElementById('cardEmail').value;
            const name = document.getElementById('cardName').value;
            paymentData.email = email;
            paymentData.first_name = name.split(' ')[0];
            paymentData.last_name = name.split(' ').slice(1).join(' ') || 'Name';
            paymentData.method = 'CARD';
        } else if (method === 'bank') {
            const email = document.getElementById('bankEmail').value;
            const name = document.getElementById('bankName').value;
            paymentData.email = email;
            paymentData.first_name = name.split(' ')[0];
            paymentData.last_name = name.split(' ').slice(1).join(' ') || 'Name';
            paymentData.method = 'BANK';
        }
        
        console.log('Sending payment data to IntaSend:', paymentData);
        
        // Store payment context
        const paymentContext = {
            ref: paymentRef,
            plan: selectedPlan,
            planName: currentPlanName,
            price: currentPlanPrice,
            billing: isAnnualBilling ? 'annual' : 'monthly',
            method: method,
            timestamp: Date.now()
        };
        localStorage.setItem('payment_context', JSON.stringify(paymentContext));
        
        // Create checkout
        const response = await fetch(`${INTASEND_CONFIG.baseUrl}/api/v1/checkout/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-IntaSend-Public-Key-Id': INTASEND_CONFIG.publicKey
            },
            body: JSON.stringify(paymentData)
        });
        
        const result = await response.json();
        console.log('IntaSend response:', result);
        
        if (!response.ok) {
            throw new Error(result.error || result.detail || `Payment service error (${response.status})`);
        }
        
        if (result.url) {
            closePaymentModal();
            showLoadingModal('Redirecting to payment page...');
            
            setTimeout(() => {
                window.location.href = result.url;
            }, 1000);
        } else {
            throw new Error('No payment URL received from IntaSend');
        }
        
    } catch (error) {
        console.error('IntaSend payment creation error:', error);
        throw error;
    }
}

// Input validation
function validatePaymentInputs(method) {
    switch (method) {
        case 'mpesa':
            const mpesaPhone = document.getElementById('mpesaPhone')?.value;
            if (!mpesaPhone || !mpesaPhone.match(/^254[0-9]{9}$/)) {
                showNotification('Please enter a valid M-Pesa number (254XXXXXXXXX)', 'error');
                return false;
            }
            break;
            
        case 'airtel':
            const airtelPhone = document.getElementById('airtelPhone')?.value;
            if (!airtelPhone || !airtelPhone.match(/^254[0-9]{9}$/)) {
                showNotification('Please enter a valid Airtel number (254XXXXXXXXX)', 'error');
                return false;
            }
            break;
            
        case 'card':
            const cardEmail = document.getElementById('cardEmail')?.value;
            const cardName = document.getElementById('cardName')?.value;
            
            if (!cardEmail || !cardName) {
                showNotification('Please fill in all card payment fields.', 'error');
                return false;
            }
            
            if (!cardEmail.includes('@')) {
                showNotification('Please enter a valid email address.', 'error');
                return false;
            }
            break;
            
        case 'bank':
            const bankEmail = document.getElementById('bankEmail')?.value;
            const bankName = document.getElementById('bankName')?.value;
            
            if (!bankEmail || !bankName) {
                showNotification('Please fill in all bank transfer fields.', 'error');
                return false;
            }
            
            if (!bankEmail.includes('@')) {
                showNotification('Please enter a valid email address.', 'error');
                return false;
            }
            break;
    }
    
    return true;
}

// Check for payment return
function checkForPaymentReturn() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('payment');
        const paymentRef = urlParams.get('ref');
        
        if (paymentStatus === 'success') {
            const paymentContext = localStorage.getItem('payment_context');
            
            if (paymentContext) {
                const context = JSON.parse(paymentContext);
                
                if (!paymentRef || context.ref === paymentRef) {
                    // Restore context
                    selectedPlan = context.plan;
                    currentPlanName = context.planName;
                    currentPlanPrice = context.price;
                    isAnnualBilling = context.billing === 'annual';
                    
                    // Complete upgrade
                    upgradeUserAccount();
                    showSuccessModal();
                    
                    // Cleanup
                    localStorage.removeItem('payment_context');
                    
                    // Clean URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            } else {
                showNotification('Payment completed! Please contact support if your account was not upgraded.', 'success');
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    } catch (error) {
        console.error('Error checking payment return:', error);
    }
}

function upgradeUserAccount() {
    try {
        if (!currentUser || !selectedPlan) {
            console.error('Cannot upgrade - missing user or plan data');
            return;
        }
        
        currentUser.accountType = currentPlanName;
        currentUser.upgradeDate = new Date().toISOString();
        currentUser.billingCycle = isAnnualBilling ? 'annual' : 'monthly';
        currentUser.lastPaymentAmount = currentPlanPrice;
        
        localStorage.setItem('smartrecipes_user', JSON.stringify(currentUser));
        updateProfileDisplay();
        
        console.log('Account upgraded successfully to:', currentPlanName);
        
        // Track the upgrade
        console.log('Upgrade completed:', {
            plan: selectedPlan,
            planName: currentPlanName,
            price: currentPlanPrice,
            billing: isAnnualBilling ? 'annual' : 'monthly',
            user: currentUser.username,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error upgrading account:', error);
        showNotification('Account upgrade error. Please contact support.', 'error');
    }
}

function setButtonLoading(loading) {
    const paymentBtn = document.getElementById('completePayment');
    const paymentBtnText = document.getElementById('paymentBtnText');
    const paymentSpinner = document.querySelector('.payment-spinner');
    
    if (paymentBtn) paymentBtn.disabled = loading;
    if (paymentBtnText) paymentBtnText.style.display = loading ? 'none' : 'inline';
    if (paymentSpinner) paymentSpinner.style.display = loading ? 'inline-block' : 'none';
}

function showLoadingModal(message) {
    const modal = document.getElementById('loadingModal');
    const text = modal?.querySelector('p');
    if (text) text.textContent = message;
    if (modal) {
        modal.style.display = 'flex';
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Profile menu setup
function setupProfileMenu() {
    const profileBtn = document.getElementById('profileBtn');
    const profileMenu = document.getElementById('profileMenu');
    
    profileBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = profileMenu?.style.display === 'block';
        if (profileMenu) profileMenu.style.display = isVisible ? 'none' : 'block';
    });
    
    document.addEventListener('click', (e) => {
        if (profileMenu && !profileMenu.contains(e.target) && !profileBtn?.contains(e.target)) {
            profileMenu.style.display = 'none';
        }
    });
    
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        currentUser = null;
        localStorage.clear();
        showNotification('Logged out successfully.', 'success');
        setTimeout(() => {
            window.location.href = '../../loginpage/login.html';
        }, 1500);
    });
}

// Mobile menu setup
function setupMobileMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mainNav = document.getElementById('mainNav');

    hamburgerBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        mainNav?.classList.toggle('active');
        hamburgerBtn?.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (mainNav?.classList.contains('active')) {
            if (!mainNav.contains(e.target) && !hamburgerBtn.contains(e.target)) {
                mainNav.classList.remove('active');
                hamburgerBtn.classList.remove('active');
            }
        }
    });

    if (mainNav) {
        mainNav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
                hamburgerBtn.classList.remove('active');
            });
        });
    }
}

// Modal controls setup
function setupModalControls() {
    overlay?.addEventListener('click', () => {
        closePaymentModal();
        closeSuccessModal();
        closeLoadingModal();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePaymentModal();
            closeSuccessModal();
            closeLoadingModal();
            const profileMenu = document.getElementById('profileMenu');
            if (profileMenu) profileMenu.style.display = 'none';
        }
    });
}

// FAQ functionality
function setupFAQs() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question?.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });
            
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// Animations
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

    const fadeElements = document.querySelectorAll('.pricing-card, .faq-item');
    fadeElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });
}

// Notification system
function showNotification(message, type = 'info') {
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
    
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
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

// Enhanced debugging and testing
window.debugPayment = function() {
    console.log('=== PAYMENT DEBUG ===');
    console.log('Current user:', currentUser);
    console.log('Selected plan:', selectedPlan);
    console.log('Current plan price:', currentPlanPrice);
    console.log('Current plan name:', currentPlanName);
    console.log('Is annual billing:', isAnnualBilling);
    console.log('Config:', INTASEND_CONFIG);
    
    // Test price calculation
    console.log('Premium monthly price:', getPlanPrice('premium', false));
    console.log('Premium annual price:', getPlanPrice('premium', true));
    console.log('Pro monthly price:', getPlanPrice('pro', false));
    console.log('Pro annual price:', getPlanPrice('pro', true));
    
    // Test payment context
    const context = localStorage.getItem('payment_context');
    if (context) {
        console.log('Stored payment context:', JSON.parse(context));
    } else {
        console.log('No payment context stored');
    }
    
    return {
        user: currentUser,
        plan: selectedPlan,
        price: currentPlanPrice,
        prices: {
            premiumMonthly: getPlanPrice('premium', false),
            premiumAnnual: getPlanPrice('premium', true),
            proMonthly: getPlanPrice('pro', false),
            proAnnual: getPlanPrice('pro', true)
        }
    };
};

// Test function to simulate plan selection
window.testPlanSelection = function(planType) {
    console.log('Testing plan selection for:', planType);
    
    // Create a test user if none exists
    if (!currentUser) {
        currentUser = {
            fullName: 'Test User',
            email: 'test@example.com',
            username: 'testuser',
            accountType: 'Free'
        };
        localStorage.setItem('smartrecipes_user', JSON.stringify(currentUser));
        console.log('Created test user');
    }
    
    handlePlanSelection(planType);
};

// Network error handling
window.addEventListener('online', function() {
    showNotification('Connection restored. You can continue with your payment.', 'success');
});

window.addEventListener('offline', function() {
    showNotification('No internet connection. Please check your network and try again.', 'warning');
});

// Global error handler
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    if (e.error && e.error.message) {
        if (e.error.message.includes('Cannot read properties of undefined')) {
            console.error('Undefined property access detected');
            showNotification('A technical error occurred. Please refresh the page and try again.', 'error');
        }
    }
});

// Initialize user data on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load user data first
    try {
        const userData = localStorage.getItem('smartrecipes_user');
        if (userData) {
            currentUser = JSON.parse(userData);
            console.log('User initialized:', currentUser.username || 'unknown');
        }
    } catch (error) {
        console.error('Error initializing user:', error);
        currentUser = null;
    }
});