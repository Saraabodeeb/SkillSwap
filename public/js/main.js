/**
 * SkillSwap - Main JavaScript
 * Handles general site functionality, placeholder content, and SkillCoins updates
 */

// Global application state
const SkillSwap = {
  currentUser: null,
  skillCoins: 0,
  
  init() {
    console.log('SkillSwap initialized');
    this.loadUserData();
    this.updateSkillCoins();
    this.initMobileMenu();
    this.initSmoothScroll();
    this.loadPlaceholderContent();
  },

  // Load user data from localStorage or use defaults
  loadUserData() {
    const userData = localStorage.getItem('skillswap_user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
      this.skillCoins = this.currentUser.skillCoins || 150;
    } else {
      // Default user data
      this.currentUser = {
        name: 'John Doe',
        email: 'john.doe@email.com',
        skillCoins: 150,
        avatar: 'JD'
      };
    }
  },

  // Update SkillCoins balance across the site
  updateSkillCoins(amount = null) {
    if (amount !== null) {
      this.skillCoins = amount;
      if (this.currentUser) {
        this.currentUser.skillCoins = amount;
        localStorage.setItem('skillswap_user', JSON.stringify(this.currentUser));
      }
    }

    // Update all SkillCoins displays on the page
    const skillCoinsElements = document.querySelectorAll('[data-skillcoins], #skillCoinsBalance, #currentBalance, #statSkillCoins');
    
    skillCoinsElements.forEach(element => {
      if (element) {
        this.animateValue(element, parseInt(element.textContent) || 0, this.skillCoins, 1000);
      }
    });
  },

  // Animate number counting up/down
  animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        element.textContent = Math.round(end);
        clearInterval(timer);
      } else {
        element.textContent = Math.round(current);
      }
    }, 16);
  },

  // Add or subtract SkillCoins
  addSkillCoins(amount) {
    this.updateSkillCoins(this.skillCoins + amount);
    this.showNotification(`+${amount} SkillCoins earned! 🪙`, 'success');
  },

  spendSkillCoins(amount) {
    if (this.skillCoins >= amount) {
      this.updateSkillCoins(this.skillCoins - amount);
      this.showNotification(`-${amount} SkillCoins spent`, 'info');
      return true;
    } else {
      this.showNotification('Insufficient SkillCoins!', 'error');
      return false;
    }
  },

  // Initialize mobile menu toggle
  initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        
        // Animate hamburger icon
        const spans = menuToggle.querySelectorAll('span');
        if (spans.length >= 3) {
          if (navLinks.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
          } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
          }
        }
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('nav') && navLinks.classList.contains('active')) {
          navLinks.classList.remove('active');
          const spans = menuToggle.querySelectorAll('span');
          if (spans.length >= 3) {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
          }
        }
      });
    }
  },

  // Initialize smooth scrolling for anchor links
  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });
  },

  // Load placeholder content for demo purposes
  loadPlaceholderContent() {
    // Update user avatars
    const userAvatars = document.querySelectorAll('#userAvatar, .user-avatar');
    userAvatars.forEach(avatar => {
      if (this.currentUser && !avatar.textContent.trim()) {
        avatar.textContent = this.currentUser.avatar;
      }
    });

    // Update user names
    const userNames = document.querySelectorAll('#userName, #profileName');
    userNames.forEach(name => {
      if (this.currentUser && !name.textContent.trim()) {
        name.textContent = this.currentUser.name.split(' ')[0];
      }
    });

    // Add placeholder stats if elements exist
    this.loadPlaceholderStats();
  },

  // Load placeholder statistics
  loadPlaceholderStats() {
    const stats = {
      activeExchanges: 3,
      completedSwaps: 12,
      skillsOffered: 5,
      totalUsers: 247,
      totalTransactions: 856
    };

    Object.keys(stats).forEach(statKey => {
      const element = document.getElementById(statKey);
      if (element && !element.textContent.trim()) {
        this.animateValue(element, 0, stats[statKey], 1500);
      }
    });
  },

  // Show notification message
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: ${this.getNotificationColor(type)};
      color: white;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      z-index: 9999;
      animation: slideInRight 0.3s ease-out;
      max-width: 300px;
    `;
    notification.textContent = message;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(100px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideInRight 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  },

  // Get notification color based on type
  getNotificationColor(type) {
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#6366f1'
    };
    return colors[type] || colors.info;
  },

  // Format date for display
  formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  },

  // Get current time formatted
  getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  },

  // Escape HTML to prevent XSS
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Local storage helpers
  saveToStorage(key, value) {
    try {
      localStorage.setItem(`skillswap_${key}`, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      return false;
    }
  },

  loadFromStorage(key) {
    try {
      const value = localStorage.getItem(`skillswap_${key}`);
      return value ? JSON.parse(value) : null;
    } catch (e) {
      console.error('Error loading from localStorage:', e);
      return null;
    }
  },

  removeFromStorage(key) {
    try {
      localStorage.removeItem(`skillswap_${key}`);
      return true;
    } catch (e) {
      console.error('Error removing from localStorage:', e);
      return false;
    }
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  SkillSwap.init();
});

// Make SkillSwap globally accessible
window.SkillSwap = SkillSwap;
