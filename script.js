/* ===================================
   SPACE THEME PARK - INTERACTIVE SCRIPTS
   =================================== */

// ===================================
// ANIMATED STARFIELD
// ===================================

class Starfield {
    constructor() {
        this.canvas = document.getElementById('starfield');
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.numStars = 200;
        this.speed = 0.3;
        
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    init() {
        this.resize();
        this.createStars();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createStars() {
        this.stars = [];
        for (let i = 0; i < this.numStars; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * this.speed + 0.1,
                opacity: Math.random() * 0.8 + 0.2,
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: Math.random() * 0.02 + 0.01
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw gradient background
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width
        );
        gradient.addColorStop(0, '#0d1526');
        gradient.addColorStop(1, '#000000');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw and update stars
        this.stars.forEach(star => {
            // Update twinkle
            star.twinkle += star.twinkleSpeed;
            const twinkleOpacity = star.opacity * (0.5 + 0.5 * Math.sin(star.twinkle));
            
            // Draw star
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${twinkleOpacity})`;
            this.ctx.fill();
            
            // Add glow effect for larger stars
            if (star.size > 1.2) {
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(0, 212, 255, ${twinkleOpacity * 0.1})`;
                this.ctx.fill();
            }
            
            // Move star slowly
            star.y += star.speed;
            
            // Reset star if it goes off screen
            if (star.y > this.canvas.height) {
                star.y = 0;
                star.x = Math.random() * this.canvas.width;
            }
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// ===================================
// HORIZONTAL SCROLL
// ===================================

class HorizontalScroll {
    constructor() {
        this.container = document.querySelector('.features-container');
        this.track = document.querySelector('.features-track');
        
        if (!this.container || !this.track) return;
        
        this.isDragging = false;
        this.startX = 0;
        this.scrollLeft = 0;
        this.currentTranslate = 0;
        this.velocity = 0;
        this.momentum = null;
        
        this.init();
    }
    
    init() {
        // Mouse wheel horizontal scroll
        this.container.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
        
        // Drag scroll
        this.track.addEventListener('mousedown', (e) => this.startDrag(e));
        window.addEventListener('mousemove', (e) => this.drag(e));
        window.addEventListener('mouseup', () => this.endDrag());
        
        // Prevent context menu on drag
        this.track.addEventListener('contextmenu', (e) => {
            if (this.isDragging) e.preventDefault();
        });
        
        // Calculate initial bounds
        this.updateBounds();
        window.addEventListener('resize', () => this.updateBounds());
    }
    
    updateBounds() {
        const trackWidth = this.track.scrollWidth;
        const containerWidth = this.container.offsetWidth;
        this.maxTranslate = 0;
        this.minTranslate = -(trackWidth - containerWidth);
    }
    
    handleWheel(e) {
        // Check if we're in the features section
        const featuresSection = document.getElementById('features');
        const rect = featuresSection.getBoundingClientRect();
        
        // Only intercept if features section is mostly visible
        if (rect.top < window.innerHeight * 0.7 && rect.bottom > window.innerHeight * 0.3) {
            const delta = e.deltaY || e.deltaX;
            
            // Calculate new position
            const newTranslate = this.currentTranslate - delta * 0.8;
            
            // Check if we're at the edges
            if (newTranslate > this.maxTranslate) {
                this.currentTranslate = this.maxTranslate;
            } else if (newTranslate < this.minTranslate) {
                this.currentTranslate = this.minTranslate;
            } else {
                e.preventDefault();
                this.currentTranslate = newTranslate;
            }
            
            this.track.style.transform = `translateX(${this.currentTranslate}px)`;
        }
    }
    
    startDrag(e) {
        this.isDragging = true;
        this.startX = e.pageX;
        this.startTranslate = this.currentTranslate;
        this.track.style.cursor = 'grabbing';
        
        // Clear any ongoing momentum
        if (this.momentum) {
            cancelAnimationFrame(this.momentum);
        }
    }
    
    drag(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        const x = e.pageX;
        const diff = x - this.startX;
        
        let newTranslate = this.startTranslate + diff;
        
        // Apply rubber band effect at edges
        if (newTranslate > this.maxTranslate) {
            newTranslate = this.maxTranslate + (newTranslate - this.maxTranslate) * 0.2;
        } else if (newTranslate < this.minTranslate) {
            newTranslate = this.minTranslate + (newTranslate - this.minTranslate) * 0.2;
        }
        
        this.velocity = newTranslate - this.currentTranslate;
        this.currentTranslate = newTranslate;
        this.track.style.transform = `translateX(${this.currentTranslate}px)`;
    }
    
    endDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.track.style.cursor = 'grab';
        
        // Apply momentum
        this.applyMomentum();
    }
    
    applyMomentum() {
        const friction = 0.95;
        
        const animate = () => {
            this.velocity *= friction;
            this.currentTranslate += this.velocity;
            
            // Clamp to bounds
            if (this.currentTranslate > this.maxTranslate) {
                this.currentTranslate = this.maxTranslate;
                this.velocity = 0;
            } else if (this.currentTranslate < this.minTranslate) {
                this.currentTranslate = this.minTranslate;
                this.velocity = 0;
            }
            
            this.track.style.transform = `translateX(${this.currentTranslate}px)`;
            
            if (Math.abs(this.velocity) > 0.1) {
                this.momentum = requestAnimationFrame(animate);
            }
        };
        
        this.momentum = requestAnimationFrame(animate);
    }
}

// ===================================
// CARD HOVER EFFECTS
// ===================================

class CardHoverEffects {
    constructor() {
        this.track = document.querySelector('.features-track');
        this.cards = document.querySelectorAll('.feature-card');
        
        if (!this.track || !this.cards.length) return;
        
        this.init();
    }
    
    init() {
        this.cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.track.classList.add('is-hovered');
            });
            
            card.addEventListener('mouseleave', () => {
                this.track.classList.remove('is-hovered');
            });
        });
    }
}

// ===================================
// SMOOTH SCROLL INDICATOR
// ===================================

class ScrollIndicator {
    constructor() {
        this.indicator = document.querySelector('.scroll-indicator');
        
        if (!this.indicator) return;
        
        this.init();
    }
    
    init() {
        // Hide indicator on scroll
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const opacity = Math.max(0, 1 - scrollY / 300);
            this.indicator.style.opacity = opacity;
        });
        
        // Click to scroll to features
        this.indicator.addEventListener('click', () => {
            const features = document.getElementById('features');
            if (features) {
                features.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

// ===================================
// INITIALIZE
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    new Starfield();
    new HorizontalScroll();
    new CardHoverEffects();
    new ScrollIndicator();
});
