document.addEventListener('DOMContentLoaded', () => {
    // Initialize the page
    initializeUI();
    addCardHoverEffects();
    addParallaxEffect();
    addParticleEffects();
    addDynamicLighting();
    addSmoothScrolling();
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

// Enhanced parallax effect with depth
function addParallaxEffect() {
    const backgroundGradient = document.querySelector('.background-gradient');
    
    if (backgroundGradient) {
        window.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            backgroundGradient.style.transform = `
                translate(${x * 20 - 10}px, ${y * 20 - 10}px)
                scale(1.02)
            `;
        });
    }
}

// Add interactive particle effects
function addParticleEffects() {
    const container = document.querySelector('.container');
    if (!container) return;

    const particleCount = window.innerWidth < 768 ? 30 : 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random properties
        const size = Math.random() * 3 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const opacity = Math.random() * 0.4 + 0.1;
        const duration = Math.random() * 20 + 10;
        
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${posX}%;
            top: ${posY}%;
            opacity: ${opacity};
            animation-duration: ${duration}s;
            background: var(--accent-primary);
        `;
        
        container.appendChild(particle);
    }
}

// Add dynamic lighting effects
function addDynamicLighting() {
    const cards = document.querySelectorAll('.service-card');
    if (!cards.length) return;

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

// Smooth scrolling for anchor links
function addSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
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
