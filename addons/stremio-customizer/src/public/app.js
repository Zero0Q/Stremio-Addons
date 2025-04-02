// Global state
let state = {
    authKey: '',
    authenticated: false,
    addons: [],
    catalogs: [],
    currentSection: 'auth',
    customizations: {
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
    },
    profiles: {}
};

// Global variables
let currentAuthKey = null;
let currentCustomizations = null;

// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section-content');
const authKeyInput = document.getElementById('authKey');
const authSubmitBtn = document.getElementById('auth-submit');
const applySection = document.getElementById('apply-section');

// Theme buttons
const themeButtons = document.querySelectorAll('.theme-btn');
const customThemeOptions = document.getElementById('custom-theme-options');
const layoutButtons = document.querySelectorAll('.layout-btn');

// UI elements
const hideElements = {
    sidebar: document.getElementById('hide-sidebar'),
    topBar: document.getElementById('hide-topbar'),
    footer: document.getElementById('hide-footer')
};
const customCSSInput = document.getElementById('customCSS');
const uiSaveBtn = document.getElementById('ui-save');

// Catalog elements
const loadCatalogsBtn = document.getElementById('load-catalogs');
const catalogsContainer = document.getElementById('catalogs-container');
const catalogsList = document.getElementById('catalogs-list');
const catalogsSaveBtn = document.getElementById('catalogs-save');

// Filter elements
const filterRules = document.getElementById('filter-rules');
const addFilterRuleBtn = document.getElementById('add-filter-rule');
const newRuleForm = document.getElementById('new-rule-form');
const saveRuleBtn = document.getElementById('save-rule');
const cancelRuleBtn = document.getElementById('cancel-rule');
const filtersSaveBtn = document.getElementById('filters-save');

// Addon elements
const loadAddonsBtn = document.getElementById('load-addons');
const addonsContainer = document.getElementById('addons-container');
const addonsList = document.getElementById('addons-list');
const addonsSaveBtn = document.getElementById('addons-save');

// Profile elements
const profileNameInput = document.getElementById('profile-name');
const saveProfileBtn = document.getElementById('save-profile');
const profilesList = document.getElementById('profiles-list');

// Script elements
const generateScriptBtn = document.getElementById('generate-script');
const scriptOutput = document.getElementById('script-output');
const scriptContent = document.getElementById('script-content');
const copyScriptBtn = document.getElementById('copy-script');

// Save Auth Key button
const saveAuthKeyBtn = document.getElementById('saveAuthKey');
const applyUICustomizationsBtn = document.getElementById('applyUICustomizations');

// Add theme styles
const themeStyles = document.createElement('style');
themeStyles.textContent = `
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
`;

document.head.appendChild(themeStyles);

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = e.target.closest('.nav-link').dataset.section;
        showSection(section);
    });
});

function showSection(sectionId) {
    console.log('Showing section:', sectionId); // Debug log

    // Update navigation
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === sectionId) {
            link.classList.add('active');
        }
    });

    // Hide all sections first
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
        section.classList.add('d-none');
    });

    // Show only the selected section
    const selectedSection = document.getElementById(`${sectionId}-section`);
    if (selectedSection) {
        selectedSection.style.display = 'block';
        selectedSection.classList.remove('d-none');
        console.log('Selected section found:', selectedSection.id); // Debug log
    } else {
        console.error('Section not found:', sectionId); // Debug log
    }
    
    // Show apply section if authenticated
    if (state.authenticated) {
        const applySection = document.getElementById('apply-section');
        if (applySection) {
            applySection.style.display = 'block';
            applySection.classList.remove('d-none');
        }
    }

    // Update current section in state
    state.currentSection = sectionId;

    // Load section-specific content
    if (state.authenticated) {
        switch(sectionId) {
            case 'ui':
                loadUICustomizations();
                break;
            case 'catalogs':
                loadAddons();
                break;
            case 'filters':
                loadAddons();
                break;
            case 'addons':
                loadAddons();
                break;
            case 'profiles':
                loadProfiles();
                break;
            case 'script':
                generateCustomizationScript();
                break;
        }
    } else if (sectionId !== 'auth') {
        // If not authenticated and trying to access a protected section, redirect to auth
        showSection('auth');
        showAlert('Please authenticate first', 'error');
    }
}

