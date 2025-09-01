// Configuration - Add your Gemini API key here
const GEMINI_API_KEY = 'AIzaSyCGrZ7zOlM2WVu2CNIIZyy62InCEM_RXHU'; // Replace with your actual API key
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

// Supabase Client Configuration
const SUPABASE_URL = 'https://hrfvkblkpihdzcuodwzz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZnZrYmxrcGloZHpjdW9kd3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzODg1MzUsImV4cCI6MjA3MTk2NDUzNX0.n8bIKKS1UkGYyQnP-Dbis5kl5AqvYVovSeefa_sVTZE';

// Initialize Supabase client
let supabaseClient = null;
try {
    if (typeof supabase !== 'undefined') {
        const { createClient } = supabase;
        supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
} catch (error) {
    console.log('Supabase not available, using localStorage fallback');
}

// Global state
let currentUser = null;
let aiPromptCount = 0;
let currentPlanFilter = 'all';

// Sample meal plans data
const samplePlans = [
    {
        id: 1,
        title: "Weight Loss Support",
        description: "Balanced calorie-controlled meals with adequate protein and fiber",
        category: "weight-management",
        icon: "⚖️",
        duration: "4 weeks",
        features: [
            "1200-1500 calorie daily plans",
            "High protein, moderate carb approach",
            "Meal prep friendly options",
            "Weekly shopping lists included"
        ],
        isPremium: false
    },
    {
        id: 2,
        title: "Family Nutrition Plan",
        description: "Wholesome meals that satisfy both kids and adults",
        category: "family",
        icon: "👨‍👩‍👧‍👦",
        duration: "2 weeks",
        features: [
            "Kid-friendly nutritious options",
            "Family-sized portions",
            "Hidden veggie recipes",
            "Budget-conscious meal ideas"
        ],
        isPremium: false
    },
    {
        id: 3,
        title: "Heart-Healthy Living",
        description: "DASH diet inspired meals for cardiovascular wellness",
        category: "health-conditions",
        icon: "❤️",
        duration: "4 weeks",
        features: [
            "Low sodium, high potassium focus",
            "Omega-3 rich meal options",
            "Whole grain emphasis",
            "Blood pressure friendly recipes"
        ],
        isPremium: true
    },
    {
        id: 4,
        title: "Diabetes Management",
        description: "Blood sugar friendly meals with controlled carbohydrates",
        category: "health-conditions",
        icon: "🩺",
        duration: "4 weeks",
        features: [
            "Glycemic index conscious meals",
            "Portion control guidance",
            "Balanced macronutrient ratios",
            "Snack planning included"
        ],
        isPremium: true
    },
    {
        id: 5,
        title: "Plant-Based Wellness",
        description: "Complete nutrition from plant-based sources",
        category: "specialized",
        icon: "🌱",
        duration: "3 weeks",
        features: [
            "Complete protein combinations",
            "B12 and iron rich options",
            "Varied plant protein sources",
            "Seasonal produce focus"
        ],
        isPremium: false
    },
    {
        id: 6,
        title: "Senior Nutrition",
        description: "Age-appropriate nutrition for healthy aging",
        category: "specialized",
        icon: "🧓",
        duration: "4 weeks",
        features: [
            "Bone health supporting foods",
            "Easy-to-digest options",
            "Anti-inflammatory focus",
            "Medication-friendly timing"
        ],
        isPremium: true
    }
];

// DOM Elements
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mainNav = document.getElementById('mainNav');
const profileBtn = document.getElementById('profileBtn');
const generatePlanBtn = document.getElementById('generatePlanBtn');
const mealPlanOutput = document.getElementById('mealPlanOutput');
const plansGallery = document.getElementById('plansGallery');
const overlay = document.getElementById('overlay');

// Form elements
const healthGoalSelect = document.getElementById('healthGoal');
const ageGroupSelect = document.getElementById('ageGroup');
const activityLevelSelect = document.getElementById('activityLevel');
const dietaryRestrictionsSelect = document.getElementById('dietaryRestrictions');
const healthConditionsTextarea = document.getElementById('healthConditions');
const countryInput = document.getElementById('country');

// Initialize app
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initializing meal planner...');
    
    await initializeUserAccount();
    setupEventListeners();
    
    setTimeout(() => {
        renderPlansGallery();
        setupAnimations();
    }, 100);

    console.log('Meal planner initialized successfully');
});

