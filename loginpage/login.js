// Supabase Configuration
const SUPABASE_URL = 'https://hrfvkblkpihdzcuodwzz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZnZrYmxrcGloZHpjdW9kd3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzODg1MzUsImV4cCI6MjA3MTk2NDUzNX0.n8bIKKS1UkGYyQnP-Dbis5kl5AqvYVovSeefa_sVTZE';

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global state to prevent infinite redirects
let isRedirecting = false;
let authChecked = false;

// Check if user is already logged in
async function checkExistingAuth() {
    try {
        // Check if user is authenticated
        const userEmail = localStorage.getItem('user_email');
        const isAuthenticated = localStorage.getItem('user_authenticated');
        
        if (userEmail && isAuthenticated === 'true') {
            // Check if the session is still valid with Supabase
            const { data: { session }, error } = await supabaseClient.auth.getSession();
            
            if (session && !error) {
                // Session is valid, redirect to main page
                showMessage('Welcome back! Redirecting...', 'success');
                setTimeout(() => {
                    safeRedirect('../homepage/mainpage/main.html');
                }, 1500);
                return;
            } else {
                // Session expired, clear invalid data
                localStorage.removeItem('user_email');
                localStorage.removeItem('user_id');
                localStorage.removeItem('user_authenticated');
            }
        }
    } catch (error) {
        console.error('Auth check error:', error);
        // Clear any invalid data
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_authenticated');
    }
}

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const messageContainer = document.getElementById('messageContainer');
const messageContent = document.getElementById('messageContent');

// Form switching functions
function showLoginForm() {
    hideAllForms();
    if (loginForm) loginForm.style.display = 'block';
    clearMessages();
}

function showSignupForm() {
    hideAllForms();
    if (signupForm) signupForm.style.display = 'block';
    clearMessages();
}

function showForgotPassword() {
    hideAllForms();
    if (forgotPasswordForm) forgotPasswordForm.style.display = 'block';
    clearMessages();
}

function hideAllForms() {
    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'none';
    if (forgotPasswordForm) forgotPasswordForm.style.display = 'none';
}

// Message display functions
function showMessage(message, type = 'info') {
    if (!messageContent || !messageContainer) return;
    
    messageContent.textContent = message;
    messageContent.className = `message ${type}`;
    messageContainer.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideMessage();
    }, 5000);
}

function hideMessage() {
    if (messageContainer) {
        messageContainer.style.display = 'none';
    }
}

function clearMessages() {
    hideMessage();
}

// Loading state functions
function setButtonLoading(buttonId, loading = true) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    const buttonText = button.querySelector('.button-text');
    const buttonLoader = button.querySelector('.button-loader');
    
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
        if (buttonText) buttonText.style.display = 'none';
        if (buttonLoader) buttonLoader.style.display = 'inline-block';
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        if (buttonText) buttonText.style.display = 'inline-block';
        if (buttonLoader) buttonLoader.style.display = 'none';
    }
}

// Form validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password && password.length >= 6;
}

function validatePasswordsMatch(password, confirmPassword) {
    return password === confirmPassword;
}

// Safe redirect function
function safeRedirect(url, delay = 1500) {
    if (isRedirecting) return;
    
    isRedirecting = true;
    setTimeout(() => {
        try {
            window.location.href = url;
        } catch (error) {
            console.error('Redirect error:', error);
            isRedirecting = false;
        }
    }, delay);
}