// Save Auth Key button functionality
saveAuthKeyBtn.addEventListener('click', async () => {
    const authKey = authKeyInput.value.trim();
    if (!authKey) {
        showAlert('Please enter your Stremio auth key', 'error');
        return;
    }

    try {
        // Show loading state
        saveAuthKeyBtn.disabled = true;
        saveAuthKeyBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Saving...';

        const response = await fetch(`/api/customizations/${authKey}`);
        if (response.ok) {
            state.authKey = authKey;
            state.authenticated = true;
            currentAuthKey = authKey;
            currentCustomizations = await response.json();
            
            // Show success state
            saveAuthKeyBtn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Saved!';
            saveAuthKeyBtn.classList.add('btn-success');
            saveAuthKeyBtn.classList.remove('btn-primary');
            
            showAlert('Authentication successful!', 'success');
            
            // Update UI state and show UI section
            showSection('ui');

            // Reset button after 2 seconds
            setTimeout(() => {
                saveAuthKeyBtn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Save';
                saveAuthKeyBtn.classList.remove('btn-success');
                saveAuthKeyBtn.classList.add('btn-primary');
            }, 2000);
        } else {
            throw new Error('Failed to authenticate');
        }
    } catch (error) {
        console.error('Authentication error:', error);
        showAlert('Failed to authenticate. Please check your auth key.', 'error');
        // Reset button on error
        saveAuthKeyBtn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Save';
        saveAuthKeyBtn.classList.remove('btn-success');
        saveAuthKeyBtn.classList.add('btn-primary');
    } finally {
        // Re-enable button
        saveAuthKeyBtn.disabled = false;
    }
});

// UI Customizations
function loadUICustomizations() {
    if (!currentCustomizations) return;

    const ui = currentCustomizations.ui || {};
    
    // Set theme
    document.querySelector(`input[name="theme"][value="${ui.theme || 'dark'}"]`).checked = true;
    
    // Set color scheme
    document.querySelector(`input[name="colorScheme"][value="${ui.colorScheme || 'blue'}"]`).checked = true;
    
    // Set layout
    document.querySelector(`input[name="layout"][value="${ui.layout || 'expanded'}"]`).checked = true;
    
    // Set card style
    document.querySelector(`input[name="cardStyle"][value="${ui.cardStyle || 'default'}"]`).checked = true;
    
    // Set font size
    document.querySelector(`input[name="fontSize"][value="${ui.fontSize || 'medium'}"]`).checked = true;
    
    // Set animation style
    document.querySelector(`input[name="animation"][value="${ui.animation || 'smooth'}"]`).checked = true;
    
    // Set hidden elements
    const hiddenElements = ui.hiddenElements || [];
    document.getElementById('hide-sidebar').checked = hiddenElements.includes('.sidebar');
    document.getElementById('hide-topbar').checked = hiddenElements.includes('.top-bar');
    document.getElementById('hide-footer').checked = hiddenElements.includes('.footer');
    document.getElementById('hide-search').checked = hiddenElements.includes('.search-bar');
    document.getElementById('hide-notifications').checked = hiddenElements.includes('.notifications');
    document.getElementById('hide-player-controls').checked = hiddenElements.includes('.player-controls');
    
    // Set content display options
    const contentDisplay = ui.contentDisplay || {};
    document.getElementById('show-imdb').checked = contentDisplay.imdb !== false;
    document.getElementById('show-year').checked = contentDisplay.year !== false;
    document.getElementById('show-duration').checked = contentDisplay.duration !== false;
    document.getElementById('show-genres').checked = contentDisplay.genres !== false;

    // Set Continue Watching options
    const continueWatching = ui.continueWatching || {};
    document.getElementById('continue-watching-sort').value = continueWatching.sortOrder || 'smart';
    document.getElementById('enable-realtime-sync').checked = continueWatching.enableRealtimeSync !== false;
    document.getElementById('sync-across-devices').checked = continueWatching.syncAcrossDevices !== false;
    document.getElementById('auto-sync-library').checked = continueWatching.autoSyncLibrary !== false;
    document.getElementById('show-new-episodes').checked = continueWatching.showNewEpisodes !== false;
    document.getElementById('show-premiered-shows').checked = continueWatching.showPremieredShows !== false;
    document.getElementById('recent-episode-days').value = continueWatching.recentEpisodeDays || 7;
    document.getElementById('show-movies').checked = continueWatching.showMovies !== false;
    document.getElementById('show-series').checked = continueWatching.showSeries !== false;
    document.getElementById('show-documentaries').checked = continueWatching.showDocumentaries !== false;
    document.getElementById('progress-threshold').value = continueWatching.progressThreshold || 5;
    document.getElementById('max-continue-items').value = continueWatching.maxItems || 20;
    document.getElementById('time-filter').value = continueWatching.timeFilter || 'all';
    document.getElementById('show-progress-bar').checked = continueWatching.showProgressBar !== false;
    document.getElementById('show-time-remaining').checked = continueWatching.showTimeRemaining !== false;
    document.getElementById('auto-remove-completed').checked = continueWatching.autoRemoveCompleted !== false;
    
    // Set custom CSS
    document.getElementById('customCSS').value = ui.customCSS || '';
}

