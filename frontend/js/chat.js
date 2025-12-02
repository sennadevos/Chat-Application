import { Api } from './api.js';
import { UI } from './ui.js';
import { Auth } from './auth.js';
import { WebSocketClient } from './websocket.js';

export class Chat {
    static currentUser = null;
    static currentChannel = null;
    static websocket = null;

    static async init(container) {
        // render layout
        this.renderLayout(container);
        
        try {
            await this.fetchCurrentUser();
            await this.fetchChannels();
            this.initWebSocket();
        } catch (error) {
            console.error(error);
            UI.showToast('Failed to load chat data', 'error');
            Auth.logout();
        }
    }
    
    static destroy() {
         if (this.websocket) {
             this.websocket.deactivate();
             this.websocket = null;
         }
    }

    static async fetchCurrentUser() {
        const response = await Api.get('/users/@me');
        this.currentUser = response.data;
        document.getElementById('user-name').innerText = this.currentUser.username;
        // Init avatar if needed
    }

    static initWebSocket() {
        const token = localStorage.getItem('accessToken');
        this.websocket = new WebSocketClient(token, (message) => {
            this.handleNewMessage(message);
        });
        this.websocket.activate();
    }

    static async fetchChannels() {
        // Depending on API, users/@me might return channels
        // If we already have currentUser.channels from fetchCurrentUser, use it.
        // Re-checking currentUser from response:
        const channels = this.currentUser.channels || [];
        this.renderChannelsList(channels);
        
        if (channels.length > 0) {
            this.selectChannel(channels[0]);
        }
    }

    static renderChannelsList(channels) {
        const list = document.getElementById('channels-list');
        list.innerHTML = '';
        channels.forEach(channel => {
            const li = document.createElement('li');
            li.className = 'p-3 rounded-lg hover:bg-surface hover:dark:bg-surface-dark cursor-pointer flex items-center gap-3 transition-colors';
            li.dataset.id = channel.id;
            li.innerHTML = `
                <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    ${channel.name.substring(0, 2).toUpperCase()}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-baseline">
                        <h3 class="font-medium text-text-primary dark:text-text-primary-dark truncate">${channel.name}</h3>
                        <span class="text-xs text-text-secondary dark:text-text-secondary-dark hidden">12:30</span>
                    </div>
                    <p class="text-sm text-text-secondary dark:text-text-secondary-dark truncate hidden">Last message preview...</p>
                </div>
            `;
            li.onclick = () => this.selectChannel(channel);
            list.appendChild(li);
        });
    }
    
    static selectChannel(channel) {
        this.currentChannel = channel;
        
        // Update Active State in sidebar
        const list = document.getElementById('channels-list');
        Array.from(list.children).forEach(child => {
            if (parseInt(child.dataset.id) === channel.id) {
                child.classList.add('bg-surface', 'dark:bg-surface-dark');
            } else {
                child.classList.remove('bg-surface', 'dark:bg-surface-dark');
            }
        });

        // Update Header
        document.getElementById('chat-header-title').innerText = channel.name;
        
        // Load Messages
        this.fetchMessages(channel.id);
        
        // Mobile Sidebar Toggle Logic could go here (hide sidebar)
        if (window.innerWidth < 768) {
             document.getElementById('sidebar').classList.add('hidden');
             document.getElementById('main-chat').classList.remove('hidden');
        }
    }

    static async fetchMessages(channelId) {
        const container = document.getElementById('messages-container');
        container.innerHTML = '<div class="flex justify-center p-5"><span class="text-text-secondary">Loading...</span></div>';
        
        try {
            const response = await Api.get(`/channels/${channelId}/messages`);
            const messages = response.data.content || response.data; // Handle paginated vs list
            this.renderMessages(messages);
        } catch (err) {
            console.error(err);
            container.innerHTML = '<div class="text-center text-red-500 p-5">Failed to load messages</div>';
        }
    }

    static renderMessages(messages) {
        const container = document.getElementById('messages-container');
        container.innerHTML = '';
        messages.forEach(msg => this.appendMessage(msg));
        this.scrollToBottom();
    }

    static appendMessage(message) {
        const container = document.getElementById('messages-container');
        const isMe = message.author.id === this.currentUser.id;
        
        const div = document.createElement('div');
        div.className = `flex w-full ${isMe ? 'justify-end' : 'justify-start'} mb-4`;
        
        // Styling based on Linear/Slack
        div.innerHTML = `
             <div class="flex max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'} gap-2">
                ${!isMe ? `<div class="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold shrink-0">${message.author.username.charAt(0).toUpperCase()}</div>` : ''}
                <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'}">
                    ${!isMe ? `<span class="text-xs text-text-secondary dark:text-text-secondary-dark mb-1 ml-1">${message.author.username}</span>` : ''}
                    <div class="px-4 py-2 rounded-2xl ${isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark rounded-bl-sm'} shadow-sm border border-transparent ${!isMe ? 'dark:border-gray-700' : ''}">
                        <p class="text-sm whitespace-pre-wrap break-words">${message.content}</p>
                    </div>
                    <span class="text-[10px] text-text-muted dark:text-text-muted-dark mt-1 opacity-70">Just now</span>
                </div>
            </div>
        `;
        container.appendChild(div);
    }

