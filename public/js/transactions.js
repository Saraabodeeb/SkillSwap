/**
 * transactions.js - Handles transaction history and stats
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. AUTH CHECK
    const userRaw = localStorage.getItem('skillswap_user');
    if (!userRaw) {
        window.location.href = 'login.html';
        return;
    }
    const user = JSON.parse(userRaw);
    
    // 2. UPDATE UI (Avatar)
    const initials = (user.name || "U").charAt(0).toUpperCase();
    const avatarEl = document.getElementById('userAvatar');
    if (avatarEl) avatarEl.textContent = initials;
    
    // 3. MOBILE MENU
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if(menuToggle) {
        menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
    }

    // 4. FETCH TRANSACTIONS
    fetchTransactions(user.email);
});

function fetchTransactions(email) {
    fetch(`http://localhost:3000/my-transactions?email=${email}`)
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            renderTransactions(data.transactions);
        }
    })
    .catch(err => console.error(err));
}

function renderTransactions(transactions) {
    const tbody = document.getElementById('transactionsBody');
    const emptyState = document.getElementById('emptyState');
    
    if (!transactions || transactions.length === 0) {
        if(tbody) tbody.style.display = 'none';
        if(emptyState) emptyState.style.display = 'block';
        return;
    }

    if(emptyState) emptyState.style.display = 'none';
    
    let totalEarned = 0;
    let totalSpent = 0;
    let balance = 0;

    tbody.innerHTML = transactions.map(t => {
        // Calculate Stats
        const amount = t.amount;
        if (amount > 0) totalEarned += amount;
        else totalSpent += Math.abs(amount);
        balance += amount;

        // Format Date
        const date = new Date(t.created_at).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });

        // Choose Icon
        const icon = t.type === 'earned' ? '💰' : (t.type === 'spent' ? '💸' : '🎁');
        const colorClass = amount > 0 ? 'positive' : 'negative';

        return `
            <tr>
                <td>
                    <span class="transaction-type ${t.type}">
                        <span>${icon}</span>
                        <span>${t.type.toUpperCase()}</span>
                    </span>
                </td>
                <td>
                    <div style="font-weight:500">${t.description}</div>
                    <div style="font-size:0.85rem; color:#64748b">with ${t.partner}</div>
                </td>
                <td>
                    <span class="coins-amount ${colorClass}">
                        ${amount > 0 ? '+' : ''}${amount}
                    </span>
                </td>
                <td style="color:#64748b; font-size:0.9rem">${date}</td>
            </tr>
        `;
    }).join('');

    // Update Stats Cards
    const earnedEl = document.getElementById('totalEarned');
    const spentEl = document.getElementById('totalSpent');
    const totalEl = document.getElementById('totalTransactions');
    const balanceEl = document.getElementById('currentBalance');

    if(earnedEl) earnedEl.textContent = `+${totalEarned}`;
    if(spentEl) spentEl.textContent = `-${totalSpent}`;
    if(totalEl) totalEl.textContent = transactions.length;
    if(balanceEl) balanceEl.textContent = balance;
}