document.addEventListener('DOMContentLoaded', () => {
    // Initialize the page
    initializeUI();
    addCardHoverEffects();
    addParallaxEffect();
});

// Initialize UI elements and animations
function initializeUI() {
    // Animate hero section on load
    animateHeroSection();
    
    // Animate service cards on scroll
    animateOnScroll('.service-card', 'fade-in-up');
    
    // Fix for mobile hover effects
    addMobileCardClickHandler();
}

// Animate hero section with a subtle fade-in and slide-up effect
function animateHeroSection() {
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    
    if (heroTitle) {
        heroTitle.style.opacity = '0';
        heroTitle.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            heroTitle.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            heroTitle.style.opacity = '1';
            heroTitle.style.transform = 'translateY(0)';
        }, 100);
    }
    
    if (heroSubtitle) {
        heroSubtitle.style.opacity = '0';
        heroSubtitle.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            heroSubtitle.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            heroSubtitle.style.opacity = '1';
            heroSubtitle.style.transform = 'translateY(0)';
        }, 300);
    }
}

// Add hover effects to service cards
function addCardHoverEffects() {
    const cards = document.querySelectorAll('.service-card');
    
    cards.forEach(card => {
        // Check if the card is disabled
        const isDisabled = card.querySelector('.service-disabled') !== null;
        
        // Add subtle glow effect on hover
        card.addEventListener('mouseenter', () => {
            if (!isDisabled) {
                card.style.boxShadow = '0 0 0 1px var(--accent-primary), 0 8px 20px rgba(0, 0, 0, 0.2)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.boxShadow = '';
        });
    });
}

// Add a subtle parallax effect to the background
function addParallaxEffect() {
    const backgroundGradient = document.querySelector('.background-gradient');
    
    if (backgroundGradient) {
        window.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            backgroundGradient.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
        });
    }
}

// Animate elements when they come into view
function animateOnScroll(selector, animationClass) {
    const elements = document.querySelectorAll(selector);
    
    if (elements.length === 0) return;
    
    // Create an observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add a slight delay for each card to create a staggered effect
                const index = Array.from(elements).indexOf(entry.target);
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                
                // Unobserve after animation
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Observe each element
    elements.forEach(element => {
        observer.observe(element);
    });
}

// Add service card click handler for mobile (touch) devices
function addMobileCardClickHandler() {
    if ('ontouchstart' in window) {
        const cards = document.querySelectorAll('.service-card');
        
        cards.forEach(card => {
            const link = card.querySelector('.service-link');
            // Skip disabled cards
            if (!link) return;
            
            card.addEventListener('click', (e) => {
                // If the click is not on the link itself, trigger the link click
                if (!e.target.closest('.service-link')) {
                    e.preventDefault();
                    link.click();
                }
            });
        });
    }
}
