import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createRequire } from 'module';

// Get current file directory with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Import stremio-addon-sdk using require
const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database with new lowdb v6 syntax
const dbFile = path.join(dataDir, 'db.json');
const adapter = new JSONFile(dbFile);
const defaultData = {
    users: [],
    customizations: {},
    settings: {
        port: 7000,
        version: '1.0.0'
    }
};
const db = new Low(adapter, defaultData);

// Initialize data if needed
const initDb = async () => {
    // Read data from JSON file
    await db.read();
    
    // Write default data to db.json if it doesn't exist
    if (!db.data) {
        db.data = defaultData;
        await db.write();
    }
};

// Helper functions to work with the new lowdb API
const getSettings = () => db.data.settings;
const getCustomizations = (authKey) => db.data.customizations[authKey] || {};
const setCustomizations = async (authKey, customizations) => {
    db.data.customizations[authKey] = customizations;
    await db.write();
};

// Create the addon builder
const builder = new addonBuilder({
    id: 'org.stremio.customizer',
    version: '1.0.0',
    name: 'Stremio Customizer',
    description: 'Customize your Stremio experience',
    resources: ['catalog', 'meta', 'subtitles'],
    types: ['movie', 'series', 'channel', 'tv'],
    idPrefixes: ['tt', 'kitsu'],
    catalogs: [
        {
            type: 'movie',
            id: 'stremio-customizer-catalog',
            name: 'Stremio Customizer',
            extra: [
                {
                    name: 'search',
                    isRequired: false
                }
            ]
        }
    ],
    background: 'https://raw.githubusercontent.com/Stremio/stremio-art/main/background.jpg',
    logo: 'https://raw.githubusercontent.com/Stremio/stremio-art/main/logo.png',
    contactEmail: 'your-email@example.com',
    website: `http://localhost:${getSettings().port}/`
});

// Define catalog handler
builder.defineCatalogHandler(({ type, id }) => {
    console.log('Catalog request:', { type, id });
    if (type === 'movie' && id === 'stremio-customizer-catalog') {
        const settingsItem = {
            id: 'stremio-customizer-settings',
            type: 'movie',
            name: 'Stremio Customizer Settings',
            poster: 'https://raw.githubusercontent.com/Stremio/stremio-art/main/settings.png',
            background: 'https://raw.githubusercontent.com/Stremio/stremio-art/main/background.jpg',
            description: 'Access the Stremio Customizer settings',
            website: `http://localhost:${getSettings().port}/`
        };
        console.log('Returning settings item:', settingsItem);
        return Promise.resolve({
            metas: [settingsItem]
        });
    }
    return Promise.resolve({ metas: [] });
});

// Define meta handler
builder.defineMetaHandler(({ type, id }) => {
    if (type === 'movie' && id === 'stremio-customizer-settings') {
        return Promise.resolve({
            meta: {
                id: 'stremio-customizer-settings',
                type: 'movie',
                name: 'Stremio Customizer Settings',
                poster: 'https://raw.githubusercontent.com/Stremio/stremio-art/main/settings.png',
                background: 'https://raw.githubusercontent.com/Stremio/stremio-art/main/background.jpg',
                description: 'Access the Stremio Customizer settings',
                website: `http://localhost:${getSettings().port}/`
            }
        });
    }
    return Promise.resolve({ meta: null });
});

// Define subtitles handler
builder.defineSubtitlesHandler(({ type, id }) => {
    // Since this is a customization addon, we don't actually provide subtitles
    return Promise.resolve({ subtitles: [] });
});

// Create the addon
const addon = builder.getInterface();

// Create Express app for the web interface
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API endpoints for customization
app.get('/api/settings', (req, res) => {
    res.json(getSettings());
});