    static handleNewMessage(message) {
        if (this.currentChannel && message.channel.id === this.currentChannel.id) {
            this.appendMessage(message);
            this.scrollToBottom();
        } else {
            // UI indication for other channels?
            UI.showToast(`New message in ${message.channel.name}`, 'info');
        }
    }

    static scrollToBottom() {
        const container = document.getElementById('messages-container');
        container.scrollTop = container.scrollHeight;
    }

    static async sendMessage() {
        const input = document.getElementById('message-input');
        const content = input.value.trim();
        if (!content || !this.currentChannel) return;

        try {
            // Optimistic update? Or wait? Let's wait for now or simple confirm
            await Api.post(`/channels/${this.currentChannel.id}/messages`, { content });
            input.value = '';
            // Message will come back via WebSocket
        } catch (err) {
            UI.showToast('Failed to send message', 'error');
        }
    }

    static renderLayout(container) {
        container.className = "h-full w-full";
        container.innerHTML = `
            <div class="flex h-screen w-full overflow-hidden bg-background dark:bg-background-dark">
                <!-- Sidebar -->
                <aside id="sidebar" class="flex w-full md:w-80 flex-col border-r border-gray-200 bg-background dark:border-gray-800 dark:bg-background-dark md:flex">
                    <!-- Sidebar Header -->
                    <div class="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
                         <div class="flex items-center gap-2">
                             <div class="h-8 w-8 rounded bg-primary flex items-center justify-center text-white font-bold shadow">C</div>
                             <span class="font-semibold text-text-primary dark:text-text-primary-dark">ChatApp</span>
                         </div>
                         <button class="md:hidden p-2" onclick="document.getElementById('sidebar').classList.add('hidden'); document.getElementById('main-chat').classList.remove('hidden')">
                            <!-- Close icon for mobile -->
                            <svg class="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                         </button>
                    </div>
                    
                    <!-- Search -->
                    <div class="p-4">
                        <input type="text" placeholder="Search chats..." class="w-full rounded-md border border-gray-200 bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-surface-dark dark:text-text-primary-dark">
                    </div>

                    <!-- Channel List -->
                    <div class="flex-1 overflow-y-auto px-2">
                        <ul id="channels-list" class="flex flex-col gap-1">
                            <!-- Items injected here -->
                        </ul>
                    </div>

                    <!-- User Profile -->
                    <div class="border-t border-gray-200 p-4 dark:border-gray-800">
                        <div class="flex items-center gap-3">
                            <div class="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-purple-500"></div>
                            <div class="flex-1 overflow-hidden">
                                <p id="user-name" class="truncate text-sm font-medium text-text-primary dark:text-text-primary-dark">Loading...</p>
                                <p class="text-xs text-text-secondary dark:text-text-secondary-dark">Online</p>
                            </div>
                            <button onclick="window.Auth.logout()" class="text-text-secondary hover:text-red-500 transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                            </button>
                        </div>
                    </div>
                </aside>

                <!-- Main Chat Area -->
                <main id="main-chat" class="flex flex-1 flex-col relative w-full bg-white dark:bg-background-dark hidden md:flex">
                    <!-- Header -->
                    <div class="flex h-16 items-center justify-between border-b border-gray-200 px-6 dark:border-gray-800">
                        <div class="flex items-center gap-3">
                             <button class="md:hidden mr-2 text-text-secondary" onclick="document.getElementById('sidebar').classList.remove('hidden'); document.getElementById('main-chat').classList.add('hidden')">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                             </button>
                            <h2 id="chat-header-title" class="text-lg font-semibold text-text-primary dark:text-text-primary-dark">Select a channel</h2>
                        </div>
                         <div class="flex items-center gap-4">
                             <button onclick="window.UI.toggleDarkMode()" class="text-text-secondary hover:text-primary transition-colors">
                                <!-- Moon/Sun icon -->
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
                             </button>
                         </div>
                    </div>

                    <!-- Messages -->
                    <div id="messages-container" class="flex-1 overflow-y-auto p-6 bg-surface/50 dark:bg-background-dark">
                        <!-- Messages injected here -->
                        <div class="flex h-full items-center justify-center text-text-secondary">
                            Select a conversation to start chatting
                        </div>
                    </div>

                    <!-- Input Area -->
                    <div class="p-4 border-t border-gray-200 dark:border-gray-800 bg-background dark:bg-background-dark">
                        <div class="flex items-end gap-2 rounded-xl border border-gray-300 bg-surface px-4 py-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary dark:border-gray-700 dark:bg-surface-dark">
                            <textarea 
                                id="message-input"
                                rows="1"
                                class="max-h-32 w-full resize-none bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary dark:text-text-primary-dark"
                                placeholder="Type a message..."
                                oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px'"
                                onkeydown="if(event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); window.Chat.sendMessage(); }"
                            ></textarea>
                            <button onclick="window.Chat.sendMessage()" class="mb-1 rounded-full bg-primary p-1.5 text-white shadow-md hover:bg-primary-hover transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9-2-9-18-9 18 9-2zm0 0v-8"/></svg>
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }
}
