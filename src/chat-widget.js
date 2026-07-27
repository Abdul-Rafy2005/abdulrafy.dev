function initChatWidget() {
  const container = document.createElement('div');
  container.className = 'chat-widget';
  container.innerHTML = `
    <button class="chat-widget__toggle" aria-label="Open chat">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    </button>
    <div class="chat-widget__window">
      <div class="chat-widget__header">
        <span class="chat-widget__title">Ask me anything</span>
        <button class="chat-widget__close" aria-label="Close chat">&times;</button>
      </div>
      <div class="chat-widget__messages"></div>
      <form class="chat-widget__form">
        <input
          class="chat-widget__input"
          type="text"
          placeholder="Type a message..."
          autocomplete="off"
        />
        <button class="chat-widget__send" type="submit" aria-label="Send">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  `;
  document.body.appendChild(container);

  const toggle = container.querySelector('.chat-widget__toggle');
  const window_ = container.querySelector('.chat-widget__window');
  const closeBtn = container.querySelector('.chat-widget__close');
  const messages = container.querySelector('.chat-widget__messages');
  const form = container.querySelector('.chat-widget__form');
  const input = container.querySelector('.chat-widget__input');

  let isOpen = false;

  function toggleWindow() {
    isOpen = !isOpen;
    window_.classList.toggle('chat-widget__window--open', isOpen);
    toggle.classList.toggle('chat-widget__toggle--hidden', isOpen);
    if (isOpen) {
      input.focus();
      messages.scrollTop = messages.scrollHeight;
    }
  }

  toggle.addEventListener('click', toggleWindow);
  closeBtn.addEventListener('click', toggleWindow);

  function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `chat-widget__msg chat-widget__msg--${sender}`;
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
    return msg;
  }

  function showThinking() {
    const thinking = document.createElement('div');
    thinking.className = 'chat-widget__msg chat-widget__msg--bot chat-widget__msg--thinking';
    thinking.textContent = 'Thinking...';
    messages.appendChild(thinking);
    messages.scrollTop = messages.scrollHeight;
    return thinking;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    input.value = '';

    const thinkingEl = showThinking();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      thinkingEl.remove();

      if (!res.ok) {
        addMessage('Sorry, something went wrong. Please try again.', 'bot');
        return;
      }

      const data = await res.json();
      addMessage(data.reply || 'No response received.', 'bot');
    } catch {
      thinkingEl.remove();
      addMessage('Could not reach the server. Please try again later.', 'bot');
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatWidget);
} else {
  initChatWidget();
}
