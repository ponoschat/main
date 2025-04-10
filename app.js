async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (username && password) {
    localStorage.setItem('username', username);
    localStorage.setItem('password', password);

    const adminPasswordHash = '2cf7b314740936e79c3139d7c1467cf0190037682aa1581f7e3d0dbecf537b38';
    const inputPasswordHash = await hashPassword(password);

    localStorage.setItem('isAdmin', username === 'admin' && inputPasswordHash === adminPasswordHash);

    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('chatSection').style.display = 'block';

    loadChats();
    displayAdminControls();
  } else {
    alert('Please enter both username and password.');
  }
}

function loadChats() {
  const chatList = document.getElementById('chatList');
  chatList.innerHTML = '';

  firebase.database().ref('chats').once('value', snapshot => {
    const chats = snapshot.val() || {};
    Object.entries(chats).forEach(([key, chat]) => {
      const chatItem = document.createElement('div');
      chatItem.className = `chat-item ${chat.type}`;
      chatItem.innerHTML = `
        <strong>${chat.name}</strong> (${chat.type}) 
        <button onclick="openChat('${key}')">Open</button>
        ${chat.owner === localStorage.getItem('username') ? `<button onclick="deleteChat('${key}')">Delete</button>` : ''}
      `;
      chatList.appendChild(chatItem);
    });
  });
}

function displayAdminControls() {
  if (localStorage.getItem('isAdmin') === 'true') {
    const deleteAllButton = document.createElement('button');
    deleteAllButton.innerText = 'Delete All Chats';
    deleteAllButton.onclick = deleteAllChats;
    document.getElementById('chatSection').appendChild(deleteAllButton);
  }
}

function deleteAllChats() {
  if (localStorage.getItem('isAdmin') === 'true') {
    firebase.database().ref('chats').remove();
    loadChats();
  } else {
    alert('You do not have permission to delete all chats.');
  }
}

function openChat(chatId) {
  firebase.database().ref(`chats/${chatId}`).once('value', snapshot => {
    const chat = snapshot.val();
    if (!chat) return;

    if (chat.type === 'password') {
      const input = prompt('Enter the chat password:');
      if (input !== chat.password) {
        alert('Incorrect password');
        return;
      }
    }

    document.getElementById('chatWindow').style.display = 'block';
    document.getElementById('currentChatName').innerText = chat.name;
    document.getElementById('chatWindow').setAttribute('data-chat-id', chatId);
    loadMessages(chatId);
  });
}

function loadMessages(chatId) {
  const messagesContainer = document.getElementById('messages');
  messagesContainer.innerHTML = '';

  firebase.database().ref(`chats/${chatId}/messages`).on('value', snapshot => {
    const messages = snapshot.val() || [];
    messagesContainer.innerHTML = '';
    messages.forEach(message => {
      const messageElement = document.createElement('div');
      messageElement.className = `message ${message.user === localStorage.getItem('username') ? 'user' : 'other'}`;
      messageElement.innerText = `${message.user}: ${message.text}`;
      messagesContainer.appendChild(messageElement);
    });
  });
}

function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const messageText = messageInput.value.trim();
  if (!messageText) return;

  const chatId = document.getElementById('chatWindow').getAttribute('data-chat-id');
  const username = localStorage.getItem('username');

  firebase.database().ref(`chats/${chatId}/messages`).once('value', snapshot => {
    const messages = snapshot.val() || [];
    messages.push({ user: username, text: messageText });

    firebase.database().ref(`chats/${chatId}/messages`).set(messages);
    messageInput.value = '';
  });
}

function closeChat() {
  document.getElementById('chatWindow').style.display = 'none';
  document.getElementById('chatWindow').removeAttribute('data-chat-id');
}

function createChat() {
  const name = document.getElementById('chatName').value;
  const type = document.getElementById('chatType').value;
  const password = document.getElementById('chatPassword').value;

  if (!name) {
    alert('Please enter a chat name.');
    return;
  }

  const newChat = {
    name,
    type,
    password: type === 'password' ? password : '',
    owner: localStorage.getItem('username'),
    messages: []
  };

  const chatsRef = firebase.database().ref('chats');
  chatsRef.orderByChild('name').equalTo(name).once('value', snapshot => {
    if (snapshot.exists()) {
      alert('A chat with this name already exists.');
    } else {
      chatsRef.push(newChat);
      loadChats();
      document.getElementById('chatName').value = '';
      document.getElementById('chatPassword').value = '';
    }
  });
}

function deleteChat(chatId) {
  firebase.database().ref(`chats/${chatId}`).once('value', snapshot => {
    const chat = snapshot.val();
    if (chat.owner === localStorage.getItem('username')) {
      firebase.database().ref(`chats/${chatId}`).remove();
      loadChats();
    } else {
      alert('You are not the owner of this chat!');
    }
  });
}

function toggleChatCreation() {
  document.getElementById('chatCreationDropdown').classList.toggle('show');
}

function handleChatTypeChange() {
  const type = document.getElementById('chatType').value;
  const passwordField = document.getElementById('chatPassword');
  passwordField.style.display = type === 'password' ? 'block' : 'none';
}

document.getElementById('chatType').addEventListener('change', handleChatTypeChange);

document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("messageInput");
  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });
});