applyUICustomizationsBtn.addEventListener('click', async () => {
    if (!currentAuthKey) {
        showAlert('Please authenticate first', 'error');
        return;
    }

    const customizations = {
        ui: {
            theme: document.querySelector('input[name="theme"]:checked').value,
            colorScheme: document.querySelector('input[name="colorScheme"]:checked').value,
            layout: document.querySelector('input[name="layout"]:checked').value,
            cardStyle: document.querySelector('input[name="cardStyle"]:checked').value,
            fontSize: document.querySelector('input[name="fontSize"]:checked').value,
            animation: document.querySelector('input[name="animation"]:checked').value,
            hiddenElements: [
                document.getElementById('hide-sidebar').checked ? '.sidebar' : null,
                document.getElementById('hide-topbar').checked ? '.top-bar' : null,
                document.getElementById('hide-footer').checked ? '.footer' : null,
                document.getElementById('hide-search').checked ? '.search-bar' : null,
                document.getElementById('hide-notifications').checked ? '.notifications' : null,
                document.getElementById('hide-player-controls').checked ? '.player-controls' : null
            ].filter(Boolean),
            contentDisplay: {
                imdb: document.getElementById('show-imdb').checked,
                year: document.getElementById('show-year').checked,
                duration: document.getElementById('show-duration').checked,
                genres: document.getElementById('show-genres').checked
            },
            continueWatching: {
                sortOrder: document.getElementById('continue-watching-sort').value,
                enableRealtimeSync: document.getElementById('enable-realtime-sync').checked,
                syncAcrossDevices: document.getElementById('sync-across-devices').checked,
                autoSyncLibrary: document.getElementById('auto-sync-library').checked,
                showNewEpisodes: document.getElementById('show-new-episodes').checked,
                showPremieredShows: document.getElementById('show-premiered-shows').checked,
                recentEpisodeDays: parseInt(document.getElementById('recent-episode-days').value),
                showMovies: document.getElementById('show-movies').checked,
                showSeries: document.getElementById('show-series').checked,
                showDocumentaries: document.getElementById('show-documentaries').checked,
                progressThreshold: parseInt(document.getElementById('progress-threshold').value),
                maxItems: parseInt(document.getElementById('max-continue-items').value),
                timeFilter: document.getElementById('time-filter').value,
                showProgressBar: document.getElementById('show-progress-bar').checked,
                showTimeRemaining: document.getElementById('show-time-remaining').checked,
                autoRemoveCompleted: document.getElementById('auto-remove-completed').checked
            },
            customCSS: document.getElementById('customCSS').value
        }
    };

    try {
        const response = await fetch(`/api/customizations/${currentAuthKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customizations)
        });

        if (response.ok) {
            currentCustomizations = customizations;
            showAlert('UI customizations applied successfully!', 'success');
            
            // If real-time sync is enabled, start the sync process
            if (customizations.ui.continueWatching.enableRealtimeSync) {
                startRealtimeSync();
            }
        } else {
            showAlert('Failed to apply UI customizations.', 'error');
        }
    } catch (error) {
        console.error('Error applying UI customizations:', error);
        showAlert('An error occurred while applying customizations.', 'error');
    }
});

// Real-time sync functionality
let syncInterval = null;

function startRealtimeSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
    }

    // Sync every 30 seconds if enabled
    syncInterval = setInterval(async () => {
        if (!currentAuthKey) return;

        try {
            const response = await fetch(`/api/customizations/${currentAuthKey}/sync`);
            if (response.ok) {
                const data = await response.json();
                if (data.updated) {
                    // Update the UI if there are changes
                    updateContinueWatchingUI(data.continueWatching);
                }
            }
        } catch (error) {
            console.error('Sync error:', error);
        }
    }, 30000);
}

function updateContinueWatchingUI(continueWatching) {
    // Update the UI with the latest continue watching data
    if (!continueWatching) return;

    // Sort items based on the current sort order
    const sortedItems = sortContinueWatchingItems(continueWatching.items);
    
    // Update the UI with the sorted items
    // This would be implemented based on your UI structure
    // For example, updating a list or grid of items
}

function sortContinueWatchingItems(items) {
    const sortOrder = document.getElementById('continue-watching-sort').value;
    const showPremieredShows = document.getElementById('show-premiered-shows').checked;
    const recentEpisodeDays = parseInt(document.getElementById('recent-episode-days').value);

    // Create a copy of items to sort
    let sortedItems = [...items];

    // Apply smart sort if selected
    if (sortOrder === 'smart') {
        sortedItems.sort((a, b) => {
            // First, check if either item is a recently premiered show
            const aIsRecent = isRecentlyPremiered(a, recentEpisodeDays);
            const bIsRecent = isRecentlyPremiered(b, recentEpisodeDays);
            
            if (aIsRecent && !bIsRecent) return -1;
            if (!aIsRecent && bIsRecent) return 1;
            
            // Then sort by last watched
            const lastWatchedDiff = new Date(b.lastWatched) - new Date(a.lastWatched);
            if (lastWatchedDiff !== 0) return lastWatchedDiff;
            
            // Finally, sort by progress
            return b.progress - a.progress;
        });
    } else {
        // Apply other sort orders
        switch (sortOrder) {
            case 'recently-aired':
                sortedItems.sort((a, b) => new Date(b.airDate) - new Date(a.airDate));
                break;
            case 'last-watched':
                sortedItems.sort((a, b) => new Date(b.lastWatched) - new Date(a.lastWatched));
                break;
            case 'progress':
                sortedItems.sort((a, b) => b.progress - a.progress);
                break;
            case 'progress-lowest':
                sortedItems.sort((a, b) => a.progress - b.progress);
                break;
            case 'alphabetical':
                sortedItems.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'date-added':
                sortedItems.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
                break;
        }
    }

    return sortedItems;
}

function isRecentlyPremiered(item, days) {
    if (!item.airDate) return false;
    const airDate = new Date(item.airDate);
    const now = new Date();
    const diffDays = (now - airDate) / (1000 * 60 * 60 * 24);
    return diffDays <= days;
}

// Load user customizations
async function loadUserCustomizations() {
    try {
        const response = await fetch(`/api/customizations/${state.authKey}`);
        const customizations = await response.json();
        
        // Merge with default customizations
        state.customizations = {
            ...state.customizations,
            ...customizations
        };
        
        // Update UI with loaded customizations
        updateUIWithCustomizations();
        
    } catch (error) {
        console.error('Error loading customizations:', error);
    }
}

// Update UI with current customizations
function updateUIWithCustomizations() {
    const { ui, catalogs, filters, addons } = state.customizations;
    
    // Update UI section
    if (ui) {
        // Theme
        themeButtons.forEach(btn => {
            if (btn.getAttribute('data-theme') === ui.theme) {
                btn.classList.add('btn-primary');
                btn.classList.remove('btn-outline-primary');
            } else {
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-outline-primary');
            }
        });
        
        if (ui.theme === 'custom') {
            customThemeOptions.classList.remove('d-none');
        }
        
        // Layout
        layoutButtons.forEach(btn => {
            if (btn.getAttribute('data-layout') === ui.layout) {
                btn.classList.add('btn-primary');
                btn.classList.remove('btn-outline-primary');
            } else {
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-outline-primary');
            }
        });
        
        // Hidden elements
        if (ui.hiddenElements) {
            hideElements.sidebar.checked = ui.hiddenElements.includes('.sidebar');
            hideElements.topBar.checked = ui.hiddenElements.includes('.top-bar');
            hideElements.footer.checked = ui.hiddenElements.includes('.footer');
        }
        
        // Custom CSS
        if (ui.customCSS) {
            customCSSInput.value = ui.customCSS;
        }
    }
}

// UI Customization
themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        
        // Update state
        state.customizations.ui.theme = theme;
        
        // Update UI
        themeButtons.forEach(b => {
            b.classList.remove('btn-primary');
            b.classList.add('btn-outline-primary');
        });
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-outline-primary');
        
        // Show/hide custom theme options
        if (theme === 'custom') {
            customThemeOptions.classList.remove('d-none');
        } else {
            customThemeOptions.classList.add('d-none');
        }
    });
});

layoutButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const layout = btn.getAttribute('data-layout');
        
        // Update state
        state.customizations.ui.layout = layout;
        
        // Update UI
        layoutButtons.forEach(b => {
            b.classList.remove('btn-primary');
            b.classList.add('btn-outline-primary');
        });
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-outline-primary');
    });
});

// Save UI customizations
uiSaveBtn.addEventListener('click', async () => {
    // Update hidden elements in state
    const hiddenElements = [];
    if (hideElements.sidebar.checked) hiddenElements.push('.sidebar');
    if (hideElements.topBar.checked) hiddenElements.push('.top-bar');
    if (hideElements.footer.checked) hiddenElements.push('.footer');
    
    state.customizations.ui.hiddenElements = hiddenElements;
    
    // Update custom CSS in state
    state.customizations.ui.customCSS = customCSSInput.value;
    
    // Save UI customizations
    try {
        const response = await fetch(`/api/customizations/${state.authKey}/apply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customizationType: 'ui',
                customizationData: state.customizations.ui
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('UI customizations saved successfully!');
        } else {
            throw new Error('Failed to save UI customizations');
        }
        
    } catch (error) {
        console.error('Error saving UI customizations:', error);
        alert('Error saving UI customizations: ' + error.message);
    }
});

