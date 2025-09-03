// Supabase Configuration
const SUPABASE_URL = 'https://hrfvkblkpihdzcuodwzz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZnZrYmxrcGloZHpjdW9kd3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzODg1MzUsImV4cCI6MjA3MTk2NDUzNX0.n8bIKKS1UkGYyQnP-Dbis5kl5AqvYVovSeefa_sVTZE';

// Initialize Supabase client
let supabaseClient = null;
try {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
} catch (error) {
    console.log('Supabase not available, using localStorage fallback');
}

// Global state
let currentUser = null;
let aiPromptCount = parseInt(localStorage.getItem('ai_prompt_count')) || 0;
let isEditing = {
    personal: false,
    preferences: false
};

// DOM Elements
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mainNav = document.getElementById('mainNav');
const profileBtn = document.getElementById('profileBtn');
const profileMenu = document.getElementById('profileMenu');
const loadingOverlay = document.getElementById('loadingOverlay');
const messageDisplay = document.getElementById('messageDisplay');
const messageText = document.getElementById('messageText');

// Avatar elements
const avatarCircle = document.getElementById('avatarCircle');
const avatarCircleMenu = document.getElementById('avatarCircleMenu');
const largeAvatarCircle = document.getElementById('largeAvatarCircle');
const avatarEditBtn = document.getElementById('avatarEditBtn');

// Profile display elements
const profileTitle = document.getElementById('profileTitle');
const profileSubtitle = document.getElementById('profileSubtitle');

// Stats elements
const aiPromptsUsed = document.getElementById('aiPromptsUsed');
const recipesViewed = document.getElementById('recipesViewed');
const memberSince = document.getElementById('memberSince');
const accountStatus = document.getElementById('accountStatus');

// Personal info elements
const displayFullName = document.getElementById('displayFullName');
const displayUsername = document.getElementById('displayUsername');
const displayEmail = document.getElementById('displayEmail');
const displayDob = document.getElementById('displayDob');
const editFullName = document.getElementById('editFullName');
const editUsername = document.getElementById('editUsername');
const editDob = document.getElementById('editDob');

// Account settings elements
const displayAccountType = document.getElementById('displayAccountType');
const displayJoinDate = document.getElementById('displayJoinDate');
const displayPromptsRemaining = document.getElementById('displayPromptsRemaining');

// Preferences elements
const displayDietary = document.getElementById('displayDietary');
const displayCuisine = document.getElementById('displayCuisine');
const displayExperience = document.getElementById('displayExperience');
const editDietary = document.getElementById('editDietary');
const editCuisine = document.getElementById('editCuisine');
const editExperience = document.getElementById('editExperience');

// Button elements
const editPersonalBtn = document.getElementById('editPersonalBtn');
const savePersonalBtn = document.getElementById('savePersonalBtn');
const cancelPersonalBtn = document.getElementById('cancelPersonalBtn');
const personalActions = document.getElementById('personalActions');

const editPreferencesBtn = document.getElementById('editPreferencesBtn');
const savePreferencesBtn = document.getElementById('savePreferencesBtn');
const cancelPreferencesBtn = document.getElementById('cancelPreferencesBtn');
const preferencesActions = document.getElementById('preferencesActions');

const upgradeAccountBtn = document.getElementById('upgradeAccountBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Activity elements
const activityList = document.getElementById('activityList');
const profileCreatedTime = document.getElementById('profileCreatedTime');

// Profile menu elements
const pmName = document.getElementById('pmName');
const pmUsername = document.getElementById('pmUsername');
const upgradeBtn = document.getElementById('upgradeBtn');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadUserProfile();
});

// Event Listeners
function setupEventListeners() {
    // Mobile navigation
    hamburgerBtn?.addEventListener('click', toggleMobileNav);

    // Profile menu
    profileBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleProfileMenu();
    });

    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
        if (!profileMenu?.contains(e.target) && !profileBtn?.contains(e.target)) {
            closeProfileMenu();
        }
        if (!mainNav?.contains(e.target) && !hamburgerBtn?.contains(e.target)) {
            closeMobileNav();
        }
    });

    // Personal info editing
    editPersonalBtn?.addEventListener('click', togglePersonalEdit);
    savePersonalBtn?.addEventListener('click', savePersonalInfo);
    cancelPersonalBtn?.addEventListener('click', cancelPersonalEdit);

    // Preferences editing
    editPreferencesBtn?.addEventListener('click', togglePreferencesEdit);
    savePreferencesBtn?.addEventListener('click', savePreferences);
    cancelPreferencesBtn?.addEventListener('click', cancelPreferencesEdit);

    // Account actions
    upgradeAccountBtn?.addEventListener('click', handleUpgrade);
    upgradeBtn?.addEventListener('click', handleUpgrade);
    logoutBtn?.addEventListener('click', handleLogout);

    // Avatar editing
    avatarEditBtn?.addEventListener('click', handleAvatarEdit);

    // Escape key to close menus
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProfileMenu();
            closeMobileNav();
        }
    });
}

