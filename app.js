// Hashing function
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Login functionality
async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (username && password) {
    localStorage.setItem('username', username);
    localStorage.setItem('password', password);

    const adminPasswordHash = '2cf7b314740936e79c3139d7c1467cf0190037682aa1581f7e3d0dbecf537b38';
    const inputPasswordHash = await hashPassword(password);

    if (username === 'admin' && inputPasswordHash === adminPasswordHash) {
      localStorage.setItem('isAdmin', true);
    } else {
      localStorage.setItem('isAdmin', false);
    }

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

// Display admin controls
function displayAdminControls() {
  if (localStorage.getItem('isAdmin') === 'true') {
    const deleteAllButton = document.createElement('button');
    deleteAllButton.innerText = 'Delete All Chats';
    deleteAllButton.onclick = deleteAllChats;
    document.getElementById('chatSection').appendChild(deleteAllButton);
  }
}

// Delete all chats
function deleteAllChats() {
  if (localStorage.getItem('isAdmin') === 'true') {
    localStorage.removeItem('chats');
    loadChats();
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

  loadMessages(index);
}

// Load messages for selected chat
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

// Send a message
function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const messageText = messageInput.value;

  if (messageText) {
    const username = localStorage.getItem('username');
    const chats = JSON.parse(localStorage.getItem('chats')) || [];
    const currentChatName = document.getElementById('currentChatName').innerText;
    const chatIndex = chats.findIndex(chat => chat.name === currentChatName);

    const newMessage = { user: username, text: messageText };
    chats[chatIndex].messages = chats[chatIndex].messages || [];
    chats[chatIndex].messages.push(newMessage);
    localStorage.setItem('chats', JSON.stringify(chats));

    loadMessages(chatIndex);
    messageInput.value = '';
  }
}

// Close current chat
function closeChat() {
  document.getElementById('chatWindow').style.display = 'none';
}

// Create a new chat
function createChat() {
  const chatName = document.getElementById('chatName').value;
  const chatType = document.getElementById('chatType').value;
  const chatPassword = document.getElementById('chatPassword').value;

  if (!chatName) {
    alert('Please enter a chat name.');
    return;
  }

  const chats = JSON.parse(localStorage.getItem('chats')) || [];

  if (chats.some(chat => chat.name === chatName)) {
    alert('A chat with this name already exists.');
    return;
  }

  const newChat = {
    name: chatName,
    type: chatType,
    password: chatType === 'password' ? chatPassword : '',
    owner: localStorage.getItem('username'),
  };

  chats.push(newChat);
  localStorage.setItem('chats', JSON.stringify(chats));

  loadChats();
  document.getElementById('chatName').value = '';
  document.getElementById('chatPassword').value = '';
}

// Delete a chat
function deleteChat(index) {
  const chats = JSON.parse(localStorage.getItem('chats')) || [];
  const chat = chats[index];

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

// Show/hide password input based on chat type
document.getElementById('chatType').addEventListener('change', function () {
  const passwordField = document.getElementById('chatPassword');
  passwordField.style.display = this.value === 'password' ? 'inline' : 'none';
});

// Enable Enter to send message
document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("messageInput");
  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });
});
