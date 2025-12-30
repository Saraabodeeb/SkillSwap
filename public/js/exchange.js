/**
 * exchange.js - REAL-TIME POLLING VERSION
 */

document.addEventListener('DOMContentLoaded', () => {
    const msgContainer = document.getElementById('messagesContainer');
    const msgInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    
    // Get current user name (or default to "Me")
    const userRaw = localStorage.getItem('skillswap_user');
    const currentUser = userRaw ? JSON.parse(userRaw).name : "Me";

    // --- 1. THE POLLING FUNCTION ---
    function fetchMessages() {
        fetch('http://localhost:3000/messages')
            .then(response => response.json())
            .then(data => {
                // Clear current display to avoid duplicates (Simple method)
                msgContainer.innerHTML = '';
                
                data.forEach(msg => {
                    // Decide if message is 'sent' (by me) or 'received' (by others)
                    const type = (msg.sender === currentUser) ? 'sent' : 'received';
                    renderMessage(msg.content, type, msg.sender);
                });
                
                // Auto-scroll to bottom
                // msgContainer.scrollTop = msgContainer.scrollHeight; 
            })
            .catch(err => console.error("Polling error:", err));
    }

    // --- 2. SEND MESSAGE FUNCTION ---
    function sendMessage() {
        const text = msgInput.value.trim();
        if (!text) return;

        // Send to Server
        fetch('http://localhost:3000/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sender: currentUser,
                content: text
            })
        })
        .then(res => res.json())
        .then(data => {
            if(data.status === 'success') {
                msgInput.value = ''; // Clear input
                fetchMessages(); // Refresh immediately
            }
        });
    }

    // --- 3. HELPER: RENDER UI ---
    function renderMessage(text, type, senderName) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`;
        
        // Show sender name if it's received
        const nameTag = type === 'received' ? `<div style="font-size:0.7rem; color:gray; margin-bottom:2px;">${senderName}</div>` : '';

        msgDiv.innerHTML = `
            <div>
                ${nameTag}
                <div class="msg-bubble">${text}</div>
            </div>
        `;
        msgContainer.appendChild(msgDiv);
    }

    // --- 4. START THE ENGINE ---
    
    // Listen for clicks
    sendBtn.addEventListener('click', sendMessage);
    msgInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Load immediately
    fetchMessages();

    // Start Polling (Every 3 seconds)
    setInterval(fetchMessages, 3000);
});