// Load conversations
async function loadConversations() {
  try {
    const conversations = await messagesAPI.getConversations();
    displayConversations(conversations);
  } catch (error) {
    console.error('Error loading conversations:', error);
  }
}

// Display conversations
function displayConversations(conversations) {
  const container = document.getElementById('conversations-list');
  container.innerHTML = '';

  conversations.forEach(conv => {
    const item = document.createElement('div');
    item.className = 'conversation-item';
    item.innerHTML = `
      <h4>${conv.userName} <span class="role-badge">${conv.userRole}</span></h4>
      <p>${conv.lastMessage}</p>
      <small>${new Date(conv.lastMessageTime).toLocaleString()}</small>
    `;
    item.onclick = () => loadMessages(conv.userId);
    container.appendChild(item);

    container.appendChild(item);
  });
}

// Load messages with specific user
async function loadMessages(userId) {
  try {
    const messages = await messagesAPI.getMessages(userId);
    displayMessages(messages);
    
    // Store current conversation user
    currentConversationUserId = userId;
  } catch (error) {
    console.error('Error loading messages:', error);
  }
}

// Display messages
function displayMessages(messages) {
  const container = document.getElementById('messages-container');
  container.innerHTML = '';

  const currentUser = getCurrentUser();

  messages.forEach(msg => {
    const isOwn = msg.sender._id === currentUser.id;
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isOwn ? 'message-own' : 'message-other'}`;
    
    messageDiv.innerHTML = `
      <div class="message-header">
        <strong>${msg.sender.name}</strong>
        <span class="message-time">${new Date(msg.createdAt).toLocaleString()}</span>
      </div>
      <p>${msg.content}</p>
    `;
    
    container.appendChild(messageDiv);
  });

  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

// Send message
async function sendMessage(e) {
  e.preventDefault();
  
  const content = document.getElementById('message-input').value.trim();
  if (!content) return;

  const messageData = {
    receiverId: currentConversationUserId,
    content: content,
    listingId: new URLSearchParams(window.location.search).get('listing')
  };

  try {
    await messagesAPI.send(messageData);
    
    // Clear input
    document.getElementById('message-input').value = '';
    
    // Reload messages
    loadMessages(currentConversationUserId);
  } catch (error) {
    alert('Error sending message: ' + error.message);
  }
}

let currentConversationUserId = null;