// Function to load addons
async function loadAddons() {
    try {
        // Show loading state
        const loadAddonsBtn = document.getElementById('loadAddons');
        if (loadAddonsBtn) {
            loadAddonsBtn.disabled = true;
            loadAddonsBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
        }

        // Fetch addons through proxy
        const response = await fetch('/api/proxy/addons');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update state
        state.addons = data.result?.addons || [];
        state.catalogs = data.result?.catalogs || [];
        
        // Render based on current section
        switch (state.currentSection) {
            case 'catalogs':
                renderCatalogs();
                break;
            case 'addons':
                renderAddons();
                break;
            case 'filters':
                renderFilters();
                break;
        }
        
        // Reset button state after a short delay
        setTimeout(() => {
            if (loadAddonsBtn) {
                loadAddonsBtn.disabled = false;
                loadAddonsBtn.innerHTML = 'Load Addons';
            }
        }, 1000);
        
    } catch (error) {
        console.error('Failed to load addons:', error);
        showAlert('Failed to load addons: ' + error.message, 'error');
        
        // Reset button state
        const loadAddonsBtn = document.getElementById('loadAddons');
        if (loadAddonsBtn) {
            loadAddonsBtn.disabled = false;
            loadAddonsBtn.innerHTML = 'Load Addons';
        }
    }
}

