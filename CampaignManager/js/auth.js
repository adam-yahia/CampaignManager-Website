/**
 * Authentication Manager - Handles user login, signup, and session management
 * Works with the Storage module to manage user data
 */

const Auth = {
    // Current form state
    currentForm: 'login',
    
    // Form elements
    elements: {},

    /**
     * Initialize authentication system
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.checkAuthStatus();
        this.showLoginForm();
    },

    /**
     * Cache DOM elements for better performance
     */
    cacheElements() {
        this.elements = {
            loginForm: document.getElementById('loginForm'),
            signupForm: document.getElementById('signupForm'),
            showSignup: document.getElementById('showSignup'),
            showLogin: document.getElementById('showLogin'),
            messageContainer: document.getElementById('messageContainer'),
            
            // Login form fields
            loginUsername: document.getElementById('loginUsername'),
            loginPassword: document.getElementById('loginPassword'),
            
            // Signup form fields
            signupUsername: document.getElementById('signupUsername'),
            signupPassword: document.getElementById('signupPassword'),
            confirmPassword: document.getElementById('confirmPassword')
        };
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Form submissions
        if (this.elements.loginForm) {
            this.elements.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        if (this.elements.signupForm) {
            this.elements.signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Form switching
        if (this.elements.showSignup) {
            this.elements.showSignup.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSignupForm();
            });
        }

        if (this.elements.showLogin) {
            this.elements.showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginForm();
            });
        }

        // Real-time validation
        if (this.elements.signupPassword) {
            this.elements.signupPassword.addEventListener('input', () => {
                this.validatePasswordStrength();
            });
        }

        if (this.elements.confirmPassword) {
            this.elements.confirmPassword.addEventListener('input', () => {
                this.validatePasswordMatch();
            });
        }

        // Username availability check
        if (this.elements.signupUsername) {
            this.elements.signupUsername.addEventListener('blur', () => {
                this.checkUsernameAvailability();
            });
        }
    },

    /**
     * Check if user is already logged in
     */
    checkAuthStatus() {
        const currentUser = Storage.getCurrentUser();
        const currentPage = window.location.pathname;
        const isLoginPage = currentPage.endsWith('login.html') || currentPage === '/' || currentPage === '';
        
        console.log('Auth check - Current user:', currentUser ? currentUser.username : 'none');
        console.log('Auth check - Current page:', currentPage);
        console.log('Auth check - Is login page:', isLoginPage);
        
        // Prevent redirect loops by checking if already redirecting
        if (window.location.search.includes('redirecting')) {
            console.log('Redirect flag detected, skipping auth check');
            return;
        }
        
        // Prevent too frequent redirects
        const lastRedirect = sessionStorage.getItem('lastAuthRedirect');
        const now = Date.now();
        if (lastRedirect && (now - parseInt(lastRedirect)) < 2000) {
            console.log('Recent redirect detected, preventing loop');
            return;
        }
        
        if (currentUser && isLoginPage) {
            // User is logged in but on login page, redirect to dashboard
            console.log('User logged in, redirecting to dashboard');
            sessionStorage.setItem('lastAuthRedirect', now.toString());
            window.location.replace('index.html');
        } else if (!currentUser && !isLoginPage) {
            // User is not logged in but trying to access protected page
            console.log('User not logged in, redirecting to login');
            sessionStorage.setItem('lastAuthRedirect', now.toString());
            window.location.replace('login.html?redirecting=true');
        }
    },

    /**
     * Handle login form submission
     */
    async handleLogin(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const username = formData.get('username').trim();
        const password = formData.get('password');

        // Clear previous messages
        this.clearMessages();

        // Validate inputs
        if (!this.validateLoginInputs(username, password)) {
            return;
        }

        // Show loading state
        this.setFormLoading(true);

        try {
            // Simulate network delay for better UX
            await this.delay(500);

            // Validate credentials
            const user = Storage.validateUser(username, password);
            
            if (user) {
                // Login successful
                const saveResult = Storage.setCurrentUser(user);
                console.log('User save result:', saveResult);
                
                // Verify user was saved
                const savedUser = Storage.getCurrentUser();
                console.log('Verification - saved user:', savedUser);
                
                if (savedUser && savedUser.id === user.id) {
                    this.showMessage('Login successful! Redirecting...', 'success');
                    
                    // Redirect after short delay
                    setTimeout(() => {
                        // Double-check user is still saved before redirect
                        const finalCheck = Storage.getCurrentUser();
                        console.log('Final check before redirect:', finalCheck);
                        if (finalCheck) {
                            window.location.replace('index.html');
                        } else {
                            console.error('User lost during redirect, retrying save');
                            Storage.setCurrentUser(user);
                            window.location.replace('index.html');
                        }
                    }, 1000);
                } else {
                    console.error('Failed to save user session');
                    this.showMessage('Session save failed. Please try again.', 'error');
                    this.setFormLoading(false);
                }
            } else {
                // Login failed
                this.showMessage('Invalid username or password. Please try again.', 'error');
                this.setFormLoading(false);
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('An error occurred during login. Please try again.', 'error');
            this.setFormLoading(false);
        }
    },

    /**
     * Handle signup form submission
     */
    async handleSignup(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const username = formData.get('username').trim();
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        // Clear previous messages
        this.clearMessages();

        // Validate inputs
        if (!this.validateSignupInputs(username, password, confirmPassword)) {
            return;
        }

        // Show loading state
        this.setFormLoading(true);

        try {
            // Simulate network delay
            await this.delay(500);

            // Check if username already exists
            if (Storage.findUserByUsername(username)) {
                this.showMessage('Username already exists. Please choose a different one.', 'error');
                this.setFormLoading(false);
                return;
            }

            // Create new user
            const newUser = Storage.addUser({
                username: username,
                password: password // In production, this should be hashed
            });

            if (newUser) {
                // Signup successful
                this.showMessage('Account created successfully! You can now log in.', 'success');
                
                // Switch to login form and fill username
                setTimeout(() => {
                    this.showLoginForm();
                    if (this.elements.loginUsername) {
                        this.elements.loginUsername.value = username;
                    }
                    this.setFormLoading(false);
                }, 1500);
            } else {
                this.showMessage('Failed to create account. Please try again.', 'error');
                this.setFormLoading(false);
            }
        } catch (error) {
            console.error('Signup error:', error);
            this.showMessage('An error occurred during signup. Please try again.', 'error');
            this.setFormLoading(false);
        }
    },

    /**
     * Validate login inputs
     */
    validateLoginInputs(username, password) {
        let isValid = true;

        if (!username) {
            this.showFieldError('loginUsername', 'Username is required');
            isValid = false;
        } else {
            this.clearFieldError('loginUsername');
        }

        if (!password) {
            this.showFieldError('loginPassword', 'Password is required');
            isValid = false;
        } else {
            this.clearFieldError('loginPassword');
        }

        return isValid;
    },

    /**
     * Validate signup inputs
     */
    validateSignupInputs(username, password, confirmPassword) {
        let isValid = true;

        // Username validation
        if (!username) {
            this.showFieldError('signupUsername', 'Username is required');
            isValid = false;
        } else if (username.length < 3) {
            this.showFieldError('signupUsername', 'Username must be at least 3 characters long');
            isValid = false;
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            this.showFieldError('signupUsername', 'Username can only contain letters, numbers, and underscores');
            isValid = false;
        } else {
            this.clearFieldError('signupUsername');
        }

        // Password validation
        if (!password) {
            this.showFieldError('signupPassword', 'Password is required');
            isValid = false;
        } else if (password.length < 6) {
            this.showFieldError('signupPassword', 'Password must be at least 6 characters long');
            isValid = false;
        } else {
            this.clearFieldError('signupPassword');
        }

        // Confirm password validation
        if (!confirmPassword) {
            this.showFieldError('confirmPassword', 'Please confirm your password');
            isValid = false;
        } else if (password !== confirmPassword) {
            this.showFieldError('confirmPassword', 'Passwords do not match');
            isValid = false;
        } else {
            this.clearFieldError('confirmPassword');
        }

        return isValid;
    },

    /**
     * Show field-specific error
     */
    showFieldError(fieldId, message) {
        const field = this.elements[fieldId];
        if (!field) return;

        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('error');
            
            // Remove existing error message
            const existingError = formGroup.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }

            // Add new error message
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
            formGroup.appendChild(errorElement);
        }
    },

    /**
     * Clear field-specific error
     */
    clearFieldError(fieldId) {
        const field = this.elements[fieldId];
        if (!field) return;

        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.classList.remove('error');
            const errorMessage = formGroup.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        }
    },

    /**
     * Check username availability
     */
    checkUsernameAvailability() {
        const username = this.elements.signupUsername.value.trim();
        if (username.length >= 3) {
            const existingUser = Storage.findUserByUsername(username);
            if (existingUser) {
                this.showFieldError('signupUsername', 'Username is already taken');
            } else {
                this.clearFieldError('signupUsername');
                // Show success indicator
                const formGroup = this.elements.signupUsername.closest('.form-group');
                if (formGroup) {
                    formGroup.classList.add('success');
                    setTimeout(() => formGroup.classList.remove('success'), 2000);
                }
            }
        }
    },

    /**
     * Validate password strength
     */
    validatePasswordStrength() {
        const password = this.elements.signupPassword.value;
        const formGroup = this.elements.signupPassword.closest('.form-group');
        
        // Remove existing strength indicator
        const existingIndicator = formGroup.querySelector('.password-strength');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        if (password.length > 0) {
            const strength = this.calculatePasswordStrength(password);
            const indicator = document.createElement('div');
            indicator.className = `password-strength ${strength.level}`;
            indicator.innerHTML = `<div class="password-strength-bar"></div>`;
            formGroup.appendChild(indicator);
        }
    },

    /**
     * Calculate password strength
     */
    calculatePasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 6) score++;
        if (password.length >= 10) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score < 3) return { level: 'weak', score };
        if (score < 5) return { level: 'medium', score };
        return { level: 'strong', score };
    },

    /**
     * Validate password match
     */
    validatePasswordMatch() {
        const password = this.elements.signupPassword.value;
        const confirmPassword = this.elements.confirmPassword.value;

        if (confirmPassword.length > 0) {
            if (password === confirmPassword) {
                this.clearFieldError('confirmPassword');
                const formGroup = this.elements.confirmPassword.closest('.form-group');
                if (formGroup) {
                    formGroup.classList.add('success');
                    setTimeout(() => formGroup.classList.remove('success'), 2000);
                }
            } else {
                this.showFieldError('confirmPassword', 'Passwords do not match');
            }
        }
    },

    /**
     * Show login form
     */
    showLoginForm() {
        this.currentForm = 'login';
        this.clearMessages();
        
        if (this.elements.loginForm && this.elements.signupForm) {
            this.elements.loginForm.classList.add('active');
            this.elements.signupForm.classList.remove('active');
        }

        // Clear any form loading states
        this.setFormLoading(false);
    },

    /**
     * Show signup form
     */
    showSignupForm() {
        this.currentForm = 'signup';
        this.clearMessages();
        
        if (this.elements.loginForm && this.elements.signupForm) {
            this.elements.loginForm.classList.remove('active');
            this.elements.signupForm.classList.add('active');
        }

        // Clear any form loading states
        this.setFormLoading(false);
    },

    /**
     * Set form loading state
     */
    setFormLoading(isLoading) {
        const activeForm = this.currentForm === 'login' ? this.elements.loginForm : this.elements.signupForm;
        if (activeForm) {
            if (isLoading) {
                activeForm.classList.add('loading');
            } else {
                activeForm.classList.remove('loading');
            }
        }
    },

    /**
     * Show message to user
     */
    showMessage(message, type = 'info') {
        if (!this.elements.messageContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message message-${type}`;
        messageElement.textContent = message;

        this.elements.messageContainer.innerHTML = '';
        this.elements.messageContainer.appendChild(messageElement);

        // Auto-hide non-error messages
        if (type !== 'error') {
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
            }, 5000);
        }
    },

    /**
     * Clear all messages
     */
    clearMessages() {
        if (this.elements.messageContainer) {
            this.elements.messageContainer.innerHTML = '';
        }
    },

    /**
     * Logout current user
     */
    logout() {
        Storage.clearCurrentUser();
        this.showMessage('Logged out successfully', 'info');
        setTimeout(() => {
            window.location.replace('login.html');
        }, 1000);
    },

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return Storage.getCurrentUser() !== null;
    },

    /**
     * Get current user
     */
    getCurrentUser() {
        return Storage.getCurrentUser();
    },

    /**
     * Utility function to create delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Handle page-specific authentication checks
     */
    requireAuth() {
        const currentUser = Storage.getCurrentUser();
        console.log('RequireAuth - Checking user:', currentUser);
        
        if (!currentUser) {
            console.log('Auth required but user not logged in, redirecting to login');
            
            // Add a small delay to prevent rapid redirects
            setTimeout(() => {
                window.location.replace('login.html?redirecting=true');
            }, 100);
            return false;
        }
        
        console.log('RequireAuth - User authenticated:', currentUser.username);
        return true;
    },

    /**
     * Redirect if already authenticated
     */
    redirectIfAuthenticated() {
        if (this.isLoggedIn()) {
            window.location.href = 'index.html';
            return true;
        }
        return false;
    }
};

// Make Auth available globally
window.Auth = Auth;
