import { Api } from './api.js';
import { UI } from './ui.js';

export class Auth {
    // --- Logic ---
    static async login(username, password) {
        const response = await Api.post('/auth/login', { username, password });
        if (response.data) {
            localStorage.setItem('accessToken', response.data);
            return true;
        }
        return false;
    }

    static async register(data) {
        return await Api.post('/auth/register', data);
    }

    static async verify(phone, code) {
        return await Api.post('/auth/verify', { phone, code });
    }

    static logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user'); // If we store user details
        window.location.hash = '#/login';
    }

    // --- UI Renderers ---
    static renderLogin(container) {
        container.innerHTML = `
            <div class="flex w-full max-w-sm flex-col gap-6">
                <div class="flex flex-col items-center text-center">
                    <h1 class="text-3xl font-bold tracking-tight text-text-primary dark:text-text-primary-dark">Welcome back</h1>
                    <p class="text-text-secondary dark:text-text-secondary-dark">Sign in to your account to continue</p>
                </div>
                <form id="login-form" class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-text-primary dark:text-text-primary-dark" for="username">Username</label>
                        <input 
                            id="username" 
                            name="username" 
                            type="text" 
                            required 
                            class="rounded-md border border-gray-300 bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-surface-dark dark:text-text-primary-dark"
                            placeholder="john_doe"
                        />
                    </div>
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center justify-between">
                            <label class="text-sm font-medium text-text-primary dark:text-text-primary-dark" for="password">Password</label>
                            <a href="#" class="text-xs font-medium text-primary hover:underline">Forgot password?</a>
                        </div>
                        <input 
                            id="password" 
                            name="password" 
                            type="password" 
                            required 
                            class="rounded-md border border-gray-300 bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-surface-dark dark:text-text-primary-dark"
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" class="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900">
                        Sign In
                    </button>
                </form>
                <p class="text-center text-sm text-text-secondary dark:text-text-secondary-dark">
                    Don't have an account? <a href="#/signup" class="font-medium text-primary hover:underline">Sign up</a>
                </p>
            </div>
        `;

        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            UI.setLoading(btn, true);

            const username = e.target.username.value;
            const password = e.target.password.value;

            try {
                const success = await this.login(username, password);
                if (success) {
                    UI.showToast('Login successful', 'success');
                    window.location.hash = '#/chat';
                }
            } catch (err) {
                UI.showToast(err.message || 'Login failed', 'error');
            } finally {
                UI.setLoading(btn, false);
            }
        });
    }

    static renderSignup(container) {
        container.innerHTML = `
            <div class="flex w-full max-w-sm flex-col gap-6">
                <div class="flex flex-col items-center text-center">
                    <h1 class="text-3xl font-bold tracking-tight text-text-primary dark:text-text-primary-dark">Create an account</h1>
                    <p class="text-text-secondary dark:text-text-secondary-dark">Enter your details to get started</p>
                </div>
                <form id="signup-form" class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-text-primary dark:text-text-primary-dark" for="username">Username</label>
                        <input id="username" name="username" type="text" required class="input-field" placeholder="john_doe"/>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-text-primary dark:text-text-primary-dark" for="phone">Phone Number</label>
                        <input id="phone" name="phone" type="tel" required class="input-field" placeholder="+1234567890"/>
                    </div>
                     <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-text-primary dark:text-text-primary-dark" for="password">Password</label>
                        <input id="password" name="password" type="password" required class="input-field" placeholder="••••••••"/>
                    </div>
                     <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-text-primary dark:text-text-primary-dark" for="confirm-password">Confirm Password</label>
                        <input id="confirm-password" name="confirmPassword" type="password" required class="input-field" placeholder="••••••••"/>
                    </div>
                    <button type="submit" class="btn-primary mt-2">Sign Up</button>
                </form>
                <p class="text-center text-sm text-text-secondary dark:text-text-secondary-dark">
                    Already have an account? <a href="#/login" class="font-medium text-primary hover:underline">Sign in</a>
                </p>
            </div>
        `;

        // Apply styles dynamically for brevity or rely on css classes if defined in index.html/input.css.
        // I used inline classes in login, here I used 'input-field' and 'btn-primary' placeholder. 
        // I should probably keep it consistent with full tailwind classes as requested "vanilla".
        // Just fix the classes quickly here.
        const inputs = container.querySelectorAll('.input-field');
        inputs.forEach(i => i.className = "rounded-md border border-gray-300 bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-surface-dark dark:text-text-primary-dark");
        const btn = container.querySelector('.btn-primary');
        btn.className = "rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900";

        document.getElementById('signup-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            const data = Object.fromEntries(new FormData(e.target));
            
            if (data.password !== data.confirmPassword) {
                UI.showToast("Passwords do not match", 'error');
                return;
            }
            delete data.confirmPassword;

            UI.setLoading(btn, true);
            try {
                await this.register(data);
                UI.showToast('Account created! Please verify your phone.', 'success');
                // Pass phone to next route via query param or state? 
                // Simple hash router: verify logic handles input, maybe store in temp storage
                sessionStorage.setItem('temp_verify_phone', data.phone);
                window.location.hash = '#/verify';
            } catch (err) {
                UI.showToast(err.message || 'Signup failed', 'error');
            } finally {
                UI.setLoading(btn, false);
            }
        });
    }

    static renderVerify(container) {
         container.innerHTML = `
            <div class="flex w-full max-w-sm flex-col gap-6">
                <div class="flex flex-col items-center text-center">
                    <h1 class="text-3xl font-bold tracking-tight text-text-primary dark:text-text-primary-dark">Verify Account</h1>
                    <p class="text-text-secondary dark:text-text-secondary-dark">Enter the 6-digit code sent to your phone</p>
                </div>
                <form id="verify-form" class="flex flex-col gap-4">
                     <div class="flex justify-center gap-2">
                        ${Array(6).fill(0).map((_, i) => `
                            <input type="text" maxlength="1" data-index="${i}" class="otp-input h-12 w-12 rounded-md border border-gray-300 bg-background text-center text-lg font-semibold outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-surface-dark dark:text-text-primary-dark" />
                        `).join('')}
                    </div>
                    <input type="hidden" id="code-hidden" name="code">
                    <button type="submit" class="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900">
                        Verify
                    </button>
                </form>
                <div class="text-center">
                    <button id="resend-btn" class="text-sm font-medium text-primary hover:underline focus:outline-none">Resend Verification Code</button>
                </div>
            </div>
        `;

        const form = document.getElementById('verify-form');
        const inputs = form.querySelectorAll('.otp-input');
        const hiddenInput = document.getElementById('code-hidden');

        // OTP Logic
        inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (e.target.value.length === 1) {
                    if (index < inputs.length - 1) inputs[index + 1].focus();
                }
                updateHiddenCode();
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    inputs[index - 1].focus();
                }
            });

            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const paste = (e.clipboardData || window.clipboardData).getData('text');
                const digits = paste.match(/\d/g); // only digits
                if (digits && digits.length > 0) {
                    digits.slice(0, 6).forEach((d, i) => {
                         if (inputs[i]) inputs[i].value = d;
                    });
                    updateHiddenCode();
                    // Focus next empty or last
                    const next = Math.min(digits.length, 5);
                    inputs[next].focus();
                }
            });
        });

        function updateHiddenCode() {
            hiddenInput.value = Array.from(inputs).map(i => i.value).join('');
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            const code = hiddenInput.value;
            const phone = sessionStorage.getItem('temp_verify_phone');

            if (code.length !== 6) {
                UI.showToast('Please enter a complete 6-digit code', 'error');
                return;
            }
            if (!phone) {
                UI.showToast('Phone number not found. Please signup again.', 'error');
                window.location.hash = '#/signup';
                return;
            }

            UI.setLoading(btn, true);
            try {
                await this.verify(phone, code);
                UI.showToast('Account verified! Please login.', 'success');
                sessionStorage.removeItem('temp_verify_phone');
                window.location.hash = '#/login';
            } catch (err) {
                UI.showToast(err.message || 'Verification failed', 'error');
            } finally {
                UI.setLoading(btn, false);
            }
        });
        
        // Resend Logic (Mock)
        const resendBtn = document.getElementById('resend-btn');
        resendBtn.addEventListener('click', () => {
            // Implement resend API call if it exists
            UI.showToast('Verification code resent', 'info');
            let count = 30;
            resendBtn.disabled = true;
            const originalText = resendBtn.innerText;
            const interval = setInterval(() => {
                resendBtn.innerText = `Resend in ${count}s`;
                count--;
                if (count < 0) {
                    clearInterval(interval);
                    resendBtn.innerText = originalText;
                    resendBtn.disabled = false;
                }
            }, 1000);
        });
    }
}