// Function to render addons
function renderAddons() {
    const addonsList = document.getElementById('addonsList');
    if (!addonsList) return;

    addonsList.innerHTML = '';
    
    state.addons.forEach(addon => {
        const addonElement = document.createElement('div');
        addonElement.className = 'addon-item card mb-3';
        addonElement.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">${addon.manifest.name}</h5>
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" 
                               ${state.customizations.addons?.disabled?.includes(addon.manifest.id) ? '' : 'checked'}>
                    </div>
                </div>
                <p class="card-text text-muted">${addon.manifest.description || 'No description'}</p>
                <div class="addon-meta">
                    <span class="badge bg-primary">${addon.manifest.version}</span>
                    <span class="badge bg-secondary">${addon.manifest.id}</span>
                </div>
            </div>
        `;

        // Add event listener to toggle
        const toggle = addonElement.querySelector('.form-check-input');
        if (toggle) {
            toggle.addEventListener('change', () => {
                if (!state.customizations.addons) {
                    state.customizations.addons = { disabled: [] };
                }
                
                if (toggle.checked) {
                    state.customizations.addons.disabled = state.customizations.addons.disabled.filter(id => id !== addon.manifest.id);
                } else {
                    state.customizations.addons.disabled.push(addon.manifest.id);
                }
                
                saveCustomizations();
            });
        }

        addonsList.appendChild(addonElement);
    });
}

// Function to render catalogs
function renderCatalogs() {
    const catalogsList = document.getElementById('catalogsList');
    if (!catalogsList) return;

    catalogsList.innerHTML = '';
    
    state.catalogs.forEach(catalog => {
        const catalogElement = document.createElement('div');
        catalogElement.className = 'catalog-item card mb-3';
        catalogElement.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">${catalog.name}</h5>
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" 
                               ${state.customizations.catalogs?.hidden?.includes(catalog.id) ? '' : 'checked'}>
                    </div>
                </div>
                <p class="card-text text-muted">${catalog.type} - ${catalog.id}</p>
            </div>
        `;

        // Add event listener to toggle
        const toggle = catalogElement.querySelector('.form-check-input');
        if (toggle) {
            toggle.addEventListener('change', () => {
                if (!state.customizations.catalogs) {
                    state.customizations.catalogs = { hidden: [] };
                }
                
                if (toggle.checked) {
                    state.customizations.catalogs.hidden = state.customizations.catalogs.hidden.filter(id => id !== catalog.id);
                } else {
                    state.customizations.catalogs.hidden.push(catalog.id);
                }
                
                saveCustomizations();
            });
        }

        catalogsList.appendChild(catalogElement);
    });
}

