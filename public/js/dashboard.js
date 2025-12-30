/**
 * SkillSwap - Dashboard JavaScript
 * FINAL VERSION: Database Connection Enabled
 */

const Dashboard = {
  // Sample matches data
  matches: [
    { id: 1, name: 'Sarah Johnson', avatar: 'SJ', skills: ['Graphic Design', 'UI/UX'], wants: ['Web Development', 'JavaScript'], match: 95, rating: 4.9 },
    { id: 2, name: 'Mike Chen', avatar: 'MC', skills: ['Photography', 'Video Editing'], wants: ['Content Writing', 'Marketing'], match: 88, rating: 4.8 },
    { id: 3, name: 'Emily Davis', avatar: 'ED', skills: ['Piano', 'Music Theory'], wants: ['Graphic Design', 'Illustration'], match: 92, rating: 5.0 },
    { id: 4, name: 'Alex Rivera', avatar: 'AR', skills: ['Spanish', 'Translation'], wants: ['Web Development', 'Python'], match: 85, rating: 4.7 },
    { id: 5, name: 'Lisa Park', avatar: 'LP', skills: ['Yoga', 'Fitness Training'], wants: ['Video Editing', 'Photography'], match: 78, rating: 4.6 },
    { id: 6, name: 'David Kumar', avatar: 'DK', skills: ['Data Science', 'Machine Learning'], wants: ['UI/UX Design', 'Prototyping'], match: 90, rating: 4.9 }
  ],

  init() {
    this.loadDashboardData();
    this.renderMatches();
    this.initEventListeners();
    this.updateStatsAnimation();
  },

  loadDashboardData() {
    // 1. Try to get User Data
    const userRaw = localStorage.getItem('skillswap_user');
    let user;

    if (userRaw) {
      user = JSON.parse(userRaw);
    } else {
      user = {
        name: 'Guest User',
        email: 'guest@skillswap.com',
        skillCoins: 0,
        avatar: 'GU'
      };
    }

    // 2. Update UI
    const userNameElement = document.getElementById('userName');
    if (userNameElement) userNameElement.textContent = user.name;

    const userAvatarElements = document.querySelectorAll('.user-avatar');
    userAvatarElements.forEach(avatar => { 
        avatar.textContent = user.avatar; 
    });

    const skillCoinsElement = document.getElementById('skillCoinsBalance');
    if (skillCoinsElement) {
        skillCoinsElement.textContent = user.skillCoins; 
    }
  },

  renderMatches() {
    const matchesGrid = document.getElementById('matchesGrid');
    if (!matchesGrid) return;
    matchesGrid.innerHTML = '';
    const sortedMatches = [...this.matches].sort((a, b) => b.match - a.match);

    sortedMatches.forEach((match, index) => {
      const matchCard = this.createMatchCard(match);
      matchCard.style.animationDelay = `${index * 0.1}s`;
      matchesGrid.appendChild(matchCard);
    });
  },

  createMatchCard(match) {
    const card = document.createElement('div');
    card.className = 'match-card';
    card.setAttribute('data-match-id', match.id);
    
    card.innerHTML = `
      <div class="match-header">
        <div class="match-avatar">${match.avatar}</div>
        <div class="match-info">
          <h3>${match.name}</h3>
          <div class="match-rating"><span class="stars">★</span> ${match.rating}</div>
        </div>
        <div class="match-percentage ${this.getMatchClass(match.match)}">${match.match}%</div>
      </div>
      <div class="match-skills">
        <div class="skill-section"><h4>Offers:</h4><div class="skills-list">${match.skills.map(s => `<span class="skill-badge skill-badge-offer">${s}</span>`).join('')}</div></div>
        <div class="skill-section"><h4>Wants:</h4><div class="skills-list">${match.wants.map(s => `<span class="skill-badge skill-badge-want">${s}</span>`).join('')}</div></div>
      </div>
      <button class="btn btn-primary btn-block connect-btn" data-user="${match.name}">Connect</button>
    `;
    return card;
  },

  getMatchClass(percentage) {
    if (percentage >= 90) return 'match-high';
    if (percentage >= 80) return 'match-medium';
    return 'match-low';
  },

  initEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('connect-btn')) {
        this.handleConnect(e.target);
      }
    });
    
    const refreshBtn = document.getElementById('refreshMatches');
    if (refreshBtn) refreshBtn.addEventListener('click', () => this.refreshMatches());
  },

  // --- THIS IS THE FIXED FUNCTION ---
  handleConnect(button) {
    const userName = button.getAttribute('data-user');
    const matchCard = button.closest('.match-card');
    const matchId = matchCard.getAttribute('data-match-id');
    
    // 1. Get current user info
    const currentUser = JSON.parse(localStorage.getItem('skillswap_user'));
    
    if (!currentUser || !currentUser.email) {
        alert("Please login first!");
        return;
    }

    // 2. Disable button
    button.disabled = true;
    button.textContent = 'Connecting...';
    
    // 3. Send to Database
    fetch('http://localhost:3000/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_email: currentUser.email,
            match_name: userName,
            match_id: matchId
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            // SUCCESS!
            button.textContent = 'Connected!';
            button.classList.add('btn-success');
            // I removed the code that was crashing here!
        } else {
            button.textContent = 'Failed';
            button.disabled = false;
        }
    })
    .catch(err => {
        console.error("Connect error:", err);
        button.textContent = 'Error';
        button.disabled = false;
    });
  },

  refreshMatches() {
    const refreshBtn = document.getElementById('refreshMatches');
    if (refreshBtn) refreshBtn.innerHTML = 'Refreshing...';
    setTimeout(() => {
      this.matches = this.matches.sort(() => Math.random() - 0.5);
      this.renderMatches();
      if (refreshBtn) refreshBtn.innerHTML = '↻ Refresh Matches';
    }, 800);
  },

  updateStatsAnimation() {
    const activeExchanges = document.getElementById('activeExchanges');
    const completedSwaps = document.getElementById('completedSwaps');
    const totalEarnings = document.getElementById('totalEarnings'); 
    
    if (activeExchanges) activeExchanges.textContent = "3";
    if (completedSwaps) completedSwaps.textContent = "12";
    if (totalEarnings) totalEarnings.textContent = "5";
  }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  if (window.Dashboard) {
    window.Dashboard.init();
  }
  
  // Logout Logic
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
      const newBtn = logoutBtn.cloneNode(true);
      logoutBtn.parentNode.replaceChild(newBtn, logoutBtn);
      newBtn.addEventListener('click', () => {
          localStorage.clear();
          window.location.href = 'index.html';
      });
  }
});

window.Dashboard = Dashboard;