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

// User Profile Loading
async function loadUserProfile() {
    showLoading(true, 'Loading your profile...');

    try {
        // Check if user is authenticated
        if (supabaseClient) {
            const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
            
            if (sessionError) {
                showMessage('Error checking authentication: ' + sessionError.message, 'error');
                handleUnauthenticated();
                return;
            }

            if (!session) {
                showMessage('You are not logged in. Redirecting...', 'error');
                handleUnauthenticated();
                return;
            }

            // Load user data from Supabase
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

async function loadSupabaseUser(session) {
    const user = session.user;
    const userMetadata = user.user_metadata || {};

    // Try to get additional profile data from user_profiles table
    try {
        const { data: profileData, error: profileError } = await supabaseClient
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileData && !profileError) {
            currentUser = {
                id: user.id,
                email: user.email,
                fullName: profileData.full_name || userMetadata.full_name || 'User',
                username: profileData.username || userMetadata.username || user.email.split('@')[0],
                accountType: profileData.account_type || 'Free',
                dob: profileData.dob || userMetadata.dob || null,
                createdAt: profileData.created_at || user.created_at,
                dietary: profileData.dietary_restrictions || [],
                cuisine: profileData.favorite_cuisine || '',
                experience: profileData.cooking_experience || 'beginner'
            };
        } else {
            // Use basic user data
            currentUser = {
                id: user.id,
                email: user.email,
                fullName: userMetadata.full_name || 'User',
                username: userMetadata.username || user.email.split('@')[0],
                accountType: userMetadata.account_type || 'Free',
                dob: userMetadata.dob || null,
                createdAt: user.created_at,
                dietary: [],
                cuisine: '',
                experience: 'beginner'
            };
        }
    } catch (error) {
        console.error('Error loading profile data:', error);
        // Use basic user data as fallback
        currentUser = {
            id: user.id,
            email: user.email,
            fullName: userMetadata.full_name || 'User',
            username: userMetadata.username || user.email.split('@')[0],
            accountType: userMetadata.account_type || 'Free',
            dob: userMetadata.dob || null,
            createdAt: user.created_at,
            dietary: [],
            cuisine: '',
            experience: 'beginner'
        };
    }

    // Store in localStorage for consistency
    localStorage.setItem('smartrecipes_user', JSON.stringify(currentUser));
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

async function savePersonalInfo() {
    const updates = {
        fullName: editFullName.value.trim(),
        username: editUsername.value.trim(),
        dob: editDob.value
    };

    // Validation
    if (!updates.fullName || !updates.username) {
        showMessage('Name and username are required', 'error');
        return;
    }

    try {
        showLoading(true, 'Saving changes...');

        // Update in Supabase if available
        if (supabaseClient && currentUser.id) {
            const { error } = await supabaseClient
                .from('user_profiles')
                .update({
                    full_name: updates.fullName,
                    username: updates.username,
                    dob: updates.dob
                })
                .eq('id', currentUser.id);

            if (error) {
                console.error('Error updating profile:', error);
            }
        }

        // Update local data
        currentUser = { ...currentUser, ...updates };
        localStorage.setItem('smartrecipes_user', JSON.stringify(currentUser));

        updateProfileDisplay();
        cancelPersonalEdit();
        showMessage('Profile updated successfully!', 'success');

    } catch (error) {
        console.error('Error saving personal info:', error);
        showMessage('Error saving changes. Please try again.', 'error');
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

async function savePreferences() {
    const selectedDietary = Array.from(editDietary.selectedOptions).map(option => option.value);
    const updates = {
        dietary: selectedDietary,
        cuisine: editCuisine.value,
        experience: editExperience.value
    };

    try {
        showLoading(true, 'Saving preferences...');

        // Update in Supabase if available
        if (supabaseClient && currentUser.id) {
            const { error } = await supabaseClient
                .from('user_profiles')
                .update({
                    dietary_restrictions: updates.dietary,
                    favorite_cuisine: updates.cuisine,
                    cooking_experience: updates.experience
                })
                .eq('id', currentUser.id);

            if (error) {
                console.error('Error updating preferences:', error);
            }
        }

        // Update local data
        currentUser = { ...currentUser, ...updates };
        localStorage.setItem('smartrecipes_user', JSON.stringify(currentUser));

        updateProfileDisplay();
        cancelPreferencesEdit();
        showMessage('Preferences saved successfully!', 'success');

    } catch (error) {
        console.error('Error saving preferences:', error);
        showMessage('Error saving preferences. Please try again.', 'error');
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

        // Update in Supabase if available
        if (supabaseClient && currentUser.id) {
            await supabaseClient
                .from('user_profiles')
                .update({ account_type: 'Premium' })
                .eq('id', currentUser.id);
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
        }
    });
}