// Endpoint to get customizations for a user
app.get('/api/customizations/:authKey', async (req, res) => {
    const { authKey } = req.params;
    
    try {
        // Read from database
        await db.read();
        
        // Get customizations for this user
        const customizations = db.data.customizations[authKey] || {
            ui: {
                theme: 'default',
                layout: 'default',
                hiddenElements: [],
                customCSS: ''
            },
            catalogs: {
                hidden: []
            },
            filters: {
                rules: []
            },
            addons: {
                disabled: []
            }
        };
        
        res.json(customizations);
    } catch (error) {
        console.error('Error getting customizations:', error);
        res.status(500).json({ error: 'Failed to get customizations' });
    }
});

// Endpoint to apply customizations
app.post('/api/customizations/:authKey/apply', async (req, res) => {
    const { authKey } = req.params;
    const { customizationType, customizationData } = req.body;
    
    try {
        // Read from database
        await db.read();
        
        // Initialize customizations if not exists
        if (!db.data.customizations[authKey]) {
            db.data.customizations[authKey] = {
                ui: {
                    theme: 'default',
                    layout: 'default',
                    hiddenElements: [],
                    customCSS: ''
                },
                catalogs: {
                    hidden: []
                },
                filters: {
                    rules: []
                },
                addons: {
                    disabled: []
                }
            };
        }
        
        // Update the specific customization type
        db.data.customizations[authKey][customizationType] = customizationData;
        
        // Save to database
        await db.write();
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error applying customizations:', error);
        res.status(500).json({ error: 'Failed to apply customizations' });
    }
});

