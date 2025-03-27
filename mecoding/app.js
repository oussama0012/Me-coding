document.addEventListener('DOMContentLoaded', async () => {
    // Load GSAP from CDN directly instead of using import
    const gsapScript = document.createElement('script');
    gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    gsapScript.onload = () => {
        // Once GSAP is loaded, initialize animations
        gsap.from('.hero-content h1', {
            opacity: 0,
            y: 50,
            duration: 1.2,
            ease: 'power3.out'
        });
        
        gsap.from('.hero-content p', {
            opacity: 0,
            y: 30,
            duration: 1.2,
            delay: 0.3,
            ease: 'power3.out'
        });
        
        gsap.from('.cta-button', {
            opacity: 0,
            y: 30,
            duration: 1,
            delay: 0.6,
            ease: 'power3.out'
        });

        gsap.from('.hero-illustration svg', {
            opacity: 0,
            scale: 0.8,
            duration: 1.5,
            ease: 'elastic.out(1, 0.5)'
        });

        // Add animations for the benefits section
        gsap.from('.benefit-card', {
            opacity: 0,
            y: 50,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '#why-choose-us',
                start: 'top 80%'
            }
        });
        
        gsap.from('.tools-description', {
            opacity: 0,
            y: 50,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '#tools-overview',
                start: 'top 80%'
            }
        });
    };
    document.head.appendChild(gsapScript);
    
    // Add ScrollTrigger plugin
    const scrollTriggerScript = document.createElement('script');
    scrollTriggerScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js';
    document.head.appendChild(scrollTriggerScript);
});
