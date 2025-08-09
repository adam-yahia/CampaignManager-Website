/**
 * Email Editor - Handles email campaign creation with templates and live preview
 * Supports multiple email templates and responsive design
 */

const EmailEditor = {
    // Current email data
    currentEmail: {
        id: null,
        name: '',
        subject: '',
        template: 'newsletter',
        heading: '',
        content: '',
        ctaText: '',
        ctaUrl: '',
        headerImage: '',
        fontFamily: 'Arial, sans-serif',
        primaryColor: '#007bff',
        accentColor: '#28a745',
        status: 'draft'
    },

    // Email templates
    templates: {
        newsletter: {
            name: 'Newsletter',
            description: 'Perfect for regular updates and news',
            structure: 'header-content-cta-footer'
        },
        promotional: {
            name: 'Promotional',
            description: 'Great for sales and special offers',
            structure: 'hero-benefits-cta-footer'
        },
        announcement: {
            name: 'Announcement',
            description: 'Ideal for important announcements',
            structure: 'header-announcement-details-footer'
        }
    },

    // DOM elements
    elements: {},

    // Preview mode
    previewMode: 'desktop',

    /**
     * Initialize the email editor
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadEmail();
        this.updatePreview();
    },

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            // Form inputs
            emailName: document.getElementById('emailName'),
            emailSubject: document.getElementById('emailSubject'),
            emailTemplate: document.querySelectorAll('input[name="emailTemplate"]'),
            emailHeading: document.getElementById('emailHeading'),
            emailContent: document.getElementById('emailContent'),
            ctaText: document.getElementById('ctaText'),
            ctaUrl: document.getElementById('ctaUrl'),
            headerImage: document.getElementById('headerImage'),
            emailFont: document.getElementById('emailFont'),
            primaryColor: document.getElementById('primaryColor'),
            accentColor: document.getElementById('accentColor'),

            // Preview elements
            emailPreview: document.getElementById('emailPreview'),
            mobileViewBtn: document.getElementById('mobileViewBtn'),
            desktopViewBtn: document.getElementById('desktopViewBtn'),

            // Action buttons
            saveEmailBtn: document.getElementById('saveEmailBtn'),
            resetEmailBtn: document.getElementById('resetEmailBtn'),
            duplicateEmailBtn: document.getElementById('duplicateEmailBtn'),
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
        if (this.elements.emailName) {
            this.elements.emailName.addEventListener('input', (e) => {
                this.currentEmail.name = e.target.value;
            });
        }

        if (this.elements.emailSubject) {
            this.elements.emailSubject.addEventListener('input', (e) => {
                this.currentEmail.subject = e.target.value;
            });
        }

        // Template selection
        this.elements.emailTemplate.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentEmail.template = e.target.value;
                this.updatePreview();
            });
        });

        // Content fields
        ['emailHeading', 'emailContent', 'ctaText', 'ctaUrl', 'headerImage'].forEach(fieldId => {
            const element = this.elements[fieldId];
            if (element) {
                element.addEventListener('input', (e) => {
                    const fieldName = fieldId.replace('email', '').toLowerCase();
                    this.currentEmail[fieldName === 'heading' ? 'heading' : 
                                     fieldName === 'content' ? 'content' :
                                     fieldName === 'ctatext' ? 'ctaText' :
                                     fieldName === 'ctaurl' ? 'ctaUrl' :
                                     fieldName === 'headerimage' ? 'headerImage' : fieldName] = e.target.value;
                    this.updatePreview();
                });
            }
        });

        // Styling controls
        if (this.elements.emailFont) {
            this.elements.emailFont.addEventListener('change', (e) => {
                this.currentEmail.fontFamily = e.target.value;
                this.updatePreview();
            });
        }

        ['primaryColor', 'accentColor'].forEach(colorId => {
            const element = this.elements[colorId];
            if (element) {
                element.addEventListener('input', (e) => {
                    this.currentEmail[colorId] = e.target.value;
                    this.updatePreview();
                });
            }
        });

        // Preview mode buttons
        if (this.elements.mobileViewBtn) {
            this.elements.mobileViewBtn.addEventListener('click', () => {
                this.setPreviewMode('mobile');
            });
        }

        if (this.elements.desktopViewBtn) {
            this.elements.desktopViewBtn.addEventListener('click', () => {
                this.setPreviewMode('desktop');
            });
        }

        // Action buttons
        if (this.elements.saveEmailBtn) {
            this.elements.saveEmailBtn.addEventListener('click', () => {
                this.showSaveModal();
            });
        }

        if (this.elements.resetEmailBtn) {
            this.elements.resetEmailBtn.addEventListener('click', () => {
                this.resetEmail();
            });
        }

        if (this.elements.duplicateEmailBtn) {
            this.elements.duplicateEmailBtn.addEventListener('click', () => {
                this.duplicateEmail();
            });
        }

        // Modal events
        if (this.elements.confirmSaveBtn) {
            this.elements.confirmSaveBtn.addEventListener('click', () => {
                this.saveEmail();
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
     * Load email from URL parameters or create new
     */
    loadEmail() {
        const urlParams = new URLSearchParams(window.location.search);
        const emailId = urlParams.get('id');

        if (emailId) {
            // Load existing email
            const email = Storage.getCampaignById(emailId);
            if (email && email.type === 'email') {
                this.currentEmail = { ...this.currentEmail, ...email.data };
                this.currentEmail.id = email.id;
                this.populateForm();
            }
        } else {
            // Set default values for new email
            this.currentEmail.name = `Email Campaign ${new Date().toLocaleDateString()}`;
            this.currentEmail.heading = 'Welcome to our Newsletter!';
            this.currentEmail.content = 'Thank you for subscribing to our newsletter. We\'re excited to share our latest updates and exclusive offers with you.';
            this.currentEmail.ctaText = 'Read More';
            this.populateForm();
        }
    },

    /**
     * Populate form with current email data
     */
    populateForm() {
        if (this.elements.emailName) {
            this.elements.emailName.value = this.currentEmail.name;
        }

        if (this.elements.emailSubject) {
            this.elements.emailSubject.value = this.currentEmail.subject;
        }

        // Set template radio button
        this.elements.emailTemplate.forEach(radio => {
            if (radio.value === this.currentEmail.template) {
                radio.checked = true;
            }
        });

        if (this.elements.emailHeading) {
            this.elements.emailHeading.value = this.currentEmail.heading;
        }

        if (this.elements.emailContent) {
            this.elements.emailContent.value = this.currentEmail.content;
        }

        if (this.elements.ctaText) {
            this.elements.ctaText.value = this.currentEmail.ctaText;
        }

        if (this.elements.ctaUrl) {
            this.elements.ctaUrl.value = this.currentEmail.ctaUrl;
        }

        if (this.elements.headerImage) {
            this.elements.headerImage.value = this.currentEmail.headerImage;
        }

        if (this.elements.emailFont) {
            this.elements.emailFont.value = this.currentEmail.fontFamily;
        }

        if (this.elements.primaryColor) {
            this.elements.primaryColor.value = this.currentEmail.primaryColor;
        }

        if (this.elements.accentColor) {
            this.elements.accentColor.value = this.currentEmail.accentColor;
        }
    },

    /**
     * Update live preview
     */
    updatePreview() {
        if (!this.elements.emailPreview) return;

        const template = this.getTemplate(this.currentEmail.template);
        this.elements.emailPreview.innerHTML = template;

        // Apply responsive class
        this.elements.emailPreview.className = `email-preview ${this.previewMode === 'mobile' ? 'mobile-view' : ''}`;
    },

    /**
     * Generate HTML template based on current email data
     */
    getTemplate(templateType) {
        const data = this.currentEmail;
        const styles = this.getEmailStyles();

        switch (templateType) {
            case 'newsletter':
                return this.generateNewsletterTemplate(data, styles);
            case 'promotional':
                return this.generatePromotionalTemplate(data, styles);
            case 'announcement':
                return this.generateAnnouncementTemplate(data, styles);
            default:
                return this.generateNewsletterTemplate(data, styles);
        }
    },

    /**
     * Get email CSS styles
     */
    getEmailStyles() {
        return `
            <style>
                .email-container {
                    width: 100%;
                    max-width: 650px;
                    margin: 0 auto;
                    font-family: ${this.currentEmail.fontFamily};
                    line-height: 1.6;
                    color: #333;
                    background-color: #ffffff;
                }
                .email-header {
                    background-color: ${this.currentEmail.primaryColor};
                    color: white;
                    padding: 30px 20px;
                    text-align: center;
                }
                .email-header h1 {
                    margin: 0;
                    font-size: 28px;
                    font-weight: bold;
                }
                .email-content {
                    padding: 30px 20px;
                }
                .email-content h2 {
                    color: ${this.currentEmail.primaryColor};
                    margin-bottom: 20px;
                    font-size: 24px;
                }
                .email-content p {
                    margin-bottom: 20px;
                    font-size: 16px;
                    line-height: 1.6;
                }
                .email-cta {
                    text-align: center;
                    padding: 30px 20px;
                }
                .cta-button {
                    display: inline-block;
                    background-color: ${this.currentEmail.accentColor};
                    color: white;
                    padding: 15px 30px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    font-size: 16px;
                }
                .email-footer {
                    background-color: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    border-top: 1px solid #dee2e6;
                    font-size: 14px;
                    color: #6c757d;
                }
                .hero-image {
                    width: 100%;
                    height: 200px;
                    background: linear-gradient(135deg, ${this.currentEmail.primaryColor}20, ${this.currentEmail.accentColor}20);
                    background-size: cover;
                    background-position: center;
                    margin-bottom: 20px;
                }
                .announcement-banner {
                    background-color: ${this.currentEmail.accentColor};
                    color: white;
                    padding: 10px 20px;
                    text-align: center;
                    font-weight: bold;
                    margin-bottom: 0;
                }
                @media only screen and (max-width: 480px) {
                    .email-container {
                        width: 100% !important;
                    }
                    .email-header h1 {
                        font-size: 24px !important;
                    }
                    .email-content h2 {
                        font-size: 20px !important;
                    }
                    .email-content,
                    .email-header,
                    .email-cta {
                        padding: 20px 15px !important;
                    }
                }
            </style>
        `;
    },

    /**
     * Generate newsletter template
     */
    generateNewsletterTemplate(data, styles) {
        return `
            ${styles}
            <div class="email-container">
                <div class="email-header">
                    <h1>${this.escapeHtml(data.heading || 'Newsletter')}</h1>
                </div>
                
                ${data.headerImage ? `
                    <div class="hero-image" style="background-image: url('${this.escapeHtml(data.headerImage)}');"></div>
                ` : ''}
                
                <div class="email-content">
                    <h2>Latest Updates</h2>
                    <p>${this.escapeHtml(data.content || 'Your content goes here...')}</p>
                </div>
                
                ${data.ctaText ? `
                    <div class="email-cta">
                        <a href="${this.escapeHtml(data.ctaUrl || '#')}" class="cta-button">
                            ${this.escapeHtml(data.ctaText)}
                        </a>
                    </div>
                ` : ''}
                
                <div class="email-footer">
                    <p>© 2024 Your Company. All rights reserved.</p>
                    <p>You received this email because you subscribed to our newsletter.</p>
                </div>
            </div>
        `;
    },

    /**
     * Generate promotional template
     */
    generatePromotionalTemplate(data, styles) {
        return `
            ${styles}
            <div class="email-container">
                <div class="announcement-banner">
                    ${this.escapeHtml(data.heading || 'Special Offer')}
                </div>
                
                <div class="email-header">
                    <h1>Limited Time Offer!</h1>
                </div>
                
                ${data.headerImage ? `
                    <div class="hero-image" style="background-image: url('${this.escapeHtml(data.headerImage)}');"></div>
                ` : ''}
                
                <div class="email-content">
                    <h2>Don't Miss Out!</h2>
                    <p>${this.escapeHtml(data.content || 'Take advantage of this amazing offer before it expires!')}</p>
                </div>
                
                ${data.ctaText ? `
                    <div class="email-cta">
                        <a href="${this.escapeHtml(data.ctaUrl || '#')}" class="cta-button">
                            ${this.escapeHtml(data.ctaText)}
                        </a>
                    </div>
                ` : ''}
                
                <div class="email-footer">
                    <p>© 2024 Your Company. All rights reserved.</p>
                    <p><small>This offer is valid for a limited time. Terms and conditions apply.</small></p>
                </div>
            </div>
        `;
    },

    /**
     * Generate announcement template
     */
    generateAnnouncementTemplate(data, styles) {
        return `
            ${styles}
            <div class="email-container">
                <div class="email-header">
                    <h1>📢 Important Announcement</h1>
                </div>
                
                <div class="email-content">
                    <h2>${this.escapeHtml(data.heading || 'We have news to share!')}</h2>
                    
                    ${data.headerImage ? `
                        <div class="hero-image" style="background-image: url('${this.escapeHtml(data.headerImage)}');"></div>
                    ` : ''}
                    
                    <p>${this.escapeHtml(data.content || 'We wanted to let you know about an important update...')}</p>
                </div>
                
                ${data.ctaText ? `
                    <div class="email-cta">
                        <a href="${this.escapeHtml(data.ctaUrl || '#')}" class="cta-button">
                            ${this.escapeHtml(data.ctaText)}
                        </a>
                    </div>
                ` : ''}
                
                <div class="email-footer">
                    <p>© 2024 Your Company. All rights reserved.</p>
                    <p>Stay tuned for more updates!</p>
                </div>
            </div>
        `;
    },

    /**
     * Set preview mode (mobile/desktop)
     */
    setPreviewMode(mode) {
        this.previewMode = mode;
        
        // Update button states
        if (this.elements.mobileViewBtn && this.elements.desktopViewBtn) {
            this.elements.mobileViewBtn.classList.toggle('active', mode === 'mobile');
            this.elements.desktopViewBtn.classList.toggle('active', mode === 'desktop');
        }

        this.updatePreview();
    },

    /**
     * Show save modal
     */
    showSaveModal() {
        if (!this.validateEmail()) return;
        
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
     * Validate email before saving
     */
    validateEmail() {
        if (!this.currentEmail.name.trim()) {
            this.showNotification('Please enter an email campaign name', 'error');
            this.elements.emailName?.focus();
            return false;
        }

        if (!this.currentEmail.heading.trim()) {
            this.showNotification('Please enter a heading', 'error');
            this.elements.emailHeading?.focus();
            return false;
        }

        if (!this.currentEmail.content.trim()) {
            this.showNotification('Please enter email content', 'error');
            this.elements.emailContent?.focus();
            return false;
        }

        return true;
    },

    /**
     * Save email
     */
    saveEmail() {
        const status = this.elements.saveStatus?.value || 'draft';
        const currentUser = Auth.getCurrentUser();

        if (!currentUser) {
            this.showNotification('Please log in to save emails', 'error');
            return;
        }

        const emailData = {
            userId: currentUser.id,
            name: this.currentEmail.name,
            type: 'email',
            status: status,
            data: { ...this.currentEmail }
        };

        let savedEmail;
        if (this.currentEmail.id) {
            // Update existing email
            savedEmail = Storage.updateCampaign(this.currentEmail.id, emailData);
        } else {
            // Create new email
            savedEmail = Storage.addCampaign(emailData);
            if (savedEmail) {
                this.currentEmail.id = savedEmail.id;
                // Update URL to include ID
                const newUrl = new URL(window.location);
                newUrl.searchParams.set('id', savedEmail.id);
                window.history.replaceState({}, '', newUrl);
            }
        }

        if (savedEmail) {
            this.showNotification('Email campaign saved successfully!', 'success');
            this.hideSaveModal();
        } else {
            this.showNotification('Failed to save email campaign', 'error');
        }
    },

    /**
     * Reset email to defaults
     */
    resetEmail() {
        const confirmed = confirm('Are you sure you want to reset the email? All changes will be lost.');
        if (confirmed) {
            this.currentEmail = {
                id: this.currentEmail.id,
                name: this.currentEmail.name,
                subject: '',
                template: 'newsletter',
                heading: 'Welcome to our Newsletter!',
                content: 'Thank you for subscribing to our newsletter.',
                ctaText: 'Read More',
                ctaUrl: '',
                headerImage: '',
                fontFamily: 'Arial, sans-serif',
                primaryColor: '#007bff',
                accentColor: '#28a745',
                status: 'draft'
            };

            this.populateForm();
            this.updatePreview();
            this.showNotification('Email reset to defaults', 'info');
        }
    },

    /**
     * Duplicate current email
     */
    duplicateEmail() {
        if (!this.currentEmail.id) {
            this.showNotification('Please save the email first before duplicating', 'warning');
            return;
        }

        const duplicated = Storage.duplicateCampaign(this.currentEmail.id);
        if (duplicated) {
            this.showNotification('Email campaign duplicated successfully!', 'success');
            // Redirect to edit the duplicated email
            setTimeout(() => {
                window.location.href = `email-editor.html?id=${duplicated.id}`;
            }, 1000);
        } else {
            this.showNotification('Failed to duplicate email campaign', 'error');
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
            this.resetEmail();
        }

        // Escape to close modal
        if (event.key === 'Escape') {
            this.hideSaveModal();
        }

        // M for mobile preview
        if (event.key === 'm' && !event.ctrlKey && !event.metaKey) {
            this.setPreviewMode('mobile');
        }

        // D for desktop preview
        if (event.key === 'd' && !event.ctrlKey && !event.metaKey) {
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
     * Get current email data for external use
     */
    getEmailData() {
        return { ...this.currentEmail };
    },

    /**
     * Set email data from external source
     */
    setEmailData(data) {
        this.currentEmail = { ...this.currentEmail, ...data };
        this.populateForm();
        this.updatePreview();
    }
};

// Make EmailEditor available globally
window.EmailEditor = EmailEditor;
