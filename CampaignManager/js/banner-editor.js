/**
 * Banner Editor - Handles banner creation and editing with live preview
 * Supports multiple banner sizes and real-time updates
 */

const BannerEditor = {
    // Current banner data
    currentBanner: {
        id: null,
        name: '',
        size: '250x250',
        text: '',
        fontFamily: 'Arial, sans-serif',
        fontSize: 24,
        textColor: '#000000',
        backgroundColor: '#ffffff',
        status: 'draft'
    },

    // DOM elements
    elements: {},

    // Default settings
    defaults: {
        sizes: {
            '250x250': { width: 250, height: 250, name: 'Square' },
            '300x600': { width: 300, height: 600, name: 'Vertical' }
        },
        fonts: {
            'Arial, sans-serif': 'Arial (Clean & Modern)',
            'Georgia, serif': 'Georgia (Classic & Elegant)',
            "'Courier New', monospace": 'Courier New (Bold & Tech)'
        }
    },

    /**
     * Initialize the banner editor
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadBanner();
        this.updatePreview();
    },

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            // Form inputs
            bannerName: document.getElementById('bannerName'),
            bannerSize: document.querySelectorAll('input[name="bannerSize"]'),
            bannerText: document.getElementById('bannerText'),
            fontFamily: document.getElementById('fontFamily'),
            fontSize: document.getElementById('fontSize'),
            fontSizeValue: document.getElementById('fontSizeValue'),
            textColor: document.getElementById('textColor'),
            backgroundColor: document.getElementById('backgroundColor'),

            // Preview elements
            bannerPreview: document.getElementById('bannerPreview'),
            bannerCanvas: document.getElementById('bannerCanvas'),
            previewText: document.getElementById('previewText'),
            currentSize: document.getElementById('currentSize'),

            // Action buttons
            saveBannerBtn: document.getElementById('saveBannerBtn'),
            resetBannerBtn: document.getElementById('resetBannerBtn'),
            duplicateBannerBtn: document.getElementById('duplicateBannerBtn'),
            downloadBtn: document.getElementById('downloadBtn'),
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
        if (this.elements.bannerName) {
            this.elements.bannerName.addEventListener('input', (e) => {
                this.currentBanner.name = e.target.value;
            });
        }

        // Size selection
        this.elements.bannerSize.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentBanner.size = e.target.value;
                this.updatePreview();
            });
        });

        // Text content
        if (this.elements.bannerText) {
            this.elements.bannerText.addEventListener('input', (e) => {
                this.currentBanner.text = e.target.value;
                this.updatePreview();
            });
        }

        // Font family
        if (this.elements.fontFamily) {
            this.elements.fontFamily.addEventListener('change', (e) => {
                this.currentBanner.fontFamily = e.target.value;
                this.updatePreview();
            });
        }

        // Font size
        if (this.elements.fontSize) {
            this.elements.fontSize.addEventListener('input', (e) => {
                this.currentBanner.fontSize = parseInt(e.target.value);
                this.updateFontSizeDisplay();
                this.updatePreview();
            });
        }

        // Colors
        if (this.elements.textColor) {
            this.elements.textColor.addEventListener('input', (e) => {
                this.currentBanner.textColor = e.target.value;
                this.updatePreview();
            });
        }

        if (this.elements.backgroundColor) {
            this.elements.backgroundColor.addEventListener('input', (e) => {
                this.currentBanner.backgroundColor = e.target.value;
                this.updatePreview();
            });
        }

        // Action buttons
        if (this.elements.saveBannerBtn) {
            this.elements.saveBannerBtn.addEventListener('click', () => {
                this.showSaveModal();
            });
        }

        if (this.elements.resetBannerBtn) {
            this.elements.resetBannerBtn.addEventListener('click', () => {
                this.resetBanner();
            });
        }

        if (this.elements.duplicateBannerBtn) {
            this.elements.duplicateBannerBtn.addEventListener('click', () => {
                this.duplicateBanner();
            });
        }

        if (this.elements.downloadBtn) {
            this.elements.downloadBtn.addEventListener('click', () => {
                this.downloadBanner();
            });
        }

        if (this.elements.previewBtn) {
            this.elements.previewBtn.addEventListener('click', () => {
                this.togglePreview();
            });
        }

        // Modal events
        if (this.elements.confirmSaveBtn) {
            this.elements.confirmSaveBtn.addEventListener('click', () => {
                this.saveBanner();
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
     * Load banner from URL parameters or create new
     */
    loadBanner() {
        const urlParams = new URLSearchParams(window.location.search);
        const bannerId = urlParams.get('id');

        if (bannerId) {
            // Load existing banner
            const banner = Storage.getCampaignById(bannerId);
            if (banner && banner.type === 'banner') {
                this.currentBanner = { ...this.currentBanner, ...banner.data };
                this.currentBanner.id = banner.id;
                this.populateForm();
            }
        } else {
            // Set default values for new banner
            this.currentBanner.name = `Banner ${new Date().toLocaleDateString()}`;
            this.populateForm();
        }
    },

    /**
     * Populate form with current banner data
     */
    populateForm() {
        if (this.elements.bannerName) {
            this.elements.bannerName.value = this.currentBanner.name;
        }

        // Set size radio button
        this.elements.bannerSize.forEach(radio => {
            if (radio.value === this.currentBanner.size) {
                radio.checked = true;
            }
        });

        if (this.elements.bannerText) {
            this.elements.bannerText.value = this.currentBanner.text;
        }

        if (this.elements.fontFamily) {
            this.elements.fontFamily.value = this.currentBanner.fontFamily;
        }

        if (this.elements.fontSize) {
            this.elements.fontSize.value = this.currentBanner.fontSize;
            this.updateFontSizeDisplay();
        }

        if (this.elements.textColor) {
            this.elements.textColor.value = this.currentBanner.textColor;
        }

        if (this.elements.backgroundColor) {
            this.elements.backgroundColor.value = this.currentBanner.backgroundColor;
        }
    },

    /**
     * Update font size display
     */
    updateFontSizeDisplay() {
        if (this.elements.fontSizeValue) {
            this.elements.fontSizeValue.textContent = `${this.currentBanner.fontSize}px`;
        }
    },

    /**
     * Update live preview
     */
    updatePreview() {
        if (!this.elements.bannerCanvas || !this.elements.previewText) return;

        const canvas = this.elements.bannerCanvas;
        const sizeConfig = this.defaults.sizes[this.currentBanner.size];

        // Update canvas size and styling
        canvas.className = `banner-canvas size-${this.currentBanner.size}`;
        canvas.style.width = `${sizeConfig.width}px`;
        canvas.style.height = `${sizeConfig.height}px`;
        canvas.style.backgroundColor = this.currentBanner.backgroundColor;
        canvas.style.fontFamily = this.currentBanner.fontFamily;
        canvas.style.fontSize = `${this.currentBanner.fontSize}px`;
        canvas.style.color = this.currentBanner.textColor;

        // Update text content
        const displayText = this.currentBanner.text || 'Your banner text will appear here';
        this.elements.previewText.textContent = displayText;

        // Update size display
        if (this.elements.currentSize) {
            this.elements.currentSize.textContent = `${sizeConfig.width} × ${sizeConfig.height}px`;
        }

        // Adjust font size for content fitting
        this.adjustFontSizeForContent();
    },

    /**
     * Adjust font size to fit content within banner dimensions
     */
    adjustFontSizeForContent() {
        const canvas = this.elements.bannerCanvas;
        const text = this.elements.previewText;
        const sizeConfig = this.defaults.sizes[this.currentBanner.size];

        if (!canvas || !text) return;

        const maxWidth = sizeConfig.width - 40; // Padding
        const maxHeight = sizeConfig.height - 40; // Padding

        // Reset to original size
        text.style.fontSize = `${this.currentBanner.fontSize}px`;

        // Check if text overflows and reduce font size if needed
        if (text.scrollWidth > maxWidth || text.scrollHeight > maxHeight) {
            let fontSize = this.currentBanner.fontSize;
            
            while ((text.scrollWidth > maxWidth || text.scrollHeight > maxHeight) && fontSize > 10) {
                fontSize -= 1;
                text.style.fontSize = `${fontSize}px`;
            }
        }
    },

    /**
     * Show save modal
     */
    showSaveModal() {
        if (!this.validateBanner()) return;
        
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
     * Validate banner before saving
     */
    validateBanner() {
        if (!this.currentBanner.name.trim()) {
            this.showNotification('Please enter a banner name', 'error');
            this.elements.bannerName?.focus();
            return false;
        }

        if (!this.currentBanner.text.trim()) {
            this.showNotification('Please enter banner text', 'error');
            this.elements.bannerText?.focus();
            return false;
        }

        return true;
    },

    /**
     * Save banner
     */
    saveBanner() {
        const status = this.elements.saveStatus?.value || 'draft';
        const currentUser = Auth.getCurrentUser();

        if (!currentUser) {
            this.showNotification('Please log in to save banners', 'error');
            return;
        }

        const bannerData = {
            userId: currentUser.id,
            name: this.currentBanner.name,
            type: 'banner',
            status: status,
            data: { ...this.currentBanner }
        };

        let savedBanner;
        if (this.currentBanner.id) {
            // Update existing banner
            savedBanner = Storage.updateCampaign(this.currentBanner.id, bannerData);
        } else {
            // Create new banner
            savedBanner = Storage.addCampaign(bannerData);
            if (savedBanner) {
                this.currentBanner.id = savedBanner.id;
                // Update URL to include ID
                const newUrl = new URL(window.location);
                newUrl.searchParams.set('id', savedBanner.id);
                window.history.replaceState({}, '', newUrl);
            }
        }

        if (savedBanner) {
            this.showNotification('Banner saved successfully!', 'success');
            this.hideSaveModal();
        } else {
            this.showNotification('Failed to save banner', 'error');
        }
    },

    /**
     * Reset banner to defaults
     */
    resetBanner() {
        const confirmed = confirm('Are you sure you want to reset the banner? All changes will be lost.');
        if (confirmed) {
            this.currentBanner = {
                id: this.currentBanner.id,
                name: this.currentBanner.name,
                size: '250x250',
                text: '',
                fontFamily: 'Arial, sans-serif',
                fontSize: 24,
                textColor: '#000000',
                backgroundColor: '#ffffff',
                status: 'draft'
            };

            this.populateForm();
            this.updatePreview();
            this.showNotification('Banner reset to defaults', 'info');
        }
    },

    /**
     * Duplicate current banner
     */
    duplicateBanner() {
        if (!this.currentBanner.id) {
            this.showNotification('Please save the banner first before duplicating', 'warning');
            return;
        }

        const duplicated = Storage.duplicateCampaign(this.currentBanner.id);
        if (duplicated) {
            this.showNotification('Banner duplicated successfully!', 'success');
            // Redirect to edit the duplicated banner
            setTimeout(() => {
                window.location.href = `banner-editor.html?id=${duplicated.id}`;
            }, 1000);
        } else {
            this.showNotification('Failed to duplicate banner', 'error');
        }
    },

    /**
     * Download banner as image (simplified version)
     */
    downloadBanner() {
        this.showNotification('Download feature is coming soon!', 'info');
        // In a real application, you would use Canvas API or libraries like html2canvas
        // to generate an actual image file for download
    },

    /**
     * Toggle preview mode
     */
    togglePreview() {
        // This could be expanded to show a fullscreen preview
        this.showNotification('Preview mode - your banner looks great!', 'info');
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
            this.resetBanner();
        }

        // Escape to close modal
        if (event.key === 'Escape') {
            this.hideSaveModal();
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
     * Get current banner data for external use
     */
    getBannerData() {
        return { ...this.currentBanner };
    },

    /**
     * Set banner data from external source
     */
    setBannerData(data) {
        this.currentBanner = { ...this.currentBanner, ...data };
        this.populateForm();
        this.updatePreview();
    }
};

// Make BannerEditor available globally
window.BannerEditor = BannerEditor;
