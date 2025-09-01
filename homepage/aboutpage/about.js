// Hamburger menu logic for about.html
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');
    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            hamburgerBtn.classList.toggle('active');
        });
        document.addEventListener('click', function(e) {
            if (navLinks.classList.contains('active')) {
                if (!navLinks.contains(e.target) && !hamburgerBtn.contains(e.target)) {
                    navLinks.classList.remove('active');
                    hamburgerBtn.classList.remove('active');
                }
            }
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                hamburgerBtn.classList.remove('active');
            });
        });
    }
});
// About Us JavaScript - Enhanced interactions and animations

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initScrollAnimations();
    initParallaxEffects();
    initCounterAnimations();
    initMobileMenu();
    initSmoothScrolling();
    initHeaderScrollEffect();
    initFounderCardInteractions();
    initTimelineAnimations();
    initTypingEffect();
    
    console.log('About Us page initialized successfully');
});

// Smooth scroll animation observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Trigger counter animations when stats come into view
                if (entry.target.classList.contains('charity-stats') || 
                    entry.target.classList.contains('founder-stats')) {
                    animateCounters(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations
    const elementsToAnimate = [
        '.mvp-card',
        '.founder-card',
        '.charity-card',
        '.testimonial-card',
        '.impact-highlights',
        '.timeline-item',
        '.charity-stats',
        '.founder-stats'
    ];

    elementsToAnimate.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, index) => {
            el.classList.add('fade-in');
            el.style.animationDelay = `${index * 0.2}s`;
            observer.observe(el);
        });
    });
}

// Counter animations for statistics
function animateCounters(container) {
    const counters = container.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = counter.textContent;
        const isNumber = !isNaN(target.replace(/[+,]/g, ''));
        
        if (isNumber) {
            const finalValue = parseInt(target.replace(/[+,]/g, ''));
            const increment = finalValue / 50; // 50 steps
            let current = 0;
            
            const updateCounter = () => {
                if (current < finalValue) {
                    current += increment;
                    const displayValue = Math.floor(current);
                    counter.textContent = target.includes('+') ? displayValue + '+' : displayValue;
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target; // Ensure final value is exact
                }
            };
            
            counter.textContent = '0';
            updateCounter();
        }
    });
}

// Parallax effects for hero section
function initParallaxEffects() {
    const hero = document.querySelector('.hero');
    const floatingElements = document.querySelectorAll('.floating-element');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.3;
        
        if (hero) {
            hero.style.transform = `translateY(${rate}px)`;
        }
        
        // Move floating elements at different speeds
        floatingElements.forEach((element, index) => {
            const speed = 0.1 + (index * 0.05);
            const yPos = scrolled * speed;
            element.style.transform = `translateY(${yPos}px) rotate(${yPos * 0.1}deg)`;
        });
    });
}

// Header scroll effect
function initHeaderScrollEffect() {
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(102, 126, 234, 0.95)';
            header.style.backdropFilter = 'blur(20px)';
            header.style.padding = '0.8rem 0';
        } else {
            header.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            header.style.backdropFilter = 'blur(10px)';
            header.style.padding = '1rem 0';
        }
    });
}

