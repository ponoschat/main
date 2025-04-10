// Login functionality
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    if (username && password) {
      // Save login data to localStorage
      localStorage.setItem('username', username);
      localStorage.setItem('password', password);
  
      // Check if the user is admin
      if (username === 'admin' && password === "a,dm,am193j4msbvklmfsa093u4mk''''-=-`ijj1238hvac") {
        localStorage.setItem('isAdmin', true);  // Set admin status
      } else {
        localStorage.setItem('isAdmin', false); // Normal user
      }
  
      // Hide login section and show chat section
      document.getElementById('loginSection').style.display = 'none';
      document.getElementById('chatSection').style.display = 'block';
  
      loadChats();
      displayAdminControls();
    } else {
      alert('Please enter both username and password.');
    }
  }
  
  // Load chats from localStorage
  function loadChats() {
    const chats = JSON.parse(localStorage.getItem('chats')) || [];
    const chatList = document.getElementById('chatList');
    chatList.innerHTML = '';
  
    chats.forEach((chat, index) => {
      const chatItem = document.createElement('div');
      chatItem.className = `chat-item ${chat.type}`;
      chatItem.innerHTML = `
        <strong>${chat.name}</strong> (${chat.type}) 
        <button onclick="openChat(${index})">Open</button>
        ${chat.owner === localStorage.getItem('username') ? `<button onclick="deleteChat(${index})">Delete</button>` : ''}
      `;
      chatList.appendChild(chatItem);
    });
  }
  
  // Display admin controls (delete all chats button)
  function displayAdminControls() {
    if (localStorage.getItem('isAdmin') === 'true') {
      const deleteAllButton = document.createElement('button');
      deleteAllButton.innerText = 'Delete All Chats';
      deleteAllButton.onclick = deleteAllChats;
      document.getElementById('chatSection').appendChild(deleteAllButton);
    }
  }
  
  // Delete all chats (only for admin)
  function deleteAllChats() {
    if (localStorage.getItem('isAdmin') === 'true') {
      localStorage.removeItem('chats');  // Remove all chats from localStorage
      loadChats();  // Reload chat list
    } else {
      alert('You do not have permission to delete all chats.');
    }
  }
  
  // Open a specific chat
  function openChat(index) {
    const chats = JSON.parse(localStorage.getItem('chats')) || [];
    const chat = chats[index];
    
    if (chat.type === 'password') {
      const password = prompt('Enter the chat password:');
      if (password !== chat.password) {
        alert('Incorrect password');
        return;
      }
    }
  
    document.getElementById('chatWindow').style.display = 'block';
    document.getElementById('currentChatName').innerText = chat.name;
  
    // Load messages for this chat
    loadMessages(index);
  }
  
  // Load messages for the selected chat
  function loadMessages(chatIndex) {
    const chats = JSON.parse(localStorage.getItem('chats')) || [];
    const chat = chats[chatIndex];
    const messages = chat.messages || [];
    const messagesContainer = document.getElementById('messages');
    messagesContainer.innerHTML = '';
  
    messages.forEach(message => {
      const messageElement = document.createElement('div');
      messageElement.className = `message ${message.user === localStorage.getItem('username') ? 'user' : 'other'}`;
      messageElement.innerText = `${message.user}: ${message.text}`;
      messagesContainer.appendChild(messageElement);
    });
  }
  
  // Send a new message
  function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const messageText = messageInput.value;
  
    if (messageText) {
      const username = localStorage.getItem('username');
      const chats = JSON.parse(localStorage.getItem('chats')) || [];
      const currentChatIndex = document.getElementById('currentChatName').innerText;
      const chatIndex = chats.findIndex(chat => chat.name === currentChatIndex);
  
      const newMessage = { user: username, text: messageText };
      chats[chatIndex].messages = chats[chatIndex].messages || [];
      chats[chatIndex].messages.push(newMessage);
      localStorage.setItem('chats', JSON.stringify(chats));
  
      // Reload the chat window with the new message
      loadMessages(chatIndex);
      messageInput.value = ''; // Clear input field
    }
  }
  
  // Close the current chat window
  function closeChat() {
    document.getElementById('chatWindow').style.display = 'none';
  }
  
  // Create new chat
  function createChat() {
    const chatName = document.getElementById('chatName').value;
    const chatType = document.getElementById('chatType').value;
    const chatPassword = document.getElementById('chatPassword').value;
  
    if (!chatName) {
      alert('Please enter a chat name.');
      return;
    }
  
    const chats = JSON.parse(localStorage.getItem('chats')) || [];
    
    // Prevent creating multiple chats with the same name
    if (chats.some(chat => chat.name === chatName)) {
      alert('A chat with this name already exists.');
      return;
    }
  
    const newChat = {
      name: chatName,
      type: chatType,
      password: chatType === 'password' ? chatPassword : '',
      owner: localStorage.getItem('username'),  // Save owner information
    };
  
    chats.push(newChat);
    localStorage.setItem('chats', JSON.stringify(chats));
  
    loadChats();
    document.getElementById('chatName').value = '';
    document.getElementById('chatPassword').value = '';
  }
  
  // Delete chat (only if owner)
  function deleteChat(index) {
    const chats = JSON.parse(localStorage.getItem('chats')) || [];
    const chat = chats[index];
    
    // Check if the current user is the owner
    if (chat.owner === localStorage.getItem('username')) {
      chats.splice(index, 1);
      localStorage.setItem('chats', JSON.stringify(chats));
      loadChats();
    } else {
      alert('You are not the owner of this chat!');
    }
  }
  function toggleChatCreation() {
    const dropdown = document.getElementById('chatCreationDropdown');
    dropdown.classList.toggle('show');
  }
  
  function handleChatTypeChange() {
    const type = document.getElementById('chatType').value;
    const passwordField = document.getElementById('chatPassword');
    passwordField.style.display = type === 'password' ? 'block' : 'none';
  }
  function sendPhoto(input) {
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.maxWidth = '200px';
        document.getElementById('messages').appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  }
  
  function sendVideo(input) {
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const video = document.createElement('video');
        video.src = e.target.result;
        video.controls = true;
        video.style.maxWidth = '300px';
        document.getElementById('messages').appendChild(video);
      };
      reader.readAsDataURL(file);
    }
  }
  
  
  // Show password field if password protected chat is selected
  document.getElementById('chatType').addEventListener('change', function () {
    const passwordField = document.getElementById('chatPassword');
    if (this.value === 'password') {
      passwordField.style.display = 'inline';
    } else {
      passwordField.style.display = 'none';
    }
  });

  
  // Enable sending message with Enter key
document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("messageInput");
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault(); // Prevent new lines if needed
        sendMessage();
      }
    });
  });
  