// Navigation functions
function toggleMobileNav() {
    mainNav?.classList.toggle('active');
    hamburgerBtn?.classList.toggle('active');
}

function closeMobileNav() {
    mainNav?.classList.remove('active');
    hamburgerBtn?.classList.remove('active');
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

// User Profile Loading - Updated to work with auth.users
async function loadUserProfile() {
    showLoading(true, 'Loading your profile...');

    try {
        // Check if user is authenticated
        if (supabaseClient) {
            const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
            
            if (sessionError) {
                console.error('Session error:', sessionError);
                showMessage('Error checking authentication: ' + sessionError.message, 'error');
                handleUnauthenticated();
                return;
            }

            if (!session) {
                showMessage('You are not logged in. Redirecting...', 'error');
                handleUnauthenticated();
                return;
            }

            // Load user data from Supabase auth
            await loadSupabaseUser(session);
        } else {
            // Fallback to localStorage
            await loadLocalUser();
        }

        updateProfileDisplay();
        updateProfileStats();
        loadRecentActivity();

    } catch (error) {
        console.error('Error loading profile:', error);
        showMessage('Error loading profile. Please refresh the page.', 'error');
    } finally {
        showLoading(false);
    }
}

// Load user data from Supabase auth.users
async function loadSupabaseUser(session) {
    const user = session.user;
    const userMetadata = user.user_metadata || {};

    console.log('Loading user from auth.users:', user);

    // Build current user object from auth.users data
    currentUser = {
        id: user.id,
        email: user.email,
        fullName: userMetadata.full_name || userMetadata.fullName || 'User',
        username: userMetadata.username || user.email.split('@')[0],
        accountType: userMetadata.account_type || userMetadata.accountType || 'Free',
        dob: userMetadata.dob || null,
        createdAt: user.created_at,
        dietary: userMetadata.dietary || userMetadata.dietary_restrictions || [],
        cuisine: userMetadata.cuisine || userMetadata.favorite_cuisine || '',
        experience: userMetadata.experience || userMetadata.cooking_experience || 'beginner'
    };

    // Store in localStorage for consistency
    localStorage.setItem('smartrecipes_user', JSON.stringify(currentUser));
    
    console.log('Current user loaded:', currentUser);
}

async function loadLocalUser() {
    const localUser = JSON.parse(localStorage.getItem('smartrecipes_user'));
    if (localUser) {
        currentUser = {
            ...localUser,
            dietary: localUser.dietary || [],
            cuisine: localUser.cuisine || '',
            experience: localUser.experience || 'beginner'
        };
    } else {
        handleUnauthenticated();
    }
}

function handleUnauthenticated() {
    setTimeout(() => {
        window.location.href = '../../loginpage/login.html';
    }, 2000);
}

// Profile Display Updates
function updateProfileDisplay() {
    if (!currentUser) return;

    const initials = getInitials(currentUser.fullName);
    
    // Update avatars
    if (avatarCircle) avatarCircle.textContent = initials;
    if (avatarCircleMenu) avatarCircleMenu.textContent = initials;
    if (largeAvatarCircle) largeAvatarCircle.textContent = initials;

    // Update profile header
    if (profileTitle) profileTitle.textContent = `Welcome, ${currentUser.fullName}`;
    if (profileSubtitle) profileSubtitle.textContent = `Manage your ${currentUser.accountType} account`;

    // Update profile menu
    if (pmName) pmName.textContent = currentUser.fullName;
    if (pmUsername) pmUsername.textContent = `@${currentUser.username}`;

    // Update personal information
    if (displayFullName) displayFullName.textContent = currentUser.fullName || 'Not provided';
    if (displayUsername) displayUsername.textContent = currentUser.username || 'Not set';
    if (displayEmail) displayEmail.textContent = currentUser.email || 'Not provided';
    if (displayDob) displayDob.textContent = formatDate(currentUser.dob) || 'Not provided';

    // Update account settings
    if (displayAccountType) {
        displayAccountType.textContent = currentUser.accountType || 'Free';
        displayAccountType.className = `badge ${currentUser.accountType === 'Premium' ? 'premium' : 'free'}`;
    }
    if (displayJoinDate) displayJoinDate.textContent = formatDate(currentUser.createdAt) || 'Unknown';
    if (displayPromptsRemaining) {
        const remaining = currentUser.accountType === 'Premium' ? '∞' : `${Math.max(0, 20 - aiPromptCount)}`;
        displayPromptsRemaining.textContent = remaining;
    }

    // Update preferences
    if (displayDietary) {
        const dietary = Array.isArray(currentUser.dietary) ? currentUser.dietary : [];
        displayDietary.textContent = dietary.length > 0 ? dietary.join(', ') : 'None specified';
    }
    if (displayCuisine) displayCuisine.textContent = currentUser.cuisine || 'Not specified';
    if (displayExperience) {
        const exp = currentUser.experience || 'beginner';
        displayExperience.textContent = exp.charAt(0).toUpperCase() + exp.slice(1);
    }

    // Update profile created time
    if (profileCreatedTime) {
        profileCreatedTime.textContent = getRelativeTime(currentUser.createdAt);
    }
}

function updateProfileStats() {
    if (!currentUser) return;

    // Update AI prompts used
    if (aiPromptsUsed) aiPromptsUsed.textContent = aiPromptCount;

    // Update recipes viewed (placeholder)
    if (recipesViewed) recipesViewed.textContent = Math.floor(Math.random() * 50) + 10;

    // Update member since
    if (memberSince) {
        const joinDate = new Date(currentUser.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - joinDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 30) {
            memberSince.textContent = `${diffDays} days`;
        } else if (diffDays < 365) {
            memberSince.textContent = `${Math.floor(diffDays / 30)} months`;
        } else {
            memberSince.textContent = `${Math.floor(diffDays / 365)} years`;
        }
    }

    // Update account status
    if (accountStatus) accountStatus.textContent = currentUser.accountType || 'Free';
}

function loadRecentActivity() {
    // This would typically load from a database
    // For now, we'll use some sample data
    const activities = [
        {
            icon: '🔍',
            text: 'Used AI recipe suggestion',
            time: '2 hours ago'
        },
        {
            icon: '👁️',
            text: 'Viewed Mediterranean Pasta recipe',
            time: '1 day ago'
        },
        {
            icon: '👤',
            text: 'Profile created',
            time: getRelativeTime(currentUser?.createdAt)
        }
    ];

    if (activityList) {
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-text">
                    <p>${activity.text}</p>
                    <small>${activity.time}</small>
                </div>
            </div>
        `).join('');
    }
}

// Edit Functions
function togglePersonalEdit() {
    isEditing.personal = !isEditing.personal;
    
    if (isEditing.personal) {
        // Show edit fields
        displayFullName.style.display = 'none';
        displayUsername.style.display = 'none';
        displayDob.style.display = 'none';
        
        editFullName.style.display = 'block';
        editUsername.style.display = 'block';
        editDob.style.display = 'block';
        
        // Set current values
        editFullName.value = currentUser.fullName || '';
        editUsername.value = currentUser.username || '';
        editDob.value = currentUser.dob || '';
        
        // Show action buttons
        personalActions.style.display = 'flex';
        editPersonalBtn.textContent = 'Cancel';
    } else {
        cancelPersonalEdit();
    }
}

function cancelPersonalEdit() {
    isEditing.personal = false;
    
    // Hide edit fields
    editFullName.style.display = 'none';
    editUsername.style.display = 'none';
    editDob.style.display = 'none';
    
    // Show display fields
    displayFullName.style.display = 'block';
    displayUsername.style.display = 'block';
    displayDob.style.display = 'block';
    
    // Hide action buttons
    personalActions.style.display = 'none';
    editPersonalBtn.textContent = 'Edit';
}

// Updated save function to work with auth.users metadata
async function savePersonalInfo() {
    const updates = {
        fullName: editFullName.value.trim(),
        username: editUsername.value.trim(),
        dob: editDob.value
    };

    // Enhanced validation
    if (!updates.fullName || !updates.username) {
        showMessage('Name and username are required', 'error');
        return;
    }

    // Username validation
    if (updates.username.length < 3) {
        showMessage('Username must be at least 3 characters long', 'error');
        return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(updates.username)) {
        showMessage('Username can only contain letters, numbers, and underscores', 'error');
        return;
    }

    try {
        showLoading(true, 'Saving changes...');
        
        let updateSuccess = false;

        // Update in Supabase auth.users metadata
        if (supabaseClient && currentUser.id) {
            console.log('Updating user metadata in auth.users...');
            
            // Prepare the updated metadata
            const updatedMetadata = {
                full_name: updates.fullName,
                fullName: updates.fullName, // Keep both for compatibility
                username: updates.username,
                dob: updates.dob,
                account_type: currentUser.accountType,
                accountType: currentUser.accountType, // Keep both for compatibility
                dietary: currentUser.dietary,
                dietary_restrictions: currentUser.dietary, // Keep both for compatibility
                cuisine: currentUser.cuisine,
                favorite_cuisine: currentUser.cuisine, // Keep both for compatibility
                experience: currentUser.experience,
                cooking_experience: currentUser.experience, // Keep both for compatibility
                updated_at: new Date().toISOString()
            };

            console.log('Metadata to update:', updatedMetadata);

            // Update user metadata using Supabase auth
            const { data, error } = await supabaseClient.auth.updateUser({
                data: updatedMetadata
            });

            if (error) {
                console.error('Supabase auth update error:', error);
                throw error;
            }

            if (data && data.user) {
                console.log('User metadata updated successfully:', data.user.user_metadata);
                updateSuccess = true;
            } else {
                console.warn('No data returned from update, but no error occurred');
                updateSuccess = true; // Assume success if no error
            }
        } else {
            console.log('No Supabase client available, using localStorage only');
            updateSuccess = true;
        }

        if (updateSuccess) {
            // Update local data
            currentUser = { ...currentUser, ...updates };
            localStorage.setItem('smartrecipes_user', JSON.stringify(currentUser));

            // Update the display immediately
            updateProfileDisplay();
            cancelPersonalEdit();
            
            showMessage('Profile updated successfully!', 'success');
            console.log('Profile update completed successfully');
        } else {
            throw new Error('Update operation did not complete successfully');
        }

    } catch (error) {
        console.error('Error saving personal info:', error);
        
        // Provide more specific error messages
        if (error.message?.includes('rate limit')) {
            showMessage('Too many update attempts. Please wait a moment and try again.', 'error');
        } else if (error.message?.includes('network')) {
            showMessage('Network error. Please check your connection and try again.', 'error');
        } else if (error.message) {
            showMessage(`Error saving changes: ${error.message}`, 'error');
        } else {
            showMessage('Error saving changes. Please try again.', 'error');
        }
    } finally {
        showLoading(false);
    }
}

function togglePreferencesEdit() {
    isEditing.preferences = !isEditing.preferences;
    
    if (isEditing.preferences) {
        // Show edit fields
        displayDietary.style.display = 'none';
        displayCuisine.style.display = 'none';
        displayExperience.style.display = 'none';
        
        editDietary.style.display = 'block';
        editCuisine.style.display = 'block';
        editExperience.style.display = 'block';
        
        // Set current values
        const dietary = Array.isArray(currentUser.dietary) ? currentUser.dietary : [];
        Array.from(editDietary.options).forEach(option => {
            option.selected = dietary.includes(option.value);
        });
        editCuisine.value = currentUser.cuisine || '';
        editExperience.value = currentUser.experience || 'beginner';
        
        // Show action buttons
        preferencesActions.style.display = 'flex';
        editPreferencesBtn.textContent = 'Cancel';
    } else {
        cancelPreferencesEdit();
    }
}

function cancelPreferencesEdit() {
    isEditing.preferences = false;
    
    // Hide edit fields
    editDietary.style.display = 'none';
    editCuisine.style.display = 'none';
    editExperience.style.display = 'none';
    
    // Show display fields
    displayDietary.style.display = 'block';
    displayCuisine.style.display = 'block';
    displayExperience.style.display = 'block';
    
    // Hide action buttons
    preferencesActions.style.display = 'none';
    editPreferencesBtn.textContent = 'Edit';
}

// Updated preferences save function to work with auth.users metadata
async function savePreferences() {
    const selectedDietary = Array.from(editDietary.selectedOptions).map(option => option.value);
    const updates = {
        dietary: selectedDietary,
        cuisine: editCuisine.value,
        experience: editExperience.value
    };

    try {
        showLoading(true, 'Saving preferences...');

        // Update in Supabase auth.users metadata
        if (supabaseClient && currentUser.id) {
            console.log('Updating preferences in user metadata...');
            
            // Prepare the updated metadata with all existing data
            const updatedMetadata = {
                full_name: currentUser.fullName,
                fullName: currentUser.fullName,
                username: currentUser.username,
                dob: currentUser.dob,
                account_type: currentUser.accountType,
                accountType: currentUser.accountType,
                dietary: updates.dietary,
                dietary_restrictions: updates.dietary,
                cuisine: updates.cuisine,
                favorite_cuisine: updates.cuisine,
                experience: updates.experience,
                cooking_experience: updates.experience,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabaseClient.auth.updateUser({
                data: updatedMetadata
            });

            if (error) {
                console.error('Error updating preferences:', error);
                throw error;
            }

            console.log('Preferences updated successfully:', data);
        }

        // Update local data
        currentUser = { ...currentUser, ...updates };
        localStorage.setItem('smartrecipes_user', JSON.stringify(currentUser));

        updateProfileDisplay();
        cancelPreferencesEdit();
        showMessage('Preferences saved successfully!', 'success');

    } catch (error) {
        console.error('Error saving preferences:', error);
        showMessage(`Error saving preferences: ${error.message || 'Please try again.'}`, 'error');
    } finally {
        showLoading(false);
    }
}

// Account Actions
async function handleUpgrade() {
    if (!currentUser) {
        showMessage('Please log in to upgrade your account.', 'error');
        return;
    }

    try {
        showLoading(true, 'Processing upgrade...');

        // Simulate upgrade process
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update account type
        currentUser.accountType = 'Premium';
        localStorage.setItem('smartrecipes_user', JSON.stringify(currentUser));

        // Update in Supabase auth metadata if available
        if (supabaseClient && currentUser.id) {
            const updatedMetadata = {
                ...currentUser,
                account_type: 'Premium',
                accountType: 'Premium',
                updated_at: new Date().toISOString()
            };

            await supabaseClient.auth.updateUser({
                data: updatedMetadata
            });
        }

        updateProfileDisplay();
        updateProfileStats();
        showMessage('🎉 Account upgraded to Premium successfully!', 'success');

    } catch (error) {
        console.error('Upgrade error:', error);
        showMessage('Upgrade feature coming soon! IntaSend integration in progress.', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleLogout() {
    try {
        showLoading(true, 'Logging out...');

        // Sign out from Supabase if available
        if (supabaseClient) {
            const { error } = await supabaseClient.auth.signOut();
            if (error) {
                console.error('Error signing out:', error);
            }
        }

        // Clear local storage
        localStorage.removeItem('smartrecipes_user');
        localStorage.removeItem('ai_prompt_count');

        showMessage('Logged out successfully. Redirecting...', 'success');
        
        setTimeout(() => {
            window.location.href = '../../loginpage/login.html';
        }, 1500);

    } catch (error) {
        console.error('Logout error:', error);
        showMessage('Error logging out. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

function handleAvatarEdit() {
    showMessage('Avatar upload feature coming soon!', 'error');
}

// Utility Functions
function getInitials(name) {
    if (!name) return 'U';
    return name.split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function formatDate(dateString) {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getRelativeTime(dateString) {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

function showMessage(message, type = 'success') {
    if (messageDisplay && messageText) {
        messageText.textContent = message;
        messageDisplay.className = `message ${type}`;
        messageDisplay.style.display = 'block';

        setTimeout(() => {
            messageDisplay.style.display = 'none';
        }, 5000);
    }
}

function showLoading(show, message = 'Loading...') {
    if (loadingOverlay) {
        if (show) {
            const spinner = loadingOverlay.querySelector('.loading-spinner p');
            if (spinner) spinner.textContent = message;
            loadingOverlay.style.display = 'flex';
        } else {
            loadingOverlay.style.display = 'none';
        }
    }
}

// Auth state listener
if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
            window.location.href = '../../loginpage/login.html';
        } else if (event === 'USER_UPDATED') {
            console.log('User updated event received:', session?.user?.user_metadata);
            // Reload profile data when user is updated
            if (session && session.user) {
                loadSupabaseUser(session);
                updateProfileDisplay();
            }
        }
    });
}