// User account initialization (simplified since user already has account)
async function initializeUserAccount() {
    try {
        // Load AI prompt count
        aiPromptCount = parseInt(localStorage.getItem('ai_prompt_count')) || 0;
        
        // Check for existing user data
        if (supabaseClient) {
            const { data: { session }, error } = await supabaseClient.auth.getSession();
            
            if (session && !error) {
                await loadUserFromSupabase(session.user);
                updateAvatarDisplay();
                return;
            }
        }
        
        // Fallback to localStorage
        const localUser = JSON.parse(localStorage.getItem('smartrecipes_user'));
        if (localUser) {
            currentUser = localUser;
            updateAvatarDisplay();
        } else {
            // Create a default user for demo purposes
            currentUser = {
                id: 'demo_user',
                fullName: 'Demo User',
                username: 'demo_user',
                accountType: 'Free'
            };
            updateAvatarDisplay();
        }
        
    } catch (error) {
        console.error('Error initializing user account:', error);
        currentUser = {
            id: 'demo_user',
            fullName: 'Demo User',
            username: 'demo_user',
            accountType: 'Free'
        };
        updateAvatarDisplay();
    }
}

async function loadUserFromSupabase(user) {
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
                fullName: profileData.full_name,
                username: profileData.username,
                accountType: profileData.account_type || 'Free',
                dob: profileData.dob,
                contact: profileData.contact,
                address: profileData.address,
                gender: profileData.gender,
                createdAt: profileData.created_at,
                updatedAt: profileData.updated_at
            };
        } else {
            const userMetadata = user.user_metadata || {};
            currentUser = {
                id: user.id,
                email: user.email,
                fullName: userMetadata.full_name || userMetadata.name || 'User',
                username: userMetadata.username || user.email.split('@')[0],
                accountType: userMetadata.account_type || 'Free',
                dob: userMetadata.dob,
                createdAt: user.created_at
            };
        }
        
        localStorage.setItem('smartrecipes_user', JSON.stringify(currentUser));
        console.log('User loaded from Supabase:', currentUser);
        
    } catch (error) {
        console.error('Error loading user from Supabase:', error);
        throw error;
    }
}

function updateAvatarDisplay() {
    const avatarCircle = document.getElementById('avatarCircle');
    
    if (currentUser && currentUser.fullName) {
        const initials = currentUser.fullName
            .split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
        avatarCircle.textContent = initials;
    } else {
        avatarCircle.textContent = 'G';
    }
}

// Event listeners
function setupEventListeners() {
    // Profile button
    profileBtn?.addEventListener('click', () => {
        window.location.href = '../profile/profile.html';
    });

    // Mobile navigation
    hamburgerBtn?.addEventListener('click', toggleMobileNav);

    // Generate meal plan
    generatePlanBtn?.addEventListener('click', handleGeneratePlan);

    // Plan filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const category = e.target.dataset.category;
            setActivePlanFilter(category);
            filterPlans(category);
        });
    });

    // Close mobile navigation when clicking outside
    document.addEventListener('click', (e) => {
        if (!mainNav?.contains(e.target) && !hamburgerBtn?.contains(e.target)) {
            closeMobileNav();
        }
    });

    // Escape key to close mobile nav
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
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

// Main meal plan generation function
async function handleGeneratePlan() {
    // Validate form inputs
    const healthGoal = healthGoalSelect?.value;
    const ageGroup = ageGroupSelect?.value;
    const activityLevel = activityLevelSelect?.value;
    
    if (!healthGoal || !ageGroup || !activityLevel) {
        showNotification('Please fill in your health goal, age group, and activity level', 'error');
        return;
    }

    // Check AI prompt limits for free users
    const MAX_FREE_PROMPTS = 20;
    if (currentUser?.accountType !== 'Premium') {
        if (aiPromptCount >= MAX_FREE_PROMPTS) {
            showNotification(`You have reached your free AI prompt limit (${MAX_FREE_PROMPTS}). Upgrade to Premium for unlimited meal plans!`, 'warning');
            return;
        }
    }

    // Show loading state
    generatePlanBtn.textContent = 'Creating Your Plan...';
    generatePlanBtn.disabled = true;
    mealPlanOutput.style.display = 'block';
    mealPlanOutput.innerHTML = '<div class="loading-spinner">🍽️ AI is creating your personalized meal plan...</div>';

    try {
        const planData = collectFormData();
        let response;
        // Always use Gemini API for meal plan generation
        response = await callGeminiForMealPlan(planData);
        displayMealPlan(planData, response);

        // Increment prompt count for free users
        if (currentUser?.accountType !== 'Premium') {
            aiPromptCount++;
            localStorage.setItem('ai_prompt_count', aiPromptCount.toString());
        }

    } catch (error) {
        console.error('Meal plan generation error:', error);
        const fallbackPlan = generateFallbackMealPlan(collectFormData());
        displayMealPlan(collectFormData(), fallbackPlan);
        showNotification('Using demo meal plan. Check your API key for personalized AI plans.', 'info');
    }

    // Reset button
    generatePlanBtn.textContent = 'Generate My Meal Plan';
    generatePlanBtn.disabled = false;
}

