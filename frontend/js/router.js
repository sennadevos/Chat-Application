import { Auth } from './auth.js';
import { Chat } from './chat.js';
import { UI } from './ui.js';

const routes = {
    '#/login': Auth.renderLogin,
    '#/signup': Auth.renderSignup,
    '#/verify': Auth.renderVerify,
    '#/chat': Chat.init.bind(Chat) 
};

export class Router {
    static init() {
        window.addEventListener('hashchange', this.handleRoute.bind(this));
        this.handleRoute();
    }

    static handleRoute() {
        const hash = window.location.hash || '#/login';
        const app = document.getElementById('app');
        
        // Clear previous state if needed (e.g. websocket)
        if (hash !== '#/chat') {
            Chat.destroy();
        }

        // Middleware: Auth Check
        const token = localStorage.getItem('accessToken');
        const publicRoutes = ['#/login', '#/signup', '#/verify'];

        if (!token && !publicRoutes.includes(hash)) {
            window.location.hash = '#/login';
            return;
        }

        if (token && publicRoutes.includes(hash)) {
            window.location.hash = '#/chat';
            return;
        }

        // Route Logic
        const renderer = routes[hash];
        if (renderer) {
            app.innerHTML = ''; // Clear app
            
            // Layout Wrapper for Auth Pages vs Chat
            // Chat renders its own full layout.
            // Auth pages share a common centered layout.
            if (publicRoutes.includes(hash)) {
                app.className = "flex min-h-screen flex-col items-center justify-center bg-surface px-6 py-12 dark:bg-background-dark lg:px-8";
                // We need to bind 'this' context if methods use 'this'
                renderer.call(Auth, app);
            } else {
                app.className = "h-full w-full";
                // Chat.init is async, but we don't await it here blocking
                renderer(app);
            }
        } else {
            // 404
            window.location.hash = '#/login';
        }
    }
}

// Initialize UI globals (toast container, theme) logic when router loads or app starts
window.Auth = Auth;
window.Chat = Chat;
window.UI = UI;

// Export for main entry