// Function to render filters
function renderFilters() {
    const filtersList = document.getElementById('filtersList');
    if (!filtersList) return;

    filtersList.innerHTML = '';
    
    // Add new filter form
    const filterForm = document.createElement('div');
    filterForm.className = 'card mb-3';
    filterForm.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">Add Filter</h5>
            <div class="input-group">
                <input type="text" class="form-control" id="filterValue" placeholder="Enter filter value">
                <button class="btn btn-primary" id="addFilter">Add</button>
            </div>
        </div>
    `;
    filtersList.appendChild(filterForm);

    // Add event listener to add filter button
    const addFilterBtn = document.getElementById('addFilter');
    if (addFilterBtn) {
        addFilterBtn.addEventListener('click', () => {
            const filterValue = document.getElementById('filterValue').value.trim();
            if (filterValue) {
                if (!state.customizations.filters) {
                    state.customizations.filters = { rules: [] };
                }
                
                state.customizations.filters.rules.push({
                    type: 'exclude',
                    value: filterValue
                });
                
                saveCustomizations();
                renderFilters();
                document.getElementById('filterValue').value = '';
            }
        });
    }
    
    // Render existing filters
    state.customizations.filters?.rules?.forEach((rule, index) => {
        const filterElement = document.createElement('div');
        filterElement.className = 'filter-item card mb-3';
        filterElement.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">${rule.value}</h5>
                    <button class="btn btn-danger btn-sm" data-index="${index}">Remove</button>
                </div>
            </div>
        `;

        // Add event listener to remove button
        const removeBtn = filterElement.querySelector('.btn-danger');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                state.customizations.filters.rules.splice(index, 1);
                saveCustomizations();
                renderFilters();
            });
        }

        filtersList.appendChild(filterElement);
    });
}

