import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Smooth entrance animations
export const animateOnScroll = (element, direction = 'up', delay = 0) => {
  const animations = {
    up: { y: 50, opacity: 0 },
    down: { y: -50, opacity: 0 },
    left: { x: 50, opacity: 0 },
    right: { x: -50, opacity: 0 },
    scale: { scale: 0.8, opacity: 0 },
    fade: { opacity: 0 }
  };

  gsap.fromTo(element, 
    animations[direction] || animations.up,
    {
      y: 0,
      x: 0,
      scale: 1,
      opacity: 1,
      duration: 0.8,
      delay: delay,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    }
  );
};

// Floating animation for hero elements
export const floatingAnimation = (element, amplitude = 20, duration = 3) => {
  gsap.to(element, {
    y: amplitude,
    duration: duration,
    repeat: -1,
    yoyo: true,
    ease: "power2.inOut"
  });
};

// Stagger animation for cards
export const staggerCards = (elements, direction = 'up') => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: elements[0],
      start: "top 80%",
      end: "bottom 20%",
    }
  });

  tl.fromTo(elements, 
    { y: direction === 'up' ? 60 : -60, opacity: 0 },
    { 
      y: 0, 
      opacity: 1, 
      duration: 0.6, 
      stagger: 0.1,
      ease: "power2.out"
    }
  );
};

// Smooth text reveal
export const revealText = (element) => {
  const chars = element.textContent.split('');
  element.innerHTML = chars.map(char => 
    `<span style="display: inline-block; opacity: 0; transform: translateY(20px);">${char === ' ' ? '&nbsp;' : char}</span>`
  ).join('');

  gsap.to(element.children, {
    opacity: 1,
    y: 0,
    duration: 0.05,
    stagger: 0.02,
    ease: "power2.out"
  });
};

// Magnetic effect for buttons
export const magneticEffect = (element) => {
  const magnetic = element;
  
  magnetic.addEventListener('mousemove', (e) => {
    const rect = magnetic.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    gsap.to(magnetic, {
      x: x * 0.1,
      y: y * 0.1,
      duration: 0.3,
      ease: "power2.out"
    });
  });
  
  magnetic.addEventListener('mouseleave', () => {
    gsap.to(magnetic, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "power2.out"
    });
  });
};

// Progress bar animation
export const animateProgress = (element, percentage) => {
  gsap.fromTo(element, 
    { width: 0 },
    { 
      width: `${percentage}%`,
      duration: 1.5,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
      }
    }
  );
};

// Parallax effect
export const parallaxEffect = (element, speed = 0.5) => {
  gsap.to(element, {
    yPercent: -100 * speed,
    ease: "none",
    scrollTrigger: {
      trigger: element,
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  });
};

// Card hover animation
export const cardHoverEffect = (element) => {
  const tl = gsap.timeline({ paused: true });
  
  tl.to(element, {
    y: -10,
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
    duration: 0.3,
    ease: "power2.out"
  });

  element.addEventListener('mouseenter', () => tl.play());
  element.addEventListener('mouseleave', () => tl.reverse());
};