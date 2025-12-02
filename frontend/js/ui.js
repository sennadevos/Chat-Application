export class UI {
    static init() {
        this.initDarkMode();
        this.createToastContainer();
    }

    static initDarkMode() {
        // On page load or when changing themes, best to add inline in <head> to avoid FOUC
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    static toggleDarkMode() {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        }
    }

    static createToastContainer() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            // Tailwind classes for fixed position, z-index
            container.className = 'fixed top-5 right-5 z-50 flex flex-col space-y-3';
            document.body.appendChild(container);
        }
    }

    static showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        
        // Colors based on type
        let bgClass = 'bg-surface dark:bg-surface-dark';
        let textClass = 'text-text-primary dark:text-text-primary-dark';
        let borderClass = 'border-l-4';
        
        if (type === 'success') {
            borderClass += ' border-green-500';
        } else if (type === 'error') {
            borderClass += ' border-red-500';
        } else {
            borderClass += ' border-primary';
        }

        toast.className = `min-w-[300px] p-4 rounded shadow-lg transform transition-all duration-300 translate-x-full ${bgClass} ${textClass} ${borderClass} flex items-center`;
        toast.innerHTML = `
            <div class="flex-1">
                <p class="text-sm font-medium">${message}</p>
            </div>
        `;

        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-full');
        });

        // Remove after 3s
        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
    
    // Helper to safely toggle loading state on buttons
    static setLoading(button, isLoading, loadingText = 'Loading...') {
        if (isLoading) {
            button.dataset.originalText = button.innerText;
            button.innerText = loadingText;
            button.disabled = true;
            button.classList.add('opacity-75', 'cursor-not-allowed');
        } else {
            button.innerText = button.dataset.originalText || 'Submit';
            button.disabled = false;
            button.classList.remove('opacity-75', 'cursor-not-allowed');
        }
    }
}