// Mobile menu functionality
function initMobileMenu() {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    let isMenuOpen = false;
    
    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            if (isMenuOpen) {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.right = '0';
                navLinks.style.background = 'rgba(102, 126, 234, 0.98)';
                navLinks.style.padding = '2rem';
                navLinks.style.backdropFilter = 'blur(20px)';
                navLinks.style.borderRadius = '0 0 20px 20px';
                navLinks.style.animation = 'slideDown 0.3s ease';
                navLinks.style.zIndex = '1000';
            } else {
                navLinks.style.display = 'none';
            }
            // Animate hamburger menu
            const spans = mobileBtn.querySelectorAll('span');
            if (isMenuOpen) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'rotate(0) translate(0, 0)';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'rotate(0) translate(0, 0)';
            }
        });
    }

    // Close menu when clicking on a link
    const navLinkItems = document.querySelectorAll('.nav-links a');
    navLinkItems.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                isMenuOpen = false;
                navLinks.style.display = 'none';
                const spans = mobileBtn.querySelectorAll('span');
                spans[0].style.transform = 'rotate(0) translate(0, 0)';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'rotate(0) translate(0, 0)';
            }
        });
    });
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Enhanced founder card interactions
function initFounderCardInteractions() {
    const founderCards = document.querySelectorAll('.founder-card');
    
    founderCards.forEach(card => {
        const founderImage = card.querySelector('.founder-image');
        
        // Add tilt effect on mouse move
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
        
        // Add click effect for founder images
        if (founderImage) {
            founderImage.addEventListener('click', () => {
                // Create ripple effect
                const ripple = document.createElement('div');
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.6);
                    transform: scale(0);
                    animation: rippleEffect 0.6s linear;
                    pointer-events: none;
                `;
                
                const rect = founderImage.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = '0';
                ripple.style.top = '0';
                
                founderImage.style.position = 'relative';
                founderImage.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        }
    });
}

// Timeline animations
function initTimelineAnimations() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                    entry.target.style.animation = `slideInTimeline 0.8s ease forwards`;
                }, index * 200);
            }
        });
    }, { threshold: 0.3 });
    
    timelineItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = index % 2 === 0 ? 'translateX(-100px)' : 'translateX(100px)';
        timelineObserver.observe(item);
    });
}

// Typing effect for hero title
function initTypingEffect() {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
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
        setTimeout(typeWriter, 1000);
    }
}

// Scroll progress indicator
function createScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(45deg, #ff6b6b, #ee5a24);
        z-index: 9999;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.offsetHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    });
}

// Initialize scroll progress
createScrollProgress();

// Add custom CSS animations
const customStyles = document.createElement('style');
customStyles.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideInTimeline {
        from {
            opacity: 0;
            transform: translateX(var(--translate-x, -100px));
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes rippleEffect {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
    
    .mvp-card:hover .mvp-icon {
        animation: pulse 1s infinite;
    }
    
    .charity-card:hover .charity-icon {
        animation: bounce 1s infinite;
    }
`;
document.head.appendChild(customStyles);

// Interactive features for MVP cards
function initMVPCardEffects() {
    const mvpCards = document.querySelectorAll('.mvp-card');
    
    mvpCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Add glow effect
            card.style.boxShadow = '0 25px 60px rgba(102, 126, 234, 0.2)';
            
            // Animate icon
            const icon = card.querySelector('.mvp-icon');
            if (icon) {
                icon.style.transform = 'scale(1.2) rotate(5deg)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.boxShadow = '0 15px 40px rgba(0,0,0,0.1)';
            
            const icon = card.querySelector('.mvp-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
}

// Initialize MVP card effects
setTimeout(initMVPCardEffects, 1000);

// Easter egg: Konami code
let konamiCode = [];
const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.code);
    
    if (konamiCode.length > konamiSequence.length) {
        konamiCode = konamiCode.slice(-konamiSequence.length);
    }
    
    if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
        // Easter egg activated!
        showEasterEgg();
        konamiCode = [];
    }
});

function showEasterEgg() {
    const easterEgg = document.createElement('div');
    easterEgg.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            padding: 2rem 3rem;
            border-radius: 20px;
            text-align: center;
            z-index: 10000;
            animation: bounce 1s infinite;
        ">
            <h3>🎉 You found our secret!</h3>
            <p>Thanks for exploring our page so thoroughly!</p>
            <p>🍝 Here's a virtual high-five from Davie & Florence! 🙌</p>
        </div>
    `;
    
    document.body.appendChild(easterEgg);
    
    setTimeout(() => {
        easterEgg.remove();
    }, 4000);
}

// Performance monitoring
function monitorPerformance() {
    window.addEventListener('load', () => {
        const loadTime = performance.now();
        console.log(`About Us page loaded in ${loadTime.toFixed(2)}ms`);
        
        // Report Core Web Vitals if available
        if ('web-vital' in window) {
            // This would integrate with actual Core Web Vitals library
            console.log('Core Web Vitals monitoring enabled');
        }
    });
}

monitorPerformance();

// Accessibility enhancements
function initAccessibility() {
    // Add skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #667eea;
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 0 0 4px 4px;
        z-index: 10000;
        transition: top 0.3s ease;
    `;
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '0';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content ID
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.id = 'main-content';
    }
}

initAccessibility();

// Export functions for potential external use
window.AboutUsPage = {
    initScrollAnimations,
    initParallaxEffects,
    animateCounters,
    initFounderCardInteractions
};