// Save catalog settings
catalogsSaveBtn.addEventListener('click', async () => {
    try {
        const response = await fetch(`/api/customizations/${state.authKey}/apply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customizationType: 'catalogs',
                customizationData: state.customizations.catalogs
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Catalog settings saved successfully!');
        } else {
            throw new Error('Failed to save catalog settings');
        }
        
    } catch (error) {
        console.error('Error saving catalog settings:', error);
        alert('Error saving catalog settings: ' + error.message);
    }
});

// Add filter rule
addFilterRuleBtn.addEventListener('click', () => {
    newRuleForm.classList.remove('d-none');
});

// Cancel adding rule
cancelRuleBtn.addEventListener('click', () => {
    newRuleForm.classList.add('d-none');
});

// Save rule
saveRuleBtn.addEventListener('click', () => {
    const type = document.getElementById('rule-type').value;
    const field = document.getElementById('rule-field').value;
    const value = document.getElementById('rule-value').value.trim();
    
    if (!value) {
        alert('Please enter a value for the rule');
        return;
    }
    
    // Add rule to state
    const rule = { type, field, value };
    state.customizations.filters.rules.push(rule);
    
    // Render rules
    renderFilters();
    
    // Hide form
    newRuleForm.classList.add('d-none');
    
    // Clear form
    document.getElementById('rule-value').value = '';
});

// Save filter settings
filtersSaveBtn.addEventListener('click', async () => {
    try {
        const response = await fetch(`/api/customizations/${state.authKey}/apply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customizationType: 'filters',
                customizationData: state.customizations.filters
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Filter settings saved successfully!');
        } else {
            throw new Error('Failed to save filter settings');
        }
        
    } catch (error) {
        console.error('Error saving filter settings:', error);
        alert('Error saving filter settings: ' + error.message);
    }
});

// Save addon settings
addonsSaveBtn.addEventListener('click', async () => {
    try {
        const response = await fetch(`/api/customizations/${state.authKey}/apply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customizationType: 'addons',
                customizationData: state.customizations.addons
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Addon settings saved successfully!');
        } else {
            throw new Error('Failed to save addon settings');
        }
        
    } catch (error) {
        console.error('Error saving addon settings:', error);
        alert('Error saving addon settings: ' + error.message);
    }
});

// Save profile
saveProfileBtn.addEventListener('click', () => {
    const profileName = profileNameInput.value.trim();
    
    if (!profileName) {
        alert('Please enter a profile name');
        return;
    }
    
    // Save current customizations as profile
    state.profiles[profileName] = JSON.parse(JSON.stringify(state.customizations));
    
    // Save profiles to server
    saveProfiles();
    
    // Render profiles
    renderProfiles();
    
    // Clear input
    profileNameInput.value = '';
    
    alert(`Profile "${profileName}" saved successfully!`);
});

// Save profiles to server
async function saveProfiles() {
    try {
        const response = await fetch(`/api/customizations/${state.authKey}/apply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customizationType: 'profiles',
                customizationData: state.profiles
            })
        });
        
        await response.json();
        
    } catch (error) {
        console.error('Error saving profiles:', error);
    }
}