// Authentication functions
async function handleLogin(event) {
    event.preventDefault();
    if (isRedirecting) return;
    
    clearMessages();
    setButtonLoading('loginButton', true);
    
    const formData = new FormData(event.target);
    const email = formData.get('email')?.trim();
    const password = formData.get('password');
    
    // Check if user is already authenticated
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (session && session.user) {
            // User is already logged in, just redirect
            showMessage('Already authenticated! Redirecting...', 'success');
            safeRedirect('../homepage/mainpage/main.html');
            return;
        }
    } catch (error) {
        console.log('Session check error:', error);
        // Continue with normal login if session check fails
    }
    
    // Basic validation
    if (!email || !validateEmail(email)) {
        showMessage('Please enter a valid email address', 'error');
        setButtonLoading('loginButton', false);
        return;
    }
    
    if (!validatePassword(password)) {
        showMessage('Password must be at least 6 characters long', 'error');
        setButtonLoading('loginButton', false);
        return;
    }
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });
        
        if (error) {
            throw error;
        }
        
        if (data.user) {
            // Login successful
            showMessage('Login successful! Redirecting...', 'success');
            
            // Store only essential user info (email and ID)
            const userInfo = {
                id: data.user.id,
                email: data.user.email
            };
            
            // Store in localStorage for other pages to access
            localStorage.setItem('user_email', userInfo.email);
            localStorage.setItem('user_id', userInfo.id);
            localStorage.setItem('user_authenticated', 'true');
            
            // Store user info if remember me is checked
            const rememberMe = document.getElementById('rememberMe');
            if (rememberMe && rememberMe.checked) {
                try {
                    sessionStorage.setItem('rememberUser', 'true');
                } catch (e) {
                    console.log('Session storage not available');
                }
            }
            
            // Redirect to main page after short delay
            safeRedirect('../homepage/mainpage/main.html');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        let errorMessage = 'Login failed. Please try again.';
        
        if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Please verify your email address before logging in.';
        }
        
        showMessage(errorMessage, 'error');
    } finally {
        setButtonLoading('loginButton', false);
    }
}

async function handleSignup(event) {
    event.preventDefault();
    if (isRedirecting) return;
    
    clearMessages();
    setButtonLoading('signupButton', true);
    
    const formData = new FormData(event.target);
    const fullName = formData.get('fullName')?.trim();
    const email = formData.get('email')?.trim();
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const accountType = formData.get('accountType');
    
    // Validation
    if (!fullName) {
        showMessage('Please enter your full name', 'error');
        setButtonLoading('signupButton', false);
        return;
    }
    
    if (!validateEmail(email)) {
        showMessage('Please enter a valid email address', 'error');
        setButtonLoading('signupButton', false);
        return;
    }
    
    if (!validatePassword(password)) {
        showMessage('Password must be at least 6 characters long', 'error');
        setButtonLoading('signupButton', false);
        return;
    }
    
    if (!validatePasswordsMatch(password, confirmPassword)) {
        showMessage('Passwords do not match', 'error');
        setButtonLoading('signupButton', false);
        return;
    }
    
    if (!accountType) {
        showMessage('Please select an account type', 'error');
        setButtonLoading('signupButton', false);
        return;
    }
    
    const agreeTerms = document.getElementById('agreeTerms');
    if (!agreeTerms || !agreeTerms.checked) {
        showMessage('Please agree to the Terms of Service and Privacy Policy', 'error');
        setButtonLoading('signupButton', false);
        return;
    }
    
    try {
        // Sign up the user
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    account_type: accountType,
                }
            }
        });
        
        if (error) {
            throw error;
        }
        
        // Create user profile in custom table
        if (data.user) {
            try {
                const { error: profileError } = await supabaseClient
                    .from('user_profiles')
                    .insert([
                        {
                            id: data.user.id,
                            full_name: fullName,
                            email: email,
                            account_type: accountType,
                            username: email.split('@')[0], // Generate username from email
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }
                    ]);
                
                if (profileError) {
                    console.error('Profile creation error:', profileError);
                    // Don't fail the signup for profile errors
                }
                
                // Store only essential user info
                localStorage.setItem('user_email', email);
                localStorage.setItem('user_id', data.user.id);
                localStorage.setItem('user_authenticated', 'true');
                
            } catch (profileError) {
                console.error('Profile creation failed:', profileError);
            }
        }
        
        showMessage('Account created successfully! Please check your email to verify your account.', 'success');
        
        // Switch to login form after delay
        setTimeout(() => {
            showLoginForm();
            // Pre-fill email
            const loginEmail = document.getElementById('loginEmail');
            if (loginEmail) loginEmail.value = email;
        }, 3000);
        
    } catch (error) {
        console.error('Signup error:', error);
        let errorMessage = 'Signup failed. Please try again.';
        
        if (error.message.includes('already registered')) {
            errorMessage = 'This email is already registered. Please use a different email or try logging in.';
        }
        
        showMessage(errorMessage, 'error');
    } finally {
        setButtonLoading('signupButton', false);
    }
}