function collectFormData() {
    const selectedDietary = Array.from(dietaryRestrictionsSelect?.selectedOptions || [])
        .map(option => option.value)
        .filter(value => value !== 'none');

    return {
        healthGoal: healthGoalSelect?.value || '',
        ageGroup: ageGroupSelect?.value || '',
        activityLevel: activityLevelSelect?.value || '',
        dietaryRestrictions: selectedDietary,
        healthConditions: healthConditionsTextarea?.value.trim() || '',
        country: countryInput?.value.trim() || ''
    };
}

async function callGeminiForMealPlan(planData) {
    const prompt = `You are a registered dietitian and certified nutrition specialist. Create a personalized 7-day meal plan based on these requirements:

Health Goal: ${planData.healthGoal}
Age Group: ${planData.ageGroup}
Activity Level: ${planData.activityLevel}
Country: ${planData.country || 'Not specified'}
Dietary Restrictions: ${planData.dietaryRestrictions.join(', ') || 'None'}
Health Considerations: ${planData.healthConditions || 'None specified'}

IMPORTANT GUIDELINES:
- Prioritize balanced, evidence-based nutrition
- Ensure all recommendations are safe and appropriate
- For weight loss goals, maintain minimum 1200 calories for women, 1500 for men
- For specialized health conditions, focus on general healthy eating principles
- Include variety and cultural sensitivity
- Emphasize whole foods and balanced macronutrients
- Suggest common local foods and dishes from the user's country when possible

Please create a 7-day meal plan with:
1. Breakfast, Lunch, Dinner, and 1-2 Snacks for each day
2. Brief nutritional highlights for each meal
3. Estimated calories per meal (when appropriate)
4. Simple, practical meal ideas

Format as HTML using these elements:
- <div class="day-plan"> for each day
- <div class="day-header"> for day name (include a unique emoji for each day, e.g. "🌞 Monday")
- <div class="meal-slot"> for each meal
- <div class="meal-name"> for meal titles (include a relevant emoji for each meal, e.g. "Breakfast 🥣")
- <div class="meal-description"> for descriptions
- <div class="meal-nutrition"> for nutritional info

Make sure to:
- Include all 7 days (Monday to Sunday)
- Use a different emoji for each day in <div class='day-header'>
- Use a relevant emoji for each meal in <div class='meal-name'>
- Do not skip any days
- Respond only with the HTML, no explanations

Focus on sustainable, balanced eating habits rather than restrictive approaches.`;

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
            maxOutputTokens: 3000,
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

    const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
    } else {
        throw new Error('Invalid response format from Gemini API');
    }
}

function generateFallbackMealPlan(planData) {
    const goalSpecificPlans = {
        'weight-loss': generateWeightLossPlan(),
        'heart-health': generateHeartHealthyPlan(),
        'diabetes-management': generateDiabeticFriendlyPlan(),
        'general-wellness': generateGeneralWellnessPlan(),
        'child-nutrition': generateChildNutritionPlan(),
        'senior-nutrition': generateSeniorNutritionPlan()
    };

    return goalSpecificPlans[planData.healthGoal] || generateGeneralWellnessPlan();
}