// Endpoint to get Stremio addons
app.post('/api/stremio/addons', async (req, res) => {
    const { authKey } = req.body;
    
    try {
        const response = await fetch('https://api.strem.io/api/addonCollectionGet', {
            method: 'POST',
            body: JSON.stringify({
                type: 'AddonCollectionGet',
                authKey,
                update: true,
            }),
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching addons:', error);
        res.status(500).json({ error: 'Failed to fetch addons' });
    }
});

// Endpoint to update Stremio addons
app.post('/api/stremio/addons/update', async (req, res) => {
    const { authKey, addons } = req.body;
    
    try {
        const response = await fetch('https://api.strem.io/api/addonCollectionSet', {
            method: 'POST',
            body: JSON.stringify({
                type: 'AddonCollectionSet',
                authKey,
                addons,
            }),
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error updating addons:', error);
        res.status(500).json({ error: 'Failed to update addons' });
    }
});

// Endpoint to generate customization script
app.get('/api/customizations/:authKey/script', (req, res) => {
    const { authKey } = req.params;
    const customizations = getCustomizations(authKey);
    
    // Generate JavaScript code to apply customizations
    let script = `
    // Stremio Customizer Script
    // Generated: ${new Date().toISOString()}
    
    (function() {
        const customizations = ${JSON.stringify(customizations, null, 2)};
        
        // Add theme styles
        const themeStyles = document.createElement('style');
        themeStyles.textContent = \`
            /* Theme styles */
            body.theme-light {
                --background-color: #ffffff;
                --text-color: #333333;
                --primary-color: #2196f3;
                --secondary-color: #f5f5f5;
                --accent-color: #ff4081;
                --border-color: #e0e0e0;
                --card-background: #ffffff;
                --card-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            body.theme-dark {
                --background-color: #1a1a1a;
                --text-color: #ffffff;
                --primary-color: #64b5f6;
                --secondary-color: #2d2d2d;
                --accent-color: #ff80ab;
                --border-color: #404040;
                --card-background: #2d2d2d;
                --card-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }

            body.theme-custom {
                /* Custom theme colors will be applied via CSS variables */
            }

            /* Layout styles */
            body.layout-compact {
                --card-padding: 8px;
                --card-margin: 4px;
                --grid-gap: 8px;
            }

            body.layout-expanded {
                --card-padding: 16px;
                --card-margin: 8px;
                --grid-gap: 16px;
            }

            body.layout-grid {
                --card-padding: 12px;
                --card-margin: 8px;
                --grid-gap: 12px;
            }

            /* Card styles */
            body.card-style-default .card {
                border-radius: 8px;
                box-shadow: var(--card-shadow);
            }

            body.card-style-minimal .card {
                border-radius: 4px;
                box-shadow: none;
                border: 1px solid var(--border-color);
            }

            body.card-style-detailed .card {
                border-radius: 12px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }

            /* Font size styles */
            body.font-size-small {
                font-size: 14px;
            }

            body.font-size-medium {
                font-size: 16px;
            }

            body.font-size-large {
                font-size: 18px;
            }

            /* Animation styles */
            body.animation-none * {
                transition: none !important;
            }

            body.animation-smooth * {
                transition: all 0.3s ease !important;
            }

            body.animation-bouncy * {
                transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
            }

            /* Apply theme variables */
            body {
                background-color: var(--background-color);
                color: var(--text-color);
            }

            .card {
                background-color: var(--card-background);
                border: 1px solid var(--border-color);
                box-shadow: var(--card-shadow);
            }

            .btn-primary {
                background-color: var(--primary-color);
                border-color: var(--primary-color);
            }

            .btn-secondary {
                background-color: var(--secondary-color);
                border-color: var(--secondary-color);
            }

            .text-primary {
                color: var(--primary-color) !important;
            }

            .text-accent {
                color: var(--accent-color) !important;
            }
        \`;
        document.head.appendChild(themeStyles);
        
        // Apply UI customizations
        function applyUICustomizations() {
            const uiCustomizations = customizations.ui || {};
            
            // Apply theme
            if (uiCustomizations.theme) {
                // Remove existing theme classes
                document.body.classList.remove('theme-light', 'theme-dark', 'theme-custom');
                // Add new theme class
                document.body.classList.add(\`theme-\${uiCustomizations.theme}\`);
                
                // Apply custom theme colors if theme is custom
                if (uiCustomizations.theme === 'custom' && uiCustomizations.colorScheme) {
                    const root = document.documentElement;
                    const colors = uiCustomizations.colorScheme;
                    
                    // Apply color variables
                    Object.entries(colors).forEach(([key, value]) => {
                        root.style.setProperty(\`--\${key}\`, value);
                    });
                }
            }
            
            // Apply layout
            if (uiCustomizations.layout) {
                document.body.classList.remove('layout-compact', 'layout-expanded', 'layout-grid');
                document.body.classList.add(\`layout-\${uiCustomizations.layout}\`);
            }
            
            // Apply card style
            if (uiCustomizations.cardStyle) {
                document.body.classList.remove('card-style-default', 'card-style-minimal', 'card-style-detailed');
                document.body.classList.add(\`card-style-\${uiCustomizations.cardStyle}\`);
            }
            
            // Apply font size
            if (uiCustomizations.fontSize) {
                document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
                document.body.classList.add(\`font-size-\${uiCustomizations.fontSize}\`);
            }
            
            // Apply animation style
            if (uiCustomizations.animation) {
                document.body.classList.remove('animation-none', 'animation-smooth', 'animation-bouncy');
                document.body.classList.add(\`animation-\${uiCustomizations.animation}\`);
            }
            
            // Apply CSS customizations
            if (uiCustomizations.customCSS) {
                const style = document.createElement('style');
                style.id = 'stremio-customizer-styles';
                style.textContent = uiCustomizations.customCSS;
                document.head.appendChild(style);
            }
            
            // Apply element visibility customizations
            if (uiCustomizations.hiddenElements) {
                uiCustomizations.hiddenElements.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(el => {
                        el.style.display = 'none';
                    });
                });
            }
            
            // Apply content display options
            if (uiCustomizations.contentDisplay) {
                const display = uiCustomizations.contentDisplay;
                const style = document.createElement('style');
                style.id = 'stremio-customizer-content-display';
                style.textContent = \`
                    .imdb-rating { display: \${display.imdb ? 'block' : 'none'}; }
                    .year { display: \${display.year ? 'block' : 'none'}; }
                    .duration { display: \${display.duration ? 'block' : 'none'}; }
                    .genres { display: \${display.genres ? 'block' : 'none'}; }
                \`;
                document.head.appendChild(style);
            }

            // Apply Continue Watching customizations
            if (uiCustomizations.continueWatching) {
                const continueWatching = uiCustomizations.continueWatching;
                
                // Create a style element for Continue Watching customizations
                const style = document.createElement('style');
                style.id = 'stremio-customizer-continue-watching';
                style.textContent = \`
                    /* Continue Watching Styles */
                    .continue-watching {
                        display: \${continueWatching.showMovies || continueWatching.showSeries || continueWatching.showDocumentaries ? 'block' : 'none'};
                    }
                    
                    .continue-watching .movie-item {
                        display: \${continueWatching.showMovies ? 'block' : 'none'};
                    }
                    
                    .continue-watching .series-item {
                        display: \${continueWatching.showSeries ? 'block' : 'none'};
                    }
                    
                    .continue-watching .documentary-item {
                        display: \${continueWatching.showDocumentaries ? 'block' : 'none'};
                    }
                    
                    .continue-watching .progress-bar {
                        display: \${continueWatching.showProgressBar ? 'block' : 'none'};
                    }
                    
                    .continue-watching .time-remaining {
                        display: \${continueWatching.showTimeRemaining ? 'block' : 'none'};
                    }
                \`;
                document.head.appendChild(style);

                // Override the Continue Watching section's sorting and filtering
                const originalFetch = window.fetch;
                window.fetch = function(url, options) {
                    return originalFetch(url, options).then(response => {
                        const clonedResponse = response.clone();
                        
                        // Check if this is a Continue Watching request
                        if (url.includes('/continue-watching')) {
                            return clonedResponse.json().then(data => {
                                if (data.items) {
                                    // Filter items based on content type
                                    data.items = data.items.filter(item => {
                                        if (item.type === 'movie' && !continueWatching.showMovies) return false;
                                        if (item.type === 'series' && !continueWatching.showSeries) return false;
                                        if (item.type === 'documentary' && !continueWatching.showDocumentaries) return false;
                                        return true;
                                    });

                                    // Apply time filter
                                    if (continueWatching.timeFilter !== 'all') {
                                        const now = new Date();
                                        const filterDate = new Date();
                                        switch (continueWatching.timeFilter) {
                                            case 'week':
                                                filterDate.setDate(now.getDate() - 7);
                                                break;
                                            case 'month':
                                                filterDate.setMonth(now.getMonth() - 1);
                                                break;
                                            case 'year':
                                                filterDate.setFullYear(now.getFullYear() - 1);
                                                break;
                                        }
                                        data.items = data.items.filter(item => 
                                            new Date(item.lastWatched) >= filterDate
                                        );
                                    }

                                    // Apply progress threshold
                                    if (continueWatching.progressThreshold) {
                                        data.items = data.items.filter(item => 
                                            item.progress >= continueWatching.progressThreshold
                                        );
                                    }

                                    // Sort items
                                    data.items.sort((a, b) => {
                                        switch (continueWatching.sortOrder) {
                                            case 'recently-aired':
                                                return new Date(b.airDate) - new Date(a.airDate);
                                            case 'last-watched':
                                                return new Date(b.lastWatched) - new Date(a.lastWatched);
                                            case 'progress':
                                                return b.progress - a.progress;
                                            case 'progress-lowest':
                                                return a.progress - b.progress;
                                            case 'alphabetical':
                                                return a.title.localeCompare(b.title);
                                            case 'date-added':
                                                return new Date(b.dateAdded) - new Date(a.dateAdded);
                                            case 'smart':
                                            default:
                                                // Smart sort: prioritize recent episodes and high progress
                                                const aIsRecent = isRecentlyPremiered(a, continueWatching.recentEpisodeDays);
                                                const bIsRecent = isRecentlyPremiered(b, continueWatching.recentEpisodeDays);
                                                if (aIsRecent && !bIsRecent) return -1;
                                                if (!aIsRecent && bIsRecent) return 1;
                                                const lastWatchedDiff = new Date(b.lastWatched) - new Date(a.lastWatched);
                                                if (lastWatchedDiff !== 0) return lastWatchedDiff;
                                                return b.progress - a.progress;
                                        }
                                    });

                                    // Limit number of items
                                    if (continueWatching.maxItems) {
                                        data.items = data.items.slice(0, continueWatching.maxItems);
                                    }
                                }
                                
                                // Create a new response with modified data
                                const modifiedResponse = new Response(JSON.stringify(data), {
                                    status: response.status,
                                    statusText: response.statusText,
                                    headers: response.headers
                                });
                                
                                return modifiedResponse;
                            });
                        }
                        
                        return response;
                    });
                };
            }
        }
        
        // Apply catalog customizations
        function applyCatalogCustomizations() {
            const catalogCustomizations = customizations.catalogs || {};
            
            // Handle hidden catalogs
            if (catalogCustomizations.hidden && catalogCustomizations.hidden.length > 0) {
                // This will be applied when loading catalogs
                const originalFetch = window.fetch;
                window.fetch = function(url, options) {
                    return originalFetch(url, options).then(response => {
                        const clonedResponse = response.clone();
                        
                        // Check if this is a catalog request
                        if (url.includes('addonCollectionGet')) {
                            return clonedResponse.json().then(data => {
                                if (data.result && data.result.addons) {
                                    // Process addons to hide catalogs
                                    data.result.addons.forEach(addon => {
                                        if (addon.manifest && addon.manifest.catalogs) {
                                            addon.manifest.catalogs = addon.manifest.catalogs.filter(catalog => {
                                                const catalogKey = \`\${addon.manifest.id}_\${catalog.type}_\${catalog.name}\`;
                                                return !catalogCustomizations.hidden.includes(catalogKey);
                                            });
                                        }
                                    });
                                }
                                
                                // Create a new response with modified data
                                const modifiedResponse = new Response(JSON.stringify(data), {
                                    status: response.status,
                                    statusText: response.statusText,
                                    headers: response.headers
                                });
                                
                                return modifiedResponse;
                            });
                        }
                        
                        return response;
                    });
                };
            }
        }
        
        // Apply content filtering
        function applyContentFiltering() {
            const filterCustomizations = customizations.filters || {};
            
            // Apply content filters
            if (filterCustomizations.rules && filterCustomizations.rules.length > 0) {
                // This will be applied when loading content
                const originalFetch = window.fetch;
                window.fetch = function(url, options) {
                    return originalFetch(url, options).then(response => {
                        const clonedResponse = response.clone();
                        
                        // Check if this is a meta request
                        if (url.includes('/meta/')) {
                            return clonedResponse.json().then(data => {
                                if (data.metas) {
                                    // Filter content based on rules
                                    data.metas = data.metas.filter(meta => {
                                        return filterCustomizations.rules.every(rule => {
                                            // Apply filtering rules
                                            if (rule.type === 'exclude' && meta.name.includes(rule.value)) {
                                                return false;
                                            }
                                            return true;
                                        });
                                    });
                                }
                                
                                // Create a new response with modified data
                                const modifiedResponse = new Response(JSON.stringify(data), {
                                    status: response.status,
                                    statusText: response.statusText,
                                    headers: response.headers
                                });
                                
                                return modifiedResponse;
                            });
                        }
                        
                        return response;
                    });
                };
            }
        }
        
        // Initialize customizations
        function init() {
            console.log('Stremio Customizer: Initializing...');
            
            // Apply all customizations
            applyUICustomizations();
            applyCatalogCustomizations();
            applyContentFiltering();
            
            console.log('Stremio Customizer: Customizations applied successfully');
        }
        
        // Run when DOM is fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
        
        // Re-apply customizations when navigation occurs (for SPA)
        window.addEventListener('popstate', () => {
            setTimeout(init, 500);
        });
        
        // Expose API for console usage
        window.stremioCustomizer = {
            getCustomizations: () => customizations,
            applyCustomizations: init
        };
    })();
    `;
    
    res.setHeader('Content-Type', 'application/javascript');
    res.send(script);
});

// Endpoint to get default customization script
app.get('/api/customizations/default/script', (req, res) => {
    const defaultScript = `
    // Stremio Customizer Script
    // Generated: ${new Date().toISOString()}
    
    (function() {
        const customizations = {
            "ui": {
                "theme": "dark",
                "layout": "expanded",
                "hiddenElements": [
                    ".sidebar",
                    ".top-bar",
                    ".footer"
                ],
                "customCSS": ""
            }
        };
        
        // Apply UI customizations
        function applyUICustomizations() {
            const uiCustomizations = customizations.ui || {};
            
            // Apply CSS customizations
            if (uiCustomizations.css) {
                const style = document.createElement('style');
                style.id = 'stremio-customizer-styles';
                style.textContent = uiCustomizations.css;
                document.head.appendChild(style);
            }
            
            // Apply element visibility customizations
            if (uiCustomizations.hiddenElements) {
                uiCustomizations.hiddenElements.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(el => {
                        el.style.display = 'none';
                    });
                });
            }
        }
        
        // Apply catalog customizations
        function applyCatalogCustomizations() {
            const catalogCustomizations = customizations.catalogs || {};
            
            // Handle hidden catalogs
            if (catalogCustomizations.hidden && catalogCustomizations.hidden.length > 0) {
                // This will be applied when loading catalogs
                const originalFetch = window.fetch;
                window.fetch = function(url, options) {
                    return originalFetch(url, options).then(response => {
                        const clonedResponse = response.clone();
                        
                        // Check if this is a catalog request
                        if (url.includes('addonCollectionGet')) {
                            return clonedResponse.json().then(data => {
                                if (data.result && data.result.addons) {
                                    // Process addons to hide catalogs
                                    data.result.addons.forEach(addon => {
                                        if (addon.manifest && addon.manifest.catalogs) {
                                            addon.manifest.catalogs = addon.manifest.catalogs.filter(catalog => {
                                                const catalogKey = \`\${addon.manifest.id}_\${catalog.type}_\${catalog.name}\`;
                                                return !catalogCustomizations.hidden.includes(catalogKey);
                                            });
                                        }
                                    });
                                }
                                
                                // Create a new response with modified data
                                const modifiedResponse = new Response(JSON.stringify(data), {
                                    status: response.status,
                                    statusText: response.statusText,
                                    headers: response.headers
                                });
                                
                                return modifiedResponse;
                            });
                        }
                        
                        return response;
                    });
                };
            }
        }
        
        // Apply content filtering
        function applyContentFiltering() {
            const filterCustomizations = customizations.filters || {};
            
            // Apply content filters
            if (filterCustomizations.rules && filterCustomizations.rules.length > 0) {
                // This will be applied when loading content
                const originalFetch = window.fetch;
                window.fetch = function(url, options) {
                    return originalFetch(url, options).then(response => {
                        const clonedResponse = response.clone();
                        
                        // Check if this is a meta request
                        if (url.includes('/meta/')) {
                            return clonedResponse.json().then(data => {
                                if (data.metas) {
                                    // Filter content based on rules
                                    data.metas = data.metas.filter(meta => {
                                        return filterCustomizations.rules.every(rule => {
                                            // Apply filtering rules
                                            if (rule.type === 'exclude' && meta.name.includes(rule.value)) {
                                                return false;
                                            }
                                            return true;
                                        });
                                    });
                                }
                                
                                // Create a new response with filtered data
                                const modifiedResponse = new Response(JSON.stringify(data), {
                                    status: response.status,
                                    statusText: response.statusText,
                                    headers: response.headers
                                });
                                
                                return modifiedResponse;
                            });
                        }
                        
                        return response;
                    });
                };
            }
        }
        
        // Initialize customizations
        function init() {
            console.log('Stremio Customizer: Initializing...');
            
            // Apply all customizations
            applyUICustomizations();
            applyCatalogCustomizations();
            applyContentFiltering();
            
            console.log('Stremio Customizer: Customizations applied successfully');
        }
        
        // Run when DOM is fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
        
        // Re-apply customizations when navigation occurs (for SPA)
        window.addEventListener('popstate', () => {
            setTimeout(init, 500);
        });
        
        // Expose API for console usage
        window.stremioCustomizer = {
            getCustomizations: () => customizations,
            applyCustomizations: init
        };
    })();
    `;
    
    res.setHeader('Content-Type', 'application/javascript');
    res.send(defaultScript);
});

// Add proxy endpoint for Stremio addons
app.get('/api/proxy/addons', async (req, res) => {
    try {
        const response = await fetch('https://api.strem.io/api/addonCollectionGet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'AddonCollectionGet',
                update: true
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching addons:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to get profiles for a user
app.get('/api/customizations/:authKey/profiles', async (req, res) => {
    const { authKey } = req.params;
    
    try {
        // Read from database
        await db.read();
        
        // Get profiles for this user
        const profiles = db.data.profiles?.[authKey] || {};
        
        res.json(profiles);
    } catch (error) {
        console.error('Error getting profiles:', error);
        res.status(500).json({ error: 'Failed to get profiles' });
    }
});

// Endpoint to get a specific profile
app.get('/api/customizations/:authKey/profiles/:name', async (req, res) => {
    const { authKey, name } = req.params;
    
    try {
        // Read from database
        await db.read();
        
        // Get the specific profile
        const profile = db.data.profiles?.[authKey]?.[name];
        
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        
        res.json(profile);
    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// Endpoint to save a profile
app.post('/api/customizations/:authKey/profiles/:name', async (req, res) => {
    const { authKey, name } = req.params;
    const profile = req.body;
    
    try {
        // Read from database
        await db.read();
        
        // Initialize profiles object if not exists
        if (!db.data.profiles) {
            db.data.profiles = {};
        }
        if (!db.data.profiles[authKey]) {
            db.data.profiles[authKey] = {};
        }
        
        // Add last updated timestamp
        profile.lastUpdated = new Date().toISOString();
        
        // Save the profile
        db.data.profiles[authKey][name] = profile;
        
        // Save to database
        await db.write();
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving profile:', error);
        res.status(500).json({ error: 'Failed to save profile' });
    }
});

// Endpoint to delete a profile
app.delete('/api/customizations/:authKey/profiles/:name', async (req, res) => {
    const { authKey, name } = req.params;
    
    try {
        // Read from database
        await db.read();
        
        // Delete the profile
        if (db.data.profiles?.[authKey]?.[name]) {
            delete db.data.profiles[authKey][name];
            
            // Save to database
            await db.write();
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).json({ error: 'Failed to delete profile' });
    }
});

// Initialize the database and start the server
const startServer = async () => {
    await initDb();
    
    const port = getSettings().port;
    
    // Create a new Express app for the addon
    const addonApp = express();
    addonApp.use(cors());
    
    // Serve the addon
    serveHTTP(addon, { port: port + 1 }, addonApp);
    
    // Serve the web interface
    app.listen(port, () => {
        console.log(`Web interface running at http://localhost:${port}/`);
        console.log(`Stremio Customizer addon running at http://localhost:${port + 1}/manifest.json`);
    });
};

startServer(); 