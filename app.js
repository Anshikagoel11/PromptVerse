document.addEventListener('DOMContentLoaded', function () {
  // DOM Elements
  const chatBox = document.getElementById('chatBox');
  const chatForm = document.getElementById('chatForm');
  const userInput = document.getElementById('userInput');
  const loader = document.getElementById('loader');
  const welcomeScreen = document.getElementById('welcomeScreen');
  const newChatBtn = document.getElementById('newChat');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const sidebar = document.querySelector('.sidebar');
  const settingsModal = document.getElementById('settingsModal');
  const settingsBtn = document.getElementById('settingsBtn');
  const closeModalBtn = document.querySelector('.close-modal');
  const saveSettingsBtn = document.querySelector('.save-settings');
  const quickPrompts = document.querySelectorAll('.quick-prompt');
  const modelSelect = document.getElementById('modelSelect');
  const themeSelect = document.getElementById('themeSelect');
  const fontSizeSlider = document.getElementById('fontSize');
  const typingToggle = document.getElementById('typingToggle');
  const typingIndicator = document.getElementById('typingIndicator');
  const fontSizeValue = document.getElementById('fontSizeValue');

  // State
  let currentSessionId = getOrCreateSessionId();
  let isProcessing = false;

  // Initialize the app
  init();

  function init() {
    loadSettings();
    setupEventListeners();
    initializeChatInterface(); // Changed from showWelcomeScreen()
    userInput.focus();
  }

  function initializeChatInterface() {
    // Always show chat interface ready for messages
    welcomeScreen.style.display = 'none';
    chatBox.style.display = 'flex';
    chatBox.innerHTML = ''; // Start with empty chat
  }

  function getOrCreateSessionId() {
    try {
      let sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('sessionId', sessionId);
      }
      return sessionId;
    } catch (e) {
      console.error('Failed to generate session ID:', e);
      return 'temp-' + Math.random().toString(36).substring(2, 15);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (isProcessing) return;
    
    const message = userInput.value.trim();
    if (!message) return;

    isProcessing = true;
    addMessageToChat('user', message);
    userInput.value = '';
    loader.style.display = 'block';

    if (typingToggle.checked) showTypingIndicator();

    try {
      const response = await fetch('http://localhost:4000/askQues', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ques: message,
          sessionId: currentSessionId,
          model: modelSelect.value
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text();
      addMessageToChat('assistant', data);
    } catch (error) {
      console.error('Error:', error);
      addMessageToChat('assistant', '⚠️ Error: Could not get response from server');
    } finally {
      loader.style.display = 'none';
      hideTypingIndicator();
      isProcessing = false;
      userInput.focus();
    }
  }

  function addMessageToChat(role, content) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${role}`;
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageElement.innerHTML = `
      <div class="bubble">${content}</div>
      <div class="message-info">${timestamp} • ${role === 'user' ? 'You' : 'Assistant'}</div>
    `;
    
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function startNewChat() {
    if (isProcessing) return;
    
    chatBox.innerHTML = '';
    userInput.value = '';
    loader.style.display = 'none';
    hideTypingIndicator();
    initializeChatInterface();

    clearSession().then(() => {
      currentSessionId = getOrCreateSessionId();
      userInput.focus();
    }).catch(error => {
      console.error('Error clearing session:', error);
      currentSessionId = getOrCreateSessionId();
    });
  }

  async function clearSession() {
    try {
      const response = await fetch('http://localhost:4000/deleteSession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: currentSessionId })
      });

      if (!response.ok) {
        throw new Error('Failed to clear session');
      }
    } catch (error) {
      console.warn('Failed to clear session:', error);
      throw error;
    } finally {
      localStorage.removeItem('sessionId');
    }
  }

  function showTypingIndicator() {
    typingIndicator.style.display = 'block';
    typingIndicator.innerHTML = `
      <div class="bubble">
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
    typingIndicator.innerHTML = '';
  }

  function setupSidebarToggle() {
    mobileMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('visible');
    });

    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && 
          !sidebar.contains(e.target) && 
          !mobileMenuToggle.contains(e.target)) {
        sidebar.classList.remove('visible');
      }
    });
  }

  function setupSettings() {
    settingsBtn.addEventListener('click', openSettings);
    closeModalBtn.addEventListener('click', closeSettings);
    saveSettingsBtn.addEventListener('click', saveSettings);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && settingsModal.style.display === 'flex') {
        closeSettings();
      }
    });

    themeSelect.addEventListener('change', () => {
      document.body.className = themeSelect.value;
    });

    // Update font size value display
    fontSizeSlider.addEventListener('input', () => {
      fontSizeValue.textContent = fontSizeSlider.value;
    });
  }

  function openSettings() {
    themeSelect.value = localStorage.getItem('theme') || 'dark';
    const fontSize = localStorage.getItem('fontSize') || 15;
    fontSizeSlider.value = fontSize;
    fontSizeValue.textContent = fontSize;
    typingToggle.checked = localStorage.getItem('typingIndicator') === 'true';
    settingsModal.style.display = 'flex';
  }

  function saveSettings() {
    const theme = themeSelect.value;
    const fontSize = fontSizeSlider.value;
    const showTyping = typingToggle.checked;

    localStorage.setItem('theme', theme);
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('typingIndicator', showTyping);

    applySettings(theme, fontSize);
    closeSettings();
  }

  function applySettings(theme, fontSize) {
    document.body.className = theme;
    document.documentElement.style.setProperty('--font-size', `${fontSize}px`);
  }

  function closeSettings() {
    settingsModal.style.display = 'none';
  }

  function loadSettings() {
    const theme = localStorage.getItem('theme') || 'dark';
    const fontSize = localStorage.getItem('fontSize') || 15;
    const showTyping = localStorage.getItem('typingIndicator') === 'true';

    applySettings(theme, fontSize);
    themeSelect.value = theme;
    fontSizeSlider.value = fontSize;
    fontSizeValue.textContent = fontSize;
    typingToggle.checked = showTyping;
  }

  function setupQuickPrompts() {
    quickPrompts.forEach((prompt) => {
      prompt.addEventListener('click', () => {
        const promptText = prompt.textContent;
        startNewChat();
        setTimeout(() => {
          userInput.value = promptText;
          chatForm.dispatchEvent(new Event('submit'));
        }, 100);
      });
    });
  }

  function setupEventListeners() {
    chatForm.addEventListener('submit', handleSubmit);
    newChatBtn.addEventListener('click', startNewChat);
    
    // Allow pressing Enter in textarea but Shift+Enter for new line
    userInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
      }
    });

    setupSidebarToggle();
    setupSettings();
    setupQuickPrompts();
  }
});