function generateWeightLossPlan() {
    return `
        <div class="day-plan">
            <div class="day-header">🌅 Monday</div>
            <div class="meal-slot">
                <div class="meal-name">Breakfast: Protein-Rich Oatmeal Bowl</div>
                <div class="meal-description">Steel-cut oats with Greek yogurt, berries, and a sprinkle of nuts</div>
                <div class="meal-nutrition">📊 ~350 calories | 🥩 20g protein | 🌾 45g carbs</div>
            </div>
            <div class="meal-slot">
                <div class="meal-name">Lunch: Mediterranean Chicken Salad</div>
                <div class="meal-description">Grilled chicken breast over mixed greens with cucumber, tomatoes, and olive oil dressing</div>
                <div class="meal-nutrition">📊 ~400 calories | 🥩 35g protein | 🥗 High fiber</div>
            </div>
            <div class="meal-slot">
                <div class="meal-name">Dinner: Baked Salmon with Vegetables</div>
                <div class="meal-description">Herb-crusted salmon with roasted broccoli and sweet potato</div>
                <div class="meal-nutrition">📊 ~450 calories | 🐟 Omega-3 rich | 🥦 Antioxidants</div>
            </div>
            <div class="meal-slot">
                <div class="meal-name">Snack: Apple with Almond Butter</div>
                <div class="meal-description">Fresh apple slices with 1 tbsp natural almond butter</div>
                <div class="meal-nutrition">📊 ~180 calories | 🌰 Healthy fats | 🍎 Fiber</div>
            </div>
        </div>
        
        <div class="day-plan">
            <div class="day-header">🌤️ Tuesday</div>
            <div class="meal-slot">
                <div class="meal-name">Breakfast: Vegetable Egg Scramble</div>
                <div class="meal-description">Two eggs scrambled with spinach, tomatoes, and mushrooms</div>
                <div class="meal-nutrition">📊 ~300 calories | 🥩 18g protein | 🥬 Iron rich</div>
            </div>
            <div class="meal-slot">
                <div class="meal-name">Lunch: Quinoa Buddha Bowl</div>
                <div class="meal-description">Quinoa with roasted vegetables, chickpeas, and tahini dressing</div>
                <div class="meal-nutrition">📊 ~420 calories | 🌱 Complete protein | 🌈 Colorful nutrients</div>
            </div>
            <div class="meal-slot">
                <div class="meal-name">Dinner: Lean Turkey Stir-fry</div>
                <div class="meal-description">Ground turkey with mixed vegetables over cauliflower rice</div>
                <div class="meal-nutrition">📊 ~380 calories | 🥩 30g protein | 🥬 Low carb</div>
            </div>
            <div class="meal-slot">
                <div class="meal-name">Snack: Greek Yogurt Parfait</div>
                <div class="meal-description">Plain Greek yogurt with berries and a drizzle of honey</div>
                <div class="meal-nutrition">📊 ~150 calories | 🥛 Probiotics | 🫐 Antioxidants</div>
            </div>
        </div>
    `;
}

function generateHeartHealthyPlan() {
    return `
        <div class="day-plan">
            <div class="day-header">❤️ Monday - Heart Healthy Start</div>
            <div class="meal-slot">
                <div class="meal-name">Breakfast: Overnight Oats with Berries</div>
                <div class="meal-description">Steel-cut oats with blueberries, walnuts, and ground flaxseed</div>
                <div class="meal-nutrition">💚 Low sodium | 🐟 Omega-3 rich | 🫐 Antioxidants</div>
            </div>
            <div class="meal-slot">
                <div class="meal-name">Lunch: Lentil and Vegetable Soup</div>
                <div class="meal-description">Hearty lentil soup with carrots, celery, and herbs (low sodium)</div>
                <div class="meal-nutrition">💚 High potassium | 🌱 Plant protein | 🥕 Beta-carotene</div>
            </div>
            <div class="meal-slot">
                <div class="meal-name">Dinner: Baked Cod with Quinoa</div>
                <div class="meal-description">Herb-baked cod with quinoa pilaf and steamed asparagus</div>
                <div class="meal-nutrition">🐟 Lean protein | 🌾 Whole grains | 🥒 Folate rich</div>
            </div>
            <div class="meal-slot">
                <div class="meal-name">Snack: Handful of Unsalted Nuts</div>
                <div class="meal-description">Mixed nuts (almonds, walnuts) with no added salt</div>
                <div class="meal-nutrition">🌰 Healthy fats | 💚 Heart protective | 🥜 Vitamin E</div>
            </div>
        </div>
    `;
}