// Render profiles
function renderProfiles() {
    profilesList.innerHTML = '';
    
    Object.entries(state.profiles).forEach(([name, profile]) => {
        const profileItem = document.createElement('div');
        profileItem.className = 'list-group-item profile-item';
        profileItem.innerHTML = `
            <div class="profile-info">
                <h6>${name}</h6>
                <small>Last updated: ${new Date(profile.lastUpdated).toLocaleString()}</small>
            </div>
            <div class="profile-actions">
                <button class="btn btn-sm btn-outline-primary load-profile" data-profile="${name}">
                    <i class="bi bi-arrow-clockwise me-1"></i>Load
                </button>
                <button class="btn btn-sm btn-outline-danger delete-profile" data-profile="${name}">
                    <i class="bi bi-trash me-1"></i>Delete
                </button>
            </div>
        `;
        
        // Add event listeners
        const loadBtn = profileItem.querySelector('.load-profile');
        loadBtn.addEventListener('click', () => loadProfile(name));
        
        const deleteBtn = profileItem.querySelector('.delete-profile');
        deleteBtn.addEventListener('click', () => deleteProfile(name));
        
        profilesList.appendChild(profileItem);
    });
}

// Load a specific profile
async function loadProfile(name) {
    try {
        const response = await fetch(`/api/customizations/${state.authKey}/profiles/${name}`);
        if (!response.ok) {
            throw new Error('Failed to load profile');
        }
        
        const profile = await response.json();
        state.customizations = profile;
        
        // Update UI with profile settings
        updateUIWithCustomizations();
        
        showAlert('Profile loaded successfully!', 'success');
    } catch (error) {
        console.error('Error loading profile:', error);
        showAlert('Failed to load profile: ' + error.message, 'error');
    }
}

// Delete a profile
async function deleteProfile(name) {
    if (!confirm(`Are you sure you want to delete profile "${name}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/customizations/${state.authKey}/profiles/${name}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete profile');
        }
        
        // Remove from state
        delete state.profiles[name];
        
        // Re-render profiles
        renderProfiles();
        
        showAlert('Profile deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting profile:', error);
        showAlert('Failed to delete profile: ' + error.message, 'error');
    }
}

// Generate customization script
async function generateCustomizationScript() {
    try {
        const response = await fetch(`/api/customizations/${state.authKey}/script`);
        if (!response.ok) {
            throw new Error('Failed to generate script');
        }
        
        const script = await response.text();
        
        // Show script output
        scriptOutput.classList.remove('d-none');
        scriptContent.value = script;
        
        // Add copy button functionality
        copyScriptBtn.addEventListener('click', () => {
            scriptContent.select();
            document.execCommand('copy');
            showAlert('Script copied to clipboard!', 'success');
        });
    } catch (error) {
        console.error('Error generating script:', error);
        showAlert('Failed to generate script: ' + error.message, 'error');
    }
}

// Copy script
copyScriptBtn.addEventListener('click', () => {
    scriptContent.select();
    document.execCommand('copy');
    alert('Script copied to clipboard!');
});

// Copy code snippet
document.querySelector('.copy-btn').addEventListener('click', function() {
    const code = this.previousElementSibling.textContent;
    
    const textarea = document.createElement('textarea');
    textarea.value = code;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    
    alert('Code copied to clipboard!');
});

// Copy to clipboard functionality
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const text = element.textContent;
    
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    
    // Select and copy the text
    textarea.select();
    try {
        document.execCommand('copy');
        // Show success feedback
        const button = event.currentTarget;
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="bi bi-check-lg me-1"></i>Copied!';
        button.classList.add('btn-success');
        button.classList.remove('btn-outline-primary');
        
        // Reset button after 2 seconds
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('btn-success');
            button.classList.add('btn-outline-primary');
        }, 2000);
    } catch (err) {
        console.error('Failed to copy text: ', err);
        showAlert('Failed to copy text to clipboard', 'error');
    } finally {
        // Clean up
        document.body.removeChild(textarea);
    }
}

// Show alert message
function showAlert(message, type = 'info') {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Add to page
    const container = document.querySelector('.section-content');
    container.insertBefore(alert, container.firstChild);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 150);
    }, 5000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Show auth section by default
    const authSection = document.getElementById('auth-section');
    if (authSection) {
        authSection.style.display = 'block';
        authSection.classList.remove('d-none');
    }
    showSection('auth');
}); 