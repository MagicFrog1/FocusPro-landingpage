// ============================================
// TOGGLE DARK MODE
// ============================================

const html = document.documentElement;

// Cargar tema guardado o usar preferencia del sistema
const savedTheme = localStorage.getItem('theme');
const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const currentTheme = savedTheme || systemPreference;

// Aplicar tema inmediatamente
html.setAttribute('data-theme', currentTheme);

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  
  if (themeToggle) {
    const icon = themeToggle.querySelector('.theme-toggle__icon');
    if (icon) {
      icon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    }
  }
});

// Toggle del tema
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      // Actualizar ícono
      const icon = themeToggle.querySelector('.theme-toggle__icon');
      if (icon) {
        icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
      }
    });
  }
});

// Escuchar cambios en la preferencia del sistema
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      const icon = themeToggle.querySelector('.theme-toggle__icon');
      if (icon) {
        icon.textContent = e.matches ? '☀️' : '🌙';
      }
    }
  }
});

// ============================================
// HEADER SCROLL EFFECT
// ============================================

const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// ============================================
// MENÚ MÓVIL
// ============================================

const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav__link');

navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  navToggle.classList.toggle('active');
});

// Cerrar menú al hacer clic en un link
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
  });
});

// Cerrar menú al hacer clic fuera
document.addEventListener('click', (e) => {
  if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
  }
});

// ============================================
// SCROLL ANIMATIONS
// ============================================

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observar elementos para animación
const animateElements = document.querySelectorAll(
  '.problem__card, .feature-card, .testimonial-card, .audience-card, .premium__card'
);

animateElements.forEach(el => {
  observer.observe(el);
});

// ============================================
// ANIMACIONES ESCALONADAS PARA TESTIMONIOS
// ============================================

const testimonialObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const card = entry.target;
      const delay = card.dataset.delay || 0;
      
      setTimeout(() => {
        card.classList.add('animate');
      }, delay);
      
      testimonialObserver.unobserve(card);
    }
  });
}, {
  threshold: 0.2,
  rootMargin: '0px 0px -100px 0px'
});

document.querySelectorAll('.testimonial-card').forEach(card => {
  testimonialObserver.observe(card);
});

// ============================================
// ANIMACIÓN PARA PREMIUM CARD
// ============================================

const premiumObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const card = entry.target;
      card.classList.add('animate');
      
      // Animar items de la lista con delay escalonado
      const items = card.querySelectorAll('.premium__item');
      items.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('animate');
        }, index * 100 + 300);
      });
      
      premiumObserver.unobserve(card);
    }
  });
}, {
  threshold: 0.3,
  rootMargin: '0px 0px -100px 0px'
});

const premiumCard = document.querySelector('.premium__card');
if (premiumCard) {
  premiumObserver.observe(premiumCard);
}

// ============================================
// EFECTOS INTERACTIVOS PARA TESTIMONIOS
// ============================================

document.querySelectorAll('.testimonial-card').forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
  });
  
  // Efecto parallax sutil en hover
  card.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const moveX = (x - centerX) / 20;
    const moveY = (y - centerY) / 20;
    
    this.style.transform = `translateY(-8px) scale(1.02) translate(${moveX}px, ${moveY}px)`;
  });
  
  card.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0) scale(1)';
  });
});

// ============================================
// EFECTOS PARA ESTRELLAS DE RATING
// ============================================

document.querySelectorAll('.testimonial-card__rating .star').forEach((star, index) => {
  star.style.setProperty('--i', index);
  star.style.animationDelay = `${index * 0.1}s`;
});

// ============================================
// EFECTO DE CONTADOR PARA STATS
// ============================================

const animateCounter = (element, target, duration = 2000) => {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = formatNumber(target);
      clearInterval(timer);
    } else {
      element.textContent = formatNumber(Math.floor(current));
    }
  }, 16);
};

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K+';
  }
  if (num < 1) {
    return num.toFixed(1);
  }
  return Math.floor(num).toString();
};

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const statBadge = entry.target;
      const numberEl = statBadge.querySelector('.stat-badge__number');
      const text = numberEl.textContent;
      
      // Extraer número del texto
      let target = 0;
      if (text.includes('K+')) {
        target = parseFloat(text) * 1000;
      } else if (text.includes('%')) {
        target = parseFloat(text);
      } else {
        target = parseFloat(text);
      }
      
      if (numberEl && !numberEl.dataset.animated) {
        numberEl.dataset.animated = 'true';
        numberEl.textContent = '0';
        setTimeout(() => {
          animateCounter(numberEl, target);
        }, 200);
      }
      
      statsObserver.unobserve(statBadge);
    }
  });
}, {
  threshold: 0.5
});

document.querySelectorAll('.stat-badge').forEach(badge => {
  statsObserver.observe(badge);
});

// ============================================
// SMOOTH SCROLL PARA LINKS
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ============================================
// PARALLAX EFFECT EN HERO
// ============================================

const heroImage = document.querySelector('.hero__image');

if (heroImage) {
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      const heroTop = heroSection.getBoundingClientRect().top;
      if (heroTop < window.innerHeight && heroTop > -heroSection.offsetHeight) {
        heroImage.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroImage.style.opacity = 1 - (scrolled / 500);
      }
    }
  });
}

// ============================================
// RIPPLE EFFECT EN BOTONES
// ============================================

const buttons = document.querySelectorAll('.btn');

buttons.forEach(button => {
  button.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    this.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
});

// Añadir estilos para ripple effect
const style = document.createElement('style');
style.textContent = `
  .btn {
    position: relative;
    overflow: hidden;
  }
  
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
  }
  
  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// ============================================
// LAZY LOADING DE IMÁGENES (si se añaden)
// ============================================

if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// ============================================
// PERFORMANCE: Preload crítico
// ============================================

// Preload de fuentes críticas
const link = document.createElement('link');
link.rel = 'preconnect';
link.href = 'https://fonts.googleapis.com';
document.head.appendChild(link);

// ============================================
// WELCOME MODAL
// ============================================

const welcomeModal = document.getElementById('welcome-modal');
const modalClose = document.getElementById('modal-close');

// Mostrar modal al cargar la página (solo si no se ha cerrado antes)
const modalClosed = localStorage.getItem('welcomeModalClosed');

if (!modalClosed && welcomeModal) {
  // Esperar un poco para que la página cargue
  setTimeout(() => {
    welcomeModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }, 500);
}

// Cerrar modal
if (modalClose) {
  modalClose.addEventListener('click', () => {
    closeModal();
  });
}

// Cerrar al hacer clic en el overlay
if (welcomeModal) {
  const overlay = welcomeModal.querySelector('.welcome-modal__overlay');
  if (overlay) {
    overlay.addEventListener('click', () => {
      closeModal();
    });
  }
}

// Cerrar con ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && welcomeModal && welcomeModal.classList.contains('active')) {
    closeModal();
  }
});

function closeModal() {
  if (welcomeModal) {
    welcomeModal.classList.remove('active');
    document.body.style.overflow = '';
    localStorage.setItem('welcomeModalClosed', 'true');
  }
}

// Cerrar modal al hacer clic en el CTA
const modalCTA = document.querySelector('.welcome-modal__cta');
if (modalCTA) {
  modalCTA.addEventListener('click', () => {
    closeModal();
  });
}

// ============================================
// CONSOLE LOG PARA DEBUG (remover en producción)
// ============================================

console.log('FocusPro Landing Page - Cargada correctamente');