function generateDiabeticFriendlyPlan() {
    return `
        <div class="day-plan">
            <div class="day-header">🩺 Monday - Blood Sugar Friendly</div>
            <div class="meal-slot">
                <div class="meal-name">Breakfast: Protein-Rich Egg Bowl</div>
                <div class="meal-description">Scrambled eggs with spinach and half an avocado on whole grain toast</div>
                <div class="meal-nutrition">📉 Low glycemic | 🥩 High protein | 🥑 Healthy fats</div>
            </div>
            <div class="meal-slot">
                <div class="meal-name">Lunch: Grilled Chicken and Bean Salad</div>
                <div class="meal-description">Grilled chicken with black beans, vegetables, and olive oil dressing</div>
                <div class="meal-nutrition">📉 Balanced macros | 🌱 Fiber rich | 🥗 Non-starchy vegetables</div>
            </div>
            <div class="meal-slot">
                <div class="meal-name">Dinner: Baked Fish with Roasted Vegetables</div>
                <div class="meal-description">Herb-baked tilapia with roasted zucchini, bell peppers, and brown rice</div>
                <div class="meal-nutrition">🐟 Lean protein | 🌾 Complex carbs | 🥒 Low glycemic vegetables</div>
            </div>
            <div class="meal-slot">
                <div class="meal-name">Snack: Cheese and Vegetable Sticks</div>
                <div class="meal-description">Low-fat cheese with cucumber and bell pepper strips</div>
                <div class="meal-nutrition">🧀 Protein | 🥒 Low carb | 💧 Hydrating</div>
            </div>
        </div>
    `;
}

function generateGeneralWellnessPlan() {
    return `
        <div class="day-plan">
            <div class="day-header">🌟 Monday - Wellness Focus</div>
            <div class="meal-slot">
                <div class="meal-name">Breakfast: Balanced Smoothie Bowl</div>
                <div class="meal-description">Banana, spinach, protein powder smoothie topped with granola and seeds</div>
                <div class="meal-nutrition">🌈 Nutrient dense | 🥩 Complete protein | 🌱 Antioxidants</div>
            </div>
            <div class="meal-slot">
                <div class="meal-name">Lunch: Whole Grain Bowl</div>
                <div class="meal-description">Brown rice with grilled vegetables, lean protein, and avocado</div>
                <div class="meal-nutrition">🌾 Whole grains | 🥑 Healthy fats | 🌈 Colorful nutrients</div>
            </div>
            <div class="meal-slot">
                <div class="meal-name">Dinner: Mediterranean-Style Plate</div>
                <div class="meal-description">Grilled chicken with roasted vegetables and quinoa</div>
                <div class="meal-nutrition">🍅 Mediterranean diet | 🌾 Complete protein | 🫒 Healthy fats</div>
            </div>
            <div class="meal-slot">
                <div class="meal-name">Snack: Trail Mix</div>
                <div class="meal-description">Homemade mix of nuts, seeds, and dried fruit (unsweetened)</div>
                <div class="meal-nutrition">🌰 Energy sustaining | 🍇 Natural sugars | 💪 Satisfying</div>
            </div>
        </div>
    `;
}

function generateChildNutritionPlan() {
    return `
        <div class="day-plan">
            <div class="day-header">👶 Monday - Growing Bodies</div>
            <div class="meal-slot">
                <div class="meal-name">Breakfast: Whole Grain Pancakes</div>
                <div class="meal-description">Small whole wheat pancakes with banana slices and a drizzle of pure maple syrup</div>
                <div class="meal-nutrition">🌾 Whole grains | 🍌 Potassium | 🥞 Kid-friendly</div>
            </div>
            <div class="meal-slot">
                <div class="meal-name">Lunch: Mini Meatballs with Pasta</div>
                <div class="meal-description">Lean beef meatballs with whole grain pasta and hidden vegetable sauce</div>
                <div class="meal-nutrition">🥩 Iron rich | 🍅 Hidden vegetables | 🌾 Energy for growth</div>
            </div>
            <div class="meal-slot">
                <div class="meal-name">Dinner: Baked Fish Fingers</div>
                <div class="meal-description">Homemade baked fish fingers with sweet potato fries and peas</div>
                <div class="meal-nutrition">🐟 Brain development | 🍠 Beta-carotene | 🟢 Vitamins</div>
            </div>
            <div class="meal-slot">
                <div class="meal-name">Snacks: Fruit and Cheese</div>
                <div class="meal-description">Apple slices with mild cheese cubes and whole grain crackers</div>
                <div class="meal-nutrition">🍎 Natural sugars | 🧀 Calcium | 🌾 Sustained energy</div>
            </div>
        </div>
    `;
}

