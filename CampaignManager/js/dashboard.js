/**
 * Dashboard Manager - Handles the main dashboard functionality
 * Displays campaign statistics, quick actions, and recent campaigns
 */

const Dashboard = {
    // Current user and data
    currentUser: null,
    campaigns: [],
    filteredCampaigns: [],

    // DOM elements
    elements: {},

    /**
     * Initialize dashboard
     */
    init() {
        console.log('Dashboard init starting...');
        
        // Check authentication with more detailed logging
        const currentUser = Auth.getCurrentUser();
        console.log('Dashboard - Current user check:', currentUser);
        
        if (!currentUser) {
            console.log('Dashboard - No user found, redirecting to login');
            if (!Auth.requireAuth()) return;
        }

        this.currentUser = currentUser;
        console.log('Dashboard - User authenticated:', this.currentUser.username);
        
        this.cacheElements();
        this.bindEvents();
        this.loadUserData();
        this.updateDisplay();
    },

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            // Header elements
            currentUser: document.getElementById('currentUser'),
            logoutBtn: document.getElementById('logoutBtn'),

            // Stats elements
            bannerCount: document.getElementById('bannerCount'),
            emailCount: document.getElementById('emailCount'),
            landingCount: document.getElementById('landingCount'),

            // Action cards
            actionCards: document.querySelectorAll('.action-card'),

            // Campaign filters
            campaignFilter: document.getElementById('campaignFilter'),
            statusFilter: document.getElementById('statusFilter'),

            // Campaigns table
            campaignsTableBody: document.getElementById('campaignsTableBody'),
            noCampaigns: document.getElementById('noCampaigns')
        };
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Logout button
        if (this.elements.logoutBtn) {
            this.elements.logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Action cards
        this.elements.actionCards.forEach(card => {
            card.addEventListener('click', () => {
                const action = card.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Filters
        if (this.elements.campaignFilter) {
            this.elements.campaignFilter.addEventListener('change', () => {
                this.filterCampaigns();
            });
        }

        if (this.elements.statusFilter) {
            this.elements.statusFilter.addEventListener('change', () => {
                this.filterCampaigns();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Refresh data when returning to page
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.refreshData();
            }
        });
    },

    /**
     * Load user data and campaigns
     */
    loadUserData() {
        if (!this.currentUser) return;

        // Load campaigns for current user
        this.campaigns = Storage.getCampaigns(this.currentUser.id);
        this.filteredCampaigns = [...this.campaigns];

        // Update user display
        if (this.elements.currentUser) {
            this.elements.currentUser.textContent = this.currentUser.username;
        }
    },

    /**
     * Update dashboard display
     */
    updateDisplay() {
        this.updateStats();
        this.updateCampaignsList();
    },

    /**
     * Update campaign statistics
     */
    updateStats() {
        const stats = Storage.getCampaignStats(this.currentUser.id);

        if (this.elements.bannerCount) {
            this.animateCounter(this.elements.bannerCount, stats.banners);
        }

        if (this.elements.emailCount) {
            this.animateCounter(this.elements.emailCount, stats.emails);
        }

        if (this.elements.landingCount) {
            this.animateCounter(this.elements.landingCount, stats.landing);
        }
    },

    /**
     * Animate counter from 0 to target value
     */
    animateCounter(element, target) {
        const duration = 1000; // 1 second
        const start = 0;
        const increment = target / (duration / 16); // 60fps

        let current = start;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    },

    /**
     * Update campaigns list/table
     */
    updateCampaignsList() {
        if (!this.elements.campaignsTableBody) return;

        const tbody = this.elements.campaignsTableBody;
        const noCampaigns = this.elements.noCampaigns;

        // Clear existing content
        tbody.innerHTML = '';

        if (this.filteredCampaigns.length === 0) {
            // Show no campaigns message
            if (noCampaigns) {
                noCampaigns.style.display = 'block';
            }
            return;
        }

        // Hide no campaigns message
        if (noCampaigns) {
            noCampaigns.style.display = 'none';
        }

        // Populate table
        this.filteredCampaigns.forEach(campaign => {
            const row = this.createCampaignRow(campaign);
            tbody.appendChild(row);
        });
    },

    /**
     * Create a table row for a campaign
     */
    createCampaignRow(campaign) {
        const row = document.createElement('tr');
        
        // Format date
        const lastModified = new Date(campaign.updatedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        row.innerHTML = `
            <td>
                <div class="campaign-name">${this.escapeHtml(campaign.name)}</div>
            </td>
            <td>
                <span class="campaign-type ${campaign.type}">
                    <i class="fas fa-${this.getTypeIcon(campaign.type)}"></i>
                    ${this.formatType(campaign.type)}
                </span>
            </td>
            <td>
                <span class="campaign-date">${lastModified}</span>
            </td>
            <td>
                <span class="campaign-status ${campaign.status}">
                    <i class="fas fa-${this.getStatusIcon(campaign.status)}"></i>
                    ${this.formatStatus(campaign.status)}
                </span>
            </td>
            <td>
                <div class="campaign-actions">
                    <a href="${this.getEditorUrl(campaign.type)}?id=${campaign.id}" 
                       class="btn-icon" title="Edit Campaign">
                        <i class="fas fa-edit"></i>
                    </a>
                    <button class="btn-icon" onclick="Dashboard.duplicateCampaign('${campaign.id}')" 
                            title="Duplicate Campaign">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn-icon" onclick="Dashboard.deleteCampaign('${campaign.id}')" 
                            title="Delete Campaign">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        return row;
    },

    /**
     * Get icon for campaign type
     */
    getTypeIcon(type) {
        switch (type) {
            case 'banner': return 'image';
            case 'email': return 'envelope';
            case 'landing': return 'desktop';
            default: return 'file';
        }
    },

    /**
     * Get icon for campaign status
     */
    getStatusIcon(status) {
        switch (status) {
            case 'draft': return 'edit';
            case 'published': return 'check-circle';
            default: return 'circle';
        }
    },

    /**
     * Format campaign type for display
     */
    formatType(type) {
        switch (type) {
            case 'banner': return 'Banner';
            case 'email': return 'Email';
            case 'landing': return 'Landing';
            default: return 'Unknown';
        }
    },

    /**
     * Format campaign status for display
     */
    formatStatus(status) {
        switch (status) {
            case 'draft': return 'Draft';
            case 'published': return 'Published';
            default: return 'Unknown';
        }
    },

    /**
     * Get editor URL for campaign type
     */
    getEditorUrl(type) {
        switch (type) {
            case 'banner': return 'banner-editor.html';
            case 'email': return 'email-editor.html';
            case 'landing': return 'landing-editor.html';
            default: return '#';
        }
    },

    /**
     * Handle quick action clicks
     */
    handleQuickAction(action) {
        const urls = {
            banner: 'banner-editor.html',
            email: 'email-editor.html',
            landing: 'landing-editor.html'
        };

        if (urls[action]) {
            window.location.href = urls[action];
        }
    },

    /**
     * Filter campaigns based on current filter settings
     */
    filterCampaigns() {
        const typeFilter = this.elements.campaignFilter ? this.elements.campaignFilter.value : 'all';
        const statusFilter = this.elements.statusFilter ? this.elements.statusFilter.value : 'all';

        this.filteredCampaigns = Storage.searchCampaigns(this.currentUser.id, {
            type: typeFilter,
            status: statusFilter
        });

        this.updateCampaignsList();
    },

    /**
     * Duplicate a campaign
     */
    duplicateCampaign(campaignId) {
        const duplicated = Storage.duplicateCampaign(campaignId);
        if (duplicated) {
            this.showNotification('Campaign duplicated successfully!', 'success');
            this.refreshData();
        } else {
            this.showNotification('Failed to duplicate campaign.', 'error');
        }
    },

    /**
     * Delete a campaign with confirmation
     */
    deleteCampaign(campaignId) {
        const campaign = Storage.getCampaignById(campaignId);
        if (!campaign) return;

        const confirmed = confirm(`Are you sure you want to delete "${campaign.name}"?\n\nThis action cannot be undone.`);
        if (confirmed) {
            const deleted = Storage.deleteCampaign(campaignId);
            if (deleted) {
                this.showNotification('Campaign deleted successfully.', 'success');
                this.refreshData();
            } else {
                this.showNotification('Failed to delete campaign.', 'error');
            }
        }
    },

    /**
     * Handle logout
     */
    handleLogout() {
        const confirmed = confirm('Are you sure you want to log out?');
        if (confirmed) {
            Auth.logout();
        }
    },

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + N for new campaign (show quick actions)
        if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
            event.preventDefault();
            // Focus on first action card
            if (this.elements.actionCards[0]) {
                this.elements.actionCards[0].focus();
            }
        }

        // Ctrl/Cmd + R for refresh
        if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
            event.preventDefault();
            this.refreshData();
        }

        // Escape to clear filters
        if (event.key === 'Escape') {
            this.clearFilters();
        }
    },

    /**
     * Clear all filters
     */
    clearFilters() {
        if (this.elements.campaignFilter) {
            this.elements.campaignFilter.value = 'all';
        }
        if (this.elements.statusFilter) {
            this.elements.statusFilter.value = 'all';
        }
        this.filterCampaigns();
    },

    /**
     * Refresh dashboard data
     */
    refreshData() {
        this.loadUserData();
        this.filterCampaigns();
        this.updateStats();
        this.showNotification('Dashboard refreshed', 'info');
    },

    /**
     * Show notification message
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${this.escapeHtml(message)}</span>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Show with animation
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);

        // Add click to dismiss
        notification.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        });
    },

    /**
     * Get notification icon
     */
    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            case 'info': return 'info-circle';
            default: return 'bell';
        }
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
     * Get dashboard statistics for external use
     */
    getStats() {
        return Storage.getCampaignStats(this.currentUser.id);
    },

    /**
     * Export campaigns data
     */
    exportCampaigns() {
        const data = Storage.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `campaigns-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Campaigns exported successfully!', 'success');
    }
};

// Add CSS for notifications if not already present
if (!document.querySelector('#dashboard-notifications-css')) {
    const style = document.createElement('style');
    style.id = 'dashboard-notifications-css';
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border: 1px solid var(--gray-200);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            padding: var(--spacing-md);
            z-index: 1000;
            transform: translateX(400px);
            transition: transform var(--transition-normal);
            cursor: pointer;
            max-width: 350px;
        }

        .notification.show {
            transform: translateX(0);
        }

        .notification-content {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
        }

        .notification-success {
            border-left: 4px solid var(--success-color);
        }

        .notification-error {
            border-left: 4px solid var(--error-color);
        }

        .notification-warning {
            border-left: 4px solid var(--warning-color);
        }

        .notification-info {
            border-left: 4px solid var(--info-color);
        }

        .notification-success .fas {
            color: var(--success-color);
        }

        .notification-error .fas {
            color: var(--error-color);
        }

        .notification-warning .fas {
            color: var(--warning-color);
        }

        .notification-info .fas {
            color: var(--info-color);
        }

        @media (max-width: 480px) {
            .notification {
                right: 10px;
                left: 10px;
                max-width: none;
                transform: translateY(-100px);
            }

            .notification.show {
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// Make Dashboard available globally
window.Dashboard = Dashboard;
