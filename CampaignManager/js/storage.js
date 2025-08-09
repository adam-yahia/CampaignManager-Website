/**
 * Storage Manager - Handles all LocalStorage operations for the Campaign Manager
 * Provides a centralized interface for storing and retrieving user data and campaigns
 */

const Storage = {
    // Storage keys
    KEYS: {
        USERS: 'campaignManager_users',
        CURRENT_USER: 'campaignManager_currentUser',
        CAMPAIGNS: 'campaignManager_campaigns'
    },

    /**
     * Initialize storage with default data if needed
     */
    init() {
        this.initUsers();
        this.initCampaigns();
    },

    /**
     * Initialize users storage with test user if empty
     */
    initUsers() {
        const users = this.getUsers();
        if (users.length === 0) {
            // Create default test user
            const testUser = {
                id: this.generateId(),
                username: 'demo',
                password: 'demo123', // In a real app, this would be hashed
                createdAt: new Date().toISOString()
            };
            this.setUsers([testUser]);
            console.log('Demo user created: username "demo", password "demo123"');
        }
    },

    /**
     * Initialize campaigns storage if empty
     */
    initCampaigns() {
        const campaigns = this.getCampaigns();
        if (campaigns.length === 0) {
            this.setCampaigns([]);
        }
    },

    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Safe localStorage wrapper with error handling
     */
    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            return false;
        }
    },

    getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Failed to read from localStorage:', error);
            return defaultValue;
        }
    },

    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
            return false;
        }
    },

    /**
     * User management
     */
    getUsers() {
        return this.getItem(this.KEYS.USERS, []);
    },

    setUsers(users) {
        return this.setItem(this.KEYS.USERS, users);
    },

    addUser(userData) {
        const users = this.getUsers();
        const newUser = {
            id: this.generateId(),
            ...userData,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        this.setUsers(users);
        return newUser;
    },

    findUserByUsername(username) {
        const users = this.getUsers();
        return users.find(user => user.username === username);
    },

    validateUser(username, password) {
        const user = this.findUserByUsername(username);
        return user && user.password === password ? user : null;
    },

    /**
     * Current user session management
     */
    setCurrentUser(user) {
        console.log('Setting current user:', user ? user.username : 'null');
        
        // Save to both localStorage and sessionStorage for redundancy
        const localResult = this.setItem(this.KEYS.CURRENT_USER, user);
        
        try {
            sessionStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(user));
            console.log('User also saved to sessionStorage');
        } catch (error) {
            console.error('Failed to save to sessionStorage:', error);
        }
        
        return localResult;
    },

    getCurrentUser() {
        // Try localStorage first
        let user = this.getItem(this.KEYS.CURRENT_USER);
        
        // If not found in localStorage, try sessionStorage
        if (!user) {
            try {
                const sessionUser = sessionStorage.getItem(this.KEYS.CURRENT_USER);
                if (sessionUser) {
                    user = JSON.parse(sessionUser);
                    console.log('User recovered from sessionStorage');
                    // Restore to localStorage
                    this.setItem(this.KEYS.CURRENT_USER, user);
                }
            } catch (error) {
                console.error('Failed to read from sessionStorage:', error);
            }
        }
        
        console.log('Getting current user:', user ? user.username : 'null');
        return user;
    },

    clearCurrentUser() {
        console.log('Clearing current user');
        const result = this.removeItem(this.KEYS.CURRENT_USER);
        
        try {
            sessionStorage.removeItem(this.KEYS.CURRENT_USER);
        } catch (error) {
            console.error('Failed to clear sessionStorage:', error);
        }
        
        return result;
    },

    /**
     * Campaign management
     */
    getCampaigns(userId = null) {
        const allCampaigns = this.getItem(this.KEYS.CAMPAIGNS, []);
        if (userId) {
            return allCampaigns.filter(campaign => campaign.userId === userId);
        }
        return allCampaigns;
    },

    setCampaigns(campaigns) {
        return this.setItem(this.KEYS.CAMPAIGNS, campaigns);
    },

    addCampaign(campaignData) {
        const campaigns = this.getCampaigns();
        const newCampaign = {
            id: this.generateId(),
            ...campaignData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        campaigns.push(newCampaign);
        this.setCampaigns(campaigns);
        return newCampaign;
    },

    updateCampaign(campaignId, updateData) {
        const campaigns = this.getCampaigns();
        const index = campaigns.findIndex(campaign => campaign.id === campaignId);
        
        if (index !== -1) {
            campaigns[index] = {
                ...campaigns[index],
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            this.setCampaigns(campaigns);
            return campaigns[index];
        }
        return null;
    },

    deleteCampaign(campaignId) {
        const campaigns = this.getCampaigns();
        const filteredCampaigns = campaigns.filter(campaign => campaign.id !== campaignId);
        this.setCampaigns(filteredCampaigns);
        return filteredCampaigns.length < campaigns.length;
    },

    getCampaignById(campaignId) {
        const campaigns = this.getCampaigns();
        return campaigns.find(campaign => campaign.id === campaignId);
    },

    /**
     * Campaign statistics
     */
    getCampaignStats(userId) {
        const userCampaigns = this.getCampaigns(userId);
        
        return {
            total: userCampaigns.length,
            banners: userCampaigns.filter(c => c.type === 'banner').length,
            emails: userCampaigns.filter(c => c.type === 'email').length,
            landing: userCampaigns.filter(c => c.type === 'landing').length,
            drafts: userCampaigns.filter(c => c.status === 'draft').length,
            published: userCampaigns.filter(c => c.status === 'published').length
        };
    },

    /**
     * Search and filter campaigns
     */
    searchCampaigns(userId, filters = {}) {
        let campaigns = this.getCampaigns(userId);

        // Filter by type
        if (filters.type && filters.type !== 'all') {
            campaigns = campaigns.filter(campaign => campaign.type === filters.type);
        }

        // Filter by status
        if (filters.status && filters.status !== 'all') {
            campaigns = campaigns.filter(campaign => campaign.status === filters.status);
        }

        // Search by name
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            campaigns = campaigns.filter(campaign => 
                campaign.name.toLowerCase().includes(searchTerm)
            );
        }

        // Sort by date (newest first by default)
        campaigns.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        return campaigns;
    },

    /**
     * Duplicate campaign
     */
    duplicateCampaign(campaignId) {
        const originalCampaign = this.getCampaignById(campaignId);
        if (!originalCampaign) return null;

        const duplicatedCampaign = {
            ...originalCampaign,
            id: this.generateId(),
            name: `${originalCampaign.name} (Copy)`,
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const campaigns = this.getCampaigns();
        campaigns.push(duplicatedCampaign);
        this.setCampaigns(campaigns);
        
        return duplicatedCampaign;
    },

    /**
     * Export/Import functionality for data backup
     */
    exportData() {
        return {
            users: this.getUsers(),
            campaigns: this.getCampaigns(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    },

    importData(data) {
        try {
            if (data.users) this.setUsers(data.users);
            if (data.campaigns) this.setCampaigns(data.campaigns);
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    },

    /**
     * Clear all data (for testing or reset purposes)
     */
    clearAllData() {
        this.removeItem(this.KEYS.USERS);
        this.removeItem(this.KEYS.CURRENT_USER);
        this.removeItem(this.KEYS.CAMPAIGNS);
        this.init(); // Reinitialize with defaults
    },

    /**
     * Get storage usage information
     */
    getStorageInfo() {
        try {
            const used = new Blob(Object.values(localStorage)).size;
            const total = 5 * 1024 * 1024; // 5MB typical localStorage limit
            return {
                used: used,
                total: total,
                percentage: Math.round((used / total) * 100),
                humanReadable: {
                    used: this.formatBytes(used),
                    total: this.formatBytes(total)
                }
            };
        } catch (error) {
            console.error('Failed to get storage info:', error);
            return null;
        }
    },

    /**
     * Format bytes to human readable format
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Validate data integrity
     */
    validateData() {
        const issues = [];
        
        // Check users
        const users = this.getUsers();
        if (!Array.isArray(users)) {
            issues.push('Users data is corrupted');
        }

        // Check campaigns
        const campaigns = this.getCampaigns();
        if (!Array.isArray(campaigns)) {
            issues.push('Campaigns data is corrupted');
        }

        // Check for orphaned campaigns (campaigns without valid users)
        const userIds = users.map(user => user.id);
        const orphanedCampaigns = campaigns.filter(campaign => 
            campaign.userId && !userIds.includes(campaign.userId)
        );
        
        if (orphanedCampaigns.length > 0) {
            issues.push(`Found ${orphanedCampaigns.length} orphaned campaigns`);
        }

        return {
            isValid: issues.length === 0,
            issues: issues
        };
    }
};

// Initialize storage when the script loads
Storage.init();

// Make Storage available globally
window.Storage = Storage;