function generateSeniorNutritionPlan() {
    return `
        <div class="day-plan">
            <div class="day-header">🧓 Monday - Healthy Aging</div>
            <div class="meal-slot">
                <div class="meal-name">Breakfast: Fortified Cereal with Milk</div>
                <div class="meal-description">Whole grain cereal with milk, sliced banana, and chopped walnuts</div>
                <div class="meal-nutrition">🦴 Calcium & Vitamin D | 🧠 Brain health | 🍌 Digestive friendly</div>
            </div>
            <div class="meal-slot">
                <div class="meal-name">Lunch: Soft Chicken and Vegetable Stew</div>
                <div class="meal-description">Tender chicken stew with carrots, potatoes, and herbs</div>
                <div class="meal-nutrition">🥩 Easy to digest protein | 🥕 Immune support | 💧 Hydrating</div>
            </div>
            <div class="meal-slot">
                <div class="meal-name">Dinner: Baked Salmon with Mashed Sweet Potato</div>
                <div class="meal-description">Gentle baked salmon with smooth mashed sweet potato and green beans</div>
                <div class="meal-nutrition">🐟 Anti-inflammatory | 🍠 Vitamin A | 🟢 Antioxidants</div>
            </div>
            <div class="meal-slot">
                <div class="meal-name">Snack: Smoothie</div>
                <div class="meal-description">Protein smoothie with banana, yogurt, and a touch of honey</div>
                <div class="meal-nutrition">🥛 Protein | 🍌 Easy to swallow | 💪 Muscle maintenance</div>
            </div>
        </div>
    `;
}

function displayMealPlan(planData, response) {
    const goalLabels = {
        'weight-loss': 'Weight Loss Support',
        'weight-gain': 'Healthy Weight Gain',
        'muscle-building': 'Muscle Building',
        'heart-health': 'Heart Health',
        'diabetes-management': 'Diabetes Management',
        'general-wellness': 'General Wellness',
        'pregnancy-nutrition': 'Pregnancy Nutrition',
        'child-nutrition': 'Child Nutrition',
        'senior-nutrition': 'Senior Nutrition',
        'eating-disorder-recovery': 'Recovery Support'
    };

    const goalLabel = goalLabels[planData.healthGoal] || 'Personalized Plan';

    // Remove any visible code block tags (e.g. ```html or ```)
    let cleanedResponse = response.replace(/```html|```/g, '').trim();
    mealPlanOutput.innerHTML = `
        <h3>${goalLabel}</h3>
        <div class="weekly-plan">${cleanedResponse}</div>
        <button class="btn ghost" id="closeMealPlanBtn">Close</button>
    `;
    mealPlanOutput.style.display = 'block';
    document.getElementById('closeMealPlanBtn')?.addEventListener('click', () => {
        mealPlanOutput.style.display = 'none';
    });
}

// Notification utility
function showNotification(message, type = 'info', duration = 4000) {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), duration);
}

// Plans gallery rendering
function renderPlansGallery() {
    if (!plansGallery) return;
    plansGallery.innerHTML = '';
    const filteredPlans = currentPlanFilter === 'all'
        ? samplePlans
        : samplePlans.filter(plan => plan.category === currentPlanFilter);
    filteredPlans.forEach(plan => {
        const card = document.createElement('div');
        card.className = `plan-card${plan.isPremium ? ' premium' : ''} plan-${plan.category}`;
        card.innerHTML = `
            <div class="plan-header">
                <span class="plan-icon">${plan.icon}</span>
                <h3>${plan.title}</h3>
                <p>${plan.description}</p>
            </div>
            <div class="plan-content">
                <div class="plan-duration"><strong>Duration:</strong> ${plan.duration}</div>
                <ul class="plan-features">
                    ${plan.features.map(f => `<li>${f}</li>`).join('')}
                </ul>
                ${plan.isPremium ? '<span class="premium-badge">Premium</span>' : ''}
            </div>
        `;
        card.addEventListener('click', () => {
            showNotification(
                plan.isPremium
                    ? 'Upgrade to Premium to access this plan!'
                    : 'This is a sample plan. Use the form above for a personalized plan.',
                plan.isPremium ? 'warning' : 'info',
                3500
            );
        });
        plansGallery.appendChild(card);
    });
}

function setActivePlanFilter(category) {
    currentPlanFilter = category;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
}

function filterPlans(category) {
    renderPlansGallery();
}

// Simple animation setup for gallery
function setupAnimations() {
    document.querySelectorAll('.plan-card').forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        setTimeout(() => {
            card.style.transition = 'all 0.5s cubic-bezier(.25,.8,.25,1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 + i * 100);
    });
}