async function handleForgotPassword(event) {
    event.preventDefault();
    clearMessages();
    setButtonLoading('resetButton', true);
    
    const formData = new FormData(event.target);
    const email = formData.get('email')?.trim();
    
    if (!validateEmail(email)) {
        showMessage('Please enter a valid email address', 'error');
        setButtonLoading('resetButton', false);
        return;
    }
    
    try {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password.html`,
        });
        
        if (error) {
            throw error;
        }
        
        showMessage('Password reset link sent! Check your email.', 'success');
        
        // Switch back to login form after delay
        setTimeout(() => {
            showLoginForm();
        }, 3000);
        
    } catch (error) {
        console.error('Password reset error:', error);
        showMessage(error.message || 'Failed to send reset link. Please try again.', 'error');
    } finally {
        setButtonLoading('resetButton', false);
    }
}

async function handleGoogleLogin() {
    if (isRedirecting) return;
    
    clearMessages();
    
    try {
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/homepage/mainpage/main.html`
            }
        });
        
        if (error) {
            throw error;
        }
        
        showMessage('Redirecting to Google...', 'info');
        
    } catch (error) {
        console.error('Google login error:', error);
        showMessage(error.message || 'Google login failed. Please try again.', 'error');
    }
}

// Improved authentication check - NO AUTO REDIRECT
async function checkAuthState() {
    if (authChecked || isRedirecting) return;
    
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
            console.error('Auth session error:', error);
            authChecked = true;
            return;
        }
        
        if (session && session.user) {
            console.log('User already authenticated:', session.user.email);
            // Show a message but DON'T auto-redirect - let user choose
            showMessage(`Welcome back, ${session.user.email}! Click "Sign In" to continue or sign out to use a different account.`, 'info');
            
            // Pre-fill the email field if it exists
            const loginEmail = document.getElementById('loginEmail');
            if (loginEmail && !loginEmail.value) {
                loginEmail.value = session.user.email;
            }
        }
        
        authChecked = true;
        
    } catch (error) {
        console.error('Auth check error:', error);
        authChecked = true;
    }
}

// Simplified auth state change listener
supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event);
    
    if (event === 'SIGNED_IN' && session) {
        console.log('User signed in:', session.user.email);
        // Don't redirect here - let the form handlers handle it
    } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        isRedirecting = false;
        authChecked = false;
    }
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Login page loaded');
    
    // Check if user is already logged in
    checkExistingAuth();
    
    // Small delay before checking auth to prevent rapid redirects
    setTimeout(() => {
        checkAuthState();
    }, 500);
    
    // Show login form by default
    showLoginForm();
    
    // Handle URL parameters for direct linking
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');
        
        if (action === 'signup') {
            showSignupForm();
        } else if (action === 'reset') {
            showForgotPassword();
        }
    } catch (error) {
        console.error('URL params error:', error);
    }
});

// Handle page visibility changes to prevent issues when switching tabs
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, stop any ongoing processes
        clearTimeout();
    }
});

// Prevent multiple form submissions
let formSubmitting = false;

// Override form submission to prevent double submissions
['loginFormElement', 'signupFormElement', 'forgotPasswordFormElement'].forEach(formId => {
    const form = document.getElementById(formId);
    if (form) {
        form.addEventListener('submit', (event) => {
            if (formSubmitting) {
                event.preventDefault();
                return false;
            }
            formSubmitting = true;
            
            // Reset flag after a delay
            setTimeout(() => {
                formSubmitting = false;
            }, 3000);
        });
    }
});