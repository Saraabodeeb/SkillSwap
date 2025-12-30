    // --- 1. AUTHENTICATION CHECK & DATA LOADING ---
    const userRaw = localStorage.getItem('skillswap_user');
    
    // Redirect if not logged in
    if (!userRaw) {
      window.location.href = 'login.html';
    }
    
    // Parse User Data
    const user = JSON.parse(userRaw) || {};
    
    // Load Skills from Storage (or default to empty)
    const storedProfile = JSON.parse(localStorage.getItem('skillswap_profile_data')) || {
      offeredSkills: [],
      wantedSkills: []
    };

    let offeredSkills = storedProfile.offeredSkills;
    let wantedSkills = storedProfile.wantedSkills;

    // --- 2. DOM ELEMENTS ---
    const offerInput = document.getElementById('offerInput');
    const wantInput = document.getElementById('wantInput');
    const addOfferBtn = document.getElementById('addOfferBtn');
    const addWantBtn = document.getElementById('addWantBtn');
    const offeredSkillsContainer = document.getElementById('offeredSkills');
    const wantedSkillsContainer = document.getElementById('wantedSkills');
    const saveBtn = document.getElementById('saveBtn');
    const successMessage = document.getElementById('successMessage');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    // --- 3. INITIALIZATION ---
    function initProfile() {
      // Set Real User Data
      const name = user.name || "User";
      document.getElementById('profileName').textContent = name;
      
      const initials = (name.charAt(0) || "U").toUpperCase();
      document.getElementById('profileAvatarLarge').textContent = initials;
      document.getElementById('userAvatar').textContent = initials;
      
      document.getElementById('statSkillCoins').textContent = user.skillCoins || 0;
      
      // Render stored skills
      renderSkills();
    }

    // --- 4. RENDER FUNCTIONS ---
    function renderSkills() {
      renderList(offeredSkills, offeredSkillsContainer, 'offer', removeOfferedSkill);
      renderList(wantedSkills, wantedSkillsContainer, 'want', removeWantedSkill);
    }

    function renderList(items, container, type, removeFn) {
      if (items.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">${type === 'offer' ? '🎨' : '🌟'}</div>
            <div>No skills added yet.</div>
          </div>`;
        container.classList.add('empty');
      } else {
        container.classList.remove('empty');
        container.innerHTML = items.map((skill, index) => `
          <div class="skill-badge ${type}">
            <span>${skill}</span>
            <button class="remove-skill" data-index="${index}" title="Remove">×</button>
          </div>
        `).join('');
        
        // Add click listeners to remove buttons
        const buttons = container.querySelectorAll('.remove-skill');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                removeFn(idx);
            });
        });
      }
    }

    // --- 5. LOGIC FUNCTIONS ---
    function addOfferedSkill() {
      const val = offerInput.value.trim();
      if (!val) return;
      if (offeredSkills.includes(val)) { alert('Already added!'); return; }
      offeredSkills.push(val);
      offerInput.value = '';
      renderSkills();
    }

    function addWantedSkill() {
      const val = wantInput.value.trim();
      if (!val) return;
      if (wantedSkills.includes(val)) { alert('Already added!'); return; }
      wantedSkills.push(val);
      wantInput.value = '';
      renderSkills();
    }

    function removeOfferedSkill(index) {
      offeredSkills.splice(index, 1);
      renderSkills();
    }

    function removeWantedSkill(index) {
      wantedSkills.splice(index, 1);
      renderSkills();
    }

    // --- 6. SAVE FUNCTION (Persist to Browser) ---
    function saveChanges() {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';

      // Save to LocalStorage
      const profileData = { offeredSkills, wantedSkills };
      localStorage.setItem('skillswap_profile_data', JSON.stringify(profileData));

      setTimeout(() => {
        successMessage.classList.add('show');
        saveBtn.textContent = 'Save Changes';
        saveBtn.disabled = false;
        setTimeout(() => successMessage.classList.remove('show'), 2000);
      }, 600);
    }

    // --- 7. EVENT LISTENERS ---
    addOfferBtn.addEventListener('click', addOfferedSkill);
    addWantBtn.addEventListener('click', addWantedSkill);
    saveBtn.addEventListener('click', saveChanges);
    
    // Enter Key Support
    offerInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addOfferedSkill(); });
    wantInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addWantedSkill(); });

    // Menu Toggle
    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });
    }

    // Run Init
    document.addEventListener('DOMContentLoaded', initProfile);