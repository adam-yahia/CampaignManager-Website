/**
 * Landing Page Editor - Handles landing page creation with templates and lead forms
 * Supports multiple templates and responsive design
 */

const LandingEditor = {
    // Current landing page data
    currentLanding: {
        id: null,
        name: '',
        pageTitle: '',
        template: 'hero',
        mainHeading: '',
        subHeading: '',
        content: '',
        heroImage: '',
        ctaHeading: '',
        ctaText: '',
        ctaUrl: '',
        enableForm: false,
        formHeading: '',
        formDescription: '',
        submitText: 'Submit',
        fontFamily: "'Inter', sans-serif",
        primaryColor: '#2563eb',
        accentColor: '#10b981',
        backgroundColor: '#ffffff',
        status: 'draft'
    },

    // Landing page templates
    templates: {
        hero: {
            name: 'Hero Section',
            description: 'Bold hero section with compelling headline',
            structure: 'hero-content-cta-form'
        },
        features: {
            name: 'Features Focus',
            description: 'Highlight key features and benefits',
            structure: 'header-features-benefits-cta'
        },
        minimal: {
            name: 'Minimal Clean',
            description: 'Clean and simple design',
            structure: 'header-content-form-footer'
        }
    },

    // DOM elements
    elements: {},

    // Preview mode
    previewMode: 'desktop',

    /**
     * Initialize the landing page editor
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadLanding();
        this.updatePreview();
    },

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            // Form inputs
            landingName: document.getElementById('landingName'),
            pageTitle: document.getElementById('pageTitle'),
            landingTemplate: document.querySelectorAll('input[name="landingTemplate"]'),
            mainHeading: document.getElementById('mainHeading'),
            subHeading: document.getElementById('subHeading'),
            pageContent: document.getElementById('pageContent'),
            heroImage: document.getElementById('heroImage'),
            ctaHeading: document.getElementById('ctaHeading'),
            ctaText: document.getElementById('ctaText'),
            ctaUrl: document.getElementById('ctaUrl'),

            // Form settings
            enableForm: document.getElementById('enableForm'),
            formSettings: document.getElementById('formSettings'),
            formHeading: document.getElementById('formHeading'),
            formDescription: document.getElementById('formDescription'),
            submitText: document.getElementById('submitText'),

            // Styling controls
            landingFont: document.getElementById('landingFont'),
            primaryColor: document.getElementById('primaryColor'),
            accentColor: document.getElementById('accentColor'),
            backgroundColor: document.getElementById('backgroundColor'),

            // Preview elements
            landingPreview: document.getElementById('landingPreview'),
            mobileViewBtn: document.getElementById('mobileViewBtn'),
            tabletViewBtn: document.getElementById('tabletViewBtn'),
            desktopViewBtn: document.getElementById('desktopViewBtn'),

            // Action buttons
            saveLandingBtn: document.getElementById('saveLandingBtn'),
            resetLandingBtn: document.getElementById('resetLandingBtn'),
            duplicateLandingBtn: document.getElementById('duplicateLandingBtn'),
            previewBtn: document.getElementById('previewBtn'),

            // Modal elements
            saveModal: document.getElementById('saveModal'),
            saveStatus: document.getElementById('saveStatus'),
            confirmSaveBtn: document.getElementById('confirmSaveBtn'),
            cancelSaveBtn: document.getElementById('cancelSaveBtn'),
            modalClose: document.querySelector('.modal-close')
        };
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Form input changes
        if (this.elements.landingName) {
            this.elements.landingName.addEventListener('input', (e) => {
                this.currentLanding.name = e.target.value;
            });
        }

        if (this.elements.pageTitle) {
            this.elements.pageTitle.addEventListener('input', (e) => {
                this.currentLanding.pageTitle = e.target.value;
            });
        }

        // Template selection
        this.elements.landingTemplate.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentLanding.template = e.target.value;
                this.updatePreview();
            });
        });

        // Content fields
        ['mainHeading', 'subHeading', 'pageContent', 'heroImage', 'ctaHeading', 'ctaText', 'ctaUrl'].forEach(fieldId => {
            const element = this.elements[fieldId];
            if (element) {
                element.addEventListener('input', (e) => {
                    this.currentLanding[fieldId] = e.target.value;
                    this.updatePreview();
                });
            }
        });

        // Form settings
        if (this.elements.enableForm) {
            this.elements.enableForm.addEventListener('change', (e) => {
                this.currentLanding.enableForm = e.target.checked;
                this.toggleFormSettings();
                this.updatePreview();
            });
        }

        ['formHeading', 'formDescription', 'submitText'].forEach(fieldId => {
            const element = this.elements[fieldId];
            if (element) {
                element.addEventListener('input', (e) => {
                    this.currentLanding[fieldId] = e.target.value;
                    this.updatePreview();
                });
            }
        });

        // Styling controls
        ['landingFont', 'primaryColor', 'accentColor', 'backgroundColor'].forEach(styleId => {
            const element = this.elements[styleId];
            if (element) {
                element.addEventListener('input', (e) => {
                    const fieldName = styleId === 'landingFont' ? 'fontFamily' : styleId;
                    this.currentLanding[fieldName] = e.target.value;
                    this.updatePreview();
                });
            }
        });

        // Preview mode buttons
        ['mobileViewBtn', 'tabletViewBtn', 'desktopViewBtn'].forEach(btnId => {
            const element = this.elements[btnId];
            if (element) {
                element.addEventListener('click', () => {
                    const mode = btnId.replace('ViewBtn', '').toLowerCase();
                    this.setPreviewMode(mode);
                });
            }
        });

        // Action buttons
        if (this.elements.saveLandingBtn) {
            this.elements.saveLandingBtn.addEventListener('click', () => {
                this.showSaveModal();
            });
        }

        if (this.elements.resetLandingBtn) {
            this.elements.resetLandingBtn.addEventListener('click', () => {
                this.resetLanding();
            });
        }

        if (this.elements.duplicateLandingBtn) {
            this.elements.duplicateLandingBtn.addEventListener('click', () => {
                this.duplicateLanding();
            });
        }

        // Modal events
        if (this.elements.confirmSaveBtn) {
            this.elements.confirmSaveBtn.addEventListener('click', () => {
                this.saveLanding();
            });
        }

        if (this.elements.cancelSaveBtn) {
            this.elements.cancelSaveBtn.addEventListener('click', () => {
                this.hideSaveModal();
            });
        }

        if (this.elements.modalClose) {
            this.elements.modalClose.addEventListener('click', () => {
                this.hideSaveModal();
            });
        }

        // Click outside modal to close
        if (this.elements.saveModal) {
            this.elements.saveModal.addEventListener('click', (e) => {
                if (e.target === this.elements.saveModal) {
                    this.hideSaveModal();
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    },

    /**
     * Load landing page from URL parameters or create new
     */
    loadLanding() {
        const urlParams = new URLSearchParams(window.location.search);
        const landingId = urlParams.get('id');

        if (landingId) {
            // Load existing landing page
            const landing = Storage.getCampaignById(landingId);
            if (landing && landing.type === 'landing') {
                this.currentLanding = { ...this.currentLanding, ...landing.data };
                this.currentLanding.id = landing.id;
                this.populateForm();
            }
        } else {
            // Set default values for new landing page
            this.currentLanding.name = `Landing Page ${new Date().toLocaleDateString()}`;
            this.currentLanding.pageTitle = 'Welcome to Our Landing Page';
            this.currentLanding.mainHeading = 'Transform Your Business Today';
            this.currentLanding.subHeading = 'The solution you\'ve been waiting for';
            this.currentLanding.content = 'Discover how our innovative solution can help you achieve your goals faster and more efficiently than ever before.';
            this.currentLanding.ctaHeading = 'Ready to get started?';
            this.currentLanding.ctaText = 'Get Started Now';
            this.currentLanding.formHeading = 'Get Your Free Quote';
            this.currentLanding.formDescription = 'Fill out the form below and we\'ll contact you';
            this.populateForm();
        }
    },

    /**
     * Populate form with current landing page data
     */
    populateForm() {
        if (this.elements.landingName) {
            this.elements.landingName.value = this.currentLanding.name;
        }

        if (this.elements.pageTitle) {
            this.elements.pageTitle.value = this.currentLanding.pageTitle;
        }

        // Set template radio button
        this.elements.landingTemplate.forEach(radio => {
            if (radio.value === this.currentLanding.template) {
                radio.checked = true;
            }
        });

        // Content fields
        ['mainHeading', 'subHeading', 'pageContent', 'heroImage', 'ctaHeading', 'ctaText', 'ctaUrl'].forEach(fieldId => {
            const element = this.elements[fieldId];
            if (element) {
                element.value = this.currentLanding[fieldId] || '';
            }
        });

        // Form settings
        if (this.elements.enableForm) {
            this.elements.enableForm.checked = this.currentLanding.enableForm;
        }

        ['formHeading', 'formDescription', 'submitText'].forEach(fieldId => {
            const element = this.elements[fieldId];
            if (element) {
                element.value = this.currentLanding[fieldId] || '';
            }
        });

        // Styling controls
        if (this.elements.landingFont) {
            this.elements.landingFont.value = this.currentLanding.fontFamily;
        }

        ['primaryColor', 'accentColor', 'backgroundColor'].forEach(colorId => {
            const element = this.elements[colorId];
            if (element) {
                element.value = this.currentLanding[colorId];
            }
        });

        // Toggle form settings visibility
        this.toggleFormSettings();
    },

    /**
     * Toggle form settings visibility
     */
    toggleFormSettings() {
        if (this.elements.formSettings) {
            if (this.currentLanding.enableForm) {
                this.elements.formSettings.style.display = 'block';
                this.elements.formSettings.classList.add('show');
            } else {
                this.elements.formSettings.style.display = 'none';
                this.elements.formSettings.classList.remove('show');
            }
        }
    },

    /**
     * Update live preview
     */
    updatePreview() {
        if (!this.elements.landingPreview) return;

        const template = this.getTemplate(this.currentLanding.template);
        this.elements.landingPreview.innerHTML = template;

        // Apply responsive class
        this.elements.landingPreview.className = `landing-preview ${this.previewMode}-view`;
    },

    /**
     * Generate HTML template based on current landing page data
     */
    getTemplate(templateType) {
        const data = this.currentLanding;
        const styles = this.getLandingStyles();

        switch (templateType) {
            case 'hero':
                return this.generateHeroTemplate(data, styles);
            case 'features':
                return this.generateFeaturesTemplate(data, styles);
            case 'minimal':
                return this.generateMinimalTemplate(data, styles);
            default:
                return this.generateHeroTemplate(data, styles);
        }
    },

    /**
     * Get landing page CSS styles
     */
    getLandingStyles() {
        return `
            <style>
                .landing-container {
                    font-family: ${this.currentLanding.fontFamily};
                    line-height: 1.6;
                    margin: 0;
                    padding: 0;
                    background-color: ${this.currentLanding.backgroundColor};
                    color: #333;
                }
                .hero-section {
                    background: linear-gradient(135deg, ${this.currentLanding.primaryColor}, ${this.currentLanding.accentColor});
                    color: white;
                    padding: 80px 20px;
                    text-align: center;
                    min-height: 500px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                }
                .hero-content {
                    max-width: 800px;
                    margin: 0 auto;
                }
                .hero-section h1 {
                    font-size: 3.5rem;
                    font-weight: bold;
                    margin-bottom: 20px;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                }
                .hero-section h2 {
                    font-size: 1.5rem;
                    margin-bottom: 30px;
                    opacity: 0.9;
                    font-weight: 300;
                }
                .content-section {
                    padding: 60px 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .content-section h2 {
                    color: ${this.currentLanding.primaryColor};
                    font-size: 2.5rem;
                    margin-bottom: 30px;
                    text-align: center;
                }
                .content-section p {
                    font-size: 1.2rem;
                    text-align: center;
                    max-width: 800px;
                    margin: 0 auto 40px;
                    line-height: 1.8;
                }
                .hero-image {
                    width: 100%;
                    max-width: 600px;
                    height: 300px;
                    background: rgba(255,255,255,0.1);
                    background-size: cover;
                    background-position: center;
                    border-radius: 10px;
                    margin: 40px auto 0;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                .cta-section {
                    background-color: #f8f9fa;
                    padding: 60px 20px;
                    text-align: center;
                    border-top: 1px solid #dee2e6;
                }
                .cta-section h3 {
                    color: ${this.currentLanding.primaryColor};
                    font-size: 2rem;
                    margin-bottom: 30px;
                }
                .cta-button {
                    display: inline-block;
                    background: linear-gradient(45deg, ${this.currentLanding.primaryColor}, ${this.currentLanding.accentColor});
                    color: white;
                    padding: 18px 40px;
                    text-decoration: none;
                    border-radius: 50px;
                    font-weight: bold;
                    font-size: 1.2rem;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    transition: transform 0.3s ease;
                }
                .cta-button:hover {
                    transform: translateY(-2px);
                }
                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 40px;
                    margin: 60px 0;
                }
                .feature-item {
                    text-align: center;
                    padding: 30px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }
                .feature-icon {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(45deg, ${this.currentLanding.primaryColor}, ${this.currentLanding.accentColor});
                    border-radius: 50%;
                    margin: 0 auto 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    color: white;
                }
                .lead-form {
                    background: white;
                    padding: 40px;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    max-width: 500px;
                    margin: 60px auto 0;
                }
                .lead-form h3 {
                    color: ${this.currentLanding.primaryColor};
                    text-align: center;
                    margin-bottom: 10px;
                    font-size: 1.8rem;
                }
                .lead-form p {
                    text-align: center;
                    margin-bottom: 30px;
                    color: #666;
                }
                .form-group {
                    margin-bottom: 20px;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: 600;
                    color: #333;
                }
                .form-group input,
                .form-group textarea {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e9ecef;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: border-color 0.3s;
                }
                .form-group input:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: ${this.currentLanding.primaryColor};
                }
                .submit-button {
                    width: 100%;
                    background: linear-gradient(45deg, ${this.currentLanding.primaryColor}, ${this.currentLanding.accentColor});
                    color: white;
                    padding: 15px;
                    border: none;
                    border-radius: 8px;
                    font-size: 1.1rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: transform 0.3s;
                }
                .submit-button:hover {
                    transform: translateY(-1px);
                }
                @media (max-width: 768px) {
                    .hero-section h1 {
                        font-size: 2.5rem;
                    }
                    .hero-section h2 {
                        font-size: 1.2rem;
                    }
                    .content-section h2 {
                        font-size: 2rem;
                    }
                    .hero-section,
                    .content-section,
                    .cta-section {
                        padding: 40px 15px;
                    }
                    .features-grid {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
                    .lead-form {
                        margin: 40px 20px 0;
                        padding: 30px 20px;
                    }
                }
            </style>
        `;
    },

    /**
     * Generate hero template
     */
    generateHeroTemplate(data, styles) {
        return `
            ${styles}
            <div class="landing-container">
                <section class="hero-section">
                    <div class="hero-content">
                        <h1>${this.escapeHtml(data.mainHeading || 'Transform Your Business Today')}</h1>
                        <h2>${this.escapeHtml(data.subHeading || 'The solution you\'ve been waiting for')}</h2>
                        
                        ${data.heroImage ? `
                            <div class="hero-image" style="background-image: url('${this.escapeHtml(data.heroImage)}');"></div>
                        ` : ''}
                    </div>
                </section>

                <section class="content-section">
                    <h2>Why Choose Us?</h2>
                    <p>${this.escapeHtml(data.content || 'Discover how our innovative solution can help you achieve your goals.')}</p>
                </section>

                ${data.ctaText ? `
                    <section class="cta-section">
                        <h3>${this.escapeHtml(data.ctaHeading || 'Ready to get started?')}</h3>
                        <a href="${this.escapeHtml(data.ctaUrl || '#')}" class="cta-button">
                            ${this.escapeHtml(data.ctaText)}
                        </a>
                    </section>
                ` : ''}

                ${data.enableForm ? this.generateLeadForm(data) : ''}
            </div>
        `;
    },

    /**
     * Generate features template
     */
    generateFeaturesTemplate(data, styles) {
        return `
            ${styles}
            <div class="landing-container">
                <section class="hero-section" style="min-height: 400px;">
                    <div class="hero-content">
                        <h1>${this.escapeHtml(data.mainHeading || 'Amazing Features')}</h1>
                        <h2>${this.escapeHtml(data.subHeading || 'Everything you need in one place')}</h2>
                    </div>
                </section>

                <section class="content-section">
                    <div class="features-grid">
                        <div class="feature-item">
                            <div class="feature-icon">⚡</div>
                            <h3>Fast & Reliable</h3>
                            <p>Lightning-fast performance that you can count on every time.</p>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">🔒</div>
                            <h3>Secure & Safe</h3>
                            <p>Your data is protected with enterprise-grade security measures.</p>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">📱</div>
                            <h3>Mobile Ready</h3>
                            <p>Works seamlessly across all devices and platforms.</p>
                        </div>
                    </div>
                    
                    <p style="text-align: center; font-size: 1.2rem;">
                        ${this.escapeHtml(data.content || 'Experience the difference with our comprehensive solution.')}
                    </p>
                </section>

                ${data.ctaText ? `
                    <section class="cta-section">
                        <h3>${this.escapeHtml(data.ctaHeading || 'Ready to get started?')}</h3>
                        <a href="${this.escapeHtml(data.ctaUrl || '#')}" class="cta-button">
                            ${this.escapeHtml(data.ctaText)}
                        </a>
                    </section>
                ` : ''}

                ${data.enableForm ? this.generateLeadForm(data) : ''}
            </div>
        `;
    },

    /**
     * Generate minimal template
     */
    generateMinimalTemplate(data, styles) {
        return `
            ${styles}
            <div class="landing-container">
                <section class="content-section" style="padding-top: 100px; text-align: center;">
                    <h1 style="font-size: 3rem; color: ${this.currentLanding.primaryColor}; margin-bottom: 20px;">
                        ${this.escapeHtml(data.mainHeading || 'Simple. Effective. Results.')}
                    </h1>
                    <h2 style="font-size: 1.5rem; color: #666; margin-bottom: 40px; font-weight: 300;">
                        ${this.escapeHtml(data.subHeading || 'The minimalist approach to success')}
                    </h2>
                    
                    ${data.heroImage ? `
                        <div class="hero-image" style="max-width: 400px; height: 250px; margin: 40px auto;"></div>
                    ` : ''}
                    
                    <p style="font-size: 1.2rem; max-width: 600px; margin: 0 auto 60px;">
                        ${this.escapeHtml(data.content || 'Clean, simple, and effective. Get exactly what you need without the complexity.')}
                    </p>

                    ${data.ctaText ? `
                        <a href="${this.escapeHtml(data.ctaUrl || '#')}" class="cta-button" style="margin-bottom: 40px; display: inline-block;">
                            ${this.escapeHtml(data.ctaText)}
                        </a>
                    ` : ''}
                </section>

                ${data.enableForm ? this.generateLeadForm(data) : ''}
            </div>
        `;
    },

    /**
     * Generate lead collection form
     */
    generateLeadForm(data) {
        return `
            <section class="content-section">
                <div class="lead-form">
                    <h3>${this.escapeHtml(data.formHeading || 'Get Your Free Quote')}</h3>
                    <p>${this.escapeHtml(data.formDescription || 'Fill out the form below and we\'ll contact you')}</p>
                    
                    <form>
                        <div class="form-group">
                            <label for="leadName">Full Name</label>
                            <input type="text" id="leadName" name="name" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="leadEmail">Email Address</label>
                            <input type="email" id="leadEmail" name="email" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="leadMessage">Message (Optional)</label>
                            <textarea id="leadMessage" name="message" rows="4"></textarea>
                        </div>
                        
                        <button type="submit" class="submit-button">
                            ${this.escapeHtml(data.submitText || 'Submit')}
                        </button>
                    </form>
                </div>
            </section>
        `;
    },

    /**
     * Set preview mode (mobile/tablet/desktop)
     */
    setPreviewMode(mode) {
        this.previewMode = mode;
        
        // Update button states
        ['mobileViewBtn', 'tabletViewBtn', 'desktopViewBtn'].forEach(btnId => {
            const element = this.elements[btnId];
            if (element) {
                const btnMode = btnId.replace('ViewBtn', '').toLowerCase();
                element.classList.toggle('active', btnMode === mode);
            }
        });

        this.updatePreview();
    },

    /**
     * Show save modal
     */
    showSaveModal() {
        if (!this.validateLanding()) return;
        
        if (this.elements.saveModal) {
            this.elements.saveModal.classList.add('show');
            this.elements.saveModal.style.display = 'flex';
        }
    },

    /**
     * Hide save modal
     */
    hideSaveModal() {
        if (this.elements.saveModal) {
            this.elements.saveModal.classList.remove('show');
            setTimeout(() => {
                this.elements.saveModal.style.display = 'none';
            }, 200);
        }
    },

    /**
     * Validate landing page before saving
     */
    validateLanding() {
        if (!this.currentLanding.name.trim()) {
            this.showNotification('Please enter a landing page name', 'error');
            this.elements.landingName?.focus();
            return false;
        }

        if (!this.currentLanding.mainHeading.trim()) {
            this.showNotification('Please enter a main heading', 'error');
            this.elements.mainHeading?.focus();
            return false;
        }

        if (!this.currentLanding.content.trim()) {
            this.showNotification('Please enter page content', 'error');
            this.elements.pageContent?.focus();
            return false;
        }

        return true;
    },

    /**
     * Save landing page
     */
    saveLanding() {
        const status = this.elements.saveStatus?.value || 'draft';
        const currentUser = Auth.getCurrentUser();

        if (!currentUser) {
            this.showNotification('Please log in to save landing pages', 'error');
            return;
        }

        const landingData = {
            userId: currentUser.id,
            name: this.currentLanding.name,
            type: 'landing',
            status: status,
            data: { ...this.currentLanding }
        };

        let savedLanding;
        if (this.currentLanding.id) {
            // Update existing landing page
            savedLanding = Storage.updateCampaign(this.currentLanding.id, landingData);
        } else {
            // Create new landing page
            savedLanding = Storage.addCampaign(landingData);
            if (savedLanding) {
                this.currentLanding.id = savedLanding.id;
                // Update URL to include ID
                const newUrl = new URL(window.location);
                newUrl.searchParams.set('id', savedLanding.id);
                window.history.replaceState({}, '', newUrl);
            }
        }

        if (savedLanding) {
            this.showNotification('Landing page saved successfully!', 'success');
            this.hideSaveModal();
        } else {
            this.showNotification('Failed to save landing page', 'error');
        }
    },

    /**
     * Reset landing page to defaults
     */
    resetLanding() {
        const confirmed = confirm('Are you sure you want to reset the landing page? All changes will be lost.');
        if (confirmed) {
            this.currentLanding = {
                id: this.currentLanding.id,
                name: this.currentLanding.name,
                pageTitle: 'Welcome to Our Landing Page',
                template: 'hero',
                mainHeading: 'Transform Your Business Today',
                subHeading: 'The solution you\'ve been waiting for',
                content: 'Discover how our innovative solution can help you achieve your goals.',
                heroImage: '',
                ctaHeading: 'Ready to get started?',
                ctaText: 'Get Started Now',
                ctaUrl: '',
                enableForm: false,
                formHeading: 'Get Your Free Quote',
                formDescription: 'Fill out the form below and we\'ll contact you',
                submitText: 'Submit',
                fontFamily: "'Inter', sans-serif",
                primaryColor: '#2563eb',
                accentColor: '#10b981',
                backgroundColor: '#ffffff',
                status: 'draft'
            };

            this.populateForm();
            this.updatePreview();
            this.showNotification('Landing page reset to defaults', 'info');
        }
    },

    /**
     * Duplicate current landing page
     */
    duplicateLanding() {
        if (!this.currentLanding.id) {
            this.showNotification('Please save the landing page first before duplicating', 'warning');
            return;
        }

        const duplicated = Storage.duplicateCampaign(this.currentLanding.id);
        if (duplicated) {
            this.showNotification('Landing page duplicated successfully!', 'success');
            // Redirect to edit the duplicated landing page
            setTimeout(() => {
                window.location.href = `landing-editor.html?id=${duplicated.id}`;
            }, 1000);
        } else {
            this.showNotification('Failed to duplicate landing page', 'error');
        }
    },

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + S to save
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            this.showSaveModal();
        }

        // Ctrl/Cmd + R to reset
        if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
            event.preventDefault();
            this.resetLanding();
        }

        // Escape to close modal
        if (event.key === 'Escape') {
            this.hideSaveModal();
        }

        // Number keys for preview modes
        if (event.key === '1') {
            this.setPreviewMode('mobile');
        } else if (event.key === '2') {
            this.setPreviewMode('tablet');
        } else if (event.key === '3') {
            this.setPreviewMode('desktop');
        }
    },

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Use Dashboard notification system if available
        if (window.Dashboard && Dashboard.showNotification) {
            Dashboard.showNotification(message, type);
            return;
        }

        // Fallback notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'error' ? '#fee' : type === 'success' ? '#efe' : '#fef',
            color: type === 'error' ? '#c00' : type === 'success' ? '#090' : '#333',
            padding: '12px 20px',
            borderRadius: '6px',
            border: `1px solid ${type === 'error' ? '#fcc' : type === 'success' ? '#cfc' : '#ddd'}`,
            zIndex: '1000',
            fontSize: '14px'
        });

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    },

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Get current landing page data for external use
     */
    getLandingData() {
        return { ...this.currentLanding };
    },

    /**
     * Set landing page data from external source
     */
    setLandingData(data) {
        this.currentLanding = { ...this.currentLanding, ...data };
        this.populateForm();
        this.updatePreview();
    }
};

// Make LandingEditor available globally
window.LandingEditor = LandingEditor;
